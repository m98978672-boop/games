// Paired pre-change/new comparison for one HQ segment from both sides.
import {resolve,join} from 'node:path';import {pathToFileURL} from 'node:url';
import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {updateSoldier} from '../src/sim/ai_soldier.js';
const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.slice(n.length+3);
if(!arg('baseline'))throw Error('pass --baseline=/path/to/pre-change/project');
const base=resolve(arg('baseline')),n=Number(arg('seeds')||20),isolated=process.argv.includes('--isolated');
if(!Number.isSafeInteger(n)||n<1||n>100)throw Error('bad seeds');
const oldCfg=await import(pathToFileURL(join(base,'src/core/config.js'))),oldGame=await import(pathToFileURL(join(base,'src/sim/game.js'))),oldSoldier=await import(pathToFileURL(join(base,'src/sim/ai_soldier.js')));
const files={};for(const f of ['src/sim/game.js','src/sim/units.js','src/sim/ai_soldier.js','src/sim/build.js'])files[f]=createHash('sha256').update(await readFile(join(base,f))).digest('hex');
async function run(seed,faction,side,old){
 const cfg=await (old?oldCfg.loadConfig:loadConfig)();cfg.flags.wall_engineer_repair_v1=true;
 const g=new (old?oldGame.Game:Game)({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.squads.clear();
 g.autopilot.update=()=>{};for(const ai of g.strategic)ai.update=()=>{};g.rules.update=()=>{};g.logistics.update=()=>{};g.checkVictory=()=>{};
 const b=g.world.hqOf(faction).structure,st=g.walls.state(b),s=st.segs[0],geo=st.outline.segments[0];
 const [[a,c],[d,e]]=geo.points,x=b.x+(a+d)/2,y=b.y+(c+e)/2,len=Math.hypot(d-a,e-c),nx=-(e-c)/len,ny=(d-a)/len;
 g.walls.damageSegment(b,s.id,1e9,'tank_cannon');const u=g.spawnUnit(faction,'engineer',x+side*80*nx,y+side*80*ny);u.thinkTimer=10000;g.logistics.supply(faction).materials=1000;
 let ticks=0,overlap=0,speedViolations=0,maxStep=0;
 for(;ticks<1200&&s.breached;ticks++){
  const px=u.x,py=u.y;
  if(isolated){g.time+=.05;g.dt=.05;(old?oldSoldier.updateSoldier:updateSoldier)(g,u,.05);}else g.step(.05);
  const step=Math.hypot(u.x-px,u.y-py);maxStep=Math.max(maxStep,step);
  if(step>u.speed*.05+1e-6)speedViolations++;
  if(g.walls.blocksMove(u.x,u.y,u.radius,u))overlap++;
 }
 return {ticks,closed:!s.breached,hp:s.hp,materials:g.logistics.supply(faction).materials,overlap,speedViolations,maxStep,alive:u.alive};
}
const pairs=[];
for(let seed=1;seed<=n;seed++)for(const faction of [0,1])for(const side of [-1,1]){
 const before=await run(seed,faction,side,true),after=await run(seed,faction,side,false);
 pairs.push({seed,faction,side,before,after});
}
const summary={cases:pairs.length,beforeClosed:pairs.filter(p=>p.before.closed).length,afterClosed:pairs.filter(p=>p.after.closed).length,
 beforeOverlap:pairs.reduce((s,p)=>s+p.before.overlap,0),afterOverlap:pairs.reduce((s,p)=>s+p.after.overlap,0),
 beforeSpeedViolations:pairs.reduce((s,p)=>s+p.before.speedViolations,0),afterSpeedViolations:pairs.reduce((s,p)=>s+p.after.speedViolations,0),
 bySide:[-1,1].map(side=>({side,cases:pairs.filter(p=>p.side===side).length,beforeClosed:pairs.filter(p=>p.side===side&&p.before.closed).length,afterClosed:pairs.filter(p=>p.side===side&&p.after.closed).length}))};
console.log(JSON.stringify({summary,isolated,baselineFilesSha256:files,pairs,caveats:['Both sides of one fixed HQ segment, both factions; one engineer, no enemies','Engineer repair flag enabled in both versions, other flags default',isolated?'Only updateSoldier called; no wall, navigation or game-system updates':'Regular Game.step but strategy, autopilot, rules, logistics updates and victory disabled','Endpoint wall overlap and step length measured, not swept overlap or proof for other geometry','Baseline must be supplied separately']},null,2));
if(summary.afterClosed!==pairs.length||summary.afterOverlap||summary.afterSpeedViolations)process.exitCode=1;
