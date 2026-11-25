import {useState} from "react";
import {types} from "./records";
export const reviewStates=["Pendiente de revisión","En revisión","Revisada","Pendiente de rectificación o aclaración","Resuelta"];
export function revisionFor(finding,reviews){
 const history=reviews?.[finding.id]||[],last=history.at(-1);
 const stale=last && last.evidence!==JSON.stringify(finding.lines);
 return {history,stale,status:stale?reviewStates[0]:last?.status||reviewStates[0],note:last?.note||""};
}
export function Report({folder,findings,comparisons,change,jump}){
 const [who,W]=useState(""),[status,S]=useState(""),[category,C]=useState(""),[type,T]=useState(""),[scope,X]=useState("Completo");
 const [notes,N]=useState({});const people=folder.people;
 const filtered=findings.filter(f=>(!who||f.personId===who)&&(!category||f.category===category)&&(!type||f.sources.some(s=>s.type===type))&&(!status||revisionFor(f,folder.reviews).status===status));
 const shown=scope==="Solo pendientes"?filtered.filter(f=>!["Revisada","Resuelta"].includes(revisionFor(f,folder.reviews).status)):filtered;
 const inventory=people.filter(p=>!who||p.id===who).flatMap(p=>Object.keys(types).flatMap(t=>[p.records[t],...(p.versions?.[t]||[]).map(v=>v.data)].filter(v=>v&&Object.values(v).some(x=>typeof x==="string"&&x.trim())).map((r,i)=>[p.name,t,r.versionLabel||String(i+1),r.actNumber||""])));
 const select=(label,value,set,options)=><label>{label}<select aria-label={label} value={value} onChange={e=>set(e.target.value)}>{options.map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>;
 function csv(){
 const rows=[["Expediente","Persona","Tipo","Detalle","Estado","Observaciones"]];
 if(scope!=="Solo inventario")for(const f of shown){const r=revisionFor(f,folder.reviews);rows.push([folder.surname,f.person,f.category,f.lines.join(" / "),r.status,r.note]);}
 if(scope!=="Solo pendientes")for(const [p,t,v,a] of inventory)rows.push([folder.surname,p,t,"Versión "+v+" · Acta "+a,"",""]);
 const escape=v=>'"'+String(v).replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';
 const url=URL.createObjectURL(new Blob(["\uFEFF"+rows.map(row=>row.map(escape).join(";")).join("\r\n")],{type:"text/csv;charset=utf-8"}));const link=document.createElement("a");link.href=url;link.download="control-documental.csv";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 return <article className="report"><h2>Informe de control documental</h2><p>{folder.surname} · {new Date().toLocaleDateString("es-AR")} · {comparisons} campos comparados</p>
 <div className="grid controls">{select("Persona o generación",who,W,[["","Todas"],...people.map((p,i)=>[p.id,(i+1)+". "+p.name])])}{select("Tipo de partida",type,T,[["","Todas"],...Object.keys(types).map(v=>[v,v])])}{select("Categoría",category,C,[["","Todas"],...[...new Set(findings.map(f=>f.category))].map(v=>[v,v])])}{select("Estado",status,S,[["","Todos"],...reviewStates.map(v=>[v,v])])}{select("Contenido del informe",scope,X,["Completo","Solo pendientes","Solo inventario"].map(v=>[v,v]))}</div>
 {scope!=="Solo pendientes"&&<section><h3>Inventario de partidas</h3>{inventory.map(([p,t,v,a],i)=><p key={i}>{p} · {t} · {v}{a&&" · Acta "+a}</p>)}</section>}
 {scope!=="Solo inventario"&&(!shown.length?<p>{!comparisons?"Información insuficiente para comparar los documentos.":findings.length?"Sin resultados para esta selección.":"Sin discrepancias en los campos comparados."}</p>:shown.map(f=>{
 const r=revisionFor(f,folder.reviews);
 function save(next){change({...folder.reviews,[f.id]:[...r.history,{at:new Date().toISOString(),status:next,note:notes[f.id]??r.note,evidence:JSON.stringify(f.lines)}]});}
 return <section className="finding" key={f.id}><small>{f.category} · {r.status}</small><h3>{f.person}</h3><strong>{f.label}</strong>{f.lines.map((line,i)=><p key={i}>{line} <button className="controls" onClick={()=>jump(f.sources[i])}>Ir al campo</button></p>)}{r.stale&&<p>Los datos cambiaron desde la última revisión.</p>}<p>{r.note}</p><div className="controls"><label>Observaciones<textarea value={notes[f.id]??r.note} onChange={e=>N({...notes,[f.id]:e.target.value})}/></label>{select("Estado de revisión",r.status,save,reviewStates.map(v=>[v,v]))}<button onClick={()=>save(r.status)}>Registrar observación</button>{r.history.length>0&&<details><summary>Historial de revisión</summary>{r.history.map((h,i)=><p key={i}>{new Date(h.at).toLocaleString("es-AR")} · {h.status} · {h.note}</p>)}</details>}</div></section>;
 }))}
 {Object.entries(folder.reviews||{}).filter(([id])=>!findings.some(f=>f.id===id)).map(([id,h])=><details key={id}><summary>Revisión histórica · Los datos comparados cambiaron</summary>{h.map((v,i)=><p key={i}>{v.status} · {v.note} · {JSON.parse(v.evidence).join(" / ")}</p>)}</details>)}
 <p>Los resultados asisten al control documental. La valoración jurídica corresponde al profesional.</p><nav className="controls"><button onClick={()=>window.print()}>Imprimir o guardar PDF</button><button onClick={csv}>Exportar CSV</button></nav></article>;
}
