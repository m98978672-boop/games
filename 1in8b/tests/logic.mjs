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
sandbox.matchMedia = () => ({ matches: false });
for (const f of ['src/countries.js', 'src/names.js', 'src/model.js', 'src/events.js', 'src/engine.js',
  'src/purchases.js', 'src/invest.js', 'src/portrait.js']) {
  try {
    vm.runInContext(readFileSync(join(root, f), 'utf8'), sandbox, { filename: f });
  } catch (e) {
    console.error('  ✗ не загрузился ' + f + ': ' + e.message);
    process.exit(1);
  }
}
const API = sandbox.window.IN8B;
const { countries: C, model: M, events: E, engine: EN, names: NM, purchases: PU, portrait: PR, invest: IV } = API;
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
        const o = card.options[oi];
        o.locked = false;                 // проверяем сам вариант, а не подмену движка
        const risky = o.chance !== null && o.chance !== undefined && !!o.fail;
        o.chance = null;                  // сначала удачный исход
        l.pendingDecision = card;
        l.answer(oi);
        l.stepYear();
        applied++;
        if (risky) {                      // затем неудачный, если он описан
          const l2 = new EN.Life({ seed: 'fail-' + d.id + '-' + oi, silent: true });
          while (l2.alive && l2.age < want) l2.stepYear();
          const card2 = l2.alive ? l2.decisionById(d.id) : null;
          if (card2 && card2.options[oi]) {
            card2.options[oi].locked = false;
            card2.options[oi].chance = 0;  // гарантированная неудача
            l2.pendingDecision = card2;
            l2.answer(oi);
            l2.stepYear();
            applied++;
          }
        }
      } catch (e) { appliedErr = d.id + '/' + oi + ': ' + e.message + '\n' + e.stack; }
      done = true;
    }
  }
}
ok(!appliedErr, 'все варианты решений применяются без ошибок (' + applied + ' шт.)' + (appliedErr ? ': ' + appliedErr : ''));
ok(applied >= 40, 'проверено вариантов: ' + applied + ' (пропущено по условиям: ' + skipped + ')');

/* --------------------- 8б. условия у вариантов -------------------------- */
console.log('\nУсловия у решений');

const withReq = [];
for (const d of E.choices) for (const o of d.options) if (o.req) withReq.push(d.id);
ok(withReq.length >= 20, 'вариантов с условиями в данных: ' + withReq.length);

let seenCards = 0, seenOpts = 0, lockedOpts = 0, deadEnd = null, badReq = null, autoLocked = null;
let pricedOpts = 0, riskyOpts = 0;
for (let i = 0; i < 300 && !deadEnd && !badReq && !autoLocked; i++) {
  const l = new EN.Life({ seed: 'req-' + i, silent: true });
  let guard = 0;
  while (l.alive && guard++ < 130) {
    const card = l.stepYear();
    if (!card) continue;
    seenCards++;
    seenOpts += card.options.length;
    const open = card.options.filter((o) => !o.locked);
    if (!open.length) deadEnd = card.id + ' в ' + l.age + ' лет: закрыты все варианты';
    const lockedLabels = card.options.filter((o) => o.locked).map((o) => o.label);
    lockedOpts += lockedLabels.length;
    for (const o of card.options) {
      if (o.price !== null && o.price !== undefined) pricedOpts++;
      if (o.chance !== null && o.chance !== undefined) riskyOpts++;
      for (const r of o.reqs || []) {
        const fine = typeof r.ok === 'boolean' &&
          (r.k === 'text' ? !!r.text : Number.isFinite(r.need) && Number.isFinite(r.have));
        if (!fine) badReq = card.id + '/' + o.label + ': условие описано неверно';
      }
    }
    l.autoAnswer();
    if (lockedLabels.indexOf(l.lastDecision.choice) >= 0) {
      autoLocked = card.id + ': авторежим выбрал закрытый вариант «' + l.lastDecision.choice + '»';
    }
  }
}
ok(!deadEnd, 'в каждом решении остаётся хотя бы один доступный вариант' + (deadEnd ? ': ' + deadEnd : ''));
ok(!badReq, 'каждое условие приходит с порогом и текущим значением' + (badReq ? ': ' + badReq : ''));
ok(!autoLocked, 'авторежим никогда не выбирает закрытый вариант' + (autoLocked ? ': ' + autoLocked : ''));
ok(lockedOpts > 0 && lockedOpts < seenOpts * 0.35,
  'закрытых вариантов ' + lockedOpts + ' из ' + seenOpts + ' (' + (100 * lockedOpts / seenOpts).toFixed(1) + '%) — условия работают, но не запирают игру');
ok(pricedOpts > 0, 'у вариантов показана цена: ' + pricedOpts + ' шт.');
ok(riskyOpts > 0, 'у части вариантов есть шанс не выйти: ' + riskyOpts + ' шт.');

// закрытый вариант нельзя выбрать вручную
let manualErr = 'не нашлось закрытого варианта для проверки';
for (let i = 0; i < 400 && manualErr; i++) {
  const l = new EN.Life({ seed: 'lock-' + i, silent: true });
  let guard = 0;
  while (l.alive && guard++ < 130) {
    const card = l.stepYear();
    if (!card) continue;
    const li = card.options.findIndex((o) => o.locked);
    if (li >= 0) {
      const label = card.options[li].label;
      l.pendingDecision = card;
      l.answer(li);
      manualErr = l.lastDecision.choice === label
        ? 'закрытый вариант «' + label + '» всё-таки применился' : null;
      break;
    }
    l.autoAnswer();
  }
}
ok(!manualErr, 'закрытый вариант не применяется, даже если нажать' + (manualErr ? ': ' + manualErr : ''));

// кошелёк: учитывает помощь семьи, пока человек молод
const youngL = new EN.Life({ seed: 'кошелёк', silent: true });
while (youngL.alive && youngL.age < 17) youngL.stepYear();
ok(youngL.purse() >= youngL.money, 'кошелёк подростка учитывает помощь семьи');

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

/* --------------------- 8в. вложения и своё дело ------------------------- */
console.log('\nВложения и своё дело');

ok(IV.assets.length >= 8, 'инструментов вложений: ' + IV.assets.length);
ok(IV.biz.length >= 6, 'видов своего дела: ' + IV.biz.length);
ok(new Set(IV.assets.map((a) => a.id)).size === IV.assets.length, 'идентификаторы инструментов не повторяются');
ok(new Set(IV.biz.map((b) => b.id)).size === IV.biz.length, 'идентификаторы дел не повторяются');
ok(IV.assets.every((a) => a.icon && a.name && a.desc && a.min > 0 && typeof a.avail === 'function'),
  'у каждого инструмента есть название, описание, минимальный взнос и условия');
ok(IV.biz.every((b) => b.cost > 0 && b.margin > 0 && b.fail > 0 && b.fail < 0.4 && b.boom >= 0),
  'у каждого дела заданы цена, прибыль, шанс прогореть и шанс выстрелить');

/* вспомогательное: довести жизнь до возраста, отвечая нейтрально */
function liveTo(seed, code, age, money) {
  const l = new EN.Life({ seed, countryCode: code, silent: true });
  while (l.alive && l.age < age) { if (l.stepYear()) l.autoAnswer(); }
  if (l.alive && money != null) l.money = Math.round(l.need * money);
  return l;
}

/* 1. пока игрок ничего не вложил, модуль молчит */
let touched = null;
for (let i = 0; i < 150 && !touched; i++) {
  const l = new EN.Life({ seed: 'quiet-' + i, silent: true });
  let guard = 0;
  while (l.alive && guard++ < 130) { if (l.stepYear()) l.autoAnswer(); }
  if (l.capitalIncome !== 0) touched = 'появился доход с капитала из ниоткуда';
  if (l.biz) touched = 'само завелось своё дело';
  if (Object.keys(l.assets || {}).length) touched = 'сами появились вложения';
}
ok(!touched, 'жизнь без вложений идёт ровно как раньше' + (touched ? ': ' + touched : ''));

/* 2. деньги не появляются и не исчезают при вложении и возврате */
const l1 = liveTo('вклад-туда-обратно', 'de', 30, 6);
const before1 = l1.money;
const sum1 = Math.round(l1.need);
ok(IV.put(l1, 'depo', sum1).ok && Math.round(l1.money) === Math.round(before1 - sum1),
  'взнос списывает ровно столько, сколько вложено');
ok(IV.take(l1, 'depo').ok && Math.abs(l1.money - before1) < 2, 'возврат возвращает ровно вложенное');
ok(!IV.put(l1, 'depo', l1.money * 10).ok, 'нельзя вложить больше, чем есть');
ok(!IV.put(l1, 'depo', 1).ok, 'нельзя вложить меньше минимального взноса');
ok(!IV.put(l1, 'его-нет', 1000).ok, 'нельзя вложить в несуществующий инструмент');
ok(!IV.take(l1, 'gold').ok, 'нельзя забрать то, чего не покупал');

/* 3. своё дело: открытие, второе дело, продажа */
const l2 = liveTo('дело-правила', 'br', 30, 12);
const open1 = IV.openBiz(l2, 'stall');
ok(open1.ok && l2.biz && l2.business, 'дело открывается и отмечается в жизни');
ok(!IV.openBiz(l2, 'shop').ok, 'второе дело одновременно открыть нельзя');
const priceNow = IV.sellPrice(l2);
const beforeSell = l2.money;
ok(IV.sellBiz(l2).ok && Math.round(l2.money - beforeSell) === priceNow && !l2.biz,
  'дело продаётся ровно за показанную цену');
ok(!IV.sellBiz(l2).ok, 'продать дело второй раз нельзя');

/* 4. честность чисел: показанный шанс прогореть совпадает с тем, что происходит */
function bizRun(typeId, years, n) {
  let opened = 0, closed = 0, boomed = 0, shown = 0;
  for (let i = 0; i < n; i++) {
    const code = ['de', 'ru', 'in', 'ng', 'br', 'us'][i % 6];
    const l = liveTo('odds-' + typeId + '-' + i, code, 30, 14);
    if (!l.alive) continue;
    const type = IV.bizById[typeId];
    if (IV.bizState(l, type).reqs.some((r) => !r.ok)) continue;
    if (!IV.openBiz(l, typeId).ok) continue;
    opened++;
    shown += IV.odds(l, type, 0, false).fail3;
    const until = l.age + years;
    while (l.alive && l.age < until && l.biz) { if (l.stepYear()) l.autoAnswer(); }
    if (!l.biz) closed++;
    if (l.boomedBiz) boomed++;
  }
  return { opened, closed, boomed, shown: shown / Math.max(1, opened), real: closed / Math.max(1, opened) };
}
const cafe = bizRun('cafe', 3, 220);
ok(cafe.opened > 120, 'кафе открыли в ' + cafe.opened + ' жизнях');
ok(Math.abs(cafe.real - cafe.shown) < 0.08,
  'обещанный шанс прогореть за три года совпадает с жизнью: обещано ' +
  Math.round(cafe.shown * 100) + '%, вышло ' + Math.round(cafe.real * 100) + '%');
const stall = bizRun('stall', 3, 220);
ok(Math.abs(stall.real - stall.shown) < 0.08,
  'то же для лотка: обещано ' + Math.round(stall.shown * 100) + '%, вышло ' + Math.round(stall.real * 100) + '%');
ok(cafe.real > stall.real, 'кафе прогорает чаще лотка: ' +
  Math.round(cafe.real * 100) + '% против ' + Math.round(stall.real * 100) + '%');

const long1 = bizRun('shop', 25, 160);
ok(long1.closed < long1.opened, 'часть дел доживает до старости: выжило ' +
  (long1.opened - long1.closed) + ' из ' + long1.opened);
ok(long1.boomed > 0, 'иногда дело идёт в гору: ' + long1.boomed + ' из ' + long1.opened);

/* 5. долгий прогон инструментов: ничего не ломается и не уходит в бесконечность */
function hold(id, years, n, code) {
  const out = [];
  let bad = null;
  for (let i = 0; i < n; i++) {
    const l = liveTo('hold-' + id + '-' + i, code || ['de', 'ru', 'in', 'ng', 'br', 'us'][i % 6], 30, 3);
    if (!l.alive) continue;
    const def = IV.assetById[id];
    if (IV.assetState(l, def).reqs.some((r) => !r.ok)) continue;
    const put = Math.round(l.need);
    if (!IV.put(l, id, put).ok) continue;
    const until = l.age + years;
    while (l.alive && l.age < until) { if (l.stepYear()) l.autoAnswer(); }
    const h = IV.holdingOf(l, id) || { val: 0, got: 0 };
    if (!Number.isFinite(h.val) || h.val < 0) bad = id + ': стоимость стала ' + h.val;
    if (!Number.isFinite(l.money)) bad = id + ': деньги стали ' + l.money;
    out.push((h.val + (h.got || 0)) / put);
  }
  out.sort((a, b) => a - b);
  return { bad, n: out.length, med: out[Math.floor(out.length / 2)] || 0, worst: out[0] || 0, best: out[out.length - 1] || 0 };
}
const depo = hold('depo', 25, 120);
const stock = hold('stock', 25, 120);
const ponzi = hold('ponzi', 5, 120);
ok(!depo.bad && !stock.bad && !ponzi.bad, 'стоимость вложений остаётся числом и не уходит в минус' +
  (depo.bad || stock.bad || ponzi.bad ? ': ' + (depo.bad || stock.bad || ponzi.bad) : ''));
ok(stock.med > depo.med, 'за 25 лет акции обгоняют вклад: ×' + stock.med.toFixed(2) + ' против ×' + depo.med.toFixed(2));
ok(stock.worst < 1.2 && stock.best > 3, 'у акций есть и неудачные, и удачные жизни: от ×' +
  stock.worst.toFixed(2) + ' до ×' + stock.best.toFixed(1));
ok(ponzi.med < 0.2, 'пирамида «40 % в год» за пять лет разоряет: медиана ×' + ponzi.med.toFixed(2));

/* 6. доход с капитала попадает в годовой доход */
const l3 = liveTo('рента', 'ru', 35, 8);
const r3 = IV.put(l3, 'bond', Math.round(l3.need * 3));
if (r3.ok) { if (l3.stepYear()) l3.autoAnswer(); }
ok(r3.ok && l3.capitalIncome > 0 && l3.income >= l3.laborIncome + l3.capitalIncome - 1,
  'купоны и рента входят в годовой доход: ' + Math.round(l3.capitalIncome));

/* 7. рынок одинаков для всех бумаг одной жизни и повторяется при пересчёте */
const l4 = liveTo('рынок', 'us', 40, 1);
const m1 = IV.market(l4, l4.year), m2 = IV.market(l4, l4.year);
ok(m1.mood === m2.mood && m1.crisis === m2.crisis, 'год рынка считается одинаково при каждом обращении');
let crises = 0;
for (let y = 1950; y < 2100; y++) if (IV.market(l4, y).crisis) crises++;
ok(crises > 5 && crises < 30, 'кризисы случаются примерно раз в десять лет: ' + crises + ' за 150 лет');

/* ------------------------------ 9. имена -------------------------------- */
console.log('\nИмена и соседи по секунде');
ok(C.list.every((c) => {
  const n = NM.make(M.makeRng('имя-' + c.code), c, 'f');
  return n && n.given && n.surname && n.full.includes(' ');
}), 'для каждой страны генерируется имя и фамилия');
ok(!/[a-zA-Z]/.test(C.list.map((c) => NM.make(M.makeRng('и-' + c.code), c, 'm').full).join('')),
  'все имена записаны кириллицей');
const noCity = C.list.filter((c) => !NM.cities[c.code] || !NM.cities[c.code].length);
ok(noCity.length === 0, 'у каждой страны есть города для подписи: ' +
  (noCity.length ? noCity.map((c) => c.code).join(' ') : 'все ' + C.list.length));
ok(C.list.every((c) => {
  const city = NM.place(c.code, 'зерно-' + c.code, true);
  const rural = NM.place(c.code, 'зерно-' + c.code, false);
  return city && rural && city !== rural && !/[a-zA-Z]/.test(city + rural);
}), 'place() даёт разное место для города и села, кириллицей');

const peers = EN.siblingsOfSecond('секунда-1', { era: 'today', drawMode: 'births' }, 4);
ok(peers.length === 4 && peers.every((p) => p.name && p.country && p.deathAge >= 0),
  'четверо, родившихся в ту же секунду, прожили свои жизни');

/* ----------------------------- 10. траты -------------------------------- */
console.log('\nМеню «Траты»');
ok(PU && PU.list.length >= 50, 'в каталоге трат вариантов: ' + (PU ? PU.list.length : 0));
ok(PU.groups.length >= 6, 'разделов меню: ' + PU.groups.length);
ok(new Set(PU.list.map((i) => i.id)).size === PU.list.length, 'все id трат уникальны');
ok(PU.list.every((i) => i.title && i.desc && i.g && typeof i.cost === 'number' && i.cost > 0),
  'у каждой траты есть название, описание, раздел и цена');
ok(PU.list.every((i) => PU.groups.some((g) => g.id === i.g)), 'каждая трата лежит в существующем разделе');
ok(PU.groups.every((g) => PU.list.some((i) => i.g === g.id)), 'в каждом разделе есть хотя бы одна трата');

// жизнь ребёнка ничего не покупает сама
const kid = new EN.Life({ seed: 'траты-дитя', countryCode: 'ng', silent: true });
ok(PU.availableFor(kid).length === 0, 'в 0 лет тратить нечего — за ребёнка решают родители');

// взрослый: покупка списывает деньги и действует один раз в год
const buyer = new EN.Life({ seed: 'траты-взрослый', countryCode: 'in', silent: true });
let g0 = 0;
while (buyer.alive && buyer.age < 30 && g0++ < 60) { if (buyer.stepYear()) buyer.autoAnswer(); }
buyer.money = buyer.need * 12;
ok(PU.availableFor(buyer).length >= 20, 'взрослому доступно вариантов: ' + PU.availableFor(buyer).length);
const cash = buyer.money;
const bought = PU.buy(buyer, 'books');
ok(bought.ok && buyer.money === cash - bought.price, 'покупка списывает ровно свою цену');
ok(buyer.purchased.books === buyer.age && buyer.spentTotal === bought.price, 'покупка записана в историю трат');
ok(PU.buy(buyer, 'books').ok === false, 'одну и ту же трату нельзя оплатить дважды за год');
ok(PU.spentThisYear(buyer) === bought.price, 'видно, сколько потрачено в этом году');
buyer.stepYear();
ok(Object.keys(buyer.boughtThisYear).length === 0, 'новый год — список трат года обнуляется');

// разовые покупки и содержание
buyer.money = buyer.need * 12;
const withUpkeep = PU.list.find((i) => i.up && i.once && PU.state(buyer, i).ok);
const got = PU.buy(buyer, withUpkeep.id);
ok(got.ok && buyer.upkeep > 0, 'вещь с содержанием («' + withUpkeep.title + '») добавила годовой расход');
ok(PU.buy(buyer, withUpkeep.id).ok === false, 'разовую покупку нельзя сделать повторно');
const upkeepBefore = buyer.money;
buyer.stepYear();
ok(buyer.money < upkeepBefore + buyer.income, 'содержание купленного вычитается каждый год');

// нельзя уйти в бездонный долг
const broke = new EN.Life({ seed: 'траты-бедный', countryCode: 'cd', silent: true });
let g1 = 0;
while (broke.alive && broke.age < 25 && g1++ < 50) { if (broke.stepYear()) broke.autoAnswer(); }
broke.money = -broke.need * 2;
ok(PU.availableFor(broke).length === 0, 'когда долг уже предельный, купить нечего');

// лечение снимает болезнь
const sick = new EN.Life({ seed: 'траты-болезнь', countryCode: 'br', silent: true });
let g2 = 0;
while (sick.alive && sick.age < 40 && g2++ < 80) { if (sick.stepYear()) sick.autoAnswer(); }
sick.flags.chronic = true;
sick.money = sick.need * 10;
const op = PU.buy(sick, 'surgery');
ok(op.ok && !sick.has('chronic'), 'операция снимает хроническую болезнь');

// ни одна трата не ломает жизнь
let buyErr = null; let tried = 0;
for (const it of PU.list) {
  const t = new EN.Life({ seed: 'т-' + it.id, countryCode: 'br', silent: true });
  let g = 0;
  while (t.alive && t.age < 45 && g++ < 90) { if (t.stepYear()) t.autoAnswer(); }
  if (!t.alive) continue;
  t.money = t.need * 30;
  t.marital = 'married';
  if (PU.state(t, it).ok) {
    tried++;
    try {
      PU.buy(t, it.id);
      let g3 = 0;
      while (t.alive && g3++ < 10) { if (t.stepYear()) t.autoAnswer(); }
    } catch (e) { buyErr = it.id + ': ' + e.message; break; }
  }
}
ok(!buyErr, 'все траты применяются и жизнь идёт дальше' + (buyErr ? ' — ' + buyErr : ''));
ok(tried >= 40, 'проверено трат в деле: ' + tried);

// сохранение не теряет покупки
const FIELDS = readFileSync(join(root, 'src/save.js'), 'utf8');
for (const f of ['purchased', 'upkeep', 'spentTotal', 'incomeBoost']) {
  ok(FIELDS.includes(`'${f}'`), 'сохранение помнит поле ' + f);
}

/* --------------------------- 11. портрет -------------------------------- */
console.log('\nАнимированный портрет');
ok(PR && PR.clips.length >= 100, 'анимаций у портрета: ' + (PR ? PR.clips.length : 0) + ' (нужно ≥ 100)');
ok(new Set(PR.clips.map((c) => c.id)).size === PR.clips.length, 'все id анимаций уникальны');
ok(PR.clips.every((c) => c.id && c.name && c.group && c.dur > 0 && typeof c.fn === 'function'),
  'у каждой анимации есть id, название, раздел, длительность и функция движения');
ok(PR.groups.every((g) => PR.clips.some((c) => c.group === g)), 'в каждом разделе анимаций есть клипы');
ok(PR.clips.every((c) => PR.groups.includes(c.group)), 'все анимации лежат в известных разделах');

// внешность зависит от человека и не меняется от кадра к кадру
const manA = new EN.Life({ seed: 'портрет-1', countryCode: 'ng', silent: true });
const manB = new EN.Life({ seed: 'портрет-2', countryCode: 'no', silent: true });
const lookA = PR.lookFor(manA); const lookA2 = PR.lookFor(manA); const lookB = PR.lookFor(manB);
ok(JSON.stringify(lookA) === JSON.stringify(lookA2), 'внешность одного человека не меняется между кадрами');
ok(lookA.skin !== lookB.skin || lookA.hair !== lookB.hair, 'у людей из разных стран разная внешность');

// тело меняется с возрастом
const mKid = PR.metrics(8); const mOld = PR.metrics(78);
ok(mKid.head / mKid.h > mOld.head / mOld.h, 'у ребёнка голова больше относительно тела');
ok(mKid.h < mOld.h, 'взрослый выше ребёнка');
ok(PR.stageOf(0) !== PR.stageOf(30) && PR.stageOf(30) !== PR.stageOf(80), 'возрастные стадии различаются');

// анимации считаются без DOM и без ошибок
let clipErr = null;
function finite(o, path) {
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (typeof v === 'number' && !Number.isFinite(v)) return path + '.' + k;
    if (v && typeof v === 'object') { const bad = finite(v, path + '.' + k); if (bad) return bad; }
  }
  return null;
}
for (const c of PR.clips) {
  try {
    for (let t = 0; t <= 1.0001; t += 0.1) {
      const pose = PR.basePose();
      c.fn(pose, t, { life: manA, look: lookA, time: t * 10, dt: 0.016 });
      const bad = finite(pose, c.id);
      if (bad) { clipErr = 'не число: ' + bad; break; }
    }
  } catch (e) { clipErr = c.id + ': ' + e.message; }
  if (clipErr) break;
}
ok(!clipErr, 'все анимации считаются без ошибок и дают конечные числа' + (clipErr ? ' — ' + clipErr : ''));

// портрет умеет работать без canvas (в тестах его нет) и подбирает клип по году
const view = new PR.Portrait(null);
const hero = new EN.Life({ seed: 'портрет-герой', countryCode: 'in', silent: true });
let g4 = 0; let picked = [];
while (hero.alive && g4++ < 90) {
  const before = hero.log.length;
  if (hero.stepYear()) hero.autoAnswer();
  picked.push(view.syncYear(hero, hero.log.slice(before)));
}
ok(picked.every((id) => PR.byId[id]), 'на каждый год жизни находится своя анимация');
ok(new Set(picked).size >= 8, 'за жизнь портрет показал разных движений: ' + new Set(picked).size);
view.tick(16);
ok(typeof view.currentName() === 'string', 'портрет считает кадры без canvas и не падает');

if (failed) { console.error(`\n✗ Провалено проверок: ${failed}`); process.exit(1); }
console.log('\n✓ Все проверки пройдены');
