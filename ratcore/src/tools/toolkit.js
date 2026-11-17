// RatCore — Единый шлюз инструментов RatCore.tools.* (v0.2 Этап 2: ядро + RCW2 + CoreGovernor 75 % + Opt-In модули + AI-Team)
// Захватывает одноразовую печать claimMintAuthority() (Барьер 1) и обслуживает все операции через единый конвейер §0.

import { createClock } from '../core/clock.js';
import { createToolGuardVault, RatCoreError } from '../core/seal.js';
import { InputManager } from '../core/input.js';
import { UiHudManager } from '../core/ui.js';
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
import { packRGBA } from '../assets/raster.js';
import { encodeWire2Frame, decodeWire2Frame, fastCdcSplit, diffFastCdcChunks } from '../compress/wire2.js';
import { CoreGovernor } from '../runtime/governor.js';
import { PhysicsWorld } from '../modules/phys.js';
import { NavigationSystem } from '../modules/nav.js';
import { EnvironmentSystem } from '../modules/env.js';
import { synthesizeSoundPCM, AcousticWorld } from '../modules/audio.js';
import { AiTeamSuite } from '../packs/ai-team.js';
import { DestructionSystem } from '../packs/destruction.js';
import { MultiplayerSession, encodeInput12, decodeInput12 } from '../packs/multiplayer.js';
import { NarrativeSuite } from '../packs/narrative.js';
import { EcologySystem } from '../packs/ecology.js';
import { StyleShaderPipeline } from '../packs/styles.js';
import { exportSingleHtmlGame } from '../packs/exporter.js';
import { WebGL2Renderer } from '../render/webgl2-renderer.js';
import { WebGpuComputePipeline } from '../packs/webgpu.js';
import { WasmAccelerator } from '../packs/wasm-accel.js';
import { RatCoreWorkerPool } from '../runtime/worker-pool.js';
import { ModSandboxManager } from '../packs/mods.js';
import { CinemaDirector } from '../packs/cinema.js';
import { VoiceSynthSuite } from '../packs/voice.js';
import { CompanionAiSystem } from '../packs/companion.js';
import { AccessibilityAssistSystem } from '../packs/assist.js';
import { RatStudioController, runAutoBalance, findBalanceExploits } from '../packs/studio.js';
import { AnimationSystem, solveTwoBoneIK } from '../modules/anim.js';
import { FxSystem } from '../modules/fx.js';
import { GameAiSystem } from '../modules/ai.js';
import { SimulationEconomy } from '../modules/sim.js';
import { TestAutomationSuite } from '../modules/test.js';

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
  const inputMgr = new InputManager();
  const uiMgr = new UiHudManager();
  const governor = new CoreGovernor({
    profile: config.powerProfile || 'turbo',
    targetFps: config.targetFps || 60,
    logicalCores: config.logicalCores || (typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4),
  });
  const renderer3D = new Software3DRenderer(config.viewport || { width: 160, height: 90 });

  // Состояние мира
  let heightField = new HeightField({ width: 32, height: 32, cellSize: 1, originX: -16, originY: -16 });
  heightField.data.fill(1.0);
  let graph = new WorldGraph();
  const entities = new Map();
  const numericIdToEntityId = new Map();
  const spatial = new SpatialHashGrid(8);
  const snapshots = new Map();
  const operationLog = [];
  const undoStack = [];
  const memoCache = new Map();
  const perfCounters = new Map();
  const knownWireCdcHashes = new Set();
  const manifestTools = Array.isArray(config.manifest?.tools) ? config.manifest.tools : [];

  // Ленивые экземпляры опциональных подсистем (Zero-Cost Opt-In: null пока не включены!)
  let physWorld = null;
  let navSystem = null;
  let envSystem = null;
  let acousticWorld = null;
  let aiTeamSuite = null;
  let destructionSys = null;
  let multiplayerSys = null;
  let narrativeSys = null;
  let ecologySys = null;
  let stylePipeline = null;
  let webgl2Renderer = null;
  let activeRenderBackend = 'software';
  let webgpuPipeline = null;
  let wasmAccel = null;
  let modManager = null;
  let cinemaDirector = null;
  let voiceSuite = null;
  let companionSys = null;
  let assistSys = null;
  let studioCtrl = null;
  let animSys = null;
  let fxSys = null;
  let gameAiSys = null;
  let simEconomy = null;
  let testSuite = null;
  const workerPool = new RatCoreWorkerPool({ governor });

  let nextEntityNumericId = 1;
  let nextTraceNum = 1;
  let wireSeq = 1;
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

  function buildWorldSnapshotObj() {
    return {
      schema: 'ratcore-save/1',
      seed,
      tick: clock.tick,
      entities: [...entities.values()].map((e) => ({
        id: e.id, x: e.x, y: e.y, h: e.h, yaw: e.yaw, scale: e.scale, tag: e.tag, meshId: e.mesh.id,
      })),
      nodes: [...graph.nodes.values()],
      edges: [...graph.edges.values()],
    };
  }

  function renderFrameWithCamera(camOverride = camera) {
    let bgColor = packRGBA(18, 28, 42, 255);
    if (envSystem) {
      const light = envSystem.getLightingState();
      renderer3D.sunDir = light.sunDir;
      bgColor = packRGBA(light.skyRgb[0], light.skyRgb[1], light.skyRgb[2], 255);
    }
    const frame = renderer3D.renderScene({ vault, entities: [...entities.values()], camera: camOverride, bgColor });
    if (stylePipeline && profile.activeBranches.has('shader')) {
      stylePipeline.processSurface(frame.surface);
    }
    if (assistSys && profile.activeBranches.has('assist')) {
      assistSys.transformSurface(frame.surface);
    }
    return frame;
  }

  function renderCurrentFrame() {
    return renderFrameWithCamera(camera);
  }

  function requireStudioPack(toolName) {
    if (!profile.activeBranches.has('studio')) {
      throw new RatCoreError(
        'RC-108',
        `OPTIONAL_MODULE_DISABLED: ${toolName} требует пакет pack:studio (Zero-Cost Opt-In)`,
        `Добавь 'pack:studio' в createEngine({ packs: ['pack:studio'] }) или вызови engine.enablePack('pack:studio').`,
      );
    }
    if (!studioCtrl) studioCtrl = new RatStudioController();
    return studioCtrl;
  }

  // ---------------------------- Уровень 0: Ядровые ветки (Core Always-On) ----------------------------
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
          id, numericId, mesh: args.mesh, texture: args.texture || null,
          x, y, h, yaw: Number(args.yaw || 0), scale: Number(args.scale || 1),
          radius: Number(args.radius || 1), tag: String(args.tag || 'object'),
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
        return { top3: rows.slice(0, 3), totalTrackedTools: rows.length, vault: vault.getStats(), governor: governor.getStats() };
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
        const frame = renderCurrentFrame();
        const out = {
          width: frame.width,
          height: frame.height,
          backend: activeRenderBackend,
          drawnTris: frame.drawnTris,
          nonEmptyRatio: Number(frame.nonEmptyRatio.toFixed(4)),
        };
        if (args.format === 'ascii') out.ascii = frame.surface.toAscii(args.cols || 40, args.rows || 18);
        if (args.includePixels) {
          out.pixels = frame.surface.pixels;
          out.objectIdBuffer = frame.objectIdBuffer;
        }
        return out;
      }),

      setBackend: wrapTool('look.setBackend', (args) => {
        const requested = String(args.backend || 'software');
        if (requested === 'webgl2') {
          if (!webgl2Renderer || args.canvas || args.gl) {
            webgl2Renderer = new WebGL2Renderer({
              canvas: args.canvas || null,
              gl: args.gl || null,
              width: args.width || renderer3D.width,
              height: args.height || renderer3D.height,
              uploadAndDrop: args.uploadAndDrop !== false,
            });
          }
          if (webgl2Renderer.gl) {
            activeRenderBackend = 'webgl2';
            return { backend: 'webgl2', available: true, stats: webgl2Renderer.getStats() };
          }
          activeRenderBackend = 'software';
          return { backend: 'software', available: false, reason: 'webgl2-context-unavailable' };
        }
        activeRenderBackend = 'software';
        return { backend: 'software', available: true };
      }),

      shaderPrewarm: wrapTool('look.shaderPrewarm', (args) => {
        if (!webgl2Renderer) return { done: true, available: false, prewarmedShaders: 0 };
        return args.all ? webgl2Renderer.prewarmAll() : webgl2Renderer.stepShaderPrewarm();
      }),

      renderWebGL2: wrapTool('look.renderWebGL2', (args) => {
        if (!webgl2Renderer || !webgl2Renderer.gl) {
          return { ok: false, backend: 'unavailable', reason: 'Call look.setBackend({ backend: "webgl2", canvas|gl }) first' };
        }
        let bgRgb = [18 / 255, 28 / 255, 42 / 255];
        if (envSystem) {
          const light = envSystem.getLightingState();
          webgl2Renderer.sunDir = light.sunDir;
          bgRgb = [light.skyRgb[0] / 255, light.skyRgb[1] / 255, light.skyRgb[2] / 255];
        }
        const stylePreset = stylePipeline && profile.activeBranches.has('shader') ? stylePipeline.activePreset : 'none';
        return webgl2Renderer.renderScene({
          vault,
          entities: [...entities.values()],
          camera,
          bgRgb,
          stylePreset,
          objectIdPass: Boolean(args.objectIdPass),
        });
      }),

      rendererStats: wrapTool('look.rendererStats', () => ({
        activeBackend: activeRenderBackend,
        software: { width: renderer3D.width, height: renderer3D.height },
        webgl2: webgl2Renderer ? webgl2Renderer.getStats() : WebGL2Renderer.probe(),
      })),
    },

    see: {
      visibleEntities: wrapTool('see.visibleEntities', () => {
        const frame = renderCurrentFrame();
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
        const frame = renderCurrentFrame();
        if (entities.size > 0 && frame.nonEmptyRatio < 0.001) {
          issues.push({ code: 'RC-401', message: 'Пустой кадр: ни одна сущность не попала в поле зрения камеры' });
        }
        return { ok: issues.length === 0, nonEmptyRatio: frame.nonEmptyRatio, issues };
      }),

      raycastVoxel: wrapTool('see.raycastVoxel', (args) => ddaRaycast3D({
        origin: args.origin || [0, 0, 0],
        dir: args.dir || [1, 0, 0],
        maxDist: args.maxDist || 64,
        isSolid: typeof args.isSolid === 'function' ? args.isSolid : () => false,
      })),
    },

    input: {
      bind: wrapTool('input.bind', (args) => inputMgr.bind(args)),
      remap: wrapTool('input.remap', (args) => inputMgr.remap(args)),
      pushEvent: wrapTool('input.pushEvent', (args) => inputMgr.pushEvent({ tick: clock.tick, ...args })),
      poll: wrapTool('input.poll', (args) => inputMgr.poll({ tick: clock.tick, ...args })),
      consumeBuffered: wrapTool('input.consumeBuffered', (args) => inputMgr.consumeBuffered({ tick: clock.tick, ...args })),
      startRecord: wrapTool('input.startRecord', () => inputMgr.startRecord()),
      stopRecord: wrapTool('input.stopRecord', () => inputMgr.stopRecord()),
      replayAt: wrapTool('input.replayAt', (args) => inputMgr.replayAt(args)),
      state: wrapTool('input.state', () => inputMgr.getState()),
    },

    ui: {
      setWidget: wrapTool('ui.setWidget', (args) => uiMgr.setWidget(args)),
      removeWidget: wrapTool('ui.removeWidget', (args) => uiMgr.removeWidget(args)),
      notify: wrapTool('ui.notify', (args) => uiMgr.notify(args)),
      openDialog: wrapTool('ui.openDialog', (args) => uiMgr.openDialog(args)),
      chooseDialog: wrapTool('ui.chooseDialog', (args) => uiMgr.chooseDialog(args)),
      tick: wrapTool('ui.tick', (args) => uiMgr.tick(args)),
      hudSummary: wrapTool('ui.hudSummary', () => uiMgr.getSummary({ tick: clock.tick, entities: entities.size, governor: governor.getStats() })),
    },

    save: {
      exportJson: wrapTool('save.exportJson', () => buildWorldSnapshotObj()),

      // Уровень 11: Бинарный экспорт мира в ratcore-wire/2 + FastCDC дедупликация + CRC32
      exportWire2: wrapTool('save.exportWire2', (args) => {
        const snap = buildWorldSnapshotObj();
        const rawBytes = new TextEncoder().encode(JSON.stringify(snap));
        const cdc = fastCdcSplit(rawBytes);
        const dedup = diffFastCdcChunks(cdc, args.resetDedup ? new Set() : knownWireCdcHashes);
        const wire = encodeWire2Frame(rawBytes, { seq: wireSeq++, codec: args.codec || 'auto' });
        return {
          ...wire,
          cdcChunks: dedup.totalChunks,
          cdcSentChunks: dedup.sentChunks,
          dedupSavedPct: dedup.dedupSavedPct,
        };
      }),

      importWire2: wrapTool('save.importWire2', (args) => {
        if (!args.frame) throw new RatCoreError('RC-701', 'Не передан бинарный буфер frame', 'Передай Uint8Array из save.exportWire2().');
        return decodeWire2Frame(args.frame, { asJson: true });
      }),

      // Сквозная надстройка «Машина времени» (F-143..F-144, A-96 — требует pack:studio)
      timelineInit: wrapTool('save.timelineInit', (args) => {
        const st = requireStudioPack('save.timelineInit');
        const res = st.timeline.init(args);
        st.timeline.record({ tick: clock.tick, snapshot: buildWorldSnapshotObj(), forceKeyframe: true });
        return res;
      }),

      timelineRecord: wrapTool('save.timelineRecord', (args) => {
        const st = requireStudioPack('save.timelineRecord');
        return st.timeline.record({
          tick: args.tick ?? clock.tick,
          snapshot: buildWorldSnapshotObj(),
          branchId: args.branchId,
          forceKeyframe: Boolean(args.forceKeyframe),
        });
      }),

      scrubTo: wrapTool('save.scrubTo', (args) => {
        const st = requireStudioPack('save.scrubTo');
        return st.timeline.scrubTo(args);
      }),

      branchFrom: wrapTool('save.branchFrom', (args) => {
        const st = requireStudioPack('save.branchFrom');
        return st.timeline.branchFrom(args);
      }),

      timelineCompare: wrapTool('save.timelineCompare', (args) => {
        const st = requireStudioPack('save.timelineCompare');
        return st.timeline.compareBranches(args);
      }),
    },

    stream: {
      setPowerProfile: wrapTool('stream.setPowerProfile', (args) => {
        const stats = governor.setPowerProfile(args.mode || 'turbo');
        return { mode: stats.profile.mode, targetCpuPct: stats.profile.targetCpuPct, targetWorkers: stats.targetWorkers, frameBudgetMs: stats.frameBudgetMs };
      }),

      setDynamicResolution: wrapTool('stream.setDynamicResolution', (args) => {
        governor.dynRes.enabled = args.enabled !== false;
        if (args.minScale !== undefined) governor.dynRes.minScale = Number(args.minScale);
        if (args.maxScale !== undefined) governor.dynRes.maxScale = Number(args.maxScale);
        return { ...governor.dynRes };
      }),

      setVisibilityHidden: wrapTool('stream.setVisibilityHidden', (args) => governor.setVisibilityHidden(Boolean(args.hidden))),

      governorEnqueue: wrapTool('stream.governorEnqueue', (args) => {
        governor.enqueue(args.priority ?? 2, args.name || 'job', typeof args.fn === 'function' ? args.fn : () => true);
        return { queued: true, pending: governor.queues.map((q) => q.length) };
      }),

      governorTick: wrapTool('stream.governorTick', (args) => governor.executeFrame({ simulatedFrameMs: args.simulatedFrameMs ?? null })),

      governorStats: wrapTool('stream.governorStats', () => governor.getStats()),

      sampleMemory: wrapTool('stream.sampleMemory', (args) => ({
        warning: governor.sampleMemory(args.activeEntities ?? entities.size, Number(args.usedBytes ?? 0)),
        totalWarnings: governor.leakWarnings.length,
      })),

      memoryStats: wrapTool('stream.memoryStats', () => ({
        profile: { preset: profile.preset, estBundleKB: profile.estBundleKB, savingsPct: profile.savingsPct, activePacks: profile.packs },
        vault: vault.getStats(),
        governor: governor.getStats(),
        workerPool: workerPool.getStats(),
        entities: entities.size,
      })),

      workerPoolStats: wrapTool('stream.workerPoolStats', () => workerPool.getStats()),
      syncWorkers: wrapTool('stream.syncWorkers', () => workerPool.syncWithGovernor()),
      dispatchWorkerTask: wrapTool('stream.dispatchWorkerTask', (args) => workerPool.dispatch(args)),
      shutdownWorkers: wrapTool('stream.shutdownWorkers', () => workerPool.terminate()),
    },
  };

  // ---------------------------- Уровни 1 и 2: Фабрики Opt-In модулей и пакетов ----------------------------
  function createModuleBranch(branch) {
    if (branch === 'phys') {
      if (!physWorld) physWorld = new PhysicsWorld();
      return {
        addBody: wrapTool('phys.addBody', (args) => physWorld.addBody(args)),
        applyImpulse: wrapTool('phys.applyImpulse', (args) => physWorld.applyImpulse(args.id, args.ix, args.iy, args.ih)),
        step: wrapTool('phys.step', (args) => {
          const res = physWorld.step(args.dt ?? clock.fixedDt, heightField);
          // Синхронизируем физические тела с сущностями сцены
          for (const b of physWorld.bodies.values()) {
            const ent = entities.get(b.id);
            if (ent) {
              ent.x = b.x; ent.y = b.y; ent.h = Math.max(heightField.sampleHeight(b.x, b.y), b.h - b.radius);
              spatial.insert(ent.id, ent.x, ent.y, ent.radius);
            }
          }
          return res;
        }),
        raycast: wrapTool('phys.raycast', (args) => physWorld.raycastBodies(args)),
        getBody: wrapTool('phys.getBody', (args) => (physWorld.bodies.has(args.id) ? { ...physWorld.bodies.get(args.id) } : null)),
        status: wrapTool('phys.status', () => ({ branch: 'phys', enabled: true, bodies: physWorld.bodies.size })),
      };
    }

    if (branch === 'nav') {
      if (!navSystem) navSystem = new NavigationSystem();
      return {
        findPath: wrapTool('nav.findPath', (args) => navSystem.findTerrainPath(heightField, args)),
        findGraphPath: wrapTool('nav.findGraphPath', (args) => graph.findPath(args.from, args.to, args)),
        rvoStep: wrapTool('nav.rvoStep', (args) => navSystem.computeRvoVelocity(args)),
        status: wrapTool('nav.status', () => ({ branch: 'nav', enabled: true })),
      };
    }

    if (branch === 'env') {
      if (!envSystem) envSystem = new EnvironmentSystem();
      return {
        setTime: wrapTool('env.setTime', (args) => envSystem.setTime(args.hours ?? 12)),
        advanceHours: wrapTool('env.advanceHours', (args) => envSystem.advanceHours(args.deltaHours ?? 1)),
        setWeather: wrapTool('env.setWeather', (args) => envSystem.setWeather(args)),
        sampleTemp: wrapTool('env.sampleTemp', (args) => ({ elevationH: Number(args.h || 0), tempC: envSystem.sampleTemperatureC(args.h || 0) })),
        state: wrapTool('env.state', () => envSystem.getState()),
        status: wrapTool('env.status', () => ({ branch: 'env', enabled: true, weather: envSystem.weather })),
      };
    }

    if (branch === 'audio') {
      if (!acousticWorld) acousticWorld = new AcousticWorld();
      return {
        synthesize: wrapTool('audio.synthesize', (args) => synthesizeSoundPCM(args)),
        emit: wrapTool('audio.emit', (args) => acousticWorld.emit({ ...args, tick: clock.tick })),
        status: wrapTool('audio.status', () => ({ branch: 'audio', enabled: true })),
      };
    }

    if (branch === 'hear') {
      if (!acousticWorld) acousticWorld = new AcousticWorld();
      return {
        emit: wrapTool('hear.emit', (args) => acousticWorld.emit({ ...args, tick: clock.tick })),
        listen: wrapTool('hear.listen', (args) => acousticWorld.listen({ ...args, currentTick: clock.tick, heightField })),
        status: wrapTool('hear.status', () => ({ branch: 'hear', enabled: true, activeEvents: acousticWorld.events.length })),
      };
    }

    // Пакет pack:ai-team (think, guess, comm, bugs, bridge)
    if (['think', 'guess', 'comm', 'bugs', 'bridge'].includes(branch)) {
      if (!aiTeamSuite) aiTeamSuite = new AiTeamSuite();
      if (branch === 'think') {
        return {
          start: wrapTool('think.start', (args, ctx) => aiTeamSuite.thinkStart({ ...args, agentId: ctx.agentId })),
          branch: wrapTool('think.branch', (args) => aiTeamSuite.thinkBranch(args)),
          conclude: wrapTool('think.conclude', (args) => aiTeamSuite.thinkConclude(args)),
          status: wrapTool('think.status', () => ({ branch: 'think', enabled: true, thoughts: aiTeamSuite.thoughts.size })),
        };
      }
      if (branch === 'guess') {
        return {
          propose: wrapTool('guess.propose', (args) => aiTeamSuite.guessPropose(args)),
          evidence: wrapTool('guess.evidence', (args) => aiTeamSuite.guessEvidence(args)),
          rank: wrapTool('guess.rank', () => aiTeamSuite.guessRank()),
          status: wrapTool('guess.status', () => ({ branch: 'guess', enabled: true, hypotheses: aiTeamSuite.hypotheses.size })),
        };
      }
      if (branch === 'comm') {
        return {
          post: wrapTool('comm.post', (args, ctx) => aiTeamSuite.commPost({ ...args, from: args.from || ctx.agentId })),
          read: wrapTool('comm.read', (args) => aiTeamSuite.commRead(args)),
          upsertTask: wrapTool('comm.upsertTask', (args) => aiTeamSuite.commUpsertTask(args)),
          status: wrapTool('comm.status', () => ({ branch: 'comm', enabled: true, tasks: aiTeamSuite.tasks.size })),
        };
      }
      if (branch === 'bugs') {
        return {
          report: wrapTool('bugs.report', (args, ctx) => aiTeamSuite.bugsReport({ ...args, author: args.author || ctx.agentId })),
          minimize: wrapTool('bugs.minimize', (args) => aiTeamSuite.bugsMinimize(args)),
          list: wrapTool('bugs.list', () => [...aiTeamSuite.reports]),
          status: wrapTool('bugs.status', () => ({ branch: 'bugs', enabled: true, reports: aiTeamSuite.reports.length })),
        };
      }
      if (branch === 'bridge') {
        return {
          exportScene: wrapTool('bridge.exportScene', (args) => aiTeamSuite.bridgeExportScene({
            format: args.format || 'three-json',
            worldSnapshot: buildWorldSnapshotObj(),
            vault,
            entities: [...entities.values()],
          })),
          verifyWire2: wrapTool('bridge.verifyWire2', (args) => aiTeamSuite.bridgeVerifyWire2(args.frame)),
          status: wrapTool('bridge.status', () => ({ branch: 'bridge', enabled: true })),
        };
      }
    }

    // Пакет pack:destruction (граф опор + обрушение + огонь по ветру)
    if (branch === 'destroy') {
      if (!destructionSys) destructionSys = new DestructionSystem();
      return {
        registerStructure: wrapTool('destroy.registerStructure', (args) => destructionSys.registerStructure(args)),
        damage: wrapTool('destroy.damage', (args) => destructionSys.damageBlock(args)),
        ignite: wrapTool('destroy.ignite', (args) => destructionSys.ignite(args)),
        extinguish: wrapTool('destroy.extinguish', (args) => destructionSys.extinguish(args)),
        tickFire: wrapTool('destroy.tickFire', (args) => {
          const wind = envSystem ? envSystem.getWindVector() : { dx: args.windDx ?? 2, dy: args.windDy ?? 0 };
          const isRaining = args.isRaining !== undefined
            ? Boolean(args.isRaining)
            : (envSystem ? (envSystem.weather === 'rain' || envSystem.weather === 'storm') : false);
          return destructionSys.tickFire({ dt: args.dt ?? 1, windDx: args.windDx ?? wind.dx, windDy: args.windDy ?? wind.dy, isRaining });
        }),
        debris: wrapTool('destroy.debris', () => ({ count: destructionSys.debris.length, items: destructionSys.debris.slice(-32) })),
        status: wrapTool('destroy.status', () => ({ branch: 'destroy', enabled: true, structures: destructionSys.structures.size, fires: destructionSys.fires.size })),
      };
    }

    // Пакет pack:multiplayer (комнаты + 12-байтный ввод + Rollback Netcode)
    if (branch === 'net') {
      if (!multiplayerSys) multiplayerSys = new MultiplayerSession();
      return {
        createRoom: wrapTool('net.createRoom', (args) => multiplayerSys.createRoom(args)),
        joinRoom: wrapTool('net.joinRoom', (args) => multiplayerSys.joinRoom(args)),
        encodeInput12: wrapTool('net.encodeInput12', (args) => ({ bytes: encodeInput12(args) })),
        decodeInput12: wrapTool('net.decodeInput12', (args) => decodeInput12(args.bytes)),
        commitTick: wrapTool('net.commitTick', (args) => multiplayerSys.commitTick(args)),
        receiveRemoteInput: wrapTool('net.receiveRemoteInput', (args) => multiplayerSys.receiveRemoteInput(args)),
        recordRtt: wrapTool('net.recordRtt', (args) => multiplayerSys.recordRtt(args.rttMs ?? 25)),
        status: wrapTool('net.status', () => ({ branch: 'net', enabled: true, rooms: multiplayerSys.rooms.size, rollbacks: multiplayerSys.rollbacks })),
      };
    }

    // Пакет pack:narrative (story + quest без софтлоков)
    if (branch === 'story' || branch === 'quest') {
      if (!narrativeSys) narrativeSys = new NarrativeSuite(seed);
      if (branch === 'story') {
        return {
          directorTick: wrapTool('story.directorTick', (args) => narrativeSys.directorTick(args)),
          addChronicle: wrapTool('story.addChronicle', (args) => narrativeSys.addChronicle({ ...args, tick: clock.tick })),
          setFactionRelation: wrapTool('story.setFactionRelation', (args) => narrativeSys.setFactionRelation(args)),
          chronicle: wrapTool('story.chronicle', () => [...narrativeSys.chronicle]),
          status: wrapTool('story.status', () => ({ branch: 'story', enabled: true, tension: narrativeSys.tension })),
        };
      }
      return {
        generate: wrapTool('quest.generate', (args) => narrativeSys.generateQuest(args)),
        verifyNoSoftlocks: wrapTool('quest.verifyNoSoftlocks', (args) => narrativeSys.verifyNoSoftlocks(args.stages || [])),
        status: wrapTool('quest.status', () => ({ branch: 'quest', enabled: true, quests: narrativeSys.quests.size })),
      };
    }

    // Пакет pack:ecology (Стефан/Гольд лёд, эрозия, фауна)
    if (branch === 'eco') {
      if (!ecologySys) ecologySys = new EcologySystem();
      return {
        setSeason: wrapTool('eco.setSeason', (args) => ecologySys.setSeason(args.season)),
        stepIce: wrapTool('eco.stepIce', (args) => ecologySys.stepIce(args)),
        iceStressTest: wrapTool('eco.iceStressTest', (args) => ecologySys.iceStressTest(args)),
        erodeTerrain: wrapTool('eco.erodeTerrain', (args) => ecologySys.erodeTerrain(heightField, args)),
        tickFauna: wrapTool('eco.tickFauna', () => ecologySys.tickFauna()),
        status: wrapTool('eco.status', () => ({ branch: 'eco', enabled: true, iceThicknessCm: ecologySys.iceThicknessCm })),
      };
    }

    // Пакет pack:styles (PS1 / CRT / Thermal / Nightvision / Cel)
    if (branch === 'shader') {
      if (!stylePipeline) stylePipeline = new StyleShaderPipeline();
      return {
        applyPreset: wrapTool('shader.applyPreset', (args) => stylePipeline.applyPreset(args)),
        state: wrapTool('shader.state', () => ({ activePreset: stylePipeline.activePreset, params: { ...stylePipeline.params } })),
        status: wrapTool('shader.status', () => ({ branch: 'shader', enabled: true, activePreset: stylePipeline.activePreset })),
      };
    }

    // Пакет pack:studio (RatStudio dev-оверлей + Машина времени + Автобалансировщик + экспорт 1 .html < 300 КБ)
    if (branch === 'studio') {
      if (!studioCtrl) studioCtrl = new RatStudioController();
      return {
        open: wrapTool('studio.open', (args) => studioCtrl.open(args)),
        close: wrapTool('studio.close', () => studioCtrl.close()),
        inspectScene: wrapTool('studio.inspectScene', () => studioCtrl.inspectScene({
          entities: [...entities.values()],
          vaultStats: vault.getStats(),
          governorStats: governor.getStats(),
          profile,
        })),
        timelineSummary: wrapTool('studio.timelineSummary', () => studioCtrl.timeline.summary()),
        autoBalance: wrapTool('studio.autoBalance', (args) => runAutoBalance({ seed, ...args })),
        findExploits: wrapTool('studio.findExploits', (args) => findBalanceExploits({ seed, ...args })),
        exportSingleHtml: wrapTool('studio.exportSingleHtml', (args) => exportSingleHtmlGame({
          title: args.title || 'RatCore Game',
          author: args.author || 'RatCore Studio',
          snapshot: buildWorldSnapshotObj(),
        })),
        diagnostics: wrapTool('studio.diagnostics', () => ({
          version: '1.0.0',
          studioOpen: studioCtrl.isOpen,
          panels: [...studioCtrl.panels],
          profile: { preset: profile.preset, activePacks: [...profile.packs], savingsPct: profile.savingsPct },
          vault: vault.getStats(),
          governor: governor.getStats(),
          workerPool: workerPool.getStats(),
        })),
        status: wrapTool('studio.status', () => ({ branch: 'studio', enabled: true, open: studioCtrl.isOpen })),
      };
    }

    // Пакет pack:mods (.ratmod.rcw2, ToolGuard аудит, ModQuota, Hot-Reload)
    if (branch === 'mod') {
      if (!modManager) modManager = new ModSandboxManager();
      return {
        pack: wrapTool('mod.pack', (args) => modManager.pack(args)),
        validate: wrapTool('mod.validate', (args) => modManager.validate(args)),
        mount: wrapTool('mod.mount', (args) => modManager.mount(args)),
        recordCpu: wrapTool('mod.recordCpu', (args) => modManager.recordModCpu(args)),
        hotReload: wrapTool('mod.hotReload', (args) => modManager.hotReload(args)),
        unmount: wrapTool('mod.unmount', (args) => modManager.unmount(args)),
        list: wrapTool('mod.list', () => modManager.list()),
        status: wrapTool('mod.status', () => ({ branch: 'mod', enabled: true, mounted: modManager.mounted.size, loadOrder: [...modManager.loadOrder] })),
      };
    }

    // Пакет pack:cinema (рельсы камеры по длине дуги, таймлапсы, авто-обложка 16:9)
    if (branch === 'cutscene') {
      if (!cinemaDirector) cinemaDirector = new CinemaDirector();
      return {
        createTrack: wrapTool('cutscene.createTrack', (args) => cinemaDirector.createTrack(args)),
        play: wrapTool('cutscene.play', (args) => {
          const res = cinemaDirector.play(args);
          if (args.applyCamera !== false && res.camera) Object.assign(camera, res.camera);
          return res;
        }),
        seek: wrapTool('cutscene.seek', (args) => {
          const res = cinemaDirector.seek(args);
          if (args.applyCamera !== false && res.camera) Object.assign(camera, res.camera);
          return res;
        }),
        timelapseStart: wrapTool('cutscene.timelapseStart', (args) => cinemaDirector.timelapseStart(args)),
        timelapseCapture: wrapTool('cutscene.timelapseCapture', (args) => cinemaDirector.timelapseCapture({
          tick: args.tick ?? clock.tick,
          renderAtCamera: (cam) => renderFrameWithCamera(cam),
        })),
        timelapseFinish: wrapTool('cutscene.timelapseFinish', () => cinemaDirector.timelapseFinish()),
        autoCover: wrapTool('cutscene.autoCover', (args) => cinemaDirector.autoCover({
          ...args,
          renderAtCamera: (cam) => renderFrameWithCamera(cam),
        })),
        status: wrapTool('cutscene.status', () => ({ branch: 'cutscene', enabled: true, tracks: cinemaDirector.tracks.size })),
      };
    }

    // Пакет pack:voice (офлайн 3-формантный синтез, рация и липсинк 0 КБ сэмплов)
    if (branch === 'voice') {
      if (!voiceSuite) voiceSuite = new VoiceSynthSuite();
      return {
        createProfile: wrapTool('voice.createProfile', (args) => voiceSuite.createProfile(args)),
        speak: wrapTool('voice.speak', (args) => voiceSuite.speak({ seed, ...args })),
        getViseme: wrapTool('voice.getViseme', (args) => voiceSuite.getViseme(args)),
        status: wrapTool('voice.status', () => ({ branch: 'voice', enabled: true, profiles: voiceSuite.profiles.size, utterances: voiceSuite.utterances.size })),
      };
    }

    // Пакет pack:companion (локальный ИИ-напарник со зрением see и слухом hear)
    if (branch === 'coopAi') {
      if (!companionSys) companionSys = new CompanionAiSystem();
      return {
        spawn: wrapTool('coopAi.spawn', (args) => companionSys.spawn(args)),
        order: wrapTool('coopAi.order', (args) => {
          const visibleRes = coreImpl.see.visibleEntities();
          const heardEvents = args.heardEvents || (acousticWorld ? acousticWorld.listen({
            x: args.playerPos?.x ?? 0,
            y: args.playerPos?.y ?? 0,
            h: args.playerPos?.h ?? 1,
            currentTick: clock.tick,
            heightField,
          }) : []);
          return companionSys.order({
            ...args,
            visibleEntities: visibleRes.ok ? visibleRes.data.visible : [],
            heardEvents,
          });
        }),
        step: wrapTool('coopAi.step', (args) => companionSys.step(args)),
        explainLastAction: wrapTool('coopAi.explainLastAction', (args) => companionSys.explainLastAction(args)),
        status: wrapTool('coopAi.status', () => ({ branch: 'coopAi', enabled: true, companions: companionSys.companions.size })),
      };
    }

    // Пакет pack:assist (умный наставник, дальтонизм, аудио-субтитры, режим 1 руки)
    if (branch === 'assist') {
      if (!assistSys) assistSys = new AccessibilityAssistSystem();
      return {
        trackPlayer: wrapTool('assist.trackPlayer', (args) => assistSys.trackPlayer(args)),
        setVisualMode: wrapTool('assist.setVisualMode', (args) => assistSys.setVisualMode(args)),
        setAudioSubtitles: wrapTool('assist.setAudioSubtitles', (args) => assistSys.setAudioSubtitles(args)),
        audioSubtitles: wrapTool('assist.audioSubtitles', (args) => {
          const hearEvents = args.hearEvents || (acousticWorld ? acousticWorld.listen({
            x: args.listenerPos?.x ?? camera.x,
            y: args.listenerPos?.y ?? camera.y,
            h: args.listenerPos?.h ?? camera.h,
            currentTick: clock.tick,
            heightField,
          }) : []);
          return assistSys.formatAudioSubtitles({ listenerPos: args.listenerPos || camera, hearEvents });
        }),
        setOneHandMobile: wrapTool('assist.setOneHandMobile', (args) => assistSys.setOneHandMobile(args)),
        status: wrapTool('assist.status', () => ({ branch: 'assist', enabled: true, visual: { ...assistSys.visual }, oneHand: { ...assistSys.oneHand } })),
      };
    }

    // Стандартные жанровые модули Уровня 1: anim, fx, ai, sim, test
    if (branch === 'anim') {
      if (!animSys) animSys = new AnimationSystem();
      return {
        solveTwoBoneIK: wrapTool('anim.solveTwoBoneIK', (args) => solveTwoBoneIK(args)),
        defineClip: wrapTool('anim.defineClip', (args) => animSys.defineClip(args)),
        sampleClip: wrapTool('anim.sampleClip', (args) => animSys.sampleClip(args)),
        createVerletChain: wrapTool('anim.createVerletChain', (args) => animSys.createVerletChain(args)),
        stepVerletChain: wrapTool('anim.stepVerletChain', (args) => animSys.stepVerletChain(args)),
        status: wrapTool('anim.status', () => ({ branch: 'anim', enabled: true, clips: animSys.clips.size, chains: animSys.chains.size })),
      };
    }

    if (branch === 'fx') {
      if (!fxSys) fxSys = new FxSystem({ seed });
      return {
        emitBurst: wrapTool('fx.emitBurst', (args) => fxSys.emitBurst(args)),
        addDecal: wrapTool('fx.addDecal', (args) => fxSys.addDecal(args)),
        addCameraShake: wrapTool('fx.addCameraShake', (args) => fxSys.addCameraShake(args)),
        step: wrapTool('fx.step', (args) => fxSys.step(args)),
        status: wrapTool('fx.status', () => ({ branch: 'fx', enabled: true, activeParticles: fxSys.activeCount, decals: fxSys.decals.length })),
      };
    }

    if (branch === 'ai') {
      if (!gameAiSys) gameAiSys = new GameAiSystem();
      return {
        registerAgent: wrapTool('ai.registerAgent', (args) => gameAiSys.registerAgent(args)),
        evaluateUtility: wrapTool('ai.evaluateUtility', (args) => gameAiSys.evaluateUtility(args)),
        planGoal: wrapTool('ai.planGoal', (args) => gameAiSys.planGoal(args)),
        nluParse: wrapTool('ai.nluParse', (args) => gameAiSys.nluParse(args)),
        status: wrapTool('ai.status', () => ({ branch: 'ai', enabled: true, agents: gameAiSys.agents.size })),
      };
    }

    if (branch === 'sim') {
      if (!simEconomy) simEconomy = new SimulationEconomy();
      return {
        setResource: wrapTool('sim.setResource', (args) => simEconomy.setResource(args)),
        defineRecipe: wrapTool('sim.defineRecipe', (args) => simEconomy.defineRecipe(args)),
        craft: wrapTool('sim.craft', (args) => simEconomy.craft(args)),
        tickEconomy: wrapTool('sim.tickEconomy', (args) => simEconomy.tickEconomy(args)),
        state: wrapTool('sim.state', () => simEconomy.getState()),
        status: wrapTool('sim.status', () => ({ branch: 'sim', enabled: true, population: simEconomy.population })),
      };
    }

    if (branch === 'test') {
      if (!testSuite) testSuite = new TestAutomationSuite();
      return {
        checkInvariants: wrapTool('test.checkInvariants', () => testSuite.checkInvariants({ entities: [...entities.values()], heightField, vault })),
        fuzzWalk: wrapTool('test.fuzzWalk', (args) => testSuite.fuzzWalk({ seed, ...args, heightField })),
        autoBalance: wrapTool('test.autoBalance', (args) => testSuite.autoBalance({ seed, ...args })),
        findExploits: wrapTool('test.findExploits', (args) => testSuite.findExploits({ seed, ...args })),
        status: wrapTool('test.status', () => ({ branch: 'test', enabled: true, runsCompleted: testSuite.runsCompleted })),
      };
    }

    // Пакет pack:webgpu (Compute-шейдеры WGSL frustum-куллинга и частиц с SoA fallback)
    if (branch === 'webgpu') {
      if (!webgpuPipeline) webgpuPipeline = new WebGpuComputePipeline();
      return {
        probe: wrapTool('webgpu.probe', () => webgpuPipeline.probe()),
        frustumCull: wrapTool('webgpu.frustumCull', (args) => webgpuPipeline.dispatchFrustumCull(args)),
        stepParticles: wrapTool('webgpu.stepParticles', (args) => webgpuPipeline.dispatchParticles(args)),
        shaders: wrapTool('webgpu.shaders', () => webgpuPipeline.getShaderSources()),
        status: wrapTool('webgpu.status', () => ({ branch: 'webgpu', enabled: true, ...webgpuPipeline.getStats() })),
      };
    }

    // Пакет pack:wasm-accel (встроенный бинарный WebAssembly-модуль горячих циклов + проба SIMD v128)
    if (branch === 'wasm') {
      if (!wasmAccel) wasmAccel = new WasmAccelerator();
      return {
        fnv1a32: wrapTool('wasm.fnv1a32', (args) => ({ hash: wasmAccel.fnv1a32(args.bytes || args.data || new Uint8Array(0)) })),
        deltaEncode: wrapTool('wasm.deltaEncode', (args) => ({ encoded: wasmAccel.deltaEncodeInt32(args.values || []) })),
        deltaDecode: wrapTool('wasm.deltaDecode', (args) => ({ decoded: wasmAccel.deltaDecodeInt32(args.encoded || []) })),
        stepGravity: wrapTool('wasm.stepGravity', (args) => wasmAccel.stepGravitySoA(args)),
        benchmark: wrapTool('wasm.benchmark', (args) => wasmAccel.benchmark(args)),
        status: wrapTool('wasm.status', () => ({ branch: 'wasm', enabled: true, ...wasmAccel.getStats() })),
      };
    }

    return {
      status: wrapTool(`${branch}.status`, () => ({ branch, enabled: true, stage: 'v1.0.0' })),
    };
  }

  const tools = {};

  function rebuildToolProxies() {
    for (const branch of ALL_BRANCH_NAMES) {
      if (coreImpl[branch]) {
        tools[branch] = coreImpl[branch];
      } else if (profile.activeBranches.has(branch)) {
        tools[branch] = createModuleBranch(branch);
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
        if (!ctx.dryRun && undoStack.length > undoBefore) {
          coreImpl.remove.undo({ steps: undoStack.length - undoBefore });
        }
        throw new RatCoreError(res.error.code, res.error.message, res.error.autoFixHint);
      }
      results.push(res.data);
    }
    return { executed: results.length, results };
  });

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
        id: item.id, branch: item.branch, tier: item.tier, pack: item.pack || null,
        enabled: isEnabled, score, summary: item.summary,
      };
    }).filter((r) => tokens.length === 0 || r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const neededPacks = [...new Set(scored.filter((s) => !s.enabled && s.pack).map((s) => s.pack))];
    return { query, matches: scored, neededPacks };
  });

  function enableModule(moduleName) {
    if (!STANDARD_MODULES.includes(moduleName)) {
      throw new RatCoreError('RC-104', `Неизвестный модуль: ${moduleName}`, `Доступные модули: ${STANDARD_MODULES.join(', ')}`);
    }
    if (!profile.modules.includes(moduleName)) profile.modules.push(moduleName);
    profile.activeBranches.add(moduleName);
    rebuildToolProxies();
    return { ok: true, enabledModule: moduleName, activeModules: [...profile.modules] };
  }

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
    version: '1.0.0',
    seed,
    clock,
    governor,
    tools,
    enableModule,
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
    _verifySealedMesh: (handle) => vault.isSealedMesh(handle),
    _verifySealedTexture: (handle) => vault.isSealedTexture(handle),
    _attemptSecondMint: () => vault.claimMintAuthority('attacker'),
  });
}
