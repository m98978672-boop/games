export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
// Roads run on an 80-metre grid. The car is 1 unit = 1 metre.
export function onRoad(x,z){return Math.min(Math.abs(x-Math.round(x/80)*80),Math.abs(z-Math.round(z/80)*80))<10;}
export function stepCar(car,input,dt){
 const old={x:car.x,z:car.z};
 // Steering rack has inertia and recentres; a bicycle model links yaw to
 // distance travelled and wheelbase instead of rotating in place.
 const target=(input.right?1:0)-(input.left?1:0);
 const response=1-Math.exp(-4*dt);
 car.steering=(car.steering||0)+(target-(car.steering||0))*response;
 const acceleration=(input.gas?7:0)-(input.brake?13:input.handbrake?18:input.gas?0:1.5);
 car.speed=clamp(car.speed+acceleration*dt,0,car.maxSpeed);
 const direction=car.gear===-1?-1:1;
 const maxAngle=.55/(1+car.speed*.055);
 const wheelbase=car.wheelbase||2.82;
 car.heading-=direction*car.speed/wheelbase*Math.tan(car.steering*maxAngle)*dt;
 car.x+=Math.sin(car.heading)*car.speed*direction*dt;car.z+=Math.cos(car.heading)*car.speed*direction*dt;
 if(!onRoad(car.x,car.z)){car.x=old.x;car.z=old.z;const impact=car.speed;car.speed=0;return impact;}
 return 0;
}
