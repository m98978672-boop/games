#!/usr/bin/env node
// Дорисовывает обложки новостям, у которых в site/news-feed.json указан файл,
// а на диске его нет. Рисует ровно в том же стиле, что и остальные обложки
// (tools/news/make-missing-covers.mjs → site/assets/news/<код-в-нижнем-регистре>.svg).
//
// Только создаёт недостающее: существующие файлы никогда не перезаписываются.
//
// Запуск:  node tools/news/make-missing-covers.mjs
// Проверка: node tools/news/make-missing-covers.mjs --check  (код 1, если есть дыры)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');

const STYLE = {
  c: { from: '#2b1114', to: '#ef5350', icon: '🛡️', label: 'Кибербезопасность' },
  f: { from: '#12261f', to: '#3ddc84', icon: '🚩', label: 'Frontline' },
  g: { from: '#1d2b64', to: '#4f7cff', icon: '🎮', label: 'Игры' },
  s: { from: '#1b1035', to: '#8b5cf6', icon: '🔐', label: 'Безопасность' },
  t: { from: '#102a43', to: '#22b8cf', icon: '🧪', label: 'Технологии' },
  w: { from: '#2b2113', to: '#e8b45a', icon: '🌍', label: 'Мир' },
};

function esc(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Режем заголовок на строки не длиннее limit, максимум maxLines строк.
function wrap(text, limit, maxLines) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? line + ' ' + word : word;
    if (candidate.length <= limit) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = word;
    if (lines.length === maxLines - 1) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (!lines.length) lines.push('Новость дня');
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    lines[maxLines - 1] = lines[maxLines - 1].replace(/[.,;:]?$/, '…');
  }
  return lines;
}

function cover(post) {
  const code = String(post.code || '').toUpperCase();
  const preset = STYLE[code[0] && code[0].toLowerCase()] || STYLE.w;
  const icon = post.icon || preset.icon;
  const title = post.title || post.summary || code || 'Новость';
  const lines = wrap(title, 42, 3);
  const source = [post.sourceName, 'Games News'].filter(Boolean).join(' · ');
  const badgeWidth = 66 + code.length * 21;

  const body = lines.map((line, i) =>
    `  <text x="72" y="${330 + i * 54}" font-family="Inter, Segoe UI, sans-serif" font-size="44" font-weight="700" fill="#ffffff">${esc(line)}</text>`
  ).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-label="${esc(code)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${preset.from}"/>
      <stop offset="100%" stop-color="${preset.to}"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <circle cx="1120" cy="120" r="230" fill="#ffffff" opacity="0.07"/>
  <circle cx="180" cy="640" r="190" fill="#ffffff" opacity="0.05"/>
  <text x="72" y="120" font-family="Inter, Segoe UI, sans-serif" font-size="128">${esc(icon)}</text>
  <rect x="72" y="180" width="${badgeWidth}" height="52" rx="26" fill="#ffffff" opacity="0.16"/>
  <text x="98" y="216" font-family="Inter, Segoe UI, sans-serif" font-size="26" font-weight="700" fill="#ffffff">${esc(code)}</text>
${body}
  <text x="72" y="620" font-family="Inter, Segoe UI, sans-serif" font-size="28" font-weight="600" fill="#ffffff" opacity="0.78">${esc(source)}</text>
</svg>
`;
}

const feedPath = path.join(root, 'site', 'news-feed.json');
const feed = JSON.parse(fs.readFileSync(feedPath, 'utf8'));
const posts = Array.isArray(feed) ? feed : (feed.posts || feed.items || []);
const checkOnly = process.argv.includes('--check');

const missing = [];
for (const post of posts) {
  const image = post.image || post.cover;
  if (!image) continue;
  const rel = image.replace(/^\.?\//, '');
  const file = path.isAbsolute(rel) ? rel : path.join(root, rel);
  if (fs.existsSync(file)) continue;
  missing.push({ post, file, image });
}

if (!missing.length) {
  console.log('✓ Все обложки новостей на месте (' + posts.length + ' постов)');
  process.exit(0);
}

if (process.argv.includes('--list')) {
  missing.forEach((m) => console.log(m.image + '  ←  ' + (m.post.code || m.post.id)));
}

if (checkOnly) {
  console.log('✗ Нет обложек: ' + missing.length);
  missing.slice(0, 10).forEach((m) => console.log('   ' + m.image));
  process.exit(1);
}

let made = 0;
for (const item of missing) {
  fs.mkdirSync(path.dirname(item.file), { recursive: true });
  fs.writeFileSync(item.file, cover(item.post), 'utf8');
  made += 1;
}
console.log('✓ Нарисовано обложек: ' + made + ' (из ' + posts.length + ' постов)');
