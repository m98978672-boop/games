#!/usr/bin/env node
// Пайплайн реальных ассетов: качает лицензионно чистые HDR-среды (Poly Haven, CC0)
// из npm-пакета @pmndrs/assets, раскладывает их в assets/env/*.exr и пишет манифест
// с лицензией, источником и контрольной суммой. Игра работает и без этих файлов —
// тогда небо и свет остаются процедурными (см. src/core/assets.js).
//
//   node tools/fetch-assets.mjs            # скачать недостающее
//   node tools/fetch-assets.mjs --force    # перекачать всё
//   node tools/fetch-assets.mjs --list     # что доступно в пакете
//
// Ничего не берём из чужих игр: только CC0-фотографии Poly Haven в упаковке
// @pmndrs/assets (MIT для кода, CC0 для самих карт).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const assetsDir = path.join(root, 'assets');
const envDir = path.join(assetsDir, 'env');
const cacheDir = path.join(root, '.cache', 'assets');

const PKG = '@pmndrs/assets';
const PKG_VERSION = '1.7.0';

// Что берём и зачем. Каждая среда — реальная HDR-панорама (CC0, Poly Haven).
const WANTED = {
  'sky.exr': { source: 'sky.exr.js', title: 'Ясный день', weather: ['clear', 'cloudy'], time: [0.42, 0.58] },
  'dawn.exr': { source: 'dawn.exr.js', title: 'Рассвет', weather: ['clear', 'cloudy', 'overcast'], time: [0.2, 0.33] },
  'sunset.exr': { source: 'sunset.exr.js', title: 'Закат', weather: ['clear', 'cloudy'], time: [0.67, 0.82] },
  'night.exr': { source: 'night.exr.js', title: 'Ночь', weather: ['clear', 'overcast', 'rain'], time: [0.85, 1.0] },
  'overcast.exr': { source: 'park.exr.js', title: 'Пасмурно', weather: ['overcast', 'rain', 'storm', 'fog'], time: [0.0, 1.0] },
};

const args = process.argv.slice(2);
const force = args.includes('--force');
const listOnly = args.includes('--list');

function log(msg) {
  console.log('· ' + msg);
}

async function downloadTarball() {
  fs.mkdirSync(cacheDir, { recursive: true });
  const file = path.join(cacheDir, `assets-${PKG_VERSION}.tgz`);
  if (fs.existsSync(file) && !force) {
    log(`пакет уже скачан: ${path.relative(root, file)}`);
    return file;
  }
  const url = `https://registry.npmjs.org/@pmndrs/assets/-/assets-${PKG_VERSION}.tgz`;
  log(`скачиваю ${PKG}@${PKG_VERSION} (~19 МБ распакованного)`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`не удалось скачать пакет: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(file, buf);
  log(`сохранено ${(buf.length / 1e6).toFixed(1)} МБ`);
  return file;
}

function listTarball(tarPath) {
  return execFileSync('tar', ['tzf', tarPath], { encoding: 'utf8' }).trim().split('\n');
}

function readFromTarball(tarPath, member) {
  return execFileSync('tar', ['xzf', tarPath, '-O', member], { maxBuffer: 64 * 1024 * 1024 });
}

/** Файл в пакете — ES-модуль с data-URI. Достаём бинарник и пишем как есть. */
function decodeDataUri(jsSource) {
  const m = /data:application\/(?:exr|octet-stream);base64,([A-Za-z0-9+/=]+)/.exec(jsSource.toString('utf8'));
  if (!m) throw new Error('в модуле нет base64-данных');
  return Buffer.from(m[1], 'base64');
}

const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

async function main() {
  const tarPath = await downloadTarball();
  const members = listTarball(tarPath);

  if (listOnly) {
    for (const m of members.filter((x) => /^package\/hdri\/[^/]+\.exr\.js$/.test(x))) {
      console.log('  ' + m.replace('package/hdri/', '').replace('.js', ''));
    }
    return;
  }

  fs.mkdirSync(envDir, { recursive: true });
  const manifestPath = path.join(assetsDir, 'manifest.json');
  let manifest = { version: 1, env: {}, textures: {}, models: {} };
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = { ...manifest, ...JSON.parse(fs.readFileSync(manifestPath, 'utf8')) };
    } catch {
      /* битый манифест перезапишем */
    }
  }
  manifest.sources = manifest.sources || {};
  manifest.sources[PKG] = {
    version: PKG_VERSION,
    url: `https://registry.npmjs.org/${PKG}/-/assets-${PKG_VERSION}.tgz`,
    note: 'HDR-панорамы Poly Haven (CC0), упакованы как base64 data-URI',
  };

  let written = 0;
  for (const [name, meta] of Object.entries(WANTED)) {
    const member = `package/hdri/${meta.source}`;
    const outFile = path.join(envDir, name);
    if (!force && fs.existsSync(outFile)) {
      log(`уже есть: assets/env/${name}`);
      continue;
    }
    if (!members.includes(member)) {
      console.warn(`! в пакете нет ${member} — пропускаю`);
      continue;
    }
    const js = readFromTarball(tarPath, member);
    const bin = decodeDataUri(js);
    fs.writeFileSync(outFile, bin);
    manifest.env[name] = {
      file: `env/${name}`,
      title: meta.title,
      format: 'exr',
      bytes: bin.length,
      sha256: sha(bin),
      license: 'CC0-1.0',
      credit: 'Poly Haven (polyhaven.com) через @pmndrs/assets',
      weather: meta.weather,
      time: meta.time,
    };
    written++;
    log(`assets/env/${name} — ${(bin.length / 1024).toFixed(0)} КБ, ${meta.title}`);
  }

  manifest.generated = new Date().toISOString();
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  log(`манифест: assets/manifest.json (${Object.keys(manifest.env).length} сред)`);
  if (written) log(`новых файлов: ${written}`);
}

main().catch((err) => {
  console.error('\n❌ ' + err.message);
  process.exit(1);
});
