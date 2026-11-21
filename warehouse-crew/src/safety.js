// Показатели для пульта: только чтение, без команд и влияния на симуляцию.
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) { root.WC = root.WC || {}; root.WC.safety = api; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function percent(value) { return Math.round(Math.max(0, Math.min(1, value)) * 100) + '%'; }
  function assess(crew, parts) {
    var alerts = [];
    parts = parts || {};
    crew.forEach(function (worker, index) {
      if (!worker || !worker.state || !worker.body || worker.state.dead) return;
      var body = worker.body, st = worker.state, rank = 0, reasons = [];
      function add(level, text) { rank = Math.max(rank, level); reasons.push(text); }
      if (body.collapsed) add(3, 'обморок');
      else if (st.state === 'down') add(3, 'восстановление после обморока');
      if (body.vitality < 0.3) add(3, 'здоровье ' + percent(body.vitality));
      if (body.energy < 0.24) add(2, 'энергия ' + percent(body.energy));
      if (body.fatigue > 0.83) add(2, 'усталость ' + percent(body.fatigue));
      var injuries = (body.injuries || []).filter(function (item) { return item.severity > 0.02; });
      if (injuries.length) {
        var worst = injuries.reduce(function (a, b) { return a.severity >= b.severity ? a : b; });
        add(worst.severity >= 0.45 ? 2 : 1, 'травма: ' + (parts[worst.part] || worst.part) + ' ' + percent(worst.severity) + (injuries.length > 1 ? ' (всего ' + injuries.length + ')' : ''));
      }
      if (body.hydration < 0.3) add(1, 'вода ' + percent(body.hydration));
      if (body.pain > 0.4) add(1, 'боль ' + percent(body.pain));
      if (rank) alerts.push({ id: st.id, name: st.name, rank: rank, reasons: reasons, index: index });
    });
    alerts.sort(function (a, b) { return b.rank - a.rank || a.index - b.index; });
    return alerts;
  }
  return { assess: assess };
});
