// ============================================================================
//  Генератор речной долины «Быстрица»: каньон, излучина «Подкова», полка под
//  деривационный канал, устье, горный приток и террасы растущих городов
// ============================================================================

import { WORLD, CITY_DEFS } from './config.js';
import { clamp, smoothstep, lerp, fbm2D, ridged2D, samplePolyline } from './noise.js';

export const MAIN_RIVER_PATH = [
  { x: -68, z: -282, bed: 31.8, width: 15 },
  { x: -42, z: -242, bed: 29.6, width: 19 },
  { x: -16, z: -202, bed: 27.6, width: 25 }, // Верхняя чаша водохранилища
  { x: 4,   z: -164, bed: 25.8, width: 20 },
  { x: 10,  z: -132, bed: 23.8, width: 13 }, // Теснина «Ворота Грома» (идеальный створ плотины!)
  { x: 12,  z: -96,  bed: 20.8, width: 15 }, // Нижний выход из теснины
  { x: 76,  z: -50,  bed: 18.6, width: 19 }, // Вход в излучину «Подкова»
  { x: 104, z: 20,   bed: 16.3, width: 20 }, // Ближний створ для оросительного канала Агродолины
  { x: 68,  z: 84,   bed: 13.6, width: 21 },
  { x: 2,   z: 92,   bed: 10.6, width: 20 }, // Замыкание «Подковы» (перепад ~10.2 м с шеей!)
  { x: -38, z: 154,  bed: 8.3,  width: 23 }, // Плёс у Речного Посада
  { x: -20, z: 226,  bed: 6.4,  width: 26 },
  { x: 8,   z: 288,  bed: 4.5,  width: 30 }, // Южное устье (открытый сток)
];

export const CREEK_PATH = [
  { x: 112, z: -280, bed: 36.5, width: 10 },
  { x: 74,  z: -244, bed: 33.2, width: 11 },
  { x: 30,  z: -216, bed: 29.8, width: 12 },
  { x: -12, z: -198, bed: 27.5, width: 14 }, // Впадает в верхнюю чашу
];

export const LANDMARKS = [
  { name: 'Теснина «Ворота Грома»', x: 10, z: -126, hint: 'Лучший створ для плотины' },
  { name: 'Деривационная полка', x: -14, z: -6, hint: 'Срежьте излучину каналом!' },
  { name: 'Оросительный бассейн', x: 128, z: 76, hint: 'Подведите канал воде Агродолины' },
];

/**
 * Заполняет массивы рельефа (bedrock, soil) и начальную живую реку (h, hu, hv)
 */
export function buildValleyTerrain(grid, arrays) {
  const { bedrock, soil, concrete, h, hu, hv, wetness } = arrays;
  const half = WORLD.size * 0.5;
  const dx = WORLD.size / grid;

  for (let gz = 0; gz < grid; gz++) {
    const wz = -half + (gz + 0.5) * dx;
    const northSouthSlope = clamp((288 - wz) / 576, 0, 1); // 1 на севере, 0 на юге

    for (let gx = 0; gx < grid; gx++) {
      const wx = -half + (gx + 0.5) * dx;
      const idx = gz * grid + gx;

      // 1. Базовый профиль горной долины
      const edgeX = Math.abs(wx) / half;
      const mountainWings = Math.pow(clamp((edgeX - 0.52) / 0.48, 0, 1), 1.85) * 32.0;
      const northRange = smoothstep(-130, -285, wz) * (16.0 + 18.0 * ridged2D(wx * 0.011 + 3.1, wz * 0.011 - 1.7, 4));
      const rolling = fbm2D(wx * 0.0065 + 11.3, wz * 0.0065 + 4.7, 5) * 7.5;
      const detail = fbm2D(wx * 0.024 - 5.2, wz * 0.024 + 8.9, 3) * 1.65;

      let elev = 12.0 + northSouthSlope * 21.0 + mountainWings + northRange + rolling + detail;

      // 2. Скальные щёки теснины «Ворота Грома» вокруг (10, -126) — узкое каменное горло!
      const gorgeDz = (wz - (-124)) / 42.0;
      if (Math.abs(gorgeDz) < 1.3) {
        const gorgeBelt = Math.exp(-gorgeDz * gorgeDz * 1.9);
        const sideDist = Math.abs(wx - 10);
        const jaw = smoothstep(11, 44, sideDist) * (1.0 - smoothstep(68, 128, sideDist));
        elev += gorgeBelt * jaw * 21.5;
      }

      // 3. Деривационная полка (перешеек излучины «Подковы» x ∈ [-38..22], z ∈ [-88..82]):
      //    делаем удобную мягкую грунтовую седловину на отметке ~22.6..17.5 м,
      //    чтобы игрок легко прокопал собственный деривационный канал!
      const neckMaskX = 1.0 - smoothstep(14, 42, Math.abs(wx - (-12)));
      const neckMaskZ = smoothstep(-94, -68, wz) * (1.0 - smoothstep(62, 90, wz));
      const neckMask = neckMaskX * neckMaskZ;
      if (neckMask > 0.001) {
        const neckTarget = lerp(22.8, 16.2, clamp((wz - (-80)) / 155, 0, 1));
        elev = lerp(elev, neckTarget, neckMask * 0.78);
      }

      // 4. Ровные террасы под 4 растущих города
      let cityFlatten = 0;
      for (let c = 0; c < CITY_DEFS.length; c++) {
        const cd = CITY_DEFS[c];
        const dCity = Math.hypot(wx - cd.x, wz - cd.z);
        const flat = 1.0 - smoothstep(cd.plateauRadius * 0.68, cd.plateauRadius * 1.28, dCity);
        if (flat > 0.001) {
          elev = lerp(elev, cd.baseElevation, flat * 0.94);
          cityFlatten = Math.max(cityFlatten, flat);
        }
      }

      // 5. Оросительная приёмная чаша возле Агродолины (128, 76) на отметке 14.4 м
      const dIrr = Math.hypot(wx - 128, wz - 76);
      if (dIrr < 34) {
        const irrMask = 1.0 - smoothstep(12, 34, dIrr);
        elev = lerp(elev, 14.4, irrMask * 0.88);
      }

      // 6. Прорезаем главное русло реки «Быстрица» и ледниковый приток «Серебрянка»
      const mainR = samplePolyline(wx, wz, MAIN_RIVER_PATH);
      const creekR = samplePolyline(wx, wz, CREEK_PATH);

      let waterDepth = 0;
      let initU = 0;
      let initV = 0;
      let inChannel = 0;

      // Главное русло с пойменными берегами
      const halfW = mainR.width * 0.5;
      if (mainR.dist < halfW * 3.6) {
        const bankBlend = 1.0 - smoothstep(halfW * 0.82, halfW * 3.4, mainR.dist);
        const channelProfile = clamp((mainR.dist / halfW), 0, 1);
        const channelBed = mainR.bed + Math.pow(channelProfile, 2.2) * 2.5;
        elev = lerp(elev, Math.min(elev, channelBed + (1.0 - bankBlend) * 5.0), bankBlend);
        if (mainR.dist < halfW * 1.08) {
          elev = Math.min(elev, mainR.bed + Math.pow(mainR.dist / (halfW * 1.08), 2.4) * 2.1);
          const targetSurface = mainR.bed + 1.95;
          if (targetSurface > elev + 0.05) {
            waterDepth = targetSurface - elev;
            const speed = 2.15;
            initU = mainR.tx * speed;
            initV = mainR.tz * speed;
            inChannel = 1;
          }
        }
      }

      // Приток «Серебрянка»
      const cHalf = creekR.width * 0.5;
      if (creekR.dist < cHalf * 3.2 && wz < -184) {
        const bankBlend = 1.0 - smoothstep(cHalf * 0.8, cHalf * 3.0, creekR.dist);
        const cBed = creekR.bed + Math.pow(clamp(creekR.dist / cHalf, 0, 1), 2.1) * 1.9;
        elev = lerp(elev, Math.min(elev, cBed + (1.0 - bankBlend) * 4.0), bankBlend);
        if (creekR.dist < cHalf * 1.06) {
          elev = Math.min(elev, creekR.bed + Math.pow(creekR.dist / (cHalf * 1.06), 2.2) * 1.6);
          const targetSurface = creekR.bed + 1.25;
          if (targetSurface > elev + 0.05 && targetSurface - elev > waterDepth) {
            waterDepth = targetSurface - elev;
            initU = creekR.tx * 2.3;
            initV = creekR.tz * 2.3;
            inChannel = 1;
          }
        }
      }

      // 7. Разделение породы на скальное основание (bedrock) и рыхлый грунт (soil)
      //    В каньоне и на крутых хребтах скала выходит близко к поверхности,
      //    а на деривационной полке и в пойме — мощный слой грунта (4–6.5 м), удобный для копки каналов!
      let soilThick = 2.6 + neckMask * 3.8 + cityFlatten * 1.4 - smoothstep(32, 52, elev) * 2.1;
      if (Math.abs(wz - (-124)) < 38 && Math.abs(wx - 10) < 48) {
        // Гранитные скалы теснины «Ворота Грома»
        soilThick = Math.min(soilThick, 0.45);
      }
      if (inChannel) {
        // Галечник на дне реки
        soilThick = clamp(soilThick * 0.35, 0.35, 1.4);
      }
      soilThick = clamp(soilThick, 0.15, 7.5);

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
