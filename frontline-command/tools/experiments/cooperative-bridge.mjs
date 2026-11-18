// Diagnostic-only local proposal bridge; not a language-model network.
// Four movement variants share the same game state, propose velocities, and
// a deterministic arbiter selects one subject to physical checks.
import {initOrca,orcaVelocity} from './external-crowd.mjs';
import {solidUnitMoveFree} from '../../src/sim/solid_units.js';
export async function installCooperativeBridge(g){
 await initOrca();
 const Yuka=await import('yuka'),behavior=new Yuka.SeparationBehavior(),vehicle=new Yuka.Vehicle(),force=new Yuka.Vector3();
 const metrics={calls:0,skipped:0,proposals:0,yukaNonzero:0,orcaCalls:0,orcaAdjusted:0,selected:{original:0,yuka:0,orca:0,hybrid:0,wait:0}};
 g._experimentalSteering=(u,dx,dy,dt)=>{
  if(u.isVehicle||u.playerControlled||!u.alive||u.downed||!u.goal||u.perception?.hasContact)return {x:dx,y:dy};
  metrics.calls++;
  const neighbors=g.unitGrid.queryRange(u.x,u.y,110).filter(v=>v!==u&&v.alive&&!v.downed&&Math.hypot(v.x-u.x,v.y-u.y)<110);
  if(!neighbors.length){metrics.skipped++;return {x:dx,y:dy};}
  const norm=v=>{const n=Math.hypot(v.x,v.y);return n>1?{x:v.x/n,y:v.y/n}:v;};
  const original=norm({x:dx,y:dy});
  vehicle.position.set(u.x,0,u.y);vehicle.neighbors=neighbors.filter(v=>Math.hypot(v.x-u.x,v.y-u.y)<55).map(v=>({position:new Yuka.Vector3(v.x,0,v.y)}));
  force.set(0,0,0);behavior.calculate(vehicle,force);if(Math.hypot(force.x,force.z)>1e-9)metrics.yukaNonzero++;
  const yuka=norm({x:original.x+force.x*10,y:original.y+force.z*10});
  const orca=orcaVelocity(g,u,original.x,original.y,dt,neighbors,metrics);
  const hybridOrca=orcaVelocity(g,u,yuka.x,yuka.y,dt,neighbors,metrics);
  const hybrid=norm({x:hybridOrca.x*.75+yuka.x*.25,y:hybridOrca.y*.75+yuka.y*.25});
  const candidates=[['original',original],['yuka',yuka],['orca',orca],['hybrid',hybrid]];metrics.proposals+=candidates.length;
  const speed=u.speed*g.world.speedAt(u.x,u.y),r=u.radius,w=g.world,grid=g.occupancyGrid;
  let chosen=null,best=-Infinity;
  for(const [name,v] of candidates){
   if(!Number.isFinite(v.x)||!Number.isFinite(v.y))continue;
   const x=u.x+v.x*speed*dt,y=u.y+v.y*speed*dt;
   if(![[0,0],[-r,-r],[-r,r],[r,-r],[r,r]].every(([ox,oy])=>w.isBaseWalkable(x+ox,y+oy)))continue;
   if(g.walls?.enabled()&&(g.walls.blocksMove(x,y,r,u)||g.walls.blocksMoveSweep(u.x,u.y,x,y,r,u)))continue;
   if(!solidUnitMoveFree(g,u,x,y,0.01,grid))continue;
   // Penalise closing too tightly while retaining progress and avoiding a hard
   // deadlock-inducing preference for zero velocity. This is a heuristic.
   let clearance=0;for(const o of neighbors){const d=Math.hypot(x-o.x,y-o.y),safe=u.radius+o.radius+12;if(d<safe)clearance+=(safe-d)/safe;}
   const length=Math.hypot(v.x,v.y),forward=v.x*original.x+v.y*original.y;
   const score=forward+0.15*length-0.5*clearance;
   if(score>best){best=score;chosen={name,v};}
  }
  if(!chosen){metrics.selected.wait++;return {x:0,y:0};}
  metrics.selected[chosen.name]++;return chosen.v;
 };
 return metrics;
}
