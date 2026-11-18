/* ============================================================
   Games P2P — ЗАГРУЗКА ФАЙЛОВ И АВТООЧИСТКА (shared/p2p/fetch.js)
   ------------------------------------------------------------
   Берёт манифест игры и реально загружает каждый файл из
   статического хостинга репозитория (GitHub Pages / локальный
   сервер), проверяет его автоудалением плохих файлов
   (shared/p2p/sanitize.js) и складывает чистый набор в память.

   Это «издатель» раздачи: то, что прошло чистку, затем отдаётся
   другим по P2P (или через резервный сид сервера).

   Ничего не удаляется из репозитория — удаление касается только
   скачанной копии: плохой файл не попадает в набор раздачи.
   Игровые файлы (index.html, src/*.js, ассеты) не удаляются
   никогда — только явно вредоносное.

   Подключение:
     <script src="shared/p2p/manifest.js"></script>
     <script src="shared/p2p/sanitize.js"></script>
     <script src="shared/p2p/fetch.js"></script>
   ============================================================ */
(function (root) {
  'use strict';
  const P2P = (root.GamesP2P = root.GamesP2P || {});

  const TEXT_EXT = new Set(['js', 'mjs', 'cjs', 'json', 'html', 'htm', 'css', 'svg', 'txt', 'md', 'xml', 'csv', 'glsl', 'wgsl']);

  function baseUrlOf(explicit) {
    if (explicit) return String(explicit).replace(/\/+$/, '');
    // Корень сайта Games: на GitHub Pages это /games/, локально — папка репозитория.
    const loc = root.location || {};
    const pathname = String(loc.pathname || '/');
    const cut = pathname.indexOf('/site/');
    if (cut >= 0) return `${loc.origin}${pathname.slice(0, cut)}`;
    const dirMarker = pathname.lastIndexOf('/');
    return `${loc.origin || ''}${pathname.slice(0, dirMarker + 1)}`.replace(/\/+$/, '');
  }

  function isText(path) {
    return TEXT_EXT.has(String(path || '').split('.').pop().toLowerCase());
  }

  /**
   * Скачивает и чистит набор файлов игры.
   * @param {object} manifest  манифест из torrent-catalog.json
   * @param {object} opts      { baseUrl, onProgress(done,total,path), limit, signal }
   * @returns {Promise<object>} итог очистки + готовые файлы и журнал
   */
  async function fetchAndSanitize(manifest, opts) {
    const o = opts || {};
    const baseUrl = baseUrlOf(o.baseUrl);
    const files = Array.isArray(manifest && manifest.files) ? manifest.files : [];
    const total = files.length;
    const limit = Math.max(1, Math.min(total || 1, Number(o.limit) || total || 1));

    const loaded = [];
    const rejected = [];
    let done = 0;

    for (const file of files.slice(0, limit)) {
      const url = `${baseUrl}/${manifest.dir || manifest.gameId}/${file.path}`;
      let bytes = null;
      let text = null;
      try {
        const res = await fetch(url, { signal: o.signal, cache: 'force-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (isText(file.path)) {
          text = await res.text();
          bytes = new TextEncoder().encode(text);
        } else {
          bytes = new Uint8Array(await res.arrayBuffer());
        }
      } catch (err) {
        rejected.push({ path: file.path, rule: 'файл недоступен: ' + err.message, kind: 'unreachable', size: 0 });
        done += 1;
        if (typeof o.onProgress === 'function') o.onProgress(done, total, file.path);
        continue;
      }

      const verdict = P2P.judgeFile({ path: file.path, size: bytes.length, text });
      if (verdict.action === 'block') {
        rejected.push({
          path: file.path,
          rule: verdict.rule,
          kind: verdict.kind,
          reasons: verdict.reasons,
          sha256: await P2P.sha256Hex(bytes),
          size: bytes.length,
        });
      } else {
        const finalBytes = verdict.cleaned !== undefined ? new TextEncoder().encode(verdict.cleaned) : bytes;
        loaded.push({
          path: file.path,
          bytes: finalBytes,
          size: finalBytes.length,
          stripped: verdict.action === 'strip',
          rule: verdict.rule,
          sha256: await P2P.sha256Hex(finalBytes),
        });
        if (verdict.action === 'strip') {
          rejected.push({
            path: file.path, rule: verdict.rule, kind: 'sanitized',
            reasons: verdict.reasons, sha256: loaded[loaded.length - 1].sha256, size: finalBytes.length,
          });
        }
      }

      done += 1;
      if (typeof o.onProgress === 'function') o.onProgress(done, total, file.path);
    }

    const entryCheck = P2P.assertPlayable(loaded);
    const bytesBefore = loaded.reduce((n, f) => n + f.size, 0) + rejected.reduce((n, f) => n + (f.size || 0), 0);
    const bytesAfter = loaded.reduce((n, f) => n + f.size, 0);

    return {
      ok: entryCheck.ok,
      reason: entryCheck.reason,
      files: loaded,
      rejected,
      baseUrl,
      manifest,
      bytesBefore,
      bytesAfter,
      freedBytes: Math.max(0, bytesBefore - bytesAfter),
      summary: {
        checked: done,
        total,
        kept: loaded.length,
        removed: rejected.filter((r) => r.kind !== 'sanitized').length,
        sanitized: rejected.filter((r) => r.kind === 'sanitized').length,
      },
    };
  }

  /**
   * Упаковывает чистый набор обратно в один HTML-файл, который можно открыть
   * двойным щелчком. Картинки/звуки встраиваются как data:URL, скрипты — как есть.
   * Так скачивание даёт рабочую игру даже без сервера.
   */
  function packAsStandalone(result) {
    const files = result.files || [];
    const entry = files.find((f) => /(^|\/)index\.html?$/i.test(f.path)) || files.find((f) => /\.html?$/i.test(f.path));
    if (!entry) return null;

    const decoder = new TextDecoder();
    const byPath = new Map(files.map((f) => [f.path, f]));

    const mimeOf = (p) => {
      const ext = String(p).split('.').pop().toLowerCase();
      return ({
        png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif',
        svg: 'image/svg+xml', mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav', mp4: 'video/mp4',
        webm: 'video/webm', woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', glb: 'model/gltf-binary',
      })[ext] || 'application/octet-stream';
    };

    const toDataUrl = (file) => {
      let bin = '';
      const arr = file.bytes;
      for (let i = 0; i < arr.length; i += 0x8000) bin += String.fromCharCode.apply(null, arr.subarray(i, i + 0x8000));
      return `data:${mimeOf(file.path)};base64,${root.btoa(bin)}`;
    };

    let html = decoder.decode(entry.bytes);
    const entryDir = entry.path.replace(/[^/]+$/, '');

    // Встраиваем локальные ассеты в HTML (только то, что реально лежит рядом).
    for (const file of files) {
      if (file === entry) continue;
      const rel = file.path.startsWith(entryDir) ? file.path.slice(entryDir.length) : file.path;
      if (!/\.(png|jpe?g|webp|gif|svg|mp3|ogg|wav|woff2?|ttf)$/i.test(file.path)) continue;
      if (file.size > 900 * 1024) continue; // тяжёлое не раздуваем
      const dataUrl = toDataUrl(file);
      const escaped = rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(`(["'(])${escaped}\\1`, 'g'), (_m, q) => `${q}${dataUrl}${q}`);
    }

    // Инлайн-скрипты и стили, чтобы страница открывалась как один файл.
    const inlined = new Set();
    html = html.replace(/<script[^>]+src=["']([^"']+)["'][^>]*><\/script>/gi, (match, src) => {
      const resolved = resolveRel(entryDir, src);
      const file = byPath.get(resolved);
      if (!file || !/\.m?js$/i.test(file.path)) return match;
      inlined.add(resolved);
      return `<script>\n${decoder.decode(file.bytes)}\n</script>`;
    });
    html = html.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi, (match, href) => {
      const resolved = resolveRel(entryDir, href);
      const file = byPath.get(resolved);
      if (!file) return match;
      inlined.add(resolved);
      return `<style>\n${decoder.decode(file.bytes)}\n</style>`;
    });

    const leftover = files.filter((f) => f !== entry && !inlined.has(f.path));
    return {
      ok: true,
      html,
      entry: entry.path,
      inlined: inlined.size,
      leftover: leftover.map((f) => f.path),
      bytes: new TextEncoder().encode(html).length,
    };
  }

  function resolveRel(baseDir, href) {
    const clean = String(href || '').split('?')[0].split('#')[0].replace(/^\.\//, '');
    const parts = (baseDir + clean).split('/');
    const out = [];
    for (const part of parts) {
      if (!part || part === '.') continue;
      if (part === '..') out.pop();
      else out.push(part);
    }
    return out.join('/');
  }

  P2P.fetchAndSanitize = fetchAndSanitize;
  P2P.packAsStandalone = packAsStandalone;
  P2P.resolveRel = resolveRel;
  P2P.baseUrlOf = baseUrlOf;
})(typeof globalThis !== 'undefined' ? globalThis : this);
