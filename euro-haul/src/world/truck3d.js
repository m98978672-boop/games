// 3D-модель тягача AURIGA, прицепа и кабины с приборной панелью.
import * as THREE from 'three';
import { materials, trailerTexture } from './materials.js';
import { clamp, fmtTime } from '../core/math.js';

const UP = new THREE.Vector3(0, 1, 0);

function box(parent, w, h, d, mat, x, y, z, rotY = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  if (rotY) mesh.rotation.y = rotY;
  parent.add(mesh);
  return mesh;
}

function cylinder(parent, r1, r2, h, mat, x, y, z, rotZ = Math.PI / 2, segments = 14) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, segments), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.z = rotZ;
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

    this.paint = new THREE.MeshStandardMaterial({ color: paintHex, metalness: 0.45, roughness: 0.28 });
    this.paintDark = new THREE.MeshStandardMaterial({ color: new THREE.Color(paintHex).multiplyScalar(0.55), metalness: 0.4, roughness: 0.4 });

    this.wheels = [];
    this.frontWheels = [];
    this.wipers = [];
    this.indicators = [];
    this.buildTractor();
    this.buildTrailer('curtain', 'Auriga Logistics');
    this.buildInterior();
    this.headlights = new THREE.Group();
    this.root.add(this.headlights);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0.12, depthWrite: false });
    for (const x of [-0.9, 0.9]) {
      const beam = new THREE.Mesh(new THREE.ConeGeometry(2.4, 26, 12, 1, true), beamMat);
      beam.rotation.x = Math.PI / 2;
      beam.position.set(x, 0.85, 14);
      this.headlights.add(beam);
    }
    this.headlights.visible = false;
    this.trailerGroup = null;
  }

  buildTractor() {
    const m = this.mats;
    const g = new THREE.Group();
    this.tractor = g;
    this.root.add(g);

    // Рама и седло.
    box(g, 1.1, 0.34, 7.6, m.darkMetal, 0, 0.72, -1.0);
    box(g, 1.2, 0.12, 1.1, m.metal, 0, 1.02, -0.35);

    // Кабина: профиль с наклонным лобовым стеклом.
    const shape = new THREE.Shape();
    shape.moveTo(-0.55, 0.86);
    shape.lineTo(3.22, 0.86);
    shape.lineTo(3.22, 1.5);
    shape.lineTo(3.0, 3.6);
    shape.lineTo(2.42, 3.72);
    shape.lineTo(-0.15, 3.72);
    shape.lineTo(-0.95, 3.0);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 2.42, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 2 });
    geo.translate(0, 0, -1.21);
    geo.rotateY(-Math.PI / 2);
    const cab = new THREE.Mesh(geo, this.paint);
    cab.position.set(0, 0, 0);
    g.add(cab);

    // Лобовое стекло и боковые окна.
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.55), m.glass);
    glass.position.set(0, 2.94, 3.09);
    glass.rotation.x = -0.18;
    g.add(glass);
    const wsFrame = box(g, 2.36, 0.14, 0.1, this.paintDark, 0, 3.62, 2.95);
    wsFrame.rotation.x = -0.18;
    for (const side of [-1, 1]) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.15), m.glass);
      win.position.set(side * 1.225, 2.92, 2.05);
      win.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
      g.add(win);
      const win2 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.0), m.glass);
      win2.position.set(side * 1.225, 2.9, 0.55);
      win2.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
      g.add(win2);
      // зеркала
      const arm = box(g, 0.9, 0.06, 0.06, m.darkMetal, side * 1.65, 3.2, 3.0);
      const mirror = box(g, 0.1, 0.62, 0.34, m.darkMetal, side * 1.95, 2.85, 2.98);
      const glassM = box(g, 0.02, 0.5, 0.26, m.glass, side * 2.0, 2.85, 2.98);
      void arm;
      void mirror;
      void glassM;
      // дверная ручка и молдинг
      box(g, 0.04, 0.12, 0.28, m.chrome, side * 1.27, 2.2, 1.4);
    }

    // Решётка, бампер, фары.
    box(g, 2.3, 0.55, 0.1, m.darkMetal, 0, 1.35, 3.28);
    for (let i = 0; i < 5; i++) box(g, 2.1, 0.05, 0.14, m.chrome, 0, 1.15 + i * 0.1, 3.3);
    box(g, 2.42, 0.36, 0.36, this.paintDark, 0, 0.92, 3.3);
    const headMat = m.headlight;
    for (const x of [-0.78, 0.78]) {
      box(g, 0.55, 0.28, 0.12, headMat, x, 1.72, 3.31);
    }
    box(g, 2.3, 0.24, 0.1, m.darkMetal, 0, 0.72, 3.34);
    for (const x of [-0.9, 0.9]) box(g, 0.22, 0.12, 0.08, m.taillight, x, 3.82, 2.98);

    // Солнцезащитный козырёк и крыша.
    box(g, 2.44, 0.22, 1.6, this.paint, 0, 3.83, 2.0);
    for (let i = 0; i < 5; i++) box(g, 0.22, 0.16, 0.9, m.headlight, -0.9 + i * 0.45, 3.9, 2.5);
    box(g, 2.1, 0.5, 1.1, this.paintDark, 0, 3.9, 0.75);

    // Топливный бак, выхлоп, ящики.
    cylinder(g, 0.42, 0.42, 2.1, m.metal, -1.15, 0.72, -1.2, Math.PI / 2);
    cylinder(g, 0.42, 0.42, 1.4, m.metal, 1.15, 0.72, -1.0, Math.PI / 2);
    cylinder(g, 0.1, 0.1, 2.2, m.chrome, 1.1, 2.2, -2.2, 0, 8).rotation.x = 0;
    box(g, 1.0, 0.85, 1.4, m.wall, 0, 0.9, -2.9);

    // Колёса: передняя ось и задняя тележка.
    const wheelGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.34, 18);
    const rimGeo = new THREE.CylinderGeometry(0.27, 0.27, 0.36, 12);
    const addWheel = (x, z, front) => {
      const w = new THREE.Group();
      const tyre = new THREE.Mesh(wheelGeo, m.tyres);
      tyre.rotation.z = Math.PI / 2;
      w.add(tyre);
      const rim = new THREE.Mesh(rimGeo, m.rim);
      rim.rotation.z = Math.PI / 2;
      w.add(rim);
      w.position.set(x, 0.52, z);
      g.add(w);
      this.wheels.push(w);
      if (front) this.frontWheels.push(w);
    };
    for (const side of [-1, 1]) {
      addWheel(side * 1.02, 2.55, true);
      addWheel(side * 0.92, -1.75, false);
      addWheel(side * 1.32, -1.75, false);
      addWheel(side * 0.92, -3.1, false);
      addWheel(side * 1.32, -3.1, false);
    }
    for (const side of [-1, 1]) {
      box(g, 0.06, 0.5, 1.0, m.darkMetal, side * 1.28, 0.5, 2.55);
    }

    // Дворники.
    for (const x of [-0.62, 0.2]) {
      const wiper = new THREE.Group();
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.9, 0.05), m.darkMetal);
      arm.position.y = 0.45;
      wiper.add(arm);
      wiper.position.set(x, 3.55, 3.15);
      wiper.rotation.x = -0.15;
      g.add(wiper);
      this.wipers.push(wiper);
    }
  }

  buildTrailer(type, company) {
    if (this.trailerGroup) {
      this.root.remove(this.trailerGroup);
      this.trailerGroup.traverse((o) => o.geometry && o.geometry.dispose());
    }
    const m = this.mats;
    const g = new THREE.Group();
    g.position.set(0, 0, -0.55);
    const L = 13.6;
    const zc = -L / 2 - 0.35;

    if (type === 'tank') {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.28, L, 22), m.chrome);
      tank.rotation.x = Math.PI / 2;
      tank.position.set(0, 2.2, zc);
      g.add(tank);
      for (const z of [-2.2, -6.0, -9.8]) {
        const ring = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.3, 0.4), m.darkMetal);
        ring.position.set(0, 2.2, zc + z + 2);
        g.add(ring);
      }
      box(g, 2.2, 0.16, L, m.darkMetal, 0, 1.35, zc);
    } else if (type === 'flatbed') {
      box(g, 2.5, 0.22, L, m.concrete, 0, 1.45, zc);
      const cargoMat = new THREE.MeshStandardMaterial({ color: 0x8a7a5f, roughness: 0.9 });
      for (let i = 0; i < 6; i++) box(g, 2.2, 1.6, 1.9, cargoMat, 0, 2.4, zc + 4.6 - i * 1.95);
    } else if (type === 'container') {
      const tex = trailerTexture(company, '#cf5b3a');
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 });
      box(g, 2.48, 2.85, L, mat, 0, 2.55, zc);
    } else if (type === 'log') {
      box(g, 2.4, 0.2, L, m.darkMetal, 0, 1.4, zc);
      const logMat = new THREE.MeshStandardMaterial({ color: 0x7a5a38, roughness: 1 });
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const len = L - 0.6;
          const log = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, len, 7), logMat);
          log.rotation.x = Math.PI / 2;
          log.position.set((c - 1) * 0.72, 1.85 + r * 0.62, zc);
          g.add(log);
        }
      }
      for (const z of [4.6, 0.6, -3.4, -7.4]) {
        box(g, 2.55, 2.2, 0.16, m.darkMetal, 0, 2.4, zc + z);
      }
    } else if (type === 'fridge') {
      const tex = trailerTexture(company, '#eef1f0');
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0.1 });
      box(g, 2.5, 3.0, L, mat, 0, 2.55, zc);
      const unit = box(g, 1.5, 0.9, 0.55, m.metal, 0, 3.4, zc + L / 2 + 0.2);
      void unit;
    } else {
      const tex = trailerTexture(company, '#e9e5d8');
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75 });
      box(g, 2.5, 3.0, L, mat, 0, 2.55, zc);
      // рёбра тента
      for (let i = 0; i < 16; i++) {
        box(g, 2.52, 2.9, 0.03, m.darkMetal, 0, 2.55, zc + L / 2 - 0.4 - i * 0.82);
      }
    }

    // Задние двери, бампер, фонари, брызговики.
    box(g, 2.4, 0.16, 0.14, m.darkMetal, 0, 1.1, zc - L / 2 - 0.05);
    for (const x of [-0.85, 0.85]) {
      box(g, 0.34, 0.5, 0.1, m.taillight, x, 1.35, zc - L / 2 - 0.08);
      box(g, 0.22, 0.16, 0.1, m.headlight, x, 0.85, zc - L / 2 - 0.08);
    }
    for (const x of [-1.0, 1.0]) {
      box(g, 0.7, 0.55, 0.05, m.darkMetal, x, 0.42, zc - L / 2 + 1.1);
    }
    // Опоры и колёса прицепа.
    for (const x of [-0.7, 0.7]) {
      const leg = cylinder(g, 0.09, 0.09, 1.2, m.darkMetal, x, 0.75, zc + L / 2 - 2.6, 0, 6);
      leg.rotation.z = 0;
    }
    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16);
    const rimGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.32, 10);
    for (const side of [-1, 1]) {
      for (const z of [-0.9, -2.25]) {
        const w = new THREE.Group();
        const tyre = new THREE.Mesh(wheelGeo, m.tyres);
        tyre.rotation.z = Math.PI / 2;
        w.add(tyre);
        const rim = new THREE.Mesh(rimGeo, m.rim);
        rim.rotation.z = Math.PI / 2;
        w.add(rim);
        w.position.set(side * (0.95 + (side > 0 ? 0.4 : 0)), 0.5, zc - 1.6 + z - 1.0);
        g.add(w);
        this.wheels.push(w);
      }
    }
    this.trailerGroup = g;
    this.root.add(g);
  }

  buildInterior() {
    const m = this.mats;
    const g = new THREE.Group();
    this.interior = g;
    this.root.add(g);
    const dashMat = new THREE.MeshStandardMaterial({ color: 0x252b2e, roughness: 0.9, side: THREE.DoubleSide });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x3d474b, roughness: 0.55, metalness: 0.25, side: THREE.DoubleSide });
    const fabricMat = new THREE.MeshStandardMaterial({ color: 0x2b3a44, roughness: 1, side: THREE.DoubleSide });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x33424d, roughness: 1, side: THREE.DoubleSide });

    // Панель приборов: массивная, от стекла к водителю.
    box(g, 2.3, 0.6, 0.95, dashMat, 0, 1.85, 2.75);
    box(g, 2.3, 0.34, 0.55, dashMat, 0, 2.15, 3.02);
    // Козырёк приборов.
    const cowl = box(g, 0.92, 0.26, 0.42, dashMat, -0.5, 2.3, 2.62);
    cowl.rotation.x = 0.18;
    // Центральная консоль с экраном навигации.
    box(g, 0.44, 0.5, 0.4, trimMat, 0.3, 2.12, 2.7);
    // Тоннель пола и двигатель внутри кабины.
    box(g, 0.9, 0.55, 1.3, trimMat, 0, 1.32, 2.15);
    // Руль.
    this.wheelPivot = new THREE.Group();
    this.wheelPivot.position.set(-0.5, 2.02, 2.14);
    this.wheelPivot.rotation.x = -0.42;
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.225, 0.032, 8, 22), new THREE.MeshStandardMaterial({ color: 0x1d2326, roughness: 0.9 }));
    this.wheelPivot.add(wheel);
    for (let i = 0; i < 3; i++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.035, 0.05), trimMat);
      spoke.rotation.z = (i * Math.PI) / 3;
      this.wheelPivot.add(spoke);
    }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 12), m.chrome);
    hub.rotation.x = Math.PI / 2;
    this.wheelPivot.add(hub);
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.5, 8), dashMat);
    column.position.set(-0.5, 1.85, 2.32);
    column.rotation.x = Math.PI / 2 - 0.42;
    g.add(this.wheelPivot, column);

    // Щиток приборов (канвас).
    this.dashCanvas = document.createElement('canvas');
    this.dashCanvas.width = 512;
    this.dashCanvas.height = 256;
    this.dashTex = new THREE.CanvasTexture(this.dashCanvas);
    this.dashTex.colorSpace = THREE.SRGBColorSpace;
    const dashScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.23), new THREE.MeshBasicMaterial({ map: this.dashTex }));
    dashScreen.position.set(-0.5, 2.2, 2.4);
    dashScreen.rotation.x = -0.22;
    g.add(dashScreen);
    this.dashScreen = dashScreen;

    // Экран навигации по центру.
    this.navCanvas = document.createElement('canvas');
    this.navCanvas.width = 256;
    this.navCanvas.height = 160;
    this.navTex = new THREE.CanvasTexture(this.navCanvas);
    this.navTex.colorSpace = THREE.SRGBColorSpace;
    const navScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.19), new THREE.MeshBasicMaterial({ map: this.navTex }));
    navScreen.position.set(0.32, 2.16, 2.49);
    navScreen.rotation.x = -0.2;
    g.add(navScreen);

    // Боковины: стойки, двери, потолок — чтобы кабина читалась изнутри.
    for (const side of [-1, 1]) {
      const pillar = box(g, 0.1, 1.5, 0.1, dashMat, side * 1.12, 2.95, 3.0);
      pillar.rotation.z = side * 0.06;
      box(g, 0.06, 2.2, 2.4, fabricMat, side * 1.14, 1.95, 1.5);
      box(g, 0.1, 0.5, 2.2, trimMat, side * 1.1, 1.2, 1.6);
      // подлокотник и ручка
      box(g, 0.12, 0.1, 0.5, trimMat, side * 1.02, 1.5, 1.35);
    }
    box(g, 2.3, 0.14, 2.6, fabricMat, 0, 3.52, 1.65);
    box(g, 2.2, 0.06, 0.4, trimMat, 0, 3.44, 2.75);
    // Спальник и задняя стенка.
    box(g, 2.2, 0.22, 1.1, fabricMat, 0, 1.35, 0.35);
    box(g, 2.3, 2.2, 0.1, fabricMat, 0, 2.3, -0.35);
    // Сиденья.
    for (const x of [-0.55, 0.55]) {
      box(g, 0.56, 0.18, 0.62, seatMat, x, 1.5, 1.3);
      const back = box(g, 0.5, 1.02, 0.16, seatMat, x, 1.98, 0.96);
      back.rotation.x = 0.12;
      box(g, 0.26, 0.2, 0.14, seatMat, x, 2.55, 0.9);
    }
    // Рычаг КПП и ручник.
    box(g, 0.05, 0.42, 0.05, m.darkMetal, 0.06, 1.75, 1.95);
    box(g, 0.09, 0.09, 0.09, trimMat, 0.06, 1.98, 1.95);
    // Солнцезащитные козырьки.
    for (const x of [-0.55, 0.55]) box(g, 0.9, 0.16, 0.3, fabricMat, x, 3.42, 2.85);
    this.interiorVisible = true;
    g.visible = true;
  }

  setPaint(hex) {
    this.paint.color.setHex(hex);
    this.paintDark.color.setHex(hex).multiplyScalar(0.55);
  }

  setNight(night, lightsOn) {
    this.headlights.visible = lightsOn;
    this.mats.headlight.emissiveIntensity = lightsOn ? 2.4 : 0.2;
    void night;
  }

  update(status, dt, opts = {}) {
    const { steer = 0, brake = 0, trailerType, company } = opts;
    if (trailerType && this.currentTrailer !== trailerType + company) {
      this.currentTrailer = trailerType + company;
      this.buildTrailer(trailerType, company || 'Auriga Logistics');
    }
    // Колёса.
    const spin = (status.speedKmh / 3.6 / 0.52) * dt;
    for (const w of this.wheels) w.rotation.x -= spin;
    for (const w of this.frontWheels) w.rotation.y = steer * 0.42;
    // Руль и дворники.
    if (this.wheelPivot) this.wheelPivot.rotation.z = -steer * 3.2;
    const wiperOn = opts.rain > 0.15;
    if (this.wipers.length) {
      this.wiperPhase = (this.wiperPhase || 0) + dt * (wiperOn ? 4.2 : 0);
      const a = wiperOn ? Math.sin(this.wiperPhase) * 0.85 : 0;
      for (const w of this.wipers) w.rotation.z = -a;
    }
    // Приборы (10 Гц достаточно).
    this.dashAcc = (this.dashAcc || 0) + dt;
    if (this.dashAcc > 0.1) {
      this.dashAcc = 0;
      this.drawDash(status);
    }
    void brake;
  }

  drawDash(status) {
    const c = this.dashCanvas.getContext('2d');
    const w = 512;
    const h = 256;
    c.fillStyle = '#0d1214';
    c.fillRect(0, 0, w, h);
    c.strokeStyle = '#1d282c';
    c.lineWidth = 3;
    c.strokeRect(6, 6, w - 12, h - 12);
    const dial = (cx, cy, r, value, max, label, unit, color) => {
      c.save();
      c.translate(cx, cy);
      c.strokeStyle = '#25343a';
      c.lineWidth = 10;
      c.beginPath();
      c.arc(0, 0, r, Math.PI * 0.75, Math.PI * 2.25);
      c.stroke();
      const pct = clamp(value / max, 0, 1);
      c.strokeStyle = color;
      c.beginPath();
      c.arc(0, 0, r, Math.PI * 0.75, Math.PI * 0.75 + Math.PI * 1.5 * pct);
      c.stroke();
      c.fillStyle = '#e8f2ea';
      c.font = 'bold 44px system-ui, Arial';
      c.textAlign = 'center';
      c.fillText(String(Math.round(value)), 0, 10);
      c.fillStyle = '#7f9188';
      c.font = 'bold 17px system-ui, Arial';
      c.fillText(unit, 0, 36);
      c.fillStyle = '#9fb2a8';
      c.font = 'bold 15px system-ui, Arial';
      c.fillText(label, 0, r + 26);
      c.restore();
    };
    dial(130, 128, 92, status.speedKmh, 120, 'СКОРОСТЬ', 'км/ч', '#8ad4ff');
    dial(382, 128, 92, status.rpm, 2400, 'ОБОРОТЫ', 'об/мин', '#ffcf6b');
    c.fillStyle = '#9fb2a8';
    c.font = 'bold 22px system-ui, Arial';
    c.textAlign = 'center';
    c.fillText('ПЕРЕДАЧА', 256, 60);
    c.fillStyle = '#e8f2ea';
    c.font = 'bold 52px system-ui, Arial';
    c.fillText(status.gear === -1 ? 'R' : status.gear === 0 ? 'N' : String(status.gear), 256, 112);
    c.fillStyle = '#ffcf6b';
    c.font = 'bold 18px system-ui, Arial';
    c.fillText('ТОПЛИВО ' + Math.round(status.fuel) + ' л', 256, 152);
    c.fillStyle = status.temp > 100 ? '#ff7b6b' : '#7f9188';
    c.fillText('ОЖ ' + Math.round(status.temp) + '°C', 256, 180);
    c.fillStyle = '#7f9188';
    c.font = 'bold 16px system-ui, Arial';
    c.fillText(status.clock ? fmtTime(status.clock) : '', 256, 210);
    this.dashTex.needsUpdate = true;
  }

  drawNav(info) {
    const c = this.navCanvas.getContext('2d');
    c.fillStyle = '#0b1418';
    c.fillRect(0, 0, 256, 160);
    c.strokeStyle = '#1f3b40';
    c.lineWidth = 2;
    c.strokeRect(4, 4, 248, 152);
    c.fillStyle = '#7fe0c0';
    c.font = 'bold 20px system-ui, Arial';
    c.textAlign = 'center';
    c.fillText(info.title || 'МАРШРУТ', 128, 38, 232);
    c.fillStyle = '#e8f2ea';
    c.font = 'bold 34px system-ui, Arial';
    c.fillText(info.distance || '—', 128, 92);
    c.fillStyle = '#8ea9a0';
    c.font = 'bold 18px system-ui, Arial';
    c.fillText(info.eta || '', 128, 126);
    this.navTex.needsUpdate = true;
  }

  setInteriorVisible(v) {
    if (this.interiorVisible === v) return;
    this.interiorVisible = v;
    this.interior.visible = v;
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

export { UP };
