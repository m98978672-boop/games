// Собирает контактный лист из нескольких ракурсов:
//   node tools/montage.mjs --list trucks|trailers|cars|buildings --view exterior --out sheet.png
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { TRUCKS, TRAILERS, CARS, BUILDINGS } from '../src/data/units.js';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, c, i, arr) => {
  if (c.startsWith('--')) a.push([c.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return a;
}, []));
const listName = args.list || 'trucks';
const view = args.view || 'exterior';
const out = args.out || '/tmp/prev/sheet.png';
const cell = Number(args.cell || 480);
const cols = Number(args.cols || 3);
const list = listName === 'trucks' ? TRUCKS
  : listName === 'trailers' ? TRAILERS
    : listName === 'buildings' ? BUILDINGS
      : CARS;
const cat = listName;
const dir = '/tmp/prev/cells';
fs.mkdirSync(dir, { recursive: true });
const files = [];
list.forEach((u, i) => {
  const f = path.join(dir, `${cat}-${u.id}.png`);
  const extra = args.damage ? ['--damage', 'true'] : [];
  execFileSync('node', ['tools/render.mjs', '--cat', cat, '--id', u.id, '--view', view, '--w', String(cell), '--h', String(Math.round(cell * 0.66)), '--out', f, ...extra], { stdio: 'ignore' });
  files.push({ f, name: u.name });
});
const cw = cell, ch = Math.round(cell * 0.66);
const rows = Math.ceil(files.length / cols);
const png = new PNG({ width: cw * cols, height: ch * rows });
png.data.fill(20);
files.forEach((it, i) => {
  const img = PNG.sync.read(fs.readFileSync(it.f));
  const ox = (i % cols) * cw, oy = Math.floor(i / cols) * ch;
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    const si = ((y * cw) + x) * 4, di = (((oy + y) * png.width) + ox + x) * 4;
    png.data[di] = img.data[si]; png.data[di+1] = img.data[si+1]; png.data[di+2] = img.data[si+2]; png.data[di+3] = 255;
  }
  // подпись-полоска
  for (let y = ch - 26; y < ch; y++) for (let x = 0; x < cw; x++) {
    const di = (((oy + y) * png.width) + ox + x) * 4;
    png.data[di] = 12; png.data[di+1] = 14; png.data[di+2] = 15;
  }
});
fs.writeFileSync(out, PNG.sync.write(png));
console.log('sheet', out, `${cw*cols}x${ch*rows}`, files.length, 'cells');
console.log(files.map((f,i)=>`${i}: ${f.name}`).join('\n'));
