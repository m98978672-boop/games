// Сложная игра для обучения ИИ: «Остров» — управление поселением.
//
// Зачем ещё одна игра, если уже есть трубы и шахматы: трубы учат реакции,
// шахматы — расчёту в открытой информации. Здесь другое: ресурсы, запас
// прочности, стройка и выбор приоритета. Это ближе к настоящим «сложным
// проектам»: ход стоит ресурсов, ошибка видна через десять ходов, а не сразу.
//
// Правила (детерминированные, без случайности в ходе — только в стартовом
// раскладе, чтобы партии были разными):
//   • Каждый ход +3 еды, +2 дерева, +1 камня (фермы и лесопилки работают).
//   • Рабочие едят: расход еды = 1 на строителя каждого здания.
//   • Еда ушла в минус — жители голодают: −1 прочность и меньше прирост.
//   • Здания: ферма (+3 еды), лесопилка (+2 дерева), каменоломня (+1 камень),
//     мастерская (+1 еда, +1 дерево за счёт камня), башня (защита).
//   • Каждые 8 ходов — волна: она бьёт по прочности; башни снижают урон.
//   • Победа — прочность 100 и все три ресурса в запасе одновременно.
//   • Поражение — прочность 0.
//
// Учим не «какой ход сильнее», а порядку действий: сначала еда, потом
// стройка, потом защита. Это и есть навык проекта.

export const BUILDINGS = {
  farm: { cost: { wood: 10, stone: 2 }, gives: { food: 3 }, name: 'ферма' },
  lumber: { cost: { wood: 6, stone: 3 }, gives: { wood: 2 }, name: 'лесопилка' },
  quarry: { cost: { wood: 12, stone: 2 }, gives: { stone: 1 }, name: 'каменоломня' },
  workshop: { cost: { wood: 14, stone: 8 }, gives: { food: 1, wood: 1 }, name: 'мастерская' },
  tower: { cost: { wood: 10, stone: 8 }, gives: {}, name: 'башня' },
};

export const ACTIONS = ['wait', ...Object.keys(BUILDINGS)];

export function newWorld({ seed = 1, turn = 1 } = {}) {
  // Стартовый расклад меняется от seed, но всегда играбельный.
  const extraFood = (seed * 7) % 5;
  return {
    turn,
    food: 12 + extraFood,
    wood: 8 + (seed % 3),
    stone: 3 + ((seed + 1) % 3),
    hp: 100,
    built: [],
    wave: 10,
    log: [],
  };
}

export function materialStock(world) {
  // Сколько еды/дерева/камня приносят построенные здания за ход.
  const s = { food: 3, wood: 2, stone: 1 }; // базовый лагерь
  for (const b of world.built) {
    const g = BUILDINGS[b]?.gives || {};
    for (const [k, v] of Object.entries(g)) s[k] = (s[k] || 0) + v;
  }
  return s;
}

export function workers(world) {
  return world.built.length;
}

/** Что можно построить прямо сейчас. */
export function affordable(world) {
  const out = [];
  for (const [key, b] of Object.entries(BUILDINGS)) {
    if (Object.entries(b.cost).every(([r, v]) => (world[r] || 0) >= v)) out.push(key);
  }
  return out;
}

/** Один ход: действие (wait или ключ здания). Возвращает новый мир и событие. */
export function step(world, action) {
  const w = { ...world, built: [...world.built], log: [...world.log] };
  const events = [];
  if (action && action !== 'wait') {
    const b = BUILDINGS[action];
    if (!b) throw new Error(`неизвестное действие: ${action}`);
    const can = Object.entries(b.cost).every(([r, v]) => (w[r] || 0) >= v);
    if (!can) {
      events.push(`не хватает на ${b.name}`);
    } else {
      for (const [r, v] of Object.entries(b.cost)) w[r] -= v;
      w.built.push(action);
      events.push(`построена ${b.name}`);
    }
  }
  // Производство и еда рабочих.
  const stock = materialStock(w);
  // Рабочие едят впрямую: каждое здание — один рот. Больше стройки —
  // больше расхода, поэтому бесконечные фермы себя не оправдывают.
  w.food += stock.food - workers(w);
  w.wood += stock.wood;
  w.stone += stock.stone;
  if (w.food < 0) {
    w.food = 0;
    w.hp -= 3;
    events.push('голод: жители теряют силы');
  }
  // Победа проверяется до волны: если поселение уже стоит, последний
  // удар не должен отнимать заработанное.
  const early = finished(w);
  if (early.over && early.win) {
    w.log.push({ turn: w.turn, action: action || 'wait', events, state: snapshot(w) });
    return { world: w, events };
  }
  // Волна каждые 8 ходов.
  const towerBonus = w.built.filter((x) => x === 'tower').length;
  if (w.turn % 10 === 0) {
    // Каждая следующая волна сильнее: к концу партии простая оборона не
    // спасает — нужен запас прочности и продуманная стройка.
    const ramp = 1 + Math.floor(w.turn / 30);
    const hit = Math.max(2, (12 + ramp * 4) - towerBonus * 5);
    w.hp -= hit;
    events.push(`волна: урон ${hit}`);
  }
  w.turn += 1;
  w.log.push({ turn: w.turn - 1, action: action || 'wait', events, state: snapshot(w) });
  if (w.log.length > 60) w.log = w.log.slice(-60);
  return { world: w, events };
}

export function snapshot(w) {
  return { turn: w.turn, food: w.food, wood: w.wood, stone: w.stone, hp: w.hp, built: w.built.length };
}

export function finished(world) {
  if (world.hp <= 0) return { over: true, win: false, why: 'прочность на нуле' };
  // Сложность растёт: к 25-му ходу волны бьют вдвое больнее, а для победы
  // нужен настоящий запас и защита, а не первая же башня.
  const s = materialStock(world);
  // Цель: настоящее поселение — запас еды и дерева, камень на будущее,
  // две башни и хотя бы семь зданий, при живой прочности. Проверка идёт
  // до волны, поэтому последний удар не отнимает уже заработанную победу.
  const rich = world.food >= 30 && world.wood >= 30 && world.stone >= 20;
  const secure = world.built.filter((x) => x === 'tower').length >= 2 && world.built.length >= 7;
  if (rich && secure) return { over: true, win: true, why: 'поселение стоит: запасы, стройка и защита' };
  return { over: false, win: false, why: '' };
}

/** Наблюдение для игрока: то, что видно на «экране» без подсказок. */
export function observe(world) {
  const stock = materialStock(world);
  return {
    turn: world.turn,
    resources: { food: world.food, wood: world.wood, stone: world.stone },
    hp: world.hp,
    production: stock,
    workers: workers(world),
    nextWaveIn: 10 - (world.turn % 10 || 10),
    canBuild: affordable(world),
    built: Object.fromEntries(Object.keys(BUILDINGS).map((k) => [k, world.built.filter((x) => x === k).length])),
  };
}

/**
 * Простой игрок-эвристика: порядок «еда → стройка → защита», без перебора.
 * Это базовая линия, которую Квеня должна обыгрывать своим планированием.
 */
export function baselinePolicy(world) {
  const stock = materialStock(world);
  const can = affordable(world);
  const towers = world.built.filter((x) => x === 'tower').length;
  // Сначала не умереть с голоду.
  if (world.food + stock.food < 6) return can.includes('farm') ? 'farm' : 'wait';
  // Перед волной — башня, если её нет.
  const waveSoon = 8 - (world.turn % 8) <= 2;
  if (waveSoon && towers === 0 && can.includes('tower')) return 'tower';
  // Потом рост добычи.
  if (world.built.filter((x) => x === 'farm').length < 2 && can.includes('farm')) return 'farm';
  if (can.includes('lumber')) return 'lumber';
  if (can.includes('quarry')) return 'quarry';
  if (can.includes('workshop')) return 'workshop';
  return 'wait';
}
