(function (global) {
  'use strict';

  var DD = global.DD = global.DD || {};
  var PAGE_SIZE = 24;
  var RATING_KEY = 'dd_asset_ratings_v1';

  var isOpen = false;
  var activeTab = 'all'; // all | base | texture | model | mesh
  var rateFilter = 'all'; // all | bad | good | unrated
  var searchQuery = '';
  var currentPage = 0;
  var filteredCache = null;
  var lastKey = '';
  var baseImgCache = {};
  var previewTimer = null;
  var inspectedItem = null;
  var previewYaw = 0.62;
  var onToggleCb = null;
  var ratingsMap = null;
  var referenceReady = false;
  var referenceVersion = 0;
  var assistantResult = '';
  var animationTime = 0;

  function loadRatings() {
    if (ratingsMap) return ratingsMap;
    var parsed = null;
    try {
      var raw = global.localStorage && global.localStorage.getItem(RATING_KEY);
      if (raw) {
        try { parsed = JSON.parse(raw); } catch (_e1) { parsed = null; }
      }
    } catch (_e2) {
      parsed = null;
    }
    ratingsMap = (parsed && typeof parsed === 'object') ? parsed : {};
    return ratingsMap;
  }

  function saveRatings() {
    var map = loadRatings();
    try {
      if (global.localStorage) global.localStorage.setItem(RATING_KEY, JSON.stringify(map));
    } catch (err) {
      if (typeof console !== 'undefined' && console.debug) console.debug('saveRatings skipped', err);
    }
  }

  function getBaseList() {
    var raw = (global.DD_DATA && global.DD_DATA.manifest) || [];
    var out = [];
    for (var i = 0; i < raw.length; i++) {
      var a = raw[i];
      out.push({
        isBase: true,
        index: i,
        code: a.id,
        kind: a.type === '3D_glb' ? 'base_3d' : (a.type.indexOf('audio_') === 0 ? 'base_audio' : 'base_2d'),
        kindLabel: a.type,
        family: a.category,
        name: a.notes || a.id,
        file: a.file,
        dimensions: a.dimensions || '-',
        frames: a.frames || 1,
        specs: (a.dimensions || a.type) + (a.frames > 1 ? ' · ' + a.frames + ' кадр.' : '')
      });
    }
    return out;
  }

  function invalidateFilter() {
    filteredCache = null;
    lastKey = '';
  }

  function findItemByCode(code) {
    var bases = getBaseList();
    for (var i = 0; i < bases.length; i++) {
      if (bases[i].code === code) return bases[i];
    }
    var all = DD.ContentPack.getAll();
    for (var j = 0; j < all.length; j++) {
      if (all[j].code === code) return all[j];
    }
    return null;
  }

  function rateItem(itemOrCode, vote, note) {
    var item = typeof itemOrCode === 'string' ? findItemByCode(itemOrCode) : itemOrCode;
    var code = typeof itemOrCode === 'string' ? itemOrCode : (item && item.code);
    if (!code) return null;

    var map = loadRatings();
    if (!vote) {
      delete map[code];
    } else {
      var prev = map[code];
      var finalNote = typeof note === 'string' ? note : ((prev && prev.note) || '');
      map[code] = {
        code: code,
        vote: vote === 'bad' ? 'bad' : 'good',
        note: finalNote.trim(),
        name: (item && item.name) || (prev && prev.name) || code,
        kindLabel: (item && item.kindLabel) || (prev && prev.kindLabel) || '',
        family: (item && item.family) || (prev && prev.family) || '',
        file: (item && item.file) || (prev && prev.file) || '',
        updatedAt: new Date().toISOString()
      };
    }
    saveRatings();
    invalidateFilter();
    refreshRatingUi();
    return map[code] || null;
  }

  function getRatingStats() {
    var map = loadRatings();
    var keys = Object.keys(map);
    var good = 0, bad = 0;
    for (var i = 0; i < keys.length; i++) {
      if (map[keys[i]].vote === 'bad') bad++;
      else if (map[keys[i]].vote === 'good') good++;
    }
    return { good: good, bad: bad, total: keys.length };
  }

  function getBadList() {
    var map = loadRatings();
    var keys = Object.keys(map).sort();
    var out = [];
    for (var i = 0; i < keys.length; i++) {
      if (map[keys[i]].vote === 'bad') out.push(map[keys[i]]);
    }
    return out;
  }

  function getBadReportText() {
    var bad = getBadList();
    if (!bad.length) return 'Пока нет ассетов с оценкой 👎 «Плохо». Поставьте 👎 нужным текстурам или моделькам в каталоге F3.';
    var lines = ['DEAD DISTRICT — СПИСОК НА ЗАМЕНУ (' + bad.length + '):'];
    for (var i = 0; i < bad.length; i++) {
      var r = bad[i];
      var loc = r.file ? ' | файл: ' + r.file : '';
      var reason = r.note ? ' | причина: ' + r.note : '';
      lines.push((i + 1) + '. [' + r.code + '] ' + r.name + ' (' + (r.kindLabel || r.family) + loc + ')' + reason);
    }
    return lines.join('\n');
  }

  function clearRatings() {
    ratingsMap = {};
    saveRatings();
    invalidateFilter();
    refreshRatingUi();
  }

  function refreshRatingUi() {
    if (typeof document === 'undefined') return;
    var st = getRatingStats();
    var badBtn = document.getElementById('f3-filter-bad');
    var goodBtn = document.getElementById('f3-filter-good');
    var statsEl = document.getElementById('f3-rating-stats');
    var expToggle = document.getElementById('f3-export-toggle');
    if (badBtn) badBtn.textContent = '👎 Плохие (' + st.bad + ')';
    if (goodBtn) goodBtn.textContent = '👍 Хорошие (' + st.good + ')';
    if (statsEl) statsEl.textContent = 'Оценено: 👍 ' + st.good + ' · 👎 ' + st.bad;
    if (expToggle) expToggle.textContent = '📋 Список плохих (' + st.bad + ')';

    var rBtns = document.querySelectorAll('[data-f3-rate]');
    for (var i = 0; i < rBtns.length; i++) {
      var b = rBtns[i];
      if (b.getAttribute('data-f3-rate') === rateFilter) b.classList.add('active');
      else b.classList.remove('active');
    }

    var expText = document.getElementById('f3-export-text');
    if (expText) expText.value = getBadReportText();
  }

  function getFilteredList() {
    var key = activeTab + '|' + rateFilter + '|' + searchQuery.trim().toLowerCase();
    if (filteredCache && key === lastKey) return filteredCache;
    lastKey = key;
    var q = searchQuery.trim().toLowerCase();
    var map = loadRatings();
    var source;
    if (activeTab === 'base') {
      source = getBaseList();
    } else if (activeTab === 'all') {
      source = getBaseList().concat(DD.ContentPack.getAll());
    } else {
      source = DD.ContentPack.getAll();
    }

    var out = [];
    for (var i = 0; i < source.length; i++) {
      var it = source[i];
      if (activeTab !== 'all' && activeTab !== 'base' && it.kind !== activeTab) continue;
      if (rateFilter !== 'all') {
        var r = map[it.code];
        if (rateFilter === 'bad' && (!r || r.vote !== 'bad')) continue;
        if (rateFilter === 'good' && (!r || r.vote !== 'good')) continue;
        if (rateFilter === 'unrated' && r) continue;
      }
      if (q) {
        var hay = (it.code + ' ' + it.name + ' ' + it.family + ' ' + (it.file || '')).toLowerCase();
        if (hay.indexOf(q) < 0) continue;
      }
      out.push(it);
    }
    filteredCache = out;
    return out;
  }

  function drawBaseCard(canvas, item, yaw) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var sz = canvas.width;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, sz, sz);

    if (item.kind === 'base_3d') {
      DD.ContentPack.renderBaseGlbPreview(ctx, item.code, sz, yaw);
      return;
    }
    if (item.kind === 'base_audio') {
      ctx.fillStyle = '#191d2b';
      ctx.fillRect(0, 0, sz, sz);
      ctx.fillStyle = '#c9cb9f';
      for (var b = 0; b < 8; b++) {
        var h = 14 + ((item.index * 17 + b * 23) % 44);
        ctx.fillRect(8 + b * 9, (sz - h) * 0.5, 6, h);
      }
      return;
    }
    if (!item.file || item.file.indexOf('.png') < 0) {
      ctx.fillStyle = '#2d2738';
      ctx.fillRect(8, 8, sz - 16, sz - 16);
      ctx.fillStyle = '#c9cb9f';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(item.kindLabel.slice(0, 8), 12, sz * 0.54);
      return;
    }
    var img = baseImgCache[item.file];
    if (!img) {
      if (typeof global.Image === 'function') {
        img = new global.Image();
        img.onload = function () { if (isOpen) { renderCurrentPage(); if (inspectedItem && inspectedItem.code === item.code) renderInspector(); } };
        img.src = item.file;
        baseImgCache[item.file] = img;
      }
    }
    if (img && img.complete && img.naturalWidth > 0) {
      var cw = img.width;
      var ch = img.height;
      if (item.frames > 1) {
        cw = item.code.indexOf('brute') >= 0 ? 40 : (img.width >= 32 && img.height >= 32 ? 32 : Math.floor(img.width / item.frames));
        ch = item.code.indexOf('brute') >= 0 ? 48 : (img.height >= 32 ? 32 : img.height);
      }
      var pad = 6;
      var scale = Math.min((sz - pad * 2) / Math.max(1, cw), (sz - pad * 2) / Math.max(1, ch));
      var dw = Math.max(1, Math.floor(cw * scale));
      var dh = Math.max(1, Math.floor(ch * scale));
      ctx.drawImage(img, 0, 0, cw, ch, Math.floor((sz - dw) * 0.5), Math.floor((sz - dh) * 0.5), dw, dh);
    } else {
      ctx.fillStyle = '#2d2738';
      ctx.fillRect(10, 10, sz - 20, sz - 20);
    }
  }

  function renderInspector() {
    if (typeof document === 'undefined') return;
    var box = document.getElementById('f3-inspector');
    var c = document.getElementById('f3-inspect-canvas');
    var title = document.getElementById('f3-inspect-title');
    var meta = document.getElementById('f3-inspect-meta');
    var noteIn = document.getElementById('f3-inspect-note');
    if (!box || !c || !title || !meta) return;
    if (!inspectedItem) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    var rec = loadRatings()[inspectedItem.code];
    var voteLabel = rec ? (rec.vote === 'bad' ? ' · 👎 ПЛОХАЯ (на замену)' : ' · 👍 ХОРОШАЯ') : '';
    title.textContent = '[' + inspectedItem.code + '] ' + inspectedItem.name + voteLabel;
    meta.textContent = 'Категория: ' + inspectedItem.family + ' · Тип: ' + inspectedItem.kindLabel + ' · ' + inspectedItem.specs + (inspectedItem.file ? ' · Файл: ' + inspectedItem.file : '');
    if (noteIn && document.activeElement !== noteIn) noteIn.value = (rec && rec.note) || '';
    if (inspectedItem.isBase) drawBaseCard(c, inspectedItem, previewYaw);
    else DD.ContentPack.renderItemToCanvas(c, inspectedItem, previewYaw);
  }

  function renderCurrentPage() {
    var grid = document.getElementById('f3-grid');
    var pageInfo = document.getElementById('f3-page-info');
    var countInfo = document.getElementById('f3-count-info');
    if (!grid) return;

    refreshRatingUi();
    var map = loadRatings();
    var list = getFilteredList();
    var totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (currentPage >= totalPages) currentPage = totalPages - 1;
    if (currentPage < 0) currentPage = 0;

    if (countInfo) {
      countInfo.textContent = 'Показано: ' + list.length.toLocaleString('ru-RU') + ' (в библиотеке 10 000 + 181 базовых)';
    }
    if (pageInfo) {
      pageInfo.textContent = 'Стр. ' + (currentPage + 1) + ' / ' + totalPages;
    }
    var jump = document.getElementById('f3-page-jump');
    if (jump && document.activeElement !== jump) { jump.value = currentPage + 1; jump.max = totalPages; }
    grid.innerHTML = '';
    if (!list.length) grid.textContent = 'Ничего не найдено. Измените поиск или фильтр.';
    var start = currentPage * PAGE_SIZE;
    var end = Math.min(list.length, start + PAGE_SIZE);
    for (var i = start; i < end; i++) {
      (function (item) {
        var rating = map[item.code];
        var card = document.createElement('div');
        card.className = 'f3-card' + (rating ? (rating.vote === 'bad' ? ' rated-bad' : ' rated-good') : '');
        card.title = item.code + ' — ' + item.name;

        var previewWrap = document.createElement('div');
        previewWrap.className = 'f3-card-preview';
        previewWrap.setAttribute('role', 'button');
        previewWrap.setAttribute('tabindex', '0');
        previewWrap.setAttribute('aria-label', 'Открыть ' + item.code + ' ' + item.name);

        var cv = document.createElement('canvas');
        cv.width = 84;
        cv.height = 84;
        cv.className = 'f3-thumb';
        if (item.isBase) drawBaseCard(cv, item, 0.62);
        else DD.ContentPack.renderItemToCanvas(cv, item, 0.62);

        var codeEl = document.createElement('div');
        codeEl.className = 'f3-code';
        codeEl.textContent = item.code + ' · ' + item.kindLabel + (rating ? (rating.vote === 'bad' ? ' · 👎 ЗАМЕНА' : ' · 👍 ОК') : '');

        var nameEl = document.createElement('div');
        nameEl.className = 'f3-name';
        nameEl.textContent = item.name;

        var specEl = document.createElement('div');
        specEl.className = 'f3-spec';
        specEl.textContent = item.family + ' · ' + item.specs;

        previewWrap.appendChild(cv);
        previewWrap.appendChild(codeEl);
        previewWrap.appendChild(nameEl);
        previewWrap.appendChild(specEl);

        if (rating && rating.note) {
          var noteEl = document.createElement('div');
          noteEl.className = 'f3-note-badge';
          noteEl.textContent = 'Заметка: ' + rating.note;
          previewWrap.appendChild(noteEl);
        }

        previewWrap.addEventListener('click', function () {
          inspectedItem = item;
          assistantResult = '';
          var result = document.getElementById('f3-assess-result');
          if (result) result.textContent = 'Нажмите «Проверить» для этого ассета.';
          renderInspector();
        });

        previewWrap.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); previewWrap.click(); } });

        var rateRow = document.createElement('div');
        rateRow.className = 'f3-rate-row';

        var goodBtn = document.createElement('button');
        goodBtn.type = 'button';
        goodBtn.className = 'f3-rate-btn' + (rating && rating.vote === 'good' ? ' active-good' : '');
        goodBtn.textContent = '👍 Ок';
        goodBtn.addEventListener('click', function (ev) {
          if (ev && ev.stopPropagation) ev.stopPropagation();
          var nextVote = (rating && rating.vote === 'good') ? null : 'good';
          rateItem(item, nextVote);
          renderCurrentPage();
          if (inspectedItem && inspectedItem.code === item.code) renderInspector();
        });

        var badBtn = document.createElement('button');
        badBtn.type = 'button';
        badBtn.className = 'f3-rate-btn' + (rating && rating.vote === 'bad' ? ' active-bad' : '');
        badBtn.textContent = '👎 Плохая';
        badBtn.addEventListener('click', function (ev) {
          if (ev && ev.stopPropagation) ev.stopPropagation();
          var nextVote = (rating && rating.vote === 'bad') ? null : 'bad';
          rateItem(item, nextVote);
          renderCurrentPage();
          if (inspectedItem && inspectedItem.code === item.code) renderInspector();
        });

        rateRow.appendChild(goodBtn);
        rateRow.appendChild(badBtn);

        card.appendChild(previewWrap);
        card.appendChild(rateRow);
        grid.appendChild(card);
      })(list[i]);
    }

    var tabs = document.querySelectorAll('[data-f3-tab]');
    for (var t = 0; t < tabs.length; t++) {
      var tb = tabs[t];
      if (tb.getAttribute('data-f3-tab') === activeTab) tb.classList.add('active');
      else tb.classList.remove('active');
    }
  }

  function startSpinTimer() {
    if (previewTimer) return;
    if (typeof global.setInterval !== 'function') return;
    previewTimer = global.setInterval(function () {
      if (!isOpen) return;
      var animPanel = document.getElementById('f3-animations');
      if (animPanel && !animPanel.hidden && DD.Renderer) { animationTime += 0.06; DD.Renderer.renderAnimationPreview(document.getElementById('anim-preview'), selectedAnimation(), animationTime); }
      if (inspectedItem && (inspectedItem.kind === 'mesh' || inspectedItem.kind === 'base_3d')) {
        previewYaw += 0.08;
        var canvas = document.getElementById('f3-inspect-canvas');
        if (canvas) {
          if (inspectedItem.isBase) drawBaseCard(canvas, inspectedItem, previewYaw);
          else DD.ContentPack.renderItemToCanvas(canvas, inspectedItem, previewYaw);
        }
      }
    }, 60);
  }

  function stopSpinTimer() {
    if (previewTimer) {
      global.clearInterval(previewTimer);
      previewTimer = null;
    }
  }

  function setOpen(val) {
    isOpen = Boolean(val);
    if (typeof document === 'undefined') return;
    var overlay = document.getElementById('f3-overlay');
    if (overlay) overlay.hidden = !isOpen;
    if (isOpen) {
      renderCurrentPage();
      startSpinTimer();
    } else {
      stopSpinTimer();
      inspectedItem = null;
      var box = document.getElementById('f3-inspector');
      if (box) box.hidden = true;
      var expPanel = document.getElementById('f3-export-panel');
      if (expPanel) expPanel.hidden = true;
    }
    if (typeof onToggleCb === 'function') onToggleCb(isOpen);
  }

  function selectedAnimation() {
    function selected(id) { var e = document.getElementById(id); return e ? e.selectedIndex : 0; }
    var input = document.getElementById('anim-variant');
    var n = Math.max(1, Math.min(100, Number(input && input.value) || 1));
    return DD.Animations.get(selected('anim-action') * 2000 + selected('anim-direction') * 500 + selected('anim-style') * 100 + Math.floor(n) - 1);
  }

  function init(opts) {
    onToggleCb = opts && opts.onToggle;
    var overlay = document.getElementById('f3-overlay');
    if (!overlay) return;

    var tabs = overlay.querySelectorAll('[data-f3-tab]');
    for (var i = 0; i < tabs.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          activeTab = btn.getAttribute('data-f3-tab') || 'all';
          currentPage = 0;
          renderCurrentPage();
        });
      })(tabs[i]);
    }

    var rateBtns = overlay.querySelectorAll('[data-f3-rate]');
    for (var r = 0; r < rateBtns.length; r++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          rateFilter = btn.getAttribute('data-f3-rate') || 'all';
          currentPage = 0;
          renderCurrentPage();
        });
      })(rateBtns[r]);
    }

    var reasonBtns = overlay.querySelectorAll('[data-f3-reason]');
    for (var k = 0; k < reasonBtns.length; k++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          if (!inspectedItem) return;
          var txt = btn.getAttribute('data-f3-reason') || '';
          rateItem(inspectedItem, 'bad', txt);
          renderInspector();
          renderCurrentPage();
        });
      })(reasonBtns[k]);
    }

    var search = document.getElementById('f3-search');
    if (search) {
      search.addEventListener('input', function () {
        searchQuery = search.value || '';
        currentPage = 0;
        renderCurrentPage();
      });
    }

    var bindBtn = function (id, fn) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('click', fn);
    };
    bindBtn('f3-close', function () { setOpen(false); });
    bindBtn('f3-page-go', function () {
      var input = document.getElementById('f3-page-jump');
      var max = Math.max(1, Math.ceil(getFilteredList().length / PAGE_SIZE));
      currentPage = Math.max(0, Math.min(max - 1, Math.floor(Number(input && input.value) || 1) - 1));
      renderCurrentPage();
    });
    bindBtn('f3-animation-toggle', function () {
      var panel = document.getElementById('f3-animations');
      panel.hidden = !panel.hidden;
      updateAnimationLabel();
    });
    function updateAnimationLabel() {
      var preset = selectedAnimation();
      var label = document.getElementById('anim-label');
      if (label && preset) label.textContent = preset.code + ' · ' + preset.label;
      if (DD.Renderer) DD.Renderer.renderAnimationPreview(document.getElementById('anim-preview'), preset, animationTime);
    }
    ['anim-action', 'anim-direction', 'anim-style', 'anim-variant'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', updateAnimationLabel);
    });
    bindBtn('anim-apply', function () {
      if (DD.Renderer) DD.Renderer.setAnimationStyle(selectedAnimation());
      var status = document.getElementById('anim-status');
      if (status) status.textContent = 'Применено до перезагрузки страницы.';
    });
    var referenceInput = document.getElementById('f3-reference');
    if (referenceInput) referenceInput.addEventListener('change', function () {
      referenceReady = false;
      var version = ++referenceVersion;
      var file = referenceInput.files && referenceInput.files[0];
      var result = document.getElementById('f3-assess-result');
      if (!file) { if (result) result.textContent = 'Эталон не выбран.'; return; }
      if (!/^image\/(png|jpeg)$/.test(file.type) || file.size > 5 * 1024 * 1024) {
        if (result) result.textContent = 'Выберите PNG или JPEG размером не более 5 МБ.'; return;
      }
      var url = global.URL.createObjectURL(file);
      var img = new global.Image();
      img.onload = function () {
        global.URL.revokeObjectURL(url);
        if (version !== referenceVersion) return;
        var ref = document.getElementById('f3-reference-preview');
        var ctx = ref.getContext('2d'); ctx.clearRect(0, 0, 64, 64); ctx.drawImage(img, 0, 0, 64, 64);
        referenceReady = true;
        if (result) result.textContent = 'Эталон загружен локально. Нажмите «Проверить».';
      };
      img.onerror = function () { global.URL.revokeObjectURL(url); if (version === referenceVersion && result) result.textContent = 'Не удалось прочитать изображение.'; };
      img.src = url;
    });
    bindBtn('f3-assess', function () {
      if (!inspectedItem) return;
      var result = document.getElementById('f3-assess-result');
      try {
        var sample = document.createElement('canvas'); sample.width = 64; sample.height = 64;
        var ctx = sample.getContext('2d'); ctx.imageSmoothingEnabled = false;
        ctx.drawImage(document.getElementById('f3-inspect-canvas'), 0, 0, 64, 64);
        var pixels = ctx.getImageData(0, 0, 64, 64).data;
        var refCanvas = document.getElementById('f3-reference-preview');
        var ref = referenceReady ? refCanvas.getContext('2d').getImageData(0, 0, 64, 64).data : null;
        var report = DD.AssetAssistant.analyze(pixels, ref);
        assistantResult = 'Контраст: ' + Math.round(report.contrast * 100) + '%, заполнение: ' + Math.round(report.coverage * 100) + '%' +
          (ref ? ', разница с эталоном: ' + Math.round(report.difference * 100) + '%' : ' (без эталона)') +
          (report.warnings.length ? '. Возможные проблемы: ' + report.warnings.join(', ') : '. Технических предупреждений нет.');
        if (result) result.textContent = assistantResult + ' Сравниваются уменьшенные предпросмотры; это не оценка сходства по смыслу.';
      } catch (err) { if (result) result.textContent = 'Не удалось проверить изображение: ' + err.message; }
    });
    bindBtn('f3-assess-note', function () {
      var note = document.getElementById('f3-inspect-note');
      if (note && assistantResult) { note.value = (note.value ? note.value + ' | ' : '') + assistantResult; note.focus(); }
    });
    bindBtn('f3-first', function () { currentPage = 0; renderCurrentPage(); });
    bindBtn('f3-prev', function () { currentPage = Math.max(0, currentPage - 1); renderCurrentPage(); });
    bindBtn('f3-next', function () {
      var list = getFilteredList();
      var maxP = Math.max(0, Math.ceil(list.length / PAGE_SIZE) - 1);
      currentPage = Math.min(maxP, currentPage + 1);
      renderCurrentPage();
    });
    bindBtn('f3-last', function () {
      var list = getFilteredList();
      currentPage = Math.max(0, Math.ceil(list.length / PAGE_SIZE) - 1);
      renderCurrentPage();
    });
    bindBtn('f3-inspect-close', function () {
      inspectedItem = null;
      renderInspector();
    });
    bindBtn('f3-inspect-good', function () {
      if (!inspectedItem) return;
      var noteEl = document.getElementById('f3-inspect-note');
      rateItem(inspectedItem, 'good', noteEl ? noteEl.value : '');
      renderInspector();
      renderCurrentPage();
    });
    bindBtn('f3-inspect-bad', function () {
      if (!inspectedItem) return;
      var noteEl = document.getElementById('f3-inspect-note');
      rateItem(inspectedItem, 'bad', noteEl ? noteEl.value : '');
      renderInspector();
      renderCurrentPage();
    });
    bindBtn('f3-inspect-clear', function () {
      if (!inspectedItem) return;
      rateItem(inspectedItem, null);
      renderInspector();
      renderCurrentPage();
    });
    bindBtn('f3-inspect-save-note', function () {
      if (!inspectedItem) return;
      var noteEl = document.getElementById('f3-inspect-note');
      var cur = loadRatings()[inspectedItem.code];
      rateItem(inspectedItem, (cur && cur.vote) || 'bad', noteEl ? noteEl.value : '');
      renderInspector();
      renderCurrentPage();
    });
    bindBtn('f3-export-toggle', function () {
      var panel = document.getElementById('f3-export-panel');
      if (!panel) return;
      panel.hidden = !panel.hidden;
      refreshRatingUi();
    });
    bindBtn('f3-export-close', function () {
      var panel = document.getElementById('f3-export-panel');
      if (panel) panel.hidden = true;
    });
    bindBtn('f3-export-copy', function () {
      var text = getBadReportText();
      var box = document.getElementById('f3-export-text');
      var status = document.getElementById('f3-export-status');
      if (box) {
        box.value = text;
        if (typeof box.select === 'function') box.select();
      }
      if (global.navigator && global.navigator.clipboard && typeof global.navigator.clipboard.writeText === 'function') {
        try {
          global.navigator.clipboard.writeText(text).then(function () {
            if (status) status.textContent = 'Список скопирован в буфер обмена!';
          }).catch(function () {
            if (status) status.textContent = 'Выделите текст выше и нажмите Ctrl+C.';
          });
          return;
        } catch (errClip) {
          if (typeof console !== 'undefined' && console.debug) console.debug('clipboard skipped', errClip);
        }
      }
      if (status) status.textContent = 'Список готов в поле выше — скопируйте Ctrl+C.';
    });
    bindBtn('f3-export-download', function () {
      var payload = JSON.stringify({ game: 'Dead District', badAssets: getBadList() }, null, 2);
      var status = document.getElementById('f3-export-status');
      if (typeof global.Blob === 'function' && typeof global.URL !== 'undefined' && typeof global.URL.createObjectURL === 'function') {
        try {
          var blob = new global.Blob([payload], { type: 'application/json' });
          var url = global.URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = 'dead-district-bad-assets.json';
          if (document.body) document.body.appendChild(a);
          if (typeof a.click === 'function') a.click();
          if (document.body && a.parentNode === document.body) document.body.removeChild(a);
          if (typeof global.URL.revokeObjectURL === 'function') global.URL.revokeObjectURL(url);
          if (status) status.textContent = 'Файл dead-district-bad-assets.json скачан!';
          return;
        } catch (errDl) {
          if (typeof console !== 'undefined' && console.debug) console.debug('download skipped', errDl);
        }
      }
      if (status) status.textContent = 'Скачивание недоступно — используйте копирование текста.';
    });
    bindBtn('f3-export-clear', function () {
      if (typeof global.confirm === 'function' && !global.confirm('Удалить все оценки и заметки?')) return;
      clearRatings();
      if (inspectedItem) renderInspector();
      if (isOpen) renderCurrentPage();
    });
  }

  DD.CatalogF3 = {
    init: init,
    toggle: function () { setOpen(!isOpen); return isOpen; },
    open: function () { setOpen(true); },
    close: function () { setOpen(false); },
    isOpen: function () { return isOpen; },
    getFilteredList: getFilteredList,
    setTab: function (t) { activeTab = t; currentPage = 0; invalidateFilter(); if (isOpen) renderCurrentPage(); },
    setRateFilter: function (rf) { rateFilter = rf; currentPage = 0; invalidateFilter(); if (isOpen) renderCurrentPage(); },
    rateItem: rateItem,
    getRatings: loadRatings,
    getRatingStats: getRatingStats,
    getBadList: getBadList,
    getBadReportText: getBadReportText,
    clearRatings: clearRatings
  };
})(window);
