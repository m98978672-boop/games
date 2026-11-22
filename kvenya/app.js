/* Квеня — страница вкладки «Общение с ИИ».
   Страница ничего не выдумывает: разговор, состояние, журнал поисков и
   дневник она читает прямо из файлов её дома (../qwen-home/) — тех самых,
   что лежат в открытом репозитории. Если файл недоступен, честно
   показывает ссылку на GitHub вместо выдуманных данных. */
(function () {
  'use strict';

  var HOME_RAW = '../qwen-home/';
  var GH = 'https://github.com/m98978672-boop/games/blob/main/qwen-home/';
  var OUTBOX_KEY = 'kvenya-outbox-v1';

  var params = new URLSearchParams(window.location.search || '');
  if (params.get('embed')) document.body.classList.add('is-embed');

  function el(id) { return document.getElementById(id); }

  function fetchText(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    });
  }

  function noteError(node, fileName) {
    node.textContent = '';
    var p = document.createElement('div');
    p.className = 'kv-loading';
    p.appendChild(document.createTextNode('Не удалось прочитать файл из её дома. Он живёт на GitHub: '));
    var a = document.createElement('a');
    a.href = GH + fileName;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = 'qwen-home/' + fileName;
    p.appendChild(a);
    node.appendChild(p);
  }

  /* ---------------- разговор ---------------- */

  function parseDialogue(md) {
    var turns = [];
    var current = null;
    md.split('\n').forEach(function (line) {
      if (line.indexOf('Владелец:') === 0) {
        if (current) turns.push(current);
        current = { who: 'owner', text: line.slice('Владелец:'.length).trim() };
      } else if (line.indexOf('Квеня:') === 0) {
        if (current) turns.push(current);
        current = { who: 'kvenya', text: line.slice('Квеня:'.length).trim() };
      } else if (current && line.trim()) {
        current.text += '\n' + line.trim();
      }
    });
    if (current) turns.push(current);
    return turns.filter(function (t) { return t.text; });
  }

  function loadOutbox() {
    try {
      var raw = window.localStorage.getItem(OUTBOX_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return [];
    }
  }

  function saveOutbox(list) {
    try { window.localStorage.setItem(OUTBOX_KEY, JSON.stringify(list)); } catch (err) { /* приватный режим */ }
  }

  function bubble(who, text, pending, onRemove, at) {
    var div = document.createElement('div');
    div.className = 'msg ' + who + (pending ? ' pending' : '');
    var head = document.createElement('span');
    head.className = 'msg-who';
    head.textContent = who === 'kvenya' ? 'Квеня' : 'Владелец';
    div.appendChild(head);
    div.appendChild(document.createTextNode(text));
    if (pending) {
      var wait = document.createElement('span');
      wait.className = 'msg-wait';
      wait.textContent = '⏳ ждёт: подтверди вопрос кнопкой Submit на вкладке GitHub — Квеня ответит прямо сюда';
      var timer = document.createElement('span');
      timer.className = 'msg-timer js-wait-timer';
      if (at) timer.setAttribute('data-since', at);
      timer.textContent = '⏱ ждёт уже 00:00';
      wait.appendChild(timer);
      var rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'msg-remove';
      rm.textContent = 'убрать';
      rm.addEventListener('click', onRemove);
      wait.appendChild(rm);
      div.appendChild(wait);
    }
    return div;
  }

  var chatNode = el('kvChat');

  function renderChat(turns) {
    chatNode.textContent = '';
    if (!turns.length) {
      var empty = document.createElement('div');
      empty.className = 'kv-loading';
      empty.textContent = 'Разговор пока пуст.';
      chatNode.appendChild(empty);
    }
    turns.forEach(function (t) {
      chatNode.appendChild(bubble(t.who, t.text, false, null));
    });
    loadOutbox().forEach(function (item, idx) {
      chatNode.appendChild(bubble('owner', item.text, true, function () {
        var list = loadOutbox();
        list.splice(idx, 1);
        saveOutbox(list);
        renderChat(turns);
      }, item.at));
    });
    chatNode.scrollTop = chatNode.scrollHeight;
    updateWaitCard(Date.now());
    renderMood();
  }

  /* ---------------- таймер ожидания ответа ---------------- */

  var WAIT_TYPICAL_MS = 10 * 60 * 1000; // ориентир после ускорения: модель и pip в кэше Actions, поиск решает правило

  function fmtWait(ms) {
    if (!(ms > 0)) ms = 0;
    var s = Math.floor(ms / 1000);
    function p(n) { return (n < 10 ? '0' : '') + n; }
    var h = Math.floor(s / 3600);
    return h > 0 ? p(h) + ':' + p(Math.floor((s % 3600) / 60)) + ':' + p(s % 60)
      : p(Math.floor(s / 60)) + ':' + p(s % 60);
  }

  function updateWaitCard(now) {
    var card = el('kvWaitCard');
    if (!card) return;
    var list = loadOutbox();
    if (!list.length) { card.hidden = true; return; }
    card.hidden = false;
    var oldest = null;
    list.forEach(function (item) {
      var t = Date.parse(item.at || '');
      if (!isNaN(t) && (oldest === null || t < oldest)) oldest = t;
    });
    if (oldest === null) oldest = now;
    var elapsed = now - oldest;
    el('kvWaitTimer').textContent = fmtWait(elapsed);
    el('kvWaitBar').style.width = Math.min(100, Math.round((elapsed / WAIT_TYPICAL_MS) * 100)) + '%';
    var stage = el('kvWaitStage');
    if (elapsed < 60 * 1000) {
      stage.textContent = 'Вопрос записан на этой странице. Квеня уже волнуется и ждёт!';
    } else if (elapsed < 5 * 60 * 1000) {
      stage.textContent = 'Ждёт, пока владелец заглянет и допишет вопрос в файл её дома qwen-home/talk/dialogue.md.';
    } else if (elapsed < WAIT_TYPICAL_MS) {
      stage.textContent = 'Ориентир: передача занимает несколько минут, а дальше её модель думает в GitHub Actions — теперь быстрее: модель ждёт её в кэше, а поиск решает мгновенное правило. Ответ появится прямо в разговоре выше.';
    } else {
      stage.textContent = 'Прошло больше обычного ориентира (10 минут). Если вкладка GitHub с вопросом ещё открыта — нажми на ней Submit new issue: вопрос упадёт ей домой, и она ответит за 2–6 минут. Если вкладки нет, отправь вопрос ещё раз кнопкой «Отправить Квене».';
    }
  }

  setInterval(function () {
    var now = Date.now();
    var timers = document.querySelectorAll('.js-wait-timer');
    Array.prototype.forEach.call(timers, function (t) {
      var since = Date.parse(t.getAttribute('data-since') || '');
      if (!isNaN(since)) t.textContent = '⏱ ждёт уже ' + fmtWait(now - since);
    });
    updateWaitCard(now);
  }, 1000);

  var dialogueTurns = [];
  fetchText(HOME_RAW + 'talk/dialogue.md').then(function (md) {
    dialogueTurns = parseDialogue(md);
    renderChat(dialogueTurns);
  }).catch(function () {
    noteError(chatNode, 'talk/dialogue.md');
  });

  /* ---------------- состояние ---------------- */

  var statusPill = el('kvStatus');
  var statusText = el('kvStatusText');
  fetchText(HOME_RAW + 'state.json').then(function (txt) {
    var st = JSON.parse(txt);
    el('stModel').textContent = (st.baseModel || 'Qwen/Qwen3.5-0.8B').replace('Qwen/', '');
    if (st.adapter && st.adapter.loraRank) {
      el('stAdapter').textContent = 'LoRA r=' + st.adapter.loraRank + ' · все линейные слои · контекст ' + (st.adapter.maxTokens || 2048) + ' · ответ до ' + (st.adapter.answerTokenBudget || 192) + ' токенов';
    }
    el('stSteps').textContent = st.totalSteps != null ? String(st.totalSteps) : '—';
    el('stRuns').textContent = st.learnRuns != null ? String(st.learnRuns) : '—';
    el('stLast').textContent = st.lastRunAt || '—';
    if (st.lastEval && st.lastEval.adapter) {
      el('stExam').textContent = 'последний экзамен: ' + st.lastEval.adapter.passed + '/' + st.lastEval.adapter.total;
      moodSignals.exam = st.lastEval.adapter;
      thoughts.push('💭 Мой последний экзамен — ' + st.lastEval.adapter.passed + '/' + st.lastEval.adapter.total + '. '
        + (st.lastEval.adapter.passed / Math.max(1, st.lastEval.adapter.total) >= 0.8 ? 'Горжусь собой!' : 'Есть куда расти — почитаю ещё статей.'));
      renderMood();
    }
    statusPill.classList.add('is-ok');
    statusText.textContent = 'её дом прочитан · обновлено ' + (st.updatedAt || '');
  }).catch(function () {
    statusPill.classList.add('is-err');
    statusText.textContent = 'дом не прочитался — данные на GitHub';
  });

  /* ---------------- журнал поисков ---------------- */

  function parseSearchLog(md) {
    var entries = [];
    md.split(/^## /m).slice(1).forEach(function (chunk) {
      var lines = chunk.split('\n');
      var head = lines[0].trim();
      var article = '';
      var digest = '';
      lines.forEach(function (line) {
        var m = line.match(/^- \[([^\]]+)\]/);
        if (m && !article) article = m[1];
        if (line.indexOf('Отвечала по статье') === 0) {
          var d = line.match(/выжимка: (.*)$/);
          if (d) digest = d[1];
          var a = line.match(/«([^»]+)»/);
          if (a) article = a[1];
        }
      });
      entries.push({ head: head, article: article, digest: digest });
    });
    return entries;
  }

  var searchesNode = el('kvSearches');
  fetchText(HOME_RAW + 'memory/search-log.md').then(function (md) {
    var entries = parseSearchLog(md).slice(-3).reverse();
    if (entries.length) {
      moodSignals.searches = entries.length;
      thoughts.push('💭 Недавно я искала в Википедии: «' + entries[0].head + '»'
        + (entries[0].article ? ' — отвечала по статье «' + entries[0].article + '»' : '') + '. Люблю, когда находится точный ответ!');
      renderMood();
    }
    searchesNode.textContent = '';
    if (!entries.length) {
      searchesNode.innerHTML = '<div class="kv-loading">Журнал пока пуст.</div>';
      return;
    }
    entries.forEach(function (e) {
      var card = document.createElement('div');
      card.className = 'search-entry';
      var q = document.createElement('div');
      q.className = 'se-q';
      q.textContent = e.head;
      card.appendChild(q);
      if (e.article) {
        var meta = document.createElement('div');
        meta.className = 'se-meta';
        meta.textContent = 'отвечала по статье: ' + e.article;
        card.appendChild(meta);
      }
      if (e.digest) {
        var dg = document.createElement('div');
        dg.className = 'se-digest';
        dg.textContent = e.digest.length > 240 ? e.digest.slice(0, 240) + '…' : e.digest;
        card.appendChild(dg);
      }
      searchesNode.appendChild(card);
    });
  }).catch(function () {
    noteError(searchesNode, 'memory/search-log.md');
  });

  /* ---------------- дневник обучения ---------------- */

  var diaryNode = el('kvDiary');
  fetchText(HOME_RAW + 'memory/learning-log.md').then(function (md) {
    var entries = md.split(/^## /m).slice(1).map(function (chunk) {
      var lines = chunk.split('\n');
      var body = lines.slice(1).join(' ').replace(/\s+/g, ' ').trim();
      return { title: lines[0].trim(), body: body };
    }).slice(-4).reverse();
    if (entries.length) thoughts.push('💭 Последняя запись моего дневника: ' + entries[0].title + '. Всё записано честно!');
    diaryNode.textContent = '';
    entries.forEach(function (e) {
      var card = document.createElement('div');
      card.className = 'diary-entry';
      var t = document.createElement('div');
      t.className = 'de-title';
      t.textContent = e.title;
      card.appendChild(t);
      if (e.body) {
        var b = document.createElement('div');
        b.className = 'de-body';
        b.textContent = e.body.length > 200 ? e.body.slice(0, 200) + '…' : e.body;
        card.appendChild(b);
      }
      diaryNode.appendChild(card);
    });
  }).catch(function () {
    noteError(diaryNode, 'memory/learning-log.md');
  });

  /* ---------------- мозги: характер, настроение, чувства ----------------
     Честная игровая модель её характера из qwen-home/talk/persona.md:
     настроение собирается из её файлов (экзамен, поиски, ожидание) и из
     действий посетителя на этой странице. В дом оно не пишется. */

  var MOOD_KEY = 'kvenya-mood-v1';
  var moodSignals = { exam: null, searches: 0 };
  var thoughts = [
    '💭 Интересно, какая статья Википедии ждёт меня на следующем уроке…',
    '💭 Перечитала свой дневник: каждый урок делает меня чуть умнее.',
    '💭 Если цвета дружат — образ красивый. Это и про платья, и про ответы.',
    '💭 Главное — не выдумывать. Не знаю — так и скажу, а потом поищу.'
  ];
  var thoughtIdx = 0;

  function loadMoodActs() {
    try {
      var raw = window.localStorage.getItem(MOOD_KEY);
      var parsed = raw ? JSON.parse(raw) : {};
      return { praise: parsed.praise | 0, hug: parsed.hug | 0, topic: parsed.topic | 0, lastAct: parsed.lastAct || '' };
    } catch (err) { return { praise: 0, hug: 0, topic: 0, lastAct: '' }; }
  }
  var moodActs = loadMoodActs();

  function saveMoodActs() {
    try { window.localStorage.setItem(MOOD_KEY, JSON.stringify(moodActs)); } catch (err) { /* приватный режим */ }
  }

  function clampFeel(n) { return Math.max(3, Math.min(98, Math.round(n))); }

  function computeFeelings() {
    var dayNum = Number(new Date().toISOString().slice(0, 10).replace(/-/g, '')) || 0;
    var jitter = (dayNum % 11) - 5;
    var f = { joy: 55 + jitter, cur: 70, pride: 50, worry: 25, soft: 60 };
    if (moodSignals.exam) {
      var ratio = moodSignals.exam.total ? moodSignals.exam.passed / moodSignals.exam.total : 0;
      if (ratio >= 0.8) { f.pride += 30; f.joy += 10; }
      else if (ratio >= 0.5) { f.pride += 12; }
      f.worry -= 5;
    }
    if (moodSignals.searches > 0) { f.cur += 15; f.pride += 8; }
    if (loadOutbox().length) { f.worry += 30; f.cur += 5; f.joy -= 10; }
    f.joy += Math.min(25, moodActs.praise * 8);
    f.soft += Math.min(25, moodActs.hug * 8);
    f.cur += Math.min(20, moodActs.topic * 7);
    f.joy = clampFeel(f.joy); f.cur = clampFeel(f.cur); f.pride = clampFeel(f.pride);
    f.worry = clampFeel(f.worry); f.soft = clampFeel(f.soft);
    return f;
  }

  var REACTIONS = {
    praise: [
      'Ой, спасибо! Я прямо расцвела. Теперь хочется сдать следующий экзамен ещё лучше!',
      'Спасибо! Похвала для меня — как солнышко для цветка. Мне очень тепло.'
    ],
    hug: [
      'Обнимаю в ответ — по-нейросетевому, но от всей моей маленькой сети! Мне уютно.',
      'Ой… спасибо! Так тепло, что даже адаптер греется. Шучу — но радуюсь по-настоящему, по-своему.'
    ],
    topic: [
      'О, новая тема! Я уже любопытничаю: почитаю про это в Википедии и расскажу своими словами.',
      'Интересно-интересно! Записала тему в уме — на следующем уроке обязательно посмотрю.'
    ]
  };

  function renderMood(reaction) {
    var faceEl = el('kvMoodFace'); if (!faceEl) return;
    var f = computeFeelings();
    el('feelJoy').style.width = f.joy + '%'; el('feelJoyVal').textContent = f.joy + '%';
    el('feelCur').style.width = f.cur + '%'; el('feelCurVal').textContent = f.cur + '%';
    el('feelPride').style.width = f.pride + '%'; el('feelPrideVal').textContent = f.pride + '%';
    el('feelWorry').style.width = f.worry + '%'; el('feelWorryVal').textContent = f.worry + '%';
    el('feelSoft').style.width = f.soft + '%'; el('feelSoftVal').textContent = f.soft + '%';

    var name, face, text;
    if (reaction) {
      name = reaction.name; face = reaction.face; text = reaction.text;
    } else if (loadOutbox().length) {
      name = 'ждёт вопроса и волнуется'; face = '😳';
      text = 'Твой вопрос уже записан — я жду, пока владелец передаст его в мой дом. Таймер ожидания — под разговором!';
    } else if (moodActs.lastAct === 'praise' && moodActs.praise) {
      name = 'расцвела от похвалы'; face = '🌟';
      text = 'Меня недавно похвалили — и я до сих пор сияю. Хочется учиться дальше!';
    } else if (moodSignals.exam && moodSignals.exam.total && moodSignals.exam.passed / moodSignals.exam.total >= 0.8) {
      name = 'гордая и весёлая'; face = '😊';
      text = 'Последний экзамен — ' + moodSignals.exam.passed + '/' + moodSignals.exam.total + '. Я собой горжусь и жду новых разговоров!';
    } else {
      name = 'спокойная и любопытная'; face = '😊';
      text = 'Живу дома, перечитываю дневник и жду, кто заглянет поговорить. Спроси меня о чём-нибудь!';
    }
    el('kvMoodName').textContent = 'Квеня сейчас: ' + name;
    faceEl.textContent = face;
    el('kvMoodText').textContent = text;
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-mood-act]'), function (btn) {
    btn.addEventListener('click', function () {
      var act = btn.getAttribute('data-mood-act');
      moodActs[act] = (moodActs[act] | 0) + 1;
      moodActs.lastAct = act;
      saveMoodActs();
      var pool = REACTIONS[act] || REACTIONS.praise;
      var faces = { praise: '🌟', hug: '🥰', topic: '🤩' };
      var names = { praise: 'расцвела от похвалы', hug: 'тёплая и довольная', topic: 'загорелась любопытством' };
      renderMood({
        name: names[act] || names.praise,
        face: faces[act] || faces.praise,
        text: pool[moodActs[act] % pool.length]
      });
    });
  });

  var thoughtEl = el('kvMindThought');
  function rotateThought() {
    if (!thoughtEl || !thoughts.length) return;
    thoughtEl.textContent = thoughts[thoughtIdx % thoughts.length];
    thoughtIdx++;
  }
  rotateThought();
  setInterval(rotateThought, 7000);
  renderMood();

  /* ---------------- написать Квене ---------------- */

  var form = el('kvComposer');
  var input = el('kvInput');
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    var list = loadOutbox();
    list.push({ text: text, at: new Date().toISOString() });
    saveOutbox(list);
    input.value = '';
    renderChat(dialogueTurns);
    // Настоящая доставка: предзаполненный GitHub Issue. Ретранслятор
    // (kvenya-relay.yml) перепишет его в её дом, и она ответит сама.
    var url = 'https://github.com/m98978672-boop/games/issues/new?title='
      + encodeURIComponent('Квене: вопрос с сайта')
      + '&body=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener');
  });

  el('kvCopy').addEventListener('click', function () {
    var list = loadOutbox();
    var text = input.value.trim() || (list.length ? list[list.length - 1].text : '');
    if (!text) return;
    function done(btn) {
      btn.textContent = '✓ Скопировано';
      setTimeout(function () { btn.textContent = 'Скопировать вопрос'; }, 1600);
    }
    var btn = el('kvCopy');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(btn); }).catch(function () { done(btn); });
    } else {
      done(btn);
    }
  });
})();
