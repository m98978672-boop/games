// Экраны меню: главное меню, пауза, настройки, дерево навыков, справка, итоги войны, смерть.
// Экраны ничего не решают сами — только вызывают обработчики из main.js.
export class Menus {
  constructor(overlay, game) {
    this.overlay = overlay;
    this.game = game;
    this.handlers = {};
  }

  on(handlers) { this.handlers = handlers; return this; }

  show(html, cls = '') {
    this.overlay.className = `show ${cls}`;
    this.overlay.innerHTML = `<div class="screen">${html}</div>`;
  }
  hide() {
    this.overlay.className = '';
    this.overlay.innerHTML = '';
  }

  // ---------- главное меню ----------
  main({ hasSave, seed, difficulty, mode, meta }) {
    const canSave = hasSave;
    this.show(`
      <h1>Frontline: <span>Command</span></h1>
      <div class="subtitle">Война двух армий, где обе стороны живут по одним правилам. Вы — один из бойцов или командующий сверху.</div>
      <div class="menu-grid">
        <div class="menu-card" data-act="new-soldier">
          <b>Новая война — солдат</b>
          <small>Управляйте одним бойцом: WASD, прицел мышью. Остальная армия воюет сама и отдаёт приказы через общий Command API.</small>
        </div>
        <div class="menu-card" data-act="new-commander">
          <b>Новая война — командир</b>
          <small>Карта, отряды, директивы, стройка. Ни одного лишнего преимущества: те же лимиты, задержки радио и снабжение, что у ИИ.</small>
        </div>
        <div class="menu-card ${canSave ? '' : 'disabled'}" data-act="continue">
          <b>Продолжить</b>
          <small>${canSave ? 'Вернуться к сохранённой войне.' : 'Сохранённой войны нет.'}</small>
        </div>
        <div class="menu-card" data-act="ai-vs-ai">
          <b>Демонстрация: ИИ против ИИ</b>
          <small>Симметричный прогон без игрока: проверка, что правила не дают преимущества ни одной стороне.</small>
        </div>
        <div class="menu-card" data-act="skills">
          <b>Дерево навыков</b>
          <small>Мета-прокачка между войнами. Опыт: ${Math.floor(meta.xp)} XP, изучено ${meta.learned.length} навыков, войн ${meta.warCount}.</small>
        </div>
        <div class="menu-card" data-act="settings">
          <b>Настройки</b>
          <small>Звук, масштаб интерфейса, подсказки, дальтонизм.</small>
        </div>
        <div class="menu-card" data-act="help">
          <b>Как играть</b>
          <small>Уровни управления, приказы, директивы, автопилот и правила симметрии.</small>
        </div>
      </div>
      <div class="form-row" style="margin-top:16px">
        <label>Сложность</label>
        <select id="menu-difficulty">
          ${Object.entries(this.game.cfg.difficulty).map(([id, d]) => `<option value="${id}">${d.name}</option>`).join('')}
        </select>
        <label style="min-width:auto">Сид</label>
        <input id="menu-seed" type="number" value="${seed}" style="width:90px;background:#1b2018;color:#cfd6c6;border:1px solid #2c3327;border-radius:3px;padding:4px">
      </div>
      <div style="font-size:12px;color:#6f7a66;margin-top:14px">
        Сложность меняет только скорость реакции и точность оценки ИИ. Никаких скрытых бонусов.
      </div>
    `);
    const diff = this.overlay.querySelector('#menu-difficulty');
    if (diff) diff.value = difficulty;
    this.overlay.onclick = (e) => {
      const card = e.target.closest('[data-act]');
      if (!card || card.classList.contains('disabled')) return;
      const act = card.dataset.act;
      const d = this.overlay.querySelector('#menu-difficulty');
      const s = this.overlay.querySelector('#menu-seed');
      this.handlers.onMenuAction?.(act, { difficulty: d?.value || difficulty, seed: Number(s?.value) || seed });
    };
  }

  // ---------- пауза ----------
  pause(game) {
    const f = game.playerFaction ?? 0;
    this.show(`
      <h1>Пауза</h1>
      <div class="subtitle">Время: ${(game.time / 60).toFixed(1)} мин · ${game.cfg.faction(f).name} · ${game.difficulty.name}</div>
      <div class="menu-grid">
        <div class="menu-card" data-act="resume"><b>Продолжить</b><small>Пробел — пауза, ×1/×2/×4 — скорость.</small></div>
        <div class="menu-card" data-act="save"><b>Сохранить войну</b><small>Полное состояние: отряды, точки, снабжение, постройки.</small></div>
        <div class="menu-card" data-act="settings"><b>Настройки</b><small>Звук и интерфейс.</small></div>
        <div class="menu-card" data-act="skills"><b>Навыки</b><small>Опыт: ${Math.floor(game.skills.xp)} XP.</small></div>
        <div class="menu-card" data-act="help"><b>Управление</b><small>Все горячие клавиши.</small></div>
        <div class="menu-card" data-act="menu"><b>В главное меню</b><small>Прогресс войны сохранится.</small></div>
      </div>
      <div class="btn-row">
        <button class="btn danger" data-act="restart">Начать новую войну</button>
      </div>
    `);
    this.overlay.onclick = (e) => {
      const el = e.target.closest('[data-act]');
      if (!el) return;
      this.handlers.onMenuAction?.(el.dataset.act);
    };
  }

  // ---------- настройки ----------
  settings(settings, handlers) {
    this.show(`
      <h1>Настройки</h1>
      <div class="subtitle">Всё сохраняется в браузере. Звук синтезируется — файлов нет, лицензии чистые.</div>
      <div class="form-row"><label>Громкость эффектов</label><input id="set-vol" type="range" min="0" max="1" step="0.05" value="${settings.volume}"><b id="set-vol-v">${Math.round(settings.volume * 100)}%</b></div>
      <div class="form-row"><label>Громкость музыки</label><input id="set-music" type="range" min="0" max="1" step="0.05" value="${settings.music}"><b id="set-music-v">${Math.round(settings.music * 100)}%</b></div>
      <div class="form-row"><label>Масштаб интерфейса</label><input id="set-scale" type="range" min="0.8" max="1.4" step="0.05" value="${settings.uiScale}"><b id="set-scale-v">${settings.uiScale.toFixed(2)}×</b></div>
      <div class="form-row"><label>Подсказки</label><input id="set-hints" type="checkbox" ${settings.showHints ? 'checked' : ''}></div>
      <div class="form-row"><label>Режим для дальтоников</label><input id="set-cb" type="checkbox" ${settings.colorblind ? 'checked' : ''}></div>
      <div class="form-row"><label>Автосохранение</label><input id="set-auto" type="checkbox" ${settings.autosave ? 'checked' : ''}></div>
      <div class="btn-row">
        <button class="btn primary" id="set-close">Готово</button>
        <button class="btn" id="set-reset">Сбросить прогресс навыков</button>
      </div>
    `);
    const bind = (id, key, isCheck = false, labelId = null) => {
      const el = this.overlay.querySelector(id);
      const lab = labelId ? this.overlay.querySelector(labelId) : null;
      const apply = () => {
        const val = isCheck ? el.checked : Number(el.value);
        if (lab) lab.textContent = isCheck ? '' : (key === 'uiScale' ? `${val.toFixed(2)}×` : `${Math.round(val * 100)}%`);
        handlers.onSettings?.({ [key]: val });
      };
      el.addEventListener('input', apply);
    };
    bind('#set-vol', 'volume', false, '#set-vol-v');
    bind('#set-music', 'music', false, '#set-music-v');
    bind('#set-scale', 'uiScale', false, '#set-scale-v');
    bind('#set-hints', 'showHints', true);
    bind('#set-cb', 'colorblind', true);
    bind('#set-auto', 'autosave', true);
    this.overlay.querySelector('#set-close').onclick = () => handlers.onClose?.();
    this.overlay.querySelector('#set-reset').onclick = () => handlers.onResetMeta?.();
  }

  // ---------- дерево навыков ----------
  skills(game) {
    const cfg = game.cfg;
    const skills = game.skills;
    const branches = cfg.skills.branches.map((b) => {
      const nodes = cfg.skills.nodes.filter((n) => n.branch === b.id).map((n) => {
        const learned = skills.isLearned(n.id);
        const open = skills.requiresMet(n.id);
        return `<div class="skill-node ${learned ? 'learned' : open ? '' : 'locked'}" data-skill="${n.id}">
          <b>${n.name}</b><span style="color:#8c9585">${n.desc}</span>
          <span class="cost">${learned ? 'изучено' : `${n.cost} XP`}</span>
        </div>`;
      }).join('');
      return `<div class="skill-branch"><h3 style="color:${b.color}">${b.name}</h3>${nodes}</div>`;
    }).join('');
    this.show(`
      <h1>Навыки</h1>
      <div class="subtitle">Свободный опыт: <b style="color:#e8b45a">${Math.floor(skills.xp)} XP</b> · изучено ${skills.learned.size} · потрачено ${skills.spent}</div>
      ${branches}
      <div class="btn-row"><button class="btn primary" id="sk-close">Назад</button></div>
      <div style="font-size:12px;color:#6f7a66;margin-top:10px">
        Навыки действуют только на вашу фракцию и не меняют правила мира. ИИ получает эквивалент по времени войны — без скрытых бонусов.
      </div>
    `);
    this.overlay.querySelector('#sk-close').onclick = () => this.handlers.onMenuAction?.('back');
    this.overlay.querySelectorAll('[data-skill]').forEach((el) => {
      el.addEventListener('click', () => {
        const res = this.handlers.onBuySkill?.(el.dataset.skill);
        if (res && res.ok) this.skills(this.game);
      });
    });
  }

  // ---------- справка ----------
  help() {
    this.show(`
      <h1>Как играть</h1>
      <div class="subtitle">Одна армия, три уровня управления и общий Command API — приказ идёт с задержкой радио.</div>
      <h2>Уровни управления</h2>
      <div class="hint-grid">
        <b>Солдат (Tab)</b><span>Вы — один боец. <kbd>W A S D</kbd> движение, мышь — прицел, <kbd>ЛКМ</kbd> огонь, <kbd>R</kbd> перезарядка, <kbd>E</kbd> действие.</span>
        <b>Командир (Tab)</b><span>Камера, выделение отрядов, приказы. <kbd>ПКМ</kbd> — контекстный приказ, <kbd>B</kbd> — стройка, <kbd>T</kbd> — директива.</span>
        <b>Стратег</b><span>Сектора, фронт, снабжение и автопилот по сферам <kbd>P</kbd>. Ваши приказы идут тем же путём, что и приказы ИИ.</span>
      </div>
      <h2>Приказы</h2>
      <div class="hint-grid">
        <b>Двигаться / Атаковать</b><span><kbd>ПКМ</kbd> по земле или врагу — игра подбирает тип приказа сама.</span>
        <b>Держать</b><span><kbd>H</kbd> — занять и удерживать точку или укрытие.</span>
        <b>Строить</b><span><kbd>B</kbd> — выбрать постройку, <kbd>ЛКМ</kbd> поставить чертёж; инженеры достроят.</span>
        <b>Директива</b><span><kbd>T</kbd> — цель + алгоритм + поведение после. Отряд выполняет сам.</span>
        <b>Автопилот</b><span><kbd>P</kbd> — какие сферы армия ведёт без вас (бой, оборона, снабжение…).</span>
      </div>
      <h2>Симметрия</h2>
      <div style="font-size:13px;color:#b8c1ae;line-height:1.55">
        Игрок и ИИ используют одинаковые юниты, оружие, мораль, туман войны, задержку радио и лимиты.
        Сложность меняет только скорость реакции и точность оценки обстановки.
        Враг может захватить ваш штаб и выиграть войну — это честный проигрыш, а не скрипт.
      </div>
      <div class="btn-row"><button class="btn primary" id="help-close">Понятно</button></div>
    `);
    this.overlay.querySelector('#help-close').onclick = () => this.handlers.onMenuAction?.('back');
  }

  // ---------- итоги войны ----------
  result(game) {
    const f = game.playerFaction ?? 0;
    const won = game.outcome && game.outcome.winner === f;
    const stats = game.stats;
    const contrib = game.warStats;
    this.show(`
      <h1>${won ? 'Победа' : 'Поражение'}</h1>
      <div class="subtitle">${game.outcome ? game.outcome.reason : 'Война завершена'} · ${(game.time / 60).toFixed(1)} мин</div>
      <div class="stat-row"><span>Уничтожено врагов</span><b>${stats.kills[f]}</b></div>
      <div class="stat-row"><span>Потери</span><b>${stats.losses[f]}</b></div>
      <div class="stat-row"><span>Захвачено точек</span><b>${stats.captures[f]}</b></div>
      <div class="stat-row"><span>Доставок снабжения</span><b>${stats.deliveries[f]}</b></div>
      <div class="stat-row"><span>Построено</span><b>${stats.built[f]}</b></div>
      <div class="stat-row"><span>Личный вклад: убийства</span><b>${contrib.playerKills || 0}</b></div>
      <div class="stat-row"><span>Личный вклад: точки</span><b>${contrib.playerCaptures || 0}</b></div>
      <div class="stat-row"><span>Получено опыта</span><b>${Math.floor(game.skills.xp)} XP</b></div>
      <div class="btn-row">
        <button class="btn primary" data-act="next-war">Новая война</button>
        <button class="btn" data-act="skills">Навыки</button>
        <button class="btn" data-act="menu">В меню</button>
      </div>
    `);
    this.overlay.onclick = (e) => {
      const el = e.target.closest('[data-act]');
      if (!el) return;
      this.handlers.onMenuAction?.(el.dataset.act);
    };
  }

  // ---------- смерть игрока ----------
  death(game) {
    this.show(`
      <h1>Вы погибли</h1>
      <div class="death-note">Бой продолжается: армия воюет без вас, приказы отдаёт автопилот. Прокачка сохранена.</div>
      <div class="stat-row"><span>Время войны</span><b>${(game.time / 60).toFixed(1)} мин</b></div>
      <div class="stat-row"><span>Возрождений</span><b>${game.playerSpawns}</b></div>
      <div class="stat-row"><span>Убито вами</span><b>${game.warStats.playerKills || 0}</b></div>
      <div class="btn-row">
        <button class="btn primary" data-act="respawn">Возродиться на базе</button>
        <button class="btn" data-act="commander">Стать командиром</button>
        <button class="btn" data-act="menu">Меню</button>
      </div>
    `);
    this.overlay.onclick = (e) => {
      const el = e.target.closest('[data-act]');
      if (!el) return;
      this.handlers.onMenuAction?.(el.dataset.act);
    };
  }
}
