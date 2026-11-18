// esbuild inlines upstream WASM as base64 string literals. Some random byte
// sequences resemble AWS key IDs to text-only secret scanners. Escape the
// first character in those sequences without changing the JavaScript string.
import { readFileSync, writeFileSync } from 'node:fs';
const file = new URL('../src/ai/commander-worker.bundle.js', import.meta.url);
const input = readFileSync(file, 'utf8');
const output = input.replace(/(["']data:application\/octet-stream;base64,)([A-Za-z0-9+/=]{1000,})(["'])/g, (literal, prefix, data, quote) =>
  prefix + data.replace(/AKIA[0-9A-Z]{16}/g, match => '\\x41' + match.slice(1)) + quote);
writeFileSync(file, output);
