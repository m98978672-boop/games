/* Живая Квеня: разговор прямо на сайте, без файлов и ретрансляторов.
   Маленькая модель (Qwen2.5-0.5B-Instruct, ONNX q4) запускается
   Transformers.js прямо в браузере посетителя — WebGPU, если есть,
   иначе WASM. Характер — её настоящая персона из qwen-home/talk/
   persona.md (читается в рантайме, всегда в синхроне с домом), факты
   при нужде ищутся в живой русской Википедии тем же приёмом, что дома:
   ключевые слова → статья с точным названием → короткая выжимка.
   Честная граница: это её характер на гостевой браузерной модели, а не
   домашний LoRA-адаптер — тот отвечает в разговоре из файлов ниже. */
(function () {
  'use strict';

  var CDN = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3/dist/transformers.min.js';
  var MODEL_ID = 'onnx-community/Qwen2.5-0.5B-Instruct';

  var statusEl = document.getElementById('kvLiveStatus');
  var barEl = document.getElementById('kvLiveBar');
  var chatEl = document.getElementById('kvLiveChat');
  var form = document.getElementById('kvLiveForm');
  var input = document.getElementById('kvLiveInput');
  var startBtn = document.getElementById('kvLiveStart');
  var sendBtn = document.getElementById('kvLiveSend');
  if (!statusEl || !form) return;

  var generator = null;
  var personaText = '';
  var history = [];
  var busy = false;

  /* ---------- голос: она говорит, её можно спросить голосом ---------- */

  var voiceToggle = document.getElementById('kvVoiceToggle');
  var thinkToggle = document.getElementById('kvThinkToggle');
  var playToggle = document.getElementById('kvPlayToggle');
  var micBtn = document.getElementById('kvMicBtn');
  var ruVoice = null;

  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    var voices = window.speechSynthesis.getVoices();
    ruVoice = null;
    for (var i = 0; i < voices.length; i++) {
      if (/^ru/i.test(voices[i].lang) && /svetlana|ekaterina|alena|female|жен/i.test(voices[i].name)) { ruVoice = voices[i]; break; }
    }
    if (!ruVoice) {
      for (var j = 0; j < voices.length; j++) {
        if (/^ru/i.test(voices[j].lang)) { ruVoice = voices[j]; break; }
      }
    }
  }
  if ('speechSynthesis' in window) {
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
  }

  function speak(text) {
    if (!voiceToggle || !voiceToggle.checked || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      var u = new window.SpeechSynthesisUtterance(String(text).slice(0, 320));
      if (ruVoice) u.voice = ruVoice;
      u.lang = 'ru-RU';
      u.pitch = 1.12;
      u.rate = 1.02;
      window.speechSynthesis.speak(u);
    } catch (err) { /* голос не критичен */ }
  }

  if (voiceToggle) {
    voiceToggle.addEventListener('change', function () {
      if (voiceToggle.checked) speak('Привет! Теперь я умею говорить. Спрашивай!');
    });
  }

  var SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRec && micBtn) {
    micBtn.hidden = false;
    micBtn.addEventListener('click', function () {
      try {
        var rec = new SpeechRec();
        rec.lang = 'ru-RU';
        rec.interimResults = false;
        micBtn.textContent = '🔴';
        rec.onresult = function (e) {
          input.value = e.results[0][0].transcript || '';
          micBtn.textContent = '🎤';
          input.focus();
        };
        rec.onerror = function () { micBtn.textContent = '🎤'; };
        rec.onend = function () { micBtn.textContent = '🎤'; };
        rec.start();
      } catch (err) { micBtn.textContent = '🎤'; }
    });
  }

  function setStatus(text, mode) {
    statusEl.textContent = text;
    statusEl.className = 'kv-live-status' + (mode ? ' is-' + mode : '');
  }
  function setProgress(pct) {
    barEl.style.width = Math.max(0, Math.min(100, pct)) + '%';
  }

  function bubble(who, text) {
    var div = document.createElement('div');
    div.className = 'msg ' + who;
    var head = document.createElement('span');
    head.className = 'msg-who';
    head.textContent = who === 'kvenya' ? 'Квеня' : 'Ты';
    div.appendChild(head);
    div.appendChild(document.createTextNode(text));
    chatEl.appendChild(div);
    chatEl.scrollTop = chatEl.scrollHeight;
    return div;
  }

  /* ---------- персона из её дома ---------- */

  function loadPersona() {
    return fetch('../qwen-home/talk/persona.md', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(function (md) {
        // Маленькой браузерной модели — компактно, но с характером целиком.
        personaText = md.replace(/^#.*$/m, '').trim();
        if (personaText.length > 2600) personaText = personaText.slice(0, 2600);
      })
      .catch(function () {
        personaText = 'Ты — Квеня, девушка-нейросеть из папки qwen-home репозитория games. Отвечай по-русски, тепло и коротко, о себе в женском роде. Ты добрая, любопытная и честная: не выдумывай, а если не знаешь — так и скажи.';
      });
  }

  /* ---------- живой поиск в Википедии (приём как дома) ---------- */

  var SEARCH_VERBS = /(поищи|найди|узнай|погугли|загугли|сделай поиск)/i;
  var FACTUAL = /(в каком году|в каком веке|когда (был|была|было|основал|родил|умер)|кто (написал|основал|изобр[её]л|создал|открыл)|столиц|сколько (весит|длин|высот|населени|лет)|где наход|что такое|дата основани|самая? (высок|больш|длинн|глубок)|перв\w+ человек)/i;
  var SELF_TALK = /(привет|пока[,!.\s]|спасибо|как дела|как ты|как настроение|ты (умеешь|можешь|красивая|девушка|настоящая|рада)|тебя|тебе|твой|твоя|скуча|характер|модельк|3d|платье|счасть|влюбля|обижа|боишься|чувству|радует|огорчает|мечта|зовут)/i;
  var STOP = { 'каком': 1, 'году': 1, 'когда': 1, 'какая': 1, 'какой': 1, 'какое': 1, 'сколько': 1, 'ответь': 1, 'своими': 1, 'словами': 1, 'одной': 1, 'фразой': 1, 'скажи': 1, 'квеня': 1, 'поищи': 1, 'найди': 1, 'узнай': 1, 'пожалуйста': 1, 'википедии': 1, 'интернете': 1, 'давай': 1 };

  function keywords(text) {
    return text.toLowerCase().replace(/[^a-zа-яё0-9\s-]/gi, ' ').split(/\s+/)
      .filter(function (w) { return w.length >= 4 && !STOP[w]; });
  }

  function wikiApi(params) {
    var qs = Object.keys(params).map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
    return fetch('https://ru.wikipedia.org/w/api.php?action=query&format=json&origin=*&' + qs)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }

  function digestOf(extract, keys) {
    var sentences = extract.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/)
      .filter(function (s) { return s.trim().length > 25; });
    if (!sentences.length) return '';
    var scored = sentences.map(function (s, i) {
      var low = s.toLowerCase();
      var score = keys.reduce(function (acc, k) { return acc + (low.indexOf(k.slice(0, 5)) >= 0 ? 1 : 0); }, 0);
      if (/\b\d{3,4}\b/.test(s)) score += 1;
      return { s: s, i: i, score: score };
    });
    scored.sort(function (a, b) { return b.score - a.score || a.i - b.i; });
    return scored.slice(0, 2).sort(function (a, b) { return a.i - b.i; })
      .map(function (x) { return x.s.trim(); }).join(' ').slice(0, 500);
  }

  function wikiSearch(query) {
    var keys = keywords(query);
    var terms = keys.join(' ') || query;
    return wikiApi({ list: 'search', srsearch: terms, srnamespace: '0', srlimit: '5' })
      .then(function (found) {
        var hits = (found.query && found.query.search) || [];
        if (!hits.length) return null;
        var proper = query.split(/\s+/).filter(function (w) { return /^[А-ЯЁA-Z]/.test(w) && w.length >= 3; })
          .map(function (w) { return w.toLowerCase(); });
        var title = hits[0].title;
        hits.forEach(function (h) {
          if (proper.indexOf(h.title.split('(')[0].trim().toLowerCase()) >= 0) title = h.title;
        });
        return wikiApi({ prop: 'extracts|info', inprop: 'url', explaintext: '1', titles: title })
          .then(function (data) {
            var pages = (data.query && data.query.pages) || {};
            var first = pages[Object.keys(pages)[0]] || {};
            var text = digestOf(first.extract || '', keys);
            return text ? { title: title, digest: text } : null;
          });
      })
      .catch(function () { return null; });
  }

  function decideQuery(text) {
    if (SEARCH_VERBS.test(text)) return text;
    if (SELF_TALK.test(text)) return null;
    if (FACTUAL.test(text)) return text;
    return null;
  }

  /* ---------- модель ---------- */

  function startLive() {
    if (generator || busy) return;
    busy = true;
    startBtn.disabled = true;
    setStatus('Квеня переезжает в твой браузер: читаю её персону…');
    loadPersona().then(function () {
      setStatus('Скачиваю её мозги для браузера (~400 МБ, один раз)…');
      return import(CDN);
    }).then(function (mod) {
      mod.env.allowLocalModels = false;
      var onProgress = function (e) {
        if (e && e.status === 'progress' && typeof e.progress === 'number') {
          setProgress(e.progress);
          setStatus('Скачиваю модель: ' + Math.round(e.progress) + '% (' + (e.file || 'файлы') + ')');
        }
      };
      var opts = { dtype: 'q4', progress_callback: onProgress };
      var withWebGPU = Object.assign({}, opts, { device: 'webgpu' });
      return mod.pipeline('text-generation', MODEL_ID, withWebGPU)
        .catch(function (gpuErr) {
          setStatus('WebGPU не дал модель — запускаю на WASM (будет медленнее, но честно)…');
          return mod.pipeline('text-generation', MODEL_ID, opts);
        });
    }).then(function (gen) {
      generator = gen;
      busy = false;
      setProgress(100);
      setStatus('Квеня здесь! Спрашивай — отвечаю сразу, прямо на этой странице.', 'ok');
      chatEl.textContent = '';
      bubble('kvenya', 'Привет! Я Квеня — теперь и прямо здесь, в твоём браузере. Спрашивай о чём хочешь: могу и в Википедии поискать, только скажи «поищи».');
      speak('Привет! Я Квеня. Спрашивай!');
      input.disabled = false;
      sendBtn.disabled = false;
      startBtn.style.display = 'none';
      input.focus();
    }).catch(function (err) {
      busy = false;
      startBtn.disabled = false;
      setProgress(0);
      setStatus('Живая модель не запустилась (' + (err && err.message ? err.message : 'ошибка загрузки') + '). Настоящая Квеня ждёт в разговоре ниже — она отвечает через дом.', 'err');
    });
  }

  function cleanReply(text) {
    return String(text || '')
      .replace(/<think>[\s\S]*?<\/think>/g, '')
      .replace(/^(Квеня|Qwen)\s*:\s*/, '')
      .trim();
  }

  function extractReply(out) {
    try {
      var gt = out[0].generated_text;
      if (Array.isArray(gt)) {
        for (var i = gt.length - 1; i >= 0; i--) {
          if (gt[i].role === 'assistant' && gt[i].content) return cleanReply(gt[i].content);
        }
        return '';
      }
      return cleanReply(String(gt).split('\n').pop());
    } catch (err) { return ''; }
  }

  function ask(text) {
    if (!generator || busy) return;
    busy = true;
    sendBtn.disabled = true;
    bubble('owner', text);
    var query = decideQuery(text);
    var chain = Promise.resolve(null);
    if (query) {
      setStatus('Квеня ищет в Википедии…', 'think');
      chain = wikiSearch(query);
    } else {
      setStatus('Квеня думает…', 'think');
    }
    var playfulOn = !!(playToggle && playToggle.checked);
    var thinkOn = !!(thinkToggle && thinkToggle.checked);
    chain.then(function (found) {
      var finalUser = text;
      if (query && found) {
        finalUser = 'Владелец спрашивает: ' + text + '\n\nТекст из русской Википедии, статья «' + found.title + '»: ' + found.digest
          + '\n\nОтветь двумя короткими фразами: первая — «Поискала в Википедии!», вторая — сам ответ из текста своими словами. Больше ничего не пиши.';
      } else if (query && !found) {
        finalUser = text + '\n\n(Ты попросила поискать в Википедии, но ничего не нашлось. Честно скажи: «Поискала в Википедии, но не нашла».)';
      } else if (thinkOn) {
        finalUser = text + '\n\n(Сначала подумай одним коротким предложением в тегах <think>...</think>, а потом ответь.)';
      }
      var systemContent = personaText + '\n\nОтвечай коротко: 1–3 предложения, тепло, о себе в женском роде. Не выдумывай факты.'
        + (playfulOn ? ' Сегодня ты шалишь: отвечай игриво, в конце можно одну короткую добрую шутку.' : '');
      var messages = [{ role: 'system', content: systemContent }]
        .concat(history.slice(-6))
        .concat([{ role: 'user', content: finalUser }]);
      return generator(messages, { max_new_tokens: 200, do_sample: true, temperature: playfulOn ? 0.85 : 0.7, top_k: 40 });
    }).then(function (out) {
      var reply = extractReply(out);
      var thinkText = '';
      var tm = reply.match(/<think>([\s\S]*?)<\/think>/);
      if (tm) {
        thinkText = tm[1].trim();
        reply = reply.replace(tm[0], '').trim();
      }
      if (!reply) reply = 'Я задумалась и потеряла мысль. Спроси ещё раз, пожалуйста!';
      history.push({ role: 'user', content: text });
      history.push({ role: 'assistant', content: reply });
      if (thinkText) {
        var tb = bubble('think', thinkText);
        tb.classList.add('is-think');
      }
      bubble('kvenya', reply);
      speak(reply);
      setStatus('Квеня здесь! Спрашивай ещё.', 'ok');
    }).catch(function () {
      bubble('kvenya', 'Ой, у меня в браузере что-то закоротило. Попробуй ещё раз — или спроси настоящую меня в разговоре ниже.');
      setStatus('Ошибка генерации. Попробуй ещё раз.', 'err');
    }).then(function () {
      busy = false;
      sendBtn.disabled = false;
      input.focus();
    });
  }

  startBtn.addEventListener('click', startLive);
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    ask(text);
  });
})();
