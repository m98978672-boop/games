// Score free-running outputs with the same parser as the game. This is NOT a war test.
import {readFile,writeFile} from 'node:fs/promises';import {validateProposal} from '../../src/sim/neutral_commander.js';
const path=process.argv[2];if(!path)throw Error('usage: node tools/training/score-generated.mjs RESULTS.json');
const report=JSON.parse(await readFile(path,'utf8'));const scores={};
for(const name of ['base','adapter']){
 let valid=0,teacherExact=0;
 for(const row of report.results){
  const s={input:row.input,squads:row.input.squads.map((_,i)=>i+1),points:row.input.points.map((_,i)=>i+1),builds:row.input.builds.map((_,i)=>i+1)};
  const parsed=validateProposal(row[name],s);if(parsed){valid++;const expected=JSON.parse(row.teacher);if(Object.keys(expected).every(key=>parsed[key]===expected[key])&&Object.keys(parsed).length===Object.keys(expected).length)teacherExact++;}
 }
 scores[name]={valid,teacherExact,total:report.results.length};
}
report.scores=scores;await writeFile(path,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(scores));
