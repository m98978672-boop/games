import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// Locally bundled CC0 Kenney assets. Procedural placeholders remain if a model fails.
export function loadCityAssets(scene, sites, loader=new GLTFLoader()) {
  const buildingNames=['building-a','building-c','building-f'];
  const files=[...buildingNames,'tree-oak'];
  for(const name of files){
    loader.load(`assets/kenney/${name}.glb`,gltf=>{
      const source=gltf.scene;
      const bounds=new THREE.Box3().setFromObject(source), size=bounds.getSize(new THREE.Vector3());
      if(!size.x || !size.y || !size.z) return;
      if(name==='tree-oak'){
        for(const [x,z] of [[-13,25],[13,-25],[67,25],[93,-25],[-67,25],[-93,-25],[25,93],[-25,-93]]){
          const root=new THREE.Group(), mesh=source.clone();const scale=7/size.y;mesh.scale.setScalar(scale);mesh.position.set(-(bounds.min.x+size.x/2)*scale,-bounds.min.y*scale,-(bounds.min.z+size.z/2)*scale);root.add(mesh);root.position.set(x,0,z);scene.add(root);
        }
      }else{
        for(const site of sites.filter(site=>site.name===name)){
          const root=new THREE.Group(), mesh=source.clone();const scale=Math.min(22/size.x,22/size.z);mesh.scale.setScalar(scale);
          mesh.position.set(-(bounds.min.x+size.x/2)*scale,-bounds.min.y*scale,-(bounds.min.z+size.z/2)*scale);
          root.add(mesh);root.position.set(site.x,0,site.z);scene.add(root);scene.remove(site.fallback);
        }
      }
    },undefined,()=>console.warn('Модель не загружена, оставлен резервный вариант:',name));
  }
}
