// Cannon cargo integration: masses, contact response, spin, cleanup and tunnelling.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const Wh = require('../src/sim/warehouse.js');
const Physics = require('../src/sim/physics.js');
const dims = { medium: { halfW: .26, halfD: .21, h: .4 } };
const sim = Physics.create(Wh.LAYOUT, dims, [{ height: .25 }, { height: 1.05 }, { height: 1.85 }]);
function box(x, mass, vx, spin = 0) {
  return { size: 'medium', mass, status: 'pending', drops: 1, _physicalDynamic: true,
    pose: { x, y: -7, z: .01, yaw: 0, tilt: 0 }, vel: { x: vx, y: 0, vz: 0, spin }, physics: true };
}
const a = box(-7.0, 30, 4, 2), b = box(-6.3, 5, 0);
a.pose.z = b.pose.z = 0.8;
const bodiesInitially = sim.world.bodies.length;
let spinSeen = false;
for (let i = 0; i < 90; i++) {
  sim.step([a, b], 1 / 120);
  if (Math.abs(a.pose.quaternion.x) > .05) spinSeen = true;
}
assert(spinSeen, 'angular velocity rotates box');
assert(b.pose.x > -6.1 && b.vel.x > 0.1, 'impact moves second box');
assert(sim.world.bodies.some(body => body.mass === 30) && sim.world.bodies.some(body => body.mass === 5), 'actual masses applied');
sim.step([], 1 / 60);
assert.equal(sim.world.bodies.length, bodiesInitially, 'removed cargo bodies are cleaned up');
const fast = box(-3.6, 10, 40);
fast.pose.y = 0; fast.pose.z = .7; fast.vel.spin = 0;
sim.step([fast], .08);
assert(fast.pose.x < Wh.LAYOUT.racks[0].x - .5, 'fast box hits rack upright with substeps');
fast.status = 'carried';
sim.step([fast], 1 / 60);
assert.equal(sim.world.bodies.length, bodiesInitially, 'picked-up cargo no longer collides');
console.log('✓ Cannon: массы, вращение, контакты, быстрый удар и очистка тел');

// Two nearby fluid particles exchange SPH pressure/viscosity forces.
const liquid = Physics.create(Wh.LAYOUT, dims, [{ height: 1.85 }]);
const drops = [
  { x:-7, y:0, z:3, vx:0, vy:0, vz:0, life:2 },
  { x:-6.95, y:0, z:3, vx:0, vy:0, vz:0, life:2 },
];
for (let i = 0; i < 10; i++) liquid.stepFluid(drops, .01, () => {});
assert(Math.abs(drops[0].vx) > 0.01 && Math.abs(drops[1].vx) > 0.01, 'SPH particles affect each other');
let splashes = 0;
for (let i = 0; i < 200 && drops.length; i++) liquid.stepFluid(drops, .01, () => splashes++);
assert.equal(drops.length, 0, 'fluid particles removed after contact');
assert.equal(splashes, 2, 'fluid creates splashes on the floor');

const bodyWorld = Physics.create(Wh.LAYOUT, dims, [{ height: .25 }, { height: 1.05 }, { height: 1.85 }]);
const baseline = bodyWorld.world.bodies.length;
const actor = { pos: { x:-7, y:0 }, heading:0, state:'down' };
bodyWorld.beginRagdoll(actor);
assert.equal(bodyWorld.world.bodies.length, baseline + 11);
assert.equal(bodyWorld.world.constraints.length, 10, 'articulated joints installed');
let headStart = actor.ragdoll.head.y;
for (let i = 0; i < 180; i++) bodyWorld.step([], 1/120);
assert(actor.ragdoll.head.y < headStart - .2, 'head falls under gravity');
assert(actor.ragdoll.head.y > -.03, 'head collides with floor');
bodyWorld.endRagdoll(actor);
assert.equal(bodyWorld.world.constraints.length, 0);
assert.equal(bodyWorld.world.bodies.length, baseline, 'ragdoll cleanup removes bodies and joints');
console.log('✓ SPH: взаимодействие капель и контакт с полом; ragdoll: суставы, падение и очистка');

const walkerWorld = Physics.create(Wh.LAYOUT, dims, []);
const walker = { pos: { x:-7.5, y:-7 }, heading:0, state:'idle' };
const pushed = box(-6.7, 5, 0);
walkerWorld.syncActors([walker], .05);
walkerWorld.step([pushed], .05);
for (let i = 0; i < 20; i++) {
  walker.pos.x += .05;
  walkerWorld.syncActors([walker], .05);
  walkerWorld.step([pushed], .05);
}
assert(pushed.pose.x > -6.5, 'walking kinematic body pushes dynamic cargo');
console.log('✓ Движущийся работник взаимодействует с динамической коробкой');
