import {readFile,writeFile} from 'node:fs/promises';
const [input,replayPath,out]=process.argv.slice(2);if(!out)throw Error('usage: node summarize-obstacle-v2.mjs REPORT REPLAY OUTPUT');
const report=JSON.parse(await readFile(input,'utf8')),replay=JSON.parse(await readFile(replayPath,'utf8'));
if(report.results.length!==replay.rows.length)throw Error('count mismatch');
const rows=report.results.map((r,i)=>{
 const trial=replay.rows[i];if(r.spec.id!==trial.id)throw Error('replay mismatch');
 return {id:trial.id,faction:r.spec.faction,seed:r.spec.seed,width:r.spec.width,height:r.spec.height,offset:r.spec.offset,teacher:r.teacher,
  base:{...r.base,...trial.base},adapter:{...r.adapter,...trial.adapter},baseline:trial.baseline};
});
function measure(group,k){return {total:group.length,success:group.filter(r=>r[k].success).length,wallCross:group.filter(r=>r[k].wallCross).length,invalid:group.filter(r=>k!=='baseline'&&!r[k].valid).length};}
const metrics={};for(const k of ['base','adapter','baseline'])metrics[k]={all:measure(rows,k),withOneTeacher:measure(rows.filter(r=>r.teacher!==null),k),withoutOneTeacher:measure(rows.filter(r=>r.teacher===null),k),faction0:measure(rows.filter(r=>r.faction===0),k),faction1:measure(rows.filter(r=>r.faction===1),k)};
const improved=rows.filter(r=>r.adapter.success&&!r.baseline.success).length,regressed=rows.filter(r=>!r.adapter.success&&r.baseline.success).length;
const gate={allSyntheticTestScenesPassed:metrics.adapter.all.success===rows.length,noWallCrossing:metrics.adapter.all.wallCross===0,noInvalidChoices:metrics.adapter.all.invalid===0,noRegressionAgainstBaseline:regressed===0,deploymentReady:false,reason:'Synthetic offline replay is not a normal match, WebLLM integration, performance or safety acceptance.'};
const result={training:{steps:report.steps,dev_choice_token_loss_before:report.dev_choice_token_loss_before,dev_choice_token_loss_after:report.dev_choice_token_loss_after,dataset:report.dataset},metrics,paired:{improved,regressed},gate,rows};
await writeFile(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({training:result.training,metrics,paired:result.paired,gate}));
