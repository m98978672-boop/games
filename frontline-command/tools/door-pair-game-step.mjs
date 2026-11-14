// Limited Game.step probe: frozen individual thinking for stable opposing goals;
// all other game subsystems and shuffled unit order remain active.
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
const isolated=process.argv.includes('--isolated');
async function run(seed,faction,on){
 const cfg=await loadConfig();cfg.flags.door_pair_lanes_v1=on;
 const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.squads.clear();
 if(isolated)g.autopilot.update=()=>{};
 const building=g.world.buildings.find(b=>b.type==='hq'&&b.faction===faction&&g.walls.state(b));
 const o=g.walls.state(building).outline.openings.find(o=>o.type==='door');const px=building.x+o.cx,py=building.y+o.cy;
 const us=[-1,1].map(side=>{const u=g.spawnUnit(faction,'infantry',px+side*o.nx*85,py+side*o.ny*85);
 u.goal={x:px-side*o.nx*105,y:py-side*o.ny*105};u.activity='advance';u.thinkTimer=100;return {u,side};});
 let overlapFrames=0,speed=0,walls=0,activeFrames=0,maxUnits=0,firstLost=null;const crossed=new Set();let tick=0;
 for(;tick<1200;tick++){
  const old=us.map(({u})=>({x:u.x,y:u.y,speed:u.speed*g.world.speedAt(u.x,u.y),pass:u._doorPass?{...u._doorPass}:null}));g.step(.05);
  maxUnits=Math.max(maxUnits,g.units.size);
  for(let i=0;i<us.length;i++){const {u,side}=us[i],p=old[i];
   if(((u.x-px)*o.nx+(u.y-py)*o.ny)*side<0)crossed.add(u.id);
   if(Math.hypot(u.x-p.x,u.y-p.y)>Math.max(p.speed,cfg.navBudget.antiStuck.pushSpeedFloor??30)*.05*1.5+1e-8)speed++;
   if(g.walls.blocksMove(u.x,u.y,u.radius,u))walls++;if(u._doorPass)activeFrames++;
   if(p.pass&&!u._doorPass&&!firstLost){const others=[...g.units.values()].filter(v=>v!==u&&v.id!==p.pass.partnerId&&v.alive&&!v.downed&&Math.hypot(v.x-u.x,v.y-u.y)<220);
    firstLost={tick:tick+1,thirdUnits:others.length,contact:!!u.perception.hasContact,detour:!!u.detour,alongSide:+(((u.x-p.pass.px)*p.pass.nx+(u.y-p.pass.py)*p.pass.ny)*p.pass.side).toFixed(2)};}
  }
  const [a,b]=us.map(x=>x.u);if(Math.hypot(a.x-b.x,a.y-b.y)<a.radius+b.radius)overlapFrames++;
  if(us.every(({u})=>u.arrived||u.pathFailed))break;if(g.warOver)break;
 }
 const arrived=us.filter(({u})=>u.arrived&&!u.pathFailed).length,failed=us.filter(({u})=>u.pathFailed).length;
 return {ok:arrived===2&&crossed.size===2&&!failed&&!overlapFrames&&!speed&&!walls,arrived,crossed:crossed.size,failed,overlapFrames,speed,walls,activeFrames,maxUnits,firstLost,ticks:tick+1,warOver:g.warOver};
}
const pairs=[];for(let f=0;f<2;f++)for(let seed=1;seed<=20;seed++)pairs.push({seed,faction:f,off:await run(seed,f,false),on:await run(seed,f,true)});
const summary={pairs:pairs.length,offPassed:pairs.filter(x=>x.off.ok).length,onPassed:pairs.filter(x=>x.on.ok).length,
 active:pairs.filter(x=>x.on.activeFrames>0).length,regressed:pairs.filter(x=>x.off.ok&&!x.on.ok).length,
 offOverlap:pairs.reduce((s,x)=>s+x.off.overlapFrames,0),onOverlap:pairs.reduce((s,x)=>s+x.on.overlapFrames,0),
 offSpeed:pairs.reduce((s,x)=>s+x.off.speed,0),onSpeed:pairs.reduce((s,x)=>s+x.on.speed,0)};
console.log(JSON.stringify({kind:'game_step_door_pair_probe',summary,pairs,caveats:['Two infantry only, goals held by freezing their think timers',isolated?'Autopilot disabled to prevent reinforcements; other systems active':'Other simulation systems active; initial squads and units removed','One HQ door per faction; positions checked after each full tick, not between unit updates','Not a combat, crowd, vehicle or complete game acceptance test']},null,2));
if(summary.onPassed!==pairs.length||summary.regressed)process.exitCode=1;
