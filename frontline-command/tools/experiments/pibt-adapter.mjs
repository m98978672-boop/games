// Offline PIBT schedule on sampled terrain, replayed through actual game movement.
// Discrete ticks are not a physical collision guarantee; walls/occupancy remain on.
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const planner=fileURLToPath(new URL('./pibt-plan.py',import.meta.url));
export function installPibt(g,units,door,building,opening,seed){
 const spacing=20,half=9,size=2*half+1,r=units[0].u.radius;
 const toGrid=(x,y)=>[Math.round((y-door.y)/spacing)+half,Math.round((x-door.x)/spacing)+half];
 const toWorld=([y,x])=>({x:door.x+(x-half)*spacing,y:door.y+(y-half)*spacing});
 const ds=g.walls.state(building).doors[opening.id],saved=ds.state;ds.state='open';
 const grid=[];
 try{for(let y=0;y<size;y++){const row=[];for(let x=0;x<size;x++){
  const p=toWorld([y,x]);row.push(g.world.isBaseWalkable(p.x,p.y)&&g.world.isBaseWalkable(p.x-r,p.y-r)&&g.world.isBaseWalkable(p.x+r,p.y+r)&&!g.walls.blocksMove(p.x,p.y,r,units[0].u));
 }grid.push(row);}}finally{ds.state=saved;}
 const starts=units.map(({u})=>toGrid(u.x,u.y)),goals=units.map(({u})=>toGrid(u.goal.x,u.goal.y));
 const p=spawnSync(process.env.PYPIBT_PYTHON||'python3',[planner],{encoding:'utf8',input:JSON.stringify({grid,starts,goals,seed}),maxBuffer:4*1024*1024});
 if(p.status!==0)throw Error(`pypibt failed: ${p.stderr}`);
 const result=JSON.parse(p.stdout),metrics={planSolved:!!result.solved,planValid:!!result.valid,planReason:result.reason||null,steps:result.steps?.length||0,stage:0,steering:0,waits:0};
 if(!result.ok)return {metrics,advance(){}};
 let stage=0;const plans=result.steps,previous=g._experimentalSteering;
 g._experimentalSteering=(u,dx,dy,dt)=>{
  const i=units.findIndex(e=>e.u===u);if(i<0)return previous?previous(u,dx,dy,dt):{x:dx,y:dy};
  const waypoint=toWorld(plans[stage][i]),vx=waypoint.x-u.x,vy=waypoint.y-u.y,dist=Math.hypot(vx,vy);
  metrics.steering++;
  if(dist<2){metrics.waits++;return {x:0,y:0};}
  const scale=Math.min(1,dist/(Math.max(1,u.speed*g.world.speedAt(u.x,u.y))*dt))/dist;
  const v={x:vx*scale,y:vy*scale};
  return previous?previous(u,v.x,v.y,dt):v;
 };
 return {metrics,advance(){
  if(stage>=plans.length-1)return;
  if(units.every(({u},i)=>u.arrived||u.pathFailed||Math.hypot(u.x-toWorld(plans[stage][i]).x,u.y-toWorld(plans[stage][i]).y)<2))stage++;
  metrics.stage=stage;
 }};
}
