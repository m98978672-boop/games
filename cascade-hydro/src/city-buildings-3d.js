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
  const parts = [
    // Каменный цоколь
    makeBoxPart(0.96, 0.14, 0.92, 0, 0.07, 0, 1.0),
    // Основной сруб/кирпичный объём
    makeBoxPart(0.92, 0.56, 0.86, 0, 0.42, 0, 0.0),
    // Выступающий ризалит / эркер на главном фасаде (+Z)
    makeBoxPart(0.34, 0.52, 0.14, -0.18, 0.40, 0.46, 0.0),
    // Входное крыльцо со ступенями и навесом
    makeBoxPart(0.24, 0.09, 0.18, 0.22, 0.045, 0.49, 1.0),
    makeBoxPart(0.26, 0.04, 0.20, 0.22, 0.30, 0.49, 3.0),
    // Междуэтажный пояс-карниз
    makeBoxPart(0.96, 0.035, 0.90, 0, 0.69, 0, 3.0),
    // Настоящая двускатная крыша с карнизными свесами и коньком
    makePrismGableRoof(1.04, 0.30, 0.98, 0.70, 2.0),
    makeBoxPart(1.05, 0.03, 0.05, 0, 1.00, 0, 3.0),
    // Слуховое мансардное окно (кукушка) на скате
    makeBoxPart(0.22, 0.13, 0.22, -0.18, 0.81, 0.22, 0.0),
    makePrismGableRoof(0.26, 0.08, 0.26, 0.87, 2.0),
    // Кирпичная дымовая труба с оголовком
    makeBoxPart(0.09, 0.24, 0.09, 0.26, 0.93, -0.14, 3.0),
    makeBoxPart(0.12, 0.03, 0.12, 0.26, 1.05, -0.14, 3.0),
  ];
  return mergeArchitecturalParts(parts);
}

/**
 * 2. ГОРОДСКОЙ КВАРТАЛ С ВИТРИННЫМ СТИЛОБАТОМ, ЛОДЖИЯМИ И КРОВЕЛЬНЫМ ТЕХЭТАЖОМ (flat / mid)
 * Первый коммерческий этаж с аркадой + ризалиты + пояса балконов + парапет + лифтовая будка и чиллеры!
 */
export function createMidblockUrbanGeometry() {
  const parts = [
    // Расширенный первый этаж-стилобат с витринами и входным козырьком
    makeBoxPart(1.00, 0.17, 0.98, 0, 0.085, 0, 1.0),
    makeBoxPart(0.32, 0.035, 0.16, 0, 0.175, 0.53, 3.0),
    // Основной корпус и два симметричных боковых ризалита (придают пластику фасаду!)
    makeBoxPart(0.94, 0.77, 0.88, 0, 0.555, 0, 0.0),
    makeBoxPart(0.26, 0.78, 0.94, -0.31, 0.56, 0, 0.0),
    makeBoxPart(0.26, 0.78, 0.94,  0.31, 0.56, 0, 0.0),
    // Горизонтальные плиты балконов на главном и дворовом фасадах
    makeBoxPart(0.34, 0.025, 0.96, 0, 0.38, 0, 3.0),
    makeBoxPart(0.34, 0.025, 0.96, 0, 0.58, 0, 3.0),
    makeBoxPart(0.34, 0.025, 0.96, 0, 0.78, 0, 3.0),
    // Венчающий карниз и парапетные стенки по контуру плоской крыши
    makeBoxPart(1.00, 0.035, 0.98, 0, 0.95, 0, 3.0),
    makeBoxPart(0.98, 0.04, 0.04, 0, 0.985,  0.46, 3.0),
    makeBoxPart(0.98, 0.04, 0.04, 0, 0.985, -0.46, 3.0),
    makeBoxPart(0.04, 0.04, 0.90,  0.47, 0.985, 0, 3.0),
    makeBoxPart(0.04, 0.04, 0.90, -0.47, 0.985, 0, 3.0),
    // Надстройка лифтового холла и сдвоенные блоки вентиляции HVAC на крыше
    makeBoxPart(0.24, 0.09, 0.22, -0.14, 1.01, -0.08, 3.0),
    makeBoxPart(0.14, 0.055, 0.14, 0.20, 0.99,  0.12, 3.0),
    makeBoxPart(0.14, 0.055, 0.14, 0.20, 0.99, -0.10, 3.0),
  ];
  return mergeArchitecturalParts(parts);
}

/**
 * 3. КАСКАДНО-ТЕРРАСНЫЙ КОМПЛЕКС / ГРАНД-ОТЕЛЬ / РЕЧНОЙ ВОКЗАЛ (step)
 * Широкий стилобат + средний террасный объём с зелёными площадками + верхняя башня-пентхаус!
 */
export function createSteppedTerraceGeometry() {
  const parts = [
    // Парадный стилобат с галереей
    makeBoxPart(1.02, 0.18, 1.00, 0, 0.09, 0, 1.0),
    makeBoxPart(0.98, 0.22, 0.94, 0, 0.29, 0, 0.0),
    makeBoxPart(1.01, 0.03, 0.97, 0, 0.405, 0, 2.0), // террасная кровля нижнего яруса
    // Средний уступ со смещением
    makeBoxPart(0.74, 0.32, 0.76, -0.06, 0.57, -0.04, 0.0),
    makeBoxPart(0.78, 0.03, 0.80, -0.06, 0.735, -0.04, 2.0),
    // Верхний панорамный пентхаус с навесом-перголой
    makeBoxPart(0.48, 0.23, 0.52, -0.11, 0.855, -0.08, 0.0),
    makeBoxPart(0.54, 0.03, 0.58, -0.11, 0.985, -0.08, 3.0),
    makeBoxPart(0.16, 0.06, 0.16, -0.11, 1.03, -0.08, 3.0),
  ];
  return mergeArchitecturalParts(parts);
}

/**
 * 4. ВЫСОТНЫЙ НЕБОСКРЁБ / БИЗНЕС-ЦЕНТР / ИНСТИТУТ / ГИПЕРСКЕЙЛ БАШНЯ (tower)
 * Двухсветный атриум-подиум + башня с угловыми пилонами + сужающаяся корона + шпиль!
 */
export function createSkyscraperTowerGeometry() {
  const spire = new THREE.CylinderGeometry(0.012, 0.032, 0.16, 6).toNonIndexed();
  spire.translate(0, 1.07, 0);

  const parts = [
    // Широкий входной атриум-подиум у подножия башни
    makeBoxPart(1.04, 0.12, 1.04, 0, 0.06, 0, 1.0),
    makeBoxPart(0.42, 0.025, 0.22, 0, 0.12, 0.56, 3.0),
    // Основной стеклянный ствол небоскрёба
    makeBoxPart(0.82, 0.64, 0.82, 0, 0.44, 0, 0.0),
    // Вертикальные угловые пилоны-ламели (делают силуэт гранёным и выразительным!)
    makeBoxPart(0.90, 0.64, 0.16, 0, 0.44,  0.35, 3.0),
    makeBoxPart(0.90, 0.64, 0.16, 0, 0.44, -0.35, 3.0),
    makeBoxPart(0.16, 0.64, 0.90,  0.35, 0.44, 0, 3.0),
    makeBoxPart(0.16, 0.64, 0.90, -0.35, 0.44, 0, 3.0),
    // Технический пояс жалюзи
    makeBoxPart(0.86, 0.03, 0.86, 0, 0.765, 0, 3.0),
    // Верхняя сужающаяся корона небоскрёба (setback crown)
    makeBoxPart(0.64, 0.18, 0.64, 0, 0.87, 0, 0.0),
    makeBoxPart(0.68, 0.028, 0.68, 0, 0.97, 0, 3.0),
    // Основание антенны и высокий архитектурный шпиль
    makeBoxPart(0.28, 0.045, 0.28, 0, 1.00, 0, 3.0),
    tagPartGeometry(spire, 3.0),
  ];
  return mergeArchitecturalParts(parts);
}

/**
 * 5. АРОЧНЫЙ ПАВИЛЬОН / АРЕНА / ПОРТОВЫЙ ТЕРМИНАЛ / ТЕПЛИЦА / АНГАР (arch)
 * Боковые нефы с контрфорсами + плавный цилиндрический свод + световой фонарь на коньке!
 */
export function createArchedPavilionGeometry() {
  // Полуцилиндрический свод вдоль оси X
  const vault = new THREE.CylinderGeometry(0.46, 0.46, 0.98, 12, 1, false, 0, Math.PI).toNonIndexed();
  vault.rotateZ(Math.PI * 0.5);
  vault.rotateY(Math.PI * 0.5);
  vault.scale(1.0, 0.68, 1.0);
  vault.translate(0, 0.56, 0);

  const parts = [
    makeBoxPart(1.00, 0.14, 1.00, 0, 0.07, 0, 1.0),
    makeBoxPart(0.96, 0.44, 0.90, 0, 0.36, 0, 0.0),
    // Боковые контрфорсные пилястры
    makeBoxPart(0.08, 0.54, 1.02, -0.34, 0.28, 0, 3.0),
    makeBoxPart(0.08, 0.54, 1.02,  0.00, 0.28, 0, 3.0),
    makeBoxPart(0.08, 0.54, 1.02,  0.34, 0.28, 0, 3.0),
    // Плавный арочный свод кровли + верхний световой фонарь
    tagPartGeometry(vault, 2.0, 2, 1),
    makeBoxPart(0.76, 0.07, 0.16, 0, 0.90, 0, 3.0),
  ];
  return mergeArchitecturalParts(parts);
}

/**
 * 6. БАШНЯ СО ШПИЛЕМ / УНИВЕРСИТЕТ / РОСГИДРОМЕТ / МАЯК / ВОДОНАПОРНАЯ БАШНЯ (spire)
 * Классический симметричный корпус с портиком, восьмигранным барабаном, куполом и шпилем!
 */
export function createSpireMonumentGeometry() {
  const octagon = new THREE.CylinderGeometry(0.28, 0.32, 0.34, 8).toNonIndexed();
  octagon.translate(0, 0.65, 0);

  const dome = new THREE.SphereGeometry(0.28, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5).toNonIndexed();
  dome.scale(1.0, 0.72, 1.0);
  dome.translate(0, 0.82, 0);

  const needle = new THREE.ConeGeometry(0.045, 0.24, 6).toNonIndexed();
  needle.translate(0, 1.08, 0);

  const parts = [
    makeBoxPart(0.98, 0.14, 0.98, 0, 0.07, 0, 1.0),
    makeBoxPart(0.90, 0.36, 0.88, 0, 0.32, 0, 0.0),
    // Выступающий входной портик
    makeBoxPart(0.38, 0.34, 0.16, 0, 0.30, 0.48, 3.0),
    makePrismGableRoof(0.42, 0.10, 0.20, 0.47, 2.0),
    makeBoxPart(0.94, 0.03, 0.92, 0, 0.49, 0, 3.0),
    tagPartGeometry(octagon, 0.0, 2, 1),
    tagPartGeometry(dome, 2.0, 2, 1),
    tagPartGeometry(needle, 3.0),
  ];
  return mergeArchitecturalParts(parts);
}

/**
 * 7. ПРОМЫШЛЕННЫЙ СИЛОСНЫЙ КОМПЛЕКС / ГРАДИРНЯ / ЭЛЕВАТОР / БСУ (cyl / cool)
 * Железобетонная плита + спаренные цилиндрические башни с кольцами жёсткости и верхней галереей!
 */
export function createIndustrialSiloClusterGeometry() {
  const cylL = new THREE.CylinderGeometry(0.23, 0.26, 0.84, 12).toNonIndexed();
  cylL.translate(-0.22, 0.50, 0);

  const cylR = new THREE.CylinderGeometry(0.23, 0.26, 0.84, 12).toNonIndexed();
  cylR.translate(0.22, 0.50, 0);

  const capL = new THREE.ConeGeometry(0.25, 0.10, 12).toNonIndexed();
  capL.translate(-0.22, 0.97, 0);

  const capR = new THREE.ConeGeometry(0.25, 0.10, 12).toNonIndexed();
  capR.translate(0.22, 0.97, 0);

  const parts = [
    makeBoxPart(0.96, 0.10, 0.72, 0, 0.05, 0, 1.0),
    tagPartGeometry(cylL, 0.0, 2, 1),
    tagPartGeometry(cylR, 0.0, 2, 1),
    tagPartGeometry(capL, 2.0),
    tagPartGeometry(capR, 2.0),
    // Надсилосная транспортёрная галерея и опорный мостик
    makeBoxPart(0.68, 0.09, 0.22, 0, 0.95, 0, 3.0),
    makeBoxPart(0.14, 0.65, 0.20, 0, 0.42, 0, 3.0),
  ];
  return mergeArchitecturalParts(parts);
}
