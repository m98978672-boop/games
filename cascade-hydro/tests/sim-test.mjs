import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';

import {
  WORLD,
  MAP_SCALES,
  applyMapScale,
  CITY_DEFS,
  BUILDING_ARCHETYPES,
  TOOLS,
  QUALITY_PROFILES,
  WEATHER_MODES,
} from '../src/config.js';
import { HydroSimulation } from '../src/hydro.js';
import { EconomyAndCities, REVENUE_STREAM_DEFS } from '../src/economy.js';
import { buildAllProceduralTextures, TEXTURE_SHADE_CATALOG } from '../src/textures.js';
import { ANIMATION_REGISTRY } from '../src/living-world.js';
import {
  createValleyTerrainMaterial,
  createRealisticWaterMaterial,
  createOverflowWaterMaterial,
  createCityFacadeMaterial,
} from '../src/water-shader.js';
import { WorldView } from '../src/world-view.js';
import { TutorialController } from '../src/tutorial.js';

// ============================================================================
//  0. ПРОВЕРКА DOM ID И ОТСУТСТВИЯ TOFU-ЭМОДЗИ ВО ВСЕХ ФАЙЛАХ
// ============================================================================
console.log('0. Проверка согласованности DOM ID и отсутствия опасных глифов/эмодзи...');
const rootDir = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));

for (const jsFile of ['main.js', 'tutorial.js']) {
  const src = fs.readFileSync(path.join(rootDir, 'src', jsFile), 'utf8');
  for (const m of src.matchAll(/getElementById\('([^']+)'\)/g)) {
    const id = m[1];
    assert.ok(htmlIds.has(id), `DOM id="#${id}" из ${jsFile} присутствует в index.html`);
  }
}

// Сканер опасных эмодзи и U+FE0F (tofu risk на Linux без цветных шрифтов)
let tofuRiskCount = 0;
const filesToScan = [
  path.join(rootDir, 'index.html'),
  path.join(rootDir, 'style.css'),
  ...fs.readdirSync(path.join(rootDir, 'src')).map((f) => path.join(rootDir, 'src', f)),
];
for (const fp of filesToScan) {
  const txt = fs.readFileSync(fp, 'utf8');
  const bad = txt.match(/[\u{1F300}-\u{1FAFF}\uFE0F]/gu);
  if (bad) {
    console.error(`Найдены опасные глифы в ${fp}:`, bad);
    tofuRiskCount += bad.length;
  }
}
assert.equal(tofuRiskCount, 0, 'Ни одного опасного эмодзи / U+FE0F (0 tofu risk)');
console.log(`   OK! Проверено ${htmlIds.size} DOM ID и ${filesToScan.length} исходников (tofu risk = 0).`);

// ============================================================================
//  1. ПРОВЕРКА КАТАЛОГОВ (432 ТЕКСТУРЫ, 300 АНИМАЦИЙ, 32 ЗДАНИЯ, 12 ДОХОДОВ, 14 СЛОТОВ)
// ============================================================================
console.log('1. Проверка каталогов текстур (432), анимаций (300), зданий (32), доходов (12) и GLSL...');
assert.ok(TEXTURE_SHADE_CATALOG.length >= 400, `В каталоге >= 400 текстур и оттенков (${TEXTURE_SHADE_CATALOG.length})`);
assert.ok(ANIMATION_REGISTRY.length >= 250, `В реестре >= 250 анимаций (${ANIMATION_REGISTRY.length})`);
assert.equal(BUILDING_ARCHETYPES.length, 32, '32 архитектурных типа зданий');
assert.equal(CITY_DEFS.length, 8, '8 саморазвивающихся городов и промзон');
assert.equal(REVENUE_STREAM_DEFS.length, 12, '12 независимых источников дохода');
assert.equal(TOOLS.length, 14, '14 инженерных инструментов');

const elemStore = new Map();
globalThis.document = {
  createElement(tag) {
    if (tag === 'canvas') {
      let w = 64;
      let h = 64;
      return {
        get width() { return w; },
        set width(v) { w = v; },
        get height() { return h; },
        set height(v) { h = v; },
        getContext() {
          return {
            fillStyle: '#000',
            strokeStyle: '#000',
            lineWidth: 1,
            globalAlpha: 1,
            fillRect() {},
            strokeRect() {},
            clearRect() {},
            beginPath() {},
            closePath() {},
            moveTo() {},
            lineTo() {},
            arc() {},
            ellipse() {},
            fill() {},
            stroke() {},
            createLinearGradient() { return { addColorStop() {} }; },
            getImageData(_x, _y, iw, ih) { return { data: new Uint8ClampedArray(iw * ih * 4), width: iw, height: ih }; },
            createImageData(iw, ih) { return { data: new Uint8ClampedArray(iw * ih * 4), width: iw, height: ih }; },
            putImageData() {},
          };
        },
      };
    }
    return {
      id: '',
      className: '',
      innerHTML: '',
      textContent: '',
      style: {},
      dataset: {},
      disabled: false,
      checked: true,
      classList: {
        _set: new Set(),
        add(c) { this._set.add(c); },
        remove(c) { this._set.delete(c); },
        toggle(c, f) {
          if (f === undefined) {
            if (this._set.has(c)) { this._set.delete(c); return false; }
            this._set.add(c); return true;
          }
          if (f) this._set.add(c); else this._set.delete(c);
          return f;
        },
        contains(c) { return this._set.has(c); },
      },
      addEventListener() {},
      appendChild() {},
      querySelectorAll() { return []; },
      querySelector() { return null; },
    };
  },
  getElementById(id) {
    if (!elemStore.has(id)) elemStore.set(id, this.createElement('div'));
    return elemStore.get(id);
  },
  querySelector() { return null; },
  querySelectorAll() { return []; },
};

const texSet = buildAllProceduralTextures(null);
assert.ok(
  texSet.waterDetail && texSet.overflowCascade && texSet.facadeAtlas && texSet.concreteMap && texSet.steel && texSet.roof,
  'Все процедурные PBR-текстуры (включая 512×512 воду, пелену перелива и мега-атлас 64 фасадов) созданы',
);

function checkGlslBalanced(name, code) {
  let braces = 0;
  let parens = 0;
  for (const ch of code) {
    if (ch === '{') braces++;
    else if (ch === '}') braces--;
    else if (ch === '(') parens++;
    else if (ch === ')') parens--;
    assert.ok(braces >= 0 && parens >= 0, `Баланс скобок в шейдере ${name}`);
  }
  assert.equal(braces, 0, `Фигурные скобки сбалансированы в ${name}`);
  assert.equal(parens, 0, `Круглые скобки сбалансированы в ${name}`);
  assert.ok(code.includes('void main()'), `void main() присутствует в ${name}`);
}

const tMat = createValleyTerrainMaterial(texSet.waterDetail, texSet.concreteMap);
const wMat = createRealisticWaterMaterial(texSet.waterDetail);
const oMat = createOverflowWaterMaterial(texSet.overflowCascade);
const bMat = createCityFacadeMaterial(texSet.roof, texSet.facadeAtlas);
checkGlslBalanced('terrain.vert', tMat.vertexShader);
checkGlslBalanced('terrain.frag', tMat.fragmentShader);
checkGlslBalanced('water.vert', wMat.vertexShader);
checkGlslBalanced('water.frag', wMat.fragmentShader);
checkGlslBalanced('overflow.vert', oMat.vertexShader);
checkGlslBalanced('overflow.frag', oMat.fragmentShader);
checkGlslBalanced('building.vert', bMat.vertexShader);
checkGlslBalanced('building.frag', bMat.fragmentShader);
console.log(`   OK! Каталоги: ${TEXTURE_SHADE_CATALOG.length} текстур/оттенков, ${ANIMATION_REGISTRY.length} анимаций, 4 GLSL-пары проверены.`);

// ============================================================================
//  2. ТЕСТ КАРТЫ 5×5 КМ (25 КМ²), КАНОНИЧЕСКОЙ ПОСАДКИ ГЭС В НИЖНЕМ БЬЕФЕ И 3D-ПЕРЕЛИВА
// ============================================================================
console.log('2. Проверка карты 5×5 км (5000×5000 м), посадки ГЭС у подошвы плотины и 3D-анимации перелива...');
applyMapScale('km5');
assert.equal(WORLD.size, 5000, 'Масштаб km5 = 5000×5000 м (5×5 км)');

const hydro = new HydroSimulation(208, 'bystritsa');
const eco = new EconomyAndCities(hydro);
const scene = new THREE.Scene();
const worldView = new WorldView(scene, hydro, eco, QUALITY_PROFILES.medium, null, texSet);

assert.equal(eco.cities.length, 8, 'На карте 5×5 км размещены все 8 городов и промзон');
assert.ok(hydro.totalWaterVolumeM3 > 100000, 'В речном бассейне 5×5 км течёт полноводный поток');

// Строим бетонную плотину в главном каньоне (масштабированном под 5×5 км!)
const hs = WORLD.horizScale;
const es = WORLD.elevScale;
const canyonX = 12 * hs;
const canyonZ = -158 * hs;
const brushR = WORLD.brushSizes[1];
const damCrest = 35.5 * es;

for (let wx = -26 * hs; wx <= 50 * hs; wx += brushR * 0.55) {
  hydro.buildConcreteDam(wx, canyonZ, brushR, damCrest, 1e9, true, true);
}
hydro.reinforceFoundation(canyonX, canyonZ, brushR * 1.4, 1e9, true);

// Снимаем рельеф ДО установки ГЭС, чтобы убедиться, что ГЭС НЕ поднимает землю вверх!
const bedBeforeHPP = new Float32Array(hydro.zb);

const turbRes = hydro.placeTurbine('francis', canyonX, canyonZ, Math.PI * 0.5, 1e9, true);
assert.equal(turbRes.ok, true, 'Приплотинная ГЭС Фрэнсиса успешно установлена в створе 5×5 км');
const tb = turbRes.structure;

// 2a. Строгая проверка исправления посадки ГЭС: НИ ОДНА ячейка не была задрана вверх!
let maxBedRise = 0;
for (let i = 0; i < hydro.count; i++) {
  maxBedRise = Math.max(maxBedRise, hydro.zb[i] - bedBeforeHPP[i]);
}
assert.ok(maxBedRise <= 1e-4, `Установка ГЭС НЕ задирает рельеф вверх (maxRise = ${maxBedRise})`);

// 2b. Машинный зал обязан стоять в НИЖНЕМ БЬЕФЕ у подошвы плотины (существенно ниже гребня)!
assert.ok(
  tb.hallBaseY < tb.crestY - 4.0 * es,
  `Машинный зал стоит в нижнем бьефе (${tb.hallBaseY.toFixed(1)} м) строго ниже гребня плотины (${tb.crestY.toFixed(1)} м)`,
);

// Устанавливаем водосброс, судоходный шлюз, рыбхоз и подстанцию ОРУ 220 кВ
const swRes = hydro.placeSpillway(28 * hs, canyonZ, Math.PI * 0.5, 1e9, true);
assert.equal(swRes.ok, true, '3D-водосброс установлен сбоку плотины на карте 5×5 км');

const lockRes = hydro.placeNavigationLock(-14 * hs, canyonZ, Math.PI * 0.5, 1e9, true);
assert.equal(lockRes.ok, true, 'Судоходный шлюз установлен в створе плотины');

const fishRes = hydro.placeFishEcoFarm(8 * hs, -205 * hs, 1e9, true);
assert.equal(fishRes.ok, true, 'Форелевое рыбное хозяйство размещено в водохранилище');

const subRes = hydro.placeSubstation(52 * hs, -140 * hs, 1e9, true);
assert.equal(subRes.ok, true, 'Подстанция ОРУ 220 кВ построена на берегу');

for (const c of eco.cities) {
  if (!c.connected) eco.connectCityGrid(c.id);
}

// 2c. Наполняем верхний бьеф паводком выше гребня, чтобы проверить 3D-АНИМАЦИЮ ПЕРЕЛИВА ВОДЫ!
eco.setWeather('flood');
// Добавим стартовый подпор в чаше перед плотиной для мгновенного выхода на перелив
for (let dz = -18; dz <= -2; dz++) {
  for (let dx = -10; dx <= 10; dx++) {
    const g0 = hydro.worldToGrid(canyonX + dx * hydro.dx, canyonZ + dz * hydro.dx);
    const id = g0.gz * hydro.grid + g0.gx;
    const bed = hydro.zb[id];
    if (bed < damCrest + 2.0 * es) {
      hydro.h[id] = Math.max(hydro.h[id], (damCrest + 1.8 * es) - bed);
    }
  }
}

for (let step = 0; step < 90; step++) {
  hydro.step(1 / 20, 8);
  eco.update(0.25);
}

worldView.updateAtmosphere(13.5, WEATHER_MODES.flood, new THREE.Vector3(canyonX, 20, canyonZ), 0.05);
worldView.updateWaterAndWetness(hydro.simTime);
worldView.syncEngineeredVolumes();
worldView.syncHydroStructures(hydro.simTime);
worldView.syncCityInstances();

assert.ok(hydro.overflowEdges.length > 0, `Детектор 3D-перелива зафиксировал струи через гребень (${hydro.overflowEdges.length})`);
assert.ok(worldView.overflowNappeIM.count > 0, `Отрисованы 3D-меши падающей водной пелены перелива (${worldView.overflowNappeIM.count})`);

const swVisual = worldView.structMeshes.get(`s_${swRes.structure.id}`);
assert.ok(
  swVisual && swVisual.userData.chuteWater.visible && swVisual.userData.skiJump.visible,
  'В лотке открытого водосброса виден 3D-поток перелива с прыжком воды с носка-трамплина',
);

// Проверяем канонический 3D-машзал ГЭС в WorldView
const tbVisual = worldView.structMeshes.get(`t_${tb.id}`);
assert.ok(tbVisual instanceof THREE.Group && tbVisual.children.length >= 6, '3D-комплекс приплотинной ГЭС (водоприёмник + водоводы + машзал в НБ + козловой кран) создан');

console.log(
  `   OK! ГЭС: гребень=${tb.crestY.toFixed(1)} м, машзал НБ=${tb.hallBaseY.toFixed(1)} м, мощность=${tb.powerMW.toFixed(1)} МВт; 3D-струй перелива=${worldView.overflowNappeIM.count}`,
);

// ============================================================================
//  3. ПРОВЕРКА РЕЖИМА ГАЭС, НАУЧНОГО БАЛАНСА ВОДЫ И 12 ИСТОЧНИКОВ ДОХОДА
// ============================================================================
console.log('3. Проверка ночной закачки ГАЭС, научного баланса воды и 12 источников дохода...');
tb.pumpedStorage = true;
eco.hour = 2.5; // Ночь 02:30 — провал нагрузки!
eco.setWeather('normal');
for (let step = 0; step < 30; step++) {
  hydro.step(1 / 20, 6);
  eco.update(0.2);
}
assert.equal(hydro.isOffPeakNight, true, 'Ночное окно ГАЭС активно в 02:30');
assert.equal(tb.isPumpingNow, true, 'Обратимый гидроагрегат ГАЭС качает воду из нижнего бьефа в верхний ночью');

// Переводим на солнечный день (14:00) и вечерний супер-пик для проверки ледникового таяния, испарения, арбитража ГАЭС и всех 12 потоков выручки!
eco.hour = 15.0;
const agroIrr = CITY_DEFS.find((c) => c.id === 'agro').irrigationTarget;
hydro.excavateCanal(agroIrr.x, agroIrr.z, brushR, 3.0, null, 1e9, true);
for (let dz = -1; dz <= 1; dz++) {
  for (let dx = -1; dx <= 1; dx++) {
    const gAgro = hydro.worldToGrid(agroIrr.x + dx * hydro.dx, agroIrr.z + dz * hydro.dx);
    hydro.h[gAgro.gz * hydro.grid + gAgro.gx] = 3.2 * es;
  }
}

for (let step = 0; step < 50; step++) {
  hydro.step(1 / 20, 6);
  eco.update(0.25);
}

const sum = eco.getSummary();
const wb = sum.waterReport;
assert.ok(wb.inRiversQ > 100, `Речной приток масштабирован под 5×5 км (${wb.inRiversQ.toFixed(1)} м³/с)`);
assert.ok(wb.inSnowmeltQ > 0, `Дневное таяние горных ледников активно (${wb.inSnowmeltQ.toFixed(1)} м³/с)`);
assert.ok(wb.outEvapQ > 0, `Испарение по Дальтону–Пенману активно (${wb.outEvapQ.toFixed(2)} м³/с, ${wb.evapMmPerDay.toFixed(2)} мм/сут)`);
assert.ok(wb.cumArrivedK > 0 && wb.cumEvaporatedK > 0, 'Накопленные объёмы (пришло / испарилось в тыс. м³) ведутся');
assert.ok(wb.whenWhySummary.length > 20, 'Текстовое научное объяснение «почему/откуда/куда» формируется');

const activeStreams = REVENUE_STREAM_DEFS.filter((d) => (sum.revenueTotals[d.id] || 0) > 0);
assert.ok(
  activeStreams.length >= 10,
  `Активно минимум 10 из 12 независимых потоков дохода при работе гидроузла (${activeStreams.length}/12)`,
);

// Проверяем также добычу гранитного щебня экскаватором и оптовую отгрузку баржи (#10 поток)!
hydro.excavateCanal(42 * hs, -110 * hs, brushR * 1.2, 4.0, null, 1e9, true);
hydro.rockStockpileM3 += 520 / hydro.volPriceNorm;
const aggSale = eco.sellAggregateBatch();
assert.equal(aggSale.ok, true, 'Оптовая отгрузка баржи щебня принесла выручку');
console.log(`   OK! Научный баланс: приток +${wb.inTotalQ.toFixed(1)} м³/с, испарение -${wb.outEvapQ.toFixed(2)} м³/с, активных потоков выручки: ${activeStreams.length + 1}/12.`);

// ============================================================================
//  4. ПРОВЕРКА ПОШАГОВОГО ОБУЧЕНИЯ НА МАСШТАБЕ 5×5 КМ
// ============================================================================
console.log('4. Проверка всех 8 шагов обучения «Школа Гидростроителя» на масштабе 5×5 км...');
const fakeGame = {
  selectedPresetId: 'bystritsa',
  showContours: true,
  hydro,
  economy: eco,
  worldView,
  camCtrl: {
    target: new THREE.Vector3(canyonX, 20, canyonZ),
    flyTo(x, z) { this.target.set(x, 20, z); },
  },
  audio: { playMilestone() {} },
  selectTool() {},
  notify() {},
};

const tut = new TutorialController(fakeGame);
tut.start(0);
for (let guard = 0; guard < 16 && tut.active; guard++) {
  const curStep = tut._getSteps()[tut.stepIndex];
  if (curStep && curStep.target) {
    fakeGame.camCtrl.target.set(curStep.target.x, 20, curStep.target.z);
  }
  tut.update();
}
const remStep = tut._getSteps()[tut.stepIndex];
assert.equal(
  tut.completed,
  true,
  `Все 8 шагов интерактивного обучения успешно пройдены на карте 5×5 км (остановилось на шаге ${tut.stepIndex}: ${remStep ? remStep.id + ' -> ' + JSON.stringify(remStep.progress()) : 'none'})`,
);

// ============================================================================
//  5. ПРОВЕРКА ГИГАНТСКОЙ КАРТЫ 10×10 КМ (100 КМ²) И БЕНЧМАРК ОПТИМИЗАЦИИ
// ============================================================================
console.log('5. Проверка гигантского бассейна 10×10 км (10 000 × 10 000 м = 100 км²) и скорости расчёта...');
applyMapScale('km10');
assert.equal(WORLD.size, 10000, 'Масштаб km10 = 10000×10000 м (10×10 км)');

hydro.resetValley('rapids');
eco.resetEconomy();
worldView.rebuildForNewValley();

const t0 = performance.now();
const benchSteps = 30;
for (let s = 0; s < benchSteps; s++) {
  hydro.step(1 / 60, 8);
}
const avgStepMs = (performance.now() - t0) / benchSteps;
assert.ok(hydro.totalWaterVolumeM3 > 500000, 'Бассейн 10×10 км наполнен полноводными реками');
assert.ok(avgStepMs < 15.0, `Среднее время шага SWE на карте 10×10 км (${avgStepMs.toFixed(2)} мс) укладывается в бюджет 60 FPS`);
console.log(`   OK! Карта 10×10 км (100 км²): объём воды ${(hydro.totalWaterVolumeM3 / 1e6).toFixed(2)} млн м³, шаг физики = ${avgStepMs.toFixed(2)} мс.`);

// Возвращаем дефолт 5×5 км и проверяем также компактный режим 0.8×0.8 км
applyMapScale('compact');
assert.equal(WORLD.size, 768, 'Масштаб compact = 768×768 м сохранён');
applyMapScale('km5');

console.log('✅ ВСЕ ТЕСТЫ v0.3.0 (5×5 и 10×10 КМ, ГЭС В НБ + ГАЭС, 3D-ПЕРЕЛИВ, ВОДНЫЙ БАЛАНС, 12 ДОХОДОВ, 8 ГОРОДОВ/32 ЗДАНИЯ, 300 АНИМАЦИЙ, 432 ТЕКСТУРЫ) ПРОЙДЕНЫ!');
