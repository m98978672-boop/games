/* §89: технологии стран (F-321…F-334).
   У каждой страны своя наука: она копит баллы, открывает технологии и от этого становится
   сильнее — армия крепче, ракеты точнее, спутник видит больше. Игрок и здесь только смотрит.
   Каталог огромный и не хранится в памяти: 16 сфер × 26 поколений × 25 вариантов = 10 400
   технологий, каждая считается по своему номеру — и всегда одна и та же.
   Всё детерминировано от сида и игровых минут: ни DOM, ни камеры модуль не знает. */
import { hash01, idToInt } from './accidents2d.js';

export const TECH = {
  tiers: 26,               // поколений в каждой сфере
  variants: 25,            // вариантов (проектов) в каждом поколении
  satelliteFrom: 3,        // космос с третьего поколения — и только тогда видно армии
  effPerTier: 0.045,       // насколько одно поколение усиливает своё направление
  costBase: 42,            // баллов за первую технологию сферы
  costGrow: 1.17,          // во сколько раз дороже каждое следующее поколение
  costVariant: 0.02,       // наценка за номер проекта — чтобы проекты отличались
  rateBase: 0.25,          // наука страны в игровую минуту, до городов
  rateCity: 0.05,          // и добавка за каждый город
  keepLast: 5,             // сколько последних технологий помнит страна
  unlockPerStep: 96,       // предохранитель от зависания на догоне времени
  spreadBase: 260,         // км разброса ракет при точности 1.0 — столько было и до наук
  hitBase: 800,            // км радиуса поиска цели при точности 1.0
  armyBase: 0.55,          // боеготовность армии без технологий
  armyPerTech: 1.8,        // и насколько её поднимает усиленная армия
  // наша страна начинает не с нуля: спутник уже есть (иначе смотреть было бы не на что)
  ownHead: { space: 4, comms: 2, compute: 2, military: 2, farm: 2, build: 1 },
  mods: ['Волга', 'Ладога', 'Север', 'Пламя', 'Кристалл', 'Резонанс', 'Гармония', 'Вектор',
    'Орбита', 'Кедр', 'Луч', 'Гранит', 'Лавина', 'Заря', 'Комета', 'Меридиан', 'Атлас',
    'Циклон', 'Факел', 'Аметист', 'Бастион', 'Тайфун', 'Спектр', 'Кварц', 'Пионер'],
  gens: ['первое', 'второе', 'третье', 'четвёртое'],
  /* F-321: 16 сфер. В каждой восемь своих предметов — из них и складываются имена:
     «Севооборот «Волга» · второе поколение» читается как настоящая разработка. */
  branches: [
    { id: 'farm', name: 'земледелие', nouns: ['севооборот', 'комбайн', 'элеватор', 'ирригатор', 'агродром', 'семенник', 'опылитель', 'сепаратор'], w: { food: 0.5, wealth: 0.2 } },
    { id: 'metal', name: 'металлургия', nouns: ['домен', 'прокат', 'сплав', 'концентрат', 'тигель', 'ковш', 'стан', 'отжиг'], w: { industry: 0.5, army: 0.15 } },
    { id: 'energy', name: 'энергетика', nouns: ['генератор', 'реактор', 'накопитель', 'кабель', 'трансформатор', 'котёл', 'коллектор', 'каскад'], w: { industry: 0.5, wealth: 0.15 } },
    { id: 'transport', name: 'транспорт', nouns: ['локомотив', 'паром', 'тягач', 'разъезд', 'терминал', 'монорельс', 'дирижабль', 'экспресс'], w: { logistics: 0.5, wealth: 0.2 } },
    { id: 'medicine', name: 'медицина', nouns: ['госпиталь', 'антибиотик', 'препарат', 'сканер', 'имплантат', 'стационар', 'санаторий', 'реаниматор'], w: { people: 0.5, army: 0.1 } },
    { id: 'comms', name: 'связь', nouns: ['ретранслятор', 'коммутатор', 'модем', 'протокол', 'репитер', 'шлюз', 'телеграф', 'усилитель'], w: { intel: 0.4, logistics: 0.2 } },
    { id: 'compute', name: 'вычисления', nouns: ['процессор', 'сопроцессор', 'компилятор', 'кластер', 'криптоблок', 'квант', 'регистр', 'симулятор'], w: { intel: 0.4, accuracy: 0.2 } },
    { id: 'space', name: 'космос', nouns: ['спутник', 'носитель', 'зонд', 'телескоп', 'буксир', 'модуль', 'разгонщик', 'маяк'], w: { intel: 0.3, accuracy: 0.3, space: 0.4 } },
    { id: 'military', name: 'военное дело', nouns: ['редут', 'радар', 'перехватчик', 'комплекс', 'заслон', 'арсенал', 'щит', 'дрон'], w: { army: 0.5, accuracy: 0.2 } },
    { id: 'build', name: 'строительство', nouns: ['кран', 'каркас', 'тоннель', 'мост', 'фундамент', 'ангар', 'домкрат', 'виадук'], w: { build: 0.5, wealth: 0.1 } },
    { id: 'materials', name: 'материалы', nouns: ['композит', 'полимер', 'кристалл', 'изолятор', 'наполнитель', 'адгезив', 'реагент', 'сэндвич'], w: { industry: 0.35, army: 0.2 } },
    { id: 'eco', name: 'экология', nouns: ['фильтр', 'очиститель', 'катализатор', 'резервуар', 'биореактор', 'поглотитель', 'компост', 'индикатор'], w: { people: 0.35, food: 0.2 } },
    { id: 'bio', name: 'биология', nouns: ['штамм', 'геном', 'фермент', 'инкубатор', 'селектор', 'культиватор', 'анализатор', 'биоконтур'], w: { people: 0.4, food: 0.25 } },
    { id: 'logistics', name: 'логистика', nouns: ['маршрут', 'хаб', 'порт', 'контейнер', 'манифест', 'распределитель', 'трейлер', 'диспетчер'], w: { logistics: 0.4, wealth: 0.2 } },
    { id: 'education', name: 'образование', nouns: ['класс', 'лекторий', 'учебник', 'практикум', 'кампус', 'семинар', 'экзаменатор', 'кружок'], w: { science: 0.5, intel: 0.2 } },
    { id: 'finance', name: 'финансы', nouns: ['банк', 'кредит', 'фонд', 'аудит', 'клиринг', 'аккредитив', 'реестр', 'счёт'], w: { wealth: 0.5, science: 0.15 } }
  ]
};

/* F-321: сколько всего технологий. Число не «примерно», а точное: 10 400. */
export function techCount() {
  return TECH.branches.length * TECH.tiers * TECH.variants;
}

/* F-322: номер технологии из сферы, поколения и проекта. Три числа — один номер. */
export function techIndex(branch, tier, variant = 0) {
  const b = typeof branch === 'string' ? TECH.branches.findIndex((x) => x.id === branch) : Math.floor(branch);
  if (b < 0 || b >= TECH.branches.length) return -1;
  const t = Math.max(1, Math.min(TECH.tiers, Math.floor(tier) || 1));
  const v = Math.max(0, Math.min(TECH.variants - 1, Math.floor(variant) || 0));
  return (b * TECH.tiers + (t - 1)) * TECH.variants + v;
}

/* F-322: технология по номеру. Имя, сфера, стоимость и польза считаются, а не хранятся. */
export function techAt(index) {
  const total = techCount();
  const i = ((Math.floor(index) % total) + total) % total;
  const variant = i % TECH.variants;
  const rest = (i - variant) / TECH.variants;
  const tier = (rest % TECH.tiers) + 1;
  const bIdx = (rest - (tier - 1)) / TECH.tiers;
  const branch = TECH.branches[bIdx];
  const nounIdx = (tier - 1) % branch.nouns.length;
  const gen = Math.floor((tier - 1) / branch.nouns.length);
  const noun = branch.nouns[nounIdx];
  const name = noun.charAt(0).toUpperCase() + noun.slice(1) + ' «' + TECH.mods[variant] + '» · ' + TECH.gens[gen] + ' поколение';
  const cost = Math.round(TECH.costBase * Math.pow(TECH.costGrow, tier - 1) * (1 + variant * TECH.costVariant));
  return {
    index: i, branch: branch.id, branchName: branch.name, tier, variant,
    generation: gen + 1, noun, name, cost, weights: branch.w
  };
}

export function techName(index) {
  return techAt(index).name;
}

/* F-323: польза технологий. Каждое поколение чуть усиливает свои направления;
   спутник — не число, а порог: космос третьего поколения. */
export function techEffects(state) {
  const out = {
    army: 1, accuracy: 1, industry: 1, food: 1, people: 1,
    wealth: 1, logistics: 1, intel: 1, science: 1, build: 1, space: 1
  };
  if (!state || !state.tiers) { out.satellite = false; return out; }
  for (const b of TECH.branches) {
    const tier = state.tiers[b.id] || 0;
    if (!tier) continue;
    for (const k in b.w) if (k in out) out[k] += b.w[k] * tier * TECH.effPerTier;
  }
  out.satellite = (state.tiers.space || 0) >= TECH.satelliteFrom;
  return out;
}

/* F-324: сколько науки даёт страна в игровую минуту — города и есть двигатель. */
export function techRate(country) {
  const cities = country && country.cities ? country.cities.length : 0;
  return TECH.rateBase + cities * TECH.rateCity;
}

/* F-324: стартовое состояние науки страны. Порядок сфер перемешан хешем от сида —
   у каждой страны своя очередь разработок, и она не меняется при перезапуске. */
export function buildTech(country, seed = 424242) {
  const key = idToInt(country.id) + (country.own ? 7 : 0) + 1;
  const order = TECH.branches.map((b, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(hash01(seed + key * 13 + i * 977, 163) * (i + 1)) % (i + 1);
    const t = order[i]; order[i] = order[j]; order[j] = t;
  }
  const tiers = {};
  let head = 0;
  for (const b of TECH.branches) {
    const v = country.own && TECH.ownHead[b.id] ? TECH.ownHead[b.id] : 0;
    tiers[b.id] = v;
    head += v;
  }
  const state = {
    seed, key, order, ptr: 0, tiers,
    points: Math.round(hash01(seed + key * 31, 167) * 40),
    count: head, last: [], eff: null, next: null
  };
  state.eff = techEffects(state);
  state.next = nextTech(state);
  return state;
}

/* F-325: следующая цель страны. Сферы идут по кругу своей очереди — наука не стоит
   в одной сфере, а размазывается по стране. Проект выбирается хешем от счётчика. */
export function nextTech(state) {
  if (!state || !state.order) return null;
  const n = state.order.length;
  for (let k = 0; k < n; k++) {
    const bIdx = state.order[(state.ptr + k) % n];
    const branch = TECH.branches[bIdx];
    const tier = (state.tiers[branch.id] || 0) + 1;
    if (tier > TECH.tiers) continue;
    const variant = Math.floor(hash01(state.seed + (state.count + 1) * 37 + bIdx * 101, 173) * TECH.variants) % TECH.variants;
    const t = techAt(techIndex(bIdx, tier, variant));
    t.progress = Math.max(0, Math.min(1, state.points / t.cost));
    return t;
  }
  return null;
}

/* F-369: очередь разработок — что страна возьмёт после текущей цели.
   Считаем на копии счётчиков: сама наука не двигается, панель просто показывает
   три ближайших проекта. Без этой функции в интерфейсе было видно только
   «следующая», и было непонятно, изучается ли что-то вообще. */
export function techQueue(state, n = 3) {
  if (!state || !state.order || !state.order.length || !state.next) return [];
  const total = state.order.length;
  const tiers = { ...state.tiers };
  let count = state.count;
  let ptr = state.ptr;
  // первым делом «закрываем» текущую цель: иначе очередь начиналась бы с неё же
  const cur = state.next;
  tiers[cur.branch] = cur.tier;
  count++;
  const bi = TECH.branches.findIndex((b) => b.id === cur.branch);
  ptr = (Math.max(0, bi) + 1) % total;
  const out = [];
  for (let k = 0; k < total * TECH.tiers && out.length < n; k++) {
    const bIdx = state.order[(ptr + k) % total];
    const branch = TECH.branches[bIdx];
    if (!branch) continue;
    const tier = (tiers[branch.id] || 0) + 1;
    if (tier > TECH.tiers) continue;
    const variant = Math.floor(hash01(state.seed + (count + 1) * 37 + bIdx * 101, 173) * TECH.variants) % TECH.variants;
    const t = techAt(techIndex(bIdx, tier, variant));
    out.push({ name: t.name, branch: branch.name, tier, cost: t.cost });
    tiers[branch.id] = tier;
    count++;
  }
  return out;
}

/* F-326: шаг науки. Баллы копятся вместе с игровыми минутами; сколько накопилось —
   столько технологий и открылось. Один и тот же отрезок времени даёт одно и то же. */
export function advanceTech(world, minutes) {
  if (!world || !world.countries) return 0;
  const prev = Number.isFinite(world.techAt) ? world.techAt : 0;
  const now = Number.isFinite(minutes) ? minutes : prev;
  const dt = now - prev;
  if (!(dt > 0)) return 0;
  world.techAt = now;
  let unlocked = 0;
  for (const c of world.countries) {
    const st = c.tech;
    if (!st) continue;
    const rate = Number.isFinite(st.rate) ? st.rate : techRate(c);
    st.points += rate * dt * (st.eff ? st.eff.science : 1);
    let guard = 0;
    while (st.next && st.points >= st.next.cost && guard++ < TECH.unlockPerStep) {
      const t = st.next;
      st.points -= t.cost;
      st.tiers[t.branch] = t.tier;
      st.count++;
      st.last.push(t.name);
      if (st.last.length > TECH.keepLast) st.last.shift();
      const bi = TECH.branches.findIndex((b) => b.id === t.branch);
      st.ptr = (Math.max(0, bi) + 1) % st.order.length;
      st.eff = techEffects(st);
      st.next = nextTech(st);
      unlocked++;
    }
    if (st.next) st.next.progress = Math.max(0, Math.min(1, st.points / st.next.cost));
  }
  world.stats.tech = (world.stats.tech || 0) + unlocked;
  return unlocked;
}

/* F-327: сводка науки для панели: своя страна, её последние разработки и кто впереди. */
export function techStats(world, observerId = 'own') {
  const obs = world && world.countries ? world.countries.find((c) => c.id === observerId) : null;
  const st = obs && obs.tech ? obs.tech : null;
  const eff = st ? st.eff : techEffects(null);
  const others = (world && world.countries ? world.countries : [])
    .filter((c) => c.id !== observerId && c.tech)
    .map((c) => ({ id: c.id, name: c.name, count: c.tech.count }))
    .sort((a, b) => b.count - a.count);
  const left = st && st.next ? Math.max(0, st.next.cost - st.points) : 0;
  const ratePerMin = st ? (st.rate || 0) * (st.eff ? st.eff.science : 1) : 0;
  const etaMin = st && st.next && ratePerMin > 0 ? Math.ceil(left / ratePerMin) : 0;
  return {
    // F-370: видно, изучается ли что-то прямо сейчас и сколько ждать
    research: !!(st && st.next),
    left,
    ratePerMin: Math.round(ratePerMin * 100) / 100,
    etaMin,
    etaDays: etaMin > 0 ? Math.ceil(etaMin / 1440) : 0,
    bar: st && st.next ? Math.round(st.next.progress * 100) : 100,
    queue: st ? techQueue(st, 3) : [],
    count: st ? st.count : 0,
    catalog: techCount(),
    points: st ? Math.round(st.points) : 0,
    rate: obs ? techRate(obs) : 0,
    perDay: obs ? Math.round(techRate(obs) * 1440) : 0,
    next: st && st.next ? st.next.name : null,
    nextCost: st && st.next ? st.next.cost : 0,
    progress: st && st.next ? st.next.progress : 0,
    last: st ? st.last.slice() : [],
    branches: st ? TECH.branches.map((b) => ({ id: b.id, name: b.name, tier: st.tiers[b.id] || 0 })) : [],
    space: st ? st.tiers.space || 0 : 0,
    satellite: !!(st && st.eff.satellite),
    army: eff.army,
    accuracy: eff.accuracy,
    intel: eff.intel,
    science: eff.science,
    leaders: others.slice(0, 3),
    leaderCount: others.length ? others[0].count : 0
  };
}

/* F-328: разброс ракет: чем выше точность, тем кучнее ложатся взрывы. */
export function missileSpread(accuracy = 1) {
  const a = Number.isFinite(accuracy) ? Math.max(0.5, Math.min(4, accuracy)) : 1;
  return Math.round(TECH.spreadBase / a);
}

/* F-328: радиус, в котором ракета находит цель — с точностью он растёт. */
export function missileReach(accuracy = 1) {
  const a = Number.isFinite(accuracy) ? Math.max(0.5, Math.min(4, accuracy)) : 1;
  return Math.round(TECH.hitBase * a);
}

/* F-329: боеготовность армии — длина полоски у метки. Технологии поднимают её,
   затяжная война опускает: цифра видна, но ничего не решает. */
export function armyPower(country, world) {
  const eff = country && country.tech ? country.tech.eff : null;
  const army = eff ? eff.army : 1;
  let fatigue = 0;
  if (world && country && world.wars) {
    for (const w of world.wars) {
      if (w.to !== null) continue;
      if (w.a !== country.id && w.b !== country.id) continue;
      fatigue = Math.min(0.45, Math.abs((w.sway || 0) + (w.drift || 0)) / 1800);
      break;
    }
  }
  return Math.max(0.15, Math.min(1, TECH.armyBase + (army - 1) * TECH.armyPerTech - fatigue));
}
