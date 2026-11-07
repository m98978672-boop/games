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
const btnH = 36;
const btnW = (b) => {
  if (!b.label) return 40;
  const badge = b.badge ? 7 + textWidth(b.badge, 10, 600) + 12 : 0;
  return 12 + 16 + 7 + textWidth(b.label, 12, 600) + badge + 12;
};
const navW = NAV.reduce((s, b) => s + btnW(b), 0) + gap * (NAV.length - 1);
let bx = W - padX - navW;
const navPos = {};
for (const b of NAV) {
  const w = btnW(b);
  navPos[b.id] = { x: bx, y: 9, w, h: btnH };
  const open = !!b.open;
  if (open) {
    out.push(rect(bx, 9, w, btnH, 10, 'rgba(232,180,90,0.13)', `stroke="rgba(232,180,90,0.45)"`));
    out.push(rect(bx + 1, 9 + btnH - 2, w - 2, 2, 1, C.accent));
  } else {
    out.push(rect(bx, 9, w, btnH, 10, C.surface, `stroke="${C.line}"`));
  }
  const color = open ? C.accent2 : C.inkDim;
  out.push(iconAt(b.id, bx + 11, 9 + 10, 16, color));
  let tx = bx + 34;
  if (b.label) {
    out.push(text(tx, 31, b.label, 12, color, { weight: 600 }));
    tx += textWidth(b.label, 12, 600) + 8;
  }
  if (b.badge) {
    const bw = textWidth(b.badge, 10, 600) + 12;
    out.push(rect(tx, 20, bw, 15, 999, open ? 'rgba(232,180,90,0.2)' : 'rgba(0,0,0,0.28)'));
    out.push(text(tx + bw / 2, 31, b.badge, 10, open ? C.accent2 : C.inkFaint, { weight: 600, anchor: 'middle' }));
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
if (!SMALL) out.push(text(W - 16, H - FOOT / 2 + 4, '64 модели · 10 / 20 / 10 / 24 · v2.1', 10, C.inkFaint, { anchor: 'end' }));

// ---------------- ОТКРЫТОЕ МЕНЮ «ПОВРЕЖДЕНИЯ»
const M = { y: HUD + 8, w: Math.min(430, W - 20) };
M.x = SMALL ? 10 : Math.max(10, Math.min(W - M.w - 16, navPos.damage.x + navPos.damage.w - M.w));
const pad = 7;
const inner = M.x + pad;
const iw = M.w - pad * 2;

const zones = [
  { t: 'Кабина и крыша', n: '0 из 6', items: [['левая дверь кабины', 'сильное'], ['правая дверь кабины', 'сильное'], ['левая боковина кабины', 'среднее'], ['правая боковина кабины', 'среднее'], ['правая задняя стенка кабины', 'сильное'], ['крыша кабины', 'сильное']] },
  { t: 'Перед и корма', n: '0 из 2', items: [['правый передний бампер', 'среднее'], ['левый передний бампер', 'лёгкое']] },
  { t: 'Рама, низ и бак', n: '0 из 7', items: [['левый порог кабины', 'лёгкое'], ['правая боковина бака', 'лёгкое'], ['седло', 'сильное']] },
];

const headH = 44;
const kindH = 22 + 44 + 8;
const placeH = 30 + zones.reduce((a, z) => a + 26 + z.items.length * 32 + 6, 0);
const noteH = 52;
const menuH = headH + kindH + placeH + noteH;

out.push(`<defs><linearGradient id="pop" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="rgba(24,28,27,0.99)"/><stop offset="1" stop-color="rgba(12,14,14,0.99)"/></linearGradient>
  <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity="0.72"/></filter></defs>`);
out.push(`<g filter="url(#shadow)">${rect(M.x, M.y, M.w, menuH, 16, 'url(#pop)', `stroke="rgba(255,255,255,0.09)"`)}</g>`);
let y = M.y;

// шапка
out.push(text(inner + 10, y + 28, 'Повреждения', 13.5, C.ink, { weight: 700 }));
const cnt = '0 / 15';
const cntW = textWidth(cnt, 9.5, 600) + 16;
const cntX = M.x + M.w - 8 - 26 - 6 - cntW;
out.push(rect(cntX, y + 13, cntW, 19, 999, C.surface, `stroke="${C.line}"`));
out.push(text(cntX + cntW / 2, y + 26.5, cnt, 9.5, C.inkFaint, { anchor: 'middle', weight: 600 }));
out.push(iconAt('close', M.x + M.w - 8 - 26 + 6.5, y + 16.5, 13, C.inkFaint));
out.push(`<line x1="${inner}" y1="${y + 41.5}" x2="${inner + iw}" y2="${y + 41.5}" stroke="rgba(255,255,255,0.07)"/>`);
y += headH;

// тип дефекта — один ряд из пяти
out.push(text(inner + 9, y + 18, 'Тип дефекта', 11, C.inkDim, { weight: 600 }));
y += kindH - 44 - 8 + 2;
const kinds = [
  { t: 'Любое', c: '#ffb27a', on: true }, { t: 'Вмятина', c: '#8f9daa' }, { t: 'Царапина', c: '#d7dee3' },
  { t: 'Ржавчина', c: '#b8642c' }, { t: 'Трещина', c: '#59697a' },
];
const gapK = 4;
const cellW = (iw - 4 - gapK * 4) / 5;
kinds.forEach((k, i) => {
  const x = inner + 2 + i * (cellW + gapK);
  out.push(rect(x, y, cellW, 44, 9, k.on ? 'rgba(232,180,90,0.16)' : 'rgba(255,255,255,0.03)',
    `stroke="${k.on ? 'rgba(232,180,90,0.45)' : 'rgba(255,255,255,0.06)'}"`));
  out.push(`<circle cx="${x + cellW / 2}" cy="${y + 15}" r="5" fill="${k.c}" stroke="rgba(0,0,0,0.35)"/>`);
  out.push(text(x + cellW / 2, y + 34, k.t, 10.5, k.on ? C.accent2 : C.inkDim, { anchor: 'middle', weight: 600 }));
});
y += 44 + 8;
out.push(`<line x1="${inner}" y1="${y + 0.5}" x2="${inner + iw}" y2="${y + 0.5}" stroke="rgba(255,255,255,0.07)"/>`);
y += 6;

// место на кузове + «все / ничего»
out.push(text(inner + 9, y + 16, 'Место на кузове', 11, C.inkDim, { weight: 600 }));
let mx = inner + iw - 2;
for (const label of ['✕ ничего', '✷ все'].reverse()) {
  const w = textWidth(label, 9.5, 600) + 15;
  mx -= w;
  out.push(rect(mx, y + 4, w, 19, 7, C.surface, `stroke="${C.line}"`));
  out.push(text(mx + w / 2, y + 17.5, label, 9.5, C.inkDim, { anchor: 'middle', weight: 600 }));
  mx -= 4;
}
y += 30;

zones.forEach((z, zi) => {
  out.push(text(inner + 8, y + 17, '▾', 8, C.inkFaint, { weight: 700 }));
  out.push(text(inner + 21, y + 17, z.t, 11, C.inkDim, { weight: 600 }));
  out.push(text(inner + iw - 8, y + 17, z.n, 10, 'rgba(255,122,82,0.85)', { anchor: 'end', weight: 600 }));
  y += 26;
  z.items.forEach(([name, sev], i) => {
    const kind = ['dent', 'scratch', 'rust', 'crack'][(zi + i) % 4];
    const dot = { dent: '#8f9daa', scratch: '#d7dee3', rust: '#b8642c', crack: '#59697a' }[kind];
    out.push(`<circle cx="${inner + 16}" cy="${y + 16}" r="4" fill="${dot}" stroke="rgba(0,0,0,0.3)"/>`);
    out.push(text(inner + 29, y + 20.5, name, 12.5, C.inkDim));
    out.push(text(inner + iw - 8, y + 20.5, sev, 9.5, C.inkFaint, { anchor: 'end' }));
    y += 32;
  });
  y += 6;
});
out.push(text(inner + 9, y + 14, 'Выбери тип — дефект появится на свободной детали.', 10.5, C.inkFaint));
out.push(text(inner + 9, y + 28, 'Или ткни в конкретное место списка.', 10.5, C.inkFaint));

// ---------------- тост «что произошло»
if (!SMALL) {
  const t = 'Вмятина: левая дверь кабины';
  const tw = textWidth(t, 11.5, 500) + 28;
  const toastY = H - FOOT - 92;
  out.push(rect(W / 2 - tw / 2, toastY, tw, 30, 999, 'rgba(9,11,10,0.92)', `stroke="${C.line}"`));
  out.push(text(W / 2, toastY + 20, t, 11.5, C.ink, { anchor: 'middle', weight: 500 }));
}

out.push('</svg>');
const svg = out.join('\n');
const png = new Resvg(svg, { font: { loadSystemFonts: true, defaultFontFamily: FONT }, fitTo: { mode: 'width', value: W } })
  .render().asPng();
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, png);
console.log('ok', OUT, `${W}×${H}`);
