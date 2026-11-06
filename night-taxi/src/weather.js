import * as THREE from 'three';
// Short instanced line segments simulate nearby rain without external assets.
export function createRain(scene,count=220){
 const positions=new Float32Array(count*6), speeds=new Float32Array(count);let seed=14129;
 const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<count;i++){const p=i*6;positions[p]=rand()*60-30;positions[p+1]=rand()*20+1;positions[p+2]=rand()*60-30;speeds[i]=12+rand()*8}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
 const mesh=new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:0x9fcbd8,transparent:true,opacity:.44,depthWrite:false}));mesh.name='rain';mesh.visible=false;mesh.frustumCulled=false;scene.add(mesh);
 function update(dt,x,z,enabled){mesh.visible=enabled;if(!enabled)return;mesh.position.set(x,0,z);for(let i=0;i<count;i++){const p=i*6;positions[p+1]-=speeds[i]*dt;if(positions[p+1]<0)positions[p+1]+=20;positions[p+3]=positions[p]-.08;positions[p+4]=positions[p+1]+.85;positions[p+5]=positions[p+2]-.12}geometry.attributes.position.needsUpdate=true}
 update(0,0,0,false);return {mesh,update,count};
}
