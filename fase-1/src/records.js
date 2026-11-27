export const fields = {
  given: "Nombre y apellido",
  sex: "Sexo según partida",
  born: "Fecha de nacimiento",
  origin: "Lugar de nacimiento",
  father: "Nombre y apellido del padre",
  mother: "Nombre y apellido de la madre",
  age: "Edad al casarse",
  nationality: "Nacionalidad",
  spouse: "Nombre y apellido del cónyuge",
  marriagePlace: "Lugar de matrimonio",
  married: "Fecha de matrimonio",
  died: "Fecha de defunción",
  place: "Lugar de defunción",
  dni: "Documento",
};
const identity = ["given"],
  parents = ["father", "mother"];
export const types = {
  Nacimiento: [...identity, "sex", "born", "origin", ...parents],
  Matrimonio: [
    ...identity,
    "age",
    "nationality",
    "origin",
    ...parents,
    "spouse",
    "marriagePlace",
    "married",
  ],
  Defunción: [
    ...identity,
    "dni",
    "nationality",
    "origin",
    "born",
    ...parents,
    "died",
    "place",
  ],
};
const normalized = (s) => s.trim().replace(/\s+/g, " ").toLocaleLowerCase("es");
function citation(type, owner) {
  return "En la partida de " + type.toLowerCase() + " de " + owner;
}

export const registryFields={registry:"Registro u organismo emisor",actNumber:"Número de acta",volume:"Tomo",folio:"Folio",year:"Año de inscripción",issued:"Fecha de expedición",reference:"Referencia interna",margin:"Anotaciones marginales",corrections:"Rectificaciones",notes:"Observaciones",versionLabel:"Identificación de la versión"};
export const fieldStates=["Dato cargado","Pendiente","No consta","Ilegible","Parcialmente conocido","No aplicable"];
function completeDate(value){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value||""))return false;
  const d=new Date(value+"T00:00:00Z");return !Number.isNaN(d.getTime())&&d.toISOString().startsWith(value);
}
export function evaluate(people){
 const findings=[];let comparisons=0;
 const source=(p,type,key)=>({personId:p.id,type,key,value:p.records[type]?.[key],owner:p.name});
 const usable=s=>typeof s.value==="string"&&s.value.trim()&&![ "Pendiente","No consta","Ilegible","No aplicable"].includes(people.find(p=>p.id===s.personId)?.records[s.type]?.states?.[s.key]);
 function compare(p,label,category,sources,different,explanation){
   if(!sources.every(usable))return;
   comparisons++;
   if(!different())return;
   const id=JSON.stringify(sources.map(s=>[s.personId,s.type,s.key]));
   findings.push({id,person:p.name,personId:p.id,label,category,sources,lines:sources.map((s,i)=>citation(s.type,s.owner)+(s.key==="father"?" figura como padre ":s.key==="mother"?" figura como madre ":" figura ")+ "«"+s.value+"»."+(i===0&&explanation?" "+explanation:""))});
 }
 for(const p of people){
   for(const [key,label] of Object.entries(fields)){
     const entries=Object.keys(types).map(t=>source(p,t,key)).filter(usable);
     for(let i=1;i<entries.length;i++){
       const a=entries[0],b=entries[i];
       compare(p,label,["father","mother"].includes(key)?"Filiación":key==="born"?"Fecha":key==="origin"?"Lugar":"Identidad",[a,b],()=>normalized(a.value)!==normalized(b.value));
     }
   }
   for(const type of Object.keys(types)){
     const holder=source(p,type,"given");
     for(const role of parents){
       const relative=source(p,type,role);
       if(![holder,relative].every(usable))continue;
       // Full names are transcribed in a single field. Keep the last two
       // possible surname words to accommodate double surnames.
       const candidates=value=>normalized(value).split(" ").slice(1).slice(-2);
       const relatives=candidates(relative.value);
       const variant=candidates(holder.value).find(word=>relatives.some(other=>
         word!==other && word.replace(/v/g,"b")===other.replace(/v/g,"b")
       ) && !relatives.includes(word));
       if(variant)compare(p,"Posible variante de apellido en la misma acta (B/V)","Filiación",
         [holder,relative],()=>true);
     }
   }
   const birth=source(p,"Nacimiento","born"),marriage=source(p,"Matrimonio","married"),death=source(p,"Defunción","died");
   for(const [a,b] of [[birth,marriage],[birth,death],[marriage,death]]){
     if(completeDate(a.value)&&completeDate(b.value)) compare(p,"Orden de los actos","Cronología",[a,b],()=>a.value>b.value);
   }
   const age=source(p,"Matrimonio","age");
   if(completeDate(birth.value)&&completeDate(marriage.value)&&/^\d+$/.test(age.value||"")){
     const years=Number(marriage.value.slice(0,4))-Number(birth.value.slice(0,4))-Number(marriage.value.slice(5)<birth.value.slice(5));
     compare(p,"Edad al casarse","Cronología",[age,birth,marriage],()=>years>=0&&Number(age.value)!==years,"Edad calculada: "+years+" años.");
   }
   const parent=people.find(x=>x.id===p.parentId);
   if(parent)for(const t of Object.keys(types)){
     const a=source(p,t,p.side==="mother"?"mother":"father"),b=source(parent,"Nacimiento","given");
     compare(parent,"Nombre del ascendiente","Filiación",[a,b],()=>normalized(a.value)!==normalized(b.value));
   }
 }
 return {findings,comparisons};
}
export const discrepancies=people=>evaluate(people).findings;
export function importLegacy(raw) {
  const rows = JSON.parse(raw);
  if (!Array.isArray(rows) || !rows.length)
    throw Error("No hay partidas anteriores para importar.");
  const people = rows.map((row) => {
    const data = Object.values(row).find((v) => v?.partidaNacimiento);
    if (!data?.partidaNacimiento?.persona)
      throw Error("El archivo de partidas anteriores está incompleto.");
    const b = data.partidaNacimiento,
      m = data.partidaMatrimonio,
      d = data.partidaDefuncion;
    const records = {
      Nacimiento: {
        given: b.persona,
        sex: b.sexo,
        born: b.bday,
        origin: b.lugarNacimiento,
        father: b.padre,
        mother: b.madre,
      },
    };
    if (m)
      records.Matrimonio = {
        given: m.persona,
        age: m.age,
        nationality: m.nacionalidad,
        origin: m.bdayPlace,
        father: m.hijoDe?.padre,
        mother: m.hijoDe?.madre,
        spouse: m.conyuge,
        married: m.date,
        marriagePlace: m.place,
      };
    if (d)
      records.Defunción = {
        given: d.person || d.persona,
        dni: d.dni,
        born: d.bdayDate,
        nationality: d.nacionalidad,
        origin: d.bdayPlace,
        father: d.hijoDe?.padre,
        mother: d.hijoDe?.madre,
        died: d.deathDate,
        place: d.deathPlace,
      };
    for (const values of Object.values(records))
      for (const k of Object.keys(values)) values[k] = String(values[k] ?? "");
    return { id: crypto.randomUUID(), name: b.persona, records };
  });
  for (const child of people) {
    const birth = child.records.Nacimiento;
    for (const side of ["mother", "father"]) {
      const matches = people.filter(
        (p) => p !== child && normalized(p.name) === normalized(birth[side]),
      );
      if (matches.length === 1) {
        child.parentId = matches[0].id;
        child.side = side;
        break;
      }
    }
  }
  return people;
}
