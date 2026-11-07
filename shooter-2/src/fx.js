/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — эффекты: пулы частиц, трассеры, вспышки, лужи, дым
   -----------------------------------------------------------------------------
   Всё на пулах с ОДНИМ InstancedMesh на тип эффекта: 240 частиц = 1 draw call.
   Оптимизация без потери картинки: частицы за пределами экрана не обновляются,
   трассеры живут 60 мс, декали переиспользуются по кольцу.
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});
  const THREE = () => root.THREE;

  class ParticlePool {
    constructor(scene, opts) {
      const T = THREE();
      const o = opts || {};
      this.count = o.count || 200;
      this.scene = scene;
      this.geo = o.geometry || new T.BoxGeometry(o.size || 0.06, o.size || 0.06, o.size || 0.06);
      this.material = new T.MeshLambertMaterial({
        color: 0xffffff, emissive: o.emissive || 0x000000, emissiveIntensity: 1,
        transparent: true, opacity: 1, depthWrite: o.depthWrite === undefined ? true : o.depthWrite
      });
      this.mesh = new T.InstancedMesh(this.geo, this.material, this.count);
      this.mesh.instanceMatrix.setUsage && this.mesh.instanceMatrix.setUsage(T.DynamicDrawUsage || 35048);
      this.mesh.frustumCulled = false;
      this.mesh.castShadow = false;
      scene.add(this.mesh);
      this.parts = [];
      this.dummy = new T.Object3D();
      this.color = new T.Color();
      this.free = [];
      for (let i = 0; i < this.count; i++) {
        this.parts.push({ alive: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, maxLife: 1, size: 1, rot: 0, grav: 1, drag: 0.98, color: 0xffffff, fade: true });
        this.free.push(i);
        this.dummy.position.set(0, -999, 0);
        this.dummy.scale.setScalar(0.0001);
        this.dummy.updateMatrix();
        this.mesh.setMatrixAt(i, this.dummy.matrix);
        if (this.mesh.setColorAt) this.mesh.setColorAt(i, this.color.set(0xffffff));
      }
      this.mesh.instanceMatrix.needsUpdate = true;
      this.activeCount = 0;
    }

    spawn(x, y, z, vx, vy, vz, life, color, size, grav, drag) {
      let idx;
      if (this.free.length) idx = this.free.pop();
      else {
        // переиспользуем самую старую
        idx = this.parts.findIndex((p) => p.life <= 0.05);
        if (idx < 0) idx = (this._rr = ((this._rr || 0) + 1) % this.count);
      }
      const p = this.parts[idx];
      p.alive = true; p.x = x; p.y = y; p.z = z;
      p.vx = vx; p.vy = vy; p.vz = vz;
      p.life = p.maxLife = life;
      p.size = size || 1;
      p.grav = grav === undefined ? 1 : grav;
      p.drag = drag === undefined ? 0.985 : drag;
      p.rot = Math.random() * 6.28;
      p.color = color === undefined ? 0xffffff : color;
      if (this.mesh.setColorAt) this.mesh.setColorAt(idx, this.color.set(p.color));
      p.idx = idx;
      return p;
    }

    update(dt) {
      const dummy = this.dummy;
      let live = 0;
      for (let i = 0; i < this.count; i++) {
        const p = this.parts[i];
        if (!p.alive) continue;
        p.life -= dt;
        if (p.life <= 0) {
          p.alive = false;
          dummy.position.set(0, -999, 0);
          dummy.scale.setScalar(0.0001);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          this.mesh.setMatrixAt(i, dummy.matrix);
          this.free.push(i);
          continue;
        }
        live++;
        p.vy -= 9.8 * p.grav * dt;
        p.vx *= p.drag; p.vz *= p.drag;
        p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
        if (p.y < 0.02) { p.y = 0.02; p.vy *= -0.32; p.vx *= 0.62; p.vz *= 0.62; }
        const k = p.life / p.maxLife;
        const s = p.size * (0.35 + k * 0.9);
        dummy.position.set(p.x, p.y, p.z);
        dummy.rotation.set(p.rot * 3, p.rot * 2, p.rot);
        dummy.scale.setScalar(Math.max(0.0001, s));
        dummy.updateMatrix();
        this.mesh.setMatrixAt(i, dummy.matrix);
      }
      this.activeCount = live;
      this.mesh.instanceMatrix.needsUpdate = true;
      if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
      this.material.opacity = 1;
    }
  }

  class TracerPool {
    constructor(scene, count) {
      const T = THREE();
      this.count = count || 28;
      this.items = [];
      this.group = new T.Group();
      scene.add(this.group);
      const mat = new T.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.85, depthWrite: false });
      for (let i = 0; i < this.count; i++) {
        const geo = new T.CylinderGeometry(0.012, 0.012, 1, 4, 1, true);
        const m = new T.Mesh(geo, mat.clone());
        m.visible = false;
        m.frustumCulled = false;
        this.group.add(m);
        this.items.push({ mesh: m, live: 0, ax: 0, ay: 0, az: 0, bx: 0, by: 0, bz: 0 });
      }
      this.cursor = 0;
    }
    fire(ax, ay, az, bx, by, bz, color) {
      const it = this.items[this.cursor++ % this.count];
      it.ax = ax; it.ay = ay; it.az = az; it.bx = bx; it.by = by; it.bz = bz;
      it.live = 0.055;
      it.mesh.visible = true;
      it.mesh.material.color.set(color || 0xffd27a);
      const dx = bx - ax, dy = by - ay, dz = bz - az;
      const len = Math.hypot(dx, dy, dz);
      it.mesh.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
      it.mesh.scale.set(1, Math.max(0.05, len), 1);
      const T = THREE();
      const q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(dx / len, dy / len, dz / len));
      it.mesh.quaternion.copy(q);
    }
    update(dt) {
      for (const it of this.items) {
        if (it.live > 0) {
          it.live -= dt;
          it.mesh.material.opacity = Math.max(0, it.live / 0.055) * 0.85;
          if (it.live <= 0) it.mesh.visible = false;
        }
      }
    }
  }

  class FX {
    constructor(scene, audio) {
      const T = THREE();
      this.scene = scene;
      this.audio = audio;
      // частицы: искры / пыль / кровь / гильзы (разные пулы и цвета)
      this.sparks = new ParticlePool(scene, { count: 220, size: 0.045, emissive: 0xffaa33 });
      this.blood = new ParticlePool(scene, { count: 150, size: 0.075 });
      this.dust = new ParticlePool(scene, { count: 160, size: 0.09 });
      this.casings = new ParticlePool(scene, { count: 40, size: 0.022, geometry: new T.CylinderGeometry(0.012, 0.012, 0.05, 5) });
      this.smoke = new ParticlePool(scene, { count: 90, size: 0.28 });
      this.smoke.material.transparent = true;
      this.smoke.material.opacity = 0.34;
      this.smoke.material.depthWrite = false;
      this.tracers = new TracerPool(scene, 30);

      // вспышка дула: спрайт с процедурной текстурой
      const flashTex = this._flashTexture();
      this.flashes = [];
      for (let i = 0; i < 10; i++) {
        const sp = new T.Sprite(new T.SpriteMaterial({ map: flashTex, color: 0xffd9a0, transparent: true, blending: T.AdditiveBlending, depthWrite: false }));
        sp.scale.set(0.7, 0.7, 1);
        sp.visible = false;
        scene.add(sp);
        this.flashes.push({ sprite: sp, life: 0 });
      }
      this.flashCursor = 0;

      // осколки-декали попаданий (кольцо, переиспользуем)
      this.decals = [];
      const decalMat = new T.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.7, depthWrite: false });
      for (let i = 0; i < 26; i++) {
        const d = new T.Mesh(new T.CircleGeometry(0.07 + Math.random() * 0.05, 6), decalMat.clone());
        d.rotation.x = -Math.PI / 2;
        d.visible = false;
        d.renderOrder = 1;
        scene.add(d);
        this.decals.push({ mesh: d, life: 0 });
      }
      this.decalCursor = 0;

      // вспышки света от выстрелов (пул из 3, чтобы не плодить источники)
      this.lights = [];
      for (let i = 0; i < 3; i++) {
        const L = new T.PointLight(0xffb060, 0, 9, 2);
        L.visible = false;
        scene.add(L);
        this.lights.push({ light: L, life: 0, max: 0.05 });
      }
      this.lightCursor = 0;

      this.explosionRings = [];
      this.counts = { particles: 0 };
    }

    _flashTexture() {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,230,1)');
      g.addColorStop(0.25, 'rgba(255,220,140,0.95)');
      g.addColorStop(0.6, 'rgba(255,140,40,0.45)');
      g.addColorStop(1, 'rgba(255,80,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      // лучи
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.translate(32, 32);
        ctx.rotate((i / 6) * Math.PI * 2);
        ctx.fillStyle = 'rgba(255,200,120,0.35)';
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(30, -3); ctx.lineTo(30, 3); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      const tex = new (THREE().CanvasTexture)(c);
      return tex;
    }

    muzzleFlash(pos, scale) {
      const f = this.flashes[this.flashCursor++ % this.flashes.length];
      f.sprite.position.copy(pos);
      f.sprite.scale.setScalar((scale || 1) * (0.55 + Math.random() * 0.35));
      f.sprite.material.rotation = Math.random() * 6.28;
      f.sprite.visible = true;
      f.life = 0.045;
      const L = this.lights[this.lightCursor++ % this.lights.length];
      L.light.position.copy(pos);
      L.light.intensity = 3.2 * (scale || 1);
      L.light.visible = true;
      L.life = L.max = 0.05;
      // искры
      for (let i = 0; i < 3; i++) {
        this.sparks.spawn(pos.x, pos.y, pos.z,
          (Math.random() - 0.5) * 3, (Math.random() - 0.2) * 3, (Math.random() - 0.5) * 3,
          0.18 + Math.random() * 0.12, 0xffcc66, 0.7, 0.4, 0.9);
      }
    }

    tracer(ax, ay, az, bx, by, bz, color) { this.tracers.fire(ax, ay, az, bx, by, bz, color); }

    impact(pos, normal, onBlood) {
      if (onBlood) {
        for (let i = 0; i < 9; i++) {
          this.blood.spawn(pos.x, pos.y, pos.z,
            (Math.random() - 0.5) * 3.2, Math.random() * 2.6, (Math.random() - 0.5) * 3.2,
            0.4 + Math.random() * 0.5, 0x8e1b1b, 0.9 + Math.random(), 1, 0.9);
        }
        return;
      }
      for (let i = 0; i < 7; i++) {
        this.dust.spawn(pos.x, pos.y, pos.z,
          (Math.random() - 0.5) * 2.4 + (normal ? normal.x * 1.4 : 0),
          Math.random() * 2 + (normal ? normal.y * 1.4 : 0),
          (Math.random() - 0.5) * 2.4 + (normal ? normal.z * 1.4 : 0),
          0.3 + Math.random() * 0.4, 0x8a7f6d, 0.85, 0.7, 0.9);
      }
      for (let i = 0; i < 3; i++) {
        this.sparks.spawn(pos.x, pos.y, pos.z,
          (Math.random() - 0.5) * 3, Math.random() * 3, (Math.random() - 0.5) * 3,
          0.14 + Math.random() * 0.1, 0xffbb55, 0.6, 0.8, 0.92);
      }
      const d = this.decals[this.decalCursor++ % this.decals.length];
      d.mesh.position.set(pos.x + (Math.random() - 0.5) * 0.05, 0.012, pos.z + (Math.random() - 0.5) * 0.05);
      d.mesh.visible = true;
      d.life = 12;
    }

    casing(pos, right) {
      this.casings.spawn(pos.x, pos.y, pos.z,
        right.x * (1.2 + Math.random()) + (Math.random() - 0.5) * 0.6,
        1.6 + Math.random() * 1.2,
        right.z * (1.2 + Math.random()) + (Math.random() - 0.5) * 0.6,
        1.6, 0xd9b25c, 1, 1, 0.995);
    }

    explosion(pos, radius) {
      const T = THREE();
      for (let i = 0; i < 46; i++) {
        const a = Math.random() * Math.PI * 2, e = Math.random() * 1.2;
        const sp = 4 + Math.random() * 12;
        this.sparks.spawn(pos.x, pos.y + 0.3, pos.z,
          Math.cos(a) * Math.cos(e) * sp, Math.sin(e) * sp * 0.9, Math.sin(a) * Math.cos(e) * sp,
          0.5 + Math.random() * 0.7, Math.random() > 0.4 ? 0xffa33a : 0xffe08a, 1.6 + Math.random() * 1.4, 1, 0.96);
      }
      for (let i = 0; i < 22; i++) {
        const a = Math.random() * Math.PI * 2;
        this.smoke.spawn(pos.x, pos.y + 0.4, pos.z,
          Math.cos(a) * (1 + Math.random() * 4), 1.2 + Math.random() * 3.4, Math.sin(a) * (1 + Math.random() * 4),
          1.3 + Math.random() * 1.2, 0x5a5a5a, 2.4 + Math.random() * 1.6, -0.05, 0.94);
      }
      const ring = new T.Mesh(new T.RingGeometry(0.4, radius * 0.9, 26),
        new T.MeshBasicMaterial({ color: 0xffc46b, transparent: true, opacity: 0.75, side: T.DoubleSide, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(pos.x, 0.06, pos.z);
      this.scene.add(ring);
      this.explosionRings.push({ mesh: ring, life: 0.45, max: 0.45 });
      const L = this.lights[this.lightCursor++ % this.lights.length];
      L.light.position.set(pos.x, pos.y + 1.2, pos.z);
      L.light.intensity = 14;
      L.light.distance = 26;
      L.light.visible = true;
      L.life = L.max = 0.22;
      if (this.audio) this.audio.explosion(pos.x, pos.z);
    }

    update(dt) {
      this.sparks.update(dt);
      this.blood.update(dt);
      this.dust.update(dt);
      this.casings.update(dt);
      this.smoke.update(dt);
      this.tracers.update(dt);
      this.counts.particles = this.sparks.activeCount + this.blood.activeCount + this.dust.activeCount + this.casings.activeCount + this.smoke.activeCount;
      for (const f of this.flashes) {
        if (f.life > 0) {
          f.life -= dt;
          f.sprite.material.opacity = Math.max(0, f.life / 0.045);
          if (f.life <= 0) f.sprite.visible = false;
        }
      }
      for (const L of this.lights) {
        if (L.life > 0) {
          L.life -= dt;
          const k = Math.max(0, L.life / L.max);
          L.light.intensity *= 0.82;
          if (L.life <= 0) { L.light.visible = false; L.light.distance = 9; }
        }
      }
      for (const d of this.decals) {
        if (d.life > 0) { d.life -= dt; if (d.life <= 0) d.mesh.visible = false; }
      }
      for (let i = this.explosionRings.length - 1; i >= 0; i--) {
        const r = this.explosionRings[i];
        r.life -= dt;
        const k = 1 - r.life / r.max;
        r.mesh.scale.setScalar(0.6 + k * 1.6);
        r.mesh.material.opacity = Math.max(0, 0.75 * (1 - k));
        if (r.life <= 0) { this.scene.remove(r.mesh); r.mesh.geometry.dispose(); r.mesh.material.dispose(); this.explosionRings.splice(i, 1); }
      }
    }

    reset() {
      [this.sparks, this.blood, this.dust, this.casings, this.smoke].forEach((pool) => {
        pool.parts.forEach((p, i) => {
          if (p.alive) {
            p.alive = false; p.life = 0;
            pool.dummy.position.set(0, -999, 0); pool.dummy.scale.setScalar(0.0001); pool.dummy.updateMatrix();
            pool.mesh.setMatrixAt(i, pool.dummy.matrix);
            pool.free.push(i);
          }
        });
        pool.mesh.instanceMatrix.needsUpdate = true;
      });
      this.decals.forEach((d) => { d.mesh.visible = false; d.life = 0; });
      this.explosionRings.forEach((r) => this.scene.remove(r.mesh));
      this.explosionRings.length = 0;
    }
  }

  SH2.fx = { FX, ParticlePool, TracerPool };
})(typeof window !== 'undefined' ? window : globalThis);
