// Трёхмерный склад: сцена, свет, статичные стеллажи, риги рабочих, две камеры.
window.WC = window.WC || {};

WC.world = (function () {
  'use strict';

  var THREE_NS = null;
  var renderer = null;
  var scene = null;
  var camera = null;
  var perspCamera = null;
  var canvas = null;
  var meshes = null;
  var engine = null;

  var crewViews = new Map();
  var boxViews = new Map();
  var slotMarkers = new Map();
  var lamps = [];
  var halo = null;
  var clock = 0;

  var view = {
    mode: 'third',
    yaw: 0,
    pitch: 0.28,
    distance: 1,
    focusId: null,
    shake: 0,
    zoom: 1,
  };

  var state = {
    ready: false,
    frame: 0,
    target: { x: 0, y: 0, z: 0 },
    cameraPos: null,
    lookAt: null,
    drawCalls: 0,
    tris: 0,
  };

  function init(canvasEl, engineRef) {
    THREE_NS = window.THREE;
    if (!THREE_NS) throw new Error('Three.js не загрузился (shooter/three.min.js)');
    if (!engineRef) throw new Error('Нет экземпляра RatCore для мешей');
    engine = engineRef;
    canvas = canvasEl;
    meshes = WC.meshes;

    // Телефон: мягче сглаживание и меньше пикселей — важнее стабильные 60 кадров,
    // чем идеальная картинка. Десктоп получает полное качество.
    var lowPower = Boolean(WC.layout && WC.layout.state.device === 'phone');
    renderer = new THREE_NS.WebGLRenderer({ canvas: canvas, antialias: !lowPower, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.75 : 2));
    renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE_NS.PCFSoftShadowMap;
    renderer.setClearColor(0x0a0d0c, 1);
    if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE_NS.SRGBColorSpace;
    renderer.toneMapping = THREE_NS.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    scene = new THREE_NS.Scene();
    scene.fog = new THREE_NS.Fog(0x0a0d0c, 26, 54);

    camera = new THREE_NS.PerspectiveCamera(55, aspect(), 0.1, 140);
    perspCamera = camera;
    camera.position.set(0, 12, 16);
    state.cameraPos = camera.position.clone();
    state.lookAt = new THREE_NS.Vector3(0, 1, 0);

    addLights();
    buildWarehouse();
    buildHalo();
    resize();
    window.addEventListener('resize', resize);
    attachOrbit();
    state.ready = true;
    return state;
  }

  // Круг-подсветка под выбранным рабочим: мягкое золотое пятно + пульс.
  function buildHalo() {
    var holder = meshes.mesh(engine, 'halo', null, {
      castShadow: false,
      receiveShadow: false,
      material: meshes.makeMaterial({
        color: '#e8b45a',
        emissive: '#e8b45a',
        emissiveIntensity: 0.85,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        roughness: 0.6,
      }),
    });
    holder.position.y = 0.02;
    holder.renderOrder = 2;
    scene.add(holder);
    halo = holder;
  }

  function aspect() {
    var w = canvas.clientWidth || window.innerWidth;
    var h = canvas.clientHeight || window.innerHeight;
    return Math.max(0.4, w / Math.max(1, h));
  }

  // Портрет на телефоне: по горизонтали кадр узкий, поэтому поднимаем FOV,
  // иначе рабочий и коробка обрезаются по бокам.
  function fitFov(base) {
    var a = aspect();
    if (a >= 1) return base;
    return base + (1 - a) * 26;
  }

  function resize() {
    if (!renderer || !canvas) return;
    var w = canvas.clientWidth || window.innerWidth;
    var h = canvas.clientHeight || window.innerHeight;
    if (w < 2 || h < 2) return;
    renderer.setSize(w, h, false);
    if (view.mode === 'map2d' && mapCamera) {
      fitMapCamera(w, h);
      return;
    }
    camera.aspect = Math.max(0.35, w / Math.max(1, h));
    camera.updateProjectionMatrix();
  }

  function addLights() {
    var hemi = new THREE_NS.HemisphereLight(0xd8e6f3, 0x485157, 1.05);
    scene.add(hemi);

    var sun = new THREE_NS.DirectionalLight(0xffe3b8, 1.05);
    sun.position.set(-9, 16, 9);
    sun.castShadow = true;
    var lowPower = Boolean(WC.layout && WC.layout.state.device === 'phone');
    sun.shadow.mapSize.set(lowPower ? 512 : 1024, lowPower ? 512 : 1024);
    sun.shadow.camera.left = -18;
    sun.shadow.camera.right = 18;
    sun.shadow.camera.top = 16;
    sun.shadow.camera.bottom = -16;
    sun.shadow.bias = -0.0008;
    scene.add(sun);

    var fill = new THREE_NS.DirectionalLight(0x6fa6c8, 0.32);
    fill.position.set(11, 9, -12);
    scene.add(fill);

    // Лампы над стеллажами
    var lampSpots = [[-1.6, 0], [2.2, 0], [6.0, 0], [-7, -3.4], [-7, 3.4]];
    lampSpots.forEach(function (spot, i) {
      var holder = meshes.mesh(engine, 'lamp', null, { castShadow: false, receiveShadow: false, emissive: '#ffe6b0', emissiveIntensity: 0.9, material: meshes.makeMaterial({ emissive: '#ffe6b0', emissiveIntensity: 0.85, roughness: 0.5 }) });
      holder.position.set(spot[0], 3.15, spot[1]);
      scene.add(holder);
      if (i < 3) {
        var point = new THREE_NS.PointLight(0xffd9a0, 6.5, 13, 2.1);
        point.position.set(spot[0], 2.9, spot[1]);
        scene.add(point);
        lamps.push(point);
      }
    });
  }

  function addStatic(name, x, y, z, opts) {
    opts = opts || {};
    var m = meshes.mesh(engine, name, opts.palette || null, opts);
    m.position.set(x, y, z);
    m.userData.scenePart = name;
    if (opts.rotationY) m.rotation.y = opts.rotationY;
    if (opts.rotationX) m.rotation.x = opts.rotationX;
    if (opts.rotationZ) m.rotation.z = opts.rotationZ;
    if (opts.scale) m.scale.set(opts.scale, opts.scale, opts.scale);
    scene.add(m);
    return m;
  }

  // Текстуры создаёт RatCore; мост отдаёт безопасную копию пикселей.
  // Геометрия рецептов не имеет UV, поэтому проецируем их на координаты.
  var surfaceMaterials = {};
  function surfaceMaterial(kind) {
    if (surfaceMaterials[kind]) return surfaceMaterials[kind];
    var material = meshes.makeMaterial({ roughness: .94, metalness: 0 });
    var spec = kind === 'concrete' ? ['#c0bdb5', '#747974', 4101, .34] :
      kind === 'asphalt' ? ['#aaa9a3', '#656c6b', 4102, .48] : ['#e8d8c1', '#a99476', 4103, 1.8];
    // Графика не должна мешать запуску: старый кешированный RatCore ещё
    // может не иметь exportTexture. В этом случае оставляем цветной материал.
    var build = engine.tools && engine.tools.build;
    var bridge = engine.tools && engine.tools.bridge;
    if (!build || typeof build.texGenerate !== 'function' ||
        !bridge || typeof bridge.exportTexture !== 'function' ||
        typeof THREE_NS.DataTexture !== 'function') {
      surfaceMaterials[kind] = material;
      return material;
    }
    var data, texture;
    try {
      var generated = build.texGenerate({ kind: 'noise', width: 128, height: 128,
        seed: spec[2], baseColor: spec[0], accentColor: spec[1], withNormals: false, withDamaged: false });
      var exported = generated && generated.ok && bridge.exportTexture({ texture: generated.data });
      if (!exported || !exported.ok || !exported.data || !exported.data.pixels) {
        surfaceMaterials[kind] = material;
        return material;
      }
      data = exported.data;
      texture = new THREE_NS.DataTexture(data.pixels, data.width, data.height, THREE_NS.RGBAFormat);
      texture.wrapS = THREE_NS.RepeatWrapping; texture.wrapT = THREE_NS.RepeatWrapping;
      texture.magFilter = THREE_NS.LinearFilter; texture.minFilter = THREE_NS.LinearFilter;
      if ('colorSpace' in texture) texture.colorSpace = THREE_NS.SRGBColorSpace;
      texture.needsUpdate = true;
    } catch (err) {
      surfaceMaterials[kind] = material;
      return material;
    }
    material.userData.surfaceTexture = texture;
    material.userData.textureId = data.textureId;
    material.onBeforeCompile = function (shader) {
      shader.uniforms.warehouseSurface = { value: texture };
      shader.vertexShader = 'varying vec3 warehouseSurfacePos;\n' + shader.vertexShader;
      var projection = kind === 'cardboard' ? 'transformed' : '(modelMatrix * vec4(transformed, 1.0)).xyz';
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\nwarehouseSurfacePos = ' + projection + ';');
      shader.fragmentShader = 'varying vec3 warehouseSurfacePos;\nuniform sampler2D warehouseSurface;\n' + shader.fragmentShader;
      var coords = kind === 'cardboard' ? 'warehouseSurfacePos.xy' : 'warehouseSurfacePos.xz';
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>',
        '#include <map_fragment>\nvec3 grain = texture2D(warehouseSurface, ' + coords + ' * ' + spec[3].toFixed(2) + ').rgb;\ndiffuseColor.rgb *= mix(vec3(1.0), grain * 1.65, 0.42);');
    };
    material.customProgramCacheKey = function () { return 'warehouse-surface-' + kind; };
    surfaceMaterials[kind] = material;
    return material;
  }

  function buildWarehouse() {
    // Двор под фурами: асфальт вокруг цеха
    addStatic('yard', 0, -0.24, 0, { castShadow: false, receiveShadow: false, material: surfaceMaterial('asphalt') });
    // Пол и разметка
    addStatic('floor', 0, -0.20, 0, { castShadow: false, material: surfaceMaterial('concrete') });
    // Швы бетона лежат строго над полом, а двор — ниже него.
    for (var lineZ = -6.5; lineZ <= 6.5; lineZ += 2.6) addStatic('floorSeamX', 0, 0.002, lineZ, { castShadow:false, receiveShadow:false });
    for (var lineX = -10; lineX <= 10; lineX += 2.5) addStatic('floorSeamZ', lineX, 0.006, 0, { castShadow:false, receiveShadow:false });
    [-7.8, -2.6, 2.6, 7.8].forEach(function (z) {
      addStatic('floorStripe', 0, 0.006, z, { castShadow: false, receiveShadow: false });
    });
    // Стены
    addStatic('wall', 0, 0, -8.55, { castShadow: false });
    // Южная стена с воротами на улицу: проём между -9.8 и -7.4
    var gate = streetConf().gate;
    var leftSeg = addStatic('wall', (-13 + (gate.x - gate.half)) / 2, 0, 8.55, { castShadow: false });
    leftSeg.scale.x = (gate.x - gate.half + 13) / 26;
    var rightSeg = addStatic('wall', (gate.x + gate.half + 13) / 2, 0, 8.55, { castShadow: false });
    rightSeg.scale.x = (13 - gate.x - gate.half) / 26;
    addStatic('gateFrame', gate.x - gate.half, 1.3, 8.55, { castShadow: false });
    addStatic('gateFrame', gate.x + gate.half, 1.3, 8.55, { castShadow: false });
    // Боковые стены с проёмами под доки (по 1.6 м ворот с каждой стороны)
    [-13.05, 13.05].forEach(function (x) {
      [-5.05, 5.05].forEach(function (z) {
        var seg = addStatic('wallSide', x, 0, z, { castShadow: false });
        seg.scale.z = 6.9 / 17;
      });
      [-1.6, 1.6].forEach(function (z) {
        addStatic('dockFrame', x, 1.5, z, { castShadow: false, receiveShadow: false });
      });
      addStatic('dockLamp', x, 3.15, 0, { castShadow: false, receiveShadow: false });
      addStatic('dockPlate', x + (x < 0 ? 0.7 : -0.7), 0.03, 0, { castShadow: false });
    });
    // Разметка двора под фуры
    addStatic('yardLine', -16.6, 0.01, 0, { castShadow: false, receiveShadow: false });
    addStatic('yardLine', 16.6, 0.01, 0, { castShadow: false, receiveShadow: false });

    buildStreet();
    buildToilet();
    buildHeavyZone();

    // Стойки с двух сторон, поперечины и оранжевые балки — все детали
    // построены из рецептов RatCore, высоты опор сохранены для симуляции.
    [-1.6, 2.2, 6.0].forEach(function (x) {
      [-5.7, -2.85, 0, 2.85, 5.7].forEach(function (z) {
        [-0.54, 0.54].forEach(function (dx) {
          addStatic('shelfBeam', x + dx, 0, z, { castShadow: true });
          addStatic('rackFoot', x + dx, 0.01, z, { castShadow: true });
        });
        [0.25, 1.05, 1.85].forEach(function (h) {
          addStatic('rackCrossbar', x, h, z, { castShadow: false });
        });
      });
      [0.25, 1.05, 1.85].forEach(function (h) {
        [-0.38, 0, 0.38].forEach(function (dx) {
          addStatic('shelfSlat', x + dx, h, 0, {});
        });
        [-0.56, 0.56].forEach(function (dx) {
          addStatic('shelfLip', x + dx, h + 0.02, 0, { castShadow: false });
        });
      });
    });

    // Приёмка: три паллеты
    WC_WAREHOUSE_INTAKE.forEach(function (spot, i) {
      addStatic('pallet', spot.x, 0, spot.y, {});
      addStatic('palletEdge', spot.x, 0, spot.y, { castShadow: false });
      var cone = addStatic('cone', spot.x + 1.0, 0, spot.y + (i % 2 ? 0.75 : -0.75), { castShadow: false, receiveShadow: false });
      cone.userData.marker = 'intake';
    });

    // Отгрузка
    addStatic('despatch', 10.6, 0, 0, {});
    addStatic('despatchTop', 10.6, 0, 0, { castShadow: false });
    // Место начальника смены
    addStatic('desk', -10.6, 0, 7.2, { rotationY: Math.PI * 0.5 });
    addStatic('monitor', -10.6, 0, 7.2, { rotationY: Math.PI * 0.5 });
    addStatic('screen', -10.6, 0, 7.2, { rotationY: Math.PI * 0.5, castShadow: false, material: meshes.makeMaterial({ emissive: '#5aa9e6', emissiveIntensity: 0.55, roughness: 0.4 }) });
    // Зона отдыха: лавка и кулер
    addStatic('bench', -6.2, 0, 7.35, { rotationY: 0 });
    [-7.1, -5.3].forEach(function (x) {
      addStatic('benchLeg', x, 0, 7.35, {});
    });
  }

  function streetConf() {
    var layout = (WC.worldLayout || (window.WarehouseSim && window.WarehouseSim.LAYOUT)) || {};
    return layout.street || { x0: -10.8, x1: 10.8, y0: 9, y1: 14.4, gate: { x: -8.6, half: 1.2 }, spots: [] };
  }

  function layoutConf() {
    return (window.WarehouseSim && window.WarehouseSim.LAYOUT) || {};
  }

  // Улица: тротуар, дорога, фонари, киоск, сетка. Никаких ассетов — те же
  // примитивы движка, что и у цеха.
  function buildStreet() {
    var st = streetConf();
    var midZ = (st.y0 + st.y1) / 2;
    addStatic('streetSlab', 0, 0.02, midZ + 0.4, { castShadow: false });
    addStatic('sidewalk', 0, 0.06, st.y0 + 0.45, { castShadow: false });
    addStatic('curb', 0, 0.1, st.y0 + 1.1, { castShadow: false, receiveShadow: false });
    for (var x = -9.6; x <= 9.7; x += 2.4) {
      addStatic('roadDash', x, 0.105, st.y1 - 1.6, { castShadow: false, receiveShadow: false });
    }
    [-9.6, 9.6].forEach(function (lx) {
      addStatic('lampPost', lx, 0.1, st.y0 + 0.5, { castShadow: false });
      addStatic('lampHead', lx, 3.7, st.y0 + 0.5, { castShadow: false, receiveShadow: false, material: meshes.makeMaterial({ emissive: '#f6e3b0', emissiveIntensity: 0.7, roughness: 0.5 }) });
      var light = new THREE_NS.PointLight(0xffe0a8, 0.5, 8, 2);
      light.position.set(lx, 3.5, st.y0 + 0.5);
      scene.add(light);
    });
    // Киоск: визуально и как препятствие в навигации
    var kiosk = st.kiosk || { x: 6.4, y: 10.3 };
    addStatic('kioskBody', kiosk.x, 0.08, kiosk.y, {});
    addStatic('kioskGlass', kiosk.x, 0.08, kiosk.y, { castShadow: false });
    addStatic('kioskSign', kiosk.x, 0.08, kiosk.y, { castShadow: false, receiveShadow: false });
    // Сетка по краю улицы: за неё нельзя
    for (var fx = -10.4; fx <= 10.5; fx += 2.0) {
      addStatic('fencePost', fx, 0.9, st.y1 + 0.05, { castShadow: false });
    }
    [0.45, 0.95, 1.45].forEach(function (h) {
      var bar = addStatic('fenceBar', 0, h, st.y1 + 0.05, { castShadow: false, receiveShadow: false });
      bar.scale.x = 13.4 / 1.6;
    });
    // Уединённые места прикрыты штабелями паллет
    (layoutConf().privacySpots || []).forEach(function (spot) {
      addStatic('palletStack', spot.x + 0.95, 0, spot.y + 1.15, { castShadow: true });
      addStatic('palletStack', spot.x - 1.0, 0, spot.y + 1.2, { castShadow: true });
    });
  }

  var toiletDoor = null;
  function buildToilet() {
    var room = layoutConf().toilet;
    if (!room) return;
    var front = room.y - room.d / 2;
    addStatic('toiletSide', room.x - room.w / 2, 0, room.y, {});
    addStatic('toiletSide', room.x + room.w / 2, 0, room.y, {});
    addStatic('toiletBack', room.x, 0, room.y + room.d / 2, {});
    addStatic('toiletFront', room.x - 1.1, 0, front, {});
    addStatic('toiletFront', room.x + 1.1, 0, front, {});
    addStatic('toiletFloor', room.x, 0.015, room.y, { castShadow: false });
    // Срезанная крыша открывает вид на интерьер сверху.
    addStatic('toiletBowl', room.x + 0.55, 0.04, room.y + 0.48, {});
    addStatic('toiletSeat', room.x + 0.55, 0.38, room.y + 0.48, {});
    addStatic('toiletTank', room.x + 0.55, 0.33, room.y + 0.78, {});
    addStatic('toiletSink', room.x - 0.87, 0.8, room.y + 0.35, {});
    addStatic('toiletFaucet', room.x - 0.87, 0.92, room.y + 0.49, {});
    toiletDoor = new THREE_NS.Group();
    toiletDoor.position.set(room.x - room.doorWidth / 2, 0, front - 0.04);
    var panel = meshes.mesh(engine, 'toiletDoor', null);
    panel.position.set(room.doorWidth / 2, 0, 0);
    toiletDoor.add(panel);
    var handle = meshes.mesh(engine, 'toiletHandle', null);
    handle.position.set(room.doorWidth - 0.16, 0.95, -0.06);
    toiletDoor.add(handle);
    scene.add(toiletDoor);
  }

  function updateToilet(game, dt) {
    if (!toiletDoor) return;
    var room = layoutConf().toilet;
    var nearDoor = game.api.crew.some(function (w) {
      return (w.state.state === 'toToilet' || w.state.state === 'fromToilet') &&
        Math.abs(w.state.pos.y - (room.y - room.d / 2)) < 1.1 && Math.abs(w.state.pos.x - room.x) < 1;
    });
    toiletDoor.rotation.y += ((nearDoor ? -1.25 : 0) - toiletDoor.rotation.y) * Math.min(1, dt * 6);
  }

  function buildHeavyZone() {
    var heavy = layoutConf().heavy;
    if (!heavy) return;
    addStatic('heavyPad', heavy.x, 0.02, heavy.y, { castShadow: false });
    var s1 = addStatic('heavyStripe', heavy.x, 0.055, heavy.y - heavy.d / 2 + 0.2, { castShadow: false, receiveShadow: false });
    s1.scale.z = 1;
    var s2 = addStatic('heavyStripe', heavy.x, 0.055, heavy.y + heavy.d / 2 - 0.2, { castShadow: false, receiveShadow: false });
    s2.scale.z = 1;
    addStatic('heavyPallet', heavy.pallet.x, 0.14, heavy.pallet.y, { castShadow: true });
    addStatic('palletStack', heavy.x - 1.9, 0, heavy.y - 1.1, { castShadow: true });
    addStatic('palletStack', heavy.x + 1.9, 0, heavy.y - 1.2, { castShadow: true });
  }

  // ---------------------------------------------------------------- техника
  var forkliftView = null;

  // A centred wheel pivot keeps the tyre and hub together while rotating.
  function vehicleWheel(parent, tyreName, hubName, x, y, z, width) {
    var pivot = new THREE_NS.Group();
    pivot.position.set(x, y, z);
    var tyre = meshes.mesh(engine, tyreName, null);
    tyre.rotation.x = Math.PI / 2;
    tyre.position.set(0, 0, -width / 2);
    pivot.add(tyre);
    var hub = meshes.mesh(engine, hubName, null);
    hub.rotation.x = Math.PI / 2;
    hub.position.set(0, 0, z >= 0 ? width / 2 + .003 : -width / 2 - .043);
    pivot.add(hub);
    parent.add(pivot);
    return pivot;
  }

  function makeForkliftView() {
    var group = new THREE_NS.Group();
    var wheels = [];
    function part(name, x, y, z) {
      var m = meshes.mesh(engine, name, null, { castShadow: true, receiveShadow: true });
      m.position.set(x, y, z); m.userData.vehiclePart = name;
      group.add(m); return m;
    }
    part('forkliftBody', 0, .30, 0);
    part('forkliftCounter', -.62, .30, 0);
    part('forkliftMast', .78, .20, 0);
    part('forkliftHydraulic', .70, .35, -.24);
    part('forkliftHydraulic', .70, .35, .24);
    var forks = new THREE_NS.Group();
    forks.userData.vehiclePart = 'forks'; group.add(forks);
    [-.28, .28].forEach(function (z) {
      var fork = meshes.mesh(engine, 'forkliftFork', null);
      fork.position.set(1.25, .10, z); forks.add(fork);
    });
    part('forkliftSeat', -.25, .60, 0);
    part('forkliftColumn', .29, .59, 0);
    var steering = part('forkliftWheelControl', .29, 1.02, 0);
    steering.rotation.z = -.35;
    [-.42, .42].forEach(function (z) {
      part('forkliftCage', -.65, .65, z);
      part('forkliftCage', .48, .65, z);
      part('forkliftLamp', .78, .60, z * .75);
    });
    part('forkliftRoof', -.08, 1.72, 0);
    var beacon = part('forkliftBeacon', -.60, 1.84, 0);
    beacon.material.emissive.set('#e69815');
    beacon.material.emissiveIntensity = .2;
    [[-.55, .50], [-.55, -.50], [.55, .50], [.55, -.50]].forEach(function (w) {
      wheels.push(vehicleWheel(group, 'forkliftWheel', 'forkliftHub', w[0], .28, w[1], .2));
    });
    group.userData.wheels = wheels; group.userData.beacon = beacon; group.userData.forks = forks;
    group.userData.vehicle = 'forklift';
    scene.add(group); return group;
  }

  function updateForklift(sim, dt, game) {
    var f = sim.state.forklift;
    if (!f) { if (forkliftView) forkliftView.visible = false; return; }
    if (!forkliftView) {
      forkliftView = makeForkliftView();
      forkliftView.position.set(f.x, 0, f.y);
    }
    forkliftView.visible = true;
    forkliftView.position.x = f.x;
    forkliftView.position.z = f.y;
    forkliftView.position.y = 0;
    forkliftView.rotation.y = -f.yaw;
    var wheels = forkliftView.userData.wheels || [];
    for (var i = 0; i < wheels.length; i++) wheels[i].rotation.z = -(f.wheels || 0);
    var beacon = forkliftView.userData.beacon;
    beacon.material.emissiveIntensity = f.rider ? .3 + .8 * Math.max(0, Math.sin(clock * 7)) : .08;
    var forks = forkliftView.userData.forks;
    var driver = f.rider && game.api.crew.find(function (w) { return w.id === f.rider; });
    var target = driver && driver.state.carryingId ? .22 : 0;
    forks.position.y += (target - forks.position.y) * Math.min(1, dt * 4);
  }

  var WC_WAREHOUSE_INTAKE = [
    { x: -9.4, y: -4.6 }, { x: -9.4, y: 0 }, { x: -9.4, y: 4.6 },
  ];

  // ---------------------------------------------------------------- рабочие
  function createCrewView(member, spawn) {
    var palette = member.palette;
    var root = new THREE_NS.Group();
    root.position.set(spawn.x, 0, spawn.y);
    root.userData.rig = member.id;

    // Деталь крепится к суставу: отдельный меш на каждую часть, чтобы у каждой
    // был свой цвет (движок склеивает рецепты в один цвет, поэтому не экономим).
    function part(parent, name, x, y, z) {
      var m = meshes.mesh(engine, name, palette);
      // Смещение детали из рецепта сохраняется при установке на сустав.
      m.position.x += x || 0; m.position.y += y || 0; m.position.z += z || 0;
      parent.add(m);
      return m;
    }

    var hips = new THREE_NS.Group();
    hips.position.y = 0.98;
    root.add(hips);
    part(hips, 'pelvis', 0, 0, 0);
    part(hips, 'belt', 0, 0, 0);
    part(hips, 'buckle', 0, 0, 0);
    part(hips, 'hipPad', 0.085, -0.19, 0);
    part(hips, 'hipPad', -0.085, -0.19, 0);

    var torso = new THREE_NS.Group();
    hips.add(torso);
    var torsoMesh = part(torso, 'torso', 0, 0, 0);
    var vestMesh = part(torso, 'vest', 0, 0, 0);
    part(torso, 'strap', 0, 0, 0);
    part(torso, 'strap2', 0, 0, 0);
    part(torso, 'vestReflective', 0, 0, 0);
    part(torso, 'vestBackReflective', 0, 0, 0);
    part(torso, 'pocket', 0, 0, 0);
    part(torso, 'badge', 0, 0, 0);
    part(torso, 'collar', 0, 0, 0);

    var neck = new THREE_NS.Group();
    neck.position.y = 0.40;
    torso.add(neck);
    part(neck, 'neck', 0, 0, 0);

    var head = new THREE_NS.Group();
    head.position.y = 0.085;
    neck.add(head);
    part(head, 'head', 0, 0, 0);
    part(head, 'hairBack', 0, 0, 0);
    part(head, 'ear', -0.11, 0, 0);
    part(head, 'ear', 0.11, 0, 0);
    part(head, 'nose', 0, 0, 0);
    part(head, 'mouth', 0, 0, 0);
    var eyes = [];
    [-0.048, 0.048].forEach(function (dx) {
      eyes.push(part(head, 'eye', dx, 0, 0));
      eyes.push(part(head, 'pupil', dx, 0, 0));
      part(head, 'brow', dx, 0, 0);
    });
    // Каска: приплюснутый купол, поля, козырёк и обод
    var dome = part(head, 'hardhat', 0, 0, 0);
    dome.scale.set(1.02, 0.62, 1.02);
    part(head, 'hatBrim', 0, 0, 0);
    part(head, 'hatPeak', 0, 0, 0);
    part(head, 'hatBand', 0, 0, 0);

    function makeArm(sign) {
      var shoulder = new THREE_NS.Group();
      shoulder.position.set(0.205 * sign, 0.355, 0);
      torso.add(shoulder);
      part(shoulder, 'shoulderPad', 0, 0, 0);
      var upperMesh = part(shoulder, 'upperArm', 0, 0, 0);
      var elbow = new THREE_NS.Group();
      elbow.position.y = -0.27;
      shoulder.add(elbow);
      part(elbow, 'elbowPad', 0, 0, 0);
      part(shoulder, 'sleeveCuff', 0, 0, 0);
      var foreMesh = part(elbow, 'forearm', 0, 0, 0);
      var wrist = new THREE_NS.Group();
      wrist.position.y = -0.25;
      elbow.add(wrist);
      part(wrist, 'hand', 0, 0, 0);
      part(wrist, 'gloveSeam', 0, 0, 0);
      var thumb = part(wrist, 'thumb', 0, 0, 0);
      if (sign < 0) thumb.position.x *= -1;
      return { shoulder: shoulder, elbow: elbow, wrist: wrist, upper: upperMesh, fore: foreMesh };
    }

    function makeLeg(sign) {
      var hip = new THREE_NS.Group();
      hip.position.set(0.085 * sign, -0.19, 0);
      hips.add(hip);
      var thighMesh = part(hip, 'thigh', 0, 0, 0);
      var knee = new THREE_NS.Group();
      knee.position.y = -0.38;
      hip.add(knee);
      part(knee, 'kneePad', 0, 0, 0);
      part(knee, 'kneeGuard', 0, 0, 0);
      var shinMesh = part(knee, 'shin', 0, 0, 0);
      var ankle = new THREE_NS.Group();
      ankle.position.y = -0.34;
      knee.add(ankle);
      part(ankle, 'anklePad', 0, 0, 0);
      part(ankle, 'foot', 0, 0, 0);
      part(ankle, 'sole', 0, 0, 0);
      part(ankle, 'bootLaces', 0, 0, 0);
      return { hip: hip, knee: knee, ankle: ankle, thigh: thighMesh, shin: shinMesh };
    }

    var armL = makeArm(1);
    var armR = makeArm(-1);
    var legL = makeLeg(1);
    var legR = makeLeg(-1);

    // Точка, к которой крепится несомая коробка: смещение подбирается по её
    // размеру в updateBoxes, чтобы коробка лежала на животе, а не висела в воздухе.
    var carryAnchor = new THREE_NS.Group();
    carryAnchor.position.set(0, -0.06, 0.24);
    torso.add(carryAnchor);

    scene.add(root);
    var viewState = {
      root: root, hips: hips, torso: torso, neck: neck, head: head, eyes: eyes,
      armL: armL, armR: armR, legL: legL, legR: legR,
      torsoMesh: torsoMesh, vestMesh: vestMesh,
      carryAnchor: carryAnchor, palette: palette,
      anim: { phase: 0, walk: 0, breath: 0 },
    };
    crewViews.set(member.id, viewState);
    return viewState;
  }

  function attachCrew(game) {
    game.api.crew.concat(game.api.staff || []).forEach(function (worker) {
      if (crewViews.has(worker.state.id)) return;
      createCrewView({ id: worker.state.id, palette: worker.state.palette }, worker.state.pos);
    });
    return crewViews.size;
  }

  function boxName(size) {
    return size === 'big' ? 'boxBig' : size === 'medium' ? 'boxMedium' : 'boxSmall';
  }

  // Размеры коробки берём из геометрии движка, а не из констант:
  // иначе коробка тонет в полу и в полке. Примитивы движка растут от y=0
  // вверх, поэтому низ коробки — это её локальный нуль, а не центр.
  function boxMetrics(body) {
    var bb = body.geometry.boundingBox;
    if (!bb) { body.geometry.computeBoundingBox(); bb = body.geometry.boundingBox; }
    return {
      height: Math.max(0.1, bb.max.y - bb.min.y),
      halfD: Math.max(0.05, (bb.max.z - bb.min.z) / 2),
      halfW: Math.max(0.05, (bb.max.x - bb.min.x) / 2),
    };
  }

  // На какой высоте стоит пол: паллета приёмки (0.12) и площадка дока (0.09)
  // сами по себе приподняты — коробка должна лежать на них, а не тонуть.
  function floorSupport(order) {
    if (order.truckId) return 0.09;
    if (order.intake != null && !order.drops) return 0.12;
    return 0;
  }

  function makeBoxView(order) {
    if (boxViews.has(order.id)) return boxViews.get(order.id);
    var group = new THREE_NS.Group();
    var body = meshes.mesh(engine, boxName(order.size), null, { material: surfaceMaterial('cardboard') });
    group.add(body);
    var m = boxMetrics(body);
    // Скотч по верху и ярлык на торце — коробка перестаёт быть голым кубом.
    var tape = meshes.mesh(engine, 'tape', null);
    tape.position.set(0, m.height + 0.004, 0);
    tape.scale.set(0.6, 1, (m.halfD * 2) / 0.44);
    tape.castShadow = false;
    group.add(tape);
    var label = meshes.mesh(engine, 'label', null);
    label.position.set(-m.halfW * 0.32, m.height * 0.55, m.halfD + 0.007);
    label.rotation.x = Math.PI * 0.5;
    label.scale.setScalar(m.halfW / 0.26);
    label.castShadow = false;
    group.add(label);
    group.userData.orderId = order.id;
    scene.add(group);
    var entry = { group: group, body: body, height: m.height, halfD: m.halfD, halfW: m.halfW, state: null };
    boxViews.set(order.id, entry);
    return entry;
  }

  function removeBoxView(orderId) {
    var entry = boxViews.get(orderId);
    if (!entry) return;
    scene.remove(entry.group);
    entry.group.children.slice().forEach(function (child) { entry.group.remove(child); });
    boxViews.delete(orderId);
  }

  function updateBoxes(sim) {
    var seen = {};
    sim.state.orders.forEach(function (order) {
      seen[order.id] = true;
      var viewEntry = makeBoxView(order);
      var group = viewEntry.group;
      // Полка: слаты толщиной 0.05 стоят центром на высоте slot.h, значит
      // верхняя плоскость — slot.h + 0.025.
      var slotTop = 0;
      if (order.status === 'stored') {
        var slot = null;
        for (var i = 0; i < sim.state.slots.length; i++) {
          if (sim.state.slots[i].id === order.slotId) slot = sim.state.slots[i];
        }
        if (slot) slotTop = slot.h + 0.025;
      }
      if (order.status === 'stored' && slotTop) {
        // Коробка, которую уже несли, осталась ребёнком carryAnchor: без
        // возврата в сцену она «летит» следом за рабочим по всему складу.
        if (group.parent !== scene) scene.add(group);
        group.scale.setScalar(1);
        // Точка B: низ коробки — её локальный нуль, ставим прямо на полку.
        var bPose = order.dest || { x: slot.x, y: slot.y, z: slotTop };
        group.position.set(bPose.x, bPose.z != null ? bPose.z : slotTop, bPose.y);
        group.rotation.set(0, order.pose ? order.pose.yaw : 0, 0);
        group.visible = true;
      } else if (order.status === 'ruined' || order.status === 'missed' || order.status === 'loaded') {
        group.visible = false;
      } else if (order.status === 'carried' && order.carrier) {
        var carrierView = crewViews.get(order.carrier);
        if (carrierView && sim.state.forklift && sim.state.forklift.rider === order.carrier && forkliftView) {
          if (group.parent !== forkliftView) forkliftView.add(group);
          group.scale.setScalar(1);
          group.position.set(1.25, 0.30 + forkliftView.userData.forks.position.y, 0);
          group.rotation.set(0, 0, 0);
        } else if (carrierView) {
          if (group.parent !== carrierView.carryAnchor) carrierView.carryAnchor.add(group);
          // Коробка ложится на живот: низ на уровне пояса, спинка упирается
          // в корпус. Наклон повторяет наклон рабочего, поэтому «не парит».
          var hug = order.size === 'big' ? 0.74 : order.size === 'medium' ? 0.82 : 0.9;
          group.scale.setScalar(hug);
          group.position.set(0, -0.22, 0.02);
          group.rotation.set(-0.05, 0, 0);
          // Руки подстраиваются под коробку: кисти ловят её бока по высоте,
          // а не висят в воздухе перед грудью.
          carrierView.carryHug = hug;
          carrierView.carryBox = { height: viewEntry.height, halfD: viewEntry.halfD, halfW: viewEntry.halfW };
          carrierView.carryLow = -0.22;
        }
        group.visible = true;
      } else {
        if (group.parent !== scene) scene.add(group);
        group.scale.setScalar(1);
        // Точка C: высота, наклон, «на боку» — всё из физики склада
        var pose = order.pose || { x: order.x, y: order.y, z: floorSupport(order), yaw: 0, tilt: 0, lying: false };
        // Вращаем вокруг нижнего центра; компенсируем поворот так, чтобы
        // нижняя грань не пересекала опору во время наклона.
        var tilt = pose.lying ? Math.PI * 0.5 * (pose.tilt >= 0 ? 1 : -1) : (pose.tilt || 0);
        var yaw = pose.yaw || 0;
        var bottom = -Math.abs(Math.sin(tilt) * Math.sin(yaw)) * viewEntry.halfW
          - Math.abs(Math.sin(tilt) * Math.cos(yaw)) * viewEntry.halfD
          + Math.min(0, Math.cos(tilt) * viewEntry.height);
        if (pose.quaternion && Number.isFinite(pose.centerY)) {
          group.quaternion.set(pose.quaternion.x, pose.quaternion.y, pose.quaternion.z, pose.quaternion.w);
          var offset = new THREE_NS.Vector3(0, -viewEntry.height / 2, 0).applyQuaternion(group.quaternion);
          group.position.set(pose.x + offset.x, pose.centerY + offset.y, pose.y + offset.z);
        } else {
          group.rotation.set(tilt, yaw, 0);
          group.position.set(pose.x, (pose.z != null ? pose.z : floorSupport(order)) - bottom, pose.y);
        }
        group.visible = true;
      }
    });
    boxViews.forEach(function (entry, id) {
      if (!seen[id]) removeBoxView(id);
    });
    updateBoxMarks(sim);
  }

  // ------------------------------------------------------- метки A / B / C
  var boxMarks = new Map();

  function makeBoxMarks(order) {
    var group = new THREE_NS.Group();
    function disc(color) {
      var m = new THREE_NS.Mesh(
        meshes.get('markA', null).geometry,
        meshes.makeMaterial({ emissive: color, emissiveIntensity: 0.75, transparent: true, opacity: 0.62, roughness: 0.5, depthWrite: false })
      );
      m.renderOrder = 3;
      group.add(m);
      return m;
    }
    var a = disc('#4fbf7a');
    var b = disc('#4f8fdb');
    var c = disc('#e8b45a');
    var dashes = [];
    for (var i = 0; i < 20; i++) {
      var d = new THREE_NS.Mesh(
        meshes.get('dash', null).geometry,
        meshes.makeMaterial({ transparent: true, opacity: 0.42, roughness: 0.6, depthWrite: false })
      );
      group.add(d);
      dashes.push(d);
    }
    scene.add(group);
    var entry = { group: group, a: a, b: b, c: c, dashes: dashes };
    boxMarks.set(order.id, entry);
    return entry;
  }

  function dashLine(list, from, to, floorY) {
    var dist = Math.hypot(to.x - from.x, to.y - from.y);
    var step = 0.6;
    var count = Math.min(list.length, Math.max(0, Math.floor(dist / step)));
    for (var i = 0; i < list.length; i++) {
      var d = list[i];
      if (i >= count) { d.visible = false; continue; }
      var t = (i + 0.5) / count;
      d.visible = true;
      d.position.set(from.x + (to.x - from.x) * t, floorY + 0.01, from.y + (to.y - from.y) * t);
      d.rotation.y = -Math.atan2(to.y - from.y, to.x - from.x);
    }
  }

  // Три точки каждой коробки: A — откуда приехала, C — где лежит сейчас,
  // B — куда поедет. Видно, что происходит с грузом даже ночью.
  function updateBoxMarks(sim) {
    var shown = 0;
    sim.state.orders.forEach(function (order) {
      var active = order.status === 'pending' || order.status === 'claimed' || order.status === 'carried';
      var entry = boxMarks.get(order.id);
      if (!active || shown >= 6) {
        if (entry) entry.group.visible = false;
        return;
      }
      shown += 1;
      if (!entry) entry = makeBoxMarks(order);
      entry.group.visible = true;
      var pose = order.pose || { x: order.x, y: order.y, z: 0 };
      var origin = order.origin || { x: pose.x, y: pose.y };
      var dest = order.dest || { x: order.x, y: order.y, z: 0 };
      var carried = order.status === 'carried';
      // Коробку несут — точка C едет вместе с ней
      entry.c.position.set(pose.x, (pose.z || 0) + 0.012, pose.y);
      entry.a.position.set(origin.x, (order.supportHeight ? 0 : 0) + 0.014, origin.y);
      entry.b.position.set(dest.x, (dest.z || 0) + 0.016, dest.y);
      entry.a.visible = !carried;
      entry.b.visible = true;
      entry.c.visible = true;
      dashLine(entry.dashes.slice(0, 10), origin, { x: pose.x, y: pose.y }, 0.02);
      dashLine(entry.dashes.slice(10), { x: pose.x, y: pose.y }, dest, 0.02);
    });
    boxMarks.forEach(function (entry, id) {
      if (!sim.state.orders.some(function (o) { return o.id === id; })) {
        scene.remove(entry.group);
        boxMarks.delete(id);
      }
    });
  }

  function updateSlotMarkers(sim) {
    var needed = {};
    sim.state.orders.forEach(function (order) {
      if (order.status === 'claimed' || order.status === 'carried') needed[order.slotId] = order.urgent ? '#e2604f' : '#e8b45a';
    });
    Object.keys(needed).forEach(function (slotId) {
      if (slotMarkers.has(slotId)) return;
      var slot = null;
      for (var i = 0; i < sim.state.slots.length; i++) if (sim.state.slots[i].id === slotId) slot = sim.state.slots[i];
      if (!slot) return;
      var marker = new THREE_NS.Mesh(
        meshes.get('cone', null).geometry,
        meshes.makeMaterial({ emissive: needed[slotId], emissiveIntensity: 0.6, transparent: true, opacity: 0.55, roughness: 0.4, depthWrite: false })
      );
      marker.scale.set(0.55, 0.55, 0.55);
      marker.position.set(slot.x - 0.85, slot.h, slot.y);
      scene.add(marker);
      slotMarkers.set(slotId, marker);
    });
    slotMarkers.forEach(function (marker, slotId) {
      if (!needed[slotId]) {
        scene.remove(marker);
        slotMarkers.delete(slotId);
      }
    });
  }

  // ---------------------------------------------------------------- анимация
  function sceneYaw(heading) {
    return Math.atan2(Math.cos(heading), Math.sin(heading));
  }

  // Пределы подвижности суставов: мышца не тянется бесконечно и не выгибается
  // в обратную сторону — как у живого человека, а не у резиновой куклы.
  var JOINT_LIMITS = {
    hips: { x: [-0.22, 0.35], z: [-0.12, 0.12] },
    torso: { x: [-0.12, 0.5], y: [-0.45, 0.45], z: [-0.2, 0.2] },
    neck: { x: [-0.45, 0.5], y: [-1.0, 1.0] },
    head: { x: [-0.4, 0.45], y: [-0.75, 0.75], z: [-0.3, 0.3] },
  };
  var LIMB_LIMITS = {
    hip: { x: [-1.2, 1.35], y: [-0.3, 0.3], z: [-0.3, 0.3] },
    knee: { x: [0, 2.1], y: [0, 0], z: [0, 0] },
    ankle: { x: [-0.45, 0.5], y: [-0.2, 0.2], z: [-0.15, 0.15] },
    shoulder: { x: [-2.3, 1.5], y: [-0.9, 0.9], z: [-1.15, 1.15] },
    elbow: { x: [-2.3, 0.05], y: [-0.1, 0.1], z: [0, 0] },
    wrist: { x: [-0.7, 0.7], y: [-0.4, 0.4], z: [-0.35, 0.35] },
  };

  function clampJoint(bone, limits) {
    if (!bone || !limits) return;
    ['x', 'y', 'z'].forEach(function (axis) {
      var range = limits[axis];
      if (!range) return;
      if (bone.rotation[axis] < range[0]) bone.rotation[axis] = range[0];
      if (bone.rotation[axis] > range[1]) bone.rotation[axis] = range[1];
    });
  }

  function clampRig(entry) {
    ['hips', 'torso', 'neck', 'head'].forEach(function (name) {
      clampJoint(entry[name], JOINT_LIMITS[name]);
    });
    [entry.legL, entry.legR].forEach(function (leg) {
      if (!leg) return;
      clampJoint(leg.hip, LIMB_LIMITS.hip);
      clampJoint(leg.knee, LIMB_LIMITS.knee);
      clampJoint(leg.ankle, LIMB_LIMITS.ankle);
    });
    [entry.armL, entry.armR].forEach(function (arm) {
      if (!arm) return;
      clampJoint(arm.shoulder, LIMB_LIMITS.shoulder);
      clampJoint(arm.elbow, LIMB_LIMITS.elbow);
      if (arm.wrist) clampJoint(arm.wrist, LIMB_LIMITS.wrist);
    });
  }

  function injuryOn(body, part) {
    var list = (body && body.injuries) || [];
    var total = 0;
    for (var i = 0; i < list.length; i++) if (list[i].part === part) total += list[i].severity;
    return Math.min(1, total);
  }

  // Двухзвенная обратная кинематика руки: по цели (dy, dz) от плеча выдаёт
  // углы плеча и локтя. Нужна, чтобы кисти лежали на коробке любого размера.
  var ARM_UPPER = 0.27, ARM_FORE = 0.25;
  function solveArm(dy, dz) {
    var d = Math.hypot(dy, dz);
    if (d < 1e-4) return { shoulder: 0, elbow: -0.4 };
    var maxD = ARM_UPPER + ARM_FORE;
    var dd = Math.min(maxD * 0.995, d);
    var base = Math.atan2(dz, -dy);
    var cosA = (ARM_UPPER * ARM_UPPER + dd * dd - ARM_FORE * ARM_FORE) / (2 * ARM_UPPER * dd);
    var A = Math.acos(Math.max(-1, Math.min(1, cosA)));
    var cosE = (ARM_UPPER * ARM_UPPER + ARM_FORE * ARM_FORE - dd * dd) / (2 * ARM_UPPER * ARM_FORE);
    var E = Math.acos(Math.max(-1, Math.min(1, cosE)));
    return { shoulder: -(base - A), elbow: -(Math.PI - E) };
  }

  function updateRagdollView(view, pose, visible) {
    if (!view.ragdollRoot) {
      var root = new THREE_NS.Group();
      var pieces = {};
      function piece(key, recipe) {
        var pivot = new THREE_NS.Group();
        var m = meshes.mesh(engine, recipe, view.palette);
        var box = m.geometry.boundingBox;
        m.position.set(0, -(box.min.y + box.max.y) / 2, 0);
        pivot.add(m); root.add(pivot); pieces[key] = pivot;
        return pivot;
      }
      piece('pelvis', 'pelvis');
      var torso = piece('torso', 'torso');
      var vest = meshes.mesh(engine, 'vest', view.palette); vest.position.set(0, -0.11, 0); torso.add(vest);
      var head = piece('head', 'head');
      var helmet = meshes.mesh(engine, 'hardhat', view.palette); helmet.position.set(0, 0.03, 0); helmet.scale.set(1.02, .62, 1.02); head.add(helmet);
      ['L','R'].forEach(function (side) {
        piece('upperArm' + side, 'upperArm');
        piece('forearm' + side, 'forearm');
        var hand = piece('hand' + side, 'hand');
        var thumb = meshes.mesh(engine, 'thumb', view.palette);
        thumb.position.set(side === 'L' ? -.05 : .05, -.015, .03); hand.add(thumb);
        piece('thigh' + side, 'thigh');
        piece('shin' + side, 'shin');
        var foot = piece('foot' + side, 'foot');
        var sole = meshes.mesh(engine, 'sole', view.palette); sole.position.set(0, -.05, 0); foot.add(sole);
      });
      scene.add(root); view.ragdollRoot = root; view.ragdollPieces = pieces;
    }
    view.ragdollRoot.visible = visible;
    Object.keys(view.ragdollPieces).forEach(function (name) {
      var p = pose[name], object = view.ragdollPieces[name];
      object.visible = !!p;
      if (!p) return;
      object.position.set(p.x, p.y, p.z);
      object.quaternion.set(p.q.x, p.q.y, p.q.z, p.q.w);
    });
  }

  function updateCrew(dt, game) {
    // Рабочие и наёмный персонал (медик, сторож) — в одном проходе рига
    var actors = game.api.crew.concat(game.api.staff || []);
    actors.forEach(function (actor) {
      var viewEntry = crewViews.get(actor.state.id);
      if (!viewEntry) return;
      var s = actor.state;
      var root = viewEntry.root;
      var body = actor.body || { injuries: [], fatigue: 0 };
      // Во время использования туалета человека не видно снаружи.
      if (s.dead) { root.visible = false; if (viewEntry.ragdollRoot) viewEntry.ragdollRoot.visible = false; return; }
      var room = layoutConf().toilet;
      var hiddenInside = room && Math.abs(s.pos.x - room.x) < room.w / 2 - 0.12 && s.pos.y > room.y - room.d / 2 + 0.12 && s.pos.y < room.y + room.d / 2;
      var visible = !s.inToilet && !hiddenInside && !s.privacy;
      if (s.ragdoll) {
        root.visible = false;
        updateRagdollView(viewEntry, s.ragdoll, visible);
        return;
      }
      if (viewEntry.ragdollRoot) viewEntry.ragdollRoot.visible = false;
      root.visible = visible;
      if (!root.visible) return;

      // Симуляция уже интерполирует движение по маршруту: повторное
      // сглаживание здесь срезало углы и проводило риг через стойку.
      root.position.x = s.pos.x;
      root.position.z = s.pos.y;
      var targetYaw = sceneYaw(s.heading);
      var delta = ((targetYaw - root.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      root.rotation.y += delta * Math.min(1, dt * 12);
      root.rotation.x = 0;

      var anim = s.anim || {};
      var walk = anim.walk || 0;
      var phase = anim.phase || 0;
      var run = anim.run || 0;
      var hurt = anim.hurt || {};
      var muscle = anim.muscle || {};
      var carrying = Boolean(s.carryingId) && !s.onForklift;
      var resting = s.state === 'rest' || s.state === 'toRest';
      var down = s.state === 'down';
      var sitting = Boolean(s.onForklift) || s.state === 'play';
      var twist = anim.torsoTwist || 0;
      var headTurn = anim.headTurn || 0;
      // Короткое моргание и индивидуальный ритм дыхания.
      var blinkPhase = (clock + s.id.length * .57) % 4.6;
      var blink = blinkPhase < .12 ? .12 : 1;
      viewEntry.eyes.forEach(function (eye) { eye.scale.y = blink; });
      var handling = s.timers && !s.onForklift ? Math.min(1, (s.timers.pick || s.timers.place || 0) * 3) : 0;

      // ---------------------------------------------------------------- ноги
      var stride = (0.34 + 0.25 * run) * walk;
      if (sitting) {
        viewEntry.legL.hip.rotation.x = -1.25;
        viewEntry.legR.hip.rotation.x = -1.25;
        viewEntry.legL.knee.rotation.x = 1.15;
        viewEntry.legR.knee.rotation.x = 1.15;
        viewEntry.legL.ankle.rotation.x = 0.25;
        viewEntry.legR.ankle.rotation.x = 0.25;
      } else {
        viewEntry.legL.hip.rotation.x = Math.sin(phase) * stride;
        viewEntry.legR.hip.rotation.x = -Math.sin(phase) * stride;
        viewEntry.legL.knee.rotation.x = Math.max(0, -Math.cos(phase)) * (0.65 + 0.30 * run) * walk;
        viewEntry.legR.knee.rotation.x = Math.max(0, Math.cos(phase)) * (0.65 + 0.30 * run) * walk;
        viewEntry.legL.ankle.rotation.x = -Math.sin(phase) * 0.18 * walk;
        viewEntry.legR.ankle.rotation.x = Math.sin(phase) * 0.18 * walk;
      }

      // ---------------------------------------------------------------- руки
      var swing = Math.sin(phase) * (0.38 + 0.22 * run) * walk;
      if (carrying) {
        var hugBox = viewEntry.carryHug == null ? 0.82 : viewEntry.carryHug;
        var boxDims = viewEntry.carryBox || { height: 0.4, halfD: 0.21 };
        var lowY = viewEntry.carryLow == null ? -0.22 : viewEntry.carryLow;
        var ik = solveArm(lowY + boxDims.height * hugBox * 0.34 - 0.355, 0.20 + boxDims.halfD * hugBox * 0.35);
        viewEntry.armL.shoulder.rotation.x = ik.shoulder;
        viewEntry.armR.shoulder.rotation.x = ik.shoulder;
        viewEntry.armL.shoulder.rotation.z = -0.13;
        viewEntry.armR.shoulder.rotation.z = 0.13;
        viewEntry.armL.elbow.rotation.x = ik.elbow;
        viewEntry.armR.elbow.rotation.x = ik.elbow;
        viewEntry.armL.wrist.rotation.x = -0.45;
        viewEntry.armR.wrist.rotation.x = -0.45;
      } else if (sitting) {
        // Руки на руле погрузчика
        viewEntry.armL.shoulder.rotation.x = -1.05;
        viewEntry.armR.shoulder.rotation.x = -1.05;
        viewEntry.armL.shoulder.rotation.z = -0.22;
        viewEntry.armR.shoulder.rotation.z = 0.22;
        viewEntry.armL.elbow.rotation.x = -0.55;
        viewEntry.armR.elbow.rotation.x = -0.55;
        viewEntry.armL.wrist.rotation.x = -0.2;
        viewEntry.armR.wrist.rotation.x = -0.2;
      } else if (resting) {
        viewEntry.armL.shoulder.rotation.x = -0.22 + Math.sin(anim.breath || 0) * 0.04;
        viewEntry.armR.shoulder.rotation.x = -0.22 + Math.sin(anim.breath || 0) * 0.04;
        viewEntry.armL.shoulder.rotation.z = -0.12;
        viewEntry.armR.shoulder.rotation.z = 0.12;
        viewEntry.armL.elbow.rotation.x = -0.35;
        viewEntry.armR.elbow.rotation.x = -0.35;
        viewEntry.armL.wrist.rotation.x = 0;
        viewEntry.armR.wrist.rotation.x = 0;
      } else {
        viewEntry.armL.wrist.rotation.x = 0;
        viewEntry.armR.wrist.rotation.x = 0;
        viewEntry.armL.shoulder.rotation.x = -swing;
        viewEntry.armR.shoulder.rotation.x = swing;
        viewEntry.armL.shoulder.rotation.z = -0.07 - 0.05 * run;
        viewEntry.armR.shoulder.rotation.z = 0.07 + 0.05 * run;
        viewEntry.armL.elbow.rotation.x = -0.18 - Math.max(0, swing) * 0.3 - 0.75 * run;
        viewEntry.armR.elbow.rotation.x = -0.18 - Math.max(0, -swing) * 0.3 - 0.75 * run;
      }

      // Наклон и работа руками во время подъёма/укладки, а не только ходьба.
      if (handling > 0 && !sitting) {
        viewEntry.armL.shoulder.rotation.x += (-1.0 - viewEntry.armL.shoulder.rotation.x) * handling;
        viewEntry.armR.shoulder.rotation.x += (-1.0 - viewEntry.armR.shoulder.rotation.x) * handling;
        viewEntry.armL.elbow.rotation.x += (-.65 - viewEntry.armL.elbow.rotation.x) * handling;
        viewEntry.armR.elbow.rotation.x += (-.65 - viewEntry.armR.elbow.rotation.x) * handling;
        viewEntry.legL.knee.rotation.x += .28 * handling;
        viewEntry.legR.knee.rotation.x += .28 * handling;
      }

      // --------------------------------------------------- корпус, шея, голова
      var targetLean = down ? 0 : (carrying ? 0.13 : 0.02) + 0.24 * handling + 0.17 * run + Math.min(0.12, (body.fatigue || 0) * 0.18);
      var bob = Math.abs(Math.sin(phase)) * 0.03 * walk * (1 + run);
      viewEntry.hips.position.y = 0.98 - (resting ? 0.16 : 0) - Math.min(0.1, (body.fatigue || 0) * 0.1) - (down ? 0.5 : 0) - .10 * handling + bob;
      viewEntry.torso.rotation.x = viewEntry.torso.rotation.x + (targetLean - viewEntry.torso.rotation.x) * Math.min(1, dt * 6);
      viewEntry.torso.rotation.y = -twist * 0.35 + (walk < .1 ? Math.sin(clock * .7 + s.id.length) * .025 : 0);
      viewEntry.hips.rotation.y = twist * 0.55;
      viewEntry.neck.rotation.y = headTurn + Math.sin((anim.breath || 0) * 0.35) * 0.05;
      viewEntry.head.rotation.x = resting ? 0.22 : (down ? 0.5 : 0.02);
      var fallTarget = s.fallMotion ? s.fallMotion.angle : (down ? 1.35 : 0);
      viewEntry.fallAngle = (viewEntry.fallAngle || 0) + (fallTarget - (viewEntry.fallAngle || 0)) * (1 - Math.exp(-dt * 12));
      root.rotation.z = viewEntry.fallAngle;
      if (down) {
        root.position.y = 0.18 * (1 - Math.min(1, Math.abs(root.rotation.z) / 1.35));
      } else {
        root.position.y += (0.0 - root.position.y) * Math.min(1, dt * 10);
        if (sitting) root.position.y = 0.62;
      }
      if (sitting) root.rotation.x = 0.04 * Math.sin(phase);

      // ---------------------------------------------------------------- травмы
      var limp = Math.max(hurt.knee || 0, hurt.ankle || 0, anim.limp || 0);
      if (limp > 0.05 && walk > 0.12 && !down && !sitting) {
        var hobble = Math.sin(phase) * 0.6 * limp;
        viewEntry.legL.hip.rotation.x -= hobble;
        viewEntry.legR.hip.rotation.x += hobble;
        viewEntry.legR.knee.rotation.x = Math.max(viewEntry.legR.knee.rotation.x, 0.5 * limp * walk);
        root.rotation.z = Math.sin(phase * 2) * 0.07 * limp * walk;
        root.position.y += Math.abs(Math.sin(phase)) * 0.035 * limp * walk;
      }
      var shoulder = hurt.shoulder || 0;
      if (shoulder > 0.12 && !carrying && !down && !sitting) {
        viewEntry.armR.shoulder.rotation.x = -0.3;
        viewEntry.armR.shoulder.rotation.z = 0.32;
        viewEntry.armR.elbow.rotation.x = -1.25;
        viewEntry.armL.shoulder.rotation.x += 0.04 * Math.sin(clock * 5) * shoulder;
      }
      var headHurt = hurt.head || 0;
      if (headHurt > 0.05 && !down) {
        viewEntry.head.rotation.x += 0.12 * headHurt;
        viewEntry.neck.rotation.y += Math.sin(clock * 0.9) * 0.05 * headHurt;
        if (headHurt > 0.3) {
          // держится за голову
          viewEntry.armR.shoulder.rotation.x = -2.15;
          viewEntry.armR.shoulder.rotation.z = 0.42;
          viewEntry.armR.elbow.rotation.x = -1.45;
        }
      }
      var backHurt = hurt.back || 0;
      if (backHurt > 0.08 && !down) {
        viewEntry.torso.rotation.x += 0.16 * backHurt;
        viewEntry.hips.position.y -= 0.05 * backHurt;
        if (!carrying) {
          // ладонь на пояснице
          viewEntry.armL.shoulder.rotation.x = 0.55;
          viewEntry.armL.shoulder.rotation.z = -0.55;
          viewEntry.armL.elbow.rotation.x = -1.05;
        }
      }
      var wristHurt = hurt.wrist || 0;
      if (wristHurt > 0.08 && !down && !carrying) {
        viewEntry.armR.shoulder.rotation.x = -0.55;
        viewEntry.armR.shoulder.rotation.z = 0.16;
        viewEntry.armR.elbow.rotation.x = -1.15;
        viewEntry.armR.wrist.rotation.x = -0.8 - Math.sin(clock * 6) * 0.1 * wristHurt;
      }
      var fear = s.safety ? s.safety.fear : 0;
      if (fear > 0.1 && !down) viewEntry.torso.rotation.x += 0.05 * fear;

      // --------------------------------------------------------------- мышцы
      // Натяжение групп мышц видно по объёму: руки, ноги, спина «надуваются»
      var armsStrain = muscle.arms || 0;
      var legsStrain = muscle.legs || 0;
      var backStrain = muscle.back || 0;
      var shouldersStrain = muscle.shoulders || 0;
      var shiver = Math.sin(clock * 9.1) * 0.006;
      [viewEntry.armL, viewEntry.armR].forEach(function (arm) {
        if (arm.upper) arm.upper.scale.set(1 + 0.16 * armsStrain, 1, 1 + 0.16 * armsStrain);
        if (arm.fore) arm.fore.scale.set(1 + 0.12 * armsStrain, 1, 1 + 0.12 * armsStrain);
        arm.shoulder.rotation.z += (arm === viewEntry.armL ? -1 : 1) * shouldersStrain * 0.04;
      });
      [viewEntry.legL, viewEntry.legR].forEach(function (leg) {
        if (leg.thigh) leg.thigh.scale.set(1 + 0.14 * legsStrain, 1, 1 + 0.14 * legsStrain);
        if (leg.shin) leg.shin.scale.set(1 + 0.12 * legsStrain, 1, 1 + 0.12 * legsStrain);
      });
      if (viewEntry.torsoMesh) {
        viewEntry.torsoMesh.scale.set(1 + 0.05 * backStrain + shiver, 1, 1 + 0.07 * backStrain);
      }

      // Жёсткий предел растяжения: суставы не выгибаются дальше анатомии
      clampRig(viewEntry);
    });
  }

  function removeView(id) {
    var entry = crewViews.get(id);
    if (!entry) return false;
    scene.remove(entry.root);
    if (entry.ragdollRoot) scene.remove(entry.ragdollRoot);
    var marker = document.getElementById('marker-' + id);
    if (marker) marker.remove();
    crewViews.delete(id);
    return true;
  }

  // ---------------------------------------------------------------- фуры
  var truckViews = new Map();

  function makeTruckView() {
    var group = new THREE_NS.Group(), wheels = [];
    group.userData.vehicle = 'truck';
    function part(name, x, y, z) {
      var m = meshes.mesh(engine, name, null, { castShadow: true, receiveShadow: true });
      m.position.set(x, y, z); m.userData.vehiclePart = name;
      group.add(m); return m;
    }
    part('truckChassis', 0, .60, 0);
    part('truckTrailer', 0, .82, 0);
    part('truckStripe', 0, 1.18, 0);
    part('truckCab', 3.45, .74, 0);
    part('truckGlass', 4.41, 1.63, 0);
    part('truckDoor', -2.67, .84, 0);
    part('truckBumper', 4.48, .56, 0);
    part('truckGrille', 4.44, .98, 0);
    [-1, 1].forEach(function (side) {
      part('truckLight', 4.47, .94, side * .79);
      part('truckMirror', 3.80, 1.67, side * 1.23);
      part('truckSideWindow', 3.35, 1.68, side * 1.162);
      part('truckHandle', 3.05, 1.35, side * 1.17);
      part('truckStep', 3.30, .61, side * 1.20);
      part('truckTailLight', -2.76, .95, side * .86);
      part('truckRail', 0, 1.55, side * 1.245);
      [-1.75, -.90, 3.05].forEach(function (x) {
        wheels.push(vehicleWheel(group, 'truckWheel', 'truckHub', x, .46, side * 1.02, .30));
      });
    });
    group.userData.wheels = wheels;
    group.userData.cargo = part('cargoStack', .9, .84, 0);
    return group;
  }

  function updateTrucks(sim, dt) {
    var trucks = (sim && sim.state && sim.state.trucks) || [];
    var alive = {};
    trucks.forEach(function (truck) {
      alive[truck.id] = true;
      var entry = truckViews.get(truck.id);
      if (!entry) {
        entry = { group: makeTruckView(), kind: truck.kind, baseX: truck.kind === 'unload' ? -15.45 : 15.45, dir: truck.kind === 'unload' ? -1 : 1 };
        entry.group.rotation.y = truck.kind === 'unload' ? Math.PI : 0;
        entry.group.position.set(entry.baseX + entry.dir * 8, 0, 0);
        scene.add(entry.group);
        truckViews.set(truck.id, entry);
      }
      var now = sim.state.time;
      var inT = Math.min(1, Math.max(0, (now - truck.arrivedAt) / 2.6));
      var easeIn = 1 - Math.pow(1 - inT, 3);
      var outT = truck.departedAt == null ? 0 : Math.min(1, Math.max(0, (now - truck.departedAt) / 2.4));
      var easeOut = outT * outT;
      var offset = entry.dir * (8 * (1 - easeIn) + 9 * easeOut);
      var nextX = entry.baseX + offset;
      var distance = nextX - entry.group.position.x;
      entry.group.userData.wheels.forEach(function (wheel) { wheel.rotation.z -= distance / .46; });
      entry.group.position.x = nextX;
      entry.group.position.y = Math.sin(inT * Math.PI * 0.5) * 0.02;
      entry.group.visible = outT < 1;
      entry.group.userData.cargo.visible = truck.done < truck.total;
      // Немного качаем подвеску при погрузке
      entry.group.position.y += Math.sin(clock * 2.1 + truck.x) * 0.004;
    });
    truckViews.forEach(function (entry, id) {
      if (alive[id]) return;
      scene.remove(entry.group);
      truckViews.delete(id);
    });
  }

  // ---------------------------------------------------------------- камера
  var mapCamera = null;

  // Ортокамера сверху: склад как чертёж. Все метки и подписи работают так же,
  // потому что project() есть у любой камеры.
  function fitMapCamera(w, h) {
    if (!mapCamera) {
      var conf = (WC.CONFIG && WC.CONFIG.camera && WC.CONFIG.camera.map) || { size: 15.5 };
      var aspect0 = Math.max(0.4, (w || 800) / Math.max(1, h || 600));
      mapCamera = new THREE_NS.OrthographicCamera(
        -conf.size * aspect0 / 2, conf.size * aspect0 / 2,
        conf.size / 2, -conf.size / 2, 0.1, 120
      );
      mapCamera.up.set(0, 0, -1);
    }
    var conf2 = (WC.CONFIG && WC.CONFIG.camera && WC.CONFIG.camera.map) || { size: 15.5 };
    var aspect = Math.max(0.4, (w || canvas.clientWidth || 800) / Math.max(1, h || canvas.clientHeight || 600));
    var halfH = Math.max(12.5, 14 / aspect) / (view.zoom || 1);
    mapCamera.left = -halfH * aspect;
    mapCamera.right = halfH * aspect;
    mapCamera.top = halfH;
    mapCamera.bottom = -halfH;
    mapCamera.updateProjectionMatrix();
    return mapCamera;
  }

  function setMode(mode) {
    var modes = ['third', 'follow', 'top', 'map2d'];
    view.mode = modes.indexOf(mode) >= 0 ? mode : 'third';
    document.body.classList.toggle('view-top', view.mode === 'top');
    document.body.classList.toggle('view-follow', view.mode === 'follow');
    document.body.classList.toggle('view-map', view.mode === 'map2d');
    if (view.mode === 'map2d') {
      fitMapCamera(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);
      camera = mapCamera;
      scene.fog = null;
      state.cameraPos.copy(camera.position);
    } else {
      camera = perspCamera;
      scene.fog = new THREE_NS.Fog(0x0a0d0c, 26, 54);
      state.cameraPos.copy(camera.position);
    }
    return view.mode;
  }

  function cycleMode() {
    var modes = ['third', 'follow', 'top', 'map2d'];
    var next = modes[(modes.indexOf(view.mode) + 1) % modes.length];
    return setMode(next);
  }

  function toggleMap2d() {
    return setMode(view.mode === 'map2d' ? 'third' : 'map2d');
  }

  function setZoom(value) {
    view.zoom = Math.max(0.6, Math.min(2.6, value));
    if (view.mode === 'map2d' && mapCamera) {
      fitMapCamera(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);
    }
    return view.zoom;
  }

  function setFocus(workerId) {
    view.focusId = workerId;
  }

  // Толчок камеры: сила 0…1.4, гаснет за доли секунды.
  function kick(amount) {
    view.shake = Math.min(1.4, view.shake + (amount || 0.5));
    return view.shake;
  }

  function attachOrbit() {
    var dragging = false;
    var lastX = 0;
    var lastY = 0;
    var pointers = new Map();
    var pinchStart = 0;
    var pinchBase = 1;

    function spread() {
      var list = [];
      pointers.forEach(function (p) { list.push(p); });
      if (list.length < 2) return 0;
      var dx = list[0].x - list[1].x;
      var dy = list[0].y - list[1].y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    canvas.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 && e.button !== 2) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        // Два пальца — щипок для приближения (телефон)
        pinchStart = spread();
        pinchBase = view.distance;
        dragging = false;
        return;
      }
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
    });

    canvas.addEventListener('pointermove', function (e) {
      if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size >= 2) {
        var now = spread();
        if (pinchStart > 12 && now > 12) {
          var ratio = now / pinchStart;
          // Пальцы врозь — ближе; вместе — дальше
          view.distance = WC.util.clamp(pinchBase / Math.max(0.4, ratio), 0.55, 2.4);
        }
        return;
      }
      if (!dragging) return;
      var dx = e.clientX - lastX;
      var dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      view.yaw -= dx * 0.006;
      view.pitch = WC.util.clamp(view.pitch + dy * 0.004, -0.15, 0.95);
    });

    function release(e) {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchStart = 0;
      if (pointers.size === 0) dragging = false;
    }
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);
    canvas.addEventListener('pointerleave', release);

    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      if (view.mode === 'map2d') {
        setZoom((view.zoom || 1) + (e.deltaY > 0 ? -0.12 : 0.12));
        return;
      }
      view.distance = WC.util.clamp(view.distance + (e.deltaY > 0 ? 0.12 : -0.12), 0.55, 2.4);
    }, { passive: false });
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  // Точка камеры внутри стеллажа, стены или за пределами цеха?
  function cameraObstructed(point) {
    var street = streetConf();
    var inside = Math.abs(point.x) <= 12.1 && Math.abs(point.z) <= 7.9;
    var outdoors = point.x >= street.x0 && point.x <= street.x1 && point.z >= 7.9 && point.z <= street.y1;
    if (!inside && !outdoors) return true;
    var room = layoutConf().toilet;
    if (room && Math.abs(point.x - room.x) < room.w / 2 + 0.15 && Math.abs(point.z - room.y) < room.d / 2 + 0.15) return true;
    if (Math.abs(point.x - street.kiosk.x) < 1.0 && Math.abs(point.z - street.kiosk.y) < 0.9) return true;
    var rackX = [-1.6, 2.2, 6.0];
    for (var i = 0; i < rackX.length; i++) {
      if (Math.abs(point.x - rackX[i]) < 0.95 && Math.abs(point.z) < 6.05) return true;
    }
    if (Math.abs(point.x - 10.6) < 1.1 && Math.abs(point.z) < 2.2) return true;
    return false;
  }

  function updateCamera(dt, game) {
    var focus = null;
    for (var i = 0; i < game.api.crew.length; i++) {
      if (game.api.crew[i].id === view.focusId) focus = game.api.crew[i];
    }
    if (!focus) focus = game.api.crew[0];

    if (view.mode === 'map2d') {
      // Вид сверху 2D: ортокамера висит над складом, поворот — пальцем/мышью
      var w = canvas.clientWidth || window.innerWidth;
      var h = canvas.clientHeight || window.innerHeight;
      var mapCam = fitMapCamera(w, h);
      var center = { x: 0, z: 1.4 };
      mapCam.position.set(center.x, 40, center.z);
      mapCam.up.set(Math.sin(view.yaw), 0, -Math.cos(view.yaw));
      mapCam.lookAt(center.x, 0, center.z);
      mapCam.updateMatrixWorld(true);
      camera = mapCam;
      if (!focus && game.api.crew[0]) focus = game.api.crew[0];
      return;
    }

    if (!focus) { camera.position.set(0, 22, 12); camera.lookAt(0, 0, 0); return; }
    if (view.mode === 'third') {
      var fx = focus.state.pos.x;
      var fz = focus.state.pos.y;
      var heading = focus.state.heading;
      var baseYaw = sceneYaw(heading) + Math.PI;
      // Плавно доворачиваем камеру за рабочим и не залезаем в стеллажи
      if (view.camYaw == null) view.camYaw = baseYaw;
      var diff = ((baseYaw - view.camYaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      view.camYaw += diff * Math.min(1, dt * 1.8);
      var yaw = view.camYaw + view.yaw;
      var maxDist = WC.CONFIG.camera.third.distance * view.distance;
      var height = WC.CONFIG.camera.third.height + view.pitch * 2.6;
      var camP = cameraObstructed({ x: fx, z: fz });
      var dist = maxDist;
      for (var d = maxDist; d > 1.3; d -= 0.35) {
        var probe = { x: fx + Math.sin(yaw) * d, z: fz + Math.cos(yaw) * d };
        if (!cameraObstructed(probe)) { dist = d; break; }
        dist = d;
      }
      var desired = new THREE_NS.Vector3(fx + Math.sin(yaw) * dist, height, fz + Math.cos(yaw) * dist);
      var lookTarget = new THREE_NS.Vector3(fx, 1.15, fz);
      // Живая камера: еле заметное дыхание кадра и толчок от событий (уронил коробку)
      desired.x += Math.sin(clock * 0.71) * 0.035;
      desired.y += Math.sin(clock * 1.13) * 0.022;
      if (view.shake > 0.002) {
        desired.x += Math.sin(clock * 47.3) * 0.075 * view.shake;
        desired.y += Math.sin(clock * 58.9) * 0.055 * view.shake;
        lookTarget.x += Math.sin(clock * 41.1) * 0.05 * view.shake;
        view.shake = Math.max(0, view.shake - dt * 2.4);
      }
      state.cameraPos.lerp(desired, Math.min(1, dt * 5.5));
      state.lookAt.lerp(lookTarget, Math.min(1, dt * 7));
      camera.position.copy(state.cameraPos);
      camera.lookAt(state.lookAt);
      camera.fov += (fitFov(WC.CONFIG.camera.third.fov) - camera.fov) * Math.min(1, dt * 3);
      camera.updateProjectionMatrix();
    } else if (view.mode === 'follow') {
      // Второй вид сверху: камера висит над выбранным рабочим и едет за ним,
      // поэтому бригаду видно сверху и не теряешь, кто где.
      var conf = WC.CONFIG.camera.follow;
      var ffx = focus.state.pos.x;
      var ffz = focus.state.pos.y;
      var fHeight = conf.height * (0.75 + 0.25 * view.distance);
      var backZ = conf.distance * view.distance;
      var desiredFollow = new THREE_NS.Vector3(
        ffx + Math.sin(view.yaw) * backZ * 0.25,
        fHeight,
        ffz + backZ + Math.cos(view.yaw) * backZ * 0.25
      );
      var lookFollow = new THREE_NS.Vector3(ffx, 0.6, ffz + 0.6);
      state.cameraPos.lerp(desiredFollow, Math.min(1, dt * 3.2));
      state.lookAt.lerp(lookFollow, Math.min(1, dt * 5));
      camera.position.copy(state.cameraPos);
      camera.lookAt(state.lookAt);
      camera.fov += (fitFov(conf.fov) - camera.fov) * Math.min(1, dt * 3);
      camera.updateProjectionMatrix();
    } else {
      var topDist = 27 * view.distance;
      var desiredTop = new THREE_NS.Vector3(
        Math.sin(view.yaw) * topDist * 0.16,
        topDist * 1.05,
        Math.cos(view.yaw) * topDist * 0.24
      );
      var targetTop = new THREE_NS.Vector3(0, 0, 0.2);
      state.cameraPos.lerp(desiredTop, Math.min(1, dt * 3));
      state.lookAt.lerp(targetTop, Math.min(1, dt * 5));
      camera.position.copy(state.cameraPos);
      camera.lookAt(state.lookAt);
      camera.fov += (fitFov(WC.CONFIG.camera.top.fov) - camera.fov) * Math.min(1, dt * 3);
      camera.updateProjectionMatrix();
    }
  }

  function updateMarkers(game, activeId) {
    var host = document.getElementById('markers');
    if (!host) return;
    game.api.crew.forEach(function (worker) {
      var id = 'marker-' + worker.id;
      var node = document.getElementById(id);
      if (!node) {
        node = WC.util.el('div', { id: id, class: 'marker' }, [
          WC.util.el('b', { text: worker.state.name }),
          WC.util.el('div', { class: 'm-bar' }, [WC.util.el('i')]),
          WC.util.el('div', { class: 'm-state', text: '' }),
        ]);
        host.appendChild(node);
      }
      var pos = new THREE_NS.Vector3(worker.state.pos.x, 2.05, worker.state.pos.y);
      pos.project(camera);
      var visible = pos.z < 1 && pos.z > -1;
      var x = (pos.x * 0.5 + 0.5) * host.clientWidth;
      var y = (-pos.y * 0.5 + 0.5) * host.clientHeight;
      node.style.left = x.toFixed(1) + 'px';
      node.style.top = y.toFixed(1) + 'px';
      node.style.opacity = visible && !worker.state.inToilet && !worker.state.privacy ? '1' : '0';
      node.classList.toggle('active', worker.id === activeId);
      var bar = node.querySelector('.m-bar i');
      var energy = worker.body.energy;
      bar.style.width = Math.round(energy * 100) + '%';
      bar.style.background = energy < 0.25 ? '#e2604f' : energy < 0.5 ? '#e8b45a' : '#6fbf8b';
      var stateLabel = WC.CONFIG.stateLabels[worker.state.state] || worker.state.state;
      var tag = node.querySelector('.m-state');
      tag.textContent = worker.state.carryingId ? 'несёт коробку' : stateLabel;
    });
  }

  function updateAtmosphere(dt, game) {
    clock += dt;
    // Лампы живут: лёгкое мерцание тёплого света
    lamps.forEach(function (lamp, i) {
      var base = lamp.userData.base || (lamp.userData.base = lamp.intensity || 6.5);
      lamp.intensity = base * (0.995 + 0.005 * Math.sin(clock * 0.45 + i * 2.1));
    });
    // Подсветка выбранного рабочего
    if (halo) {
      var focus = null;
      for (var i = 0; i < game.api.crew.length; i++) {
        if (game.api.crew[i].id === view.focusId) focus = game.api.crew[i];
      }
      if (!focus) focus = game.api.crew[0];
      if (focus) {
        halo.position.x += (focus.state.pos.x - halo.position.x) * Math.min(1, dt * 12);
        halo.position.z += (focus.state.pos.y - halo.position.z) * Math.min(1, dt * 12);
        var pulse = 1 + 0.05 * Math.sin(clock * 2.6);
        halo.scale.set(pulse, 1, pulse);
        if (halo.material && 'opacity' in halo.material) {
          halo.material.opacity = 0.34 + 0.14 * (0.5 + 0.5 * Math.sin(clock * 2.6));
        }
      }
    }
  }

  // Меши частиц берём только из библиотеки рецептов движка.
  var bloodViews = new Map();
  function updateBlood(sim) {
    var seen = {};
    (sim.state.bloodDrops || []).concat(sim.state.bloodPools || []).forEach(function (item) {
      var pool = item.age != null;
      var id = (pool ? 'p' : 'd') + item.id;
      seen[id] = true;
      var mesh = bloodViews.get(id);
      if (!mesh) {
        mesh = meshes.mesh(engine, pool ? 'bloodPool' : 'bloodDrop', null, { castShadow: false });
        scene.add(mesh); bloodViews.set(id, mesh);
      }
      mesh.position.set(item.x, pool ? (item.z || 0) + 0.008 : item.z, item.y);
      if (pool) { var size = item.size * (1 + Math.min(0.3, item.age * 0.08)); mesh.scale.set(size, 1, size); }
    });
    bloodViews.forEach(function (mesh, id) {
      if (!seen[id]) { scene.remove(mesh); bloodViews.delete(id); }
    });
  }

  function render(dt, game) {
    if (!state.ready) return;
    var sim = game.sim;
    updateToilet(game, dt);
    updateCrew(dt, game);
    updateTrucks(sim, dt);
    updateForklift(sim, dt, game);
    updateBoxes(sim);
    updateBlood(sim);
    updateSlotMarkers(sim);
    updateAtmosphere(dt, game);
    updateCamera(dt, game);
    updatePrivacyOverlay(game);
    updateMarkers(game, game.api.activeWorkerId);
    renderer.render(scene, camera);
    state.frame += 1;
    state.drawCalls = renderer.info && renderer.info.render ? renderer.info.render.calls : 0;
    state.tris = renderer.info && renderer.info.render ? renderer.info.render.triangles : 0;
  }

  // Уединённое место: локальный блюр прямо на сцене-оверлее
  function updatePrivacyOverlay(game) {
    var node = document.getElementById('privacy-blur');
    if (!node) return;
    var pair = game.api.pair;
    var on = Boolean(pair && pair.privacy && pair.spot);
    node.classList.toggle('on', on);
    if (!on) { node.style.opacity = '0'; return; }
    var point = new THREE_NS.Vector3(pair.spot.x, 0.9, pair.spot.y);
    point.project(camera);
    var host = document.getElementById('stage') || canvas;
    var w = host.clientWidth || window.innerWidth;
    var h = host.clientHeight || window.innerHeight;
    var x = (point.x * 0.5 + 0.5) * w;
    var y = (-point.y * 0.5 + 0.5) * h;
    if (point.z > 1) { node.style.opacity = '0'; return; }
    node.style.left = x.toFixed(1) + 'px';
    node.style.top = y.toFixed(1) + 'px';
    node.style.opacity = '1';
    var label = node.querySelector('.pb-label');
    if (label) label.textContent = 'Уединённое место · ' + (pair.spot.label || 'приватно');
  }

  // Экранные координаты произвольной точки мира (для подсказок и блюра)
  function projectPoint(x, y, z) {
    var p = new THREE_NS.Vector3(x, y || 0, z || 0);
    p.project(camera);
    var host = document.getElementById('stage') || canvas;
    return {
      x: (p.x * 0.5 + 0.5) * (host.clientWidth || window.innerWidth),
      y: (-p.y * 0.5 + 0.5) * (host.clientHeight || window.innerHeight),
      visible: p.z > -1 && p.z < 1,
    };
  }

  return {
    init: init,
    render: render,
    removeView: removeView,
    projectPoint: projectPoint,
    toggleMap2d: toggleMap2d,
    setZoom: setZoom,
    getZoom: function () { return view.zoom || 1; },
    resize: resize,
    setMode: setMode,
    cycleMode: cycleMode,
    setFocus: setFocus,
    kick: kick,
    fitFov: fitFov,
    getMode: function () { return view.mode; },
    createCrewView: createCrewView,
    attachCrew: attachCrew,
    state: state,
    get camera() { return camera; },
    get scene() { return scene; },
    get renderer() { return renderer; },
  };
})();
