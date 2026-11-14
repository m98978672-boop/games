/* Сборка: 2D-карта (основная), 3D-опыт, два воркера. Всё локально, без CDN. */
import { build } from 'esbuild';

const common = { bundle: true, format: 'iife', target: ['es2020'], logLevel: 'info', legalComments: 'none', minify: true, sourcemap: false };

await build({ ...common, entryPoints: ['src/main2d.js'], outfile: 'bundle.js' });
await build({ ...common, entryPoints: ['src/main.js'], outfile: 'bundle-3d.min.js' });
await build({ ...common, entryPoints: ['src/map-worker.js'], outfile: 'map-worker.min.js' });
await build({ ...common, entryPoints: ['src/terrain-worker.js'], outfile: 'terrain-worker.min.js' });
