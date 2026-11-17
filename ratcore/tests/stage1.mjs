// RatCore — Полная проверка Этапа 1 (v0.1 Foundation): математика, мир, меши, Software 3D, Object-ID и конвейер §0
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createEngine,
  createRng,
  fnv1a32String,
  fbm2D,
  ridged2D,
  domainWarp2D,
  createClock,
  worldToScene,
  sceneToWorld,
  azimuthDeg,
  packFaceId,
  unpackFaceId,
  damageFaceId,
  breakFaceId,
  FACE_SIDE,
  parseLayerNotation,
  SpatialHashGrid,
  ddaRaycast3D,
  PalettedChunk16,
  OccupancyBrick64,
  RasterSurface,
  packRGBA,
  unpackRGBA,
  packVertex64,
} from '../ratcore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tools-manifest.json'), 'utf8'));

// 1. Детерминизм PRNG, шумов и часов
const r1 = createRng(1337);
const r2 = createRng(1337);
for (let i = 0; i < 16; i++) {
  assert.equal(r1.next(), r2.next(), 'Mulberry32 обязан быть строго детерминированным');
}
assert.equal(fnv1a32String('RatCore'), fnv1a32String('RatCore'));
assert.ok(Number.isFinite(fbm2D(1.5, -2.3, 7)));
assert.ok(Number.isFinite(ridged2D(3.2, 4.1, 7)));
assert.ok(Number.isFinite(domainWarp2D(0.5, 0.5, 7)));

const clk = createClock({ tickHz: 60 });
let stepped = 0;
clk.advance(0.05, () => { stepped++; });
assert.equal(stepped, 3, '0.05 сек при 60 Гц должно дать ровно 3 фиксированных шага');
assert.equal(clk.tick, 3);

// 2. Координаты (X, Y, H, h) и 64-битные faceId
const scenePt = worldToScene(10, 20, 5);
assert.deepEqual(scenePt, [10, 5, -20]);
assert.deepEqual(sceneToWorld(scenePt[0], scenePt[1], scenePt[2]), { x: 10, y: 20, h: 5 });
assert.equal(azimuthDeg(0, 10), 0, 'Север (+Y) должен быть 0°');
assert.equal(azimuthDeg(10, 0), 90, 'Восток (+X) должен быть 90°');

const fid = packFaceId({ i: 15, j: -8, k: 3, n: 1, s: FACE_SIDE.TOP, t: 77 });
assert.equal(typeof fid, 'bigint');
const u0 = unpackFaceId(fid);
assert.equal(u0.i, 15);
assert.equal(u0.j, -8);
assert.equal(u0.k, 3);
assert.equal(u0.s, FACE_SIDE.TOP);
assert.equal(u0.t, 77);
assert.equal(u0.state, 'intact');
assert.equal(u0.baseTex, 77);

const fidDmg = damageFaceId(fid);
assert.equal(unpackFaceId(fidDmg).state, 'damaged');
assert.equal(unpackFaceId(fidDmg).baseTex, 77);
const fidBrk = breakFaceId(fidDmg);
assert.equal(unpackFaceId(fidBrk).state, 'broken');

// 3. Слоевая нотация (X;Y)Hp(...) и (X;Y)hp(...) + защита от смещения RC-302 и числа пар RC-303
const parsedVert = parseLayerNotation('(1;2)H3(0,0;0,0)', { tex: 5 });
assert.equal(parsedVert.cells.length, 3);
assert.equal(parsedVert.isVertical, true);
assert.equal(parsedVert.driftD, 0);
assert.equal(typeof parsedVert.cells[0].faceId, 'bigint');
assert.equal(parsedVert.cells[0].x, 1);
assert.equal(parsedVert.cells[0].y, 2);
assert.equal(parsedVert.cells[1].k, 1);

const parsedLean = parseLayerNotation('(1;2)h3(1,0;0,-1)', { tex: 5 });
assert.equal(parsedLean.cells.length, 3);
assert.equal(parsedLean.isVertical, false);
assert.ok(parsedLean.driftD > 1.4 && parsedLean.tiltDeg > 20);
assert.equal(parsedLean.cells[2].x, 2);
assert.equal(parsedLean.cells[2].y, 1);

assert.throws(
  () => parseLayerNotation('(1;2)H3(1,0;0,0)'),
  (err) => err && err.code === 'RC-302',
  'Ненулевое смещение при вертикальной H должно давать RC-302',
);
assert.throws(
  () => parseLayerNotation('(1;2)H3(0,0)'),
  (err) => err && err.code === 'RC-303',
  'Неверное число пар (!= p - 1) должно давать RC-303',
);

// 4. SpatialHashGrid, DDA-Raycast, PalettedChunk16 и OccupancyBrick64 (8 байт BigInt на 64 вокселя)
const grid = new SpatialHashGrid(4);
grid.insert('a', 0, 0, 1);
grid.insert('b', 3, 2, 1);
grid.insert('far', 100, 100, 1);
const near = grid.queryRadius(1, 1, 5);
assert.ok(near.includes('a') && near.includes('b') && !near.includes('far'));

const hit = ddaRaycast3D({
  origin: [0.5, 0.5, 0.5],
  dir: [1, 0, 0],
  maxDist: 20,
  isSolid: (x, y, z) => x === 5 && y === 0 && z === 0,
});
assert.equal(hit.hit, true);
assert.deepEqual(hit.voxel, [5, 0, 0]);

const chunk = new PalettedChunk16();
chunk.set(0, 0, 0, 10);
chunk.set(15, 15, 15, 25);
assert.equal(chunk.get(0, 0, 0), 10);
assert.equal(chunk.get(15, 15, 15), 25);
assert.equal(chunk.get(1, 1, 1), 0);
assert.ok(chunk.byteSize() < 1500, 'Палитровый чанк из 3 материалов должен занимать < 1.5 КБ на 4096 вокселей');

const brick = new OccupancyBrick64();
assert.equal(brick.isEmpty(), true);
brick.set(1, 2, 3, true);
assert.equal(brick.get(1, 2, 3), true);
assert.equal(brick.popcount(), 1);
assert.equal(brick.isEmpty(), false);

// 5. Растр ABGR, упаковка вершин PackedVertex64 (8 байт)
const px = packRGBA(255, 128, 64, 255);
assert.deepEqual(unpackRGBA(px), [255, 128, 64, 255]);
const surf = new RasterSurface(16, 16);
surf.fillRect(2, 2, 6, 6, px);
assert.equal(surf.getPixel(3, 3), px);
const v64 = packVertex64({ x: 0.5, y: 1.0, z: 0.25, normalIdx: 2, uvU: 128, uvV: 64, matId: 3, ao: 3 });
assert.equal(v64.byteLength, 8, 'PackedVertex64 обязан занимать ровно 8 байт');

// 6. Движок, профили Zero-Cost Opt-In, карта, меши, Greedy Meshing, рендер, Object-ID и конвейер §0
const engine = createEngine({ preset: 'rpg-3d', seed: 777, manifest });
const prof = engine.getProfile();
assert.ok(prof.savingsPct > 40, 'Пресет rpg-3d должен экономить > 40% относительно полного набора');

// Генерация карты мира + граф + A*
const mapRes = engine.tools.build.mapGenerate({ seed: 777, width: 36, height: 36, settlements: 4 });
assert.equal(mapRes.ok, true);
assert.ok(mapRes.data.settlements >= 2);
const g = engine.getWorldGraph();
const nodeIds = [...g.nodes.keys()];
const pathRes = g.findPath(nodeIds[0], nodeIds[nodeIds.length - 1]);
assert.ok(pathRes && pathRes.path.length >= 2 && pathRes.totalCost > 0, 'A* должен находить путь между городами графа');

// Меши: primitive, extrude, lathe, Greedy Meshing voxels, layer, combine
const box = engine.tools.build.primitive({ shape: 'box', w: 3, h: 3, d: 3, color: '#e6b85c' });
const cyl = engine.tools.build.primitive({ shape: 'cylinder', r: 1, h: 3, segments: 12 });
const ext = engine.tools.build.extrude({ points: [[0, 0], [3, 0], [3, 2], [1, 2], [1, 3], [0, 3]], height: 2 });
const lat = engine.tools.build.lathe({ profile: [[0.2, 0], [1.0, 0.5], [0.8, 1.5], [0.1, 2.0]], segments: 12 });
assert.equal(box.ok && cyl.ok && ext.ok && lat.ok, true);

// Greedy Meshing: сплошная плита 4x1x4 = 16 вокселей -> без слияния было бы 16*12=192 треуг., с Greedy ровно 12 треуг.!
const slabVoxels = [];
for (let x = 0; x < 4; x++) {
  for (let z = 0; z < 4; z++) slabVoxels.push({ x, y: 0, z, mat: 1 });
}
const greedyRes = engine.tools.build.voxels({ voxels: slabVoxels, voxelSize: 1 });
assert.equal(greedyRes.ok, true);
assert.equal(greedyRes.data.triCount, 12, 'Greedy Meshing для сплошной плиты 4x1x4 обязан выдать ровно 12 треугольников');

const layerRes = engine.tools.build.layer({ expr: '(0;0)H3(0,0;0,0)', tex: 2 });
assert.equal(layerRes.ok, true);
assert.equal(layerRes.data.parsed.cells.length, 3);

// Процедурная текстура + нормали + битая копия
const texRes = engine.tools.build.texGenerate({ width: 32, height: 32, material: 'brick', seed: 9, damaged: true });
assert.equal(texRes.ok, true);
assert.equal(engine._verifySealedTexture(texRes.data), true);

// Размещение, Software 3D рендер, ASCII и Object-ID видимость (see.visibleEntities)
const hf = engine.getHeightField();
const centerH = hf.sampleHeight(0, 0);
const placed = engine.tools.build.placeEntity({
  id: 'citadel',
  mesh: box.data,
  texture: texRes.data,
  x: 0,
  y: 0,
  h: Math.max(1, centerH),
  allowWater: true,
});
assert.equal(placed.ok, true);

engine.tools.look.at({ x: 0, y: -9, h: Math.max(1, centerH) + 3, targetX: 0, targetY: 0, targetH: Math.max(1, centerH) + 1.5 });
const cap = engine.tools.look.capture({ format: 'ascii', cols: 32, rows: 14 });
assert.equal(cap.ok, true);
assert.ok(cap.data.drawnTris > 0, 'Software3DRenderer должен отрисовать треугольники');
assert.ok(cap.data.nonEmptyRatio > 0.01, 'Кадр не должен быть пустым');
assert.ok(cap.data.ascii.includes('\n'));

const vis = engine.tools.see.visibleEntities();
assert.equal(vis.ok, true);
assert.ok(vis.data.visible.some((v) => v.id === 'citadel'), 'Object-ID буфер обязан увидеть размещённую цитадель');

// Проверка диагностики камеры под землёй (RC-402)
engine.tools.look.at({ h: -100 });
const diagUnder = engine.tools.see.diagnose();
assert.equal(diagUnder.data.ok, false);
assert.ok(diagUnder.data.issues.some((i) => i.code === 'RC-402'));
engine.tools.look.at({ h: Math.max(1, centerH) + 3 });

// Конвейер §0: dryRun, memoize, pipe с атомарным откатом, undo, watch.diff, powerProfile 75%, discover
const dry = engine.tools.build.placeEntity({ id: 'ghost', mesh: box.data, x: 5, y: 5, h: 5, allowWater: true }, { dryRun: true });
assert.equal(dry.ok, true);
assert.equal(dry.data.dryRun, true);
assert.equal(engine.tools.save.exportJson().data.entities.some((e) => e.id === 'ghost'), false, 'dryRun не должен менять мир');

const m1 = engine.tools.watch.bottleneckReport({}, { memoize: true, idempotencyKey: 'perf-1' });
const m2 = engine.tools.watch.bottleneckReport({}, { memoize: true, idempotencyKey: 'perf-1' });
assert.equal(m2.cached, true);

const snapA = engine.tools.watch.snapshot({ label: 'before' });
const pipeFail = engine.tools.pipe({
  steps: [
    { tool: 'build.placeEntity', args: { id: 'temp_tower', mesh: cyl.data, x: 3, y: 3, h: 5, allowWater: true } },
    { tool: 'build.placeEntity', args: { id: 'bad_raw', mesh: { fake: true }, x: 4, y: 4, h: 5 } },
  ],
});
assert.equal(pipeFail.ok, false);
assert.equal(pipeFail.error.code, 'RC-101');
assert.equal(engine.tools.save.exportJson().data.entities.some((e) => e.id === 'temp_tower'), false, 'pipe обязан откатить первый шаг при падении второго');

engine.tools.move.entity({ id: 'citadel', x: 2, y: 1, allowWater: true });
const snapB = engine.tools.watch.snapshot({ label: 'after' });
const diff = engine.tools.watch.diff({ snapshotA: snapA.data.label, snapshotB: snapB.data.label });
assert.equal(diff.data.moved.length, 1);

// Undo возвращает citadel назад
engine.tools.remove.undo({ steps: 1 });
const afterUndo = engine.tools.save.exportJson().data.entities.find((e) => e.id === 'citadel');
assert.equal(afterUndo.x, 0);

// CoreGovernor 75% CPU + BM25 discover
const pwr = engine.tools.stream.setPowerProfile({ mode: 'turbo' });
assert.equal(pwr.data.targetCpuPct, 75);

const disc = engine.tools.discover({ intent: 'разрушить мост огонь', limit: 3 });
assert.equal(disc.ok, true);
assert.equal(disc.data.matches[0].id, 'destroy.damage');
assert.ok(disc.data.neededPacks.includes('pack:destruction'));

console.log('RatCore Stage 1 (v0.1) full verification: OK (all layers, Greedy Meshing, Software 3D + Object-ID, §0 pipe/undo, BM25 discover)');
