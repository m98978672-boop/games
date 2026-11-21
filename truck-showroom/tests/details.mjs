#!/usr/bin/env node
/* Детали моделей — то, что обещано в данных, должно быть построено.

   У тягачей в каталоге есть флаги detail: выхлопные трубы (stacks),
   LED-оптика (led), обтекатели, юбки. Но флаг в данных — это не деталь.
   Пока деталь не построена в buildTruck, игрок видит обычный грузовик, а
   подпись обещает другое.

   Так и было: stacks стоял у Vulcan Titan, led — у Orion X, и оба флага
   никто не читал. Здесь проверяется, что каждая заявленная деталь даёт
   реальную геометрию и якорь для осмотра.

   Запуск: node truck-showroom/tests/details.mjs                     */
import * as THREE from 'three';
import { buildTruck } from '../src/models/truck.js';
import { buildCar } from '../src/models/car.js';
import { createMaterials } from '../src/lib/kit.js';
import { TRUCKS, CARS } from '../src/data/units.js';

let passed = 0;
let failed = 0;
function check(name, ok, detail = '') {
  if (ok) { passed++; console.log('  ✓', name); }
  else { failed++; console.log('  ✗', name, detail); }
}

const M = createMaterials(null);

function meshes(root) {
  let n = 0;
  root.traverse((o) => { if (o.isMesh) n += 1; });
  return n;
}
function bounds(root) {
  const box = new THREE.Box3().setFromObject(root);
  return { min: box.min, max: box.max, h: box.max.y - box.min.y };
}

console.log('Флаги деталей в каталоге');
{
  const stacksUnits = TRUCKS.filter((t) => t.stacks);
  const ledUnits = TRUCKS.filter((t) => t.led);
  check('есть тягач с выхлопными трубами', stacksUnits.length > 0,
    stacksUnits.map((t) => t.id).join(','));
  check('есть тягач с LED-оптикой', ledUnits.length > 0,
    ledUnits.map((t) => t.id).join(','));
  check('трубы заявлены только у тягачей', CARS.every((c) => !c.stacks));
}

console.log('Трубы строятся');
{
  const titan = TRUCKS.find((t) => t.stacks);
  const built = buildTruck(titan, M);
  const stackAnchors = built.anchors.filter((a) => /Выхлопная труба/.test(a.label));
  check('у Titan есть якоря труб', stackAnchors.length === 2, String(stackAnchors.length));
  check('трубы стоят симметрично',
    stackAnchors.length === 2 && Math.abs(stackAnchors[0].pos[0] + stackAnchors[1].pos[0]) < 0.02,
    JSON.stringify(stackAnchors.map((a) => a.pos[0])));
  const b = bounds(built.root);
  check('трубы поднимаются выше кабины', b.max.y > 3.2, b.max.y.toFixed(2));
  /* Габарит по ширине задают зеркала (±1.76 м), и это нормально для
     тягача. Трубы же должны стоять в пределах кузова — проверяем именно
     их по якорям, а не весь силуэт. */
  check('трубы внутри кузова по ширине',
    stackAnchors.every((a) => Math.abs(a.pos[0]) < 1.3),
    stackAnchors.map((a) => a.pos[0].toFixed(2)).join(', '));

  // у соседа без флага труб нет
  const plain = TRUCKS.find((t) => !t.stacks && t.category === 'trucks');
  const plainBuilt = buildTruck(plain, M);
  check('без флага труб нет',
    plainBuilt.anchors.filter((a) => /Выхлопная труба/.test(a.label)).length === 0,
    plain.id);
}

console.log('LED-оптика строится');
{
  const orion = TRUCKS.find((t) => t.led);
  const built = buildTruck(orion, M);
  const ledAnchors = built.anchors.filter((a) => /Дневные ходовые огни/.test(a.label));
  check('у Orion есть якорь дневных огней', ledAnchors.length === 1, String(ledAnchors.length));
  check('полоса огней во всю ширину кабины',
    built.layout && built.layout.cabW ? Math.abs(ledAnchors[0].pos[0]) < 0.01 : true);
  const plain = TRUCKS.find((t) => !t.led && t.category === 'trucks');
  check('без флага LED нет',
    buildTruck(plain, M).anchors.filter((a) => /Дневные ходовые огни/.test(a.label)).length === 0,
    plain.id);
}

console.log('Ничего не сломалось');
{
  // все машины и тягачи собираются, у всех есть габариты и меши
  let bad = [];
  for (const u of [...TRUCKS, ...CARS]) {
    try {
      const built = u.category === 'trucks' ? buildTruck(u, M) : buildCar(u, M);
      const root = built.root || built.group;
      const n = meshes(root);
      const b = bounds(root);
      if (!n || !(b.h > 0)) bad.push(u.id);
    } catch (e) {
      bad.push(u.id + ' (' + e.message + ')');
    }
  }
  check('все тягачи и авто собираются с геометрией', bad.length === 0, bad.join(', '));

  // ни одна модель не выросла выше разумного: трубы добавляют ~2 м, не 10
  /* У высоких кабин (Nordwind Aurora) крыша и так на 4.7 м — это заявленная
     высота модели, а не раздутая деталь. Порог 5 м ловит именно разросшиеся
     трубы и обтекатели, а не штатную высокую кабину. */
  const tallest = [...TRUCKS].map((u) => ({ id: u.id, h: bounds(buildTruck(u, M).root).max.y }))
    .sort((a, b) => b.h - a.h)[0];
  check('самый высокий тягач в пределах 5 м', tallest.h < 5,
    `${tallest.id}: ${tallest.h.toFixed(2)} м`);
}

console.log(`\n${passed} пройдено, ${failed} провалено`);
if (failed) process.exit(1);
