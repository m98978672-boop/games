import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname,extname,resolve,sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import chromium,{inflate} from '@sparticuz/chromium';
import {chromium as playwright} from 'playwright-core';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const server=http.createServer(async(req,res)=>{
  try{const name=decodeURIComponent(new URL(req.url,'http://x').pathname).replace(/^\/+/, '')||'index.html';
    const path=resolve(root,name);if(!path.startsWith(root+sep))throw Error('bad path');
    const bytes=await readFile(path);res.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css'}[extname(path)]||'application/octet-stream'});res.end(bytes);
  }catch{res.writeHead(404);res.end();}
});
let browser;
try{
  await new Promise((r,j)=>{server.once('error',j);server.listen(0,'127.0.0.1',r);});
  const req=createRequire(import.meta.url), archive=resolve(dirname(req.resolve('@sparticuz/chromium')),'../bin/al2023.tar.br');
  const libs=resolve(await inflate(archive),'lib');
  browser=await playwright.launch({executablePath:process.env.FRONTLINE_CHROMIUM_PATH||await chromium.executablePath(),args:chromium.args,headless:true,env:{...process.env,LD_LIBRARY_PATH:[libs,process.env.LD_LIBRARY_PATH].filter(Boolean).join(':')}});
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`,{waitUntil:'load'});
  const result=await page.evaluate(async()=>{
    const {EasyStarPlanner}=await import('/src/sim/easystar_route.js');
    const game={world:{W:1024,H:1024,navVersion:1,isBaseWalkable:(x,y)=>x>0&&y>0&&x<1024&&y<1024},walls:{blocksMove:(x,y,r)=>x+r>=500&&x-r<=506&&y+r>=80&&y-r<=750,navQueue:new Set()}};
    const unit={x:380,y:400,radius:9,goal:{x:630,y:400},alive:true,downed:false};
    const planner=new EasyStarPlanner(game,unit);let r;
    for(let i=0;i<1000;i++){r=planner.step(23);if(r.status!=='running')break;}
    return {status:r.status,goal:r.path?.at(-1),maxStep:r.used};
  });
  assert.equal(result.status,'found');assert.deepEqual(result.goal,{x:630,y:400});assert.ok(result.maxStep<=23);assert.deepEqual(errors,[]);
  console.log('Chromium: EasyStar ESM loaded and found a sliced route around a wall');
}finally{if(browser)await browser.close();if(server.listening)await new Promise(r=>server.close(r));}
