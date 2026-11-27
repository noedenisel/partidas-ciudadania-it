import test from "node:test";
import assert from "node:assert/strict";
import {evaluate} from "../src/records.js";
test("Identifica los dos documentos y conserva la transcripción literal",()=>{
 const family=[{id:"a",name:"Antonino",records:{Nacimiento:{given:"Antonino"}}},{id:"b",name:"Joaquín",parentId:"a",records:{Nacimiento:{given:"Joaquín",father:"Antonio"}}}];
 const {findings}=evaluate(family);assert.equal(findings.length,1);assert.equal(findings[0].person,"Antonino");assert.deepEqual(findings[0].sources.map(s=>[s.owner,s.key,s.value]),[["Joaquín","father","Antonio"],["Antonino","given","Antonino"]]);
});
test("No calcula edades con fechas parciales ni compara datos ilegibles",()=>{
 const p={id:"a",name:"Ana",records:{Nacimiento:{given:"Ana",born:"1900"},Matrimonio:{given:"A",states:{given:"Ilegible"},age:"40",married:"1930-01-01"}}};assert.deepEqual(evaluate([p]),{findings:[],comparisons:0});
});
test("Contempla el cumpleaños y detecta la defunción anterior al matrimonio",()=>{
 const p={id:"a",name:"Ana",records:{Nacimiento:{born:"1900-12-30"},Matrimonio:{married:"1925-12-29",age:"24"},Defunción:{died:"1924-11-01"}}};
 const f=evaluate([p]).findings;assert.equal(f.length,1);assert.equal(f[0].label,"Orden de los actos");
});

test("Compara el apellido dentro de una sola acta sin vincular ascendientes",()=>{
 const person={id:"1",name:"Ana Varela Díaz",records:{Nacimiento:{given:"Ana Varela Díaz",father:"Juan Barela",mother:"María Díaz"}}};
 const result=evaluate([person]).findings;
 assert.equal(result.length,1);
 assert.deepEqual(result[0].sources.map(s=>[s.type,s.key,s.value]),[
  ["Nacimiento","given","Ana Varela Díaz"],["Nacimiento","father","Juan Barela"]]);
 person.records.Nacimiento.father="Juan García";
 assert.equal(evaluate([person]).findings.length,0);
});
