// Real Command API and soldier/squad AI on the real map: a column starts
// outside its HQ on the side facing away from a distant building target.
// Strategic systems and combat are disabled, so this is not a full battle.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {Squad} from '../src/sim/squads.js';import {clearFinalApproach} from '../src/sim/arrival.js';import {Walls} from '../src/sim/walls.js';
const cfg=await loadConfig();if(process.argv.includes('--disable'))cfg.flags.distant_building_wall_follow_v1=false;
function run(faction,seed,n,type){
 const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();g.api.orders=[];
 for(const s of [...g.strategic,g.autopilot,g.rules,g.logistics,g.build,g.influence])s.update=()=>{};g.checkVictory=()=>{};
 const hq=g.world.buildings.find(b=>b.type==='hq'&&b.faction===faction&&g.walls.state(b));
 const targetBuilding=type==='hq'?g.world.buildings.find(b=>b.type==='hq'&&b.faction!==faction):g.world.buildings.find(b=>b.type==='city'&&b.faction===faction);
 const target={x:targetBuilding.x,y:targetBuilding.y},sign=faction?-1:1,half=g.walls.state(hq).outline.size/2;
 const sq=new Squad(g,{faction});g.squads.set(sq.id,sq);sq.retreatTier='never';sq.strategyId='rush';
 const us=Array.from({length:n},(_,i)=>{const u=g.spawnUnit(faction,'infantry',hq.x-sign*(half+20),hq.y-90+i*24);sq.addUnit(u);return u});
 const initialInvalid=us.some(u=>g.walls.blocksMove(u.x,u.y,u.radius,u)||!g.world.isBaseWalkable(u.x,u.y));
 g._wallFollowMetrics={steps:0};const order=g.api.issue({source:'enemyAI',type:'move',faction,squadIds:[sq.id],target});let wall=0,overlap=0,speed=0,swept=0;
 g._motionDiagnostic=(u,x1,y1,x2,y2)=>{if(!us.includes(u))return;for(const v of us){if(v===u||!v.alive||v.downed)continue;const r=u.radius+v.radius,start=Math.hypot(x1-v.x,y1-v.y);if(start>=r-1e-7&&Walls.distPointSegment(v.x,v.y,x1,y1,x2,y2).d<r-1e-7)swept++;}};
 for(let t=0;t<2000;t++){const before=us.map(u=>({x:u.x,y:u.y,terrain:g.world.speedAt(u.x,u.y)}));g.step(.05);for(let i=0;i<n;i++){const u=us[i],p=before[i],d=Math.hypot(u.x-p.x,u.y-p.y);if(d>1e-6&&g.walls.blocksMoveSweep(p.x,p.y,u.x,u.y,u.radius,u))wall++;if(d>Math.max(u.speed*p.terrain,30)*.05*1.5+1e-8)speed++;}if(us.some((u,i)=>us.slice(i+1).some(v=>Math.hypot(u.x-v.x,u.y-v.y)<u.radius+v.radius-1e-6)))overlap++;}
 return {faction,seed,n,type,accepted:order.status==='accepted',initialInvalid,nearTarget:us.filter(u=>Math.hypot(u.x-target.x,u.y-target.y)<120&&clearFinalApproach(g,u,target.x,target.y)).length,advanced:us.filter(u=>sign*(u.x-hq.x)>half+40).length,progress:us.reduce((s,u)=>s+(sign*(u.x-(hq.x-sign*(half+20)))),0),wall,overlap,swept,speed,steps:g._wallFollowMetrics.steps};
}
const quick=process.argv.includes('--quick');
const results=[];for(const f of [0,1])for(const n of quick?[3,6]:[1,3,6,8])for(const type of quick?['hq']:['city','hq'])for(const seed of quick?[1,7]:[1,5,7,11,23])results.push(run(f,seed,n,type));console.log(JSON.stringify({results},null,2));
