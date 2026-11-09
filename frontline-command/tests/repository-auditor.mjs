import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scanRepository, formatRepositoryReport } from '../tools/repository-auditor.mjs';
const root = mkdtempSync(join(tmpdir(), 'repo-audit-'));
try {
  mkdirSync(join(root, 'game'), { recursive: true });
  writeFileSync(join(root, 'game/good.json'), '{"x":1}');
  writeFileSync(join(root, 'game/bad.json'), '{broken');
  writeFileSync(join(root, 'game/bad.mjs'), 'const = ;');
  writeFileSync(join(root, 'game/bad.png'), 'not png');
  writeFileSync(join(root, 'game/readme.md'), 'не проверяется');
  writeFileSync(join(root, 'game/page.html'), `<!-- <script src="comment.js"></script> --> <script src="missing.js"></script><link href="good.json?v=1"><img src="https://example.com/x.png"><img data-src="not-a-src.png">`);
  symlinkSync('/etc/passwd', join(root, 'game/link.json'));
  const report = scanRepository(root, ['game/good.json','game/bad.json','game/bad.mjs','game/bad.png','game/readme.md','game/link.json','game/missing.json','../outside','game/page.html']);
  assert.equal(report.complete, false);
  assert.deepEqual(report.issues.map((e) => e.code), [802, 803, 804, 801, 800, 805]);
  assert.equal(report.counts.symlinks, 1);
  assert.equal(report.counts.htmlReferences, 2);
  assert.equal(report.issues.at(-1).observed, 'missing.js');
  assert.match(formatRepositoryReport(report), /Полная проверка всех игр не выполнена/);
} finally { rmSync(root, { recursive: true, force: true }); }
console.log('репозиторий: JSON, синтаксис JS, PNG, пути, отсутствие файлов и символические ссылки');
