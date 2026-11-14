// Diagnostic only: samples walls at <= 1px and analytically checks motion
// against the current positions of all other live, non-downed units.
export function motionSafetyProbe(g,tick=()=>0,tracked=null){
 const safety={moves:0,newUnitSweeps:0,existingOverlaps:0,blockedWallEdges:0,startedInWall:0,examples:[]};
 const callback=(u,x0,y0,x1,y1,phase)=>{
  const dx=x1-x0,dy=y1-y0,len2=dx*dx+dy*dy;if(len2<1e-12)return;safety.moves++;
  for(const v of g.units.values()){
   if(v===u||!v.alive||v.downed || (tracked && !tracked.has(u.id) && !tracked.has(v.id)))continue;
   const r=u.radius+v.radius,ox=x0-v.x,oy=y0-v.y,start=ox*ox+oy*oy;
   if(start<r*r-1e-7){safety.existingOverlaps++;continue;}
   const t=Math.max(0,Math.min(1,-(ox*dx+oy*dy)/len2));
   if((ox+dx*t)**2+(oy+dy*t)**2<r*r-1e-7){safety.newUnitSweeps++;if(safety.examples.length<10)safety.examples.push({tick:tick(),kind:'unit',phase,unit:u.id,other:v.id,x0,y0,x1,y1});}
  }
  if(tracked && !tracked.has(u.id))return;
  const count=Math.ceil(Math.sqrt(len2));let hit=false;
  const startBlocked=g.walls.blocksMove(x0,y0,u.radius,u);
  if(startBlocked)safety.startedInWall++;
  for(let k=1;k<=count;k++)if(g.walls.blocksMove(x0+dx*k/count,y0+dy*k/count,u.radius,u)){hit=true;break;}
  if(hit&&!startBlocked){safety.blockedWallEdges++;if(safety.examples.length<10)safety.examples.push({tick:tick(),kind:'wall',phase,unit:u.id,x0,y0,x1,y1});}
 };
 return {safety,callback};
}
