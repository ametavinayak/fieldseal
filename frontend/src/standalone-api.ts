import { read, write } from "./storage";
import type { AuditEvent, Evidence, Intake, Kit, Scenario, Verification } from "./types";

// Separate browser-only demonstration store. No server keys or evidence are bundled.
type State = { records: Evidence[]; kits: Kit[]; privateKey: JsonWebKey; publicKey: JsonWebKey };
type Bundle = { format: string; body: { record: Evidence; public_key: JsonWebKey }; signature: string };
let state: State;
let ready: Promise<void> | undefined;
let serial: Promise<unknown> = Promise.resolve();
const bytes = (value: unknown) => new TextEncoder().encode(canonical(value));
function canonical(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  if (value && typeof value === "object") return "{" + Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k,v]) => JSON.stringify(k) + ":" + canonical(v)).join(",") + "}";
  return JSON.stringify(value);
}
async function digest(value: unknown) {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes(value))), b => b.toString(16).padStart(2,"0")).join("");
}
async function sign(value: unknown) {
  const key = await crypto.subtle.importKey("jwk", state.privateKey, {name:"ECDSA",namedCurve:"P-256"}, false, ["sign"]);
  return btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign({name:"ECDSA",hash:"SHA-256"}, key, bytes(value)))));
}
async function valid(value: unknown, signature: string, key: CryptoKey) {
  return crypto.subtle.verify({name:"ECDSA",hash:"SHA-256"}, key, Uint8Array.from(atob(signature), c => c.charCodeAt(0)), bytes(value));
}
const cases: Record<Scenario, [string,string,string]> = {
  clear: ["Presumptive indication","DEMO_REFERENCE_MATCH","Synthetic reference response. Substance identity is not established."],
  negative: ["No indication","DEMO_NO_RESPONSE","No reaction in this synthetic example. This does not rule out a substance."],
  low_light: ["Inconclusive","LOW_LIGHT","The demonstration capture is too dark to compare reliably. Retake with even lighting."],
  missing_card: ["Inconclusive","REFERENCE_MISSING","The calibration reference is missing. Include the card in the frame."],
  uploaded: ["Inconclusive","MODEL_NOT_VALIDATED","Photo recorded for manual review. No automated substance prediction is available."],
};
async function event(record: Evidence, action: string, actor: string, details: Record<string,string>) {
  const payload: AuditEvent["payload"] = {record_id:record.id, sequence:record.events.length, previous_hash:record.events.at(-1)?.hash ?? null, action, actor, details, timestamp:new Date().toISOString()};
  record.events.push({payload, hash:await digest(payload), signature:await sign(payload)});
}
async function create(input: Intake) {
  const intake = structuredClone(input);
  for (const key of ["case_ref","bag_id","officer","location"] as const) {
    if (typeof intake[key] !== "string" || intake[key].trim().length < 2) throw new Error("Complete the case, bag, officer and location fields.");
    intake[key] = intake[key].trim();
  }
  const existing = state.records.find(r => r.payload.intake.client_id === intake.client_id);
  if (existing) {
    if (canonical(existing.payload.intake) !== canonical(intake)) throw new Error("This sync identifier belongs to different content.");
    return existing;
  }
  const kit = state.kits.find(k => k.id === intake.kit_id);
  if (!kit || kit.expires < new Date().toISOString().slice(0,10)) throw new Error("Select an in-date kit lot.");
  if (!(intake.scenario in cases)) throw new Error("Select a demonstration scenario.");
  if (intake.image) intake.scenario = "uploaded";
  if (intake.scenario === "uploaded" && !intake.image) throw new Error("Attach a photo before recording.");
  if (!Number.isFinite(Date.parse(intake.captured_at))) throw new Error("Invalid capture time.");
  const [outcome,reason,note] = cases[intake.scenario];
  const id = "FS-" + crypto.randomUUID().slice(0,8).toUpperCase();
  const payload: Evidence["payload"] = {record_id:id, intake, kit:structuredClone(kit), result:{outcome,reason,note,quality:outcome === "Inconclusive" ? "Review required" : "Illustrative",light:null,alignment:null,reference:null}, image_sha256:null, sealed_at:new Date().toISOString(), demo:true, notice:"Standalone browser demonstration. Synthetic outcomes; browser-held demo key, no server or operational evidence."};
  if (intake.image) {
    if (!/^data:image\/(png|jpeg|webp);base64,/.test(intake.image) || intake.image.length > 4200000) throw new Error("Use a PNG, JPEG or WebP below 3 MB.");
    const raw = Uint8Array.from(atob(intake.image.split(",")[1]), c => c.charCodeAt(0));
    payload.image_sha256 = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", raw)), b=>b.toString(16).padStart(2,"0")).join("");
  }
  const record: Evidence = {id,payload,hash:await digest(payload),signature:await sign(payload),events:[]};
  await event(record,"Record sealed",intake.officer,{bag_id:intake.bag_id,record_hash:record.hash});
  state.records.unshift(record);
  return record;
}
async function initialize() {
  if (!crypto.subtle) throw new Error("This browser does not support local cryptography. Open the HTML in current Edge or Chrome.");
  const saved = await read<State | null>("standalone-state", null);
  if (saved) { state = saved; return; }
  const pair = await crypto.subtle.generateKey({name:"ECDSA",namedCurve:"P-256"}, true, ["sign","verify"]);
  const expiry = (days:number) => new Date(Date.now()+days*86400000).toISOString().slice(0,10);
  state = {records:[],privateKey:await crypto.subtle.exportKey("jwk",pair.privateKey),publicKey:await crypto.subtle.exportKey("jwk",pair.publicKey),kits:[
    {id:"FS-DEMO-24",name:"Field reagent kit A",lot:"DM-2409-A",expires:expiry(120),stock:18},
    {id:"FS-DEMO-25",name:"Field reagent kit B",lot:"DM-2501-B",expires:expiry(240),stock:12},
    {id:"FS-EXPIRED",name:"Expired training kit",lot:"DM-EXPIRED",expires:"2020-01-01",stock:2},
  ]};
  for (const [i,scenario] of (["clear","negative","low_light"] as Scenario[]).entries()) await create({client_id:crypto.randomUUID(),case_ref:`DEMO/LOCAL/00${i+1}`,bag_id:`BAG-DEMO-00${i+1}`,officer:"Demo officer",location:"Training workspace",kit_id:"FS-DEMO-24",scenario,notes:"Fictional standalone example",image:null,captured_at:new Date(Date.now()-(i+1)*3600000).toISOString()});
  await write("standalone-state",state);
}
async function verify(bundle: Bundle): Promise<Verification> {
  try {
    if (bundle.format !== "fieldseal-browser-demo-v1") throw new Error("Use a standalone demo bundle. Python backend bundles use a separate format.");
    const {record,public_key} = bundle.body;
    const key = await crypto.subtle.importKey("jwk",public_key,{name:"ECDSA",namedCurve:"P-256"},false,["verify"]);
    if (!await valid(bundle.body,bundle.signature,key) || !await valid(record.payload,record.signature,key) || record.hash !== await digest(record.payload) || record.id !== record.payload.record_id || !record.events.length) throw new Error("Signature or payload hash mismatch.");
    let previous: string | null = null;
    for (const [i,e] of record.events.entries()) {
      if (e.payload.sequence !== i || e.payload.record_id !== record.id || e.payload.previous_hash !== previous || e.hash !== await digest(e.payload) || !await valid(e.payload,e.signature,key)) throw new Error("Custody chain mismatch.");
      previous = e.hash;
    }
    const trusted = public_key.x === state.publicKey.x && public_key.y === state.publicKey.y;
    return {valid:true,trusted_key:trusted,errors:[],notice:"Browser demo signatures only. No proof of chemical identity or operator authenticity."};
  } catch (e) { return {valid:false,trusted_key:false,errors:[(e as Error).message],notice:"Verification failed."}; }
}
async function dispatch(path: string, method: string, body?: unknown): Promise<unknown> {
  await (ready ??= initialize());
  if (path === "/kits") return state.kits;
  if (path === "/records" && method === "GET") return state.records;
  if (path === "/verify" && method === "POST") return verify(body as Bundle);
  let output: unknown;
  if (path === "/records" && method === "POST") output = await create(body as Intake);
  else {
    const match = /^\/records\/([^/]+)\/(bundle|custody|lab)$/.exec(path);
    const record = state.records.find(r => r.id === match?.[1]);
    if (!match || !record) throw new Error("Demo record not found.");
    if (match[2] === "bundle" && method === "GET") {
      const payload = {record:structuredClone(record),public_key:state.publicKey};
      return {format:"fieldseal-browser-demo-v1",body:payload,signature:await sign(payload)};
    }
    if (method !== "POST") throw new Error("Unsupported demo action.");
    const data = body as Record<string,string>;
    for (const field of match[2] === "lab" ? ["actor","reference","outcome","note"] : ["actor","recipient","note"]) if (typeof data[field] !== "string" || data[field].trim().length < 2) throw new Error("Complete all event fields.");
    if (match[2] === "lab" && record.events.some(e => e.payload.action === "Lab outcome linked")) throw new Error("A lab outcome is already linked.");
    if (match[2] === "lab" && !["Confirmed","Not confirmed","Inconclusive"].includes(data.outcome)) throw new Error("Choose a valid lab outcome.");
    const {actor,...details} = data;
    await event(record,match[2] === "lab" ? "Lab outcome linked" : "Custody transferred",actor,details);
    output = record;
  }
  await write("standalone-state",state);
  return output;
}
export function standaloneApi<T>(path:string,method:string,body?:unknown):Promise<T> {
  const result = serial.then(()=>dispatch(path,method,body)).then(value=>structuredClone(value) as T);
  serial = result.catch(()=>undefined);
  return result;
}
