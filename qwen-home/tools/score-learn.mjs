#!/usr/bin/env node
/* Экзаменатор: считает, на сколько контрольных вопросов модель ответила
   по существу (все обязательные слова есть в ответе, без учёта регистра).

     node qwen-home/tools/score-learn.mjs GENERATED.json

   Дописывает баллы в тот же файл и печатает JSON одной строкой. */
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const LEGAL_ACTIONS = new Set(['none', 'supply', 'build', 'hold']);

/** Формат ответа: think — блок рассуждения; json — команда командира. */
export function formatOk(output, format) {
  const text = String(output || '').trim();
  if (format === 'think') return /<think>[\s\S]*<\/think>/.test(text);
  if (format === 'json') {
    try {
      const parsed = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ''));
      return LEGAL_ACTIONS.has(parsed.action);
    } catch { return false; }
  }
  return true;
}

export function scoreOutputs(results) {
  const models = {};
  for (const name of ['base', 'adapter']) {
    if (!results.some((r) => typeof r[name] === 'string')) continue;
    let passed = 0;
    for (const row of results) {
      const raw = String(row[name] || '');
      const out = raw.toLowerCase();
      const ok = (row.mustContain || []).every((word) => out.includes(String(word).toLowerCase()))
        && formatOk(raw, row.mustFormat);
      if (ok) passed++;
    }
    models[name] = { passed, total: results.length };
  }
  return models;
}

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error('usage: node score-learn.mjs GENERATED.json');
  const doc = JSON.parse(await readFile(file, 'utf8'));
  doc.scores = scoreOutputs(doc.results);
  await writeFile(file, JSON.stringify(doc, null, 2) + '\n');
  console.log(JSON.stringify(doc.scores));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
