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
    const {chooseVisionNavigation}=await import('/src/sim/vision_nav_policy.js');
    const {moveAlongFlow}=await import('/src/sim/units.js');
    const cfg=buildConfig(structuredClone(window.__frontline.cfg.raw));
    const g=new Game({cfg,seed:1,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.world.hasLOS=()=>true;
    const u=g.spawnUnit(0,'infantry',2000,2000);u.goal={x:2200,y:2000};
    const a=g.spawnUnit(0,'infantry',2050,2000);a.goal={...u.goal};const b=g.spawnUnit(0,'infantry',2080,2000);b.goal={...u.goal};
    const mode=chooseVisionNavigation(g,u).mode;g._visionPolicyMetrics={};moveAlongFlow(g,u,.05);
    const enemy=g.spawnUnit(1,'infantry',2100,2000);const combat=chooseVisionNavigation(g,u).mode;
    cfg.flags.crowd_nav_v2=true;
    const g2=new Game({cfg,seed:2,aiVsAi:true});g2.units.clear();g2.unitGrid.clear();g2.world.hasLOS=()=>true;
    const base=g2.world.buildings.find(b=>b.type==='hq'&&b.faction===0&&g2.walls.state(b)),door=g2.walls.state(base).outline.openings.find(o=>o.type==='door');
    const x=base.x+door.cx,y=base.y+door.cy;
    const units=[0,1,2].map(i=>{const v=g2.spawnUnit(0,'infantry',x+door.nx*(55+i*24),y+door.ny*(55+i*24));v.goal={x:x-door.nx*100,y:y-door.ny*100};return v;});
    moveAlongFlow(g2,units[0],.05);
    return {enabled:cfg.flag('vision_nav_policy_v1',false),mode,combat,dispatched:g._visionPolicyMetrics.group||0,groupUsed:!!units[0]._crowdActive,extra:['arrival_stuck_guard_v1','crowd_slot_avoid_v1','group_nav_pair_v1','vision_nav_fast_v1','safe_vehicle_spawn_v1','motion_slide_guard_v1','near_goal_direct_v1','motion_wall_sweep_v1','vehicle_pickup_exterior_v1','logistics_dropoff_v1','motion_wall_exact_v1','vehicle_spawn_all_v1'].map(id=>cfg.flag(id,false))};
  });}
  await page.goto(base,{waitUntil:'load'});await page.waitForFunction(()=>!!window.__frontline);
  const off=await check();assert.deepEqual(off,{enabled:false,mode:'group',combat:'combat',dispatched:0,groupUsed:false,extra:[false,false,false,false,false,false,false,false,false,false,false,false]});
  await page.route('**/data/feature_flags.json',async r=>{const resp=await r.fetch(),data=await resp.json();
    for(const id of ['vision_nav_policy_v1','group_nav_3to5_v1','arrival_stuck_guard_v1','crowd_slot_avoid_v1','group_nav_pair_v1','vision_nav_fast_v1','safe_vehicle_spawn_v1','motion_slide_guard_v1','near_goal_direct_v1','motion_wall_sweep_v1','vehicle_pickup_exterior_v1','logistics_dropoff_v1','motion_wall_exact_v1','vehicle_spawn_all_v1']){const f=data.flags.find(f=>f.id===id);assert.ok(f);f.enabled=true;}
    await r.fulfill({response:resp,json:data});});
  await page.reload({waitUntil:'load'});await page.waitForFunction(()=>!!window.__frontline);
  const on=await check();assert.deepEqual(on,{enabled:true,mode:'group',combat:'combat',dispatched:1,groupUsed:true,extra:[true,true,true,true,true,true,true,true,true,true,true,true]});
  await page.evaluate(()=>window.__frontline.newGame({seed:1,aiVsAi:true}));
  await page.waitForFunction(()=>window.__frontline.game?.time>0.1,{timeout:30000});assert.deepEqual(errors,[]);
  console.log('Chromium: vision selector off/on, group/combat choice and live ticks checked');
}finally{if(browser)await browser.close();if(server.listening)await new Promise(r=>server.close(r));}
