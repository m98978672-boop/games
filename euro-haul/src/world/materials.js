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
      c.fillStyle = '#6f8b4d';
      c.fillRect(0, 0, w, h);
      speckle(c, w, h, 50000, ['#7a9954', '#628044', '#86a55c', '#587844', '#93b06a'], 3, 21);
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
  /** Карта нормалей из процедурного рельефа: даёт асфальту и бетону микрорельеф. */
  asphaltNormal() {
    return canvasTexture(
      'asphalt-normal',
      512,
      512,
      (c, w, h) => {
        const r = rng(77);
        const height = new Float32Array(w * h);
        for (let i = 0; i < height.length; i++) height[i] = 0.5;
        for (let k = 0; k < 900; k++) {
          const x = Math.floor(r() * w);
          const y = Math.floor(r() * h);
          const rad = 1 + Math.floor(r() * 4);
          const amp = 0.12 + r() * 0.2;
          for (let dy = -rad; dy <= rad; dy++) {
            for (let dx = -rad; dx <= rad; dx++) {
              if (dx * dx + dy * dy > rad * rad) continue;
              const px = (x + dx + w) % w;
              const py = (y + dy + h) % h;
              height[py * w + px] += amp * (1 - Math.sqrt(dx * dx + dy * dy) / rad);
            }
          }
        }
        const img = c.createImageData(w, h);
        const at = (x, y) => height[((y + h) % h) * w + ((x + w) % w)];
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const dx = at(x + 1, y) - at(x - 1, y);
            const dy = at(x, y + 1) - at(x, y - 1);
            // нормаль в тангент-пространстве (z вверх)
            const nx = -dx * 2.2;
            const ny = -dy * 2.2;
            const nz = 1;
            const len = Math.hypot(nx, ny, nz);
            const i = (y * w + x) * 4;
            img.data[i] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
            img.data[i + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
            img.data[i + 2] = Math.round(((nz / len) * 0.5 + 0.5) * 255);
            img.data[i + 3] = 255;
          }
        }
        c.putImageData(img, 0, 0);
      },
      { srgb: false }
    );
  },
  /** Шероховатость: сухие пятна, заплатки и лужи (тёмное = гладко/мокро). */
  asphaltRoughness() {
    return canvasTexture('asphalt-rough', 512, 512, (c, w, h) => {
      c.fillStyle = '#b9b9b9';
      c.fillRect(0, 0, w, h);
      const r = rng(303);
      for (let i = 0; i < 26; i++) {
        const x = r() * w;
        const y = r() * h;
        const rad = 20 + r() * 90;
        const g = c.createRadialGradient(x, y, 0, x, y, rad);
        g.addColorStop(0, 'rgba(70,70,70,0.55)');
        g.addColorStop(1, 'rgba(70,70,70,0)');
        c.fillStyle = g;
        c.beginPath();
        c.arc(x, y, rad, 0, Math.PI * 2);
        c.fill();
      }
      speckle(c, w, h, 6000, ['#a8a8a8', '#c8c8c8', '#9a9a9a'], 2, 9);
    }, { srgb: false });
  },
  gravel() {
    return canvasTexture('gravel-v2', 512, 512, (c, w, h) => {
      c.fillStyle = '#6d6a60';
      c.fillRect(0, 0, w, h);
      const r = rng(451);
      for (let i = 0; i < 12000; i++) {
        const x = r() * w;
        const y = r() * h;
        const rad = 1 + r() * 3.4;
        const l = 70 + r() * 90;
        c.fillStyle = `rgb(${l},${l - 4},${l - 12})`;
        c.beginPath();
        c.ellipse(x, y, rad, rad * (0.6 + r() * 0.7), r() * 3.14, 0, Math.PI * 2);
        c.fill();
      }
      noiseOverlay(c, w, h, 0.08, 17);
    });
  },
  bark() {
    return canvasTexture('bark', 128, 256, (c, w, h) => {
      c.fillStyle = '#4a3a2a';
      c.fillRect(0, 0, w, h);
      const r = rng(61);
      for (let i = 0; i < 260; i++) {
        c.strokeStyle = `rgba(${30 + r() * 40},${22 + r() * 30},${14 + r() * 20},0.7)`;
        c.lineWidth = 1 + r() * 2;
        c.beginPath();
        const x = r() * w;
        c.moveTo(x, 0);
        c.bezierCurveTo(x + 6, h * 0.3, x - 6, h * 0.7, x + 2, h);
        c.stroke();
      }
    });
  },
  /** Три варианта фасада: окна в разную ширину, разные цвета стен. */
  facade(variant = 0) {
    const palettes = [
      ['#bdb6a6', '#8f8a7c', '#2f3a40'],
      ['#c8b9a4', '#9a8d7c', '#3a3f3a'],
      ['#a9b2b6', '#868f93', '#2b3338'],
    ];
    const [wall, trim, glass] = palettes[variant % 3];
    return canvasTexture('facade-' + (variant % 3), 512, 512, (c, w, h) => {
      c.fillStyle = wall;
      c.fillRect(0, 0, w, h);
      speckle(c, w, h, 9000, [wall, trim, '#d0c8b8'], 2, 5 + variant);
      const r = rng(17 + variant * 13);
      const cols = 4;
      const rows = 5;
      const cw = w / cols;
      const ch = h / rows;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const wx = x * cw + cw * 0.2;
          const wy = y * ch + ch * 0.18;
          const ww = cw * 0.6;
          const wh = ch * 0.54;
          // ниша окна
          c.fillStyle = 'rgba(0,0,0,0.22)';
          c.fillRect(wx - 4, wy - 4, ww + 8, wh + 8);
          const g = c.createLinearGradient(wx, wy, wx + ww, wy + wh);
          g.addColorStop(0, '#5d747e');
          g.addColorStop(0.45, glass);
          g.addColorStop(1, '#22303a');
          c.fillStyle = g;
          c.fillRect(wx, wy, ww, wh);
          // отблеск стекла
          c.fillStyle = 'rgba(255,255,255,0.13)';
          c.beginPath();
          c.moveTo(wx, wy + wh * 0.62);
          c.lineTo(wx + ww * 0.62, wy);
          c.lineTo(wx + ww, wy);
          c.lineTo(wx, wy + wh);
          c.closePath();
          c.fill();
          // переплёт
          c.fillStyle = 'rgba(232,228,216,0.82)';
          c.fillRect(wx + ww / 2 - 2, wy, 4, wh);
          c.fillRect(wx, wy + wh * 0.48 - 2, ww, 4);
          // подоконник и отлив
          c.fillStyle = 'rgba(240,236,226,0.9)';
          c.fillRect(wx - 6, wy + wh + 4, ww + 12, 5);
          c.fillStyle = 'rgba(0,0,0,0.16)';
          c.fillRect(wx - 6, wy + wh + 9, ww + 12, 4);
          if (r() > 0.72) {
            // кондиционер под окном
            c.fillStyle = 'rgba(210,210,204,0.9)';
            c.fillRect(wx + ww * 0.22, wy + wh + 16, ww * 0.5, 10);
          }
        }
        // межэтажный пояс
        c.fillStyle = 'rgba(0,0,0,0.1)';
        c.fillRect(0, (y + 1) * ch - 4, w, 4);
        c.fillStyle = 'rgba(255,255,255,0.12)';
        c.fillRect(0, (y + 1) * ch, w, 3);
      }
      noiseOverlay(c, w, h, 0.06, 23 + variant);
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
    asphalt: new THREE.MeshStandardMaterial({
      color: 0xb4b9bd,
      map: asphaltTex,
      normalMap: textures.asphaltNormal(),
      normalScale: new THREE.Vector2(0.55, 0.55),
      roughnessMap: textures.asphaltRoughness(),
      roughness: 0.88,
      metalness: 0.02,
    }),
    gravel: new THREE.MeshStandardMaterial({ color: 0xcfcabb, map: textures.gravel(), roughness: 0.98 }),
    bark: new THREE.MeshStandardMaterial({ color: 0xa08a6d, map: textures.bark(), roughness: 0.95 }),
    grass: new THREE.MeshStandardMaterial({ color: 0xe6efd4, map: grassTex, roughness: 1 }),
    grassDark: new THREE.MeshStandardMaterial({ color: 0xc3d2a8, map: grassTex, roughness: 1 }),
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
    facades: [0, 1, 2].map((v) => {
      const tex = textures.facade(v);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: tex,
        emissive: 0xffcf8a,
        emissiveMap: tex,
        emissiveIntensity: 0,
        roughness: 0.82,
      });
      // Масштаб окон под размер дома: одно окно ~3.2 м, этаж ~3 м.
      mat.onBeforeCompile = (shader) => {
        shader.vertexShader = 'attribute vec3 aFacadeScale;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
          '#include <uv_vertex>',
          '#include <uv_vertex>\n#ifdef USE_MAP\n  vMapUv *= aFacadeScale.xy;\n#endif'
        );
      };
      mat.customProgramCacheKey = () => 'facade-uv';
      return mat;
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
  for (const f of mats.facades || []) f.emissiveIntensity = clamp(nightAmount, 0, 1) * 0.75;
  mats.lamp.emissiveIntensity = 0.25 + nightAmount * 2.0;
}

/** Ливрея полуприцепа: фон, логотип, полосы, грязь у низа. */

/** Кормовая дверь полуприцепа: рёбра, запоры, световозвращатели, номер. */
export function trailerRearTexture(company = 'Auriga', tone = '#4a6b7a') {
  const key = 'trailer-rear:' + company + tone;
  return canvasTexture(key, 512, 512, (c, w, h) => {
    c.fillStyle = tone;
    c.fillRect(0, 0, w, h);
    // вертикальные рёбра жёсткости
    for (let x = 0; x < w; x += 18) {
      c.fillStyle = 'rgba(0,0,0,0.16)';
      c.fillRect(x, 0, 6, h);
      c.fillStyle = 'rgba(255,255,255,0.09)';
      c.fillRect(x + 10, 0, 4, h);
    }
    // створки
    c.strokeStyle = 'rgba(0,0,0,0.55)';
    c.lineWidth = 6;
    c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, h); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.12)';
    c.lineWidth = 2;
    c.beginPath(); c.moveTo(w / 2 + 5, 0); c.lineTo(w / 2 + 5, h); c.stroke();
    // петли
    for (const y of [0.14, 0.42, 0.7]) {
      for (const x of [0.08, 0.9]) {
        c.fillStyle = '#2a3034';
        c.fillRect(x * w, y * h, 22, 54);
        c.fillStyle = 'rgba(255,255,255,0.18)';
        c.fillRect(x * w + 3, y * h + 4, 4, 46);
      }
    }
    // запорные штанги
    for (const x of [0.3, 0.68]) {
      c.fillStyle = 'rgba(210,214,216,0.75)';
      c.fillRect(x * w - 5, 40, 10, h - 120);
      c.fillStyle = 'rgba(60,66,70,0.9)';
      c.fillRect(x * w - 18, h * 0.52, 36, 16);
    }
    // грязь снизу
    const dirt = c.createLinearGradient(0, h - 110, 0, h);
    dirt.addColorStop(0, 'rgba(58,54,48,0)');
    dirt.addColorStop(1, 'rgba(58,54,48,0.6)');
    c.fillStyle = dirt;
    c.fillRect(0, h - 110, w, 110);
    // световозвращающая лента
    for (let x = 0; x < w; x += 64) {
      c.fillStyle = x % 128 === 0 ? '#f2f0e6' : '#c0392b';
      c.fillRect(x + 4, h - 46, 56, 18);
    }
    // номерной знак
    c.fillStyle = '#f4f4ee';
    c.fillRect(w / 2 - 62, h - 116, 124, 44);
    c.strokeStyle = '#20262a';
    c.lineWidth = 3;
    c.strokeRect(w / 2 - 62, h - 116, 124, 44);
    c.fillStyle = '#1d2327';
    c.font = 'bold 30px system-ui, Arial';
    c.textAlign = 'center';
    c.fillText('B·AR 4210', w / 2, h - 83);
    // логотип перевозчика
    c.fillStyle = 'rgba(238,240,236,0.9)';
    c.font = 'bold 44px system-ui, Arial';
    c.fillText(company.toUpperCase().slice(0, 14), w / 2, 90, w - 60);
    c.fillStyle = 'rgba(238,240,236,0.5)';
    c.font = 'bold 20px system-ui, Arial';
    c.fillText('ЕВРОПЕЙСКИЕ ГРУЗОВЫЕ ЛИНИИ', w / 2, 122, w - 60);
    // верхняя кромка
    c.fillStyle = 'rgba(0,0,0,0.3)';
    c.fillRect(0, 0, w, 12);
  });
}

/** Борт контейнера с гофрой и ливреей. */
export function containerTexture(company, color = '#cf5b3a') {
  const key = 'container-tile:' + company + color;
  return canvasTexture(key, 1024, 512, (c, w, h) => {
    c.fillStyle = color;
    c.fillRect(0, 0, w, h);
    // гофра
    for (let x = 0; x < w; x += 26) {
      const grd = c.createLinearGradient(x, 0, x + 26, 0);
      grd.addColorStop(0, 'rgba(0,0,0,0.22)');
      grd.addColorStop(0.35, 'rgba(255,255,255,0.06)');
      grd.addColorStop(0.55, 'rgba(255,255,255,0.14)');
      grd.addColorStop(1, 'rgba(0,0,0,0.2)');
      c.fillStyle = grd;
      c.fillRect(x, 0, 26, h);
    }
    // грязь и потёртости
    const r = rng(37);
    for (let i = 0; i < 260; i++) {
      c.fillStyle = `rgba(40,36,32,${0.02 + r() * 0.06})`;
      c.fillRect(r() * w, r() * h, 2 + r() * 30, 1 + r() * 8);
    }
    const dirt = c.createLinearGradient(0, h - 90, 0, h);
    dirt.addColorStop(0, 'rgba(56,52,44,0)');
    dirt.addColorStop(1, 'rgba(56,52,44,0.5)');
    c.fillStyle = dirt;
    c.fillRect(0, h - 90, w, 90);
    // логотип
    c.fillStyle = 'rgba(245,244,238,0.92)';
    c.font = 'bold 96px system-ui, Arial';
    c.fillText(company.toUpperCase(), 54, h * 0.44, w - 120);
    c.fillStyle = 'rgba(245,244,238,0.55)';
    c.font = 'bold 30px system-ui, Arial';
    c.fillText('МЕЖДУНАРОДНЫЕ ПЕРЕВОЗКИ', 58, h * 0.58, w - 120);
    // угловые фитинги
    for (const [x, y] of [[8, 8], [w - 46, 8], [8, h - 46], [w - 46, h - 46]]) {
      c.fillStyle = 'rgba(30,34,38,0.85)';
      c.fillRect(x, y, 38, 38);
    }
  });
}

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
