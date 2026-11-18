/* ============================================================
   Games P2P — ФОРМАТ РАЗДАЧИ (shared/p2p/torrentfile.js)
   ------------------------------------------------------------
   Здесь всё, что делает раздачу настоящим торрентом, а не
   «скачиванием папки с сайта»:

     • .torrent-файл Games (JSON + bencode-совместимый info) —
       magnet-ссылка, info_hash, список файлов с sha256;
     • ТОЧНАЯ раскладка «упакованного потока»: все файлы игры
       идут подряд, как в архиве без сжатия, и режутся на чанки
       фиксированного размера. Это даёт список sha256 на каждый
       чанк (piece hashes) — по ним проверяется каждый принятый
       кусок, как в BitTorrent;
     • сопоставление «файл → диапазон байт» и «байт → чанк».

   Раскладка одинакова на сервере (Node) и в браузере, поэтому
   чанк, собранный на сервере, бит-в-бит равен чанку у клиента.

   Подключение:
     <script src="shared/p2p/torrentfile.js"></script>
     GamesP2P.buildTorrent(manifest)      // .torrent + чанки
     GamesP2P.buildMagnet(torrent)        // magnet:?xt=urn:btih:…
   ============================================================ */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.GamesP2P = Object.assign(root.GamesP2P || {}, api);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  const P2P = root.GamesP2P || {};
  const SCHEME = 'games-torrent/1';

  function sha256(bytes) {
    if (P2P.sha256HexSync) {
      const sync = P2P.sha256HexSync(bytes);
      if (sync) return sync;
    }
    return P2P.sha256Hex(bytes);
  }

  // ---------------------------------------------------------- раскладка
  // Плоский поточный вид: [{ path, offset, size }] — где какой файл лежит
  // в «упакованном потоке» игры. Сумма размеров = totalSize.
  function layoutOf(manifest) {
    let offset = 0;
    const files = (manifest && manifest.files) || [];
    return files.map((f) => {
      const entry = { path: f.path, offset, size: Math.max(0, Number(f.size) || 0), sha256: f.sha256 || '' };
      offset += entry.size;
      return entry;
    });
  }

  // Сколько чанков занимает поток.
  function pieceCountOf(manifest) {
    const total = Math.max(0, Number(manifest && manifest.totalSize) || 0);
    const chunk = Math.max(1, Number(manifest && manifest.chunkSize) || P2P.DEFAULT_CHUNK_SIZE);
    return Math.ceil(total / chunk);
  }

  // Диапазон байт куска потока: [from, to) внутри игры.
  function pieceRange(manifest, index) {
    const chunk = Math.max(1, Number(manifest.chunkSize) || P2P.DEFAULT_CHUNK_SIZE);
    const from = index * chunk;
    const to = Math.min(from + chunk, Number(manifest.totalSize) || 0);
    return { from, to, size: Math.max(0, to - from) };
  }

  // Какие файлы (или их части) попадают в чанк — нужно, чтобы собрать игру
  // из кусков и чтобы проверять файлы по отдельности после сборки.
  function piecesForFile(manifest, filePath) {
    const layout = layoutOf(manifest);
    const file = layout.find((f) => f.path === filePath);
    if (!file) return null;
    const chunk = manifest.chunkSize;
    const first = Math.floor(file.offset / chunk);
    const last = file.size === 0
      ? first
      : Math.floor((file.offset + file.size - 1) / chunk);
    return { file, from: first, to: last, count: last - first + 1 };
  }

  // ---------------------------------------------------- сборка из чанков
  // Игнорирует содержимое: просто склеивает чанки и режет по раскладке.
  // Возвращает файлы с байтами — их потом отдаёт автоочистка.
  function assembleFromPieces(manifest, getPiece) {
    const layout = layoutOf(manifest);
    const chunk = manifest.chunkSize;
    const out = [];
    for (const file of layout) {
      const bytes = new Uint8Array(file.size);
      let written = 0;
      // Кусок может захватывать сразу несколько файлов, поэтому идём по
      // абсолютным смещениям потока, а не «на файл — один кусок».
      const fileStart = file.offset;
      const fileEnd = file.offset + file.size;
      let cursor = fileStart;
      while (cursor < fileEnd) {
        const index = Math.floor(cursor / chunk);
        const piece = getPiece(index);
        if (!piece) return { ok: false, missing: index, files: out };
        const pieceStart = index * chunk;
        const pieceEnd = pieceStart + piece.length;
        // Берём пересечение: [файл] ∩ [кусок].
        const from = Math.max(cursor, pieceStart);
        const to = Math.min(fileEnd, pieceEnd);
        if (to <= from) return { ok: false, missing: index, files: out };
        const part = piece.subarray(from - pieceStart, to - pieceStart);
        bytes.set(part, written);
        written += part.length;
        cursor = to;
      }
      if (written !== file.size) return { ok: false, missing: null, files: out, short: file.path };
      out.push({ path: file.path, bytes, size: bytes.length, sha256: file.sha256 });
    }
    return { ok: true, files: out };
  }

  // ------------------------------------------------------ .torrent-файл
  /**
   * Строит «торрент-файл» раздачи и список хешей кусков.
   * @param {object} manifest  манифест (catalog entry) с files[]
   * @param {object} opts      { version, createdAt, announce[], webSeeds[], hasPiece(index,size) }
   *   hasPiece(index, size) → string|Promise<string> возвращает sha256 куска.
   *   В Node (генератор) передаётся, в браузере куски проверяются по серверу.
   */
  async function buildTorrent(manifest, opts) {
    const o = opts || {};
    const chunk = Math.max(1, Number(manifest.chunkSize) || P2P.DEFAULT_CHUNK_SIZE);
    const count = pieceCountOf(manifest);
    const hasher = typeof o.hasPiece === 'function' ? o.hasPiece : null;

    const pieces = [];
    if (hasher) {
      for (let i = 0; i < count; i += 1) {
        const { size } = pieceRange(manifest, i);
        const hex = await hasher(i, size);
        pieces.push({ index: i, size, sha256: hex });
      }
    }

    const info = {
      name: String(manifest.gameId || 'game'),
      version: String(o.version || manifest.version || 'v1'),
      length: Math.max(0, Number(manifest.totalSize) || 0),
      'piece length': chunk,
      'piece count': count,
      pieces: pieces.map((p) => p.sha256),
      files: layoutOf(manifest).map((f) => ({
        path: f.path,
        length: f.size,
        'sha256': f.sha256,
      })),
    };

    const infoHash = await sha256(`${SCHEME}|${manifest.gameId}|${info.version}|${chunk}`);
    return {
      schema: SCHEME,
      gameId: manifest.gameId,
      title: manifest.title || manifest.gameId,
      version: info.version,
      infoHash,
      announce: Array.isArray(o.announce) ? o.announce : [],
      webSeeds: Array.isArray(o.webSeeds) ? o.webSeeds : [],
      info,
      pieces,
      totalSize: info.length,
      chunkSize: chunk,
      pieceCount: count,
      fileCount: info.files.length,
      createdAt: o.createdAt || manifest.createdAt || new Date().toISOString(),
    };
  }

  // magnet:?xt=urn:btih:<hash>&dn=<name>&ws=<web seed>
  function buildMagnet(torrent) {
    if (!torrent || !torrent.infoHash) return '';
    const trackers = (torrent.announce || [])
      .map((url) => `&tr=${encodeURIComponent(url)}`)
      .join('');
    const seeds = (torrent.webSeeds || [])
      .map((url) => `&ws=${encodeURIComponent(url)}`)
      .join('');
    const name = encodeURIComponent(`${torrent.title || torrent.gameId} (Games P2P)`);
    return `magnet:?xt=urn:btih:${torrent.infoHash}&dn=${name}${trackers}${seeds}`;
  }

  // Разбор magnet: проверяем, что ссылка — наша и целая.
  function parseMagnet(text) {
    const raw = String(text || '').trim();
    if (!/^magnet:\?/i.test(raw)) return { ok: false, reason: 'это не magnet-ссылка' };
    const query = raw.slice(raw.indexOf('?') + 1);
    const params = new URLSearchParams(query);
    const xt = params.get('xt') || '';
    const hash = (xt.match(/^urn:btih:([a-f0-9]{64})$/i) || [])[1];
    if (!hash) return { ok: false, reason: 'в magnet нет urn:btih с sha256-хешем' };
    return {
      ok: true,
      infoHash: hash.toLowerCase(),
      title: params.get('dn') || '',
      trackers: params.getAll('tr'),
      webSeeds: params.getAll('ws'),
    };
  }

  // Проверка .torrent-файла, пришедшего извне (от пользователя или сервера):
  // отвергаем подменённые хеши и пути с выходом из папки.
  function validateTorrent(torrent) {
    const t = torrent || {};
    const problems = [];
    if (t.schema !== SCHEME) problems.push(`схема не ${SCHEME}`);
    if (!/^[a-f0-9]{64}$/i.test(String(t.infoHash || ''))) problems.push('плохой info_hash');
    if (!Array.isArray(t.info && t.info.files) || !t.info.files.length) problems.push('нет списка файлов');
    for (const file of (t.info && t.info.files) || []) {
      const p = String(file.path || '');
      if (!p || p.includes('..') || p.startsWith('/') || /^[a-z]+:/i.test(p)) {
        problems.push(`опасный путь: ${p || '(пустой)'}`);
      }
    }
    if (t.pieces && Array.isArray(t.pieces)) {
      for (const piece of t.pieces) {
        if (!/^[a-f0-9]{64}$/i.test(String(piece.sha256 || ''))) {
          problems.push(`плохой хеш куска ${piece.index}`);
          break;
        }
      }
    }
    return { ok: problems.length === 0, problems };
  }

  return {
    TORRENT_SCHEME: SCHEME,
    layoutOf,
    pieceCountOf,
    pieceRange,
    piecesForFile,
    assembleFromPieces,
    buildTorrent,
    buildMagnet,
    parseMagnet,
    validateTorrent,
  };
});
