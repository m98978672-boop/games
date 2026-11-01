// Проверка кинематики прицепа: node tests/_trailer.mjs
import { TruckSim } from '../src/core/physics.js';
import { TRUCK_MODELS } from '../src/data/trucks.js';

const road = { curv: 0, grade: 0, speedLimit: 80 };
const model = TRUCK_MODELS.find((m) => m.id === 'auriga-3') || TRUCK_MODELS[0];
const sim = new TruckSim({ model, cargoMass: 12, lat: 0 });
sim.engineOn = true;
sim.handbrake = false;
sim.gear = 3;

// разгон
for (let i = 0; i < 60 * 4; i++) sim.step(1 / 60, { throttle: 0.6, brake: 0, steer: 0 }, road);
const straight = { phi: sim.trailerYawOffset, speed: +(sim.speed * 3.6).toFixed(1) };

// правый поворот
for (let i = 0; i < 60 * 3; i++) sim.step(1 / 60, { throttle: 0.4, brake: 0, steer: 1 }, road);
const right = { phi: +sim.trailerYawOffset.toFixed(3), roll: +sim.trailerRoll.toFixed(3), jack: +sim.jackknife.toFixed(2) };

// выравнивание
for (let i = 0; i < 60 * 4; i++) sim.step(1 / 60, { throttle: 0.3, brake: 0, steer: 0 }, road);
const straighten = { phi: +sim.trailerYawOffset.toFixed(3) };

// задний ход с полностью вывернутым рулём → складывание
sim.speed = -2.5;
for (let i = 0; i < 60 * 3; i++) {
  sim.gear = -1;
  sim.step(1 / 60, { throttle: 0.5, brake: 0, steer: 1 }, road);
  sim.speed = Math.min(sim.speed, -1.5);
}
const reverse = { phi: +sim.trailerYawOffset.toFixed(3), jack: +sim.jackknife.toFixed(2) };

console.log('прямая', straight);
console.log('правый поворот', right, '| φ должен быть > 0 (прицеп срезает), крен ≠ 0');
console.log('после выравнивания', straighten, '| φ должен упасть к 0');
console.log('задний ход', reverse, '| φ должен упереться в предел, jackknife > 0');
