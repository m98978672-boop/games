// Трёхмерный склад: сцена, свет, статичные стеллажи, риги рабочих, две камеры.
window.WC = window.WC || {};

WC.world = (function () {
  'use strict';

  var THREE_NS = null;
  var renderer = null;
  var scene = null;
  var camera = null;
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
    renderer.toneMappingExposure = 1.05;

    scene = new THREE_NS.Scene();
    scene.fog = new THREE_NS.Fog(0x0a0d0c, 26, 54);

    camera = new THREE_NS.PerspectiveCamera(55, aspect(), 0.1, 140);
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
    camera.aspect = Math.max(0.35, w / Math.max(1, h));
    camera.updateProjectionMatrix();
  }

  function addLights() {
    var hemi = new THREE_NS.HemisphereLight(0xbfd4e6, 0x141816, 0.55);
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
    if (opts.rotationY) m.rotation.y = opts.rotationY;
    if (opts.rotationX) m.rotation.x = opts.rotationX;
    if (opts.rotationZ) m.rotation.z = opts.rotationZ;
    if (opts.scale) m.scale.set(opts.scale, opts.scale, opts.scale);
    scene.add(m);
    return m;
  }

  function buildWarehouse() {
    // Пол и разметка
    addStatic('floor', 0, 0, 0, { castShadow: false });
    [-7.8, -2.6, 2.6, 7.8].forEach(function (z) {
      addStatic('floorStripe', 0, 0.006, z, { castShadow: false, receiveShadow: false });
    });
    // Стены
    addStatic('wall', 0, 0, -8.55, { castShadow: false });
    addStatic('wall', 0, 0, 8.55, { castShadow: false });
    addStatic('wallSide', -13.05, 0, 0, { castShadow: false });
    addStatic('wallSide', 13.05, 0, 0, { castShadow: false });

    // Стеллажи: 3 ряда по 3 уровня
    var rackX = [-1.6, 2.2, 6.0];
    rackX.forEach(function (x) {
      for (var z = -5.7; z <= 5.71; z += 2.85) {
        [-0.58, 0.58].forEach(function (dz) {
          addStatic('shelfBeam', x + dz * 0, 0, z + dz, { castShadow: true });
        });
      }
      [0.25, 1.05, 1.85].forEach(function (h) {
        // Полки-слаты: доска не выглядит сплошной плитой
        [-0.38, 0, 0.38].forEach(function (dx) {
          addStatic('shelfSlat', x + dx, h, 0, {});
        });
        addStatic('shelfLip', x + 0.56, h + 0.02, 0, { castShadow: false });
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
    addStatic('bench', -7.4, 0, 7.35, { rotationY: 0 });
    [-8.3, -6.5].forEach(function (x) {
      addStatic('benchLeg', x, 0, 7.35, {});
    });
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

    var hips = new THREE_NS.Group();
    hips.position.y = 0.98;
    root.add(hips);
    hips.add(meshes.mesh(engine, 'pelvis', palette));
    hips.add(meshes.mesh(engine, 'belt', palette));

    var torso = new THREE_NS.Group();
    hips.add(torso);
    torso.add(meshes.mesh(engine, 'torso', palette));
    torso.add(meshes.mesh(engine, 'vest', palette));
    torso.add(meshes.mesh(engine, 'strap', palette));
    torso.add(meshes.mesh(engine, 'badge', palette));

    var neck = new THREE_NS.Group();
    neck.position.y = 0.40;
    torso.add(neck);
    neck.add(meshes.mesh(engine, 'neck', palette));

    var head = new THREE_NS.Group();
    head.position.y = 0.085;
    neck.add(head);
    head.add(meshes.mesh(engine, 'head', palette));
    head.add(meshes.mesh(engine, 'hair', palette));
    head.add(meshes.mesh(engine, 'hairBack', palette));
    head.add(meshes.mesh(engine, 'nose', palette));
    head.add(meshes.mesh(engine, 'mouth', palette));
    [-0.048, 0.048].forEach(function (dx) {
      var eye = meshes.mesh(engine, 'eye', palette);
      eye.position.x = dx;
      head.add(eye);
      var pupil = meshes.mesh(engine, 'pupil', palette);
      pupil.position.x = dx;
      head.add(pupil);
      var brow = meshes.mesh(engine, 'brow', palette);
      brow.position.x = dx;
      head.add(brow);
    });

    function makeArm(sign) {
      var shoulder = new THREE_NS.Group();
      shoulder.position.set(0.205 * sign, 0.355, 0);
      torso.add(shoulder);
      shoulder.add(meshes.mesh(engine, 'upperArm', palette));
      var elbow = new THREE_NS.Group();
      elbow.position.y = -0.27;
      shoulder.add(elbow);
      elbow.add(meshes.mesh(engine, 'forearm', palette));
      var wrist = new THREE_NS.Group();
      wrist.position.y = -0.25;
      elbow.add(wrist);
      wrist.add(meshes.mesh(engine, 'hand', palette));
      return { shoulder: shoulder, elbow: elbow, wrist: wrist };
    }

    function makeLeg(sign) {
      var hip = new THREE_NS.Group();
      hip.position.set(0.085 * sign, -0.19, 0);
      hips.add(hip);
      hip.add(meshes.mesh(engine, 'thigh', palette));
      var knee = new THREE_NS.Group();
      knee.position.y = -0.38;
      hip.add(knee);
      knee.add(meshes.mesh(engine, 'shin', palette));
      var ankle = new THREE_NS.Group();
      ankle.position.y = -0.34;
      knee.add(ankle);
      ankle.add(meshes.mesh(engine, 'foot', palette));
      return { hip: hip, knee: knee, ankle: ankle };
    }

    var armL = makeArm(1);
    var armR = makeArm(-1);
    var legL = makeLeg(1);
    var legR = makeLeg(-1);

    var carryAnchor = new THREE_NS.Group();
    carryAnchor.position.set(0, 0.02, 0.34);
    carryAnchor.scale.setScalar(0.82);
    torso.add(carryAnchor);

    scene.add(root);
    var viewState = {
      root: root, hips: hips, torso: torso, neck: neck, head: head,
      armL: armL, armR: armR, legL: legL, legR: legR,
      carryAnchor: carryAnchor, palette: palette,
      anim: { phase: 0, walk: 0, breath: 0 },
    };
    crewViews.set(member.id, viewState);
    return viewState;
  }

  function attachCrew(game) {
    game.api.crew.forEach(function (worker) {
      if (crewViews.has(worker.state.id)) return;
      createCrewView({ id: worker.state.id, palette: worker.state.palette }, worker.state.pos);
    });
    return crewViews.size;
  }

  function boxName(size) {
    return size === 'big' ? 'boxBig' : size === 'medium' ? 'boxMedium' : 'boxSmall';
  }

  function makeBoxView(order) {
    if (boxViews.has(order.id)) return boxViews.get(order.id);
    var group = new THREE_NS.Group();
    var body = meshes.mesh(engine, boxName(order.size), null);
    group.add(body);
    group.userData.orderId = order.id;
    scene.add(group);
    var entry = { group: group, body: body, state: null };
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
      if (order.status === 'stored') {
        var slot = null;
        for (var i = 0; i < sim.state.slots.length; i++) {
          if (sim.state.slots[i].id === order.slotId) slot = sim.state.slots[i];
        }
        if (slot) {
          group.position.set(slot.x, slot.h + 0.02, slot.y);
          group.rotation.set(0, 0, 0);
        }
        group.visible = true;
      } else if (order.status === 'ruined' || order.status === 'missed') {
        group.visible = false;
      } else if (order.status === 'carried' && order.carrier) {
        var carrierView = crewViews.get(order.carrier);
        if (carrierView && group.parent !== carrierView.carryAnchor) {
          carrierView.carryAnchor.add(group);
          group.position.set(0, 0, 0);
          group.rotation.set(0, 0, 0);
        }
        group.visible = true;
      } else {
        if (group.parent !== scene) scene.add(group);
        group.position.set(order.x, 0.13, order.y);
        group.rotation.set(0, order.priority > 0.72 ? 0.35 : -0.2, 0);
        group.visible = true;
      }
    });
    boxViews.forEach(function (entry, id) {
      if (!seen[id]) removeBoxView(id);
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

  function updateCrew(dt, game) {
    game.api.crew.forEach(function (worker) {
      var viewEntry = crewViews.get(worker.id);
      if (!viewEntry) return;
      var s = worker.state;
      var root = viewEntry.root;
      root.position.x += (s.pos.x - root.position.x) * Math.min(1, dt * 18);
      root.position.z += (s.pos.y - root.position.z) * Math.min(1, dt * 18);
      var targetYaw = sceneYaw(s.heading);
      var delta = ((targetYaw - root.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      root.rotation.y += delta * Math.min(1, dt * 12);

      var walk = s.anim.walk;
      var phase = s.anim.phase;
      var carrying = Boolean(s.carryingId);
      var resting = s.state === 'rest' || s.state === 'toRest';
      var down = s.state === 'down';
      var body = worker.body;

      // Ноги
      var stride = 0.62 * walk;
      viewEntry.legL.hip.rotation.x = Math.sin(phase) * stride;
      viewEntry.legR.hip.rotation.x = -Math.sin(phase) * stride;
      viewEntry.legL.knee.rotation.x = Math.max(0, -Math.cos(phase)) * 0.85 * walk;
      viewEntry.legR.knee.rotation.x = Math.max(0, Math.cos(phase)) * 0.85 * walk;
      viewEntry.legL.ankle.rotation.x = -Math.sin(phase) * 0.18 * walk;
      viewEntry.legR.ankle.rotation.x = Math.sin(phase) * 0.18 * walk;

      // Руки: при переноске — вперёд, иначе машут
      var swing = Math.sin(phase) * 0.7 * walk;
      if (carrying) {
        viewEntry.armL.shoulder.rotation.x = -1.15;
        viewEntry.armR.shoulder.rotation.x = -1.15;
        viewEntry.armL.shoulder.rotation.z = -0.16;
        viewEntry.armR.shoulder.rotation.z = 0.16;
        viewEntry.armL.elbow.rotation.x = -0.75;
        viewEntry.armR.elbow.rotation.x = -0.75;
      } else if (resting) {
        viewEntry.armL.shoulder.rotation.x = -0.22 + Math.sin(s.anim.breath) * 0.04;
        viewEntry.armR.shoulder.rotation.x = -0.22 + Math.sin(s.anim.breath) * 0.04;
        viewEntry.armL.shoulder.rotation.z = -0.12;
        viewEntry.armR.shoulder.rotation.z = 0.12;
        viewEntry.armL.elbow.rotation.x = -0.35;
        viewEntry.armR.elbow.rotation.x = -0.35;
      } else {
        viewEntry.armL.shoulder.rotation.x = -swing;
        viewEntry.armR.shoulder.rotation.x = swing;
        viewEntry.armL.shoulder.rotation.z = -0.07;
        viewEntry.armR.shoulder.rotation.z = 0.07;
        viewEntry.armL.elbow.rotation.x = -0.18 - Math.max(0, swing) * 0.3;
        viewEntry.armR.elbow.rotation.x = -0.18 - Math.max(0, -swing) * 0.3;
      }

      // Корпус: наклон от груза, дыхание, поза отдыха
      var targetLean = down ? 0 : (carrying ? 0.13 : 0.02) + Math.min(0.12, body.fatigue * 0.18);
      viewEntry.hips.position.y = 0.98 - (resting ? 0.16 : 0) - Math.min(0.1, body.fatigue * 0.1) - (down ? 0.5 : 0);
      viewEntry.torso.rotation.x = viewEntry.torso.rotation.x + ((targetLean) - viewEntry.torso.rotation.x) * Math.min(1, dt * 6);
      viewEntry.neck.rotation.y = Math.sin(s.anim.breath * 0.35) * 0.16;
      viewEntry.head.rotation.x = resting ? 0.22 : (down ? 0.5 : 0.02);
      root.rotation.z = down ? 1.35 : 0;
      if (down) root.position.y = 0.18 * (1 - Math.min(1, Math.abs(root.rotation.z) / 1.35)) + 0.0;

      // Ступни держим у пола
      if (!down) {
        root.position.y = 0;
      }
    });
  }

  // ---------------------------------------------------------------- камера
  function setMode(mode) {
    view.mode = mode;
    document.body.classList.toggle('view-top', mode === 'top');
    return view.mode;
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
      view.distance = WC.util.clamp(view.distance + (e.deltaY > 0 ? 0.12 : -0.12), 0.55, 2.4);
    }, { passive: false });
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  // Точка камеры внутри стеллажа, стены или за пределами цеха?
  function cameraObstructed(point) {
    if (Math.abs(point.x) > 12.1 || Math.abs(point.z) > 7.9) return true;
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
      node.style.opacity = visible ? '1' : '0';
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
      lamp.intensity = base * (0.94 + 0.06 * Math.sin(clock * 1.7 + i * 2.1) + 0.03 * Math.sin(clock * 11 + i));
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

  function render(dt, game) {
    if (!state.ready) return;
    var sim = game.sim;
    updateCrew(dt, game);
    updateBoxes(sim);
    updateSlotMarkers(sim);
    updateAtmosphere(dt, game);
    updateCamera(dt, game);
    updateMarkers(game, game.api.activeWorkerId);
    renderer.render(scene, camera);
    state.frame += 1;
    state.drawCalls = renderer.info && renderer.info.render ? renderer.info.render.calls : 0;
    state.tris = renderer.info && renderer.info.render ? renderer.info.render.triangles : 0;
  }

  return {
    init: init,
    render: render,
    resize: resize,
    setMode: setMode,
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
