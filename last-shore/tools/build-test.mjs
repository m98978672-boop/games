// То же, что build.mjs, но с заглушкой WebGL-рендерера — для тестов в jsdom.
import * as esbuild from 'esbuild';

const stamp = new Date().toISOString().replace('T', ' ').slice(0, 16);

await esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'iife',
  target: 'es2019',
  outfile: 'tests/.harness-bundle.js',
  define: { __BUILD_TIME__: JSON.stringify(stamp) },
  alias: {
    three: './tests/three-stub.js',
    'three/addons/utils/BufferGeometryUtils.js': './node_modules/three/examples/jsm/utils/BufferGeometryUtils.js',
  },
  logLevel: 'warning',
});
