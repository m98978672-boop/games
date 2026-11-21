// Дополнительные контракты смены: только фактические игровые события и часы склада.
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) { root.WC = root.WC || {}; root.WC.contracts = api; }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  var DEFINITIONS = [
    { id: 'intake', title: 'План приёмки', description: 'Уложить 3 заказа на стеллажи.', goal: 3, duration: 120, reward: 35, event: 'delivered' },
    { id: 'care', title: 'Бережная смена', description: 'Уложить 2 заказа без падений и порчи груза за время контракта.', goal: 2, duration: 150, reward: 50, event: 'delivered', clean: true },
    { id: 'unload', title: 'Груз с фуры', description: 'Уложить 2 коробки из разгрузочной фуры.', goal: 2, duration: 180, reward: 55, event: 'truck-delivered' },
    { id: 'load', title: 'Исходящий рейс', description: 'Загрузить 2 коробки в фуру.', goal: 2, duration: 180, reward: 55, event: 'loaded' },
  ];
  var MAX_ACTIVE = 2;
  function create() {
    return { version: 1, items: DEFINITIONS.map(function (d) {
      return { id: d.id, status: 'available', progress: 0, acceptedAt: null, deadline: null, endedAt: null, startDropped: 0, startRuined: 0, reason: '' };
    }) };
  }
  function def(id) { return DEFINITIONS.find(function (d) { return d.id === id; }); }
  function item(state, id) { return state.items.find(function (v) { return v.id === id; }); }
  function change(i, status, now, reason) {
    i.status = status; i.endedAt = now; i.reason = reason || '';
    return { id: i.id, status: status, reward: status === 'completed' ? def(i.id).reward : 0, reason: i.reason };
  }
  function accept(state, id, now, shiftEnd, stats) {
    var d = def(id), i = item(state, id);
    if (!d || !i || i.status !== 'available') return { ok: false, reason: 'Контракт недоступен' };
    if (state.items.filter(function (x) { return x.status === 'active'; }).length >= MAX_ACTIVE) return { ok: false, reason: 'Одновременно можно выполнять только два контракта' };
    if (shiftEnd - now < 20) return { ok: false, reason: 'До конца смены меньше 20 секунд' };
    i.status = 'active'; i.progress = 0; i.acceptedAt = now; i.deadline = Math.min(shiftEnd, now + d.duration);
    i.startDropped = stats.dropped; i.startRuined = stats.ruined; i.endedAt = null; i.reason = '';
    return { ok: true, item: i };
  }
  function advance(state, stats, now) {
    var changes = [];
    state.items.forEach(function (i) {
      if (i.status !== 'active') return;
      var d = def(i.id);
      if (d.clean && (stats.dropped > i.startDropped || stats.ruined > i.startRuined)) changes.push(change(i, 'failed', now, 'груз упал или испорчен'));
      else if (now > i.deadline) changes.push(change(i, 'failed', now, 'время вышло'));
    });
    return changes;
  }
  function record(state, stats, now, event, order) {
    var changes = advance(state, stats, now);
    state.items.forEach(function (i) {
      if (i.status !== 'active') return;
      var d = def(i.id);
      var matched = d.event === event || (d.event === 'truck-delivered' && event === 'delivered' && order && order.source === 'truck');
      if (!matched) return;
      i.progress = Math.min(d.goal, i.progress + 1);
      if (i.progress >= d.goal) changes.push(change(i, 'completed', now, ''));
    });
    return changes;
  }
  function cancel(state, id, now) {
    var i = item(state, id);
    if (!i || i.status !== 'active') return { ok: false, reason: 'Контракт не выполняется' };
    return { ok: true, change: change(i, 'cancelled', now, 'отменён игроком') };
  }
  function finish(state, now) {
    var changes = [];
    state.items.forEach(function (i) { if (i.status === 'active') changes.push(change(i, 'failed', now, 'смена завершена')); });
    return changes;
  }
  function validate(value) {
    if (!value || value.version !== 1 || !Array.isArray(value.items) || value.items.length !== DEFINITIONS.length) throw new Error('Повреждены контракты смены');
    var seen = {};
    value.items.forEach(function (i) {
      var d = i && def(i.id);
      if (!d || seen[i.id] || ['available', 'active', 'completed', 'failed', 'cancelled'].indexOf(i.status) < 0 ||
          !Number.isInteger(i.progress) || i.progress < 0 || i.progress > d.goal ||
          !Number.isInteger(i.startDropped) || i.startDropped < 0 || !Number.isInteger(i.startRuined) || i.startRuined < 0 ||
          typeof i.reason !== 'string' || i.reason.length > 200 ||
          ![i.acceptedAt, i.deadline, i.endedAt].every(function (n) { return n === null || (Number.isFinite(n) && n >= 0); }) ||
          (i.status === 'active' && (i.acceptedAt === null || i.deadline === null || i.deadline < i.acceptedAt || i.endedAt !== null)) ||
          (i.status === 'available' && (i.acceptedAt !== null || i.deadline !== null || i.endedAt !== null || i.progress !== 0)) ||
          (['completed', 'failed', 'cancelled'].indexOf(i.status) >= 0 && (i.acceptedAt === null || i.deadline === null || i.endedAt === null)) ||
          (i.status === 'completed' && i.progress !== d.goal)) throw new Error('Повреждён контракт');
      seen[i.id] = true;
    });
    if (value.items.filter(function (i) { return i.status === 'active'; }).length > MAX_ACTIVE) throw new Error('Слишком много контрактов');
    return JSON.parse(JSON.stringify(value));
  }
  return { definitions: DEFINITIONS, maxActive: MAX_ACTIVE, create: create, accept: accept, advance: advance, record: record, cancel: cancel, finish: finish, validate: validate };
});
