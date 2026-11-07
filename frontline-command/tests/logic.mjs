// Логические проверки: конфиги, Command API, задержки радиосвязи, отказы, симметрия правил.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); };

const cfg = await loadConfig();
ok(Object.keys(cfg.weapons).length >= 6, 'оружие загружено из weapons.json');
ok(Object.keys(cfg.units).length >= 8, 'юниты загружены из units.json');
ok(cfg.sectors.points.length >= 14, 'точки карты загружены из sectors.json');
ok(Object.keys(cfg.templates).length >= 6, 'шаблоны отрядов загружены');
ok(Object.keys(cfg.rules).length >= 3, 'пресеты правил If→Then загружены');
ok(cfg.factions.length === 2, 'две фракции');
ok(cfg.factions[0].color === '#4a7fb5' && cfg.factions[1].color === '#b5503a', 'акценты фракций из factions.json');

for (const w of Object.values(cfg.weapons)) {
  ok(w.damage >= 0 && w.rof > 0 && w.range > 0, `оружие ${w.name}: урон/скорострельность/дальность заданы`);
}
for (const u of Object.values(cfg.units)) {
  const cost = Object.values(u.cost || {}).reduce((a, b) => a + b, 0);
  ok(cost > 0, `юнит ${u.name}: цена в конфиге (${cost})`);
}

const game = new Game({ cfg, seed: 7, difficulty: 'regular', aiVsAi: true });
ok(game.playerFaction === null, 'режим ИИ против ИИ: игрок не назначен');
ok(game.units.size > 40, `стартовые армии созданы (${game.units.size} юнитов)`);
const limit0 = game.squadLimit(0), limit1 = game.squadLimit(1);
const dir0 = game.directiveLimit(0), dir1 = game.directiveLimit(1);

// Приказы доставляются с задержкой радио: прокручиваем время до доставки
const flush = (maxS = 30) => { const end = game.time + maxS; while (game.time < end && game.api.orders.some((o) => o.status === 'queued')) game.step(0.1); };

// 1. Приказ без исполнителей отклоняется с причиной
const bad = game.api.issue({ source: 'system', type: 'hold', faction: 0, target: { x: 0, y: 0 } });
flush();
ok(bad.status === 'refused' && bad.result.length > 0, `приказ без исполнителей отклонён (${bad.result})`);

// 2. Задержка радиосвязи зависит от расстояния
const sq0 = [...game.squads.values()].find((s) => s.faction === 0);
const c = sq0.centroid();
const near = game.api.issue({ source: 'player', type: 'move', faction: 0, squadIds: [sq0.id], target: { x: c.x + 100, y: c.y } });
const far = game.api.issue({ source: 'player', type: 'move', faction: 0, squadIds: [sq0.id], target: { x: c.x + 2000, y: c.y } });
ok(near.delay > 0, `задержка ближнего приказа > 0 (${near.delay.toFixed(2)} с)`);
ok(far.delay > near.delay, 'дальний приказ идёт дольше ближнего');

// 3. Отказ при нехватке ресурсов
const stock = game.logistics.stock[0];
const backup = { ...stock };
for (const k of Object.keys(stock)) stock[k] = 0;
const before = [...game.squads.values()].length;
const noRes = game.api.issue({ source: 'player', type: 'create_squad', faction: 0, target: { x: 0, y: 0 }, params: { templateId: 'assault' } });
flush(60);
ok(noRes.status === 'refused' && noRes.result.length > 0, `создание отряда отклоняется с причиной (${noRes.result})`);
Object.assign(stock, backup);

// 4. Журнал приказов фиксирует источник и результат
ok(game.api.journal.length > 0 && game.api.journal.every((j) => j.sourceLabel && j.result !== undefined && j.result !== ''), 'журнал приказов: источник + результат');

// 5. Симметрия правил: одинаковые лимиты и оружие у обеих фракций
ok(limit0 === limit1 && limit0 > 0, `лимит отрядов одинаков для фракций (${limit0})`);
ok(dir0 === dir1 && dir0 > 0, `лимит директив одинаков (${dir0})`);
const sameWeapons = Object.values(cfg.units).every((u) => cfg.weapons[u.weapon]);
ok(sameWeapons, 'все юниты используют оружие из общего конфига');

// 6. Победа считается по домашней принадлежности штаба (данные, не хардкод)
const hq0 = game.world.homeHQ(0);
ok(hq0 && hq0.home === 0, 'домашний штаб фракции 0 определён');
game.world.homeHQ(1).owner = 0;
game.checkVictory();
ok(game.warOver && game.outcome.winner === 0, `захват штаба завершает войну (${game.outcome && game.outcome.reason})`);

console.log(fails ? `\nПРОВАЛЕНО: ${fails}` : '\nвсе логические проверки пройдены');
process.exit(fails ? 1 : 0);
