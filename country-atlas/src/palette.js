/* Палитра §2.2: вода, песок, луг, лес, камень, снег. Краски — единственное, что здесь «нарядное». */
export const PALETTE = {
  deep: 0x2f6f8f,
  shallow: 0x4b93a8,
  sand: 0xd8c9a3,
  meadow: 0x7f9b62,
  forest: 0x4c6b46,
  rock: 0x8b8a83,
  snow: 0xf2f4f5,
  road: 0x3b3b3b,
  wall: [0xe6dfd2, 0xd9c9b0, 0xc9d2d6, 0xe2d2c4, 0xcfd6c4],
  roof: [0x8c4a3f, 0x4a5b6b, 0x6b5b46, 0x3f4b3f]
};

const lerpColor = (a, b, t) => {
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  return [((ar + (br - ar) * t) / 255), ((ag + (bg - ag) * t) / 255), ((ab + (bb - ab) * t) / 255)];
};

/* цвет по высоте и уклону (0 — плоско, 1 — стена) */
export function terrainColor(h, slope, waterLevel = 2.0) {
  if (h < waterLevel) {
    const t = Math.max(0, Math.min(1, h / Math.max(0.001, waterLevel)));
    return lerpColor(PALETTE.deep, PALETTE.shallow, t);
  }
  if (h < waterLevel + 1.6) return lerpColor(PALETTE.shallow, PALETTE.sand, (h - waterLevel) / 1.6);
  if (h < 26) return lerpColor(PALETTE.sand, PALETTE.meadow, (h - waterLevel - 1.6) / (26 - waterLevel - 1.6));
  if (h < 52) return lerpColor(PALETTE.meadow, PALETTE.forest, (h - 26) / 26);
  if (h < 84) return lerpColor(PALETTE.forest, PALETTE.rock, (h - 52) / 32);
  if (h < 104) return lerpColor(PALETTE.rock, PALETTE.snow, (h - 84) / 20);

  const snow = lerpColor(PALETTE.rock, PALETTE.snow, 1);
  // крутые склоны выше 84 м — камень даже «в снегу»
  if (slope > 0.55) return lerpColor(PALETTE.rock, PALETTE.snow, 0.25);
  return snow;
}

export function colorCss(rgb) {
  return 'rgb(' + Math.round(rgb[0] * 255) + ',' + Math.round(rgb[1] * 255) + ',' + Math.round(rgb[2] * 255) + ')';
}
