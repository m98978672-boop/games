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
  const ROAD_W = [0.62, 0.74, 0.92, 1.10, 1.05];   // км, по типу покрытия (+ ж/д)
  const BRIDGE_Y = 0.60;

  let canvas, renderer, scene, camera, world;
  let sunLight, hemiLight, ambient;
  let terrainMesh, waterGroup, cityGroup, roadGroup, propGroup, facilityGroup, vehicleGroup, markerGroup, floatGroup;
  let raycaster, groundPlane;
  let vw = 1, vh = 1;
  let ppkNow = PX_PER_KM;
  let roadSig = null, facSig = null, citySig = -1, cityBuilt = false, lastBuildSig = -1;
  let roadFarMul = 1, roadFarPrev = 0;   // насколько расширить полотно на дальнем плане
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
  let ribbonWarned = false;
  function ribbon(pts, width, opts) {
    opts = opts || {};
    // защита от NaN: одна «битая» точка раньше делала невидимой всю дорогу
    const rawW = typeof width === 'function' ? width(0.5) : width;
    if (!isFinite(rawW)) {
      if (!ribbonWarned) { ribbonWarned = true; console.warn('ribbon: ширина NaN -> 0.8'); }
      width = 0.8;
    }
    const clean = [];
    for (const p of pts) {
      if (isFinite(p.x) && isFinite(p.z) && (p.y === undefined || isFinite(p.y))) clean.push(p);
    }
    if (clean.length < 2) {
      if (!ribbonWarned) { ribbonWarned = true; console.warn('ribbon: точек меньше двух'); }
      const empty = new THREE.BufferGeometry();
      empty.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
      return empty;
    }
    if (clean.length !== pts.length && !ribbonWarned) {
      ribbonWarned = true;
      console.warn('ribbon: отброшено точек', pts.length - clean.length);
    }
    pts = clean;
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
    // Морской берег на юге карты: рельеф плавно уходит под воду
    const coast = C.worldH - 58;
    if (z > coast) {
      const k = U.clamp((z - coast) / 22, 0, 1);
      h = h * (1 - k) - 1.4 * k;
    }
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
    // ВАЖНО: рельеф НЕ приминается под дорогами. Иначе полотно считало высоту по примятой
    // земле, а сетка рельефа (строится один раз) оставалась высокой — дорога уходила под землю,
    // а машины ехали «по земле». Теперь дорога и рельеф считаются по одной поверхности.
    return m;
  }

  function terrainHeight(x, z, state) {
    return baseHeight(x, z) * flatMask(x, z, state);
  }

  const TERRAIN_N = 260;   // столько же сегментов, сколько у сетки рельефа

  // Высота РОВНО той поверхности, которую видно на экране: билинейно по вершинам
  // и с учётом реальной диагонали треугольников (a,c,b)+(b,c,d).
  function meshHeight(x, z, state) {
    const N = TERRAIN_N;
    const gx = U.clamp((x / C.worldW) * N, 0, N - 1e-6);
    const gz = U.clamp((z / C.worldH) * N, 0, N - 1e-6);
    const i = Math.floor(gx), j = Math.floor(gz);
    const u = gx - i, v = gz - j;
    const x0 = (i / N) * C.worldW, x1 = ((i + 1) / N) * C.worldW;
    const z0 = (j / N) * C.worldH, z1 = ((j + 1) / N) * C.worldH;
    const ha = terrainHeight(x0, z0, state);
    const hb = terrainHeight(x1, z0, state);
    const hc = terrainHeight(x0, z1, state);
    const hd = terrainHeight(x1, z1, state);
    if (u + v <= 1) return ha + (hb - ha) * u + (hc - ha) * v;
    return hd + (hc - hd) * (1 - u) + (hb - hd) * (1 - v);
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
    const N = TERRAIN_N;
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
        if (z > C.worldH - 62) c = cSand;                      // пляж у моря
        else if (z > C.worldH - 78) c = cField;                // прибрежные дюны
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
      polygonOffset: true, polygonOffsetFactor: 3, polygonOffsetUnits: 6,
    });
    terrainMesh = new THREE.Mesh(g, mat);
    terrainMesh.renderOrder = -1;
    scene.add(terrainMesh);
  }

  /* -------------------------------------------------------------- вода */

  function buildWater() {
    waterGroup.clear();
    // вода: низкая шероховатость + металличность даёт блики неба, как у настоящей поверхности
    const waterMat = new THREE.MeshStandardMaterial({
      map: waterTexture(), color: '#7cc9e4', emissive: new THREE.Color('#0b2c3c'), emissiveIntensity: 0.3,
      roughness: 0.05, metalness: 0.5, transparent: true, opacity: 0.93,
    });
    const shallowMat = new THREE.MeshStandardMaterial({
      color: '#b6e3ee', transparent: true, opacity: 0.6, roughness: 0.15, metalness: 0.2,
    });
    const sandMat = new THREE.MeshStandardMaterial({ color: '#cbbd93', roughness: 1 });
    const reedMat = new THREE.MeshStandardMaterial({ color: '#6f8c41', roughness: 1 });
    const reedGeo = new THREE.ConeGeometry(0.12, 0.55, 4);

    for (const river of world.rivers) {
      const pts = river.map((p) => ({ x: p.x, z: p.y }));
      const smooth = [];
      for (let i = 0; i < pts.length - 1; i++) {
        for (let k = 0; k < 6; k++) {
          const t = k / 6;
          smooth.push({ x: U.lerp(pts[i].x, pts[i + 1].x, t), z: U.lerp(pts[i].z, pts[i + 1].z, t) });
        }
      }
      smooth.push(pts[pts.length - 1]);
      const wAt = (t) => 1.9 + Math.sin(t * 7.5) * 0.35 + Math.sin(t * 21) * 0.12;

      // песчаная отмель (самая широкая, лежит ниже всех)
      waterGroup.add(new THREE.Mesh(ribbon(smooth, (t) => wAt(t) + 2.3, { y: 0.06, vScale: 6 }), sandMat));
      // мелководье
      waterGroup.add(new THREE.Mesh(ribbon(smooth, (t) => wAt(t) + 0.9, { y: 0.12, vScale: 6 }), shallowMat));
      // само русло
      waterGroup.add(new THREE.Mesh(ribbon(smooth, wAt, { y: 0.16, vScale: 6 }), waterMat));

      // камыш по берегам — река сразу читается как живая
      const randR = U.mulberry32(Math.round(smooth[0].x * 13 + smooth[0].z * 7) + 11);
      for (let i = 6; i < smooth.length - 6; i += 5) {
        const a = smooth[i - 1], b = smooth[i + 1];
        let tx = b.x - a.x, tz = b.z - a.z;
        const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
        const nx = -tz, nz = tx;
        for (const side of [-1, 1]) {
          if (randR() > 0.55) continue;
          const off = (wAt(i / smooth.length) / 2 + 1.5 + randR() * 0.8) * side;
          const reed = new THREE.Mesh(reedGeo, reedMat);
          reed.position.set(smooth[i].x + nx * off, 0.32, smooth[i].z + nz * off);
          reed.scale.y = 0.7 + randR() * 0.9;
          waterGroup.add(reed);
        }
      }
    }

    // Море на юге карты: пляж, полоса прибоя и вода до самого края
    {
      const coastZ = C.worldH - 58;
      const beach = new THREE.Mesh(new THREE.PlaneGeometry(C.worldW * 1.4, 26), sandMat.clone());
      beach.rotation.x = -Math.PI / 2;
      beach.position.set(C.worldW / 2, 0.055, coastZ - 2);
      waterGroup.add(beach);
      const shore = new THREE.Mesh(new THREE.PlaneGeometry(C.worldW * 1.4, 34), shallowMat);
      shore.rotation.x = -Math.PI / 2;
      shore.position.set(C.worldW / 2, 0.075, coastZ + 18);
      waterGroup.add(shore);
      const sea = new THREE.Mesh(new THREE.PlaneGeometry(C.worldW * 1.6, 220), waterMat.clone());
      sea.rotation.x = -Math.PI / 2;
      sea.position.set(C.worldW / 2, 0.09, coastZ + 120);
      waterGroup.add(sea);
      // пена у кромки
      const foam = new THREE.Mesh(new THREE.PlaneGeometry(C.worldW * 1.4, 2.2),
        new THREE.MeshBasicMaterial({ color: '#eaf6fb', transparent: true, opacity: 0.55 }));
      foam.rotation.x = -Math.PI / 2;
      foam.position.set(C.worldW / 2, 0.1, coastZ + 6);
      waterGroup.add(foam);
    }

    for (const lake of world.lakes) {
      const disc = new THREE.CircleGeometry(1, 48);
      disc.rotateX(-Math.PI / 2);
      // отмель
      const sand = new THREE.Mesh(disc, sandMat);
      sand.scale.set(lake.rx * 1.16, 1, lake.ry * 1.18);
      sand.rotation.y = lake.rot;
      sand.position.set(lake.x, 0.05, lake.y);
      waterGroup.add(sand);
      // мелководье
      const sh = new THREE.Mesh(disc, shallowMat);
      sh.scale.set(lake.rx * 1.06, 1, lake.ry * 1.06);
      sh.rotation.y = lake.rot;
      sh.position.set(lake.x, 0.11, lake.y);
      waterGroup.add(sh);
      // камыш по кромке — озеро выглядит живым
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2 + 0.2;
        const rx = Math.cos(a) * lake.rx * 1.12, rz = Math.sin(a) * lake.ry * 1.14;
        const reed = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.5, 4),
          new THREE.MeshStandardMaterial({ color: k % 3 ? '#5f7f43' : '#7d9454', roughness: 1 }));
        reed.position.set(lake.x + rx, 0.25, lake.y + rz);
        waterGroup.add(reed);
      }
      // вода
      const m = new THREE.Mesh(disc, waterMat);
      m.scale.set(lake.rx, 1, lake.ry);
      m.rotation.y = lake.rot;
      m.position.set(lake.x, 0.15, lake.y);
      waterGroup.add(m);
      // камыш по кромке
      const randL = U.mulberry32(Math.round(lake.x * 17 + lake.y * 5) + 3);
      for (let i = 0; i < 26; i++) {
        const ang = randL() * Math.PI * 2;
        const rr = 0.98 + randL() * 0.16;
        const reed = new THREE.Mesh(reedGeo, reedMat);
        reed.position.set(lake.x + Math.cos(ang) * lake.rx * rr, 0.32, lake.y + Math.sin(ang) * lake.ry * rr);
        reed.scale.y = 0.7 + randL() * 0.9;
        waterGroup.add(reed);
      }
    }
  }

  /* -------------------------------------------------------------- город */

  const BUILD_TYPES = [
    { w: 0.34, d: 0.34, h: [0.22, 0.75], tint: ['#e7dfd0', '#cfc7b6', '#d9cdb9', '#ffffff', '#c9a98c'] },
    { w: 0.5, d: 0.36, h: [0.12, 0.3], tint: ['#c9bda8', '#b9ae9a', '#d6c8ae', '#a8563f', '#8f9aa5'] },
    { w: 0.26, d: 0.26, h: [0.4, 1.15], tint: ['#c3ccd4', '#b7c3cc', '#cfd6da', '#9fb6c9', '#dfe6ea'] },
    { w: 0.6, d: 0.48, h: [0.1, 0.22], tint: ['#b9a894', '#c7b6a1', '#ad9d8b', '#9c8f7d'] },
    // промзона: цеха (широкие, низкие, металл с ржавчиной)
    { w: 0.86, d: 0.6, h: [0.16, 0.3], tint: ['#9aa3a8', '#8a949a', '#a7b0b4', '#b08a6e'] },
    // склады и ангары
    { w: 0.72, d: 0.56, h: [0.12, 0.2], tint: ['#a9b0b5', '#c2c8cc', '#8f979c', '#b7bfc4'] },
  ];

  // Ориентир города: ратуша, собор с куполом, ТВ-башня или стадион.
  // Разные силуэты — города перестают быть близнецами.
  function landmark(kind, city, cell) {
    const stone = new THREE.MeshStandardMaterial({ color: '#e6dcc8', roughness: 0.75 });
    const dark = new THREE.MeshStandardMaterial({ color: '#5b5147', roughness: 0.9 });
    if (kind === 0) {
      const body = new THREE.Mesh(new THREE.BoxGeometry(cell * 1.2, 15, cell * 1.2), stone);
      body.position.set(city.x, 7.5, city.y);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(cell * 0.95, 9, 4),
        new THREE.MeshStandardMaterial({ color: '#b05a41', roughness: 0.9 }));
      roof.position.set(city.x, 19.5, city.y);
      roof.rotation.y = Math.PI / 4;
      cityGroup.add(body, roof);
    } else if (kind === 1) {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(cell * 1.15, cell * 1.3, 7, 14), stone);
      base.position.set(city.x, 3.5, city.y);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(cell * 1.18, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: '#7ea9c9', roughness: 0.35, metalness: 0.55 }));
      dome.position.set(city.x, 7, city.y);
      const cross = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3, 6),
        new THREE.MeshStandardMaterial({ color: '#d8c07a', roughness: 0.4, metalness: 0.7 }));
      cross.position.set(city.x, 7 + cell * 1.18 + 1.4, city.y);
      cityGroup.add(base, dome, cross);
    } else if (kind === 2) {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.55, 34, 8), stone);
      mast.position.set(city.x, 17, city.y);
      const ball = new THREE.Mesh(new THREE.SphereGeometry(cell * 0.85, 14, 10),
        new THREE.MeshStandardMaterial({ color: '#e08a5a', roughness: 0.5 }));
      ball.position.set(city.x, 19, city.y);
      const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 8, 5), dark);
      tip.position.set(city.x, 38, city.y);
      cityGroup.add(mast, ball, tip);
    } else {
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(cell * 2.0, cell * 1.7, 3.4, 22, 1, true),
        new THREE.MeshStandardMaterial({ color: '#d7d3c6', roughness: 0.9, side: THREE.DoubleSide }));
      bowl.position.set(city.x, 1.7, city.y);
      const field = new THREE.Mesh(new THREE.CircleGeometry(cell * 1.7, 22),
        new THREE.MeshStandardMaterial({ color: '#3f7a37', roughness: 1 }));
      field.rotation.x = -Math.PI / 2;
      field.position.set(city.x, 0.09, city.y);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 16, 6), dark);
      mast.position.set(city.x + cell * 1.9, 8, city.y);
      cityGroup.add(bowl, field, mast);
    }
  }

  function buildCities(state) {
    cityGroup.clear();
    const rand = U.mulberry32(world.seed * 97 + 5);
    const lists = [[], [], [], [], [], []];
    const streetPts = [];
    for (let ci = 0; ci < C.cities.length; ci++) {
      const city = C.cities[ci];
      // размер города фиксирован (по исходному населению из конфига):
      // рост идёт застройкой свободных кварталов, а не расширением пятна
      const basePop = city.pop || 20000;
      const Rc = 9 + Math.min(basePop, 420000) / 3500;
      const live = (state && state.cities && state.cities[ci]) ? state.cities[ci] : null;
      const pop = live ? live.pop : basePop;
      const popNorm = U.clamp(pop / 150000, 0, 1);
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
          // на воде не строим: город обходит реки и озёра
          if (Wd.riverDist(world, cx, cz) < 3.4) continue;
          if (Wd.lakeFactor(world, cx, cz) > 0.02) continue;
          // плотность застройки = население: больше жителей -> больше кварталов занято
          const ring = distC / half;                 // 0 центр … 1 окраина
          const density = (0.20 + 0.74 * popNorm) * (1 - ring * 0.4);
          if (rand() > density) continue;
          // районы как в Transport Fever: центр — коммерция, средина — жильё, окраина — промзона
          const roll = rand();
          let type;
          if (ring < 0.34) type = roll < 0.5 ? 2 : (roll < 0.82 ? 0 : 3);
          else if (ring < 0.72) type = roll < 0.48 ? 0 : (roll < 0.8 ? 1 : (roll < 0.93 ? 2 : 3));
          else type = roll < 0.4 ? 4 : (roll < 0.68 ? 5 : (roll < 0.88 ? 3 : 1));
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
          // дымовые трубы у цехов промзоны — город читается с высоты
          if ((type === 4 || type === 5) && rand() < 0.14) {
            const chh = 1.5 + rand() * 1.7;
            const chm = new THREE.Mesh(
              new THREE.CylinderGeometry(0.15, 0.2, chh, 7),
              new THREE.MeshStandardMaterial({ color: '#cbc5b6', roughness: 0.95 })
            );
            chm.position.set(cx + w * 0.28, h + chh / 2, cz - d * 0.22);
            cityGroup.add(chm);
            const smoke = new THREE.Mesh(
              new THREE.SphereGeometry(0.24, 7, 5),
              new THREE.MeshBasicMaterial({ color: '#e9e7e1', transparent: true, opacity: 0.3 })
            );
            smoke.position.set(cx + w * 0.28, h + chh + 0.16, cz - d * 0.22);
            cityGroup.add(smoke);
          }
        }
      }
      // подложка города и центральная площадь
      // ореол и кольцевая — город читается даже с обзора всей карты
      const halo = new THREE.Mesh(
        new THREE.CircleGeometry(half * 1.75, 40),
        new THREE.MeshBasicMaterial({ color: '#ffe0a3', transparent: true, opacity: 0.13 })
      );
      halo.rotation.x = -Math.PI / 2;
      halo.position.set(city.x, 0.021, city.y);
      cityGroup.add(halo);
      const ringRoad = new THREE.Mesh(
        new THREE.RingGeometry(half * 1.16, half * 1.24, 48),
        new THREE.MeshStandardMaterial({ color: '#5c6470', roughness: 1 })
      );
      ringRoad.rotation.x = -Math.PI / 2;
      ringRoad.position.set(city.x, 0.03, city.y);
      cityGroup.add(ringRoad);

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
      // парк: деревья и дорожки — город перестаёт быть «серой сеткой»
      propGroup.add(quad(px, pz, cell * 1.1, cell * 1.8, 0.05, '#b8ad8e'));
      for (let t = 0; t < 8; t++) {
        const ang = rand() * Math.PI * 2, rr = 0.25 + rand() * 0.95;
        const tx0 = px + Math.cos(ang) * cell * rr;
        const tz0 = pz + Math.sin(ang) * cell * rr;
        if (Wd.riverDist(world, tx0, tz0) < 3.2 || Wd.lakeFactor(world, tx0, tz0) > 0.02) continue;
        const th = 1.1 + rand() * 1.1;
        const crown = new THREE.Mesh(
          new THREE.ConeGeometry(0.34 + rand() * 0.2, th, 5),
          new THREE.MeshStandardMaterial({ color: t % 3 === 0 ? '#4b8a3c' : '#39702f', roughness: 1 })
        );
        crown.position.set(tx0, th / 2 + 0.06, tz0);
        cityGroup.add(crown);
      }
      // ещё одна площадь-сквер в другом секторе
      const sqAng = parkAngle + Math.PI * (0.6 + rand() * 0.6);
      propGroup.add(quad(city.x + Math.cos(sqAng) * half * 0.5, city.y + Math.sin(sqAng) * half * 0.5,
        cell * 1.3, cell * 1.3, 0.05, '#b3a98c'));
      // ориентир: ратуша/башня в центре — видно с высоты
      landmark(ci % 4, city, cell);
    }

    // улицы одним мешем
    const streetMat = new THREE.MeshStandardMaterial({ color: '#4b5058', roughness: 0.95 });
    const geos = [];
    for (const s of streetPts) {
      const len = Math.hypot(s.x2 - s.x, s.z2 - s.z);
      if (len < 0.05) continue;
      // улицы не ныряют в воду — через реку идёт дорога-мост, а не улица
      if (Wd.riverDist(world, (s.x + s.x2) / 2, (s.z + s.z2) / 2) < 3.2) continue;
      if (Wd.lakeFactor(world, (s.x + s.x2) / 2, (s.z + s.z2) / 2) > 0.02) continue;
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
      const ROOF_COLORS = [
        ['#b05a41', '#a04e38', '#c47a5d', '#8f6a52'],   // жилые: терракота
        ['#7d8790', '#6b7680', '#98a2a8'],              // склады/магазины: сланец
        ['#5f7488', '#71889c', '#4f6377'],              // высотки: холодный металл
        ['#8a7a5f', '#9c8c6f', '#776a53'],              // хозпостройки
        ['#7d848a', '#6e767c', '#8b9298'],              // цеха
        ['#9aa2a7', '#889196', '#a7aeb2'],              // склады
      ];
      const rc = ROOF_COLORS[ti % ROOF_COLORS.length];
      const roofMat = new THREE.MeshStandardMaterial({ color: rc[ti % rc.length], roughness: 1 });
      const roofIm = new THREE.InstancedMesh(box, roofMat, list.length);
      let roofColors = null;
      for (let i = 0; i < list.length; i++) {
        const b = list[i];
        dummy.position.set(b.x, b.h + 0.14, b.z);
        dummy.rotation.set(0, b.rot, 0);
        dummy.scale.set(b.w * 1.05, 0.16, b.d * 1.05);
        dummy.updateMatrix();
        roofIm.setMatrixAt(i, dummy.matrix);
        if (!roofColors) roofColors = new THREE.Color();
        roofColors.set(rc[i % rc.length]);
        if (roofIm.setColorAt) roofIm.setColorAt(i, roofColors);
      }
      if (roofIm.instanceColor) roofIm.instanceColor.needsUpdate = true;
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

  function isRailFar(q) { return !!(C.roadTypes[q] && C.roadTypes[q].rail); }

  function roadSamples(road, state) {
    const c = U.curve(road);
    const n = Math.max(56, Math.min(180, Math.round(road.totalKm * 1.2)));
    const raw = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const p = U.curvePoint(c, t);
      const river = Wd.riverDist(world, p.x, p.y);
      const lake = Wd.lakeFactor(world, p.x, p.y) > 0.02;
      const bridge = river < 3.2 || lake;
      // полотно идёт ПО РЕЛЬЕФУ: иначе холм протыкает дорогу и она «уходит в почву»
      const ground = meshHeight(p.x, p.y, state);
      raw.push({ x: p.x, z: p.y, t, bridge, ground });
    }
    // сглаживаем профиль, чтобы лента не дёргалась на каждой неровности
    const smooth = raw.map((p, i) => {
      let sum = 0, k = 0;
      for (let j = i - 3; j <= i + 3; j++) {
        if (j < 0 || j >= raw.length) continue;
        sum += raw[j].ground; k++;
      }
      return sum / Math.max(1, k);
    });
    return raw.map((p, i) => {
      const deck = smooth[i] + 0.09;
      const y = p.bridge ? Math.max(BRIDGE_Y, deck) : Math.max(0.05, deck);
      // жёсткая страховка: полотно всегда выше той поверхности, что нарисована под ним
      return { x: p.x, z: p.z, t: p.t, bridge: p.bridge, y: Math.max(y, p.ground + 0.07) };
    });
  }

  const railMat = new THREE.MeshStandardMaterial({ color: '#c9ced4', roughness: 0.35, metalness: 0.8 });
  const sleeperMat = new THREE.MeshStandardMaterial({ color: '#4a3a2a', roughness: 1 });
  let sleeperGeo = null;

  function addRails(seg, width) {
    if (!sleeperGeo) sleeperGeo = new THREE.BoxGeometry(1, 1, 1);
    for (const side of [-1, 1]) {
      const pts = [];
      for (let i = 0; i < seg.length; i++) {
        const p = seg[i];
        const a = seg[Math.max(0, i - 1)], b = seg[Math.min(seg.length - 1, i + 1)];
        let tx = b.x - a.x, tz = b.z - a.z;
        const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
        const off = side * width * 0.22;
        pts.push({ x: p.x - tz * off, z: p.z + tx * off, y: (p.y || 0.03) + 0.012 });
      }
      const g = ribbon(pts, 0.07, { vScale: 1 });
      roadGroup.add(new THREE.Mesh(g, railMat));
    }
    // шпалы
    const step = Math.max(1, Math.floor(seg.length / 40));
    const count = Math.ceil(seg.length / step);
    const im = new THREE.InstancedMesh(sleeperGeo, sleeperMat, count);
    const dummy = new THREE.Object3D();
    let k = 0;
    for (let i = 0; i < seg.length; i += step) {
      const p = seg[i];
      const a = seg[Math.max(0, i - 1)], b = seg[Math.min(seg.length - 1, i + 1)];
      let tx = b.x - a.x, tz = b.z - a.z;
      const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
      dummy.position.set(p.x, (p.y || 0.03) + 0.008, p.z);
      dummy.rotation.set(0, Math.atan2(tx, tz), 0);
      dummy.scale.set(width * 0.9, 0.02, 0.12);
      dummy.updateMatrix();
      im.setMatrixAt(k++, dummy.matrix);
    }
    im.count = k;
    im.frustumCulled = false;
    roadGroup.add(im);
  }

  function rebuildRoads(state) {
    roadGroup.clear();
    samples.clear();
    for (const road of state.roads) {
      if (!road.open && !road.building) continue;
      const pts = roadSamples(road, state);
      const total = pts.length;
      const builtFrac = road.building ? U.clamp(road.builtKm / Math.max(road.totalKm, 0.001), 0, 1) : 1;
      // у строящейся дороги виден уже готовый кусок (минимум два сэмпла), а не пустота
      const use = Math.max(2, Math.round(total * builtFrac));
      const q = road.quality;
      const width = ROAD_W[q] * roadFarMul;
      const seg = pts.slice(0, use);
      // ровная лента: поднимаем только на мостах
      const isRail = !!C.roadTypes[q].rail;
      const g = ribbon(seg, width, { vScale: 0.35 });
      const under = ribbon(seg, width + 0.28, { vScale: 0.35 });
      // подложка чуть ниже полотна, иначе z-fighting и «пунктирная» дорога
      const underPos = under.attributes.position;
      for (let i = 0; i < underPos.count; i++) underPos.setY(i, underPos.getY(i) - 0.02);
      underPos.needsUpdate = true;
      roadGroup.add(new THREE.Mesh(under, new THREE.MeshStandardMaterial({ color: '#26271f', roughness: 1 })));
      const mat = new THREE.MeshStandardMaterial({
        map: isRail ? TR.Content.texture(100 + (road.id % 50)) : roadTexture(road.building ? 1 : q),
        roughness: 0.9, metalness: isRail ? 0.35 : 0.02,
        color: road.building ? '#d9bd86' : (isRail ? '#6b6258' : '#ffffff'),
      });
      const mesh = new THREE.Mesh(g, mat);
      mesh.receiveShadow = false;
      roadGroup.add(mesh);
      if (isRail) addRails(seg, width);

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
    const curve = U.curve(road);
    const p = U.curvePoint(curve, f.t);
    const ang = U.curveAngle(curve, f.t);
    const side = f.side === -1 ? -1 : 1;
    const halfW = (ROAD_W[road.quality] || 0.7) / 2;

    const g = new THREE.Group();
    g.position.set(p.x, 0.03, p.y);
    g.rotation.y = -ang + (side < 0 ? Math.PI : 0);

    const flat = (w, d, x, z, color, y) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color, roughness: 1 }));
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, y === undefined ? 0.02 : y, z);
      return m;
    };

    // заезд с дороги на площадку
    const drive = flat(0.62, Math.max(0.6, 1.15 - halfW), 0, (halfW + 1.15) / 2, '#4b4741', 0.028);
    g.add(drive);

    // парковка с разметкой
    const apron = flat(1.75, 1.05, 0, 1.75, '#4a4f57', 0.024);
    g.add(apron);
    const lineMat = new THREE.MeshBasicMaterial({ color: '#d8d4c6' });
    for (let i = -1; i <= 1; i++) {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.55), lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(i * 0.5, 0.03, 1.55);
      g.add(line);
    }

    // сама постройка — одна из 500 процедурных моделей
    const modelIndex = (f.id * 37 + (def.cat === 'service' ? 40 : 0)) % TR.Content.MODEL_COUNT;
    const kindIndex = { fuel: 4, cafe: 3, motel: 5, shop: 6, service: 7, trees: 9, busstop: 9, square: 9 }[def.cat] ?? null;
    const idx = def.key === 'fuel' ? 4 : def.key === 'cafe' ? 3 : def.key === 'hotel' || def.key === 'motel' ? 5
      : def.key === 'shop' ? 6 : def.key === 'service' ? 7 : modelIndex;
    const building = TR.Content.build(idx, 0.2);
    building.position.set(0, 0.02, 2.75);
    building.rotation.y = (f.id % 3) * 0.12;
    g.add(building);

    // Детали по типу бизнеса: навесы, колонки, трубы, силосы, ворота.
    // Без них все объекты выглядели одинаковыми коробками.
    const bx = (w, h, d, x, y, z, color, rough) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color, roughness: rough === undefined ? 0.9 : rough, metalness: 0.12 }));
      m.position.set(x, y, z);
      return m;
    };
    const cyl = (r, h, x, y, z, color) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 10),
        new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.35 }));
      m.position.set(x, y, z);
      return m;
    };
    if (def.key === 'fuel') {
      g.add(bx(2.3, 0.09, 1.6, 0, 1.15, 2.7, '#eee9dc'));           // навес
      for (const sx of [-1.0, 1.0]) g.add(bx(0.07, 1.15, 0.07, sx, 0.57, 2.7, '#cfd3d6', 0.5));
      for (const px of [-0.55, 0.55]) {
        g.add(bx(0.16, 0.55, 0.16, px, 0.3, 2.7, '#d64b3f', 0.5));   // колонки
        g.add(bx(0.05, 0.3, 0.05, px + 0.14, 0.62, 2.7, '#3a3f45'));
      }
    } else if (def.key === 'cafe') {
      g.add(bx(1.5, 0.05, 0.9, 0, 0.06, 3.6, '#a9784f'));            // терраса
      for (const zx of [-0.5, 0.5]) {
        g.add(cyl(0.05, 0.9, zx, 0.45, 3.9, '#7d5a38'));
        g.add(cyl(0.5, 0.06, zx, 0.95, 3.9, '#d9734a'));             // зонтики
      }
    } else if (def.key === 'shop') {
      g.add(bx(1.7, 0.05, 0.55, 0, 0.9, 2.05, '#cfe0ea'));           // козырёк
      g.add(bx(0.05, 0.9, 0.05, -0.78, 0.45, 2.05, '#8d949a'));
      g.add(bx(0.05, 0.9, 0.05, 0.78, 0.45, 2.05, '#8d949a'));
    } else if (def.key === 'workshop') {
      g.add(cyl(0.13, 2.0, -0.75, 1.0, 3.2, '#8a8f93'));             // дымовая труба
      g.add(bx(0.9, 0.7, 0.5, 0.45, 0.35, 3.3, '#b98d5b'));          // ящики у цеха
      g.add(bx(0.05, 0.55, 0.05, -0.75, 2.2, 3.2, '#c9502f'));       // огонёк на трубе
    } else if (def.key === 'silo') {
      for (const sx of [-0.55, 0, 0.55]) {
        g.add(cyl(0.28, 1.5, sx, 0.75, 3.3, '#c9c2ac'));             // силосы
        const cap = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.35, 10),
          new THREE.MeshStandardMaterial({ color: '#9aa0a4', roughness: 0.6 }));
        cap.position.set(sx, 1.68, 3.3);
        g.add(cap);
      }
    } else if (def.key === 'warehouse') {
      g.add(bx(1.6, 0.4, 0.06, 0, 0.2, 2.05, '#7f8a92'));            // ворота
      for (const sx of [-0.5, 0.5]) g.add(bx(0.5, 0.02, 0.02, sx, 0.35, 2.02, '#d8dde0'));
      g.add(bx(0.25, 0.25, 0.25, 1.0, 0.13, 3.4, '#b08b5a'));        // паллеты
    } else if (def.key === 'motel' || def.key === 'camp') {
      for (let i = -1; i <= 1; i++) g.add(bx(0.6, 0.05, 0.4, i * 0.7, 0.9 + (i + 1) * 0.05, 2.3, '#c9a86a'));
    }

    // --- детализация моделей: у каждого бизнеса свой силуэт ---
    const glass = new THREE.MeshStandardMaterial({ color: '#9fc3d8', roughness: 0.25, metalness: 0.5 });
    if (def.key === 'fuel') {
      // пилон-стела с ценами (как у настоящих АЗС)
      g.add(bx(0.06, 1.9, 0.06, -1.45, 0.95, 1.9, '#8d949a'));
      const pylon = bx(0.62, 0.75, 0.09, -1.45, 2.05, 1.9, '#f4f1e6', 0.6);
      g.add(pylon);
      g.add(bx(0.5, 0.12, 0.1, -1.45, 2.28, 1.9, '#d64b3f', 0.5));
      g.add(bx(0.5, 0.1, 0.1, -1.45, 2.05, 1.9, '#3f6fa8', 0.5));
      // магазин при АЗС и мусорные баки
      g.add(bx(0.7, 0.42, 0.5, 1.1, 0.21, 3.5, '#e8e2d2'));
      g.add(bx(0.7, 0.08, 0.56, 1.1, 0.46, 3.5, '#c9502f'));
      for (const mx of [-1.3, -1.05]) g.add(cyl(0.11, 0.28, mx, 0.14, 3.55, '#2f6b3f'));
      // бордюры площадки
      for (const zz of [1.2, 2.3]) g.add(bx(2.1, 0.06, 0.06, 0, 0.03, zz, '#cfc9b8'));
    } else if (def.key === 'cafe') {
      g.add(bx(1.15, 0.5, 0.08, 0, 0.4, 2.02, '#8a5f3c'));      // панорамное окно
      g.add(bx(1.3, 0.08, 0.28, 0, 0.82, 1.98, '#d9734a'));     // маркиза
      g.add(cyl(0.09, 0.55, 0.95, 0.28, 1.75, '#6a6f74'));      // вытяжка
      for (const tx of [-0.55, 0.15]) {                          // столики
        g.add(cyl(0.035, 0.32, tx, 0.16, 3.55, '#5a5f63'));
        g.add(cyl(0.16, 0.04, tx, 0.33, 3.55, '#e9e2d2'));
      }
    } else if (def.key === 'hotel' || def.key === 'motel') {
      for (let fy = 0; fy < 3; fy++) {
        for (let wx = -1; wx <= 1; wx++) {
          g.add(bx(0.22, 0.16, 0.05, wx * 0.36, 0.35 + fy * 0.28, 2.02, '#3a4a55', 0.4));
        }
        g.add(bx(1.25, 0.03, 0.14, 0, 0.26 + fy * 0.28, 1.94, '#cfc6b2'));
      }
      g.add(bx(0.9, 0.07, 0.4, 0, 0.98, 1.9, '#e9e2d2'));        // козырёк входа
      const pool = flat(0.9, 0.5, 1.05, 3.4, '#4fa8c8', 0.045);
      g.add(pool);
      g.add(cyl(0.05, 0.7, -1.2, 0.35, 2.0, '#b9b2a2'));          // флагшток
    } else if (def.key === 'shop') {
      g.add(bx(1.4, 0.45, 0.06, 0, 0.35, 2.04, '#f0e6c8'));       // витрина
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.36, 0.4),
        new THREE.MeshBasicMaterial({ color: '#ffe9a8' }));
      glow.position.set(0, 0.35, 2.08);
      g.add(glow);
      for (const tx of [-1.15, -0.95]) g.add(bx(0.16, 0.14, 0.22, tx, 0.07, 2.6, '#c9c3b4')); // тележки
    } else if (def.key === 'workshop') {
      // пилообразная крыша цеха + ворота + труба с дымом
      for (let k = 0; k < 3; k++) {
        const plank = bx(0.62, 0.05, 0.75, -0.7 + k * 0.7, 0.72, 3.0, '#9aa3a8');
        plank.rotation.z = 0.5;
        g.add(plank);
      }
      g.add(bx(1.0, 0.5, 0.06, 0, 0.25, 2.02, '#8f979c'));        // рольставни
      for (let k = 0; k < 4; k++) g.add(bx(0.96, 0.03, 0.02, 0, 0.08 + k * 0.11, 2.0, '#c8ccd0'));
      for (const tx of [1.05, 1.05]) g.add(cyl(0.09, 0.7, tx, 0.35, 3.55, '#a7adb2'));
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.34, 8, 6),
        new THREE.MeshBasicMaterial({ color: '#eceae4', transparent: true, opacity: 0.28 }));
      puff.position.set(-0.75, 2.3, 3.2);
      g.add(puff);
    } else if (def.key === 'warehouse') {
      for (let k = 0; k < 3; k++) g.add(bx(0.42, 0.42, 0.05, -0.55 + k * 0.55, 0.21, 2.02, '#8b949b'));
      g.add(bx(1.75, 0.06, 0.5, 0, 0.62, 1.95, '#b6bcc1'));       // навес над доками
      g.add(bx(0.3, 0.22, 0.42, 1.15, 0.11, 3.3, '#d8b64a'));     // погрузчик
      for (const pz of [3.0, 3.35]) g.add(bx(0.5, 0.3, 0.3, -1.05, 0.15, pz, '#c9a06a'));
    } else if (def.key === 'silo') {
      const belt = bx(0.9, 0.16, 0.2, 0.2, 1.1, 3.05, '#b6bcc1');
      belt.rotation.z = -0.35;
      g.add(belt);
      g.add(bx(0.5, 0.9, 0.5, -1.1, 0.45, 3.2, '#c9c2ac'));       // нория
    } else if (def.key === 'charge') {
      for (const sx of [-0.45, 0.45]) {
        g.add(bx(0.16, 0.75, 0.14, sx, 0.37, 2.7, '#e8eef2', 0.5));
        g.add(bx(0.1, 0.16, 0.02, sx, 0.6, 2.62, '#3ec27a', 0.4));  // индикатор
      }
      g.add(bx(2.2, 0.05, 1.5, 0, 1.16, 2.7, '#31506b'));           // панель на навесе
      for (let k = 0; k < 4; k++) g.add(bx(0.44, 0.02, 0.66, -0.66 + k * 0.44, 1.2, 2.7, '#5b8fc4'));
    } else if (def.key === 'wash') {
      for (const sx of [-0.65, 0.65]) g.add(bx(0.1, 1.05, 0.1, sx, 0.52, 2.6, '#9fb0bd'));
      g.add(bx(1.5, 0.1, 0.12, 0, 1.03, 2.6, '#9fb0bd'));
      for (const sx of [-0.58, 0.58]) g.add(cyl(0.1, 0.8, sx, 0.4, 2.6, '#7fa8c9'));
      g.add(flat(1.2, 0.6, 0, 2.75, '#3f6a80', 0.05));
    } else if (def.key === 'repair' || def.key === 'tire') {
      g.add(bx(0.9, 0.12, 0.4, 0, 0.3, 2.35, '#d8b64a'));         // подъёмник
      for (const sx of [-0.7, 0.7]) g.add(bx(0.08, 0.3, 0.4, sx, 0.15, 2.35, '#8b949b'));
      for (let k = 0; k < 3; k++) g.add(cyl(0.17, 0.1, 1.15, 0.06 + k * 0.1, 3.35, '#2c2f33')); // покрышки
      g.add(bx(0.7, 0.5, 0.3, -1.05, 0.25, 3.35, '#a4553c'));      // верстак
    }

    // вывеска на стойке у заезда
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.45),
      new THREE.MeshBasicMaterial({ map: signTexture(facilityLabel(def), '#12181d', '#ffd166'), transparent: true })
    );
    sign.position.set(0.95, 0.62, 1.25);
    sign.rotation.y = -0.5;
    g.add(sign);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.6, 4), new THREE.MeshStandardMaterial({ color: '#7d7a70' }));
    pole.position.set(0.95, 0.3, 1.25);
    g.add(pole);

    // флажок/маячок — оживляет объект одной из 500 анимаций
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.18), new THREE.MeshStandardMaterial({
      color: def.color || '#e0b25a', side: THREE.DoubleSide, roughness: 0.8,
    }));
    flag.position.set(-0.95, 0.62, 1.15);
    flag.userData.anim = TR.Content.animDef(f.id * 11 + 3);
    flag.userData.animBase = { y: flag.position.y, ry: 0, sx: 1 };
    g.add(flag);

    g.userData.def = def;
    g.userData.flag = flag;
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
    if (kind === 'train') {
      const boxes = [
        // локомотив
        { x: 0, y: 0.075, z: 0.2, w: 0.07, h: 0.1, d: 0.16, color: '#a33c30' },
        { x: 0, y: 0.15, z: 0.2, w: 0.062, h: 0.05, d: 0.14, color: '#2f3944' },
        { x: 0, y: 0.06, z: 0.29, w: 0.05, h: 0.03, d: 0.012, color: lamp },
      ];
      // вагоны
      for (let i = 0; i < 2; i++) {
        const z = -0.06 - i * 0.24;
        boxes.push({ x: 0, y: 0.08, z, w: 0.066, h: 0.085, d: 0.2, color: '#d9d5c8' });
        boxes.push({ x: 0, y: 0.125, z, w: 0.06, h: 0.02, d: 0.19, color: '#6b7c8c' });
        for (let w = 0; w < 4; w++) {
          boxes.push({ x: 0, y: 0.085, z: z - 0.07 + w * 0.05, w: 0.07, h: 0.03, d: 0.022, color: glass });
        }
      }
      return mergedBoxes(boxes);
    }
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
    const kinds = ['car', 'truck', 'bus', 'ev', 'train'];
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
      const off = v.kind === 'train' ? 0 : side * (smp.half || 0.31) * 0.48;
      // высота: линейно между точками моста/полотна
      const nPts = smp.pts.length - 1;
      const fi = U.clamp(tw, 0, 1) * nPts;
      const i0 = Math.max(0, Math.min(nPts, Math.floor(fi)));
      const i1 = Math.min(nPts, i0 + 1);
      const fr = fi - i0;
      const yA = (smp.pts[i0] && smp.pts[i0].y) || 0.03;
      const yB = (smp.pts[i1] && smp.pts[i1].y) || yA;
      const py = yA + (yB - yA) * fr;
      const slot = vehicleSlots.get(v.kind === 'train' ? 'train' : (v.kind === 'truck' || v.kind === 'bus' || v.kind === 'ev' ? v.kind : 'car'));
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

  // Диагностика рельефа/дорог (используется при отладке в браузере)
  R.debugRoads = function (state) {
    const out = { meshes: roadGroup.children.length, roads: state.roads.length, samples: [], ranges: [] };
    const live = state.roads.filter((r) => (r.open || r.building) && r.builtKm > 0);
    for (const r of live.slice(0, 2)) {
      const pts = roadSamples(r, state);
      const mid = pts[Math.floor(pts.length / 2)];
      out.samples.push({
        id: r.id, q: r.quality, n: pts.length,
        midY: +mid.y.toFixed(2),
        terrainNow: +terrainHeight(mid.x, mid.z, state).toFixed(2),
        baseNow: +baseHeight(mid.x, mid.z).toFixed(2),
      });
    }
    let mn = Infinity, mx = -Infinity;
    roadGroup.traverse((o) => {
      if (!o.isMesh || !o.geometry) return;
      o.geometry.computeBoundingBox();
      const bb = o.geometry.boundingBox;
      mn = Math.min(mn, bb.min.y); mx = Math.max(mx, bb.max.y);
    });
    out.roadY = [mn === Infinity ? null : +mn.toFixed(2), mx === -Infinity ? null : +mx.toFixed(2)];
    out.world = { hills: (world && world.hills ? world.hills.length : -1), noise: world && typeof world.noise };
    const probe = state.roads[0] ? U.curvePoint(U.curve(state.roads[0]), 0.5) : { x: 300, y: 300 };
    const probes = [0, 1, 2, 3].map((k) => {
      const x = probe.x + k * 7, z = probe.y + k * 7;
      const bh = baseHeight(x, z), m = flatMask(x, z, state), th = terrainHeight(x, z, state);
      return { x: +x.toFixed(1), base: isNaN(bh) ? 'NaN' : +bh.toFixed(2), mask: isNaN(m) ? 'NaN' : +m.toFixed(2), th: isNaN(th) ? 'NaN' : +th.toFixed(2) };
    });
    out.probes = probes;
    let nanPositions = 0, totalPositions = 0;
    roadGroup.traverse((o) => {
      if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
      const arr = o.geometry.attributes.position.array;
      totalPositions += arr.length / 3;
      for (let i = 0; i < arr.length; i++) if (isNaN(arr[i])) nanPositions++;
    });
    // худшее «полотно ниже земли» по всем дорогам
    let worst = 0, worstRoad = null;
    for (const r of state.roads) {
      if (!(r.open || r.building) || r.builtKm <= 0) continue;
      for (const p of roadSamples(r, state)) {
        const d = p.ground - p.y;
        if (d > worst) { worst = d; worstRoad = r.id; }
      }
    }
    out.worstSink = +worst.toFixed(3);
    out.worstRoad = worstRoad;
    out.nanPositions = nanPositions;
    out.totalPositions = totalPositions;
    out.meshInfo = [];
    roadGroup.children.forEach((o, i) => {
      const g = o.geometry;
      if (!g || !g.attributes || !g.attributes.position) { out.meshInfo.push({ i, type: o.type, noGeo: true }); return; }
      const arr = g.attributes.position.array;
      let nan = 0;
      for (let k = 0; k < arr.length; k++) if (isNaN(arr[k])) nan++;
      out.meshInfo.push({
        i, nan, verts: arr.length / 3,
        color: o.material && o.material.color ? '#' + o.material.color.getHexString() : null,
        y0: isNaN(arr[1]) ? 'NaN' : +arr[1].toFixed(2),
        x0: isNaN(arr[0]) ? 'NaN' : +arr[0].toFixed(2),
      });
    });
    return out;
  };

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
    // прогресс стройки меняется каждый тик — полотно должно «расти» на глазах
    let buildSig = 0;
    for (const r of s.roads) if (r.building) buildSig += 1 + Math.floor(r.builtKm * 2);
    if (buildSig !== lastBuildSig) {
      lastBuildSig = buildSig;
      rebuildRoads(s);
    }
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
    // дальний план: дорога не тоньше ~2.4 экранных пикселя
    const target = U.clamp(2.4 / Math.max(0.05, ppkNow * 0.74), 1, 9);
    roadFarMul = target;
    if (!roadFarPrev || Math.abs(target / roadFarPrev) > 1.22) {
      roadFarPrev = target;
      rebuildRoads(s);
    }

    updateFloats(s, dt);
    // флажки у объектов: 500 анимаций из контент-пака
    if (TR.Content) {
      for (const m of facilityMeshes.values()) {
        const flag = m.userData.flag;
        if (flag && flag.userData.anim) {
          try {
            flag.userData.base = flag.userData.animBase;
            TR.Content.animate(flag, flag.userData.anim, clock.t);
          } catch (e) { flag.userData.anim = null; }
        }
      }
    }
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
