#!/usr/bin/env node
/**
 * Сборка демо-страницы раннера (§32.5).
 *
 * Берёт src/demo/routine-demo.js (+ data/routines.js + src/sim/routine-runner.js),
 * собирает esbuild'ом один IIFE и вклеивает в routines-demo.html между маркерами BUNDLE-START и BUNDLE-END. Так страница — один файл и работает с диска
 * (file://) без сервера и без модулей.
 *
 * Запуск: node tools/build-routines-demo.mjs
 */
import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const htmlPath = join(root, "routines-demo.html");

const result = await build({
  entryPoints: [join(root, "src", "demo", "routine-demo.js")],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2019",
  legalComments: "none",
  write: false
});

const code = result.outputFiles[0].text;
const html = readFileSync(htmlPath, "utf8");

const start = "/*BUNDLE-START*/";
const end = "/*BUNDLE-END*/";
const a = html.indexOf(start);
const b = html.indexOf(end);
if (a < 0 || b < 0 || b < a) {
  console.error("в routines-demo.html нет маркеров /*BUNDLE-START*/ и /*BUNDLE-END*/");
  process.exit(1);
}

const next = html.slice(0, a + start.length) + "\n" + code + "\n" + html.slice(b);
writeFileSync(htmlPath, next);
console.log(`routines-demo.html собран: код ${(code.length / 1024).toFixed(1)} КБ, файл ${(next.length / 1024).toFixed(1)} КБ`);
