import {useState} from "react";
import {types,fields,registryFields,fieldStates} from "./records";
export default function Document({person,type,edit,nameInput}){
 const [version,V]=useState("reference");
 const versions=person.versions?.[type]||[];
 const reference=person.records[type]||{};
 const active=version==="reference"?reference:versions.find(v=>v.id===version)?.data||{};
 function setDoc(doc){
   if(version==="reference")edit({records:{...person.records,[type]:doc},...(type==="Nacimiento"&&Object.hasOwn(doc,"given")?{name:doc.given}:{})});
   else edit({versions:{...person.versions,[type]:versions.map(v=>v.id===version?{...v,data:doc}:v)}});
 }
 function add(){
   const id=crypto.randomUUID();edit({versions:{...person.versions,[type]:[...versions,{id,data:{}}]}});V(id);
 }
 function promote(){
   if(type==="Nacimiento"&&!active.given?.trim())return;
   edit({records:{...person.records,[type]:active},versions:{...person.versions,[type]:versions.map(v=>v.id===version?{...v,data:reference}:v)},...(type==="Nacimiento"?{name:active.given}:{})});V("reference");
 }
 function input(k){
   const val=active[k]??(type==="Nacimiento"&&k==="given"&&version==="reference"?person.name:"");
   return <div key={k}><label>{fields[k]||registryFields[k]}<input id={"document-"+k} ref={k==="given"&&type==="Nacimiento"?nameInput:undefined} value={val} placeholder={["born","married","died","issued"].includes(k)?"AAAA, AAAA-MM o AAAA-MM-DD":undefined} onChange={e=>setDoc({...active,[k]:e.target.value})}/></label>
   {fields[k]&&<details><summary>Estado del dato</summary><select aria-label={"Estado de "+fields[k]} value={active.states?.[k]||(val?"Dato cargado":"Pendiente")} onChange={e=>setDoc({...active,states:{...active.states,[k]:e.target.value}})}>{fieldStates.map(x=><option key={x}>{x}</option>)}</select></details>}</div>;
 }
 return <section><label>Checklist de {type.toLowerCase()}<select value={person.checklist?.[type]||"Sin definir"} onChange={e=>edit({checklist:{...person.checklist,[type]:e.target.value}})}>{["Sin definir","Pendiente","Cargada","En revisión","No aplicable"].map(x=><option key={x}>{x}</option>)}</select></label>
 <nav><label>Partida o versión<select value={version} onChange={e=>V(e.target.value)}><option value="reference">Referencia · {reference.versionLabel||type}</option>{versions.map((v,i)=><option key={v.id} value={v.id}>{v.data.versionLabel||"Adicional "+(i+1)}</option>)}</select></label><button onClick={add}>Agregar otra partida de {type.toLowerCase()}</button>{version!=="reference"&&<button disabled={type==="Nacimiento"&&!active.given?.trim()} onClick={promote}>Usar como referencia</button>}</nav>
 <h3>Datos del acto</h3><div className="grid">{types[type].filter(k=>!["father","mother"].includes(k)).map(input)}</div><h3>Filiación</h3><div className="grid">{["father","mother"].map(input)}</div><details><summary>Referencia registral y observaciones</summary><div className="grid">{Object.keys(registryFields).map(input)}</div></details></section>;
}
