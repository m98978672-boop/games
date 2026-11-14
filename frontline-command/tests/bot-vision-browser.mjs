// Real Chromium loading the game and running the same isolated U scenario.
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname,extname,resolve,sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import chromium,{inflate} from '@sparticuz/chromium';
import {chromium as playwright} from 'playwright-core';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{try{
  const name=decodeURIComponent(new URL(req.url,'http://test.invalid').pathname).replace(/^\/+/, '')||'index.html';
  if(name.split(/[\\/]/).includes('..')||!(['index.html','style.css','cover.svg'].includes(name)||['src/','data/','assets/'].some(p=>name.startsWith(p))))throw Error('path');
  const path=resolve(root,name);if(!path.startsWith(root+sep))throw Error('path');
  res.writeHead(200,{'content-type':mime[extname(path)]||'application/octet-stream','cache-control':'no-store'}).end(await readFile(path));
}catch{res.writeHead(404).end();}});
let browser;
try{
  await new Promise((r,j)=>{server.once('error',j);server.listen(0,'127.0.0.1',r);});
  const req=createRequire(import.meta.url),archive=resolve(dirname(req.resolve('@sparticuz/chromium')),'../bin/al2023.tar.br');
  const libs=resolve(await inflate(archive),'lib');
  browser=await playwright.launch({executablePath:process.env.FRONTLINE_CHROMIUM_PATH||await chromium.executablePath(),args:chromium.args,headless:true,env:{...process.env,LD_LIBRARY_PATH:[libs,process.env.LD_LIBRARY_PATH].filter(Boolean).join(':')}});
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base=`http://127.0.0.1:${server.address().port}/`;
  async function runScene(){return page.evaluate(async()=>{
    const {Game}=await import('/src/sim/game.js');const {Nav}=await import('/src/sim/nav.js');
    const {Walls}=await import('/src/sim/walls.js');const {moveAlongFlow,updateTimers}=await import('/src/sim/units.js');
    const cfg=window.__frontline.cfg, g=new Game({cfg,seed:1,aiVsAi:true});g.units.clear();g.unitGrid.clear();
    const width=1280,segments=[[320,352,672,352],[672,352,672,672],[672,672,320,672]];
    const inside=(x,y)=>x>0&&y>0&&x<width&&y<width,blocked=(x,y,r)=>segments.some(s=>Walls.distPointSegment(x,y,...s).d<=8+r);
    g.world={W:width,H:width,navVersion:1,isWalkable:(x,y)=>inside(x,y)&&!blocked(x,y,0),isBaseWalkable:inside,speedAt:()=>1,terrainAt:()=>0};
    g.walls={enabled:()=>true,doorWaypoint:()=>null,doorsForUnit:()=>{},blocksMove:blocked};g.world.walls=g.walls;g.nav=new Nav(g.world,cfg);
    const u=g.spawnUnit(0,'truck',512,512);u.goal={x:900,y:512};u.activity='advance';let maxStep=0,collided=false;
    for(let i=0;i<600;i++){const x=u.x,y=u.y;g.time+=.05;g.nav.advance();updateTimers(g,u,.05);moveAlongFlow(g,u,.05);
      maxStep=Math.max(maxStep,Math.hypot(u.x-x,u.y-y));collided ||= blocked(u.x,u.y,u.radius);if(u.arrived||u.pathFailed)break;}
    return {flag:cfg.flag('bot_obstacle_vision_v1'),arrived:!!u.arrived,pathFailed:!!u.pathFailed,collided,maxStep,limit:u.speed*.05*1.5};
  });}
  await page.goto(base,{waitUntil:'load'});await page.waitForFunction(()=>!!window.__frontline);
  const off=await runScene();assert.equal(off.flag,false);assert.equal(off.pathFailed,true);
  const route='**/data/feature_flags.json';
  await page.route(route,async r=>{const resp=await r.fetch(),data=await resp.json(),flag=data.flags.find(f=>f.id==='bot_obstacle_vision_v1');
    if(!flag)throw Error('missing feature flag');flag.enabled=true;await r.fulfill({response:resp,json:data});});
  await page.reload({waitUntil:'load'});await page.waitForFunction(()=>!!window.__frontline);
  const on=await runScene();assert.equal(on.flag,true);assert.equal(on.arrived,true);assert.equal(on.pathFailed,false);
  assert.equal(on.collided,false);assert.ok(on.maxStep<=on.limit+1e-9);
  await page.evaluate(()=>window.__frontline.newGame({seed:1,aiVsAi:true}));
  await page.waitForFunction(()=>window.__frontline.game?.time>0.1,{timeout:30000});
  assert.deepEqual(errors,[]);console.log('Chromium: default off, opt-in U detour, collision/speed check, live game ticks, no page errors');
}finally{if(browser)await browser.close();if(server.listening)await new Promise(r=>server.close(r));}
