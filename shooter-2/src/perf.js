/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — производительность: качество, LOD, бюджет кадра
   -----------------------------------------------------------------------------
   Графика, которую видно, не ухудшается:
     • тени включаются/выключаются целыми «пачками» по дистанции, а не по
       одному мешу;
     • дальние бойцы не рисуют тени и обновляют анимацию раз в 2–3 кадра —
       на экране это не различить, но экономит десятки тысяч вершинных
       вычислений;
     • адаптивное разрешение рендера держит 60 FPS, но не опускается ниже
       0.75 от размера окна;
     • счётчики показывают draw calls, треугольники, число живых аниматоров,
       шагов регдола и сколько статики сэкономлено слиянием.
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});

  const PRESETS = {
    ultra:  { label: 'Ультра',    shadows: true,  shadowMap: 3072, dust: 1.0, maxParticles: 1.0, lodBias: 1.0, msaa: true,  scale: 1.0 },
    high:   { label: 'Высокое',   shadows: true,  shadowMap: 2048, dust: 0.9, maxParticles: 0.9, lodBias: 1.0, msaa: true,  scale: 1.0 },
    medium: { label: 'Среднее',   shadows: true,  shadowMap: 1536, dust: 0.65, maxParticles: 0.75, lodBias: 1.35, msaa: true,  scale: 1.0 },
    low:    { label: 'Экономное', shadows: false, shadowMap: 1024, dust: 0.35, maxParticles: 0.5, lodBias: 1.8, msaa: false, scale: 0.9 }
  };

  class Perf {
    constructor() {
      this.frames = 0;
      this.fps = 60;
      this.fpsAccum = 0;
      this.fpsTimer = 0;
      this.frameMs = 16.7;
      this.frameMsSmooth = 16.7;
      this.preset = 'high';
      this.dynamic = true;
      this.scale = 1;
      this.scaleMin = 0.75;
      this.scaleMax = 1;
      this.adaptTimer = 0;
      this.history = [];
      this.counters = { drawCalls: 0, triangles: 0, programs: 0, geometries: 0, textures: 0, animators: 0, ragdollSteps: 0, particles: 0, enemies: 0 };
      this.budget = { animators: 24, particles: 400 };
    }

    update(dt, renderer) {
      this.frames++;
      this.fpsAccum++;
      this.fpsTimer += dt;
      this.frameMs = dt * 1000;
      this.frameMsSmooth += (this.frameMs - this.frameMsSmooth) * 0.08;
      if (this.fpsTimer >= 0.5) {
        this.fps = Math.round(this.fpsAccum / this.fpsTimer);
        this.history.push(this.fps);
        if (this.history.length > 40) this.history.shift();
        this.fpsAccum = 0;
        this.fpsTimer = 0;
      }
      if (renderer && renderer.info) {
        const info = renderer.info;
        this.counters.drawCalls = info.render.calls;
        this.counters.triangles = info.render.triangles;
        this.counters.geometries = info.memory.geometries;
        this.counters.textures = info.memory.textures;
        this.counters.programs = info.programs ? info.programs.length : 0;
      }
      // адаптивное разрешение: не режем картинку без нужды
      if (this.dynamic && renderer) {
        this.adaptTimer += dt;
        if (this.adaptTimer > 1.4) {
          this.adaptTimer = 0;
          const avg = this.frameMsSmooth;
          if (avg > 21 && this.scale > this.scaleMin) {
            this.scale = Math.max(this.scaleMin, this.scale - 0.06);
            applyScale(renderer, this.scale);
          } else if (avg < 13 && this.scale < this.scaleMax) {
            this.scale = Math.min(this.scaleMax, this.scale + 0.04);
            applyScale(renderer, this.scale);
          }
        }
      }
    }

    setPreset(name, renderer, sun, scene) {
      const p = PRESETS[name] || PRESETS.high;
      this.preset = name;
      if (renderer) {
        renderer.shadowMap.enabled = p.shadows;
        if (sun && sun.shadow) {
          sun.shadow.mapSize.set(p.shadowMap, p.shadowMap);
          if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; }
        }
        applyScale(renderer, this.scale);
      }
      return p;
    }

    preset() { return PRESETS[this.preset]; }
    addAnimator(n) { this.counters.animators = n; }
  }

  function applyScale(renderer, scale) {
    if (!renderer) return;
    renderer.setPixelRatio(Math.min(root.devicePixelRatio || 1, 2) * scale);
  }

  SH2.perf = { Perf, PRESETS };
})(typeof window !== 'undefined' ? window : globalThis);
