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

for(const status of ["CANCELLED","EXPIRED","ACTIVE","APPROVAL_PENDING"]){
 test("nueva contratación desde "+status,async t=>{
  const canRestart=["CANCELLED","EXPIRED"].includes(status);
  let writes=0;
  const bucket={
   get:async()=>({etag:"v1",json:async()=>({id:"I-OLD"})}),
   put:async(key,value,opts)=>{
    assert.deepEqual(opts.onlyIf,{etagMatches:"v1"});
    assert.equal(JSON.parse(value).id,"I-NEW");writes++;return {};
   }
  };
  t.mock.method(globalThis,"fetch",async(url,opts)=>{
   if(url.endsWith("/token"))return Response.json({access_token:"test"});
   if(url.endsWith("/I-OLD"))return Response.json({status});
   assert.ok(canRestart);
   assert.equal(opts.headers["PayPal-Request-Id"],"restart-I-OLD");
   return Response.json({id:"I-NEW",links:[{rel:"approve",href:"https://www.sandbox.paypal.com/approve"}]});
  });
  const env={BUCKET:bucket,PAYPAL_SANDBOX_ID:"id",PAYPAL_SANDBOX_SECRET:"secret",PAYPAL_SANDBOX_WEBHOOK:"hook",PAYPAL_SANDBOX_PLAN_5:"plan"};
  const action=sandboxBilling("billing/create",null,env,{id:"test"},{tier:"5"},"https://example.test");
  if(canRestart)assert.ok((await action).url);
  else await assert.rejects(action,{status:409});
  assert.equal(writes,canRestart?1:0);
 });
}
