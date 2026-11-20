// Собирает data/brain-data.js — мозги «в коде», чтобы игра запускалась даже
// когда fetch() недоступен (открытие index.html с диска, file://).
//
// Запуск: node warehouse-crew/tools/embed-brains.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = (rel) => JSON.parse(readFileSync(path.join(root, rel), 'utf8'));

const base = read('data/brain_weights.json');
const brains = {};
for (const id of ['marta', 'grisha', 'timur']) {
  const rel = 'data/brains/' + id + '.json';
  if (existsSync(path.join(root, rel))) brains[id] = read(rel);
}
const log = existsSync(path.join(root, 'data/brain_training_log.json'))
  ? read('data/brain_training_log.json')
  : null;

const payload = {
  format: 'warehouse-brain-bundle/1',
  createdAt: new Date().toISOString().slice(0, 10),
  base,
  brains,
  log,
};

const out = '// Сгенерировано tools/embed-brains.mjs — правки в data/*.json, потом пересобрать.\n' +
  '// Нужен, чтобы мозги грузились без fetch (file://, архив, офлайн).\n' +
  'window.WC_BRAINS = ' + JSON.stringify(payload) + ';\n';

writeFileSync(path.join(root, 'data/brain-data.js'), out);
console.log('data/brain-data.js:', Math.round(out.length / 1024) + ' КБ,',
  Object.keys(brains).length, 'личных мозгов + база');
