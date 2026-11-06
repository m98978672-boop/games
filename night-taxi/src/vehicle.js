import * as THREE from 'three';
import {buildShowroomTaxi,animateShowroomWheels} from './showroom-adapter.js';
import {createVehicleEffects} from './vehicle-effects.js';

// One complete Garage model is used for both exterior and driver views.
export function createTaxi(color=0xc0a346, variant=0) {
  const group=new THREE.Group();
  const showroom=buildShowroomTaxi(color,variant);
  group.add(showroom.group);
  const effects=createVehicleEffects(group,showroom.unit);
  return {group,showroom,effects};
}
export function animateTaxi(model,speed,steering,gear,dt) {
  if(model.showroom.steering)model.showroom.steering.rotation.z=steering*Math.PI*1.5;
  animateShowroomWheels(model.showroom.wheels,speed,steering,gear,dt);
  // Soft body lean and pitch keep the whole Garage model together.
  if(dt>0){const blend=1-Math.exp(-4*dt),accel=(speed-(model.lastSpeed??speed))/dt;
   model.group.rotation.z+=(-steering*Math.min(speed/17,1)*.035-model.group.rotation.z)*blend;
   model.group.rotation.x+=(Math.max(-.025,Math.min(.025,accel*.002))-model.group.rotation.x)*blend;model.lastSpeed=speed;
  }
  for(const [i,needle] of model.showroom.needles.entries())if(needle)needle.rotation.z=-.95+Math.min(1,speed/(i?17:20))*2.0;
}
