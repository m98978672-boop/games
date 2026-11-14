/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — пакет мешей: 1000 процедурных моделей
   -----------------------------------------------------------------------------
   Здесь НЕ 1000 нарисованных вручную объектов, а 10 семейств × 10 архетипов ×
   10 вариантов = 1000 РАЗНЫХ мешей. Каждый строится по контуру (выдавливание,
   лофт, тело вращения — как всё в проекте), поэтому силуэты остаются «своими»,
   а не набором кубов.

   Вариант меняет не только цвет: пропорции, число рёбер/полос/лома, наклон,
   толщину и мелкие детали. Поэтому ящик №3 и ящик №7 — разные модели, а не
   один меш с другим материалом.

   Использование:
     SH2.meshpack.COUNT                   // 1000
     SH2.meshpack.describe(i)             // {id, family, title, variant, ...}
     SH2.meshpack.build(i)                // THREE.Group — новый меш
     SH2.meshpack.pick(family, rng)       // детерминированный выбор по карте
     SH2.meshpack.families                // список семейств
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});
  const THREE = () => root.THREE;
  const TAU = Math.PI * 2;

  /* ------------------------------ ДПСЧ ------------------------------------
     Свой детерминированный генератор: один и тот же индекс всегда даёт один
     и тот же меш. Иначе карта «пересобиралась» бы при каждом запуске. */
  function rngFor(seed) {
    let s = (seed * 2654435761) >>> 0 || 1;
    return () => {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }

  const pick = (rng, list) => list[Math.floor(rng() * list.length) % list.length];
  const lerp = (a, b, t) => a + (b - a) * t;

  /* --------------------------- помощники контуров -------------------------
     ВАЖНО про систему координат проекта: контур для outlineMesh задаётся
     плоскостью (z, y), а выдавливание идёт по X — то есть толщина в модели
     это X, а «лицом» деталь смотрит вдоль Z. Поэтому:
       • outlineMesh([[z,y],...], { depth })           — деталь «в профиль»;
       • в модели ставим её на место поворотом rotateY(PI/2) вокруг Y, если
         нужна толщина по X (так делают стволы в gunblueprints).
     revolve(pts) ждёт [[y, r], ...] СНИЗУ ВВЕРХ, а не радиус-первым.
     loftSections ждёт [{ at:[x,y,z], pts:[[x,z],...] }] — сечения в
     горизонтальной плоскости с ОДИНАКОВЫМ числом точек. */

  /* Кольцо для loftSections: суперэллипс (p=0.6) даёт почти прямоугольное
     сечение со скруглёнными углами — так делаются тросы, ящики, мешки. */
  function ring(rx, rz, n, p) {
    const m = n || 10;
    const pw = p === undefined ? 0.6 : p;
    const out = [];
    for (let i = 0; i < m; i++) {
      const a = (i / m) * TAU;
      const ca = Math.cos(a), sa = Math.sin(a);
      out.push([
        Math.sign(ca) * Math.pow(Math.abs(ca), pw) * rx,
        Math.sign(sa) * Math.pow(Math.abs(sa), pw) * rz
      ]);
    }
    return out;
  }

  /* --------------------------- материалы --------------------------------- */
  const PALETTES = {
    crate: [0x8a6a3c, 0x6f5836, 0x9a7b46, 0x5f5a4a, 0x7d6440],
    barrel: [0x5f6b52, 0x6b4a3a, 0x4a5560, 0x7a6a3a, 0x585858],
    rock: [0x7a7568, 0x6a6558, 0x8a8272, 0x5f5b52, 0x8c8478],
    bag: [0x9a8f6a, 0x8a7f5a, 0x7f7452, 0xa89a74, 0x6f6648],
    fence: [0x8a8f94, 0x6f7479, 0x9aa0a6, 0x5f6469, 0x7d8288],
    lamp: [0x3f464d, 0x4a5158, 0x353b41, 0x555c63, 0x2f353a],
    tower: [0x6b6154, 0x7a6f60, 0x5c5347, 0x8a7f6d, 0x4e4a42],
    vehicle: [0x4d5a48, 0x5a4d3f, 0x44505a, 0x6a5f4a, 0x3f4640],
    plant: [0x4a6a42, 0x557a48, 0x3f5c3a, 0x62854e, 0x476b4b],
    scrap: [0x6a5a4a, 0x7a6a52, 0x5a4f44, 0x8a7a5f, 0x4f4740]
  };

  /* ------------------------------ СЕМЕЙСТВА ------------------------------
     Каждое семейство получает (rng, v) где v = 0..9 — номер варианта.
     Возвращает { parts: [{ geo, color, pos, rot }], radius }.
     Все размеры в метрах, деталь стоит на земле (y=0 — основание).
     Оси: X — толщина для outlineMesh-деталей, Z — «лицо»; revolve — [[y, r]]. */
  const FAMILIES = [
    /* ------------------------------- 1. ящик ---------------------------- */
    {
      key: 'crate',
      title: 'ящик',
      make(rng, v) {
        const T = THREE();
        const O = SH2.outline;
        const parts = [];
        const w = lerp(0.70, 1.25, rng()) * lerp(0.92, 1.10, v / 9);   // по X (толщина)
        const h = lerp(0.52, 0.95, rng()) * lerp(0.95, 1.08, v / 9);
        const d = w * lerp(0.82, 1.18, rng());                          // по Z
        const color = PALETTES.crate[v % PALETTES.crate.length];
        /* корпус: профиль (z,y), выдавленный на w по X */
        parts.push({
          geo: O.outlineMesh([[-d / 2, 0], [d / 2, 0], [d / 2, h * 0.9], [d * 0.34, h], [-d * 0.34, h], [-d / 2, h * 0.9]],
            { depth: w, bevel: 0.014 }),
          color, pos: [0, 0, 0], rot: [0, 0, 0]
        });
        /* рёбра вдоль высоты — полосами по Z на обеих щеках */
        const ribs = 2 + Math.floor(rng() * 4);
        for (let i = 0; i < ribs; i++) {
          const z = -d / 2 + (d * (i + 1)) / (ribs + 1);
          parts.push({
            geo: O.outlineMesh([[-0.035, 0.03], [0.035, 0.03], [0.035, h * 0.92], [-0.035, h * 0.92]],
              { depth: w * 1.03, bevel: 0.006 }),
            color: 0x4a4034, pos: [0, 0, z], rot: [0, 0, 0]
          });
        }
        /* стяжные ленты: кольцо вокруг ящика по высоте (профиль = полоса
           во всю глубину, толщина по Y — иначе получается вертикальная
           пластина, торчащая из ящика) */
        const belts = 1 + Math.floor(rng() * 3);
        for (let i = 0; i < belts; i++) {
          const y = lerp(0.12, h * 0.78, (i + 1) / (belts + 1));
          parts.push({
            geo: O.outlineMesh([[-d / 2 - 0.014, -0.035], [d / 2 + 0.014, -0.035],
              [d / 2 + 0.014, 0.035], [-d / 2 - 0.014, 0.035]], { depth: w * 1.05, bevel: 0.005 }),
            color: 0x3b332a, pos: [0, y, 0], rot: [0, 0, 0]
          });
        }
        /* трафарет на лицевой щеке */
        if (v % 3 === 0) {
          parts.push({
            geo: new T.PlaneGeometry(d * 0.36, h * 0.17),
            color: 0xd8c89a, pos: [w / 2 + 0.008, h * 0.6, 0], rot: [0, Math.PI / 2, 0]
          });
        }
        /* угловые накладки на крышке */
        if (v % 4 === 1) {
          for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
            parts.push({
              geo: O.outlineMesh([[-0.06, -0.06], [0.06, -0.06], [0.06, 0.06], [-0.06, 0.06]], { depth: 0.03, bevel: 0.004 }),
              color: 0x59503f, pos: [sx * w * 0.42, h + 0.02, sz * d * 0.42], rot: [0, 0, 0]
            });
          }
        }
        return { parts, radius: Math.max(w, d) * 0.62 };
      }
    },
    /* ------------------------------ 2. бочка ---------------------------- */
    {
      key: 'barrel',
      title: 'бочка',
      make(rng, v) {
        const O = SH2.outline;
        const parts = [];
        const r = lerp(0.24, 0.35, rng());
        const h = lerp(0.80, 1.05, rng());
        const color = PALETTES.barrel[v % PALETTES.barrel.length];
        const belly = lerp(1.02, 1.12, rng());
        /* профиль бочки: [[y, r]] снизу вверх, пузо в середине */
        const prof = [[0, r * 0.9]];
        const rings = 5 + (v % 4);
        for (let i = 1; i <= rings; i++) {
          const t = i / rings;
          const k = 1 + Math.sin(Math.PI * t) * (belly - 1);
          prof.push([h * t, r * k * (t > 0.93 ? 0.96 : 1)]);
        }
        prof.push([h, r * 0.92]);
        /* 22–30 сегментов вместо 14–20: на близкой дистанции силуэт
           перестаёт быть «гранёным ведром», оставаясь мешем */
        parts.push({ geo: O.revolve(prof, { segments: 22 + (v % 4) * 3 }), color, pos: [0, 0, 0], rot: [0, 0, 0] });
        /* обручи: радиус берём по профилю в этой высоте, иначе кольцо
           проваливается в «пузо» и рисуется чёрными обрывками */
        const rAt = (y) => {
          const t = y / h, k = 1 + Math.sin(Math.PI * Math.min(1, Math.max(0, t))) * (belly - 1);
          return r * k * (t > 0.93 ? 0.96 : 1);
        };
        const hoops = 2 + (v % 3);
        for (let i = 0; i < hoops; i++) {
          const y = lerp(0.10, h - 0.14, (i + 1) / (hoops + 1));
          const rr = rAt(y) * 1.03 + 0.004;
          parts.push({
            geo: O.revolve([[y, rr], [y + 0.055, rr]], { segments: 24 }),
            color: 0x35383a, pos: [0, 0, 0], rot: [0, 0, 0]
          });
        }
        /* горловина и крышка */
        const neck = [[h, r * 0.34], [h + 0.06, r * 0.34], [h + 0.08, r * 0.22]];
        parts.push({ geo: O.revolve(neck, { segments: 12 }), color: 0x3a3a3a, pos: [0, 0, 0], rot: [0, 0, 0] });
        /* этикетка-трафарет */
        if (v % 2 === 1) {
          parts.push({
            geo: new (THREE().PlaneGeometry)(r * 1.1, h * 0.26),
            color: 0xc9b27a, pos: [0, h * 0.55, r * 1.02], rot: [0, 0, 0]
          });
        }
        return { parts, radius: r * 1.15 };
      }
    },
    /* ------------------------------- 3. камень -------------------------- */
    {
      key: 'rock',
      title: 'камень',
      make(rng, v) {
        const T = THREE();
        const O = SH2.outline;
        const parts = [];
        const s = lerp(0.55, 1.15, rng()) * lerp(0.85, 1.1, v / 9);
        const color = PALETTES.rock[v % PALETTES.rock.length];
        /* валун: несколько сжатых сфер со смещением — так силуэт «рваный»,
           но поверхность остаётся гладкой, без «пузырей» из плоских граней */
        const core = new T.SphereGeometry(s, 16 + (v % 5), 12 + (v % 4));
        const pos = core.attributes.position;
        const ph = rng() * 6;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
          /* три частоты: крупные грани, средние сколы, мелкая шерсть */
          const k = 1
            + Math.sin(x * 2.3 + ph) * Math.cos(z * 2.1 - ph) * 0.13
            + Math.sin(x * 4.7 - v) * Math.sin(z * 5.3 + v) * 0.06
            + Math.cos(y * 7.1 + ph) * 0.03;
          /* низ шире верха: валун сидит в земле, а не висит шаром */
          const widen = 1 + Math.max(0, -y / s) * 0.28;
          pos.setXYZ(i, x * k * widen, y * k * 0.66, z * k * widen);
        }
        core.computeVertexNormals();
        parts.push({ geo: core, color, pos: [0, s * 0.6, 0], rot: [0, rng() * TAU, 0] });
        /* сколы и обломки у основания */
        const chips = 1 + Math.floor(rng() * 3);
        for (let i = 0; i < chips; i++) {
          const cs = s * lerp(0.14, 0.3, rng());
          const a = rng() * TAU, rr = s * lerp(0.85, 1.25, rng());
          const chip = new T.SphereGeometry(cs, 6, 5);
          const cp = chip.attributes.position;
          for (let k = 0; k < cp.count; k++) cp.setY(k, cp.getY(k) * 0.55);
          chip.computeVertexNormals();
          parts.push({
            geo: chip, color, pos: [Math.cos(a) * rr, cs * 0.4, Math.sin(a) * rr],
            rot: [0, rng() * TAU, 0]
          });
        }
        return { parts, radius: s * 1.1 };
      }
    },
    /* -------------------------------- 4. мешок -------------------------- */
    {
      key: 'bag',
      title: 'мешок',
      make(rng, v) {
        const O = SH2.outline;
        const parts = [];
        const L = lerp(0.55, 0.85, rng());
        const W = lerp(0.26, 0.4, rng());
        const H = lerp(0.17, 0.3, rng()) * lerp(0.9, 1.15, v / 9);
        const color = PALETTES.bag[v % PALETTES.bag.length];
        /* подушка: сплюснутая сфера с «прищипнутыми» концами вдоль X и
           проседанием сверху — так лежит мешок с песком, а не «кабачок». */
        const seg = 12 + (v % 3), ring2 = 8;
        const g2 = new (THREE().SphereGeometry)(1, seg, ring2);
        const p2 = g2.attributes.position;
        for (let i = 0; i < p2.count; i++) {
          const x = p2.getX(i), y = p2.getY(i), z = p2.getZ(i);
          /* сжать концы: |x| -> 1 даёт «хвост» */
          const tail = 1 - Math.pow(Math.abs(x), 3) * 0.12;
          const dent = 1 - Math.max(0, y) * 0.22;          // сверху примято
          p2.setXYZ(i, x * L * 0.5 * tail, y * H * dent, z * W * tail);
        }
        g2.computeVertexNormals();
        parts.push({ geo: g2, color, pos: [0, H * 0.95, 0], rot: [0, rng() * 0.3, 0] });
        /* стяжки на концах */
        for (const sz of [-1, 1]) {
          parts.push({
            geo: O.revolve([[0, W * 0.16], [0.05, W * 0.16]], { segments: 10 }),
            color: 0x4e463a, pos: [0, H * 0.9, sz * L * 0.47], rot: [Math.PI / 2, 0, 0]
          });
        }
        /* шов сверху */
        if (v % 3 === 0) {
          parts.push({
            geo: O.outlineMesh([[-L * 0.42, -0.02], [L * 0.42, -0.02], [L * 0.42, 0.02], [-L * 0.42, 0.02]], { depth: 0.035, bevel: 0.004 }),
            color: 0x5a5142, pos: [0, H * 1.42, 0], rot: [0, Math.PI / 2, 0]
          });
        }
        return { parts, radius: L * 0.58 };
      }
    },
    /* -------------------------------- 5. забор -------------------------- */
    {
      key: 'fence',
      title: 'ограда',
      make(rng, v) {
        const T = THREE();
        const O = SH2.outline;
        const parts = [];
        const L = lerp(1.9, 3.0, rng());
        const H = lerp(0.9, 1.5, rng());
        const color = PALETTES.fence[v % PALETTES.fence.length];
        const posts = 2 + (v % 3);
        for (let i = 0; i < posts; i++) {
          const z = lerp(-L / 2, L / 2, posts === 1 ? 0.5 : i / (posts - 1));
          parts.push({
            geo: O.revolve([[0, 0.045], [H, 0.045]], { segments: 8 }),
            color: 0x53565a, pos: [0, 0, z], rot: [0, 0, 0]
          });
        }
        /* перекладины: профиль (z,y) с толщиной по X */
        const rails = 2 + (v % 2);
        for (let i = 0; i < rails; i++) {
          const y = lerp(H * 0.22, H * 0.88, rails === 1 ? 0.5 : i / (rails - 1));
          parts.push({
            geo: O.outlineMesh([[-L / 2, -0.028], [L / 2, -0.028], [L / 2, 0.028], [-L / 2, 0.028]], { depth: 0.03, bevel: 0.005 }),
            color, pos: [0, y, 0], rot: [0, 0, 0]
          });
        }
        /* сетка из прутьев */
        if (v % 3 === 0) {
          const bars = 6 + Math.floor(rng() * 6);
          for (let i = 0; i < bars; i++) {
            const z = lerp(-L / 2 + 0.08, L / 2 - 0.08, i / (bars - 1));
            parts.push({
              geo: O.revolve([[0, 0.009], [H * 0.92, 0.009]], { segments: 5 }),
              color: 0x6a6f74, pos: [0, 0.03, z], rot: [0, 0, 0]
            });
          }
        }
        /* колючка/козырек */
        if (v % 4 === 2) {
          parts.push({
            geo: new T.BoxGeometry(0.02, 0.02, L * 1.02),
            color: 0x8a8f94, pos: [0, H + 0.06, 0], rot: [0, 0, 0]
          });
        }
        return { parts, radius: L * 0.55 };
      }
    },
    /* -------------------------------- 6. фонарь ------------------------- */
    {
      key: 'lamp',
      title: 'фонарь',
      make(rng, v) {
        const T = THREE();
        const O = SH2.outline;
        const parts = [];
        const H = lerp(3.0, 5.0, rng());
        const color = PALETTES.lamp[v % PALETTES.lamp.length];
        /* столб */
        parts.push({ geo: O.revolve([[0, 0.12], [0.22, 0.09], [H, 0.055]], { segments: 10 }),
          color, pos: [0, 0, 0], rot: [0, 0, 0] });
        parts.push({ geo: O.revolve([[0, 0.19], [0.12, 0.17], [0.16, 0.10]], { segments: 12 }),
          color: 0x3a3f44, pos: [0, 0, 0], rot: [0, 0, 0] });
        /* кронштейн: профиль (z,y) — консоль выходит вдоль Z */
        const arm = lerp(0.5, 1.05, rng());
        parts.push({
          geo: O.outlineMesh([[0, 0.05], [arm, 0.05], [arm, -0.01], [0, -0.06]], { depth: 0.07, bevel: 0.008 }),
          color, pos: [0, H - 0.12, 0], rot: [0, Math.PI / 2, 0]
        });
        /* плафон на конце консоли */
        if (v % 4 === 0) {
          parts.push({
            geo: O.outlineMesh([[-0.2, 0], [0.2, 0], [0.16, 0.11], [-0.16, 0.11]], { depth: 0.22, bevel: 0.012 }),
            color: 0x2f3438, pos: [0, H - 0.30, arm], rot: [0, 0, 0]
          });
        } else {
          parts.push({ geo: O.revolve([[0, 0.2], [0.06, 0.19], [0.17, 0.12], [0.14, 0.02]], { segments: 12 }),
            color: 0x2f3438, pos: [0, H - 0.30, arm], rot: [0, 0, 0] });
        }
        parts.push({ geo: new T.SphereGeometry(0.085, 8, 6), color: 0xffe6a8, pos: [0, H - 0.28, arm], rot: [0, 0, 0] });
        /* ящик с электрикой на столбе */
        if (v % 3 === 1) {
          parts.push({
            geo: O.outlineMesh([[-0.13, 0], [0.13, 0], [0.13, 0.28], [-0.13, 0.28]], { depth: 0.16, bevel: 0.012 }),
            color: 0x4a5057, pos: [0, 1.05, 0.13], rot: [0, 0, 0]
          });
        }
        return { parts, radius: 0.55 };
      }
    },
    /* -------------------------------- 7. вышка -------------------------- */
    {
      key: 'tower',
      title: 'вышка',
      make(rng, v) {
        const T = THREE();
        const O = SH2.outline;
        const parts = [];
        const H = lerp(1.9, 3.2, rng());
        const S = lerp(1.0, 1.7, rng());
        const color = PALETTES.tower[v % PALETTES.tower.length];
        for (let i = 0; i < 4; i++) {
          const sx = i % 2 === 0 ? -1 : 1;
          const sz = i < 2 ? -1 : 1;
          parts.push({
            geo: O.revolve([[0, 0.065], [H, 0.045]], { segments: 6 }),
            color, pos: [sx * S / 2, 0, sz * S / 2], rot: [sz * 0.045, 0, -sx * 0.045]
          });
        }
        /* раскосы: 4 грани, перекладины строго между стойками (без вылета
           за габарит — иначе вышка «обросла» палками) */
        const braces = 2 + (v % 3);
        for (let i = 0; i < braces; i++) {
          const y = lerp(0.4, H - 0.3, (i + 1) / (braces + 1));
          for (const side of [-1, 1]) {
            /* грани вдоль X и вдоль Z */
            parts.push({
              geo: O.outlineMesh([[-S / 2, -0.028], [S / 2, -0.028], [S / 2, 0.028], [-S / 2, 0.028]], { depth: 0.045, bevel: 0.005 }),
              color: 0x5c5347, pos: [0, y, side * (S / 2 - 0.01)], rot: [0, 0, 0]
            });
            parts.push({
              geo: O.outlineMesh([[-S / 2, -0.028], [S / 2, -0.028], [S / 2, 0.028], [-S / 2, 0.028]], { depth: 0.045, bevel: 0.005 }),
              color: 0x5c5347, pos: [side * (S / 2 - 0.01), y, 0], rot: [0, Math.PI / 2, 0]
            });
          }
        }
        /* площадка: настил лежит, поэтому профиль — тонкая полоса по Z,
           а ширина по X задаётся выдавливанием (раньше здесь стояла
           вертикальная плита во весь размер) */
        parts.push({
          geo: O.outlineMesh([[-S / 2, -0.05], [S / 2, -0.05], [S / 2, 0.05], [-S / 2, 0.05]],
            { depth: S + 0.24, bevel: 0.012 }),
          color: 0x6f6455, pos: [0, H, 0], rot: [0, 0, 0]
        });
        /* перила */
        const rails = 4 + (v % 3);
        for (let i = 0; i < rails; i++) {
          const a = (i / rails) * TAU;
          parts.push({
            geo: O.revolve([[0, 0.038], [0.8, 0.038]], { segments: 5 }),
            color: 0x4e4a42, pos: [Math.cos(a) * S * 0.5, H, Math.sin(a) * S * 0.5], rot: [0, 0, 0]
          });
        }
        /* крыша: шатёр на четырёх стойках над площадкой */
        if (v % 2 === 0) {
          const rh = S * 0.42;
          for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
            parts.push({
              geo: O.revolve([[0, 0.03], [rh, 0.028]], { segments: 5 }),
              color: 0x4e4a42, pos: [sx * S * 0.46, H, sz * S * 0.46], rot: [0, 0, 0]
            });
          }
          /* шатёр — тело вращения, поэтому крутить его можно ТОЛЬКО вокруг
             своей оси Y: поворот вокруг X утаскивает конус в сторону */
          parts.push({
            geo: O.revolve([[H + rh, S * 0.66], [H + rh + 0.06, S * 0.62], [H + rh + 0.30, 0.03]], { segments: 4 }),
            color: 0x5a5348, pos: [0, 0, 0], rot: [0, Math.PI / 4, 0]
          });
        }
        return { parts, radius: S * 0.8 };
      }
    },
    /* ------------------------------- 8. техника ------------------------- */
    {
      key: 'vehicle',
      title: 'техника',
      make(rng, v) {
        const T = THREE();
        const O = SH2.outline;
        const parts = [];
        const L = lerp(2.8, 4.2, rng());
        const W = lerp(1.5, 2.0, rng());
        const color = PALETTES.vehicle[v % PALETTES.vehicle.length];
        /* кузов: профиль (z,y) по длине, толщина W по X */
        const prof = [
          [-L / 2, 0.28], [-L / 2 + 0.16, 0.86], [-L * 0.12, 1.02],
          [L * 0.2, 0.99], [L / 2 - 0.2, 0.84], [L / 2, 0.42], [L / 2 - 0.1, 0.24]
        ];
        parts.push({
          geo: O.vehicleBody(prof, { depth: W, taper: [[-L / 2, 0.8], [-L * 0.35, 1], [L * 0.35, 1], [L / 2, 0.82]] }),
          color, pos: [0, 0.22, 0], rot: [0, 0, 0]
        });
        /* надстройка зависит от варианта */
        if (v % 3 === 0) {
          parts.push({
            geo: O.outlineMesh([[-L * 0.18, 0], [L * 0.26, 0], [L * 0.22, 0.55], [-L * 0.16, 0.55]], { depth: W * 0.92, bevel: 0.03 }),
            color: 0x3d443c, pos: [0, 1.2, 0], rot: [0, 0, 0]
          });
        } else if (v % 3 === 1) {
          parts.push({
            geo: O.outlineMesh([[-L * 0.24, 0], [L * 0.28, 0], [L * 0.28, 0.15], [-L * 0.24, 0.15]], { depth: W * 0.94, bevel: 0.05 }),
            color: 0x6b6552, pos: [0, 1.26, 0], rot: [0, 0, 0]
          });
        }
        /* колёса: тело вращения вокруг X */
        for (let i = 0; i < 4; i++) {
          const sx = i < 2 ? -1 : 1;
          const sz = i % 2 === 0 ? -1 : 1;
          parts.push({
            geo: O.revolve([[-0.13, 0.3], [-0.06, 0.34], [0.06, 0.34], [0.13, 0.3]], { segments: 12 }),
            color: 0x1f2225, pos: [sx * W * 0.5, 0.34, sz * L * 0.3], rot: [0, 0, Math.PI / 2]
          });
        }
        /* сбитая башня рядом */
        if (v % 4 === 3) {
          parts.push({
            geo: O.outlineMesh([[-0.45, 0], [0.45, 0], [0.34, 0.3], [-0.34, 0.3]], { depth: 0.68, bevel: 0.03 }),
            color, pos: [W * 0.62, 0.06, L * 0.5], rot: [0, rng() * TAU, 0.08]
          });
        }
        return { parts, radius: L * 0.6 };
      }
    },
    /* ------------------------------- 9. растение ------------------------ */
    {
      key: 'plant',
      title: 'растение',
      make(rng, v) {
        const O = SH2.outline;
        const parts = [];
        const h = lerp(0.7, 2.0, rng());
        const color = PALETTES.plant[v % PALETTES.plant.length];
        parts.push({ geo: O.revolve([[0, 0.07], [h * 0.55, 0.05], [h, 0.022]], { segments: 6 }),
          color: 0x4a4436, pos: [0, 0, 0], rot: [0, 0, 0] });
        const leaves = 4 + Math.floor(rng() * 7);
        for (let i = 0; i < leaves; i++) {
          const a = rng() * TAU;
          const y = lerp(h * 0.3, h, rng());
          const ls = lerp(0.16, 0.42, rng());
          /* лист — контур (z,y), выдавленный на толщину листа, затем развёрнут */
          const leaf = O.outlineMesh([[0, -0.035], [ls, 0], [ls * 0.82, 0.07], [0, 0.035]], { depth: 0.012, bevel: 0.004 });
          parts.push({ geo: leaf, color, pos: [0, y, 0], rot: [0, a, lerp(-0.5, 0.35, rng())] });
        }
        /* сухие ветки */
        if (v % 5 === 0) {
          for (let i = 0; i < 5; i++) {
            const a = (i / 5) * TAU;
            parts.push({
              geo: O.revolve([[0, 0.022], [lerp(0.4, 0.9, rng()), 0.012]], { segments: 4 }),
              color: 0x4a4034, pos: [0, h * 0.7, 0], rot: [lerp(0.3, 0.8, rng()), a, 0]
            });
          }
        }
        /* низкий куст: листва у земли */
        if (v % 4 === 2) {
          for (let i = 0; i < 5; i++) {
            const a = (i / 5) * TAU;
            const leaf = O.outlineMesh([[0, -0.04], [0.3, 0], [0.24, 0.09], [0, 0.04]], { depth: 0.015, bevel: 0.004 });
            parts.push({ geo: leaf, color, pos: [Math.cos(a) * 0.18, 0.16 + (i % 2) * 0.1, Math.sin(a) * 0.18], rot: [-0.4, a, 0.2] });
          }
        }
        return { parts, radius: 0.5 };
      },
    },
    /* -------------------------------- 10. лом --------------------------- */
    {
      key: 'scrap',
      title: 'лом',
      make(rng, v) {
        const T = THREE();
        const O = SH2.outline;
        const parts = [];
        const n = 3 + Math.floor(rng() * 5);
        const color = PALETTES.scrap[v % PALETTES.scrap.length];
        for (let i = 0; i < n; i++) {
          const kind = (i + v) % 5;
          const s = lerp(0.22, 0.65, rng());
          let geo;
          if (kind === 0) {
            /* лист металла */
            geo = O.outlineMesh([[-s, -0.04], [s, -0.04], [s * 0.8, 0.04], [-s * 0.8, 0.04]], { depth: 0.05, bevel: 0.01 });
          } else if (kind === 1) {
            /* труба, лежащая вдоль X */
            geo = O.revolve([[0, s * 0.3], [s * 1.4, s * 0.3]], { segments: 8 });
          } else if (kind === 2) {
            /* уголок */
            geo = O.outlineMesh([[0, 0], [s, 0], [s, s * 0.6], [s * 0.72, s * 0.6], [s * 0.72, s * 0.16], [0, s * 0.16]], { depth: s * 0.5, bevel: 0.015 });
          } else if (kind === 3) {
            /* гнутая балка */
            geo = O.loftSections([
              { at: [-s, 0, 0], pts: ring(s * 0.18, s * 0.12, 8, 0.7) },
              { at: [0, s * 0.18, 0], pts: ring(s * 0.24, s * 0.16, 8, 0.7) },
              { at: [s, 0, 0], pts: ring(s * 0.14, s * 0.1, 8, 0.7) }
            ]);
          } else {
            /* бочонок/канистра */
            geo = O.revolve([[0, s * 0.26], [s * 0.5, s * 0.3], [s * 0.58, s * 0.2], [s * 0.6, 0.02]], { segments: 10 });
          }
          parts.push({
            geo, color: i % 3 === 0 ? 0x6b5a45 : color,
            pos: [lerp(-0.55, 0.55, rng()), s * 0.22, lerp(-0.55, 0.55, rng())],
            rot: [lerp(-0.35, 0.35, rng()), rng() * TAU, kind === 1 ? Math.PI / 2 : lerp(-0.35, 0.35, rng())]
          });
        }
        return { parts, radius: 0.9 };
      }
    }
  ];

  const ARCHETYPES = 10;      // на семейство
  const VARIANTS = 10;        // вариантов архетипа
  const COUNT = FAMILIES.length * ARCHETYPES * VARIANTS;   // 1000

  /* ------------------------- описание шаблона ---------------------------- */
  function describe(index) {
    const i = Math.max(0, Math.min(COUNT - 1, Math.floor(index) || 0));
    const f = Math.floor(i / (ARCHETYPES * VARIANTS));
    const rest = i - f * ARCHETYPES * VARIANTS;
    const arch = Math.floor(rest / VARIANTS);
    const variant = rest % VARIANTS;
    const fam = FAMILIES[f];
    return {
      index: i,
      id: fam.key + '-' + String(arch).padStart(2, '0') + '-' + variant,
      family: fam.key,
      familyTitle: fam.title,
      archetype: arch,
      variant,
      title: fam.title + ' №' + (arch * VARIANTS + variant + 1),
      seed: i * 7919 + 13
    };
  }

  /* ------------------------------- LOD -----------------------------------
     Один и тот же меш на разной дальности. Это НЕ замена модели на спрайт:
     меш остаётся мешем (объект, матрица, материал), просто у него меньше
     треугольников в деталях:
       lod 0 — полная модель (то, что видит игрок в 10 метрах);
       lod 1 — 3 самые крупные детали (30–90 м: силуэт читается);
       lod 2 — один объём по габаритам, 6–8 граней (дальше 90 м).
     Число мешей от LOD не меняется — меняется только их «вес». */
  function geometryTris(g) {
    if (!g) return 0;
    const ix = g.getIndex ? g.getIndex() : null;
    if (ix) return ix.count / 3;
    const pa = g.getAttribute ? g.getAttribute('position') : null;
    return pa ? pa.count / 3 : 0;
  }
  function geometryVolume(g) {
    if (!g || !g.computeBoundingBox) return 0;
    g.computeBoundingBox();
    const b = g.boundingBox;
    if (!b) return 0;
    return (b.max.x - b.min.x) * (b.max.y - b.min.y) * (b.max.z - b.min.z);
  }
  /* Объём по габаритам: призма с сужением кверху — самый дешёвый силуэт,
     который ещё похож на предмет (ящик остаётся ящиком, бочка бочкой). */
  function hullFor(parts, lod) {
    const T = THREE();
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9, minZ = 1e9, maxZ = -1e9;
    let color = 0x808080;
    let bestV = -1;
    parts.forEach((p) => {
      const g = p.geo;
      if (!g || !g.computeBoundingBox) return;
      g.computeBoundingBox();
      const b = g.boundingBox;
      const v = (b.max.x - b.min.x) * (b.max.y - b.min.y) * (b.max.z - b.min.z);
      if (v > bestV) { bestV = v; color = p.color; }
      minX = Math.min(minX, b.min.x + (p.pos ? p.pos[0] : 0));
      maxX = Math.max(maxX, b.max.x + (p.pos ? p.pos[0] : 0));
      minY = Math.min(minY, b.min.y + (p.pos ? p.pos[1] : 0));
      maxY = Math.max(maxY, b.max.y + (p.pos ? p.pos[1] : 0));
      minZ = Math.min(minZ, b.min.z + (p.pos ? p.pos[2] : 0));
      maxZ = Math.max(maxZ, b.max.z + (p.pos ? p.pos[2] : 0));
    });
    if (!isFinite(minX)) return [{ geo: new T.BoxGeometry(0.6, 0.6, 0.6), color: 0x808080, pos: [0, 0.3, 0], rot: [0, 0, 0] }];
    const w = Math.max(0.12, maxX - minX), h = Math.max(0.12, maxY - minY), d = Math.max(0.12, maxZ - minZ);
    /* Число граней — параметр LOD: 8 для середины (силуэт узнаваем),
       4 для горизонта (это уже почти силуэт-«конверт», но меш мешем). */
    const sides = lod === 2 ? 4 : 8;
    const geo = new T.CylinderGeometry(w * (sides === 4 ? 0.34 : 0.36), w * 0.46, h, sides, 1, false);
    geo.scale(1, 1, Math.max(0.4, d / w));
    return [{ geo, color, pos: [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2], rot: [0, 0, 0] }];
  }

  /* ------------------------- построение меша ----------------------------- */
  function build(index, opts) {
    const T = THREE();
    if (!T) throw new Error('meshpack: нет three.js');
    const o = opts || {};
    const lod = o.lod || 0;
    const d = describe(index);
    const rng = rngFor(d.seed);
    const fam = FAMILIES[Math.floor(d.index / (ARCHETYPES * VARIANTS))];
    const made = fam.make(rng, d.variant);
    /* LOD: выбираем самые «весомые» по объёму детали. Отбрасываем сначала
       мелочь (маркировку, прутья), потом средние (перекладины, колёса). */
    if (lod >= 2) made.parts = hullFor(made.parts, lod);
    else if (lod === 1) made.parts = hullFor(made.parts, 1);
    const group = new T.Group();
    group.name = 'mesh:' + d.id;
    const O = SH2.outline;
    made.parts.forEach((p, k) => {
      if (!p.geo) return;
      const mat = SH2.model && SH2.model.mat
        ? SH2.model.mat(p.color, { flat: k % 3 === 0 })
        : new T.MeshStandardMaterial({ color: p.color });
      const mesh = new T.Mesh(p.geo, mat);
      mesh.position.set(p.pos[0], p.pos[1], p.pos[2]);
      if (p.rot) mesh.rotation.set(p.rot[0], p.rot[1], p.rot[2]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = d.id + ':' + k;
      group.add(mesh);
    });
    group.userData = {
      index: d.index, id: d.id, family: d.family,
      radius: made.radius || 0.5, parts: made.parts.length
    };
    if (opts && opts.scale) group.scale.setScalar(opts.scale);
    return group;
  }

  /* Построить и сразу освободить геометрию: нужно проверкам, чтобы прогнать
     все 1000 шаблонов и не накопить память. */
  function probe(index) {
    const g = build(index);
    let verts = 0, tris = 0, meshes = 0;
    g.traverse((o) => {
      if (!o.isMesh) return;
      meshes++;
      const pa = o.geometry.getAttribute('position');
      if (pa) verts += pa.count;
      const ix = o.geometry.getIndex();
      tris += ix ? ix.count / 3 : (pa ? pa.count / 3 : 0);
    });
    g.traverse((o) => { if (o.isMesh && o.geometry) o.geometry.dispose(); });
    return { id: g.userData.id, meshes, verts, tris, radius: g.userData.radius };
  }

  /* Детерминированный выбор меша по семейству — для наполнения карты. */
  function pickIndex(familyKey, rng) {
    const f = FAMILIES.findIndex((x) => x.key === familyKey);
    const f0 = f < 0 ? 0 : f;
    const base = f0 * ARCHETYPES * VARIANTS;
    return base + Math.floor((rng || Math.random)() * ARCHETYPES * VARIANTS) % (ARCHETYPES * VARIANTS);
  }

  SH2.meshpack = {
    COUNT,
    TEMPLATES: COUNT,
    FAMILIES: FAMILIES.map((f) => f.key),
    families: FAMILIES.map((f) => ({ key: f.key, title: f.title })),
    describe,
    build,
    probe,
    pickIndex,
    rngFor,
    geometryTris,
    hullFor
  };
})(typeof window !== 'undefined' ? window : globalThis);
