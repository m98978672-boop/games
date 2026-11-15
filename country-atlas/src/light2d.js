/* Время суток §14 в 2D. В 3D это был свет и тени; сверху игра читается цветом и огнями:
   ночью карта уходит в синеву, в окнах и на улицах зажигается свет, днём всё нейтрально.
   Модель солнца — упрощённая для широты 48° (R-14.1), сезоны — по 90 игровых дней (R-14.11). */

export const LATITUDE = 48;                 // широта страны, градусы
export const DAY_MINUTES = 1440;            // суток в минутах
export const SEASON_DAYS = 90;              // четыре сезона по 90 игровых дней (R-14.11)
export const START_DAY_OF_YEAR = 172;       // мир начинается в разгар лета: на карте зелено

/* F-162: календарный день года по номеру игрового дня (день 1 — лето, зима придёт на 270-й). */
export function dayOfYearOf(day) {
  return (((START_DAY_OF_YEAR + day) % 360) + 360) % 360;
}

/* Поиск часа с нужной фазой: кнопки «утро» и «вечер» не зависят от сезона. */
export function hourWithPhase(phaseId, dayOfYear = 172) {
  const want = { dawn: PHASE.dawn, dusk: PHASE.dusk, day: PHASE.day, night: PHASE.night, twilight: PHASE.twilight };
  for (let m = 0; m < DAY_MINUTES; m += 5) {
    if (phaseAt(m, dayOfYear).id === phaseId) return m / 60;
  }
  return phaseId === 'night' ? 1 : phaseId === 'day' ? 13 : 7;
}

/* R-14.1: фазы суток — цвет и сила света. tone — множитель к картинке. */
export const PHASE = {
  night:    { id: 'night',    name: 'ночь',     strength: 0.06, tone: [0.52, 0.62, 0.86] },
  dawn:     { id: 'dawn',     name: 'рассвет',  strength: 0.55, tone: [1.00, 0.86, 0.74] },
  day:      { id: 'day',      name: 'день',     strength: 1.00, tone: [1.00, 1.00, 1.00] },
  dusk:     { id: 'dusk',     name: 'закат',    strength: 0.60, tone: [1.00, 0.82, 0.66] },
  twilight: { id: 'twilight', name: 'сумерки',  strength: 0.25, tone: [0.72, 0.66, 0.84] }
};

const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

/* F-157: склонение солнца по дню года (год — 360 игровых дней). */
export function declinationDeg(dayOfYear) {
  const d = ((dayOfYear % 360) + 360) % 360;
  return 23.44 * Math.sin((2 * Math.PI * (d - 80)) / 360);
}

/* F-158: высота солнца над горизонтом: sin h = sin φ·sin δ + cos φ·cos δ·cos H. */
export function sunAltitudeDeg(minutes, dayOfYear = 172) {
  const m = ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const H = 15 * (m / 60 - 12);                       // часовой угол
  const phi = rad(LATITUDE), dec = rad(declinationDeg(dayOfYear));
  const s = Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(rad(H));
  return deg(Math.asin(Math.max(-1, Math.min(1, s))));
}

/* F-159: фаза суток по высоте солнца и времени (утро или вечер). */
export function phaseAt(minutes, dayOfYear = 172) {
  const alt = sunAltitudeDeg(minutes, dayOfYear);
  const m = ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const morning = m < 720;
  if (alt >= 10) return PHASE.day;
  if (alt >= 0) return morning ? PHASE.dawn : PHASE.dusk;
  if (alt >= -6) return PHASE.twilight;
  return PHASE.night;
}

/* R-14.3: искусственный свет. < 4° — фонари 30 %, окна 40 %; < −2° — всё горит.
   Между порогами плавный рост, утром и вечером — разный: гаснут не одновременно. */
export function artificialLight(altDeg) {
  if (altDeg >= 4) return { lamps: 0, windows: 0, full: false };
  const k = Math.min(1, (4 - altDeg) / 6);            // 0 при 4°, 1 при −2°
  const on = altDeg < -2;
  return {
    lamps: on ? 1 : 0.3 + 0.7 * k,
    windows: on ? 1 : 0.4 + 0.6 * k,
    full: on
  };
}

/* F-160: сила света 0…1 и множитель цвета для картинки. */
export function lightAt(minutes, dayOfYear = 172) {
  const alt = sunAltitudeDeg(minutes, dayOfYear);
  const ph = phaseAt(minutes, dayOfYear);
  // плавная интерполяция силы между фазами: у горизонта света меньше, чем в зените
  const k = Math.max(0, Math.min(1, (alt + 6) / 26));  // −6° → 0, 20° → 1
  const strength = Math.max(PHASE.night.strength,
    Math.min(1, PHASE.night.strength + (1 - PHASE.night.strength) * k));
  return { alt, phase: ph, strength, tone: ph.tone, artificial: artificialLight(alt) };
}

/* F-161: сезон по календарному дню года (360 дней): зима 15.12–15.03, весна, лето, осень. */
export function seasonOf(day) {
  const d = ((day % 360) + 360) % 360;
  if (d >= 355 || d < 79) return 'winter';
  if (d < 170) return 'spring';
  if (d < 260) return 'summer';
  return 'autumn';
}

/* Снежный покров: 0 вне зимы; внутри зимы растёт за 20 дней, держится и сходит к марту. */
export function snowCover01(day) {
  const d = ((day % 360) + 360) % 360;
  if (seasonOf(d) !== 'winter') return 0;
  const k = d >= 355 ? d - 355 : d + 5;          // 0…84 — положение внутри зимы
  if (k < 20) return k / 20;
  if (k < 60) return 1 - 0.2 * ((k - 20) / 40);
  return Math.max(0, 0.8 * (1 - (k - 60) / 24));
}

/* Часы игры в текст: «день 3 · 21:40 · закат». Фаза берётся от дня года, а не от номера дня:
   день 1 — лето, поэтому составное «07:06 · ночь» было бы неправдой (R-56.5). */
export function clockText(minutes, dayOfYear = START_DAY_OF_YEAR) {
  const total = Math.floor(minutes);
  const day = Math.floor(total / DAY_MINUTES) + 1;
  const hh = String(Math.floor((total % DAY_MINUTES) / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  const ph = phaseAt(total, dayOfYear);
  return 'день ' + day + ' · ' + hh + ':' + mm + ' · ' + ph.name;
}

/* Цвет наложения на карту: rgba-строка. Днём наложения нет, ночью — синяя ночь. */
export function overlayCss(strength, tone) {
  const alpha = Math.max(0, Math.min(0.74, (1 - strength) * 0.72));
  if (alpha < 0.01) return 'rgba(0,0,0,0)';
  // тон фазы: ночью сине-голубой, на рассвете и закате — тёплый
  const r = Math.round(10 + 46 * tone[0] * 0.45);
  const g = Math.round(18 + 46 * tone[1] * 0.45);
  const b = Math.round(44 + 46 * tone[2] * 0.45);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha.toFixed(3) + ')';
}

/* Огни города: сколько точек и с какой силой рисовать. Ночью — окна и фонари. */
export function cityLights(artificial, scale) {
  if (!artificial) return { windows: 0, lamps: 0, radiusPx: 0 };
  const r = scale >= 60 ? 1.1 : scale >= 20 ? 0.8 : 0.55;
  return { windows: artificial.windows, lamps: artificial.lamps, radiusPx: r };
}
