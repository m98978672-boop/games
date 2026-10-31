import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';

import { WORLD, QUALITY_PROFILES, WEATHER_MODES } from '../src/config.js';
import { HydroSimulation } from '../src/hydro.js';
import { EconomyAndCities } from '../src/economy.js';
import { buildAllProceduralTextures } from '../src/textures.js';
import {
  createValleyTerrainMaterial,
  createRealisticWaterMaterial,
  createCityFacadeMaterial,
} from '../src/water-shader.js';
import { WorldView } from '../src/world-view.js';
import { TutorialController } from '../src/tutorial.js';

// ============================================================================
//  0. ПРОВЕРКА ВСЕХ DOM ID МЕЖДУ index.html И JS-МОДУЛЯМИ
// ============================================================================
console.log('0. Проверка согласованности всех DOM ID между index.html и src/*.js...');
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
console.log(`   OK! Все ${htmlIds.size} DOM-элементов интерфейса проверены.`);

// ============================================================================
//  1. ПРОВЕРКА ПРОЦЕДУРНЫХ ТЕКСТУР, ШЕЙДЕРОВ И 3D WORLD-VIEW
// ============================================================================
console.log('1. Проверка процедурных PBR-текстур, GLSL-шейдеров и объёмного 3D WorldView...');

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
    const el = {
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
    return el;
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
  texSet.waterDetail && texSet.concreteMap && texSet.concreteBump && texSet.rebarFormwork && texSet.steel && texSet.roof,
  'Все процедурные PBR-текстуры созданы',
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
const bMat = createCityFacadeMaterial(texSet.roof);
checkGlslBalanced('terrain.vert', tMat.vertexShader);
checkGlslBalanced('terrain.frag', tMat.fragmentShader);
checkGlslBalanced('water.vert', wMat.vertexShader);
checkGlslBalanced('water.frag', wMat.fragmentShader);
checkGlslBalanced('building.vert', bMat.vertexShader);
checkGlslBalanced('building.frag', bMat.fragmentShader);

// ============================================================================
//  2. ИНИЦИАЛИЗАЦИЯ КАРТЫ 768×768 М, ОБЪЁМНОЙ СТРОЙКИ И 3D WORLD-VIEW
// ============================================================================
console.log(`2. Инициализация увеличенной долины ${WORLD.size}×${WORLD.size} м и гидродинамики (208×208)...`);
assert.equal(WORLD.size, 768, 'Размер карты увеличен до 768×768 м');

const hydro = new HydroSimulation(208, 'bystritsa');
const eco = new EconomyAndCities(hydro);
const scene = new THREE.Scene();
const worldView = new WorldView(scene, hydro, eco, QUALITY_PROFILES.medium, null, texSet);

assert.equal(eco.cities.length, 5, 'В долине 5 саморазвивающихся городов');
assert.ok(hydro.totalWaterVolumeM3 > 2500, 'В 3 реках со старта течёт полноводный поток');
assert.ok(hydro.activeTileCount < hydro.totalTiles, 'Оптимизация активных тайлов пропускает сухие горы');

for (let i = 0; i < 40; i++) {
  hydro.step(1 / 60, 8);
}
for (let i = 0; i < hydro.count; i++) {
  assert.ok(Number.isFinite(hydro.h[i]) && hydro.h[i] >= 0, 'Глубина воды конечна и неотрицательна');
  assert.ok(Number.isFinite(hydro.u[i]) && Number.isFinite(hydro.v[i]), 'Скорости конечны');
}
console.log(`   OK! Время шага воды (208×208): ${hydro.lastStepMs.toFixed(2)} мс, активные тайлы: ${hydro.activeTileCount}/${hydro.totalTiles}`);

// ============================================================================
//  3. ПОЭТАПНАЯ ОБЪЁМНАЯ 3D-СТРОЙКА, КРАНЫ, КОНТРФОРСЫ, ВОДОВОД И ОРУ 110 кВ
// ============================================================================
console.log('3. Поэтапное объёмное бетонирование плотины в теснине (12, -158), контрфорсы, канал и ОРУ 110 кВ...');
for (let wx = -24; wx <= 48; wx += 4) {
  hydro.buildConcreteDam(wx, -158, 9.5, 38.5, 1e9, false, false);
}
assert.ok(hydro.activeBuildCells.length > 10, 'Секции плотины поставлены в очередь 3-этапного бетонирования с кранами');
assert.ok(hydro.pendingPourVolumeM3 > 100, 'Объём бетона к заливке рассчитан сразу при закладке');

// Проверяем 3D-призрак курсора и рендер активной опалубки с башенными кранами!
worldView.updateCursor(12, -158, 9.5, 'concrete_dam', 0, 11.2, true);
worldView.syncEngineeredVolumes();
worldView.animateConstructionCranes(1.2);
assert.ok(worldView.scaffoldingMesh.count > 0, '3D-инстансы опалубки с армокаркасом отрисованы во время заливки');
assert.ok(worldView.cranes[0].visible, '3D-башенный кран включён и вращает стрелу над стройплощадкой');

const reinfRes = hydro.reinforceFoundation(12, -158, 14, 1e9, true);
assert.ok(reinfRes.count > 4, 'Смонтированы скальные анкеры и 3D-контрфорсы');

const digRes = hydro.excavateCanal(-16, -45, 9, 3.8, 17.5, 1e9, true);
assert.ok(digRes.excavatedM3 > 80, 'Экскаватор вынул породу под канал');
assert.ok(hydro.soilStockpileM3 > 0, 'Пополнен отвал грунта');
const lineRes = hydro.lineCanalConcrete(-16, -45, 9, 1e9, true);
assert.ok(lineRes.count > 0, 'Железобетонный лоток с бортами уложен');

const swRes = hydro.placeSpillway(28, -158, Math.PI * 0.5, 1e9, true);
assert.equal(swRes.ok, true, 'Сегментный затвор водосброса установлен сбоку плотины');

const turbRes = hydro.placeTurbine('francis', 12, -158, Math.PI * 0.5, 1e9, true);
assert.equal(turbRes.ok, true, 'Гидроузел Фрэнсиса с 3D-водоводом установлен в створе');
turbRes.structure.autoDispatch = true;

const subRes = hydro.placeSubstation(48, -142, 1e9, true);
assert.equal(subRes.ok, true, 'Узловая 3D-подстанция ОРУ 110 кВ построена на сухом берегу');

for (const c of eco.cities) {
  if (!c.connected) eco.connectCityGrid(c.id);
}

const initialBuildings = eco.allBuildings.length;
const initialPop = eco.getSummary().totalPopulation;

for (let step = 0; step < 420; step++) {
  hydro.step(1 / 20, 8);
  eco.update(0.25);
}

const dirty = hydro.consumeTerrainDirty();
if (dirty) worldView.updateTerrainGeometryRect(dirty.x0, dirty.z0, dirty.x1, dirty.z1);
worldView.updateAtmosphere(eco.hour, WEATHER_MODES.normal);
worldView.updateWaterAndWetness(hydro.simTime);
worldView.syncEngineeredVolumes();
worldView.animateConstructionCranes(hydro.simTime);
worldView.syncHydroStructures();
worldView.syncCityInstances();

assert.equal(hydro.activeBuildCells.length, 0, 'Башенные краны завершили 3-этапную заливку 3D-монолита плотины');
assert.ok(worldView.damMonolithMesh.count > 10, '3D-блоки монолитного бетона плотины отрисованы');
assert.ok(worldView.buttressMesh.count > 0, '3D-контрфорсы плотины отрисованы');
assert.ok(worldView.canalCurbMesh.count > 0, '3D-железобетонные борта канала отрисованы');
assert.ok(worldView.structMeshes.has(`u_${subRes.structure.id}`), '3D-подстанция ОРУ 110 кВ с трансформаторами и порталами отрисована');
assert.ok(worldView.pylonMesh.count > 6, 'Опоры и провисающие провода ЛЭП 110 кВ протянуты к 5 городам');
assert.equal(eco.getSummary().gridLossPct, 3, 'Подстанция ОРУ 110 кВ снизила потери в сети до 3%');

console.log(`   Напор на турбине: ${turbRes.structure.netHead.toFixed(2)} м, расход Q: ${turbRes.structure.flowQ.toFixed(2)} м³/с, мощность: ${turbRes.structure.powerMW.toFixed(2)} МВт`);
console.log(`   Зданий в 5 городах: ${initialBuildings} -> ${eco.allBuildings.length}, население: ${initialPop} -> ${eco.getSummary().totalPopulation}`);
console.log(`   Казна: ${Math.round(eco.cash).toLocaleString('ru-RU')} ₽`);

assert.ok(turbRes.structure.powerMW > 0.8, 'Турбина вырабатывает мегаватты после завершения бетонирования плотины');
assert.ok(eco.allBuildings.length > initialBuildings, 'Города самостоятельно строят новые здания');
assert.ok(eco.getSummary().totalPopulation > initialPop, 'Население 5 городов растёт');

// ============================================================================
//  4. ПРОВЕРКА ПОШАГОВОГО ИНТЕРАКТИВНОГО ОБУЧЕНИЯ (8 ШАГОВ)
// ============================================================================
console.log('4. Проверка прохождения всех 8 шагов интерактивного обучения «Школа Гидростроителя»...');
const fakeGame = {
  selectedPresetId: 'bystritsa',
  showContours: true,
  hydro,
  economy: eco,
  worldView,
  camCtrl: {
    target: new THREE.Vector3(12, 18, -158),
    flyTo(x, z) { this.target.set(x, 18, z); },
  },
  audio: { playMilestone() {} },
  selectTool() {},
  notify() {},
};
// Прокладываем орошение в Агродолину, чтобы и шаг 8 сразу зачёлся!
hydro.excavateCanal(168, 98, 12, 3.0, null, 1e9, true);
const gAgro = hydro.worldToGrid(168, 98);
hydro.h[gAgro.gz * hydro.grid + gAgro.gx] = 1.6;
eco.update(3.0);

const tut = new TutorialController(fakeGame);
tut.start(0);
for (let guard = 0; guard < 16 && tut.active; guard++) {
  const curStep = tut._getSteps()[tut.stepIndex];
  if (curStep && curStep.target) {
    fakeGame.camCtrl.target.set(curStep.target.x, 18, curStep.target.z);
  }
  tut.update();
}
assert.equal(tut.completed, true, 'Все 8 интерактивных шагов обучения пройдены от разведки до орошения Агродолины');

// ============================================================================
//  5. ПРОВЕРКА СМЕНЫ КАРТ В ЗАГРУЗЧИКЕ («СЕВЕРНЫЕ ПОРОГИ» И «ЗЕРКАЛЬНАЯ ДЕЛЬТА»)
// ============================================================================
console.log('5. Проверка перестройки 3D-мира под карты «Северные Пороги» и «Зеркальная Дельта»...');
hydro.resetValley('rapids');
eco.resetEconomy();
worldView.rebuildForNewValley();
assert.ok(hydro.totalWaterVolumeM3 > 2000, 'Карта «Северные Пороги» и её 3D-деревья/города успешно перестроены');

hydro.resetValley('delta');
eco.resetEconomy();
worldView.rebuildForNewValley();
assert.ok(hydro.totalWaterVolumeM3 > 3000, 'Карта «Зеркальная Дельта» успешно наполнена полноводной рекой');

console.log('✅ ВСЕ ТЕСТЫ v2 (DOM, GLSL, ТЕКСТУРЫ, 768×768 М, 3D-СТРОЙКА, ТУТОРИАЛ, ОРУ 110 кВ, 5 ГОРОДОВ) ПРОЙДЕНЫ!');
