// Replay each generated choice through real CommandAPI/Game.step in the same
// isolated synthetic scenes. Unparseable output is never treated as a command.
import {readFile,writeFile} from 'node:fs/promises';
import {simulate} from './collect-obstacle-game.mjs';
const [input,output]=process.argv.slice(2);if(!input||!output)throw Error('usage: node replay-obstacle-game.mjs REPORT OUTPUT');
const report=JSON.parse(await readFile(input,'utf8')),rows=[];
for(const r of report.results){
 const row={id:r.spec.id,teacher:r.teacher,side:r.spec.faction};
 for(const kind of ['base','adapter']){
  const choice=r[kind]?.choice;
  if(choice!=='U'&&choice!=='D'){row[kind]={choice:null,valid:false,success:false};continue;}
  const s=await simulate(r.spec,choice);
  row[kind]={choice,valid:true,near:s.near,wallCross:s.wallCross,switched:s.switched,accepted:s.accepted,seconds:s.seconds,maxStep:s.maxStep,limit:s.limit,success:s.near&&!s.wallCross&&s.switched&&s.accepted===2&&s.maxStep<=s.limit+1e-8};
 }
 const baseline=await simulate(r.spec);
 row.baseline={near:baseline.near,wallCross:baseline.wallCross,seconds:baseline.seconds,success:baseline.near&&!baseline.wallCross&&baseline.accepted===1&&baseline.maxStep<=baseline.limit+1e-8};
 rows.push(row);console.log(JSON.stringify(row));
}
const summary={total:rows.length};for(const k of ['base','adapter','baseline'])summary[k]={success:rows.filter(r=>r[k].success).length,invalid:k==='baseline'?0:rows.filter(r=>!r[k].valid).length,wallCross:rows.filter(r=>r[k].wallCross).length};
await writeFile(output,JSON.stringify({summary,rows},null,2)+'\n');console.log('SUMMARY',JSON.stringify(summary));
