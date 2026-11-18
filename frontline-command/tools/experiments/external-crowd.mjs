// Research-only adapters. All motion still goes through the game's collision checks.
import {build} from 'esbuild';
import {resolve} from 'node:path';
let Orca;
export async function initOrca(){
 if(Orca)return;
 // The npm package ships Kdtree.ts but imports ./KdTree on case-sensitive systems.
 const path=resolve('node_modules/@gamex/cc-rvo2/assets/Kdtree.ts');
 const bundle=await build({entryPoints:[resolve('node_modules/@gamex/cc-rvo2/index.ts')],bundle:true,format:'esm',platform:'node',write:false,
  plugins:[{name:'fix-upstream-filename-case',setup(b){b.onResolve({filter:/^\.\/KdTree$/},()=>({path}));}}]});
 ({Simulator:Orca}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].contents).toString('base64')));
}
export function orcaVelocity(g,u,dx,dy,dt,neighbors,metrics){
 metrics.orcaCalls++;
 const sim=new Orca(),speed=Math.max(1,u.speed*g.world.speedAt(u.x,u.y));
 const opts=v=>({radius:v.radius,maxSpeed:speed,neighborDist:110,maxNeighbors:10,timeHorizon:1.5,timeHorizonObstacle:1,velocity:{x:v.arrived?0:(v.vx||0),y:v.arrived?0:(v.vy||0)}});
 const id=sim.addAgent({x:u.x,y:u.y},opts(u));
 for(const v of neighbors)sim.addAgent({x:v.x,y:v.y},opts(v));
 let len=Math.hypot(dx,dy);if(len>1){dx/=len;dy/=len;}
 sim.setAgentPrefVelocity(id,dx*speed,dy*speed);sim.step(dt);
 const vel=sim.getAgentVelocity(id),x=vel.x/speed,y=vel.y/speed;
 if(!Number.isFinite(x)||!Number.isFinite(y))throw Error(`Non-finite ORCA velocity for unit ${u.id}`);
 if(Math.hypot(x-dx,y-dy)>1e-6)metrics.orcaAdjusted++;
 return {x,y};
}
export async function installExternalSteering(g, {orca=false,tree=false,units,door}){
 const before=g._experimentalSteering;
 const metrics={orcaCalls:0,orcaAdjusted:0,treeTicks:0,treeWaits:0};
 if(orca)await initOrca();
 let bt,blackboard;
 if(tree){
  const b3=(await import('behavior3js')).default;
  // The policy is ours; Behavior3 evaluates the sequence. A unit approaching
  // from outside waits briefly while a unit from inside approaches the door.
  const WaitForExit=b3.Class(b3.Action,{name:'WaitForExit',tick(t){
   const {u,neighbors,time}=t.target;
   const d=(u.x-door.x)*door.nx+(u.y-door.y)*door.ny;
   const waiting=d>0 && Math.abs(d)<90 && neighbors.some(v=>{
    const vd=(v.x-door.x)*door.nx+(v.y-door.y)*door.ny;
    return vd<0 && vd>-90 && v.goal && (v.goal.x-door.x)*door.nx+(v.goal.y-door.y)*door.ny>0;
   });
   if(!waiting){u._btWaitStart=null;return b3.FAILURE;}
   if(u._btWaitStart==null)u._btWaitStart=time;
   if(time-u._btWaitStart>3)return b3.FAILURE;
   return b3.SUCCESS;
  }});
  bt=new b3.BehaviorTree();bt.root=new b3.Sequence({children:[new WaitForExit()]});blackboard=new b3.Blackboard();
 }
 g._experimentalSteering=(u,dx,dy,dt)=>{
  const live=units.map(v=>v.u).filter(v=>v.alive&&!v.downed);
  const neighbors=live.filter(v=>v!==u&&Math.hypot(v.x-u.x,v.y-u.y)<110);
  if(tree){metrics.treeTicks++;if(bt.tick({u,neighbors,time:g.time},blackboard)===1){metrics.treeWaits++;return {x:0,y:0};}}
  if(before){const p=before(u,dx,dy,dt);if(p){dx=p.x;dy=p.y;}}
  if(!orca)return {x:dx,y:dy};
  return orcaVelocity(g,u,dx,dy,dt,neighbors,metrics);
 };
 return metrics;
}

// Research war adapter: apply only to uncontrolled infantry with a goal, out
// of contact. Neighbors include all live roles/factions as solid obstacles.
export async function installWarMix(g){
 await initOrca();
 const Yuka=await import('yuka');
 const sep=new Yuka.SeparationBehavior(),vehicle=new Yuka.Vehicle(),force=new Yuka.Vector3();
 const metrics={calls:0,yukaAdjusted:0,orcaCalls:0,orcaAdjusted:0};
 g._experimentalSteering=(u,dx,dy,dt)=>{
  if(u.role!=='infantry'||u.playerControlled||!u.goal||u.perception?.hasContact)return {x:dx,y:dy};
  metrics.calls++;
  const neighbors=g.unitGrid.queryRange(u.x,u.y,110).filter(v=>v!==u&&v.alive&&!v.downed&&Math.hypot(v.x-u.x,v.y-u.y)<110);
  vehicle.position.set(u.x,0,u.y);
  vehicle.neighbors=neighbors.filter(v=>Math.hypot(v.x-u.x,v.y-u.y)<55).map(v=>({position:new Yuka.Vector3(v.x,0,v.y)}));
  force.set(0,0,0);sep.calculate(vehicle,force);
  if(Math.hypot(force.x,force.z)>1e-9)metrics.yukaAdjusted++;
  return orcaVelocity(g,u,dx+force.x*10,dy+force.z*10,dt,neighbors,metrics);
 };
 return metrics;
}

// Four separate combat controllers in a research-only four-faction arena.
// These are variants of the same game soldier AI, not independently trained AIs.
export async function installFourControllers(g){
 await initOrca();
 const Yuka=await import('yuka'),sep=new Yuka.SeparationBehavior(),vehicle=new Yuka.Vehicle(),force=new Yuka.Vector3();
 const metrics=Array.from({length:4},()=>({calls:0,yukaNonzero:0,orcaCalls:0,orcaAdjusted:0,hybridBlends:0}));
 const names=['original','yuka','orca','hybrid'];
 g._experimentalSteering=(u,dx,dy,dt)=>{
  const type=u._arenaController;
  if(!names.includes(type)||!u.goal||u.playerControlled||!u.alive||u.downed)return {x:dx,y:dy};
  const m=metrics[names.indexOf(type)];m.calls++;
  if(type==='original')return {x:dx,y:dy};
  const neighbors=g.unitGrid.queryRange(u.x,u.y,110).filter(v=>v!==u&&v.alive&&!v.downed&&Math.hypot(v.x-u.x,v.y-u.y)<110);
  if(type==='yuka'||type==='hybrid'){
   vehicle.position.set(u.x,0,u.y);
   vehicle.neighbors=neighbors.filter(v=>Math.hypot(v.x-u.x,v.y-u.y)<55).map(v=>({position:new Yuka.Vector3(v.x,0,v.y)}));
   force.set(0,0,0);sep.calculate(vehicle,force);
   if(Math.hypot(force.x,force.z)>1e-9)m.yukaNonzero++;
   dx+=force.x*10;dy+=force.z*10;
  }
  if(type==='yuka')return {x:dx,y:dy};
  const out=orcaVelocity(g,u,dx,dy,dt,neighbors,m);
  if(type==='orca')return out;
  // New tentative hybrid: Yuka desired direction, then ORCA, with 25%
  // desired direction retained. No safety/optimality guarantee is claimed.
  let n=Math.hypot(dx,dy);if(n>1){dx/=n;dy/=n;}m.hybridBlends++;
  return {x:0.75*out.x+0.25*dx,y:0.75*out.y+0.25*dy};
 };
 return Object.fromEntries(names.map((name,i)=>[name,metrics[i]]));
}
