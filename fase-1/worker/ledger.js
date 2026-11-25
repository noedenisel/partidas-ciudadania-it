// A single conditional object write commits document and ledger changes together.
export function readWorkspace(raw, tier) {
  if (raw?.schema === 2) return raw;
  if (!Array.isArray(raw)) throw Error("Formato de almacenamiento desconocido.");
  return {
    schema: 2,
    families: raw,
    grants: [{source: "initial", amount: tier === "unlimited" ? null : Number(tier)}],
    uses: raw.map(f => ({id:f.id, requestId:"legacy-"+f.id, source:"migration"}))
  };
}
export function capacity(state) {
  if (state.grants.some(g => g.amount === null)) return null;
  return state.grants.reduce((total,g) => total+g.amount,0);
}
export function createCase(state, data) {
  const surname=typeof data.surname==="string"?data.surname.trim():"";
  if (!surname || surname.length>100) throw Object.assign(Error("Revisá el apellido de referencia."),{status:400});
  if (!/^[a-f0-9-]{36}$/i.test(data.requestId||"")) throw Object.assign(Error("Falta el identificador de creación."),{status:400});
  const prior=state.uses.find(u=>u.requestId===data.requestId);
  if(prior) {
    if(!state.families.some(f=>f.id===prior.id)) throw Object.assign(Error("El expediente de esta solicitud fue eliminado."),{status:410});
    return {id:prior.id,repeated:true};
  }
  const limit=capacity(state);
  if(limit!==null && state.uses.length>=limit) throw Object.assign(Error("Agotaste los cupos de creación de tu plan."),{status:403});
  const id=state.uses.reduce((max,u)=>Math.max(max,u.id),0)+1;
  state.families.push({id,surname,people:[],revision:0});
  state.uses.push({id,requestId:data.requestId,at:new Date().toISOString()});
  return {id};
}
