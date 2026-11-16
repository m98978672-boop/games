// Paired controlled Game.step diagnostics; not the complete block-3 acceptance.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
import {Walls} from '../src/sim/walls.js';import {emptyOverlapMetrics,observeOverlaps} from '../tests/acceptance/overlap-metrics.mjs';
const n=Number(process.argv.find(s=>s.startsWith('--seeds='))?.slice(8)||20);
if(!Number.isSafeInteger(n)||n<1||n>100)throw Error('invalid seeds');
async function scene(seed,faction,type,door,kind,on){
 const cfg=await loadConfig();
 if(process.argv.includes('--group-survivor')) {cfg.flags.crowd_swept_units_v1=true;cfg.flags.crowd_slot_exchange_v1=true;cfg.flags.crowd_group_survivor_v1=on;}
 else if(process.argv.includes('--slot-exchange')) {cfg.flags.crowd_swept_units_v1=true;cfg.flags.crowd_slot_exchange_v1=on;}
 else cfg.flags.crowd_swept_units_v1=on;
 if(kind==='pair')cfg.flags.door_pair_lanes_v1=true;
 else {cfg.flags.crowd_nav_v2=true;cfg.flags.group_nav_3to5_v1=true;cfg.flags.vision_nav_policy_v1=true;cfg.flags.arrival_stuck_guard_v1=true;cfg.flags.crowd_slot_avoid_v1=true;}
 const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.squads.clear();
 g.autopilot.update=()=>{};for(const ai of g.strategic)ai.update=()=>{};g.rules.update=()=>{};g.logistics.update=()=>{};g.checkVictory=()=>{};
 const b=g.world.buildings.find(b=>b.type===type&&b.faction===faction&&g.walls.state(b));
 const o=b&&g.walls.state(b).outline.openings.filter(o=>o.type==='door')[door];if(!o)throw Error(`missing ${type} door ${door}`);
 const px=b.x+o.cx,py=b.y+o.cy;
 const positions=kind==='pair'?[[-1,85],[1,85]]:Array.from({length:kind==='group3'?3:5},(_,i)=>[1,55+i*24]);
 const us=positions.map(([side,d])=>{const u=g.spawnUnit(faction,'infantry',px+side*o.nx*d,py+side*o.ny*d);
  u.goal={x:px-side*o.nx*105,y:py-side*o.ny*105};u.activity='advance';u.arrived=false;u.thinkTimer=10000;return {u,side};});
 let swept=0,sweptDeep=0,wall=0,speed=0,active=0,ticks=0;const crossed=new Set(),overlaps=emptyOverlapMetrics();
 // Invoked after each ordinary/rescue move; other units are at their positions
 // at that point in the sequential update, not a simultaneous-motion proof.
 g._motionDiagnostic=(u,x1,y1,x2,y2)=>{
  if(!us.some(v=>v.u===u))return;
  for(const {u:v} of us){if(v===u||!v.alive||v.downed)continue;
   const sum=u.radius+v.radius,start=Math.hypot(x1-v.x,y1-v.y),d=Walls.distPointSegment(v.x,v.y,x1,y1,x2,y2).d;
   if(start>=sum&&d<sum-1e-9)swept++;
   if(start>=sum*.7&&d<sum*.7-1e-9)sweptDeep++;
  }
 };
 for(;ticks<1200;ticks++){
  const before=us.map(({u})=>({x:u.x,y:u.y,speed:u.speed*g.world.speedAt(u.x,u.y)}));g.step(.05);
  for(let i=0;i<us.length;i++){const {u,side}=us[i],p=before[i];
   if(((u.x-px)*o.nx+(u.y-py)*o.ny)*side<0)crossed.add(u.id);
   if(u._crowdActive||u._doorPass)active++;
   if(g.walls.blocksMove(u.x,u.y,u.radius,u))wall++;
   if(Math.hypot(u.x-p.x,u.y-p.y)>Math.max(p.speed,cfg.navBudget.antiStuck.pushSpeedFloor??30)*.05*1.5+1e-8)speed++;
  }
  observeOverlaps(us.map(x=>x.u),overlaps);
  if(us.every(({u})=>u.arrived||u.pathFailed))break;
 }
 const arrived=us.filter(({u})=>u.arrived&&!u.pathFailed).length,failed=us.filter(({u})=>u.pathFailed).length;
 return {arrived,failed,crossed:crossed.size,count:us.length,active,ticks:Math.min(ticks+1,1200),wall,speed,swept,sweptDeep,...overlaps,
  ok:arrived===us.length&&crossed.size===us.length&&!wall&&!speed&&!overlaps.overlapFrames&&!swept};
}
const pairs=[];for(const type of ['hq','city'])for(const door of [0,1])for(const kind of ['pair','group3','group5'])for(const faction of [0,1])for(let seed=1;seed<=n;seed++)
 pairs.push({type,door,kind,faction,seed,off:await scene(seed,faction,type,door,kind,false),on:await scene(seed,faction,type,door,kind,true)});
const summary={};for(const p of pairs){const x=summary[p.kind]||={cases:0,offPassed:0,onPassed:0,regressions:0,improvements:0,activeOn:0,offSwept:0,onSwept:0,offOverlapFrames:0,onOverlapFrames:0,offOverlapFrames70:0,onOverlapFrames70:0};
 x.cases++;if(p.off.ok)x.offPassed++;if(p.on.ok)x.onPassed++;if(p.off.ok&&!p.on.ok)x.regressions++;if(!p.off.ok&&p.on.ok)x.improvements++;if(p.on.active)x.activeOn++;
 x.offSwept+=p.off.swept;x.onSwept+=p.on.swept;x.offOverlapFrames+=p.off.overlapFrames;x.onOverlapFrames+=p.on.overlapFrames;x.offOverlapFrames70+=p.off.overlapFrames70;x.onOverlapFrames70+=p.on.overlapFrames70;}
console.log(JSON.stringify({seeds:n,summary,pairs,caveats:['Controlled Game.step; first two HQ and city doors per faction, no combat','Autopilot, strategic AI, rules, logistics updates and victory disabled; individual thinking delayed',process.argv.includes('--group-survivor')?'Group and door-pair experiments, crowd sweep and slot exchange enabled on both sides; only crowd_group_survivor_v1 changes':process.argv.includes('--slot-exchange')?'Group and door-pair experiments and crowd sweep enabled on both sides; only crowd_slot_exchange_v1 changes':'Group and door-pair experiments enabled as appropriate on both sides; only crowd_swept_units_v1 changes','Motion diagnostic measures sequential ordinary/rescue segments against tracked units at their current positions, not simultaneous motion','Starting overlap, other untracked units, combat, vehicles and docks are not covered; neither prior experiments nor this flag are enabled by default']},null,2));
if(pairs.some(p=>!p.on.ok)||pairs.some(p=>p.off.ok&&!p.on.ok))process.exitCode=1;
