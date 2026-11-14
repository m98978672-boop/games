/* Динамическая часть бота: загрузить игру в мини-браузер, прокрутить кадры,
   понажимать кнопки, подёргать клавиши — и записать всё, что упало.

   Ошибки делятся на два сорта:
   «баг игры» — падение в коде игры (TypeError, ReferenceError на своём имени);
   «не хватает заглушки» — бот не умеет изображать нужный Web API.
   Второе в отчёт как баг не идёт, но видно в сводке. */

import vm from 'node:vm';
import { join, dirname, resolve } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { makeWindow, tick, isBrowserOnly } from './dom.mjs';
import { isVendor } from './rules.mjs';

const MISSING_API = /(is not defined|is not a constructor|is not a function)/;

function classify(err, ownFiles) {
  const msg = String((err && err.message) || err);
  const stack = String((err && err.stack) || '');
  const name = (msg.match(/^(\w+) is not defined/) || [])[1]
    || (msg.match(/^(\w+) is not a constructor/) || [])[1];
  if (name && (isBrowserOnly(name) || /^[A-Z]/.test(name)) && !ownFiles.has(name)) {
    return { kind: 'заглушка', msg };
  }
  if (/WebGL|getContext|shader|Worker|AudioContext|three|THREE/i.test(msg) && MISSING_API.test(msg)) {
    return { kind: 'заглушка', msg };
  }
  return { kind: 'баг', msg, stack };
}

/* какие скрипты подключает страница (только обычные, без type="module") */
export function scriptsOf(html, htmlPath, root) {
  const out = [];
  for (const m of html.matchAll(/<script\b([^>]*)>/gi)) {
    const attrs = m[1] || '';
    if (/type\s*=\s*"(module|importmap|application\/json)"/i.test(attrs)) continue;
    const src = (attrs.match(/src\s*=\s*"([^"]+)"/) || [])[1];
    if (!src || /^https?:/i.test(src)) continue;
    const file = resolve(root, dirname(htmlPath), src.split(/[?#]/, 1)[0]);
    out.push({ src, file });
  }
  return out;
}

/* Загрузить игру и потыкать в неё. */
export function playGame(root, project, opts = {}) {
  const findings = [];
  const stubs = new Set();
  const htmlPath = project.html.find((h) => h.endsWith('index.html'));
  if (!htmlPath) return { findings, stubs, loaded: 0, clicked: 0, skipped: 'нет index.html' };

  const html = readFileSync(join(root, htmlPath), 'utf8');
  if (/<script[^>]+type\s*=\s*"module"/i.test(html)) {
    return { findings, stubs, loaded: 0, clicked: 0, skipped: 'страница собрана из ES-модулей' };
  }
  const scripts = scriptsOf(html, htmlPath, root).filter((s) => existsSync(s.file));
  if (!scripts.length) return { findings, stubs, loaded: 0, clicked: 0, skipped: 'нет обычных скриптов' };

  const { win, sandbox, document, timers } = makeWindow(html, { href: 'http://localhost/' + htmlPath });
  const ownNames = new Set();
  let loaded = 0;

  const add = (severity, file, line, msg, hint) => findings.push({
    rule: 'падение', severity, project: project.name, file, line, msg, hint: hint || '',
  });

  for (const s of scripts) {
    const rel = s.file.slice(root.length + 1);
    let code;
    try { code = readFileSync(s.file, 'utf8'); } catch { continue; }
    for (const m of code.matchAll(/^\s*(?:var|let|const|function|class)\s+([A-Za-z_$][\w$]*)/gm)) ownNames.add(m[1]);
    try {
      vm.runInContext(code, sandbox, { filename: rel, timeout: opts.timeout || 15000 });
      loaded++;
    } catch (e) {
      const c = classify(e, ownNames);
      if (c.kind === 'заглушка') { stubs.add(c.msg.slice(0, 80)); continue; }
      const line = Number((String(e.stack || '').match(new RegExp(rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':(\\d+)')) || [])[1]) || 1;
      add('критично', rel, line, 'скрипт падает при загрузке: ' + c.msg,
        'страница не доживёт до интерфейса');
    }
  }
  if (!loaded) return { findings, stubs, loaded, clicked: 0, skipped: 'ни один скрипт не загрузился' };

  /* запуск: событие готовности страницы и первые кадры */
  const safely = (what, fn) => {
    try { fn(); } catch (e) {
      const c = classify(e, ownNames);
      if (c.kind === 'заглушка') { stubs.add(c.msg.slice(0, 80)); return; }
      const where = (String(e.stack || '').match(/([\w./-]+\.js):(\d+)/) || []);
      /* если боту уже не хватало заглушек, игра могла сломаться из-за него,
         а не из-за себя: такие находки идут мягче и с пометкой */
      /* чужая собранная сборка (three.js и подобные) — почти всегда вина заглушек */
      const shaky = stubs.size > 0 || isVendor(where[1] || '');
      add(shaky ? 'важно' : 'критично', where[1] || htmlPath, Number(where[2]) || 1,
        what + ': ' + c.msg,
        shaky ? 'до этого боту не хватило заглушек — проверить вручную в браузере' : 'проверить в браузере');
    }
  };

  safely('страница не переживает DOMContentLoaded', () => {
    document.dispatchEvent({ type: 'DOMContentLoaded' });
    win.dispatchEvent({ type: 'load' });
  });
  safely('первые кадры падают', () => tick(timers, opts.frames || 40));

  /* тыкаем в кнопки: каждая не должна ронять страницу */
  let clicked = 0;
  const buttons = document.all.filter((el) => el.tagName === 'BUTTON' || el.attributes.role === 'button'
    || (el.tagName === 'A' && el.attributes.href === '#'));
  for (const b of buttons.slice(0, opts.maxClicks || 60)) {
    const label = (b._id || b.className || b.tagName).toString().slice(0, 40);
    safely('кнопка «' + label + '» роняет игру', () => { b.click(); tick(timers, 3); });
    clicked++;
  }

  /* клавиши и мышь: основной способ играть */
  const keys = ['w', 'a', 's', 'd', ' ', 'Escape', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift', 'e', 'q', '1', '2'];
  for (const key of keys) {
    safely('клавиша ' + key + ' роняет игру', () => {
      win.dispatchEvent({ type: 'keydown', key, code: 'Key' + key.toUpperCase(), preventDefault() {}, repeat: false });
      document.dispatchEvent({ type: 'keydown', key, code: 'Key' + key.toUpperCase(), preventDefault() {} });
      win.dispatchEvent({ type: 'keyup', key, code: 'Key' + key.toUpperCase(), preventDefault() {} });
      tick(timers, 2);
    });
  }
  safely('мышь роняет игру', () => {
    for (const type of ['pointerdown', 'mousedown', 'mousemove', 'mouseup', 'pointerup', 'wheel', 'touchstart', 'touchend']) {
      win.dispatchEvent({ type, clientX: 640, clientY: 360, button: 0, deltaY: 100, buttons: 1, touches: [{ clientX: 640, clientY: 360 }], changedTouches: [{ clientX: 640, clientY: 360 }], preventDefault() {}, stopPropagation() {} });
      document.dispatchEvent({ type, clientX: 640, clientY: 360, button: 0, deltaY: 100, buttons: 1, touches: [{ clientX: 640, clientY: 360 }], changedTouches: [{ clientX: 640, clientY: 360 }], preventDefault() {}, stopPropagation() {} });
    }
    tick(timers, 10);
  });
  safely('долгая игра падает', () => tick(timers, opts.longFrames || 120));

  /* состояние после игры: NaN в числах — почти всегда баг расчёта */
  const nan = [];
  const seen = new Set();
  const look = (obj, path, depth) => {
    if (depth > 3 || !obj || typeof obj !== 'object' || seen.has(obj) || nan.length > 12) return;
    seen.add(obj);
    for (const k of Object.keys(obj)) {
      let v;
      try { v = obj[k]; } catch { continue; }
      if (typeof v === 'number' && !Number.isFinite(v)) nan.push(path + '.' + k + ' = ' + v);
      else if (v && typeof v === 'object') look(v, path + '.' + k, depth + 1);
    }
  };
  for (const key of Object.keys(win)) {
    if (['window', 'self', 'globalThis', 'top', 'parent', 'frames', 'document', 'console', 'performance', 'navigator', 'location', 'history', 'listeners'].includes(key)) continue;
    const v = win[key];
    if (v && typeof v === 'object') look(v, key, 0);
  }
  for (const bad of nan) {
    add('важно', htmlPath, 1, 'после игры в состоянии остаётся нечисло: ' + bad,
      'NaN или Infinity расползается по расчётам и ломает игру');
  }

  return { findings, stubs, loaded, clicked, skipped: null };
}
