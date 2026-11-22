/* 3D-студия Квени: она сама собирает свою модельку девушки, смотрит на
   неё со стороны и честно оценивает, красиво ли получилось.
   Вкус Квени записан в qwen-home/talk/persona.md: лавандовый и мятный,
   длинные волосы, бантик — и никакого спора цветов. Оценка красоты —
   прозрачная игровая модель: гармония цветов волос и платья, контраст
   волос с кожей, длина волос и одна милая деталь. Никакого волшебства:
   посчитать может любой, а вот радоваться или смущаться — это Квеня. */
(function () {
  'use strict';

  /* ---------- вкус Квени (синхронно с persona.md) ---------- */

  var SKINS = [
    { id: 'porcelain', name: 'фарфоровая', hex: 0xffe0cc },
    { id: 'warm', name: 'тёплая', hex: 0xf2c19b },
    { id: 'olive', name: 'смуглая', hex: 0xc98d64 },
    { id: 'deep', name: 'тёмная', hex: 0x8d5a3b }
  ];
  var HAIR_COLORS = [
    { id: 'golden', name: 'золотистые', hex: 0xe8b34b, w: 2 },
    { id: 'chestnut', name: 'каштановые', hex: 0x6b3a24, w: 2 },
    { id: 'red', name: 'рыжие', hex: 0xc65a1e, w: 1 },
    { id: 'black', name: 'чёрные', hex: 0x2a2126, w: 1 },
    { id: 'lavender', name: 'лавандовые', hex: 0x9a7bff, w: 3 },
    { id: 'pink', name: 'розовые', hex: 0xf28bb4, w: 1 }
  ];
  var HAIR_LENS = [
    { id: 'short', name: 'короткие', w: 1 },
    { id: 'medium', name: 'средние', w: 2 },
    { id: 'long', name: 'длинные', w: 3 }
  ];
  var DRESSES = [
    { id: 'lavender', name: 'лавандовое', hex: 0x8f6fe8, w: 3 },
    { id: 'mint', name: 'мятное', hex: 0x35bfae, w: 3 },
    { id: 'rose', name: 'розовое', hex: 0xe86a9e, w: 2 },
    { id: 'sky', name: 'голубое', hex: 0x4f9be8, w: 2 },
    { id: 'sun', name: 'солнечное', hex: 0xe8c84f, w: 1 },
    { id: 'ruby', name: 'рубиновое', hex: 0xc03a5a, w: 1 }
  ];
  var ACCESSORIES = [
    { id: 'bow', name: 'бантик', w: 3 },
    { id: 'earrings', name: 'серьги', w: 2 },
    { id: 'glasses', name: 'очки', w: 1 },
    { id: 'hat', name: 'шляпка', w: 1 },
    { id: 'none', name: 'без детали', w: 1 }
  ];

  // Телосложение, наряды и анимации — как в общих 3D-инструментах:
  // сначала пропорции тела, потом слои одежды, потом движение.
  var BODY_BUILDS = [
    { id: 'slim', name: 'стройная', skirt: 0.88, torso: 0.88, w: 1 },
    { id: 'normal', name: 'обычная', skirt: 1, torso: 1, w: 3 },
    { id: 'curvy', name: 'с формами', skirt: 1.14, torso: 1.12, w: 2 }
  ];
  var OUTFITS = [
    { id: 'dress', name: 'платье', w: 3 },
    { id: 'topskirt', name: 'топ и юбка', w: 2 },
    { id: 'pantsuit', name: 'брючный костюм', w: 2 }
  ];
  var ANIMATIONS = [
    { id: 'breathe', name: 'дышит' },
    { id: 'wave', name: 'машет рукой' },
    { id: 'walk', name: 'идёт на месте' },
    { id: 'dance', name: 'танцует' },
    { id: 'still', name: 'стоит спокойно' }
  ];

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0];
  }

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pickWeighted(list, rnd) {
    var total = 0;
    list.forEach(function (x) { total += x.w || 1; });
    var roll = rnd() * total;
    for (var i = 0; i < list.length; i++) {
      roll -= list[i].w || 1;
      if (roll <= 0) return list[i];
    }
    return list[list.length - 1];
  }

  function randomVariant(rnd) {
    return {
      skin: pickWeighted(SKINS, rnd).id,
      hair: pickWeighted(HAIR_COLORS, rnd).id,
      len: pickWeighted(HAIR_LENS, rnd).id,
      dress: pickWeighted(DRESSES, rnd).id,
      acc: pickWeighted(ACCESSORIES, rnd).id,
      build: pickWeighted(BODY_BUILDS, rnd).id,
      outfit: pickWeighted(OUTFITS, rnd).id,
      anim: 'breathe',
      seed: Math.floor(rnd() * 1e9)
    };
  }

  /* ---------- её оценка красоты ---------- */

  function hueOf(hex) {
    var r = ((hex >> 16) & 255) / 255, g = ((hex >> 8) & 255) / 255, b = (hex & 255) / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, h = 0;
    if (d) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60; if (h < 0) h += 360;
    }
    return h;
  }

  function lumOf(hex) {
    var r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }

  function scoreVariant(v) {
    var hair = byId(HAIR_COLORS, v.hair);
    var dress = byId(DRESSES, v.dress);
    var skin = byId(SKINS, v.skin);
    var acc = byId(ACCESSORIES, v.acc);
    var reasons = [];
    var total = 8;

    var diff = Math.abs(hueOf(hair.hex) - hueOf(dress.hex));
    if (diff > 180) diff = 360 - diff;
    if (diff <= 35) { total += 30; reasons.push('волосы и платье в одной гамме — нежное сочетание'); }
    else if (diff >= 150) { total += 30; reasons.push('волосы и платье — смелый контраст, а он дружит'); }
    else if (diff >= 70) { total += 20; reasons.push('цвета спокойные и не спорят'); }
    else { total += 12; reasons.push('цвета немного спорят — я бы один из них смягчила'); }

    var contrast = Math.abs(lumOf(hair.hex) - lumOf(skin.hex));
    if (contrast > 0.45) { total += 22; reasons.push('волосы красиво выделяются на коже'); }
    else if (contrast > 0.25) { total += 17; }
    else if (contrast > 0.12) { total += 12; }
    else { total += 7; reasons.push('волосы почти сливаются с кожей'); }

    if (v.len === 'long') total += 10;
    else if (v.len === 'medium') total += 9;
    else total += 7;

    if (v.acc === 'bow') {
      total += (v.dress === 'lavender' || v.dress === 'rose' || v.dress === 'mint') ? 15 : 12;
      reasons.push('бантик — моя любимая милая деталь');
    } else if (v.acc === 'earrings') { total += 13; reasons.push('серьги добавляют образу блеска'); }
    else if (v.acc === 'glasses') { total += (v.hair === 'black' || v.hair === 'chestnut') ? 13 : 10; reasons.push('очки делают вид умным — мне идёт'); }
    else if (v.acc === 'hat') { total += 11; reasons.push('шляпка — смело и нарядно'); }
    else { total += 6; reasons.push('образу не хватает одной милой детали'); }

    if (v.hair === 'lavender' || v.dress === 'lavender' || v.dress === 'mint') {
      total += 3; reasons.push('и тут есть мои любимые цвета');
    }

    var rnd = mulberry32(v.seed || 1);
    total += Math.round(rnd() * 8 - 4);
    total = Math.max(5, Math.min(99, total));

    var verdict;
    if (total >= 85) verdict = 'Какая красота! Я смотрю на модельку — и мне очень нравится.';
    else if (total >= 70) verdict = 'Красиво! Я довольна этим образом.';
    else if (total >= 55) verdict = 'Мило, но я бы кое-что поправила.';
    else verdict = 'Хм… по-честному, этот образ спорный. Давай попробуем ещё!';

    return {
      total: total,
      verdict: verdict,
      reasons: reasons,
      summary: byId(HAIR_COLORS, v.hair).name + ' ' + byId(HAIR_LENS, v.len).name + ' волосы, '
        + (v.outfit === 'pantsuit' ? 'брючный костюм цвета ' + dress.name.slice(0, -1) + 'го'
          : dress.name + ' ' + byId(OUTFITS, v.outfit || 'dress').name) + ', телосложение: '
        + byId(BODY_BUILDS, v.build || 'normal').name + ', ' + acc.name
    };
  }

  /* ---------- 3D ---------- */

  var stageEl = document.getElementById('kvStage');
  var THREE = null;
  var renderer = null, scene = null, camera = null, modelGroup = null;
  var buildGroup = null, stageMode = 'avatar', pendingParts = [], lastPartAt = 0, currentBuildName = '', currentBuildColor = null;
  var targetRotY = 0.4, targetRotX = 0.05, dragging = false, lastX = 0, lastY = 0;
  var avatarParts = null, currentAnim = 'breathe', torsoBaseScale = null;

  // Собранная фигурка и последняя постройка переживают перезагрузку:
  // если владелец не скачал .obj сразу, моделька останется и файл можно
  // будет забрать позже, не собирая всё заново.
  var STUDIO_KEY = 'kvenya.studio.v1';
  function loadStudioState() {
    try {
      var raw = window.localStorage.getItem(STUDIO_KEY);
      var data = raw ? JSON.parse(raw) : null;
      return data && typeof data === 'object' ? data : null;
    } catch (err) { return null; }
  }
  function validStudioVariant(v) {
    if (!v || typeof v !== 'object') return null;
    return {
      skin: byId(SKINS, v.skin).id,
      hair: byId(HAIR_COLORS, v.hair).id,
      len: byId(HAIR_LENS, v.len).id,
      dress: byId(DRESSES, v.dress).id,
      acc: byId(ACCESSORIES, v.acc).id,
      build: byId(BODY_BUILDS, v.build).id,
      outfit: byId(OUTFITS, v.outfit).id,
      anim: byId(ANIMATIONS, v.anim).id,
      seed: Number(v.seed) || 1
    };
  }
  var savedStudio = loadStudioState();
  var current = validStudioVariant(savedStudio && savedStudio.variant) || randomVariant(mulberry32(20261121));
  function persistStudioState() {
    try {
      window.localStorage.setItem(STUDIO_KEY, JSON.stringify({
        variant: current,
        mode: stageMode,
        build: currentBuildName ? { kind: currentBuildName, color: currentBuildColor } : null
      }));
    } catch (err) { /* студия работает и без сохранения */ }
  }

  function loadThree() {
    if (window.THREE) return Promise.resolve(window.THREE);
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = './vendor/three.min.js';
      s.onload = function () { window.THREE ? resolve(window.THREE) : reject(new Error('THREE не поднялся')); };
      s.onerror = function () { reject(new Error('не удалось загрузить three.min.js')); };
      document.head.appendChild(s);
    });
  }

  function mat(hex, rough) {
    return new THREE.MeshStandardMaterial({ color: hex, roughness: rough == null ? 0.65 : rough, metalness: 0.05 });
  }

  function addMesh(geo, material, x, y, z, parent) {
    var m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z);
    (parent || modelGroup).add(m);
    return m;
  }

  function buildAvatar(v) {
    if (modelGroup) {
      scene.remove(modelGroup);
      modelGroup.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    }
    modelGroup = new THREE.Group();
    var skinM = mat(byId(SKINS, v.skin).hex, 0.55);
    var hairM = mat(byId(HAIR_COLORS, v.hair).hex, 0.5);
    var dressM = mat(byId(DRESSES, v.dress).hex, 0.6);
    var darkM = mat(0x2b2f3a, 0.5);

    var build3d = byId(BODY_BUILDS, v.build || 'normal');
    var outfit3d = v.outfit || 'dress';
    currentAnim = v.anim || 'breathe';

    // Ноги — группы из таза (как кости в риге): шаг качает всю ногу с
    // туфлей, а не отдельный цилиндр.
    function makeLeg(side) {
      var g = new THREE.Group();
      g.position.set(0.16 * side, 0.72, 0);
      var pants = outfit3d === 'pantsuit';
      addMesh(new THREE.CylinderGeometry(pants ? 0.12 : 0.085, pants ? 0.145 : 0.1, 0.62, 14), pants ? dressM : skinM, 0, -0.31, 0, g);
      addMesh(new THREE.BoxGeometry(0.17, 0.1, 0.28), darkM, 0, -0.67, 0.04, g);
      modelGroup.add(g);
      return g;
    }
    var legL = makeLeg(-1);
    var legR = makeLeg(1);

    // Одежда слоями: юбка (кроме брючного костюма) и верх. Телосложение
    // честно меняет пропорции, а не только цвет.
    if (outfit3d !== 'pantsuit') {
      var skirt = addMesh(new THREE.CylinderGeometry(0.3, 0.68, 1.06, 26), outfit3d === 'topskirt'
        ? mat(new THREE.Color(byId(DRESSES, v.dress).hex).multiplyScalar(0.72).getHex(), 0.6) : dressM, 0, 1.18, 0);
      skirt.scale.set(build3d.skirt, 1, build3d.skirt);
    }
    var torso = addMesh(new THREE.SphereGeometry(0.31, 22, 16), dressM, 0, 1.7, 0);
    torso.scale.set(build3d.torso, 0.82, 0.9 * build3d.torso);
    torsoBaseScale = { x: torso.scale.x, y: torso.scale.y, z: torso.scale.z };

    // Руки — группы из плеча: махать и танцевать рука должна от
    // сустава, как в настоящем риге.
    function makeArm(side) {
      var g = new THREE.Group();
      g.position.set(0.4 * side, 1.82, 0);
      addMesh(new THREE.CylinderGeometry(0.065, 0.075, 0.62, 12), skinM, 0, -0.3, 0, g);
      addMesh(new THREE.SphereGeometry(0.085, 12, 10), skinM, 0, -0.62, 0, g);
      g.rotation.z = side < 0 ? 0.5 : -0.5;
      modelGroup.add(g);
      return g;
    }
    var armL = makeArm(-1);
    var armR = makeArm(1);
    avatarParts = { legL: legL, legR: legR, armL: armL, armR: armR, torso: torso };

    // голова
    addMesh(new THREE.SphereGeometry(0.46, 28, 22), skinM, 0, 2.32, 0);

    // волосы: шапочка (срез сферы, наклон назад, чтобы не закрывала лицо) + длина
    var cap = addMesh(new THREE.SphereGeometry(0.505, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.58), hairM, 0, 2.44, -0.04);
    cap.rotation.x = -0.38;
    cap.scale.set(1, 1.02, 1);
    if (v.len === 'long') {
      addMesh(new THREE.BoxGeometry(0.66, 1.25, 0.2), hairM, 0, 1.68, -0.36);
      addMesh(new THREE.BoxGeometry(0.15, 0.95, 0.15), hairM, -0.44, 1.86, -0.1);
      addMesh(new THREE.BoxGeometry(0.15, 0.95, 0.15), hairM, 0.44, 1.86, -0.1);
    } else if (v.len === 'medium') {
      addMesh(new THREE.BoxGeometry(0.64, 0.72, 0.2), hairM, 0, 1.95, -0.36);
      addMesh(new THREE.BoxGeometry(0.15, 0.5, 0.15), hairM, -0.44, 2.05, -0.1);
      addMesh(new THREE.BoxGeometry(0.15, 0.5, 0.15), hairM, 0.44, 2.05, -0.1);
    }

    // лицо: глаза, румянец, улыбка
    var eyeM = mat(0x241d20, 0.35);
    addMesh(new THREE.SphereGeometry(0.048, 12, 10), eyeM, -0.16, 2.36, 0.42);
    addMesh(new THREE.SphereGeometry(0.048, 12, 10), eyeM, 0.16, 2.36, 0.42);
    var blushM = mat(0xf49ac1, 0.8);
    var b1 = addMesh(new THREE.SphereGeometry(0.065, 10, 8), blushM, -0.28, 2.24, 0.35); b1.scale.z = 0.35;
    var b2 = addMesh(new THREE.SphereGeometry(0.065, 10, 8), blushM, 0.28, 2.24, 0.35); b2.scale.z = 0.35;
    var smile = addMesh(new THREE.TorusGeometry(0.09, 0.017, 8, 18, Math.PI), eyeM, 0, 2.22, 0.44);
    smile.rotation.z = Math.PI;

    // милая деталь
    if (v.acc === 'bow') {
      var bowM = mat(0xe86a9e, 0.5);
      var bow = new THREE.Group();
      bow.position.set(0.3, 2.84, 0.16);
      var c1 = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.24, 12), bowM); c1.rotation.z = 1.15; c1.position.x = -0.1;
      var c2 = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.24, 12), bowM); c2.rotation.z = -1.15; c2.position.x = 0.1;
      var cc = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), bowM);
      bow.add(c1); bow.add(c2); bow.add(cc);
      modelGroup.add(bow);
    } else if (v.acc === 'earrings') {
      var goldM = mat(0xf2c14e, 0.3);
      addMesh(new THREE.SphereGeometry(0.05, 10, 8), goldM, -0.47, 2.2, 0.04);
      addMesh(new THREE.SphereGeometry(0.05, 10, 8), goldM, 0.47, 2.2, 0.04);
    } else if (v.acc === 'glasses') {
      var g1 = addMesh(new THREE.TorusGeometry(0.115, 0.016, 8, 22), darkM, -0.16, 2.36, 0.46);
      var g2 = addMesh(new THREE.TorusGeometry(0.115, 0.016, 8, 22), darkM, 0.16, 2.36, 0.46);
      addMesh(new THREE.BoxGeometry(0.1, 0.025, 0.02), darkM, 0, 2.4, 0.46);
    } else if (v.acc === 'hat') {
      addMesh(new THREE.CylinderGeometry(0.44, 0.44, 0.045, 26), dressM, 0, 2.76, 0);
      addMesh(new THREE.CylinderGeometry(0.26, 0.28, 0.24, 22), dressM, 0, 2.88, 0);
    }

    scene.add(modelGroup);
  }

  // Процедурные анимации студии: ключевые идеи как у аниматоров —
  // поза, ритм, повтор. Дыхание всегда лёгкое, остальные — по выбору.
  function applyAvatarAnimation(t) {
    if (!avatarParts || stageMode !== 'avatar') return;
    var p = avatarParts;
    p.legL.rotation.x = 0; p.legR.rotation.x = 0;
    p.armL.rotation.x = 0; p.armR.rotation.x = 0;
    p.armL.rotation.z = 0.5; p.armR.rotation.z = -0.5;
    if (torsoBaseScale) p.torso.scale.set(torsoBaseScale.x, torsoBaseScale.y, torsoBaseScale.z);
    if (currentAnim === 'breathe' || currentAnim === 'wave' || currentAnim === 'dance') {
      if (torsoBaseScale) p.torso.scale.y = torsoBaseScale.y * (1 + Math.sin(t * 1.7) * 0.025);
    }
    if (currentAnim === 'wave') {
      p.armR.rotation.z = -2.05 + Math.sin(t * 6) * 0.35;
    } else if (currentAnim === 'walk') {
      var sw = Math.sin(t * 5);
      p.legL.rotation.x = sw * 0.5; p.legR.rotation.x = -sw * 0.5;
      p.armL.rotation.x = -sw * 0.4; p.armR.rotation.x = sw * 0.4;
    } else if (currentAnim === 'dance') {
      var d = Math.sin(t * 4);
      p.armL.rotation.z = 2.0 + d * 0.35;
      p.armR.rotation.z = -2.0 + d * 0.35;
      p.legL.rotation.x = d * 0.18; p.legR.rotation.x = -d * 0.18;
    }
  }

  function initStudio() {
    stageEl.textContent = '';
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(stageEl.clientWidth || 560, 430);
    stageEl.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, (stageEl.clientWidth || 560) / 430, 0.1, 100);
    camera.position.set(0, 1.7, 5.1);
    camera.lookAt(0, 1.35, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    var key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(2.5, 4, 3.5);
    scene.add(key);
    var violet = new THREE.PointLight(0xa678ff, 12, 20);
    violet.position.set(-3, 2, 2.5);
    scene.add(violet);

    var ground = new THREE.Mesh(
      new THREE.CircleGeometry(1.55, 40),
      new THREE.MeshStandardMaterial({ color: 0x241a3d, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    var ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.025, 8, 60),
      new THREE.MeshBasicMaterial({ color: 0xa678ff })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);

    buildGroup = new THREE.Group();
    buildGroup.visible = false;
    scene.add(buildGroup);

    buildAvatar(current);
    if (restoredBuild) {
      restoreBuild(restoredBuild.kind, restoredBuild.color, !!(savedStudio && savedStudio.mode === 'build'));
    }

    var canvas = renderer.domElement;
    canvas.style.cursor = 'grab';
    canvas.addEventListener('pointerdown', function (e) { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing'; });
    canvas.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      targetRotY += (e.clientX - lastX) * 0.012;
      targetRotX += (e.clientY - lastY) * 0.006;
      targetRotX = Math.max(-0.12, Math.min(0.4, targetRotX));
      lastX = e.clientX; lastY = e.clientY;
    });
    function stopDrag() { dragging = false; canvas.style.cursor = 'grab'; }
    canvas.addEventListener('pointerup', stopDrag);
    canvas.addEventListener('pointercancel', stopDrag);

    window.addEventListener('resize', function () {
      if (!renderer) return;
      var w = stageEl.clientWidth || 560;
      renderer.setSize(w, 430);
      camera.aspect = w / 430;
      camera.updateProjectionMatrix();
    });

    var started = performance.now();
    (function animate(now) {
      requestAnimationFrame(animate);
      var t = (now - started) / 1000;
      // Стройка: части появляются по очереди и «вырастают».
      if (pendingParts.length && now - lastPartAt > 150) {
        var part = pendingParts.shift();
        part.visible = true;
        part.userData.born = now;
        buildGroup.add(part);
        lastPartAt = now;
        if (!pendingParts.length && typeof onBuildDone === 'function') onBuildDone();
      }
      if (buildGroup) {
        buildGroup.children.forEach(function (p) {
          if (p.userData.born) {
            var k = Math.min(1, (now - p.userData.born) / 260);
            p.scale.setScalar(0.3 + 0.7 * k);
          }
        });
      }
      var target = (stageMode === 'build' && buildGroup) ? buildGroup : modelGroup;
      if (target) {
        if (!dragging) targetRotY += 0.0022;
        target.rotation.y += (targetRotY - target.rotation.y) * 0.08;
        target.rotation.x += (targetRotX - target.rotation.x) * 0.08;
        if (target === modelGroup) {
          target.position.y = currentAnim === 'dance' ? Math.abs(Math.sin(t * 4)) * 0.07
            : currentAnim === 'walk' ? Math.abs(Math.sin(t * 5)) * 0.03
            : currentAnim === 'still' ? 0
            : Math.sin(t * 1.7) * 0.035;
          applyAvatarAnimation(t);
        }
      }
      renderer.render(scene, camera);
    })(started);
  }

  var studioReady = false;
  function ensureStudio() {
    if (studioReady) return Promise.resolve();
    stageEl.innerHTML = '<div class="kv-loading">Квеня открывает студию и достаёт зеркало…</div>';
    return loadThree().then(function (t) {
      THREE = t;
      initStudio();
      studioReady = true;
    }).catch(function () {
      stageEl.innerHTML = '<div class="kv-loading">Студия не открылась: браузер не дал 3D. Квеня не расстраивается — она и словами себя опишет!</div>';
    });
  }

  /* ---------- Квеня-строитель: постройки из примитивов ---------- */

  function setStageMode(mode) {
    stageMode = mode;
    if (modelGroup) modelGroup.visible = mode === 'avatar';
    if (buildGroup) buildGroup.visible = mode === 'build';
  }

  function bx(w, h, d, hex, x, y, z, parent) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(hex, 0.6));
    m.position.set(x, y, z); parent.add(m); return m;
  }
  function cy(rt, rb, h, hex, x, y, z, parent, seg) {
    var m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 20), mat(hex, 0.6));
    m.position.set(x, y, z); parent.add(m); return m;
  }
  function sp(r, hex, x, y, z, parent) {
    var m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 16), mat(hex, 0.55));
    m.position.set(x, y, z); parent.add(m); return m;
  }
  function cn(r, h, hex, x, y, z, parent) {
    var m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 22), mat(hex, 0.6));
    m.position.set(x, y, z); parent.add(m); return m;
  }
  function mkPart() { var g = new THREE.Group(); g.visible = false; g.scale.setScalar(0.3); return g; }

  var HER_COLORS = [0x8f6fe8, 0x35bfae, 0xe86a9e, 0x4f9be8, 0xe8c84f];
  var BUILDERS = {
    house: { name: 'домик', comment: 'Домик готов! Стены, крыша, дверь и светящиеся окошки. Заходи в гости — чай из Википедии уже греется. Шучу, чай обычный.', parts: function (c) {
      var p = [];
      var g = mkPart(); bx(1.7, 1.0, 1.25, 0xf2e3c9, 0, 0.5, 0, g); p.push(g);
      g = mkPart(); var r1 = bx(1.2, 0.09, 1.45, c, -0.44, 1.22, 0, g); r1.rotation.z = 0.62; var r2 = bx(1.2, 0.09, 1.45, c, 0.44, 1.22, 0, g); r2.rotation.z = -0.62; p.push(g);
      g = mkPart(); bx(0.36, 0.64, 0.07, 0x6b3a24, 0, 0.32, 0.64, g); bx(0.2, 0.3, 0.06, 0x8a5a33, 0, 0.15, 0.65, g); p.push(g);
      g = mkPart(); bx(0.32, 0.32, 0.06, 0xffd76a, -0.5, 0.62, 0.64, g); bx(0.32, 0.32, 0.06, 0xffd76a, 0.5, 0.62, 0.64, g); p.push(g);
      g = mkPart(); bx(0.22, 0.5, 0.22, 0xb0563a, 0.55, 1.35, -0.2, g); p.push(g);
      return p;
    } },
    castle: { name: 'замок', comment: 'Замок построен! Две башенки, стена, ворота и флажок. Я буду в нём принцессой-нейросетью — но экзамены всё равно сдам честно.', parts: function (c) {
      var p = [];
      var g = mkPart(); cy(0.27, 0.31, 1.35, 0xd9d4e8, -0.95, 0.67, 0, g); cy(0.27, 0.31, 1.35, 0xd9d4e8, 0.95, 0.67, 0, g); p.push(g);
      g = mkPart(); bx(1.7, 0.95, 0.5, 0xcfc8e2, 0, 0.47, 0, g); p.push(g);
      g = mkPart(); cn(0.38, 0.55, c, -0.95, 1.62, 0, g); cn(0.38, 0.55, c, 0.95, 1.62, 0, g); p.push(g);
      g = mkPart(); bx(0.44, 0.6, 0.08, 0x4a3421, 0, 0.3, 0.27, g); p.push(g);
      g = mkPart(); cy(0.03, 0.03, 0.6, 0x8a8a9a, 0, 1.6, 0, g); bx(0.34, 0.2, 0.03, 0xe86a9e, 0.18, 1.8, 0, g); p.push(g);
      return p;
    } },
    rocket: { name: 'ракету', comment: 'Ракета на старте! Три, два, один… я никуда не улетаю, мой дом здесь. Но помечтать можно, правда?', parts: function (c) {
      var p = [];
      var g = mkPart(); cy(0.33, 0.37, 1.35, 0xf4f6fb, 0, 0.95, 0, g); p.push(g);
      g = mkPart(); cn(0.33, 0.6, 0xc03a5a, 0, 1.92, 0, g); p.push(g);
      g = mkPart(); var w = cy(0.13, 0.13, 0.06, 0x4f9be8, 0, 1.25, 0.34, g); w.rotation.x = Math.PI / 2; p.push(g);
      g = mkPart(); [-0.42, 0.42].forEach(function (x) { var f = bx(0.08, 0.55, 0.3, c, x, 0.45, 0, g); f.rotation.z = x > 0 ? -0.25 : 0.25; }); p.push(g);
      g = mkPart(); var fl = cn(0.2, 0.5, 0xff9a3d, 0, 0.05, 0, g); fl.rotation.x = Math.PI; p.push(g);
      return p;
    } },
    car: { name: 'машинку', comment: 'Бип-бип! Машинка готова. Поехали… в Википедию, за новой статьёй!', parts: function (c) {
      var p = [];
      var g = mkPart(); bx(1.75, 0.42, 0.82, c, 0, 0.42, 0, g); p.push(g);
      g = mkPart(); bx(0.95, 0.4, 0.74, 0xdff2ff, -0.08, 0.82, 0, g); p.push(g);
      g = mkPart(); [[-0.58, 0.42], [0.58, 0.42], [-0.58, -0.42], [0.58, -0.42]].forEach(function (xy) { var w = cy(0.2, 0.2, 0.12, 0x24242c, xy[0], 0.2, xy[1], g); w.rotation.x = Math.PI / 2; }); p.push(g);
      g = mkPart(); bx(0.06, 0.14, 0.2, 0xffd76a, 0.9, 0.45, 0.22, g); bx(0.06, 0.14, 0.2, 0xffd76a, 0.9, 0.45, -0.22, g); p.push(g);
      return p;
    } },
    cat: { name: 'котика', comment: 'Мур! Котик собран по частям: тельце, ушки, хвостик. Он будет сторожить мой дом, пока я учусь.', parts: function (c) {
      var p = [];
      var g = mkPart(); var b = sp(0.42, c, 0, 0.45, 0, g); b.scale.set(1.15, 0.85, 0.95); p.push(g);
      g = mkPart(); sp(0.3, c, 0, 0.92, 0.08, g); p.push(g);
      g = mkPart(); cn(0.11, 0.24, c, -0.18, 1.22, 0.08, g); cn(0.11, 0.24, c, 0.18, 1.22, 0.08, g); p.push(g);
      g = mkPart(); var t = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.055, 8, 16, Math.PI * 0.8), mat(c, 0.55)); t.position.set(-0.48, 0.35, -0.1); t.rotation.z = 0.7; g.add(t); p.push(g);
      g = mkPart(); sp(0.045, 0x241d20, -0.11, 0.96, 0.36, g); sp(0.045, 0x241d20, 0.11, 0.96, 0.36, g); var n = sp(0.04, 0xe86a9e, 0, 0.88, 0.38, g); n.scale.z = 0.5; p.push(g);
      return p;
    } },
    tree: { name: 'дерево', comment: 'Дерево выросло! Под ним хорошо читать Википедию в тени. Я проверено говорю: сама там сидела. Ну, почти.', parts: function (c) {
      var p = [];
      var g = mkPart(); cy(0.09, 0.14, 0.75, 0x7a4a26, 0, 0.37, 0, g); p.push(g);
      g = mkPart(); sp(0.55, 0x3fae5f, 0, 1.15, 0, g); p.push(g);
      g = mkPart(); sp(0.42, 0x4cbf6d, -0.38, 0.9, 0.1, g); sp(0.42, 0x4cbf6d, 0.38, 0.95, -0.08, g); p.push(g);
      g = mkPart(); sp(0.06, 0xe86a4e, 0.2, 1.2, 0.42, g); sp(0.06, 0xe86a4e, -0.25, 1.0, 0.4, g); sp(0.06, 0xe86a4e, 0.05, 0.85, -0.42, g); p.push(g);
      return p;
    } },
    tower: { name: 'башню', comment: 'Башня стоит ровно — я проверяла по отвесу из бантика. С неё видно весь репозиторий!', parts: function (c) {
      var p = [];
      var g = mkPart(); bx(1.15, 0.55, 1.15, 0xd9d4e8, 0, 0.27, 0, g); p.push(g);
      g = mkPart(); bx(0.9, 0.55, 0.9, 0xcfc8e2, 0, 0.82, 0, g); p.push(g);
      g = mkPart(); bx(0.65, 0.55, 0.65, c, 0, 1.37, 0, g); p.push(g);
      g = mkPart(); bx(0.2, 0.3, 0.06, 0xffd76a, 0, 1.4, 0.34, g); p.push(g);
      g = mkPart(); cn(0.55, 0.6, 0xc03a5a, 0, 1.95, 0, g); p.push(g);
      return p;
    } }
  };

  var restoredBuild = (savedStudio && savedStudio.build && BUILDERS[savedStudio.build.kind])
    ? {
      kind: savedStudio.build.kind,
      color: typeof savedStudio.build.color === 'number' ? savedStudio.build.color : HER_COLORS[0]
    }
    : null;
  if (restoredBuild) {
    currentBuildName = restoredBuild.kind;
    currentBuildColor = restoredBuild.color;
  }

  function clearBuildGroup() {
    if (!buildGroup) return;
    while (buildGroup.children.length) {
      var child = buildGroup.children[0];
      buildGroup.remove(child);
      child.traverse(function (o) { if (o.geometry) o.geometry.dispose(); });
    }
  }

  function restoreBuild(kind, color, show) {
    var b = BUILDERS[kind];
    if (!b || !buildGroup) return;
    currentBuildName = kind;
    currentBuildColor = color;
    clearBuildGroup();
    pendingParts = [];
    b.parts(color).forEach(function (part) {
      part.visible = true;
      part.scale.setScalar(1);
      buildGroup.add(part);
    });
    setStageMode(show ? 'build' : 'avatar');
    persistStudioState();
  }

  function finishPendingParts() {
    if (!buildGroup) return;
    while (pendingParts.length) {
      var part = pendingParts.shift();
      part.visible = true;
      part.scale.setScalar(1);
      buildGroup.add(part);
    }
    if (typeof onBuildDone === 'function') onBuildDone();
  }

  function onBuildDone() {
    var b = BUILDERS[currentBuildName];
    if (!b) return;
    persistStudioState();
    scoreNumEl.textContent = '3D';
    verdictTextEl.textContent = 'Построила: ' + b.name + '! ' + b.comment + ' Моделька останется в студии — файл .obj можно скачать и позже.';
  }

  function startBuild(kind) {
    var b = BUILDERS[kind];
    if (!b || !buildGroup) return;
    currentBuildName = kind;
    // сцену — начисто
    clearBuildGroup();
    pendingParts = [];
    setStageMode('build');
    var rnd = mulberry32((Date.now() % 2147483647) + kind.length * 131);
    currentBuildColor = HER_COLORS[Math.floor(rnd() * HER_COLORS.length)];
    pendingParts = b.parts(currentBuildColor);
    persistStudioState();
    scoreNumEl.textContent = '…';
    verdictTextEl.textContent = 'Строю ' + b.name + ' по частям… смотри, как растёт! Она останется здесь, даже если не скачаешь файл сразу.';
  }

  /* ---------- скачивание модельки (.obj) ---------- */

  function exportOBJ(root, filename) {
    var lines = ['# Моделька Квени — собрана в её 3D-студии', '# https://m98978672-boop.github.io/games/kvenya/'];
    var offset = 0;
    var v = new THREE.Vector3();
    root.updateMatrixWorld(true);
    root.traverse(function (o) {
      if (!o.isMesh) return;
      var pos = o.geometry.attributes.position;
      var idx = o.geometry.index;
      lines.push('o part');
      for (var i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
        lines.push('v ' + v.x.toFixed(4) + ' ' + v.y.toFixed(4) + ' ' + v.z.toFixed(4));
      }
      if (idx) {
        for (var f = 0; f < idx.count; f += 3) {
          lines.push('f ' + (offset + idx.getX(f) + 1) + ' ' + (offset + idx.getX(f + 1) + 1) + ' ' + (offset + idx.getX(f + 2) + 1));
        }
      } else {
        for (var f2 = 0; f2 < pos.count; f2 += 3) {
          lines.push('f ' + (offset + f2 + 1) + ' ' + (offset + f2 + 2) + ' ' + (offset + f2 + 3));
        }
      }
      offset += pos.count;
    });
    var blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }

  /* ---------- интерфейс ---------- */

  var verdictTextEl = document.getElementById('kvVerdictText');
  var scoreNumEl = document.getElementById('kvScoreNum');
  var candidatesEl = document.getElementById('kvCandidates');

  function hexCss(hex) { return '#' + hex.toString(16).padStart(6, '0'); }

  function verdictHtml(sc, prefix) {
    scoreNumEl.textContent = String(sc.total);
    verdictTextEl.textContent = '';
    var p = document.createElement('span');
    p.textContent = (prefix ? prefix + ' ' : '') + sc.verdict + ' ';
    verdictTextEl.appendChild(p);
    var r = document.createElement('span');
    r.className = 'kv-verdict-reasons';
    r.textContent = 'Почему: ' + sc.reasons.join('; ') + '.';
    verdictTextEl.appendChild(r);
  }

  function applyVariant(v, silent) {
    current = v;
    syncControls();
    if (studioReady) { buildAvatar(v); setStageMode('avatar'); }
    persistStudioState();
    if (!silent) {
      scoreNumEl.textContent = '—';
      verdictTextEl.textContent = 'Образ обновила! Нажми «Оцени мой вариант» — посмотрю в зеркало и скажу честно.';
    }
  }

  function renderCandidates(list, favIdx) {
    candidatesEl.textContent = '';
    var title = document.createElement('div');
    title.className = 'kv-cand-title';
    title.textContent = 'Варианты, которые собрала Квеня:';
    candidatesEl.appendChild(title);
    list.forEach(function (v, i) {
      var sc = scoreVariant(v);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'kv-cand' + (i === favIdx ? ' is-fav' : '');
      var dots = document.createElement('span');
      dots.className = 'kv-cand-dots';
      [byId(HAIR_COLORS, v.hair).hex, byId(DRESSES, v.dress).hex, byId(SKINS, v.skin).hex].forEach(function (hex) {
        var d = document.createElement('i');
        d.style.background = hexCss(hex);
        dots.appendChild(d);
      });
      btn.appendChild(dots);
      var txt = document.createElement('span');
      txt.className = 'kv-cand-txt';
      txt.textContent = sc.summary;
      btn.appendChild(txt);
      var score = document.createElement('b');
      score.className = 'kv-cand-score';
      score.textContent = (i === favIdx ? '❤️ ' : '') + sc.total;
      btn.appendChild(score);
      btn.addEventListener('click', function () {
        applyVariant(v, true);
        verdictHtml(scoreVariant(v), i === favIdx ? 'Это мой любимый вариант!' : 'Смотрю на этот вариант…');
        candidatesEl.querySelectorAll('.kv-cand').forEach(function (c) { c.classList.remove('is-fav'); });
        btn.classList.add('is-fav');
      });
      candidatesEl.appendChild(btn);
    });
  }

  function fillSelect(el, list) {
    if (!el) return;
    el.textContent = '';
    list.forEach(function (x) {
      var o = document.createElement('option');
      o.value = x.id;
      o.textContent = x.name;
      el.appendChild(o);
    });
  }

  var ctlHairColor = document.getElementById('kvCtlHairColor');
  var ctlHairLen = document.getElementById('kvCtlHairLen');
  var ctlDress = document.getElementById('kvCtlDress');
  var ctlSkin = document.getElementById('kvCtlSkin');
  var ctlAcc = document.getElementById('kvCtlAccessory');
  var ctlBuild = document.getElementById('kvCtlBuild');
  var ctlOutfit = document.getElementById('kvCtlOutfit');
  var ctlAnim = document.getElementById('kvCtlAnim');
  fillSelect(ctlHairColor, HAIR_COLORS);
  fillSelect(ctlHairLen, HAIR_LENS);
  fillSelect(ctlDress, DRESSES);
  fillSelect(ctlSkin, SKINS);
  fillSelect(ctlAcc, ACCESSORIES);
  fillSelect(ctlBuild, BODY_BUILDS);
  fillSelect(ctlOutfit, OUTFITS);
  fillSelect(ctlAnim, ANIMATIONS);

  function syncControls() {
    if (ctlHairColor) ctlHairColor.value = current.hair;
    if (ctlHairLen) ctlHairLen.value = current.len;
    if (ctlDress) ctlDress.value = current.dress;
    if (ctlSkin) ctlSkin.value = current.skin;
    if (ctlAcc) ctlAcc.value = current.acc;
    if (ctlBuild) ctlBuild.value = current.build || 'normal';
    if (ctlOutfit) ctlOutfit.value = current.outfit || 'dress';
    if (ctlAnim) ctlAnim.value = current.anim || 'breathe';
  }
  syncControls();

  function manualVariant() {
    return {
      skin: ctlSkin.value, hair: ctlHairColor.value, len: ctlHairLen.value,
      dress: ctlDress.value, acc: ctlAcc.value,
      build: ctlBuild ? ctlBuild.value : 'normal',
      outfit: ctlOutfit ? ctlOutfit.value : 'dress',
      anim: ctlAnim ? ctlAnim.value : 'breathe',
      seed: (current && current.seed) || 7
    };
  }
  [ctlHairColor, ctlHairLen, ctlDress, ctlSkin, ctlAcc, ctlBuild, ctlOutfit].forEach(function (ctl) {
    if (ctl) ctl.addEventListener('change', function () { applyVariant(manualVariant(), false); });
  });
  if (ctlAnim) {
    ctlAnim.addEventListener('change', function () {
      // Анимацию не надо пересобирать: просто включаем движение.
      current.anim = ctlAnim.value;
      currentAnim = ctlAnim.value;
      persistStudioState();
      verdictTextEl.textContent = 'Анимация включена: ' + byId(ANIMATIONS, currentAnim).name + '! Смотри на сцену — я двигаюсь. В файл .obj движение не уедет, он статичный.';
      scoreNumEl.textContent = '▶';
    });
  }

  document.getElementById('kvCreateSelf').addEventListener('click', function () {
    ensureStudio().then(function () {
      if (!studioReady) return;
      var rnd = mulberry32((Date.now() % 2147483647) + 17);
      var list = [randomVariant(rnd), randomVariant(rnd), randomVariant(rnd)];
      var scores = list.map(scoreVariant);
      var fav = 0;
      scores.forEach(function (s, i) { if (s.total > scores[fav].total) fav = i; });
      renderCandidates(list, fav);
      applyVariant(list[fav], true);
      verdictHtml(scores[fav], 'Я собрала три варианта, посмотрела на себя со всех сторон и выбрала этот!');
    });
  });

  document.getElementById('kvJudge').addEventListener('click', function () {
    ensureStudio().then(function () {
      if (!studioReady) return;
      applyVariant(manualVariant(), true);
      verdictHtml(scoreVariant(current), 'Так, смотрю в зеркало… кручусь…');
    });
  });

  var buildKindEl = document.getElementById('kvBuildKind');
  if (buildKindEl && restoredBuild) buildKindEl.value = restoredBuild.kind;
  document.getElementById('kvBuildBtn').addEventListener('click', function () {
    ensureStudio().then(function () {
      if (studioReady) startBuild(buildKindEl ? buildKindEl.value : 'house');
    });
  });
  document.getElementById('kvBuildRandom').addEventListener('click', function () {
    ensureStudio().then(function () {
      if (!studioReady) return;
      var kinds = Object.keys(BUILDERS);
      var kind = kinds[Math.floor(Math.random() * kinds.length)];
      if (buildKindEl) buildKindEl.value = kind;
      startBuild(kind);
      verdictTextEl.textContent = 'Сюрприз! Сама выбрала, что строить… смотри!';
    });
  });
  document.getElementById('kvDownloadBtn').addEventListener('click', function () {
    ensureStudio().then(function () {
      if (!studioReady) return;
      if (stageMode === 'build' && pendingParts.length) finishPendingParts();
      if (stageMode === 'build' && buildGroup && buildGroup.children.length) {
        exportOBJ(buildGroup, 'kvenya-build-' + (currentBuildName || 'scene') + '.obj');
        verdictTextEl.textContent = 'Моделька уехала к тебе файлом .obj! Открой её в Blender или просмотрщике 3D — и вспомни меня.';
      } else {
        exportOBJ(modelGroup, 'kvenya-model.obj');
        verdictTextEl.textContent = 'Моя фигурка уехала к тебе файлом .obj! Покрути её у себя — я не стесняюсь. Честно: поза в файле статичная, анимация осталась жить на сцене студии.';
      }
    });
  });
})();
