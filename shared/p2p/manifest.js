/* ============================================================
   Games P2P — МАНИФЕСТ РАЗДАЧИ (shared/p2p/manifest.js)
   ------------------------------------------------------------
   Манифест — это «торрент-файл» игры: список файлов с размерами
   и контрольными суммами, разбитый на части (чанки) фиксированного
   размера. Из манифеста считается info_hash — отпечаток раздачи,
   как в BitTorrent:

       info_hash = SHA-256( gameId:version | путь:размер:sha256 … )

   Файл не зависит от браузера: тот же код работает в Node
   (тесты, CI, генератор) и в вкладке «Торрент».

   Подключение:  <script src="shared/p2p/manifest.js"></script>
                 const m = GamesP2P.buildManifest({...});
   ============================================================ */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.GamesP2P = Object.assign(root.GamesP2P || {}, api);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  const DEFAULT_CHUNK_SIZE = 256 * 1024; // 256 КиБ — как у торрентов
  const MIN_CHUNK = 16 * 1024;
  const MAX_CHUNK = 512 * 1024;

  // ---------------------------------------------------------- SHA-256
  // В браузере — WebCrypto (async), в Node — node:crypto.
  async function sha256Hex(input) {
    const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
    if (root.crypto && root.crypto.subtle && root.crypto.subtle.digest) {
      const buf = await root.crypto.subtle.digest('SHA-256', bytes);
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    // Node без WebCrypto (старые версии)
    const nodeCrypto = await import('node:crypto');
    return nodeCrypto.createHash('sha256').update(bytes).digest('hex');
  }

  function sha256HexSync(input) {
    if (typeof root.__p2pSha256Sync === 'function') return root.__p2pSha256Sync(input);
    // Node: синхронный хеш без WebCrypto. Нужен генератору чанков сервера.
    try {
      // eslint-disable-next-line global-require
      const nodeCrypto = typeof require === 'function' ? require('node:crypto') : null;
      if (nodeCrypto) return nodeCrypto.createHash('sha256').update(input).digest('hex');
    } catch { /* браузер — используем async-версию */ }
    return null;
  }

  // -------------------------------------------------- разбиение на части
  function chunkCount(totalSize, chunkSize) {
    const size = normalizeChunkSize(chunkSize);
    return Math.max(0, Math.ceil(Number(totalSize || 0) / size));
  }

  function normalizeChunkSize(value) {
    const n = Math.floor(Number(value) || 0);
    if (!Number.isFinite(n) || n <= 0) return DEFAULT_CHUNK_SIZE;
    return Math.min(MAX_CHUNK, Math.max(MIN_CHUNK, n));
  }

  // ------------------------------------------------------- нормализация
  function normalizePath(path) {
    const raw = String(path || '').replace(/\\/g, '/');
    const parts = raw.split('/').filter((seg) => seg && seg !== '.' && seg !== '..');
    return parts.join('/').trim().slice(0, 300);
  }

  function normalizeFile(entry) {
    const path = normalizePath(entry && entry.path);
    const size = Math.max(0, Math.floor(Number(entry && entry.size) || 0));
    return { path, size, sha256: String((entry && entry.sha256) || '').slice(0, 64) };
  }

  // Каноническая строка для info_hash. Порядок файлов не важен —
  // сортируем, чтобы один и тот же набор всегда давал один отпечаток.
  function canonicalTree(gameId, version, files) {
    const rows = files
      .map((f) => `${f.path}:${f.size}:${f.sha256 || ''}`)
      .slice()
      .sort();
    return `${String(gameId || '')}:${String(version || 'v1')}|${rows.join('|')}`;
  }

  async function computeInfoHash(gameId, version, files) {
    return sha256Hex(canonicalTree(gameId, version, files));
  }

  // --------------------------------------------------- сборка манифеста
  async function buildManifest(input) {
    const src = input || {};
    const gameId = String(src.gameId || '').trim();
    if (!gameId) throw new Error('buildManifest: нужен gameId');
    const version = String(src.version || 'v1').slice(0, 32);
    const rawFiles = Array.isArray(src.files) ? src.files : [];
    if (!rawFiles.length) throw new Error('buildManifest: нужен хотя бы один файл');

    const files = rawFiles.map(normalizeFile).filter((f) => f.path);
    const seen = new Set();
    const unique = [];
    for (const f of files) {
      if (seen.has(f.path)) continue;
      seen.add(f.path);
      unique.push(f);
    }

    const totalSize = unique.reduce((sum, f) => sum + f.size, 0);
    const chunkSize = normalizeChunkSize(src.chunkSize);
    const infoHash = await computeInfoHash(gameId, version, unique);

    return {
      schema: 'games-p2p-manifest/1',
      id: `${gameId}@${version}`,
      gameId,
      title: String(src.title || gameId).slice(0, 120),
      version,
      description: String(src.description || '').slice(0, 400),
      totalSize,
      chunkSize,
      chunkCount: chunkCount(totalSize, chunkSize),
      fileCount: unique.length,
      files: unique,
      infoHash,
      createdAt: src.createdAt || new Date().toISOString(),
    };
  }

  // Какие чанки покрывает файл — чтобы качать по файлам, а не всё сразу.
  function chunkRangeForFile(manifest, filePath) {
    const target = normalizePath(filePath);
    let offset = 0;
    for (const f of manifest.files) {
      if (f.path === target) {
        const from = Math.floor(offset / manifest.chunkSize);
        const to = Math.max(from, Math.ceil((offset + f.size) / manifest.chunkSize) - 1);
        return { from, to, offset, size: f.size };
      }
      offset += f.size;
    }
    return null;
  }

  // Битовая карта «какие чанки у меня есть» в компактной строке «1/0».
  function bitmapToString(have, total) {
    const n = Math.max(0, Number(total) || 0);
    let out = '';
    for (let i = 0; i < n; i += 1) out += have && have(i) ? '1' : '0';
    return out;
  }

  function bitmapFromString(text, total) {
    const s = String(text || '');
    const n = Math.max(0, Number(total) || s.length || 0);
    const arr = new Uint8Array(n);
    for (let i = 0; i < n; i += 1) arr[i] = s[i] === '1' ? 1 : 0;
    return arr;
  }

  function bitmapHas(arr, index) {
    return Boolean(arr && arr[index]);
  }

  function countBits(arr) {
    let n = 0;
    for (let i = 0; i < (arr ? arr.length : 0); i += 1) if (arr[i]) n += 1;
    return n;
  }

  // ------------------------------------------------------ прогресс/план
  // Сколько процентов скачано и сколько осталось.
  function progressOf(haveBitmap) {
    const total = haveBitmap ? haveBitmap.length : 0;
    const done = countBits(haveBitmap);
    return {
      total,
      done,
      left: Math.max(0, total - done),
      percent: total ? Math.round((done / total) * 1000) / 10 : 0,
      complete: total > 0 && done === total,
    };
  }

  // Порядок запроса чанков: сначала «редкие» (которых меньше у соседей),
  // затем по возрастанию индекса — так раздача не встаёт на одном пире.
  function planChunks(haveBitmap, peerBitmaps, total) {
    const n = Math.max(0, Number(total) || (haveBitmap ? haveBitmap.length : 0));
    const rarity = new Array(n).fill(0);
    for (const map of peerBitmaps || []) {
      for (let i = 0; i < n; i += 1) if (map && map[i]) rarity[i] += 1;
    }
    // Порядок — это ПРИОРИТЕТ, а не фильтр: сервер-сид (и любой пир) может
    // отдать любой чанк. Чанки, которых нет ни у одного пира, всё равно
    // запрашиваются последними — иначе игра никогда не докачается,
    // когда живых сидов нет и работает только резервный сервер.
    const missing = [];
    for (let i = 0; i < n; i += 1) {
      if (haveBitmap && haveBitmap[i]) continue;
      missing.push(i);
    }
    missing.sort((a, b) => {
      const ra = rarity[a] === 0 ? Number.MAX_SAFE_INTEGER : rarity[a];
      const rb = rarity[b] === 0 ? Number.MAX_SAFE_INTEGER : rarity[b];
      return (ra - rb) || (a - b);
    });
    return missing;
  }

  // Скорость и оценка времени: скользящее окно по замерам байт/время.
  function createMeter(windowMs) {
    const span = Math.max(1000, Number(windowMs) || 8000);
    let samples = [];
    return {
      add(bytes, at) {
        const t = Number(at) || Date.now();
        samples.push({ bytes: Math.max(0, Number(bytes) || 0), at: t });
        samples = samples.filter((s) => t - s.at <= span);
      },
      bytesPerSecond(at) {
        const t = Number(at) || Date.now();
        const live = samples.filter((s) => t - s.at <= span);
        if (!live.length) return 0;
        const sum = live.reduce((acc, item) => acc + item.bytes, 0);
        const oldest = live[0].at;
        // Окно не меньше секунды: замеры за один тик не должны давать Infinity.
        const elapsed = Math.max(1000, t - oldest);
        const value = Math.round((sum * 1000) / elapsed);
        return Number.isFinite(value) ? value : 0;
      },
      etaSeconds(leftBytes, at) {
        const speed = this.bytesPerSecond(at);
        if (!speed) return null;
        return Math.round(Math.max(0, Number(leftBytes) || 0) / speed);
      },
      reset() {
        samples = [];
      },
    };
  }

  function formatBytes(bytes) {
    const n = Number(bytes) || 0;
    if (n < 1024) return `${n} Б`;
    const units = ['КБ', 'МБ', 'ГБ', 'ТБ'];
    let value = n / 1024;
    let i = 0;
    while (value >= 1024 && i < units.length - 1) {
      value /= 1024;
      i += 1;
    }
    return `${value >= 100 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
  }

  function formatEta(seconds) {
    if (seconds === null || seconds === undefined) return '—';
    const s = Math.max(0, Math.round(seconds));
    if (s < 60) return `${s} с`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} мин`;
    const h = Math.floor(m / 60);
    return `${h} ч ${m % 60} мин`;
  }

  return {
    DEFAULT_CHUNK_SIZE,
    MIN_CHUNK,
    MAX_CHUNK,
    sha256Hex,
    sha256HexSync,
    normalizeChunkSize,
    normalizePath,
    normalizeFile,
    canonicalTree,
    computeInfoHash,
    buildManifest,
    chunkCount,
    chunkRangeForFile,
    bitmapToString,
    bitmapFromString,
    bitmapHas,
    countBits,
    progressOf,
    planChunks,
    createMeter,
    formatBytes,
    formatEta,
  };
});
