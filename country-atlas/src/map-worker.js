/* Воркер карты: считает обзор мира и патчи видимой области, пиксели отдаёт переносом. */
import { WORLD2D, renderRect, renderBox } from './world2d.js';

self.onmessage = (e) => {
  const m = e.data || {};
  if (m.type === 'overview') {
    const n = m.size || 1024;
    const buf = renderRect(0, 0, WORLD2D.sizeKm, n, n);
    self.postMessage({ type: 'overview', size: n, buffer: buf.buffer }, [buf.buffer]);
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
