// ============================================================
// tests/bundle.mjs — закоммиченная сборка должна совпадать с src/.
//
// Зачем: index.html подключает showroom.bundle.js, а не модули из src/.
// Если поправить src/ и забыть `npm run build`, сайт покажет старую версию,
// и тесты этого не заметят — они проверяют src/, а не сборку.
// Эта проверка собирает бандл в памяти и сравнивает с файлом в репозитории.
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bundlePath = path.join(root, 'showroom.bundle.js');

const options = {
  entryPoints: [path.join(root, 'src/app.js')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2019',
  write: false,
  logLevel: 'silent',
};

let built;
try {
  const result = await esbuild.build(options);
  built = result.outputFiles[0].text;
} catch (e) {
  console.error('✗ сборка из src/ не собирается:', e.message);
  process.exit(1);
}

if (!fs.existsSync(bundlePath)) {
  console.error('✗ нет showroom.bundle.js — выполни npm run build');
  process.exit(1);
}

const committed = fs.readFileSync(bundlePath, 'utf8');

if (built === committed) {
  console.log(`✓ сборка актуальна (${(built.length / 1024).toFixed(1)} КБ совпадают с src/)`);
  process.exit(0);
}

const inMemory = (built.length / 1024).toFixed(1);
const onDisk = (committed.length / 1024).toFixed(1);
console.error('✗ showroom.bundle.js устарел: сайт покажет старую версию кода');
console.error(`   в репозитории ${onDisk} КБ, из src/ получается ${inMemory} КБ`);
console.error('   исправление: npm run build');
process.exit(1);
