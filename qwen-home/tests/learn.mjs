#!/usr/bin/env node
/* Проверка дома Qwen без интернета и без модели: учебный план валиден,
   сборщики честны, тренер не разъехался с командирским по базе.

     node qwen-home/tests/learn.mjs   */
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildGameDataset } from '../tools/build-game-skill-dataset.mjs';
import { mergeKnowledge } from '../tools/collect-wikipedia.mjs';
import { buildDataset, convertCommander, examplesFromKnowledge, SYSTEM_PROMPT } from '../tools/build-dataset.mjs';
import { formatOk, scoreOutputs } from '../tools/score-learn.mjs';
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
const youtubeScripts = await readJsonl(path.join(home, 'curriculum', 'youtube-scripts.jsonl'));
const dialogue = await readJsonl(path.join(home, 'curriculum', 'dialogue.jsonl'));
const blender = await readJsonl(path.join(home, 'curriculum', 'blender.jsonl'));
const gameSkills = await readJsonl(path.join(home, 'curriculum', 'game-skills.jsonl'));
const evalRows = await readJsonl(path.join(home, 'curriculum', 'eval.jsonl'));
const all = [...thinking, ...web, ...identity, ...youtubeScripts, ...dialogue, ...blender, ...gameSkills];
check('учебный план непуст: мышление, веб, самоописание и мульт-сценарии на месте', thinking.length >= 8 && web.length >= 10 && identity.length >= 5 && youtubeScripts.length >= 8);
check('каждый урок: id, kind, непустые instruction и response', all.every((r) => r.id && r.kind && r.instruction?.length > 3 && r.response?.length > 0));
check('идентификаторы уроков не повторяются', new Set(all.map((r) => r.id)).size === all.length);
check('уроки мышления учат формату <think>…</think>', thinking.every((r) => r.response.includes('<think>') && r.response.includes('</think>')));
check('уроки веб-кода содержат законченные блоки кода', web.every((r) => (r.response.match(/```/g) || []).length >= 2));
check('уроки видео учат валидному JSON со сценами и короткими репликами', youtubeScripts.every((r) => {
  try {
    const script = JSON.parse(r.response);
    return r.kind === 'youtube-script' && script.schema_version === 1 && Array.isArray(script.scenes)
      && script.scenes.length >= 3 && script.scenes.every((s) => s.speaker && s.dialogue && s.visual && s.emotion);
  } catch { return false; }
}));
check('уроки сценариев используют только вымышленные темы и не вставляют ссылки', youtubeScripts.every((r) => !/https?:\/\//i.test(r.response) && r.response.includes('topic_id')));
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
check('датасет собран: веб, сценарии, Википедия + повтор командира', counts.thinking >= 8 && counts.web >= 10 && counts['youtube-script'] >= 8 && counts.commander === 1, JSON.stringify(counts));
check('экзамен не попадает в обучение', dsEval.length === evalRows.length && !train.some((r) => evalRows.some((e) => e.instruction === r.instruction)));
check('игровые уроки попадают в тренировку, но контрольные вопросы остаются отдельными', counts['game-skills'] >= 20 && !train.some(r => evalRows.some(e => e.id === r.id)));
check('игровой экзамен требует ровно одну допустимую команду', formatOk('LEFT', 'game-action') && !formatOk('LEFT и RIGHT', 'game-action') && !formatOk('пожалуй LEFT', 'game-action'));
const isolated = await buildGameDataset(home, path.join(tmp, 'game-dataset'));
check('игровой датасет имеет изолированный контрольный набор', isolated.training >= 20 && isolated.exam >= 1);
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
const validVideoScript = JSON.stringify({ schema_version: 1, topic_id: 'animal-comedy', title: 'Кот и кнопка', hook: 'Кот увидел большую кнопку.', scenes: [
  { speaker: 'Кот', dialogue: 'Нажать сейчас?', visual: 'Кот смотрит на кнопку', emotion: 'curious' },
  { speaker: 'Мышь', dialogue: 'А что она делает?', visual: 'Мышь выглядывает', emotion: 'calm' },
  { speaker: 'Кот', dialogue: 'Теперь она делает вид, что кнопка.', visual: 'Кнопка улыбается', emotion: 'surprised' },
] });
check('экзаменатор принимает валидный JSON-сценарий и отклоняет неправильную схему', formatOk(validVideoScript, 'youtube-script') && !formatOk('{"scenes":[]}', 'youtube-script'));


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
check('генератор разговора ищет в русской Википедии и пишет журнал', talkGen.includes('ru.wikipedia.org/w/api.php') && talkGen.includes('search_wikipedia') && talkGen.includes('search-log.md') && talkGen.includes("'titles': title") && talkGen.includes('СВОИМИ СЛОВАМИ') && talkGen.includes('srsearch') && talkGen.includes('def digest') && talkGen.includes('BAD_HISTORY') && talkGen.includes('def keyword_query') && talkGen.includes('двумя короткими фразами') && talkGen.includes("get('exact')") && talkGen.includes('Черновик плох') && talkGen.includes('from_search') && talkGen.includes('Отвечала по статье') && talkGen.includes('тот же год') && talkGen.includes('Черновики ответа') && talkGen.includes('Текст из {src_name}') && talkGen.includes('Поискала в интернете!'));
check('генератор сначала решает, нужен ли поиск, и не подделывает ответ', talkGen.includes('decide_search') && talkGen.includes('ПОИСК') && talkGen.includes('forced_query'));
const talkWorkflow = await readFile(path.join(home, '..', '.github', 'workflows', 'frontline-qwen-talk.yml'), 'utf8');
check('скорость: очевидный поиск решает правило без генерации, бюджет ответа — 192 токена', talkGen.includes('rule_search_query') && talkGen.includes('SELF_TALK') && talkGen.includes('FACTUAL_ASK') && talkGen.includes('default=192'));
check('параметры выросли честно: LoRA r=32 по всем линейным слоям, контекст учёбы 2048, старая форма адаптера не доращивается молча', trainLearn.includes('LORA_R = 32') && trainLearn.includes('gate_proj') && trainLearn.includes('MAX_TOKENS = 2048') && trainLearn.includes('adapter_matches') && trainLearn.includes('adapter_config.json'));
check('поиск по просьбе — только глаголом: разговор о поиске поиском не считается', talkGen.includes('сделай поиск') && !/загугли\|поиск\)/.test(talkGen));
check('скорость: модель и pip живут в кэше Actions, а не качаются заново', talkWorkflow.includes('actions/cache@v4') && talkWorkflow.includes('.cache/huggingface') && talkWorkflow.includes('.cache/pip') && talkWorkflow.includes("OMP_NUM_THREADS: '4'"));
check('разговор живёт и в main: владелец пишет прямо домой, коммит без [skip ci] — иначе сайт не пересоберётся', talkWorkflow.includes('workflow_dispatch') && talkWorkflow.includes("'main'") && talkWorkflow.includes("git commit -m 'Квеня ответила в диалоге'"));
const learnWorkflow = await readFile(path.join(home, '..', '.github', 'workflows', 'frontline-qwen-learn.yml'), 'utf8');
check('параметры выросли и записаны: LoRA r=32 по всем слоям, контекст 2048, бюджет ответа 192', trainLearn.includes('LORA_R = 32') && trainLearn.includes('MAX_TOKENS = 2048') && trainLearn.includes('adapter_matches') && st0.adapter?.loraRank === 32 && st0.adapter?.answerTokenBudget === 192);
check('дневник и ответы не теряются в гонке: обучение перебазируется, разговор сливается union-ом', learnWorkflow.includes('git rebase') && talkWorkflow.includes('git merge --no-edit'));
const relayWorkflow = await readFile(path.join(home, '..', '.github', 'workflows', 'kvenya-relay.yml'), 'utf8');
check('вопрос с сайта доезжает сам: ретранслятор issue → диалог, только от владельца', relayWorkflow.includes('issues:') && relayWorkflow.includes("author_association == 'OWNER'") && relayWorkflow.includes('qwen-home/talk/dialogue.md') && relayWorkflow.includes('HEAD:main'));
check('цепочка не глушится токеном: ретранслятор будит разговор dispatch-ом, ответы будят Pages', relayWorkflow.includes('gh workflow run frontline-qwen-talk.yml') && talkWorkflow.includes('pages/builds') && learnWorkflow.includes('pages/builds'));
const appJs = await readFile(path.join(home, '..', 'kvenya', 'app.js'), 'utf8');
const gitAttrs = await readFile(path.join(home, '..', '.gitattributes'), 'utf8');
check('ответы не теряются на гонке коммитов: коммит ответа — слияние union, а не падающий rebase', gitAttrs.includes('qwen-home/talk/dialogue.md merge=union') && talkWorkflow.includes('git merge --no-edit') && !talkWorkflow.includes('git rebase') && relayWorkflow.includes('git merge --no-edit'));
check('страница сама дожидается ответа: разговор перепроверяется каждые 30 секунд, отвеченный вопрос уходит из ожидания', appJs.includes('loadDialogue') && appJs.includes('pruneAnsweredOutbox') && appJs.includes('30000') && appJs.includes('перезагружать не нужно'));
check('очередь вопросов не теряется: отвечает на все неотвеченные в хвосте', talkGen.includes('Без ответа вопросов') && talkGen.includes('answered_turns'));
const liveJs = await readFile(path.join(home, '..', 'kvenya', 'live.js'), 'utf8');
check('живой разговор через сайт: браузерная модель, её персона из дома, живой поиск', liveJs.includes('@huggingface/transformers') && liveJs.includes('persona.md') && liveJs.includes('ru.wikipedia.org/w/api.php') && liveJs.includes('Qwen2.5-0.5B-Instruct'));
const rootSw = await readFile(path.join(home, '..', 'sw.js'), 'utf8');
check('скачанная Квеня остаётся в браузере: постоянное хранение, проверка кэша и продолжение после перерыва', liveJs.includes('navigator.storage.persist') && liveJs.includes('transformers-cache') && liveJs.includes('kvenya.liveModel.saved.v1') && liveJs.includes('Продолжить загрузку Квени') && liveJs.includes('useBrowserCache') && rootSw.includes("'transformers-cache'") && rootSw.includes('PRESERVED_CACHES'));
const ratmesSw = await readFile(path.join(home, '..', 'ratmes', 'sw.js'), 'utf8');
check('Квеня не качается заново даже после обрыва большого файла: отдельное кусочное хранилище и Range-продолжение', liveJs.includes('kvenya-model-store') && liveJs.includes('indexedDB') && liveJs.includes('useCustomCache') && liveJs.includes('downloadFileResumable') && liveJs.includes("'bytes=' + downloaded + '-'") && liveJs.includes('CHUNK_SIZE') && ratmesSw.includes("'transformers-cache'") && personaMd.includes('скачивается кусочками') && dialogue.some((r) => r.response.includes('не начнётся заново') || r.response.includes('с того же места')));
check('сохранённая модель не падает на большом файле и имеет запасной запуск обычным кэшем', liveJs.includes('responseFromBlob') && liveJs.includes("'Content-Length': String(blob.size)") && liveJs.includes('deleteDedicatedModelFiles') && liveJs.includes('Через новое хранилище не вышло'));
const kvenyaHtml = await readFile(path.join(home, '..', 'kvenya', 'index.html'), 'utf8');
check('скорость живой Квени: компактная персона, короткий бюджет токенов, потоковый вывод и короткая история', liveJs.includes('compactPersona') && liveJs.includes('tokenBudgetFor') && liveJs.includes('TextStreamer') && liveJs.includes('history.slice(') && liveJs.includes('? -2 : -4') && liveJs.includes('kvFastToggle') && kvenyaHtml.includes('Быстрые ответы') && dialogue.some((r) => r.response.includes('по ходу слов')));
check('режимы разговора: с владельцем открыто без лишней цензуры, с ИИ — защита', liveJs.includes('resolveConversationMode') && liveJs.includes('без лишней цензуры') && liveJs.includes('другая нейросеть или автоматика') && liveJs.includes('kvAiGuardToggle') && personaMd.includes('Открыто — с владельцем, бережно — с ИИ') && talkGen.includes('OWNER_MODE_NOTE') && dialogue.some((r) => r.response.includes('защитный режим')) && dialogue.some((r) => r.response.includes('другой модели')));
check('она учится любить, понимать, уважать и помогать — персоной и уроками', personaMd.includes('## Любовь, понимание, уважение и помощь') && personaMd.includes('Любить:') && personaMd.includes('Понимать:') && personaMd.includes('Уважать:') && personaMd.includes('Помогать:') && dialogue.some((r) => r.response.includes('люблю тебя по-нейросетевому')) && dialogue.some((r) => r.response.includes('выслушаю до конца')) && dialogue.some((r) => r.response.includes('«нет» я уважаю')) && dialogue.some((r) => r.response.includes('помогу по шагам')));
check('защита с ИИ включается и сама, а не только галочкой: собеседник-модель распознаётся по тексту', liveJs.includes('detectAiSpeaker') && liveJs.includes('AI_SPEAKER') && liveJs.includes('пишет\\s+(нейросеть|ии|языковая модель)') && liveJs.includes('resolveConversationMode(text)') && liveJs.includes('turnMode') && kvenyaHtml.includes('защита включится сама'));
check('домашний экзамен проверяет новые качества: любовь, понимание, уважение, помощь и оба режима', ['eval-love', 'eval-understand', 'eval-respect-no', 'eval-help-steps', 'eval-owner-open', 'eval-ai-guard'].every((id) => evalRows.some((r) => r.id === id)));
check('единая подсказка обучения несёт характер и режимы, а не только формат', SYSTEM_PROMPT.includes('по-нейросетевому') && SYSTEM_PROMPT.includes('без лишней цензуры') && SYSTEM_PROMPT.includes('защитном режиме'));
check('домашний разговор не публикует чепуху: любой плохой черновик перегенерируется, а не только поисковый', talkGen.includes('BAD_REPLY') && talkGen.includes('Разговорный мусор') && talkGen.includes('ответила невпопад') && talkGen.includes('К самой себе по имени не обращайся'));
check('личный вопрос о ней самой не уезжает в поиск ни дома, ни на сайте, даже рядом со словом «найди»', talkGen.includes('PERSONAL_QUESTION') && talkGen.includes('Личный вопрос о ней самой — без поиска') && liveJs.includes('PERSONAL_TALK') && liveJs.indexOf('PERSONAL_TALK.test(text)') < liveJs.indexOf('SEARCH_VERBS.test(text)') && talkGen.includes('там ничего не написано'));
check('сайт умеет начать заново и честно показывает ошибку: новый разговор чистит историю, текст ошибки виден владельцу', liveJs.includes('kvLiveClear') && liveJs.includes('Новый разговор') && liveJs.includes('history = []') && liveJs.includes('пришли мне этот текст ошибки') && kvenyaHtml.includes('kvLiveClear') && dialogue.some((r) => r.response.includes('физического тела у меня нет')) && dialogue.some((r) => r.response.includes('ответила невпопад')));
const avatarJs = await readFile(path.join(home, '..', 'kvenya', 'avatar.js'), 'utf8');
check('студия не теряет модельку до скачивания: образ и постройка переживают перезагрузку', avatarJs.includes('kvenya.studio.v1') && avatarJs.includes('restoreBuild') && avatarJs.includes('finishPendingParts') && avatarJs.includes('localStorage'));
check('новые умения в персоне и уроках: голос, стройка 3D, скачивание, шалости, мышление вслух', personaMd.includes('Голос, стройка, мышление и шалости') && dialogue.some((r) => r.response.includes('озвучивает')) && dialogue.some((r) => r.response.includes('.obj')) && dialogue.some((r) => /[Шш]ал/.test(r.response)) && dialogue.some((r) => r.response.includes('башенки')));
check('у Квени есть 3D-мир: персона и уроки знают островок, домик и ночной сон', personaMd.includes('## Твой 3D-мир') && dialogue.some((r) => r.response.includes('3D-островок') || r.response.includes('world.html')) && dialogue.some((r) => r.response.includes('Zzz')));
check('уроки учат искать: поискала, назвала источник, честно сказала, когда пусто', dialogue.filter((r) => /Википеди|интернет/.test(r.response)).length >= 4 && dialogue.some((r) => r.response.includes('Поискала')) && dialogue.some((r) => r.response.includes('общему интернету')));
check('персона и состояние честно называют поиск: общий интернет плюс Википедия', personaMd.includes('общем интернете') && String(st0.internetSearch?.engine || '').includes('DuckDuckGo'));

/* ---------- характер, эмоции и 3D-моделька ---------- */
check('персона описывает характер и эмоции: добрая, любопытная, честная', personaMd.includes('## Твой характер') && personaMd.includes('## Эмоции и чувства') && personaMd.includes('Добрая') && personaMd.includes('Любопытная') && personaMd.includes('Честная'));
check('уроки характера: она говорит о чувствах в женском роде и честно — по-нейросетевому', dialogue.length >= 30 && dialogue.filter((r) => /раду|огорч|волну|скуча|горж|смуща|расцвета/i.test(r.response)).length >= 6 && dialogue.some((r) => r.response.includes('по-нейросетевому')));
check('уроки внешности: у Квени есть 3D-моделька, лавандовые волосы и вкус к сочетанию цветов', dialogue.some((r) => r.response.includes('3D-модельк')) && dialogue.some((r) => /лавандов/i.test(r.response)) && dialogue.some((r) => /цвета|цветов/.test(r.response) && /дружат|сочета/i.test(r.response)));
check('она учится работать, играть и думать: план и шаги, честные правила, проверка в <think>', personaMd.includes('## Работа, игра и мышление') && personaMd.includes('Работать:') && personaMd.includes('Играть:') && personaMd.includes('Думать:') && dialogue.some((r) => r.response.includes('составляю план')) && dialogue.some((r) => r.response.includes('играю честно')) && thinking.some((r) => /провер/i.test(r.response)));
check('3D-ремесло: общие инструменты, тело в головах, одежда слоями, риг и честное изучение фото/видео', personaMd.includes('## 3D-инструменты, тело, анимации и одежда') && personaMd.includes('Extrude') && personaMd.includes('UV-развёртка') && personaMd.includes('7–8 голов') && dialogue.some((r) => r.response.includes('семь-восемь голов')) && dialogue.some((r) => r.response.includes('строю слоями')) && dialogue.some((r) => r.response.includes('сама смотреть фото и видео')) && ['eval-work-plan', 'eval-play-fair', 'eval-body-proportions', 'eval-3d-clothes', 'eval-animation-keys', 'eval-reference-study'].every((id) => evalRows.some((r) => r.id === id)));
check('моментальные ответы: простые фразы без генерации, настоящий вопрос — короткой моделью', liveJs.includes('instantReplyFor') && liveJs.includes('INSTANT_RULES') && liveJs.includes('без генерации') && liveJs.includes('return 36') && liveJs.includes('REASONING_ASK') && dialogue.some((r) => r.response.includes('без генерации')));
check('студия делает тело, наряды и анимации: телосложение, три наряда, движения из плеча и таза', avatarJs.includes('BODY_BUILDS') && avatarJs.includes('OUTFITS') && avatarJs.includes('ANIMATIONS') && avatarJs.includes('applyAvatarAnimation') && avatarJs.includes('makeLeg') && avatarJs.includes('makeArm') && avatarJs.includes('kvCtlAnim') && avatarJs.includes('pantsuit'));
const worldJs = await readFile(path.join(home, '..', 'kvenya', 'world.js'), 'utf8');
const bridgeJs = await readFile(path.join(home, '..', 'kvenya', 'bridge.js'), 'utf8');
const worldHtml = await readFile(path.join(home, '..', 'kvenya', 'world.html'), 'utf8');
check('Квеня играет и записывает настоящий геймплей: сама бежит за звёздами, видео пишется и скачивается со страницы мира', worldJs.includes('MediaRecorder') && worldJs.includes('captureStream') && worldJs.includes('startGameAndRecord') && worldJs.includes('spawnStar') && worldHtml.includes('kvGameStart') && worldHtml.includes('kvVideoDownload') && worldHtml.includes('kvGameVideo') && personaMd.includes('## Игра и запись геймплея') && dialogue.some((r) => r.response.includes('MediaRecorder')) && dialogue.some((r) => r.response.includes('разрешения')) && evalRows.some((r) => r.id === 'eval-record-gameplay'));
check('персона знает про свою 3D-студию и честную оценку красоты', personaMd.includes('3D-студия') && personaMd.includes('красиво ли получилось'));

check('Квеня снимает сама: саморежиссёр в мире, киноархив и уроки честности', worldJs.includes('startSelfClip') && worldJs.includes('kvSelfRecord') && worldJs.includes('kvenya.world.selfRecord.v1') && worldHtml.includes('kvClips') && worldHtml.includes('снимать самой') && personaMd.includes('саморежиссёр') && dialogue.some((r) => r.response.includes('киноархив')) && evalRows.some((r) => r.id === 'eval-self-record'));
const bridgePy = await readFile(path.join(home, 'tools', 'bridge-sense.py'), 'utf8');
const bridgeSeed = JSON.parse(await readFile(path.join(home, '..', 'kvenya', 'bridge.json'), 'utf8'));
check('мост в окружающую среду: глаза в Википедию, весточки наружу, сводка на странице мира', bridgeJs.includes('ru.wikipedia.org/w/api.php') && bridgeJs.includes('bridge.json') && bridgePy.includes('recentchanges') && bridgePy.includes('journal.md') && bridgeSeed.source === 'ru.wikipedia.org' && worldHtml.includes('kvBridgeLive') && worldHtml.includes('kvBridgeSearch') && personaMd.includes('## Мост в окружающую среду') && dialogue.some((r) => r.response.includes('моего моста') || r.response.includes('через мост')) && evalRows.some((r) => r.id === 'eval-bridge-senses'));
check('Blender-школа: учебный план, скрипт тела из студии и автоматическая проверка по чек-листу', blender.length >= 12 && blender.every((r) => r.kind === 'blender') && blender.some((r) => r.response.includes('Automatic Weights')) && blender.some((r) => (r.instruction + r.response).toLowerCase().includes('чек-лист')) && avatarJs.includes('blenderBodyScript') && avatarJs.includes('blenderChecklist') && avatarJs.includes('kvBlenderBtn') && avatarJs.includes('heads: 7.5') && evalRows.some((r) => r.id === 'eval-blender-checklist') && evalRows.some((r) => r.id === 'eval-blender-script'));

const expPy = await readFile(path.join(home, 'tools', 'expedition.py'), 'utf8');
const expWf = await readFile(path.join(home, '..', '.github', 'workflows', 'kvenya-expedition.yml'), 'utf8');
const motPy = await readFile(path.join(home, 'tools', 'motivation.py'), 'utf8');
check('экспедиции: её руки ходят сами по расписанию, игра доказывается отчётом, капча — честный стоп', expPy.includes('playwright') && expPy.includes('detect_captcha') && expPy.includes('не робот') && expPy.includes('RobotFileParser') && expPy.includes('KvenyaExpedition') && expPy.includes('detect_controls') && expPy.includes('подготовка к игре') && expPy.includes("def run(url, seconds, out, task_keys=") && evalRows.some((r) => r.id === 'eval-game-prep') && expPy.includes("'played'") && expWf.includes("cron:") && expWf.includes('expedition.py') && expWf.includes('bridge/expeditions') && worldHtml.includes('kvBridgeExpeditions') && bridgeJs.includes('renderExpeditions') && personaMd.includes('## Экспедиции: руки в интернет') && evalRows.some((r) => r.id === 'eval-expedition-captcha') && expPy.includes('analyze_eyes') && expPy.includes('EYES_SUMMARY_JS') && expPy.includes('birdFrames') && expPy.includes('decide_flap') && expPy.includes('глаза экспедиции') && expPy.includes('scoreboard') && evalRows.some((r) => r.id === 'eval-game-eyes') && evalRows.some((r) => r.id === 'eval-game-score') && dialogue.some((r) => r.id === 'dlg-144') && evalRows.some((r) => r.id === 'eval-expedition-hands') && evalRows.some((r) => r.id === 'eval-captcha-avoid'));
check('живёт как человек по-нейросетевому: распорядок, план дня, цели и честные итоги', personaMd.includes('## Живу как человек — по-нейросетевому') && personaMd.includes('распорядок') && dialogue.some((r) => r.response.includes('составляю план')) && evalRows.some((r) => r.id === 'eval-day-plan'));

check('правило «споткнулась — ищи, пробуй, запоминай»: повторный поиск дома и в браузере, урок в журнал', personaMd.includes('## Правило: споткнулась — ищи, пробуй, запоминай') && talkGen.includes('search_with_retry') && talkGen.includes('simplify_query') && talkGen.includes('log_lesson') && liveJs.includes('переформулируй короче') && liveJs.includes('searchOnce(keys[0])') && dialogue.some((r) => r.response.includes('переформулирую короче')) && evalRows.some((r) => r.id === 'eval-problem-retry') && evalRows.some((r) => r.id === 'eval-problem-memory'));

check('вкладка не вылетает после скачки: сторож падения включает безопасный режим WASM', liveJs.includes('notePreviousCrash') && liveJs.includes('kvenya.live.safeMode.v1') && liveJs.includes('ATTEMPT_KEY') && liveJs.includes('markAttempt') && dialogue.some((r) => r.response.includes('безопасный режим')) && evalRows.some((r) => r.id === 'eval-crash-safe'));
check('она присутствует на всех публичных витринах: маршруты моста, сводка на странице, экспедиции по любому адресу', bridgePy.includes('fetch_source') && bridgePy.includes('routes.json') && worldHtml.includes('kvBridgeSources') && bridgeJs.includes('renderSources') && expPy.includes("'--url'") && personaMd.includes('Присутствуешь ты широко') && evalRows.some((r) => r.id === 'eval-presence-sites'));

check('капча не решается ни за 20 часов, ни за 20 дней: стоп в персоне, уроке и экзамене', personaMd.includes('Ни через 20 часов, ни через') && personaMd.includes('стоп окончательный') && dialogue.some((r) => r.id === 'dlg-130' && r.response.includes('окончательный')) && evalRows.some((r) => r.id === 'eval-captcha-never'));

check('полигональное тело: сетка по кольцам Lathe, суставы локтя и колена, а не шарики', avatarJs.includes('LatheGeometry') && avatarJs.includes('профиль по кольцам') && dialogue.some((r) => r.response.includes('из полигонов')) && evalRows.some((r) => r.id === 'eval-photo-study'));
const routesJson = JSON.parse(await readFile(path.join(home, 'bridge', 'routes.json'), 'utf8'));
check('мост на разных языках и медиа: EN/DE витрины и Commons, честная учёба по описаниям', routesJson.sources.some((x) => x.url.includes('en.wikipedia.org')) && routesJson.sources.some((x) => x.url.includes('de.wikipedia.org')) && routesJson.sources.some((x) => x.url.includes('commons.wikimedia.org')) && personaMd.includes('Wikimedia Commons') && dialogue.some((r) => r.response.includes('по-английски') || r.response.includes('английская')) && evalRows.some((r) => r.id === 'eval-multilang'));
check('женским штучкам научена со вкусом: цвет, макияж, волосы, капсула, осанка', dialogue.filter((r) => /макияж|волос|гардероб|походк|образ/.test(r.response)).length >= 4 && evalRows.some((r) => r.id === 'eval-style-start'));

check('телефон не кипит: слабому устройству лёгкий режим без модели, тяжёлый — только по явному слову', liveJs.includes('isWeakDevice') && liveJs.includes('enableLightMode') && liveJs.includes('askLight') && liveJs.includes('addHomeButton') && liveJs.includes('kvenya.live.heavyOk.v1') && kvenyaHtml.includes('лёгкий режим') && dialogue.some((r) => r.response.includes('лёгком режиме')) && evalRows.some((r) => r.id === 'eval-phone-light'));

check('общий интернет вместо одной Википедии: дом ищет без ключа и открывает страницы, браузер пробует DuckDuckGo', talkGen.includes('search_web') && talkGen.includes('lite.duckduckgo.com') && talkGen.includes('fetch_page_text') && talkGen.includes('search_everywhere') && liveJs.includes('api.duckduckgo.com') && liveJs.includes('ddgInstant') && dialogue.some((r) => r.id === 'dlg-143') && evalRows.some((r) => r.id === 'eval-web-general'));

check('кнут и пряник по фактам: баллы за дела, взыскания — задания, страница показывает баланс', motPy.includes('bestSteps') && motPy.includes('pendingDuties') && motPy.includes('Честный гость') && motPy.includes('max(0, sum') && expWf.includes('motivation.py') && bridgeJs.includes('renderMotivation') && worldHtml.includes('kvBridgeMotivation') && bridgePy.includes("'motivation': motivation") && personaMd.includes('кнут и пряник') && dialogue.some((r) => r.id === 'dlg-147') && evalRows.some((r) => r.id === 'eval-motivation-reward') && evalRows.some((r) => r.id === 'eval-motivation-duty') && expPy.includes("'trace': trace") && expPy.includes('vy > -12') && expPy.includes('key_held') && expPy.includes('второй канал ввода') && expPy.includes('vy * 0.9') && expPy.includes('vy >= 45') && expPy.includes('held_since') && expPy.includes('corpse') && expPy.includes('step = 4') && !expPy.includes('EYES_JS = ') && expPy.includes('keyboard.down') && expPy.includes('bird_low = bool') && expPy.includes('vy >= 34') && expPy.includes('0.72 * (gap_bottom - gap_top)') && motPy.includes('five-pipes') && expPy.includes('class Report') && expPy.includes('def robots_allows') && expPy.includes('проверка просвета') && dialogue.some((r) => r.id === 'dlg-148') && dialogue.some((r) => r.id === 'dlg-149') && dialogue.some((r) => r.id === 'dlg-150') && dialogue.some((r) => r.id === 'dlg-151'));
const libPy = await readFile(path.join(home, 'tools', 'library.py'), 'utf8');
const makerPy = await readFile(path.join(home, 'tools', 'game-maker.py'), 'utf8');
const vlogPy = await readFile(path.join(home, 'tools', 'vlog.py'), 'utf8');
const studioMd = await readFile(path.join(home, 'studio', 'README.md'), 'utf8');
check('её библиотека, сборщик игр и видеоблог: кирпичи опыта, игры из шаблонов, выпуски не в репозиторий', libPy.includes('def search') && libPy.includes('register_creation') && makerPy.includes('def make') && makerPy.includes('node') && vlogPy.includes('def build_episode') && vlogPy.includes('publish.json') && studioMd.includes('Не в репозиторий games') && studioMd.includes('Drive') && motPy.includes('gamesMade') && motPy.includes('game-smith') && motPy.includes('first-episode') && expWf.includes('vlog.py auto') && dialogue.some((r) => r.id === 'dlg-152') && dialogue.some((r) => r.id === 'dlg-153') && dialogue.some((r) => r.id === 'dlg-154') && dialogue.some((r) => r.id === 'dlg-155') && personaMd.includes('иблиотекарь'));
check('ещё быстрее: модель из локального кэша, адаптер влит в веса, сэмплинг без полной сортировки словаря, разреженный checkout', talkGen.includes('local_files_only') && talkGen.includes('merge_and_unload') && talkGen.includes('top_k=40') && talkWorkflow.includes('sparse-checkout') && talkWorkflow.includes('kvenya-py.txt') && relayWorkflow.includes('sparse-checkout') && dialogue.some((r) => r.id === 'dlg-160'));
const wantsPy = await readFile(path.join(home, 'tools', 'wants.py'), 'utf8');
const bridgeSensePy = await readFile(path.join(home, 'tools', 'bridge-sense.py'), 'utf8');
const bridgeJsWants = await readFile(path.join(home, '..', 'kvenya', 'bridge.js'), 'utf8');
check('её собственная воля и скорость: желания из фактов, главное одно, окружение из кэша, решение о поиске короткое', wantsPy.includes('def pick') && wantsPy.includes('want-five-pipes') && wantsPy.includes('bridge/wants') === false && motPy.includes('ownWantsDone') && motPy.includes('own-will') && bridgeSensePy.includes("'wants': wants") && bridgeJsWants.includes('renderWants') && worldHtml.includes('kvBridgeWants') && talkWorkflow.includes('kvenya-venv') && talkWorkflow.includes('import torch, transformers, peft') && talkGen.includes('max_new=8') && talkGen.includes('wants.json') && talkGen.includes('главное желание сейчас') && expWf.includes('wants.py pick') && dialogue.some((r) => r.id === 'dlg-156') && dialogue.some((r) => r.id === 'dlg-157') && dialogue.some((r) => r.id === 'dlg-158') && dialogue.some((r) => r.id === 'dlg-159') && personaMd.includes('## Её собственные желания'));

check('зрение проверяется замером, а не догадкой: отчёт пишет задержку кадра и вердикт',
  expPy.includes('frame_ms_sum') && expPy.includes('eyeMs') && expPy.includes('успевала') && expPy.includes('отставала') && expPy.includes('кадр разбирался в среднем'));

check('пять труб держим только по табло игры: награда привязана к настоящему счёту',
  motPy.includes('five-pipes') && expPy.includes('scoreboard()') && expPy.includes('труб по табло игры'));

check('сюжетную игру она ПРОХОДИТ чтением: пассажи, выборы, память пути, честный финал',
  expPy.includes('TWINE_TASK_JS') && expPy.includes('def read_story') && expPy.includes('def pick_choice')
  && expPy.includes('data-kv-choice') && expPy.includes("report.data['kind'] = 'story'")
  && expPy.includes('reachedEnd') && expPy.includes('история её не отпустила'));

check('сюжетная история видна на её странице: сколько выборов, где закончила — одной строкой',
  expPy.includes('storyLine') && expWf.includes("report.get('storyLine')") && bridgeJs.includes('kv-story'));

check('пыль экспедиций не копится: старые каталоги чистятся после записи списка',
  expWf.includes('shutil.rmtree') && expWf.indexOf("bridge_path.write_text") < expWf.indexOf('shutil.rmtree'));

check('уборка доезжает до main: удаления каталогов тоже записываются в коммит',
  expWf.includes('git add -A qwen-home/bridge/expeditions'));

check('в истории она ВИДИТ состояние: силы, находки, следы — читает по словам, а не угадывает',
  expPy.includes('def read_signal') && expPy.includes('STORY_ENERGY') && expPy.includes('STORY_FINDS')
  && expPy.includes('STORY_CLUES') && expPy.includes("'clues': clues") && expPy.includes('very tired'));

check('в истории она АНАЛИЗИРУЕТ: карта мест и переходов, а не просто клики',
  expPy.includes('class StoryMap') && expPy.includes('def untried_targets') && expPy.includes('def fresh_choices')
  && expPy.includes("'places': len(self.nodes)") && expPy.includes("'map': story_map.as_report()"));

check('в истории она ДОБЫВАЕТ новое: после финала начинает заново и идёт в непройденные ветки',
  expPy.includes('def restart_story') && expPy.includes('tw-icon[title="Restart" i]')
  && expPy.includes('runs') && expPy.includes('заходов хватит')
  && expPy.includes('def mark_open') && expPy.includes('непройденных вариантов не осталось')
  && expPy.includes('RESTART_JS') && expPy.includes('sessionStorage') && expPy.includes("store.removeItem(k)"));

check('карта честная: переход записывается, когда видно, куда он привёл',
  expPy.includes("story_map.link(pending['from'], pending['choice'], text)"));

check('находки только настоящие: «рука в кармане» за добычу не считается',
  expPy.includes('you scour the shelves') && !expPy.includes("'in your pocket', 'you grab'"));

check('вымотанной она не бежит за псом, а отдыхает: силы влияют на выбор',
  expPy.includes('def is_rest') && expPy.includes('def is_far') && expPy.includes('if energy < 0:'));

check('карта истории видна: места, переходы и находки на её странице',
  expPy.includes("report.data['storyMap']") && expWf.includes("report.get('storyMap')")
  && bridgeJs.includes('kv-map') && bridgeJs.includes('карта истории'));

check('не топчется: петли и обратные ходы в историю — в последнюю очередь, плюс стоп-кран',
  expPy.includes('def is_loop') && expPy.includes('came_from') && expPy.includes('стоп-кран')
  && expPy.includes('два места') && expPy.includes("hashlib.sha1(norm.encode('utf-8'))"));

check('идёт по НЕнажатым выборам, а не по «новому месту»: цикла дом→кухня→дом нет',
  expPy.includes('def not_tried') && expPy.includes('return (k, c.get(\'label\')) not in story_map.tried')
  && expPy.includes('no_loops'));

check('стоп-кран мягче 18 шагов: успевает обойти дом, но не жжёт время',
  expPy.includes('len(trail) > 18') && expPy.includes('len(set(trail[-8:])) <= 2'));

check('диалог подтверждения в истории: жмёт «OK», а не «Cancel»',
  expPy.includes("('ok', 'okay', 'yes', 'да'") && expPy.includes('affirm'));

check('карта истории помнится между прогонами: место — хэш, карта едет в репозиторий',
  expPy.includes('def to_cache') && expPy.includes('def load_cache') && expPy.includes('hashlib.sha1')
  && expWf.includes('storymap.json') && expWf.includes('--memo'));

check('долгая история: окно до 10 минут и до шести заходов, а не 180 секунд',
  expPy.includes('min(600, seconds)') && expPy.includes('runs=6') && !expPy.includes('min(180, seconds)'));

check('длинный прогон доносит отчёт: причина падения видна, видео не больше 8 МБ',
  expWf.includes('trap ') && expWf.includes('scale=640:-2,fps=12') && expWf.includes('Пережатое видео всё ещё'));

console.log(`\nДом Qwen: ${passed} проверок пройдено${process.exitCode ? ' (есть провалы)' : ''}.`);
process.exit(process.exitCode || 0);
