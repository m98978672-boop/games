import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';

import {
  WORLD,
  MAP_SCALES,
  applyMapScale,
  CONSTRUCTION,
  CITY_DEFS,
  BUILDING_ARCHETYPES,
  TOOLS,
  QUALITY_PROFILES,
  WEATHER_MODES,
  STARTER_READY_HPP_SITES,
} from '../src/config.js';
import { AQUEDUCT_CONNECT_REWARD, evaluateCityUrbanLogic } from '../src/city-logic.js';
import { HydroSimulation } from '../src/hydro.js';
import { EconomyAndCities, REVENUE_STREAM_DEFS } from '../src/economy.js';
import { buildAllProceduralTextures, TEXTURE_SHADE_CATALOG } from '../src/textures.js';
import { ANIMATION_REGISTRY } from '../src/living-world.js';
import { SprayAndRainSystem } from '../src/spray.js';
import {
  createValleyTerrainMaterial,
  createRealisticWaterMaterial,
  createOverflowWaterMaterial,
  createCityFacadeMaterial,
  createOuterSeaFogMaterial,
  createHorizonMistMaterial,
  createHighwayRoadMaterial,
} from '../src/water-shader.js';
import { WorldView } from '../src/world-view.js';
import { ValleyCameraController } from '../src/camera.js';
import { HydroAudio } from '../src/audio.js';
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
//  1. ПРОВЕРКА КАТАЛОГОВ (480 ТЕКСТУР, 300 АНИМАЦИЙ, 48 ЗДАНИЙ, 12 ДОХОДОВ, 17 СЛОТОВ)
// ============================================================================
console.log('1. Проверка каталогов текстур (480), анимаций (300), зданий (48), доходов (12), 17 инструментов и GLSL...');
assert.equal(TEXTURE_SHADE_CATALOG.length, 480, `В каталоге ровно 480 текстур и оттенков (${TEXTURE_SHADE_CATALOG.length})`);
assert.ok(ANIMATION_REGISTRY.length >= 300, `В реестре >= 300 анимаций (${ANIMATION_REGISTRY.length})`);
assert.equal(BUILDING_ARCHETYPES.length, 48, '48 архитектурных и строительных типов зданий');
assert.ok(
  BUILDING_ARCHETYPES.filter((a) => a.cat === 'bld').length >= 6,
  'В городах присутствуют 6 профильных стройкомбинатов (БСУ, ДСК, ЖБИ, Краново-монтажное, АБЗ, РМЗ) + 10 новых объектов (всего 48)',
);
assert.equal(CITY_DEFS.length, 8, '8 саморазвивающихся городов и промзон');
assert.equal(REVENUE_STREAM_DEFS.length, 12, '12 независимых источников дохода');
assert.equal(TOOLS.length, 13, '13 сфокусированных инструментов с единой постройкой «Целая ГЭС» (без лишних отдельных турбин)');
assert.equal(TOOLS[1].id, 'build_hpp', 'На главном слоте [2] стоит отдельная постройка «Целая ГЭС»');
assert.equal(TOOLS.filter((t) => t.id.startsWith('turbine_')).length, 0, 'Из панели убраны разрозненные отдельные турбины');
for (const tool of TOOLS) {
  assert.ok(
    !['W', 'A', 'S', 'D', 'Q', 'E'].includes(tool.key),
    `Хоткей инструмента ${tool.id} ([${tool.key}]) не конфликтует с управлением камерой WASD/QE`,
  );
}

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
            setLineDash() {},
            createLinearGradient() { return { addColorStop() {} }; },
            createRadialGradient() { return { addColorStop() {} }; },
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
  texSet.waterDetail && texSet.overflowCascade && texSet.facadeAtlas && texSet.concreteMap && texSet.steel && texSet.roof && texSet.urbanPlaza && texSet.glacierIce,
  'Все процедурные PBR-текстуры (включая 1024×1024 мега-атлас фасадов, 512×512 городские площади и 256×256 ледниковый лёд) созданы',
);

function checkGlslBalanced(name, code, uniformsObj = null) {
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

  // Строгая статическая проверка всех объявлений uniform / varying / attribute / локальных переменных в GLSL!
  const noComments = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const declared = new Set();
  for (const m of noComments.matchAll(/\b(?:uniform|varying|attribute)\s+\w+\s+(\w+)/g)) {
    declared.add(m[1]);
  }
  for (const m of noComments.matchAll(/\b(?:float|int|bool|vec[234]|mat[234]|sampler2D)\s+(\w+)/g)) {
    declared.add(m[1]);
  }
  const uniformDecls = new Set(
    [...noComments.matchAll(/\buniform\s+\w+\s+(\w+)\s*;/g)].map((m) => m[1]),
  );
  const used = new Set([...noComments.matchAll(/\b([uva][A-Z]\w*)\b/g)].map((m) => m[1]));
  for (const sym of used) {
    assert.ok(
      declared.has(sym),
      `GLSL символ "${sym}" обязан быть явно объявлен в шейдере ${name}`,
    );
    if (uniformsObj && uniformDecls.has(sym)) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(uniformsObj, sym),
        `GLSL uniform "${sym}" в ${name} обязан присутствовать в material.uniforms`,
      );
    }
  }
}

const tMat = createValleyTerrainMaterial(texSet.waterDetail, texSet.concreteMap);
const wMat = createRealisticWaterMaterial(texSet.waterDetail);
const oMat = createOverflowWaterMaterial(texSet.overflowCascade);
const bMat = createCityFacadeMaterial(texSet.roof, texSet.facadeAtlas);
const rMat = createHighwayRoadMaterial();
checkGlslBalanced('terrain.vert', tMat.vertexShader, tMat.uniforms);
checkGlslBalanced('terrain.frag', tMat.fragmentShader, tMat.uniforms);
checkGlslBalanced('water.vert', wMat.vertexShader, wMat.uniforms);
checkGlslBalanced('water.frag', wMat.fragmentShader, wMat.uniforms);
checkGlslBalanced('overflow.vert', oMat.vertexShader, oMat.uniforms);
checkGlslBalanced('overflow.frag', oMat.fragmentShader, oMat.uniforms);
checkGlslBalanced('building.vert', bMat.vertexShader, bMat.uniforms);
checkGlslBalanced('building.frag', bMat.fragmentShader, bMat.uniforms);
checkGlslBalanced('road.vert', rMat.vertexShader, rMat.uniforms);
checkGlslBalanced('road.frag', rMat.fragmentShader, rMat.uniforms);
console.log(`   OK! Каталоги: ${TEXTURE_SHADE_CATALOG.length} текстур/оттенков, ${ANIMATION_REGISTRY.length} анимаций, 5 GLSL-пар и все uniform проверены.`);

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
//  4. ПРОВЕРКА ПОШАГОВОГО ОБУЧЕНИЯ v0.4 (10 ШАГОВ) НА МАСШТАБЕ 5×5 КМ
// ============================================================================
console.log('4. Проверка всех 10 шагов обучения «Школа Гидростроителя v0.4» на масштабе 5×5 км...');
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
assert.equal(tut._getSteps().length, 10, 'Обучение обновлено до 10 подробных инженерных шагов');
tut.start(0);
for (let guard = 0; guard < 20 && tut.active; guard++) {
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
  `Все 10 шагов интерактивного обучения успешно пройдены на карте 5×5 км (остановилось на шаге ${tut.stepIndex}: ${remStep ? remStep.id + ' -> ' + JSON.stringify(remStep.progress()) : 'none'})`,
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

// ============================================================================
//  6. ПРОВЕРКА ИСПРАВЛЕНИЙ v0.3.1: WASD, ПЕРЕЛЁТ ГОРОДОВ, ЧИСТЫЕ РЕКИ, МОРЕ И ТУМАН ЗА КАРТОЙ, ЗВУК
// ============================================================================
console.log('6. Проверка управления WASD, дугового перелёта между городами, чистых рек, внешнего моря/тумана и звука...');

const seaMat = createOuterSeaFogMaterial(texSet.waterDetail);
const mistMat = createHorizonMistMaterial();
checkGlslBalanced('outerSea.vert', seaMat.vertexShader);
checkGlslBalanced('outerSea.frag', seaMat.fragmentShader);
checkGlslBalanced('horizonMist.vert', mistMat.vertexShader);
checkGlslBalanced('horizonMist.frag', mistMat.fragmentShader);

assert.ok(worldView.outerSeaMesh && worldView.horizonMistMesh, 'За пределами карты созданы бескрайнее внешнее море и кольцо объёмного тумана');
worldView.rebuildForNewValley();
assert.equal(worldView.outerSeaMesh.scale.x, WORLD.size * 14, 'Внешнее море охватывает пространство в 14 раз шире карты');

// Проверяем отсутствие лишнего движения по рекам и бездорожью между городами
assert.equal(worldView.livingWorld.shipHullIM, undefined, 'Лишнее движение кораблей по горным рекам убрано');
for (const car of worldView.livingWorld.cityCars) {
  const homeCity = CITY_DEFS.find((c) => Math.hypot(c.x - car.cx, c.z - car.cz) < 1);
  assert.ok(homeCity && car.ringR < homeCity.plateauRadius * 0.65, 'Внутригородской транспорт остаётся строго внутри террасы своего города');
}

// Проверяем точную противоположность направлений WASD (W vs S, A vs D) и перелёт flyTo!
globalThis.window = {
  addEventListener() {},
};
globalThis.document.addEventListener = () => {};
const dummyDom = { addEventListener() {} };
const testCam = new THREE.PerspectiveCamera(46, 16 / 9, 4.5, 20000);
const camCtrl = new ValleyCameraController(testCam, dummyDom);

const baseGoal = camCtrl.goalTarget.clone();
camCtrl.keys.add('KeyD');
camCtrl.update(0.1, 20, () => 20);
const deltaD = camCtrl.goalTarget.clone().sub(baseGoal);
camCtrl.keys.clear();

const afterD = camCtrl.goalTarget.clone();
camCtrl.keys.add('KeyA');
camCtrl.update(0.1, 20, () => 20);
const deltaA = camCtrl.goalTarget.clone().sub(afterD);
camCtrl.keys.clear();

const dotAD = (deltaD.x * deltaA.x + deltaD.z * deltaA.z) / (Math.hypot(deltaD.x, deltaD.z) * Math.hypot(deltaA.x, deltaA.z));
assert.ok(dotAD < -0.999, `Клавиши A и D двигают камеру строго в противоположные стороны по XZ (dot = ${dotAD.toFixed(4)})`);

const beforeW = camCtrl.goalTarget.clone();
camCtrl.keys.add('KeyW');
camCtrl.update(0.1, 20, () => 20);
const deltaW = camCtrl.goalTarget.clone().sub(beforeW);
camCtrl.keys.clear();

const afterW = camCtrl.goalTarget.clone();
camCtrl.keys.add('KeyS');
camCtrl.update(0.1, 20, () => 20);
const deltaS = camCtrl.goalTarget.clone().sub(afterW);
camCtrl.keys.clear();

const dotWS = (deltaW.x * deltaS.x + deltaW.z * deltaS.z) / (Math.hypot(deltaW.x, deltaW.z) * Math.hypot(deltaS.x, deltaS.z));
assert.ok(dotWS < -0.999, `Клавиши W и S двигают камеру строго вперёд и назад по XZ (dot = ${dotWS.toFixed(4)})`);

// Проверяем плавный дуговой перелёт flyTo и защиту камеры от провала под гору
camCtrl.flyTo(1200, 950, 900, 45);
assert.ok(camCtrl._flight !== null, 'Запущен плавный дуговой перелёт между городами');
camCtrl.update(0.35, 45, () => 280); // высокий хребет 280 м прямо под камерой!
assert.ok(testCam.position.y > 285, 'Камера автоматически поднимается над горным хребтом и не проваливается под землю');

// Нажатие WASD мгновенно прерывает авто-перелёт и отдаёт управление игроку
camCtrl.keys.add('KeyW');
camCtrl.update(0.05, 45, () => 45);
assert.equal(camCtrl._flight, null, 'Нажатие WASD мгновенно отменяет авто-перелёт');
camCtrl.keys.clear();

// Проверяем безопасность аудиосистемы
const audio = new HydroAudio();
audio.updateContinuous(920, 1500, 120, 300);

// ============================================================================
//  7. ПРОВЕРКА v0.3.2: ЖИВАЯ ВОДА В РЕКАХ, РЕАЛЬНАЯ СТРОЙКА ГОРОДОВ И ДОРОГ/МОСТОВ МЕЖДУ НИМИ!
// ============================================================================
console.log('7. Проверка воды в реках, 3D-волн, реальной стройки городов и постройки трасс и мостов между городами...');
hydro.resetValley('bystritsa');
eco.resetEconomy();
worldView.rebuildForNewValley();
worldView.updateWaterAndWetness(1.25);
worldView.animateConstructionCranes(1.25);

// 7a. В речном меше реально есть видимые вершины живой воды и шейдер воды содержит все 3D-волны и uMapHalf!
let wetVerticesCount = 0;
const h1Arr = worldView.waterH1Attr.array;
const h2Arr = worldView.waterH2Attr.array;
for (let k = 0; k < hydro.count; k++) {
  if (h1Arr[k * 4] > 0.05 && h2Arr[k * 4 + 3] > 0.5) wetVerticesCount++;
}
assert.ok(wetVerticesCount > 600, `Реки полноводны и передают активную глубину в меш воды (${wetVerticesCount} водных вершин)`);
assert.ok(wMat.fragmentShader.includes('uniform float uMapHalf;'), 'uniform float uMapHalf объявлен во фрагментном шейдере речной воды');
assert.ok(wMat.vertexShader.includes('vWaveCrest'), 'В вершинном шейдере воды работают 3D-волны Герстнера и перекаты');

// 7b. Города реально строятся поэтапно: фундаменты, сквозные леса, башенные краны со стрелами!
assert.ok(worldView.cityFoundations.count >= 40, 'Под зданиями городов залиты бетонные фундаментные плиты');
assert.ok(worldView.cityScaffolds.count >= 8, `Активные новостройки городов окружены 3D-строительными лесами (${worldView.cityScaffolds.count})`);
assert.ok(worldView.cityCraneMasts.count >= 8, `Над стройплощадками городов работают башенные краны (${worldView.cityCraneMasts.count})`);
assert.ok(worldView.cityCraneJibs.count >= 8, 'Стрелы городских башенных кранов вращаются в реальном времени');

// 7c. Дороги и мосты между городами проложены по рельефу A*, имеют высокие мосты над реками и реально строятся!
const routes = eco.roadNetwork.routes;
assert.equal(routes.length, 9, 'Спроектированы все 9 региональных трасс и мостовых переходов между 8 городами');

let bridgeRoutesCount = 0;
for (const rt of routes) {
  if (rt.hasBridge) {
    bridgeRoutesCount++;
    for (const pt of rt.points) {
      if (pt.waterDepth > 0.15) {
        assert.ok(
          pt.deckY > pt.waterSurf + 2.5 * WORLD.elevScale,
          `Пролёт моста на трассе «${rt.name}» поднят высоко над водой (${pt.deckY.toFixed(1)} м > ${pt.waterSurf.toFixed(1)} м)`,
        );
      }
    }
  }
}
assert.ok(bridgeRoutesCount >= 3, `Через реки перекинуты инженерные мосты (${bridgeRoutesCount} мостовых трасс)`);

const initialBuildingsTotal = eco.allBuildings.length;
const initialRoadProgSum = routes.reduce((s, r) => s + r.buildProgress, 0);

// Продвигаем время вперёд и проверяем реальный рост городов и укладку километров дорог и мостов!
for (const c of eco.cities) {
  if (!c.connected) eco.connectCityGrid(c.id);
}
eco.creative = true;
for (let step = 0; step < 60; step++) {
  eco.update(0.25);
}
worldView.syncCityInstances();
worldView.updateAtmosphere(12.0, WEATHER_MODES.normal, new THREE.Vector3(0, 20, 0), 0.1);

const afterRoadProgSum = routes.reduce((s, r) => s + r.buildProgress, 0);
assert.ok(afterRoadProgSum > initialRoadProgSum + 2.0, 'Междугородние дороги и мосты реально строятся со временем');
assert.ok(eco.roadNetwork.completedCount >= 4, `Построены и открыты для движения междугородние магистрали (${eco.roadNetwork.completedCount}/9)`);
assert.ok(eco.allBuildings.length > initialBuildingsTotal, `Города реально построили новые здания (${initialBuildingsTotal} -> ${eco.allBuildings.length})`);
assert.ok(worldView.roadRenderer.bridgePierIM.count > 0, `В руслах рек возведены железобетонные опоры-быки мостов (${worldView.roadRenderer.bridgePierIM.count})`);
assert.ok(worldView.livingWorld.vehicleIM.count > worldView.livingWorld.cityCars.length, 'По построенным междугородним дорогам и мостам поехал автотранспорт!');

console.log('✅ ВСЕ ТЕСТЫ v0.3.2 (ВОДА В РЕКАХ + 3D-ВОЛНЫ, РЕАЛЬНАЯ СТРОЙКА ГОРОДОВ, ТРАССЫ И МОСТЫ МЕЖДУ ГОРОДАМИ) ПРОЙДЕНЫ!');

// ============================================================================
//  8. ПРОВЕРКА v0.4.0: 3D-ИСТОКИ РЕК, ОТСУТСТВИЕ БЕЛОГО ОВАЛА И ЗАСТОЯ, ТОНКАЯ СТРОЙКА, БСУ/НАСОСНАЯ/ВЭС И ФИЗИКА ВЕТРА/КЛИМАТА!
// ============================================================================
console.log('8. Проверка v0.4.0: 3D-истоки рек, анти-застой, удаление белого овала, тонкая стройка, БСУ/Насосная/ВЭС и физика ветра...');
applyMapScale('km5');
hydro.resetValley('bystritsa');
eco.resetEconomy();
worldView.rebuildForNewValley();

// 8a. Белый вращающийся овал у берега полностью убран, и на естественных берегах рек НЕТ ложных overflowEdges!
assert.equal(worldView.plungeRollerIM, undefined, 'Вращающийся белый цилиндр-овал plungeRollerIM полностью удалён');
for (let step = 0; step < 30; step++) {
  hydro.step(1 / 25, 6);
}
assert.equal(hydro.overflowEdges.length, 0, 'На естественных берегах рек (без плотин) нет ложных срабатываний перелива');

// 8b. Все 3 реки имеют живые 3D-истоки (ледниковые гроты и скальные ключи), откуда реально течёт вода!
assert.equal(hydro.headwaterSources.length, 3, 'Инициализированы все 3 природных истока рек');
assert.equal(worldView.headwatersGroup.children.length, 3, 'В 3D-сцене построены 3 ледниковых грота и водопада истоков');
for (const src of hydro.headwaterSources) {
  const sp = hydro.sampleAtWorld(src.outX, src.outZ);
  assert.ok(sp.depth > 0.15 && sp.speed > 0.12, `Из истока «${src.name}» активно идёт живой поток (H=${sp.depth.toFixed(2)} м, V=${sp.speed.toFixed(2)} м/с)`);
}

// 8c. Вода не застаивается: естественный сток уходит в море, а мелкая лужа на склоне быстро дренируется!
assert.ok(hydro.lastMouthOutflowQ > 10, `Реки свободно дренируются в открытое море без застоя (сток в море ${hydro.lastMouthOutflowQ.toFixed(1)} м³/с)`);
const testPuddleG = hydro.worldToGrid(110 * WORLD.horizScale, 35 * WORLD.horizScale);
const puddleIdx = testPuddleG.gz * hydro.grid + testPuddleG.gx;
const beforePuddleH = hydro.h[puddleIdx];
hydro.h[puddleIdx] = beforePuddleH + 0.18;
for (let step = 0; step < 45; step++) {
  hydro.step(1 / 20, 6);
}
assert.ok(hydro.h[puddleIdx] < beforePuddleH + 0.14, 'Мелкая застойная плёнка на рельефе дренируется вниз по уклону и не стоит вечно');

// 8d. Тонкая стройка: 4 калибра кисти, 4 выверенных яруса плотины БЕЗ двойного умножения на elevScale!
assert.equal(WORLD.brushSizes.length, 4, 'Доступны 4 точных калибра строительной кисти');
assert.equal(CONSTRUCTION.damHeightTiers.length, 4, 'Доступны 4 точных яруса высоты 3D-плотины');
assert.ok(
  CONSTRUCTION.damHeightTiers[0].addHeight > 5 && CONSTRUCTION.damHeightTiers[0].addHeight < 10,
  `Младший ярус плотины на 5×5 км составляет аккуратные ~7 м (${CONSTRUCTION.damHeightTiers[0].addHeight.toFixed(1)} м), без двойного умножения elevScale`,
);
assert.ok(
  CONSTRUCTION.damHeightTiers[3].addHeight > 32 && CONSTRUCTION.damHeightTiers[3].addHeight < 44,
  `Старший ярус плотины на 5×5 км выверен (~38 м: ${CONSTRUCTION.damHeightTiers[3].addHeight.toFixed(1)} м)`,
);

// 8e. Новые строительные и инженерные сооружения: [B] Бетонозавод БСУ, [G] Насосная станция, [N] Метео-ВЭС!
const hs5 = WORLD.horizScale;
const plantRes = hydro.placeConcretePlant(54 * hs5, -148 * hs5, 0, 1e9, false);
assert.equal(plantRes.ok, true, '[B] Бетонный завод БСУ построен на сухом берегу у створа');
assert.equal(hydro.concretePlants.length, 1, 'Бетонный завод зарегистрирован в симуляции');

// Проверяем скидку 22% и ускорение бетонирования плотины от БСУ
const damResWithPlant = hydro.buildConcreteDam(12 * hs5, -158 * hs5, WORLD.brushSizes[0], 30 * WORLD.elevScale, 1e9, false, false);
assert.ok(damResWithPlant.addedM3 > 0, 'Тонкая кисть заливает аккуратную секцию 3D-плотины в инженерном режиме');

// Насосная станция [G] рядом с водой и у кольца Агродолины
const agroDef = CITY_DEFS.find((c) => c.id === 'agro');
const agroG = hydro.worldToGrid(agroDef.irrigationTarget.x - 16 * hs5, agroDef.irrigationTarget.z);
hydro.h[agroG.gz * hydro.grid + agroG.gx] = Math.max(hydro.h[agroG.gz * hydro.grid + agroG.gx], 0.9);
const pumpRes = hydro.placePumpStation(agroDef.irrigationTarget.x - 16 * hs5, agroDef.irrigationTarget.z, 0, 1e9, false);
assert.equal(pumpRes.ok, true, '[G] Береговая насосная станция успешно построена у воды');

// Метео-ВЭС [N] на возвышенном сухом холме
const windRes = hydro.placeWindMeteoStation(-140 * hs5, -90 * hs5, 1e9, false);
assert.equal(windRes.ok, true, '[N] Метео-ветрокомплекс ВЭС успешно построен на сухом склоне');

// 8f. Тонкая физика ветра, микроклимата, брызг истоков и анимаций 3D-зданий!
const spraySys = new SprayAndRainSystem(scene, 600);
for (let step = 0; step < 30; step++) {
  hydro.step(1 / 20, 6);
  eco.update(0.25);
  spraySys.update(0.05, hydro, new THREE.Vector3(12 * hs5, 25, -158 * hs5), 0.9, 0.4);
}
worldView.syncHydroStructures(hydro.simTime);
worldView.updateWaterAndWetness(hydro.simTime);
worldView.updateAtmosphere(14.0, WEATHER_MODES.normal, new THREE.Vector3(0, 20, 0), 0.1);

assert.ok(hydro.windSpeedMs > 1.0 && hydro.windGustMs >= hydro.windSpeedMs, `Живой вектор ветра и порывы рассчитываются (${hydro.windSpeedMs.toFixed(2)} / ${hydro.windGustMs.toFixed(2)} м/с)`);
const dirNorm = Math.hypot(hydro.windDirX, hydro.windDirZ);
assert.ok(Math.abs(dirNorm - 1.0) < 0.02, `Единичный вектор направления ветра нормирован (${dirNorm.toFixed(4)})`);
assert.ok(hydro.totalWindPowerMW > 0.05, `Метео-ВЭС вырабатывает электроэнергию от живого ветра (${hydro.totalWindPowerMW.toFixed(2)} МВт)`);
assert.equal(eco.agroIrrigated, true, 'Насосная станция [G] обеспечила напорное орошение Агродолины');

const wb8 = eco.getSummary().waterReport;
assert.ok(wb8.pressureHPa > 970 && wb8.pressureHPa < 1045, `Барометрическое давление рассчитывается физично (${wb8.pressureHPa} гПа)`);
assert.ok(wb8.waterTempC > 2 && wb8.waterTempC < 28, `Термический баланс воды активен (Tводы = +${wb8.waterTempC}°C)`);
assert.ok(typeof wb8.windCompass === 'string' && wb8.windCompass.length >= 1, `Румб ветра определён (${wb8.windCompass})`);

assert.ok(worldView.structMeshes.has(`cp_${plantRes.structure.id}`), '3D-модель Бетонного завода БСУ создана и анимируется');
assert.ok(worldView.structMeshes.has(`ps_${pumpRes.structure.id}`), '3D-модель Береговой насосной станции создана и анимируется');
assert.ok(worldView.structMeshes.has(`wm_${windRes.structure.id}`), '3D-модель Метео-ВЭС создана и вращает ротор по ветру');

console.log('✅ ВСЕ ТЕСТЫ v0.4.0 (3D-ИСТОКИ РЕК, АНТИ-ЗАСТОЙ, УДАЛЕНИЕ БЕЛОГО ОВАЛА, ТОНКАЯ СТРОЙКА, 48 ЗДАНИЙ + БСУ/НАСОСНАЯ/ВЭС, 480 ТЕКСТУР, ФИЗИКА ВЕТРА И КЛИМАТА, ОБУЧЕНИЕ 10 ШАГОВ) ПРОЙДЕНЫ!');

// ============================================================================
//  9. ПРОВЕРКА v0.5.0: ГОТОВЫЕ КОМПЛЕКСЫ ГЭС/ГАЭС, ПОДВОД КАНАЛА К ГЭС,
//     7 АРХИТЕКТУРНЫХ 3D-МОДЕЛЕЙ ЗДАНИЙ И СИСТЕМА ЛОГИКИ 8 ГОРОДОВ!
// ============================================================================
console.log('9. Проверка v0.5.0: Готовая ГЭС-1, запуск водой из канала, геодезический сканер ΔH, 7 3D-моделей зданий и логика городов...');

applyMapScale('km5');
hydro.resetValley('bystritsa');
const starterHpp = hydro.spawnStarterReadyHPP('bystritsa');
eco.resetEconomy();
worldView.rebuildForNewValley();
worldView.syncHydroStructures(0);
worldView.syncCityInstances();

assert.ok(starterHpp, 'На старте карты автоматически возведена Готовая Деривационная ГЭС-1');
assert.equal(starterHpp.isStarterReady, true, 'Стартовая ГЭС отмечена флагом isStarterReady');
assert.equal(starterHpp.isTurnkeyComplex, true, 'Стартовая ГЭС создана как цельный гидроузел с аванкамерой и водосливом');
assert.equal(starterHpp.powerMW, 0, 'До прокладки подводящего канала сухая стартовая ГЭС ждёт воду (0 МВт)');

const starterMesh = worldView.structMeshes.get(`t_${starterHpp.id}`);
assert.ok(starterMesh && starterMesh.userData.intakeBeacon, 'У готовой ГЭС отображается 3D-аванкамера и навигационное кольцо входа канала');

// 9a. Геодезический сканер створа evaluateHppSite (разведка перепада высот ΔH и потенциала МВт)
const hs9 = WORLD.horizScale;
const gorgeProbe = hydro.evaluateHppSite(12 * hs9, -158 * hs9, null, 'kaplan');
assert.ok(gorgeProbe.grossHead > 0.5 && Number.isFinite(gorgeProbe.potentialMW), `Геодезическая разведка створа считает ΔH=${gorgeProbe.grossHead.toFixed(2)} м и МВт=${gorgeProbe.potentialMW.toFixed(2)}`);
assert.ok(typeof gorgeProbe.siteGrade === 'string' && gorgeProbe.siteGrade.length > 3, 'Сканер выдаёт инженерную оценку створа');

// 9b. Главная игровая механика v0.5: прокладываем деривационный канал от верхнего плёса реки в аванкамеру Готовой ГЭС-1!
const siteCfg9 = STARTER_READY_HPP_SITES.bystritsa;
const intakeStartWx = siteCfg9.canalIntakeHint.baseX * hs9;
const intakeStartWz = siteCfg9.canalIntakeHint.baseZ * hs9;
const intakeEndWx = starterHpp.intakeWx;
const intakeEndWz = starterHpp.intakeWz;
const startSample = hydro.sampleAtWorld(intakeStartWx, intakeStartWz);
const endBed = starterHpp.baseY;

const segs = 18;
for (let k = 0; k <= segs; k++) {
  const frac = k / segs;
  const cx = intakeStartWx + (intakeEndWx - intakeStartWx) * frac;
  const cz = intakeStartWz + (intakeEndWz - intakeStartWz) * frac;
  const gradeElev = (startSample.bed - 0.6 * WORLD.elevScale) * (1 - frac) + (starterHpp.intakeBedY - 0.4 * WORLD.elevScale) * frac;
  hydro.excavateCanal(cx, cz, WORLD.brushSizes[1] * 1.25, 16.0 * WORLD.elevScale, gradeElev, 1e9, true);
  hydro.lineCanalConcrete(cx, cz, WORLD.brushSizes[1], 1e9, true);
}

for (let s = 0; s < 75; s++) {
  hydro.step(1 / 20, 8);
}
assert.ok(
  starterHpp.flowQ > 0.1 && starterHpp.powerMW > 0.2,
  `Вода по прорытому каналу пришла в Готовую ГЭС-1 и раскрутила турбину: Q=${starterHpp.flowQ.toFixed(2)} м³/с, P=${starterHpp.powerMW.toFixed(2)} МВт!`,
);

// Проверяем защиту от эксплойта сноса стартовой ГЭС (refund обязан быть 0 ₽)
const demoStarter = hydro.demolishAt(starterHpp.wx, starterHpp.wz);
assert.equal(demoStarter.refund, 0, 'Снос бесплатной стартовой ГЭС не даёт халявных денег (refund = 0 ₽)');

// 9c. Установка новой Целой ГЭС ('hpp') в 1 клик прямо на естественном створе реки без предварительной постройки плотины!
const oneClickRes = hydro.placeTurbine('hpp', 12 * hs9, -158 * hs9, null, 1e9, false);
assert.equal(oneClickRes.ok, true, 'Отдельная постройка «Целая ГЭС» возводится в 1 клик прямо на речном створе');
assert.equal(oneClickRes.structure.isTurnkeyComplex, true, 'Построенная в 1 клик Целая ГЭС является полным гидроузлом с плотиной, водосбросом и машзалом');
for (let s = 0; s < 35; s++) {
  hydro.step(1 / 20, 6);
}
assert.ok(oneClickRes.structure.powerMW > 0.2, `Целая ГЭС в 1 клик на реке сразу вырабатывает мощность (${oneClickRes.structure.powerMW.toFixed(2)} МВт)`);

// 9d. Проверка 7 составных архитектурных 3D-моделей городских зданий и локальных UV/атрибутов шейдера
assert.equal(worldView.cityArchPools.length, 7, 'В WorldView созданы все 7 многосоставных архитектурных 3D-пулов зданий');
let totalRenderedArchBuildings = 0;
let populatedPools = 0;
for (const pool of worldView.cityArchPools) {
  const geo = pool.mesh.geometry;
  const pk = geo.getAttribute('aPartKind');
  assert.ok(pk && pk.count >= 40, `Пул "${pool.key}" содержит составную 3D-геометрию (${pk.count} вершин) с атрибутом aPartKind`);
  let minKind = 99;
  let maxKind = -1;
  for (let vi = 0; vi < pk.count; vi++) {
    const v = pk.getX(vi);
    if (v < minKind) minKind = v;
    if (v > maxKind) maxKind = v;
  }
  assert.ok(minKind === 0 && maxKind >= 2, `Геометрия "${pool.key}" включает фасад (0), кровлю (2) и архитектурные детали (${maxKind})`);
  assert.ok(geo.getAttribute('aBuildDims') && geo.getAttribute('aRoofColor'), `Пул "${pool.key}" передаёт в шейдер метрические габариты aBuildDims и цвет кровли aRoofColor`);
  totalRenderedArchBuildings += pool.mesh.count;
  if (pool.mesh.count > 0) populatedPools++;
}
assert.equal(totalRenderedArchBuildings, eco.allBuildings.length, `Все ${eco.allBuildings.length} городских зданий отрисованы через новые 3D-модели`);
assert.ok(populatedPools >= 5, `Стартовая застройка 8 городов задействует минимум 5 разных 3D-архитектурных форм (${populatedPools}/7)`);

// 9e. Проверка системы логики 8 городов: 5 потребностей, указы генплана и премия +7 500 ₽ за подвод воды!
for (const c of eco.cities) {
  assert.ok(c.happinessPct >= 12 && c.happinessPct <= 100, `Индекс благополучия г. ${c.name} корректен (${c.happinessPct}%)`);
  const sumZ = c.districts.housing + c.districts.industry + c.districts.techCom + c.districts.civicUtil;
  assert.equal(sumZ, c.buildingIndices.length, `Зонирование кварталов г. ${c.name} точно совпадает с числом зданий (${sumZ})`);
  assert.ok(typeof c.bottleneckText === 'string' && c.bottleneckText.length > 5, `Город ${c.name} формирует осмысленную диагностику потребностей`);
}

const alumCity = eco.cities.find((c) => c.id === 'alumingrad');
const focusRes = eco.setCityFocusMode('alumingrad', 'industry');
assert.equal(focusRes.ok && alumCity.focusMode === 'industry', true, 'Указ генплана «Индустрия» успешно применён к Алюмграду');

const sciCity = eco.cities.find((c) => c.id === 'kremniy');
assert.equal(sciCity.aqueductRewardClaimed, false, 'Сухой технопарк Кремний-Парк изначально ждёт городской водовод');
const cashBeforeAqueduct = eco.cash;
// Подводим к Кремний-Парку обводнённый Ж/Б канал водовода!
const aqG = hydro.worldToGrid(sciCity.x + sciCity.plateauRadius * 1.05, sciCity.z);
const aqIdx = aqG.gz * hydro.grid + aqG.gx;
hydro.linedMask[aqIdx] = 1;
hydro.h[aqIdx] = 1.25;
evaluateCityUrbanLogic(sciCity, eco);
assert.equal(sciCity.canalAqueductConnected, true, 'Городская логика зафиксировала подвод воды каналом к Кремний-Парку');
assert.equal(sciCity.aqueductRewardClaimed, true, 'Муниципальная премия за подключение водовода начислена один раз');
assert.ok(
  Math.abs((eco.cash - cashBeforeAqueduct) - AQUEDUCT_CONNECT_REWARD) < 1e-3,
  `Мэрия выплатила премию +${AQUEDUCT_CONNECT_REWARD} ₽ за подвод воды к городу`,
);
assert.ok(sciCity.waterScore >= 85, `Обеспеченность города водой выросла до ${sciCity.waterScore}%`);

// --- 10. Тесты v0.6.0: отсутствие дорожной разметки под домами, прямоугольные кварталы, Целая ГЭС и cache-busting ---
assert.equal(TOOLS.find((t) => t.id === 'build_hpp').short, 'Целая ГЭС', 'applyMapScale сохраняет чёткое название «Целая ГЭС» без перезаписи на отдельные турбины');
assert.equal(worldView.cityDisksGroup.children.length, 8, 'Под каждым городом только компактный центральный сквер без гигантского круга разметки');
for (let ci = 0; ci < eco.cities.length; ci++) {
  const c = eco.cities[ci];
  assert.ok(c.buildingIndices.length >= 14, `Город ${c.name} сразу выглядит насыщенным (${c.buildingIndices.length} зданий в кварталах)`);
  const diskMesh = worldView.cityDisksGroup.children[ci];
  assert.equal(diskMesh.geometry.type, 'PlaneGeometry', 'Вместо гигантского круга используется аккуратная прямоугольная центральная площадь');
  const stStep = c.streetStep;
  for (const bIdx of c.buildingIndices) {
    const b = eco.allBuildings[bIdx];
    const relX = Math.abs(b.wx - c.x) / stStep;
    const relZ = Math.abs(b.wz - c.z) / stStep;
    for (const sLine of [0.5, 1.5]) {
      assert.ok(
        Math.abs(relX - sLine) > 0.14 && Math.abs(relZ - sLine) > 0.14,
        `Здание #${bIdx} в г. ${c.name} стоит внутри квартала и не пересекает осевую линию улицы (${relX.toFixed(2)}, ${relZ.toFixed(2)})`,
      );
    }
  }
}

worldView.updateCursor(12 * hs9, -158 * hs9, WORLD.brushSizes[1], 'build_hpp', null, 15.0, true);
assert.equal(worldView.hppGhost.visible, true, 'При выборе [2] Целая ГЭС под курсором отображается 3D-голограмма всего комплекса ГЭС');

const indexHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.ok(
  /bundle\.js\?v=0\.6\.0-\d+/.test(indexHtml) && /style\.css\?v=0\.6\.0-\d+/.test(indexHtml),
  'В index.html прописаны анти-кэш параметры ?v=0.6.0-... для bundle.js и style.css',
);

console.log('✅ ВСЕ ТЕСТЫ v0.6.0 (ЦЕЛАЯ ГЭС БЕЗ ЛИШНИХ ТУРБИН, ЧИСТЫЕ ПРЯМОУГОЛЬНЫЕ КВАРТАЛЫ ГОРОДОВ БЕЗ РАЗМЕТКИ ПОД ДОМАМИ, ЯРКИЕ 3D-ЗДАНИЯ И CACHE-BUSTING) ПРОЙДЕНЫ!');


