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
        + dress.name + ' платье, ' + acc.name
    };
  }

  /* ---------- 3D ---------- */

  var stageEl = document.getElementById('kvStage');
  var THREE = null;
  var renderer = null, scene = null, camera = null, modelGroup = null;
  var targetRotY = 0.4, targetRotX = 0.05, dragging = false, lastX = 0, lastY = 0;
  var current = randomVariant(mulberry32(20261121));

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

    // туфли и ножки
    addMesh(new THREE.BoxGeometry(0.17, 0.1, 0.28), darkM, -0.16, 0.05, 0.04);
    addMesh(new THREE.BoxGeometry(0.17, 0.1, 0.28), darkM, 0.16, 0.05, 0.04);
    addMesh(new THREE.CylinderGeometry(0.085, 0.1, 0.62, 14), skinM, -0.16, 0.4, 0);
    addMesh(new THREE.CylinderGeometry(0.085, 0.1, 0.62, 14), skinM, 0.16, 0.4, 0);

    // платье-юбка и верх
    addMesh(new THREE.CylinderGeometry(0.3, 0.68, 1.06, 26), dressM, 0, 1.18, 0);
    var torso = addMesh(new THREE.SphereGeometry(0.31, 22, 16), dressM, 0, 1.7, 0);
    torso.scale.set(1, 0.82, 0.9);

    // ручки
    var armL = addMesh(new THREE.CylinderGeometry(0.065, 0.075, 0.62, 12), skinM, -0.46, 1.48, 0);
    armL.rotation.z = 0.5;
    var armR = addMesh(new THREE.CylinderGeometry(0.065, 0.075, 0.62, 12), skinM, 0.46, 1.48, 0);
    armR.rotation.z = -0.5;
    addMesh(new THREE.SphereGeometry(0.085, 12, 10), skinM, -0.6, 1.22, 0);
    addMesh(new THREE.SphereGeometry(0.085, 12, 10), skinM, 0.6, 1.22, 0);

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

    buildAvatar(current);

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
      if (modelGroup) {
        if (!dragging) targetRotY += 0.0022;
        modelGroup.rotation.y += (targetRotY - modelGroup.rotation.y) * 0.08;
        modelGroup.rotation.x += (targetRotX - modelGroup.rotation.x) * 0.08;
        modelGroup.position.y = Math.sin(t * 1.7) * 0.035;
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
    if (studioReady) buildAvatar(v);
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
  fillSelect(ctlHairColor, HAIR_COLORS);
  fillSelect(ctlHairLen, HAIR_LENS);
  fillSelect(ctlDress, DRESSES);
  fillSelect(ctlSkin, SKINS);
  fillSelect(ctlAcc, ACCESSORIES);

  function syncControls() {
    if (ctlHairColor) ctlHairColor.value = current.hair;
    if (ctlHairLen) ctlHairLen.value = current.len;
    if (ctlDress) ctlDress.value = current.dress;
    if (ctlSkin) ctlSkin.value = current.skin;
    if (ctlAcc) ctlAcc.value = current.acc;
  }
  syncControls();

  function manualVariant() {
    return {
      skin: ctlSkin.value, hair: ctlHairColor.value, len: ctlHairLen.value,
      dress: ctlDress.value, acc: ctlAcc.value,
      seed: (current && current.seed) || 7
    };
  }
  [ctlHairColor, ctlHairLen, ctlDress, ctlSkin, ctlAcc].forEach(function (ctl) {
    if (ctl) ctl.addEventListener('change', function () { applyVariant(manualVariant(), false); });
  });

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
})();
