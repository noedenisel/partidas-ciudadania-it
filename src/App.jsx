import { useEffect, useState } from "react";
import { fields, types, discrepancies, importLegacy } from "./records";
import "./App.css";

async function api(path, data) {
  const response = await fetch(
    "/api/" + path,
    data === undefined
      ? {}
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
  );
  const result = await response.json();
  if (!response.ok) throw Object.assign(Error(result.error), {status: response.status});
  return result;
}
const tierLabel = (t) =>
  t === "unlimited"
    ? "Familias ilimitadas"
    : t === "1"
      ? "1 familia"
      : t + " familias";

export default function App() {
  const [session, S] = useState(null),
    [dashboard, D] = useState(null),
    [folder, F] = useState(null);
  const [busy, B] = useState(false),
    [message, M] = useState(""),
    [register, R] = useState(false);
  const [dirty, Q] = useState(false),
    [personId, P] = useState(""),
    [record, T] = useState("Nacimiento"),
    [tab, A] = useState("Partidas");
  async function refresh() {
    D(await api("families"));
  }
  async function init() {
    const s = await api("session");
    S(s);
    if (s.email) await refresh();
    return s;
  }
  useEffect(() => {
    init().catch((e) => M(e.message));
  }, []); // initial session
  useEffect(() => {
    const warn = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  async function run(fn) {
    B(true);
    M("");
    try {
      await fn();
    } catch (e) {
      M(e.message);
    } finally {
      B(false);
    }
  }
  function submit(fn) {
    return (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.currentTarget));
      run(() => fn(data));
    };
  }
  async function open(id) {
    const f = await api("families/" + id);
    F(f);
    P(f.people[0]?.id || "");
    T("Nacimiento");
    A("Partidas");
    Q(false);
  }
  const leave = () =>
    !dirty || window.confirm("¿Salir y descartar los cambios sin guardar?");
  const people = folder?.people || [],
    person = people.find((p) => p.id === personId);
  function update(next) {
    F({ ...folder, people: next });
    Q(true);
    M("");
  }
  function edit(patch) {
    update(people.map((p) => (p.id === personId ? { ...p, ...patch } : p)));
  }
  const findings = discrepancies(people);
  const full =
    dashboard &&
    dashboard.tier !== "unlimited" &&
    dashboard.families.length >= Number(dashboard.tier);
  return (
    <>
      <header>
        <strong>Control de partidas</strong>
        <span>Ciudadanías</span>
        {session?.email && (
          <button
            disabled={busy}
            onClick={() =>
              leave() &&
              run(async () => {
                await api("logout", {});
                Q(false);
                F(null);
                D(null);
                await init();
              })
            }
          >
            Cerrar sesión
          </button>
        )}
      </header>
      <main aria-busy={busy}>
        {message && (!session || session.email) && (
          <p role="status" className="notice">
            {message}
          </p>
        )}
        {!session ? (
          <section>
            <h1>Cargando tus carpetas…</h1>
            <button onClick={() => run(init)}>Reintentar</button>
          </section>
        ) : !session.email ? (
          <section className="auth">
            <aside>
              <small>Para estudios jurídicos</small>
              <h1>Control documental de ciudadanías</h1>
              <p>Organizá los expedientes de ciudadanía italiana y española de tus clientes. Compará las partidas de cada generación y consultá en qué acta aparece cada diferencia.</p>
            </aside>
            <article>
              <h2>{register ? "Crear cuenta" : "Ingresá a tu cuenta"}</h2>
              <form
                onSubmit={submit(async (data) => {
                  try {
                    await api(register ? "register" : "login", data);
                  } catch (error) {
                    if (register && error.status === 409) {
                      R(false);
                      throw Error("Ya tenés una cuenta con ese correo. Ingresá con tu contraseña.");
                    }
                    throw error;
                  }
                  const signedIn = await init();
                  if (!signedIn.email) {
                    R(false);
                    throw Error("No se pudo mantener la sesión. Ingresá con el correo y la contraseña de tu cuenta.");
                  }
                  M(register ? "Cuenta creada. Ya podés abrir tu primera carpeta." : "Sesión iniciada.");
                })}
              >
                <label>
                  Correo electrónico
                  <input
                    required
                    name="email"
                    type="email"
                    autoComplete="email"
                  />
                </label>
                <label>
                  Contraseña
                  <input
                    required
                    name="password"
                    type="password"
                    minLength={register ? 10 : 1}
                    autoComplete={
                      register ? "new-password" : "current-password"
                    }
                  />
                </label>
                {register && <small>Usá al menos 10 caracteres.</small>}
                {message && <p role="alert" className="notice">{message}</p>}
                <button disabled={busy}>
                  {busy ? "Un momento…" : register ? "Crear mi cuenta" : "Ingresar"}
                </button>
              </form>
              <button
                className="quiet"
                onClick={() => {
                  R(!register);
                  M("");
                }}
              >
                {register ? "Ya tengo cuenta" : "Crear una cuenta con correo"}
              </button>
              {session.google && (
                <a className="google-login" href="/api/google">
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>Continuar con Google</span>
                </a>
              )}
            </article>
          </section>
        ) : !dashboard ? (
          <button onClick={() => run(refresh)}>Cargar mis carpetas</button>
        ) : !folder ? (
          <>
            <small>Mi espacio de trabajo</small>
            <h1>Mis carpetas</h1>
            <p>
              {session.email} · Plan de{" "}
              {tierLabel(dashboard.tier).toLowerCase()}
            </p>
            <article>
              <h2>Nueva carpeta familiar</h2>
              <form
                className="row"
                onSubmit={submit(async ({ surname }) => {
                  const f = await api("families", { surname });
                  await refresh();
                  await open(f.id);
                })}
              >
                <label>
                  Apellido de la familia
                  <input
                    name="surname"
                    required
                    maxLength="100"
                    placeholder="Ej. Lombardo"
                  />
                </label>
                <button disabled={full || busy}>Crear carpeta</button>
              </form>
              {full && <p>Alcanzaste el límite de tu plan.</p>}
            </article>
            <h2>Carpetas guardadas</h2>
            {dashboard.families.length ? (
              <div className="cards">
                {dashboard.families.map((f) => (
                  <button
                    className="card"
                    disabled={busy}
                    key={f.id}
                    onClick={() => run(() => open(f.id))}
                  >
                    <small>Carpeta familiar</small>
                    <b>{f.surname}</b>
                    <span>Abrir →</span>
                  </button>
                ))}
              </div>
            ) : (
              <p>Todavía no tenés carpetas guardadas.</p>
            )}
            {dashboard.offers.length > 0 && (
              <article>
                <h2>Suscripción</h2>
                {(dashboard.tier === "1"
                  ? dashboard.offers
                  : [dashboard.tier]
                ).map((t) => (
                  <button
                    disabled={busy}
                    key={t}
                    onClick={() =>
                      run(async () => {
                        location.assign(
                          (await api("billing", { tier: t })).url,
                        );
                      })
                    }
                  >
                    {dashboard.tier === "1"
                      ? tierLabel(t)
                      : "Administrar suscripción"}
                  </button>
                ))}
              </article>
            )}
          </>
        ) : (
          <>
            <button
              className="quiet"
              disabled={busy}
              onClick={() =>
                leave() &&
                run(async () => {
                  await refresh();
                  F(null);
                  Q(false);
                })
              }
            >
              ← Mis carpetas
            </button>
            <small>Carpeta familiar</small>
            <h1>{folder.surname}</h1>
            <nav>
              {["Partidas", "Diferencias"].map((t) => (
                <button key={t} aria-pressed={t === tab} onClick={() => A(t)}>
                  {t}
                  {t === "Diferencias" ? " (" + findings.length + ")" : ""}
                </button>
              ))}
            </nav>
            {tab === "Diferencias" ? (
              <article>
                <h2>Revisión de partidas</h2>
                {findings.length ? (
                  findings.map((v, i) => (
                    <section key={i}>
                      <h3>{v.person}</h3>
                      <strong>{v.label}</strong>
                      <ul>{v.lines.map(line => <li key={line}>{line}</li>)}</ul>
                    </section>
                  ))
                ) : (
                  <p>Sin diferencias entre los campos comparables cargados.</p>
                )}
              </article>
            ) : (
              <fieldset disabled={busy} className="workspace">
                <article>
                  <h2>Línea familiar</h2>
                  {!people.length &&
                    localStorage.getItem("partidasGuardadas") && (
                      <button
                        onClick={() => {
                          try {
                            const old = importLegacy(
                              localStorage.getItem("partidasGuardadas"),
                            );
                            update(old);
                            P(old[0].id);
                            M(
                              "Revisá las personas y sus vínculos antes de guardar.",
                            );
                          } catch (e) {
                            M(e.message);
                          }
                        }}
                      >
                        Importar partidas de este navegador
                      </button>
                    )}
                  {people.map((p) => (
                    <button
                      key={p.id}
                      className="member"
                      aria-pressed={p.id === personId}
                      onClick={() => {
                        P(p.id);
                        T("Nacimiento");
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const name = e.currentTarget.elements.name.value.trim();
                      if (!name) return;
                      const id = crypto.randomUUID();
                      update([...people, { id, name, records: {} }]);
                      P(id);
                      T("Nacimiento");
                      e.currentTarget.reset();
                    }}
                  >
                    <label>
                      Nueva persona
                      <input
                        name="name"
                        required
                        placeholder="Nombre y apellido"
                      />
                    </label>
                    <button>Agregar persona</button>
                  </form>
                </article>
                <article>
                  {person ? (
                    <>
                      <h2>{person.name}</h2>
                      <label>
                        Ascendiente en esta línea
                        <select
                          value={person.parentId || ""}
                          onChange={(e) => edit({ parentId: e.target.value })}
                        >
                          <option value="">Sin vincular</option>
                          {people
                            .filter((p) => {
                              let current = p;
                              const seen = new Set();
                              while (current) {
                                if (
                                  current.id === person.id ||
                                  seen.has(current.id)
                                )
                                  return false;
                                seen.add(current.id);
                                current = people.find(
                                  (x) => x.id === current.parentId,
                                );
                              }
                              return true;
                            })
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                        </select>
                      </label>
                      {person.parentId && (
                        <label>
                          Vínculo
                          <select
                            value={person.side || "father"}
                            onChange={(e) => edit({ side: e.target.value })}
                          >
                            <option value="father">Padre</option>
                            <option value="mother">Madre</option>
                          </select>
                        </label>
                      )}
                      <nav>
                        {Object.keys(types).map((k) => (
                          <button
                            key={k}
                            aria-pressed={k === record}
                            onClick={() => T(k)}
                          >
                            {k}
                          </button>
                        ))}
                      </nav>
                      <div className="grid">
                        {types[record].map((k) => (
                          <label key={k}>
                            {fields[k]}
                            <input
                              type={
                                ["born", "died", "married"].includes(k)
                                  ? "date"
                                  : k === "age"
                                    ? "number"
                                    : "text"
                              }
                              value={person.records[record]?.[k] || ""}
                              onChange={(e) =>
                                edit({
                                  records: {
                                    ...person.records,
                                    [record]: {
                                      ...person.records[record],
                                      [k]: e.target.value,
                                    },
                                  },
                                })
                              }
                            />
                          </label>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p>Agregá la primera persona para cargar sus partidas.</p>
                  )}
                </article>
              </fieldset>
            )}
            <footer>
              <span>{dirty ? "Cambios sin guardar" : "Carpeta guardada"}</span>
              <button
                disabled={!dirty || busy}
                onClick={() =>
                  run(async () => {
                    const result = await api("families/" + folder.id, {
                      people,
                      revision: folder.revision,
                    });
                    F((f) => ({ ...f, revision: result.revision }));
                    Q(false);
                    M("Carpeta guardada.");
                  })
                }
              >
                Guardar carpeta
              </button>
            </footer>
          </>
        )}
      </main>
    </>
  );
}
