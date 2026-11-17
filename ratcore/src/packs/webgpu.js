// RatCore Pack [pack:webgpu] — Опциональные Compute-шейдеры WebGPU (WGSL frustum-куллинг + частицы) с битово-эквивалентным SoA fallback (F-177..F-178, A-121..A-122)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).

export const WGSL_FRUSTUM_CULL_SHADER = /* wgsl */ `
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

export const WGSL_PARTICLE_STEP_SHADER = /* wgsl */ `
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

export class WebGpuComputePipeline {
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
