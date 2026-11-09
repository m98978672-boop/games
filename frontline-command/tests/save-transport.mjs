// ALG-21: груз и рейс существующей логистики при сохранении/загрузке.
// Это не реализация новых ящиков, пассажиров или полной бухгалтерии.
import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { Save } from '../src/core/save.js';

const store = new Map();
globalThis.localStorage = {
  getItem: (key) => store.get(key) ?? null,
  setItem: (key, value) => store.set(key, value),
  removeItem: (key) => store.delete(key),
};
const cfg = await loadConfig();
const options = { cfg, seed: 71, aiVsAi: true };
const source = new Game(options);
source.logistics.requests = [];
const trucks = [0, 1].map((f) => source.logistics.trucksOf(f)[0]);
const otherTruck = source.logistics.trucksOf(0)[1];
const unqueuedTruck = source.logistics.trucksOf(1)[1];
const requests = trucks.map((t, f) => {
  const sector = source.world.sectorAt(t.x, t.y);
  return { faction: f, kind: 'sector', sectorId: sector.id, x: t.x + 300, y: t.y + 200, created: 9, priority: 1 };
});
source.time = 31.125;
source.logistics.productionAcc = 0.75;
source.logistics.supplyAcc = 0.5;
source.logistics.requestAcc = 3.25;
source.logistics.resupplyAcc = 1.5;
source.logistics.priorities = ['build', 'supply'];
source.logistics.delivered = [2, 3];
source.logistics.lastTank = [15, 16];
source.logistics.alertCooldown = [4, 5];
source.logistics.sectorSupply[0].set(requests[0].sectorId, 0.125);
source.logistics.sectorSupply[1].set(requests[1].sectorId, 0.375);
source.logistics.requests.push(...requests);
for (let i = 0; i < 2; i++) source.logistics.assignTruck(trucks[i], requests[i]);
// Первый грузовик уже забрал груз, второй ещё движется к источнику.
source.logistics.loadTruck(trucks[0], trucks[0].truckTask);
assert.ok(trucks[0].cargo > 0);
assert.equal(trucks[0].truckTask.state, 'toTarget');
assert.equal(trucks[1].truckTask.state, 'toSource');
// Существующая симуляция допускает разделение одной заявки машинами;
// сохранение не должно превращать её в два разных объекта.
otherTruck.truckTask = { ...trucks[0].truckTask };
otherTruck.goal = { ...trucks[0].goal };
otherTruck.cargo = 0;
const unqueued = { ...requests[1], x: requests[1].x + 25, created: 10 };
source.logistics.assignTruck(unqueuedTruck, unqueued);
assert.ok(!source.logistics.requests.includes(unqueued), 'рейс может ссылаться на уже удалённую заявку');
source.logistics.requests.push(requests[0]);
const stockAtSave = structuredClone(source.logistics.stock);

cfg.flags.alg_save = false;
assert.equal(Save.saveWar(source), true);
const legacySave = Save.loadWar();
assert.equal(legacySave.saveExt, undefined);
const legacy = new Game(options);
Save.applyWar(legacy, legacySave);
const legacyTruck = legacy.unitById(trucks[0].id);
assert.equal(legacyTruck.cargo, 0, 'старый формат теряет груз');
assert.equal(legacyTruck.truckTask, undefined, 'старый формат теряет рейс');
assert.equal(legacy.logistics.requests.length, 0, 'старый формат теряет заявки');

cfg.flags.alg_save = true;
assert.equal(Save.saveWar(source), true);
const saved = Save.loadWar();
const loaded = new Game(options);
assert.equal(Save.applyWar(loaded, saved), true);
assert.deepEqual(loaded.logistics.stock, stockAtSave, 'запасы обеих сторон сохранены без повторного списания');
for (const key of ['productionAcc', 'supplyAcc', 'requestAcc', 'resupplyAcc', 'priorities', 'delivered', 'lastTank', 'alertCooldown', 'sectorSupply']) {
  assert.deepEqual(loaded.logistics[key], source.logistics[key], `${key} логистики сохранён`);
}
const a = loaded.unitById(trucks[0].id), b = loaded.unitById(trucks[1].id), c = loaded.unitById(otherTruck.id);
assert.equal(a.cargo, trucks[0].cargo);
assert.equal(a.cargoType, 'ammo');
assert.equal(a.truckTask.state, 'toTarget');
assert.equal(a.truckTask.amount, trucks[0].truckTask.amount);
assert.deepEqual(a.goal, trucks[0].goal);
assert.equal(b.truckTask.state, 'toSource');
assert.deepEqual(b.goal, trucks[1].goal);
assert.strictEqual(a.truckTask.source, loaded.world.pointById(trucks[0].truckTask.source.id), 'источник — объект нового мира');
assert.strictEqual(b.truckTask.source, loaded.world.pointById(trucks[1].truckTask.source.id));
assert.strictEqual(a.truckTask.request, loaded.logistics.requests[0], 'машина и очередь разделяют объект заявки');
assert.strictEqual(c.truckTask.request, a.truckTask.request, 'ссылка второй машины на ту же заявку сохранена');
assert.strictEqual(loaded.logistics.requests[2], loaded.logistics.requests[0], 'повторная ссылка в очереди сохранена');
assert.strictEqual(b.truckTask.request, loaded.logistics.requests[1]);
const restoredUnqueued = loaded.unitById(unqueuedTruck.id).truckTask.request;
assert.deepEqual(restoredUnqueued, unqueued, 'ссылка вне очереди не теряется');
assert.ok(!loaded.logistics.requests.includes(restoredUnqueued), 'отсутствующая в очереди заявка туда не добавляется');

const ammoBefore = loaded.logistics.stock[1].ammo, fuelBefore = loaded.logistics.stock[1].fuel;
loaded.logistics.loadTruck(b, b.truckTask);
assert.ok(b.cargo > 0 && b.truckTask.state === 'toTarget', 'второй рейс может загрузиться');
assert.equal(loaded.logistics.stock[1].ammo, ammoBefore - b.cargo);
assert.equal(loaded.logistics.stock[1].fuel, fuelBefore - 4);
const firstRequest = a.truckTask.request;
loaded.logistics.unloadTruck(a, a.truckTask);
assert.equal(a.cargo, 0, 'груз разгружен');
assert.equal(a.truckTask.state, 'idleTruck');
assert.equal(loaded.logistics.delivered[0], 3);
assert.equal(loaded.logistics.requests.filter((r) => r === firstRequest).length, 1, 'удалена одна исходная ссылка, как в legacy');
loaded.logistics.unloadTruck(b, b.truckTask);
assert.equal(loaded.logistics.delivered[1], 4);
assert.ok(!loaded.logistics.requests.some((r) => r.faction === 1));

// Настоящий update логистики после загрузки: грузовик в зоне разгрузки,
// без других машин и врагов. Положение не меняется скачком.
const resumed = new Game(options);
Save.applyWar(resumed, saved);
const resumedTruck = resumed.unitById(trucks[0].id);
resumedTruck.truckTask.request.x = resumedTruck.x + 50;
resumedTruck.truckTask.request.y = resumedTruck.y;
resumedTruck.goal = { x: resumedTruck.x + 50, y: resumedTruck.y };
resumed.logistics.trucksOf = (f) => f === resumedTruck.faction ? [resumedTruck] : [];
resumed.nearbyEnemies = () => [];
const oldX = resumedTruck.x, oldY = resumedTruck.y;
resumed.time += 0.05;
resumed.logistics.moveTrucks(0.05);
assert.equal(resumedTruck.cargo, 0, 'рейс завершается обычным update');
assert.equal(resumedTruck.truckTask.state, 'idleTruck');
assert.equal(resumed.logistics.delivered[0], 3);
assert.ok(Math.hypot(resumedTruck.x - oldX, resumedTruck.y - oldY) <= resumedTruck.speed * 0.05 * 1.5 + 1e-9);

// Новый читатель принимает прежнее расширение, в котором рейсов не было.
const oldExt = structuredClone(saved);
delete oldExt.saveExt.transport;
assert.equal(Save.applyWar(new Game(options), oldExt), true);
assert.equal(Save.applyWar(new Game(options), legacySave), true);

// Повреждённый источник не должен связываться с чужой точкой или
// перезаписываться новой задачей: груз остаётся на стоянке.
const broken = structuredClone(saved);
const damaged = broken.saveExt.transport.trucks.find((t) => t.id === trucks[0].id);
damaged.task.source = 'missing';
const originalWarn = console.warn;
const warnings = [];
console.warn = (...args) => warnings.push(args.join(' '));
let safe;
try {
  safe = new Game(options);
  assert.equal(Save.applyWar(safe, broken), true);
} finally { console.warn = originalWarn; }
assert.equal(safe.unitById(trucks[0].id).cargo, trucks[0].cargo);
assert.equal(safe.unitById(trucks[0].id).truckTask.state, 'idleTruck');
assert.equal(safe.unitById(trucks[0].id).goal, null);
assert.ok(warnings.some((w) => w.includes('повреждён рейс')));
assert.equal(safe.unitById(trucks[1].id).truckTask.state, 'toSource');

// Некорректные ID бойцов не должны перенаправить рейсы на других.
const duplicateId = structuredClone(saved);
duplicateId.units[1].id = duplicateId.units[0].id;
const fallback = new Game(options);
Save.applyWar(fallback, duplicateId);
assert.equal(fallback.logistics.requests.length, 0);
assert.ok(fallback.logistics.trucksOf(0).every((t) => !t.truckTask));
console.log(`рейсы и груз: legacy потерял груз ${trucks[0].cargo} и 2 заявки, alg_save восстанавливает обе стороны, ссылки и списание; повреждённый рейс припаркован`);
