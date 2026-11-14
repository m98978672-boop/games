// 1 ИЗ 8 МИЛЛИАРДОВ — бот-тестировщик.
//
// Бот играет в игру вместо человека: берёт случайные страны и эпохи,
// проживает жизни целиком, нажимает кнопки шестью разными способами
// (наугад, всегда первое, всегда последнее, самое дорогое, самое
// осторожное, нейтральный автоответ) и каждый год проверяет три
// десятка правил, которые в правильной игре нарушаться не могут:
// у ребёнка нет зарплаты и долгов, показатели лежат в 0–100, деньги
// не превращаются в NaN, событие не приходит раньше своего возраста,
// сохранение восстанавливается байт в байт, одно зерно — одна жизнь.
//
// Каждая находка печатается с зерном, возрастом и страной, чтобы её
// можно было повторить. Если найдено хоть одно нарушение — бот
// возвращает ненулевой код выхода.
//
// Запуск:  node 1in8b/tests/bot.mjs [жизней] [--quiet]
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const LIVES = Number(process.argv[2]) || 420;
const QUIET = process.argv.includes('--quiet');

/* ------------------------------ загрузка ------------------------------- */
const sandbox = { window: {}, console, Math, Date, JSON };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
sandbox.matchMedia = () => ({ matches: false });
const FILES = ['src/algo.js', 'src/countries.js', 'src/names.js', 'src/model.js', 'src/events.js',
  'src/work.js', 'src/pay.js', 'src/mechanics.js', 'src/variations.js', 'src/engine.js',
  'src/purchases.js', 'src/invest.js', 'src/textures.js', 'src/models.js', 'src/portrait.js', 'src/save.js'];
for (const f of FILES) {
  try { vm.runInContext(readFileSync(join(root, f), 'utf8'), sandbox, { filename: f }); }
  catch (e) { console.error('✗ не загрузился ' + f + ': ' + e.message); process.exit(1); }
}
const API = sandbox.window.IN8B;
const { countries: C, model: M, engine: EN, pay: PAY, mechanics: MC, variations: VR, events: EV, work: WK } = API;

/* ------------------------------ находки -------------------------------- */
const found = new Map();        // правило → список находок
const checked = new Map();      // правило → сколько раз проверено
function check(rule, ok, info) {
  checked.set(rule, (checked.get(rule) || 0) + 1);
  if (ok) return true;
  const list = found.get(rule) || [];
  if (list.length < 4) list.push(info);
  found.set(rule, list);
  return false;
}
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const where = (L) => `${L.c.code} ${L.seed} возраст ${L.age}`;

/* --------------------------- стратегии бота ----------------------------- */
const STRATEGIES = {
  'наугад': (d, L) => Math.floor(L.rnd() * d.options.length),
  'первое': () => 0,
  'последнее': (d) => d.options.length - 1,
  'дорогое': (d) => {
    let bi = 0, bv = -Infinity;
    d.options.forEach((o, i) => { const v = (o.price || 0) + (o.gain || 0); if (v > bv) { bv = v; bi = i; } });
    return bi;
  },
  'осторожное': (d) => {
    let bi = 0, bv = Infinity;
    d.options.forEach((o, i) => { const v = (o.price || 0) - (o.gain || 0) * 0.5; if (v < bv) { bv = v; bi = i; } });
    return bi;
  },
  'нейтрально': null                 // встроенный автоответ движка
};

/* --------------------- проверки одного прожитого года ------------------- */
function auditYear(L, prev) {
  /* в год смерти движок откатывает возраст назад: человек не дожил до дня рождения */
  const died = !L.alive;
  check('возраст растёт на год', L.age === prev.age + 1 || (died && L.age === prev.age), `${where(L)}: было ${prev.age}`);
  check('год совпадает с возрастом', L.year === L.birthYear + L.age + (died ? 1 : 0), `${where(L)}: год ${L.year}`);
  check('деньги — конечное число', fin(L.money), `${where(L)}: money=${L.money}`);
  check('доход — конечное число', fin(L.income), `${where(L)}: income=${L.income}`);
  check('свой доход не отрицателен', L.ownIncome >= -1e-6 && fin(L.ownIncome), `${where(L)}: own=${L.ownIncome}`);
  check('содержание семьи не отрицательно', (L.support || 0) >= 0 && fin(L.support || 0), `${where(L)}: support=${L.support}`);

  for (const k of ['health', 'happy', 'know', 'bond']) {
    check('показатели в 0–100', fin(L.stats[k]) && L.stats[k] >= 0 && L.stats[k] <= 100, `${where(L)}: ${k}=${L.stats[k]}`);
  }
  check('базовое здоровье в границах', fin(L.baseHealth) && L.baseHealth >= 0 && L.baseHealth <= 100, `${where(L)}: base=${L.baseHealth}`);

  /* Главное правило детства: у ребёнка нет зарплаты и нет долгов.
     В год смерти возраст откатывается назад, а деньги посчитаны по
     следующему году, — такие годы не проверяем. Уличный ребёнок
     зарабатывает сам, это отдельный случай. */
  const minor = !!L.minorYear && L.age < 18 && !L.job && !died && !L.homeless;
  if (minor) {
    check('у ребёнка нет взрослого дохода', L.ownIncome <= L.need * 0.4,
      `${where(L)}: свой доход ${Math.round(L.ownIncome)} при стоимости года ${Math.round(L.need)}`);
    check('у ребёнка нет долгов', L.money >= 0, `${where(L)}: накоплено ${Math.round(L.money)}`);
    check('ребёнка содержит семья', L.support > 0, `${where(L)}: support=${L.support}`);
    check('ребёнок не платит налоги', !L.taxPaid || L.taxPaid === 0 || L.age >= 14, `${where(L)}`);
  }
  if (L.age < 5 && !died) check('до пяти лет нет своего заработка', L.ownIncome === 0, `${where(L)}: ${L.ownIncome}`);

  /* работа */
  if (L.job) {
    const jd = M.jobById[L.job.id];
    check('профессия существует', !!jd, `${where(L)}: id=${L.job.id}`);
    if (jd) {
      check('ступень не выше потолка профессии', L.job.step <= M.topStep(jd), `${where(L)}: ${jd.id} ступень ${L.job.step}`);
      check('возраст работы не младше минимального', L.age >= 10, `${where(L)}: работа в ${L.age}`);
    }
    check('стаж не больше возраста', (L.job.years || 0) <= L.age, `${where(L)}: стаж ${L.job.years}`);
    check('зарплата конечна и не отрицательна', fin(L.income) && L.income >= 0, `${where(L)}: ${L.income}`);
  }
  check('карьера не длиннее жизни', (L.career?.years || 0) <= L.age, `${where(L)}: ${L.career?.years}`);

  /* виды заработка */
  check('виды заработка существуют', (L.payActive || []).every((id) => PAY.byId[id]),
    `${where(L)}: ${(L.payActive || []).filter((id) => !PAY.byId[id]).join(' ')}`);
  check('форма оплаты только при работе', !L.payWage || !!L.job, `${where(L)}: ${L.payWage} без работы`);
  check('форма оплаты — вид группы wage', !L.payWage || PAY.byId[L.payWage]?.kind === 'wage', `${where(L)}: ${L.payWage}`);
  check('в списке заработков нет формы оплаты', (L.payActive || []).every((id) => PAY.byId[id].kind !== 'wage'),
    `${where(L)}: ${(L.payActive || []).join(' ')}`);
  check('заработок помимо работы конечен', fin(L.payIncome) && L.payIncome >= 0, `${where(L)}: ${L.payIncome}`);
  check('подработки не больше потолка', (L.payIncome || 0) <= L.need * 1.45, `${where(L)}: ${L.payIncome} при need ${L.need}`);
  for (const id of (L.payActive || [])) {
    const p = PAY.byId[id];
    if (!p) continue;
    check('заработок подходит по возрасту', L.age >= p.age[0] - 1 && L.age <= p.age[1] + 1, `${where(L)}: ${id} в ${L.age}`);
    /* Правило смотрит на возраст, в котором год ПРОЖИТ: в год смерти движок
       откатывает возраст назад, и пятнадцатилетний получал взрослый вид
       заработка «на будущий год» — это не нарушение, а граница года. */
    const livedAge = died ? prev.age + 1 : L.age;
    if (livedAge < 16) check('детям не достаются взрослые приработки', ['child', 'social'].includes(p.kind), `${where(L)}: ${id} (${p.kind})`);
  }

  /* семья, жильё, долги */
  check('детей не больше двенадцати', L.children.length <= 12, `${where(L)}: ${L.children.length}`);
  check('партнёрский доход без партнёра равен нулю', L.partner || (L.partnerIncome || 0) === 0, `${where(L)}: ${L.partnerIncome}`);
  if (L.loan) {
    check('остаток кредита не отрицателен', L.loan.left >= -1e-6 && fin(L.loan.left), `${where(L)}: ${L.loan.left}`);
    check('платёж по кредиту положителен', L.loan.pay > 0 && fin(L.loan.pay), `${where(L)}: ${L.loan.pay}`);
  }
  check('годы без дома не больше возраста', (L.homeless || 0) + (L.streetTotal || 0) <= L.age + 1, `${where(L)}: ${L.homeless}/${L.streetTotal}`);
  check('содержание вещей в разумных долях', fin(L.upkeep) && L.upkeep >= 0 && L.upkeep < 3, `${where(L)}: ${L.upkeep}`);
  check('цены не улетели в бесконечность', fin(L.priceLevel) && L.priceLevel >= 1 && L.priceLevel < 1e4, `${where(L)}: ${L.priceLevel}`);

  /* механики не должны падать молча */
  check('механики работают без ошибок', !L.mechErrors || L.mechErrors.length === 0,
    `${where(L)}: ${(L.mechErrors || []).slice(0, 2).join(' | ')}`);

  /* летопись */
  for (const e of L.log.slice(prev.logLen)) {
    check('запись летописи — непустой текст', typeof e.text === 'string' && e.text.trim().length > 0, `${where(L)}: «${e.text}»`);
    check('запись не из будущего', e.age <= L.age + (died ? 1 : 0), `${where(L)}: запись ${e.age} при возрасте ${L.age}`);
    check('в тексте нет подстановок-пустышек', !/undefined|NaN|\[object/.test(e.text), `${where(L)}: «${e.text}»`);
  }
  const h = L.history[L.history.length - 1];
  if (h) {
    check('строка истории — числа', fin(h.income) && fin(h.money) && fin(h.health), `${where(L)}: ${JSON.stringify(h)}`);
  }
}

/* ---------------------------- проверки жизни ---------------------------- */
function auditLife(L) {
  check('вариаций от одной до четырёх', L.variations.length >= 1 && L.variations.length <= 4, `${where(L)}: ${L.variations.length}`);
  check('вариации существуют', L.variations.every((id) => VR.byId[id]), `${where(L)}: ${L.variations.join(' ')}`);
  for (let i = 0; i < L.variations.length; i++) {
    for (let j = i + 1; j < L.variations.length; j++) {
      check('вариации не противоречат друг другу', !VR.conflicts(L.variations[i], L.variations[j]),
        `${where(L)}: ${L.variations[i]} + ${L.variations[j]}`);
    }
  }
  if (L.dead) {
    check('возраст смерти в пределах возможного', L.dead.age >= 0 && L.dead.age <= 122, `${where(L)}: ${L.dead.age}`);
    check('у смерти есть причина', typeof L.dead.cause === 'string' && L.dead.cause.length > 0, `${where(L)}`);
  }
  const s = L.summary();
  check('итог жизни — текст без пустышек', typeof s === 'string' && s.length > 10 && !/undefined|NaN/.test(s), `${where(L)}: ${s.slice(0, 80)}`);
  const ep = L.epitaph();
  check('эпитафия не пустая', typeof ep === 'string' && ep.length > 3, `${where(L)}`);
  check('достижения — массив', Array.isArray(L.achievements()), `${where(L)}`);
  check('детские деньги не больше взрослого дохода', (L.pocketTotal || 0) < L.need * 12,
    `${where(L)}: накоплено за детство ${Math.round(L.pocketTotal)}`);
}

/* ------------------------- одна прожитая жизнь -------------------------- */
const seenPays = new Set(), seenVars = new Set(), seenMech = new Set();
function playLife(seed, code, year, strategyName) {
  const strat = STRATEGIES[strategyName];
  const L = new EN.Life({ seed, countryCode: code, settings: { year, era: 'today' } });
  let guard = 0;
  while (L.alive && guard++ < 125) {
    const prev = { age: L.age, logLen: L.log.length };
    let decision = null;
    try { decision = L.stepYear(); }
    catch (e) { check('год проходит без исключений', false, `${where(L)} · ${strategyName}: ${e.message}`); break; }
    auditYear(L, prev);
    (L.payActive || []).forEach((id) => seenPays.add(id));
    if (L.payWage) seenPays.add(L.payWage);
    Object.keys(L.mechFired || {}).forEach((id) => seenMech.add(id));
    if (decision) {
      check('у решения есть варианты', decision.options && decision.options.length > 0, `${where(L)}: ${decision.id}`);
      check('у вариантов есть подписи', (decision.options || []).every((o) => typeof o.label === 'string' && o.label.length),
        `${where(L)}: ${decision.id}`);
      try {
        if (strat) L.answer(decision, strat(decision, L) % decision.options.length);
        else L.autoAnswer();
      } catch (e) {
        check('ответ на карточку не роняет игру', false, `${where(L)} · ${decision.id} · ${strategyName}: ${e.message}`);
      }
      check('после ответа деньги конечны', fin(L.money), `${where(L)}: ${decision.id} → ${L.money}`);
    }
    L.pendingReflection = null;
  }
  if (L.alive) L.die('старость');
  auditLife(L);
  return L;
}

/* ------------------------------- прогон --------------------------------- */
const t0 = Date.now();
const codes = C.list.map((c) => c.code);
const stratNames = Object.keys(STRATEGIES);
const rng = M.makeRng(M.hashSeed('бот-тестировщик'));
let dead = 0, ages = [], events = new Set(), pays = new Set(), mechSaid = new Set(), varsSeen = new Set();

for (let i = 0; i < LIVES; i++) {
  const code = codes[Math.floor(rng() * codes.length)];
  const year = 1955 + Math.floor(rng() * 70);
  const strategyName = stratNames[i % stratNames.length];
  const L = playLife('бот-' + i, code, year, strategyName);
  if (L.dead) { dead++; ages.push(L.dead.age); }
  Object.keys(L.seenEvents).forEach((id) => events.add(id));
  (L.variations || []).forEach((id) => varsSeen.add(id));
}

/* ------------------- сохранение и повторяемость ------------------------- */
{
  const SAVE = API.save;
  const L = new EN.Life({ seed: 'бот-сохранение', countryCode: 'ru', settings: { year: 2000 } });
  for (let i = 0; i < 30 && L.alive; i++) { const d = L.stepYear(); if (d) L.autoAnswer(); }
  const snapshot = JSON.parse(JSON.stringify(SAVE.serialize(L)));
  const back = SAVE.restore(snapshot);
  check('сохранение восстанавливает возраст и деньги',
    back.age === L.age && Math.abs(back.money - L.money) < 1e-6, `age ${back.age}/${L.age}, money ${back.money}/${L.money}`);
  check('сохранение помнит виды заработка',
    JSON.stringify(back.payActive || []) === JSON.stringify(L.payActive || []), `${back.payActive} ≠ ${L.payActive}`);
  check('сохранение помнит вариации',
    JSON.stringify(back.variations || []) === JSON.stringify(L.variations || []), `${back.variations} ≠ ${L.variations}`);
  let ok = true;
  try { for (let i = 0; i < 10 && back.alive; i++) { const d = back.stepYear(); if (d) back.autoAnswer(); } }
  catch (e) { ok = false; check('восстановленная жизнь продолжается', false, e.message); }
  if (ok) check('восстановленная жизнь продолжается', fin(back.money) && back.age > L.age, `age ${back.age}`);
}
{
  const run = () => {
    const L = new EN.Life({ seed: 'бот-повтор', countryCode: 'in', silent: true, settings: { year: 1990 } });
    L.runToEnd();
    return { age: L.dead ? L.dead.age : L.age, log: L.log.length, money: Math.round(L.money), vars: (L.variations || []).join(',') };
  };
  const a = run(), b = run();
  check('одно зерно — одна и та же жизнь', JSON.stringify(a) === JSON.stringify(b), `${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`);
}

/* ------------------------------- отчёт ---------------------------------- */
const secs = ((Date.now() - t0) / 1000).toFixed(1);
const rules = [...checked.keys()];
const failures = [...found.entries()];
const avgAge = ages.length ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : '—';

console.log('1 ИЗ 8 МИЛЛИАРДОВ — бот-тестировщик');
console.log(`\nПрожито жизней: ${LIVES} (${stratNames.length} способа играть) · умерло своей смертью: ${dead} · средний возраст: ${avgAge} · ${secs} с`);
console.log(`Проверок: ${[...checked.values()].reduce((a, b) => a + b, 0)} по ${rules.length} правилам`);
seenPays.forEach((id) => pays.add(id));
seenMech.forEach((id) => mechSaid.add(id));
console.log(`Задето: событий ${events.size}, видов заработка ${pays.size}/${PAY.list.length}, механик сработало ${mechSaid.size}/${MC.count}, вариаций ${varsSeen.size}/${VR.list.length}`);

if (!QUIET) {
  const miss = PAY.list.filter((p) => !pays.has(p.id)).map((p) => p.id);
  if (miss.length) console.log(`Не встретились в этом прогоне: ${miss.slice(0, 12).join(', ')}${miss.length > 12 ? ' …' : ''}`);
}

if (!failures.length) {
  console.log('\n✓ Бот не нашёл ни одного нарушения правил');
  process.exit(0);
}
console.log(`\n✗ Найдено нарушений: ${failures.length} правил`);
for (const [rule, list] of failures) {
  console.log(`\n  ✗ ${rule} — ${list.length}${list.length >= 4 ? '+' : ''} раз(а), проверено ${checked.get(rule)}`);
  list.forEach((info) => console.log('      · ' + info));
}
process.exit(1);
