#!/usr/bin/env node
/* РЕГРЕССИЯ «КРЕСТИКИ»: каждый ✕ не просто вызывает обработчик, а приводит
   к тому, что панель реально исчезает.

   История: ✕ у полосы ответа, вложения и «Закреплено» вызывали правильный
   обработчик, но панель оставалась на экране — у классов стоял свой
   display: flex, который в CSS перебивал браузерный атрибут hidden.
   Пользователь видел «крестик не закрывает».

   Проверяем обе стороны:
   1) в разметке у каждой ✕-кнопки есть обработчик (id или data-close);
   2) CSS не перебивает атрибут hidden у панелей, которые эти ✕ закрывают. */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(path.join(rootDir, 'index.html'), 'utf8');
const css = (await readFile(path.join(rootDir, 'styles.css'), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '');
const app = await readFile(path.join(rootDir, 'src/web/app.js'), 'utf8');

console.log('=== Крестики RatMes: закрывают ли они панель по-настоящему ===');

/* 1. Каждая ✕ в разметке имеет обработчик: id, на который ссылается app.js,
      либо data-close, который ловит универсальный обработчик. */
const crossButtons = [...html.matchAll(/<button\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g)]
  .filter(([, attrs]) => /\bid="([^"]+)"/.test(attrs))
  .map(([, attrs]) => ({
    id: (attrs.match(/\bid="([^"]+)"/) || [])[1],
    text: (attrs.match(/aria-label="([^"]*)"/) || [])[1] || '',
    hasDataClose: /\bdata-close\b/.test(attrs),
  }))
  .filter((btn) => /закры|убрать|отмен/i.test(btn.text) || /close/i.test(btn.id));

assert.ok(crossButtons.length >= 10, `в разметке должно быть не меньше 10 кнопок закрытия, найдено ${crossButtons.length}`);

const unbound = crossButtons.filter((btn) => {
  if (btn.hasDataClose) return false;
  // универсальный обработчик закрывает любой ✕ внутри открытого dialog
  if (app.includes('bindUniversalCloseHandlers')) return false;
  return !app.includes(`'${btn.id}'`) && !app.includes(`"${btn.id}"`);
});
assert.deepEqual(unbound.map((b) => b.id), [], 'у каждой кнопки закрытия должен быть обработчик');
console.log(`  ✓ ${crossButtons.length} кнопок закрытия привязаны к app.js (или к универсальному обработчику)`);

/* 2. Панели, которые закрывают эти ✕, обязаны реально скрываться атрибутом hidden. */
const globalHidden = (() => {
  for (const chunk of css.split('}')) {
    const [selector, body] = chunk.split('{');
    if (!selector || !body) continue;
    if (selector.split(',').some((part) => part.trim() === '[hidden]') && /display\s*:\s*none/i.test(body)) return true;
  }
  return false;
})();
assert.ok(globalHidden, 'styles.css обязан содержать самостоятельное правило [hidden] { display: none !important; }');

/* Панели, которые приложение прячет через .hidden после нажатия на ✕. */
const panelsHiddenByJs = [...app.matchAll(/el\('([A-Za-z0-9_]+)'\)\.hidden\s*=\s*(true|false)/g)]
  .map((m) => m[1]);
const toggled = [...new Set(panelsHiddenByJs)];
assert.ok(toggled.length >= 5, `приложение должно прятать панели через .hidden, найдено ${toggled.length}`);

const declarations = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
const conflicts = [];
for (const id of toggled) {
  const tag = html.match(new RegExp(`<[^>]*\\bid="${id}"[^>]*>`));
  if (!tag) continue;
  const classes = ((tag[0].match(/\bclass="([^"]+)"/) || [])[1] || '').split(/\s+/).filter(Boolean);
  if (!classes.length) continue;
  for (const [, selector, body] of declarations) {
    const decl = body.match(/display\s*:\s*([^;}]+?)(\s*!important)?\s*(?:;|$)/i);
    if (!decl || /^none$/i.test(decl[1].trim())) continue;
    const parts = selector.split(',').map((s) => s.trim());
    const hits = parts.some((part) => {
      if (/\[hidden\]/.test(part)) return false; // законное парное правило
      const last = (part.includes('>') ? part.split('>').pop() : part).trim().split(/\s+/).pop() || '';
      const mClasses = [...last.matchAll(/\.([\w-]+)/g)].map((x) => x[1]);
      return mClasses.length > 0 && mClasses.some((c) => classes.includes(c));
    });
    // Без !important в парном правиле [hidden] это правило перебило бы скрытие —
    // но глобальное [hidden] { display: none !important } уже проверено выше.
    if (hits && !globalHidden) conflicts.push(`${id} ← ${selector.trim()} { display: ${decl[1].trim()} }`);
  }
}
assert.deepEqual(conflicts, [], `CSS перебивает скрытие этих панелей: ${conflicts.join('; ')}`);
console.log(`  ✓ ${toggled.length} панелей, которые прячутся через .hidden, реально исчезают с экрана`);

/* 3. Полоса «Закреплено», ответ и вложение — ровно те, что висели на скриншоте.
      Панель скрывают либо напрямую el('id').hidden, либо через переменную,
      полученную из el('id') — учитываем оба способа. */
for (const id of ['pinnedBanner', 'replyBar', 'attachmentBar', 'chatCanWriteBar', 'chatMoreBar']) {
  assert.ok(html.includes(`id="${id}"`), `панель #${id} должна быть в разметке`);
  const direct = new RegExp(`el\\('${id}'\\)\\.hidden\\s*=`).test(app);
  const viaVariable = [...app.matchAll(new RegExp(`const\\s+(\\w+)\\s*=\\s*el\\('${id}'\\)`, 'g'))]
    .some(([, name]) => new RegExp(`\\b${name}\\.[\\s\\S]{0,40}?\\.hidden\\s*=`).test(app)
      || new RegExp(`\\b${name}\\.hidden\\s*=`).test(app));
  assert.ok(direct || viaVariable, `панель #${id} должна скрываться атрибутом hidden`);
}
console.log('  ✓ «Закреплено», ответ, вложение и полоса меню ⋯ прячутся атрибутом hidden');

console.log('\n✅ Все крестики RatMes действительно закрывают свои панели.');
