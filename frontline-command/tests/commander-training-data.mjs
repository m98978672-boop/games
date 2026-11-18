import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {collect,teacher,writeDataset} from '../tools/training/collect-commander.mjs';
import {validateProposal} from '../src/sim/neutral_commander.js';
import {BASE_PROMPT,commanderPrompt} from '../src/ai/commander-prompts.js';
assert.deepEqual(teacher({squads:[],points:[],builds:[]}),{action:'none'});
assert.deepEqual(teacher({squads:[{ammo:69,engineers:1}],points:[{}],builds:[{}]}),{action:'supply',squad:0});
assert.deepEqual(teacher({squads:[{ammo:70,engineers:1}],points:[{}],builds:[{}]}),{action:'build',squad:0,build:0});
assert.deepEqual(teacher({squads:[{ammo:70,engineers:0}],points:[{}],builds:[]}),{action:'hold',squad:0,point:0});
await assert.rejects(collect({trainSeeds:[1],evalSeeds:[1],seconds:1}),/disjoint/);
const dir=await mkdtemp(join(tmpdir(),'frontline-dataset-'));
try{
 const opts={trainSeeds:[1],evalSeeds:[2],seconds:2,interval:1};const manifest=await writeDataset(dir,opts);const keys=new Set();
 for(const split of ['train','eval']){
  const raw=await readFile(join(dir,split+'.jsonl'));assert.equal(createHash('sha256').update(raw).digest('hex'),manifest.files[split].sha256);
  const rows=raw.toString().trim().split('\n').map(JSON.parse);assert.equal(rows.length,manifest.files[split].count);assert.ok(rows.length>0);
  for(const row of rows){assert.ok(manifest[split+'Seeds'].includes(row.seed));const key=JSON.stringify(row.input);assert.ok(!keys.has(key));keys.add(key);assert.deepEqual(Object.keys(row.input).sort(),['builds','points','squads']);assert.doesNotMatch(key,/(faction|enemy|time|squadId|pointId|history)/i);
   const fake={input:row.input,squads:row.input.squads.map((_,i)=>i+1),points:row.input.points.map((_,i)=>i+1),builds:row.input.builds.map((_,i)=>i+1)};
   assert.ok(validateProposal(row.response,fake),'teacher output passes actual validator');
  }
 }
 assert.equal(manifest.prompt,BASE_PROMPT,'baseline dataset uses baseline prompt');
 const knowledge=await collect({...opts,knowledge:true});
 assert.equal(knowledge.prompt,commanderPrompt(true),'knowledge dataset matches worker prompt');
 assert.deepEqual(knowledge.data.train.map(r=>r.input),(await readFile(join(dir,'train.jsonl'),'utf8')).trim().split('\n').map(x=>JSON.parse(x).input),'prompt choice must not affect snapshots');
 const again=await collect(opts);
 for(const split of ['train','eval']){
  const contents=again.data[split].map(row=>JSON.stringify(row)).join('\n')+'\n';
  assert.equal(createHash('sha256').update(contents).digest('hex'),manifest.files[split].sha256,'dataset must be reproducible');
 }
}finally{await rm(dir,{recursive:true,force:true});}
console.log('Training dataset: isolated snapshots, valid heuristic labels, disjoint seeds, exact-deduplication and reproducible hashes. No neural training in this test.');
