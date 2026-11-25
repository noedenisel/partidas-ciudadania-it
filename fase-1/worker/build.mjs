import fs from "node:fs";
import path from "node:path";
const assets={};
for(const name of ["index.html",...fs.readdirSync("dist/assets").map(f=>"assets/"+f)]){
  assets["/"+name]=[fs.readFileSync("dist/"+name,"utf8"),{".html":"text/html; charset=utf-8",".css":"text/css",".js":"application/javascript"}[path.extname(name)]];
}
fs.mkdirSync("dist/server",{recursive:true});
fs.writeFileSync("dist/server/index.js",fs.readFileSync("src/records.js","utf8")+"\n"+fs.readFileSync("worker/paypal.js","utf8")+"\n"+fs.readFileSync("worker/ledger.js","utf8")+"\n"+fs.readFileSync("worker/api.js","utf8").replace(/^import .*;$/gm,"")+"\nconst assets="+JSON.stringify(assets)+`;
export default {fetch(request,env){
  const pathname=new URL(request.url).pathname;
  if(pathname.startsWith("/api/"))return api(request,env);
  const asset=assets[pathname==="/"?"/index.html":pathname];
  return asset?new Response(asset[0],{headers:{"Content-Type":asset[1]}}):new Response("No encontrado",{status:404});
}};`);
