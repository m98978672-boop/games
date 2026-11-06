import * as THREE from 'three';
import {buildShowroomTaxi,animateShowroomWheels} from './showroom-adapter.js';

// One complete Garage model is used for both exterior and driver views.
export function createTaxi(color=0xc0a346, variant=0) {
  const group=new THREE.Group();
  const showroom=buildShowroomTaxi(color,variant);
  group.add(showroom.group);
  return {group,showroom};
}
export function animateTaxi(model,speed,steering,gear,dt) {
  if(model.showroom.steering)model.showroom.steering.rotation.z=steering*.7;
  animateShowroomWheels(model.showroom.wheels,speed,steering,gear,dt);
}
