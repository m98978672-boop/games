/* ============================================================
   Games — ЕДИНОЕ ПОДКЛЮЧЕНИЕ ДВИЖКА RatCore (shared/engine.js)
   ------------------------------------------------------------
   Этот файл — единственный вход движка для всех разделов Games.
   Он подключается классическим <script src> и НЕ ломает игру,
   даже если бандл ещё не загрузился: движок подтягивается
   лениво по первому обращению.

       <script src="../shared/engine.js" defer></script>

   Что даёт GamesEngine:
   1. GamesEngine.ready()        — промис: дождаться загрузки движка;
   2. GamesEngine.rng(seed)      — детерминированный ГПСЧ ЯДРА
                                   (RatCore.core.math.createRng), а не
                                   своя копия mulberry32 в каждой игре;
   3. GamesEngine.clock({...})   — фиксированный шаг симуляции ядра
                                   (createClock, F-01, защита от
                                   «спирали смерти»);
   4. GamesEngine.create({...})  — экземпляр движка createEngine()
                                   с песочницей tools.* и ToolGuard;
   5. GamesEngine.badge()        — плашка «RatCore v1.0.0» в едином
                                   стиле HUD для верхней панели.

   Регистрация разделов ведётся в shared/engine-registry.json, а
   проверка покрытия — в game-base/tests/engine.mjs (обязательный
   шаг CI): новый раздел без подключения движка не пройдёт проверку.
   ============================================================ */
(function (global) {
  'use strict';

  var BUNDLE_URL = '../ratcore/ratcore.bundle.js';
  var STATUS_BAR_CLASS = 'engine-status-bar';
  var VERSION_LABEL = 'RatCore v1.0.0';

  var state = {
    scriptPromise: null,
    engine: null,
    ready: false,
    error: null,
  };

  function detectRootPrefix() {
    if (typeof document === 'undefined' || !document.currentScript) return '../';
    try {
      return new URL(document.currentScript.src).pathname.replace(/shared\/engine\.js.*$/, '');
    } catch (err) {
      void err;
      return '../';
    }
  }

  function resolveBundleUrl() {
    if (typeof document === 'undefined') return BUNDLE_URL;
    var script = document.currentScript;
    if (!script || !script.src) return BUNDLE_URL;
    try {
      return new URL(BUNDLE_URL, script.src).href;
    } catch (err) {
      void err;
      return BUNDLE_URL;
    }
  }

  function loadBundle() {
    if (global.RatCore && typeof global.RatCore.createEngine === 'function') {
      return Promise.resolve(global.RatCore);
    }
    if (state.scriptPromise) return state.scriptPromise;
    if (typeof document === 'undefined') {
      return Promise.reject(new Error('GamesEngine: нет document — используйте ratcore/ratcore.bundle.js напрямую.'));
    }
    state.scriptPromise = new Promise(function (resolve, reject) {
      var el = document.createElement('script');
      el.src = resolveBundleUrl();
      el.async = true;
      el.onload = function () {
        if (global.RatCore && typeof global.RatCore.createEngine === 'function') resolve(global.RatCore);
        else reject(new Error('RatCore: бандл загрузился, но не объявил window.RatCore'));
      };
      el.onerror = function () {
        reject(new Error('RatCore: не удалось загрузить ' + resolveBundleUrl()));
      };
      document.head.appendChild(el);
    }).catch(function (err) {
      state.error = err;
      throw err;
    });
    return state.scriptPromise;
  }

  function ready() {
    return loadBundle().then(function (rc) {
      if (!state.engine) {
        // Лёгкое ядро по умолчанию: без опциональных пакетов, максимально быстро.
        state.engine = rc.createEngine({ preset: 'balanced', packs: [], seed: 2026 });
        state.ready = true;
      }
      return rc;
    });
  }

  /** Детерминированный ГПСЧ ЯДРА. Тот же алгоритм, что createRng в RatCore. */
  function rng(seed) {
    var initial = seed === undefined ? 1337 : seed;
    var fallbackState = (Number(initial) >>> 0) || 1;
    var api = {
      engine: 'pending',
      next: function () {
        if (state.ready && global.RatCore && global.RatCore.createRng) return core.next();
        fallbackState = (fallbackState + 0x6d2b79f5) >>> 0;
        var t = Math.imul(fallbackState ^ (fallbackState >>> 15), 1 | fallbackState);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      },
    };
    var core = null;
    api.attach = function (createRngFn) {
      core = createRngFn(initial);
      api.engine = 'ratcore';
      api.next = function () { return core.next(); };
      api.int = function (min, maxInclusive) { return core.int(min, maxInclusive); };
      api.range = function (min, max) { return core.range(min, max); };
      api.pick = function (arr) { return core.pick(arr); };
      api.state = function () { return core.state; };
      return api;
    };
    // Пробуем сразу: если бандл уже здесь — синхронно получаем ядро.
    if (global.RatCore && typeof global.RatCore.createRng === 'function') {
      api.attach(global.RatCore.createRng);
    } else {
      ready().then(function (rc) { api.attach(rc.createRng); }).catch(function (err) { state.error = err; });
    }
    api.int = api.int || function (min, maxInclusive) { return min + Math.floor(api.next() * (maxInclusive - min + 1)); };
    api.range = api.range || function (min, max) { return min + (max - min) * api.next(); };
    api.pick = api.pick || function (arr) { return arr[Math.floor(api.next() * arr.length)]; };
    api.shuffle = function (arr) {
      var out = arr.slice();
      for (var i = out.length - 1; i > 0; i--) {
        var j = Math.floor(api.next() * (i + 1));
        var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
      }
      return out;
    };
    api.chance = function (p) { return api.next() < Number(p || 0); };
    return api;
  }

  /** Фиксированный шаг симуляции ЯДРА. */
  function clock(options) {
    var opts = options || {};
    var fixedDt = Number(opts.fixedDt) > 0 ? Number(opts.fixedDt) : (Number(opts.tickHz) > 0 ? 1 / Number(opts.tickHz) : 1 / 30);
    var maxSubsteps = Number(opts.maxSubsteps) > 0 ? Number(opts.maxSubsteps) : 4;
    var accumulator = 0;
    var api = {
      engine: 'pending',
      tick: 0,
      simTimeSec: 0,
      paused: false,
      speed: 1,
      fixedDt: fixedDt,
    };
    var core = null;
    api.attach = function (createClockFn) {
      core = createClockFn(opts);
      api.engine = 'ratcore';
      return api;
    };
    if (global.RatCore && typeof global.RatCore.createClock === 'function') {
      api.attach(global.RatCore.createClock);
    } else {
      ready().then(function (rc) { api.attach(rc.createClock); }).catch(function (err) { state.error = err; });
    }
    api.advance = function (dtRealSec, onStep) {
      if (core) {
        var res = core.advance(dtRealSec, function (dt, tick) {
          if (typeof onStep === 'function') onStep(dt, tick);
        });
        api.tick = core.tick;
        api.simTimeSec = core.simTimeSec;
        return res;
      }
      // Пока бандл грузится — честный фиксированный шаг с защитой от спирали смерти.
      if (api.paused || api.speed <= 0) return { steps: 0, tick: api.tick };
      var clamped = Math.min(Math.max(0, Number(dtRealSec) || 0), 0.1) * api.speed;
      accumulator = Math.min(accumulator + clamped, fixedDt * maxSubsteps);
      var steps = 0;
      while (accumulator + 1e-9 >= fixedDt && steps < maxSubsteps) {
        accumulator -= fixedDt;
        api.tick += 1;
        api.simTimeSec += fixedDt;
        steps += 1;
        if (typeof onStep === 'function') onStep(fixedDt, api.tick);
      }
      return { steps: steps, tick: api.tick };
    };
    api.setPaused = function (flag) { api.paused = Boolean(flag); if (core) core.setPaused(flag); };
    api.setSpeed = function (mult) { api.speed = Math.max(0, Number(mult) || 0); if (core) core.setSpeed(mult); };
    return api;
  }

  /**
   * Создать экземпляр движка.
   * Возвращает объект сразу: сам движок догружается асинхронно,
   * а вызовы через .onReady() дождятся полной готовности.
   */
  function create(config) {
    var holder = {
      engine: null,
      ready: false,
      moduleCount: 0,
      version: null,
    };
    holder.promise = ready().then(function (rc) {
      holder.engine = rc.createEngine(config || { preset: 'balanced', packs: [] });
      holder.moduleCount = rc.MODULE_COUNT || 0;
      holder.version = rc.VERSION || '1.0.0';
      holder.ready = true;
      return holder;
    });
    holder.onReady = function (fn) {
      return holder.promise.then(fn).catch(function (err) {
        state.error = err;
        return null;
      });
    };
    return holder;
  }

  /** Версия движка для плашек и подсказок. */
  function version() {
    if (global.RatCore && global.RatCore.VERSION) return global.RatCore.VERSION;
    return '1.0.0';
  }

  function moduleCount() {
    if (global.RatCore && global.RatCore.MODULE_COUNT) return global.RatCore.MODULE_COUNT;
    return 0;
  }

  // ------------------------------------------------------------
  // Плашка движка в общем HUD-стиле (та же, что на витрине)
  // ------------------------------------------------------------
  var STYLE_ID = 'games-engine-status-style';
  function injectStyle() {
    if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.engine-status-bar{position:fixed;left:12px;bottom:12px;z-index:60;display:inline-flex;align-items:center;gap:8px;',
      'padding:5px 11px;border:1px solid var(--line,rgba(242,236,223,.16));border-radius:999px;',
      'background:var(--panel,rgba(16,20,19,.92));backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);',
      'color:var(--ink-dim,#a9a294);font-family:var(--font,system-ui,sans-serif);font-size:11px;letter-spacing:.06em;',
      'text-transform:uppercase;box-shadow:var(--shadow-sm,0 8px 20px rgba(0,0,0,.4));pointer-events:auto;text-decoration:none}',
      '.engine-status-bar:hover{color:var(--ink,#f2ecdf);border-color:var(--accent,#e8b45a)}',
      '.engine-status-bar i{width:7px;height:7px;border-radius:50%;background:var(--accent,#e8b45a);box-shadow:0 0 8px var(--accent,#e8b45a);font-style:normal}',
      '.engine-status-bar.is-loading i{opacity:.45}',
      '.engine-status-bar.is-error{border-color:var(--red,#e2604f)}.engine-status-bar.is-error i{background:var(--red,#e2604f)}',
      '.engine-status-bar b{color:var(--accent-2,#ffd98a);font-weight:700;letter-spacing:.08em}',
      '@media (max-width:560px){.engine-status-bar{left:8px;bottom:8px;font-size:10px;padding:4px 9px}}',
      '.engine-hud-slot{display:flex;align-items:center;flex:none}',
      '.engine-hud-slot .engine-status-bar{position:static;left:auto;bottom:auto;box-shadow:none;background:transparent;',
      'border-color:var(--line,rgba(242,236,223,.14));padding:4px 9px;font-size:10px}',
      '@media (max-width:720px){.engine-hud-slot{display:none}}',
      '@media (prefers-reduced-motion:reduce){.engine-status-bar{transition:none}}',
    ].join('');
    document.head.appendChild(style);
  }

  /**
   * Вставить плашку движка.
   * opts.mount  — готовый элемент (или селектор), куда вставить плашку;
   * opts.stats  — функция, возвращающая короткую строку статистики;
   * opts.href   — ссылка на движок (по умолчанию ../ratcore/README.md).
   */
  function badge(options) {
    if (typeof document === 'undefined') return null;
    var opts = options || {};
    injectStyle();
    var el = document.createElement(opts.mount ? 'span' : 'a');
    el.className = STATUS_BAR_CLASS + ' is-loading';
    if (!opts.mount) {
      el.href = opts.href || '../ratcore/README.md';
      el.title = 'Движок RatCore v1.0.0 — общий движок всех разделов Games';
    }
    el.innerHTML = '<i aria-hidden="true"></i><b></b><span class="engine-status-text"></span>';
    var nameEl = el.querySelector('b');
    var textEl = el.querySelector('.engine-status-text');
    nameEl.textContent = VERSION_LABEL;

    function paint(text) {
      textEl.textContent = text;
    }
    function applyStats() {
      if (typeof opts.stats === 'function') {
        try { paint(String(opts.stats() || '')); } catch (err) { void err; }
      }
    }

    ready().then(function () {
      el.classList.remove('is-loading');
      var count = moduleCount();
      paint(count ? count + ' модулей · движок ядра' : 'движок ядра');
      applyStats();
      if (opts.mount) {
        var host = typeof opts.mount === 'string' ? document.querySelector(opts.mount) : opts.mount;
        if (host) host.appendChild(el);
      }
    }).catch(function () {
      el.classList.remove('is-loading');
      el.classList.add('is-error');
      paint('движок не загрузился');
    });

    if (opts.mount) {
      var hostEl = typeof opts.mount === 'string' ? document.querySelector(opts.mount) : opts.mount;
      if (hostEl) hostEl.appendChild(el);
      return el;
    }
    var dock = document.getElementById('engine-status-dock');
    if (dock) dock.appendChild(el);
    else (document.body || document.documentElement).appendChild(el);
    return el;
  }

  var api = Object.freeze({
    VERSION: '1.0.0',
    BUNDLE_URL: BUNDLE_URL,
    get loaded() { return Boolean(global.RatCore); },
    get error() { return state.error; },
    loadBundle: loadBundle,
    ready: ready,
    create: create,
    rng: rng,
    clock: clock,
    version: version,
    moduleCount: moduleCount,
    badge: badge,
    detectRootPrefix: detectRootPrefix,
  });

  global.GamesEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
