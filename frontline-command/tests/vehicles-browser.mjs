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
  const app=window.__frontline,g=app.game,r=app.renderer,b=g.world.buildings.find(b=>b.type==='hq'&&g.walls.state(b));
  const art=['infantry_0_0','tank_0_0','truck_1_1'].map(n=>{const img=r.bank.get('sprites/'+n);return [n,!!img,img?.naturalWidth||0];});
  const old={ctx:r.ctx,visible:r.isVisible,camera:{...r.camera}},cv=document.createElement('canvas');cv.width=r.canvas.width;cv.height=r.canvas.height;
  r.ctx=cv.getContext('2d');r.isVisible=()=>true;Object.assign(r.camera,{x:b.x,y:b.y,zoom:1});
  const st=g.walls.state(b),opening=st.outline.openings.find(o=>o.type==='door'),door=st.doors[opening.id];
  const center=r.worldToScreen(b.x,b.y),mid=r.worldToScreen(b.x+(opening.p1[0]+opening.p2[0])/2,b.y+(opening.p1[1]+opening.p2[1])/2);
  const sample=(x,y)=>Array.from(r.ctx.getImageData(Math.round(x),Math.round(y),1,1).data);
  const render=()=>{r.ctx.clearRect(0,0,cv.width,cv.height);r.drawBuildings();r.drawWalls();return {floor:sample(center.x+13,center.y+11),door:sample(mid.x,mid.y)};};
  door.state='open';door.anim=1;const opened=render();door.state='closed';door.anim=0;const closed=render();
  Object.assign(r.camera,old.camera);r.ctx=old.ctx;r.isVisible=old.visible;
  return {art,opened,closed};
 });
 assert(result.art.every(x=>x[1]&&x[2]===64),'all unit artwork loaded');
 assert(result.opened.floor[3]>0,'floor is rendered inside the actual wall outline');
 assert.notDeepEqual(result.opened.door,result.closed.door,'door state changes rendered pixels');
 assert.deepEqual(errors,[]);console.log('Chromium vehicles: sprites loaded; cutaway floor and open/closed door pixels verified');
}finally{if(browser)await browser.close();if(server.listening)await new Promise(r=>server.close(r));}
