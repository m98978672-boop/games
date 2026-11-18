// Static local navmesh diagnostic, rebuilt once per scene with the HQ door
// assumed open. It is not a dynamic-doors integration or a production route.
import {init,NavMeshQuery} from 'recast-navigation';
import {generateSoloNavMesh} from 'recast-navigation/generators';
await init();
export function installRecast(g,units,door,building,opening){
 const ds=g.walls.state(building).doors[opening.id],saved=ds.state;ds.state='open';
 const positions=[],indices=[],cell=10,half=190,r=units[0].u.radius;
 try{
  for(let x=door.x-half;x<door.x+half;x+=cell)for(let y=door.y-half;y<door.y+half;y+=cell){
   const cx=x+cell/2,cy=y+cell/2;
   if(!g.world.isBaseWalkable(cx,cy)||!g.world.isBaseWalkable(cx-r,cy-r)||!g.world.isBaseWalkable(cx+r,cy+r)||g.walls.blocksMove(cx,cy,r,units[0].u))continue;
   const k=positions.length/3;positions.push(x,0,y,x,0,y+cell,x+cell,0,y+cell,x+cell,0,y);
   indices.push(k,k+1,k+2,k,k+2,k+3);
  }
 } finally {ds.state=saved;}
 const gen=generateSoloNavMesh(positions,indices,{cs:5,ch:2,walkableRadius:0,walkableHeight:2,walkableClimb:1,minRegionArea:0,mergeRegionArea:0,maxSimplificationError:1});
 if(!gen.success)throw Error(`Recast build failed: ${gen.error}`);
 const query=new NavMeshQuery(gen.navMesh),cache=new Map();
 const metrics={queries:0,paths:0,used:0,failed:0,examples:[]};const previous=g._experimentalSteering;
 g._experimentalSteering=(u,dx,dy,dt)=>{
  let c=cache.get(u.id);
  if(!c || c.until<=g.time || c.gx!==u.goal?.x || c.gy!==u.goal?.y){
   metrics.queries++;
   const result=u.goal&&query.computePath({x:u.x,y:0,z:u.y},{x:u.goal.x,y:0,z:u.goal.y});
   const path=result?.success?result.path:[];
   if(metrics.examples.length<3)metrics.examples.push({start:[u.x,u.y],goal:u.goal?[u.goal.x,u.goal.y]:null,path:path.map(p=>[p.x,p.z])});
   // Reject truncated path, do not steer towards a projected inaccessible goal.
   const end=path.at(-1);const valid=end&&Math.hypot(end.x-u.goal.x,end.z-u.goal.y)<15;
   if(valid)metrics.paths++;else metrics.failed++;
   c={points:valid?path.slice(1):[],until:g.time+0.5,gx:u.goal?.x,gy:u.goal?.y};cache.set(u.id,c);
  }
  while(c.points.length>1&&Math.hypot(c.points[0].x-u.x,c.points[0].z-u.y)<8)c.points.shift();
  if(c.points.length){let p=c.points[0];dx=p.x-u.x;dy=p.z-u.y;const d=Math.hypot(dx,dy);if(d>1){dx/=d;dy/=d;}metrics.used++;}
  return previous?previous(u,dx,dy,dt):{x:dx,y:dy};
 };
 return {metrics,dispose(){query.destroy();gen.navMesh.destroy();}};
}
