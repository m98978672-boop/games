// Diagnostic sampling of normal AI wars; pathFailed events are enabled only
// for observation (alg_deadlock). No inference or combat intervention.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {Walls} from '../src/sim/walls.js';
const count=Number(process.argv.find(x=>x.startsWith('--seeds='))?.slice(8)||4),steps=Number(process.argv.find(x=>x.startsWith('--steps='))?.slice(8)||1200);
if(!Number.isInteger(count)||count<1||count>100||!Number.isInteger(steps)||steps<1||steps>12000)throw Error('bad arguments');
const results=[];for(let seed=1;seed<=count;seed++){
 const cfg=await loadConfig();cfg.flags.alg_deadlock=true;const g=new Game({cfg,seed,aiVsAi:true,difficulty:'regular'}),events=[];
 g.events.on('pathFailed',e=>{const u=g.unitById(e.unitId);if(!u)return;const near=g.unitGrid.query(u.x,u.y,80).filter(v=>v!==u&&v.alive&&!v.downed&&Math.hypot(u.x-v.x,u.y-v.y)<80);
  const door=!!g.walls.refsInBox?.(u.x,u.y,150).some(r=>r.kind==='opening'&&Walls.distPointSegment(u.x,u.y,r.x1,r.y1,r.x2,r.y2).d<150);
  events.push({time:+g.time.toFixed(2),role:u.role,contact:!!u.perception?.hasContact,squad:!!u.squad,activity:u.activity,inBuilding:!!g.walls.buildingAtPoint(u.x,u.y),door,
   nearbyAllies:near.filter(v=>v.faction===u.faction).length,nearbyEnemies:near.filter(v=>v.faction!==u.faction).length,
   sameGoal:near.filter(v=>v.faction===u.faction&&v.goal&&u.goal&&Math.hypot(v.goal.x-u.goal.x,v.goal.y-u.goal.y)<1).length,
   blockedWait:!!u._occupancyWait,waitingSeconds:u._occupancyWait?+(g.time-u._occupancyWait.since).toFixed(2):0,
   goalDistance:u.goal?+Math.hypot(u.goal.x-u.x,u.goal.y-u.y).toFixed(1):null,reason:e.reason||'stuck'});
 });
 const t=performance.now();for(let i=0;i<steps&&!g.warOver;i++)g.step(.1);results.push({seed,time:+g.time.toFixed(2),events,kills:g.stats.kills,warOver:g.warOver,ms:Math.round(performance.now()-t)});console.error(`seed ${seed}/${count}`);
}console.log(JSON.stringify({results},null,2));
