// Before/after pair against the existing strict U18/U216 scenarios.
import {spawnSync} from 'node:child_process';import {resolve,join} from 'node:path';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.slice(n.length+3);
if(!arg('baseline'))throw Error('pass --baseline=/path/to/pre-change/project');
const old=resolve(arg('baseline')),now=resolve('.');
function run(root,script){const p=spawnSync(process.execPath,[join(root,'tools',script),'--smart-route'],{cwd:root,encoding:'utf8',maxBuffer:20*1024*1024});if(p.error)throw p.error;if(p.status!==0&&p.status!==1)throw Error(`${script}: ${p.stderr}`);const v=JSON.parse(p.stdout);if(p.status!==(v.passed===v.total?0:1))throw Error('tool exit/status mismatch');return v;}
const summary={},scenes={};for(const [name,file] of [['u18','audit-u-trap.mjs'],['u216','audit-u-variants.mjs']]){
 const a=run(old,file),b=run(now,file);if(a.results.length!==b.results.length)throw Error('different case count');
 const ok=r=>r.arrived&&!r.pathFailed&&!r.collided&&r.noTeleport&&r.movesAway&&(name!=='u216'||r.distanceToGoal<34);
 const pairs=a.results.map((v,i)=>({before:v,after:b.results[i]}));
 for(const p of pairs)for(const k of ['role','seed','mirrored','rotation','size','faction'])if(p.before[k]!==p.after[k])throw Error(`mismatched input ${k}`);
 summary[name]={cases:pairs.length,beforePassed:pairs.filter(p=>ok(p.before)).length,afterPassed:pairs.filter(p=>ok(p.after)).length,
  regressions:pairs.filter(p=>ok(p.before)&&!ok(p.after)).length,improvements:pairs.filter(p=>!ok(p.before)&&ok(p.after)).length,
  identical:pairs.filter(p=>JSON.stringify(p.before)===JSON.stringify(p.after)).length,reportedBefore:a.passed,reportedAfter:b.passed};scenes[name]=pairs;
}
const baselineFilesSha256={};for(const file of ['src/sim/smart_route.js','src/sim/units.js'])baselineFilesSha256[file]=createHash('sha256').update(readFileSync(join(old,file))).digest('hex');
console.log(JSON.stringify({summary,...scenes,baselineFilesSha256,caveats:['Isolated direct movement calls, no combat or other units; enabled smart_route_v2 on both sides','U18 and U216 use existing strict acceptance rules, including movesAway and distance-to-goal for U216','Same scenes and seeds; no proof for full gameplay, concurrency, timing or default-off configuration']},null,2));
if(Object.values(summary).some(x=>x.regressions||x.beforePassed!==x.reportedBefore||x.afterPassed!==x.reportedAfter))process.exitCode=1;
