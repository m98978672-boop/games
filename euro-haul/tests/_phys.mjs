import { TruckSim } from '../src/core/physics.js';
import { TRUCK_MODELS } from '../src/data/trucks.js';
const model = TRUCK_MODELS.find((m) => m.id === 'auriga-3') || TRUCK_MODELS[0];
const t = new TruckSim({ model });
t.engineOn = true; t.handbrake = false;
const road = { curv: 0, grade: 0, speedLimit: 80 };
for (let i = 0; i < 400; i++) {
  t.step(1 / 60, { throttle: 1, brake: 0, steer: 0 }, road);
  if (i % 40 === 0) console.log((i / 60).toFixed(1) + 's', 'v=' + (t.speed * 3.6).toFixed(1), 'km/h', 'gear=' + t.gear, 'rpm=' + Math.round(t.rpm), 'thr=' + t.throttle.toFixed(2), 'hb=' + t.handbrake, 'force=' + Math.round(t.wheelForce), 'mass=' + t.mass);
}
console.log('model', model.name, model.hp, model.gears, model.finalDrive);
