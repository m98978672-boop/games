/* §83: телефон и авто-масштаб (R-83.1…R-83.5, F-279…F-286).
   На телефоне виджет с фиксированным масштабом бесполезен: экран в четыре раза уже,
   и «город» с 60 px/км туда не влезает. Поэтому масштаб считается из кадра, а не
   задаётся числом: chose режим (страна / область / город) — и карта подбирает px/км
   так, чтобы нужный кусок мира целиком влез в экран с полями. Повернул телефон —
   кадр пересчитался, а не обрезался. */
export const FIT = {
  padPx: 26,                 // поля по краям экрана, px
  minScale: 0.04,            // дальше мир — точка
  maxScale: 260,             // ближе уже некуда: дома крупнее пикселя
  phoneWidth: 820,           // шире этого — не телефон
  phonePadPx: 16,            // на телефоне поля меньше: и без того тесно
  minTouchPx: 40,            // F-284: палец, а не курсор
  modes: {
    country: { km: 7000, name: 'страна' },
    region: { km: 900, name: 'область' },
    city: { km: 12, name: 'город' }      // кольцо города и ближние кварталы
  }
};

/* F-279: масштаб, при котором участок spanKm влезает в кадр целиком. */
export function fitScale(view, spanKm, padPx = FIT.padPx) {
  const w = Math.max(1, (view && view.w) || 1);
  const h = Math.max(1, (view && view.h) || 1);
  const span = Math.max(1, spanKm || 1);
  const usable = Math.max(1, Math.min(w, h) - padPx * 2);
  return clampScale(usable / span);
}

/* F-280: обратная задача — сколько километров влезает в кадр при таком масштабе
   (по короткой стороне и с теми же полями, что в fitScale). */
export function spanKmAt(scale, view, padPx = FIT.padPx) {
  const w = Math.max(1, (view && view.w) || 1);
  const h = Math.max(1, (view && view.h) || 1);
  const usable = Math.max(1, Math.min(w, h) - padPx * 2);
  return usable / Math.max(FIT.minScale, scale || FIT.minScale);
}

export function clampScale(s) {
  if (!Number.isFinite(s)) return FIT.modes.region.km ? 1 : 1;
  return Math.min(FIT.maxScale, Math.max(FIT.minScale, s));
}

/* F-281: режим по масштабу — «страна», если видно больше 1800 км, и т. д. */
export function chooseMode(scale, view = null) {
  const s = Math.max(FIT.minScale, scale || FIT.minScale);
  const span = view ? spanKmAt(s, view) : FIT.modes.country.km;
  if (span > 2400) return 'country';
  if (span > 120) return 'region';
  return 'city';
}

/* F-282: масштаб для режима, с учётом телефона (поля меньше). */
export function autoScale(view, mode = 'region', phone = false) {
  const m = FIT.modes[mode] || FIT.modes.region;
  const pad = phone ? FIT.phonePadPx : FIT.padPx;
  return fitScale(view, m.km, pad);
}

/* F-283: телефон ли это — по кадру, а не по строке браузера. Боком телефон шире
   820 px, но узкая сторона всё равно выдаёт его с головой. */
export function isPhone(width, height = 0) {
  const w = width || 0;
  if (!w) return false;
  if (w <= FIT.phoneWidth) return true;
  return height > 0 && height <= 480 && w <= 1000;
}

/* F-284: размеры под палец: кнопка не меньше 40 px, поле ввода не мельче. */
export function touchSize(px = FIT.minTouchPx) {
  return Math.max(FIT.minTouchPx, Math.round(px));
}

/* F-285: раскладка реек для кадра. Возвращает, где что стоит, чтобы панели не наезжали:
   на телефоне карта сверху, HUD и легенда — снизу в одну строку. */
export function layoutFor(width, height) {
  const phone = isPhone(width, height);
  if (!phone) {
    return { phone: false, mapPx: { w: width, h: height }, rails: 'sides',
      hudMaxVh: 62, rightMaxVh: 100, overlap: false };
  }
  const portrait = height >= width;
  return {
    phone: true,
    mapPx: { w: width, h: height },
    rails: portrait ? 'bottom+top' : 'bottom+right',
    hudMaxVh: portrait ? 46 : 52,
    rightMaxVh: portrait ? 34 : 44,
    // сумма высот реек заведомо меньше кадра — наезжать нечему
    overlap: false
  };
}

/* F-286: куда смотреть при старте на телефоне: в центр страны, а не в пустой океан. */
export function startCenter(towns = [], mode = 'country') {
  if (!towns.length) return { x: 0, y: 0 };
  if (mode === 'country') {
    let x = 0, y = 0;
    for (const t of towns) { x += t.x; y += t.y; }
    return { x: x / towns.length, y: y / towns.length };
  }
  const capital = towns.reduce((best, t) => ((t.pop || 0) > (best.pop || 0) ? t : best), towns[0]);
  return { x: capital.x, y: capital.y };
}
