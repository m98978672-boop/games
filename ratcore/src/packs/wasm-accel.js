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
export function buildRatCoreWasmBytes() {
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

export class WasmAccelerator {
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
