#!/usr/bin/env node
// Синхронизирует корневой index.html из исходника site/index.html.
// Запуск: node site/sync-root.mjs
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(siteDir, '..');
const srcPath = path.join(siteDir, 'index.html');
const dstPath = path.join(repoRoot, 'index.html');

export function renderRootIndex(siteHtml) {
  return siteHtml
    .replace(/content="assets\//g, 'content="site/assets/')
    .replace(/src="assets\//g, 'src="site/assets/')
    .replace(/srcset="assets\//g, 'srcset="site/assets/')
    .replace(/href="assets\//g, 'href="site/assets/')
    .replace(/href="site\.css"/g, 'href="site/site.css"')
    .replace(/href="site\.webmanifest"/g, 'href="site/site.webmanifest"')
    .replace(/src="games-data\.js"/g, 'src="site/games-data.js"')
    .replace(/src="portal\.js"/g, 'src="site/portal.js"')
    .replace(/src="\.\.\/site\/community-games\.js"/g, 'src="site/community-games.js"')
    .replace(/data-root="\.\.\/"/g, 'data-root=""')
    .replace(/href="\.\.\/([a-z0-9-]+)\//g, 'href="$1/')
    .replace(/src="\.\.\/([a-z0-9-]+)\//g, 'src="$1/');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const source = await readFile(srcPath, 'utf8');
  const output = renderRootIndex(source);
  await writeFile(dstPath, output, 'utf8');
  console.log(`Synced ${path.relative(repoRoot, dstPath)} from ${path.relative(repoRoot, srcPath)}.`);
}
