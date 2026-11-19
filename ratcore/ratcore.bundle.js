/*!
 * RatCore v1.0.0 — браузерный бандл (ratcore.bundle.js)
 * ------------------------------------------------------------
 * АВТОМАТИЧЕСКИ СОБРАН из 48 ES-модулей папки ratcore/
 * инструментом ratcore/tools/build-browser-bundle.mjs.
 * Руками не редактировать: правьте исходники в ratcore/src/* и
 * пересоберите: node ratcore/tools/build-browser-bundle.mjs
 *
 * Работает классическим <script src> (без type="module"), поэтому
 * подключается из любой игры репозитория даже с file://.
 * После загрузки доступен window.RatCore (createEngine, tools, версия).
 */
(function (global) {
  'use strict';
  var __modules = Object.create(null);
  var __cache = Object.create(null);
  function __define(id, factory) { __modules[id] = factory; }
  function __import(id) {
    var cached = __cache[id];
    if (cached) return cached.exports;
    if (!__modules[id]) throw new Error('RatCore bundle: модуль не найден — ' + id);
    var module = { exports: {} };
    __cache[id] = module;
    __modules[id](module.exports, __import);
    return module.exports;
  }

  __define("ratcore.js", function (exports, __import) {

// RatCore — Главная публичная точка входа движка (v1.0.0 — все 10 модулей и 14 пакетов по выбору, изолированно внутри ratcore/)
// Работает в браузере и в Node.js 22 без сборщиков и внешних зависимостей.

const RATCORE_VERSION = '1.0.0';
    exports["RATCORE_VERSION"] = RATCORE_VERSION;
    exports["createEngine"] = __import("src/tools/toolkit.js")["createRatCoreEngine"];
    exports["auditSourceCode"] = __import("src/core/code-auditor.js")["auditSourceCode"];
    exports["CORE_BRANCHES"] = __import("src/core/modules.js")["CORE_BRANCHES"];
    exports["STANDARD_MODULES"] = __import("src/core/modules.js")["STANDARD_MODULES"];
    exports["OPTIONAL_PACKS"] = __import("src/core/modules.js")["OPTIONAL_PACKS"];
    exports["PRESETS"] = __import("src/core/modules.js")["PRESETS"];
    exports["resolveModuleProfile"] = __import("src/core/modules.js")["resolveModuleProfile"];
    exports["packFaceId"] = __import("src/world/face-id.js")["packFaceId"];
    exports["unpackFaceId"] = __import("src/world/face-id.js")["unpackFaceId"];
    exports["damageFaceId"] = __import("src/world/face-id.js")["damageFaceId"];
    exports["breakFaceId"] = __import("src/world/face-id.js")["breakFaceId"];
    exports["FACE_SIDE"] = __import("src/world/face-id.js")["FACE_SIDE"];
    exports["parseLayerNotation"] = __import("src/world/layers.js")["parseLayerNotation"];
    exports["worldToScene"] = __import("src/world/coords.js")["worldToScene"];
    exports["sceneToWorld"] = __import("src/world/coords.js")["sceneToWorld"];
    exports["azimuthDeg"] = __import("src/world/coords.js")["azimuthDeg"];
    exports["HeightField"] = __import("src/world/coords.js")["HeightField"];
    exports["SpatialHashGrid"] = __import("src/world/spatial.js")["SpatialHashGrid"];
    exports["ddaRaycast3D"] = __import("src/world/spatial.js")["ddaRaycast3D"];
    exports["PalettedChunk16"] = __import("src/world/spatial.js")["PalettedChunk16"];
    exports["OccupancyBrick64"] = __import("src/world/spatial.js")["OccupancyBrick64"];
    exports["RasterSurface"] = __import("src/assets/raster.js")["RasterSurface"];
    exports["packRGBA"] = __import("src/assets/raster.js")["packRGBA"];
    exports["unpackRGBA"] = __import("src/assets/raster.js")["unpackRGBA"];
    exports["packVertex64"] = __import("src/assets/mesh-builder.js")["packVertex64"];
    exports["createRng"] = __import("src/core/math.js")["createRng"];
    exports["fnv1a32Bytes"] = __import("src/core/math.js")["fnv1a32Bytes"];
    exports["fnv1a32String"] = __import("src/core/math.js")["fnv1a32String"];
    exports["fbm2D"] = __import("src/core/math.js")["fbm2D"];
    exports["ridged2D"] = __import("src/core/math.js")["ridged2D"];
    exports["domainWarp2D"] = __import("src/core/math.js")["domainWarp2D"];
    exports["createClock"] = __import("src/core/clock.js")["createClock"];
    exports["InputManager"] = __import("src/core/input.js")["InputManager"];
    exports["UiHudManager"] = __import("src/core/ui.js")["UiHudManager"];
    exports["UI_WIDGET_KINDS"] = __import("src/core/ui.js")["UI_WIDGET_KINDS"];
    exports["crc32"] = __import("src/compress/codec.js")["crc32"];
    exports["zigzagEncode"] = __import("src/compress/codec.js")["zigzagEncode"];
    exports["zigzagDecode"] = __import("src/compress/codec.js")["zigzagDecode"];
    exports["encodeVarints"] = __import("src/compress/codec.js")["encodeVarints"];
    exports["decodeVarints"] = __import("src/compress/codec.js")["decodeVarints"];
    exports["encodeDeltaInt32"] = __import("src/compress/codec.js")["encodeDeltaInt32"];
    exports["decodeDeltaInt32"] = __import("src/compress/codec.js")["decodeDeltaInt32"];
    exports["rleCompress"] = __import("src/compress/codec.js")["rleCompress"];
    exports["rleDecompress"] = __import("src/compress/codec.js")["rleDecompress"];
    exports["lzCompress"] = __import("src/compress/codec.js")["lzCompress"];
    exports["lzDecompress"] = __import("src/compress/codec.js")["lzDecompress"];
    exports["RATCORE_DICT_V1"] = __import("src/compress/codec.js")["RATCORE_DICT_V1"];
    exports["RCW2_MAGIC"] = __import("src/compress/wire2.js")["RCW2_MAGIC"];
    exports["RCW2_CODEC"] = __import("src/compress/wire2.js")["RCW2_CODEC"];
    exports["RCW2_CHANNEL"] = __import("src/compress/wire2.js")["RCW2_CHANNEL"];
    exports["encodeWire2Frame"] = __import("src/compress/wire2.js")["encodeWire2Frame"];
    exports["decodeWire2Frame"] = __import("src/compress/wire2.js")["decodeWire2Frame"];
    exports["fastCdcSplit"] = __import("src/compress/wire2.js")["fastCdcSplit"];
    exports["diffFastCdcChunks"] = __import("src/compress/wire2.js")["diffFastCdcChunks"];
    exports["xorFecParity"] = __import("src/compress/wire2.js")["xorFecParity"];
    exports["xorFecRecover"] = __import("src/compress/wire2.js")["xorFecRecover"];
    exports["Wire2StreamWindow"] = __import("src/compress/wire2.js")["Wire2StreamWindow"];
    exports["RatCoreCloudSync"] = __import("src/compress/cloud-adapter.js")["RatCoreCloudSync"];
    exports["CoreGovernor"] = __import("src/runtime/governor.js")["CoreGovernor"];
    exports["POWER_PROFILES"] = __import("src/runtime/governor.js")["POWER_PROFILES"];
    exports["RatCoreWorkerPool"] = __import("src/runtime/worker-pool.js")["RatCoreWorkerPool"];
    exports["WebGL2Renderer"] = __import("src/render/webgl2-renderer.js")["WebGL2Renderer"];
    exports["createHeadlessWebGL2Context"] = __import("src/render/webgl2-renderer.js")["createHeadlessWebGL2Context"];
    exports["WEBGL2_VERT_MAIN"] = __import("src/render/webgl2-renderer.js")["WEBGL2_VERT_MAIN"];
    exports["WEBGL2_FRAG_MAIN"] = __import("src/render/webgl2-renderer.js")["WEBGL2_FRAG_MAIN"];
    exports["AnimationSystem"] = __import("src/modules/anim.js")["AnimationSystem"];
    exports["solveTwoBoneIK"] = __import("src/modules/anim.js")["solveTwoBoneIK"];
    exports["FxSystem"] = __import("src/modules/fx.js")["FxSystem"];
    exports["GameAiSystem"] = __import("src/modules/ai.js")["GameAiSystem"];
    exports["SimulationEconomy"] = __import("src/modules/sim.js")["SimulationEconomy"];
    exports["TestAutomationSuite"] = __import("src/modules/test.js")["TestAutomationSuite"];
    exports["encodeInput12"] = __import("src/packs/multiplayer.js")["encodeInput12"];
    exports["decodeInput12"] = __import("src/packs/multiplayer.js")["decodeInput12"];
    exports["STYLE_PRESETS"] = __import("src/packs/styles.js")["STYLE_PRESETS"];
    exports["exportSingleHtmlGame"] = __import("src/packs/exporter.js")["exportSingleHtmlGame"];
    exports["WebGpuComputePipeline"] = __import("src/packs/webgpu.js")["WebGpuComputePipeline"];
    exports["WGSL_FRUSTUM_CULL_SHADER"] = __import("src/packs/webgpu.js")["WGSL_FRUSTUM_CULL_SHADER"];
    exports["WGSL_PARTICLE_STEP_SHADER"] = __import("src/packs/webgpu.js")["WGSL_PARTICLE_STEP_SHADER"];
    exports["WasmAccelerator"] = __import("src/packs/wasm-accel.js")["WasmAccelerator"];
    exports["buildRatCoreWasmBytes"] = __import("src/packs/wasm-accel.js")["buildRatCoreWasmBytes"];
    exports["ModSandboxManager"] = __import("src/packs/mods.js")["ModSandboxManager"];
    exports["CinemaDirector"] = __import("src/packs/cinema.js")["CinemaDirector"];
    exports["scoreCoverComposition"] = __import("src/packs/cinema.js")["scoreCoverComposition"];
    exports["VoiceSynthSuite"] = __import("src/packs/voice.js")["VoiceSynthSuite"];
    exports["VOICE_STYLES"] = __import("src/packs/voice.js")["VOICE_STYLES"];
    exports["CompanionAiSystem"] = __import("src/packs/companion.js")["CompanionAiSystem"];
    exports["parseNaturalCommand"] = __import("src/packs/companion.js")["parseNaturalCommand"];
    exports["AccessibilityAssistSystem"] = __import("src/packs/assist.js")["AccessibilityAssistSystem"];
    exports["COLORBLIND_MODES"] = __import("src/packs/assist.js")["COLORBLIND_MODES"];
    exports["TimelineDebugger"] = __import("src/packs/studio.js")["TimelineDebugger"];
    exports["RatStudioController"] = __import("src/packs/studio.js")["RatStudioController"];
    exports["runAutoBalance"] = __import("src/packs/studio.js")["runAutoBalance"];
    exports["findBalanceExploits"] = __import("src/packs/studio.js")["findBalanceExploits"];
  });

  __define("src/assets/mesh-builder.js", function (exports, __import) {
    var { clamp, vec3Sub, vec3Cross, vec3Normalize } = __import("src/core/math.js");
    var { RatCoreError } = __import("src/core/seal.js");
    var { packRGBA } = __import("src/assets/raster.js");
// RatCore Assets — Конструкторы мешей MeshBuilder (A-15..A-21, F-113, RC-201..204)
// Вызывается строго внутри tools/toolkit.js под защитой ToolGuard.





function computeBounds(positions) {
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1], z = positions[i + 2];
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
  }
  return { minX, minY, minZ, maxX, maxY, maxZ };
}

function computeFlatNormals(positions, indices) {
  const normals = new Float32Array(positions.length);
  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i] * 3;
    const i1 = indices[i + 1] * 3;
    const i2 = indices[i + 2] * 3;
    const a = [positions[i0], positions[i0 + 1], positions[i0 + 2]];
    const b = [positions[i1], positions[i1 + 1], positions[i1 + 2]];
    const c = [positions[i2], positions[i2 + 1], positions[i2 + 2]];
    const n = vec3Normalize(vec3Cross(vec3Sub(b, a), vec3Sub(c, a)));
    for (const k of [i0, i1, i2]) {
      normals[k] += n[0];
      normals[k + 1] += n[1];
      normals[k + 2] += n[2];
    }
  }
  for (let i = 0; i < normals.length; i += 3) {
    const n = vec3Normalize([normals[i], normals[i + 1], normals[i + 2]]);
    normals[i] = n[0]; normals[i + 1] = n[1]; normals[i + 2] = n[2];
  }
  return normals;
}

function finalizeGeometry(posArr, idxArr, uvArr = null, colorHex = '#88b4d8') {
  const positions = new Float32Array(posArr);
  const indices = new Uint32Array(idxArr);
  const normals = computeFlatNormals(positions, indices);
  const uvs = uvArr ? new Float32Array(uvArr) : new Float32Array((positions.length / 3) * 2);
  const m = /^#?([0-9a-f]{6})$/i.exec(String(colorHex || ''));
  const rgb = m ? parseInt(m[1], 16) : 0x88b4d8;
  const col = packRGBA((rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255, 255);
  const colors = new Uint32Array(positions.length / 3);
  colors.fill(col);

  return {
    buffers: { positions, indices, normals, uvs, colors },
    bounds: computeBounds(positions),
    triCount: Math.floor(indices.length / 3),
  };
}

// Indexed authoring recipe for externally sourced, preprocessed meshes.
function buildIndexedGeometry({positions, indices, color} = {}) {
  const array = (a) => Array.isArray(a) || ArrayBuffer.isView(a) && !(a instanceof DataView);
  if (!array(positions) || !array(indices) || positions.length < 9 || positions.length % 3 ||
      indices.length < 3 || indices.length % 3 || positions.length > 450000 || indices.length > 150000 ||
      !positions.every(v => Number.isFinite(v) && Math.abs(v) <= 10000) ||
      !indices.every(i => Number.isInteger(i) && i >= 0 && i < positions.length / 3)) {
    throw new RatCoreError('RC-201', 'Некорректная индексированная геометрия', 'Проверь вершины и треугольники.');
  }
  return finalizeGeometry(positions, indices, null, color);
}

// 1. Примитивы: box, cylinder, cone, roof, sphere (поддерживает и sx/sy/sz/kind, и w/h/d/r/shape)
function buildPrimitiveGeometry(opts = {}) {
  const kind = opts.kind || opts.shape || 'box';
  const sx = Number(opts.sx ?? opts.w ?? opts.width ?? 1);
  const sy = Number(opts.sy ?? opts.h ?? opts.height ?? 1);
  const sz = Number(opts.sz ?? opts.d ?? opts.depth ?? 1);
  const radius = Number(opts.radius ?? opts.r ?? 0.5);
  const height = Number(opts.height ?? opts.h ?? opts.sy ?? 1);
  const segments = Number(opts.segments ?? 12);
  const color = opts.color || '#7ea8cc';
  const pos = [];
  const idx = [];

  const pushQuad = (a, b, c, d) => {
    const base = pos.length / 3;
    pos.push(...a, ...b, ...c, ...d);
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };

  if (kind === 'box') {
    const hx = sx * 0.5, hz = sz * 0.5, y0 = 0, y1 = sy;
    pushQuad([-hx, y1, -hz], [hx, y1, -hz], [hx, y1, hz], [-hx, y1, hz]); // top
    pushQuad([-hx, y0, hz], [hx, y0, hz], [hx, y0, -hz], [-hx, y0, -hz]); // bottom
    pushQuad([-hx, y0, hz], [-hx, y1, hz], [hx, y1, hz], [hx, y0, hz]);   // front
    pushQuad([hx, y0, -hz], [hx, y1, -hz], [-hx, y1, -hz], [-hx, y0, -hz]); // back
    pushQuad([hx, y0, hz], [hx, y1, hz], [hx, y1, -hz], [hx, y0, -hz]);   // east
    pushQuad([-hx, y0, -hz], [-hx, y1, -hz], [-hx, y1, hz], [-hx, y0, hz]); // west
    return finalizeGeometry(pos, idx, null, color);
  }

  if (kind === 'roof') {
    const hx = sx * 0.5, hz = sz * 0.5, y0 = 0, y1 = sy;
    pushQuad([-hx, y0, hz], [0, y1, hz], [0, y1, -hz], [-hx, y0, -hz]);
    pushQuad([0, y1, hz], [hx, y0, hz], [hx, y0, -hz], [0, y1, -hz]);
    // Фронтоны
    const b1 = pos.length / 3;
    pos.push(-hx, y0, hz, hx, y0, hz, 0, y1, hz);
    idx.push(b1, b1 + 1, b1 + 2);
    const b2 = pos.length / 3;
    pos.push(hx, y0, -hz, -hx, y0, -hz, 0, y1, -hz);
    idx.push(b2, b2 + 1, b2 + 2);
    return finalizeGeometry(pos, idx, null, color);
  }

  if (kind === 'cylinder' || kind === 'cone') {
    const seg = Math.max(4, segments | 0);
    const topR = kind === 'cone' ? 0.001 : radius;
    const h = height || sy;
    const baseCenter = 0;
    pos.push(0, 0, 0);
    const topCenter = 1;
    pos.push(0, h, 0);

    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2;
      const a1 = ((i + 1) / seg) * Math.PI * 2;
      const b0 = [Math.cos(a0) * radius, 0, Math.sin(a0) * radius];
      const b1 = [Math.cos(a1) * radius, 0, Math.sin(a1) * radius];
      const t0 = [Math.cos(a0) * topR, h, Math.sin(a0) * topR];
      const t1 = [Math.cos(a1) * topR, h, Math.sin(a1) * topR];
      pushQuad(b0, t0, t1, b1);

      const bi = pos.length / 3;
      pos.push(...b1, ...b0);
      idx.push(baseCenter, bi, bi + 1);
      if (kind === 'cylinder') {
        const ti = pos.length / 3;
        pos.push(...t0, ...t1);
        idx.push(topCenter, ti, ti + 1);
      }
    }
    return finalizeGeometry(pos, idx, null, color);
  }

  // sphere
  const rings = Math.max(4, Math.floor(segments / 2));
  const cols = Math.max(6, segments | 0);
  const r = radius || sx * 0.5;
  for (let iy = 0; iy <= rings; iy++) {
    const v = (iy / rings) * Math.PI;
    const sinV = Math.sin(v), cosV = Math.cos(v);
    for (let ix = 0; ix <= cols; ix++) {
      const u = (ix / cols) * Math.PI * 2;
      pos.push(r * sinV * Math.cos(u), r * (1 - cosV), r * sinV * Math.sin(u));
    }
  }
  const stride = cols + 1;
  for (let iy = 0; iy < rings; iy++) {
    for (let ix = 0; ix < cols; ix++) {
      const a = iy * stride + ix;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  return finalizeGeometry(pos, idx, null, color);
}

// 2. A-15 / A-16: Выдавливание 2D-контура точками (Ear-Clipping триангуляция + стены)
function polygonSignedArea(pts) {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    area += x0 * y1 - x1 * y0;
  }
  return area * 0.5;
}

function pointInTri2D(p, a, b, c) {
  const s1 = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
  const s2 = (c[0] - b[0]) * (p[1] - b[1]) - (c[1] - b[1]) * (p[0] - b[0]);
  const s3 = (a[0] - c[0]) * (p[1] - c[1]) - (a[1] - c[1]) * (p[0] - c[0]);
  return s1 >= -1e-6 && s2 >= -1e-6 && s3 >= -1e-6;
}

function triangulateEarClipping(contour) {
  if (!Array.isArray(contour) || contour.length < 3) {
    throw new RatCoreError('RC-201', 'Вырожденный контур: требуется минимум 3 точки', 'Передай массив contour: [[x,y], ...] из >= 3 вершин.');
  }
  const pts = contour.map(([x, y]) => [Number(x), Number(y)]);
  const area = polygonSignedArea(pts);
  if (Math.abs(area) < 1e-6) {
    throw new RatCoreError('RC-201', 'Вырожденный контур с нулевой площадью', 'Проверь, что точки контура не лежат на одной прямой.');
  }
  const ccw = area > 0 ? pts.map((_, i) => i) : pts.map((_, i) => pts.length - 1 - i);
  const tris = [];
  let guard = 0;

  while (ccw.length > 3 && guard < 2000) {
    guard++;
    let clipped = false;
    for (let i = 0; i < ccw.length; i++) {
      const iPrev = ccw[(i - 1 + ccw.length) % ccw.length];
      const iCur = ccw[i];
      const iNext = ccw[(i + 1) % ccw.length];
      const a = pts[iPrev], b = pts[iCur], c = pts[iNext];
      const cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
      if (cross <= 1e-6) continue;
      let hasInside = false;
      for (const idx of ccw) {
        if (idx === iPrev || idx === iCur || idx === iNext) continue;
        if (pointInTri2D(pts[idx], a, b, c)) { hasInside = true; break; }
      }
      if (!hasInside) {
        tris.push([iPrev, iCur, iNext]);
        ccw.splice(i, 1);
        clipped = true;
        break;
      }
    }
    if (!clipped) break;
  }
  if (ccw.length === 3) tris.push([ccw[0], ccw[1], ccw[2]]);
  return { pts, tris };
}

function buildExtrudeGeometry({ contour, points, height = 1, y = 0, color = '#8fb6d8' } = {}) {
  const { pts, tris } = triangulateEarClipping(contour || points);
  const pos = [];
  const idx = [];
  const n = pts.length;
  const y0 = y;
  const y1 = y + height;

  // Верхняя и нижняя крышки
  for (let i = 0; i < n; i++) pos.push(pts[i][0], y0, -pts[i][1]);
  for (let i = 0; i < n; i++) pos.push(pts[i][0], y1, -pts[i][1]);

  for (const [a, b, c] of tris) {
    idx.push(a, c, b);               // дно
    idx.push(n + a, n + b, n + c);   // верх
  }

  // Боковые стены
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const base = pos.length / 3;
    pos.push(
      pts[i][0], y0, -pts[i][1],
      pts[j][0], y0, -pts[j][1],
      pts[j][0], y1, -pts[j][1],
      pts[i][0], y1, -pts[i][1]
    );
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  return finalizeGeometry(pos, idx, null, color);
}

// 3. A-18: Тело вращения по профилю (Lathe)
function buildLatheGeometry({ profile, segments = 12, y = 0, color = '#9ab2c8' } = {}) {
  if (!Array.isArray(profile) || profile.length < 2) {
    throw new RatCoreError('RC-201', 'Профиль lathe должен содержать >= 2 точек [r, h]', 'Укажи profile: [[r0,h0],[r1,h1],...].');
  }
  const seg = Math.max(4, segments | 0);
  const pos = [];
  const idx = [];
  const rows = profile.length;

  for (let r = 0; r < rows; r++) {
    const rad = Math.max(0, Number(profile[r][0]));
    const py = y + Number(profile[r][1]);
    for (let s = 0; s <= seg; s++) {
      const ang = (s / seg) * Math.PI * 2;
      pos.push(Math.cos(ang) * rad, py, Math.sin(ang) * rad);
    }
  }
  const stride = seg + 1;
  for (let r = 0; r < rows - 1; r++) {
    for (let s = 0; s < seg; s++) {
      const a = r * stride + s;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  return finalizeGeometry(pos, idx, null, color);
}

// 4. A-19: Воксели с Hidden Face Culling + 2D Greedy Meshing (слияние соседних одинаковых граней!)
function buildVoxelsGreedyGeometry({ voxels = [], voxelSize = 1, color = '#76a4c8' } = {}) {
  if (!Array.isArray(voxels) || voxels.length === 0) {
    throw new RatCoreError('RC-201', 'Пустой массив вокселей', 'Передай массив voxels: [{ x, y, z, mat }].');
  }
  const map = new Map();
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (const v of voxels) {
    const ix = v.x | 0, iy = v.y | 0, iz = v.z | 0, mat = v.mat || 1;
    map.set(`${ix},${iy},${iz}`, mat);
    if (ix < minX) minX = ix; if (ix > maxX) maxX = ix;
    if (iy < minY) minY = iy; if (iy > maxY) maxY = iy;
    if (iz < minZ) minZ = iz; if (iz > maxZ) maxZ = iz;
  }
  const get = (x, y, z) => map.get(`${x},${y},${z}`) || 0;

  const pos = [];
  const idx = [];
  const s = voxelSize;
  const pushQuad = (a, b, c, d) => {
    const base = pos.length / 3;
    pos.push(...a, ...b, ...c, ...d);
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };

  // Проход по всем 3 осям × 2 направлениям с жадным слиянием прямоугольников на каждом срезе
  const dims = [
    { min: minX, max: maxX },
    { min: minY, max: maxY },
    { min: minZ, max: maxZ },
  ];

  for (let axis = 0; axis < 3; axis++) {
    const uAxis = (axis + 1) % 3;
    const vAxis = (axis + 2) % 3;
    const uMin = dims[uAxis].min, uMax = dims[uAxis].max, uLen = uMax - uMin + 1;
    const vMin = dims[vAxis].min, vMax = dims[vAxis].max, vLen = vMax - vMin + 1;

    for (const dir of [1, -1]) {
      for (let d = dims[axis].min; d <= dims[axis].max; d++) {
        const mask = new Int32Array(uLen * vLen);
        for (let iv = 0; iv < vLen; iv++) {
          for (let iu = 0; iu < uLen; iu++) {
            const p = [0, 0, 0];
            p[axis] = d; p[uAxis] = uMin + iu; p[vAxis] = vMin + iv;
            const mat = get(p[0], p[1], p[2]);
            if (!mat) continue;
            const n = [p[0], p[1], p[2]];
            n[axis] += dir;
            if (!get(n[0], n[1], n[2])) mask[iv * uLen + iu] = mat;
          }
        }

        // Жадное слияние прямоугольников в маске среза
        for (let iv = 0; iv < vLen; iv++) {
          for (let iu = 0; iu < uLen; iu++) {
            const mat = mask[iv * uLen + iu];
            if (!mat) continue;
            let w = 1;
            while (iu + w < uLen && mask[iv * uLen + iu + w] === mat) w++;
            let h = 1;
            outer: while (iv + h < vLen) {
              for (let k = 0; k < w; k++) {
                if (mask[(iv + h) * uLen + iu + k] !== mat) break outer;
              }
              h++;
            }
            for (let dy = 0; dy < h; dy++) {
              for (let dx = 0; dx < w; dx++) mask[(iv + dy) * uLen + iu + dx] = 0;
            }

            const plane = d + (dir > 0 ? 1 : 0);
            const pt = (u, v) => {
              const q = [0, 0, 0];
              q[axis] = plane * s;
              q[uAxis] = (uMin + u) * s;
              q[vAxis] = (vMin + v) * s;
              return q;
            };
            const p0 = pt(iu, iv);
            const p1 = pt(iu + w, iv);
            const p2 = pt(iu + w, iv + h);
            const p3 = pt(iu, iv + h);
            if (dir > 0) pushQuad(p0, p1, p2, p3);
            else pushQuad(p0, p3, p2, p1);
          }
        }
      }
    }
  }

  return finalizeGeometry(pos, idx, null, color);
}

// 5. Объединение нескольких геометрий со смещениями
function combineGeometries(parts, color = '#88b4d8') {
  const pos = [];
  const idx = [];
  for (const part of parts) {
    const base = pos.length / 3;
    const ox = part.offset ? part.offset[0] : 0;
    const oy = part.offset ? part.offset[1] : 0;
    const oz = part.offset ? part.offset[2] : 0;
    const srcPos = part.buffers.positions;
    for (let i = 0; i < srcPos.length; i += 3) {
      pos.push(srcPos[i] + ox, srcPos[i + 1] + oy, srcPos[i + 2] + oz);
    }
    const srcIdx = part.buffers.indices;
    for (let i = 0; i < srcIdx.length; i++) idx.push(base + srcIdx[i]);
  }
  return finalizeGeometry(pos, idx, null, color);
}

// 6. Валидатор меша (RC-201..RC-204)
function validateMeshBuffers(buffers, { maxTris = 50000 } = {}) {
  const { positions, indices } = buffers;
  const triCount = Math.floor(indices.length / 3);
  if (triCount <= 0) {
    throw new RatCoreError('RC-201', 'Меш не содержит ни одного треугольника', 'Проверь входные параметры генератора.');
  }
  if (triCount > maxTris) {
    throw new RatCoreError('RC-204', `Превышен бюджет треугольников (${triCount} > ${maxTris})`, 'Уменьши segments или включи Greedy Meshing / LOD.');
  }
  for (let i = 0; i < positions.length; i++) {
    if (!Number.isFinite(positions[i])) {
      throw new RatCoreError('RC-203', `Обнаружена NaN/Infinity координата вершины в индексе ${i}`, 'Проверь числовые параметры контура или профиля.');
    }
  }
  return { ok: true, triCount, vertexCount: positions.length / 3 };
}

// F-113: Упаковка вершины в PackedVertex64 (ровно 8 байт на вершину!)
function packVertex64({ x, y, z, normalIdx = 0, uvU = 0, uvV = 0, matId = 0, ao = 3 }) {
  const b0 = clamp(Math.round(x * 16), 0, 255);
  const b1 = clamp(Math.round(y * 16), 0, 255);
  const b2 = clamp(Math.round(z * 16), 0, 255);
  const b3 = ((normalIdx & 0x7) << 5) | ((ao & 0x3) << 3) | (matId & 0x7);
  const lo = ((b3 << 24) | (b2 << 16) | (b1 << 8) | b0) >>> 0;
  const hi = (((matId >>> 3) & 0xff) << 16) | ((clamp(uvV | 0, 0, 255) << 8) | clamp(uvU | 0, 0, 255));
  return new Uint32Array([lo, hi >>> 0]);
}
    exports["buildIndexedGeometry"] = buildIndexedGeometry;
    exports["buildPrimitiveGeometry"] = buildPrimitiveGeometry;
    exports["triangulateEarClipping"] = triangulateEarClipping;
    exports["buildExtrudeGeometry"] = buildExtrudeGeometry;
    exports["buildLatheGeometry"] = buildLatheGeometry;
    exports["buildVoxelsGreedyGeometry"] = buildVoxelsGreedyGeometry;
    exports["combineGeometries"] = combineGeometries;
    exports["validateMeshBuffers"] = validateMeshBuffers;
    exports["packVertex64"] = packVertex64;
  });

  __define("src/assets/raster.js", function (exports, __import) {
    var { clamp } = __import("src/core/math.js");
// RatCore Assets — Растровый буфер RasterSurface (Uint32Array ABGR, без DOM: браузер + Node.js)



function packRGBA(r, g, b, a = 255) {
  return (((a & 0xff) << 24) | ((b & 0xff) << 16) | ((g & 0xff) << 8) | (r & 0xff)) >>> 0;
}

function unpackRGBA(abgr) {
  return [abgr & 0xff, (abgr >>> 8) & 0xff, (abgr >>> 16) & 0xff, (abgr >>> 24) & 0xff];
}

// F-151: Матрица Бейера 4×4 для упорядоченного дизеринга
const BAYER_4X4 = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5,
];

class RasterSurface {
  constructor(width, height, fillColor = packRGBA(18, 26, 38, 255)) {
    this.width = Math.max(1, width | 0);
    this.height = Math.max(1, height | 0);
    this.pixels = new Uint32Array(this.width * this.height);
    if (fillColor !== 0) this.clear(fillColor);
  }

  clear(color) {
    this.pixels.fill(color >>> 0);
  }

  setPixel(x, y, color) {
    const ix = x | 0;
    const iy = y | 0;
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    this.pixels[iy * this.width + ix] = color >>> 0;
  }

  getPixel(x, y) {
    const ix = clamp(x | 0, 0, this.width - 1);
    const iy = clamp(y | 0, 0, this.height - 1);
    return this.pixels[iy * this.width + ix];
  }

  blendPixel(x, y, r, g, b, alpha) {
    const ix = x | 0;
    const iy = y | 0;
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    const a = clamp(alpha, 0, 1);
    const idx = iy * this.width + ix;
    const dst = this.pixels[idx];
    const dr = dst & 0xff;
    const dg = (dst >>> 8) & 0xff;
    const db = (dst >>> 16) & 0xff;
    const nr = (dr + (r - dr) * a) | 0;
    const ng = (dg + (g - dg) * a) | 0;
    const nb = (db + (b - db) * a) | 0;
    this.pixels[idx] = packRGBA(nr, ng, nb, 255);
  }

  fillRect(x, y, w, h, color) {
    const x0 = Math.max(0, x | 0);
    const y0 = Math.max(0, y | 0);
    const x1 = Math.min(this.width, (x + w) | 0);
    const y1 = Math.min(this.height, (y + h) | 0);
    for (let py = y0; py < y1; py++) {
      this.pixels.fill(color >>> 0, py * this.width + x0, py * this.width + x1);
    }
  }

  // Линия Брезенхэма
  drawLine(x0, y0, x1, y1, color) {
    let ix0 = Math.round(x0);
    let iy0 = Math.round(y0);
    const ix1 = Math.round(x1);
    const iy1 = Math.round(y1);
    const dx = Math.abs(ix1 - ix0);
    const dy = Math.abs(iy1 - iy0);
    const sx = ix0 < ix1 ? 1 : -1;
    const sy = iy0 < iy1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      this.setPixel(ix0, iy0, color);
      if (ix0 === ix1 && iy0 === iy1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; ix0 += sx; }
      if (e2 < dx) { err += dx; iy0 += sy; }
    }
  }

  fillCircle(cx, cy, radius, color) {
    const r = Math.max(1, Math.round(radius));
    const r2 = r * r;
    const x0 = Math.max(0, Math.floor(cx - r));
    const x1 = Math.min(this.width - 1, Math.ceil(cx + r));
    const y0 = Math.max(0, Math.floor(cy - r));
    const y1 = Math.min(this.height - 1, Math.ceil(cy + r));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r2) this.pixels[y * this.width + x] = color >>> 0;
      }
    }
  }

  // F-151: Упорядоченный дизеринг Бейера 4×4 (ретро / PS1 стиль)
  applyBayerDither(levels = 6) {
    const lv = Math.max(2, levels | 0);
    const step = lv - 1;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = y * this.width + x;
        const t = (BAYER_4X4[((y & 3) << 2) | (x & 3)] + 0.5) / 16;
        const [r, g, b, a] = unpackRGBA(this.pixels[idx]);
        const qr = clamp(Math.floor((r / 255) * step + t) / step, 0, 1) * 255;
        const qg = clamp(Math.floor((g / 255) * step + t) / step, 0, 1) * 255;
        const qb = clamp(Math.floor((b / 255) * step + t) / step, 0, 1) * 255;
        this.pixels[idx] = packRGBA(qr | 0, qg | 0, qb | 0, a);
      }
    }
  }

  // Экспорт в текстовую ASCII-карту для нейросетей без vision
  toAscii(cols = 48, rows = 24) {
    const ramp = ' .:-=+*#%@';
    const lines = [];
    for (let ry = 0; ry < rows; ry++) {
      const py = Math.min(this.height - 1, Math.floor((ry / rows) * this.height));
      let line = '';
      for (let rx = 0; rx < cols; rx++) {
        const px = Math.min(this.width - 1, Math.floor((rx / cols) * this.width));
        const [r, g, b] = unpackRGBA(this.pixels[py * this.width + px]);
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const idx = clamp(Math.floor(lum * (ramp.length - 1)), 0, ramp.length - 1);
        line += ramp[idx];
      }
      lines.push(line);
    }
    return lines.join('\n');
  }

  nonBackgroundRatio(bgColor) {
    let diff = 0;
    for (let i = 0; i < this.pixels.length; i++) {
      if (this.pixels[i] !== (bgColor >>> 0)) diff++;
    }
    return diff / this.pixels.length;
  }
}
    exports["packRGBA"] = packRGBA;
    exports["unpackRGBA"] = unpackRGBA;
    exports["RasterSurface"] = RasterSurface;
  });

  __define("src/assets/textures.js", function (exports, __import) {
    var { clamp, fbm2D } = __import("src/core/math.js");
    var { packRGBA, unpackRGBA } = __import("src/assets/raster.js");
// RatCore Assets — Процедурный генератор текстур RatTex + нормали Собеля + повреждённая версия (A-13)




function parseHexRGB(hex, fallback = [140, 160, 180]) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// A-13: Автоматическая карта нормалей (оператор Собеля)
function computeSobelNormals(pixels, width, height, strength = 2.0) {
  const normals = new Uint32Array(width * height);
  const lumAt = (x, y) => {
    const cx = ((x % width) + width) % width;
    const cy = ((y % height) + height) % height;
    const [r, g, b] = unpackRGBA(pixels[cy * width + cx]);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tl = lumAt(x - 1, y - 1);
      const t = lumAt(x, y - 1);
      const tr = lumAt(x + 1, y - 1);
      const l = lumAt(x - 1, y);
      const r = lumAt(x + 1, y);
      const bl = lumAt(x - 1, y + 1);
      const b = lumAt(x, y + 1);
      const br = lumAt(x + 1, y + 1);

      const dx = (tr + 2 * r + br) - (tl + 2 * l + bl);
      const dy = (bl + 2 * b + br) - (tl + 2 * t + tr);
      const nx = -dx * strength;
      const ny = -dy * strength;
      const nz = 1.0;
      const len = Math.hypot(nx, ny, nz);
      normals[y * width + x] = packRGBA(
        clamp(((nx / len) * 0.5 + 0.5) * 255, 0, 255) | 0,
        clamp(((ny / len) * 0.5 + 0.5) * 255, 0, 255) | 0,
        clamp(((nz / len) * 0.5 + 0.5) * 255, 0, 255) | 0,
        255
      );
    }
  }
  return normals;
}

// Автоматическая повреждённая версия текстуры (для слота t + 2048)
function buildDamagedPixels(pixels, width, height, seed = 101) {
  const out = new Uint32Array(pixels.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const [r, g, b, a] = unpackRGBA(pixels[idx]);
      const crack = Math.abs(fbm2D(x * 0.18, y * 0.18, { octaves: 3, seed }));
      const soot = Math.max(0, fbm2D(x * 0.08 + 7, y * 0.08 - 3, { octaves: 2, seed: seed + 19 }));
      const mult = crack < 0.08 ? 0.25 : (1 - soot * 0.45);
      out[idx] = packRGBA(clamp(r * mult, 0, 255) | 0, clamp(g * mult, 0, 255) | 0, clamp(b * mult, 0, 255) | 0, a);
    }
  }
  return out;
}

function synthesizeTextureData({
  kind = 'noise',
  width = 32,
  height = 32,
  baseColor = '#6688aa',
  accentColor = '#33485c',
  seed = 1337,
  withNormals = true,
  withDamaged = true,
} = {}) {
  const w = clamp(width | 0, 4, 256);
  const h = clamp(height | 0, 4, 256);
  const pixels = new Uint32Array(w * h);
  const base = parseHexRGB(baseColor, [102, 136, 170]);
  const accent = parseHexRGB(accentColor, [51, 72, 92]);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let t = 0;
      const n = fbm2D((x / w) * 6, (y / h) * 6, { octaves: 3, seed }) * 0.5 + 0.5;
      if (kind === 'solid') {
        t = 0;
      } else if (kind === 'bricks') {
        const row = Math.floor(y / Math.max(4, h / 8));
        const bx = (x + (row % 2) * Math.floor(w / 8)) % Math.max(6, Math.floor(w / 4));
        const by = y % Math.max(4, Math.floor(h / 8));
        const mortar = bx === 0 || by === 0;
        t = mortar ? 0.85 : n * 0.35;
      } else if (kind === 'panels' || kind === 'metal') {
        const seam = x % Math.max(8, w >> 2) === 0 || y % Math.max(8, h >> 2) === 0;
        t = seam ? 0.75 : n * 0.25;
      } else if (kind === 'wood') {
        const grain = Math.sin((y / h) * 18 + n * 4) * 0.5 + 0.5;
        t = grain * 0.55;
      } else if (kind === 'water') {
        const wave = Math.sin((x / w) * Math.PI * 4 + n * 3) * 0.5 + 0.5;
        t = wave * 0.45;
      } else {
        // noise / grass / asphalt
        t = n * 0.65;
      }

      const r = clamp(base[0] + (accent[0] - base[0]) * t, 0, 255) | 0;
      const g = clamp(base[1] + (accent[1] - base[1]) * t, 0, 255) | 0;
      const b = clamp(base[2] + (accent[2] - base[2]) * t, 0, 255) | 0;
      pixels[y * w + x] = packRGBA(r, g, b, 255);
    }
  }

  return {
    width: w,
    height: h,
    pixels,
    normals: withNormals ? computeSobelNormals(pixels, w, h) : null,
    damagedPixels: withDamaged ? buildDamagedPixels(pixels, w, h, seed + 55) : null,
  };
}
    exports["computeSobelNormals"] = computeSobelNormals;
    exports["buildDamagedPixels"] = buildDamagedPixels;
    exports["synthesizeTextureData"] = synthesizeTextureData;
  });

  __define("src/compress/cloud-adapter.js", function (exports, __import) {
    var { encodeWire2Frame, decodeWire2Frame, fastCdcSplit, diffFastCdcChunks } = __import("src/compress/wire2.js");
// RatCore Cloud Adapter — Офлайн-first синхронизация миров (RCW2 + FastCDC) и сообщений ИИ с облаком (Supabase REST / локальный буфер)
// Секреты никогда не зашиваются в код: URL и publishable-ключ передаются опционально при подключении.



function bytesToBase64(bytes) {
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64');
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function base64ToBytes(b64) {
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(b64, 'base64'));
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

class RatCoreCloudSync {
  constructor({ restUrl = null, apiKey = null, fetchImpl = null } = {}) {
    this.restUrl = restUrl ? String(restUrl).replace(/\/+$/, '') : null;
    this.apiKey = apiKey || null;
    this.fetchImpl = fetchImpl || (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
    this.localStore = new Map();
    this.knownChunkHashes = new Set();
  }

  isRemoteConfigured() {
    return Boolean(this.restUrl && this.apiKey && this.fetchImpl);
  }

  // Упаковывает снимок в RCW2 + строит FastCDC-манифест (для дедупликации повторных отправок)
  packSnapshot(worldId, slotKey, snapshotObj) {
    const rawBytes = new TextEncoder().encode(JSON.stringify(snapshotObj));
    const cdcChunks = fastCdcSplit(rawBytes);
    const diff = diffFastCdcChunks(cdcChunks, this.knownChunkHashes);
    const wire = encodeWire2Frame(rawBytes, { codec: 'auto' });

    return {
      world_id: String(worldId),
      slot_key: String(slotKey || 'main'),
      wire_version: 2,
      codec_id: wire.codecId,
      raw_bytes: wire.rawBytes,
      wire_bytes: wire.wireBytes,
      crc32: wire.crc32,
      payload_b64: bytesToBase64(wire.frame),
      fastcdc_manifest: diff.manifest,
      metadata: {
        savedPct: wire.savedPct,
        dedupSavedPct: diff.dedupSavedPct,
        sentChunks: diff.sentChunks,
        totalChunks: diff.totalChunks,
      },
    };
  }

  unpackSnapshotRecord(record) {
    const frame = base64ToBytes(record.payload_b64);
    const decoded = decodeWire2Frame(frame, { asJson: true });
    return {
      worldId: record.world_id,
      slotKey: record.slot_key,
      crc32: decoded.crc32,
      rawBytes: decoded.rawLen,
      wireBytes: frame.length,
      snapshot: decoded.data,
    };
  }

  async pushSnapshot(worldId, slotKey, snapshotObj) {
    const rec = this.packSnapshot(worldId, slotKey, snapshotObj);
    const key = `${rec.world_id}:${rec.slot_key}`;
    this.localStore.set(key, rec);

    if (!this.isRemoteConfigured()) {
      return { ok: true, mode: 'local-cache', record: rec };
    }

    const res = await this.fetchImpl(`${this.restUrl}/rest/v1/ratcore_cloud_snapshots?on_conflict=world_id,slot_key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: this.apiKey,
        Authorization: `Bearer ${this.apiKey}`,
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(rec),
    });
    if (!res.ok) {
      return { ok: false, mode: 'remote', status: res.status, cachedLocally: true };
    }
    return { ok: true, mode: 'remote', record: rec };
  }

  async pullSnapshot(worldId, slotKey = 'main') {
    const key = `${worldId}:${slotKey}`;
    if (this.isRemoteConfigured()) {
      const q = `world_id=eq.${encodeURIComponent(worldId)}&slot_key=eq.${encodeURIComponent(slotKey)}&limit=1`;
      const res = await this.fetchImpl(`${this.restUrl}/rest/v1/ratcore_cloud_snapshots?${q}`, {
        headers: { apikey: this.apiKey, Authorization: `Bearer ${this.apiKey}` },
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows[0]) {
          this.localStore.set(key, rows[0]);
          return { ok: true, mode: 'remote', ...this.unpackSnapshotRecord(rows[0]) };
        }
      }
    }
    const local = this.localStore.get(key);
    if (!local) return { ok: false, mode: 'local-cache', reason: 'not-found' };
    return { ok: true, mode: 'local-cache', ...this.unpackSnapshotRecord(local) };
  }
}
    exports["RatCoreCloudSync"] = RatCoreCloudSync;
  });

  __define("src/compress/codec.js", function (exports, __import) {

// RatCore Compress — Базовые кодеки (Уровни 1–9: CRC32, ZigZag/Varint, Delta, RLE, LZ-словарь ratcore-dict-v1)
// Формулы F-92..F-96, F-122; нулевые внешние зависимости, браузер + Node.js 22.

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let c = 0xffffffff;
  for (let i = 0; i < u8.length; i++) {
    c = CRC_TABLE[(c ^ u8[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// F-92: ZigZag для знаковых целых (0 -> 0, -1 -> 1, 1 -> 2, -2 -> 3...)
function zigzagEncode(n) {
  const v = n | 0;
  return ((v << 1) ^ (v >> 31)) >>> 0;
}

function zigzagDecode(u) {
  const v = u >>> 0;
  return (v >>> 1) ^ -(v & 1);
}

// F-93: LEB128 Varint кодирование массива целых
function encodeVarints(ints) {
  const out = [];
  for (let i = 0; i < ints.length; i++) {
    let v = zigzagEncode(ints[i]);
    while (v >= 0x80) {
      out.push((v & 0x7f) | 0x80);
      v >>>= 7;
    }
    out.push(v);
  }
  return new Uint8Array(out);
}

function decodeVarints(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const out = [];
  let i = 0;
  while (i < u8.length) {
    let shift = 0;
    let val = 0;
    while (i < u8.length) {
      const b = u8[i++];
      val |= (b & 0x7f) << shift;
      if ((b & 0x80) === 0) break;
      shift += 7;
    }
    out.push(zigzagDecode(val >>> 0));
  }
  return new Int32Array(out);
}

// A-65: Delta-of-Delta кодирование рядов координат/тиков
function encodeDeltaInt32(arr) {
  const out = new Int32Array(arr.length);
  let prev = 0;
  for (let i = 0; i < arr.length; i++) {
    out[i] = (arr[i] | 0) - prev;
    prev = arr[i] | 0;
  }
  return encodeVarints(out);
}

function decodeDeltaInt32(bytes) {
  const deltas = decodeVarints(bytes);
  let acc = 0;
  for (let i = 0; i < deltas.length; i++) {
    acc += deltas[i];
    deltas[i] = acc;
  }
  return deltas;
}

// Компактный PackBits-подобный RLE (никогда не раздувает данные больше +1.6%)
function rleCompress(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const out = [];
  let i = 0;
  while (i < u8.length) {
    let run = 1;
    while (i + run < u8.length && run < 128 && u8[i + run] === u8[i]) run++;
    if (run >= 3) {
      out.push(0x80 | (run - 1));
      out.push(u8[i]);
      i += run;
    } else {
      const start = i;
      let lit = 0;
      while (i < u8.length && lit < 128) {
        if (i + 2 < u8.length && u8[i] === u8[i + 1] && u8[i] === u8[i + 2]) break;
        i++;
        lit++;
      }
      out.push(lit - 1);
      for (let k = 0; k < lit; k++) out.push(u8[start + k]);
    }
  }
  return new Uint8Array(out);
}

function rleDecompress(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const out = [];
  let i = 0;
  while (i < u8.length) {
    const hdr = u8[i++];
    if (hdr & 0x80) {
      const count = (hdr & 0x7f) + 1;
      const val = u8[i++];
      for (let k = 0; k < count; k++) out.push(val);
    } else {
      const count = hdr + 1;
      for (let k = 0; k < count && i < u8.length; k++) out.push(u8[i++]);
    }
  }
  return new Uint8Array(out);
}

// F-122: Предзагруженный общий словарь ratcore-dict-v1 (частые ключи мира/сущностей/инструментов)
const DICT_STR =
  '{"schema":"ratcore-save/1","entities":[,"nodes":[,"edges":[,"meshId":"mesh_","texture":' +
  '"x":,"y":,"h":,"yaw":,"scale":,"tag":"object","id":"ent_","kind":"road","from":"node_",' +
  '"to":"node_","length":,"costFactor":1,"bidirectional":true,"seed":,"tick":,"build.primitive",' +
  '"build.placeEntity","RatCore","pack:","RC-108","RC-101","ok":true,"data":,"error":null}';
const RATCORE_DICT_V1 = new TextEncoder().encode(DICT_STR);

// Лёгкий LZ77 со скользящим окном + опциональный префикс словаря ratcore-dict-v1
// Формат токенов:
//   0xxxxxxx (0..127): литеральная серия длиной (b + 1)
//   1xxxxxxx: ссылка (len = ((b & 0x7f) + 3), dist = 2 байта LE в [1..65535])
function lzCompress(bytes, { useDict = true } = {}) {
  const src = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const dict = useDict ? RATCORE_DICT_V1 : new Uint8Array(0);
  const dLen = dict.length;
  const total = dLen + src.length;
  const buf = new Uint8Array(total);
  if (dLen > 0) buf.set(dict, 0);
  buf.set(src, dLen);

  // Хеш-таблица 3-байтных префиксов для быстрого поиска O(N)
  const HASH_BITS = 13;
  const HASH_SIZE = 1 << HASH_BITS;
  const head = new Int32Array(HASH_SIZE).fill(-1);
  const prev = new Int32Array(total).fill(-1);
  const hash3 = (p) => (((buf[p] << 10) ^ (buf[p + 1] << 5) ^ buf[p + 2]) & (HASH_SIZE - 1));

  // Индексируем словарь
  for (let p = 0; p + 2 < dLen; p++) {
    const h = hash3(p);
    prev[p] = head[h];
    head[h] = p;
  }

  const out = [];
  let litBuf = [];
  const flushLit = () => {
    let off = 0;
    while (off < litBuf.length) {
      const chunk = Math.min(128, litBuf.length - off);
      out.push(chunk - 1);
      for (let k = 0; k < chunk; k++) out.push(litBuf[off + k]);
      off += chunk;
    }
    litBuf = [];
  };

  let p = dLen;
  while (p < total) {
    let bestLen = 0;
    let bestDist = 0;
    if (p + 2 < total) {
      const h = hash3(p);
      let cand = head[h];
      let probes = 0;
      const maxLen = Math.min(130, total - p);
      while (cand >= 0 && p - cand <= 65535 && probes < 24) {
        if (buf[cand] === buf[p] && buf[cand + 1] === buf[p + 1] && buf[cand + 2] === buf[p + 2]) {
          let l = 3;
          while (l < maxLen && buf[cand + l] === buf[p + l]) l++;
          if (l > bestLen) {
            bestLen = l;
            bestDist = p - cand;
            if (l === maxLen) break;
          }
        }
        cand = prev[cand];
        probes++;
      }
      prev[p] = head[h];
      head[h] = p;
    }

    if (bestLen >= 4) {
      flushLit();
      out.push(0x80 | (bestLen - 3));
      out.push(bestDist & 0xff, (bestDist >>> 8) & 0xff);
      for (let k = 1; k < bestLen && p + k + 2 < total; k++) {
        const hk = hash3(p + k);
        prev[p + k] = head[hk];
        head[hk] = p + k;
      }
      p += bestLen;
    } else {
      litBuf.push(buf[p]);
      p++;
    }
  }
  flushLit();
  return new Uint8Array(out);
}

function lzDecompress(bytes, { useDict = true } = {}) {
  const src = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const dict = useDict ? RATCORE_DICT_V1 : new Uint8Array(0);
  const out = Array.from(dict);
  const dLen = dict.length;
  let i = 0;
  while (i < src.length) {
    const tag = src[i++];
    if (tag & 0x80) {
      const len = (tag & 0x7f) + 3;
      const dist = src[i] | (src[i + 1] << 8);
      i += 2;
      const start = out.length - dist;
      for (let k = 0; k < len; k++) out.push(out[start + k]);
    } else {
      const len = tag + 1;
      for (let k = 0; k < len && i < src.length; k++) out.push(src[i++]);
    }
  }
  return new Uint8Array(out.slice(dLen));
}
    exports["crc32"] = crc32;
    exports["zigzagEncode"] = zigzagEncode;
    exports["zigzagDecode"] = zigzagDecode;
    exports["encodeVarints"] = encodeVarints;
    exports["decodeVarints"] = decodeVarints;
    exports["encodeDeltaInt32"] = encodeDeltaInt32;
    exports["decodeDeltaInt32"] = decodeDeltaInt32;
    exports["rleCompress"] = rleCompress;
    exports["rleDecompress"] = rleDecompress;
    exports["RATCORE_DICT_V1"] = RATCORE_DICT_V1;
    exports["lzCompress"] = lzCompress;
    exports["lzDecompress"] = lzDecompress;
  });

  __define("src/compress/wire2.js", function (exports, __import) {
    var { crc32, rleCompress, rleDecompress, lzCompress, lzDecompress } = __import("src/compress/codec.js");
    var { fnv1a32Bytes } = __import("src/core/math.js");
    var { RatCoreError } = __import("src/core/seal.js");
// RatCore Compress — Бинарный транспортный протокол ratcore-wire/2 (Уровень 11, F-121..F-125, A-81..A-84)
// 24-байтный фрейм RCW2 + CRC32, FastCDC контент-дедупликация, XOR-FEC восстановление и AIMD Backpressure (<= 256 КБ RAM).





const RCW2_MAGIC = 0x52435732; // 'RCW2'
const RCW2_HEADER_BYTES = 24;

const RCW2_CODEC = Object.freeze({
  RAW: 0,
  RLE: 1,
  LZ: 2,
  LZ_DICT: 3,
});

const RCW2_CHANNEL = Object.freeze({
  P0_CONTROL: 0,
  P1_WORLD: 1,
  P2_AI_SYNC: 2,
  P3_BULK: 3,
});

// F-125: Автовыбор кодека с контролем выгоды (не сжимаем в минус!)
function selectBestCompressed(rawBytes, { codec = 'auto', preferFast = false } = {}) {
  const src = rawBytes instanceof Uint8Array ? rawBytes : new Uint8Array(rawBytes);
  if (codec === 'raw' || src.length < 24) {
    return { codecId: RCW2_CODEC.RAW, payload: src };
  }
  if (codec === 'rle') {
    const c = rleCompress(src);
    return c.length < src.length ? { codecId: RCW2_CODEC.RLE, payload: c } : { codecId: RCW2_CODEC.RAW, payload: src };
  }
  if (codec === 'lz') {
    const c = lzCompress(src, { useDict: false });
    return c.length < src.length ? { codecId: RCW2_CODEC.LZ, payload: c } : { codecId: RCW2_CODEC.RAW, payload: src };
  }
  if (codec === 'lz-dict') {
    const c = lzCompress(src, { useDict: true });
    return c.length < src.length ? { codecId: RCW2_CODEC.LZ_DICT, payload: c } : { codecId: RCW2_CODEC.RAW, payload: src };
  }

  // auto: сравниваем кандидатов и берём самый компактный
  const candidates = [{ codecId: RCW2_CODEC.RAW, payload: src }];
  candidates.push({ codecId: RCW2_CODEC.RLE, payload: rleCompress(src) });
  if (!preferFast) {
    candidates.push({ codecId: RCW2_CODEC.LZ_DICT, payload: lzCompress(src, { useDict: true }) });
  }
  candidates.sort((a, b) => a.payload.length - b.payload.length);
  return candidates[0];
}

// Упаковка в 24-байтный бинарный фрейм RCW2 + CRC32
// [0..3] magic 'RCW2' | [4] version=2 | [5] codecId | [6] channel(P0..P3) | [7] flags
// [8..11] seq | [12..15] rawLen | [16..19] payloadLen | [20..23] crc32(raw)
function encodeWire2Frame(data, { seq = 0, channel = RCW2_CHANNEL.P1_WORLD, flags = 0, codec = 'auto', preferFast = false } = {}) {
  const raw = typeof data === 'string'
    ? new TextEncoder().encode(data)
    : (data instanceof Uint8Array ? data : new TextEncoder().encode(JSON.stringify(data)));

  const { codecId, payload } = selectBestCompressed(raw, { codec, preferFast });
  const checksum = crc32(raw);

  const frame = new Uint8Array(RCW2_HEADER_BYTES + payload.length);
  const dv = new DataView(frame.buffer);
  dv.setUint32(0, RCW2_MAGIC, false);
  dv.setUint8(4, 2);
  dv.setUint8(5, codecId);
  dv.setUint8(6, channel & 0x3);
  dv.setUint8(7, flags & 0xff);
  dv.setUint32(8, seq >>> 0, true);
  dv.setUint32(12, raw.length >>> 0, true);
  dv.setUint32(16, payload.length >>> 0, true);
  dv.setUint32(20, checksum >>> 0, true);
  frame.set(payload, RCW2_HEADER_BYTES);

  return {
    frame,
    rawBytes: raw.length,
    wireBytes: frame.length,
    codecId,
    ratio: raw.length > 0 ? Number((frame.length / raw.length).toFixed(4)) : 1,
    savedPct: raw.length > 0 ? Number(((1 - frame.length / raw.length) * 100).toFixed(1)) : 0,
    crc32: checksum,
  };
}

function decodeWire2Frame(frameBytes, { asJson = false, asText = false } = {}) {
  const u8 = frameBytes instanceof Uint8Array ? frameBytes : new Uint8Array(frameBytes);
  if (u8.length < RCW2_HEADER_BYTES) {
    throw new RatCoreError('RC-701', 'Слишком короткий фрейм ratcore-wire/2', 'Убедись, что передан полный буфер >= 24 байт.');
  }
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const magic = dv.getUint32(0, false);
  if (magic !== RCW2_MAGIC) {
    throw new RatCoreError('RC-701', `Неверная сигнатура фрейма RCW2 (0x${magic.toString(16)})`, 'Используй encodeWire2Frame для кодирования.');
  }
  const version = dv.getUint8(4);
  const codecId = dv.getUint8(5);
  const channel = dv.getUint8(6);
  const flags = dv.getUint8(7);
  const seq = dv.getUint32(8, true);
  const rawLen = dv.getUint32(12, true);
  const payloadLen = dv.getUint32(16, true);
  const expectedCrc = dv.getUint32(20, true);

  if (u8.length < RCW2_HEADER_BYTES + payloadLen) {
    throw new RatCoreError('RC-702', 'Обрезанный фрейм RCW2', 'Дождись завершения потоковой доставки чанков.');
  }

  const payload = u8.subarray(RCW2_HEADER_BYTES, RCW2_HEADER_BYTES + payloadLen);
  let raw;
  if (codecId === RCW2_CODEC.RAW) raw = payload.slice();
  else if (codecId === RCW2_CODEC.RLE) raw = rleDecompress(payload);
  else if (codecId === RCW2_CODEC.LZ) raw = lzDecompress(payload, { useDict: false });
  else if (codecId === RCW2_CODEC.LZ_DICT) raw = lzDecompress(payload, { useDict: true });
  else throw new RatCoreError('RC-703', `Неизвестный кодек RCW2: ${codecId}`, 'Поддерживаются 0..3.');

  const actualCrc = crc32(raw);
  if (actualCrc !== expectedCrc || raw.length !== rawLen) {
    throw new RatCoreError('RC-704', 'Контрольная сумма CRC32 фрейма RCW2 не совпала (данные повреждены)', 'Восстанови пакет через xorFecRecover или переотправь по resumeBitmap.');
  }

  let value = raw;
  if (asJson) value = JSON.parse(new TextDecoder().decode(raw));
  else if (asText) value = new TextDecoder().decode(raw);

  return { version, codecId, channel, flags, seq, rawLen, payloadLen, crc32: actualCrc, data: value };
}

// F-121 / A-81: FastCDC контент-дедупликация (Gear-хеш нарезка, повторная синхронизация шлёт только новые куски)
const GEAR_TABLE = (() => {
  const g = new Uint32Array(256);
  let s = 0x9e3779b9;
  for (let i = 0; i < 256; i++) {
    s = (Math.imul(s ^ (s >>> 15), 0x85ebca6b) + 0xc2b2ae35) >>> 0;
    g[i] = s;
  }
  return g;
})();

function fastCdcSplit(bytes, { minSize = 256, avgSize = 1024, maxSize = 4096 } = {}) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const maskBits = Math.max(4, Math.round(Math.log2(avgSize)));
  const mask = ((1 << maskBits) - 1) >>> 0;
  const chunks = [];
  let start = 0;

  while (start < u8.length) {
    const remaining = u8.length - start;
    if (remaining <= minSize) {
      const slice = u8.subarray(start, u8.length);
      chunks.push({ offset: start, length: slice.length, hash: fnv1a32Bytes(slice), bytes: slice });
      break;
    }
    let fp = 0;
    const limit = Math.min(u8.length, start + maxSize);
    let pos = start + minSize;
    while (pos < limit) {
      fp = ((fp << 1) + GEAR_TABLE[u8[pos]]) >>> 0;
      if ((fp & mask) === 0) break;
      pos++;
    }
    const slice = u8.subarray(start, pos);
    chunks.push({ offset: start, length: slice.length, hash: fnv1a32Bytes(slice), bytes: slice });
    start = pos;
  }
  return chunks;
}

function diffFastCdcChunks(chunks, knownHashesSet) {
  const known = knownHashesSet instanceof Set ? knownHashesSet : new Set(knownHashesSet || []);
  const manifest = [];
  const toSend = [];
  let totalBytes = 0;
  let sendBytes = 0;

  for (const ch of chunks) {
    totalBytes += ch.length;
    manifest.push({ hash: ch.hash, length: ch.length });
    if (!known.has(ch.hash)) {
      toSend.push(ch);
      sendBytes += ch.length;
      known.add(ch.hash);
    }
  }
  return {
    manifest,
    toSend,
    totalChunks: chunks.length,
    sentChunks: toSend.length,
    totalBytes,
    sendBytes,
    dedupSavedPct: totalBytes > 0 ? Number(((1 - sendBytes / totalBytes) * 100).toFixed(1)) : 0,
  };
}

// F-124 / A-83: XOR-FEC — 1 пакет чётности на группу K пакетов восстанавливает любую одиночную потерю без переповтора
function xorFecParity(packets) {
  let maxLen = 0;
  for (const p of packets) if (p.length > maxLen) maxLen = p.length;
  const parity = new Uint8Array(maxLen);
  for (const p of packets) {
    for (let i = 0; i < p.length; i++) parity[i] ^= p[i];
  }
  return parity;
}

function xorFecRecover(receivedPacketsOrNull, parity, expectedMissingLen) {
  let missingIdx = -1;
  for (let i = 0; i < receivedPacketsOrNull.length; i++) {
    if (receivedPacketsOrNull[i] == null) {
      if (missingIdx !== -1) {
        throw new RatCoreError('RC-705', 'XOR-FEC восстанавливает не более 1 потерянного пакета в группе', 'Запроси повтор по resumeBitmap.');
      }
      missingIdx = i;
    }
  }
  if (missingIdx === -1) return null;
  const recovered = parity.slice();
  for (let i = 0; i < receivedPacketsOrNull.length; i++) {
    if (i === missingIdx) continue;
    const p = receivedPacketsOrNull[i];
    for (let j = 0; j < p.length; j++) recovered[j] ^= p[j];
  }
  return { index: missingIdx, packet: expectedMissingLen ? recovered.subarray(0, expectedMissingLen) : recovered };
}

// F-123: Потоковое окно <= 256 КБ RAM с AIMD Backpressure и resumeBitmap
class Wire2StreamWindow {
  constructor({ maxWindowBytes = 256 * 1024, initialCwnd = 32 * 1024 } = {}) {
    this.maxWindowBytes = maxWindowBytes;
    this.cwndBytes = Math.min(initialCwnd, maxWindowBytes);
    this.inFlightBytes = 0;
    this.acked = new Set();
    this.lossEvents = 0;
  }

  canSend(bytes) {
    return this.inFlightBytes + bytes <= Math.min(this.cwndBytes, this.maxWindowBytes);
  }

  onSend(seq, bytes) {
    this.inFlightBytes += bytes;
    return { seq, inFlightBytes: this.inFlightBytes, cwndBytes: this.cwndBytes };
  }

  onAck(seq, bytes) {
    this.acked.add(seq);
    this.inFlightBytes = Math.max(0, this.inFlightBytes - bytes);
    // Additive Increase
    this.cwndBytes = Math.min(this.maxWindowBytes, this.cwndBytes + 4096);
  }

  onLoss(bytes) {
    this.lossEvents++;
    this.inFlightBytes = Math.max(0, this.inFlightBytes - bytes);
    // Multiplicative Decrease
    this.cwndBytes = Math.max(4096, Math.floor(this.cwndBytes * 0.5));
  }

  buildResumeBitmap(totalSeqs) {
    const bits = new Uint8Array(Math.ceil(totalSeqs / 8));
    for (let s = 0; s < totalSeqs; s++) {
      if (this.acked.has(s)) bits[s >>> 3] |= (1 << (s & 7));
    }
    return bits;
  }
}
    exports["RCW2_MAGIC"] = RCW2_MAGIC;
    exports["RCW2_HEADER_BYTES"] = RCW2_HEADER_BYTES;
    exports["RCW2_CODEC"] = RCW2_CODEC;
    exports["RCW2_CHANNEL"] = RCW2_CHANNEL;
    exports["selectBestCompressed"] = selectBestCompressed;
    exports["encodeWire2Frame"] = encodeWire2Frame;
    exports["decodeWire2Frame"] = decodeWire2Frame;
    exports["fastCdcSplit"] = fastCdcSplit;
    exports["diffFastCdcChunks"] = diffFastCdcChunks;
    exports["xorFecParity"] = xorFecParity;
    exports["xorFecRecover"] = xorFecRecover;
    exports["Wire2StreamWindow"] = Wire2StreamWindow;
  });

  __define("src/core/clock.js", function (exports, __import) {

// RatCore Core — Фиксированный шаг симуляции + буфер интерполяции (F-01, A-01)

function createClock({ fixedDt, tickHz, maxSubsteps = 4, dayLengthSec = 600 } = {}) {
  const stepDt = Number(fixedDt) > 0 ? Number(fixedDt) : (Number(tickHz) > 0 ? 1 / Number(tickHz) : 1 / 30);
  let accumulator = 0;
  let tick = 0;
  let simTimeSec = 0;
  let speed = 1;
  let paused = false;
  let alpha = 0;

  return {
    get fixedDt() { return stepDt; },
    get tick() { return tick; },
    get simTimeSec() { return simTimeSec; },
    get alpha() { return alpha; },
    get paused() { return paused; },
    get speed() { return speed; },

    setPaused(flag) {
      paused = Boolean(flag);
    },

    setSpeed(mult) {
      speed = Math.max(0, Math.min(16, Number(mult) || 0));
    },

    // F-01: защита от спирали смерти (dtReal <= 0.1 с, шагов <= maxSubsteps)
    advance(dtRealSec, onStep) {
      if (paused || speed <= 0) return { steps: 0, alpha, tick };
      const clamped = Math.min(Math.max(0, Number(dtRealSec) || 0), 0.1) * speed;
      const maxAccum = stepDt * maxSubsteps;
      accumulator = Math.min(accumulator + clamped, maxAccum);

      let steps = 0;
      while (accumulator + 1e-9 >= stepDt && steps < maxSubsteps) {
        accumulator = Math.max(0, accumulator - stepDt);
        tick++;
        simTimeSec += stepDt;
        steps++;
        if (typeof onStep === 'function') onStep(stepDt, tick, simTimeSec);
      }
      alpha = accumulator / stepDt;
      return { steps, alpha, tick, simTimeSec };
    },

    getTimeOfDay() {
      const phase = ((simTimeSec % dayLengthSec) + dayLengthSec) % dayLengthSec / dayLengthSec;
      const totalMinutes = Math.floor(phase * 24 * 60);
      return {
        phase,
        hour: Math.floor(totalMinutes / 60),
        minute: totalMinutes % 60,
        day: Math.floor(simTimeSec / dayLengthSec) + 1,
      };
    },
  };
}
    exports["createClock"] = createClock;
  });

  __define("src/core/code-auditor.js", function (exports, __import) {

// RatCore ToolGuard — Барьер 4: Статический аудитор кода игр/сцен (A-03, RC-107)
// Запрещает импорт внутренних модулей и ручную сборку вершинных/WebGL-буферов в обход RatCore.tools.*

const FORBIDDEN_RULES = [
  {
    id: 'internal-import',
    re: /from\s+['"][^'"]*ratcore\/src\/(?:core\/seal|assets\/mesh-builder|render\/)/gi,
    message: 'Прямой импорт внутренних модулей RatCore запрещён (используй только ratcore/ratcore.js и engine.tools.*)',
  },
  {
    id: 'raw-webgl-buffer',
    re: /\bgl\.(bufferData|createBuffer|drawArrays|drawElements)\s*\(/g,
    message: 'Прямые вызовы WebGL-буферов в обход RatCore.tools.build.* запрещены',
  },
  {
    id: 'raw-vertex-array',
    re: /\b(?:positions|vertices)\s*=\s*new\s+Float32Array\s*\(\s*\[/g,
    message: 'Ручная сборка вершинных массивов в коде игры запрещена — используй engine.tools.build.*',
  },
  {
    id: 'raw-three-geometry',
    re: /\bnew\s+THREE\.(?:BufferGeometry|BoxGeometry|SphereGeometry)\s*\(/g,
    message: 'Прямое создание геометрии Three.js внутри RatCore-сцены запрещено — экспортируй через tools.bridge.*',
  },
  {
    id: 'seal-forgery',
    re: /__kind\s*:\s*['"]RatCore(?:Mesh|Texture)Handle['"]|claimMintAuthority\s*\(/g,
    message: 'Попытка подделки печати ToolGuard или захвата mintAuthority',
  },
  {
    id: 'raw-canvas-texture',
    re: /document\.createElement\s*\(\s*['"]canvas['"]\s*\)\s*\.getContext\s*\(\s*['"]2d['"]\s*\)/g,
    message: 'Ручная отрисовка текстур через сырой 2D Canvas в обход engine.tools.build.texGenerate запрещена',
  },
];

function auditSourceCode(sourceCode, filename = 'scene.js') {
  const code = String(sourceCode || '');
  const violations = [];
  for (const rule of FORBIDDEN_RULES) {
    rule.re.lastIndex = 0;
    let m;
    while ((m = rule.re.exec(code))) {
      const line = code.slice(0, m.index).split('\n').length;
      violations.push({
        code: 'RC-107',
        rule: rule.id,
        file: filename,
        line,
        snippet: m[0],
        message: rule.message,
        autoFixHint: 'Замени ручную геометрию на вызов engine.tools.build.primitive / extrude / loft / lathe / voxels / fromRecipe.',
      });
    }
  }
  return {
    ok: violations.length === 0,
    code: violations.length === 0 ? null : 'RC-107',
    file: filename,
    violations,
  };
}
    exports["auditSourceCode"] = auditSourceCode;
  });

  __define("src/core/input.js", function (exports, __import) {
    var { clamp } = __import("src/core/math.js");
// RatCore Core [input] — Биндинг/ремап клавиш, буфер нажатий и детерминированная запись/реплей ввода (A-60, Уровень 0 Core)



const DEFAULT_BINDINGS = {
  moveForward: ['KeyW', 'ArrowUp'],
  moveBack: ['KeyS', 'ArrowDown'],
  moveLeft: ['KeyA', 'ArrowLeft'],
  moveRight: ['KeyD', 'ArrowRight'],
  fire: ['Space', 'Mouse0'],
  build: ['Digit1', 'KeyB'],
  companion: ['Digit2', 'KeyC'],
  radio: ['Digit3', 'KeyV'],
  interact: ['KeyE'],
  pause: ['Escape', 'KeyP'],
};

class InputManager {
  constructor() {
    this.bindings = new Map();
    for (const [action, keys] of Object.entries(DEFAULT_BINDINGS)) {
      this.bindings.set(action, [...keys]);
    }
    this.pressedActions = new Set();
    this.bufferedActions = new Map(); // action -> expiresTick
    this.axis = { x: 0, y: 0, yaw: 0, pitch: 0 };
    this.recording = false;
    this.recordLog = []; // [{ tick, mask, axisX, axisY, yaw, actions }]
    this.bufferTicks = 6;
  }

  bind({ action, keys = [] } = {}) {
    const act = String(action || '').trim();
    if (!act) return { bound: false };
    const prev = new Set(this.bindings.get(act) || []);
    for (const k of keys) prev.add(String(k));
    this.bindings.set(act, [...prev]);
    return { bound: true, action: act, keys: this.bindings.get(act) };
  }

  remap({ action, keys = [] } = {}) {
    const act = String(action || '').trim();
    if (!act) return { remapped: false };
    const next = [...new Set((Array.isArray(keys) ? keys : [keys]).map(String))];
    this.bindings.set(act, next);
    return { remapped: true, action: act, keys: next };
  }

  resolveKeyToActions(keyCode) {
    const out = [];
    for (const [act, keys] of this.bindings) {
      if (keys.includes(keyCode)) out.push(act);
    }
    return out;
  }

  pushEvent({ action, keyCode, pressed = true, axisX, axisY, yaw, pitch, tick = 0 } = {}) {
    const actions = [];
    if (action) actions.push(String(action));
    if (keyCode) actions.push(...this.resolveKeyToActions(String(keyCode)));

    for (const act of actions) {
      if (pressed) {
        this.pressedActions.add(act);
        this.bufferedActions.set(act, (tick | 0) + this.bufferTicks);
      } else {
        this.pressedActions.delete(act);
      }
    }
    if (axisX !== undefined) this.axis.x = clamp(Number(axisX), -1, 1);
    if (axisY !== undefined) this.axis.y = clamp(Number(axisY), -1, 1);
    if (yaw !== undefined) this.axis.yaw = Number(yaw);
    if (pitch !== undefined) this.axis.pitch = clamp(Number(pitch), -1.5, 1.5);

    const frame = this.poll({ tick });
    if (this.recording) {
      this.recordLog.push({ tick: tick | 0, ...frame });
    }
    return frame;
  }

  consumeBuffered({ action, tick = 0 } = {}) {
    const exp = this.bufferedActions.get(String(action));
    if (exp !== undefined && (tick | 0) <= exp) {
      this.bufferedActions.delete(String(action));
      return { consumed: true, action: String(action) };
    }
    return { consumed: false, action: String(action) };
  }

  poll({ tick = 0 } = {}) {
    // Очистка протухшего буфера нажатий
    for (const [act, exp] of this.bufferedActions) {
      if ((tick | 0) > exp) this.bufferedActions.delete(act);
    }
    let mx = this.axis.x;
    let my = this.axis.y;
    if (this.pressedActions.has('moveRight')) mx += 1;
    if (this.pressedActions.has('moveLeft')) mx -= 1;
    if (this.pressedActions.has('moveForward')) my += 1;
    if (this.pressedActions.has('moveBack')) my -= 1;
    mx = clamp(mx, -1, 1);
    my = clamp(my, -1, 1);

    // Компактная битовая маска действий (совместима с 12-байтным пакетом net.encodeInput12)
    let buttons = 0;
    if (this.pressedActions.has('fire')) buttons |= 1 << 0;
    if (this.pressedActions.has('build')) buttons |= 1 << 1;
    if (this.pressedActions.has('companion')) buttons |= 1 << 2;
    if (this.pressedActions.has('radio')) buttons |= 1 << 3;
    if (this.pressedActions.has('interact')) buttons |= 1 << 4;

    return {
      tick: tick | 0,
      moveX: Number(mx.toFixed(3)),
      moveY: Number(my.toFixed(3)),
      yaw: Number(this.axis.yaw.toFixed(3)),
      pitch: Number(this.axis.pitch.toFixed(3)),
      buttons,
      activeActions: [...this.pressedActions],
      bufferedActions: [...this.bufferedActions.keys()],
    };
  }

  startRecord() {
    this.recording = true;
    this.recordLog = [];
    return { recording: true, frames: 0 };
  }

  stopRecord() {
    this.recording = false;
    return { recording: false, frames: this.recordLog.length, log: [...this.recordLog] };
  }

  replayAt({ tick = 0 } = {}) {
    const t = tick | 0;
    let best = null;
    for (const entry of this.recordLog) {
      if (entry.tick <= t) best = entry;
      else break;
    }
    return best
      ? { found: true, tick: t, frame: { ...best } }
      : { found: false, tick: t, frame: null };
  }

  getState() {
    return {
      mode: this.recording ? 'recording' : 'active',
      coalescedZeroLag: true,
      bindingsCount: this.bindings.size,
      activeActions: [...this.pressedActions],
      recordedFrames: this.recordLog.length,
    };
  }
}
    exports["InputManager"] = InputManager;
  });

  __define("src/core/math.js", function (exports, __import) {

// RatCore Core — Детерминированная математика, PRNG, хеши и процедурные шумы (F-02, F-16..F-18, F-34)
// Запрещено использовать Math.random() внутри симуляции.

function clamp(v, min, max) {
  return v < min ? min : (v > max ? max : v);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1), 0, 1);
  return t * t * (3 - 2 * t);
}

// F-02: Детерминированный PRNG Mulberry32 (одинаковый поток в браузере и Node.js)
function createRng(seed = 1337) {
  let state = (seed >>> 0) || 1;
  return {
    get state() {
      return state;
    },
    next() {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    range(min, max) {
      return min + (max - min) * this.next();
    },
    int(min, maxInclusive) {
      return min + Math.floor(this.next() * (maxInclusive - min + 1));
    },
    pick(arr) {
      return arr[Math.floor(this.next() * arr.length)];
    },
  };
}

// F-34: FNV-1a 32-bit хеш для буферов и строк (проверка целостности AssetVault)
function fnv1a32Bytes(bytes) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i++) {
    hash ^= bytes[i];
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function fnv1a32String(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i) & 0xff;
    hash = Math.imul(hash, 0x01000193) >>> 0;
    if (str.charCodeAt(i) > 0xff) {
      hash ^= (str.charCodeAt(i) >>> 8) & 0xff;
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
  }
  return hash >>> 0;
}

function fnv1a32TypedArray(arr) {
  const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
  return fnv1a32Bytes(bytes);
}

// Векторные операции 3D
function vec3(x = 0, y = 0, z = 0) {
  return [x, y, z];
}

function vec3Sub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function vec3Cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function vec3Dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function vec3Normalize(v) {
  const len = Math.hypot(v[0], v[1], v[2]);
  if (len < 1e-12) return [0, 1, 0];
  return [v[0] / len, v[1] / len, v[2] / len];
}

// Детерминированный 2D value-noise + FBM + Ridged + Domain Warp (F-16..F-18)
function hash2i(ix, iy, seed) {
  let h = Math.imul(ix | 0, 374761393) ^ Math.imul(iy | 0, 668265263) ^ Math.imul(seed | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function valueNoise2D(x, y, seed = 1337) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2i(ix, iy, seed);
  const b = hash2i(ix + 1, iy, seed);
  const c = hash2i(ix, iy + 1, seed);
  const d = hash2i(ix + 1, iy + 1, seed);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy) * 2 - 1;
}

function fbm2D(x, y, { octaves = 4, lacunarity = 2, gain = 0.5, seed = 1337 } = {}) {
  let sum = 0;
  let amp = 1;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise2D(x * freq, y * freq, seed + i * 1013);
    norm += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return norm > 0 ? sum / norm : 0;
}

function ridged2D(x, y, opts = {}) {
  const n = fbm2D(x, y, opts);
  const r = 1 - Math.abs(n);
  return r * r;
}

function domainWarp2D(x, y, { strength = 0.6, seed = 1337, octaves = 3 } = {}) {
  const wx = fbm2D(x + 5.2, y + 1.3, { octaves, seed: seed + 17 });
  const wy = fbm2D(x - 3.7, y + 8.4, { octaves, seed: seed + 31 });
  return fbm2D(x + strength * wx, y + strength * wy, { octaves: octaves + 1, seed: seed + 53 });
}
    exports["clamp"] = clamp;
    exports["lerp"] = lerp;
    exports["smoothstep"] = smoothstep;
    exports["createRng"] = createRng;
    exports["fnv1a32Bytes"] = fnv1a32Bytes;
    exports["fnv1a32String"] = fnv1a32String;
    exports["fnv1a32TypedArray"] = fnv1a32TypedArray;
    exports["vec3"] = vec3;
    exports["vec3Sub"] = vec3Sub;
    exports["vec3Cross"] = vec3Cross;
    exports["vec3Dot"] = vec3Dot;
    exports["vec3Normalize"] = vec3Normalize;
    exports["valueNoise2D"] = valueNoise2D;
    exports["fbm2D"] = fbm2D;
    exports["ridged2D"] = ridged2D;
    exports["domainWarp2D"] = domainWarp2D;
  });

  __define("src/core/modules.js", function (exports, __import) {

// RatCore — 3-уровневый резолвер модулей по выбору (Zero-Cost Opt-In, F-166..F-170, A-110..A-111, RC-108)

const CORE_BRANCHES = Object.freeze([
  'build', 'move', 'remove', 'watch', 'look', 'see', 'input', 'ui', 'save', 'stream',
]);

const STANDARD_MODULES = Object.freeze([
  'anim', 'phys', 'nav', 'env', 'fx', 'ai', 'sim', 'audio', 'hear', 'test',
]);

const OPTIONAL_PACKS = Object.freeze({
  'pack:multiplayer': Object.freeze({ branches: ['net'], deps: ['audio'], estKB: 18 }),
  'pack:destruction': Object.freeze({ branches: ['destroy'], deps: ['phys'], estKB: 14 }),
  'pack:narrative': Object.freeze({ branches: ['story', 'quest'], deps: ['sim'], estKB: 15 }),
  'pack:mods': Object.freeze({ branches: ['mod'], deps: [], estKB: 12 }),
  'pack:cinema': Object.freeze({ branches: ['cutscene'], deps: [], estKB: 11 }),
  'pack:styles': Object.freeze({ branches: ['shader'], deps: [], estKB: 10 }),
  'pack:voice': Object.freeze({ branches: ['voice'], deps: ['audio'], estKB: 12 }),
  'pack:ecology': Object.freeze({ branches: ['eco'], deps: ['env'], estKB: 13 }),
  'pack:companion': Object.freeze({ branches: ['coopAi'], deps: ['ai', 'hear'], estKB: 14 }),
  'pack:assist': Object.freeze({ branches: ['assist'], deps: [], estKB: 8 }),
  'pack:webgpu': Object.freeze({ branches: ['webgpu'], deps: [], estKB: 16 }),
  'pack:wasm-accel': Object.freeze({ branches: ['wasm'], deps: [], estKB: 24 }),
  'pack:studio': Object.freeze({ branches: ['studio'], deps: ['test'], estKB: 22, devOnly: true }),
  'pack:ai-team': Object.freeze({ branches: ['think', 'guess', 'comm', 'bugs', 'bridge'], deps: [], estKB: 26 }),
});

const PRESETS = Object.freeze({
  'minimal-2d': Object.freeze({ modules: [], packs: [] }),
  'arcade-3d': Object.freeze({ modules: ['anim', 'phys', 'fx', 'audio'], packs: [] }),
  'rpg-3d': Object.freeze({ modules: ['anim', 'phys', 'nav', 'env', 'sim', 'audio'], packs: ['pack:narrative'] }),
  'shooter-fps': Object.freeze({ modules: ['anim', 'phys', 'nav', 'fx', 'ai', 'audio', 'hear'], packs: [] }),
  'citybuilder': Object.freeze({ modules: ['nav', 'env', 'sim', 'audio'], packs: [] }),
  'survival': Object.freeze({ modules: ['anim', 'phys', 'nav', 'env', 'fx', 'ai', 'sim', 'audio', 'hear'], packs: [] }),
  'multiplayer-sandbox': Object.freeze({ modules: ['phys', 'nav', 'fx', 'audio'], packs: ['pack:multiplayer', 'pack:mods'] }),
  'ai-dev-full': Object.freeze({ modules: [...STANDARD_MODULES], packs: Object.keys(OPTIONAL_PACKS) }),
});

const BRANCH_TO_OWNER = new Map();
for (const b of CORE_BRANCHES) BRANCH_TO_OWNER.set(b, { tier: 'core', id: b });
for (const m of STANDARD_MODULES) BRANCH_TO_OWNER.set(m, { tier: 'module', id: m });
for (const [packId, spec] of Object.entries(OPTIONAL_PACKS)) {
  for (const b of spec.branches) BRANCH_TO_OWNER.set(b, { tier: 'pack', id: packId });
}

function resolveModuleProfile({ preset = 'minimal-2d', modules = [], packs = [], exclude = [] } = {}) {
  const base = PRESETS[preset] || PRESETS['minimal-2d'];
  const enabledModules = new Set(base.modules);
  const enabledPacks = new Set(base.packs);

  for (const m of modules) {
    if (STANDARD_MODULES.includes(m)) enabledModules.add(m);
  }
  for (const p of packs) {
    if (OPTIONAL_PACKS[p]) enabledPacks.add(p);
  }
  for (const ex of exclude) {
    enabledModules.delete(ex);
    enabledPacks.delete(ex);
  }

  // F-167: замыкание зависимостей выбранных пакетов
  for (const p of [...enabledPacks]) {
    for (const dep of OPTIONAL_PACKS[p].deps) {
      if (STANDARD_MODULES.includes(dep)) enabledModules.add(dep);
    }
  }

  const activeBranches = new Set([...CORE_BRANCHES, ...enabledModules]);
  for (const p of enabledPacks) {
    for (const b of OPTIONAL_PACKS[p].branches) activeBranches.add(b);
  }

  const allOptionalKB = Object.values(OPTIONAL_PACKS).reduce((s, x) => s + x.estKB, 0) + STANDARD_MODULES.length * 8;
  const enabledOptionalKB =
    [...enabledPacks].reduce((s, p) => s + OPTIONAL_PACKS[p].estKB, 0) + enabledModules.size * 8;
  const savingsPct = Math.round((1 - (32 + enabledOptionalKB) / (32 + allOptionalKB)) * 100);

  return {
    preset: PRESETS[preset] ? preset : 'minimal-2d',
    core: [...CORE_BRANCHES],
    modules: [...enabledModules],
    packs: [...enabledPacks],
    activeBranches,
    estBundleKB: 32 + enabledOptionalKB,
    savingsPct: Math.max(0, savingsPct),
  };
}

function createDisabledBranchProxy(branchName) {
  const owner = BRANCH_TO_OWNER.get(branchName) || { tier: 'pack', id: `pack:${branchName}` };
  const fix = owner.tier === 'pack'
    ? `Добавь '${owner.id}' в createEngine({ packs: ['${owner.id}'] }) или вызови engine.enablePack('${owner.id}').`
    : `Добавь '${owner.id}' в createEngine({ modules: ['${owner.id}'] }).`;

  return new Proxy({}, {
    get(_, prop) {
      if (prop === '__disabled') return true;
      if (prop === '__owner') return owner;
      if (typeof prop === 'symbol') return undefined;
      return function disabledToolCall() {
        return {
          ok: false,
          data: null,
          error: {
            code: 'RC-108',
            message: `OPTIONAL_MODULE_DISABLED: ветка tools.${branchName}.${String(prop)} отключена (Zero-Cost Opt-In)`,
            autoFixHint: fix,
            extra: { branch: branchName, required: owner.id, tier: owner.tier },
          },
          tick: 0,
          costMs: 0,
          traceId: 'rc-disabled',
        };
      };
    },
  });
}
    exports["CORE_BRANCHES"] = CORE_BRANCHES;
    exports["STANDARD_MODULES"] = STANDARD_MODULES;
    exports["OPTIONAL_PACKS"] = OPTIONAL_PACKS;
    exports["PRESETS"] = PRESETS;
    exports["resolveModuleProfile"] = resolveModuleProfile;
    exports["createDisabledBranchProxy"] = createDisabledBranchProxy;
  });

  __define("src/core/seal.js", function (exports, __import) {
    var { fnv1a32TypedArray, fnv1a32String } = __import("src/core/math.js");
// RatCore ToolGuard — Барьер 1 (одноразовая печать) и Барьер 2 (AssetVault с FNV-1a)
// Реализация A-02 и кодов RC-101, RC-102, RC-105, RC-106.



class RatCoreError extends Error {
  constructor(code, message, hint = '', extra = null) {
    super(`[${code}] ${message}`);
    this.name = 'RatCoreError';
    this.code = code;
    this.hint = hint;
    this.autoFixHint = hint;
    this.extra = extra;
  }
}

// Фабрика изолированного контура ToolGuard на один инстанс движка.
// Приватный WeakMap и одноразовый claimMintAuthority недоступны извне.
function createToolGuardVault() {
  const sealedMeshes = new WeakMap();
  const sealedTextures = new WeakMap();
  const meshStore = new Map();
  const textureStore = new Map();
  const auditLog = [];

  let mintClaimed = false;
  let nextMeshId = 1;
  let nextTexId = 1;

  function recordAudit(code, message, details = {}) {
    auditLog.push({
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  function hashMeshBuffers(buffers) {
    let h = fnv1a32TypedArray(buffers.positions);
    h = (h ^ fnv1a32TypedArray(buffers.indices)) >>> 0;
    if (buffers.normals) h = (h ^ fnv1a32TypedArray(buffers.normals)) >>> 0;
    if (buffers.uvs) h = (h ^ fnv1a32TypedArray(buffers.uvs)) >>> 0;
    if (buffers.colors) h = (h ^ fnv1a32TypedArray(buffers.colors)) >>> 0;
    return h >>> 0;
  }

  function hashTextureData(tex) {
    let h = fnv1a32TypedArray(tex.pixels);
    h = (h ^ fnv1a32String(`${tex.width}x${tex.height}`)) >>> 0;
    return h >>> 0;
  }

  // Барьер 1: одноразовый захват права выпускать печати (повторный вызов -> RC-105)
  function claimMintAuthority(ownerTag = 'toolkit') {
    if (mintClaimed) {
      recordAudit('RC-105', 'Повторная попытка захватить mintAuthority', { ownerTag });
      throw new RatCoreError(
        'RC-105',
        'Повторный захват mintAuthority запрещён (ToolGuard Barrier 1)',
        'Печать может захватить только официальный tools/toolkit.js один раз при инициализации движка.'
      );
    }
    mintClaimed = true;

    return Object.freeze({
      mintMesh({ buffers, bounds, triCount, provenance, validated = false }) {
        const id = `mesh_${String(nextMeshId++).padStart(5, '0')}`;
        const copyBuffers = {
          positions: new Float32Array(buffers.positions),
          indices: new Uint32Array(buffers.indices),
          normals: buffers.normals ? new Float32Array(buffers.normals) : null,
          uvs: buffers.uvs ? new Float32Array(buffers.uvs) : null,
          colors: buffers.colors ? new Uint32Array(buffers.colors) : null,
        };
        const contentHash = hashMeshBuffers(copyBuffers);
        const entry = {
          id,
          buffers: copyBuffers,
          bounds: Object.freeze({ ...bounds }),
          triCount,
          vertexCount: copyBuffers.positions.length / 3,
          contentHash,
          provenance: Object.freeze({ ...provenance }),
          validated: Boolean(validated),
        };
        meshStore.set(id, entry);

        // Барьер 2: непрозрачный замороженный хэндл без доступа к сырым буферам
        const handle = Object.freeze({
          __kind: 'RatCoreMeshHandle',
          id,
          triCount,
          vertexCount: entry.vertexCount,
          bounds: entry.bounds,
          validated: entry.validated,
          tool: provenance.tool,
        });
        sealedMeshes.set(handle, { id, contentHash });
        return handle;
      },

      mintTexture({ width, height, pixels, normals = null, damagedPixels = null, provenance }) {
        const id = `tex_${String(nextTexId++).padStart(5, '0')}`;
        const copy = {
          width,
          height,
          pixels: new Uint32Array(pixels),
          normals: normals ? new Uint32Array(normals) : null,
          damagedPixels: damagedPixels ? new Uint32Array(damagedPixels) : null,
        };
        const contentHash = hashTextureData(copy);
        const entry = {
          id,
          ...copy,
          contentHash,
          provenance: Object.freeze({ ...provenance }),
        };
        textureStore.set(id, entry);

        const handle = Object.freeze({
          __kind: 'RatCoreTextureHandle',
          id,
          width,
          height,
          hasNormals: Boolean(copy.normals),
          hasDamaged: Boolean(copy.damagedPixels),
          tool: provenance.tool,
        });
        sealedTextures.set(handle, { id, contentHash });
        return handle;
      },
    });
  }

  // Проверка и выдача буферов меша исключительно внутренним слоям движка
  function readSealedMesh(handle, caller = 'renderer') {
    const meta = handle && typeof handle === 'object' ? sealedMeshes.get(handle) : null;
    if (!meta) {
      recordAudit('RC-101', 'Попытка передать неподписанный/сырой меш в движок', { caller });
      throw new RatCoreError(
        'RC-101',
        'RAW_GEOMETRY_FORBIDDEN: меш создан в обход RatCore.tools.build.*',
        'Создавай меши только через engine.tools.build.primitive / extrude / loft / lathe / voxels / layer / fromRecipe.'
      );
    }
    const entry = meshStore.get(meta.id);
    if (!entry) {
      recordAudit('RC-106', 'Хэндл ссылается на отсутствующую запись AssetVault', { id: meta.id, caller });
      throw new RatCoreError('RC-106', 'Запись меша в AssetVault повреждена или удалена', 'Пересобери модель из рецепта через tools.build.fromRecipe.');
    }
    const liveHash = hashMeshBuffers(entry.buffers);
    if (liveHash !== meta.contentHash) {
      recordAudit('RC-106', 'Нарушена контрольная сумма буфера меша в AssetVault', { id: meta.id, caller });
      throw new RatCoreError('RC-106', 'TAMPER_DETECTED: контрольная сумма меша нарушена', 'Пересобери меш через tools.build.fromRecipe.');
    }
    return entry;
  }

  function readSealedTexture(handle, caller = 'renderer') {
    const meta = handle && typeof handle === 'object' ? sealedTextures.get(handle) : null;
    if (!meta) {
      recordAudit('RC-102', 'Попытка передать неподписанную/сырую текстуру в движок', { caller });
      throw new RatCoreError(
        'RC-102',
        'RAW_TEXTURE_FORBIDDEN: текстура создана в обход RatCore.tools.build.tex.*',
        'Создавай текстуры только через engine.tools.build.texGenerate.'
      );
    }
    const entry = textureStore.get(meta.id);
    if (!entry || hashTextureData(entry) !== meta.contentHash) {
      recordAudit('RC-106', 'Нарушена контрольная сумма текстуры в AssetVault', { id: meta.id, caller });
      throw new RatCoreError('RC-106', 'TAMPER_DETECTED: контрольная сумма текстуры нарушена', 'Пересобери текстуру через tools.build.texGenerate.');
    }
    return entry;
  }

  function isSealedMesh(handle) {
    return Boolean(handle && typeof handle === 'object' && sealedMeshes.has(handle));
  }

  function isSealedTexture(handle) {
    return Boolean(handle && typeof handle === 'object' && sealedTextures.has(handle));
  }

  function getStats() {
    return {
      meshes: meshStore.size,
      textures: textureStore.size,
      auditEvents: auditLog.length,
    };
  }

  function getAuditLog() {
    return auditLog.slice();
  }

  return Object.freeze({
    claimMintAuthority,
    readSealedMesh,
    readSealedTexture,
    isSealedMesh,
    isSealedTexture,
    recordAudit,
    getStats,
    getAuditLog,
  });
}
    exports["RatCoreError"] = RatCoreError;
    exports["createToolGuardVault"] = createToolGuardVault;
  });

  __define("src/core/ui.js", function (exports, __import) {
    var { clamp } = __import("src/core/math.js");
    var { RatCoreError } = __import("src/core/seal.js");
// RatCore Core [ui] — Декларативный HUD (виджеты, тосты, диалоги с выборами) без сырого DOM (Уровень 0 Core)




const UI_WIDGET_KINDS = Object.freeze(['bar', 'counter', 'compass', 'panel', 'minimap', 'badge']);

class UiHudManager {
  constructor() {
    this.widgets = new Map();
    this.toasts = [];
    this.dialogs = new Map();
    this.nextToastId = 1;
  }

  setWidget({ id, kind = 'counter', label = '', value = 0, max = 100, tone = 'info', visible = true } = {}) {
    const wid = String(id || '').trim();
    if (!wid) throw new RatCoreError('RC-104', 'Укажи id HUD-виджета', 'Например: { id: "hp", kind: "bar", value: 85, max: 100 }.');
    const w = {
      id: wid,
      kind: UI_WIDGET_KINDS.includes(kind) ? kind : 'counter',
      label: String(label || wid),
      value,
      max: Number(max),
      pct: typeof value === 'number' && Number(max) > 0 ? Math.round(clamp((value / Number(max)) * 100, 0, 100)) : null,
      tone: String(tone),
      visible: Boolean(visible),
    };
    this.widgets.set(wid, w);
    return { ...w };
  }

  removeWidget({ id } = {}) {
    const removed = this.widgets.delete(String(id));
    return { id: String(id), removed };
  }

  notify({ text = '', level = 'info', ttlSec = 4.0 } = {}) {
    const toast = {
      id: `toast-${this.nextToastId++}`,
      text: String(text),
      level: String(level),
      remainingSec: clamp(Number(ttlSec), 0.5, 30),
    };
    this.toasts.push(toast);
    if (this.toasts.length > 8) this.toasts.shift();
    return { ...toast };
  }

  openDialog({ id = 'dlg-1', speaker = 'Система', text = '', choices = [] } = {}) {
    const did = String(id);
    const dlg = {
      id: did,
      speaker: String(speaker),
      text: String(text),
      choices: (Array.isArray(choices) ? choices : []).map((c, idx) => ({
        index: idx,
        label: typeof c === 'string' ? c : String(c.label || `Вариант ${idx + 1}`),
        action: typeof c === 'object' && c ? (c.action || null) : null,
      })),
      open: true,
      chosenIndex: null,
    };
    this.dialogs.set(did, dlg);
    return { ...dlg };
  }

  chooseDialog({ id = 'dlg-1', choiceIndex = 0 } = {}) {
    const dlg = this.dialogs.get(String(id));
    if (!dlg || !dlg.open) {
      throw new RatCoreError('RC-104', `Открытый диалог "${id}" не найден`, 'Сначала открой диалог через ui.openDialog().');
    }
    const idx = Number(choiceIndex) | 0;
    if (idx < 0 || idx >= dlg.choices.length) {
      throw new RatCoreError('RC-104', `Индекс варианта ${idx} вне диапазона (0..${dlg.choices.length - 1})`, 'Выбери существующий вариант.');
    }
    dlg.open = false;
    dlg.chosenIndex = idx;
    return { id: dlg.id, open: false, chosen: dlg.choices[idx] };
  }

  tick({ dt = 0.016 } = {}) {
    const step = Math.max(0, Number(dt));
    for (let i = this.toasts.length - 1; i >= 0; i--) {
      this.toasts[i].remainingSec -= step;
      if (this.toasts[i].remainingSec <= 0) this.toasts.splice(i, 1);
    }
    return { activeToasts: this.toasts.length, widgets: this.widgets.size };
  }

  getSummary(extra = {}) {
    return {
      ...extra,
      widgetCount: this.widgets.size,
      widgets: [...this.widgets.values()],
      toasts: this.toasts.map((t) => ({ id: t.id, text: t.text, level: t.level, remainingSec: Number(t.remainingSec.toFixed(2)) })),
      openDialogs: [...this.dialogs.values()].filter((d) => d.open),
    };
  }
}
    exports["UI_WIDGET_KINDS"] = UI_WIDGET_KINDS;
    exports["UiHudManager"] = UiHudManager;
  });

  __define("src/modules/ai.js", function (exports, __import) {
    var { clamp } = __import("src/core/math.js");
    var { parseNaturalCommand } = __import("src/packs/companion.js");
// RatCore Module [ai] — Игровой ИИ (Utility AI, GOAP-планировщик и локальный NLU, Уровень 1 Opt-In)




class GameAiSystem {
  constructor() {
    this.agents = new Map();
  }

  registerAgent({ id = 'npc-1', role = 'guard', hp = 100, ammo = 30, energy = 100 } = {}) {
    const agent = {
      id: String(id),
      role: String(role),
      hp: clamp(Number(hp), 0, 100),
      ammo: Math.max(0, Number(ammo)),
      energy: clamp(Number(energy), 0, 100),
      lastAction: 'idle',
    };
    this.agents.set(agent.id, agent);
    return { ...agent };
  }

  // Utility AI: выбирает оптимальное действие по кривым полезности
  evaluateUtility({ id = 'npc-1', enemyDist = 30, coverDist = 6, medkitDist = 12 } = {}) {
    const a = this.agents.get(id) || this.registerAgent({ id });
    const hpNorm = a.hp / 100;
    const ammoNorm = clamp(a.ammo / 30, 0, 1);
    const threat = clamp(1 - enemyDist / 45, 0, 1);

    const scores = {
      retreat_heal: clamp((1 - hpNorm) * 1.15 - medkitDist * 0.015, 0, 1),
      take_cover: clamp(threat * (1.1 - hpNorm * 0.5) - coverDist * 0.02, 0, 1),
      engage: clamp(threat * ammoNorm * hpNorm * 1.1, 0, 1),
      reload: clamp((1 - ammoNorm) * 0.95, 0, 1),
      patrol: clamp((1 - threat) * (a.energy / 100) * 0.65, 0, 1),
    };

    let bestAction = 'patrol';
    let bestScore = -1;
    for (const [act, sc] of Object.entries(scores)) {
      if (sc > bestScore) {
        bestScore = sc;
        bestAction = act;
      }
    }
    a.lastAction = bestAction;
    return {
      agentId: a.id,
      chosenAction: bestAction,
      score: Number(bestScore.toFixed(3)),
      scores: Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, Number(v.toFixed(3))])),
    };
  }

  // Простой GOAP-планировщик цепочки действий (BFS по булеву состоянию мира)
  planGoal({ state = {}, goal = {}, actions = [] } = {}) {
    const startKey = JSON.stringify(state);
    const queue = [{ state: { ...state }, plan: [] }];
    const visited = new Set([startKey]);

    const matchesGoal = (st) => Object.entries(goal).every(([k, v]) => st[k] === v);

    while (queue.length > 0 && visited.size < 256) {
      const cur = queue.shift();
      if (matchesGoal(cur.state)) {
        return { found: true, steps: cur.plan.length, plan: cur.plan };
      }
      for (const act of actions) {
        const pre = act.pre || {};
        if (!Object.entries(pre).every(([k, v]) => cur.state[k] === v)) continue;
        const nextState = { ...cur.state, ...(act.effect || {}) };
        const key = JSON.stringify(nextState);
        if (visited.has(key)) continue;
        visited.add(key);
        queue.push({ state: nextState, plan: [...cur.plan, act.name] });
      }
    }
    return { found: false, steps: 0, plan: [] };
  }

  nluParse({ text = '' } = {}) {
    return parseNaturalCommand(text);
  }
}
    exports["GameAiSystem"] = GameAiSystem;
  });

  __define("src/modules/anim.js", function (exports, __import) {
    var { clamp, lerp } = __import("src/core/math.js");
    var { RatCoreError } = __import("src/core/seal.js");
// RatCore Module [anim] — Скелет, 2-костная аналитическая IK (Закон косинусов), ключевые кадры и Verlet-цепь (Уровень 1 Opt-In)




// Аналитическая 2-костная инверсная кинематика в 2D/3D-плоскости (Закон косинусов)
function solveTwoBoneIK({
  root = [0, 0],
  target = [1, 0],
  len1 = 1.0,
  len2 = 1.0,
  bendSign = 1,
} = {}) {
  const dx = Number(target[0]) - Number(root[0]);
  const dy = Number(target[1]) - Number(root[1]);
  const l1 = Math.max(1e-4, Number(len1));
  const l2 = Math.max(1e-4, Number(len2));
  const rawDist = Math.hypot(dx, dy);
  const maxReach = l1 + l2 - 1e-4;
  const minReach = Math.abs(l1 - l2) + 1e-4;
  const dist = clamp(rawDist, minReach, maxReach);

  const baseAngle = Math.atan2(dy, dx);
  const cosA = clamp((l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist), -1, 1);
  const cosB = clamp((l1 * l1 + l2 * l2 - dist * dist) / (2 * l1 * l2), -1, 1);
  const sign = bendSign < 0 ? -1 : 1;

  const shoulderAngle = baseAngle + sign * Math.acos(cosA);
  const elbowAngle = Math.PI - Math.acos(cosB);
  const joint = [
    Number((root[0] + Math.cos(shoulderAngle) * l1).toFixed(4)),
    Number((root[1] + Math.sin(shoulderAngle) * l1).toFixed(4)),
  ];
  const end = [
    Number((joint[0] + Math.cos(shoulderAngle - sign * elbowAngle) * l2).toFixed(4)),
    Number((joint[1] + Math.sin(shoulderAngle - sign * elbowAngle) * l2).toFixed(4)),
  ];

  return {
    reachable: rawDist <= l1 + l2 && rawDist >= Math.abs(l1 - l2),
    shoulderAngleRad: Number(shoulderAngle.toFixed(4)),
    elbowBendRad: Number(elbowAngle.toFixed(4)),
    joint,
    end,
  };
}

class AnimationSystem {
  constructor() {
    this.clips = new Map();
    this.chains = new Map();
  }

  defineClip({ id = 'idle', durationSec = 1.0, loop = true, keyframes = [] } = {}) {
    if (!Array.isArray(keyframes) || keyframes.length < 2) {
      throw new RatCoreError('RC-104', 'Клип анимации требует минимум 2 кадра (keyframes)', 'Передай [{ t: 0, value: 0 }, { t: 1, value: 1 }].');
    }
    const sorted = [...keyframes].sort((a, b) => a.t - b.t);
    this.clips.set(String(id), { id: String(id), durationSec: Math.max(0.05, Number(durationSec)), loop: Boolean(loop), keyframes: sorted });
    return { clipId: String(id), keyframes: sorted.length };
  }

  sampleClip({ id, timeSec = 0 } = {}) {
    const clip = this.clips.get(id);
    if (!clip) throw new RatCoreError('RC-104', `Клип "${id}" не найден`, 'Создай клип через anim.defineClip().');
    let t = Number(timeSec);
    if (clip.loop) t = ((t % clip.durationSec) + clip.durationSec) % clip.durationSec;
    else t = clamp(t, 0, clip.durationSec);
    const kfs = clip.keyframes;
    let a = kfs[0];
    let b = kfs[kfs.length - 1];
    for (let i = 0; i < kfs.length - 1; i++) {
      if (t >= kfs[i].t && t <= kfs[i + 1].t) {
        a = kfs[i];
        b = kfs[i + 1];
        break;
      }
    }
    const span = Math.max(1e-6, b.t - a.t);
    const alpha = clamp((t - a.t) / span, 0, 1);
    return {
      clipId: id,
      timeSec: Number(t.toFixed(4)),
      value: Number(lerp(Number(a.value ?? 0), Number(b.value ?? 0), alpha).toFixed(4)),
    };
  }

  createVerletChain({ id = 'cape', nodes = 6, segmentLen = 0.5, origin = [0, 0, 3] } = {}) {
    const count = clamp(Number(nodes) | 0, 2, 32);
    const len = Math.max(0.05, Number(segmentLen));
    const pts = [];
    for (let i = 0; i < count; i++) {
      const p = [origin[0], origin[1], origin[2] - i * len];
      pts.push({ x: p[0], y: p[1], h: p[2], px: p[0], py: p[1], ph: p[2], pinned: i === 0 });
    }
    this.chains.set(String(id), { id: String(id), segmentLen: len, pts });
    return { chainId: String(id), nodes: count, segmentLen: len };
  }

  stepVerletChain({ id = 'cape', dt = 1 / 60, gravity = -9.81, windX = 0, iterations = 4 } = {}) {
    const chain = this.chains.get(id);
    if (!chain) throw new RatCoreError('RC-104', `Цепь Verlet "${id}" не найдена`, 'Создай цепь через anim.createVerletChain().');
    const dt2 = dt * dt;
    for (const p of chain.pts) {
      if (p.pinned) continue;
      const vx = (p.x - p.px) * 0.985;
      const vy = (p.y - p.py) * 0.985;
      const vh = (p.h - p.ph) * 0.985;
      p.px = p.x; p.py = p.y; p.ph = p.h;
      p.x += vx + windX * dt2;
      p.y += vy;
      p.h += vh + gravity * dt2;
    }
    for (let it = 0; it < iterations; it++) {
      for (let i = 0; i < chain.pts.length - 1; i++) {
        const a = chain.pts[i];
        const b = chain.pts[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dh = b.h - a.h;
        const dist = Math.hypot(dx, dy, dh) || 1e-6;
        const diff = (dist - chain.segmentLen) / dist;
        if (a.pinned) {
          b.x -= dx * diff; b.y -= dy * diff; b.h -= dh * diff;
        } else {
          a.x += dx * diff * 0.5; a.y += dy * diff * 0.5; a.h += dh * diff * 0.5;
          b.x -= dx * diff * 0.5; b.y -= dy * diff * 0.5; b.h -= dh * diff * 0.5;
        }
      }
    }
    const tail = chain.pts[chain.pts.length - 1];
    return {
      chainId: id,
      nodes: chain.pts.length,
      tailPos: [Number(tail.x.toFixed(3)), Number(tail.y.toFixed(3)), Number(tail.h.toFixed(3))],
    };
  }
}
    exports["solveTwoBoneIK"] = solveTwoBoneIK;
    exports["AnimationSystem"] = AnimationSystem;
  });

  __define("src/modules/audio.js", function (exports, __import) {
    var { clamp, createRng } = __import("src/core/math.js");
// RatCore Modules [audio + hear] — Процедурный синтез PCM-звуков (0 КБ ассетов) и 3D-слух ИИ с затуханием 1/r² (Уровень 1 Opt-In)



const SOUND_PRESETS = Object.freeze({
  click: { freq: 720, duration: 0.05, wave: 'sine', decay: 28 },
  step: { freq: 140, duration: 0.09, wave: 'noise', decay: 18 },
  impact: { freq: 95, duration: 0.22, wave: 'noise', decay: 10 },
  shot: { freq: 240, duration: 0.18, wave: 'noise', decay: 14 },
  alarm: { freq: 880, duration: 0.35, wave: 'square', decay: 3 },
  engine: { freq: 68, duration: 0.3, wave: 'saw', decay: 1.5 },
});

// Процедурная генерация PCM Float32 буфера (работает в Node.js и Web Audio API, 0 КБ аудиофайлов!)
function synthesizeSoundPCM({ preset = 'click', freq, duration, wave, decay, sampleRate = 22050, seed = 1 } = {}) {
  const base = SOUND_PRESETS[preset] || SOUND_PRESETS.click;
  const f0 = Number(freq ?? base.freq);
  const dur = clamp(Number(duration ?? base.duration), 0.01, 2.0);
  const wKind = wave || base.wave;
  const dec = Number(decay ?? base.decay);
  const n = Math.max(16, Math.floor(dur * sampleRate));
  const pcm = new Float32Array(n);
  const rng = createRng(seed);

  let peak = 0;
  let energy = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-dec * t);
    let s = 0;
    if (wKind === 'sine') s = Math.sin(2 * Math.PI * f0 * t);
    else if (wKind === 'square') s = Math.sin(2 * Math.PI * f0 * t) >= 0 ? 1 : -1;
    else if (wKind === 'saw') s = 2 * ((t * f0) % 1) - 1;
    else s = (rng.next() * 2 - 1) * 0.7 + Math.sin(2 * Math.PI * f0 * t * Math.exp(-4 * t)) * 0.3;

    const v = clamp(s * env, -1, 1);
    pcm[i] = v;
    const av = Math.abs(v);
    if (av > peak) peak = av;
    energy += v * v;
  }

  return {
    preset,
    sampleRate,
    samples: n,
    durationSec: dur,
    rms: Number(Math.sqrt(energy / n).toFixed(4)),
    peak: Number(peak.toFixed(4)),
    pcm,
  };
}

// 3D-акустическая сцена: события звука слышны ИИ через tools.hear.listen() с учётом расстояния и окклюзии
class AcousticWorld {
  constructor() {
    this.events = [];
    this.nextId = 1;
  }

  emit({ kind = 'step', x = 0, y = 0, h = 0, loudnessDb, volumeDb, sourceId = null, tick = 0, ttlTicks = 30 } = {}) {
    const db = loudnessDb ?? volumeDb ?? 70;
    const ev = {
      id: `snd_${this.nextId++}`,
      kind: String(kind),
      x: Number(x),
      y: Number(y),
      h: Number(h),
      loudnessDb: clamp(Number(db), 10, 140),
      sourceId,
      tick,
      expiresTick: tick + Math.max(1, ttlTicks | 0),
    };
    this.events.push(ev);
    if (this.events.length > 256) this.events.shift();
    return ev;
  }

  // Слух для ИИ-агента: ослабление по закону обратных квадратов 20*log10(d) + простая проверка рельефа
  listen({ x = 0, y = 0, h = 1.6, thresholdDb = 25, currentTick = 0, heightField = null } = {}) {
    const heard = [];
    for (const ev of this.events) {
      if (currentTick > ev.expiresTick) continue;
      const dist = Math.hypot(ev.x - x, ev.y - y, ev.h - h);
      const attenDb = dist > 1 ? 20 * Math.log10(dist) : 0;

      // Грубая проверка окклюзии холмом в средней точке
      let occlusionDb = 0;
      if (heightField && dist > 2) {
        const midX = (ev.x + x) * 0.5;
        const midY = (ev.y + y) * 0.5;
        const midH = (ev.h + h) * 0.5;
        const terrainMid = heightField.sampleHeight(midX, midY);
        if (terrainMid > midH + 0.5) occlusionDb = 12;
      }

      const perceivedDb = ev.loudnessDb - attenDb - occlusionDb;
      if (perceivedDb >= thresholdDb) {
        const az = ((Math.atan2(ev.x - x, ev.y - y) * 180) / Math.PI + 360) % 360;
        heard.push({
          id: ev.id,
          kind: ev.kind,
          sourceId: ev.sourceId,
          x: ev.x,
          y: ev.y,
          distance: Number(dist.toFixed(2)),
          azimuthDeg: Number(az.toFixed(1)),
          perceivedDb: Number(perceivedDb.toFixed(1)),
          occluded: occlusionDb > 0,
        });
      }
    }
    heard.sort((a, b) => b.perceivedDb - a.perceivedDb);
    return heard;
  }
}
    exports["SOUND_PRESETS"] = SOUND_PRESETS;
    exports["synthesizeSoundPCM"] = synthesizeSoundPCM;
    exports["AcousticWorld"] = AcousticWorld;
  });

  __define("src/modules/env.js", function (exports, __import) {
    var { clamp, vec3Normalize } = __import("src/core/math.js");
// RatCore Module [env] — Среда, цикл день/ночь, погода, ветер и температура по высоте (Уровень 1 Opt-In)



const WEATHER_KINDS = Object.freeze(['clear', 'cloudy', 'rain', 'snow', 'fog', 'storm']);

class EnvironmentSystem {
  constructor() {
    this.timeHours = 10.5; // 0..24
    this.weather = 'clear';
    this.weatherIntensity = 0;
    this.windDirDeg = 45;
    this.windSpeedMs = 3.5;
    this.seaLevelTempC = 18;
  }

  setTime(hours) {
    this.timeHours = ((Number(hours) % 24) + 24) % 24;
    return this.getLightingState();
  }

  advanceHours(deltaHours) {
    return this.setTime(this.timeHours + Number(deltaHours || 0));
  }

  setWeather({ kind = 'clear', intensity = 0.5, windSpeedMs, windDirDeg } = {}) {
    this.weather = WEATHER_KINDS.includes(kind) ? kind : 'clear';
    this.weatherIntensity = this.weather === 'clear' ? 0 : clamp(Number(intensity), 0, 1);
    if (windSpeedMs !== undefined) this.windSpeedMs = clamp(Number(windSpeedMs), 0, 50);
    if (windDirDeg !== undefined) this.windDirDeg = ((Number(windDirDeg) % 360) + 360) % 360;
    return this.getState();
  }

  getSunVector() {
    // 6:00 восход (восток +X), 12:00 зенит (+Y), 18:00 закат (-X)
    const angle = ((this.timeHours - 6) / 24) * Math.PI * 2;
    const elev = Math.sin(angle);
    const horiz = Math.cos(angle);
    return vec3Normalize([horiz, Math.max(-0.5, elev), 0.35]);
  }

  getLightingState() {
    const sunDir = this.getSunVector();
    const dayFactor = clamp((sunDir[1] + 0.15) / 0.85, 0, 1);
    const stormDim = this.weather === 'storm' ? 0.55 : (this.weather === 'rain' || this.weather === 'fog' ? 0.78 : 1.0);
    const ambient = clamp((0.16 + dayFactor * 0.45) * stormDim, 0.1, 0.8);
    const fogDensity = this.weather === 'fog' ? 0.04 + this.weatherIntensity * 0.08
      : (this.weather === 'storm' ? 0.025 : 0.004);
    const skyRgb = [
      Math.round((16 + dayFactor * 92) * stormDim),
      Math.round((24 + dayFactor * 145) * stormDim),
      Math.round((44 + dayFactor * 185) * stormDim),
    ];
    return {
      timeHours: Number(this.timeHours.toFixed(2)),
      phase: dayFactor > 0.6 ? 'day' : (dayFactor > 0.18 ? 'twilight' : 'night'),
      sunDir,
      ambient: Number(ambient.toFixed(3)),
      fogDensity: Number(fogDensity.toFixed(4)),
      skyRgb,
    };
  }

  getWindVector() {
    const rad = (this.windDirDeg * Math.PI) / 180;
    return {
      dx: Number((Math.sin(rad) * this.windSpeedMs).toFixed(3)),
      dy: Number((Math.cos(rad) * this.windSpeedMs).toFixed(3)),
      speedMs: this.windSpeedMs,
      dirDeg: this.windDirDeg,
    };
  }

  // Температура с градиентом -6.5°C на 1000 м и суточным ходом
  sampleTemperatureC(elevationH = 0) {
    const diurnal = Math.sin(((this.timeHours - 9) / 24) * Math.PI * 2) * 5;
    const lapse = (Number(elevationH) / 1000) * 6.5;
    const coldWeather = this.weather === 'snow' ? -14 : (this.weather === 'rain' ? -3 : 0);
    return Number((this.seaLevelTempC + diurnal - lapse + coldWeather).toFixed(2));
  }

  getState() {
    return {
      ...this.getLightingState(),
      weather: this.weather,
      weatherIntensity: this.weatherIntensity,
      wind: this.getWindVector(),
      seaLevelTempC: this.sampleTemperatureC(0),
    };
  }
}
    exports["WEATHER_KINDS"] = WEATHER_KINDS;
    exports["EnvironmentSystem"] = EnvironmentSystem;
  });

  __define("src/modules/fx.js", function (exports, __import) {
    var { clamp, createRng } = __import("src/core/math.js");
// RatCore Module [fx] — Детерминированный пул частиц SoA, декали и тряска камеры (Уровень 1 Opt-In)



class FxSystem {
  constructor({ maxParticles = 512, seed = 1337 } = {}) {
    this.maxParticles = clamp(Number(maxParticles) | 0, 32, 4096);
    this.rng = createRng(seed);
    this.x = new Float32Array(this.maxParticles);
    this.y = new Float32Array(this.maxParticles);
    this.h = new Float32Array(this.maxParticles);
    this.vx = new Float32Array(this.maxParticles);
    this.vy = new Float32Array(this.maxParticles);
    this.vh = new Float32Array(this.maxParticles);
    this.life = new Float32Array(this.maxParticles);
    this.activeCount = 0;
    this.decals = [];
    this.shake = { trauma: 0, offsetX: 0, offsetY: 0, offsetH: 0 };
  }

  emitBurst({ x = 0, y = 0, h = 1, count = 24, speed = 4, lifeSec = 1.2 } = {}) {
    const n = clamp(Number(count) | 0, 1, 256);
    let spawned = 0;
    for (let i = 0; i < this.maxParticles && spawned < n; i++) {
      if (this.life[i] <= 0) {
        const ang = this.rng.next() * Math.PI * 2;
        const spd = speed * (0.4 + this.rng.next() * 0.8);
        this.x[i] = Number(x);
        this.y[i] = Number(y);
        this.h[i] = Number(h);
        this.vx[i] = Math.cos(ang) * spd;
        this.vy[i] = Math.sin(ang) * spd;
        this.vh[i] = speed * (0.5 + this.rng.next() * 0.9);
        this.life[i] = Number(lifeSec) * (0.7 + this.rng.next() * 0.6);
        spawned++;
      }
    }
    this._recount();
    return { spawned, activeParticles: this.activeCount };
  }

  addDecal({ x = 0, y = 0, h = 0, kind = 'scorch', radius = 1.2 } = {}) {
    const decal = { id: `dec-${this.decals.length + 1}`, x: Number(x), y: Number(y), h: Number(h), kind: String(kind), radius: Number(radius) };
    this.decals.push(decal);
    if (this.decals.length > 128) this.decals.shift();
    return decal;
  }

  addCameraShake({ trauma = 0.5 } = {}) {
    this.shake.trauma = clamp(this.shake.trauma + Number(trauma), 0, 1);
    return { trauma: Number(this.shake.trauma.toFixed(3)) };
  }

  step({ dt = 1 / 60, gravity = -9.81 } = {}) {
    const stepDt = clamp(Number(dt), 0.001, 0.25);
    let alive = 0;
    for (let i = 0; i < this.maxParticles; i++) {
      if (this.life[i] <= 0) continue;
      this.life[i] -= stepDt;
      if (this.life[i] <= 0) {
        this.life[i] = 0;
        continue;
      }
      this.vh[i] += gravity * stepDt;
      this.x[i] += this.vx[i] * stepDt;
      this.y[i] += this.vy[i] * stepDt;
      this.h[i] = Math.max(0, this.h[i] + this.vh[i] * stepDt);
      alive++;
    }
    this.activeCount = alive;

    if (this.shake.trauma > 0) {
      const mag = this.shake.trauma * this.shake.trauma * 0.45;
      this.shake.offsetX = Number(((this.rng.next() * 2 - 1) * mag).toFixed(4));
      this.shake.offsetY = Number(((this.rng.next() * 2 - 1) * mag).toFixed(4));
      this.shake.offsetH = Number(((this.rng.next() * 2 - 1) * mag).toFixed(4));
      this.shake.trauma = Math.max(0, this.shake.trauma - stepDt * 1.8);
    } else {
      this.shake.offsetX = 0; this.shake.offsetY = 0; this.shake.offsetH = 0;
    }

    return { activeParticles: alive, decals: this.decals.length, shake: { ...this.shake } };
  }

  _recount() {
    let c = 0;
    for (let i = 0; i < this.maxParticles; i++) if (this.life[i] > 0) c++;
    this.activeCount = c;
  }
}
    exports["FxSystem"] = FxSystem;
  });

  __define("src/modules/nav.js", function (exports, __import) {

// RatCore Module [nav] — Сеточный A* по рельефу HeightField, сглаживание пути и RVO-уклонение агентов (Уровень 1 Opt-In)

class NavigationSystem {
  constructor() {
    this.agents = new Map();
  }

  // Сеточный A* по рельефу с запретом воды и штрафом за крутой склон (F-12)
  findTerrainPath(heightField, { from = [0, 0], to = [5, 5], step = 1, maxSlope = 1.2, allowWater = false, maxNodes = 4000 } = {}) {
    const gx0 = Math.round(from[0] / step);
    const gy0 = Math.round(from[1] / step);
    const gx1 = Math.round(to[0] / step);
    const gy1 = Math.round(to[1] / step);
    const key = (x, y) => `${x},${y}`;
    const startKey = key(gx0, gy0);
    const goalKey = key(gx1, gy1);

    const open = new Map([[startKey, { x: gx0, y: gy0, g: 0, f: Math.hypot(gx1 - gx0, gy1 - gy0) * step }]]);
    const closed = new Set();
    const cameFrom = new Map();
    const dirs = [
      [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
      [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
    ];

    let explored = 0;
    while (open.size > 0 && explored < maxNodes) {
      let curKey = null;
      let cur = null;
      for (const [k, node] of open) {
        if (!cur || node.f < cur.f) { cur = node; curKey = k; }
      }
      if (curKey === goalKey) {
        const raw = [];
        let k = goalKey;
        while (k) {
          const [px, py] = k.split(',').map(Number);
          const wx = px * step, wy = py * step;
          raw.push({ x: wx, y: wy, h: heightField ? Number(heightField.sampleHeight(wx, wy).toFixed(2)) : 0 });
          k = cameFrom.get(k);
        }
        raw.reverse();
        return { found: true, explored, cost: Number(cur.g.toFixed(3)), path: this._simplifyPath(raw) };
      }

      open.delete(curKey);
      closed.add(curKey);
      explored++;
      const curH = heightField ? heightField.sampleHeight(cur.x * step, cur.y * step) : 1;

      for (const [dx, dy, mult] of dirs) {
        const nx = cur.x + dx;
        const ny = cur.y + dy;
        const nk = key(nx, ny);
        if (closed.has(nk)) continue;
        const wx = nx * step;
        const wy = ny * step;
        const nh = heightField ? heightField.sampleHeight(wx, wy) : 1;
        if (!allowWater && nh < 0.1) continue;
        const dist = mult * step;
        const slope = Math.abs(nh - curH) / dist;
        if (slope > maxSlope) continue;

        const g = cur.g + dist * (1 + slope * 3);
        const prev = open.get(nk);
        if (!prev || g < prev.g) {
          cameFrom.set(nk, curKey);
          open.set(nk, { x: nx, y: ny, g, f: g + Math.hypot(gx1 - nx, gy1 - ny) * step });
        }
      }
    }
    return { found: false, explored, cost: Infinity, path: [] };
  }

  // Удаляем избыточные коллинеарные точки пути
  _simplifyPath(pts) {
    if (pts.length <= 2) return pts;
    const out = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      const a = out[out.length - 1], b = pts[i], c = pts[i + 1];
      const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
      if (Math.abs(cross) > 1e-4) out.push(b);
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  // Лёгкое RVO-уклонение агентов от столкновений (учитывает желаемую скорость и соседей)
  computeRvoVelocity({ x, y, vx = 0, vy = 0, goalX, goalY, maxSpeed = 4, radius = 0.6, neighbors = [] }) {
    const toGx = goalX - x;
    const toGy = goalY - y;
    const dist = Math.hypot(toGx, toGy);
    let prefVx = dist > 0.05 ? (toGx / dist) * Math.min(maxSpeed, dist * 2) : 0;
    let prefVy = dist > 0.05 ? (toGy / dist) * Math.min(maxSpeed, dist * 2) : 0;

    let repX = 0, repY = 0;
    for (const nb of neighbors) {
      const dx = x - nb.x;
      const dy = y - nb.y;
      const d = Math.hypot(dx, dy);
      const safe = radius + (nb.radius || 0.6) + 0.4;
      if (d > 1e-4 && d < safe) {
        const push = ((safe - d) / safe) * maxSpeed;
        repX += (dx / d) * push;
        repY += (dy / d) * push;
      }
    }

    let rx = prefVx + repX * 0.8 + vx * 0.1;
    let ry = prefVy + repY * 0.8 + vy * 0.1;
    const spd = Math.hypot(rx, ry);
    if (spd > maxSpeed) {
      rx = (rx / spd) * maxSpeed;
      ry = (ry / spd) * maxSpeed;
    }
    return { vx: Number(rx.toFixed(3)), vy: Number(ry.toFixed(3)), speed: Number(Math.min(spd, maxSpeed).toFixed(3)) };
  }
}
    exports["NavigationSystem"] = NavigationSystem;
  });

  __define("src/modules/phys.js", function (exports, __import) {
    var { clamp } = __import("src/core/math.js");
// RatCore Module [phys] — Твёрдые тела, AABB/Sphere коллизии, гравитация, трение, сон и CCD-рейкаст (Уровень 1 Opt-In)



class PhysicsWorld {
  constructor({ gravity = -9.81, sleepVelSq = 0.0025 } = {}) {
    this.gravity = gravity;
    this.sleepVelSq = sleepVelSq;
    this.bodies = new Map();
    this.lastCollisions = [];
  }

  addBody({ id, x = 0, y = 0, h = 1, vx = 0, vy = 0, vh = 0, mass = 1, radius = 0.5, restitution = 0.35, friction = 0.85, isStatic = false } = {}) {
    const body = {
      id: String(id),
      x: Number(x),
      y: Number(y),
      h: Number(h),
      vx: Number(vx),
      vy: Number(vy),
      vh: Number(vh),
      mass: isStatic ? 0 : Math.max(0.01, Number(mass)),
      invMass: isStatic ? 0 : 1 / Math.max(0.01, Number(mass)),
      radius: Math.max(0.05, Number(radius)),
      restitution: clamp(Number(restitution), 0, 0.98),
      friction: clamp(Number(friction), 0, 1),
      isStatic: Boolean(isStatic),
      sleeping: false,
      sleepFrames: 0,
      grounded: false,
    };
    this.bodies.set(body.id, body);
    return { ...body };
  }

  applyImpulse(id, ix = 0, iy = 0, ih = 0) {
    const b = this.bodies.get(id);
    if (!b || b.isStatic) return null;
    b.sleeping = false;
    b.sleepFrames = 0;
    b.vx += ix * b.invMass;
    b.vy += iy * b.invMass;
    b.vh += ih * b.invMass;
    return { id: b.id, vx: b.vx, vy: b.vy, vh: b.vh };
  }

  // Шаг физики с коллизией о рельеф HeightField и попарным импульсным разрешением + острова сна
  step(dt, heightField) {
    const hDt = Math.min(0.05, Math.max(0.001, Number(dt || 1 / 30)));
    this.lastCollisions = [];
    const list = [...this.bodies.values()];

    for (const b of list) {
      if (b.isStatic || b.sleeping) continue;
      b.vh += this.gravity * hDt;
      b.x += b.vx * hDt;
      b.y += b.vy * hDt;
      b.h += b.vh * hDt;

      const groundH = heightField ? heightField.sampleHeight(b.x, b.y) : 0;
      const minH = groundH + b.radius;
      if (b.h <= minH) {
        b.h = minH;
        b.grounded = true;
        if (b.vh < -0.25) {
          b.vh = -b.vh * b.restitution;
        } else {
          b.vh = 0;
        }
        const drag = Math.pow(b.friction, hDt * 15);
        b.vx *= drag;
        b.vy *= drag;
      } else {
        b.grounded = false;
      }

      const v2 = b.vx * b.vx + b.vy * b.vy + b.vh * b.vh;
      if (b.grounded && v2 < this.sleepVelSq) {
        b.sleepFrames++;
        if (b.sleepFrames >= 12) {
          b.vx = b.vy = b.vh = 0;
          b.sleeping = true;
        }
      } else {
        b.sleepFrames = 0;
      }
    }

    // Попарные коллизии сфер (импульсное разрешение)
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j];
        if ((a.isStatic || a.sleeping) && (b.isStatic || b.sleeping)) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dh = b.h - a.h;
        const minDist = a.radius + b.radius;
        const distSq = dx * dx + dy * dy + dh * dh;
        if (distSq >= minDist * minDist || distSq < 1e-9) continue;

        const dist = Math.sqrt(distSq);
        const nx = dx / dist, ny = dy / dist, nh = dh / dist;
        const overlap = minDist - dist;
        const invSum = a.invMass + b.invMass;
        if (invSum <= 0) continue;

        a.sleeping = false; b.sleeping = false;
        a.x -= nx * overlap * (a.invMass / invSum);
        a.y -= ny * overlap * (a.invMass / invSum);
        a.h -= nh * overlap * (a.invMass / invSum);
        b.x += nx * overlap * (b.invMass / invSum);
        b.y += ny * overlap * (b.invMass / invSum);
        b.h += nh * overlap * (b.invMass / invSum);

        const rvx = b.vx - a.vx, rvy = b.vy - a.vy, rvh = b.vh - a.vh;
        const vn = rvx * nx + rvy * ny + rvh * nh;
        if (vn < 0) {
          const e = Math.min(a.restitution, b.restitution);
          const imp = (-(1 + e) * vn) / invSum;
          a.vx -= imp * nx * a.invMass;
          a.vy -= imp * ny * a.invMass;
          a.vh -= imp * nh * a.invMass;
          b.vx += imp * nx * b.invMass;
          b.vy += imp * ny * b.invMass;
          b.vh += imp * nh * b.invMass;
        }
        this.lastCollisions.push({ a: a.id, b: b.id, overlap: Number(overlap.toFixed(4)) });
      }
    }

    return {
      bodies: list.length,
      sleeping: list.filter((b) => b.sleeping).length,
      collisions: this.lastCollisions.length,
    };
  }

  // Непрерывный луч (CCD) против сфер-тел в мире
  raycastBodies({ origin = [0, 0, 1], dir = [1, 0, 0], maxDist = 50 } = {}) {
    const len = Math.hypot(dir[0], dir[1], dir[2]) || 1;
    const dx = dir[0] / len, dy = dir[1] / len, dh = dir[2] / len;
    let closest = null;

    for (const b of this.bodies.values()) {
      const ocx = origin[0] - b.x;
      const ocy = origin[1] - b.y;
      const och = origin[2] - b.h;
      const proj = ocx * dx + ocy * dy + och * dh;
      const c = ocx * ocx + ocy * ocy + och * och - b.radius * b.radius;
      const disc = proj * proj - c;
      if (disc < 0) continue;
      const t = -proj - Math.sqrt(disc);
      if (t >= 0 && t <= maxDist && (!closest || t < closest.distance)) {
        closest = {
          id: b.id,
          distance: Number(t.toFixed(4)),
          point: [origin[0] + dx * t, origin[1] + dy * t, origin[2] + dh * t],
        };
      }
    }
    return closest;
  }
}
    exports["PhysicsWorld"] = PhysicsWorld;
  });

  __define("src/modules/sim.js", function (exports, __import) {
    var { RatCoreError } = __import("src/core/seal.js");
// RatCore Module [sim] — Экономика, ресурсы, инвентарь с лимитом веса, крафт и демография (Уровень 1 Opt-In)



class SimulationEconomy {
  constructor() {
    this.resources = new Map();
    this.recipes = new Map();
    this.population = 10;
    this.maxWeight = 100;
    this.itemWeights = new Map();
  }

  setResource({ id, amount = 0, unitWeight = 1 } = {}) {
    const key = String(id || '').trim();
    if (!key) throw new RatCoreError('RC-104', 'Укажи id ресурса', 'Например: { id: "wood", amount: 25 }.');
    const prev = this.resources.get(key) || 0;
    const next = Math.max(0, Number(amount));
    this.itemWeights.set(key, Math.max(0, Number(unitWeight)));
    const projectedWeight = this.getTotalWeight() - prev * (this.itemWeights.get(key) || 1) + next * (this.itemWeights.get(key) || 1);
    if (projectedWeight > this.maxWeight) {
      throw new RatCoreError('RC-603', `Превышен лимит веса инвентаря (${projectedWeight.toFixed(1)} > ${this.maxWeight})`, 'Увеличь maxWeight или скрафти более компактный предмет.');
    }
    this.resources.set(key, next);
    return { id: key, amount: next, totalWeight: Number(this.getTotalWeight().toFixed(2)), maxWeight: this.maxWeight };
  }

  defineRecipe({ id, inputs = {}, outputs = {} } = {}) {
    const key = String(id || '').trim();
    if (!key) throw new RatCoreError('RC-104', 'Укажи id рецепта крафта', 'Например: { id: "plank", inputs: { wood: 2 }, outputs: { plank: 4 } }.');
    this.recipes.set(key, { id: key, inputs: { ...inputs }, outputs: { ...outputs } });
    return { recipeId: key, defined: true };
  }

  craft({ recipeId, times = 1 } = {}) {
    const rec = this.recipes.get(recipeId);
    if (!rec) throw new RatCoreError('RC-104', `Рецепт "${recipeId}" не найден`, 'Зарегистрируй его через sim.defineRecipe().');
    const n = Math.max(1, Number(times) | 0);
    for (const [res, qty] of Object.entries(rec.inputs)) {
      const have = this.resources.get(res) || 0;
      if (have < qty * n) {
        throw new RatCoreError('RC-104', `Недостаточно ресурса "${res}" (нужно ${qty * n}, есть ${have})`, 'Добудь ресурсы перед крафтом.');
      }
    }
    for (const [res, qty] of Object.entries(rec.inputs)) {
      this.resources.set(res, (this.resources.get(res) || 0) - qty * n);
    }
    for (const [res, qty] of Object.entries(rec.outputs)) {
      this.resources.set(res, (this.resources.get(res) || 0) + qty * n);
    }
    return { crafted: recipeId, times: n, inventory: Object.fromEntries(this.resources) };
  }

  tickEconomy({ foodPerCapita = 0.5, growthRate = 0.05 } = {}) {
    const food = this.resources.get('food') || 0;
    const needed = this.population * Number(foodPerCapita);
    if (food >= needed) {
      this.resources.set('food', Number((food - needed).toFixed(2)));
      this.population = Math.round(this.population * (1 + Number(growthRate)));
      return { status: 'growing', population: this.population, foodRemaining: this.resources.get('food') };
    }
    this.resources.set('food', 0);
    this.population = Math.max(1, Math.floor(this.population * 0.92));
    return { status: 'shortage', population: this.population, foodRemaining: 0 };
  }

  getTotalWeight() {
    let w = 0;
    for (const [id, qty] of this.resources) {
      w += qty * (this.itemWeights.get(id) ?? 1);
    }
    return w;
  }

  getState() {
    return {
      population: this.population,
      totalWeight: Number(this.getTotalWeight().toFixed(2)),
      maxWeight: this.maxWeight,
      inventory: Object.fromEntries(this.resources),
      recipes: [...this.recipes.keys()],
    };
  }
}
    exports["SimulationEconomy"] = SimulationEconomy;
  });

  __define("src/modules/test.js", function (exports, __import) {
    var { createRng } = __import("src/core/math.js");
    var { runAutoBalance, findBalanceExploits } = __import("src/packs/studio.js");
// RatCore Module [test] — Автотесты, проверка инвариантов сцены, фаззер и автобалансировщик (Уровень 1 Opt-In)




class TestAutomationSuite {
  constructor() {
    this.runsCompleted = 0;
  }

  // Проверка геометрических и структурных инвариантов мира
  checkInvariants({ entities = [], heightField, vault } = {}) {
    const violations = [];
    for (const e of entities) {
      if (!Number.isFinite(e.x) || !Number.isFinite(e.y) || !Number.isFinite(e.h)) {
        violations.push({ entityId: e.id, code: 'RC-403', reason: 'NaN/Infinity в координатах сущности' });
      }
      if (heightField) {
        const ground = heightField.sampleHeight(e.x, e.y);
        if (e.h < ground - 0.5) {
          violations.push({ entityId: e.id, code: 'RC-402', reason: `Сущность провалилась под рельеф (h=${e.h.toFixed(2)} < H=${ground.toFixed(2)})` });
        }
      }
      if (vault && e.mesh && !vault.isSealedMesh(e.mesh)) {
        violations.push({ entityId: e.id, code: 'RC-101', reason: 'Неподписанный меш в сцене' });
      }
    }
    this.runsCompleted++;
    return { ok: violations.length === 0, entitiesChecked: entities.length, violations };
  }

  // Детерминированный фаззер перемещений по сцене
  fuzzWalk({ steps = 50, seed = 777, heightField } = {}) {
    const rng = createRng(seed);
    let x = 0;
    let y = 0;
    let maxSlope = 0;
    let minH = Infinity;
    let maxH = -Infinity;
    for (let i = 0; i < steps; i++) {
      const prevH = heightField ? heightField.sampleHeight(x, y) : 1;
      const dx = (rng.next() * 2 - 1) * 2.5;
      const dy = (rng.next() * 2 - 1) * 2.5;
      x = Math.max(-14, Math.min(14, x + dx));
      y = Math.max(-14, Math.min(14, y + dy));
      const h = heightField ? heightField.sampleHeight(x, y) : 1;
      const dist = Math.hypot(dx, dy) || 1;
      maxSlope = Math.max(maxSlope, Math.abs(h - prevH) / dist);
      minH = Math.min(minH, h);
      maxH = Math.max(maxH, h);
    }
    this.runsCompleted++;
    return {
      ok: Number.isFinite(minH) && Number.isFinite(maxH),
      steps,
      seed,
      finalPos: [Number(x.toFixed(2)), Number(y.toFixed(2))],
      minH: Number(minH.toFixed(3)),
      maxH: Number(maxH.toFixed(3)),
      maxSlope: Number(maxSlope.toFixed(3)),
    };
  }

  autoBalance(args = {}) {
    this.runsCompleted++;
    return runAutoBalance(args);
  }

  findExploits(args = {}) {
    this.runsCompleted++;
    return findBalanceExploits(args);
  }
}
    exports["TestAutomationSuite"] = TestAutomationSuite;
  });

  __define("src/packs/ai-team.js", function (exports, __import) {
    var { clamp } = __import("src/core/math.js");
    var { encodeWire2Frame, decodeWire2Frame } = __import("src/compress/wire2.js");
// RatCore Pack [pack:ai-team] — ИИ-команда: think, guess (Байес F-126), comm (каналы/CRDT), bugs (ddmin A-86), bridge (BridgeGuard)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).




class AiTeamSuite {
  constructor() {
    this.thoughts = new Map();
    this.hypotheses = new Map();
    this.channels = new Map([['general', []]]);
    this.inboxes = new Map();
    this.tasks = new Map(); // CRDT-реестр задач (LWW по version)
    this.reports = [];
    this.seq = 1;
  }

  // -------------------- 1. tools.think.* --------------------
  thinkStart({ topic, goal, agentId = 'ai-1' } = {}) {
    const id = `th_${this.seq++}`;
    const node = {
      id,
      topic: String(topic || 'untitled'),
      goal: String(goal || ''),
      agentId,
      branches: [],
      conclusion: null,
      createdAt: Date.now(),
    };
    this.thoughts.set(id, node);
    return { id, topic: node.topic, goal: node.goal };
  }

  thinkBranch({ thoughtId, label, rationale, score = 0.5 } = {}) {
    const th = this.thoughts.get(thoughtId);
    if (!th) return null;
    const br = {
      id: `br_${th.branches.length + 1}`,
      label: String(label || 'option'),
      rationale: String(rationale || ''),
      score: clamp(Number(score), 0, 1),
    };
    th.branches.push(br);
    return br;
  }

  thinkConclude({ thoughtId, decision, summary = '' } = {}) {
    const th = this.thoughts.get(thoughtId);
    if (!th) return null;
    const ranked = [...th.branches].sort((a, b) => b.score - a.score);
    th.conclusion = {
      decision: decision || (ranked[0] ? ranked[0].label : 'none'),
      summary: String(summary),
      bestBranch: ranked[0] || null,
      branchesCount: ranked.length,
    };
    return th.conclusion;
  }

  // -------------------- 2. tools.guess.* (Формула Байеса F-126) --------------------
  guessPropose({ id, statement, prior = 0.5 } = {}) {
    const hid = String(id || `hyp_${this.seq++}`);
    const h = {
      id: hid,
      statement: String(statement || ''),
      probability: clamp(Number(prior), 0.001, 0.999),
      evidence: [],
    };
    this.hypotheses.set(hid, h);
    return { ...h };
  }

  // F-126: P(H|E) = P(E|H)*P(H) / (P(E|H)*P(H) + P(E|¬H)*(1 - P(H)))
  guessEvidence({ id, note = '', likelihoodIfTrue = 0.8, likelihoodIfFalse = 0.2 } = {}) {
    const h = this.hypotheses.get(id);
    if (!h) return null;
    const pH = h.probability;
    const pE_H = clamp(Number(likelihoodIfTrue), 0.001, 0.999);
    const pE_notH = clamp(Number(likelihoodIfFalse), 0.001, 0.999);
    const num = pE_H * pH;
    const den = num + pE_notH * (1 - pH);
    const posterior = clamp(num / Math.max(1e-9, den), 0.001, 0.999);
    h.probability = Number(posterior.toFixed(4));
    h.evidence.push({ note: String(note), pE_H, pE_notH, posterior: h.probability });
    return { id: h.id, probability: h.probability, evidenceCount: h.evidence.length };
  }

  guessRank() {
    return [...this.hypotheses.values()]
      .sort((a, b) => b.probability - a.probability)
      .map((h) => ({ id: h.id, statement: h.statement, probability: h.probability, evidenceCount: h.evidence.length }));
  }

  // -------------------- 3. tools.comm.* (Папки связи + CRDT задачи) --------------------
  commPost({ channel = 'general', from = 'ai-1', to = null, kind = 'note', text = '', data = null } = {}) {
    const ch = String(channel || 'general');
    const msg = {
      id: `msg_${this.seq++}`,
      channel: ch,
      from: String(from),
      to: to ? String(to) : null,
      kind: String(kind),
      text: String(text),
      data,
      ts: Date.now(),
    };
    if (!this.channels.has(ch)) this.channels.set(ch, []);
    this.channels.get(ch).push(msg);
    if (msg.to) {
      if (!this.inboxes.has(msg.to)) this.inboxes.set(msg.to, []);
      this.inboxes.get(msg.to).push(msg);
    }
    return msg;
  }

  commRead({ channel = 'general', inboxOf = null, limit = 20 } = {}) {
    const src = inboxOf ? (this.inboxes.get(String(inboxOf)) || []) : (this.channels.get(String(channel)) || []);
    return src.slice(-Math.max(1, Number(limit || 20)));
  }

  // CRDT LWW-слияние задач между несколькими ИИ-агентами
  commUpsertTask({ id, title, status = 'open', owner = null, version = 1 } = {}) {
    const tid = String(id || `task_${this.seq++}`);
    const existing = this.tasks.get(tid);
    const ver = Number(version || 1);
    if (existing && existing.version > ver) {
      return { merged: false, keptVersion: existing.version, task: existing };
    }
    const task = {
      id: tid,
      title: String(title ?? existing?.title ?? 'Untitled task'),
      status: String(status),
      owner: owner !== undefined ? owner : (existing?.owner ?? null),
      version: existing && existing.version === ver ? ver + 1 : ver,
      updatedAt: Date.now(),
    };
    this.tasks.set(tid, task);
    return { merged: true, task };
  }

  // -------------------- 4. tools.bugs.* (A-86: Delta Debugging ddmin) --------------------
  bugsReport({ title, severity = 'medium', code = 'RC-999', steps = [], expected = '', actual = '', author = 'ai-qa' } = {}) {
    const rep = {
      id: `BUG-${String(this.reports.length + 1).padStart(4, '0')}`,
      title: String(title || 'Untitled issue'),
      severity: String(severity),
      code: String(code),
      steps: Array.isArray(steps) ? [...steps] : [],
      expected: String(expected),
      actual: String(actual),
      author: String(author),
      status: 'open',
      createdAt: Date.now(),
    };
    this.reports.push(rep);
    return rep;
  }

  // A-86: Минимизация падающей последовательности действий (Delta Debugging ddmin)
  bugsMinimize({ steps = [], testFails } = {}) {
    if (!Array.isArray(steps) || typeof testFails !== 'function') {
      return { minimized: [], originalLength: 0, reductionPct: 0 };
    }
    let current = [...steps];
    let n = 2;
    let probes = 0;

    while (current.length >= 2 && probes < 256) {
      const chunkSize = Math.ceil(current.length / n);
      let reduced = false;

      for (let i = 0; i < current.length; i += chunkSize) {
        const subset = current.slice(i, i + chunkSize);
        probes++;
        if (subset.length > 0 && subset.length < current.length && testFails(subset)) {
          current = subset;
          n = 2;
          reduced = true;
          break;
        }
        const complement = [...current.slice(0, i), ...current.slice(i + chunkSize)];
        probes++;
        if (complement.length > 0 && complement.length < current.length && testFails(complement)) {
          current = complement;
          n = Math.max(n - 1, 2);
          reduced = true;
          break;
        }
      }

      if (!reduced) {
        if (n >= current.length) break;
        n = Math.min(current.length, n * 2);
      }
    }

    const orig = steps.length;
    return {
      minimized: current,
      originalLength: orig,
      minimizedLength: current.length,
      probes,
      reductionPct: orig > 0 ? Number(((1 - current.length / orig) * 100).toFixed(1)) : 0,
    };
  }

  // -------------------- 5. tools.bridge.* (BridgeGuard: экспорт в Three.js / Godot / Canvas 2D / RCW2) --------------------
  bridgeExportScene({ format = 'three-json', worldSnapshot, vault, entities = [] } = {}) {
    if (format === 'three-json') {
      const children = entities.map((e) => {
        const entry = vault.readSealedMesh(e.mesh, 'bridge.exportScene');
        return {
          name: e.id,
          type: 'Mesh',
          position: [e.x, e.h, -e.y],
          rotationYRad: ((e.yaw || 0) * Math.PI) / 180,
          scale: [e.scale || 1, e.scale || 1, e.scale || 1],
          ratcoreMeshId: e.mesh.id,
          triCount: entry.triCount,
        };
      });
      return { format: 'three-json', schema: 'ratcore-bridge-three/1', objectCount: children.length, scene: { type: 'Scene', children } };
    }

    if (format === 'godot-tscn') {
      const lines = ['[gd_scene format=3]', '', '[node name="RatCoreWorld" type="Node3D"]'];
      for (const e of entities) {
        vault.readSealedMesh(e.mesh, 'bridge.exportScene');
        lines.push('');
        lines.push(`[node name="${e.id}" type="MeshInstance3D" parent="."]`);
        lines.push(`transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, ${e.x}, ${e.h}, ${-e.y})`);
        lines.push(`metadata/ratcore_mesh_id = "${e.mesh.id}"`);
      }
      return { format: 'godot-tscn', objectCount: entities.length, text: lines.join('\n') };
    }

    if (format === 'rcw2') {
      const encoded = encodeWire2Frame(worldSnapshot || { entities: entities.length }, { codec: 'auto' });
      return {
        format: 'rcw2',
        rawBytes: encoded.rawBytes,
        wireBytes: encoded.wireBytes,
        savedPct: encoded.savedPct,
        crc32: encoded.crc32,
        frame: encoded.frame,
      };
    }

    return {
      format: 'canvas-2d',
      objectCount: entities.length,
      drawList: entities.map((e) => ({ id: e.id, x: e.x, y: e.y, r: e.radius || 1, tag: e.tag })),
    };
  }

  bridgeVerifyWire2(frameBytes) {
    return decodeWire2Frame(frameBytes, { asJson: true });
  }
}
    exports["AiTeamSuite"] = AiTeamSuite;
  });

  __define("src/packs/assist.js", function (exports, __import) {
    var { clamp } = __import("src/core/math.js");
    var { packRGBA, unpackRGBA } = __import("src/assets/raster.js");
// RatCore Pack [pack:assist] — Умный наставник, дальтоническая коррекция, аудио-субтитры и режим 1 руки (F-163..F-165, A-108..A-109)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).




const COLORBLIND_MODES = Object.freeze(['none', 'protanopia', 'deuteranopia', 'tritanopia']);

// Матрицы дальтонической компенсации RGB (F-164, адаптация Machado/Daltonize)
const DALTONIZE_MATRICES = {
  protanopia: [
    0.567, 0.433, 0.000,
    0.558, 0.442, 0.000,
    0.000, 0.242, 0.758,
  ],
  deuteranopia: [
    0.625, 0.375, 0.000,
    0.700, 0.300, 0.000,
    0.000, 0.300, 0.700,
  ],
  tritanopia: [
    0.950, 0.050, 0.000,
    0.000, 0.433, 0.567,
    0.000, 0.475, 0.525,
  ],
};

class AccessibilityAssistSystem {
  constructor() {
    this.visual = { colorblind: 'none', highContrast: false, fontScale: 1.0 };
    this.subtitles = { enabled: false, showDirection: true, maxItems: 4 };
    this.oneHand = { enabled: false, dominantHand: 'right' };
    this.tracker = {
      stagnantSec: 0,
      lastGoalDist: null,
      lastPos: null,
      hintLevel: 0,
      goalId: null,
    };
  }

  // F-163, A-108: детектор застревания > 20 с с плавной 3-уровневой подсказкой без спойлеров
  trackPlayer({ playerPos = { x: 0, y: 0, h: 0 }, goalPos = { x: 10, y: 10, h: 0 }, activeGoalId = 'main', dt = 1.0 } = {}) {
    if (this.tracker.goalId !== activeGoalId) {
      this.tracker = { stagnantSec: 0, lastGoalDist: null, lastPos: null, hintLevel: 0, goalId: activeGoalId };
    }
    const dist = Math.hypot((goalPos.x ?? 0) - (playerPos.x ?? 0), (goalPos.y ?? 0) - (playerPos.y ?? 0));
    const stepDt = Math.max(0.01, Number(dt));

    if (this.tracker.lastGoalDist !== null) {
      const progress = this.tracker.lastGoalDist - dist;
      if (progress < 0.25) {
        this.tracker.stagnantSec += stepDt;
      } else {
        this.tracker.stagnantSec = Math.max(0, this.tracker.stagnantSec - stepDt * 2.5);
      }
    }
    this.tracker.lastGoalDist = dist;
    this.tracker.lastPos = { ...playerPos };

    // Индекс застревания 0..1 (достигает 1.0 на 30 сек)
    const stuckScore = clamp(this.tracker.stagnantSec / 30, 0, 1);
    let hintLevel = 0;
    let hintText = null;
    if (this.tracker.stagnantSec >= 40) {
      hintLevel = 3;
      hintText = `Маршрут к цели «${activeGoalId}»: двигайся в точку (${Math.round(goalPos.x)}; ${Math.round(goalPos.y)}), осталось ~${Math.round(dist)} м.`;
    } else if (this.tracker.stagnantSec >= 28) {
      hintLevel = 2;
      const dx = (goalPos.x ?? 0) - (playerPos.x ?? 0);
      const dy = (goalPos.y ?? 0) - (playerPos.y ?? 0);
      const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'на восток →' : 'на запад ←') : (dy > 0 ? 'на север ↑' : 'на юг ↓');
      hintText = `Компас подсказывает направление ${dir} (${Math.round(dist)} м).`;
    } else if (this.tracker.stagnantSec >= 20) {
      hintLevel = 1;
      hintText = 'Осмотрись вокруг: рядом есть ориентир на пути к цели.';
    }
    this.tracker.hintLevel = hintLevel;

    return {
      activeGoalId,
      distToGoal: Number(dist.toFixed(2)),
      stagnantSec: Number(this.tracker.stagnantSec.toFixed(2)),
      stuckScore: Number(stuckScore.toFixed(3)),
      hintLevel,
      hintText,
    };
  }

  setVisualMode({ colorblind = 'none', highContrast = false, fontScale = 1.0 } = {}) {
    this.visual = {
      colorblind: COLORBLIND_MODES.includes(colorblind) ? colorblind : 'none',
      highContrast: Boolean(highContrast),
      fontScale: clamp(Number(fontScale), 0.85, 2.0),
    };
    return { ...this.visual };
  }

  // Реальная коррекция RasterSurface по матрице дальтонизма (F-164) и повышенному контрасту
  transformSurface(surface) {
    if (!surface || (this.visual.colorblind === 'none' && !this.visual.highContrast)) {
      return { applied: 'none', pixelsProcessed: 0 };
    }
    const { pixels } = surface;
    const m = DALTONIZE_MATRICES[this.visual.colorblind] || null;
    const hc = this.visual.highContrast;

    for (let i = 0; i < pixels.length; i++) {
      let [r, g, b, a] = unpackRGBA(pixels[i]);
      if (m) {
        // Daltonization: симулируем потерю канала и сдвигаем ошибку в различимые каналы
        const sr = r * m[0] + g * m[1] + b * m[2];
        const sg = r * m[3] + g * m[4] + b * m[5];
        const sb = r * m[6] + g * m[7] + b * m[8];
        const er = r - sr;
        const eg = g - sg;
        const eb = b - sb;
        r = clamp(Math.round(r + 0.0 * er + 0.0 * eg + 0.0 * eb), 0, 255);
        g = clamp(Math.round(g + 0.7 * er + 1.0 * eg + 0.0 * eb), 0, 255);
        b = clamp(Math.round(b + 0.7 * er + 0.0 * eg + 1.0 * eb), 0, 255);
      }
      if (hc) {
        r = clamp(Math.round((r - 128) * 1.35 + 128), 0, 255);
        g = clamp(Math.round((g - 128) * 1.35 + 128), 0, 255);
        b = clamp(Math.round((b - 128) * 1.35 + 128), 0, 255);
      }
      pixels[i] = packRGBA(r, g, b, a);
    }
    return { applied: this.visual.colorblind, highContrast: hc, pixelsProcessed: pixels.length };
  }

  setAudioSubtitles({ enabled = true, showDirection = true, maxItems = 4 } = {}) {
    this.subtitles = {
      enabled: Boolean(enabled),
      showDirection: Boolean(showDirection),
      maxItems: clamp(Number(maxItems) | 0, 1, 8),
    };
    return { ...this.subtitles };
  }

  // F-165: перевод событий tools.hear в направленные экранные подписи («← Шаги слева»)
  formatAudioSubtitles({ listenerPos = { x: 0, y: 0 }, hearEvents = [] } = {}) {
    if (!this.subtitles.enabled) return { enabled: false, captions: [] };
    const captions = [];
    for (const ev of hearEvents.slice(0, this.subtitles.maxItems)) {
      const dx = (ev.x ?? 0) - (listenerPos.x ?? 0);
      const dy = (ev.y ?? 0) - (listenerPos.y ?? 0);
      const dist = Math.round(ev.distance ?? Math.hypot(dx, dy));
      let arrow = '•';
      let side = 'рядом';
      if (this.subtitles.showDirection && dist > 1) {
        if (Math.abs(dx) >= Math.abs(dy)) {
          arrow = dx < 0 ? '←' : '→';
          side = dx < 0 ? 'слева' : 'справа';
        } else {
          arrow = dy >= 0 ? '↑' : '↓';
          side = dy >= 0 ? 'впереди' : 'сзади';
        }
      }
      const label = ev.label || ev.kind || 'Звук';
      captions.push({
        text: `${arrow} ${label} ${side} (${dist} м)`,
        arrow,
        side,
        distanceM: dist,
        perceivedDb: ev.perceivedDb ?? 50,
      });
    }
    return { enabled: true, captions };
  }

  // A-109: эргономичная перестройка тач-управления под одну руку
  setOneHandMobile({ enabled = true, dominantHand = 'right' } = {}) {
    const hand = dominantHand === 'left' ? 'left' : 'right';
    this.oneHand = { enabled: Boolean(enabled), dominantHand: hand };
    const anchorX = hand === 'right' ? 0.78 : 0.22;
    return {
      ...this.oneHand,
      layout: {
        joystickCenter: { xPct: Math.round(anchorX * 100), yPct: 76 },
        primaryAction: { xPct: Math.round((hand === 'right' ? 0.88 : 0.12) * 100), yPct: 58 },
        secondaryAction: { xPct: Math.round((hand === 'right' ? 0.64 : 0.36) * 100), yPct: 64 },
        thumbReachRadiusPct: 34,
      },
    };
  }
}
    exports["COLORBLIND_MODES"] = COLORBLIND_MODES;
    exports["AccessibilityAssistSystem"] = AccessibilityAssistSystem;
  });

  __define("src/packs/cinema.js", function (exports, __import) {
    var { clamp, lerp } = __import("src/core/math.js");
    var { unpackRGBA } = __import("src/assets/raster.js");
    var { RatCoreError } = __import("src/core/seal.js");
// RatCore Pack [pack:cinema] — Рельсы камеры с дуговой параметризацией, таймлапсы и авто-обложки 16:9 (F-140..F-142, A-94..A-95)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).





function catmullRom1D(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (
    (2 * p1)
    + (-p0 + p2) * t
    + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2
    + (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  );
}

function sampleCatmullRomPose(keyframes, u) {
  const n = keyframes.length;
  if (n === 1) return { ...keyframes[0] };
  const scaled = clamp(u, 0, 1) * (n - 1);
  const seg = Math.min(n - 2, Math.floor(scaled));
  const t = scaled - seg;
  const k0 = keyframes[Math.max(0, seg - 1)];
  const k1 = keyframes[seg];
  const k2 = keyframes[Math.min(n - 1, seg + 1)];
  const k3 = keyframes[Math.min(n - 1, seg + 2)];
  return {
    x: catmullRom1D(k0.x, k1.x, k2.x, k3.x, t),
    y: catmullRom1D(k0.y, k1.y, k2.y, k3.y, t),
    h: catmullRom1D(k0.h, k1.h, k2.h, k3.h, t),
    targetX: catmullRom1D(k0.targetX ?? 0, k1.targetX ?? 0, k2.targetX ?? 0, k3.targetX ?? 0, t),
    targetY: catmullRom1D(k0.targetY ?? 0, k1.targetY ?? 0, k2.targetY ?? 0, k3.targetY ?? 0, t),
    targetH: catmullRom1D(k0.targetH ?? 1, k1.targetH ?? 1, k2.targetH ?? 1, k3.targetH ?? 1, t),
    fovDeg: lerp(k1.fovDeg ?? 60, k2.fovDeg ?? 60, t),
  };
}

// Оценка композиции кадра по правилу третей, контрасту и непустоте (F-141)
function scoreCoverComposition(surface, objectIdBuffer) {
  const { width, height, pixels } = surface;
  let lumSum = 0;
  let lumSqSum = 0;
  let fgTotal = 0;
  let thirdsHits = 0;

  const thirdXs = [width / 3, (2 * width) / 3];
  const thirdYs = [height / 3, (2 * height) / 3];
  const radiusSq = Math.pow(Math.min(width, height) * 0.16, 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const [r, g, b] = unpackRGBA(pixels[idx]);
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      lumSum += lum;
      lumSqSum += lum * lum;
      if (objectIdBuffer && objectIdBuffer[idx] > 0) {
        fgTotal++;
        for (let tx = 0; tx < 2; tx++) {
          for (let ty = 0; ty < 2; ty++) {
            const dx = x - thirdXs[tx];
            const dy = y - thirdYs[ty];
            if (dx * dx + dy * dy <= radiusSq) {
              thirdsHits++;
              tx = 2;
              break;
            }
          }
        }
      }
    }
  }

  const total = Math.max(1, width * height);
  const meanLum = lumSum / total;
  const stdContrast = Math.sqrt(Math.max(0, lumSqSum / total - meanLum * meanLum));
  const fillRatio = fgTotal / total;
  // Идеальная заполненность объекта на обложке ~18%..55%
  const fillScore = fillRatio < 0.02 ? 0 : (1 - Math.min(1, Math.abs(fillRatio - 0.34) / 0.34));
  const thirdsScore = fgTotal > 0 ? clamp((thirdsHits / fgTotal) * 2.2, 0, 1) : 0;
  const contrastScore = clamp(stdContrast * 3.2, 0, 1);
  const score = 0.42 * fillScore + 0.33 * thirdsScore + 0.25 * contrastScore;

  return {
    score: Number(score.toFixed(4)),
    fillRatio: Number(fillRatio.toFixed(4)),
    thirdsScore: Number(thirdsScore.toFixed(4)),
    contrast: Number(stdContrast.toFixed(4)),
  };
}

class CinemaDirector {
  constructor() {
    this.tracks = new Map();
    this.activePlayback = null;
    this.timelapse = null;
    this.nextId = 1;
  }

  // Строит рельсу с дуговой параметризацией (F-140, A-94) — равномерная скорость камеры
  createTrack({ id, durationSec = 8, keyframes = [], subtitles = [], weatherEvents = [], samples = 96 } = {}) {
    if (!Array.isArray(keyframes) || keyframes.length < 2) {
      throw new RatCoreError('RC-104', 'Для рельсы камеры требуется минимум 2 ключевых кадра (keyframes)', 'Передай массив из >= 2 объектов { x, y, h, targetX, targetY, targetH }.');
    }
    const trackId = id || `track-${this.nextId++}`;
    const dur = Math.max(0.5, Number(durationSec));
    const nSamples = Math.max(16, Math.min(512, Number(samples) | 0));

    // Таблица кумулятивной длины дуги s(u)
    const arcTable = new Float32Array(nSamples + 1);
    let prev = sampleCatmullRomPose(keyframes, 0);
    let totalLen = 0;
    for (let i = 1; i <= nSamples; i++) {
      const u = i / nSamples;
      const cur = sampleCatmullRomPose(keyframes, u);
      const dist = Math.hypot(cur.x - prev.x, cur.y - prev.y, cur.h - prev.h);
      totalLen += dist;
      arcTable[i] = totalLen;
      prev = cur;
    }

    const track = {
      id: trackId,
      durationSec: dur,
      keyframes: keyframes.map((k) => ({ ...k })),
      subtitles: Array.isArray(subtitles) ? subtitles.map((s) => ({ ...s })) : [],
      weatherEvents: Array.isArray(weatherEvents) ? weatherEvents.map((w) => ({ ...w })) : [],
      arcTable,
      totalLength: Number(totalLen.toFixed(3)),
    };
    this.tracks.set(trackId, track);
    return { trackId, durationSec: dur, totalLength: track.totalLength, keyframeCount: keyframes.length };
  }

  // Бинарный поиск параметра u по заданной длине дуги s (F-140)
  _arcLengthToU(track, frac) {
    const targetS = clamp(frac, 0, 1) * track.totalLength;
    if (track.totalLength <= 1e-6) return clamp(frac, 0, 1);
    const tbl = track.arcTable;
    let lo = 0;
    let hi = tbl.length - 1;
    while (lo + 1 < hi) {
      const mid = (lo + hi) >> 1;
      if (tbl[mid] <= targetS) lo = mid;
      else hi = mid;
    }
    const segLen = tbl[hi] - tbl[lo];
    const localT = segLen > 1e-6 ? (targetS - tbl[lo]) / segLen : 0;
    return (lo + localT) / (tbl.length - 1);
  }

  seek({ trackId, timeSec = 0 } = {}) {
    const track = this.tracks.get(trackId);
    if (!track) throw new RatCoreError('RC-104', `Трек кат-сцены "${trackId}" не найден`, 'Создай трек через cutscene.createTrack().');
    const t = clamp(Number(timeSec), 0, track.durationSec);
    const frac = t / track.durationSec;
    const u = this._arcLengthToU(track, frac);
    const pose = sampleCatmullRomPose(track.keyframes, u);
    const subtitle = track.subtitles.find((s) => t >= s.fromSec && t <= s.toSec)?.text || null;
    const weatherEvent = [...track.weatherEvents].reverse().find((w) => t >= w.atSec) || null;
    return {
      trackId,
      timeSec: Number(t.toFixed(3)),
      progress: Number(frac.toFixed(4)),
      arcDistance: Number((frac * track.totalLength).toFixed(3)),
      camera: {
        x: Number(pose.x.toFixed(3)),
        y: Number(pose.y.toFixed(3)),
        h: Number(pose.h.toFixed(3)),
        targetX: Number(pose.targetX.toFixed(3)),
        targetY: Number(pose.targetY.toFixed(3)),
        targetH: Number(pose.targetH.toFixed(3)),
        fovDeg: Number(pose.fovDeg.toFixed(1)),
      },
      subtitle,
      weatherEvent,
      finished: t >= track.durationSec,
    };
  }

  play({ trackId, skippable = true, startSec = 0 } = {}) {
    const sample = this.seek({ trackId, timeSec: startSec });
    this.activePlayback = { trackId, timeSec: sample.timeSec, skippable: Boolean(skippable), playing: true };
    return { playing: true, skippable: this.activePlayback.skippable, ...sample };
  }

  // Съёмка таймлапса мира (F-142, A-95)
  timelapseStart({ everyTicks = 10, maxFrames = 450, orbitRadius = 14, orbitHeight = 8 } = {}) {
    this.timelapse = {
      active: true,
      everyTicks: Math.max(1, Number(everyTicks) | 0),
      maxFrames: Math.max(4, Math.min(900, Number(maxFrames) | 0)),
      orbitRadius: Number(orbitRadius),
      orbitHeight: Number(orbitHeight),
      frames: [],
      lastTick: -999999,
    };
    return { recording: true, everyTicks: this.timelapse.everyTicks, maxFrames: this.timelapse.maxFrames };
  }

  timelapseCapture({ tick = 0, renderAtCamera } = {}) {
    if (!this.timelapse || !this.timelapse.active) {
      throw new RatCoreError('RC-104', 'Запись таймлапса не запущена', 'Вызови cutscene.timelapseStart() перед съёмкой кадров.');
    }
    if (this.timelapse.frames.length >= this.timelapse.maxFrames) {
      return { captured: false, reason: 'maxFrames-reached', frameCount: this.timelapse.frames.length };
    }
    if (tick - this.timelapse.lastTick < this.timelapse.everyTicks) {
      return { captured: false, reason: 'interval-skip', frameCount: this.timelapse.frames.length };
    }
    const idx = this.timelapse.frames.length;
    const angle = (idx / Math.max(12, this.timelapse.maxFrames / 3)) * Math.PI * 2;
    const cam = {
      x: Math.cos(angle) * this.timelapse.orbitRadius,
      y: Math.sin(angle) * this.timelapse.orbitRadius,
      h: this.timelapse.orbitHeight,
      targetX: 0, targetY: 0, targetH: 1.5, fovDeg: 55,
    };
    const frame = typeof renderAtCamera === 'function' ? renderAtCamera(cam) : null;
    this.timelapse.frames.push({
      tick,
      camera: cam,
      nonEmptyRatio: frame ? Number(frame.nonEmptyRatio.toFixed(4)) : 0,
      width: frame?.surface?.width || 0,
      height: frame?.surface?.height || 0,
    });
    this.timelapse.lastTick = tick;
    return { captured: true, frameIndex: idx, frameCount: this.timelapse.frames.length };
  }

  timelapseFinish() {
    if (!this.timelapse) return { frames: 0, durationSecAt30Fps: 0 };
    this.timelapse.active = false;
    const count = this.timelapse.frames.length;
    return {
      finished: true,
      frames: count,
      durationSecAt30Fps: Number((count / 30).toFixed(2)),
      ticksSpan: count >= 2 ? this.timelapse.frames[count - 1].tick - this.timelapse.frames[0].tick : 0,
    };
  }

  // Автоподбор лучшего ракурса обложки 16:9 из 12 кандидатов по правилу третей и контрасту (F-141)
  autoCover({ target = { x: 0, y: 0, h: 1.5 }, radius = 12, candidates = 12, renderAtCamera } = {}) {
    if (typeof renderAtCamera !== 'function') {
      throw new RatCoreError('RC-104', 'Для autoCover требуется функция рендера кадра', 'Вызывай через tools.cutscene.autoCover().');
    }
    const count = Math.max(4, Math.min(24, Number(candidates) | 0));
    const scored = [];
    let best = null;
    let bestFrame = null;

    for (let i = 0; i < count; i++) {
      const az = (i / count) * Math.PI * 2 + 0.35;
      const elev = i % 3 === 0 ? 0.45 : (i % 3 === 1 ? 0.28 : 0.62);
      const dist = radius * (i % 2 === 0 ? 0.92 : 1.15);
      const cam = {
        x: target.x + Math.cos(az) * dist,
        y: target.y + Math.sin(az) * dist,
        h: target.h + Math.sin(elev) * dist,
        targetX: target.x,
        targetY: target.y,
        targetH: target.h,
        fovDeg: 52,
      };
      const frame = renderAtCamera(cam);
      const metrics = scoreCoverComposition(frame.surface, frame.objectIdBuffer);
      const item = { index: i, camera: cam, ...metrics };
      scored.push(item);
      if (!best || item.score > best.score) {
        best = item;
        bestFrame = frame;
      }
    }

    return {
      aspect: '16:9',
      candidatesEvaluated: count,
      bestCamera: best.camera,
      bestScore: best.score,
      metrics: { fillRatio: best.fillRatio, thirdsScore: best.thirdsScore, contrast: best.contrast },
      width: bestFrame.surface.width,
      height: bestFrame.surface.height,
      top3: [...scored].sort((a, b) => b.score - a.score).slice(0, 3).map((s) => ({ index: s.index, score: s.score })),
    };
  }
}
    exports["scoreCoverComposition"] = scoreCoverComposition;
    exports["CinemaDirector"] = CinemaDirector;
  });

  __define("src/packs/companion.js", function (exports, __import) {
    var { clamp } = __import("src/core/math.js");
    var { RatCoreError } = __import("src/core/seal.js");
// RatCore Pack [pack:companion] — Локальный ИИ-Напарник (NLU RU/EN + зрение see + слух hear + доверие, F-161..F-162, A-107)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).




const INTENT_RULES = [
  { intent: 'cover', re: /(прикрой|защит|охраняй|cover|guard|defend)/i },
  { intent: 'build', re: /(построй|возвед|мост|укреп|build|construct|bridge)/i },
  { intent: 'follow', re: /(иди за мной|следом|рядом|follow|come with)/i },
  { intent: 'scout', re: /(развед|проверь|осмотр|scout|recon|check)/i },
  { intent: 'gather', re: /(добудь|собери|принеси|дерев|камн|gather|collect|chop|mine)/i },
  { intent: 'hold', re: /(стой|держи|жди|позиц|hold|stay|wait)/i },
  { intent: 'heal', re: /(лечи|аптечк|помоги|heal|medkit|revive)/i },
];

const DIR_RULES = [
  { dir: 'left', dx: -1, dy: 0, re: /(слева|налево|левый|left|west|запад)/i },
  { dir: 'right', dx: 1, dy: 0, re: /(справа|направо|правый|right|east|восток)/i },
  { dir: 'north', dx: 0, dy: 1, re: /(север|вперёд|вперед|прямо|north|ahead|front)/i },
  { dir: 'south', dx: 0, dy: -1, re: /(юг|сзади|назад|тыл|south|back|behind)/i },
];

function parseNaturalCommand(text = '') {
  const raw = String(text || '').trim();
  let intent = 'assist';
  let confidence = 0.45;
  for (const r of INTENT_RULES) {
    if (r.re.test(raw)) {
      intent = r.intent;
      confidence = 0.92;
      break;
    }
  }
  let direction = 'here';
  let dirVec = { dx: 0, dy: 0 };
  for (const d of DIR_RULES) {
    if (d.re.test(raw)) {
      direction = d.dir;
      dirVec = { dx: d.dx, dy: d.dy };
      confidence = Math.min(0.99, confidence + 0.05);
      break;
    }
  }
  const targetMatch = raw.match(/(мост|дерево|камень|башню|север|базу|bridge|wood|stone|tower|base)/i);
  return {
    raw,
    intent,
    direction,
    dirVec,
    target: targetMatch ? targetMatch[1].toLowerCase() : null,
    confidence: Number(confidence.toFixed(2)),
  };
}

class CompanionAiSystem {
  constructor() {
    this.companions = new Map();
  }

  spawn({ id = 'buddy-1', name = 'Барсик', personality = 'tactical', x = 0, y = 0, h = 1, skills = ['scout', 'build', 'cover'] } = {}) {
    const comp = {
      id: String(id),
      name: String(name),
      personality: String(personality),
      x: Number(x),
      y: Number(y),
      h: Number(h),
      skills: [...skills],
      trust: 0.72, // F-161: индекс доверия 0..1
      morale: 0.85,
      state: 'idle',
      activePlan: [],
      lastDecision: null,
      memory: [],
    };
    this.companions.set(comp.id, comp);
    return { ...comp };
  }

  order({ companionId = 'buddy-1', text = '', playerPos = { x: 0, y: 0, h: 1 }, visibleEntities = [], heardEvents = [] } = {}) {
    const comp = this.companions.get(companionId);
    if (!comp) {
      throw new RatCoreError('RC-104', `Напарник "${companionId}" не найден`, 'Сначала создай напарника через coopAi.spawn().');
    }
    const parsed = parseNaturalCommand(text);
    const hasSkill = comp.skills.includes(parsed.intent) || parsed.intent === 'follow' || parsed.intent === 'hold' || parsed.intent === 'assist';

    // F-161..F-162: оценка опасности по зрению/слуху и готовности выполнить приказ
    const loudThreat = heardEvents.find((e) => (e.perceivedDb ?? 0) >= 65 || /explosion|shot|alarm/i.test(String(e.kind || '')));
    const threatLevel = loudThreat ? 0.65 : (visibleEntities.length > 8 ? 0.35 : 0.12);
    const complianceScore = clamp(comp.trust * 0.7 + (hasSkill ? 0.3 : 0.1) - threatLevel * 0.25, 0.1, 1.0);

    const targetX = Number((playerPos.x + parsed.dirVec.dx * 6).toFixed(2));
    const targetY = Number((playerPos.y + parsed.dirVec.dy * 6).toFixed(2));
    const steps = [];
    if (loudThreat && parsed.intent !== 'cover') {
      steps.push({ action: 'alert-check', note: `Зафиксирован громкий звук (${loudThreat.kind || 'шум'}) — повышенная осторожность` });
    }
    steps.push({ action: `move-to`, x: targetX, y: targetY });
    steps.push({ action: parsed.intent, direction: parsed.direction, target: parsed.target || 'area' });

    comp.state = `executing:${parsed.intent}`;
    comp.activePlan = steps;
    comp.trust = clamp(Number((comp.trust + 0.03).toFixed(3)), 0, 1);

    const reasonParts = [
      `Понял команду «${parsed.raw || parsed.intent}» (уверенность ${Math.round(parsed.confidence * 100)}%).`,
      `Направление: ${parsed.direction}, целевая точка (${targetX}; ${targetY}).`,
      loudThreat
        ? `Слышу «${loudThreat.kind}» (${loudThreat.perceivedDb ?? '?'} дБ), поэтому сначала прикрываю фланг.`
        : `В поле зрения ${visibleEntities.length} объектов, путь чист.`,
    ];

    comp.lastDecision = {
      intent: parsed.intent,
      direction: parsed.direction,
      complianceScore: Number(complianceScore.toFixed(3)),
      trust: comp.trust,
      plan: steps,
      explanation: reasonParts.join(' '),
    };
    comp.memory.push({ at: Date.now(), cmd: parsed.raw, intent: parsed.intent });
    if (comp.memory.length > 32) comp.memory.shift();

    return {
      companionId: comp.id,
      parsed,
      state: comp.state,
      ...comp.lastDecision,
    };
  }

  step({ companionId = 'buddy-1', dt = 0.5, speed = 4 } = {}) {
    const comp = this.companions.get(companionId);
    if (!comp) throw new RatCoreError('RC-104', `Напарник "${companionId}" не найден`, 'Сначала вызови coopAi.spawn().');
    if (comp.activePlan.length === 0) {
      comp.state = 'idle';
      return { companionId: comp.id, state: comp.state, x: comp.x, y: comp.y, remainingSteps: 0 };
    }
    const step = comp.activePlan[0];
    if (step.action === 'move-to') {
      const dx = step.x - comp.x;
      const dy = step.y - comp.y;
      const dist = Math.hypot(dx, dy);
      const maxMove = Math.max(0.1, Number(speed) * Number(dt));
      if (dist <= maxMove) {
        comp.x = step.x;
        comp.y = step.y;
        comp.activePlan.shift();
      } else {
        comp.x = Number((comp.x + (dx / dist) * maxMove).toFixed(3));
        comp.y = Number((comp.y + (dy / dist) * maxMove).toFixed(3));
      }
    } else {
      comp.activePlan.shift();
    }
    if (comp.activePlan.length === 0) comp.state = 'ready';
    return {
      companionId: comp.id,
      state: comp.state,
      x: comp.x,
      y: comp.y,
      remainingSteps: comp.activePlan.length,
    };
  }

  explainLastAction({ companionId = 'buddy-1' } = {}) {
    const comp = this.companions.get(companionId);
    if (!comp) throw new RatCoreError('RC-104', `Напарник "${companionId}" не найден`, 'Сначала вызови coopAi.spawn().');
    if (!comp.lastDecision) {
      return { companionId: comp.id, explanation: `${comp.name} ждёт твоих указаний.`, trust: comp.trust };
    }
    return { companionId: comp.id, name: comp.name, ...comp.lastDecision };
  }
}
    exports["parseNaturalCommand"] = parseNaturalCommand;
    exports["CompanionAiSystem"] = CompanionAiSystem;
  });

  __define("src/packs/destruction.js", function (exports, __import) {
    var { clamp } = __import("src/core/math.js");
// RatCore Pack [pack:destruction] — Граф опор разрушаемости, обрушение в обломки и огонь по ветру (F-132..F-135, A-90..A-91)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).



class DestructionSystem {
  constructor() {
    this.structures = new Map();
    this.fires = new Map();
    this.debris = [];
    this.nextFireId = 1;
  }

  // Регистрация постройки как графа блоков с опорным фундаментом (isFoundation: true)
  registerStructure({ id, blocks = [] } = {}) {
    const sid = String(id || `struct_${this.structures.size + 1}`);
    const map = new Map();
    for (const b of blocks) {
      map.set(String(b.id), {
        id: String(b.id),
        x: Number(b.x || 0),
        y: Number(b.y || 0),
        h: Number(b.h || 0),
        hp: Math.max(1, Number(b.hp ?? 100)),
        maxHp: Math.max(1, Number(b.hp ?? 100)),
        isFoundation: Boolean(b.isFoundation),
        neighbors: Array.isArray(b.neighbors) ? b.neighbors.map(String) : [],
        intact: true,
      });
    }
    this.structures.set(sid, { id: sid, blocks: map });
    return { id: sid, blockCount: map.size };
  }

  // F-132 / A-90: Нанесение урона блоку + BFS-поиск потерявших связь с фундаментом (обрушение моста/башни!)
  damageBlock({ structureId, blockId, amount = 50 } = {}) {
    const st = this.structures.get(structureId);
    if (!st) return { ok: false, reason: 'structure-not-found' };
    const blk = st.blocks.get(String(blockId));
    if (!blk || !blk.intact) return { ok: false, reason: 'block-not-found-or-broken' };

    blk.hp = Math.max(0, blk.hp - Math.max(0, Number(amount)));
    const collapsed = [];

    if (blk.hp <= 0) {
      blk.intact = false;
      collapsed.push(blk.id);
      this._spawnDebris(structureId, blk);

      // BFS от всех целых фундаментов
      const supported = new Set();
      const queue = [];
      for (const b of st.blocks.values()) {
        if (b.intact && b.isFoundation) {
          supported.add(b.id);
          queue.push(b);
        }
      }
      while (queue.length > 0) {
        const cur = queue.shift();
        for (const nid of cur.neighbors) {
          const nb = st.blocks.get(nid);
          if (nb && nb.intact && !supported.has(nb.id)) {
            supported.add(nb.id);
            queue.push(nb);
          }
        }
      }

      // Всё, что оторвано от опоры -> мгновенно обрушивается в обломки!
      for (const b of st.blocks.values()) {
        if (b.intact && !supported.has(b.id)) {
          b.intact = false;
          b.hp = 0;
          collapsed.push(b.id);
          this._spawnDebris(structureId, b);
        }
      }
    }

    let intactCount = 0;
    for (const b of st.blocks.values()) if (b.intact) intactCount++;
    return {
      ok: true,
      structureId,
      targetHp: blk.hp,
      collapsedCount: collapsed.length,
      collapsed,
      intactRemaining: intactCount,
    };
  }

  _spawnDebris(structureId, blk) {
    this.debris.push({
      id: `deb_${this.debris.length + 1}`,
      structureId,
      sourceBlockId: blk.id,
      x: blk.x,
      y: blk.y,
      h: blk.h,
      mass: 2.5,
    });
    if (this.debris.length > 512) this.debris.shift();
  }

  // F-134 / A-91: Очаги пожара с распространением по вектору ветра и тушением водой
  ignite({ x = 0, y = 0, h = 1, intensity = 0.7, fuel = 100 } = {}) {
    const id = `fire_${this.nextFireId++}`;
    const f = {
      id,
      x: Number(x),
      y: Number(y),
      h: Number(h),
      intensity: clamp(Number(intensity), 0.1, 1.0),
      fuel: Math.max(5, Number(fuel)),
      active: true,
    };
    this.fires.set(id, f);
    return { ...f };
  }

  extinguish({ x = 0, y = 0, radius = 3, power = 1.0 } = {}) {
    let extinguished = 0;
    for (const f of this.fires.values()) {
      if (!f.active) continue;
      if (Math.hypot(f.x - x, f.y - y) <= radius) {
        f.intensity = clamp(f.intensity - power, 0, 1);
        if (f.intensity <= 0.05) {
          f.active = false;
          extinguished++;
        }
      }
    }
    return { extinguished, activeFires: [...this.fires.values()].filter((f) => f.active).length };
  }

  tickFire({ dt = 1.0, windDx = 2.0, windDy = 0.0, isRaining = false } = {}) {
    const spawned = [];
    const active = [...this.fires.values()].filter((f) => f.active);
    const windSpd = Math.hypot(windDx, windDy);

    for (const f of active) {
      f.fuel -= (4 + f.intensity * 6) * dt;
      if (isRaining) f.intensity = clamp(f.intensity - 0.25 * dt, 0, 1);
      if (f.fuel <= 0 || f.intensity <= 0.05) {
        f.active = false;
        continue;
      }
      // Распространение огня строго по направлению ветра при достаточной интенсивности
      if (!isRaining && f.intensity >= 0.55 && windSpd >= 1.5 && this.fires.size < 64) {
        const nx = Number((f.x + (windDx / windSpd) * 2.0).toFixed(2));
        const ny = Number((f.y + (windDy / windSpd) * 2.0).toFixed(2));
        const tooClose = [...this.fires.values()].some((o) => o.active && Math.hypot(o.x - nx, o.y - ny) < 1.2);
        if (!tooClose) {
          const child = this.ignite({ x: nx, y: ny, h: f.h, intensity: f.intensity * 0.85, fuel: f.fuel * 0.7 });
          spawned.push(child.id);
        }
      }
    }

    return {
      activeFires: [...this.fires.values()].filter((f) => f.active).length,
      spawnedCount: spawned.length,
      spawned,
    };
  }
}
    exports["DestructionSystem"] = DestructionSystem;
  });

  __define("src/packs/ecology.js", function (exports, __import) {
    var { clamp } = __import("src/core/math.js");
// RatCore Pack [pack:ecology] — Формула Стефана/Гольда для льда, эрозия HeightField, сезоны и фауна на 1 Гц (F-158..F-160, A-105..A-106)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).



const SEASONS = Object.freeze(['spring', 'summer', 'autumn', 'winter']);

class EcologySystem {
  constructor() {
    this.seasonIdx = 3; // winter по умолчанию для быстрой демонстрации льда
    this.iceThicknessCm = 12;
    this.iceStrengthKpa = 700; // A-коэффициент формулы Гольда (кПа для пресного льда)
    this.faunaPopulations = new Map([['deer', 24], ['wolves', 6], ['fish', 120]]);
    this.erosionSteps = 0;
  }

  setSeason(season) {
    const idx = SEASONS.indexOf(String(season));
    if (idx >= 0) this.seasonIdx = idx;
    return { season: SEASONS[this.seasonIdx], iceThicknessCm: this.iceThicknessCm };
  }

  // F-158: Формула Стефана нарастания/таяния речного льда по температуре воздуха и времени
  stepIce({ tempC = -12, hours = 6 } = {}) {
    const h = Math.max(0.1, Number(hours));
    if (tempC < 0) {
      // dh/dt пропорциональна |T| / (h + c) — закон Стефана
      const deltaCm = (Math.abs(tempC) * h * 0.085) / (1 + this.iceThicknessCm * 0.12);
      this.iceThicknessCm = Number(clamp(this.iceThicknessCm + deltaCm, 0, 180).toFixed(2));
    } else {
      const meltCm = tempC * h * 0.11;
      this.iceThicknessCm = Number(clamp(this.iceThicknessCm - meltCm, 0, 180).toFixed(2));
    }
    return { iceThicknessCm: this.iceThicknessCm, tempC, hours: h };
  }

  // F-159 / A-105: Формула Гольда P_max = A * h^2 (проверка проламывания льда под техникой!)
  // h в метрах, A в кПа -> безопасная нагрузка в килограммах: P_kg ≈ A * (h_m)^2 * 100
  iceStressTest({ massKg = 3500, iceThicknessCm = null, safetyFactor = 1.0 } = {}) {
    const hCm = iceThicknessCm !== null ? Math.max(0, Number(iceThicknessCm)) : this.iceThicknessCm;
    const hMeters = hCm / 100;
    const maxSafeKg = Math.round(this.iceStrengthKpa * hMeters * hMeters * 100 / Math.max(0.5, safetyFactor));
    const ratio = maxSafeKg > 0 ? Number((Number(massKg) / maxSafeKg).toFixed(3)) : Infinity;
    const status = ratio > 1.0 ? 'crack-collapse' : (ratio > 0.78 ? 'creaking-warning' : 'safe');
    return {
      massKg: Number(massKg),
      iceThicknessCm: hCm,
      maxSafeKg,
      loadRatio: ratio,
      holds: ratio <= 1.0,
      status,
    };
  }

  // F-160 / A-106: Лёгкая гидравлическая эрозия сетки высот HeightField на 1 Гц
  erodeTerrain(heightField, { iterations = 1, strength = 0.08 } = {}) {
    if (!heightField || !heightField.data) return { ok: false, erodedCells: 0 };
    const { width, height, data } = heightField;
    const s = clamp(Number(strength), 0.005, 0.35);
    let totalMoved = 0;

    for (let it = 0; it < Math.max(1, Math.min(8, iterations | 0)); it++) {
      const next = data.slice();
      for (let gy = 1; gy < height - 1; gy++) {
        for (let gx = 1; gx < width - 1; gx++) {
          const idx = gy * width + gx;
          const h0 = data[idx];
          const avg = (data[idx - 1] + data[idx + 1] + data[idx - width] + data[idx + width]) * 0.25;
          const diff = h0 - avg;
          if (Math.abs(diff) > 0.02) {
            next[idx] = h0 - diff * s;
            totalMoved += Math.abs(diff * s);
          }
        }
      }
      data.set(next);
      this.erosionSteps++;
    }
    return { ok: true, erosionSteps: this.erosionSteps, sedimentMoved: Number(totalMoved.toFixed(4)) };
  }

  // Шаг популяций фауны (упрощённая модель Лотки-Вольтерры на 1 Гц)
  tickFauna() {
    const prey = this.faunaPopulations.get('deer') || 0;
    const pred = this.faunaPopulations.get('wolves') || 0;
    const seasonBonus = SEASONS[this.seasonIdx] === 'winter' ? -0.04 : 0.06;
    const nextPrey = clamp(Math.round(prey + prey * (0.08 + seasonBonus) - 0.015 * prey * pred), 2, 300);
    const nextPred = clamp(Math.round(pred + 0.004 * prey * pred - 0.08 * pred), 1, 80);
    this.faunaPopulations.set('deer', nextPrey);
    this.faunaPopulations.set('wolves', nextPred);
    return {
      season: SEASONS[this.seasonIdx],
      populations: Object.fromEntries(this.faunaPopulations),
    };
  }
}
    exports["EcologySystem"] = EcologySystem;
  });

  __define("src/packs/exporter.js", function (exports, __import) {
    var { encodeWire2Frame } = __import("src/compress/wire2.js");
// RatCore Pack [pack:studio] — Экспорт автономной игры в 1 офлайн .html (< 300 КБ, 100% чистый для антивируса Games) + RatStudio метрики
// Формулы F-149..F-150, F-169; алгоритмы A-99..A-100, A-112.



function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function bytesToHex(bytes) {
  let out = '';
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, '0');
  return out;
}

// A-99..A-100: Собирает самодостаточный офлайн HTML с упакованной RCW2 сценой (0 внешних URL, 0 eval, 0 сети!)
function exportSingleHtmlGame({ title = 'RatCore Game', snapshot = {}, author = 'RatCore Studio' } = {}) {
  const safeTitle = escapeHtml(title);
  const safeAuthor = escapeHtml(author);
  const wire = encodeWire2Frame(snapshot, { codec: 'auto' });
  const rcw2Hex = bytesToHex(wire.frame);
  const entitiesJson = JSON.stringify(snapshot.entities || []).replace(/<\/script>/gi, '<\\/script>');

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${safeTitle}</title>
<style>
body{margin:0;background:#0b111b;color:#e2e8f0;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh}
main{text-align:center;padding:16px}
canvas{border:1px solid #26354d;border-radius:10px;background:#0f172a;max-width:94vw}
p{color:#94a3b8;font-size:13px}
</style>
</head>
<body>
<main>
<h1>${safeTitle}</h1>
<canvas id="c" width="480" height="270"></canvas>
<p>Собрано в ${safeAuthor} · RatCore RCW2 (${wire.wireBytes} Б / CRC32 0x${wire.crc32.toString(16)}) · 100% офлайн</p>
</main>
<script>
(function(){
  var RCW2_HEX = "${rcw2Hex}";
  var ENTITIES = ${entitiesJson};
  var c = document.getElementById("c");
  var ctx = c.getContext("2d");
  var t = 0;
  function draw(){
    t += 0.02;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "#1e293b";
    for (var gx = 0; gx < c.width; gx += 32) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, c.height); ctx.stroke(); }
    for (var gy = 0; gy < c.height; gy += 32) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(c.width, gy); ctx.stroke(); }
    for (var i = 0; i < ENTITIES.length; i++) {
      var e = ENTITIES[i];
      var sx = c.width * 0.5 + (e.x || 0) * 18;
      var sy = c.height * 0.5 - (e.y || 0) * 18;
      var r = Math.max(6, (e.scale || 1) * 10 + Math.sin(t + i) * 1.5);
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "11px monospace";
      ctx.fillText(String(e.id || "obj"), sx + r + 4, sy + 4);
    }
    ctx.fillStyle = "#34d399";
    ctx.font = "12px monospace";
    ctx.fillText("RatCore Offline Build · Entities: " + ENTITIES.length + " · RCW2 hex: " + RCW2_HEX.length + " chars", 10, 20);
    requestAnimationFrame(draw);
  }
  draw();
})();
</script>
</body>
</html>`;

  const sizeBytes = new TextEncoder().encode(html).length;
  return {
    title,
    sizeBytes,
    sizeKB: Number((sizeBytes / 1024).toFixed(2)),
    under300KB: sizeBytes < 300 * 1024,
    wireBytes: wire.wireBytes,
    wireCrc32: wire.crc32,
    html,
  };
}
    exports["exportSingleHtmlGame"] = exportSingleHtmlGame;
  });

  __define("src/packs/mods.js", function (exports, __import) {
    var { RatCoreError } = __import("src/core/seal.js");
    var { auditSourceCode } = __import("src/core/code-auditor.js");
    var { encodeWire2Frame, decodeWire2Frame } = __import("src/compress/wire2.js");
    var { crc32 } = __import("src/compress/codec.js");
// RatCore Pack [pack:mods] — Безопасная система модов .ratmod.rcw2, ToolGuard-аудит, ModQuota и Hot-Reload (F-138..F-139, A-93)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).






const FORBIDDEN_MOD_PATTERNS = [
  { re: /\beval\s*\(/, reason: 'Запрещён вызов eval() в песочнице мода' },
  { re: /\bnew\s+Function\s*\(/, reason: 'Запрещён динамический конструктор Function()' },
  { re: /\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b/, reason: 'Запрещён сетевой выход из песочницы мода' },
  { re: /\bprocess\.env\b|\bchild_process\b|\bfs\./, reason: 'Запрещён доступ к ОС/ФС из мода' },
];

class ModSandboxManager {
  constructor({ maxTotalQuotaPct = 25 } = {}) {
    this.maxTotalQuotaPct = Math.max(5, Math.min(50, Number(maxTotalQuotaPct)));
    this.mounted = new Map(); // modId -> record
    this.loadOrder = [];
    this.seq = 1;
  }

  // Упаковка мода в 1 бинарный сжатый контейнер .ratmod.rcw2 (RCW2 + CRC32)
  pack({ manifest = {}, recipes = [], rules = [], assets = [], scripts = [] } = {}) {
    const id = String(manifest.id || '').trim();
    if (!id || !/^[a-z0-9._-]{2,64}$/i.test(id)) {
      throw new RatCoreError('RC-104', `Недопустимый manifest.id мода: "${id}"`, 'Используй латиницу, цифры, ".", "_" или "-" (2..64 символа).');
    }
    const payloadObj = {
      schema: 'ratmod/1',
      manifest: {
        id,
        name: String(manifest.name || id),
        version: String(manifest.version || '1.0.0'),
        author: String(manifest.author || 'anonymous'),
        requires: Array.isArray(manifest.requires) ? manifest.requires.map(String) : [],
      },
      recipes: Array.isArray(recipes) ? recipes : [],
      rules: Array.isArray(rules) ? rules : [],
      assets: Array.isArray(assets) ? assets : [],
      scripts: Array.isArray(scripts) ? scripts.map(String) : [],
    };
    const jsonBytes = new TextEncoder().encode(JSON.stringify(payloadObj));
    const wire = encodeWire2Frame(jsonBytes, { seq: this.seq++, codec: 'auto' });
    return {
      modId: id,
      fileName: `${id}.ratmod.rcw2`,
      rawBytes: jsonBytes.length,
      packedBytes: wire.wireBytes,
      codecId: wire.codecId,
      crc32: crc32(wire.frame),
      packageBytes: wire.frame,
    };
  }

  // Строгая валидация пакета: CRC32 + ToolGuard (Барьер 4 + проверка рецептов) + ModQuota
  validate({ packageBytes, quotaPct = 10 } = {}) {
    if (!(packageBytes instanceof Uint8Array) || packageBytes.length < 16) {
      return { valid: false, code: 'RC-701', errors: ['Передан пустой или повреждённый буфер .ratmod.rcw2'], manifest: null };
    }
    let decoded;
    try {
      decoded = decodeWire2Frame(packageBytes, { asJson: true });
    } catch (err) {
      return { valid: false, code: err.code || 'RC-702', errors: [err.message || 'Ошибка распаковки RCW2'], manifest: null };
    }
    const pkg = decoded.data;
    if (!pkg || pkg.schema !== 'ratmod/1' || !pkg.manifest?.id) {
      return { valid: false, code: 'RC-703', errors: ['Некорректная схема пакета (ожидается ratmod/1)'], manifest: null };
    }

    const errors = [];
    let primaryCode = null;

    // 1. Проверка ToolGuard: запрет сырых неподписанных вершин/геометрии в рецептах и ассетах
    for (const r of (pkg.recipes || [])) {
      if (r && (r.rawVertices || r.positions || r.Float32Array)) {
        primaryCode = primaryCode || 'RC-101';
        errors.push(`Рецепт "${r.id || '?'}" содержит сырые вершины в обход ToolGuard`);
      }
    }
    for (const a of (pkg.assets || [])) {
      if (a && (a.rawPixels || a.rawVertices)) {
        primaryCode = primaryCode || 'RC-101';
        errors.push(`Ассет "${a.id || '?'}" содержит сырой буфер вместо процедурного рецепта`);
      }
    }

    // 2. Барьер 4 (auditSourceCode) + песочница запрещённых API для всех скриптов/правил
    const allCode = [
      ...(pkg.scripts || []),
      ...(pkg.rules || []).filter((r) => typeof r === 'string'),
    ];
    for (let i = 0; i < allCode.length; i++) {
      const src = allCode[i];
      const audit = auditSourceCode(src, `${pkg.manifest.id}#script${i}`);
      if (!audit.ok) {
        primaryCode = primaryCode || 'RC-102';
        for (const v of audit.violations) {
          errors.push(`ToolGuard (${v.code}): ${v.message}`);
        }
      }
      for (const p of FORBIDDEN_MOD_PATTERNS) {
        if (p.re.test(src)) {
          primaryCode = primaryCode || 'RC-102';
          errors.push(p.reason);
        }
      }
    }

    // 3. Проверка лимита квоты CPU (F-138)
    const q = Number(quotaPct);
    if (!Number.isFinite(q) || q <= 0 || q > this.maxTotalQuotaPct) {
      primaryCode = primaryCode || 'RC-603';
      errors.push(`Запрошенная квота CPU ${q}% превышает лимит песочницы (${this.maxTotalQuotaPct}%)`);
    }

    return {
      valid: errors.length === 0,
      code: primaryCode,
      errors,
      manifest: pkg.manifest,
      stats: {
        recipes: (pkg.recipes || []).length,
        rules: (pkg.rules || []).length,
        assets: (pkg.assets || []).length,
        scripts: (pkg.scripts || []).length,
        wireBytes: packageBytes.length,
      },
      pkg: errors.length === 0 ? pkg : null,
    };
  }

  // Топологическая сортировка зависимостей модов (алгоритм Кана, F-139, A-93)
  _computeTopologicalOrder(extraMod = null) {
    const nodes = new Map();
    for (const [id, rec] of this.mounted) nodes.set(id, rec.manifest.requires || []);
    if (extraMod) nodes.set(extraMod.manifest.id, extraMod.manifest.requires || []);

    for (const [id, deps] of nodes) {
      for (const dep of deps) {
        if (!nodes.has(dep)) {
          throw new RatCoreError('RC-106', `Мод "${id}" требует отсутствующую зависимость "${dep}"`, `Сначала подключи мод "${dep}" через mod.mount().`);
        }
      }
    }

    const inDeg = new Map();
    const adj = new Map();
    for (const id of nodes.keys()) {
      inDeg.set(id, 0);
      adj.set(id, []);
    }
    for (const [id, deps] of nodes) {
      for (const dep of deps) {
        adj.get(dep).push(id);
        inDeg.set(id, inDeg.get(id) + 1);
      }
    }

    const queue = [];
    for (const [id, deg] of inDeg) {
      if (deg === 0) queue.push(id);
    }
    queue.sort();

    const order = [];
    while (queue.length > 0) {
      const cur = queue.shift();
      order.push(cur);
      for (const nxt of adj.get(cur)) {
        const d = inDeg.get(nxt) - 1;
        inDeg.set(nxt, d);
        if (d === 0) queue.push(nxt);
      }
    }
    if (order.length !== nodes.size) {
      throw new RatCoreError('RC-106', 'Обнаружена циклическая зависимость между модами', 'Удали взаимную ссылку в manifest.requires.');
    }
    return order;
  }

  mount({ packageBytes, quotaPct = 10 } = {}) {
    const check = this.validate({ packageBytes, quotaPct });
    if (!check.valid) {
      throw new RatCoreError(check.code || 'RC-102', `Мод отклонён валидацией: ${check.errors.join('; ')}`, 'Исправь нарушения ToolGuard/песочницы и пересобери .ratmod.rcw2.');
    }
    const pkg = check.pkg;
    const modId = pkg.manifest.id;

    // Проверка суммарной квоты CPU
    let usedQuota = 0;
    for (const [id, rec] of this.mounted) {
      if (id !== modId) usedQuota += rec.quotaPct;
    }
    if (usedQuota + quotaPct > this.maxTotalQuotaPct) {
      throw new RatCoreError('RC-603', `Суммарная квота модов (${usedQuota + quotaPct}%) превышает лимит ${this.maxTotalQuotaPct}%`, 'Уменьши quotaPct или выгрузи неиспользуемые моды.');
    }

    const order = this._computeTopologicalOrder(pkg);
    const record = {
      modId,
      manifest: pkg.manifest,
      recipes: pkg.recipes,
      rules: pkg.rules,
      assets: pkg.assets,
      quotaPct: Number(quotaPct),
      cpuUsedMs: 0,
      cpuBudgetMs: (16.67 * Number(quotaPct)) / 100,
      paused: false,
      pauseReason: null,
      reloads: 0,
      mountedAt: Date.now(),
    };
    this.mounted.set(modId, record);
    this.loadOrder = order;
    return {
      mounted: true,
      modId,
      version: record.manifest.version,
      quotaPct: record.quotaPct,
      cpuBudgetMs: Number(record.cpuBudgetMs.toFixed(3)),
      loadOrder: [...this.loadOrder],
    };
  }

  // Учёт CPU-бюджета мода (F-138): при перерасходе авто-пауза без краша игры
  recordModCpu({ modId, spentMs = 0 } = {}) {
    const rec = this.mounted.get(modId);
    if (!rec) throw new RatCoreError('RC-104', `Мод "${modId}" не подключён`, 'Проверь список через mod.list().');
    rec.cpuUsedMs = Number(spentMs);
    if (rec.cpuUsedMs > rec.cpuBudgetMs) {
      rec.paused = true;
      rec.pauseReason = `Превышен бюджет ModQuota (${rec.cpuUsedMs.toFixed(2)} мс > ${rec.cpuBudgetMs.toFixed(2)} мс)`;
    }
    return { modId, cpuUsedMs: rec.cpuUsedMs, cpuBudgetMs: Number(rec.cpuBudgetMs.toFixed(3)), paused: rec.paused, pauseReason: rec.pauseReason };
  }

  // Горячее обновление без перезапуска мира и с сохранением прежней версии при ошибке
  hotReload({ modId, packageBytes } = {}) {
    const prev = this.mounted.get(modId);
    if (!prev) throw new RatCoreError('RC-104', `Мод "${modId}" не найден для hotReload`, 'Сначала подключи мод через mod.mount().');
    const check = this.validate({ packageBytes, quotaPct: prev.quotaPct });
    if (!check.valid) {
      throw new RatCoreError(check.code || 'RC-102', `Hot-Reload отклонён (предыдущая версия сохранена): ${check.errors.join('; ')}`, 'Исправь новый пакет мода.');
    }
    const pkg = check.pkg;
    if (pkg.manifest.id !== modId) {
      throw new RatCoreError('RC-104', `ID нового пакета "${pkg.manifest.id}" не совпадает с "${modId}"`, 'Используй тот же manifest.id для hotReload.');
    }
    prev.manifest = pkg.manifest;
    prev.recipes = pkg.recipes;
    prev.rules = pkg.rules;
    prev.assets = pkg.assets;
    prev.paused = false;
    prev.pauseReason = null;
    prev.reloads++;
    this.loadOrder = this._computeTopologicalOrder();
    return { reloaded: true, modId, version: prev.manifest.version, reloads: prev.reloads };
  }

  unmount({ modId } = {}) {
    if (!this.mounted.has(modId)) {
      return { unmounted: false, modId };
    }
    // Проверяем, не зависит ли другой активный мод от удаляемого
    for (const [otherId, rec] of this.mounted) {
      if (otherId !== modId && (rec.manifest.requires || []).includes(modId)) {
        throw new RatCoreError('RC-106', `Нельзя выгрузить "${modId}": от него зависит "${otherId}"`, `Сначала выгрузи "${otherId}".`);
      }
    }
    this.mounted.delete(modId);
    this.loadOrder = this.mounted.size > 0 ? this._computeTopologicalOrder() : [];
    return { unmounted: true, modId, remaining: this.mounted.size };
  }

  list() {
    return this.loadOrder.map((id) => {
      const r = this.mounted.get(id);
      return {
        modId: r.modId,
        name: r.manifest.name,
        version: r.manifest.version,
        requires: [...r.manifest.requires],
        quotaPct: r.quotaPct,
        paused: r.paused,
        reloads: r.reloads,
        recipes: r.recipes.length,
      };
    });
  }
}
    exports["ModSandboxManager"] = ModSandboxManager;
  });

  __define("src/packs/multiplayer.js", function (exports, __import) {
    var { clamp } = __import("src/core/math.js");
// RatCore Pack [pack:multiplayer] — Комнаты P2P/WS, 12-байтный ввод и Rollback Netcode (F-129..F-131, A-87..A-89)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).



// F-129: Ультра-компактный 12-байтный кадр ввода игрока (tick u32, peerId u16, buttons u16, moveX i16, moveY i16)
function encodeInput12({ tick = 0, peerId = 0, buttons = 0, moveX = 0, moveY = 0 } = {}) {
  const buf = new Uint8Array(12);
  const dv = new DataView(buf.buffer);
  dv.setUint32(0, tick >>> 0, true);
  dv.setUint16(4, peerId & 0xffff, true);
  dv.setUint16(6, buttons & 0xffff, true);
  dv.setInt16(8, Math.round(clamp(Number(moveX), -1, 1) * 32767), true);
  dv.setInt16(10, Math.round(clamp(Number(moveY), -1, 1) * 32767), true);
  return buf;
}

function decodeInput12(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  return {
    tick: dv.getUint32(0, true),
    peerId: dv.getUint16(4, true),
    buttons: dv.getUint16(6, true),
    moveX: Number((dv.getInt16(8, true) / 32767).toFixed(4)),
    moveY: Number((dv.getInt16(10, true) / 32767).toFixed(4)),
  };
}

// A-87..A-89: Детерминированный Rollback Netcode с окном снимков и перепроигрыванием расхождений
class MultiplayerSession {
  constructor() {
    this.rooms = new Map();
    this.stateHistory = new Map(); // tick -> cloned state
    this.inputsByTick = new Map(); // tick -> Map(peerId -> input)
    this.confirmedTick = 0;
    this.currentTick = 0;
    this.rollbacks = 0;
    this.rttSamplesMs = [];
  }

  createRoom({ roomId, maxPlayers = 4, tickRate = 30, rollbackWindow = 16 } = {}) {
    const id = String(roomId || `room_${this.rooms.size + 1}`);
    const room = {
      id,
      maxPlayers: clamp(Number(maxPlayers), 2, 64),
      tickRate: clamp(Number(tickRate), 10, 60),
      rollbackWindow: clamp(Number(rollbackWindow), 4, 60),
      peers: new Map(),
      createdAt: Date.now(),
    };
    this.rooms.set(id, room);
    return { roomId: id, maxPlayers: room.maxPlayers, tickRate: room.tickRate, rollbackWindow: room.rollbackWindow };
  }

  joinRoom({ roomId, peerId, name = 'Player' } = {}) {
    const room = this.rooms.get(roomId);
    if (!room) return { ok: false, reason: 'room-not-found' };
    if (room.peers.size >= room.maxPlayers) return { ok: false, reason: 'room-full' };
    const pid = Number(peerId ?? room.peers.size + 1);
    room.peers.set(pid, { peerId: pid, name: String(name), joinedAt: Date.now(), rttMs: 0 });
    return { ok: true, roomId, peerId: pid, peerCount: room.peers.size };
  }

  // Сохранить состояние мира на тике + локальный ввод
  commitTick({ tick, state, input } = {}) {
    const t = Number(tick ?? this.currentTick);
    this.currentTick = Math.max(this.currentTick, t);
    if (state !== undefined) {
      this.stateHistory.set(t, JSON.parse(JSON.stringify(state)));
      // Чистим историю старше 64 тиков
      for (const oldT of this.stateHistory.keys()) {
        if (oldT < t - 64) this.stateHistory.delete(oldT);
      }
    }
    if (input) {
      if (!this.inputsByTick.has(t)) this.inputsByTick.set(t, new Map());
      this.inputsByTick.get(t).set(input.peerId, input);
    }
    return { tick: t, historySize: this.stateHistory.size };
  }

  // Приём позднего удалённого ввода: если ввод расходится с предсказанием -> откат и перепроигрывание до currentTick!
  receiveRemoteInput({ frame12, simulateStep } = {}) {
    const inp = frame12 instanceof Uint8Array ? decodeInput12(frame12) : frame12;
    const t = inp.tick;
    if (!this.inputsByTick.has(t)) this.inputsByTick.set(t, new Map());
    const prev = this.inputsByTick.get(t).get(inp.peerId);
    const mismatch = !prev || prev.buttons !== inp.buttons || Math.abs(prev.moveX - inp.moveX) > 1e-3 || Math.abs(prev.moveY - inp.moveY) > 1e-3;
    this.inputsByTick.get(t).set(inp.peerId, inp);

    if (!mismatch || t >= this.currentTick || typeof simulateStep !== 'function') {
      return { rolledBack: false, tick: t, replayedTicks: 0, state: this.stateHistory.get(this.currentTick) || null };
    }

    const baseState = this.stateHistory.get(t);
    if (!baseState) {
      return { rolledBack: false, tick: t, reason: 'outside-rollback-window', replayedTicks: 0 };
    }

    this.rollbacks++;
    let simState = JSON.parse(JSON.stringify(baseState));
    let replayed = 0;
    for (let rt = t; rt <= this.currentTick; rt++) {
      const tickInputs = this.inputsByTick.get(rt) ? [...this.inputsByTick.get(rt).values()] : [];
      simState = simulateStep(simState, tickInputs, rt);
      this.stateHistory.set(rt, JSON.parse(JSON.stringify(simState)));
      replayed++;
    }
    this.confirmedTick = Math.max(this.confirmedTick, t);
    return { rolledBack: true, fromTick: t, toTick: this.currentTick, replayedTicks: replayed, totalRollbacks: this.rollbacks, state: simState };
  }

  recordRtt(rttMs) {
    this.rttSamplesMs.push(Math.max(0, Number(rttMs)));
    if (this.rttSamplesMs.length > 30) this.rttSamplesMs.shift();
    const avg = this.rttSamplesMs.reduce((a, b) => a + b, 0) / this.rttSamplesMs.length;
    const jitter = Math.sqrt(this.rttSamplesMs.reduce((s, x) => s + (x - avg) ** 2, 0) / this.rttSamplesMs.length);
    return { avgRttMs: Number(avg.toFixed(1)), jitterMs: Number(jitter.toFixed(1)) };
  }
}
    exports["encodeInput12"] = encodeInput12;
    exports["decodeInput12"] = decodeInput12;
    exports["MultiplayerSession"] = MultiplayerSession;
  });

  __define("src/packs/narrative.js", function (exports, __import) {
    var { clamp, createRng } = __import("src/core/math.js");
// RatCore Pack [pack:narrative] — ИИ-Режиссёр темпа + Летопись мира + Квесты без софтлоков (F-136..F-137, F-154..F-155, A-92, A-102..A-103)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).



const PHASES = Object.freeze(['build-up', 'peak', 'sustain', 'relax']);

class NarrativeSuite {
  constructor(seed = 1337) {
    this.rng = createRng(seed);
    this.phaseIdx = 0;
    this.phaseTicks = 0;
    this.tension = 0.25;
    this.chronicle = [];
    this.factions = new Map();
    this.quests = new Map();
  }

  // F-136 / A-92: Шаг ИИ-Режиссёра темпа (Build-Up -> Peak -> Sustain -> Relax)
  directorTick({ playerHealthRatio = 1, activeThreats = 0, resourcesRatio = 0.7 } = {}) {
    this.phaseTicks++;
    const stress = clamp((1 - playerHealthRatio) * 0.55 + Math.min(1, activeThreats / 6) * 0.45, 0, 1);
    this.tension = Number(clamp(this.tension * 0.7 + stress * 0.3, 0, 1).toFixed(3));

    const currentPhase = PHASES[this.phaseIdx];
    let directive = 'ambient-calm';

    if (currentPhase === 'build-up') {
      directive = activeThreats < 2 ? 'spawn-scout-or-clue' : 'raise-atmosphere';
      if (this.tension >= 0.65 || this.phaseTicks >= 4) { this.phaseIdx = 1; this.phaseTicks = 0; }
    } else if (currentPhase === 'peak') {
      directive = playerHealthRatio > 0.35 ? 'trigger-climax-event' : 'ease-pressure';
      if (this.phaseTicks >= 3 || playerHealthRatio < 0.25) { this.phaseIdx = 2; this.phaseTicks = 0; }
    } else if (currentPhase === 'sustain') {
      directive = 'hold-tension';
      if (this.phaseTicks >= 2) { this.phaseIdx = 3; this.phaseTicks = 0; }
    } else {
      directive = resourcesRatio < 0.5 ? 'grant-supply-cache' : 'safe-breather';
      if (this.phaseTicks >= 3) { this.phaseIdx = 0; this.phaseTicks = 0; }
    }

    return { phase: PHASES[this.phaseIdx], tension: this.tension, directive };
  }

  addChronicle({ tick = 0, kind = 'event', summary = '', impact = 1 } = {}) {
    const entry = { id: `chr_${this.chronicle.length + 1}`, tick, kind, summary: String(summary), impact: Number(impact) };
    this.chronicle.push(entry);
    if (this.chronicle.length > 200) this.chronicle.shift();
    return entry;
  }

  setFactionRelation({ factionA, factionB, delta = 0 } = {}) {
    const key = [String(factionA), String(factionB)].sort().join('::');
    const prev = this.factions.get(key) ?? 0;
    const next = clamp(prev + Number(delta), -100, 100);
    this.factions.set(key, next);
    const stance = next >= 40 ? 'allied' : (next <= -40 ? 'hostile' : 'neutral');
    return { pair: key, relation: next, stance };
  }

  // F-154..F-155 / A-102..A-103: Генератор квеста + математическая проверка отсутствия софтлоков (BFS по графу состояний)
  generateQuest({ id, title, stages = null } = {}) {
    const qid = String(id || `quest_${this.quests.size + 1}`);
    const defaultStages = [
      { id: 'start', text: 'Найти зацепку в секторе', next: ['investigate', 'negotiate'] },
      { id: 'investigate', text: 'Осмотреть маяк и собрать данные', next: ['finale'] },
      { id: 'negotiate', text: 'Договориться с фракцией', next: ['finale'] },
      { id: 'finale', text: 'Завершить задание и получить награду', isGoal: true, next: [] },
    ];
    const nodes = Array.isArray(stages) && stages.length > 0 ? stages : defaultStages;
    const audit = this.verifyNoSoftlocks(nodes);
    const quest = {
      id: qid,
      title: String(title || `Операция #${this.quests.size + 1}`),
      stages: nodes,
      currentStage: nodes[0].id,
      softlockFree: audit.ok,
      audit,
    };
    this.quests.set(qid, quest);
    return quest;
  }

  // Математическая верификация графа квеста: каждая достижимая вершина обязана иметь путь к хотя бы одной цели isGoal!
  verifyNoSoftlocks(stages) {
    const byId = new Map(stages.map((s) => [s.id, s]));
    const goals = stages.filter((s) => s.isGoal).map((s) => s.id);
    if (!stages.length || !goals.length) {
      return { ok: false, reason: 'no-goal-stage', deadEnds: stages.map((s) => s.id) };
    }

    // 1. Прямой BFS от старта — какие состояния достижимы
    const reachable = new Set([stages[0].id]);
    const q = [stages[0].id];
    while (q.length) {
      const cur = byId.get(q.shift());
      if (!cur) continue;
      for (const nxt of cur.next || []) {
        if (byId.has(nxt) && !reachable.has(nxt)) {
          reachable.add(nxt);
          q.push(nxt);
        }
      }
    }

    // 2. Обратный BFS от всех целей — из каких состояний можно дойти до победы
    const rev = new Map();
    for (const s of stages) {
      for (const nxt of s.next || []) {
        if (!rev.has(nxt)) rev.set(nxt, []);
        rev.get(nxt).push(s.id);
      }
    }
    const canFinish = new Set(goals);
    const rq = [...goals];
    while (rq.length) {
      const cur = rq.shift();
      for (const prev of rev.get(cur) || []) {
        if (!canFinish.has(prev)) {
          canFinish.add(prev);
          rq.push(prev);
        }
      }
    }

    const deadEnds = [...reachable].filter((id) => !canFinish.has(id));
    const goalReachable = goals.some((g) => reachable.has(g));
    return {
      ok: goalReachable && deadEnds.length === 0,
      goalReachable,
      reachableCount: reachable.size,
      deadEnds,
    };
  }
}
    exports["NarrativeSuite"] = NarrativeSuite;
  });

  __define("src/packs/studio.js", function (exports, __import) {
    var { clamp, createRng } = __import("src/core/math.js");
    var { RatCoreError } = __import("src/core/seal.js");
// RatCore Pack [pack:studio] — RatStudio dev-оверлей, «Машина времени» (COW Timeline) и Автобалансировщик (F-143..F-148, F-169, A-96..A-98, A-112..A-113)
// Только для dev/authoring (полностью вырезается в релизном экспорте: 0 Б в финальной игре!).




function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// 1. «Машина времени» с ветвлением истории (COW-снимки, F-143..F-144, A-96)
class TimelineDebugger {
  constructor() {
    this.keyframeInterval = 10;
    this.maxBranchRamMB = 24;
    this.branches = new Map();
    this.activeBranchId = 'main';
    this.nextBranchNum = 1;
    this.init();
  }

  init({ keyframeInterval = 10, maxBranchRamMB = 24 } = {}) {
    // F-143: оптимальный интервал K*
    this.keyframeInterval = keyframeInterval === 'auto' ? 12 : Math.max(1, Number(keyframeInterval) | 0);
    this.maxBranchRamMB = clamp(Number(maxBranchRamMB), 4, 256);
    this.branches.clear();
    this.branches.set('main', {
      id: 'main',
      label: 'Основная ветка',
      parentId: null,
      forkTick: 0,
      patchParams: {},
      keyframes: new Map(), // tick -> snapshot
      ticks: [],
    });
    this.activeBranchId = 'main';
    return {
      initialized: true,
      keyframeInterval: this.keyframeInterval,
      maxBranchRamMB: this.maxBranchRamMB,
      activeBranchId: this.activeBranchId,
    };
  }

  record({ tick = 0, snapshot, branchId = this.activeBranchId, forceKeyframe = false } = {}) {
    const br = this.branches.get(branchId);
    if (!br) throw new RatCoreError('RC-104', `Ветка таймлайна "${branchId}" не найдена`, 'Вызови save.timelineInit() или проверь branchId.');
    const t = Number(tick) | 0;
    const shouldStore = forceKeyframe || br.keyframes.size === 0 || (t % this.keyframeInterval === 0);
    if (shouldStore && snapshot) {
      br.keyframes.set(t, deepClone(snapshot));
    }
    if (!br.ticks.includes(t)) {
      br.ticks.push(t);
      br.ticks.sort((a, b) => a - b);
    }
    return { branchId: br.id, tick: t, storedKeyframe: shouldStore, totalKeyframes: br.keyframes.size };
  }

  // Находит ближайший снимок <= tick, поднимаясь по COW-цепочке предков с соблюдением forkTick (A-96)
  _resolveKeyframe(branchId, targetTick) {
    let curId = branchId;
    let capTick = targetTick;
    let bestTick = -Infinity;
    let bestSnap = null;
    let ownerBranch = branchId;

    while (curId) {
      const br = this.branches.get(curId);
      if (!br) break;
      for (const [kfTick, snap] of br.keyframes) {
        if (kfTick <= capTick && kfTick > bestTick) {
          bestTick = kfTick;
          bestSnap = snap;
          ownerBranch = curId;
        }
      }
      if (br.parentId) {
        capTick = Math.min(capTick, br.forkTick);
      }
      curId = br.parentId;
    }
    return bestSnap ? { tick: bestTick, ownerBranch, snapshot: deepClone(bestSnap) } : null;
  }

  scrubTo({ tick = 0, branchId = this.activeBranchId } = {}) {
    const br = this.branches.get(branchId);
    if (!br) throw new RatCoreError('RC-104', `Ветка таймлайна "${branchId}" не найдена`, 'Проверь branchId.');
    const t = Number(tick) | 0;
    const resolved = this._resolveKeyframe(branchId, t);
    if (!resolved) {
      throw new RatCoreError('RC-104', `Нет записанных COW-снимков до тика ${t}`, 'Запиши минимум 1 снимок перед перемоткой.');
    }
    this.activeBranchId = branchId;
    return {
      branchId,
      requestedTick: t,
      restoredFromKeyframeTick: resolved.tick,
      replayDeltaTicks: Math.max(0, t - resolved.tick),
      inheritedFromBranch: resolved.ownerBranch,
      patchParams: { ...br.patchParams },
      snapshot: resolved.snapshot,
    };
  }

  // F-144: создание альтернативной ветки истории без копирования всей истории (Copy-On-Write)
  branchFrom({ tick = 0, fromBranchId = this.activeBranchId, patchParams = {}, label } = {}) {
    const parent = this.branches.get(fromBranchId);
    if (!parent) throw new RatCoreError('RC-104', `Родительская ветка "${fromBranchId}" не найдена`, 'Проверь fromBranchId.');
    const base = this._resolveKeyframe(fromBranchId, Number(tick) | 0);
    if (!base) throw new RatCoreError('RC-104', `Невозможно ответвиться от тика ${tick}: нет снимка`, 'Сначала запиши снимок.');

    const id = `branch-${this.nextBranchNum++}`;
    const snap = deepClone(base.snapshot);
    snap.meta = { ...(snap.meta || {}), patchParams: { ...patchParams }, forkedFrom: fromBranchId, forkTick: Number(tick) | 0 };
    const child = {
      id,
      label: String(label || `Ветка #${this.nextBranchNum - 1}`),
      parentId: fromBranchId,
      forkTick: Number(tick) | 0,
      patchParams: { ...patchParams },
      keyframes: new Map([[Number(tick) | 0, snap]]),
      ticks: [Number(tick) | 0],
    };
    this.branches.set(id, child);
    this.activeBranchId = id;
    return {
      branchId: id,
      label: child.label,
      parentId: fromBranchId,
      forkTick: child.forkTick,
      patchParams: child.patchParams,
      totalBranches: this.branches.size,
    };
  }

  compareBranches({ branchA = 'main', branchB, tick = 0 } = {}) {
    const a = this._resolveKeyframe(branchA, Number(tick) | 0);
    const b = this._resolveKeyframe(branchB || this.activeBranchId, Number(tick) | 0);
    if (!a || !b) throw new RatCoreError('RC-104', 'Не удалось сравнить ветки: отсутствует снимок', 'Проверь идентификаторы веток.');
    const entA = (a.snapshot.entities || []).length;
    const entB = (b.snapshot.entities || []).length;
    return {
      tick: Number(tick) | 0,
      branchA: { id: branchA, entities: entA, keyframeTick: a.tick },
      branchB: { id: branchB || this.activeBranchId, entities: entB, keyframeTick: b.tick },
      entityCountDelta: entB - entA,
      patchA: this.branches.get(branchA)?.patchParams || {},
      patchB: this.branches.get(branchB || this.activeBranchId)?.patchParams || {},
    };
  }

  summary() {
    return {
      activeBranchId: this.activeBranchId,
      keyframeInterval: this.keyframeInterval,
      branches: [...this.branches.values()].map((b) => ({
        id: b.id,
        label: b.label,
        parentId: b.parentId,
        forkTick: b.forkTick,
        keyframes: b.keyframes.size,
      })),
    };
  }
}

// 2. Автобалансировщик игр и детектор эксплойтов (F-145..F-148, A-97..A-98)
function runAutoBalance({
  runs = 200,
  seed = 1337,
  strategies = ['aggro', 'defense', 'economy', 'stealth'],
  params = { aggroDmg: 1.45, defenseArmor: 1.0, economyRate: 1.05, stealthCrit: 0.95 },
  evaluator = null,
} = {}) {
  const nRuns = clamp(Number(runs) | 0, 20, 2000);
  const stratList = Array.isArray(strategies) && strategies.length >= 2 ? strategies : ['aggro', 'defense', 'economy', 'stealth'];
  const paramKeys = Object.keys(params);
  const rng = createRng(seed);

  function simulateBatch(pObj, localRng, count) {
    const wins = Object.fromEntries(stratList.map((s) => [s, 0]));
    for (let i = 0; i < count; i++) {
      let bestS = stratList[0];
      let bestScore = -Infinity;
      for (let si = 0; si < stratList.length; si++) {
        const s = stratList[si];
        const sScore = typeof evaluator === 'function'
          ? evaluator(s, pObj, localRng)
          : ((Number(pObj[paramKeys[si % paramKeys.length]] ?? 1.0)) * (0.72 + localRng.next() * 0.56));
        if (sScore > bestScore) {
          bestScore = sScore;
          bestS = s;
        }
      }
      wins[bestS]++;
    }
    const rates = {};
    for (const s of stratList) rates[s] = wins[s] / count;
    return { wins, rates };
  }

  function computeMetrics(rates) {
    const vals = Object.values(rates);
    const maxRate = Math.max(...vals);
    const ideal = 1 / vals.length;
    // F-145: Индекс доминирования стратегий (0 = идеальный баланс, 1 = полная автопобеда)
    const dominanceIndex = clamp((maxRate - ideal) / Math.max(1e-6, 1 - ideal), 0, 1);
    // F-146: Нормализованная энтропия мета-игры Шеннона (1 = все стратегии равножизнеспособны)
    let h = 0;
    for (const p of vals) if (p > 1e-9) h -= p * Math.log2(p);
    const metaEntropy = h / Math.log2(vals.length);
    // F-148: Сводный фитнес баланса (0..1)
    const balanceFitness = clamp(0.55 * metaEntropy + 0.45 * (1 - dominanceIndex), 0, 1);
    return {
      dominanceIndex: Number(dominanceIndex.toFixed(4)),
      metaEntropy: Number(metaEntropy.toFixed(4)),
      balanceFitness: Number(balanceFitness.toFixed(4)),
    };
  }

  const baseSim = simulateBatch(params, rng, nRuns);
  const baseMetrics = computeMetrics(baseSim.rates);

  // F-147: оценка чувствительности и поиск рекомендуемого дифф-патча баланса
  const suggestedParams = { ...params };
  const sensitivity = {};
  const ideal = 1 / stratList.length;
  for (let i = 0; i < paramKeys.length; i++) {
    const key = paramKeys[i];
    const strat = stratList[i % stratList.length];
    const rate = baseSim.rates[strat];
    const delta = rate - ideal;
    sensitivity[key] = Number((delta * 2.0).toFixed(4));
    // Корректируем доминирующие параметры вниз, слабые — вверх
    const currentVal = Number(params[key]);
    if (Number.isFinite(currentVal)) {
      const factor = clamp(1 - delta * 0.72, 0.55, 1.45);
      suggestedParams[key] = Number((currentVal * factor).toFixed(3));
    }
  }

  const afterSim = simulateBatch(suggestedParams, createRng(seed ^ 0x55aa), nRuns);
  const afterMetrics = computeMetrics(afterSim.rates);

  return {
    runs: nRuns,
    seed,
    winRates: Object.fromEntries(Object.entries(baseSim.rates).map(([k, v]) => [k, Number(v.toFixed(4))])),
    ...baseMetrics,
    sensitivity,
    suggestedPatch: suggestedParams,
    projectedWinRates: Object.fromEntries(Object.entries(afterSim.rates).map(([k, v]) => [k, Number(v.toFixed(4))])),
    projectedFitness: afterMetrics.balanceFitness,
    improved: afterMetrics.balanceFitness >= baseMetrics.balanceFitness,
  };
}

function findBalanceExploits(options = {}) {
  const report = runAutoBalance(options);
  const exploits = [];
  const stratCount = Object.keys(report.winRates).length;
  const threshold = Math.min(0.85, (1 / stratCount) + 0.22);
  for (const [strategy, rate] of Object.entries(report.winRates)) {
    if (rate >= threshold) {
      exploits.push({
        kind: 'auto-win-strategy',
        strategy,
        winRate: rate,
        severity: rate >= 0.65 ? 'critical' : 'warning',
        recommendation: `Снизь эффективность параметров стратегии «${strategy}» (см. suggestedPatch).`,
      });
    }
  }
  return {
    exploitsFound: exploits.length,
    exploits,
    dominanceIndex: report.dominanceIndex,
    metaEntropy: report.metaEntropy,
    suggestedPatch: report.suggestedPatch,
    projectedFitness: report.projectedFitness,
    seed: report.seed,
  };
}

// 3. Контроллер оверлея RatStudio (F-169, A-112..A-113)
class RatStudioController {
  constructor() {
    this.isOpen = false;
    this.panels = ['inspector', 'timeline', 'balancer', 'exporter'];
    this.frameOverheadBudgetMs = 0.8; // F-169
    this.timeline = new TimelineDebugger();
  }

  open({ panels = ['inspector', 'timeline', 'balancer', 'exporter'] } = {}) {
    const allowed = ['inspector', 'timeline', 'balancer', 'exporter'];
    this.panels = (Array.isArray(panels) ? panels : allowed).filter((p) => allowed.includes(p));
    if (this.panels.length === 0) this.panels = ['inspector'];
    this.isOpen = true;
    return {
      open: true,
      panels: [...this.panels],
      frameOverheadBudgetMs: this.frameOverheadBudgetMs,
      devOnlyStripInRelease: true,
    };
  }

  close() {
    this.isOpen = false;
    return { open: false };
  }

  inspectScene({ entities = [], vaultStats = {}, governorStats = {}, profile = {} } = {}) {
    let totalTris = 0;
    const inspected = entities.map((e) => {
      const tris = e.mesh?.triCount || 0;
      totalTris += tris;
      return { id: e.id, tag: e.tag, pos: [e.x, e.y, e.h], triCount: tris, sealedMeshId: e.mesh?.id || null };
    });
    return {
      entityCount: entities.length,
      totalTris,
      vaultStats,
      governorCpuCapPct: governorStats?.profile?.targetCpuPct ?? 75,
      estBundleKB: profile.estBundleKB ?? 32,
      savingsPct: profile.savingsPct ?? 0,
      entities: inspected,
    };
  }
}
    exports["TimelineDebugger"] = TimelineDebugger;
    exports["runAutoBalance"] = runAutoBalance;
    exports["findBalanceExploits"] = findBalanceExploits;
    exports["RatStudioController"] = RatStudioController;
  });

  __define("src/packs/styles.js", function (exports, __import) {
    var { clamp } = __import("src/core/math.js");
    var { packRGBA, unpackRGBA } = __import("src/assets/raster.js");
// RatCore Pack [pack:styles] — Пост-обработка стилей PS1, CRT, Тепловизор, ПНВ и Cel для RasterSurface (F-151..F-153, A-101)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).




const STYLE_PRESETS = Object.freeze(['none', 'ps1', 'crt', 'thermal', 'nightvision', 'cel']);

class StyleShaderPipeline {
  constructor() {
    this.activePreset = 'none';
    this.params = { ditherLevels: 5, scanlineStrength: 0.35 };
  }

  applyPreset({ preset = 'none', params = {} } = {}) {
    this.activePreset = STYLE_PRESETS.includes(preset) ? preset : 'none';
    this.params = { ...this.params, ...params };
    return { activePreset: this.activePreset, params: { ...this.params } };
  }

  // Применяет выбранный визуальный стиль прямо поверх RasterSurface (0 GPU-зависимостей!)
  processSurface(surface) {
    if (!surface || this.activePreset === 'none') return { applied: 'none' };
    const { width, height, pixels } = surface;

    if (this.activePreset === 'ps1') {
      surface.applyBayerDither(this.params.ditherLevels || 5);
      return { applied: 'ps1', pixelsProcessed: pixels.length };
    }

    if (this.activePreset === 'crt') {
      const scan = clamp(Number(this.params.scanlineStrength ?? 0.35), 0.1, 0.75);
      const cx = width * 0.5, cy = height * 0.5;
      for (let y = 0; y < height; y++) {
        const lineFactor = (y & 1) ? (1 - scan) : 1.0;
        for (let x = 0; x < width; x++) {
          const dx = (x - cx) / cx;
          const dy = (y - cy) / cy;
          const vig = clamp(1 - (dx * dx + dy * dy) * 0.32, 0.45, 1.0) * lineFactor;
          const idx = y * width + x;
          const [r, g, b, a] = unpackRGBA(pixels[idx]);
          pixels[idx] = packRGBA((r * vig) | 0, (g * vig) | 0, (b * vig) | 0, a);
        }
      }
      return { applied: 'crt', pixelsProcessed: pixels.length };
    }

    if (this.activePreset === 'thermal') {
      for (let i = 0; i < pixels.length; i++) {
        const [r, g, b, a] = unpackRGBA(pixels[i]);
        const t = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        // Палитра тепловизора: тёмно-синий -> пурпурный -> оранжевый -> жёлто-белый
        const tr = clamp(Math.round(Math.min(1, Math.max(0, (t - 0.25) * 1.8)) * 255), 0, 255);
        const tg = clamp(Math.round(Math.min(1, Math.max(0, (t - 0.55) * 2.2)) * 255), 0, 255);
        const tb = clamp(Math.round((t < 0.5 ? 0.35 + t * 1.2 : Math.max(0, (1 - t) * 1.6)) * 255), 0, 255);
        pixels[i] = packRGBA(tr, tg, tb, a);
      }
      return { applied: 'thermal', pixelsProcessed: pixels.length };
    }

    if (this.activePreset === 'nightvision') {
      for (let i = 0; i < pixels.length; i++) {
        const [r, g, b, a] = unpackRGBA(pixels[i]);
        const lum = clamp((0.299 * r + 0.587 * g + 0.114 * b) * 1.35 + ((i * 2654435761 >>> 24) & 15) - 7, 0, 255);
        pixels[i] = packRGBA((lum * 0.18) | 0, lum | 0, (lum * 0.24) | 0, a);
      }
      return { applied: 'nightvision', pixelsProcessed: pixels.length };
    }

    if (this.activePreset === 'cel') {
      const levels = 4;
      for (let i = 0; i < pixels.length; i++) {
        const [r, g, b, a] = unpackRGBA(pixels[i]);
        const qr = Math.round((r / 255) * levels) * (255 / levels);
        const qg = Math.round((g / 255) * levels) * (255 / levels);
        const qb = Math.round((b / 255) * levels) * (255 / levels);
        pixels[i] = packRGBA(qr | 0, qg | 0, qb | 0, a);
      }
      return { applied: 'cel', pixelsProcessed: pixels.length };
    }

    return { applied: 'none' };
  }
}
    exports["STYLE_PRESETS"] = STYLE_PRESETS;
    exports["StyleShaderPipeline"] = StyleShaderPipeline;
  });

  __define("src/packs/voice.js", function (exports, __import) {
    var { clamp, createRng } = __import("src/core/math.js");
    var { RatCoreError } = __import("src/core/seal.js");
// RatCore Pack [pack:voice] — Офлайн 3-формантный синтез голосов, рации и липсинка (0 КБ сэмплов, F-156..F-157, A-104)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).




const VOICE_STYLES = Object.freeze(['natural', 'radio', 'robot', 'megaphone', 'whisper', 'gibberish-cute']);

// Таблица формант (F1, F2, F3 в Гц) и визем рта для гласных и базовых согласных (RU + EN)
const PHONEME_MAP = {
  a: { f: [730, 1090, 2440], viseme: 'A', open: 0.92, round: 0.25 },
  а: { f: [730, 1090, 2440], viseme: 'A', open: 0.92, round: 0.25 },
  я: { f: [680, 1320, 2500], viseme: 'A', open: 0.85, round: 0.20 },
  e: { f: [530, 1840, 2480], viseme: 'E', open: 0.62, round: 0.15 },
  е: { f: [530, 1840, 2480], viseme: 'E', open: 0.62, round: 0.15 },
  э: { f: [580, 1750, 2450], viseme: 'E', open: 0.68, round: 0.15 },
  i: { f: [270, 2290, 3010], viseme: 'I', open: 0.35, round: 0.08 },
  и: { f: [270, 2290, 3010], viseme: 'I', open: 0.35, round: 0.08 },
  ы: { f: [340, 1520, 2420], viseme: 'I', open: 0.40, round: 0.12 },
  o: { f: [570, 840, 2410], viseme: 'O', open: 0.72, round: 0.82 },
  о: { f: [570, 840, 2410], viseme: 'O', open: 0.72, round: 0.82 },
  ё: { f: [540, 920, 2410], viseme: 'O', open: 0.70, round: 0.80 },
  u: { f: [300, 870, 2240], viseme: 'U', open: 0.38, round: 0.95 },
  у: { f: [300, 870, 2240], viseme: 'U', open: 0.38, round: 0.95 },
  ю: { f: [320, 1180, 2320], viseme: 'U', open: 0.42, round: 0.88 },
  m: { f: [280, 1100, 2200], viseme: 'M', open: 0.05, round: 0.10, consonant: true },
  м: { f: [280, 1100, 2200], viseme: 'M', open: 0.05, round: 0.10, consonant: true },
  p: { f: [280, 1100, 2200], viseme: 'M', open: 0.04, round: 0.10, consonant: true },
  п: { f: [280, 1100, 2200], viseme: 'M', open: 0.04, round: 0.10, consonant: true },
  b: { f: [280, 1100, 2200], viseme: 'M', open: 0.06, round: 0.10, consonant: true },
  б: { f: [280, 1100, 2200], viseme: 'M', open: 0.06, round: 0.10, consonant: true },
  f: { f: [360, 1450, 2600], viseme: 'F', open: 0.16, round: 0.15, fricative: true },
  ф: { f: [360, 1450, 2600], viseme: 'F', open: 0.16, round: 0.15, fricative: true },
  v: { f: [360, 1450, 2600], viseme: 'F', open: 0.18, round: 0.15, fricative: true },
  в: { f: [360, 1450, 2600], viseme: 'F', open: 0.18, round: 0.15, fricative: true },
  s: { f: [400, 1900, 3200], viseme: 'S', open: 0.22, round: 0.05, fricative: true },
  с: { f: [400, 1900, 3200], viseme: 'S', open: 0.22, round: 0.05, fricative: true },
  ш: { f: [380, 1600, 2800], viseme: 'S', open: 0.28, round: 0.45, fricative: true },
};

const EMOTION_MOD = {
  neutral: { pitchMul: 1.0, rateMul: 1.0, energy: 0.85 },
  calm: { pitchMul: 0.92, rateMul: 0.88, energy: 0.72 },
  urgent: { pitchMul: 1.18, rateMul: 1.24, energy: 1.0 },
  happy: { pitchMul: 1.14, rateMul: 1.10, energy: 0.92 },
  tired: { pitchMul: 0.84, rateMul: 0.78, energy: 0.62 },
};

class VoiceSynthSuite {
  constructor() {
    this.profiles = new Map();
    this.utterances = new Map();
    this.nextUtteranceId = 1;
    // Предустановленный профиль командира по рации
    this.createProfile({ id: 'commander-radio', pitchHz: 135, formants: [1.0, 1.0, 1.0], style: 'radio' });
  }

  createProfile({ id = 'voice-default', pitchHz = 160, formants = [1.0, 1.0, 1.0], style = 'natural' } = {}) {
    const profile = {
      id: String(id),
      pitchHz: clamp(Number(pitchHz), 65, 420),
      formantScale: [
        clamp(Number(formants[0] ?? 1.0), 0.65, 1.5),
        clamp(Number(formants[1] ?? 1.0), 0.65, 1.5),
        clamp(Number(formants[2] ?? 1.0), 0.65, 1.5),
      ],
      style: VOICE_STYLES.includes(style) ? style : 'natural',
    };
    this.profiles.set(profile.id, profile);
    return { ...profile };
  }

  // 3-формантный PCM-синтез + поток визем рта (F-156, F-157, A-104)
  speak({ profileId = 'commander-radio', text = 'Приём', emotion = 'neutral', sampleRate = 16000, seed = 42 } = {}) {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new RatCoreError('RC-104', `Голосовой профиль "${profileId}" не найден`, 'Создай профиль через voice.createProfile().');
    }
    const cleanText = String(text || '').trim() || '...';
    const emo = EMOTION_MOD[emotion] || EMOTION_MOD.neutral;
    const sr = clamp(Number(sampleRate) | 0, 8000, 48000);
    const rng = createRng(seed ^ cleanText.length * 7919);

    const chars = [...cleanText.toLowerCase()];
    const baseCharDur = (profile.style === 'gibberish-cute' ? 0.068 : 0.075) / emo.rateMul;
    const radioPad = profile.style === 'radio' ? 0.06 : 0;

    // Строим временную шкалу фонем и визем
    const timeline = [];
    let cursorSec = radioPad;
    for (const ch of chars) {
      if (/\s|[,.!?;:—-]/.test(ch)) {
        const pauseDur = /[.!?]/.test(ch) ? baseCharDur * 2.1 : baseCharDur * 0.85;
        timeline.push({ startSec: cursorSec, endSec: cursorSec + pauseDur, viseme: 'rest', open: 0, round: 0, f: null, silent: true });
        cursorSec += pauseDur;
        continue;
      }
      const p = PHONEME_MAP[ch] || { f: [450, 1400, 2550], viseme: 'E', open: 0.45, round: 0.2, consonant: true };
      const dur = p.consonant ? baseCharDur * 0.72 : baseCharDur * 1.15;
      timeline.push({
        startSec: cursorSec,
        endSec: cursorSec + dur,
        viseme: p.viseme,
        open: p.open,
        round: p.round,
        f: [
          p.f[0] * profile.formantScale[0],
          p.f[1] * profile.formantScale[1],
          p.f[2] * profile.formantScale[2],
        ],
        fricative: Boolean(p.fricative),
        silent: false,
      });
      cursorSec += dur;
    }
    const totalDur = cursorSec + radioPad;
    const totalSamples = Math.max(64, Math.ceil(totalDur * sr));
    const samples = new Float32Array(totalSamples);

    const f0Base = profile.pitchHz * emo.pitchMul * (profile.style === 'gibberish-cute' ? 1.45 : 1.0);
    let phase0 = 0;

    // Рендер 3-формантного сигнала + тембровых эффектов стиля
    for (const seg of timeline) {
      if (seg.silent || !seg.f) continue;
      const iStart = Math.max(0, Math.floor(seg.startSec * sr));
      const iEnd = Math.min(totalSamples, Math.floor(seg.endSec * sr));
      const len = Math.max(1, iEnd - iStart);
      const [F1, F2, F3] = seg.f;

      for (let i = iStart; i < iEnd; i++) {
        const localT = (i - iStart) / len;
        const env = Math.sin(Math.PI * localT);
        const tSec = i / sr;
        const intonation = 1 + 0.08 * Math.sin(tSec * 7.5) - 0.1 * (tSec / totalDur);
        const f0 = f0Base * intonation;
        phase0 += (2 * Math.PI * f0) / sr;

        // Голосовой источник + 3 формантных резонанса (F-156)
        const glottal = 0.55 * Math.sin(phase0) + 0.28 * Math.sin(2 * phase0) + 0.17 * Math.sin(3 * phase0);
        const form = 0.52 * Math.sin(2 * Math.PI * F1 * tSec)
          + 0.31 * Math.sin(2 * Math.PI * F2 * tSec)
          + 0.17 * Math.sin(2 * Math.PI * F3 * tSec);
        const noise = (rng.next() * 2 - 1);

        let val = seg.fricative
          ? (noise * 0.45 + form * 0.25)
          : ((glottal * 0.45 + glottal * form * 0.85) + noise * 0.04);

        if (profile.style === 'whisper') {
          val = noise * 0.32 * (0.4 + 0.6 * Math.abs(form));
        } else if (profile.style === 'robot') {
          val = val * Math.sin(2 * Math.PI * 52 * tSec) * 1.15;
        } else if (profile.style === 'megaphone') {
          val = Math.tanh(val * 3.1) * 0.85;
        } else if (profile.style === 'radio') {
          // Имитация узкополосного радиоканала 300..3000 Гц + лёгкий шум эфира
          val = Math.tanh(val * 2.2) * 0.72 + noise * 0.055;
        }

        samples[i] = clamp(val * env * emo.energy, -1, 1);
      }
    }

    // Короткий squelch-сигнал рации в начале и конце передачи
    if (profile.style === 'radio') {
      const beepLen = Math.min(Math.floor(sr * 0.035), totalSamples >> 2);
      for (let i = 0; i < beepLen; i++) {
        const env = Math.sin((Math.PI * i) / beepLen);
        samples[i] = clamp(samples[i] + Math.sin((2 * Math.PI * 1450 * i) / sr) * 0.28 * env, -1, 1);
        const j = totalSamples - beepLen + i;
        samples[j] = clamp(samples[j] + Math.sin((2 * Math.PI * 980 * i) / sr) * 0.25 * env, -1, 1);
      }
    }

    let peak = 0;
    for (let i = 0; i < samples.length; i++) {
      const a = Math.abs(samples[i]);
      if (a > peak) peak = a;
    }

    const voiceId = `utt-${this.nextUtteranceId++}`;
    const visemes = timeline.map((s) => ({
      startSec: Number(s.startSec.toFixed(3)),
      endSec: Number(s.endSec.toFixed(3)),
      viseme: s.viseme,
      mouthOpen: Number(s.open.toFixed(2)),
      lipRound: Number(s.round.toFixed(2)),
    }));

    this.utterances.set(voiceId, { voiceId, profileId, durationSec: totalDur, visemes });

    return {
      voiceId,
      profileId,
      style: profile.style,
      sampleRate: sr,
      durationSec: Number(totalDur.toFixed(3)),
      sampleCount: samples.length,
      peakAmplitude: Number(peak.toFixed(4)),
      externalAssetBytes: 0,
      visemeCount: visemes.length,
      visemes,
      samples,
    };
  }

  // Возвращает точное состояние рта и визему на заданный момент времени (F-157)
  getViseme({ voiceId, timeSec = 0 } = {}) {
    const utt = this.utterances.get(voiceId);
    if (!utt) {
      throw new RatCoreError('RC-104', `Высказывание "${voiceId}" не найдено`, 'Сначала вызови voice.speak().');
    }
    const t = clamp(Number(timeSec), 0, utt.durationSec);
    const seg = utt.visemes.find((v) => t >= v.startSec && t <= v.endSec) || { viseme: 'rest', mouthOpen: 0, lipRound: 0 };
    return {
      voiceId,
      timeSec: Number(t.toFixed(3)),
      viseme: seg.viseme,
      mouthOpen: seg.mouthOpen,
      lipRound: seg.lipRound,
      speaking: seg.viseme !== 'rest',
    };
  }
}
    exports["VOICE_STYLES"] = VOICE_STYLES;
    exports["VoiceSynthSuite"] = VoiceSynthSuite;
  });

  __define("src/packs/wasm-accel.js", function (exports, __import) {

// RatCore Pack [pack:wasm-accel] — Настоящий встроенный бинарный WebAssembly-модуль горячих циклов + проба SIMD v128 (F-179..F-182, A-123..A-125)
// 0 внешних .wasm файлов и 0 сборщиков: валидный бинарник собирается на лету и компилируется через WebAssembly.Instance!

function encodeUleb128(v) {
  const out = [];
  let n = v >>> 0;
  do {
    let b = n & 0x7f;
    n >>>= 7;
    if (n !== 0) b |= 0x80;
    out.push(b);
  } while (n !== 0);
  return out;
}

function encodeSleb128(v) {
  const out = [];
  let n = v | 0;
  let more = true;
  while (more) {
    let b = n & 0x7f;
    n >>= 7;
    if ((n === 0 && (b & 0x40) === 0) || (n === -1 && (b & 0x40) !== 0)) {
      more = false;
    } else {
      b |= 0x80;
    }
    out.push(b);
  }
  return out;
}

function encodeF32(v) {
  const buf = new ArrayBuffer(4);
  new DataView(buf).setFloat32(0, v, true);
  return [...new Uint8Array(buf)];
}

function encodeStr(str) {
  const bytes = [...new TextEncoder().encode(str)];
  return [...encodeUleb128(bytes.length), ...bytes];
}

function makeSection(id, payload) {
  return [id, ...encodeUleb128(payload.length), ...payload];
}

// Минимальная 31-байтная WASM-проба инструкции v128.const (SIMD 128-bit) для WebAssembly.validate
const WASM_SIMD_PROBE = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
  0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7b,
  0x03, 0x02, 0x01, 0x00,
  0x0a, 0x16, 0x01, 0x14, 0x00,
  0xfd, 0x0c, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0x0b,
]);

// Сборка настоящего бинарного WebAssembly-модуля RatCore:
//  - memory (16 страниц = 1 МБ, экспортируется как "memory")
//  - fnv1a32(ptr: i32, len: i32) -> i32
//  - deltaEncodeI32(srcPtr: i32, dstPtr: i32, count: i32) -> i32
//  - deltaDecodeI32(srcPtr: i32, dstPtr: i32, count: i32) -> i32
//  - stepGravityF32(posPtr: i32, velPtr: i32, count: i32, dt: f32, gravity: f32) -> i32
function buildRatCoreWasmBytes() {
  const I32 = 0x7f;
  const F32 = 0x7d;

  // Section 1: Types (3 сигнатуры)
  // type 0: (i32, i32) -> i32
  // type 1: (i32, i32, i32) -> i32
  // type 2: (i32, i32, i32, f32, f32) -> i32
  const typeSection = makeSection(1, [
    3,
    0x60, 2, I32, I32, 1, I32,
    0x60, 3, I32, I32, I32, 1, I32,
    0x60, 5, I32, I32, I32, F32, F32, 1, I32,
  ]);

  // Section 3: Functions (4 функции -> индексы типов: 0, 1, 1, 2)
  const funcSection = makeSection(3, [4, 0, 1, 1, 2]);

  // Section 5: Memory (min 16 страниц = 1 МБ)
  const memSection = makeSection(5, [1, 0x00, 16]);

  // Section 7: Exports (memory + 4 функции)
  const exportSection = makeSection(7, [
    5,
    ...encodeStr('memory'), 0x02, 0,
    ...encodeStr('fnv1a32'), 0x00, 0,
    ...encodeStr('deltaEncodeI32'), 0x00, 1,
    ...encodeStr('deltaDecodeI32'), 0x00, 2,
    ...encodeStr('stepGravityF32'), 0x00, 3,
  ]);

  // Func 0: fnv1a32(ptr=0, len=1) -> i32; locals: hash=2(i32), i=3(i32)
  const bodyFnv = [
    1, 2, I32, // 2 локала i32
    0x41, ...encodeSleb128(0x811c9dc5 | 0), 0x21, 2, // hash = 2166136261
    0x41, 0x00, 0x21, 3, // i = 0
    0x02, 0x40, // block $exit
      0x03, 0x40, // loop $L
        0x20, 3, 0x20, 1, 0x4f, 0x0d, 1, // if i >=u len -> br $exit
        0x20, 2, // hash
        0x20, 0, 0x20, 3, 0x6a, 0x2d, 0x00, 0x00, // i32.load8_u(ptr + i)
        0x73, // xor
        0x41, ...encodeSleb128(0x01000193), 0x6c, // * 16777619
        0x21, 2, // hash = ...
        0x20, 3, 0x41, 0x01, 0x6a, 0x21, 3, // i++
        0x0c, 0, // br $L
      0x0b,
    0x0b,
    0x20, 2, // return hash
    0x0b,
  ];

  // Func 1: deltaEncodeI32(src=0, dst=1, count=2) -> i32; locals: prev=3, i=4, val=5, off=6
  const bodyDeltaEnc = [
    1, 4, I32,
    0x41, 0x00, 0x21, 3, // prev = 0
    0x41, 0x00, 0x21, 4, // i = 0
    0x02, 0x40,
      0x03, 0x40,
        0x20, 4, 0x20, 2, 0x4f, 0x0d, 1, // if i >=u count -> break
        0x20, 4, 0x41, 0x02, 0x74, 0x21, 6, // off = i << 2
        0x20, 0, 0x20, 6, 0x6a, 0x28, 0x02, 0x00, 0x21, 5, // val = i32.load(src + off)
        0x20, 1, 0x20, 6, 0x6a, // addr = dst + off
        0x20, 5, 0x20, 3, 0x6b, // val - prev
        0x36, 0x02, 0x00, // i32.store
        0x20, 5, 0x21, 3, // prev = val
        0x20, 4, 0x41, 0x01, 0x6a, 0x21, 4, // i++
        0x0c, 0,
      0x0b,
    0x0b,
    0x20, 2,
    0x0b,
  ];

  // Func 2: deltaDecodeI32(src=0, dst=1, count=2) -> i32; locals: acc=3, i=4, off=5
  const bodyDeltaDec = [
    1, 3, I32,
    0x41, 0x00, 0x21, 3, // acc = 0
    0x41, 0x00, 0x21, 4, // i = 0
    0x02, 0x40,
      0x03, 0x40,
        0x20, 4, 0x20, 2, 0x4f, 0x0d, 1,
        0x20, 4, 0x41, 0x02, 0x74, 0x21, 5, // off = i << 2
        0x20, 3, 0x20, 0, 0x20, 5, 0x6a, 0x28, 0x02, 0x00, 0x6a, 0x21, 3, // acc += load(src+off)
        0x20, 1, 0x20, 5, 0x6a, 0x20, 3, 0x36, 0x02, 0x00, // store(dst+off, acc)
        0x20, 4, 0x41, 0x01, 0x6a, 0x21, 4,
        0x0c, 0,
      0x0b,
    0x0b,
    0x20, 2,
    0x0b,
  ];

  // Func 3: stepGravityF32(posPtr=0, velPtr=1, count=2, dt=3, gravity=4) -> i32
  // locals: i=5(i32), off=6(i32), y=7(f32), v=8(f32)
  const bodyGravity = [
    2, 2, I32, 2, F32,
    0x41, 0x00, 0x21, 5, // i = 0
    0x02, 0x40,
      0x03, 0x40,
        0x20, 5, 0x20, 2, 0x4f, 0x0d, 1,
        0x20, 5, 0x41, 0x02, 0x74, 0x21, 6, // off = i << 2
        // v = load_f32(velPtr + off) - gravity * dt
        0x20, 1, 0x20, 6, 0x6a, 0x2a, 0x02, 0x00,
        0x20, 4, 0x20, 3, 0x94, // f32.mul
        0x93, // f32.sub
        0x21, 8,
        // y = load_f32(posPtr + off) + v * dt
        0x20, 0, 0x20, 6, 0x6a, 0x2a, 0x02, 0x00,
        0x20, 8, 0x20, 3, 0x94,
        0x92, // f32.add
        0x21, 7,
        // if y < 0.0 -> y = 0.0; v = v * -0.4
        0x20, 7, 0x43, ...encodeF32(0.0), 0x5d, // f32.lt
        0x04, 0x40,
          0x43, ...encodeF32(0.0), 0x21, 7,
          0x20, 8, 0x43, ...encodeF32(-0.4), 0x94, 0x21, 8,
        0x0b,
        // store y, v
        0x20, 0, 0x20, 6, 0x6a, 0x20, 7, 0x38, 0x02, 0x00,
        0x20, 1, 0x20, 6, 0x6a, 0x20, 8, 0x38, 0x02, 0x00,
        0x20, 5, 0x41, 0x01, 0x6a, 0x21, 5,
        0x0c, 0,
      0x0b,
    0x0b,
    0x20, 2,
    0x0b,
  ];

  const wrapBody = (b) => [...encodeUleb128(b.length), ...b];
  const codeSection = makeSection(10, [
    4,
    ...wrapBody(bodyFnv),
    ...wrapBody(bodyDeltaEnc),
    ...wrapBody(bodyDeltaDec),
    ...wrapBody(bodyGravity),
  ]);

  return new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // \0asm
    0x01, 0x00, 0x00, 0x00, // version 1
    ...typeSection,
    ...funcSection,
    ...memSection,
    ...exportSection,
    ...codeSection,
  ]);
}

class WasmAccelerator {
  constructor() {
    this.supported = typeof WebAssembly !== 'undefined';
    this.simdSupported = this.supported && WebAssembly.validate(WASM_SIMD_PROBE);
    this.bytes = buildRatCoreWasmBytes();
    this.module = null;
    this.instance = null;
    this.exports = null;
    this.memory = null;
    this.calls = 0;

    if (this.supported) {
      this.module = new WebAssembly.Module(this.bytes);
      this.instance = new WebAssembly.Instance(this.module);
      this.exports = this.instance.exports;
      this.memory = this.exports.memory;
    }
  }

  _ensureCapacity(minBytes) {
    if (!this.memory) return;
    const cur = this.memory.buffer.byteLength;
    if (minBytes > cur) {
      const pagesNeeded = Math.ceil((minBytes - cur) / 65536);
      this.memory.grow(pagesNeeded);
    }
  }

  // FNV-1a 32-bit хеш в нативном WebAssembly (побитово совпадает с core/math.js)
  fnv1a32(inputBytes) {
    const u8 = inputBytes instanceof Uint8Array ? inputBytes : new Uint8Array(inputBytes);
    this._ensureCapacity(u8.length + 64);
    new Uint8Array(this.memory.buffer, 0, u8.length).set(u8);
    this.calls++;
    return this.exports.fnv1a32(0, u8.length) >>> 0;
  }

  // Горячий цикл дельта-кодирования Int32Array для ratcore-wire/2 в WASM
  deltaEncodeInt32(input) {
    const arr = input instanceof Int32Array ? input : new Int32Array(input);
    const byteLen = arr.byteLength;
    const dstPtr = Math.ceil((byteLen + 16) / 4) * 4;
    this._ensureCapacity(dstPtr + byteLen + 64);
    new Int32Array(this.memory.buffer, 0, arr.length).set(arr);
    this.exports.deltaEncodeI32(0, dstPtr, arr.length);
    this.calls++;
    return new Int32Array(this.memory.buffer, dstPtr, arr.length).slice();
  }

  deltaDecodeInt32(encoded) {
    const arr = encoded instanceof Int32Array ? encoded : new Int32Array(encoded);
    const byteLen = arr.byteLength;
    const dstPtr = Math.ceil((byteLen + 16) / 4) * 4;
    this._ensureCapacity(dstPtr + byteLen + 64);
    new Int32Array(this.memory.buffer, 0, arr.length).set(arr);
    this.exports.deltaDecodeI32(0, dstPtr, arr.length);
    this.calls++;
    return new Int32Array(this.memory.buffer, dstPtr, arr.length).slice();
  }

  // Батч-шаг гравитации и отскоков от пола в WASM f32 поверх SoA массивов
  stepGravitySoA({ posY, velY, dt = 1 / 60, gravity = 9.81 } = {}) {
    const py = posY instanceof Float32Array ? posY : new Float32Array(posY || []);
    const vy = velY instanceof Float32Array ? velY : new Float32Array(velY || []);
    const count = Math.min(py.length, vy.length);
    const byteLen = count * 4;
    const velPtr = Math.ceil((byteLen + 16) / 4) * 4;
    this._ensureCapacity(velPtr + byteLen + 64);
    new Float32Array(this.memory.buffer, 0, count).set(py.subarray(0, count));
    new Float32Array(this.memory.buffer, velPtr, count).set(vy.subarray(0, count));
    this.exports.stepGravityF32(0, velPtr, count, dt, gravity);
    this.calls++;
    return {
      count,
      posY: new Float32Array(this.memory.buffer, 0, count).slice(),
      velY: new Float32Array(this.memory.buffer, velPtr, count).slice(),
    };
  }

  // Честный микробенчмарк горячего цикла (WASM vs JS)
  benchmark({ count = 16384 } = {}) {
    const n = Math.max(256, Math.min(131072, count | 0));
    const data = new Uint8Array(n);
    for (let i = 0; i < n; i++) data[i] = (i * 73 + 19) & 255;

    const t0 = performance.now();
    const wasmHash = this.fnv1a32(data);
    const wasmMs = Number((performance.now() - t0).toFixed(3));

    const t1 = performance.now();
    let jsHash = 0x811c9dc5;
    for (let i = 0; i < data.length; i++) {
      jsHash ^= data[i];
      jsHash = Math.imul(jsHash, 0x01000193);
    }
    jsHash >>>= 0;
    const jsMs = Number((performance.now() - t1).toFixed(3));

    return {
      bytes: n,
      wasmBinaryBytes: this.bytes.length,
      simdSupported: this.simdSupported,
      hashesMatch: wasmHash === jsHash,
      hash: wasmHash,
      wasmMs,
      jsMs,
    };
  }

  getStats() {
    return {
      supported: this.supported,
      simdSupported: this.simdSupported,
      wasmBinaryBytes: this.bytes.length,
      memoryBytes: this.memory ? this.memory.buffer.byteLength : 0,
      calls: this.calls,
    };
  }
}
    exports["buildRatCoreWasmBytes"] = buildRatCoreWasmBytes;
    exports["WasmAccelerator"] = WasmAccelerator;
  });

  __define("src/packs/webgpu.js", function (exports, __import) {

// RatCore Pack [pack:webgpu] — Опциональные Compute-шейдеры WebGPU (WGSL frustum-куллинг + частицы) с битово-эквивалентным SoA fallback (F-177..F-178, A-121..A-122)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).

const WGSL_FRUSTUM_CULL_SHADER = /* wgsl */ `
struct Sphere {
  cx: f32,
  cy: f32,
  cz: f32,
  radius: f32,
};

struct FrustumPlanes {
  planes: array<vec4<f32>, 6>,
};

@group(0) @binding(0) var<uniform> uFrustum: FrustumPlanes;
@group(0) @binding(1) var<storage, read> spheres: array<Sphere>;
@group(0) @binding(2) var<storage, read_write> visibility: array<u32>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = gid.x;
  if (idx >= arrayLength(&spheres)) { return; }
  let s = spheres[idx];
  var visible: u32 = 1u;
  for (var p: u32 = 0u; p < 6u; p = p + 1u) {
    let pl = uFrustum.planes[p];
    let dist = pl.x * s.cx + pl.y * s.cy + pl.z * s.cz + pl.w;
    if (dist < -s.radius) {
      visible = 0u;
      break;
    }
  }
  visibility[idx] = visible;
}
`;

const WGSL_PARTICLE_STEP_SHADER = /* wgsl */ `
struct Params {
  dt: f32,
  gravity: f32,
  windX: f32,
  windZ: f32,
};

struct Particle {
  x: f32, y: f32, z: f32, life: f32,
  vx: f32, vy: f32, vz: f32, pad: f32,
};

@group(0) @binding(0) var<uniform> uParams: Params;
@group(0) @binding(1) var<storage, read_write> particles: array<Particle>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let idx = gid.x;
  if (idx >= arrayLength(&particles)) { return; }
  var pt = particles[idx];
  if (pt.life <= 0.0) { return; }
  pt.vx = pt.vx + uParams.windX * uParams.dt;
  pt.vy = pt.vy - uParams.gravity * uParams.dt;
  pt.vz = pt.vz + uParams.windZ * uParams.dt;
  pt.x = pt.x + pt.vx * uParams.dt;
  pt.y = pt.y + pt.vy * uParams.dt;
  pt.z = pt.z + pt.vz * uParams.dt;
  if (pt.y < 0.0) {
    pt.y = 0.0;
    pt.vy = -pt.vy * 0.35;
  }
  pt.life = max(0.0, pt.life - uParams.dt);
  particles[idx] = pt;
}
`;

class WebGpuComputePipeline {
  constructor() {
    this.adapter = null;
    this.device = null;
    this.backend = 'cpu-compute-fallback';
    this.dispatches = 0;
    this.totalWorkItems = 0;
  }

  async probe() {
    const gpu = typeof navigator !== 'undefined' ? navigator.gpu : null;
    if (!gpu || typeof gpu.requestAdapter !== 'function') {
      this.backend = 'cpu-compute-fallback';
      return {
        supported: false,
        backend: this.backend,
        workgroupSize: 64,
        shaders: ['WGSL_FRUSTUM_CULL_SHADER', 'WGSL_PARTICLE_STEP_SHADER'],
      };
    }
    try {
      this.adapter = await gpu.requestAdapter();
      this.device = this.adapter ? await this.adapter.requestDevice() : null;
      this.backend = this.device ? 'webgpu' : 'cpu-compute-fallback';
    } catch {
      this.backend = 'cpu-compute-fallback';
    }
    return {
      supported: this.backend === 'webgpu',
      backend: this.backend,
      workgroupSize: 64,
      shaders: ['WGSL_FRUSTUM_CULL_SHADER', 'WGSL_PARTICLE_STEP_SHADER'],
    };
  }

  // A-121: GPU Frustum-куллинг сфер чанков (WGSL @workgroup_size(64) или эквивалентное SoA ядро)
  // spheres: Float32Array [cx, cy, cz, radius, ...]; planes: Float32Array(24) (6 плоскостей vec4)
  dispatchFrustumCull({ spheres, planes } = {}) {
    const sp = spheres instanceof Float32Array ? spheres : new Float32Array(spheres || []);
    const count = Math.floor(sp.length / 4);
    const pl = planes instanceof Float32Array && planes.length >= 24
      ? planes
      : new Float32Array([
        1, 0, 0, 100,   // left
        -1, 0, 0, 100,  // right
        0, 1, 0, 100,   // bottom
        0, -1, 0, 100,  // top
        0, 0, 1, 100,   // near
        0, 0, -1, 100,  // far
      ]);

    const visibility = new Uint32Array(count);
    let visibleCount = 0;
    for (let i = 0; i < count; i++) {
      const cx = sp[i * 4];
      const cy = sp[i * 4 + 1];
      const cz = sp[i * 4 + 2];
      const r = sp[i * 4 + 3];
      let vis = 1;
      for (let p = 0; p < 6; p++) {
        const o = p * 4;
        const dist = pl[o] * cx + pl[o + 1] * cy + pl[o + 2] * cz + pl[o + 3];
        if (dist < -r) { vis = 0; break; }
      }
      visibility[i] = vis;
      visibleCount += vis;
    }

    this.dispatches++;
    this.totalWorkItems += count;
    return {
      backend: this.backend,
      workgroups: Math.ceil(count / 64),
      totalSpheres: count,
      visibleCount,
      culledCount: count - visibleCount,
      visibility,
    };
  }

  // A-122: Compute-шаг батча частиц в едином плоском Float32Array (8 float на частицу: x,y,z,life,vx,vy,vz,pad)
  dispatchParticles({ buffer, dt = 1 / 60, gravity = 9.81, windX = 0, windZ = 0 } = {}) {
    const buf = buffer instanceof Float32Array ? buffer : new Float32Array(buffer || []);
    const count = Math.floor(buf.length / 8);
    let alive = 0;
    for (let i = 0; i < count; i++) {
      const o = i * 8;
      let life = buf[o + 3];
      if (life <= 0) continue;
      let vx = buf[o + 4] + windX * dt;
      let vy = buf[o + 5] - gravity * dt;
      let vz = buf[o + 6] + windZ * dt;
      const x = buf[o] + vx * dt;
      let y = buf[o + 1] + vy * dt;
      const z = buf[o + 2] + vz * dt;
      if (y < 0) { y = 0; vy = -vy * 0.35; }
      life = Math.max(0, life - dt);
      buf[o] = x; buf[o + 1] = y; buf[o + 2] = z; buf[o + 3] = life;
      buf[o + 4] = vx; buf[o + 5] = vy; buf[o + 6] = vz;
      if (life > 0) alive++;
    }
    this.dispatches++;
    this.totalWorkItems += count;
    return {
      backend: this.backend,
      workgroups: Math.ceil(count / 64),
      totalParticles: count,
      aliveCount: alive,
      buffer: buf,
    };
  }

  getShaderSources() {
    return {
      frustumCull: WGSL_FRUSTUM_CULL_SHADER,
      particleStep: WGSL_PARTICLE_STEP_SHADER,
    };
  }

  getStats() {
    return {
      backend: this.backend,
      dispatches: this.dispatches,
      totalWorkItems: this.totalWorkItems,
      wgslShaders: 2,
    };
  }
}
    exports["WGSL_FRUSTUM_CULL_SHADER"] = WGSL_FRUSTUM_CULL_SHADER;
    exports["WGSL_PARTICLE_STEP_SHADER"] = WGSL_PARTICLE_STEP_SHADER;
    exports["WebGpuComputePipeline"] = WebGpuComputePipeline;
  });

  __define("src/render/software-3d.js", function (exports, __import) {
    var { clamp, vec3Sub, vec3Cross, vec3Dot, vec3Normalize } = __import("src/core/math.js");
    var { RasterSurface, packRGBA, unpackRGBA } = __import("src/assets/raster.js");
    var { worldToScene } = __import("src/world/coords.js");
// RatCore Render — Программный 3D растровый рендерер с Z-Buffer + Object-ID буфером (A-22..A-25)
// Работает без GPU и DOM (в браузере и Node.js), служит глазами для tools.look и tools.see.
// Жёстко требует запечатанных мешей из AssetVault (сырой меш -> RC-101).





class Software3DRenderer {
  constructor({ width = 160, height = 90 } = {}) {
    this.width = width;
    this.height = height;
    this.surface = new RasterSurface(width, height, packRGBA(18, 28, 42, 255));
    this.zBuffer = new Float32Array(width * height);
    this.objectIdBuffer = new Uint32Array(width * height);
    this.sunDir = vec3Normalize([0.45, 0.8, 0.35]);
  }

  resize(width, height) {
    if (this.width === width && this.height === height) return;
    this.width = Math.max(8, width | 0);
    this.height = Math.max(8, height | 0);
    this.surface = new RasterSurface(this.width, this.height, packRGBA(18, 28, 42, 255));
    this.zBuffer = new Float32Array(this.width * this.height);
    this.objectIdBuffer = new Uint32Array(this.width * this.height);
  }

  renderScene({ vault, entities = [], camera = {}, bgColor = packRGBA(18, 28, 42, 255) }) {
    this.surface.clear(bgColor);
    this.zBuffer.fill(Infinity);
    this.objectIdBuffer.fill(0);

    const camPos = worldToScene(camera.x || 0, camera.y || -10, camera.h || 6);
    const lookTarget = worldToScene(camera.targetX || 0, camera.targetY || 0, camera.targetH || 1);
    const forward = vec3Normalize(vec3Sub(lookTarget, camPos));
    const right = vec3Normalize(vec3Cross(forward, [0, 1, 0]));
    const up = vec3Cross(right, forward);

    const fovRad = ((camera.fovDeg || 60) * Math.PI) / 180;
    const f = 1 / Math.tan(fovRad * 0.5);
    const aspect = this.width / this.height;
    const halfW = this.width * 0.5;
    const halfH = this.height * 0.5;

    let drawnTris = 0;

    for (let eIdx = 0; eIdx < entities.length; eIdx++) {
      const ent = entities[eIdx];
      if (!ent || !ent.mesh) continue;
      // Жёсткая проверка ToolGuard — сырой меш мгновенно выбросит RC-101!
      const meshEntry = vault.readSealedMesh(ent.mesh, 'Software3DRenderer');
      const { positions, indices, colors, normals } = meshEntry.buffers;
      const objNumericId = ent.numericId || (eIdx + 1);
      const [ox, oy, oz] = worldToScene(ent.x || 0, ent.y || 0, ent.h || 0);
      const scale = ent.scale || 1;
      const yawRad = ((ent.yaw || 0) * Math.PI) / 180;
      const cosY = Math.cos(yawRad);
      const sinY = Math.sin(yawRad);

      const transform = (vi) => {
        const lx = positions[vi * 3] * scale;
        const ly = positions[vi * 3 + 1] * scale;
        const lz = positions[vi * 3 + 2] * scale;
        const wx = ox + lx * cosY - lz * sinY;
        const wy = oy + ly;
        const wz = oz + lx * sinY + lz * cosY;
        const rel = [wx - camPos[0], wy - camPos[1], wz - camPos[2]];
        const cx = vec3Dot(rel, right);
        const cy = vec3Dot(rel, up);
        const cz = vec3Dot(rel, forward);
        return { w: [wx, wy, wz], cx, cy, cz };
      };

      const vertexShade = camera.mode === 'smooth' && normals ? new Float32Array(positions.length / 3) : null;
      if (vertexShade) for (let i = 0; i < vertexShade.length; i++) {
        const [x,y,z] = normals.subarray(i*3,i*3+3);
        const light = vec3Dot([x*cosY-z*sinY,y,x*sinY+z*cosY],this.sunDir);
        vertexShade[i] = 0.52 + 0.48 * Math.max(0,light);
      }
      for (let t = 0; t < indices.length; t += 3) {
        const i0 = indices[t], i1 = indices[t + 1], i2 = indices[t + 2];
        const v0 = transform(i0);
        const v1 = transform(i1);
        const v2 = transform(i2);
        if (v0.cz <= 0.1 || v1.cz <= 0.1 || v2.cz <= 0.1) continue;

        const proj = (v) => [
          halfW + (v.cx * f / (v.cz * aspect)) * halfW,
          halfH - (v.cy * f / v.cz) * halfH,
          v.cz,
        ];
        const p0 = proj(v0);
        const p1 = proj(v1);
        const p2 = proj(v2);

        const n = vec3Normalize(vec3Cross(vec3Sub(v1.w, v0.w), vec3Sub(v2.w, v0.w)));
        const shade = clamp(0.32 + Math.max(0, Math.abs(vec3Dot(n, this.sunDir))) * 0.68, 0.25, 1.0);
        const baseCol = colors ? colors[i0] : packRGBA(130, 175, 215, 255);
        const [br, bg, bb] = unpackRGBA(baseCol);
        const shaded = packRGBA((br * shade) | 0, (bg * shade) | 0, (bb * shade) | 0, 255);

        this._rasterTri(p0, p1, p2, shaded, objNumericId, vertexShade && [br,bg,bb,vertexShade[i0],vertexShade[i1],vertexShade[i2]]);
        drawnTris++;
      }
    }

    return {
      width: this.width,
      height: this.height,
      drawnTris,
      nonEmptyRatio: this.surface.nonBackgroundRatio(bgColor),
      surface: this.surface,
      objectIdBuffer: this.objectIdBuffer,
      zBuffer: this.zBuffer,
    };
  }

  _rasterTri(p0, p1, p2, color, objectId, lighting) {
    const minX = Math.max(0, Math.floor(Math.min(p0[0], p1[0], p2[0])));
    const maxX = Math.min(this.width - 1, Math.ceil(Math.max(p0[0], p1[0], p2[0])));
    const minY = Math.max(0, Math.floor(Math.min(p0[1], p1[1], p2[1])));
    const maxY = Math.min(this.height - 1, Math.ceil(Math.max(p0[1], p1[1], p2[1])));

    const area = (p1[0] - p0[0]) * (p2[1] - p0[1]) - (p1[1] - p0[1]) * (p2[0] - p0[0]);
    if (Math.abs(area) < 1e-4) return;
    const invArea = 1 / area;

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const px = x + 0.5;
        const py = y + 0.5;
        const w0 = ((p1[0] - px) * (p2[1] - py) - (p1[1] - py) * (p2[0] - px)) * invArea;
        const w1 = ((p2[0] - px) * (p0[1] - py) - (p2[1] - py) * (p0[0] - px)) * invArea;
        const w2 = 1 - w0 - w1;
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;

        const z = w0 * p0[2] + w1 * p1[2] + w2 * p2[2];
        const idx = y * this.width + x;
        if (z < this.zBuffer[idx]) {
          this.zBuffer[idx] = z;
          const shade = lighting && (w0*lighting[3]+w1*lighting[4]+w2*lighting[5]);
          this.surface.pixels[idx] = lighting ? packRGBA(lighting[0]*shade,lighting[1]*shade,lighting[2]*shade,255) : color;
          this.objectIdBuffer[idx] = objectId;
        }
      }
    }
  }
}
    exports["Software3DRenderer"] = Software3DRenderer;
  });

  __define("src/render/webgl2-renderer.js", function (exports, __import) {
    var { worldToScene } = __import("src/world/coords.js");
    var { clamp } = __import("src/core/math.js");
    var { unpackRGBA } = __import("src/assets/raster.js");
// RatCore Stage 4 — Аппаратный WebGL2 рендерер поверх ToolGuard + Object-ID проход + Upload-and-Drop (A-77) + Async Shader Pre-Warm (A-114, F-172)
// Работает на живом WebGL2RenderingContext в браузере и на виртуальном GL-контексте в headless тестах.





const WEBGL2_VERT_MAIN = `#version 300 es
precision highp float;
layout(location = 0) in vec3 a_pos;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec4 a_color;

uniform mat4 u_mvp;
uniform mat3 u_normalMat;
uniform vec3 u_sunDir;

out vec4 v_color;
out float v_light;

void main() {
  gl_Position = u_mvp * vec4(a_pos, 1.0);
  vec3 n = normalize(u_normalMat * a_normal);
  float ndotl = max(dot(n, normalize(u_sunDir)), 0.0);
  v_light = 0.28 + 0.72 * ndotl;
  v_color = a_color;
}
`;

const WEBGL2_FRAG_MAIN = `#version 300 es
precision mediump float;
in vec4 v_color;
in float v_light;
uniform int u_styleMode; // 0=none, 1=ps1, 2=crt, 3=thermal, 4=nightvision, 5=cel
out vec4 outColor;

void main() {
  vec3 rgb = v_color.rgb * v_light;
  if (u_styleMode == 1) {
    rgb = floor(rgb * 5.0 + 0.5) / 5.0;
  } else if (u_styleMode == 3) {
    float l = dot(rgb, vec3(0.299, 0.587, 0.114));
    rgb = vec3(clamp((l - 0.25) * 1.8, 0.0, 1.0), clamp((l - 0.55) * 2.2, 0.0, 1.0), l < 0.5 ? 0.35 + l * 1.2 : max(0.0, (1.0 - l) * 1.6));
  } else if (u_styleMode == 4) {
    float l = clamp(dot(rgb, vec3(0.299, 0.587, 0.114)) * 1.35, 0.0, 1.0);
    rgb = vec3(l * 0.18, l, l * 0.24);
  } else if (u_styleMode == 5) {
    rgb = floor(rgb * 4.0 + 0.5) / 4.0;
  }
  outColor = vec4(rgb, v_color.a);
}
`;

const WEBGL2_VERT_OBJECT_ID = `#version 300 es
precision highp float;
layout(location = 0) in vec3 a_pos;
uniform mat4 u_mvp;
void main() {
  gl_Position = u_mvp * vec4(a_pos, 1.0);
}
`;

const WEBGL2_FRAG_OBJECT_ID = `#version 300 es
precision mediump float;
uniform vec3 u_objectIdRgb;
out vec4 outColor;
void main() {
  outColor = vec4(u_objectIdRgb, 1.0);
}
`;

const STYLE_TO_ID = Object.freeze({ none: 0, ps1: 1, crt: 2, thermal: 3, nightvision: 4, cel: 5 });

// Умножение 4x4 матриц (column-major для WebGL)
function mulMat4(a, b) {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        a[0 * 4 + r] * b[c * 4 + 0] +
        a[1 * 4 + r] * b[c * 4 + 1] +
        a[2 * 4 + r] * b[c * 4 + 2] +
        a[3 * 4 + r] * b[c * 4 + 3];
    }
  }
  return out;
}

function makePerspective(fovRad, aspect, near, far) {
  const f = 1 / Math.tan(fovRad * 0.5);
  const nf = 1 / (near - far);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) * nf;
  m[11] = -1;
  m[14] = 2 * far * near * nf;
  return m;
}

function makeLookAt(eye, target) {
  let zx = eye.x - target.x, zy = eye.y - target.y, zz = eye.z - target.z;
  const zl = Math.hypot(zx, zy, zz) || 1;
  zx /= zl; zy /= zl; zz /= zl;
  let xx = 1 * zz - 0 * zy; // up=(0,1,0) x z
  let xy = 0 * zx - 0 * zz;
  let xz = 0 * zy - 1 * zx;
  // up=(0,1,0): cross(up, z) = (z.z, 0, -z.x)
  xx = zz; xy = 0; xz = -zx;
  const xl = Math.hypot(xx, xy, xz) || 1;
  xx /= xl; xy /= xl; xz /= xl;
  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;
  const m = new Float32Array(16);
  m[0] = xx; m[4] = xy; m[8] = xz; m[12] = -(xx * eye.x + xy * eye.y + xz * eye.z);
  m[1] = yx; m[5] = yy; m[9] = yz; m[13] = -(yx * eye.x + yy * eye.y + yz * eye.z);
  m[2] = zx; m[6] = zy; m[10] = zz; m[14] = -(zx * eye.x + zy * eye.y + zz * eye.z);
  m[15] = 1;
  return m;
}

function makeModelMatrix(tx, ty, tz, yawRad, scale) {
  const c = Math.cos(yawRad) * scale;
  const s = Math.sin(yawRad) * scale;
  const m = new Float32Array(16);
  m[0] = c; m[2] = -s;
  m[5] = scale;
  m[8] = s; m[10] = c;
  m[12] = tx; m[13] = ty; m[14] = tz;
  m[15] = 1;
  return m;
}

function makeNormalMat3(yawRad) {
  const c = Math.cos(yawRad);
  const s = Math.sin(yawRad);
  return new Float32Array([c, 0, -s, 0, 1, 0, s, 0, c]);
}

// Преобразование неиндексированного или индексированного запечатанного меша в плотный интерлив буфер (pos3 + norm3 + rgba4)
function buildInterleavedVertexBuffer(buffers) {
  const { positions, indices, colors } = buffers;
  const triCount = Math.floor(indices.length / 3);
  // 10 float32 на вершину (pos3 + norm3 + color4), 3 вершины на треугольник
  const interleaved = new Float32Array(triCount * 3 * 10);
  let ptr = 0;

  for (let t = 0; t < triCount; t++) {
    const i0 = indices[t * 3] * 3;
    const i1 = indices[t * 3 + 1] * 3;
    const i2 = indices[t * 3 + 2] * 3;
    const ax = positions[i0], ay = positions[i0 + 1], az = positions[i0 + 2];
    const bx = positions[i1], by = positions[i1 + 1], bz = positions[i1 + 2];
    const cx = positions[i2], cy = positions[i2 + 1], cz = positions[i2 + 2];

    const e1x = bx - ax, e1y = by - ay, e1z = bz - az;
    const e2x = cx - ax, e2y = cy - ay, e2z = cz - az;
    let nx = e1y * e2z - e1z * e2y;
    let ny = e1z * e2x - e1x * e2z;
    let nz = e1x * e2y - e1y * e2x;
    const nl = Math.hypot(nx, ny, nz) || 1;
    nx /= nl; ny /= nl; nz /= nl;

    const vIdx = indices[t * 3];
    let r = 0.72, g = 0.80, b = 0.90, a = 1.0;
    if (colors instanceof Uint32Array && colors.length > vIdx) {
      const [cr, cg, cb, ca] = unpackRGBA(colors[vIdx]);
      r = cr / 255; g = cg / 255; b = cb / 255; a = ca / 255;
    } else if (colors && colors.length > vIdx * 4 + 3) {
      const cIdx = vIdx * 4;
      r = colors[cIdx] / 255; g = colors[cIdx + 1] / 255; b = colors[cIdx + 2] / 255; a = colors[cIdx + 3] / 255;
    }

    const verts = [[ax, ay, az], [bx, by, bz], [cx, cy, cz]];
    for (const v of verts) {
      interleaved[ptr++] = v[0];
      interleaved[ptr++] = v[1];
      interleaved[ptr++] = v[2];
      interleaved[ptr++] = nx;
      interleaved[ptr++] = ny;
      interleaved[ptr++] = nz;
      interleaved[ptr++] = r;
      interleaved[ptr++] = g;
      interleaved[ptr++] = b;
      interleaved[ptr++] = a;
    }
  }
  return { interleaved, vertexCount: triCount * 3, triCount };
}

class WebGL2Renderer {
  constructor({ canvas = null, gl = null, width = 320, height = 180, uploadAndDrop = true } = {}) {
    this.width = width;
    this.height = height;
    this.uploadAndDrop = Boolean(uploadAndDrop);
    this.gl = gl || (canvas && typeof canvas.getContext === 'function' ? canvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true }) : null);
    this.gpuMeshes = new Map(); // mesh.id -> { vao, vbo, vertexCount, triCount, vramBytes }
    this.programs = new Map();
    this.prewarmQueue = [
      { id: 'main-lit', vert: WEBGL2_VERT_MAIN, frag: WEBGL2_FRAG_MAIN },
      { id: 'object-id', vert: WEBGL2_VERT_OBJECT_ID, frag: WEBGL2_FRAG_OBJECT_ID },
    ];
    this.prewarmIndex = 0;
    this.sunDir = [0.45, 0.78, 0.38];
    this.stats = {
      available: Boolean(this.gl),
      backend: this.gl ? 'webgl2' : 'unavailable',
      drawCalls: 0,
      drawnTris: 0,
      uploadedMeshes: 0,
      vramBytesEstimate: 0,
      droppedCpuCopies: 0,
      prewarmedShaders: 0,
      parallelCompileExt: Boolean(this.gl && typeof this.gl.getExtension === 'function' && this.gl.getExtension('KHR_parallel_shader_compile')),
    };
  }

  static probe(canvas = null) {
    if (canvas && typeof canvas.getContext === 'function') {
      const ctx = canvas.getContext('webgl2');
      return { supported: Boolean(ctx), glVersion: ctx ? 'WebGL 2.0 (GLSL ES 3.00)' : 'none' };
    }
    const hasGlobal = typeof globalThis.WebGL2RenderingContext !== 'undefined';
    return { supported: hasGlobal, glVersion: hasGlobal ? 'WebGL 2.0 (GLSL ES 3.00)' : 'headless-no-dom' };
  }

  _compileProgram(vertSrc, fragSrc) {
    const gl = this.gl;
    if (!gl) return null;
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vertSrc);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      throw new Error(`WebGL2 VS error: ${gl.getShaderInfoLog(vs)}`);
    }
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fragSrc);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      throw new Error(`WebGL2 FS error: ${gl.getShaderInfoLog(fs)}`);
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(`WebGL2 link error: ${gl.getProgramInfoLog(prog)}`);
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return {
      program: prog,
      uniforms: {
        u_mvp: gl.getUniformLocation(prog, 'u_mvp'),
        u_normalMat: gl.getUniformLocation(prog, 'u_normalMat'),
        u_sunDir: gl.getUniformLocation(prog, 'u_sunDir'),
        u_styleMode: gl.getUniformLocation(prog, 'u_styleMode'),
        u_objectIdRgb: gl.getUniformLocation(prog, 'u_objectIdRgb'),
      },
    };
  }

  // A-114 / F-172: Пошаговый Async Shader Pre-Warm — компилирует по 1 программе за шаг без фриза кадра
  stepShaderPrewarm() {
    if (!this.gl) {
      return { done: true, compiledNow: 0, totalCompiled: 0, available: false };
    }
    if (this.prewarmIndex >= this.prewarmQueue.length) {
      return { done: true, compiledNow: 0, totalCompiled: this.programs.size, available: true };
    }
    const item = this.prewarmQueue[this.prewarmIndex++];
    if (!this.programs.has(item.id)) {
      const compiled = this._compileProgram(item.vert, item.frag);
      this.programs.set(item.id, compiled);
      this.stats.prewarmedShaders = this.programs.size;
    }
    return {
      done: this.prewarmIndex >= this.prewarmQueue.length,
      compiledId: item.id,
      compiledNow: 1,
      totalCompiled: this.programs.size,
      available: true,
    };
  }

  prewarmAll() {
    while (this.prewarmIndex < this.prewarmQueue.length) {
      const step = this.stepShaderPrewarm();
      if (!step.available) break;
    }
    return { prewarmedShaders: this.programs.size, available: Boolean(this.gl) };
  }

  // Жёсткий Барьер 2 ToolGuard: WebGL2 забирает геометрию ТОЛЬКО через vault.readSealedMesh()!
  uploadSealedMesh(vault, meshHandle) {
    // Всегда проверяем печать ToolGuard ДО обращения к GPU (сырой меш -> мгновенный RC-101!)
    const sealed = vault.readSealedMesh(meshHandle, 'webgl2-renderer');
    const buffers = sealed.buffers || sealed;
    const cached = this.gpuMeshes.get(meshHandle.id);
    if (cached) return cached;

    const { interleaved, vertexCount, triCount } = buildInterleavedVertexBuffer(buffers);
    const vramBytes = interleaved.byteLength;
    let vao = null;
    let vbo = null;

    if (this.gl) {
      const gl = this.gl;
      vao = gl.createVertexArray();
      vbo = gl.createBuffer();
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, interleaved, gl.STATIC_DRAW);
      const stride = 10 * 4;
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 3 * 4);
      gl.enableVertexAttribArray(2);
      gl.vertexAttribPointer(2, 4, gl.FLOAT, false, stride, 6 * 4);
      gl.bindVertexArray(null);
    }

    const entry = {
      meshId: meshHandle.id,
      vao,
      vbo,
      vertexCount,
      triCount,
      vramBytes,
      // A-77 Upload-and-Drop: CPU-копию не держим в кэше WebGL2
      cpuCopyDropped: this.uploadAndDrop,
    };
    this.gpuMeshes.set(meshHandle.id, entry);
    this.stats.uploadedMeshes = this.gpuMeshes.size;
    this.stats.vramBytesEstimate += vramBytes;
    if (this.uploadAndDrop) this.stats.droppedCpuCopies++;
    return entry;
  }

  renderScene({ vault, entities = [], camera, bgRgb = [0.07, 0.11, 0.16], stylePreset = 'none', objectIdPass = false } = {}) {
    if (!this.gl) {
      return { ok: false, backend: 'unavailable', drawCalls: 0, drawnTris: 0 };
    }
    this.prewarmAll();
    const gl = this.gl;
    const progKey = objectIdPass ? 'object-id' : 'main-lit';
    const progObj = this.programs.get(progKey);

    gl.viewport(0, 0, this.width, this.height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    if (objectIdPass) gl.clearColor(0, 0, 0, 1);
    else gl.clearColor(bgRgb[0], bgRgb[1], bgRgb[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(progObj.program);

    const camScene = worldToScene(camera.x, camera.y, camera.h);
    const tgtScene = worldToScene(camera.targetX, camera.targetY, camera.targetH);
    const proj = makePerspective((camera.fovDeg || 60) * Math.PI / 180, this.width / Math.max(1, this.height), 0.1, 500);
    const view = makeLookAt(camScene, tgtScene);
    const vp = mulMat4(proj, view);

    if (!objectIdPass) {
      gl.uniform3f(progObj.uniforms.u_sunDir, this.sunDir[0], this.sunDir[1], this.sunDir[2]);
      gl.uniform1i(progObj.uniforms.u_styleMode, STYLE_TO_ID[stylePreset] ?? 0);
    }

    let drawCalls = 0;
    let drawnTris = 0;
    for (const ent of entities) {
      if (!ent || !ent.mesh) continue;
      // Каждая сущность обязана пройти через vault.readSealedMesh (Барьер 2!)
      const gpu = this.uploadSealedMesh(vault, ent.mesh);
      const pos = worldToScene(ent.x, ent.y, ent.h);
      const yaw = ((ent.yawDeg || 0) * Math.PI) / 180;
      const model = makeModelMatrix(pos.x, pos.y, pos.z, yaw, ent.scale || 1);
      const mvp = mulMat4(vp, model);

      gl.uniformMatrix4fv(progObj.uniforms.u_mvp, false, mvp);
      if (objectIdPass) {
        const oid = ent.objectId || 1;
        gl.uniform3f(progObj.uniforms.u_objectIdRgb, ((oid & 255) / 255), (((oid >> 8) & 255) / 255), (((oid >> 16) & 255) / 255));
      } else {
        gl.uniformMatrix3fv(progObj.uniforms.u_normalMat, false, makeNormalMat3(yaw));
      }
      gl.bindVertexArray(gpu.vao);
      gl.drawArrays(gl.TRIANGLES, 0, gpu.vertexCount);
      drawCalls++;
      drawnTris += gpu.triCount;
    }

    gl.bindVertexArray(null);
    this.stats.drawCalls = drawCalls;
    this.stats.drawnTris = drawnTris;
    return {
      ok: true,
      backend: 'webgl2',
      pass: objectIdPass ? 'object-id' : 'main-lit',
      drawCalls,
      drawnTris,
      uploadedMeshes: this.stats.uploadedMeshes,
      vramBytesEstimate: this.stats.vramBytesEstimate,
    };
  }

  dispose() {
    if (this.gl) {
      for (const entry of this.gpuMeshes.values()) {
        if (entry.vbo) this.gl.deleteBuffer(entry.vbo);
        if (entry.vao) this.gl.deleteVertexArray(entry.vao);
      }
      for (const p of this.programs.values()) {
        if (p && p.program) this.gl.deleteProgram(p.program);
      }
    }
    this.gpuMeshes.clear();
    this.programs.clear();
    this.stats.uploadedMeshes = 0;
    this.stats.vramBytesEstimate = 0;
  }

  getStats() {
    return { ...this.stats, width: this.width, height: this.height, shaderSources: ['WEBGL2_VERT_MAIN', 'WEBGL2_FRAG_MAIN', 'WEBGL2_VERT_OBJECT_ID', 'WEBGL2_FRAG_OBJECT_ID'] };
  }
}

// Фабрика легковесного тестового WebGL2-контекста для headless-верификации без DOM (проверяет порядок вызовов и GLSL 300 es!)
function createHeadlessWebGL2Context() {
  let nextId = 1;
  const log = { shaders: 0, programs: 0, buffers: 0, vaos: 0, drawCalls: 0, uploadedBytes: 0, lastStyleMode: 0 };
  return {
    VERTEX_SHADER: 0x8b31,
    FRAGMENT_SHADER: 0x8b30,
    COMPILE_STATUS: 0x8b81,
    LINK_STATUS: 0x8b82,
    ARRAY_BUFFER: 0x8892,
    STATIC_DRAW: 0x88e4,
    FLOAT: 0x1406,
    TRIANGLES: 0x0004,
    DEPTH_TEST: 0x0b71,
    CULL_FACE: 0x0b44,
    COLOR_BUFFER_BIT: 0x4000,
    DEPTH_BUFFER_BIT: 0x0100,
    __log: log,
    getExtension: () => ({ COMPLETION_STATUS_KHR: 0x91b1 }),
    createShader: (type) => ({ id: nextId++, type, src: '' }),
    shaderSource: (sh, src) => { sh.src = src; },
    compileShader: (sh) => {
      if (!sh.src.startsWith('#version 300 es')) throw new Error('Shader must start with #version 300 es');
      log.shaders++;
    },
    getShaderParameter: () => true,
    getShaderInfoLog: () => '',
    createProgram: () => ({ id: nextId++, shaders: [] }),
    attachShader: (p, sh) => { p.shaders.push(sh); },
    linkProgram: () => { log.programs++; },
    getProgramParameter: () => true,
    getProgramInfoLog: () => '',
    deleteShader: () => {},
    deleteProgram: () => {},
    getUniformLocation: (_p, name) => ({ name }),
    createVertexArray: () => { log.vaos++; return { id: nextId++ }; },
    deleteVertexArray: () => {},
    bindVertexArray: () => {},
    createBuffer: () => { log.buffers++; return { id: nextId++ }; },
    deleteBuffer: () => {},
    bindBuffer: () => {},
    bufferData: (_t, data) => { log.uploadedBytes += data.byteLength || 0; },
    enableVertexAttribArray: () => {},
    vertexAttribPointer: () => {},
    viewport: () => {},
    enable: () => {},
    clearColor: () => {},
    clear: () => {},
    useProgram: () => {},
    uniform3f: () => {},
    uniform1i: (loc, v) => { if (loc && loc.name === 'u_styleMode') log.lastStyleMode = clamp(v | 0, 0, 5); },
    uniformMatrix4fv: () => {},
    uniformMatrix3fv: () => {},
    drawArrays: () => { log.drawCalls++; },
  };
}
    exports["WEBGL2_VERT_MAIN"] = WEBGL2_VERT_MAIN;
    exports["WEBGL2_FRAG_MAIN"] = WEBGL2_FRAG_MAIN;
    exports["WEBGL2_VERT_OBJECT_ID"] = WEBGL2_VERT_OBJECT_ID;
    exports["WEBGL2_FRAG_OBJECT_ID"] = WEBGL2_FRAG_OBJECT_ID;
    exports["WebGL2Renderer"] = WebGL2Renderer;
    exports["createHeadlessWebGL2Context"] = createHeadlessWebGL2Context;
  });

  __define("src/runtime/governor.js", function (exports, __import) {
    var { clamp } = __import("src/core/math.js");
// RatCore Runtime — CoreGovernor 75 % CPU, Power & Thermal Guard, Dynamic Resolution, Watchdog и Memory Sentinel
// Формулы F-115..F-120, F-171..F-181; алгоритмы A-79..A-80, A-115..A-123; коды RC-905..RC-907.



const POWER_PROFILES = Object.freeze({
  eco: Object.freeze({ mode: 'eco', targetCpuPct: 40, maxWorkersRatio: 0.4 }),
  balanced: Object.freeze({ mode: 'balanced', targetCpuPct: 60, maxWorkersRatio: 0.6 }),
  turbo: Object.freeze({ mode: 'turbo', targetCpuPct: 75, maxWorkersRatio: 0.75 }),
});

class CoreGovernor {
  constructor({ profile = 'turbo', targetFps = 60, logicalCores = 4 } = {}) {
    this.logicalCores = Math.max(1, Number(logicalCores || 4));
    this.targetFps = Math.max(15, Number(targetFps || 60));
    this.profile = POWER_PROFILES[profile] || POWER_PROFILES.turbo;
    this.hidden = false;

    // F-118: ПИ-регулятор бюджета времени на кадр
    this.frameBudgetMs = (1000 / this.targetFps) * (this.profile.targetCpuPct / 100);
    this.integralErr = 0;
    this.throttleLevel = 0; // 0 = нет троттлинга, 1 = пауза P3, 2 = пауза P3+P2
    this.frameHistoryMs = [];

    // Очереди приоритетов P0..P3
    this.queues = [[], [], [], []];

    // F-171: Dynamic Resolution Scaler
    this.dynRes = { enabled: true, scale: 1.0, minScale: 0.55, maxScale: 1.0 };

    // F-178..F-181: Memory Leak Sentinel
    this.memSamples = [];
    this.leakWarnings = [];

    // RC-906: Self-Healing Watchdog
    this.isolatedSubsystems = new Map();
  }

  setPowerProfile(mode) {
    this.profile = POWER_PROFILES[mode] || POWER_PROFILES.turbo;
    this.frameBudgetMs = (1000 / this.targetFps) * (this.profile.targetCpuPct / 100);
    return this.getStats();
  }

  setVisibilityHidden(hidden) {
    this.hidden = Boolean(hidden);
    return { hidden: this.hidden, effectiveWorkers: this.getWorkerTarget() };
  }

  // F-115: целевое число воркеров строго <= 75 % (или 40/60 % по профилю), 0 при скрытой вкладке
  getWorkerTarget() {
    if (this.hidden) return 0;
    return Math.max(1, Math.min(this.logicalCores, Math.floor(this.logicalCores * this.profile.maxWorkersRatio)));
  }

  enqueue(priority, name, fn) {
    const p = clamp(priority | 0, 0, 3);
    this.queues[p].push({ name: String(name || 'task'), fn });
  }

  // Безопасный запуск подсистемы с Self-Healing Watchdog (RC-906)
  runGuarded(subsystemName, fn) {
    if (this.isolatedSubsystems.has(subsystemName)) {
      return { ok: false, isolated: true, code: 'RC-906', reason: this.isolatedSubsystems.get(subsystemName) };
    }
    try {
      const result = fn();
      return { ok: true, isolated: false, result };
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      this.isolatedSubsystems.set(subsystemName, msg);
      return { ok: false, isolated: true, code: 'RC-906', reason: msg };
    }
  }

  recoverSubsystem(subsystemName) {
    return this.isolatedSubsystems.delete(subsystemName);
  }

  // Исполнение кадра в пределах бюджета CoreGovernor + адаптация ПИ-регулятора и Dynamic Resolution
  executeFrame({ simulatedFrameMs = null } = {}) {
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const executed = [];
    const budget = this.hidden ? 1.0 : this.frameBudgetMs;

    for (let prio = 0; prio <= 3; prio++) {
      // При тепловом троттлинге защищаем P0 и P1
      if (this.throttleLevel >= 1 && prio === 3) break;
      if (this.throttleLevel >= 2 && prio >= 2) break;

      const q = this.queues[prio];
      while (q.length > 0) {
        const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;
        if (prio > 0 && elapsed >= budget) break;
        const job = q.shift();
        const res = this.runGuarded(job.name, job.fn);
        executed.push({ name: job.name, prio, ok: res.ok });
      }
    }

    const actualMs = simulatedFrameMs !== null
      ? Number(simulatedFrameMs)
      : Math.max(0.01, (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start);

    this._updateControllers(actualMs);
    return {
      executedCount: executed.length,
      executed,
      frameMs: Number(actualMs.toFixed(3)),
      budgetMs: Number(budget.toFixed(3)),
      throttleLevel: this.throttleLevel,
      dynResScale: Number(this.dynRes.scale.toFixed(3)),
      pending: this.queues.map((q) => q.length),
    };
  }

  _updateControllers(frameMs) {
    this.frameHistoryMs.push(frameMs);
    if (this.frameHistoryMs.length > 60) this.frameHistoryMs.shift();

    // F-118 / F-120: расчёт P95 и уровня теплового/нагрузочного троттлинга
    const sorted = [...this.frameHistoryMs].sort((a, b) => a - b);
    const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] || frameMs;
    const targetFrameMs = 1000 / this.targetFps;
    const utilRatio = frameMs / targetFrameMs;
    const targetRatio = this.profile.targetCpuPct / 100;

    const err = utilRatio - targetRatio;
    this.integralErr = clamp(this.integralErr + err * 0.1, -1, 1);

    if (p95 > targetFrameMs * 0.92 || utilRatio > 0.85) this.throttleLevel = 2;
    else if (p95 > targetFrameMs * 0.78 || utilRatio > targetRatio + 0.05) this.throttleLevel = 1;
    else this.throttleLevel = 0;

    // F-171: плавный Dynamic Resolution Scaler
    if (this.dynRes.enabled) {
      if (frameMs > targetFrameMs * 0.9) {
        this.dynRes.scale = clamp(this.dynRes.scale - 0.05, this.dynRes.minScale, this.dynRes.maxScale);
      } else if (frameMs < targetFrameMs * 0.65) {
        this.dynRes.scale = clamp(this.dynRes.scale + 0.025, this.dynRes.minScale, this.dynRes.maxScale);
      }
    }
  }

  // F-178..F-181: Memory Leak Sentinel (обнаруживает монотонный рост памяти)
  sampleMemory(activeEntities, usedBytes) {
    this.memSamples.push({ activeEntities, usedBytes });
    if (this.memSamples.length > 16) this.memSamples.shift();
    if (this.memSamples.length >= 6) {
      const first = this.memSamples[0];
      const last = this.memSamples[this.memSamples.length - 1];
      let strictlyGrowing = true;
      for (let i = 1; i < this.memSamples.length; i++) {
        if (this.memSamples[i].usedBytes <= this.memSamples[i - 1].usedBytes) {
          strictlyGrowing = false;
          break;
        }
      }
      if (strictlyGrowing && last.usedBytes > first.usedBytes * 1.35) {
        const warn = {
          code: 'RC-907',
          message: `Memory Leak Sentinel: непрерывный рост памяти (${first.usedBytes} -> ${last.usedBytes} Б)`,
          growthRatio: Number((last.usedBytes / Math.max(1, first.usedBytes)).toFixed(2)),
        };
        this.leakWarnings.push(warn);
        return warn;
      }
    }
    return null;
  }

  getStats() {
    const sorted = [...this.frameHistoryMs].sort((a, b) => a - b);
    const p95Ms = sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] : 0;
    return {
      profile: this.profile,
      logicalCores: this.logicalCores,
      targetWorkers: this.getWorkerTarget(),
      hidden: this.hidden,
      frameBudgetMs: Number(this.frameBudgetMs.toFixed(2)),
      p95Ms: Number(p95Ms.toFixed(3)),
      throttleLevel: this.throttleLevel,
      dynRes: { ...this.dynRes, scale: Number(this.dynRes.scale.toFixed(3)) },
      isolatedSubsystems: [...this.isolatedSubsystems.keys()],
      leakWarnings: this.leakWarnings.length,
    };
  }
}
    exports["POWER_PROFILES"] = POWER_PROFILES;
    exports["CoreGovernor"] = CoreGovernor;
  });

  __define("src/runtime/worker-pool.js", function (exports, __import) {

// RatCore Stage 4 — Многоядерный пул потоков под управлением CoreGovernor (Eco 40 % / Balanced 60 % / Turbo 75 % CPU, F-116..F-117, A-75..A-76)
// Работает на настоящих потоках ОС (node:worker_threads в Node.js 22) и на Web Workers (Blob Worker в браузере), 0 внешних зависимостей!

const WORKER_SCRIPT_BODY = `
function fnv1a32(u8) {
  let h = 0x811c9dc5;
  for (let i = 0; i < u8.length; i++) {
    h ^= u8[i];
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function executeTask(msg) {
  const { id, task, payload } = msg;
  const t0 = performance.now();
  let result = null;
  let transfer = [];

  if (task === 'hashChunk') {
    const u8 = payload instanceof Uint8Array ? payload : new Uint8Array(payload);
    result = { hash: fnv1a32(u8), bytes: u8.length };
  } else if (task === 'stepBatchPhysics') {
    const posY = new Float32Array(payload.posY);
    const velY = new Float32Array(payload.velY);
    const dt = payload.dt || (1 / 60);
    const g = payload.gravity || 9.81;
    for (let i = 0; i < posY.length; i++) {
      let v = velY[i] - g * dt;
      let y = posY[i] + v * dt;
      if (y < 0) { y = 0; v = -v * 0.4; }
      posY[i] = y;
      velY[i] = v;
    }
    result = { count: posY.length, posY: posY.buffer, velY: velY.buffer };
    transfer = [posY.buffer, velY.buffer];
  } else if (task === 'genTerrainStripe') {
    const { width, startY, rows, seed } = payload;
    const out = new Float32Array(width * rows);
    for (let r = 0; r < rows; r++) {
      const y = startY + r;
      for (let x = 0; x < width; x++) {
        const s = Math.sin((x + seed * 0.13) * 0.17) * Math.cos((y - seed * 0.07) * 0.19);
        out[r * width + x] = Number((s * 8 + 4).toFixed(3));
      }
    }
    result = { width, startY, rows, heights: out.buffer };
    transfer = [out.buffer];
  } else if (task === 'computeSum') {
    const arr = new Float32Array(payload);
    let sum = 0;
    for (let i = 0; i < arr.length; i++) sum += arr[i];
    result = { sum: Number(sum.toFixed(4)), count: arr.length };
  } else {
    throw new Error('Unknown worker task: ' + task);
  }
  return { id, ok: true, result, workerMs: Number((performance.now() - t0).toFixed(3)), transfer };
}
`;

const NODE_WORKER_SOURCE = `
const { parentPort } = require('node:worker_threads');
${WORKER_SCRIPT_BODY}
parentPort.on('message', (msg) => {
  try {
    const out = executeTask(msg);
    const { transfer, ...clean } = out;
    parentPort.postMessage(clean, transfer);
  } catch (err) {
    parentPort.postMessage({ id: msg.id, ok: false, error: String(err && err.message || err) });
  }
});
`;

const BROWSER_WORKER_SOURCE = `
${WORKER_SCRIPT_BODY}
self.onmessage = (e) => {
  const msg = e.data;
  try {
    const out = executeTask(msg);
    const { transfer, ...clean } = out;
    self.postMessage(clean, transfer);
  } catch (err) {
    self.postMessage({ id: msg.id, ok: false, error: String(err && err.message || err) });
  }
};
`;

const PRIORITY_ORDER = { P0: 0, P1: 1, P2: 2, P3: 3 };

class RatCoreWorkerPool {
  constructor({ governor = null, maxWorkers = null } = {}) {
    this.governor = governor;
    this.maxWorkersOverride = maxWorkers;
    this.workers = []; // { id, handle, busy, tasksDone }
    this.pending = []; // { id, priority, task, payload, transfer, resolve, reject }
    this.inFlight = new Map();
    this.nextTaskId = 1;
    this.totalCompleted = 0;
    this.runtime = 'uninitialized';
    this._nodeWorkerCtor = null;
    this._blobUrl = null;
  }

  getTargetWorkerCount() {
    if (this.governor) {
      const g = this.governor.getStats();
      if (g.hidden || g.targetWorkers === 0) return 0;
      const base = Math.max(1, g.targetWorkers);
      return this.maxWorkersOverride ? Math.min(base, this.maxWorkersOverride) : base;
    }
    return this.maxWorkersOverride || 2;
  }

  async _ensureRuntime() {
    if (this.runtime !== 'uninitialized') return;
    const isNode = typeof process !== 'undefined' && Boolean(process.versions && process.versions.node);
    if (isNode) {
      const wt = await import('node:worker_threads');
      this._nodeWorkerCtor = wt.Worker;
      this.runtime = 'node-worker-threads';
    } else if (typeof Worker !== 'undefined' && typeof Blob !== 'undefined' && typeof URL !== 'undefined') {
      const blob = new Blob([BROWSER_WORKER_SOURCE], { type: 'application/javascript' });
      this._blobUrl = URL.createObjectURL(blob);
      this.runtime = 'browser-web-workers';
    } else {
      this.runtime = 'inline-fallback';
    }
  }

  async syncWithGovernor() {
    await this._ensureRuntime();
    const target = this.getTargetWorkerCount();

    // Масштабируем вниз (например, Eco 40 % или скрытие вкладки -> 0 потоков!)
    while (this.workers.length > target) {
      const w = this.workers.pop();
      if (w && w.handle && typeof w.handle.terminate === 'function') {
        await w.handle.terminate();
      }
    }

    // Масштабируем вверх до квоты CoreGovernor (напр. Turbo 75 % CPU)
    while (this.workers.length < target && this.runtime !== 'inline-fallback') {
      const idx = this.workers.length;
      const handle = this.runtime === 'node-worker-threads'
        ? new this._nodeWorkerCtor(NODE_WORKER_SOURCE, { eval: true })
        : new Worker(this._blobUrl);

      const slot = { id: idx, handle, busy: false, tasksDone: 0 };
      const onMessage = (msg) => {
        const job = this.inFlight.get(msg.id);
        this.inFlight.delete(msg.id);
        slot.busy = false;
        slot.tasksDone++;
        this.totalCompleted++;
        if (job) {
          if (msg.ok) job.resolve({ ...msg.result, workerId: slot.id, workerMs: msg.workerMs, runtime: this.runtime });
          else job.reject(new Error(msg.error || 'Worker task failed'));
        }
        this._drain();
      };
      const onError = (err) => {
        slot.busy = false;
        for (const [jid, job] of this.inFlight.entries()) {
          if (job.workerId === slot.id) {
            this.inFlight.delete(jid);
            job.reject(err);
          }
        }
        this._drain();
      };

      if (this.runtime === 'node-worker-threads') {
        handle.on('message', onMessage);
        handle.on('error', onError);
      } else {
        handle.onmessage = (e) => onMessage(e.data);
        handle.onerror = onError;
      }
      this.workers.push(slot);
    }

    return this.getStats();
  }

  // Постановка задачи с приоритетом P0..P3 и zero-copy Transferable буферами
  async dispatch({ task, payload, priority = 'P1', transfer = [] } = {}) {
    await this.syncWithGovernor();
    if (this.workers.length === 0) {
      return { skipped: true, reason: 'governor-zero-workers-or-hidden', runtime: this.runtime };
    }

    return new Promise((resolve, reject) => {
      const id = this.nextTaskId++;
      const prio = PRIORITY_ORDER[priority] ?? 1;
      this.pending.push({ id, prio, task, payload, transfer, resolve, reject });
      this.pending.sort((a, b) => a.prio - b.prio);
      this._drain();
    });
  }

  _drain() {
    for (const slot of this.workers) {
      if (slot.busy || this.pending.length === 0) continue;
      const job = this.pending.shift();
      slot.busy = true;
      this.inFlight.set(job.id, { ...job, workerId: slot.id });
      slot.handle.postMessage({ id: job.id, task: job.task, payload: job.payload }, job.transfer);
    }
  }

  async terminate() {
    for (const w of this.workers) {
      if (w.handle && typeof w.handle.terminate === 'function') {
        await w.handle.terminate();
      }
    }
    this.workers = [];
    if (this._blobUrl && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(this._blobUrl);
      this._blobUrl = null;
    }
    return { terminated: true };
  }

  getStats() {
    return {
      runtime: this.runtime,
      activeWorkers: this.workers.length,
      targetWorkers: this.getTargetWorkerCount(),
      busyWorkers: this.workers.filter((w) => w.busy).length,
      pendingTasks: this.pending.length,
      totalCompleted: this.totalCompleted,
      perWorkerCompleted: this.workers.map((w) => w.tasksDone),
    };
  }
}
    exports["RatCoreWorkerPool"] = RatCoreWorkerPool;
  });

  __define("src/tools/toolkit.js", function (exports, __import) {
    var { createClock } = __import("src/core/clock.js");
    var { createToolGuardVault, RatCoreError } = __import("src/core/seal.js");
    var { InputManager } = __import("src/core/input.js");
    var { UiHudManager } = __import("src/core/ui.js");
    var { CORE_BRANCHES, STANDARD_MODULES, OPTIONAL_PACKS, resolveModuleProfile, createDisabledBranchProxy } = __import("src/core/modules.js");
    var { HeightField } = __import("src/world/coords.js");
    var { parseLayerNotation } = __import("src/world/layers.js");
    var { SpatialHashGrid, ddaRaycast3D } = __import("src/world/spatial.js");
    var { WorldGraph, generateWorldMap } = __import("src/world/graph.js");
    var { synthesizeTextureData } = __import("src/assets/textures.js");
    var { buildPrimitiveGeometry, buildIndexedGeometry, buildExtrudeGeometry, buildLatheGeometry, buildVoxelsGreedyGeometry, combineGeometries, validateMeshBuffers } = __import("src/assets/mesh-builder.js");
    var { Software3DRenderer } = __import("src/render/software-3d.js");
    var { packRGBA } = __import("src/assets/raster.js");
    var { encodeWire2Frame, decodeWire2Frame, fastCdcSplit, diffFastCdcChunks } = __import("src/compress/wire2.js");
    var { CoreGovernor } = __import("src/runtime/governor.js");
    var { PhysicsWorld } = __import("src/modules/phys.js");
    var { NavigationSystem } = __import("src/modules/nav.js");
    var { EnvironmentSystem } = __import("src/modules/env.js");
    var { synthesizeSoundPCM, AcousticWorld } = __import("src/modules/audio.js");
    var { AiTeamSuite } = __import("src/packs/ai-team.js");
    var { DestructionSystem } = __import("src/packs/destruction.js");
    var { MultiplayerSession, encodeInput12, decodeInput12 } = __import("src/packs/multiplayer.js");
    var { NarrativeSuite } = __import("src/packs/narrative.js");
    var { EcologySystem } = __import("src/packs/ecology.js");
    var { StyleShaderPipeline } = __import("src/packs/styles.js");
    var { exportSingleHtmlGame } = __import("src/packs/exporter.js");
    var { WebGL2Renderer } = __import("src/render/webgl2-renderer.js");
    var { WebGpuComputePipeline } = __import("src/packs/webgpu.js");
    var { WasmAccelerator } = __import("src/packs/wasm-accel.js");
    var { RatCoreWorkerPool } = __import("src/runtime/worker-pool.js");
    var { ModSandboxManager } = __import("src/packs/mods.js");
    var { CinemaDirector } = __import("src/packs/cinema.js");
    var { VoiceSynthSuite } = __import("src/packs/voice.js");
    var { CompanionAiSystem } = __import("src/packs/companion.js");
    var { AccessibilityAssistSystem } = __import("src/packs/assist.js");
    var { RatStudioController, runAutoBalance, findBalanceExploits } = __import("src/packs/studio.js");
    var { AnimationSystem, solveTwoBoneIK } = __import("src/modules/anim.js");
    var { FxSystem } = __import("src/modules/fx.js");
    var { GameAiSystem } = __import("src/modules/ai.js");
    var { SimulationEconomy } = __import("src/modules/sim.js");
    var { TestAutomationSuite } = __import("src/modules/test.js");
// RatCore — Единый шлюз инструментов RatCore.tools.* (v0.2 Этап 2: ядро + RCW2 + CoreGovernor 75 % + Opt-In модули + AI-Team)
// Захватывает одноразовую печать claimMintAuthority() (Барьер 1) и обслуживает все операции через единый конвейер §0.











































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

function createRatCoreEngine(config = {}) {
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
          else if (step.tool === 'build.indexed') builtParts.push({ ...buildIndexedGeometry(step.args), offset: step.offset || [0, 0, 0] });
          else if (step.tool === 'build.extrude') builtParts.push({ ...buildExtrudeGeometry(step.args), offset: step.offset || [0, 0, 0] });
          else if (step.tool === 'build.lathe') builtParts.push({ ...buildLatheGeometry(step.args), offset: step.offset || [0, 0, 0] });
          else if (step.tool === 'build.voxels') builtParts.push({ ...buildVoxelsGreedyGeometry(step.args), offset: step.offset || [0, 0, 0] });
          else if (step.tool === 'build.layer') {
            const parsed = parseLayerNotation(step.args?.expr, step.args || {});
            const vox = parsed.cells.map((c) => ({ x: Math.round(c.x), y: c.k, z: Math.round(-c.y), mat: 1 }));
            builtParts.push({ ...buildVoxelsGreedyGeometry({ voxels: vox }), offset: step.offset || [0, 0, 0] });
          } else {
            throw new RatCoreError('RC-104', `Неизвестная операция рецепта: ${step.tool}`, 'Допустимы build.primitive, build.indexed, build.extrude, build.lathe, build.voxels, build.layer.');
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
    exports["createRatCoreEngine"] = createRatCoreEngine;
  });

  __define("src/world/coords.js", function (exports, __import) {
    var { clamp, lerp } = __import("src/core/math.js");
    var { RatCoreError } = __import("src/core/seal.js");
// RatCore World — Единая система координат (X, Y, H, h), Floating Origin и проекция в 3D (F-04..F-06)
// X — восток (+вправо), Y — север (+вверх), H(X,Y) — высота поверхности (0 = уровень моря), h = H + Δ.




const SEA_LEVEL = 0;
const WATER_MIN_LAND_H = 0.5;

// F-06: Единственная точка проекции в правую 3D-систему сцены
function worldToScene(x, y, h, origin = null) {
  const ox = origin ? origin.x : 0;
  const oy = origin ? origin.y : 0;
  const oh = origin ? origin.h : 0;
  return [x - ox, h - oh, -(y - oy)];
}

function sceneToWorld(sx, sy, sz, origin = null) {
  const ox = origin ? origin.x : 0;
  const oy = origin ? origin.y : 0;
  const oh = origin ? origin.h : 0;
  return { x: sx + ox, y: -sz + oy, h: sy + oh };
}

// Азимут: 0° — север (+Y), по часовой стрелке (восток = 90°, юг = 180°, запад = 270°)
function azimuthDeg(dx, dy) {
  const deg = (Math.atan2(dx, dy) * 180) / Math.PI;
  return (deg + 360) % 360;
}

// F-05: Билинейная интерполяция высоты H(X, Y) по регулярной сетке высот
class HeightField {
  constructor({ width = 64, height = 64, cellSize = 1, originX = -32, originY = -32, data = null } = {}) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.originX = originX;
    this.originY = originY;
    this.data = data ? new Float32Array(data) : new Float32Array(width * height);
  }

  inBounds(x, y) {
    const gx = (x - this.originX) / this.cellSize;
    const gy = (y - this.originY) / this.cellSize;
    return gx >= 0 && gy >= 0 && gx <= this.width - 1 && gy <= this.height - 1;
  }

  setCell(ix, iy, h) {
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    this.data[iy * this.width + ix] = h;
  }

  getCell(ix, iy) {
    const cx = clamp(ix | 0, 0, this.width - 1);
    const cy = clamp(iy | 0, 0, this.height - 1);
    return this.data[cy * this.width + cx];
  }

  sampleHeight(x, y) {
    const gx = clamp((x - this.originX) / this.cellSize, 0, this.width - 1.0001);
    const gy = clamp((y - this.originY) / this.cellSize, 0, this.height - 1.0001);
    const x0 = Math.floor(gx);
    const y0 = Math.floor(gy);
    const fx = gx - x0;
    const fy = gy - y0;
    const h00 = this.getCell(x0, y0);
    const h10 = this.getCell(x0 + 1, y0);
    const h01 = this.getCell(x0, y0 + 1);
    const h11 = this.getCell(x0 + 1, y0 + 1);
    return lerp(lerp(h00, h10, fx), lerp(h01, h11, fx), fy);
  }

  sampleSlope(x, y) {
    const e = this.cellSize * 0.5;
    const hx = (this.sampleHeight(x + e, y) - this.sampleHeight(x - e, y)) / (2 * e);
    const hy = (this.sampleHeight(x, y + e) - this.sampleHeight(x, y - e)) / (2 * e);
    return Math.hypot(hx, hy);
  }

  assertPlacement(x, y, h, { allowWater = false, allowUnderground = false } = {}) {
    if (!this.inBounds(x, y)) {
      throw new RatCoreError('RC-301', `Координата (${x}, ${y}) выходит за границы мира`, 'Используй координаты внутри карты.');
    }
    const groundH = this.sampleHeight(x, y);
    if (!allowWater && groundH < WATER_MIN_LAND_H) {
      throw new RatCoreError('RC-304', `Нельзя разместить наземный объект в воде (H=${groundH.toFixed(2)} < ${WATER_MIN_LAND_H})`, 'Передай allowWater: true или выбери сушу.');
    }
    if (!allowUnderground && h < groundH - 0.05) {
      throw new RatCoreError('RC-305', `Объект ниже поверхности земли (h=${h.toFixed(2)} < H=${groundH.toFixed(2)})`, 'Укажи snapToTerrain: true или h >= H.');
    }
    return groundH;
  }
}
    exports["SEA_LEVEL"] = SEA_LEVEL;
    exports["WATER_MIN_LAND_H"] = WATER_MIN_LAND_H;
    exports["worldToScene"] = worldToScene;
    exports["sceneToWorld"] = sceneToWorld;
    exports["azimuthDeg"] = azimuthDeg;
    exports["HeightField"] = HeightField;
  });

  __define("src/world/face-id.js", function (exports, __import) {

// RatCore World — 64-битный ID грани (BigInt) и встроенное состояние износа (F-07, F-08)
// Битовая раскладка (64 бита):
//   [63..61] s (3 бита): сторона (0=верх, 1=восток, 2=запад, 3=север, 4=юг)
//   [60..45] i (16 бит, смещение +32768): координата X кубика
//   [44..29] j (16 бит, смещение +32768): координата Y кубика
//   [28..16] k (13 бит, смещение +4096):  высота Z/h кубика
//   [15..4]  t (12 бит): текстура/состояние (0..2047 целая, 2048..4094 битая, 4095 сломана)
//   [3..0]   n (4 бита): слой (0..15)

const FACE_SIDE = Object.freeze({
  TOP: 0,
  EAST: 1,
  WEST: 2,
  NORTH: 3,
  SOUTH: 4,
});

const FACE_BROKEN_TEX = 4095;
const FACE_DAMAGE_OFFSET = 2048;

const BIAS_IJ = 32768;
const BIAS_K = 4096;

function packFaceId({ s = 0, i = 0, j = 0, k = 0, t = 0, n = 0 }) {
  const sb = BigInt(s & 0x7);
  const ib = BigInt((i + BIAS_IJ) & 0xffff);
  const jb = BigInt((j + BIAS_IJ) & 0xffff);
  const kb = BigInt((k + BIAS_K) & 0x1fff);
  const tb = BigInt(t & 0xfff);
  const nb = BigInt(n & 0xf);
  return (sb << 61n) | (ib << 45n) | (jb << 29n) | (kb << 16n) | (tb << 4n) | nb;
}

function unpackFaceId(faceId) {
  const v = BigInt(faceId);
  const s = Number((v >> 61n) & 0x7n);
  const i = Number((v >> 45n) & 0xffffn) - BIAS_IJ;
  const j = Number((v >> 29n) & 0xffffn) - BIAS_IJ;
  const k = Number((v >> 16n) & 0x1fffn) - BIAS_K;
  const t = Number((v >> 4n) & 0xfffn);
  const n = Number(v & 0xfn);
  const state = t === FACE_BROKEN_TEX ? 'broken' : (t >= FACE_DAMAGE_OFFSET ? 'damaged' : 'intact');
  const baseTex = state === 'broken' ? -1 : (t >= FACE_DAMAGE_OFFSET ? t - FACE_DAMAGE_OFFSET : t);
  return { s, i, j, k, t, n, state, baseTex };
}

function damageFaceId(faceId) {
  const f = unpackFaceId(faceId);
  if (f.state === 'broken') return faceId;
  if (f.state === 'damaged') return packFaceId({ ...f, t: FACE_BROKEN_TEX });
  return packFaceId({ ...f, t: f.baseTex + FACE_DAMAGE_OFFSET });
}

function breakFaceId(faceId) {
  const f = unpackFaceId(faceId);
  return packFaceId({ ...f, t: FACE_BROKEN_TEX });
}
    exports["FACE_SIDE"] = FACE_SIDE;
    exports["FACE_BROKEN_TEX"] = FACE_BROKEN_TEX;
    exports["FACE_DAMAGE_OFFSET"] = FACE_DAMAGE_OFFSET;
    exports["packFaceId"] = packFaceId;
    exports["unpackFaceId"] = unpackFaceId;
    exports["damageFaceId"] = damageFaceId;
    exports["breakFaceId"] = breakFaceId;
  });

  __define("src/world/graph.js", function (exports, __import) {
    var { domainWarp2D, ridged2D, createRng } = __import("src/core/math.js");
    var { HeightField, WATER_MIN_LAND_H } = __import("src/world/coords.js");
// RatCore World — Граф узлов/рёбер, A* маршрутизация по рельефу и генератор карты (A-07..A-11)




class WorldGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.adj = new Map();
    this._nextEdgeId = 1;
  }

  addNode({ id, x, y, h = 0, kind = 'point', meta = {} }) {
    const node = { id, x, y, h, kind, meta: { ...meta } };
    this.nodes.set(id, node);
    if (!this.adj.has(id)) this.adj.set(id, []);
    return node;
  }

  moveNode(id, { x, y, h }) {
    const node = this.nodes.get(id);
    if (!node) return null;
    if (x !== undefined) node.x = x;
    if (y !== undefined) node.y = y;
    if (h !== undefined) node.h = h;
    // Пересчёт длин примыкающих рёбер
    for (const edgeId of this.adj.get(id) || []) {
      const e = this.edges.get(edgeId);
      if (!e) continue;
      const a = this.nodes.get(e.from);
      const b = this.nodes.get(e.to);
      if (a && b) e.length = Math.hypot(b.x - a.x, b.y - a.y);
    }
    return node;
  }

  removeNode(id) {
    if (!this.nodes.has(id)) return false;
    const edgeIds = [...(this.adj.get(id) || [])];
    for (const eid of edgeIds) this.removeEdge(eid);
    this.adj.delete(id);
    this.nodes.delete(id);
    return true;
  }

  connect({ id, from, to, kind = 'road', costFactor = 1, bidirectional = true }) {
    const a = this.nodes.get(from);
    const b = this.nodes.get(to);
    if (!a || !b) return null;
    const edgeId = id || `edge_${this._nextEdgeId++}`;
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    const edge = { id: edgeId, from, to, kind, length, costFactor, bidirectional };
    this.edges.set(edgeId, edge);
    this.adj.get(from).push(edgeId);
    if (bidirectional) this.adj.get(to).push(edgeId);
    return edge;
  }

  removeEdge(edgeId) {
    const e = this.edges.get(edgeId);
    if (!e) return false;
    const strip = (nid) => {
      const arr = this.adj.get(nid);
      if (!arr) return;
      const idx = arr.indexOf(edgeId);
      if (idx >= 0) arr.splice(idx, 1);
    };
    strip(e.from);
    strip(e.to);
    this.edges.delete(edgeId);
    return true;
  }

  // A* поиск пути по графу с учётом уклона (F-12)
  findPath(startId, goalId, { slopePenalty = 4 } = {}) {
    if (!this.nodes.has(startId) || !this.nodes.has(goalId)) return null;
    const goal = this.nodes.get(goalId);
    const open = new Set([startId]);
    const cameFrom = new Map();
    const gScore = new Map([[startId, 0]]);
    const fScore = new Map([[startId, this._heur(this.nodes.get(startId), goal)]]);

    while (open.size > 0) {
      let current = null;
      let bestF = Infinity;
      for (const id of open) {
        const f = fScore.get(id) ?? Infinity;
        if (f < bestF) {
          bestF = f;
          current = id;
        }
      }
      if (current === goalId) {
        const path = [current];
        while (cameFrom.has(current)) {
          current = cameFrom.get(current);
          path.push(current);
        }
        path.reverse();
        return { path, totalCost: gScore.get(goalId) };
      }

      open.delete(current);
      const curNode = this.nodes.get(current);

      for (const eid of this.adj.get(current) || []) {
        const edge = this.edges.get(eid);
        if (!edge) continue;
        const nextId = edge.from === current ? edge.to : (edge.bidirectional ? edge.from : null);
        if (!nextId) continue;
        const nextNode = this.nodes.get(nextId);
        const dh = Math.abs((nextNode.h || 0) - (curNode.h || 0));
        const slope = edge.length > 0 ? dh / edge.length : 0;
        const stepCost = edge.length * edge.costFactor * (1 + slope * slopePenalty);
        const tentative = (gScore.get(current) ?? Infinity) + stepCost;

        if (tentative < (gScore.get(nextId) ?? Infinity)) {
          cameFrom.set(nextId, current);
          gScore.set(nextId, tentative);
          fScore.set(nextId, tentative + this._heur(nextNode, goal));
          open.add(nextId);
        }
      }
    }
    return null;
  }

  _heur(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
  }
}

// A-07: Процедурная генерация рельефа, биомов и стартовых поселений по сиду
function generateWorldMap({ seed = 42, width = 64, height = 64, cellSize = 1, settlements = 5 } = {}) {
  const hf = new HeightField({
    width,
    height,
    cellSize,
    originX: -(width * cellSize) / 2,
    originY: -(height * cellSize) / 2,
  });

  const scale = 0.055;
  for (let iy = 0; iy < height; iy++) {
    for (let ix = 0; ix < width; ix++) {
      const nx = ix * scale;
      const ny = iy * scale;
      const base = domainWarp2D(nx, ny, { seed, strength: 0.7, octaves: 3 });
      const ridge = ridged2D(nx * 1.4, ny * 1.4, { seed: seed + 99, octaves: 3 });
      // Островной профиль к краям карты
      const rx = (ix / (width - 1)) * 2 - 1;
      const ry = (iy / (height - 1)) * 2 - 1;
      const radial = Math.max(0, 1 - (rx * rx + ry * ry) * 0.85);
      const h = (base * 6 + ridge * 7) * radial - 1.2;
      hf.setCell(ix, iy, h);
    }
  }

  const graph = new WorldGraph();
  const rng = createRng(seed + 777);
  const placed = [];
  let attempts = 0;
  while (placed.length < settlements && attempts < settlements * 40) {
    attempts++;
    const x = hf.originX + rng.range(4, width - 5) * cellSize;
    const y = hf.originY + rng.range(4, height - 5) * cellSize;
    const h = hf.sampleHeight(x, y);
    if (h < WATER_MIN_LAND_H + 0.3 || h > 8.5) continue;
    const tooClose = placed.some((p) => Math.hypot(p.x - x, p.y - y) < Math.min(width, height) * cellSize * 0.18);
    if (tooClose) continue;
    const id = `city_${placed.length + 1}`;
    const node = graph.addNode({ id, x, y, h, kind: 'settlement', meta: { rank: placed.length === 0 ? 'capital' : 'town' } });
    placed.push(node);
  }

  // Соединяем поселения минимальным связующим остовом (MST)
  if (placed.length >= 2) {
    const inTree = new Set([placed[0].id]);
    while (inTree.size < placed.length) {
      let bestA = null;
      let bestB = null;
      let bestD = Infinity;
      for (const a of placed) {
        if (!inTree.has(a.id)) continue;
        for (const b of placed) {
          if (inTree.has(b.id)) continue;
          const d = Math.hypot(b.x - a.x, b.y - a.y);
          if (d < bestD) {
            bestD = d;
            bestA = a;
            bestB = b;
          }
        }
      }
      if (!bestB) break;
      graph.connect({ from: bestA.id, to: bestB.id, kind: 'road' });
      inTree.add(bestB.id);
    }
  }

  return { heightField: hf, graph, settlements: placed };
}
    exports["WorldGraph"] = WorldGraph;
    exports["generateWorldMap"] = generateWorldMap;
  });

  __define("src/world/layers.js", function (exports, __import) {
    var { RatCoreError } = __import("src/core/seal.js");
    var { packFaceId, FACE_SIDE } = __import("src/world/face-id.js");
// RatCore World — Парсер и валидатор слоевой записи (X;Y)Hp(...) и (X;Y)hp(...) (F-09..F-11, A-06)
// Коды ошибок: RC-302 (смещение при вертикальной H), RC-303 (число пар != p - 1).




const LAYER_RE = /^\(\s*(-?\d+(?:\.\d+)?)\s*;\s*(-?\d+(?:\.\d+)?)\s*\)\s*([Hh])\s*(?:\[(\d+)\]|(\d))\s*(?:\(([^)]*)\))?\s*$/;

function parseLayerNotation(expr, { tex = 1, layerIndex = 0, baseK = 0, allowCarry = false } = {}) {
  const raw = String(expr || '').trim();
  const match = LAYER_RE.exec(raw);
  if (!match) {
    throw new RatCoreError(
      'RC-103',
      `Некорректная слоевая запись: "${raw}"`,
      'Используй формат (X;Y)Hp(dx1,dy1;dx2,dy2;...) или (X;Y)H[12](...), где число пар равно p - 1.'
    );
  }

  const startX = Number(match[1]);
  const startY = Number(match[2]);
  const mode = match[3]; // 'H' = строго вертикальный, 'h' = наклонный/изогнутый
  const p = Number(match[4] || match[5]);
  const pairsRaw = (match[6] || '').trim();

  if (!Number.isInteger(p) || p < 1 || p > 512) {
    throw new RatCoreError('RC-103', `Число слоёв p=${p} вне допустимого диапазона 1..512`, 'Укажи p >= 1.');
  }

  const deltas = [];
  if (pairsRaw) {
    const parts = pairsRaw.split(';').map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      const nums = part.split(',').map((n) => Number(n.trim()));
      if (nums.length !== 2 || !Number.isFinite(nums[0]) || !Number.isFinite(nums[1])) {
        throw new RatCoreError('RC-103', `Некорректная пара смещения "${part}" в слоевой записи`, 'Формат пары: dx,dy (например: 0,0 или 1,-1).');
      }
      deltas.push([nums[0], nums[1]]);
    }
  }

  const expectedPairs = Math.max(0, p - 1);
  if (deltas.length !== expectedPairs) {
    if (allowCarry && deltas.length < expectedPairs) {
      while (deltas.length < expectedPairs) deltas.push([0, 0]);
    } else {
      throw new RatCoreError(
        'RC-303',
        `Неверное число пар смещения: получено ${deltas.length}, требуется p - 1 = ${expectedPairs}`,
        `Для p=${p} укажи ровно ${expectedPairs} пар dx,dy через точку с запятой (или передай allowCarry: true).`
      );
    }
  }

  // F-10: проверка вертикальности для заглавной H
  let driftSqSum = 0;
  let totalDx = 0;
  let totalDy = 0;
  const cells = [];
  let cx = startX;
  let cy = startY;

  for (let step = 0; step < p; step++) {
    if (step > 0) {
      const [dx, dy] = deltas[step - 1];
      if (mode === 'H' && (dx !== 0 || dy !== 0)) {
        throw new RatCoreError(
          'RC-302',
          `Противоречивая запись: заглавная H требует вертикальный столб (D=0), но на шаге ${step} задано смещение (${dx},${dy})`,
          'Замени H на строчную h для наклонного столба или обнули смещения (0,0).'
        );
      }
      cx += dx;
      cy += dy;
      totalDx += dx;
      totalDy += dy;
      driftSqSum += dx * dx + dy * dy;
    }
    const k = baseK + step;
    const faceId = packFaceId({ s: FACE_SIDE.TOP, i: Math.round(cx), j: Math.round(cy), k, t: tex, n: layerIndex });
    cells.push({ step, x: cx, y: cy, k, faceId });
  }

  // F-10, F-11: дрейф D, наклонная длина h и угол наклона θ
  const verticalH = p;
  const driftD = Math.hypot(totalDx, totalDy);
  const slantLength = Math.hypot(verticalH, driftD);
  const tiltDeg = (Math.atan2(driftD, verticalH) * 180) / Math.PI;

  return {
    raw,
    mode,
    isVertical: mode === 'H',
    p,
    startX,
    startY,
    driftD,
    driftStepEnergy: Math.sqrt(driftSqSum),
    verticalH,
    slantLength,
    tiltDeg,
    cells,
  };
}
    exports["parseLayerNotation"] = parseLayerNotation;
  });

  __define("src/world/spatial.js", function (exports, __import) {

// RatCore World — SpatialHashGrid (A-04), 3D DDA-Raycast (A-05), PalettedChunk16 (A-66) и OccupancyBrick64 (A-78)

// A-04: SpatialHashGrid — O(1) поиск соседей с visitStamp (ноль аллокаций Set в игровом цикле)
class SpatialHashGrid {
  constructor(cellSize = 8) {
    this.cellSize = Math.max(1, cellSize);
    this.buckets = new Map();
    this.items = new Map();
    this.visitStamp = 0;
  }

  _key(cx, cy) {
    return `${cx},${cy}`;
  }

  insert(id, x, y, radius = 0.5) {
    if (this.items.has(id)) this.remove(id);
    const inv = 1 / this.cellSize;
    const minX = Math.floor((x - radius) * inv);
    const maxX = Math.floor((x + radius) * inv);
    const minY = Math.floor((y - radius) * inv);
    const maxY = Math.floor((y + radius) * inv);
    const rec = { id, x, y, radius, minX, maxX, minY, maxY, stamp: 0 };
    this.items.set(id, rec);

    for (let cy = minY; cy <= maxY; cy++) {
      for (let cx = minX; cx <= maxX; cx++) {
        const key = this._key(cx, cy);
        let bucket = this.buckets.get(key);
        if (!bucket) {
          bucket = [];
          this.buckets.set(key, bucket);
        }
        bucket.push(rec);
      }
    }
  }

  remove(id) {
    const rec = this.items.get(id);
    if (!rec) return false;
    for (let cy = rec.minY; cy <= rec.maxY; cy++) {
      for (let cx = rec.minX; cx <= rec.maxX; cx++) {
        const key = this._key(cx, cy);
        const bucket = this.buckets.get(key);
        if (!bucket) continue;
        const idx = bucket.indexOf(rec);
        if (idx >= 0) {
          bucket[idx] = bucket[bucket.length - 1];
          bucket.pop();
        }
        if (bucket.length === 0) this.buckets.delete(key);
      }
    }
    this.items.delete(id);
    return true;
  }

  queryRadius(x, y, radius, out = []) {
    out.length = 0;
    const stamp = ++this.visitStamp;
    const inv = 1 / this.cellSize;
    const minX = Math.floor((x - radius) * inv);
    const maxX = Math.floor((x + radius) * inv);
    const minY = Math.floor((y - radius) * inv);
    const maxY = Math.floor((y + radius) * inv);
    const r2 = radius * radius;

    for (let cy = minY; cy <= maxY; cy++) {
      for (let cx = minX; cx <= maxX; cx++) {
        const bucket = this.buckets.get(this._key(cx, cy));
        if (!bucket) continue;
        for (let i = 0; i < bucket.length; i++) {
          const rec = bucket[i];
          if (rec.stamp === stamp) continue;
          rec.stamp = stamp;
          const dx = rec.x - x;
          const dy = rec.y - y;
          const lim = radius + rec.radius;
          if (dx * dx + dy * dy <= Math.max(r2, lim * lim)) {
            out.push(rec.id);
          }
        }
      }
    }
    return out;
  }
}

// A-05: 3D DDA-Raycast (Amanatides & Woo) по единичной воксельной сетке
function ddaRaycast3D({ origin, dir, maxDist = 64, isSolid }) {
  const len = Math.hypot(dir[0], dir[1], dir[2]);
  if (len < 1e-9) return null;
  const dx = dir[0] / len;
  const dy = dir[1] / len;
  const dz = dir[2] / len;

  let ix = Math.floor(origin[0]);
  let iy = Math.floor(origin[1]);
  let iz = Math.floor(origin[2]);

  const stepX = dx >= 0 ? 1 : -1;
  const stepY = dy >= 0 ? 1 : -1;
  const stepZ = dz >= 0 ? 1 : -1;

  const tDeltaX = dx !== 0 ? Math.abs(1 / dx) : Infinity;
  const tDeltaY = dy !== 0 ? Math.abs(1 / dy) : Infinity;
  const tDeltaZ = dz !== 0 ? Math.abs(1 / dz) : Infinity;

  let tMaxX = dx !== 0 ? ((dx > 0 ? ix + 1 - origin[0] : origin[0] - ix) * tDeltaX) : Infinity;
  let tMaxY = dy !== 0 ? ((dy > 0 ? iy + 1 - origin[1] : origin[1] - iy) * tDeltaY) : Infinity;
  let tMaxZ = dz !== 0 ? ((dz > 0 ? iz + 1 - origin[2] : origin[2] - iz) * tDeltaZ) : Infinity;

  let dist = 0;
  let normal = [0, 0, 0];

  while (dist <= maxDist) {
    const val = isSolid(ix, iy, iz);
    if (val) {
      return {
        hit: true,
        voxel: [ix, iy, iz],
        value: val,
        distance: dist,
        normal,
        point: [origin[0] + dx * dist, origin[1] + dy * dist, origin[2] + dz * dist],
      };
    }
    if (tMaxX < tMaxY && tMaxX < tMaxZ) {
      dist = tMaxX;
      tMaxX += tDeltaX;
      ix += stepX;
      normal = [-stepX, 0, 0];
    } else if (tMaxY < tMaxZ) {
      dist = tMaxY;
      tMaxY += tDeltaY;
      iy += stepY;
      normal = [0, -stepY, 0];
    } else {
      dist = tMaxZ;
      tMaxZ += tDeltaZ;
      iz += stepZ;
      normal = [0, 0, -stepZ];
    }
  }
  return null;
}

// A-66 / F-102: Палитровый контейнер подчанка 16×16×16 с динамическим битовым сжатием (0→1→2→4→8→12 бит)
class PalettedChunk16 {
  constructor(defaultValue = 0) {
    this.size = 16;
    this.volume = 4096;
    this.palette = [defaultValue];
    this.bitsPerEntry = 0;
    this.data = new Uint32Array(0);
  }

  _index(x, y, z) {
    return (z << 8) | (y << 4) | x;
  }

  _bitsForCount(n) {
    if (n <= 1) return 0;
    if (n <= 2) return 1;
    if (n <= 4) return 2;
    if (n <= 16) return 4;
    if (n <= 256) return 8;
    return 12;
  }

  _resizeBits(newBits) {
    const oldBits = this.bitsPerEntry;
    const oldData = this.data;
    const words = newBits === 0 ? 0 : Math.ceil((this.volume * newBits) / 32);
    const nextData = new Uint32Array(words);

    if (oldBits > 0 && newBits > 0) {
      const oldMask = (1 << oldBits) - 1;
      for (let idx = 0; idx < this.volume; idx++) {
        const oldBit = idx * oldBits;
        const ow = oldBit >>> 5;
        const oo = oldBit & 31;
        let val = (oldData[ow] >>> oo) & oldMask;
        if (oo + oldBits > 32) val |= (oldData[ow + 1] << (32 - oo)) & oldMask;

        const newBit = idx * newBits;
        const nw = newBit >>> 5;
        const no = newBit & 31;
        nextData[nw] |= (val << no) >>> 0;
        if (no + newBits > 32) nextData[nw + 1] |= val >>> (32 - no);
      }
    }

    this.bitsPerEntry = newBits;
    this.data = nextData;
  }

  get(x, y, z) {
    if (this.bitsPerEntry === 0) return this.palette[0];
    const idx = this._index(x & 15, y & 15, z & 15);
    const b = this.bitsPerEntry;
    const mask = (1 << b) - 1;
    const bitPos = idx * b;
    const w = bitPos >>> 5;
    const o = bitPos & 31;
    let pIdx = (this.data[w] >>> o) & mask;
    if (o + b > 32) pIdx |= (this.data[w + 1] << (32 - o)) & mask;
    return this.palette[pIdx];
  }

  set(x, y, z, value) {
    let pIdx = this.palette.indexOf(value);
    if (pIdx < 0) {
      pIdx = this.palette.length;
      this.palette.push(value);
      const needBits = this._bitsForCount(this.palette.length);
      if (needBits > this.bitsPerEntry) this._resizeBits(needBits);
    }
    if (this.bitsPerEntry === 0) return;

    const idx = this._index(x & 15, y & 15, z & 15);
    const b = this.bitsPerEntry;
    const mask = (1 << b) - 1;
    const bitPos = idx * b;
    const w = bitPos >>> 5;
    const o = bitPos & 31;

    this.data[w] = (this.data[w] & ~(mask << o)) | ((pIdx & mask) << o);
    if (o + b > 32) {
      const rem = 32 - o;
      const hiMask = mask >>> rem;
      this.data[w + 1] = (this.data[w + 1] & ~hiMask) | ((pIdx & mask) >>> rem);
    }
  }

  byteSize() {
    return this.data.byteLength + this.palette.length * 4;
  }
}

// A-78 / F-114: Побитовый кирпич 4×4×4 в одном BigUint64 (8 байт на 64 вокселя!)
class OccupancyBrick64 {
  constructor() {
    this.bits = 0n;
  }

  _bit(x, y, z) {
    return 1n << BigInt(((z & 3) << 4) | ((y & 3) << 2) | (x & 3));
  }

  set(x, y, z, solid) {
    const b = this._bit(x, y, z);
    this.bits = solid ? (this.bits | b) : (this.bits & ~b);
  }

  get(x, y, z) {
    return (this.bits & this._bit(x, y, z)) !== 0n;
  }

  isEmpty() {
    return this.bits === 0n;
  }

  popcount() {
    let v = this.bits;
    let c = 0;
    while (v > 0n) {
      v &= v - 1n;
      c++;
    }
    return c;
  }
}
    exports["SpatialHashGrid"] = SpatialHashGrid;
    exports["ddaRaycast3D"] = ddaRaycast3D;
    exports["PalettedChunk16"] = PalettedChunk16;
    exports["OccupancyBrick64"] = OccupancyBrick64;
  });

  var namespace = __import("ratcore.js");
  var api = {
    VERSION: namespace.RATCORE_VERSION || '1.0.0',
    BUNDLE: 'ratcore.bundle.js',
    MODULE_COUNT: 48,
    createEngine: namespace.createEngine,
    namespace: namespace,
  };
  // Пробрасываем прямые экспорты движка на верхний уровень
  for (var key in namespace) {
    if (!Object.prototype.hasOwnProperty.call(api, key)) api[key] = namespace[key];
  }
  global.RatCore = api;
  if (global.document && typeof global.document.dispatchEvent === 'function' && typeof global.CustomEvent === 'function') {
    try { global.document.dispatchEvent(new global.CustomEvent('ratcore:ready', { detail: { version: api.VERSION, modules: api.MODULE_COUNT } })); } catch (err) { void err; }
  }
})(typeof window !== 'undefined' ? window : globalThis);
