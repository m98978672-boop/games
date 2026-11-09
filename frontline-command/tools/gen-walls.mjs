#!/usr/bin/env node
// Генератор контуров стен: из buildings.json (блок walls) + wall_materials.json делаем
// data/outlines/<type>.json с сегментами, проёмами, точками укрытия и слотами гарнизона.
//
// Почему генератор, а не ручная отрисовка: у наших спрайтов нет отдельного слоя стен с
// альфой (они помечены PLACEHOLDER_REPLACE), поэтому «обвод из альфы» дал бы контур картинки,
// а не геометрию. Здесь стены строятся по контуру здания из данных: это тот же результат
// (сегменты + проёмы + укрытия), но воспроизводимый и проверяемый тестами.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const buildings = read('data/buildings.json');
const wallMats = read('data/wall_materials.json');
const cover = read('data/cover.json');
const openTypes = wallMats.openings;

const OUT_DIR = path.join(ROOT, 'data/outlines');
fs.mkdirSync(OUT_DIR, { recursive: true });

const SIDES = ['north', 'east', 'south', 'west'];
const EPS = 1e-6;

function sideLengths(w, h) {
  return { north: w, east: h, south: w, west: h };
}

// Периметр по часовой стрелке, начиная с северо-западного угла.
function pointAt(side, t, w, h) {
  const hw = w / 2, hh = h / 2;
  switch (side) {
    case 'north': return { x: -hw + w * t, y: -hh };
    case 'east': return { x: hw, y: -hh + h * t };
    case 'south': return { x: hw - w * t, y: hh };
    case 'west': return { x: -hw, y: hh - h * t };
  }
  return { x: 0, y: 0 };
}

function normalAt(side) {
  switch (side) {
    case 'north': return { x: 0, y: -1 };
    case 'east': return { x: 1, y: 0 };
    case 'south': return { x: 0, y: 1 };
    case 'west': return { x: -1, y: 0 };
  }
  return { x: 0, y: 1 };
}

function round(n) { return Math.round(n * 100) / 100; }

// Разбиваем каждую сторону на участки: openings → куски стены.
function buildRing(spec, def) {
  const size = spec.wallSize || def.size;
  const w = size, h = size;
  const thickness = wallMats.materials[spec.material].thickness;
  const segments = [];
  const openings = [];
  const perSide = new Map(SIDES.map((s) => [s, []]));
  for (const op of spec.openings || []) perSide.get(op.side || 'south').push(op);

  for (const side of SIDES) {
    const len = sideLengths(w, h)[side];
    const list = (perSide.get(side) || [])
      .map((op) => {
        const typeDef = openTypes[op.type] || openTypes.door;
        const width = op.width || typeDef.width || 32;
        return { ...op, width, typeDef };
      })
      .sort((a, b) => a.t - b.t);
    // Проверяем, что проёмы не пересекаются и не выходят за сторону
    let cursor = 0;
    const cuts = [];
    for (const op of list) {
      const center = op.t * len;
      const start = Math.max(cursor, center - op.width / 2);
      const end = Math.min(len, center + op.width / 2);
      if (end - start < 8) continue;
      cuts.push({ ...op, start, end });
      cursor = end + 8; // минимум 8 px стены между проёмами
    }
    let pos = 0;
    let index = 0;
    const pushSeg = (a, b, id) => {
      if (b - a < 2) return;
      const p1 = pointAt(side, a / len, w, h);
      const p2 = pointAt(side, b / len, w, h);
      const mat = wallMats.materials[spec.material];
      segments.push({
        id: `s${segments.length}`, side, index,
        points: [[round(p1.x), round(p1.y)], [round(p2.x), round(p2.y)]],
        length: round(Math.hypot(p2.x - p1.x, p2.y - p1.y)),
        thickness, material: spec.material, texture_set: spec.texture_set || spec.material, heightClass: spec.heightClass || mat.heightClass,
        blocksMove: !!spec.blocksMove, blocksBullets: true, blocksVision: true,
        coverSides: 'both',
        hp: Math.round((mat.hpPerTile * Math.hypot(p2.x - p1.x, p2.y - p1.y)) / 32),
      });
      index++;
    };
    for (const cut of cuts) {
      pushSeg(pos, cut.start);
      const p1 = pointAt(side, cut.start / len, w, h);
      const p2 = pointAt(side, cut.end / len, w, h);
      const n = normalAt(side);
      openings.push({
        id: `o${openings.length}`, side, type: cut.type, width: round(cut.end - cut.start),
        p1: [round(p1.x), round(p1.y)], p2: [round(p2.x), round(p2.y)],
        cx: round((p1.x + p2.x) / 2), cy: round((p1.y + p2.y) / 2),
        nx: n.x, ny: n.y,
        move: !!cut.typeDef.move, bullets: cut.typeDef.bullets, vision: cut.typeDef.vision,
        visionFactor: cut.typeDef.visionFactor ?? 1, shoot: !!cut.typeDef.shoot,
        arc: cut.typeDef.arc ?? null,
        state: cut.type === 'door' || cut.type === 'gate' ? 'open' : (cut.type === 'door_closed' ? 'closed' : 'fixed'),
        breakHp: cut.typeDef.breakHp ?? Math.round((wallMats.materials[spec.material].hpPerTile || 100) / 2),
      });
      pos = cut.end;
    }
    pushSeg(pos, len);
  }
  return { size, w, h, thickness, segments, openings };
}

// Низкая стена-укрытие (мешки, гнёзда, вышка): один сегмент-линия, движение не блокирует.
function buildCoverLine(spec, def) {
  const size = spec.wallSize || def.size;
  const mat = wallMats.materials[spec.material];
  const half = size / 2;
  const p1 = { x: -half, y: 0 }, p2 = { x: half, y: 0 };
  return {
    size, w: size, h: size, thickness: mat.thickness,
    segments: [{
      id: 's0', side: 'south', index: 0,
      points: [[round(p1.x), round(p1.y)], [round(p2.x), round(p2.y)]],
      length: size, thickness: mat.thickness, material: spec.material,
      texture_set: spec.texture_set || spec.material, heightClass: spec.heightClass || mat.heightClass,
      blocksMove: !!spec.blocksMove, blocksBullets: true, blocksVision: false,
      coverSides: 'both', hp: Math.round((mat.hpPerTile * size) / 32),
    }],
    openings: [],
  };
}

// Точки укрытия и слоты гарнизона
function buildCoverPoints(outline, spec) {
  const pts = [];
  const slots = [];
  const off = cover.points.offset;
  const step = cover.points.step;
  const max = cover.points.maxPerBuilding;
  for (const seg of outline.segments) {
    const [a, b] = seg.points;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.max(1, Math.floor(len / step));
    const dx = (b[0] - a[0]) / Math.max(1, len), dy = (b[1] - a[1]) / Math.max(1, len);
    const nx = -dy, ny = dx; // нормаль к сегменту
    for (let i = 0; i <= n && pts.length < max; i++) {
      const t = n === 0 ? 0.5 : i / n;
      const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
      for (const s of (seg.coverSides === 'both' ? [1, -1] : [1])) {
        pts.push({
          x: round(x + nx * off * s), y: round(y + ny * off * s),
          nx: round(nx * s), ny: round(ny * s),
          heightClass: seg.heightClass, segId: seg.id,
          kind: 'wall',
        });
      }
    }
  }
  for (const op of outline.openings) {
    if (!['window', 'embrasure'].includes(op.type)) continue;
    const inward = { x: op.cx - op.nx * cover.points.garrisonOffset, y: op.cy - op.ny * cover.points.garrisonOffset };
    slots.push({
      x: round(inward.x), y: round(inward.y),
      angle: round(Math.atan2(op.ny, op.nx)), arc: op.arc ?? 1.2,
      openingId: op.id, type: op.type,
    });
    pts.push({
      x: round(inward.x), y: round(inward.y), nx: -op.nx, ny: -op.ny,
      heightClass: 3, segId: null, kind: op.type, openingId: op.id,
    });
  }
  for (const op of outline.openings) {
    if (!['door', 'gate', 'breach'].includes(op.type)) continue;
    // точка «у косяка»: сбоку от проёма, не в самом проёме
    const side = { x: op.cy - op.cy, y: op.cx - op.cx };
    void side;
    const along = { x: (op.p2[0] - op.p1[0]), y: (op.p2[1] - op.p1[1]) };
    const alen = Math.hypot(along.x, along.y) || 1;
    const ux = along.x / alen, uy = along.y / alen;
    for (const s of [1, -1]) {
      pts.push({
        x: round(op.p1[0] + ux * (s < 0 ? -off : 0) + (s > 0 ? along.x : 0) + (s > 0 ? ux * off : 0) + op.nx * off),
        y: round(op.p1[1] + uy * (s < 0 ? -off : 0) + (s > 0 ? along.y : 0) + (s > 0 ? uy * off : 0) + op.ny * off),
        nx: round(-op.nx), ny: round(-op.ny), heightClass: 2, segId: null, kind: 'doorway',
      });
    }
  }
  return { pts, slots };
}

// Проверки: герметичность контура, проходимость внутрь, лимит вершин
function validate(type, outline) {
  const errors = [];
  if (outline.segments.length === 0) errors.push('нет сегментов');
  if (outline.segments.length * 2 > 48) errors.push(`вершин ${outline.segments.length * 2} > 48`);
  if (outline.segments.some((s) => s.length < 6)) errors.push('сегмент короче 6 px');
  if (outline.segments.some((s) => !(s.hp > 0))) errors.push('сегмент без HP');
  if (outline.openings.some((o) => o.width < 16)) errors.push('проём уже 16 px');
  // замкнутость: сумма длин сегментов + проёмов на каждой стороне = длине стороны
  const bySide = new Map(SIDES.map((s) => [s, 0]));
  for (const s of outline.segments) bySide.set(s.side, (bySide.get(s.side) || 0) + s.length);
  for (const o of outline.openings) {
    const len = Math.hypot(o.p2[0] - o.p1[0], o.p2[1] - o.p1[1]);
    bySide.set(o.side, (bySide.get(o.side) || 0) + len);
  }
  const expect = { north: outline.w, east: outline.h, south: outline.w, west: outline.h };
  for (const side of SIDES) {
    if (outline.openings.length && Math.abs((bySide.get(side) || 0) - expect[side]) > 1.5) {
      errors.push(`${side}: ${round(bySide.get(side) || 0)} из ${expect[side]}`);
    }
  }
  // проходимость: есть ли хотя бы один проходимый проём у здания с blocksMove
  if (outline.segments.some((s) => s.blocksMove) && !outline.openings.some((o) => o.move)) {
    errors.push('нет проходимого проёма — внутрь не попасть');
  }
  return errors;
}

const index = { version: 1, generated: new Date().toISOString(), types: [], notes: 'Сгенерировано tools/gen-walls.mjs из data/buildings.json (' + 'блок walls' + ').' };
let failed = 0;
for (const [type, def] of Object.entries(buildings)) {
  const spec = def.walls;
  if (!spec) {
    continue;
  }
  const outline = spec.mode === 'ring' ? buildRing(spec, def) : buildCoverLine(spec, def);
  outline.type = type;
  outline.name = def.name;
  outline.mode = spec.mode;
  outline.spec = spec;
  const { pts, slots } = buildCoverPoints(outline, spec);
  outline.cover_points = pts;
  outline.garrison_slots = slots;
  const errors = validate(type, outline);
  fs.writeFileSync(path.join(OUT_DIR, `${type}.json`), JSON.stringify(outline, null, 1));
  index.types.push({ type, mode: spec.mode, material: spec.material, segments: outline.segments.length, openings: outline.openings.length, coverPoints: pts.length, slots: slots.length, errors });
  if (errors.length) { failed++; console.log(`✗ ${type}: ${errors.join('; ')}`); }
  else console.log(`✓ ${type}: ${outline.segments.length} сегментов, ${outline.openings.length} проёмов, ${pts.length} точек укрытия, ${slots.length} слотов`);
}
fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(index, null, 1));
console.log(`\nфайлов: ${index.types.length}, ошибок: ${failed}`);
process.exit(failed ? 1 : 0);
