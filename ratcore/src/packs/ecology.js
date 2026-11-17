// RatCore Pack [pack:ecology] — Формула Стефана/Гольда для льда, эрозия HeightField, сезоны и фауна на 1 Гц (F-158..F-160, A-105..A-106)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).

import { clamp } from '../core/math.js';

const SEASONS = Object.freeze(['spring', 'summer', 'autumn', 'winter']);

export class EcologySystem {
  constructor() {
    this.seasonIdx = 3; // winter по умолчанию для быстрой демонстрации льда
    this.iceThicknessCm = 12;
    this.iceStrengthKpa = 700; // A-коэффициент формулы Гольда (кПа для пресного льда)
    this.faunaPopulations = new Map([['deer', 24], ['wolves', 6], ['fish', 120]]);
    this.erosionSteps = 0;
  }

  setSeason(season) {
    const idx = SEASONS.indexOf(String(season));
    if (idx >= 0) this.seasonIdx = idx;
    return { season: SEASONS[this.seasonIdx], iceThicknessCm: this.iceThicknessCm };
  }

  // F-158: Формула Стефана нарастания/таяния речного льда по температуре воздуха и времени
  stepIce({ tempC = -12, hours = 6 } = {}) {
    const h = Math.max(0.1, Number(hours));
    if (tempC < 0) {
      // dh/dt пропорциональна |T| / (h + c) — закон Стефана
      const deltaCm = (Math.abs(tempC) * h * 0.085) / (1 + this.iceThicknessCm * 0.12);
      this.iceThicknessCm = Number(clamp(this.iceThicknessCm + deltaCm, 0, 180).toFixed(2));
    } else {
      const meltCm = tempC * h * 0.11;
      this.iceThicknessCm = Number(clamp(this.iceThicknessCm - meltCm, 0, 180).toFixed(2));
    }
    return { iceThicknessCm: this.iceThicknessCm, tempC, hours: h };
  }

  // F-159 / A-105: Формула Гольда P_max = A * h^2 (проверка проламывания льда под техникой!)
  // h в метрах, A в кПа -> безопасная нагрузка в килограммах: P_kg ≈ A * (h_m)^2 * 100
  iceStressTest({ massKg = 3500, iceThicknessCm = null, safetyFactor = 1.0 } = {}) {
    const hCm = iceThicknessCm !== null ? Math.max(0, Number(iceThicknessCm)) : this.iceThicknessCm;
    const hMeters = hCm / 100;
    const maxSafeKg = Math.round(this.iceStrengthKpa * hMeters * hMeters * 100 / Math.max(0.5, safetyFactor));
    const ratio = maxSafeKg > 0 ? Number((Number(massKg) / maxSafeKg).toFixed(3)) : Infinity;
    const status = ratio > 1.0 ? 'crack-collapse' : (ratio > 0.78 ? 'creaking-warning' : 'safe');
    return {
      massKg: Number(massKg),
      iceThicknessCm: hCm,
      maxSafeKg,
      loadRatio: ratio,
      holds: ratio <= 1.0,
      status,
    };
  }

  // F-160 / A-106: Лёгкая гидравлическая эрозия сетки высот HeightField на 1 Гц
  erodeTerrain(heightField, { iterations = 1, strength = 0.08 } = {}) {
    if (!heightField || !heightField.data) return { ok: false, erodedCells: 0 };
    const { width, height, data } = heightField;
    const s = clamp(Number(strength), 0.005, 0.35);
    let totalMoved = 0;

    for (let it = 0; it < Math.max(1, Math.min(8, iterations | 0)); it++) {
      const next = data.slice();
      for (let gy = 1; gy < height - 1; gy++) {
        for (let gx = 1; gx < width - 1; gx++) {
          const idx = gy * width + gx;
          const h0 = data[idx];
          const avg = (data[idx - 1] + data[idx + 1] + data[idx - width] + data[idx + width]) * 0.25;
          const diff = h0 - avg;
          if (Math.abs(diff) > 0.02) {
            next[idx] = h0 - diff * s;
            totalMoved += Math.abs(diff * s);
          }
        }
      }
      data.set(next);
      this.erosionSteps++;
    }
    return { ok: true, erosionSteps: this.erosionSteps, sedimentMoved: Number(totalMoved.toFixed(4)) };
  }

  // Шаг популяций фауны (упрощённая модель Лотки-Вольтерры на 1 Гц)
  tickFauna() {
    const prey = this.faunaPopulations.get('deer') || 0;
    const pred = this.faunaPopulations.get('wolves') || 0;
    const seasonBonus = SEASONS[this.seasonIdx] === 'winter' ? -0.04 : 0.06;
    const nextPrey = clamp(Math.round(prey + prey * (0.08 + seasonBonus) - 0.015 * prey * pred), 2, 300);
    const nextPred = clamp(Math.round(pred + 0.004 * prey * pred - 0.08 * pred), 1, 80);
    this.faunaPopulations.set('deer', nextPrey);
    this.faunaPopulations.set('wolves', nextPred);
    return {
      season: SEASONS[this.seasonIdx],
      populations: Object.fromEntries(this.faunaPopulations),
    };
  }
}
