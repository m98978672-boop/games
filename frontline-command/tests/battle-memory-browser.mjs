// Browser integration of the normal game, without a neural model.
import assert from 'node:assert/strict';import http from 'node:http';import {readFile} from 'node:fs/promises';import {createRequire} from 'node:module';import {dirname,extname,resolve,sep} from 'node:path';import {fileURLToPath} from 'node:url';import chromium,{inflate} from '@sparticuz/chromium';import {chromium as playwright} from 'playwright-core';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'../..'),mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://test').pathname).replace(/^\/+/,''),p=resolve(repo,name);if(!p.startsWith(repo+sep)||!['frontline-command/','shared/'].some(q=>name.startsWith(q)))throw Error('path');res.writeHead(200,{'content-type':mime[extname(p)]||'application/octet-stream'});res.end(await readFile(p));}catch{res.writeHead(404).end();}});
let browser;
try{
 await new Promise((r,j)=>{server.once('error',j);server.listen(0,'127.0.0.1',r);});const req=createRequire(import.meta.url),libs=resolve(await inflate(resolve(dirname(req.resolve('@sparticuz/chromium')),'../bin/al2023.tar.br')),'lib');
 browser=await playwright.launch({executablePath:process.env.FRONTLINE_CHROMIUM_PATH||await chromium.executablePath(),args:chromium.args,headless:true,env:{...process.env,LD_LIBRARY_PATH:[libs,process.env.LD_LIBRARY_PATH].filter(Boolean).join(':')}});
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=`http://127.0.0.1:${server.address().port}/frontline-command/index.html`;
 await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 await page.goto(url,{waitUntil:'load'});await page.waitForFunction(()=>!!window.__frontline);
 const id=await page.evaluate(()=>{window.__frontline.newGame({mode:'commander',aiVsAi:true,seed:7});const g=window.__frontline.game;g.paused=true;const p=g.world.points.find(p=>p.owner!==0);const id=g.world.sectorAt(p.x,p.y).id;g.influence.flipPoint(p,0);return id;});
 assert.equal(await page.evaluate(id=>window.__frontline.game.battleMemory.history[0].get(id).captures,id),1);
 assert.equal(await page.evaluate(()=>localStorage.getItem('frontline.battle-memory.v1.side-1')),null);
 await page.reload({waitUntil:'load'});await page.waitForFunction(()=>!!window.__frontline);
 const remembered=await page.evaluate(id=>{window.__frontline.newGame({mode:'commander',aiVsAi:true,seed:7});const g=window.__frontline.game;g.paused=true;return [g.battleMemory.history[0].get(id)?.captures,g.battleMemory.history[1].size,g.battleMemory.recent[0].size];},id);
 assert.deepEqual(remembered,[1,0,0]);
 const fallback=await page.evaluate(()=>{const g=window.__frontline.game;Storage.prototype.setItem=function(){throw Error('quota');};const p=g.world.points.find(p=>p.owner!==0);g.influence.flipPoint(p,0);return [g.battleMemory.persistent,g.alertLog.some(x=>x.text.includes('Память ИИ не сохраняется'))];});
 assert.deepEqual(fallback,[false,true],'write errors leave battle memory working and show warning');assert.deepEqual(errors,[]);
 console.log('Chromium normal game: side-local experience survives reload and write failure is reported.');
}finally{if(browser)await browser.close();if(server.listening)await new Promise(r=>server.close(r));}
