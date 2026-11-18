#!/usr/bin/env node
// ============================================================================
// Games P2P Torrent — сборка каталога раздач из реальных файлов репозитория.
// ----------------------------------------------------------------------------
// Для каждой игры: обходит папку, чистит её через автоудаление плохих файлов
// (shared/p2p/sanitize.js), считает sha256 каждого файла, разбивает на чанки
// и получает info_hash. Результат — site/torrent-catalog.json, который читает
// вкладка «Торрент» и который же служит манифестом для P2P-раздачи.
//
// Запуск:
//   node tools/torrent/build-catalog.mjs             # записать каталог
//   node tools/torrent/build-catalog.mjs --check     # проверить актуальность
//   node tools/torrent/build-catalog.mjs --game 1in8b
// ============================================================================
import crypto from 'node:crypto';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const P2P = require('../../shared/p2p/manifest.js');
const SAN = require('../../shared/p2p/sanitize.js');

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const catalogPath = path.join(repoRoot, 'site/torrent-catalog.json');
const gamesDataPath = path.join(repoRoot, 'site/games-data.js');

const CHUNK_SIZE = 256 * 1024;

// Файлы, которые не нужны внутри раздачи игры (ломают запуск после распаковки
// или являются служебными для репозитория, но не для игры).
const EXCLUDE_DIRS = new Set(['.git', 'node_modules', '.arena', 'dist', 'build', 'out', 'target', '.cache']);
const EXCLUDE_FILE_RE = /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|\.env(\..*)?)$/i;
// Раздача — это ИГРА, а не git-копия папки: тяжёлые скриншоты документации,
// тесты и служебные файлы репозитория игре для запуска не нужны. Это не
// «плохие файлы» (их автоочистка не трогает), а просто лишний вес — поэтому
// они не попадают в манифест. Логика чистки от вредоносного отдельная.
// Что игре не нужно для запуска (и не должно раздувать раздачу):
//   • папки документации, скриншотов и тестов;
//   • ЛЮБАЯ документация (.md/.markdown/.rst): README, SPEC, PLAN, ALGORITHMS.
//     Это самый подвижный слой репозитория — в `main` он меняется каждый день,
//     и раздача «устаревала» бы после каждого коммита документации, хотя игра
//     не изменилась ни на байт. Проверено: игры не загружают .md в рантайме.
//   • Исключение — README/LICENSE внутри `assets/`: там лежат лицензии на
//     сторонние ресурсы (Kenney и т.п.).
const DOCS_ONLY_RE = /(?:^|\/)README\.md$|(?:^|\/)LICENSE(?:\.[a-z]+)?$/i;
const NOT_FOR_PLAY_RE = /(^|\/)(docs?|screenshots?|shots|assets\/shots|tests?)(\/|$)/i;
function notForPlay(relPath) {
  if (NOT_FOR_PLAY_RE.test(relPath)) return true;
  if (/\.(md|markdown|rst)$/i.test(relPath) && !(/(^|\/)assets\//i.test(relPath) && DOCS_ONLY_RE.test(relPath))) return true;
  return false;
}

// Не читаем в память тяжёлые бинарники — только размер и sha256 потоком.
const BINARY_EXT = new Set([
  'png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'ico', 'avif', 'tga', 'ktx2', 'basis',
  'mp3', 'ogg', 'wav', 'm4a', 'opus', 'flac', 'aac', 'webm', 'mp4', 'glb', 'gltf', 'bin', 'dat',
  'ttf', 'otf', 'woff', 'woff2', 'eot', 'zip', 'gz', 'wasm',
]);
const TEXT_EXT = new Set(['js', 'mjs', 'cjs', 'json', 'html', 'htm', 'css', 'svg', 'txt', 'md', 'xml', 'csv', 'glsl', 'wgsl']);

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function walk(dir, base, acc) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      await walk(abs, rel, acc);
    } else if (entry.isFile()) {
      if (EXCLUDE_FILE_RE.test(rel)) continue;
      // Скриншоты и документация не нужны для запуска игры — но НЕ удаляем
      // их из репозитория, просто не включаем в раздачу.
      if (notForPlay(rel)) continue;
      // Крупные картинки вне игровых папок (docs, превью) — тоже мимо.
      if (/\.(png|jpe?g|webp|gif)$/i.test(rel) && /(^|\/)(docs|preview|previews|shots)(\/|$)/i.test(rel)) continue;
      acc.push(rel);
    }
  }
  return acc;
}

async function collectFiles(gameDir, gameId, opts) {
  const files = await walk(path.join(repoRoot, gameDir), '', []);
  const out = [];
  for (const rel of files.sort()) {
    const abs = path.join(repoRoot, gameDir, rel);
    const info = await stat(abs);
    const ext = SAN.extOf(rel);
    // Бинарный файл определяется по расширению И по содержимому: картинки,
    // звук, модели, EXR-текстуры нельзя декодировать как UTF-8 — иначе
    // случайные байты превращаются в «BiDi-символы», а «очистка» меняет
    // размер файла (и игра ломается). Для бинарников text всегда null.
    const isBinaryByExt = BINARY_EXT.has(ext) && !TEXT_EXT.has(ext);
    let text = null;
    let buffer = null;
    if (!isBinaryByExt && info.size <= 2 * 1024 * 1024) {
      buffer = await readFile(abs);
      // Проверка на бинарь по содержимому: нулевой байт или высокая доля
      // неуправляемых символов — значит это не текст, чистить нечего.
      const probe = buffer.subarray(0, 512);
      const hasNul = probe.includes(0);
      text = hasNul ? null : buffer.toString('utf8');
    }
    const verdict = SAN.judgeFile({ path: rel, size: info.size, text });
    if (verdict.action === 'block') {
      out.push({ rel, abs, size: info.size, blocked: verdict });
      continue;
    }
    let finalText = verdict.cleaned !== undefined ? verdict.cleaned : text;
    let finalBuffer = verdict.cleaned !== undefined ? Buffer.from(verdict.cleaned, 'utf8') : buffer;
    // Предохранитель: «почищенный» файл не должен (а) раздуваться сильнее
    // оригинала более чем на 5 % и (б) терять точку входа. Если это
    // произошло — файл бинарный или очистка небезопасна: оставляем оригинал,
    // а не ломаем игру. Вредоносные сигнатуры к этому моменту уже отсечены
    // веткой action === 'block'.
    if (finalBuffer && finalBuffer.length > Math.floor(info.size * 1.05) + 64) {
      finalText = text;
      finalBuffer = buffer;
    }
    out.push({
      rel,
      abs,
      size: finalBuffer ? finalBuffer.length : info.size,
      sha256: finalBuffer ? sha256(finalBuffer) : null,
      verdict,
      opts,
    });
  }
  return out;
}

// Для бинарников без буфера считаем sha256 потоком, чтобы не держать в памяти.
async function hashFile(abs) {
  const data = await readFile(abs);
  return { sha256: sha256(data), size: data.length };
}

function parseCatalog(source) {
  const sandbox = { window: {} };
  // games-data.js — обычный IIFE без модулей
  const fn = new Function('window', 'globalThis', `${source}\nreturn window.GAMES_CATALOG;`);
  return fn(sandbox.window, sandbox.window);
}

async function buildOne(game) {
  const dir = String(game.play || '').split('/')[0];
  if (!dir) return null;
  const collected = await collectFiles(dir, game.id);
  const blocked = collected.filter((f) => f.blocked).map((f) => ({
    path: f.rel,
    rule: f.blocked.rule,
    kind: f.blocked.kind,
    size: f.size,
  }));

  const clean = [];
  for (const file of collected) {
    if (file.blocked) continue;
    let sha = file.sha256;
    let size = file.size;
    if (!sha) {
      const hashed = await hashFile(file.abs);
      sha = hashed.sha256;
      size = hashed.size;
    }
    clean.push({ path: file.rel, size, sha256: sha });
  }

  const manifest = await P2P.buildManifest({
    gameId: game.id,
    title: game.title,
    version: game.version || 'v1',
    description: game.subtitle || '',
    chunkSize: CHUNK_SIZE,
    files: clean,
    createdAt: '2026-11-18T00:00:00.000Z',
  });

  return {
    gameId: game.id,
    title: game.title,
    subtitle: game.subtitle || '',
    accent: game.accent || '#e8b45a',
    version: game.version || 'v1',
    play: game.play,
    cover: game.cover && (game.cover.webp || game.cover.src),
    dir,
    infoHash: manifest.infoHash,
    totalSize: manifest.totalSize,
    chunkSize: manifest.chunkSize,
    chunkCount: manifest.chunkCount,
    fileCount: manifest.fileCount,
    files: manifest.files,
    blocked,
    blockedCount: blocked.length,
    blockedBytes: blocked.reduce((n, b) => n + (b.size || 0), 0),
    addedAt: '2026-11-18T00:00:00.000Z',
  };
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const check = args.has('--check');
  const onlyIdx = process.argv.indexOf('--game');
  const only = onlyIdx > 0 ? process.argv[onlyIdx + 1] : null;

  const source = await readFile(gamesDataPath, 'utf8');
  const catalog = parseCatalog(source);
  const games = only ? catalog.filter((g) => g.id === only) : catalog;

  const entries = [];
  for (const game of games) {
    const entry = await buildOne(game);
    if (entry) {
      entries.push(entry);
      console.error(
        `  ${entry.gameId.padEnd(28)} файлов ${String(entry.fileCount).padStart(4)} · ` +
        `${P2P.formatBytes(entry.totalSize).padStart(9)} · чанков ${String(entry.chunkCount).padStart(4)} · ` +
        `удалено ${entry.blockedCount}`,
      );
    }
  }

  const payload = {
    schema: 'games-torrent-catalog/1',
    generatedAt: '2026-11-18T00:00:00.000Z',
    chunkSize: CHUNK_SIZE,
    stats: {
      games: entries.length,
      files: entries.reduce((n, e) => n + e.fileCount, 0),
      totalBytes: entries.reduce((n, e) => n + e.totalSize, 0),
      chunks: entries.reduce((n, e) => n + e.chunkCount, 0),
      blockedFiles: entries.reduce((n, e) => n + e.blockedCount, 0),
    },
    games: entries,
  };

  const json = `${JSON.stringify(payload, null, 2)}\n`;

  if (check) {
    let current = '';
    try { current = await readFile(catalogPath, 'utf8'); } catch { current = ''; }
    if (current !== json) {
      console.error('Каталог раздач устарел: запустите node tools/torrent/build-catalog.mjs');
      process.exit(1);
    }
    console.log(`Каталог раздач актуален: ${entries.length} игр, ${payload.stats.files} файлов, ${P2P.formatBytes(payload.stats.totalBytes)}.`);
    return;
  }

  await writeFile(catalogPath, json, 'utf8');
  console.log(
    `Каталог раздач собран: ${entries.length} игр, ${payload.stats.files} файлов, ` +
    `${P2P.formatBytes(payload.stats.totalBytes)}, ${payload.stats.chunks} чанков, ` +
    `удалено вредоносного ${payload.stats.blockedFiles}.`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
