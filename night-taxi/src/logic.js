export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
// Roads run on an 80-metre grid. The car is 1 unit = 1 metre.
export function onRoad(x,z){return Math.min(Math.abs(x-Math.round(x/80)*80),Math.abs(z-Math.round(z/80)*80))<10;}
export function stepCar(car,input,dt){
 const old={x:car.x,z:car.z};
 // Smoothed steering rack and longitudinal forces; speed is in metres/second.
 const target=(input.right?1:0)-(input.left?1:0);
 car.steering=(car.steering||0)+(target-(car.steering||0))*(1-Math.exp(-2.7*dt));
 const maxSpeed=(car.maxSpeed||17)*(car.gear===-1?.48:1);
 const throttle=input.gas?7*Math.max(.18,1-car.speed/(maxSpeed*1.25)):0;
 const drag=car.speed>0?.65+car.speed*.045+car.speed*car.speed*.003:0;
 const braking=input.brake?10:input.handbrake?13:0;
 car.speed=clamp(car.speed+(throttle-drag-braking)*dt,0,maxSpeed);
 const direction=car.gear===-1?-1:1;
 const maxAngle=.68/(1+car.speed*.055);
 const wheelbase=car.wheelbase||2.82;
 const desiredYaw=-direction*car.speed/wheelbase*Math.tan(car.steering*maxAngle);
 car.yawRate=(car.yawRate||0)+(desiredYaw-(car.yawRate||0))*(1-Math.exp(-(input.handbrake?2.2:6)*dt));
 if(car.speed>.03)car.heading+=car.yawRate*dt;else car.yawRate=0;
 // Limited lateral slip makes the handbrake feel different without an unstable spin.
 const targetSlip=input.handbrake?clamp(-car.yawRate*car.speed*.25,-2.5,2.5):0;
 car.slip=(car.slip||0)+(targetSlip-(car.slip||0))*(1-Math.exp(-(input.handbrake?3:7)*dt));
 if(car.speed<.03)car.slip=0;
 car.x+=(Math.sin(car.heading)*car.speed*direction+Math.cos(car.heading)*car.slip)*dt;
 car.z+=(Math.cos(car.heading)*car.speed*direction-Math.sin(car.heading)*car.slip)*dt;
 if(!onRoad(car.x,car.z)){car.x=old.x;car.z=old.z;const impact=car.speed;car.speed=0;car.slip=0;car.yawRate=0;return impact;}
 return 0;
}
