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
for (const f of ['src/algo.js', 'src/countries.js', 'src/names.js', 'src/model.js', 'src/events.js', 'src/work.js',
  'src/pay.js', 'src/mechanics.js', 'src/variations.js', 'src/engine.js',
  'src/purchases.js', 'src/invest.js', 'src/batch.js', 'src/textures.js', 'src/models.js', 'src/portrait.js']) {
  try {
    vm.runInContext(readFileSync(join(root, f), 'utf8'), sandbox, { filename: f });
  } catch (e) {
    console.error('  ✗ не загрузился ' + f + ': ' + e.message);
    process.exit(1);
  }
}
const API = sandbox.window.IN8B;
const { countries: C, model: M, events: E, engine: EN, names: NM, purchases: PU, portrait: PR, invest: IV,
  algo: AL, pay: PAY, mechanics: MC, variations: VR, batch: BT } = API;
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
/* Детскую смертность считаем отдельной, большой выборкой. Пять лет жизни
   считаются быстро, а на трёх тысячах судеб случайность даёт разброс в
   три промилле — проверка начинает мигать на пустом месте. Двадцать тысяч
   рождений сужают разброс до одного промилле, и допуск можно держать
   строгим. Модель идёт чуть ниже данных: люди рождаются через два года
   после среза, а детская смертность все эти годы падает. */
let infant = 0, u5 = 0;
{
  const n = 20000;
  let inf = 0, dead5 = 0;
  for (let i = 0; i < n; i++) {
    const l = new EN.Life({ seed: 'дети-' + i, silent: true });
    for (let a = 0; a < 5 && l.alive; a++) { if (l.stepYear()) l.autoAnswer(); }
    if (!l.alive && l.dead.age < 1) inf++;
    if (!l.alive && l.dead.age < 5) dead5++;
  }
  infant = inf / n * 1000;
  u5 = dead5 / n * 1000;
}
ok(Math.abs(infant - wImr) < Math.max(4, wImr * 0.2), 'младенческая смертность ' + infant.toFixed(1) + '‰ против данных ' + wImr.toFixed(1) + '‰');
ok(Math.abs(u5 - wU5) < Math.max(5, wU5 * 0.2), 'смертность до 5 лет ' + u5.toFixed(1) + '‰ против данных ' + wU5.toFixed(1) + '‰');
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
/* 400 жизней на страну давали ошибку выборки до полутора лет — в странах с высокой
   детской смертностью разброс возрастов огромен. Берём 1500: случайная ошибка падает
   вдвое с лишним, и проверка ловит именно сдвиг модели, а не невезение жребия. */
const LE_N = 1500;
console.log('\nПродолжительность жизни по странам (по ' + LE_N + ' жизней)');
let sumErr = 0, nC = 0;
for (const code of ['jp', 'de', 'us', 'ru', 'br', 'cn', 'in', 'ng', 'et']) {
  const c = C.byCode[code];
  let s = 0;
  for (let i = 0; i < LE_N; i++) s += new EN.Life({ seed: code + '-' + i, countryCode: code, silent: true }).runToEnd().dead.age;
  const got = s / LE_N, exp = (c.leM + c.leF) / 2;
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

/* ------------- 10в. когда денег нет: улица, кредит, цепочки ------------- */
console.log('\nУлица и долги');

const CHAIN = E.choices.filter((c) => c.chain);
ok(CHAIN.length >= 10, 'карточек-продолжений в цепочках: ' + CHAIN.length);
ok(CHAIN.every((c) => c.title && c.text && c.options.length >= 3),
  'у каждой карточки цепочки есть заголовок, текст и минимум три варианта');
ok(CHAIN.every((c) => c.options.every((o) => o.label && typeof o.run === 'function')),
  'у каждого варианта в цепочке есть подпись и последствие');
['toStreet', 'offStreet', 'streetStep', 'takeLoan', 'loanStep', 'schedule', 'unschedule', 'dueCard']
  .forEach((fn) => ok(typeof EN.Life.prototype[fn] === 'function', 'в движке есть ' + fn + '()'));

/* карточка цепочки приходит ровно в назначенный год и ни годом раньше */
{
  const l = liveTo('очередь', 'ru', 30, 3);
  l.toStreet('проверка очереди');
  l.schedule('street-help', 2);
  const now = l.dueCard();
  ok(now && now.id === 'street-first', 'сразу после улицы приходит «первая ночь»: ' + (now && now.id));
  l.age += 1;
  ok(l.dueCard() === null, 'назначенная на через два года карточка раньше срока не приходит');
  l.age += 1;
  const later = l.dueCard();
  ok(later && later.id === 'street-help', 'в назначенный год карточка приходит: ' + (later && later.id));
}

/* цепочки не лезут в общий пул: без расписания их не бывает */
{
  const sched = EN.Life.prototype.schedule;
  EN.Life.prototype.schedule = function () { return this; };
  let leaked = null;
  for (let i = 0; i < 120 && !leaked; i++) {
    const l = new EN.Life({ seed: 'без-расписания-' + i, countryCode: i % 2 ? 'ng' : 'ru', silent: true });
    l.runToEnd();
    for (const c of CHAIN) if (l.seenEvents['c:' + c.id]) { leaked = c.id; break; }
  }
  EN.Life.prototype.schedule = sched;
  ok(!leaked, 'без расписания карточки цепочек не приходят никогда' + (leaked ? ' — пришла ' + leaked : ''));
}

/* улица: работа и жильё исчезают, риск смерти растёт, долги списывают */
{
  const l = liveTo('на-улицу', 'ru', 42, 5);
  l.home = true; l.flag('mortgage', true);
  l.takeLoan(l.need, 5, 0.15);
  const riskBefore = l.mortalityRisk(l.age);
  l.toStreet('проверка');
  ok(l.homeless === 1 && !l.job && !l.home, 'на улице не остаётся ни работы, ни жилья');
  ok(!l.loan, 'с человека без адреса долг списывают');
  const riskAfter = l.mortalityRisk(l.age);
  ok(riskAfter > riskBefore * 2, 'на улице умирают чаще: риск вырос в ' +
    (riskAfter / riskBefore).toFixed(1) + ' раза');
  l.homeless = 6;
  ok(l.mortalityRisk(l.age) > riskAfter, 'через несколько лет на улице риск ещё выше');
  l.offStreet('проверка возвращения');
  ok(!l.homeless && l.has('wasHomeless') && l.money >= 0,
    'с улицы возвращаются без долгов: деньги не уходят в минус');
}

/* с улицы есть дорога обратно, и она не бесконечная */
{
  let out = 0, years = [];
  for (let i = 0; i < 60; i++) {
    const l = liveTo('выход-' + i, 'ru', 34, 11 + i);
    if (!l.alive) continue;
    l.toStreet('проверка выхода');
    const from = l.age;
    for (let y = 0; y < 25 && l.alive && l.homeless; y++) { if (l.stepYear()) l.autoAnswer(); }
    if (!l.homeless && l.alive) { out++; years.push(l.age - from); }
  }
  const mid = years.sort((a, b) => a - b)[Math.floor(years.length / 2)];
  ok(out >= 30, 'большинство с улицы выбирается: ' + out + ' из 60');
  ok(mid <= 8, 'обычно это занимает несколько лет, а не всю жизнь: медиана ' + mid);
}

/* кредит: деньги сразу, платёж каждый год, закрытие — с отметкой */
{
  const l = liveTo('кредит', 'de', 35, 7);
  const before = l.money;
  l.takeLoan(l.need * 2, 5, 0.1);
  ok(l.money - before >= l.need * 1.9, 'кредит приходит деньгами сразу');
  ok(l.loan && l.loan.pay > 0 && l.loan.left > l.need * 2, 'отдавать придётся больше, чем взяли');
  l.money = l.need * 40;
  for (let y = 0; y < 6; y++) { l.age++; l.loanStep(); }
  ok(!l.loan && l.has('goodCredit'), 'выплаченный кредит закрывается и остаётся в истории');
}

/* не платить нечем: просрочки копятся и зовут на разговор, а потом в суд */
{
  const l = liveTo('просрочка', 'ru', 40, 9);
  l.takeLoan(l.need * 2, 5, 0.2);
  l.money = -l.need;
  const seen = [];
  for (let y = 0; y < 5; y++) {
    l.age++; l.money = -l.need; l.loanStep();
    (l.queue || []).forEach((q) => { if (seen.indexOf(q.id) < 0) seen.push(q.id); });
  }
  ok(l.loan && l.loan.miss >= 3, 'без денег просрочки копятся: ' + (l.loan && l.loan.miss));
  ok(seen.indexOf('loan-trouble') >= 0, 'после второй просрочки зовут на разговор');
  ok(seen.indexOf('loan-court') >= 0 || l.has('inCourt'), 'упорное молчание доводит до суда');
}

/* улица остаётся редкостью и не ломает продолжительность жизни */
{
  let ever = 0, died = 0, n = 0, sumAge = 0;
  for (const code of ['ru', 'us', 'ng', 'in']) {
    for (let i = 0; i < 250; i++) {
      const l = new EN.Life({ seed: 'улица-доля-' + code + '-' + i, countryCode: code, silent: true });
      l.runToEnd();
      n++; sumAge += l.dead.age;
      if (l.has('wasHomeless') || l.homeless) ever++;
      if (l.homeless) died++;
    }
  }
  const pct = ever / n * 100;
  ok(pct > 0.2 && pct < 7, 'без дома за жизнь остаётся ' + pct.toFixed(1) + '% людей');
  ok(died / Math.max(1, ever) < 0.6, 'улица — не приговор: на ней заканчивают ' +
    Math.round(died / Math.max(1, ever) * 100) + '% из тех, кто там оказался');
  ok(sumAge / n > 55 && sumAge / n < 85, 'средний возраст смерти не поехал: ' + (sumAge / n).toFixed(1));
}

/* ------------------------------ 9. имена -------------------------------- */
/* ------------------- 10б. деньги, которые случаются сами ---------------- */
console.log('\nДеньги вокруг человека');

const MONEY_AUTO = E.auto.filter((e) => e.money);
const MONEY_CARDS = E.choices.filter((c) => c.money);
ok(MONEY_AUTO.length >= 25, 'денежных событий в своей очереди: ' + MONEY_AUTO.length);
ok(MONEY_CARDS.length >= 5, 'денежных карточек решений: ' + MONEY_CARDS.length);
ok(MONEY_AUTO.every((e) => typeof e.run === 'function' && Array.isArray(e.age) && e.age.length === 2),
  'у каждого денежного события есть возраст и последствие');
ok(MONEY_CARDS.every((c) => c.title && c.text && c.options.length >= 3),
  'у каждой денежной карточки есть заголовок, текст и минимум три варианта');
ok(typeof EN.Life.prototype.moneyEvent === 'function', 'у денег своя очередь событий в движке');

/* денежные события не лезут в общий пул: иначе они вытеснят болезни и войны */
{
  let leaked = null, fired = 0, inSlot = false;
  const real = {};
  for (const ev of MONEY_AUTO) {
    real[ev.id] = ev.run;
    ev.run = function (x) {
      fired++;
      if (!inSlot && !leaked) leaked = ev.id;
      return real[ev.id].call(null, x);
    };
  }
  const slot = EN.Life.prototype.moneyEvent;
  EN.Life.prototype.moneyEvent = function () {
    inSlot = true;
    try { return slot.call(this); } finally { inSlot = false; }
  };
  for (let i = 0; i < 200; i++) {
    const l = new EN.Life({ seed: 'слот-' + i, silent: true });
    let guard = 0;
    while (l.alive && guard++ < 130) { if (l.stepYear()) l.autoAnswer(); }
  }
  EN.Life.prototype.moneyEvent = slot;
  for (const ev of MONEY_AUTO) ev.run = real[ev.id];
  ok(fired > 100, 'денежные события случаются: ' + fired + ' за 200 жизней');
  ok(!leaked, 'денежные события приходят только из своей очереди' + (leaked ? ': ' + leaked : ''));
}

/* как часто деньги напоминают о себе */
{
  let hits = 0, years = 0, broken = null;
  const ids = new Set();
  for (const code of ['ng', 'in', 'ru', 'us']) {
    for (let i = 0; i < 150; i++) {
      const l = new EN.Life({ seed: 'мон-' + code + '-' + i, countryCode: code, silent: true });
      const real = l.moneyEvent.bind(l);
      l.moneyEvent = function () {
        let ev = null;
        try { ev = real(); } catch (e) { if (!broken) broken = code + ': ' + e.message; }
        if (ev) { hits++; ids.add(ev.id); }
        return ev;
      };
      let guard = 0;
      while (l.alive && guard++ < 130) { if (l.stepYear()) l.autoAnswer(); }
      years += l.dead.age;
    }
  }
  ok(!broken, 'денежные события считаются без ошибок' + (broken ? ': ' + broken : ''));
  const per10 = hits / years * 10;
  ok(per10 > 1 && per10 < 4.5, 'денежных событий на 10 лет жизни: ' + per10.toFixed(2));
  ok(ids.size >= 18, 'разных денежных событий за прогон: ' + ids.size);
}

/* зарплата в конверте: больше на руки — меньше пенсия */
{
  const l = liveTo('конверт', 'ru', 40);
  /* жизнь могла сама застать и конверт, и реформу — считаем от чистого листа */
  l.flag('grey', false); l.flag('pensionCut', false);
  const before = l.pension();
  l.flag('grey', true);
  ok(l.pension() < before * 0.9, 'зарплата в конверте уменьшает будущую пенсию');
  l.flag('grey', false);
  l.flag('pensionCut', true);
  ok(l.pension() < before * 0.9, 'пенсионная реформа уменьшает пенсию');
}

/* пенсионная реформа отодвигает карточку о выходе на покой, но не запирает её */
{
  const card = E.choices.find((c) => c.id === 'retire');
  let checked = 0;
  for (let i = 0; i < 40 && checked < 1; i++) {
    const l = liveTo('реформа-' + i, 'ru', 57);
    if (!l.alive || !l.job || l.retired) continue;
    checked++;
    l.retireLate = 6;
    ok(!card.cond(l.ctx()), 'после реформы карточка о пенсии ещё не приходит');
    l.retireLate = 0;
    ok(card.cond(l.ctx()), 'без реформы карточка о пенсии приходит вовремя');
    const option = card.options[0];
    l.retireLate = 0;
    const view = l.optionView(option, 0, l.ctx());
    ok(!view.locked || view.reqs.some((r) => !r.ok), 'у карточки о пенсии понятно, что мешает выйти на покой');
  }
  ok(checked === 1, 'нашлась работающая жизнь в 57 лет для проверки пенсии');
}

/* микрозайм: деньги сразу, отдавать вдвое */
{
  const l = liveTo('микро', 'ng', 35, 0.02);
  const card = E.choices.find((c) => c.id === 'cash-crunch');
  const opt = card.options.find((o) => o.label.indexOf('микрозайм') >= 0);
  const moneyBefore = l.money;
  opt.run(l.ctx());
  ok(l.money > moneyBefore, 'микрозайм приносит деньги сразу');
  ok(l.microDebt > (l.money - moneyBefore) * 1.5, 'отдавать придётся заметно больше взятого');
  const due = E.auto.find((e) => e.id === 'micro-due');
  const owed = l.microDebt, had = l.money;
  due.run(l.ctx());
  ok(l.microDebt === 0 && Math.abs(had - l.money - owed) < 1, 'срок по микрозайму списывает весь долг');
}

/* дом в наследство можно сдавать — он становится настоящим вложением */
{
  const l = liveTo('наследство', 'ru', 50, 1);
  l.parentsAlive = 0;
  const card = E.choices.find((c) => c.id === 'inherit-house');
  const opt = card.options.find((o) => o.label.indexOf('Сдавать') >= 0);
  const putBefore = l.investedTotal || 0;
  opt.run(l.ctx());
  const h = IV.holdingOf(l, 'rent');
  ok(h && h.val > 0, 'сданный дом записан как вложение');
  ok(h.put === 0 && (l.investedTotal || 0) === putBefore, 'доставшийся даром дом не считается вложенными деньгами');
  l.stepYear();
  ok(l.capitalIncome > 0, 'сданный дом приносит доход каждый год');
}

/* сохранение помнит новые поля */
for (const f of ['retireLate', 'microDebt']) {
  ok(readFileSync(join(root, 'src/save.js'), 'utf8').includes(`'${f}'`), 'сохранение помнит поле ' + f);
}

console.log('\nРабота: профессии, заработок, карьера');

const WK = API.work;
const JOBS = M.jobs;
ok(JOBS.length >= 100, 'профессий в игре: ' + JOBS.length);
ok(new Set(JOBS.map((j) => j.id)).size === JOBS.length, 'все id профессий уникальны');
ok(JOBS.every((j) => j.title && j.sector && j.edu !== undefined && j.wage > 0 && j.risk > 0),
  'у каждой профессии есть название, сектор, образование, оплата и риск');
{
  const sectors = [...new Set(JOBS.map((j) => j.sector))];
  ok(sectors.every((sec) => M.sectorPay(C.byCode.ru, sec) > 0), 'у каждого сектора есть своя оплата: ' + sectors.length);
  const perSector = sectors.map((sec) => JOBS.filter((j) => j.sector === sec).length);
  ok(Math.min(...perSector) >= 5, 'в каждом секторе не меньше пяти профессий (минимум ' + Math.min(...perSector) + ')');
}

/* заработок зависит от страны, профессии, ступени, стажа, знаний, села и пола */
{
  const ru = C.byCode.ru, loader = M.jobById.loader, doc = M.jobById.doctor;
  const w = (c, j, step, know, years, opts) => M.wageFor(c, j, step, know, years, opts || { sex: 'm', urban: true });
  ok(w(ru, doc, 1, 55, 10) > w(ru, loader, 1, 55, 10) * 2, 'врач зарабатывает заметно больше грузчика');
  ok(w(ru, loader, 3, 55, 10) > w(ru, loader, 0, 55, 10) * 1.8, 'ступень карьеры поднимает заработок');
  ok(w(ru, loader, 1, 55, 20) > w(ru, loader, 1, 55, 1) * 1.15, 'стаж поднимает заработок');
  ok(w(ru, loader, 1, 90, 10) > w(ru, loader, 1, 10, 10) * 1.2, 'знания поднимают заработок');
  ok(w(ru, loader, 1, 55, 10, { sex: 'm', urban: false }) < w(ru, loader, 1, 55, 10), 'в селе платят меньше');
  ok(w(ru, loader, 1, 55, 10, { sex: 'f', urban: true }) < w(ru, loader, 1, 55, 10), 'женщинам платят меньше');
  const gapRich = 1 - w(C.byCode.de, loader, 1, 55, 10, { sex: 'f', urban: true }) / w(C.byCode.de, loader, 1, 55, 10);
  const gapPoor = 1 - w(C.byCode.ng, loader, 1, 55, 10, { sex: 'f', urban: true }) / w(C.byCode.ng, loader, 1, 55, 10);
  ok(gapPoor > gapRich, 'в бедной стране разрыв в оплате между мужчиной и женщиной больше: ' +
    Math.round(gapPoor * 100) + '% против ' + Math.round(gapRich * 100) + '%');
  ok(w(C.byCode.us, doc, 1, 55, 10) > w(ru, doc, 1, 55, 10) && w(ru, doc, 1, 55, 10) > w(C.byCode.ng, doc, 1, 55, 10),
    'одна и та же профессия в богатой стране оплачивается выше');
  const ratioPoor = w(C.byCode.ng, doc, 1, 55, 10) / w(C.byCode.ng, loader, 1, 55, 10);
  const ratioRich = w(C.byCode.us, doc, 1, 55, 10) / w(C.byCode.us, loader, 1, 55, 10);
  ok(ratioPoor > ratioRich, 'в бедной стране разрыв между врачом и грузчиком больше: ×' +
    ratioPoor.toFixed(1) + ' против ×' + ratioRich.toFixed(1));
}

/* профессии знают своё время и своё место */
{
  const rnd = M.makeRng(M.hashSeed('профессии'));
  const old = M.jobsFor(C.byCode.ru, 6, rnd, { year: 1960, urban: true }).map((p) => p.job.id);
  const now = M.jobsFor(C.byCode.ru, 6, rnd, { year: 2020, urban: true }).map((p) => p.job.id);
  ok(!old.includes('it') && now.includes('it'), 'программиста нет в 1960 году и есть в 2020');
  const village = M.jobsFor(C.byCode.ru, 6, rnd, { year: 2020, urban: false }).map((p) => p.job.id);
  ok(!village.includes('barista'), 'в селе нет бариста');
  const rich = M.jobsFor(C.byCode.de, 3, rnd, { year: 2020, urban: true }).map((p) => p.job.id);
  ok(!rich.includes('planter'), 'в богатой стране нет сборщика на плантации');
}

/* уровень заработка: медиана своего дохода в 42 года — около половины ВВП на душу */
{
  const rows = [];
  for (const code of ['ru', 'us', 'in', 'ng']) {
    const own = [];
    for (let i = 0; i < 220; i++) {
      const l = new EN.Life({ seed: 'зп-' + code + '-' + i, countryCode: code, silent: true });
      while (l.alive && l.age < 42) { if (l.stepYear()) l.autoAnswer(); }
      if (l.alive && l.job) own.push(l.ownIncome);
    }
    own.sort((a, b) => a - b);
    rows.push([code, own[Math.floor(own.length / 2)] / C.byCode[code].gdp]);
  }
  ok(rows.every((r) => r[1] > 0.3 && r[1] < 0.85), 'свой заработок в 42 года — доля ВВП на душу: ' +
    rows.map((r) => r[0] + ' ' + r[1].toFixed(2)).join(' · '));
}

/* снежного кома больше нет: доход не умножается сам на себя год за годом */
{
  const l = new EN.Life({ seed: 'снежный-ком', countryCode: 'ru', silent: true });
  let worst = 0, prev = 0;
  while (l.alive && l.age < 60) {
    if (l.stepYear()) l.autoAnswer();
    if (l.job && prev > 0) worst = Math.max(worst, l.ownIncome / prev);
    if (l.job) prev = l.ownIncome;
  }
  ok(worst < 2.6, 'за год свой заработок не вырастает в разы: худший скачок ×' + worst.toFixed(2));
  const top = M.wageFor(C.byCode.ru, M.jobById[l.job ? l.job.id : 'doctor'], 4, 100, 40, { sex: 'm', urban: true }) * 6;
  ok(!l.alive || l.ownIncome < top, 'заработок остаётся в пределах таблицы профессий');
}

/* карьера — пирамида: наверх проходят единицы */
{
  let high = 0, n = 0;
  for (let i = 0; i < 300; i++) {
    const l = new EN.Life({ seed: 'карьера-' + i, countryCode: 'de', silent: true });
    while (l.alive && l.age < 45) { if (l.stepYear()) l.autoAnswer(); }
    if (l.alive && l.job) { n++; if (l.job.step >= 3) high++; }
  }
  ok(n > 50 && high / n < 0.3, 'к 45 годам «ведущим» и «главным» стал не каждый: ' +
    Math.round(high / n * 100) + '%');
  ok(JOBS.every((j) => M.topStep(j) >= 1 && M.topStep(j) <= 4), 'у каждой профессии есть свой потолок ступеней');
  ok(M.topStep(M.jobById.loader) < M.topStep(M.jobById.doctor), 'у грузчика потолок ниже, чем у врача');
  ok(M.promoteOdds(0) > M.promoteOdds(1) && M.promoteOdds(1) > M.promoteOdds(2) && M.promoteOdds(4) === 0,
    'с каждой ступенью подняться выше труднее');
}

/* слой работы: свои события, свои карточки */
ok(WK && WK.auto.length >= 100, 'рабочих событий: ' + (WK ? WK.auto.length : 0));
ok(WK.auto.every((e) => typeof e.run === 'function' && Array.isArray(e.age) && e.age.length === 2),
  'у каждого рабочего события есть возраст и последствие');
ok(new Set(WK.auto.map((e) => e.id)).size === WK.auto.length, 'все id рабочих событий уникальны');
ok(WK.choices.length >= 15, 'карточек решений о работе: ' + WK.choices.length);
{
  const opts = WK.choices.reduce((a, c) => a + c.options.length, 0);
  ok(opts >= 100, 'вариантов ответа о работе: ' + opts);
  ok(WK.choices.every((c) => c.title && c.text && c.options.length >= 5),
    'у каждой рабочей карточки есть заголовок, текст и минимум пять вариантов');
  ok(WK.choices.every((c) => c.work === true), 'все рабочие карточки помечены своим слотом');
  ok(WK.choices.every((c) => c.options.every((o) => o.label && typeof o.run === 'function')),
    'у каждого варианта есть название и последствие');
}
ok(typeof EN.Life.prototype.workEvent === 'function', 'у работы своя очередь событий в движке');

/* рабочие события не лезут в общий пул */
{
  let leaked = null, fired = 0, inSlot = false;
  const real = {};
  for (const ev of WK.auto) {
    real[ev.id] = ev.run;
    ev.run = function (x) { fired++; if (!inSlot && !leaked) leaked = ev.id; return real[ev.id].call(null, x); };
  }
  const slot = EN.Life.prototype.workEvent;
  EN.Life.prototype.workEvent = function () { inSlot = true; const r = slot.call(this); inSlot = false; return r; };
  for (let i = 0; i < 40; i++) {
    const l = new EN.Life({ seed: 'раб-поток-' + i, silent: true });
    while (l.alive && l.age < 80) { if (l.stepYear()) l.autoAnswer(); }
  }
  EN.Life.prototype.workEvent = slot;
  for (const ev of WK.auto) ev.run = real[ev.id];
  ok(!leaked, 'рабочие события приходят только в свой слот' + (leaked ? ' — утекло ' + leaked : ''));
  ok(fired > 100, 'за 40 жизней рабочих событий случилось: ' + fired);
}

/* место работы — это не только название профессии */
{
  const l = new EN.Life({ seed: 'место-работы', countryCode: 'ru', silent: true });
  while (l.alive && l.age < 30 && !l.job) { if (l.stepYear()) l.autoAnswer(); }
  const w = l.job;
  ok(!!w && ['official', 'grey', 'none'].includes(w.contract), 'у работы есть оформление: ' + (w && w.contract));
  ok(!!w && ['day', 'shift', 'night', 'rotation'].includes(w.schedule), 'у работы есть график: ' + (w && w.schedule));
  ok(!!w && w.rep >= 0 && w.mood >= 0 && w.safety > 0 && w.boss >= -3 && w.boss <= 3,
    'у работы есть репутация, отношение, охрана труда и начальник');
  ok(typeof l.career === 'object' && Array.isArray(l.career.held), 'у человека есть трудовая книжка');
}

/* деньги за работу: конверт, переработки, разряды, ночные смены */
{
  const base = () => {
    const l = new EN.Life({ seed: 'надбавки', countryCode: 'ru', silent: true });
    while (l.alive && l.age < 30 && !l.job) { if (l.stepYear()) l.autoAnswer(); }
    l.job.contract = 'official'; l.job.overtime = 0; l.job.certs = 0; l.job.union = false;
    l.job.schedule = 'day'; l.job.remote = false; l.job.rep = 50; l.job.boost = 1; l.job.payDelay = 0;
    return l;
  };
  const l0 = base(), p0 = l0.jobPay();
  const l1 = base(); l1.job.contract = 'grey';
  const l2 = base(); l2.job.overtime = 2;
  const l3 = base(); l3.job.certs = 2;
  const l4 = base(); l4.job.schedule = 'night';
  const l5 = base(); l5.job.payDelay = 1;
  ok(l1.jobPay() > p0, 'в конверте на руки выходит больше');
  ok(l2.jobPay() > p0, 'переработки прибавляют к заработку');
  ok(l3.jobPay() > p0, 'разряды и курсы прибавляют к заработку');
  ok(l4.jobPay() > p0, 'за ночные смены платят больше');
  ok(l5.jobPay() < p0, 'при задержке зарплаты на руки приходит меньше');
}

/* работа берёт плату здоровьем и временем */
{
  let hurtRisky = 0, hurtSafe = 0, firedAny = 0, n = 0;
  for (let i = 0; i < 160; i++) {
    const l = new EN.Life({ seed: 'износ-' + i, countryCode: 'ru', silent: true });
    while (l.alive && l.age < 60) { if (l.stepYear()) l.autoAnswer(); }
    n++;
    if (l.career.injuries) {
      const risky = (l.career.held || []).some((id) => M.jobById[id] && M.jobById[id].risk > 1.3);
      if (risky) hurtRisky++; else hurtSafe++;
    }
    if (l.career.fired) firedAny++;
  }
  ok(hurtRisky + hurtSafe > 0, 'травмы на работе случаются: у ' + (hurtRisky + hurtSafe) + ' из ' + n + ' жизней');
  ok(firedAny > 0 && firedAny < n, 'увольняют не всех и не никого: ' + firedAny + ' из ' + n);
}

/* выгорание копится от переработок и гаснет от отпуска */
{
  const withJob = () => {
    for (let i = 0; i < 40; i++) {
      const l = new EN.Life({ seed: 'выгорание-' + i, countryCode: 'ru', silent: true });
      while (l.alive && l.age < 36 && !l.job) { if (l.stepYear()) l.autoAnswer(); }
      if (l.job) return l;
    }
    return null;
  };
  const mk = (over) => {
    const l = withJob();
    if (!l) return over;                       /* работы не нашлось — проверять нечего */
    l.job.overtime = over; l.job.burnout = 20; l.job.mood = 50; l.job.boss = 0;
    for (let i = 0; i < 4; i++) l.jobWear(M.jobById[l.job.id]);
    return l.job.burnout;
  };
  ok(mk(3) > mk(0), 'переработки копят выгорание: ' + Math.round(mk(3)) + ' против ' + Math.round(mk(0)));
}

/* сохранение помнит новую работу целиком */
{
  const SV = { job: 1, career: 1 };
  const src = readFileSync(join(root, 'src/save.js'), 'utf8');
  for (const f of Object.keys(SV)) ok(src.includes("'" + f + "'"), 'сохранение помнит поле ' + f);
}

/* --------------------------- 9б. валюта стран --------------------------- */
/* ------------------ 9а. детские деньги и сто видов оплаты --------------- */
console.log('\nДеньги ребёнка: откуда они берутся');
{
  /* главная проверка: у ребёнка не бывает взрослого дохода */
  let worst = 0, worstAt = '', debts = 0, supported = 0, years = 0;
  for (const code of ['ru', 'us', 'ng', 'in', 'de', 'br', 'et', 'cn']) {
    const l = new EN.Life({ seed: 'детство-' + code, countryCode: code, silent: true, settings: { year: 2020 } });
    while (l.alive && l.age < 18) {
      if (l.stepYear()) l.autoAnswer();
      if (l.age < 18 && !l.job && l.minorYear) {
        years++;
        if (l.money < 0) debts++;
        if (l.support > 0) supported++;
        const share = l.ownIncome / l.need;
        if (share > worst) { worst = share; worstAt = code + ' в ' + l.age; }
      }
    }
  }
  ok(worst < 0.4, 'свой доход ребёнка — это карманные, а не зарплата: максимум ' +
    (worst * 100).toFixed(0) + '% стоимости года (' + worstAt + ')');
  ok(debts === 0, 'ребёнок не уходит в долги: ' + debts + ' случаев из ' + years);
  ok(supported === years, 'ребёнка содержит семья во все ' + years + ' детских лет');

  /* а в бедной стране подросток действительно работает */
  let childWork = 0;
  for (let i = 0; i < 40; i++) {
    const l = new EN.Life({ seed: 'труд-' + i, countryCode: 'et', silent: true, settings: { year: 2020 } });
    while (l.alive && l.age < 17) if (l.stepYear()) l.autoAnswer();
    if (l.job || (l.payActive || []).some((id) => ['herding', 'harvest-kid', 'market-help', 'bottles'].includes(id))) childWork++;
  }
  ok(childWork > 0, 'в бедной стране подростки работают: ' + childWork + ' из 40');
}

console.log('\nСто видов заработка');
{
  ok(PAY.list.length === 100, 'видов заработка: ' + PAY.list.length);
  ok(PAY.auto.length === 100, 'у каждого вида своё событие: ' + PAY.auto.length);
  const kinds = {};
  PAY.list.forEach((p) => { kinds[p.kind] = (kinds[p.kind] || 0) + 1; });
  ok(PAY.kinds.every((k) => kinds[k] > 0), 'заполнены все группы: ' +
    PAY.kinds.map((k) => k + ' ' + kinds[k]).join(', '));
  ok(PAY.list.every((p) => p.id && p.name && p.ev && typeof p.ev.run === 'function'),
    'у каждого вида есть имя и событие');
  ok(new Set(PAY.list.map((p) => p.id)).size === 100, 'имена видов не повторяются');
  ok(PAY.list.every((p) => /^[a-z0-9-]+$/.test(p.id)), 'имена видов записаны латиницей без опечаток');
  ok(PAY.list.filter((p) => p.kind === 'wage').every((p) => typeof p.mult === 'number' && p.mult > 0.5 && p.mult < 1.6),
    'формы оплаты двигают зарплату в разумных пределах');
  ok(PAY.list.filter((p) => p.kind !== 'wage').every((p) => typeof p.amount === 'function'),
    'у неосновных заработков есть сумма');

  /* суммы считаются и не улетают */
  const l = new EN.Life({ seed: 'виды-ru', countryCode: 'ru', silent: true, settings: { year: 2020 } });
  while (l.alive && l.age < 40) if (l.stepYear()) l.autoAnswer();
  let bad = null;
  PAY.list.forEach((p) => {
    const v = PAY.amountOf(l, p);
    if (!Number.isFinite(v) || v < 0 || v > l.need * 2) bad = p.id + '=' + v;
  });
  ok(!bad, 'сумма любого заработка считается и остаётся в пределах года жизни' + (bad ? ': ' + bad : ''));

  /* сколько видов человек проживает за жизнь */
  const seen = new Set();
  for (let i = 0; i < 60; i++) {
    const x = new EN.Life({ seed: 'виды-' + i, silent: true });
    while (x.alive) { if (x.stepYear()) x.autoAnswer(); (x.payActive || []).forEach((id) => seen.add(id)); if (x.payWage) seen.add(x.payWage); }
  }
  ok(seen.size >= 70, 'за 60 жизней встретилось разных видов заработка: ' + seen.size);
}

console.log('\n250 механик и 250 вариаций');
{
  ok(MC.count === 250, 'механик: ' + MC.count);
  ok(MC.list.every((x) => x.id && x.name && typeof x.run === 'function' && ['early', 'money', 'late'].includes(x.hook)),
    'у каждой механики есть имя, хук и правило');
  ok(new Set(MC.list.map((x) => x.id)).size === 250, 'имена механик не повторяются');
  ok(VR.count === 250, 'вариаций: ' + VR.count);
  ok(new Set(VR.list.map((x) => x.id)).size === 250, 'имена вариаций не повторяются');
  ok(VR.list.every((v) => v.name && v.tag && typeof v.w === 'function' && typeof v.apply === 'function'),
    'у каждой вариации есть имя, группа, вес и действие');
  ok(VR.tags.every((t) => VR.list.some((v) => v.tag === t)), 'заполнены все группы вариаций: ' + VR.tags.join(', '));

  const firedAll = new Set(), varsAll = new Set();
  let errs = 0, lives = 0;
  for (let i = 0; i < 220; i++) {
    const l = new EN.Life({ seed: 'мех-' + i, silent: true });
    l.runToEnd();
    lives++;
    if (l.mechErrors && l.mechErrors.length) errs += l.mechErrors.length;
    Object.keys(l.mechFired || {}).forEach((id) => firedAll.add(id));
    (l.variations || []).forEach((id) => varsAll.add(id));
    if (l.variations.length < 1 || l.variations.length > 4) errs++;
  }
  ok(errs === 0, 'за ' + lives + ' жизней механики не выдали ни одной ошибки');
  ok(firedAll.size >= 215, 'за ' + lives + ' жизней сработало механик: ' + firedAll.size + ' из 250');
  ok(varsAll.size >= 160, 'за ' + lives + ' жизней выпало вариаций: ' + varsAll.size + ' из 250');

  /* вариации двигают жизнь, но не ломают её */
  const a = new EN.Life({ seed: 'вар-1', countryCode: 'ru', silent: true });
  ok(a.variations.length >= 1 && a.stats.health >= 0 && a.stats.health <= 100, 'вариации применились и не вывели показатели за границы');
  for (let i = 0; i < a.variations.length; i++) {
    for (let j = i + 1; j < a.variations.length; j++) {
      ok(!VR.conflicts(a.variations[i], a.variations[j]), 'вариации не противоречат друг другу');
    }
  }
}

console.log('\n250 алгоритмов');
{
  ok(AL.count === 250, 'алгоритмов: ' + AL.count);
  ok(AL.missing.length === 0, 'у каждого имени есть функция' + (AL.missing.length ? ': нет ' + AL.missing.join(' ') : ''));
  ok(Object.keys(AL.doc).every((k) => AL.doc[k] && /[а-яё]/i.test(AL.doc[k])), 'все описания на русском');
  ok(Math.abs(AL.normalQuantile(0.9) - 1.2816) < 0.001, 'обратная нормаль: 90-й процентиль = 1,2816');
  ok(Math.abs(AL.erf(1) - 0.8427) < 0.001, 'функция ошибок: erf(1) = 0,8427');
  ok(AL.median([3, 1, 2]) === 2 && AL.percentile([1, 2, 3, 4], 0.5) === 2.5, 'медиана и процентиль');
  ok(Math.abs(AL.gini([1, 1, 1, 1]) - 0) < 1e-9 && AL.gini([0, 0, 0, 10]) > 0.7, 'Джини: равенство 0, крайность близко к 1');
  ok(Math.round(AL.annuity(100000, 0.12, 5)) === 27741, 'платёж по кредиту 100 000 под 12% на 5 лет = 27 741');
  ok(Math.abs(AL.npv(0.1, [-100, 60, 60]) - 4.13) < 0.02, 'приведённая стоимость считается');
  ok(Math.abs(AL.irr([-100, 60, 60]) - 0.1306) < 0.002, 'доходность вложения: 13,1%');
  ok(AL.progressiveTax(1000, [[200, 0], [500, 0.1], [1000, 0.2]]) === 130, 'налог по шкале = 130');
  ok(AL.payoffYears(100000, 0.1, 5000) === Infinity, 'платёж меньше процентов — долг не закрыть никогда');
  ok(AL.plural(21, 'год', 'года', 'лет') === 'год' && AL.plural(23, 'год', 'года', 'лет') === 'года' &&
    AL.plural(25, 'год', 'года', 'лет') === 'лет', 'склонение лет');
  ok(AL.levenshtein('кот', 'крот') === 1 && AL.levenshtein('', 'дом') === 3, 'похожесть слов');
  ok(AL.roundNice(1968.37) === 1950 && AL.roundNice(7) === 7, 'круглые суммы');
  ok(AL.clamp(5, 0, 3) === 3 && AL.lerp(0, 10, 0.5) === 5 && AL.smoothstep(0.5) === 0.5, 'кривые и границы');
  ok(AL.binarySearch([1, 3, 5, 7], 5) === 2 && AL.lowerBound([1, 3, 5], 4) === 2, 'поиск по отсортированному');
  ok(AL.argmax([1, 9, 3]) === 1 && AL.topK([5, 2, 9], 2).join() === '9,5', 'максимумы');
  const rnd = AL.mulberry32(AL.hashSeed('алгоритмы'));
  const draws = [];
  for (let i = 0; i < 2000; i++) draws.push(AL.normalSample(rnd, 10, 2));
  ok(Math.abs(AL.mean(draws) - 10) < 0.2 && Math.abs(AL.stdev(draws) - 2) < 0.2, 'нормальная случайность даёт заданные среднее и разброс');
  const same = AL.mulberry32(AL.hashSeed('алгоритмы'))();
  ok(same === AL.mulberry32(AL.hashSeed('алгоритмы'))(), 'одно зерно — одно и то же число');
  let allFinite = true;
  AL.ids.forEach((id) => { if (typeof AL[id] !== 'function') allFinite = false; });
  ok(allFinite, 'все 250 имён ведут к функциям');
}

console.log('\nВалюта страны и перевод в рубли');
{
  const noCur = C.list.filter((c) => !C.currency[c.code]);
  ok(noCur.length === 0, 'у каждой из ' + C.list.length + ' стран есть своя валюта' +
    (noCur.length ? ': нет у ' + noCur.map((c) => c.code).join(' ') : ''));
  const badCur = C.list.filter((c) => {
    const u = C.currencyOf(c);
    return !u.sym || !u.name || !(u.k > 0) || !Number.isFinite(u.k) || /[a-zA-Z]/.test(u.name);
  });
  ok(badCur.length === 0, 'у валюты есть знак, название кириллицей и курс больше нуля' +
    (badCur.length ? ': сломано у ' + badCur[0].code : ''));
  ok(C.currencyOf(null).sym === '$' && C.currencyOf({ code: 'zz' }).k === 1,
    'для неизвестной страны остаётся межд. доллар');

  const known = { ru: ['₽', 30], us: ['$', 1], jp: ['¥', 100], in: ['₹', 22], ng: ['₦', 320], de: ['€', 0.73] };
  const wrong = Object.keys(known).filter((k) => {
    const u = C.currencyOf(C.byCode[k]);
    return u.sym !== known[k][0] || u.k !== known[k][1];
  });
  ok(wrong.length === 0, 'рубль, доллар, иена, рупия, найра и евро на своих местах' +
    (wrong.length ? ': не сошлось у ' + wrong.join(' ') : ''));

  /* страны одной валютной зоны считают одинаково */
  const euro = ['de', 'fr', 'it', 'es', 'nl', 'fi', 'gr', 'pt'].map((k) => C.currencyOf(C.byCode[k]));
  ok(euro.every((u) => u.sym === '€' && u.k > 0.4 && u.k < 0.95), 'в еврозоне всюду евро и близкие курсы');
  const cfa = ['ci', 'sn', 'ml', 'cm', 'td'].map((k) => C.currencyOf(C.byCode[k]));
  ok(cfa.every((u) => u.sym === 'FCFA' && u.k > 150 && u.k < 350), 'страны зоны франка КФА считают в одних деньгах');

  /* месячная зарплата уборщика в местных деньгах — осмысленное число */
  const samples = ['ru', 'us', 'ng', 'in', 'jp', 'br'].map((k) => {
    const c = C.byCode[k]; const u = C.currencyOf(c);
    const wage = M.wageFor(c, M.jobById['cleaner'], 1, 50, 10, { sex: 'm', urban: true });
    return { k, m: (wage * u.k) / 12, sym: u.sym, rub: (wage * 30) / 12 };
  });
  ok(samples.every((x) => x.m > 100 && Number.isFinite(x.m)),
    'зарплата уборщика в местных деньгах: ' + samples.map((x) => x.k + ' ' + Math.round(x.m) + ' ' + x.sym).join(' · '));
  ok(samples.every((x) => x.rub > 2000 && x.rub < 400000),
    'та же зарплата в рублях: ' + samples.map((x) => x.k + ' ' + Math.round(x.rub) + ' ₽').join(' · '));

  /* перевод в рубли не меняет порядок: где доход выше, там и рублей больше */
  const order = ['et', 'ng', 'in', 'br', 'ru', 'de', 'us'].map((k) => C.byCode[k].gdp * 30);
  ok(order.every((v, i) => i === 0 || v > order[i - 1]),
    'рублёвая подпись сохраняет разницу между странами: ' +
    order.map((v) => Math.round(v / 1000) + ' тыс').join(' < '));

  /* суммы внутри текстов событий печатаются в валюте страны */
  const cashNg = M.cash(1000, C.byCode['ng']);
  const cashRu = M.cash(1000, C.byCode['ru']);
  ok(cashNg.endsWith('₦') && cashRu.endsWith('₽') && cashNg !== cashRu,
    'в тексте события сумма идёт в местной валюте: ' + cashNg + ' / ' + cashRu);
  ok(M.cash(1000, C.byCode['ru']).replace(/\s/g, '') === '30000₽',
    '1000 межд. долларов в России — это 30 000 ₽');

  /* интерфейс знает про режим «валюта страны» и не потерял старые варианты */
  const ui = readFileSync(join(root, 'src/ui.js'), 'utf8');
  ok(/id: 'local'/.test(ui) && ui.indexOf("id: 'local'") < ui.indexOf("id: 'rub'"),
    'в списке валют «Валюта страны» идёт первой');
  for (const id of ['rub', 'usd', 'eur', 'int']) ok(ui.includes("id: '" + id + "'"), 'остался выбор валюты: ' + id);
  ok(/function rub\(/.test(ui) && ui.includes("' ₽'"), 'интерфейс умеет подписывать сумму в рублях');
  ok((ui.match(/rubTag\(/g) || []).length >= 10, 'рублёвая подпись стоит под суммами в разных местах: ' +
    (ui.match(/rubTag\(/g) || []).length);
  const saveSrc = readFileSync(join(root, 'src/save.js'), 'utf8');
  ok(/currency: 'local'/.test(saveSrc), 'по умолчанию суммы показываются в валюте страны');
  const htmlSrc = readFileSync(join(root, 'index.html'), 'utf8');
  ok(htmlSrc.includes('id="income-rub"'), 'в шапке есть строка перевода дохода в рубли');
  const cssSrc = readFileSync(join(root, 'style.css'), 'utf8');
  ok(/\.in-rub\s*\{/.test(cssSrc), 'у рублёвой подписи есть свой стиль');
}

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

/* --------------------- 20. тысяча жизней (пачка) ------------------------ */
console.log('\nПакетный прогон');

ok(typeof BT.make === 'function' && typeof BT.summarize === 'function', 'модуль пачки на месте');

// прогон идёт порциями и никогда не перескакивает заданное число жизней
const run = BT.make({ count: 40, seed: 'тест-пачки' });
let guardSteps = 0;
let sawPartial = false;
while (!run.finished && guardSteps++ < 400) {
  run.step(0);                      /* нулевой бюджет — по одной жизни за шаг */
  if (run.done > 0 && run.done < run.total) sawPartial = true;
}
ok(run.finished && run.done === 40, 'порционный прогон закончил ровно 40 жизней: ' + run.done);
ok(sawPartial, 'прогон отдаёт управление между порциями');
ok(run.errors === 0, 'ни одна жизнь не упала с ошибкой' + (run.lastError ? ': ' + run.lastError : ''));
ok(run.rows.length === 40, 'записей о жизнях: ' + run.rows.length);

const rowKeys = ['age', 'cause', 'code', 'sex', 'edu', 'kids', 'money', 'income'];
ok(run.rows.every((r) => rowKeys.every((k) => r[k] !== undefined)), 'в записи есть все нужные поля');
ok(run.rows.every((r) => r.age >= 0 && r.age <= 120 && Number.isFinite(r.age)), 'возраст в разумных границах');
ok(run.rows.every((r) => C.byCode[r.code]), 'страна каждой записи есть в справочнике');
ok(run.rows.every((r) => typeof r.cause === 'string' && r.cause.length), 'у каждой записи есть причина ухода');

// один и тот же seed даёт тот же результат — прогон можно повторить
const twin = BT.make({ count: 12, seed: 'повтор' }).all();
const twin2 = BT.make({ count: 12, seed: 'повтор' }).all();
ok(twin.meanAge === twin2.meanAge && twin.imr === twin2.imr, 'одно зерно — один и тот же результат');
const other = BT.make({ count: 12, seed: 'другое' }).all();
ok(other.meanAge !== twin.meanAge, 'другое зерно — другие жизни');

// сводка считается по простым, проверяемым руками правилам
const rows = [
  { age: 0, cause: 'роды', code: 'in', sex: 'f', urban: false, edu: 0, job: null, kids: 0,
    married: false, street: false, abroad: false, money: 0, income: 0, gdp: 2500 },
  { age: 50, cause: 'инсульт', code: 'ru', sex: 'm', urban: true, edu: 3, job: 'driver', kids: 2,
    married: true, street: true, abroad: false, money: 100, income: 600000, gdp: 13000 },
  { age: 90, cause: 'старость', code: 'ru', sex: 'f', urban: true, edu: 5, job: 'teacher', kids: 2,
    married: true, street: false, abroad: true, money: 300, income: 400000, gdp: 13000 },
  { age: 4, cause: 'воспаление лёгких', code: 'ng', sex: 'm', urban: false, edu: 0, job: null, kids: 0,
    married: false, street: false, abroad: false, money: 0, income: 0, gdp: 2000 }
];
const st = BT.summarize(rows);
ok(st.count === 4, 'сводка видит все записи');
ok(Math.abs(st.meanAge - 36) < 1e-9, 'средний возраст 36: ' + st.meanAge);
ok(st.medianAge === 27, 'медианный возраст 27: ' + st.medianAge);
ok(Math.abs(st.imr - 250) < 1e-9, 'младенческая смертность 250‰: ' + st.imr);
ok(Math.abs(st.u5 - 500) < 1e-9, 'смертность до пяти 500‰: ' + st.u5);
ok(Math.abs(st.to90 - 25) < 1e-9, 'до 90 дожили 25 %: ' + st.to90);
ok(Math.abs(st.to60 - 25) < 1e-9, 'до 60 дожили 25 %: ' + st.to60);
ok(Math.abs(st.kids - 1) < 1e-9, 'детей в среднем 1: ' + st.kids);
ok(Math.abs(st.married - 50) < 1e-9, 'в браке половина: ' + st.married);
ok(Math.abs(st.homeless - 25) < 1e-9, 'на улице четверть: ' + st.homeless);
ok(Math.abs(st.noJob - 50) < 1e-9, 'без работы половина: ' + st.noJob);
ok(st.income === 500000, 'медианный доход среди работавших: ' + st.income);
ok(st.countries === 3, 'разных стран три: ' + st.countries);
ok(st.byCountry[0].key === 'ru' && Math.abs(st.byCountry[0].share - 50) < 1e-9, 'самая частая страна — Россия');
ok(st.byCountry[0].name === C.byCode.ru.name, 'страна в сводке названа по-человечески');
ok(st.byCause.length === 4 && st.byCause.every((x) => x.n === 1), 'причины ухода разложены по одной');
ok(st.byJob.length === 2, 'профессий в сводке две: ' + st.byJob.length);
ok(st.oldest.age === 90 && st.youngest.age === 0, 'найдены самый долгий и самый короткий путь');

// кривая дожития: начинается с единицы, не растёт и повторяет записи
ok(st.survival.length === BT.maxAge + 1, 'кривая дожития на каждый год до ' + BT.maxAge + ': ' + st.survival.length);
ok(st.survival[0] === 1, 'в нулевом возрасте живы все');
ok(Math.abs(st.survival[1] - 0.75) < 1e-9, 'после первого года осталось 75 %: ' + st.survival[1]);
ok(Math.abs(st.survival[50] - 0.5) < 1e-9, 'к 50 годам осталась половина: ' + st.survival[50]);
ok(Math.abs(st.survival[90] - 0.25) < 1e-9, 'до 90 дошла четверть: ' + st.survival[90]);
ok(st.survival.every((v, i) => i === 0 || v <= st.survival[i - 1] + 1e-12), 'кривая дожития только убывает');

// пустая пачка не должна ронять интерфейс
const empty = BT.summarize([]);
ok(empty.count === 0 && empty.meanAge === 0 && Array.isArray(empty.survival), 'пустая сводка не падает');

// ожидание берётся из демографии: мир в целом и отдельная страна
const expWorld = BT.expected();
ok(expWorld.le > 65 && expWorld.le < 78, 'ожидаемая ОПЖ мира: ' + expWorld.le.toFixed(1));
ok(expWorld.imr > 15 && expWorld.imr < 45, 'ожидаемая младенческая смертность мира: ' + expWorld.imr.toFixed(1));
const expJp = BT.expected('jp');
ok(expJp.name === C.byCode.jp.name && expJp.le > 83, 'ожидание по Японии: ' + expJp.le.toFixed(1));

// пачка по одной стране рождает только в ней
const one = BT.make({ count: 15, seed: 'только-япония', countryCode: 'jp' });
one.all();
ok(one.rows.every((r) => r.code === 'jp'), 'пачка по стране рождает только в ней');

if (failed) { console.error(`\n✗ Провалено проверок: ${failed}`); process.exit(1); }
console.log('\n✓ Все проверки пройдены');
