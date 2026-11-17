// Compare observed game state at each tick with an explicit source snapshot.
// It is not a proof of identity of all reachable objects or inputs.
import {createHash} from 'node:crypto';import {readFile} from 'node:fs/promises';import {pathToFileURL} from 'node:url';import {resolve,join} from 'node:path';
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.slice(n.length+3);
const baseline=arg('baseline');if(!baseline)throw Error('pass --baseline=path');const root=resolve(baseline);
const old=await import(pathToFileURL(join(root,'src/sim/game.js'))),oldCfg=await import(pathToFileURL(join(root,'src/core/config.js')));
const baselineHashes={};for(const file of ['src/sim/walls.js','src/sim/rest_positions.js','src/sim/crowd_nav.js','src/sim/solid_units.js'])baselineHashes[file]=createHash('sha256').update(await readFile(join(root,file))).digest('hex');
function snap(g){return JSON.stringify({time:g.time,rng:g.rng.s,stats:g.stats,outcome:g.outcome,warOver:g.warOver,
 units:[...g.units.values()].map(u=>[u.id,u.faction,u.role,u.x,u.y,u.hp,u.alive,u.downed,u.goal,u.arrived,u.pathFailed,u.stuck,u.activity,u.state,u.mag,u.reserve,u.cargo,u.targetId,u._crowdGroupGoal,u._crowdAssigned,u._occupancyWait]),
 squads:[...g.squads.values()].map(s=>[s.id,s.faction,s.state,s.objective,[...s.memberIds]]),points:g.world.points.map(p=>[p.id,p.owner,p.hp]),
 doors:[...g.walls.instances].map(([id,s])=>[id,s.doors,s.segs.map(x=>[x.id,x.hp,x.breached])]),
 stock:g.logistics.stock,delivered:g.logistics.delivered,requests:g.logistics.requests});}
const runs=[];
for(const seed of [1,2,5,7])for(const occupancy of [false,true]){
 const a=await oldCfg.loadConfig(),b=await loadConfig();a.flags.movement_occupancy_v1=b.flags.movement_occupancy_v1=occupancy;
 const swapSides=seed%2===0,ga=new old.Game({cfg:a,seed,aiVsAi:true,swapSides}),gb=new Game({cfg:b,seed,aiVsAi:true,swapSides});
 let mismatch=null,compared=0;for(let tick=0;tick<=300;tick++){
  if(tick){ga.step(.1);gb.step(.1);}const x=snap(ga),y=snap(gb);compared++;
  if(x!==y){mismatch={tick,before:createHash('sha256').update(x).digest('hex'),after:createHash('sha256').update(y).digest('hex')};break;}
 }
 runs.push({seed,occupancy,compared,mismatch});console.error(`seed ${seed} occupancy ${occupancy}: ${mismatch?'DIVERGED':'matched'}`);
}
const passed=runs.every(r=>!r.mismatch&&r.compared===301);
console.log(JSON.stringify({passed,baselineHashes,runs,caveats:['Snapshots compare specified state fields only, not the complete object graph','4 seeds and 30 seconds per game, two movement settings, no external player input or browser rendering']},null,2));
if(!passed)process.exitCode=1;
