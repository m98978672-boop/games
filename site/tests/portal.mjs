import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { renderRootIndex } from '../sync-root.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// 1. Синхронность site/index.html и корневого index.html
const siteHtml = await readFile(path.join(repositoryRoot, 'site/index.html'), 'utf8');
const rootHtml = await readFile(path.join(repositoryRoot, 'index.html'), 'utf8');
assert.equal(rootHtml, renderRootIndex(siteHtml), 'root index.html must stay in sync with site/index.html (run: node site/sync-root.mjs)');

// 2. Валидация site/games-data.js и всех локальных путей
const dataCode = await readFile(path.join(repositoryRoot, 'site/games-data.js'), 'utf8');
const sandbox = { window: {} };
sandbox.globalThis = sandbox;
vm.runInNewContext(dataCode, sandbox);

const catalog = sandbox.window.GAMES_CATALOG;
const categories = sandbox.window.GAMES_CATEGORIES;
const spotlightIds = sandbox.window.GAMES_SPOTLIGHT_IDS;

assert.ok(Array.isArray(catalog) && catalog.length >= 15, 'catalog must contain all showcase games');
assert.ok(Array.isArray(categories) && categories.some((c) => c.id === 'all'), 'categories must include all');
assert.ok(Array.isArray(spotlightIds) && spotlightIds.length >= 3, 'spotlight must list flagship games');

const seenIds = new Set();
for (const game of catalog) {
  assert.match(game.id, /^[a-z0-9][a-z0-9-]{1,47}$/, `invalid id: ${game.id}`);
  assert.ok(!seenIds.has(game.id), `duplicate catalog id: ${game.id}`);
  seenIds.add(game.id);
  assert.ok(game.title && game.subtitle && game.description, `${game.id} missing core metadata`);
  assert.ok(Array.isArray(game.features) && game.features.length >= 3, `${game.id} needs features`);

  const filesToCheck = [
    game.play,
    game.info,
    game.cover?.src,
    game.cover?.webp,
    ...(game.extraLinks || []).map((l) => l.href),
  ].filter(Boolean);

  for (const rel of filesToCheck) {
    assert.ok(!/^https?:\/\//i.test(rel), `${game.id} must use local asset/link path: ${rel}`);
    const abs = path.resolve(repositoryRoot, rel);
    assert.ok(abs.startsWith(`${repositoryRoot}${path.sep}`), `path escapes repo: ${rel}`);
    await access(abs);
  }
}

for (const id of spotlightIds) {
  assert.ok(seenIds.has(id), `spotlight id missing from catalog: ${id}`);
}

// 3. Проверка ключевых элементов UI и отсутствия неинициализированных CSS-переменных
const css = await readFile(path.join(repositoryRoot, 'site/site.css'), 'utf8');
for (const token of ['--mono', '--green', '--cyan', '--accent', '--bg', '--ink']) {
  assert.ok(css.includes(`${token}:`), `site.css must define ${token}`);
}
for (const id of [
  'hero-spotlight',
  'new-releases-grid',
  'catalog-search',
  'category-pills',
  'catalog-grid',
  'game-modal',
  'add-game-modal',
  'sandbox-player-modal',
  'save-hub-modal',
  'user-games-grid',
  'av-panel',
  'av-pass-list',
  'av-partners-grid',
]) {
  assert.ok(siteHtml.includes(`id="${id}"`), `site/index.html must contain #${id}`);
  assert.ok(rootHtml.includes(`id="${id}"`), `index.html must contain #${id}`);
}

// 4. Проверка 10-кратного антивируса (site/game-antivirus.js) и движка пользовательских игр (site/user-games.js)
const avCode = await readFile(path.join(repositoryRoot, 'site/game-antivirus.js'), 'utf8');
const userCode = await readFile(path.join(repositoryRoot, 'site/user-games.js'), 'utf8');
const memStore = new Map();
const userSandbox = {
  window: {
    localStorage: {
      getItem: (k) => (memStore.has(k) ? memStore.get(k) : null),
      setItem: (k, v) => memStore.set(k, String(v)),
      removeItem: (k) => memStore.delete(k),
    },
    location: { origin: 'https://m98978672-boop.github.io', pathname: '/games/' },
  },
  URL,
  URLSearchParams,
  TextEncoder,
  TextDecoder,
  Uint8Array,
  Uint32Array,
  DataView,
  btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
  atob: (s) => Buffer.from(s, 'base64').toString('binary'),
  Date,
};
userSandbox.globalThis = userSandbox;
vm.runInNewContext(avCode, userSandbox);
vm.runInNewContext(userCode, userSandbox);

const av = userSandbox.window.GamesAntivirus;
const hub = userSandbox.window.GamesUserHub;
assert.ok(av, 'GamesAntivirus must initialize');
assert.ok(hub, 'GamesUserHub must initialize');

// 4а. Проверка точности встроенного SHA-256 против node:crypto
const sampleStr = 'games-antivirus-sha256-vector-2026';
assert.equal(
  av.sha256HexSync(sampleStr),
  crypto.createHash('sha256').update(sampleStr, 'utf8').digest('hex'),
  'built-in SHA-256 must match FIPS 180-4 bit-for-bit'
);

// 4б. Проверка всех 10 проходов на чистых играх
const cleanHtmlReport = av.scanGameSync({ title: 'Чистая игра', sourceType: 'html', htmlCode: hub.STARTER_MINI_GAME });
assert.equal(cleanHtmlReport.passCount, 10, 'antivirus must execute all 10 passes');
assert.equal(cleanHtmlReport.verdict, 'clean', 'starter mini-game must pass all 10 passes cleanly');
assert.equal(cleanHtmlReport.riskScore, 0);

const cleanUrlReport = av.scanGameSync({ title: 'GitHub Game', sourceType: 'url', playUrl: 'https://alice.github.io/space-game/' });
assert.equal(cleanUrlReport.passCount, 10);
assert.equal(cleanUrlReport.verdict, 'clean', 'trusted github.io game must pass cleanly');
assert.equal(cleanUrlReport.trustedHost, true);
assert.ok(cleanUrlReport.partnerLinks.some((p) => p.id === 'virustotal'), 'must link to VirusTotal');
assert.ok(cleanUrlReport.partnerLinks.some((p) => p.id === 'google-safe-browsing'), 'must link to Google Safe Browsing');
assert.ok(cleanUrlReport.partnerLinks.some((p) => p.id === 'urlhaus'), 'must link to URLhaus');
assert.ok(cleanUrlReport.partnerLinks.some((p) => p.id === 'clamav-ci'), 'must link to ClamAV CI');

// 4в. Проверка перехвата угроз всеми детекторами (майнер, куки, обфускация, склейка строк на 10-м проходе, скрытый iframe, Trojan Source, polyglot, popup-бомба, сокращатель URL)
const threatVectors = [
  { name: 'URL shortener', game: { sourceType: 'url', playUrl: 'https://bit.ly/free-game' } },
  { name: 'Raw IP URL', game: { sourceType: 'url', playUrl: 'https://192.168.1.50/game.html' } },
  { name: 'Crypto miner', game: { sourceType: 'html', htmlCode: '<script>const m = new CoinHive.Anonymous("k");</script>' } },
  { name: 'Cookie theft', game: { sourceType: 'html', htmlCode: '<script>const c = document.cookie;</script>' } },
  { name: 'Hidden iframe', game: { sourceType: 'html', htmlCode: '<iframe style="display:none" src="x"></iframe>' } },
  { name: 'Dynamic code exec', game: { sourceType: 'html', htmlCode: '<script>ev' + 'al("1+1")</script>' } },
  { name: 'Pass-10 concat bypass', game: { sourceType: 'html', htmlCode: '<script>window["ev"+"al"]("x"); "ev"+"al"("1");</script>' } },
  { name: 'Trojan Source BiDi', game: { sourceType: 'html', htmlCode: '<script>// \u202E hidden bidi</script>' } },
  { name: 'Polyglot MZ header', game: { sourceType: 'html', htmlCode: 'MZ\x90\x00binary-exe-masquerade' } },
  { name: 'Popup bomb', game: { sourceType: 'html', htmlCode: '<script>for(let i=0;i<99;i++){window.open("x");}</script>' } },
];
for (const tv of threatVectors) {
  const rep = av.scanGameSync(tv.game);
  assert.equal(rep.passCount, 10, `${tv.name}: must run all 10 passes`);
  assert.equal(rep.verdict, 'blocked', `${tv.name}: must be blocked by antivirus`);
}

// 4г. Проверка блокировки заражённой игры прямо внутри GamesUserHub.upsert() и importPack()
const blockedUpsert = hub.upsert({
  title: 'Троян',
  author: 'BadActor',
  description: 'Вредоносный код',
  sourceType: 'html',
  htmlCode: '<script>const steal = document.cookie;</script>',
});
assert.equal(blockedUpsert.ok, false, 'GamesUserHub must reject blocked malware game');
assert.equal(blockedUpsert.blocked, true);

const blockedPack = hub.importPack(JSON.stringify({
  games: [{ title: 'BadPack', description: 'Bad', sourceType: 'html', htmlCode: '<script>new CoinHive.Anonymous("x")</script>' }],
}));
assert.equal(blockedPack.ok, false, 'importPack must reject malicious pack');
assert.equal(blockedPack.blocked, 1);

// 4д. Проверка корректного добавления, ссылок, экспорта и импорта
assert.equal(hub.validatePlayUrl('javascript:alert(1)'), null, 'must block javascript: URLs');
assert.equal(hub.validatePlayUrl('data:text/html,<h1>x</h1>'), null, 'must block data: play URLs');
assert.equal(hub.validatePlayUrl('https://alice.github.io/game/'), 'https://alice.github.io/game/');
assert.match(hub.slugify('Космодром 2099!'), /^[a-z0-9][a-z0-9-]{1,47}$/);

const addRes = hub.upsert({
  title: 'Тестовая Аркада',
  author: 'Игрок',
  description: 'Описание для проверки добавления игр.',
  category: '2d',
  sourceType: 'url',
  playUrl: 'https://alice.github.io/arcade/',
  features: ['Офлайн', 'Аркада'],
});
assert.equal(addRes.ok, true, 'valid user game must be accepted');
assert.equal(addRes.game.avSummary?.passCount, 10, 'accepted game must carry 10-pass avSummary');
assert.equal(hub.getAll().length, 1);

const shareUrl = hub.encodeShareLink(addRes.game);
assert.ok(shareUrl && shareUrl.includes('?importGame='), 'share link must encode importGame');
const decoded = hub.decodeShareParam(new URL(shareUrl).searchParams.get('importGame'));
assert.equal(decoded?.title, 'Тестовая Аркада', 'share link must roundtrip cleanly');

const issueUrl = hub.buildGitHubIssueUrl(addRes.game);
assert.ok(issueUrl.includes('template=game-submission.yml'), 'GitHub publish link must target game-submission.yml');

const packJson = hub.exportPack();
assert.equal(hub.remove(addRes.game.id), true);
assert.equal(hub.getAll().length, 0);
const impRes = hub.importPack(packJson);
assert.equal(impRes.ok, true);
assert.equal(impRes.added, 1);
assert.equal(hub.getAll().length, 1);

// 4b. Вкладка «Торрент»: отдельный отдел с P2P-клиентом, .torrent и magnet
assert.ok(/data-portal-tab="torrent"/.test(siteHtml), 'портал must expose the Torrent tab');
assert.ok(siteHtml.includes('id="portal-torrent-panel"'), 'portal must contain #portal-torrent-panel');
assert.ok(siteHtml.includes('id="torrentEmbedFrame"'), 'portal must embed the Torrent app in an iframe');
assert.ok(
  siteHtml.includes('data-src="../torrent/index.html?embed=games"'),
  'Torrent frame must lazy-load ../torrent/index.html',
);
assert.ok(/class="nav-link-torrent"[^>]*data-portal-tab="torrent"/.test(siteHtml), 'Torrent must be reachable from the header nav');

const torrentHtml = await readFile(path.join(repositoryRoot, 'torrent/index.html'), 'utf8');
const torrentApp = await readFile(path.join(repositoryRoot, 'torrent/app.js'), 'utf8');
const torrentScripts = [...torrentHtml.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
assert.equal(torrentScripts[0], '../shared/engine.js', 'Torrent page must load the engine before its own scripts');
for (const mod of ['manifest.js', 'torrentfile.js', 'sanitize.js', 'client.js', 'config.js', 'fetch.js']) {
  assert.ok(
    torrentScripts.some((src) => src.endsWith(`/shared/p2p/${mod}`)),
    `Torrent page must load shared/p2p/${mod}`,
  );
}
assert.ok(torrentHtml.includes('data-engine-badge'), 'Torrent page must mount the engine badge');
for (const action of ['downloadGame', 'toggleHold', 'downloadTorrentFile', 'copyMagnet']) {
  assert.ok(torrentApp.includes(action), `torrent/app.js must expose ${action}`);
}
assert.ok(/sha256/.test(torrentApp) && /judgeFile/.test(torrentApp), 'Torrent app must verify pieces and sanitize files');

// Каталог раздач: у каждой игры есть info_hash, куски и файлы.
const torrentCatalog = JSON.parse(await readFile(path.join(repositoryRoot, 'site/torrent-catalog.json'), 'utf8'));
assert.ok(Array.isArray(torrentCatalog.games) && torrentCatalog.games.length >= 16, 'torrent catalog must list all games');
for (const game of torrentCatalog.games) {
  assert.match(game.infoHash, /^[a-f0-9]{64}$/, `torrent ${game.gameId}: info_hash must be sha256 hex`);
  assert.ok(game.files.length > 0, `torrent ${game.gameId}: must have files`);
  assert.ok(game.chunkCount > 0, `torrent ${game.gameId}: must have pieces`);
  assert.ok(game.files.some((f) => /(^|\/)index\.html$/.test(f.path)), `torrent ${game.gameId}: must include entry point`);
  assert.ok(!game.files.some((f) => /\.(exe|bat|cmd|ps1|dll|apk)$/i.test(f.path)), `torrent ${game.gameId}: must not ship executables`);
}
assert.ok(torrentCatalog.stats.totalBytes < 60 * 1024 * 1024, 'torrent catalog must not ship docs/screenshots (size budget)');

// Проверка безопасного sandbox-плеера (строго БЕЗ allow-same-origin)
assert.ok(siteHtml.includes('sandbox="allow-scripts allow-pointer-lock"'), 'sandbox iframe must isolate scripts without allow-same-origin');

// 5. Проверка SEO и находимости в поисковиках (robots.txt, sitemap.xml, opensearch.xml, JSON-LD)
const robotsTxt = await readFile(path.join(repositoryRoot, 'robots.txt'), 'utf8');
assert.ok(robotsTxt.includes('Sitemap: https://m98978672-boop.github.io/games/sitemap.xml'), 'root robots.txt must declare sitemap');

const sitemapXml = await readFile(path.join(repositoryRoot, 'sitemap.xml'), 'utf8');
assert.ok(sitemapXml.includes('<loc>https://m98978672-boop.github.io/games/</loc>'), 'sitemap.xml must include root URL');
for (const game of catalog) {
  assert.ok(sitemapXml.includes(`https://m98978672-boop.github.io/games/${game.play}`), `sitemap.xml missing game ${game.id}`);
}

const opensearchXml = await readFile(path.join(repositoryRoot, 'opensearch.xml'), 'utf8');
assert.ok(opensearchXml.includes('template="https://m98978672-boop.github.io/games/?q={searchTerms}"'), 'opensearch.xml must target ?q={searchTerms}');
assert.ok(rootHtml.includes('href="opensearch.xml"'), 'root index.html must link opensearch.xml');
assert.ok(rootHtml.includes('property="og:image" content="https://m98978672-boop.github.io/games/'), 'og:image must be an absolute URL');

const ldMatch = rootHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
assert.ok(ldMatch, 'index.html must include JSON-LD structured data');
const ldJson = JSON.parse(ldMatch[1]);
const webSiteNode = ldJson['@graph']?.find((n) => n['@type'] === 'WebSite');
assert.ok(webSiteNode, 'JSON-LD must contain WebSite node');
assert.ok(Array.isArray(webSiteNode.alternateName) && webSiteNode.alternateName.includes('Библиотека игр') && webSiteNode.alternateName.includes('Библ Игры'), 'JSON-LD WebSite must declare alternateName aliases');

console.log(`Portal checks passed (${catalog.length} games, ${spotlightIds.length} spotlight items, root/site synced, SEO/sitemap/JSON-LD, 10-pass antivirus & user-games verified).`);
