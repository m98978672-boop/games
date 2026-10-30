import assert from 'node:assert/strict';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { meshSections } from '../src/mesh-sections.js';
import { ShellField } from '../src/shells.js';
// Two disconnected solids in one mesh: space between them must remain open.
const a = new THREE.BoxGeometry(1, 2, 1).translate(-2, 1, 0);
const b = new THREE.BoxGeometry(1, 2, 1).translate(2, 1, 0);
const sections = meshSections([mergeGeometries([a,b])], { bandHeight: .5 });
assert.equal(sections.length,8);
const field = new ShellField(new THREE.Scene());
let active=true;
for (const s of sections) field.add('rock',s.poly,s.minY,s.maxY,{enabled:()=>active});
assert.equal(field.blocked(0,0,.1,0),false,'gap not filled by one convex hull');
assert.equal(field.blocked(-2,0,.1,0),true);
assert.equal(field.blocked(2,0,.1,0),true);
active=false; assert.equal(field.blocked(-2,0,.1,0),false,'disabled follows model');
// A sloping cone has faces crossing the belt even when no original vertex
// lies at that height. Its upper cross section must be narrower than its base.
const cone = new THREE.ConeGeometry(2,4,16).translate(0,2,0);
const slices=meshSections([cone],{bandHeight:1});
assert.equal(slices.length,4);
const width = s => Math.max(...s.poly.map(p=>p.x))-Math.min(...s.poly.map(p=>p.x));
assert.ok(width(slices[0])>3.9); assert.ok(width(slices[2])<2.01 && width(slices[2])>1.9);
assert.ok(slices.every(s=>s.poly.length>=3));
console.log('MESH SECTIONS: separated pieces, clipped sloping triangles, disabled objects OK');
