// RatCore — Единый шлюз инструментов RatCore.tools.* (Этап 1: ядро + ToolGuard + Zero-Cost Opt-In)
// Захватывает одноразовую печать claimMintAuthority() (Барьер 1) и обслуживает все операции через единый конвейер §0.

import { createClock } from '../core/clock.js';
import { createToolGuardVault, RatCoreError } from '../core/seal.js';
import {
  CORE_BRANCHES,
  STANDARD_MODULES,
  OPTIONAL_PACKS,
  resolveModuleProfile,
  createDisabledBranchProxy,
} from '../core/modules.js';
import { HeightField } from '../world/coords.js';
import { parseLayerNotation } from '../world/layers.js';
import { SpatialHashGrid, ddaRaycast3D } from '../world/spatial.js';
import { WorldGraph, generateWorldMap } from '../world/graph.js';
import { synthesizeTextureData } from '../assets/textures.js';
import {
  buildPrimitiveGeometry,
  buildExtrudeGeometry,
  buildLatheGeometry,
  buildVoxelsGreedyGeometry,
  combineGeometries,
  validateMeshBuffers,
} from '../assets/mesh-builder.js';
import { Software3DRenderer } from '../render/software-3d.js';

const ALL_BRANCH_NAMES = [
  ...CORE_BRANCHES,
  ...STANDARD_MODULES,
  ...Object.values(OPTIONAL_PACKS).flatMap((p) => p.branches),
];

function nowMs() {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

export function createRatCoreEngine(config = {}) {
  const seed = Number(config.seed ?? 1337) | 0;
  const profile = resolveModuleProfile(config);
  const vault = createToolGuardVault();
  // Барьер 1: одноразовый захват печати исключительно официальным toolkit
  const mint = vault.claimMintAuthority('ratcore-toolkit');
  const clock = createClock(config.clock || {});
  const renderer3D = new Software3DRenderer(config.viewport || { width: 160, height: 90 });

  // Состояние мира
  let heightField = new HeightField({ width: 32, height: 32, cellSize: 1, originX: -16, originY: -16 });
  heightField.data.fill(1.0); // Суша по умолчанию H = 1.0 м
  let graph = new WorldGraph();
  const entities = new Map();
  const numericIdToEntityId = new Map();
  const spatial = new SpatialHashGrid(8);
  const snapshots = new Map();
  const operationLog = [];
  const undoStack = [];
  const memoCache = new Map();
  const perfCounters = new Map();
  const manifestTools = Array.isArray(config.manifest?.tools) ? config.manifest.tools : [];

  let nextEntityNumericId = 1;
  let nextTraceNum = 1;
  let powerProfile = { mode: 'turbo', targetCpuPct: 75 };
  let dynRes = { enabled: true, scale: 1.0, minScale: 0.55, maxScale: 1.0, targetFps: 60 };
  const camera = { x: 0, y: -10, h: 6, targetX: 0, targetY: 0, targetH: 1, fovDeg: 60, mode: '3d-raster' };

  function recordPerf(toolName, costMs) {
    let rec = perfCounters.get(toolName);
    if (!rec) {
      rec = { calls: 0, totalMs: 0, maxMs: 0 };
      perfCounters.set(toolName, rec);
    }
    rec.calls++;
    rec.totalMs += costMs;
    if (costMs > rec.maxMs) rec.maxMs = costMs;
  }

  // Единый конвейер вызова §0: проверка, dryRun, memoize, аудит, профилирование, единый ответ
  function wrapTool(toolName, fn) {
    return function wrappedTool(args = {}, ctx = {}) {
      const start = nowMs();
      const traceId = ctx.traceId || `tr-${String(nextTraceNum++).padStart(4, '0')}`;
      const agentId = ctx.agentId || 'local';

      if (ctx.memoize && ctx.idempotencyKey) {
        const memoKey = `${toolName}:${clock.tick}:${ctx.idempotencyKey}`;
        if (memoCache.has(memoKey)) {
          return { ...memoCache.get(memoKey), cached: true, traceId };
        }
      }

      try {
        const data = fn(args || {}, { ...ctx, traceId, agentId, dryRun: Boolean(ctx.dryRun) });
        const costMs = Math.max(0, nowMs() - start);
        recordPerf(toolName, costMs);
        operationLog.push({ tool: toolName, tick: clock.tick, agentId, traceId, dryRun: Boolean(ctx.dryRun), costMs });
        const res = { ok: true, data, error: null, tick: clock.tick, costMs, traceId };
        if (ctx.memoize && ctx.idempotencyKey) {
          memoCache.set(`${toolName}:${clock.tick}:${ctx.idempotencyKey}`, res);
        }
        return res;
      } catch (err) {
        const costMs = Math.max(0, nowMs() - start);
        recordPerf(toolName, costMs);
        const code = err instanceof RatCoreError ? err.code : 'RC-999';
        const message = err && err.message ? err.message : String(err);
        const autoFixHint = (err && (err.autoFixHint || err.hint)) || 'Проверь аргументы через tools.help() или tools.discover().';
        return {
          ok: false,
          data: null,
          error: { code, message, autoFixHint, extra: err?.extra || null },
          tick: clock.tick,
          costMs,
          traceId,
        };
      }
    };
  }

  function mintValidatedMesh(geom, provenance, { maxTris = 50000, dryRun = false } = {}) {
    validateMeshBuffers(geom.buffers, { maxTris });
    if (dryRun) {
      return { dryRun: true, triCount: geom.triCount, vertexCount: geom.buffers.positions.length / 3, bounds: geom.bounds };
    }
    return mint.mintMesh({
      buffers: geom.buffers,
      bounds: geom.bounds,
      triCount: geom.triCount,
      provenance: { ...provenance, tick: clock.tick },
      validated: true,
    });
  }

  // ---------------------------- Ядровые инструменты (Core Always-On) ----------------------------
  const coreImpl = {
    build: {
      primitive: wrapTool('build.primitive', (args, ctx) => {
        const geom = buildPrimitiveGeometry(args);
        return mintValidatedMesh(geom, { tool: 'build.primitive', recipe: { op: 'build.primitive', args }, agentId: ctx.agentId, traceId: ctx.traceId }, { dryRun: ctx.dryRun });
      }),

      extrude: wrapTool('build.extrude', (args, ctx) => {
        const geom = buildExtrudeGeometry(args);
        return mintValidatedMesh(geom, { tool: 'build.extrude', recipe: { op: 'build.extrude', args }, agentId: ctx.agentId, traceId: ctx.traceId }, { dryRun: ctx.dryRun });
      }),

      lathe: wrapTool('build.lathe', (args, ctx) => {
        const geom = buildLatheGeometry(args);
        return mintValidatedMesh(geom, { tool: 'build.lathe', recipe: { op: 'build.lathe', args }, agentId: ctx.agentId, traceId: ctx.traceId }, { dryRun: ctx.dryRun });
      }),

      voxels: wrapTool('build.voxels', (args, ctx) => {
        const geom = buildVoxelsGreedyGeometry(args);
        return mintValidatedMesh(geom, { tool: 'build.voxels', recipe: { op: 'build.voxels', args }, agentId: ctx.agentId, traceId: ctx.traceId }, { dryRun: ctx.dryRun });
      }),

      layer: wrapTool('build.layer', (args, ctx) => {
        const parsed = parseLayerNotation(args.expr, { tex: args.tex ?? 1, layerIndex: args.layerIndex ?? 0, baseK: args.baseK ?? 0, allowCarry: Boolean(args.allowCarry) });
        const voxels = parsed.cells.map((c) => ({ x: Math.round(c.x), y: c.k, z: Math.round(-c.y), mat: args.tex ?? 1 }));
        const geom = buildVoxelsGreedyGeometry({ voxels, voxelSize: args.voxelSize || 1, color: args.color || '#94b8d8' });
        const mesh = mintValidatedMesh(geom, { tool: 'build.layer', recipe: { op: 'build.layer', args }, agentId: ctx.agentId, traceId: ctx.traceId }, { dryRun: ctx.dryRun });
        return { parsed, mesh };
      }),

      combine: wrapTool('build.combine', (args, ctx) => {
        const items = Array.isArray(args.parts) ? args.parts : [];
        if (!items.length) throw new RatCoreError('RC-103', 'build.combine требует непустой массив parts', 'Передай parts: [{ mesh, offset: [x,y,z] }].');
        const resolvedParts = items.map((p) => {
          const entry = vault.readSealedMesh(p.mesh, 'build.combine');
          return { buffers: entry.buffers, offset: p.offset || [0, 0, 0] };
        });
        const geom = combineGeometries(resolvedParts, args.color || '#88b4d8');
        return mintValidatedMesh(geom, { tool: 'build.combine', recipe: { op: 'build.combine', partIds: items.map((p) => p.mesh.id) }, agentId: ctx.agentId, traceId: ctx.traceId }, { dryRun: ctx.dryRun });
      }),

      // Барьер 3: пересборка модели строго из рецепта ops
      fromRecipe: wrapTool('build.fromRecipe', (args, ctx) => {
        const ops = Array.isArray(args.ops) ? args.ops : [];
        if (!ops.length) throw new RatCoreError('RC-103', 'Рецепт должен содержать непустой массив ops', 'Укажи ops: [{ tool: "build.primitive", args: {...} }].');
        const builtParts = [];
        for (const step of ops) {
          if (step.tool === 'build.primitive') builtParts.push({ ...buildPrimitiveGeometry(step.args), offset: step.offset || [0, step.args?.y || 0, 0] });
          else if (step.tool === 'build.extrude') builtParts.push({ ...buildExtrudeGeometry(step.args), offset: step.offset || [0, 0, 0] });
          else if (step.tool === 'build.lathe') builtParts.push({ ...buildLatheGeometry(step.args), offset: step.offset || [0, 0, 0] });
          else if (step.tool === 'build.voxels') builtParts.push({ ...buildVoxelsGreedyGeometry(step.args), offset: step.offset || [0, 0, 0] });
          else if (step.tool === 'build.layer') {
            const parsed = parseLayerNotation(step.args?.expr, step.args || {});
            const vox = parsed.cells.map((c) => ({ x: Math.round(c.x), y: c.k, z: Math.round(-c.y), mat: 1 }));
            builtParts.push({ ...buildVoxelsGreedyGeometry({ voxels: vox }), offset: step.offset || [0, 0, 0] });
          } else {
            throw new RatCoreError('RC-104', `Неизвестная операция рецепта: ${step.tool}`, 'Допустимы build.primitive, build.extrude, build.lathe, build.voxels, build.layer.');
          }
        }
        const geom = builtParts.length === 1 ? builtParts[0] : combineGeometries(builtParts, args.color || '#88b4d8');
        return mintValidatedMesh(geom, { tool: 'build.fromRecipe', recipe: { modelId: args.modelId || 'recipe', ops }, agentId: ctx.agentId, traceId: ctx.traceId }, { dryRun: ctx.dryRun });
      }),

      texGenerate: wrapTool('build.texGenerate', (args, ctx) => {
        const texData = synthesizeTextureData(args);
        if (ctx.dryRun) return { dryRun: true, width: texData.width, height: texData.height };
        return mint.mintTexture({ ...texData, provenance: { tool: 'build.texGenerate', args, agentId: ctx.agentId, traceId: ctx.traceId, tick: clock.tick } });
      }),

      mapGenerate: wrapTool('build.mapGenerate', (args, ctx) => {
        const generated = generateWorldMap({ seed: args.seed ?? seed, width: args.width || 48, height: args.height || 48, cellSize: args.cellSize || 1, settlements: args.settlements ?? 5 });
        if (!ctx.dryRun) {
          heightField = generated.heightField;
          graph = generated.graph;
        }
        return {
          width: generated.heightField.width,
          height: generated.heightField.height,
          settlements: generated.settlements.length,
          roads: generated.graph.edges.size,
        };
      }),

      placeEntity: wrapTool('build.placeEntity', (args, ctx) => {
        // Обязательная проверка печати ToolGuard (сырой меш -> RC-101!)
        vault.readSealedMesh(args.mesh, 'build.placeEntity');
        if (args.texture) vault.readSealedTexture(args.texture, 'build.placeEntity');

        const id = String(args.id || `ent_${nextEntityNumericId}`);
        const x = Number(args.x ?? 0);
        const y = Number(args.y ?? 0);
        const groundH = heightField.sampleHeight(x, y);
        const h = args.snapToTerrain ? groundH : Number(args.h ?? groundH);
        heightField.assertPlacement(x, y, h, { allowWater: Boolean(args.allowWater), allowUnderground: Boolean(args.allowUnderground) });

        if (ctx.dryRun) return { dryRun: true, id, x, y, h, groundH };

        const numericId = nextEntityNumericId++;
        const ent = {
          id,
          numericId,
          mesh: args.mesh,
          texture: args.texture || null,
          x,
          y,
          h,
          yaw: Number(args.yaw || 0),
          scale: Number(args.scale || 1),
          radius: Number(args.radius || 1),
          tag: String(args.tag || 'object'),
        };
        entities.set(id, ent);
        numericIdToEntityId.set(numericId, id);
        spatial.insert(id, x, y, ent.radius);
        undoStack.push({ type: 'remove-entity', id });
        return { id, numericId, x, y, h, meshId: args.mesh.id };
      }),

      addNode: wrapTool('build.addNode', (args, ctx) => {
        const x = Number(args.x ?? 0);
        const y = Number(args.y ?? 0);
        const h = args.h !== undefined ? Number(args.h) : heightField.sampleHeight(x, y);
        if (ctx.dryRun) return { dryRun: true, id: args.id, x, y, h };
        return graph.addNode({ id: args.id || `node_${graph.nodes.size + 1}`, x, y, h, kind: args.kind || 'point', meta: args.meta || {} });
      }),

      connectRoad: wrapTool('build.connectRoad', (args, ctx) => {
        if (ctx.dryRun) return { dryRun: true, from: args.from, to: args.to };
        const edge = graph.connect({ id: args.id, from: args.from, to: args.to, kind: args.kind || 'road', costFactor: args.costFactor || 1 });
        if (!edge) throw new RatCoreError('RC-301', `Не найдены узлы ${args.from} или ${args.to}`, 'Сначала создай узлы через tools.build.addNode.');
        return edge;
      }),
    },

    move: {
      entity: wrapTool('move.entity', (args, ctx) => {
        const ent = entities.get(args.id);
        if (!ent) throw new RatCoreError('RC-301', `Сущность "${args.id}" не найдена`, 'Проверь id сущности.');
        const prev = { x: ent.x, y: ent.y, h: ent.h, yaw: ent.yaw, scale: ent.scale };
        const x = args.x !== undefined ? Number(args.x) : ent.x;
        const y = args.y !== undefined ? Number(args.y) : ent.y;
        const groundH = heightField.sampleHeight(x, y);
        const h = args.snapToTerrain ? groundH : (args.h !== undefined ? Number(args.h) : ent.h);
        heightField.assertPlacement(x, y, h, { allowWater: Boolean(args.allowWater), allowUnderground: Boolean(args.allowUnderground) });
        if (ctx.dryRun) return { dryRun: true, id: ent.id, from: prev, to: { x, y, h } };
        ent.x = x; ent.y = y; ent.h = h;
        if (args.yaw !== undefined) ent.yaw = Number(args.yaw);
        if (args.scale !== undefined) ent.scale = Number(args.scale);
        spatial.insert(ent.id, ent.x, ent.y, ent.radius);
        undoStack.push({ type: 'restore-pos', id: ent.id, prev });
        return { id: ent.id, x: ent.x, y: ent.y, h: ent.h, yaw: ent.yaw };
      }),

      node: wrapTool('move.node', (args, ctx) => {
        if (ctx.dryRun) return { dryRun: true, id: args.id };
        const h = args.h !== undefined ? Number(args.h) : heightField.sampleHeight(args.x, args.y);
        const updated = graph.moveNode(args.id, { x: args.x, y: args.y, h });
        if (!updated) throw new RatCoreError('RC-301', `Узел "${args.id}" не найден`, 'Проверь id узла.');
        return updated;
      }),

      swap: wrapTool('move.swap', (args, ctx) => {
        const a = entities.get(args.idA);
        const b = entities.get(args.idB);
        if (!a || !b) throw new RatCoreError('RC-301', 'Одна из сущностей для swap не найдена', 'Передай существующие idA и idB.');
        if (ctx.dryRun) return { dryRun: true, idA: a.id, idB: b.id };
        const tmp = { x: a.x, y: a.y, h: a.h };
        a.x = b.x; a.y = b.y; a.h = b.h;
        b.x = tmp.x; b.y = tmp.y; b.h = tmp.h;
        spatial.insert(a.id, a.x, a.y, a.radius);
        spatial.insert(b.id, b.x, b.y, b.radius);
        return { swapped: [a.id, b.id] };
      }),
    },

    remove: {
      entity: wrapTool('remove.entity', (args, ctx) => {
        const ent = entities.get(args.id);
        if (!ent) throw new RatCoreError('RC-301', `Сущность "${args.id}" не найдена`, 'Проверь id.');
        if (ctx.dryRun) return { dryRun: true, wouldRemove: ent.id };
        entities.delete(ent.id);
        numericIdToEntityId.delete(ent.numericId);
        spatial.remove(ent.id);
        undoStack.push({ type: 'restore-entity', ent: { ...ent } });
        return { removed: ent.id };
      }),

      area: wrapTool('remove.area', (args, ctx) => {
        const ids = spatial.queryRadius(Number(args.x || 0), Number(args.y || 0), Number(args.radius || 5));
        if (ctx.dryRun) return { dryRun: true, wouldRemove: ids };
        const removed = [];
        for (const id of ids) {
          const ent = entities.get(id);
          if (!ent) continue;
          entities.delete(id);
          numericIdToEntityId.delete(ent.numericId);
          spatial.remove(id);
          removed.push(id);
        }
        return { removedCount: removed.length, removed };
      }),

      undo: wrapTool('remove.undo', (args) => {
        const steps = Math.max(1, Number(args.steps || 1));
        const undone = [];
        for (let i = 0; i < steps && undoStack.length > 0; i++) {
          const op = undoStack.pop();
          if (op.type === 'remove-entity') {
            const ent = entities.get(op.id);
            if (ent) {
              entities.delete(op.id);
              numericIdToEntityId.delete(ent.numericId);
              spatial.remove(op.id);
            }
          } else if (op.type === 'restore-pos') {
            const ent = entities.get(op.id);
            if (ent) {
              Object.assign(ent, op.prev);
              spatial.insert(ent.id, ent.x, ent.y, ent.radius);
            }
          } else if (op.type === 'restore-entity') {
            entities.set(op.ent.id, op.ent);
            numericIdToEntityId.set(op.ent.numericId, op.ent.id);
            spatial.insert(op.ent.id, op.ent.x, op.ent.y, op.ent.radius);
          }
          undone.push(op.type);
        }
        return { undoneCount: undone.length, undone };
      }),
    },

    watch: {
      snapshot: wrapTool('watch.snapshot', (args) => {
        const label = String(args.label || `snap_${snapshots.size + 1}`);
        const snap = {
          label,
          tick: clock.tick,
          entities: [...entities.values()].map((e) => ({ id: e.id, x: e.x, y: e.y, h: e.h, meshId: e.mesh.id })),
          nodes: graph.nodes.size,
          edges: graph.edges.size,
        };
        snapshots.set(label, snap);
        return snap;
      }),

      diff: wrapTool('watch.diff', (args) => {
        const a = snapshots.get(args.snapshotA);
        const b = snapshots.get(args.snapshotB);
        if (!a || !b) throw new RatCoreError('RC-103', 'Снимок не найден', 'Сначала создай снимки через tools.watch.snapshot({ label }).');
        const mapA = new Map(a.entities.map((e) => [e.id, e]));
        const mapB = new Map(b.entities.map((e) => [e.id, e]));
        const added = [], removed = [], moved = [];
        for (const [id, eb] of mapB) {
          if (!mapA.has(id)) added.push(id);
          else {
            const ea = mapA.get(id);
            if (ea.x !== eb.x || ea.y !== eb.y || ea.h !== eb.h) moved.push({ id, from: ea, to: eb });
          }
        }
        for (const id of mapA.keys()) {
          if (!mapB.has(id)) removed.push(id);
        }
        return { added, removed, moved };
      }),

      bottleneckReport: wrapTool('watch.bottleneckReport', () => {
        const rows = [...perfCounters.entries()]
          .map(([tool, s]) => ({ tool, calls: s.calls, totalMs: Number(s.totalMs.toFixed(3)), maxMs: Number(s.maxMs.toFixed(3)) }))
          .sort((a, b) => b.totalMs - a.totalMs);
        return { top3: rows.slice(0, 3), totalTrackedTools: rows.length, vault: vault.getStats(), powerProfile };
      }),

      auditLog: wrapTool('watch.auditLog', () => vault.getAuditLog()),
    },

    look: {
      at: wrapTool('look.at', (args) => {
        for (const k of ['x', 'y', 'h', 'targetX', 'targetY', 'targetH', 'fovDeg', 'mode']) {
          if (args[k] !== undefined) camera[k] = args[k];
        }
        return { ...camera };
      }),

      capture: wrapTool('look.capture', (args) => {
        if (args.width && args.height) renderer3D.resize(args.width, args.height);
        const frame = renderer3D.renderScene({ vault, entities: [...entities.values()], camera });
        const out = {
          width: frame.width,
          height: frame.height,
          drawnTris: frame.drawnTris,
          nonEmptyRatio: Number(frame.nonEmptyRatio.toFixed(4)),
        };
        if (args.format === 'ascii') {
          out.ascii = frame.surface.toAscii(args.cols || 40, args.rows || 18);
        }
        return out;
      }),
    },

    see: {
      visibleEntities: wrapTool('see.visibleEntities', () => {
        const frame = renderer3D.renderScene({ vault, entities: [...entities.values()], camera });
        const pixelCounts = new Map();
        const buf = frame.objectIdBuffer;
        for (let i = 0; i < buf.length; i++) {
          const nid = buf[i];
          if (nid > 0) pixelCounts.set(nid, (pixelCounts.get(nid) || 0) + 1);
        }
        const total = buf.length;
        const visible = [];
        for (const [nid, px] of pixelCounts) {
          const id = numericIdToEntityId.get(nid);
          if (id) visible.push({ id, pixels: px, screenPct: Number(((px / total) * 100).toFixed(2)) });
        }
        visible.sort((a, b) => b.pixels - a.pixels);
        return { visibleCount: visible.length, visible };
      }),

      diagnose: wrapTool('see.diagnose', () => {
        const issues = [];
        const camGround = heightField.sampleHeight(camera.x, camera.y);
        if (camera.h < camGround) issues.push({ code: 'RC-402', message: `Камера под землёй (h=${camera.h} < H=${camGround.toFixed(2)})` });
        const frame = renderer3D.renderScene({ vault, entities: [...entities.values()], camera });
        if (entities.size > 0 && frame.nonEmptyRatio < 0.001) {
          issues.push({ code: 'RC-401', message: 'Пустой кадр: ни одна сущность не попала в поле зрения камеры' });
        }
        return { ok: issues.length === 0, nonEmptyRatio: frame.nonEmptyRatio, issues };
      }),

      raycastVoxel: wrapTool('see.raycastVoxel', (args) => {
        return ddaRaycast3D({
          origin: args.origin || [0, 0, 0],
          dir: args.dir || [1, 0, 0],
          maxDist: args.maxDist || 64,
          isSolid: typeof args.isSolid === 'function' ? args.isSolid : () => false,
        });
      }),
    },

    input: {
      state: wrapTool('input.state', () => ({ mode: 'headless', coalescedZeroLag: true })),
    },

    ui: {
      hudSummary: wrapTool('ui.hudSummary', () => ({ tick: clock.tick, entities: entities.size, powerProfile, dynRes })),
    },

    save: {
      exportJson: wrapTool('save.exportJson', () => ({
        schema: 'ratcore-save/1',
        seed,
        tick: clock.tick,
        entities: [...entities.values()].map((e) => ({ id: e.id, x: e.x, y: e.y, h: e.h, yaw: e.yaw, scale: e.scale, tag: e.tag, meshId: e.mesh.id })),
        nodes: [...graph.nodes.values()],
        edges: [...graph.edges.values()],
      })),
    },

    stream: {
      setPowerProfile: wrapTool('stream.setPowerProfile', (args) => {
        const map = { eco: 40, balanced: 60, turbo: 75 };
        const mode = map[args.mode] ? args.mode : 'turbo';
        powerProfile = { mode, targetCpuPct: map[mode] };
        return { ...powerProfile };
      }),

      setDynamicResolution: wrapTool('stream.setDynamicResolution', (args) => {
        dynRes = {
          enabled: args.enabled !== false,
          scale: dynRes.scale,
          minScale: Number(args.minScale ?? 0.55),
          maxScale: Number(args.maxScale ?? 1.0),
          targetFps: Number(args.targetFps ?? 60),
        };
        return { ...dynRes };
      }),

      memoryStats: wrapTool('stream.memoryStats', () => ({
        profile: { preset: profile.preset, estBundleKB: profile.estBundleKB, savingsPct: profile.savingsPct, activePacks: profile.packs },
        vault: vault.getStats(),
        entities: entities.size,
      })),
    },
  };

  // Активация модулей/пакетов: включённые работают, выключенные — Zero-Cost Proxy (RC-108!)
  const tools = {};

  function rebuildToolProxies() {
    for (const branch of ALL_BRANCH_NAMES) {
      if (coreImpl[branch]) {
        tools[branch] = coreImpl[branch];
      } else if (profile.activeBranches.has(branch)) {
        // Включённый модуль/пакет (этап 1: валидный шлюз состояния модуля)
        tools[branch] = {
          status: wrapTool(`${branch}.status`, () => ({ branch, enabled: true, stage: 'v0.1-ready' })),
        };
      } else {
        tools[branch] = createDisabledBranchProxy(branch);
      }
    }
  }

  rebuildToolProxies();

  // Универсальный транзакционный конвейер §0: tools.pipe(steps)
  tools.pipe = wrapTool('pipe', (args, ctx) => {
    const steps = Array.isArray(args.steps) ? args.steps : (Array.isArray(args) ? args : []);
    const results = [];
    const undoBefore = undoStack.length;
    for (const step of steps) {
      const [branch, method] = String(step.tool || '').split('.');
      const fn = tools[branch]?.[method];
      if (typeof fn !== 'function') {
        throw new RatCoreError('RC-104', `Инструмент "${step.tool}" не найден`, 'Вызови tools.discover({ intent }) для поиска нужного метода.');
      }
      const res = fn(step.args || {}, { ...ctx, dryRun: ctx.dryRun });
      if (!res.ok) {
        // Атомарный откат всех выполненных шагов при сбое
        if (!ctx.dryRun && undoStack.length > undoBefore) {
          coreImpl.remove.undo({ steps: undoStack.length - undoBefore });
        }
        throw new RatCoreError(res.error.code, res.error.message, res.error.autoFixHint);
      }
      results.push(res.data);
    }
    return { executed: results.length, results };
  });

  // Барьер 5: самодокументирующийся шлюз tools.help()
  tools.help = wrapTool('help', (args) => {
    const branch = args && args.branch ? String(args.branch) : null;
    if (branch) {
      const enabled = profile.activeBranches.has(branch);
      const methods = tools[branch] && !tools[branch].__disabled ? Object.keys(tools[branch]) : [];
      return { branch, enabled, methods, requiredOwner: tools[branch]?.__owner || null };
    }
    return {
      preset: profile.preset,
      activeBranches: [...profile.activeBranches],
      activePacks: [...profile.packs],
      estBundleKB: profile.estBundleKB,
      savingsPct: profile.savingsPct,
    };
  });

  // F-183..F-185, A-124: Офлайн-поисковик инструментов для ИИ (BM25 + теги по tools-manifest.json)
  tools.discover = wrapTool('discover', (args) => {
    const query = String(args.intent || args.query || '').toLowerCase().trim();
    const limit = Math.max(1, Math.min(12, Number(args.limit || 5)));
    const tokens = query.split(/[^a-zа-яё0-9]+/i).filter((t) => t.length >= 2);
    const scored = manifestTools.map((item) => {
      const hay = `${item.id} ${item.summary} ${(item.tags || []).join(' ')}`.toLowerCase();
      let score = 0;
      for (const tok of tokens) {
        if ((item.tags || []).some((t) => t.toLowerCase().includes(tok))) score += 4;
        if (item.id.toLowerCase().includes(tok)) score += 3;
        if (hay.includes(tok)) score += 1.5;
      }
      const isEnabled = profile.activeBranches.has(item.branch);
      return {
        id: item.id,
        branch: item.branch,
        tier: item.tier,
        pack: item.pack || null,
        enabled: isEnabled,
        score,
        summary: item.summary,
      };
    }).filter((r) => tokens.length === 0 || r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const neededPacks = [...new Set(scored.filter((s) => !s.enabled && s.pack).map((s) => s.pack))];
    return { query, matches: scored, neededPacks };
  });

  // Динамическое включение / выключение опциональных пакетов по выбору (A-111)
  function enablePack(packId) {
    const spec = OPTIONAL_PACKS[packId];
    if (!spec) {
      throw new RatCoreError('RC-104', `Неизвестный опциональный пакет: ${packId}`, `Доступные пакеты: ${Object.keys(OPTIONAL_PACKS).join(', ')}`);
    }
    if (!profile.packs.includes(packId)) profile.packs.push(packId);
    for (const dep of spec.deps) {
      if (!profile.modules.includes(dep)) profile.modules.push(dep);
      profile.activeBranches.add(dep);
    }
    for (const b of spec.branches) profile.activeBranches.add(b);
    rebuildToolProxies();
    return { ok: true, enabledPack: packId, activePacks: [...profile.packs] };
  }

  function disablePack(packId) {
    const spec = OPTIONAL_PACKS[packId];
    if (!spec) return { ok: false };
    const idx = profile.packs.indexOf(packId);
    if (idx >= 0) profile.packs.splice(idx, 1);
    for (const b of spec.branches) profile.activeBranches.delete(b);
    rebuildToolProxies();
    return { ok: true, disabledPack: packId, activePacks: [...profile.packs] };
  }

  return Object.freeze({
    version: '0.1.0-stage1',
    seed,
    clock,
    tools,
    enablePack,
    disablePack,
    getProfile: () => ({
      preset: profile.preset,
      core: [...profile.core],
      modules: [...profile.modules],
      packs: [...profile.packs],
      estBundleKB: profile.estBundleKB,
      savingsPct: profile.savingsPct,
    }),
    getWorldGraph: () => graph,
    getHeightField: () => heightField,
    // Защищённая точка проверки для тестов ToolGuard (не раскрывает mintAuthority!)
    _verifySealedMesh: (handle) => vault.isSealedMesh(handle),
    _verifySealedTexture: (handle) => vault.isSealedTexture(handle),
    _attemptSecondMint: () => vault.claimMintAuthority('attacker'),
  });
}
