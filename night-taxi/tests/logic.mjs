import assert from 'node:assert/strict';
import {onRoad,stepCar,distance} from '../src/logic.js';
assert.equal(onRoad(0,40),true);assert.equal(onRoad(40,40),false);assert.equal(distance({x:0,z:0},{x:3,z:4}),5);
let car={x:0,z:0,heading:0,speed:0,maxSpeed:17};for(let i=0;i<100;i++)stepCar(car,{gas:true},.05);assert.ok(car.z>10);assert.ok(car.speed<=17);
car={x:9,z:40,heading:Math.PI/2,speed:10,maxSpeed:17};assert.ok(stepCar(car,{gas:true},.2)>0);assert.equal(car.speed,0);assert.equal(car.x,9);
car={x:0,z:0,heading:0,speed:10,maxSpeed:17};stepCar(car,{right:true,gas:true},.1);assert.ok(car.heading<0);
car={x:0,z:0,heading:0,speed:0,gear:-1,maxSpeed:17};for(let i=0;i<40;i++)stepCar(car,{gas:true},.05);assert.ok(car.z<0,'reverse drives backwards');
car={x:0,z:0,heading:0,speed:5,gear:-1,maxSpeed:17};stepCar(car,{right:true,gas:true},.1);assert.ok(car.heading>0,'reverse steering is inverted');
car={x:0,z:0,heading:0,speed:0,maxSpeed:17};stepCar(car,{right:true},.1);assert.equal(car.heading,0,'steering cannot turn a stopped vehicle');assert.ok(car.steering>0&&car.steering<1,'steering is progressive');
car={x:0,z:0,heading:0,speed:10,maxSpeed:17};stepCar(car,{brake:true},.1);assert.ok(Math.abs(car.speed-8.86)<1e-9,'brake deceleration applied once');
car={x:0,z:0,heading:0,speed:8,maxSpeed:17,steering:1};stepCar(car,{},.2);assert.ok(car.steering<1,'wheel recentres');
car={x:0,z:0,heading:0,speed:0,maxSpeed:17,gear:-1};for(let i=0;i<80;i++)stepCar(car,{gas:true},.05);assert.ok(car.speed<=17*.48,'reverse speed is limited');
car={x:0,z:0,heading:0,speed:12,maxSpeed:17,steering:1};stepCar(car,{right:true,handbrake:true},.1);assert.ok(Math.abs(car.slip)>0&&Math.abs(car.slip)<=2.5,'handbrake induces bounded lateral slip');
console.log('Дороги, движение, поворот и столкновение: OK');
const {createTaxi,animateTaxi}=await import('../src/vehicle.js');
for(let i=0;i<3;i++){
 const model=createTaxi(0xc0a346,i);
 assert.equal(model.showroom.unit.style,i===2?'van':'sedan');
 let meshes=0;model.showroom.group.traverse(o=>{if(!o.isMesh)return;let p=o;while(p&&p.visible)p=p.parent;if(!p)meshes++});assert.ok(meshes<140,'visible showroom model is batched');assert.equal(model.showroom.group.getObjectByName('damage').visible,false,'Garage damage decals stay hidden until explicitly used');
 assert.equal(model.showroom.wheels.length,4);assert.equal(model.showroom.wheels.filter(w=>w.front).length,2);
 assert.equal(model.showroom.interior.parent.name,`car:${model.showroom.unit.id}`,'original interior remains attached to the complete car');
 assert.ok(model.group.getObjectByName('interior'),'garage interior exists with the exterior');
 animateTaxi(model,10,1,1,.1,2,true);
 assert.ok(Math.abs(model.showroom.steering.rotation.z-Math.PI*1.5)<1e-9,'steering wheel turns through 270 degrees');assert.notEqual(model.showroom.wheels[0].spin.rotation.x,0);
 assert.ok(model.showroom.wheels.find(w=>w.front).pivot.rotation.y<0);
 assert.equal(model.showroom.driverView.id,'driver');assert.ok(model.showroom.rearSeat[2]>0,'Garage model has a back seat');
 assert.ok(model.showroom.needles.every(Boolean),'animated needles exist');
 const [left,right]=model.showroom.wheels;assert.equal(left.spin.rotation.x,right.spin.rotation.x,'both axles rotate the same way despite mirrored wheels');
 const spin=left.spin.rotation.x;animateTaxi(model,10,0,-1,.1);assert.ok(left.spin.rotation.x>spin,'reverse rotates wheels backwards');
 const stopped=left.spin.rotation.x;animateTaxi(model,0,0,1,.1);assert.equal(left.spin.rotation.x,stopped,'stationary wheels do not spin');
}
console.log('Модели, приборы и анимация автомобиля: OK');
const {createTrafficGeometry}=await import('../src/traffic-model.js');
const traffic=createTrafficGeometry('#6a767c');
assert.ok(traffic.getAttribute('position').count>100);assert.equal(traffic.getAttribute('position').count,traffic.getAttribute('color').count);
console.log('Объединённая модель транспорта из подхода «Трассы»: OK');

const THREE=await import('three');
const {createPedestrians}=await import('../src/pedestrians.js');
const pedestrianScene=new THREE.Scene(), crowd=createPedestrians(pedestrianScene,36);
assert.equal(crowd.people.length,36);assert.equal(crowd.meshes.length,10);
const before=new THREE.Matrix4(),after=new THREE.Matrix4();crowd.meshes[0].getMatrixAt(0,before);crowd.update(3);crowd.meshes[0].getMatrixAt(0,after);assert.notDeepEqual(before.elements,after.elements,'pedestrians walk');
console.log('Пешеходы: инстансинг и движение: OK');

const {curbLocation,makeBoarding,boardingPose}=await import('../src/trips.js');
for(const x of [-320,0,320])for(const z of [-320,0,320]){
 const curb=curbLocation({x,z});assert.ok(onRoad(curb.stop.x,curb.stop.z),'taxi can reach stopping point');assert.ok(!onRoad(curb.wait.x,curb.wait.z),'passenger waits outside the road');
 const seq=makeBoarding(curb.wait,{...curb.stop,heading:0},1.84);const start=boardingPose(seq,0);assert.equal(start.x,curb.wait.x);const walking=boardingPose(seq,1);assert.ok(walking.x<start.x,'passenger walks toward the car');const paused=boardingPose(seq,0);assert.equal(paused.x,walking.x,'boarding is frozen while paused');const finish=boardingPose(seq,5);assert.ok(finish.done&&finish.sit===1);assert.ok(Math.abs(finish.x-curb.stop.x)<1,'passenger reaches inside the car');
}
const {createPassenger,posePassenger}=await import('../src/pedestrians.js');const person=createPassenger();posePassenger(person,.4,.5);assert.notEqual(person.userData.legs[0].rotation.x,person.userData.legs[1].rotation.x);assert.ok(person.scale.y<1);
console.log('Посадка у обочины и анимация пассажира: OK');
