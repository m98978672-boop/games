import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {loadCityAssets} from '../src/city-assets.js';
for(const name of ['building-a','building-c','building-f','tree-oak']){
 const b=readFileSync(`assets/kenney/${name}.glb`);assert.equal(b.subarray(0,4).toString(),'glTF');assert.equal(b.readUInt32LE(8),b.length);
 const json=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString().trim());
 assert.ok((json.images||[]).every(x=>x.bufferView!==undefined),'images embedded');
 assert.ok((json.buffers||[]).every(x=>!x.uri),'buffers embedded');
}
const scene=new THREE.Scene(),fallback=new THREE.Group();scene.add(fallback);const site={name:'building-a',x:3,z:5,fallback};const calls=[];
const loader={load(url,success,progress,error){calls.push(url);if(url.includes('building-a')){const group=new THREE.Group();group.add(new THREE.Mesh(new THREE.BoxGeometry(2,3,2),new THREE.MeshBasicMaterial()));success({scene:group})}else error()}};
const warn=console.warn;console.warn=()=>{};try{loadCityAssets(scene,[site],loader)}finally{console.warn=warn}assert.equal(calls.length,4);assert.ok(!scene.children.includes(fallback),'replace fallback only after load succeeds');assert.equal(scene.children.length,1);
console.log('Локальные модели, встроенные текстуры и резервный вариант: OK');
const {districtIndex,buildingTemplate}=await import('../src/city-templates.js');
assert.equal(districtIndex(-300,-200),0);assert.equal(districtIndex(300,200),7);assert.equal(districtIndex(999,999),7);
const styles=new Set();for(let z of [-200,200])for(let x of [-300,-100,100,300]){const t=buildingTemplate(x,z,3);styles.add(t.style);assert.ok(t.height>=8&&t.height<=50)}
assert.equal(styles.size,8);console.log('Шаблоны всех восьми зон: OK');
