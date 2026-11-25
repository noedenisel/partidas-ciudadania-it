// Private review fixture. Every tab uses an isolated synthetic account and in-memory bucket.
import {api} from "./worker/api.js";
import {MemoryBucket} from "./test/bucket.mjs";
const bucket=new MemoryBucket(),origin=location.origin;
const sid=crypto.randomUUID();
const digest=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(sid))),v=>v.toString(16).padStart(2,"0")).join("");
await bucket.put("sessions/"+digest,JSON.stringify({id:"fixture",email:"estudio@example.invalid",expires:Date.now()+86400000}));
async function send(path,method,body){
  return api({url:origin+path,method,headers:{get:name=>({origin,cookie:"sid="+sid})[name.toLowerCase()]},json:async()=>JSON.parse(body||"{}")},{BUCKET:bucket});
}
const native=window.fetch.bind(window);
window.fetch=(input,options={})=>{
 if(typeof input==="string" && input.startsWith("/api/"))return send(input,options.method||"GET",options.body);
 return native(input,options);
};
document.querySelector("#fixture-status").textContent="Prueba privada con datos ficticios. Recargá para reiniciar el ejemplo.";
await import("./app-entry.js");
