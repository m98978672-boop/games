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
for (const id of ['hero-spotlight', 'new-releases-grid', 'catalog-search', 'category-pills', 'catalog-grid', 'game-modal']) {
  assert.ok(siteHtml.includes(`id="${id}"`), `site/index.html must contain #${id}`);
  assert.ok(rootHtml.includes(`id="${id}"`), `index.html must contain #${id}`);
}

console.log(`Portal checks passed (${catalog.length} games, ${spotlightIds.length} spotlight items, root/site synced).`);
