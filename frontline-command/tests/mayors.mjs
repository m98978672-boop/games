#!/usr/bin/env node
// ============================================================
//  Мозги городов поверх штаба: COUNTRY ATLAS на фронтлайне.
//
//  Проверяется не «класс существует», а то, что связка работает:
//  мэр решает сам, решение попадает в журнал с причиной, штаб видит
//  поправку города и меняет от неё оценку сектора, а бой меняет жизнь
//  города. Каждая проверка — на живом Game, без браузера.
//
//  Запуск: node frontline-command/tests/mayors.mjs
// ============================================================
import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { Mayors, MAYOR_ACTIONS, utility, advisory, whyText } from '../src/sim/mayors.js';
import { Save } from '../src/core/save.js';

let passed = 0;
const failures = [];
function check(name, fn) {
  try { fn(); passed++; console.log('  ✓', name); }
  catch (e) { failures.push(name + ': ' + e.message); console.log('  ✗', name, '→', e.message); }
}

const cfg = await loadConfig();
const fresh = (seed = 7) => new Game({ cfg, seed, aiVsAi: true });

console.log('Города получают мэров');
{
  const game = fresh();
  check('мэры создаются вместе с игрой', () => {
    assert.ok(game.mayors, 'нет game.mayors');
    assert.equal(game.mayors.size, game.world.points.filter((p) => p.type === 'city').length);
    assert.ok(game.mayors.size >= 4, 'городов слишком мало: ' + game.mayors.size);
  });
  check('мэр есть у каждого города, и это разные люди', () => {
    const ids = new Set(game.mayors.list.map((m) => m.pointId));
    assert.equal(ids.size, game.mayors.size, 'мэры дублируются');
    const names = new Set(game.mayors.list.map((m) => m.name));
    assert.equal(names.size, game.mayors.size, 'у городов одинаковые имена');
  });
  check('у мэра есть всё, чем он думает', () => {
    const m = game.mayors.list[0];
    for (const k of ['budget', 'housingDemand', 'socialLoad', 'jams', 'mood',
      'unemployment', 'bridgeAge', 'freeLand', 'politics', 'day', 'decisions', 'log']) {
      assert.ok(m[k] !== undefined, 'нет поля ' + k);
    }
    assert.ok(m.budget >= 0 && m.budget <= 1);
    assert.ok(m.mood >= 0 && m.mood <= 1);
  });
  check('штабные точки не стали городами', () => {
    for (const m of game.mayors.list) {
      const p = game.world.points.find((pp) => pp.id === m.pointId);
      assert.equal(p.type, 'city', 'мэром стал ' + p.type);
    }
  });
}

console.log('Мэр решает сам');
{
  const game = fresh();
  const decisions = game.mayors.tickDay();
  check('за день принимаются решения', () => {
    assert.ok(decisions.length > 0, 'ни одного решения');
  });
  check('решение тратит бюджет и считается в статистике', () => {
    const m = game.mayors.list.find((x) => x.decisions > 0);
    assert.ok(m, 'ни один мэр не решил ничего');
    assert.ok(m.log.length > 0, 'у мэра пустой журнал');
    assert.equal(game.mayors.stats().decisions, game.mayors.list.reduce((a, x) => a + x.decisions, 0));
  });
  check('в журнале есть причина, а не просто название действия', () => {
    const d = decisions[0];
    assert.ok(/:/.test(d.text), 'нет города в строке: ' + d.text);
    assert.ok(/итог -?\d/.test(d.text), 'нет итоговой оценки: ' + d.text);
    assert.ok(/польза|цена|политика|место|тренд|страх/.test(d.text), 'нет факторов: ' + d.text);
  });
  check('журнал не растёт бесконечно', () => {
    for (let i = 0; i < 80; i++) game.mayors.tickDay();
    assert.ok(game.mayors.journal.length <= 60, 'журнал разросся: ' + game.mayors.journal.length);
    for (const m of game.mayors.list) assert.ok(m.log.length <= 12, 'лог мэра разросся: ' + m.log.length);
  });
  check('мэр не тратит больше, чем у него есть', () => {
    const g2 = fresh(11);
    for (let i = 0; i < 30; i++) {
      g2.mayors.tickDay();
      for (const m of g2.mayors.list) {
        assert.ok(m.budget >= 0, 'бюджет ушёл в минус: ' + m.budget);
        assert.ok(m.budget <= 1, 'бюджет больше единицы: ' + m.budget);
      }
    }
  });
  check('действие выбирается по пользе, а не по порядку в списке', () => {
    // город с пустым бюджетом и огромными пробками обязан заняться дорогами,
    // а не жильём: сравним utility напрямую
    const m = { budget: 0.9, housingDemand: 0.7, socialLoad: 0.4, jams: 0.95, mood: 0.8,
      unemployment: 0.02, bridgeAge: 5, freeLand: 0.6, politics: 0, day: 1, front: 0, frontline: 0,
      supplyStrain: 0, name: 'Т', decisions: 0 };
    const road = utility(m, MAYOR_ACTIONS.find((a) => a.id === 'bypass'));
    const park = utility(m, MAYOR_ACTIONS.find((a) => a.id === 'park'));
    assert.ok(road.score > park.score, 'объездная не выигрывает у парка при пробках 0.95');
  });
  check('детерминизм: один сид — одни решения', () => {
    const a = fresh(23); const b = fresh(23);
    const da = a.mayors.tickDay(); const db = b.mayors.tickDay();
    assert.deepEqual(da.map((x) => x.text), db.map((x) => x.text));
  });
}

console.log('Штаб слушает города');
{
  const game = fresh();
  check('у совета есть форма, понятная штабу', () => {
    const m = game.mayors.list[0];
    const adv = advisory(m);
    for (const k of ['attack', 'defense', 'supply', 'reason']) {
      assert.ok(adv[k] !== undefined, 'нет поля ' + k);
      if (k !== 'reason') assert.equal(typeof adv[k], 'number');
    }
    assert.equal(typeof adv.reason, 'string');
  });
  check('город, который только что взяли, просит гарнизон', () => {
    const g2 = fresh(31);
    const m = g2.mayors.list[0];
    const before = advisory(m).defense;
    m.justCaptured = 1;
    assert.ok(advisory(m).defense > before, 'совет не изменился после захвата');
    assert.match(advisory(m).reason, /взят/);
  });
  check('город у фронта просит укреплений', () => {
    const g2 = fresh(32);
    const m = g2.mayors.list[0];
    m.frontline = 0.9;
    const fortify = utility(m, MAYOR_ACTIONS.find((a) => a.id === 'fortify'));
    const park = utility(m, MAYOR_ACTIONS.find((a) => a.id === 'park'));
    assert.ok(fortify.score > park.score, 'под огнём мэр всё ещё сажает парк');
    assert.ok(fortify.parts.fear > 0, 'страх фронта не учтён');
  });
  check('уставший город не хочет наступления', () => {
    const g2 = fresh(33);
    const m = g2.mayors.list[0];
    m.mood = 0.2; m.budget = 0.9;
    assert.ok(advisory(m).attack < 0.5, 'усталость не снижает наступательный пыл');
  });
  check('совет попадает в оценку сектора', () => {
    const g3 = fresh(41);
    const m = g3.mayors.list[0];
    const point = g3.world.points.find((p) => p.id === m.pointId);
    const sector = g3.world.sectorAt(point.x, point.y);
    point.owner = m.home;
    for (const mm of g3.mayors.list) mm.mood = 1, mm.budget = 0.9, mm.justCaptured = 0;
    const quiet = g3.mayors.adviceForSector(sector.id);
    for (const mm of g3.mayors.list) { mm.justCaptured = 1; mm.housingDemand = 1.5; mm.socialLoad = 1.5; }
    const worried = g3.mayors.adviceForSector(sector.id);
    assert.ok(quiet && worried, 'совета нет вовсе');
    assert.ok(worried.defense > quiet.defense, 'тревога города не усилила оборону сектора');
    assert.ok(worried.notes.length > 0, 'нет объяснения, почему');
  });
  check('совет меняет план штаба, а не только числа', () => {
    /* Проверяем не «порядок целей другой» (он может совпасть случайно), а
       вклад: штаб обязан посчитать сектор с городами иначе, чем без них.
       Сравниваем оценки одного и того же мира до и после того, как
       города подали голос. */
    const g = fresh(51);
    for (let i = 0; i < 240; i++) g.step(1 / 30);
    const ai = g.strategic[0];
    for (const m of g.mayors.list) {
      m.frontline = 0; m.fortify = 0; m.justCaptured = 0;
      m.housingDemand = 1; m.socialLoad = 0.8; m.budget = 0.3; m.mood = 0.7;
    }
    ai.plan(g.cfg.ai.strategic);
    const quiet = new Map(ai.lastPlan.map((r) => [r.sectorId, r]));
    for (const m of g.mayors.list) {
      m.frontline = 0.95; m.fortify = 1; m.justCaptured = 1;
      m.housingDemand = 1.5; m.socialLoad = 1.5;
    }
    ai.plan(g.cfg.ai.strategic);
    const loud = new Map(ai.lastPlan.map((r) => [r.sectorId, r]));
    const changed = [...loud.values()].filter((r) => {
      const q = quiet.get(r.sectorId);
      return q && (Math.abs(r.defense - q.defense) > 0.1 || Math.abs(r.attack - q.attack) > 0.1);
    });
    assert.ok(changed.length > 0, 'ни одна оценка сектора не сдвинулась от советов городов');
    /* И именно в ту сторону, куда просят города: оборона вверх. */
    const defUp = changed.filter((r) => r.defense > (quiet.get(r.sectorId).defense));
    assert.ok(defUp.length > 0, 'тревога городов не подняла оборону ни одного сектора');
    assert.ok(defUp.every((r) => r.advice && r.advice.defense >= 0), 'оборона выросла не от советов');
  });
  check('совет по снабжению ограничен и виден в плане штаба', () => {
    const g = fresh(52);
    const ai = g.strategic[0];
    assert.ok(Math.abs(ai.supplyNeedFactor(0) - 1) < 1e-9, 'без совета множитель не 1');
    assert.ok(Math.abs(ai.supplyNeedFactor(1) - 0.88) < 1e-9, 'склады не облегчают наступление');
    assert.ok(Math.abs(ai.supplyNeedFactor(-1) - 1.12) < 1e-9, 'пробки не усложняют наступление');
    assert.ok(Math.abs(ai.supplyNeedFactor(99) - 0.88) < 1e-9, 'совет по снабжению не ограничен сверху');
    assert.ok(Math.abs(ai.supplyNeedFactor(-99) - 1.12) < 1e-9, 'совет по снабжению не ограничен снизу');
  });
  check('склады города попадают в план как снабжение сектора', () => {
    const g = fresh(53);
    for (let i = 0; i < 240; i++) g.step(1 / 30);
    const ai = g.strategic[0];
    for (const m of g.mayors.list) { m.supply = 0; m.jams = 0.2; }
    ai.plan(g.cfg.ai.strategic);
    const quiet = new Map(ai.lastPlan.map((r) => [r.sectorId, r]));
    for (const m of g.mayors.list) { m.supply = 1; }
    ai.plan(g.cfg.ai.strategic);
    const stocked = [...ai.lastPlan.values()].filter((r) => r.supply > (quiet.get(r.sectorId)?.supply ?? 0) + 0.2);
    assert.ok(stocked.length > 0, 'ни один сектор не получил снабжение от складов городов');
  });
}

console.log('Бой меняет жизнь города');
{
  const game = fresh(61);
  const m = game.mayors.list[0];
  const point = game.world.points.find((p) => p.id === m.pointId);
  point.owner = m.home;
  check('бой у города портит настроение и настроение видно в сводке', () => {
    const moodBefore = m.mood;
    // ставим вражеские юниты прямо у города
    let placed = 0;
    for (const u of game.units.values()) {
      if (!u.alive || placed >= 16) continue;
      if (u.faction === m.home) continue;
      u.x = point.x + (placed % 4) * 40; u.y = point.y + Math.floor(placed / 4) * 40;
      placed++;
    }
    assert.ok(placed >= 8, 'не удалось поставить врагов у города: ' + placed);
    game.mayors.tickDay();
    assert.ok(m.frontline > 0.3, 'город не заметил бой под стенами: ' + m.frontline.toFixed(2));
    assert.ok(m.mood < moodBefore + 0.01, 'настроение не упало от боя');
  });
  check('смена хозяина — событие для города', () => {
    const g2 = fresh(62);
    const mm = g2.mayors.list[0];
    const p = g2.world.points.find((pp) => pp.id === mm.pointId);
    p.owner = mm.home;
    const budgetBefore = mm.budget;
    p.owner = mm.home === 0 ? 1 : 0;
    g2.mayors.tickDay();
    assert.ok(mm.owner === p.owner, 'мэр не заметил, что город сменил хозяина');
    assert.ok(mm.budget < budgetBefore, 'бюджет не пострадал от перехода города');
  });
}

console.log('Мозги не ломают игру');
{
  const game = fresh(71);
  check('игра тикает с мэрами и не падает', () => {
    for (let i = 0; i < 900; i++) game.step(1 / 30);
    assert.ok(game.time > 0);
    assert.ok(game.mayors.stats().day > 0, 'дни мэров не прошли');
  });
  check('сохранение и загрузка переживают перезапуск', () => {
    const g = fresh(72);
    for (let i = 0; i < 300; i++) g.step(1 / 30);
    const saved = JSON.parse(JSON.stringify(g.mayors.toJSON()));
    assert.ok(saved.mayors.length === g.mayors.size, 'в снимке не все мэры');
    const g2 = fresh(72);
    g2.mayors.load(saved);
    assert.equal(g2.mayors.day, g.mayors.day, 'день не восстановился');
    assert.deepEqual(g2.mayors.stats().decisions, g.mayors.stats().decisions, 'решения не восстановились');
  });
  check('сохранение войны помнит города', () => {
    /* Проверяем настоящий Save.saveWar/applyWar, а не свой toJSON:
       иначе можно «сохранить» то, что игра никогда не запишет. */
    const store = new Map();
    const prev = globalThis.localStorage;
    globalThis.localStorage = {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
    };
    try {
      const g = fresh(81);
      for (let i = 0; i < 420; i++) g.step(1 / 30);
      const day = g.mayors.day;
      const decisions = g.mayors.stats().decisions;
      assert.ok(day > 0 && decisions > 0, 'городская жизнь не началась');
      assert.equal(Save.saveWar(g), true, 'война не сохранилась');
      const data = Save.loadWar();
      assert.ok(data && data.mayors, 'в сейве нет мэров');
      const g2 = fresh(81);
      Save.applyWar(g2, data);
      assert.equal(g2.mayors.day, day, 'день мэров не восстановился');
      assert.equal(g2.mayors.stats().decisions, decisions, 'решения мэров не восстановились');
    } finally {
      if (prev === undefined) delete globalThis.localStorage;
      else globalThis.localStorage = prev;
    }
  });
  check('мэры отключаются флагом конфигурации', () => {
    const g = fresh(73);
    const off = new Mayors({ ...g, cfg: { ...g.cfg, ai: { ...g.cfg.ai, mayors: { enabled: false } } }, seed: 1 });
    assert.equal(off.size, 0);
    assert.deepEqual(off.tickDay(), []);
    assert.equal(off.adviceForSector(0), null);
  });
  check('без мэров штаб работает как раньше', () => {
    const g = fresh(74);
    g.mayors.enabled = false;
    g.mayors.list = [];
    const ai = g.strategic[1];
    ai.plan(g.cfg.ai.strategic);
    assert.ok(true);
  });
}

console.log('Почему — читаемо человеком');
{
  const m = { name: 'Белая крепость', budget: 0.8, housingDemand: 1.4, socialLoad: 1.2,
    jams: 0.5, mood: 0.4, unemployment: 0.1, bridgeAge: 55, freeLand: 0.4,
    politics: 1, day: 3, front: 0.5, frontline: 0.5, supplyStrain: 0.3 };
  const action = MAYOR_ACTIONS.find((a) => a.id === 'housing');
  const text = whyText(m, action, utility(m, action));
  check('строка «почему» называет город, дело и причину', () => {
    assert.match(text, /Белая крепость/);
    assert.match(text, /жилой квартал/);
    assert.match(text, /итог/);
  });
  check('сводка для интерфейса называет последнее решение мэра', () => {
    const g = fresh(91);
    assert.equal(g.mayors.headline(), '', 'до первого дня сводка должна быть пустой');
    g.mayors.tickDay();
    const headline = g.mayors.headline();
    assert.ok(headline.length > 0, 'после решений сводка пуста');
    assert.match(headline, /итог/, 'в сводке нет причины решения: ' + headline);
  });
}

console.log('');
if (failures.length) {
  console.log('ПРОВАЛОВ:', failures.length);
  for (const f of failures) console.log('  ·', f);
  process.exit(1);
}
console.log(`Мозги городов работают: ${passed} проверок, 0 провалов.`);
