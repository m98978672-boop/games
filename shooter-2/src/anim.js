/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — рантайм анимаций
   -----------------------------------------------------------------------------
   Слои: база (всё тело) + верх (руки/оружие) + событие (выстрел, ранение).
   Каждый слой выбирает клип и вариант; веса смешиваются, позы сглаживаются,
   поэтому переходы не «щёлкают». Кривые пары (часть, клип, вариант)
   строятся один раз и кэшируются — 1760 клипов не считаются в каждом кадре.
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});
  const D = SH2.data;

  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ------------------------------- кэш кривых ------------------------------ */
  const curveCache = new Map();
  let curveBuilds = 0;
  function curve(partId, clipId, variantIndex) {
    const key = partId + '|' + clipId + '|' + variantIndex;
    let c = curveCache.get(key);
    if (!c) {
      c = D.clipCurve(partId, clipId, variantIndex);
      curveCache.set(key, c);
      curveBuilds++;
    }
    return c;
  }

  function sampleTrack(frames, t) {
    const n = frames.length;
    if (t <= frames[0][0]) return frames[0][1];
    if (t >= frames[n - 1][0]) return frames[n - 1][1];
    for (let i = 1; i < n; i++) {
      if (t <= frames[i][0]) {
        const a = frames[i - 1], b = frames[i];
        const span = b[0] - a[0] || 1;
        const u = (t - a[0]) / span;
        return lerp(a[1], b[1], u * u * (3 - 2 * u)); // smoothstep: мягкие суставы
      }
    }
    return frames[n - 1][1];
  }

  const UPPER = D.PARTS
    .filter((p) => p.group === 'arms' || p.group === 'weapon' || p.id === 'chest' || p.id === 'neck' || p.id === 'head')
    .map((p) => p.id);
  const FULL = D.PARTS.map((p) => p.id);
  const LOWER = D.PARTS.filter((p) => p.group === 'core' || p.group === 'legs').map((p) => p.id);

  /* ---------------------------- библиотека API ---------------------------- */
  function curvePublic(partId, clipId, variantIndex) { return curve(partId, clipId, variantIndex); }

  const library = {
    parts: () => D.PARTS,
    clips: () => D.CLIPS,
    variants: () => D.VARIANTS,
    clipsFor: (partId) => {
      const role = (D.PART_BY_ID[partId] || {}).role;
      const channels = D.CHANNELS.slice(0, role === 'root' ? 5 : 3);
      return D.CLIPS.map((c) => ({
        id: c.id, name: c.label, duration: c.dur, loop: c.loop, tag: c.tag,
        variants: D.VARIANTS.length, tracks: channels
      }));
    },
    curve: curvePublic,
    sample: (partId, clipId, variantIndex, phase) => {
      const c = curve(partId, clipId, variantIndex);
      const out = {};
      D.CHANNELS.forEach((ch) => { if (c[ch]) out[ch] = sampleTrack(c[ch], clamp01(phase)); });
      return out;
    },
    counts: () => {
      const counts = {};
      D.PARTS.forEach((p) => { counts[p.id] = D.CLIPS.length * D.VARIANTS.length; });
      return counts;
    },
    totals: () => D.TOTALS,
    curveBuilds: () => curveBuilds,
    cacheSize: () => curveCache.size,
    resetCaches: () => { curveCache.clear(); curveBuilds = 0; }
  };

  /* ------------------------------ аниматор -------------------------------- */
  class Animator {
    constructor(rig, opts) {
      const o = opts || {};
      this.rig = rig;
      this.layers = [null, null, null];
      this.parts = D.PARTS;
      this.basePos = rig.basePositions;
      this.current = {};
      D.PARTS.forEach((p) => { this.current[p.id] = { rx: 0, ry: 0, rz: 0, tx: 0, ty: 0, tz: 0 }; });
      this.variant = o.variant || 0;
      this.updateEvery = o.updateEvery || 1;
      this.smooth = o.smooth === undefined ? 15 : o.smooth;
      this.frame = 0;
      this.currentClip = '';
      this.currentVariant = 0;
      this.groundOffset = 0;      // автоподстройка по земле (стопы не проваливаются)
      this.groundLock = o.groundLock === undefined ? 1 : o.groundLock;
    }

    /* --- слои --- */
    setBase(clipId, opts) {
      const o = opts || {};
      return this._setLayer(0, clipId, o.variant === undefined ? this.variant : o.variant, FULL, o);
    }
    setUpper(clipId, opts) {
      const o = opts || {};
      if (!clipId) { this._clearLayer(1, o.fade); return null; }
      return this._setLayer(1, clipId, o.variant === undefined ? this.variant : o.variant, o.parts || UPPER, o);
    }
    setEvent(clipId, opts) {
      const o = opts || {};
      if (!clipId) { this._clearLayer(2, o.fade); return null; }
      return this._setLayer(2, clipId, o.variant === undefined ? this.variant : o.variant, o.parts || FULL, o);
    }
    setVariant(v) { this.variant = v | 0; }

    _setLayer(index, clipId, variant, parts, o) {
      const clip = D.CLIP_BY_ID[clipId];
      if (!clip) return null;
      const targetW = o.weight === undefined ? 1 : o.weight;
      let L = this.layers[index];
      if (L && L.clip === clipId && L.variant === variant && L.parts === parts) {
        L.targetWeight = targetW;
        if (o.restart) L.time = 0;
        return L;
      }
      const variantSpeed = (D.VARIANTS[variant] || D.VARIANTS[0]).speed;
      L = {
        clip: clipId, variant, parts,
        weight: o.instant ? targetW : 0, targetWeight: targetW,
        time: 0, speed: o.speed === undefined ? 1 : o.speed,
        loop: clip.loop, dur: Math.max(0.05, clip.dur / variantSpeed),
        fade: o.fade === undefined ? 9 : (o.fade > 0 ? 1 / o.fade : 999),
        additive: !!o.additive, startDelay: o.delay || 0
      };
      this.layers[index] = L;
      if (index === 0) { this.currentClip = clipId; this.currentVariant = variant; }
      return L;
    }
    _clearLayer(index, fade) {
      const L = this.layers[index];
      if (L) L.targetWeight = 0;
    }

    /* --- обновление --- */
    update(dt) {
      if (!(dt > 0)) return;
      if (dt > 0.12) dt = 0.12;
      this.frame++;
      if (this.updateEvery > 1 && (this.frame % this.updateEvery) !== 0) return;

      for (let i = 0; i < this.layers.length; i++) {
        const L = this.layers[i];
        if (!L) continue;
        if (L.startDelay > 0) { L.startDelay -= dt; continue; }
        const rate = Math.min(1, L.fade * dt);
        L.weight += (L.targetWeight - L.weight) * rate;
        if (L.loop) L.time = (L.time + dt * L.speed) % L.dur;
        else {
          L.time = Math.min(L.dur, L.time + dt * L.speed);
          if (L.time >= L.dur && i > 0) L.targetWeight = 0;
        }
        if (L.weight < 0.004 && L.targetWeight < 0.01 && i > 0) this.layers[i] = null;
      }

      const k = 1 - Math.exp(-this.smooth * dt);
      const bones = this.rig.bones;
      for (let pi = 0; pi < this.parts.length; pi++) {
        const part = this.parts[pi];
        let rx = 0, ry = 0, rz = 0, ty = 0, tz = 0, wsum = 0;
        for (let li = 0; li < 3; li++) {
          const L = this.layers[li];
          if (!L || L.weight <= 0.002 || L.startDelay > 0) continue;
          if (L.parts !== FULL && L.parts.indexOf(part.id) === -1) continue;
          const c = curve(part.id, L.clip, L.variant);
          if (!c) continue;
          const phase = L.dur > 0 ? L.time / L.dur : 0;
          const w = L.weight;
          if (c.rx) rx += sampleTrack(c.rx, phase) * w;
          if (c.ry) ry += sampleTrack(c.ry, phase) * w;
          if (c.rz) rz += sampleTrack(c.rz, phase) * w;
          if (c.ty) ty += sampleTrack(c.ty, phase) * w;
          if (c.tz) tz += sampleTrack(c.tz, phase) * w;
          wsum += w;
        }
        const cur = this.current[part.id];
        const inv = wsum > 1.0001 ? 1 / wsum : 1;
        cur.rx = lerp(cur.rx, rx * inv, k);
        cur.ry = lerp(cur.ry, ry * inv, k);
        cur.rz = lerp(cur.rz, rz * inv, k);
        cur.ty = lerp(cur.ty, ty * inv, k);
        cur.tz = lerp(cur.tz, tz * inv, k);
        const bone = bones[part.bone];
        if (!bone) continue;
        bone.rotation.set(cur.rx, cur.ry, cur.rz);
        const base = this.basePos[part.bone];
        if (base) {
          const off = part.id === 'pelvis' ? this.groundOffset : 0;
          bone.position.set(base.x, base.y + cur.ty + off, base.z + cur.tz);
        }
      }
    }

    reset() {
      this.layers = [null, null, null];
      const bones = this.rig.bones;
      D.PARTS.forEach((p) => {
        this.current[p.id] = { rx: 0, ry: 0, rz: 0, tx: 0, ty: 0, tz: 0 };
        if (bones[p.bone]) bones[p.bone].rotation.set(0, 0, 0);
      });
      D.PARTS.forEach((p) => {
        if (bones[p.bone] && this.basePos[p.bone]) bones[p.bone].position.copy(this.basePos[p.bone]);
      });
    }

    // Принудительно выставить позу клипа (для превью в меню)
    poseAt(clipId, variant, phase) {
      this.reset();
      const bones = this.rig.bones;
      D.PARTS.forEach((p, i) => {
        const c = curve(p.id, clipId, variant);
        if (!c) return;
        const b = bones[p.bone];
        if (!b) return;
        b.rotation.set(c.rx ? sampleTrack(c.rx, phase) : 0, c.ry ? sampleTrack(c.ry, phase) : 0,
          c.rz ? sampleTrack(c.rz, phase) : 0);
        const base = this.basePos[p.bone];
        if (base) {
          const off = p.id === 'pelvis' ? this.groundOffset : 0;
          b.position.set(base.x, base.y + (c.ty ? sampleTrack(c.ty, phase) : 0) + off,
            base.z + (c.tz ? sampleTrack(c.tz, phase) : 0));
        }
      });
    }
  }

  /* ---------------------------------------------------------------------------
     Автоподстройка по земле: после позы смотрим, где оказались стопы, и
     мягко поднимаем/опускаем таз, чтобы подошвы стояли на полу. Так любая из
     1760 поз остаётся «на земле», даже если кривые приблизительны.
     --------------------------------------------------------------------------- */
  const _gl = { v: null };
  function groundLock(rig, animator, strength) {
    const T = root.THREE;
    if (!T || !rig || !rig.bones.footL || !rig.bones.footR) return;
    const k = strength === undefined ? 1 : strength;
    if (_gl.v === null) _gl.v = new T.Vector3();
    rig.root.updateMatrixWorld(true);
    let low = Infinity;
    rig.bones.footL.getWorldPosition(_gl.v);
    low = Math.min(low, _gl.v.y);
    rig.bones.footR.getWorldPosition(_gl.v);
    low = Math.min(low, _gl.v.y);
    if (!isFinite(low)) return;
    const target = 0.015;
    const delta = (target - low) * k;
    const maxStep = 0.11; // не дёргаемся больше 11 см за кадр
    const step = Math.max(-maxStep, Math.min(maxStep, delta));
    animator.groundOffset = Math.max(-0.55, Math.min(0.30, animator.groundOffset + step * 0.55));
  }

  SH2.anim = { library, Animator, curve, sampleTrack, UPPER, LOWER, FULL, groundLock };
})(typeof window !== 'undefined' ? window : globalThis);
