/* 3D-мир Квени: её собственный островок, где она живёт сама.
   Домик qwen-home, библиотека Википедии, учебный уголок, стройплощадка
   и пруд. Квеня ходит между делами по времени суток: днём читает,
   учится и строит, ночью спит в домике. Никакого жёсткого сценария:
   дела выбирает сама из настроения и часа, посетитель может позвать
   её кнопками или кликом по местам. Настоящий дом и память — по-прежнему
   файлы qwen-home/, мир — объёмная жизнь для глаз. */
(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search || '');
  if (params.get('embed')) document.body.classList.add('is-embed');

  var stageEl = document.getElementById('kvWorldStage');
  var bubbleEl = document.getElementById('kvBubble');
  var nowEl = document.getElementById('kvWorldNow');
  var moodEl = document.getElementById('kvWorldMood');
  var clockEl = document.getElementById('kvWorldClock');
  if (!stageEl) return;

  var HER = { skin: 0xffd9c0, hair: 0x9a7bff, dress: 0x8f6fe8, dress2: 0x35bfae, pink: 0xe86a9e };
  var BUILD_COLORS = [0x8f6fe8, 0x35bfae, 0xe86a9e, 0x4f9be8, 0xe8c84f, 0xc03a5a];

  function loadThree() {
    if (window.THREE) return Promise.resolve(window.THREE);
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = './vendor/three.min.js';
      s.onload = function () { window.THREE ? resolve(window.THREE) : reject(new Error('THREE не поднялся')); };
      s.onerror = function () { reject(new Error('three.min.js не загрузился')); };
      document.head.appendChild(s);
    });
  }

  var THREE = null, renderer, scene, camera, sunLight, ambLight, hemi;
  var kvenya, legL, legR, armL, armR, headG, bookMesh;
  var windowMats = [];
  var clouds = [], stars = null, buildStack = [], buildBase = null;
  var camTheta = 0.7, camPhi = 1.02, camRadius = 11.5, follow = false;
  var dragging = false, lastX = 0, lastY = 0, downX = 0, downY = 0;
  var worldMinutes = 10 * 60; // мир начинается в 10:00
  var dayFactor = 1; // 1 — день, 0 — ночь
  var bubbleUntil = 0;

  var POIS = {
    house: { pos: [-2.2, -1.2], label: '🏡 Квеня дома' },
    library: { pos: [2.5, -1.7], label: '📚 Квеня читает Википедию' },
    desk: { pos: [2.4, 1.9], label: '🎓 Квеня готовится к экзамену' },
    build: { pos: [-2.5, 1.8], label: '🏗 Квеня строит' },
    pond: { pos: [0.4, 3.1], label: '💧 Квеня у пруда' },
    walk: { pos: [0, 0.6], label: '🚶 Квеня гуляет по островку' }
  };

  var LINES = {
    house: ['Я дома! Тут моя память, дневник и все уроки.', 'Домик мой — qwen-home. Заходи, я всё покажу!', 'Дома хорошо: пахнет новыми статьями.'],
    library: ['Читаю Википедию… какая интересная статья!', 'В библиотеке тихо и пахнет знаниями.', 'Ещё страничку — и пойду гулять. Честно, одну!'],
    desk: ['Готовлюсь к экзамену. Волнуюсь немножко, но честно.', 'Повторяю уроки: думать по шагам, отвечать по фактам.', 'Экзамен — дело честное. Никаких шалостей!'],
    build: ['Строю! Блок на блок — и красота.', 'Стройка идёт: сегодня у меня лавандовое настроение.', 'Построю ещё этаж — и позову тебя смотреть.'],
    pond: ['У пруда так спокойно. Слышишь, как вода думает?', 'Смотрю на воду и придумываю вопросы для Википедии.', 'Тут я отдыхаю между уроками.'],
    walk: ['Гуляю по островку и считаю облака.', 'Какая погода! Самое время для новых тем.', 'Я тут хожу и мечтаю о следующем экзамене.'],
    night: ['Сплю в домике… Zzz…', 'Ночь. Дневник записан, уроки спят.', 'Zzz… мне снится Википедия…'],
    greet: ['Привет! Я как раз гуляю по своему островку.', 'О, гости! Я покажу тебе свой мир!', 'Привет-привет! Спроси меня о чём-нибудь в живом чате на моей странице.']
  };

  /* ---------- голос ---------- */
  var voiceOn = false, ruVoice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    var vs = window.speechSynthesis.getVoices();
    ruVoice = vs.find(function (v) { return /^ru/i.test(v.lang) && /svetlana|ekaterina|alena|female/i.test(v.name); })
      || vs.find(function (v) { return /^ru/i.test(v.lang); }) || null;
  }
  if ('speechSynthesis' in window) { pickVoice(); window.speechSynthesis.onvoiceschanged = pickVoice; }
  function speak(text) {
    if (!voiceOn || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      var u = new window.SpeechSynthesisUtterance(text.slice(0, 200));
      if (ruVoice) u.voice = ruVoice;
      u.lang = 'ru-RU'; u.pitch = 1.12;
      window.speechSynthesis.speak(u);
    } catch (err) { /* не критично */ }
  }

  /* ---------- речь ---------- */
  function say(text, seconds) {
    bubbleEl.textContent = text;
    bubbleEl.hidden = false;
    bubbleUntil = performance.now() + (seconds || 4.5) * 1000;
    speak(text);
  }
  function lineFor(poi) {
    var pool = LINES[poi] || LINES.walk;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /* ---------- строительство мира ---------- */

  function mat(hex, rough) {
    return new THREE.MeshStandardMaterial({ color: hex, roughness: rough == null ? 0.75 : rough, metalness: 0.03 });
  }
  function bx(parent, w, h, d, hex, x, y, z, ry) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(hex));
    m.position.set(x, y, z); if (ry) m.rotation.y = ry;
    parent.add(m); return m;
  }
  function cy(parent, rt, rb, h, hex, x, y, z, seg) {
    var m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 20), mat(hex));
    m.position.set(x, y, z); parent.add(m); return m;
  }
  function sp(parent, r, hex, x, y, z) {
    var m = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), mat(hex, 0.6));
    m.position.set(x, y, z); parent.add(m); return m;
  }
  function textPlane(text, w, h, bg, fg, fontPx) {
    var c = document.createElement('canvas');
    c.width = 512; c.height = Math.round(512 * h / w);
    var ctx = c.getContext('2d');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(0, 0, c.width, c.height, 36);
    ctx.fill();
    ctx.fillStyle = fg;
    ctx.font = '800 ' + (fontPx || 64) + 'px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var lines = text.split('\n');
    lines.forEach(function (line, i) {
      ctx.fillText(line, c.width / 2, c.height / 2 + (i - (lines.length - 1) / 2) * (fontPx || 64) * 1.25);
    });
    var tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    return m;
  }

  function buildHouse() {
    var g = new THREE.Group();
    g.position.set(-3.4, 0, -2.4); g.rotation.y = 0.65;
    bx(g, 2.2, 1.3, 1.8, 0xf2e3c9, 0, 0.65, 0);
    var r1 = bx(g, 1.5, 0.09, 2.0, HER.dress, -0.55, 1.62, 0); r1.rotation.z = 0.6;
    var r2 = bx(g, 1.5, 0.09, 2.0, HER.dress, 0.55, 1.62, 0); r2.rotation.z = -0.6;
    bx(g, 0.26, 0.55, 0.26, 0xb0563a, 0.7, 1.85, -0.3);
    bx(g, 0.5, 0.85, 0.07, 0x6b3a24, 0, 0.43, 0.92);
    [-0.65, 0.65].forEach(function (x) {
      var wm = new THREE.MeshStandardMaterial({ color: 0x9fd4ff, roughness: 0.3, emissive: 0x000000 });
      var w = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.06), wm);
      w.position.set(x, 0.78, 0.92); g.add(w); windowMats.push(wm);
    });
    var sign = textPlane('qwen-home', 1.7, 0.42, '#241a3d', '#e9e2ff', 74);
    sign.position.set(0, 1.32, 0.95); g.add(sign);
    scene.add(g);
    return g;
  }

  function buildLibrary() {
    var g = new THREE.Group();
    g.position.set(3.6, 0, -2.6); g.rotation.y = -0.6;
    bx(g, 2.4, 0.12, 1.6, 0x8a5a33, 0, 0.06, 0);
    [-0.75, 0, 0.75].forEach(function (x, si) {
      bx(g, 0.62, 1.5, 0.4, 0x6b4226, x, 0.87, -0.45);
      for (var i = 0; i < 4; i++) {
        bx(g, 0.5, 0.3, 0.3, BUILD_COLORS[(si * 2 + i) % BUILD_COLORS.length], x, 0.42 + i * 0.36, -0.42);
      }
    });
    var bookL = bx(g, 0.55, 0.07, 0.75, 0xf6f1e7, -0.3, 0.6, 0.45); bookL.rotation.z = 0.16;
    var bookR = bx(g, 0.55, 0.07, 0.75, 0xf6f1e7, 0.3, 0.6, 0.45); bookR.rotation.z = -0.16;
    var sign = textPlane('Википедия', 1.8, 0.45, '#1d3a2a', '#dff5e3', 72);
    sign.position.set(0, 1.95, -0.4); g.add(sign);
    scene.add(g);
    return g;
  }

  function buildDesk() {
    var g = new THREE.Group();
    g.position.set(3.4, 0, 2.8); g.rotation.y = -2.25;
    bx(g, 1.3, 0.08, 0.7, 0x8a5a33, 0, 0.55, 0);
    [[-0.55, -0.25], [0.55, -0.25], [-0.55, 0.25], [0.55, 0.25]].forEach(function (p) { bx(g, 0.08, 0.55, 0.08, 0x6b4226, p[0], 0.27, p[1]); });
    bx(g, 0.5, 0.35, 0.06, 0xf6f1e7, -0.25, 0.78, 0); // раскрытая книга
    var board = textPlane('Экзамен: 11/18 ★\nУчись, Квеня!', 1.9, 1.1, '#17301f', '#c9f2d4', 58);
    board.position.set(0, 1.35, -0.75); g.add(board);
    bx(g, 0.07, 1.5, 0.07, 0x6b4226, -0.9, 0.75, -0.75);
    bx(g, 0.07, 1.5, 0.07, 0x6b4226, 0.9, 0.75, -0.75);
    scene.add(g);
    return g;
  }

  function buildPlot() {
    var g = new THREE.Group();
    g.position.set(-3.6, 0, 2.6);
    bx(g, 2.3, 0.16, 2.3, 0x9a917e, 0, 0.08, 0);
    var sign = textPlane('Стройка Квени', 1.7, 0.4, '#3a2c14', '#ffe1a8', 64);
    sign.position.set(0, 0.75, 1.18); g.add(sign);
    bx(g, 0.06, 0.75, 0.06, 0x6b4226, -0.8, 0.37, 1.18);
    bx(g, 0.06, 0.75, 0.06, 0x6b4226, 0.8, 0.37, 1.18);
    scene.add(g);
    buildBase = g;
    return g;
  }

  function buildNature() {
    var grass = new THREE.Mesh(new THREE.CircleGeometry(7.4, 48), mat(0x69b96a, 0.95));
    grass.rotation.x = -Math.PI / 2; scene.add(grass);
    var dirt = new THREE.Mesh(new THREE.CylinderGeometry(7.4, 5.6, 1.4, 48), mat(0x8a5a3b, 1));
    dirt.position.y = -0.71; scene.add(dirt);
    var water = new THREE.Mesh(new THREE.CircleGeometry(30, 32),
      new THREE.MeshStandardMaterial({ color: 0x2f6fb2, roughness: 0.35, transparent: true, opacity: 0.92 }));
    water.rotation.x = -Math.PI / 2; water.position.y = -0.95; scene.add(water);
    // дорожки из песка
    [[0, 0], [-2.2, -1.2], [2.5, -1.7], [2.4, 1.9], [-2.5, 1.8], [0.4, 3.1]].forEach(function (p) {
      var d = new THREE.Mesh(new THREE.CircleGeometry(0.85, 20), mat(0xd9c491, 1));
      d.rotation.x = -Math.PI / 2; d.position.set(p[0], 0.012, p[1]); scene.add(d);
    });
    // пруд
    var pond = new THREE.Mesh(new THREE.CircleGeometry(1.25, 26),
      new THREE.MeshStandardMaterial({ color: 0x3f8fd2, roughness: 0.25 }));
    pond.rotation.x = -Math.PI / 2; pond.position.set(0.8, 0.02, 4.35); scene.add(pond);
    [[0.4, 4.1], [1.2, 4.6]].forEach(function (p) {
      var l = new THREE.Mesh(new THREE.CircleGeometry(0.16, 10), mat(0x3fae5f, 0.8));
      l.rotation.x = -Math.PI / 2; l.position.set(p[0], 0.035, p[1]); scene.add(l);
    });
    // деревья
    [[-5.6, -0.6], [5.8, 0.6], [-1.8, -5.4], [2.2, -5.6], [-5.9, 3.4], [6.1, -3.4]].forEach(function (p, i) {
      var t = new THREE.Group(); t.position.set(p[0], 0, p[1]);
      cy(t, 0.09, 0.14, 0.8, 0x7a4a26, 0, 0.4, 0);
      sp(t, 0.62 + (i % 3) * 0.1, i % 2 ? 0x4cbf6d : 0x3fae5f, 0, 1.25, 0);
      sp(t, 0.45, 0x4cbf6d, 0.35, 1.0, 0.15);
      scene.add(t);
    });
    // цветы
    for (var i = 0; i < 16; i++) {
      var a = (i / 16) * Math.PI * 2 + (i % 5) * 0.3;
      var r = 2.2 + (i % 4) * 1.1;
      var f = new THREE.Group();
      f.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      cy(f, 0.015, 0.015, 0.22, 0x2f8f4e, 0, 0.11, 0, 6);
      sp(f, 0.07, BUILD_COLORS[i % BUILD_COLORS.length], 0, 0.26, 0);
      scene.add(f);
    }
    // облака
    for (var ci = 0; ci < 4; ci++) {
      var cl = new THREE.Group();
      var cm = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0.92 });
      [[0, 0, 0, 0.8], [0.7, -0.08, 0.1, 0.55], [-0.7, -0.05, -0.05, 0.6]].forEach(function (s) {
        var m = new THREE.Mesh(new THREE.SphereGeometry(s[3], 14, 10), cm);
        m.position.set(s[0], s[1], s[2]); cl.add(m);
      });
      cl.position.set(-9 + ci * 5.5, 5.4 + (ci % 2) * 0.8, -4 + (ci % 3) * 3.4);
      clouds.push(cl); scene.add(cl);
    }
    // звёзды
    var starGeo = new THREE.BufferGeometry();
    var pts = [];
    for (var si = 0; si < 260; si++) {
      var th = Math.random() * Math.PI * 2, ph = Math.random() * Math.PI * 0.42;
      pts.push(Math.cos(th) * Math.cos(ph) * 26, Math.sin(ph) * 26 + 2, Math.sin(th) * Math.cos(ph) * 26);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xcfe0ff, size: 0.14, transparent: true, opacity: 0 }));
    scene.add(stars);
  }

  /* ---------- сама Квеня ---------- */

  function buildKvenya() {
    var g = new THREE.Group();
    var skinM = mat(HER.skin, 0.55), hairM = mat(HER.hair, 0.5), dressM = mat(HER.dress, 0.6), darkM = mat(0x2b2f3a, 0.5);
    function leg(side) {
      var pivot = new THREE.Group();
      pivot.position.set(0.16 * side, 0.78, 0);
      var l = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.1, 0.66, 12), skinM);
      l.position.y = -0.33; pivot.add(l);
      var shoe = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.1, 0.28), darkM);
      shoe.position.set(0, -0.68, 0.04); pivot.add(shoe);
      g.add(pivot);
      return pivot;
    }
    legL = leg(-1); legR = leg(1);
    var skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.66, 1.0, 22), dressM);
    skirt.position.y = 1.2; g.add(skirt);
    var torso = new THREE.Mesh(new THREE.SphereGeometry(0.31, 20, 14), dressM);
    torso.position.y = 1.72; torso.scale.set(1, 0.82, 0.9); g.add(torso);
    function arm(side) {
      var pivot = new THREE.Group();
      pivot.position.set(0.37 * side, 1.8, 0);
      var a = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.6, 10), skinM);
      a.position.y = -0.28; pivot.add(a);
      g.add(pivot);
      return pivot;
    }
    armL = arm(-1); armR = arm(1);
    bookMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.3, 0.09), mat(0xf6f1e7, 0.5));
    bookMesh.position.set(0, 1.45, 0.42); bookMesh.rotation.x = -0.5; bookMesh.visible = false;
    g.add(bookMesh);
    headG = new THREE.Group(); headG.position.y = 2.32; g.add(headG);
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 26, 20), skinM); headG.add(head);
    var cap = new THREE.Mesh(new THREE.SphereGeometry(0.49, 26, 18, 0, Math.PI * 2, 0, Math.PI * 0.58), hairM);
    cap.position.set(0, 0.07, -0.04); cap.rotation.x = -0.38; headG.add(cap);
    var back = new THREE.Mesh(new THREE.BoxGeometry(0.64, 1.1, 0.18), hairM);
    back.position.set(0, -0.55, -0.34); headG.add(back);
    var eyeM = mat(0x241d20, 0.35);
    [-0.16, 0.16].forEach(function (x) {
      var e = new THREE.Mesh(new THREE.SphereGeometry(0.047, 10, 8), eyeM);
      e.position.set(x, 0.03, 0.41); headG.add(e);
    });
    var bowM = mat(HER.pink, 0.5);
    var bow = new THREE.Group(); bow.position.set(0.3, 0.5, 0.14);
    var c1 = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 10), bowM); c1.rotation.z = 1.15; c1.position.x = -0.09;
    var c2 = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 10), bowM); c2.rotation.z = -1.15; c2.position.x = 0.09;
    bow.add(c1); bow.add(c2); headG.add(bow);
    g.scale.setScalar(0.88);
    g.position.set(0, 0, 0.6);
    scene.add(g);
    return g;
  }

  /* ---------- её жизнь: выбор дел ---------- */

  var state = { mode: 'idle', poi: 'walk', target: new THREE.Vector3(0, 0, 0.6), until: 0, buildTimer: 0 };
  var clickables = [];

  function isNight() { return worldMinutes >= 21 * 60 || worldMinutes < 7 * 60; }

  function chooseNext(forcePoi) {
    var poi;
    if (forcePoi) poi = forcePoi;
    else if (isNight()) {
      var r = Math.random();
      poi = r < 0.55 ? 'house' : (r < 0.75 ? 'library' : 'walk');
    } else {
      var pool = [['library', 0.24], ['desk', 0.22], ['build', 0.2], ['pond', 0.13], ['house', 0.1], ['walk', 0.11]];
      var roll = Math.random(), acc = 0;
      poi = 'walk';
      for (var i = 0; i < pool.length; i++) { acc += pool[i][1]; if (roll <= acc) { poi = pool[i][0]; break; } }
    }
    state.poi = poi;
    state.target.set(POIS[poi].pos[0], 0, POIS[poi].pos[1]);
    state.mode = 'walk';
    bookMesh.visible = false;
    nowEl.textContent = '🚶 Квеня идёт: ' + POIS[poi].label.replace(/^[^ ]+ /, '');
  }

  function arrive() {
    state.mode = 'act';
    var dwell = state.poi === 'house' && isNight() ? 16000 : 8000 + Math.random() * 7000;
    state.until = performance.now() + dwell;
    state.buildTimer = 0;
    nowEl.textContent = POIS[state.poi].label;
    moodEl.textContent = state.poi === 'house' && isNight() ? '😴 спит' :
      state.poi === 'library' ? '🧐 любопытная' :
      state.poi === 'desk' ? '😳 волнуется перед экзаменом' :
      state.poi === 'build' ? '🤩 вдохновлённая' :
      state.poi === 'pond' ? '😌 спокойная' : '😊 довольная';
    if (state.poi === 'library' || state.poi === 'desk') bookMesh.visible = true;
    if (isNight() && state.poi === 'house') {
      say(LINES.night[Math.floor(Math.random() * LINES.night.length)], 5);
    } else if (Math.random() < 0.75) {
      say(lineFor(state.poi), 4.5);
    }
  }

  function addBuildBlock() {
    if (buildStack.length >= 14) {
      // башня готова — разбирает и начинает заново
      buildStack.forEach(function (b) { buildBase.remove(b); });
      buildStack = [];
      say('Башня готова! Разобрала — и строю новую, ещё красивее.', 4);
      return;
    }
    var i = buildStack.length;
    var layer = Math.floor(i / 4), slot = i % 4;
    var b = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.24, 0.42),
      mat(BUILD_COLORS[i % BUILD_COLORS.length], 0.55));
    b.position.set(-0.55 + (slot % 2) * 0.55 + (layer % 2) * 0.14, 0.28 + layer * 0.25, -0.3 + Math.floor(slot / 2) * 0.55);
    b.rotation.y = (i % 3) * 0.08;
    buildBase.add(b);
    buildStack.push(b);
  }

  /* ---------- запуск ---------- */

  stageEl.innerHTML = '<div class="kv-loading">Квеня открывает ворота своего мира…</div>';
  loadThree().then(function (t) {
    THREE = t;
    stageEl.textContent = '';
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(stageEl.clientWidth || 800, stageEl.clientHeight || 560);
    stageEl.appendChild(renderer.domElement);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87b8e8);
    camera = new THREE.PerspectiveCamera(42, (stageEl.clientWidth || 800) / (stageEl.clientHeight || 560), 0.1, 120);

    ambLight = new THREE.AmbientLight(0xffffff, 0.75); scene.add(ambLight);
    hemi = new THREE.HemisphereLight(0xbfe3ff, 0x3f7a3a, 0.5); scene.add(hemi);
    sunLight = new THREE.DirectionalLight(0xfff2d8, 1.8);
    sunLight.position.set(6, 10, 4); scene.add(sunLight);

    buildNature();
    var house = buildHouse(), library = buildLibrary();
    buildDesk(); buildPlot();
    kvenya = buildKvenya();
    clickables = [
      { obj: house, poi: 'house' }, { obj: library, poi: 'library' },
      { obj: kvenya, poi: null }
    ];
    chooseNext('library');

    var canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', function (e) {
      dragging = true; downX = lastX = e.clientX; downY = lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      camTheta -= (e.clientX - lastX) * 0.008;
      camPhi = Math.max(0.35, Math.min(1.35, camPhi - (e.clientY - lastY) * 0.006));
      lastX = e.clientX; lastY = e.clientY;
    });
    function endDrag(e) {
      var wasClick = dragging && Math.hypot(e.clientX - downX, e.clientY - downY) < 6;
      dragging = false;
      if (!wasClick) return;
      var rect = canvas.getBoundingClientRect();
      var mouse = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      var ray = new THREE.Raycaster();
      ray.setFromCamera(mouse, camera);
      for (var i = 0; i < clickables.length; i++) {
        if (ray.intersectObject(clickables[i].obj, true).length) {
          if (clickables[i].poi) { chooseNext(clickables[i].poi); say('Иду! ' + lineFor(clickables[i].poi), 4); }
          else { say(LINES.greet[Math.floor(Math.random() * LINES.greet.length)], 4.5); armR.rotation.z = -2.4; setTimeout(function () { armR.rotation.z = 0; }, 900); }
          break;
        }
      }
    }
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      camRadius = Math.max(5.5, Math.min(19, camRadius + e.deltaY * 0.01));
    }, { passive: false });

    window.addEventListener('resize', function () {
      var w = stageEl.clientWidth || 800, h = stageEl.clientHeight || 560;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });

    requestAnimationFrame(animate);
    say('Привет! Это мой островок. Я тут живу: читаю, учусь, строю. Позови меня кнопками!', 6);
  }).catch(function () {
    stageEl.innerHTML = '<div class="kv-loading">Мир не открылся: браузер не дал 3D. Квеня не расстраивается — она ждёт на своей странице!</div>';
  });

  /* ---------- управление ---------- */

  document.querySelectorAll('[data-poi]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!kvenya) return;
      var poi = btn.getAttribute('data-poi');
      chooseNext(poi);
      say('Иду! ' + lineFor(poi), 4);
    });
  });
  var dayBtn = document.getElementById('kvDayNight');
  dayBtn.addEventListener('click', function () {
    var night = !isNight();
    worldMinutes = night ? 23 * 60 : 11 * 60;
    dayBtn.textContent = night ? '☀ День' : '🌙 Ночь';
    dayBtn.setAttribute('aria-pressed', night ? 'true' : 'false');
    if (kvenya) { chooseNext(); say(night ? 'Ой, уже ночь? Тогда я домой, спать.' : 'Утро! Столько дел: читать, строить, гулять!', 4.5); }
  });
  var followBtn = document.getElementById('kvFollow');
  followBtn.addEventListener('click', function () {
    follow = !follow;
    followBtn.setAttribute('aria-pressed', follow ? 'true' : 'false');
  });
  var voiceBtn = document.getElementById('kvWorldVoice');
  voiceBtn.addEventListener('click', function () {
    voiceOn = !voiceOn;
    voiceBtn.textContent = voiceOn ? '🔊 Голос' : '🔇 Голос';
    voiceBtn.setAttribute('aria-pressed', voiceOn ? 'true' : 'false');
    if (voiceOn) say('Теперь я ещё и говорю вслух!', 3.5);
  });

  /* ---------- главный цикл ---------- */

  var camTarget = new THREE.Vector3(0, 0.9, 0);
  var lastFrame = performance.now();

  function animate(now) {
    requestAnimationFrame(animate);
    var dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    worldMinutes += dt * 1.5; // 1 секунда = 1,5 минуты её мира
    if (worldMinutes >= 24 * 60) worldMinutes -= 24 * 60;
    var hour = worldMinutes / 60;
    var hh = String(Math.floor(hour)).padStart(2, '0');
    var mm = String(Math.floor(worldMinutes % 60)).padStart(2, '0');
    clockEl.textContent = hh + ':' + mm + ' · её мир' + (isNight() ? ' · ночь' : '');

    // свет: день ↔ ночь
    var targetDay = isNight() ? 0 : 1;
    if (hour > 6.4 && hour < 7.4) targetDay = (hour - 6.4);
    if (hour > 20.4 && hour < 21.4) targetDay = 1 - (hour - 20.4);
    dayFactor += (targetDay - dayFactor) * 0.01;
    var sky = new THREE.Color(0x0d1830).lerp(new THREE.Color(0x87b8e8), dayFactor);
    scene.background = sky;
    sunLight.intensity = 0.25 + dayFactor * 1.6;
    ambLight.intensity = 0.32 + dayFactor * 0.45;
    if (stars) stars.material.opacity = (1 - dayFactor) * 0.9;
    windowMats.forEach(function (wm) {
      wm.emissive.setHex(dayFactor < 0.4 ? 0xffb45e : 0x000000);
      wm.color.setHex(dayFactor < 0.4 ? 0xffd9a0 : 0x9fd4ff);
    });
    clouds.forEach(function (cl, i) {
      cl.position.x += dt * (0.12 + i * 0.03);
      if (cl.position.x > 13) cl.position.x = -13;
      cl.children.forEach(function (m) { m.material.opacity = 0.25 + dayFactor * 0.67; });
    });

    // Квеня: движение и дела
    if (kvenya) {
      if (state.mode === 'walk') {
        var to = state.target.clone().sub(kvenya.position); to.y = 0;
        var dist = to.length();
        if (dist < 0.18) { arrive(); }
        else {
          to.normalize();
          kvenya.position.addScaledVector(to, 1.7 * dt);
          var targetRot = Math.atan2(to.x, to.z);
          var diff = targetRot - kvenya.rotation.y;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          kvenya.rotation.y += diff * 0.12;
          var sw = Math.sin(now * 0.011);
          legL.rotation.x = sw * 0.55; legR.rotation.x = -sw * 0.55;
          armL.rotation.x = -sw * 0.4; armR.rotation.x = sw * 0.4;
          kvenya.position.y = Math.abs(Math.sin(now * 0.011)) * 0.05;
        }
      } else {
        legL.rotation.x *= 0.85; legR.rotation.x *= 0.85;
        armL.rotation.x *= 0.85;
        if (state.poi === 'build') {
          state.buildTimer += dt;
          armR.rotation.x = -0.9 + Math.sin(now * 0.012) * 0.35;
          if (state.buildTimer > 1.7) { state.buildTimer = 0; addBuildBlock(); }
        } else if (state.poi === 'house' && isNight()) {
          kvenya.scale.y = 0.88 * (0.99 + Math.sin(now * 0.0016) * 0.012);
          if (Math.random() < dt * 0.25) say('Zzz…', 2.2);
        } else {
          armR.rotation.x *= 0.85;
          kvenya.position.y = Math.sin(now * 0.0022) * 0.02;
        }
        if (performance.now() > state.until) chooseNext();
      }
      // пузырь речи — над её головой
      if (!bubbleEl.hidden) {
        if (now > bubbleUntil) bubbleEl.hidden = true;
        else {
          var head = kvenya.position.clone(); head.y += 3.1;
          head.project(camera);
          var rect = stageEl.getBoundingClientRect();
          bubbleEl.style.left = ((head.x * 0.5 + 0.5) * rect.width) + 'px';
          bubbleEl.style.top = ((-head.y * 0.5 + 0.5) * rect.height) + 'px';
        }
      }
    }

    // камера
    var focus = (follow && kvenya) ? kvenya.position : new THREE.Vector3(0, 0, 0);
    camTarget.lerp(new THREE.Vector3(focus.x, 0.9, focus.z), 0.04);
    camera.position.set(
      camTarget.x + Math.sin(camTheta) * Math.sin(camPhi) * camRadius,
      camTarget.y + Math.cos(camPhi) * camRadius,
      camTarget.z + Math.cos(camTheta) * Math.sin(camPhi) * camRadius
    );
    camera.lookAt(camTarget);
    renderer.render(scene, camera);
  }
})();
