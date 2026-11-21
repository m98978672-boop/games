# Physics dependency

`cannon-es.min.js` is a locally bundled copy of cannon-es 0.20.0 (MIT; see
`CANNON-LICENSE.txt`), generated with esbuild 0.25.12. It exposes `CANNON`
as a browser global and as CommonJS exports for the simulation tests. It does
not need network access at runtime.

To rebuild from the repository root after installing those exact packages:

```sh
printf 'export * from "cannon-es";\n' > .warehouse-physics-entry.js
./node_modules/.bin/esbuild .warehouse-physics-entry.js --bundle --format=iife --global-name=CANNON --minify --legal-comments=inline --outfile=warehouse-crew/vendor/cannon-es.min.js
printf '\nif(typeof module !== "undefined" && module.exports) module.exports = CANNON;\n' >> warehouse-crew/vendor/cannon-es.min.js
rm .warehouse-physics-entry.js
```
