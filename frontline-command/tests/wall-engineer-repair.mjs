import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {updateSoldier} from '../src/sim/ai_soldier.js';
const cfg=await loadConfig();assert.equal(cfg.flag('wall_engineer_repair_v1',false),false);
for(const faction of [0,1]) {
 const g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.squads.clear();
 const b=g.world.hqOf(faction).structure,st=g.walls.state(b),seg=st.segs[0],geo=st.outline.segments.find(v=>v.id===seg.id);
 const [[a,c],[d,e]]=geo.points, x=b.x+(a+d)/2,y=b.y+(c+e)/2;
 const dx=d-a,dy=e-c,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
 const u=g.spawnUnit(faction,'engineer',x+30*nx,y+30*ny);u.thinkTimer=100;u.perception.hasContact=false;
 assert.equal(g.walls.damageSegment(b,seg.id,1e9,'tank_cannon').breached,true);
 const stock=g.logistics.supply(faction);stock.materials=1000;
 assert.equal(g.build.nearestDamagedWall(u),null,'off does not opt in');
 cfg.flags.wall_engineer_repair_v1=true;
 let t=g.build.nearestDamagedWall(u);assert.equal(t?.building,b);assert.equal(t.segId,seg.id);
 const blocked=g.spawnUnit(faction,'infantry',x,y);let initial=stock.materials;
 assert.equal(g.build.repairWall(t,1,u),0);assert.equal(stock.materials,initial);assert.equal(seg.breached,true,'no closure on live infantry');
 blocked.alive=false;g.unitGrid.clear();g.unitGrid.insert(u);
 u.perception.hasContact=true;assert.equal(g.build.repairWall(t,1,u),0);assert.equal(seg.hp,0);
 u.perception.hasContact=false;u.x=x+90*nx;u.y=y+90*ny;assert.equal(g.build.repairWall(t,1,u),0,'cannot repair from afar');
 u.x=x+30*nx;u.y=y+30*ny;stock.materials=0;assert.equal(g.build.repairWall(t,1,u),0);assert.equal(seg.hp,0);
 stock.materials=0.4;let repaired=g.build.repairWall(t,1,u);assert.ok(Math.abs(repaired-5)<1e-9);assert.ok(stock.materials<1e-9);assert.equal(seg.breached,true,'partial repair leaves breach open');
 const saved=g.walls.serialize();const resumed=new Game({cfg,seed:7,aiVsAi:true});resumed.walls.applySaved(saved);
 const resumedSeg=resumed.walls.segState(resumed.world.hqOf(faction).structure,seg.id);
 assert.equal(resumedSeg.hp,5);assert.equal(resumedSeg.breached,true,'partially repaired breach remains open after load');
 stock.materials=40;repaired=g.build.repairWall(t,100,u);assert.ok(repaired>0);assert.equal(seg.breached,false);
 assert.ok(g.walls.blocksMoveSweep(x-30*nx,y-30*ny,x+30*nx,y+30*ny,1,{isVehicle:false}));assert.ok(g.walls.navQueue.has(b.id));
 stock.materials=1000;const before=seg.hp;updateSoldier(g,u,0.1);assert.ok(seg.hp>before,'engineer AI repairs wall during normal update');assert.ok(u.buildBusy);
 const hp=seg.hp,mats=stock.materials;u.perception.hasContact=true;updateSoldier(g,u,0.1);assert.equal(seg.hp,hp,'wall repair yields to contact');assert.equal(stock.materials,mats);
 const enemy=g.spawnUnit(1-faction,'engineer',u.x,u.y);assert.equal(g.build.repairWall(t,1,enemy),0,'enemy cannot repair');
 // A separate live movement scene: engineer approaches from outside and repairs over time.
 const h=new Game({cfg,seed:7,aiVsAi:true});h.units.clear();h.unitGrid.clear();h.squads.clear();
 const hb=h.world.hqOf(faction).structure,hs=h.walls.state(hb).segs[0],hg=h.walls.state(hb).outline.segments[0];
 const [[ha,hc],[hd,he]]=hg.points,hx=hb.x+(ha+hd)/2,hy=hb.y+(hc+he)/2;
 const hl=Math.hypot(hd-ha,he-hc),hnx=-(he-hc)/hl,hny=(hd-ha)/hl;
 const walker=h.spawnUnit(faction,'engineer',hx-80*hnx,hy-80*hny);walker.thinkTimer=10000;h.logistics.supply(faction).materials=1000;
 assert.ok(h.walls.damageSegment(hb,hs.id,1e9,'tank_cannon').breached);
 let steps=0;while(hs.breached && steps++<1000){h.time+=0.05;h.dt=0.05;updateSoldier(h,walker,0.05);}
 assert.equal(hs.breached,false,`engineer must approach and repair, faction ${faction}`);
 assert.ok(steps>1,'repair takes multiple steps');
 // Approach the same segment from inside the HQ as well. Check normal
 // Game.step, including the wall update, not just a direct repair call.
 for (const side of [-1, 1]) {
  const k=new Game({cfg,seed:7,aiVsAi:true});k.units.clear();k.unitGrid.clear();k.squads.clear();
  k.autopilot.update=()=>{};for(const ai of k.strategic)ai.update=()=>{};
  k.rules.update=()=>{};k.logistics.update=()=>{};k.checkVictory=()=>{};
  const kb=k.world.hqOf(faction).structure,ks=k.walls.state(kb).segs[0],kg=k.walls.state(kb).outline.segments[0];
  const [[ka,kc],[kd,ke]]=kg.points,kx=kb.x+(ka+kd)/2,ky=kb.y+(kc+ke)/2;
  const kl=Math.hypot(kd-ka,ke-kc),knx=-(ke-kc)/kl,kny=(kd-ka)/kl;
  k.walls.damageSegment(kb,ks.id,1e9,'tank_cannon');
  const eng=k.spawnUnit(faction,'engineer',kx+side*80*knx,ky+side*80*kny);eng.thinkTimer=10000;
  k.logistics.supply(faction).materials=1000;
  let elapsed=0;while(ks.breached && elapsed++<1200){
   const ox=eng.x,oy=eng.y;k.step(.05);
   assert.ok(!k.walls.blocksMove(eng.x,eng.y,eng.radius,eng),'no wall overlap');
   assert.ok(Math.hypot(eng.x-ox,eng.y-oy)<=eng.speed*.05+1e-6,'no teleport');
  }
  assert.equal(ks.breached,false,`approach from side ${side}, faction ${faction}`);
 }
 // Isolated soldier updates expose the former faction-1 inside stall; this is
 // deliberately separate from the more realistic Game.step scene above.
 const z=new Game({cfg,seed:7,aiVsAi:true});z.units.clear();z.unitGrid.clear();z.squads.clear();
 const zb=z.world.hqOf(faction).structure,zst=z.walls.state(zb),zs=zst.segs[0],zg=zst.outline.segments[0];
 const [[za,zc],[zd,ze]]=zg.points,zx=zb.x+(za+zd)/2,zy=zb.y+(zc+ze)/2,zl=Math.hypot(zd-za,ze-zc);
 const zu=z.spawnUnit(faction,'engineer',zx-80*(ze-zc)/zl,zy+80*(zd-za)/zl);zu.thinkTimer=10000;
 z.logistics.supply(faction).materials=1000;z.walls.damageSegment(zb,zs.id,1e9,'tank_cannon');
 let zticks=0;while(zs.breached&&zticks++<1200){z.time+=.05;z.dt=.05;updateSoldier(z,zu,.05);}
 assert.equal(zs.breached,false,`isolated inside approach, faction ${faction}`);
 // A blocked sweep must use normal routing rather than the direct shortcut.
 const v=new Game({cfg,seed:7,aiVsAi:true});v.units.clear();v.unitGrid.clear();v.squads.clear();
 const vb=v.world.hqOf(faction).structure,vst=v.walls.state(vb),vs=vst.segs[0],vg=vst.outline.segments[0];
 const [[va,vc],[vd,ve]]=vg.points,vx=vb.x+(va+vd)/2,vy=vb.y+(vc+ve)/2,vl=Math.hypot(vd-va,ve-vc);
 const vu=v.spawnUnit(faction,'engineer',vx-80*(ve-vc)/vl,vy+80*(vd-va)/vl);vu.thinkTimer=10000;
 v.walls.damageSegment(vb,vs.id,1e9,'tank_cannon');v.logistics.supply(faction).materials=1000;
 let waypoints=0;const original=v.walls.doorWaypoint.bind(v.walls);
 v.walls.doorWaypoint=(...args)=>{waypoints++;return original(...args);};
 v.walls.blocksMoveSweep=()=>true;
 v.time+=.05;v.dt=.05;updateSoldier(v,vu,.05);
 assert.ok(waypoints>0,'blocked direct corridor falls back to normal movement');
 cfg.flags.wall_engineer_repair_v1=false;
}
console.log('wall engineer repair: off by default; both factions, breach occupancy, materials, range, ownership and combat priority');
