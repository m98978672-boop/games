// Adapted from this repository's truck-showroom (Гараж 3D): car.js and kit.js.
// The detailed exterior is separate from the night-taxi cockpit and door.
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {buildCar} from './showroom/models/car.js';
import {createMaterials} from './showroom/lib/kit.js';

const units=[
 {id:'volga-taxi',brand:'TAXI',style:'sedan',length:4.78,width:1.84,height:1.48,wheelbase:2.82,wheelRadius:.33,wheelWidth:.23,accent:'#f0c96c'},
 {id:'crown-taxi',brand:'TAXI',style:'sedan',length:5.08,width:1.91,height:1.48,wheelbase:3.02,wheelRadius:.35,wheelWidth:.24,accent:'#d8d5c8'},
 {id:'rider-taxi',brand:'TAXI',style:'van',length:4.95,width:1.93,height:1.95,wheelbase:3.0,wheelRadius:.35,wheelWidth:.24,accent:'#d8d5c8'}
];

// Combine static meshes with matching materials while preserving the animated wheel hierarchy.
function batchStatic(root){
 root.updateMatrixWorld(true);const buckets=new Map(),remove=[];
 root.traverse(obj=>{
  if(!obj.isMesh||Array.isArray(obj.material))return;
  let ancestor=obj;while(ancestor&&ancestor!==root){if(ancestor.userData.animatedWheel)return;ancestor=ancestor.parent}
  const m=obj.material,g=obj.geometry.index?obj.geometry.toNonIndexed():obj.geometry.clone();
  g.applyMatrix4(obj.matrixWorld);
  // Reflection of the left body panel needs both faces after baking its negative scale.
  m.side=THREE.DoubleSide;
  const attrs=Object.keys(g.attributes).sort().join(',');
  const key=[m.type,m.color?.getHex(),m.emissive?.getHex(),m.emissiveIntensity,m.roughness,m.metalness,m.opacity,m.transparent,m.map?.uuid,m.bumpMap?.uuid,m.alphaMap?.uuid,attrs].join('|');
  if(!buckets.has(key))buckets.set(key,{material:m,geometries:[]});buckets.get(key).geometries.push(g);remove.push(obj);
 });
 const originalGeometries=new Set();for(const obj of remove){originalGeometries.add(obj.geometry);obj.parent.remove(obj)}
 for(const geometry of originalGeometries)geometry.dispose();
 for(const {material,geometries} of buckets.values()){
  const merged=mergeGeometries(geometries);if(merged)root.add(new THREE.Mesh(merged,material));
  else for(const geometry of geometries)root.add(new THREE.Mesh(geometry,material));
  if(merged)geometries.forEach(g=>g.dispose());
 }
}

export function buildShowroomTaxi(color,variant){
 const unit={...units[variant]||units[0],paint:'#'+new THREE.Color(color).getHexString()};
 const built=buildCar(unit,createMaterials());
 const interior=built.root.getObjectByName('interior');if(interior)built.root.remove(interior);
 const wheels=[];
 for(const wheel of built.wheels){
  // The source car points along -Z; its front axle has a negative Z coordinate.
  const pivot=new THREE.Group();pivot.position.copy(wheel.position);pivot.userData.animatedWheel=true;
  wheel.position.set(0,0,0);built.root.remove(wheel);pivot.add(wheel);built.root.add(pivot);
  wheels.push({pivot,wheel,front:pivot.position.z<0,radius:unit.wheelRadius,side:Math.sign(pivot.position.x)});
 }
 batchStatic(built.root);
 // Existing taxi physics uses +Z as forward; rotate the showroom vehicle in its wrapper.
 const wrapper=new THREE.Group();built.root.rotation.y=Math.PI;wrapper.add(built.root);
 const sign=new THREE.Mesh(new THREE.BoxGeometry(.76,.23,.36),new THREE.MeshStandardMaterial({color:0xf3d68a,emissive:0xa47729,emissiveIntensity:.65}));sign.position.set(0,unit.height+.13,0);wrapper.add(sign);
 const checkerMat=new THREE.MeshBasicMaterial({color:0x252723});
 for(let i=0;i<5;i++){const square=new THREE.Mesh(new THREE.BoxGeometry(.095,.07,.01),checkerMat);square.position.set((i-2)*.13,unit.height+.13,.185);wrapper.add(square)}
 return {group:wrapper,wheels,unit};
}

export function animateShowroomWheels(wheels,speed,steering,gear,dt){
 for(const w of wheels){w.pivot.rotation.y=w.front?steering*.35:0;w.wheel.rotation.x+=speed*gear*dt/w.radius*(w.side<0?-1:1)}
}
