// ============================================================================
//  3D-СТРУИ ВОДОСБРОСОВ, ВОДЯНАЯ ПЫЛЬ И ЛИВЕНЬ (Zero-GC Ring Buffer, 1 draw call)
// ============================================================================

import * as THREE from 'three';
import { WORLD } from './config.js';

export class SprayAndRainSystem {
  constructor(scene, maxParticles = 2800) {
    this.max = maxParticles;
    this.head = 0;

    this.positions = new Float32Array(this.max * 3);
    this.velocities = new Float32Array(this.max * 3);
    this.life = new Float32Array(this.max);
    this.maxLife = new Float32Array(this.max);
    this.sizes = new Float32Array(this.max);
    this.kinds = new Uint8Array(this.max);

    const geo = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(this.positions, 3);
    this.posAttr.setUsage(THREE.DynamicDrawUsage);
    this.sizeAttr = new THREE.BufferAttribute(this.sizes, 1);
    this.sizeAttr.setUsage(THREE.DynamicDrawUsage);
    this.alphaAttr = new THREE.BufferAttribute(new Float32Array(this.max), 1);
    this.alphaAttr.setUsage(THREE.DynamicDrawUsage);

    geo.setAttribute('position', this.posAttr);
    geo.setAttribute('aSize', this.sizeAttr);
    geo.setAttribute('aAlpha', this.alphaAttr);

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uLight: { value: 1.0 },
        uPixelRatio: { value: Math.min(typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1, 2) },
      },
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute float aAlpha;
        uniform float uPixelRatio;
        varying float vAlpha;

        void main() {
          vAlpha = aAlpha;
          if (aAlpha <= 0.005) {
            gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
            gl_PointSize = 0.0;
            return;
          }
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp((aSize * 225.0 * uPixelRatio) / max(1.0, -mv.z), 1.5, 48.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uLight;
        varying float vAlpha;

        void main() {
          vec2 p = gl_PointCoord * 2.0 - 1.0;
          float r2 = dot(p, p);
          if (r2 > 1.0) discard;
          float soft = pow(1.0 - r2, 1.6);
          vec3 col = vec3(0.93, 0.97, 1.0) * (0.45 + 0.55 * uLight);
          gl_FragColor = vec4(col, vAlpha * soft);
        }
      `,
    });

    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.points.matrixAutoUpdate = false;
    scene.add(this.points);

    const rainCount = 380;
    this.rainCount = rainCount;
    const rainPos = new Float32Array(rainCount * 6);
    this.rainSeeds = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      this.rainSeeds[i * 3] = (Math.random() - 0.5) * 210;
      this.rainSeeds[i * 3 + 1] = Math.random() * 80;
      this.rainSeeds[i * 3 + 2] = (Math.random() - 0.5) * 210;
    }
    const rainGeo = new THREE.BufferGeometry();
    this.rainAttr = new THREE.BufferAttribute(rainPos, 3);
    this.rainAttr.setUsage(THREE.DynamicDrawUsage);
    rainGeo.setAttribute('position', this.rainAttr);
    this.rainMat = new THREE.LineBasicMaterial({
      color: 0xcfe4ff,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
    });
    this.rainLines = new THREE.LineSegments(rainGeo, this.rainMat);
    this.rainLines.visible = false;
    this.rainLines.frustumCulled = false;
    scene.add(this.rainLines);
  }

  spawn(wx, wy, wz, vx, vy, vz, size, maxLife, kind = 1) {
    const i = this.head;
    this.head = (this.head + 1) % this.max;
    const i3 = i * 3;
    this.positions[i3] = wx;
    this.positions[i3 + 1] = wy;
    this.positions[i3 + 2] = wz;
    this.velocities[i3] = vx;
    this.velocities[i3 + 1] = vy;
    this.velocities[i3 + 2] = vz;
    this.life[i] = maxLife;
    this.maxLife[i] = maxLife;
    this.sizes[i] = size;
    this.kinds[i] = kind;
  }

  spawnDigSplash(wx, wy, wz, count = 12) {
    const pScale = Math.pow(WORLD.horizScale, 0.55);
    for (let k = 0; k < count; k++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = (1.5 + Math.random() * 4.0) * pScale * 0.65;
      this.spawn(
        wx + (Math.random() - 0.5) * 3 * pScale,
        wy + 0.5 * WORLD.elevScale,
        wz + (Math.random() - 0.5) * 3 * pScale,
        Math.cos(ang) * spd,
        (2.5 + Math.random() * 4.5) * Math.sqrt(WORLD.elevScale),
        Math.sin(ang) * spd,
        (1.1 + Math.random() * 0.8) * pScale,
        0.55 + Math.random() * 0.35,
        1,
      );
    }
  }

  update(dt, hydro, camTarget, sunLightFactor = 1.0, rainIntensity = 0) {
    this.points.material.uniforms.uLight.value = sunLightFactor;
    const pScale = Math.pow(WORLD.horizScale, 0.52);

    const emitters = hydro.jetEmitters;
    for (let e = 0; e < emitters.length; e++) {
      const em = emitters[e];
      const count = em.kind === 'spillway' ? Math.ceil(4 * em.intensity) : Math.ceil(3 * em.intensity);
      for (let k = 0; k < count; k++) {
        const spread = (em.kind === 'spillway' ? 2.4 : 3.2) * pScale;
        this.spawn(
          em.wx + (Math.random() - 0.5) * spread,
          em.wy + Math.random() * 0.6 * pScale,
          em.wz + (Math.random() - 0.5) * spread,
          em.vx * (0.85 + Math.random() * 0.3) + (Math.random() - 0.5) * 1.4 * pScale,
          em.vy + (Math.random() - 0.3) * 1.6,
          em.vz * (0.85 + Math.random() * 0.3) + (Math.random() - 0.5) * 1.4 * pScale,
          (em.kind === 'spillway' ? (1.6 + Math.random() * 1.5) : (1.3 + Math.random() * 1.1)) * pScale,
          0.95 + Math.random() * 0.55,
          1,
        );
      }
      if (Math.random() < 0.65) {
        this.spawn(
          em.wx + em.vx * 0.5 + (Math.random() - 0.5) * 5.0 * pScale,
          em.wy - 0.5,
          em.wz + em.vz * 0.5 + (Math.random() - 0.5) * 5.0 * pScale,
          (Math.random() - 0.5) * 1.2 * pScale,
          (1.4 + Math.random() * 1.8) * Math.sqrt(WORLD.elevScale),
          (Math.random() - 0.5) * 1.2 * pScale,
          (3.4 + Math.random() * 2.6) * pScale,
          1.5 + Math.random() * 0.9,
          2,
        );
      }
    }

    const alphas = this.alphaAttr.array;
    let anyAlive = false;
    for (let i = 0; i < this.max; i++) {
      const kind = this.kinds[i];
      if (kind === 0) {
        alphas[i] = 0;
        continue;
      }
      this.life[i] -= dt;
      if (this.life[i] <= 0) {
        this.kinds[i] = 0;
        alphas[i] = 0;
        continue;
      }

      anyAlive = true;
      const i3 = i * 3;
      if (kind === 1) {
        this.velocities[i3] *= (1.0 - dt * 0.35);
        this.velocities[i3 + 1] -= WORLD.gravity * dt * 0.92;
        this.velocities[i3 + 2] *= (1.0 - dt * 0.35);
      } else {
        this.velocities[i3] *= (1.0 - dt * 1.2);
        this.velocities[i3 + 1] = Math.max(0.3, this.velocities[i3 + 1] - dt * 0.9);
        this.velocities[i3 + 2] *= (1.0 - dt * 1.2);
        this.sizes[i] += dt * 1.4 * pScale;
      }

      const nx = this.positions[i3] + this.velocities[i3] * dt;
      const ny = this.positions[i3 + 1] + this.velocities[i3 + 1] * dt;
      const nz = this.positions[i3 + 2] + this.velocities[i3 + 2] * dt;

      this.positions[i3] = nx;
      this.positions[i3 + 1] = ny;
      this.positions[i3 + 2] = nz;

      if (kind === 1 && Math.abs(nx) < WORLD.size * 0.49 && Math.abs(nz) < WORLD.size * 0.49) {
        const gPos = hydro.worldToGrid(nx, nz);
        const cell = gPos.gz * hydro.grid + gPos.gx;
        const surfY = hydro.zb[cell] + hydro.h[cell];
        if (ny <= surfY) {
          hydro.foam[cell] = Math.min(1.0, hydro.foam[cell] + 0.35);
          this.kinds[i] = 0;
          alphas[i] = 0;
          continue;
        }
      }

      const t = this.life[i] / (this.maxLife[i] || 1);
      alphas[i] = kind === 1 ? Math.min(0.78, t * 1.2) : Math.sin(t * Math.PI) * 0.24;
    }

    if (anyAlive || emitters.length > 0) {
      this.posAttr.needsUpdate = true;
      this.sizeAttr.needsUpdate = true;
      this.alphaAttr.needsUpdate = true;
    }

    if (rainIntensity > 0.05) {
      this.rainLines.visible = true;
      this.rainMat.opacity = Math.min(0.45, rainIntensity * 0.35);
      const rp = this.rainAttr.array;
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const rSpan = Math.pow(WORLD.horizScale, 0.55);
      const fall = (now * 0.065) % (70 * rSpan);
      for (let i = 0; i < this.rainCount; i++) {
        const s3 = i * 3;
        const x = camTarget.x + this.rainSeeds[s3] * rSpan;
        let y = this.rainSeeds[s3 + 1] * rSpan - fall;
        if (y < 0) y += 70 * rSpan;
        y += camTarget.y * 0.3 + 6 * rSpan;
        const z = camTarget.z + this.rainSeeds[s3 + 2] * rSpan;
        const i6 = i * 6;
        rp[i6] = x;
        rp[i6 + 1] = y;
        rp[i6 + 2] = z;
        rp[i6 + 3] = x + 0.6 * rSpan;
        rp[i6 + 4] = y - 3.8 * rSpan;
        rp[i6 + 5] = z + 0.4 * rSpan;
      }
      this.rainAttr.needsUpdate = true;
    } else {
      this.rainLines.visible = false;
    }
  }
}
