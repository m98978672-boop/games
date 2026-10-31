// ============================================================================
//  ПРОЦЕДУРНЫЕ ВЫСОКОДЕТАЛИЗИРОВАННЫЕ ТЕКСТУРЫ (0 внешних картинок, 100% бесшовные)
//  - Волновые нормали + оптическая каустика Вороного + кружевная пена (512×512)
//  - Архитектурный бетон с опалубочными швами и отверстиями стяжек + карта рельефа
//  - Строительная опалубка с деревянными щитами и стальным армокаркасом
//  - Клёпаная гидротехническая сталь напорных водоводов, кранов и затворов
//  - Черепица/фальц городских крыш, хвоя и кора сосен, зернистый гранит с лишайником
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

function makeCanvas(size) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  return c;
}

function hash2(x, y, seed = 17) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return n - Math.floor(n);
}

/** Тайловое расстояние Вороного на торе [0..cells) для настоящей каустики и пены */
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
      const jx = ox + 0.15 + 0.70 * hash2(cx, cy, seed) - fx;
      const jy = oy + 0.15 + 0.70 * hash2(cx, cy, seed + 31) - fy;
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

/** 1. Высокочёткая текстура оптики воды (512×512): RG = волновые нормали, B = каустика Вороного, A = кружевная пена */
export function createWaterDetailTexture(size = 384) {
  const data = new Uint8Array(size * size * 4);
  const tau = Math.PI * 2;

  for (let y = 0; y < size; y++) {
    const v = y / size;
    for (let x = 0; x < size; x++) {
      const u = x / size;

      // Многооктавный спектр гравитационно-капиллярных волн
      const w1 = Math.sin(u * tau * 3.0 + v * tau * 2.0) * 0.34;
      const w2 = Math.cos(u * tau * 5.0 - v * tau * 4.0 + 1.1) * 0.25;
      const w3 = Math.sin(u * tau * 9.0 + v * tau * 7.0 + 2.4) * 0.17;
      const w4 = Math.cos(u * tau * 15.0 - v * tau * 12.0 + 0.7) * 0.11;
      const w5 = Math.sin(u * tau * 23.0 + v * tau * 19.0 + 1.9) * 0.06;

      const dhdu = (
        Math.cos(u * tau * 3.0 + v * tau * 2.0) * 3.0 * 0.34
        - Math.sin(u * tau * 5.0 - v * tau * 4.0 + 1.1) * 5.0 * 0.25
        + Math.cos(u * tau * 9.0 + v * tau * 7.0 + 2.4) * 9.0 * 0.17
        - Math.sin(u * tau * 15.0 - v * tau * 12.0 + 0.7) * 15.0 * 0.11
        + Math.cos(u * tau * 23.0 + v * tau * 19.0 + 1.9) * 23.0 * 0.06
      ) / 6.8;

      const dhdv = (
        Math.cos(u * tau * 3.0 + v * tau * 2.0) * 2.0 * 0.34
        + Math.sin(u * tau * 5.0 - v * tau * 4.0 + 1.1) * 4.0 * 0.25
        + Math.cos(u * tau * 9.0 + v * tau * 7.0 + 2.4) * 7.0 * 0.17
        + Math.sin(u * tau * 15.0 - v * tau * 12.0 + 0.7) * 12.0 * 0.11
        + Math.cos(u * tau * 23.0 + v * tau * 19.0 + 1.9) * 19.0 * 0.06
      ) / 6.8;

      // Настоящая ячеистая световая сеть каустики (гребни ячеек Вороного!)
      const vorC = tileableVoronoi(u, v, 6, 13);
      const vorC2 = tileableVoronoi((u + 0.37) % 1, (v + 0.61) % 1, 10, 47);
      const caustA = Math.pow(Math.max(0, 1.0 - Math.min(1.0, vorC.edge * 2.85)), 2.6);
      const caustB = Math.pow(Math.max(0, 1.0 - Math.min(1.0, vorC2.edge * 3.1)), 3.0);
      const caustic = Math.min(1.0, caustA * 0.75 + caustB * 0.52);

      // Кружевная ячеистая пена бурунов и гидравлического прыжка
      const vorF = tileableVoronoi(u, v, 9, 89);
      const vorF2 = tileableVoronoi((u + 0.21) % 1, (v + 0.43) % 1, 17, 131);
      const web1 = Math.max(0, 1.0 - Math.min(1.0, vorF.edge * 2.4));
      const web2 = Math.max(0, 1.0 - Math.min(1.0, vorF2.edge * 2.7));
      const foamLace = Math.max(0, Math.min(1, 0.18 + web1 * 0.56 + web2 * 0.38 + (w1 + w2) * 0.12));

      const idx = (y * size + x) * 4;
      data[idx] = Math.max(0, Math.min(255, Math.round((dhdu * 0.5 + 0.5) * 255)));
      data[idx + 1] = Math.max(0, Math.min(255, Math.round((dhdv * 0.5 + 0.5) * 255)));
      data[idx + 2] = Math.max(0, Math.min(255, Math.round(caustic * 255)));
      data[idx + 3] = Math.max(0, Math.min(255, Math.round(foamLace * 255)));
    }
  }

  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  return finalizeTex(tex, 4, false);
}

/** 2. Архитектурный гидротехнический бетон с опалубочными картами, конусами стяжек и микрорельефом */
export function createConcreteFormworkSet(maxAniso = 4) {
  const size = 256;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');
  const bumpC = makeCanvas(size);
  const bCtx = bumpC.getContext('2d');

  // Базовый тон бетона с минеральным заполнителем
  ctx.fillStyle = '#adb4bc';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Зернистость щебня и песчаного раствора
  const img = ctx.getImageData(0, 0, size, size);
  const bImg = bCtx.getImageData(0, 0, size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const n1 = hash2(x, y, 3) - 0.5;
      const n2 = hash2(x >> 1, y >> 1, 9) - 0.5;
      const streak = Math.sin((y / size) * Math.PI * 8 + hash2(x >> 2, 1, 21) * 1.4) * 4.5;
      const delta = n1 * 18 + n2 * 14 + streak;
      img.data[i] = Math.max(0, Math.min(255, 174 + delta));
      img.data[i + 1] = Math.max(0, Math.min(255, 180 + delta));
      img.data[i + 2] = Math.max(0, Math.min(255, 186 + delta * 1.05));
      img.data[i + 3] = 255;

      const bVal = Math.max(0, Math.min(255, 128 + n1 * 38 + n2 * 26));
      bImg.data[i] = bVal;
      bImg.data[i + 1] = bVal;
      bImg.data[i + 2] = bVal;
      bImg.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  bCtx.putImageData(bImg, 0, 0);

  // Опалубочные карты 4×4 со швами и технологическими отверстиями стяжек
  const stepX = size / 4;
  const stepY = size / 4;
  for (let py = 0; py < 4; py++) {
    for (let px = 0; px < 4; px++) {
      const x0 = px * stepX;
      const y0 = py * stepY;
      const shade = (hash2(px, py, 55) - 0.5) * 0.07;
      ctx.fillStyle = shade > 0 ? `rgba(255,255,255,${shade})` : `rgba(15,23,42,${-shade})`;
      ctx.fillRect(x0 + 2, y0 + 2, stepX - 4, stepY - 4);

      // Швы опалубки
      ctx.strokeStyle = 'rgba(42, 52, 65, 0.58)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x0 + 1, y0 + 1, stepX - 2, stepY - 2);
      bCtx.strokeStyle = '#363636';
      bCtx.lineWidth = 2.5;
      bCtx.strokeRect(x0 + 1, y0 + 1, stepX - 2, stepY - 2);

      // 4 отверстия от анкерных стяжек щитовой опалубки
      const holes = [
        [x0 + 12, y0 + 12],
        [x0 + stepX - 12, y0 + 12],
        [x0 + 12, y0 + stepY - 12],
        [x0 + stepX - 12, y0 + stepY - 12],
      ];
      for (const [hx, hy] of holes) {
        ctx.fillStyle = 'rgba(38, 46, 56, 0.72)';
        ctx.beginPath();
        ctx.arc(hx, hy, 2.3, 0, Math.PI * 2);
        ctx.fill();

        bCtx.fillStyle = '#222222';
        bCtx.beginPath();
        bCtx.arc(hx, hy, 2.6, 0, Math.PI * 2);
        bCtx.fill();
      }
    }
  }

  return {
    map: finalizeTex(new THREE.CanvasTexture(c), maxAniso, true),
    bumpMap: finalizeTex(new THREE.CanvasTexture(bumpC), maxAniso, false),
  };
}

/** 3. Строительная деревянная опалубка + стальной арматурный каркас (для активных этапов стройки!) */
export function createRebarFormworkTexture(maxAniso = 4) {
  const size = 256;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');

  // Дощатые щиты опалубки (сосновый брус)
  ctx.fillStyle = '#9a6b3b';
  ctx.fillRect(0, 0, size, size);
  for (let b = 0; b < 8; b++) {
    const y0 = b * 32;
    const tone = 135 + Math.round((hash2(b, 2, 71) - 0.5) * 32);
    ctx.fillStyle = `rgb(${tone + 26}, ${tone - 8}, ${Math.max(40, tone - 62)})`;
    ctx.fillRect(0, y0, size, 30);
    ctx.fillStyle = 'rgba(38, 22, 10, 0.65)';
    ctx.fillRect(0, y0 + 30, size, 2);
  }

  // Решётка периодической стальной арматуры поверх щитов
  ctx.strokeStyle = '#3f4752';
  ctx.lineWidth = 5;
  for (let k = 16; k < size; k += 32) {
    ctx.beginPath();
    ctx.moveTo(k, 0);
    ctx.lineTo(k, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, k);
    ctx.lineTo(size, k);
    ctx.stroke();
  }

  // Ржаво-стальные вязальные узлы арматуры и диагональные раскосы лесов
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size, size);
  ctx.moveTo(size, 0);
  ctx.lineTo(0, size);
  ctx.stroke();

  for (let y = 16; y < size; y += 32) {
    for (let x = 16; x < size; x += 32) {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x - 3, y - 3, 6, 6);
    }
  }

  return finalizeTex(new THREE.CanvasTexture(c), maxAniso, true);
}

/** 4. Индустриальная клёпаная сталь для напорных водоводов, затворов, роторов и кранов */
export function createBrushedSteelTexture(maxAniso = 4) {
  const size = 256;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, size, 0);
  grad.addColorStop(0, '#788594');
  grad.addColorStop(0.35, '#aeb9c6');
  grad.addColorStop(0.55, '#8693a2');
  grad.addColorStop(0.85, '#b8c3cf');
  grad.addColorStop(1, '#788594');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Шлифованные микрориски и кольцевые сварные швы водовода
  for (let y = 0; y < size; y += 2) {
    const a = (hash2(1, y, 101) - 0.5) * 0.10;
    ctx.fillStyle = a > 0 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${-a})`;
    ctx.fillRect(0, y, size, 1);
  }

  for (let ring = 0; ring < size; ring += 64) {
    ctx.fillStyle = 'rgba(30, 41, 59, 0.65)';
    ctx.fillRect(0, ring, size, 3);
    ctx.fillStyle = 'rgba(226, 232, 240, 0.45)';
    ctx.fillRect(0, ring + 3, size, 2);
    for (let rx = 8; rx < size; rx += 16) {
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(rx, ring + 9, 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return finalizeTex(new THREE.CanvasTexture(c), maxAniso, true);
}

/** 5. Фактурная черепичная / фальцевая кровля для растущих городов */
export function createRoofShingleTexture(maxAniso = 4) {
  const size = 256;
  const c = makeCanvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#c8cfd6';
  ctx.fillRect(0, 0, size, size);

  const rows = 12;
  const cols = 10;
  const rh = size / rows;
  const cw = size / cols;

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (cw * 0.5);
    for (let col = -1; col <= cols; col++) {
      const x = col * cw + offset;
      const y = r * rh;
      const v = 195 + Math.round((hash2(col + 10, r, 37) - 0.5) * 34);
      ctx.fillStyle = `rgb(${v}, ${v - 4}, ${v - 8})`;
      ctx.fillRect(x + 1, y + 1, cw - 2, rh - 3);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.36)';
      ctx.fillRect(x, y + rh - 3, cw, 3);
    }
  }
  return finalizeTex(new THREE.CanvasTexture(c), maxAniso, true);
}

/** 6. Текстуры хвойного леса (пушистая хвоя и трещиноватая кора сосны) и зернистых валунов */
export function createNatureTexturePack(maxAniso = 4) {
  // Хвоя
  const fc = makeCanvas(128);
  const fctx = fc.getContext('2d');
  fctx.fillStyle = '#97ab94';
  fctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 620; i++) {
    const x = hash2(i, 1, 11) * 128;
    const y = hash2(i, 2, 19) * 128;
    const bright = hash2(i, 3, 29) > 0.46;
    fctx.strokeStyle = bright ? 'rgba(235, 252, 224, 0.42)' : 'rgba(24, 46, 26, 0.45)';
    fctx.lineWidth = 2.0;
    fctx.beginPath();
    fctx.moveTo(x, y);
    fctx.lineTo(x + (hash2(i, 4, 41) - 0.5) * 14, y + 5 + hash2(i, 5, 53) * 8);
    fctx.stroke();
  }

  // Кора сосны
  const bc = makeCanvas(128);
  const bctx = bc.getContext('2d');
  bctx.fillStyle = '#6b4c32';
  bctx.fillRect(0, 0, 128, 128);
  for (let x = 0; x < 128; x += 3) {
    const shade = (hash2(x, 7, 61) - 0.5) * 44;
    bctx.fillStyle = `rgb(${Math.min(255, Math.max(0, 108 + shade))}, ${Math.min(255, Math.max(0, 76 + shade * 0.7))}, ${Math.min(255, Math.max(0, 50 + shade * 0.5))})`;
    bctx.fillRect(x, 0, 2, 128);
  }
  for (let i = 0; i < 90; i++) {
    bctx.fillStyle = 'rgba(28, 17, 10, 0.52)';
    bctx.fillRect(hash2(i, 1, 79) * 128, hash2(i, 2, 83) * 128, 2, 14 + hash2(i, 3, 97) * 18);
  }

  // Гранитный валун со слюдой, кварцем и пятнами мха
  const rc = makeCanvas(256);
  const rctx = rc.getContext('2d');
  rctx.fillStyle = '#8b8a85';
  rctx.fillRect(0, 0, 256, 256);
  const rImg = rctx.getImageData(0, 0, 256, 256);
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const i = (y * 256 + x) * 4;
      const g1 = (hash2(x, y, 5) - 0.5) * 42;
      const g2 = (hash2(x >> 2, y >> 2, 15) - 0.5) * 34;
      const moss = hash2(x >> 4, y >> 4, 27) > 0.76 ? 1 : 0;
      const base = 138 + g1 + g2;
      rImg.data[i] = Math.max(0, Math.min(255, base - moss * 22));
      rImg.data[i + 1] = Math.max(0, Math.min(255, base + moss * 18));
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

/** Создаёт весь пакет текстур для мира */
export function buildAllProceduralTextures(renderer) {
  const maxAniso = renderer ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 4;
  const waterDetail = createWaterDetailTexture(384);
  const concrete = createConcreteFormworkSet(maxAniso);
  const rebarFormwork = createRebarFormworkTexture(maxAniso);
  const steel = createBrushedSteelTexture(maxAniso);
  const roof = createRoofShingleTexture(maxAniso);
  const nature = createNatureTexturePack(maxAniso);

  return {
    waterDetail,
    concreteMap: concrete.map,
    concreteBump: concrete.bumpMap,
    rebarFormwork,
    steel,
    roof,
    foliage: nature.foliage,
    bark: nature.bark,
    rock: nature.rock,
  };
}
