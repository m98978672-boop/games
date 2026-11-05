/* =============================================================================
   НИКА: ЖИВАЯ — «настоящий» автономный ИИ, работающий БЕСПЛАТНО и ЛОКАЛЬНО
   -----------------------------------------------------------------------------
   1. Нейросетевой классификатор намерений: обучаемый в браузере однослойный
      softmax-классификатор (bag-of-words + биграммы + tf-idf признаки).
      Обучается на корпусе русских фраз при запуске, дообучается на команде
      «запомни: ... = ...». Веса сохраняются в localStorage.
   2. Слотовый парсер: одежда, цвет, часть тела, анимация, локация, длительность,
      сторона тела, жесты. Понимает цепочки команд («оденься и иди на кухню»).
   3. Планировщик с функцией полезности (utility AI): сама решает, когда спать,
      есть, работать, мыться, отдыхать, если игрок включил автономию.
   4. Опционально: если браузер предоставляет встроенную локальную языковую
      модель (Chrome Built-in AI / LanguageModel API, бесплатно, без сети),
      ИИ использует её для разбора свободных фраз и всё равно проверяет ответ
      своим классификатором. НИКАКОГО облака, ключей и платных API нет.
   Это не облачный GPT: это компактная модель + агент принятия решений,
   которая полностью исполняется на устройстве игрока.
   ============================================================================= */
(function (root) {
  'use strict';
  const NIKA = (root.NIKA = root.NIKA || {});
  const data = NIKA.data;

  /* --- корпус: намерение -> примеры команд на русском ---------------------- */
  const INTENTS = [
    { id: 'greet', label: 'Поздороваться', examples: [
      'привет', 'привет ника', 'здравствуй', 'здравствуйте', 'доброе утро', 'добрый день', 'добрый вечер', 'хай', 'приветик', 'здорово',
    ] },
    { id: 'dress', label: 'Одеться / переодеться', examples: [
      'надень платье', 'оденься в пижаму', 'переоденься', 'смени одежду', 'надень куртку', 'накинь шарф', 'обуй кроссовки',
      'надень красное платье', 'переоденься в спортивную форму', 'надень очки', 'накинь пальто', 'смени платье на свитер',
      'оденься потеплее', 'надень что нибудь красивое', 'выбери наряд', 'переоденься в домашнее', 'надень тапочки',
    ] },
    { id: 'undress', label: 'Снять одежду', examples: [
      'сними куртку', 'сними очки', 'сними шапку', 'сними шарф', 'разденься', 'сними верхнюю одежду',
      'сними обувь', 'разуйся', 'сними аксессуар', 'убери кепку', 'сними платье', 'сними все лишнее',
    ] },
    { id: 'wardrobe', label: 'Показать гардероб', examples: [
      'покажи гардероб', 'что на тебе надето', 'список одежды', 'открой шкаф', 'что ты носишь', 'какая на тебе одежда',
      'покажи вещи', 'посмотри в шкаф', 'опиши свой наряд', 'какой у тебя гардероб',
    ] },
    { id: 'go', label: 'Переместиться', examples: [
      'иди на кухню', 'пойди в спальню', 'перейди в гостиную', 'передвинься к столу', 'подойди к зеркалу',
      'прогуляйся на улицу', 'сходи в парк', 'иди к кровати', 'переместись в ванную', 'иди работать за компьютер',
      'подойди ко мне', 'вернись домой', 'пойди поспи в спальню', 'ступи в комнату', 'двигайся к холодильнику',
    ] },
    { id: 'sleep', label: 'Спать', examples: [
      'иди спать', 'ложись спать', 'поспи', 'выспись', 'ложись в кровать', 'пора спать', 'отправляйся в постель',
      'давай поспим', 'иди в кровать', 'отдохни во сне', 'спи час', 'ложись отдыхать',
    ] },
    { id: 'wake', label: 'Проснуться', examples: [
      'вставай', 'проснись', 'подъем', 'встань с кровати', 'хватит спать', 'будильник', 'просыпайся', 'встань',
    ] },
    { id: 'eat', label: 'Поесть', examples: [
      'поешь', 'покушай', 'пообедай', 'позавтракай', 'поужинай', 'перекуси', 'съешь яблоко', 'иди поесть',
      'приготовь себе еду', 'сходи перекусить', 'накорми себя', 'поешь чего нибудь',
    ] },
    { id: 'drink', label: 'Попить', examples: [
      'попей воды', 'выпей чаю', 'налей кофе', 'выпей сок', 'иди попей', 'сделай чай', 'утоли жажду',
    ] },
    { id: 'work', label: 'Работать', examples: [
      'поработай', 'иди работать', 'займись работой', 'сделай отчет', 'посиди за ноутбуком', 'начать смену',
      'иди на работу', 'работай два часа', 'заработай денег', 'выполни задание', 'сядь за проект', 'поработать надо',
    ] },
    { id: 'help', label: 'Помочь', examples: [
      'помоги мне', 'помоги с уборкой', 'помоги убраться', 'помоги готовить', 'приберись', 'вымой посуду',
      'подсоби мне', 'помоги с делами', 'нужна твоя помощь', 'помоги дома', 'сделай одолжение', 'вымой пол',
    ] },
    { id: 'wash', label: 'Купание / гигиена', examples: [
      'прими душ', 'умойся', 'помой руки', 'почисти зубы', 'искупайся', 'сходи в душ', 'приведи себя в порядок',
      'иди мыться', 'помойся', 'протри лицо', 'прими ванну', 'искупайся в ванне', 'покупайся',
      'полежи в ванне', 'сходи помыться', 'набери пену', 'вымойся',
    ] },
    { id: 'toilet', label: 'Сходить в туалет', examples: [
      'сходи в туалет', 'иди в туалет', 'мне нужно в туалет', 'сходи в санузел', 'нужно в уборную',
      'пошла в туалет', 'сходи по нужде', 'туалет', 'посети санузел', 'иди в уборную',
      'сходи в туалетную комнату', 'ей нужно в туалет',
    ] },
    { id: 'exercise', label: 'Спорт / зарядка', examples: [
      'сделай зарядку', 'потренируйся', 'побегай', 'займись спортом', 'сделай приседания', 'разомнись',
      'иди на тренировку', 'позанимайся фитнесом', 'сделай растяжку', 'потренируй тело',
    ] },
    { id: 'animate', label: 'Управление телом / анимация', examples: [
      'помаши рукой', 'подними правую руку', 'кивни', 'покачай головой', 'прыгни', 'улыбнись', 'покрутись',
      'потянись', 'сядь', 'поклонись', 'станцуй', 'подмигни', 'зевни', 'покажи анимацию', 'сожми кулак',
      'покачай ногой', 'оглянись', 'задумайся', 'подними обе руки', 'покажи жест окей', 'взмахни волосами',
      'поверни голову', 'опусти руку', 'сделай реверанс', 'щелкни пальцами', 'встань на носочки',
    ] },
    { id: 'animations', label: 'Список анимаций', examples: [
      'список анимаций', 'сколько анимаций', 'покажи все анимации', 'открой галерею анимаций', 'какие есть движения',
      'покажи движения', 'сколько движений у руки', 'включи демо анимаций', 'перечисли анимации', 'открой каталог анимаций',
    ] },
    { id: 'body', label: 'Прямое управление суставами', examples: [
      'открой панель тела', 'покажи суставы', 'управление телом', 'дай мне крутилки суставов', 'покажи скелет',
      'я хочу управлять телом', 'открой тело', 'покажи рычаги', 'ручное управление',
    ] },
    { id: 'status', label: 'Статус / самочувствие', examples: [
      'как дела', 'статус', 'расскажи о себе', 'сколько денег', 'как настроение', 'что ты чувствуешь',
      'какое у тебя состояние', 'покажи потребности', 'как ты себя чувствуешь', 'что нового', 'отчитайся', 'как ты',
    ] },
    { id: 'buy', label: 'Купить одежду', examples: [
      'купи свитер', 'сходи в магазин за платьем', 'приобрети кроссовки', 'купи новую юбку', 'закажи куртку',
      'купи мне подарок', 'обнови гардероб', 'купи синее платье', 'сходи за покупками',
    ] },
    { id: 'wait', label: 'Ждать / отдыхать', examples: [
      'подожди', 'стой', 'постой', 'отдохни', 'посиди', 'ничего не делай', 'расслабься', 'просто постой',
      'остановись', 'передохни', 'жди моих команд', 'побудь спокойно',
    ] },
    { id: 'autonomy_on', label: 'Включить автономную жизнь', examples: [
      'живи сама', 'включи автономию', 'действуй сама', 'управляй собой', 'живи своей жизнью', 'сама решай что делать',
      'включи свободный режим', 'живи без моих команд', 'будь самостоятельной', 'включи ии',
    ] },
    { id: 'autonomy_off', label: 'Выключить автономию', examples: [
      'выключи автономию', 'только мои команды', 'не делай ничего сама', 'жди команд', 'стоп автономия',
      'отключи свободный режим', 'не принимай решения сама', 'я буду управлять', 'выключи ии',
    ] },
    { id: 'teach', label: 'Обучить ИИ', examples: [
      'запомни', 'научись', 'это значит', 'исправь меня', 'выучи команду', 'запомни что', 'объяснение',
      'добавь правило', 'переобучись', 'так говорить значит',
    ] },
    { id: 'save', label: 'Сохранить игру', examples: [
      'сохрани', 'сохрани игру', 'запиши прогресс', 'сохранись', 'сделай сохранение', 'запомни состояние',
    ] },
    { id: 'reset', label: 'Начать заново', examples: [
      'начни заново', 'сбрось игру', 'новая жизнь', 'перезапусти', 'начать сначала', 'сброс прогресса',
    ] },
    { id: 'talk', label: 'Поговорить', examples: [
      'поговори со мной', 'расскажи что нибудь', 'что ты думаешь', 'поболтаем', 'расскажи о дне',
      'скажи мне что то доброе', 'как прошел день', 'давай поговорим', 'ты меня слышишь',
    ] },
  ];
  const LABELS = INTENTS.map(function (i) { return i.id; });
  const INTENT_BY_ID = {};
  INTENTS.forEach(function (i) { INTENT_BY_ID[i.id] = i; });

  /* --- нормализация и признаки --------------------------------------------- */
  function normalize(text) {
    return String(text || '').toLowerCase().replace(/ё/g, 'е').replace(/[^а-яa-z0-9]+/g, ' ').trim();
  }
  function stem(word) {
    if (word.length > 8) return word.slice(0, 6);
    if (word.length > 6) return word.slice(0, 5);
    return word;
  }
  function tokens(text) { return normalize(text).split(' ').filter(Boolean).map(stem); }
  function features(text) {
    const t = tokens(text);
    const out = ['__bias__'];
    t.forEach(function (w, i) {
      out.push('w:' + w);
      if (w.length > 3) out.push('p:' + w.slice(0, 3));
      if (i > 0) out.push('b:' + t[i - 1] + '|' + w);
    });
    return out;
  }

  /* --- детерминированная инициализация весов ------------------------------- */
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967295;
  }
  const W = {}; // label -> { feature -> weight }
  const extraExamples = [];
  function weight(label, feat) {
    if (!(label in W)) W[label] = {};
    const row = W[label];
    if (!(feat in row)) row[feat] = (hash(label + ':' + feat) - 0.5) * 0.16;
    return row[feat];
  }
  function scores(text) {
    const f = features(text);
    const out = {};
    LABELS.forEach(function (label) {
      let s = 0;
      for (let i = 0; i < f.length; i++) s += weight(label, f[i]);
      out[label] = s;
    });
    return out;
  }
  function softmax(raw) {
    let max = -Infinity;
    LABELS.forEach(function (l) { if (raw[l] > max) max = raw[l]; });
    let sum = 0; const p = {};
    LABELS.forEach(function (l) { p[l] = Math.exp(Math.max(-30, raw[l] - max)); sum += p[l]; });
    LABELS.forEach(function (l) { p[l] /= sum || 1; });
    return p;
  }
  function train(examples, epochs, lr) {
    epochs = epochs || 55; lr = lr || 0.32;
    for (let e = 0; e < epochs; e++) {
      for (let n = 0; n < examples.length; n++) {
        const ex = examples[n];
        if (!INTENT_BY_ID[ex.label]) continue;
        const f = features(ex.text);
        const p = softmax(scores(ex.text));
        LABELS.forEach(function (label) {
          const grad = p[label] - (label === ex.label ? 1 : 0);
          if (Math.abs(grad) < 0.0005) return;
          const step = lr * grad;
          const row = W[label] || (W[label] = {});
          for (let i = 0; i < f.length; i++) {
            const key = f[i];
            const v = key in row ? row[key] : ((hash(label + ':' + key) - 0.5) * 0.16);
            row[key] = Math.max(-8, Math.min(8, v - step));
          }
        });
      }
    }
  }
  const baseExamples = [];
  INTENTS.forEach(function (intent) {
    intent.examples.forEach(function (text) { baseExamples.push({ text: text, label: intent.id }); });
  });

  /* --- tf-idf «лексическая» модель для устойчивости к незнакомым словам ---- */
  const KW = {};
  const IDF = {};
  function buildKeywordModel(examples) {
    const docs = {}; const df = {};
    LABELS.forEach(function (l) { docs[l] = []; });
    examples.forEach(function (ex) { if (docs[ex.label]) docs[ex.label].push(new Set(tokens(ex.text))); });
    const N = examples.length || 1;
    Object.keys(docs).forEach(function (l) {
      const counts = {};
      docs[l].forEach(function (set) { set.forEach(function (t) { counts[t] = (counts[t] || 0) + 1; df[t] = (df[t] || 0) + 1; }); });
      KW[l] = counts;
    });
    Object.keys(df).forEach(function (t) { IDF[t] = Math.log(1 + N / (1 + df[t])) + 1; });
  }
  function keywordBoost(text) {
    const t = Array.from(new Set(tokens(text)));
    const out = {};
    LABELS.forEach(function (l) {
      let s = 0;
      t.forEach(function (w) {
        const c = KW[l] && KW[l][w];
        if (c) s += c * (IDF[w] || 1) * 0.55;
      });
      out[l] = s;
    });
    return out;
  }

  function predict(text) {
    const p = softmax(scores(text));
    const b = keywordBoost(text);
    let bmax = 0.0001;
    LABELS.forEach(function (l) { if (b[l] > bmax) bmax = b[l]; });
    const combined = {};
    LABELS.forEach(function (l) {
      combined[l] = Math.log(p[l] + 1e-7) * 0.42 + (b[l] / bmax) * 1.7;
    });
    return LABELS.map(function (l) { return { id: l, score: combined[l], probability: p[l], keyword: b[l] }; })
      .sort(function (a, c) { return c.score - a.score; });
  }

  /* --- слоты ---------------------------------------------------------------- */
  function findColor(text) {
    const norm = normalize(text);
    for (let i = 0; i < data.COLORS.length; i++) {
      const c = data.COLORS[i];
      for (let j = 0; j < c.match.length; j++) if (norm.indexOf(c.match[j]) !== -1) return c;
    }
    return null;
  }
  function findItem(text) {
    const norm = normalize(text);
    let best = null;
    data.ITEMS.forEach(function (item) {
      item.aliases.forEach(function (alias) {
        const a = normalize(alias);
        if (a && norm.indexOf(a) !== -1 && (!best || a.length > best.length)) best = { item: item, match: a };
      });
    });
    return best ? best.item : null;
  }
  function findLocation(text) {
    const norm = normalize(text);
    let best = null;
    data.LOCATIONS.forEach(function (loc) {
      loc.aliases.forEach(function (alias) {
        const a = normalize(alias);
        if (a && norm.indexOf(a) !== -1 && (!best || a.length > best.length)) best = { loc: loc, match: a };
      });
    });
    return best ? best.loc : null;
  }
  function findPart(text) {
    const norm = normalize(text);
    let best = null;
    data.PART_ALIASES.forEach(function (p) {
      p.aliases.forEach(function (alias) {
        const a = normalize(alias);
        if (a && norm.indexOf(a) !== -1 && (!best || a.length > best.length)) best = { part: p.id, match: a };
      });
    });
    if (!best) {
      if (/л[её]в|левую|левой|левую/.test(norm)) {
        if (/рук|локт/.test(norm)) best = { part: 'armL' };
        else if (/ног|колен|стоп/.test(norm)) best = { part: 'legL' };
        else if (/кист|ладон|кулак|пальц/.test(norm)) best = { part: 'handL' };
      } else if (/прав/.test(norm)) {
        if (/рук|локт/.test(norm)) best = { part: 'armR' };
        else if (/ног|колен|стоп/.test(norm)) best = { part: 'legR' };
        else if (/кист|ладон|кулак|пальц/.test(norm)) best = { part: 'handR' };
      }
    }
    return best ? best.part : null;
  }
  function findClip(text, part) {
    const norm = normalize(text);
    let best = null;
    NIKA.anim.allClips().forEach(function (entry) {
      if (part && entry.part !== part) return;
      const name = normalize(entry.clip.name);
      const id = normalize(entry.clip.id);
      const words = name.split(' ').filter(function (w) { return w.length > 3; });
      const hit = name.indexOf(norm) !== -1 || (norm.indexOf(id) !== -1 && id.length > 3) ||
        words.some(function (w) { return w.length > 4 && norm.indexOf(w) !== -1; });
      if (hit && (!best || name.length > best.length)) best = { part: entry.part, id: entry.clip.id, length: name.length };
    });
    return best;
  }
  function findMinutes(text) {
    const m = normalize(text).match(/(\d+)\s*(минут|мин|час|часа|часов|секунд|сек)/);
    if (!m) return null;
    const n = parseInt(m[1], 10);
    if (/час/.test(m[2])) return Math.min(480, n * 60);
    if (/сек/.test(m[2])) return Math.max(1, Math.round(n / 60));
    return Math.min(480, n);
  }

  /* --- карта жестов: естественный язык -> конкретные клипы ----------------- */
  const GESTURES = [
    { match: ['помаш', 'маши рук', 'махать рук', 'приветств'], plays: [{ part: 'armR', id: 'wave' }, { part: 'face', id: 'smile' }], label: 'машет рукой' },
    { match: ['подними рук', 'поднять рук', 'руки вверх', 'подними обе'], plays: [{ part: 'armR', id: 'raise' }, { part: 'armL', id: 'raise' }], label: 'поднимает руки' },
    { match: ['опусти рук', 'опустить рук'], plays: [{ part: 'armR', id: 'lower' }, { part: 'armL', id: 'lower' }], label: 'опускает руки' },
    { match: ['кивн', 'кивай'], plays: [{ part: 'head', id: 'nod' }], label: 'кивает' },
    { match: ['покачай голов', 'покачать голов', 'мотай голов'], plays: [{ part: 'head', id: 'shake' }], label: 'качает головой' },
    { match: ['оглян', 'осмотр'], plays: [{ part: 'head', id: 'look-around' }], label: 'оглядывается' },
    { match: ['задум', 'подумай'], plays: [{ part: 'head', id: 'think' }], label: 'задумывается' },
    { match: ['зевн', 'зевай'], plays: [{ part: 'head', id: 'yawn' }, { part: 'face', id: 'sleepy' }], label: 'зевает' },
    { match: ['подмигн'], plays: [{ part: 'face', id: 'wink' }], label: 'подмигивает' },
    { match: ['улыбн', 'улыбнись'], plays: [{ part: 'face', id: 'smile' }], label: 'улыбается' },
    { match: ['рассмей', 'смейся', 'засмей'], plays: [{ part: 'face', id: 'laugh' }, { part: 'torso', id: 'laugh-shake' }], label: 'смеётся' },
    { match: ['нахмур', 'сердит'], plays: [{ part: 'face', id: 'annoyed' }], label: 'хмурится' },
    { match: ['прыгн', 'подпрыг', 'подскочи'], plays: [{ part: 'legL', id: 'jump' }, { part: 'hair', id: 'bounce' }], label: 'прыгает' },
    { match: ['присяд', 'сядь', 'сесть', 'присест'], plays: [{ part: 'legL', id: 'squat' }], label: 'приседает' },
    { match: ['поклон', 'поклонись', 'реверанс'], plays: [{ part: 'torso', id: 'bow' }], label: 'кланяется' },
    { match: ['потянись', 'потянуться', 'разомнись'], plays: [{ part: 'torso', id: 'stretch' }], label: 'потягивается' },
    { match: ['станцуй', 'танцуй', 'потанц'], plays: [{ part: 'legL', id: 'dance' }, { part: 'legR', id: 'dance' }, { part: 'skirt', id: 'twirl' }, { part: 'face', id: 'smile' }], label: 'танцует' },
    { match: ['покрутись', 'кружись', 'покруж'], plays: [{ part: 'skirt', id: 'twirl' }, { part: 'hair', id: 'whirl' }], label: 'кружится' },
    { match: ['ногой', 'пинок', 'ударь ног'], plays: [{ part: 'legR', id: 'kick' }], label: 'машет ногой' },
    { match: ['хлопни', 'похлопай', 'аплодисмент'], plays: [{ part: 'armL', id: 'clap' }, { part: 'armR', id: 'clap' }], label: 'хлопает в ладоши' },
    { match: ['кулак', 'сожми'], plays: [{ part: 'handR', id: 'fist' }], label: 'сжимает кулак' },
    { match: ['окей', 'жест ок', 'пальцы кольцом'], plays: [{ part: 'handR', id: 'okay' }], label: 'показывает «окей»' },
    { match: ['щелкни пальц', 'щёлкни пальц'], plays: [{ part: 'handR', id: 'snap' }], label: 'щёлкает пальцами' },
    { match: ['помани', 'подзови'], plays: [{ part: 'handR', id: 'beckon' }], label: 'манит пальцем' },
    { match: ['укажи', 'покажи пальцем', 'указательн'], plays: [{ part: 'armR', id: 'point' }, { part: 'handR', id: 'finger-point' }], label: 'указывает' },
    { match: ['взмахни волос', 'отброс волос', 'встряхни волос'], plays: [{ part: 'hair', id: 'flip' }], label: 'встряхивает волосами' },
    { match: ['носочк', 'на цыпочк'], plays: [{ part: 'legL', id: 'tiptoe' }, { part: 'legR', id: 'tiptoe' }], label: 'встаёт на носочки' },
    { match: ['поверни голов', 'посмотри вбок'], plays: [{ part: 'head', id: 'turn-right' }], label: 'поворачивает голову' },
    { match: ['дыши', 'вздохни'], plays: [{ part: 'torso', id: 'breathe' }], label: 'дышит' },
  ];
  function resolveGesture(text) {
    const norm = normalize(text);
    for (let i = 0; i < GESTURES.length; i++) {
      const g = GESTURES[i];
      for (let j = 0; j < g.match.length; j++) {
        if (norm.indexOf(normalize(g.match[j])) !== -1) return g;
      }
    }
    return null;
  }

  function extractSlots(text) {
    const norm = normalize(text);
    const side = /лев/.test(norm) ? 'L' : (/прав/.test(norm) ? 'R' : null);
    const plural = /обе|руками|руки|ногами|ладонями|кистями/.test(norm);
    return {
      item: findItem(text),
      color: findColor(text),
      location: findLocation(text),
      part: findPart(text),
      clip: findClip(text, null),
      minutes: findMinutes(text),
      side: side,
      plural: plural,
      gesture: resolveGesture(text),
      negation: /^не |не надо|не делай|не надевай|не ходи/.test(norm),
    };
  }

  /* --- встроенная локальная LLM браузера (бесплатно, без сети) ------------- */
  let llmSession = null;
  let llmFailed = false;
  function llmAvailable() {
    return !!(root.LanguageModel && typeof root.LanguageModel.create === 'function') && !llmFailed;
  }
  async function llmParse(text) {
    if (!llmAvailable()) return null;
    const LM = root.LanguageModel;
    if (!LM || typeof LM.create !== 'function') return null;
    try {
      if (!llmSession) {
        if (typeof LM.availability === 'function') {
          const state = await LM.availability();
          if (state === 'unavailable' || state === 'no') return null;
        }
        llmSession = await Promise.race([
          LM.create({ systemPrompt: 'Ты помогаешь игре-симулятору жизни. Отвечай ТОЛЬКО одним компактным JSON-объектом без пояснений.' }),
          new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, 4000); }),
        ]);
      }
      const prompt = 'Определи намерение игрока для девушки Ники. Возможные intent: ' + LABELS.join(', ') +
        '. Верни JSON вида {"intent":"...","item":"...","part":"...","location":"...","minutes":0}. ' +
        'Пиши значения по-русски или используй id из списка. Фраза игрока: ' + text;
      const raw = await Promise.race([
        llmSession.prompt(prompt),
        new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, 6000); }),
      ]);
      const match = String(raw).match(/\{[\s\S]*?\}/);
      if (!match) return null;
      const obj = JSON.parse(match[0]);
      let intent = obj.intent;
      if (!INTENT_BY_ID[intent]) {
        const hint = predict(String(intent || '') + ' ' + text)[0];
        intent = hint ? hint.id : null;
      }
      if (!intent) return null;
      return { intent: intent, llm: obj };
    } catch (e) {
      llmFailed = true;
      return null;
    }
  }

  /* --- разбор команды ------------------------------------------------------- */
  function parseCommand(text, llmHint) {
    const ranking = predict(text);
    let intent = ranking[0].id;
    let source = 'нейросеть + tf-idf';
    if (llmHint && llmHint.intent) { intent = llmHint.intent; source = 'встроенная LLM браузера'; }
    const slots = extractSlots(text);
    /* эвристические уточнения: жесты и одежда всегда имеют приоритет */
    const normText = normalize(text);
    const teaching = /запомн|научись|выучи|это значит|добавь правило|переобучись/.test(normText);
    if (!llmHint && !teaching) {
      if (/туалет|санузел|уборн|по нужде|унитаз/.test(normText)) intent = 'toilet';
      if (/прими ванну|искуп|купай|покупайся|пене|полотенц|вымойся|душ/.test(normText)) intent = 'wash';
      if (slots.item && /наден|оден|переоден|обу|накин|смени/.test(normText)) intent = 'dress';
      if (/сними|разуй|снять/.test(normalize(text)) && slots.item) intent = 'undress';
      if (slots.gesture && ranking[0].id !== 'sleep' && ranking[0].id !== 'work') {
        if (/помаш|кивн|подмигн|улыбн|прыгн|поклон|станцуй|покрутись|зевн|оглян|потянись|подними рук|сядь|присяд|кулак|хлопни|щелкни|носочк/.test(normalize(text))) intent = 'animate';
      }
    }
    const best = ranking[0], second = ranking[1];
    const confidence = Math.max(0, Math.min(1, (best.score - (second ? second.score : 0)) / 2.2 + (best.probability || 0) * 0.4));
    return {
      raw: text, intent: intent, label: INTENT_BY_ID[intent] ? INTENT_BY_ID[intent].label : intent,
      slots: slots, confidence: confidence, source: source, ranking: ranking.slice(0, 3),
    };
  }

  function splitCommands(text) {
    const parts = String(text || '')
      .split(/\s*[,;]\s*|\s+(?:потом|затем|а после)\s+/i)
      .map(function (p) { return p.replace(/^\s*(?:потом|затем|а после|и)\s+/i, '').trim(); })
      .filter(function (p) { return !!p; });
    const out = [];
    parts.forEach(function (p) {
      const sub = p.split(/\s+и\s+/i);
      if (sub.length > 1 && sub.every(function (s) { return normalize(s).split(' ').length >= 1; })) {
        sub.forEach(function (s) { if (normalize(s)) out.push(s.trim()); });
      } else if (normalize(p)) out.push(p.trim());
    });
    return out.filter(Boolean).slice(0, 6);
  }

  /* --- дообучение на команде «запомни» ------------------------------------- */
  function addExample(text, intentId) {
    if (!INTENT_BY_ID[intentId]) return false;
    extraExamples.push({ text: text, label: intentId });
    train(extraExamples.slice(-12), 24, 0.4);
    buildKeywordModel(baseExamples.concat(extraExamples));
    return true;
  }
  function teach(text) {
    /* формат: «запомни: <фраза> = <намерение>» или «<фраза> значит <намерение>» */
    const norm = normalize(text);
    const cleaned = String(text).replace(/^.*?(запомни|научись|выучи|это значит|значит)\s*:?\s*/i, '');
    const bits = cleaned.split(/\s*=\s*|\s+значит\s+|\s+это\s+/i);
    if (bits.length < 2) return null;
    const phrase = bits[0].trim();
    const tail = normalize(bits[1]);
    let target = INTENT_BY_ID[tail] ? tail : null;
    const synonyms = {
      'одеться': 'dress', 'надень': 'dress', 'переоденься': 'dress', 'одеть': 'dress',
      'спать': 'sleep', 'поесть': 'eat', 'работать': 'work', 'помочь': 'help',
      'иди': 'go', 'двигайся': 'go', 'анимация': 'animate', 'движение': 'animate',
      'жест': 'animate', 'отдыхать': 'wait', 'статус': 'status',
    };
    Object.keys(synonyms).forEach(function (k) { if (tail.indexOf(k) !== -1) target = synonyms[k]; });
    if (!target) {
      const guess = predict(bits[1])[0];
      target = guess.id;
    }
    if (!phrase || !target) return null;
    addExample(phrase, target);
    return { phrase: phrase, intent: target, label: INTENT_BY_ID[target].label };
  }
  /* --- ОБУЧЕНИЕ ПО ФРАЗАМ ИГРОКА И ПО ТЕКСТУ (в т.ч. вставленному из интернета) ---
     Ника не делает скрытых сетевых запросов: игрок сам вставляет текст/ссылки
     в поле обучения, а модель дообучается локально, в браузере.               */
  function learnExample(phrase, intentId) {
    phrase = String(phrase || '').trim();
    if (!phrase || !INTENT_BY_ID[intentId]) return false;
    extraExamples.push({ text: phrase, label: intentId, source: 'feedback' });
    train(extraExamples.slice(-16), 32, 0.42);
    buildKeywordModel(baseExamples.concat(extraExamples));
    return true;
  }
  function learnFromText(text) {
    const lines = String(text || '').split(/\r?\n/);
    let added = 0, skipped = 0;
    const learned = [];
    lines.forEach(function (raw) {
      const line = raw.trim();
      if (!line || line.length > 240) { skipped++; return; }
      let phrase = line, tail = '';
      const m = line.split(/\s*(?:=|->|→|:)\s*/);
      if (m.length >= 2) { phrase = m[0].trim(); tail = normalize(m.slice(1).join(' ')); }
      let target = INTENT_BY_ID[tail] ? tail : null;
      if (!target && tail) {
        const syn = { одеться:'dress', надень:'dress', переоденься:'dress', спать:'sleep', поесть:'eat',
          работать:'work', помочь:'help', купаться:'wash', искупаться:'wash', ванна:'wash',
          туалет:'toilet', санузел:'toilet', говорить:'talk', разговор:'talk', анимация:'animate',
          двигайся:'go', иди:'go', статус:'status', жди:'wait', отдых:'wait' };
        Object.keys(syn).forEach(function (k) { if (tail.indexOf(k) !== -1) target = syn[k]; });
      }
      if (!target) {
        /* строка без разметки: модель сама размечает её и учится на своей гипотезе */
        const guess = predict(phrase)[0];
        target = guess.id;
      }
      if (!phrase || !INTENT_BY_ID[target]) { skipped++; return; }
      extraExamples.push({ text: phrase, label: target, source: 'text' });
      learned.push({ phrase: phrase, intent: target });
      added++;
    });
    if (added) {
      train(extraExamples.slice(-Math.min(120, added * 2)), 26, 0.36);
      buildKeywordModel(baseExamples.concat(extraExamples));
    }
    return { added: added, skipped: skipped, learned: learned, total: extraExamples.length };
  }
  function feedback(text, correctIntent) {
    /* исправление последней команды: «нет, я имел в виду ...» */
    return learnExample(text, correctIntent);
  }
  function learnedExamples() { return extraExamples.slice(); }
  function restore(saved) {
    if (!Array.isArray(saved)) return;
    saved.slice(-200).forEach(function (ex) {
      if (ex && typeof ex.text === 'string' && INTENT_BY_ID[ex.label]) {
        extraExamples.push({ text: ex.text, label: ex.label, source: ex.source || 'saved' });
      }
    });
    if (extraExamples.length) {
      train(extraExamples.slice(-120), 18, 0.3);
      buildKeywordModel(baseExamples.concat(extraExamples));
    }
  }
  function serialize() { return extraExamples.slice(-200); }

  /* --- планировщик автономной жизни (utility AI) --------------------------- */
  function decide(state) {
    if (!state || state.autonomy === false) return null;
    const n = state.needs;
    const hour = state.hour;
    const night = hour >= 22 || hour < 7;
    const options = [
      { intent: 'sleep',  score: (100 - n.energy) * 1.15 + (night ? 52 : -35) + (n.energy > 82 ? -60 : 0) },
      { intent: 'eat',    score: (100 - n.hunger) * 1.1 + (hour > 11 && hour < 15 ? 12 : 0) },
      { intent: 'wash',   score: (100 - n.hygiene) * 0.72 + (hour > 7 && hour < 10 ? 10 : 0) },
      { intent: 'toilet', score: (100 - (n.bladder === undefined ? 100 : n.bladder)) * 1.25 + 4 },
      { intent: 'work',   score: (120 - n.money) * 0.38 + (!night && hour >= 9 && hour <= 19 ? 34 : -60) - (n.energy < 35 ? 55 : 0) },
      { intent: 'help',   score: (100 - n.mood) * 0.35 + 8 },
      { intent: 'exercise', score: (100 - n.fitness) * 0.4 + (hour >= 7 && hour <= 10 ? 12 : -10) },
      { intent: 'talk',   score: 6 + (n.mood > 75 ? 6 : 0) },
      { intent: 'animate', score: 9 + (n.mood > 70 ? 7 : 0) },
      { intent: 'wait',   score: 12 },
    ];
    options.forEach(function (o) {
      o.score += ((state.day * 7 + Math.floor(state.minutes / 37) + o.intent.length * 5) % 11) * 0.7;
      if (state.lastAuto === o.intent) o.score -= 26;
      if (state.action && state.action.intent === o.intent) o.score -= 45;
    });
    options.sort(function (a, b) { return b.score - a.score; });
    const pick = options[0];
    return { intent: pick.intent, score: Math.round(pick.score), reason: reasonFor(pick.intent, state) };
  }
  function reasonFor(intent, state) {
    const n = state.needs;
    const reasons = {
      sleep: 'энергия всего ' + Math.round(n.energy) + '%, пора спать',
      eat: 'голод ' + Math.round(100 - n.hunger) + '%, надо поесть',
      wash: 'хочется принять ванну и привести себя в порядок',
      toilet: 'пора сходить в санузел, так комфортнее',
      work: 'нужно заработать денег, сейчас рабочее время',
      talk: 'хочется немного поболтать',
      help: 'настроение не очень — помогу по дому, станет легче',
      exercise: 'тело просит движения, сделаю зарядку',
      animate: 'разомнусь и покажу новое движение',
      wait: 'всё в порядке, просто побуду здесь и отдохну',
    };
    return reasons[intent] || 'выбираю, чем заняться';
  }

  /* --- инициализация -------------------------------------------------------- */
  train(baseExamples, 55, 0.32);
  buildKeywordModel(baseExamples);

  NIKA.ai = {
    INTENTS: INTENTS, LABELS: LABELS, INTENT_BY_ID: INTENT_BY_ID, GESTURES: GESTURES,
    normalize: normalize, tokens: tokens, features: features, predict: predict,
    parseCommand: parseCommand, splitCommands: splitCommands, extractSlots: extractSlots,
    findItem: findItem, findColor: findColor, findLocation: findLocation,
    findPart: findPart, findClip: findClip, findMinutes: findMinutes, resolveGesture: resolveGesture,
    decide: decide, teach: teach, addExample: addExample, restore: restore, serialize: serialize,
    learnExample: learnExample, learnFromText: learnFromText, feedback: feedback,
    learnedExamples: learnedExamples, baseExamples: baseExamples,
    llmAvailable: llmAvailable, llmParse: llmParse,
    info: function () {
      return {
        model: 'обучаемая нейросеть (softmax) + tf-idf, дообучение на фразах игрока',
        trainedOn: baseExamples.length + extraExamples.length,
        learned: extraExamples.length,
        parameters: LABELS.length,
        intents: LABELS.length,
        llm: llmAvailable() ? 'встроенная локальная модель браузера доступна' : 'встроенная LLM не найдена — работает локальная модель',
        cloud: 'нет', cost: '0 ₽', network: 'не используется',
        internet: 'обучение на вставленном тексте, без скрытых запросов',
      };
    },
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
