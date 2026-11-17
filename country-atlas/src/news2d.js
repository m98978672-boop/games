/* §82: новости страны (R-82.1…R-82.5, F-269…F-276).
   Газета не выдумывает жизнь — она пересказывает то, что уже случилось в мире:
   ДТП (§78), погоду (§76), решения мэров (§16.8), стройку. Заголовок выбирается
   хешем от события, поэтому одна и та же авария всегда описана одинаково,
   а сохранений у газеты нет: закрыли вкладку — открыли, и она снова соберёт
   те же заметки из тех же событий. */
import { hash01 } from './accidents2d.js';

export const NEWS = {
  max: 40,                 // сколько заметок держим в ленте
  freshPerHour: 4,         // сколько событий одного часа берём в номер
  maxAgeMin: 60 * 24 * 3,  // старше трёх игровых суток — уже не новость
  bucketMin: 5,            // заметки одного события в пределах пятиминутки — дубль
  kinds: {
    accident: { name: 'происшествие', weight: 3 },
    weather: { name: 'погода', weight: 2 },
    mayor: { name: 'город', weight: 2 },
    growth: { name: 'стройка', weight: 1 },
    traffic: { name: 'дорога', weight: 2 },
    record: { name: 'рекорд', weight: 1 }
  }
};

/* F-269: шаблоны заголовков. В фигурных скобках — подстановки из события. */
const TEMPLATES = {
  accident: [
    'ДТП: {where}, {name} — полоса закрыта на {min} мин',
    '{where}: {name}, движение встало на {min} мин',
    'На {where} авария — {name}; объезжайте',
    'Внимание, {where}: {name}. Стоим {min} мин'
  ],
  weather: [
    'Погода в {where}: {kind}, видно {vis} км',
    '{where} накрыло: {kind}, сцепление {grip} %',
    'Сводка: {where} — {kind}, ветер {wind} км/ч',
    'Осторожно на дорогах: {where}, {kind}'
  ],
  mayor: [
    '{where}: мэр решил — {action}',
    'В {where} {action}: так решил мэр',
    '{where} меняется: {action}',
    'Решение мэра {where}: {action}'
  ],
  growth: [
    '{where}: выросли {what}',
    'В {where} сдали {what}',
    '{where} расширяется — {what}',
    'Стройка в {where}: {what} готовы'
  ],
  traffic: [
    '{where}: затор {km} км',
    'Пробка на {where} — {km} км',
    '{where} стоит: {km} км хвост',
    'Затор {km} км — {where}'
  ],
  record: [
    '{where}: рекорд — {what}',
    'День {day}: {where}, {what}',
    'Итог дня {day}: {what} в {where}'
  ]
};

/* F-270: шаблон выбирается хешем от вида и времени — один и тот же всегда. */
export function pickTemplate(kind, at, salt = 0) {
  const list = TEMPLATES[kind] || TEMPLATES.weather;
  const u = hash01(Math.round(at) + salt * 7919, kind.length * 131 + salt);
  return list[Math.floor(u * list.length) % list.length];
}

/* F-271: подстановки. Всё, чего нет, заменяется честным «—», а не пустотой. */
export function fillTemplate(tpl, data = {}) {
  return tpl.replace(/\{(\w+)\}/g, (_, key) => {
    const v = data[key];
    if (v === undefined || v === null || v === '') return '—';
    return String(v);
  });
}

/* F-272: заметка из события. Событие — простой объект: вид, минута, город, данные. */
export function makeItem(kind, at, where, data = {}) {
  if (!NEWS.kinds[kind]) return null;
  const tpl = pickTemplate(kind, at, (data.salt || 0));
  return {
    id: kind + ':' + Math.round(at) + ':' + String(where || '') + ':' + String(data.tag || ''),
    kind,
    at: Math.round(at),
    where: where || '—',
    text: fillTemplate(tpl, { where: where || '—', ...data }),
    weight: NEWS.kinds[kind].weight
  };
}

/* F-273: лента — свежее сверху, дубли одного события склеиваются по пятнадцатиминутке. */
export function mergeNews(oldItems = [], freshItems = [], max = NEWS.max) {
  const out = [];
  const seen = new Set();
  const stamp = (it) => Math.floor(it.at / NEWS.bucketMin);
  for (const it of [...freshItems].filter(Boolean).concat(oldItems.filter(Boolean))) {
    if (it.at !== undefined && it.at < 0) continue;
    const key = it.kind + '|' + it.where + '|' + stamp(it);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  out.sort((a, b) => b.at - a.at || b.weight - a.weight);
  return out.slice(0, max);
}

/* F-274: лента не растёт старьём: заметки старше трёх суток выпадают. */
export function trimNews(items = [], minutes = 0, maxAgeMin = NEWS.maxAgeMin) {
  return items.filter((it) => minutes - it.at <= maxAgeMin);
}

/* F-275: сводка для панели и подсказки. */
export function newsStats(items = []) {
  const byKind = {};
  for (const k of Object.keys(NEWS.kinds)) byKind[k] = 0;
  let newest = null;
  const towns = new Set();
  for (const it of items) {
    byKind[it.kind] = (byKind[it.kind] || 0) + 1;
    if (!newest || it.at > newest.at) newest = it;
    if (it.where && it.where !== '—') towns.add(it.where);
  }
  return {
    count: items.length,
    byKind,
    towns: towns.size,
    newest,
    newestAt: newest ? newest.at : null,
    accidents: byKind.accident || 0,
    weather: byKind.weather || 0
  };
}

/* F-276: заметки из уже случившегося. Ничего не выдумываем — только пересказ.
   accident: {name, at, minutes, where}; wx: {kind, visibilityKm, grip, windKmh, where};
   mayor: {where, action, at}; growth: {where, what, at}; traffic: {where, km, at}. */
export function newsFromEvents({ accidents = [], wx = [], mayors = [], growth = [], traffic = [], limit = NEWS.freshPerHour } = {}) {
  const items = [];
  for (const e of accidents.slice(-limit)) {
    items.push(makeItem('accident', e.at, e.where, { name: e.name, min: e.minutes, tag: e.name }));
  }
  for (const w of wx.slice(-limit)) {
    items.push(makeItem('weather', w.at, w.where, {
      kind: weatherWord(w.kind), vis: w.visibilityKm, grip: Math.round((w.grip || 1) * 100),
      wind: Math.round(w.windKmh || 0), tag: w.kind
    }));
  }
  for (const m of mayors.slice(-limit)) {
    items.push(makeItem('mayor', m.at, m.where, { action: m.action, tag: m.action }));
  }
  for (const g of growth.slice(-limit)) {
    items.push(makeItem('growth', g.at, g.where, { what: g.what, tag: g.what }));
  }
  for (const t of traffic.slice(-limit)) {
    items.push(makeItem('traffic', t.at, t.where, { km: t.km, tag: String(t.km) }));
  }
  return items.filter(Boolean);
}

/* F-277: погода по-человечески. */
export function weatherWord(kind) {
  return ({ clear: 'ясно', cloudy: 'облачно', rain: 'дождь', snow: 'снег', fog: 'туман' })[kind] || kind || '—';
}

/* F-278: время заметки по-человечески: «день 3 · 14:20». */
export function newsTime(item) {
  if (!item || item.at === undefined) return '—';
  const day = Math.floor(item.at / 1440) + 1;
  const mins = Math.round(item.at % 1440);
  const hh = String(Math.floor(mins / 60)).padStart(2, '0');
  const mm = String(mins % 60).padStart(2, '0');
  return 'день ' + day + ' · ' + hh + ':' + mm;
}
