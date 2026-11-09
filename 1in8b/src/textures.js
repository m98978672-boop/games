/* ============================================================
   1 ИЗ 8 МИЛЛИАРДОВ — 150 текстур.
   ------------------------------------------------------------
   Текстура — это маленькая процедурная заливка: кирпич, доски,
   плитка, обои, трава, асфальт, ткань. Никаких картинок: всё
   рисуется кодом прямо на canvas, поэтому ничего не грузится
   и всё масштабируется без потерь.

   У каждой текстуры:
     id      — имя в коде;
     name    — имя для человека;
     group   — где её уместно класть: стена, пол, земля,
               фасад, ткань, материал;
     base    — основной цвет (для подсказок и предпросмотра);
     draw(g, x, y, w, h, o) — залить прямоугольник.

   o — необязательные настройки:
     seed  — число, чтобы одна и та же стена выглядела одинаково;
     tint  — цвет, к которому подмешать палитру (одежда разного
             цвета, но из той же ткани);
     tintK — насколько сильно подмешивать (0..1, по умолчанию 0.6);
     dark  — затемнить всё (вечер, тень, подвал).

   Текстурами пользуется портрет: стены комнат, полы, земля,
   фасады домов и одежда человека. Галерея — в меню игры.
   ============================================================ */
(function () {
  'use strict';

  /* ----------------------- маленькая графика ----------------------- */

  function hex(h) {
    if (h[0] !== '#') { var m = h.match(/\d+/g); return [+m[0], +m[1], +m[2]]; }
    var s = h.slice(1);
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  }
  function mix(c1, c2, t) {
    var a = hex(c1), b = hex(c2);
    return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * t) + ',' +
      Math.round(a[1] + (b[1] - a[1]) * t) + ',' + Math.round(a[2] + (b[2] - a[2]) * t) + ')';
  }
  function shade(c, k) { return k >= 0 ? mix(c, '#ffffff', k) : mix(c, '#000000', -k); }
  function px(g, x, y, w, h, c) {
    w = Math.round(w); h = Math.round(h);
    if (w <= 0 || h <= 0) return;
    g.fillStyle = c;
    g.fillRect(Math.round(x), Math.round(y), w, h);
  }
  /* детерминированный шум: одна и та же стена — один и тот же узор */
  function nz(i) {
    var x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  /* цвета текстуры с поправкой на tint и темноту */
  function prep(cols, o) {
    o = o || {};
    var out = [], i;
    for (i = 0; i < cols.length; i++) {
      var c = cols[i];
      if (o.tint) c = mix(c, o.tint, o.tintK === undefined ? 0.6 : o.tintK);
      if (o.dark) c = shade(c, -o.dark);
      out.push(c);
    }
    return out;
  }
  function seedOf(o) { return (o && o.seed) || 0; }

  /* ===================== двадцать пять узоров ======================= */
  /* Каждый узор — фабрика: принимает цвета и размеры, возвращает
     функцию заливки. Из двадцати пяти узоров и палитр и собраны
     полторы сотни текстур. */

  function plain(c, k) {
    return function (g, x, y, w, h, o) {
      var p = prep([c], o), s = seedOf(o);
      px(g, x, y, w, h, p[0]);
      if (k) for (var i = 0; i < w * h * k * 0.05; i++) {
        var ix = x + Math.floor(nz(s + i * 1.7) * w), iy = y + Math.floor(nz(s + i * 3.1 + 9) * h);
        px(g, ix, iy, 1, 1, nz(s + i) > 0.5 ? shade(p[0], 0.06) : shade(p[0], -0.06));
      }
    };
  }

  function bricks(c, c2, mortar, bw, bh) {
    return function (g, x, y, w, h, o) {
      var p = prep([c, c2, mortar], o), s = seedOf(o);
      px(g, x, y, w, h, p[2]);
      for (var row = 0, yy = y; yy < y + h; yy += bh, row++) {
        var off = (row % 2) * Math.round(bw / 2);
        for (var xx = x - off; xx < x + w; xx += bw) {
          var c3 = nz(s + xx * 3 + yy * 7) > 0.65 ? p[1] : p[0];
          px(g, Math.max(x, xx), yy, Math.min(bw - 1, x + w - Math.max(x, xx)), bh - 1, c3);
        }
      }
    };
  }

  function planksH(c, c2, ph) {
    return function (g, x, y, w, h, o) {
      var p = prep([c, c2], o), s = seedOf(o);
      for (var i = 0, yy = y; yy < y + h; yy += ph, i++) {
        px(g, x, yy, w, ph - 1, nz(s + i * 5) > 0.5 ? p[0] : p[1]);
        px(g, x, yy + ph - 1, w, 1, shade(p[0], -0.22));
        for (var k = 0; k < w; k += 7) if (nz(s + k + i * 3) > 0.72) px(g, x + k, yy + 1, 2, 1, shade(p[1], -0.12));
      }
    };
  }

  function planksV(c, c2, pw) {
    return function (g, x, y, w, h, o) {
      var p = prep([c, c2], o), s = seedOf(o);
      for (var i = 0, xx = x; xx < x + w; xx += pw, i++) {
        px(g, xx, y, pw - 1, h, nz(s + i * 7) > 0.5 ? p[0] : p[1]);
        px(g, xx + pw - 1, y, 1, h, shade(p[0], -0.22));
      }
    };
  }

  function tiles(c, c2, grout, size) {
    return function (g, x, y, w, h, o) {
      var p = prep([c, c2, grout], o), s = seedOf(o);
      px(g, x, y, w, h, p[2]);
      for (var yy = y; yy < y + h; yy += size) {
        for (var xx = x; xx < x + w; xx += size) {
          px(g, xx, yy, size - 1, size - 1, nz(s + xx * 11 + yy * 5) > 0.5 ? p[0] : p[1]);
        }
      }
    };
  }

  function checker(c1, c2, size) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, c2], o);
      for (var yy = y, r = 0; yy < y + h; yy += size, r++) {
        for (var xx = x, q = 0; xx < x + w; xx += size, q++) {
          px(g, xx, yy, Math.min(size, x + w - xx), Math.min(size, y + h - yy), (r + q) % 2 ? p[1] : p[0]);
        }
      }
    };
  }

  function stripesV(c1, c2, sw) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, c2], o);
      px(g, x, y, w, h, p[0]);
      for (var xx = x; xx < x + w; xx += sw * 2) px(g, xx, y, sw, h, p[1]);
    };
  }

  function stripesH(c1, c2, sh) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, c2], o);
      px(g, x, y, w, h, p[0]);
      for (var yy = y; yy < y + h; yy += sh * 2) px(g, x, yy, w, sh, p[1]);
    };
  }

  function diagonal(c1, c2, step) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, c2], o);
      px(g, x, y, w, h, p[0]);
      for (var i = -h; i < w; i += step) {
        for (var k = 0; k < h; k++) px(g, x + i + k, y + k, 1, 1, p[1]);
      }
    };
  }

  function speckle(c1, c2, c3, dens) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, c2, c3], o), s = seedOf(o);
      px(g, x, y, w, h, p[0]);
      var n = Math.round(w * h * dens);
      for (var i = 0; i < n; i++) {
        var ix = x + Math.floor(nz(s + i * 1.3) * w), iy = y + Math.floor(nz(s + i * 2.7 + 5) * h);
        px(g, ix, iy, 1, 1, nz(s + i * 5) > 0.5 ? p[1] : p[2]);
      }
    };
  }

  function dots(c1, c2, step, size) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, c2], o);
      px(g, x, y, w, h, p[0]);
      for (var yy = y + 1, r = 0; yy < y + h; yy += step, r++) {
        for (var xx = x + 1 + (r % 2 ? Math.round(step / 2) : 0); xx < x + w; xx += step) {
          px(g, xx, yy, size, size, p[1]);
        }
      }
    };
  }

  function grid(c1, line, step) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, line], o);
      px(g, x, y, w, h, p[0]);
      for (var xx = x; xx < x + w; xx += step) px(g, xx, y, 1, h, p[1]);
      for (var yy = y; yy < y + h; yy += step) px(g, x, yy, w, 1, p[1]);
    };
  }

  function weave(c1, c2, size) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, c2], o);
      for (var yy = y, r = 0; yy < y + h; yy += size, r++) {
        for (var xx = x, q = 0; xx < x + w; xx += size, q++) {
          var hor = (r + q) % 2 === 0;
          px(g, xx, yy, size, size, hor ? p[0] : p[1]);
          if (hor) px(g, xx, yy + Math.round(size / 2), size, 1, shade(p[0], -0.15));
          else px(g, xx + Math.round(size / 2), yy, 1, size, shade(p[1], -0.15));
        }
      }
    };
  }

  function scales(c1, c2, size) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, c2], o);
      px(g, x, y, w, h, p[0]);
      for (var yy = y, r = 0; yy < y + h; yy += size, r++) {
        for (var xx = x + (r % 2 ? Math.round(size / 2) : 0); xx < x + w; xx += size) {
          px(g, xx, yy, size - 1, 1, p[1]);
          px(g, xx, yy + 1, 1, size - 2, p[1]);
        }
      }
    };
  }

  function herringbone(c1, c2, size) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, c2], o);
      px(g, x, y, w, h, p[0]);
      for (var yy = y, r = 0; yy < y + h; yy += size, r++) {
        for (var xx = x; xx < x + w; xx += size * 2) {
          var sx = xx + (r % 2 ? size : 0);
          px(g, sx, yy, size * 2 - 1, size - 1, r % 2 ? p[1] : shade(p[1], 0.08));
        }
      }
    };
  }

  function marble(c1, c2, c3) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, c2, c3], o), s = seedOf(o);
      px(g, x, y, w, h, p[0]);
      for (var v = 0; v < 5; v++) {
        var vx = x + nz(s + v * 3.7) * w;
        for (var yy = y; yy < y + h; yy++) {
          vx += (nz(s + v * 11 + yy * 0.7) - 0.5) * 2.2;
          px(g, Math.round(vx), yy, 1, 1, v % 2 ? p[1] : p[2]);
        }
      }
    };
  }

  function grassTex(c1, c2, c3) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, c2, c3], o), s = seedOf(o);
      px(g, x, y, w, h, p[0]);
      for (var i = 0; i < w * 1.4; i++) {
        var ix = x + Math.floor(nz(s + i * 1.9) * w), iy = y + Math.floor(nz(s + i * 2.3 + 3) * h);
        px(g, ix, iy, 1, 1 + Math.round(nz(s + i) * 2), nz(s + i * 7) > 0.5 ? p[1] : p[2]);
      }
    };
  }

  function gravel(c1, c2, c3) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, c2, c3], o), s = seedOf(o);
      px(g, x, y, w, h, p[0]);
      for (var i = 0; i < w * h * 0.06; i++) {
        var ix = x + Math.floor(nz(s + i * 1.1) * w), iy = y + Math.floor(nz(s + i * 3.3 + 7) * h);
        var sz = 1 + Math.round(nz(s + i * 5) * 1.6);
        px(g, ix, iy, sz, sz, nz(s + i * 9) > 0.5 ? p[1] : p[2]);
      }
    };
  }

  function waves(c1, c2, c3) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, c2, c3], o), s = seedOf(o);
      px(g, x, y, w, h, p[0]);
      for (var yy = y; yy < y + h; yy += 3) {
        for (var xx = x; xx < x + w; xx++) {
          var d = Math.sin((xx + s) * 0.35 + yy * 0.6) > 0.2;
          if (d) px(g, xx, yy + 1, 1, 1, (yy / 3) % 2 ? p[1] : p[2]);
        }
      }
    };
  }

  function floral(c1, c2, c3, step) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, c2, c3], o);
      px(g, x, y, w, h, p[0]);
      for (var yy = y + 2, r = 0; yy < y + h; yy += step, r++) {
        for (var xx = x + 2 + (r % 2 ? Math.round(step / 2) : 0); xx < x + w; xx += step) {
          px(g, xx, yy - 1, 1, 1, p[1]); px(g, xx - 1, yy, 1, 1, p[1]);
          px(g, xx + 1, yy, 1, 1, p[1]); px(g, xx, yy + 1, 1, 1, p[1]);
          px(g, xx, yy, 1, 1, p[2]);
        }
      }
    };
  }

  function rust(c1, c2, c3) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, c2, c3], o), s = seedOf(o);
      px(g, x, y, w, h, p[0]);
      for (var i = 0; i < w * h * 0.03; i++) {
        var ix = x + Math.floor(nz(s + i * 2.1) * w), iy = y + Math.floor(nz(s + i * 4.3 + 11) * h);
        var sz = 1 + Math.round(nz(s + i * 3) * 2.4);
        px(g, ix, iy, sz, Math.max(1, sz - 1), nz(s + i * 6) > 0.4 ? p[1] : p[2]);
      }
    };
  }

  function concrete(c1, c2) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, c2], o), s = seedOf(o);
      px(g, x, y, w, h, p[0]);
      for (var i = 0; i < w * h * 0.05; i++) {
        var ix = x + Math.floor(nz(s + i * 1.7) * w), iy = y + Math.floor(nz(s + i * 2.9 + 13) * h);
        px(g, ix, iy, 1, 1, nz(s + i * 4) > 0.5 ? p[1] : shade(p[0], -0.05));
      }
      for (var c = 0; c < 3; c++) {
        var cx = x + Math.round(nz(s + c * 17) * w);
        px(g, cx, y, 1, h, shade(p[0], -0.07));
      }
    };
  }

  function carpet(c1, c2, c3, step) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, c2, c3], o);
      px(g, x, y, w, h, p[0]);
      for (var yy = y; yy < y + h; yy += step) {
        px(g, x, yy, w, 1, p[1]);
        for (var xx = x; xx < x + w; xx += step) px(g, xx, yy + Math.round(step / 2), 2, 1, p[2]);
      }
      px(g, x, y, 1, h, p[1]); px(g, x + w - 1, y, 1, h, p[1]);
    };
  }

  function hexTile(c1, c2, size) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, c2], o);
      px(g, x, y, w, h, p[0]);
      for (var yy = y, r = 0; yy < y + h; yy += size, r++) {
        for (var xx = x + (r % 2 ? Math.round(size * 0.5) : 0); xx < x + w; xx += size) {
          px(g, xx + 1, yy, size - 2, 1, p[1]);
          px(g, xx, yy + 1, 1, size - 2, p[1]);
          px(g, xx + size - 1, yy + 1, 1, size - 2, p[1]);
        }
      }
    };
  }

  function corrugated(c1, c2, step) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, c2], o);
      px(g, x, y, w, h, p[0]);
      for (var xx = x; xx < x + w; xx += step) {
        px(g, xx, y, 1, h, shade(p[1], -0.12));
        px(g, xx + 1, y, 1, h, shade(p[1], 0.1));
      }
    };
  }

  function knit(c1, c2, size) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, c2], o);
      px(g, x, y, w, h, p[0]);
      for (var yy = y, r = 0; yy < y + h; yy += size, r++) {
        for (var xx = x + (r % 2 ? 1 : 0); xx < x + w; xx += size) {
          px(g, xx, yy, 1, size - 1, p[1]);
          px(g, xx + 1, yy + size - 1, size - 2, 1, shade(p[1], -0.1));
        }
      }
    };
  }

  function denim(c1, c2) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, c2], o), s = seedOf(o);
      px(g, x, y, w, h, p[0]);
      for (var yy = y; yy < y + h; yy++) {
        for (var xx = x + (yy % 2); xx < x + w; xx += 2) {
          if (nz(s + xx * 3 + yy * 5) > 0.45) px(g, xx, yy, 1, 1, p[1]);
        }
      }
    };
  }

  function plaid(c1, c2, c3, step) {
    return function (g, x, y, w, h, o) {
      var p = prep([c1, c2, c3], o);
      px(g, x, y, w, h, p[0]);
      for (var xx = x; xx < x + w; xx += step) { px(g, xx, y, 2, h, p[1]); px(g, xx + 3, y, 1, h, p[2]); }
      for (var yy = y; yy < y + h; yy += step) { px(g, x, yy, w, 2, p[1]); px(g, x, yy + 3, w, 1, p[2]); }
    };
  }

  /* ===================== сто пятьдесят текстур ====================== */

  var TEX = [];
  function T(id, name, group, base, fn) {
    TEX.push({ id: id, name: name, group: group, base: base, draw: fn });
  }

  /* ----------------------------- стены (30) -------------------------- */
  T('brick-red', 'Красный кирпич', 'стена', '#8b3a2a', bricks('#8b3a2a', '#7a3225', '#c9b8a6', 8, 4));
  T('brick-white', 'Белёный кирпич', 'стена', '#d8d2c6', bricks('#d8d2c6', '#c8c1b4', '#efeae0', 8, 4));
  T('brick-yellow', 'Жёлтый кирпич', 'стена', '#c9a86a', bricks('#c9a86a', '#b99a5d', '#e0d4bb', 8, 4));
  T('brick-grey', 'Силикатный кирпич', 'стена', '#9aa0a6', bricks('#9aa0a6', '#8a9096', '#c3c8cc', 8, 4));
  T('brick-old', 'Старая кладка', 'стена', '#75503f', bricks('#75503f', '#5f4134', '#a79484', 7, 4));
  T('plaster-cream', 'Кремовая штукатурка', 'стена', '#ddd0b6', plain('#ddd0b6', 1));
  T('plaster-blue', 'Голубая побелка', 'стена', '#aec6d4', plain('#aec6d4', 1));
  T('plaster-green', 'Зелёная краска', 'стена', '#9fb59a', plain('#9fb59a', 1));
  T('plaster-pink', 'Розовая стена', 'стена', '#d9b3ad', plain('#d9b3ad', 1));
  T('plaster-crack', 'Стена с трещинами', 'стена', '#c6bca8', speckle('#c6bca8', '#a79d8a', '#8d8574', 0.03));
  T('wall-concrete', 'Бетонная панель', 'стена', '#9b9e9c', concrete('#9b9e9c', '#8a8d8b'));
  T('wall-concrete-wet', 'Сырой бетон', 'стена', '#7e8584', concrete('#7e8584', '#6d7473'));
  T('wallpaper-stripe', 'Обои в полоску', 'стена', '#cdbba0', stripesV('#cdbba0', '#bba98d', 3));
  T('wallpaper-flower', 'Обои в цветочек', 'стена', '#d7c9b4', floral('#d7c9b4', '#9c7f6a', '#c2745f', 8));
  T('wallpaper-dots', 'Обои в горошек', 'стена', '#cfd7d9', dots('#cfd7d9', '#a8b4b8', 7, 1));
  T('wallpaper-grid', 'Обои в клетку', 'стена', '#ded3bd', grid('#ded3bd', '#bfb093', 6));
  T('wallpaper-old', 'Выцветшие обои', 'стена', '#c3b59c', stripesV('#c3b59c', '#b6a890', 4));
  T('wall-tile-white', 'Белый кафель', 'стена', '#e4e8e6', tiles('#e4e8e6', '#dadedc', '#b9c0bd', 6));
  T('wall-tile-blue', 'Синий кафель', 'стена', '#8fb0c4', tiles('#8fb0c4', '#7fa0b4', '#c3d1d9', 6));
  T('wall-tile-green', 'Больничный кафель', 'стена', '#aec4b5', tiles('#aec4b5', '#9eb4a5', '#cbd8d0', 6));
  T('wall-wood-panel', 'Деревянная панель', 'стена', '#8a6137', planksV('#8a6137', '#7a5530', 6));
  T('wall-wood-dark', 'Тёмные панели', 'стена', '#5a3f28', planksV('#5a3f28', '#4a3320', 7));
  T('wall-log', 'Бревенчатая стена', 'стена', '#a07545', planksH('#a07545', '#8c6539', 6));
  T('wall-clay', 'Глинобитная стена', 'стена', '#b2906a', plain('#b2906a', 2));
  T('wall-adobe', 'Саман', 'стена', '#c7a179', speckle('#c7a179', '#b08c66', '#d9b78f', 0.02));
  T('wall-stone', 'Каменная кладка', 'стена', '#8c8577', bricks('#8c8577', '#79736a', '#a9a396', 9, 5));
  T('wall-marble', 'Мрамор', 'стена', '#e6e4df', marble('#e6e4df', '#c8c5bd', '#a9a69d'));
  T('wall-metal', 'Металлическая стена', 'стена', '#9aa2a8', corrugated('#9aa2a8', '#8b939a', 4));
  T('wall-rust', 'Ржавое железо', 'стена', '#8a5a3c', rust('#8a5a3c', '#6f4228', '#a9724c'));
  T('wall-graffiti', 'Стена с граффити', 'стена', '#8d8f88', speckle('#8d8f88', '#c2533f', '#3f6ea8', 0.015));

  /* ------------------------------ полы (25) -------------------------- */
  T('floor-parquet', 'Паркет', 'пол', '#8a5f33', herringbone('#8a5f33', '#9c6d3c', 4));
  T('floor-parquet-dark', 'Тёмный паркет', 'пол', '#5f4124', herringbone('#5f4124', '#6e4b2a', 4));
  T('floor-board', 'Крашеные доски', 'пол', '#8d6236', planksH('#8d6236', '#7d562f', 5));
  T('floor-board-grey', 'Серые половицы', 'пол', '#8b8b84', planksH('#8b8b84', '#7c7c76', 5));
  T('floor-lino-grey', 'Серый линолеум', 'пол', '#a0a39f', plain('#a0a39f', 1));
  T('floor-lino-brown', 'Коричневый линолеум', 'пол', '#8a6a4b', plain('#8a6a4b', 1));
  T('floor-lino-pattern', 'Линолеум с рисунком', 'пол', '#9b8a6f', dots('#9b8a6f', '#857557', 5, 1));
  T('floor-tile-check', 'Шахматная плитка', 'пол', '#d9d6cf', checker('#d9d6cf', '#4a4a47', 5));
  T('floor-tile-grey', 'Серая плитка', 'пол', '#b3b7b5', tiles('#b3b7b5', '#a7abaa', '#8f9492', 7));
  T('floor-tile-beige', 'Бежевая плитка', 'пол', '#cdbfa6', tiles('#cdbfa6', '#c0b299', '#a79a84', 7));
  T('floor-tile-hex', 'Шестигранная плитка', 'пол', '#ccc8bd', hexTile('#ccc8bd', '#a9a59b', 5));
  T('floor-concrete', 'Бетонный пол', 'пол', '#8e918f', concrete('#8e918f', '#7d807e'));
  T('floor-stone', 'Каменные плиты', 'пол', '#8a8781', bricks('#8a8781', '#79766f', '#a09c95', 10, 6));
  T('floor-carpet-red', 'Красный ковёр', 'пол', '#8a3a33', carpet('#8a3a33', '#6e2d27', '#c2a05a', 6));
  T('floor-carpet-blue', 'Синий ковёр', 'пол', '#3c4f74', carpet('#3c4f74', '#2f3f5e', '#9aa7c0', 6));
  T('floor-carpet-worn', 'Вытертый ковёр', 'пол', '#8b7f6b', carpet('#8b7f6b', '#776c5a', '#a79a84', 7));
  T('floor-rug-oriental', 'Восточный ковёр', 'пол', '#7a2f2a', plaid('#7a2f2a', '#c9a24a', '#2f4a6b', 6));
  T('floor-mat-straw', 'Циновка', 'пол', '#c2a86a', weave('#c2a86a', '#b09757', 3));
  T('floor-tatami', 'Татами', 'пол', '#c8bb86', weave('#c8bb86', '#b8ab77', 4));
  T('floor-earth', 'Земляной пол', 'пол', '#7a6246', speckle('#7a6246', '#6a543c', '#8b7253', 0.04));
  T('floor-brick', 'Кирпичный пол', 'пол', '#8f4f38', bricks('#8f4f38', '#7d442f', '#b09a86', 7, 4));
  T('floor-wet', 'Мокрый пол', 'пол', '#6f7a7c', waves('#6f7a7c', '#7f8a8c', '#637072'));
  T('floor-marble', 'Мраморный пол', 'пол', '#ded9d0', marble('#ded9d0', '#bdb8ae', '#9d998f'));
  T('floor-metal', 'Рифлёный металл', 'пол', '#8b9095', diagonal('#8b9095', '#9aa0a5', 4));
  T('floor-dirt-room', 'Затоптанный пол', 'пол', '#6e6557', speckle('#6e6557', '#5e5649', '#7c7365', 0.05));

  /* ----------------------------- земля (25) -------------------------- */
  T('ground-grass', 'Трава', 'земля', '#3f6b33', grassTex('#3f6b33', '#4d7f3c', '#355c2b'));
  T('ground-grass-dry', 'Сухая трава', 'земля', '#7f7a3c', grassTex('#7f7a3c', '#938c47', '#6b6632'));
  T('ground-grass-wet', 'Сочная трава', 'земля', '#356b2f', grassTex('#356b2f', '#428038', '#2b5726'));
  T('ground-steppe', 'Степь', 'земля', '#8a7f4e', grassTex('#8a7f4e', '#9a8f5a', '#776d42'));
  T('ground-sand', 'Песок', 'земля', '#cbb183', speckle('#cbb183', '#b99f72', '#d8c195', 0.03));
  T('ground-desert', 'Пустыня', 'земля', '#c4a06a', speckle('#c4a06a', '#b08c5a', '#d2b07c', 0.025));
  T('ground-clay', 'Красная глина', 'земля', '#9c5a3c', speckle('#9c5a3c', '#8a4c31', '#ad6a4a', 0.03));
  T('ground-mud', 'Грязь', 'земля', '#5e4c3a', speckle('#5e4c3a', '#4e3f2f', '#6d5a46', 0.04));
  T('ground-snow', 'Снег', 'земля', '#e3e9ee', speckle('#e3e9ee', '#ffffff', '#cdd6dd', 0.02));
  T('ground-snow-dirty', 'Серый снег', 'земля', '#c3c8cc', speckle('#c3c8cc', '#d9dee1', '#a6acb0', 0.03));
  T('ground-ice', 'Наледь', 'земля', '#bcd0d8', waves('#bcd0d8', '#cfe0e6', '#a8bfc8'));
  T('ground-asphalt', 'Асфальт', 'земля', '#3b3f45', speckle('#3b3f45', '#4a4f55', '#31353a', 0.04));
  T('ground-asphalt-old', 'Разбитый асфальт', 'земля', '#454a4f', gravel('#454a4f', '#565c62', '#383c41'));
  T('ground-cobble', 'Брусчатка', 'земля', '#7b7a76', bricks('#7b7a76', '#6b6a66', '#949390', 6, 4));
  T('ground-paving', 'Тротуарная плитка', 'земля', '#9a958c', bricks('#9a958c', '#8c877f', '#b0aba2', 8, 5));
  T('ground-gravel', 'Гравий', 'земля', '#86827a', gravel('#86827a', '#96928a', '#76726a'));
  T('ground-field-plough', 'Пашня', 'земля', '#6b5338', stripesH('#6b5338', '#7b6244', 3));
  T('ground-field-wheat', 'Пшеничное поле', 'земля', '#bfa150', grassTex('#bfa150', '#d2b45f', '#a88d44'));
  T('ground-rice', 'Рисовое поле', 'земля', '#6f8a5a', waves('#6f8a5a', '#80996a', '#5f7a4c'));
  T('ground-forest', 'Лесная подстилка', 'земля', '#4a4330', speckle('#4a4330', '#5c5440', '#3b3526', 0.05));
  T('ground-stone', 'Каменистая земля', 'земля', '#7e7a72', gravel('#7e7a72', '#8e8a82', '#6e6a62'));
  T('ground-rails', 'Пути и шпалы', 'земля', '#5c564c', stripesV('#5c564c', '#473f33', 4));
  T('ground-market', 'Рыночная площадь', 'земля', '#8f8878', speckle('#8f8878', '#7f7868', '#9f9888', 0.035));
  T('ground-yard', 'Школьный двор', 'земля', '#6e6f63', speckle('#6e6f63', '#7e7f73', '#5e5f53', 0.03));
  T('ground-beach', 'Пляж у воды', 'земля', '#d2c094', waves('#d2c094', '#c2b084', '#8fb6bd'));

  /* ----------------------------- фасады (20) ------------------------- */
  T('facade-panel', 'Панельный дом', 'фасад', '#9a9c98', grid('#9a9c98', '#858783', 7));
  T('facade-khrushchevka', 'Пятиэтажка', 'фасад', '#c3bba6', grid('#c3bba6', '#a9a28f', 8));
  T('facade-brick-house', 'Кирпичный дом', 'фасад', '#8f5240', bricks('#8f5240', '#7d4738', '#b5a394', 7, 4));
  T('facade-glass', 'Стеклянная башня', 'фасад', '#5d7d92', grid('#5d7d92', '#43606f', 5));
  T('facade-office', 'Офисный центр', 'фасад', '#6d7a85', grid('#6d7a85', '#58646d', 6));
  T('facade-colonial', 'Колониальный дом', 'фасад', '#d8cdb5', stripesH('#d8cdb5', '#c7bca4', 5));
  T('facade-favela', 'Самострой', 'фасад', '#b07f5a', bricks('#b07f5a', '#95674a', '#c9a98c', 6, 4));
  T('facade-wood-house', 'Деревянный дом', 'фасад', '#9a6c3e', planksH('#9a6c3e', '#875f36', 5));
  T('facade-izba', 'Изба', 'фасад', '#8e6336', planksH('#8e6336', '#7b5630', 6));
  T('facade-tin', 'Железные листы', 'фасад', '#8f8d86', corrugated('#8f8d86', '#7f7d76', 5));
  T('facade-tile-roof', 'Черепичная крыша', 'фасад', '#a14f36', scales('#a14f36', '#8a4229', 4));
  T('facade-slate-roof', 'Шиферная крыша', 'фасад', '#8c8f92', stripesV('#8c8f92', '#7c7f82', 3));
  T('facade-thatch', 'Соломенная крыша', 'фасад', '#b79a56', grassTex('#b79a56', '#c7aa66', '#a78a46'));
  T('facade-flat-roof', 'Плоская крыша', 'фасад', '#5f6265', speckle('#5f6265', '#6f7275', '#4f5255', 0.03));
  T('facade-mosaic', 'Мозаичное панно', 'фасад', '#7a8c9a', checker('#7a8c9a', '#c2a04a', 3));
  T('facade-balconies', 'Дом с балконами', 'фасад', '#b4ab97', grid('#b4ab97', '#9a9280', 6));
  T('facade-shutters', 'Дом со ставнями', 'фасад', '#cdbfa0', stripesV('#cdbfa0', '#8a7a5c', 6));
  T('facade-shop', 'Витрина магазина', 'фасад', '#6f7f86', stripesH('#6f7f86', '#d8d2c2', 6));
  T('facade-factory', 'Заводской корпус', 'фасад', '#7b736a', grid('#7b736a', '#655e56', 9));
  T('facade-temple', 'Храм', 'фасад', '#d6c9a8', bricks('#d6c9a8', '#c4b795', '#e5dcc3', 9, 5));

  /* ------------------------------ ткани (30) ------------------------- */
  T('cloth-cotton', 'Хлопок', 'ткань', '#d8d2c4', plain('#d8d2c4', 0.6));
  T('cloth-linen', 'Лён', 'ткань', '#cfc6ab', weave('#cfc6ab', '#c2b89d', 2));
  T('cloth-wool', 'Шерсть', 'ткань', '#8d7f6c', knit('#8d7f6c', '#7d6f5c', 3));
  T('cloth-knit', 'Вязаный свитер', 'ткань', '#7b5f4b', knit('#7b5f4b', '#6b513f', 3));
  T('cloth-denim', 'Джинса', 'ткань', '#43607f', denim('#43607f', '#32506d'));
  T('cloth-denim-light', 'Светлая джинса', 'ткань', '#6f8aa6', denim('#6f8aa6', '#5d7a96'));
  T('cloth-plaid-red', 'Красная клетка', 'ткань', '#8a3b33', plaid('#8a3b33', '#2b2b2b', '#d9c9a0', 6));
  T('cloth-plaid-blue', 'Синяя клетка', 'ткань', '#3c4f6b', plaid('#3c4f6b', '#1f2a3a', '#c7d2de', 6));
  T('cloth-stripe-sailor', 'Тельняшка', 'ткань', '#e8e8e4', stripesH('#e8e8e4', '#2f4b74', 2));
  T('cloth-stripe-shirt', 'Рубашка в полоску', 'ткань', '#dde3e6', stripesV('#dde3e6', '#8fa6bb', 2));
  T('cloth-dots', 'Платье в горошек', 'ткань', '#b23f55', dots('#b23f55', '#f0e6e2', 5, 1));
  T('cloth-floral', 'Цветастый ситец', 'ткань', '#c76b74', floral('#c76b74', '#f2e2cf', '#6b8a4a', 6));
  T('cloth-batik', 'Батик', 'ткань', '#2f6b6b', waves('#2f6b6b', '#d9a441', '#1f4b4b'));
  T('cloth-kente', 'Африканский узор', 'ткань', '#d9a441', plaid('#d9a441', '#1f2a3a', '#b23f3f', 5));
  T('cloth-sari', 'Сари', 'ткань', '#b1365c', stripesH('#b1365c', '#e0b84a', 4));
  T('cloth-silk', 'Шёлк', 'ткань', '#c8a2c8', plain('#c8a2c8', 0.4));
  T('cloth-velvet', 'Бархат', 'ткань', '#4b2a4b', plain('#4b2a4b', 0.5));
  T('cloth-leather', 'Кожа', 'ткань', '#5a3a28', speckle('#5a3a28', '#4a2f20', '#6a4634', 0.02));
  T('cloth-canvas', 'Брезент', 'ткань', '#7d7558', weave('#7d7558', '#6d6549', 2));
  T('cloth-fleece', 'Флис', 'ткань', '#6b7f8a', speckle('#6b7f8a', '#7b8f9a', '#5b6f7a', 0.05));
  T('cloth-nylon', 'Болоньевая куртка', 'ткань', '#2f4a6b', plain('#2f4a6b', 0.3));
  T('cloth-camo', 'Камуфляж', 'ткань', '#5d6b45', speckle('#5d6b45', '#3f4a2f', '#7d8a5f', 0.06));
  T('cloth-uniform-blue', 'Синяя форма', 'ткань', '#30405c', plain('#30405c', 0.4));
  T('cloth-uniform-grey', 'Серая роба', 'ткань', '#6e7276', plain('#6e7276', 0.6));
  T('cloth-apron', 'Фартук', 'ткань', '#cfd4d6', stripesV('#cfd4d6', '#a9b0b4', 3));
  T('cloth-lace', 'Кружево', 'ткань', '#efeae2', dots('#efeae2', '#d2cabd', 3, 1));
  T('cloth-patched', 'Заплатанная ткань', 'ткань', '#8a7a62', checker('#8a7a62', '#6e6150', 5));
  T('cloth-fur', 'Мех', 'ткань', '#6b5a48', grassTex('#6b5a48', '#7b6a58', '#5b4a38'));
  T('cloth-raincoat', 'Дождевик', 'ткань', '#c9a227', plain('#c9a227', 0.25));
  T('cloth-hospital', 'Больничная роба', 'ткань', '#9fc0b4', plain('#9fc0b4', 0.5));

  /* --------------------------- материалы (20) ------------------------ */
  T('mat-wood-pine', 'Сосна', 'материал', '#c49a5e', planksH('#c49a5e', '#b38a50', 4));
  T('mat-wood-oak', 'Дуб', 'материал', '#8a6334', planksH('#8a6334', '#79562c', 4));
  T('mat-wood-painted', 'Крашеное дерево', 'материал', '#6f8a6b', planksV('#6f8a6b', '#5f7a5b', 5));
  T('mat-plywood', 'Фанера', 'материал', '#c6a978', speckle('#c6a978', '#b79a6a', '#d3b888', 0.02));
  T('mat-steel', 'Сталь', 'материал', '#9ba3aa', plain('#9ba3aa', 0.5));
  T('mat-steel-brushed', 'Шлифованный металл', 'материал', '#a8b0b6', stripesV('#a8b0b6', '#9aa2a8', 1));
  T('mat-copper', 'Медь', 'материал', '#b4713f', speckle('#b4713f', '#c98a52', '#9c5f33', 0.02));
  T('mat-gold', 'Позолота', 'материал', '#c8a24a', plain('#c8a24a', 0.4));
  T('mat-glass', 'Стекло', 'материал', '#9fc2cf', diagonal('#9fc2cf', '#bdd8e2', 6));
  T('mat-glass-dirty', 'Мутное стекло', 'материал', '#9aa8a8', speckle('#9aa8a8', '#8a9898', '#aab8b8', 0.04));
  T('mat-plastic', 'Пластик', 'материал', '#c9cbc6', plain('#c9cbc6', 0.3));
  T('mat-plastic-blue', 'Синий пластик', 'материал', '#3f6f9c', plain('#3f6f9c', 0.3));
  T('mat-cardboard', 'Картон', 'материал', '#b4906a', corrugated('#b4906a', '#a5815c', 3));
  T('mat-paper', 'Бумага', 'материал', '#e8e4d8', plain('#e8e4d8', 0.3));
  T('mat-rubber', 'Резина', 'материал', '#3a3c3e', speckle('#3a3c3e', '#4a4c4e', '#2f3133', 0.03));
  T('mat-ceramic', 'Керамика', 'материал', '#dcd3c3', plain('#dcd3c3', 0.3));
  T('mat-slate', 'Сланец', 'материал', '#55595e', bricks('#55595e', '#4a4e53', '#656a6f', 7, 3));
  T('mat-moss', 'Мох', 'материал', '#45663c', speckle('#45663c', '#547a49', '#36512f', 0.07));
  T('mat-water', 'Вода', 'материал', '#3e6b84', waves('#3e6b84', '#4f7f98', '#2f5a70'));
  T('mat-coal', 'Уголь', 'материал', '#2b2b2e', gravel('#2b2b2e', '#3b3b3e', '#1f1f22'));

  /* ====================== список, поиск, выбор ====================== */

  var BY_ID = {};
  TEX.forEach(function (t) { BY_ID[t.id] = t; });

  var GROUPS = [];
  TEX.forEach(function (t) { if (GROUPS.indexOf(t.group) < 0) GROUPS.push(t.group); });

  function byGroup(group) {
    return TEX.filter(function (t) { return t.group === group; });
  }

  /* нарисовать по имени: если имени нет — ровная заливка, а не пустота */
  function draw(id, g, x, y, w, h, o) {
    var t = BY_ID[id];
    if (!t) { px(g, x, y, w, h, (o && o.tint) || '#888888'); return false; }
    t.draw(g, x, y, w, h, o || {});
    return true;
  }

  /* устойчивый выбор: одно и то же зерно — одна и та же текстура */
  function pick(group, seed) {
    var pool = byGroup(group);
    if (!pool.length) pool = TEX;
    var i = Math.abs(Math.floor(seed || 0)) % pool.length;
    return pool[i];
  }

  function hashStr(s) {
    var h = 2166136261;
    s = String(s === undefined ? '' : s);
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return Math.abs(h >>> 0);
  }

  window.IN8B = window.IN8B || {};
  window.IN8B.textures = {
    list: TEX,
    byId: BY_ID,
    groups: GROUPS,
    byGroup: byGroup,
    draw: draw,
    pick: pick,
    hashStr: hashStr,
    count: TEX.length
  };
})();
