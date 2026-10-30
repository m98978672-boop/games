// Исследовательский последовательный прототип. Не используется игрой.
// Это НЕ песочница для недоверенного кода и не полноценный игровой движок.
function validNumber(n) { return typeof n === 'number' && Number.isFinite(n); }
function copyEntity(e) {
  if (!Number.isSafeInteger(e.id) || e.id < 0 || !validNumber(e.x) || !validNumber(e.z) || !validNumber(e.hp)) throw new Error('Некорректный объект');
  return { id: e.id, x: e.x, z: e.z, hp: e.hp };
}
export function createWorld(entities) {
  if (!Array.isArray(entities)) throw new Error('Нужен список объектов');
  const result = entities.map(copyEntity).sort((a, b) => a.id - b.id);
  if (result.some((e, i) => i && result[i - 1].id === e.id)) throw new Error('Повторный ID');
  return { tick: 0, entities: result };
}
export function step(world, rules, dt = 1 / 30) {
  if (!validNumber(dt) || dt <= 0 || dt > 1) throw new Error('Некорректный шаг');
  if (!world || !Number.isSafeInteger(world.tick) || world.tick < 0 || !Array.isArray(rules)) throw new Error('Некорректный мир или правила');
  const base = createWorld(world.entities);
  const snapshot = Object.freeze({ tick: world.tick, entities: Object.freeze(base.entities.map(e => Object.freeze(e))) });
  const operations = [];
  for (const rule of rules) {
    if (typeof rule !== 'function') throw new Error('Некорректное правило');
    const proposed = rule(snapshot, dt);
    if (!Array.isArray(proposed)) throw new Error('Правило обязано вернуть список изменений');
    operations.push(...proposed);
  }
  const next = new Map(base.entities.map(e => [e.id, { ...e }]));
  const written = new Set();
  for (const op of operations) {
    if (!op || !Number.isSafeInteger(op.id) || !['x', 'z', 'hp'].includes(op.field) || !validNumber(op.value) || !next.has(op.id)) throw new Error('Некорректное изменение');
    const key = `${op.id}:${op.field}`;
    if (written.has(key)) throw new Error('Конфликт изменений');
    written.add(key);
    next.get(op.id)[op.field] = op.value;
  }
  return { tick: world.tick + 1, entities: [...next.values()] };
}
