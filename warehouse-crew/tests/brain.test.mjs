// Тест мозга: обученная сеть должна обгонять необученную на одном и том же складе.
// Запуск: node warehouse-crew/tests/brain.test.mjs
import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

let failed = 0;
function ok(cond, msg) {
  console.log((cond ? '  ✓ ' : '  ✗ ') + msg);
  if (!cond) failed += 1;
}

const Model = require(path.join(root, 'src/sim/model.js'));
const Brain = require(path.join(root, 'src/ai/brain-net.js'));
const Wh = require(path.join(root, 'src/sim/warehouse.js'));
const WorkerMod = require(path.join(root, 'src/sim/worker.js'));

console.log('СЕВЕРНЫЙ УЗЕЛ — тест мозга');

// ---------------------------------------------------------------- данные
const weightsPath = path.join(root, 'data/brain_weights.json');
const datasetPath = path.join(root, 'data/brain_dataset.json');
const logPath = path.join(root, 'data/brain_training_log.json');
ok(existsSync(weightsPath), 'есть data/brain_weights.json');
ok(existsSync(datasetPath), 'есть data/brain_dataset.json');
ok(existsSync(logPath), 'есть data/brain_training_log.json');

const trained = JSON.parse(readFileSync(weightsPath, 'utf8'));
ok(trained.format === 'warehouse-brain/1', 'формат весов warehouse-brain/1');
ok(Array.isArray(trained.layers) && trained.layers.length === 3, 'три слоя: 18 → 24 → 16 → 6');
const params = Brain.countParams(trained);
ok(params === 958, 'параметров ровно 958 (нашли ' + params + ')');
ok(trained.inputSize === Brain.FEATURES.length, 'входов ' + trained.inputSize + ' = FEATURES');
ok(trained.outputSize === Brain.OUTPUTS.length, 'выходов ' + trained.outputSize + ' = OUTPUTS');

const dataset = JSON.parse(readFileSync(datasetPath, 'utf8'));
const episodes = dataset.episodes || [];
const rows = episodes.reduce((acc, ep) => acc.concat(ep.rows || []), []);
ok(rows.length >= 200, 'в датасете ' + rows.length + ' наблюдений (нужно ≥ 200)');
ok(rows[0] && Array.isArray(rows[0].f) && rows[0].f.length === Brain.FEATURES.length, 'у наблюдения верная размерность входов');
ok(rows[0] && Array.isArray(rows[0].y) && rows[0].y.length === Brain.OUTPUTS.length, 'у наблюдения верная размерность выходов');

// Персональные мозги бригады
for (const id of ['marta', 'grisha', 'timur']) {
  const p = path.join(root, 'data/brains/' + id + '.json');
  ok(existsSync(p), 'есть личный мозг ' + id);
  if (existsSync(p)) {
    const b = JSON.parse(readFileSync(p, 'utf8'));
    const model = b.model || b;
    ok(Brain.countParams(model) === 958, 'мозг ' + id + ' — 958 параметров');
  }
}

// ---------------------------------------------------------------- сцена
// Оценка — та же, что у тренера: доставки, качество, справедливость бригады,
// штрафы за отдых сверх нормы, износ, обмороки и брошенные заказы.
const CREW = [
  { id: 'marta', name: 'Марта Ковач', role: 'Старший кладовщик', traits: { endurance: 0.84, strength: 0.56, precision: 0.8, caution: 0.72, paceTrait: 0.56, neuroticism: 0.28, recovery: 0.72, coop: 0.78 }, overrides: { energy: 0.86, sleepDebt: 0.12 } },
  { id: 'grisha', name: 'Гриша Волков', role: 'Грузчик-силач', traits: { endurance: 0.58, strength: 0.92, precision: 0.48, caution: 0.36, paceTrait: 0.88, neuroticism: 0.58, recovery: 0.48, coop: 0.42 }, overrides: { energy: 0.92, sleepDebt: 0.3 } },
  { id: 'timur', name: 'Тимур Асланов', role: 'Комплектовщик', traits: { endurance: 0.66, strength: 0.63, precision: 0.88, caution: 0.66, paceTrait: 0.5, neuroticism: 0.22, recovery: 0.6, coop: 0.9 }, overrides: { energy: 0.78, sleepDebt: 0.18 } },
];
const DT = 0.4;
const SHIFT = 260;
// Четыре сценария ровно как у тренера: будний день, аврал, спокойно, недосып
const SCENARIOS = [
  { seed: 9100, spawnEvery: 13, label: 'будний день' },
  { seed: 9137, spawnEvery: 11, label: 'аврал' },
  { seed: 9174, spawnEvery: 15, label: 'спокойно' },
  { seed: 9211, spawnEvery: 12, label: 'недосып' },
].map((sc, i) => Object.assign({}, sc, {
  crew: CREW.map((c, idx) => Object.assign({}, c, {
    overrides: i === 0 ? c.overrides : Object.assign({}, c.overrides, {
      energy: Math.max(0.35, Math.min(0.96, c.overrides.energy + ((i % 3) - 1) * 0.1 + (idx === 0 ? -0.05 : 0))),
      sleepDebt: Math.min(0.8, c.overrides.sleepDebt + ((i % 2) * 0.15)),
    }),
  })),
}));

function evaluate(brain) {
  let fitness = 0;
  let delivered = 0;
  for (const scenario of SCENARIOS) {
    const warehouse = Wh.createWarehouse({
      seed: scenario.seed, shiftLength: SHIFT, spawnEvery: scenario.spawnEvery,
      maxPending: 9, firstSpawnDelay: 3,
    });
    const rng = Wh.createRng(scenario.seed + 17);
    const workers = scenario.crew.map((c, i) => WorkerMod.createWorker({
      id: c.id, name: c.name, role: c.role, traits: c.traits, overrides: c.overrides,
      model: Model, layout: warehouse.layout, spawn: warehouse.layout.spawns[i], heading: 0,
    }));
    const env = { warehouse, workers, brain, brainApi: Brain, rng };
    const collapses = [0, 0, 0];
    for (let t = 0; t < SHIFT; t += DT) {
      warehouse.step(DT);
      for (let i = 0; i < workers.length; i++) {
        const w = workers[i];
        const wasDown = w.body.collapsed;
        w.update(DT, env);
        if (w.body.collapsed && !wasDown) collapses[i] += 1;
      }
    }
    const stats = warehouse.state.stats;
    let quality = 0;
    for (const order of warehouse.state.orders) {
      if (order.status !== 'stored') continue;
      const late = order.storedAt > order.deadline ? 1 : 0;
      quality += (1 - order.damage) * (late ? 0.72 : 1);
    }
    const deliveries = workers.map((w) => w.state.stats.delivered);
    delivered += stats.delivered;
    const restShare = workers.map((w) => w.body.restSeconds / Math.max(1, w.body.workSeconds + w.body.restSeconds));
    const fatigueEnd = workers.map((w) => w.body.fatigue);
    const avgDeliveries = deliveries.reduce((a, b) => a + b, 0) / workers.length;
    const fairness = 1 - (Math.max(...deliveries) - Math.min(...deliveries)) / Math.max(1, Math.max(...deliveries));
    const idleRestPenalty = restShare.reduce((a, b) => a + Math.max(0, b - 0.38), 0) * 140;
    const exhaustion = fatigueEnd.reduce((a, b) => a + Math.max(0, b - 0.8), 0) * 120;
    const collapsePenalty = collapses.reduce((a, b) => a + b, 0) * 45;
    const pendingPenalty = warehouse.activeOrders().length * 6;

    fitness += avgDeliveries * 11 + quality * 14 + stats.score * 0.25
      - stats.ruined * 18 - stats.missed * 4
      - idleRestPenalty - exhaustion - collapsePenalty - pendingPenalty + fairness * 12;
  }
  return { fitness: fitness / SCENARIOS.length, delivered };
}

// Необученная сеть: те же слои, но веса — шум того же масштаба
function randomBrain(seed) {
  const rng = Wh.createRng(seed);
  return {
    format: 'warehouse-brain/1',
    layers: trained.layers.map((layer) => ({
      in: layer.in, out: layer.out, activation: layer.activation,
      w: layer.w.map(() => rng.range(-0.6, 0.6)),
      b: layer.b.map(() => rng.range(-0.2, 0.2)),
    })),
  };
}

const base = evaluate(trained);
console.log('  · обученная база: фитнес ' + base.fitness.toFixed(1) + ', доставок ' + base.delivered);
let rawBest = -Infinity;
for (const seed of [11, 22, 33]) {
  const r = evaluate(randomBrain(seed));
  rawBest = Math.max(rawBest, r.fitness);
  console.log('  · необученная (сид ' + seed + '): фитнес ' + r.fitness.toFixed(1) + ', доставок ' + r.delivered);
}
ok(base.fitness > rawBest, 'обученная политика лучше любой необученной: ' +
  base.fitness.toFixed(1) + ' > ' + rawBest.toFixed(1));
ok(base.delivered > 0, 'обученная бригада доставляет заказы (' + base.delivered + ' за смену)');
if (failed) {
  console.error('\n✗ Провалено проверок: ' + failed);
  process.exit(1);
}
console.log('\n✓ Мозг в порядке: обучение даёт прирост');
