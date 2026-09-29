import { build } from "esbuild";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import vm from "node:vm";
const result = await build({entryPoints:["src/standalone-api.ts"],bundle:true,write:false,format:"iife",globalName:"adapter",plugins:[{
  name:"test-storage",setup(b) {
    b.onResolve({filter:/^\.\/storage$/},()=>({path:"memory",namespace:"test"}));
    b.onLoad({filter:/.*/,namespace:"test"},()=>({contents:"const state = new Map(); export async function read(k,f){return state.get(k) ?? f} export async function write(k,v){state.set(k,structuredClone(v))}"}));
  }
}]});
const context = vm.createContext({crypto:webcrypto,TextEncoder,Uint8Array,btoa,atob,structuredClone,console});
vm.runInContext(result.outputFiles[0].text,context);
const api = context.adapter.standaloneApi;
const records = await api("/records","GET");
assert.equal(records.length,3);
const id = records[0].id;
let bundle = await api(`/records/${id}/bundle`,"GET");
assert.equal((await api("/verify","POST",bundle)).valid,true);
const altered = structuredClone(bundle); altered.body.record.payload.intake.bag_id = "TAMPER";
assert.equal((await api("/verify","POST",altered)).valid,false);
const intake = {...records[0].payload.intake,client_id:webcrypto.randomUUID(),case_ref:"DEMO/LOCAL/TEST"};
const created = await api("/records","POST",intake);
assert.equal((await api("/records","POST",intake)).id,created.id);
await assert.rejects(api("/records","POST",{...intake,bag_id:"DIFFERENT"}));
await assert.rejects(api("/records","POST",{...intake,client_id:webcrypto.randomUUID(),kit_id:"FS-EXPIRED"}));
const upload = await api("/records","POST",{...intake,client_id:webcrypto.randomUUID(),scenario:"clear",image:"data:image/png;base64,AQID"});
assert.equal(upload.payload.result.outcome,"Inconclusive");
await api(`/records/${id}/custody`,"POST",{actor:"Demo officer",recipient:"Demo lab",note:"Training handover"});
await api(`/records/${id}/lab`,"POST",{actor:"Demo lab",reference:"LAB-DEMO",outcome:"Not confirmed",note:"Manual demo result"});
await assert.rejects(api(`/records/${id}/lab`,"POST",{actor:"Demo lab",reference:"LAB-DEMO",outcome:"Confirmed",note:"Duplicate"}));
bundle = await api(`/records/${id}/bundle`,"GET");
assert.equal(bundle.body.record.events.length,3);
assert.equal((await api("/verify","POST",bundle)).valid,true);
bundle.body.record.events.pop();
assert.equal((await api("/verify","POST",bundle)).valid,false);
assert.equal((await api("/verify","POST",{})).valid,false);
console.log("Standalone checks passed: seed, signing, tampering, retry, conflict, expiry, uploaded-photo review, custody/lab, truncation and malformed bundle.");
