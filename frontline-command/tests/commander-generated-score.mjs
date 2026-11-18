import assert from 'node:assert/strict';import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';import {execFileSync} from 'node:child_process';import {join} from 'node:path';import {tmpdir} from 'node:os';
const dir=await mkdtemp(join(tmpdir(),'commander-score-'));
try{
 const path=join(dir,'report.json');const input={squads:[{ammo:50,engineers:0}],points:[{kind:'hq',key:true}],builds:[]};
 await writeFile(path,JSON.stringify({results:[{input,teacher:'{"action":"supply","squad":0}',base:'{"squad":0,"action":"supply"}',adapter:'{"action":"hold","squad":0,"point":0}'},{input,teacher:'{"action":"supply","squad":0}',base:'extra text',adapter:'{"action":"supply","squad":99}'}]}));
 execFileSync('node',['tools/training/score-generated.mjs',path],{cwd:new URL('..',import.meta.url)});
 const report=JSON.parse(await readFile(path,'utf8'));assert.deepEqual(report.scores,{base:{valid:1,teacherExact:1,total:2},adapter:{valid:1,teacherExact:0,total:2}});
}finally{await rm(dir,{recursive:true,force:true});}
console.log('Generated-output scoring uses game validator, recognizes equivalent key order, rejects extra text and bad indexes.');
