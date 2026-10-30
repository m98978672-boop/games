import assert from 'node:assert/strict';
import { CONFIG } from '../src/config.js';
import { World } from '../src/world.js';
const step=CONFIG.world.size/CONFIG.world.segments;
assert.equal(step,1.8,'original surface mesh and seeded island preserved');
const w=Object.create(World.prototype);
for (const [x,z] of [[0.2,0.3],[-12.4,13.4],[35.6,-20.5]]) {
  const r=w._pitRect(x,z,.5);
  assert.equal(r.x1-r.x0,1);assert.equal(r.z1-r.z0,1);
  assert.notEqual(w._digKey(x,z), w._digKey(x+1,z));
}
console.log('SOIL: 1 × 1 metre cells, including negative coordinates OK');
