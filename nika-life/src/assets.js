/* =============================================================================
   НИКА: ЖИВАЯ — библиотека процедурных ассетов тела (400 штук)
   -----------------------------------------------------------------------------
   20 групп × 20 вариантов = 400 адресуемых ассетов:
     • 10 групп текстур  (кожа, волосы, глаза, губы, румянец, ногти,
                           ткань, трикотаж, деним, обувь)  = 200
     • 10 групп моделей  (формы лица, бровей, носа, ушей, шеи, кистей,
                           стоп, корпуса, ног, причёсок)  = 200
   Каждый ассет — детерминированный «рецепт»: цвета, узор, геометрия.
   Текстуры превращаются в CanvasPattern прямо в браузере, модели отдают
   числовые параметры для рига. Никаких файлов, CDN, fetch и ключей.
   ============================================================================= */
(function (root) {
  'use strict';
  const NIKA = (root.NIKA = root.NIKA || {});

  const GROUPS = [
    { id: 'skin',    label: 'Кожа',            kind: 'texture' },
    { id: 'hairtex', label: 'Волосы',          kind: 'texture' },
    { id: 'eyetex',  label: 'Радужка',         kind: 'texture' },
    { id: 'liptex',  label: 'Губы',            kind: 'texture' },
    { id: 'blushtex',label: 'Румянец',         kind: 'texture' },
    { id: 'nailtex', label: 'Ногти',           kind: 'texture' },
    { id: 'fabric',  label: 'Ткань',           kind: 'texture' },
    { id: 'knit',    label: 'Трикотаж',        kind: 'texture' },
    { id: 'denim',   label: 'Деним',           kind: 'texture' },
    { id: 'shoetex', label: 'Обувь',           kind: 'texture' },
    { id: 'face',    label: 'Форма лица',      kind: 'model' },
    { id: 'brow',    label: 'Форма бровей',    kind: 'model' },
    { id: 'nose',    label: 'Форма носа',      kind: 'model' },
    { id: 'ear',     label: 'Форма ушей',      kind: 'model' },
    { id: 'neck',    label: 'Шея и ключицы',   kind: 'model' },
    { id: 'hand',    label: 'Кисти и пальцы',  kind: 'model' },
    { id: 'foot',    label: 'Стопы',           kind: 'model' },
    { id: 'torso',   label: 'Корпус',          kind: 'model' },
    { id: 'leg',     label: 'Ноги',            kind: 'model' },
    { id: 'hairstyle', label: 'Причёска',      kind: 'model' },
  ];
  const VARIANTS = 20;
  const PATTERNS = ['plain', 'dots', 'stripes', 'weave', 'speckle', 'gradient', 'rib', 'chevron'];
  const cache = new WeakMap();

  function hsl(h, s, l, a) {
    return 'hsla(' + Math.round(h) + ',' + Math.round(s) + '%,' + Math.round(l) + '%,' + (a === undefined ? 1 : a) + ')';
  }
  /* Гармоничная палитра: у каждой группы свой узкий диапазон оттенков.
     Раньше случайный hue давал неоновые пятна на коже и волосах.
     Теперь все 400 вариантов остаются разными, но сочетаются между собой. */
  const HUES = [28, 16, 82, 348, 346, 350, 208, 272, 214, 32,
                28, 18, 28, 28, 28, 28, 28, 205, 214, 16];
  const SATS = [30, 40, 34, 46, 48, 24, 24, 26, 32, 20,
                30, 40, 30, 30, 30, 30, 30, 24, 32, 40];
  const LIGHTS = [74, 34, 50, 58, 72, 80, 72, 68, 48, 70,
                  70, 36, 70, 70, 70, 70, 70, 68, 48, 36];
  function recipe(groupIndex, i) {
    const seed = groupIndex * 97 + i * 13 + 7;
    const hue = (HUES[groupIndex] + ((i * 7) % 19) - 9 + 360) % 360;
    return {
      hue: hue,
      hue2: (hue + 8 + (i % 5) * 4) % 360,
      sat: SATS[groupIndex] + ((i * 3) % 12) - 6,
      light: LIGHTS[groupIndex] + ((i * 5) % 14) - 7,
      contrast: 0.18 + ((seed * 3) % 58) / 100,
      pattern: PATTERNS[i % PATTERNS.length],
      density: 2 + (i % 6),
      angle: (i * 23) % 180,
      gloss: ((seed * 5) % 88) / 100,
      shape: (i % 5) + 1,
      width: 0.86 + ((i * 7) % 28) / 100,
      height: 0.90 + ((i * 5) % 22) / 100,
      curve: ((i * 17) % 40) / 100 - 0.2,
      round: 0.28 + ((i * 9) % 60) / 100,
      length: 0.75 + ((i * 3) % 45) / 100,
      seed: seed,
    };
  }

  const ALL = [];
  GROUPS.forEach(function (g, gi) {
    for (let i = 0; i < VARIANTS; i++) {
      const num = String(i + 1).padStart(2, '0');
      ALL.push({
        id: g.id + '-' + num,
        group: g.id,
        groupLabel: g.label,
        kind: g.kind,
        index: i,
        variant: num,
        name: g.label + ' · вариант ' + num,
        params: recipe(gi, i),
      });
    }
  });
  const BY_ID = {};
  ALL.forEach(function (a) { BY_ID[a.id] = a; });

  function get(id) { return BY_ID[id] || null; }
  function find(group, index) { return BY_ID[group + '-' + String((index % VARIANTS) + 1).padStart(2, '0')] || null; }
  function groupAssets(group) { return ALL.filter(function (a) { return a.group === group; }); }

  /* --- CSS-превью для галереи интерфейса ---------------------------------- */
  function css(id) {
    const a = get(id);
    if (!a) return 'linear-gradient(135deg,#333,#666)';
    const p = a.params;
    const a1 = hsl(p.hue, p.sat, p.light);
    const a2 = hsl(p.hue2, p.sat + 10, Math.min(92, p.light + 22));
    let base = 'linear-gradient(' + p.angle + 'deg,' + a1 + ',' + a2 + ')';
    if (p.pattern === 'dots') base += ',radial-gradient(circle at 50% 50%,' + hsl(p.hue2, 60, 82, 0.65) + ' 2px,transparent 3px)';
    else if (p.pattern === 'stripes') base += ',repeating-linear-gradient(90deg,' + hsl(p.hue2, 50, 80, 0.32) + ' 0 3px,transparent 3px 9px)';
    else if (p.pattern === 'weave') base += ',repeating-linear-gradient(45deg,' + hsl(p.hue2, 40, 70, 0.25) + ' 0 2px,transparent 2px 6px)';
    else if (p.pattern === 'rib') base += ',repeating-linear-gradient(0deg,' + hsl(p.hue2, 45, 75, 0.28) + ' 0 2px,transparent 2px 7px)';
    else if (p.pattern === 'chevron') base += ',repeating-linear-gradient(135deg,' + hsl(p.hue2, 50, 78, 0.3) + ' 0 2px,transparent 2px 8px)';
    return base;
  }

  /* --- отрисовка рецепта в offscreen-canvas -------------------------------- */
  function drawRecipe(c, a, size) {
    const p = a.params;
    const g = c.createLinearGradient(0, 0, size, size);
    g.addColorStop(0, hsl(p.hue, p.sat, p.light));
    g.addColorStop(1, hsl(p.hue2, p.sat + 10, Math.min(93, p.light + 20)));
    c.fillStyle = g;
    c.fillRect(0, 0, size, size);
    c.fillStyle = hsl(p.hue2, Math.min(85, p.sat + 18), 78, 0.30 + p.gloss * 0.25);
    c.strokeStyle = hsl(p.hue2, Math.min(85, p.sat + 18), 78, 0.30 + p.gloss * 0.25);
    c.lineWidth = 1 + p.density * 0.18;
    const step = Math.max(5, Math.round(size / (p.density + 3)));
    if (p.pattern === 'dots' || p.pattern === 'speckle') {
      for (let y = step / 2; y < size; y += step) {
        for (let x = step / 2; x < size; x += step) {
          c.beginPath();
          c.arc(x + ((y / step) % 2) * step * 0.3, y, (p.pattern === 'dots' ? 1.8 : 0.8) + (x % 3) * 0.3, 0, Math.PI * 2);
          c.fill();
        }
      }
    } else if (p.pattern === 'stripes' || p.pattern === 'rib') {
      for (let x = 0; x < size; x += step) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, size); c.stroke(); }
    } else if (p.pattern === 'weave' || p.pattern === 'chevron') {
      for (let x = -size; x < size * 2; x += step) {
        c.beginPath(); c.moveTo(x, 0); c.lineTo(x + size * 0.6, size); c.stroke();
        if (p.pattern === 'chevron') { c.beginPath(); c.moveTo(x, 0); c.lineTo(x - size * 0.6, size); c.stroke(); }
      }
    } else if (p.pattern === 'gradient') {
      const g2 = c.createLinearGradient(0, size, size, 0);
      g2.addColorStop(0, hsl(p.hue2, 70, 80, 0.0));
      g2.addColorStop(0.5, hsl(p.hue2, 70, 88, 0.35));
      g2.addColorStop(1, hsl(p.hue2, 70, 80, 0.0));
      c.fillStyle = g2; c.fillRect(0, 0, size, size);
    }
  }

  function cacheFor(ctx) {
    let m = cache.get(ctx);
    if (!m) { m = new Map(); cache.set(ctx, m); }
    return m;
  }
  function texture(ctx, id) {
    if (!ctx || typeof ctx.createPattern !== 'function') return null;
    const a = get(id);
    if (!a || a.kind !== 'texture') return null;
    const store = cacheFor(ctx);
    if (store.has(a.id)) return store.get(a.id);
    let pattern = null;
    try {
      const doc = root.document;
      if (doc && typeof doc.createElement === 'function') {
        const off = doc.createElement('canvas');
        off.width = 64; off.height = 64;
        const c = off.getContext && off.getContext('2d');
        if (c && typeof c.fillRect === 'function') {
          drawRecipe(c, a, 64);
          pattern = ctx.createPattern(off, 'repeat');
        }
      }
    } catch (e) { pattern = null; }
    if (!pattern || typeof pattern !== 'object') return null;
    store.set(a.id, pattern);
    return pattern;
  }
  function model(id) {
    const a = get(id);
    return a && a.kind === 'model' ? a.params : null;
  }
  function swatch(ctx, id, x, y, w, h) {
    const a = get(id);
    if (!a) return;
    const pat = texture(ctx, id);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = pat || hsl(a.params.hue, a.params.sat, a.params.light);
    ctx.fillRect(x, y, w, h);
    if (a.kind === 'model') {
      ctx.strokeStyle = hsl(a.params.hue2, 60, 85, 0.8);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2,
        (w / 2) * a.params.width * 0.7, (h / 2) * a.params.height * 0.7,
        a.params.curve, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* --- «образ» Ники: какой ассет какой части тела использовать ------------- */
  const BODY_KEYS = ['skin', 'hairtex', 'eyetex', 'liptex', 'blushtex', 'nailtex', 'fabric',
    'face', 'brow', 'nose', 'ear', 'neck', 'hand', 'foot', 'torso', 'leg', 'hairstyle'];
  function defaultLook() {
    const look = {};
    BODY_KEYS.forEach(function (k, i) { look[k] = (i * 3 + 4) % VARIANTS; });
    return look;
  }
  function idsFor(look) {
    const out = {};
    BODY_KEYS.forEach(function (k) {
      const idx = Number(look && look[k]);
      out[k] = k + '-' + String((Number.isFinite(idx) ? ((idx % VARIANTS) + VARIANTS) % VARIANTS : 4) + 1).padStart(2, '0');
    });
    return out;
  }
  function info() {
    return {
      total: ALL.length,
      textures: ALL.filter(function (a) { return a.kind === 'texture'; }).length,
      models: ALL.filter(function (a) { return a.kind === 'model'; }).length,
      groups: GROUPS.length,
      variants: VARIANTS,
      external: 'нет',
    };
  }

  NIKA.assets = {
    GROUPS: GROUPS, ALL: ALL, VARIANTS: VARIANTS, BODY_KEYS: BODY_KEYS,
    get: get, find: find, groupAssets: groupAssets, css: css, texture: texture,
    model: model, swatch: swatch, defaultLook: defaultLook, idsFor: idsFor, info: info,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
