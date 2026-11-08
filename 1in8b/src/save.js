/* ============================================================
   1 ИЗ 8 МИЛЛИАРДОВ — сохранения.
   Всё хранится только в этом браузере (localStorage):
   • текущая незаконченная жизнь — можно продолжить;
   • книга прошлых жизней (до 40 записей);
   • настройки стартового экрана.
   Ничего никуда не отправляется: сервера у игры нет.
   ============================================================ */
(function () {
  'use strict';

  var M = window.IN8B.model;
  var C = window.IN8B.countries;

  var K_LIFE = 'in8b.life.v1';
  var K_PAST = 'in8b.past.v1';
  var K_SET = 'in8b.settings.v1';

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }

  function remove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* приватный режим */ }
  }

  /* поля жизни, которые нужно сохранить (функции и таблицы восстанавливаются) */
  var FIELDS = ['seed', 'settings', 'birthYear', 'sex', 'name', 'given', 'urban', 'famPct', 'famIncome',
    'stats', 'baseHealth', 'medianIncome', 'desiredKids', 'lastChildAge', 'age', 'year', 'alive', 'dead',
    'money', 'income', 'edu', 'job', 'unemployedYears', 'retired', 'marital', 'partner', 'children',
    'grandchildren', 'siblings', 'parentsAlive', 'talents', 'awards', 'flags', 'moves', 'abroad', 'home',
    'business', 'council', 'legacy', 'kidsEducated', 'careerBrake', 'log', 'history', 'seenEvents',
    'budget', 'focus', 'notes', 'marriageAge', 'need', 'warUntil', 'decisions',
    'purchased', 'boughtThisYear', 'upkeep', 'incomeBoost', 'spentTotal', 'given', 'depositYears',
    'assets', 'biz', 'capitalIncome', 'capitalDelta', 'investedTotal', 'capitalTotal',
    'laborIncome', 'bizCount', 'bizFailed', 'boomedBiz', 'retireLate', 'microDebt', 'homeless', 'streetTotal', 'lastEvict', 'loan', 'queue'];

  function serialize(life) {
    var out = { v: 1, countryCode: life.base.code, rng: life.rnd.state() };
    FIELDS.forEach(function (f) { out[f] = life[f]; });
    out.pendingDecisionId = life.pendingDecision ? life.pendingDecision.id : null;
    return out;
  }

  function restore(data) {
    if (!data || !data.seed) return null;
    var Life = window.IN8B.engine.Life;
    var life = new Life({
      seed: data.seed, settings: data.settings, countryCode: data.countryCode, silent: true
    });
    FIELDS.forEach(function (f) { if (data[f] !== undefined) life[f] = data[f]; });
    life.base = C.byCode[data.countryCode] || life.base;
    life.c = M.countryAtYear(life.base, life.birthYear);
    life.table = M.lifeTable(life.sex === 'f' ? life.c.leF : life.c.leM, life.c.u5mr);
    life.rnd.setState(data.rng || 1);
    life.silent = false;
    life.pendingDecision = data.pendingDecisionId ? life.decisionById(data.pendingDecisionId) : null;
    life.pendingReflection = null;
    return life;
  }

  /* -------------------------- текущая жизнь --------------------------- */
  function saveLife(life) { return write(K_LIFE, serialize(life)); }
  function loadLife() { return restore(read(K_LIFE, null)); }
  function hasLife() { return !!read(K_LIFE, null); }
  function clearLife() { remove(K_LIFE); }
  function peekLife() {
    var d = read(K_LIFE, null);
    if (!d) return null;
    return { name: d.name, age: d.age, country: (C.byCode[d.countryCode] || {}).name, year: d.year, alive: d.alive };
  }

  /* ------------------------- книга прошлых жизней --------------------- */
  function pastLives() { return read(K_PAST, []); }

  function addPastLife(life) {
    var list = pastLives();
    list.unshift({
      id: life.seed,
      name: life.name,
      sex: life.sex,
      country: life.c.name,
      countryCode: life.base.code,
      born: life.birthYear,
      died: life.dead ? life.dead.year : life.year,
      age: life.dead ? life.dead.age : life.age,
      cause: life.dead ? life.dead.cause : '',
      summary: life.summary(),
      epitaph: life.epitaph(),
      achievements: life.achievements(),
      starred: life.log.filter(function (e) { return e.starred; }).map(function (e) { return { age: e.age, text: e.text }; }),
      notes: life.notes,
      history: life.history.map(function (h) { return { age: h.age, happy: h.happy, health: h.health, bond: h.bond }; }),
      savedAt: Date.now()
    });
    write(K_PAST, list.slice(0, 40));
    return list.length;
  }

  function clearPast() { remove(K_PAST); }

  function stats() {
    var list = pastLives();
    var total = list.length;
    var sumAge = 0, countries = {}, longest = 0;
    list.forEach(function (l) {
      sumAge += l.age; countries[l.countryCode] = true;
      if (l.age > longest) longest = l.age;
    });
    return {
      total: total,
      avgAge: total ? sumAge / total : 0,
      countries: Object.keys(countries).length,
      longest: longest
    };
  }

  /* ----------------------------- настройки ----------------------------- */
  function loadSettings() {
    return Object.assign({
      era: 'today', year: null, drawMode: 'births', lifeMinutes: 30,
      soft: false, auto: false, homeCountry: '', currency: 'rub', music: false,
      pauseOn: { big: false, year: false, buy: false }
    }, read(K_SET, {}));
  }
  function saveSettings(s) { write(K_SET, s); }

  window.IN8B = window.IN8B || {};
  window.IN8B.save = {
    saveLife: saveLife, loadLife: loadLife, hasLife: hasLife, clearLife: clearLife, peekLife: peekLife,
    pastLives: pastLives, addPastLife: addPastLife, clearPast: clearPast, stats: stats,
    loadSettings: loadSettings, saveSettings: saveSettings,
    serialize: serialize, restore: restore
  };
})();
