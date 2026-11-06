// Выгрузка текстур повреждений в PNG для визуальной проверки:
//   node tools/dmg.mjs --out /tmp/prev/damage.png
import fs from 'node:fs';
import { PNG } from 'pngjs';
import { damagePixels, DAMAGE_TITLES } from '../src/lib/damage.js';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
    return acc;
  }, [])
);
const out = args.out || 'damage.png';
const kinds = Object.keys(DAMAGE_TITLES);
const S = 128;
const COLS = 2;
const ROWS = Math.ceil(kinds.length / COLS);
const png = new PNG({ width: S * COLS, height: S * ROWS });
// фон — синий кузов и тёмный кузов, чтобы видеть оба варианта
const bg = [[0x1b, 0x4f, 0x8a], [0x2b, 0x2f, 0x33], [0xd8, 0xd9, 0xd4], [0x7d, 0x1a, 0x2e]];
kinds.forEach((kind, i) => {
  const px = damagePixels(kind, 7 + i * 13);
  const ox = (i % COLS) * S;
  const oy = Math.floor(i / COLS) * S;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const s = (y * S + x) * 4;
      const d = ((oy + y) * png.width + ox + x) * 4;
      const alpha = px[s + 3] / 255;
      // базовый фон — «краска» с лёгким градиентом
      const k = 0.85 + 0.15 * (1 - y / S);
      const base = bg[i % bg.length];
      png.data[d] = Math.round(px[s] * alpha + base[0] * k * (1 - alpha));
      png.data[d + 1] = Math.round(px[s + 1] * alpha + base[1] * k * (1 - alpha));
      png.data[d + 2] = Math.round(px[s + 2] * alpha + base[2] * k * (1 - alpha));
      png.data[d + 3] = 255;
    }
  }
});
fs.writeFileSync(out, PNG.sync.write(png));
console.log('написал', out, kinds.join(' / '));
