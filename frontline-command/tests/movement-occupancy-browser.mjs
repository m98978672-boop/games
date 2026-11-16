import assert from 'node:assert/strict';import http from 'node:http';import {readFile} from 'node:fs/promises';import {createRequire} from 'node:module';import {dirname,extname,resolve,sep} from 'node:path';import {fileURLToPath} from 'node:url';import chromium,{inflate} from '@sparticuz/chromium';import {chromium as playwright} from 'playwright-core';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'../..'),mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://test').pathname).replace(/^\/+/,''),p=resolve(repo,name);if(!p.startsWith(repo+sep)||!['frontline-command/','shared/'].some(x=>name.startsWith(x)))throw Error('path');const bytes=await readFile(p);res.writeHead(200,{'content-type':mime[extname(p)]||'application/octet-stream'});res.end(bytes);}catch{res.writeHead(404).end();}});
let browser;try{
 await new Promise((r,j)=>{server.once('error',j);server.listen(0,'127.0.0.1',r);});
 const req=createRequire(import.meta.url),libs=resolve(await inflate(resolve(dirname(req.resolve('@sparticuz/chromium')),'../bin/al2023.tar.br')),'lib');
 browser=await playwright.launch({executablePath:process.env.FRONTLINE_CHROMIUM_PATH||await chromium.executablePath(),args:chromium.args,headless:true,env:{...process.env,LD_LIBRARY_PATH:[libs,process.env.LD_LIBRARY_PATH].filter(Boolean).join(':')}});
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/frontline-command/index.html`,{waitUntil:'load'});await page.waitForFunction(()=>!!window.__frontline);
 await page.locator('[data-act="settings"]').click();const check=page.locator('#set-occupancy');assert.equal(await check.isChecked(),false);await check.check();
 assert.equal(await page.evaluate(()=>window.__frontline.cfg.flag('movement_occupancy_v1')),true);
 await page.reload();await page.waitForFunction(()=>!!window.__frontline);assert.equal(await page.evaluate(()=>window.__frontline.cfg.flag('movement_occupancy_v1')),true,'setting survives reload');
 await page.evaluate(()=>{let g=window.__frontline.newGame({mode:'commander',aiVsAi:true,seed:7});g.paused=true;});
 const initial=await page.evaluate(()=>{const u=[...window.__frontline.game.units.values()].filter(v=>v.alive&&!v.downed);let overlaps=0;for(let i=0;i<u.length;i++)for(let j=i+1;j<u.length;j++)if(Math.hypot(u[i].x-u[j].x,u[i].y-u[j].y)<u[i].radius+u[j].radius)overlaps++;return {count:u.length,overlaps};});
 assert.equal(initial.count,52);assert.equal(initial.overlaps,0,'normal browser game spawns without overlap');
 const result=await page.evaluate(async()=>{
  const {moveUnit}=await import('./src/sim/units.js'),g=window.__frontline.game;
  g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.walls.enabled=()=>false;g.walls.doorWaypoint=()=>null;g.walls.doorsForUnit=()=>{};g.world.isWalkable=()=>true;g.world.speedAt=()=>1;
  const a=g.spawnUnit(0,'infantry',1000,1000),b=g.spawnUnit(1,'infantry',1030,1000);a.speed=600;
  moveUnit(g,a,1,0,.1);const dx=a.x-1000,dy=a.y-1000,t=Math.max(0,Math.min(1,(30*dx)/(dx*dx+dy*dy||1)));
  return {distance:Math.hypot(dx*t-30,dy*t),r:a.radius+b.radius,vx:a.vx,vy:a.vy};
 });assert.ok(result.distance>=result.r);assert.ok(Math.hypot(result.vx,result.vy)>0);
 const queue=await page.evaluate(async()=>{
  const {moveUnit,updateTimers}=await import('./src/sim/units.js'),g=window.__frontline.game;
  g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.world.isWalkable=(x,y)=>y>=991&&y<=1009;
  const a=g.spawnUnit(0,'infantry',1000,1000),b=g.spawnUnit(0,'infantry',1020,1000);a.goal={x:1200,y:1000};a.speed=55;a.arrived=false;
  for(let i=0;i<170;i++){g.time+=.05;g.dt=.05;updateTimers(g,a,.05);if(a.goal)moveUnit(g,a,1,0,.05);}
  const waited=!!a.goal&&!a.pathFailed;b.y=1050;g.occupancyGrid.update(b);
  for(let i=0;i<35;i++){g.time+=.05;g.dt=.05;updateTimers(g,a,.05);if(a.goal)moveUnit(g,a,1,0,.05);}
  return {waited,passed:a.x>1020};
 });assert.deepEqual(queue,{waited:true,passed:true});
 assert.deepEqual(errors,[]);console.log('Chromium: setting, persistence, collision, movement vector and queue release passed');
}finally{if(browser)await browser.close();if(server.listening)await new Promise(r=>server.close(r));}
