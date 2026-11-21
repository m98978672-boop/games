// Observe every moveUnit segment in ordinary AI games, without changing
// decisions. Sequential swept circles use other units' current positions;
// spawn overlaps and pre-existing wall penetration are counted separately.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {Walls} from '../src/sim/walls.js';
const start=Number(process.argv.find(x=>x.startsWith('--start='))?.slice(8)||1),count=Number(process.argv.find(x=>x.startsWith('--seeds='))?.slice(8)||3);
if(!Number.isInteger(start)||start<1||!Number.isInteger(count)||count<1||count>30)throw Error('bad seeds');
const results=[];for(let seed=start;seed<start+count;seed++){
 const cfg=await loadConfig(),g=new Game({cfg,seed,aiVsAi:true,difficulty:'regular'}),m={moves:0,wall:0,swept:0,embeddedStart:0,existingOverlap:0};g._wallFollowMetrics={steps:0};
 g._motionDiagnostic=(u,x1,y1,x2,y2)=>{
  if(Math.hypot(x2-x1,y2-y1)<1e-8)return;m.moves++;
  if(g.walls.blocksMove(x1,y1,u.radius,u))m.embeddedStart++;
  else if(g.walls.blocksMoveSweep(x1,y1,x2,y2,u.radius,u))m.wall++;
  for(const v of g.units.values()){
   if(v===u||!v.alive||v.downed)continue;const r=u.radius+v.radius,old=Math.hypot(x1-v.x,y1-v.y);
   if(old<r-1e-7){m.existingOverlap++;continue;}
   if(Walls.distPointSegment(v.x,v.y,x1,y1,x2,y2).d<r-1e-7)m.swept++;
  }
 };
 for(let i=0;i<1200&&!g.warOver;i++)g.step(.1);
 results.push({seed,seconds:g.time,kills:g.stats.kills,wallFollowSteps:g._wallFollowMetrics.steps,...m});console.error(`seed ${seed}`);
}console.log(JSON.stringify({results},null,2));
