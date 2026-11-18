#!/usr/bin/env node
/* СТРАЖ АТРИБУТА hidden — «крестики, которые ничего не закрывают».

   Настоящая причина поломки: если у панели есть собственное правило display
   (.reply-bar { display: flex }), авторское правило перебивает браузерный
   атрибут hidden — панель остаётся на экране после закрытия. Пользователь
   видит «закрыл — ничего не закрылось», хотя ✕ сработал.

   Проверяем каскад так же, как браузер: для каждого элемента с атрибутом
   hidden ищем, какое авторское правило display победит по !important,
   специфичности и порядку. Если побеждает не none — элемент не скрыть.

   Запуск: node tools/tests/hidden-attribute.mjs [раздел ...]
   (без аргументов — все разделы репозитория с index.html) */

import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/* Разбор CSS: правила верхнего уровня и внутри @media/@supports/@layer. */
function parseRules(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  let i = 0;
  let order = 0;
  while (i < clean.length) {
    const open = clean.indexOf('{', i);
    if (open < 0) break;
    const sel = clean.slice(i, open).trim();
    let depth = 1;
    let j = open + 1;
    while (j < clean.length && depth > 0) {
      if (clean[j] === '{') depth += 1;
      else if (clean[j] === '}') depth -= 1;
      j += 1;
    }
    const body = clean.slice(open + 1, j - 1);
    if (/^@(media|supports|layer|container)/i.test(sel)) {
      const nested = parseRules(body);
      for (const rule of nested) out.push({ ...rule, order: order++ });
    } else if (sel && !sel.startsWith('@')) {
      out.push({ sel: sel.replace(/\s+/g, ' '), body, order: order++ });
    }
    i = j;
  }
  return out;
}

/* Последний составной селектор правила — он и решает, к чему применится display. */
function lastCompound(selector) {
  const tail = selector.includes('>') ? selector.split('>').pop() : selector;
  return tail.trim().split(/\s+/).pop() || '';
}

/* Подходит ли составной селектор к элементу. Все проверяемые элементы имеют
   атрибут hidden, поэтому селектор [hidden] подходит всегда. */
function compoundMatches(compound, element) {
  if (compound === '*' || compound === '') return false;
  const mId = compound.match(/#([\w-]+)/);
  if (mId && mId[1] !== element.id) return false;
  const mClasses = [...compound.matchAll(/\.([\w-]+)/g)].map((x) => x[1]);
  if (mClasses.some((c) => !element.classes.includes(c))) return false;
  const mAttrs = [...compound.matchAll(/\[([\w-]+)/g)].map((x) => x[1]);
  if (mAttrs.some((a) => a !== 'hidden')) return false;
  const mTag = compound.replace(/#[\w-]+|\.[\w-]+|\[[^\]]*\]|:{1,2}[\w-]+(\([^)]*\))?/g, '').trim();
  if (mTag && mTag !== element.tag) return false;
  return Boolean(mId || mClasses.length || mAttrs.length || mTag);
}

/* Собираем весь CSS, который реально грузит страница: <link>, <style> и @import. */
async function stylesheetOf(dir) {
  const html = await readFile(path.join(dir, 'index.html'), 'utf8');
  const links = [...html.matchAll(/<link[^>]+href="([^"]+\.css[^"]*)"/gi)]
    .map((m) => m[1])
    .filter((href) => !/^https?:/i.test(href));
  let css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n');
  const seen = new Set();
  const load = async (file) => {
    if (!existsSync(file) || seen.has(file)) return;
    seen.add(file);
    const text = await readFile(file, 'utf8');
    css += `\n${text}`;
    for (const m of text.matchAll(/@import\s+(?:url\()?['"]?([^'")\s]+)/g)) {
      await load(path.resolve(path.dirname(file), m[1].split('?')[0]));
    }
  };
  for (const href of links) await load(path.resolve(dir, href.split('?')[0]));
  return { html, css };
}

/* Каскад: !important → специфичность → порядок. Возвращает победившее правило display. */
function winningDisplay(rules, { id, classes }) {
  let winner = null;
  for (const rule of rules) {
    const decl = rule.body.match(/display\s*:\s*([^;}]+?)(\s*!important)?\s*(?:;|$)/i);
    if (!decl) continue;
    for (const part of rule.sel.split(',').map((s) => s.trim())) {
      const last = lastCompound(part);
      if (!compoundMatches(last, { id, classes })) continue;
      const candidate = {
        important: Boolean(decl[2]),
        specificity: (last.match(/#[\w-]+/g) || []).length * 100
          + (last.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g) || []).length * 10,
        order: rule.order,
        value: decl[1].trim(),
        sel: part,
      };
      if (!winner
        || Number(candidate.important) > Number(winner.important)
        || (candidate.important === winner.important && candidate.specificity > winner.specificity)
        || (candidate.important === winner.important
          && candidate.specificity === winner.specificity
          && candidate.order >= winner.order)) {
        winner = candidate;
      }
    }
  }
  return winner;
}

/* Элементы разметки с настоящим атрибутом hidden (а не с классом «hidden»). */
function hiddenElements(html) {
  return [...html.matchAll(/<([a-zA-Z][\w-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g)]
    .filter(([, , attrs]) => /(^|\s)hidden(\s|=|$)/.test(attrs))
    .map(([, tag, attrs]) => ({
      tag: tag.toLowerCase(),
      id: (attrs.match(/\bid="([^"]+)"/) || [])[1] || '',
      classes: ((attrs.match(/\bclass="([^"]+)"/) || [])[1] || '').split(/\s+/).filter(Boolean),
    }));
}

async function sections() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  if (args.length) return args;
  const found = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    if (existsSync(path.join(root, entry.name, 'index.html'))) found.push(entry.name);
  }
  return found.sort();
}

const failures = [];
let checked = 0;

for (const name of await sections()) {
  const dir = path.join(root, name);
  if (!existsSync(path.join(dir, 'index.html'))) continue;
  const { html, css } = await stylesheetOf(dir);
  if (!css.trim()) continue;
  const rules = parseRules(css);
  for (const element of hiddenElements(html)) {
    checked += 1;
    const winner = winningDisplay(rules, element);
    // Правило не найдено — работает браузерный атрибут hidden, элемент скрыт.
    if (!winner || /^none$/i.test(winner.value)) continue;
    failures.push({ section: name, element: element.id || element.tag, ...winner });
  }
}

if (failures.length) {
  console.error('❌ Атрибут hidden не скрывает эти элементы — их ✕ выглядят «мёртвыми»:');
  for (const f of failures) {
    console.error(`   ${f.section} · #${f.element}  ←  ${f.sel} { display: ${f.value} }`);
  }
  console.error('\nЛечение (любое из трёх):');
  console.error('   1) добавить в CSS раздела   [hidden] { display: none !important; }');
  console.error('   2) дописать парное правило  .класс[hidden] { display: none }');
  console.error('   3) убрать display у самого класса и задавать его другим способом');
  process.exit(1);
}

console.log(`✅ Атрибут hidden скрывает все ${checked} проверенных элементов во всех разделах.`);
