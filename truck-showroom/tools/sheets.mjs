// ============================================================
// tools/sheets.mjs — листы «со всех сторон» для всех моделей каталога.
// Для каждой модели запускает tools/sides.mjs в нужном виде (точки/меш/оба).
//   node tools/sheets.mjs --look both --outdir /home/user/shots/sides
//   node tools/sheets.mjs --cat buildings --look mesh --cell 340
// ============================================================
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { TRUCKS, TRAILERS, CARS, BUILDINGS } from '../src/data/units.js';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, c, i, arr) => {
  if (c.startsWith('--')) a.push([c.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return a;
}, []));

const outdir = args.outdir || '/home/user/shots/sides';
const cell = Number(args.cell || 340);
const lookArg = args.look || 'both';
const looks = lookArg === 'both' ? ['dots', 'mesh'] : [lookArg];
const lists = {
  trucks: TRUCKS, trailers: TRAILERS, cars: CARS, buildings: BUILDINGS,
};
const cats = args.cat ? [args.cat] : Object.keys(lists);
fs.mkdirSync(outdir, { recursive: true });

const started = Date.now();
let done = 0;
const total = cats.reduce((s, c) => s + lists[c].length * looks.length, 0);
for (const cat of cats) {
  for (const u of lists[cat]) {
    for (const look of looks) {
      const out = path.join(outdir, `${cat}-${u.id}-${look}.png`);
      if (args.skip === 'true' && fs.existsSync(out)) { done += 1; continue; }
      // здания крупные: им нужна плотнее сетка и больше точек, иначе окна «заплывают»
      // облако должно быть гуще сетки: у длинных прицепов и зданий иначе
      // стенки получаются «кружевом», а не поверхностью
      const preset = {
        buildings: { target: 130000, res: 100 },
        trailers: { target: 120000, res: 100 },
        trucks: { target: 56000, res: 84 },
        cars: { target: 56000, res: 84 },
      }[cat] || { target: 56000, res: 84 };
      const pass = [
        'tools/sides.mjs', '--cat', cat, '--id', u.id, '--look', look,
        '--cell', String(cell),
        '--dotstarget', String(args.dotstarget || preset.target),
        '--out', out,
      ];
      if (look === 'dots') pass.push('--dots', 'true');
      if (look === 'mesh') pass.push('--res', String(args.res || preset.res));
      try {
        execFileSync('node', pass, { stdio: 'ignore' });
      } catch (e) {
        console.log('fail', cat, u.id, look, e.message.split('\n')[0]);
      }
      done += 1;
      const el = (Date.now() - started) / 1000;
      console.log(`${done}/${total} ${cat}/${u.id} ${look} · ${el.toFixed(0)} с, осталось ~${((el / done) * (total - done)).toFixed(0)} с`);
    }
  }
}
console.log('готово', done, 'листов в', outdir, ((Date.now() - started) / 1000).toFixed(0), 'с');
