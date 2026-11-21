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

  function bubble(who, text, pending, onRemove) {
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
      wait.textContent = '⏳ ждёт передачи: владелец допишет вопрос в её дом — и она ответит';
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
      }));
    });
    chatNode.scrollTop = chatNode.scrollHeight;
  }

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
    el('stSteps').textContent = st.totalSteps != null ? String(st.totalSteps) : '—';
    el('stRuns').textContent = st.learnRuns != null ? String(st.learnRuns) : '—';
    el('stLast').textContent = st.lastRunAt || '—';
    if (st.lastEval && st.lastEval.adapter) {
      el('stExam').textContent = 'последний экзамен: ' + st.lastEval.adapter.passed + '/' + st.lastEval.adapter.total;
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
