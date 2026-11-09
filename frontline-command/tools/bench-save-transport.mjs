// Сравнение размера и времени сериализации alg_save с предыдущей версией.
// Запуск: git show <commit>:frontline-command/src/core/save.js > src/core/save-bench-previous-temp.js
// node tools/bench-save-transport.mjs src/core/save-bench-previous-temp.js
// rm src/core/save-bench-previous-temp.js
// Это только один синтетический сценарий и localStorage в памяти, не время браузерного диска.
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { Save as current } from '../src/core/save.js';
const path = process.argv[2];
if (!path) throw new Error('Нужен путь к предыдущему save.js в src/core');
const { Save: previous } = await import(pathToFileURL(resolve(path)).href);
const store = new Map();
globalThis.localStorage = {
  getItem: (key) => store.get(key) ?? null,
  setItem: (key, value) => store.set(key, value),
  removeItem: (key) => store.delete(key),
};
const result = [];
for (const target of [52, 400]) {
  const cfg = await loadConfig();
  cfg.flags.alg_save = true;
  const game = new Game({ cfg, seed: 71, aiVsAi: true });
  while (game.units.size < target) {
    const faction = game.units.size % 2;
    const hq = game.world.hqOf(faction);
    game.spawnUnit(faction, 'infantry', hq.x + (game.units.size % 100), hq.y + (game.units.size % 80));
  }
  for (const faction of [0, 1]) {
    const truck = game.logistics.trucksOf(faction)[0];
    const sector = game.world.sectorAt(truck.x, truck.y);
    const req = { faction, kind: 'sector', sectorId: sector.id, x: truck.x + 300, y: truck.y + 200, created: 9, priority: 1 };
    game.logistics.requests.push(req);
    game.logistics.assignTruck(truck, req);
    game.logistics.loadTruck(truck, truck.truckTask);
  }
  if (process.argv.includes('--blueprints')) {
    for (let i = 0; i < 10; i++) {
      const f = i % 2, hq = game.world.hqOf(f);
      const bp = game.world.addBuilding({ type: 'sandbags', faction: f, x: hq.x + 200 + i * 35,
        y: hq.y + 200, blueprint: true, progress: 0.35 });
      Object.assign(bp, { priority: 1, reason: 'fixture', createdAt: 10, stall: 'ok' });
      game.build.blueprints.push(bp);
    }
  }
  // При off сравнены идентичные байты сохранения и выборочное состояние
  // после загрузки предыдущим и текущим кодом, при фиксированном savedAt.
  cfg.flags.alg_save = false;
  const now = Date.now;
  let oldBytes, newBytes;
  try {
    Date.now = () => 123456789;
    previous.saveWar(game); oldBytes = store.get('frontline.war.v1');
    current.saveWar(game); newBytes = store.get('frontline.war.v1');
  } finally { Date.now = now; }
  assert.equal(newBytes, oldBytes, 'флаг off: байты сохранения совпали');
  const data = JSON.parse(oldBytes);
  const a = new Game({ cfg, seed: 71, aiVsAi: true }), b = new Game({ cfg, seed: 71, aiVsAi: true });
  previous.applyWar(a, data);
  current.applyWar(b, data);
  const snapshot = (g) => ({ rng: g.rng.s, time: g.time, stock: g.logistics.stock,
    requests: g.logistics.requests,
    points: g.world.points.map((p) => ({ id: p.id, owner: p.owner, hp: p.hp, capture: p.capture,
      structureId: p.structure?.id, structureDead: p.structure?.dead })),
    buildings: g.world.buildings.map((x) => ({ id: x.id, type: x.type, x: x.x, y: x.y,
      hp: x.hp, faction: x.faction, pointId: x.pointId, dead: x.dead, built: x.built })),
    units: [...g.units.values()].map((u) => ({ id: u.id, faction: u.faction, role: u.role,
      x: u.x, y: u.y, hp: u.hp, morale: u.morale, squadId: u.squadId,
      mag: u.mag, reserve: u.reserve, facing: u.facing, cargo: u.cargo, goal: u.goal })),
    squads: [...g.squads.values()].map((sq) => ({ id: sq.id, commanderId: sq.commanderId,
      members: [...sq.memberIds], objective: sq.objective })) });
  assert.deepEqual(snapshot(b), snapshot(a), 'флаг off: выборочные поля загрузки совпали');
  cfg.flags.alg_save = true;
  const times = [[], []], sizes = [0, 0];
  const versions = [previous, current];
  // Чередуем порядок, чтобы уменьшить влияние дрейфа измерений.
  for (let i = 0; i < 240; i++) {
    for (const j of i % 2 ? [1, 0] : [0, 1]) {
      const t = performance.now();
      if (!versions[j].saveWar(game)) throw new Error('saveWar failed');
      const elapsed = performance.now() - t;
      if (i >= 40) times[j].push(elapsed);
      sizes[j] = Buffer.byteLength(store.get('frontline.war.v1'));
    }
  }
  const stats = times.map((a, j) => {
    a.sort((x, y) => x - y);
    return { bytes: sizes[j], meanMs: +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(3),
      p95Ms: +a[Math.floor(a.length * 0.95)].toFixed(3), samples: a.length };
  });
  result.push({ units: game.units.size, blueprints: game.build.blueprints.length, legacySaveBytesEqual: true, legacySelectedLoadStateEqual: true,
    previous: stats[0], current: stats[1] });
}
console.log(JSON.stringify(result, null, 2));
