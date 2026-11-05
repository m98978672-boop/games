/* =============================================================================
   НИКА: ЖИВАЯ — автотесты: анимации, ИИ, симуляция, структура, офлайн
   Запуск: node nika-life/tests/smoke.mjs
   ============================================================================= */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const gameRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(gameRoot, '..');
const read = (p) => fs.readFileSync(path.join(repoRoot, p), 'utf8');

/* --- загружаем игровые модули в общее глобальное пространство --------------- */
for (const file of ['data.js', 'animations.js', 'ai.js', 'world.js', 'rig.js', 'ui.js']) {
  const code = read(`nika-life/src/${file}`);
  vm.runInThisContext(code, { filename: `nika-life/src/${file}` });
}
const N = globalThis.NIKA;
assert.ok(N && N.anim && N.ai && N.world && N.rig && N.ui, 'все модули должны загрузиться');

/* --- 1. АНИМАЦИИ: >= 10 клипов на КАЖДУЮ часть тела ------------------------ */
const counts = N.anim.counts();
assert.equal(N.anim.PARTS.length, 12, '12 частей тела');
for (const part of N.anim.PARTS) {
  const clips = N.anim.clipsFor(part.id);
  assert.ok(clips.length >= 10, `${part.label}: ожидалось >= 10 анимаций, получено ${clips.length}`);
  const ids = new Set();
  for (const clip of clips) {
    assert.ok(!ids.has(clip.id), `${part.id}: дубль клипа ${clip.id}`);
    ids.add(clip.id);
    assert.ok(clip.name && clip.name.length > 2, `${part.id}.${clip.id}:нужно имя`);
    assert.ok(clip.duration > 0 && Number.isFinite(clip.duration), `${clip.id}: длительность`);
    assert.ok(Object.keys(clip.tracks).length > 0, `${clip.id}: нужны дорожки`);
    for (const [channel, frames] of Object.entries(clip.tracks)) {
      assert.ok(N.anim.CHANNELS.includes(channel), `${clip.id}: неизвестный канал ${channel}`);
      assert.ok(frames.length >= 2, `${clip.id}.${channel}: нужны ключевые кадры`);
      assert.equal(frames[0][0], 0, `${clip.id}.${channel}: первый кадр t=0`);
      assert.equal(frames[frames.length - 1][0], 1, `${clip.id}.${channel}: последний кадр t=1`);
      let prev = -1;
      for (const [t, v] of frames) {
        assert.ok(t >= prev && t <= 1 && Number.isFinite(v), `${clip.id}.${channel}: корректные кадры`);
        prev = t;
      }
      for (let i = 0; i <= 10; i++) {
        const value = N.anim.sampleTrack(frames, i / 10);
        assert.ok(Number.isFinite(value), `${clip.id}.${channel}: выборка конечна`);
      }
    }
  }
}
assert.ok(N.anim.total() >= 120, `всего клипов: ${N.anim.total()}`);
assert.equal(N.anim.total(), 132, 'в этой версии ровно 132 клипа');

/* --- 2. АНИМАТОР: смешивание и ручное управление --------------------------- */
const animator = new N.anim.Animator();
animator.setBase([{ clip: N.anim.findClip('torso', 'breathe'), weight: 0.7 }]);
animator.play('armR', 'wave', { replace: true });
for (let i = 0; i < 60; i++) {
  animator.tick(1 / 30);
  const pose = animator.pose({ headTilt: 12.5 });
  assert.equal(Object.keys(pose).length, N.anim.CHANNELS.length);
  for (const ch of N.anim.CHANNELS) assert.ok(Number.isFinite(pose[ch]), `${ch} не число`);
  assert.equal(pose.headTilt, 12.5, 'ручной канал перекрывает анимацию');
}
assert.ok(animator.pose().shoulderR !== undefined);

/* --- 3. ИИ: разбор типовых команд ------------------------------------------- */
const cases = [
  ['привет', 'greet'],
  ['надень красное платье', 'dress'],
  ['переоденься в пижаму', 'dress'],
  ['сними куртку', 'undress'],
  ['покажи гардероб', 'wardrobe'],
  ['иди на кухню', 'go'],
  ['иди спать', 'sleep'],
  ['вставай', 'wake'],
  ['поешь', 'eat'],
  ['выпей чаю', 'drink'],
  ['поработай', 'work'],
  ['помоги мне с уборкой', 'help'],
  ['прими душ', 'wash'],
  ['сделай зарядку', 'exercise'],
  ['помаши рукой', 'animate'],
  ['станцуй', 'animate'],
  ['кивни', 'animate'],
  ['покажи все анимации', 'animations'],
  ['открой панель тела', 'body'],
  ['как дела', 'status'],
  ['купи свитер', 'buy'],
  ['подожди', 'wait'],
  ['живи сама', 'autonomy_on'],
  ['выключи автономию', 'autonomy_off'],
  ['сохрани игру', 'save'],
  ['начни заново', 'reset'],
  ['поговори со мной', 'talk'],
  ['запомни: крутись волчком = станцуй', 'teach'],
];
const mistakes = [];
for (const [text, expected] of cases) {
  const parsed = N.ai.parseCommand(text);
  if (parsed.intent !== expected) mistakes.push(`${text} → ${parsed.intent} (ожидался ${expected})`);
}
assert.equal(mistakes.length, 0, 'ИИ не распознал команды:\n  ' + mistakes.join('\n  '));

/* слоты */
const dress = N.ai.parseCommand('надень синее платье');
assert.equal(dress.intent, 'dress');
assert.equal(dress.slots.item.id, 'dress');
assert.equal(dress.slots.color.id, 'blue');
const segments = N.ai.splitCommands('иди на кухню, поешь, потом поработай');
assert.deepEqual(segments, ['иди на кухню', 'поешь', 'поработай']);
assert.deepEqual(segments.map((s) => N.ai.parseCommand(s).intent), ['go', 'eat', 'work']);
assert.ok(N.ai.parseCommand('подними левую руку').slots.part === 'armL');
assert.ok(N.ai.parseCommand('подними правую ногу').slots.part === 'legR');
assert.ok(N.ai.resolveGesture('помаши рукой'), 'карта жестов работает');
assert.equal(N.ai.findMinutes('поспи 2 часа'), 120);

/* дообучение */
assert.ok(N.ai.teach('запомни: крутись волчком = станцуй'));
assert.equal(N.ai.parseCommand('крутись волчком').intent, 'animate');
const info = N.ai.info();
assert.equal(info.cloud, 'нет');
assert.equal(info.cost, '0 ₽');
assert.equal(info.network, 'не используется');
assert.ok(info.trainedOn > 200, `корпус: ${info.trainedOn}`);

/* --- 4. МИР: команды, время, потребности, сохранение ------------------------ */
let state = N.world.freshState();
assert.ok(state.needs.money > 0 && state.needs.energy > 0);
const result = await N.world.command('надень синее платье, помаши рукой и иди на кухню', state);
assert.equal(result.length, 3, 'цепочка из трёх команд');
assert.equal(state.outfit.dress.id, 'dress');
assert.equal(state.outfit.dress.color, '#5b86cf');
assert.ok(state.log.length > 4, 'чат ведётся');
assert.ok(state.animationsPlayed >= 1, 'анимация жеста воспроизведена');
assert.ok(state.events.some((e) => e.type === 'play'), 'события анимации приходят в UI');

const energyBefore = state.needs.energy;
N.world.tick(state, 1);
assert.ok(state.minutes > 480, 'время идёт');
assert.ok(state.needs.energy < energyBefore, 'энергия расходуется');
assert.ok(N.world.clock(state).match(/^\d\d:\d\d$/));

await N.world.command('иди спать', state);
for (let i = 0; i < 400; i++) N.world.tick(state, 0.09);
assert.ok(state.needs.energy > energyBefore - 5, 'сон восстанавливает энергию');

const auto = N.ai.decide(Object.assign(N.world.freshState(), { needs: Object.assign({}, N.world.freshState().needs, { energy: 8 }) }));
assert.equal(auto.intent, 'sleep', 'планировщик отправляет спать при низкой энергии');

const saved = JSON.stringify(N.world.serialize(state));
const restored = N.world.deserialize(saved);
assert.equal(restored.day, state.day);
assert.equal(restored.outfit.dress.id, state.outfit.dress.id);
assert.equal(restored.events.length, 0);
assert.equal(restored.action, null, 'после загрузки действие не «залипает»');

assert.ok(N.world.playClip(state, 'head', 'nod'));
assert.equal(N.world.playClip(state, 'head', 'нет-такого'), false);

/* --- 5. СТРУКТУРА И ОФЛАЙН -------------------------------------------------- */
const html = read('nika-life/index.html');
for (const file of ['data.js', 'animations.js', 'ai.js', 'world.js', 'rig.js', 'ui.js', 'main.js']) {
  assert.ok(html.includes(`src="src/${file}"`), `index.html подключает ${file}`);
}
for (const id of ['stage', 'chat-form', 'chat-input', 'part-select', 'clip-list', 'autonomy-toggle', 'modal-root', 'save-indicator']) {
  assert.ok(html.includes(`id="${id}"`), `есть #${id}`);
}
assert.ok(read('nika-life/style.css').startsWith('@import url("../shared/theme.css");'), 'общая тема подключена первой строкой');
assert.ok(read('nika-life/cover.svg').includes('viewBox="0 0 1440 810"'));
for (const file of ['README.md', 'PLAN.md', 'LICENSE.md', 'cover.svg', 'index.html', 'style.css']) {
  assert.ok(fs.existsSync(path.join(gameRoot, file)), `есть ${file}`);
}
for (const file of fs.readdirSync(path.join(gameRoot, 'src'))) {
  const code = read(`nika-life/src/${file}`);
  assert.ok(!/https?:\/\//.test(code), `${file}: внешних URL быть не должно`);
  assert.ok(!/\bfetch\s*\(|XMLHttpRequest|importScripts|WebSocket\(|EventSource\(/.test(code), `${file}: сетевых вызовов быть не должно`);
}
const catalog = JSON.parse(read('site/community-games.json'));
const entry = catalog.games.find((g) => g.id === 'nika-life');
assert.ok(entry, 'игра добавлена в каталог сообщества Games');
assert.equal(entry.cover, '../nika-life/cover.svg');
assert.equal(entry.play, '../nika-life/index.html');
assert.equal(entry.readme, '../nika-life/README.md');
assert.ok(entry.features.length <= 4);
for (const [field, filename] of [['cover', 'cover.svg'], ['play', 'index.html'], ['readme', 'README.md']]) {
  assert.ok(fs.existsSync(path.join(gameRoot, filename)), `каталог ссылается на существующий ${filename}`);
}

console.log(`НИКА: ЖИВАЯ — тесты пройдены. Анимаций: ${N.anim.total()} (${Object.values(counts).join('/')}), ` +
  `намерений: ${info.intents}, корпус: ${info.trainedOn} фраз, команд проверено: ${cases.length}.`);
