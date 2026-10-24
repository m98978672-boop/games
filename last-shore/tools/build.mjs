// Сборка игры: esbuild + штамп сборки (виден в диагностике).
import * as esbuild from 'esbuild';

const stamp = new Date().toISOString().replace('T', ' ').slice(0, 16);

await esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'iife',
  target: 'es2019',
  outfile: 'bundle.js',
  define: { __BUILD_TIME__: JSON.stringify(stamp) },
  logLevel: 'info',
});

console.log('bundle.js собран, штамп:', stamp);
