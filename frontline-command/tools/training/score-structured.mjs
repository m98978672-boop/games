// Verify the frozen evaluation output with the game's actual command parser.
import {readFile,writeFile} from 'node:fs/promises';
import {validateProposal} from '../../src/sim/neutral_commander.js';
const path=process.argv[2];if(!path)throw Error('usage: score-structured.mjs REPORT');
const report=JSON.parse(await readFile(path,'utf8')),scores={};
for(const name of ['initial','selected']){
 const rows=report[`${name}_test_rows`];if(!Array.isArray(rows)||!rows.length)throw Error('no test rows');let valid=0,exact=0;
 for(const r of rows){
  const s={input:r.input,squads:r.input.squads.map((_,i)=>i+1),points:r.input.points.map((_,i)=>i+1),builds:r.input.builds.map((_,i)=>i+1)};
  const proposal=validateProposal(JSON.stringify(r.prediction),s);if(proposal)valid++;
  if(proposal&&JSON.stringify(proposal)===JSON.stringify(r.teacher))exact++;
 }
 scores[name]={valid,exact,total:rows.length};
 if(exact!==report.test[name].exact)throw Error('test scoring mismatch');
}
report.gameValidator=scores;await writeFile(path,JSON.stringify(report,null,2)+'\n');console.log('::notice::STRUCTURED_VALIDATOR '+JSON.stringify(scores));
