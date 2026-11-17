// Реальный headless-тест загрузки веб-клиента RatMes (app.js + все ES-импорты + bootstrap + полоса облака + отправка).
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

const byId = new Map();
for (const id of idMatches) byId.set(id, makeEl('div', id));

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
    return {
      ok: true,
      status: 200,
      json: async () => [{ room_id: 'games-lobby', network: 'ratmes', title: '🎮 Общий чат Games', room_type: 'public', participants: [] }],
    };
  }
  if (s.includes('/ratmes_messages')) {
    if (opts.method === 'POST') {
      pushedMessages += 1;
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

console.log('=== RatMes Web Client Boot & Cloud Progress Bar Tests ===');
await import('../src/web/app.js');
await new Promise((r) => setTimeout(r, 350));

assert.equal(unhandled.length, 0, `Ошибки при запуске app.js: ${unhandled.join('; ')}`);
assert.equal(byId.get('cloudProgressFill').style.width, '100%', 'Полоса подключения должна дойти до 100%');
assert.ok(byId.get('cloudProgressBanner').classList.contains('is-ready'), 'Баннер облака должен перейти в статус is-ready');
assert.ok(byId.get('chatList').children.length >= 3, 'Список реальных чатов должен отрендериться');
assert.ok(byId.get('peopleDirectoryList').children.length >= 2, 'Каталог людей должен отрендериться');
assert.ok(byId.get('sidebarLinksList').children.length >= 12, 'Ссылки подключений должны отрендериться');
console.log('  ✓ app.js загрузился без ошибок импорта, полоса облака дошла до 100% (is-ready)');

byId.get('messageInput').value = 'Тест отправки сообщения';
byId.get('composerForm').requestSubmit();
await new Promise((r) => setTimeout(r, 300));

assert.equal(unhandled.length, 0, `Ошибки при отправке сообщения: ${unhandled.join('; ')}`);
assert.equal(pushedMessages, 1, 'Сообщение должно отправиться в Supabase');
assert.ok(byId.get('messagesFeed').children.length >= 2, 'Отправленное сообщение должно появиться в ленте');
console.log('  ✓ Полный конвейер отправки текста (pack.text -> validate -> vault -> enqueue -> dispatch -> Supabase) работает');
console.log('\n✅ Веб-клиент RatMes проверен полностью!');
process.exit(0);
