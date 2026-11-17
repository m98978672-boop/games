// Real Chromium: loaded unit artwork and actual open/closed door pixels.
import assert from 'node:assert/strict';import http from 'node:http';import {readFile} from 'node:fs/promises';import {createRequire} from 'node:module';import {dirname,extname,resolve,sep} from 'node:path';import {fileURLToPath} from 'node:url';
import chromium,{inflate} from '@sparticuz/chromium';import {chromium as playwright} from 'playwright-core';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://test').pathname).replace(/^\/+/,''),p=resolve(repo,name);
 if(!p.startsWith(repo+sep)||!['frontline-command/','shared/'].some(v=>name.startsWith(v)))throw Error('path');
 res.writeHead(200,{'content-type':mime[extname(p)]||'application/octet-stream'});res.end(await readFile(p));}catch{res.writeHead(404).end();}});
let browser;
try {
 await new Promise((ok,err)=>{server.once('error',err);server.listen(0,'127.0.0.1',ok);});
 const req=createRequire(import.meta.url),libs=resolve(await inflate(resolve(dirname(req.resolve('@sparticuz/chromium')),'../bin/al2023.tar.br')),'lib');
 browser=await playwright.launch({executablePath:process.env.FRONTLINE_CHROMIUM_PATH||await chromium.executablePath(),args:chromium.args,headless:true,env:{...process.env,LD_LIBRARY_PATH:[libs,process.env.LD_LIBRARY_PATH].filter(Boolean).join(':')}});
 const page=await browser.newPage({viewport:{width:1280,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/frontline-command/index.html`,{waitUntil:'load'});await page.waitForFunction(()=>window.__frontline);
 await page.evaluate(()=>{const a=window.__frontline,g=a.newGame({mode:'commander',aiVsAi:true,seed:7});g.paused=true;});
 const result=await page.evaluate(()=>{
  const a=window.__frontline,g=a.game,r=a.renderer,old={ctx:r.ctx,visible:r.isVisible,camera:{...r.camera}};
  const cv=document.createElement('canvas');cv.width=r.canvas.width;cv.height=r.canvas.height;
  r.ctx=cv.getContext('2d');r.isVisible=()=>true;
  const clear=()=>r.ctx.clearRect(0,0,cv.width,cv.height);
  const pixels=()=>r.ctx.getImageData(0,0,cv.width,cv.height).data;
  const snapshot=()=>new Uint8Array(pixels());
  const diff=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]||a[i+3]!==b[i+3])n++;return n;};
  const b=g.world.buildings.find(b=>b.pointId==='bridge_north'),d=b.deck;
  Object.assign(r.camera,{x:(d.x0+d.x1)/2,y:(d.y0+d.y1)/2,zoom:1});clear();r.drawBridge(b,1);
  const middle=r.worldToScreen((d.x0+d.x1)/2,(d.y0+d.y1)/2);
  const bridgeAlpha=r.ctx.getImageData(Math.floor(middle.x),Math.floor(middle.y),1,1).data[3];
  const u=g.spawnUnit(0,'tank',r.camera.x,r.camera.y);g.units.clear();g.units.set(u.id,u);u.hp=u.maxHp;u.targetId=null;
  clear();u.turretAngle=0;r.drawUnits();const a0=snapshot();clear();u.turretAngle=.3;r.drawUnits();const a1=snapshot();
  const rotationPixels=diff(a0,a1);
  g.decals=[{type:'blood',x:u.x,y:u.y,t:0,life:45}];g.time=0;clear();r.drawDecals();const bloodFresh=snapshot();
  g.time=40;clear();r.drawDecals();const bloodOld=snapshot();const bloodFadePixels=diff(bloodFresh,bloodOld);
  g.fx=[{type:'muzzle',x:u.x,y:u.y,angle:0,t:0,life:.12},{type:'wreck',x:u.x+65,y:u.y,t:1,life:12}];
  clear();r.drawEffects();const f0=snapshot();g.fx[0].t=.1;g.fx[1].t=1.12;clear();r.drawEffects();const f1=snapshot();
  const firePixels=diff(f0,f1);
  Object.assign(r.camera,old.camera);r.ctx=old.ctx;r.isVisible=old.visible;
  return {bridgeAlpha,rotationPixels,bloodFadePixels,firePixels};
 });
 assert(result.bridgeAlpha>0,'deck rendered');assert(result.rotationPixels>40,'continuous vehicle sprite rotation changes pixels');
 assert(result.bloodFadePixels>20,'blood visually fades');assert(result.firePixels>30,'fire and flash animate');
 assert.deepEqual(errors,[]);console.log('Chromium battlefield visuals:',result);
}finally{if(browser)await browser.close();if(server.listening)await new Promise(r=>server.close(r));}
