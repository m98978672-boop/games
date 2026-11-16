import {readFileSync} from 'node:fs';
const file=process.argv.find(x=>x.startsWith('--file='))?.slice(7);
if(!file)throw Error('pass --file=path/to/pairs.jsonl');
const raw=readFileSync(file,'utf8'),lines=raw.split('\n'),partial=lines.at(-1)!=='';
if(partial)lines.pop();const pairs=lines.filter(x=>x.trim()).map(JSON.parse),seeds=new Set();
for(const p of pairs){
 if(!Number.isSafeInteger(p.seed)||p.seed<1||seeds.has(p.seed)||p.normal?.swap!==false||p.swapped?.swap!==true)throw Error('invalid or duplicate pair');
 for(const r of [p.normal,p.swapped]){
  if(typeof r.warOver!=='boolean'||!Number.isSafeInteger(r.steps)||r.steps<1||!Number.isFinite(r.seconds)||r.seconds<=0||
    (r.warOver&&(!r.outcome||![0,1,null].includes(r.outcome.winner))))throw Error('invalid game result');
 }
 seeds.add(p.seed);
}
function summary(which){
 const rs=pairs.map(p=>p[which]),wins=[0,1].map(f=>rs.filter(r=>r.warOver&&r.outcome?.winner===f).length);
 const reasons={};for(const r of rs)if(r.warOver){const reason=r.outcome?.reason||'(none)';reasons[reason]=(reasons[reason]||0)+1;}
 return {games:rs.length,finished:rs.filter(r=>r.warOver).length,unfinished:rs.filter(r=>!r.warOver).length,wins,
 draws:rs.filter(r=>r.warOver&&r.outcome?.winner==null).length,reasons};
}
const normal=summary('normal'),swapped=summary('swapped'),complete=pairs.length===50&&!partial&&Array.from({length:50},(_,i)=>i+1).every(s=>seeds.has(s))&&normal.finished===50&&swapped.finished===50;
console.log(JSON.stringify({complete,pairs:pairs.length,games:pairs.length*2,partialLine:partial,seeds:[...seeds].sort((a,b)=>a-b),normal,swapped,
 caveats:['50 paired seeds, 100 games when complete; both faction personas balanced','Current legacy rules still allow city, army and time-limit victory; not acceptance of agreed HQ-only victory','Pair members share seed but RNG trajectories diverge; paired outcomes are not independent','Software Node simulation, not FPS or visual quality']},null,2));
if(process.argv.includes('--require-complete')&&!complete)process.exitCode=1;
