/* Кадры §86 на телефоне: карта мира 390 × 844 и боком 844 × 390.
   Панели показаны зонами из CSS: верхняя строка и панель внизу — не пересекаются.
   Запуск: node tools/shot-worldmap-phone.mjs → docs/world-map-phone.png */
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { buildWorld, advanceWars, worldStats, hottestWar, diplomacyStats, WM } from '../src/worldmap2d.js';
import { techStats } from '../src/tech2d.js';
import { WorldView, overviewScale } from '../src/worldview.js';

const world = buildWorld(424242);
for (let t = 0; t <= 60 * 24 * 11; t += 45) advanceWars(world, 9000 + t);

const st = worldStats(world);
const hot = hottestWar(world);
const dip = diplomacyStats(world);
const tech = techStats(world);

const frames = [
  { label: 'телефон · обзор мира', w: 390, h: 844, cam: { x: 0, y: 0, scale: 0 }, mode: 'world' },
  { label: 'телефон боком · фронт', w: 844, h: 390, cam: { x: 0, y: 0, scale: 0 }, mode: 'front' },
  { label: 'телефон · фронт вблизи', w: 390, h: 844, cam: { x: 0, y: 0, scale: 0 }, mode: 'front' }
];

function zone(ctx, x, y, w, h, tone) {
  ctx.save();
  ctx.fillStyle = tone;
  ctx.fillRect(x, y, w, h);
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.restore();
}

const shots = frames.map((f) => {
  const cv = createCanvas(f.w, f.h);
  cv.getBoundingClientRect = () => ({ left: 0, top: 0, width: f.w, height: f.h });
  const v = new WorldView(cv, { createCanvas });
  v.resize();
  v.setWorld(world);
  v.step(0.02); v.step(0.02);
  // берём тот фронт, где в кадре нет вспышки: иначе полоски боеготовности под взрывом не видно
  const blastDist = (w2) => world.explosions.reduce((m, e) => Math.min(m, Math.hypot(e.x - w2.x, e.y - w2.y)), Infinity);
  const war = world.wars.filter((w2) => w2.to === null).sort((a, b) => blastDist(b) - blastDist(a))[0] || world.wars[0];
  v.cam = f.mode === 'world'
    ? { x: 0, y: 0, scale: overviewScale(v.view) }
    : { x: war.x, y: war.y, scale: f.w > f.h ? 0.22 : 0.34 };
  v.alpha = 1;
  v.draw();

  const g = cv.getContext('2d');
  // зоны панелей как в CSS: верхняя строка 10 px от края, панель до 38 % высоты внизу
  zone(g, 10, 10, f.w - 20, 74, 'rgba(10,18,24,0.72)');
  const panelH = Math.min(f.h * 0.38, 320);
  zone(g, 10, f.h - panelH - 10, Math.min(f.w * 0.78, f.w - 20), panelH, 'rgba(10,18,24,0.72)');

  g.fillStyle = 'rgba(240,244,246,0.96)';
  g.font = 'bold 12px sans-serif';
  g.fillText('КАРТА МИРА', 20, 30);
  g.font = '11px sans-serif';
  g.fillStyle = 'rgba(160,178,190,0.95)';
  g.fillText(v.loading ? 'рисуем мир…' : `мир: ${WM.countries} стран · ${tech.count} технологий`, 20, 46);
  g.fillStyle = 'rgba(240,244,246,0.9)';
  g.fillRect(f.w - 132, 22, 54, 30);
  g.fillRect(f.w - 72, 22, 56, 30);
  g.fillStyle = '#0d1a22';
  g.font = '10px sans-serif';
  g.fillText('спутник', f.w - 124, 41);
  g.fillText('назад', f.w - 60, 41);

  g.fillStyle = 'rgba(147,165,177,0.95)';
  g.font = '9px sans-serif';
  g.fillText('ЧТО ПРОИСХОДИТ', 20, f.h - panelH + 8);
  g.fillStyle = 'rgba(223,230,234,0.95)';
  g.font = '10.5px sans-serif';
  const lines = [
    `стран ${st.countries} · войн ${st.wars} · боёв ${st.battles}`,
    `разрушено: городов ${st.destroyedCities}, дорог ${st.destroyedRoads}`,
    `оккупация ${st.occupiedZones} зон · потери ${st.killed.toLocaleString('ru-RU')}`,
    `армий видно ${st.armiesVisible} · технологий ${tech.count}`,
    `наука +${tech.perDay.toLocaleString('ru-RU')} в сутки · спутник ${tech.satellite ? 'готов' : 'нет'}`,
    `контакты: союз ${dip.union} · вражда ${dip.enmity} · посольств ${dip.embassies}`,
    hot ? `бои: ${hot.a} — ${hot.b}` : 'сейчас тихо'
  ];
  lines.forEach((l, i) => g.fillText(l, 20, f.h - panelH + 22 + i * 13.5));
  // на низком экране панель прокручивается — легенду в кадр не втискиваем
  if (panelH > 240) {
    g.fillStyle = 'rgba(147,165,177,0.95)';
    g.font = '9px sans-serif';
    g.fillText('ОБОЗНАЧЕНИЯ', 20, f.h - panelH + 130);
    const legend = [['#3f4a34', 'наша страна'], ['#ffd66e', 'дороги'], ['#f4f6f8', 'города'],
      ['#d64030', 'разрушено'], ['#ff9a4a', 'взрывы'], ['#c44230', 'оккупация'], ['#78c8ff', 'армии'],
      ['#92ecb2', 'полоска боеготовности']];
    legend.forEach(([c, name], i) => {
      g.fillStyle = c;
      g.fillRect(20, f.h - panelH + 140 + i * 13, 12, 8);
      g.fillStyle = 'rgba(223,230,234,0.92)';
      g.font = '10px sans-serif';
      g.fillText(name, 38, f.h - panelH + 148 + i * 13);
    });
  }
  return cv;
});

const PAD = 16, GAP = 16, CAP = 24;
const outW = PAD * 2 + shots.reduce((a, c) => a + c.width, 0) + GAP * (shots.length - 1);
const outH = PAD * 2 + Math.max(...shots.map((c) => c.height)) + CAP;
const out = createCanvas(outW, outH);
const ctx = out.getContext('2d');
ctx.fillStyle = '#0b1a26';
ctx.fillRect(0, 0, outW, outH);
let x = PAD;
shots.forEach((cv, i) => {
  ctx.drawImage(cv, x, PAD);
  ctx.fillStyle = 'rgba(200,214,222,0.95)';
  ctx.font = '12px sans-serif';
  ctx.fillText(frames[i].label, x, PAD + cv.height + 16);
  x += cv.width + GAP;
});
writeFileSync(new URL('../docs/world-map-phone.png', import.meta.url), out.toBuffer('image/png'));
console.log('docs/world-map-phone.png', outW + '×' + outH, '· войны', st.wars, '· разрушено', st.destroyedCities);
