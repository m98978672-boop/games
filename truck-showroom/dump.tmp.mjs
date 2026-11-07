import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
const ROOT = '/home/user/games/truck-showroom';
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'http://localhost:8080/truck-showroom/', runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
const noop = () => {};
window.HTMLCanvasElement.prototype.getContext = function (t) {
  if (t === 'webgl' || t === 'webgl2') return null;
  return { canvas: this, fillStyle: '', strokeStyle: '', lineWidth: 1, font: '', textAlign: '', textBaseline: '', globalAlpha: 1,
    fillRect: noop, strokeRect: noop, clearRect: noop, beginPath: noop, closePath: noop, moveTo: noop, lineTo: noop, arc: noop,
    ellipse: noop, bezierCurveTo: noop, quadraticCurveTo: noop, stroke: noop, fill: noop, save: noop, restore: noop, translate: noop,
    rotate: noop, scale: noop, fillText: noop, strokeText: noop, measureText: () => ({ width: 10 }),
    createLinearGradient: () => ({ addColorStop: noop }), createRadialGradient: () => ({ addColorStop: noop }),
    getImageData: () => ({ data: new Uint8ClampedArray(4) }), putImageData: noop, drawImage: noop };
};
window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
window.matchMedia = window.matchMedia || ((q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }));
console.warn = () => {};
window.eval(fs.readFileSync(path.join(ROOT, 'showroom.bundle.js'), 'utf8'));
const D = window.document;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(600);
D.getElementById('menu-damage-btn').click();
await wait(120);
const menu = D.getElementById('menu-damage');
console.log('HEAD:', menu.querySelector('.pop-head').textContent.trim().replace(/\s+/g, ' '));
console.log('TYPES:', [...menu.querySelectorAll('.dmg-type')].map((b) => b.textContent.trim()).join(' | '));
for (const g of menu.querySelectorAll('.dmg-group')) {
  console.log('  ZONE', g.querySelector('.dmg-group-t').textContent.trim().replace(/\s+/g, ' '));
  console.log('     ', [...g.querySelectorAll('.dmg-place')].map((b) => b.querySelector('.dmg-place-name').textContent).join(', '));
}
console.log('TOOLS:', D.getElementById('damage-all').textContent, '/', D.getElementById('damage-clear').textContent);
D.getElementById('menu-view-btn').click(); await wait(80);
for (const s of D.querySelectorAll('#menu-view-row .view-sec')) {
  console.log('VIEW', s.querySelector('.view-sec-t').textContent, '→', [...s.querySelectorAll('.pop-item')].map((b) => b.textContent.trim()).join(', '));
}
