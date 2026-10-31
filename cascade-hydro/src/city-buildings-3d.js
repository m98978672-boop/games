// ============================================================================
//  СОСТАВНЫЕ АРХИТЕКТУРНЫЕ 3D-МОДЕЛИ ГОРОДСКИХ ЗДАНИЙ (60 FPS InstancedMesh)
//  Вместо простых «коробок» каждый класс зданий имеет детализированную
//  многообъёмную геометрию с цоколем, ризалитами, балконами, скатными/арочными
//  кровлями, слуховыми окнами, лифтовыми будками, чиллерами и шпилями!
//
//  Вершинный атрибут aPartKind кодирует тип архитектурного элемента:
//    0.0 — основной фасад с окнами (в локальных метрах без искажений при повороте!)
//    1.0 — цокольный этаж / каменный стилобат / витрины первых этажей
//    2.0 — скатная черепичная, фальцевая или арочная сводчатая кровля
//    3.0 — карнизы, пилястры, плиты балконов, вентшахты, трубы и шпили
// ============================================================================

import * as THREE from 'three';

function makeBoxPart(sx, sy, sz, tx, ty, tz, partKind, uvRepeatX = 1, uvRepeatY = 1) {
  const g = new THREE.BoxGeometry(sx, sy, sz).toNonIndexed();
  g.translate(tx, ty, tz);
  return tagPartGeometry(g, partKind, uvRepeatX, uvRepeatY);
}

function makePrismGableRoof(width, height, depth, baseY, partKind = 2.0) {
  // Треугольная двускатная крыша вдоль оси X (фронтоны спереди/сзади по Z или слева/справа по X)
  const hw = width * 0.5;
  const hd = depth * 0.5;
  const y0 = baseY;
  const y1 = baseY + height;

  // Конёк идёт вдоль оси X (длинная сторона здания), скаты смотрят на +Z и -Z
  const positions = new Float32Array([
    // Передний скат (+Z)
    -hw, y0,  hd,   hw, y0,  hd,   hw, y1, 0,
    -hw, y0,  hd,   hw, y1,   0,  -hw, y1, 0,
    // Задний скат (-Z)
     hw, y0, -hd,  -hw, y0, -hd,  -hw, y1, 0,
     hw, y0, -hd,  -hw, y1,   0,   hw, y1, 0,
    // Левый фронтон (-X)
    -hw, y0, -hd,  -hw, y0,  hd,  -hw, y1, 0,
    // Правый фронтон (+X)
     hw, y0,  hd,   hw, y0, -hd,   hw, y1, 0,
    // Нижний подшив свесов
    -hw, y0, -hd,   hw, y0, -hd,   hw, y0, hd,
    -hw, y0, -hd,   hw, y0,  hd,  -hw, y0, hd,
  ]);

  const uvs = new Float32Array([
    0, 0,  1, 0,  1, 1,
    0, 0,  1, 1,  0, 1,
    0, 0,  1, 0,  1, 1,
    0, 0,  1, 1,  0, 1,
    0, 0,  1, 0,  0.5, 1,
    0, 0,  1, 0,  0.5, 1,
    0, 0,  1, 0,  1, 1,
    0, 0,  1, 1,  0, 1,
  ]);

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  g.computeVertexNormals();

  const vertCount = positions.length / 3;
  const kinds = new Float32Array(vertCount).fill(partKind);
  // Фронтонные треугольники окрашиваем как фасад/карниз, чтобы они гармонировали со стенами!
  for (let v = 12; v < 18; v++) kinds[v] = 0.0;
  for (let v = 18; v < vertCount; v++) kinds[v] = 3.0;
  g.setAttribute('aPartKind', new THREE.BufferAttribute(kinds, 1));
  return g;
}

function tagPartGeometry(nonIndexedGeo, partKind, uvScaleX = 1, uvScaleY = 1) {
  const pos = nonIndexedGeo.getAttribute('position');
  let uv = nonIndexedGeo.getAttribute('uv');
  if (!uv) {
    const arr = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      arr[i * 2] = pos.getX(i) + 0.5;
      arr[i * 2 + 1] = pos.getY(i);
    }
    uv = new THREE.BufferAttribute(arr, 2);
    nonIndexedGeo.setAttribute('uv', uv);
  } else if (uvScaleX !== 1 || uvScaleY !== 1) {
    uv = uv.clone();
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, uv.getX(i) * uvScaleX, uv.getY(i) * uvScaleY);
    }
    nonIndexedGeo.setAttribute('uv', uv);
  }
  if (!nonIndexedGeo.getAttribute('normal')) {
    nonIndexedGeo.computeVertexNormals();
  }
  const kinds = new Float32Array(pos.count).fill(partKind);
  nonIndexedGeo.setAttribute('aPartKind', new THREE.BufferAttribute(kinds, 1));
  return nonIndexedGeo;
}

function mergeArchitecturalParts(geos) {
  let totalVerts = 0;
  for (const g of geos) totalVerts += g.getAttribute('position').count;

  const posOut = new Float32Array(totalVerts * 3);
  const normOut = new Float32Array(totalVerts * 3);
  const uvOut = new Float32Array(totalVerts * 2);
  const kindOut = new Float32Array(totalVerts);

  let offset = 0;
  for (const g of geos) {
    const p = g.getAttribute('position');
    const n = g.getAttribute('normal');
    const u = g.getAttribute('uv');
    const k = g.getAttribute('aPartKind');
    const cnt = p.count;

    posOut.set(p.array.subarray(0, cnt * 3), offset * 3);
    normOut.set(n.array.subarray(0, cnt * 3), offset * 3);
    uvOut.set(u.array.subarray(0, cnt * 2), offset * 2);
    kindOut.set(k.array.subarray(0, cnt), offset);
    offset += cnt;
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(posOut, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normOut, 3));
  merged.setAttribute('uv', new THREE.BufferAttribute(uvOut, 2));
  merged.setAttribute('aPartKind', new THREE.BufferAttribute(kindOut, 1));
  merged.computeBoundingSphere();
  return merged;
}

/**
 * 1. ДВУСКАТНЫЙ ДОМ / КОТТЕДЖ / СТАРЫЙ ПОСАД / УСАДЬБА (gable)
 * Каменный цоколь + крыльцо с козырьком + эркер + двускатная кровля со свесами, кукушкой и печной трубой!
 */
export function createGableHouseGeometry() {
  const gardenCrown = new THREE.SphereGeometry(0.13, 8, 6).toNonIndexed();
  gardenCrown.scale(1.0, 1.18, 1.0);
  gardenCrown.translate(-0.34, 0.28, 0.50);

  const parts = [
    // Каменный цоколь и мощёный дворик
    makeBoxPart(0.98, 0.14, 0.94, 0, 0.07, 0, 1.0),
    // Основной сруб/кирпичный объём + боковое крыло-веранда
    makeBoxPart(0.86, 0.56, 0.78, 0.04, 0.42, -0.02, 0.0),
    makeBoxPart(0.36, 0.42, 0.52, -0.32, 0.35, -0.06, 0.0),
    makePrismGableRoof(0.42, 0.18, 0.58, 0.56, 2.0),
    // Выступающий ризалит / эркер на главном фасаде (+Z)
    makeBoxPart(0.34, 0.54, 0.18, 0.08, 0.41, 0.43, 0.0),
    makePrismGableRoof(0.40, 0.16, 0.24, 0.68, 2.0),
    // Входное крыльцо с белыми колоннами и козырьком
    makeBoxPart(0.26, 0.09, 0.20, 0.30, 0.045, 0.47, 1.0),
    makeBoxPart(0.04, 0.24, 0.04, 0.21, 0.20, 0.54, 3.0),
    makeBoxPart(0.04, 0.24, 0.04, 0.39, 0.20, 0.54, 3.0),
    makeBoxPart(0.30, 0.045, 0.24, 0.30, 0.33, 0.48, 2.0),
    // Светлый карнизный пояс
    makeBoxPart(0.92, 0.04, 0.84, 0.04, 0.69, -0.02, 3.0),
    // Высокая выразительная двускатная черепичная крыша с коньком
    makePrismGableRoof(0.98, 0.36, 0.92, 0.70, 2.0),
    makeBoxPart(1.00, 0.035, 0.055, 0.04, 1.06, -0.02, 3.0),
    // Слуховое мансардное окно (кукушка)
    makeBoxPart(0.24, 0.14, 0.24, -0.12, 0.84, 0.22, 0.0),
    makePrismGableRoof(0.28, 0.10, 0.28, 0.91, 2.0),
    // Печная труба + пышное садовое дерево у дома
    makeBoxPart(0.09, 0.26, 0.09, 0.28, 0.96, -0.16, 3.0),
    makeBoxPart(0.05, 0.16, 0.05, -0.34, 0.15, 0.50, 1.0),
    tagPartGeometry(gardenCrown, 4.0),
  ];
  return mergeArchitecturalParts(parts);
}

/**
 * 2. ГОРОДСКОЙ КВАРТАЛ С МАНСАРДОЙ, ВИТРИНАМИ, РИЗАЛИТАМИ И ЗЕЛЁНЫМ ДВОРОМ (flat / mid)
 */
export function createMidblockUrbanGeometry() {
  const courtTree = new THREE.SphereGeometry(0.14, 8, 6).toNonIndexed();
  courtTree.translate(0.0, 0.28, -0.26);

  const parts = [
    // Гранитный первый этаж-стилобат с тёплыми витринами и входным порталом
    makeBoxPart(1.00, 0.18, 0.98, 0, 0.09, 0, 1.0),
    makeBoxPart(0.34, 0.04, 0.18, 0, 0.185, 0.54, 3.0),
    // П-образный периметральный городской корпус с уютным зелёным двором!
    makeBoxPart(0.96, 0.68, 0.42, 0, 0.52, 0.24, 0.0),
    makeBoxPart(0.30, 0.68, 0.50, -0.33, 0.52, -0.18, 0.0),
    makeBoxPart(0.30, 0.68, 0.50,  0.33, 0.52, -0.18, 0.0),
    // Выразительные белые балконы и пилястры на уличном фасаде
    makeBoxPart(0.28, 0.03, 0.12, -0.26, 0.38, 0.49, 3.0),
    makeBoxPart(0.28, 0.03, 0.12,  0.26, 0.38, 0.49, 3.0),
    makeBoxPart(0.28, 0.03, 0.12, -0.26, 0.58, 0.49, 3.0),
    makeBoxPart(0.28, 0.03, 0.12,  0.26, 0.58, 0.49, 3.0),
    makeBoxPart(0.28, 0.03, 0.12, -0.26, 0.76, 0.49, 3.0),
    makeBoxPart(0.28, 0.03, 0.12,  0.26, 0.76, 0.49, 3.0),
    // Белокаменный венчающий карниз + мансардная вальмовая/скатная кровля на уличном корпусе!
    makeBoxPart(1.00, 0.04, 0.46, 0, 0.87, 0.24, 3.0),
    makePrismGableRoof(0.98, 0.16, 0.46, 0.89, 2.0),
    makeBoxPart(0.32, 0.035, 0.52, -0.33, 0.87, -0.18, 3.0),
    makeBoxPart(0.32, 0.035, 0.52,  0.33, 0.87, -0.18, 3.0),
    // Солнечные панели и лифтовая будка + зелёное дерево во дворе
    makeBoxPart(0.22, 0.08, 0.22, -0.33, 0.92, -0.18, 5.0),
    makeBoxPart(0.22, 0.08, 0.22,  0.33, 0.92, -0.18, 3.0),
    tagPartGeometry(courtTree, 4.0),
  ];
  return mergeArchitecturalParts(parts);
}

/**
 * 3. КАСКАДНО-ТЕРРАСНЫЙ ЭКО-КОМПЛЕКС / ГРАНД-ОТЕЛЬ / РЕЧНОЙ ВОКЗАЛ (step)
 */
export function createSteppedTerraceGeometry() {
  const parts = [
    makeBoxPart(1.02, 0.18, 1.00, 0, 0.09, 0, 1.0),
    makeBoxPart(0.98, 0.22, 0.94, 0, 0.29, 0, 0.0),
    makeBoxPart(1.02, 0.035, 0.98, 0, 0.405, 0, 3.0),
    // Пышный зелёный сад на террасе первого уступа!
    makeBoxPart(0.90, 0.05, 0.22, 0, 0.44, 0.34, 4.0),
    // Средний уступ со смещением
    makeBoxPart(0.76, 0.32, 0.72, -0.05, 0.57, -0.08, 0.0),
    makeBoxPart(0.80, 0.035, 0.76, -0.05, 0.735, -0.08, 3.0),
    makeBoxPart(0.68, 0.045, 0.18, -0.05, 0.77, 0.18, 4.0),
    // Верхний панорамный пентхаус со стеклянным фонарём
    makeBoxPart(0.50, 0.22, 0.48, -0.10, 0.855, -0.14, 0.0),
    makeBoxPart(0.56, 0.035, 0.54, -0.10, 0.98, -0.14, 2.0),
    makeBoxPart(0.32, 0.07, 0.30, -0.10, 1.03, -0.14, 5.0),
  ];
  return mergeArchitecturalParts(parts);
}

/**
 * 4. ВЫСОТНЫЙ НЕБОСКРЁБ / БИЗНЕС-ЦЕНТР / ИНСТИТУТ / ГИПЕРСКЕЙЛ БАШНЯ (tower)
 */
export function createSkyscraperTowerGeometry() {
  const spire = new THREE.CylinderGeometry(0.014, 0.036, 0.18, 6).toNonIndexed();
  spire.translate(0, 1.09, 0);

  const parts = [
    // Широкий входной атриум-подиум с озеленением стилобата
    makeBoxPart(1.04, 0.13, 1.04, 0, 0.065, 0, 1.0),
    makeBoxPart(0.46, 0.03, 0.24, 0, 0.135, 0.56, 3.0),
    makeBoxPart(0.96, 0.03, 0.14, 0, 0.14, 0.44, 4.0),
    // Стеклянный ствол небоскрёба с белоснежными вертикальными пилонами
    makeBoxPart(0.80, 0.62, 0.80, 0, 0.44, 0, 0.0),
    makeBoxPart(0.90, 0.62, 0.14, 0, 0.44,  0.36, 3.0),
    makeBoxPart(0.90, 0.62, 0.14, 0, 0.44, -0.36, 3.0),
    makeBoxPart(0.14, 0.62, 0.90,  0.36, 0.44, 0, 3.0),
    makeBoxPart(0.14, 0.62, 0.90, -0.36, 0.44, 0, 3.0),
    // Технический пояс + сужающаяся светящаяся корона + высокий шпиль
    makeBoxPart(0.86, 0.035, 0.86, 0, 0.765, 0, 3.0),
    makeBoxPart(0.64, 0.17, 0.64, 0, 0.865, 0, 0.0),
    makeBoxPart(0.68, 0.03, 0.68, 0, 0.96, 0, 3.0),
    makeBoxPart(0.42, 0.065, 0.42, 0, 1.005, 0, 5.0),
    tagPartGeometry(spire, 3.0),
  ];
  return mergeArchitecturalParts(parts);
}

/**
 * 5. АРОЧНЫЙ ПАВИЛЬОН / АРЕНА / ПОРТОВЫЙ ТЕРМИНАЛ / ТЕПЛИЦА / ЦЕХ (arch)
 */
export function createArchedPavilionGeometry() {
  const vault = new THREE.CylinderGeometry(0.47, 0.47, 0.98, 12, 1, false, 0, Math.PI).toNonIndexed();
  vault.rotateZ(Math.PI * 0.5);
  vault.rotateY(Math.PI * 0.5);
  vault.scale(1.0, 0.70, 1.0);
  vault.translate(0, 0.56, 0);

  const parts = [
    makeBoxPart(1.00, 0.15, 1.00, 0, 0.075, 0, 1.0),
    makeBoxPart(0.96, 0.44, 0.90, 0, 0.36, 0, 0.0),
    makeBoxPart(0.09, 0.56, 1.02, -0.34, 0.28, 0, 3.0),
    makeBoxPart(0.09, 0.56, 1.02,  0.00, 0.28, 0, 3.0),
    makeBoxPart(0.09, 0.56, 1.02,  0.34, 0.28, 0, 3.0),
    tagPartGeometry(vault, 2.0, 2, 1),
    // Верхний остеклённый зенитный фонарь
    makeBoxPart(0.80, 0.085, 0.20, 0, 0.91, 0, 5.0),
  ];
  return mergeArchitecturalParts(parts);
}

/**
 * 6. РАТУША / УНИВЕРСИТЕТ / СОБОРНЫЙ ШПИЛЬ С КОЛОННАДОЙ И СКВЕРОМ (spire)
 */
export function createSpireMonumentGeometry() {
  const octagon = new THREE.CylinderGeometry(0.28, 0.32, 0.34, 8).toNonIndexed();
  octagon.translate(0, 0.65, 0);

  const dome = new THREE.SphereGeometry(0.29, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5).toNonIndexed();
  dome.scale(1.0, 0.76, 1.0);
  dome.translate(0, 0.82, 0);

  const needle = new THREE.ConeGeometry(0.048, 0.26, 6).toNonIndexed();
  needle.translate(0, 1.09, 0);

  const parts = [
    makeBoxPart(1.00, 0.14, 1.00, 0, 0.07, 0, 1.0),
    makeBoxPart(0.90, 0.36, 0.86, 0, 0.32, -0.02, 0.0),
    // Классический 4-колонный портик с фронтоном + парковые газоны по бокам
    makeBoxPart(0.46, 0.05, 0.20, 0, 0.14, 0.48, 1.0),
    makeBoxPart(0.05, 0.30, 0.05, -0.17, 0.31, 0.54, 3.0),
    makeBoxPart(0.05, 0.30, 0.05, -0.06, 0.31, 0.54, 3.0),
    makeBoxPart(0.05, 0.30, 0.05,  0.06, 0.31, 0.54, 3.0),
    makeBoxPart(0.05, 0.30, 0.05,  0.17, 0.31, 0.54, 3.0),
    makePrismGableRoof(0.50, 0.12, 0.24, 0.46, 2.0),
    makeBoxPart(0.18, 0.10, 0.18, -0.36, 0.18, 0.46, 4.0),
    makeBoxPart(0.18, 0.10, 0.18,  0.36, 0.18, 0.46, 4.0),
    makeBoxPart(0.94, 0.035, 0.90, 0, 0.49, -0.02, 3.0),
    tagPartGeometry(octagon, 0.0, 2, 1),
    tagPartGeometry(dome, 2.0, 2, 1),
    tagPartGeometry(needle, 3.0),
  ];
  return mergeArchitecturalParts(parts);
}

/**
 * 7. ПРОМЫШЛЕННЫЙ СИЛОСНЫЙ КОМПЛЕКС / ГРАДИРНЯ / МЕТАЛЛУРГИЧЕСКИЙ ЦЕХ С ТРУБОЙ (cyl / cool)
 */
export function createIndustrialSiloClusterGeometry() {
  const cylL = new THREE.CylinderGeometry(0.22, 0.25, 0.80, 12).toNonIndexed();
  cylL.translate(-0.24, 0.48, 0.04);

  const cylR = new THREE.CylinderGeometry(0.22, 0.25, 0.80, 12).toNonIndexed();
  cylR.translate(0.16, 0.48, 0.04);

  const capL = new THREE.ConeGeometry(0.24, 0.10, 12).toNonIndexed();
  capL.translate(-0.24, 0.93, 0.04);

  const capR = new THREE.ConeGeometry(0.24, 0.10, 12).toNonIndexed();
  capR.translate(0.16, 0.93, 0.04);

  const stack = new THREE.CylinderGeometry(0.055, 0.085, 1.06, 8).toNonIndexed();
  stack.translate(0.36, 0.58, -0.22);

  const parts = [
    makeBoxPart(0.98, 0.11, 0.78, 0, 0.055, 0, 1.0),
    tagPartGeometry(cylL, 0.0, 2, 1),
    tagPartGeometry(cylR, 0.0, 2, 1),
    tagPartGeometry(capL, 2.0),
    tagPartGeometry(capR, 2.0),
    tagPartGeometry(stack, 5.0),
    makeBoxPart(0.66, 0.09, 0.22, -0.04, 0.91, 0.04, 3.0),
    makeBoxPart(0.14, 0.62, 0.20, -0.04, 0.40, 0.04, 3.0),
  ];
  return mergeArchitecturalParts(parts);
}
