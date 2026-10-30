// Упрощённая локальная модель воды и сырости ямы, не симулятор жидкости.
// Вызывается с фиксированным шагом; размеры измеряются в метрах.
export function advancePitWater(pit, dt, rain, seaLevel = 0) {
  if (!Number.isFinite(dt) || dt <= 0) return;
  const rainfall = Math.max(0, Math.min(1, rain || 0));
  const maxDepth = Math.max(0, pit.exitY - pit.floorY - 0.06);
  let depth = Math.max(0, Math.min(maxDepth, pit.waterDepth || 0));
  const seaSource = pit.surface === 'sand' && pit.floorY < seaLevel - 0.05;
  const seaTarget = seaSource ? Math.max(0, Math.min(maxDepth, seaLevel - pit.floorY)) : 0;
  if (seaSource && depth < seaTarget) depth = Math.min(seaTarget, depth + dt * 0.18);
  // Дождь накапливается, часть воды просачивается и испаряется.
  depth += dt * (rainfall * 0.025 - 0.0025);
  if (seaSource && depth < seaTarget) depth = Math.min(seaTarget, depth + dt * 0.0025);
  pit.waterDepth = Math.max(0, Math.min(maxDepth, depth));
  const targetWet = Math.max(rainfall * 0.7, pit.waterDepth > 0.01 ? 0.9 : 0, seaSource ? 0.6 : 0);
  const rate = targetWet > (pit.wetness || 0) ? 0.10 : 0.012;
  pit.wetness = Math.max(0, Math.min(1, (pit.wetness || 0) + (targetWet - (pit.wetness || 0)) * Math.min(1, rate * dt)));
  pit.seaSource = seaSource;
}
