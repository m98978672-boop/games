// Paired, controlled Game.step test; only the engineer repair flag changes.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const n=Number(process.argv.find(a=>a.startsWith('--seeds='))?.slice(8)||20);if(!Number.isSafeInteger(n)||n<1||n>100)throw Error('bad seeds');
async function run(seed,faction,on){
 const cfg=await loadConfig();cfg.flags.wall_engineer_repair_v1=on;cfg.flags.engineer_combat_priority_v2=true;
 const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.squads.clear();
 g.autopilot.update=()=>{};for(const ai of g.strategic)ai.update=()=>{};g.rules.update=()=>{};g.logistics.update=()=>{};g.checkVictory=()=>{};
 const b=g.world.hqOf(faction).structure,st=g.walls.state(b),s=st.segs[0],geo=st.outline.segments[0];
 const [[a,c],[d,e]]=geo.points,x=b.x+(a+d)/2,y=b.y+(c+e)/2,len=Math.hypot(d-a,e-c),nx=-(e-c)/len,ny=(d-a)/len;
 g.walls.damageSegment(b,s.id,1e9,'tank_cannon');const u=g.spawnUnit(faction,'engineer',x-80*nx,y-80*ny);g.logistics.supply(faction).materials=1000;
 let ticks=0,overlaps=0,changed=0,last=s.hp;
 for(;ticks<1200&&!g.warOver&&s.breached;ticks++){g.step(.05);if(g.walls.blocksMove(u.x,u.y,u.radius,u))overlaps++;if(s.hp>last)changed++;last=s.hp;}
 return {seed,faction,on,ticks,repaired:!s.breached,hp:s.hp,maxHp:s.maxHp,materials:g.logistics.supply(faction).materials,repairSteps:changed,overlaps,engineerAlive:u.alive,warOver:g.warOver};
}
const pairs=[];for(let seed=1;seed<=n;seed++)for(const faction of [0,1]){const off=await run(seed,faction,false),on=await run(seed,faction,true);pairs.push({seed,faction,off,on});}
const summary={cases:pairs.length,offClosed:pairs.filter(p=>p.off.repaired).length,onClosed:pairs.filter(p=>p.on.repaired).length,onOverlaps:pairs.reduce((a,p)=>a+p.on.overlaps,0),offOverlaps:pairs.reduce((a,p)=>a+p.off.overlaps,0)};
console.log(JSON.stringify({summary,pairs,caveats:['Single engineer and one selected HQ segment per faction, no enemies, 60-second cap','Strategic AI, rules, autopilot, logistics updates and victory disabled; regular Game.step movement and walls active','Segment geometries and start are fixed across seeds; this is not normal war or a full block-2 acceptance']},null,2));
if(summary.onClosed!==pairs.length||summary.onOverlaps)process.exitCode=1;
