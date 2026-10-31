// Сборка «КАСКАД: Живая Вода» через esbuild в единый bundle.js + авто-обновление ?v=... для сброса кэша браузера и GitHub Pages.
import fs from 'node:fs';
import path from 'node:path';
import * as esbuild from 'esbuild';

const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
const now = new Date();
const stamp = now.toISOString().replace('T', ' ').slice(0, 16);
const cacheTag = `${pkg.version}-${now.toISOString().replace(/[-:TZ.]/g, '').slice(0, 12)}`;

await esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  outfile: 'bundle.js',
  define: { __BUILD_TIME__: JSON.stringify(stamp) },
  logLevel: 'info',
});

const htmlPath = path.resolve('index.html');
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(/href="style\.css(?:\?v=[^"]*)?"/g, `href="style.css?v=${cacheTag}"`);
  html = html.replace(/src="bundle\.js(?:\?v=[^"]*)?"/g, `src="bundle.js?v=${cacheTag}"`);
  fs.writeFileSync(htmlPath, html, 'utf8');
}

console.log(`cascade-hydro/bundle.js собран, штамп: ${stamp}, cache-bust: ?v=${cacheTag}`);
