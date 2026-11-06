import * as THREE from 'three';

// The small crowd shares five draw calls regardless of pedestrian count.
export function createPedestrians(scene, count=36){
 const coats=[0x9d6b63,0x5e7889,0x978969,0x6a675f,0x8c6988];
 const material=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85});
 const meshes=[
  new THREE.InstancedMesh(new THREE.BoxGeometry(.48,.72,.26),material,count),
  new THREE.InstancedMesh(new THREE.SphereGeometry(.18,8,6),new THREE.MeshStandardMaterial({color:0xc59478}),count),
  new THREE.InstancedMesh(new THREE.BoxGeometry(.16,.57,.17),new THREE.MeshStandardMaterial({color:0x303a44}),count*2),
  new THREE.InstancedMesh(new THREE.BoxGeometry(.13,.58,.14),material,count*2)
 ];
 for(const m of meshes){m.frustumCulled=false;scene.add(m)}
 const people=Array.from({length:count},(_,i)=>({road:((i%7)-3)*80,side:i%2?1:-1,offset:((i*97)%650)-325,axis:Math.floor(i/2)%2,dir:Math.floor(i/4)%2?1:-1,speed:.7+(i%4)*.13,phase:i*1.7}));
 const object=new THREE.Object3D();
 const set=(mesh,index,x,y,z,ry,rx=0)=>{object.position.set(x,y,z);object.rotation.set(rx,ry,0);object.updateMatrix();mesh.setMatrixAt(index,object.matrix)};
 for(let i=0;i<count;i++){const c=new THREE.Color(coats[i%coats.length]);meshes[0].setColorAt(i,c);meshes[3].setColorAt(i*2,c);meshes[3].setColorAt(i*2+1,c)}
 function update(time,reducedMotion=false){
  for(let i=0;i<count;i++){
   const p=people[i], travel=(((p.offset+p.dir*p.speed*time+390)%780)+780)%780-390;
   const x=p.axis?travel:p.road+p.side*12.7,z=p.axis?p.road+p.side*12.7:travel;
   const angle=p.axis?(p.dir>0?Math.PI/2:-Math.PI/2):(p.dir>0?0:Math.PI), stride=reducedMotion?0:Math.sin(time*5+p.phase)*.35;
   set(meshes[0],i,x,1.04,z,angle);set(meshes[1],i,x,1.65,z,angle);
   for(let side=0;side<2;side++){
    const sign=side?1:-1, ox=Math.cos(angle)*sign, oz=-Math.sin(angle)*sign;
    set(meshes[2],i*2+side,x+ox*.12,.32,z+oz*.12,angle,sign*stride);
    set(meshes[3],i*2+side,x+ox*.31,1.06,z+oz*.31,angle,-sign*stride);
   }
  }
  for(const m of meshes){m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true}
 }
 update(0);return {meshes,people,update};
}
