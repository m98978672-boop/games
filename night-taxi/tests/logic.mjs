import assert from 'node:assert/strict';
import {onRoad,stepCar,distance} from '../src/logic.js';
assert.equal(onRoad(0,40),true);assert.equal(onRoad(40,40),false);assert.equal(distance({x:0,z:0},{x:3,z:4}),5);
let car={x:0,z:0,heading:0,speed:0,maxSpeed:17};for(let i=0;i<100;i++)stepCar(car,{gas:true},.05);assert.ok(car.z>10);assert.ok(car.speed<=17);
car={x:9,z:40,heading:Math.PI/2,speed:10,maxSpeed:17};assert.ok(stepCar(car,{gas:true},.2)>0);assert.equal(car.speed,0);assert.equal(car.x,9);
car={x:0,z:0,heading:0,speed:10,maxSpeed:17};stepCar(car,{right:true,gas:true},.1);assert.ok(car.heading<0);
car={x:0,z:0,heading:0,speed:0,gear:-1,maxSpeed:17};for(let i=0;i<40;i++)stepCar(car,{gas:true},.05);assert.ok(car.z<0,'reverse drives backwards');
car={x:0,z:0,heading:0,speed:5,gear:-1,maxSpeed:17};stepCar(car,{right:true,gas:true},.1);assert.ok(car.heading>0,'reverse steering is inverted');
console.log('Дороги, движение, поворот и столкновение: OK');
const {createTaxi,animateTaxi}=await import('../src/vehicle.js');
for(let i=0;i<3;i++){
 const model=createTaxi(0xc0a346,i);
 assert.equal(model.showroom.unit.style,i===2?'van':'sedan');
 let meshes=0;model.showroom.group.traverse(o=>{if(o.isMesh)meshes++});assert.ok(meshes<140,'showroom model is batched');
 assert.equal(model.showroom.wheels.length,4);assert.equal(model.showroom.wheels.filter(w=>w.front).length,2);
 assert.equal(model.showroom.interior.parent.name,`car:${model.showroom.unit.id}`,'original interior remains attached to the complete car');
 assert.ok(model.group.getObjectByName('interior'),'garage interior exists with the exterior');
 animateTaxi(model,10,1,1,.1,2,true);
 assert.ok(model.showroom.steering.rotation.z>0);assert.notEqual(model.showroom.wheels[0].wheel.rotation.x,0);
 assert.ok(model.showroom.wheels.find(w=>w.front).pivot.rotation.y>0);
 assert.equal(model.showroom.driverView.id,'driver');
}
console.log('Модели, приборы и анимация автомобиля: OK');
const {createTrafficGeometry}=await import('../src/traffic-model.js');
const traffic=createTrafficGeometry('#6a767c');
assert.ok(traffic.getAttribute('position').count>100);assert.equal(traffic.getAttribute('position').count,traffic.getAttribute('color').count);
console.log('Объединённая модель транспорта из подхода «Трассы»: OK');

const THREE=await import('three');
const {createPedestrians}=await import('../src/pedestrians.js');
const pedestrianScene=new THREE.Scene(), crowd=createPedestrians(pedestrianScene,36);
assert.equal(crowd.people.length,36);assert.equal(crowd.meshes.length,4);
const before=new THREE.Matrix4(),after=new THREE.Matrix4();crowd.meshes[0].getMatrixAt(0,before);crowd.update(3);crowd.meshes[0].getMatrixAt(0,after);assert.notDeepEqual(before.elements,after.elements,'pedestrians walk');
console.log('Пешеходы: инстансинг и движение: OK');
