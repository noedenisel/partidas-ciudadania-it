import http from "node:http";
import { DatabaseSync } from "node:sqlite";
import { randomBytes, createHash, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import path from "node:path";

const env = process.env;
const origin = new URL(env.APP_ORIGIN || "http://localhost:5173").origin;
const db = new DatabaseSync(env.DATABASE_PATH || "families.sqlite");
db.exec(`PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS accounts(id INTEGER PRIMARY KEY, email TEXT NOT NULL, identity TEXT UNIQUE NOT NULL, password TEXT, customer TEXT UNIQUE);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, account INTEGER, expires INTEGER);
CREATE TABLE IF NOT EXISTS families(id INTEGER PRIMARY KEY, owner INTEGER NOT NULL, surname TEXT NOT NULL, people TEXT DEFAULT '[]', revision INTEGER DEFAULT 0);
CREATE INDEX IF NOT EXISTS families_owner ON families(owner,id);`);
const sql = (q) => db.prepare(q);
const digest = (value) => createHash("sha256").update(value).digest("hex");
const token = () => randomBytes(32).toString("hex");
const derive = promisify(scrypt);
const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
const cookie = (name, value, seconds) =>
  name +
  "=" +
  value +
  "; Path=/; HttpOnly; SameSite=Lax; Max-Age=" +
  seconds +
  (origin.startsWith("https:") ? "; Secure" : "");
const prices = Object.fromEntries(
  ["5", "10", "unlimited"]
    .filter((k) => env["STRIPE_PRICE_" + k.toUpperCase()])
    .map((k) => [k, env["STRIPE_PRICE_" + k.toUpperCase()]]),
);
async function stripe(endpoint, fields, key) {
  const headers = { Authorization: "Bearer " + env.STRIPE_SECRET_KEY };
  if (key) headers["Idempotency-Key"] = key;
  const response = await fetch("https://api.stripe.com/v1/" + endpoint, {
    method: fields ? "POST" : "GET",
    headers,
    body: fields ? new URLSearchParams(fields) : undefined,
  });
  if (!response.ok)
    fail(503, "No pudimos consultar la suscripción. Volvé a intentar.");
  return response.json();
}
async function plan(account) {
  if (!account.customer) return "1";
  const { data } = await stripe(
    "subscriptions?customer=" +
      encodeURIComponent(account.customer) +
      "&status=all&limit=100",
  );
  const active = data
    .filter((s) => ["active", "trialing"].includes(s.status))
    .flatMap((s) => s.items.data.map((i) => i.price.id));
  return (
    ["unlimited", "10", "5"].find(
      (k) => prices[k] && active.includes(prices[k]),
    ) || "1"
  );
}
const limit = (p) => (p === "unlimited" ? -1 : Number(p));
const visible = (id, p) =>
  sql(
    "SELECT id,surname,revision FROM families WHERE owner=? ORDER BY id LIMIT ?",
  ).all(id, limit(p));
const attempts = new Map();
function throttle(ip) {
  const now = Date.now();
  for (const [key, item] of attempts) if (item.end < now) attempts.delete(key);
  const item = attempts.get(ip) || { end: now + 600000, count: 0 };
  attempts.set(ip, item);
  if (++item.count > 40)
    fail(429, "Esperá unos minutos antes de volver a intentar.");
}
async function body(req) {
  let size = 0,
    parts = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1000000) fail(413, "La carpeta supera el tamaño admitido.");
    parts.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(parts).toString() || "{}");
  } catch {
    fail(400, "Datos inválidos.");
  }
}
function session(res, id) {
  const secret = token(),
    age = 604800;
  sql("DELETE FROM sessions WHERE expires<?").run(Date.now());
  sql("INSERT INTO sessions VALUES(?,?,?)").run(
    digest(secret),
    id,
    Date.now() + age * 1000,
  );
  res.setHeader("Set-Cookie", cookie("sid", secret, age));
}
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, origin),
    route = url.pathname,
    method = req.method;
  const cookies = Object.fromEntries(
    (req.headers.cookie || "").split(";").map((s) => s.trim().split("=")),
  );
  const json = (value) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(value));
  };
  const redirect = (where) => {
    res.writeHead(302, { Location: where });
    res.end();
  };
  try {
    if (!route.startsWith("/api/")) {
      if (method !== "GET") fail(405, "Método inválido.");
      const file = route.startsWith("/assets/")
        ? path.resolve("dist", "." + route)
        : path.resolve("dist/index.html");
      if (
        file !== path.resolve("dist/index.html") &&
        !file.startsWith(path.resolve("dist/assets") + path.sep)
      )
        fail(404, "No encontrado.");
      const bytes = await readFile(file).catch(() =>
        fail(404, "Compilá la aplicación con npm run build."),
      );
      res.setHeader(
        "Content-Type",
        {
          ".js": "application/javascript",
          ".css": "text/css",
          ".svg": "image/svg+xml",
          ".html": "text/html; charset=utf-8",
        }[path.extname(file)] || "application/octet-stream",
      );
      return res.end(bytes);
    }
    res.setHeader("Cache-Control", "no-store");
    if (method !== "GET" && req.headers.origin !== origin)
      fail(403, "Origen inválido.");
    const account = sql(
      "SELECT a.* FROM accounts a JOIN sessions s ON s.account=a.id WHERE s.token=? AND s.expires>?",
    ).get(digest(cookies.sid || ""), Date.now());
    const data = method === "POST" ? await body(req) : {};
    if (route === "/api/session" && method === "GET")
      return json({
        email: account?.email,
        google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
      });
    if (["/api/register", "/api/login"].includes(route) && method === "POST") {
      throttle(req.socket.remoteAddress);
      const email = String(data.email || "")
          .trim()
          .toLowerCase(),
        password = data.password;
      if (
        !/^\S+@\S+\.\S+$/.test(email) ||
        email.length > 254 ||
        typeof password !== "string" ||
        password.length > 256
      )
        fail(400, "Revisá el correo y la contraseña.");
      const identity = "mail:" + email,
        old = sql("SELECT * FROM accounts WHERE identity=?").get(identity);
      if (route.endsWith("register")) {
        if (password.length < 10) fail(400, "Usá al menos 10 caracteres.");
        const salt = token(),
          hash = (await derive(password, salt, 64)).toString("hex");
        const insert = sql(
          "INSERT OR IGNORE INTO accounts(email,identity,password) VALUES(?,?,?)",
        ).run(email, identity, salt + ":" + hash);
        if (!insert.changes) fail(409, "Ya existe una cuenta con ese correo.");
        session(res, insert.lastInsertRowid);
      } else {
        const [salt, hash] = (
          old?.password || "missing:" + "00".repeat(64)
        ).split(":");
        if (
          !timingSafeEqual(
            await derive(password, salt, 64),
            Buffer.from(hash, "hex"),
          ) ||
          !old
        )
          fail(401, "Correo o contraseña incorrectos.");
        session(res, old.id);
      }
      return json({ email });
    }
    if (route === "/api/google" && method === "GET") {
      if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET)
        fail(503, "Falta configurar Google.");
      const state = token();
      res.setHeader("Set-Cookie", cookie("oauth", state, 600));
      return redirect(
        "https://accounts.google.com/o/oauth2/v2/auth?" +
          new URLSearchParams({
            client_id: env.GOOGLE_CLIENT_ID,
            redirect_uri: origin + "/api/google/callback",
            response_type: "code",
            scope: "openid email",
            state,
          }),
      );
    }
    if (route === "/api/google/callback" && method === "GET") {
      if (!cookies.oauth || cookies.oauth !== url.searchParams.get("state"))
        fail(403, "Reiniciá el acceso con Google.");
      const exchange = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: url.searchParams.get("code") || "",
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uri: origin + "/api/google/callback",
        }),
      });
      if (!exchange.ok) return redirect("/?acceso=cancelado");
      const { access_token } = await exchange.json();
      const profile = await fetch(
        "https://openidconnect.googleapis.com/v1/userinfo",
        { headers: { Authorization: "Bearer " + access_token } },
      );
      const user = await profile.json();
      if (!profile.ok || !user.sub || !user.email_verified)
        fail(403, "Google no verificó el correo.");
      const identity = "google:" + user.sub;
      sql("INSERT OR IGNORE INTO accounts(email,identity) VALUES(?,?)").run(
        user.email,
        identity,
      );
      session(
        res,
        sql("SELECT id FROM accounts WHERE identity=?").get(identity).id,
      );
      res.setHeader("Set-Cookie", [
        res.getHeader("Set-Cookie"),
        cookie("oauth", "", 0),
      ]);
      return redirect("/");
    }
    if (!account) fail(401, "Iniciá sesión para acceder.");
    if (route === "/api/logout" && method === "POST") {
      sql("DELETE FROM sessions WHERE token=?").run(digest(cookies.sid));
      res.setHeader("Set-Cookie", cookie("sid", "", 0));
      return json({});
    }
    const tier = await plan(account);
    if (route === "/api/billing" && method === "POST") {
      if (!env.STRIPE_SECRET_KEY || !prices[data.tier])
        fail(400, "Plan no disponible.");
      let customer = account.customer;
      if (!customer) {
        customer = (
          await stripe(
            "customers",
            { email: account.email },
            "account-" + account.id,
          )
        ).id;
        sql("UPDATE accounts SET customer=? WHERE id=?").run(
          customer,
          account.id,
        );
      }
      const checkout =
        tier === "1"
          ? await stripe(
              "checkout/sessions",
              {
                customer,
                mode: "subscription",
                "line_items[0][price]": prices[data.tier],
                "line_items[0][quantity]": "1",
                success_url: origin,
                cancel_url: origin,
              },
              "checkout-" +
                account.id +
                "-" +
                data.tier +
                "-" +
                Math.floor(Date.now() / 1800000),
            )
          : await stripe("billing_portal/sessions", {
              customer,
              return_url: origin,
            });
      return json({ url: checkout.url });
    }
    const list = visible(account.id, tier);
    if (route === "/api/families" && method === "GET")
      return json({
        families: list,
        tier,
        offers: env.STRIPE_SECRET_KEY ? Object.keys(prices) : [],
      });
    if (route === "/api/families" && method === "POST") {
      const surname = String(data.surname || "").trim();
      if (!surname || surname.length > 100)
        fail(400, "Ingresá el apellido de la familia.");
      const insert = sql(
        "INSERT INTO families(owner,surname) SELECT ?,? WHERE ?<0 OR (SELECT count(*) FROM families WHERE owner=?)<?",
      ).run(account.id, surname, limit(tier), account.id, limit(tier));
      if (!insert.changes)
        fail(403, "Alcanzaste el límite de familias de tu plan.");
      return json({ id: Number(insert.lastInsertRowid) });
    }
    const id = Number(route.match(/^\/api\/families\/(\d+)$/)?.[1]);
    if (!list.some((f) => f.id === id)) fail(404, "Carpeta no disponible.");
    if (method === "GET") {
      const f = sql(
        "SELECT surname,people,revision FROM families WHERE id=? AND owner=?",
      ).get(id, account.id);
      return json({ ...f, id, people: JSON.parse(f.people) });
    }
    if (method === "POST") {
      if (
        !Array.isArray(data.people) ||
        !data.people.every(
          (p) =>
            p &&
            typeof p.name === "string" &&
            p.name.trim() &&
            p.records &&
            typeof p.records === "object" &&
            Object.values(p.records).every(
              (r) =>
                r &&
                typeof r === "object" &&
                Object.values(r).every((v) => typeof v === "string"),
            ),
        )
      )
        fail(400, "Revisá los datos de la persona.");
      if (
        !sql(
          "UPDATE families SET people=?,revision=revision+1 WHERE id=? AND owner=? AND revision=?",
        ).run(JSON.stringify(data.people), id, account.id, data.revision)
          .changes
      )
        fail(
          409,
          "La carpeta cambió en otra sesión. Copiá tus cambios y volvé a abrirla.",
        );
      return json({ revision: data.revision + 1 });
    }
    fail(405, "Método inválido.");
  } catch (error) {
    res.statusCode = error.status || 500;
    json({
      error: error.status
        ? error.message
        : "No se pudo completar la operación.",
    });
  }
});
server.listen(Number(env.PORT || 3001));
