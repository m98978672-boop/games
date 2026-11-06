import * as THREE from 'three';
import {carShape} from './showroom/models/car.js';
// Mesh-based headlight pools and animated indicator bulbs. No shadow maps.
export function createVehicleEffects(group,unit){
 const root=new THREE.Group();root.name='vehicleEffects';group.add(root);
 const poolMat=new THREE.MeshBasicMaterial({color:0xffdf9e,transparent:true,opacity:.17,depthWrite:false,side:THREE.DoubleSide});
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute([-.5,.09,unit.length/2, .5,.09,unit.length/2, -5,.09,unit.length/2+25, .5,.09,unit.length/2, 5,.09,unit.length/2+25, -5,.09,unit.length/2+25],3));
 const beam=new THREE.Mesh(geometry,poolMat);beam.name='headlightBeam';root.add(beam);
 const lamps=[];for(const side of [-1,1])for(const z of [-unit.length/2-.02,unit.length/2+.02]){
  const m=new THREE.Mesh(new THREE.BoxGeometry(.17,.12,.06),new THREE.MeshBasicMaterial({color:0x4e3210}));m.position.set(side*(unit.width/2-.12),.66,z);root.add(m);lamps.push({mesh:m,side});
 }
 // Two wipers follow the original Garage windshield geometry and sweep in rain.
 const shape=carShape(unit),wipers=[];
 for(const side of [-1,1]){
  const mount=new THREE.Group();mount.position.set(side*unit.width*.20,shape.hoodY+.065,-shape.wsBase+.035);
  mount.rotation.x=Math.atan2(shape.wsBase-shape.wsTopZ,unit.height-shape.hoodY);root.add(mount);
  const pivot=new THREE.Group();mount.add(pivot);
  const blade=new THREE.Mesh(new THREE.BoxGeometry(.028,.43,.025),new THREE.MeshStandardMaterial({color:0x1a1f20,roughness:.7}));blade.position.y=.205;pivot.add(blade);wipers.push({pivot,side});
 }
 function update(lights,indicator,elapsed,raining=false,reducedMotion=false){beam.visible=lights;
  for(const w of wipers)w.pivot.rotation.z=w.side*(raining&&!reducedMotion?.55+.45*Math.sin(elapsed*3):1.0);const blink=Math.floor(elapsed*2)%2===0;for(const l of lamps){const active=blink&&((indicator==='left'&&l.side===1)||(indicator==='right'&&l.side===-1)||indicator==='hazard');l.mesh.material.color.setHex(active?0xffa729:0x4e3210)}}
 update(true,'off',0);return {root,beam,lamps,wipers,update};
}
