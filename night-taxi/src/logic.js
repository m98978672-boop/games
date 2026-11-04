export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
// Roads run on an 80-metre grid. The car is 1 unit = 1 metre.
export function onRoad(x,z){return Math.min(Math.abs(x-Math.round(x/80)*80),Math.abs(z-Math.round(z/80)*80))<10;}
export function stepCar(car,input,dt){
 const old={x:car.x,z:car.z};
 const acceleration=input.gas?7:0, braking=input.brake?13:input.handbrake?18:1.5;
 car.speed=clamp(car.speed+(acceleration-(input.gas?0:braking))*dt,0,car.maxSpeed);
 if(input.brake||input.handbrake)car.speed=Math.max(0,car.speed-braking*dt);
 const steer=(input.right?1:0)-(input.left?1:0);
 car.heading+=steer*dt*clamp(car.speed/8,0,1)*(input.handbrake?1.8:0.8);
 car.x+=Math.sin(car.heading)*car.speed*dt;car.z+=Math.cos(car.heading)*car.speed*dt;
 if(!onRoad(car.x,car.z)){car.x=old.x;car.z=old.z;const impact=car.speed;car.speed=0;return impact;}
 return 0;
}
