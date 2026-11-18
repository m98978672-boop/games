/* §91: проверки скорости — то, что не должно менять картинку и числа.
   Группы: кадр пролёта, вода по частям, циклы отрисовки, разметка кнопки.
   Больше 20 значений в каждой группе. */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createCanvas } from '@napi-rs/canvas';
import { buildWorld } from '../src/worldmap2d.js';
import { drawLayerCrop, INTRO } from '../src/intro.js';
import { buildWater, createWaterBuilder } from '../src/rivers2d.js';
import { buildRoads } from '../src/roads2d.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; return true; }
  fail++;
  console.log('  ✗ ' + name + (extra ? '  ' + extra : ''));
  return false;
};
const group = (title) => console.log('— ' + title);

const main = readFileSync(new URL('../src/main2d.js', import.meta.url), 'utf8');
const introSrc = readFileSync(new URL('../src/intro.js', import.meta.url), 'utf8');
const mapSrc = readFileSync(new URL('../src/map2d.js', import.meta.url), 'utf8');
const riversSrc = readFileSync(new URL('../src/rivers2d.js', import.meta.url), 'utf8');

/* ——— 1. кадр пролёта: видимый кусок слоя = весь слой ——— */
group('кадр пролёта');
const SIZE = 700;                       // «большой» слой страны
const layer = createCanvas(SIZE, SIZE);
{
  const c = layer.getContext('2d');
  c.fillStyle = '#334433';
  c.fillRect(0, 0, SIZE, SIZE);
  for (let i = 0; i < 40; i++) {
    c.fillStyle = i % 2 ? 'rgba(240,244,246,0.9)' : 'rgba(255,214,110,0.8)';
    c.beginPath();
    c.arc((i * 97) % SIZE, (i * 61) % SIZE, 9 + (i % 5), 0, Math.PI * 2);
    c.fill();
  }
}
const hashOf = (cv) => {
  const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
  return createHash('sha1').update(Buffer.from(d)).digest('hex').slice(0, 16);
};
/* кадры сравниваем не побайтно (масштаб дробный, билинейная выборка чуть иначе
   попадает в пиксели), а по разнице: средняя и доля сильно отличающихся */
const diffOf = (a, b) => {
  const da = a.getContext('2d').getImageData(0, 0, a.width, a.height).data;
  const db = b.getContext('2d').getImageData(0, 0, b.width, b.height).data;
  let sum = 0, max = 0, over8 = 0, n = 0;
  for (let i = 0; i < da.length; i += 4) {
    for (let k = 0; k < 3; k++) {
      const d = Math.abs(da[i + k] - db[i + k]);
      sum += d; if (d > max) max = d; if (d > 8) over8++;
      n++;
    }
  }
  return { mean: sum / n, max, share: over8 / n };
};
const view = { w: 240, h: 400 };
const WORLD_KM = 7000;
function render(crop, cam, bank = 0) {
  const cv = createCanvas(view.w, view.h);
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#08131c';
  ctx.fillRect(0, 0, view.w, view.h);
  if (crop) {
    drawLayerCrop(ctx, layer, cam, view, WORLD_KM, bank);
  } else {
    const k = cam.scale;
    const side = WORLD_KM * k;
    ctx.drawImage(layer, view.w / 2 - (cam.x + WORLD_KM / 2) * k, view.h / 2 - (cam.y + WORLD_KM / 2) * k, side, side);
  }
  return cv;
}
const cams = [
  { x: 0, y: 0, scale: 0.2 },
  { x: -1200, y: 900, scale: 0.34 },
  { x: 2400, y: -2100, scale: 0.16 }
];
for (const cam of cams) {
  const d = diffOf(render(false, cam), render(true, cam));
  ok('видимый кусок совпадает с целым слоем при ' + cam.x + '/' + cam.y,
    d.mean < 1 && d.share < 0.01, 'средняя ' + d.mean.toFixed(2) + ' · >8 у ' + (d.share * 100).toFixed(2) + '%');
}
const bankDiff = diffOf(render(false, cams[0], 0.02), render(true, cams[0], 0.02));
ok('крен не ломает кусок', bankDiff.mean < 1 && bankDiff.share < 0.01, bankDiff.mean.toFixed(2));
ok('камера за пределами слоя не падает', (() => {
  try { render(true, { x: 9000, y: 9000, scale: 0.3 }); return true; } catch (e) { return false; }
})());
ok('мусорный масштаб не падает', (() => {
  try { render(true, { x: 0, y: 0, scale: 0 }); return true; } catch (e) { return false; }
})());
ok('кусок не больше кадра с запасом', (() => {
  const cam = cams[1];
  const cv = createCanvas(view.w, view.h);
  const ctx = cv.getContext('2d');
  let args = null;
  const orig = ctx.drawImage.bind(ctx);
  ctx.drawImage = (...a) => { args = a; return orig(...a); };
  drawLayerCrop(ctx, layer, cam, view, WORLD_KM, 0);
  const [, sx, sy, sw, sh, dx, dy, dw, dh] = args;
  return dw <= view.w + 6 && dh <= view.h + 6 && dx <= 0 && dy <= 0 &&
    sw <= SIZE + 1 && sh <= SIZE + 1 && sx >= -1 && sy >= -1 && sx + sw <= SIZE + 2 && sy + sh <= SIZE + 2;
})());
ok('подложка краёв не поворачивается вместе с кадром', /setTransform\(1, 0, 0, 1, 0, 0\);\s*\n\s*ctx\.drawImage\(this\.edge, 0, 0\)/.test(introSrc));
ok('размытие подложки запекается один раз', (() => {
  const body = introSrc.slice(introSrc.indexOf('  draw()'), introSrc.indexOf('  draw()') + 4000);
  return introSrc.includes('blurOnce') && !/filter = 'blur/.test(body);
})());
ok('радиус размытия считается из масштаба кадра', /bgBlurPx\(\)/.test(introSrc) && /INTRO\.blurPx \/ Math\.max/.test(introSrc));
ok('буфер подложки не пересобирается в кадре', !/buildBackground\(\)/.test(introSrc.slice(introSrc.indexOf('  draw()'), introSrc.indexOf('  draw()') + 4000)));
ok('шаг кадра ограничен бюджетом', /const budget = this\.lastDrawMs > 12 \? 33 : 16/.test(introSrc));
ok('в свёрнутой вкладке пролёт не рисуется', /document\.hidden\) return/.test(introSrc));
ok('отрицательный шаг времени не откатывает кадр', /raw > 0 \? Math\.min\(0\.1, raw\)/.test(introSrc));
ok('полоска круга рисуется по прогрессу', introSrc.includes('tourProgress('));
ok('на телефоне подпись короче', /view\.w < INTRO\.narrowW/.test(introSrc));
ok('кэш ширины подписи на месте', introSrc.includes('captionW'));

/* ——— 2. вода по частям: тот же результат ——— */
group('вода по частям');
const roads = buildRoads();
const sync = buildWater(roads);
const builder = createWaterBuilder(roads);
const slices = [];
for (const task of builder.tasks) {
  const t = process.hrtime.bigint();
  task();
  slices.push(Number(process.hrtime.bigint() - t) / 1e6);
}
const part = builder.finish();
const sig = (w) => JSON.stringify([
  w.grid, w.stepKm, Math.round(w.totalKm * 1000), w.lakes.length, w.inland.length,
  w.bridges.count, Math.round(w.bridges.longKm * 1000), Object.keys(w.rivers).sort(),
  Math.round((w.rivers.totalKm || 0) * 1000), (w.rivers.main || []).length
]);
ok('шагов ровно семь', slices.length === 7, slices.length);
ok('результат совпадает с buildWater', sig(sync) === sig(part));
ok('рек столько же', Math.round(sync.totalKm) === Math.round(part.totalKm), sync.totalKm + ' vs ' + part.totalKm);
ok('озёр столько же', sync.lakes.length === part.lakes.length, sync.lakes.length + ' vs ' + part.lakes.length);
ok('мостов столько же', sync.bridges.count === part.bridges.count, sync.bridges.count + ' vs ' + part.bridges.count);
ok('внутренних морей столько же', sync.inland.length === part.inland.length);
ok('сетка та же', sync.grid === part.grid && sync.stepKm === part.stepKm);
ok('самая большая часть короче целого', Math.max(...slices) < sync.ms, Math.max(...slices).toFixed(0) + ' vs ' + sync.ms + ' мс');
ok('части не дороже целого вдвое', slices.reduce((a, b) => a + b, 0) < sync.ms * 1.6);
ok('все части — числа больше нуля', slices.every((x) => x >= 0 && Number.isFinite(x)));
ok('buildWater остался для тестов и 3D', riversSrc.includes('export function buildWater'));
ok('карта умеет строить воду по частям', mapSrc.includes('buildWaterDeferred') && mapSrc.includes('createWaterBuilder'));
ok('главный поток разгружен: задача за кадр', /requestAnimationFrame\s*\n?\s*: \(fn\) => setTimeout\(fn, 0\)/.test(mapSrc));
ok('ошибка одной части не оставляет карту без воды навсегда', /catch \(err\) \{ this\.waterBuilder = null;/.test(mapSrc));

/* ——— 3. циклы отрисовки ——— */
group('циклы отрисовки');
ok('страна не рисуется под открытой картой мира', /worldScreen\.classList\.contains\('open'\)\) return/.test(main));
ok('страна не рисуется под заставкой', /overlayPhase\(startState\) !== 'closed'\) return/.test(main));
ok('интервал кадра считается по замеру', /const interval = Math\.max\(50, Math\.min\(200, drawCost \* 2\.5\)\)/.test(main));
ok('стоимость кадра сглаживается', /drawCost = drawCost \* 0\.8 \+/.test(main));
ok('симуляция идёт независимо от отрисовки', /map\.tick\(dt\);/.test(main));
ok('падение кадра не убивает цикл', /try \{ map\.draw\(\); \} catch/.test(main));
ok('война шагает на новую минуту, а не каждый кадр', /target - world\.minutes >= 1/.test(main));
ok('кадр мира имеет бюджет', /worldView\.lastDrawMs > 12 \? 33 : 16/.test(main));
ok('кадр мира запоминает время', main.includes('worldView.drawnAt = now'));
ok('карта мира не считает статистику каждый кадр', /worldStatsT > 0\.4/.test(main));
ok('шаги сборки страны разделены', (main.match(/step\('/g) || []).length >= 9, (main.match(/step\('/g) || []).length);
ok('падение одного слоя не обрывает остальные', /const step = \(name, fn\)/.test(main));

/* ——— 4. кнопка «карта мира» ——— */
group('кнопка «карта мира»');
ok('карта мира подключается сразу при загрузке', /setupIntro\(\);\n\/\/ F-353[\s\S]*setupWorld\(\);\nboot\(\);/.test(main));
ok('повторное подключение ничего не ломает', /if \(worldView\) return;/.test(main));
ok('мир строится лениво — по первому открытию', /const ensureWorld = \(\) => \{/.test(main));
ok('мир сообщает о себе отладочному объекту', /window\.__ratgrad\.worldView = worldView/.test(main));
ok('счётчики мира появляются после сборки', /window\.__ratgrad\.getWorld = ensureWorld/.test(main));
ok('сборка страны больше не единственный путь к кнопке', main.indexOf('setupWorld();\nboot();') > 0);
ok('ошибка сборки пишется в статус', /не собрались: ' \+ err\.message/.test(main));
ok('карта мира — отдельный экран', readFileSync(new URL('../index.html', import.meta.url), 'utf8').includes('id="world-screen"'));
ok('кнопка ведёт на экран мира', readFileSync(new URL('../index.html', import.meta.url), 'utf8').includes('id="world-open"'));
ok('пролёт не мешает кнопке старта', main.includes('startState.started = true'));

console.log(`\nOK: 4 группы · ${pass} проверок скорости`);
if (fail) { console.log(`FAIL: ${fail}`); process.exit(1); }
