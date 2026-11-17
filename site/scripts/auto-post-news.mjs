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
import { readFile, writeFile } from 'node:fs/promises';
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
  const tags = (Array.isArray(raw.tags) && raw.tags.length ? raw.tags : [source.name])
    .map((t) => t.slice(0, 26))
    .slice(0, 4);

  return {
    id: `auto-${source.id}-${idHash}`,
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
    pinned: false,
    autoPosted: true,
  };
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
        pinned: false,
        autoPosted: true,
      };
    });
  } catch {
    return [];
  }
}

export function mergeNewsFeeds(existingItems, incomingItems, av) {
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
  for (const item of incomingItems) {
    const dedupeKey = `url:${normalizeUrl(item.sourceUrl) || item.id}`;
    const alreadyExists = byKey.has(dedupeKey) || existingItems.some((e) => e.id === item.id);
    if (!alreadyExists && pushSafe(item)) added++;
  }

  const all = [...byKey.values()];
  const pinned = all.filter((x) => x.pinned);
  const fresh = all
    .filter((x) => !x.pinned)
    .sort((a, b) => Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0));

  const keptFresh = fresh.slice(0, Math.max(0, MAX_FEED_ITEMS - pinned.length));
  const combined = [...pinned, ...keptFresh].sort(
    (a, b) => Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0)
  );

  return { items: combined, added };
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

  const { items, added } = mergeNewsFeeds(existing, incoming, av);
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
  };
  feed.items = items;

  console.log(
    `Auto-post finished: total=${items.length}, added=${added}, sourcesOk=${sourcesOk}/${RSS_SOURCES.length}, offline=${offline}, dryRun=${dryRun}`
  );

  if (!dryRun) {
    await writeFile(feedPath, `${JSON.stringify(feed, null, 2)}\n`, 'utf8');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
