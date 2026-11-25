const key = "vista-archivo-familiar-v1";
const sample = [{id:1,surname:"Rossi",revision:0,people:[
  {id:"p1",name:"Elena Rossi",records:{Nacimiento:{given:"Elena Rossi",born:"1912-03-09",origin:"Génova"},Matrimonio:{given:"Helena Rossi",married:"1936-05-10",age:"24"}}},
  {id:"p2",name:"Clara Bianchi",parentId:"p1",side:"mother",records:{Nacimiento:{given:"Clara Bianchi",mother:"Elena Rossi",born:"1941-06-15"}}}
]}];
let families=JSON.parse(sessionStorage.getItem(key)||"null")||sample;
if (!families.some(f => f.id === -1)) {
  families.unshift({id:-1,surname:"Lombardo",revision:0,people:[
    {id:"avo",name:"Antonino Lombardo",records:{Nacimiento:{given:"Antonino Lombardo"}}},
    {id:"hijo",name:"Joaquín Lombardo",parentId:"avo",side:"father",records:{Nacimiento:{given:"Joaquín Lombardo",father:"Antonio Lombardo"}}}
  ]});
}
let signed=true;
export async function api(path,data){
  if(path==="session")return {email:signed?"cuenta de demostración":null};
  if(path==="logout"){signed=false;return {};}
  if(path==="login"||path==="register"){signed=true;return {};}
  if(path==="families"&&!data)return {families,tier:"5",offers:[]};
  if(path==="families"){
    if(families.length>=5)throw Error("Alcanzaste el límite de esta demo.");
    const id=Math.max(0,...families.map(f=>f.id))+1;
    families=[...families,{id,surname:data.surname,revision:0,people:[]}];
    sessionStorage.setItem(key,JSON.stringify(families));return {id};
  }
  const folder=families.find(f=>f.id===Number(path.split("/")[1]));
  if(!data)return structuredClone(folder);
  Object.assign(folder,structuredClone(data));folder.revision++;
  sessionStorage.setItem(key,JSON.stringify(families));return {revision:folder.revision};
}
