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
assert.equal(bodyWorld.world.bodies.length, baseline + 15);
assert.equal(bodyWorld.world.constraints.length, 14, 'articulated joints installed');
let headStart = actor.ragdoll.head.y;
for (let i = 0; i < 180; i++) bodyWorld.step([], 1/120);
assert(actor.ragdoll.head.y < headStart - .2, 'head falls under gravity');
assert(actor.ragdoll.head.y > -.03, 'head collides with floor');
for (const name of ['handL', 'handR', 'footL', 'footR']) {
  assert(actor.ragdoll[name] && actor.ragdoll[name].y > -.06, name + ' is independently simulated above the floor');
}
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

// An unsecured stationary package becomes dynamic after an impact.
const contactWorld = Physics.create(Wh.LAYOUT, dims, []);
const striker = box(-7, 20, 5); striker.pose.z = .6;
const waiting = box(-6.3, 8, 0); waiting.pose.z = .6;
waiting._physicalDynamic = false; waiting.drops = 0; waiting.physics = false;
for (let i = 0; i < 120; i++) contactWorld.step([striker, waiting], 1/120);
assert(waiting._physicalDynamic && waiting.drops === 1 && waiting.pose.x > -6.2, 'unsecured box responds to impact');

// The independent fluid solver mirrors cargo without advancing its simulation.
const fluidWorld = Physics.create(Wh.LAYOUT, dims, []);
const fluidBaseline = fluidWorld.world.bodies.length;
const obstacle = box(-7, 8, 0); obstacle.status = 'stored'; obstacle._physicalDynamic = false; obstacle.pose.z = .8; obstacle.pose.y = 0;
const falling = [{ x:-7, y:0, z:2, vx:0, vy:0, vz:-1, life:3 }];
fluidWorld.syncFluidObstacles([obstacle]);
let impactHeight = null;
for (let i = 0; i < 140 && falling.length; i++) fluidWorld.stepFluid(falling, .01, d => { impactHeight = d.z; });
assert(impactHeight > 1.1, 'blood droplet hits the top of the mirrored box');
assert.equal(obstacle.pose.z, .8, 'fluid does not advance or change cargo state');
fluidWorld.syncFluidObstacles([]);
assert.equal(fluidWorld.world.bodies.length, fluidBaseline, 'mirrored cargo and droplets are removed');
console.log('✓ Контакт с неподвижным грузом и столкновение жидкости с коробкой');

const machineWorld = Physics.create(Wh.LAYOUT, dims, []);
const vehicle = { x: -8, y: -7, yaw: 0 };
const loose = box(-6.5, 7, 0); loose.pose.z = .1;
machineWorld.syncForklift(vehicle, .05);
machineWorld.step([loose], .05);
for (let i = 0; i < 20; i++) {
  vehicle.x += .05;
  machineWorld.syncForklift(vehicle, .05);
  machineWorld.step([loose], .05);
}
assert(loose.pose.x > -6.3, 'moving forklift collides with and pushes cargo');
machineWorld.syncForklift(null, .05);
console.log('✓ Движущийся погрузчик взаимодействует с грузом');

// A driver shares the vehicle transform: do not leave a second collider
// at the seat, and restore the walking collider after dismount.
const riderWorld = Physics.create(Wh.LAYOUT, dims, []);
const rider = { pos:{ x:-8, y:-7 }, heading:0, state:'idle', onForklift:false };
const initial = riderWorld.world.bodies.length;
riderWorld.syncActors([rider], .05);
assert.equal(riderWorld.world.bodies.length, initial + 1);
rider.onForklift = true;
riderWorld.syncActors([rider], .05);
assert.equal(riderWorld.world.bodies.length, initial, 'driver collider removed while aboard');
rider.onForklift = false;
riderWorld.syncActors([rider], .05);
assert.equal(riderWorld.world.bodies.length, initial + 1, 'driver collider restored after dismount');
console.log('✓ Коллайдер водителя не дублируется внутри погрузчика');
