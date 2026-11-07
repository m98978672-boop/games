// ============================================================
// МАКЕТ ИНТЕРФЕЙСА: рисуем экран шоурума в SVG по тем же размерам и
// цветам, что в style.css, и растеризуем в PNG (@resvg/resvg-js).
// Нужен, чтобы показать вид меню без браузера.
//   node tools/mockup.mjs --out /tmp/prev/mock.png --w 1280 --h 800
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import { icon } from '../src/lib/icons.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = {};
for (let i = 2; i < process.argv.length; i += 2) args[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const W = Number(args.w || 1280);
const H = Number(args.h || 800);
const OUT = args.out || '/tmp/prev/mock.png';
const SCENE = args.scene || '';
const PREVIEW = args.preview || SCENE;

const C = {
  ink: '#e9ece9', inkDim: '#a9b0ab', inkFaint: '#767d78',
  accent: '#e8b45a', accent2: '#ffd98a', accentInk: '#2b2109',
  line: 'rgba(255,255,255,0.08)', panel: 'rgba(20,24,23,0.97)',
  surface: 'rgba(255,255,255,0.035)', surface2: 'rgba(255,255,255,0.07)',
  bg: '#07090a',
};
const FONT = 'DejaVu Sans';

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rect = (x, y, w, h, r, fill, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
const line = (x1, y1, x2, y2, stroke) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1"/>`;
const text = (x, y, str, size, fill, opts = {}) => {
  const { weight = 400, anchor = 'start', ls = 0, upper = false, opacity = 1 } = opts;
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}"`
    + ` text-anchor="${anchor}" letter-spacing="${ls}" opacity="${opacity}">${esc(upper ? String(str).toUpperCase() : str)}</text>`;
};
const iconAt = (name, x, y, size = 16, color = 'currentColor') =>
  `<g transform="translate(${x},${y}) scale(${size / 24})" color="${color}" fill="none" stroke="${color}"`
  + ` stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${iconBody(name)}</g>`;

let ICON_BODY = {};
function iconBody(name) {
  const svg = icon(name);
  const m = svg.match(/>(.*)<\/svg>/s);
  return m ? m[1] : '';
}

/** Приблизительная ширина строки: кириллица в DejaVu шире латиницы. */
function textWidth(str, size, weight = 400, ls = 0) {
  let w = 0;
  for (const ch of String(str)) {
    const wide = /[А-Яа-яЁёЖШЩЮжшщю]/.test(ch) ? 0.62 : /[А-Яа-яЁё]/.test(ch) ? 0.55
      : /[ilI.,:;'!| ]/.test(ch) ? 0.30 : /[MW@%]/.test(ch) ? 0.82 : 0.56;
    w += size * wide;
  }
  return w * (weight >= 700 ? 1.05 : 1) + String(str).length * ls;
}

const out = [];
out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
out.push(rect(0, 0, W, H, 0, C.bg));
if (SCENE && fs.existsSync(SCENE)) {
  const b64 = fs.readFileSync(SCENE).toString('base64');
  out.push(`<image x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice" href="data:image/png;base64,${b64}"/>`);
}
// мягкая виньетка, как в сцене
out.push(`<defs><linearGradient id="vig" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#05070a" stop-opacity="0.55"/><stop offset="0.35" stop-color="#05070a" stop-opacity="0"/>
  <stop offset="1" stop-color="#05070a" stop-opacity="0.72"/></linearGradient></defs>`);
out.push(rect(0, 0, W, H, 0, 'url(#vig)'));

const HUD = 54;
const FOOT = 64;
const SMALL = W < 620;

// ---------------- шапка
out.push(rect(0, 0, W, HUD, 0, 'rgba(9,11,10,0.94)'));
out.push(`<line x1="0" y1="${HUD - 0.5}" x2="${W}" y2="${HUD - 0.5}" stroke="${C.line}" stroke-width="1"/>`);
// бренд
const brandW = 78;
out.push(rect(12, 10, brandW, 34, 999, 'rgba(255,255,255,0.02)', `stroke="${C.line}"`));
out.push(text(24, 32, '← GAMES', 10.5, C.inkDim, { ls: 1.2, weight: 600 }));
// заголовок
if (!SMALL) {
  out.push(text(104, 24, '3D-ШОУРУМ', 9, C.inkFaint, { ls: 2.2, weight: 600 }));
  out.push(`<defs><linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#ffecc6"/><stop offset="0.55" stop-color="${C.accent}"/><stop offset="1" stop-color="#c98a34"/></linearGradient></defs>`);
  out.push(text(104, 44, 'ГАРАЖ 3D', 19, 'url(#gold)', { ls: 2.6, weight: 800 }));
}

// ---------------- кнопки меню справа
const NAV = [
  { id: 'model', label: SMALL ? '' : 'Модель', badge: '10' },
  { id: 'view', label: SMALL ? '' : 'Ракурсы' },
  { id: 'damage', label: SMALL ? '' : 'Повреждения', badge: '0 / 15', open: true },
  { id: 'light', label: SMALL ? '' : 'Свет' },
  { id: 'more', label: '' },
];
const padX = 12;
const gap = 6;
const btnH = 44;
const btnW = (b) => {
  if (!b.label) return 46;
  const badge = b.badge ? 8 + textWidth(b.badge, 10.5, 600) + 12 : 0;
  return 14 + 19 + 8 + textWidth(b.label, 13.5, 600) + badge + 14;
};
const navW = NAV.reduce((s, b) => s + btnW(b), 0) + gap * (NAV.length - 1);
let bx = W - padX - navW;
const navPos = {};
for (const b of NAV) {
  const w = btnW(b);
  navPos[b.id] = { x: bx, y: 5, w, h: btnH };
  const open = !!b.open;
  if (open) {
    out.push(rect(bx, 5, w, btnH, 11, 'rgba(232,180,90,0.13)', `stroke="rgba(232,180,90,0.45)"`));
    out.push(rect(bx + 1, 5 + btnH - 2, w - 2, 2, 1, C.accent));
  } else {
    out.push(rect(bx, 5, w, btnH, 11, C.surface, `stroke="${C.line}"`));
  }
  const color = open ? C.accent2 : C.inkDim;
  out.push(iconAt(b.id, bx + 14, 5 + 12, 19, color));
  let tx = bx + 41;
  if (b.label) {
    out.push(text(tx, 32, b.label, 13.5, color, { weight: 600 }));
    tx += textWidth(b.label, 13.5, 600) + 8;
  }
  if (b.badge) {
    const bw = textWidth(b.badge, 10.5, 600) + 14;
    out.push(rect(tx, 20, bw, 18, 999, open ? 'rgba(232,180,90,0.2)' : 'rgba(0,0,0,0.28)'));
    out.push(text(tx + bw / 2, 33, b.badge, 10.5, open ? C.accent2 : C.inkFaint, { weight: 600, anchor: 'middle' }));
  }
  bx += w + gap;
}

// ---------------- подпись модели
const top = HUD + 16;
out.push(text(16, top + 8, 'ТЯГАЧ', 9, C.accent2, { ls: 2.4, weight: 700 }));
out.push(text(16, top + 36, 'ATLAS Vision 4×2', 26, C.ink, { weight: 800, ls: -0.4 }));
out.push(text(16, top + 56, 'МАГИСТРАЛЬНЫЙ ТРУДЯГА С ВЫСОКОЙ КАБИНОЙ', 10, C.inkDim, { ls: 1.4, weight: 600 }));
if (!SMALL) {
  const b1 = 'СНАРУЖИ';
  const b2 = '76 512 ПОЛИГОНОВ';
  const w1 = textWidth(b1, 10, 600) + 18;
  out.push(rect(W - 16 - w1, top, w1, 22, 999, 'rgba(8,10,9,0.66)', `stroke="rgba(232,180,90,0.45)"`));
  out.push(text(W - 16 - w1 / 2, top + 15, b1, 10, C.accent2, { anchor: 'middle', weight: 600, ls: 1.2 }));
  const w2 = textWidth(b2, 10, 600) + 18;
  out.push(rect(W - 16 - w2, top + 28, w2, 22, 999, 'rgba(8,10,9,0.66)', `stroke="rgba(255,255,255,0.12)"`));
  out.push(text(W - 16 - w2 / 2, top + 43, b2, 10, C.inkDim, { anchor: 'middle', weight: 600, ls: 1 }));
}

// ---------------- полоса инструментов камеры
const acts = ['orbit', 'reset', 'driver', 'damage', 'compare'];
const actW = acts.length * 36 + (acts.length - 1) * 6 + 10;
const actX = W - 16 - actW;
const actY = HUD + 58;
out.push(rect(actX, actY, actW, 46, 13, 'rgba(9,11,10,0.72)', `stroke="${C.line}"`));
acts.forEach((a, i) => {
  const x = actX + 5 + i * 42;
  const on = i === 0;
  out.push(rect(x, actY + 5, 36, 36, 10, on ? 'rgba(232,180,90,0.16)' : 'transparent', `stroke="${on ? 'rgba(232,180,90,0.45)' : C.line}"`));
  out.push(iconAt(a, x + 10, actY + 15, 16, on ? C.accent2 : C.inkDim));
});

// ---------------- док видов
const dockY = H - FOOT - 14 - 46;
const dockParts = [];
for (const gr of [
  { g: 'СНАРУЖИ', items: ['Снаружи', 'Борт', 'Сзади'], on: 0 },
  { g: 'ВНУТРИ', items: ['Место водителя', 'Спальное место'], on: -1 },
]) {
  dockParts.push({ t: gr.g, eyebrow: true });
  gr.items.forEach((it, i) => dockParts.push({ t: it, on: gr.on === i }));
}
const partW = (p) => (p.eyebrow ? textWidth(p.t, 8.5, 700, 1.6) + 14 : textWidth(p.t, 11.5, 600) + 22);
const dockW = 12 + dockParts.reduce((a, p) => a + partW(p) + 5, 0);
if (!SMALL) {
  out.push(rect(14, dockY, dockW, 46, 12, 'rgba(9,11,10,0.72)', `stroke="${C.line}"`));
  let x = 14 + 6;
  for (const p of dockParts) {
    const w = partW(p);
    if (p.eyebrow) {
      out.push(text(x + 4, dockY + 27, p.t, 8.5, C.inkFaint, { weight: 700, ls: 1.6 }));
    } else {
      if (p.on) out.push(rect(x, dockY + 6, w, 34, 9, C.surface2, `stroke="rgba(232,180,90,0.5)"`));
      out.push(text(x + w / 2, dockY + 29, p.t, 11.5, p.on ? C.accent2 : C.inkDim, { anchor: 'middle', weight: 600 }));
    }
    x += w + 5;
  }
}

// ---------------- навпад (3×3 по 40 px, как в CSS)
if (!SMALL) {
  const cell = 40;
  const g = 6;
  const size = 3 * cell + 2 * g;
  const nx = W - 16 - size;
  const ny = H - FOOT - 16 - size;
  const cells = [
    [1, 0, '↑', false], [2, 0, '+', false],
    [0, 1, '←', false], [1, 1, '⌂', true], [2, 1, '→', false],
    [1, 2, '↓', false], [2, 2, '−', false],
  ];
  for (const [cx, cy, glyph, home] of cells) {
    const x = nx + cx * (cell + g);
    const y = ny + cy * (cell + g);
    out.push(rect(x, y, cell, cell, 12, 'rgba(10,13,14,0.62)', `stroke="${C.line}"`));
    out.push(text(x + cell / 2, y + cell / 2 + 6, glyph, 16, home ? C.accent2 : C.inkDim, { anchor: 'middle' }));
  }
}

// ---------------- нижняя панель
out.push(rect(0, H - FOOT, W, FOOT, 0, 'rgba(9,11,10,0.9)'));
out.push(`<line x1="0" y1="${H - FOOT + 0.5}" x2="${W}" y2="${H - FOOT + 0.5}" stroke="${C.line}" stroke-width="1"/>`);
out.push(text(16, H - FOOT / 2 + 4, SMALL ? 'ТЯГАЧИ' : 'ТЯГАЧИ · 10 МОДЕЛЕЙ', 10, C.inkDim, { ls: 1.8, weight: 600 }));
const cw = 132;
const cyF = H - FOOT + 17;
out.push(rect(W / 2 - cw / 2, cyF, cw, 30, 9, C.surface, `stroke="${C.line}"`));
out.push(text(W / 2 - cw / 2 + 20, cyF + 20, '‹', 16, C.inkDim, { anchor: 'middle' }));
out.push(text(W / 2, cyF + 20, '1 / 10', 12, C.ink, { anchor: 'middle', weight: 600 }));
out.push(text(W / 2 + cw / 2 - 20, cyF + 20, '›', 16, C.inkDim, { anchor: 'middle' }));
if (!SMALL) out.push(text(W - 16, H - FOOT / 2 + 4, '64 модели · 10 / 20 / 10 / 24 · v2.2', 10, C.inkFaint, { anchor: 'end' }));

// ---------------- тост «что произошло»
if (!SMALL) {
  const t = 'Вмятина: левая дверь кабины';
  const tw = textWidth(t, 11.5, 500) + 28;
  const toastY = H - FOOT - 92;
  out.push(rect(W / 2 - tw / 2, toastY, tw, 30, 999, 'rgba(9,11,10,0.92)', `stroke="${C.line}"`));
  out.push(text(W / 2, toastY + 20, t, 11.5, C.ink, { anchor: 'middle', weight: 500 }));
}

// ---------------- ОКНО «ПОВРЕЖДЕНИЯ» ПО ЦЕНТРУ
out.push(rect(0, HUD, W, H - HUD, 0, 'rgba(4,6,7,0.58)'));

const zones = [
  { t: 'Кабина и крыша', n: '0 из 6', items: [['левая дверь кабины', 'сильное', 'dent'], ['правая дверь кабины', 'сильное', 'crack'], ['левая боковина кабины', 'среднее', 'rust'], ['правая боковина кабины', 'среднее', 'scratch'], ['правая задняя стенка кабины', 'сильное', 'dent'], ['крыша кабины', 'сильное', 'rust']] },
  { t: 'Перед и корма', n: '0 из 2', items: [['правый передний бампер', 'среднее', 'scratch'], ['левый передний бампер', 'лёгкое', 'dent']] },
  { t: 'Рама, низ и бак', n: '0 из 7', items: [['левый порог кабины', 'лёгкое', 'rust'], ['правая боковина бака', 'лёгкое', 'scratch'], ['седло', 'сильное', 'crack']] },
];
const NARROW = W < 900;
const DW = Math.min(820, W - (NARROW ? 16 : 40));
const DX = Math.round((W - DW) / 2);
const pad = 12;
const inner = pad;
const iw = DW - pad * 2;
const headH = NARROW ? 70 : 76;
const pvH = NARROW ? 124 : 176;
const placeH = 32;
const noteH = NARROW ? 52 : 44;
const rowH = NARROW ? 38 : 40;

// считаем содержимое в локальных координатах, потом центрируем всю группу
const ops = [];
let y = 0;

ops.push(text(inner + 8, y + 33, 'Повреждения', NARROW ? 18 : 20, C.ink, { weight: 700, ls: -0.3 }));
if (!NARROW) ops.push(text(inner + 8, y + 55, 'тип → место на кузове', 12, C.inkFaint));
const cntW = textWidth('0 / 15', 11.5, 600) + 20;
const cntX = DW - 12 - 34 - 8 - cntW;
ops.push(rect(cntX, y + 20, cntW, 23, 999, C.surface, `stroke="${C.line}"`));
ops.push(text(cntX + cntW / 2, y + 36, '0 / 15', 11.5, C.inkDim, { anchor: 'middle', weight: 600 }));
ops.push(iconAt('close', DW - 46 + 9, y + 23, 16, C.inkDim));
ops.push(`<line x1="${inner}" y1="${y + headH - 9.5}" x2="${inner + iw}" y2="${y + headH - 9.5}" stroke="rgba(255,255,255,0.07)"/>`);
y += headH;

// окно предпросмотра: живой кадр сцены, повторяющий ракурс
const pvX = inner + 8;
const pvW = iw - 16;
ops.push('<defs><clipPath id="ppclip"><rect x="' + pvX + '" y="' + (y + 4) + '" width="' + pvW
  + '" height="' + pvH + '" rx="9"/></clipPath></defs>');
if (PREVIEW && fs.existsSync(PREVIEW)) {
  const b64p = fs.readFileSync(PREVIEW).toString('base64');
  ops.push('<image x="' + pvX + '" y="' + (y + 4) + '" width="' + pvW + '" height="' + pvH
    + '" preserveAspectRatio="xMidYMid slice" clip-path="url(#ppclip)" href="data:image/png;base64,' + b64p + '"/>');
}
ops.push(rect(pvX, y + 4, pvW, pvH, 9, 'none', 'stroke="rgba(255,255,255,0.09)"'));
ops.push(text(pvX + 2, y + pvH + 24, 'ATLAS Vision 4×2', 12.5, C.ink, { weight: 600 }));
ops.push(text(pvX + 12 + textWidth('ATLAS Vision 4×2', 12.5, 700) + 22, y + pvH + 24,
  'Снаружи · Студия', 11, C.inkFaint));
y += pvH + 30;

ops.push(text(inner + 8, y + 17, 'Тип дефекта', 13, C.ink, { weight: 600 }));
y += 26;
const kinds = [
  { t: 'Любое', c: '#ffb27a', on: true }, { t: 'Вмятина', c: '#8f9daa' }, { t: 'Царапина', c: '#d7dee3' },
  { t: 'Ржавчина', c: '#b8642c' }, { t: 'Трещина', c: '#59697a' },
];
const gapK = 8;
const perRow = NARROW ? 3 : 5;
const tileH = NARROW ? 50 : 56;
const cellW = (iw - 16 - gapK * (perRow - 1)) / perRow;
kinds.forEach((k, i) => {
  const x = inner + 8 + (i % perRow) * (cellW + gapK);
  const ty = y + Math.floor(i / perRow) * (tileH + gapK);
  ops.push(rect(x, ty, cellW, tileH, 11, k.on ? 'rgba(232,180,90,0.16)' : 'rgba(255,255,255,0.03)',
    `stroke="${k.on ? 'rgba(232,180,90,0.45)' : 'rgba(255,255,255,0.06)'}"`));
  ops.push(`<circle cx="${x + cellW / 2}" cy="${ty + (NARROW ? 17 : 20)}" r="5.5" fill="${k.c}" stroke="rgba(0,0,0,0.35)"/>`);
  ops.push(text(x + cellW / 2, ty + (NARROW ? 39 : 44), k.t, NARROW ? 11.5 : 12.5, k.on ? C.accent2 : C.inkDim, { anchor: 'middle', weight: 600 }));
});
y += Math.ceil(kinds.length / perRow) * (tileH + gapK) + 5;
ops.push(`<line x1="${inner}" y1="${y + 0.5}" x2="${inner + iw}" y2="${y + 0.5}" stroke="rgba(255,255,255,0.07)"/>`);
y += 7;

ops.push(text(inner + 8, y + 18, 'Куда ставить', 13, C.ink, { weight: 600 }));
let mx = DW - inner - 8;
for (const label of ['все', 'ничего']) {
  const w = textWidth(label, 11, 600) + 18;
  mx -= w;
  ops.push(rect(mx, y + 3, w, 22, 8, C.surface, `stroke="${C.line}"`));
  ops.push(text(mx + w / 2, y + 18, label, 11, C.inkDim, { anchor: 'middle', weight: 600 }));
  mx -= 6;
}
y += placeH;

const colW = NARROW ? iw - 16 : (iw - 16 - 18) / 2;
const drawZone = (z, x0, yy) => {
  ops.push(text(x0 + 2, yy + 20, '▾', 9, C.inkFaint, { weight: 700 }));
  ops.push(text(x0 + 18, yy + 20, z.t, 13, C.inkDim, { weight: 600 }));
  ops.push(text(x0 + colW - 2, yy + 20, z.n, 11, 'rgba(255,122,82,0.85)', { anchor: 'end', weight: 600 }));
  let ly = yy + 34;
  for (const [name, sev, kind] of z.items) {
    const dot = { dent: '#8f9daa', scratch: '#d7dee3', rust: '#b8642c', crack: '#59697a' }[kind];
    ops.push(`<circle cx="${x0 + 12}" cy="${ly + 18}" r="4.5" fill="${dot}" stroke="rgba(0,0,0,0.3)"/>`);
    ops.push(text(x0 + 26, ly + 23, name, 14, C.inkDim));
    ops.push(text(x0 + colW - 2, ly + 23, sev, 11, C.inkFaint, { anchor: 'end' }));
    ly += rowH;
  }
  return ly;
};
const colX = [inner + 8, inner + 8 + colW + 18];
const ends = [0, 0];
// раскладка: «кабина» и «перед/корма» слева, «рама» справа
const plan = NARROW ? [[zones[0], zones[1], zones[2]]] : [[zones[0]], [zones[1], zones[2]]];
plan.forEach((col, ci) => {
  let ly = y;
  for (const z of col) { ly = drawZone(z, colX[ci], ly) + 8; }
  ends[ci] = ly - 8;
});
y = Math.max(...ends);
ops.push(text(inner + 8, y + 22, NARROW ? 'Выбери тип — дефект встанет на свободную деталь.' : 'Выбери тип — дефект встанет на свободную деталь. Или ткни конкретное место.', 12, C.inkFaint));
y += noteH;

const menuH = y;
const avail = H - HUD - 20;
const DY = Math.round(HUD + 10 + Math.max(0, (avail - menuH) / 2));

out.push(`<defs><linearGradient id="pop" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#1b1f1e"/><stop offset="1" stop-color="#0e1010"/></linearGradient>
  <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="0" dy="26" stdDeviation="28" flood-color="#000" flood-opacity="0.8"/></filter></defs>`);
out.push(`<g transform="translate(${DX},${DY})"><g filter="url(#shadow)">${rect(0, 0, DW, menuH, 18, 'url(#pop)', `stroke="rgba(255,255,255,0.1)"`)}</g>${ops.join('')}</g>`);

out.push('</svg>');
const svg = out.join('\n');
const png = new Resvg(svg, { font: { loadSystemFonts: true, defaultFontFamily: FONT }, fitTo: { mode: 'width', value: W } })
  .render().asPng();
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, png);
console.log('ok', OUT, `${W}×${H}`);
