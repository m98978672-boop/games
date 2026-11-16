// Small natural-game safety probe, not a performance or acceptance benchmark.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {Walls} from '../src/sim/walls.js';
const results=[];
for(const seed of [1,7])for(const on of [false,true]){
 const cfg=await loadConfig();cfg.flags.movement_occupancy_v1=on;const g=new Game({cfg,seed,aiVsAi:true});let swept=0,moves=0,initialOverlap=0,maxOverlapPairs=0,frames=0;
 function pairs(){const us=[...g.units.values()].filter(u=>u.alive&&!u.downed);let count=0;for(let i=0;i<us.length;i++)for(let j=i+1;j<us.length;j++)if(Math.hypot(us[i].x-us[j].x,us[i].y-us[j].y)<us[i].radius+us[j].radius-1e-8)count++;return count;}
 initialOverlap=pairs();g._motionDiagnostic=(u,x1,y1,x2,y2)=>{if(x1===x2&&y1===y2)return;moves++;for(const v of g.units.values())if(v!==u&&v.alive&&!v.downed){const r=u.radius+v.radius;
   if(Math.hypot(x1-v.x,y1-v.y)>=r&&Walls.distPointSegment(v.x,v.y,x1,y1,x2,y2).d<r-1e-8)swept++;}};
 const start=performance.now();for(let tick=0;tick<200;tick++){g.step(.05);const n=pairs();maxOverlapPairs=Math.max(maxOverlapPairs,n);if(n)frames++;}
 results.push({seed,on,moves,swept,initialOverlap,maxOverlapPairs,framesWithOverlap:frames,elapsedMs:Math.round(performance.now()-start),units:[...g.units.values()].filter(u=>u.alive).length});
}
console.log(JSON.stringify({results,caveats:['200 short ticks and two seeds, not full battle coverage or an FPS benchmark','Movement segments against current sequential positions; excludes pre-existing overlaps as violations','Uncontrolled random events and other systems mean on/off trajectories diverge','Direct scripted spawns, enabling mid-game, and old saves can introduce overlaps, which are counted separately']},null,2));
