import test from 'node:test';
import assert from 'node:assert/strict';
import {MemoryBucket} from './bucket.mjs';
import {api} from '../worker/api.js';
import {readWorkspace} from '../worker/ledger.js';
const origin='https://test.invalid';
async function setup(tier="1"){
  const bucket=new MemoryBucket();
  let cookie="";
  async function request(path,data,from=origin){
    const res=await api(new Request(origin+"/api/"+path,{method:data?"POST":"GET",headers:{origin:from,cookie},body:data?JSON.stringify(data):undefined}),{BUCKET:bucket});
    if(res.headers.has("set-cookie"))cookie=res.headers.get("set-cookie").split(";")[0];
    return {status:res.status,...await res.json()};
  }
  const credentials={email:"prueba@example.invalid",password:"clave ficticia de prueba"};
  assert.equal((await request("register",credentials)).status,200);
  const owner=Array.from(bucket.rows.keys()).find(k=>k.startsWith("accounts/")).slice(9);
  await bucket.put("subscriptions/"+owner,JSON.stringify({tier}));
  const create=()=>({surname:"Ejemplo",requestId:crypto.randomUUID()});
  return {bucket,owner,request,credentials,create};
}
for(const tier of ["1","5","10"])test("Cupo "+tier+" · archivo, restauración, eliminación y reintento",async()=>{
 const {request,create}=await setup(tier);const first=create();
 for(let i=0;i<Number(tier);i++) assert.equal((await request("families",i?create():first)).status,200);
 assert.equal((await request("families",first)).id,1);
 await request("families/1",{action:"archive",revision:0});await request("families/1",{action:"restore",revision:1});
 assert.equal((await request("families/1",{action:"delete",revision:2})).status,200);
 assert.equal((await request("families",first)).status,410);
 assert.equal((await request("families",create())).status,403);
 const d=await request("families");assert.equal(d.available,0);assert.equal(d.consumed,Number(tier));assert.equal(d.families.length,Number(tier)-1);
});
test("Creaciones concurrentes, datos inválidos y origen no autorizado",async()=>{
 const {request,create}=await setup();assert.equal((await request("families",{...create(),surname:" "})).status,400);
 assert.equal((await request("families",create(),"https://otro.invalid")).status,403);
 assert.equal((await request("families")).consumed,0);
 const results=await Promise.all([request("families",create()),request("families",create())]);
 assert.equal(results.filter(r=>r.status===200).length,1);assert.equal((await request("families")).consumed,1);
});
test("Error de escritura y reintento",async()=>{
 const {request,create,bucket}=await setup();const data=create(),put=bucket.put.bind(bucket);
 bucket.put=async()=>{throw Error("simulated");};assert.equal((await request("families",data)).status,500);
 bucket.put=put;assert.equal((await request("families")).consumed,0);
 assert.equal((await request("families",data)).status,200);assert.equal((await request("families",data)).id,1);
});
test("Migración compatible sin escritura en lectura y aislamiento entre cuentas",async()=>{
 const {request,owner,bucket,credentials}=await setup();const key="folders/"+owner;
 const old=[{id:4,surname:"Ejemplo",people:[],revision:3}];await bucket.put(key,JSON.stringify(old));
 assert.equal((await request("families")).consumed,1);assert.deepEqual(await(await bucket.get(key)).json(),old);
 await request("families/4",{action:"archive",revision:3});
 const state=await(await bucket.get(key)).json();assert.deepEqual(readWorkspace(state,"1"),state);
 await request("logout",{});assert.equal((await request("families/4")).status,401);
 await request("register",{...credentials,email:"otro@example.invalid"});assert.equal((await request("families/4")).status,404);
 await request("logout",{});await request("login",credentials);assert.equal((await request("families")).available,0);
});
