// Сборка «КАСКАД: Живая Вода» через esbuild в единый bundle.js без внешних зависимостей.
import * as esbuild from 'esbuild';

const stamp = new Date().toISOString().replace('T', ' ').slice(0, 16);

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

console.log('cascade-hydro/bundle.js собран, штамп:', stamp);
