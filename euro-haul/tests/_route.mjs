// Проверка качества трассы: радиусы поворотов не должны быть «заломами»,
// а съезды/расширения не должны ломать геометрию (NaN в вершинах).
import { buildRouteGeometry, speedLimitAt } from '../src/world/roadnet.js';

const pairs = [
  ['berlin', 'hamburg'],
  ['berlin', 'munich'],
  ['paris', 'madrid'],
  ['warsaw', 'vilnius'],
];
let worst = 0;
let bad = 0;
for (const [a, b] of pairs) {
  const route = buildRouteGeometry([a, b], 7);
  for (const p of route.samples) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.z) || !Number.isFinite(p.hdg)) bad++;
    worst = Math.max(worst, Math.abs(p.curv || 0));
  }
  const limit = speedLimitAt(route, route.length / 2);
  if (!(limit > 0)) bad++;
}
const radius = worst > 0 ? Math.round(1 / worst) : Infinity;
console.log(`минимальный радиус поворота: ${radius} м; битых точек: ${bad}`);
if (bad > 0) {
  console.error('❌ в геометрии трассы есть NaN');
  process.exit(1);
}
if (radius < 150) {
  console.error('❌ слишком крутой поворот (радиус < 150 м)');
  process.exit(1);
}
console.log('✅ кривые плавные');
