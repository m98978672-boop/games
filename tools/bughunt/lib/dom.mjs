/* Мини-браузер для бота: ровно столько DOM и Web API, сколько нужно,
   чтобы игра загрузилась и её можно было потыкать. Без зависимостей.

   Задача не в том, чтобы честно нарисовать страницу, а в том, чтобы
   код игры выполнился и показал свои ошибки. Всё, чего не хватает,
   отдаётся как «заглушка» — такие случаи бот помечает отдельно
   и не выдаёт за баг игры. */

import vm from 'node:vm';

const BROWSER_ONLY = new Set([
  'WebGLRenderingContext', 'WebGL2RenderingContext', 'AudioContext', 'webkitAudioContext',
  'OffscreenCanvas', 'Worker', 'SharedWorker', 'WebAssembly', 'IntersectionObserver',
  'ResizeObserver', 'MutationObserver', 'PointerEvent', 'TouchEvent', 'GamepadEvent',
  'SpeechSynthesisUtterance', 'XRSession', 'THREE', 'CANNON', 'Ammo',
]);

export function isBrowserOnly(name) { return BROWSER_ONLY.has(name); }

function makeCanvasContext(kind) {
  const noop = () => {};
  const ctx = new Proxy({
    canvas: { width: 1280, height: 720 },
    measureText: () => ({ width: 10, actualBoundingBoxAscent: 8, actualBoundingBoxDescent: 2 }),
    getImageData: (x, y, w = 1, h = 1) => ({ data: new Uint8ClampedArray(Math.max(1, w * h * 4)), width: w, height: h }),
    createImageData: (w = 1, h = 1) => ({ data: new Uint8ClampedArray(Math.max(1, w * h * 4)), width: w, height: h }),
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
    createPattern: () => ({ setTransform: noop }),
    getContextAttributes: () => ({}),
    getExtension: () => null,
    getParameter: () => 0,
    getShaderPrecisionFormat: () => ({ precision: 1, rangeMin: 1, rangeMax: 1 }),
    createBuffer: () => ({}), createTexture: () => ({}), createProgram: () => ({}),
    createShader: () => ({}), getProgramParameter: () => true, getShaderParameter: () => true,
    getUniformLocation: () => ({}), getAttribLocation: () => 0,
    kind,
  }, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (typeof prop === 'symbol') return undefined;
      return noop;                      /* любой метод рисования — пустышка */
    },
    set(target, prop, v) { target[prop] = v; return true; },
  });
  return ctx;
}

class ClassList {
  constructor() { this.set = new Set(); }
  add(...c) { c.forEach((x) => this.set.add(x)); }
  remove(...c) { c.forEach((x) => this.set.delete(x)); }
  toggle(c, on) { if (on === undefined) { this.set.has(c) ? this.set.delete(c) : this.set.add(c); } else if (on) this.set.add(c); else this.set.delete(c); return this.set.has(c); }
  contains(c) { return this.set.has(c); }
  get value() { return [...this.set].join(' '); }
  toString() { return this.value; }
}

let nodeSeq = 0;

export class El {
  constructor(tag, doc) {
    this.tagName = String(tag || 'div').toUpperCase();
    this.nodeName = this.tagName;
    this.nodeType = 1;
    this.ownerDocument = doc;
    this.children = [];
    this.childNodes = this.children;
    this.parentNode = null;
    this.attributes = {};
    this.style = new Proxy({ setProperty(k, v) { this[k] = v; }, removeProperty(k) { delete this[k]; }, getPropertyValue(k) { return this[k] || ''; } }, {});
    this.dataset = {};
    this.classList = new ClassList();
    this.listeners = {};
    this._text = '';
    this._html = '';
    this._id = '';
    this.value = '';
    this.options = [];                /* для <select> */
    this.selectedIndex = -1;
    this.checked = false;
    this.disabled = false;
    this.hidden = false;
    this.width = 1280; this.height = 720;
    this.clientWidth = 1280; this.clientHeight = 720;
    this.offsetWidth = 1280; this.offsetHeight = 720;
    this.scrollTop = 0; this.scrollLeft = 0; this.scrollHeight = 720; this.scrollWidth = 1280;
    this.uid = ++nodeSeq;
  }
  get id() { return this._id; }
  set id(v) { this._id = v; if (this.ownerDocument) this.ownerDocument.index.set(v, this); }
  get className() { return this.classList.value; }
  set className(v) { this.classList = new ClassList(); String(v || '').split(/\s+/).filter(Boolean).forEach((c) => this.classList.add(c)); }
  get textContent() { return this.children.length ? this.children.map((c) => c.textContent).join('') : this._text; }
  set textContent(v) { this._text = String(v ?? ''); this.children.length = 0; }
  get innerText() { return this.textContent; }
  set innerText(v) { this.textContent = v; }
  get innerHTML() { return this._html; }
  set innerHTML(v) {
    this._html = String(v ?? '');
    this.children.length = 0;
    if (!this.ownerDocument) return;
    /* грубый разбор: нужен только для того, чтобы жили id и классы */
    for (const m of this._html.matchAll(/<([a-zA-Z][\w-]*)([^>]*)>/g)) {
      const el = this.ownerDocument.createElement(m[1]);
      const idm = m[2].match(/id\s*=\s*"([^"]+)"/);
      if (idm) el.id = idm[1];
      const cm = m[2].match(/class\s*=\s*"([^"]+)"/);
      if (cm) el.className = cm[1];
      const dm = [...m[2].matchAll(/data-([\w-]+)\s*=\s*"([^"]*)"/g)];
      dm.forEach((d) => { el.dataset[d[1].replace(/-(\w)/g, (x, c) => c.toUpperCase())] = d[2]; });
      el.parentNode = this;
      this.children.push(el);
    }
  }
  get outerHTML() { return '<' + this.tagName.toLowerCase() + '>' + this._html + '</' + this.tagName.toLowerCase() + '>'; }
  get firstChild() { return this.children[0] || null; }
  get lastChild() { return this.children[this.children.length - 1] || null; }
  get firstElementChild() { return this.children[0] || null; }
  get nextSibling() { return null; }
  get parentElement() { return this.parentNode; }
  // Упрощённый парсер не связывает body с документом.
  getRootNode() { let node = this; while (node.parentNode) node = node.parentNode; return node === this.ownerDocument.body ? this.ownerDocument : node; }
  appendChild(c) {
    if (!c) return c;
    c.parentNode = this;
    this.children.push(c);
    if (c.tagName === 'OPTION') {
      this.options.push(c);
      if (this.selectedIndex < 0) { this.selectedIndex = 0; if (!this.value) this.value = c.value || c.textContent || ''; }
    }
    return c;
  }
  append(...cs) { cs.forEach((c) => typeof c === 'object' && this.appendChild(c)); }
  prepend(c) { if (c) { c.parentNode = this; this.children.unshift(c); } return c; }
  insertBefore(c) { return this.appendChild(c); }
  removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); return c; }
  remove() { if (this.parentNode) this.parentNode.removeChild(this); }
  replaceChildren(...cs) { this.children.length = 0; cs.forEach((c) => this.appendChild(c)); }
  setAttribute(k, v) {
    this.attributes[k] = String(v);
    if (k === 'id') this.id = String(v);
    if (k === 'class') this.className = String(v);
    if (k.startsWith('data-')) this.dataset[k.slice(5).replace(/-(\w)/g, (x, c) => c.toUpperCase())] = String(v);
  }
  getAttribute(k) { return k === 'id' ? this._id : (this.attributes[k] ?? null); }
  removeAttribute(k) { delete this.attributes[k]; }
  hasAttribute(k) { return k in this.attributes || (k === 'id' && !!this._id); }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  removeEventListener(type, fn) { this.listeners[type] = (this.listeners[type] || []).filter((x) => x !== fn); }
  dispatchEvent(ev) {
    const type = ev && ev.type;
    (this.listeners[type] || []).forEach((fn) => fn.call(this, Object.assign({
      type, target: this, currentTarget: this, preventDefault() {}, stopPropagation() {},
    }, ev)));
    return true;
  }
  click() { this.dispatchEvent({ type: 'click', button: 0, clientX: 10, clientY: 10 }); }
  focus() {} blur() {}
  getContext(kind) { return makeCanvasContext(kind); }
  toDataURL() { return 'data:image/png;base64,'; }
  getBoundingClientRect() { return { x: 0, y: 0, top: 0, left: 0, right: 1280, bottom: 720, width: 1280, height: 720 }; }
  querySelector(sel) { return this.ownerDocument ? this.ownerDocument.querySelector(sel, this) : null; }
  querySelectorAll(sel) { return this.ownerDocument ? this.ownerDocument.querySelectorAll(sel, this) : []; }
  closest(sel) {
    let n = this;
    while (n) {
      if (sel.startsWith('.') && n.classList.contains(sel.slice(1))) return n;
      if (sel.startsWith('#') && n._id === sel.slice(1)) return n;
      if (/^[a-z]+$/i.test(sel) && n.tagName === sel.toUpperCase()) return n;
      n = n.parentNode;
    }
    return null;
  }
  matches(sel) { return !!this.closest(sel) && this.closest(sel) === this; }
  scrollIntoView() {}
  animate() { return { cancel() {}, finished: Promise.resolve() }; }
  requestPointerLock() {}
  requestFullscreen() { return Promise.resolve(); }
  play() { return Promise.resolve(); }
  pause() {}
  load() {}
}

class Doc {
  constructor(html) {
    this.index = new Map();
    this.all = [];
    this.nodeType = 9;
    this.documentElement = new El('html', this);
    this.head = new El('head', this);
    this.body = new El('body', this);
    this.listeners = {};
    this.readyState = 'complete';
    this.hidden = false;
    this.title = '';
    this.cookie = '';
    this.fullscreenElement = null;
    this.pointerLockElement = null;
    this.activeElement = this.body;
    this.parse(html || '');
  }
  parse(html) {
    const clean = html.replace(/<!--[\s\S]*?-->/g, '');
    let lastSelect = null;
    for (const m of clean.matchAll(/<([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g)) {
      const el = this.createElement(m[1]);
      const attrs = m[2] || '';
      for (const a of attrs.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) el.setAttribute(a[1], a[2]);
      for (const a of attrs.matchAll(/(?:^|\s)([\w-]+)(?=\s|$)/g)) {
        if (!el.attributes[a[1]]) el.attributes[a[1]] = '';
      }
      if (el.attributes.value != null) el.value = el.attributes.value;
      /* как в браузере: у <select> значение — первый <option>, у полей — атрибут value */
      if (el.tagName === 'SELECT') { lastSelect = el; }
      else if (el.tagName === 'OPTION' && lastSelect) {
        const text = clean.slice(m.index + m[0].length, clean.indexOf('<', m.index + m[0].length));
        if (!el.value) el.value = text.trim();
        el.textContent = text.trim();
        lastSelect.options.push(el);
        if (lastSelect.selectedIndex < 0 || el.attributes.selected != null) {
          lastSelect.selectedIndex = lastSelect.options.length - 1;
          lastSelect.value = el.value;
        }
      }
      if (el.tagName === 'INPUT' && el.attributes.type === 'checkbox') el.checked = el.attributes.checked != null;
      this.body.children.push(el);
      el.parentNode = this.body;
    }
  }
  createElement(tag) { const el = new El(tag, this); this.all.push(el); return el; }
  createElementNS(ns, tag) { return this.createElement(tag); }
  createTextNode(t) { const el = this.createElement('#text'); el.textContent = t; return el; }
  createDocumentFragment() { return this.createElement('fragment'); }
  getElementById(id) { return this.index.get(id) || null; }
  getElementsByTagName(tag) { return this.all.filter((e) => e.tagName === String(tag).toUpperCase()); }
  getElementsByClassName(c) { return this.all.filter((e) => e.classList.contains(c)); }
  querySelector(sel, within) { return this.querySelectorAll(sel, within)[0] || null; }
  querySelectorAll(sel, within) {
    const pool = within ? within.children.concat(this.all.filter((e) => e.parentNode === within)) : this.all;
    const parts = String(sel).split(',').map((s) => s.trim()).filter(Boolean);
    const out = [];
    for (const part of parts) {
      const last = part.split(/\s+|>/).filter(Boolean).pop() || part;
      for (const el of pool) {
        if (last.startsWith('#') && el._id === last.slice(1)) out.push(el);
        else if (last.startsWith('.') && el.classList.contains(last.slice(1).split(/[.:[]/)[0])) out.push(el);
        else if (/^\[data-/.test(last)) { const k = last.slice(6).replace(/[\]="'].*$/, ''); if (k in el.dataset) out.push(el); }
        else if (/^[a-zA-Z][\w-]*$/.test(last) && el.tagName === last.toUpperCase()) out.push(el);
      }
    }
    const uniq = [...new Set(out)];
    uniq.forEach = Array.prototype.forEach;
    return uniq;
  }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  removeEventListener(type, fn) { this.listeners[type] = (this.listeners[type] || []).filter((x) => x !== fn); }
  dispatchEvent(ev) {
    (this.listeners[ev.type] || []).forEach((fn) => fn(Object.assign({ target: this, preventDefault() {}, stopPropagation() {} }, ev)));
    return true;
  }
  exitPointerLock() {} exitFullscreen() { return Promise.resolve(); }
  elementFromPoint() { return this.body; }
}

/* Хранилище в памяти — как localStorage, только без диска */
function storage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(String(k)) ? map.get(String(k)) : null),
    setItem: (k, v) => { map.set(String(k), String(v)); },
    removeItem: (k) => { map.delete(String(k)); },
    clear: () => map.clear(),
    key: (i) => [...map.keys()][i] ?? null,
    get length() { return map.size; },
  };
}

/* Собрать окружение. Возвращает { sandbox, errors, timers } */
export function makeWindow(html, opts = {}) {
  const errors = [];
  const document = new Doc(html);
  const timers = { raf: [], timeout: [], interval: [] };
  let rafId = 0;

  const win = {
    document,
    name: 'bughunt',
    innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1,
    scrollX: 0, scrollY: 0,
    location: { href: opts.href || 'http://localhost/index.html', origin: 'http://localhost', protocol: 'http:', pathname: '/index.html', search: '', hash: '', reload() {}, assign() {}, replace() {} },
    history: { pushState() {}, replaceState() {}, back() {}, length: 1, state: null },
    navigator: {
      userAgent: 'bughunt', language: 'ru-RU', languages: ['ru-RU'], platform: 'linux',
      maxTouchPoints: 0, hardwareConcurrency: 4, onLine: true,
      clipboard: { writeText: () => Promise.resolve() },
      getGamepads: () => [], vibrate() {}, sendBeacon() { return true; },
      mediaDevices: { getUserMedia: () => Promise.reject(new Error('нет устройств')) },
      storage: { estimate: () => Promise.resolve({ usage: 0, quota: 0 }) },
      serviceWorker: { register: () => Promise.resolve({}) },
    },
    localStorage: storage(),
    sessionStorage: storage(),
    performance: { now: () => Number(process.hrtime.bigint() / 1000000n), mark() {}, measure() {}, getEntriesByType: () => [] },
    requestAnimationFrame(fn) { const id = ++rafId; timers.raf.push({ id, fn }); return id; },
    cancelAnimationFrame(id) { timers.raf = timers.raf.filter((t) => t.id !== id); },
    setTimeout(fn, ms) { const id = ++rafId; timers.timeout.push({ id, fn, ms: ms || 0 }); return id; },
    clearTimeout(id) { timers.timeout = timers.timeout.filter((t) => t.id !== id); },
    setInterval(fn, ms) { const id = ++rafId; timers.interval.push({ id, fn, ms: ms || 0 }); return id; },
    clearInterval(id) { timers.interval = timers.interval.filter((t) => t.id !== id); },
    queueMicrotask: (fn) => fn(),
    matchMedia: (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null }),
    getComputedStyle: () => new Proxy({ getPropertyValue: () => '' }, { get: (t, k) => (k in t ? t[k] : '') }),
    alert() {}, confirm: () => true, prompt: () => null,
    open: () => null, close() {}, focus() {}, blur() {}, print() {}, scrollTo() {}, scrollBy() {},
    addEventListener(type, fn) { (win.listeners[type] ||= []).push(fn); },
    removeEventListener(type, fn) { win.listeners[type] = (win.listeners[type] || []).filter((x) => x !== fn); },
    dispatchEvent(ev) { (win.listeners[ev.type] || []).forEach((fn) => fn(ev)); return true; },
    listeners: {},
    fetch: () => Promise.reject(new Error('бот не даёт игре ходить в сеть')),
    Image: class { constructor() { this.width = 1; this.height = 1; setTimeoutStub(() => this.onload && this.onload()); } set src(v) { this._src = v; } get src() { return this._src; } addEventListener(t, fn) { if (t === 'load') setTimeoutStub(fn); } },
    Audio: class { constructor() { this.volume = 1; } play() { return Promise.resolve(); } pause() {} load() {} addEventListener() {} },
    AudioContext: class { constructor() { this.state = 'suspended'; this.destination = {}; this.currentTime = 0; this.sampleRate = 48000; } createGain() { return gainNode(); } createOscillator() { return oscNode(); } createBiquadFilter() { return filterNode(); } createBuffer() { return { getChannelData: () => new Float32Array(1) }; } createBufferSource() { return { connect() {}, start() {}, stop() {}, buffer: null }; } createDynamicsCompressor() { return gainNode(); } createConvolver() { return gainNode(); } createStereoPanner() { return gainNode(); } createAnalyser() { return Object.assign(gainNode(), { getByteFrequencyData() {}, frequencyBinCount: 32 }); } resume() { return Promise.resolve(); } suspend() { return Promise.resolve(); } close() { return Promise.resolve(); } },
    CustomEvent: class { constructor(type, init) { this.type = type; Object.assign(this, init || {}); } },
    Event: class { constructor(type, init) { this.type = type; Object.assign(this, init || {}); } },
    KeyboardEvent: class { constructor(type, init) { this.type = type; Object.assign(this, init || {}); } },
    MouseEvent: class { constructor(type, init) { this.type = type; Object.assign(this, init || {}); } },
    Blob: class { constructor(parts) { this.parts = parts || []; this.size = 0; } },
    FileReader: class { readAsText() { setTimeoutStub(() => this.onload && this.onload({ target: { result: '' } })); } },
    URL: Object.assign(URL, { createObjectURL: () => 'blob:bughunt', revokeObjectURL() {} }),
    URLSearchParams,
    TextEncoder, TextDecoder, structuredClone,
    AbortController, AbortSignal,
    Headers: globalThis.Headers, Request: globalThis.Request, Response: globalThis.Response,
    WebSocket: class { constructor() { this.readyState = 3; } send() {} close() {} addEventListener() {} },
    EventSource: class { close() {} addEventListener() {} },
    Notification: class { static requestPermission() { return Promise.resolve('denied'); } },
    indexedDB: { open: () => ({ addEventListener() {}, result: null }) },
    screen: { width: 1280, height: 720, orientation: { type: 'landscape-primary', lock: () => Promise.resolve(), unlock() {}, addEventListener() {} } },
    visualViewport: { width: 1280, height: 720, scale: 1, addEventListener() {}, removeEventListener() {} },
    speechSynthesis: { speak() {}, cancel() {}, getVoices: () => [] },
    DOMParser: class { parseFromString(text) { return new Doc(text); } },
    XMLHttpRequest: class { open() {} send() { if (this.onerror) this.onerror(new Error('бот не пускает в сеть')); } setRequestHeader() {} addEventListener() {} },
    ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
    IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
    MutationObserver: class { observe() {} disconnect() {} takeRecords() { return []; } },
    crypto: { getRandomValues: (a) => { for (let i = 0; i < a.length; i++) a[i] = (i * 2654435761) % 256; return a; }, randomUUID: () => 'bughunt-uuid' },
    console,
    onerror: null,
  };
  function setTimeoutStub(fn) { timers.timeout.push({ id: ++rafId, fn, ms: 0 }); }
  function gainNode() { return { connect() { return this; }, disconnect() {}, gain: param(), start() {}, stop() {} }; }
  function oscNode() { return { connect() { return this; }, disconnect() {}, start() {}, stop() {}, frequency: param(), detune: param(), type: 'sine' }; }
  function filterNode() { return { connect() { return this; }, disconnect() {}, frequency: param(), Q: param(), gain: param(), type: 'lowpass' }; }
  function param() { return { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {} }; }

  win.window = win;
  win.self = win;
  win.globalThis = win;
  win.top = win;
  win.parent = win;
  win.frames = win;
  win.HTMLElement = El;
  win.HTMLCanvasElement = El;
  win.Element = El;
  win.Node = El;
  win.document.defaultView = win;

  const sandbox = vm.createContext(win);
  return { win, sandbox, document, errors, timers };
}

/* Прокрутить отложенные дела: кадры, таймеры, интервалы. */
export function tick(timers, frames = 30) {
  let ran = 0;
  for (let i = 0; i < frames; i++) {
    const raf = timers.raf.splice(0, timers.raf.length);
    for (const t of raf) { t.fn(i * 16.7); ran++; }
    const to = timers.timeout.filter((t) => t.ms <= 50);
    timers.timeout = timers.timeout.filter((t) => t.ms > 50);
    for (const t of to) { t.fn(); ran++; }
    for (const t of timers.interval.slice(0, 20)) { t.fn(); ran++; }
  }
  return ran;
}
