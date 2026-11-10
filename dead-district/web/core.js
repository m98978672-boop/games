(function (global) {
  'use strict';

  var DD = global.DD = global.DD || {};

  // Детерминированный PRNG mulberry32 (единое зерно для мира, лута и ИИ)
  function mulberry32(seed) {
    var a = (seed >>> 0) || 20261110;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  DD.mulberry32 = mulberry32;
  DD.rngState = mulberry32(20261110);
  DD.reseed = function (seed) {
    DD.rngState = mulberry32(seed >>> 0);
  };
  DD.rand = function () {
    return DD.rngState();
  };
  DD.randInt = function (min, max) {
    return min + Math.floor(DD.rngState() * (max - min + 1));
  };
  DD.randRange = function (min, max) {
    return min + DD.rngState() * (max - min);
  };

  // Реестр реальных данных и справочников из data_bundle.js
  var DataDB = {
    itemsMap: {},
    recipesMap: {},
    buildablesMap: {},
    lootZones: {},
    zombiesMap: {},
    npcsMap: {},
    realMap: {},
    init: function () {
      var raw = global.DD_DATA || {};
      this.itemsMap = {};
      this.recipesMap = {};
      this.buildablesMap = {};
      this.lootZones = {};
      this.zombiesMap = {};
      this.npcsMap = {};
      this.realMap = {};

      var itemsList = (raw.items && raw.items.items) || [];
      for (var i = 0; i < itemsList.length; i++) {
        this.itemsMap[itemsList[i].id] = itemsList[i];
      }
      var recList = (raw.recipes && raw.recipes.recipes) || [];
      for (var r = 0; r < recList.length; r++) {
        this.recipesMap[recList[r].id] = recList[r];
      }
      var bList = (raw.recipes && raw.recipes.buildables) || [];
      for (var b = 0; b < bList.length; b++) {
        this.buildablesMap[bList[b].id] = bList[b];
      }
      this.lootZones = (raw.loot_tables && raw.loot_tables.zones) || {};
      this.zombiesMap = (raw.zombies && raw.zombies.types) || {};
      var npcList = (raw.npcs && raw.npcs.archetypes) || [];
      for (var n = 0; n < npcList.length; n++) {
        this.npcsMap[npcList[n].id] = npcList[n];
      }
      var realObj = raw.real || {};
      var cats = Object.keys(realObj);
      for (var c = 0; c < cats.length; c++) {
        var recs = (realObj[cats[c]] && realObj[cats[c]].records) || [];
        for (var j = 0; j < recs.length; j++) {
          this.realMap[recs[j].id] = recs[j];
        }
      }
    },
    getItem: function (id) {
      return this.itemsMap[id] || null;
    },
    getReal: function (id, fallbackVal) {
      var rec = this.realMap[id];
      if (rec && typeof rec.game_value === 'number' && Number.isFinite(rec.game_value)) {
        return rec.game_value;
      }
      return fallbackVal;
    }
  };
  DataDB.init();
  DD.DataDB = DataDB;

  // Централизованный ErrorManager с полным каталогом кодов E101..E1008
  var ERROR_CODES = {
    E101: 'Отсутствует ассет', E102: 'Некорректный размер PNG', E103: 'Полупрозрачные края AA',
    E104: 'Цвет вне палитры Survival Horror 32', E105: 'Некорректный меш GLB', E106: 'Ошибка аудио/шрифта/шейдера',
    E107: 'Недопустимая лицензия ассета', E108: 'Нарушение snake_case имени', E109: 'Переполнение атласа', E110: 'Сбой шейдера',
    E201: 'Слот сохранения пуст', E202: 'Повреждён JSON сохранения', E203: 'Неподдерживаемая версия сохранения',
    E204: 'Сбой миграции v1->v2->v3', E205: 'Отказ восстановления .bak', E206: 'Ошибка записи localStorage',
    E207: 'Несовпадение контрольной суммы', E208: 'Повреждена дельта чанка',
    E301: 'Выход за границы чанка', E302: 'Таймаут генерации чанка', E303: 'Дегенеративный BSP',
    E304: 'Фолбэк Вороного', E305: 'Разрыв дорог L-системы', E306: 'Невалидный тайл', E307: 'Пересечение пропа', E308: 'Попытка выгрузки активного чанка',
    E401: 'Лимит итераций A*', E402: 'Цель недостижима (забаррикадирована)', E403: 'Недопустимый переход FSM зомби',
    E404: 'Лимит 1200 зомби мира', E405: 'Лимит 150 активных зомби', E406: 'NaN в Utility AI', E407: 'Пустой товар NPC', E408: 'Разрыв SpatialHash',
    E501: 'Неизвестный предмет', E502: 'Конфликт слота одежды', E503: 'Критическое переохлаждение', E504: 'Тепловой удар',
    E505: 'Гиповолемический шок >40%', E506: 'Спринт с переломом', E507: 'Необратимая зомбификация', E508: 'NaN в характеристиках',
    E601: 'Перегруз инвентаря', E602: 'Неверный слот быстрого доступа', E603: 'Неизвестный рецепт', E604: 'Нет верстака или огня',
    E605: 'Клетка занята для стройки', E606: 'Пустая таблица лута', E607: 'Свежесть вне [0,1]', E608: 'Заморозки убили урожай',
    E701: 'Бак автомобиля пуст', E702: 'Двигатель изношен', E703: 'Багажник переполнен', E704: 'Отключение электросети',
    E705: 'Отключение водопровода', E706: 'Угарный газ CO от генератора в помещении', E707: 'Неисправный замок машины', E708: 'Просрочка продуктов без питания',
    E801: 'Нарушен размер 480x270', E802: 'Нарушен фильтр nearest', E803: 'Переполнение буфера FOV',
    E804: 'Некорректное значение шума дБ', E805: 'Сбой проигрывания WAV', E806: 'Ошибка текстуры HUD',
    E901: 'Сетевой запрос заблокирован (офлайн)', E902: 'Несовместимый формат данных', E903: 'Конфликт версии JSON', E904: 'Отказ доступа к хранилищу',
    E1001: 'Провал проверки AssetBot', E1002: 'Провал проверки SourceBot', E1003: 'Провал WorldBot',
    E1004: 'Провал BalanceBot', E1005: 'Провал CombatBot', E1006: 'Провал EconomyBot', E1007: 'Провал SaveBot', E1008: 'Таймаут автотеста'
  };

  var ErrorManager = {
    catalog: ERROR_CODES,
    logs: [],
    counts: {},
    lastToastAt: {},
    log: function (level, code, mod, msg, ctx) {
      var ts = new Date().toISOString().slice(11, 19);
      var line = '[' + ts + '][' + level + '][' + code + '][' + mod + '] ' + msg;
      this.counts[code] = (this.counts[code] || 0) + 1;
      this.logs.push({ ts: ts, level: level, code: code, mod: mod, msg: msg, ctx: ctx || {} });
      if (this.logs.length > 250) this.logs.shift();
      return line;
    },
    info: function (code, mod, msg, ctx) { return this.log('INFO', code, mod, msg, ctx); },
    warn: function (code, mod, msg, ctx) { return this.log('WARN', code, mod, msg, ctx); },
    error: function (code, mod, msg, ctx) { return this.log('ERROR', code, mod, msg, ctx); },
    fatal: function (code, mod, msg, ctx) { return this.log('FATAL', code, mod, msg, ctx); }
  };
  DD.ErrorManager = ErrorManager;

  // Надёжное сохранение с контрольной суммой, резервной копией .bak и миграциями v1 -> v2 -> v3
  function computeChecksum(str) {
    var h1 = 0x811c9dc5;
    var h2 = 0xdeadbeef;
    for (var i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 0x01000193) >>> 0;
      h2 = Math.imul(h2 ^ (ch + i), 0x85ebca6b) >>> 0;
    }
    return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
  }

  var SaveManager = {
    SAVE_KEY: 'dead_district_save_v3',
    BAK_KEY: 'dead_district_save_v3_bak',
    SAVE_VERSION: 3,
    computeChecksum: computeChecksum,
    save: function (payload, keyOverride) {
      var k = keyOverride || this.SAVE_KEY;
      var bakKey = keyOverride ? (keyOverride + '_bak') : this.BAK_KEY;
      var dataStr = JSON.stringify(payload);
      var env = {
        version: this.SAVE_VERSION,
        saved_at: Date.now(),
        checksum: computeChecksum(dataStr),
        data: payload
      };
      try {
        var prev = global.localStorage.getItem(k);
        if (prev) global.localStorage.setItem(bakKey, prev);
        global.localStorage.setItem(k, JSON.stringify(env));
        return true;
      } catch (err) {
        ErrorManager.error('E206', 'SaveManager', 'Сбой записи в localStorage', { err: String(err) });
        return false;
      }
    },
    hasSave: function (keyOverride) {
      var k = keyOverride || this.SAVE_KEY;
      var bakKey = keyOverride ? (keyOverride + '_bak') : this.BAK_KEY;
      try {
        return Boolean(global.localStorage.getItem(k) || global.localStorage.getItem(bakKey));
      } catch (err) {
        ErrorManager.warn('E904', 'SaveManager', 'Хранилище недоступно', { err: String(err) });
        return false;
      }
    },
    migrate: function (env) {
      var ver = Number(env.version || 1);
      var d = env.data || {};
      if (ver < 2) {
        if (!d.utilities) d.utilities = { gridPowerOn: true, gridWaterOn: true, generators: [] };
        ver = 2;
      }
      if (ver < 3) {
        if (!d.farming) d.farming = { plots: [] };
        ver = 3;
      }
      env.version = ver;
      env.data = d;
      return env;
    },
    _tryParseSlot: function (raw) {
      if (!raw) return null;
      var parsed = null;
      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        ErrorManager.error('E202', 'SaveManager', 'Битый JSON сохранения', { err: String(err) });
        return null;
      }
      if (!parsed || typeof parsed !== 'object' || !parsed.data) return null;
      var expected = computeChecksum(JSON.stringify(parsed.data));
      if (parsed.checksum && parsed.checksum !== expected) {
        ErrorManager.warn('E207', 'SaveManager', 'Контрольная сумма не совпала', {});
        return null;
      }
      if (Number(parsed.version || 1) > this.SAVE_VERSION) {
        ErrorManager.error('E203', 'SaveManager', 'Неподдерживаемая версия', { v: parsed.version });
        return null;
      }
      return this.migrate(parsed).data;
    },
    load: function (keyOverride) {
      var k = keyOverride || this.SAVE_KEY;
      var bakKey = keyOverride ? (keyOverride + '_bak') : this.BAK_KEY;
      try {
        var raw = global.localStorage.getItem(k);
        var data = this._tryParseSlot(raw);
        if (data) return data;
        var bak = global.localStorage.getItem(bakKey);
        var bakData = this._tryParseSlot(bak);
        if (bakData) {
          ErrorManager.warn('E202', 'SaveManager', 'Восстановлено из .bak', {});
          return bakData;
        }
        return null;
      } catch (err) {
        ErrorManager.error('E205', 'SaveManager', 'Отказ загрузки сохранения', { err: String(err) });
        return null;
      }
    }
  };
  DD.SaveManager = SaveManager;
})(window);
