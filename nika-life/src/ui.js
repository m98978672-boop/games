/* =============================================================================
   НИКА: ЖИВАЯ — интерфейс (HUD, чат, галерея анимаций, гардероб, тело, жизнь)
   ============================================================================= */
(function (root) {
  'use strict';
  const NIKA = (root.NIKA = root.NIKA || {});
  const anim = NIKA.anim, data = NIKA.data, ai = NIKA.ai, world = NIKA.world;
  const $ = function (id) { return document.getElementById(id); };

  const QUICK = [
    'Привет!', 'Переоденься в синее платье', 'Помаши рукой', 'Покажи все анимации',
    'Прими ванну', 'Иди спать', 'Поработай', 'Поговори со мной',
    'Сходи в туалет', 'Помоги мне', 'Как дела?', 'Живи сама',
    'Сама выбери наряд', 'Запомни: крутись волчком = станцуй',
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
      const map = { animations: 'tab-animations', wardrobe: 'tab-wardrobe', body: 'tab-body-tab', life: 'tab-life', learn: 'tab-learn' };
      Object.keys(map).forEach(function (key) {
        const node = $(map[key]);
        if (node) node.classList.toggle('hidden', key !== tab);
      });
      Array.prototype.forEach.call($('tabs').querySelectorAll('button'), function (b) {
        b.classList.toggle('on', b.dataset.tab === tab);
      });
      if (tab === 'animations') renderClipList();
      if (tab === 'wardrobe') { wardrobeSignature = ''; renderWardrobe(); }
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
    $('news').textContent = anim.total() + ' анимаций · ' + anim.PARTS.length + ' частей тела · 10+ на каждую';

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
        'Выучено новых фраз: ' + s.learned + ' · команд: ' + s.commands;
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
        '<p>Ты пишешь команды на русском — Ника живёт в своей минималистичной квартире-студии: прихожая, кухня, гостиная, рабочий стол, спальня, ванная и санузел. Она переодевается за ширмой, купается в пене, спит под одеялом, печатает за ноутбуком, разговаривает в пузыре и ходит в санузел. Если включена автономия, она живёт сама: составляет расписание и сама выбирает наряд.</p>' +
        '<div class="help-grid"><div>' +
        '<h3>Примеры команд</h3><div class="cmd-list">' +
        '<code>надень синее платье и помаши рукой</code><br>' +
        '<code>иди на кухню, поешь, потом поработай</code><br>' +
        '<code>иди спать</code> · <code>помоги мне с уборкой</code><br>' +
        '<code>прими ванну</code> · <code>сходи в туалет</code><br>' +
        '<code>поговори со мной</code> · <code>переоденься в синее платье</code><br>' +
        '<code>покажи все анимации</code> · <code>подними левую руку</code><br>' +
        '<code>станцуй</code> · <code>покажи анимацию «Зевнуть»</code><br>' +
        '<code>запомни: крутись волчком = станцуй</code><br>' +
        '<code>живи сама</code> · <code>жди моих команд</code>' +
        '</div><h3>Клавиши</h3><div class="cmd-list">' +
        '<kbd>Пробел</kbd> пауза · <kbd>H</kbd> помощь · <kbd>S</kbd> сохранить<br>' +
        '<kbd>M</kbd> звук · <kbd>Esc</kbd> закрыть · <kbd>1</kbd>/<kbd>2</kbd>/<kbd>4</kbd> скорость' +
        '</div></div><div>' +
        '<h3>Тело: ' + anim.total() + ' анимаций</h3><div class="cmd-list">' +
        anim.PARTS.map(function (p) { return p.label + ' — <b>' + c[p.id] + '</b>'; }).join('<br>') +
        '</div><h3>Какой здесь ИИ</h3><p>Внутри — <b>обучаемая нейросетевая модель</b> (softmax-классификатор намерений + tf-idf), слотовый парсер русского языка и планировщик с функцией полезности. Модель обучается прямо в браузере при запуске и <b>дообучается</b> на твоих фразах: команда «запомни», исправление последней команды и вкладка «Обучение ИИ». Туда можно вставить список фраз, включая текст, который ты скопировал из интернета, — Ника разберёт его локально. Веса сохраняются в localStorage. Если браузер даёт встроенную локальную LLM (Chrome Built-in AI), она подключается для свободных фраз — тоже бесплатно и без сети.</p>' +
        '<p><b>Честно:</b> это не облачный ChatGPT/GPT и не генеративная модель. Игра сама <b>не делает сетевых запросов</b>: текст из интернета вставляешь ты, обучение идёт в браузере. Нет ключей API, телеметрии и платных сервисов: всё работает офлайн и с <code>file://</code>.</p>' +
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
      else if (['1', '2', '4'].indexOf(e.key) !== -1) app.setSpeed(parseInt(e.key, 10));
    });

    initLearning();
    rebuildChat();
    refresh(true);

    return {
      appendLog: appendLog, setTab: setTab, toast: toast, refresh: refresh,
      flashSave: flashSave, rebuildChat: rebuildChat, showHelp: showHelp,
      beep: beep, closeModal: closeModal,
    };
  }

  NIKA.ui = { createUI: createUI, QUICK: QUICK };
})(typeof globalThis !== 'undefined' ? globalThis : this);
