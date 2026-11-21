// Реплики и короткие разговоры без влияния на решения и ГПСЧ симуляции.
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) { root.WC = root.WC || {}; root.WC.dialogue = api; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  var COMMANDS = {
    pick: 'Понял, иду к коробке.', store: 'Несу к месту назначения.',
    rest: 'Хорошо, передохну.', wait: 'Хорошо, жду.',
    auto: 'Принято, работаю самостоятельно.', help: 'Помогу бригаде.',
    toilet: 'Отойду ненадолго.', street: 'Выйду подышать.',
    play: 'Проверю погрузчик.', tech: 'Иду к погрузчику.', meet: 'Иду на встречу.',
  };
  var TOPICS = {
    greeting: ['Как дела?', 'Всё нормально, спасибо.'],
    tired: ['Усталость чувствуется. Надо беречь силы.', 'Да, перерыв не помешает.'],
    night: ['Ночью у фонарей виднее.', 'Да, в темноте надо быть внимательнее.'],
  };
  var EVENTS = { delivered: 'Готово, заказ доставлен.', loaded: 'Груз в фуре.',
    dropped: 'Осторожно, коробка упала!', injury: 'Мне нужна помощь.' };
  function create(now) { return { nextTalk: (now || 0) + 25, lastEvent: -100, seq: 0, pending: null }; }
  function validate(value) {
    if (!value || !Number.isFinite(value.nextTalk) || !Number.isFinite(value.lastEvent) ||
        !Number.isInteger(value.seq) || value.seq < 0 || value.seq > 10000000) throw new Error('Повреждены данные диалогов');
    var p = value.pending;
    if (p !== null && (!p || typeof p.speaker !== 'string' || typeof p.listener !== 'string' ||
        !Object.prototype.hasOwnProperty.call(TOPICS, p.topic) || !Number.isFinite(p.at))) throw new Error('Повреждён разговор');
    return { nextTalk: value.nextTalk, lastEvent: value.lastEvent, seq: value.seq,
      pending: p ? { speaker:p.speaker, listener:p.listener, topic:p.topic, at:p.at } : null };
  }
  function visible(worker) {
    return worker && worker.state && worker.body && !worker.state.dead && !worker.body.collapsed &&
      worker.state.state !== 'down' && !worker.state.privacy && !worker.state.inToilet;
  }
  function idle(worker) {
    return visible(worker) && !worker.state.orderId && !worker.state.carryingId && !worker.state.onForklift &&
      (worker.state.state === 'idle' || worker.state.state === 'rest');
  }
  function line(worker, text, kind) { return { workerId:worker.id, name:worker.state.name, text:text, kind:kind }; }
  function command(worker, cmd, result) {
    if (!visible(worker)) return null;
    if (!result.ok) return line(worker, 'Не получится: ' + (result.reason || 'сейчас не могу') + '.', 'command');
    var text = result.tech ? 'Тяжёлый груз — сначала возьму погрузчик.' : COMMANDS[cmd];
    return text ? line(worker, text, 'command') : null;
  }
  function event(state, worker, name, now) {
    if (!visible(worker) || !EVENTS[name] || now - state.lastEvent < 8) return null;
    state.lastEvent = now;
    return line(worker, EVENTS[name], 'event');
  }
  function step(state, workers, now, mode, blocked) {
    if (state.pending && now >= state.pending.at) {
      var p = state.pending;
      state.pending = null;
      var a = workers.find(function (w) { return w.id === p.speaker; });
      var b = workers.find(function (w) { return w.id === p.listener; });
      if (idle(a) && idle(b) && Math.hypot(a.pos.x-b.pos.x, a.pos.y-b.pos.y) <= 3 &&
          (!blocked || !blocked(a.pos, b.pos, 0.02))) return line(b, TOPICS[p.topic][1], 'conversation');
    }
    if (state.pending || now < state.nextTalk) return null;
    var candidates = [];
    for (var i=0; i<workers.length; i++) for (var j=i+1; j<workers.length; j++) {
      var first = workers[i], second = workers[j];
      if (!idle(first) || !idle(second) || Math.hypot(first.pos.x-second.pos.x, first.pos.y-second.pos.y) > 2.7 ||
          (blocked && blocked(first.pos, second.pos, 0.02))) continue;
      candidates.push([first, second]);
    }
    if (!candidates.length) { state.nextTalk = now + 5; return null; }
    var pair = candidates[state.seq % candidates.length];
    if (state.seq % 2) pair = [pair[1], pair[0]];
    var topic = pair[0].body.energy < 0.45 || pair[1].body.energy < 0.45 ? 'tired' :
      mode === 'night' && pair[0].pos.y >= 9 ? 'night' : 'greeting';
    state.seq += 1;
    state.nextTalk = now + 35;
    state.pending = { speaker:pair[0].id, listener:pair[1].id, topic:topic, at:now + 2.5 };
    return line(pair[0], TOPICS[topic][0], 'conversation');
  }
  return { create:create, validate:validate, command:command, event:event, step:step };
});
