import { createWorld, step } from './core.mjs';
import { planRules } from './scheduler.mjs';

const fireRules = planRules([{
  id: 'consume-fuel',
  run: (snapshot, seconds) => snapshot.entities.filter(fire => fire.hp > 0)
    .map(fire => ({ id: fire.id, field: 'hp', value: Math.max(0, fire.hp - seconds) })),
}]);

/**
 * Адаптер существующих костров: только расчёт топлива через ядро «Переплёт».
 * Возвращает числа, не изменяя переданный список и не управляя графикой.
 */
export function burnFuel(fires, dt, tick = 0) {
  if (!Array.isArray(fires)) throw new Error('Некорректный список костров');
  const world = createWorld(fires.map((f, id) => ({ id, x: f.x, z: f.z, hp: f.fuel })));
  world.tick = tick;
  const result = step(world, fireRules, dt);
  return result.entities.map(fire => fire.hp);
}
