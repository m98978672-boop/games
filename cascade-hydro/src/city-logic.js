// ============================================================================
//  СИСТЕМА ГОРОДСКОЙ ЛОГИКИ, ЗОНИРОВАНИЯ И МУНИЦИПАЛЬНОГО РАЗВИТИЯ (8 ГОРОДОВ)
//  Каждый город самостоятельно анализирует 5 городских контуров:
//    1. Энергоснабжение и стабильность сети (МВт + ОРУ)
//    2. Водоснабжение (близость рек, прорытых игроком КАНАЛОВ [2] и насосных [G]!)
//    3. Междугородняя логистика и торговля по трассам/мостам и шлюзам [L]
//    4. Баланс жилья и рабочих мест (4 городские функциональные зоны)
//    5. Комфорт городской среды, службы (школы, больницы, водоканал) и защита от паводка
// ============================================================================

import { WORLD, BUILDING_ARCHETYPES } from './config.js';
import { clamp } from './noise.js';

export const CITY_FOCUS_MODES = {
  balanced: {
    id: 'balanced',
    label: 'Баланс',
    title: 'Сбалансированный генплан: гармоничный рост жилья, служб и экономики',
    demandMult: 1.0,
    tariffMult: 1.0,
    growthMult: 1.0,
  },
  industry: {
    id: 'industry',
    label: 'Индустрия',
    title: 'Промышленный упор: больше заводов и стройбаз БСУ/ДСК (+18% доход контрактов и стройки трасс, +14% спрос МВт)',
    demandMult: 1.14,
    tariffMult: 1.18,
    growthMult: 1.08,
  },
  science: {
    id: 'science',
    label: 'Наука и Эко',
    title: 'Наукоград и эко-среда: кампусы, парковые террасы и экономия энергии (-10% спрос МВт, +15% благополучие и туризм)',
    demandMult: 0.90,
    tariffMult: 1.12,
    growthMult: 1.05,
  },
};

export const AQUEDUCT_CONNECT_REWARD = 7500;

export function classifyBuildingZone(cat) {
  if (cat === 'res' || cat === 'mid' || cat === 'high') return 'housing';
  if (cat === 'ind' || cat === 'bld' || cat === 'smlt' || cat === 'agro') return 'industry';
  if (cat === 'dc' || cat === 'sci' || cat === 'port') return 'techCom';
  return 'civicUtil'; // civ, util
}

export function initCityLogicState(city) {
  city.focusMode = 'balanced';
  city.waterScore = 52;
  city.powerScore = city.connected ? 70 : 18;
  city.roadScore = 30;
  city.jobsBalanceScore = 80;
  city.comfortScore = 74;
  city.happinessPct = 66;
  city.canalAqueductConnected = false;
  city.aqueductRewardClaimed = false;
  city.urbanGrowthMult = 1.0;
  city.urbanTariffMult = 1.0;
  city.districts = { housing: 0, industry: 0, techCom: 0, civicUtil: 0 };
  city.bottleneckText = 'Готов к подключению ЛЭП и подводу канала воды';
  city.nextPlanReason = 'Формирование стартового квартала';
  city.tradePartnersCount = 0;
}

export function recomputeCityDistricts(city, allBuildings) {
  const d = { housing: 0, industry: 0, techCom: 0, civicUtil: 0 };
  for (let i = 0; i < city.buildingIndices.length; i++) {
    const b = allBuildings[city.buildingIndices[i]];
    if (!b) continue;
    const z = classifyBuildingZone(b.cat);
    d[z] = (d[z] || 0) + 1;
  }
  city.districts = d;
  return d;
}

/**
 * Оценивает все 5 контуров городской логики, проверяет подвод воды каналом игрока
 * и начисляет муниципальную премию при первом подключении городского водовода!
 */
export function evaluateCityUrbanLogic(city, economy) {
  const hydro = economy.hydro;
  const hs = WORLD.horizScale;
  recomputeCityDistricts(city, economy.allBuildings);

  // 1. Энергоснабжение (0..100)
  const subBonus = hydro.substations.length > 0 ? 8 : 0;
  if (!city.connected) {
    city.powerScore = 15;
  } else {
    const cov = economy.creative ? Math.max(0.95, city.powerRatio) : city.powerRatio;
    city.powerScore = Math.round(clamp(cov * 94 + subBonus, 8, 100));
  }

  // 2. Водоснабжение: проверяем естественную реку и рукотворный КАНАЛ / НАСОСНУЮ [G] рядом с городом!
  let naturalWet = 0;
  let engineeredCanalWet = false;
  const scanRadii = [city.plateauRadius * 0.98, city.plateauRadius * 1.42, 178 * hs];
  for (let rIdx = 0; rIdx < scanRadii.length; rIdx++) {
    const rad = scanRadii[rIdx];
    for (let a = 0; a < 10; a++) {
      const ang = (a / 10) * Math.PI * 2;
      const sx = city.x + Math.cos(ang) * rad;
      const sz = city.z + Math.sin(ang) * rad;
      if (Math.abs(sx) >= WORLD.size * 0.49 || Math.abs(sz) >= WORLD.size * 0.49) continue;
      const gPos = hydro.worldToGrid(sx, sz);
      const cell = gPos.gz * hydro.grid + gPos.gx;
      const depth = hydro.h[cell];
      if (depth > 0.16) {
        naturalWet++;
        if (hydro.linedMask[cell] || hydro.concrete[cell] > 0.25) {
          engineeredCanalWet = true;
        }
      }
    }
  }

  // Также проверяем: подведена ли вода в оросительное кольцо или работает ли рядом Насосная станция [G],
  // либо прорыт ли обводнённый канал (excavatedNormM3 > 60 и вода подошла в радиус 185 м к сухому городу)!
  let hasNearbyPump = false;
  if (hydro.pumpStations && hydro.pumpStations.length > 0) {
    for (let p = 0; p < hydro.pumpStations.length; p++) {
      const ps = hydro.pumpStations[p];
      if (Math.hypot(ps.wx - city.x, ps.wz - city.z) < 255 * hs) {
        hasNearbyPump = true;
        break;
      }
    }
  }

  const wasDryPlateauCity = (
    city.id === 'kamen' ||
    city.id === 'kremniy' ||
    city.id === 'sever' ||
    city.id === 'alumingrad' ||
    city.id === 'agro'
  );
  const canalBroughtWater = engineeredCanalWet || hasNearbyPump || (city.needsIrrigation && city.irrigated)
    || (wasDryPlateauCity && hydro.excavatedNormM3 > 55 && naturalWet >= 2);

  city.canalAqueductConnected = canalBroughtWater;

  if (canalBroughtWater && !city.aqueductRewardClaimed) {
    city.aqueductRewardClaimed = true;
    economy.earn(AQUEDUCT_CONNECT_REWARD);
    if (economy.callbacks && economy.callbacks.onNotify) {
      economy.callbacks.onNotify(
        `◈ Городской водовод подключён к г. ${city.name}! Премия мэрии +${AQUEDUCT_CONNECT_REWARD.toLocaleString('ru-RU')} ₽ и ускорение роста кварталов!`,
        'good',
      );
    }
  }

  const baseWater = naturalWet >= 3 ? 68 : (naturalWet >= 1 ? 54 : 38);
  city.waterScore = Math.round(clamp(
    baseWater + (canalBroughtWater ? 34 : 0) + (hasNearbyPump ? 14 : 0),
    25,
    100,
  ));

  // 3. Транспортная связность и межгородская торговля (0..100)
  const routes = (economy.roadNetwork && economy.roadNetwork.routes)
    ? economy.roadNetwork.routes.filter((r) => r.fromId === city.id || r.toId === city.id)
    : [];
  const builtRoutes = routes.filter((r) => r.completed).length;
  city.tradePartnersCount = builtRoutes;
  const routeRatio = routes.length > 0 ? (builtRoutes / routes.length) : 1.0;
  const portLockBonus = (city.archetype === 'port' && hydro.navLocks.length > 0) ? 16 : 0;
  city.roadScore = Math.round(clamp(28 + routeRatio * 64 + portLockBonus, 20, 100));

  // 4. Баланс жилья и рабочих мест (0..100)
  const d = city.districts;
  const totalB = Math.max(1, city.buildingIndices.length);
  const workCount = d.industry + d.techCom;
  const targetHousing = Math.max(2, workCount * 0.85);
  const imbalance = Math.abs(d.housing - targetHousing) / Math.max(3, totalB);
  city.jobsBalanceScore = Math.round(clamp(96 - imbalance * 65, 42, 100));

  // 5. Городская среда, службы (водоканал, больницы, школы) и безопасность от паводка
  const civicShare = d.civicUtil / totalB;
  const focusBonus = city.focusMode === 'science' ? 12 : 0;
  const ecoMarinaBonus = hydro.fishFarms.length > 0 ? 6 : 0;
  city.comfortScore = city.isFlooded
    ? 12
    : Math.round(clamp(56 + civicShare * 135 + focusBonus + ecoMarinaBonus, 35, 100));

  // Итоговый индекс благополучия города (0..100%)
  const rawHappy =
    city.powerScore * 0.32 +
    city.waterScore * 0.24 +
    city.roadScore * 0.16 +
    city.jobsBalanceScore * 0.14 +
    city.comfortScore * 0.14;
  city.happinessPct = Math.round(clamp(rawHappy, 12, 100));
  city.satisfaction = city.happinessPct / 100;

  const focusCfg = CITY_FOCUS_MODES[city.focusMode] || CITY_FOCUS_MODES.balanced;
  city.urbanGrowthMult = clamp(
    (0.62 + (city.happinessPct / 100) * 0.88) * (canalBroughtWater ? 1.24 : 1.0) * focusCfg.growthMult,
    0.45,
    1.95,
  );
  city.urbanTariffMult = clamp(
    (0.88 + (city.happinessPct / 100) * 0.28) * focusCfg.tariffMult,
    0.82,
    1.42,
  );

  // Понятная игроку диагностика главной потребности города прямо сейчас!
  if (city.isFlooded) {
    city.bottleneckText = '! Затопление улиц — отведите воду каналом или откройте водосброс!';
  } else if (!city.connected) {
    city.bottleneckText = '✦ Подключите город к ЛЭП [P] для запуска бурного роста';
  } else if (city.powerScore < 58) {
    city.bottleneckText = '▲ Дефицит мощности МВт — подайте больше воды в каналы ГЭС!';
  } else if (!canalBroughtWater && city.waterScore < 62) {
    city.bottleneckText = `◈ Ждёт воду: подведите канал [2] или насосную [G] (+${AQUEDUCT_CONNECT_REWARD.toLocaleString('ru-RU')} ₽)`;
  } else if (builtRoutes < routes.length) {
    city.bottleneckText = `≡ Строятся межгородские трассы (${builtRoutes}/${routes.length}) — ускоряется от БСУ [B]`;
  } else if (d.housing < workCount * 0.75) {
    city.bottleneckText = '■ Приток специалистов: мэрия активно строит жилые кварталы';
  } else {
    city.bottleneckText = `★ Процветающий центр (благополучие ${city.happinessPct}%, водовод активен)`;
  }
}

/**
 * Умный градостроительный планировщик города: выбирает следующее здание не случайно,
 * а исходя из дефицита жилья / рабочих мест / служб, кольца застройки и указа мэрии!
 */
export function chooseSmartUrbanArchetype(city, ring, rng, allBuildings) {
  const allowedByArchetype = {
    town:       ['res', 'mid', 'civ', 'util', 'bld', 'ind'],
    metropolis: ['res', 'mid', 'high', 'civ', 'util', 'sci', 'bld'],
    civic:      ['res', 'mid', 'high', 'civ', 'util', 'sci'],
    industrial: ['ind', 'bld', 'mid', 'res', 'util', 'civ'],
    industry:   ['ind', 'bld', 'mid', 'res', 'util', 'civ'],
    agro:       ['agro', 'res', 'util', 'bld', 'civ'],
    science:    ['sci', 'res', 'civ', 'mid', 'util'],
    alpine:     ['res', 'civ', 'sci', 'port'],
    smelter:    ['smlt', 'ind', 'bld', 'util', 'mid'],
    datacenter: ['dc', 'sci', 'high', 'mid', 'civ'],
    tech:       ['dc', 'sci', 'high', 'mid', 'civ'],
    port:       ['port', 'bld', 'mid', 'res', 'ind', 'civ'],
    resort:     ['port', 'res', 'civ', 'mid'],
  };

  const d = recomputeCityDistricts(city, allBuildings);
  const totalB = Math.max(1, city.buildingIndices.length);
  const allowedCats = allowedByArchetype[city.archetype] || ['res', 'mid', 'civ', 'bld'];
  const fullPool = BUILDING_ARCHETYPES.filter((a) => allowedCats.includes(a.cat));
  if (fullPool.length === 0) return BUILDING_ARCHETYPES[0];

  let wantedZone = null;
  let planReason = '';

  // 1. Если городу не хватает школ, больниц или водоканала (< 18% фонда) — строим городские службы!
  if (totalB >= 4 && d.civicUtil / totalB < 0.18) {
    wantedZone = 'civicUtil';
    planReason = city.waterScore < 65 ? 'нужен узел водоканала и служб' : 'развитие соцсферы города';
  } else if (d.housing < (d.industry + d.techCom) * 0.82) {
    // 2. Если рабочих мест больше, чем квартир — строим жилые дома/высотки!
    wantedZone = 'housing';
    planReason = 'расселение новых специалистов';
  } else if (city.focusMode === 'industry') {
    wantedZone = rng() < 0.68 ? 'industry' : 'housing';
    planReason = 'указ «Индустрия и стройбазы»';
  } else if (city.focusMode === 'science') {
    wantedZone = rng() < 0.62 ? 'techCom' : 'civicUtil';
    planReason = 'указ «Наукоград и эко-среда»';
  } else if ((d.industry + d.techCom) < d.housing * 0.78) {
    wantedZone = allowedCats.some((c) => c === 'dc' || c === 'sci' || c === 'port') ? 'techCom' : 'industry';
    planReason = 'создание новых рабочих мест';
  }

  let candidates = wantedZone
    ? fullPool.filter((a) => classifyBuildingZone(a.cat) === wantedZone)
    : fullPool;
  if (candidates.length === 0) candidates = fullPool;

  // Учитываем градостроительную этажность: в центре (ring <= 2) крупные города возводят доминанты, на окраинах — коттеджи и цеха!
  if (ring <= 2 && city.level >= 2) {
    const central = candidates.filter((a) => a.shape === 'tower' || a.shape === 'step' || a.shape === 'spire' || a.hMax >= 20);
    if (central.length > 0 && rng() < 0.72) candidates = central;
  } else if (ring >= 4) {
    const outer = candidates.filter((a) => a.shape === 'gable' || a.shape === 'arch' || a.shape === 'cyl' || a.hMax <= 22);
    if (outer.length > 0 && rng() < 0.70) candidates = outer;
  }

  const chosen = candidates[Math.floor(rng() * candidates.length)];
  city.nextPlanReason = planReason || 'плановая застройка квартала';
  return chosen;
}
