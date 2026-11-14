/* Детекторы бота-багоискателя, привязанные к таблице кодов (lib/catalog.mjs).
   Каждый детектор возвращает находки { rule, severity, project, file, line, msg, hint },
   где rule — имя проверки из каталога; код (000–999) подставляется в отчёте.

   Два вида правил:
     project — вызывается для каждой папки первого уровня;
     repo    — один раз на весь репозиторий (псевдопроект «репозиторий»).

   Важнее всего — не врать: каждое правило проверено на честном коде репозитория.
   Там, где совпадение регекспа не доказывает ошибку, правило либо молчит, либо
   понижается до мелочи. Ложные «важно» обесценивают отчёт быстрее пропусков.
   ============================================================================= */

import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, basename, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { read, stripCode, lineAt, sizeOf } from './scan.mjs';

const f = (rule, severity, project, file, line, msg, hint) =>
  ({ rule, severity, project, file: file || '—', line: line || 1, msg, hint: hint || '' });

const isVendorFile = (file) =>
  /bundle\.js$|\.min\.js$|(^|\/)(vendor|three|cannon|ammo|draco)[.\/-]|\/libs?\//i.test(file);
const isTestFile = (file) =>
  /\/(tests?|tools|scripts|benches)\//.test(file) || /\.(test|spec)\.m?js$/.test(file);
const isDocFile = (file) => /\.md$/i.test(file);

const hits = (code, re) => [...code.matchAll(re)];

/* строка с находкой — чтобы в отчёте было видно, о чём речь */
function snippet(src, code, index, width = 90) {
  const line = lineAt(code, index);
  const text = (src.split('\n')[line - 1] || '').trim();
  return text.length > width ? text.slice(0, width) + '…' : text;
}

function codeFiles(root, p) {
  return p.js.filter((file) => !isVendorFile(file) && !isTestFile(file));
}

/* ============================ 1xx: ДАННЫЕ ============================= */

function parseJsonFiles(root, p) {
  const out = [];
  for (const file of p.json) {
    if (/package-lock\.json$|\.map$/.test(file)) continue;
    /* отчёты и бейзлайны аудита — дампы «как было», а не данные игры */
    if (/\/(docs|reports?|audit)\/|(baseline|audit|report|snapshot|fixture)/i.test(file)) continue;
    const src = read(root, file);
    if (src == null) continue;
    try { out.push({ file, src, data: JSON.parse(src) }); } catch { /* битый JSON ловит 102 */ }
  }
  return out;
}

export function checkDataDuplicates(root, p) {
  const out = [];
  const walkData = (node, file, path) => {
    if (Array.isArray(node)) {
      const seen = new Set();
      for (const item of node) {
        if (!item || typeof item !== 'object') continue;
        const id = item.id ?? item.code ?? item.name ?? item.key;
        if (typeof id !== 'string' && typeof id !== 'number') continue;
        const key = String(id);
        if (seen.has(key)) {
          out.push(f('дубль-id-данных', 'важно', p.name, file, 1,
            'в списке ' + (path || 'корень') + ' id «' + key + '» встречается дважды',
            'вторая запись перекрывает первую при поиске по id'));
        } else seen.add(key);
      }
      node.forEach((x, i) => walkData(x, file, path + '[' + i + ']'));
    } else if (node && typeof node === 'object') {
      const lower = new Map();
      for (const [k, v] of Object.entries(node)) {
        const low = k.toLowerCase();
        if (lower.has(low) && lower.get(low) !== k) {
          out.push(f('регистр-ключа', 'важно', p.name, file, 1,
            'ключи «' + lower.get(low) + '» и «' + k + '» различаются только регистром',
            'обращение через toLowerCase() вернёт не то поле'));
        } else lower.set(low, k);
        if (typeof v === 'string' && v.trim() === '') {
          out.push(f('пустая-строка', 'мелочь', p.name, file, 1,
            'поле «' + k + '» — пустая строка', 'пустое название видно в интерфейсе'));
        }
        if (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim()) &&
            /(count|damage|hp|speed|mass|price|cost|size|radius|rate|ammo|level)$/i.test(k)) {
          out.push(f('число-строкой', 'мелочь', p.name, file, 1,
            'числовое поле «' + k + '» записано строкой: "' + v + '"',
            'сложение склеит строки, а не сложит числа'));
        }
        walkData(v, file, path ? path + '.' + k : k);
      }
    }
  };
  for (const { file, src, data } of parseJsonFiles(root, p)) {
    if (!data || typeof data !== 'object') continue;
    const empty = Array.isArray(data) ? data.length === 0 : Object.keys(data).length === 0;
    if (empty) {
      out.push(f('пустые-данные', 'важно', p.name, file, 1, 'файл данных пуст',
        'данные не загрузились или потерялись'));
    }
    for (const m of hits(src, /\b(-?Infinity|NaN)\b/g)) {
      out.push(f('нечисло-в-json', 'критично', p.name, file, lineAt(src, m.index),
        'в JSON стоит ' + m[1] + ' — это невалидный JSON', 'JSON.parse упадёт или поле станет null'));
    }
    walkData(data, file, '');
  }
  return out;
}

/* ============================ 2xx: ССЫЛКИ ============================= */

function collectLinks(root, p) {
  const out = [];
  for (const file of p.html) {
    const src = read(root, file); if (src == null) continue;
    const clean = src.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (x) => x.replace(/[^\n]/g, ' '));
    for (const m of hits(clean, /\s(?:href|src)\s*=\s*"([^"]*)"/g)) {
      out.push({ file, line: lineAt(clean, m.index), url: m[1], kind: 'html' });
    }
    for (const m of hits(clean, /\sid\s*=\s*"([^"]+)"/g)) {
      out.push({ file, line: lineAt(clean, m.index), anchor: m[1] });
    }
  }
  for (const file of p.css) {
    const src = read(root, file); if (src == null) continue;
    const clean = src.replace(/\/\*[\s\S]*?\*\//g, (x) => x.replace(/[^\n]/g, ' '));
    for (const m of hits(clean, /url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
      out.push({ file, line: lineAt(clean, m.index), url: m[1], kind: 'css' });
    }
    for (const m of hits(clean, /@import\s+['"]([^'"]+)['"]/g)) {
      out.push({ file, line: lineAt(clean, m.index), url: m[1], kind: 'css' });
    }
  }
  for (const file of p.md) {
    const src = read(root, file); if (src == null) continue;
    const clean = src.replace(/```[\s\S]*?```/g, (x) => x.replace(/[^\n]/g, ' '));
    for (const m of hits(clean, /\]\(\s*([^)\s]+)\s*\)/g)) {
      out.push({ file, line: lineAt(clean, m.index), url: m[1], kind: 'md' });
    }
  }
  return out;
}

const EXTERNAL = /^(https?:|data:|mailto:|tel:|javascript:|#|\/\/|%23)/i;

function resolveLink(root, file, url) {
  const clean = url.replace(/%23/gi, '#').split('#')[0].split('?')[0].trim();
  if (!clean) return null;
  const candidates = [];
  if (clean.startsWith('/')) {
    candidates.push(resolve(root, clean.replace(/^\/games\//, '').replace(/^\//, '')));
    candidates.push(resolve(root, 'site', clean.replace(/^\/games\//, '').replace(/^\//, '')));
  } else {
    candidates.push(resolve(root, dirname(file), clean));
  }
  for (const c of candidates) if (existsSync(c)) return c;
  return { missing: candidates[0] };
}

export function checkLinks2(root, p) {
  const out = [];
  const anchors = new Map();
  for (const file of p.html) {
    const src = read(root, file) || '';
    anchors.set(file, new Set([...src.matchAll(/\sid\s*=\s*"([^"]+)"/g)].map((m) => m[1])));
  }
  for (const link of collectLinks(root, p)) {
    if (link.anchor) continue;
    const url = link.url;
    if (!url) continue;

    if (url.startsWith('#')) {
      if (url.length > 1) {
        const ids = anchors.get(link.file) || new Set();
        if (!ids.has(url.slice(1))) {
          out.push(f('якорь', 'мелочь', p.name, link.file, link.line,
            'ссылка ' + url + ' ведёт на якорь, которого нет', 'прокрутки не случится'));
        }
      }
      continue;
    }
    if (EXTERNAL.test(url)) {
      if (/^http:\/\//i.test(url) && !/localhost|127\.0\.0\.1/.test(url)) {
        out.push(f('http-ссылка', 'мелочь', p.name, link.file, link.line,
          'ссылка по http:// вместо https://: ' + url.slice(0, 60),
          'браузер пометит страницу как небезопасную'));
      }
      continue;
    }
    if (/node_modules\//.test(url)) {
      out.push(f('ссылка-на-node_modules', 'важно', p.name, link.file, link.line,
        'ссылка ведёт внутрь node_modules: ' + url, 'на опубликованном сайте этого каталога нет'));
      continue;
    }
    if (/\\/.test(url)) {
      out.push(f('слэш', 'важно', p.name, link.file, link.line,
        'в пути стоят обратные слэши: ' + url, 'в URL нужен обычный /'));
    }
    if (/^[a-z]:[\\/]/i.test(url) || /^file:\/\//i.test(url)) {
      out.push(f('абсолютный-путь', 'важно', p.name, link.file, link.line,
        'абсолютный путь к файлу: ' + url, 'на другой машине такого пути нет'));
    }
    /* пробелы и кириллица в пути к файлу — беда; в якоре #раздел — норма */
    if (/[А-Яа-яЁё ]/.test(url.split('#')[0]) && !/^data:/.test(url)) {
      out.push(f('url-кодировка', 'важно', p.name, link.file, link.line,
        'в адресе кириллица или пробел без кодирования: ' + url.slice(0, 60),
        'браузер закодирует по-своему, а сервер может не найти файл'));
    }
    if (url.split('/').filter((x) => x === '..').length > 3) {
      out.push(f('побег-из-проекта', 'важно', p.name, link.file, link.line,
        'путь уходит далеко вверх по дереву: ' + url, 'проверьте, что файл правда там'));
    }
    const got = resolveLink(root, link.file, url);
    if (link.kind === 'md' || /\.md$/i.test(url)) {
      if (got && got.missing) {
        out.push(f('ссылка-md', 'важно', p.name, link.file, link.line,
          'ссылка из документации ведёт в никуда: ' + url, 'читатель упрётся в 404'));
      }
      continue;
    }
    if (/^[a-zA-Z0-9_.-]+$/.test(url) && link.kind === 'html') {
      const self = resolve(root, dirname(link.file), url);
      if (self === resolve(root, link.file)) {
        out.push(f('ссылка-на-себя', 'мелочь', p.name, link.file, link.line,
          'страница ссылается сама на себя: ' + url, 'выглядит как «обновить», но перезагружает всё'));
      }
    }
  }
  return out;
}

/* Регистр букв в пути: файл есть, но записан другими буквами. На Linux
   такой ассет не найдётся, хотя на Windows всё работало. */
export function checkPathCase(root, p) {
  const out = [];
  const lower = new Map();
  for (const file of p.files) {
    const key = file.toLowerCase();
    if (!lower.has(key)) lower.set(key, []);
    lower.get(key).push(file);
  }
  for (const link of collectLinks(root, p)) {
    const url = link.url;
    if (!url || EXTERNAL.test(url) || url.startsWith('/')) continue;
    const clean = decodeURIComponent(url.split('#')[0].split('?')[0]);
    if (!clean) continue;
    const abs = resolve(root, dirname(link.file), clean);
    if (existsSync(abs)) continue;
    const real = lower.get(relative(root, abs).toLowerCase());
    if (real && real.length) {
      out.push(f('регистр-пути', 'важно', p.name, link.file, link.line,
        'ссылка «' + clean + '» отличается от файла регистром: на диске «' + real[0] + '»',
        'на Linux-хостинге (и у GitHub Pages) такой файл не найдётся'));
    }
  }
  return out;
}

/* ============================ 3xx: КОД =============================== */

export function checkCodeExtras(root, p) {
  const out = [];
  for (const file of codeFiles(root, p)) {
    const src = read(root, file); if (src == null) continue;
    const code = stripCode(src);

    for (const m of hits(code, /\bthrow\s+(['"`])/g)) {
      out.push(f('throw-строки', 'мелочь', p.name, file, lineAt(code, m.index),
        'бросают строку: ' + snippet(src, code, m.index),
        'у строки нет стека — нужен new Error'));
    }
    for (const m of hits(code, /\bset(?:Timeout|Interval)\s*\(\s*(['"`])/g)) {
      out.push(f('таймер-строка', 'важно', p.name, file, lineAt(code, m.index),
        'таймер получает строку вместо функции: ' + snippet(src, code, m.index),
        'строка исполняется через eval и ломает CSP'));
    }
    for (const m of hits(code, /\bdocument\.write\s*\(/g)) {
      out.push(f('document-write', 'важно', p.name, file, lineAt(code, m.index),
        'document.write после загрузки стирает страницу', 'используйте createElement'));
    }
    /* только голые вызовы: promptEvent.prompt() — это не модальное окно */
    /* модальное окно — это голый вызов. Всё, что идёт после точки или
       объявлено функцией (local prompt(text) { … }), бот не трогает:
       promptEvent.prompt() и своя функция prompt — не окна браузера. */
    for (const m of hits(code, /(^|[^.\w$])(alert|confirm|prompt)\s*\(/g)) {
      const line = lineAt(code, m.index);
      const text = (src.split('\n')[line - 1] || '').trim();
      if (/^(\/\/|\*|return|\w+\s*:)/.test(text)) continue;
      const before = code.slice(Math.max(0, m.index - 80), m.index);
      if (/\bfunction\s*$|\b(?:async|get|set|static)\s*$/.test(before)) continue;   /* объявление */
      out.push(f('alert', 'важно', p.name, file, line,
        'модальное окно ' + m[2] + ' блокирует игру',
        'на телефоне такое окно перекрывает весь экран; нужен свой диалог'));
    }
    /* один console.log — точка отладки, десять — незакрытая отладка */
    const logs = hits(code, /\bconsole\.(log|info|debug)\s*\(/g);
    if (logs.length > 8) {
      out.push(f('отладочный-лог', 'мелочь', p.name, file, lineAt(code, logs[0].index),
        'в боевом коде ' + logs.length + ' вызовов console.' + logs[0][1],
        'столько отладочных логов осталось после разработки — вычистить'));
    }
    for (const m of hits(code, /\bparseInt\s*\(\s*[^,)]+\)/g)) {
      out.push(f('parseint-основание', 'мелочь', p.name, file, lineAt(code, m.index),
        'parseInt без основания: ' + m[0].slice(0, 60), '«08» может стать 0 — передайте 10'));
    }

    /* «id === id» — почти всегда забытое obj. Слева не должно стоять точки
       или имени (`obj.id === id` — это сравнение поля с параметром), а
       область видимости проверять не надо: параметр, сравнённый с собой,
       такой же всегда-истинный баг. */
    for (const m of hits(code, /(^|[^.\w$])([A-Za-z_$][\w$]*)\s*===\s*\2\b/g)) {
      const line = lineAt(code, m.index);
      if (/sort|compare|компаратор/.test(code.slice(Math.max(0, m.index - 60), m.index) +
          (src.split('\n')[line - 1] || ''))) continue;
      out.push(f('тавтология', 'важно', p.name, file, line,
        'сравнение переменной с самой собой: ' + m[0].trim(),
        'всегда истина — условие ничего не проверяет'));
    }
    for (const m of hits(code, /(^|[^.\w$])([A-Za-z_$][\w$]*)\s*=\s*\2\s*;/g)) {
      out.push(f('самоприсваивание', 'важно', p.name, file, lineAt(code, m.index),
        'переменная присвоена сама себе: ' + m[0].trim(),
        'вероятно, забыли поменять правую часть'));
    }
    for (const m of hits(code, /finally\s*\{[^}]*\breturn\b/gs)) {
      out.push(f('return-в-finally', 'важно', p.name, file, lineAt(code, m.index),
        'return внутри finally глушит ошибку', 'исключение перестанет доходить до catch снаружи'));
    }
    for (const m of hits(code, /\.forEach\s*\(\s*async\b/g)) {
      out.push(f('await-в-foreach', 'важно', p.name, file, lineAt(code, m.index),
        'async-колбэк в forEach: итерации не ждут друг друга', 'нужен for..of с await'));
    }
    for (const m of hits(code, /\/\s*0\b(?!\.\d|[xX])/g)) {
      const before = code.slice(Math.max(0, m.index - 1), m.index);
      if (!/[\w)\]]/.test(before)) continue;      /* двойной слэш — комментарий */
      out.push(f('деление-на-ноль', 'критично', p.name, file, lineAt(code, m.index),
        'деление на литеральный ноль: ' + snippet(src, code, m.index), 'результат — Infinity'));
    }
    for (const m of hits(code, /\bisNaN\s*\(/g)) {
      out.push(f('isnan', 'мелочь', p.name, file, lineAt(code, m.index),
        'глобальный isNaN приводит аргумент к числу', 'для проверки числа нужен Number.isNaN'));
    }
    for (const m of hits(code, /(?:===|!==)\s*-?\d+\.\d+/g)) {
      out.push(f('float-равенство', 'мелочь', p.name, file, lineAt(code, m.index),
        'сравнение с числом с плавающей точкой: ' + m[0].trim(),
        '0.1 + 0.2 !== 0.3 — сравнивайте с допуском'));
    }
    for (const m of hits(code, /\bwhile\s*\(\s*true\s*\)/g)) {
      if (!/\b(break|return|throw)\b/.test(code.slice(m.index, m.index + 800))) {
        out.push(f('бесконечный-цикл', 'важно', p.name, file, lineAt(code, m.index),
          'while (true) без break и return рядом', 'браузер зависнет навсегда'));
      }
    }
    if (/requestAnimationFrame/.test(code) && !/cancelAnimationFrame/.test(code)) {
      out.push(f('анимация-без-отмены', 'мелочь', p.name, file, 1,
        'цикл requestAnimationFrame нигде не отменяется',
        'после выхода с экрана он продолжит жечь кадры'));
    }
    if (/setInterval\s*\(/.test(code) && !/clearInterval/.test(code)) {
      out.push(f('интервал-без-очистки', 'мелочь', p.name, file, 1,
        'setInterval заведён, а clearInterval нигде нет', 'таймеры копятся при каждом входе на экран'));
    }
    for (const m of hits(code, /setInterval\s*\([^,]+,\s*(\d{1,2})\s*\)/g)) {
      const ms = Number(m[1]);
      if (ms > 0 && ms < 16) {
        out.push(f('частый-таймер', 'мелочь', p.name, file, lineAt(code, m.index),
          'setInterval каждые ' + ms + ' мс — чаще кадра', 'на телефоне это лишняя нагрузка'));
      }
    }
    /* Обработчик в цикле — баг, только если его вешают на ОДИН И ТОТ ЖЕ
       узел, объявленный до цикла. Внутри цикла по массиву узлов это норма,
       и «свежий» узел (let badge внутри тела) тоже норма. */
    for (const m of hits(code, /\bfor\s*\([^)]*\)\s*\{/g)) {
      const open = code.indexOf('{', m.index);
      let depth = 0, close = open;
      for (let k = open; k < code.length; k++) {
        if (code[k] === '{') depth++;
        else if (code[k] === '}') { depth--; if (depth === 0) { close = k; break; } }
      }
      const body = code.slice(open, close);
      const loopVar = (code.slice(m.index, open).match(/\b(?:const|let|var)\s+([\w$]+)\s+(?:of|in)\b/) || [])[1];
      for (const ev of body.matchAll(/([A-Za-z_$][\w$.]*)\.addEventListener\s*\(\s*([\w$]*)/g)) {
        if (loopVar && ev[2] === loopVar) continue;
        const target = ev[1];
        if (target.includes('.') || target === 'this') continue;
        if (new RegExp('\\b(?:const|let|var)\\s+' + target + '\\b').test(body.slice(0, ev.index))) continue;
        if (!new RegExp('\\b(?:const|let|var|function)\\s+(?:[^;=]*?\\b)?' + target + '\\s*=').test(code.slice(0, m.index))) continue;
        out.push(f('обработчик-в-цикле', 'важно', p.name, file, lineAt(code, open + ev.index),
          'обработчик ' + target + '.addEventListener навешивается в цикле на один и тот же узел',
          'к концу цикла их будет столько же, сколько итераций — течёт память и двойные срабатывания'));
      }
    }
    /* строка копится через += в цикле: на длинном списке это квадрат */
    for (const m of hits(code, /\b(?:let|var)\s+([\w$]+)\s*=\s*['"`]/g)) {
      const name = m[1];
      const window = code.slice(m.index, m.index + 4000);
      if (!new RegExp('\\bfor\\s*\\(').test(window.slice(0, 3000))) continue;
      if (!new RegExp('\\b' + name + '\\s*\\+=').test(window)) continue;
      out.push(f('склейка-в-цикле', 'мелочь', p.name, file, lineAt(code, m.index),
        'строка ' + name + ' накапливается через += в цикле',
        'лучше собрать в массив и склеить один раз: join()'));
      break;
    }
    for (const m of hits(code, /\bJSON\.parse\s*\(\s*JSON\.stringify\s*\(/g)) {
      out.push(f('глубокая-копия', 'мелочь', p.name, file, lineAt(code, m.index),
        'копия через JSON.parse(JSON.stringify())', 'теряет undefined, даты и ссылки на объекты'));
    }
    if (/innerHTML\s*\+=/.test(code) && /for\s*\(/.test(code)) {
      out.push(f('innerhtml-в-цикле', 'мелочь', p.name, file, 1,
        'innerHTML наращивается в цикле', 'браузер переразберёт разметку на каждой итерации'));
    }
    for (const m of hits(code, /for\s*\(\s*(?:const|let|var)\s+(\w+)\s+in\s+(\w+)\s*\)/g)) {
      const name = m[2];
      if (new RegExp('\\b(?:const|let|var)\\s+' + name + '\\s*=\\s*\\[').test(code)) {
        out.push(f('for-in-массив', 'мелочь', p.name, file, lineAt(code, m.index),
          'for..in по массиву ' + name, 'переберёт и унаследованные свойства: нужен for..of'));
      }
    }
    for (const m of hits(code, /\bundefined\s*[+\-*/]|[+\-*/]\s*undefined\b/g)) {
      out.push(f('undefined-в-числах', 'важно', p.name, file, lineAt(code, m.index),
        'арифметика с undefined: ' + snippet(src, code, m.index),
        'результат — NaN, он расползётся дальше'));
    }
  }
  return out;
}

/* ============================ 6xx: БЕЗОПАСНОСТЬ ====================== */

export function checkSecurity(root, p) {
  const out = [];
  for (const file of codeFiles(root, p)) {
    const src = read(root, file); if (src == null) continue;
    const code = stripCode(src);
    for (const m of hits(code, /\beval\s*\(|\bnew\s+Function\s*\(/g)) {
      out.push(f('eval', 'важно', p.name, file, lineAt(code, m.index),
        'исполнение строки как кода: ' + m[0].trim(),
        'это дыра: строка из сохранения станет кодом'));
    }
    for (const m of hits(code, /postMessage\s*\([^)]*,\s*(['"])[*]\1\s*\)/g)) {
      out.push(f('postmessage-звезда', 'важно', p.name, file, lineAt(code, m.index),
        'postMessage шлёт в любой источник (*)', 'сообщение получит любой встроенный фрейм'));
    }
    for (const m of hits(code, /localStorage\.setItem\s*\(\s*['"][^'"]*(token|jwt|password|secret|key)/gi)) {
      out.push(f('секрет-в-хранилище', 'важно', p.name, file, lineAt(code, m.index),
        'секрет кладут в localStorage: ' + snippet(src, code, m.index),
        'localStorage читается любым скриптом страницы'));
    }
    for (const m of hits(code, /innerHTML\s*=\s*[^;]*?\+/g)) {
      /* придираемся только к конкатенации с переменной, а не к шаблону */
      const span = code.slice(m.index, m.index + 220);
      if (!/\+\s*(?!['"])[A-Za-z_$]/.test(span)) continue;
      out.push(f('innerhtml-конкатенация', 'мелочь', p.name, file, lineAt(code, m.index),
        'innerHTML собирается конкатенацией с данными: ' + snippet(src, code, m.index),
        'если в переменной текст игрока, получится внедрение разметки'));
    }
  }
  for (const file of p.html) {
    const src = read(root, file); if (src == null) continue;
    for (const m of hits(src, /<a\b[^>]*target\s*=\s*"_blank"[^>]*>/gi)) {
      if (!/rel\s*=\s*["'][^"']*noopener/i.test(m[0])) {
        out.push(f('noopener', 'мелочь', p.name, file, lineAt(src, m.index),
          'ссылка с target="_blank" без rel="noopener"', 'открытая страница получит window.opener'));
      }
    }
    for (const m of hits(src, /<iframe\b[^>]*>/gi)) {
      if (!/sandbox\s*=/i.test(m[0])) {
        out.push(f('iframe-без-sandbox', 'мелочь', p.name, file, lineAt(src, m.index),
          'iframe без sandbox', 'встроенная страница получит доступ к вашей'));
      }
    }
    for (const m of hits(src, /<script\b[^>]*src\s*=\s*"(https?:[^"]+)"/gi)) {
      out.push(f('внешний-скрипт', 'критично', p.name, file, lineAt(src, m.index),
        'скрипт грузится со стороны: ' + m[1].slice(0, 70),
        'игра перестанет работать без сети — и это готовый канал для чужого кода'));
    }
  }
  if (p.hasPackage) {
    const file = join(p.name, 'package.json');
    const src = read(root, file);
    let data = null;
    try { data = src && JSON.parse(src); } catch { data = null; }
    if (data) {
      for (const [name, cmd] of Object.entries(data.scripts || {})) {
        if (/^(pre|post)?install$/.test(name) && /curl|wget|http/.test(String(cmd))) {
          out.push(f('install-хук', 'важно', p.name, file, 1,
            'скрипт «' + name + '» тянет что-то из сети при установке',
            'npm install будет качать чужой код'));
        }
      }
      for (const dep of ['dependencies', 'devDependencies'].flatMap((k) => Object.entries(data[k] || {}))) {
        if (/^(https?|git):/.test(String(dep[1]))) {
          out.push(f('опасная-зависимость', 'важно', p.name, file, 1,
            'зависимость ' + dep[0] + ' ставится из ' + String(dep[1]).slice(0, 50),
            'версия не закреплена: содержимое может поменяться'));
        }
      }
    }
  }
  return out;
}

/* ============================ 7xx: РАЗМЕТКА ========================== */

export function checkMarkup(root, p) {
  const out = [];
  for (const file of p.html) {
    const src = read(root, file); if (src == null) continue;
    const noScript = src.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (x) => x.replace(/[^\n]/g, ' '));
    if (/<body/i.test(noScript) && !/<title[^>]*>\s*\S/i.test(noScript)) {
      out.push(f('title', 'мелочь', p.name, file, 1, 'у страницы нет <title>',
        'во вкладке и в сохранённой ссылке будет адрес'));
    }
    for (const m of hits(noScript, /<img\b[^>]*>/gi)) {
      if (!/\balt\s*=/i.test(m[0])) {
        out.push(f('alt', 'мелочь', p.name, file, lineAt(noScript, m.index),
          'у <img> нет alt: ' + m[0].slice(0, 60),
          'без alt картинку не прочтут ни читалка, ни поисковик'));
      }
    }
    for (const m of hits(noScript, /<button\b[^>]*>([\s\S]*?)<\/button>/gi)) {
      const inner = m[1].replace(/<[^>]+>/g, '').trim();
      if (!inner && !/aria-label\s*=/i.test(m[0]) && !/title\s*=/i.test(m[0])) {
        out.push(f('пустая-кнопка', 'мелочь', p.name, file, lineAt(noScript, m.index),
          'кнопка без текста и без aria-label', 'игрок не поймёт, что она делает'));
      }
    }
    for (const m of hits(noScript, /<a\b(?![^>]*\bhref\s*=)[^>]*>/gi)) {
      out.push(f('ссылка-без-href', 'мелочь', p.name, file, lineAt(noScript, m.index),
        '<a> без href — это не ссылка', 'клавиатура и поисковик её не увидят'));
    }
    for (const m of hits(noScript, /<div\b[^>]*\bonclick\s*=[^>]*>/gi)) {
      if (!/role\s*=/i.test(m[0])) {
        out.push(f('роль-интерактива', 'мелочь', p.name, file, lineAt(noScript, m.index),
          'клик по <div> без role', 'кнопку нельзя нажать с клавиатуры'));
      }
    }
    if (/addEventListener\s*\(\s*['"]mousedown|onmousedown/i.test(noScript) && !/touchstart|pointerdown/i.test(noScript)) {
      out.push(f('только-мышь', 'мелочь', p.name, file, 1,
        'управление висит только на мыши',
        'на телефоне пальцем не поиграть — нужен pointerdown/touch'));
    }
  }
  return out;
}

/* ============================ 8xx: АССЕТЫ ============================ */

export function checkAssets(root, p) {
  const out = [];
  /* url() и @import в CSS: файл должен лежать на месте */
  for (const file of p.css) {
    const src = read(root, file); if (src == null) continue;
    const clean = src.replace(/\/\*[\s\S]*?\*\//g, (x) => x.replace(/[^\n]/g, ' '));
    for (const m of hits(clean, /url\(\s*['"]?([^'")]+)['"]?\s*\)|@import\s+['"]([^'"]+)['"]/g)) {
      const url = m[1] || m[2];
      if (!url || EXTERNAL.test(url)) continue;
      const cleanUrl = url.split('#')[0].split('?')[0].trim();
      if (!cleanUrl) continue;
      const target = cleanUrl.startsWith('/')
        ? resolve(root, cleanUrl.replace(/^\/games\//, '').replace(/^\//, ''))
        : resolve(root, dirname(file), cleanUrl);
      if (!existsSync(target)) {
        out.push(f('css-url', 'критично', p.name, file, lineAt(clean, m.index),
          'в CSS ссылка на отсутствующий файл: ' + cleanUrl,
          'фон или шрифт молча не загрузятся'));
      }
    }
  }
  const seenHash = new Map();
  for (const file of p.files) {
    const ext = extname(file).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp3', '.ogg', '.wav', '.woff', '.woff2'].includes(ext)) continue;
    const size = sizeOf(root, file);
    /* маленькие иконки-заглушки у всех совпадают: сравнивать имеет смысл
       только содержательные файлы */
    if (size < 4096 || size > 5 * 1024 * 1024) continue;
    try {
      const h = createHash('sha1').update(readFileSync(join(root, file))).digest('hex');
      if (seenHash.has(h)) {
        out.push(f('двойник-ассета', 'мелочь', p.name, file, 1,
          'файл совпадает по содержимому с ' + seenHash.get(h), 'удалите один — страница станет легче'));
      } else seenHash.set(h, file);
    } catch { /* не читается — не наша забота */ }
  }
  for (const file of codeFiles(root, p)) {
    const src = read(root, file); if (src == null) continue;
    const assetRe = /['"]((?:\.{0,2}\/)?[\w\-./]+\/([\w\- .]+)\.(png|jpe?g|webp|gif|mp3|ogg|wav|glb|gltf|woff2?))['"]/gi;
    for (const m of hits(src, assetRe)) {
      const path = m[1];
      if (/^https?:/.test(path) || path.startsWith('data:')) continue;
      const candidates = [resolve(root, p.name, path), resolve(root, dirname(file), path), resolve(root, path)];
      if (!candidates.some((c) => existsSync(c))) {
        out.push(f('ассет-из-кода', 'важно', p.name, file, lineAt(src, m.index),
          'код ссылается на ассет, которого нет: ' + path,
          'в игре будет пустое место или ошибка загрузки'));
      }
    }
  }
  for (const file of [...p.html, ...p.css, ...codeFiles(root, p)]) {
    const src = read(root, file); if (src == null) continue;
    for (const m of hits(src, /data:[\w/+.-]+;base64,([A-Za-z0-9+/=]{16,})/g)) {
      const body = m[1];
      if (body.length % 4 === 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(body)) continue;
      const fixed = body.replace(/[^A-Za-z0-9+/]/g, '');
      if (fixed.length % 4 === 0) continue;      /* URL-safe base64 — тоже норма */
      out.push(f('битый-data-url', 'важно', p.name, file, lineAt(src, m.index),
        'data:URL c некорректной base64-строкой (длина ' + body.length + ')',
        'браузер молча не покажет картинку'));
    }
  }
  for (const file of p.files.filter((x) => /\.webmanifest$|manifest\.json$/.test(x))) {
    let data = null;
    try { data = JSON.parse(read(root, file) || ''); } catch { continue; }
    for (const icon of data.icons || []) {
      if (icon && icon.src && !EXTERNAL.test(icon.src) && !existsSync(resolve(root, dirname(file), icon.src))) {
        out.push(f('манифест-ассет', 'мелочь', p.name, file, 1,
          'иконка из манифеста не найдена: ' + icon.src, 'ярлык на телефоне останется без картинки'));
      }
    }
  }
  return out;
}

/* ============================ 0xx: ДЕРЕВО ============================ */

export function checkTree(root, p) {
  const out = [];
  for (const file of p.files) {
    const base = basename(file);
    if (/\.(bak|orig|old|rej|swp|tmp)$|~$|\.DS_Store$|^_tmp|_tmp\./i.test(base)) {
      out.push(f('мусор', 'важно', p.name, file, 1, 'в дереве лежит мусорный файл: ' + base,
        'такие файлы попадают в публикацию — удалите'));
    }
    if (/[ #]/.test(base)) {
      out.push(f('имя-файла', 'мелочь', p.name, file, 1, 'в имени файла пробел или решётка: ' + base,
        'в URL придётся кодировать, а часть хостингов такое имя не отдаст'));
    }
    if (/\.(js|mjs|css|png|jpe?g|html)$/.test(base) && /[A-Z]/.test(extname(base))) {
      out.push(f('регистр-имени', 'мелочь', p.name, file, 1, 'расширение записано заглавными: ' + base,
        'часть серверов отдаст файл как текст'));
    }
    if (!/\.(js|mjs|css|html|json|md|txt|yml|yaml|gd|tscn|cfg|svg|webmanifest)$/i.test(file)) continue;
    const size = sizeOf(root, file);
    if (size === 0) {
      out.push(f('пустой-файл', 'мелочь', p.name, file, 1, 'файл пустой', 'подключён, но ничего не делает'));
      continue;
    }
    if (size > 2 * 1024 * 1024) {
      out.push(f('большой-файл', 'мелочь', p.name, file, 1,
        'файл весит ' + (size / 1048576).toFixed(1) + ' МБ', 'на мобильном интернете это долгая загрузка'));
    }
    const src = read(root, file); if (src == null) continue;
    if (/^\uFEFF/.test(src)) {
      out.push(f('bom', 'мелочь', p.name, file, 1, 'файл начинается с BOM',
        'BOM перед <!doctype> сдвигает страницу в quirks-режим'));
    }
    if (Buffer.from(src, 'utf8').toString('utf8') !== src) {
      out.push(f('файлы', 'важно', p.name, file, 1,
        'файл не читается как UTF-8: байты не складываются в текст',
        'часть символов потеряется при любом разборе'));
    }
    if (src.includes('\uFFFD')) {
      const idx = src.indexOf('\uFFFD');
      out.push(f('кодировка', 'важно', p.name, file, lineAt(src, idx),
        'в файле битые символы U+FFFD — текст сохранён не в UTF-8',
        'на экране вместо букв будут ромбики'));
    }
  }
  return out;
}

export function checkSecrets(root, p) {
  const out = [];
  const patterns = [
    [/AKIA[0-9A-Z]{16}/g, 'ключ AWS'],
    [/\bsk-[A-Za-z0-9]{24,}/g, 'ключ API (sk-)'],
    [/gh[pousr]_[A-Za-z0-9]{30,}/g, 'токен GitHub'],
    [/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/g, 'закрытый ключ'],
    [/\b(?:password|passwd|secret)\s*[:=]\s*['"][^'"]{8,}['"]/gi, 'пароль в исходниках'],
  ];
  for (const file of p.files) {
    if (/\.(png|jpe?g|webp|gif|mp3|ogg|wav|woff2?|zip|pdf)$/i.test(file)) continue;
    /* отчёты бота — там «секрет» в цитате, а не в игре; тесты — там стенд */
    if (/tools\/bughunt\/report\.|\/reports?\//.test(file)) continue;
    const src = read(root, file); if (src == null) continue;
    for (const [re, what] of patterns) {
      for (const m of hits(src, re)) {
        if (/example|placeholder|ваш_|xxx+/i.test(m[0])) continue;
        if (/test|demo|sample|dummy|fake|local|dev[-_]?key|changeme/i.test(m[0])) continue;
        out.push(f('секреты', 'критично', p.name, file, lineAt(src, m.index),
          'похоже на ' + what + ' в файле: ' + m[0].slice(0, 24) + '…',
          'ключ попадает в публичный репозиторий — отзовите его и храните в секретах CI'));
      }
    }
  }
  return out;
}

export function checkTodo(root, p) {
  const out = [];
  for (const file of p.files) {
    if (isTestFile(file) || isDocFile(file) || isVendorFile(file)) continue;
    if (!/\.(js|mjs|css|html|gd)$/i.test(file)) continue;
    const src = read(root, file); if (src == null) continue;
    const code = /\.html?$/.test(file)
      ? src.replace(/<!--[\s\S]*?-->/g, (x) => x.replace(/[^\n]/g, ' '))
      : stripCode(src);
    for (const m of hits(code, /\b(TODO|FIXME|HACK|XXX)\b/g)) {
      out.push(f('todo', 'мелочь', p.name, file, lineAt(code, m.index),
        'в коде остался ' + m[1], 'такие пометки обычно означают недоделанную ветку'));
    }
  }
  return out;
}

export function checkDoubles(root, p) {
  const out = [];
  const seen = new Map();
  for (const file of p.files) {
    if (!/\.(js|mjs|css|json|html|md)$/i.test(file) || isVendorFile(file)) continue;
    if (/package-lock\.json|\.map$/.test(file)) continue;
    if (sizeOf(root, file) < 2048) continue;
    const src = read(root, file); if (src == null) continue;
    const h = createHash('sha1').update(src.replace(/\s+/g, ' ').trim()).digest('hex');
    if (seen.has(h)) {
      out.push(f('двойник', 'мелочь', p.name, file, 1,
        'содержимое совпадает с ' + seen.get(h), 'две копии одного файла разойдутся при правке'));
    } else seen.set(h, file);
  }
  return out;
}

export function checkReadme(root, p) {
  const out = [];
  if (!p.md.some((x) => /README\.md$/i.test(x))) {
    out.push(f('readme', 'мелочь', p.name, p.files[0] || p.name + '/', 1,
      'у проекта нет README', 'новичку неоткуда узнать, как это запускать'));
  }
  if (p.kind === 'игра' && !p.html.some((x) => /index\.html$/.test(x))) {
    out.push(f('вход-игры', 'важно', p.name, p.files[0] || p.name + '/', 1,
      'у игры нет index.html — открыть нечего', 'сайт каталога ссылается именно на него'));
  }
  return out;
}

/* ============================ 9xx: ТЕСТЫ И CI ========================= */

export function checkRepoCi(root, repo) {
  const out = [];
  if (!repo.files.length) return out;
  const workflows = repo.files.filter((x) => /^\.github\/workflows\/.*\.ya?ml$/.test(x));
  if (!workflows.length) {
    out.push(f('workflow', 'важно', 'репозиторий', '.github/workflows/', 1,
      'в репозитории нет ни одного workflow', 'проверки не запускаются автоматически'));
    return out;
  }
  const allWorkflowText = workflows.map((w) => read(root, w) || '').join('\n');
  for (const wf of workflows) {
    const src = read(root, wf) || '';
    /* у шагов может быть своя рабочая папка: пути тогда считаются от неё */
    const wd = (src.match(/defaults:\s*[\s\S]{0,200}?working-directory:\s*([\w./\-]+)/) || [])[1] || '';
    if (/^\s+\S.*:\s*\n\t/m.test(src)) {
      out.push(f('workflow', 'критично', 'репозиторий', wf, 1,
        'в YAML отступ табом', 'GitHub Actions не прочитает файл: «mapping values are not allowed»'));
    }
    for (const m of hits(src, /^\s*(?:run:\s*)?node\s+([\w./\-]+\.mjs)/gm)) {
      if (!existsSync(join(root, wd, m[1])) && !existsSync(join(root, m[1]))) {
        out.push(f('workflow-шаг', 'критично', 'репозиторий', wf, lineAt(src, m.index),
          'workflow запускает несуществующий файл: ' + m[1], 'шаг упадёт всегда'));
      }
    }
    for (const m of hits(src, /npm\s+(?:run\s+)?[\w:-]+\s+--prefix\s+([\w\-./]+)/g)) {
      if (!existsSync(join(root, m[1]))) {
        out.push(f('workflow-шаг', 'критично', 'репозиторий', wf, lineAt(src, m.index),
          'workflow запускает npm в несуществующей папке: ' + m[1], 'шаг упадёт всегда'));
      }
    }
    for (const m of hits(src, /^\s*run:.*\b(curl|wget)\b.*https?:/gm)) {
      out.push(f('ci-сеть', 'мелочь', 'репозиторий', wf, lineAt(src, m.index),
        'шаг CI качает что-то из сети', 'сборка сломается, когда внешний адрес ответит иначе'));
    }
    for (const m of hits(src, /uses:\s*[^\s]+@(main|master|latest)\b/g)) {
      out.push(f('workflow', 'важно', 'репозиторий', wf, lineAt(src, m.index),
        'действие закреплено на плавающую ветку (main/latest)',
        'сборка может сломаться от чужого коммита'));
    }
  }
  for (const file of repo.files) {
    if (!/\/tests\/[\w-]+\.mjs$/.test(file) || /\/_/.test(file)) continue;
    const name = file.slice(file.lastIndexOf('/') + 1);
    const inCi = allWorkflowText.includes(file) || allWorkflowText.includes(name)
      || allWorkflowText.includes('bughunt.mjs');
    if (!inCi) {
      out.push(f('тест-в-ci', 'важно', 'репозиторий', file, 1,
        'тест не запускается в CI: ' + file, 'добавьте шаг или запускайте его из своего бота'));
    }
  }
  if (!/bughunt/.test(allWorkflowText)) {
    out.push(f('бот-в-ci', 'важно', 'репозиторий', '.github/workflows/', 1,
      'в CI не запускается бот-багоискатель', 'тогда его находки никто не увидит'));
  }
  if (!existsSync(join(root, 'tools/bughunt/tests/selftest.mjs'))) {
    out.push(f('бот-в-ci', 'важно', 'репозиторий', 'tools/bughunt/', 1,
      'у бота нет самопроверки', 'тогда непонятно, ловит он ошибки или просто молчит'));
  }
  return out;
}

export function checkPackages(root, p) {
  const out = [];
  if (!p.hasPackage) return out;
  const file = join(p.name, 'package.json');
  let data = null;
  try { data = JSON.parse(read(root, file) || ''); } catch { return out; }
  if (!data.name || !data.version) {
    out.push(f('пакет-метаданные', 'мелочь', p.name, file, 1,
      'в package.json нет ' + (!data.name ? 'name' : 'version'),
      'npm может отказаться ставить пакет'));
  }
  for (const [name, cmd] of Object.entries(data.scripts || {})) {
    for (const m of String(cmd).matchAll(/(?:^|\s)node\s+([\w./\-]+\.m?js)/g)) {
      if (!existsSync(join(root, p.name, m[1]))) {
        out.push(f('скрипт-пакета', 'важно', p.name, file, 1,
          'скрипт «' + name + '» зовёт несуществующий файл: ' + m[1], 'npm run ' + name + ' упадёт'));
      }
    }
  }
  return out;
}

export function checkTestsHead(root, p) {
  const out = [];
  for (const file of p.tests) {
    const src = read(root, file); if (src == null) continue;
    const code = stripCode(src);
    for (const m of hits(code, /\.(only|skip)\s*\(/g)) {
      out.push(f('тест-only', 'важно', p.name, file, lineAt(code, m.index),
        'в тесте остался .' + m[1] + '()', 'остальные проверки не выполнятся, а CI будет зелёным'));
    }
    for (const m of hits(code, /new Date\s*\(\s*\)/g)) {
      out.push(f('дата-в-тесте', 'мелочь', p.name, file, lineAt(code, m.index),
        'тест берёт текущую дату', 'в последний день месяца такой тест падает'));
    }
    /* «✗ печатается, а код выхода не выставлен» — только про сам тест,
       а не про инструмент, который разбирает чужой вывод */
    if (/✗/.test(src) && !/process\.exit|exitCode/.test(src) && !/runTests|execFile|spawn/.test(src)) {
      out.push(f('код-выхода-теста', 'важно', p.name, file, 1,
        'тест печатает ✗, но нигде не выставляет код выхода',
        'CI посчитает провал успехом — нужен process.exit(1)'));
    }
  }
  return out;
}

/* ============================ 5xx: ПРОИЗВОДИТЕЛЬНОСТЬ ================ */

export function checkPerf(root, p) {
  const out = [];
  for (const file of codeFiles(root, p)) {
    const src = read(root, file); if (src == null) continue;
    const code = stripCode(src);
    for (const m of hits(code, /\.getContext\s*\([^)]*\)\s*\./g)) {
      out.push(f('контекст-без-проверки', 'важно', p.name, file, lineAt(code, m.index),
        'getContext(...) сразу используется без проверки на null',
        'без WebGL вернётся null — и игра упадёт на первом же кадре'));
    }
    for (const m of hits(code, /data:[\w/+.-]+;base64,[A-Za-z0-9+/=]{100000,}/g)) {
      out.push(f('тяжёлый-data-url', 'мелочь', p.name, file, lineAt(code, m.index),
        'data:URL на ' + Math.round(m[0].length / 1024) + ' КБ внутри кода',
        'этот кусок нельзя закэшировать отдельно от скрипта'));
    }
    for (const m of hits(code, /\[(?:\s*-?\d+(?:\.\d+)?\s*,){500,}/g)) {
      out.push(f('гигантский-массив', 'мелочь', p.name, file, lineAt(code, m.index),
        'массив из сотен чисел прямо в коде', 'файл грузится дольше, чем считается'));
    }
    /* Тройной обход — обычный приём для матриц, тайлов и разметки.
       В отчёт идёт только то, что трогает DOM в каждом узле. */
    const stack = [];
    for (const m of hits(code, /\bfor\s*\(/g)) {
      let depth = 0;
      for (let k = 0; k < m.index; k++) {
        if (code[k] === '{') depth++; else if (code[k] === '}') depth--;
      }
      stack.push({ depth, index: m.index });
      if (stack.filter((x) => x.depth === depth).length !== 3) continue;
      const around = snippet(src, code, m.index, 140);
      if (!/document\.|innerHTML|appendChild|textContent|querySelector/.test(around)) continue;
      out.push(f('тройной-цикл', 'мелочь', p.name, file, lineAt(code, m.index),
        'три цикла вложены друг в друга и трогают DOM: ' + around.slice(0, 60),
        'каждый узел дёргает разметку — на большом списке это заметные лаги'));
    }
  }
  return out;
}
