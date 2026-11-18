// Реальный headless-тест загрузки веб-клиента RatMes:
// ES-импорты + bootstrap + полоса облака 100% + разделение «Моё справа / Собеседник слева» + личные чаты 1-на-1 и Избранное.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const idMatches = [...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);

function makeEl(tag, id = '') {
  const attrs = new Map();
  const listeners = new Map();
  const classes = new Set();
  return {
    tagName: tag.toUpperCase(),
    id,
    value: '',
    textContent: '',
    hidden: false,
    checked: false,
    open: false,
    href: '',
    type: '',
    placeholder: '',
    options: [],
    dataset: {},
    style: { setProperty() {}, width: '' },
    children: [],
    get firstChild() { return this.children[0] || null; },
    appendChild(c) { this.children.push(c); return c; },
    removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); return c; },
    append(...xs) { this.children.push(...xs); },
    replaceChildren(...xs) { this.children = [...xs]; },
    remove() {},
    focus() {},
    click() { for (const fn of (listeners.get('click') || [])) fn({ target: this, preventDefault() {} }); },
    showModal() { this.open = true; },
    close() { this.open = false; },
    closest() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    scrollIntoView() {},
    requestSubmit() { for (const fn of (listeners.get('submit') || [])) fn({ target: this, preventDefault() {} }); },
    setAttribute(k, v) { attrs.set(k, String(v)); },
    getAttribute(k) { return attrs.get(k) || null; },
    addEventListener(ev, fn) { if (!listeners.has(ev)) listeners.set(ev, []); listeners.get(ev).push(fn); },
    __emit(ev, arg) { for (const fn of (listeners.get(ev) || [])) fn(arg); },
    __listeners(ev) { return listeners.get(ev) || []; },
    classList: {
      add(...cs) { cs.forEach((c) => classes.add(c)); },
      remove(...cs) { cs.forEach((c) => classes.delete(c)); },
      toggle(c, f) {
        if (f === undefined) { if (classes.has(c)) classes.delete(c); else classes.add(c); }
        else if (f) classes.add(c);
        else classes.delete(c);
      },
      contains(c) { return classes.has(c); },
    },
    get className() { return [...classes].join(' '); },
    set className(s) { classes.clear(); String(s || '').split(/\s+/).filter(Boolean).forEach((c) => classes.add(c)); },
  };
}

const cssSrc = fs.readFileSync(path.join(rootDir, 'styles.css'), 'utf8');
/* Раньше здесь проверялась подстрока «[hidden] { display: none !important; }» — и её
   случайно удовлетворяли точечные правила вида .inspector[hidden], хотя общий закон
   отсутствовал: полоса ответа, вложение и «закреплено» висели в чате, а их ✕
   выглядели мёртвыми. Теперь требуем именно САМОСТОЯТЕЛЬНОЕ правило для [hidden]. */
const cssWithoutComments = cssSrc.replace(/\/\*[\s\S]*?\*\//g, '');
const globalHiddenRule = cssWithoutComments
  .split('}')
  .map((chunk) => chunk.split('{'))
  .some(([selector, body]) => selector && body
    && selector.split(',').some((part) => part.trim() === '[hidden]')
    && /display\s*:\s*none/i.test(body));
assert.ok(globalHiddenRule, 'styles.css обязан содержать самостоятельное правило [hidden] { display: none !important; } — иначе панели с display: flex не скрываются и их ✕ кажутся мёртвыми');

const byId = new Map();
for (const id of idMatches) byId.set(id, makeEl('div', id));
// Инициализируем начальные hidden-атрибуты прямо из index.html
for (const m of html.matchAll(/<[^>]*\bid="([^"]+)"[^>]*>/g)) {
  if (/\bhidden(?:\s|=|>|\/)/.test(m[0]) && byId.has(m[1])) {
    byId.get(m[1]).hidden = true;
  }
}
const bodyEl = makeEl('body', 'body');

const store = new Map();
globalThis.window = { innerWidth: 1200, addEventListener() {} };
globalThis.location = { origin: 'https://m98978672-boop.github.io', pathname: '/games/ratmes/', search: '', protocol: 'https:' };
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
globalThis.sessionStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.document = {
  hidden: false,
  title: '',
  body: bodyEl,
  activeElement: null,
  getElementById: (id) => byId.get(id) || null,
  createElement: (tag) => makeEl(tag),
  createElementNS: (_ns, tag) => makeEl(tag),
  createTextNode: (t) => ({ nodeType: 3, textContent: t }),
  createDocumentFragment: () => makeEl('frag'),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener() {},
};

let pushedMessages = 0;
let createdRooms = [];
let storageUploads = 0;
let postedRows = [];
globalThis.fetch = async (url, opts = {}) => {
  const s = String(url);
  if (s.includes('/api/health')) return { ok: false, status: 404, json: async () => ({}) };
  if (s.includes('/ratmes_presence')) {
    return {
      ok: true,
      status: 200,
      json: async () => [{ peer_id: 'u-peer-test', display_name: 'Аня', bio: 'В игре', room_id: 'games-lobby', last_seen: new Date().toISOString() }],
    };
  }
  if (s.includes('/ratmes_rooms')) {
    if (opts.method === 'POST' && opts.body) {
      const parsed = JSON.parse(opts.body);
      createdRooms.push(parsed);
      return { ok: true, status: 201, json: async () => [parsed] };
    }
    return {
      ok: true,
      status: 200,
      json: async () => [{ room_id: 'games-lobby', network: 'ratmes', title: '🎮 Общий чат Games', room_type: 'public', participants: [] }],
    };
  }
  if (s.includes('/storage/v1/object/ratmes-media/')) {
    storageUploads += 1;
    return { ok: true, status: 200, json: async () => ({ Key: s }) };
  }
  if (s.includes('/ratmes_messages')) {
    if (opts.method === 'POST') {
      pushedMessages += 1;
      postedRows.push(JSON.parse(opts.body));
      return { ok: true, status: 201, json: async () => ({}) };
    }
    return {
      ok: true,
      status: 200,
      json: async () => [{ msg_id: 'm-1', room_id: 'games-lobby', network: 'ratmes', sender_id: 'u-peer-test', sender_name: 'Аня', body_text: 'Привет!', created_at: new Date().toISOString() }],
    };
  }
  return { ok: true, status: 200, json: async () => ({}) };
};

const unhandled = [];
process.on('unhandledRejection', (e) => unhandled.push(String(e?.stack || e)));
process.on('uncaughtException', (e) => unhandled.push(String(e?.stack || e)));
// Страховка: не даём упавшей проверке подвесить процесс навсегда.
const watchdog = setTimeout(() => {
  console.error('✗ Тест не завершился за 20 сек. Незавершённые проверки:');
  console.error(unhandled.join('\n') || '(нет)');
  process.exit(1);
}, 20000);

console.log('=== RatMes Web Client Boot, Bubbles & Private Chats Tests ===');
await import('../src/web/app.js');
await new Promise((r) => setTimeout(r, 350));

assert.equal(unhandled.length, 0, `Ошибки при запуске app.js: ${unhandled.join('; ')}`);
assert.equal(byId.get('cloudProgressFill').style.width, '100%', 'Полоса подключения должна дойти до 100%');
assert.ok(byId.get('cloudProgressBanner').classList.contains('is-ready'), 'Баннер облака должен перейти в статус is-ready');
assert.ok(byId.get('chatList').children.length >= 3, 'Список реальных чатов должен отрендериться');
assert.ok(byId.get('peopleDirectoryList').children.length >= 2, 'Каталог людей должен отрендериться');
assert.ok(byId.get('sidebarLinksList').children.length >= 12, 'Ссылки подключений должны отрендериться');
for (const hiddenId of ['pinnedBanner', 'replyBar', 'attachmentBar', 'chatCanWriteBar', 'btnQuickBindVpn', 'btnHeaderConnect', 'chatMoreBar']) {
  assert.equal(byId.get(hiddenId).hidden, true, `Элемент #${hiddenId} должен оставаться скрытым в обычном чате`);
}
console.log('  ✓ app.js загрузился без ошибок импорта, полоса облака дошла до 100%, скрытые панели не вылезают');

// Отправка сообщения и проверка чёткого разделения «Собеседник слева (.is-in) / Моё справа (.is-out)»
byId.get('messageInput').value = 'Тест отправки сообщения';
byId.get('composerForm').requestSubmit();
await new Promise((r) => setTimeout(r, 300));

assert.equal(unhandled.length, 0, `Ошибки при отправке сообщения: ${unhandled.join('; ')}`);
assert.equal(pushedMessages, 1, 'Сообщение должно отправиться в Supabase');
const feedChildren = byId.get('messagesFeed').children;
const inRows = feedChildren.filter((n) => n.classList?.contains('is-in'));
const outRows = feedChildren.filter((n) => n.classList?.contains('is-out'));
assert.equal(inRows.length, 1, 'Сообщение собеседника должно иметь класс msg-row is-in (слева)');
assert.equal(outRows.length, 1, 'Моё сообщение должно иметь класс msg-row is-out (справа)');
assert.ok(inRows[0].children.some((c) => c.classList?.contains('msg-peer-avatar')), 'У сообщения собеседника слева должен быть аватар');
console.log('  ✓ Чёткое разделение сообщений: собеседник слева (.is-in + аватар) и моё справа (.is-out)');

// Реальная передача файла: FileReader -> Supabase Storage -> строка сообщения с attachment
globalThis.FileReader = class {
  readAsDataURL(file) {
    this.result = `data:${file.type};base64,${Buffer.from(String(file.__content || 'file-bytes')).toString('base64')}`;
    setTimeout(() => this.onload && this.onload(), 0);
  }
};
const fileInputEl = byId.get('fileInput');
fileInputEl.files = [{ name: 'Смета на ремонт.pdf', type: 'application/pdf', size: 26, __content: 'смета-ремонт-2026' }];
fileInputEl.__emit('change', { target: fileInputEl });
await new Promise((r) => setTimeout(r, 60));
assert.equal(byId.get('attachmentBar').hidden, false, 'Панель вложения должна показаться после выбора файла');
assert.equal(byId.get('attachmentName').textContent, 'Смета на ремонт.pdf');

byId.get('messageInput').value = '';
byId.get('composerForm').requestSubmit();
await new Promise((r) => setTimeout(r, 400));

assert.equal(unhandled.length, 0, `Ошибки при отправке файла: ${unhandled.join('; ')}`);
assert.equal(storageUploads, 1, 'Файл должен загрузиться в Supabase Storage (bucket ratmes-media)');
const fileRow = postedRows.find((r) => r.attachment && r.attachment.storagePath);
assert.ok(fileRow, 'Строка сообщения должна содержать attachment со storagePath');
assert.equal(fileRow.kind, 'file');
assert.equal(fileRow.attachment.filename, 'Смета на ремонт.pdf');
assert.ok(fileRow.attachment.storagePath.startsWith('games-lobby/'), 'Файл должен лежать в папке комнаты');
assert.ok(fileRow.attachment.sha256 && fileRow.attachment.sha256.length === 64, 'SHA-256 файла сохраняется в метаданных');

function collectText(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (node.textContent) out.push(String(node.textContent));
  if (node.href) out.push(String(node.href));
  if (typeof node.getAttribute === 'function' && node.getAttribute('href')) out.push(String(node.getAttribute('href')));
  for (const ch of node.children || []) collectText(ch, out);
  return out;
}
const ownFileBubble = byId.get('messagesFeed').children
  .filter((n) => n.classList?.contains('is-out'))
  .pop();
const bubbleTexts = collectText(ownFileBubble).join(' | ');
assert.ok(bubbleTexts.includes('Смета на ремонт.pdf'), 'В облаке сообщение с файлом должно отрисоваться с именем файла');
assert.ok(bubbleTexts.includes('storage/v1/object/public/ratmes-media/'), 'У файла должна быть рабочая ссылка на скачивание');
assert.equal((bubbleTexts.match(/Смета на ремонт\.pdf/g) || []).length, 1, 'Имя файла не должно дублироваться текстом и плашкой');
console.log('  ✓ Файл реально уходит в облако: Storage + attachment в сообщении + ссылка на скачивание');

// Открытие окна «Новый личный чат», создание 1-на-1 DM по ID и «⭐ Избранное»
byId.get('btnNewDmQuick').click();
assert.equal(byId.get('dmActionModal').open, true, 'Окно «Новый личный чат» должно открываться');
assert.ok(byId.get('dmModalPeopleList').children.length >= 1, 'В окне личных чатов должен отображаться собеседник Аня');

byId.get('dmTargetCodeInput').value = 'u-peer-test';
byId.get('openDmByCodeForm').requestSubmit();
await new Promise((r) => setTimeout(r, 250));
assert.ok(createdRooms.some((r) => r.room_type === 'dm' && String(r.room_id).startsWith('dm-') && !String(r.room_id).startsWith('dm-self-')), 'Должен создаться личный чат 1-на-1 (dm-...)');
assert.ok(bodyEl.classList.contains('mobile-chat-open'), 'body должен получить mobile-chat-open для скрытия bottom-nav в чате');

byId.get('btnOpenSavedMessages').click();
await new Promise((r) => setTimeout(r, 250));
assert.ok(createdRooms.some((r) => String(r.room_id).startsWith('dm-self-')), 'Должен открыться личный чат «⭐ Избранное» (dm-self-...)');
assert.equal(unhandled.length, 0, `Необработанные ошибки в сценарии личных чатов: ${unhandled.join('; ')}`);
console.log('  ✓ Личные чаты 1-на-1 (dm-...) и «⭐ Избранное» (dm-self-...) работают');

// Каждый крестик ✕ в модальных окнах обязан реально закрывать своё окно
for (const [openId, closeId] of [
  ['profileModal', 'btnCloseProfile'],
  ['dmActionModal', 'btnCloseDmAction'],
  ['roomActionModal', 'btnCloseRoomAction'],
  ['paletteModal', 'btnClosePalette'],
  ['forwardModal', 'btnCloseForward'],
  ['proxyModal', 'btnCloseProxy'],
]) {
  const dialog = byId.get(openId);
  const closeBtn = byId.get(closeId);
  assert.ok(dialog, `В index.html должно быть окно #${openId}`);
  assert.ok(closeBtn, `В index.html должна быть кнопка ✕ #${closeId}`);
  dialog.open = true;
  closeBtn.click();
  assert.equal(dialog.open, false, `Кнопка ✕ #${closeId} обязана закрывать #${openId}`);
}
console.log('  ✓ Все крестики ✕ закрывают свои окна (профиль, личные чаты, комнаты, поиск, пересылка, VPN)');
assert.equal(unhandled.length, 0, `Необработанные ошибки в сценарии крестиков: ${unhandled.join('; ')}`);
console.log('\n✅ Веб-клиент RatMes проверен полностью!');
process.exit(0);
