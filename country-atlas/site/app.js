/* Ратград — белый холст. Рисование и панели. Счёт — в core.js (F-71…F-89). */
'use strict';
(function () {
  const C = window.RatgradCore;
  const $ = (s) => document.querySelector(s);
  const { clamp, round, hypot, BUILDINGS, columnOf, heightAt, HGRID, GRID, NX, NY,
    parseColumn, columnMath, packID, unpackID, wearStep, horizon, visRadius,
    packQ, unpackQ, pxPerMeter, maxLayers, animVisible } = C;

  const canvas = $('#c'), ctx = canvas.getContext('2d');
  const cam = { x: 100, y: 100, scale: 6 };
  const view = { x1: 0, y1: 0, x2: 1, y2: 1 };
  const ui = { R: 120, T: 0, D: 0, grid: true, contours: true, showQ: true, labels: true };
  let hover = { x: 0, y: 0, inside: false };
  let pinned = null, drag = null, lastKey = '';
  let fps = 0, lastT = performance.now(), frames = 0;

  /* ---------------- сцена ---------------- */
  function resize() {
    const r = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    view.x2 = Math.round(r.width); view.y2 = Math.round(r.height);
    view.x1 = 0; view.y1 = 0;
    draw();
    if (isTab('q')) renderQ();
  }

  const toScreen = (x, y) => ({ X: (x - cam.x) * cam.scale + view.x2 / 2, Y: (y - cam.y) * cam.scale + view.y2 / 2 });
  const toWorld = (sx, sy) => ({ x: cam.x + (sx - view.x2 / 2) / cam.scale, y: cam.y + (sy - view.y2 / 2) / cam.scale });

  function contourSegs(level) {
    const segs = [];
    for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) {
      const h = [HGRID[i][j], HGRID[i + 1][j], HGRID[i + 1][j + 1], HGRID[i][j + 1]];
      const c = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];
      const pts = [];
      for (let e = 0; e < 4; e++) {
        const a = e, b = (e + 1) % 4;
        if ((h[a] - level) * (h[b] - level) < 0) {
          const t = (level - h[a]) / (h[b] - h[a]);
          pts.push({ x: (c[a][0] + (c[b][0] - c[a][0]) * t) * GRID, y: (c[a][1] + (c[b][1] - c[a][1]) * t) * GRID });
        }
      }
      if (pts.length >= 2) segs.push([pts[0], pts[1]]);
    }
    return segs;
  }

  function draw() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, view.x2, view.y2);
    const wl = toWorld(0, 0), wr = toWorld(view.x2, view.y2);

    if (ui.grid) {
      ctx.strokeStyle = '#efefef'; ctx.lineWidth = 1;
      const step = cam.scale < 3 ? 50 : 10;
      for (let x = Math.floor(wl.x / step) * step; x <= wr.x; x += step) {
        const p = toScreen(x, wl.y);
        ctx.beginPath(); ctx.moveTo(p.X, 0); ctx.lineTo(p.X, view.y2); ctx.stroke();
      }
      for (let y = Math.floor(wl.y / step) * step; y <= wr.y; y += step) {
        const p = toScreen(wl.x, y);
        ctx.beginPath(); ctx.moveTo(0, p.Y); ctx.lineTo(view.x2, p.Y); ctx.stroke();
      }
    }

    if (ui.contours) {
      ctx.strokeStyle = '#d2d2d2'; ctx.lineWidth = 1;
      for (let L = 5; L <= 50; L += 5) {
        for (const [a, b] of contourSegs(L)) {
          const p1 = toScreen(a.x, a.y), p2 = toScreen(b.x, b.y);
          ctx.beginPath(); ctx.moveTo(p1.X, p1.Y); ctx.lineTo(p2.X, p2.Y); ctx.stroke();
        }
      }
    }

    for (const b of BUILDINGS) {
      const p = toScreen(b.x, b.y), s = toScreen(b.x + b.w, b.y + b.d);
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#0b0b0b'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.rect(p.X, p.Y, s.X - p.X, s.Y - p.Y); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#bdbdbd'; ctx.lineWidth = 1;
      for (let f = 1; f < b.floors; f++) {
        const yy = p.Y + (s.Y - p.Y) * f / b.floors;
        ctx.beginPath(); ctx.moveTo(p.X, yy); ctx.lineTo(s.X, yy); ctx.stroke();
      }
      const col = columnOf(b);
      if (ui.labels) {
        ctx.fillStyle = '#0b0b0b'; ctx.font = '11px ui-monospace, monospace';
        ctx.fillText(b.id + ' · p=' + col.p + ' · H=' + col.H + ' м', p.X + 2, p.Y - 4);
        ctx.fillStyle = '#6b6b6b';
        ctx.fillText('земля ' + round(heightAt(col.bx, col.by).H, 1) + ' м', p.X + 2, s.Y + 13);
      }
      const cp = toScreen(col.bx, col.by);
      ctx.fillStyle = '#0b0b0b'; ctx.beginPath(); ctx.arc(cp.X, cp.Y, 2.2, 0, Math.PI * 2); ctx.fill();
    }

    if (ui.showQ) {
      const c = toScreen(cam.x, cam.y), r = ui.R * cam.scale;
      ctx.save();
      ctx.strokeStyle = '#0b0b0b'; ctx.setLineDash([5, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(c.X, c.Y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]); ctx.strokeStyle = '#888';
      ctx.strokeRect(1.5, 1.5, view.x2 - 3, view.y2 - 3);
      ctx.restore();
    }

    if (hover.inside) {
      const p = toScreen(hover.x, hover.y);
      ctx.strokeStyle = 'rgba(0,0,0,.14)'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.X - 8, p.Y); ctx.lineTo(p.X + 8, p.Y);
      ctx.moveTo(p.X, p.Y - 8); ctx.lineTo(p.X, p.Y + 8); ctx.stroke();
    }
    if (pinned) {
      const p = toScreen(pinned.x, pinned.y);
      ctx.strokeStyle = '#0b0b0b';
      ctx.beginPath(); ctx.arc(p.X, p.Y, 5, 0, Math.PI * 2); ctx.stroke();
    }

    frames++;
    const now = performance.now();
    if (now - lastT > 500) { fps = Math.round(frames * 1000 / (now - lastT)); frames = 0; lastT = now; }
    $('#status').textContent = 'курсор ' + round(hover.x, 1) + '; ' + round(hover.y, 1) +
      ' · H ' + round(heightAt(hover.x, hover.y).H, 2) + ' м · ' + cam.scale + ' px/м · ' + fps + ' FPS';
  }

  /* ---------------- журнал ---------------- */
  const logLines = [];
  function log(msg) {
    logLines.push('[' + new Date().toLocaleTimeString('ru-RU') + '] ' + msg);
    if (logLines.length > 400) logLines.shift();
    const el = $('#log');
    if (el) el.textContent = logLines.join('\n');
  }

  /* ---------------- панели ---------------- */
  function isTab(t) { return document.querySelector('.tabs button[data-tab="' + t + '"]').getAttribute('aria-selected') === 'true'; }
  function kv(title, rows) {
    return '<h2>' + title + '</h2><div class="kv">' +
      rows.map(r => '<span>' + r[0] + '</span><span>' + r[1] + '</span>').join('') + '</div>';
  }

  function currentColumn() {
    if (pinned) {
      const b = BUILDINGS.find(x => pinned.id === x.id);
      if (b) return { kind: 'building', c: columnOf(b), b };
      return { kind: 'ground', x: pinned.x, y: pinned.y };
    }
    for (const b of BUILDINGS) {
      if (hover.x >= b.x && hover.x <= b.x + b.w && hover.y >= b.y && hover.y <= b.y + b.d) {
        return { kind: 'building', c: columnOf(b), b };
      }
    }
    return { kind: 'ground', x: hover.x, y: hover.y };
  }

  function renderColumn() {
    const cur = currentColumn();
    let html;
    if (cur.kind === 'building') {
      const c = cur.c, g = heightAt(c.bx, c.by), m = columnMath(c, c.H), pr = parseColumn(c.rec);
      html = '<h2>столб здания</h2><div class="rec">' + c.rec + '</div>' +
        kv('разбор (F-78)', [
          ['объект', cur.b.id + ' — ' + cur.b.name],
          ['первая точка', '(' + c.bx + '; ' + c.by + ')'],
          ['H или h', c.letter === 'H' ? 'H — высота стоит на пересечении X и Y' : 'h — высота уведена, считается'],
          ['p (всего слоёв)', c.p],
          ['пар', c.pairs.length + ' (нужно p−1 = ' + (c.p - 1) + ')'],
          ['толщина слоя τ', m.tau + ' м (F-88)'],
          ['высота H', c.H + ' м'],
          ['дрейф D', m.D + ' м (F-85)'],
          ['длина столба h', m.h + ' м (F-86)'],
          ['наклон θ', m.theta + '° (F-87)'],
          ['верх', '(' + m.top.x + '; ' + m.top.y + ') (F-89)'],
          ['земля', round(g.H, 2) + ' м (F-71)'],
          ['запись', pr.ok ? '<span class="ok">корректна</span>' : '<span class="bad">' + pr.errs.join('; ') + '</span>']
        ]) +
        '<h2>слои по порядку</h2><table><tr><th>#</th><th>точка</th><th>сдвиг, м</th></tr>';
      let px = c.bx, py = c.by;
      [{ x: px, y: py }].concat(c.pairs).forEach((q, k) => {
        html += '<tr><td>' + (k + 1) + '</td><td>(' + q.x + '; ' + q.y + ')</td><td>' +
          (k === 0 ? '—' : round(hypot(q.x - px, q.y - py), 2)) + '</td></tr>';
        px = q.x; py = q.y;
      });
      html += '</table>';
    } else {
      const x = Math.round(cur.x), y = Math.round(cur.y), g = heightAt(cur.x, cur.y);
      html = '<h2>точка земли</h2><div class="rec">(' + x + ';' + y + ')H1()</div>' +
        kv('разбор', [
          ['точка', '(' + x + '; ' + y + ')'],
          ['H или h', 'H — высота на пересечении'],
          ['p', '1 слой (земля)'],
          ['пар', '0'],
          ['высота', round(g.H, 2) + ' м'],
          ['углы клетки', g.corners.map(v => round(v, 1)).join(' / ')],
          ['u, v', round(g.u, 3) + ', ' + round(g.v, 3)],
          ['формула', 'F-71: билинейно по 4 углам']
        ]);
    }
    html += '<h2>подсказка</h2><p class="muted">Наведите на дом — запись столба; клик закрепляет точку; ' +
      'Esc снимает. <b>H</b> стоит на пересечении X и Y, <b>h</b> — когда точка высоты ушла.</p>';
    $('#pane-col').innerHTML = html;
  }

  function renderFace() {
    const f = window.__face || { s: 0, i: 100, j: 200, k: 18, t: 5, n: 2 };
    const id = packID(f), b = unpackID(id);
    $('#pane-face').innerHTML =
      '<h2>грань кубика</h2><div class="chips">' +
      ['s', 'i', 'j', 'k', 't', 'n'].map(k2 => '<label>' + k2 + ' <input type="number" id="f-' + k2 + '" value="' + f[k2] + '" min="0"></label>').join('') +
      '</div>' +
      kv('ID (F-72, 64 бита)', [
        ['ID', '<span class="rec" style="display:inline-block">' + id.toString() + '</span>'],
        ['биты', '3 + 16 + 16 + 13 + 12 + 4 = 64'],
        ['сторона', b.s + (b.s <= 4 ? ' ✓' : ' ✗ (резерв)')],
        ['клетка', '(' + b.i + '; ' + b.j + ')'],
        ['высота k', b.k + ' м'],
        ['текстура t', b.t],
        ['слой n', b.n],
        ['состояние', b.t === 4095 ? '<span class="bad">облом</span>' : b.t >= 2048 ? '<span class="bad">повреждена, базовая ' + (b.t - 2048) + '</span>' : '<span class="ok">целая</span>']
      ]) +
      '<h2>износ (F-74)</h2><p class="muted">w′ = clamp(w + 0.004·N + 0.002·W + 0.003·F − 0.05·M, 0, 1); ' +
      'трещина при 0.45 (t+2048), разрушение при 0.70 (t=4095).</p>' +
      '<div class="chips">' +
      ['N', 'W', 'F', 'M'].map(k2 => '<label>' + k2 + ' <input type="number" id="w-' + k2 + '" value="0" min="0" max="1" step="0.1" style="width:56px"></label>').join('') +
      '</div><label class="row">w <input type="range" id="w-w" min="0" max="1" step="0.01" value="0.4"> <span id="w-out">0.40</span></label>' +
      '<button class="act" id="w-step">шаг износа</button>';

    ['s', 'i', 'j', 'k', 't', 'n'].forEach(k2 => {
      $('#f-' + k2).addEventListener('change', (e) => {
        const lim = { s: 7, i: 65535, j: 65535, k: 8191, t: 4095, n: 15 }[k2];
        const v = clamp(Math.round(+e.target.value || 0), 0, lim);
        window.__face = Object.assign({}, f, { [k2]: v });
        log('грань: ' + k2 + ' = ' + v + ' → ID ' + packID(window.__face).toString());
        renderFace();
      });
    });
    $('#w-w').addEventListener('input', e => { $('#w-out').textContent = (+e.target.value).toFixed(2); });
    $('#w-step').addEventListener('click', () => {
      const w = +$('#w-w').value;
      const w2 = wearStep(w, +$('#w-N').value, +$('#w-W').value, +$('#w-F').value, +$('#w-M').value);
      $('#w-w').value = w2; $('#w-out').textContent = w2.toFixed(2);
      log('F-74: w ' + w + ' → ' + w2 + (w < 0.45 && w2 >= 0.45 ? ' · трещина' : '') + (w < 0.7 && w2 >= 0.7 ? ' · разрушение' : ''));
    });
  }

  function renderQ() {
    const rect = { x1: 0, y1: 0, x2: Math.min(4095, Math.round(view.x2)), y2: Math.min(4095, Math.round(view.y2)) };
    const q = { Xa: Math.round(cam.x), Ya: Math.round(cam.y), R: ui.R, x1: rect.x1, y1: rect.y1, x2: rect.x2, y2: rect.y2 };
    const Q = packQ(q), b = unpackQ(Q);
    const rows = BUILDINGS.map(bd => {
      const c = columnOf(bd), d = round(hypot(c.bx - cam.x, c.by - cam.y), 1), p = toScreen(c.bx, c.by);
      const A = animVisible(d, ui.R, q, { x: p.X, y: p.Y });
      return '<tr><td>' + bd.id + '</td><td>' + d + '</td><td class="' + (A ? 'ok' : '') + '">' + A + '</td><td>' +
        Math.round(p.X) + ',' + Math.round(p.Y) + '</td><td>' + maxLayers(ui.R) + '</td></tr>';
    }).join('');
    $('#pane-q').innerHTML =
      '<h2>QООВЗ</h2>' +
      '<label class="row">R <input type="range" id="q-R" min="25" max="250" step="5" value="' + ui.R + '"> <span id="q-Ro">' + ui.R + '</span> м</label>' +
      '<label class="row">туман T <input type="range" id="q-T" min="0" max="1" step="0.05" value="' + ui.T + '"> <span id="q-To">' + ui.T.toFixed(2) + '</span></label>' +
      '<label class="row">дождь D <input type="range" id="q-D" min="0" max="1" step="0.05" value="' + ui.D + '"> <span id="q-Do">' + ui.D.toFixed(2) + '</span></label>' +
      kv('Q (F-81)', [
        ['центр', '(' + b.Xa + '; ' + b.Ya + ')'],
        ['радиус', b.R + ' м'],
        ['прямоугольник', '(' + b.x1 + '; ' + b.y1 + ')–(' + b.x2 + '; ' + b.y2 + ') px'],
        ['Q', '<span class="rec" style="display:inline-block">' + Q.toString() + '</span>'],
        ['биты', '16 + 16 + 12 + 12 + 12 + 12 + 12 = 92'],
        ['k_px (F-83)', pxPerMeter(q, ui.R) + ' px/м'],
        ['слоёв (F-84)', maxLayers(ui.R)],
        ['рабочая ООВ (F-76)', visRadius(16, ui.T, ui.D) + ' м при h = 16 м'],
        ['горизонт (F-75)', horizon(16, 30) + ' м']
      ]) +
      '<h2>что видно (F-82)</h2><table><tr><th>объект</th><th>d, м</th><th>A</th><th>px</th><th>слоёв</th></tr>' + rows + '</table>' +
      '<p class="muted">A = 1 только если точка в круге и пиксель в прямоугольнике камеры.</p>';

    $('#q-R').addEventListener('input', e => { ui.R = +e.target.value; $('#q-Ro').textContent = ui.R; draw(); renderQ(); });
    $('#q-T').addEventListener('input', e => { ui.T = +e.target.value; $('#q-To').textContent = ui.T.toFixed(2); renderQ(); });
    $('#q-D').addEventListener('input', e => { ui.D = +e.target.value; $('#q-Do').textContent = ui.D.toFixed(2); renderQ(); });
  }

  function renderFormulas() {
    const res = C.tests();
    const total = res.reduce((s, r) => s + r.passed, 0), all = res.length * 20;
    $('#pane-f').innerHTML =
      '<h2>проверка формул · по 20 значений</h2>' +
      '<p class="' + (total === all ? 'ok' : 'bad') + '">' + total + ' / ' + all + ' проверок</p>' +
      '<table><tr><th>№</th><th>формула</th><th>итог</th></tr>' +
      res.map(r => '<tr><td>' + r.id + '</td><td>' + r.name + '</td><td class="' +
        (r.passed === 20 ? 'ok' : 'bad') + '">' + r.passed + '/20 ' + (r.passed === 20 ? '✓' : '✗') + '</td></tr>').join('') +
      '</table><button class="act" id="rerun" style="margin-top:10px">пересчитать</button>' +
      '<p class="muted">19 формул из 89 — те, что нужны холсту. Полный реестр будет по команде (§0.5).</p>';
    $('#rerun').addEventListener('click', () => { renderFormulas(); log('пересчёт формул: ' + total + '/' + all); });
    return total + '/' + all;
  }

  /* ---------------- события ---------------- */
  function setTab(t) {
    document.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === t ? 'true' : 'false'));
    document.querySelectorAll('.pane').forEach(p => p.classList.remove('on'));
    $('#pane-' + t).classList.add('on');
    if (t === 'face') renderFace();
    if (t === 'q') renderQ();
    if (t === 'f') log('формулы: ' + renderFormulas());
  }

  function bind() {
    document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));

    canvas.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      const w = toWorld(e.clientX - r.left, e.clientY - r.top);
      hover = { x: w.x, y: w.y, inside: true };
      if (drag && drag.moved) {
        cam.x -= (e.clientX - drag.x) / cam.scale;
        cam.y -= (e.clientY - drag.y) / cam.scale;
        drag.x = e.clientX; drag.y = e.clientY;
        if (isTab('q')) renderQ();
      }
      const key = Math.round(w.x * 2) + ':' + Math.round(w.y * 2) + ':' + (pinned ? pinned.x + ',' + pinned.y : '');
      if (key !== lastKey) { lastKey = key; renderColumn(); }
      draw();
    });
    canvas.addEventListener('pointerleave', () => { hover.inside = false; draw(); });
    canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, moved: false }; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', () => { if (drag) drag.moved = true; });
    canvas.addEventListener('pointerup', (e) => {
      if (drag && !drag.moved) {
        const r = canvas.getBoundingClientRect();
        const w = toWorld(e.clientX - r.left, e.clientY - r.top);
        const b = BUILDINGS.find(bd => w.x >= bd.x && w.x <= bd.x + bd.w && w.y >= bd.y && w.y <= bd.y + bd.d);
        pinned = b ? { x: columnOf(b).bx, y: columnOf(b).by, id: b.id } : { x: Math.round(w.x), y: Math.round(w.y) };
        log('закреплено: ' + (b ? 'дом ' + b.id + ' — ' + columnOf(b).rec : '(' + pinned.x + '; ' + pinned.y + ')'));
        renderColumn(); draw();
      }
      drag = null;
    });
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      cam.scale = clamp(cam.scale * (e.deltaY < 0 ? 1.12 : 1 / 1.12), 1.5, 40);
      if (isTab('q')) renderQ();
      draw();
    }, { passive: false });

    window.addEventListener('resize', resize);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { pinned = null; renderColumn(); draw(); }
    });
  }

  function boot() {
    bind();
    resize();
    renderColumn();
    const t = C.tests(), ok = t.reduce((s, r) => s + r.passed, 0);
    log('холст запущен: 3 здания, сетка ' + GRID + ' м, формулы F-71…F-89');
    log('самопроверка при старте: ' + ok + '/' + (t.length * 20));
    if (ok !== t.length * 20) log('ВНИМАНИЕ: часть проверок не прошла — смотреть вкладку «Формулы»');
    draw();
  }
  boot();
})();
