// ============================================================================
//  ГЕНЕРАТОР РЕЧНОГО БАССЕЙНА (0.8×0.8 км / 5×5 км / 10×10 км)
//  - 3 топографических сценария («Большая Быстрица», «Северные Пороги», «Великая Дельта»)
//  - Альпийские снежники и ледники питания рек на вершинах (выше WORLD.snowLineY)
//  - Ровные террасы под 8 городов и промкластеров + судоходный фарватер
// ============================================================================

import { WORLD, CITY_DEFS } from './config.js';
import { clamp, smoothstep, lerp, fbm2D, ridged2D, samplePolyline } from './noise.js';

export const VALLEY_RIVERS = {
  bystritsa: {
    main: [
      { x: -92, z: -376, bed: 35.4, width: 17 },
      { x: -58, z: -322, bed: 32.8, width: 21 },
      { x: -22, z: -262, bed: 30.0, width: 29 }, // Верхняя чаша водохранилища
      { x: 4,   z: -206, bed: 27.6, width: 22 },
      { x: 12,  z: -158, bed: 25.0, width: 14 }, // Гранитная теснина «Ворота Грома»
      { x: 16,  z: -112, bed: 21.6, width: 18 }, // Нижний бьеф теснины (идеален для машзала ГЭС!)
      { x: 96,  z: -56,  bed: 19.0, width: 21 }, // Вход в излучину «Большая Подкова»
      { x: 134, z: 32,   bed: 16.4, width: 22 }, // Восточный плёс (канал в Агродолину)
      { x: 88,  z: 108,  bed: 13.6, width: 23 },
      { x: 4,   z: 122,  bed: 10.8, width: 23 }, // Замыкание «Подковы»
      { x: -46, z: 198,  bed: 8.4,  width: 26 }, // Слияние с ручьём Гремучим у Посада
      { x: -16, z: 294,  bed: 6.3,  width: 31 }, // Судоходный плёс Усть-Порта
      { x: 12,  z: 384,  bed: 4.4,  width: 36 }, // Южное морское устье
    ],
    eastCreek: [
      { x: 152, z: -374, bed: 40.5, width: 11 },
      { x: 102, z: -324, bed: 36.6, width: 12 },
      { x: 44,  z: -286, bed: 32.8, width: 14 },
      { x: -16, z: -258, bed: 29.8, width: 16 },
    ],
    westCreek: [
      { x: -374, z: 68,  bed: 27.5, width: 10 },
      { x: -268, z: 96,  bed: 21.8, width: 11 },
      { x: -146, z: 132, bed: 14.8, width: 12 },
      { x: -46,  z: 194, bed: 8.5,  width: 14 },
    ],
    gorges: [
      { x: 12, z: -158, spanZ: 48, strength: 25.0 },
    ],
    seedOffset: 0,
    widthScale: 1.0,
    soilBonus: 0.0,
  },

  rapids: {
    main: [
      { x: -108, z: -376, bed: 42.5, width: 16 },
      { x: -64,  z: -312, bed: 38.2, width: 24 },
      { x: -18,  z: -248, bed: 33.4, width: 13 }, // Верхний каньон (створ №1)
      { x: 6,    z: -182, bed: 28.0, width: 25 }, // Межкаскадный бьеф
      { x: 22,   z: -98,  bed: 22.0, width: 14 }, // Нижние Пороги (створ №2)
      { x: 118,  z: -22,  bed: 17.8, width: 20 },
      { x: 128,  z: 58,   bed: 15.6, width: 21 },
      { x: 52,   z: 132,  bed: 11.4, width: 23 },
      { x: -38,  z: 208,  bed: 8.1,  width: 26 },
      { x: -10,  z: 302,  bed: 6.0,  width: 30 },
      { x: 16,   z: 384,  bed: 4.3,  width: 34 },
    ],
    eastCreek: [
      { x: 168, z: -374, bed: 46.0, width: 11 },
      { x: 96,  z: -316, bed: 40.5, width: 13 },
      { x: -12, z: -268, bed: 35.0, width: 15 },
    ],
    westCreek: [
      { x: -374, z: 74,  bed: 30.0, width: 10 },
      { x: -220, z: 120, bed: 19.5, width: 12 },
      { x: -38,  z: 204, bed: 8.2,  width: 14 },
    ],
    gorges: [
      { x: -18, z: -248, spanZ: 44, strength: 27.0 },
      { x: 22,  z: -98,  spanZ: 42, strength: 23.5 },
    ],
    seedOffset: 37.4,
    widthScale: 0.96,
    soilBonus: -0.5,
  },

  delta: {
    main: [
      { x: -78, z: -376, bed: 30.2, width: 22 },
      { x: -36, z: -292, bed: 27.6, width: 28 },
      { x: 8,   z: -152, bed: 22.8, width: 19 }, // Широкий пойменный створ
      { x: 28,  z: -96,  bed: 19.8, width: 25 },
      { x: 112, z: -34,  bed: 17.5, width: 27 },
      { x: 132, z: 42,   bed: 15.8, width: 28 },
      { x: 76,  z: 118,  bed: 12.8, width: 29 },
      { x: -8,  z: 146,  bed: 10.2, width: 31 },
      { x: -44, z: 224,  bed: 7.8,  width: 34 },
      { x: -8,  z: 312,  bed: 5.9,  width: 38 },
      { x: 14,  z: 384,  bed: 4.3,  width: 44 },
    ],
    eastCreek: [
      { x: 158, z: -374, bed: 34.5, width: 13 },
      { x: 84,  z: -296, bed: 29.8, width: 15 },
      { x: -8,  z: -232, bed: 25.6, width: 17 },
    ],
    westCreek: [
      { x: -374, z: 82,  bed: 24.0, width: 12 },
      { x: -212, z: 144, bed: 14.5, width: 14 },
      { x: -44,  z: 218, bed: 8.0,  width: 17 },
    ],
    gorges: [
      { x: 8, z: -152, spanZ: 52, strength: 17.0 },
    ],
    seedOffset: 91.2,
    widthScale: 1.24,
    soilBonus: 2.2,
  },
};

export const MAIN_RIVER_PATH = VALLEY_RIVERS.bystritsa.main;
export const CREEK_PATH = VALLEY_RIVERS.bystritsa.eastCreek;

/** Возвращает трассы рек и каньонов, переведённые в реальные мировые метры (0.8 / 5 / 10 км) */
export function getScaledValleyRivers(presetId = 'bystritsa') {
  const cfg = VALLEY_RIVERS[presetId] || VALLEY_RIVERS.bystritsa;
  const hS = WORLD.horizScale;
  const eS = WORLD.elevScale;
  const mapPt = (p) => ({
    x: p.x * hS,
    z: p.z * hS,
    bed: p.bed * eS,
    width: p.width * hS * cfg.widthScale,
  });
  return {
    main: cfg.main.map(mapPt),
    eastCreek: cfg.eastCreek.map(mapPt),
    westCreek: cfg.westCreek.map(mapPt),
    gorges: cfg.gorges.map((g) => ({
      x: g.x * hS,
      z: g.z * hS,
      spanZ: g.spanZ * hS,
      strength: g.strength * eS,
    })),
  };
}

/**
 * Заполняет рельеф (bedrock, soil) и живые реки (h, hu, hv) для выбранного сценария и масштаба (0.8 / 5 / 10 км).
 * Поддерживает чанковую предзагрузку строк [zStart..zEnd).
 */
export function buildValleyTerrain(grid, arrays, presetId = 'bystritsa', zStart = 0, zEnd = grid) {
  const cfg = VALLEY_RIVERS[presetId] || VALLEY_RIVERS.bystritsa;
  const { bedrock, soil, concrete, h, hu, hv, wetness } = arrays;
  const half = WORLD.size * 0.5;
  const dx = WORLD.size / grid;
  const hS = WORLD.horizScale;
  const eS = WORLD.elevScale;
  const seed = cfg.seedOffset;
  const depthScale = Math.pow(eS, 0.72);
  const velScale = Math.pow(eS, 0.35);

  const gz0 = clamp(zStart, 0, grid);
  const gz1 = clamp(zEnd, 0, grid);

  for (let gz = gz0; gz < gz1; gz++) {
    const wz = -half + (gz + 0.5) * dx;
    const bz = wz / hS; // каноническая координата [-384..+384]
    const northSouthSlope = clamp((384 - bz) / 768, 0, 1);

    for (let gx = 0; gx < grid; gx++) {
      const wx = -half + (gx + 0.5) * dx;
      const bx = wx / hS;
      const idx = gz * grid + gx;

      // 1. Альпийские крылья бассейна, северные ледниковые хребты и вторичный рельеф крупных карт (5/10 км)
      const edgeX = Math.abs(bx) / 384;
      const mountainWings = Math.pow(clamp((edgeX - 0.52) / 0.48, 0, 1), 1.78) * 42.0;
      const northRange = smoothstep(-140, -380, bz) * (20.0 + 25.0 * ridged2D(bx * 0.009 + 3.1 + seed, bz * 0.009 - 1.7, 4));
      const rolling = fbm2D(bx * 0.0052 + 11.3 + seed, bz * 0.0052 + 4.7, 5) * 8.6;
      const detail = fbm2D(bx * 0.021 - 5.2 + seed, bz * 0.021 + 8.9, 3) * 1.9;
      // Дополнительные отроги и распадки на больших картах 5×5 км и 10×10 км
      const macroSpurs = hS > 1.5
        ? ridged2D(wx * 0.0011 + seed, wz * 0.0011 - 4.2, 3) * 6.5 * smoothstep(0.35, 0.92, edgeX)
        : 0;

      let baseElev = 12.0 + northSouthSlope * (presetId === 'rapids' ? 28.0 : (presetId === 'delta' ? 18.5 : 23.8))
        + mountainWings + northRange + rolling + detail + macroSpurs;

      // 2. Скальные щёки каньонов под плотины и контрфорсы
      let inGorgeRock = false;
      for (let gIdx = 0; gIdx < cfg.gorges.length; gIdx++) {
        const gg = cfg.gorges[gIdx];
        const gorgeDz = (bz - gg.z) / gg.spanZ;
        if (Math.abs(gorgeDz) < 1.35) {
          const gorgeBelt = Math.exp(-gorgeDz * gorgeDz * 1.9);
          const sideDist = Math.abs(bx - gg.x);
          const jaw = smoothstep(12, 48, sideDist) * (1.0 - smoothstep(78, 152, sideDist));
          baseElev += gorgeBelt * jaw * gg.strength;
          if (Math.abs(bz - gg.z) < gg.spanZ * 0.9 && sideDist < 58) {
            inGorgeRock = true;
          }
        }
      }

      // 3. Широкое деривационное плато («Подкова»)
      const neckMaskX = 1.0 - smoothstep(18, 52, Math.abs(bx - (-16)));
      const neckMaskZ = smoothstep(-118, -84, bz) * (1.0 - smoothstep(82, 118, bz));
      const neckMask = neckMaskX * neckMaskZ;
      if (neckMask > 0.001) {
        const neckTarget = lerp(23.8, 16.4, clamp((bz - (-98)) / 205, 0, 1));
        baseElev = lerp(baseElev, neckTarget, neckMask * 0.80);
      }

      let elev = baseElev * eS;

      // 4. Ровные террасы под все 8 саморастущих городов и промгигантов
      let cityFlatten = 0;
      for (let c = 0; c < CITY_DEFS.length; c++) {
        const cd = CITY_DEFS[c];
        const dCity = Math.hypot(wx - cd.x, wz - cd.z);
        const flat = 1.0 - smoothstep(cd.plateauRadius * 0.68, cd.plateauRadius * 1.26, dCity);
        if (flat > 0.001) {
          elev = lerp(elev, cd.baseElevation, flat * 0.95);
          cityFlatten = Math.max(cityFlatten, flat);
        }
      }

      // 5. Оросительная приёмная чаша возле Агродолины
      const dIrr = Math.hypot(bx - 168, bz - 98);
      if (dIrr < 40) {
        const irrMask = 1.0 - smoothstep(14, 40, dIrr);
        elev = lerp(elev, 14.2 * eS, irrMask * 0.90);
      }

      // 6. Прорезаем 3 водные артерии в каноническом профиле и переводим в метры масштаба
      const mainR = samplePolyline(bx, bz, cfg.main);
      const eastR = samplePolyline(bx, bz, cfg.eastCreek);
      const westR = samplePolyline(bx, bz, cfg.westCreek);

      let waterDepth = 0;
      let initU = 0;
      let initV = 0;
      let inChannel = 0;

      // Главное судоходное русло
      const halfW = mainR.width * 0.5 * cfg.widthScale;
      if (mainR.dist < halfW * 3.6) {
        const bankBlend = 1.0 - smoothstep(halfW * 0.82, halfW * 3.4, mainR.dist);
        const channelProfile = clamp(mainR.dist / halfW, 0, 1);
        const channelBed = (mainR.bed + Math.pow(channelProfile, 2.2) * 2.6) * eS;
        elev = lerp(elev, Math.min(elev, channelBed + (1.0 - bankBlend) * 5.2 * eS), bankBlend);
        if (mainR.dist < halfW * 1.12) {
          elev = Math.min(elev, (mainR.bed + Math.pow(mainR.dist / (halfW * 1.12), 2.4) * 2.15) * eS);
          const targetSurface = mainR.bed * eS + 2.15 * depthScale;
          if (targetSurface > elev + 0.05) {
            waterDepth = targetSurface - elev;
            const speed = 2.25 * velScale;
            initU = mainR.tx * speed;
            initV = mainR.tz * speed;
            inChannel = 1;
          }
        }
      }

      // Восточный ледниковый приток «Серебрянка»
      const eHalf = eastR.width * 0.5 * cfg.widthScale;
      if (eastR.dist < eHalf * 3.2 && bz < -228) {
        const bankBlend = 1.0 - smoothstep(eHalf * 0.8, eHalf * 3.0, eastR.dist);
        const cBed = (eastR.bed + Math.pow(clamp(eastR.dist / eHalf, 0, 1), 2.1) * 1.9) * eS;
        elev = lerp(elev, Math.min(elev, cBed + (1.0 - bankBlend) * 4.2 * eS), bankBlend);
        if (eastR.dist < eHalf * 1.10) {
          elev = Math.min(elev, (eastR.bed + Math.pow(eastR.dist / (eHalf * 1.10), 2.2) * 1.6) * eS);
          const targetSurface = eastR.bed * eS + 1.38 * depthScale;
          if (targetSurface > elev + 0.05 && targetSurface - elev > waterDepth) {
            waterDepth = targetSurface - elev;
            const speed = 2.35 * velScale;
            initU = eastR.tx * speed;
            initV = eastR.tz * speed;
            inChannel = 1;
          }
        }
      }

      // Западный горный ручей «Гремучий»
      const wHalf = westR.width * 0.5 * cfg.widthScale;
      if (westR.dist < wHalf * 3.1 && bx < -32 && bz > 42 && bz < 228) {
        const bankBlend = 1.0 - smoothstep(wHalf * 0.8, wHalf * 2.9, westR.dist);
        const wBed = (westR.bed + Math.pow(clamp(westR.dist / wHalf, 0, 1), 2.1) * 1.8) * eS;
        elev = lerp(elev, Math.min(elev, wBed + (1.0 - bankBlend) * 3.8 * eS), bankBlend);
        if (westR.dist < wHalf * 1.10) {
          elev = Math.min(elev, (westR.bed + Math.pow(westR.dist / (wHalf * 1.10), 2.2) * 1.5) * eS);
          const targetSurface = westR.bed * eS + 1.20 * depthScale;
          if (targetSurface > elev + 0.05 && targetSurface - elev > waterDepth) {
            waterDepth = targetSurface - elev;
            const speed = 2.1 * velScale;
            initU = westR.tx * speed;
            initV = westR.tz * speed;
            inChannel = 1;
          }
        }
      }

      // 6b. Плавный береговой спуск южного морского побережья и дельты к внешнему морю
      // (северные и западные горные массивы истоков сохраняют скальную высоту под ледники и гроты!)
      if (!inChannel) {
        const isHeadwaterMassif = (bz < -250) || (bx < -265 && bz > 20 && bz < 128);
        if (!isHeadwaterMassif) {
          const southCoast = smoothstep(344, 383.2, bz);
          const sideSeaFlank = smoothstep(140, 320, bz) * smoothstep(352, 383.2, Math.abs(bx));
          const coastBlend = Math.max(southCoast, sideSeaFlank);
          if (coastBlend > 0.001) {
            elev = lerp(elev, 2.75 * eS, coastBlend * 0.94);
          }
        } else {
          // Скальный амфитеатр у истоков рек (возвышение портала грота)
          const portalLift = smoothstep(345, 382, Math.max(Math.abs(bx), -bz)) * 9.5 * eS;
          elev += portalLift;
        }
      }

      // 7. Геологическая стратиграфия: скальный массив (bedrock) и рыхлый грунт (soil)
      let soilThick = (2.7 + cfg.soilBonus + neckMask * 4.0 + cityFlatten * 1.6 - smoothstep(34 * eS, 58 * eS, elev) * 2.2) * Math.pow(eS, 0.65);
      if (inGorgeRock) {
        soilThick = Math.min(soilThick, 0.45 * eS);
      }
      if (inChannel) {
        soilThick = clamp(soilThick * 0.36, 0.35, 1.8 * eS);
      }
      soilThick = clamp(soilThick, 0.15, 14.0 * eS);

      bedrock[idx] = Math.max(0.5, elev - soilThick);
      soil[idx] = soilThick;
      concrete[idx] = 0;

      h[idx] = waterDepth;
      hu[idx] = waterDepth * initU;
      hv[idx] = waterDepth * initV;
      wetness[idx] = waterDepth > 0.02 ? 1.0 : 0.0;
    }
  }

  // 8. При завершении генерации карты — гидрологическая расчистка тальвегов (устранение диагональных ступенек и микро-ям застоя!)
  if (gz1 >= grid) {
    conditionHydrologicalDrainage(grid, arrays, presetId);
  }
}

/**
 * Возвращает точные мировые координаты и параметры 3 видимых природных истоков рек
 * (ледниковые гроты, скальные водопады питания и чаши истоков), откуда рождается вода!
 */
export function getValleyHeadwaterSources(presetId = 'bystritsa') {
  const cfg = VALLEY_RIVERS[presetId] || VALLEY_RIVERS.bystritsa;
  const hS = WORLD.horizScale;
  const eS = WORLD.elevScale;
  const depthScale = Math.pow(eS, 0.72);

  const makeSource = (poly, meta) => {
    const p0 = poly[0];
    const p1 = poly[1] || poly[0];
    const dirX = p1.x - p0.x;
    const dirZ = p1.z - p0.z;
    const len = Math.hypot(dirX, dirZ) || 1;
    const tx = dirX / len;
    const tz = dirZ / len;
    // Смещаем точку излива чуть внутрь карты (чтобы грот и водопад были отлично видны и не резались краем сетки)
    const insetCanon = meta.insetCanon || 12.0;
    const outX = (p0.x + tx * insetCanon) * hS;
    const outZ = (p0.z + tz * insetCanon) * hS;
    const portalX = (p0.x - tx * 4.5) * hS;
    const portalZ = (p0.z - tz * 4.5) * hS;
    const bedY = p0.bed * eS;
    const poolSurfaceY = bedY + meta.poolDepth * depthScale;
    const dropHeight = meta.dropBase * eS;
    return {
      id: meta.id,
      name: meta.name,
      kind: meta.kind, // 'glacier' | 'alpine_spring' | 'cliff_grotto'
      x: portalX,
      z: portalZ,
      outX,
      outZ,
      tx,
      tz,
      yaw: Math.atan2(tx, tz),
      bedY,
      poolSurfaceY,
      crestY: poolSurfaceY + dropHeight,
      dropHeight,
      width: p0.width * cfg.widthScale * hS * meta.widthFactor,
      riverWidth: p0.width * cfg.widthScale * hS,
      flowShare: meta.flowShare,
    };
  };

  return [
    makeSource(cfg.main, {
      id: 'main_glacier',
      name: 'Ледниковый грот «Белый Ледник» (исток р. Большая Быстрица)',
      kind: 'glacier',
      insetCanon: 13.5,
      poolDepth: 2.25,
      dropBase: 9.5,
      widthFactor: 0.78,
      flowShare: 1.0,
    }),
    makeSource(cfg.eastCreek, {
      id: 'east_glacier',
      name: 'Альпийский каскад «Серебряный Ключ» (исток р. Серебрянка)',
      kind: 'alpine_spring',
      insetCanon: 13.0,
      poolDepth: 1.50,
      dropBase: 8.2,
      widthFactor: 0.82,
      flowShare: 0.45,
    }),
    makeSource(cfg.westCreek, {
      id: 'west_grotto',
      name: 'Скальный источник «Гремучая Теснина» (исток руч. Гремучий)',
      kind: 'cliff_grotto',
      insetCanon: 13.0,
      poolDepth: 1.35,
      dropBase: 7.4,
      widthFactor: 0.85,
      flowShare: 0.35,
    }),
  ];
}

/**
 * Монотонная 4-связная расчистка русел всех 3 рек и вскрытие бессточных микро-ям рельефа:
 * гарантирует, что вода не запирается на диагональных ступеньках сетки и всегда идёт вниз по течению!
 */
export function conditionHydrologicalDrainage(grid, arrays, presetId = 'bystritsa') {
  const cfg = VALLEY_RIVERS[presetId] || VALLEY_RIVERS.bystritsa;
  const g = grid;
  const dx = WORLD.size / g;
  const half = WORLD.size * 0.5;
  const hS = WORLD.horizScale;
  const eS = WORLD.elevScale;
  const depthScale = Math.pow(eS, 0.72);
  const velScale = Math.pow(eS, 0.34);
  const { bedrock, soil, h, hu, hv, wetness } = arrays;

  const carve4ConnectedThalweg = (poly, initDepthBase, speedBase) => {
    let prevGx = -1;
    let prevGz = -1;
    let runningMaxBed = Infinity;
    const minDropPerStep = 0.012 * eS;

    for (let s = 0; s < poly.length - 1; s++) {
      const a = poly[s];
      const b = poly[s + 1];
      const segDx = (b.x - a.x) * hS;
      const segDz = (b.z - a.z) * hS;
      const segLen = Math.hypot(segDx, segDz) || 1;
      const tx = segDx / segLen;
      const tz = segDz / segLen;
      const steps = Math.max(4, Math.ceil(segLen / (dx * 0.38)));

      for (let k = 0; k <= steps; k++) {
        const t = k / steps;
        const wx = lerp(a.x, b.x, t) * hS;
        const wz = lerp(a.z, b.z, t) * hS;
        const gx = clamp(Math.floor((wx + half) / dx), 1, g - 2);
        const gz = clamp(Math.floor((wz + half) / dx), 1, g - 2);
        const targetBed = lerp(a.bed, b.bed, t) * eS;

        // Если шаг по сетке диагональный, открываем промежуточную ортогональную клетку (4-связность без застоя!)
        const visitCells = [];
        if (prevGx >= 0 && gx !== prevGx && gz !== prevGz) {
          const bridgeGx = gx;
          const bridgeGz = prevGz;
          visitCells.push([bridgeGx, bridgeGz]);
        }
        if (gx !== prevGx || gz !== prevGz) {
          visitCells.push([gx, gz]);
          prevGx = gx;
          prevGz = gz;
        }

        for (let c = 0; c < visitCells.length; c++) {
          const [cx, cz] = visitCells[c];
          runningMaxBed = Math.min(runningMaxBed - minDropPerStep, targetBed + 0.12 * eS);
          // Расчищаем сам тальвег и его ближайших соседей в русле
          for (let oz = -1; oz <= 1; oz++) {
            for (let ox = -1; ox <= 1; ox++) {
              if (Math.abs(ox) + Math.abs(oz) > 1) continue;
              const nx = clamp(cx + ox, 1, g - 2);
              const nz = clamp(cz + oz, 1, g - 2);
              const nIdx = nz * g + nx;
              const sideLift = (ox === 0 && oz === 0) ? 0 : 0.24 * eS;
              const capBed = runningMaxBed + sideLift;
              const curBed = bedrock[nIdx] + soil[nIdx];
              if (curBed > capBed) {
                const delta = curBed - capBed;
                const sCut = Math.min(soil[nIdx] * 0.75, delta);
                soil[nIdx] -= sCut;
                bedrock[nIdx] = Math.max(0.4, bedrock[nIdx] - (delta - sCut));
              }
              const newBed = bedrock[nIdx] + soil[nIdx];
              const desiredDepth = initDepthBase * depthScale * ((ox === 0 && oz === 0) ? 1.0 : 0.78);
              if (h[nIdx] < desiredDepth) {
                h[nIdx] = desiredDepth;
                const spd = speedBase * velScale;
                hu[nIdx] = h[nIdx] * tx * spd;
                hv[nIdx] = h[nIdx] * tz * spd;
                wetness[nIdx] = 1.0;
              }
              void newBed;
            }
          }
        }
      }
    }
  };

  // Прочищаем все 3 реки от истока до слияния/моря
  carve4ConnectedThalweg(cfg.eastCreek, 1.38, 2.35);
  carve4ConnectedThalweg(cfg.westCreek, 1.22, 2.15);
  carve4ConnectedThalweg(cfg.main, 2.15, 2.30);

  // Мягкое вскрытие одиночных бессточных микро-лунок на склонах (чтобы дождевая вода стекала в реки, а не стояла лужами)
  for (let pass = 0; pass < 2; pass++) {
    for (let gz = 2; gz < g - 2; gz++) {
      const row = gz * g;
      for (let gx = 2; gx < g - 2; gx++) {
        const i = row + gx;
        if (h[i] > 0.25) continue; // не трогаем сами русла рек
        const zc = bedrock[i] + soil[i];
        const zL = bedrock[i - 1] + soil[i - 1];
        const zR = bedrock[i + 1] + soil[i + 1];
        const zU = bedrock[i - g] + soil[i - g];
        const zD = bedrock[i + g] + soil[i + g];
        const minNb = Math.min(zL, zR, zU, zD);
        if (zc < minNb - 0.02) {
          // Поднимаем дно случайной замкнутой микро-ямки до уровня низшего соседа + микроуклон
          soil[i] += (minNb - zc) + 0.03 * eS;
        }
      }
    }
  }
}
