// Summarize checkpointed paired wars. The extended file may still be growing.
import {readFileSync} from 'node:fs';
const files=['docs/LOGISTICS_V4_WARS.jsonl','docs/LOGISTICS_V4_WARS_EXTENDED.jsonl'];
const pairs=[];let incompleteLine=false;
for(const f of files){let raw;try{raw=readFileSync(f,'utf8');}catch(e){if(e.code==='ENOENT')continue;throw e;}
 const lines=raw.split('\n');if(lines.at(-1)!==''){incompleteLine=true;lines.pop();}
 for(const line of lines)if(line.trim())pairs.push(JSON.parse(line));
}
const seen=new Set();for(const p of pairs){if(seen.has(p.seed))throw Error('duplicate seed '+p.seed);seen.add(p.seed);}
const summary={pairs:pairs.length,seeds:[...seen].sort((a,b)=>a-b),incompleteLine,plannedPairs:50};
for(const k of ['off','on']){
 const rs=pairs.map(p=>p[k]),sum=fn=>rs.reduce((a,r)=>a+fn(r),0),unloads=rs.flatMap(r=>r.deliveries);
 summary[k]={games:rs.length,ended:rs.filter(r=>r.warOver).length,wins:[0,1].map(f=>rs.filter(r=>r.outcome?.winner===f).length),
  timeLimit:rs.filter(r=>r.outcome?.reason?.includes('измор')).length,kills:[0,1].map(f=>sum(r=>r.kills[f])),captures:[0,1].map(f=>sum(r=>r.captures[f])),
  physical:sum(r=>r.physical),virtual:sum(r=>r.virtual),buildingUnloads:unloads.filter(d=>d.building).length,
  outsideArrivalRadius:unloads.filter(d=>d.distance>=d.range).length,withFailure:unloads.filter(d=>d.failed).length,wallBreaches:sum(r=>r.wallBreaches)};
}
summary.complete=pairs.length===50&&!incompleteLine&&summary.off.ended===50&&summary.on.ended===50;
console.log(JSON.stringify(summary,null,2));if(process.argv.includes('--require-complete')&&!summary.complete)process.exitCode=1;
