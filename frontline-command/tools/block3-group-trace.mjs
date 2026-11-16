// Detailed diagnostic for the city/door-1 group-of-five scene.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const seed=Number(process.argv.find(s=>s.startsWith('--seed='))?.slice(7)||1),faction=Number(process.argv.find(s=>s.startsWith('--faction='))?.slice(10)||1);
if(!Number.isSafeInteger(seed)||seed<1||![0,1].includes(faction))throw Error('invalid arguments');
const cfg=await loadConfig();
if(process.argv.includes('--occupancy')) cfg.flags.movement_occupancy_v1=true;
else for(const id of ['crowd_swept_units_v1','crowd_nav_v2','group_nav_3to5_v1','vision_nav_policy_v1','arrival_stuck_guard_v1','crowd_slot_avoid_v1'])cfg.flags[id]=true;
const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.squads.clear();g.autopilot.update=()=>{};for(const ai of g.strategic)ai.update=()=>{};g.rules.update=()=>{};g.logistics.update=()=>{};g.checkVictory=()=>{};
const b=g.world.buildings.find(b=>b.type==='city'&&b.faction===faction&&g.walls.state(b)),o=g.walls.state(b).outline.openings.filter(o=>o.type==='door')[1],px=b.x+o.cx,py=b.y+o.cy;
const units=Array.from({length:5},(_,i)=>{const u=g.spawnUnit(faction,'infantry',px+o.nx*(55+i*24),py+o.ny*(55+i*24));u.goal={x:px-o.nx*105,y:py-o.ny*105};u.activity='advance';u.arrived=false;u.thinkTimer=10000;return u;});
function snapshot(u){const p=u._crowdPoint||u._crowdAssigned;return {id:u.id,x:u.x,y:u.y,goal:u.goal,slot:p,arrived:u.arrived,failed:u.pathFailed,stuck:u.stuck,distSlot:p?Math.hypot(u.x-p.x,u.y-p.y):null,slotWall:p?g.walls.blocksMove(p.x,p.y,u.radius,u):null,slotTerrain:p?g.world.isBaseWalkable(p.x,p.y):null,others:units.filter(v=>v!==u).map(v=>({id:v.id,x:v.x,y:v.y,distance:Math.hypot(v.x-u.x,v.y-u.y),arrived:v.arrived,failed:v.pathFailed,slot:v._crowdAssigned}))};}
let before=null,tick=0;const failures=[];
for(;tick<1200;tick++){before=units.map(snapshot);g.step(.05);for(let i=0;i<units.length;i++)if(!before[i].failed&&units[i].pathFailed)failures.push({tick:tick+1,before:before[i],after:snapshot(units[i])});if(units.every(u=>u.arrived||u.pathFailed))break;}
console.log(JSON.stringify({seed,faction,building:{x:b.x,y:b.y},opening:o,ticks:tick+1,failures,final:units.map(snapshot),caveats:['Fixed goals and controlled Game.step; no combat or autopilot','Diagnostic adds wall-query calls and is not timing/balance evidence']},null,2));
