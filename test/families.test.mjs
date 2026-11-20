import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { importLegacy, discrepancies } from "../src/records.js";

test("Importa las partidas anteriores y revisa edad, nombres y filiación", () => {
  const people = importLegacy(
    JSON.stringify([
      {
        Uno: {
          partidaNacimiento: { persona: "Ana Ruiz", bday: "1900-08-12" },
          partidaMatrimonio: {
            age: "24",
            date: "1924-07-24",
            persona: "Ana Ruis",
          },
        },
      },
      {
        Dos: {
          partidaNacimiento: { persona: "Juan Paz", madre: "Ana Ruiz" },
          partidaDefuncion: { hijoDe: { madre: "Ana Ruis" } },
        },
      },
    ]),
  );
  assert.equal(people[1].parentId, people[0].id);
  assert.equal(discrepancies(people).length, 4);
});
test("Guarda, reabre, aplica el cupo y aísla cuentas", async (t) => {
  const dir = await mkdtemp(tmpdir() + "/familias-");
  const origin = "http://localhost:19384";
  const child = spawn(process.execPath, ["server/app.mjs"], {
    env: {
      ...process.env,
      PORT: "19384",
      APP_ORIGIN: origin,
      DATABASE_PATH: dir + "/data.sqlite",
    },
    stdio: "ignore",
  });
  t.after(async () => {
    const done = once(child, "exit");
    child.kill();
    await done;
    await rm(dir, { recursive: true, force: true });
  });
  for (let i = 0; i < 100; i++) {
    try {
      await fetch(origin + "/api/session");
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 20));
    }
  }
  let cookie = "";
  const api = (p, data) =>
    fetch(origin + "/api/" + p, {
      method: data ? "POST" : "GET",
      headers: { origin, cookie, "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : undefined,
    });
  const credentials = {
    email: "ana@example.org",
    password: "contraseña de prueba",
  };
  const reg = await api("register", credentials);
  assert.equal(reg.status, 200);
  cookie = reg.headers.get("set-cookie").split(";")[0];
  const { id } = await (await api("families", { surname: "Ruiz" })).json();
  assert.equal((await api("families", { surname: "Otra" })).status, 403);
  const people = [
    { id: "p1", name: "Ana", records: { Nacimiento: { given: "Ana Ruiz" } } },
  ];
  assert.equal(
    (await api("families/" + id, { people, revision: 0 })).status,
    200,
  );
  assert.equal(
    (await api("families/" + id, { people: [], revision: 0 })).status,
    409,
  );
  await api("logout", {});
  assert.equal((await api("families/" + id)).status, 401);
  cookie = (await api("login", credentials)).headers
    .get("set-cookie")
    .split(";")[0];
  assert.deepEqual((await (await api("families/" + id)).json()).people, people);
  cookie = (
    await api("register", { ...credentials, email: "otra@example.org" })
  ).headers
    .get("set-cookie")
    .split(";")[0];
  assert.equal((await api("families/" + id)).status, 404);
});
