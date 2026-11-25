import fs from "node:fs";
import path from "node:path";
const output=process.argv[2];
if(!output||fs.existsSync(output))throw Error("Indicá un directorio nuevo.");
fs.cpSync("dist",output,{recursive:true,filter:p=>path.basename(p)!=="server"});
for (const name of ["src/records.js","worker/paypal.js","worker/api.js","worker/ledger.js","test/bucket.mjs","preview/start.js"]){
 const dest=path.join(output,name==="preview/start.js"?"start.js":name);
 fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(name,dest);
}
const index=path.join(output,"index.html"),html=fs.readFileSync(index,"utf8");
const entry=html.match(/src="(\/assets\/[^"]+\.js)"/)[1];
fs.writeFileSync(path.join(output,"app-entry.js"),"import "+JSON.stringify(entry)+";");
fs.writeFileSync(index,html.replace(entry,"/start.js").replace('<div id="root">','<p id="fixture-status" style="margin:0;padding:.5rem;text-align:center;background:#f6eac7"></p><div id="root">'));
