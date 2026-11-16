// Controlled scheduler handoff comparison; not a full navigation acceptance.
import {pathToFileURL} from 'node:url';import {resolve,join} from 'node:path';import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.slice(n.length+3);
if(!arg('baseline'))throw Error('pass --baseline=/path/to/pre-change/project');
const n=Number(arg('seeds')||20);if(!Number.isSafeInteger(n)||n<1||n>100)throw Error('bad seeds');
async function load(root){return {config:await import(pathToFileURL(join(root,'src/core/config.js'))),game:await import(pathToFileURL(join(root,'src/sim/game.js'))),units:await import(pathToFileURL(join(root,'src/sim/units.js'))),route:await import(pathToFileURL(join(root,'src/sim/smart_route.js')))};}
const base=resolve(arg('baseline')),before=await load(base),after=await load(resolve('.'));
async function scene(mod,seed,faction,role){
 const cfg=await mod.config.loadConfig();cfg.flags.smart_route_v2=true;
 const g=new mod.game.Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();
 const size=1024,free=(x,y)=>x>0&&y>0&&x<size&&y<size;
 g.world={W:size,H:size,navVersion:1,isBaseWalkable:free,isWalkable:free,speedAt:()=>1};
 g.walls={enabled:()=>true,blocksMove:()=>false,doorWaypoint:()=>null,doorsForUnit:()=>{},navQueue:new Set()};g.nav={field:()=>null};
 const a=g.spawnUnit(faction,role,150,150),b=g.spawnUnit(faction,'infantry',750,750);
 a.goal={x:200,y:150};b.goal={x:400,y:400};for(const u of [a,b]){u.stuck=1;u.arrived=false;u.activity='advance';}
 let reached=null,assigned=null,first=null,maxStep=0,job;
 for(let i=1;i<=220;i++){
  g.time=i*.05;
  if(!a.arrived){const x=a.x,y=a.y;mod.units.moveAlongFlow(g,a,.05);maxStep=Math.max(maxStep,Math.hypot(a.x-x,a.y-y));if(!job)job=g._smartRouteState?.active;}
  if(a.arrived&&reached===null)reached=g.time;
  mod.route.updateSmartRoute(g,b);
  if(!first)first=g._smartRouteState?.active?.unit?.id;
  if(g._smartRouteState?.active?.unit===b||b._smartRoute){assigned=g.time;break;}
 }
 return {reached,assigned,wait:reached!==null&&assigned!==null?+(assigned-reached).toFixed(3):null,firstWasA:first===a.id,
  originalJobStatus:job?.planner.status??null,noTeleport:maxStep<=a.speed*.05*1.5+1e-8};
}
const pairs=[];for(const role of ['infantry','truck','tank'])for(const faction of [0,1])for(let seed=1;seed<=n;seed++)pairs.push({role,faction,seed,before:await scene(before,seed,faction,role),after:await scene(after,seed,faction,role)});
const summary={cases:pairs.length,bothReached:pairs.filter(p=>p.before.reached!==null&&p.after.reached!==null).length,bothAssigned:pairs.filter(p=>p.before.assigned!==null&&p.after.assigned!==null).length,
 faster:pairs.filter(p=>p.before.wait!==null&&p.after.wait!==null&&p.after.wait<p.before.wait).length,slower:pairs.filter(p=>p.before.wait!==null&&p.after.wait!==null&&p.after.wait>p.before.wait).length,
 beforeWaitRange:[Math.min(...pairs.map(p=>p.before.wait)),Math.max(...pairs.map(p=>p.before.wait))],afterWaitRange:[Math.min(...pairs.map(p=>p.after.wait)),Math.max(...pairs.map(p=>p.after.wait))],
 allNoTeleport:pairs.every(p=>p.before.noTeleport&&p.after.noTeleport),allStartedOnA:pairs.every(p=>p.before.firstWasA&&p.after.firstWasA)};
const hashes={};for(const file of ['src/sim/smart_route.js','src/sim/units.js'])hashes[file]=createHash('sha256').update(await readFile(join(base,file))).digest('hex');
console.log(JSON.stringify({seeds:n,summary,pairs,baselineFilesSha256:hashes,caveats:['Controlled direct moveAlongFlow/updateSmartRoute calls, not Game.step or a battle','Same synthetic empty geometry and forced stuck state on both sides; a starts 50 units from its goal and moves normally','No crowds, obstacles, combat, changing doors, save/replay, fps or balance coverage','Only experimental smart_route_v2 is enabled; it remains off by default']},null,2));
if(!summary.allStartedOnA||!summary.allNoTeleport||summary.bothReached!==pairs.length||summary.bothAssigned!==pairs.length||summary.slower)process.exitCode=1;
