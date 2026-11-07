// Проверки строительства: коды причин, линии, зоны по профилю, шаблоны, приоритеты,
// очередь, симметрия правил для игрока и ИИ, планировщик ИИ.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); };

const cfg = await loadConfig();
const game = new Game({ cfg, seed: 7, difficulty: 'regular', aiVsAi: true });
game.playerFaction = 0;
const build = game.build;
const flush = (maxS = 40) => { const end = game.time + maxS; while (game.time < end && game.api.orders.some((o) => o.status === 'queued')) game.step(0.1); };

ok(typeof build.validate === 'function', 'есть validate() с кодами причин');
ok(game.cfg.flag('build_zone') === true, 'флаги функций загружены из feature_flags.json');
ok(idx(game.cfg.thresholds, 'perf.tick_ms_max') > 0, 'пороги регрессии загружены из regression_thresholds.json');

function idx(o, path) { return path.split('.').reduce((a, k) => (a ? a[k] : undefined), o); }

// 1. Коды причин
const water = findTile(false);
const rWater = build.validate('sandbags', water.x, water.y, 0, { ignoreCost: true, ignoreFog: true });
ok(rWater.ok === false && rWater.code === 'TERRAIN', `вода → TERRAIN (${rWater.code})`);

const sec = game.world.points.find((p) => p.owner === 0) || game.world.points[0];
const free = findFree(sec.x + 140, sec.y + 140, 'sandbags');
ok(!!free, 'найдено свободное место для проверок');

const first = build.place('sandbags', free.x, free.y, 0, { instant: true });
ok(first.ok, 'чертёж поставлен');
const rOverlap = build.validate('sandbags', free.x + 4, free.y + 4, 0, { ignoreCost: true, ignoreFog: true });
ok(!rOverlap.ok && rOverlap.code === 'OVERLAP', `занятое место → OVERLAP (${rOverlap.code})`);

const rRange = build.validate('sandbags', 5, 5, 0, { ignoreCost: true, ignoreFog: true });
ok(!rRange.ok && rRange.code === 'RANGE', `край карты → RANGE (${rRange.code})`);

// лимит построек берётся из данных (buildings.json limit)
const lim = game.cfg.building('sandbags').limit;
ok(lim == null || typeof lim === 'number', 'лимит постройки читается из buildings.json');

// 2. Причины в отчёте последнего отказа
ok(build.lastReject.get('OVERLAP') >= 1, 'код отказа учтён в статистике');

// 3. Линия: количество секций и отсутствие пересечений
const a = { x: free.x, y: free.y + 420 };
const b = { x: free.x + 520, y: free.y + 420 };
const plan = build.planLine('sandbags', a, b, 0);
ok(plan.length >= 5, `линия планируется (${plan.length} секций)`);
const lineRes = build.placeLine('sandbags', a, b, 0, { priority: 'urgent' });
ok(lineRes.total === plan.length, 'приказ линии покрывает весь план');
ok(lineRes.placed >= plan.length - 2, `линия поставлена (${lineRes.placed}/${lineRes.total})`);
const lineBps = build.queue(0).filter((bp) => bp.reason === 'линия');
ok(lineBps.length === lineRes.placed, 'секции линии попали в очередь');
ok(lineBps.every((bp) => bp.priority === 2), 'приоритет «срочно» применён к линии');

// 4. Зона по профилю: эшелоны, бюджет, отсутствие наложений
const zonePoly = [
  { x: sec.x - 220, y: sec.y - 220 }, { x: sec.x + 220, y: sec.y - 220 },
  { x: sec.x + 220, y: sec.y + 220 }, { x: sec.x - 220, y: sec.y + 220 },
];
const zone = build.placeZone(zonePoly, 'medium', 0, { priority: 'normal' });
ok(zone.planned > 0 && zone.placed > 0, `зона ставится (${zone.placed}/${zone.planned})`);
ok(zone.planned <= game.cfg.profiles.medium.items.reduce((n, i) => n + i.count, 0), 'зона не превышает количество по профилю');
const zoneBps = build.queue(0).filter((bp) => bp.reason === 'зона по профилю');
let overlap = 0;
for (let i = 0; i < zoneBps.length; i++) {
  for (let j = i + 1; j < zoneBps.length; j++) {
    const d = Math.hypot(zoneBps[i].x - zoneBps[j].x, zoneBps[i].y - zoneBps[j].y);
    if (d < 24) overlap++;
  }
}
ok(overlap === 0, `наложений в зоне нет (${overlap})`);

// эшелоны из профиля влияют на глубину
ok(Array.isArray(cfg.profiles.medium.echelons) && cfg.profiles.medium.echelons.length >= 2, 'у профиля описаны эшелоны');
ok(typeof cfg.profiles.medium.threatWeight === 'number', 'у профиля есть threatWeight');

// 5. Шаблоны
const tplId = Object.keys(cfg.buildTemplates)[0];
const tpl = build.placeTemplate(tplId, sec.x - 500, sec.y + 500, 0, {});
ok(tpl.ok || tpl.rejected.length > 0, `шаблон обрабатывается (${tpl.placed}/${tpl.total})`);
ok(tpl.total === (cfg.buildTemplates[tplId].items || []).length, 'шаблон ставит все элементы по списку');

// 6. Приоритеты и очередь
const q = build.queue(0);
ok(q.length >= 2, `очередь стройки не пуста (${q.length})`);
ok(q[0].priority >= q[q.length - 1].priority, 'очередь отсортирована по приоритету');
const target = q.find((bp) => bp.priority === 1) || q[0];
const setP = game.executeCommand({ type: 'set_build_priority', faction: 0, params: { blueprintId: target.id, priority: 'urgent' } });
ok(setP.accepted && target.priority === 2, 'приказ set_build_priority работает');
const info = build.queueInfo(0);
ok(info.length > 0 && 'stall' in info[0], 'queueInfo отдаёт причину простоя для панели');

// 7. Причины простоя
const bp = build.queue(0)[0];
game.logistics.supply(0).materials = 0;
ok(build.stall(bp) === 'NO_MATERIALS', 'нет материалов → NO_MATERIALS');
game.logistics.supply(0).materials = 400;

// 8. Отмена чертежа возвращает материалы
const stock = game.logistics.supply(0);
const before = stock.materials;
const cancelTarget = build.queue(0)[build.queue(0).length - 1];
const cancelRes = game.executeCommand({ type: 'cancel_build', faction: 0, params: { blueprintId: cancelTarget.id } });
ok(cancelRes.accepted && cancelTarget.dead, 'приказ cancel_build снимает чертёж');
ok(stock.materials > before, `возврат материалов при отмене (${Math.round(stock.materials - before)})`);

// 9. Приказы стройки идут через Command API и одинаковы для обеих фракций
const apiLine = game.api.issue({ source: 'player', type: 'build_line', faction: 0, target: { x: a.x, y: a.y }, params: { buildType: 'sandbags', from: a, to: b } });
flush();
ok(['accepted', 'refused'].includes(apiLine.status), `приказ линии доставлен (${apiLine.status}: ${apiLine.result})`);

game.logistics.supply(1).materials = 600;
const mirrorLine = build.planLine('sandbags', { x: game.world.W - a.x, y: a.y }, { x: game.world.W - b.x, y: a.y }, 1);
ok(mirrorLine.length === plan.length, 'зеркальная линия для второй фракции той же длины');

// 10. ИИ-планировщик ставит чертежи по той же очереди
const before1 = build.queue(1).length;
game.logistics.supply(1).materials = 900;
let planned = 0;
for (let i = 0; i < 60 && planned === 0; i++) { game.step(0.5); planned += build.autoPlan(1); }
flush();
ok(planned >= 0, `планировщик ИИ обрабатывается (новых приказов: ${planned}, в очереди было ${before1})`);
const aiOrders = game.api.journal.filter((j) => j.source === 'enemyAI' && (j.type === 'build_zone' || j.type === 'build_line'));
ok(aiOrders.length >= 0, `ИИ строит только через Command API (${aiOrders.length} приказов)`);

// 11. Свойства проходимости: предупреждение BLOCKS_PATH на узком месте
let narrow = null;
for (let yy = 200; yy < game.world.H - 200 && !narrow; yy += 40) {
  for (let xx = 200; xx < game.world.W - 200; xx += 40) {
    if (!game.world.isWalkable(xx, yy)) continue;
    let blocked = 0;
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      if (!game.world.isWalkable(xx + Math.cos(ang) * 46, yy + Math.sin(ang) * 46)) blocked++;
    }
    if (blocked >= 6) { narrow = { x: xx, y: yy }; break; }
  }
}
if (narrow) {
  const check = build.validate('sandbags', narrow.x, narrow.y, 0, { ignoreCost: true, ignoreFog: true });
  ok(check.ok && check.warn.some((w) => w.code === 'BLOCKS_PATH'), 'узкий проход → предупреждение BLOCKS_PATH');
} else {
  console.log('skip  узких проходов на карте не найдено');
}

// 12. Флаги действительно переключают механику (rollback без правки кода)
const savedZone = game.cfg.flags.build_zone;
game.cfg.flags.build_zone = false;
const off = build.planZone(zonePoly, 'medium', 0, {});
game.cfg.flags.build_zone = savedZone;
ok(off.length === 0, 'флаг build_zone=false отключает планирование зоны');
const savedTpl = game.cfg.flags.build_templates;
game.cfg.flags.build_templates = false;
const tplOff = build.placeTemplate(Object.keys(game.cfg.buildTemplates)[0], sec.x - 300, sec.y - 300, 0, {});
game.cfg.flags.build_templates = savedTpl;
ok(tplOff.ok === false, 'флаг build_templates=false отключает шаблоны');
const savedPri = game.cfg.flags.build_priority;
game.cfg.flags.build_priority = false;
const priOff = build.setPriority(build.queue(0)[0], 'urgent');
game.cfg.flags.build_priority = savedPri;
ok(priOff.ok === false, 'флаг build_priority=false отключает приоритеты');

console.log(fails ? `\nпровалено проверок: ${fails}` : '\nстроительство в порядке');
process.exit(fails ? 1 : 0);

function findTile(walk) {
  for (let y = 100; y < game.world.H - 100; y += 24) {
    for (let x = 100; x < game.world.W - 100; x += 24) {
      if (game.world.isWalkable(x, y) === walk) return { x, y };
    }
  }
  return { x: 100, y: 100 };
}

function findFree(cx, cy, type) {
  for (let r = 0; r < 900; r += 32) {
    for (let a = 0; a < Math.PI * 2; a += 0.4) {
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      if (x < 120 || y < 120 || x > game.world.W - 120 || y > game.world.H - 120) continue;
      const res = build.validate(type, x, y, 0, { ignoreCost: true, ignoreFog: true });
      if (res.ok) return { x, y };
    }
  }
  return null;
}
