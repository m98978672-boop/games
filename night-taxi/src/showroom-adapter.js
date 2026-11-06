// Adapted from this repository's truck-showroom (Гараж 3D): car.js and kit.js.
// Preserve the complete Garage car, including body, windows and interior.
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {buildCar} from './showroom/models/car.js';
import {createMaterials} from './showroom/lib/kit.js';

const units=[
 {id:'volga-taxi',brand:'TAXI',style:'sedan',length:4.78,width:1.84,height:1.48,wheelbase:2.82,wheelRadius:.33,wheelWidth:.23,seats:5,accent:'#f0c96c'},
 {id:'crown-taxi',brand:'TAXI',style:'sedan',length:5.08,width:1.91,height:1.48,wheelbase:3.02,wheelRadius:.35,wheelWidth:.24,seats:5,accent:'#d8d5c8'},
 {id:'rider-taxi',brand:'TAXI',style:'van',length:4.95,width:1.93,height:1.95,wheelbase:3.0,wheelRadius:.35,wheelWidth:.24,seats:7,accent:'#d8d5c8'}
];

// Combine static meshes with matching materials while preserving the animated wheel hierarchy.
function batchStatic(root){
 root.updateMatrixWorld(true);const buckets=new Map(),remove=[];
 root.traverse(obj=>{
  if(!obj.isMesh||Array.isArray(obj.material))return;
  let ancestor=obj;while(ancestor&&ancestor!==root){if(ancestor.userData.animatedWheel||!ancestor.visible||ancestor.name==='interior'||ancestor.name==='steering'||ancestor.name.startsWith('gaugeNeedle'))return;ancestor=ancestor.parent}
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
 // Subtle illumination keeps paint visible in the night scene without realtime shadows.
 for(const paint of built.paintMats){if(paint.emissive){paint.emissive.set(paint.color);paint.emissiveIntensity=.055}}
 const interior=built.root.getObjectByName('interior');
 const driverView=built.views.find(view=>view.id==='driver');
 if(interior){
  const adjusted=new Set();interior.traverse(o=>{if(!o.isMesh)return;for(const m of (Array.isArray(o.material)?o.material:[o.material])){if(!m||!m.color||adjusted.has(m))continue;adjusted.add(m);const hsl={};m.color.getHSL(hsl);if(hsl.l<.16)m.color.lerp(new THREE.Color(0x8f9994),.20)}});
  const cabinLight=new THREE.PointLight(0xffdeb0,2,3.8,2);cabinLight.position.set(0,1.3,0);interior.add(cabinLight);
 }
 const wheels=[];
 for(const wheel of built.wheels){
  // The source car points along -Z; its front axle has a negative Z coordinate.
  const pivot=new THREE.Group();pivot.position.copy(wheel.position);pivot.userData.animatedWheel=true;
  const spin=new THREE.Group();wheel.position.set(0,0,0);built.root.remove(wheel);spin.add(wheel);pivot.add(spin);built.root.add(pivot);
  wheels.push({pivot,spin,wheel,front:pivot.position.z<0,radius:unit.wheelRadius,side:Math.sign(pivot.position.x)});
 }
 if(interior)batchStatic(interior);
 batchStatic(built.root);
 // Existing taxi physics uses +Z as forward; rotate the showroom vehicle in its wrapper.
 const wrapper=new THREE.Group();built.root.rotation.y=Math.PI;wrapper.add(built.root);
 const sign=new THREE.Mesh(new THREE.BoxGeometry(.76,.23,.36),new THREE.MeshStandardMaterial({color:0xf3d68a,emissive:0xa47729,emissiveIntensity:.65}));sign.position.set(0,unit.height+.13,0);wrapper.add(sign);
 const checkerMat=new THREE.MeshBasicMaterial({color:0x252723});
 for(let i=0;i<5;i++){const square=new THREE.Mesh(new THREE.BoxGeometry(.095,.07,.01),checkerMat);square.position.set((i-2)*.13,unit.height+.13,.185);wrapper.add(square)}
 for(const side of [-1,1])for(let i=0;i<7;i++){const square=new THREE.Mesh(new THREE.BoxGeometry(.018,.10,.10),checkerMat);square.position.set(side*(unit.width/2+.025),.77,(i-3)*.10);wrapper.add(square)}
 return {group:wrapper,wheels,unit,interior,driverView,rearSeat:built.anchors.find(a=>a.label==='Задний ряд')?.pos||[0,0,1],steering:interior?.getObjectByName('steering'),needles:[0,1].map(i=>interior?.getObjectByName('gaugeNeedle'+i))};
}

export function animateShowroomWheels(wheels,speed,steering,gear,dt){
 for(const w of wheels){
  // Garage faces -Z; the adapter rotates it 180 degrees. Wheels on the
  // opposite side are mirrored; spin the shared axle parent in the same direction.
  const turn=.68/(1+speed*.055)*steering;
  w.pivot.rotation.y=w.front?-turn*(1-w.side*steering*.08):0;
  w.spin.rotation.x-=speed*(gear===-1?-1:1)*dt/w.radius;
 }
}
