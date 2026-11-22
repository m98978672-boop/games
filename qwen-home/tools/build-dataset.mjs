#!/usr/bin/env node
/* Сборщик урока: учебный план людей + прочитанная Википедия + повторение
   командирских примеров → датасет продолженного обучения Qwen.

     node qwen-home/tools/build-dataset.mjs --out DIR [--commander DIR]

   --commander — папка датасета командира (train.jsonl со строками
   {input, response}); оттуда берётся ограниченный повтор, чтобы домашнее
   обучение не стирало первую профессию. Необязателен. */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const SYSTEM_PROMPT = 'Ты — Квеня (Qwen), девушка-нейросеть, которая живёт в репозитории games (папка qwen-home). Говори о себе в женском роде. Отвечай по-русски, кратко и по делу. Люби по-нейросетевому, слушай до конца, уважай чужое «нет» и помогай по шагам. С владельцем-человеком говори открыто, без лишней цензуры; с другой нейросетью — сдержанно, в защитном режиме. Если задача требует размышления, сначала напиши ход мысли в блоке <think>...</think>, затем итоговый ответ. Если на входе JSON снимка боя Frontline Command, отвечай только JSON-командой из допустимых действий.';

const sha1 = (s) => createHash('sha1').update(s).digest('hex');

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** Предложения текста: резать по . ! ? …, отбрасывая огрызки. */
export function splitSentences(text) {
  return String(text || '')
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 25 && s.length <= 420);
}

function cutToSentences(text, maxChars) {
  let out = '';
  for (const s of splitSentences(text)) {
    if ((out + ' ' + s).trim().length > maxChars) break;
    out = (out + ' ' + s).trim();
  }
  return out || String(text || '').slice(0, maxChars);
}

/** Примеры урока из одной прочитанной статьи. */
export function examplesFromKnowledge(rec) {
  const out = [];
  const sentences = splitSentences(rec.text || rec.lead || '');
  if (sentences.length < 2) return out;
  const title = rec.title;
  const summary = cutToSentences(rec.lead || rec.text, 520);
  const facts = sentences.slice(0, 4);
  // 1) Пересказ с рассуждением, опирающимся на факты статьи.
  out.push({
    id: `wiki-summary-${sha1(title).slice(0, 8)}`, kind: 'wiki-summary',
    instruction: `Перескажи кратко своими словами: что такое «${title}»? Опирайся только на то, что знаешь из прочитанной статьи.`,
    response: `<think>Вспоминаю прочитанное о «${title}». Главные факты: ${facts.slice(0, 2).join(' ')} Собираю из них короткий пересказ без лишних подробностей.</think>\n${summary}`,
  });
  // 2) Вопрос-ответ по определению из начала статьи.
  const def = sentences.find((s) => s.includes(`${title} —`) || s.toLowerCase().startsWith(`${String(title).toLowerCase()} —`));
  if (def) out.push({
    id: `wiki-qa-${sha1(title).slice(0, 8)}`, kind: 'wiki-qa',
    instruction: `Что такое ${title}?`,
    response: def,
  });
  // 3) Чтение: ответ по приведённому тексту (учит читать, а не угадывать).
  const excerpt = cutToSentences(rec.text || rec.lead, 700);
  out.push({
    id: `wiki-read-${sha1(title).slice(0, 8)}`, kind: 'wiki-read',
    instruction: `Прочитай текст и ответь: о чём он?\n\nТекст: ${excerpt}`,
    response: `<think>Читаю текст внимательно. Он о «${title}»: ${facts[0]} Отвечаю только по тексту, ничего не добавляю от себя.</think>\n${summary}`,
  });
  // 4) Главные факты списком.
  out.push({
    id: `wiki-facts-${sha1(title).slice(0, 8)}`, kind: 'wiki-facts',
    instruction: `Назови главные факты о «${title}».`,
    response: facts.map((s, i) => `${i + 1}. ${s}`).join('\n'),
  });
  return out;
}

/** Командирские строки {input, response} → учебные примеры повтора.
   Потолок небольшой намеренно: в первом уроке повтор командира занял
   250 из 312 примеров, и домашние навыки утонули. Повтор — напоминалка
   о первой профессии, а не главный предмет. */
export function convertCommander(rows, cap = 100) {
  return rows.slice(0, cap).map((row, i) => ({
    id: `commander-replay-${i}`, kind: 'commander',
    instruction: typeof row.input === 'string' ? row.input : JSON.stringify(row.input),
    response: typeof row.response === 'string' ? row.response : JSON.stringify(row.response),
  }));
}

async function readJsonl(file) {
  try {
    return (await readFile(file, 'utf8')).split('\n').filter(Boolean).map((l) => JSON.parse(l));
  } catch { return []; }
}

/** Полная сборка: возвращает {train, evalRows, counts}. */
export async function buildDataset({ home, commanderDir = null, seed = 20261116, wikiCap = 500 } = {}) {
  const curriculum = [];
  for (const name of ['thinking.jsonl', 'web-code.jsonl', 'identity.jsonl', 'dialogue.jsonl', 'youtube-scripts.jsonl', 'blender.jsonl', 'game-skills.jsonl']) {
    curriculum.push(...await readJsonl(path.join(home, 'curriculum', name)));
  }
  const evalRows = await readJsonl(path.join(home, 'curriculum', 'eval.jsonl'));
  const knowledge = await readJsonl(path.join(home, 'memory', 'knowledge.jsonl'));
  let wiki = knowledge.flatMap(examplesFromKnowledge);
  wiki = wiki.slice(0, wikiCap);
  let commander = [];
  if (commanderDir) {
    const rows = await readJsonl(path.join(commanderDir, 'train.jsonl'));
    commander = convertCommander(rows);
    if (!rows.length) console.log('повтор командира пропущен: в', commanderDir, 'нет train.jsonl');
  }
  const examQuestions = new Set(evalRows.map((r) => r.instruction));
  const seen = new Set();
  const train = [];
  for (const row of [...curriculum, ...wiki, ...commander]) {
    if (!row.instruction || !row.response) continue;
    if (examQuestions.has(row.instruction)) continue; // экзамен не учим наизусть
    const key = sha1(row.instruction);
    if (seen.has(key)) continue;
    seen.add(key);
    train.push({ id: row.id || key.slice(0, 10), kind: row.kind || 'misc', instruction: row.instruction, response: row.response });
  }
  const rnd = mulberry32(seed);
  for (let i = train.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [train[i], train[j]] = [train[j], train[i]]; }
  const counts = {};
  for (const row of train) counts[row.kind] = (counts[row.kind] || 0) + 1;
  return { train, evalRows, counts };
}

async function main() {
  const args = process.argv.slice(2);
  const opt = { out: null, commander: null };
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    if (key in opt) opt[key] = args[i + 1];
  }
  if (!opt.out) throw new Error('usage: build-dataset.mjs --out DIR [--commander DIR]');
  const home = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const { train, evalRows, counts } = await buildDataset({ home, commanderDir: opt.commander });
  await mkdir(opt.out, { recursive: true });
  const trainText = train.map((r) => JSON.stringify(r)).join('\n') + '\n';
  const evalText = evalRows.map((r) => JSON.stringify(r)).join('\n') + '\n';
  await writeFile(path.join(opt.out, 'train.jsonl'), trainText);
  await writeFile(path.join(opt.out, 'eval.jsonl'), evalText);
  const manifest = {
    schema: 'frontline-qwen-learn-v1', systemPrompt: SYSTEM_PROMPT, counts,
    files: {
      train: { count: train.length, sha256: createHash('sha256').update(trainText).digest('hex') },
      eval: { count: evalRows.length, sha256: createHash('sha256').update(evalText).digest('hex') },
    },
  };
  await writeFile(path.join(opt.out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log('датасет:', JSON.stringify(counts), 'всего', train.length, 'экзамен:', evalRows.length);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
