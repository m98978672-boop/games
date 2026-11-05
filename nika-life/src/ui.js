/* =============================================================================
   НИКА: ЖИВАЯ — интерфейс (HUD, чат, галерея анимаций, гардероб, тело, жизнь)
   ============================================================================= */
(function (root) {
  'use strict';
  const NIKA = (root.NIKA = root.NIKA || {});
  const anim = NIKA.anim, data = NIKA.data, ai = NIKA.ai, world = NIKA.world;
  const assets = NIKA.assets, mesh = NIKA.mesh, skills = NIKA.skills, net = NIKA.net;
  const $ = function (id) { return document.getElementById(id); };

  const QUICK = [
    'Привет!', 'Переоденься в синее платье', 'Помаши рукой', 'Покажи все анимации',
    'Прими ванну', 'Иди спать', 'Поработай', 'Поговори со мной',
    'Сходи в туалет', 'Помоги мне', 'Как дела?', 'Живи сама',
    'Сама выбери наряд', 'Запомни: крутись волчком = станцуй',
    'Сделай комплимент', 'Покажи точки тела', 'Покажи бельё', 'Обучение из интернета',
  ];
  const NEED_LABELS = {
    energy: 'Энергия', hunger: 'Сытость', mood: 'Настроение',
    hygiene: 'Гигиена', fitness: 'Форма', health: 'Здоровье', bladder: 'Комфорт', money: 'Деньги',
  };
  const SLIDERS = [
    ['headTilt', 'Наклон головы', -30, 30, 1], ['headNod', 'Кивок головы', -25, 25, 1],
    ['headTurn', 'Поворот головы', -35, 35, 1], ['torsoLean', 'Наклон корпуса', -30, 30, 1],
    ['shoulderL', 'Плечо лев.', 0, 180, 1], ['elbowL', 'Локоть лев.', 0, 140, 1],
    ['shoulderR', 'Плечо прав.', 0, 180, 1], ['elbowR', 'Локоть прав.', 0, 140, 1],
    ['hipL', 'Бедро лев.', -50, 70, 1], ['kneeL', 'Колено лев.', 0, 100, 1],
    ['hipR', 'Бедро прав.', -50, 70, 1], ['kneeR', 'Колено прав.', 0, 100, 1],
    ['skirtSway', 'Подол', -35, 35, 1], ['smile', 'Улыбка', -1, 1, 0.05],
    ['blink', 'Моргание', 0, 1, 0.05], ['hairSway', 'Волосы', -25, 25, 1],
    ['hairGloss', 'Блеск волос', 0, 1, 0.05], ['lash', 'Ресницы', 0, 1, 0.05],
    ['browArch', 'Изгиб бровей', -1, 1, 0.05], ['lipPout', 'Губки', 0, 1, 0.05],
    ['freckle', 'Веснушки', 0, 1, 0.05], ['skinGlow', 'Сияние кожи', 0, 1, 0.05],
    ['neckTilt', 'Наклон шеи', -15, 15, 1], ['fingerSpreadR', 'Пальцы правой', 0, 1, 0.05],
    ['footPointR', 'Носочек правой', -1, 1, 0.05],
    /* v1.2: осанка, дыхание, женственный силуэт, слои одежды */
    ['shoulderShrug', 'Пожатие плеч', -20, 20, 1], ['spineBend', 'Изгиб спины', -20, 20, 1],
    ['chestLift', 'Подъём груди', -15, 15, 1], ['hipTwist', 'Поворот бёдер', -30, 30, 1],
    ['wristTwistR', 'Запястье прав.', -60, 60, 1], ['breath', 'Дыхание', -25, 25, 1],
    ['gazeX', 'Взгляд по X', -1, 1, 0.05], ['gazeY', 'Взгляд по Y', -1, 1, 0.05],
    ['poseArch', 'Прогиб позы', -20, 20, 1], ['armCross', 'Руки скрестно', 0, 1, 0.05],
    ['headDuck', 'Опустить голову', -20, 20, 1], ['bustLift', 'Контур под тканью', -10, 10, 1],
    ['waistTwist', 'Поворот талии', -25, 25, 1], ['layerReveal', 'Нижний слой', 0, 1, 0.05],
    ['hemSpin', 'Вращение подола', -30, 30, 1],
  ];

  function createUI(app) {
    let soundOn = true, audioCtx = null;
    let selectedColor = null;
    let lastPart = 'head';
    let wardrobeSignature = '';
    let lastRefresh = 0;
    const modalRoot = $('modal-root');

    /* ---------- звук ---------- */
    function beep(kind) {
      if (!soundOn) return;
      try {
        audioCtx = audioCtx || new (root.AudioContext || root.webkitAudioContext)();
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = kind === 'good' ? 660 : kind === 'bad' ? 220 : 440;
        gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.06, audioCtx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.16);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.18);
      } catch (e) { /* звук необязателен */ }
    }

    /* ---------- чат ---------- */
    const chatLog = $('chat-log');
    function appendLog(entry, silent) {
      const div = document.createElement('div');
      div.className = 'msg ' + (entry.who === 'player' ? 'player' : 'nika') + ' ' + (entry.kind || '');
      const who = document.createElement('span');
      who.className = 'who'; who.textContent = entry.who === 'player' ? 'ТЫ' : 'НИКА';
      const time = document.createElement('span');
      time.className = 'time';
      time.textContent = (entry.minutes !== undefined ? String(Math.floor(entry.minutes / 60)).padStart(2, '0') + ':' + String(Math.floor(entry.minutes % 60)).padStart(2, '0') : '');
      who.append(time);
      div.append(who, document.createTextNode(entry.text));
      chatLog.append(div);
      while (chatLog.children.length > 90) chatLog.firstChild.remove();
      chatLog.scrollTop = chatLog.scrollHeight;
      if (!silent && entry.who === 'nika') beep(entry.kind === 'bad' ? 'bad' : 'ok');
    }
    function rebuildChat() {
      chatLog.replaceChildren();
      app.state.log.forEach(function (entry) { appendLog(entry, true); });
    }

    /* ---------- быстрые команды ---------- */
    const quick = $('quick-commands');
    QUICK.forEach(function (text) {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = text;
      b.addEventListener('click', function () { submit(text); });
      quick.append(b);
    });

    function submit(text) {
      text = String(text || '').trim();
      if (!text) return;
      $('chat-input').value = '';
      Promise.resolve(app.command(text)).catch(function (e) { toast('Ошибка ИИ: ' + e.message, 'bad'); });
    }
    $('chat-form').addEventListener('submit', function (e) { e.preventDefault(); submit($('chat-input').value); });

    /* ---------- вкладки ---------- */
    function setTab(tab) {
      const map = { animations: 'tab-animations', wardrobe: 'tab-wardrobe', body: 'tab-body-tab',
        life: 'tab-life', learn: 'tab-learn', assets: 'tab-assets', psy: 'tab-psy',
        mesh: 'tab-mesh', net: 'tab-net' };
      Object.keys(map).forEach(function (key) {
        const node = $(map[key]);
        if (node) node.classList.toggle('hidden', key !== tab);
      });
      Array.prototype.forEach.call($('tabs').querySelectorAll('button'), function (b) {
        b.classList.toggle('on', b.dataset.tab === tab);
      });
      if (tab === 'animations') renderClipList();
      if (tab === 'wardrobe') { wardrobeSignature = ''; renderWardrobe(); }
      if (tab === 'assets') renderAssets();
      if (tab === 'psy') renderPsy();
      if (tab === 'mesh') renderMesh();
      if (tab === 'net') renderNet();
    }
    Array.prototype.forEach.call($('tabs').querySelectorAll('button'), function (b) {
      b.addEventListener('click', function () { setTab(b.dataset.tab); });
    });

    /* ---------- галерея анимаций ---------- */
    const counts = anim.counts();
    const partSelect = $('part-select');
    anim.PARTS.forEach(function (p) {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.icon + ' ' + p.label + ' — ' + counts[p.id] + ' анимаций';
      partSelect.append(opt);
    });
    $('anim-counter').textContent = '🎞 ' + anim.total() + ' анимаций · ' + anim.PARTS.length + ' частей тела · минимум ' +
      Math.min.apply(null, Object.keys(counts).map(function (k) { return counts[k]; })) + ' на часть';
    $('anim-note').textContent = 'Каждый клип — отдельная последовательность ключевых кадров для своих суставов. Нажми на клип, чтобы Ника его показала.';
    $('news').textContent = anim.total() + ' анимаций · ' + anim.PARTS.length + ' частей тела · ' +
      assets.info().total + ' ассетов · ' + data.LOCATIONS.length + ' зон · ' + mesh.POINT_COUNT + ' точек';

    function renderClipList() {
      const part = partSelect.value || lastPart;
      lastPart = part;
      const list = $('clip-list');
      list.replaceChildren();
      const clips = anim.clipsFor(part);
      clips.forEach(function (clip, i) {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'clip-btn';
        const n = document.createElement('span'); n.className = 'n'; n.textContent = String(i + 1).padStart(2, '0');
        const label = document.createElement('span'); label.textContent = clip.name;
        const d = document.createElement('span'); d.className = 'd'; d.textContent = clip.duration.toFixed(1) + 'с' + (clip.loop ? ' ∞' : '');
        b.append(n, label, d);
        b.addEventListener('click', function () { app.playClip(part, clip.id); });
        list.append(b);
      });
    }
    partSelect.addEventListener('change', renderClipList);
    $('btn-demo').addEventListener('click', function () { app.startDemo(); toast('Демо: перебираю все ' + anim.total() + ' анимаций', 'good'); });
    $('btn-stop-demo').addEventListener('click', function () { app.stopDemo(); toast('Демо остановлено'); });
    renderClipList();

    /* ---------- гардероб ---------- */
    function renderWardrobe() {
      const s = app.state;
      const sig = JSON.stringify(s.outfit) + '|' + s.owned.join(',') + '|' + Math.round(s.needs.money);
      if (sig === wardrobeSignature) return;
      wardrobeSignature = sig;
      $('wardrobe-summary').textContent = 'На Нике: ' + world.outfitText(s) + ' · ' + s.owned.length + '/' + data.ITEMS.length + ' вещей в шкафу · ' + Math.round(s.needs.money) + ' ₽';
      const uw = $('underwear-text');
      if (uw) {
        const u = s.outfit.underwear, ui2 = u ? data.findItem(u.id) : null;
        uw.textContent = ui2 ? ui2.name + (u.color ? ' · ' + u.color : '') : '—';
      }
      const slots = $('slots'); slots.replaceChildren();
      Object.keys(data.SLOT_LABELS).forEach(function (slot) {
        const worn = s.outfit[slot];
        const row = document.createElement('div'); row.className = 'slot';
        const k = document.createElement('span'); k.className = 'k'; k.textContent = data.SLOT_LABELS[slot];
        const sw = document.createElement('span'); sw.className = 'sw'; sw.style.background = worn ? worn.color : 'transparent';
        const v = document.createElement('span'); v.className = 'v';
        const item = worn ? data.findItem(worn.id) : null;
        v.textContent = worn ? (item ? item.name : worn.id) : '—';
        const btn = document.createElement('button'); btn.type = 'button'; btn.textContent = '✕'; btn.title = 'Снять';
        btn.addEventListener('click', function () { app.removeSlot(slot); });
        row.append(k, sw, v, btn); slots.append(row);
      });
      const colors = $('colors'); colors.replaceChildren();
      data.COLORS.forEach(function (c) {
        const b = document.createElement('button'); b.type = 'button';
        b.style.background = c.hex; b.title = c.name;
        b.addEventListener('click', function () { selectedColor = c; app.recolor(c); toast('Цвет: ' + c.name); });
        colors.append(b);
      });
      const items = $('items'); items.replaceChildren();
      data.ITEMS.forEach(function (item) {
        const owned = s.owned.indexOf(item.id) !== -1;
        const b = document.createElement('button'); b.type = 'button';
        b.className = 'item-btn' + (owned ? '' : ' locked');
        const sw = document.createElement('span'); sw.className = 'sw'; sw.style.background = item.color;
        const label = document.createElement('span'); label.textContent = item.name;
        b.append(sw, label);
        if (!owned) { const p = document.createElement('span'); p.className = 'price'; p.textContent = item.price + ' ₽'; b.append(p); }
        b.addEventListener('click', function () {
          if (owned) app.wearItem(item, selectedColor);
          else submit('купи ' + item.name);
        });
        items.append(b);
      });
    }
    $('btn-random-outfit').addEventListener('click', function () { app.randomOutfit(); });

    /* ---------- тело ---------- */
    const sliders = $('sliders');
    SLIDERS.forEach(function (spec) {
      const [ch, label, min, max, step] = spec;
      const row = document.createElement('label'); row.className = 'slider';
      const name = document.createElement('span'); name.textContent = label;
      const input = document.createElement('input');
      input.type = 'range'; input.min = min; input.max = max; input.step = step;
      input.value = (min + max) / 2;
      const val = document.createElement('span'); val.className = 'val'; val.textContent = input.value;
      input.addEventListener('input', function () {
        app.manual[ch] = parseFloat(input.value);
        val.textContent = input.value;
      });
      row.append(name, input, val); sliders.append(row);
    });
    $('btn-reset-pose').addEventListener('click', function () {
      Object.keys(app.manual).forEach(function (k) { delete app.manual[k]; });
      Array.prototype.forEach.call(sliders.querySelectorAll('input'), function (input) {
        const min = parseFloat(input.min), max = parseFloat(input.max);
        input.value = (min + max) / 2;
        input.nextElementSibling.textContent = input.value;
      });
      toast('Тело снова слушается ИИ', 'good');
    });

    /* ---------- жизнь ---------- */
    const needsBox = $('needs');
    const needNodes = {};
    Object.keys(NEED_LABELS).forEach(function (key) {
      const wrap = document.createElement('div'); wrap.className = 'need';
      const top = document.createElement('div'); top.className = 'top';
      const label = document.createElement('span'); label.textContent = NEED_LABELS[key];
      const num = document.createElement('b'); num.textContent = '0';
      top.append(label, num);
      const bar = document.createElement('div'); bar.className = 'bar';
      const fill = document.createElement('i'); fill.style.width = '50%';
      bar.append(fill); wrap.append(top, bar); needsBox.append(wrap);
      needNodes[key] = { num: num, fill: fill, bar: bar };
    });

    function renderLife() {
      const s = app.state, n = s.needs;
      Object.keys(needNodes).forEach(function (key) {
        const node = needNodes[key];
        const value = key === 'money' ? Math.round(n[key]) : Math.round(n[key]);
        node.num.textContent = key === 'money' ? value + ' ₽' : value + '%';
        const pct = key === 'money' ? Math.min(100, (n[key] / 300) * 100) : n[key];
        node.fill.style.width = Math.max(0, Math.min(100, pct)) + '%';
        node.bar.classList.toggle('low', key !== 'money' && n[key] < 28);
      });
      const a = s.action;
      $('life-action').textContent = a
        ? 'Сейчас: ' + a.label + ' · осталось ' + Math.max(0, Math.ceil(a.remaining)) + ' игр. мин · целей в очереди ' + s.goals.length
        : 'Сейчас: ' + (s.autonomy ? 'ИИ выбирает занятие' : 'ждёт команды') + ' · целей ' + s.goals.length;
      const info = ai.info();
      $('ai-info').innerHTML = '<b>' + info.model + '</b><br>' +
        'Намерений: ' + info.intents + ' · обучающих фраз: ' + info.trainedOn + '<br>' +
        'LLM браузера: ' + info.llm + '<br>' +
        'Облако: ' + info.cloud + ' · сеть: ' + info.network + ' · цена: ' + info.cost + '<br>' +
        'Выучено новых фраз: ' + s.learned + ' · команд: ' + s.commands + '<br>' +
        'Тело: ' + mesh.info().points + ' точек · моторных программ: ' + mesh.info().programs +
        ' · бытовых навыков: ' + skills.info().skills + '<br>' +
        'Сеть: ' + info.network + ' · интернет: ' + world.netInfo().mode;
      const mem = $('memory'); mem.replaceChildren();
      s.memory.slice(-6).reverse().forEach(function (m) {
        const d = document.createElement('div');
        d.textContent = 'Д' + m.day + ' · ' + (ai.INTENT_BY_ID[m.intent] ? ai.INTENT_BY_ID[m.intent].label : m.intent) + ' · «' + m.text + '» · уверенность ' + Math.round(m.confidence * 100) + '%';
        mem.append(d);
      });
    }

    /* ---------- обучение ИИ ---------- */
    function initLearning() {
      const sel = $('learn-intent');
      ai.INTENTS.forEach(function (i) {
        const o = document.createElement('option'); o.value = i.id; o.textContent = i.label; sel.append(o);
      });
      $('btn-feedback').addEventListener('click', function () {
        const phrase = app.state.lastCommand;
        if (!phrase) { toast('Сначала напиши Нике команду', 'bad'); return; }
        app.feedback(phrase, sel.value);
      });
      $('btn-learn').addEventListener('click', function () {
        const v = $('learn-text').value.trim();
        if (!v) { toast('Вставь текст или список фраз', 'bad'); return; }
        app.learnText(v);
        $('learn-text').value = '';
      });
      $('btn-export').addEventListener('click', function () {
        const text = app.exportKnowledge();
        try {
          const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
          const a = document.createElement('a');
          a.href = url; a.download = 'nika-knowledge.json'; a.click();
          setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
          toast('База знаний выгружена в файл', 'good');
        } catch (e) { toast('Экспорт недоступен — скопируй текст из консоли'); console.log(text); }
      });
    }
    function renderLearn() {
      const info = ai.info();
      $('learn-counter').textContent = 'Выучено: ' + info.learned + ' · база: ' + info.trainedOn +
        ' фраз · намерений: ' + info.intents + ' · сеть: ' + info.network;
      $('learn-last').textContent = app.state.lastCommand
        ? '«' + app.state.lastCommand + '»' : 'Напиши Нике команду — и здесь можно будет исправить её значение.';
      const list = $('learn-list'); list.replaceChildren();
      ai.learnedExamples().slice(-8).reverse().forEach(function (ex) {
        const d = document.createElement('div');
        d.textContent = '«' + ex.text + '» → ' + (ai.INTENT_BY_ID[ex.label] ? ai.INTENT_BY_ID[ex.label].label : ex.label);
        list.append(d);
      });
      if (!list.children.length) {
        const d = document.createElement('div');
        d.textContent = 'Пока нет новых фраз. Вставь текст выше или исправь последнюю команду.';
        list.append(d);
      }
    }

    /* ---------- v1.2: настройки интерфейса и режим просмотра ---------------- */
    function applyUiSettings() {
      const st = app.state.settings || {};
      const doc = document.documentElement;
      doc.style.setProperty('--chat-w', (st.chatWidth || 380) + 'px');
      doc.style.setProperty('--chat-fs', (st.chatFont || 15) + 'px');
      document.body.classList.toggle('chat-collapsed', !!st.chatCollapsed);
      document.body.classList.toggle('watch-mode', !!st.watchMode);
      const pairs = [['chat-width', st.chatWidth], ['chat-font', st.chatFont],
        ['warmth-slider', st.warmth], ['net-optin', st.internetOptIn],
        ['privacy-toggle', st.privacy !== false], ['mesh-points-toggle', st.showPoints]];
      pairs.forEach(function (pair) {
        const el = $(pair[0]);
        if (!el) return;
        if (el.type === 'checkbox') el.checked = !!pair[1];
        else if (pair[1] !== undefined) el.value = pair[1];
      });
      const wv = $('warmth-value'); if (wv) wv.textContent = (st.warmth || 22) + ' °C';
      const follow = $('btn-follow'); if (follow) follow.classList.toggle('on', st.cameraFollow !== false);
      const watch = $('btn-watch'); if (watch) watch.classList.toggle('on', !!st.watchMode);
    }
    function toggleWatch() {
      const v = !app.state.settings.watchMode;
      app.state.settings.watchMode = v;
      applyUiSettings();
      toast(v ? 'Режим просмотра: панели скрыты' : 'Панели вернулись');
      return v;
    }
    function toggleChat() {
      const v = !app.state.settings.chatCollapsed;
      app.state.settings.chatCollapsed = v;
      applyUiSettings();
      return v;
    }

    /* ---------- галерея 400 ассетов ----------------------------------------- */
    function renderAssetGrid() {
      const group = $('asset-group').value || assets.GROUPS[0].id;
      const grid = $('asset-grid'); if (!grid) return;
      grid.replaceChildren();
      const current = Number((app.state.look || {})[group]);
      assets.groupAssets(group).forEach(function (a) {
        const b = document.createElement('button'); b.type = 'button';
        b.className = a.index === current ? 'on' : '';
        b.style.background = assets.css(a.id);
        b.title = a.name + ' · ' + a.kind;
        const i = document.createElement('i'); i.textContent = a.variant; b.append(i);
        b.addEventListener('click', function () { app.setLook(group, a.index); renderAssetGrid(); });
        grid.append(b);
      });
    }
    function renderAssets() {
      const info = assets.info();
      $('assets-counter').textContent = '🎨 ' + info.total + ' ассетов: ' + info.textures + ' текстур + ' +
        info.models + ' моделей · ' + info.groups + ' групп × ' + info.variants + ' вариантов · внешних файлов: ' + info.external;
      const sel = $('asset-group');
      if (sel && !sel.options.length) {
        assets.GROUPS.forEach(function (g) {
          const o = document.createElement('option'); o.value = g.id;
          o.textContent = g.label + ' · ' + (g.kind === 'texture' ? 'текстура' : 'модель');
          sel.append(o);
        });
        sel.addEventListener('change', renderAssetGrid);
      }
      renderAssetGrid();
    }

    /* ---------- характер и комплексы ---------------------------------------- */
    function renderPsy() {
      const list = world.psySummary(app.state);
      const p = app.state.psy || {};
      $('psy-counter').textContent = '💭 ' + list.length + ' комплексов · уверенность ' +
        Math.round(p.confidence || 0) + '% · доверие ' + Math.round(p.trust || 0) + '%';
      const box = $('psy-list'); if (!box) return;
      box.replaceChildren();
      list.forEach(function (c) {
        const card = document.createElement('div'); card.className = 'psy-card';
        const top = document.createElement('div'); top.className = 'top';
        const name = document.createElement('span'); name.textContent = c.label;
        const val = document.createElement('b'); val.textContent = Math.round(c.weight * 100) + '%';
        top.append(name, val);
        const desc = document.createElement('div'); desc.className = 'desc'; desc.textContent = c.desc;
        const bar = document.createElement('div'); bar.className = 'bar';
        const fill = document.createElement('i'); fill.style.width = Math.round(c.weight * 100) + '%';
        bar.append(fill); card.append(top, desc, bar); box.append(card);
      });
    }

    /* ---------- 2400 точек тела и моторное обучение ------------------------- */
    function fillMeshPoints() {
      const region = $('mesh-region').value;
      const sel = $('mesh-point'); if (!sel) return;
      sel.replaceChildren();
      mesh.POINTS.filter(function (pt) { return pt.region === region; }).forEach(function (pt) {
        const o = document.createElement('option'); o.value = String(pt.id);
        o.textContent = 'точка #' + String(pt.id).padStart(4, '0') + ' · ' + pt.channel;
        sel.append(o);
      });
      const off = sel.value ? mesh.getOffset(sel.value) : [0, 0];
      $('mesh-offset-x').value = off[0]; $('mesh-offset-y').value = off[1];
    }
    function renderMesh() {
      const info = mesh.info();
      $('mesh-counter').textContent = '✥ ' + info.points + ' точек · ' + info.regions + ' областей · ' +
        info.programs + ' встроенных программ · выучено связей: ' + info.learned + ' · сдвинуто вручную: ' + info.manual;
      const rs = $('mesh-region');
      if (rs && !rs.options.length) {
        mesh.REGIONS.forEach(function (r) {
          const o = document.createElement('option'); o.value = r.id;
          o.textContent = r.label + ' (' + mesh.pointRegionCounts()[r.id] + ')';
          rs.append(o);
        });
        rs.addEventListener('change', fillMeshPoints);
        $('mesh-point').addEventListener('change', function () {
          const off = mesh.getOffset($('mesh-point').value);
          $('mesh-offset-x').value = off[0]; $('mesh-offset-y').value = off[1];
        });
      }
      fillMeshPoints();
      const box = $('mesh-programs'); if (box) {
        box.replaceChildren();
        mesh.PROGRAM_LIST.forEach(function (pr) {
          const d = document.createElement('div');
          d.textContent = pr.label + ' → ' + pr.steps.length + ' каналов: ' + pr.steps.map(function (x) { return x.channel; }).join(', ');
          box.append(d);
        });
      }
    }

    /* ---------- интернет-обучение и бытовые навыки -------------------------- */
    function renderNet() {
      const ni = world.netInfo(), si = world.skillsInfo();
      $('net-counter').textContent = '🌐 запросов: ' + ni.requests + ' · режим: ' + ni.mode +
        ' · ключи: ' + ni.keys + ' · телеметрия: ' + ni.telemetry + ' · ' + ni.cost;
      const st = $('net-status');
      if (ni.last) {
        const l = ni.last;
        st.textContent = 'Последняя загрузка: ' + (l.host || 'вставленный текст') + ' · ' + l.chars + ' символов, ' +
          l.lines + ' строк · +' + l.ai + ' фраз ИИ, +' + l.motor + ' движений, +' + l.skills +
          ' шагов навыков (' + l.extendedSkills + ' навыков расширено).';
      } else st.textContent = 'Запросов ещё не было. Игра работает полностью офлайн.';
      const box = $('net-skills'); if (box) {
        box.replaceChildren();
        skills.list().forEach(function (sk) {
          const d = document.createElement('div');
          d.textContent = sk.label + ' · ' + sk.steps.length + ' шагов · источник: ' + sk.source;
          box.append(d);
        });
      }
      const info = si;
      const old = $('net-skills-info');
      if (old) old.textContent = 'Навыков: ' + info.skills + ', шагов: ' + info.steps +
        ', из загруженных сайтов: ' + info.fromInternet;
    }

    /* ---------- HUD / тосты / автосохранение ---------- */
    function refresh(force) {
      const now = performance.now();
      if (!force && now - lastRefresh < 140) return;
      lastRefresh = now;
      const s = app.state;
      $('hud-clock').textContent = String(s.day).padStart(2, '0') + ' · ' + world.clock(s);
      $('hud-energy').textContent = Math.round(s.needs.energy) + '%';
      $('hud-energy').className = s.needs.energy < 28 ? 'neg' : '';
      $('hud-mood').textContent = Math.round(s.needs.mood) + '%';
      $('hud-money').textContent = Math.round(s.needs.money) + ' ₽';
      $('hud-ai').textContent = s.autonomy ? 'автономно' : 'ждёт';
      $('hud-ai').className = s.autonomy ? '' : 'neg';
      $('hint').textContent = s.action ? 'Ника ' + s.action.label + ' · напиши новую команду — она встанет в очередь' : 'Напиши команду Нике — она оденется, пойдёт, поработает, поспит или покажет любую анимацию';
      $('pause-flag').classList.toggle('show', s.paused);
      $('btn-pause').textContent = s.paused ? '▶' : '⏸';
      Array.prototype.forEach.call($('speed-group').querySelectorAll('button'), function (b) {
        b.classList.toggle('on', parseInt(b.dataset.speed, 10) === s.speed);
      });
      $('autonomy-toggle').checked = !!s.autonomy;
      const mini = ai.info();
      $('ai-mini').textContent = '🧠 ' + mini.model + ' · фраз: ' + mini.trainedOn + ' · ' + mini.llm + ' · без облака, 0 ₽';
      renderLife();
      renderLearn();
      renderWardrobe();
    }
    function toast(text, kind) {
      const box = $('toasts');
      const div = document.createElement('div');
      div.className = 'toast' + (kind ? ' ' + kind : '');
      div.textContent = text;
      box.append(div);
      setTimeout(function () { div.classList.add('out'); setTimeout(function () { div.remove(); }, 380); }, 2600);
      while (box.children.length > 5) box.firstChild.remove();
      beep(kind === 'good' ? 'good' : kind === 'bad' ? 'bad' : 'ok');
    }
    function flashSave() {
      const el = $('save-indicator');
      el.classList.add('flash');
      setTimeout(function () { el.classList.remove('flash'); }, 900);
    }

    /* ---------- помощь ---------- */
    function showHelp() {
      const c = anim.counts();
      modalRoot.innerHTML =
        '<div class="modal-backdrop"><div class="modal wide">' +
        '<div class="modal-head"><h2>НИКА: ЖИВАЯ · как играть</h2><button class="icon-btn x" id="help-close">✕</button></div>' +
        '<p>Ты пишешь команды на русском — Ника живёт в <b>большой квартире из 13 зон</b>: прихожая, коридор, кухня, столовая, гостиная, уголок чтения, рабочий стол, гардеробная, балкон, спальня, спортивный угол, ванная и санузел. Камера следует за ней; веди мышью или пальцем, крути колесо, жми «0» — и она вернётся к Нике. Она переодевается <b>в три фазы</b> (снять → найти в шкафу → надеть), купается, спит, печатает за ноутбуком, разговаривает и ходит в санузел. Если включена автономия, она живёт сама.</p>' +
        '<div class="help-grid"><div>' +
        '<h3>Примеры команд</h3><div class="cmd-list">' +
        '<code>надень синее платье и помаши рукой</code><br>' +
        '<code>иди на кухню, поешь, потом поработай</code><br>' +
        '<code>переоденься в пижаму</code> · <code>покажи бельё</code><br>' +
        '<code>иди спать</code> · <code>помоги мне с уборкой</code><br>' +
        '<code>прими ванну</code> · <code>сходи в туалет</code><br>' +
        '<code>сделай комплимент</code> · <code>не стесняйся</code><br>' +
        '<code>покажи точки тела</code> · <code>сделай теплее</code><br>' +
        '<code>покажи все анимации</code> · <code>обучись из интернета</code><br>' +
        '<code>запомни: крутись волчком = станцуй</code>' +
        '</div><h3>Клавиши и устройства</h3><div class="cmd-list">' +
        '<kbd>Пробел</kbd> пауза · <kbd>H</kbd> помощь · <kbd>S</kbd> сохранить<br>' +
        '<kbd>M</kbd> звук · <kbd>Esc</kbd> закрыть · <kbd>1</kbd>/<kbd>2</kbd>/<kbd>4</kbd> скорость<br>' +
        '<kbd>F</kbd> режим просмотра (убрать панели) · <kbd>C</kbd> свернуть чат<br>' +
        '<kbd>←</kbd>/<kbd>→</kbd> или <kbd>A</kbd>/<kbd>D</kbd> камера · <kbd>↑</kbd>/<kbd>↓</kbd> зум · <kbd>0</kbd> к Нике<br>' +
        'Мышь: перетаскивание и колесо · телефон: свайп и два пальца · геймпад: стик и кнопка A' +
        '</div></div><div>' +
        '<h3>Тело: ' + anim.total() + ' анимаций на ' + anim.PARTS.length + ' частей</h3><div class="cmd-list">' +
        anim.PARTS.map(function (p) { return p.label + ' — <b>' + c[p.id] + '</b>'; }).join('<br>') +
        '</div><h3>Характер, тело и ассеты</h3><p>У Ники <b>настоящие комплексы</b>: стесняется раздеваться, сомневается в фигуре, ждёт одобрения, поправляет подол, отводит взгляд и постепенно начинает доверять. Комплименты, «не смотрю» и «дай пространство» реально меняют её поведение и ширму. Под одеждой есть скромный нижний слой, а женственный силуэт передан только контуром под тканью — <b>откровенной анатомии нет</b>.</p>' +
        '<p>Модель собрана из <b>' + assets.info().total + ' процедурных ассетов</b> (200 текстур + 200 моделей, 20 групп по 20 вариантов) и <b>' + mesh.info().points + ' точек управления телом</b> в ' + mesh.info().regions + ' областях. Встроенные моторные программы уже учат её ходить, дышать, тянуться, купаться и переодеваться; остальное она доучивает по тексту.</p>' +
        '<h3>Какой здесь ИИ и интернет</h3><p>Внутри — <b>обучаемая нейросеть</b> (softmax + tf-idf), слотовый парсер русского и планировщик полезности: ' + ai.info().intents + ' намерений, ' + ai.info().trainedOn + ' фраз. Модель обучается в браузере и дообучается на твоих фразах, исправлениях и вставленном тексте. Веса сохраняются в localStorage.</p>' +
        '<p><b>Честно про интернет:</b> игра офлайн по умолчанию и <b>сама не делает сетевых запросов</b>. Во вкладке «Интернет» ты можешь сам включить тумблер, указать адрес публичного сайта и нажать «Загрузить» — тогда будет ровно один запрос (успех зависит от CORS сайта). Своего сервера, ключей API, телеметрии и платных сервисов нет: 0 ₽. Скачанный текст разбирается локально: дообучаются ИИ, моторные программы и бытовые навыки (купаться, ходить в туалет, убирать…). Если браузер даёт встроенную локальную LLM, она тоже работает без сети.</p>' +
        '<p>Это <b>не облачный ChatGPT/GPT</b> и не генеративная модель. Нет CDN и внешних библиотек; всё работает с <code>file://</code> и офлайн.</p>' +
        '</div></div><div class="modal-actions"><button class="btn btn-primary" id="help-play">Понятно, играть</button></div>' +
        '</div></div>';
      modalRoot.classList.add('open');
      $('help-close').addEventListener('click', closeModal);
      $('help-play').addEventListener('click', closeModal);
      modalRoot.querySelector('.modal-backdrop').addEventListener('click', function (e) { if (e.target === this) closeModal(); });
    }
    function closeModal() { modalRoot.classList.remove('open'); }

    /* ---------- кнопки HUD ---------- */
    $('btn-help').addEventListener('click', showHelp);
    $('btn-save').addEventListener('click', function () { app.save(); });
    $('btn-pause').addEventListener('click', function () { app.setPaused(!app.state.paused); });
    $('btn-sound').addEventListener('click', function () {
      soundOn = !soundOn; $('btn-sound').textContent = soundOn ? '🔊' : '🔇'; toast(soundOn ? 'Звук включён' : 'Звук выключен');
    });
    Array.prototype.forEach.call($('speed-group').querySelectorAll('button'), function (b) {
      b.addEventListener('click', function () { app.setSpeed(parseInt(b.dataset.speed, 10)); });
    });
    $('autonomy-toggle').addEventListener('change', function (e) {
      const on = e.target.checked;
      app.state.autonomy = on;
      world.say(app.state, on ? 'Хорошо, буду жить сама и сама решать, что надеть и чем заняться.' : 'Поняла, жду только твоих команд.', 'nika', 'ai');
      toast(on ? 'Автономия ИИ включена' : 'Автономия выключена', on ? 'good' : '');
    });
    $('btn-mobile-chat').addEventListener('click', function () { document.body.dataset.mobilePanel = 'chat'; });
    $('btn-mobile-tools').addEventListener('click', function () { document.body.dataset.mobilePanel = 'tools'; });

    /* ---------- клавиатура ---------- */
    document.addEventListener('keydown', function (e) {
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || tag === 'select';
      if (e.key === 'Escape') { closeModal(); return; }
      if (typing) return;
      if (e.code === 'Space') { e.preventDefault(); app.setPaused(!app.state.paused); }
      else if (e.key === 'h' || e.key === 'H' || e.key === 'р' || e.key === 'Р') showHelp();
      else if (e.key === 's' || e.key === 'S' || e.key === 'ы' || e.key === 'Ы') app.save();
      else if (e.key === 'm' || e.key === 'M' || e.key === 'ь' || e.key === 'Ь') $('btn-sound').click();
      else if (e.key === 'f' || e.key === 'F' || e.key === 'а' || e.key === 'А') toggleWatch();
      else if (e.key === 'c' || e.key === 'C') toggleChat();
      else if (['1', '2', '4'].indexOf(e.key) !== -1) app.setSpeed(parseInt(e.key, 10));
    });

    /* ---------- привязка новых элементов v1.2 ------------------------------ */
    function bindV12() {
      applyUiSettings();
      $('btn-watch').addEventListener('click', toggleWatch);
      $('btn-chat-toggle').addEventListener('click', toggleChat);
      $('btn-chat-collapse').addEventListener('click', function () { app.setUiSetting('chatCollapsed', true); });
      $('btn-chat-restore').addEventListener('click', function () { app.setUiSetting('chatCollapsed', false); });
      $('chat-width').addEventListener('input', function (e) { app.setUiSetting('chatWidth', parseInt(e.target.value, 10)); });
      $('chat-font').addEventListener('input', function (e) { app.setUiSetting('chatFont', parseInt(e.target.value, 10)); });

      $('btn-zone-prev').addEventListener('click', function () { app.moveZone(-1); });
      $('btn-zone-next').addEventListener('click', function () { app.moveZone(1); });
      $('btn-camera-center').addEventListener('click', function () { app.centerCamera(); });
      $('btn-zoom-in').addEventListener('click', function () { app.setZoom(app.state.zoom * 1.15); });
      $('btn-zoom-out').addEventListener('click', function () { app.setZoom(app.state.zoom / 1.15); });
      $('btn-follow').addEventListener('click', function () {
        app.setSetting('cameraFollow', !(app.state.settings.cameraFollow !== false));
        applyUiSettings();
      });

      $('btn-random-look').addEventListener('click', function () { app.randomLook(); renderAssetGrid(); });
      $('btn-compliment').addEventListener('click', function () { app.psyAction('compliment'); renderPsy(); });
      $('btn-reassure').addEventListener('click', function () { app.psyAction('reassure'); renderPsy(); });
      $('btn-space').addEventListener('click', function () { app.psyAction('space'); renderPsy(); });
      $('privacy-toggle').addEventListener('change', function (e) { app.setSetting('privacy', e.target.checked); });

      $('mesh-points-toggle').addEventListener('change', function (e) { app.setSetting('showPoints', e.target.checked); });
      $('btn-mesh-apply').addEventListener('click', function () {
        const id = $('mesh-point').value;
        app.meshSetOffset(id, parseFloat($('mesh-offset-x').value), parseFloat($('mesh-offset-y').value));
        renderMesh(); toast('Точка #' + id + ' сдвинута', 'good');
      });
      $('btn-mesh-clear').addEventListener('click', function () { app.meshClear(); renderMesh(); toast('Точки сброшены'); });
      $('warmth-slider').addEventListener('input', function (e) {
        app.setWarmth(e.target.value);
        $('warmth-value').textContent = e.target.value + ' °C';
      });
      $('btn-motor-learn').addEventListener('click', function () {
        const v = $('motor-text').value.trim();
        if (!v) { toast('Вставь строки «фраза = программа»', 'bad'); return; }
        app.motorLearn(v); $('motor-text').value = ''; renderMesh();
      });

      $('net-optin').addEventListener('change', function (e) {
        app.setInternetOptIn(e.target.checked);
        toast(e.target.checked ? 'Интернет-обучение разрешено — запрос будет только по твоей кнопке' : 'Интернет отключён, игра снова полностью офлайн');
        renderNet();
      });
      $('btn-net-load').addEventListener('click', async function () {
        const url = $('net-url').value.trim();
        if (!app.state.settings.internetOptIn) { toast('Сначала включи тумблер разрешения', 'bad'); return; }
        if (!url) { toast('Укажи адрес публичного сайта', 'bad'); return; }
        toast('Загружаю страницу…');
        try { await app.webLearn(url); renderNet(); }
        catch (e) { toast('Не вышло: ' + e.message, 'bad'); }
      });
      $('btn-net-pasted').addEventListener('click', function () {
        const v = $('net-text').value.trim();
        if (!v) { toast('Вставь текст или шаги навыков', 'bad'); return; }
        try { app.learnPasted(v); $('net-text').value = ''; renderNet(); }
        catch (e) { toast(e.message, 'bad'); }
      });
    }

    bindV12();
    initLearning();
    rebuildChat();
    refresh(true);

    return {
      appendLog: appendLog, setTab: setTab, toast: toast, refresh: refresh,
      applyUiSettings: applyUiSettings, toggleWatch: toggleWatch, toggleChat: toggleChat,
      flashSave: flashSave, rebuildChat: rebuildChat, showHelp: showHelp,
      beep: beep, closeModal: closeModal,
    };
  }

  NIKA.ui = { createUI: createUI, QUICK: QUICK };
})(typeof globalThis !== 'undefined' ? globalThis : this);
