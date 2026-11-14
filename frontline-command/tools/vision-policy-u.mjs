// Isolated paired U scenario, 20 seeds; not crowd, combat or browser acceptance.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { Nav } from '../src/sim/nav.js';
import { Walls } from '../src/sim/walls.js';
import { moveAlongFlow, updateTimers } from '../src/sim/units.js';
const nArg=process.argv.find(s=>s.startsWith('--seeds='));const seeds=nArg?Number(nArg.slice(8)):20;
if(!Number.isSafeInteger(seeds)||seeds<1||seeds>1000)throw Error('invalid seeds');
const group=process.argv.includes('--group');
const cfg=await loadConfig();cfg.flags.pathing_v2=true;cfg.flags.smart_route_v2=false;cfg.flags.vehicle_detour_v2=false;
function run(role,seed,faction,on){
  cfg.flags.bot_obstacle_vision_v1=true;cfg.flags.vision_nav_policy_v1=on;
  const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();
  const width=1280,mirror=x=>faction?width-x:x;
  const seg=[[320,352,672,352],[672,352,672,672],[672,672,320,672]].map(([a,b,c,d])=>[mirror(a),b,mirror(c),d]);
  const inside=(x,y)=>x>0&&y>0&&x<width&&y<width;
  const blocked=(x,y,r)=>seg.some(s=>Walls.distPointSegment(x,y,...s).d<=8+r);
  g.world={W:width,H:width,navVersion:1,isWalkable:(x,y)=>inside(x,y)&&!blocked(x,y,0),isBaseWalkable:inside,speedAt:()=>1,terrainAt:()=>0,hasLOS:()=>true};
  g.walls={enabled:()=>true,doorWaypoint:()=>null,doorsForUnit:()=>{},blocksMove:blocked};g.world.walls=g.walls;g.nav=new Nav(g.world,cfg);
  const u=g.spawnUnit(faction,role,mirror(512),512);u.goal={x:mirror(900),y:512};u.activity='advance';
  if(group)for(const x of [477,442]){const ally=g.spawnUnit(faction,'infantry',mirror(x),512);ally.goal={...u.goal};}
  const initial=Math.hypot(u.goal.x-u.x,u.goal.y-u.y);let maxStep=0,collided=false,movesAway=false,earlyStarts=0;
  for(let i=0;i<600;i++){
    const x=u.x,y=u.y;g.time+=.05;g.nav.advance();updateTimers(g,u,.05);
    const previous=g._smartRouteState?.active,stuck=u.stuck||0;moveAlongFlow(g,u,.05);
    if(!previous && g._smartRouteState?.active?.unit===u && stuck<1)earlyStarts++;
    maxStep=Math.max(maxStep,Math.hypot(u.x-x,u.y-y));collided ||= blocked(u.x,u.y,u.radius);
    movesAway ||= !!u.goal&&Math.hypot(u.goal.x-u.x,u.goal.y-u.y)>initial+32;
    if(u.arrived||u.pathFailed)break;
  }
  const noTeleport=maxStep<=u.speed*.05*1.5+1e-9;
  return {arrived:!!u.arrived,pathFailed:!!u.pathFailed,collided,noTeleport,movesAway,earlyStarts,seconds:+g.time.toFixed(2),
    success:!!u.arrived&&!u.pathFailed&&!collided&&noTeleport&&movesAway};
}
const pairs=[];
for(const role of (group?['infantry']:['infantry','truck','tank']))for(const faction of [0,1])for(let seed=1;seed<=seeds;seed++){
  const off=run(role,seed,faction,false),on=run(role,seed,faction,true);pairs.push({role,faction,seed,off,on});
}
const sum={pairs:pairs.length,offPassed:pairs.filter(p=>p.off.success).length,onPassed:pairs.filter(p=>p.on.success).length,
  improved:pairs.filter(p=>!p.off.success&&p.on.success).length,regressed:pairs.filter(p=>p.off.success&&!p.on.success).length,
  earlySensed:pairs.filter(p=>p.on.earlyStarts>0).length,onCollisions:pairs.filter(p=>p.on.collided).length,onSpeedViolations:pairs.filter(p=>!p.on.noTeleport).length};
console.log(JSON.stringify({kind:'paired_vision_policy_u_diagnostic',group,seeds,summary:sum,pairs,
  limitations:[group?'isolated synthetic U, one moving infantry plus two stationary nearby allies; no combat':'isolated synthetic U, one unit, no combat or crowd','20 seeds but geometry differs only by mirror and role','not browser performance, training, real-map navigation or full balance','old and new runs have identical seeds but RNG consumption can diverge']},null,2));
if(sum.onPassed!==pairs.length||sum.regressed)process.exitCode=1;
