/* Сборка: два бандла — игра и воркер рельефа. Без CDN, всё локально. */
import { build } from 'esbuild';

const common = { bundle: true, format: 'iife', target: ['es2020'], logLevel: 'info', legalComments: 'none', minify: true, sourcemap: false };

await build({ ...common, entryPoints: ['src/main.js'], outfile: 'game.js' });
await build({ ...common, entryPoints: ['src/terrain-worker.js'], outfile: 'terrain-worker.js' });
