import test from "node:test";
import assert from "node:assert/strict";
import {sandboxBilling} from "../worker/paypal.js";
test("permite retomar la aprobación pendiente sin crear otra suscripción",async t=>{
 const calls=[];
 t.mock.method(globalThis,"fetch",async url=>{
  calls.push(url);
  return Response.json(url.endsWith("/token")?{access_token:"test"}:{status:"APPROVAL_PENDING",subscriber:{email_address:"privado"},links:[{rel:"approve",href:"https://www.sandbox.paypal.com/approve"}]});
 });
 const env={PAYPAL_SANDBOX_ID:"test",PAYPAL_SANDBOX_SECRET:"test",PAYPAL_SANDBOX_WEBHOOK:"test",BUCKET:{get:async()=>({json:async()=>({id:"I-123"})})}};
 const status=await sandboxBilling("billing/status",null,env,{id:"test"},{},"https://example.test");
 assert.deepEqual(status,{id:"I-123",status:"APPROVAL_PENDING",resume:"https://www.sandbox.paypal.com/approve"});
 assert.equal(calls.length,2);
});
