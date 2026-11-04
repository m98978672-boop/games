import assert from 'node:assert/strict';
import {onRoad,stepCar,distance} from '../src/logic.js';
assert.equal(onRoad(0,40),true);assert.equal(onRoad(40,40),false);assert.equal(distance({x:0,z:0},{x:3,z:4}),5);
let car={x:0,z:0,heading:0,speed:0,maxSpeed:17};for(let i=0;i<100;i++)stepCar(car,{gas:true},.05);assert.ok(car.z>10);assert.ok(car.speed<=17);
car={x:9,z:40,heading:Math.PI/2,speed:10,maxSpeed:17};assert.ok(stepCar(car,{gas:true},.2)>0);assert.equal(car.speed,0);assert.equal(car.x,9);
car={x:0,z:0,heading:0,speed:10,maxSpeed:17};stepCar(car,{right:true,gas:true},.1);assert.ok(car.heading>0);
console.log('Дороги, движение, поворот и столкновение: OK');
