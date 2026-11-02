// Износ и поломки: узлы изнашиваются, прокол/перегрев/КПП дают события и ограничения.
import { TruckSim } from '../src/core/physics.js';
import { TRUCK_MODELS } from '../src/data/trucks.js';

const model = TRUCK_MODELS.find((m) => m.id === 'auriga-3') || TRUCK_MODELS[0];
const road = { curv: 0, grade: 0, speedLimit: 80, roughness: 0.35, bank: 0 };
const assert = (cond, msg) => {
  if (!cond) throw new Error('ПРОВАЛ: ' + msg);
  console.log('  ✓ ' + msg);
};
const drive = (t, seconds, throttle = 1) => {
  const events = [];
  for (let i = 0; i < seconds * 60; i++) {
    t.step(1 / 60, { throttle, brake: 0, steer: 0 }, road);
    events.push(...t.takeEvents());
  }
  return events;
};

// 1. Здоровый тягач не ломается.
{
  const t = new TruckSim({ model, tires: 100, engine: 100, brakes: 100, gearbox: 100, coolant: 1 });
  t.engineOn = true;
  t.handbrake = false;
  const events = drive(t, 60);
  assert(events.length === 0, 'исправная машина не выдаёт поломок за минуту');
  assert(t.tires > 95 && t.engine > 95, `износ за минуту в норме (шины ${t.tires.toFixed(1)}%, мотор ${t.engine.toFixed(1)}%)`);
}

// 2. Лысая резина + гравий = прокол.
{
  const t = new TruckSim({ model, tires: 8, engine: 100, brakes: 100, gearbox: 100, coolant: 1 });
  t.engineOn = true;
  t.handbrake = false;
  t.speed = 24;
  const events = drive(t, 240);
  const blow = events.find((e) => e.type === 'blowout');
  assert(!!blow, 'на изношенных шинах случается прокол');
  assert(t.damageSpeedLimit === 45, 'после прокола скорость ограничена 45 км/ч');
  t.repair('tires');
  assert(t.blowout === 0 && t.damageSpeedLimit === 0, 'замена шины снимает ограничение');
}

// 3. Ушедший антифриз = перегрев и потеря мощности.
{
  const t = new TruckSim({ model, coolant: 0.15, engine: 100, tires: 100, brakes: 100, gearbox: 100 });
  t.engineOn = true;
  t.handbrake = false;
  t.speed = 22;
  const events = drive(t, 600);
  assert(events.some((e) => e.type === 'overheat'), 'низкий уровень антифриза ведёт к перегреву');
  assert(t.overheat && t.damageSpeedLimit === 55, 'перегрев включает защиту по скорости');
  const build = (engine) => {
    const s2 = new TruckSim({ model, engine, tires: 100, brakes: 100, gearbox: 100, coolant: 1 });
    s2.engineOn = true;
    s2.gear = 5;
    s2.rpm = 1400;
    return s2;
  };
  const stressed = build(40);
  const healthy = build(100);
  assert(stressed.wheelForce < healthy.wheelForce * 0.92, 'изношенный мотор тянет слабее');
}

// 4. Тормоза: износ, фейд и ограничение.
{
  const t = new TruckSim({ model, brakes: 15, engine: 100, tires: 100, gearbox: 100, coolant: 1 });
  t.engineOn = true;
  t.handbrake = false;
  t.speed = 25;
  let sawBrakes = false;
  for (let i = 0; i < 60 * 120; i++) {
    t.step(1 / 60, { throttle: 0, brake: 1, steer: 0 }, road);
    if (t.takeEvents().some((e) => e.type === 'brakes')) sawBrakes = true;
  }
  assert(sawBrakes, 'изношенные тормоза дают предупреждение');
  assert(t.brakeFade > 0.05, `колодки «плывут» при нагреве (фейд ${t.brakeFade.toFixed(2)})`);
  t.repair('brakes');
  assert(t.brakes === 100 && t.brakeFade === 0, 'ремонт тормозов возвращает ресурс');
}

// 5. Коробка: ресурс падает под тягой, при износе выбивает передачу.
{
  const t = new TruckSim({ model, gearbox: 12, engine: 100, tires: 100, brakes: 100, coolant: 1 });
  t.engineOn = true;
  t.handbrake = false;
  let jam = false;
  for (let i = 0; i < 60 * 300; i++) {
    t.step(1 / 60, { throttle: 1, brake: 0, steer: 0 }, road);
    if (t.takeEvents().some((e) => e.type === 'gearbox')) jam = true;
    if (jam) break;
  }
  assert(jam, 'изношенная КПП выбивает передачу');
  assert(t.damageSpeedLimit === 40, 'с выбитой передачей скорость ограничена 40 км/ч');
  t.repair('gearbox');
  assert(t.gearbox === 100 && t.damageSpeedLimit === 0, 'ремонт КПП снимает ограничение');
}

// 6. Состояние уходит в status() для HUD и сохранений.
{
  const t = new TruckSim({ model, tires: 55, gearbox: 61, coolant: 0.5 });
  const st = t.status();
  assert(st.tires === 55 && st.gearbox === 61 && st.coolant === 0.5, 'status() отдаёт состояние узлов');
  assert(st.damageLimit === 0 && st.blowout === 0, 'status() сообщает отсутствие поломок');
}

console.log('\n✅ износ и поломки работают');
