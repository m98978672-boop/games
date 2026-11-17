// RatCore Module [env] — Среда, цикл день/ночь, погода, ветер и температура по высоте (Уровень 1 Opt-In)

import { clamp, vec3Normalize } from '../core/math.js';

export const WEATHER_KINDS = Object.freeze(['clear', 'cloudy', 'rain', 'snow', 'fog', 'storm']);

export class EnvironmentSystem {
  constructor() {
    this.timeHours = 10.5; // 0..24
    this.weather = 'clear';
    this.weatherIntensity = 0;
    this.windDirDeg = 45;
    this.windSpeedMs = 3.5;
    this.seaLevelTempC = 18;
  }

  setTime(hours) {
    this.timeHours = ((Number(hours) % 24) + 24) % 24;
    return this.getLightingState();
  }

  advanceHours(deltaHours) {
    return this.setTime(this.timeHours + Number(deltaHours || 0));
  }

  setWeather({ kind = 'clear', intensity = 0.5, windSpeedMs, windDirDeg } = {}) {
    this.weather = WEATHER_KINDS.includes(kind) ? kind : 'clear';
    this.weatherIntensity = this.weather === 'clear' ? 0 : clamp(Number(intensity), 0, 1);
    if (windSpeedMs !== undefined) this.windSpeedMs = clamp(Number(windSpeedMs), 0, 50);
    if (windDirDeg !== undefined) this.windDirDeg = ((Number(windDirDeg) % 360) + 360) % 360;
    return this.getState();
  }

  getSunVector() {
    // 6:00 восход (восток +X), 12:00 зенит (+Y), 18:00 закат (-X)
    const angle = ((this.timeHours - 6) / 24) * Math.PI * 2;
    const elev = Math.sin(angle);
    const horiz = Math.cos(angle);
    return vec3Normalize([horiz, Math.max(-0.5, elev), 0.35]);
  }

  getLightingState() {
    const sunDir = this.getSunVector();
    const dayFactor = clamp((sunDir[1] + 0.15) / 0.85, 0, 1);
    const stormDim = this.weather === 'storm' ? 0.55 : (this.weather === 'rain' || this.weather === 'fog' ? 0.78 : 1.0);
    const ambient = clamp((0.16 + dayFactor * 0.45) * stormDim, 0.1, 0.8);
    const fogDensity = this.weather === 'fog' ? 0.04 + this.weatherIntensity * 0.08
      : (this.weather === 'storm' ? 0.025 : 0.004);
    const skyRgb = [
      Math.round((16 + dayFactor * 92) * stormDim),
      Math.round((24 + dayFactor * 145) * stormDim),
      Math.round((44 + dayFactor * 185) * stormDim),
    ];
    return {
      timeHours: Number(this.timeHours.toFixed(2)),
      phase: dayFactor > 0.6 ? 'day' : (dayFactor > 0.18 ? 'twilight' : 'night'),
      sunDir,
      ambient: Number(ambient.toFixed(3)),
      fogDensity: Number(fogDensity.toFixed(4)),
      skyRgb,
    };
  }

  getWindVector() {
    const rad = (this.windDirDeg * Math.PI) / 180;
    return {
      dx: Number((Math.sin(rad) * this.windSpeedMs).toFixed(3)),
      dy: Number((Math.cos(rad) * this.windSpeedMs).toFixed(3)),
      speedMs: this.windSpeedMs,
      dirDeg: this.windDirDeg,
    };
  }

  // Температура с градиентом -6.5°C на 1000 м и суточным ходом
  sampleTemperatureC(elevationH = 0) {
    const diurnal = Math.sin(((this.timeHours - 9) / 24) * Math.PI * 2) * 5;
    const lapse = (Number(elevationH) / 1000) * 6.5;
    const coldWeather = this.weather === 'snow' ? -14 : (this.weather === 'rain' ? -3 : 0);
    return Number((this.seaLevelTempC + diurnal - lapse + coldWeather).toFixed(2));
  }

  getState() {
    return {
      ...this.getLightingState(),
      weather: this.weather,
      weatherIntensity: this.weatherIntensity,
      wind: this.getWindVector(),
      seaLevelTempC: this.sampleTemperatureC(0),
    };
  }
}
