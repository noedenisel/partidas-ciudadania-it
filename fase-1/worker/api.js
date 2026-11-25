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
    if(post && request.headers.get("Origin")!==url.origin)fail(403,"Origen inválido.");
    const cookies=Object.fromEntries((request.headers.get("Cookie")||"").split(";").map(v=>v.trim().split("=")));
    const bucket=env.BUCKET;
    const sid=cookies.sid;
    const sessionKey=sid?"sessions/"+await hash(sid):null;
    const session=sessionKey?await (await bucket.get(sessionKey))?.json():null;
    const account=session?.expires>Date.now()?session:null;
    const google=Boolean(env.GOOGLE_CLIENT_ID&&env.GOOGLE_CLIENT_SECRET);
    if(route==="session")return reply({email:account?.email,google});
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
      const response=await login(bucket,{id:await hash("google:"+user.sub),email:user.email});
      const headers=new Headers(response.headers);headers.append("Set-Cookie",cookie("oauth","",0));headers.set("Location","/");
      return new Response(null,{status:302,headers});
    }
    const data=post?await request.json():{};
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
      return login(bucket,{id,email});
    }
    if(!account)fail(401,"Iniciá sesión.");
    if(route==="logout"&&post){await bucket.delete(sessionKey);return reply({},{"Set-Cookie":cookie("sid","",0)});}
    const familyKey="folders/"+account.id,stored=await bucket.get(familyKey);
    const subscription = await (await bucket.get("subscriptions/"+account.id))?.json();
    const tier = ["5","10","unlimited"].includes(subscription?.tier) ? subscription.tier : "1";
    const state = readWorkspace(stored ? await stored.json() : [], tier);
    const families=state.families, assigned=capacity(state), consumed=state.uses.length;
    if(route==="families"&&!post)return reply({tier,offers:[],assigned,consumed,available:assigned===null?null:Math.max(0,assigned-consumed),families:families.map(({id,surname,revision,archived=false})=>({id,surname,revision,archived}))});
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
      if(marked.length>1 || marked.some(p=>p.parentId) || (existingAvo && marked[0]?.id!==existingAvo.id))
        fail(400,"El AVO es la cabeza de la línea y no puede tener un ascendiente vinculado.");
      folder.people=data.people;result={revision:++folder.revision};
    }
    }
    const saved=await bucket.put(familyKey,JSON.stringify(state),{onlyIf:stored?{etagMatches:stored.etag}:{etagDoesNotMatch:"*"}});
    if(!saved)fail(409,"La carpeta cambió en otra sesión. Volvé a abrirla.");
    return reply(result);
  }catch(e){return Response.json({error:e.status?e.message:"No se pudo completar la operación."},{status:e.status||500});}
}
