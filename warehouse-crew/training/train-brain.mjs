// Обучение нейросети-мозга рабочих склада: эволюционная стратегия (μ+λ)
// на той же физиологии и логике склада, что крутятся в игре.
//
// Запуск:  node warehouse-crew/training/train-brain.mjs
//          node warehouse-crew/training/train-brain.mjs --generations 40 --pop 24
//
// Результат: data/brain_weights.json (базовая модель),
//            data/brains/<crew>.json (дообучение под характер рабочего),
//            data/brain_dataset.json (наблюдения), data/brain_training_log.json.
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const Model = require(path.join(root, 'src/sim/model.js'));
const Brain = require(path.join(root, 'src/ai/brain-net.js'));
const Wh = require(path.join(root, 'src/sim/warehouse.js'));
const WorkerMod = require(path.join(root, 'src/sim/worker.js'));

// ------------------------------------------------------------------ аргументы
function arg(name, fallback) {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 ? Number(process.argv[i + 1]) : fallback;
}
const GENERATIONS = arg('generations', 26);
const POPULATION = arg('pop', 16);
const ELITES = arg('elites', 4);
const SEED = arg('seed', 20261120);
const DT = 0.4;
const SHIFT = 260;
const HIDDEN = [24, 16];
const IN = Brain.FEATURES.length;
const OUT = Brain.OUTPUTS.length;

// ------------------------------------------------------------------ характеры
const CREW = [
  {
    id: 'marta',
    name: 'Марта Ковач',
    role: 'Старший кладовщик',
    traits: { endurance: 0.84, strength: 0.56, precision: 0.8, caution: 0.72, paceTrait: 0.56, neuroticism: 0.28, recovery: 0.72, coop: 0.78 },
    overrides: { energy: 0.86, sleepDebt: 0.12 },
  },
  {
    id: 'grisha',
    name: 'Гриша Волков',
    role: 'Грузчик-силач',
    traits: { endurance: 0.58, strength: 0.92, precision: 0.48, caution: 0.36, paceTrait: 0.88, neuroticism: 0.58, recovery: 0.48, coop: 0.42 },
    overrides: { energy: 0.92, sleepDebt: 0.3 },
  },
  {
    id: 'timur',
    name: 'Тимур Асланов',
    role: 'Комплектовщик',
    traits: { endurance: 0.66, strength: 0.63, precision: 0.88, caution: 0.66, paceTrait: 0.5, neuroticism: 0.22, recovery: 0.6, coop: 0.9 },
    overrides: { energy: 0.78, sleepDebt: 0.18 },
  },
];

// ------------------------------------------------------------------ ГПСЧ
function makeRng(seed) {
  let s = (seed >>> 0) || 1;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return { next, range: (a, b) => a + (b - a) * next(), gauss: () => {
    let u = 0, v = 0;
    while (u === 0) u = next();
    while (v === 0) v = next();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  } };
}

// ------------------------------------------------------------------ параметры
function layerSizes() {
  return [IN, ...HIDDEN, OUT];
}
function paramCount() {
  const sizes = layerSizes();
  let n = 0;
  for (let i = 1; i < sizes.length; i++) n += sizes[i] * sizes[i - 1] + sizes[i];
  return n;
}
function randomGenome(rng) {
  const sizes = layerSizes();
  const out = [];
  for (let l = 1; l < sizes.length; l++) {
    const fanIn = sizes[l - 1];
    const fanOut = sizes[l];
    const scale = Math.sqrt(2 / (fanIn + fanOut));
    for (let o = 0; o < fanOut; o++) {
      for (let i = 0; i < fanIn; i++) out.push(rng.gauss() * scale);
      out.push(0.05 * rng.gauss());
    }
  }
  return out;
}
function genomeToModel(genome) {
  const sizes = layerSizes();
  let cursor = 0;
  const layers = [];
  for (let l = 1; l < sizes.length; l++) {
    const fanIn = sizes[l - 1];
    const fanOut = sizes[l];
    const w = new Array(fanOut * fanIn);
    const b = new Array(fanOut);
    for (let o = 0; o < fanOut; o++) {
      for (let i = 0; i < fanIn; i++) w[o * fanIn + i] = round4(genome[cursor++]);
      b[o] = round4(genome[cursor++]);
    }
    layers.push({ in: fanIn, out: fanOut, activation: l === sizes.length - 1 ? 'sigmoid' : 'tanh', w, b });
  }
  return {
    format: 'warehouse-brain/1',
    architecture: sizes,
    inputSize: IN,
    outputSize: OUT,
    features: Brain.FEATURES.map((f) => f.id),
    outputs: Brain.OUTPUTS.map((o) => o.id),
    layers,
  };
}
function round4(v) {
  return Math.round(v * 10000) / 10000;
}

// ------------------------------------------------------------------ сценарии
function buildScenarios() {
  const list = [];
  for (let i = 0; i < 4; i++) {
    const crew = CREW.map((c, idx) => ({
      traits: c.traits,
      overrides: i === 0 ? c.overrides : Object.assign({}, c.overrides, {
        energy: Math.max(0.35, Math.min(0.96, c.overrides.energy + ((i % 3) - 1) * 0.1 + (idx === 0 ? -0.05 : 0))),
        sleepDebt: Math.min(0.8, c.overrides.sleepDebt + ((i % 2) * 0.15)),
      }),
    }));
    list.push({
      seed: 9100 + i * 37,
      spawnEvery: [13, 11, 15, 12][i],
      workers: crew,
      label: ['будний день', 'аврал', 'спокойно', 'недосып'][i],
    });
  }
  return list;
}
const SCENARIOS = buildScenarios();

// ------------------------------------------------------------------ прогон
function evaluate(genome, options = {}) {
  const brain = options.brain || genomeToModel(genome);
  const scenarios = options.scenarios || SCENARIOS;
  const only = options.onlyWorker || null;
  let fitness = 0;
  const detail = [];
  let dataset = options.dataset || null;

  for (const scenario of scenarios) {
    const warehouse = Wh.createWarehouse({
      seed: scenario.seed,
      shiftLength: SHIFT,
      spawnEvery: scenario.spawnEvery,
      maxPending: 9,
      firstSpawnDelay: 3,
    });
    const rng = Wh.createRng(scenario.seed + 17);
    const workers = scenario.workers.map((c, i) => WorkerMod.createWorker({
      id: CREW[i].id,
      name: CREW[i].name,
      role: CREW[i].role,
      traits: c.traits,
      overrides: c.overrides,
      model: Model,
      layout: warehouse.layout,
      spawn: warehouse.layout.spawns[i],
      heading: 0,
    }));
    const env = { warehouse, workers, brain, brainApi: Brain, rng };
    const collapses = [0, 0, 0];
    const decisionLog = [];

    for (let t = 0; t < SHIFT; t += DT) {
      warehouse.step(DT);
      for (let i = 0; i < workers.length; i++) {
        const w = workers[i];
        const wasDown = w.body.collapsed;
        w.update(DT, env);
        if (w.body.collapsed && !wasDown) collapses[i] += 1;
        if (dataset && i === 0 && Math.floor(t / DT) % 7 === 0 && w.features) {
          decisionLog.push({
            t: Math.round(t),
            f: w.features.map(round4),
            y: ['pace', 'caution', 'rest', 'precision', 'urgency', 'coop'].map((k) => round4(w.decision[k])),
            s: w.state,
            carried: Boolean(w.carryingId),
          });
        }
      }
    }

    const stats = warehouse.state.stats;
    let quality = 0;
    let stored = 0;
    for (const order of warehouse.state.orders) {
      if (order.status === 'stored') {
        stored += 1;
        const late = order.storedAt > order.deadline ? 1 : 0;
        quality += (1 - order.damage) * (late ? 0.72 : 1);
      }
    }
    const active = warehouse.activeOrders().length;
    const deliveries = workers.map((w) => w.state.stats.delivered);
    const restShare = workers.map((w) => w.body.restSeconds / Math.max(1, w.body.workSeconds + w.body.restSeconds));
    const fatigueEnd = workers.map((w) => w.body.fatigue);
    const avgDeliveries = deliveries.reduce((a, b) => a + b, 0) / workers.length;
    const fairness = 1 - (Math.max(...deliveries) - Math.min(...deliveries)) / Math.max(1, Math.max(...deliveries));
    const idleRestPenalty = restShare.reduce((a, b) => a + Math.max(0, b - 0.38), 0) * 140;
    const exhaustion = fatigueEnd.reduce((a, b) => a + Math.max(0, b - 0.8), 0) * 120;
    const collapsePenalty = collapses.reduce((a, b) => a + b, 0) * 45;
    const pendingPenalty = active * 6;

    const score = (only != null
      ? deliveries[only] * 9 + quality * workers.length * 6
      : avgDeliveries * 11 + quality * 14)
      + stats.score * 0.25
      - stats.ruined * 18
      - stats.missed * 4
      - idleRestPenalty - exhaustion - collapsePenalty - pendingPenalty
      + fairness * 12;

    fitness += score;
    detail.push({
      scenario: scenario.label,
      score: Math.round(score * 10) / 10,
      delivered: stats.delivered,
      ruined: stats.ruined,
      missed: stats.missed,
      quality: Math.round(quality * 100) / 700,
      restShare,
      fatigueEnd,
    });
    if (dataset && decisionLog.length) {
      dataset.push({ scenario: scenario.label, seed: scenario.seed, rows: decisionLog });
    }
  }
  return { fitness: fitness / scenarios.length, detail };
}

// ------------------------------------------------------------------ эволюция
function evolve({ generations, population, elites, seed, onlyWorker, baseGenome, label, scenarios }) {
  const rng = makeRng(seed);
  const size = paramCount();
  let pop = [];
  for (let i = 0; i < population; i++) {
    pop.push(i === 0 && baseGenome ? baseGenome.slice() : randomGenome(rng));
  }
  const log = [];
  let best = null;
  let bestFitness = -Infinity;

  for (let gen = 0; gen < generations; gen++) {
    const scored = pop.map((g) => ({ g, ...evaluate(g, { onlyWorker, scenarios }) }));
    scored.sort((a, b) => b.fitness - a.fitness);
    if (scored[0].fitness > bestFitness) {
      bestFitness = scored[0].fitness;
      best = scored[0].g.slice();
    }
    log.push({
      generation: gen + 1,
      best: Math.round(scored[0].fitness * 100) / 100,
      mean: Math.round((scored.reduce((a, b) => a + b.fitness, 0) / scored.length) * 100) / 100,
      worst: Math.round(scored[scored.length - 1].fitness * 100) / 100,
    });
    const sigma = 0.32 * Math.pow(0.9, gen / 3) + 0.06;
    const next = scored.slice(0, elites).map((s) => s.g.slice());
    while (next.length < population) {
      const parentA = scored[Math.floor(rng.next() * Math.min(scored.length, 10))].g;
      const parentB = scored[Math.floor(rng.next() * Math.min(scored.length, 14))].g;
      const child = new Array(size);
      for (let i = 0; i < size; i++) {
        const base = rng.next() < 0.5 ? parentA[i] : parentB[i];
        child[i] = base + (rng.next() < 0.75 ? rng.gauss() * sigma : 0);
      }
      next.push(child);
    }
    pop = next;
    if (process.env.VERBOSE) console.log(`  ${label} gen ${gen + 1}/${generations}: best ${log.at(-1).best} mean ${log.at(-1).mean}`);
  }
  return { genome: best, fitness: bestFitness, log, pop };
}

// ------------------------------------------------------------------ основной
console.log('Обучение мозга склада: признаки', IN, '→', HIDDEN.join(' → '), '→ выходы', OUT,
  '| параметров', paramCount(), '| сценариев', SCENARIOS.length);

const t0 = Date.now();
const base = evolve({
  generations: GENERATIONS,
  population: POPULATION,
  elites: ELITES,
  seed: SEED,
  label: 'базa',
});
console.log(`Базовая модель: fitness ${base.fitness.toFixed(2)} за ${((Date.now() - t0) / 1000).toFixed(1)} с`);

// Базовая линия: сколько даёт необученная сеть (для отчёта)
const baselineRng = makeRng(SEED + 5);
let baselineSum = 0;
const BASELINE_N = 6;
for (let i = 0; i < BASELINE_N; i++) baselineSum += evaluate(randomGenome(baselineRng)).fitness;
const baselineFitness = Math.round((baselineSum / BASELINE_N) * 100) / 100;
console.log(`Необученная сеть (среднее по ${BASELINE_N}): fitness ${baselineFitness}`);

// Наблюдения для датасета — прогон лучшей политики
const dataset = [];
const baseEval = evaluate(base.genome, { dataset });
console.log(`Проверка базовой модели: fitness ${baseEval.fitness.toFixed(2)}`);

const outDir = path.join(root, 'data');
mkdirSync(path.join(outDir, 'brains'), { recursive: true });
mkdirSync(path.join(outDir, 'training'), { recursive: true });

const baseModel = genomeToModel(base.genome);
baseModel.trained = {
  method: 'evolution-strategies/μ+λ',
  seeds: SEED,
  generations: GENERATIONS,
  population: POPULATION,
  fitness: Math.round(base.fitness * 100) / 100,
  scenarios: SCENARIOS.length,
  shiftSeconds: SHIFT,
  stepSeconds: DT,
  params: paramCount(),
  trainedAt: new Date().toISOString().slice(0, 10),
  dataset: 'data/brain_dataset.json',
  simulator: 'src/sim/model.js + src/sim/worker.js + src/sim/warehouse.js',
};
baseModel.evaluation = baseEval.detail;
writeFileSync(path.join(outDir, 'brain_weights.json'), JSON.stringify(baseModel));

// Персональные дообучения: короткая эволюция вокруг базовой модели
const crewBrains = [];
for (let i = 0; i < CREW.length; i++) {
  const member = CREW[i];
  const scenarios = [
    { seed: 4400 + i * 53, spawnEvery: 12, workers: [{ traits: member.traits, overrides: member.overrides }], label: 'личная смена' },
    { seed: 7700 + i * 91, spawnEvery: 10, workers: [{ traits: member.traits, overrides: Object.assign({}, member.overrides, { energy: 0.6 }) }], label: 'устал' },
  ];
  const personal = { seed: SEED + 101 * (i + 1), scenarios, onlyWorker: 0 };
  const evolved = evolve({
    generations: 9,
    population: 12,
    elites: 3,
    seed: personal.seed,
    onlyWorker: 0,
    baseGenome: base.genome,
    label: member.id,
    scenarios,
  });
  const holdout = [{ seed: 6600 + i * 29, spawnEvery: 11, workers: [{ traits: member.traits, overrides: member.overrides }], label: 'контрольная смена' }];
  const evalPersonal = evaluate(evolved.genome, { scenarios: holdout, onlyWorker: 0 });
  const model = genomeToModel(evolved.genome);
  model.person = { id: member.id, name: member.name, role: member.role, traits: Model.normalizeTraits(member.traits) };
  model.trained = {
    method: 'персональное дообучение от базовой модели (μ+λ)',
    generations: 9,
    fitness: Math.round(evolved.fitness * 100) / 100,
    validation: Math.round(evalPersonal.fitness * 100) / 100,
    base: 'data/brain_weights.json',
    trainedAt: new Date().toISOString().slice(0, 10),
  };
  writeFileSync(path.join(outDir, 'brains', member.id + '.json'), JSON.stringify(model));
  crewBrains.push({ id: member.id, name: member.name, fitness: model.trained.fitness, holdout: model.trained.validation });
  console.log(`  ${member.name}: fitness ${model.trained.fitness} / контрольная смена ${model.trained.validation}`);
}

// Датасет: снижаем объём — оставляем срез и округляем
const datasetOut = {
  format: 'warehouse-brain-dataset/1',
  createdAt: new Date().toISOString().slice(0, 10),
  features: Brain.FEATURES.map((f) => f.id),
  outputs: Brain.OUTPUTS.map((o) => o.id),
  note: 'Наблюдения обученной политики на симуляторе склада: признаки тела/нагрузки → решения (уже сглаженные), состояние автомата. Годятся для дообучения и анализа.',
  episodes: dataset.map((ep) => ({ scenario: ep.scenario, seed: ep.seed, rows: ep.rows.slice(0, 60) })),
};
const datasetJson = JSON.stringify(datasetOut);
writeFileSync(path.join(outDir, 'brain_dataset.json'), datasetJson);

const report = {
  format: 'warehouse-brain-training/1',
  createdAt: new Date().toISOString().slice(0, 10),
  seed: SEED,
  architecture: layerSizes(),
  params: paramCount(),
  population: POPULATION,
  generations: GENERATIONS,
  stepSeconds: DT,
  shiftSeconds: SHIFT,
  scenarios: SCENARIOS.map((s) => s.label),
  base: { fitness: Math.round(base.fitness * 100) / 100, validation: Math.round(baseEval.fitness * 100) / 100, baseline: baselineFitness, log: base.log },
  crew: crewBrains,
  durationSeconds: Math.round((Date.now() - t0) / 100) / 10,
  datasetRows: datasetOut.episodes.reduce((a, e) => a + e.rows.length, 0),
  datasetBytes: Buffer.byteLength(datasetJson),
};
writeFileSync(path.join(outDir, 'brain_training_log.json'), JSON.stringify(report, null, 2));
writeFileSync(path.join(outDir, 'training', 'latest.json'), JSON.stringify(report, null, 2));

console.log(`Готово за ${report.durationSeconds} с. Датасет: ${report.datasetRows} наблюдений, ${(report.datasetBytes / 1024).toFixed(0)} КБ.`);
console.log('Файлы: data/brain_weights.json, data/brains/*.json, data/brain_dataset.json, data/brain_training_log.json');
