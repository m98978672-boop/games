// Процедурные текстуры и материалы. Ни одного внешнего файла — игра работает офлайн.
import * as THREE from 'three';
import { rng, clamp } from '../core/math.js';

const cache = new Map();

export function canvasTexture(key, w, h, draw, { repeat = [1, 1], srgb = true, aniso = 8 } = {}) {
  if (cache.has(key)) return cache.get(key);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = aniso;
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, tex);
  return tex;
}

/** Рыхлая «крупа» — общий приём для асфальта, бетона, земли. */
function speckle(c, w, h, count, colors, scale = 2, seed = 1) {
  const r = rng(seed);
  for (let i = 0; i < count; i++) {
    c.fillStyle = colors[Math.floor(r() * colors.length)];
    const s = 1 + r() * scale;
    c.fillRect(r() * w, r() * h, s, s);
  }
}

function noiseOverlay(c, w, h, alpha = 0.05, seed = 3) {
  const r = rng(seed);
  for (let i = 0; i < 900; i++) {
    c.fillStyle = `rgba(0,0,0,${r() * alpha})`;
    const rad = 6 + r() * 40;
    c.beginPath();
    c.arc(r() * w, r() * h, rad, 0, Math.PI * 2);
    c.fill();
  }
}

export const textures = {
  asphalt() {
    // Бесшовное покрытие: тайл 8×8 м, тёмный асфальт с крупным щебнем и следами шин.
    return canvasTexture('asphalt-v2', 1024, 1024, (c, w, h) => {
      c.fillStyle = '#4c5053';
      c.fillRect(0, 0, w, h);
      speckle(c, w, h, 42000, ['#43474a', '#54585b', '#5c6063', '#3c4043', '#62666a'], 2.4, 11);
      // крупный щебень
      const r = rng(5);
      for (let i = 0; i < 2600; i++) {
        const x = r() * w;
        const y = r() * h;
        const rad = 1.2 + r() * 3.2;
        c.fillStyle = r() > 0.5 ? 'rgba(120,124,128,0.5)' : 'rgba(52,56,60,0.55)';
        c.beginPath();
        c.ellipse(x, y, rad, rad * (0.6 + r() * 0.6), r() * 3.14, 0, Math.PI * 2);
        c.fill();
      }
      // продольные следы от шин
      for (const cx of [w * 0.3, w * 0.7]) {
        const grd = c.createLinearGradient(cx - 90, 0, cx + 90, 0);
        grd.addColorStop(0, 'rgba(90,94,97,0)');
        grd.addColorStop(0.5, 'rgba(104,108,112,0.22)');
        grd.addColorStop(1, 'rgba(90,94,97,0)');
        c.fillStyle = grd;
        c.fillRect(cx - 90, 0, 180, h);
      }
      noiseOverlay(c, w, h, 0.06, 7);
      // редкие ремонтные швы
      c.strokeStyle = 'rgba(30,33,35,0.5)';
      c.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        c.beginPath();
        const y = (i / 4) * h + 30;
        c.moveTo(0, y);
        c.bezierCurveTo(w * 0.3, y + 12, w * 0.7, y - 12, w, y + 4);
        c.stroke();
      }
    });
  },
  grass() {
    // Тайл 8×8 м: луг с разнотравьем.
    return canvasTexture('grass-v2', 1024, 1024, (c, w, h) => {
      c.fillStyle = '#546b3a';
      c.fillRect(0, 0, w, h);
      speckle(c, w, h, 50000, ['#5d7741', '#4b6134', '#65803f', '#43582e', '#6d8a48'], 3, 21);
      const r = rng(31);
      // травинки
      for (let i = 0; i < 4200; i++) {
        const x = r() * w;
        const y = r() * h;
        const len = 5 + r() * 13;
        c.strokeStyle = r() > 0.5 ? 'rgba(120,150,80,0.55)' : 'rgba(60,82,40,0.6)';
        c.lineWidth = 1 + r();
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + (r() - 0.5) * 6, y - len);
        c.stroke();
      }
      // проплешины земли
      for (let i = 0; i < 26; i++) {
        const x = r() * w;
        const y = r() * h;
        const rad = 12 + r() * 52;
        const grd = c.createRadialGradient(x, y, 0, x, y, rad);
        grd.addColorStop(0, 'rgba(96,84,54,0.55)');
        grd.addColorStop(1, 'rgba(96,84,54,0)');
        c.fillStyle = grd;
        c.beginPath();
        c.arc(x, y, rad, 0, Math.PI * 2);
        c.fill();
      }
      noiseOverlay(c, w, h, 0.05, 13);
    });
  },
  concrete() {
    return canvasTexture('concrete-v2', 512, 512, (c, w, h) => {
      c.fillStyle = '#a8a8a2';
      c.fillRect(0, 0, w, h);
      speckle(c, w, h, 16000, ['#a0a09a', '#b0b0aa', '#9a9a94', '#b8b8b2'], 2, 3);
      c.strokeStyle = 'rgba(120,120,116,0.7)';
      c.lineWidth = 3;
      for (let i = 1; i < 4; i++) {
        c.beginPath();
        c.moveTo((i / 4) * w, 0);
        c.lineTo((i / 4) * w, h);
        c.moveTo(0, (i / 4) * h);
        c.lineTo(w, (i / 4) * h);
        c.stroke();
      }
      noiseOverlay(c, w, h, 0.05, 9);
    });
  },
  building() {
    // Фасад с окнами: попадает на стены домов, светится ночью.
    return canvasTexture('building-v2', 512, 512, (c, w, h) => {
      c.fillStyle = '#b9b3a5';
      c.fillRect(0, 0, w, h);
      speckle(c, w, h, 12000, ['#c2bcae', '#aea89a', '#c8c2b4'], 2, 17);
      const r = rng(23);
      const cols = 5;
      const rows = 7;
      const cw = w / cols;
      const ch = h / rows;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const wx = x * cw + cw * 0.18;
          const wy = y * ch + ch * 0.16;
          const ww = cw * 0.64;
          const wh = ch * 0.56;
          // рама
          c.fillStyle = 'rgba(90,92,88,0.85)';
          c.fillRect(wx - 3, wy - 3, ww + 6, wh + 6);
          // стекло: тёмное или подсвеченное
          const lit = r() > 0.62;
          const g = c.createLinearGradient(wx, wy, wx, wy + wh);
          if (lit) {
            g.addColorStop(0, '#ffd9a1');
            g.addColorStop(1, '#d8a45f');
          } else {
            g.addColorStop(0, '#3a4650');
            g.addColorStop(1, '#28323a');
          }
          c.fillStyle = g;
          c.fillRect(wx, wy, ww, wh);
          // переплёт
          c.fillStyle = 'rgba(70,72,68,0.9)';
          c.fillRect(wx + ww / 2 - 1.5, wy, 3, wh);
          c.fillRect(wx, wy + wh / 2 - 1.5, ww, 3);
          // подоконник
          c.fillStyle = 'rgba(200,196,186,0.9)';
          c.fillRect(wx - 4, wy + wh + 3, ww + 8, 4);
        }
        // межэтажная полоса
        c.fillStyle = 'rgba(160,154,144,0.35)';
        c.fillRect(0, (y + 1) * ch - 3, w, 3);
      }
      noiseOverlay(c, w, h, 0.04, 29);
    }, { repeat: [1, 1] });
  },
  wall() {
    return canvasTexture('wall-v2', 512, 512, (c, w, h) => {
      c.fillStyle = '#c9c2b2';
      c.fillRect(0, 0, w, h);
      speckle(c, w, h, 18000, ['#d2cbba', '#bdb6a6', '#d8d2c2'], 2.4, 41);
      noiseOverlay(c, w, h, 0.06, 43);
    });
  },
  skyline() {
    return canvasTexture('skyline-v2', 1024, 256, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      const r = rng(99);
      for (let i = 0; i < 110; i++) {
        const bw = 10 + r() * 44;
        const bh = 26 + r() * 200;
        const x = r() * w;
        const shade = 26 + r() * 26;
        c.fillStyle = `rgba(${shade},${shade + 7},${shade + 14},0.9)`;
        c.fillRect(x, h - bh, bw, bh);
        for (let wy = h - bh + 8; wy < h - 8; wy += 11) {
          for (let wx = x + 4; wx < x + bw - 4; wx += 9) {
            if (r() > 0.62) {
              c.fillStyle = `rgba(255,${196 + r() * 40},${110 + r() * 60},0.8)`;
              c.fillRect(wx, wy, 3, 4);
            }
          }
        }
      }
    });
  },
};

let materialCache = null;

export function materials() {
  if (materialCache) return materialCache;

  const asphaltTex = textures.asphalt();
  const grassTex = textures.grass();
  const concreteTex = textures.concrete();
  const buildingTex = textures.building();
  const wallTex = textures.wall();

  materialCache = {
    asphalt: new THREE.MeshStandardMaterial({ color: 0xb9bec2, map: asphaltTex, roughness: 0.93, metalness: 0.04 }),
    grass: new THREE.MeshStandardMaterial({ color: 0x9db27c, map: grassTex, roughness: 1 }),
    grassDark: new THREE.MeshStandardMaterial({ color: 0x7f9467, map: grassTex, roughness: 1 }),
    concrete: new THREE.MeshStandardMaterial({ color: 0xd0cfc7, map: concreteTex, roughness: 0.92 }),
    whiteLine: new THREE.MeshStandardMaterial({ color: 0xf4f2e8, roughness: 0.62, emissive: 0x1a1a1a }),
    yellowLine: new THREE.MeshStandardMaterial({ color: 0xf0c14a, roughness: 0.7 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x9aa1a6, metalness: 0.72, roughness: 0.38 }),
    darkMetal: new THREE.MeshStandardMaterial({ color: 0x3c4449, metalness: 0.55, roughness: 0.62 }),
    wall: new THREE.MeshStandardMaterial({ color: 0xd8d2c4, map: wallTex, roughness: 0.9 }),
    building: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: buildingTex,
      emissive: 0xffd08a,
      emissiveMap: buildingTex,
      emissiveIntensity: 0,
      roughness: 0.85,
    }),
    roof: new THREE.MeshStandardMaterial({ color: 0x8d6e5c, roughness: 0.95 }),
    roofLight: new THREE.MeshStandardMaterial({ color: 0xb4bbbf, roughness: 0.9 }),
    trunk: new THREE.MeshStandardMaterial({ color: 0x5c4a37, roughness: 1 }),
    leaves: [
      new THREE.MeshStandardMaterial({ color: 0x476d3b, roughness: 1 }),
      new THREE.MeshStandardMaterial({ color: 0x577f41, roughness: 1 }),
      new THREE.MeshStandardMaterial({ color: 0x3a5631, roughness: 1 }),
      new THREE.MeshStandardMaterial({ color: 0x6b7d3a, roughness: 1 }),
    ],
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xa9c8d2,
      metalness: 0.2,
      roughness: 0.08,
      transparent: true,
      opacity: 0.34,
      transmission: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    mirror: new THREE.MeshStandardMaterial({ color: 0x9fb6bf, metalness: 1, roughness: 0.08 }),
    lamp: new THREE.MeshStandardMaterial({ color: 0xfff2c9, emissive: 0xffd88a, emissiveIntensity: 0.8, roughness: 0.4 }),
    lampOff: new THREE.MeshStandardMaterial({ color: 0xb9b6a8, roughness: 0.6 }),
    redLight: new THREE.MeshStandardMaterial({ color: 0xd33a2c, emissive: 0x8c1408, emissiveIntensity: 0.9 }),
    blueSign: new THREE.MeshStandardMaterial({ color: 0x1d4f8c, roughness: 0.62 }),
    greenSign: new THREE.MeshStandardMaterial({ color: 0x1f6b46, roughness: 0.62 }),
    tyres: new THREE.MeshStandardMaterial({ color: 0x22262a, roughness: 0.92 }),
    rim: new THREE.MeshStandardMaterial({ color: 0xc4c9cd, metalness: 0.88, roughness: 0.26 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xdfe4e7, metalness: 1, roughness: 0.14 }),
    headlight: new THREE.MeshStandardMaterial({ color: 0xfff6d8, emissive: 0xfff0c0, emissiveIntensity: 0.6 }),
    taillight: new THREE.MeshStandardMaterial({ color: 0xd22e22, emissive: 0x8a0f08, emissiveIntensity: 0.7 }),
  };
  return materialCache;
}

export function setNightIntensity(mats, nightAmount) {
  mats.building.emissiveIntensity = clamp(nightAmount, 0, 1) * 0.9;
  mats.lamp.emissiveIntensity = 0.25 + nightAmount * 2.0;
}

/** Ливрея полуприцепа: фон, логотип, полосы, грязь у низа. */
export function trailerTexture(company, color = '#e8e4d9') {
  const key = 'trailer-v2:' + company + color;
  return canvasTexture(key, 1024, 512, (c, w, h) => {
    c.fillStyle = color;
    c.fillRect(0, 0, w, h);
    // вертикальные складки тента
    for (let x = 0; x < w; x += 22) {
      c.fillStyle = `rgba(0,0,0,${0.03 + (x % 44 === 0 ? 0.03 : 0)})`;
      c.fillRect(x, 0, 8, h);
      c.fillStyle = 'rgba(255,255,255,0.05)';
      c.fillRect(x + 10, 0, 4, h);
    }
    // нижняя грязевая полоса
    const dirt = c.createLinearGradient(0, h - 90, 0, h);
    dirt.addColorStop(0, 'rgba(70,66,58,0)');
    dirt.addColorStop(1, 'rgba(70,66,58,0.45)');
    c.fillStyle = dirt;
    c.fillRect(0, h - 90, w, 90);
    // фирменная полоса
    c.fillStyle = '#2f4a3c';
    c.fillRect(0, h * 0.66, w, 12);
    c.fillStyle = '#c9a13a';
    c.fillRect(0, h * 0.66 + 12, w, 4);
    // логотип
    c.fillStyle = '#22302a';
    c.font = 'bold 92px system-ui, Arial';
    c.fillText(company.toUpperCase(), 48, h * 0.4, w - 96);
    c.fillStyle = '#5d6b5f';
    c.font = 'bold 28px system-ui, Arial';
    c.fillText('ЕВРОПЕЙСКИЕ ГРУЗОВЫЕ ЛИНИИ', 50, h * 0.52, w - 100);
    // рамка и заклёпки
    c.strokeStyle = 'rgba(50,58,52,0.45)';
    c.lineWidth = 5;
    c.strokeRect(10, 10, w - 20, h - 20);
    for (let y = 26; y < h - 20; y += 44) {
      c.fillStyle = 'rgba(120,124,116,0.7)';
      c.fillRect(14, y, 8, 4);
      c.fillRect(w - 22, y, 8, 4);
    }
  });
}
