// Test-only paired command transcript. Replays only the injected player commands;
// AI/autopilot commands are regenerated and compared, never injected twice.
// This is not a complete browser input/save replay implementation.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { captureGraph, graphId } from './block0-graph-state.mjs';
const number=(name,def)=>{const x=process.argv.find(a=>a.startsWith(`--${name}=`));const n=x?Number(x.slice(name.length+3)):def;if(!Number.isSafeInteger(n)||n<1||n>10000)throw Error(`invalid ${name}`);return n;};
const seeds=number('seeds',20),ticks=number('ticks',120);
const copy=x=>JSON.parse(JSON.stringify(x));
function observe(game, clock) {
  const log=[];
  game.events.on('orderIssued', ({order})=>{
    log.push(copy({tick:clock.tick,id:order.id,source:order.source,type:order.type,faction:order.faction,
      squadIds:order.squadIds,unitIds:order.unitIds,target:order.target,params:order.params,
      priority:order.priority,reason:order.reason,issuedAt:order.issuedAt,delay:order.delay}));
  });
  return log;
}
const outcomes=[];
for(let seed=1;seed<=seeds;seed++){
  const a=new Game({cfg:await loadConfig(),seed,aiVsAi:true}),b=new Game({cfg:await loadConfig(),seed,aiVsAi:true});
  const ca={tick:0},cb={tick:0},la=observe(a,ca),lb=observe(b,cb),external=[];
  const u=[...a.units.values()].find(u=>u.alive&&u.faction===0&&!u.isVehicle);
  if(!u)throw Error(`no infantry seed ${seed}`);
  let mismatch=null, compared=0;
  for(let tick=0;tick<=ticks;tick++){
    ca.tick=cb.tick=tick;
    if(tick===5||tick===50){
      const cmd=tick===5?{source:'player',type:'move',faction:0,unitIds:[u.id],target:{x:u.x+40,y:u.y+20},reason:'diagnostic replay'}:
        {source:'player',type:'hold',faction:0,unitIds:[u.id],reason:'diagnostic replay'};
      const i=la.length;a.api.issue(cmd);
      const recorded=la[i];if(!recorded||recorded.source!=='player')throw Error('player command not recorded');
      const replay={source:recorded.source,type:recorded.type,faction:recorded.faction,squadIds:recorded.squadIds,
        unitIds:recorded.unitIds,target:recorded.target,params:recorded.params,priority:recorded.priority,reason:recorded.reason};
      external.push({tick,command:copy(replay)});b.api.issue(replay);
    }
    if(tick){a.step(1/60);b.step(1/60);}
    const sa=captureGraph(a),sb=captureGraph(b);compared++;
    if(sa.bytes!==sb.bytes||JSON.stringify(la)!==JSON.stringify(lb)){
      mismatch={tick,idA:graphId(sa.bytes),idB:graphId(sb.bytes),graphMatches:sa.bytes===sb.bytes,logsMatch:JSON.stringify(la)===JSON.stringify(lb)};break;
    }
  }
  outcomes.push({seed,compared,mismatch,external,counts:{player:la.filter(x=>x.source==='player').length,auto:la.filter(x=>x.source!=='player').length}, transcript:la});
  console.error(`seed ${seed}/${seeds}: ${mismatch?'DIVERGED':'matched '+compared+' snapshots'}`);
}
const passed=outcomes.every(x=>x.compared===ticks+1&&!x.mismatch&&x.counts.player===2&&x.counts.auto>0);
console.log(JSON.stringify({passed,kind:'bounded_command_transcript_probe',seeds,ticks,dt:1/60,
  limitations:['same-process Node only','records orderIssued after Game constructor only','synthetic Command API input, no keyboard/mouse/soldier input','not save/load or independent browser replay','AI commands compared, not injected','graph excludes clock metrics and cannot capture closures and globals'],outcomes},null,2));
if(!passed)process.exitCode=1;
