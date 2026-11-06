// 3D-модель тягача AURIGA: кабина, шасси, колёса, полуприцепы и полноценный салон.
// Всё строится из примитивов и профилей, материалы — из materials.js (общий кэш).
import * as THREE from 'three';
import { materials, trailerTexture, trailerRearTexture, containerTexture, containerRoofTexture, canvasTexture } from './materials.js';
import { clamp, fmtTime, rng } from '../core/math.js';
import { mergeStatic } from '../core/merge-static.js';
import { lookFor } from './truck-look.js';

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

/**
 * Габариты полуприцепов. Длина совпадает с `TRAILERS` в `data/cargo.js`
 * (её использует физика сцепки), высота и пол — только для внешнего вида.
 */
export const TRAILER_SPECS = {
  curtain: { length: 13.6, height: 2.62, floor: 1.42, kind: 'box' },
  fridge: { length: 13.6, height: 2.66, floor: 1.42, kind: 'box' },
  tank: { length: 13.2, height: 2.32, floor: 1.42, axisY: 2.4, radius: 1.16, kind: 'tank' },
  flatbed: { length: 13.7, height: 0.18, floor: 1.5, kind: 'flat' },
  container: { length: 13.6, height: 2.62, floor: 1.42, kind: 'box' },
  log: { length: 14.0, height: 2.4, floor: 1.5, kind: 'log' },
  tipper: { length: 12.4, height: 1.55, floor: 1.46, kind: 'tipper' },
  lowboy: { length: 14.6, height: 0.55, floor: 1.2, kind: 'lowboy' },
};

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
 * Простая склейка индексированных геометрий с position/normal/uv — нужна,
 * чтобы диск и болты стали одним мешем. Повороты уже применены к геометрии.
 */
function mergeGeometriesLocal(list) {
  let verts = 0;
  let indices = 0;
  for (const g of list) {
    verts += g.attributes.position.count;
    indices += g.index ? g.index.count : g.attributes.position.count;
  }
  const pos = new Float32Array(verts * 3);
  const nor = new Float32Array(verts * 3);
  const uv = new Float32Array(verts * 2);
  const idx = new Uint32Array(indices);
  let vo = 0;
  let io = 0;
  for (const g of list) {
    if (!g.attributes.normal) g.computeVertexNormals();
    if (!g.attributes.uv) {
      g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    }
    pos.set(g.attributes.position.array, vo * 3);
    nor.set(g.attributes.normal.array, vo * 3);
    uv.set(g.attributes.uv.array, vo * 2);
    if (g.index) {
      const src = g.index.array;
      for (let i = 0; i < src.length; i++) idx[io + i] = src[i] + vo;
      io += src.length;
    } else {
      for (let i = 0; i < g.attributes.position.count; i++) idx[io + i] = i + vo;
      io += g.attributes.position.count;
    }
    vo += g.attributes.position.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  out.computeBoundingSphere();
  return out;
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
  constructor(scene, paintHex = 0x2f7fa8, modelId = 'auriga-4') {
    this.scene = scene;
    this.modelId = modelId;
    this.look = lookFor(modelId);
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
    this.rimWithBolts = this.buildRimGeometry();
    this.capGeo = new THREE.CylinderGeometry(WHEEL_R * 0.3, WHEEL_R * 0.34, 0.26, 16);

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

  /**
   * Колёсный диск с «впаянными» болтами: 6 отдельных мешей на колесо — это
   * 84 лишних draw call на автопоезд. Собираем один меш на колесо.
   */
  buildRimGeometry() {
    const rim = this.rimGeo.clone();
    const parts = [rim];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const bolt = new THREE.CylinderGeometry(0.022, 0.022, 0.28, 6);
      bolt.rotateX(Math.PI / 2);
      bolt.translate(0, Math.cos(a) * WHEEL_R * 0.44, Math.sin(a) * WHEEL_R * 0.44);
      parts.push(bolt);
    }
    return mergeGeometriesLocal(parts);
  }

  addWheels(group, opts) {
    const { front, rear, width, steer, trailer = false, rimMat = null, capMat = null } = opts;
    const m = this.mats;
    const make = (x, z, isFront) => {
      const w = new THREE.Group();
      const tyre = new THREE.Mesh(this.tyreGeo, m.tyres);
      w.add(tyre);
      const rim = new THREE.Mesh(this.rimWithBolts || this.rimGeo, rimMat || m.rim);
      w.add(rim);
      const cap = new THREE.Mesh(this.capGeo, capMat || m.chrome);
      w.add(cap);
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
  /**
   * Тягач собирается под профиль внешности конкретной модели (`look`):
   * высота крыши и обтекатели, решётка, оптика, бампер, зеркала, юбки,
   * число задних мостов, выхлоп и крылья. Силуэт кабины общий с салоном —
   * поэтому камера и приборная панель не «переезжают» от модели к модели.
   */
  buildTractor() {
    const m = this.mats;
    const g = (this.tractor = new THREE.Group());
    g.name = 'tractor';
    this.root.add(g);
    const look = this.look || lookFor('auriga-4');
    const HW = CAB.width / 2;
    const cabLen = CAB.front - CAB.rear;
    const cabMid = (CAB.front + CAB.rear) / 2;
    const chrome = look.chrome ? m.chrome : m.darkMetal;
    const aluminium = (this.aluMat =
      this.aluMat || new THREE.MeshStandardMaterial({ color: 0xd6dade, metalness: 0.92, roughness: 0.26 }));
    const accent = (this.accentMat =
      this.accentMat || new THREE.MeshStandardMaterial({ color: 0xe0c27a, metalness: 0.35, roughness: 0.34 }));
    accent.color.setHex(look.accent ?? 0xe0c27a);
    const rimMat = look.wheels === 'alu' ? aluminium : m.rim;
    const tankMat = look.tank === 'alu' ? aluminium : this.paint;
    // Свет прицепа уже мог быть собран к моменту смены модели — его не теряем.
    this.indicatorLights = {
      left: (this.indicatorLights?.left || []).filter((l) => l.userData.trailer),
      right: (this.indicatorLights?.right || []).filter((l) => l.userData.trailer),
    };
    this.brakeLights = (this.brakeLights || []).filter((l) => l.userData.trailer);

    /** Кольцо-обруч вокруг бака (плоскость кольца перпендикулярна оси Z). */
    const strap = (x, y, z, r, mat = m.darkMetal) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.022, 6, 20), mat);
      ring.position.set(x, y, z);
      g.add(ring);
      return ring;
    };

    // ---------------------------------------------------------------- рама
    // Длина рамы считается от мостов: за последним мостом остаётся ~1.3 м
    // свеса (фонари, брызговики, площадка), а не «хвост» в три метра.
    const rearZs = look.rearAxles === 2 ? [-1.15, -2.1] : [-1.5];
    const tailZ = Math.min(...rearZs) - 1.35;
    const frameFront = 2.85;
    const frameLen = frameFront - tailZ;
    const frameMid = (frameFront + tailZ) / 2;
    for (const sx of [-1, 1]) box(g, 0.14, 0.3, frameLen, m.darkMetal, sx * 0.45, 1.02, frameMid);
    for (let z = frameFront - 0.4; z > tailZ + 0.2; z -= 0.95) box(g, 0.9, 0.1, 0.12, m.darkMetal, 0, 1.0, z);
    box(g, 1.06, 0.2, 0.18, m.darkMetal, 0, 0.96, tailZ + 0.06);
    // площадка за кабиной — на неё водитель залезает при сцепке
    const deckZ = CAB.rear - 0.62;
    box(g, 1.6, 0.05, 0.9, m.metal, 0, 1.2, deckZ);
    for (let z = deckZ + 0.38; z > deckZ - 0.45; z -= 0.17) box(g, 1.56, 0.012, 0.05, m.darkMetal, 0, 1.23, z);

    // ---------------------------------------------------------------- седло
    box(g, 1.16, 0.12, 1.0, m.metal, 0, 1.2, -1.6);
    box(g, 1.0, 0.05, 0.86, m.darkMetal, 0, 1.27, -1.6);
    box(g, 0.26, 0.12, 0.2, m.darkMetal, 0, 1.16, -1.06); // замок
    box(g, 0.46, 0.06, 0.06, chrome, -0.66, 1.12, -1.06); // рукоятка расцепки
    // спиральные шланги и кабель к прицепу
    for (const [dx, dz] of [[-0.34, -0.42], [-0.22, -0.5]]) {
      const coil = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 6, 14), m.darkMetal);
      coil.position.set(dx, 1.34, dz);
      coil.rotation.x = Math.PI / 2;
      g.add(coil);
    }

    // ---------------------------------------------------------------- баки и ящики
    for (const sx of [-1, 1]) {
      cylinder(g, 0.36, 0.36, 1.9, tankMat, sx * 1.18, 0.8, 0.45, 'z', 22);
      for (const dz of [-0.6, 0.6]) strap(sx * 1.18, 0.8, 0.45 + dz, 0.375);
      cylinder(g, 0.1, 0.1, 0.06, chrome, sx * 1.18, 0.8, 1.42, 'z', 12);
      // ступенька на баке
      box(g, 0.34, 0.03, 0.5, m.darkMetal, sx * 1.2, 1.17, 0.75);
      // брызговик между баком и кабиной
      box(g, 0.04, 0.5, 0.62, this.trimDark, sx * 1.24, 0.9, 1.5);
    }
    // AdBlue и аккумуляторный ящик
    box(g, 0.36, 0.46, 0.5, m.metal, 1.16, 0.86, -0.5);
    box(g, 0.38, 0.05, 0.52, m.darkMetal, 1.16, 1.1, -0.5);
    box(g, 0.5, 0.42, 0.64, m.darkMetal, -1.0, 0.78, -0.7);
    for (let i = 0; i < 3; i++) box(g, 0.52, 0.02, 0.03, m.metal, -1.0, 0.93 - i * 0.1, -1.0);
    // воздушные баллоны
    cylinder(g, 0.14, 0.14, 0.7, m.metal, -0.95, 0.5, 0.1, 'z', 14);
    cylinder(g, 0.14, 0.14, 0.55, m.metal, -0.95, 0.5, -0.62, 'z', 14);

    // ---------------------------------------------------------------- юбки
    if (look.skirts) {
      for (const sx of [-1, 1]) {
        box(g, 0.05, 0.72, 2.0, this.paintDark, sx * 1.3, 0.66, 0.5);
        box(g, 0.06, 0.04, 2.0, m.rubberTrim || m.darkMetal, sx * 1.3, 0.3, 0.5);
        box(g, 0.02, 0.05, 1.7, accent, sx * 1.33, 0.92, 0.5);
      }
    }

    // ---------------------------------------------------------------- кабина: низ
    const shellH = CAB.sill - CAB.skirt;
    const shellLen = CAB.front - CAB.rear;
    const shellY = CAB.skirt + shellH / 2;
    for (const sx of [-1, 1]) box(g, 0.07, shellH, shellLen, this.paint, sx * (HW - 0.035), shellY, cabMid);
    box(g, CAB.width, shellH - 0.06, 0.09, this.paint, 0, shellY - 0.03, CAB.front - 0.045);
    box(g, CAB.width, shellH - 0.1, 0.09, this.paint, 0, shellY - 0.05, CAB.rear + 0.045);
    box(g, CAB.width - 0.1, 0.08, shellLen - 0.1, this.trimDark, 0, CAB.floor - 0.06, cabMid);
    // акцентная полоса по борту и хром-молдинг
    for (const sx of [-1, 1]) {
      box(g, 0.02, 0.09, cabLen * 0.74, accent, sx * (HW + 0.006), CAB.skirt + 0.32, cabMid + 0.06);
      box(g, 0.02, 0.03, cabLen * 0.74, chrome, sx * (HW + 0.008), CAB.skirt + 0.2, cabMid + 0.06);
    }

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
    // рёбра жёсткости на задней стенке
    for (const x of [-0.92, -0.3, 0.3, 0.92]) box(g, 0.04, CAB.roof - CAB.skirt - 0.2, 0.04, this.trimDark, x, (CAB.roof + CAB.skirt) / 2, CAB.rear - 0.08);

    // Крыша.
    box(g, CAB.width, 0.14, cabLen - 0.24, this.paint, 0, CAB.roof, cabMid);

    // Спальная надстройка: low / high / mega — разная высота «горба».
    const podH = look.roof === 'mega' ? 0.4 : look.roof === 'high' ? 0.22 : 0;
    const roofTop = CAB.roof + podH;
    if (podH > 0) {
      box(g, CAB.width - 0.14, podH, cabLen - 0.3, this.paint, 0, CAB.roof + podH / 2, cabMid - 0.06);
      // скос спереди, чтобы надстройка не выглядела «коробкой на крыше»
      profile(
        g,
        [
          [cabMid - 0.1, CAB.roof + podH],
          [CAB.front - 0.45, CAB.roof + podH * 0.35],
          [CAB.front - 0.5, CAB.roof + 0.02],
          [cabMid - 0.1, CAB.roof + 0.02],
        ],
        CAB.width - 0.15,
        this.paint,
        0.02
      );
      // окно спальника
      box(g, 0.8, podH * 0.5, 0.03, m.glass, 0, CAB.roof + podH * 0.5, CAB.rear + 0.01);
    }

    // Лобовой обтекатель.
    if (look.deflector !== 'none') {
      const defH = look.deflector === 'high' ? 0.52 : 0.3;
      profile(
        g,
        [
          [CAB.front - 0.32, roofTop + 0.03],
          [CAB.rear + 0.16, roofTop + defH],
          [CAB.rear + 0.16, roofTop + 0.03],
        ],
        CAB.width - 0.22,
        this.paint,
        0.03
      );
      // боковые «плавники» обтекателя
      for (const sx of [-1, 1]) {
        profile(
          g,
          [
            [CAB.front - 0.3, roofTop + 0.02],
            [CAB.rear + 0.1, roofTop + defH * 0.92],
            [CAB.rear + 0.1, roofTop + 0.02],
          ],
          0.07,
          this.paintDark,
          0.01
        ).position.x = sx * (HW - 0.02) + (sx < 0 ? 0 : -0.07);
      }
    }

    // Габаритные огни на крыше, гудки, антенна, люк.
    const lightN = look.roofLights || 0;
    for (let i = 0; i < lightN; i++) {
      const t = lightN === 1 ? 0.5 : i / (lightN - 1);
      box(g, 0.08, 0.05, 0.05, m.lamp, -0.92 + t * 1.84, roofTop + 0.06, CAB.front - 0.36);
    }
    if (look.horns) {
      for (const sx of [-1, 1]) {
        cylinder(g, 0.055, 0.055, 0.3, chrome, sx * 0.52, roofTop + 0.12, CAB.rear + 0.34, 'z', 12);
        box(g, 0.12, 0.03, 0.12, m.darkMetal, sx * 0.52, roofTop + 0.03, CAB.rear + 0.34);
      }
    }
    cylinder(g, 0.012, 0.012, 0.36, m.darkMetal, -1.02, roofTop + 0.2, CAB.rear + 0.5, 'y', 6);
    box(g, 0.36, 0.03, 0.36, this.paintDark, 0.5, roofTop + 0.02, CAB.rear + 0.62);

    // Лобовое стекло и его рамка.
    const wsH = CAB.windshieldTop - CAB.windshieldBottom;
    const wsZ = CAB.windshieldZ;
    const wsTilt = -Math.atan2(wsZ - (CAB.front - 0.06), wsH); // ~ -16°
    const wsY = (CAB.windshieldTop + CAB.windshieldBottom) / 2;
    this.glazing = [];
    const ws = plane(g, CAB.width - 0.16, wsH, m.glass, 0, wsY, wsZ + 0.02, [wsTilt, 0, 0]);
    this.windshield = ws;
    this.glazing.push(ws);
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
      const glassA = plane(g, 1.34, winTop - winBottom, m.glass, x, (winTop + winBottom) / 2, 2.24, [0, yaw, 0]);
      const glassB = plane(g, 0.86, winTop - winBottom - 0.1, m.glass, x, (winTop + winBottom) / 2 - 0.05, 1.02, [0, yaw, 0]);
      this.glazing.push(glassA, glassB);
      box(g, 0.06, winTop - winBottom + 0.14, 0.16, this.paintDark, x + side * 0.02, (winTop + winBottom) / 2, 2.94);
      box(g, 0.06, winTop - winBottom + 0.1, 0.1, this.paintDark, x + side * 0.02, (winTop + winBottom) / 2, 1.53);
      box(g, 0.06, winTop - winBottom + 0.1, 0.12, this.paintDark, x + side * 0.02, (winTop + winBottom) / 2, 0.55);
      box(g, 0.09, 0.09, 2.6, this.trimDark, x, winBottom - 0.02, 1.72);
      box(g, 0.09, 0.1, 2.62, this.paintDark, x, winTop + 0.06, 1.72);
      // шов двери, петли и ручка
      box(g, 0.04, 1.0, 0.05, this.trimDark, x + side * 0.02, 1.66, 2.92);
      box(g, 0.05, 0.07, 0.36, chrome, x + side * 0.04, 2.02, 2.6);
      for (const hy of [2.62, 1.58]) box(g, 0.03, 0.14, 0.1, m.darkMetal, x + side * 0.01, hy, 2.9);
      // молдинг по низу двери
      box(g, 0.05, 0.12, 2.5, this.trimDark, x + side * 0.02, 1.34, 1.72);
      // шильдик модели на двери
      box(g, 0.02, 0.1, 0.42, chrome, x + side * 0.03, 1.78, 2.3);
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
        box(g, 0.4, 0.06, 0.5, look.chrome ? m.chrome : m.darkMetal, side * (HW - 0.12), sy, sz);
      }
      // зеркала: классические на кронштейнах или аэродинамический блок
      if (look.mirrors === 'aero') {
        box(g, 0.34, 0.05, 0.06, chrome, side * (HW + 0.16), 3.2, 3.16);
        box(g, 0.24, 0.62, 0.14, this.trimDark, side * (HW + 0.34), 2.9, 3.16);
        plane(g, 0.2, 0.52, m.mirror, side * (HW + 0.28), 2.9, 3.16, [0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0]);
        box(g, 0.16, 0.2, 0.1, this.trimDark, side * (HW + 0.3), 2.48, 3.14);
        plane(g, 0.13, 0.15, m.mirror, side * (HW + 0.25), 2.48, 3.14, [0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0]);
        // камера вместо нижнего зеркала
        box(g, 0.07, 0.07, 0.12, m.darkMetal, side * (HW + 0.34), 2.6, 3.2);
      } else {
        const arm = box(g, 0.46, 0.05, 0.05, m.darkMetal, side * (HW + 0.2), 3.28, 3.24);
        arm.rotation.z = side * -0.06;
        box(g, 0.09, 0.6, 0.24, this.trimDark, side * (HW + 0.42), 2.88, 3.3);
        plane(g, 0.2, 0.5, m.mirror, side * (HW + 0.37), 2.88, 3.3, [0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0]);
        box(g, 0.07, 0.2, 0.18, this.trimDark, side * (HW + 0.4), 2.4, 3.26);
        plane(g, 0.15, 0.16, m.mirror, side * (HW + 0.36), 2.4, 3.26, [0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0]);
      }
      // брызговик
      box(g, 0.5, 0.55, 0.04, this.trimDark, side * 1.02, 0.34, 1.66);
    }

    // ---------------------------------------------------------------- передок
    const faceZ = CAB.front + 0.05;
    /** Решётка радиатора: объёмная рамка, тёмная глубина и ламели. */
    const grille = (w, h, y, slats, style = 'classic') => {
      const t = style === 'heavy' ? 0.07 : 0.05;
      const frameMat = style === 'modern' ? chrome : look.chrome ? m.chrome : m.darkMetal;
      box(g, w, t, 0.08, frameMat, 0, y + h / 2, faceZ);
      box(g, w, t, 0.08, frameMat, 0, y - h / 2, faceZ);
      box(g, t, h, 0.08, frameMat, -w / 2, y, faceZ);
      box(g, t, h, 0.08, frameMat, w / 2, y, faceZ);
      box(g, w - 2 * t, h - 2 * t, 0.04, this.trimDark, 0, y, faceZ + 0.03);
      const span = h - 2 * t - 0.1;
      for (let i = 0; i < slats; i++) {
        const yy = y + span / 2 - (slats === 1 ? 0 : (i * span) / (slats - 1));
        box(g, w - 2 * t - 0.04, style === 'heavy' ? 0.06 : 0.04, 0.03, frameMat, 0, yy, faceZ - 0.02);
      }
    };

    if (look.grille === 'heavy') {
      box(g, 2.2, 0.9, 0.1, this.trimDark, 0, 1.66, faceZ - 0.04);
      grille(1.7, 0.72, 1.68, 5, 'heavy');
      box(g, 2.2, 0.05, 0.08, m.chrome, 0, 2.14, faceZ - 0.02);
    } else if (look.grille === 'modern') {
      grille(1.5, 0.6, 1.68, 4, 'modern');
      for (const sx of [-1, 1]) box(g, 0.3, 0.62, 0.06, m.darkMetal, sx * 0.9, 1.68, faceZ - 0.02);
    } else {
      box(g, 2.06, 0.52, 0.08, this.trimDark, 0, 1.62, faceZ - 0.03);
      for (let i = 0; i < 3; i++) box(g, 2.0, 0.05, 0.1, chrome, 0, 1.5 + i * 0.15, faceZ);
    }
    // эмблема
    const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 20), m.chrome);
    badge.rotation.x = Math.PI / 2;
    badge.position.set(0, look.grille === 'heavy' ? 2.0 : 1.42, faceZ + 0.08);
    g.add(badge);
    const badgeIn = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 20), accent);
    badgeIn.rotation.x = Math.PI / 2;
    badgeIn.position.set(0, badge.position.y, faceZ + 0.11);
    g.add(badgeIn);

    // Оптика: у каждой модели свой рисунок.
    const lampAt = (sx, y, z, w, h) => {
      box(g, w, h, 0.06, m.chrome, sx, y, z); // отражатель
      const lens = box(g, w * 0.9, h * 0.86, 0.03, this.headlightMat, sx, y, z + 0.04);
      return lens;
    };
    for (const sx of [-1, 1]) {
      if (look.lights === 'led') {
        // узкая светодиодная полоса + проекционная линза
        box(g, 0.62, 0.2, 0.06, this.trimDark, sx * 0.8, 1.2, faceZ + 0.02);
        box(g, 0.58, 0.05, 0.03, this.headlightMat, sx * 0.8, 1.26, faceZ + 0.06);
        const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 18), this.headlightMat);
        lens.rotation.x = Math.PI / 2;
        lens.position.set(sx * 0.8, 1.13, faceZ + 0.07);
        g.add(lens);
        box(g, 0.3, 0.04, 0.03, sx < 0 ? this.indicatorMatR : this.indicatorMatL, sx * 0.95, 1.06, faceZ + 0.07);
      } else if (look.lights === 'projector') {
        box(g, 0.6, 0.28, 0.06, this.trimDark, sx * 0.8, 1.2, faceZ + 0.02);
        for (const dx of [-0.14, 0.14]) {
          const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 18), this.headlightMat);
          lens.rotation.x = Math.PI / 2;
          lens.position.set(sx * 0.8 + dx, 1.24, faceZ + 0.07);
          g.add(lens);
        }
        box(g, 0.34, 0.05, 0.03, sx < 0 ? this.indicatorMatR : this.indicatorMatL, sx * 0.9, 1.05, faceZ + 0.07);
      } else if (look.lights === 'quad') {
        for (const dx of [-0.16, 0.16]) {
          const r = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 18), m.chrome);
          r.rotation.x = Math.PI / 2;
          r.position.set(sx * 0.78 + dx, 1.24, faceZ + 0.05);
          g.add(r);
          const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 18), this.headlightMat);
          lens.rotation.x = Math.PI / 2;
          lens.position.set(sx * 0.78 + dx, 1.24, faceZ + 0.08);
          g.add(lens);
        }
        box(g, 0.3, 0.06, 0.03, sx < 0 ? this.indicatorMatR : this.indicatorMatL, sx * 0.95, 1.04, faceZ + 0.07);
      } else {
        lampAt(sx * 0.8, 1.2, faceZ + 0.02, 0.6, 0.26);
        const ind = box(g, 0.22, 0.1, 0.06, sx < 0 ? this.indicatorMatR : this.indicatorMatL, sx * 1.12, 1.12, faceZ + 0.04);
        (sx < 0 ? this.indicatorLights.left : this.indicatorLights.right).push(ind);
      }
    }
    if (look.led) box(g, 2.1, 0.04, 0.03, this.headlightMat, 0, 1.08, faceZ + 0.06);

    // Бампер: сталь, хром или в цвет кузова.
    const bumpMat = look.bumper === 'chrome' ? m.chrome : look.bumper === 'steel' ? m.darkMetal : this.paintDark;
    box(g, 2.52, 0.44, 0.34, bumpMat, 0, 0.98, CAB.front + 0.18);
    box(g, 2.3, 0.1, 0.1, m.darkMetal, 0, 0.78, CAB.front + 0.34);
    // номерной знак
    box(g, 0.52, 0.13, 0.02, m.whiteLine, 0, 1.0, CAB.front + 0.36);
    // ступеньки на бампере и противотуманки
    for (const sx of [-1, 1]) {
      box(g, 0.42, 0.03, 0.2, m.darkMetal, sx * 0.92, 1.21, CAB.front + 0.12);
      const fog = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 16), this.headlightMat);
      fog.rotation.x = Math.PI / 2;
      fog.position.set(sx * 0.94, 0.86, CAB.front + 0.36);
      g.add(fog);
      box(g, 0.09, 0.13, 0.07, m.darkMetal, sx * 0.38, 0.72, CAB.front + 0.34); // буксирные проушины
      box(g, 0.3, 0.4, 0.36, bumpMat, sx * 1.18, 0.98, CAB.front + 0.12); // углы бампера
    }

    // ---------------------------------------------------------------- выхлоп
    if (look.exhaust === 'stack') {
      for (const sx of [-1, 1]) {
        cylinder(g, 0.075, 0.075, 2.5, m.chrome, sx * 1.16, 2.35, -0.5, 'y', 14);
        box(g, 0.2, 2.1, 0.06, m.darkMetal, sx * 1.06, 2.4, -0.5); // теплозащита
        cylinder(g, 0.09, 0.075, 0.12, m.darkMetal, sx * 1.16, 3.62, -0.5, 'y', 14);
      }
    } else {
      cylinder(g, 0.09, 0.08, 2.4, m.chrome, -1.18, 1.9, -0.66, 'y', 12);
      box(g, 0.2, 2.0, 0.05, m.darkMetal, -1.08, 1.9, -0.66);
      box(g, 0.18, 0.12, 0.3, m.darkMetal, -1.18, 3.12, -0.66);
    }

    // ---------------------------------------------------------------- задние мосты
    // Крыло ставится центром на ось колеса: раньше кожух висел на 0.6 м выше
    // и читался «парящей дугой» над шинами.
    for (const sx of [-1, 1]) {
      for (const z of rearZs) {
        const fenderMat = look.fenders === 'paint' ? this.paint : m.darkMetal;
        const shell = new THREE.Mesh(
          new THREE.CylinderGeometry(WHEEL_R + 0.1, WHEEL_R + 0.1, 1.02, 20, 1, true, 0, Math.PI),
          fenderMat
        );
        shell.rotation.set(0, 0, Math.PI / 2);
        shell.position.set(sx * 0.86, WHEEL_R, z);
        shell.material.side = THREE.DoubleSide;
        g.add(shell);
        // наружная кромка крыла — объём, а не тонкая линия
        const lip = new THREE.Mesh(new THREE.TorusGeometry(WHEEL_R + 0.1, 0.035, 6, 22, Math.PI), fenderMat);
        lip.rotation.set(Math.PI / 2, 0, 0);
        lip.position.set(sx * 0.86, WHEEL_R, z);
        g.add(lip);
        // грязевой щиток позади колеса
        box(g, 1.0, 0.34, 0.03, this.trimDark, sx * 0.86, WHEEL_R - 0.16, z - (WHEEL_R + 0.09));
      }
      // брызговик за последним мостом
      box(g, 0.5, 0.62, 0.04, this.trimDark, sx * 1.02, 0.36, Math.min(...rearZs) - 1.02);
    }
    // Задняя панель: фонари, номер, отбойник — по фактическому свесу рамы.
    for (const sx of [-0.9, 0.9]) {
      const tail = box(g, 0.26, 0.18, 0.07, m.taillight, sx, 1.2, tailZ - 0.04);
      this.brakeLights.push(tail);
      const ind = box(g, 0.12, 0.1, 0.07, sx < 0 ? this.indicatorMatL : this.indicatorMatR, sx + (sx < 0 ? 0.2 : -0.2), 1.2, tailZ - 0.04);
      (sx < 0 ? this.indicatorLights.left : this.indicatorLights.right).push(ind);
    }
    box(g, 2.3, 0.1, 0.12, this.trimDark, 0, 0.9, tailZ);
    box(g, 0.5, 0.12, 0.02, m.whiteLine, 0, 0.76, tailZ - 0.03);
    // противоткатные упоры и ручка седла — мелкие детали, выдающие «грузовик»
    for (const sx of [-1, 1]) box(g, 0.08, 0.16, 0.08, m.darkMetal, sx * 0.5, 1.14, tailZ + 0.35);

    // ---------------------------------------------------------------- колёса
    this.addWheels(g, { front: 2.55, rear: rearZs, width: 1.02, steer: true, rimMat });
  }

  // ------------------------------------------------------------------ прицепы
  /**
   * Полуприцепы. Габариты берутся из спецификации типа (как в `data/cargo.js`),
   * а не «13.6 м на всё»: цистерна короче, лесовоз длиннее. Общие узлы —
   * рама, опорные стойки, седло, боковые отбойники, брызговики, задний брус,
   * габариты и номер — собираются один раз, дальше тип добавляет своё.
   */
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
    this.brakeLights = this.brakeLights.filter((b) => !b.userData.trailer);
    this.indicatorLights = {
      left: this.indicatorLights.left.filter((b) => !b.userData.trailer),
      right: this.indicatorLights.right.filter((b) => !b.userData.trailer),
    };

    const m = this.mats;
    const g = (this.trailerGroup = new THREE.Group());
    g.name = 'trailer';
    const spec = TRAILER_SPECS[type] || TRAILER_SPECS.curtain;
    const L = spec.length;
    const height = spec.height;
    const bodyBottom = spec.floor;
    const nose = -0.9; // передняя кромка полуприцепа
    const zc = nose - L / 2;
    const tail = nose - L;
    const yc = bodyBottom + height / 2;
    const halfW = 1.27;
    const chrome = this.look?.chrome === false ? m.darkMetal : m.chrome;

    /** Боковые панели короба: ливрея слева/справа, верх и торцы — однотонные. */
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
    const boltLine = (z0, z1, y, step = 0.34) => {
      for (let z = z0; z > z1; z -= step) box(g, 2.58, 0.03, 0.03, chrome, 0, y, z);
    };

    // ---------------------------------------------------------------- корпус
    if (type === 'tank') {
      const tankMat = this.mats.chrome;
      cylinder(g, spec.radius, spec.radius, L - 0.5, tankMat, 0, spec.axisY, zc, 'z', 30);
      // эллиптические днища
      cylinder(g, spec.radius, spec.radius * 0.72, 0.3, tankMat, 0, spec.axisY, zc + L / 2 - 0.36, 'z', 30);
      cylinder(g, spec.radius, spec.radius * 0.72, 0.3, tankMat, 0, spec.axisY, zc - L / 2 + 0.36, 'z', 30);
      // усиливающие кольца
      for (const dz of [-4.2, -2.0, 0.2, 2.4, 4.6]) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(spec.radius + 0.02, 0.025, 6, 28), m.darkMetal);
        ring.rotation.y = Math.PI / 2;
        ring.position.set(0, spec.axisY, zc + dz);
        g.add(ring);
      }
      // горловины с крышками и парогазоотвод
      for (const dz of [-3.6, 0.6, 4.4]) {
        cylinder(g, 0.26, 0.26, 0.14, m.metal, 0, spec.axisY + spec.radius - 0.02, zc + dz, 'y', 16);
        cylinder(g, 0.28, 0.24, 0.08, chrome, 0, spec.axisY + spec.radius + 0.08, zc + dz, 'y', 16);
      }
      // лестница и площадка у люка
      for (let i = 0; i < 5; i++) box(g, 0.34, 0.03, 0.03, m.metal, 0, 1.7 + i * 0.36, tail + 0.55);
      for (const sx of [-1, 1]) box(g, 0.03, 1.9, 0.03, m.metal, sx * 0.17, 2.6, tail + 0.55);
      // сливная арматура снизу
      cylinder(g, 0.1, 0.1, 0.5, chrome, 0, 1.32, zc - 1.6, 'y', 12);
      box(g, 0.5, 0.14, 0.5, m.darkMetal, 0, 1.2, zc - 1.6);
      const adr = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 0.56),
        new THREE.MeshStandardMaterial({ map: this.labelTexture('ADR', '33', '#e8a72b'), roughness: 0.7 })
      );
      adr.position.set(0.0, 1.95, tail - 0.04);
      adr.rotation.y = Math.PI;
      g.add(adr);
      // боковая защита и труба обогрева
      for (const sx of [-1, 1]) box(g, 0.06, 0.16, L - 3.2, chrome, sx * 1.2, 1.05, zc);
    } else if (type === 'flatbed') {
      // Настил из досок: 11 продольных полос вместо одной плиты.
      for (let i = 0; i < 11; i++) {
        box(g, 0.22, 0.1, L, m.concrete, -1.1 + i * 0.22, 1.5, zc);
      }
      for (const sx of [-1, 1]) {
        box(g, 0.09, 0.26, L, m.metal, sx * 1.24, 1.66, zc);
        // коники (стойки) по борту
        for (let i = 0; i < 6; i++) box(g, 0.09, 0.62, 0.1, m.metal, sx * 1.22, 1.96, nose - 1.2 - i * 2.3);
        // петли и крюки стяжек
        for (let i = 0; i < 9; i++) box(g, 0.1, 0.1, 0.06, m.darkMetal, sx * 1.3, 1.44, nose - 0.8 - i * 1.5);
      }
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
      // продольные балки, угловые фитинги, рифление
      for (const sx of [-1, 1]) {
        box(g, 0.1, 0.16, L, m.darkMetal, sx * 1.25, bodyBottom + height - 0.04, zc);
        box(g, 0.1, 0.14, L, m.darkMetal, sx * 1.25, bodyBottom + 0.06, zc);
        for (const z of [nose - 0.1, tail + 0.1]) {
          box(g, 0.18, 0.18, 0.18, m.darkMetal, sx * 1.22, bodyBottom + 0.1, z);
          box(g, 0.18, 0.18, 0.18, m.darkMetal, sx * 1.22, bodyBottom + height - 0.1, z);
        }
      }
      box(g, 2.6, 0.12, 0.1, m.darkMetal, 0, bodyBottom + height - 0.02, nose + 0.02);
      box(g, 2.6, 0.12, 0.1, m.darkMetal, 0, bodyBottom + height - 0.02, tail - 0.02);
      // запорные штанги дверей
      for (const sx of [-0.66, -0.22, 0.22, 0.66]) {
        cylinder(g, 0.03, 0.03, height - 0.3, m.darkMetal, sx, yc, tail - 0.03, 'y', 8);
        box(g, 0.16, 0.05, 0.06, m.metal, sx, yc - 0.3, tail - 0.05);
      }
      box(g, 2.56, 0.1, L, m.darkMetal, 0, 1.44, zc);
    } else if (type === 'log') {
      box(g, 2.3, 0.16, L, m.darkMetal, 0, 1.5, zc);
      // коники: вертикальные стойки с наклоном, как у лесовоза
      for (const dz of [5.2, 1.0, -3.2, -6.6]) {
        for (const sx of [-1, 1]) {
          const post = box(g, 0.12, 2.4, 0.12, m.metal, sx * 1.16, 2.7, zc + dz);
          post.rotation.z = sx * 0.07;
          box(g, 0.5, 0.1, 0.14, m.metal, sx * 1.05, 3.9, zc + dz);
        }
        box(g, 2.3, 0.1, 0.12, m.metal, 0, 1.6, zc + dz);
      }
      const logMat = new THREE.MeshStandardMaterial({ color: 0x7d5c39, roughness: 1 });
      const logEnd = new THREE.MeshStandardMaterial({ color: 0xb29266, roughness: 0.9 });
      const logGeo = new THREE.CylinderGeometry(0.3, 0.3, L - 1.2, 10);
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const log = new THREE.Mesh(logGeo, [logMat, logEnd, logEnd]);
          log.rotation.x = Math.PI / 2;
          log.position.set((col - 1) * 0.66, 1.9 + row * 0.58, zc);
          g.add(log);
        }
      }
      // натяжные ремни поверх штабеля
      for (const dz of [4.4, 0.2, -4.0]) box(g, 2.4, 0.03, 0.1, m.darkMetal, 0, 3.72, zc + dz);
    } else if (type === 'tipper') {
      // Полуприцеп-самосвал: полукруглая ванна, усиленный борт, гидроцилиндр
      // подъёма и задний борт на шарнирах — как у настоящих самосвалов.
      box(g, 2.32, 0.12, L, m.darkMetal, 0, bodyBottom, zc);
      // Ванна — нижняя половина цилиндра: ось вдоль прицепа (после поворота
      // на 90° вокруг X), открытым верхом вверх.
      const binR = 1.06;
      const shell = new THREE.Mesh(
        new THREE.CylinderGeometry(binR, binR, L - 0.2, 26, 1, true, -Math.PI / 2, Math.PI),
        this.paintDark
      );
      shell.rotation.x = Math.PI / 2;
      shell.position.set(0, bodyBottom + binR, zc);
      shell.material.side = THREE.DoubleSide;
      g.add(shell);
      // верхний обод ванны
      for (const sx of [-1, 1]) box(g, 0.1, 0.12, L - 0.2, m.metal, sx * binR, bodyBottom + binR, zc);
      // продольные рёбра жёсткости снаружи ванны
      for (const sx of [-1, 1]) {
        for (let i = 0; i < 5; i++) {
          const z = nose - 1.2 - (i * (L - 2.2)) / 4;
          box(g, 0.06, 0.16, L - 1.6, m.darkMetal, sx * 1.24, bodyBottom + 0.34, zc);
          box(g, 0.05, 0.5, 0.14, m.metal, sx * 1.24, bodyBottom + 0.3, z);
        }
      }
      // передний щит и задний борт
      box(g, 2.3, 1.5, 0.1, this.paintDark, 0, bodyBottom + 0.78, nose - 0.14);
      box(g, 2.3, 1.3, 0.1, this.paintDark, 0, bodyBottom + 0.68, tail + 0.12);
      for (const sx of [-1, 1]) box(g, 0.14, 1.35, 0.16, m.darkMetal, sx * 1.16, bodyBottom + 0.68, tail + 0.12);
      // гидроцилиндр подъёма под ванной
      cylinder(g, 0.13, 0.13, 2.4, m.metal, 0, 1.0, nose - 2.2, 'z', 12);
      box(g, 0.34, 0.2, 0.5, m.darkMetal, 0, 1.05, nose - 1.05);
      // груз: щебень горкой
      const gravelMat = new THREE.MeshStandardMaterial({ color: 0x8a857b, roughness: 1, flatShading: true });
      for (let i = 0; i < 7; i++) {
        const pile = new THREE.Mesh(new THREE.ConeGeometry(0.86 - i * 0.04, 0.34, 7), gravelMat);
        pile.position.set((i % 2 ? 0.16 : -0.14), bodyBottom + binR - 0.02, nose - 1.5 - i * 1.55);
        pile.rotation.y = i;
        g.add(pile);
      }
      // лестница и поручень у носа
      for (let i = 0; i < 4; i++) box(g, 0.3, 0.03, 0.03, m.metal, 0, 1.6 + i * 0.3, nose - 0.42);
      for (const sx of [-1, 1]) box(g, 0.03, 1.1, 0.03, m.metal, sx * 0.15, 2.0, nose - 0.42);
    } else if (type === 'lowboy') {
      // Низкорамный трал: гусь-шея, пониженная площадка, откидной трап и
      // гусеничная техника на площадке.
      box(g, 2.2, 0.2, 3.4, m.darkMetal, 0, 1.28, nose - 1.7); // гусь-шея
      box(g, 2.06, 0.16, L - 4.0, m.darkMetal, 0, 0.95, tail + 5.3); // площадка
      for (const sx of [-1, 1]) {
        box(g, 0.1, 0.2, L - 4.0, m.metal, sx * 1.06, 0.95, tail + 5.3);
        box(g, 0.14, 0.14, L - 4.2, m.darkMetal, sx * 1.12, 1.02, tail + 5.3);
      }
      // поперечные лаги настила
      for (let z = tail + 3.6; z < nose - 3.6; z += 0.55) box(g, 2.0, 0.05, 0.1, m.metal, 0, 1.0, z);
      // откидной трап сзади
      const ramp = box(g, 1.9, 0.1, 1.7, m.darkMetal, 0, 0.72, tail + 0.95);
      ramp.rotation.x = 0.16;
      for (const sx of [-1, 1]) box(g, 0.1, 0.3, 1.7, m.metal, sx * 1.0, 0.9, tail + 0.95);
      // гусеничная машина: рама, кабина, гусеницы и отвал
      const machineMat = new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.55, metalness: 0.25 });
      const trackMat = new THREE.MeshStandardMaterial({ color: 0x2a2d30, roughness: 0.95 });
      for (const sx of [-1, 1]) {
        box(g, 0.5, 0.5, 4.4, trackMat, sx * 0.82, 1.35, zc + 0.4);
        for (let i = 0; i < 5; i++) {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.52, 12), m.darkMetal);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(sx * 0.82, 1.2, zc - 1.4 + i * 0.95);
          g.add(wheel);
        }
      }
      box(g, 1.9, 0.6, 3.0, machineMat, 0, 1.9, zc + 0.8); // корпус
      box(g, 1.1, 0.9, 1.0, machineMat, -0.2, 2.6, zc + 1.6); // кабина
      box(g, 1.0, 0.5, 0.04, m.glass, -0.2, 2.75, zc + 2.08); // остекление
      cylinder(g, 0.09, 0.09, 2.2, machineMat, 0.55, 2.7, zc - 0.4, 'y', 8); // стрела
      box(g, 0.5, 0.12, 2.4, machineMat, 0.55, 3.7, zc - 1.3); // рукоять
      const bucket = box(g, 1.2, 0.7, 0.9, m.darkMetal, 0.55, 3.1, zc - 2.5);
      bucket.rotation.x = 0.25;
      box(g, 1.5, 0.5, 0.16, m.darkMetal, 0, 1.4, zc + 3.0); // отвал
    } else if (type === 'fridge') {
      const tex = trailerTexture(company, '#eef1f0');
      tex.repeat.set(1, 1);
      boxBody(bodyMaterials(tex, 0xeef1f0, 0.44));
      // холодильный агрегат: корпус, решётка конденсатора, вентиляторы
      box(g, 1.6, 0.9, 0.42, m.metal, 0, bodyBottom + height - 0.55, nose + 0.05);
      box(g, 1.3, 0.62, 0.05, m.darkMetal, 0, bodyBottom + height - 0.55, nose + 0.27);
      for (const dx of [-0.32, 0.32]) {
        const fan = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.02, 6, 14), m.metal);
        fan.position.set(dx, bodyBottom + height - 0.55, nose + 0.3);
        g.add(fan);
      }
      // топливный бак рефа и трубки
      box(g, 0.5, 0.4, 0.3, m.metal, -0.9, 1.05, nose - 0.2);
      cylinder(g, 0.03, 0.03, 1.2, m.darkMetal, -1.22, 1.3, nose - 0.7, 'y', 6);
      // рёбра жёсткости по бортам и холодильные панели на торце
      for (const sx of [-1, 1]) {
        box(g, 0.05, 0.1, L - 0.2, m.darkMetal, sx * 1.29, bodyBottom + 0.12, zc);
        box(g, 0.05, 0.1, L - 0.2, m.darkMetal, sx * 1.29, bodyBottom + height - 0.12, zc);
      }
      for (const sx of [-1, 1]) for (const hy of [bodyBottom + 0.3, bodyBottom + height - 0.3]) box(g, 0.04, 0.05, L - 0.4, chrome, sx * 1.3, hy, zc);
    } else {
      // Тентованный полуприцеп — самый частый на трассе.
      const tex = trailerTexture(company, '#eae6d9');
      tex.repeat.set(1, 1);
      boxBody(bodyMaterials(tex, 0xeae6d9, 0.88));
      // дуги тента и ремни натяжения по низу
      for (let i = 0; i < Math.round(L / 1.1); i++) {
        box(g, 2.5, 0.045, 0.05, m.darkMetal, 0, bodyBottom + height - 0.02, nose - 0.5 - i * 1.1);
      }
      for (let i = 0; i < Math.round(L / 1.8); i++) box(g, 2.555, 0.03, 0.04, chrome, 0, 1.62, nose - 0.8 - i * 1.8);
      // боковые «занавесы»: вертикальные стяжки-трещотки
      for (let i = 0; i < Math.round(L / 2.2); i++) {
        for (const sx of [-1, 1]) {
          box(g, 0.04, 0.5, 0.06, chrome, sx * 1.28, 1.72, nose - 1.1 - i * 2.2);
        }
      }
    }

    // ---------------------------------------------------------------- общая рама
    box(g, 2.18, 0.16, L - 0.5, m.darkMetal, 0, 1.34, zc);
    // продольные лонжероны и поперечины
    for (const sx of [-1, 1]) box(g, 0.12, 0.26, L - 0.7, m.darkMetal, sx * 0.42, 1.2, zc);
    for (let z = nose - 0.7; z > tail + 0.6; z -= 1.1) box(g, 0.86, 0.1, 0.1, m.darkMetal, 0, 1.18, z);
    // боковые отбойники (side underrun protection) — обязательны в ЕС
    if (type !== 'flatbed' && type !== 'log' && type !== 'lowboy' && type !== 'tipper') {
      for (const sx of [-1, 1]) {
        box(g, 0.06, 0.12, 3.6, m.metal, sx * 1.26, 0.72, zc + 1.2);
        for (const dz of [2.9, 0.4]) box(g, 0.06, 0.42, 0.06, m.metal, sx * 1.26, 0.94, zc + dz);
      }
    }
    // Опорные стойки (шасси) с пятками.
    for (const sx of [-1, 1]) {
      cylinder(g, 0.07, 0.07, 0.95, m.metal, sx * 0.72, 0.62, nose - 3.1, 'y', 10);
      box(g, 0.3, 0.06, 0.3, m.darkMetal, sx * 0.72, 0.14, nose - 3.1);
      box(g, 0.12, 0.2, 0.12, m.darkMetal, sx * 0.72, 1.18, nose - 3.1);
    }
    // Седло и сцепной шкворень.
    box(g, 1.1, 0.18, 1.4, m.darkMetal, 0, 1.3, nose - 0.55);
    cylinder(g, 0.06, 0.06, 0.16, chrome, 0, 1.18, nose - 0.2, 'y', 10);
    // Ящик для инструмента и держатель запаски.
    box(g, 0.62, 0.36, 0.9, m.darkMetal, 1.0, 0.98, nose - 4.2);
    // Задние двери/торец.
    if (type !== 'flatbed' && type !== 'log' && type !== 'tank' && type !== 'lowboy' && type !== 'tipper') {
      const rearTex = trailerRearTexture(company, type === 'container' ? '#a94f2c' : type === 'fridge' ? '#dfe3e2' : '#4d6672');
      const rearMat = new THREE.MeshStandardMaterial({ map: rearTex, roughness: 0.72, metalness: 0.04 });
      rearMat.__generated = true;
      const rear = new THREE.Mesh(new THREE.PlaneGeometry(halfW * 2 - 0.06, height - 0.06), rearMat);
      rear.position.set(0, yc, tail - 0.012);
      rear.rotation.y = Math.PI;
      g.add(rear);
      box(g, 2.5, 0.08, 0.06, chrome, 0, 1.52, tail - 0.03);
      // петли створок и запоры
      for (const sx of [-1.2, 1.2]) {
        for (const hy of [bodyBottom + 0.4, yc, bodyBottom + height - 0.4]) box(g, 0.12, 0.1, 0.1, m.darkMetal, sx, hy, tail - 0.06);
      }
    }
    // Задний брус, фонари, номер, брызговики.
    box(g, 2.44, 0.12, 0.14, this.trimDark, 0, 0.86, tail - 0.02);
    box(g, 2.3, 0.06, 0.06, m.metal, 0, 0.7, tail + 0.02);
    for (const sx of [-0.92, -0.56, 0.56, 0.92]) {
      const tailLight = box(g, 0.22, 0.18, 0.07, m.taillight, sx, 1.06, tail - 0.06);
      tailLight.userData.trailer = true;
      this.brakeLights.push(tailLight);
    }
    for (const sx of [-1, 1]) {
      const ind = box(g, 0.14, 0.26, 0.07, sx < 0 ? this.indicatorMatL : this.indicatorMatR, sx, 1.06, tail - 0.06);
      ind.userData.trailer = true;
      (sx < 0 ? this.indicatorLights.left : this.indicatorLights.right).push(ind);
      // брызговики за колёсами
      box(g, 0.62, 0.5, 0.04, this.trimDark, sx * 1.02, 0.6, tail + 1.15);
      // боковые габариты — вдоль борта от носа к корме, не выходя за габарит
      for (let k = 1; k <= 4; k++) {
        box(g, 0.05, 0.08, 0.14, m.lamp, sx * 1.28, 1.2, nose - (L * k) / 5);
      }
    }
    box(g, 0.5, 0.12, 0.02, m.whiteLine, 1.0, 0.78, tail - 0.07);
    // Светоотражающая полоса по бортам (контурная маркировка).
    for (const sx of [-1, 1]) {
      box(g, 0.02, 0.06, L - 1.2, m.whiteLine, sx * 1.285, 1.05, zc);
    }
    // Подрамник под сцепку.
    box(g, 1.1, 0.18, 1.4, m.darkMetal, 0, 1.3, nose - 0.6);

    // Колёса прицепа: две оси, сдвоенные шины на каждой стороне.
    const wheelGroup = new THREE.Group();
    g.add(wheelGroup);
    this.addWheels(wheelGroup, {
      front: 0,
      rear: [tail + 2.1, tail + 3.5],
      width: 1.02,
      steer: false,
      trailer: true,
      rimMat: this.look?.wheels === 'alu' ? this.mats.chrome : null,
    });
    // Крылья над колёсами прицепа.
    for (const sx of [-1, 1]) {
      for (const z of [tail + 2.1, tail + 3.5]) {
        const shell = new THREE.Mesh(
          new THREE.CylinderGeometry(WHEEL_R + 0.12, WHEEL_R + 0.12, 1.0, 18, 1, true, 0, Math.PI),
          this.trimDark
        );
        shell.rotation.set(0, 0, Math.PI / 2);
        shell.position.set(sx * 0.86, WHEEL_R, z);
        shell.material = this.trimDark;
        g.add(shell);
      }
    }

    this.root.add(g);
    this.shadowOn = this.shadowOn !== false;
    // Прицеп — сотни коробок; склеиваем всё, кроме колёс (они крутятся).
    // Фонари склеиваются вместе с кузовом: материал общий, поэтому
    // setBrakeLights/setIndicator продолжают работать через него.
    mergeStatic(g, [...this.trailerWheels]);
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

  /** Кожа руля: мелкое зерно и строчка. Без картинок — рисуем на канвасе. */
  leatherTexture() {
    if (this._leatherTex) return this._leatherTex;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const c = canvas.getContext('2d');
    c.fillStyle = '#2f343a';
    c.fillRect(0, 0, 256, 256);
    // Неровное зерно: тёмные и светлые крапины в несколько проходов.
    for (let i = 0; i < 6400; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const v = 34 + Math.random() * 40;
      c.fillStyle = `rgba(${v},${v + 3},${v + 6},${0.22 + Math.random() * 0.4})`;
      c.fillRect(x, y, 1.3 + Math.random(), 1.3 + Math.random());
    }
    // Шов по кромке полотна.
    c.strokeStyle = 'rgba(206, 214, 219, 0.9)';
    c.lineWidth = 2;
    c.setLineDash([7, 5]);
    c.beginPath();
    c.moveTo(0, 20);
    c.lineTo(256, 20);
    c.stroke();
    c.beginPath();
    c.moveTo(0, 236);
    c.lineTo(256, 236);
    c.stroke();
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 1);
    tex.colorSpace = THREE.SRGBColorSpace;
    this._leatherTex = tex;
    return tex;
  }

  /** Рельеф кожи для bumpMap: то же зерно в градациях серого (без цвета). */
  leatherBumpTexture() {
    if (this._leatherBump) return this._leatherBump;
    this._leatherBump = canvasTexture(
      'wheel-leather-bump',
      256,
      256,
      (c, w, h) => {
        c.fillStyle = '#808080';
        c.fillRect(0, 0, w, h);
        for (let i = 0; i < 9000; i++) {
          const v = 96 + Math.floor(Math.random() * 64);
          c.fillStyle = `rgb(${v},${v},${v})`;
          c.fillRect(Math.random() * w, Math.random() * h, 1.6, 1.6);
        }
        // Мелкие поры и «морщины».
        c.strokeStyle = 'rgba(64,64,64,0.5)';
        c.lineWidth = 1;
        for (let i = 0; i < 120; i++) {
          const x = Math.random() * w;
          const y = Math.random() * h;
          c.beginPath();
          c.moveTo(x, y);
          c.lineTo(x + 3 + Math.random() * 6, y + (Math.random() - 0.5) * 4);
          c.stroke();
        }
      },
      { srgb: false, repeat: [3, 1] }
    );
    return this._leatherBump;
  }

  /** Шильд на ступице: тёмный диск, хромовое кольцо, буква A и надпись AURIGA. */
  badgeTexture() {
    return canvasTexture('wheel-badge', 256, 256, (c, w, h) => {
      const bg = c.createRadialGradient(w * 0.38, h * 0.32, 10, w * 0.5, h * 0.52, w * 0.62);
      bg.addColorStop(0, '#4b565e');
      bg.addColorStop(0.55, '#232b31');
      bg.addColorStop(1, '#0d1215');
      c.fillStyle = bg;
      c.beginPath();
      c.arc(w / 2, h / 2, w * 0.5, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#cfd8dd';
      c.lineWidth = 9;
      c.beginPath();
      c.arc(w / 2, h / 2, w * 0.44, 0, Math.PI * 2);
      c.stroke();
      // Буква «A» как эмблема.
      c.fillStyle = '#e9eff3';
      c.beginPath();
      c.moveTo(w / 2, h * 0.2);
      c.lineTo(w * 0.63, h * 0.56);
      c.lineTo(w * 0.55, h * 0.56);
      c.lineTo(w / 2, h * 0.4);
      c.lineTo(w * 0.45, h * 0.56);
      c.lineTo(w * 0.37, h * 0.56);
      c.closePath();
      c.fill();
      // Поперечина.
      c.fillRect(w * 0.44, h * 0.48, w * 0.12, h * 0.03);
      c.font = 'bold 26px system-ui, Arial';
      c.textAlign = 'center';
      c.fillStyle = '#cdd7dc';
      c.fillText('AURIGA', w / 2, h * 0.75);
    });
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
    const softMat = M(fabricTex, { color: 0x878f95, roughness: 0.97 });
    const headMat = M(headTex, { color: 0x939aa0, roughness: 0.98 });
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
      // подлокотник с мягкой накладкой и блоком кнопок
      box(g, 0.16, 0.09, 1.1, darkTrim, sx * (HW - 0.2), CAB.sill + 0.06, 1.35);
      box(g, 0.18, 0.05, 1.12, softMat, sx * (HW - 0.2), CAB.sill + 0.12, 1.35);
      box(g, 0.12, 0.03, 0.3, trimMat, sx * (HW - 0.19), CAB.sill + 0.15, 1.55);
      // ручка двери
      box(g, 0.07, 0.05, 0.34, trimMat, sx * (HW - 0.16), CAB.sill - 0.14, 2.32);
      box(g, 0.1, 1.4, 0.12, softMat, sx * (HW - 0.05), 2.74, 2.72);
    }
    // облицовка стоек лобового стекла
    for (const sx of [-1, 1]) {
      box(g, 0.17, wsH + 0.16, 0.22, softMat, sx * (HW - 0.1), CAB.windshieldTop - wsH / 2, CAB.windshieldZ - 0.06, [wsTilt, 0, 0]);
      box(g, 0.08, wsH + 0.24, 0.34, softMat, sx * (HW - 0.04), CAB.windshieldTop - wsH / 2, CAB.windshieldZ - 0.16, [wsTilt, 0, 0]);
      box(g, 0.15, 0.5, 0.08, softMat, sx * (HW - 0.1), CAB.windshieldBottom - 0.24, CAB.front - 0.22, [wsTilt, 0, 0]);
    }
    // верхняя облицовка и козырьки
    box(g, CAB.width - 0.1, 0.12, 0.2, headMat, 0, CAB.windshieldTop - 0.02, CAB.windshieldZ - 0.12, [wsTilt, 0, 0]);
    for (const sx of [-0.54, 0.54]) {
      box(g, 0.8, 0.03, 0.34, darkTrim, sx, CAB.windshieldTop + 0.11, CAB.windshieldZ - 0.2, [wsTilt + 0.08, 0, 0]);
      box(g, 0.06, 0.05, 0.07, trimMat, sx + 0.42, CAB.windshieldTop + 0.1, CAB.windshieldZ - 0.18);
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
    // Штурвал тягача крупным планом: кожаный обод с двойной прострочкой,
    // хром-кант по кромкам, наплыв снизу, утолщения под большие пальцы,
    // спицы с кнопочными блоками и колесом прокрутки, ступица с шильдом.
    // Плоскость обода — XY, лицо штурвала смотрит на водителя (в −z), поэтому
    // все детали крепятся с отрицательной стороны: иначе игрок видел изнанку.
    this.wheelPivot = new THREE.Group();
    this.wheelPivot.position.set(EYE.x, 2.05, 1.96);
    this.wheelPivot.rotation.x = -0.42;
    const FACE = -1;
    const leather = M(this.leatherTexture(), { color: 0xdfe4e8, roughness: 0.66, metalness: 0.04 });
    leather.bumpMap = this.leatherBumpTexture();
    leather.bumpScale = 0.9;
    const stitchMat = M(null, { color: 0xd6d0bd, roughness: 0.6 });
    const chrome = M(null, { color: 0xc7d0d6, roughness: 0.16, metalness: 0.95 });
    const matteChrome = M(null, { color: 0x9aa4ab, roughness: 0.36, metalness: 0.88 });
    const wheelBlack = M(null, { color: 0x15191d, roughness: 0.5, metalness: 0.22 });
    const buttonMat = M(null, { color: 0x2b3238, roughness: 0.42, metalness: 0.32 });
    const RIM_R = 0.268;

    // Обод: сечение сплющено (у настоящих рулей оно не круглое).
    const rim = new THREE.Mesh(new THREE.TorusGeometry(RIM_R, 0.030, 14, 88), leather);
    rim.scale.z = 0.92;
    this.wheelPivot.add(rim);
    // Наплыв снизу: за него держат руку при маневре.
    const rimThick = new THREE.Mesh(new THREE.TorusGeometry(RIM_R, 0.034, 12, 36, Math.PI * 0.55), leather);
    rimThick.rotation.z = 3.85;
    this.wheelPivot.add(rimThick);
    // Утолщения под большие пальцы на «10 и 2 часа» — продолговатые, вдоль обода.
    for (const side of [-1, 1]) {
      const grip = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 10), leather);
      grip.position.set(side * 0.152, 0.221, 0.002);
      grip.rotation.z = Math.atan2(0.221, side * 0.152) - Math.PI / 2;
      grip.scale.set(1.5, 0.82, 0.86);
      this.wheelPivot.add(grip);
    }
    // Хром-кант по внутренней и внешней кромке обода.
    for (const [r, tube] of [[0.2395, 0.0038], [0.2965, 0.0026]]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 8, 84), chrome);
      ring.position.z = FACE * 0.004;
      this.wheelPivot.add(ring);
    }
    // Двойная прострочка: два ряда стежков одним инстанс-мешем.
    {
      const geo = new THREE.BoxGeometry(0.011, 0.0035, 0.0055);
      const count = 112;
      const stitches = new THREE.InstancedMesh(geo, stitchMat, count);
      const d = new THREE.Object3D();
      for (let row = 0; row < 2; row++) {
        const radius = row ? 0.2885 : 0.2475;
        for (let i = 0; i < 56; i++) {
          const a = (i / 56) * Math.PI * 2;
          d.position.set(Math.cos(a) * radius, Math.sin(a) * radius, FACE * (row ? 0.016 : 0.02));
          d.rotation.set(0, 0, a);
          d.updateMatrix();
          stitches.setMatrixAt(row * 56 + i, d.matrix);
        }
      }
      stitches.instanceMatrix.needsUpdate = true;
      this.wheelPivot.add(stitches);
    }
    // Метка «прямо» сверху — как на настоящих штурвалах.
    const topMark = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.0075, 0.012), M(null, { color: 0xd9cfa9, roughness: 0.5 }));
    topMark.position.set(0, RIM_R + 0.003, FACE * 0.02);
    this.wheelPivot.add(topMark);

    // Спицы: сужаются к ободу, сверху хром-накладка.
    for (const side of [-1, 1]) {
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.031, 0.19, 8), wheelBlack);
      spoke.rotation.z = Math.PI / 2;
      spoke.position.set(side * 0.135, -0.002, FACE * 0.004);
      this.wheelPivot.add(spoke);
      const spokeTrim = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.005, 0.012), matteChrome);
      spokeTrim.position.set(side * 0.14, 0.019, FACE * 0.014);
      this.wheelPivot.add(spokeTrim);
      // Кнопочный блок: скруглённая подушка, шесть клавиш и колесо прокрутки.
      const pod = new THREE.Mesh(new THREE.CapsuleGeometry(0.023, 0.058, 4, 10), buttonMat);
      pod.rotation.z = Math.PI / 2;
      pod.scale.set(1, 1, 0.6);
      pod.position.set(side * 0.148, 0.002, FACE * 0.028);
      this.wheelPivot.add(pod);
      const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.008, 12), matteChrome);
      scroll.rotation.x = Math.PI / 2;
      scroll.position.set(side * 0.148, 0.027, FACE * 0.044);
      this.wheelPivot.add(scroll);
    }
    // Клавиши: один инстанс-меш, цвет у каждой свой (тёмные и подсвеченные).
    {
      const geo = new THREE.BoxGeometry(0.019, 0.011, 0.006);
      const btnBase = M(null, { color: 0xffffff, roughness: 0.45, metalness: 0.3 });
      const btns = new THREE.InstancedMesh(geo, btnBase, 12);
      const d = new THREE.Object3D();
      const col = new THREE.Color();
      let n = 0;
      for (const side of [-1, 1]) {
        for (let row = 0; row < 2; row++) {
          for (let c2 = 0; c2 < 3; c2++) {
            d.position.set(side * 0.148 + (c2 - 1) * 0.021, 0.013 - row * 0.021, FACE * 0.045);
            d.updateMatrix();
            btns.setMatrixAt(n, d.matrix);
            const lit = row === 0 && c2 === 0;
            col.setHex(lit ? 0x86d9c0 : row ? 0x3a424a : 0x525d66);
            btns.setColorAt(n, col);
            n++;
          }
        }
      }
      btns.instanceMatrix.needsUpdate = true;
      if (btns.instanceColor) btns.instanceColor.needsUpdate = true;
      this.wheelPivot.add(btns);
    }
    // Нижняя спица.
    const bottomSpoke = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.026, 0.19, 6), wheelBlack);
    bottomSpoke.position.set(0, -0.14, FACE * 0.003);
    this.wheelPivot.add(bottomSpoke);

    // Ступица: корпус, хром-кольцо, сигнал, шильд и три «винта».
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.094, 0.052, 28), wheelBlack);
    hub.rotation.x = Math.PI / 2;
    hub.position.z = FACE * 0.012;
    this.wheelPivot.add(hub);
    const hubRing = new THREE.Mesh(new THREE.TorusGeometry(0.084, 0.005, 8, 40), chrome);
    hubRing.position.z = FACE * 0.038;
    this.wheelPivot.add(hubRing);
    const hornPad = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.068, 0.03, 28), M(null, { color: 0x1f252a, roughness: 0.62 }));
    hornPad.rotation.x = Math.PI / 2;
    hornPad.position.z = FACE * 0.042;
    this.wheelPivot.add(hornPad);
    // Шильд смотрит на водителя: разворачиваем на 180°, иначе буквы зеркальны.
    const badge = new THREE.Mesh(new THREE.CircleGeometry(0.032, 28), M(this.badgeTexture(), { roughness: 0.3, metalness: 0.6 }));
    badge.position.z = FACE * 0.058;
    badge.rotation.y = Math.PI;
    this.wheelPivot.add(badge);
    for (let i = 0; i < 3; i++) {
      const a = i * ((Math.PI * 2) / 3) + 0.4;
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.004, 8), matteChrome);
      screw.rotation.x = Math.PI / 2;
      screw.position.set(Math.cos(a) * 0.073, Math.sin(a) * 0.073, FACE * 0.038);
      this.wheelPivot.add(screw);
    }
    g.add(this.wheelPivot);

    // Колонка руля: конус, хром-кольцо у штурвала и облицовка.
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.68, 18), wheelBlack);
    column.position.set(EYE.x, 1.9, 2.26);
    column.rotation.x = Math.PI / 2 - 0.42;
    this.wheelColumn = column;
    g.add(column);
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.008, 8, 28), matteChrome);
    collar.position.set(EYE.x, 2.0, 2.06);
    collar.rotation.x = -0.34;
    g.add(collar);
    const columnShroud = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.128, 0.26, 20), trimMat);
    columnShroud.rotation.x = Math.PI / 2 - 0.42;
    columnShroud.scale.set(1, 1, 0.82);
    columnShroud.position.set(EYE.x, 1.94, 2.3);
    g.add(columnShroud);

    // Подрулевые переключатели: поворотники (слева) и дворники (справа).
    this.stalks = [];
    for (const side of [-1, 1]) {
      const stalk = new THREE.Group();
      stalk.position.set(EYE.x + side * 0.115, 1.97, 2.22);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.013, 0.17, 8), wheelBlack);
      arm.rotation.z = Math.PI / 2;
      arm.rotation.y = side * 0.15;
      arm.position.x = side * 0.06;
      stalk.add(arm);
      const stalkCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.028, 10), matteChrome);
      stalkCollar.rotation.z = Math.PI / 2;
      stalkCollar.position.x = side * 0.02;
      stalk.add(stalkCollar);
      const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.013, 0.034, 12), M(null, { color: 0x2b3136, roughness: 0.45 }));
      tip.rotation.z = Math.PI / 2;
      tip.position.x = side * 0.148;
      stalk.add(tip);
      // Цветная метка на торце: поворотник — янтарный, дворники — синий.
      const mark = new THREE.Mesh(
        new THREE.CircleGeometry(0.012, 10),
        M(null, {
          color: side < 0 ? 0xe0b45a : 0x7fa6d8,
          roughness: 0.5,
          emissive: side < 0 ? 0x3a2a0a : 0x0a1a2a,
          emissiveIntensity: 1,
        })
      );
      mark.rotation.y = (side * Math.PI) / 2;
      mark.position.x = side * 0.166;
      stalk.add(mark);
      g.add(stalk);
      this.stalks.push(stalk);
    }
    this.indicatorStalk = 0;
    this.stalkTick = 0;

    // Салонный «шум» руля: на холостых штурвал мелко подрагивает.
    this.wheelVibe = 0;
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
    mergeStatic(g, [this.wheelPivot, ...(this.stalks || [])]);
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
  /**
   * Сменить модель тягача: внешность (обвес, оптика, мосты) пересобирается,
   * салон и камера остаются на месте. Возвращает true, если геометрия менялась.
   */
  applyModel(modelId, paintHex = null) {
    if (!modelId || modelId === this.modelId) {
      if (paintHex != null) this.setPaint(paintHex);
      return false;
    }
    if (paintHex != null) this.setPaint(paintHex);
    const old = this.tractor;
    // Колёса тягача уходят вместе с ним, колёса прицепа остаются.
    const tractorWheels = this.wheels.filter((w) => {
      let node = w;
      while (node) {
        if (node === old) return true;
        node = node.parent;
      }
      return false;
    });
    this.wheels = this.wheels.filter((w) => !tractorWheels.includes(w));
    this.frontWheels = [];
    if (old) {
      old.traverse((o) => {
        if (o.isMesh) o.geometry?.dispose?.();
      });
      this.root.remove(old);
    }
    this.modelId = modelId;
    this.look = lookFor(modelId);
    this.buildTractor();
    // Новые меши склеиваем по материалам, как при сборке: иначе +150 draw call.
    mergeStatic(this.tractor, [...this.wheels, ...this.glazing, ...this.wipers]);
    this.applyShadowFlags(this.shadowOn !== false);
    return true;
  }

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

  /** Рычаг поворотников в кабине встаёт в положение вместе с реле. */
  setIndicatorStalk(dir) {
    this.indicatorDir = dir || 0;
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
    // Колёса поворачиваются вместе с рулём (а не мгновенно), чтобы чувствовалась масса.
    const wheelLock = Math.max(-1, Math.min(1, (this.wheelAngle || 0) / 4.4));
    for (const w of this.frontWheels) w.rotation.y = wheelLock * 0.46;
    // Руль: пружина с демпфером вместо мгновенного поворота. Полный ход ≈1.4 оборота,
    // быстрая перекладка даёт лёгкий заброс, как у настоящего штурвала.
    if (this.wheelPivot) {
      const target = -steer * 4.6;
      const step = Math.min(dt, 0.05);
      const accel = (target - (this.wheelAngle || 0)) * 118 - (this.wheelVel || 0) * 15;
      this.wheelVel = (this.wheelVel || 0) + accel * step;
      this.wheelAngle = (this.wheelAngle || 0) + this.wheelVel * step;
      this.wheelPivot.rotation.z = this.wheelAngle;
      // Живая деталь: на холостых штурвал мелко дрожит от мотора, на оборотах
      // вибрация звонче. Амплитуда в миллиметрах — её видно, но она не мешает.
      const vib = clamp((status.rpm || 700) / 700, 0.8, 2.2);
      const t = performance.now() * 0.001;
      this.wheelPivot.position.y = 2.05 + Math.sin(t * 47) * 0.0018 * vib;
      this.wheelPivot.position.x = EYE.x + Math.cos(t * 63) * 0.001 * vib;
      if (this.wheelColumn) this.wheelColumn.rotation.z = this.wheelAngle * 0.06;
    }
    // Подрулевые переключатели: поворотник щёлкает вниз и держится, пока мигает;
    // правый опускается, когда идёт дождь и работают дворники.
    if (this.stalks && this.stalks.length) {
      const target = this.indicatorDir ? (this.indicatorDir > 0 ? 0.18 : -0.18) : 0;
      const left = this.stalks[0];
      left.rotation.z += (target - left.rotation.z) * Math.min(1, dt * 14);
      const right = this.stalks[1];
      const wTarget = (opts.rain || 0) > 0.15 ? 0.12 : 0;
      right.rotation.z += (wTarget - right.rotation.z) * Math.min(1, dt * 8);
    }
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
