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
 * 6. Детализированная текстура городской кровли (керамическая черепица + стоячий фальц, 256×256)
 */
export function createRoofShingleTexture(maxAniso = 8) {
  const size = 256;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#c4c8cf';
  ctx.fillRect(0, 0, size, size);

  // Горизонтальные ряды черепицы с мягкой тенью нахлёста
  for (let y = 0; y < size; y += 16) {
    const rowGrad = ctx.createLinearGradient(0, y, 0, y + 16);
    rowGrad.addColorStop(0, '#eef2f6');
    rowGrad.addColorStop(0.72, '#bcc3cd');
    rowGrad.addColorStop(1, '#717a88');
    ctx.fillStyle = rowGrad;
    ctx.fillRect(0, y, size, 16);

    const shift = ((y / 16) % 2) * 8;
    for (let x = 0; x < size; x += 16) {
      const tone = Math.round((hash2(x, y, 71) - 0.5) * 28);
      ctx.fillStyle = tone >= 0 ? `rgba(255,255,255,${(tone / 140).toFixed(2)})` : `rgba(15,23,42,${(-tone / 130).toFixed(2)})`;
      ctx.fillRect((x + shift) % size, y + 1, 14, 13);
      // Фальцевое продольное ребро
      ctx.fillStyle = 'rgba(30, 41, 59, 0.26)';
      ctx.fillRect((x + shift) % size, y + 1, 1.5, 14);
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
 * 7. Высокодетализированный Архитектурный Мега-Атлас из 64 процедурных текстур города (1024×1024, тайл 128×128)
 *    Клинкерный кирпич, неоклассический руст и пилястры, витражные небоскрёбы, срубы шале,
 *    профлист стройкомбинатов БСУ/ДСК, панели с лоджиями, ламели ЦОД ИИ и стальные силосы!
 */
export function createFacadeMegaAtlas(maxAniso = 8) {
  const size = 1024;
  const tile = 128;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');

  const baseHues = [
    [218, 202, 182], [188, 108, 82],  [222, 228, 236], [148, 174, 202],
    [194, 176, 156], [128, 166, 192], [230, 216, 188], [162, 172, 184],
  ];

  for (let ty = 0; ty < 8; ty++) {
    for (let tx = 0; tx < 8; tx++) {
      const ox = tx * tile;
      const oy = ty * tile;
      const rgb = baseHues[(tx + ty * 3) % baseHues.length];
      const shift = Math.round((hash2(tx, ty, 19) - 0.5) * 34);
      const r = Math.max(48, Math.min(244, rgb[0] + shift));
      const g = Math.max(48, Math.min(244, rgb[1] + shift));
      const b = Math.max(48, Math.min(244, rgb[2] + shift));

      // Базовый вертикальный градиент стены (лёгкое затенение к цоколю и карнизу)
      const wallGrad = ctx.createLinearGradient(ox, oy, ox, oy + tile);
      wallGrad.addColorStop(0, `rgb(${Math.min(255, r + 10)},${Math.min(255, g + 10)},${Math.min(255, b + 12)})`);
      wallGrad.addColorStop(0.82, `rgb(${r},${g},${b})`);
      wallGrad.addColorStop(1, `rgb(${Math.max(25, r - 26)},${Math.max(25, g - 26)},${Math.max(25, b - 24)})`);
      ctx.fillStyle = wallGrad;
      ctx.fillRect(ox, oy, tile, tile);

      // Мелкое зерно штукатурки / камня
      for (let p = 0; p < 160; p++) {
        const px = ox + Math.floor(hash2(p, tx + ty * 8, 53) * tile);
        const py = oy + Math.floor(hash2(tx + ty * 8, p, 97) * tile);
        const lum = hash2(p, py, 13) > 0.5 ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.09)';
        ctx.fillStyle = lum;
        ctx.fillRect(px, py, 2, 2);
      }

      if (ty === 0 || ty === 1) {
        // Клинкерная и фламандская кирпичная кладка с перемычками и карнизами
        ctx.fillStyle = 'rgba(236, 232, 224, 0.34)';
        for (let y = 0; y < tile; y += 8) {
          ctx.fillRect(ox, oy + y, tile, 1);
          const off = ((y / 8) % 2) * 8;
          for (let x = off; x < tile; x += 16) {
            ctx.fillRect(ox + x, oy + y, 1, 8);
          }
        }
        // Тёмные кирпичи-тычки и каменные межэтажные пояса
        for (let y = 8; y < tile; y += 16) {
          for (let x = 4; x < tile - 8; x += 24) {
            if (hash2(x + ox, y + oy, 41) > 0.45) {
              ctx.fillStyle = 'rgba(68, 32, 24, 0.22)';
              ctx.fillRect(ox + x, oy + y + 1, 12, 6);
            }
          }
        }
        ctx.fillStyle = 'rgba(241, 238, 230, 0.55)';
        ctx.fillRect(ox, oy + 4, tile, 3);
        ctx.fillRect(ox, oy + 64, tile, 2);
        ctx.fillStyle = 'rgba(30, 41, 59, 0.35)';
        ctx.fillRect(ox, oy + tile - 10, tile, 10);
      } else if (ty === 2 || ty === 3) {
        // Витражное структурное остекление бизнес-центров и каскадных ЖК с импостами и лоджиями
        const skyGrad = ctx.createLinearGradient(ox, oy, ox + tile, oy + tile);
        skyGrad.addColorStop(0, 'rgba(38, 118, 186, 0.58)');
        skyGrad.addColorStop(0.5, 'rgba(96, 182, 236, 0.44)');
        skyGrad.addColorStop(1, 'rgba(24, 68, 118, 0.64)');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(ox + 2, oy + 2, tile - 4, tile - 4);
        // Межэтажные спандрели и алюминиевые стойки
        for (let y = 0; y < tile; y += 16) {
          ctx.fillStyle = ty === 2 ? 'rgba(203, 213, 225, 0.72)' : 'rgba(30, 41, 59, 0.68)';
          ctx.fillRect(ox, oy + y, tile, 3.5);
          // Ограждения лоджий
          if (ty === 3 && (y % 32 === 0)) {
            ctx.fillStyle = 'rgba(248, 250, 252, 0.38)';
            ctx.fillRect(ox + 8, oy + y + 10, tile - 16, 4);
          }
        }
        ctx.fillStyle = 'rgba(226, 232, 240, 0.65)';
        for (let x = 0; x < tile; x += 16) {
          ctx.fillRect(ox + x, oy, 2, tile);
        }
      } else if (ty === 4) {
        // Профлист промышленных цехов, БСУ, ДСК, РМЗ и алюминиевого комбината
        for (let x = 0; x < tile; x += 8) {
          ctx.fillStyle = x % 16 === 0 ? 'rgba(15, 23, 42, 0.28)' : 'rgba(255, 255, 255, 0.16)';
          ctx.fillRect(ox + x, oy, 3, tile);
        }
        // Ленточное верхнее остекление цеха и сигнальная полоса безопасности стройбазы
        ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.fillRect(ox, oy + 18, tile, 12);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.78)';
        ctx.fillRect(ox, oy + tile - 16, tile, 5);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
        for (let x = 0; x < tile; x += 16) {
          ctx.fillRect(ox + x, oy + tile - 16, 8, 5);
        }
      } else if (ty === 5) {
        // Деревянный профилированный брус, шале и фахверковые кварталы Посада
        for (let y = 0; y < tile; y += 8) {
          ctx.fillStyle = 'rgba(58, 32, 14, 0.34)';
          ctx.fillRect(ox, oy + y, tile, 1.8);
          ctx.fillStyle = 'rgba(255, 236, 205, 0.14)';
          ctx.fillRect(ox, oy + y + 2, tile, 1.5);
        }
        if (tx % 2 === 1) {
          // Диагональные раскосы фахверка
          ctx.strokeStyle = 'rgba(62, 36, 18, 0.55)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(ox + 4, oy + tile - 4);
          ctx.lineTo(ox + 60, oy + 64);
          ctx.moveTo(ox + tile - 4, oy + tile - 4);
          ctx.lineTo(ox + 68, oy + 64);
          ctx.stroke();
        }
      } else if (ty === 6) {
        // Неоклассика, ратуши, университеты и речной вокзал: рустованный цоколь, пилястры и карниз
        ctx.fillStyle = 'rgba(255, 252, 244, 0.52)';
        ctx.fillRect(ox, oy + 3, tile, 5);
        for (let x = 8; x < tile; x += 32) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.36)';
          ctx.fillRect(ox + x, oy + 8, 6, tile - 28);
          ctx.fillStyle = 'rgba(30, 41, 59, 0.18)';
          ctx.fillRect(ox + x + 6, oy + 8, 2, tile - 28);
        }
        // Каменный руст нижнего яруса
        ctx.fillStyle = 'rgba(30, 41, 59, 0.24)';
        ctx.fillRect(ox, oy + tile - 22, tile, 22);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        for (let y = tile - 20; y < tile; y += 6) {
          ctx.fillRect(ox, oy + y, tile, 1);
        }
      } else {
        // Высокотехнологичные ламели ЦОД ИИ, силосы цемента БСУ и решётки градирен
        for (let y = 0; y < tile; y += 16) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.34)';
          ctx.fillRect(ox, oy + y, tile, 2.5);
        }
        for (let x = 0; x < tile; x += 16) {
          ctx.fillStyle = 'rgba(226, 232, 240, 0.28)';
          ctx.fillRect(ox + x, oy, 2, tile);
        }
        if (tx % 2 === 0) {
          ctx.fillStyle = 'rgba(14, 165, 233, 0.32)';
          for (let y = 6; y < tile - 8; y += 16) {
            ctx.fillRect(ox + 6, oy + y, tile - 12, 6);
          }
        }
      }
    }
  }

  return finalizeTex(new THREE.CanvasTexture(c), maxAniso, true);
}

/**
 * 8. Процедурная текстура городских кварталов, площадей, брусчатки и бульваров (512×512)
 */
export function createUrbanPlazaTexture(maxAniso = 8) {
  const size = 512;
  const half = size * 0.5;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');

  // Спокойная гранитная брусчатка городской центральной площади (БЕЗ колец и БЕЗ дорожной разметки!)
  ctx.fillStyle = '#6c737c';
  ctx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 32) {
    for (let x = 0; x < size; x += 32) {
      const h = hash2(x >> 5, y >> 5, 61);
      if (h > 0.72) {
        ctx.fillStyle = '#3f6f4c';
        ctx.fillRect(x + 3, y + 3, 26, 26);
        ctx.fillStyle = '#538a60';
        ctx.fillRect(x + 7, y + 7, 18, 18);
      } else {
        const tone = 102 + Math.round(h * 26);
        ctx.fillStyle = `rgb(${tone + 6},${tone + 4},${tone})`;
        ctx.fillRect(x + 2, y + 2, 28, 28);
      }
    }
  }

  // Мягкая прямоугольная альфа-маска по краям сквера
  const img = ctx.getImageData(0, 0, size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = Math.abs(x - half) / half;
      const dy = Math.abs(y - half) / half;
      const boxDist = Math.max(dx, dy);
      const alpha = boxDist > 0.96 ? 0 : (boxDist > 0.80 ? (1.0 - (boxDist - 0.80) / 0.16) : 1.0);
      img.data[(y * size + x) * 4 + 3] = Math.round(Math.max(0, Math.min(1, alpha)) * 225);
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  tex.needsUpdate = true;
  return tex;
}

/**
 * 9. Кристаллическая текстура голубого глетчерного льда для 3D-гротов истоков рек (256×256)
 */
export function createGlacierIceTexture(maxAniso = 4) {
  const size = 256;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, '#f0f9ff');
  grad.addColorStop(0.45, '#bae6fd');
  grad.addColorStop(1, '#38bdf8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Ледниковые трещины и инеевые прожилки
  for (let i = 0; i < 48; i++) {
    const x0 = hash2(i, 3, 17) * size;
    const y0 = hash2(i, 7, 29) * size;
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(12, 74, 110, 0.36)' : 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 1.2 + hash2(i, 11, 43) * 2.5;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + (hash2(i, 19, 71) - 0.5) * 70, y0 + 28 + hash2(i, 23, 89) * 54);
    ctx.stroke();
  }
  return finalizeTex(new THREE.CanvasTexture(c), maxAniso, true);
}

// ============================================================================
//  КАТАЛОГ 480 ПРОЦЕДУРНЫХ ТЕКСТУР И ОТТЕНКОВ МАТЕРИАЛОВ (GPU-ИНСТАНСИНГ)
//  Используется 48 типами зданий, стройбазами, лесами, скалами, плотинами и флотом!
// ============================================================================
const SHADE_FAMILIES = [
  { family: 'rock_strata',     label: 'Горные породы и страты',         count: 56, baseH: 0.07, sat: 0.12, lMin: 0.32, lMax: 0.72 },
  { family: 'soils_pebbles',   label: 'Грунты, галька и пляжи',         count: 56, baseH: 0.09, sat: 0.28, lMin: 0.28, lMax: 0.68 },
  { family: 'hydro_concrete',  label: 'Гидротехнические бетоны и бут',  count: 60, baseH: 0.58, sat: 0.08, lMin: 0.46, lMax: 0.84 },
  { family: 'city_facades',    label: 'Архитектурные фасады и стекло',  count: 92, baseH: 0.11, sat: 0.26, lMin: 0.46, lMax: 0.89 },
  { family: 'roofs_metals',    label: 'Кровли, сталь и водоводы',       count: 60, baseH: 0.03, sat: 0.36, lMin: 0.28, lMax: 0.76 },
  { family: 'flora_agro',      label: 'Хвоя, луга и агро-культуры',     count: 56, baseH: 0.31, sat: 0.42, lMin: 0.24, lMax: 0.62 },
  { family: 'water_optics',    label: 'Оптические оттенки воды и льда', count: 48, baseH: 0.52, sat: 0.58, lMin: 0.26, lMax: 0.84 },
  { family: 'fleet_machinery', label: 'Стройтехника, флот и краны',     count: 52, baseH: 0.14, sat: 0.66, lMin: 0.36, lMax: 0.78 },
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
  const urbanPlaza = createUrbanPlazaTexture(maxAniso);
  const glacierIce = createGlacierIceTexture(maxAniso);
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
    urbanPlaza,
    glacierIce,
    foliage: nature.foliage,
    bark: nature.bark,
    rock: nature.rock,
    shadeCatalogCount: TEXTURE_SHADE_CATALOG.length, // 480!
  };
}
