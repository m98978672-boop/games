/* =============================================================================
   НИКА: ЖИВАЯ — симуляция жизни
   Потребности, время суток, гардероб, действия, очередь целей, автономные решения.
   Модуль не знает про DOM: всё общение с интерфейсом через state.events.
   ============================================================================= */
(function (root) {
  'use strict';
  const NIKA = (root.NIKA = root.NIKA || {});
  const ai = NIKA.ai, data = NIKA.data, anim = NIKA.anim;

  const SAVE_KEY = 'nika-life-save-v1';
  const MINUTES_PER_SECOND = 1; // 1 реальная секунда = 1 игровая минута на скорости 1×

  /* --- действия: длительность в игровых минутах + эффекты за минуту --------- */
  const ACTIONS = {
    go:       { label: 'идёт', minutes: 7,  location: null,      effects: { energy: -0.12, fitness: 0.12 } },
    sleep:    { label: 'спит', minutes: 110, location: 'bedroom', effects: { energy: 0.82, mood: 0.12, hunger: -0.05, hygiene: -0.01 } },
    eat:      { label: 'ест', minutes: 22,  location: 'kitchen', effects: { hunger: 2.6, mood: 0.3, energy: 0.08, money: -0.12 } },
    drink:    { label: 'пьёт чай', minutes: 12, location: 'kitchen', effects: { hunger: 0.8, mood: 0.25, energy: 0.2 } },
    work:     { label: 'работает', minutes: 95, location: 'desk', effects: { money: 1.5, energy: -0.3, mood: -0.08, hunger: -0.09 } },
    help:     { label: 'помогает по дому', minutes: 30, location: null, effects: { mood: 0.75, hygiene: -0.12, energy: -0.22, money: 0.3 } },
    wash:     { label: 'купается', minutes: 22, location: 'bath', effects: { hygiene: 3.2, mood: 0.3, energy: -0.05, bladder: -0.05 } },
    toilet:   { label: 'в санузле', minutes: 14, location: 'toilet', effects: { bladder: 7, hygiene: 0.45, mood: 0.22 } },
    exercise: { label: 'делает зарядку', minutes: 35, location: 'living', effects: { fitness: 1.5, energy: -0.35, hygiene: -0.35, mood: 0.3 } },
    dress:    { label: 'переодевается', minutes: 9, location: null, effects: { mood: 0.35 } },
    talk:     { label: 'разговаривает', minutes: 14, location: null, effects: { mood: 0.6, energy: 0.05 } },
    wait:     { label: 'отдыхает', minutes: 20, location: null, effects: { energy: 0.25, mood: 0.14 } },
    buy:      { label: 'ходит за покупками', minutes: 35, location: 'street', effects: { mood: 0.3, energy: -0.2 } },
  };
  const DECAY = { hunger: -0.045, energy: -0.03, hygiene: -0.04, mood: -0.028, fitness: -0.018, bladder: -0.055 };

  /* --- стартовое состояние -------------------------------------------------- */
  function freshState() {
    return {
      version: 1,
      day: 1, minutes: 8 * 60, hour: 8,
      speed: 1, paused: false, autonomy: true,
      needs: { energy: 78, hunger: 74, mood: 72, hygiene: 80, health: 92, fitness: 64, money: 120, bladder: 84 },
      location: 'living', x: 0.52, targetX: 0.52,
      outfit: {
        head: null,
        top: { id: 'tshirt', color: '#ece7dc' },
        bottom: { id: 'jeans', color: '#3f5680' },
        dress: null,
        outer: null,
        shoes: { id: 'sneakers', color: '#ece7dc' },
        accessory: null,
      },
      owned: ['dress', 'pajama', 'sport', 'tshirt', 'jeans', 'sneakers', 'slippers', 'hoodie', 'jacket', 'headband'],
      action: null,
      goals: [],
      dressing: null,
      log: [
        { day: 1, minutes: 480, who: 'nika', text: 'Привет! Я Ника. Живу в своей минималистичной квартире, сама решаю, что делать, но слушаюсь твоих команд. Попробуй: «переоденься в синее платье, прими ванну и поговори со мной».' },
      ],
      memory: [],
      events: [],
      lastAuto: null, autoCooldown: 0,
      commands: 0, learned: 0,
      animationsPlayed: 0,
    };
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function need(n, key, delta) { n[key] = clamp((n[key] || 0) + delta, 0, key === 'money' ? 99999 : 100); }
  function clock(state) {
    const h = Math.floor(state.minutes / 60) % 24;
    const m = Math.floor(state.minutes % 60);
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }
  function emit(state, event) { state.events.push(event); }
  function say(state, text, who, kind) {
    const entry = { day: state.day, minutes: Math.floor(state.minutes), who: who || 'nika', text: text, kind: kind || '' };
    state.log.push(entry);
    if (state.log.length > 140) state.log.shift();
    emit(state, { type: 'say', entry: entry });
  }
  function toast(state, text, kind) { emit(state, { type: 'toast', text: text, kind: kind || '' }); }
  function play(state, part, id, opts) { emit(state, Object.assign({ type: 'play', part: part, id: id }, opts || {})); }

  /* --- анимации для действий ------------------------------------------------ */
  function actionAnimations(intent) {
    /* сначала — цельная бытовая сцена из библиотеки routine (зацикленная),
       затем короткие вступительные клипы той же сцены и усиления по частям тела */
    const out = [];
    const scenes = anim.ROUTINES[intent] || [];
    if (scenes.length) {
      out.push({ part: 'routine', id: scenes[0], loop: true, weight: 1.02, tag: 'scene' });
      scenes.slice(1, 4).forEach(function (id, i) {
        out.push({ part: 'routine', id: id, loop: false, weight: 0.88, tag: 'scene' + i });
      });
    }
    const extra = {
      sleep: [{ part: 'face', id: 'sleepy' }, { part: 'eyes', id: 'sleepy-eyes' }, { part: 'skin', id: 'sleep-skin' }],
      eat: [{ part: 'armR', id: 'hold-cup' }, { part: 'head', id: 'nod' }, { part: 'lips', id: 'sip' }],
      drink: [{ part: 'armR', id: 'hold-cup' }, { part: 'lips', id: 'sip' }],
      work: [{ part: 'fingers', id: 'piano' }, { part: 'face', id: 'focus' }, { part: 'brows', id: 'think-brow' }],
      help: [{ part: 'armL', id: 'reach' }, { part: 'armR', id: 'swing-out' }, { part: 'torso', id: 'lean-forward' }],
      wash: [{ part: 'skin', id: 'after-bath' }, { part: 'lips', id: 'smile' }, { part: 'hair', id: 'ripple' }],
      toilet: [{ part: 'feet', id: 'rest' }, { part: 'head', id: 'look-down' }],
      exercise: [{ part: 'legL', id: 'squat' }, { part: 'legR', id: 'squat' }, { part: 'torso', id: 'stretch' }],
      dress: [{ part: 'skirt', id: 'settle' }, { part: 'fingers', id: 'gentle' }, { part: 'torso', id: 'twist-left' }],
      talk: [{ part: 'lips', id: 'talk' }, { part: 'brows', id: 'soft' }, { part: 'neck', id: 'nod' }],
      go: [{ part: 'legL', id: 'step' }, { part: 'legR', id: 'step' }, { part: 'feet', id: 'step' }, { part: 'skirt', id: 'sway' }, { part: 'armL', id: 'swing-out' }, { part: 'armR', id: 'swing-out' }],
      wait: [{ part: 'torso', id: 'sway' }, { part: 'hair', id: 'sway' }],
      buy: [{ part: 'armR', id: 'hand-on-hip' }, { part: 'skirt', id: 'sway' }],
    }[intent] || [];
    extra.forEach(function (a) { out.push({ part: a.part, id: a.id, loop: true, weight: 0.7, tag: 'action' }); });
    return out;
  }

  /* --- гардероб ------------------------------------------------------------- */
  function outfitText(state) {
    const parts = [];
    Object.keys(data.SLOT_LABELS).forEach(function (slot) {
      const w = state.outfit[slot];
      if (!w) return;
      const item = data.findItem(w.id);
      parts.push((item ? item.name : w.id) + (w.color ? '' : ''));
    });
    return parts.length ? parts.join(', ') : 'ничего (неловко!)';
  }
  function wear(state, item, color) {
    if (!item) return false;
    if (state.owned.indexOf(item.id) === -1) state.owned.push(item.id);
    const slot = item.slot;
    state.outfit[slot] = { id: item.id, color: color ? color.hex : item.color };
    if (slot === 'dress') { state.outfit.top = null; state.outfit.bottom = null; }
    if (slot === 'top' || slot === 'bottom') state.outfit.dress = null;
    return true;
  }
  function remove(state, item) {
    let changed = false;
    if (!item) {
      ['outer', 'head', 'accessory', 'shoes'].forEach(function (slot) { if (state.outfit[slot]) { state.outfit[slot] = null; changed = true; } });
      return changed;
    }
    Object.keys(state.outfit).forEach(function (slot) {
      if (state.outfit[slot] && state.outfit[slot].id === item.id) { state.outfit[slot] = null; changed = true; }
    });
    return changed;
  }
  function autoOutfit(state, intent) {
    const hour = state.hour;
    let target = null;
    if (intent === 'sleep') target = 'pajama';
    else if (intent === 'wash' || intent === 'toilet') target = 'pajama';
    else if (intent === 'exercise') target = 'sport';
    else if (intent === 'work') target = 'blouse';
    else if (intent === 'buy' || intent === 'go') target = 'dress';
    else if (hour >= 22 || hour < 7) target = 'pajama';
    if (!target) return null;
    const current = state.outfit.dress && state.outfit.dress.id;
    if (current === target) return null;
    if (state.owned.indexOf(target) === -1) state.owned.push(target);
    const item = data.findItem(target);
    if (!item) return null;
    wear(state, item, null);
    play(state, 'skirt', 'settle');
    say(state, 'Сама решила переодеться: ' + item.name + ' больше подходит.', 'nika', 'ai');
    return item;
  }

  /* --- очередь целей -------------------------------------------------------- */
  function enqueue(state, goal) {
    state.goals.push(goal);
    if (state.goals.length > 12) state.goals.shift();
    if (!state.action) beginNext(state);
  }
  function beginNext(state) {
    if (state.action || !state.goals.length) return;
    const goal = state.goals.shift();
    const cfg = ACTIONS[goal.intent];
    if (cfg && cfg.location && state.location !== cfg.location) {
      state.goals.unshift(goal);
      startAction(state, 'go', { targetLocation: cfg.location });
      return;
    }
    startAction(state, goal.intent, goal);
  }
  function startAction(state, intent, goal) {
    const cfg = ACTIONS[intent];
    if (!cfg) return;
    goal = goal || {};
    if (goal.auto) autoOutfit(state, intent);
    else if (state.autonomy && (intent === 'sleep' || intent === 'work' || intent === 'exercise')) autoOutfit(state, intent);
    let minutes = cfg.minutes;
    if (goal.slots && goal.slots.minutes) minutes = clamp(goal.slots.minutes, 3, 300);
    const targetLoc = goal.targetLocation || (cfg.location && state.location !== cfg.location ? cfg.location : null);
    const loc = data.findLocation(targetLoc);
    state.action = {
      intent: intent, label: cfg.label, remaining: minutes, total: minutes,
      targetLocation: targetLoc, targetX: loc ? loc.x : null,
      payload: goal.payload || null, auto: !!goal.auto,
      playedAt: -1,
    };
    state.lastAuto = goal.auto ? intent : state.lastAuto;
    if (intent !== 'dress' || !state.dressing) state.dressing = null;
    const anims = actionAnimations(intent);
    anims.forEach(function (a) {
      play(state, a.part, a.id, { loop: !!a.loop, weight: a.weight || 0.95, tag: a.tag || 'action' });
    });
    emit(state, { type: 'action', intent: intent, label: cfg.label });
    if (goal.auto) say(state, 'Решила сама: ' + cfg.label + ' — ' + (goal.reason || 'так будет лучше'), 'nika', 'ai');
    else if (goal.raw) say(state, 'Приняла команду: «' + goal.raw + '» → ' + cfg.label + '.', 'nika');
  }
  function finishAction(state) {
    const a = state.action;
    if (!a) return;
    if (a.targetLocation) { state.location = a.targetLocation; state.x = a.targetX || state.x; }
    if (a.payload) applyPayload(state, a.payload, a.intent);
    emit(state, { type: 'clearAction', intent: a.intent });
    const done = { sleep: 'Выспалась, сил прибавилось!', eat: 'Вкусно, спасибо!', drink: 'Тепло и хорошо.',
      work: 'Смена закончена, деньги на счету.', help: 'Всё прибрала, чем ещё помочь?',
      wash: 'Искупалась, кожа сияет, волосы распушились.', toilet: 'Вернулась, теперь комфортно.',
      exercise: 'Размялась, тело благодарит.', talk: 'Было приятно поболтать.',
      dress: 'Готово, наряд обновлён — платье село идеально.', wait: 'Немного отдохнула.', buy: 'Вернулась с покупкой.',
      go: 'Пришла.' };
    if (done[a.intent] && (a.auto || a.intent !== 'go')) say(state, done[a.intent], 'nika', a.auto ? 'ai' : '');
    if (a.intent === 'dress') state.dressing = null;
    state.action = null;
    beginNext(state);
  }
  function applyPayload(state, payload, intent) {
    if (!payload) return;
    if (payload.type === 'dress' && payload.item) {
      wear(state, payload.item, payload.color);
      toast(state, 'Надела: ' + payload.item.name, 'good');
      play(state, 'skirt', 'settle');
    } else if (payload.type === 'undress') {
      remove(state, payload.item);
      toast(state, 'Сняла одежду', 'good');
    } else if (payload.type === 'buy' && payload.item) {
      if (state.owned.indexOf(payload.item.id) === -1) state.owned.push(payload.item.id);
      wear(state, payload.item, payload.color);
      toast(state, 'Куплено: ' + payload.item.name, 'good');
    }
  }

  /* --- симуляция ------------------------------------------------------------ */
  function tick(state, dtSeconds) {
    if (state.paused) return;
    const dtMin = Math.min(2, dtSeconds) * MINUTES_PER_SECOND * (state.speed || 1);
    state.minutes += dtMin;
    while (state.minutes >= 1440) { state.minutes -= 1440; state.day += 1; say(state, 'Новый день ' + state.day + '. Доброе утро!', 'nika', 'ai'); }
    state.hour = Math.floor(state.minutes / 60);

    Object.keys(DECAY).forEach(function (k) {
      let factor = 1;
      if (state.action && state.action.intent === 'sleep') factor = 0.4;
      need(state.needs, k, DECAY[k] * dtMin * factor);
    });
    if (state.action) {
      const a = state.action;
      const cfg = ACTIONS[a.intent];
      const eff = cfg.effects || {};
      Object.keys(eff).forEach(function (k) { need(state.needs, k, eff[k] * dtMin); });
      a.remaining -= dtMin;
      if (a.targetX !== null && a.targetX !== undefined) {
        const dx = a.targetX - state.x;
        state.x += Math.sign(dx) * Math.min(Math.abs(dx), dtSeconds * 0.28);
        state.targetX = a.targetX;
      }
      if (Math.floor(a.total - a.remaining) % 22 < dtMin) {
        /* периодически освежаем анимацию действия, чтобы движение не застывало */
        const anims = actionAnimations(a.intent);
        if (anims.length) {
          const first = anims[0];
          play(state, first.part, first.id, { loop: !!first.loop, weight: first.weight || 0.95, tag: first.tag || 'action' });
        }
      }
      if (a.remaining <= 0) finishAction(state);
    }
    state.autoCooldown -= dtMin;
    if (state.autonomy && !state.action && !state.goals.length && state.autoCooldown <= 0) {
      const decision = ai.decide(state);
      if (decision) {
        state.autoCooldown = 10;
        enqueue(state, { intent: decision.intent, auto: true, reason: decision.reason });
      }
    }
    /* здоровье медленно восстанавливается при хорошем уходе */
    const n = state.needs;
    if (n.energy > 50 && n.hunger > 45 && n.mood > 45) need(state.needs, 'health', 0.012 * dtMin);
    else need(state.needs, 'health', -0.006 * dtMin);
  }

  /* --- разбор и выполнение команд ------------------------------------------- */
  function gestureAnimation(state, slots) {
    if (slots.gesture) {
      let plays = slots.gesture.plays.slice();
      if (slots.side === 'L') {
        plays = plays.map(function (p) {
          const mirror = p.part.replace(/L$/, 'L').replace(/R$/, 'L');
          return { part: /(arm|hand|leg)[LR]$/.test(p.part) ? mirror : p.part, id: p.id };
        });
      }
      if (!slots.plural && slots.side === null) {
        /* по умолчанию показываем только одну сторону, кроме парных жестов */
        if (!/танц|хлоп|руки|подними| обе/.test(ai.normalize(state.lastRaw || ''))) {
          plays = plays.filter(function (p) { return !/(armL|legL|handL)$/.test(p.part); });
        }
      }
      plays.forEach(function (p) { play(state, p.part, p.id, { replace: true }); });
      return slots.gesture.label;
    }
    const part = slots.part || (slots.clip && slots.clip.part);
    const id = (slots.clip && slots.clip.id) || (part ? anim.clipsFor(part)[0].id : 'nod');
    const targetPart = part || (slots.clip ? slots.clip.part : 'head');
    play(state, targetPart, id, { replace: true });
    const clip = anim.findClip(targetPart, id);
    return clip ? clip.name.toLowerCase() : id;
  }

  function replyStatus(state) {
    const n = state.needs;
    return 'День ' + state.day + ', ' + clock(state) + '. Энергия ' + Math.round(n.energy) + '%, сытость ' +
      Math.round(n.hunger) + '%, настроение ' + Math.round(n.mood) + '%, гигиена ' + Math.round(n.hygiene) +
      '%, форма ' + Math.round(n.fitness) + '%, комфорт ' + Math.round(n.bladder === undefined ? 100 : n.bladder) +
      '%, денег ' + Math.round(n.money) + ' ₽. Сейчас я ' +
      (state.action ? state.action.label : 'ничего не делаю') + ', в «' + (data.findLocation(state.location) || { name: 'дом' }).name + '».';
  }
  function replyTalk(state) {
    const lines = [
      'Знаешь, я правда чувствую время: утром тянет потянуться у большого окна, вечером — притихнуть на диване.',
      'Сегодня ' + (state.hour < 12 ? 'утро пахнет чаем на кухне' : state.hour < 18 ? 'день полон дел за ноутбуком' : 'вечер тихий и тёплый, горит торшер') + '.',
      'Мне нравится, когда ты мной управляешь: каждое движение я собираю из десятков маленьких кадров.',
      'Я веду дневник: уже ' + state.commands + ' команд и ' + state.animationsPlayed + ' показанных движений.',
      'Если дашь мне свободу, я сама составлю расписание: еда, работа, сон, зарядка.',
    ];
    return lines[(state.commands + Math.floor(state.minutes / 90)) % lines.length];
  }

  function apply(state, parsed) {
    const intent = parsed.intent, s = parsed.slots;
    let reply = '';
    state.commands += 1;
    state.lastRaw = parsed.raw;
    switch (intent) {
      case 'greet':
        reply = 'Привет! Я на связи. Скажи, что сделать — или включи «живи сама».';
        play(state, 'face', 'smile'); play(state, 'armR', 'wave', { replace: true });
        break;
      case 'dress': {
        const item = s.item || data.findItem('dress');
        const color = s.color;
        const before = JSON.parse(JSON.stringify(state.outfit));
        const oldColor = (before.dress || before.top || before.outer || {}).color || '#c9c1d6';
        wear(state, item, color);
        const after = JSON.parse(JSON.stringify(state.outfit));
        const newColor = (after.dress || after.top || after.outer || {}).color || item.color;
        state.dressing = { from: before, to: after, oldColor: oldColor, newColor: newColor, item: item.name };
        play(state, 'routine', 'dress-change', { loop: true, tag: 'scene', weight: 1 });
        play(state, 'routine', 'dress-up', { tag: 'scene0' });
        play(state, 'fingers', 'gentle', { replace: true });
        reply = 'Переодеваюсь в ' + item.name + (color ? ' в ' + color.name + ' цвете' : '') +
          ': ширма, руки вверх, ткань меняет цвет прямо на мне. Сейчас: ' + outfitText(state) + '.';
        enqueue(state, { intent: 'dress', raw: parsed.raw, payload: { type: 'dress', item: item, color: color } });
        break;
      }
      case 'undress': {
        const before = JSON.parse(JSON.stringify(state.outfit));
        remove(state, s.item);
        state.dressing = { from: before, to: JSON.parse(JSON.stringify(state.outfit)),
          oldColor: (before.dress || before.top || before.outer || {}).color || '#c9c1d6',
          newColor: '#c9c1d6', item: 'лёгкую домашнюю одежду' };
        play(state, 'routine', 'dress-change', { loop: true, tag: 'scene', weight: 1 });
        play(state, 'armL', 'lower'); play(state, 'armR', 'lower');
        reply = 'Снимаю ' + (s.item ? s.item.name : 'лишнюю одежду') + ' за ширмой. Теперь на мне: ' + outfitText(state) + '.';
        enqueue(state, { intent: 'dress', raw: parsed.raw, payload: { type: 'undress', item: s.item } });
        break;
      }
      case 'wardrobe':
        reply = 'Сейчас на мне: ' + outfitText(state) + '. В шкафу ' + state.owned.length + ' вещей из ' + data.ITEMS.length + ' доступных.';
        emit(state, { type: 'tab', tab: 'wardrobe' });
        break;
      case 'go': {
        const loc = s.location || data.findLocation('living');
        state.targetX = loc.x;
        enqueue(state, { intent: 'go', raw: parsed.raw, targetLocation: loc.id });
        reply = 'Иду в «' + loc.name + '». Ноги, плечи и подол уже в движении.';
        break;
      }
      case 'sleep':
        enqueue(state, { intent: 'sleep', raw: parsed.raw, slots: s });
        reply = 'Ложусь спать. Энергия восстановится, а я сама надену пижаму.';
        break;
      case 'wake':
        if (state.action && state.action.intent === 'sleep') {
          state.action.remaining = 0;
          reply = 'Уже встаю! Сон прерван, потянусь.';
          play(state, 'torso', 'stretch'); play(state, 'head', 'yawn');
        } else reply = 'Я и так не сплю.';
        break;
      case 'eat': case 'drink': case 'work': case 'help': case 'wash': case 'exercise': case 'toilet':
        enqueue(state, { intent: intent, raw: parsed.raw, slots: s });
        const sceneLabels = {
          wash: 'Принимаю ванну: пена, пар, руки трут волосы, кожа потом сияет.',
          toilet: 'Иду в санузел: шаги, дверь «занято», присела — всё деликатно, за матовой ширмой.',
          work: 'Сажусь за ноутбук: пальцы печатают, брови в раздумье, на экране карточки задач.',
          sleep: 'Режим сна: ложусь, одеяло дышит, Zzz плывут над подушкой.',
        };
        reply = sceneLabels[intent] || ('Начинаю: ' + ACTIONS[intent].label + (s.minutes ? ' на ' + s.minutes + ' мин' : '') + '. Потребности, одежда и анимации подключаются сами.');
        break;
      case 'wait':
        state.goals = [];
        if (state.action) { emit(state, { type: 'clearAction', intent: state.action.intent }); state.action = null; }
        enqueue(state, { intent: 'wait', raw: parsed.raw, slots: s });
        reply = 'Хорошо, постою спокойно и отдохну.';
        break;
      case 'animate': {
        const label = gestureAnimation(state, s);
        state.animationsPlayed += 1;
        need(state.needs, 'mood', 0.6);
        reply = 'Выполняю движение: ' + label + '. У меня ' + anim.total() + ' анимаций, по 10+ на каждую часть тела.';
        break;
      }
      case 'animations': {
        const c = anim.counts();
        reply = 'Всего ' + anim.total() + ' клипов на ' + anim.PARTS.length + ' частей тела: ' +
          anim.PARTS.map(function (p) { return p.label + ' ' + c[p.id]; }).join(', ') +
          '. Есть отдельные бытовые сцены: переодевание, купание, сон, работа, разговор, туалет. Открыла галерею.';
        emit(state, { type: 'tab', tab: 'animations' });
        break;
      }
      case 'body':
        reply = 'Открыла прямое управление суставами: крути ползунки, и тело слушается мгновенно.';
        emit(state, { type: 'tab', tab: 'body' });
        break;
      case 'status':
        reply = replyStatus(state);
        break;
      case 'buy': {
        const item = s.item || data.findItem('sweater');
        const price = item.price || 20;
        if (state.needs.money < price) {
          reply = 'На ' + item.name + ' не хватает ' + Math.ceil(price - state.needs.money) + ' ₽. Поработай — и купим.';
        } else {
          need(state.needs, 'money', -price);
          if (state.owned.indexOf(item.id) === -1) state.owned.push(item.id);
          enqueue(state, { intent: 'buy', raw: parsed.raw, payload: { type: 'buy', item: item, color: s.color } });
          reply = 'Иду в магазин за «' + item.name + '» за ' + price + ' ₽.';
        }
        break;
      }
      case 'teach': {
        if (parsed.raw.indexOf('\n') !== -1) {
          const res = ai.learnFromText(parsed.raw);
          state.learned += res.added;
          reply = 'Разобрала текст: выучила ' + res.added + ' новых фраз и переобучила нейросеть прямо в браузере. Всего выучено: ' + ai.info().learned + '.';
        } else {
          const taught = ai.teach(parsed.raw);
          if (taught) {
            state.learned += 1;
            reply = 'Запомнила: «' + taught.phrase + '» = ' + taught.label + '. Модель дообучилась локально, без интернета.';
          } else reply = 'Напиши так: «запомни: крутись как волчок = станцуй» — или открой вкладку «Обучение» и вставь список фраз.';
        }
        break;
      }
      case 'autonomy_on':
        state.autonomy = true; state.autoCooldown = 0;
        reply = 'Автономия включена: сама выбираю, когда есть, спать, работать, мыться и что надеть.';
        break;
      case 'autonomy_off':
        state.autonomy = false; state.goals = state.goals.filter(function (g) { return !g.auto; });
        reply = 'Автономия выключена. Жду только твоих команд.';
        break;
      case 'save':
        emit(state, { type: 'save' });
        reply = 'Сохранила прогресс в браузере.';
        break;
      case 'reset':
        emit(state, { type: 'reset' });
        reply = 'Начинаем новую жизнь.';
        break;
      case 'talk':
        reply = replyTalk(state);
        play(state, 'routine', 'talk-hello', { tag: 'scene0' });
        play(state, 'face', 'smile');
        enqueue(state, { intent: 'talk', raw: parsed.raw });
        break;
      default:
        reply = 'Не совсем поняла, но попробую догадаться. Напиши «помощь» или «покажи анимации».';
    }
    if (s.negation) reply = 'Поняла, отменяю: ничего не буду делать без твоей команды.';
    say(state, reply, 'nika', parsed.source.indexOf('LLM') !== -1 ? 'llm' : '');
    state.memory.push({ day: state.day, minutes: Math.floor(state.minutes), intent: intent, text: parsed.raw, confidence: parsed.confidence });
    if (state.memory.length > 60) state.memory.shift();
    return { intent: intent, reply: reply, confidence: parsed.confidence, source: parsed.source };
  }

  async function command(text, state) {
    const segments = ai.splitCommands(text);
    const results = [];
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const hint = await ai.llmParse(seg);
      const parsed = ai.parseCommand(seg, hint);
      say(state, seg, 'player');
      results.push(apply(state, parsed));
    }
    return results;
  }

  function playClip(state, part, id) {
    const clip = anim.findClip(part, id);
    if (!clip) return false;
    play(state, part, id, { replace: true });
    state.animationsPlayed += 1;
    const partLabel = (anim.PARTS.find(function (p) { return p.id === part; }) || {}).label || part;
    say(state, 'Показываю: ' + partLabel + ' → «' + clip.name + '».', 'nika');
    return true;
  }

  /* --- сохранение ----------------------------------------------------------- */
  function serialize(state) {
    const copy = {};
    Object.keys(state).forEach(function (k) { if (k !== 'events') copy[k] = state[k]; });
    copy.aiExamples = ai.serialize();
    return copy;
  }
  function deserialize(raw) {
    const fresh = freshState();
    if (!raw) return fresh;
    let saved = raw;
    if (typeof raw === 'string') { try { saved = JSON.parse(raw); } catch (e) { return fresh; } }
    if (!saved || saved.version !== 1) return fresh;
    const state = Object.assign(fresh, saved);
    state.events = [];
    state.log = Array.isArray(saved.log) ? saved.log.slice(-140) : fresh.log;
    state.memory = Array.isArray(saved.memory) ? saved.memory.slice(-60) : [];
    state.needs = Object.assign(fresh.needs, saved.needs || {});
    state.outfit = Object.assign(fresh.outfit, saved.outfit || {});
    state.action = null; state.goals = []; state.dressing = null;
    state.hour = Math.floor(state.minutes / 60);
    if (!('bladder' in state.needs)) state.needs.bladder = fresh.needs.bladder;
    if (Array.isArray(saved.aiExamples)) ai.restore(saved.aiExamples);
    return state;
  }

  NIKA.world = {
    SAVE_KEY: SAVE_KEY, ACTIONS: ACTIONS, MINUTES_PER_SECOND: MINUTES_PER_SECOND,
    freshState: freshState, tick: tick, command: command, apply: apply,
    enqueue: enqueue, playClip: playClip, say: say, emit: emit,
    clock: clock, outfitText: outfitText, wear: wear, remove: remove,
    gestureAnimation: gestureAnimation, actionAnimations: actionAnimations,
    serialize: serialize, deserialize: deserialize,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
