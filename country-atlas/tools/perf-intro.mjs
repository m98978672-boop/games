/* §90: замер пролёта — сколько стоит кадр и что даёт кэш подписи.
   Одна и та же анимация гоняется дважды: с кэшем ширины подписи и без него.
   Пиксели обязаны совпасть, вызовы measureText — упасть, время кадра — не вырасти.
   Запуск: node tools/perf-intro.mjs */
import { createCanvas } from '@napi-rs/canvas';
import { createHash } from 'node:crypto';
import { buildWorld } from '../src/worldmap2d.js';
import { Intro, INTRO } from '../src/intro.js';

const W = 900, H = 560, FRAMES = 120;

function make(world) {
  const cv = createCanvas(W, H);
  cv.getBoundingClientRect = () => ({ left: 0, top: 0, width: W, height: H });
  const intro = new Intro(cv, world, { createCanvas });
  intro.resize();
  intro.buildBackground();
  intro.buildLayer();
  intro.buildEdge();
  intro.fade = 1;
  const ctx = cv.getContext('2d');
  const orig = ctx.measureText.bind(ctx);
  const counter = { calls: 0 };
  ctx.measureText = (t) => { counter.calls++; return orig(t); };
  return { cv, intro, ctx, counter };
}

function run(world, cache) {
  const { cv, intro, ctx, counter } = make(world);
  const saved = INTRO.cacheCaption;
  INTRO.cacheCaption = cache;
  const hash = createHash('sha1');
  let drawMs = 0;
  for (let i = 0; i < FRAMES; i++) {
    intro.t = 0.4 + i / 60;          // две секунды пролёта, 60 кадров в секунду
    const d0 = process.hrtime.bigint();
    intro.draw();
    drawMs += Number(process.hrtime.bigint() - d0) / 1e6;
    const { data } = ctx.getImageData(0, 0, W, H);
    hash.update(Buffer.from(data));
  }
  INTRO.cacheCaption = saved;
  return { perFrame: drawMs / FRAMES, calls: counter.calls, sha: hash.digest('hex') };
}

const world = buildWorld(424242);
run(world, true);                    // прогрев: шрифты, буферы, JIT
const before = run(world, false);
const after = run(world, true);

const same = before.sha === after.sha;
const dMs = before.perFrame - after.perFrame;
console.log(`кадров ${FRAMES} · ${W}×${H}`);
console.log(`  без кэша: ${before.perFrame.toFixed(2)} мс/кадр · measureText ${before.calls}`);
console.log(`  с кэшем:  ${after.perFrame.toFixed(2)} мс/кадр · measureText ${after.calls}`);
console.log(`  пиксели:  ${same ? 'совпадают' : 'РАЗОШЛИСЬ'} (sha1 ${before.sha.slice(0, 12)} / ${after.sha.slice(0, 12)})`);
console.log(`  быстрее на ${dMs.toFixed(2)} мс/кадр · бюджет кадра 16.7 мс`);
if (!same) { console.log('FAIL: кадр изменился'); process.exit(1); }
process.exit(0);
