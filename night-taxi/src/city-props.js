import * as THREE from 'three';
import {mergedBoxes} from './traffic-model.js';

// 20 distinct low-poly street furniture designs, each with 12 colour/size
// variations. Geometry and materials are shared through instancing.
const part=(x,y,z,w,h,d,color='#d6d8d3')=>({x,y,z,w,h,d,color});
const P=part;
export const PROP_DESIGNS=[
 ['урна',[P(0,.5,0,.48,.9,.48),P(0,.98,0,.55,.12,.55,'#30383a')]],
 ['гидрант',[P(0,.46,0,.32,.82,.32),P(0,.88,0,.42,.15,.42),P(0,.55,0,.6,.16,.18)]],
 ['почтовый ящик',[P(0,.54,0,.55,.9,.45),P(0,1.02,0,.58,.15,.48),P(0,.75,.24,.32,.035,.02,'#202a30')]],
 ['цветочная клумба',[P(0,.27,0,.95,.5,.65),P(0,.65,0,.7,.4,.45,'#44744d')]],
 ['дорожная тумба',[P(0,.48,0,.19,.95,.19),P(0,.88,0,.22,.14,.22,'#e8cc7f')]],
 ['электрощит',[P(0,.65,0,.7,1.2,.4),P(0,.9,.21,.32,.24,.03,'#303b3d')]],
 ['парковочный автомат',[P(0,.55,0,.25,1.1,.25),P(0,1.15,0,.52,.5,.36),P(0,1.2,.19,.3,.17,.02,'#97c4c9')]],
 ['рекламная стойка',[P(0,.65,0,.65,1.3,.16),P(0,.73,.09,.51,.85,.02,'#e4bd68'),P(0,.2,0,.8,.08,.5)]],
 ['ограждение',[P(-.65,.5,0,.12,1,.12),P(.65,.5,0,.12,1,.12),P(0,.73,0,1.3,.1,.1),P(0,.38,0,1.3,.1,.1)]],
 ['конус',[P(0,.06,0,.55,.1,.55),P(0,.38,0,.3,.6,.3),P(0,.42,0,.32,.1,.32,'#f0e5bf')]],
 ['дорожный знак',[P(0,1.12,0,.10,2.24,.10),P(0,2.1,0,.65,.65,.08),P(0,2.1,.05,.4,.35,.02,'#dfd5bc')]],
 ['ящик доставки',[P(0,.31,0,.8,.6,.6),P(0,.31,.31,.74,.05,.03,'#65513e'),P(0,.31,-.31,.74,.05,.03,'#65513e')]],
 ['пакеты',[P(-.24,.23,0,.45,.45,.4),P(.24,.3,0,.48,.6,.42),P(0,.08,0,1,.12,.5,'#454b42')]],
 ['скамья',[P(0,.49,0,1.4,.12,.42),P(0,.88,-.18,1.4,.55,.1),P(-.55,.24,0,.1,.48,.3,'#424b49'),P(.55,.24,0,.1,.48,.3,'#424b49')]],
 ['стойка для велосипеда',[P(-.55,.43,0,.12,.86,.12),P(.55,.43,0,.12,.86,.12),P(0,.84,0,1.2,.12,.12),P(0,.36,0,1.2,.1,.1)]],
 ['ящик для песка',[P(0,.34,0,1.05,.65,.7),P(0,.7,0,1.1,.12,.75,'#d1a85e')]],
 ['торговый автомат',[P(0,.85,0,.8,1.7,.55),P(0,1.05,.29,.58,.73,.03,'#8bb5b7'),P(.25,.4,.29,.16,.22,.03,'#394344')]],
 ['табло остановки',[P(0,1.3,0,.12,2.6,.12),P(0,2.35,0,.8,.5,.1),P(0,2.35,.06,.6,.3,.02,'#d3decf')]],
 ['парковочный столбик',[P(0,.6,0,.26,1.2,.26),P(0,.95,0,.28,.17,.28,'#f0d18a'),P(0,.08,0,.42,.16,.42,'#424747')]],
 ['уличный фонарь',[P(0,1.55,0,.13,3.1,.13),P(0,3.13,0,.45,.18,.45),P(0,3,0,.29,.16,.29,'#f7d799')]]
];
export const PROP_VARIANTS=12;
export function addCityProps(scene){
 const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.82});
 const palettes=[0xffffff,0xc7d4dc,0xe5c6b4,0xbad5c0,0xd5b9c8,0xd4d0b3,0xbcc5d8,0xe7d8bd,0xb0c8be,0xcdbdb7,0xc6b8d0,0xd6c2a1];
 const temp=new THREE.Object3D(),meshes=[];
 for(let k=0;k<PROP_DESIGNS.length;k++){
  const [name,parts]=PROP_DESIGNS[k], mesh=new THREE.InstancedMesh(mergedBoxes(parts),material,PROP_VARIANTS);mesh.name='street:'+name;
  for(let j=0;j<PROP_VARIANTS;j++){
   const index=k*PROP_VARIANTS+j,col=index%9,row=Math.floor(index/9)%8,slot=Math.floor(index/72),side=slot%2?1:-1;
   const x=(col-4)*80+side*12.7,z=(row-4)*80+(slot<2?35:45);
   temp.position.set(x,0,z);temp.rotation.y=side<0?Math.PI:0;temp.scale.setScalar(.87+(j%4)*.08);temp.updateMatrix();mesh.setMatrixAt(j,temp.matrix);mesh.setColorAt(j,new THREE.Color(palettes[j]));
  }
  mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;scene.add(mesh);meshes.push(mesh);
 }
 return meshes;
}
