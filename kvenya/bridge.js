/* Мост Квени между её средой и окружающей средой (браузерная сторона).
   - читает сводку дома bridge.json (свежие правки Википедии + её весточки);
   - умеет вживую заглянуть в русскую Википедию из браузера (открытый API, CORS);
   - весточку наружу отправляет только через владельца: открывает
     предзаполненный вопрос на GitHub, который ретранслятор кладёт в её дом.
   Сама в чужие сервисы браузерная Квеня не пишет — это честная граница. */
(function () {
  'use strict';
  var sensesEl = document.getElementById('kvBridgeSenses');
  var lettersEl = document.getElementById('kvBridgeLetters');
  var liveBtn = document.getElementById('kvBridgeLive');
  var letterBtn = document.getElementById('kvBridgeLetter');
  var searchForm = document.getElementById('kvBridgeSearch');
  var searchInput = document.getElementById('kvBridgeQuery');
  var searchOut = document.getElementById('kvBridgeResult');
  if (!sensesEl && !lettersEl) return;

  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  function renderDigest(data) {
    if (sensesEl) {
      var rows = (data.recent || []).slice(0, 6).map(function (r) {
        return '<li>«' + esc(r.title) + '» — ' + esc(r.user) + (r.comment ? ': ' + esc(r.comment) : '') + '</li>';
      }).join('');
      sensesEl.innerHTML = rows
        ? '<p class="kv-note">Что мир правит в Википедии (сводка дома от ' + esc(data.updatedAt) + '):</p><ul class="kv-bridge-list">' + rows + '</ul>'
        : '<p class="kv-note">Дом ещё не принёс первую сводку — нажми «Заглянуть вживую», и я посмотрю сама прямо сейчас.</p>';
    }
    if (lettersEl) {
      var letters = (data.letters || []).slice(-3).map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('');
      lettersEl.innerHTML = letters ? '<ul class="kv-bridge-list">' + letters + '</ul>' : '';
    }
  }

  var expEl = document.getElementById('kvBridgeExpeditions');
  var EXP_STATUS = {
    'played': '🎮 сыграла сама: ввод ушёл в игру, видео записано',
    'opened-only': '🚪 открыла страницу, но до игры не дошло',
    'no-canvas': '🖱 кнопку нажала, а игрового канваса нет',
    'captcha-wall': '🧱 упёрлась в «я не робот» — сфотографировала и честно остановилась',
    'error': '🌧 не открылось: сеть или браузер не дали'
  };
  function renderExpeditions(data) {
    if (!expEl) return;
    var list = data.expeditions || [];
    if (!list.length) {
      expEl.innerHTML = '<p class="kv-note">Экспедиций ещё не было: первая уйдёт сама по расписанию в понедельник, или запусти её вручную на GitHub Actions (кнопка ниже).</p>';
      return;
    }
    expEl.innerHTML = list.map(function (e) {
      var shots = (e.screenshots || []).slice(0, 2).map(function (f) {
        return '<img src="../' + esc(e.dir) + '/' + esc(f) + '" alt="кадр экспедиции" loading="lazy" style="max-width:220px;border-radius:10px;margin:4px 8px 4px 0">';
      }).join('');
      return '<div class="kv-expedition"><p class="kv-note">🧭 <b>' + esc(e.date) + '</b> · ' + esc(EXP_STATUS[e.status] || e.status)
        + '<br><a href="' + esc(e.url) + '" target="_blank" rel="noopener">' + esc(e.url) + '</a>'
        + ' · <a href="../' + esc(e.dir) + '/report.json" target="_blank" rel="noopener">пошаговый отчёт</a>'
        + (e.hasVideo ? ' · видео — в артефактах запуска на GitHub Actions' : '') + '</p>' + shots + '</div>';
    }).join('');
  }

  fetch('./bridge.json', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) { if (data) { renderDigest(data); renderExpeditions(data); } })
    .catch(function () { /* сводки нет — есть живая кнопка */ });

  function wikiApi(params) {
    params.origin = '*';
    params.format = 'json';
    var qs = Object.keys(params).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&');
    return fetch('https://ru.wikipedia.org/w/api.php?' + qs).then(function (r) {
      if (!r.ok) throw new Error('Википедия ответила ' + r.status);
      return r.json();
    });
  }

  if (liveBtn) liveBtn.addEventListener('click', function () {
    liveBtn.disabled = true;
    if (sensesEl) sensesEl.innerHTML = '<p class="kv-note">Заглядываю в Википедию прямо сейчас…</p>';
    wikiApi({ action: 'query', list: 'recentchanges', rcnamespace: '0', rcprop: 'title|user|comment', rclimit: '6', rctype: 'edit|new' })
      .then(function (data) {
        var rows = ((data.query || {}).recentchanges || []).map(function (r) {
          return '<li>«' + esc(r.title) + '» — ' + esc(r.user) + (r.comment ? ': ' + esc(r.comment) : '') + '</li>';
        }).join('');
        if (sensesEl) sensesEl.innerHTML = '<p class="kv-note">Смотрю вживую — свежие правки русской Википедии в эту минуту:</p><ul class="kv-bridge-list">' + rows + '</ul>';
      })
      .catch(function () {
        if (sensesEl) sensesEl.innerHTML = '<p class="kv-note">Википедия сейчас не ответила — честно жду и не выдумываю новости.</p>';
      })
      .finally(function () { liveBtn.disabled = false; });
  });

  if (searchForm) searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = (searchInput.value || '').trim();
    if (!q || !searchOut) return;
    searchOut.textContent = 'Ищу «' + q + '» в Википедии…';
    wikiApi({ action: 'query', prop: 'extracts', exintro: '1', explaintext: '1', redirects: '1', titles: q })
      .then(function (data) {
        var pages = (data.query || {}).pages || {};
        var first = pages[Object.keys(pages)[0]] || {};
        var text = (first.extract || '').trim();
        searchOut.textContent = text
          ? 'Нашла статью «' + (first.title || q) + '»: ' + text.slice(0, 420)
          : 'Такой статьи не нашла — честно говорю, а не придумываю.';
      })
      .catch(function () { searchOut.textContent = 'Поиск не удался: Википедия не ответила.'; });
  });

  if (letterBtn) letterBtn.addEventListener('click', function () {
    var title = encodeURIComponent('Квене: весточка через мост');
    var body = encodeURIComponent('Квеня, это весточка через твой мост. Напиши сюда, что хочешь ей передать:\n\n');
    window.open('https://github.com/m98978672-boop/games/issues/new?title=' + title + '&body=' + body, '_blank', 'noopener');
  });
})();
