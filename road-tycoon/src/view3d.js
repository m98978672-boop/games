/* ТРАССА 3D — рендер мира на Three.js.
   Заменяет собой 2D-рендер (src/render.js), сохраняя его публичный интерфейс:
   init / resize / buildTerrain / draw / ppk / toWorld / toScreen / facilityPos / facilityWorldPos. */
(function () {
  const TR = window.TR;
  const C = TR.CONFIG;
  const U = TR.Util;
  const Wd = TR.World;
  const R = (TR.Render = {});
  const V = (TR.View3D = {});

  const PX_PER_KM = 9;
  const MAX_DPR = 1.5;
  const PITCH = 0.98;              // наклон камеры, рад от горизонта
  const FOV = 46;
  const ROAD_W = [0.62, 0.74, 0.92, 1.10];   // км, по типу покрытия
  const BRIDGE_Y = 0.60;

  let canvas, renderer, scene, camera, world;
  let sunLight, hemiLight, ambient;
  let terrainMesh, waterGroup, cityGroup, roadGroup, propGroup, facilityGroup, vehicleGroup, markerGroup, floatGroup;
  let raycaster, groundPlane;
  let vw = 1, vh = 1;
  let ppkNow = PX_PER_KM;
  let roadSig = null, facSig = null, citySig = -1, cityBuilt = false;
  const samples = new Map();       // roadId -> {pts, half, name}
  const facilityMeshes = new Map(); // facId -> Object3D
  const vehicleSlots = new Map();   // instanced meshes
  const TEX = {};
  const clock = { t: 0 };

  /* ------------------------------------------------------------ утилиты */

  function canvas2d(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return { c, x: c.getContext('2d') };
  }
  function texture(c, rx, ry) {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (rx || ry) t.repeat.set(rx || 1, ry || 1);
    t.anisotropy = 4;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function noiseFill(x, w, h, base, amp, dot) {
    x.fillStyle = base;
    x.fillRect(0, 0, w, h);
    for (let i = 0; i < w * h * (dot || 0.35); i++) {
      const a = Math.random() * amp;
      x.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '0,0,0,' : '255,255,255,') + a.toFixed(3) + ')';
      const s = 1 + Math.random() * 2;
      x.fillRect(Math.random() * w, Math.random() * h, s, s);
    }
  }

  function roadTexture(q) {
    const key = 'road' + q;
    if (TEX[key]) return TEX[key];
    const { c, x } = canvas2d(128, 512);
    const base = ['#b09a70', '#a2947f', '#6a7280', '#5c6572'][q];
    noiseFill(x, 128, 512, base, 0.16, 0.5);
    // обочины
    x.fillStyle = 'rgba(255,255,255,0.06)';
    x.fillRect(0, 0, 9, 512);
    x.fillRect(119, 0, 9, 512);
    if (q >= 2) {
      x.fillStyle = 'rgba(240,238,224,0.72)';
      x.fillRect(12, 0, 4, 512);
      x.fillRect(112, 0, 4, 512);
      // прерывистая осевая
      x.fillStyle = 'rgba(246,214,120,0.9)';
      for (let y = 0; y < 512; y += 86) x.fillRect(61, y, 6, 44);
    } else if (q === 1) {
      x.fillStyle = 'rgba(235,232,214,0.30)';
      for (let y = 0; y < 512; y += 96) { x.fillRect(10, y, 3, 46); x.fillRect(115, y, 3, 46); }
    }
    TEX[key] = texture(c);
    return TEX[key];
  }

  function waterTexture() {
    if (TEX.water) return TEX.water;
    const { c, x } = canvas2d(256, 256);
    const g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#4c93ad');
    g.addColorStop(0.5, '#5aa4bd');
    g.addColorStop(1, '#468aa4');
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 46; i++) {
      const y = Math.random() * 256;
      x.strokeStyle = 'rgba(220,245,255,' + (0.05 + Math.random() * 0.10).toFixed(3) + ')';
      x.lineWidth = 1 + Math.random() * 2;
      x.beginPath();
      x.moveTo(-10, y);
      for (let k = 0; k <= 8; k++) {
        x.lineTo(k * 36, y + Math.sin(k * 1.2 + i) * 4);
      }
      x.stroke();
    }
    TEX.water = texture(c);
    return TEX.water;
  }

  function grassTexture() {
    if (TEX.grass) return TEX.grass;
    const { c, x } = canvas2d(512, 512);
    noiseFill(x, 512, 512, '#d8dccb', 0.07, 0.5);
    for (let i = 0; i < 9000; i++) {
      const g = 170 + Math.random() * 65;
      x.fillStyle = 'rgba(' + Math.round(g * 0.92) + ',' + Math.round(g) + ',' + Math.round(g * 0.82) + ',0.22)';
      x.fillRect(Math.random() * 512, Math.random() * 512, 1.4, 2.4);
    }
    // редкие травинки-кустики, чтобы не было видно повторов
    for (let i = 0; i < 420; i++) {
      x.strokeStyle = 'rgba(' + (150 + Math.random() * 50) + ',' + (175 + Math.random() * 45) + ',130,0.25)';
      x.beginPath();
      const px = Math.random() * 512, py = Math.random() * 512;
      x.moveTo(px, py);
      x.lineTo(px + (Math.random() - 0.5) * 4, py - 3 - Math.random() * 4);
      x.stroke();
    }
    TEX.grass = texture(c, 190, 190);
    return TEX.grass;
  }

  function facadeTexture(variant) {
    const key = 'fac' + variant;
    if (TEX[key]) return TEX[key];
    const { c, x } = canvas2d(128, 256);
    const walls = ['#cfc7b6', '#b9b2a4', '#d8cdb9', '#9fb0b8', '#c2a898', '#adb6a6'];
    noiseFill(x, 128, 256, walls[variant % walls.length], 0.05, 0.2);
    const cols = 4 + (variant % 3), rows = 10;
    const ww = 128 / cols, wh = 256 / rows;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const lit = Math.random() < 0.28;
        x.fillStyle = lit ? 'rgba(255,214,140,0.95)' : 'rgba(40,54,66,0.85)';
        x.fillRect(i * ww + ww * 0.24, j * wh + wh * 0.26, ww * 0.52, wh * 0.44);
      }
    }
    // цоколь и крыша
    x.fillStyle = 'rgba(60,60,58,0.55)';
    x.fillRect(0, 250, 128, 6);
    TEX[key] = texture(c);
    return TEX[key];
  }

  function signTexture(text, bg, fg) {
    const { c, x } = canvas2d(256, 128);
    x.fillStyle = bg;
    x.fillRect(0, 0, 256, 128);
    x.strokeStyle = 'rgba(255,255,255,0.55)';
    x.lineWidth = 6;
    x.strokeRect(3, 3, 250, 122);
    x.fillStyle = fg;
    x.font = 'bold 52px Arial, sans-serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(text, 128, 68);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function labelTexture(title, sub) {
    const { c, x } = canvas2d(512, 192);
    x.fillStyle = 'rgba(12,16,20,0.72)';
    x.beginPath();
    x.roundRect(6, 40, 500, 112, 26);
    x.fill();
    x.strokeStyle = 'rgba(240,184,64,0.65)';
    x.lineWidth = 4;
    x.stroke();
    x.fillStyle = '#f6efe0';
    x.font = 'bold 54px Arial, sans-serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(title, 256, 84);
    x.fillStyle = '#e8b45a';
    x.font = '34px Arial, sans-serif';
    x.fillText(sub, 256, 130);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  /* ------------------------------------------------------- геометрия-ленты */

  // Полоса вдоль ломаной: pts = [{x,z,y?,tx?,tz?}], width в км
  function ribbon(pts, width, opts) {
    opts = opts || {};
    const n = pts.length;
    const pos = [], uv = [], idx = [], norm = [];
    let dist = 0;
    for (let i = 0; i < n; i++) {
      const p = pts[i];
      let tx = p.tx, tz = p.tz;
      if (tx === undefined) {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
        tx = b.x - a.x; tz = b.z - a.z;
        const l = Math.hypot(tx, tz) || 1;
        tx /= l; tz /= l;
      }
      const nx = -tz, nz = tx;
      const hw = (typeof width === 'function' ? width(i / (n - 1)) : width) / 2;
      const y = p.y !== undefined ? p.y : (opts.y || 0.02);
      if (i > 0) dist += Math.hypot(p.x - pts[i - 1].x, p.z - pts[i - 1].z);
      pos.push(p.x + nx * hw, y, p.z + nz * hw, p.x - nx * hw, y, p.z - nz * hw);
      norm.push(0, 1, 0, 0, 1, 0);
      const v = dist / (opts.vScale || 1.6);
      uv.push(0, v, 1, v);
      if (i > 0) {
        const a = (i - 1) * 2;
        idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(norm, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    return g;
  }

  function quad(x, z, w, d, y, color) {
    const g = new THREE.PlaneGeometry(w, d);
    g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 1 }));
    m.position.set(x, y || 0.03, z);
    return m;
  }

  /* ---------------------------------------------------------- высоты мира */

  function cityRadius(city) { return 9 + Math.min(city.pop, 420000) / 3500; }

  function baseHeight(x, z) {
    let h = 0;
    for (const hill of world.hills) {
      const d = Math.hypot(x - hill.x, z - hill.y);
      if (d < hill.r) h += hill.h * 0.5 * Math.pow(1 - d / hill.r, 2);
    }
    const n = world.noise(x * 0.006, z * 0.006);
    h += (n - 0.5) * 0.7;
    return h;
  }

  function flatMask(x, z, state) {
    let m = 1;
    const cities = C.cities;
    for (let i = 0; i < cities.length; i++) {
      const d = Math.hypot(x - cities[i].x, z - cities[i].y);
      const r = cityRadius(cities[i]);
      if (d < r + 3.5) m = Math.min(m, U.clamp((d - r) / 3.5, 0, 1));
    }
    if (Wd.riverDist(world, x, z) < 5.5) m = Math.min(m, U.clamp((Wd.riverDist(world, x, z) - 2.2) / 3.3, 0, 1));
    if (Wd.lakeFactor(world, x, z) > 0) m = 0;
    if (state) {
      for (const road of state.roads) {
        if (!road.open && !road.building) continue;
        if (road.builtKm <= 0.2) continue;
        const c = U.curve(road);
        // грубая оценка: расстояние до отрезка A—B
        const ax = c.ax, az = c.ay, bx = c.bx, bz = c.by;
        const dx = bx - ax, dz = bz - az;
        const l2 = dx * dx + dz * dz || 1;
        let t = ((x - ax) * dx + (z - az) * dz) / l2;
        t = U.clamp(t, 0, 1);
        const d = Math.hypot(x - (ax + dx * t), z - (az + dz * t));
        if (d < 4.5) m = Math.min(m, U.clamp((d - 1.2) / 3.4, 0, 1));
      }
    }
    return m;
  }

  function terrainHeight(x, z, state) {
    return baseHeight(x, z) * flatMask(x, z, state);
  }

  /* ------------------------------------------------------------- сцена */

  R.init = function (cv, w) {
    canvas = cv;
    world = w;
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = false;

    scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b1016');
    scene.fog = new THREE.Fog(new THREE.Color('#0b1016'), 120, 400);

    camera = new THREE.PerspectiveCamera(FOV, 1, 0.8, 8000);

    hemiLight = new THREE.HemisphereLight(0xcfe4ff, 0x3d5238, 1.15);
    scene.add(hemiLight);
    ambient = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambient);
    sunLight = new THREE.DirectionalLight(0xfff0cc, 1.6);
    sunLight.position.set(60, 90, 40);
    scene.add(sunLight);

    raycaster = new THREE.Raycaster();
    groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    waterGroup = new THREE.Group();
    cityGroup = new THREE.Group();
    roadGroup = new THREE.Group();
    propGroup = new THREE.Group();
    facilityGroup = new THREE.Group();
    vehicleGroup = new THREE.Group();
    markerGroup = new THREE.Group();
    floatGroup = new THREE.Group();
    scene.add(waterGroup, cityGroup, roadGroup, propGroup, facilityGroup, vehicleGroup, markerGroup, floatGroup);

    R.resize();
    return renderer;
  };

  R.resize = function () {
    if (!renderer) return;
    const rect = canvas.getBoundingClientRect();
    vw = Math.max(320, Math.round(rect.width || window.innerWidth));
    vh = Math.max(320, Math.round(rect.height || window.innerHeight));
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    camera.updateProjectionMatrix();
  };

  function syncCamera(app) {
    const cam = app.camera;
    const zoom = U.clamp(cam.zoom || 1, 0.03, 14);
    const fov = (camera.fov * Math.PI) / 180;
    const d = (1 / (PX_PER_KM * zoom)) * Math.sin(PITCH) * vh / (2 * Math.tan(fov / 2));
    const h = d * Math.sin(PITCH);
    const back = d * Math.cos(PITCH);
    camera.position.set(cam.x, h, cam.y + back);
    camera.lookAt(cam.x, 0, cam.y);
    camera.updateMatrixWorld();
    // точный масштаб у центра экрана — он нужен интерфейсу для попаданий
    const a = screenToGround(vw / 2, vh / 2);
    const b = screenToGround(vw / 2, vh / 2 + 60);
    if (a && b) {
      const km = Math.hypot(a.x - b.x, a.y - b.y);
      if (km > 1e-5) ppkNow = 60 / km;
    }
    scene.fog.near = d * 1.7;
    scene.fog.far = d * 4.2 + 120;
  }

  function screenToGround(sx, sy) {
    const ndc = new THREE.Vector2((sx / vw) * 2 - 1, -(sy / vh) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const p = new THREE.Vector3();
    const hit = raycaster.ray.intersectPlane(groundPlane, p);
    return hit ? { x: p.x, y: p.z } : null;
  }

  R.toWorld = function (app, sx, sy) {
    const p = screenToGround(sx, sy);
    return p || { x: 0, y: 0 };
  };

  R.toScreen = function (app, x, y) {
    const p = new THREE.Vector3(x, 0.05, y).project(camera);
    return { x: (p.x * 0.5 + 0.5) * vw, y: (-p.y * 0.5 + 0.5) * vh };
  };

  R.ppk = function () { return ppkNow; };

  /* ------------------------------------------------------------- террейн */

  function buildTerrainMesh(state) {
    if (terrainMesh) { scene.remove(terrainMesh); terrainMesh.geometry.dispose(); terrainMesh = null; }
    const N = 220;
    const pos = [], uv = [], idx = [], col = [];
    const cMeadow = new THREE.Color('#69a052'), cForest = new THREE.Color('#3f7040');
    const cField = new THREE.Color('#a8b455'), cHill = new THREE.Color('#8a9a55');
    const cSand = new THREE.Color('#b9a878');
    for (let j = 0; j <= N; j++) {
      for (let i = 0; i <= N; i++) {
        const x = (i / N) * C.worldW, z = (j / N) * C.worldH;
        const h = terrainHeight(x, z, state);
        pos.push(x, h, z);
        uv.push(x / C.worldW, z / C.worldH);
        const b = Wd.biome(world, x, z);
        let c = cMeadow;
        if (b === 'forest') c = cForest;
        else if (b === 'field') c = cField;
        else if (b === 'hill') c = cHill;
        if (Wd.riverDist(world, x, z) < 2.6 || Wd.lakeFactor(world, x, z) > 0.5) c = cSand;
        const l = 0.9 + world.noise(x * 0.02, z * 0.02) * 0.22;
        col.push(c.r * l, c.g * l, c.b * l);
      }
    }
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const a = j * (N + 1) + i, b = a + 1, c = a + N + 1, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({
      map: grassTexture(), vertexColors: true, roughness: 1, metalness: 0,
    });
    terrainMesh = new THREE.Mesh(g, mat);
    terrainMesh.renderOrder = -1;
    scene.add(terrainMesh);
  }

  /* -------------------------------------------------------------- вода */

  function buildWater() {
    waterGroup.clear();
    const waterMat = new THREE.MeshStandardMaterial({
      map: waterTexture(), color: '#9fd4e6', emissive: new THREE.Color('#12384a'), emissiveIntensity: 0.4,
      roughness: 0.18, metalness: 0.2, transparent: true, opacity: 0.97,
    });
    for (const river of world.rivers) {
      const pts = river.map((p) => ({ x: p.x, z: p.y }));
      // сглаживание: добавим промежуточные точки
      const smooth = [];
      for (let i = 0; i < pts.length - 1; i++) {
        for (let k = 0; k < 6; k++) {
          const t = k / 6;
          smooth.push({ x: U.lerp(pts[i].x, pts[i + 1].x, t), z: U.lerp(pts[i].z, pts[i + 1].z, t) });
        }
      }
      smooth.push(pts[pts.length - 1]);
      const g = ribbon(smooth, (t) => 1.7 + Math.sin(t * 9) * 0.28, { y: 0.2, vScale: 6 });
      const m = new THREE.Mesh(g, waterMat);
      waterGroup.add(m);
      // берега
      const bank = ribbon(smooth, 3.8, { y: 0.11, vScale: 6 });
      const bm = new THREE.Mesh(bank, new THREE.MeshStandardMaterial({ color: '#94a468', roughness: 1 }));
      waterGroup.add(bm);
    }
    for (const lake of world.lakes) {
      const g = new THREE.CircleGeometry(1, 40);
      g.rotateX(-Math.PI / 2);
      const m = new THREE.Mesh(g, waterMat);
      m.scale.set(lake.rx, 1, lake.ry);
      m.rotation.y = lake.rot;
      m.position.set(lake.x, 0.14, lake.y);
      waterGroup.add(m);
      const ring = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: '#c8b98a', roughness: 1 }));
      ring.scale.set(lake.rx * 1.14, 1, lake.ry * 1.16);
      ring.position.set(lake.x, 0.07, lake.y);
      ring.rotation.y = lake.rot;
      waterGroup.add(ring);
    }
  }

  /* -------------------------------------------------------------- город */

  const BUILD_TYPES = [
    { w: 0.34, d: 0.34, h: [0.22, 0.75], tint: ['#e7dfd0', '#cfc7b6', '#d9cdb9', '#ffffff', '#c9a98c'] },
    { w: 0.5, d: 0.36, h: [0.12, 0.3], tint: ['#c9bda8', '#b9ae9a', '#d6c8ae', '#a8563f', '#8f9aa5'] },
    { w: 0.26, d: 0.26, h: [0.4, 1.15], tint: ['#c3ccd4', '#b7c3cc', '#cfd6da', '#9fb6c9', '#dfe6ea'] },
    { w: 0.6, d: 0.48, h: [0.1, 0.22], tint: ['#b9a894', '#c7b6a1', '#ad9d8b', '#9c8f7d'] },
  ];

  function buildCities(state) {
    cityGroup.clear();
    const rand = U.mulberry32(world.seed * 97 + 5);
    const lists = [[], [], [], []];
    const streetPts = [];
    for (let ci = 0; ci < C.cities.length; ci++) {
      const city = C.cities[ci];
      const Rc = cityRadius(city);
      const cell = 1.55;
      const n = Math.max(3, Math.min(18, Math.round(Rc / cell)));
      const half = n * cell;
      // сетка улиц
      for (let i = -n; i <= n; i++) {
        const off = i * cell;
        streetPts.push({ x: city.x + off, z: city.y - half, x2: city.x + off, z2: city.y + half });
      }
      for (let j = -n; j <= n; j++) {
        const off = j * cell;
        streetPts.push({ x: city.x - half, z: city.y + off, x2: city.x + half, z2: city.y + off });
      }
      // кварталы и дома
      for (let i = -n; i < n; i++) {
        for (let j = -n; j < n; j++) {
          const cx = city.x + i * cell + cell / 2;
          const cz = city.y + j * cell + cell / 2;
          const distC = Math.hypot(cx - city.x, cz - city.y);
          if (distC > half * 0.98) continue;
          const density = 0.78 - (distC / half) * 0.5;
          if (rand() > density) continue;
          const type = (rand() < 0.16 ? 2 : rand() < 0.5 ? 0 : rand() < 0.75 ? 1 : 3);
          const t = BUILD_TYPES[type];
          const w = t.w * 1.8 * (1.15 + rand() * 0.5);
          const d = t.d * 1.8 * (1.15 + rand() * 0.5);
          const centerBias = 1 - distC / half;
          const h = U.lerp(t.h[0], t.h[1], Math.pow(rand(), 1.4)) * (0.9 + centerBias * 1.15) * 1.8;
          lists[type].push({
            x: cx + (rand() - 0.5) * 0.1, z: cz + (rand() - 0.5) * 0.1,
            w, d, h, rot: Math.round(rand() * 3) * (Math.PI / 2),
            color: t.tint[Math.floor(rand() * t.tint.length)],
          });
        }
      }
      // подложка города и центральная площадь
      const padGeo = new THREE.CircleGeometry(half * 1.28, 40);
      padGeo.rotateX(-Math.PI / 2);
      const pad = new THREE.Mesh(padGeo, new THREE.MeshStandardMaterial({
        color: '#8b9370', roughness: 1, transparent: true, opacity: 0.62,
      }));
      pad.position.set(city.x, 0.026, city.y);
      cityGroup.add(pad);
      propGroup.add(quad(city.x, city.y, cell * 1.1, cell * 1.1, 0.06, '#a9a291'));
      const parkAngle = rand() * Math.PI * 2;
      const px = city.x + Math.cos(parkAngle) * half * 0.55;
      const pz = city.y + Math.sin(parkAngle) * half * 0.55;
      propGroup.add(quad(px, pz, cell * 2.2, cell * 1.8, 0.045, '#3f6b3a'));
    }

    // улицы одним мешем
    const streetMat = new THREE.MeshStandardMaterial({ color: '#4b5058', roughness: 0.95 });
    const geos = [];
    for (const s of streetPts) {
      const len = Math.hypot(s.x2 - s.x, s.z2 - s.z);
      if (len < 0.05) continue;
      const g = ribbon([{ x: s.x, z: s.z }, { x: s.x2, z: s.z2 }], 0.6, { y: 0.1, vScale: 1 });
      geos.push(g);
    }
    for (const g of geos) {
      const mesh = new THREE.Mesh(g, streetMat);
      cityGroup.add(mesh);
    }

    // дома: 4 инстансных меша
    const box = new THREE.BoxGeometry(1, 1, 1);
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    for (let ti = 0; ti < BUILD_TYPES.length; ti++) {
      const list = lists[ti];
      if (!list.length) continue;
      const mat = new THREE.MeshStandardMaterial({
        map: facadeTexture(ti), roughness: 0.85, metalness: 0.05,
        emissive: new THREE.Color('#ffcf87'), emissiveIntensity: 0.0,
        emissiveMap: facadeTexture(ti),
      });
      const im = new THREE.InstancedMesh(box, mat, list.length);
      for (let i = 0; i < list.length; i++) {
        const b = list[i];
        dummy.position.set(b.x, b.h / 2 + 0.05, b.z);
        dummy.rotation.set(0, b.rot, 0);
        dummy.scale.set(b.w, b.h, b.d);
        dummy.updateMatrix();
        im.setMatrixAt(i, dummy.matrix);
        color.set(b.color);
        im.setColorAt(i, color);
      }
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      im.userData.isBuilding = true;
      im.frustumCulled = false;
      cityGroup.add(im);

      // крыша-парапет
      const roofMat = new THREE.MeshStandardMaterial({ color: '#6f6558', roughness: 1 });
      const roofIm = new THREE.InstancedMesh(box, roofMat, list.length);
      for (let i = 0; i < list.length; i++) {
        const b = list[i];
        dummy.position.set(b.x, b.h + 0.14, b.z);
        dummy.rotation.set(0, b.rot, 0);
        dummy.scale.set(b.w * 1.05, 0.16, b.d * 1.05);
        dummy.updateMatrix();
        roofIm.setMatrixAt(i, dummy.matrix);
      }
      roofIm.instanceMatrix.needsUpdate = true;
      roofIm.frustumCulled = false;
      cityGroup.add(roofIm);
    }

    // деревья в парках и вдоль улиц
    const trunkGeo = new THREE.CylinderGeometry(0.035, 0.055, 0.22, 5);
    const crownGeo = new THREE.IcosahedronGeometry(0.17, 0);
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#5b4630', roughness: 1 });
    const crownMat = new THREE.MeshStandardMaterial({ color: '#4d7a42', roughness: 1 });
    const treeCount = 46 * C.cities.length;
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
    const crowns = new THREE.InstancedMesh(crownGeo, crownMat, treeCount);
    let k = 0;
    for (const city of C.cities) {
      const Rc = cityRadius(city);
      for (let i = 0; i < 46; i++) {
        const a = rand() * Math.PI * 2, r = Rc * (0.15 + rand() * 0.95);
        const x = city.x + Math.cos(a) * r, z = city.y + Math.sin(a) * r;
        const s = 0.8 + rand() * 0.9;
        dummy.position.set(x, terrainHeight(x, z, state) + 0.2 * s, z);
        dummy.rotation.set(0, rand() * 6, 0);
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        trunks.setMatrixAt(k, dummy.matrix);
        dummy.position.y = terrainHeight(x, z, state) + 0.5 * s;
        dummy.scale.set(s * 1.6, s * 1.9, s * 1.6);
        dummy.updateMatrix();
        crowns.setMatrixAt(k, dummy.matrix);
        k++;
      }
    }
    trunks.count = k; crowns.count = k;
    trunks.frustumCulled = false; crowns.frustumCulled = false;
    cityGroup.add(trunks, crowns);

    // вывески городов
    for (const city of C.cities) {
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({
        map: labelTexture(city.name, U.num(city.pop) + ' чел.'), transparent: true, depthTest: false,
      }));
      spr.position.set(city.x, 11, city.y);
      spr.renderOrder = 5;
      spr.userData.isLabel = true;
      cityGroup.add(spr);
    }
    buildForests(rand, state);
    buildVillages(state, rand);
    cityBuilt = true;
  }

  function nearRoad(state, x, z, margin) {
    if (!state || !state.roads) return false;
    for (const road of state.roads) {
      if (!road.open && !road.building) continue;
      if (road.builtKm <= 0.2) continue;
      const c = U.curve(road);
      const ax = c.ax, az = c.ay, bx = c.bx, bz = c.by;
      const dx = bx - ax, dz = bz - az;
      const l2 = dx * dx + dz * dz || 1;
      let t = ((x - ax) * dx + (z - az) * dz) / l2;
      t = U.clamp(t, 0, 1);
      if (Math.hypot(x - (ax + dx * t), z - (az + dz * t)) < margin) return true;
    }
    return false;
  }

  function buildForests(rand, state) {
    const trees = [];
    for (const f of world.forests) {
      const count = Math.max(6, Math.round(f.r * f.r * 0.05));
      for (let i = 0; i < count; i++) {
        const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * f.r;
        const tx = f.x + Math.cos(a) * r, tz = f.y + Math.sin(a) * r;
        // не сажаем деревья на дорогу, в воду и у городов
        if (Wd.riverDist(world, tx, tz) < 3.2) continue;
        if (Wd.lakeFactor(world, tx, tz) > 0.05) continue;
        if (nearRoad(state, tx, tz, 4.5)) continue;
        if (C.cities.some((c) => U.dist(c.x, c.y, tx, tz) < cityRadius(c) * 0.9)) continue;
        trees.push({ x: tx, z: tz, s: 0.7 + rand() * 0.9 });
      }
    }
    const trunkGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.55, 4);
    const crownGeo = new THREE.ConeGeometry(0.4, 1.05, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#4a3826', roughness: 1 });
    const crownMat = new THREE.MeshStandardMaterial({ color: '#335c31', roughness: 1 });
    const tm = new THREE.InstancedMesh(trunkGeo, trunkMat, trees.length);
    const cm = new THREE.InstancedMesh(crownGeo, crownMat, trees.length);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < trees.length; i++) {
      const t = trees[i];
      const gy = terrainHeight(t.x, t.z, state);
      dummy.position.set(t.x, gy + 0.28 * t.s, t.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(t.s, t.s, t.s);
      dummy.updateMatrix();
      tm.setMatrixAt(i, dummy.matrix);
      dummy.position.y = gy + 0.95 * t.s;
      dummy.updateMatrix();
      cm.setMatrixAt(i, dummy.matrix);
    }
    tm.frustumCulled = false; cm.frustumCulled = false;
    propGroup.add(tm, cm);
    // поля и луга уже окрашены вершинными цветами террейна
  }

  function buildVillages(state, rand) {
    if (!state || !state.villages || !state.villages.length) return;
    const list = state.villages.filter((v) => !v.promoted);
    if (!list.length) return;
    const n = Math.min(10, 3 + Math.floor(Math.random() * 6));
    const box = new THREE.BoxGeometry(1, 1, 1);
    const walls = new THREE.InstancedMesh(box, new THREE.MeshStandardMaterial({ color: '#cfc0a4', roughness: 0.95 }), list.length * n);
    const roofs = new THREE.InstancedMesh(new THREE.ConeGeometry(0.8, 0.55, 4), new THREE.MeshStandardMaterial({ color: '#8a4b3a', roughness: 1 }), list.length * n);
    const dummy = new THREE.Object3D();
    let k = 0;
    for (const v of list) {
      const scl = 1 + Math.min(1.4, v.pop / 9000);
      for (let i = 0; i < n; i++) {
        const a = rand() * Math.PI * 2;
        const r = (1.5 + rand() * 6) * scl;
        const hx = v.x + Math.cos(a) * r, hz = v.y + Math.sin(a) * r;
        const gy = terrainHeight(hx, hz, state);
        const w = 0.9 + rand() * 1.1, hgt = 0.5 + rand() * 0.7;
        dummy.position.set(hx, gy + hgt / 2, hz);
        dummy.rotation.set(0, rand() * 3, 0);
        dummy.scale.set(w, hgt, w * (0.8 + rand() * 0.5));
        dummy.updateMatrix();
        walls.setMatrixAt(k, dummy.matrix);
        dummy.position.set(hx, gy + hgt + 0.22, hz);
        dummy.scale.set(w * 0.82, 1, w * 0.82);
        dummy.updateMatrix();
        roofs.setMatrixAt(k, dummy.matrix);
        k++;
      }
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({
        map: labelTexture(v.name, U.num(Math.round(v.pop)) + ' чел.'), transparent: true, depthTest: false, opacity: 0.85,
      }));
      spr.position.set(v.x, 6, v.y);
      spr.scale.set(6, 3, 1);
      spr.renderOrder = 5;
      cityGroup.add(spr);
    }
    walls.count = k; roofs.count = k;
    walls.frustumCulled = false; roofs.frustumCulled = false;
    cityGroup.add(walls, roofs);
  }

  /* -------------------------------------------------------------- дороги */

  function roadSamples(road) {
    const c = U.curve(road);
    const n = 56;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const p = U.curvePoint(c, t);
      const river = Wd.riverDist(world, p.x, p.y);
      const lake = Wd.lakeFactor(world, p.x, p.y) > 0.15;
      const bridge = river < 2.6 || lake;
      pts.push({ x: p.x, z: p.y, t, bridge, y: bridge ? BRIDGE_Y : 0.03 });
    }
    return pts;
  }

  function rebuildRoads(state) {
    roadGroup.clear();
    samples.clear();
    for (const road of state.roads) {
      if (!road.open && !road.building) continue;
      if (road.builtKm <= 0) continue;
      const pts = roadSamples(road);
      const total = pts.length;
      const builtFrac = U.clamp(road.builtKm / Math.max(road.totalKm, 0.001), 0, 1);
      const use = Math.max(2, Math.round(total * builtFrac));
      const q = road.quality;
      const width = ROAD_W[q];
      const seg = pts.slice(0, use);
      // ровная лента: поднимаем только на мостах
      const g = ribbon(seg, width, { vScale: 0.35 });
      const under = ribbon(seg, width + 0.28, { vScale: 0.35 });
      // подложка чуть ниже полотна, иначе z-fighting и «пунктирная» дорога
      const underPos = under.attributes.position;
      for (let i = 0; i < underPos.count; i++) underPos.setY(i, underPos.getY(i) - 0.02);
      underPos.needsUpdate = true;
      roadGroup.add(new THREE.Mesh(under, new THREE.MeshStandardMaterial({ color: '#26271f', roughness: 1 })));
      const mat = new THREE.MeshStandardMaterial({
        map: roadTexture(road.building ? 1 : q), roughness: 0.9, metalness: 0.02,
        color: road.building ? '#b9b0a0' : '#ffffff',
      });
      const mesh = new THREE.Mesh(g, mat);
      mesh.receiveShadow = false;
      roadGroup.add(mesh);

      // бортики
      const edgeMat = new THREE.MeshStandardMaterial({ color: q >= 2 ? '#e6e2d2' : '#3a352c', roughness: 1 });
      for (const s of [-1, 1]) {
        const off = (s * width) / 2;
        const edge = [];
        for (let i = 0; i < seg.length; i++) {
          const p = seg[i];
          const a = seg[Math.max(0, i - 1)], b = seg[Math.min(seg.length - 1, i + 1)];
          let tx = b.x - a.x, tz = b.z - a.z;
          const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
          edge.push({ x: p.x - tz * off, z: p.z + tx * off, y: (p.y || 0.03) + 0.012 });
        }
        roadGroup.add(new THREE.Mesh(ribbon(edge, 0.045, { vScale: 1 }), edgeMat));
      }

      // мосты
      let run = null;
      for (let i = 0; i < seg.length; i++) {
        if (seg[i].bridge) {
          if (!run) run = [i, i];
          else run[1] = i;
        } else if (run) {
          addBridge(seg, run);
          run = null;
        }
      }
      if (run) addBridge(seg, run);

      // фонари вдоль асфальта
      if (!road.building && q >= 2) {
        for (let i = 4; i < seg.length - 2; i += 12) {
          const p = seg[i];
          const a = seg[i - 1], b = seg[i + 1];
          let tx = b.x - a.x, tz = b.z - a.z;
          const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
          const side = (i / 12) % 2 ? 1 : -1;
          addLamp(p.x - tz * side * (width / 2 + 0.22), p.z + tx * side * (width / 2 + 0.22), p.y || 0.03);
        }
      }

      samples.set(road.id, { pts: seg, half: width / 2, quality: q });
    }
  }

  function addBridge(seg, run) {
    const i0 = Math.max(0, run[0] - 1), i1 = Math.min(seg.length - 1, run[1] + 1);
    const a = seg[i0], b = seg[i1];
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    if (len < 0.2) return;
    const angle = Math.atan2(b.x - a.x, b.z - a.z);
    const w = ROAD_W[2] + 0.1;
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.1, len),
      new THREE.MeshStandardMaterial({ color: '#b8b3a4', roughness: 0.9 })
    );
    deck.position.set((a.x + b.x) / 2, BRIDGE_Y - 0.04, (a.z + b.z) / 2);
    deck.rotation.y = angle;
    roadGroup.add(deck);
    const railMat = new THREE.MeshStandardMaterial({ color: '#8f8a7c', roughness: 1 });
    for (const s of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, len), railMat);
      rail.position.set((a.x + b.x) / 2 + Math.cos(angle) * s * (w / 2), BRIDGE_Y + 0.06, (a.z + b.z) / 2 - Math.sin(angle) * s * (w / 2));
      rail.rotation.y = angle;
      roadGroup.add(rail);
    }
    const pillars = Math.max(2, Math.round(len / 1.4));
    const pilMat = new THREE.MeshStandardMaterial({ color: '#9a9385', roughness: 1 });
    for (let i = 1; i < pillars; i++) {
      const t = i / pillars;
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, BRIDGE_Y, 6), pilMat);
      p.position.set(U.lerp(a.x, b.x, t), BRIDGE_Y / 2, U.lerp(a.z, b.z, t));
      roadGroup.add(p);
    }
  }

  const lampGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.55, 4);
  const lampHeadGeo = new THREE.SphereGeometry(0.05, 6, 5);
  function addLamp(x, z, y) {
    const post = new THREE.Mesh(lampGeo, TR.View3D.lampMat || (TR.View3D.lampMat = new THREE.MeshStandardMaterial({ color: '#8d8a80', roughness: 1 })));
    post.position.set(x, (y || 0) + 0.28, z);
    propGroup.add(post);
    const head = new THREE.Mesh(lampHeadGeo, TR.View3D.lampHeadMat || (TR.View3D.lampHeadMat = new THREE.MeshStandardMaterial({
      color: '#ffe9b0', emissive: new THREE.Color('#ffd98a'), emissiveIntensity: 0.2, roughness: 0.6,
    })));
    head.position.set(x, (y || 0) + 0.56, z);
    propGroup.add(head);
  }

  /* ------------------------------------------------------------ объекты */

  function facilityPos(f, road) {
    const c = U.curve(road);
    const p = U.curvePoint(c, f.t);
    // нормаль к дороге
    const pts = samples.get(road.id);
    let tx = 0, tz = 1;
    if (pts && pts.pts.length > 2) {
      const i = U.clamp(Math.round(f.t * (pts.pts.length - 1)), 1, pts.pts.length - 2);
      tx = pts.pts[i + 1].x - pts.pts[i - 1].x;
      tz = pts.pts[i + 1].z - pts.pts[i - 1].z;
      const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
    }
    const side = f.side || 1;
    const off = (samples.get(road.id) ? samples.get(road.id).half : 0.16) + 0.42;
    return { x: p.x - tz * side * off, y: p.y + tx * side * off };
  }
  R.facilityPos = facilityPos;
  R.facilityWorldPos = facilityPos;

  function facilityLabel(def) {
    const n = String(def.name || def.key).replace(/[«»"']/g, '');
    return n.split(' ').slice(0, 2).join(' ').slice(0, 13);
  }

  function facilityMesh(f, road) {
    const def = C.facilityByKey[f.type];
    const pos = facilityPos(f, road);
    const g = new THREE.Group();
    const col = new THREE.Color(def.color || '#d8cfc0');
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.18, 0.26),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.8 })
    );
    body.position.y = 0.09;
    g.add(body);
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.05, 0.32),
      new THREE.MeshStandardMaterial({ color: '#f2eee0', roughness: 0.7, emissive: new THREE.Color('#000000') })
    );
    roof.position.y = 0.2;
    g.add(roof);
    // вывеска
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.25),
      new THREE.MeshBasicMaterial({ map: signTexture(facilityLabel(def), '#12181d', '#ffd166'), transparent: true })
    );
    sign.position.set(0, 0.46, 0);
    sign.rotation.y = 0;
    g.add(sign);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 4), new THREE.MeshStandardMaterial({ color: '#7d7a70' }));
    pole.position.set(0, 0.3, 0);
    g.add(pole);
    g.position.set(pos.x, 0.03, pos.y);
    g.userData.def = def;
    g.userData.sway = Math.random() * 6;
    return g;
  }

  function rebuildFacilities(state) {
    for (const m of facilityMeshes.values()) { facilityGroupRemove(m); }
    facilityMeshes.clear();
    for (const f of state.facilities) {
      const road = TR.Sim.roadById(state, f.roadId);
      if (!road || (!road.open && !road.building)) continue;
      const m = facilityMesh(f, road);
      m.userData.fac = f;
      facilityMeshes.set(f.id, m);
      facilityGroup.add(m);
    }
  }
  function facilityGroupRemove(m) {
    facilityGroup.remove(m);
    m.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  }

  /* -------------------------------------------------------------- машины */

  function mergedBoxes(parts) {
    const pos = [], nor = [], col = [], idx = [];
    let vi = 0;
    for (const p of parts) {
      const hx = p.w / 2, hy = p.h / 2, hz = p.d / 2;
      const c = new THREE.Color(p.color || '#ffffff');
      const faces = [
        [[-hx, -hy, hz], [hx, -hy, hz], [hx, hy, hz], [-hx, hy, hz], [0, 0, 1]],
        [[hx, -hy, -hz], [-hx, -hy, -hz], [-hx, hy, -hz], [hx, hy, -hz], [0, 0, -1]],
        [[hx, -hy, hz], [hx, -hy, -hz], [hx, hy, -hz], [hx, hy, hz], [1, 0, 0]],
        [[-hx, -hy, -hz], [-hx, -hy, hz], [-hx, hy, hz], [-hx, hy, -hz], [-1, 0, 0]],
        [[-hx, hy, hz], [hx, hy, hz], [hx, hy, -hz], [-hx, hy, -hz], [0, 1, 0]],
        [[-hx, -hy, -hz], [hx, -hy, -hz], [hx, -hy, hz], [-hx, -hy, hz], [0, -1, 0]],
      ];
      for (const f of faces) {
        const n = f[4];
        for (let i = 0; i < 4; i++) {
          pos.push(p.x + f[i][0], p.y + f[i][1], p.z + f[i][2]);
          nor.push(n[0], n[1], n[2]);
          col.push(c.r, c.g, c.b);
        }
        idx.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3);
        vi += 4;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    return g;
  }

  function vehicleGeometry(kind) {
    const dark = '#20262c', glass = '#9fc6d8', lamp = '#ffe6a8';
    if (kind === 'truck') {
      return mergedBoxes([
        { x: 0, y: 0.055, z: -0.05, w: 0.055, h: 0.075, d: 0.2, color: '#e9e5d8' },
        { x: 0, y: 0.115, z: 0.075, w: 0.058, h: 0.06, d: 0.06, color: '#4f7fa3' },
        { x: 0, y: 0.06, z: 0.1, w: 0.05, h: 0.05, d: 0.02, color: glass },
        { x: -0.03, y: 0.03, z: -0.09, w: 0.018, h: 0.035, d: 0.035, color: dark },
        { x: 0.03, y: 0.03, z: -0.09, w: 0.018, h: 0.035, d: 0.035, color: dark },
        { x: -0.03, y: 0.03, z: 0.03, w: 0.018, h: 0.035, d: 0.035, color: dark },
        { x: 0.03, y: 0.03, z: 0.03, w: 0.018, h: 0.035, d: 0.035, color: dark },
        { x: 0, y: 0.055, z: 0.135, w: 0.045, h: 0.02, d: 0.012, color: lamp },
      ]);
    }
    if (kind === 'bus') {
      return mergedBoxes([
        { x: 0, y: 0.065, z: 0, w: 0.052, h: 0.075, d: 0.19, color: '#e8b545' },
        { x: 0, y: 0.085, z: -0.02, w: 0.054, h: 0.03, d: 0.12, color: glass },
        { x: -0.028, y: 0.03, z: -0.06, w: 0.016, h: 0.032, d: 0.032, color: dark },
        { x: 0.028, y: 0.03, z: -0.06, w: 0.016, h: 0.032, d: 0.032, color: dark },
        { x: -0.028, y: 0.03, z: 0.05, w: 0.016, h: 0.032, d: 0.032, color: dark },
        { x: 0.028, y: 0.03, z: 0.05, w: 0.016, h: 0.032, d: 0.032, color: dark },
      ]);
    }
    return mergedBoxes([
      { x: 0, y: 0.045, z: 0, w: 0.044, h: 0.045, d: 0.1, color: '#d8d6ce' },
      { x: 0, y: 0.078, z: -0.005, w: 0.038, h: 0.03, d: 0.05, color: glass },
      { x: -0.023, y: 0.022, z: -0.032, w: 0.014, h: 0.028, d: 0.028, color: dark },
      { x: 0.023, y: 0.022, z: -0.032, w: 0.014, h: 0.028, d: 0.028, color: dark },
      { x: -0.023, y: 0.022, z: 0.032, w: 0.014, h: 0.028, d: 0.028, color: dark },
      { x: 0.023, y: 0.022, z: 0.032, w: 0.014, h: 0.028, d: 0.028, color: dark },
      { x: 0, y: 0.05, z: 0.052, w: 0.03, h: 0.014, d: 0.008, color: lamp },
    ]);
  }

  function ensureVehicleMeshes() {
    if (vehicleSlots.size) return;
    const kinds = ['car', 'truck', 'bus', 'ev'];
    for (const k of kinds) {
      const geo = vehicleGeometry(k);
      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true, roughness: 0.55, metalness: 0.25, color: '#ffffff',
      });
      const im = new THREE.InstancedMesh(geo, mat, 400);
      im.count = 0;
      im.frustumCulled = false;
      im.userData.kind = k;
      vehicleGroup.add(im);
      vehicleSlots.set(k, { mesh: im, n: 0 });
    }
  }

  const laneDummy = new THREE.Object3D();
  function updateVehicles(state) {
    ensureVehicleMeshes();
    for (const slot of vehicleSlots.values()) slot.n = 0;
    for (const v of state.vehicles) {
      const step = v.path && v.path[v.edgeIdx];
      if (!step) continue;
      const smp = samples.get(step.roadId);
      if (!smp || smp.pts.length < 2) continue;
      // точная позиция по кривой дороги (а не по редким точкам выборки) — машины едут плавно
      const road = TR.Sim.roadById(state, step.roadId);
      if (!road) continue;
      const curve = U.curve(road);
      const tw = step.dir === 1 ? v.t : 1 - v.t;
      const cur = U.curvePoint(curve, tw);
      const ang = U.curveAngle(curve, tw);
      const dir = step.dir === 1 ? 1 : -1;
      const side = dir > 0 ? 1 : -1;             // правостороннее движение
      const off = side * (smp.half || 0.31) * 0.48;
      // высота: линейно между точками моста/полотна
      const nPts = smp.pts.length - 1;
      const fi = U.clamp(tw, 0, 1) * nPts;
      const i0 = Math.max(0, Math.min(nPts, Math.floor(fi)));
      const i1 = Math.min(nPts, i0 + 1);
      const fr = fi - i0;
      const yA = (smp.pts[i0] && smp.pts[i0].y) || 0.03;
      const yB = (smp.pts[i1] && smp.pts[i1].y) || yA;
      const py = yA + (yB - yA) * fr;
      const slot = vehicleSlots.get(v.kind === 'truck' || v.kind === 'bus' || v.kind === 'ev' ? v.kind : 'car');
      if (!slot || slot.n >= 400) continue;
      laneDummy.position.set(cur.x - Math.sin(ang) * off, py + 0.02, cur.y + Math.cos(ang) * off);
      laneDummy.rotation.set(0, Math.atan2(Math.cos(ang) * dir, Math.sin(ang) * dir), 0);
      laneDummy.scale.setScalar(v.kind === "truck" || v.kind === "bus" ? 3.2 : 2.5);
      laneDummy.updateMatrix();
      slot.mesh.setMatrixAt(slot.n, laneDummy.matrix);
      const c = new THREE.Color(v.color || '#d8d6ce');
      slot.mesh.setColorAt(slot.n, c);
      slot.n++;
    }
    for (const slot of vehicleSlots.values()) {
      slot.mesh.count = slot.n;
      slot.mesh.instanceMatrix.needsUpdate = true;
      if (slot.mesh.instanceColor) slot.mesh.instanceColor.needsUpdate = true;
    }
  }

  /* ------------------------------------------------------- маркеры/эффекты */

  let selectionRing = null, previewMesh = null, previewRing = null, cityTargetRing = null;
  function ensureMarkers() {
    if (!selectionRing) {
      const g = new THREE.RingGeometry(0.9, 1.15, 40);
      g.rotateX(-Math.PI / 2);
      selectionRing = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#ffd166', transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
      markerGroup.add(selectionRing);
    }
    if (!previewRing) {
      const g = new THREE.RingGeometry(0.55, 0.72, 28);
      g.rotateX(-Math.PI / 2);
      previewRing = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#7fe3a0', transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
      markerGroup.add(previewRing);
    }
    if (!cityTargetRing) {
      const g = new THREE.RingGeometry(0.86, 1.05, 32);
      g.rotateX(-Math.PI / 2);
      cityTargetRing = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#7fc8ff', transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
      cityTargetRing.visible = false;
      markerGroup.add(cityTargetRing);
    }
    if (!previewMesh) {
      previewMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.18, 0.26),
        new THREE.MeshBasicMaterial({ color: '#8ef0ae', transparent: true, opacity: 0.55 })
      );
      markerGroup.add(previewMesh);
    }
  }

  function updateMarkers(app) {
    ensureMarkers();
    const s = app.state;
    const sel = app.selection;
    let show = false;
    if (sel) {
      if (sel.kind === 'facility') {
        const f = s.facilities.find((x) => x.id === sel.id);
        const road = f && TR.Sim.roadById(s, f.roadId);
        if (f && road) {
          const p = facilityPos(f, road);
          selectionRing.position.set(p.x, 0.07, p.y);
          selectionRing.scale.setScalar(1.0);
          show = true;
        }
      } else if (sel.kind === 'city') {
        const c = C.cities[sel.id];
        if (c) { selectionRing.position.set(c.x, 0.07, c.y); selectionRing.scale.setScalar(cityRadius(c) * 0.9); show = true; }
      } else if (sel.kind === 'road') {
        const road = TR.Sim.roadById(s, sel.id);
        const smp = road && samples.get(road.id);
        if (smp && smp.pts.length) {
          const p = smp.pts[Math.floor(smp.pts.length / 2)];
          selectionRing.position.set(p.x, (p.y || 0.03) + 0.03, p.z);
          selectionRing.scale.setScalar(1.6);
          show = true;
        }
      }
    }
    selectionRing.visible = show;

    // предпросмотр объекта
    const pp = app.placePreview;
    if (pp && pp.roadId) {
      const road = TR.Sim.roadById(s, pp.roadId);
      if (road) {
        const p = facilityPos({ t: pp.t, side: pp.side }, road);
        previewMesh.visible = true;
        previewRing.visible = true;
        previewMesh.position.set(p.x, 0.12, p.y);
        previewMesh.material.color.set(pp.ok ? '#8ef0ae' : '#ff8a7a');
        previewRing.position.set(p.x, 0.06, p.y);
        previewRing.material.color.set(pp.ok ? '#8ef0ae' : '#ff8a7a');
      }
    } else {
      previewMesh.visible = false;
      previewRing.visible = false;
    }

    // предпросмотр новой дороги
    const roadTarget = app.tool === 'road' && app.roadFrom !== null && app.roadFrom !== undefined
      && app.hover && app.hover.city !== null && app.hover.city !== undefined;
    cityTargetRing.visible = !!roadTarget;
    if (roadTarget) {
      const c = C.cities[app.hover.city];
      cityTargetRing.position.set(c.x, 0.07, c.y);
      cityTargetRing.scale.setScalar(2.4);
    }
  }

  function updateFloats(state, dt) {
    for (let i = state.floats.length - 1; i >= 0; i--) {
      const f = state.floats[i];
      f.life -= dt;
      f.y -= dt * 1.2;
      if (f.life <= 0) { state.floats.splice(i, 1); }
    }
    floatGroup.clear();
    for (const f of state.floats) {
      if (!f._spr) {
        const { c, x } = canvas2d(256, 96);
        x.font = 'bold 54px Arial, sans-serif';
        x.textAlign = 'center';
        x.textBaseline = 'middle';
        x.fillStyle = f.kind === 'expense' ? '#ff9b8a' : '#a8f0a0';
        x.strokeStyle = 'rgba(0,0,0,0.65)';
        x.lineWidth = 8;
        x.strokeText(f.text, 128, 48);
        x.fillText(f.text, 128, 48);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        f._spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false }));
        f._spr.scale.set(2.6, 1, 1);
        f._spr.renderOrder = 8;
      }
      f._spr.position.set(f.x, 1.4 + (f.max - f.life) * 1.6, f.y);
      f._spr.material.opacity = U.clamp(f.life / 0.6, 0, 1);
      floatGroup.add(f._spr);
    }
  }

  /* ---------------------------------------------------------- день/ночь */

  function updateSky(state) {
    const h = U.timeHours(state.time);
    const day = U.clamp(Math.sin(((h - 6) / 24) * Math.PI * 2) * 0.5 + 0.5, 0, 1);
    const dawn = Math.exp(-Math.pow((h - 6.5) / 1.6, 2)) + Math.exp(-Math.pow((h - 18.5) / 1.8, 2));
    const night = new THREE.Color('#0a1220');
    const dusk = new THREE.Color('#4a3550');
    const noon = new THREE.Color('#8fb8d8');
    const sky = night.clone().lerp(noon, Math.pow(day, 0.8));
    sky.lerp(dusk, U.clamp(dawn * 0.8, 0, 1));
    scene.background.copy(sky);
    scene.fog.color.copy(sky);
    const sunAngle = ((h - 6) / 12) * Math.PI;
    const elev = Math.sin(sunAngle);
    sunLight.position.set(Math.cos(sunAngle) * 90, Math.max(6, elev * 110), 40);
    sunLight.intensity = 0.45 + Math.max(0, elev) * 1.6;
    sunLight.color.setHSL(0.09, 0.55, 0.5 + Math.max(0, elev) * 0.25);
    hemiLight.intensity = 0.55 + day * 0.85;
    ambient.intensity = 0.24 + day * 0.34;
    const nightF = 1 - day;
    // окна и фонари
    cityGroup.traverse((o) => {
      if (o.isInstancedMesh && o.material && o.material.emissiveMap) o.material.emissiveIntensity = nightF * 0.85;
    });
    const headMat = TR.View3D.lampHeadMat;
    if (headMat) headMat.emissiveIntensity = 0.15 + nightF * 1.4;
  }

  /* ---------------------------------------------------------------- кадр */

  function buildWorld(state) {
    cityBuilt = false;
    propGroup.clear();
    facilityMeshes.clear();
    buildTerrainMesh(state);
    buildWater();
    buildCities(state);
    rebuildRoads(state || { roads: [] });
    if (state) rebuildFacilities(state);
    cityBuilt = true;
    roadSig = state ? state.graphVersion : null;
    facSig = state ? state.facVersion : null;
    citySig = state ? state.cityVersion : -1;
  }
  R.buildTerrain = function (w) {
    if (w) world = w;
    buildWorld((TR.App && TR.App.state) || null);
  };

  R.draw = function (app, dt) {
    if (!renderer) return;
    const s = app.state;
    clock.t += dt;
    syncCamera(app);
    if (!cityBuilt || roadSig === null) buildWorld(s);
    else if (roadSig !== s.graphVersion) buildWorld(s);
    else if (citySig !== s.cityVersion) { buildCities(s); citySig = s.cityVersion; }
    if (facSig !== s.facVersion) {
      rebuildFacilities(s);
      facSig = s.facVersion;
    }
    updateSky(s);
    // подписи городов держим одного размера на экране
    const labelScale = 128 / Math.max(ppkNow, 0.01);
    for (const o of cityGroup.children) {
      if (o.isSprite && o.userData.isLabel) o.scale.set(labelScale, labelScale * 0.375, 1);
    }
    updateVehicles(s);
    updateMarkers(app);
    updateFloats(s, dt);
    // шевеление воды
    if (TEX.water) TEX.water.offset.y = (clock.t * 0.015) % 1;
    renderer.render(scene, camera);
  };

  V.stats = () => ({
    vehicles: [...vehicleSlots.values()].reduce((n, s) => n + s.n, 0),
    roads: samples.size,
    facilities: facilityMeshes.size,
    ppk: ppkNow,
  });
})();
