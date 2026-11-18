// Real Chromium UI and actual worker startup/fallback (no model weights downloaded).
import assert from 'node:assert/strict';import http from 'node:http';import {readFile} from 'node:fs/promises';import {createRequire} from 'node:module';import {dirname,extname,resolve,sep} from 'node:path';import {fileURLToPath} from 'node:url';import chromium,{inflate} from '@sparticuz/chromium';import {chromium as playwright} from 'playwright-core';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'../..'),mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://test').pathname).replace(/^\/+/,''),p=resolve(repo,name);if(!p.startsWith(repo+sep)||!['frontline-command/','shared/'].some(q=>name.startsWith(q)))throw Error('path');res.writeHead(200,{'content-type':mime[extname(p)]||'application/octet-stream'});res.end(await readFile(p));}catch{res.writeHead(404).end();}});
let browser;
try{
 await new Promise((r,j)=>{server.once('error',j);server.listen(0,'127.0.0.1',r);});const req=createRequire(import.meta.url),libs=resolve(await inflate(resolve(dirname(req.resolve('@sparticuz/chromium')),'../bin/al2023.tar.br')),'lib');
 browser=await playwright.launch({executablePath:process.env.FRONTLINE_CHROMIUM_PATH||await chromium.executablePath(),args:chromium.args,headless:true,env:{...process.env,LD_LIBRARY_PATH:[libs,process.env.LD_LIBRARY_PATH].filter(Boolean).join(':')}});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Abort external requests: this test is intentionally only a fallback smoke test.
 await page.route('**/*',route=>{const u=new URL(route.request().url());return u.hostname==='127.0.0.1'?route.continue():route.abort();});
 await page.goto(`http://127.0.0.1:${server.address().port}/frontline-command/index.html`,{waitUntil:'load'});await page.waitForFunction(()=>!!window.__frontline);
 assert.equal(await page.locator('.neutral-ai-status').count(),0,'default menu never loads model');
 assert.equal(await page.locator('[data-act="neutral-ai-demo"], [data-act="neutral-ai-knowledge"]').count(),0,'research modes are not in the player menu');
 await page.evaluate(()=>window.__frontline.newGame({mode:'commander',aiVsAi:true,neutralAI:true}));
 await page.waitForFunction(()=>document.querySelector('.neutral-ai-status')?.textContent.includes('Обе стороны'),null,{timeout:40000});
 assert.equal(await page.evaluate(()=>window.__frontline.game.aiVsAi),true);
 assert.deepEqual(await page.evaluate(()=>window.__frontline.game.cfg.factions.map(f=>f.persona)),['balanced','balanced']);
 const before=await page.evaluate(()=>window.__frontline.game.time);await page.waitForTimeout(500);assert.ok(await page.evaluate(()=>window.__frontline.game.time)>before,'stock simulation continues on failure');
 await page.evaluate(()=>window.__frontline.newGame({aiVsAi:true,seed:7}));assert.equal(await page.locator('.neutral-ai-status').count(),0,'new war tears down worker and status');
 assert.deepEqual(errors,[]);
 // Separate controlled UI integration: a fake model supplies valid responses.
 // This does not test Qwen inference or its tactical quality.
 const mock=page,mockErrors=errors;await mock.evaluate(()=>{window.__frontline.game.paused=true;});
 await mock.addInitScript(()=>{window.Worker=class {constructor(){window.__fakeWorker=this;this.sent=[];}postMessage(m){this.sent.push(m);if(m.type==='pair')setTimeout(()=>this.onmessage({data:{type:'result',id:m.id,texts:['{"action":"hold","squad":0,"point":0}','{"action":"hold","squad":0,"point":0}']}}),0);}terminate(){this.terminated=true;}};});
 await mock.goto(`http://127.0.0.1:${server.address().port}/frontline-command/index.html`,{waitUntil:'load'});await mock.waitForFunction(()=>!!window.__frontline);
 await mock.evaluate(()=>window.__frontline.newGame({mode:'commander',aiVsAi:true,neutralAI:true}));
 await mock.evaluate(()=>{const g=window.__frontline.game;g.api.orders=[];for(const s of g.strategic)s.update=()=>{};window.__fakeWorker.onmessage({data:{type:'ready'}});});
 await mock.waitForFunction(()=>window.__frontline.game.api.orders.filter(o=>o.source==='neutralAI').length===2,null,{timeout:10000});
 const issued=await mock.evaluate(()=>window.__frontline.game.api.orders.filter(o=>o.source==='neutralAI').map(o=>({faction:o.faction,type:o.type})));
 assert.deepEqual(issued.map(o=>o.faction).sort(),[0,1]);assert.ok(issued.every(o=>o.type==='hold'));
 await mock.waitForFunction(()=>window.__frontline.game.api.orders.filter(o=>o.source==='neutralAI'&&o.status==='accepted').length===2,null,{timeout:15000});
 assert.deepEqual(mockErrors,[]);
 // Reuse the mocked page to avoid running several game simulations at once.
 const knowledge=mock;await knowledge.evaluate(()=>{window.__frontline.game.paused=true;});
 await knowledge.goto(`http://127.0.0.1:${server.address().port}/frontline-command/index.html`,{waitUntil:'load'});await knowledge.waitForFunction(()=>!!window.__frontline);
 await knowledge.evaluate(()=>window.__frontline.newGame({mode:'commander',aiVsAi:true,neutralAI:true,neutralKnowledge:true}));
 assert.deepEqual(await knowledge.evaluate(()=>window.__fakeWorker.sent[0]),{type:'init',knowledge:true});
 await knowledge.evaluate(()=>{const g=window.__frontline.game;g.api.orders=[];for(const s of g.strategic)s.update=()=>{};window.__fakeWorker.onmessage({data:{type:'ready'}});});
 await knowledge.waitForFunction(()=>window.__frontline.game.api.orders.filter(o=>o.source==='neutralAI'&&o.status==='accepted').length===2,null,{timeout:15000});
 assert.deepEqual((await knowledge.evaluate(()=>window.__frontline.game.api.orders.filter(o=>o.source==='neutralAI').map(o=>o.faction))).sort(),[0,1]);await knowledge.close();
 console.log('Chromium: research modes absent from player menu; internal worker fallback, teardown and simulated paired orders checked. Qwen inference not tested.');
}finally{if(browser)await browser.close();if(server.listening)await new Promise(r=>server.close(r));}
