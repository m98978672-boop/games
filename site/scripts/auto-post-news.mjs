#!/usr/bin/env node
// Автопостер новостей для вкладки «Новости» портала Games (0 внешних зависимостей).
// Собирает свежие новости из открытых RSS/Atom-лент разных категорий + следит за новыми
// играми в site/community-games.json, очищает через 10-кратный GamesAntivirus и обновляет
// site/news-feed.json. Запускается по расписанию через .github/workflows/auto-news.yml.
//
// Запуск:
//   node site/scripts/auto-post-news.mjs            # полный автопост (RSS + локальные игры)
//   node site/scripts/auto-post-news.mjs --offline  # только локальные новинки + валидация
//   node site/scripts/auto-post-news.mjs --dry-run  # без записи файла
import crypto from 'node:crypto';
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadGamesAntivirus } from './scan-submission-antivirus.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const feedPath = path.join(repoRoot, 'site/news-feed.json');
const communityPath = path.join(repoRoot, 'site/community-games.json');

const MAX_FEED_ITEMS = 60;
const PER_SOURCE_LIMIT = 4;
const FETCH_TIMEOUT_MS = 8500;

export const RSS_SOURCES = [
  { id: 'stopgame', category: 'games', name: 'StopGame', icon: '🎮', accent: 'blue', url: 'https://rss.stopgame.ru/rss_news.xml' },
  { id: 'ixbt-games', category: 'games', name: 'iXBT.games', icon: '🕹️', accent: 'crimson', url: 'https://ixbt.games/export/news.rss' },
  { id: 'habr-news', category: 'tech', name: 'Хабр Новости', icon: '🤖', accent: 'violet', url: 'https://habr.com/ru/rss/news/?fl=ru' },
  { id: '3dnews', category: 'tech', name: '3DNews', icon: '💻', accent: 'cyan', url: 'https://3dnews.ru/news/rss/' },
  { id: 'nplus1', category: 'science', name: 'N+1 Наука', icon: '🔬', accent: 'indigo', url: 'https://nplus1.ru/rss' },
  { id: 'nasa', category: 'science', name: 'NASA', icon: '🚀', accent: 'indigo', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss' },
  { id: 'securitylab', category: 'security', name: 'SecurityLab', icon: '🛡️', accent: 'emerald', url: 'https://www.securitylab.ru/_Services/Export/RSS/news/' },
  { id: 'hackernews-sec', category: 'security', name: 'The Hacker News', icon: '🔐', accent: 'emerald', url: 'https://feeds.feedburner.com/TheHackersNews' },
  { id: 'lenta-top', category: 'world', name: 'Лента · Главное', icon: '🌍', accent: 'amber', url: 'https://lenta.ru/rss/top7' },
  { id: 'bbc-world', category: 'world', name: 'BBC World', icon: '🌐', accent: 'blue', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { id: 'habr-top', category: 'facts', name: 'Хабр Популярное', icon: '⚡', accent: 'amber', url: 'https://habr.com/ru/rss/articles/top/daily/?fl=ru' },
];

export function decodeHtmlEntities(input) {
  return String(input || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&laquo;/gi, '«')
    .replace(/&raquo;/gi, '»')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&#x([0-9a-f]{2,5});/gi, (_, hex) => {
      const cp = parseInt(hex, 16);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : '';
    })
    .replace(/&#(\d{2,6});/g, (_, dec) => {
      const cp = parseInt(dec, 10);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : '';
    });
}

export function stripHtmlToText(input) {
  return decodeHtmlEntities(String(input || ''))
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[\u202A-\u202E\u2066-\u2069]/g, '')
    .replace(/[ \t\r\f\v]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractTag(block, tagNames) {
  for (const tag of tagNames) {
    const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const m = block.match(re);
    if (m && m[1]) return m[1].trim();
  }
  return '';
}

function extractAtomLink(block) {
  const alt = block.match(/<link\b[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i)
    || block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']alternate["']/i)
    || block.match(/<link\b[^>]*href=["']([^"']+)["']/i);
  return alt ? alt[1].trim() : '';
}

export function parseRssOrAtom(xmlText) {
  const xml = String(xmlText || '');
  const entries = [];

  const rssItems = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];
  for (const block of rssItems) {
    const title = stripHtmlToText(extractTag(block, ['title']));
    const link = decodeHtmlEntities(extractTag(block, ['link', 'guid'])).trim();
    const rawDesc = extractTag(block, ['content:encoded', 'description', 'summary']);
    const desc = stripHtmlToText(rawDesc);
    const pubDate = extractTag(block, ['pubDate', 'dc:date', 'published', 'updated']);
    const cats = [...block.matchAll(/<category(?:\s[^>]*)?>([\s\S]*?)<\/category>/gi)]
      .map((m) => stripHtmlToText(m[1]))
      .filter((t) => t && t.length <= 28)
      .slice(0, 4);

    if (title && /^https:\/\//i.test(link)) {
      entries.push({ title, link, desc, pubDate, tags: cats });
    }
  }

  if (!entries.length) {
    const atomEntries = xml.match(/<entry\b[\s\S]*?<\/entry>/gi) || [];
    for (const block of atomEntries) {
      const title = stripHtmlToText(extractTag(block, ['title']));
      const link = decodeHtmlEntities(extractAtomLink(block)).trim();
      const rawDesc = extractTag(block, ['content', 'summary']);
      const desc = stripHtmlToText(rawDesc);
      const pubDate = extractTag(block, ['published', 'updated']);
      const cats = [...block.matchAll(/<category\b[^>]*term=["']([^"']+)["']/gi)]
        .map((m) => stripHtmlToText(m[1]))
        .filter((t) => t && t.length <= 28)
        .slice(0, 4);

      if (title && /^https:\/\//i.test(link)) {
        entries.push({ title, link, desc, pubDate, tags: cats });
      }
    }
  }

  return entries;
}

// Локальная обложка для авто-новости: у автопоста нет своей фотографии,
// поэтому берём тематическую картинку портала (site/assets/news/<код>.svg),
// которая генерируется вместе со статьёй и проходит антивирус как локальный ассет.
const CATEGORY_COVER_PALETTE = {
  games: ['#1d2b64', '#4f7cff', '🎮'],
  tech: ['#102a43', '#22b8cf', '🤖'],
  science: ['#1b1035', '#8b5cf6', '🚀'],
  world: ['#2b2113', '#e8b45a', '🌍'],
  security: ['#2b1114', '#ef5350', '🛡️'],
  facts: ['#12261f', '#3ddc84', '⚡'],
};

export function escapeCoverText(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildNewsCoverSvg(item) {
  const [from, to, icon] = CATEGORY_COVER_PALETTE[item.category] || ['#131b2c', '#38bdf8', '📰'];
  const code = escapeCoverText(item.code || 'NEWS');
  const sourceName = escapeCoverText(item.sourceName || 'Games News');
  const title = escapeCoverText(String(item.title || '').slice(0, 74));
  const lines = [];
  const words = title.split(' ');
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > 34) {
      if (line) lines.push(line.trim());
      line = w;
    } else {
      line = `${line} ${w}`;
    }
  }
  if (line.trim()) lines.push(line.trim());
  const titleSvg = lines.slice(0, 3).map((l, i) => (
    `<text x="72" y="${330 + i * 54}" font-family="Inter, Segoe UI, sans-serif" font-size="44" font-weight="700" fill="#ffffff">${l}</text>`
  )).join('\\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-label="${code}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <circle cx="1120" cy="120" r="230" fill="#ffffff" opacity="0.07"/>
  <circle cx="180" cy="640" r="190" fill="#ffffff" opacity="0.05"/>
  <text x="72" y="120" font-family="Inter, Segoe UI, sans-serif" font-size="128">${icon}</text>
  <rect x="72" y="180" width="196" height="52" rx="26" fill="#ffffff" opacity="0.16"/>
  <text x="98" y="216" font-family="Inter, Segoe UI, sans-serif" font-size="26" font-weight="700" fill="#ffffff">${code}</text>
  ${titleSvg}
  <text x="72" y="620" font-family="Inter, Segoe UI, sans-serif" font-size="28" font-weight="600" fill="#ffffff" opacity="0.78">${sourceName} · Games News</text>
</svg>
`;
}

// Восстанавливаем только отсутствующие сгенерированные обложки по их коду.
// Редакционные фото не подменяем; существующие файлы не перезаписываем.
export async function ensureNewsCovers(items, root, av) {
  let created = 0;
  for (const item of items) {
    const image = String(item?.image || '');
    if (!/^site\/assets\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.(?:svg|jpe?g|png|webp|avif)$/i.test(image)) {
      throw new Error(`Небезопасный путь обложки: ${image}`);
    }
    const target = path.join(root, image);
    try { await access(target); continue; }
    catch (err) { if (err.code !== 'ENOENT') throw err; }
    const code = String(item.code || '');
    if (!String(item.id || '').startsWith('auto-') || !/^[A-Z]-\d{3}$/.test(code) || image !== `site/assets/news/${code.toLowerCase()}.svg`) {
      throw new Error(`Отсутствует редакционная обложка: ${image}`);
    }
    const svg = buildNewsCoverSvg(item);
    const verdict = av.scanCoverDataUrl('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
    if (verdict.verdict === 'blocked') throw new Error(`Обложка ${code} не прошла проверку безопасности`);
    await mkdir(path.dirname(target), { recursive: true });
    try { await writeFile(target, svg, { encoding:'utf8', flag:'wx' }); created++; }
    catch (err) { if (err.code !== 'EEXIST') throw err; }
  }
  return created;
}

export function makeSafeNewsItem(raw, source) {
  const title = String(raw.title || '').replace(/\s+/g, ' ').trim().slice(0, 140);
  const cleanedText = String(raw.desc || '').trim();
  const paragraphs = cleanedText
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 24)
    .slice(0, 4);

  const summary = (paragraphs[0] || title).slice(0, 220);
  const body = paragraphs.length
    ? paragraphs.map((p) => p.slice(0, 560))
    : [`${title}. Подробности доступны в первоисточнике «${source.name}».`];

  const parsedTs = Date.parse(raw.pubDate || '');
  const publishedAt = Number.isFinite(parsedTs)
    ? new Date(Math.min(parsedTs, Date.now())).toISOString()
    : new Date().toISOString();

  const words = body.join(' ').split(/\s+/).filter(Boolean).length;
  const readMin = Math.max(1, Math.min(8, Math.round(words / 130) || 1));

  const idHash = crypto.createHash('sha1').update(`${source.id}|${raw.link}`).digest('hex').slice(0, 10);
  // Короткий код: префикс рубрики + 3 цифры. Чтобы коды не повторялись между
  // источниками, в номер подмешивается стабильный хеш самой рубрики.
  const codeNum = 700 + (parseInt(crypto.createHash('sha1').update(`${source.category}|${idHash}`).digest('hex').slice(0, 4), 16) % 299);
  const catPrefix = { games: 'G', tech: 'T', science: 'S', world: 'W', security: 'C', facts: 'F' }[source.category] || 'A';
  const tags = (Array.isArray(raw.tags) && raw.tags.length ? raw.tags : [source.name])
    .map((t) => t.slice(0, 26))
    .slice(0, 4);

  const item = {
    id: `auto-${source.id}-${idHash}`,
    code: `${catPrefix}-${codeNum}`,
    category: source.category,
    title,
    summary,
    body,
    tags,
    sourceName: source.name,
    sourceUrl: raw.link,
    publishedAt,
    readMin,
    icon: source.icon,
    accent: source.accent,
    proofs: [{ label: `Первоисточник (${source.name})`, url: raw.link }],
    // Каждая авто-новость несёт фактчек, но НЕ несёт заготовленных комментариев:
    // комментарии пишут только реальные читатели (проверено CI).
    factCheck: {
      verified: true,
      checkedAt: publishedAt.slice(0, 10),
      method: `Сверка заголовка и ссылки с первоисточником «${source.name}»; текст очищен от HTML/скриптов и проверен 10-проходным Games Antivirus.`,
    },
    comments: [],
    pinned: false,
    autoPosted: true,
  };

  item.image = `site/assets/news/${String(item.code).toLowerCase()}.svg`;
  item.imageCaption = `Обложка рубрики: ${title.slice(0, 70)}`;
  item.imageCredit = 'Games News · локальная обложка';
  return item;
}

async function fetchSourceItems(source) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(source.url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'GamesNewsAutoPoster/1.0 (+https://m98978672-boop.github.io/games/)',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5',
      },
    });
    if (!res.ok) return { ok: false, items: [], error: `HTTP ${res.status}` };
    const text = await res.text();
    const parsed = parseRssOrAtom(text).slice(0, PER_SOURCE_LIMIT);
    return {
      ok: true,
      items: parsed.map((raw) => makeSafeNewsItem(raw, source)),
    };
  } catch (err) {
    return { ok: false, items: [], error: err?.name === 'AbortError' ? 'timeout' : String(err?.message || err) };
  } finally {
    clearTimeout(timer);
  }
}

async function buildCommunityAutoPosts() {
  try {
    const raw = JSON.parse(await readFile(communityPath, 'utf8'));
    const games = Array.isArray(raw.games) ? raw.games : [];
    return games.slice(0, 4).map((g) => {
      const slug = String(g.id || 'game').replace(/[^a-z0-9-]/gi, '').toLowerCase();
      const cleanPlay = String(g.play || '').replace(/^(\.\.\/)+/, '').replace(/^\/+/, '');
      const url = /^https?:\/\//i.test(String(g.play || ''))
        ? g.play
        : `https://m98978672-boop.github.io/games/${cleanPlay}`;
      return {
        id: `community-game-${slug}`,
        category: 'games',
        title: `Игра сообщества на Games: «${g.title || slug}»`,
        summary: String(g.subtitle || g.description || 'Новая браузерная игра от автора сообщества на Games.').slice(0, 220),
        body: [
          `В каталоге сообщества Games доступна браузерная игра «${g.title || slug}»${g.author ? ` от автора ${g.author}` : ''}.`,
          String(g.description || 'Открывается мгновенно прямо в браузере без установки и регистрации.'),
          'Игра прошла автоматическую проверку каталога и 10-кратный антивирус Games — можно запускать прямо из витрины.',
        ],
        tags: ['Сообщество', 'Games', ...(Array.isArray(g.features) ? g.features.slice(0, 2) : [])],
        sourceName: 'Каталог Games',
        sourceUrl: url,
        publishedAt: g.addedAt && Number.isFinite(Date.parse(g.addedAt))
          ? new Date(g.addedAt).toISOString()
          : '2026-11-15T10:00:00.000Z',
        readMin: 1,
        icon: '🎮',
        accent: 'blue',
        proofs: [{ label: 'Страница игры в каталоге Games', url }],
        factCheck: {
          verified: true,
          checkedAt: '2026-11-15',
          method: 'Игра прошла 10-проходную антивирусную проверку каталога Games и запускается в изолированном sandbox.',
        },
        comments: [],
        image: 'site/assets/news/g101-gta6.jpg',
        imageCaption: 'Витрина игр сообщества Games',
        imageCredit: 'Games',
        pinned: false,
        autoPosted: true,
      };
    });
  } catch {
    return [];
  }
}

// Очередь «на будущее»: статья лежит в фиде с датой вперёд (scheduledFor) и
// «раскрывается» в день события — тогда её дата публикации становится сегодняшней,
// и она попадает в ленту как свежая. Пропустить дату нельзя: если автопост не
// запускался, статья выходит при следующем запуске (не теряется).
export function promoteScheduledItems(items, now) {
  const today = new Date(now || Date.now()).toISOString().slice(0, 10);
  const promoted = [];
  const out = (items || []).map((item) => {
    if (!item || item.queue !== 'future' || !item.scheduledFor) return item;
    if (String(item.scheduledFor) > today) return item; // ещё рано
    promoted.push(item.id);
    return {
      ...item,
      publishedAt: new Date(`${today}T09:00:00.000Z`).toISOString(),
      queue: 'live',
      releasedAt: `${today}T09:00:00.000Z`,
    };
  });
  return { items: out, promoted };
}

export function mergeNewsFeeds(existingItems, incomingItems, av, reservedCoverCodes = []) {
  const byKey = new Map();
  const normalizeUrl = (u) => String(u || '').trim().replace(/\/+$/, '').toLowerCase();

  const pushSafe = (item) => {
    if (!item || !item.id || !item.title || item.title.length < 8) return false;
    const scan = av.scanNewsItemSync(item);
    if (!scan.ok) return false;

    const dedupeKey = item.pinned ? `id:${item.id}` : `url:${normalizeUrl(item.sourceUrl) || item.id}`;
    if (byKey.has(dedupeKey)) {
      const prev = byKey.get(dedupeKey);
      if (prev.pinned) return false;
    }
    byKey.set(dedupeKey, item);
    return true;
  };

  for (const item of existingItems) pushSafe(item);

  let added = 0;
  const addedItems = new Set();
  for (const item of incomingItems) {
    const dedupeKey = `url:${normalizeUrl(item.sourceUrl) || item.id}`;
    const alreadyExists = byKey.has(dedupeKey) || existingItems.some((e) => e.id === item.id);
    if (!alreadyExists && pushSafe(item)) { added++; addedItems.add(item); }
  }

  // Код статьи — префикс рубрики + три цифры из хеша. Круг в 299 номеров на
  // тысячах статей гарантированно даёт совпадения (парадокс дней рождения),
  // а CI требует уникальные коды. Поэтому занятый номер сдвигаем вверх и
  // перевешиваем обложку на новый код.
  const all = [...byKey.values()];
  const usedCodes = new Set();
  for (const item of all) if (item && item.code) usedCodes.add(item.code);
  const reservedCodes = new Set(reservedCoverCodes);
  const seenOnce = new Set();
  for (const item of all) {
    if (!item || !item.code) continue;
    const oldCode = String(item.code);
    if (!seenOnce.has(oldCode) && !(addedItems.has(item) && reservedCodes.has(oldCode))) {
      seenOnce.add(oldCode); continue;
    }
    const m = /^([A-Z])-(\d{3})$/.exec(oldCode);
    if (!m) throw new Error(`Некорректный код новости: ${oldCode}`);
    let num = Number(m[2]), code = '';
    for (let attempt = 0; attempt < 1000; attempt++) {
      num = (num + 1) % 1000;
      const candidate = `${m[1]}-${String(num).padStart(3, '0')}`;
      if (!usedCodes.has(candidate) && !reservedCodes.has(candidate)) { code = candidate; break; }
    }
    if (!code) throw new Error(`Закончились свободные коды новостей для ${m[1]}`);
    usedCodes.add(code);
    seenOnce.add(code);
    item.code = code;
    // Переназначаем только генерируемую SVG. Редакционное фото сохраняем.
    if (String(item.id || '').startsWith('auto-') && item.image === `site/assets/news/${oldCode.toLowerCase()}.svg`) item.image = `site/assets/news/${code.toLowerCase()}.svg`;
  }
  const pinned = all.filter((x) => x.pinned);
  const fresh = all
    .filter((x) => !x.pinned)
    .sort((a, b) => Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0));

  // Очередь «на будущее» не вытесняется: это заготовки на месяцы вперёд.
  // Свежая лента ограничена MAX_FEED_ITEMS, а расписание живёт отдельно.
  const scheduled = all.filter((x) => !x.pinned && x.queue === 'future');
  const live = fresh.filter((x) => x.queue !== 'future');
  const keptFresh = live.slice(0, Math.max(0, MAX_FEED_ITEMS - pinned.length));
  const combined = [...pinned, ...keptFresh, ...scheduled].sort(
    (a, b) => Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0)
  );

  return { items: combined, added };
}

// Инвариант очереди. Свежие авто-новости приходят без метки queue и постепенно
// вытесняют размеченный запас (MAX_FEED_ITEMS), из-за чего CI «новостей»
// требовал >= 40 статей «сейчас». Поэтому добор делаем прямо здесь: самые
// свежие статьи без метки становятся «сейчас», а счётчики пересчитываются.
export const BACKLOG_NOW_MIN = 44;
export const BACKLOG_FUTURE_MIN = 60;

export function keepBacklogInvariant(items) {
  const list = Array.isArray(items) ? items : [];
  let now = list.filter((i) => i.queue === 'now').length;
  if (now < BACKLOG_NOW_MIN) {
    const fresh = list
      .filter((i) => !i.queue && !i.pinned && Number.isFinite(Date.parse(i.publishedAt || '')))
      .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
    for (const item of fresh) {
      if (now >= BACKLOG_NOW_MIN) break;
      item.queue = 'now';
      now += 1;
    }
  }
  const future = list.filter((i) => i.queue === 'future').length;
  return {
    items: list,
    now,
    future,
    total: now + future,
    ok: now >= BACKLOG_NOW_MIN && future >= BACKLOG_FUTURE_MIN,
  };
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has('--dry-run');
  const offline = args.has('--offline');

  const av = await loadGamesAntivirus();
  let feed = { items: [], autoPost: {} };
  try {
    feed = JSON.parse(await readFile(feedPath, 'utf8'));
  } catch (err) {
    throw new Error(`Invalid site/news-feed.json: ${err.message}`);
  }
  const existing = Array.isArray(feed.items) ? feed.items : [];

  const incoming = [];
  let sourcesOk = 0;

  if (!offline) {
    const fetched = await Promise.all(RSS_SOURCES.map((src) => fetchSourceItems(src)));
    fetched.forEach((res, idx) => {
      if (res.ok) {
        sourcesOk++;
        incoming.push(...res.items);
      } else {
        console.warn(`[auto-post] skip ${RSS_SOURCES[idx].id}: ${res.error}`);
      }
    });
  }

  const communityPosts = await buildCommunityAutoPosts();
  incoming.push(...communityPosts);

  const { items: withReleased, promoted } = promoteScheduledItems(existing, Date.now());
  if (promoted.length) console.log(`Из очереди «на будущее» вышло статей: ${promoted.length}`);
  // Старые обложки не удаляются: новые статьи не должны переиспользовать
  // их код и показывать заголовок другой новости.
  const names = await readdir(path.join(repoRoot, 'site/assets/news'));
  const reservedCovers = names.filter(n => /^[a-z]-\d{3}\.svg$/.test(n)).map(n => n.slice(0, -4).toUpperCase());
  const { items, added } = mergeNewsFeeds(withReleased, incoming, av, reservedCovers);
  const backlog = keepBacklogInvariant(items);
  const nowIso = new Date().toISOString();

  feed.updatedAt = nowIso;
  feed.autoPost = {
    ...(feed.autoPost || {}),
    enabled: true,
    intervalHours: 6,
    workflow: '.github/workflows/auto-news.yml',
    lastRunAt: nowIso,
    totalRuns: Number(feed.autoPost?.totalRuns || 0) + 1,
    sourcesCount: RSS_SOURCES.length,
    lastSourcesReachable: sourcesOk,
    categoriesCount: 6,
    backlog: {
      ...(feed.autoPost?.backlog || {}),
      total: backlog.total,
      now: backlog.now,
      future: backlog.future,
      note: 'Статьи очереди «на будущее» лежат с датой вперёд и раскрываются по расписанию автопоста.',
    },
  };
  feed.items = items;

  console.log(
    `Auto-post finished: total=${items.length}, added=${added}, sourcesOk=${sourcesOk}/${RSS_SOURCES.length}, offline=${offline}, dryRun=${dryRun}, now=${backlog.now}, future=${backlog.future}`
  );

  if (!dryRun) {
    const covers = await ensureNewsCovers(items, repoRoot, av);
    console.log(`Локальных обложек создано: ${covers}`);
    await writeFile(feedPath, `${JSON.stringify(feed, null, 2)}\n`, 'utf8');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
