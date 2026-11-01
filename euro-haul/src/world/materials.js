// Процедурные текстуры и материалы. Ни одного внешнего файла — игра работает офлайн.
import * as THREE from 'three';
import { rng, clamp } from '../core/math.js';

const cache = new Map();

export function canvasTexture(key, w, h, draw, { repeat = [1, 1], srgb = true } = {}) {
  if (cache.has(key)) return cache.get(key);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = 8;
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, tex);
  return tex;
}

export const textures = {
  asphalt() {
    return canvasTexture('asphalt', 512, 512, (c, w, h) => {
      c.fillStyle = '#4a4d4f';
      c.fillRect(0, 0, w, h);
      const r = rng(7);
      for (let i = 0; i < 26000; i++) {
        const g = 52 + Math.floor(r() * 46);
        c.fillStyle = `rgb(${g},${g + 2},${g + 3})`;
        c.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
      }
      for (let i = 0; i < 60; i++) {
        c.strokeStyle = `rgba(30,32,34,${0.05 + r() * 0.12})`;
        c.lineWidth = 1 + r() * 3;
        c.beginPath();
        const x = r() * w;
        c.moveTo(x, 0);
        c.bezierCurveTo(x + 20, h * 0.3, x - 20, h * 0.6, x + 10, h);
        c.stroke();
      }
    }, { repeat: [4, 60] });
  },
  grass() {
    return canvasTexture('grass', 512, 512, (c, w, h) => {
      c.fillStyle = '#4d6238';
      c.fillRect(0, 0, w, h);
      const r = rng(21);
      for (let i = 0; i < 18000; i++) {
        const g = r();
        c.fillStyle = g > 0.6 ? '#5b7440' : g > 0.3 ? '#42592f' : '#394d29';
        c.fillRect(r() * w, r() * h, 2 + r() * 4, 2 + r() * 4);
      }
    }, { repeat: [16, 120] });
  },
  concrete() {
    return canvasTexture('concrete', 256, 256, (c, w, h) => {
      c.fillStyle = '#9a9a94';
      c.fillRect(0, 0, w, h);
      const r = rng(3);
      for (let i = 0; i < 6000; i++) {
        const g = 130 + Math.floor(r() * 40);
        c.fillStyle = `rgb(${g},${g},${g - 4})`;
        c.fillRect(r() * w, r() * h, 2, 2);
      }
      c.strokeStyle = 'rgba(90,90,88,.5)';
      c.lineWidth = 2;
      c.strokeRect(0, 0, w, h);
    }, { repeat: [2, 2] });
  },
  windows() {
    return canvasTexture('windows', 256, 256, (c, w, h) => {
      c.fillStyle = '#2e3336';
      c.fillRect(0, 0, w, h);
      const r = rng(11);
      const cols = 6;
      const rows = 8;
      const cw = w / cols;
      const ch = h / rows;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const lit = r() > 0.45;
          c.fillStyle = lit ? `rgba(255,214,140,${0.55 + r() * 0.4})` : 'rgba(28,34,40,0.9)';
          c.fillRect(x * cw + cw * 0.16, y * ch + ch * 0.2, cw * 0.68, ch * 0.5);
        }
      }
    }, { repeat: [1, 1] });
  },
  buildingWall() {
    return canvasTexture('buildingWall', 256, 256, (c, w, h) => {
      c.fillStyle = '#b7b2a6';
      c.fillRect(0, 0, w, h);
      const r = rng(17);
      for (let i = 0; i < 5000; i++) {
        const g = 150 + Math.floor(r() * 50);
        c.fillStyle = `rgba(${g},${g - 4},${g - 14},.5)`;
        c.fillRect(r() * w, r() * h, 2, 2);
      }
    }, { repeat: [1, 1] });
  },
  skyline() {
    return canvasTexture('skyline', 1024, 256, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      const r = rng(99);
      for (let i = 0; i < 90; i++) {
        const bw = 12 + r() * 46;
        const bh = 30 + r() * 190;
        const x = r() * w;
        c.fillStyle = `rgba(${28 + r() * 20},${34 + r() * 20},${42 + r() * 20},0.85)`;
        c.fillRect(x, h - bh, bw, bh);
        for (let wy = h - bh + 8; wy < h - 8; wy += 12) {
          for (let wx = x + 4; wx < x + bw - 4; wx += 9) {
            if (r() > 0.55) {
              c.fillStyle = 'rgba(255,206,120,.75)';
              c.fillRect(wx, wy, 3, 4);
            }
          }
        }
      }
    }, { repeat: [1, 1] });
  },
};

let materialCache = null;

export function materials() {
  if (materialCache) return materialCache;
  const asphaltTex = textures.asphalt();
  const grassTex = textures.grass();
  const concreteTex = textures.concrete();
  const windowsTex = textures.windows();
  const wallTex = textures.buildingWall();

  materialCache = {
    asphalt: new THREE.MeshStandardMaterial({
      color: 0x9aa0a4,
      map: asphaltTex,
      roughness: 0.94,
      metalness: 0.02,
    }),
    grass: new THREE.MeshStandardMaterial({ color: 0x9fb27f, map: grassTex, roughness: 1 }),
    grassDark: new THREE.MeshStandardMaterial({ color: 0x7e9468, map: grassTex, roughness: 1 }),
    concrete: new THREE.MeshStandardMaterial({ color: 0xb9b9b2, map: concreteTex, roughness: 0.9 }),
    whiteLine: new THREE.MeshStandardMaterial({ color: 0xf2f0e6, roughness: 0.7, emissive: 0x222222 }),
    yellowLine: new THREE.MeshStandardMaterial({ color: 0xf0c14a, roughness: 0.7 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x8d9499, metalness: 0.75, roughness: 0.42 }),
    darkMetal: new THREE.MeshStandardMaterial({ color: 0x3b4247, metalness: 0.6, roughness: 0.6 }),
    wall: new THREE.MeshStandardMaterial({ color: 0xcfc8b8, map: wallTex, roughness: 0.9 }),
    windows: new THREE.MeshStandardMaterial({
      color: 0x5b6167,
      map: windowsTex,
      emissive: 0xffcf87,
      emissiveMap: windowsTex,
      emissiveIntensity: 0.0,
      roughness: 0.65,
      metalness: 0.2,
    }),
    roof: new THREE.MeshStandardMaterial({ color: 0x8c6d5c, roughness: 0.95 }),
    roofLight: new THREE.MeshStandardMaterial({ color: 0xb0b7bb, roughness: 0.9 }),
    trunk: new THREE.MeshStandardMaterial({ color: 0x5b4936, roughness: 1 }),
    leaves: [
      new THREE.MeshStandardMaterial({ color: 0x456b3a, roughness: 1 }),
      new THREE.MeshStandardMaterial({ color: 0x557c40, roughness: 1 }),
      new THREE.MeshStandardMaterial({ color: 0x38542f, roughness: 1 }),
      new THREE.MeshStandardMaterial({ color: 0x6d7f3a, roughness: 1 }),
    ],
    glass: new THREE.MeshPhysicalMaterial({
      color: 0x9fc4cf,
      metalness: 0.25,
      roughness: 0.12,
      transparent: true,
      opacity: 0.62,
      transmission: 0.15,
    }),
    lamp: new THREE.MeshStandardMaterial({
      color: 0xfff2c9,
      emissive: 0xffd88a,
      emissiveIntensity: 1.4,
      roughness: 0.4,
    }),
    lampOff: new THREE.MeshStandardMaterial({ color: 0xb9b6a8, roughness: 0.6 }),
    redLight: new THREE.MeshStandardMaterial({ color: 0xd33a2c, emissive: 0x8c1408, emissiveIntensity: 1.1 }),
    blueSign: new THREE.MeshStandardMaterial({ color: 0x1d4f8c, roughness: 0.62 }),
    greenSign: new THREE.MeshStandardMaterial({ color: 0x1f6b46, roughness: 0.62 }),
    tyres: new THREE.MeshStandardMaterial({ color: 0x1c1f21, roughness: 0.95 }),
    rim: new THREE.MeshStandardMaterial({ color: 0xb9bec2, metalness: 0.85, roughness: 0.3 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xd8dde0, metalness: 1, roughness: 0.16 }),
    headlight: new THREE.MeshStandardMaterial({ color: 0xfff6d8, emissive: 0xfff0c0, emissiveIntensity: 2.2 }),
    taillight: new THREE.MeshStandardMaterial({ color: 0xd22e22, emissive: 0x8a0f08, emissiveIntensity: 1.6 }),
  };
  return materialCache;
}

export function setNightIntensity(mats, nightAmount) {
  mats.windows.emissiveIntensity = clamp(nightAmount, 0, 1) * 1.1;
  mats.lamp.emissiveIntensity = 0.25 + nightAmount * 2.2;
}

/** Текстура прицепа с названием компании-заказчика. */
export function trailerTexture(company, color = '#e8e4d9') {
  const key = 'trailer:' + company + color;
  return canvasTexture(key, 1024, 512, (c, w, h) => {
    c.fillStyle = color;
    c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(0,0,0,0.06)';
    for (let x = 0; x < w; x += 26) c.fillRect(x, 0, 4, h);
    c.fillStyle = '#2d3c33';
    c.fillRect(0, h * 0.62, w, 14);
    c.fillStyle = '#22302a';
    c.font = 'bold 86px system-ui, Arial';
    c.fillText(company.toUpperCase(), 46, h * 0.42);
    c.fillStyle = '#5d6b5f';
    c.font = 'bold 30px system-ui, Arial';
    c.fillText('ЕВРОПЕЙСКИЕ ГРУЗОВЫЕ ЛИНИИ', 48, h * 0.55);
    c.strokeStyle = 'rgba(40,50,44,0.55)';
    c.lineWidth = 6;
    c.strokeRect(12, 12, w - 24, h - 24);
  }, { repeat: [1, 1] });
}
