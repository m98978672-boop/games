// ============================================================================
//  ГЕНЕРАТОР РЕЧНОЙ ДОЛИНЫ 768×768 м (3 сценария карт: «Большая Быстрица»,
//  «Северные Пороги», «Зеркальная Дельта» + поддержка чанковой предзагрузки)
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
      { x: 16,  z: -112, bed: 21.6, width: 17 }, // Нижний выход из теснины
      { x: 96,  z: -56,  bed: 19.0, width: 21 }, // Вход в излучину «Большая Подкова»
      { x: 134, z: 32,   bed: 16.4, width: 22 }, // Восточный плёс (удобен для канала в Агродолину!)
      { x: 88,  z: 108,  bed: 13.6, width: 23 },
      { x: 4,   z: 122,  bed: 10.8, width: 22 }, // Замыкание «Подковы» (перепад ~11 м с полкой!)
      { x: -46, z: 198,  bed: 8.4,  width: 25 }, // Слияние с ручьём Гремучим у Посада
      { x: -26, z: 294,  bed: 6.3,  width: 29 },
      { x: 12,  z: 384,  bed: 4.4,  width: 34 }, // Южное устье
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
      { x: 12, z: -158, spanZ: 48, strength: 24.5 },
    ],
    seedOffset: 0,
    widthScale: 1.0,
    soilBonus: 0.0,
  },

  rapids: {
    main: [
      { x: -108, z: -376, bed: 42.5, width: 16 },
      { x: -64,  z: -312, bed: 38.2, width: 24 },
      { x: -18,  z: -248, bed: 33.4, width: 13 }, // Верхний каньон (створ №1!)
      { x: 6,    z: -182, bed: 28.0, width: 25 }, // Межкаскадный бьеф
      { x: 22,   z: -98,  bed: 22.0, width: 14 }, // Нижние Пороги (створ №2!)
      { x: 118,  z: -22,  bed: 17.8, width: 20 },
      { x: 128,  z: 58,   bed: 15.6, width: 21 },
      { x: 52,   z: 132,  bed: 11.4, width: 22 },
      { x: -38,  z: 208,  bed: 8.1,  width: 25 },
      { x: -14,  z: 302,  bed: 6.0,  width: 28 },
      { x: 16,   z: 384,  bed: 4.3,  width: 32 },
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
      { x: -18, z: -248, spanZ: 44, strength: 26.5 },
      { x: 22,  z: -98,  spanZ: 42, strength: 23.0 },
    ],
    seedOffset: 37.4,
    widthScale: 0.95,
    soilBonus: -0.5,
  },

  delta: {
    main: [
      { x: -78, z: -376, bed: 30.2, width: 22 },
      { x: -36, z: -292, bed: 27.6, width: 28 },
      { x: 8,   z: -152, bed: 22.8, width: 19 }, // Широкий пойменный створ
      { x: 28,  z: -96,  bed: 19.8, width: 24 },
      { x: 112, z: -34,  bed: 17.5, width: 26 },
      { x: 132, z: 42,   bed: 15.8, width: 27 },
      { x: 76,  z: 118,  bed: 12.8, width: 28 },
      { x: -8,  z: 146,  bed: 10.2, width: 29 },
      { x: -44, z: 224,  bed: 7.8,  width: 32 },
      { x: -12, z: 312,  bed: 5.9,  width: 36 },
      { x: 14,  z: 384,  bed: 4.3,  width: 40 },
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
      { x: 8, z: -152, spanZ: 52, strength: 16.5 },
    ],
    seedOffset: 91.2,
    widthScale: 1.22,
    soilBonus: 2.1,
  },
};

export const MAIN_RIVER_PATH = VALLEY_RIVERS.bystritsa.main;
export const CREEK_PATH = VALLEY_RIVERS.bystritsa.eastCreek;

/**
 * Заполняет рельеф (bedrock, soil) и живые реки (h, hu, hv) для выбранного сценария.
 * Поддерживает поэтапную генерацию строк [zStart..zEnd) для плавного прогресс-бара предзагрузки!
 */
export function buildValleyTerrain(grid, arrays, presetId = 'bystritsa', zStart = 0, zEnd = grid) {
  const cfg = VALLEY_RIVERS[presetId] || VALLEY_RIVERS.bystritsa;
  const { bedrock, soil, concrete, h, hu, hv, wetness } = arrays;
  const half = WORLD.size * 0.5;
  const dx = WORLD.size / grid;
  const seed = cfg.seedOffset;

  const gz0 = clamp(zStart, 0, grid);
  const gz1 = clamp(zEnd, 0, grid);

  for (let gz = gz0; gz < gz1; gz++) {
    const wz = -half + (gz + 0.5) * dx;
    const northSouthSlope = clamp((half - wz) / WORLD.size, 0, 1);

    for (let gx = 0; gx < grid; gx++) {
      const wx = -half + (gx + 0.5) * dx;
      const idx = gz * grid + gx;

      // 1. Горные крылья расширенной долины 768×768 м и северный хребет
      const edgeX = Math.abs(wx) / half;
      const mountainWings = Math.pow(clamp((edgeX - 0.54) / 0.46, 0, 1), 1.82) * 38.0;
      const northRange = smoothstep(-150, -378, wz) * (18.0 + 21.0 * ridged2D(wx * 0.009 + 3.1 + seed, wz * 0.009 - 1.7, 4));
      const rolling = fbm2D(wx * 0.0052 + 11.3 + seed, wz * 0.0052 + 4.7, 5) * 8.4;
      const detail = fbm2D(wx * 0.021 - 5.2 + seed, wz * 0.021 + 8.9, 3) * 1.85;

      let elev = 12.0 + northSouthSlope * (presetId === 'rapids' ? 27.5 : (presetId === 'delta' ? 18.5 : 23.5))
        + mountainWings + northRange + rolling + detail;

      // 2. Скальные щёки каньонов (идеальные опоры под бетонную плотину и контрфорсы!)
      let inGorgeRock = false;
      for (let gIdx = 0; gIdx < cfg.gorges.length; gIdx++) {
        const gg = cfg.gorges[gIdx];
        const gorgeDz = (wz - gg.z) / gg.spanZ;
        if (Math.abs(gorgeDz) < 1.35) {
          const gorgeBelt = Math.exp(-gorgeDz * gorgeDz * 1.9);
          const sideDist = Math.abs(wx - gg.x);
          const jaw = smoothstep(12, 48, sideDist) * (1.0 - smoothstep(78, 152, sideDist));
          elev += gorgeBelt * jaw * gg.strength;
          if (Math.abs(wz - gg.z) < gg.spanZ * 0.9 && sideDist < 58) {
            inGorgeRock = true;
          }
        }
      }

      // 3. Широкое деривационное плато (перешеек излучины x ∈ [-52..24], z ∈ [-112..114])
      const neckMaskX = 1.0 - smoothstep(18, 52, Math.abs(wx - (-16)));
      const neckMaskZ = smoothstep(-118, -84, wz) * (1.0 - smoothstep(82, 118, wz));
      const neckMask = neckMaskX * neckMaskZ;
      if (neckMask > 0.001) {
        const neckTarget = lerp(23.8, 16.4, clamp((wz - (-98)) / 205, 0, 1));
        elev = lerp(elev, neckTarget, neckMask * 0.80);
      }

      // 4. Ровные террасы под 5 саморазвивающихся городов
      let cityFlatten = 0;
      for (let c = 0; c < CITY_DEFS.length; c++) {
        const cd = CITY_DEFS[c];
        const dCity = Math.hypot(wx - cd.x, wz - cd.z);
        const flat = 1.0 - smoothstep(cd.plateauRadius * 0.68, cd.plateauRadius * 1.28, dCity);
        if (flat > 0.001) {
          elev = lerp(elev, cd.baseElevation, flat * 0.95);
          cityFlatten = Math.max(cityFlatten, flat);
        }
      }

      // 5. Оросительная приёмная чаша возле Агродолины (168, 98) на отметке 14.2 м
      const dIrr = Math.hypot(wx - 168, wz - 98);
      if (dIrr < 40) {
        const irrMask = 1.0 - smoothstep(14, 40, dIrr);
        elev = lerp(elev, 14.2, irrMask * 0.90);
      }

      // 6. Прорезаем 3 водные артерии: главная река «Быстрица» + «Серебрянка» + «Гремучий»
      const mainR = samplePolyline(wx, wz, cfg.main);
      const eastR = samplePolyline(wx, wz, cfg.eastCreek);
      const westR = samplePolyline(wx, wz, cfg.westCreek);

      let waterDepth = 0;
      let initU = 0;
      let initV = 0;
      let inChannel = 0;

      // Главное русло
      const halfW = mainR.width * 0.5 * cfg.widthScale;
      if (mainR.dist < halfW * 3.6) {
        const bankBlend = 1.0 - smoothstep(halfW * 0.82, halfW * 3.4, mainR.dist);
        const channelProfile = clamp(mainR.dist / halfW, 0, 1);
        const channelBed = mainR.bed + Math.pow(channelProfile, 2.2) * 2.6;
        elev = lerp(elev, Math.min(elev, channelBed + (1.0 - bankBlend) * 5.2), bankBlend);
        if (mainR.dist < halfW * 1.08) {
          elev = Math.min(elev, mainR.bed + Math.pow(mainR.dist / (halfW * 1.08), 2.4) * 2.15);
          const targetSurface = mainR.bed + 2.05;
          if (targetSurface > elev + 0.05) {
            waterDepth = targetSurface - elev;
            const speed = 2.25;
            initU = mainR.tx * speed;
            initV = mainR.tz * speed;
            inChannel = 1;
          }
        }
      }

      // Восточный ледниковый приток «Серебрянка»
      const eHalf = eastR.width * 0.5 * cfg.widthScale;
      if (eastR.dist < eHalf * 3.2 && wz < -228) {
        const bankBlend = 1.0 - smoothstep(eHalf * 0.8, eHalf * 3.0, eastR.dist);
        const cBed = eastR.bed + Math.pow(clamp(eastR.dist / eHalf, 0, 1), 2.1) * 1.9;
        elev = lerp(elev, Math.min(elev, cBed + (1.0 - bankBlend) * 4.2), bankBlend);
        if (eastR.dist < eHalf * 1.06) {
          elev = Math.min(elev, eastR.bed + Math.pow(eastR.dist / (eHalf * 1.06), 2.2) * 1.6);
          const targetSurface = eastR.bed + 1.32;
          if (targetSurface > elev + 0.05 && targetSurface - elev > waterDepth) {
            waterDepth = targetSurface - elev;
            initU = eastR.tx * 2.35;
            initV = eastR.tz * 2.35;
            inChannel = 1;
          }
        }
      }

      // Западный горный ручей «Гремучий»
      const wHalf = westR.width * 0.5 * cfg.widthScale;
      if (westR.dist < wHalf * 3.1 && wx < -32 && wz > 42 && wz < 228) {
        const bankBlend = 1.0 - smoothstep(wHalf * 0.8, wHalf * 2.9, westR.dist);
        const wBed = westR.bed + Math.pow(clamp(westR.dist / wHalf, 0, 1), 2.1) * 1.8;
        elev = lerp(elev, Math.min(elev, wBed + (1.0 - bankBlend) * 3.8), bankBlend);
        if (westR.dist < wHalf * 1.05) {
          elev = Math.min(elev, westR.bed + Math.pow(westR.dist / (wHalf * 1.05), 2.2) * 1.5);
          const targetSurface = westR.bed + 1.15;
          if (targetSurface > elev + 0.05 && targetSurface - elev > waterDepth) {
            waterDepth = targetSurface - elev;
            initU = westR.tx * 2.1;
            initV = westR.tz * 2.1;
            inChannel = 1;
          }
        }
      }

      // 7. Геологическая стратиграфия: скальный массив (bedrock) и рыхлый грунт (soil)
      let soilThick = 2.7 + cfg.soilBonus + neckMask * 4.0 + cityFlatten * 1.5 - smoothstep(34, 58, elev) * 2.2;
      if (inGorgeRock) {
        soilThick = Math.min(soilThick, 0.42);
      }
      if (inChannel) {
        soilThick = clamp(soilThick * 0.36, 0.35, 1.5);
      }
      soilThick = clamp(soilThick, 0.15, 8.5);

      bedrock[idx] = Math.max(0.5, elev - soilThick);
      soil[idx] = soilThick;
      concrete[idx] = 0;

      h[idx] = waterDepth;
      hu[idx] = waterDepth * initU;
      hv[idx] = waterDepth * initV;
      wetness[idx] = waterDepth > 0.02 ? 1.0 : 0.0;
    }
  }
}
