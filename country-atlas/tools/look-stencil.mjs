/* §103: берег своей страны — трафарет. Одна картинка из двух половин:
   слева берег с карты страны (тот, что взят за трафарет), справа — он же на карте
   мира, поверх настоящей карты. По картинке видно, что это один и тот же берег.
   Запуск: node tools/look-stencil.mjs → docs/world-stencil.png
   Нужен @napi-rs/canvas: npm i --no-save @napi-rs/canvas gifenc */
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';

const W = 1200, H = 620, pad = 16, titleH = 34;
globalThis.document = { createElement: (t) => (t === 'canvas' ? createCanvas(1, 1) : { style: {} }) };
globalThis.window = { devicePixelRatio: 1 };

const { buildWorld } = await import('../src/worldmap2d.js');
const { WorldView, worldToScreen } = await import('../src/worldview.js');
const { countryShore } = await import('../src/stencil2d.js');
const { MAP_TONES, hexToCss } = await import('../src/palette.js');

const world = buildWorld(424242);
const shore = countryShore();
const graft = world.lands[0].shore;
const cast = createCanvas(W, H);
const ctx = cast.getContext('2d');
const half = (W - pad * 3) / 2;

/* ——— слева: трафарет сам по себе, как его сняли с карты страны ——— */
const left = { x: pad, y: titleH, w: half, h: H - titleH - pad };
ctx.save();
ctx.beginPath();
ctx.rect(left.x, left.y, left.w, left.h);
ctx.clip();
ctx.fillStyle = hexToCss(MAP_TONES.seaMid, 1);
ctx.fillRect(left.x, left.y, left.w, left.h);
const k = (left.w - 40) / shore.chordKm;
const midY = left.y + left.h * 0.48;
const toLeft = (p) => [left.x + left.w / 2 + p[0] * k, midY - p[1] * k];
ctx.beginPath();
ctx.moveTo(toLeft([-shore.chordKm / 2 - 900, 2400])[0], toLeft([0, 2400])[1]);
shore.pts.forEach((p) => {
  const [x, y] = toLeft(p);
  ctx.lineTo(x, y);
});
ctx.lineTo(toLeft([shore.chordKm / 2 + 900, 2400])[0], toLeft([0, 2400])[1]);
ctx.closePath();
ctx.fillStyle = hexToCss(MAP_TONES.land, 1);
ctx.fill();
ctx.strokeStyle = hexToCss(MAP_TONES.sand, 1);
ctx.lineWidth = 2;
ctx.beginPath();
shore.pts.forEach((p, i) => {
  const [x, y] = toLeft(p);
  if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
});
ctx.stroke();
// сетка масштаба: 1 000 км
ctx.strokeStyle = 'rgba(255,255,255,0.55)';
ctx.lineWidth = 1;
const gx = left.x + 24, gy = left.y + left.h - 28;
ctx.beginPath();
ctx.moveTo(gx, gy);
ctx.lineTo(gx + 1000 * k, gy);
ctx.moveTo(gx, gy - 5);
ctx.lineTo(gx, gy + 5);
ctx.moveTo(gx + 1000 * k, gy - 5);
ctx.lineTo(gx + 1000 * k, gy + 5);
ctx.stroke();
ctx.fillStyle = 'rgba(255,255,255,0.85)';
ctx.font = '13px sans-serif';
ctx.fillText('1 000 км', gx + 1000 * k + 10, gy + 5);
ctx.restore();

/* ——— справа: тот же берег на карте мира ——— */
const right = { x: pad * 2 + half, y: titleH, w: half, h: H - titleH - pad };
const rc = createCanvas(right.w, right.h);
rc.getBoundingClientRect = () => ({ left: 0, top: 0, width: right.w, height: right.h });
const view = new WorldView(rc, { createCanvas: (a, b) => createCanvas(a, b) });
view.resize();
view.setWorld(world);
view.step(0.02);
view.step(0.02);
view.open();
view.alpha = 1;
view.transition = null;
const mid = graft.chord ? [(graft.chord[0][0] + graft.chord[1][0]) / 2, (graft.chord[0][1] + graft.chord[1][1]) / 2] : world.own.capital;
view.cam.x = mid[0];
view.cam.y = mid[1];
view.cam.scale = (right.w - 60) / (graft.chordKm * 1.08);
view.draw();
ctx.drawImage(rc, right.x, right.y);
// тот же берег поверх мира: две линии должны совпасть
ctx.save();
ctx.translate(right.x, right.y);
const toRight = (p) => {
  const q = worldToScreen(view.cam, view.view, p[0], p[1]);
  return [q.x, q.y];
};
ctx.beginPath();
graft.coast.forEach((p, i) => {
  const [x, y] = toRight(p);
  if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
});
ctx.strokeStyle = 'rgba(240,220,110,0.95)';
ctx.lineWidth = 2.4;
ctx.setLineDash([7, 5]);
ctx.stroke();
ctx.restore();

/* ——— подписи ——— */
ctx.fillStyle = 'rgba(232,240,246,0.92)';
ctx.font = '16px sans-serif';
ctx.fillText('Берег с карты страны — трафарет ' + Math.round(shore.chordKm) + ' км', left.x + 6, 24);
ctx.fillText('Он же на карте мира — берег моей страны (1 к 1)', right.x + 6, 24);
writeFileSync('docs/world-stencil.png', cast.toBuffer('image/png'));
console.log('ok docs/world-stencil.png · масштаб мира ' + view.cam.scale.toFixed(3) + ' px/км');
