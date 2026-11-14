/* Воркер карты: считает обзор мира и патчи видимой области, пиксели отдаёт переносом. */
import { WORLD2D, renderRect, renderBox } from './world2d.js';
import { buildRoads } from './roads2d.js';

self.onmessage = (e) => {
  const m = e.data || {};
  if (m.type === 'overview') {
    const n = m.size || 1024;
    // сначала грубый мир целиком (быстро), потом четыре плитки по 1/2 стороны (резко)
    const low = Math.round(n / 4);
    const quick = renderRect(0, 0, WORLD2D.sizeKm, low, low);
    self.postMessage({ type: 'overview', size: low, full: n, buffer: quick.buffer }, [quick.buffer]);
    const half = n / 2, span = WORLD2D.sizeKm / 2;
    for (let j = 0; j < 2; j++) {
      for (let i = 0; i < 2; i++) {
        const cx = -WORLD2D.halfKm + (i + 0.5) * span;
        const cy = WORLD2D.halfKm - (j + 0.5) * span;
        const buf = renderBox(cx, cy, span, span, half, half);
        self.postMessage({ type: 'tile', i, j, size: half, buffer: buf.buffer }, [buf.buffer]);
      }
    }
    return;
  }
  if (m.type === 'roads') {
    self.postMessage({ type: 'roads', net: buildRoads() });
    return;
  }
  if (m.type === 'patch') {
    const buf = renderBox(m.x0, m.y0, m.wKm, m.hKm, m.w, m.h);
    self.postMessage({
      type: 'patch', key: m.key, x0: m.x0, y0: m.y0, wKm: m.wKm, hKm: m.hKm,
      w: m.w, h: m.h, buffer: buf.buffer
    }, [buf.buffer]);
  }
};
