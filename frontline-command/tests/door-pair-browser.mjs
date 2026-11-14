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
    const cfg=buildConfig(structuredClone(window.__frontline.cfg.raw));
    const enabled=cfg.flag('door_pair_lanes_v1',false),g=new Game({cfg,seed:1,aiVsAi:true});
    g.units.clear();g.unitGrid.clear();g.squads.clear();g.autopilot.update=()=>{};
    const b=g.world.buildings.find(b=>b.type==='hq'&&b.faction===0&&g.walls.state(b));
    const o=g.walls.state(b).outline.openings.find(o=>o.type==='door'),px=b.x+o.cx,py=b.y+o.cy;
    const us=[-1,1].map(side=>{const u=g.spawnUnit(0,'infantry',px+side*o.nx*85,py+side*o.ny*85);
      u.goal={x:px-side*o.nx*105,y:py-side*o.ny*105};u.activity='advance';u.thinkTimer=100;return u;});
    let overlap=0,active=0;for(let t=0;t<1200;t++){g.step(.05);
      if(Math.hypot(us[0].x-us[1].x,us[0].y-us[1].y)<us[0].radius+us[1].radius)overlap++;
      if(us.some(u=>u._doorPass))active++;if(us.every(u=>u.arrived||u.pathFailed))break;}
    return {enabled,arrived:us.filter(u=>u.arrived&&!u.pathFailed).length,overlap,active};
  });}
  await page.goto(base,{waitUntil:'load'});await page.waitForFunction(()=>!!window.__frontline);
  const off=await check();assert.equal(off.enabled,false);assert.equal(off.arrived,2);assert.ok(off.overlap>0);assert.equal(off.active,0);
  await page.route('**/data/feature_flags.json',async r=>{const resp=await r.fetch(),data=await resp.json();
    const f=data.flags.find(f=>f.id==='door_pair_lanes_v1');assert.ok(f);f.enabled=true;
    await r.fulfill({response:resp,json:data});});
  await page.reload({waitUntil:'load'});await page.waitForFunction(()=>!!window.__frontline);
  const on=await check();assert.equal(on.enabled,true);assert.equal(on.arrived,2);assert.equal(on.overlap,0);assert.ok(on.active>0);
  await page.evaluate(()=>window.__frontline.newGame({seed:1,aiVsAi:true}));
  await page.waitForFunction(()=>window.__frontline.game?.time>0.1,{timeout:30000});assert.deepEqual(errors,[]);
  console.log('Chromium: door-pair off/on in isolated Game.step, and live game ticks checked');
}finally{if(browser)await browser.close();if(server.listening)await new Promise(r=>server.close(r));}
