import {readFileSync} from 'node:fs';
const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.slice(n.length+3);if(!arg('file'))throw Error('pass --file=...');
const expected=Number(arg('seeds')||20);if(!Number.isSafeInteger(expected)||expected<1||expected>100)throw Error('bad seeds');
const text=readFileSync(arg('file'),'utf8'),partial=!text.endsWith('\n'),lines=text.split('\n');if(partial)lines.pop();const pairs=lines.filter(Boolean).map(JSON.parse),seen=new Set();
for(const p of pairs){if(!Number.isSafeInteger(p.seed)||p.seed<1||p.seed>expected||seen.has(p.seed)||p.swap!==(p.seed%2===0))throw Error('invalid seed/swap');seen.add(p.seed);
 for(const [name,on] of [['off',false],['on',true]]){const r=p[name];if(!r||r.on!==on||r.swap!==p.swap||!Number.isFinite(r.seconds)||r.seconds<=0||!Number.isSafeInteger(r.steps)||r.steps<1||typeof r.warOver!=='boolean'||
  (r.warOver?(!r.outcome||![0,1,null].includes(r.outcome.winner)):r.outcome!==null))throw Error('invalid result');}}
function summary(name){const r=pairs.map(p=>p[name]),reasons={};for(const x of r)if(x.warOver)reasons[x.outcome.reason]=(reasons[x.outcome.reason]||0)+1;
 return {games:r.length,finished:r.filter(x=>x.warOver).length,unfinished:r.filter(x=>!x.warOver).length,wins:[0,1].map(f=>r.filter(x=>x.warOver&&x.outcome.winner===f).length),draws:r.filter(x=>x.warOver&&x.outcome.winner===null).length,reasons};}
const complete=!partial&&pairs.length===expected&&Array.from({length:expected},(_,i)=>i+1).every(i=>seen.has(i));
console.log(JSON.stringify({complete,pairs:pairs.length,partial,off:summary('off'),on:summary('on'),
 caveats:['Paired seeds use alternating normal/swapped starts, balanced personas, but do not each run both starting sides','RNG trajectories can diverge; cap only stops observation and unfinished games are not ties','New rules omit a separate commander and use legacy no-army timeout; neither version is full victory-rule acceptance','Short Node wars are not a browser, 100-game balance or long-duration completion test']},null,2));
if(!complete)process.exitCode=1;
