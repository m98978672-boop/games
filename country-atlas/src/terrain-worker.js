/* Воркер: считает высоты чанка по A28 и отдаёт буфер переносом. */
import { generateChunk } from './heightfield.js';

self.onmessage = (e) => {
  const { cx, cy } = e.data;
  const chunk = generateChunk(cx, cy);
  self.postMessage(chunk, [chunk.heights.buffer]);
};
