import assert from 'node:assert/strict';
import * as THREE from 'three';
import { ShellField } from '../src/shells.js';
import { detectDevice } from '../src/device.js';

const field = new ShellField(new THREE.Scene());
field.add('den', [{x:-1,z:-1}, {x:1,z:-1}, {x:1,z:1}, {x:-1,z:1}], 0, 2);
for (const [x, z] of [[0,0], [0.5,0], [1,0]]) {
  const p = new THREE.Vector3(x, 0, z);
  assert.equal(field.resolve(p, 0.4, null, 0), 1);
  assert.equal(field.blocked(p.x, p.z, 0.399, 0), false, 'после разрешения точка вне контура');
}
assert.equal(detectDevice({userAgent:'Android Mobile',maxTouchPoints:5,deviceMemory:8,hardwareConcurrency:8}, {matchMedia:()=>({matches:true})}).low, true);
assert.equal(detectDevice({userAgent:'Desktop',maxTouchPoints:0,deviceMemory:16,hardwareConcurrency:8}, {matchMedia:()=>({matches:false})}).low, false);
assert.equal(detectDevice({userAgent:'Desktop',maxTouchPoints:0,deviceMemory:2,hardwareConcurrency:2}, {matchMedia:()=>({matches:false})}).low, true);
console.log('SECTORS + DEVICE OK');
