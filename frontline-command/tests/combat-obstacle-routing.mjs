// Actual soldier AI and Game.step. Low U-shaped obstacle is synthetic; its
// movement collision is real for the scene, but sight is deliberately clear.
import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {Nav} from '../src/sim/nav.js';
import {Walls} from '../src/sim/walls.js';
import {Squad} from '../src/sim/squads.js';

async function scene(faction,seed){
  const cfg=await loadConfig();cfg.flags.assault_forts=false;
  const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();
  for(const sys of [g.squadAI,...g.strategic,g.autopilot,g.rules,g.logistics,g.build,g.influence,g.api])sys.update=()=>{};
  g.checkVictory=()=>{};g.walls.update=()=>{};
  const mirror=x=>faction?1536-x:x;
  const segments=[[760,680,896,680],[896,680,896,856],[896,856,760,856]].map(([a,b,c,d])=>[mirror(a),b,mirror(c),d]);
  const inside=(x,y)=>x>0&&y>0&&x<1536&&y<1536;
  const blocked=(x,y,r)=>segments.some(s=>Walls.distPointSegment(x,y,...s).d<=8+r);
  Object.assign(g.world,{W:1536,H:1536,navVersion:1,isWalkable:(x,y)=>inside(x,y)&&!blocked(x,y,0),
    isBaseWalkable:inside,speedAt:()=>1,terrainAt:()=>0,hasLOS:()=>true});
  Object.assign(g.walls,{enabled:()=>true,doorWaypoint:()=>null,doorsForUnit:()=>{},blocksMove:blocked,
    buildingAtPoint:()=>null,refsNear:()=>[],refsInBox:()=>[],blocksMoveSweep:undefined});
  g.nav=new Nav(g.world,cfg);
  const u=g.spawnUnit(faction,'infantry',mirror(800),768),enemy=g.spawnUnit(1-faction,'infantry',mirror(1318),768,{player:true});
  // Fixed, durable opponent keeps the AI decision and gunfire active; extended
  // vision allows observation over the full detour. No player movement.
  u.vision=650;u.thinkTimer=0;enemy.playerControlled=true;enemy.hp=enemy.maxHp=1000000;
  return {g,u,enemy,blocked};
}
async function run(faction,seed){
  const {g,u,enemy,blocked}=await scene(faction,seed);let crossing=false,maxStep=0,contact=0,search=false,route=false,away=false;
  const initial=Math.hypot(u.x-enemy.x,u.y-enemy.y);
  for(let i=0;i<1600;i++){
    const x=u.x,y=u.y;g.step(.05);const step=Math.hypot(u.x-x,u.y-y);maxStep=Math.max(maxStep,step);
    for(let k=1;k<=Math.ceil(step);k++)if(blocked(x+(u.x-x)*k/Math.ceil(step),y+(u.y-y)*k/Math.ceil(step),u.radius))crossing=true;
    if(u.perception.hasContact)contact++;
    search ||= g._smartRouteState?.active?.unit===u;route ||= !!u._smartRoute;
    if(Math.hypot(u.x-enemy.x,u.y-enemy.y)>initial+20)away=true;
    if(Math.hypot(u.x-enemy.x,u.y-enemy.y)<u.weapon.range*.72)break;
  }
  return {faction,seed,close:Math.hypot(u.x-enemy.x,u.y-enemy.y)<u.weapon.range*.72,search,route,contact,shots:u.shotsFired||0,
    away,crossing,maxStep,limit:u.speed*.05*1.5,seconds:g.time};
}
const results=[];for(const f of [0,1])for(const seed of [5,7,11,23])results.push(await run(f,seed));
console.log(JSON.stringify({total:results.length,passed:results.filter(r=>r.close&&r.search&&r.route&&!r.crossing&&r.away).length,results},null,2));
if(!process.argv.includes('--report')){
  for(const r of results){
    assert.ok(r.close&&r.search&&r.route&&r.away&&!r.crossing&&r.maxStep<=r.limit+1e-8&&r.shots>0,JSON.stringify(r));
  }
  // A moved, invisible or retreated-from opponent must never leave a stale
  // combat detour active. Nor should hold fire create such a detour.
  for(const f of [0,1]) {
    const {g,u}=await scene(f,7);u.vision=540;let searched=false,route=false;
    for(let i=0;i<300;i++){g.step(.05);searched ||= g._smartRouteState?.active?.unit===u;route ||= !!u._smartRoute?.combatTarget;}
    assert.ok(searched&&!route,'reject a detour that would take the enemy outside vision');
  }
  for(const f of [0,1])for(const change of ['moved','invisible','hold','retreat']){
    const {g,u,enemy}=await scene(f,7);let job;
    for(let i=0;i<100;i++){g.step(.05);job=g._smartRouteState?.active;if(job?.unit===u)break;}
    assert.ok(job?.unit===u,`${change}: combat search started`);
    if(change==='moved') enemy.y+=80;
    if(change==='invisible') g.world.hasLOS=()=>false;
    if(change==='hold'||change==='retreat'){
      const sq=new Squad(g,{faction:f});g.squads.set(sq.id,sq);sq.addUnit(u);
      sq.state=change==='hold'?'hold':'retreat';sq.behavior=change==='hold'?'hold':'avoid';sq.fire=change==='hold'?'hold':'free';
      sq.retreatPoint={x:u.x,y:u.y};sq.objective={x:u.x,y:u.y,type:change};
    }
    u.thinkTimer=0;g.step(.05);
    assert.notEqual(g._smartRouteState?.active,job,`${change}: old search released`);
    assert.notEqual(job.planner.status,'running',`${change}: old planner cancelled`);
    assert.ok(!u._smartRoute || u._smartRoute.combatTarget?.id!==enemy.id ||
      Math.hypot(u._smartRoute.combatTarget.x-enemy.x,u._smartRoute.combatTarget.y-enemy.y)<=24,`${change}: no stale target route`);
  }
}
