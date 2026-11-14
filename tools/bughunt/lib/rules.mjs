/* Статические правила бота: читают файлы и ищут то, что обычно оказывается
   багом. Каждое правило возвращает список находок вида
   { rule, severity, project, file, line, msg, hint }.

   Уровни: «критично» — игра сломается у игрока, «важно» — похоже на ошибку,
   «мелочь» — так жить можно, но лучше поправить. */

import vm from 'node:vm';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join, dirname, resolve, relative } from 'node:path';
import { existsSync } from 'node:fs';
import { read, stripCode, lineAt, sizeOf } from './scan.mjs';

const run = promisify(execFile);

function f(rule, severity, project, file, line, msg, hint) {
  return { rule, severity, project, file, line, msg, hint: hint || '' };
}

/* Чужой собранный код: искать в нём стиль бессмысленно — там минификация.
   Синтаксис и ссылки проверяем, придирки к коду — нет. */
export function isVendor(file) {
  return /bundle\.js$|\.min\.js$|(^|\/)(vendor|three|cannon|ammo|draco)[.\/-]|\/libs?\//i.test(file);
}
const isTest = (file) => /\/(tests?|tools)\//.test(file) || /\.(test|spec)\.m?js$/.test(file);

/* ------------------------- 1. синтаксис скриптов ---------------------- */

export async function ruleSyntax(root, p) {
  const out = [];
  const mjs = [];
  for (const file of p.js) {
    const src = read(root, file);
    if (src == null) continue;
    if (/\.mjs$/.test(file) || /^\s*(import|export)\s/m.test(src)) { mjs.push(file); continue; }
    try {
      new vm.Script(src, { filename: file });
    } catch (e) {
      out.push(f('синтаксис', 'критично', p.name, file, Number(e.lineNumber) || 1,
        'файл не компилируется: ' + e.message, 'node --check ' + file));
    }
  }
  /* модули проверяет сам Node: у vm.Script нет режима модуля */
  await Promise.all(mjs.map(async (file) => {
    try {
      await run(process.execPath, ['--check', join(root, file)], { timeout: 20000 });
    } catch (e) {
      const text = String(e.stderr || e.message);
      const m = text.match(/:(\d+)\n/);
      out.push(f('синтаксис', 'критично', p.name, file, m ? Number(m[1]) : 1,
        'файл не компилируется: ' + text.split('\n').slice(0, 3).join(' ').trim(),
        'node --check ' + file));
    }
  }));
  return out;
}

/* ------------------- 2. ссылки из HTML и CSS в никуда ------------------ */

const EXTERNAL = /^(https?:|data:|mailto:|tel:|javascript:|#|\/\/)/i;

export function ruleLinks(root, p) {
  const out = [];
  const check = (file, url, line, what) => {
    if (!url) return;
    const decoded = url.replace(/%23/gi, '#');          /* %23 — это просто решётка */
    if (EXTERNAL.test(decoded)) return;
    const clean = decoded.split('#')[0].split('?')[0].trim();
    if (!clean) return;
    let target = resolve(root, dirname(file), clean);
    if (clean.startsWith('/')) {
      /* сайт живёт по адресу /games/: такой путь считаем от корня репозитория */
      const asRoot = resolve(root, clean.replace(/^\/games\//, '').replace(/^\//, ''));
      const asSite = resolve(root, 'site', clean.replace(/^\/games\//, '').replace(/^\//, ''));
      if (existsSync(asRoot)) target = asRoot;
      else if (existsSync(asSite)) target = asSite;
    }
    if (!existsSync(target)) {
      out.push(f('ссылка', clean.startsWith('/') ? 'важно' : 'критично', p.name, file, line,
        what + ' указывает на несуществующий файл: ' + url,
        'поправить путь или добавить файл'));
    }
  };
  for (const file of p.html) {
    const raw = read(root, file); if (raw == null) continue;
    /* внутри <script> ссылки собираются из кусков кода — проверять их нечестно */
    const src = raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (x) => x.replace(/[^\n]/g, ' '));
    for (const m of src.matchAll(/(?:src|href)\s*=\s*"([^"]*)"/g)) check(file, m[1], lineAt(src, m.index), 'ссылка в HTML');
    for (const m of src.matchAll(/url\((['"]?)([^'")]+)\1\)/g)) check(file, m[2], lineAt(src, m.index), 'url() в стилях');
  }
  for (const file of p.css) {
    const src = read(root, file); if (src == null) continue;
    for (const m of src.matchAll(/url\((['"]?)([^'")]+)\1\)/g)) check(file, m[2], lineAt(src, m.index), 'url() в CSS');
    for (const m of src.matchAll(/@import\s+url\((['"]?)([^'")]+)\1\)/g)) check(file, m[2], lineAt(src, m.index), '@import');
  }
  for (const file of p.md) {
    const src = read(root, file); if (src == null) continue;
    for (const m of src.matchAll(/\]\((?!https?:|mailto:|#)([^)\s]+)\)/g)) {
      const url = m[1];
      const target = resolve(root, dirname(file), url.split('#')[0]);
      if (!existsSync(target)) {
        out.push(f('ссылка', 'мелочь', p.name, file, lineAt(src, m.index),
          'ссылка в тексте ведёт в никуда: ' + url, 'поправить путь в документе'));
      }
    }
  }
  return out;
}

/* --------------------- 3. одинаковые id в разметке --------------------- */

export function ruleDomIds(root, p) {
  const out = [];
  const known = new Set();
  for (const file of p.html) {
    const raw = read(root, file); if (raw == null) continue;
    /* внутри <script> разметка рождается по ходу игры: там дубль id
       может быть задуман, а может быть багом — отдельное правило ниже */
    const src = raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (x) => x.replace(/[^\n]/g, ' '));
    for (const m of raw.matchAll(/\sid\s*=\s*\\?["']([\w\u0400-\u04FF-]+)/g)) known.add(m[1]);
    const seen = new Map();
    for (const m of src.matchAll(/\sid\s*=\s*"([^"]+)"/g)) {
      const id = m[1];
      known.add(id);
      if (seen.has(id)) {
        out.push(f('дубль-id', 'важно', p.name, file, lineAt(src, m.index),
          'id «' + id + '» встречается второй раз (первый — строка ' + seen.get(id) + ')',
          'getElementById вернёт только первый узел'));
      } else seen.set(id, lineAt(src, m.index));
    }
  }
  if (!p.html.length) return out;

  /* обращения к узлам, которых нет ни в разметке, ни в коде */
  const dynamic = new Set();
  for (const file of p.js) {
    const src = read(root, file); if (src == null) continue;
    for (const m of src.matchAll(/\.id\s*=\s*['"]([\w\u0400-\u04FF-]+)['"]/g)) dynamic.add(m[1]);
    for (const m of src.matchAll(/id\s*:\s*['"]([\w\u0400-\u04FF-]+)['"]/g)) dynamic.add(m[1]);
    for (const m of src.matchAll(/id=\\?["']([\w\u0400-\u04FF-]+)\\?["']/g)) dynamic.add(m[1]);
  }
  for (const file of p.js) {
    if (isVendor(file) || isTest(file)) continue;
    const src = read(root, file); if (src == null) continue;
    const code = src;
    const hits = [
      ...code.matchAll(/getElementById\(\s*['"]([\w\u0400-\u04FF-]+)['"]\s*\)/g),
      ...code.matchAll(/querySelector\(\s*['"]#([\w\u0400-\u04FF-]+)['"]\s*\)/g),
    ];
    for (const m of hits) {
      const id = m[1];
      if (known.has(id) || dynamic.has(id)) continue;
      /* если результат тут же проверяют на null — игра не упадёт,
         но узел всё равно потерян: кнопка не работает */
      const after = code.slice(m.index, m.index + 260);
      const varName = (code.slice(Math.max(0, m.index - 60), m.index)
        .match(/(?:const|let|var)\s+([A-Za-z_$\u0400-\u04FF][\w$\u0400-\u04FF]*)\s*=\s*(?:window\.)?(?:document\.)?$/) || [])[1];
      /* \b не работает с кириллицей: проверяем, что дальше нет буквы имени */
      const edge = '(?![\\w\\u0400-\\u04FF])';
      const guarded = varName
        ? new RegExp('(if\\s*\\(\\s*!?' + varName + edge + '|' + varName + '\\s*(&&|\\?\\.|\\?\\?))').test(after)
        : /\?\.|&&/.test(after.slice(0, 40));
      out.push(f('нет-узла', guarded ? 'мелочь' : 'важно', p.name, file, lineAt(code, m.index),
        'код ищет #' + id + ', но такого id нет ни в разметке, ни в создаваемых узлах',
        guarded ? 'падения не будет, но этот элемент интерфейса не работает'
          : 'обращение вернёт null — дальше будет TypeError'));
    }
  }
  return out;
}

/* ------------- 4. кириллица внутри кода (не в тексте и не в комментарии) ------------- */

const CYR = /[\u0400-\u04FF]/;

export function ruleCyrillicCode(root, p) {
  const out = [];
  for (const file of p.js) {
    if (isVendor(file)) continue;
    const src = read(root, file); if (src == null) continue;
    const code = stripCode(src);
    /* Имена целиком по-русски — это нормально, так в репозитории пишут.
       Опасно другое: когда в одном слове есть и латиница, и кириллица —
       буквы а, е, о, с, р, х, у, і выглядят одинаково, а кодом различаются. */
    for (const m of code.matchAll(/[\w$\u0400-\u04FF]+/g)) {
      const word = m[0];
      if (!CYR.test(word)) continue;
      if (!/[A-Za-z]/.test(word)) continue;
      out.push(f('кириллица-в-коде', 'критично', p.name, file, lineAt(code, m.index),
        'в имени «' + word + '» смешаны кириллица и латиница',
        'буквы а, е, о, с, р, х, у, і выглядят одинаково — такое имя никогда не совпадёт'));
    }
  }
  return out;
}

/* ------------------------- 5. данные: JSON ---------------------------- */

export function ruleJson(root, p) {
  const out = [];
  for (const file of p.json) {
    const src = read(root, file); if (src == null) continue;
    try {
      JSON.parse(src);
    } catch (e) {
      out.push(f('json-разбор', 'критично', p.name, file, 1, 'файл данных не читается: ' + e.message,
        'JSON.parse падает — игра не получит данные'));
      continue;
    }
    /* повторяющиеся ключи JSON.parse молча съедает, а данные теряются */
    const keys = new Map();
    let depth = 0;
    const re = /"((?:[^"\\]|\\.)*)"\s*:|[{}]/g;
    let m;
    while ((m = re.exec(src))) {
      if (m[0] === '{') { depth++; keys.set(depth, new Map()); continue; }
      if (m[0] === '}') { keys.delete(depth); depth--; continue; }
      const map = keys.get(depth);
      if (!map) continue;
      const k = m[1];
      if (map.has(k)) {
        out.push(f('дубль-ключа-json', 'важно', p.name, file, lineAt(src, m.index),
          'ключ «' + k + '» повторяется (первый — строка ' + map.get(k) + ')',
          'останется только последнее значение'));
      } else map.set(k, lineAt(src, m.index));
    }
  }
  return out;
}

/* ----------------- 6. офлайн-правило: внешние запросы ------------------ */

const NET_OK = /w3\.org|github\.com|githubusercontent|github\.io|schema\.org|example\.com|localhost|127\.0\.0\.1|creativecommons|opensource\.org|unicode\.org/;

export function ruleOffline(root, p) {
  const out = [];
  for (const file of [...p.html, ...p.js]) {
    if (isTest(file) || isVendor(file)) continue;
    const src = read(root, file); if (src == null) continue;
    /* комментарии убираем, строки оставляем: адрес живёт именно в строке */
    const code = /\.html?$/.test(file)
      ? src.replace(/<!--[\s\S]*?-->/g, (x) => x.replace(/[^\n]/g, ' '))
      : src.replace(/\/\*[\s\S]*?\*\//g, (x) => x.replace(/[^\n]/g, ' ')).replace(/(^|[^:])\/\/[^\n]*/g, (x, a1) => a1 + ' '.repeat(x.length - a1.length));
    for (const m of code.matchAll(/https?:\/\/[^\s"'`)<>]+/g)) {
      const url = m[0];
      if (NET_OK.test(url)) continue;
      const line = lineAt(code, m.index);
      const context = code.slice(Math.max(0, m.index - 60), m.index).toLowerCase();
      if (/(^|\s)(\*|\/\/|<!--)/.test(context.slice(-12))) continue;      /* это комментарий */
      const before = code.slice(Math.max(0, m.index - 120), m.index);
      const isLink = /<a\b[^>]*href\s*=\s*["']?$/i.test(before) || /\[[^\]]*\]\($/.test(before);
      const isLoad = /(fetch\s*\(|XMLHttpRequest|\.open\s*\(|import\s*\(|src\s*=\s*["']?$|importScripts)/i.test(before);
      out.push(f('внешний-запрос', isLoad ? 'важно' : isLink ? 'мелочь' : 'мелочь', p.name, file, line,
        (isLoad ? 'игра тянет данные из сети: ' : 'ссылка наружу: ') + url.slice(0, 80),
        isLoad ? 'игры в каталоге обязаны работать без сети' : 'сама по себе ссылка не мешает игре работать офлайн'));
    }
  }
  return out;
}

/* --------------------- 7. опасные места в коде ------------------------ */

export function ruleCodeSmells(root, p) {
  const out = [];
  for (const file of p.js) {
    if (isVendor(file)) continue;
    const src = read(root, file); if (src == null) continue;
    const code = stripCode(src);

    for (const m of code.matchAll(/\bdebugger\b/g)) {
      out.push(f('отладчик', 'важно', p.name, file, lineAt(code, m.index),
        'в коде остался debugger', 'у игрока остановится вкладка'));
    }
    for (const m of code.matchAll(/[!=]==?\s*NaN|NaN\s*[!=]==?/g)) {
      out.push(f('сравнение-с-nan', 'важно', p.name, file, lineAt(code, m.index),
        'сравнение с NaN всегда ложно: ' + m[0].trim(), 'нужен Number.isNaN(x)'));
    }
    for (const m of code.matchAll(/\bif\s*\(\s*[\w.[\]]+\s*=\s*(?!=)[^;)]+\)/g)) {
      out.push(f('присваивание-в-условии', 'важно', p.name, file, lineAt(code, m.index),
        'в условии стоит присваивание: ' + m[0].slice(0, 60), 'вероятно, нужно == или ==='));
    }
    for (const m of code.matchAll(/catch\s*(\([^)]*\))?\s*\{\s*\}/g)) {
      out.push(f('пустой-catch', 'мелочь', p.name, file, lineAt(code, m.index),
        'ошибка ловится и молча выбрасывается', 'хотя бы записать её в консоль'));
    }
    /* Дважды объявленная функция в одной области видимости: вторая молча
       перекрывает первую. Одинаковые имена в разных функциях — норма,
       поэтому считаем вложенность по скобкам. */
    const funcs = new Map();
    const stack = [];
    const decl = /(?:async\s+)?function\s+([A-Za-z_$\u0400-\u04FF][\w$\u0400-\u04FF]*)\s*\(/g;
    let di = 0, next = decl.exec(code);
    for (let k = 0; k < code.length; k++) {
      const ch = code[k];
      if (ch === '{') stack.push(k);
      else if (ch === '}') stack.pop();
      while (next && next.index === k) {
        const name = next[1], line = lineAt(code, k);
        const scope = (stack.length ? stack[stack.length - 1] : 'файл') + '|' + name;
        if (funcs.has(scope)) {
          out.push(f('дубль-функции', 'важно', p.name, file, line,
            'функция ' + name + ' объявлена в одной области видимости второй раз (первая — строка ' +
            funcs.get(scope) + ')', 'работать будет только последняя'));
        } else funcs.set(scope, line);
        next = decl.exec(code);
        di++;
        if (di > 5000) break;
      }
    }
    /* const/let с тем же именем в одной области видимости найдёт сам Node,
       а вот повтор ключа в литерале объекта — нет */
    for (const m of code.matchAll(/\{[^{}]{0,4000}\}/g)) {
      const body = m[0];
      if (!/:/.test(body)) continue;
      const seen = new Map();
      for (const k of body.matchAll(/(^|[,{])\s*([A-Za-z_$\u0400-\u04FF][\w$\u0400-\u04FF]*)\s*:/g)) {
        const name = k[2];
        if (['default', 'case'].includes(name)) continue;
        if (seen.has(name)) {
          out.push(f('дубль-ключа', 'важно', p.name, file, lineAt(code, m.index + k.index),
            'в одном объекте дважды задано поле ' + name, 'останется только последнее значение'));
        } else seen.set(name, true);
      }
    }
  }
  return out;
}

/* ------------- 8. случайность без зерна там, где есть зерно ------------ */

export function ruleSeed(root, p) {
  const out = [];
  /* игра считается «с зерном», только если свой генератор где-то объявлен */
  const seeded = p.js.some((file) => {
    if (isVendor(file)) return false;
    const src = read(root, file);
    return src && /(function\s+mulberry32|mulberry32\s*=|function\s+xorshift|hashSeed\s*[=(]|seedRandom\s*=)/.test(src);
  });
  if (!seeded) return out;
  /* рисование, звук и интерфейс могут шуметь как хотят: на расчёт это
     не влияет. Важна случайность в самой модели мира. */
  const VISUAL = /(portrait|charts?|anim|render|fx|particle|sound|audio|ui|view|view3d|draw|paint|visual|main)\.js$/i;
  let total = 0, fallback = 0, first = null, filesHit = new Set();
  for (const file of p.js) {
    if (isVendor(file) || isTest(file) || VISUAL.test(file)) continue;
    const src = read(root, file); if (src == null) continue;
    const code = stripCode(src);
    const lines = code.split('\n');
    for (const m of code.matchAll(/Math\.random\s*\(/g)) {
      const line = lineAt(code, m.index);
      const text = lines[line - 1] || '';
      /* случайное зерно новой игры — единственная честная причина */
      if (/seed|uuid|id\s*[:=]/i.test(text)) continue;
      /* запасной путь «есть генератор — берём его, нет — Math.random» */
      if (/(rng|rnd|random)\s*(\?|\?\?|&&|\|\|)/i.test(text)) { fallback++; continue; }
      total++; filesHit.add(file);
      if (!first) first = { file, line };
    }
  }
  if (!total && fallback) {
    out.push(f('случайность-без-зерна', 'мелочь', p.name, p.js[0], 1,
      'Math.random() стоит запасным путём ' + fallback + ' раз, когда генератор по зерну не передали',
      'в такие ветки игра попадать не должна — иначе повтор по зерну разойдётся'));
  }
  if (total) {
    out.push(f('случайность-без-зерна', 'важно', p.name, first.file, first.line,
      'Math.random() встречается ' + total + ' раз в ' + filesHit.size +
      ' файлах игры со своим генератором по зерну',
      'одно зерно должно давать одну и ту же игру — иначе повтор, сохранение и тесты врут'));
  }
  return out;
}

/* ---------------- 9. хранилище и разбор данных без защиты -------------- */

export function ruleFragile(root, p) {
  const out = [];
  for (const file of p.js) {
    if (isVendor(file) || isTest(file)) continue;
    const src = read(root, file); if (src == null) continue;
    const code = stripCode(src);
    const lines = code.split('\n');
    const guarded = (idx) => {
      const from = Math.max(0, idx - 6);
      return lines.slice(from, idx + 1).join(' ').includes('try');
    };
    for (const m of code.matchAll(/JSON\.parse\s*\(/g)) {
      const ln = lineAt(code, m.index);
      if (guarded(ln - 1)) continue;
      out.push(f('разбор-без-защиты', 'мелочь', p.name, file, ln,
        'JSON.parse без try — битое сохранение уронит игру', 'обернуть в try/catch'));
    }
    for (const m of code.matchAll(/localStorage\.(getItem|setItem|removeItem)\s*\(/g)) {
      const ln = lineAt(code, m.index);
      if (guarded(ln - 1)) continue;
      out.push(f('хранилище-без-защиты', 'мелочь', p.name, file, ln,
        'localStorage без try — в приватном режиме браузера это исключение',
        'обернуть в try/catch'));
    }
  }
  return out;
}

/* ------------------ 10. файлы, которые никто не грузит ----------------- */

export function ruleOrphans(root, p) {
  const out = [];
  if (!p.html.length) return out;
  const all = [...p.html, ...p.js, ...p.md].map((file) => read(root, file) || '').join('\n');
  for (const file of p.js) {
    if (/\/(tests?|tools)\//.test(file)) continue;
    const name = file.slice(file.lastIndexOf('/') + 1);
    const used = all.includes(name);
    if (!used) {
      out.push(f('сирота', 'мелочь', p.name, file, 1,
        'файл есть, но его никто не загружает', 'подключить или удалить'));
    }
  }
  return out;
}

/* ------------------------ 11. тяжёлые файлы --------------------------- */

export function ruleWeight(root, p) {
  const out = [];
  for (const file of p.files) {
    const size = sizeOf(root, file);
    if (size > 6 * 1024 * 1024) {
      out.push(f('большой-файл', 'мелочь', p.name, file, 1,
        'файл весит ' + (size / 1048576).toFixed(1) + ' МБ',
        'страница будет долго открываться на телефоне'));
    }
  }
  return out;
}

/* --------------- 12. разметка: незакрытые блоки и пустые ссылки -------- */

const PAIRED = ['div', 'section', 'main', 'header', 'footer', 'nav', 'ul', 'ol', 'li',
  'table', 'tbody', 'tr', 'td', 'th', 'details', 'select', 'button', 'label', 'form', 'canvas'];

export function ruleHtml(root, p) {
  const out = [];
  for (const file of p.html) {
    const raw = read(root, file); if (raw == null) continue;
    const src = raw.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)[\s\S]*?<\/\1>/gi, '');
    for (const tag of PAIRED) {
      const open = (src.match(new RegExp('<' + tag + '[\\s>]', 'gi')) || []).length;
      const close = (src.match(new RegExp('</' + tag + '\\s*>', 'gi')) || []).length;
      if (open !== close) {
        out.push(f('разметка', 'важно', p.name, file, 1,
          '<' + tag + '>: открыто ' + open + ', закрыто ' + close,
          'браузер закроет теги сам, и вёрстка поедет'));
      }
    }
    if (!/<meta\s+name="viewport"/i.test(src) && /<body/i.test(src)) {
      out.push(f('разметка', 'мелочь', p.name, file, 1, 'нет meta viewport',
        'на телефоне страница откроется в масштабе рабочего стола'));
    }
    if (!/lang\s*=\s*"/i.test(src) && /<html/i.test(src)) {
      out.push(f('разметка', 'мелочь', p.name, file, 1, 'у <html> нет атрибута lang', ''));
    }
  }
  return out;
}

import { checkDataDuplicates, checkLinks2, checkPathCase, checkCodeExtras, checkSecurity,
  checkMarkup, checkAssets, checkTree, checkSecrets, checkTodo, checkDoubles, checkReadme,
  checkPackages, checkTestsHead, checkPerf, checkRepoCi } from './checks.mjs';

/* Порядок = порядок в отчёте. `repo: true` — проверка на весь репозиторий. */
export const STATIC_RULES = [
  { id: 'синтаксис', fn: ruleSyntax, async: true },
  { id: 'ссылки', fn: ruleLinks },
  { id: 'разметка-id', fn: ruleDomIds },
  { id: 'кириллица', fn: ruleCyrillicCode },
  { id: 'данные', fn: ruleJson },
  { id: 'офлайн', fn: ruleOffline },
  { id: 'код', fn: ruleCodeSmells },
  { id: 'зерно', fn: ruleSeed },
  { id: 'хрупкое', fn: ruleFragile },
  { id: 'сироты', fn: ruleOrphans },
  { id: 'вес', fn: ruleWeight },
  { id: 'html', fn: ruleHtml },
  /* --- проверки, добавленные вместе с таблицей кодов --- */
  { id: 'дерево', fn: checkTree },
  { id: 'секреты', fn: checkSecrets },
  { id: 'todo', fn: checkTodo },
  { id: 'двойники', fn: checkDoubles },
  { id: 'readme', fn: checkReadme },
  { id: 'данные-дубли', fn: checkDataDuplicates },
  { id: 'ссылки-2', fn: checkLinks2 },
  { id: 'регистр-путей', fn: checkPathCase },
  { id: 'код-дополнительно', fn: checkCodeExtras },
  { id: 'безопасность', fn: checkSecurity },
  { id: 'разметка-дополнительно', fn: checkMarkup },
  { id: 'ассеты', fn: checkAssets },
  { id: 'производительность', fn: checkPerf },
  { id: 'пакеты', fn: checkPackages },
  { id: 'тесты-шапка', fn: checkTestsHead },
  { id: 'ci', fn: checkRepoCi, repo: true },
];
