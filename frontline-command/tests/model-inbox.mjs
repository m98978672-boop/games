// Browser end-to-end upload + API security using a disposable inbox.
import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {mkdtemp,readFile,rm,mkdir,stat} from 'node:fs/promises';import {resolve,dirname} from 'node:path';import {fileURLToPath} from 'node:url';import {createRequire} from 'node:module';import {createHash} from 'node:crypto';import chromium,{inflate} from '@sparticuz/chromium';import {chromium as playwright} from 'playwright-core';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');await mkdir(resolve(root,'.cache'),{recursive:true});const dir=await mkdtemp(resolve(root,'.cache/model-inbox-test-'));let browser,port;
const proc=spawn('python3',['tools/model-inbox-server.py','--host','127.0.0.1','--port','0','--inbox',dir],{cwd:root,stdio:['ignore','pipe','pipe']});let stderr='';proc.stderr.on('data',d=>stderr+=d);
try{
 port=await new Promise((ok,fail)=>{let text='';const timer=setTimeout(()=>fail(Error('server timeout')),10000);proc.once('exit',code=>fail(Error(`server exited ${code} ${stderr}`)));proc.stdout.on('data',buf=>{text+=buf;const m=text.match(/preview on 127\.0\.0\.1:(\d+)/);if(m){clearTimeout(timer);ok(Number(m[1]));}});});
 const origin=`http://127.0.0.1:${port}`,api=origin+'/__model_inbox/',status=await (await fetch(api+'status')).json();assert.equal(status.service,'model-inbox-v1');
 const post=(path,body,headers={})=>fetch(api+path,{method:'POST',headers,body});
 const good={'Origin':origin,'X-Model-Token':status.token};
 assert.equal((await post('start','{}',{'Origin':origin})).status,403);
 assert.equal((await post('start','{}',{'Origin':'https://evil.example','X-Model-Token':status.token})).status,403);
 assert.equal((await post('start',JSON.stringify({name:'../escape.zip',size:1}),good)).status,400);
 assert.equal((await post('start',JSON.stringify({name:'model.zip',size:status.maxFile+1}),good)).status,400);
 assert.equal((await fetch(origin+'/frontline-command/model-inbox/test.zip')).status,404);
 assert.equal((await fetch(origin+'/.git/config')).status,404);
 const r=await post('start',JSON.stringify({name:'incomplete.bin',size:4}),good),{id}=await r.json();assert.equal(r.status,200);
 assert.equal((await post('finish','',{...good,'X-Upload-Id':id})).status,409);
 assert.equal((await post('chunk',new Uint8Array([1]),{...good,'X-Upload-Id':id,'X-Upload-Offset':'1'})).status,409);
 assert.equal((await post('cancel','',{...good,'X-Upload-Id':id})).status,200);
 const req=createRequire(import.meta.url),libs=resolve(await inflate(resolve(dirname(req.resolve('@sparticuz/chromium')),'../bin/al2023.tar.br')),'lib');
 browser=await playwright.launch({executablePath:process.env.FRONTLINE_CHROMIUM_PATH||await chromium.executablePath(),args:chromium.args,headless:true,env:{...process.env,LD_LIBRARY_PATH:[libs,process.env.LD_LIBRARY_PATH].filter(Boolean).join(':')}});
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/frontline-command/',{waitUntil:'load'});await page.waitForFunction(()=>!!window.__frontline);
 await page.locator('[data-act="model-storage"]').click();await page.waitForFunction(()=>document.querySelector('#model-status')?.textContent.includes('Хранилище доступно'));
 const original=page.locator('#model-original-download');assert.equal(await original.getAttribute('href'),'https://github.com/m98978672-boop/games/releases/download/frontline-qwen35-0.8b-0ec1389/Qwen3.5-0.8B-q4f16_1-MLC.zip');assert.equal(await original.getAttribute('rel'),'noopener noreferrer');
 assert.match(await page.locator('#training-model-note').innerText(),/не подключён к игре/);assert.match(await page.locator('#training-model-note').innerText(),/не подходит для импорта/);
 const buffer=Buffer.alloc(10*1024*1024+123);for(let i=0;i<buffer.length;i++)buffer[i]=i%251;
 const digest=createHash('sha256').update(buffer).digest('hex');await page.locator('#model-file').setInputFiles([{name:'test-model.zip',mimeType:'application/zip',buffer},{name:'tokenizer.json',mimeType:'application/json',buffer:Buffer.from('{"test":true}')}]);
 await page.locator('#model-send').click();try{await page.waitForFunction(()=>document.querySelector('#model-status')?.textContent.includes('загружено файлов 2')||document.querySelector('#model-status')?.textContent.includes('Загрузка остановлена'),null,{timeout:20000});}catch(e){throw Error(`upload timed out; status=${await page.locator('#model-status').textContent()}; server=${stderr}; ${e.message}`);}assert.match(await page.locator('#model-status').textContent(),/загружено файлов 2/,stderr);
 assert.equal(createHash('sha256').update(await readFile(resolve(dir,'test-model.zip'))).digest('hex'),digest);assert.equal((await stat(resolve(dir,'test-model.zip'))).size,buffer.length);
 assert.equal(await page.locator('#model-files li').count(),2);assert.equal((await post('start',JSON.stringify({name:'test-model.zip',size:1}),good)).status,409);
 await page.locator('#model-back').click();assert.equal(await page.locator('[data-act="model-storage"]').count(),1);assert.deepEqual(errors,[]);
 await page.route('**/__model_inbox/status',route=>route.fulfill({status:404,body:'not available'}));await page.locator('[data-act="model-storage"]').click();
 await page.waitForFunction(()=>document.querySelector('#model-status')?.textContent.includes('недоступен'));assert.equal(await page.locator('#model-send').isDisabled(),true,'static hosting is not claimed to support uploads');
 const request=page.locator('#dropbox-request-url'), link=page.locator('#dropbox-request-open');
 assert.equal(await link.isVisible(),false);
 for(const bad of ['https://www.dropbox.com.evil.test/request/example','http://www.dropbox.com/request/example','https://www.dropbox.com/request/example?redirect=bad','javascript:alert(1)','https://www.dropbox.com/home']){
  await request.fill(bad);assert.equal(await link.isVisible(),false,`rejected ${bad}`);assert.equal(await link.getAttribute('href'),null);
 }
 await request.fill('https://www.dropbox.com/request/example123');assert.equal(await link.isVisible(),true);assert.equal(await link.getAttribute('href'),'https://www.dropbox.com/request/example123');
 assert.equal(await link.getAttribute('rel'),'noopener noreferrer');
 assert.deepEqual(errors,[]);
 console.log('model inbox: real Chromium uploaded and verified 10 MiB across chunks + second file; static fallback, Dropbox handoff validation and token/origin, path traversal, duplicate, incomplete and size checks passed');
 if(process.argv.includes('--large')){
  // Synthetic 400 MiB file via the same chunked backend; not an actual model.
  const size=400*1024*1024,large=await (await post('start',JSON.stringify({name:'large-test.bin',size}),good)).json();let off=0;const block=Buffer.alloc(status.chunkSize,73),hash=createHash('sha256');
  while(off<size){const chunk=block.subarray(0,Math.min(block.length,size-off));hash.update(chunk);const response=await post('chunk',chunk,{...good,'X-Upload-Id':large.id,'X-Upload-Offset':String(off)});assert.equal(response.status,200);off=(await response.json()).offset;}
  const done=await (await post('finish','',{...good,'X-Upload-Id':large.id})).json();assert.equal(done.size,size);assert.equal(done.sha256,hash.digest('hex'));assert.equal((await stat(resolve(dir,'large-test.bin'))).size,size);console.log('synthetic 400 MiB upload verified by server SHA-256 (direct local backend, not preview proxy)');
 }
}finally{if(browser)await browser.close();proc.kill('SIGTERM');await new Promise(r=>proc.once('exit',r));await rm(dir,{recursive:true,force:true});}
