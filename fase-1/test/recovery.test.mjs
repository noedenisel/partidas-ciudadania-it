import test from "node:test";import assert from "node:assert/strict";import {api} from "../worker/api.js";import {MemoryBucket} from "./bucket.mjs";
test("Verifica correo, rechaza el segundo uso y revoca la sesión tras recuperar la contraseña",async()=>{
 let message,cookie="";const origin="https://test.invalid",env={BUCKET:new MemoryBucket(),MAILER:{send:async m=>{message=m;}}};
 async function call(route,body){const res=await api(new Request(origin+"/api/"+route,{method:body?"POST":"GET",headers:{origin,cookie},body:body?JSON.stringify(body):undefined}),env);if(res.headers.has("set-cookie"))cookie=res.headers.get("set-cookie").split(";")[0];return {status:res.status,...await res.json()};}
 const data={email:"demo@example.invalid",password:"1234567890abc"};await call("register",data);await call("verification",{});
 const fields=()=>Object.fromEntries(new URLSearchParams(new URL(message.url).hash.slice(1)));
 assert.equal((await call("verify",fields())).status,200);assert.equal((await call("verify",fields())).status,400);assert.equal((await call("session")).verified,true);
 await call("recover",{email:data.email});assert.equal((await call("reset",{...fields(),password:"otra-clave-larga"})).status,200);assert.equal((await call("families")).status,401);
 assert.equal((await call("login",data)).status,401);assert.equal((await call("login",{...data,password:"otra-clave-larga"})).status,200);
});
