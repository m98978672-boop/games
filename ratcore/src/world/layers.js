// RatCore World — Парсер и валидатор слоевой записи (X;Y)Hp(...) и (X;Y)hp(...) (F-09..F-11, A-06)
// Коды ошибок: RC-302 (смещение при вертикальной H), RC-303 (число пар != p - 1).

import { RatCoreError } from '../core/seal.js';
import { packFaceId, FACE_SIDE } from './face-id.js';

const LAYER_RE = /^\(\s*(-?\d+(?:\.\d+)?)\s*;\s*(-?\d+(?:\.\d+)?)\s*\)\s*([Hh])\s*(?:\[(\d+)\]|(\d))\s*(?:\(([^)]*)\))?\s*$/;

export function parseLayerNotation(expr, { tex = 1, layerIndex = 0, baseK = 0, allowCarry = false } = {}) {
  const raw = String(expr || '').trim();
  const match = LAYER_RE.exec(raw);
  if (!match) {
    throw new RatCoreError(
      'RC-103',
      `Некорректная слоевая запись: "${raw}"`,
      'Используй формат (X;Y)Hp(dx1,dy1;dx2,dy2;...) или (X;Y)H[12](...), где число пар равно p - 1.'
    );
  }

  const startX = Number(match[1]);
  const startY = Number(match[2]);
  const mode = match[3]; // 'H' = строго вертикальный, 'h' = наклонный/изогнутый
  const p = Number(match[4] || match[5]);
  const pairsRaw = (match[6] || '').trim();

  if (!Number.isInteger(p) || p < 1 || p > 512) {
    throw new RatCoreError('RC-103', `Число слоёв p=${p} вне допустимого диапазона 1..512`, 'Укажи p >= 1.');
  }

  const deltas = [];
  if (pairsRaw) {
    const parts = pairsRaw.split(';').map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      const nums = part.split(',').map((n) => Number(n.trim()));
      if (nums.length !== 2 || !Number.isFinite(nums[0]) || !Number.isFinite(nums[1])) {
        throw new RatCoreError('RC-103', `Некорректная пара смещения "${part}" в слоевой записи`, 'Формат пары: dx,dy (например: 0,0 или 1,-1).');
      }
      deltas.push([nums[0], nums[1]]);
    }
  }

  const expectedPairs = Math.max(0, p - 1);
  if (deltas.length !== expectedPairs) {
    if (allowCarry && deltas.length < expectedPairs) {
      while (deltas.length < expectedPairs) deltas.push([0, 0]);
    } else {
      throw new RatCoreError(
        'RC-303',
        `Неверное число пар смещения: получено ${deltas.length}, требуется p - 1 = ${expectedPairs}`,
        `Для p=${p} укажи ровно ${expectedPairs} пар dx,dy через точку с запятой (или передай allowCarry: true).`
      );
    }
  }

  // F-10: проверка вертикальности для заглавной H
  let driftSqSum = 0;
  let totalDx = 0;
  let totalDy = 0;
  const cells = [];
  let cx = startX;
  let cy = startY;

  for (let step = 0; step < p; step++) {
    if (step > 0) {
      const [dx, dy] = deltas[step - 1];
      if (mode === 'H' && (dx !== 0 || dy !== 0)) {
        throw new RatCoreError(
          'RC-302',
          `Противоречивая запись: заглавная H требует вертикальный столб (D=0), но на шаге ${step} задано смещение (${dx},${dy})`,
          'Замени H на строчную h для наклонного столба или обнули смещения (0,0).'
        );
      }
      cx += dx;
      cy += dy;
      totalDx += dx;
      totalDy += dy;
      driftSqSum += dx * dx + dy * dy;
    }
    const k = baseK + step;
    const faceId = packFaceId({ s: FACE_SIDE.TOP, i: Math.round(cx), j: Math.round(cy), k, t: tex, n: layerIndex });
    cells.push({ step, x: cx, y: cy, k, faceId });
  }

  // F-10, F-11: дрейф D, наклонная длина h и угол наклона θ
  const verticalH = p;
  const driftD = Math.hypot(totalDx, totalDy);
  const slantLength = Math.hypot(verticalH, driftD);
  const tiltDeg = (Math.atan2(driftD, verticalH) * 180) / Math.PI;

  return {
    raw,
    mode,
    isVertical: mode === 'H',
    p,
    startX,
    startY,
    driftD,
    driftStepEnergy: Math.sqrt(driftSqSum),
    verticalH,
    slantLength,
    tiltDeg,
    cells,
  };
}
