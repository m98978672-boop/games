import assert from 'node:assert/strict';
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
]) {
  assert.ok(siteHtml.includes(`id="${id}"`), `site/index.html must contain #${id}`);
  assert.ok(rootHtml.includes(`id="${id}"`), `index.html must contain #${id}`);
}

// 4. Проверка движка пользовательских игр (site/user-games.js): безопасность URL, SVG, импорт/экспорт
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
  btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
  atob: (s) => Buffer.from(s, 'base64').toString('binary'),
  Date,
};
userSandbox.globalThis = userSandbox;
vm.runInNewContext(userCode, userSandbox);

const hub = userSandbox.window.GamesUserHub;
assert.ok(hub, 'GamesUserHub must initialize');
assert.equal(hub.validatePlayUrl('javascript:alert(1)'), null, 'must block javascript: URLs');
assert.equal(hub.validatePlayUrl('data:text/html,<h1>x</h1>'), null, 'must block data: play URLs');
assert.equal(hub.validatePlayUrl('https://example.com/game/'), 'https://example.com/game/');
assert.match(hub.slugify('Космодром 2099!'), /^[a-z0-9][a-z0-9-]{1,47}$/);

const addRes = hub.upsert({
  title: 'Тестовая Аркада',
  author: 'Игрок',
  description: 'Описание для проверки добавления игр.',
  category: '2d',
  sourceType: 'url',
  playUrl: 'https://example.com/arcade/',
  features: ['Офлайн', 'Аркада'],
});
assert.equal(addRes.ok, true, 'valid user game must be accepted');
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

// Проверка безопасного sandbox-плеера (строго БЕЗ allow-same-origin)
assert.ok(siteHtml.includes('sandbox="allow-scripts allow-pointer-lock"'), 'sandbox iframe must isolate scripts without allow-same-origin');

console.log(`Portal checks passed (${catalog.length} games, ${spotlightIds.length} spotlight items, root/site synced, user-games verified).`);
