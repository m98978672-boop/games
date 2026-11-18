// Проверка моста route-engine ↔ RatCore: экспорт графа движка и маршрут по нему.
// Запуск: node route-engine/tests/ratcore-bridge.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';
import { createSnapshot, beginSearch } from '../src/router.mjs';
import { snapshotFromRatCoreExport, routeOnRatCoreExport, RATCORE_UNITS } from '../src/ratcore-bridge.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let failed = 0;
const ok = (cond, msg) => { if (cond) console.log('  ✓ ' + msg); else { console.error('  ✗ ' + msg); failed++; } };

console.log('route-engine ↔ RatCore — мост');

const sandbox = {
  console, performance, TextEncoder, TextDecoder,
  Uint8Array, Float32Array, Int32Array, Uint16Array, Uint32Array, Int16Array, Int8Array,
  Uint8ClampedArray, Float64Array, ArrayBuffer, DataView, navigator: { hardwareConcurrency: 4 },
};
sandbox.window = sandbox; sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(readFileSync(join(ROOT, 'ratcore/ratcore.bundle.js'), 'utf8'), sandbox);
const RC = sandbox.RatCore;
ok(Boolean(RC && RC.createEngine), 'движок RatCore загружен из собранного бандла');

const engine = RC.createEngine({ preset: 'balanced', packs: [], seed: 5 });
engine.tools.build.addNode({ id: 'hq', x: 0, y: 0, h: 1 });
engine.tools.build.addNode({ id: 'gate', x: 40, y: 0, h: 1 });
engine.tools.build.addNode({ id: 'yard', x: 40, y: 30, h: 2 });
engine.tools.build.connectRoad({ id: 'r-hq-gate', from: 'hq', to: 'gate' });
engine.tools.build.connectRoad({ id: 'r-gate-yard', from: 'gate', to: 'yard' });

const exported = engine.tools.save.exportJson();
const snapshot = snapshotFromRatCoreExport(exported);
ok(snapshot.nodes.length === 3, 'снимок отдаёт все 3 узла движка (копии)');
ok(snapshot.edges.length === 4, 'снимок разворачивает 2 двусторонние дороги в 4 ребра');
ok(snapshot.nodes.every((id) => typeof id === 'string'), 'список узлов — строковые ID для route-engine');
ok(snapshot.nodeInfo.hq.units.x === RATCORE_UNITS.x, 'единицы координат RatCore зафиксированы явно в nodeInfo');
ok(snapshot.nodeInfo.yard.h === 2, 'высота узла переносится из движка без потерь');

// Живой мир движка не меняется от снятия снимка
const before = JSON.stringify(engine.tools.save.exportJson().data);
snapshotFromRatCoreExport(engine.tools.save.exportJson());
const after = JSON.stringify(engine.tools.save.exportJson().data);
ok(before === after, 'живой мир движка не изменяется при снятии снимка');

const route = routeOnRatCoreExport(exported, { createSnapshot, beginSearch }, { from: 'hq', to: 'yard' });
ok(route.status === 'found', 'route-engine находит маршрут по графу RatCore');
ok(JSON.stringify(route.nodes) === JSON.stringify(['hq', 'gate', 'yard']), 'порядок узлов маршрута верный: hq → gate → yard');
ok(route.cost > 0, 'стоимость маршрута посчитана (' + route.cost.toFixed(2) + ' м)');
ok(route.changedWorld === false, 'роутер НЕ меняет мир: действия остаются хосту движка');

// Заблокированная неоткрываемая дверь закрывает путь
const blockedExport = JSON.parse(JSON.stringify(exported.data));
blockedExport.edges.find((e) => e.id === 'r-gate-yard').portal = {
  id: 'yard-gate', kind: 'door', state: 'blocked', width: 3, openable: false, openCost: 0,
};
const blocked = routeOnRatCoreExport(blockedExport, { createSnapshot, beginSearch }, { from: 'hq', to: 'yard', revision: 'rev-blocked' });
ok(blocked.status !== 'found', 'заблокированная дверь не даёт маршрут (статус: ' + blocked.status + ')');

// Закрытая, но открываемая дверь — маршрут есть, и в нём есть действие открытия
const closedExport = JSON.parse(JSON.stringify(exported.data));
closedExport.edges.find((e) => e.id === 'r-gate-yard').portal = {
  id: 'yard-gate', kind: 'door', state: 'closed', width: 6, openable: true, openCost: 2,
};
const closed = routeOnRatCoreExport(closedExport, { createSnapshot, beginSearch }, { from: 'hq', to: 'yard', revision: 'rev-closed' });
ok(closed.status === 'found', 'закрытая открываемая дверь не блокирует маршрут');
ok(Array.isArray(closed.actions) && closed.actions.length === 1 && closed.actions[0].action === 'open-and-cross',
  'маршрут предлагает действие «открыть и пройти» (мир при этом не меняется)');

// Неизвестный узел — понятный отказ, без исключения
const missing = routeOnRatCoreExport(exported, { createSnapshot, beginSearch }, { from: 'hq', to: 'moon' });
ok(missing.status === 'no-such-node', 'неизвестный узел даёт статус no-such-node');

if (failed) { console.error(`\n✗ Провалено: ${failed}`); process.exit(1); }
console.log('\n✓ Мост route-engine ↔ RatCore работает: экспорт графа и маршрут по движку.');
