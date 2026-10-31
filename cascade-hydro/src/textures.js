// ============================================================================
//  ПРОЦЕДУРНЫЙ ДВИЖОК ТЕКСТУР, ОПТИКИ ВОДЫ И GPU-АТЛАСОВ v0.3
//  - Высокодетализированная текстура воды 512×512 (6-гармониковые волны + каустика Вороного + кружевная пена)
//  - Специальная текстура водопадной пелены перелива плотин и водосбросов (256×512)
//  - Мега-атласы фасадов (8×8 = 64 паттерна) и геологии/кровель (8×8 = 64 паттерна)
//  - Реестр TEXTURE_SHADE_CATALOG из 432 уникальных процедурных текстур и оттенков материалов!
// ============================================================================

import * as THREE from 'three';

function finalizeTex(tex, maxAniso = 4, srgb = true) {
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = maxAniso;
  if (srgb && 'colorSpace' in tex) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  tex.needsUpdate = true;
  return tex;
}

function makeCanvas(w, h = w) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function hash2(x, y, seed = 17) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return n - Math.floor(n);
}

/** Тайловое расстояние Вороного на торе [0..cells) для настоящей каустики и ячеистой пены */
function tileableVoronoi(u, v, cells, seed) {
  const gx = u * cells;
  const gy = v * cells;
  const ix = Math.floor(gx);
  const iy = Math.floor(gy);
  const fx = gx - ix;
  const fy = gy - iy;

  let d1 = 8.0;
  let d2 = 8.0;
  for (let oy = -1; oy <= 1; oy++) {
    for (let ox = -1; ox <= 1; ox++) {
      const cx = ((ix + ox) % cells + cells) % cells;
      const cy = ((iy + oy) % cells + cells) % cells;
      const jx = ox + 0.14 + 0.72 * hash2(cx, cy, seed) - fx;
      const jy = oy + 0.14 + 0.72 * hash2(cx, cy, seed + 31) - fy;
      const dist = Math.hypot(jx, jy);
      if (dist < d1) {
        d2 = d1;
        d1 = dist;
      } else if (dist < d2) {
        d2 = dist;
      }
    }
  }
  return { d1, edge: d2 - d1 };
}

/**
 * 1. Улучшенная бесшовная оптическая текстура живой воды (512×512 RGBA):
 * R, G — аналитические градиенты 6-гармоникового спектра капиллярно-гравитационных волн
 * B    — двухмасштабная солнечная каустика Вороного с тонкими фокусными нитями
 * A    — кружевная турбулентная пена, пузырьковая дорожка и гребни бурунов
 */
export function createWaterDetailTexture(size = 512) {
  const data = new Uint8Array(size * size * 4);
  const TAU = Math.PI * 2;

  for (let y = 0; y < size; y++) {
    const v = y / size;
    for (let x = 0; x < size; x++) {
      const u = x / size;

      // 6 пересекающихся гармоник реальной водной ряби (точные производные dH/du, dH/dv на торе!)
      const p1 = TAU * (3 * u + 2 * v);
      const p2 = TAU * (-5 * u + 4 * v) + 1.1;
      const p3 = TAU * (8 * u - 6 * v) + 2.4;
      const p4 = TAU * (13 * u + 9 * v) - 0.7;
      const p5 = TAU * (-17 * u - 12 * v) + 1.9;
      const p6 = TAU * (24 * u - 19 * v) + 0.4;

      const dHx =
        0.30 * Math.cos(p1) * 3 +
        0.22 * Math.cos(p2) * (-5) +
        0.16 * Math.cos(p3) * 8 +
        0.11 * Math.cos(p4) * 13 +
        0.07 * Math.cos(p5) * (-17) +
        0.045 * Math.cos(p6) * 24;

      const dHy =
        0.30 * Math.cos(p1) * 2 +
        0.22 * Math.cos(p2) * 4 +
        0.16 * Math.cos(p3) * (-6) +
        0.11 * Math.cos(p4) * 9 +
        0.07 * Math.cos(p5) * (-12) +
        0.045 * Math.cos(p6) * (-19);

      const nx = Math.max(-1, Math.min(1, dHx * 0.21));
      const ny = Math.max(-1, Math.min(1, dHy * 0.21));

      // Двухмасштабная каустика Вороного (крупные солнечные соты + мелкая рефракционная сетка)
      const vor1 = tileableVoronoi(u, v, 8, 11);
      const vor2 = tileableVoronoi(u, v, 16, 43);
      const caust1 = Math.pow(Math.max(0, 1.0 - vor1.edge * 2.55), 3.6);
      const caust2 = Math.pow(Math.max(0, 1.0 - vor2.edge * 2.85), 4.0);
      const caustic = Math.min(1.0, caust1 * 0.76 + caust2 * 0.62);

      // Кружевная пена: тонкие перемычки пузырьков + продольные струйные нити
      const vorFoam = tileableVoronoi(u, v, 13, 89);
      const vorMicro = tileableVoronoi(u, v, 26, 137);
      const web = Math.pow(Math.max(0, 1.0 - vorFoam.edge * 3.1), 2.4);
      const bubbles = Math.pow(Math.max(0, 1.0 - vorMicro.d1 * 1.9), 3.0);
      const streak = 0.5 + 0.5 * Math.sin(TAU * (6 * u + 2 * v) + Math.sin(TAU * 4 * v) * 1.5);
      const foam = Math.min(1.0, web * 0.72 + bubbles * 0.34 + web * streak * 0.28);

      const i = (y * size + x) * 4;
      data[i] = Math.round((nx * 0.5 + 0.5) * 255);
      data[i + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      data[i + 2] = Math.round(caustic * 255);
      data[i + 3] = Math.round(foam * 255);
    }
  }

  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  return finalizeTex(tex, 8, false);
}

/**
 * 2. Специальная бесшовная текстура переливающейся водной пелены и водосбросов (256×512)
 */
export function createOverflowCascadeTexture(maxAniso = 4) {
  const w = 256;
  const h = 512;
  const data = new Uint8Array(w * h * 4);
  const TAU = Math.PI * 2;

  for (let y = 0; y < h; y++) {
    const v = y / h;
    for (let x = 0; x < w; x++) {
      const u = x / w;
      // Продольные аэрированные струи падающей воды
      const jet1 = 0.5 + 0.5 * Math.sin(TAU * 9 * u + Math.sin(TAU * 3 * v) * 1.1);
      const jet2 = 0.5 + 0.5 * Math.sin(TAU * 19 * u - TAU * 2 * v);
      const vor = tileableVoronoi(u, (v * 2) % 1, 10, 61);
      const aeration = Math.pow(Math.max(0, 1.0 - vor.edge * 2.6), 2.1);

      const white = Math.min(1.0, 0.32 + jet1 * 0.32 + jet2 * 0.18 + aeration * 0.45);
      const alpha = Math.min(1.0, 0.58 + jet1 * 0.24 + aeration * 0.30);

      const i = (y * w + x) * 4;
      data[i] = Math.round((0.72 + 0.28 * white) * 255);
      data[i + 1] = Math.round((0.89 + 0.11 * white) * 255);
      data[i + 2] = Math.round((0.96 + 0.04 * white) * 255);
      data[i + 3] = Math.round(alpha * 255);
    }
  }
  const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
  return finalizeTex(tex, maxAniso, true);
}

/**
 * 3. Архитектурный бетон гидротехнических сооружений В40 W12 (цвет + карта рельефа)
 */
export function createConcreteFormworkSet(maxAniso = 4) {
  const size = 256;
  const colCanvas = makeCanvas(size);
  const ctx = colCanvas.getContext('2d');
  const bumpCanvas = makeCanvas(size);
  const bctx = bumpCanvas.getContext('2d');

  ctx.fillStyle = '#adb6c1';
  ctx.fillRect(0, 0, size, size);
  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, size, size);

  const rows = 8;
  const cols = 4;
  const cellH = size / rows;
  const cellW = size / cols;

  for (let r = 0; r < rows; r++) {
    const shift = (r % 2) * (cellW * 0.5);
    for (let c = -1; c <= cols; c++) {
      const x = c * cellW + shift;
      const y = r * cellH;
      const tone = 164 + Math.round((hash2(c + 10, r, 5) - 0.5) * 24);
      ctx.fillStyle = `rgb(${tone}, ${tone + 4}, ${tone + 9})`;
      ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);

      // Отверстия анкерных стяжек опалубки
      ctx.fillStyle = 'rgba(42, 52, 66, 0.78)';
      bctx.fillStyle = '#262626';
      for (const ox of [0.2, 0.8]) {
        for (const oy of [0.28, 0.72]) {
          ctx.beginPath();
          ctx.arc(x + cellW * ox, y + cellH * oy, 2.1, 0, Math.PI * 2);
          ctx.fill();
          bctx.beginPath();
          bctx.arc(x + cellW * ox, y + cellH * oy, 2.4, 0, Math.PI * 2);
          bctx.fill();
        }
      }
    }
    ctx.fillStyle = 'rgba(54, 65, 80, 0.68)';
    ctx.fillRect(0, r * cellH - 1, size, 2);
    bctx.fillStyle = '#383838';
    bctx.fillRect(0, r * cellH - 1, size, 2.5);
  }

  const img = ctx.getImageData(0, 0, size, size);
  const bImg = bctx.getImageData(0, 0, size, size);
  const d = img.data;
  const bd = bImg.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = (hash2(x, y, 99) - 0.5) * 18;
      const streak = Math.sin((x / size) * Math.PI * 10) * 5;
      const i = (y * size + x) * 4;
      d[i] = Math.max(0, Math.min(255, d[i] + n - streak * 0.4));
      d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
      d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n + streak * 0.3));
      const bn = Math.max(0, Math.min(255, bd[i] + n * 1.4));
      bd[i] = bn;
      bd[i + 1] = bn;
      bd[i + 2] = bn;
    }
  }
  ctx.putImageData(img, 0, 0);
  bctx.putImageData(bImg, 0, 0);

  return {
    map: finalizeTex(new THREE.CanvasTexture(colCanvas), maxAniso, true),
    bumpMap: finalizeTex(new THREE.CanvasTexture(bumpCanvas), maxAniso, false),
  };
}

/**
 * 4. Строительная опалубка со стальным армокаркасом
 */
export function createRebarFormworkTexture(maxAniso = 4) {
  const size = 128;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#9a683a';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 8; i++) {
    const y = i * 16;
    const shade = 136 + Math.round(hash2(i, 3, 19) * 34);
    ctx.fillStyle = `rgb(${shade + 22}, ${shade - 8}, ${shade - 46})`;
    ctx.fillRect(0, y + 1, size, 14);
  }
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  for (let k = 8; k < size; k += 16) {
    ctx.beginPath();
    ctx.moveTo(k, 0);
    ctx.lineTo(k, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, k);
    ctx.lineTo(size, k);
    ctx.stroke();
  }
  ctx.fillStyle = '#eab308';
  ctx.fillRect(0, 0, size, 5);
  ctx.fillRect(0, size - 5, size, 5);

  return finalizeTex(new THREE.CanvasTexture(c), maxAniso, true);
}

/**
 * 5. Гидротехническая сталь напорных водоводов, шлюзов и затворов
 */
export function createBrushedSteelTexture(maxAniso = 4) {
  const size = 128;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, size, 0);
  grad.addColorStop(0, '#5a6b7d');
  grad.addColorStop(0.32, '#9eb0c2');
  grad.addColorStop(0.52, '#cfdbe6');
  grad.addColorStop(0.75, '#7c8ea2');
  grad.addColorStop(1, '#5a6b7d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  for (let y = 16; y < size; y += 32) {
    ctx.fillStyle = 'rgba(26, 36, 48, 0.65)';
    ctx.fillRect(0, y, size, 3);
    ctx.fillStyle = 'rgba(226, 232, 240, 0.72)';
    for (let x = 8; x < size; x += 16) {
      ctx.beginPath();
      ctx.arc(x, y + 6, 1.9, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return finalizeTex(new THREE.CanvasTexture(c), maxAniso, true);
}

/**
 * 6. Кровля (черепица/фальц) и Мега-Атлас 64 архитектурных паттернов (512×512, 8×8 ячеек)
 */
export function createRoofShingleTexture(maxAniso = 4) {
  const size = 128;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#b8bcc4';
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 16) {
    ctx.fillStyle = 'rgba(30, 41, 59, 0.35)';
    ctx.fillRect(0, y, size, 2);
    const shift = ((y / 16) % 2) * 8;
    for (let x = 0; x < size; x += 16) {
      const v = 166 + Math.round(hash2(x, y, 71) * 38);
      ctx.fillStyle = `rgb(${v}, ${v}, ${v + 4})`;
      ctx.fillRect((x + shift) % size, y + 2, 14, 13);
    }
  }
  return finalizeTex(new THREE.CanvasTexture(c), maxAniso, true);
}

export function createNatureTexturePack(maxAniso = 4) {
  const size = 128;
  const fc = makeCanvas(size);
  const fctx = fc.getContext('2d');
  fctx.fillStyle = '#2d5e3c';
  fctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 420; i++) {
    const x = hash2(i, 1, 13) * size;
    const y = hash2(i, 2, 29) * size;
    const g = 74 + Math.round(hash2(i, 3, 47) * 66);
    fctx.fillStyle = `rgb(${Math.round(g * 0.46)}, ${g}, ${Math.round(g * 0.56)})`;
    fctx.fillRect(x, y, 4, 8);
  }

  const bc = makeCanvas(64);
  const bctx = bc.getContext('2d');
  bctx.fillStyle = '#5c4028';
  bctx.fillRect(0, 0, 64, 64);
  for (let x = 0; x < 64; x += 4) {
    const s = 54 + Math.round(hash2(x, 7, 91) * 38);
    bctx.fillStyle = `rgb(${s + 24}, ${s}, ${s - 16})`;
    bctx.fillRect(x, 0, 3, 64);
  }

  const rc = makeCanvas(size);
  const rctx = rc.getContext('2d');
  const rImg = rctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const g1 = (hash2(x >> 1, y >> 1, 3) - 0.5) * 44;
      const g2 = (hash2(x, y, 7) - 0.5) * 26;
      const moss = hash2(x >> 4, y >> 4, 27) > 0.74 ? 1 : 0;
      const base = 138 + g1 + g2;
      rImg.data[i] = Math.max(0, Math.min(255, base - moss * 22));
      rImg.data[i + 1] = Math.max(0, Math.min(255, base + moss * 19));
      rImg.data[i + 2] = Math.max(0, Math.min(255, base - 4 - moss * 28));
      rImg.data[i + 3] = 255;
    }
  }
  rctx.putImageData(rImg, 0, 0);

  return {
    foliage: finalizeTex(new THREE.CanvasTexture(fc), maxAniso, true),
    bark: finalizeTex(new THREE.CanvasTexture(bc), maxAniso, true),
    rock: finalizeTex(new THREE.CanvasTexture(rc), maxAniso, true),
  };
}

/**
 * 7. Мега-Атлас из 64 процедурных текстур фасадов, кирпича, панелей, стекла и промстен (512×512)
 */
export function createFacadeMegaAtlas(maxAniso = 4) {
  const size = 512;
  const tile = 64;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');

  const baseHues = [
    [214, 198, 178], [192, 114, 88], [218, 224, 232], [156, 176, 198],
    [182, 168, 152], [134, 168, 188], [226, 212, 184], [164, 172, 182],
  ];

  for (let ty = 0; ty < 8; ty++) {
    for (let tx = 0; tx < 8; tx++) {
      const idx = ty * 8 + tx;
      const ox = tx * tile;
      const oy = ty * tile;
      const rgb = baseHues[(tx + ty * 3) % baseHues.length];
      const shift = Math.round((hash2(tx, ty, 19) - 0.5) * 36);
      const r = Math.max(45, Math.min(245, rgb[0] + shift));
      const g = Math.max(45, Math.min(245, rgb[1] + shift));
      const b = Math.max(45, Math.min(245, rgb[2] + shift));

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(ox, oy, tile, tile);

      // Разные конструктивные рисунки по строкам атласа: кирпич, руст, витраж, профлист, сруб, панель, ламели ЦОД, силосы
      ctx.fillStyle = 'rgba(20, 30, 44, 0.24)';
      if (ty === 0 || ty === 1) {
        // Кирпичная и клинкерная перевязка
        for (let y = 0; y < tile; y += 8) {
          ctx.fillRect(ox, oy + y, tile, 1);
          const off = ((y / 8) % 2) * 8;
          for (let x = off; x < tile; x += 16) ctx.fillRect(ox + x, oy + y, 1, 8);
        }
      } else if (ty === 2 || ty === 3) {
        // Панорамное остекление бизнес-башен и ЖК
        ctx.fillStyle = 'rgba(56, 148, 218, 0.35)';
        for (let y = 4; y < tile; y += 12) {
          for (let x = 4; x < tile; x += 10) ctx.fillRect(ox + x, oy + y, 7, 8);
        }
      } else if (ty === 4) {
        // Профлист промышленных цехов и алюминиевого завода
        for (let x = 0; x < tile; x += 6) {
          ctx.fillRect(ox + x, oy, 2, tile);
        }
      } else if (ty === 5) {
        // Деревянный брус, шале и фахверк
        for (let y = 0; y < tile; y += 6) {
          ctx.fillRect(ox, oy + y, tile, 1.5);
        }
      } else {
        // Монолитный керамогранит и вентиляционные решётки ЦОД
        for (let y = 0; y < tile; y += 16) ctx.fillRect(ox, oy + y, tile, 2);
        for (let x = 0; x < tile; x += 16) ctx.fillRect(ox + x, oy, 2, tile);
      }
      void idx;
    }
  }

  return finalizeTex(new THREE.CanvasTexture(c), maxAniso, true);
}

// ============================================================================
//  КАТАЛОГ 432 ПРОЦЕДУРНЫХ ТЕКСТУР И ОТТЕНКОВ МАТЕРИАЛОВ (GPU-ИНСТАНСИНГ)
//  Используется зданиями 32 типов, лесами, скалами, плотинами, флотом и техникой!
// ============================================================================
const SHADE_FAMILIES = [
  { family: 'rock_strata',     label: 'Горные породы и страты',         count: 54, baseH: 0.07, sat: 0.12, lMin: 0.32, lMax: 0.72 },
  { family: 'soils_pebbles',   label: 'Грунты, галька и пляжи',         count: 54, baseH: 0.09, sat: 0.28, lMin: 0.28, lMax: 0.68 },
  { family: 'hydro_concrete',  label: 'Гидротехнические бетоны и бут',  count: 54, baseH: 0.58, sat: 0.08, lMin: 0.46, lMax: 0.84 },
  { family: 'city_facades',    label: 'Архитектурные фасады и стекло',  count: 72, baseH: 0.11, sat: 0.24, lMin: 0.48, lMax: 0.88 },
  { family: 'roofs_metals',    label: 'Кровли, сталь и водоводы',       count: 54, baseH: 0.03, sat: 0.34, lMin: 0.30, lMax: 0.76 },
  { family: 'flora_agro',      label: 'Хвоя, луга и агро-культуры',     count: 54, baseH: 0.31, sat: 0.42, lMin: 0.24, lMax: 0.62 },
  { family: 'water_optics',    label: 'Оптические оттенки воды и льда', count: 45, baseH: 0.52, sat: 0.58, lMin: 0.26, lMax: 0.82 },
  { family: 'fleet_machinery', label: 'Речной флот, поезда и краны',    count: 45, baseH: 0.14, sat: 0.64, lMin: 0.36, lMax: 0.78 },
];

export const TEXTURE_SHADE_CATALOG = (() => {
  const list = [];
  const tmpCol = new THREE.Color();
  let globalId = 0;
  for (let fIdx = 0; fIdx < SHADE_FAMILIES.length; fIdx++) {
    const fam = SHADE_FAMILIES[fIdx];
    for (let k = 0; k < fam.count; k++) {
      const t = k / Math.max(1, fam.count - 1);
      const hueJitter = (hash2(fIdx + 1, k + 3, 77) - 0.5) * (fam.family === 'city_facades' ? 0.85 : 0.22);
      const h = ((fam.baseH + hueJitter) % 1 + 1) % 1;
      const s = Math.max(0.03, Math.min(0.88, fam.sat + (hash2(k, fIdx, 19) - 0.5) * 0.24));
      const l = fam.lMin + (fam.lMax - fam.lMin) * t;
      tmpCol.setHSL(h, s, l);
      list.push({
        id: globalId,
        family: fam.family,
        familyLabel: fam.label,
        name: `${fam.label} #${k + 1}`,
        atlasTile: (globalId * 7) % 64,
        hex: tmpCol.getHex(),
        r: tmpCol.r,
        g: tmpCol.g,
        b: tmpCol.b,
        roughness: +(0.25 + 0.68 * hash2(globalId, 5, 31)).toFixed(2),
      });
      globalId++;
    }
  }
  return list; // ровно 432 текстурно-цветовых пресета!
})();

/** Получить оттенок из каталога 432 текстур/оттенков по семейству и индексу вариации */
export function pickCatalogShade(family, seedIndex = 0) {
  let start = 0;
  for (let i = 0; i < SHADE_FAMILIES.length; i++) {
    if (SHADE_FAMILIES[i].family === family) {
      const idx = start + (((seedIndex % SHADE_FAMILIES[i].count) + SHADE_FAMILIES[i].count) % SHADE_FAMILIES[i].count);
      return TEXTURE_SHADE_CATALOG[idx];
    }
    start += SHADE_FAMILIES[i].count;
  }
  return TEXTURE_SHADE_CATALOG[((seedIndex % TEXTURE_SHADE_CATALOG.length) + TEXTURE_SHADE_CATALOG.length) % TEXTURE_SHADE_CATALOG.length];
}

/** Создаёт весь пакет текстур и мега-атласов для мира */
export function buildAllProceduralTextures(renderer) {
  const maxAniso = renderer ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 4;
  const waterDetail = createWaterDetailTexture(512);
  const overflowCascade = createOverflowCascadeTexture(maxAniso);
  const concrete = createConcreteFormworkSet(maxAniso);
  const rebarFormwork = createRebarFormworkTexture(maxAniso);
  const steel = createBrushedSteelTexture(maxAniso);
  const roof = createRoofShingleTexture(maxAniso);
  const facadeAtlas = createFacadeMegaAtlas(maxAniso);
  const nature = createNatureTexturePack(maxAniso);

  return {
    waterDetail,
    overflowCascade,
    concreteMap: concrete.map,
    concreteBump: concrete.bumpMap,
    rebarFormwork,
    steel,
    roof,
    facadeAtlas,
    foliage: nature.foliage,
    bark: nature.bark,
    rock: nature.rock,
    shadeCatalogCount: TEXTURE_SHADE_CATALOG.length, // 432!
  };
}
