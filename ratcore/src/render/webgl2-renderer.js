// RatCore Stage 4 — Аппаратный WebGL2 рендерер поверх ToolGuard + Object-ID проход + Upload-and-Drop (A-77) + Async Shader Pre-Warm (A-114, F-172)
// Работает на живом WebGL2RenderingContext в браузере и на виртуальном GL-контексте в headless тестах.

import { worldToScene } from '../world/coords.js';
import { clamp } from '../core/math.js';
import { unpackRGBA } from '../assets/raster.js';

export const WEBGL2_VERT_MAIN = `#version 300 es
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

export const WEBGL2_FRAG_MAIN = `#version 300 es
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

export const WEBGL2_VERT_OBJECT_ID = `#version 300 es
precision highp float;
layout(location = 0) in vec3 a_pos;
uniform mat4 u_mvp;
void main() {
  gl_Position = u_mvp * vec4(a_pos, 1.0);
}
`;

export const WEBGL2_FRAG_OBJECT_ID = `#version 300 es
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

export class WebGL2Renderer {
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
export function createHeadlessWebGL2Context() {
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
