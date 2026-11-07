// 1 ИЗ 8 МИЛЛИАРДОВ — тест модели: данные, жребий, демография, прогон жизней.
// Движок написан обычными скриптами для браузера, поэтому здесь он загружается
// в пустой контекст с заглушкой window — никакого DOM ему не нужно.
// Запуск: node 1in8b/tests/logic.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;
function ok(cond, msg) {
  if (cond) console.log('  ✓ ' + msg);
  else { console.error('  ✗ ' + msg); failed++; }
}

/* ---------------------------- загрузка движка --------------------------- */
const sandbox = { window: {}, console, Math, Date, JSON };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
for (const f of ['src/countries.js', 'src/names.js', 'src/model.js', 'src/events.js', 'src/engine.js']) {
  try {
    vm.runInContext(readFileSync(join(root, f), 'utf8'), sandbox, { filename: f });
  } catch (e) {
    console.error('  ✗ не загрузился ' + f + ': ' + e.message);
    process.exit(1);
  }
}
const API = sandbox.window.IN8B;
const { countries: C, model: M, events: E, engine: EN, names: NM } = API;
console.log('1 ИЗ 8 МИЛЛИАРДОВ — тест модели');

/* ------------------------------- 1. данные ------------------------------ */
console.log('\nДанные стран');
ok(C.list.length >= 170, 'стран и территорий: ' + C.list.length);
const need = ['code', 'name', 'region', 'births', 'pop', 'leM', 'leF', 'u5mr', 'imr', 'gdp', 'gini',
  'school', 'tertiary', 'tfr', 'urban'];
const bad = C.list.filter((c) => need.some((k) => c[k] === undefined || c[k] === null || Number.isNaN(c[k])));
ok(bad.length === 0, 'у каждой страны заполнены все показатели' + (bad.length ? ': нет у ' + bad[0].code : ''));
ok(C.list.every((c) => /^[a-z]{2}$/.test(c.code)), 'коды стран — две строчные буквы');
ok(new Set(C.list.map((c) => c.code)).size === C.list.length, 'коды не повторяются');
ok(C.list.every((c) => c.leF >= c.leM - 1), 'женщины живут дольше мужчин (или почти столько же)');
ok(C.list.every((c) => c.gini > 15 && c.gini < 75), 'коэффициент Джини в разумных пределах');
ok(Math.abs(C.totalBirths / 1e6 - 127) < 25, 'рождений в год, млн: ' + (C.totalBirths / 1e6).toFixed(1));
ok(Math.abs(C.totalPop / 1e9 - 8) < 0.4, 'население мира, млрд: ' + (C.totalPop / 1e9).toFixed(2));
const shareSum = C.list.reduce((s, c) => s + C.birthShare(c) * 100, 0);
ok(Math.abs(shareSum - 100) < 0.01, 'доли рождений в сумме дают 100%');
const india = C.byCode.in;
const inPct = C.birthShare(india) * 100;
ok(Math.abs(inPct - 17.6) < 2.5, 'доля Индии в рождениях ≈ 17,6%: ' + inPct.toFixed(1) + '%');

/* --------------------------- 2. таблица смертности ---------------------- */
console.log('\nТаблицы смертности');
for (const code of ['jp', 'ru', 'ng', 'in']) {
  const c = C.byCode[code];
  const t = M.lifeTable((c.leM + c.leF) / 2, c.u5mr);
  let lx = 1, sum = 0;
  for (let a = 0; a < t.qx.length; a++) { sum += lx * (1 - t.qx[a] / 2); lx *= (1 - t.qx[a]); }
  ok(Math.abs(sum - (c.leM + c.leF) / 2) < 1.2,
    code + ': таблица даёт ОПЖ ' + sum.toFixed(1) + ' при ожидаемых ' + ((c.leM + c.leF) / 2).toFixed(1));
  ok(t.qx.every((q) => q >= 0 && q <= 1), code + ': вероятности смерти в пределах 0…1');
  ok(Math.abs(t.qx[0] * 1000 - c.imr) < Math.max(4, c.imr * 0.35),
    code + ': младенческая смертность ' + (t.qx[0] * 1000).toFixed(1) + '‰ против данных ' + c.imr.toFixed(1) + '‰');
}

/* ------------------------------ 3. жребий ------------------------------- */
console.log('\nЖребий рождения');
const rnd = M.makeRng('тест-жребия');
const counts = {};
const N = 40000;
for (let i = 0; i < N; i++) {
  const c = C.draw(rnd, 'births');
  counts[c.code] = (counts[c.code] || 0) + 1;
}
const inShare = (counts.in / N) * 100;
ok(Math.abs(inShare - inPct) < 1.2, 'после ' + N + ' жребиев доля Индии ' + inShare.toFixed(1) + '% ≈ ожидаемой');
ok(Object.keys(counts).length > 120, 'выпадало больше 120 разных стран: ' + Object.keys(counts).length);
const popRnd = M.makeRng('тест-жребия-по-населению');
let cn = 0;
for (let i = 0; i < 10000; i++) if (C.draw(popRnd, 'pop').code === 'cn') cn++;
ok(Math.abs(cn / 100 - C.popShare(C.byCode.cn) * 100) < 1.2, 'режим «8 миллиардов живущих» считает по населению');

/* ----------------------------- 4. генератор ----------------------------- */
console.log('\nВоспроизводимость');
const a = new EN.Life({ seed: 'одинаковое-зерно', silent: true }).runToEnd();
const b = new EN.Life({ seed: 'одинаковое-зерно', silent: true }).runToEnd();
ok(a.c.code === b.c.code && a.name === b.name, 'одинаковое зерно → тот же человек (' + a.name + ')');
ok(a.dead.age === b.dead.age && a.log.length === b.log.length, 'одинаковое зерно → та же жизнь, год в год');
const c2 = new EN.Life({ seed: 'другое-зерно', silent: true }).runToEnd();
ok(c2.name !== a.name || c2.c.code !== a.c.code || c2.dead.age !== a.dead.age, 'другое зерно → другая жизнь');

/* --------------------------- 5. прогон жизней --------------------------- */
console.log('\nПрогон 3000 случайных жизней');
const lives = [];
let broken = null;
for (let i = 0; i < 3000 && !broken; i++) {
  try {
    const l = new EN.Life({ seed: 'прогон-' + i, silent: true }).runToEnd();
    lives.push(l);
  } catch (e) { broken = 'жизнь #' + i + ': ' + e.message + '\n' + e.stack; }
}
ok(!broken, 'все 3000 жизней прожиты без исключений' + (broken ? ': ' + broken : ''));
ok(lives.every((l) => l.dead && l.dead.cause && l.dead.age >= 0 && l.dead.age <= 122), 'у каждой жизни есть возраст и причина смерти');
ok(lives.every((l) => ['health', 'happy', 'know', 'bond'].every((k) => l.stats[k] >= 0 && l.stats[k] <= 100)),
  'показатели всегда в пределах 0…100');
ok(lives.every((l) => Number.isFinite(l.money) && Number.isFinite(l.income)), 'деньги и доход — конечные числа');
ok(lives.every((l) => l.log.length > 0 && l.log.every((e) => typeof e.text === 'string' && e.text.length > 0)),
  'летопись заполнена текстом');
ok(lives.every((l) => l.history.length === l.dead.age || l.history.length === l.dead.age + 1),
  'история показателей совпадает с числом прожитых лет');
ok(lives.every((l) => typeof l.summary() === 'string' && l.summary().length > 20), 'итог жизни составляется');
ok(lives.every((l) => typeof l.epitaph() === 'string' && l.epitaph().length > 5), 'эпитафия составляется');
ok(lives.every((l) => Array.isArray(l.achievements())), 'достижения считаются');
ok(lives.every((l) => l.children.every((ch) => ch.bornAt <= l.dead.age && ch.name)), 'дети рождаются при жизни родителя и получают имя');
ok(lives.every((l) => l.edu.level >= 0 && l.edu.level <= 6), 'ступень образования 0…6');

/* ------------------------ 6. демография результата ---------------------- */
console.log('\nПохоже ли это на реальный мир');
// ожидания считаем из самих данных: мир, взвешенный по числу рождений
let wLe = 0, wU5 = 0, wImr = 0, wUrb = 0;
for (const c of C.list) {
  const sh = C.birthShare(c);
  wLe += sh * (c.leM + c.leF) / 2; wU5 += sh * c.u5mr; wImr += sh * c.imr; wUrb += sh * c.urban;
}
const ages = lives.map((l) => l.dead.age);
const mean = ages.reduce((s2, x) => s2 + x, 0) / ages.length;
ok(Math.abs(mean - wLe) < 2, 'средний возраст смерти ' + mean.toFixed(1) + ' против ожидаемых по данным ' + wLe.toFixed(1));
const infant = ages.filter((x) => x < 1).length / ages.length * 1000;
ok(Math.abs(infant - wImr) < Math.max(8, wImr * 0.35), 'младенческая смертность ' + infant.toFixed(0) + '‰ против данных ' + wImr.toFixed(0) + '‰');
const u5 = ages.filter((x) => x < 5).length / ages.length * 1000;
ok(Math.abs(u5 - wU5) < Math.max(10, wU5 * 0.3), 'смертность до 5 лет ' + u5.toFixed(0) + '‰ против данных ' + wU5.toFixed(0) + '‰');
ok(u5 > infant, 'до пяти лет умирает больше, чем до года');
const old = ages.filter((x) => x >= 90).length / ages.length * 100;
ok(old > 1.5 && old < 22, 'доживают до 90: ' + old.toFixed(1) + '%');
const girls = lives.filter((l) => l.sex === 'f').length / lives.length * 100;
ok(Math.abs(girls - 48.7) < 3, 'девочек при рождении: ' + girls.toFixed(1) + '% (в мире ≈ 48,7)');

// место рождения берём до начала жизни: по ходу жизни люди переезжают
let bornUrban = 0;
for (let i = 0; i < 3000; i++) if (new EN.Life({ seed: 'город-' + i, silent: true }).urban) bornUrban++;
const bornUrbanPct = bornUrban / 30;
ok(Math.abs(bornUrbanPct - wUrb) < 3.5, 'родились в городе ' + bornUrbanPct.toFixed(1) + '% против данных ' + wUrb.toFixed(1) + '%');
const diedUrban = lives.filter((l) => l.urban).length / lives.length * 100;
ok(diedUrban > bornUrbanPct, 'к концу жизни горожан больше (' + diedUrban.toFixed(0) + '%): люди переезжают в города');

/* ------------------- 7. ОПЖ по отдельным странам ------------------------ */
console.log('\nПродолжительность жизни по странам (по 400 жизней)');
let sumErr = 0, nC = 0;
for (const code of ['jp', 'de', 'us', 'ru', 'br', 'cn', 'in', 'ng', 'et']) {
  const c = C.byCode[code];
  let s = 0;
  for (let i = 0; i < 400; i++) s += new EN.Life({ seed: code + '-' + i, countryCode: code, silent: true }).runToEnd().dead.age;
  const got = s / 400, exp = (c.leM + c.leF) / 2;
  const d = Math.abs(got - exp); sumErr += d; nC++;
  ok(d < 3.5, c.name + ': модель ' + got.toFixed(1) + ' / факт ' + exp.toFixed(1) + ' (Δ ' + d.toFixed(1) + ')');
}
ok(sumErr / nC < 2, 'средняя ошибка по странам: ' + (sumErr / nC).toFixed(2) + ' года');

/* --------------------------- 8. деньги и выборы ------------------------- */
console.log('\nДеньги, образование, решения');
const rich = [], poor = [];
for (let i = 0; i < 400; i++) {
  rich.push(new EN.Life({ seed: 'rich-' + i, countryCode: 'no', silent: true }).runToEnd());
  poor.push(new EN.Life({ seed: 'poor-' + i, countryCode: 'ne', silent: true }).runToEnd());
}
const tert = (arr) => arr.filter((l) => l.edu.level >= 5).length / arr.length * 100;
ok(tert(rich) > tert(poor) + 15, 'в богатой стране вузов больше: ' + tert(rich).toFixed(0) + '% против ' + tert(poor).toFixed(0) + '%');
const avgInc = (arr) => arr.reduce((s, l) => s + (l.history.length ? l.history[Math.floor(l.history.length * 0.6)].income : 0), 0) / arr.length;
ok(avgInc(rich) > avgInc(poor) * 3, 'доход в богатой стране кратно выше');

ok(Array.isArray(E.choices) && E.choices.length >= 20, 'карточек решений: ' + E.choices.length);
ok(E.choices.every((d) => d.id && d.title && Array.isArray(d.options) && d.options.length >= 2),
  'у каждого решения есть заголовок и минимум два варианта');
ok(new Set(E.choices.map((d) => d.id)).size === E.choices.length, 'идентификаторы решений не повторяются');
ok(E.choices.every((d) => d.options.every((o) => o.label && typeof o.run === 'function')),
  'у каждого варианта есть подпись и последствия');
ok(E.choices.every((d) => Array.isArray(d.age) && d.age.length === 2 && d.age[0] <= d.age[1]),
  'у каждого решения задан возрастной диапазон');
ok(Array.isArray(E.reflections) && E.reflections.length >= 4, 'вопросов-пауз по ходу жизни: ' + E.reflections.length);
ok(E.reflections.every((r) => typeof r.age === 'number' && r.q), 'у каждого вопроса-паузы есть возраст и текст');
ok(E.auto.length >= 30, 'фоновых событий: ' + E.auto.length);
ok(E.auto.every((ev) => ev.id && typeof ev.run === 'function'), 'у всех событий есть id и действие');
ok(new Set(E.auto.map((e2) => e2.id)).size === E.auto.length, 'идентификаторы событий не повторяются');

// каждый вариант каждого решения должен применяться без ошибок
let appliedErr = null, applied = 0, skipped = 0;
for (const d of E.choices) {
  const want = Math.max(1, Math.round((d.age[0] + d.age[1]) / 2));
  for (let oi = 0; oi < d.options.length; oi++) {
    let seed = 0, done = false;
    while (!done && seed < 40) {
      const l = new EN.Life({ seed: 'opt-' + d.id + '-' + oi + '-' + seed++, silent: true });
      while (l.alive && l.age < want) l.stepYear();
      if (!l.alive) continue;
      const card = l.decisionById(d.id);
      if (!card || !card.options[oi]) { skipped++; break; }
      try {
        l.pendingDecision = card;
        l.answer(oi);
        l.stepYear();
        applied++;
      } catch (e) { appliedErr = d.id + '/' + oi + ': ' + e.message + '\n' + e.stack; }
      done = true;
    }
  }
}
ok(!appliedErr, 'все варианты решений применяются без ошибок (' + applied + ' шт.)' + (appliedErr ? ': ' + appliedErr : ''));
ok(applied >= 40, 'проверено вариантов: ' + applied + ' (пропущено по условиям: ' + skipped + ')');

// авторежим должен выбирать сам и не зависать
let autoErr = null;
for (let i = 0; i < 200 && !autoErr; i++) {
  try {
    const l = new EN.Life({ seed: 'auto-' + i, silent: true });
    let guard = 0;
    while (l.alive && guard++ < 130) { if (l.stepYear()) l.autoAnswer(); }
    if (l.pendingDecision) autoErr = 'осталось неотвеченное решение';
  } catch (e) { autoErr = e.message; }
}
ok(!autoErr, 'авторежим проходит жизнь до конца' + (autoErr ? ': ' + autoErr : ''));

/* ------------------------------ 9. имена -------------------------------- */
console.log('\nИмена и соседи по секунде');
ok(C.list.every((c) => {
  const n = NM.make(M.makeRng('имя-' + c.code), c, 'f');
  return n && n.given && n.surname && n.full.includes(' ');
}), 'для каждой страны генерируется имя и фамилия');
ok(!/[a-zA-Z]/.test(C.list.map((c) => NM.make(M.makeRng('и-' + c.code), c, 'm').full).join('')),
  'все имена записаны кириллицей');
const peers = EN.siblingsOfSecond('секунда-1', { era: 'today', drawMode: 'births' }, 4);
ok(peers.length === 4 && peers.every((p) => p.name && p.country && p.deathAge >= 0),
  'четверо, родившихся в ту же секунду, прожили свои жизни');

if (failed) { console.error(`\n✗ Провалено проверок: ${failed}`); process.exit(1); }
console.log('\n✓ Все проверки пройдены');
