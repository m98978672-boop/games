/* ТРАССА: генератор контента.
   Процедурно создаёт 500 моделей, 500 текстур и 500 анимаций — без внешних файлов.
   Всё создаётся лениво и кэшируется, поэтому в памяти живёт только то, что реально видно. */
(function () {
  const TR = (window.TR = window.TR || {});
  const Cn = (TR.Content = {});

  const MODEL_COUNT = 500;
  const TEXTURE_COUNT = 500;
  const ANIM_COUNT = 500;

  /* ------------------------------------------------------------- текстуры */

  const TEX_KINDS = [
    'facade', 'brick', 'roof', 'metal', 'asphalt',
    'gravel', 'dirt', 'wood', 'glass', 'sign',
  ];

  const texCache = new Map();

  function rnd(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function canvasTex(size, draw) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const x = c.getContext('2d');
    draw(x, size);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function drawTexture(kind, seed) {
    const r = rnd(seed * 7717 + kind.length * 131);
    const pick = (arr) => arr[Math.floor(r() * arr.length)];
    return canvasTex(64, (x, s) => {
      if (kind === 'facade' || kind === 'glass') {
        const base = kind === 'glass' ? pick(['#9fb6c9', '#8fa7bb', '#b7c6d2']) : pick(['#e7dfd0', '#cfc7b6', '#d9cdb9', '#c9a98c']);
        x.fillStyle = base; x.fillRect(0, 0, s, s);
        const cols = 3 + Math.floor(r() * 2), rows = 4;
        const cw = s / cols, ch = s / rows;
        for (let j = 0; j < rows; j++) {
          for (let i = 0; i < cols; i++) {
            const lit = r() < 0.22;
            x.fillStyle = lit ? 'rgba(255,210,130,0.95)' : pick(['#3a4550', '#2f3944', '#46525e']);
            x.fillRect(i * cw + cw * 0.22, j * ch + ch * 0.24, cw * 0.56, ch * 0.44);
          }
        }
        x.strokeStyle = 'rgba(0,0,0,0.16)';
        for (let j = 1; j < rows; j++) { x.beginPath(); x.moveTo(0, j * ch); x.lineTo(s, j * ch); x.stroke(); }
      } else if (kind === 'brick') {
        x.fillStyle = pick(['#a8563f', '#b8624a', '#8f4633', '#c07a5c']);
        x.fillRect(0, 0, s, s);
        x.fillStyle = 'rgba(255,255,255,0.10)';
        for (let j = 0; j < 8; j++) {
          for (let i = 0; i < 6; i++) {
            x.fillRect(i * (s / 6) + (j % 2 ? 3 : 0), j * (s / 8), s / 6 - 3, s / 8 - 3);
          }
        }
      } else if (kind === 'roof') {
        x.fillStyle = pick(['#6f6558', '#7d4a3c', '#5b6168', '#8a7a63']);
        x.fillRect(0, 0, s, s);
        for (let i = 0; i < 60; i++) {
          x.fillStyle = 'rgba(0,0,0,' + (0.04 + r() * 0.08) + ')';
          x.fillRect(r() * s, r() * s, 2 + r() * 4, 2 + r() * 3);
        }
      } else if (kind === 'metal' || kind === 'wood') {
        const base = kind === 'metal' ? pick(['#9aa3ab', '#7f8a93', '#b7bec4']) : pick(['#8a6237', '#a1743f', '#6f4d2b']);
        x.fillStyle = base; x.fillRect(0, 0, s, s);
        x.strokeStyle = 'rgba(0,0,0,0.18)';
        for (let i = 0; i < s; i += 6) { x.beginPath(); x.moveTo(0, i); x.lineTo(s, i); x.stroke(); }
      } else if (kind === 'asphalt') {
        x.fillStyle = pick(['#3f444b', '#474c53', '#383d43']);
        x.fillRect(0, 0, s, s);
        for (let i = 0; i < 320; i++) {
          x.fillStyle = 'rgba(255,255,255,' + (0.02 + r() * 0.05) + ')';
          x.fillRect(r() * s, r() * s, 1.4, 1.4);
        }
      } else if (kind === 'gravel' || kind === 'dirt') {
        x.fillStyle = kind === 'gravel' ? pick(['#a49b8c', '#b0a795', '#8f8778']) : pick(['#8a6a45', '#96754d', '#7c5f3f']);
        x.fillRect(0, 0, s, s);
        for (let i = 0; i < 420; i++) {
          x.fillStyle = 'rgba(' + (r() < 0.5 ? '255,255,255' : '0,0,0') + ',' + (0.03 + r() * 0.07) + ')';
          x.fillRect(r() * s, r() * s, 1 + r() * 2.5, 1 + r() * 2.5);
        }
      } else {
        // sign: цветная плашка с полосой
        x.fillStyle = pick(['#12181d', '#1c2b3a', '#2a1c1c']);
        x.fillRect(0, 0, s, s);
        x.fillStyle = pick(['#ffd166', '#7fe3c6', '#ff9d8b', '#e6e2d2']);
        x.fillRect(0, s * 0.62, s, s * 0.12);
      }
    });
  }

  Cn.TEXTURE_COUNT = TEXTURE_COUNT;
  Cn.textureCount = () => TEXTURE_COUNT;

  Cn.texture = function (index) {
    const id = ((index % TEXTURE_COUNT) + TEXTURE_COUNT) % TEXTURE_COUNT;
    if (texCache.has(id)) return texCache.get(id);
    const kind = TEX_KINDS[id % TEX_KINDS.length];
    const seed = Math.floor(id / TEX_KINDS.length) + 1;
    const t = drawTexture(kind, seed);
    texCache.set(id, t);
    return t;
  };

  Cn.textureKind = (index) => TEX_KINDS[index % TEX_KINDS.length];

  /* --------------------------------------------------------------- модели */

  const MODEL_KINDS = [
    'house', 'tower', 'shed', 'cafe', 'fuel', 'motel',
    'shop', 'garage', 'warehouse', 'kiosk',
  ];
  const MODEL_STYLES = ['sand', 'brick', 'glass', 'white', 'grey', 'wood', 'metal', 'green', 'blue', 'red'];
  const STYLE_COLORS = {
    sand: '#d9cdb9', brick: '#a8563f', glass: '#9fb6c9', white: '#f0ece0', grey: '#b9bec4',
    wood: '#8a6237', metal: '#9aa3ab', green: '#7f9c6a', blue: '#7d95b5', red: '#b0543f',
  };

  Cn.MODEL_COUNT = MODEL_COUNT;
  Cn.modelCount = () => MODEL_COUNT;

  /* индекс 0..499 → {kind, style, size} */
  Cn.modelDef = function (index) {
    const id = ((index % MODEL_COUNT) + MODEL_COUNT) % MODEL_COUNT;
    const kind = MODEL_KINDS[id % MODEL_KINDS.length];
    const style = MODEL_STYLES[Math.floor(id / MODEL_KINDS.length) % MODEL_STYLES.length];
    const size = 1 + (Math.floor(id / (MODEL_KINDS.length * MODEL_STYLES.length)) % 5);
    return { id, kind, style, size, color: STYLE_COLORS[style], texture: (id * 7) % TEXTURE_COUNT };
  };

  const geoCache = new Map();
  function box() {
    if (!geoCache.has('box')) geoCache.set('box', new THREE.BoxGeometry(1, 1, 1));
    return geoCache.get('box');
  }

  /* Собирает модель по её определению. Кэшируем только определение — сами группы
     собираются на месте и живут в сцене (так 500 моделей не съедают память). */
  Cn.build = function (index, scale) {
    const d = Cn.modelDef(index);
    const k = (scale || 1) * (0.75 + d.size * 0.12);
    const g = new THREE.Group();
    const mat = (color, rough) => new THREE.MeshStandardMaterial({ color, roughness: rough === undefined ? 0.9 : rough });
    const add = (w, h, dd, x, y, z, color, rotY) => {
      const m = new THREE.Mesh(box(), mat(color));
      m.scale.set(w * k, h * k, dd * k);
      m.position.set(x * k, y * k, z * k);
      if (rotY) m.rotation.y = rotY;
      g.add(m);
      return m;
    };
    const c = d.color;
    if (d.kind === 'house' || d.kind === 'tower') {
      const h = (d.kind === 'tower' ? 6 : 2.6) * (0.6 + d.size * 0.18);
      add(4, h, 3.4, 0, h / 2, 0, c);
      add(4.3, 0.25, 3.7, 0, h + 0.1, 0, '#6f6558');
      if (d.kind === 'tower') add(2.2, 0.6, 2.2, 0, h + 0.5, 0, c);
    } else if (d.kind === 'shed' || d.kind === 'garage' || d.kind === 'warehouse') {
      add(4.5, 1.6, 3.6, 0, 0.8, 0, c);
      add(4.6, 0.2, 3.7, 0, 1.68, 0, '#5b6168');
      add(1.6, 1.0, 0.1, 0, 0.6, 1.85, '#3a3f45');
    } else if (d.kind === 'cafe') {
      add(3.4, 1.8, 2.8, 0, 0.9, 0, c);
      add(4.2, 0.18, 3.4, 0, 2.0, 0, '#f2eee0');
      for (let i = 0; i < 3; i++) add(3.2, 0.12, 0.5, 0, 0.06, 2.4 + i * 0.7, '#8b8377');
    } else if (d.kind === 'fuel') {
      add(2.6, 1.2, 2.0, -1.2, 0.6, 0, c);
      for (let i = 0; i < 4; i++) add(0.16, 2.2, 0.16, -2.4 + i * 2.2, 1.1, 2.2, '#c9c4b8');
      add(5.4, 0.22, 4.2, -1.2, 2.3, 1.0, '#e6e2d2');
      for (let i = 0; i < 2; i++) add(0.5, 0.7, 0.4, -0.6 + i * 1.6, 0.35, 1.4, '#e8e2d0');
    } else if (d.kind === 'motel') {
      add(6.4, 1.4, 2.2, 0, 0.7, 0, c);
      add(6.6, 0.2, 2.4, 0, 1.5, 0, '#7d4a3c');
      for (let i = 0; i < 5; i++) add(0.7, 0.9, 0.1, -2.4 + i * 1.2, 0.6, 1.15, '#3a3f45');
    } else if (d.kind === 'shop') {
      add(4.6, 1.4, 3.0, 0, 0.7, 0, c);
      add(4.8, 0.16, 3.2, 0, 1.5, 0, '#cfc7b6');
      add(4.0, 0.14, 1.0, 0, 1.1, 1.9, '#a83d34');
    } else {
      add(1.8, 1.6, 1.6, 0, 0.8, 0, c);
      add(2.0, 0.16, 1.8, 0, 1.68, 0, '#e6e2d2');
    }
    return g;
  };

  /* ------------------------------------------------------------ анимации */

  const ANIM_KINDS = [
    'sway', 'spin', 'bob', 'flicker', 'pulse',
    'flag', 'door', 'gate', 'beacon', 'drift',
  ];
  Cn.ANIM_COUNT = ANIM_COUNT;
  Cn.animCount = () => ANIM_COUNT;

  Cn.animDef = function (index) {
    const id = ((index % ANIM_COUNT) + ANIM_COUNT) % ANIM_COUNT;
    const kind = ANIM_KINDS[id % ANIM_KINDS.length];
    const step = Math.floor(id / ANIM_KINDS.length); // 0..49
    return {
      id, kind,
      amp: 0.04 + (step % 10) * 0.02,
      speed: 0.5 + (step % 7) * 0.25,
      phase: (step % 13) * 0.37,
    };
  };

  /* применяет определение анимации к объекту; возвращает функцию для отписки не нужна —
     объект просто двигают каждый кадр */
  Cn.animate = function (obj, def, t, base) {
    if (!obj) return;
    const k = def;
    const w = t * k.speed + k.phase;
    const b = base || obj.userData.base || (obj.userData.base = {
      y: obj.position.y, ry: obj.rotation.y, sx: obj.scale.x,
    });
    switch (k.kind) {
      case 'sway': obj.rotation.z = Math.sin(w) * k.amp; break;
      case 'spin': obj.rotation.y = b.ry + w * 0.6; break;
      case 'bob': obj.position.y = b.y + Math.sin(w) * k.amp; break;
      case 'flicker': obj.scale.x = b.sx * (0.9 + Math.abs(Math.sin(w * 3)) * 0.2); break;
      case 'pulse': obj.scale.setScalar(0.94 + Math.abs(Math.sin(w)) * 0.12); break;
      case 'flag': obj.rotation.y = b.ry + Math.sin(w) * k.amp * 2; break;
      case 'door': obj.rotation.y = b.ry + (Math.sin(w) * 0.5 + 0.5) * k.amp * 4; break;
      case 'gate': obj.position.y = b.y + (Math.sin(w) > 0 ? 0 : k.amp * 3); break;
      case 'beacon': obj.rotation.y = b.ry + w * 2.4; break;
      default: obj.position.x = Math.sin(w) * k.amp; break;
    }
  };

  Cn.stats = function () {
    return {
      models: MODEL_COUNT,
      textures: TEXTURE_COUNT,
      animations: ANIM_COUNT,
      texturesReady: texCache.size,
    };
  };
})();
