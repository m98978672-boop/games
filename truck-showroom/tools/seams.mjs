// ============================================================
// БОТ СТЫКОВ: проходит по всем моделям шоурума и ищет дырки на швах.
// Стык считается закрытым, если открытый контур поверхности упирается
// в соседнюю деталь с зазором меньше 2 см (по умолчанию).
//
//   node tools/seams.mjs                     — все 64 модели, таблица
//   node tools/seams.mjs --cat trucks        — только тягачи
//   node tools/seams.mjs --id atlas-vision --cat trucks --details
//   node tools/seams.mjs --md                — markdown (для GitHub Actions)
//   node tools/seams.mjs --json /tmp/seams.json
//   node tools/seams.mjs --strict            — код возврата 1, если есть дырки
// ============================================================
import fs from 'node:fs';
import { createMaterials } from '../src/lib/kit.js';
import { buildUnit } from '../src/models/index.js';
import { CATEGORIES, TRUCKS, TRAILERS, CARS, BUILDINGS } from '../src/data/units.js';
import { analyzeSeams } from '../src/lib/seams.js';

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (!a.startsWith('--')) continue;
  const next = process.argv[i + 1];
  args[a.slice(2)] = next && !next.startsWith('--') ? (i++, next) : 'true';
}

const LISTS = { trucks: TRUCKS, trailers: TRAILERS, cars: CARS, buildings: BUILDINGS };
const cats = args.cat ? String(args.cat).split(',') : CATEGORIES.map((c) => c.id);
const onlyId = args.id || null;
const gap = args.gap ? Number(args.gap) : 0.02;
const M = createMaterials(null);

const rows = [];
const started = Date.now();
for (const cat of cats) {
  const list = LISTS[cat] || [];
  for (const unit of list) {
    if (onlyId && unit.id !== onlyId) continue;
    const built = buildUnit({ ...unit, category: cat }, M);
    let rep;
    try {
      rep = analyzeSeams(built.root, { gap });
    } catch (err) {
      rows.push({ cat, id: unit.id, name: unit.name, error: String(err.message || err) });
      continue;
    }
    rows.push({ cat, id: unit.id, name: unit.name, rep });
  }
}

const bad = rows.filter((r) => r.error || r.rep?.holeCount);
const totalHoles = rows.reduce((s, r) => s + (r.rep?.holeCount || 0), 0);
const totalSeen = rows.reduce((s, r) => s + (r.rep?.exposedCount || 0), 0);
const worst = [...rows].filter((r) => r.rep?.holeCount)
  .sort((a, b) => (b.rep.holes[0]?.maxGap || 0) - (a.rep.holes[0]?.maxGap || 0));

const fmtMm = (v) => (v == null ? '—' : `${Math.round(v * 1000)} мм`);

// ---------------------------------------------------------- подробности по модели
if (args.details) {
  for (const r of rows) {
    if (r.error) { console.log(`\n${r.cat}/${r.id} — ОШИБКА СБОРКИ: ${r.error}`); continue; }
    const rep = r.rep;
    console.log(`\n=== ${r.cat}/${r.id} — ${r.name}`);
    console.log(`треугольников ${rep.tris}, открытых рёбер ${rep.edges}, контуров ${rep.loops}`);
    console.log(`незакрытых стыков ${rep.holeCount} (из них на виду ${rep.exposedCount || 0}), плотных швов ${rep.seamCount}, открытых краёв ${rep.openCount}`);
    for (const h of rep.holes) {
      console.log(`  ДЫРКА${h.exposed ? ' (на виду)' : ' (внутри)'} ${fmtMm(h.maxGap)} · ${h.mesh}${h.neighbour && h.neighbour !== h.mesh ? ' ↔ ' + h.neighbour : ''}`
        + ` · ${h.edges} рёбер, длина ${h.length} м · центр ${h.center.join(', ')}`);
    }
    for (const s of rep.seams.slice(0, 3)) {
      console.log(`  шов ${fmtMm(s.maxGap)} · ${s.mesh} ↔ ${s.neighbour || '—'} · центр ${s.center.join(', ')}`);
    }
  }
}

// ---------------------------------------------------------- markdown для CI
if (args.md) {
  const lines = [];
  lines.push('## Бот стыков: отчёт');
  lines.push('');
  lines.push(`Проверено моделей: **${rows.length}** · стыков с зазором шире ${Math.round(gap * 1000)} мм: **${totalHoles}** · из них на виду: ${totalSeen}`);
  lines.push('');
  if (bad.length) {
    lines.push('| модель | дырок | худший зазор | где |');
    lines.push('| --- | ---: | ---: | --- |');
    for (const r of worst.slice(0, 12)) {
      const h = r.rep.holes[0];
      lines.push(`| ${r.cat}/${r.id} | ${r.rep.holeCount} | ${fmtMm(h.maxGap)} | ${h.mesh} · ${h.center.join(', ')} |`);
    }
  } else {
    lines.push(`Незакрытых стыков нет.`);
  }
  lines.push('');
  lines.push(`<sub>${(Date.now() - started) / 1000} с</sub>`);
  if (args.md !== 'true' && String(args.md).endsWith('.md')) {
    fs.writeFileSync(args.md, lines.join('\n'));
    console.log(`markdown: ${args.md}`);
  } else {
    console.log(lines.join('\n'));
  }
}

// ---------------------------------------------------------- JSON
if (args.json) {
  fs.writeFileSync(args.json, JSON.stringify({
    when: new Date().toISOString(),
    gap,
    checked: rows.length,
    holes: totalHoles,
    models: rows.map((r) => ({
      cat: r.cat, id: r.id, name: r.name, error: r.error || null,
      tris: r.rep?.tris || 0,
      holes: r.rep?.holes || [],
      holeCount: r.rep?.holeCount || 0,
      slitCount: r.rep?.slitCount || 0,
      slits: r.rep?.slits || [],
      seamCount: r.rep?.seamCount || 0,
      openCount: r.rep?.openCount || 0,
    })),
  }, null, 2));
}

// ---------------------------------------------------------- таблица в консоль
if (!args.details) {
  console.log('модель                       края  на виду   щели   швы  худший зазор');
  for (const r of rows) {
    if (r.error) { console.log(`${(r.cat + '/' + r.id).padEnd(28)}  ОШИБКА ${r.error}`); continue; }
    const rep = r.rep;
    const name = `${r.cat}/${r.id}`.padEnd(28);
    const h = rep.holes[0]?.maxGap;
    console.log(`${name} ${String(rep.openCount).padStart(5)} ${String(rep.exposedCount || 0).padStart(7)}`
      + ` ${String(rep.holeCount).padStart(6)} ${String(rep.seamCount).padStart(6)}  ${h ? fmtMm(h) : '—'}`);
  }
}

console.log(`\nИтого: моделей ${rows.length}, дырок ${totalHoles}, `
  + `с проблемами ${bad.length}, ${((Date.now() - started) / 1000).toFixed(1)} с`);
if (bad.length) {
  console.log('Худшие:');
  for (const r of worst.slice(0, 5)) {
    console.log(`  ${r.cat}/${r.id}: ${r.rep.holeCount} шт, до ${fmtMm(r.rep.holes[0].maxGap)}`
      + ` — ${r.rep.holes[0].mesh} в точке ${r.rep.holes[0].center.join(', ')}`);
  }
}

if (args.strict === 'true' && bad.length) process.exit(1);
