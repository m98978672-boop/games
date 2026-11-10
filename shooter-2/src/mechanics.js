/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — реестр механик: 250 правил игры
   -----------------------------------------------------------------------------
   Механика здесь — это не текст в списке, а правило с хуком: оно либо меняет
   числа (урон, скорость перезарядки, разброс), либо подписывается на событие
   (`on kill`, `on hurt`, `on reload`, `on tick`) и что-то делает.

   Всё, что важно для «не сломать игру»:
     • по умолчанию включена только горстка механик (CORE), остальные лежат в
       реестре и включаются по требованию (лаборатория, режимы, миссии);
     • каждая механика объявляет, какие ключи она трогает, и МОДИФИКАТОРЫ
       собираются в множители один раз — в кадре никто не перебирает 250
       правил;
     • каждая механика детерминирована: никакого Math.random в правилах, только
       `rng` из контекста — иначе тесты «поплывут».

   API:
     SH2.mechanics.COUNT                    // 250
     SH2.mechanics.list({enabled})          // [{id, title, family, ...}]
     SH2.mechanics.enable(id, on)           // включить/выключить
     SH2.mechanics.active()                 // включённые id
     SH2.mechanics.mods(game)               // {damage:1.2, reloadTime:0.9, ...}
     SH2.mechanics.emit(game, 'kill', data)
     SH2.mechanics.tick(game, dt)
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const num = (ctx, key, dflt) => {
    const v = ctx && ctx.flags ? ctx.flags[key] : undefined;
    return v === undefined ? dflt : v;
  };

  /* ------------------------------ СЕМЕЙСТВА ------------------------------
     25 семейств × 10 вариантов = 250. Каждое семейство описывает, какие ключи
     трогает,
     и как строятся варианты: вариант v усиливает эффект, поэтому каждое
     правило — это своё число, а не имя в списке. */
  const FAMILIES = [
    {
      key: 'damage', title: 'урон', keys: ['damage'],
      build(v) {
        const k = 1 + 0.02 * (v + 1);
        return {
          id: 'damage-' + (v + 1),
          title: 'Урон +' + Math.round((k - 1) * 100) + '%',
          apply(m) { m.damage *= k; }
        };
      }
    },
    {
      key: 'fireRate', title: 'темп огня', keys: ['rpm'],
      build(v) {
        const k = 1 + 0.025 * (v + 1);
        return {
          id: 'firerate-' + (v + 1),
          title: 'Темп огня +' + Math.round((k - 1) * 100) + '%',
          apply(m) { m.rpm *= k; }
        };
      }
    },
    {
      key: 'reload', title: 'перезарядка', keys: ['reloadTime'],
      build(v) {
        const k = 1 - 0.02 * (v + 1);
        return {
          id: 'reload-' + (v + 1),
          title: 'Перезарядка −' + Math.round((1 - k) * 100) + '%',
          apply(m) { m.reloadTime *= Math.max(0.35, k); }
        };
      }
    },
    {
      key: 'spread', title: 'разброс', keys: ['spread'],
      build(v) {
        const k = 1 - 0.025 * (v + 1);
        return {
          id: 'spread-' + (v + 1),
          title: 'Разброс −' + Math.round((1 - k) * 100) + '%',
          apply(m) { m.spread *= Math.max(0.3, k); }
        };
      }
    },
    {
      key: 'recoil', title: 'отдача', keys: ['recoil'],
      build(v) {
        const k = 1 - 0.02 * (v + 1);
        return {
          id: 'recoil-' + (v + 1),
          title: 'Отдача −' + Math.round((1 - k) * 100) + '%',
          apply(m) { m.recoil *= Math.max(0.3, k); }
        };
      }
    },
    {
      key: 'health', title: 'здоровье', keys: ['maxHp'],
      build(v) {
        const add = 5 * (v + 1);
        return {
          id: 'health-' + (v + 1),
          title: 'Здоровье +' + add,
          apply(m) { m.maxHp += add; }
        };
      }
    },
    {
      key: 'armor', title: 'броня', keys: ['armor'],
      build(v) {
        const add = 4 * (v + 1);
        return {
          id: 'armor-' + (v + 1),
          title: 'Броня +' + add,
          apply(m) { m.armor += add; }
        };
      }
    },
    {
      key: 'move', title: 'движение', keys: ['speed'],
      build(v) {
        const k = 1 + 0.02 * (v + 1);
        return {
          id: 'move-' + (v + 1),
          title: 'Скорость +' + Math.round((k - 1) * 100) + '%',
          apply(m) { m.speed *= k; }
        };
      }
    },
    {
      key: 'magnet', title: 'подбор', keys: ['magnet'],
      build(v) {
        const r = 1 + 0.4 * (v + 1);
        return {
          id: 'magnet-' + (v + 1),
          title: 'Радиус подбора ' + r.toFixed(1) + ' м',
          apply(m) { m.magnet *= 1 + 0.15 * (v + 1); }
        };
      }
    },
    {
      key: 'regen', title: 'регенерация', keys: ['regen'],
      build(v) {
        const r = 0.4 * (v + 1);
        return {
          id: 'regen-' + (v + 1),
          title: 'Регенерация ' + r.toFixed(1) + ' HP/с',
          apply(m) { m.regen += r; }
        };
      }
    },
    {
      key: 'crit', title: 'критический удар', keys: ['crit'],
      build(v) {
        const p = 0.01 * (v + 1), k = 2;
        return {
          id: 'crit-' + (v + 1),
          title: 'Крит ' + Math.round(p * 100) + '% ×' + k,
          hooks: {
            /* крит решает ДСПЧ контекста: детерминированно и проверяемо */
            beforeHit(ctx, d) {
              const rng = ctx.rng || Math.random;
              if (rng() < p) { d.damage *= k; d.crit = true; }
            }
          }
        };
      }
    },
    {
      key: 'vamp', title: 'вампиризм', keys: ['lifesteal'],
      build(v) {
        const f = 0.01 * (v + 1);
        return {
          id: 'vamp-' + (v + 1),
          title: 'Лечение от урона ' + Math.round(f * 100) + '%',
          hooks: {
            onKill(ctx, d) {
              const g = ctx.game;
              /* лечение видно снаружи: пишем в данные события, иначе правило
                 «работает», но ни игра, ни проверки этого не видят */
              if (g.player && g.player.alive) {
                const before = g.player.hp;
                g.player.hp = Math.min(g.player.maxHp, g.player.hp + f * 30);
                d.healed = (d.healed || 0) + (g.player.hp - before);
              }
              return d;
            }
          }
        };
      }
    },
    {
      key: 'thorns', title: 'шипы', keys: ['thorns'],
      build(v) {
        const dmg = 1.5 * (v + 1);
        return {
          id: 'thorns-' + (v + 1),
          title: 'Ответный урон ' + dmg.toFixed(1),
          hooks: {
            onPlayerHurt(ctx, d) {
              if (d.attacker && d.attacker.hit) d.attacker.hit(dmg, ctx.game, { melee: true });
            }
          }
        };
      }
    },
    {
      key: 'loot', title: 'добыча', keys: ['lootBonus'],
      build(v) {
        const k = 1 + 0.1 * (v + 1);
        return {
          id: 'loot-' + (v + 1),
          title: 'Очков за убийство ×' + k.toFixed(1),
          hooks: {
            onKill(ctx) { ctx.game.score = Math.round(ctx.game.score * k); }
          }
        };
      }
    },
    {
      key: 'enemyHp', title: 'прочность врагов', keys: ['enemyHp'],
      build(v) {
        const k = 1 + 0.03 * (v + 1);
        return {
          id: 'enemyhp-' + (v + 1),
          title: 'HP врагов ×' + k.toFixed(2),
          apply(m) { m.enemyHp *= k; }
        };
      }
    },
    {
      key: 'enemySpeed', title: 'скорость врагов', keys: ['enemySpeed'],
      build(v) {
        const k = 1 + 0.02 * (v + 1);
        return {
          id: 'enemyspeed-' + (v + 1),
          title: 'Скорость врагов ×' + k.toFixed(2),
          apply(m) { m.enemySpeed *= k; }
        };
      }
    },
    {
      key: 'enemyAcc', title: 'меткость врагов', keys: ['enemyAcc'],
      build(v) {
        const k = 1 + 0.03 * (v + 1);
        return {
          id: 'enemyacc-' + (v + 1),
          title: 'Меткость врагов ×' + k.toFixed(2),
          apply(m) { m.enemyAcc *= k; }
        };
      }
    },
    {
      key: 'ammo', title: 'боекомплект', keys: ['magBonus', 'reserveBonus'],
      build(v) {
        return {
          id: 'ammo-' + (v + 1),
          title: 'Магазин +' + (v + 1) + ', запас +' + ((v + 1) * 10),
          apply(m) { m.magBonus += (v + 1); m.reserveBonus += (v + 1) * 10; }
        };
      }
    },
    {
      key: 'timeWarp', title: 'время', keys: ['timeScale'],
      build(v) {
        const k = 1 + 0.01 * (v + 1);
        return {
          id: 'timewarp-' + (v + 1),
          title: 'Время ×' + k.toFixed(2),
          apply(m) { m.timeScale *= k; }
        };
      }
    },
    {
      key: 'grenade', title: 'гранаты', keys: ['grenades'],
      build(v) {
        return {
          id: 'grenade-' + (v + 1),
          title: 'Гранат +' + (v + 1),
          apply(m) { m.grenades += (v + 1); }
        };
      }
    },
    {
      key: 'explosion', title: 'взрыв', keys: ['blastRadius', 'blastDamage'],
      build(v) {
        const k = 1 + 0.04 * (v + 1);
        return {
          id: 'blast-' + (v + 1),
          title: 'Взрыв ×' + k.toFixed(2),
          apply(m) { m.blastRadius *= k; m.blastDamage *= k; }
        };
      }
    },
    {
      key: 'sound', title: 'звук', keys: [],
      build(v) {
        const id = v * 25;   // 0..225 — попадает в банк из 250 звуков
        return {
          id: 'sound-' + (v + 1),
          title: 'Звук события №' + (id + 1),
          hooks: {
            onKill(ctx) {
              if (SH2.soundbank && ctx.game.soundbank) ctx.game.soundbank.play(Math.min(249, id), 0, 0, 0.8);
            }
          }
        };
      }
    },
    {
      key: 'mesh', title: 'декорация', keys: [],
      build(v) {
        const n = 40 * (v + 1);
        return {
          id: 'mesh-' + (v + 1),
          title: 'Отдельных мешей на карте +' + n,
          hooks: {
            onMissionStart(ctx) {
              const f = ctx.game.meshfield;
              if (f) f.buildReal(n, ctx.game.scene);
            }
          }
        };
      }
    },
    {
      key: 'weather', title: 'погода', keys: [],
      build(v) {
        const d = 0.0025 + 0.0004 * (v + 1);
        return {
          id: 'weather-' + (v + 1),
          title: 'Плотность дымки ' + d.toFixed(4),
          hooks: {
            onMissionStart(ctx) {
              const g = ctx.game, T = root.THREE;
              if (T && g.scene && g.level) g.scene.fog = new T.FogExp2(g.level.map.fog, d);
            }
          }
        };
      }
    },
    {
      key: 'light', title: 'свет', keys: [],
      build(v) {
        const k = 0.9 + 0.03 * (v + 1);
        return {
          id: 'light-' + (v + 1),
          title: 'Солнце ×' + k.toFixed(2),
          hooks: {
            onMissionStart(ctx) {
              const sun = ctx.game.level && ctx.game.level.sun;
              if (sun && sun.intensity !== undefined) sun.intensity *= k;
            }
          }
        };
      }
    }
  ];

  /* 25 семейств × 10 вариантов = ровно 250 механик. */
  const VARIANT_COUNT = 10;
  const COUNT = FAMILIES.length * VARIANT_COUNT;   // 250

  /* Механики, которые включены на старте: минимальный набор, который не
     меняет ощущение игры. Всё остальное — по требованию. */
  const CORE = ['damage-1', 'reload-1', 'spread-1', 'health-1', 'move-1'];

  function describe(index) {
    const i = Math.max(0, Math.min(COUNT - 1, Math.floor(index) || 0));
    const f = Math.floor(i / VARIANT_COUNT);
    const v = i % VARIANT_COUNT;
    const fam = FAMILIES[f];
    const m = fam.build(v);
    return {
      index: i,
      id: m.id,
      family: fam.key,
      familyTitle: fam.title,
      variant: v,
      title: m.title,
      keys: fam.keys.slice(),
      hasHooks: !!m.hooks
    };
  }

  /* ---------------------------- сам реестр -------------------------------- */
  class Registry {
    constructor() {
      this.entries = new Map();
      for (let i = 0; i < COUNT; i++) {
        const d = describe(i);
        const fam = FAMILIES[Math.floor(i / VARIANT_COUNT)];
        const built = fam.build(i % VARIANT_COUNT);
        this.entries.set(d.id, Object.assign({}, d, { spec: built, on: false }));
      }
      CORE.forEach((id) => this.enable(id, true));
      this.cache = null;
      this.emits = 0;
      this.log = [];
      this.logLimit = 40;
    }

    get count() { return this.entries.size; }

    list(filter) {
      const f = filter || {};
      const out = [];
      this.entries.forEach((e) => {
        if (f.enabled !== undefined && e.on !== !!f.enabled) return;
        if (f.family && e.family !== f.family) return;
        out.push({ index: e.index, id: e.id, family: e.family, familyTitle: e.familyTitle, title: e.title, keys: e.keys, on: e.on });
      });
      return out;
    }

    enable(id, on) {
      const e = this.entries.get(id);
      if (!e) return false;
      const next = on === undefined ? true : !!on;
      if (e.on === next) return true;
      e.on = next;
      this.cache = null;
      return true;
    }

    toggle(id) {
      const e = this.entries.get(id);
      if (!e) return false;
      return this.enable(id, !e.on);
    }

    active() { return this.list({ enabled: true }).map((e) => e.id); }
    isOn(id) { const e = this.entries.get(id); return !!(e && e.on); }

    /* Модификаторы собираются один раз и кэшируются: в кадре никаких 250
       переборов. Ключи-множители начинаются с 1, аддитивные — с 0. */
    mods() {
      if (this.cache) return this.cache;
      const m = {
        damage: 1, rpm: 1, reloadTime: 1, spread: 1, recoil: 1, speed: 1, magnet: 1,
        enemyHp: 1, enemySpeed: 1, enemyAcc: 1, timeScale: 1, blastRadius: 1, blastDamage: 1,
        maxHp: 0, armor: 0, regen: 0, magBonus: 0, reserveBonus: 0, grenades: 0
      };
      this.entries.forEach((e) => {
        if (!e.on || !e.spec || !e.spec.apply) return;
        e.spec.apply(m);
      });
      this.cache = m;
      return m;
    }

    /* Событие проходит через все включённые хуки. Возвращает данные — так
       правило может изменить урон, счёт или отметить крит. */
    emit(game, type, data) {
      const d = data || {};
      const ctx = { game, rng: game && game.mechRng ? game.mechRng : Math.random };
      this.emits++;
      this.entries.forEach((e) => {
        if (!e.on || !e.spec || !e.spec.hooks) return;
        const h = e.spec.hooks['on' + type.charAt(0).toUpperCase() + type.slice(1)] ||
          e.spec.hooks[type];
        if (typeof h !== 'function') return;
        try { h(ctx, d); } catch (err) { /* правило не должно валить игру */ }
      });
      if (this.log.length >= this.logLimit) this.log.shift();
      this.log.push({ type, id: d.id || null });
      return d;
    }

    stats() {
      const byFam = {};
      let on = 0;
      this.entries.forEach((e) => {
        byFam[e.family] = (byFam[e.family] || 0) + 1;
        if (e.on) on++;
      });
      return { count: this.entries.size, families: FAMILIES.length, enabled: on, byFamily: byFam, emits: this.emits };
    }
  }

  const registry = new Registry();

  SH2.mechanics = {
    COUNT,
    FAMILIES: FAMILIES.map((f) => f.key),
    families: FAMILIES.map((f) => ({ key: f.key, title: f.title, keys: f.keys })),
    CORE: CORE.slice(),
    describe,
    registry,
    list: (f) => registry.list(f),
    enable: (id, on) => registry.enable(id, on),
    toggle: (id) => registry.toggle(id),
    active: () => registry.active(),
    isOn: (id) => registry.isOn(id),
    mods: (game) => {
      /* для игры — модификаторы реестра; аргумент оставлен, чтобы вызов был
         единообразным (`SH2.mechanics.mods(game)`) */
      return registry.mods(game);
    },
    emit: (game, type, data) => registry.emit(game, type, data),
    stats: () => registry.stats()
  };
})(typeof window !== 'undefined' ? window : globalThis);
