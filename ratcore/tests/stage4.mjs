// Автотест Этапа 4 RatCore v0.4:
// 1. WebGL2Renderer (GLSL ES 3.00, Async Shader Pre-Warm, Upload-and-Drop, Object-ID pass, ToolGuard Барьер 2)
// 2. pack:webgpu (Zero-Cost Opt-In RC-108 + WGSL @workgroup_size(64) frustum cull и частицы)
// 3. pack:wasm-accel (Zero-Cost Opt-In RC-108 + живой бинарный WebAssembly-модуль + SIMD v128 проба + FNV-1a/Delta/Gravity)
// 4. RatCoreWorkerPool (реальные node:worker_threads под CoreGovernor 75% CPU + Transferable + приоритеты P0..P3 + чистое завершение)

import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  RATCORE_VERSION,
  createEngine,
  createHeadlessWebGL2Context,
  buildRatCoreWasmBytes,
} from '../ratcore.js';

const manifest = JSON.parse(fs.readFileSync(new URL('../tools-manifest.json', import.meta.url), 'utf8'));

function refFnv1a32(bytes) {
  let h = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i++) {
    h ^= bytes[i];
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

async function main() {
  assert.ok(typeof RATCORE_VERSION === 'string' && RATCORE_VERSION.length > 0);

  const engine = createEngine({
    preset: 'arcade-3d',
    seed: 4040,
    manifest,
    viewport: { width: 160, height: 90 },
  });

  // ── 1. Zero-Cost Opt-In для pack:webgpu и pack:wasm-accel ───────────────
  const deniedGpu = engine.tools.webgpu.frustumCull({});
  assert.equal(deniedGpu.ok, false);
  assert.equal(deniedGpu.error.code, 'RC-108');

  const deniedWasm = engine.tools.wasm.benchmark({});
  assert.equal(deniedWasm.ok, false);
  assert.equal(deniedWasm.error.code, 'RC-108');

  // ── 2. WebGL2Renderer: Headless GL2 + Async Pre-Warm + Upload-and-Drop ──
  const tower = engine.tools.build.fromRecipe({
    modelId: 'gl2_citadel',
    ops: [
      { tool: 'build.primitive', args: { shape: 'box', w: 2.5, h: 3.5, d: 2.5, color: '#38bdf8' } },
      { tool: 'build.primitive', args: { shape: 'roof', w: 2.8, h: 1.5, d: 2.8, color: '#f59e0b' }, offset: [0, 3.5, 0] },
    ],
  });
  assert.equal(tower.ok, true);
  assert.equal(engine.tools.build.placeEntity({ id: 'citadel_gl', mesh: tower.data, x: 0, y: 0, h: 1, allowWater: true }).ok, true);
  engine.tools.look.at({ x: 8, y: -8, h: 6, targetX: 0, targetY: 0, targetH: 2 });

  const mockGl = createHeadlessWebGL2Context();
  const sw = engine.tools.look.setBackend({ backend: 'webgl2', gl: mockGl, width: 160, height: 90 });
  assert.equal(sw.ok, true);
  assert.equal(sw.data.backend, 'webgl2');
  assert.equal(sw.data.available, true);

  // Пошаговый Async Shader Pre-Warm (2 шага: main-lit и object-id)
  const w1 = engine.tools.look.shaderPrewarm({});
  assert.equal(w1.ok, true);
  assert.equal(w1.data.compiledId, 'main-lit');
  assert.equal(w1.data.done, false);

  const w2 = engine.tools.look.shaderPrewarm({});
  assert.equal(w2.ok, true);
  assert.equal(w2.data.compiledId, 'object-id');
  assert.equal(w2.data.done, true);
  assert.equal(mockGl.__log.shaders, 4);
  assert.equal(mockGl.__log.programs, 2);

  const frame1 = engine.tools.look.renderWebGL2({ objectIdPass: true });
  assert.equal(frame1.ok, true);
  assert.equal(frame1.data.backend, 'webgl2');
  assert.equal(frame1.data.pass, 'object-id');
  assert.equal(frame1.data.drawCalls, 1);
  assert.ok(frame1.data.drawnTris >= 16);
  assert.equal(frame1.data.uploadedMeshes, 1);
  assert.ok(frame1.data.vramBytesEstimate > 0);

  const buffersAfterFirst = mockGl.__log.buffers;
  const frame2 = engine.tools.look.renderWebGL2({ objectIdPass: false });
  assert.equal(frame2.ok, true);
  assert.equal(frame2.data.pass, 'main-lit');
  // Upload-and-Drop: повторный кадр не пересоздаёт GPU-буферы того же запечатанного меша!
  assert.equal(mockGl.__log.buffers, buffersAfterFirst);
  assert.ok(mockGl.__log.drawCalls >= 2);

  // Барьер 2: поддельный меш не может проскочить в рендерер
  const cheatRes = engine.tools.build.placeEntity({
    id: 'fake_gl_mesh',
    mesh: { id: 'forged', buffers: { positions: new Float32Array([0, 0, 0]) } },
    x: 1, y: 1, h: 0,
  });
  assert.equal(cheatRes.ok, false);
  assert.equal(cheatRes.error.code, 'RC-101');

  // Переключение обратно на Software 3D работает бесшовно
  assert.equal(engine.tools.look.setBackend({ backend: 'software' }).data.backend, 'software');

  // ── 3. pack:webgpu (WGSL @workgroup_size(64) Frustum Cull & Particles) ──
  engine.enablePack('pack:webgpu');
  const shaders = engine.tools.webgpu.shaders();
  assert.equal(shaders.ok, true);
  assert.match(shaders.data.frustumCull, /@compute @workgroup_size\(64\)/);
  assert.match(shaders.data.particleStep, /@compute @workgroup_size\(64\)/);

  // 256 сфер: 128 внутри фрустума (z in [10..30]), 128 позади ближней плоскости (z < -120)
  const spheres = new Float32Array(256 * 4);
  for (let i = 0; i < 256; i++) {
    spheres[i * 4] = (i % 16) - 8;
    spheres[i * 4 + 1] = 2;
    spheres[i * 4 + 2] = i < 128 ? 10 + (i % 20) : -140 - i;
    spheres[i * 4 + 3] = 1.5;
  }
  const planes = new Float32Array([
    1, 0, 0, 50,
    -1, 0, 0, 50,
    0, 1, 0, 50,
    0, -1, 0, 50,
    0, 0, 1, 0,     // near: z >= -r
    0, 0, -1, 100,  // far:  z <= 100 + r
  ]);
  const cull = engine.tools.webgpu.frustumCull({ spheres, planes });
  assert.equal(cull.ok, true);
  assert.equal(cull.data.totalSpheres, 256);
  assert.equal(cull.data.visibleCount, 128);
  assert.equal(cull.data.culledCount, 128);
  assert.equal(cull.data.workgroups, 4);

  // 64 частицы в плоском WGSL-буфере (x, y, z, life, vx, vy, vz, pad)
  const particles = new Float32Array(64 * 8);
  for (let i = 0; i < 64; i++) {
    particles[i * 8 + 1] = 0.05; // y прямо над полом
    particles[i * 8 + 3] = 2.0;  // life
    particles[i * 8 + 5] = -5.0; // vy вниз
  }
  const pStep = engine.tools.webgpu.stepParticles({ buffer: particles, dt: 0.1 });
  assert.equal(pStep.ok, true);
  assert.equal(pStep.data.totalParticles, 64);
  assert.equal(pStep.data.aliveCount, 64);
  assert.ok(particles[1] >= 0, 'частица не провалилась сквозь пол');
  assert.ok(particles[5] > 0, 'частица отскочила от пола вверх');

  // ── 4. pack:wasm-accel (живой бинарный WebAssembly + SIMD v128 проба) ───
  const rawWasm = buildRatCoreWasmBytes();
  assert.equal(WebAssembly.validate(rawWasm), true, 'Собранный бинарный WASM обязан проходить WebAssembly.validate');

  engine.enablePack('pack:wasm-accel');
  const wasmStatus = engine.tools.wasm.status();
  assert.equal(wasmStatus.ok, true);
  assert.equal(wasmStatus.data.supported, true);
  assert.ok(wasmStatus.data.wasmBinaryBytes > 100 && wasmStatus.data.wasmBinaryBytes < 2048);

  // Побитовое совпадение WASM FNV-1a 32-bit с эталоном JS
  const sampleBytes = new TextEncoder().encode('RatCore-v0.4-WebAssembly-ToolGuard-RCW2');
  const wasmHash = engine.tools.wasm.fnv1a32({ bytes: sampleBytes });
  assert.equal(wasmHash.ok, true);
  assert.equal(wasmHash.data.hash, refFnv1a32(sampleBytes));

  // Delta-кодирование / декодирование Int32 round-trip без потерь
  const ints = new Int32Array([100, 105, 102, 140, 140, -25, 0, 9999, 10004]);
  const enc = engine.tools.wasm.deltaEncode({ values: ints });
  assert.equal(enc.ok, true);
  assert.deepEqual([...enc.data.encoded], [100, 5, -3, 38, 0, -165, 25, 9999, 5]);
  const dec = engine.tools.wasm.deltaDecode({ encoded: enc.data.encoded });
  assert.equal(dec.ok, true);
  assert.deepEqual([...dec.data.decoded], [...ints]);

  // Батчевая физика гравитации в линейной памяти WASM
  const posY = new Float32Array([10, 0.2, 5, 1]);
  const velY = new Float32Array([0, -4, 1, -10]);
  const grav = engine.tools.wasm.stepGravity({ posY, velY, dt: 0.2, gravity: 9.81 });
  assert.equal(grav.ok, true);
  assert.equal(grav.data.count, 4);
  assert.ok(grav.data.posY[0] < 10);
  assert.ok(grav.data.posY[1] >= 0 && grav.data.velY[1] > 0, 'отскок от пола внутри WASM');

  const bench = engine.tools.wasm.benchmark({ count: 4096 });
  assert.equal(bench.ok, true);
  assert.equal(bench.data.hashesMatch, true);
  assert.equal(typeof bench.data.simdSupported, 'boolean');

  // ── 5. Многоядерный RatCoreWorkerPool (реальные node:worker_threads + 75%) ─
  const poolStats0 = engine.tools.stream.workerPoolStats();
  assert.equal(poolStats0.ok, true);
  // Zero-Cost ленивость: до первой задачи потоки ОС не тратят ресурсы!
  assert.equal(poolStats0.data.runtime, 'uninitialized');
  assert.equal(poolStats0.data.activeWorkers, 0);
  assert.ok(poolStats0.data.targetWorkers >= 1);

  const payload = new Uint8Array(4096);
  for (let i = 0; i < payload.length; i++) payload[i] = (i * 31) & 0xff;
  const expectedHash = refFnv1a32(payload);

  const t1 = await engine.tools.stream.dispatchWorkerTask({
    task: 'hashChunk',
    priority: 'P1',
    payload,
    transfer: [payload.buffer],
  }).data;
  assert.equal(t1.hash, expectedHash);
  assert.equal(t1.bytes, 4096);

  // Параллельный залп задач P0..P3 (проверка балансировки, Transferable и статистики)
  const pPos = new Float32Array([5, 0.1, 12]);
  const pVel = new Float32Array([0, -5, 1]);
  const [pPhys, pTerrain, pSum] = await Promise.all([
    engine.tools.stream.dispatchWorkerTask({
      task: 'stepBatchPhysics',
      priority: 'P0',
      payload: { posY: pPos.buffer, velY: pVel.buffer, dt: 0.1, gravity: 9.81 },
      transfer: [pPos.buffer, pVel.buffer],
    }).data,
    engine.tools.stream.dispatchWorkerTask({
      task: 'genTerrainStripe',
      priority: 'P2',
      payload: { width: 32, startY: 0, rows: 16, seed: 42 },
    }).data,
    engine.tools.stream.dispatchWorkerTask({
      task: 'computeSum',
      priority: 'P3',
      payload: new Float32Array([1.5, 2.5, 3, 4]),
    }).data,
  ]);
  assert.equal(pPhys.count, 3);
  assert.ok(new Float32Array(pPhys.posY)[1] >= 0);
  assert.equal(new Float32Array(pTerrain.heights).length, 32 * 16);
  assert.equal(pSum.sum, 11);

  const poolStats1 = engine.tools.stream.workerPoolStats().data;
  assert.equal(poolStats1.runtime, 'node-worker-threads');
  assert.ok(poolStats1.activeWorkers >= 1 && poolStats1.activeWorkers <= poolStats1.targetWorkers);
  assert.ok(poolStats1.totalCompleted >= 4);

  // Понижаем профиль мощности до eco (40%) — пул воркеров мгновенно подрезается
  engine.tools.stream.setPowerProfile({ mode: 'eco' });
  const syncRes = await engine.tools.stream.syncWorkers().data;
  assert.ok(syncRes.activeWorkers <= syncRes.targetWorkers);

  // Чистая остановка всех worker_threads, чтобы Node.js завершился мгновенно
  const shut = await engine.tools.stream.shutdownWorkers().data;
  assert.equal(shut.terminated, true);
  assert.equal(engine.tools.stream.workerPoolStats().data.activeWorkers, 0);

  // ── 6. BM25 tools.discover знает про Этап 4 ─────────────────────────────
  const d1 = engine.tools.discover({ intent: 'wasm simd webassembly', limit: 3 });
  assert.ok(d1.data.matches.some((r) => r.id.startsWith('wasm.')));
  const d2 = engine.tools.discover({ intent: 'webgl2 shader prewarm', limit: 3 });
  assert.ok(d2.data.matches.some((r) => r.id.startsWith('look.')));
  const d3 = engine.tools.discover({ intent: 'webgpu wgsl compute culling', limit: 3 });
  assert.ok(d3.data.matches.some((r) => r.id === 'webgpu.frustumCull'));
  const d4 = engine.tools.discover({ intent: 'worker threads multicore 75%', limit: 3 });
  assert.ok(d4.data.matches.some((r) => r.id === 'stream.dispatchWorkerTask'));

  console.log('PASS ratcore/tests/stage4.mjs', {
    version: RATCORE_VERSION,
    webgl2: { prewarmed: 2, uploadAndDrop: true, drawCalls: mockGl.__log.drawCalls, uploadedBytes: mockGl.__log.uploadedBytes },
    webgpu: { visible: cull.data.visibleCount, culled: cull.data.culledCount, workgroups: cull.data.workgroups },
    wasm: { sizeBytes: wasmStatus.data.wasmBinaryBytes, simdSupported: bench.data.simdSupported, wasmMs: bench.data.wasmMs, jsMs: bench.data.jsMs },
    workerPool: { runtime: poolStats1.runtime, workersUsed: poolStats1.activeWorkers, completedTasks: poolStats1.totalCompleted },
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
