/* §79: сжатие невидимой информации (R-79.1…R-79.6, F-259…F-268).
   Мы не рисуем то, что вне кадра, но до сих пор всё равно двигали: 120 городов × 40–90
   пешеходов тикали каждый кадр, а кэши невидимых клеток держали строковые ключи.
   Здесь два уровня сжатия — как в майнкрафте, только без потерь:

   Уровень 1 «сон» — город вне кадра не двигается по шагам: для него копится одно число
   (сколько секунд он проспал). Движение пешехода линейно (F-263), поэтому догон одним
   вызовом даёт то же положение, что и тысяча мелких шагов, — расхождение меньше нанометра.

   Уровень 2 «архив» — если город не видно дольше 45 с, из памяти выбрасываются сами
   пешеходы, их тайлы и толпа. Остаётся запись: сколько спал + по байту на пешехода
   (сторона тротуара, ожидание) и таймер перехода в секундах. Проснувшись, город
   собирается из того же сида и догоняется на всё проспанное время — картинка та же.

   Плюс F-268: ключи кэшей погоды/льда — не строки, а упакованные числа (48 бит). */
import { advancePeds } from './ped2d.js';

export const DORMANT = {
  padKm: 30,             // запас вокруг кадра: пригород за краем ещё «видно»
  pedScale: 40,          // F-260: ниже 40 px/км пешеходов не рисуют (§13 LOD)
  archiveAfterSec: 45,   // F-265: столько реальных секунд сна — и город уходит в архив
  archiveKeep: 128,      // больше 128 архивных городов не держим
  keyBucketMinutes: 5,   // погода живёт пятиминутками
  keyBucketBits: 18,     // 2^18 пятиминуток ≈ 2.5 года игры
  keyDayBits: 10,
  keyCellBits: 10,
  bytesPerPed: 96         // F-267: столько примерно занимает живой пешеход (оценка)
};

/* ---------- F-261: упакованные ключи вместо строк ---------- */

export const KEY = {
  cellMask: (1 << DORMANT.keyCellBits) - 1,        // 1023, со сдвигом +512
  bucketMask: (1 << DORMANT.keyBucketBits) - 1,
  dayMask: (1 << DORMANT.keyDayBits) - 1
};

/* F-261: клетка (cx, cy), пятиминутка и день → одно целое число (≤ 48 бит). */
export function packKey(cx, cy, bucket, day) {
  const x = (cx + 512) & KEY.cellMask;
  const y = (cy + 512) & KEY.cellMask;
  const b = (bucket & KEY.bucketMask);
  const d = (day & KEY.dayMask);
  return ((d * (KEY.bucketMask + 1) + b) * (KEY.cellMask + 1) + y) * (KEY.cellMask + 1) + x;
}

export function unpackKey(key) {
  const x = key % (KEY.cellMask + 1);
  const rest = (key - x) / (KEY.cellMask + 1);
  const y = rest % (KEY.cellMask + 1);
  const rest2 = (rest - y) / (KEY.cellMask + 1);
  const b = rest2 % (KEY.bucketMask + 1);
  const d = (rest2 - b) / (KEY.bucketMask + 1);
  return { cx: x - 512, cy: y - 512, bucket: b, day: d };
}

/* F-262: город в кадре? Сравнение по километрам, а не по пикселям: запас уже в км. */
export function cityVisible(city, center, halfW, halfH) {
  if (!city || !center) return false;
  return Math.abs(city.x - center.x) <= halfW && Math.abs(city.y - center.y) <= halfH;
}

/* F-263: догон проспанного времени. Движение пешехода линейно, поэтому один вызов
   на всё проспанное время даёт то же положение, что и тысяча мелких шагов. */
export function advanceFrozen(pack, dtSec) {
  if (!pack || !(dtSec > 0)) return pack;
  return advancePeds(pack, dtSec);
}

/* F-264: сколько байт занимает город сейчас и сколько в архиве. */
export function packBytes(pack) {
  if (!pack) return 0;
  return (pack.peds ? pack.peds.length : 0) * DORMANT.bytesPerPed;
}

export function archiveBytes(rec) {
  if (!rec) return 0;
  const n = rec.n || 0;
  return 24 + n * 4;                 // сторона, ожидание, таймер перехода — по 4 байта
}

/* ---------- F-265/F-266: сон и архив ---------- */

export class Dormancy {
  constructor() {
    this.sleep = new Map();          // индекс города → сколько секунд он спит
    this.age = new Map();            // индекс города → сколько всего он прожил с момента сборки
    this.arch = new Map();           // индекс города → сводка (уровень 2)
    this.awake = 0;
    this.slept = 0;
    this.archivedNow = 0;
    this.sleepSec = 0;               // сколько пешеходных секунд не считали
    this.restored = 0;
    this.restSec = 0;
    this.woken = 0;
    this.lastVisible = new Set();
  }

  /* Основной шаг: кого будить, кого усыплять, кого отправить в архив. */
  step(map, dtSec) {
    this.map = map;
    if (!map || !map.pedCache || !map.view) return this.stats();
    const dt = Math.max(0, dtSec);
    const s = map.scale || 1;
    const halfW = map.view.w / (2 * s) + DORMANT.padKm;
    const halfH = map.view.h / (2 * s) + DORMANT.padKm;
    const pedVisible = !!map.showPeds && s >= DORMANT.pedScale;
    this.awake = 0; this.slept = 0; this.archivedNow = this.arch.size;
    this.lastVisible.clear();

    // 1) архив: если город вернулся в кадр — поднимаем из сводки и догоняем
    if (this.arch.size) {
      for (const [idx, rec] of [...this.arch]) {
        const city = map.settlements[idx];
        if (!cityVisible(city, map.center, halfW, halfH)) {
          rec.sec += dt;                       // архивный город спит дальше — время копится
          this.sleepSec += dt;
          this.slept++;
          continue;
        }
        const pack = map.pedsAt(idx);                    // собирается из того же сида
        if (rec.sides && pack.peds.length === rec.n) restoreCrowd(map, idx, pack, rec);
        advanceFrozen(pack, rec.sec);                    // F-263: догон за всё прожитое время
        this.age.set(idx, rec.sec);
        this.arch.delete(idx);
        this.restored++;
        this.restSec += rec.sec;
        this.sleep.delete(idx);
        if (pedVisible) { advancePeds(pack, dt); this.age.set(idx, rec.sec + dt); this.awake++; }
        else { this.sleep.set(idx, 0); this.slept++; }
      }
    }

    // 2) живые города: видно — шагаем, не видно — копим время
    for (const [idx, pack] of [...map.pedCache]) {
      if (this.arch.has(idx)) continue;
      const city = map.settlements[idx];
      const vis = pedVisible && cityVisible(city, map.center, halfW, halfH);
      if (vis) {
        const pending = this.sleep.get(idx) || 0;
        if (pending > 0) { advanceFrozen(pack, pending); this.woken++; this.restSec += pending; }
        this.sleep.delete(idx);
        advancePeds(pack, dt);
        this.age.set(idx, (this.age.get(idx) || 0) + pending + dt);
        this.awake++;
        this.lastVisible.add(idx);
      } else {
        const acc = (this.sleep.get(idx) || 0) + dt;
        this.sleep.set(idx, acc);
        this.sleepSec += dt;
        this.slept++;
        if (acc >= DORMANT.archiveAfterSec && this.arch.size < DORMANT.archiveKeep) {
          this.archive(map, idx, pack, acc);
        }
      }
    }
    return this.stats();
  }

  /* Уровень 2: содержимое города выбрасываем, оставляем квитанцию. */
  archive(map, idx, pack, sec) {
    const crowd = map.crowds ? map.crowds.get(idx) : null;
    const n = pack.peds.length;
    // F-265: в квитанции — всё прожитое городом время, а не только сон: иначе при
    // подъёме из архива пешеходы «отматывались» бы назад к моменту сборки
    const total = (this.age.get(idx) || 0) + sec;
    const rec = { sec: total, sleepSec: sec, n, peds: n };
    this.age.delete(idx);
    if (crowd) {
      rec.sides = Uint8Array.from(crowd.side || new Uint8Array(n));
      rec.waiting = Uint8Array.from(crowd.waiting || new Uint8Array(n));
      rec.nextCross = Uint16Array.from((crowd.nextCross || new Float64Array(n)).map((x) => Math.max(0, Math.min(65535, Math.round(x)))));
      rec.crossed = crowd.crossed || 0;
    }
    this.arch.set(idx, rec);
    map.pedCache.delete(idx);
    if (map.crowds) map.crowds.delete(idx);
    this.archivedNow = this.arch.size;
    return rec;
  }

  /* F-266: сводка для HUD — что видно, что спит, что в архиве. */
  stats() {
    let livePeds = 0, liveCities = 0;
    const map = this.map;
    if (map && map.pedCache) {
      for (const pack of map.pedCache.values()) { liveCities++; livePeds += pack.peds.length; }
    }
    let archivedPeds = 0;
    for (const rec of this.arch.values()) archivedPeds += rec.n || 0;
    return {
      awake: this.awake,
      slept: this.slept,
      awakeCities: liveCities,
      sleepingCities: this.sleep.size - this.lastVisible.size,
      archivedCities: this.arch.size,
      livePeds,
      archivedPeds,
      liveBytes: livePeds * DORMANT.bytesPerPed,
      savedBytes: archivedPeds * DORMANT.bytesPerPed - [...this.arch.values()].reduce((a, r) => a + archiveBytes(r), 0),
      sleepSec: this.sleepSec,
      restSec: this.restSec,
      restored: this.restored,
      woken: this.woken
    };
  }
}

/* F-265: толпа возвращается из байтовой сводки — пешеход оказывается на той же стороне. */
export function restoreCrowd(map, idx, pack, rec) {
  if (!map.crowdAt) return null;
  const crowd = map.crowdAt(idx);
  if (!crowd || !crowd.side) return crowd;
  const n = Math.min(crowd.side.length, rec.n || 0);
  for (let i = 0; i < n; i++) {
    if (rec.sides) crowd.side[i] = rec.sides[i];
    if (rec.waiting) crowd.waiting[i] = rec.waiting[i];
    if (rec.nextCross) crowd.nextCross[i] = rec.nextCross[i];
  }
  if (rec.crossed) crowd.crossed = rec.crossed;
  return crowd;
}
