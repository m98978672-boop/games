// RatCore Render — Программный 3D растровый рендерер с Z-Buffer + Object-ID буфером (A-22..A-25)
// Работает без GPU и DOM (в браузере и Node.js), служит глазами для tools.look и tools.see.
// Жёстко требует запечатанных мешей из AssetVault (сырой меш -> RC-101).

import { clamp, vec3Sub, vec3Cross, vec3Dot, vec3Normalize } from '../core/math.js';
import { RasterSurface, packRGBA, unpackRGBA } from '../assets/raster.js';
import { worldToScene } from '../world/coords.js';

export class Software3DRenderer {
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
      const { positions, indices, colors } = meshEntry.buffers;
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

        this._rasterTri(p0, p1, p2, shaded, objNumericId);
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

  _rasterTri(p0, p1, p2, color, objectId) {
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
          this.surface.pixels[idx] = color;
          this.objectIdBuffer[idx] = objectId;
        }
      }
    }
  }
}
