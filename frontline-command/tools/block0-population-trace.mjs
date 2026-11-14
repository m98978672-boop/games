// Diagnose the existing 400/500 browser workload without restricting spawns.
// This is NOT an FPS acceptance benchmark or an exact-population mode.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import chromium, { inflate } from '@sparticuz/chromium';
import { chromium as playwright } from 'playwright-core';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
  try {
    const name=decodeURIComponent(new URL(req.url,'http://local.test').pathname).replace(/^\/+/, '') || 'index.html';
    if(name.split(/[\\/]/).includes('..') || !(['index.html','style.css','cover.svg'].includes(name) || ['src/','data/','assets/'].some(p=>name.startsWith(p)))) {res.writeHead(404).end();return;}
    const p=resolve(root,name); if(!p.startsWith(root+sep)) {res.writeHead(404).end();return;}
    res.writeHead(200,{'Content-Type':mime[extname(p)]||'application/octet-stream','Cache-Control':'no-store'}).end(await readFile(p));
  } catch {res.writeHead(404).end();}
});
let browser; const measurements=[];
try {
  if(process.platform!=='linux'||process.arch!=='x64')throw Error('requires Linux x64 Chromium');
  await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'0.0.0.0',ok);});
  const req=createRequire(import.meta.url);
  const libs=resolve(await inflate(resolve(dirname(req.resolve('@sparticuz/chromium')),'../bin/al2023.tar.br')),'lib');
  const executablePath=process.env.FRONTLINE_CHROMIUM_PATH || await chromium.executablePath();
  let browserVersion='';
  for(const target of [400,500]){
    // The bundled single-process Chromium can exit when its last page closes;
    // use a fresh browser for each independent workload, as the FPS harness does.
    browser=await playwright.launch({executablePath,args:chromium.args,headless:true,env:{...process.env,LD_LIBRARY_PATH:[libs,process.env.LD_LIBRARY_PATH].filter(Boolean).join(':')}});
    browserVersion ||= browser.version();
    const page=await browser.newPage({viewport:{width:1280,height:900},deviceScaleFactor:1});const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`,{waitUntil:'load',timeout:60000});
    await page.waitForFunction(()=>!!window.__frontline,{timeout:60000});
    const result=await page.evaluate(async target=>{
      const app=window.__frontline, g=app.newGame({seed:5,aiVsAi:true,difficulty:'regular'});
      const alive=f=>[...g.units.values()].filter(u=>u.alive&&(f===null||u.faction===f)).length;
      for(const f of [0,1]){const hq=g.world.hqOf(f);let k=0;while(alive(f)<target/2){const a=k*2.399963229728653,r=150+(k%10)*20;g.spawnUnit(f,k%11===0?'mg':'infantry',hq.x+Math.cos(a)*r,hq.y+Math.sin(a)*r,{});k++;}}
      const initial=alive(null), startTime=performance.now(), events=[], samples=[], known=new Map();
      for(const u of g.units.values()) if(u.alive) known.set(u.id,{faction:u.faction,role:u.role});
      const original=g.spawnUnit;
      g.spawnUnit=function(...args){const stack=new Error().stack;const u=original.apply(this,args);events.push({kind:'spawn',wallMs:performance.now()-startTime,simTime:this.time,id:u.id,role:u.role,faction:u.faction,stack});return u;};
      const collect=()=>{const now=new Map([...g.units.values()].filter(u=>u.alive).map(u=>[u.id,{faction:u.faction,role:u.role}]));
        for(const [id,unit] of known)if(!now.has(id))events.push({kind:'no_longer_alive_at_sample',wallMs:performance.now()-startTime,simTime:g.time,id,...unit});
        known.clear();for(const [id,unit] of now)known.set(id,unit);
        samples.push({wallMs:performance.now()-startTime,simTime:g.time,alive:now.size,faction0:alive(0),faction1:alive(1)});
      };
      collect();
      await new Promise(resolve=>{const timer=setInterval(collect,1000);setTimeout(()=>{clearInterval(timer);collect();resolve();},15000);});
      g.spawnUnit=original;
      return {target,seed:5,initial,samples,events,warOver:g.warOver,sameGame:app.game===g};
    },target);
    result.pageErrors=errors; measurements.push(result);await browser.close();browser=null;
  }
  console.log(JSON.stringify({kind:'population_diagnostic',browser:`Chromium ${browserVersion}`,mode:'headless software rendering',note:'Natural spawns not suppressed; timer samples may miss brief count fluctuations. Not performance acceptance.',measurements},null,2));
  if(measurements.some(r=>r.pageErrors.length||!r.sameGame||r.initial!==r.target||r.samples.length<2))process.exitCode=1;
}catch(e){console.error(e.stack||String(e));process.exitCode=1;}finally{if(browser)await browser.close();if(server.listening)await new Promise(ok=>server.close(ok));}
