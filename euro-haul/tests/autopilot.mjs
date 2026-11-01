// Проверка физики на длинной дистанции: простой автопилот проходит реальный маршрут.
// Запуск: node tests/autopilot.mjs
import { buildRoute } from '../src/world/roadnet.js';
import { TruckSim } from '../src/core/physics.js';
import { speedLimitAt } from '../src/world/roadnet.js';
import { TRUCK_MODELS } from '../src/data/trucks.js';
import { clamp } from '../src/core/math.js';

const route = buildRoute('berlin', 'rome', 42);
console.log(`маршрут ${route.km.toFixed(1)} км через ${route.marks.map((m) => m.name).join(' → ')}`);

function drive({ cargo = 18, target = 78, label = '' } = {}) {
  const sim = new TruckSim({ model: TRUCK_MODELS[2], cargoMass: cargo });
  sim.engineOn = true;
  sim.handbrake = false;
  sim.fuel = 400;
  const dt = 1 / 60;
  let t = 0;
  let maxLat = 0;
  let offRoad = 0;
  let NaNseen = false;
  const finish = route.length - 500;
  while (sim.s < finish && t < 60 * 60 * 2) {
    const p = route.pointAt(sim.s);
    const limit = speedLimitAt(route, sim.s);
    const desired = Math.min(target, limit);
    // Автопилот: держим центр правой полосы, руль по ошибке курса и смещения.
    const laneError = 1.85 - sim.lat;
    const headingError = -sim.yawRel * 6;
    const steer = clamp(laneError * 0.35 + headingError, -1, 1);
    const tooFast = sim.speed * 3.6 > desired;
    const throttle = tooFast ? 0 : clamp((desired - sim.speed * 3.6) / 12, 0, 1);
    const brake = sim.speed * 3.6 > desired + 6 ? 0.55 : 0;
    sim.step(dt, { throttle, brake, steer }, { curv: p.curv, grade: 0, speedLimit: limit });
    t += dt;
    maxLat = Math.max(maxLat, Math.abs(sim.lat));
    if (Math.abs(sim.lat) > 2.9) offRoad++;
    if (!Number.isFinite(sim.s) || !Number.isFinite(sim.lat) || !Number.isFinite(sim.speed)) NaNseen = true;
    if (NaNseen) break;
  }
  const minutes = t / 60;
  console.log(
    `${label || 'рейс'} (${cargo} т): ${minutes.toFixed(1)} мин игрового времени, ` +
      `${(sim.s / 1000).toFixed(1)} км, средняя ${((sim.s / 1000) / (minutes / 60)).toFixed(0)} км/ч, ` +
      `топливо ${(route.stations.length ? '' : '')}${sim.fuel.toFixed(0)} л, износ ДВС ${sim.engine.toFixed(1)}%, ` +
      `макс. смещение ${maxLat.toFixed(2)} м, кадров вне полосы ${offRoad}, NaN: ${NaNseen ? 'ДА' : 'нет'}`
  );
  return { minutes, sim, maxLat, offRoad, NaNseen };
}

const light = drive({ cargo: 0, label: 'порожний' });
const loaded = drive({ cargo: 22, label: 'загруженный' });
const fast = drive({ cargo: 18, target: 86, label: 'быстрый' });

let ok = true;
for (const [name, r] of Object.entries({ light, loaded, fast })) {
  if (r.NaNseen || r.maxLat > 5 || r.sim.s < route.length - 3000) {
    console.error('❌ физика не прошла маршрут:', name, r.maxLat.toFixed(2), r.sim.s.toFixed(0));
    ok = false;
  }
}
if (loaded.minutes > light.minutes * 1.25) {
  console.error('❌ загруженный тягач должен ехать заметно медленнее, но не в разы');
  ok = false;
}
if (loaded.sim.fuel < 0 || light.sim.fuel < 0) {
  console.error('❌ топливо ушло в минус');
  ok = false;
}
console.log(ok ? '\n✅ автопилот прошёл маршрут без потери управления' : '\n❌ есть проблемы в физике');
process.exit(ok ? 0 : 1);
