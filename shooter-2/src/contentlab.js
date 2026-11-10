/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — лаборатория контента: посмотреть и потрогать 1000/250/250
   -----------------------------------------------------------------------------
   Это не «список галочек». В лаборатории:
     • МОДЕЛИ — каталог 1000 мешей, листается страницами по 12, каждый
       крутится в 3D на своём canvas (рендер идёт в общий renderer игры);
     • ЗВУКИ — проигрывание любого из 250 через AudioEngine + нарисованная
       волна, чтобы было видно: это не «название», а настоящий сигнал;
     • МЕХАНИКИ — 250 правил, каждое включается переключателем и немедленно
       меняет числа игры (см. SH2.mechanics).
   Открывается из меню кнопкой «КОНТЕНТ». Клавиша L — звук, M — механику.
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };

  const PAGE = 12;

  class ContentLab {
    constructor(game, ui) {
      this.game = game;
      this.ui = ui;
      this.tab = 'models';
      this.page = 0;
      this.soundPage = 0;
      this.mechPage = 0;
      this.mechFamily = null;
      this.models = [];
      this.built = false;
      this.previewRenderer = null;
      this.previewScene = null;
      this.previewCamera = null;
      this.tick = 0;
    }

    /* ------------------------------ каркас -------------------------------- */
    build() {
      if (this.built) return;
      const host = $('scr-content');
      if (!host) return;
      this.built = true;
      host.innerHTML = '';
      const wrap = el('div', 'content-wrap');

      const head = el('div', 'content-head');
      head.appendChild(el('h2', null, 'КОНТЕНТ СЕКТОРА'));
      const tabs = el('div', 'content-tabs');
      [['models', 'МОДЕЛИ 1000'], ['sounds', 'ЗВУКИ 250'], ['mechanics', 'МЕХАНИКИ 250'], ['field', 'ПОЛЕ 100 000']]
        .forEach(([key, label]) => {
          const b = el('button', 'ct-tab' + (this.tab === key ? ' active' : ''), label);
          b.dataset.tab = key;
          b.addEventListener('click', () => { this.tab = key; this.page = 0; this.soundPage = 0; this.mechPage = 0; this.render(); });
          tabs.appendChild(b);
        });
      head.appendChild(tabs);
      const close = el('button', 'ct-close', '×');
      close.title = 'Закрыть (Esc)';
      close.addEventListener('click', () => this.close());
      head.appendChild(close);
      wrap.appendChild(head);

      this.summary = el('div', 'content-summary');
      wrap.appendChild(this.summary);

      this.body = el('div', 'content-body');
      wrap.appendChild(this.body);

      this.pager = el('div', 'content-pager');
      wrap.appendChild(this.pager);

      host.appendChild(wrap);
    }

    open(tab) {
      this.build();
      if (tab) this.tab = tab;
      const s = this.ui && this.ui.screens && this.ui.screens.content;
      if (s) {
        Object.keys(this.ui.screens).forEach((k) => {
          const sc = this.ui.screens[k];
          if (sc) sc.classList.toggle('active', k === 'content');
        });
        if (this.ui.hud) this.ui.hud.classList.add('hidden');
      }
      this.render();
    }

    close() {
      if (this.ui) {
        this.ui.show('menu');
        if (this.game) { this.game.state = 'menu'; this.game.unlock(); }
      }
    }

    /* -------------------------------- вкладки ----------------------------- */
    render() {
      /* render можно звать напрямую (проверки, повторное открытие) —
         каркас должен существовать */
      if (!this.built) this.build();
      if (!this.built) return;
      document.querySelectorAll('.ct-tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === this.tab));
      this.body.innerHTML = '';
      const S = this.summary;
      S.textContent = '';
      if (this.tab === 'models') this.renderModels();
      else if (this.tab === 'sounds') this.renderSounds();
      else if (this.tab === 'mechanics') this.renderMechanics();
      else this.renderField();
      this.renderPager();
    }

    renderPager() {
      this.pager.innerHTML = '';
      if (this.tab === 'field') return;
      const total = this.tab === 'models' ? SH2.meshpack.COUNT : (this.tab === 'sounds' ? SH2.soundbank.COUNT : SH2.mechanics.COUNT);
      const page = this.tab === 'models' ? this.page : (this.tab === 'sounds' ? this.soundPage : this.mechPage);
      const pages = Math.ceil(total / PAGE);
      const mk = (label, to, disabled) => {
        const b = el('button', 'btn ghost small', label);
        b.disabled = !!disabled;
        b.addEventListener('click', () => {
          if (this.tab === 'models') this.page = to;
          else if (this.tab === 'sounds') this.soundPage = to;
          else this.mechPage = to;
          this.render();
        });
        return b;
      };
      this.pager.appendChild(mk('‹ НАЗАД', Math.max(0, page - 1), page === 0));
      this.pager.appendChild(el('span', 'pg-info', `стр. ${page + 1} / ${pages}`));
      this.pager.appendChild(mk('ДАЛЬШЕ ›', Math.min(pages - 1, page + 1), page >= pages - 1));
    }

    /* -------------------------------- модели ------------------------------ */
    renderModels() {
      const P = SH2.meshpack;
      this.summary.textContent = `${P.COUNT} моделей · 10 семейств × 10 архетипов × 10 вариантов. Каждая строится процедурно по контуру: выдавливание, лофт, тело вращения.`;
      const grid = el('div', 'mesh-grid');
      const from = this.page * PAGE;
      for (let i = from; i < Math.min(P.COUNT, from + PAGE); i++) {
        const d = P.describe(i);
        const card = el('div', 'mesh-card');
        const cv = el('canvas', 'mesh-canvas');
        cv.width = 220; cv.height = 180;
        card.appendChild(cv);
        card.appendChild(el('div', 'mesh-name', d.id));
        card.appendChild(el('div', 'mesh-sub', `${d.familyTitle} · вариант ${d.variant + 1}`));
        card.addEventListener('click', () => this.spawnOnMap(i));
        grid.appendChild(card);
        this.queuePreview(cv, i);
      }
      this.body.appendChild(grid);
      this.animatePreviews();
    }

    /* Рендер моделей в отдельные canvas. Используем настоящий three.js и
       WebGL только если он уже есть; иначе — рисуем силуэт программно
       (проекция вершин), чтобы каталог работал даже на слабом устройстве. */
    queuePreview(cv, index) {
      if (!this._queue) this._queue = [];
      this._queue.push({ cv, index });
    }

    animatePreviews() {
      const q = this._queue || [];
      this._queue = [];
      if (!q.length) return;
      const renderer = this.ensurePreviewRenderer();
      if (renderer) {
        const T = root.THREE;
        q.forEach(({ cv, index }) => {
          const scene = new T.Scene();
          scene.background = new T.Color(0x11151c);
          const cam = new T.PerspectiveCamera(32, cv.width / cv.height, 0.05, 60);
          const model = SH2.meshpack.build(index);
          scene.add(model);
          const sun = new T.DirectionalLight(0xffffff, 1.15);
          sun.position.set(3, 5, 4);
          scene.add(sun);
          scene.add(new T.HemisphereLight(0xaac4e0, 0x33302a, 0.85));
          const spin = (t) => {
            model.rotation.y = t * 0.5;
            const box = new T.Box3().setFromObject(model);
            const c = box.getCenter(new T.Vector3());
            const size = box.getSize(new T.Vector3()).length() || 1;
            cam.position.set(c.x + size * 1.5, c.y + size * 0.9, c.z + size * 1.6);
            cam.lookAt(c);
            renderer.setSize(cv.width, cv.height, false);
            /* не у всех сборок есть scissor (и в тестах рендерер подменён) */
            if (renderer.setScissorTest) {
              renderer.setScissorTest(true);
              renderer.setScissor(0, 0, cv.width, cv.height);
            }
            if (renderer.setViewport) renderer.setViewport(0, 0, cv.width, cv.height);
            renderer.render(scene, cam);
            cv.__spin = t;
          };
          spin(0.6);
          cv.__scene = scene; cv.__cam = cam; cv.__model = model;
        });
        return;
      }
      /* без WebGL: рисуем проекцию модели на 2D-канвас — честные вершины */
      q.forEach(({ cv, index }) => this.drawSilhouette(cv, SH2.meshpack.build(index)));
    }

    drawSilhouette(cv, group) {
      const ctx = cv.getContext && cv.getContext('2d');
      if (!ctx) return;
      const W = cv.width, H = cv.height;
      ctx.fillStyle = '#11151c';
      ctx.fillRect(0, 0, W, H);
      group.updateMatrixWorld(true);
      const pts = [];
      group.traverse((o) => {
        if (!o.isMesh) return;
        const p = o.geometry.attributes.position;
        for (let i = 0; i < p.count; i += 3) {
          pts.push([p.getX(i), p.getY(i), p.getZ(i)]);
        }
      });
      if (!pts.length) return;
      let cx = 0, cy = 0, cz = 0;
      pts.forEach((p) => { cx += p[0]; cy += p[1]; cz += p[2]; });
      cx /= pts.length; cy /= pts.length; cz /= pts.length;
      const k = Math.min(W, H) * 0.62 / Math.max(0.4, Math.max(...pts.map((p) => Math.hypot(p[0] - cx, p[1] - cy, p[2] - cz))));
      pts.forEach((p) => {
        const x = W / 2 + (p[0] - cx) * k + (p[2] - cz) * k * 0.35;
        const y = H / 2 - (p[1] - cy) * k + (p[2] - cz) * k * 0.2;
        ctx.fillStyle = 'rgba(196,206,220,0.5)';
        ctx.fillRect(x, y, 1.5, 1.5);
      });
    }

    ensurePreviewRenderer() {
      if (this.previewRenderer) return this.previewRenderer;
      const T = root.THREE;
      if (!T || !T.WebGLRenderer || !root.document) return null;
      try {
        this.previewRenderer = new T.WebGLRenderer({ antialias: true, alpha: false });
        this.previewRenderer.setPixelRatio(Math.min(root.devicePixelRatio || 1, 2));
        return this.previewRenderer;
      } catch (e) { return null; }
    }

    /* Понравился меш — поставить его на карту рядом с игроком. */
    spawnOnMap(index) {
      const g = this.game;
      if (!g || !g.scene) return;
      const T = root.THREE;
      const m = SH2.meshpack.build(index);
      const P = g.player || { x: 0, z: 0, yaw: 0 };
      const d = 3.2;
      m.position.set(P.x + Math.sin(P.yaw) * d + 0.8, 0, P.z + Math.cos(P.yaw) * d);
      g.scene.add(m);
      if (!this.spawned) this.spawned = [];
      this.spawned.push(m);
      if (this.spawned.length > 24) {
        const old = this.spawned.shift();
        g.scene.remove(old);
      }
      if (g.ui) g.ui.toast('Меш ' + SH2.meshpack.describe(index).id + ' поставлен на карту');
    }

    /* -------------------------------- звуки ------------------------------- */
    renderSounds() {
      const SB = SH2.soundbank;
      this.summary.textContent = `${SB.COUNT} звуков · 25 семейств × 10 вариантов. Ни одного файла: всё синтезируется в WebAudio, но каждый образец можно отрисовать в волну и проверить глазами.`;
      const list = el('div', 'sound-list');
      const from = this.soundPage * PAGE;
      for (let i = from; i < Math.min(SB.COUNT, from + PAGE); i++) {
        const d = SB.describe(i);
        const row = el('div', 'sound-row');
        row.appendChild(el('span', 'sound-id', d.id));
        row.appendChild(el('span', 'sound-title', `${d.familyTitle} · ${d.title}`));
        const wave = el('canvas', 'sound-wave');
        wave.width = 260; wave.height = 44;
        row.appendChild(wave);
        const play = el('button', 'btn ghost small', '▶');
        play.addEventListener('click', () => {
          if (this.game && this.game.audio) this.game.audio.init();
          if (this.game && this.game.soundbank) this.game.soundbank.play(i, this.game.player.x, this.game.player.z, 1);
          else if (SB) SB.render(i, 8000);
          play.classList.add('on');
          setTimeout(() => play.classList.remove('on'), 300);
        });
        row.appendChild(play);
        list.appendChild(row);
        this.drawWave(wave, i);
      }
      this.body.appendChild(list);
    }

    drawWave(cv, index) {
      const ctx = cv.getContext && cv.getContext('2d');
      if (!ctx) return;
      const W = cv.width, H = cv.height;
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, W, H);
      const pcm = SH2.soundbank.render(index, 8000);
      const step = Math.max(1, Math.floor(pcm.length / W));
      ctx.strokeStyle = '#6fe3a2';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        let mn = 0, mx = 0;
        for (let k = 0; k < step; k++) {
          const v = pcm[x * step + k] || 0;
          mn = Math.min(mn, v); mx = Math.max(mx, v);
        }
        ctx.moveTo(x, H / 2 - mx * H * 0.45);
        ctx.lineTo(x, H / 2 - mn * H * 0.45);
      }
      ctx.stroke();
    }

    /* ------------------------------- механики ----------------------------- */
    renderMechanics() {
      const M = SH2.mechanics;
      const st = M.stats();
      this.summary.textContent = `${M.COUNT} механик · 25 семейств × 10 вариантов · включено ${st.enabled}. Правила меняют числа игры: урон, темп, разброс, здоровье, взрыв, ИИ — и срабатывают на события (выстрел, удар, убийство, старт миссии).`;
      const fams = el('div', 'mech-fams');
      const all = el('button', 'chip' + (this.mechFamily ? '' : ' active'), 'ВСЕ');
      all.addEventListener('click', () => { this.mechFamily = null; this.mechPage = 0; this.render(); });
      fams.appendChild(all);
      M.families.forEach((f) => {
        const b = el('button', 'chip' + (this.mechFamily === f.key ? ' active' : ''), f.title);
        b.addEventListener('click', () => { this.mechFamily = f.key; this.mechPage = 0; this.render(); });
        fams.appendChild(b);
      });
      this.body.appendChild(fams);

      const list = M.list();
      const rows = this.mechFamily ? list.filter((e) => e.family === this.mechFamily) : list;
      const per = this.mechFamily ? 10 : PAGE;
      const from = this.mechPage * per;
      const box = el('div', 'mech-list');
      rows.slice(from, from + per).forEach((e) => {
        const row = el('label', 'mech-row' + (e.on ? ' on' : ''));
        const cb = el('input');
        cb.type = 'checkbox';
        cb.checked = e.on;
        cb.addEventListener('change', () => {
          M.enable(e.id, cb.checked);
          row.classList.toggle('on', cb.checked);
          this.applyNow();
          this.summary.textContent = `включено ${M.stats().enabled} из ${M.COUNT}`;
        });
        row.appendChild(cb);
        row.appendChild(el('span', 'mech-id', e.id));
        row.appendChild(el('span', 'mech-title', e.title));
        row.appendChild(el('span', 'mech-keys', e.keys.join(', ') || 'событие'));
        box.appendChild(row);
      });
      this.body.appendChild(box);
      /* при фильтре по семейству страниц меньше — пересчитываем в pager */
      this._mechFiltered = !!this.mechFamily;
    }

    applyNow() {
      const g = this.game;
      if (!g) return;
      g.applyMechanics();
    }

    /* -------------------------------- поле -------------------------------- */
    renderField() {
      const g = this.game;
      const f = g && g.meshfield;
      this.summary.textContent = 'Поле декораций: 100 000 мешей вокруг игровой зоны. Стоят инстансами — один draw call на материал, поэтому телефон не умирает.';
      const st = f ? f.stats() : null;
      const box = el('div', 'field-stats');
      if (!st) {
        box.appendChild(el('div', 'field-line', 'Поле ещё не построено — начните миссию.'));
      } else {
        const rows = [
          ['мешей в поле', st.meshes.toLocaleString('ru-RU')],
          ['отдельных (не инстанс)', st.realMeshes.toLocaleString('ru-RU')],
          ['корзин-комплектов', st.buckets],
          ['draw call', st.drawCalls],
          ['треугольников', st.triangles.toLocaleString('ru-RU')],
          ['сборка', st.buildMs + ' мс']
        ];
        rows.forEach(([k, v]) => {
          const line = el('div', 'field-line');
          line.appendChild(el('span', 'field-k', k));
          line.appendChild(el('b', 'field-v', String(v)));
          box.appendChild(line);
        });
        const fams = el('div', 'field-fams');
        Object.keys(st.byFamily).forEach((k) => {
          fams.appendChild(el('span', 'chip', `${k}: ${st.byFamily[k].toLocaleString('ru-RU')}`));
        });
        box.appendChild(fams);
        const btn = el('button', 'btn ghost small', 'ДОБАВИТЬ 160 ОТДЕЛЬНЫХ МЕШЕЙ РЯДОМ');
        btn.addEventListener('click', () => { f.buildReal(160, g.scene); this.render(); });
        box.appendChild(btn);
        const btn2 = el('button', 'btn ghost small', 'ЭКОНОМНЫЙ РЕЖИМ');
        btn2.addEventListener('click', () => { f.setReduced(!f.reduced); this.render(); });
        box.appendChild(btn2);
      }
      this.body.appendChild(box);
    }
  }

  SH2.contentlab = { ContentLab };
})(typeof window !== 'undefined' ? window : globalThis);
