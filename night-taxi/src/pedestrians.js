import * as THREE from 'three';

// Instancing keeps a varied, articulated crowd inexpensive to render.
export function createPedestrians(scene,count=36){
 const coats=[0x98605d,0x4d7188,0x9b825c,0x596e63,0x806485,0x9c8a78];
 const skins=[0xd9a483,0xb98368,0x92664f,0xe0b89a];
 const hairs=[0x302925,0x5c4030,0x202427,0x79614a];
 const pants=[0x293b49,0x3b3b43,0x594b43,0x29343a];
 const instance=(geo,color,n=count)=>{const m=new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({color,roughness:.84}),n);m.frustumCulled=false;scene.add(m);return m};
 const meshes=[
  instance(new THREE.CylinderGeometry(.23,.19,.62,8),0xffffff), // jacket
  instance(new THREE.SphereGeometry(.16,12,8),0xffffff), // head
  instance(new THREE.SphereGeometry(.165,12,8,0,Math.PI*2,0,Math.PI*.51),0xffffff), // hair cap
  instance(new THREE.CylinderGeometry(.075,.075,.12,8),0xffffff), // neck
  instance(new THREE.CylinderGeometry(.10,.08,.48,8),0xffffff,count*2), // legs
  instance(new THREE.CapsuleGeometry(.065,.28,4,8),0xffffff,count*2), // sleeves
  instance(new THREE.SphereGeometry(.07,8,6),0xffffff,count*2), // hands
  instance(new THREE.BoxGeometry(.16,.10,.25),0x24262a,count*2), // shoes
  instance(new THREE.BoxGeometry(.10,.14,.025),0xd2c2a1), // shirt/scarf
  instance(new THREE.SphereGeometry(.045,8,6),0xffffff) // nose
 ];
 const people=Array.from({length:count},(_,i)=>({road:((i%7)-3)*80,side:i%2?1:-1,offset:((i*97)%650)-325,axis:Math.floor(i/2)%2,dir:Math.floor(i/4)%2?1:-1,speed:.7+(i%4)*.13,phase:i*1.7,height:.91+(i%5)*.04}));
 for(let i=0;i<count;i++){
  const color=(n,idx,value)=>meshes[n].setColorAt(idx,new THREE.Color(value));
  color(0,i,coats[i%coats.length]);color(1,i,skins[i%skins.length]);color(2,i,hairs[i%hairs.length]);color(3,i,skins[i%skins.length]);color(9,i,skins[i%skins.length]);
  for(let side=0;side<2;side++){const k=i*2+side;color(4,k,pants[i%pants.length]);color(5,k,coats[i%coats.length]);color(6,k,skins[i%skins.length])}
 }
 const object=new THREE.Object3D(),position=new THREE.Vector3(),yaw=new THREE.Quaternion(),swingRotation=new THREE.Quaternion(),axisX=new THREE.Vector3(1,0,0);
 function set(mesh,index,x,z,angle,lx,ly,lz,rx,scale){
  yaw.setFromAxisAngle(THREE.Object3D.DEFAULT_UP,angle);position.set(lx*scale,ly*scale,lz*scale).applyQuaternion(yaw);
  object.position.set(x+position.x,position.y,z+position.z);swingRotation.setFromAxisAngle(axisX,rx||0);object.quaternion.copy(yaw).multiply(swingRotation);object.scale.setScalar(scale);object.updateMatrix();mesh.setMatrixAt(index,object.matrix);
 }
 function update(time,reducedMotion=false){
  for(let i=0;i<count;i++){
   const p=people[i],travel=(((p.offset+p.dir*p.speed*time+390)%780)+780)%780-390;
   const x=p.axis?travel:p.road+p.side*12.7,z=p.axis?p.road+p.side*12.7:travel;
   const angle=p.axis?(p.dir>0?Math.PI/2:-Math.PI/2):(p.dir>0?0:Math.PI),stride=reducedMotion?0:Math.sin(time*5+p.phase)*.48,bob=reducedMotion?0:Math.abs(Math.sin(time*5+p.phase))*.025, h=p.height;
   set(meshes[0],i,x,z,angle,0,1.15+bob,0,0,h);set(meshes[1],i,x,z,angle,0,1.69+bob,0,0,h);
   set(meshes[2],i,x,z,angle,0,1.72+bob,-.025,0,h);set(meshes[3],i,x,z,angle,0,1.51+bob,0,0,h);
   set(meshes[8],i,x,z,angle,0,1.27+bob,.20,0,h);set(meshes[9],i,x,z,angle,0,1.69+bob,.15,0,h);
   for(let side=0;side<2;side++){
    const sign=side?1:-1,k=i*2+side,leg=sign*stride,arm=-sign*stride*.8;
    set(meshes[4],k,x,z,angle,sign*.11,.49+bob,-Math.sin(leg)*.22,leg,h);
    set(meshes[5],k,x,z,angle,sign*.28,1.14+bob,-Math.sin(arm)*.21,arm,h);
    set(meshes[6],k,x,z,angle,sign*.28,.91+bob,-Math.sin(arm)*.43,0,h);
    set(meshes[7],k,x,z,angle,sign*.11,.09+bob,-Math.sin(leg)*.40+.05,0,h);
   }
  }
  for(const m of meshes)m.instanceMatrix.needsUpdate=true;
 }
 update(0);return {meshes,people,update};
}

// A distinct passenger waits at the pickup marker, with a small bag and idle wave.
export function createPassenger(){
 const root=new THREE.Group(), coat=new THREE.MeshStandardMaterial({color:0x6b5265,roughness:.85}), trousers=new THREE.MeshStandardMaterial({color:0x303946}),skin=new THREE.MeshStandardMaterial({color:0xc89476}),hair=new THREE.MeshStandardMaterial({color:0x3b2a29}),shoe=new THREE.MeshStandardMaterial({color:0x20292c}),bag=new THREE.MeshStandardMaterial({color:0x9b724d});
 const add=(parent,geometry,material,x,y,z)=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);parent.add(mesh);return mesh};
 add(root,new THREE.CylinderGeometry(.22,.19,.65,10),coat,0,1.14,0);
 add(root,new THREE.SphereGeometry(.16,12,8),skin,0,1.68,0);
 add(root,new THREE.SphereGeometry(.165,12,8,0,Math.PI*2,0,Math.PI*.54),hair,0,1.72,-.025);
 add(root,new THREE.SphereGeometry(.045,8,6),skin,0,1.68,.15);
 add(root,new THREE.CylinderGeometry(.075,.075,.12,8),skin,0,1.5,0);
 for(const side of [-1,1]){
  add(root,new THREE.CylinderGeometry(.1,.08,.52,8),trousers,side*.11,.48,0);
  add(root,new THREE.BoxGeometry(.16,.1,.25),shoe,side*.11,.1,.05);
  const arm=new THREE.Group();arm.position.set(side*.28,1.37,0);root.add(arm);
  add(arm,new THREE.CapsuleGeometry(.065,.29,4,8),coat,0,-.23,0);
  add(arm,new THREE.SphereGeometry(.07,8,6),skin,0,-.46,0);
  if(side===1){add(arm,new THREE.BoxGeometry(.26,.3,.13),bag,.04,-.65,0);root.userData.waveArm=arm}
 }
 return root;
}
