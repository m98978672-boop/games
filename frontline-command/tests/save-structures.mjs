// ALG-21: загрузка живых/разрушенных структур точек и их HP.
import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { Save } from '../src/core/save.js';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, v),
  removeItem: (k) => store.delete(k),
};
const cfg = await loadConfig();
const options = { cfg, seed: 83, aiVsAi: true };
const game = new Game(options);
game.units.clear(); game.unitGrid.clear();
game.time = 100;
const live = game.world.points.find((p) => p.type === 'city' && p.owner === 0);
const liveOpposite = game.world.points.find((p) => p.type === 'city' && p.owner === 1);
const ruined = game.world.points.find((p) => p.type === 'farm');
assert.ok(live && liveOpposite && ruined);
const buildingHp = Math.round(live.structure.maxHp * 0.6);
live.structure.hp = buildingHp;
liveOpposite.structure.hp = Math.round(liveOpposite.structure.maxHp * 0.75);
liveOpposite.hp = 888;
game.world.damageBuilding(ruined.structure, ruined.structure.hp + 1);
// Дополнительное укрепление с тем же pointId не является основной структурой.
const defense = game.world.addBuilding({ type: 'bunker', x: live.x + 300, y: live.y - 100, faction: 0, instant: true, pointId: live.id });
defense.hp = Math.round(defense.maxHp * 0.4);
live.hp = 777;
live.capture = 0;
ruined.capture = 0;
game.spawnUnit(1, 'infantry', live.x, live.y);
game.spawnUnit(0, 'infantry', liveOpposite.x, liveOpposite.y);
game.spawnUnit(0, 'infantry', ruined.x, ruined.y);

cfg.flags.alg_save = false;
assert.ok(Save.saveWar(game));
const legacySave = Save.loadWar();
const legacy = new Game(options);
assert.ok(Save.applyWar(legacy, legacySave));
const expectedLivePoints = game.world.points.filter((p) => p.structure && !p.structure.dead);
const legacyBroken = expectedLivePoints.filter((p) => legacy.world.pointById(p.id).structure.dead).length;
assert.equal(legacyBroken, expectedLivePoints.length);
const oldPoint = legacy.world.pointById(live.id);
assert.ok(oldPoint.structure.dead, 'старая ссылка указывает на удалённую стартовую структуру');
assert.notEqual(oldPoint.hp, live.hp, 'старый загрузчик сбрасывает HP точки при создании зданий');
const oldBuilding = legacy.world.buildings.find((b) => !b.dead && b.type === live.type && b.x === live.x && b.y === live.y);
assert.equal(oldBuilding.hp, oldBuilding.maxHp, 'старый загрузчик чинит повреждённую структуру');
legacy.influence.updateCapture();
assert.equal(oldPoint.capture, 0, 'старая мёртвая ссылка запрещает захват живой точки');

cfg.flags.alg_save = true;
assert.ok(Save.saveWar(game));
const saved = Save.loadWar();
const loaded = new Game(options);
assert.ok(Save.applyWar(loaded, saved));
const repairedBroken = expectedLivePoints.filter((p) => loaded.world.pointById(p.id).structure.dead).length;
assert.equal(repairedBroken, 0);
const point = loaded.world.pointById(live.id);
const structure = point.structure;
assert.ok(structure && !structure.dead && structure.built, 'живая структура восстановлена');
assert.equal(structure.type, live.type);
assert.equal(structure.x, live.x);
assert.equal(structure.y, live.y);
assert.strictEqual(structure.point, point, 'двусторонняя ссылка относится к новому миру');
assert.strictEqual(loaded.world.buildingAtPoint(point.id), structure);
assert.equal(structure.hp, buildingHp, 'сохранённое HP структуры не заменено максимальным');
assert.equal(point.hp, live.hp, 'HP точки и HP структуры восстанавливаются независимо');
const actualDefense = loaded.world.buildings.find((b) => !b.dead && b.type === 'bunker' && b.pointId === live.id);
assert.ok(actualDefense && actualDefense !== structure, 'укрепление не стало главной структурой');
assert.equal(actualDefense.hp, defense.hp, 'HP обычной постройки сохранено');
const oppositePoint = loaded.world.pointById(liveOpposite.id);
assert.ok(!oppositePoint.structure.dead);
assert.equal(oppositePoint.structure.hp, liveOpposite.structure.hp);
assert.equal(oppositePoint.hp, liveOpposite.hp);
const destroyedPoint = loaded.world.pointById(ruined.id);
assert.equal(destroyedPoint.hp, 0);
assert.ok(destroyedPoint.structure.dead, 'разрушенная структура не воскресла');
loaded.influence.updateCapture();
assert.ok(point.capture > 0 && oppositePoint.capture > 0, 'живые точки обеих сторон снова допускают захват');
assert.equal(destroyedPoint.capture, 0, 'разрушенная точка по-прежнему недоступна для захвата');
loaded.world.damageBuilding(structure, structure.hp + 1, 1);
assert.equal(point.hp, 0, 'после загрузки разрушение живой структуры связано со своей точкой');
assert.ok(structure.dead);

// Расширение старой версии без новых полей также исправляет ссылки, если alg_save включён.
const oldFormat = new Game(options);
assert.ok(Save.applyWar(oldFormat, legacySave));
assert.ok(!oldFormat.world.pointById(live.id).structure.dead);
console.log(`постройки: мёртвые ссылки живых точек ${legacyBroken}/${expectedLivePoints.length} → ${repairedBroken}/${expectedLivePoints.length}; HP и захват сохранены, разрушенная не воскресает`);
