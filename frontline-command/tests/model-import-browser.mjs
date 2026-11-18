// Tests Cache Storage integration, not GPU inference. Optional MODEL_ZIP tests the real release archive.
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile, mkdtemp, rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {dirname,extname,resolve,sep,join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import chromium,{inflate} from '@sparticuz/chromium';
import {chromium as playwright} from 'playwright-core';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'../..'),tmp=await mkdtemp(join(tmpdir(),'model-import-')),fixture=join(tmp,'model.zip');
execFileSync('python3',['-c',`import zipfile,sys\nnames=['mlc-chat-config.json','tensor-cache.json','tokenizer.json']+[f'params_shard_{i}.bin' for i in range(11)]\nwith zipfile.ZipFile(sys.argv[1],'w',compression=zipfile.ZIP_STORED) as z:\n for n in names:z.writestr(n,'fixture:'+n)`,fixture]);
const bytes=await readFile(fixture),blocks=[];for(let i=0;i<bytes.length;i+=4*1024*1024)blocks.push(createHash('sha256').update(bytes.subarray(i,i+4*1024*1024)).digest());const hash=createHash('sha256').update(Buffer.concat(blocks)).digest('hex');
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css'};
const server=http.createServer(async(req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://test').pathname).replace(/^\/+/,''),p=resolve(repo,name);if(!p.startsWith(repo+sep)||!['frontline-command/','shared/'].some(q=>name.startsWith(q)))throw Error('path');res.writeHead(200,{'content-type':mime[extname(p)]||'application/octet-stream'});res.end(await readFile(p));}catch{res.writeHead(404).end();}});
let browser;
try{
 await new Promise((r,j)=>{server.once('error',j);server.listen(0,'127.0.0.1',r)});
 const req=createRequire(import.meta.url),libs=resolve(await inflate(resolve(dirname(req.resolve('@sparticuz/chromium')),'../bin/al2023.tar.br')),'lib');
 browser=await playwright.launch({executablePath:process.env.FRONTLINE_CHROMIUM_PATH||await chromium.executablePath(),args:chromium.args,headless:true,env:{...process.env,LD_LIBRARY_PATH:[libs,process.env.LD_LIBRARY_PATH].filter(Boolean).join(':')}});
 const page=await browser.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/frontline-command/index.html`);
 const result=await page.evaluate(async({data,hash})=>{
  const m=await import('./src/ui/model_import.js');const blob=new Blob([new Uint8Array(data)]);let corrupt=false;
  try{await m.importModelArchive(blob,{expectedSize:blob.size,expectedHash:'0'.repeat(64)});}catch{corrupt=true;}
  const before=(await caches.keys()).length;
  await m.importModelArchive(blob,{expectedSize:blob.size,expectedHash:hash});
  const config=await caches.open('webllm/config'),model=await caches.open('webllm/model');
  const values=await Promise.all(m.MODEL_FILES.map(async n=>{const c=n==='mlc-chat-config.json'?config:model;return (await c.match(m.MODEL_BASE+n))?.text();}));
  return {corrupt,before,values,names:m.MODEL_FILES};
 },{data:[...bytes],hash});
 assert.equal(result.corrupt,true);assert.equal(result.before,0);assert.deepEqual(result.values,result.names.map(n=>'fixture:'+n));
 if(process.env.MODEL_ZIP){
  // Drop fixture cache before checking the UI with the real ZIP.
  await page.evaluate(async()=>{await caches.delete('webllm/config');await caches.delete('webllm/model');});
  await page.waitForFunction(()=>!!window.__frontline);await page.locator('[data-act="model-storage"]').click();
  await page.locator('#model-import-file').setInputFiles(process.env.MODEL_ZIP);await page.locator('#model-import').click();
  await page.waitForFunction(()=>/сохранены|не выполнено/i.test(document.querySelector('#model-import-status')?.textContent||''),null,{timeout:300000});
  assert.match(await page.locator('#model-import-status').innerText(),/Файлы модели сохранены/);
  assert.equal(await page.evaluate(async()=>{const m=await import('./src/ui/model_import.js');const c=await caches.open('webllm/config'),w=await caches.open('webllm/model');return (await Promise.all(m.MODEL_FILES.map(n=>(n==='mlc-chat-config.json'?c:w).match(m.MODEL_BASE+n)))).filter(Boolean).length;}),14);
  console.log('Real verified release archive imported into WebLLM cache; GPU inference not tested.');
 }
 console.log('Model import browser: rejects wrong hash before writing; writes 14 correctly scoped entries.');
}finally{if(browser)await browser.close();if(server.listening)await new Promise(r=>server.close(r));await rm(tmp,{recursive:true,force:true});}
