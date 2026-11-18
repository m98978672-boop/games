/* ============================================================
   Games P2P — АВТОУДАЛЕНИЕ ПЛОХИХ ФАЙЛОВ (shared/p2p/sanitize.js)
   ------------------------------------------------------------
   Проверяет файлы скачанного архива игры и решает судьбу каждого:

     allow  — файл нужен игре, оставляем без изменений;
     strip  — файл полезен, но из него вырезаются опасные куски
              (например, авто-запуск в HTML или обфускация в JS);
     block  — файл удаляется целиком (исполняемый .exe/.scr,
              майнер, похититель паролей, .hta/.vbs с автозапуском).

   ВАЖНО ПРО ЗАЩИТУ ИГР (закон репозитория): движок, исходники,
   конфиги, картинки/звуки и данные сохранений игры НЕ удаляются
   никогда — только явно вредоносное. Игровые .js, .wasm,
   .json, .png, .glb, .ogg и т.п. не блокируются за расширение.

   Результат:
     { files: [...оставленные], blocked: [...], stripped: [...],
       totalBefore, totalAfter, freedBytes, verdict }

   Подключение: <script src="shared/p2p/sanitize.js"></script>
   ============================================================ */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.GamesP2P = Object.assign(root.GamesP2P || {}, api);
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Типы, которые игра использует постоянно. Даже если внутри шумит
  // «eval» в старом движке — файл не удаляем, а чистим или оставляем.
  const GAME_ASSET_EXT = new Set([
    'js', 'mjs', 'cjs', 'wasm', 'json', 'glb', 'gltf', 'obj', 'fbx', 'bin', 'dat',
    'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'ico', 'avif', 'tga', 'ktx2', 'basis',
    'mp3', 'ogg', 'wav', 'm4a', 'opus', 'flac', 'aac', 'webm', 'mp4',
    'css', 'html', 'htm', 'txt', 'md', 'csv', 'xml', 'frag', 'vert', 'glsl', 'wgsl',
    'ttf', 'otf', 'woff', 'woff2', 'eot', 'atlas', 'fnt', 'tmx', 'tsx', 'ldtk', 'yaml', 'yml',
  ]);

  // Расширения, которые в браузерной игре не нужны и опасны.
  const HARD_BLOCK_EXT = new Set([
    'exe', 'scr', 'com', 'pif', 'cpl', 'msi', 'msp', 'hta', 'jar', 'apk', 'app',
    'bat', 'cmd', 'ps1', 'psm1', 'vbs', 'vbe', 'wsf', 'wsh', 'reg', 'lnk', 'dll',
    'sys', 'drv', 'ocx', 'sh', 'bash', 'zsh', 'run', 'deb', 'rpm', 'dmg', 'pkg',
    'iso', 'img', 'vhd', 'vhdx',
  ]);

  // Системный мусор — не вредоносный, но и не нужный игре.
  // severity 'junk': удаляется без предупреждения, игра не страдает.
  const JUNK_NAMES = new Set(['.ds_store', 'thumbs.db', 'desktop.ini', '.localized']);
  const JUNK_DIRS = ['__macosx/', '.git/', '.svn/', 'node_modules/', '.idea/', '.vscode/'];

  // ------------------------------------------------------------ сигнатуры
  const SIGNATURES = [
    {
      id: 'miner',
      label: 'Криптомайнер',
      // ВАЖНО: «stratum» — ещё и математическое слово (гауссов шум, слои пород).
      // Поэтому ловим только настоящие пулы: scheme stratum+tcp/ssl или
      // название пула в кавычках/после разделителя, а не любое слово.
      severity: 'block',
      re: /(coinhive|cryptonight|crypto-loot|coin-hive|webminepool|minero\.cc|monero\s*pool|xmrig)|stratum\+tcp:\/\/|stratum\+ssl:\/\/|["'`/]stratum["'`]\s*[,:)]|(?:pool|pool\.host|host)\s*[:=]\s*["'][a-z0-9.-]+:\d{2,5}["']/i,
      risk: 95,
    },
    {
      id: 'stealer',
      label: 'Похититель данных',
      severity: 'block',
      // Разделителем в реальных образцах бывает и пробел, и «_», и «-»:
      // seed_phrase / seed-phrase / seed phrase. «\s» ловит только пробелы,
      // поэтому набор разделителей задан явно — иначе самая частая запись
      // («seed_phrase») проходила мимо.
      re: /(seed[\s_-]*phrase|private[\s_-]*key|keystore\.json|wallet\.dat|metamask.*extract|password[\s_-]*harvest|stealc|redline[\s_-]*stealer|agenttesla)/i,
      risk: 92,
    },
    {
      id: 'obfuscated-autorun',
      label: 'Обфусцированный автозапуск',
      severity: 'block',
      re: /(document\.write\s*\(\s*unescape\s*\(|eval\s*\(\s*atob\s*\(|fromCharCode\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+)/i,
      risk: 85,
    },
    {
      id: 'powershell-dropper',
      label: 'Дроппер через PowerShell',
      severity: 'block',
      re: /(powershell(\.exe)?\s+-[ec][^<]{0,80}?(hidden|bypass|downloadstring|invoke-expression)|mshta\s+https?:|wscript\.shell)/i,
      risk: 90,
    },
    {
      id: 'remote-iframer',
      label: 'Скрытый редирект/iframe',
      severity: 'strip',
      re: /<iframe[^>]+(width\s*=\s*["']?0|height\s*=\s*["']?0|display\s*:\s*none)[^>]*>/i,
      risk: 60,
    },
    {
      id: 'bidi-trojan',
      label: 'Скрытые BiDi-символы (Trojan Source)',
      severity: 'strip',
      re: /[\u202A-\u202E\u2066-\u2069]/,
      risk: 55,
    },
    {
      id: 'js-in-html',
      label: 'Встроенный скрипт в HTML',
      severity: 'report',
      re: /<script\b[^>]*>[\s\S]{0,4000}?<\/script>/i,
      risk: 20,
    },
  ];

  // HTML-чистка: вырезаем автозапуск, но оставляем разметку игры.
  const HTML_STRIP_RULES = [
    { id: 'meta-refresh', re: /<meta[^>]+http-equiv\s*=\s*["']?refresh["']?[^>]*>/gi },
    { id: 'base-hijack', re: /<base\b[^>]*href\s*=\s*["']?(?!\.|\/)[^"'>]+["']?[^>]*>/gi },
    { id: 'inline-onload', re: /\son(?:load|error|beforeunload|unload)\s*=\s*["'][^"']{200,}["']/gi },
    { id: 'hidden-iframe', re: /<iframe[^>]*(?:width\s*=\s*["']?0|height\s*=\s*["']?0|display\s*:\s*none)[^>]*>\s*<\/iframe>/gi },
    { id: 'bidi', re: /[\u202A-\u202E\u2066-\u2069]/g },
  ];

  function extOf(path) {
    const clean = String(path || '').split('/').pop();
    const dot = clean.lastIndexOf('.');
    return dot > 0 ? clean.slice(dot + 1).toLowerCase() : '';
  }

  function nameOf(path) {
    return String(path || '').split('/').pop().toLowerCase();
  }

  function isJunk(path) {
    const p = String(path || '').replace(/\\/g, '/').toLowerCase();
    if (JUNK_NAMES.has(nameOf(p))) return true;
    if (JUNK_DIRS.some((dir) => p.startsWith(dir) || p.includes('/' + dir))) return true;
    // Файлы, помеченные macOS как ресурсные вилки
    if (p.startsWith('._') || p.includes('/._')) return true;
    return false;
  }

  function isGameAsset(path) {
    return GAME_ASSET_EXT.has(extOf(path));
  }

  // Сканирует содержимое файла. text — строка или null для бинарных.
  function inspectContent(path, text) {
    const reasons = [];
    let risk = 0;
    if (typeof text !== 'string' || !text) return { reasons, risk, rules: [] };

    const rules = [];

    // Автозапуск в HTML: мета-редирект и подмена базового адреса — чистим.
    if (/\.html?$/i.test(path)) {
      const autorun = [
        { id: 'meta-refresh', label: 'Мета-редирект при открытии', severity: 'strip', risk: 60 },
        { id: 'base-hijack', label: 'Подмена базового адреса (<base>)', severity: 'strip', risk: 55 },
      ];
      for (const rule of autorun) {
        const re = rule.id === 'meta-refresh'
          ? /<meta[^>]+http-equiv\s*=\s*["']?refresh["']?[^>]*>/i
          : /<base\b[^>]*href\s*=\s*["']?(?!\.|\/)[^"'>]+["']?[^>]*>/i;
        if (re.test(text)) {
          reasons.push(rule.label);
          risk = Math.max(risk, rule.risk);
          rules.push(rule);
        }
      }
    }

    for (const sig of SIGNATURES) {
      const re = new RegExp(sig.re.source, sig.re.flags.replace('g', '') + '');
      if (re.test(text)) {
        reasons.push(sig.label);
        risk = Math.max(risk, sig.risk);
        rules.push(sig);
      }
    }
    return { reasons, risk, rules };
  }

  // Главная функция: решает судьбу одного файла.
  // file = { path, size, text|null }
  function judgeFile(file) {
    const path = String((file && file.path) || '');
    const ext = extOf(path);
    const size = Math.max(0, Number(file && file.size) || 0);
    const text = file && typeof file.text === 'string' ? file.text : null;
    const base = { path, ext, size };

    if (isJunk(path)) {
      return { ...base, action: 'block', kind: 'junk', rule: 'мусор ОС', risk: 0, reasons: ['Системный мусор — игре не нужен'] };
    }

    if (HARD_BLOCK_EXT.has(ext)) {
      return {
        ...base, action: 'block', kind: 'executable', rule: `исполняемый .${ext}`,
        risk: 100, reasons: [`Исполняемый файл .${ext} в браузерной игре не нужен и опасен`],
      };
    }

    const scan = inspectContent(path, text);

    // Явная вредоносная сигнатура — блокируем всегда, даже в .js.
    const hard = scan.rules.filter((r) => r.severity === 'block');
    if (hard.length) {
      return {
        ...base, action: 'block', kind: 'malware', rule: hard[0].id,
        risk: scan.risk, reasons: hard.map((r) => r.label),
      };
    }

    // Мягкие сигнатуры: чистим содержимое, файл оставляем.
    const stripRules = scan.rules.filter((r) => r.severity === 'strip');
    if (stripRules.length && text !== null) {
      const cleaned = cleanContent(ext, text);
      const changed = cleaned !== text;
      return {
        ...base, action: changed ? 'strip' : 'allow', kind: 'sanitized', rule: stripRules[0].id,
        risk: scan.risk, reasons: stripRules.map((r) => r.label), cleaned: changed ? cleaned : undefined,
      };
    }

    // Игровой файл — оставляем. Даже если риск ненулевой, игра без него не запустится.
    return {
      ...base, action: 'allow', kind: isGameAsset(path) ? 'game-asset' : 'other',
      rule: 'игровой файл', risk: scan.risk, reasons: scan.reasons,
    };
  }

  function cleanContent(ext, text) {
    let out = String(text);
    if (ext === 'html' || ext === 'htm') {
      for (const rule of HTML_STRIP_RULES) out = out.replace(rule.re, '');
    } else if (ext === 'js' || ext === 'mjs' || ext === 'cjs') {
      // Убираем только явно опасные конструкции. Обычные eval/atob и старые
      // движки не трогаем — иначе игра перестанет работать.
      out = out
        .replace(/eval\s*\(\s*(?:window\.)?atob\s*\([^)]*\)\s*\)/g, 'void 0')
        .replace(/document\.write\s*\(\s*unescape\s*\([^)]*\)\s*\)/g, 'void 0');
      out = out.replace(/[\u202A-\u202E\u2066-\u2069]/g, '');
    } else if (ext === 'css' || ext === 'json' || ext === 'svg') {
      out = out.replace(/[\u202A-\u202E\u2066-\u2069]/g, '');
    } else {
      out = out.replace(/[\u202A-\u202E\u2066-\u2069]/g, '');
    }
    return out;
  }

  // Проверяет весь набор файлов игры.
  function sanitizeBundle(files) {
    const list = Array.isArray(files) ? files : [];
    const kept = [];
    const blocked = [];
    const stripped = [];
    let totalBefore = 0;
    let totalAfter = 0;

    for (const file of list) {
      const size = Math.max(0, Number(file && file.size) || 0);
      totalBefore += size;
      const verdict = judgeFile(file);
      if (verdict.action === 'block') {
        blocked.push(verdict);
        continue;
      }
      if (verdict.action === 'strip') stripped.push(verdict);
      const finalSize = verdict.cleaned !== undefined
        ? new TextEncoder().encode(verdict.cleaned).length
        : size;
      totalAfter += finalSize;
      kept.push({ path: verdict.path, size: finalSize, sha256: file.sha256, verdict: verdict.action });
    }

    let finalVerdict = 'clean';
    if (blocked.some((b) => b.kind === 'malware' || b.kind === 'executable')) finalVerdict = 'danger';
    else if (blocked.length) finalVerdict = 'cleaned';

    return {
      files: kept,
      blocked,
      stripped,
      totalBefore,
      totalAfter,
      freedBytes: Math.max(0, totalBefore - totalAfter),
      verdict: finalVerdict,
      summary: {
        checked: list.length,
        kept: kept.length,
        blocked: blocked.length,
        stripped: stripped.length,
        malware: blocked.filter((b) => b.kind === 'malware').length,
        executables: blocked.filter((b) => b.kind === 'executable').length,
        junk: blocked.filter((b) => b.kind === 'junk').length,
      },
    };
  }

  // Предохранитель: игра не должна остаться без точки входа.
  function assertPlayable(files) {
    const hasEntry = (files || []).some((f) => /(^|\/)(index|play)\.html?$/i.test(f.path || ''));
    return {
      ok: hasEntry,
      reason: hasEntry ? '' : 'После очистки не осталось точки входа (index.html или play.html) — набор отклонён целиком',
    };
  }

  return {
    GAME_ASSET_EXT,
    HARD_BLOCK_EXT,
    SIGNATURES,
    extOf,
    isJunk,
    isGameAsset,
    inspectContent,
    judgeFile,
    cleanContent,
    sanitizeBundle,
    assertPlayable,
  };
});
