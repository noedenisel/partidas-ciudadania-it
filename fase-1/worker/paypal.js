// Sandbox only. A verified provider state never creates new quota grants by itself.
export async function sandboxBilling(route,request,env,account,data,origin){
 const base="https://api-m.sandbox.paypal.com",bucket=env.BUCKET;
 if(!env.PAYPAL_SANDBOX_ID||!env.PAYPAL_SANDBOX_SECRET||!env.PAYPAL_SANDBOX_WEBHOOK)throw Object.assign(Error("PayPal Sandbox aún no está configurado."),{status:503});
 const token=await fetch(base+"/v1/oauth2/token",{method:"POST",headers:{Authorization:"Basic "+btoa(env.PAYPAL_SANDBOX_ID+":"+env.PAYPAL_SANDBOX_SECRET),"Content-Type":"application/x-www-form-urlencoded"},body:"grant_type=client_credentials"});
 if(!token.ok)throw Error("Sandbox no disponible");
 const auth="Bearer "+(await token.json()).access_token;
 async function remote(path,body,key){
  const headers={Authorization:auth,"Content-Type":"application/json"};if(key)headers["PayPal-Request-Id"]=key;
  const res=await fetch(base+path,{method:body?"POST":"GET",headers,body:body?JSON.stringify(body):undefined});
  if(!res.ok)throw Object.assign(Error("PayPal no confirmó la operación de prueba."),{status:502});return res.status===204?{}:res.json();
 }
 if(route==="billing/webhook"){
  const h=k=>request.headers.get("paypal-"+k);
  const verification=await remote("/v1/notifications/verify-webhook-signature",{auth_algo:h("auth-algo"),cert_url:h("cert-url"),transmission_id:h("transmission-id"),transmission_sig:h("transmission-sig"),transmission_time:h("transmission-time"),webhook_id:env.PAYPAL_SANDBOX_WEBHOOK,webhook_event:data});
  if(verification.verification_status!=="SUCCESS")throw Object.assign(Error("Notificación no verificada."),{status:403});
  const resource=data.resource||{},id=resource.billing_agreement_id||resource.id;
  if(!/^I-[A-Z0-9]+$/.test(id)||!data.id)return {};
  const sub=await remote("/v1/billing/subscriptions/"+id),owner=sub.custom_id;
  if(!/^[0-9a-f]{64}$/.test(owner))return {};
  const link=await(await bucket.get("billing/"+owner))?.json();
  if(link?.id!==id)return {};
  await bucket.put("payment-events/"+owner+"/"+data.id,JSON.stringify({type:data.event_type,at:data.create_time,status:sub.status,amount:resource.amount?.total||null}),{onlyIf:{etagDoesNotMatch:"*"}});
  return {};
 }
 if(!account)throw Object.assign(Error("Iniciá sesión."),{status:401});
 const key="billing/"+account.id,entry=await bucket.get(key),local=await entry?.json();
 if(route==="billing/status"){
  if(!local)return {status:"SIN_SUSCRIPCION"};
  const sub=await remote("/v1/billing/subscriptions/"+local.id);
  const resume=sub.status==="APPROVAL_PENDING"?sub.links?.find(link=>link.rel==="approve")?.href:null;
  return {id:local.id,status:sub.status,resume};
 }
 const plan=env["PAYPAL_SANDBOX_PLAN_"+data.tier];
 if(route==="billing/cancel"&&local){await remote("/v1/billing/subscriptions/"+local.id+"/cancel",{reason:"Cancelación solicitada por el titular"});return {};}
 if(!["5","10","unlimited"].includes(data.tier)||!plan)throw Object.assign(Error("Plan de prueba no disponible."),{status:400});
 if(route==="billing/change"&&local){const r=await remote("/v1/billing/subscriptions/"+local.id+"/revise",{plan_id:plan,application_context:{return_url:origin+"/?trabajo",cancel_url:origin+"/?trabajo"}});return {url:r.links?.find(l=>l.rel==="approve")?.href};}
 if(route!=="billing/create")throw Object.assign(Error("Revisá tu suscripción actual."),{status:409});
 if(local){
  const previous=await remote("/v1/billing/subscriptions/"+local.id);
  if(!["CANCELLED","EXPIRED"].includes(previous.status))throw Object.assign(Error("Ya hay una suscripción en curso."),{status:409});
 }
 const requestId=local?"restart-"+local.id:"sandbox-"+account.id.slice(0,26);
 const sub=await remote("/v1/billing/subscriptions",{plan_id:plan,custom_id:account.id,application_context:{return_url:origin+"/?trabajo",cancel_url:origin+"/?trabajo"}},requestId);
 const saved=await bucket.put(key,JSON.stringify({id:sub.id}),{onlyIf:entry?{etagMatches:entry.etag}:{etagDoesNotMatch:"*"}});
 if(!saved)throw Object.assign(Error("La suscripción cambió. Consultá su estado."),{status:409});
 return {url:sub.links.find(l=>l.rel==="approve")?.href};
}
