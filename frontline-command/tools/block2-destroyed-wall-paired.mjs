// Destruction/demolition, real starting outlines; paired feature flag.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const n=Number(process.argv.find(s=>s.startsWith('--seeds='))?.slice(8)||20);
if(!Number.isSafeInteger(n)||n<1||n>100)throw Error('invalid seeds');
async function run(seed,faction,type,method,queued,on){
 const cfg=await loadConfig();cfg.flags.wall_remove_destroyed_v1=on;
 const g=new Game({cfg,seed,aiVsAi:true}),b=g.world.buildings.find(b=>b.type===type&&b.faction===faction&&g.walls.state(b));
 if(!b)throw Error(`missing ${type} for ${faction}`);
 const st=g.walls.state(b),geo=st.outline.segments.find(s=>s.blocksMove&&s.blocksVision&&Math.hypot(s.points[1][0]-s.points[0][0],s.points[1][1]-s.points[0][1])>35);
 if(!geo)throw Error(`missing long segment in ${type}`);
 const [[a,c],[d,e]]=geo.points,l=Math.hypot(d-a,e-c),nx=-(e-c)/l,ny=(d-a)/l,x=b.x+(a+d)/2,y=b.y+(c+e)/2;
 const probe=()=>({move:g.walls.blocksMove(x,y,2,{isVehicle:false}),sweep:g.walls.blocksMoveSweep(x+nx*30,y+ny*30,x-nx*30,y-ny*30,2,{isVehicle:false}),
  vision:g.walls.blocksVision(x+nx*30,y+ny*30,x-nx*30,y-ny*30),bullet:g.walls.bulletRay(x+nx*30,y+ny*30,x-nx*30,y-ny*30,'rifle',{next:()=>1}).blocked,
  cover:g.walls.coverAt(x-nx*30,y-ny*30,x+nx*30,y+ny*30).blockedCount});
 const before=probe(),version=g.world.navVersion;if(queued)g.walls.queueNavRebuild(b);
 if(method==='damage')g.world.damageBuilding(b,b.hp+1,1-faction);else g.build.demolish(b);
 const immediate=probe(),stateAfter=g.walls.state(b)!==null,queueAfter=g.walls.navQueue.has(b.id),navChanged=g.world.navVersion>version;
 g.walls.doorTimer=0;g.walls.update(.05);const afterUpdate=probe();
 return {before,immediate,afterUpdate,stateAfter,queueAfter,navChanged};
}
const pairs=[];for(let seed=1;seed<=n;seed++)for(const faction of [0,1])for(const type of ['hq','city','depot','factory'])for(const method of ['damage','demolish'])for(const queued of [false,true]){
 pairs.push({seed,faction,type,method,queued,off:await run(seed,faction,type,method,queued,false),on:await run(seed,faction,type,method,queued,true)});
}
const ghost=r=>r.move||r.sweep||r.vision||r.bullet||r.cover>0;
const summary={cases:pairs.length,baselineBlocked:pairs.filter(p=>p.off.before.move&&p.on.before.move).length,
 offGhostImmediate:pairs.filter(p=>ghost(p.off.immediate)).length,onGhostImmediate:pairs.filter(p=>ghost(p.on.immediate)).length,
 offGhostAfterUpdate:pairs.filter(p=>ghost(p.off.afterUpdate)).length,onGhostAfterUpdate:pairs.filter(p=>ghost(p.on.afterUpdate)).length,
 onNavChanged:pairs.filter(p=>p.on.navChanged).length,onQueueCleared:pairs.filter(p=>!p.on.queueAfter).length,
 byQueue:[false,true].map(queued=>{const ps=pairs.filter(p=>p.queued===queued);return {queued,cases:ps.length,
 offMoveAfterUpdate:ps.filter(p=>p.off.afterUpdate.move).length,onMoveAfterUpdate:ps.filter(p=>p.on.afterUpdate.move).length,
 offCoverAfterUpdate:ps.filter(p=>p.off.afterUpdate.cover>0).length,onCoverAfterUpdate:ps.filter(p=>p.on.afterUpdate.cover>0).length};})};
console.log(JSON.stringify({seeds:n,summary,pairs,caveats:['One long segment on one owned starting building of each type; both factions','Direct destruction or demolition, with and without a pending nav queue; not a battle or full Game.step','Cache checked immediately and after a single wall update at unchanged game time, not a proof of all rays, trajectories or rubble','Does not attach newly constructed buildings and does not implement ruins; flag off by default']},null,2));
if(summary.baselineBlocked!==pairs.length||summary.onGhostImmediate||summary.onGhostAfterUpdate||summary.onNavChanged!==pairs.length||summary.onQueueCleared!==pairs.length)process.exitCode=1;
