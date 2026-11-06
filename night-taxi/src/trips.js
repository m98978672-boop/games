// Calls are assigned to the sidewalk in the middle of a block, away from
// intersections and facades. The adjacent marker is on the drivable road.
export function curbLocation(intersection){
 return {stop:{x:intersection.x+7,z:intersection.z+40},wait:{x:intersection.x+12.7,z:intersection.z+40}};
}
export function makeBoarding(wait,car,vehicleWidth,rearZ=-.55){
 const right={x:Math.cos(car.heading),z:-Math.sin(car.heading)},forward={x:Math.sin(car.heading),z:Math.cos(car.heading)};
 const side=(wait.x-car.x)*right.x+(wait.z-car.z)*right.z>=0?1:-1;
 const near={x:car.x+right.x*side*(vehicleWidth/2+.55)+forward.x*rearZ,z:car.z+right.z*side*(vehicleWidth/2+.55)+forward.z*rearZ};
 const seat={x:car.x+right.x*side*.38+forward.x*rearZ,z:car.z+right.z*side*.38+forward.z*rearZ};
 return {start:{...wait},near,seat,elapsed:0,duration:4.2};
}
export function boardingPose(sequence,dt){
 sequence.elapsed=Math.min(sequence.duration,sequence.elapsed+Math.max(0,dt));
 const t=sequence.elapsed/sequence.duration,walk=Math.min(1,t/.68),sit=Math.max(0,(t-.68)/.32);
 const smooth=x=>x*x*(3-2*x);const a=smooth(walk),b=smooth(sit);
 const x=sequence.start.x+(sequence.near.x-sequence.start.x)*a+(sequence.seat.x-sequence.near.x)*b;
 const z=sequence.start.z+(sequence.near.z-sequence.start.z)*a+(sequence.seat.z-sequence.near.z)*b;
 const dx=walk<1?sequence.near.x-sequence.start.x:sequence.seat.x-sequence.near.x,dz=walk<1?sequence.near.z-sequence.start.z:sequence.seat.z-sequence.near.z;
 return {x,z,heading:Math.atan2(dx,dz),stride:walk<1?Math.sin(sequence.elapsed*8)*.5:0,sit:b,done:t>=1};
}
