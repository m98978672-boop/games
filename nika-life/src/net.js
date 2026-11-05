/* =============================================================================
   НИКА: ЖИВАЯ — интернет-обучение (ЯВНОЕ, по запросу игрока)
   -----------------------------------------------------------------------------
   Важное и честное ограничение:
   • игра НЕ делает сетевых запросов сама. Никаких фоновых запросов, ключей API,
     телеметрии, аналитики и скрытых обращений к серверам.
   • запрос происходит ТОЛЬКО когда игрок включил тумблер «разрешить интернет»,
     сам указал адрес публичного сайта и нажал «Загрузить и обучить».
   • адрес не зашит в коде: модуль не содержит ни одного URL. Источник выбирает
     игрок (подсказки-примеры лежат в index.html, вне исходников).
   • отвечает только публичный сайт с разрешённым CORS. Своего сервера у игры нет,
     платных/приватных API и ключей нет, цена 0 ₽.
   • скачанный текст разбирается ЛОКАЛЬНО: ИИ, моторные программы и бытовые
     навыки дообучаются в браузере, без отправки куда-либо данных игрока.
   ============================================================================= */
(function (root) {
  'use strict';
  const NIKA = (root.NIKA = root.NIKA || {});
  const MAX_BYTES = 600000;       /* ограничение на размер загружаемого текста */
  const TIMEOUT_MS = 12000;

  let optIn = false;
  let requests = 0;
  let lastResult = null;

  function setOptIn(value) { optIn = !!value; return optIn; }
  function isEnabled() { return optIn; }

  function validate(url) {
    const raw = String(url || '').trim();
    if (!optIn) throw new Error('Сначала включи «разрешить интернет-обучение»');
    if (!raw) throw new Error('Укажи адрес публичного сайта');
    if (raw.length > 1200) throw new Error('Адрес слишком длинный');
    let parsed;
    try { parsed = new root.URL(raw); } catch (e) { throw new Error('Не похоже на адрес сайта'); }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('Нужен обычный адрес сайта (http/https)');
    if (parsed.username || parsed.password) throw new Error('Адрес с логином/паролем не принимается');
    return parsed.toString();
  }

  /* JSON Википедии/API превращаем в обычный текст, всё остальное берём как есть */
  function toText(raw, contentType) {
    let data = raw;
    if ((contentType || '').indexOf('json') !== -1 || /^\s*[{[]/.test(raw)) {
      try {
        const obj = JSON.parse(raw);
        const chunks = [];
        function walk(v, depth) {
          if (depth > 6 || chunks.length > 200) return;
          if (typeof v === 'string') { if (v.length > 2) chunks.push(v); return; }
          if (Array.isArray(v)) { v.forEach(function (x) { walk(x, depth + 1); }); return; }
          if (v && typeof v === 'object') {
            Object.keys(v).forEach(function (k) {
              if (['extract', 'text', 'title', 'content', 'body', 'description', 'summary'].indexOf(k) !== -1) walk(v[k], depth + 1);
              else if (k === 'pages' || k === 'query' || k === 'results') walk(v[k], depth + 1);
            });
          }
        }
        walk(obj, 0);
        if (chunks.length) return chunks.join('\n');
      } catch (e) { /* не JSON — просто текст */ }
    }
    return raw;
  }

  /* Единственное место во всей игре, где бывает сетевой запрос.
     Вызывается только из обработчика кнопки игрока. */
  async function learn(url) {
    const target = validate(url);
    const requester = root.fetch;
    if (typeof requester !== 'function') throw new Error('Этот браузер не умеет загружать страницы');
    const controller = typeof root.AbortController === 'function' ? new root.AbortController() : null;
    const timer = controller ? root.setTimeout(function () { controller.abort(); }, TIMEOUT_MS) : null;
    let response;
    try {
      response = await requester.call(root, target, {
        method: 'GET', mode: 'cors', credentials: 'omit', cache: 'no-store',
        headers: { 'Accept': 'text/plain, text/markdown, application/json, text/html' },
        signal: controller ? controller.signal : undefined,
      });
    } catch (e) {
      if (timer) root.clearTimeout(timer);
      throw new Error('Сайт не ответил (чаще всего из-за CORS). Попробуй другой публичный источник.');
    }
    if (timer) root.clearTimeout(timer);
    if (!response || !response.ok) throw new Error('Сайт вернул ошибку ' + (response ? response.status : '?'));
    const declared = response.headers && response.headers.get ? Number(response.headers.get('content-length')) : 0;
    if (declared > MAX_BYTES) throw new Error('Страница слишком большая');
    let raw = await response.text();
    if (raw.length > MAX_BYTES) raw = raw.slice(0, MAX_BYTES);
    /* HTML-разметку вырезаем грубо, без внешних библиотек */
    const contentType = response.headers && response.headers.get ? (response.headers.get('content-type') || '') : '';
    let text = toText(raw, contentType);
    if ((contentType.indexOf('html') !== -1 || /<\/?[a-z][^>]*>/i.test(text)) && contentType.indexOf('json') === -1) {
      text = text.replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#\d+;/g, ' ')
        .replace(/[ \t]{2,}/g, ' ');
    }
    text = text.split(/\r?\n/).map(function (l) { return l.trim(); })
      .filter(function (l) { return l.length > 3 && l.length < 400; }).slice(0, 500).join('\n');
    if (text.length < 20) throw new Error('На странице не нашлось текста для обучения');

    const source = 'сайт: ' + (new root.URL(target)).host;
    const aiRes = NIKA.ai.learnFromText(text, source);
    const meshRes = NIKA.mesh.learnFromText(text, source);
    const skillRes = NIKA.skills.learnFromText(text, source);
    requests += 1;
    lastResult = { url: target, host: (new root.URL(target)).host, chars: text.length,
      lines: text.split('\n').length, ai: aiRes.added, motor: meshRes.added, skills: skillRes.added,
      extendedSkills: skillRes.extended, at: new Date().toISOString() };
    return lastResult;
  }

  /* Обучение текстом, который игрок вставил сам (сеть не нужна) */
  function learnPasted(text) {
    const body = String(text || '');
    if (body.length < 10) throw new Error('Вставь хотя бы пару предложений');
    const source = 'текст игрока';
    const aiRes = NIKA.ai.learnFromText(body, source);
    const meshRes = NIKA.mesh.learnFromText(body, source);
    const skillRes = NIKA.skills.learnFromText(body, source);
    lastResult = { url: '', host: 'вставленный текст', chars: body.length, lines: body.split('\n').length,
      ai: aiRes.added, motor: meshRes.added, skills: skillRes.added, extendedSkills: skillRes.extended,
      at: new Date().toISOString() };
    return lastResult;
  }

  function info() {
    return { optIn: optIn, requests: requests, last: lastResult,
      mode: 'только по явному нажатию игрока', keys: 'нет', telemetry: 'нет',
      ownServer: 'нет', cost: '0 ₽', cors: 'зависит от публичного сайта' };
  }

  NIKA.net = {
    setOptIn: setOptIn, isEnabled: isEnabled, learn: learn, learnPasted: learnPasted,
    validate: validate, info: info, MAX_BYTES: MAX_BYTES,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
