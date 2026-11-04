// Проверка пайплайна реальных ассетов: манифест, контрольные суммы и разбор EXR.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { PROFILES, qualityProfile, densityFor, QUALITY_LEVELS } from '../src/core/quality.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const assets = path.join(root, 'assets');
const assert = (cond, msg) => {
  if (!cond) throw new Error('ПРОВАЛ: ' + msg);
  console.log('  ✓ ' + msg);
};

const manifestPath = path.join(assets, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.log('! assets/manifest.json нет — запустите node tools/fetch-assets.mjs');
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const names = Object.keys(manifest.env || {});
assert(names.length >= 3, `сред в манифесте: ${names.length}`);
assert(!!manifest.sources?.['@pmndrs/assets'], 'источник и версия пакета записаны');

let totalBytes = 0;
const loader = new EXRLoader();
for (const name of names) {
  const entry = manifest.env[name];
  const file = path.join(assets, entry.file);
  assert(fs.existsSync(file), `файл на месте: assets/${entry.file}`);
  const buf = fs.readFileSync(file);
  totalBytes += buf.length;
  const digest = crypto.createHash('sha256').update(buf).digest('hex');
  assert(digest === entry.sha256, `sha256 совпадает: ${name}`);
  assert(/^CC0/.test(entry.license || ''), `лицензия указана (${entry.license}): ${name}`);
  const tex = loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const { width, height } = tex;
  assert(width >= 256 && height >= 128, `${name}: панорама ${width}×${height}`);
  const data = tex.data;
  assert(data && data.length >= width * height * 3, `${name}: данные HDR на месте (${data.length} значений)`);
  let finite = true;
  let max = 0;
  for (let i = 0; i < data.length; i += 997) {
    const v = data[i];
    if (!Number.isFinite(v)) finite = false;
    if (v > max) max = v;
  }
  assert(finite, `${name}: значения без NaN/Infinity`);
  assert(max > 0.2, `${name}: есть яркость (макс ${max.toFixed(2)}) — карта не пустая`);
  tex.data = null;
}
console.log(`  · суммарный вес сред: ${(totalBytes / 1024).toFixed(0)} КБ`);

// Профили качества: бюджеты не «перевёрнуты» и покрывают все уровни.
for (const level of QUALITY_LEVELS) {
  assert(!!PROFILES[level], `профиль качества есть: ${level}`);
}
const low = qualityProfile('low');
const high = qualityProfile('high');
assert(low.pixelRatio < high.pixelRatio, 'на низком качестве меньше разрешение кадра');
assert(low.shadowSize < high.shadowSize, 'тени дешевле на низком качестве');
assert(low.treeDensity < high.treeDensity, 'меньше растительности на низком качестве');
assert(low.envPresets < high.envPresets, 'меньше HDR-сред на низком качестве');
assert(densityFor('low', 'treeDensity', 100) < densityFor('high', 'treeDensity', 100), 'densityFor считает долю');
assert(densityFor('low', 'treeDensity', 1) >= 1, 'минимум один объект остаётся всегда');

// --- Сквозная проверка загрузчика: локальный HTTP-сервер + AssetLibrary.
{
  const http = await import('node:http');
  const { AssetLibrary } = await import('../src/core/assets.js');
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\//, '');
    const file = path.join(root, rel);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end('nope');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}/`;
  try {
    const lib = new AssetLibrary(base);
    await lib.loadManifest();
    assert(lib.ready, 'загрузчик читает манифест по HTTP');
    assert(lib.hasEnv('sky'), 'среда адресуется по короткому имени (sky)');
    const tex = await lib.loadEnv('sky');
    assert(!!tex && tex.isTexture, 'HDR-среда превращается в текстуру three');
    assert(tex.image.width >= 256, `текстура среды ${tex.image.width}×${tex.image.height}`);
    const THREE = await import('three');
    assert(tex.mapping === THREE.EquirectangularReflectionMapping, 'среда помечена как равноугольная (equirectangular)');
    const again = await lib.loadEnv('sky');
    assert(again === tex, 'повторная загрузка берётся из кэша');
    assert((await lib.loadEnv('нет-такой')) === null, 'отсутствующая среда не ломает игру');
    const empty = new AssetLibrary(base + 'missing/');
    await empty.loadManifest();
    assert(!empty.ready && empty.describe() === 'процедурные материалы', 'без ассетов — процедурный запас');
  } finally {
    server.close();
  }
}

console.log('\n✅ ассеты и профили качества в порядке');
