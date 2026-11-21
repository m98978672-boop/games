#!/usr/bin/env node
/* Проверка дома Qwen без интернета и без модели: учебный план валиден,
   сборщики честны, тренер не разъехался с командирским по базе.

     node qwen-home/tests/learn.mjs   */
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { mergeKnowledge } from '../tools/collect-wikipedia.mjs';
import { buildDataset, convertCommander, examplesFromKnowledge, SYSTEM_PROMPT } from '../tools/build-dataset.mjs';
import { scoreOutputs } from '../tools/score-learn.mjs';
import { logEntry, nextState } from '../tools/update-memory.mjs';

const home = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let passed = 0;
function check(name, ok, detail = '') {
  if (ok) { passed++; console.log('  ✓', name); }
  else { console.log('  ✗', name, detail); process.exitCode = 1; }
}
const readJsonl = async (p) => (await readFile(p, 'utf8')).split('\n').filter(Boolean).map((l) => JSON.parse(l));

/* ---------- учебный план ---------- */
const thinking = await readJsonl(path.join(home, 'curriculum', 'thinking.jsonl'));
const web = await readJsonl(path.join(home, 'curriculum', 'web-code.jsonl'));
const identity = await readJsonl(path.join(home, 'curriculum', 'identity.jsonl'));
const evalRows = await readJsonl(path.join(home, 'curriculum', 'eval.jsonl'));
const dialogue = await readJsonl(path.join(home, 'curriculum', 'dialogue.jsonl'));
const all = [...thinking, ...web, ...identity, ...dialogue];
check('учебный план непуст: мышление, веб и самоописание на месте', thinking.length >= 8 && web.length >= 10 && identity.length >= 5);
check('каждый урок: id, kind, непустые instruction и response', all.every((r) => r.id && r.kind && r.instruction?.length > 3 && r.response?.length > 3));
check('идентификаторы уроков не повторяются', new Set(all.map((r) => r.id)).size === all.length);
check('уроки мышления учат формату <think>…</think>', thinking.every((r) => r.response.includes('<think>') && r.response.includes('</think>')));
check('уроки веб-кода содержат законченные блоки кода', web.every((r) => (r.response.match(/```/g) || []).length >= 2));
check('самоописание честное: дом — репозиторий, модель маленькая', identity.some((r) => r.response.includes('репозитори')) && identity.some((r) => /маленьк|0\.8B/.test(r.response)));
check('экзамен: у каждого вопроса есть обязательные слова', evalRows.length >= 14 && evalRows.every((r) => r.id && r.instruction && Array.isArray(r.mustContain) && r.mustContain.length >= 1));
check('экзамен отличает домашнее обучение: факты дома, формат мышления, JSON командира', ['eval-home-folder', 'eval-release', 'eval-topics', 'eval-gate'].every((id) => evalRows.some((r) => r.id === id)) && evalRows.some((r) => r.mustFormat === 'think') && evalRows.some((r) => r.mustFormat === 'json'));
check('уроки самоописания покрывают факты экзамена: релиз, ворота, темы, память', identity.some((r) => r.response.includes('frontline-qwen-home')) && identity.some((r) => r.response.includes('не публикуется')) && identity.some((r) => r.response.includes('topics.txt')) && identity.some((r) => r.response.includes('knowledge.jsonl')));
check('разговорные уроки: Квеня здоровается, говорит о себе в женском роде и не притворяется человеком', dialogue.length >= 10 && dialogue.some((r) => r.response.includes('Квеня')) && dialogue.some((r) => r.response.includes('девушка')) && dialogue.some((r) => /рада|прочитала|сделала/.test(r.response)) && dialogue.some((r) => r.response.includes('нейросеть')));
check('экзамен зовёт её Квеней и спрашивает про женский род', evalRows.some((r) => r.id === 'eval-name' && r.mustContain.includes('квен')) && evalRows.some((r) => r.id === 'eval-persona' && r.mustContain.includes('девушк')));

/* ---------- примеры из Википедии (фикстура) ---------- */
const article = {
  title: 'HTML', lang: 'ru', url: 'https://ru.wikipedia.org/wiki/HTML', fetchedAt: '2026-11-16', source: 'wikipedia',
  lead: 'HTML — стандартизированный язык разметки документов для просмотра веб-страниц в браузере. HTML-документ состоит из элементов, которые задаются тегами. Браузер читает HTML и рисует страницу на экране.',
  text: 'HTML — стандартизированный язык разметки документов для просмотра веб-страниц в браузере. HTML-документ состоит из элементов, которые задаются тегами. Браузер читает HTML и рисует страницу на экране. Элементы могут содержать текст, ссылки, изображения и формы. Первая версия HTML появилась в 1993 году.',
};
const wikiExamples = examplesFromKnowledge(article);
const kinds = new Set(wikiExamples.map((e) => e.kind));
check('статья превращается в урок: пересказ, определение, чтение, факты', ['wiki-summary', 'wiki-qa', 'wiki-read', 'wiki-facts'].every((k) => kinds.has(k)), [...kinds].join(','));
check('ответ на «Что такое HTML?» берётся из статьи, а не из воздуха', wikiExamples.find((e) => e.kind === 'wiki-qa')?.response.includes('язык разметки'));
check('урок чтения несёт сам текст и рассуждение по нему', wikiExamples.find((e) => e.kind === 'wiki-read')?.instruction.includes('Текст:') && wikiExamples.find((e) => e.kind === 'wiki-read')?.response.includes('<think>'));

/* ---------- память: слияние без дублей и без роста в бесконечность ---------- */
const merged = mergeKnowledge(
  [{ title: 'HTML', lang: 'ru', fetchedAt: '2026-11-01', lead: 'старое', text: 'старое' }],
  [{ title: 'HTML', lang: 'ru', fetchedAt: '2026-11-16', lead: 'новое', text: 'новое' }],
);
check('повторное чтение обновляет запись, а не плодит дубли', merged.length === 1 && merged[0].lead === 'новое');

/* ---------- сборка датасета ---------- */
const tmp = await mkdtemp(path.join(tmpdir(), 'qwen-home-'));
await writeFile(path.join(tmp, 'train.jsonl'), JSON.stringify({ seed: 1, input: { squads: [] }, response: '{"action":"hold"}' }) + '\n');
const { train, evalRows: dsEval, counts } = await buildDataset({ home, commanderDir: tmp });
check('датасет собран: учебный план + Википедия + повтор командира', counts.thinking >= 8 && counts.web >= 10 && counts.commander === 1, JSON.stringify(counts));
check('экзамен не попадает в обучение', dsEval.length === evalRows.length && !train.some((r) => evalRows.some((e) => e.instruction === r.instruction)));
check('в датасете нет дублей по вопросу', new Set(train.map((r) => r.instruction)).size === train.length);
check('командирский повтор: JSON-вопрос и JSON-ответ сохранены', convertCommander([{ input: { a: 1 }, response: '{"action":"none"}' }])[0].response === '{"action":"none"}');
check('системная подсказка единая и говорит про дом', SYSTEM_PROMPT.includes('qwen-home') && SYSTEM_PROMPT.includes('<think>'));

/* ---------- экзаменатор ---------- */
const scores = scoreOutputs([
  { id: 'a', mustContain: ['html', 'разметк'], base: 'HTML — язык разметки', adapter: 'Не знаю' },
  { id: 'b', mustContain: ['12'], base: 'Будет 10', adapter: '<think>7+5</think>\nСтало 12' },
  { id: 'c', mustContain: ['5'], mustFormat: 'think', base: 'Осталось 5', adapter: '<think>9-4</think>\nОсталось 5' },
  { id: 'd', mustContain: ['"action"'], mustFormat: 'json', base: 'Думаю, надо снабдить отряд', adapter: '{"action":"supply","squad":0}' },
]);
check('баллы считаются честно, формат — часть балла: база 1/4, адаптер 3/4', scores.base.passed === 1 && scores.adapter.passed === 3 && scores.base.total === 4 && scores.adapter.total === 4);

/* ---------- дневник и состояние ---------- */
const st0 = JSON.parse(await readFile(path.join(home, 'state.json'), 'utf8'));
const st1 = nextState(st0, { date: '2026-11-17', steps: 40, published: true, scores: { adapter: { passed: 3, total: 10 } } });
check('состояние: опубликованный прогон прибавляет шаги и номер прогона', st1.totalSteps === st0.totalSteps + 40 && st1.learnRuns === st0.learnRuns + 1 && st1.adapterRelease === 'frontline-qwen-home');
const st2 = nextState(st0, { date: '2026-11-17', steps: 40, published: false, scores: null });
check('неопубликованный прогон шаги в зачёт не добавляет', st2.totalSteps === st0.totalSteps && st2.learnRuns === st0.learnRuns + 1);
const entry = logEntry({ date: '2026-11-17', runNo: 1, report: { training: { steps: 40 }, dataset_counts: { web: 14 } }, scores: { adapter: { passed: 3, total: 10 } }, published: false, runUrl: 'https://example.invalid/run' });
check('запись дневника содержит шаги, экзамен и честную публикацию', entry.includes('40') && entry.includes('3/10') && entry.includes('нет'));

/* ---------- тренер не разъехался с командирским ---------- */
const trainLearn = await readFile(path.join(home, 'tools', 'train-learn.py'), 'utf8');
const trainQwen = await readFile(path.join(home, '..', 'frontline-command', 'tools', 'training', 'train-qwen.py'), 'utf8');
const pin = (src, name) => src.match(new RegExp(`${name} = '([^']+)'`))?.[1];
check('база и ревизия тренера совпадают с командирским обучением', pin(trainLearn, 'MODEL') === pin(trainQwen, 'MODEL') && pin(trainLearn, 'REVISION') === pin(trainQwen, 'REVISION'));
check('продолжение обучения грузит адаптер обучаемым (is_trainable), а не замороженным', trainLearn.includes('is_trainable=True'));
check('состояние дома называет ту же базу и ревизию', st0.baseModel === pin(trainLearn, 'MODEL') && st0.revision === pin(trainLearn, 'REVISION'));
check('в состоянии записана персона: Квеня, девушка', st0.name === 'Квеня' && st0.persona?.gender === 'female');

/* ---------- она умеет искать в интернете (Википедия) ---------- */
const talkGen = await readFile(path.join(home, 'tools', 'talk-generate.py'), 'utf8');
const personaMd = await readFile(path.join(home, 'talk', 'persona.md'), 'utf8');
check('генератор разговора ищет в русской Википедии и пишет журнал', talkGen.includes('ru.wikipedia.org/w/api.php') && talkGen.includes('search_wikipedia') && talkGen.includes('search-log.md') && talkGen.includes("'exlimit': 'max'") && talkGen.includes('СВОИМИ СЛОВАМИ'));
check('генератор сначала решает, нужен ли поиск, и не подделывает ответ', talkGen.includes('decide_search') && talkGen.includes('ПОИСК') && talkGen.includes('forced_query'));
check('уроки учат искать: поискала, назвала статью, честно сказала, когда пусто', dialogue.filter((r) => /Википеди/.test(r.response)).length >= 4 && dialogue.some((r) => r.response.includes('Поискала')) && dialogue.some((r) => /только Википедия|только статьи Википедии/.test(r.response)));
check('персона и состояние честно называют границу поиска: только Википедия', personaMd.includes('Википедии') && st0.internetSearch?.engine === 'ru.wikipedia.org');

console.log(`\nДом Qwen: ${passed} проверок пройдено${process.exitCode ? ' (есть провалы)' : ''}.`);
process.exit(process.exitCode || 0);
