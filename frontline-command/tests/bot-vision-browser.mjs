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
  const on=await runScene();assert.equal(on.flag,true);assert.equal(on.arrived,true);assert.equal(on.pathFailed,false);
  assert.equal(on.collided,false);assert.ok(on.maxStep<=on.limit+1e-9);
  const distantWall=await page.evaluate(async()=>{
    const {Game}=await import('/src/sim/game.js'),{moveUnit}=await import('/src/sim/units.js');
    const results=[];
    for(const faction of [0,1]) {
      const cfg=window.__frontline.cfg,g=new Game({cfg,seed:5,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();g._wallFollowMetrics={steps:0};
      const s=faction?-1:1,x=1000-s*9.1,y=800;Object.assign(g.world,{W:2048,H:2048,isWalkable:()=>true,isBaseWalkable:()=>true,speedAt:()=>1});
      Object.assign(g.walls,{enabled:()=>true,buildingAtPoint:x=>s*(x-1000)>300?{}:null,doorWaypoint:()=>null,doorsForUnit:()=>{},blocksMove:(x,y,r)=>s*(x-1000)+r>=0,
        blocksMoveSweep:(x1,y1,x2,y2,r)=>Math.max(s*(x1-1000),s*(x2-1000))+r>=0});
      const u=g.spawnUnit(faction,'infantry',x,y);u.goal={x:x+s*800,y};moveUnit(g,u,s,0,.05);
      results.push({steps:g._wallFollowMetrics.steps,dx:u.x-x,dy:u.y-y});
    }
    return results;
  });
  assert.ok(distantWall.every(x=>x.steps===1&&Math.abs(x.dx)<1e-6&&Math.abs(x.dy)>.5),JSON.stringify(distantWall));
  const doorYield=await page.evaluate(async()=>{
    const {Game}=await import('/src/sim/game.js'),{blockedDoorYield}=await import('/src/sim/door_yield_blocked.js');
    const results=[];
    for(const faction of [0,1]){
      const g=new Game({cfg:window.__frontline.cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();
      const b=g.world.buildings.find(x=>x.type==='hq'&&x.faction===faction&&g.walls.state(x)),o=g.walls.state(b).outline.openings.find(x=>x.type==='door'),x=b.x+o.cx,y=b.y+o.cy;
      g.walls.openDoor(b,o.id);const u=g.spawnUnit(faction,'infantry',x+o.nx*8,y+o.ny*8),v=g.spawnUnit(faction,'infantry',x-o.nx*12,y-o.ny*12);
      u.goal={x:x-o.nx*100,y:y-o.ny*100};v.goal={x:x+o.nx*100,y:y+o.ny*100};u.arrived=v.arrived=false;g.time=2;
      u._occupancyWait={goalX:u.goal.x,goalY:u.goal.y,since:0,lastBlocked:2,blockerId:v.id};const goal=u.goal,p=blockedDoorYield(g,u);
      u.perception.hasContact=true;results.push({created:!!p,preserved:u.goal===goal,cancelled:blockedDoorYield(g,u)===null});
    }return results;
  });
  assert.ok(doorYield.every(x=>x.created&&x.preserved&&x.cancelled),JSON.stringify(doorYield));
  const wallOrders=await page.evaluate(async()=>{
    const {Game}=await import('/src/sim/game.js'),{Squad}=await import('/src/sim/squads.js');
    const results=[];
    for(const faction of [0,1])for(const dir of [-1,1])for(const kind of ['move','hold']){
      const g=new Game({cfg:window.__frontline.cfg,seed:7,aiVsAi:true});
      g.units.clear();g.unitGrid.clear();g.squads.clear();g.api.orders=[];
      for(const sys of [...g.strategic,g.autopilot,g.rules,g.logistics,g.build,g.influence])sys.update=()=>{};
      g.checkVictory=()=>{};
      const b=g.world.buildings.find(b=>b.faction===faction&&b.type==='hq'&&g.walls.state(b));
      const s=g.walls.state(b).outline.segments.find(s=>s.length>=80&&s.blocksMove);
      const [[ax,ay],[bx,by]]=s.points,len=Math.hypot(bx-ax,by-ay),nx=-(by-ay)/len,ny=(bx-ax)/len;
      const mx=b.x+(ax+bx)/2,my=b.y+(ay+by)/2;
      const u=g.spawnUnit(faction,'infantry',mx+dir*nx*28,my+dir*ny*28),goal={x:mx-dir*nx*28,y:my-dir*ny*28};
      const sq=new Squad(g,{faction});g.squads.set(sq.id,sq);sq.addUnit(u);sq.retreatTier='never';sq.strategyId='rush';
      const order=g.api.issue({source:'player',type:kind,faction,squadIds:[sq.id],target:goal});
      let crossed=false,arrived=false;
      for(let i=0;i<1200;i++){
        const x=u.x,y=u.y;g.step(.05);
        if(Math.hypot(x-u.x,y-u.y)>1e-8&&g.walls.blocksMoveSweep(x,y,u.x,u.y,u.radius,u))crossed=true;
        if(order.status==='accepted'&&sq.state==='hold'){
          arrived=Math.hypot(u.x-goal.x,u.y-goal.y)<90&&!g.walls.blocksMoveSweep(u.x,u.y,goal.x,goal.y,u.radius,u);break;
        }
      }
      results.push({arrived,crossed});
    }
    return results;
  });
  assert.equal(wallOrders.length,8);assert.ok(wallOrders.every(x=>x.arrived&&!x.crossed),'real HQ wall orders reach the correct side');
  const combat=await page.evaluate(async()=>{
    const {Game}=await import('/src/sim/game.js'),{Nav}=await import('/src/sim/nav.js'),{Walls}=await import('/src/sim/walls.js');
    const results=[];
    for(const faction of [0,1]){
      const g=new Game({cfg:window.__frontline.cfg,seed:7,aiVsAi:true});
      g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();
      for(const sys of [g.squadAI,...g.strategic,g.autopilot,g.rules,g.logistics,g.build,g.influence,g.api])sys.update=()=>{};
      g.checkVictory=()=>{};g.walls.update=()=>{};
      const mirror=x=>faction?1536-x:x,segments=[[760,680,896,680],[896,680,896,856],[896,856,760,856]].map(([a,b,c,d])=>[mirror(a),b,mirror(c),d]);
      const inside=(x,y)=>x>0&&y>0&&x<1536&&y<1536,blocked=(x,y,r)=>segments.some(s=>Walls.distPointSegment(x,y,...s).d<=8+r);
      Object.assign(g.world,{W:1536,H:1536,navVersion:1,isWalkable:(x,y)=>inside(x,y)&&!blocked(x,y,0),isBaseWalkable:inside,speedAt:()=>1,terrainAt:()=>0,hasLOS:()=>true});
      Object.assign(g.walls,{enabled:()=>true,doorWaypoint:()=>null,doorsForUnit:()=>{},blocksMove:blocked,buildingAtPoint:()=>null,refsNear:()=>[],refsInBox:()=>[],blocksMoveSweep:undefined});
      g.nav=new Nav(g.world,g.cfg);
      const u=g.spawnUnit(faction,'infantry',mirror(800),768),e=g.spawnUnit(1-faction,'infantry',mirror(1318),768,{player:true});
      u.vision=650;u.thinkTimer=0;e.playerControlled=true;e.hp=e.maxHp=1000000;
      let crossed=false,route=false;
      for(let i=0;i<1600;i++){
        const x=u.x,y=u.y;g.step(.05);const step=Math.hypot(u.x-x,u.y-y);route ||= !!u._smartRoute;
        for(let k=1;k<=Math.ceil(step);k++)if(blocked(x+(u.x-x)*k/Math.ceil(step),y+(u.y-y)*k/Math.ceil(step),u.radius))crossed=true;
        if(Math.hypot(u.x-e.x,u.y-e.y)<u.weapon.range*.72)break;
      }
      results.push({close:Math.hypot(u.x-e.x,u.y-e.y)<u.weapon.range*.72,route,crossed,shots:u.shotsFired||0});
    }
    return results;
  });
  assert.ok(combat.every(x=>x.close&&x.route&&!x.crossed&&x.shots>0),'combat AI detours and shoots in both factions');
  const groups=await page.evaluate(async()=>{
    const {Game}=await import('/src/sim/game.js');const results=[];
    for(const faction of [0,1]){
      const g=new Game({cfg:window.__frontline.cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();
      for(const s of [g.squadAI,...g.strategic,g.autopilot,g.rules,g.logistics,g.build,g.influence,g.api])s.update=()=>{};g.checkVictory=()=>{};
      const dir=faction?-1:1,goal={x:900,y:500},us=Array.from({length:5},(_,i)=>{const u=g.spawnUnit(faction,'infantry',goal.x-dir*(125+i*23),goal.y);u.goal={...goal};u.activity='advance';u.arrived=false;u.thinkTimer=1000;return u});let overlap=false,wall=false,group=false;
      for(let t=0;t<1200;t++){const before=us.map(u=>({x:u.x,y:u.y}));g.step(.05);for(let i=0;i<us.length;i++){const u=us[i],p=before[i];if(Math.hypot(u.x-p.x,u.y-p.y)>1e-6&&g.walls.blocksMoveSweep(p.x,p.y,u.x,u.y,u.radius,u))wall=true;group ||= !!u._crowdOpenGroup;}
        overlap ||= us.some((a,i)=>us.slice(i+1).some(b=>Math.hypot(a.x-b.x,a.y-b.y)<a.radius+b.radius-1e-6));if(us.every(u=>u.arrived||u.pathFailed))break;}
      results.push({arrived:us.filter(u=>u.arrived&&!u.pathFailed).length,overlap,wall,group});
    }return results;
  });
  assert.ok(groups.every(x=>x.arrived===5&&!x.overlap&&!x.wall&&x.group),'open shared-goal group reaches distinct positions on the real map');
  const traffic=await page.evaluate(async()=>{
    const {Game}=await import('/src/sim/game.js');const results=[];
    for(const faction of [0,1]) {
      const g=new Game({cfg:window.__frontline.cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();
      for(const s of [g.squadAI,...g.strategic,g.autopilot,g.rules,g.logistics,g.build,g.influence,g.api])s.update=()=>{};g.checkVictory=()=>{};g._trafficEscapeMetrics={chosen:0};
      const dir=faction?-1:1,goal={x:900,y:500},us=Array.from({length:8},(_,i)=>{const u=g.spawnUnit(faction,'infantry',goal.x-dir*(125+i*23),goal.y);u.goal={...goal};u.activity='advance';u.arrived=false;u.thinkTimer=1000;return u});let overlap=false,wall=false,speed=false,large=false;
      for(let t=0;t<1200;t++){const before=us.map(u=>({x:u.x,y:u.y,terrain:g.world.speedAt(u.x,u.y)}));g.step(.05);for(let i=0;i<us.length;i++){const u=us[i],p=before[i],d=Math.hypot(u.x-p.x,u.y-p.y);large ||= !!u._crowdOpenLarge;if(d>1e-6&&g.walls.blocksMoveSweep(p.x,p.y,u.x,u.y,u.radius,u))wall=true;if(d>Math.max(u.speed*p.terrain,30)*.05*1.5+1e-8)speed=true;}
        overlap ||= us.some((a,i)=>us.slice(i+1).some(b=>Math.hypot(a.x-b.x,a.y-b.y)<a.radius+b.radius-1e-6));if(us.every(u=>u.arrived||u.pathFailed))break;}
      results.push({arrived:us.filter(u=>u.arrived&&!u.pathFailed).length,overlap,wall,speed,large,escapes:g._trafficEscapeMetrics.chosen});
    }return results;
  });
  assert.ok(traffic.every(x=>x.arrived>=4&&x.large&&!x.overlap&&!x.wall&&!x.speed),JSON.stringify(traffic));
  const assembly=await page.evaluate(async()=>{
    const {Game}=await import('/src/sim/game.js'),{Squad}=await import('/src/sim/squads.js');const results=[];
    for(const faction of [0,1]){
      const g=new Game({cfg:window.__frontline.cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();
      const b=g.world.buildings.find(b=>b.type==='hq'&&b.faction===faction&&g.walls.state(b)),seg=g.walls.state(b).outline.segments.find(s=>s.length>=80&&s.blocksMove);
      const [[ax,ay],[bx,by]]=seg.points,len=Math.hypot(bx-ax,by-ay),nx=-(by-ay)/len,ny=(bx-ax)/len,tx=(bx-ax)/len,ty=(by-ay)/len,mx=b.x+(ax+bx)/2,my=b.y+(ay+by)/2;
      const sign=g.walls.buildingAtPoint(mx+nx*35,my+ny*35)===b?1:-1,goal={x:mx+sign*nx*35,y:my+sign*ny*35};
      const sq=new Squad(g,{faction});g.squads.set(sq.id,sq);sq.retreatTier='never';sq.strategyId='rush';
      for(const [x,y] of [[goal.x,goal.y],[goal.x+tx*22,goal.y+ty*22],[mx-sign*nx*30,my-sign*ny*30]])sq.addUnit(g.spawnUnit(faction,'infantry',x,y));
      sq.objective={...goal,type:'move'};sq.state='advance';g.squadAI.think(sq);const waiting=sq.state==='advance';g.time=21;g.squadAI.think(sq);results.push({waiting,timeout:sq.state==='hold'});
    }return results;
  });
  assert.ok(assembly.every(x=>x.waiting&&x.timeout),'squad does not abandon a laggard across a wall, but waiting is bounded');
  await page.evaluate(()=>window.__frontline.newGame({seed:1,aiVsAi:true}));
  await page.waitForFunction(()=>window.__frontline.game?.time>0.1,{timeout:30000});
  assert.deepEqual(errors,[]);console.log('Chromium: default-on U detour, collision/speed check, live game ticks, no page errors');
}finally{if(browser)await browser.close();if(server.listening)await new Promise(r=>server.close(r));}
