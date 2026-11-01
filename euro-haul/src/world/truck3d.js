// 3D-модель тягача AURIGA: кабина, шасси, колёса, полуприцепы и полноценный салон.
// Всё строится из примитивов и профилей, материалы — из materials.js (общий кэш).
import * as THREE from 'three';
import { materials, trailerTexture, trailerRearTexture, containerTexture, containerRoofTexture, canvasTexture } from './materials.js';
import { clamp, fmtTime, rng } from '../core/math.js';
import { mergeStatic } from '../core/merge-static.js';

export const UP = new THREE.Vector3(0, 1, 0);

// Габариты тягача (метры). Единая система координат: +z — вперёд, +y — вверх.
const CAB = {
  rear: -0.58,
  front: 3.42,
  width: 2.5,
  skirt: 1.16, // низ кузова
  sill: 2.12, // линия окон (верх двери)
  roof: 3.52, // крыша
  floor: 1.34, // пол в салоне
  windshieldBottom: 2.06,
  windshieldTop: 3.22,
  windshieldZ: 3.2,
};
// Водитель слева: +x — правый борт (Европа, правый руль дороги не наш случай),
// поэтому глаз водителя в отрицательном x.
const EYE = { x: -0.55, y: 2.5, z: 1.2 };
const WHEEL_R = 0.52;

/** Коробка с необязательным поворотом. */
function box(parent, w, h, d, mat, x, y, z, rot = null) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  if (rot) mesh.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  parent.add(mesh);
  return mesh;
}

/** Плоскость (стёкла, панели, экраны). */
function plane(parent, w, h, mat, x, y, z, rot = null) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.position.set(x, y, z);
  if (rot) mesh.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  parent.add(mesh);
  return mesh;
}

/** Цилиндр вдоль оси y/x/z. */
function cylinder(parent, r1, r2, h, mat, x, y, z, axis = 'y', segments = 18) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, segments), mat);
  mesh.position.set(x, y, z);
  if (axis === 'x') mesh.rotation.z = Math.PI / 2;
  if (axis === 'z') mesh.rotation.x = Math.PI / 2;
  parent.add(mesh);
  return mesh;
}

/**
 * Тело по боковому профилю: точки задаются в метрах как [z, y], профиль
 * выдавливается по ширине кузова. Так кабина получает цельный силуэт
 * без ступенек из отдельных коробок.
 */
function profile(parent, points, width, mat, bevel = 0.03) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.01, width - bevel * 2),
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 6,
  });
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.y = -Math.PI / 2;
  mesh.position.x = width / 2;
  parent.add(mesh);
  return mesh;
}

export class TruckView {
  constructor(scene, paintHex = 0x2f7fa8) {
    this.scene = scene;
    this.mats = materials();
    this.root = new THREE.Group();
    this.root.name = 'truck';
    scene.add(this.root);

    this.paint = new THREE.MeshPhysicalMaterial({
      color: paintHex,
      metalness: 0.35,
      roughness: 0.3,
      clearcoat: 0.9,
      clearcoatRoughness: 0.16,
      envMapIntensity: 1,
    });
    this.paintDark = new THREE.MeshStandardMaterial({
      color: new THREE.Color(paintHex).multiplyScalar(0.55),
      metalness: 0.4,
      roughness: 0.42,
    });
    this.trimDark = new THREE.MeshStandardMaterial({ color: 0x21272b, roughness: 0.78 });
    this.headlightMat = new THREE.MeshStandardMaterial({
      color: 0xfff8e6,
      emissive: 0xfff0c0,
      emissiveIntensity: 0.5,
      metalness: 0.2,
      roughness: 0.18,
    });
    // Поворотники — отдельные материалы на каждый борт, иначе мигают все сразу.
    this.indicatorMatL = new THREE.MeshStandardMaterial({ color: 0xd98b1f, emissive: 0xffa41a, emissiveIntensity: 0.15, roughness: 0.4 });
    this.indicatorMatR = new THREE.MeshStandardMaterial({ color: 0xd98b1f, emissive: 0xffa41a, emissiveIntensity: 0.15, roughness: 0.4 });

    this.wheels = [];
    this.frontWheels = [];
    this.trailerWheels = [];
    this.wipers = [];
    this.indicatorLights = { left: [], right: [] };
    this.brakeLights = [];

    this.tyreGeo = this.buildTyreGeometry();
    this.rimGeo = new THREE.CylinderGeometry(WHEEL_R * 0.58, WHEEL_R * 0.58, 0.24, 22);

    this.buildTractor();
    this.buildTrailer('curtain', 'NordTrans');
    this.buildInterior();
    this.buildLights();
    // Кузов статичен (кроме колёс, дворников, руля, стёкол и прицепа) — склеиваем
    // меши по материалам: на телефоне это разница между 20 и 50 кадрами в секунду.
    mergeStatic(this.root, [
      this.interior,
      this.trailerGroup,
      this.headlights,
      this.wheelPivot,
      ...this.wheels,
      ...this.wipers,
      ...this.glazing,
    ]);
    this.applyShadowFlags(this.shadowOn !== false);
  }

  // ------------------------------------------------------------------ колёса
  buildTyreGeometry() {
    // Профиль покрышки с закруглёнными плечами, выдавленный по кругу.
    const pts = [
      [WHEEL_R * 0.78, -0.16],
      [WHEEL_R * 0.93, -0.17],
      [WHEEL_R * 0.99, -0.13],
      [WHEEL_R, -0.07],
      [WHEEL_R, 0.07],
      [WHEEL_R * 0.99, 0.13],
      [WHEEL_R * 0.93, 0.17],
      [WHEEL_R * 0.78, 0.16],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    const geo = new THREE.LatheGeometry(pts, 26);
    geo.rotateZ(Math.PI / 2);
    return geo;
  }

  addWheels(group, opts) {
    const { front, rear, width, steer, trailer = false } = opts;
    const m = this.mats;
    const make = (x, z, isFront) => {
      const w = new THREE.Group();
      const tyre = new THREE.Mesh(this.tyreGeo, m.tyres);
      w.add(tyre);
      const rim = new THREE.Mesh(this.rimGeo, m.rim);
      w.add(rim);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(WHEEL_R * 0.3, WHEEL_R * 0.34, 0.26, 16), m.chrome);
      w.add(cap);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.28, 6), m.darkMetal);
        bolt.position.set(0, Math.cos(a) * WHEEL_R * 0.44, Math.sin(a) * WHEEL_R * 0.44);
        w.add(bolt);
      }
      w.position.set(x, WHEEL_R, z);
      w.userData.trailer = trailer;
      group.add(w);
      this.wheels.push(w);
      if (trailer) this.trailerWheels.push(w);
      else if (isFront) this.frontWheels.push(w);
      return w;
    };
    for (const sx of [-1, 1]) {
      if (steer) make(sx * width, front, true);
      if (rear) {
        for (const z of rear) {
          make(sx * (width - 0.18), z, false);
          make(sx * (width + 0.17), z, false);
        }
      }
    }
  }

  // ------------------------------------------------------------------ тягач
  buildTractor() {
    const m = this.mats;
    const g = (this.tractor = new THREE.Group());
    this.root.add(g);
    const HW = CAB.width / 2;

    // Рама и поперечины.
    for (const sx of [-1, 1]) box(g, 0.14, 0.3, 7.4, m.darkMetal, sx * 0.45, 1.02, -0.9);
    for (const z of [1.9, 0.4, -1.2, -2.8, -4.1]) box(g, 0.9, 0.1, 0.12, m.darkMetal, 0, 1.0, z);
    // Седло.
    box(g, 1.16, 0.12, 1.0, m.metal, 0, 1.2, -1.6);
    const plate = box(g, 1.0, 0.06, 0.86, m.darkMetal, 0, 1.28, -1.6, [0.06, 0, 0]);
    void plate;

    // Нижний пояс кабины: борта, передняя и задняя стенки (внутри — салон).
    const shellH = CAB.sill - CAB.skirt;
    const shellLen = CAB.front - CAB.rear;
    const shellY = CAB.skirt + shellH / 2;
    for (const sx of [-1, 1]) {
      box(g, 0.07, shellH, shellLen, this.paint, sx * (HW - 0.035), shellY, (CAB.front + CAB.rear) / 2);
    }
    box(g, CAB.width, shellH - 0.06, 0.09, this.paint, 0, shellY - 0.03, CAB.front - 0.045);
    box(g, CAB.width, shellH - 0.1, 0.09, this.paint, 0, shellY - 0.05, CAB.rear + 0.045);
    // Днище кабины.
    box(g, CAB.width - 0.1, 0.08, shellLen - 0.1, this.trimDark, 0, CAB.floor - 0.06, (CAB.front + CAB.rear) / 2);

    // Задняя стенка (спальник) — чуть скруглённая.
    profile(
      g,
      [
        [CAB.rear + 0.02, CAB.skirt + 0.02],
        [CAB.rear + 0.02, CAB.roof - 0.02],
        [CAB.rear - 0.06, CAB.roof - 0.1],
        [CAB.rear - 0.06, CAB.skirt + 0.06],
      ],
      CAB.width - 0.02,
      this.paint,
      0.02
    );

    // Крыша.
    box(g, CAB.width, 0.14, CAB.front - CAB.rear - 0.24, this.paint, 0, CAB.roof, (CAB.front + CAB.rear) / 2);
    // Аэродинамический обтекатель над крышей.
    profile(
      g,
      [
        [2.86, CAB.roof + 0.04],
        [2.34, CAB.roof + 0.36],
        [0.5, CAB.roof + 0.44],
        [CAB.rear + 0.05, CAB.roof + 0.4],
        [CAB.rear + 0.05, CAB.roof + 0.03],
      ],
      CAB.width - 0.04,
      this.paint,
      0.03
    );

    // Лобовое стекло и его рамка.
    const wsH = CAB.windshieldTop - CAB.windshieldBottom;
    const wsZ = CAB.windshieldZ;
    const wsTilt = -Math.atan2(wsZ - (CAB.front - 0.06), wsH); // ~ -16°
    const wsY = (CAB.windshieldTop + CAB.windshieldBottom) / 2;
    this.glazing = [];
    const ws = plane(g, CAB.width - 0.16, wsH, m.glass, 0, wsY, wsZ + 0.02, [wsTilt, 0, 0]);
    this.windshield = ws;
    this.glazing.push(ws);
    // рамка: верх, низ, боковые стойки
    box(g, CAB.width, 0.12, 0.22, this.paintDark, 0, CAB.windshieldTop + 0.03, wsZ - 0.07, [wsTilt, 0, 0]);
    box(g, CAB.width - 0.04, 0.1, 0.24, this.trimDark, 0, CAB.windshieldBottom - 0.04, CAB.front - 0.02);
    for (const sx of [-1, 1]) {
      box(g, 0.12, wsH + 0.14, 0.24, this.paintDark, sx * (HW - 0.07), wsY + 0.01, wsZ - 0.02, [wsTilt, 0, 0]);
    }
    // Солнцезащитный козырёк.
    box(g, CAB.width - 0.02, 0.1, 0.52, this.paintDark, 0, CAB.roof + 0.02, wsZ - 0.16, [-0.16, 0, 0]);

    // Боковые окна, стойки, двери.
    const winBottom = CAB.sill + 0.06;
    const winTop = CAB.roof - 0.1;
    for (const side of [-1, 1]) {
      const x = side * (HW - 0.005);
      const yaw = side > 0 ? Math.PI / 2 : -Math.PI / 2;
      // дверное окно + окно спальника
      const glassA = plane(g, 1.34, winTop - winBottom, m.glass, x, (winTop + winBottom) / 2, 2.24, [0, yaw, 0]);
      const glassB = plane(g, 0.86, winTop - winBottom - 0.1, m.glass, x, (winTop + winBottom) / 2 - 0.05, 1.02, [0, yaw, 0]);
      this.glazing.push(glassA, glassB);
      // стойки
      box(g, 0.06, winTop - winBottom + 0.14, 0.16, this.paintDark, x + side * 0.02, (winTop + winBottom) / 2, 2.94, [0, 0, 0]);
      box(g, 0.06, winTop - winBottom + 0.1, 0.1, this.paintDark, x + side * 0.02, (winTop + winBottom) / 2, 1.53);
      box(g, 0.06, winTop - winBottom + 0.1, 0.12, this.paintDark, x + side * 0.02, (winTop + winBottom) / 2, 0.55);
      // нижняя и верхняя кромки окон
      box(g, 0.09, 0.09, 2.6, this.trimDark, x, winBottom - 0.02, 1.72);
      box(g, 0.09, 0.1, 2.62, this.paintDark, x, winTop + 0.06, 1.72);
      // шов двери и ручка
      box(g, 0.04, 1.0, 0.05, this.trimDark, x + side * 0.02, 1.66, 2.92);
      box(g, 0.05, 0.07, 0.36, m.chrome, x + side * 0.04, 2.02, 2.6);
      // молдинг по низу двери
      box(g, 0.05, 0.12, 2.5, this.trimDark, x + side * 0.02, 1.34, 1.72);
      // колесная арка
      const arch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.68, 0.68, 0.1, 22, 1, true, -0.2, Math.PI + 0.4),
        new THREE.MeshStandardMaterial({ color: 0x191d20, roughness: 0.95, side: THREE.DoubleSide })
      );
      arch.position.set(side * (HW + 0.005), WHEEL_R, 2.55);
      arch.rotation.set(0, 0, Math.PI / 2);
      g.add(arch);
      // ступеньки
      for (const [sy, sz] of [[1.0, 2.2], [0.66, 1.72]]) {
        box(g, 0.4, 0.06, 0.5, m.darkMetal, side * (HW - 0.12), sy, sz);
      }
      // зеркала: кронштейн + корпус + стекло
      // Зеркала вынесены вперёд: в кабине они видны по краям стекла, а не «стеной».
      const arm = box(g, 0.46, 0.05, 0.05, m.darkMetal, side * (HW + 0.2), 3.28, 3.24);
      arm.rotation.z = side * -0.06;
      box(g, 0.09, 0.6, 0.24, this.trimDark, side * (HW + 0.42), 2.88, 3.3);
      plane(g, 0.2, 0.5, m.mirror, side * (HW + 0.37), 2.88, 3.3, [0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0]);
      box(g, 0.07, 0.2, 0.18, this.trimDark, side * (HW + 0.4), 2.4, 3.26);
      // брызговик
      box(g, 0.5, 0.55, 0.04, this.trimDark, side * 1.02, 0.34, 1.66);
    }

    // Решётка радиатора, эмблема, бампер, фары.
    box(g, 2.06, 0.52, 0.08, this.trimDark, 0, 1.62, CAB.front + 0.05);
    for (let i = 0; i < 3; i++) box(g, 2.0, 0.05, 0.1, m.chrome, 0, 1.5 + i * 0.15, CAB.front + 0.08);
    const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 18), m.chrome);
    badge.rotation.x = Math.PI / 2;
    badge.position.set(0, 1.94, CAB.front + 0.1);
    g.add(badge);
    box(g, 2.52, 0.44, 0.32, this.paintDark, 0, 1.0, CAB.front + 0.16);
    box(g, 2.24, 0.14, 0.1, this.trimDark, 0, 0.8, CAB.front + 0.3);
    for (const sx of [-1, 1]) {
      box(g, 0.56, 0.24, 0.1, this.headlightMat, sx * 0.76, 1.06, CAB.front + 0.32);
      box(g, 0.58, 0.04, 0.12, m.chrome, sx * 0.76, 0.92, CAB.front + 0.33);
      const ind = box(g, 0.2, 0.1, 0.08, sx < 0 ? this.indicatorMatR : this.indicatorMatL, sx * 1.14, 1.06, CAB.front + 0.33);
      (sx < 0 ? this.indicatorLights.left : this.indicatorLights.right).push(ind);
      // противотуманка
      box(g, 0.2, 0.1, 0.06, this.headlightMat, sx * 0.66, 0.78, CAB.front + 0.33);
    }

    // Топливные баки, ящики, выхлоп.
    for (const sx of [-1, 1]) {
      cylinder(g, 0.34, 0.34, 1.9, m.chrome, sx * 1.2, 0.78, 0.5, 'z', 20);
      cylinder(g, 0.345, 0.345, 0.08, m.darkMetal, sx * 1.2, 0.78, 0.5, 'z', 20);
      box(g, 0.07, 0.45, 1.7, m.darkMetal, sx * 0.86, 0.86, 0.5);
      box(g, 0.42, 0.5, 0.6, m.darkMetal, sx * 1.18, 0.8, -0.62);
    }
    cylinder(g, 0.09, 0.08, 2.4, m.chrome, -1.18, 2.0, -0.66, 'y', 12);
    box(g, 0.18, 0.12, 0.3, m.darkMetal, -1.18, 3.18, -0.66);

    // Задняя часть шасси: крылья над колёсами, брызговики, фонари.
    for (const sx of [-1, 1]) {
      const fender = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.72, 0.06, 20, 1, true, 0, Math.PI),
        m.darkMetal
      );
      fender.rotation.set(0, 0, Math.PI / 2);
      fender.position.set(sx * 1.06, 1.14, -1.5);
      g.add(fender);
      box(g, 0.06, 0.5, 1.9, this.trimDark, sx * 1.3, 0.86, -1.5);
      box(g, 0.44, 0.5, 0.04, this.trimDark, sx * 1.02, 0.32, -2.3);
    }
    for (const sx of [-0.9, 0.9]) {
      const tail = box(g, 0.22, 0.16, 0.07, m.taillight, sx, 1.2, -4.5);
      this.brakeLights.push(tail);
      const ind = box(g, 0.22, 0.1, 0.07, sx < 0 ? this.indicatorMatL : this.indicatorMatR, sx, 1.36, -4.5);
      (sx < 0 ? this.indicatorLights.left : this.indicatorLights.right).push(ind);
    }
    box(g, 2.3, 0.1, 0.12, this.trimDark, 0, 0.9, -4.52);

    this.addWheels(g, { front: 2.55, rear: [-1.5], width: 1.02, steer: true });
  }

  // ------------------------------------------------------------------ прицепы
  buildTrailer(type, company) {
    if (this.trailerGroup) {
      this.trailerGroup.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material && o.material.__generated) {
          o.material.map?.dispose?.();
          o.material.dispose();
        }
      });
      this.root.remove(this.trailerGroup);
    }
    // Колёса прежнего прицепа убираем из общих списков.
    this.wheels = this.wheels.filter((w) => !w.userData.trailer);
    this.trailerWheels = [];

    const m = this.mats;
    const g = (this.trailerGroup = new THREE.Group());
    const L = 13.6;
    const nose = -0.9; // передняя кромка полуприцепа
    const zc = nose - L / 2;
    const tail = nose - L;
    const bodyBottom = 1.42;
    const height = 2.6;
    const yc = bodyBottom + height / 2;
    const halfW = 1.27;

    /** Материалы короба: борт с ливреей, верх/торцы — однотонные. */
    const bodyMaterials = (sideTex, baseColor, roughness = 0.8, topTex = null) => {
      const side = new THREE.MeshStandardMaterial({ map: sideTex, roughness, metalness: 0.06 });
      side.__generated = true;
      const mirrored = sideTex.clone();
      mirrored.needsUpdate = true;
      mirrored.wrapS = THREE.RepeatWrapping;
      mirrored.repeat.x = -1;
      mirrored.offset.x = 1;
      const sideL = new THREE.MeshStandardMaterial({ map: mirrored, roughness, metalness: 0.06 });
      sideL.__generated = true;
      const top = new THREE.MeshStandardMaterial({
        color: topTex ? 0xffffff : baseColor,
        map: topTex || null,
        roughness: Math.min(1, roughness + 0.12),
      });
      if (topTex) top.__generated = true;
      const bottom = new THREE.MeshStandardMaterial({ color: 0x2a2e31, roughness: 0.95 });
      const front = new THREE.MeshStandardMaterial({ color: new THREE.Color(baseColor).multiplyScalar(0.86), roughness: roughness + 0.05 });
      const rear = new THREE.MeshStandardMaterial({ color: new THREE.Color(baseColor).multiplyScalar(0.9), roughness: roughness + 0.04 });
      return [side, sideL, top, bottom, front, rear];
    };
    const boxBody = (materialsList) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2, height, L), materialsList);
      mesh.position.set(0, yc, zc);
      g.add(mesh);
      return mesh;
    };

    if (type === 'tank') {
      const tankMat = m.chrome;
      cylinder(g, 1.16, 1.16, L - 0.5, tankMat, 0, 2.45, zc, 'z', 28);
      cylinder(g, 1.16, 0.84, 0.3, tankMat, 0, 2.45, zc + L / 2 - 0.36, 'z', 28);
      cylinder(g, 1.16, 0.84, 0.3, tankMat, 0, 2.45, zc - L / 2 + 0.36, 'z', 28);
      for (const dz of [-4.0, -0.6, 2.8]) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.17, 0.03, 6, 26), m.darkMetal);
        ring.rotation.y = Math.PI / 2;
        ring.position.set(0, 2.45, zc + dz);
        g.add(ring);
      }
      box(g, 2.1, 0.12, L - 0.8, m.darkMetal, 0, 1.3, zc);
      box(g, 0.34, 0.34, L - 2.6, m.metal, 1.12, 1.5, zc);
      const adr = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 0.56),
        new THREE.MeshStandardMaterial({ map: this.labelTexture('ADR', '33', '#e8a72b'), roughness: 0.7 })
      );
      adr.position.set(0.0, 2.0, zc - L / 2 - 0.32);
      adr.rotation.y = Math.PI;
      g.add(adr);
    } else if (type === 'flatbed') {
      box(g, 2.54, 0.18, L, m.concrete, 0, 1.5, zc);
      for (const sx of [-1, 1]) box(g, 0.08, 0.3, L, m.metal, sx * 1.24, 1.72, zc);
      const cargoMat = new THREE.MeshStandardMaterial({ color: 0x9a8a68, roughness: 0.92 });
      const strapMat = new THREE.MeshStandardMaterial({ color: 0x2b2f32, roughness: 0.9 });
      for (let i = 0; i < 7; i++) {
        box(g, 2.22, 1.5, 1.72, cargoMat, 0, 2.36, zc + 5.6 - i * 1.82);
        box(g, 2.28, 0.05, 0.1, strapMat, 0, 3.06, zc + 5.6 - i * 1.82);
      }
    } else if (type === 'container') {
      const tex = containerTexture(company, '#b8552f');
      tex.repeat.set(1, 1);
      const roofTex = containerRoofTexture('#8a5236');
      roofTex.repeat.set(3, 1);
      boxBody(bodyMaterials(tex, 0xb8552f, 0.66, roofTex));
      // верхние и нижние направляющие — контейнер перестаёт быть «коробкой»
      for (const sx of [-1, 1]) {
        box(g, 0.1, 0.14, L, m.darkMetal, sx * 1.25, bodyBottom + height - 0.02, zc);
        box(g, 0.1, 0.12, L, m.darkMetal, sx * 1.25, bodyBottom + 0.04, zc);
      }
      box(g, 2.6, 0.12, 0.1, m.darkMetal, 0, bodyBottom + height - 0.02, nose + 0.02);
      box(g, 2.6, 0.12, 0.1, m.darkMetal, 0, bodyBottom + height - 0.02, tail - 0.02);
      // угловые фитинги по низу и верху
      for (const sx of [-1, 1]) {
        for (const z of [nose - 0.1, tail + 0.1]) {
          box(g, 0.16, 0.16, 0.16, m.darkMetal, sx * 1.22, bodyBottom + 0.1, z);
          box(g, 0.16, 0.16, 0.16, m.darkMetal, sx * 1.22, bodyBottom + height - 0.1, z);
        }
      }
      box(g, 2.56, 0.1, L, m.darkMetal, 0, 1.44, zc);
    } else if (type === 'log') {
      box(g, 2.3, 0.16, L, m.darkMetal, 0, 1.5, zc);
      const logMat = new THREE.MeshStandardMaterial({ color: 0x7d5c39, roughness: 1 });
      const logEnd = new THREE.MeshStandardMaterial({ color: 0xb29266, roughness: 0.9 });
      const logGeo = new THREE.CylinderGeometry(0.3, 0.3, L - 1.2, 10);
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const log = new THREE.Mesh(logGeo, [logMat, logEnd, logEnd]);
          log.rotation.x = Math.PI / 2;
          log.position.set((col - 1) * 0.66, 1.88 + row * 0.58, zc);
          g.add(log);
        }
      }
      for (const dz of [5.0, 1.2, -2.6, -6.2]) {
        box(g, 2.46, 2.2, 0.1, m.darkMetal, 0, 2.7, zc + dz);
      }
    } else if (type === 'fridge') {
      const tex = trailerTexture(company, '#eef1f0');
      tex.repeat.set(1, 1);
      boxBody(bodyMaterials(tex, 0xeef1f0, 0.44));
      // холодильный агрегат на передней стенке
      box(g, 1.4, 0.8, 0.42, m.metal, 0, 3.1, nose + 0.2);
      box(g, 1.1, 0.5, 0.06, m.darkMetal, 0, 3.1, nose + 0.42);
      box(g, 2.56, 0.1, L - 0.1, m.darkMetal, 0, 1.44, zc);
    } else {
      // Тентованный полуприцеп — самый частый на трассе.
      const tex = trailerTexture(company, '#eae6d9');
      tex.repeat.set(1, 1);
      boxBody(bodyMaterials(tex, 0xeae6d9, 0.88));
      // дуги тента: тонкие, утопленные, без «полос» на борту
      for (let i = 0; i < 12; i++) {
        box(g, 2.5, 0.04, 0.05, m.darkMetal, 0, bodyBottom + height - 0.02, nose - 0.5 - i * 1.1);
      }
      for (let i = 0; i < 7; i++) box(g, 2.555, 0.03, 0.04, m.chrome, 0, 1.62, nose - 0.8 - i * 1.8);
      box(g, 2.56, 0.12, L - 0.2, m.darkMetal, 0, 1.46, zc);
    }

    // Рама, опоры, юбки.
    box(g, 2.18, 0.16, L - 0.5, m.darkMetal, 0, 1.34, zc);
    for (const sx of [-1, 1]) {
      if (type !== 'flatbed' && type !== 'log') {
        box(g, 0.05, 0.72, 4.4, this.trimDark, sx * 1.245, 0.98, zc - 2.0);
        box(g, 0.05, 0.7, 1.3, this.trimDark, sx * 1.245, 0.98, nose - 3.0);
      }
      const leg = cylinder(g, 0.06, 0.06, 0.9, m.metal, sx * 0.72, 0.55, nose - 3.1, 'y', 8);
      void leg;
      box(g, 0.26, 0.05, 0.26, m.darkMetal, sx * 0.72, 0.12, nose - 3.1);
    }
    // Задние двери: полноценная текстура створок, запоров и световозвращателей.
    if (type !== 'flatbed' && type !== 'log' && type !== 'tank') {
      const rearTex = trailerRearTexture(company, type === 'container' ? '#a94f2c' : type === 'fridge' ? '#dfe3e2' : '#4d6672');
      const rearMat = new THREE.MeshStandardMaterial({ map: rearTex, roughness: 0.72, metalness: 0.04 });
      rearMat.__generated = true;
      const rear = new THREE.Mesh(new THREE.PlaneGeometry(halfW * 2 - 0.06, height - 0.06), rearMat);
      rear.position.set(0, yc, tail - 0.012);
      rear.rotation.y = Math.PI;
      g.add(rear);
      box(g, 2.5, 0.08, 0.06, m.chrome, 0, 1.52, tail - 0.03);
    }
    // Задний бампер и фонари.
    box(g, 2.44, 0.12, 0.14, this.trimDark, 0, 0.86, tail - 0.02);
    for (const sx of [-0.92, -0.56, 0.56, 0.92]) {
      const tailLight = box(g, 0.22, 0.18, 0.07, m.taillight, sx, 1.06, tail - 0.06);
      this.brakeLights.push(tailLight);
    }
    for (const sx of [-1, 1]) {
      const ind = box(g, 0.14, 0.26, 0.07, sx < 0 ? this.indicatorMatL : this.indicatorMatR, sx, 1.06, tail - 0.06);
      (sx < 0 ? this.indicatorLights.left : this.indicatorLights.right).push(ind);
      box(g, 0.6, 0.5, 0.04, this.trimDark, sx * 1.02, 0.6, tail + 1.0);
    }
    // Подрамник под сцепку.
    box(g, 1.1, 0.18, 1.4, m.darkMetal, 0, 1.3, nose - 0.6);

    // Колёса прицепа (две оси).
    const wheelGroup = new THREE.Group();
    g.add(wheelGroup);
    this.addWheels(wheelGroup, { front: 0, rear: [tail + 2.1, tail + 3.5], width: 1.02, steer: false, trailer: true });

    this.root.add(g);
    this.shadowOn = this.shadowOn !== false;
    this.applyShadowFlags(this.shadowOn);
  }

  /** Тени: кузов отбрасывает, салон только принимает (иначе артефакты). */
  applyShadowFlags(on = true) {
    const interior = this.interior;
    this.root.traverse((o) => {
      if (!o.isMesh) return;
      let inside = false;
      let n = o;
      while (n) {
        if (n === interior) { inside = true; break; }
        n = n.parent;
      }
      // Стёкла не отбрасывают тень: иначе салон полностью лишён солнечного света.
      const glass = this.glazing && this.glazing.includes(o);
      o.castShadow = on && !inside && !glass;
      o.receiveShadow = on;
    });
  }

  labelTexture(text, sub, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 96;
    const c = canvas.getContext('2d');
    c.fillStyle = color;
    c.fillRect(0, 0, 128, 96);
    c.strokeStyle = '#1a1a1a';
    c.lineWidth = 4;
    c.strokeRect(2, 2, 124, 92);
    c.fillStyle = '#1a1a1a';
    c.textAlign = 'center';
    c.font = 'bold 20px system-ui, Arial';
    c.fillText(text, 64, 32);
    c.font = 'bold 40px system-ui, Arial';
    c.fillText(sub, 64, 76);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  // ------------------------------------------------------------------ салон
  buildInterior() {
    const m = this.mats;
    const g = (this.interior = new THREE.Group());
    // Модель строится «водитель в -x», в мире салон зеркалится (правая сторона экрана — -x).
    g.scale.x = -1;
    this.root.add(g);
    this.eye = new THREE.Vector3(EYE.x, EYE.y, EYE.z);
    this.glazing = this.glazing || [];
    this.wipers = this.wipers || [];

    const gKey = 'int-v4';
    const grain = (name, base, spots, seed, size = 256, rep = [3, 2]) => {
      const tex = canvasTexture(gKey + name, size, size, (c, w, h) => {
        c.fillStyle = base;
        c.fillRect(0, 0, w, h);
        const r = rng(seed);
        for (let i = 0; i < 6200; i++) {
          c.fillStyle = spots[Math.floor(r() * spots.length)];
          c.globalAlpha = 0.05 + r() * 0.15;
          c.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
        }
        c.globalAlpha = 1;
      });
      tex.repeat.set(rep[0], rep[1]);
      return tex;
    };

    // Цвет запечён в текстуру, поэтому color у материала — белый.
    const dashSoftTex = grain('dash', '#4a545c', ['#424b53', '#535d65', '#3a434a'], 5);
    const fabricTex = grain('fabric', '#6b7379', ['#61696f', '#767e84', '#585f65'], 9, 256, [4, 4]);
    const headTex = grain('head', '#92999e', ['#878e93', '#9da4a9', '#7d8489'], 13, 256, [4, 4]);
    const carpetTex = grain('carpet', '#232a2f', ['#1d2429', '#2a3136', '#181f24'], 11, 128, [4, 4]);

    const M = (tex, opts = {}) =>
      new THREE.MeshStandardMaterial({
        color: opts.color ?? 0xffffff,
        map: tex ?? null,
        roughness: opts.roughness ?? 0.92,
        metalness: opts.metalness ?? 0,
        emissive: opts.emissive ?? 0x0c1013,
        emissiveIntensity: opts.emissiveIntensity ?? 1,
        envMapIntensity: opts.envMapIntensity ?? 0.35,
        side: THREE.DoubleSide,
      });
    const dashMat = M(dashSoftTex, { color: 0xb9c0c5, roughness: 0.92 });
    const dashTopMat = M(dashSoftTex, { color: 0x5d666d, roughness: 0.99 });
    const softMat = M(fabricTex, { color: 0x9ba3a9, roughness: 0.97 });
    const headMat = M(headTex, { color: 0xa9b0b5, roughness: 0.98 });
    const carpetMat = M(carpetTex, { color: 0x8a9095, roughness: 1 });
    const seatMat = M(fabricTex, { color: 0x6e767c, roughness: 0.85 });
    const trimMat = M(null, { color: 0xa3acb1, roughness: 0.3, metalness: 0.72 });
    const darkTrim = M(null, { color: 0x1d2328, roughness: 0.55 });
    const rubberMat = M(null, { color: 0x12161a, roughness: 0.62 });
    const lowerMat = M(dashSoftTex, { color: 0x7f878d, roughness: 0.95 });

    const HW = CAB.width / 2;
    const zMid = (CAB.front + CAB.rear) / 2;

    // Свет в кабине: без него салон читается как чёрная коробка.
    const cabinLamp = new THREE.PointLight(0xffe6c4, 4.6, 7, 2);
    cabinLamp.position.set(0.05, 3.12, 1.55);
    g.add(cabinLamp);
    const dashLamp = new THREE.PointLight(0xbfd7e8, 2.1, 4, 2);
    dashLamp.position.set(0.1, 2.22, 2.55);
    g.add(dashLamp);
    const rearLamp = new THREE.PointLight(0xa9c6dc, 1.5, 5, 2);
    rearLamp.position.set(0.2, 2.6, 0.3);
    g.add(rearLamp);

    // ---------------------------------------------------------------- оболочка
    box(g, CAB.width - 0.08, 0.06, 3.94, carpetMat, 0, CAB.floor + 0.02, zMid - 0.1);
    box(g, CAB.width - 0.08, 0.05, 3.94, headMat, 0, CAB.roof - 0.06, zMid - 0.1);
    box(g, CAB.width - 0.12, 2.1, 0.06, headMat, 0, 2.4, CAB.rear + 0.2);
    // боковые панели под окнами и над ними — изнутри не видно краски
    for (const sx of [-1, 1]) {
      box(g, 0.07, 0.76, 3.7, softMat, sx * (HW - 0.07), (CAB.floor + CAB.sill) / 2 + 0.02, 1.45);
      box(g, 0.07, 0.24, 3.7, headMat, sx * (HW - 0.07), CAB.roof - 0.18, 1.45);
      box(g, 0.07, 0.1, 2.9, darkTrim, sx * (HW - 0.09), CAB.sill + 0.04, 1.6);
    }
    const wsH = CAB.windshieldTop - CAB.windshieldBottom;
    const wsTilt = -Math.atan2(CAB.windshieldZ - (CAB.front - 0.06), wsH);
    // облицовка оконных проёмов: спереди, между окнами и за спальником
    for (const sx of [-1, 1]) {
      box(g, 0.08, 1.36, 0.56, softMat, sx * (HW - 0.06), 2.72, 3.16);
      box(g, 0.08, 1.36, 0.13, softMat, sx * (HW - 0.06), 2.72, 1.51);
      box(g, 0.08, 2.12, 0.62, softMat, sx * (HW - 0.06), 2.4, 0.28);
      box(g, 0.08, 0.1, 1.45, softMat, sx * (HW - 0.06), 3.36, 1.9);
      box(g, 0.08, 0.1, 1.45, softMat, sx * (HW - 0.06), 2.13, 1.9);
      box(g, 0.05, 0.34, 0.05, trimMat, sx * (HW - 0.16), 2.72, 2.98);
      // Облицовка передней стойки двери: закрывает краску кузова изнутри.
      box(g, 0.12, 1.52, 0.26, softMat, sx * (HW - 0.09), 2.72, 2.9);
      box(g, 0.1, 1.4, 0.12, softMat, sx * (HW - 0.05), 2.74, 2.72);
    }
    // облицовка стоек лобового стекла
    for (const sx of [-1, 1]) {
      box(g, 0.26, wsH + 0.2, 0.3, softMat, sx * (HW - 0.13), CAB.windshieldTop - wsH / 2, CAB.windshieldZ - 0.06, [wsTilt, 0, 0]);
      box(g, 0.1, wsH + 0.32, 0.46, softMat, sx * (HW - 0.04), CAB.windshieldTop - wsH / 2, CAB.windshieldZ - 0.16, [wsTilt, 0, 0]);
      box(g, 0.15, 0.5, 0.08, softMat, sx * (HW - 0.1), CAB.windshieldBottom - 0.24, CAB.front - 0.22, [wsTilt, 0, 0]);
    }
    // верхняя облицовка и козырьки
    box(g, CAB.width - 0.1, 0.16, 0.24, headMat, 0, CAB.windshieldTop - 0.02, CAB.windshieldZ - 0.12, [wsTilt, 0, 0]);
    for (const sx of [-0.54, 0.54]) {
      box(g, 0.78, 0.025, 0.3, softMat, sx, CAB.roof - 0.24, 2.96, [0.3, 0, 0]);
      box(g, 0.05, 0.05, 0.06, trimMat, sx + 0.41, CAB.roof - 0.22, 2.94);
    }
    // потолочный плафон
    box(g, 0.26, 0.02, 0.12, M(null, { color: 0xfff3d8, roughness: 0.4, emissive: 0xffe9bd, emissiveIntensity: 0.9 }), 0, CAB.roof - 0.1, 2.3);

    // ---------------------------------------------------------------- панель
    // Цельный профиль: от колен к стеклу, с наклонной полкой сверху.
    const dashProfile = [
      [2.52, 1.08], [2.56, 1.42], [2.64, 1.66], [2.78, 1.82],
      [3.0, 1.9], [3.22, 1.9], [3.34, 1.84],
    ];
    for (let i = 0; i < dashProfile.length - 1; i++) {
      const za = dashProfile[i][0];
      const ya = dashProfile[i][1];
      const zb = dashProfile[i + 1][0];
      const yb = dashProfile[i + 1][1];
      const len = Math.hypot(zb - za, yb - ya);
      const ang = -Math.atan2(yb - ya, zb - za);
      box(g, CAB.width - 0.1, 0.08, len + 0.02, i >= 3 ? dashTopMat : dashMat, 0, (ya + yb) / 2, (za + zb) / 2, [ang, 0, 0]);
    }
    // решётка обдува лобового стекла — разбивает «плиту» на читаемые детали
    for (let i = 0; i < 26; i++) box(g, 0.03, 0.012, 0.1, darkTrim, -1.05 + i * 0.084, 1.912, 3.18, [-0.03, 0, 0]);
    // строчка по кромке панели
    for (let i = 0; i < 30; i++) box(g, 0.028, 0.012, 0.012, M(null, { color: 0xb9c1c6, roughness: 0.7 }), -1.12 + i * 0.077, 1.9, 2.93, [-0.03, 0, 0]);
    // верхняя полка (на неё кладут документы), кромка и молдинг
    box(g, CAB.width - 0.1, 0.05, 0.5, dashTopMat, 0, 1.9, 3.06, [-0.03, 0, 0]);
    box(g, CAB.width - 0.14, 0.045, 0.06, dashTopMat, 0, 1.925, 3.32);
    box(g, CAB.width - 0.12, 0.02, 0.025, trimMat, 0, 1.72, 2.62);
    box(g, CAB.width - 0.12, 0.02, 0.025, trimMat, 0, 1.845, 3.28);
    // нижняя часть панели и перчаточный ящик
    box(g, CAB.width - 0.12, 0.36, 0.5, lowerMat, 0, 1.22, 2.72);
    box(g, 0.62, 0.26, 0.03, dashMat, 0.66, 1.2, 2.48);
    box(g, 0.2, 0.025, 0.04, trimMat, 0.66, 1.290, 2.5);
    // центральный туннель
    box(g, 0.42, 0.5, 1.2, lowerMat, 0.02, 1.48, 2.0);
    box(g, 0.44, 0.05, 1.22, dashMat, 0.02, 1.75, 2.0, [-0.03, 0, 0]);
    // воздуховоды слева и справа от водителя
    for (const sx of [-1, 1]) {
      const vx = EYE.x + sx * 0.56;
      box(g, 0.26, 0.14, 0.05, darkTrim, vx, 1.84, 2.66);
      for (let i = 0; i < 4; i++) {
        box(g, 0.2, 0.014, 0.018, M(null, { color: 0x2b3238, roughness: 0.5, metalness: 0.35 }), vx, 1.795 + i * 0.028, 2.635);
      }
      box(g, 0.27, 0.012, 0.02, trimMat, vx, 1.905, 2.64);
    }

    // ---------------------------------------------------------------- экраны
    /** Экран, повёрнутый к глазу водителя. */
    const screenOn = (w, h, mat, x, y, z) => {
      const grp = new THREE.Group();
      grp.position.set(x, y, z);
      grp.up.set(0, 1, 0);
      grp.lookAt(this.eye);
      const bezel = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, h + 0.035, 0.03), darkTrim);
      bezel.position.z = -0.025;
      grp.add(bezel);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      mesh.position.z = 0.004;
      grp.add(mesh);
      g.add(grp);
      return mesh;
    };
    // козырёк щитка приборов
    box(g, 0.66, 0.045, 0.3, dashTopMat, EYE.x, 2.16, 2.82, [0.16, 0, 0]);
    for (const sx of [-1, 1]) box(g, 0.04, 0.1, 0.22, dashMat, EYE.x + sx * 0.33, 2.1, 2.78);
    this.dashCanvas = document.createElement('canvas');
    this.dashCanvas.width = 512;
    this.dashCanvas.height = 256;
    this.dashTex = new THREE.CanvasTexture(this.dashCanvas);
    this.dashTex.colorSpace = THREE.SRGBColorSpace;
    this.dashTex.wrapS = THREE.RepeatWrapping;
    this.dashTex.repeat.x = -1;
    this.dashTex.offset.x = 1;
    this.dashScreen = screenOn(0.5, 0.25, new THREE.MeshBasicMaterial({ map: this.dashTex, side: THREE.DoubleSide }), EYE.x, 2.0, 2.78);

    // центральная консоль с навигацией
    const cx = EYE.x + 0.86;
    box(g, 0.44, 0.34, 0.26, dashMat, cx, 1.82, 2.92, [0.02, -0.1, 0]);
    box(g, 0.4, 0.04, 0.2, dashTopMat, cx, 1.99, 2.9, [0.02, -0.1, 0]);
    for (const sx of [-0.15, 0.15]) {
      box(g, 0.16, 0.1, 0.04, darkTrim, cx + sx, 1.99, 2.78);
      for (let i = 0; i < 3; i++) {
        box(g, 0.13, 0.009, 0.016, M(null, { color: 0x2b3238, roughness: 0.5, metalness: 0.35 }), cx + sx, 1.966 + i * 0.024, 2.755);
      }
    }
    this.navCanvas = document.createElement('canvas');
    this.navCanvas.width = 384;
    this.navCanvas.height = 240;
    this.navTex = new THREE.CanvasTexture(this.navCanvas);
    this.navTex.colorSpace = THREE.SRGBColorSpace;
    this.navTex.wrapS = THREE.RepeatWrapping;
    this.navTex.repeat.x = -1;
    this.navTex.offset.x = 1;
    this.navScreen = screenOn(0.32, 0.2, new THREE.MeshBasicMaterial({ map: this.navTex, side: THREE.DoubleSide }), cx, 1.9, 2.66);
    for (let i = 0; i < 4; i++) box(g, 0.055, 0.022, 0.03, trimMat, cx - 0.11 + i * 0.073, 1.72, 2.68);

    // ---------------------------------------------------------------- руль
    this.wheelPivot = new THREE.Group();
    this.wheelPivot.position.set(EYE.x, 2.0, 1.9);
    this.wheelPivot.rotation.x = -0.42;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.026, 12, 44), rubberMat);
    rim.rotation.x = Math.PI / 2;
    this.wheelPivot.add(rim);
    for (const rot of [Math.PI * 0.5, Math.PI * 1.5, 0]) {
      const w = rot === 0 ? 0.4 : 0.24;
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(w, 0.022, 0.03), darkTrim);
      spoke.position.set(Math.cos(rot) * 0.1, Math.sin(rot) * 0.1, 0);
      spoke.rotation.z = rot;
      this.wheelPivot.add(spoke);
    }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.085, 0.055, 20), darkTrim);
    hub.rotation.x = Math.PI / 2;
    this.wheelPivot.add(hub);
    const badge = new THREE.Mesh(new THREE.CircleGeometry(0.028, 18), trimMat);
    badge.position.z = 0.03;
    this.wheelPivot.add(badge);
    g.add(this.wheelPivot);
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.66, 14), darkTrim);
    column.position.set(EYE.x, 1.83, 2.2);
    column.rotation.x = Math.PI / 2 - 0.42;
    g.add(column);
    for (const sx of [-1, 1]) {
      box(g, 0.022, 0.022, 0.18, darkTrim, EYE.x + sx * 0.13, 1.9, 2.14, [0.22, 0, 0]);
      box(g, 0.05, 0.03, 0.06, trimMat, EYE.x + sx * 0.13, 1.88, 2.05);
    }

    // ---------------------------------------------------------------- сиденья
    const seat = (x, z) => {
      box(g, 0.56, 0.16, 0.62, seatMat, x, 1.58, z);
      box(g, 0.1, 0.5, 0.58, seatMat, x - 0.28, 1.82, z, [0, 0, 0.1]);
      box(g, 0.1, 0.5, 0.58, seatMat, x + 0.28, 1.82, z, [0, 0, -0.1]);
      box(g, 0.52, 0.66, 0.14, seatMat, x, 1.98, z - 0.36, [0.1, 0, 0]);
      box(g, 0.28, 0.2, 0.13, seatMat, x, 2.42, z - 0.4);
      box(g, 0.055, 0.055, 0.5, trimMat, x, 1.69, z + 0.3);
    };
    seat(EYE.x, 1.0);
    seat(0.62, 0.86);
    box(g, 0.34, 0.24, 0.3, m.darkMetal, EYE.x, 1.4, 1.0);

    // ---------------------------------------------------------------- двери
    for (const sx of [-1, 1]) {
      const x = sx * (HW - 0.1);
      box(g, 0.1, 0.14, 0.8, softMat, x - sx * 0.02, 1.62, 1.85);
      box(g, 0.06, 0.04, 0.3, trimMat, x - sx * 0.07, 1.71, 1.8);
      box(g, 0.04, 0.12, 0.24, darkTrim, x - sx * 0.08, 1.62, 2.02);
      const spk = new THREE.Mesh(new THREE.CircleGeometry(0.095, 20), darkTrim);
      spk.position.set(x - sx * 0.06, 1.9, 0.72);
      spk.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2;
      g.add(spk);
      box(g, 0.05, 0.05, 0.12, trimMat, x - sx * 0.07, 1.86, 1.48);
      // подлокотник-консоль и ручка двери
      box(g, 0.08, 0.06, 0.42, darkTrim, x - sx * 0.04, 1.98, 2.16);
    }

    // ---------------------------------------------------------------- зеркала
    /** Зеркало заднего вида: отражение неба, дороги и борта — как в салоне. */
    const mirrorTexture = (side) =>
      canvasTexture(gKey + 'mirror' + side, 256, 160, (c, w, h) => {
        const sky = c.createLinearGradient(0, 0, 0, h * 0.58);
        sky.addColorStop(0, '#8fb6d6');
        sky.addColorStop(1, '#c9d9e2');
        c.fillStyle = sky;
        c.fillRect(0, 0, w, h * 0.6);
        // дальние поля и полоса леса
        c.fillStyle = '#6d7f68';
        c.fillRect(0, h * 0.5, w, h * 0.12);
        const road = c.createLinearGradient(0, h * 0.58, 0, h);
        road.addColorStop(0, '#7d8386');
        road.addColorStop(1, '#5b6165');
        c.fillStyle = road;
        c.fillRect(0, h * 0.58, w, h * 0.42);
        // полосы разметки, уходящие в перспективу
        c.strokeStyle = 'rgba(238,238,232,0.85)';
        for (let i = 0; i < 3; i++) {
          c.lineWidth = 3 + i * 2;
          const y0 = h * 0.63 + i * 13;
          const spread = 16 + i * 34;
          c.beginPath();
          c.moveTo(w * 0.5 - spread, y0);
          c.lineTo(w * 0.5 + spread, y0 + 4);
          c.stroke();
        }
        // отбойник
        c.fillStyle = '#9aa2a4';
        c.fillRect(0, h * 0.585, w, 5);
        // борт прицепа по внутренней кромке
        c.fillStyle = '#1f5d7a';
        c.fillRect(side > 0 ? w - 20 : 0, h * 0.34, 20, h * 0.66);
        c.fillStyle = 'rgba(255,255,255,0.18)';
        c.fillRect(side > 0 ? w - 20 : 0, h * 0.34, 4, h * 0.66);
      });

    for (const sx of [-1, 1]) {
      const mx = sx * (HW + 0.34);
      // корпус зеркала
      box(g, 0.13, 0.56, 0.24, darkTrim, mx, 2.62, 2.62);
      const glassTex = mirrorTexture(sx);
      glassTex.repeat.x = -1;
      glassTex.offset.x = 1;
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.46), new THREE.MeshBasicMaterial({ map: glassTex, side: THREE.DoubleSide }));
      glass.position.set(mx - sx * 0.07, 2.62, 2.62);
      g.add(glass);
      glass.lookAt(this.eye);
      // широкоугольная вставка снизу
      const wide = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.1), new THREE.MeshBasicMaterial({ map: mirrorTexture(-sx), side: THREE.DoubleSide }));
      wide.position.set(mx - sx * 0.06, 2.32, 2.62);
      g.add(wide);
      wide.lookAt(this.eye);
      // кронштейны
      box(g, 0.42, 0.035, 0.035, darkTrim, sx * (HW + 0.16), 2.94, 2.66);
      box(g, 0.035, 0.34, 0.035, darkTrim, sx * (HW + 0.32), 2.78, 2.66);
    }

    // ---------------------------------------------------------------- дворники
    for (const sx of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(sx * 0.4, CAB.windshieldBottom + 0.02, CAB.windshieldZ + 0.12);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.014, 0.014), rubberMat);
      arm.position.x = sx * 0.085;
      pivot.add(arm);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.018, 0.016), rubberMat);
      blade.position.set(sx * 0.42, -0.012, 0.008);
      pivot.add(blade);
      g.add(pivot);
      this.wipers.push(pivot);
    }

    // ---------------------------------------------------------------- свет
    this.cabinLight = new THREE.PointLight(0xfff0d8, 2.6, 6.5, 2);
    this.cabinLight.position.set(0.0, CAB.roof - 0.35, 2.05);
    g.add(this.cabinLight);
    // подсветка панели: узкая полоса по кромке
    box(g, CAB.width - 0.3, 0.012, 0.012, M(null, { color: 0xffc987, roughness: 0.5, emissive: 0xff9d3c, emissiveIntensity: 0.5 }), 0, 1.895, 3.3, [-0.03, 0, 0]);

    this.interiorVisible = true;
    g.visible = true;
    // Салон статичен, кроме руля и экранов: склеиваем обшивку по материалам.
    mergeStatic(g, [this.wheelPivot]);
    this.applyShadowFlags(this.shadowOn !== false);
  }

  buildLights() {
    this.headlights = new THREE.Group();
    this.root.add(this.headlights);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0.09, depthWrite: false });
    for (const x of [-0.76, 0.76]) {
      const beam = new THREE.Mesh(new THREE.ConeGeometry(2.4, 28, 14, 1, true), beamMat);
      beam.rotation.x = -Math.PI / 2;
      beam.position.set(x, 1.0, 17);
      this.headlights.add(beam);
    }
    this.headlights.visible = false;
    this.beamMat = beamMat;
  }

  // ------------------------------------------------------------------ API
  setPaint(hex) {
    this.paint.color.setHex(hex);
    this.paintDark.color.setHex(hex).multiplyScalar(0.55);
  }

  setNight(night, lightsOn) {
    this.headlights.visible = !!lightsOn;
    this.beamMat.opacity = 0.04 + (night || 0) * 0.08;
    this.headlightMat.emissiveIntensity = lightsOn ? 2.4 : 0.45;
    this.mats.lamp.emissiveIntensity = lightsOn ? 1.5 : 0.5;
  }

  setIndicator(dir, on) {
    const mat = dir < 0 ? this.indicatorMatL : this.indicatorMatR;
    mat.emissiveIntensity = on ? 2.6 : 0.15;
  }

  setBrakeLights(on) {
    for (const mesh of this.brakeLights) mesh.material.emissiveIntensity = on ? 2.4 : 0.7;
  }

  update(status, dt, opts = {}) {
    const { steer = 0, trailerType, company } = opts;
    if (trailerType && this.currentTrailer !== trailerType + '|' + company) {
      this.currentTrailer = trailerType + '|' + company;
      this.buildTrailer(trailerType, company || 'NordTrans');
    }
    const spin = (Math.abs(status.speedKmh || 0) / 3.6 / WHEEL_R) * dt;
    for (const w of this.wheels) w.rotation.x -= status.speedKmh < 0 ? -spin : spin;
    // steer приходит в -1..1; вправо (steer>0) — колёса к -x, руль по часовой.
    for (const w of this.frontWheels) w.rotation.y = -steer * 0.42;
    if (this.wheelPivot) this.wheelPivot.rotation.z = -steer * 1.05;
    const wiperOn = (opts.rain || 0) > 0.15;
    if (this.wipers.length) {
      this.wiperPhase = (this.wiperPhase || 0) + dt * (wiperOn ? 4.2 : 0);
      const a = wiperOn ? Math.abs(Math.sin(this.wiperPhase)) * 0.72 : 0;
      this.wipers.forEach((w, i) => (w.rotation.z = (i === 0 ? -1 : 1) * a));
    }
    this.dashAcc = (this.dashAcc || 0) + dt;
    if (this.dashAcc > 0.08) {
      this.dashAcc = 0;
      this.drawDash(status);
    }
  }

  drawDash(status) {
    const c = this.dashCanvas.getContext('2d');
    const w = this.dashCanvas.width;
    const h = this.dashCanvas.height;
    const bg = c.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#243138');
    bg.addColorStop(1, '#0e161a');
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);
    // лёгкая рамка экрана
    c.strokeStyle = 'rgba(130,165,175,0.35)';
    c.lineWidth = 2;
    c.strokeRect(3, 3, w - 6, h - 6);

    const dial = (cx, cy, r, value, max, unit, label, color, digits, redFrom = 0.85) => {
      c.save();
      c.translate(cx, cy);
      const A0 = Math.PI * 0.78;
      const SWEEP = Math.PI * 1.44;
      for (let i = 0; i <= 28; i++) {
        const a = A0 + (SWEEP * i) / 28;
        const big = i % 4 === 0;
        const r1 = r - (big ? 11 : 6);
        c.strokeStyle = i / 28 > redFrom ? '#e2564a' : big ? '#cdd9df' : 'rgba(150,175,185,0.4)';
        c.lineWidth = big ? 3 : 2;
        c.beginPath();
        c.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
        c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        c.stroke();
      }
      const pct = clamp((value || 0) / max, 0, 1);
      c.lineCap = 'round';
      c.lineWidth = 7;
      c.strokeStyle = color;
      c.beginPath();
      c.arc(0, 0, r - 20, A0, A0 + SWEEP * pct);
      c.stroke();
      c.lineCap = 'butt';
      const a = A0 + SWEEP * pct;
      c.strokeStyle = '#ff8f6b';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(Math.cos(a) * (r - 26), Math.sin(a) * (r - 26));
      c.stroke();
      c.fillStyle = '#0b1114';
      c.globalAlpha = 0.55;
      c.beginPath();
      c.arc(0, 0, 5, 0, Math.PI * 2);
      c.fill();
      c.globalAlpha = 1;
      // цифры и подписи — по центру, с ограничением ширины
      c.textAlign = 'center';
      c.textBaseline = 'alphabetic';
      c.fillStyle = '#eef7fa';
      c.font = `bold ${digits}px system-ui, Arial`;
      c.fillText(String(Math.round(value || 0)), 0, 22, r * 1.4);
      c.fillStyle = '#8ba0a8';
      c.font = 'bold 14px system-ui, Arial';
      c.fillText(unit, 0, 44, r * 1.3);
      c.fillStyle = 'rgba(165,190,200,0.75)';
      c.font = 'bold 11px system-ui, Arial';
      c.fillText(label, 0, r * 0.66, r * 1.4);
      c.restore();
    };
    dial(118, 112, 84, status.speedKmh, 125, 'КМ/Ч', 'СКОРОСТЬ', '#5fc8ef', 40);
    dial(394, 112, 84, status.rpm, 2400, 'ОБ/МИН', 'ОБОРОТЫ', '#f2c14e', 34);

    // Центральный блок: передача, топливо, температура.
    const bx = 212;
    const bw = 88;
    c.fillStyle = 'rgba(19,29,34,0.94)';
    if (c.roundRect) {
      c.beginPath();
      c.roundRect(bx, 40, bw, 142, 12);
      c.fill();
      c.strokeStyle = 'rgba(120,150,160,0.26)';
      c.lineWidth = 2;
      c.stroke();
    } else {
      c.fillRect(bx, 40, bw, 142);
    }
    const mx = bx + bw / 2;
    c.textAlign = 'center';
    c.fillStyle = '#8ba0a8';
    c.font = 'bold 11px system-ui, Arial';
    c.fillText('ПЕРЕДАЧА', mx, 60, bw - 12);
    c.fillStyle = status.autoGearbox === false ? '#7fe0a8' : '#f2c14e';
    c.font = 'bold 52px system-ui, Arial';
    c.fillText(status.gear === -1 ? 'R' : status.gear === 0 ? 'N' : String(status.gear || 1), mx, 110, bw - 12);
    const fuelPct = clamp((status.fuel || 0) / 480, 0, 1);
    c.fillStyle = 'rgba(120,150,160,0.24)';
    c.fillRect(bx + 14, 126, bw - 28, 7);
    c.fillStyle = fuelPct < 0.15 ? '#e2564a' : '#7fe0a8';
    c.fillRect(bx + 14, 126, (bw - 28) * fuelPct, 7);
    c.fillStyle = '#9fb2ba';
    c.font = 'bold 10px system-ui, Arial';
    c.fillText('ТОПЛИВО ' + Math.round(status.fuel || 0) + ' л', mx, 148, bw - 10);
    const tempPct = clamp(((status.temp || 80) - 40) / 80, 0, 1);
    c.fillStyle = 'rgba(120,150,160,0.24)';
    c.fillRect(bx + 14, 156, bw - 28, 7);
    c.fillStyle = (status.temp || 0) > 100 ? '#e2564a' : '#5fc8ef';
    c.fillRect(bx + 14, 156, (bw - 28) * tempPct, 7);
    c.fillStyle = '#9fb2ba';
    c.font = 'bold 10px system-ui, Arial';
    c.fillText('ОЖ ' + Math.round(status.temp || 0) + '°C', mx, 176, bw - 10);

    // Нижняя строка: часы, пробег, круиз.
    c.strokeStyle = 'rgba(110,140,150,0.16)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(16, 198);
    c.lineTo(w - 16, 198);
    c.stroke();
    c.textBaseline = 'middle';
    c.font = 'bold 15px system-ui, Arial';
    c.textAlign = 'left';
    c.fillStyle = '#d7e6ea';
    c.fillText(status.clock != null ? fmtTime(status.clock) : '--:--', 18, 216, 90);
    c.textAlign = 'center';
    c.fillStyle = '#93a9b1';
    c.fillText(status.odometer != null ? Math.round(status.odometer).toLocaleString('ru-RU') + ' КМ' : '—', w / 2, 216, 190);
    c.textAlign = 'right';
    c.fillStyle = status.cruise ? '#7fe0a8' : '#5d7078';
    c.fillText(status.cruise ? 'КРУИЗ ' + Math.round(status.cruise) : 'КРУИЗ —', w - 18, 216, 150);
    c.textBaseline = 'alphabetic';
    this.dashTex.needsUpdate = true;
  }

  drawNav(info) {
    const c = this.navCanvas.getContext('2d');
    const w = this.navCanvas.width;
    const h = this.navCanvas.height;
    const grd = c.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#0d2027');
    grd.addColorStop(1, '#071114');
    c.fillStyle = grd;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(95,200,239,0.35)';
    c.lineWidth = 3;
    c.strokeRect(6, 6, w - 12, h - 12);
    c.textAlign = 'center';
    c.fillStyle = '#5fc8ef';
    c.font = 'bold 22px system-ui, Arial';
    c.fillText(info.title || 'МАРШРУТ', w / 2, 42, w - 30);
    // стрелка поворота
    c.save();
    c.translate(w / 2, 84);
    c.fillStyle = '#5fc8ef';
    c.beginPath();
    c.moveTo(0, -16);
    c.lineTo(16, 4);
    c.lineTo(6, 4);
    c.lineTo(6, 18);
    c.lineTo(-6, 18);
    c.lineTo(-6, 4);
    c.lineTo(-16, 4);
    c.closePath();
    c.fill();
    c.restore();
    c.fillStyle = '#f0f7f9';
    c.font = 'bold 46px system-ui, Arial';
    c.fillText(info.distance || '—', w / 2, 170, w - 30);
    c.fillStyle = '#93a9b0';
    c.font = 'bold 20px system-ui, Arial';
    c.fillText(info.eta || '', w / 2, 198, w - 30);
    if (info.sub) {
      c.fillStyle = '#f2c14e';
      c.font = 'bold 16px system-ui, Arial';
      c.fillText(info.sub, w / 2, 222, w - 30);
    }
    this.navTex.needsUpdate = true;
  }

  setInteriorVisible(v) {
    if (this.interiorVisible === v) return;
    this.interiorVisible = v;
    this.interior.visible = v;
    // Изнутри лобовое стекло не рисуем — иначе обзор тонируется и «плывёт».
    if (this.windshield) this.windshield.visible = !v;
  }

  setPosition(x, y, z, hdg, pitch = 0, roll = 0) {
    this.root.position.set(x, y, z);
    this.root.rotation.set(pitch, hdg, roll, 'YXZ');
  }

  setTrailerAngle(a, roll = 0) {
    if (!this.trailerGroup) return;
    // rotation.order по умолчанию XYZ: сначала рыскание, потом крен вокруг продольной оси.
    this.trailerGroup.rotation.set(0, a, roll, 'YXZ');
  }

  dispose() {
    this.scene.remove(this.root);
  }
}

export { CAB, EYE };
