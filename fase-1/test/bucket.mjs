// Conditional writes and snapshot reads matching the subset used by the Worker.
export class MemoryBucket {
  rows=new Map();
  async get(key){
    const row=this.rows.get(key);
    return row ? {etag:row.etag,json:async()=>JSON.parse(row.payload)} : null;
  }
  async put(key,payload,{onlyIf={}}={}){
    const old=this.rows.get(key);
    if(onlyIf.etagDoesNotMatch==="*" && old || onlyIf.etagMatches && onlyIf.etagMatches!==old?.etag)return null;
    const etag=crypto.randomUUID();
    this.rows.set(key,{etag,payload});
    return {etag};
  }
  async delete(key){this.rows.delete(key);}
}
