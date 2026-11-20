// Инспектор тела: 3D-разрез человека. Корпус собран из мешей RatCore:
// задняя стенка, боковины и съёмная передняя крышка. Когда включён «разрез»,
// крышка отъезжает — видно мозг, сердце, лёгкие, печень, желудок, кишечник,
// почки, позвоночник и рёбра. Всё в масштабе рабочего со склада (1.67 м).
window.WC = window.WC || {};

WC.bodyview = (function () {
  'use strict';

  var THREE_NS = null;
  var renderer = null;
  var scene = null;
  var camera = null;
  var canvas = null;
  var engine = null;
  var meshes = null;

  var build = null;
  var cut = false;
  var cutAmount = 0;
  var dragging = false;
  var lastX = 0;
  var yaw = 0.32;
  var pitch = 0;
  var zoom = 1;

  var state = { ready: false, frames: 0, tri: 0 };

  // Размеры корпуса в метрах (совпадают с моделью рабочего)
  var TORSO = { y0: 1.0, y1: 1.38, w: 0.36, d: 0.22 };

  function init(canvasEl, engineRef) {
    THREE_NS = window.THREE;
    if (!THREE_NS) throw new Error('Three.js не загрузился');
    canvas = canvasEl || document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    engine = engineRef || (WC.meshes.engineRef && WC.meshes.engineRef()) || (WC.game && WC.game.api && WC.game.api.engine);
    meshes = WC.meshes;

    renderer = new THREE_NS.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE_NS.SRGBColorSpace;

    scene = new THREE_NS.Scene();
    camera = new THREE_NS.PerspectiveCamera(32, 1, 0.05, 20);

    var key = new THREE_NS.DirectionalLight(0xfff2dd, 1.5);
    key.position.set(1.4, 2.4, 2.4);
    scene.add(key);
    var rim = new THREE_NS.DirectionalLight(0x7fb4d8, 0.9);
    rim.position.set(-1.8, 1.4, -1.8);
    scene.add(rim);
    scene.add(new THREE_NS.HemisphereLight(0xa8c8e2, 0x1a1210, 0.9));
    scene.add(new THREE_NS.AmbientLight(0xffffff, 0.25));

    attachOrbit(canvas);
    resize();
    window.addEventListener('resize', resize);
    state.ready = true;
    return state;
  }

  function mount(parentEl, engineRef) {
    if (!state.ready) init(document.createElement('canvas'), engineRef);
    if (parentEl && canvas.parentNode !== parentEl) {
      parentEl.appendChild(canvas);
    }
    resize();
    return canvas;
  }

  function resize() {
    if (!renderer || !canvas) return;
    var w = canvas.clientWidth || 420;
    var h = canvas.clientHeight || 380;
    renderer.setSize(w, h, false);
    camera.aspect = Math.max(0.45, w / Math.max(1, h));
    camera.updateProjectionMatrix();
  }

  function attachOrbit(el) {
    el.addEventListener('pointerdown', function (e) {
      dragging = true;
      lastX = e.clientX;
      if (el.setPointerCapture) el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      yaw += (e.clientX - lastX) * 0.01;
      lastX = e.clientX;
    });
    el.addEventListener('pointerup', function () { dragging = false; });
    el.addEventListener('pointercancel', function () { dragging = false; });
    el.addEventListener('wheel', function (e) {
      e.preventDefault();
      zoom = WC.util.clamp(zoom + (e.deltaY > 0 ? 0.1 : -0.1), 0.6, 2.0);
    }, { passive: false });
  }

  function add(parent, name, x, y, z, opts) {
    var m = meshes.mesh(engine, name, opts && opts.palette, opts || {});
    // смещение из рецепта (например, корпус строится вниз от пояса) сохраняем
    var off = m.position.clone();
    m.position.set(x + off.x, y + off.y, z + off.z);
    if (opts && opts.scale) m.scale.set(opts.scale[0], opts.scale[1], opts.scale[2]);
    if (opts && opts.rotation) m.rotation.set(opts.rotation[0], opts.rotation[1], opts.rotation[2]);
    m.castShadow = false;
    m.receiveShadow = false;
    parent.add(m);
    return m;
  }

  // Пластина нужного размера из меша plate (0.18 × 0.24 × 0.035)
  function plate(parent, w, h, d, x, y, z, color) {
    var m = add(parent, 'plate', x, y, z, { scale: [w / 0.18, h / 0.24, d / 0.035] });
    if (color) {
      m.material = m.material.clone();
      m.material.color = new THREE_NS.Color(color);
    }
    return m;
  }

  function disposeBuild() {
    if (!build) return;
    scene.remove(build.root);
    build = null;
  }

  function buildBody(palette) {
    disposeBuild();
    var root = new THREE_NS.Group();
    scene.add(root);
    var refs = { root: root, organs: {}, palette: palette, skin: [] };

    // --- ноги и таз (как у рабочего)
    var hipsY = 0.98;
    refs.pelvis = add(root, 'pelvis', 0, hipsY, 0, { palette: palette });
    refs.belt = add(root, 'belt', 0, hipsY, 0, { palette: palette });
    [-1, 1].forEach(function (side) {
      add(root, 'thigh', 0.085 * side, hipsY - 0.19, 0, { palette: palette });
      add(root, 'shin', 0.085 * side, hipsY - 0.57, 0, { palette: palette });
      add(root, 'foot', 0.085 * side, hipsY - 0.91, 0, { palette: palette });
      add(root, 'upperArm', 0.205 * side, hipsY + 0.355, 0, { palette: palette }).rotation.z = side * 0.06;
      add(root, 'forearm', 0.205 * side, hipsY + 0.085, 0, { palette: palette });
      add(root, 'hand', 0.205 * side, hipsY - 0.165, 0, { palette: palette });
    });

    // --- корпус-коробка: задняя стенка, боковины, днище и верх
    var midY = (TORSO.y0 + TORSO.y1) / 2;
    var hgt = TORSO.y1 - TORSO.y0;
    // Внутренняя поверхность разреза — светлая, «анатомическая»
    var cutColor = '#d2c2a9';
    refs.backWall = plate(root, TORSO.w, hgt, 0.02, 0, midY, -TORSO.d / 2 + 0.01, cutColor);
    refs.sideL = plate(root, 0.02, hgt, TORSO.d, -TORSO.w / 2 + 0.01, midY, 0, cutColor);
    refs.sideR = plate(root, 0.02, hgt, TORSO.d, TORSO.w / 2 - 0.01, midY, 0, cutColor);
    refs.bottom = plate(root, TORSO.w, 0.02, TORSO.d, 0, TORSO.y0 + 0.01, 0, cutColor);
    // Верх корпуса — воротник-жилет
    refs.collar = add(root, 'vest', 0, hipsY, 0, { palette: palette });

    // --- съёмная передняя крышка (кожа + жилет) — её и убирает «разрез»
    refs.lid = add(root, 'torso', 0, hipsY, 0, { palette: palette });
    refs.lidVest = add(root, 'vest', 0, hipsY, 0, { palette: palette });
    refs.lidVest.position.z += 0.002;
    refs.strap = add(root, 'strap', 0, hipsY, 0, { palette: palette });
    refs.badge = add(root, 'badge', 0, hipsY, 0, { palette: palette });

    // --- шея и голова
    refs.neck = add(root, 'neck', 0, hipsY + 0.39, 0, { palette: palette });
    refs.head = add(root, 'head', 0, hipsY + 0.475, 0, { palette: palette });
    refs.hair = add(root, 'hair', 0, hipsY + 0.475, 0, { palette: palette });
    refs.hairBack = add(root, 'hairBack', 0, hipsY + 0.475, 0, { palette: palette });
    add(root, 'nose', 0, hipsY + 0.475, 0, { palette: palette });
    add(root, 'mouth', 0, hipsY + 0.475, 0, { palette: palette });
    [-0.048, 0.048].forEach(function (dx) {
      add(root, 'eye', dx, hipsY + 0.475, 0, { palette: palette });
      add(root, 'pupil', dx, hipsY + 0.475, 0, { palette: palette });
      add(root, 'brow', dx, hipsY + 0.475, 0, { palette: palette });
    });
    refs.eyes = [];
    root.traverse(function (n) { if (n.isMesh) refs.skin.push(n); });

    // --- скелет
    for (var v = 0; v < 5; v++) add(root, 'vertebra', 0, 1.05 + v * 0.075, -0.075);
    for (var r = 0; r < 4; r++) {
      [-1, 1].forEach(function (side) {
        add(root, 'ribBone', 0.095 * side, 1.32 - r * 0.055, 0.02, {
          rotation: [0, 0, side * 0.95],
        });
      });
    }
    refs.sternum = plate(root, 0.05, 0.26, 0.02, 0, 1.24, 0.075, '#e8e2d2');

    // --- органы
    refs.organs.brain = add(root, 'brainOrgan', 0, 1.55, 0, { scale: [0.95, 0.72, 0.95] });
    refs.organs.heart = add(root, 'heartOrgan', 0.03, 1.25, 0.055, { scale: [1.15, 1.15, 1.15] });
    refs.organs.lungL = add(root, 'lungOrgan', -0.082, 1.29, 0.02, { scale: [1.05, 1.45, 0.85] });
    refs.organs.lungR = add(root, 'lungOrgan', 0.082, 1.29, 0.02, { scale: [1.05, 1.45, 0.85] });
    refs.organs.liver = add(root, 'liverOrgan', 0.05, 1.165, 0.01, { scale: [0.95, 0.95, 0.95] });
    refs.organs.stomach = add(root, 'stomachOrgan', -0.055, 1.155, 0.025, { scale: [0.95, 0.8, 0.8] });
    for (var i = 0; i < 3; i++) {
      refs.organs['intestine' + i] = add(root, 'intestine', 0, 1.115 - i * 0.036, 0.015, {
        scale: [0.78 - i * 0.08, 0.85, 0.8],
      });
    }
    refs.organs.kidneyL = add(root, 'kidneyOrgan', -0.075, 1.15, -0.06);
    refs.organs.kidneyR = add(root, 'kidneyOrgan', 0.075, 1.15, -0.06);
    refs.muscles = {
      rectus: add(root, 'muscleBelly', 0, 1.12, 0.055, { scale: [1.0, 0.7, 0.3] }),
      pecL: add(root, 'lungOrgan', -0.085, 1.32, 0.05, { scale: [0.95, 0.5, 0.35] }),
      pecR: add(root, 'lungOrgan', 0.085, 1.32, 0.05, { scale: [0.95, 0.5, 0.35] }),
    };

    build = refs;
    return refs;
  }

  function setCut(value) { cut = Boolean(value); return cut; }
  function isCut() { return cut; }

  function update(dt, body, palette) {
    if (!state.ready) return;
    if (!build) buildBody(palette);
    var b = body || WC.game.activeWorker().body;
    resize();
    var now = (typeof performance !== 'undefined' ? performance.now() : Date.now());

    cutAmount += ((cut ? 1 : 0) - cutAmount) * Math.min(1, dt * 9);
    var k = cutAmount;
    // Крышка отъезжает в сторону и вверх, жилет и планка уходят вместе с ней
    [build.lid, build.lidVest, build.strap, build.badge].forEach(function (m) {
      m.position.x = 1.25 * k;
      m.position.z = -0.25 * k;
      m.rotation.z = -0.85 * k;
      m.visible = k < 0.82;
    });
    [build.muscles.rectus, build.muscles.pecL, build.muscles.pecR].forEach(function (m) {
      m.visible = k < 0.45;
    });
    build.collar.visible = k < 0.45;

    // Пульс, дыхание, перистальтика
    var beat = 0.5 + 0.5 * Math.sin((now / 1000) * (b.heartRate / 60) * Math.PI * 2);
    build.organs.heart.scale.setScalar(0.92 + 0.22 * beat * (0.5 + b.stress));
    var breath = 0.5 + 0.5 * Math.sin((now / 1000) * (b.breathing / 60) * Math.PI * 2);
    [build.organs.lungL, build.organs.lungR].forEach(function (lung) {
      lung.scale.y = 1.15 + 0.45 * breath;
      lung.scale.x = 0.9 + 0.14 * breath;
    });
    build.organs.stomach.scale.set(0.95 + 0.05 * Math.sin(now / 900), 0.72 + 0.18 * b.hunger, 0.85);
    for (var i = 0; i < 3; i++) {
      var seg = build.organs['intestine' + i];
      var wave = Math.sin(now / 700 - i * 0.8);
      seg.position.z = 0.01 + wave * 0.008;
      seg.rotation.z = wave * 0.04;
    }
    build.organs.kidneyL.scale.setScalar(0.95 + 0.25 * WC.util.clamp01(b.thirst));
    build.organs.kidneyR.scale.setScalar(0.95 + 0.25 * WC.util.clamp01(b.thirst));

    function tint(organ, severity, colorHex) {
      var mat = organ.material;
      if (!mat || !mat.emissive) return;
      mat.emissive.set(colorHex);
      mat.emissiveIntensity = 0.08 + 0.9 * WC.util.clamp01(severity);
    }
    tint(build.organs.heart, Math.max(0, (b.heartRate - 125) / 65), '#ff5a4a');
    tint(build.organs.brain, Math.max(0, 0.75 - b.cognition) * 1.5, '#9b8cf0');
    tint(build.organs.stomach, Math.max(0, b.hunger - 0.6) * 2, '#e8b45a');
    tint(build.organs.kidneyL, Math.max(0, b.thirst - 0.6) * 2, '#5aa9e6');
    tint(build.organs.kidneyR, Math.max(0, b.thirst - 0.6) * 2, '#5aa9e6');
    tint(build.organs.lungL, Math.max(0, 0.9 - b.oxygen) * 3, '#5aa9e6');
    tint(build.organs.lungR, Math.max(0, 0.9 - b.oxygen) * 3, '#5aa9e6');
    tint(build.muscles.rectus, b.fatigue, '#ff8f6b');

    // Камера вокруг корпуса
    if (!dragging) yaw += dt * 0.05;
    var radius = 2.35 * zoom;
    var camY = 1.22 + pitch;
    camera.position.set(Math.sin(yaw) * radius, camY, Math.cos(yaw) * radius);
    camera.lookAt(0, 1.16, 0);
    camera.updateMatrixWorld(true);
    renderer.render(scene, camera);
    state.frames += 1;
    state.tri = renderer.info && renderer.info.render ? renderer.info.render.triangles : 0;
  }

  return {
    init: init,
    mount: mount,
    update: update,
    resize: resize,
    setCut: setCut,
    isCut: isCut,
    buildBody: buildBody,
    state: state,
    get scene() { return scene; },
    get camera() { return camera; },
    get renderer() { return renderer; },
  };
})();
