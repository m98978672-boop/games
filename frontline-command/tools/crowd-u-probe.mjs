// Controlled Game.step probe: synthetic U geometry, shared goals, no combat.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {Nav} from '../src/sim/nav.js';import {Walls} from '../src/sim/walls.js';
const cfg=await loadConfig();
function run(f,seed,n){
 const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();
 for(const sys of [g.squadAI,...g.strategic,g.autopilot,g.rules,g.logistics,g.build,g.influence,g.api])sys.update=()=>{};g.checkVictory=()=>{};g.walls.update=()=>{};
 const m=x=>f?1536-x:x,seg=[[760,680,896,680],[896,680,896,856],[896,856,760,856]].map(([a,b,c,d])=>[m(a),b,m(c),d]);
 const inside=(x,y)=>x>0&&y>0&&x<1536&&y<1536,blocked=(x,y,r)=>seg.some(s=>Walls.distPointSegment(x,y,...s).d<=8+r);
 Object.assign(g.world,{W:1536,H:1536,navVersion:1,isWalkable:(x,y)=>inside(x,y)&&!blocked(x,y,0),isBaseWalkable:inside,speedAt:()=>1,terrainAt:()=>0,hasLOS:()=>true});
 Object.assign(g.walls,{enabled:()=>true,doorWaypoint:()=>null,doorsForUnit:()=>{},blocksMove:blocked,buildingAtPoint:()=>null,refsNear:()=>[],refsInBox:()=>[],blocksMoveSweep:(x,y,xx,yy,r)=>{const n=Math.max(1,Math.ceil(Math.hypot(xx-x,yy-y)));for(let i=1;i<=n;i++)if(blocked(x+(xx-x)*i/n,y+(yy-y)*i/n,r))return true;return false;}});g.nav=new Nav(g.world,cfg);
 const us=Array.from({length:n},(_,i)=>{let u=g.spawnUnit(f,'infantry',m(790+i%2*25),720+Math.floor(i/2)*24);u.goal={x:m(1080),y:768};u.activity='advance';u.arrived=false;u.thinkTimer=1000;return u;});
 let cross=0,overlap=0,speed=0,search=0;
 for(let i=0;i<1600;i++){const before=us.map(u=>({x:u.x,y:u.y}));g.step(.05);for(let j=0;j<us.length;j++){let u=us[j],p=before[j],step=Math.hypot(u.x-p.x,u.y-p.y);if(step>u.speed*.05*1.5+1e-8)speed++;for(let k=1;k<=Math.ceil(step);k++)if(blocked(p.x+(u.x-p.x)*k/Math.ceil(step),p.y+(u.y-p.y)*k/Math.ceil(step),u.radius))cross++;}if(us.some((a,i)=>us.slice(i+1).some(b=>Math.hypot(a.x-b.x,a.y-b.y)<a.radius+b.radius-1e-6)))overlap++;search+=!!g._smartRouteState?.active;if(us.every(u=>u.arrived||u.pathFailed))break;}
 return {f,seed,n,arrived:us.filter(u=>u.arrived&&!u.pathFailed).length,failed:us.filter(u=>u.pathFailed).length,cross,overlap,speed,search,seconds:g.time,units:us.map(u=>({x:+u.x.toFixed(1),y:+u.y.toFixed(1),stuck:u.stuck,goal:u.goal,arrived:u.arrived,failed:u.pathFailed}))};
}
const results=[];for(const f of [0,1])for(const n of [3,4,5,6,8,10])for(const seed of [5,7,11,23])results.push(run(f,seed,n));console.log(JSON.stringify({results},null,2));
