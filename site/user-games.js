/* ==========================================================================
   Games — движок пользовательских игр (для всех без исключения).
   Позволяет каждому:
     1) Мгновенно добавить свою игру на витрину (по ссылке https://, из HTML-файла
        или из встроенного мини-редактора кода с безопасным sandbox-плеером);
     2) Поделиться игрой с друзьями ссылкой (?importGame=...) или .gamespack.json;
     3) В 1 клик подготовить пакет (JSON + cover.svg + README.md + предзаполненная
        форма GitHub) для публикации в общем каталоге для всех игроков мира.
   ========================================================================== */
(function () {
  'use strict';

  const STORAGE_KEY = 'games_user_catalog_v1';
  const MAX_USER_GAMES = 40;
  const MAX_HTML_CHARS = 750000; // ~750 КБ на встроенный HTML-файл

  const COVER_THEMES = {
    steam: { name: 'Steam Синий', c1: '#0f2537', c2: '#1b4965', c3: '#66c0f4', accent: '#a4d007' },
    cyber: { name: 'Неон Кибер', c1: '#140f2d', c2: '#2d1b69', c3: '#00e5ff', accent: '#ff4d9d' },
    emerald: { name: 'Изумруд', c1: '#0c241b', c2: '#194d3b', c3: '#52e09b', accent: '#ffd166' },
    crimson: { name: 'Багровый Экшен', c1: '#240c11', c2: '#5c1824', c3: '#ff5e6c', accent: '#ffb703' },
    amber: { name: 'Золото Стратегий', c1: '#241a0a', c2: '#523813', c3: '#f5b041', accent: '#72dfff' },
    slate: { name: 'Сталь 3D', c1: '#141923', c2: '#293548', c3: '#8ab4f8', accent: '#b7f36b' },
  };

  const CATEGORY_MAP = {
    '3d': { label: '3D', dim: '3D · Сообщество', cats: ['3d', 'user'] },
    '2d': { label: '2D', dim: '2D · Сообщество', cats: ['2d', 'user'] },
    survival: { label: 'Выживание', dim: 'Выживание', cats: ['survival', 'user'] },
    sim: { label: 'Симулятор', dim: 'Симулятор', cats: ['sim', 'user'] },
    strategy: { label: 'Стратегия', dim: 'Стратегия', cats: ['strategy', 'user'] },
    action: { label: 'Экшен', dim: 'Экшен', cats: ['action', 'user'] },
    tools: { label: 'Инструмент', dim: 'Инструмент', cats: ['tools', 'user'] },
  };

  const STARTER_MINI_GAME = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Космос — моя мини-игра</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0b1320;color:#eef6ff;font:600 15px/1.4 system-ui,sans-serif;overflow:hidden;user-select:none}
  canvas{display:block;width:100vw;height:100vh;cursor:crosshair}
  .hud{position:fixed;top:14px;left:14px;padding:8px 14px;border-radius:8px;background:rgba(15,25,38,.82);border:1px solid rgba(102,192,244,.35)}
</style>
</head>
<body>
<div class="hud">Очки: <span id="sc">0</span> · Кликай по звёздам!</div>
<canvas id="c"></canvas>
<script>
const c=document.getElementById('c'),x=c.getContext('2d'),sc=document.getElementById('sc');
let W=0,H=0,score=0,stars=[];
function resize(){W=c.width=innerWidth;H=c.height=innerHeight;}
addEventListener('resize',resize);resize();
function spawn(){stars.push({x:40+Math.random()*(W-80),y:40+Math.random()*(H-80),r:18+Math.random()*16,vx:(Math.random()-.5)*140,vy:(Math.random()-.5)*140,h:180+Math.random()*90});}
for(let i=0;i<7;i++)spawn();
c.addEventListener('pointerdown',e=>{
  for(let i=stars.length-1;i>=0;i--){
    const s=stars[i];
    if(Math.hypot(e.clientX-s.x,e.clientY-s.y)<=s.r+8){
      stars.splice(i,1);score+=10;sc.textContent=score;spawn();break;
    }
  }
});
let last=performance.now();
function loop(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  x.fillStyle='rgba(11,19,32,.32)';x.fillRect(0,0,W,H);
  for(const s of stars){
    s.x+=s.vx*dt;s.y+=s.vy*dt;
    if(s.x<s.r||s.x>W-s.r)s.vx*=-1;
    if(s.y<s.r||s.y>H-s.r)s.vy*=-1;
    x.beginPath();x.arc(s.x,s.y,s.r,0,Math.PI*2);
    x.fillStyle='hsl('+s.h+',85%,62%)';x.fill();
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
</script>
</body>
</html>`;

  const TRANSLIT = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
    и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
    с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
    ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };

  function cleanText(val, maxLen) {
    if (typeof val !== 'string') return '';
    return val.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, maxLen);
  }

  function slugify(title) {
    const raw = String(title || '').toLowerCase();
    let out = '';
    for (const ch of raw) {
      if (TRANSLIT[ch] !== undefined) out += TRANSLIT[ch];
      else if (/[a-z0-9]/.test(ch)) out += ch;
      else out += '-';
    }
    out = out.replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 44);
    if (!/^[a-z0-9]/.test(out)) out = 'game-' + out;
    if (out.length < 2) out = 'my-game-' + String(Date.now()).slice(-4);
    return out;
  }

  function escapeXml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function validatePlayUrl(raw) {
    const str = cleanText(raw, 400);
    if (!str) return null;
    try {
      const parsed = new URL(str);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        return parsed.href;
      }
      return null;
    } catch {
      return null;
    }
  }

  function generateCoverSvg(opts) {
    const theme = COVER_THEMES[opts.theme] || COVER_THEMES.steam;
    const title = escapeXml(cleanText(opts.title || 'Моя игра', 34));
    const sub = escapeXml(cleanText(opts.subtitle || 'Браузерная игра сообщества', 54));
    const author = escapeXml(cleanText(opts.author || 'Автор сообщества', 28));
    const icon = escapeXml(cleanText(opts.icon || '🎮', 4));
    const catInfo = CATEGORY_MAP[opts.category] || CATEGORY_MAP['2d'];
    const badge = escapeXml(catInfo.label.toUpperCase());

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.c1}"/>
      <stop offset="55%" stop-color="${theme.c2}"/>
      <stop offset="100%" stop-color="#0b111a"/>
    </linearGradient>
    <radialGradient id="glow" cx="76%" cy="28%" r="55%">
      <stop offset="0%" stop-color="${theme.c3}" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="${theme.c3}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <rect width="1280" height="720" fill="url(#glow)"/>
  <g opacity="0.14" stroke="${theme.c3}" stroke-width="1">
    <path d="M0 140H1280M0 280H1280M0 420H1280M0 560H1280"/>
    <path d="M180 0V720M360 0V720M540 0V720M720 0V720M900 0V720M1080 0V720"/>
  </g>
  <circle cx="980" cy="340" r="190" fill="${theme.c3}" opacity="0.10"/>
  <circle cx="980" cy="340" r="130" fill="none" stroke="${theme.c3}" stroke-width="3" opacity="0.45"/>
  <text x="980" y="378" text-anchor="middle" font-size="112" font-family="Segoe UI,system-ui,sans-serif">${icon}</text>
  <rect x="84" y="96" width="210" height="44" rx="8" fill="${theme.accent}" opacity="0.92"/>
  <text x="189" y="125" text-anchor="middle" font-size="20" font-weight="800" fill="#101808" font-family="Segoe UI,system-ui,sans-serif">${badge}</text>
  <text x="84" y="340" font-size="76" font-weight="800" fill="#f3f8fc" font-family="Segoe UI,system-ui,sans-serif">${title}</text>
  <text x="84" y="408" font-size="32" fill="#c7d5e0" font-family="Segoe UI,system-ui,sans-serif">${sub}</text>
  <rect x="84" y="540" width="380" height="62" rx="10" fill="rgba(11,17,26,0.72)" stroke="${theme.c3}" stroke-opacity="0.45"/>
  <text x="112" y="579" font-size="24" fill="${theme.c3}" font-family="Segoe UI,system-ui,sans-serif">Автор: ${author}</text>
</svg>`;
  }

  function svgToDataUri(svg) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function normalizeRecord(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const title = cleanText(raw.title, 80);
    const description = cleanText(raw.description, 320);
    if (!title || !description) return null;

    const sourceType = raw.sourceType === 'html' ? 'html' : 'url';
    let playUrl = '';
    let htmlCode = '';
    if (sourceType === 'url') {
      playUrl = validatePlayUrl(raw.playUrl);
      if (!playUrl) return null;
    } else {
      htmlCode = typeof raw.htmlCode === 'string' ? raw.htmlCode.slice(0, MAX_HTML_CHARS) : '';
      if (!htmlCode.trim()) return null;
    }

    const category = CATEGORY_MAP[raw.category] ? raw.category : '2d';
    const catInfo = CATEGORY_MAP[category];
    const slug = /^[a-z0-9][a-z0-9-]{1,47}$/.test(raw.slug || '') ? raw.slug : slugify(title);
    const id = typeof raw.id === 'string' && raw.id.startsWith('usr-')
      ? raw.id.slice(0, 52)
      : 'usr-' + slug;
    const author = cleanText(raw.author || 'Игрок сообщества', 40) || 'Игрок сообщества';
    const subtitle = cleanText(raw.subtitle || `${catInfo.label} · игра от ${author}`, 110);
    const version = cleanText(raw.version || 'v1.0', 20);
    const theme = COVER_THEMES[raw.theme] ? raw.theme : 'steam';
    const icon = cleanText(raw.icon || '🎮', 4) || '🎮';

    const features = (Array.isArray(raw.features) ? raw.features : [])
      .map((f) => cleanText(f, 80))
      .filter(Boolean)
      .slice(0, 4);
    if (!features.length) {
      features.push('Добавлено пользователем', 'Запуск в браузере', 'Бесплатно');
    }

    let customCoverData = '';
    if (typeof raw.customCoverData === 'string' && /^data:image\/(?:webp|jpeg|png);base64,/i.test(raw.customCoverData) && raw.customCoverData.length < 180000) {
      customCoverData = raw.customCoverData;
    }

    const svgText = generateCoverSvg({ title, subtitle, author, icon, theme, category });
    const coverSrc = customCoverData || svgToDataUri(svgText);

    return {
      id,
      slug,
      isUserGame: true,
      sourceType,
      playUrl,
      htmlCode,
      title,
      subtitle,
      description,
      author,
      version,
      category,
      categories: catInfo.cats.slice(),
      dim: catInfo.dim,
      badge: 'Сообщество',
      badgeTone: 'is-user',
      accent: (COVER_THEMES[theme] || COVER_THEMES.steam).c3,
      isNew: true,
      featuredRank: 50,
      theme,
      icon,
      customCoverData,
      coverSvg: svgText,
      cover: { src: coverSrc, alt: `Обложка пользовательской игры «${title}»` },
      play: sourceType === 'url' ? playUrl : '#play-user-' + id,
      info: '',
      features,
      controls: cleanText(raw.controls || 'Клавиатура / мышь / сенсор — зависит от игры', 140),
      addedAt: Number(raw.addedAt) || Date.now(),
      updateNote: `Добавил(а): ${author} · ${sourceType === 'html' ? 'встроенный HTML5-пакет' : 'веб-ссылка'}`,
    };
  }

  function loadAll() {
    try {
      const raw = window.localStorage && window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      const seen = new Set();
      return arr.map(normalizeRecord).filter((g) => {
        if (!g || seen.has(g.id)) return false;
        seen.add(g.id);
        return true;
      }).slice(0, MAX_USER_GAMES);
    } catch (err) {
      if (typeof console !== 'undefined' && console.debug) console.debug('user games load skipped', err);
      return [];
    }
  }

  function persistAll(games) {
    const compact = games.slice(0, MAX_USER_GAMES).map((g) => ({
      id: g.id,
      slug: g.slug,
      sourceType: g.sourceType,
      playUrl: g.playUrl,
      htmlCode: g.htmlCode,
      title: g.title,
      subtitle: g.subtitle,
      description: g.description,
      author: g.author,
      version: g.version,
      category: g.category,
      theme: g.theme,
      icon: g.icon,
      customCoverData: g.customCoverData,
      features: g.features,
      controls: g.controls,
      addedAt: g.addedAt,
    }));
    try {
      if (window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(compact));
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: 'Недостаточно места в памяти браузера (уменьшите размер HTML или обложки).', details: String(err) };
    }
  }

  function buildCommunityJsonEntry(game) {
    const slug = game.slug || slugify(game.title);
    return {
      id: slug,
      title: game.title,
      subtitle: game.subtitle,
      description: game.description,
      version: game.version || 'v1.0',
      cover: `../${slug}/cover.svg`,
      play: `../${slug}/index.html`,
      readme: `../${slug}/README.md`,
      features: (game.features || []).slice(0, 4),
    };
  }

  function buildReadmeMarkdown(game) {
    const slug = game.slug || slugify(game.title);
    const lines = [
      `# ${game.title}`,
      '',
      `> ${game.subtitle}`,
      '',
      game.description,
      '',
      `- **Автор:** ${game.author}`,
      `- **Версия:** ${game.version || 'v1.0'}`,
      `- **Папка в каталоге:** \`${slug}/\``,
      `- **Лицензия:** авторские права принадлежат создателю (${game.author}); публикация в витрине Games разрешена.`,
      '',
      '## Особенности',
      ...(game.features || []).map((f) => `- ${f}`),
      '',
      '## Управление',
      game.controls || 'Клавиатура, мышь или сенсорный экран.',
      '',
    ];
    return lines.join('\n');
  }

  function buildGitHubIssueUrl(game) {
    const entry = buildCommunityJsonEntry(game);
    const title = `[Игра] ${game.title}`;
    const bodyLines = [
      `### Название игры`,
      game.title,
      '',
      `### Автор`,
      game.author,
      '',
      `### Описание`,
      game.description,
      '',
      game.sourceType === 'url' ? `### Ссылка на игру\n${game.playUrl}\n` : `### Тип игры\nСамостоятельный HTML5-файл (готов к добавлению в папку \`${entry.id}/\`).\n`,
      `### Готовая запись для \`site/community-games.json\``,
      '```json',
      JSON.stringify(entry, null, 2),
      '```',
    ];
    const params = new URLSearchParams({
      template: 'game-submission.yml',
      title,
      body: bodyLines.join('\n'),
    });
    return `https://github.com/m98978672-boop/games/issues/new?${params.toString()}`;
  }

  function encodeShareLink(game) {
    if (game.sourceType !== 'url') return null;
    const payload = {
      title: game.title,
      subtitle: game.subtitle,
      description: game.description,
      author: game.author,
      category: game.category,
      playUrl: game.playUrl,
      features: game.features,
      theme: game.theme,
      icon: game.icon,
    };
    const json = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(json);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    const b64 = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const base = window.location.origin && window.location.origin !== 'null'
      ? window.location.origin + window.location.pathname
      : 'https://m98978672-boop.github.io/games/';
    return `${base}?importGame=${b64}`;
  }

  function decodeShareParam(param) {
    if (!param || param.length > 3500) return null;
    try {
      const b64 = param.replace(/-/g, '+').replace(/_/g, '/');
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const json = new TextDecoder().decode(bytes);
      const parsed = JSON.parse(json);
      return normalizeRecord({ ...parsed, sourceType: 'url' });
    } catch (err) {
      if (typeof console !== 'undefined' && console.debug) console.debug('share decode skipped', err);
      return null;
    }
  }

  function compressImageFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Не удалось прочитать картинку.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Файл не является корректным изображением.'));
        img.onload = () => {
          const w = 640;
          const h = 360;
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas недоступен.'));
            return;
          }
          const scale = Math.max(w / img.width, h / img.height);
          const sw = img.width * scale;
          const sh = img.height * scale;
          ctx.fillStyle = '#0f1922';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh);
          let dataUrl = canvas.toDataURL('image/webp', 0.8);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          }
          resolve(dataUrl);
        };
        img.src = String(reader.result || '');
      };
      reader.readAsDataURL(file);
    });
  }

  function triggerDownload(filename, content, mime) {
    const blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  let list = loadAll();
  const listeners = new Set();

  function emitChange() {
    for (const fn of listeners) {
      try {
        fn(list);
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug) console.debug('listener error', err);
      }
    }
  }

  const api = {
    COVER_THEMES,
    CATEGORY_MAP,
    STARTER_MINI_GAME,
    slugify,
    validatePlayUrl,
    generateCoverSvg,
    svgToDataUri,
    buildCommunityJsonEntry,
    buildReadmeMarkdown,
    buildGitHubIssueUrl,
    encodeShareLink,
    decodeShareParam,
    compressImageFile,
    triggerDownload,
    getAll() {
      return list.slice();
    },
    getById(id) {
      return list.find((g) => g.id === id) || null;
    },
    upsert(raw) {
      const normalized = normalizeRecord(raw);
      if (!normalized) {
        return { ok: false, error: 'Проверьте название, описание и корректный веб-адрес HTTPS или HTML-код игры.' };
      }
      const next = [normalized, ...list.filter((g) => g.id !== normalized.id)].slice(0, MAX_USER_GAMES);
      const saved = persistAll(next);
      if (!saved.ok) return saved;
      list = next;
      emitChange();
      return { ok: true, game: normalized };
    },
    remove(id) {
      const next = list.filter((g) => g.id !== id);
      if (next.length === list.length) return false;
      persistAll(next);
      list = next;
      emitChange();
      return true;
    },
    exportPack(games) {
      const arr = Array.isArray(games) ? games : list;
      return JSON.stringify({
        schema: 'games-user-pack/1',
        exportedAt: new Date().toISOString(),
        games: arr.map((g) => ({
          id: g.id,
          slug: g.slug,
          sourceType: g.sourceType,
          playUrl: g.playUrl,
          htmlCode: g.htmlCode,
          title: g.title,
          subtitle: g.subtitle,
          description: g.description,
          author: g.author,
          version: g.version,
          category: g.category,
          theme: g.theme,
          icon: g.icon,
          customCoverData: g.customCoverData,
          features: g.features,
          controls: g.controls,
        })),
      }, null, 2);
    },
    importPack(jsonText) {
      try {
        const parsed = JSON.parse(jsonText);
        const items = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.games) ? parsed.games : [parsed]);
        let added = 0;
        let next = list.slice();
        for (const item of items) {
          const rec = normalizeRecord(item);
          if (!rec) continue;
          next = [rec, ...next.filter((g) => g.id !== rec.id)].slice(0, MAX_USER_GAMES);
          added++;
        }
        if (!added) return { ok: false, error: 'В файле не найдено корректных игр.' };
        const saved = persistAll(next);
        if (!saved.ok) return saved;
        list = next;
        emitChange();
        return { ok: true, added };
      } catch (err) {
        return { ok: false, error: 'Не удалось прочитать JSON-пакет игры.', details: String(err) };
      }
    },
    onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };

  window.GamesUserHub = api;
})();
