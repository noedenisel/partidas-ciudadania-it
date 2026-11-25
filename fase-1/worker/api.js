import {evaluate,types} from "../src/records.js";
import {sandboxBilling} from "./paypal.js";
import {readWorkspace, capacity, createCase} from "./ledger.js";
const hex = bytes => Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2,"0")).join("");
const random = () => hex(crypto.getRandomValues(new Uint8Array(32)));
const encode = value => new TextEncoder().encode(value);
const hash = async value => hex(await crypto.subtle.digest("SHA-256",encode(value)));
async function passwordHash(password,salt){
  const key=await crypto.subtle.importKey("raw",encode(password),"PBKDF2",false,["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:encode(salt),iterations:100000},key,256));
}
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const reply=(data,headers={})=>Response.json(data,{headers:{"Cache-Control":"no-store",...headers}});
const cookie=(name,value,age)=>name+"="+value+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age="+age;
async function login(bucket,account){
  const sid=random(),days=7*86400;
  await bucket.put("sessions/"+await hash(sid),JSON.stringify({...account,expires:Date.now()+days*1000}));
  return reply({email:account.email},{"Set-Cookie":cookie("sid",sid,days)});
}
export async function api(request,env){
  try{
    const url=new URL(request.url),route=url.pathname.slice(5),post=request.method==="POST";
    if(post && route!=="billing/webhook" && request.headers.get("Origin")!==url.origin)fail(403,"Origen inválido.");
    const cookies=Object.fromEntries((request.headers.get("Cookie")||"").split(";").map(v=>v.trim().split("=")));
    const bucket=env.BUCKET;
    const sid=cookies.sid;
    const sessionKey=sid?"sessions/"+await hash(sid):null;
    const session=sessionKey?await (await bucket.get(sessionKey))?.json():null;
    let account=session?.expires>Date.now()?session:null;
    const accountRecord=account?await(await bucket.get("accounts/"+account.id))?.json():null;
    if(account && (account.epoch||0)!==(accountRecord?.epoch||0))account=null;
    const google=Boolean(env.GOOGLE_CLIENT_ID&&env.GOOGLE_CLIENT_SECRET);
    if(route==="session")return reply({email:account?.email,google,verified:!!accountRecord?.verified,mailReady:!!env.MAILER,profile:accountRecord?.profile||"",sandbox:!!env.PAYPAL_SANDBOX_WEBHOOK});
    if(route==="google/link" && google && post && account){
      const data=await request.json(),row=accountRecord;
      if(!row?.verifier||typeof data.password!=="string"||data.password.length>256||await passwordHash(data.password,row.salt)!==row.verifier)fail(403,"Confirmá tu contraseña para vincular Google.");
      const state=random();await bucket.put("oauth-link/"+await hash(state),JSON.stringify({account:account.id,sessionKey,expires:Date.now()+600000}));
      const params=new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,redirect_uri:url.origin+"/api/google/callback",scope:"openid email",response_type:"code",state});
      return reply({url:"https://accounts.google.com/o/oauth2/v2/auth?"+params},{"Set-Cookie":cookie("oauth",state,600)});
    }
    if(route==="google" && google){
      const state=random();
      const params=new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,redirect_uri:url.origin+"/api/google/callback",scope:"openid email",response_type:"code",state});
      return new Response(null,{status:302,headers:{Location:"https://accounts.google.com/o/oauth2/v2/auth?"+params,"Set-Cookie":cookie("oauth",state,600)}});
    }
    if(route==="google/callback" && google){
      if(!cookies.oauth || cookies.oauth!==url.searchParams.get("state"))fail(403,"Volvé a iniciar el acceso con Google.");
      const exchange=await fetch("https://oauth2.googleapis.com/token",{method:"POST",body:new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,redirect_uri:url.origin+"/api/google/callback",grant_type:"authorization_code",code:url.searchParams.get("code")||""})});
      if(!exchange.ok)fail(401,"No se completó el ingreso con Google.");
      const {access_token}=await exchange.json();
      const info=await fetch("https://openidconnect.googleapis.com/v1/userinfo",{headers:{Authorization:"Bearer "+access_token}});
      const user=await info.json();
      if(!info.ok||!user.email_verified||!user.sub)fail(401,"No se pudo verificar la cuenta de Google.");
      const googleId=await hash("google:"+user.sub),aliasKey="google-links/"+googleId;
      const alias=await(await bucket.get(aliasKey))?.json(),linkKey="oauth-link/"+await hash(cookies.oauth),intent=await(await bucket.get(linkKey))?.json();
      let owner=alias?.id||googleId;
      if(intent){
        if(!account||intent.account!==account.id||intent.sessionKey!==sessionKey||intent.expires<Date.now()||user.email.toLowerCase()!==account.email.toLowerCase())fail(403,"El vínculo requiere la misma sesión y correo verificado.");
        if((alias&&alias.id!==account.id)||(!alias&&await bucket.get("folders/"+googleId)))fail(409,"La identidad de Google ya tiene datos. Hace falta una conciliación para conservar ambos historiales.");
        if(!alias&&!await bucket.put(aliasKey,JSON.stringify({id:account.id}),{onlyIf:{etagDoesNotMatch:"*"}}))fail(409,"Reintentá la vinculación.");
        owner=account.id;await bucket.delete(linkKey);
      }else if(!alias && await bucket.get("accounts/"+await hash("mail:"+user.email.toLowerCase())) && !await bucket.get("folders/"+googleId)){
        return new Response(null,{status:302,headers:{Location:"/?acceso&vincular=1","Set-Cookie":cookie("oauth","",0)}});
      }
      const record=await(await bucket.get("accounts/"+owner))?.json();
      const response=await login(bucket,{id:owner,email:user.email,epoch:record?.epoch||0});
      const headers=new Headers(response.headers);headers.append("Set-Cookie",cookie("oauth","",0));headers.set("Location","/");
      return new Response(null,{status:302,headers});
    }
    if(Number(request.headers.get("Content-Length"))>1500000)fail(413,"Superaste el tamaño admitido.");
    let data={};
    if(post){
      if(request.arrayBuffer){
        const reader=request.body?.getReader();const chunks=[];let size=0;
        if(reader){for(;;){const {done,value}=await reader.read();if(done)break;
          size+=value.length;if(size>1500000){await reader.cancel();fail(413,"Superaste el tamaño admitido.");}chunks.push(value);}}
        try{data=JSON.parse(await new Blob(chunks).text());}catch{fail(400,"Formato de solicitud inválido.");}
      }else data=await request.json();
    }
    if(route.startsWith("billing/")&&(post||route==="billing/status")){
      if(route!=="billing/webhook"&&!account)fail(401,"Iniciá sesión.");
      if(route==="billing/webhook"&&!post)fail(405,"Método no admitido.");
      return reply(await sandboxBilling(route,request,env,account,data,url.origin));
    }
    if(post&&["login","register","recover","verification","reset","verify"].includes(route)){
      const ip=request.headers.get("CF-Connecting-IP")||"preview";
      const slot=Math.floor(Date.now()/600000),key="throttle/"+await hash(ip)+"/"+slot;
      const obj=await bucket.get(key),attempts=obj?await obj.json():0;
      if(attempts>=40)fail(429,"Demasiados intentos. Volvé a probar en diez minutos.");
      if(!await bucket.put(key,JSON.stringify(attempts+1),{onlyIf:obj?{etagMatches:obj.etag}:{etagDoesNotMatch:"*"}}))fail(429,"Reintentá en un momento.");
    }
    if(post&&["recover","verification"].includes(route)){
      if(!env.MAILER)fail(503,"El envío de correos aún no está habilitado.");
      if(route==="verification"&&!account)fail(401,"Iniciá sesión.");
      const email=route==="recover"?String(data.email||"").trim().toLowerCase():account.email;
      const id=route==="recover"?await hash("mail:"+email):account.id;
      const key="accounts/"+id,obj=await bucket.get(key);
      if(obj){
        const value=await obj.json(),secret=random();
        const purpose=route==="recover"?"reset":"verify";
        value[purpose]={hash:await hash(secret),expires:Date.now()+1800000};
        if(!await bucket.put(key,JSON.stringify(value),{onlyIf:{etagMatches:obj.etag}}))fail(409,"Reintentá la solicitud.");
        await env.MAILER.send({to:email,purpose,url:url.origin+"/?acceso#"+new URLSearchParams({purpose,id,token:secret})});
      }
      return reply({});
    }
    if(post&&["reset","verify"].includes(route)){
      if(!/^[a-f0-9]{64}$/.test(data.id)||!/^([a-f0-9]{64})$/.test(data.token))fail(400,"Enlace inválido.");
      const key="accounts/"+data.id,obj=await bucket.get(key),value=await obj?.json();
      if(!value?.[route]||value[route].expires<Date.now()||value[route].hash!==await hash(data.token))fail(400,"El enlace venció o ya se usó.");
      if(route==="reset"){
        if(typeof data.password!=="string"||data.password.length<10||data.password.length>256)fail(400,"Usá entre 10 y 256 caracteres.");
        value.salt=random();value.verifier=await passwordHash(data.password,value.salt);value.epoch=(value.epoch||0)+1;
      }else value.verified=true;
      delete value[route];
      if(!await bucket.put(key,JSON.stringify(value),{onlyIf:{etagMatches:obj.etag}}))fail(409,"El enlace ya se utilizó.");
      return reply({});
    }
    if(route==="profile"&&post&&account){
      const key="accounts/"+account.id,obj=await bucket.get(key),v=await obj?.json()||{};
      if(typeof data.name!=="string"||data.name.length>150)fail(400,"Revisá el nombre del estudio.");
      v.profile=data.name.trim();if(!await bucket.put(key,JSON.stringify(v),{onlyIf:obj?{etagMatches:obj.etag}:{etagDoesNotMatch:"*"}}))fail(409,"Actualizá el perfil y reintentá.");return reply({});
    }
    if(post&&["login","register"].includes(route)){
      const email=String(data.email||"").trim().toLowerCase();
      if(!/^\S+@\S+\.\S+$/.test(email)||email.length>254||typeof data.password!=="string"||data.password.length>256)fail(400,"Revisá el correo y la contraseña.");
      const id=await hash("mail:"+email),key="accounts/"+id;
      if(route==="register"){
        if(data.password.length<10)fail(400,"Usá al menos 10 caracteres.");
        const salt=random();
        const saved=await bucket.put(key,JSON.stringify({salt,verifier:await passwordHash(data.password,salt)}),{onlyIf:{etagDoesNotMatch:"*"}});
        if(!saved)fail(409,"Ya existe una cuenta con ese correo.");
      }else{
        const stored=await (await bucket.get(key))?.json();
        const check=await passwordHash(data.password,stored?.salt||id);
        if(!stored||check!==stored.verifier)fail(401,"Correo o contraseña incorrectos.");
      }
      return login(bucket,{id,email,epoch:(await(await bucket.get(key)).json()).epoch||0});
    }
    if(!account)fail(401,"Iniciá sesión.");
    if(route==="logout"&&post){await bucket.delete(sessionKey);return reply({},{"Set-Cookie":cookie("sid","",0)});}
    const familyKey="folders/"+account.id,stored=await bucket.get(familyKey);
    const subscription = await (await bucket.get("subscriptions/"+account.id))?.json();
    const tier = ["5","10","unlimited"].includes(subscription?.tier) ? subscription.tier : "1";
    const state = readWorkspace(stored ? await stored.json() : [], tier);
    const families=state.families, assigned=capacity(state), consumed=state.uses.length;
    if(route==="families"&&!post)return reply({tier,offers:[],assigned,consumed,available:assigned===null?null:Math.max(0,assigned-consumed),families:families.map(f=>{
      const {id,surname,revision,archived=false,status,updatedAt,people}=f;
      const pending=evaluate(people).findings.filter(v=>{const last=f.reviews?.[v.id]?.at(-1);return !last||last.evidence!==JSON.stringify(v.lines)||!["Resuelta","Revisada"].includes(last.status);}).length;
      const recordCount=people.reduce((n,p)=>n+Object.keys(types).reduce((a,t)=>a+[p.records[t],...(p.versions?.[t]||[]).map(v=>v.data)].filter(r=>r&&Object.values(r).some(v=>typeof v==="string"&&v.trim())).length,0),0);
      return {id,surname,revision,archived,status,updatedAt,peopleCount:people.length,recordCount,pending};
    })});
    let result;
    if(route==="families"&&post){
      result=createCase(state,data);
      if(result.repeated)return reply({id:result.id});
    }else{
      const folder=families.find(f=>route==="families/"+f.id);
      if(!folder)fail(404,"Carpeta no disponible.");
      if(!post)return reply(folder);
      if(data.revision!==folder.revision)fail(409,"La carpeta cambió en otra sesión.");
      if(data.action==="delete"){
        families.splice(families.indexOf(folder),1);result={deleted:true};
      }else if(["archive","restore"].includes(data.action)){
        folder.archived=data.action==="archive";result={revision:++folder.revision};
      }else{
      if(!Array.isArray(data.people)||JSON.stringify(data.people).length>1000000)fail(400,"Revisá los datos de la carpeta.");
      const marked = data.people.filter(p=>p?.role==="avo");
      const existingAvo = folder.people.find(p=>p.role==="avo");
      if(marked.length>1 || marked.some(p=>p.parentId) || (existingAvo && data.people.some(p=>p.id===existingAvo.id) && marked[0]?.id!==existingAvo.id))
        fail(400,"El AVO es la cabeza de la línea y no puede tener un ascendiente vinculado.");
      const validDoc=d=>d&&typeof d==="object"&&!Array.isArray(d)&&Object.entries(d).every(([k,v])=>typeof v==="string"||(k==="states"&&v&&typeof v==="object"&&Object.values(v).every(x=>typeof x==="string")));
      if(data.people.some(p=>!p||!p.records||!Object.entries(p.records).every(([t,d])=>Object.hasOwn(types,t)&&validDoc(d))||!Object.entries(p.versions||{}).every(([t,vs])=>Object.hasOwn(types,t)&&Array.isArray(vs)&&vs.every(v=>typeof v?.id==="string"&&validDoc(v.data)))))fail(400,"Revisá las partidas y sus versiones.");
      const ids=new Set(data.people.map(p=>p?.id));
      if(ids.size!==data.people.length || data.people.some(p=>typeof p?.id!=="string" || typeof p.name!=="string" || !p.name.trim() || !p.records || typeof p.records!=="object"))fail(400,"Revisá las personas del expediente.");
      const byId=new Map(data.people.map(p=>[p.id,p]));
      const parents=new Set();
      for(const p of data.people){
        if(!p.parentId)continue;
        if(!ids.has(p.parentId)||parents.has(p.parentId))fail(400,"Revisá los vínculos de la línea directa.");
        parents.add(p.parentId);
        const seen=new Set([p.id]);let node=p;
        while(node.parentId){if(seen.has(node.parentId))fail(400,"El vínculo generaría un ciclo.");seen.add(node.parentId);node=byId.get(node.parentId);if(!node)fail(400,"Ascendiente desconocido.");}
      }
      for(const k of ["surname","country","internal","applicant","notes","status"]){
        if(data[k]===undefined)continue;
        if(typeof data[k]!=="string"||data[k].length>(k==="surname"?100:1000)||(k==="surname"&&!data[k].trim()))fail(400,"Revisá los datos del expediente.");
        folder[k]=data[k];
      }
      if(data.reviews!==undefined){
        if(!data.reviews||typeof data.reviews!=="object"||Array.isArray(data.reviews)||JSON.stringify(data.reviews).length>1000000)fail(400,"Revisá el informe.");
        folder.reviews=data.reviews;
      }
      folder.updatedAt=new Date().toISOString();
      folder.people=data.people;result={revision:++folder.revision};
    }
    }
    const saved=await bucket.put(familyKey,JSON.stringify(state),{onlyIf:stored?{etagMatches:stored.etag}:{etagDoesNotMatch:"*"}});
    if(!saved)fail(409,"La carpeta cambió en otra sesión. Volvé a abrirla.");
    return reply(result);
  }catch(e){return Response.json({error:e.status?e.message:"No se pudo completar la operación."},{status:e.status||500});}
}
