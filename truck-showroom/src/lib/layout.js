// ============================================================
// РАСКЛАДКА ПЛАВАЮЩИХ ПАНЕЛЕЙ.
// Правило шоурума: один интерфейс не может лежать на другом.
// Каждое выпадающее меню ставится под своей кнопкой, прижимается к краям
// экрана и уезжает, если на его месте уже стоит другая панель (нижний док,
// карточка модели, тост). Функции чистые — их проверяют тесты без DOM.
// ============================================================

/** Прямоугольник: { x, y, w, h }. */
export function rect(x, y, w, h) {
  return { x, y, w, h };
}

export function overlaps(a, b, gap = 0) {
  if (!a || !b) return false;
  return a.x < b.x + b.w + gap
    && a.x + a.w + gap > b.x
    && a.y < b.y + b.h + gap
    && a.y + a.h + gap > b.y;
}

export function overlapArea(a, b) {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

function clamp(v, lo, hi) {
  if (hi < lo) return lo;
  return Math.min(hi, Math.max(lo, v));
}

/**
 * Куда поставить панель, чтобы она не легла ни на что лишнее.
 * anchor — кнопка, от которой открыли меню; size — желаемый размер;
 * viewport — экран; avoid — прямоугольники, на которые нельзя наезжать.
 * Если места мало, панель не «наезжает», а УМЕНЬШАЕТСЯ (внутри появляется
 * прокрутка) и уезжает в свободный угол. Возвращает { x, y, w, h, side }.
 */
export function placePanel({ anchor, size, viewport, avoid = [], margin = 12, gap = 8 }) {
  const vw = viewport.w;
  const vh = viewport.h;
  const MIN_W = 176;
  const MIN_H = 110;
  const maxW = Math.max(MIN_W, vw - margin * 2);
  const maxH = Math.max(MIN_H, vh - margin * 2);
  const want = { w: Math.min(size.w, maxW), h: Math.min(size.h, maxH) };
  const alignRight = anchor.x + anchor.w / 2 > vw / 2;
  const below = anchor.y + anchor.h + gap;
  const above = anchor.y - gap - want.h;
  const leftAligned = alignRight ? anchor.x + anchor.w - want.w : anchor.x;
  const candidates = [
    { x: leftAligned, y: below, side: 'below' },
    { x: leftAligned, y: above, side: 'above' },
    { x: margin, y: below, side: 'left' },
    { x: vw - want.w - margin, y: below, side: 'right' },
    { x: leftAligned, y: margin, side: 'top' },
  ];

  const clampRect = (x, y, w, h) => {
    const cw = Math.min(w, maxW);
    const ch = Math.min(h, maxH);
    return {
      x: clamp(x, margin, Math.max(margin, vw - cw - margin)),
      y: clamp(y, margin, Math.max(margin, vh - ch - margin)),
      w: cw,
      h: ch,
    };
  };

  // сжимаем кандидата до свободного места: сначала по высоте, потом по ширине
  const shrink = (start) => {
    let { x, y, w, h } = start;
    for (let guard = 0; guard < 24; guard++) {
      const r = clampRect(x, y, w, h);
      const hit = avoid.find((a) => overlaps(r, a, 2));
      if (!hit) return { ...r, free: true };
      const roomBelow = hit.y - r.y - 4;
      const roomRight = hit.x - r.x - 4;
      const roomLeft = r.x + r.w - (hit.x + hit.w) - 4;
      let changed = false;
      // помеха сверху (шапка): не режем панель, а сдвигаем её вниз
      if (hit.y + hit.h <= r.y + 3 && hit.y + hit.h + 4 > y) {
        y = hit.y + hit.h + 4;
        h = Math.min(h, vh - margin - y);
        changed = true;
      } else if (hit.x + hit.w <= r.x + 3) {
        // помеха слева: сдвигаем вправо
        x = hit.x + hit.w + 4;
        w = Math.min(w, vw - margin - x);
        changed = true;
      } else if (roomBelow >= MIN_H && roomBelow < h) { h = roomBelow; changed = true; }
      else if (roomRight >= MIN_W && roomRight < w) { w = roomRight; changed = true; }
      else if (roomLeft >= MIN_W && roomLeft < w) { x = hit.x + hit.w + 4; w = roomLeft; changed = true; }
      if (!changed) {
        // режем по самому крупному пересечению
        if (h > MIN_H) { h = Math.max(MIN_H, h - 24); changed = true; }
        else if (w > MIN_W) { w = Math.max(MIN_W, w - 24); changed = true; }
      }
      if (!changed) break;
    }
    const r = clampRect(x, y, w, h);
    return { ...r, free: false };
  };

  let best = null;
  for (const c of candidates) {
    const fitted = shrink(clampRect(c.x, c.y, want.w, want.h));
    const area = fitted.w * fitted.h;
    const cost = (fitted.free ? 0 : 1e7) - area;
    if (!best || cost < best.cost) best = { ...fitted, side: c.side, cost };
  }
  delete best.cost;
  return best;
}

/** Прямоугольники из текущего DOM (для браузера). */
export function rectOf(el) {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (!r || (!r.width && !r.height)) return null;
  return rect(r.left, r.top, r.width, r.height);
}

export function viewportRect() {
  const w = (typeof window !== 'undefined' && window.innerWidth) || 1280;
  const h = (typeof window !== 'undefined' && window.innerHeight) || 800;
  return rect(0, 0, w, h);
}
