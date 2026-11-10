(function (global) {
  'use strict';

  var DD = global.DD = global.DD || {};
  var PAGE_SIZE = 24;

  var isOpen = false;
  var activeTab = 'all'; // all | base | texture | model | mesh
  var searchQuery = '';
  var currentPage = 0;
  var filteredCache = null;
  var lastKey = '';
  var baseImgCache = {};
  var previewTimer = null;
  var inspectedItem = null;
  var previewYaw = 0.62;
  var onToggleCb = null;

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

  function getFilteredList() {
    var key = activeTab + '|' + searchQuery.trim().toLowerCase();
    if (filteredCache && key === lastKey) return filteredCache;
    lastKey = key;
    var q = searchQuery.trim().toLowerCase();
    var source = activeTab === 'base' ? getBaseList() : DD.ContentPack.getAll();
    var out = [];
    for (var i = 0; i < source.length; i++) {
      var it = source[i];
      if (activeTab !== 'all' && activeTab !== 'base' && it.kind !== activeTab) continue;
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
        img.onload = function () { if (isOpen) renderCurrentPage(); };
        img.src = item.file;
        baseImgCache[item.file] = img;
      }
    }
    if (img && img.complete && img.naturalWidth > 0) {
      // Берём первую ячейку спрайтшита или весь тайл/иконку
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
    var box = document.getElementById('f3-inspector');
    var c = document.getElementById('f3-inspect-canvas');
    var title = document.getElementById('f3-inspect-title');
    var meta = document.getElementById('f3-inspect-meta');
    if (!box || !c || !title || !meta) return;
    if (!inspectedItem) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    title.textContent = '[' + inspectedItem.code + '] ' + inspectedItem.name;
    meta.textContent = 'Категория: ' + inspectedItem.family + ' · Тип: ' + inspectedItem.kindLabel + ' · ' + inspectedItem.specs + (inspectedItem.file ? ' · Файл: ' + inspectedItem.file : '');
    if (inspectedItem.isBase) drawBaseCard(c, inspectedItem, previewYaw);
    else DD.ContentPack.renderItemToCanvas(c, inspectedItem, previewYaw);
  }

  function renderCurrentPage() {
    var grid = document.getElementById('f3-grid');
    var pageInfo = document.getElementById('f3-page-info');
    var countInfo = document.getElementById('f3-count-info');
    if (!grid) return;

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

    grid.innerHTML = '';
    var start = currentPage * PAGE_SIZE;
    var end = Math.min(list.length, start + PAGE_SIZE);
    for (var i = start; i < end; i++) {
      (function (item) {
        var card = document.createElement('button');
        card.type = 'button';
        card.className = 'f3-card';
        card.title = item.code + ' — ' + item.name;

        var cv = document.createElement('canvas');
        cv.width = 84;
        cv.height = 84;
        cv.className = 'f3-thumb';
        if (item.isBase) drawBaseCard(cv, item, 0.62);
        else DD.ContentPack.renderItemToCanvas(cv, item, 0.62);

        var codeEl = document.createElement('div');
        codeEl.className = 'f3-code';
        codeEl.textContent = item.code + ' · ' + item.kindLabel;

        var nameEl = document.createElement('div');
        nameEl.className = 'f3-name';
        nameEl.textContent = item.name;

        var specEl = document.createElement('div');
        specEl.className = 'f3-spec';
        specEl.textContent = item.family + ' · ' + item.specs;

        card.appendChild(cv);
        card.appendChild(codeEl);
        card.appendChild(nameEl);
        card.appendChild(specEl);

        card.addEventListener('click', function () {
          inspectedItem = item;
          renderInspector();
        });
        grid.appendChild(card);
      })(list[i]);
    }

    // Обновить активную вкладку
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
      if (inspectedItem && (inspectedItem.kind === 'mesh' || inspectedItem.kind === 'base_3d')) {
        previewYaw += 0.08;
        renderInspector();
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
    }
    if (typeof onToggleCb === 'function') onToggleCb(isOpen);
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
  }

  DD.CatalogF3 = {
    init: init,
    toggle: function () { setOpen(!isOpen); return isOpen; },
    open: function () { setOpen(true); },
    close: function () { setOpen(false); },
    isOpen: function () { return isOpen; },
    getFilteredList: getFilteredList,
    setTab: function (t) { activeTab = t; currentPage = 0; if (isOpen) renderCurrentPage(); }
  };
})(window);
