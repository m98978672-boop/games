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
  const path=resolve(root,name);if(!path.startsWith(root+sep))throw Error('path');res.writeHead(200,{'content-type':mime[extname(path)]||'application/octet-stream','cache-control':'no-store'}).end(await readFile(path));
}catch{res.writeHead(404).end();}});
let browser;
try{
  await new Promise((r,j)=>{server.once('error',j);server.listen(0,'127.0.0.1',r);});
  const req=createRequire(import.meta.url),archive=resolve(dirname(req.resolve('@sparticuz/chromium')),'../bin/al2023.tar.br');
  const libs=resolve(await inflate(archive),'lib');
  browser=await playwright.launch({executablePath:process.env.FRONTLINE_CHROMIUM_PATH||await chromium.executablePath(),args:chromium.args,headless:true,env:{...process.env,LD_LIBRARY_PATH:[libs,process.env.LD_LIBRARY_PATH].filter(Boolean).join(':')}});
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base=`http://127.0.0.1:${server.address().port}/`;
  async function check(){return page.evaluate(async()=>{
    const {Game}=await import('/src/sim/game.js'),{buildConfig}=await import('/src/core/config.js');
    const {thinkSoldier,updateSoldier}=await import('/src/sim/ai_soldier.js');
    const cfg=buildConfig(structuredClone(window.__frontline.cfg.raw));cfg.flags.assault_forts=false;cfg.flags.tank_tactical_v1=false; // isolate vehicle-visible-fire comparison
    const flags={surround:cfg.flag('bot_surround_vision_v1'),vehicle:cfg.flag('vehicle_visible_fire_v1'),obstacle:cfg.flag('bot_obstacle_vision_v1')};
    let g=new Game({cfg,seed:1,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.dt=.05;g.world.hasLOS=()=>true;g.walls.enabled=()=>false;
    let u=g.spawnUnit(0,'infantry',2000,2000),e=g.spawnUnit(1,'infantry',1800,2000);u.facing=u.aimAngle=0;
    const before=u.mag;thinkSoldier(g,u);const rear={contact:u.perception.hasContact,shots:before-u.mag};
    g=new Game({cfg,seed:1,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.dt=.05;
    const b=g.world.buildings.find(b=>b.type==='hq'&&g.walls.state(b)),s=g.walls.state(b).outline.segments.find(s=>s.length>=80&&s.blocksVision);
    const [[a,b0],[c,d]]=s.points,len=Math.hypot(c-a,d-b0),nx=-(d-b0)/len,ny=(c-a)/len,mx=b.x+(a+c)/2,my=b.y+(b0+d)/2;
    u=g.spawnUnit(0,'tank',mx+nx*35,my+ny*35);e=g.spawnUnit(1,'infantry',mx-nx*35,my-ny*35);
    const los=g.world.hasLOS(u.x,u.y,e.x,e.y,true);u.targetId=e.id;u.perception.hasContact=false;u.perception.memory=4;u.thinkTimer=100;
    u.facing=u.aimAngle=u.turretAngle=Math.atan2(e.y-u.y,e.x-u.x);const ammo=u.mag;updateSoldier(g,u,.05);
    return {flags,rear,hiddenTank:{los,shots:ammo-u.mag}};
  });}
  await page.goto(base,{waitUntil:'load'});await page.waitForFunction(()=>!!window.__frontline);
  const off=await check();assert.deepEqual(off.flags,{surround:false,vehicle:false,obstacle:true});assert.deepEqual(off.rear,{contact:false,shots:0});
  assert.deepEqual(off.hiddenTank,{los:false,shots:1});
  await page.route('**/data/feature_flags.json',async r=>{const resp=await r.fetch(),data=await resp.json();
    for(const id of ['bot_surround_vision_v1','vehicle_visible_fire_v1','bot_obstacle_vision_v1']){const f=data.flags.find(f=>f.id===id);if(!f)throw Error('missing flag');f.enabled=true;}
    await r.fulfill({response:resp,json:data});});
  await page.reload({waitUntil:'load'});await page.waitForFunction(()=>!!window.__frontline);
  const on=await check();assert.deepEqual(on.flags,{surround:true,vehicle:true,obstacle:true});assert.deepEqual(on.rear,{contact:true,shots:1});
  assert.deepEqual(on.hiddenTank,{los:false,shots:0});
  await page.evaluate(()=>window.__frontline.newGame({seed:1,aiVsAi:true}));
  await page.waitForFunction(()=>window.__frontline.game?.time>0.1,{timeout:30000});assert.deepEqual(errors,[]);
  console.log('Chromium: surround vision and vehicle LOS off/on, AI decisions and live game ticks checked');
}finally{if(browser)await browser.close();if(server.listening)await new Promise(r=>server.close(r));}
