// RatCore — Главная публичная точка входа движка (v0.2 Этап 2, изолированно внутри ratcore/)
// Работает в браузере и в Node.js 22 без сборщиков и внешних зависимостей.

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
export { crc32, zigzagEncode, zigzagDecode, encodeVarints, decodeVarints, encodeDeltaInt32, decodeDeltaInt32, rleCompress, rleDecompress, lzCompress, lzDecompress, RATCORE_DICT_V1 } from './src/compress/codec.js';
export { RCW2_MAGIC, RCW2_CODEC, RCW2_CHANNEL, encodeWire2Frame, decodeWire2Frame, fastCdcSplit, diffFastCdcChunks, xorFecParity, xorFecRecover, Wire2StreamWindow } from './src/compress/wire2.js';
export { RatCoreCloudSync } from './src/compress/cloud-adapter.js';
export { CoreGovernor, POWER_PROFILES } from './src/runtime/governor.js';
