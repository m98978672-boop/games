import fs from 'node:fs';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
const src = fs.readFileSync('/home/user/games/last-shore/src/models.js', 'utf8')
  .replace(/^import .*$/gm, '').replace(/export function/g, 'function');
const COLORS = { trunk: 0x6b4a2e, jungle: 0x5f8a45 };
const M = new Function('THREE', 'mergeGeometries', 'COLORS', src +
  '\nreturn { makePalmParts, makeTreeParts, makePineParts, makeMangroveParts, makeDeadTreeParts, makeBushParts, makeRockParts };')(THREE, mergeGeometries, COLORS);
for (const [name, fn] of [['palm', M.makePalmParts], ['tree', M.makeTreeParts], ['pine', M.makePineParts], ['mangrove', M.makeMangroveParts], ['dead', M.makeDeadTreeParts], ['bush', M.makeBushParts]]) {
  try {
    const p = fn(Math.random, false);
    console.log(name, 'bark', p.bark ? p.bark.attributes.position.count : 'NULL', 'leaf', p.leaf ? p.leaf.attributes.position.count : 'NULL');
  } catch (e) { console.log(name, 'ОШИБКА', e.message); }
}
