// Real Command API + squad and soldier simulation. No model inference.
import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {Squad} from '../src/sim/squads.js';
import {Save} from '../src/core/save.js';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
const cfg=await loadConfig();
function fixture(faction,swapSides=false){
 const g=new Game({cfg,seed:7,aiVsAi:true,swapSides});
 g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();g.api.orders=[];
 for(const ai of g.strategic)ai.update=()=>{};g.autopilot.update=()=>{};g.rules.update=()=>{};g.build.update=()=>{};g.influence.update=()=>{};g.checkVictory=()=>{};
 const sq=new Squad(g,{faction});g.squads.set(sq.id,sq);return {g,sq};
}
function findOpen(g){
 for(let y=400;y<g.world.H-400;y+=120)for(let x=400;x<g.world.W-800;x+=120){
  const a={x,y},b={x:x+300,y},c={x:x+600,y};let clear=true;
  for(let i=0;i<=60;i++){const px=x+i*10;if(!g.world.isWalkable(px,y)||g.walls.blocksMove(px,y,10)){clear=false;break;}}
  if(clear)return {a,b,c};
 }
 throw Error('no open corridor');
}
function issue(g,sq,type,target){
 const o=g.api.issue({source:'player',type,faction:sq.faction,squadIds:[sq.id],target});
 for(let i=0;i<300&&o.status==='queued';i++)g.step(.05);
 return o;
}
for(const swapSides of [false,true])for(const faction of [0,1])for(const strategy of ['cautious','defense_depth']){
 const {g,sq}=fixture(faction,swapSides),{a,b,c}=findOpen(g);
 const u=g.spawnUnit(faction,'infantry',a.x,a.y);sq.addUnit(u);sq.retreatTier='never';sq.strategyId=strategy;
 const first=issue(g,sq,'hold',b);assert.equal(first.status,'accepted');
 assert.equal(sq.objective.type,'hold');assert.equal(sq.state,'advance','a distant hold order must approach its target');
 for(let i=0;i<1200&&sq.state!=='hold';i++)g.step(.05);
 assert.equal(sq.state,'hold','unit physically reached first hold target');
 assert.ok(Math.hypot(u.x-b.x,u.y-b.y)<110,'unit is near first target');
 const second=issue(g,sq,'hold',c);assert.equal(second.status,'accepted');assert.equal(sq.state,'advance','new hold target must clear old hold position');
 for(let i=0;i<1200&&sq.state!=='hold';i++)g.step(.05);
 assert.equal(sq.state,'hold','unit physically reached second target');assert.ok(Math.hypot(u.x-c.x,u.y-c.y)<110);
 const stationary=issue(g,sq,'hold',null);assert.equal(stationary.status,'accepted');assert.equal(sq.state,'hold','hold without a destination keeps the current position');
}
for(const swapSides of [false,true])for(const faction of [0,1]){
 const {g,sq}=fixture(faction,swapSides),{a}=findOpen(g),u=g.spawnUnit(faction,'infantry',a.x,a.y);sq.addUnit(u);
 u.mag=0;u.reserve=0;
 const expected=g.world.nearestPoint(u.x,u.y,p=>p.owner===faction&&p.hp>0&&['hq','depot','factory'].includes(p.type)).point;
 assert.ok(expected);const o=issue(g,sq,'resupply',{x:u.x,y:u.y});assert.equal(o.status,'accepted');
 assert.equal(sq.objective.pointId,expected.id);assert.deepEqual(sq.retreatPoint,{x:expected.x,y:expected.y});
 assert.ok(Number.isFinite(sq.objective.x)&&Number.isFinite(sq.objective.y),'resupply target is a real point');
}
for(const faction of [0,1]){
 const {g,sq}=fixture(faction),{a}=findOpen(g),u=g.spawnUnit(faction,'infantry',a.x,a.y);sq.addUnit(u);
 for(const p of g.world.points)if(p.owner===faction&&['hq','depot','factory'].includes(p.type))p.owner=1-faction;
 const old=sq.objective,o=issue(g,sq,'resupply',{x:u.x,y:u.y});assert.equal(o.status,'refused','no friendly supply source');assert.equal(sq.objective,old);
}
for(const faction of [0,1]){
 const {g,sq}=fixture(faction);let chosen;
 for(const p of g.world.points.filter(p=>p.owner===faction&&p.hp>0&&['depot','hq','factory'].includes(p.type))) {
  for(let i=0;i<24&&!chosen;i++){
   const angle=i*Math.PI/12,dx=Math.cos(angle),dy=Math.sin(angle),x=p.x+dx*420,y=p.y+dy*420;
   if(!g.world.isWalkable(x,y)||g.walls.blocksMove(x,y,10))continue;
   if(g.world.nearestPoint(x,y,q=>q.owner===faction&&q.hp>0&&['depot','hq','factory'].includes(q.type)).point!==p)continue;
   let clear=true;for(let d=420;d>=230;d-=10)if(!g.world.isWalkable(p.x+dx*d,p.y+dy*d)||g.walls.blocksMove(p.x+dx*d,p.y+dy*d,10)){clear=false;break;}
   if(clear)chosen={p,x,y};
  }
  if(chosen)break;
 }
 assert.ok(chosen,'accessible approach to friendly supply');
 const u=g.spawnUnit(faction,'infantry',chosen.x,chosen.y);sq.addUnit(u);sq.retreatTier='never';u.mag=u.magCapacity;u.reserve=Math.floor(u.reserveCapacity*0.5);
 const before=u.reserve;g.logistics.stock[faction].ammo=1000;const o=issue(g,sq,'resupply',{x:u.x,y:u.y});assert.equal(o.status,'accepted');
 assert.equal(sq.objective.pointId,chosen.p.id);assert.equal(u.reserve,before,'not remotely replenished');
 for(let i=0;i<1600&&u.reserve===before;i++){g.step(.05);assert.equal(sq.state,'regroup','keep travelling for requested supplies');}
 assert.ok(u.reserve>before,`faction ${faction} physically received ammunition, distance ${Math.hypot(u.x-chosen.p.x,u.y-chosen.p.y).toFixed(1)}`);
 assert.ok(Math.hypot(u.x-chosen.p.x,u.y-chosen.p.y)<260,'replenishment only near friendly source');
 for(let i=0;i<40&&sq.state==='regroup';i++)g.step(.05);
 assert.equal(sq.state,'hold','completed resupply releases squad');assert.equal(sq.objective,null);
}
for(const faction of [0,1]){
 const {g,sq}=fixture(faction),{a}=findOpen(g),u=g.spawnUnit(faction,'infantry',a.x,a.y);sq.addUnit(u);u.reserve=0;u.mag=0;
 const o=issue(g,sq,'resupply',{x:u.x,y:u.y});assert.equal(o.status,'accepted');
 g.time=40;g.api.orders=[];g.strategic[faction].plan(cfg.ai.strategic);
 assert.equal(g.api.orders.filter(order=>order.type==='resupply').length,0,'do not interrupt an active supply trip with duplicate orders');
 const first=g.world.pointById(sq.objective.pointId);first.owner=1-faction;
 for(let i=0;i<30&&sq.objective?.pointId===first.id;i++)g.step(.05);
 assert.ok(sq.objective&&sq.objective.pointId!==first.id,'retarget if supply source is captured');
 assert.equal(g.world.pointById(sq.objective.pointId).owner,faction);
 for(const p of g.world.points)if(p.owner===faction&&['hq','depot','factory'].includes(p.type))p.owner=1-faction;
 for(let i=0;i<30&&sq.objective;i++)g.step(.05);
 assert.equal(sq.objective,null,'stop when no supply source remains');assert.equal(sq.state,'hold');
}
for(const faction of [0,1]){
 const {g,sq}=fixture(faction),{a}=findOpen(g),u=g.spawnUnit(faction,'infantry',a.x,a.y);sq.addUnit(u);u.reserve=0;u.mag=5;
 g.logistics.stock[faction].ammo=0;g.logistics.stepProduction=()=>{};
 assert.equal(issue(g,sq,'resupply',{x:u.x,y:u.y}).status,'accepted');
 for(let i=0;i<200;i++)g.step(.05);
 assert.equal(u.reserve,0,'no ammunition is fabricated when stock is empty');assert.equal(sq.state,'regroup','supply trip remains active without stock');
}
for(const useExtendedSave of [false,true])for(const faction of [0,1]){
 cfg.flags.alg_save=useExtendedSave;
 const {g,sq}=fixture(faction),{a}=findOpen(g),u=g.spawnUnit(faction,'infantry',a.x,a.y);sq.addUnit(u);u.mag=5;u.reserve=0;
 assert.equal(issue(g,sq,'resupply',{x:u.x,y:u.y}).status,'accepted');
 assert.equal(Save.saveWar(g),true);const data=Save.loadWar();const restored=new Game({cfg,seed:7,aiVsAi:true});assert.equal(Save.applyWar(restored,data),true);
 const loaded=restored.squads.get(sq.id);assert.ok(loaded&&loaded.count());assert.equal(loaded.state,'regroup');
 assert.deepEqual(loaded.retreatPoint,sq.retreatPoint);assert.equal(loaded.objective.pointId,sq.objective.pointId);
 restored.squadAI.think(loaded);restored.squadAI.moveAnchor(loaded,.05);
 assert.equal(loaded.state,'regroup');assert.ok(Number.isFinite(loaded.anchor.x)&&Number.isFinite(loaded.anchor.y),'restored trip has a valid target');
}
console.log('squad orders: radio and physical movement to two hold positions, real resupply, rerouting and no-source refusal, both factions, swapped starts and save formats');

// Exercise the actual automated radio order, not a direct call to reinforceSquad.
for (const faction of [0,1]) {
 const {g,sq}=fixture(faction),{a}=findOpen(g);
 sq.templateId='assault';sq.template=cfg.templates.assault;
 sq.addUnit(g.spawnUnit(faction,'infantry',a.x,a.y));
 for (const key of Object.keys(g.logistics.stock[faction])) g.logistics.stock[faction][key]=100000;
 g.time=40;g.autopilot.maintainSquads(faction);
 const order=g.api.orders.find(o=>o.type==='reinforce');assert.ok(order,'autopilot queued a reinforcement');
 for(let i=0;i<400&&order.status==='queued';i++)g.step(.05);
 assert.equal(order.status,'accepted',`reinforcement must reach executeCommand: ${order.result}`);
 assert.equal(sq.count(),6,'missing squad members are created');
}
for (const swapSides of [false,true]) for (const faction of [0,1]) {
 const {g,sq}=fixture(faction,swapSides),{a,b,c}=findOpen(g);
 const u=g.spawnUnit(faction,'infantry',a.x,a.y);sq.addUnit(u);sq.retreatTier='never';
 sq.retreatPoint=c; // an earlier retreat must not override the new destination
 const o=issue(g,sq,'retreat',b);assert.equal(o.status,'accepted');
 assert.deepEqual(sq.retreatPoint,b,'explicit retreat replaces the previous rally destination');
 for(let i=0;i<1000&&sq.state==='retreat';i++)g.step(.05);
 assert.ok(Math.hypot(u.x-b.x,u.y-b.y)<160,'soldier physically approaches the new retreat target');
}
console.log('reinforcement dispatch and explicit retreat: both factions and swapped sides');

for (const faction of [0,1]) {
 const {g,sq}=fixture(faction),{a}=findOpen(g);sq.templateId='assault';sq.template=cfg.templates.assault;
 sq.addUnit(g.spawnUnit(faction,'infantry',a.x,a.y));
 for (const key of Object.keys(g.logistics.stock[faction])) g.logistics.stock[faction][key]=0;
 const empty=g.api.issue({source:'autopilot',type:'reinforce',faction,params:{squadId:sq.id}});
 for(let i=0;i<300&&empty.status==='queued';i++)g.step(.05);
 assert.equal(empty.status,'refused');assert.match(empty.result,/ресурс/);assert.equal(sq.count(),1,'no free reinforcement');
 const wrong=g.api.issue({source:'enemyAI',type:'reinforce',faction:1-faction,params:{squadId:sq.id}});
 for(let i=0;i<300&&wrong.status==='queued';i++)g.step(.05);
 assert.equal(wrong.status,'refused');assert.equal(sq.count(),1,'cannot reinforce the other faction');
}
for (const useExtendedSave of [false,true]) for (const faction of [0,1]) {
 cfg.flags.alg_save=useExtendedSave;
 const {g,sq}=fixture(faction),{a,b,c}=findOpen(g),u=g.spawnUnit(faction,'infantry',a.x,a.y);sq.addUnit(u);sq.retreatTier='never';sq.retreatPoint=c;
 assert.equal(issue(g,sq,'retreat',b).status,'accepted');
 assert.equal(Save.saveWar(g),true);const data=Save.loadWar(),restored=new Game({cfg,seed:7,aiVsAi:true});assert.equal(Save.applyWar(restored,data),true);
 const loaded=restored.squads.get(sq.id);assert.deepEqual(loaded.retreatPoint,b,'save preserves the correct retreat destination');
 for(const ai of restored.strategic)ai.update=()=>{};restored.autopilot.update=()=>{};restored.rules.update=()=>{};restored.build.update=()=>{};restored.influence.update=()=>{};restored.checkVictory=()=>{};
 for(let i=0;i<1000&&loaded.state==='retreat';i++)restored.step(.05);
 const lu=loaded.units()[0];assert.ok(Math.hypot(lu.x-b.x,lu.y-b.y)<160,'restored soldier approaches retreat target');
}
console.log('reinforcement refusal, faction isolation and retreat continuation after both save formats');
