import {Account,Recovery} from "./Account";
import Document from "./Document";
import Landing from "./Landing";
import {Report} from "./Report";
import { useEffect, useState, useRef } from "react";
import { types, evaluate, importLegacy } from "./records";
import "./App.css";

const demo = new URLSearchParams(location.search).has("demo");
async function api(path, data) {
  if (demo) return (await import("./demo")).api(path, data);
  const headers = new Headers();
  if (data !== undefined) headers.set("Content-Type", "application/json");
  if(!navigator.onLine)throw Error("Sin conexión. Tus cambios siguen en esta pestaña.");
  const response = await fetch(
    "/api/" + path,
    data === undefined
      ? { headers }
      : {
          method: "POST",
          headers,
          body: JSON.stringify(data),
        },
  );
  const result = await response.json().catch(()=>({error:"La sesión o la conexión se interrumpió. Volvé a intentar."}));
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
    [register, R] = useState(new URLSearchParams(location.search).has("registro"));
  const [dirty, Q] = useState(false),
    [personId, P] = useState(""),
    [record, T] = useState("Nacimiento"),
    [tab, A] = useState("Partidas");
  const [showPassword,show]=useState(false),[search,searchFor]=useState(""),[order,sortBy]=useState("name"),[filter,filterBy]=useState("");
  const [online,setOnline]=useState(navigator.onLine);
  useEffect(()=>{const update=()=>setOnline(navigator.onLine);window.addEventListener("online",update);window.addEventListener("offline",update);return()=>{window.removeEventListener("online",update);window.removeEventListener("offline",update);};},[]);
  const creation = useRef(null);
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
    newPeople.current.clear();
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
  const nameInput = useRef(null);
  const focusNewName = useRef(false);
  const newPeople = useRef(new Set());
  useEffect(() => {
    if (focusNewName.current && nameInput.current) {
      nameInput.current.focus();
      focusNewName.current = false;
    }
  }, [personId]);
  function addGeneration() {
    const id = crypto.randomUUID();
    const first = people.length === 0;
    update([...people, { id, name: "", ...(first ? {role:"avo"} : {parentId:people.at(-1).id,side:"father"}), records: { Nacimiento: {} } }]);
    newPeople.current.add(id);
    focusNewName.current = true;
    P(id);
    T("Nacimiento");
  }
  const heads = people.filter(p => !p.parentId);
  const avo = people.find(p => p.role === "avo") || (heads.length === 1 ? heads[0] : null);
  const {findings,comparisons}=evaluate(people);
  const list=(dashboard?.families||[]).filter(f=>f.surname.toLocaleLowerCase().includes(search.toLocaleLowerCase())&&(!filter||(f.archived?"Archivado":f.status||"En preparación")===filter)).sort((a,b)=>order==="date"?(b.updatedAt||"").localeCompare(a.updatedAt||""):order==="status"?(a.status||"").localeCompare(b.status||""):a.surname.localeCompare(b.surname,"es"));
  function patchFolder(patch){F({...folder,...patch});Q(true);}
  const focusField=useRef(null);
  useEffect(()=>{if(focusField.current){document.getElementById("document-"+focusField.current)?.focus();focusField.current=null;}},[tab,record,personId]);

  const consumed = dashboard?.consumed ?? dashboard?.families.length ?? 0;
  const full = dashboard && (dashboard.available === 0 || (demo && consumed >= 5));
  const query=new URLSearchParams(location.search);
  if(query.has("recuperar")||new URLSearchParams(location.hash.slice(1)).has("purpose"))return <main><Recovery api={api}/></main>;
  if(!demo&&!query.has("acceso")&&!query.has("registro")&&!query.has("trabajo")&&(!session?.email||query.has("portada")))return <Landing/>;
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
                if (demo) { location.assign("/"); return; }
                await api("logout", {});
                Q(false);
                F(null);
                D(null);
                await init();
              })
            }
          >
            {demo ? "Salir de la demostración" : "Cerrar sesión"}
          </button>
        )}
      </header>
      <main aria-busy={busy}>{!online&&<p role="alert">Sin conexión. Conservá esta pestaña y reintentá el guardado al recuperar la conexión.</p>}
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
              <p>Organizá los expedientes de ciudadanía de tus clientes. Compará las partidas de cada generación y consultá en qué acta aparece cada diferencia.</p>
            </aside>
            <article>
              {query.has("vincular")&&<p>Ingresá con tu contraseña. Desde «Cuenta y suscripción» podés vincular Google a tus expedientes.</p>}
              <h2>{register ? "Crear cuenta" : "Ingresá a tu cuenta"}</h2>
              {!session.google && <p><small>El acceso con Google está pendiente de configuración.</small></p>}
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
                    type={showPassword?"text":"password"}
                    minLength={register ? 10 : 1}
                    autoComplete={
                      register ? "new-password" : "current-password"
                    }
                  />
                </label>
                <label className="inline"><input type="checkbox" checked={showPassword} onChange={e=>show(e.target.checked)}/>Mostrar contraseña</label>
                {register && <small>Usá al menos 10 caracteres. Tu cuenta incluye un único cupo de creación. Eliminar o archivar el expediente no lo devuelve.</small>}
                {message && <p role="alert" className="notice">{message}</p>}
                <button disabled={busy}>
                  {busy ? "Un momento…" : register ? "Crear cuenta gratis" : "Ingresar"}
                </button>
              </form>
              <button
                className="quiet"
                onClick={() => {
                  R(!register);
                  M("");
                }}
              >
                {register ? "Ya tengo cuenta" : "Registrarme con correo electrónico"}
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
              <p><a href="?recuperar">Recuperar contraseña</a></p><p><a href="?demo">Explorar demostración</a></p>
            </article>
          </section>
        ) : !dashboard ? (
          <button onClick={() => run(refresh)}>Cargar mis carpetas</button>
        ) : !folder ? (
          <>
            <small>Mi espacio de trabajo</small>
            <h1>Mis expedientes</h1>{!demo&&<Account session={session} api={api} run={run} init={init}/>}
            <p>
              {session.email} · Expedientes existentes: {dashboard.families.length} · Cupos consumidos: {consumed} · Disponibles: {demo ? 5-consumed : dashboard.available ?? "ilimitados"}
            </p>
            <article>
              <h2>Nuevo expediente</h2>
              <p>{demo ? "La demostración no consume cupos de tu cuenta." : "Crear un expediente consume un cupo. Eliminarlo o archivarlo no devuelve ese cupo."}</p>
              <form
                className="row"
                onSubmit={submit(async (values) => {
                  const surname=values.surname;
                  if(creation.current?.surname!==surname) creation.current={surname,requestId:crypto.randomUUID()};
                  const f = await api("families", {...values,...creation.current});
                  creation.current=null;
                  await refresh();
                  await open(f.id);
                })}
              >
                <label>
                  Apellido de referencia
                  <input
                    name="surname"
                    required
                    maxLength="100"
                    placeholder="Ej. Lombardo"
                  />
                </label>
                <details><summary>Datos opcionales</summary>{[["internal","Referencia interna"],["applicant","Solicitante principal"],["country","País de ciudadanía solicitada"],["notes","Observaciones generales"]].map(([k,label])=><label key={k}>{label}<input name={k} maxLength="1000"/></label>)}</details><button disabled={full || busy}>Crear expediente</button>
              </form>
              {full && <p>Alcanzaste el límite de tu plan.</p>}
            </article>
            <section className="stats" aria-label="Resumen de expedientes"><p><strong>{dashboard.families.filter(f=>!f.archived).length}</strong> activos</p><p><strong>{dashboard.families.filter(f=>f.archived).length}</strong> archivados</p><p><strong>{dashboard.families.reduce((n,f)=>n+(f.pending??evaluate(f.people||[]).findings.length),0)}</strong> discrepancias pendientes</p></section><h2>Expedientes guardados</h2><div className="grid"><label>Buscar por apellido<input value={search} onChange={e=>searchFor(e.target.value)}/></label><label>Estado<select value={filter} onChange={e=>filterBy(e.target.value)}>{["","En preparación","Pendiente de documentación","En revisión","Revisión documental finalizada","Archivado"].map(v=><option value={v} key={v}>{v||"Todos"}</option>)}</select></label><label>Ordenar por<select value={order} onChange={e=>sortBy(e.target.value)}><option value="name">Apellido</option><option value="date">Última modificación</option><option value="status">Estado</option></select></label></div>
            {!list.length&&dashboard.families.length>0&&<p>Sin coincidencias para esta búsqueda.</p>}
            {dashboard.families.length ? (
              <div className="cards">
                {list.map((f) => (
                  <div key={f.id}><button
                    className="card"
                    disabled={busy}
                    key={f.id}
                    onClick={() => run(() => open(f.id))}
                  >
                    <small>Expediente</small>
                    <b>{f.surname}</b><small>{f.peopleCount??f.people?.length??0} personas · {f.recordCount??0} partidas · {f.pending??0} pendientes</small>{f.updatedAt&&<small>Actualizado el {new Date(f.updatedAt).toLocaleDateString("es-AR")}</small>}<small>{f.archived?"Archivado":f.status||"En preparación"}</small>
                    <span>{f.archived ? "Archivado · Abrir" : "Abrir"}</span>
                  </button>
                  {!demo && <div>
                    <button disabled={busy} onClick={()=>run(async()=>{await api("families/"+f.id,{revision:f.revision,action:f.archived?"restore":"archive"});await refresh();})}>{f.archived?"Restaurar":"Archivar"}</button>
                    <button disabled={busy} onClick={()=>{if(window.confirm("Eliminar este expediente es una acción irreversible. El cupo utilizado para crearlo no se recuperará y esta eliminación no habilitará la creación de un nuevo expediente."))run(async()=>{await api("families/"+f.id,{revision:f.revision,action:"delete"});await refresh();});}}>Eliminar definitivamente</button>
                  </div>}</div>
                ))}
              </div>
            ) : (
              <p>Todavía no tenés expedientes guardados.</p>
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
              ← Mis expedientes
            </button>
            <small>Expediente</small>
            <h1>{folder.surname}</h1><details className="controls"><summary>Editar datos del expediente</summary><div className="grid">{[["surname","Apellido de referencia"],["internal","Referencia interna"],["applicant","Solicitante principal"],["country","País de ciudadanía solicitada"],["notes","Observaciones generales"]].map(([k,l])=><label key={k}>{l}<input maxLength={k==="surname"?100:1000} value={folder[k]||""} onChange={e=>patchFolder({[k]:e.target.value})}/></label>)}<label>Estado<select value={folder.status||"En preparación"} onChange={e=>patchFolder({status:e.target.value})}>{["En preparación","Pendiente de documentación","En revisión","Revisión documental finalizada"].map(t=><option key={t}>{t}</option>)}</select></label></div></details>
            <nav>
              {["Partidas", "Discrepancias"].map((t) => (
                <button key={t} aria-pressed={t === tab} onClick={() => A(t)}>
                  {t}
                  {t === "Discrepancias" ? " (" + findings.length + ")" : ""}
                </button>
              ))}
            </nav>
            {tab === "Discrepancias" ? (
              <Report folder={folder} findings={findings} comparisons={comparisons} change={reviews=>patchFolder({reviews})} jump={s=>{focusField.current=s.key;P(s.personId);T(s.type);A("Partidas");}}/>
            ) : (
              <fieldset disabled={busy} className="workspace">
                <article>
                  <h2>Línea de descendencia</h2>{people.length>0&&<label className="mobile-person">Seleccionar generación<select value={personId} onChange={e=>{P(e.target.value);T("Nacimiento");}}>{people.map((p,i)=><option key={p.id} value={p.id}>{i+1} · {p.name||"Nueva persona"}</option>)}</select></label>}
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
                      {p.name || (avo?.id === p.id ? "AVO" : "Nuevo descendiente")}{p.name && avo?.id === p.id ? " · AVO" : ""}
                    </button>
                  ))}
                  <button type="button" disabled={people.some(p => !p.name.trim())} onClick={addGeneration}>
                    {people.length ? "Agregar descendiente" : "Ingresar AVO"}
                  </button>
                </article>
                <article>
                  {person ? (
                    <>
                      {person.id === avo?.id && <small>AVO · Cabeza de la línea de descendencia</small>}
                      <h2>{person.name || (people[0].id === person.id ? "Datos del AVO" : "Datos del descendiente")}</h2>
                      {newPeople.current.has(person.id) && !person.name && <button type="button" onClick={() => {
                        update(people.filter(p => p.id !== person.id));
                        P(people.find(p => p.id !== person.id)?.id || "");
                      }}>Descartar carga sin nombre</button>}
                      {people.length > 1 && person.id !== avo?.id && (
                      <label>
                        Ascendiente directo
                        <select
                          value={person.parentId || ""}
                          onChange={(e) => edit({ parentId: e.target.value })}
                        >
                          <option value="">Sin ascendiente vinculado</option>
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
                              return !people.some(other=>other.id!==person.id&&other.parentId===p.id);
                            })
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                        </select>
                      </label>
                      )}
                      {person.id !== avo?.id && person.parentId && (
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
                      <Document key={person.id+record} person={person} type={record} edit={edit} nameInput={nameInput}/>
                      <details><summary>Administrar persona</summary><button onClick={()=>{if(!window.confirm("¿Eliminar esta persona y sus partidas? Las demás personas se conservarán y podrán volver a vincularse."))return;
                        const next=people.filter(p=>p.id!==person.id).map(p=>p.parentId===person.id?{...p,parentId:""}:p);update(next);P(next[0]?.id||"");}}>Eliminar persona</button></details>

                    </>
                  ) : (
                    <p>Ingresá el AVO para comenzar con su partida de nacimiento.</p>
                  )}
                </article>
              </fieldset>
            )}
            <footer>
              <span>{busy ? "Guardando…" : dirty ? "Cambios sin guardar" : "Cambios guardados"}</span>
              <button
                disabled={!dirty || busy}
                onClick={() =>
                  run(async () => {
                    const unnamed = people.find(p => !p.name.trim());
                    if (unnamed) {
                      P(unnamed.id); T("Nacimiento"); A("Partidas");
                      throw Error("Completá el nombre y apellido en la partida de nacimiento para guardar.");
                    }
                    const result = await api("families/" + folder.id, {
                      people,reviews:folder.reviews||{},surname:folder.surname,internal:folder.internal||"",country:folder.country||"",applicant:folder.applicant||"",notes:folder.notes||"",status:folder.status||"En preparación",
                      revision: folder.revision,
                    });
                    newPeople.current.clear();
                    F((f) => ({ ...f, revision: result.revision }));
                    Q(false);
                    M("Cambios guardados.");
                  })
                }
              >
                Guardar partida
              </button>
            </footer>
          </>
        )}
      </main>
    </>
  );
}
