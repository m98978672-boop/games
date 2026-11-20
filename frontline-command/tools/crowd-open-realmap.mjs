// Isolated shared-goal movement with real map, walls, terrain and Game.step.
// Fixed soldier goals: no combat or live squad decision-making.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {clearFinalApproach} from '../src/sim/arrival.js';
const cfg=await loadConfig();
function fresh(seed){const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();for(const s of [g.squadAI,...g.strategic,g.autopilot,g.rules,g.logistics,g.build,g.influence,g.api])s.update=()=>{};g.checkVictory=()=>{};return g;}
const terrain=fresh(1),sites=[];
for(let y=500;y<terrain.world.H-500&&sites.length<6;y+=400)for(let x=500;x<terrain.world.W-500&&sites.length<6;x+=400){
 if(terrain.walls.buildingAtPoint(x,y)||terrain.walls.buildingAtPoint(x-250,y))continue;
 if([0,1,2,3,4].some(i=>terrain.walls.blocksMove(x-230-i*23,y,10)))continue;
 let valid=true;for(let i=0;i<=28;i++){const a=x-250+i*10;if(!terrain.world.isBaseWalkable(a,y)||!terrain.world.isBaseWalkable(a,y-55)||!terrain.world.isBaseWalkable(a,y+55)||terrain.walls.blocksMove(a,y,25)){valid=false;break;}}
 if(valid&&clearFinalApproach(terrain,{x:x-250,y,radius:9,isVehicle:false},x,y))sites.push({x,y});
}
function run(site,f,seed,n){const g=fresh(seed),direction=f?-1:1,goal={x:site.x,y:site.y};const us=Array.from({length:n},(_,i)=>{const u=g.spawnUnit(f,'infantry',site.x-direction*(125+i*23),site.y);u.goal={...goal};u.activity='advance';u.arrived=false;u.thinkTimer=1000;return u});let wall=0,overlap=0,speed=0,group=0;
 for(let t=0;t<1200;t++){const prev=us.map(u=>({x:u.x,y:u.y,terrain:g.world.speedAt(u.x,u.y)}));g.step(.05);for(let i=0;i<n;i++){const u=us[i],p=prev[i],d=Math.hypot(u.x-p.x,u.y-p.y);if(d>1e-6&&g.walls.blocksMoveSweep(p.x,p.y,u.x,u.y,u.radius,u))wall++;if(d>Math.max(u.speed*p.terrain,30)*.05*1.5+1e-8)speed++;if(u._crowdOpenGroup)group++;}if(us.some((a,i)=>us.slice(i+1).some(b=>Math.hypot(a.x-b.x,a.y-b.y)<a.radius+b.radius-1e-6)))overlap++;if(us.every(u=>u.arrived||u.pathFailed))break;}
 return {site,f,seed,n,arrived:us.filter(u=>u.arrived&&!u.pathFailed).length,within34:us.filter(u=>Math.hypot(u.x-goal.x,u.y-goal.y)<34).length,within50:us.filter(u=>Math.hypot(u.x-goal.x,u.y-goal.y)<50&&clearFinalApproach(g,u,goal.x,goal.y)).length,failed:us.filter(u=>u.pathFailed).length,wall,overlap,speed,group};}
let results=[];for(const site of sites)for(const f of [0,1])for(const n of [3,5])for(const seed of [5,7,11])results.push(run(site,f,seed,n));console.log(JSON.stringify({sites,results},null,2));
