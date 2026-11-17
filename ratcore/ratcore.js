// RatCore — Главная публичная точка входа движка (v1.0.0 — все 10 модулей и 14 пакетов по выбору, изолированно внутри ratcore/)
// Работает в браузере и в Node.js 22 без сборщиков и внешних зависимостей.

export const RATCORE_VERSION = '1.0.0';
export { createRatCoreEngine as createEngine } from './src/tools/toolkit.js';
export { auditSourceCode } from './src/core/code-auditor.js';
export { CORE_BRANCHES, STANDARD_MODULES, OPTIONAL_PACKS, PRESETS, resolveModuleProfile } from './src/core/modules.js';
export { packFaceId, unpackFaceId, damageFaceId, breakFaceId, FACE_SIDE } from './src/world/face-id.js';
export { parseLayerNotation } from './src/world/layers.js';
export { worldToScene, sceneToWorld, azimuthDeg, HeightField } from './src/world/coords.js';
export { SpatialHashGrid, ddaRaycast3D, PalettedChunk16, OccupancyBrick64 } from './src/world/spatial.js';
export { RasterSurface, packRGBA, unpackRGBA } from './src/assets/raster.js';
export { packVertex64 } from './src/assets/mesh-builder.js';
export { createRng, fnv1a32Bytes, fnv1a32String, fbm2D, ridged2D, domainWarp2D } from './src/core/math.js';
export { createClock } from './src/core/clock.js';
export { InputManager } from './src/core/input.js';
export { UiHudManager, UI_WIDGET_KINDS } from './src/core/ui.js';
export { crc32, zigzagEncode, zigzagDecode, encodeVarints, decodeVarints, encodeDeltaInt32, decodeDeltaInt32, rleCompress, rleDecompress, lzCompress, lzDecompress, RATCORE_DICT_V1 } from './src/compress/codec.js';
export { RCW2_MAGIC, RCW2_CODEC, RCW2_CHANNEL, encodeWire2Frame, decodeWire2Frame, fastCdcSplit, diffFastCdcChunks, xorFecParity, xorFecRecover, Wire2StreamWindow } from './src/compress/wire2.js';
export { RatCoreCloudSync } from './src/compress/cloud-adapter.js';
export { CoreGovernor, POWER_PROFILES } from './src/runtime/governor.js';
export { RatCoreWorkerPool } from './src/runtime/worker-pool.js';
export { WebGL2Renderer, createHeadlessWebGL2Context, WEBGL2_VERT_MAIN, WEBGL2_FRAG_MAIN } from './src/render/webgl2-renderer.js';
export { AnimationSystem, solveTwoBoneIK } from './src/modules/anim.js';
export { FxSystem } from './src/modules/fx.js';
export { GameAiSystem } from './src/modules/ai.js';
export { SimulationEconomy } from './src/modules/sim.js';
export { TestAutomationSuite } from './src/modules/test.js';
export { encodeInput12, decodeInput12 } from './src/packs/multiplayer.js';
export { STYLE_PRESETS } from './src/packs/styles.js';
export { exportSingleHtmlGame } from './src/packs/exporter.js';
export { WebGpuComputePipeline, WGSL_FRUSTUM_CULL_SHADER, WGSL_PARTICLE_STEP_SHADER } from './src/packs/webgpu.js';
export { WasmAccelerator, buildRatCoreWasmBytes } from './src/packs/wasm-accel.js';
export { ModSandboxManager } from './src/packs/mods.js';
export { CinemaDirector, scoreCoverComposition } from './src/packs/cinema.js';
export { VoiceSynthSuite, VOICE_STYLES } from './src/packs/voice.js';
export { CompanionAiSystem, parseNaturalCommand } from './src/packs/companion.js';
export { AccessibilityAssistSystem, COLORBLIND_MODES } from './src/packs/assist.js';
export { TimelineDebugger, RatStudioController, runAutoBalance, findBalanceExploits } from './src/packs/studio.js';
