// Доска испытаний смены: учитываются только реальные доставки и загрузки.
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) { root.WC = root.WC || {}; root.WC.challenges = api; }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  var definitions = [
    { id:'intake-2', group:'Приёмка', title:'Первый поток', description:'Уложить 2 заказа на стеллаж.', event:'delivered', goal:2, reward:20 },
    { id:'intake-5', group:'Приёмка', title:'Смена набирает ход', description:'Уложить 5 заказов на стеллаж.', event:'delivered', goal:5, reward:50 },
    { id:'light', group:'Приёмка', title:'Лёгкий маршрут', description:'Уложить 3 коробки массой до 12 кг включительно.', event:'delivered', goal:3, reward:35, maxMass:12 },
    { id:'heavy', group:'Приёмка', title:'Тяжёлый участок', description:'Уложить 2 коробки массой от 20 кг.', event:'delivered', goal:2, reward:45, minMass:20 },
    { id:'urgent', group:'Приёмка', title:'Срочная приёмка', description:'Уложить 2 срочных заказа вовремя.', event:'delivered', goal:2, reward:45, urgent:true, onTime:true },
    { id:'perfect-2', group:'Качество', title:'Аккуратные руки', description:'Уложить 2 коробки вовремя с повреждением меньше 5%.', event:'delivered', goal:2, reward:30, onTime:true, maxDamage:.05 },
    { id:'perfect-4', group:'Качество', title:'Знак качества', description:'Уложить 4 коробки вовремя с повреждением меньше 5%.', event:'delivered', goal:4, reward:60, onTime:true, maxDamage:.05 },
    { id:'time-3', group:'Качество', title:'Без опозданий', description:'Уложить 3 заказа вовремя.', event:'delivered', goal:3, reward:35, onTime:true },
    { id:'fragile', group:'Качество', title:'Бережная отгрузка', description:'Загрузить 2 коробки с повреждением меньше 5%.', event:'loaded', goal:2, reward:40, maxDamage:.05 },
    { id:'late-rescue', group:'Качество', title:'Спасти опоздавших', description:'Всё же уложить 2 просроченных заказа.', event:'delivered', goal:2, reward:20, late:true },
    { id:'unload-2', group:'Фуры', title:'Первая разгрузка', description:'Уложить 2 коробки из разгрузочной фуры.', event:'delivered', goal:2, reward:35, source:'truck' },
    { id:'unload-4', group:'Фуры', title:'Встреча рейса', description:'Уложить 4 коробки из разгрузочных фур.', event:'delivered', goal:4, reward:65, source:'truck' },
    { id:'load-2', group:'Фуры', title:'Готовим отправку', description:'Загрузить 2 коробки в фуры.', event:'loaded', goal:2, reward:35 },
    { id:'load-4', group:'Фуры', title:'Исходящий поток', description:'Загрузить 4 коробки в фуры.', event:'loaded', goal:4, reward:65 },
    { id:'full-truck', group:'Фуры', title:'Полный рейс', description:'Завершить погрузку фуры целиком, без досрочной отправки.', event:'loaded', goal:1, reward:45, fullTruck:true },
    { id:'night-2', group:'Особые условия', title:'Ночная бригада', description:'Уложить 2 заказа при ночном освещении.', event:'delivered', goal:2, reward:35, night:true },
    { id:'night-load', group:'Особые условия', title:'Ночной рейс', description:'Загрузить 2 коробки при ночном освещении.', event:'loaded', goal:2, reward:40, night:true },
    { id:'team-2', group:'Особые условия', title:'Общая работа', description:'Два разных работника должны уложить по заказу.', event:'delivered', goal:2, reward:35, distinct:true },
    { id:'team-3', group:'Особые условия', title:'Вся бригада', description:'Три разных работника должны уложить по заказу.', event:'delivered', goal:3, reward:55, distinct:true },
    { id:'heavy-load', group:'Особые условия', title:'Весомый рейс', description:'Загрузить 2 коробки массой от 20 кг.', event:'loaded', goal:2, reward:50, minMass:20 },
  ];
  var maxActive = 2;
  function definition(id) { return definitions.find(function (d) { return d.id === id; }); }
  function create() { return { version:1, items: definitions.map(function (d) { return { id:d.id, status:'available', progress:0, workers:[] }; }) }; }
  function accept(state, id) {
    var item = state.items.find(function (i) { return i.id === id; });
    if (!item || item.status !== 'available') return { ok:false, reason:'Испытание недоступно' };
    if (state.items.filter(function (i) { return i.status === 'active'; }).length >= maxActive) return { ok:false, reason:'Можно выполнять только два испытания' };
    item.status = 'active';
    return { ok:true };
  }
  function cancel(state, id) {
    var item = state.items.find(function (i) { return i.id === id; });
    if (!item || item.status !== 'active') return { ok:false, reason:'Испытание не выполняется' };
    item.status = 'cancelled'; return { ok:true };
  }
  function record(state, event, order, result, workerId, mode) {
    var completed = [];
    state.items.forEach(function (item) {
      if (item.status !== 'active') return;
      var d = definition(item.id);
      if (d.event !== event || !order || !result) return;
      if (d.minMass != null && (!Number.isFinite(order.mass) || order.mass < d.minMass)) return;
      if (d.maxMass != null && (!Number.isFinite(order.mass) || order.mass > d.maxMass)) return;
      if (d.maxDamage != null && (!Number.isFinite(order.damage) || order.damage >= d.maxDamage)) return;
      if (d.urgent && !order.urgent || d.onTime && result.late !== false || d.late && result.late !== true ||
          d.source && order.source !== d.source || d.night && mode !== 'night' ||
          d.fullTruck && (!result.truck || result.truck.status !== 'done')) return;
      if (d.distinct) {
        if (typeof workerId !== 'string' || !workerId || item.workers.indexOf(workerId) >= 0) return;
        item.workers.push(workerId);
      }
      item.progress++;
      if (item.progress === d.goal) { item.status = 'completed'; completed.push({ id:d.id, reward:d.reward }); }
    });
    return completed;
  }
  function finish(state) { state.items.forEach(function (i) { if (i.status === 'active') i.status = 'failed'; }); }
  function validate(value) {
    if (!value || value.version !== 1 || !Array.isArray(value.items) || value.items.length !== definitions.length) throw new Error('Повреждена доска испытаний');
    var seen = {};
    value.items.forEach(function (i) {
      var d = i && definition(i.id);
      if (!d || seen[i.id] || ['available','active','completed','cancelled','failed'].indexOf(i.status) < 0 ||
          !Number.isInteger(i.progress) || i.progress < 0 || i.progress > d.goal || !Array.isArray(i.workers) ||
          i.workers.length > d.goal || i.workers.some(function (id) { return typeof id !== 'string' || !id || id.length > 100; }) ||
          new Set(i.workers).size !== i.workers.length || (d.distinct ? i.workers.length !== i.progress : i.workers.length !== 0) ||
          (i.status === 'completed' ? i.progress !== d.goal : i.progress === d.goal) ||
          (i.status === 'available' && i.progress !== 0)) throw new Error('Повреждено испытание');
      seen[i.id] = true;
    });
    if (value.items.filter(function (i) { return i.status === 'active'; }).length > maxActive) throw new Error('Слишком много испытаний');
    return JSON.parse(JSON.stringify(value));
  }
  return { definitions:definitions, maxActive:maxActive, create:create, accept:accept, cancel:cancel, record:record, finish:finish, validate:validate };
});
