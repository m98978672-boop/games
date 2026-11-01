// 3D-модель тягача AURIGA: кабина, шасси, колёса, полуприцепы и полноценный салон.
// Всё строится из примитивов и профилей, материалы — из materials.js (общий кэш).
import * as THREE from 'three';
import { materials, trailerTexture } from './materials.js';
import { clamp, fmtTime } from '../core/math.js';

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
const EYE = { x: -0.55, y: 2.5, z: 1.35 };
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
    const ws = plane(g, 2.22, wsH, m.glass, 0, wsY, wsZ + 0.02, [wsTilt, 0, 0]);
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
      const arm = box(g, 0.5, 0.05, 0.05, m.darkMetal, side * (HW + 0.24), 3.3, 2.98);
      arm.rotation.z = side * -0.08;
      box(g, 0.1, 0.74, 0.3, this.trimDark, side * (HW + 0.5), 2.92, 2.98);
      plane(g, 0.24, 0.64, m.mirror, side * (HW + 0.44), 2.92, 2.98, [0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0]);
      box(g, 0.08, 0.22, 0.2, this.trimDark, side * (HW + 0.46), 2.42, 2.96);
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
      const ind = box(g, 0.2, 0.1, 0.08, sx < 0 ? this.indicatorMatL : this.indicatorMatR, sx * 1.14, 1.06, CAB.front + 0.33);
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
    const bodyMaterials = (sideTex, baseColor, roughness = 0.8) => {
      const side = new THREE.MeshStandardMaterial({ map: sideTex, roughness, metalness: 0.06 });
      side.__generated = true;
      const mirrored = sideTex.clone();
      mirrored.needsUpdate = true;
      mirrored.wrapS = THREE.RepeatWrapping;
      mirrored.repeat.x = -1;
      mirrored.offset.x = 1;
      const sideL = new THREE.MeshStandardMaterial({ map: mirrored, roughness, metalness: 0.06 });
      sideL.__generated = true;
      const top = new THREE.MeshStandardMaterial({ color: baseColor, roughness: Math.min(1, roughness + 0.12) });
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
      const tex = trailerTexture(company, '#cf5b3a');
      tex.repeat.set(1, 1);
      boxBody(bodyMaterials(tex, 0xcf5b3a, 0.66));
      // вертикальные рёбра жёсткости
      for (let i = 0; i < 26; i++) {
        box(g, 2.545, height - 0.08, 0.05, new THREE.MeshStandardMaterial({ color: 0xbf5132, roughness: 0.7 }), 0, yc, nose - 0.35 - i * 0.5);
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
    // Задние двери/фурнитура.
    if (type !== 'flatbed' && type !== 'log' && type !== 'tank') {
      for (const sx of [-1, 1]) {
        box(g, 0.05, height - 0.1, 0.05, m.darkMetal, sx * 0.63, yc, tail - 0.01);
        box(g, 0.05, 0.86, 0.05, m.chrome, sx * 0.96, yc - 0.18, tail - 0.04);
      }
      box(g, 2.5, 0.08, 0.1, m.chrome, 0, 1.5, tail - 0.03);
      box(g, 0.1, height - 0.4, 0.08, this.trimDark, 0, yc, tail - 0.02);
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
    this.root.add(g);
    const D = (opts = {}) =>
      new THREE.MeshStandardMaterial({
        color: opts.color ?? 0x2f373c,
        roughness: opts.roughness ?? 0.92,
        metalness: opts.metalness ?? 0,
        emissive: 0x0a0f12,
        emissiveIntensity: 1,
        side: THREE.DoubleSide,
      });
    const dashMat = D({ color: 0x424b52 });
    const softMat = D({ color: 0x4d575e });
    const floorMat = D({ color: 0x262c31 });
    const roofMat = D({ color: 0x646e75 });
    const seatMat = D({ color: 0x4a5a66, roughness: 0.98 });
    const trimMat = D({ color: 0x5c676e, roughness: 0.45, metalness: 0.4 });
    const rubberMat = D({ color: 0x1c2124 });

    // Пол, потолок, задняя стенка с полкой спальника.
    box(g, 2.28, 0.08, 3.96, floorMat, 0, CAB.floor - 0.04, (CAB.front + CAB.rear) / 2);
    box(g, 2.34, 0.06, 3.9, roofMat, 0, CAB.roof - 0.14, (CAB.front + CAB.rear) / 2);
    box(g, 2.34, 0.14, 0.28, softMat, 0, CAB.windshieldTop + 0.06, CAB.front - 0.18, [0.18, 0, 0]); // полка над лобовым
    box(g, 2.32, 2.1, 0.08, softMat, 0, 2.16, CAB.rear + 0.12);

    // Панель приборов: нижняя тумба (до 1.78 м), наклонный капот к стеклу,
    // поверх него — щиток приборов с козырьком и экран навигации.
    box(g, 2.32, 0.5, 0.9, dashMat, 0, 1.53, 2.95);
    box(g, 2.32, 0.09, 0.62, dashMat, 0, 1.82, 3.14, [-0.2, 0, 0]);
    box(g, 2.34, 0.16, 0.2, dashMat, 0, 2.02, 3.36);
    // дефлекторы обдува у стоек
    for (const sx of [-1, 1]) {
      box(g, 0.26, 0.14, 0.06, m.darkMetal, sx * 0.98, 2.04, 3.26);
      for (let i = 0; i < 3; i++) box(g, 0.24, 0.012, 0.03, trimMat, sx * 0.98, 2.0 + i * 0.045, 3.23);
    }

    /** Приборный блок: рамка, повёрнутая к глазу водителя, и экран в ней. */
    this.eye = new THREE.Vector3(EYE.x, EYE.y, EYE.z);
    const screenOn = (w, h, mat, x, y, z) => {
      const grp = new THREE.Group();
      grp.position.set(x, y, z);
      // +z экрана смотрит в глаз водителя, «верх» остаётся мировым (без крена).
      grp.up.set(0, 1, 0);
      grp.lookAt(this.eye);
      const bezel = new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, h + 0.05, 0.05), dashMat);
      bezel.position.z = -0.04;
      grp.add(bezel);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      mesh.position.z = 0.002;
      grp.add(mesh);
      grp.add(new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, 0.02, 0.06), trimMat));
      g.add(grp);
      return mesh;
    };

    // Щиток приборов (канвас), перед рулём и чуть выше него.
    this.dashCanvas = document.createElement('canvas');
    this.dashCanvas.width = 512;
    this.dashCanvas.height = 256;
    this.dashTex = new THREE.CanvasTexture(this.dashCanvas);
    this.dashTex.colorSpace = THREE.SRGBColorSpace;
    this.dashScreen = screenOn(0.46, 0.23, new THREE.MeshBasicMaterial({ map: this.dashTex }), EYE.x - 0.02, 2.06, 2.7);

    // Центральная консоль: экран навигации (слева от водителя).
    const cx = EYE.x + 0.86;
    this.navCanvas = document.createElement('canvas');
    this.navCanvas.width = 384;
    this.navCanvas.height = 240;
    this.navTex = new THREE.CanvasTexture(this.navCanvas);
    this.navTex.colorSpace = THREE.SRGBColorSpace;
    this.navScreen = screenOn(0.34, 0.21, new THREE.MeshBasicMaterial({ map: this.navTex }), cx, 2.06, 2.74);
    for (let i = 0; i < 3; i++) box(g, 0.09, 0.03, 0.04, trimMat, cx - 0.1 + i * 0.1, 1.9, 2.68);
    box(g, 0.15, 0.15, 0.03, trimMat, cx + 0.02, 1.74, 2.7);

    // Руль на наклонённой колонке.
    this.wheelPivot = new THREE.Group();
    this.wheelPivot.position.set(EYE.x, 1.82, 2.2);
    this.wheelPivot.rotation.x = -0.3;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.235, 0.028, 10, 32), rubberMat);
    rim.rotation.x = Math.PI / 2;
    this.wheelPivot.add(rim);
    for (const [rot, w] of [[0, 0.44], [Math.PI, 0.3], [Math.PI * 0.62, 0.15], [Math.PI * 1.38, 0.15]]) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(w, 0.028, 0.04), trimMat);
      spoke.position.set(Math.cos(rot) * 0.12, Math.sin(rot) * 0.12, 0);
      spoke.rotation.z = rot;
      this.wheelPivot.add(spoke);
    }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.045, 16), trimMat);
    hub.rotation.x = Math.PI / 2;
    this.wheelPivot.add(hub);
    const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 14), m.chrome);
    horn.rotation.x = Math.PI / 2;
    horn.position.z = -0.02;
    this.wheelPivot.add(horn);
    g.add(this.wheelPivot);
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.5, 12), dashMat);
    column.position.set(EYE.x, 1.76, 2.5);
    column.rotation.x = Math.PI / 2 + 0.38;
    g.add(column);
    for (const sx of [-1, 1]) box(g, 0.035, 0.035, 0.22, trimMat, EYE.x + sx * 0.2, 1.8, 2.36);

    // Сиденья.
    const seat = (x, z, w = 0.54) => {
      box(g, w, 0.14, 0.58, seatMat, x, 1.62, z);
      box(g, w - 0.04, 1.0, 0.15, seatMat, x, 2.16, z - 0.28, [0.14, 0, 0]);
      box(g, w - 0.16, 0.2, 0.12, seatMat, x, 2.68, z - 0.36);
      box(g, w + 0.06, 0.06, 0.1, trimMat, x, 1.7, z + 0.26);
      for (const sx of [-1, 1]) box(g, 0.1, 0.1, 0.4, trimMat, x + sx * (w / 2 - 0.02), 1.72, z);
    };
    seat(EYE.x, 1.24);
    seat(0.62, 1.24);
    // пневмоподвеска сиденья водителя
    box(g, 0.34, 0.26, 0.3, m.darkMetal, EYE.x, 1.44, 1.24);

    // Дверные панели с подлокотниками, ручками и динамиками.
    for (const sx of [-1, 1]) {
      const x = sx * (CAB.width / 2 - 0.09);
      box(g, 0.06, 1.0, 2.5, softMat, x, 1.62, 1.7);
      box(g, 0.1, 0.16, 1.0, trimMat, x - sx * 0.05, 1.36, 1.72);
      box(g, 0.06, 0.06, 0.34, trimMat, x - sx * 0.05, 1.2, 1.5);
      const spk = new THREE.Mesh(new THREE.CircleGeometry(0.1, 18), m.darkMetal);
      spk.position.set(x - sx * 0.03, 1.74, 0.72);
      spk.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2;
      g.add(spk);
      // стойка лобового стекла изнутри
      box(g, 0.1, 1.2, 0.1, softMat, sx * (CAB.width / 2 - 0.1), 2.6, 3.06, [-0.28, 0, -sx * 0.05]);
    }

    // Спальник, шторка, полка, плафон.
    box(g, 1.9, 0.22, 1.0, softMat, 0, 1.66, 0.0);
    box(g, 1.86, 0.14, 0.96, D({ color: 0x74838e }), 0, 1.82, 0.0);
    const curtain = new THREE.Mesh(new THREE.PlaneGeometry(1.86, 1.5, 10, 1), D({ color: 0x2c373f, roughness: 1 }));
    curtain.position.set(0, 2.6, 0.86);
    g.add(curtain);
    box(g, 1.9, 0.05, 0.05, m.chrome, 0, 3.34, 0.86);
    box(g, 1.5, 0.05, 0.32, softMat, 0, 3.3, 0.2);
    box(g, 0.28, 0.03, 0.1, m.lamp, 0.4, CAB.roof - 0.19, 1.9);

    // КПП, ручник, кнопки на панели.
    box(g, 0.05, 0.34, 0.05, m.darkMetal, EYE.x + 0.36, 1.5, 1.9);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), trimMat);
    knob.position.set(EYE.x + 0.36, 1.69, 1.9);
    g.add(knob);
    box(g, 0.04, 0.22, 0.04, m.chrome, -0.02, 1.44, 1.94);

    // Козырьки и зеркало салона.
    for (const sx of [-0.55, 0.55]) box(g, 0.86, 0.12, 0.28, softMat, sx, CAB.roof - 0.2, 2.86, [0.2, 0, 0]);
    box(g, 0.24, 0.12, 0.03, m.mirror, 0, CAB.roof - 0.28, 2.96);

    // Дворники на стекле.
    for (const sx of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(sx * 0.34, CAB.windshieldBottom + 0.04, CAB.front - 0.16);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.02, 0.02), rubberMat);
      blade.position.x = sx * 0.36;
      pivot.add(blade);
      g.add(pivot);
      this.wipers.push(pivot);
    }

    this.interiorVisible = true;
    g.visible = true;
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
    for (const w of this.frontWheels) w.rotation.y = steer * 0.42;
    if (this.wheelPivot) this.wheelPivot.rotation.z = -steer * 2.9;
    const wiperOn = (opts.rain || 0) > 0.15;
    if (this.wipers.length) {
      this.wiperPhase = (this.wiperPhase || 0) + dt * (wiperOn ? 4.2 : 0);
      const a = wiperOn ? Math.abs(Math.sin(this.wiperPhase)) * 0.95 : 0;
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
    bg.addColorStop(0, '#101a20');
    bg.addColorStop(1, '#05090b');
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);
    // лёгкая рамка экрана
    c.strokeStyle = 'rgba(110,140,150,0.22)';
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

  setTrailerAngle(a) {
    if (this.trailerGroup) this.trailerGroup.rotation.y = a;
  }

  dispose() {
    this.scene.remove(this.root);
  }
}

export { CAB, EYE };
