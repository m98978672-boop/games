import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const catalogPath = path.join(repositoryRoot, 'site/community-games.json');
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));

assert.equal(catalog.schemaVersion, 1, 'community catalog schemaVersion must be 1');
assert.ok(Array.isArray(catalog.games), 'community catalog must contain a games array');
assert.ok(catalog.games.length <= 60, 'community catalog is capped at 60 entries');

const ids = new Set();
for (const game of catalog.games) {
  assert.match(game.id, /^[a-z0-9][a-z0-9-]{1,47}$/, `invalid game id: ${game.id}`);
  assert.ok(!ids.has(game.id), `duplicate game id: ${game.id}`);
  ids.add(game.id);
  for (const [field, filename] of [['cover', 'cover.svg'], ['play', 'index.html'], ['readme', 'README.md']]) {
    const expected = `../${game.id}/${filename}`;
    assert.equal(game[field], expected, `${game.id}.${field} must use ${expected}`);
    const filePath = path.resolve(repositoryRoot, 'site', game[field]);
    assert.ok(filePath.startsWith(`${repositoryRoot}${path.sep}`), `${game.id}.${field} escapes repository root`);
    await access(filePath);
  }
  assert.ok(typeof game.title === 'string' && game.title.trim().length > 0, `${game.id} needs a title`);
  assert.ok(typeof game.description === 'string' && game.description.trim().length > 0, `${game.id} needs a description`);
  assert.ok(Array.isArray(game.features) && game.features.length <= 4, `${game.id} may list up to four features`);
}

const browserScript = await readFile(path.join(repositoryRoot, 'site/community-games.js'), 'utf8');
assert.match(browserScript, /textContent/);
assert.match(browserScript, /candidate\.cover/);
assert.match(browserScript, /repositoryRoot\.origin/);

for (const [file, scriptPath] of [['index.html', 'site/community-games.js'], ['site/index.html', '../site/community-games.js']]) {
  const html = await readFile(path.join(repositoryRoot, file), 'utf8');
  assert.ok(html.includes(`src="${scriptPath}"`), `${file} must load the community catalog script`);
  assert.ok(html.includes('id="community-game-grid"'), `${file} must contain the community game grid`);
  assert.ok(html.includes('id="report-bug"'), `${file} must contain the bug-report panel`);
  assert.ok(html.includes('template=bug-report.yml'), `${file} must link to the bug-report Issue Form`);
}

const bugForm = await readFile(path.join(repositoryRoot, '.github/ISSUE_TEMPLATE/bug-report.yml'), 'utf8');
assert.match(bugForm, /name: Сообщить об ошибке/);
assert.match(bugForm, /assignees: \[m98978672-boop\]/);
assert.match(bugForm, /required: true/);
for (const template of ['game-submission.yml', 'collaborate.yml']) {
  const form = await readFile(path.join(repositoryRoot, `.github/ISSUE_TEMPLATE/${template}`), 'utf8');
  assert.match(form, /assignees: \[m98978672-boop\]/, `${template} must notify the repository owner`);
}
const validationWorkflow = await readFile(path.join(repositoryRoot, '.github/workflows/validate.yml'), 'utf8');
assert.match(validationWorkflow, /malware-scan:/);
assert.match(validationWorkflow, /clamscan/);
const developerPage = await readFile(path.join(repositoryRoot, 'developers/index.html'), 'utf8');
const shareScript = await readFile(path.join(repositoryRoot, 'developers/share.js'), 'utf8');
assert.ok(developerPage.includes('id="share-invite"'), 'developer page must offer a share action');
assert.ok(developerPage.includes('src="share.js"'), 'developer page must load the share script');
assert.match(shareScript, /navigator\.share/);
assert.match(shareScript, /navigator\.clipboard/);

console.log(`Community catalog and report-flow checks passed (${catalog.games.length} published games).`);
