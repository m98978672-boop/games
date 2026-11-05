/* =============================================================================
   НИКА: ЖИВАЯ — база бытовых навыков
   -----------------------------------------------------------------------------
   Встроенные навыки задают «как именно» Ника купается, ходит в туалет, ест,
   переодевается и т.д. Игрок может расширить/переписать любой навык текстом —
   вставленным вручную или загруженным с публичного сайта через NIKA.net.
   Модуль не делает сетевых запросов сам: текст приходит извне.
   ============================================================================= */
(function (root) {
  'use strict';
  const NIKA = (root.NIKA = root.NIKA || {});

  const BUILTIN = [
    { id: 'wash', label: 'Купание', intent: 'wash', source: 'встроенный',
      aliases: ['купаться', 'мыться', 'ванна', 'душ', 'гигиена', 'искупаться'],
      steps: ['подойти к ванной', 'проверить воду', 'набрать воду', 'снять верхнюю одежду за ширмой',
        'зайти в ванну', 'намылиться', 'смыть пену', 'выйти и вытереться', 'надеть домашнее'] },
    { id: 'toilet', label: 'Санузел', intent: 'toilet', source: 'встроенный',
      aliases: ['туалет', 'санузел', 'уборная', 'унитаз', 'комфорт'],
      steps: ['подойти к двери', 'закрыть матовую дверцу', 'сходить в санузел', 'вымыть руки', 'вернуться'] },
    { id: 'walk', label: 'Ходьба по квартире', intent: 'go', source: 'встроенный',
      aliases: ['ходить', 'идти', 'шаги', 'перемещение', 'прогулка'],
      steps: ['встать ровно', 'перенести вес', 'сделать шаг', 'сохранить равновесие', 'прийти в зону'] },
    { id: 'dress', label: 'Переодевание', intent: 'dress', source: 'встроенный',
      aliases: ['переодеваться', 'одеваться', 'надеть', 'снять одежду', 'гардероб', 'бельё'],
      steps: ['уйти за ширму', 'снять верхнюю одежду', 'сложить её', 'открыть шкаф',
        'выбрать вещь на плечиках', 'надеть новое', 'застегнуть', 'расправить подол', 'посмотреть в зеркало'] },
    { id: 'sleep', label: 'Сон', intent: 'sleep', source: 'встроенный',
      aliases: ['спать', 'ложиться', 'постель', 'отдых', 'кровать'],
      steps: ['приглушить свет', 'лечь', 'укрыться', 'дышать ровно', 'заснуть'] },
    { id: 'work', label: 'Работа', intent: 'work', source: 'встроенный',
      aliases: ['работать', 'ноутбук', 'печатать', 'задачи', 'офис'],
      steps: ['сесть прямо', 'открыть ноутбук', 'прочитать задачу', 'набрать текст', 'сохранить'] },
    { id: 'eat', label: 'Еда', intent: 'eat', source: 'встроенный',
      aliases: ['есть', 'обед', 'кухня', 'чай', 'перекус'],
      steps: ['подойти к кухне', 'взять чашку', 'налить', 'сесть', 'поесть', 'убрать посуду'] },
    { id: 'help', label: 'Помощь по дому', intent: 'help', source: 'встроенный',
      aliases: ['помогать', 'уборка', 'прибрать', 'протереть', 'помощь'],
      steps: ['взять салфетку', 'протереть поверхность', 'поставить вещи на место', 'проверить результат'] },
    { id: 'exercise', label: 'Зарядка', intent: 'exercise', source: 'встроенный',
      aliases: ['зарядка', 'спорт', 'растяжка', 'упражнения', 'фитнес'],
      steps: ['расстелить коврик', 'размяться', 'присесть', 'потянуться', 'подышать'] },
    { id: 'talk', label: 'Разговор', intent: 'talk', source: 'встроенный',
      aliases: ['разговаривать', 'болтать', 'ответить', 'беседа'],
      steps: ['посмотреть на собеседника', 'улыбнуться', 'сказать фразу', 'выслушать'] },
  ];

  let skills = BUILTIN.map(function (s) {
    return { id: s.id, label: s.label, intent: s.intent, source: s.source,
      aliases: s.aliases.slice(), steps: s.steps.slice() };
  });

  function list() { return skills.map(function (s) { return Object.assign({}, s, { aliases: s.aliases.slice(), steps: s.steps.slice() }); }); }
  function forIntent(intent) { return skills.find(function (s) { return s.intent === intent; }) || null; }
  function byId(id) { return skills.find(function (s) { return s.id === id; }) || null; }

  function tokens(text) {
    return String(text || '').toLowerCase().replace(/[^a-zа-яё0-9 ]/gi, ' ').split(/\s+/)
      .filter(function (w) { return w.length > 2; });
  }
  function matchSkill(text) {
    let best = null, score = 0;
    skills.forEach(function (s) {
      let sc = 0;
      const ws = tokens(text);
      ws.forEach(function (w) {
        s.aliases.forEach(function (a) { if (a.indexOf(w.slice(0, 4)) === 0 || w.indexOf(a.slice(0, 4)) === 0) sc += 1; });
      });
      if (sc > score) { score = sc; best = s; }
    });
    return best;
  }

  /* Форматы строк:
       «купаться = проверить воду, зайти, намылиться, выйти»
       «шаги уборки: взять тряпку, протереть, поставить на место»
     Обычные предложения тоже принимаются: они приписываются ближайшему навыку. */
  function learnFromText(text, source) {
    const lines = String(text || '').split(/\r?\n/).map(function (l) { return l.trim(); })
      .filter(function (l) { return l.length > 4 && l.length < 400; });
    let added = 0, extended = 0;
    lines.slice(0, 500).forEach(function (line) {
      let name = line, stepText = '';
      if (line.indexOf('=') !== -1) { const p = line.split('='); name = p[0].trim(); stepText = p.slice(1).join('=').trim(); }
      else if (line.indexOf(':') !== -1) { const p = line.split(':'); name = p[0].trim(); stepText = p.slice(1).join(':').trim(); }
      const target = byId(name) || matchSkill(name) || (stepText ? matchSkill(line) : null);
      if (!target) return;
      const steps = (stepText || line).split(/[,;→]/).map(function (s) { return s.trim(); })
        .filter(function (s) { return s.length > 2 && s.length < 80; }).slice(0, 12);
      if (!steps.length) return;
      const fresh = steps.filter(function (s) { return target.steps.indexOf(s) === -1; });
      if (!fresh.length) return;
      target.steps = target.steps.concat(fresh).slice(0, 24);
      target.source = source || 'текст игрока';
      extended += 1; added += fresh.length;
    });
    return { added: added, extended: extended, skills: skills.length, source: source || 'текст игрока' };
  }
  function info() {
    return { skills: skills.length, builtin: BUILTIN.length,
      fromInternet: skills.filter(function (s) { return s.source && s.source.indexOf('сайт') !== -1; }).length,
      steps: skills.reduce(function (n, s) { return n + s.steps.length; }, 0),
      network: 'нет — текст загружает игрок' };
  }
  function serialize() { return { skills: skills }; }
  function restore(data) {
    if (!data || !Array.isArray(data.skills)) return;
    const base = BUILTIN.map(function (s) { return { id: s.id, label: s.label, intent: s.intent, source: s.source,
      aliases: s.aliases.slice(), steps: s.steps.slice() }; });
    data.skills.forEach(function (s) {
      if (!s || !s.id || !Array.isArray(s.steps)) return;
      const t = base.find(function (b) { return b.id === s.id; });
      if (t) { t.steps = s.steps.slice(0, 24); t.source = s.source || t.source; }
      else if (base.length < 40) base.push({ id: s.id, label: s.label || s.id, intent: s.intent || 'wait',
        source: s.source || 'текст игрока', aliases: Array.isArray(s.aliases) ? s.aliases.slice() : [], steps: s.steps.slice(0, 24) });
    });
    skills = base;
  }

  NIKA.skills = {
    BUILTIN: BUILTIN, list: list, forIntent: forIntent, byId: byId,
    learnFromText: learnFromText, info: info, serialize: serialize, restore: restore,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
