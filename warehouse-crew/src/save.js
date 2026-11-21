// Сохранение прогресса смены в localStorage + экспорт отчёта в JSON.
window.WC = window.WC || {};

WC.save = (function () {
  'use strict';

  var KEY = 'warehouse-crew-save-v1';
  var CHECKPOINT_KEY = 'warehouse-crew-save-v2';
  var protectedSave = false;

  function storage() {
    try {
      if (typeof localStorage === 'undefined') return null;
      var probe = '__wc_probe__';
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      return localStorage;
    } catch (err) {
      return null;
    }
  }

  function load() {
    var store = storage();
    if (!store) return null;
    var legacy = null;
    try {
      var old = store.getItem(KEY);
      if (old) { legacy = JSON.parse(old); if (!legacy || legacy.version !== 1) legacy = null; }
    } catch (err) { legacy = null; }
    try {
      var raw = store.getItem(CHECKPOINT_KEY);
      if (!raw) return legacy;
      if (raw.length > 8 * 1024 * 1024) throw new Error('Слишком большой снимок');
      var data = JSON.parse(raw);
      if (!data || data.version !== 2 || !data.checkpoint || data.checkpoint.version !== 2) throw new Error('Неверная версия');
      return data;
    } catch (err) {
      protectedSave = true;
      return legacy;
    }
  }

  function write(data) {
    var store = storage();
    if (!store || protectedSave) return false;
    try {
      // setItem атомарен: при ошибке квоты предыдущее значение остаётся целым.
      store.setItem(CHECKPOINT_KEY, JSON.stringify(data));
      flash();
      return true;
    } catch (err) {
      return false;
    }
  }

  function collect(game) {
    var stats = game.sim.state.stats;
    return {
      version: 1,
      savedAt: new Date().toISOString(),
      bestScore: Math.max((game.best && game.best.score) || 0, stats.score),
      bestDelivered: Math.max((game.best && game.best.delivered) || 0, stats.delivered),
      shifts: game.shiftsPlayed || 0,
      lastShift: {
        score: stats.score,
        delivered: stats.delivered,
        ruined: stats.ruined,
        missed: stats.missed,
        quality: WC.game.qualityPercent(game),
      },
      crew: game.crew.map(function (w) {
        return {
          id: w.id,
          delivered: w.state.stats.delivered,
          dropped: w.state.stats.dropped,
          metres: Math.round(w.state.stats.metres),
          restSeconds: Math.round(w.body.restSeconds),
        };
      }),
    };
  }

  function flash() {
    var bar = document.getElementById('save-indicator');
    if (!bar) return;
    bar.classList.add('flash');
    bar.textContent = '● сохранено';
    clearTimeout(flash.timer);
    flash.timer = setTimeout(function () {
      bar.classList.remove('flash');
      bar.textContent = '● автосохранение';
    }, 1400);
  }

  function save(game) {
    if (protectedSave) return false;
    try {
      var data = collect(game);
      data.version = 2;
      data.checkpoint = WC.game.captureCheckpoint();
      return write(data);
    } catch (err) {
      console.warn('[warehouse-crew] сохранение не удалось:', err);
      return false;
    }
  }

  function autosave(game) {
    var ok = save(game);
    if (!ok) {
      var bar = document.getElementById('save-indicator');
      if (bar) bar.textContent = protectedSave ? '● сохранение защищено' : '● ошибка сохранения';
    }
    return ok;
  }

  function download(game) {
    var payload = collect(game);
    payload.crewBrains = game.crew.map(function (w) {
      return { id: w.id, model: w.brainMeta || null };
    });
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'warehouse-crew-shift.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    return payload;
  }

  return { load: load, save: save, autosave: autosave, download: download, KEY: KEY,
    CHECKPOINT_KEY: CHECKPOINT_KEY, protect: function () { protectedSave = true; },
    unprotect: function () { protectedSave = false; }, isProtected: function () { return protectedSave; } };
})();
