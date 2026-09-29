import { build } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const result = await build({
  absWorkingDir:root,entryPoints:["src/main.tsx"],bundle:true,write:false,
  outfile:"standalone.js",format:"iife",minify:true,target:"es2022",
  define:{__FIELDSEAL_STANDALONE__:"true","process.env.NODE_ENV":'"production"'},
  loader:{".woff":"dataurl",".woff2":"dataurl"},
});
const js = result.outputFiles.find(f=>f.path.endsWith(".js")).text.replace(/<\/script/gi,"<\\/script");
const css = result.outputFiles.find(f=>f.path.endsWith(".css")).text;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FieldSeal · Standalone Demo</title><style>${css}</style></head><body><div id="root"></div><noscript>Enable JavaScript to use this interactive demonstration.</noscript><script id="app-bundle">${js}</script></body></html>`;
const destination = path.resolve(root,"../demo/FieldSeal.html");
await mkdir(path.dirname(destination),{recursive:true});
await writeFile(destination,html);
console.log(`Built ${destination} (${Buffer.byteLength(html).toLocaleString()} bytes). No remote assets or API required.`);
