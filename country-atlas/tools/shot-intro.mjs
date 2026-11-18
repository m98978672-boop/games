/* §90: кадры пролёта — доказательство, что анимация есть и она длинная.
   Пишет: docs/intro-frames.png (раскадровка) и docs/intro-flyover.gif (сам пролёт).
   Запуск: node tools/shot-intro.mjs */
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { buildWorld } from '../src/worldmap2d.js';
import { Intro, INTRO, tourCam } from '../src/intro.js';

const W = 560, H = 350;

function frameCanvas(w, h) {
  const cv = createCanvas(w, h);
  cv.getBoundingClientRect = () => ({ left: 0, top: 0, width: w, height: h });
  return cv;
}

const world = buildWorld(424242);
const cv = frameCanvas(W, H);
const intro = new Intro(cv, world, { createCanvas });
intro.resize();
intro.buildBackground();
intro.buildLayer();
intro.buildEdge();

/* кадр на момент t секунд: и время пролёта, и проявление ставим руками —
   так раскадровка воспроизводима, без часов браузера */
function frameAt(t) {
  intro.t = t;
  intro.fade = Math.min(1, t / INTRO.fadeInSec);
  intro.bank = 0;
  intro.draw();
  return cv;
}

const loopSec = INTRO.hopSec * intro.points.length;
const marks = [0.4, 10, 22, 36, 52, 72];

/* 1. раскадровка 2×3 */
const PAD = 14, GAP = 12, CAP = 26;
const outW = PAD * 2 + W * 2 + GAP;
const outH = PAD * 2 + (H + CAP) * 3 + GAP * 2 + 22;
const sheet = createCanvas(outW, outH);
const g = sheet.getContext('2d');
g.fillStyle = '#0b1a26';
g.fillRect(0, 0, outW, outH);
marks.forEach((t, i) => {
  frameAt(t);
  const col = i % 2, row = Math.floor(i / 2);
  const x = PAD + col * (W + GAP);
  const y = PAD + row * (H + CAP + GAP);
  g.drawImage(cv, x, y);
  const cam = tourCam(intro.points, t);
  g.fillStyle = 'rgba(200,214,222,0.95)';
  g.font = '12px sans-serif';
  g.fillText(`${t.toFixed(1)} с · ${cam.name} · масштаб ${cam.scale.toFixed(2)} px/км`, x, y + H + 16);
});
g.fillStyle = 'rgba(150,168,180,0.9)';
g.font = '12px sans-serif';
g.fillText(`пролёт: ${intro.points.length} точек · ${INTRO.hopSec} с на точку · круг ${loopSec.toFixed(0)} с · кадр не гаснет, пока игрок не нажмёт «начать игру»`, PAD, outH - 10);
writeFileSync(new URL('../docs/intro-frames.png', import.meta.url), sheet.toBuffer('image/png'));

/* 2. сам пролёт — анимированный GIF */
const { GIFEncoder, quantize, applyPalette } = (await import('gifenc')).default;
const GW = 480, GH = 300;
const gifCv = frameCanvas(GW, GH);
const gif = new Intro(gifCv, world, { createCanvas });
gif.resize();
gif.buildBackground();
gif.buildLayer();
gif.buildEdge();
const enc = GIFEncoder();
const FRAMES = 28;
const STEP = 1.4;                       // секунд пролёта на кадр
for (let i = 0; i < FRAMES; i++) {
  const t = 0.15 + i * STEP;
  gif.t = t;
  gif.fade = Math.min(1, t / INTRO.fadeInSec);
  gif.bank = 0;
  gif.draw();
  const { data } = gifCv.getContext('2d').getImageData(0, 0, GW, GH);
  const palette = quantize(data, 128);
  enc.writeFrame(applyPalette(data, palette), GW, GH, { palette, delay: Math.round(STEP * 1000 / 3) });
}
enc.finish();
const buf = Buffer.from(enc.bytes());
writeFileSync(new URL('../docs/intro-flyover.gif', import.meta.url), buf);
console.log('docs/intro-frames.png', outW + '×' + outH, '· docs/intro-flyover.gif', (buf.length / 1024 / 1024).toFixed(2) + ' МБ,', FRAMES, 'кадров');
