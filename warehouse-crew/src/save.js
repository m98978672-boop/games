// Сохранение прогресса смены в localStorage + экспорт отчёта в JSON.
window.WC = window.WC || {};

WC.save = (function () {
  'use strict';

  var KEY = 'warehouse-crew-save-v1';

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
    try {
      var raw = store.getItem(KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || data.version !== 1) return null;
      return data;
    } catch (err) {
      return null;
    }
  }

  function write(data) {
    var store = storage();
    if (!store) return false;
    try {
      store.setItem(KEY, JSON.stringify(data));
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
    return write(collect(game));
  }

  function autosave(game) {
    save(game);
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

  return { load: load, save: save, autosave: autosave, download: download, KEY: KEY };
})();
