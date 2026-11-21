#!/usr/bin/env node
/* Сборщик чтения: тянет статьи Википедии и складывает в память дома.

   Запуск (нужен интернет, поэтому живёт в GitHub Actions):
     node qwen-home/tools/collect-wikipedia.mjs \
       --topics qwen-home/topics.txt --random 12 \
       --out qwen-home/memory/knowledge.jsonl

   Читать разрешено только Википедию. Повторно прочитанная статья
   обновляет запись, память не растёт бесконечно (потолок записей). */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const UA = 'GamesRepoQwenLearner/1.0 (self-learning research; contact: repo owner)';

/** Чистый смысл предложения: обрезать пробелы и мусорные хвосты разметки. */
export function cleanText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/\[\d+\]/g, '')
    .trim();
}

/** Слияние памяти: свежие записи заменяют старые по (lang, title). */
export function mergeKnowledge(existing, fresh, cap = 300) {
  const byKey = new Map();
  for (const rec of existing) byKey.set(`${rec.lang}::${rec.title}`, rec);
  for (const rec of fresh) byKey.set(`${rec.lang}::${rec.title}`, rec);
  const all = [...byKey.values()].sort((a, b) => String(b.fetchedAt).localeCompare(String(a.fetchedAt)));
  return all.slice(0, cap);
}

async function wikiQuery(lang, params) {
  const url = new URL(`https://${lang}.wikipedia.org/w/api.php`);
  for (const [k, v] of Object.entries({ format: 'json', formatversion: '2', redirects: '1', ...params })) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Wikipedia HTTP ${res.status} for ${url}`);
  return res.json();
}

function toRecord(page, lang, maxChars) {
  const text = cleanText(page.extract || '');
  if (!page.title || text.length < 200) return null;
  return {
    title: page.title,
    lang,
    url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
    fetchedAt: new Date().toISOString().slice(0, 10),
    source: 'wikipedia',
    lead: text.slice(0, 900),
    text: text.slice(0, maxChars),
  };
}

export async function fetchTopic(title, lang = 'ru', maxChars = 12000) {
  const data = await wikiQuery(lang, { action: 'query', prop: 'extracts', explaintext: '1', titles: title });
  const page = data?.query?.pages?.[0];
  return page && !page.missing ? toRecord(page, lang, maxChars) : null;
}

export async function fetchRandom(count, lang = 'ru', maxChars = 12000) {
  const data = await wikiQuery(lang, {
    action: 'query', generator: 'random', grnnamespace: '0', grnlimit: String(Math.min(20, count)),
    prop: 'extracts', explaintext: '1',
  });
  return (data?.query?.pages || []).map((p) => toRecord(p, lang, maxChars)).filter(Boolean).slice(0, count);
}

async function main() {
  const args = process.argv.slice(2);
  const opt = { topics: null, random: 0, lang: 'ru', out: null, maxChars: 12000 };
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    if (key in opt) opt[key] = key === 'random' || key === 'maxChars' ? parseInt(args[i + 1], 10) : args[i + 1];
  }
  if (!opt.out) throw new Error('usage: collect-wikipedia.mjs --out knowledge.jsonl [--topics topics.txt] [--random N] [--lang ru]');
  let existing = [];
  try { existing = (await readFile(opt.out, 'utf8')).split('\n').filter(Boolean).map((l) => JSON.parse(l)); }
  catch { /* памяти ещё нет — начнём с чистой */ }
  const fresh = [];
  if (opt.topics) {
    const titles = (await readFile(opt.topics, 'utf8')).split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#'));
    for (const title of titles) {
      try {
        const rec = await fetchTopic(title, opt.lang, opt.maxChars);
        if (rec) { fresh.push(rec); console.log('прочитано:', rec.title); }
        else console.log('не нашлось или слишком коротко:', title);
      } catch (err) { console.log('пропущено:', title, '-', err.message); }
    }
  }
  if (opt.random > 0) {
    const recs = await fetchRandom(opt.random, opt.lang, opt.maxChars);
    fresh.push(...recs);
    console.log('случайных статей:', recs.length);
  }
  const merged = mergeKnowledge(existing, fresh);
  await writeFile(opt.out, merged.map((r) => JSON.stringify(r)).join('\n') + '\n');
  console.log(`память: ${merged.length} статей (новых/обновлено: ${fresh.length})`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
