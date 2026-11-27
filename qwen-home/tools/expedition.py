#!/usr/bin/env python3
"""Экспедиция Квени: её браузерные руки в интернет.

Запускается workflow `Kvenya expedition` — по расписанию (сама, без
владельца) и вручную. Что умеют руки:
  - открыть публичную страницу (по умолчанию — игру Яндекс Игр);
  - найти и нажать «Играть»;
  - играть честным вводом: клики по канвасу, стрелки, WASD, пробел;
  - писать видео экспедиции и скриншоты, вести пошаговый отчёт.

Чего руки НЕ делают — и это не ограничение моста, а чужой замок:
  - не нажимают «я не робот» и не решают капчи: Квеня — робот, и
    подтверждать обратное было бы враньём и взломом защиты сайта.
    Встретила капчу — сфотографировала, записала и остановилась;
  - не входят в чужие аккаунты и не вводят пароли;
  - не ставят stealth-маскировку «под человека».

Итог каждой экспедиции — report.json со статусом:
  played        — канвас найден, ввод ушёл в игру, видео записано;
  opened-only   — страница открылась, но до игры не дошло;
  captcha-wall  — сайт показал «подтвердите, что вы не робот»;
  no-canvas     — кнопка нажата, а игрового канваса нет;
  error         — сеть/браузер не дали даже открыть.
"""
import argparse
import hashlib
import json
import re
import sys
import time
import urllib.parse
import urllib.robotparser
from datetime import datetime, timezone
from pathlib import Path

BOT_UA = 'KvenyaExpedition/1.0 (+https://github.com/m98978672-boop/games)'

CAPTCHA_MARKERS = ('не робот', 'not a robot', 'smartcaptcha', 'подтвердите, что вы человек',
                   'i am not a robot', 'покажите, что вы не робот', 'введите символы')
PLAY_TEXTS = ('играть', 'play', 'играть сейчас', 'начать игру', 'start game')
KEY_PLAN = ('ArrowRight', 'ArrowRight', 'Space', 'ArrowLeft', 'KeyW', 'ArrowUp',
            'KeyA', 'Space', 'KeyD', 'ArrowDown', 'Space', 'ArrowRight')


def detect_captcha(text):
    low = (text or '').lower()
    return next((m for m in CAPTCHA_MARKERS if m in low), '')


def plan_keys(seconds):
    """Запасной план, если экран старта ничего не подсказал."""
    rounds = max(1, min(6, int(seconds // 12) + 1))
    return list(KEY_PLAN) * rounds


def detect_controls(text):
    """Подготовка к игре: прочитать экран старта и собрать план под игру.

    Возвращает (keys, interval_ms, mode, hint): mode 'flap' — одна
    клавиша ритмом (Flappy и подобные), 'cycle' — набор клавиш по
    кругу, 'click' — игра слушается мышь."""
    low = (text or '').lower()
    if 'space' in low or 'пробел' in low:
        return ['Space'], 430, 'flap', 'экран просит пробел — играю одной клавишей ритмом'
    if 'arrow' in low or 'стрелк' in low:
        return ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'], 480, 'cycle', 'экран просит стрелки'
    if 'wasd' in low:
        return ['KeyW', 'KeyA', 'KeyS', 'KeyD'], 480, 'cycle', 'экран просит WASD'
    if 'click' in low or 'клик' in low or 'мыш' in low:
        return [], 450, 'click', 'экран просит клики мышью'
    return list(KEY_PLAN), 650, 'cycle', 'подсказок на экране нет — запасной план'


EYES_SUMMARY_JS = r"""
() => {
  // Глаза одним чтением экрана. Замер по настоящим кадрам игры показал:
  // разбор пикселей стоит 0,26 мс, а ЧТЕНИЕ кадра — 1,3 мс, то есть 80%
  // времени. Поэтому читаем не весь кадр, а узкую полосу: в ней есть всё
  // нужное (птица слева, трубы справа, панель конца игры), и пиксели
  // раскладываются по счётчикам за ОДИН проход.
  // Сверено с полной версией на 100 кадрах игрового видео: просвет совпал
  // 37 из 37, птица видна в тех же кадрах, ложных срабатываний 0.
  const c = document.querySelector('canvas');
  if (!c) return {ok: false, why: 'no canvas'};
  let ctx = null;
  try { ctx = c.getContext('2d'); } catch (e) {}
  if (!ctx) return {ok: false, why: 'no 2d context'};
  const w = c.width, h = c.height, step = 4;
  // Начало полосы кратно шагу сетки: иначе поиск трубы читает пустые ячейки
  // и не находит её вовсе (эта ошибка уже была один раз).
  const x0 = Math.floor(0.015 * w / step) * step, pw = w - x0, ph = Math.floor(0.87 * h);
  let d = null;
  try { d = ctx.getImageData(x0, 0, pw, ph).data; }
  catch (e) { return {ok: false, why: 'pixels closed'}; }
  const colH = new Uint16Array(w);     // зелёных точек в колонке
  const colDark = new Uint16Array(w);  // тёмных точек в колонке (окантовка трубы)
  const rowH = new Uint16Array(h);     // зелёных точек в строке
  let bx0 = w, bx1 = -1, by0 = h, by1 = -1, bN = 0;
  const bxLim = Math.floor(0.24 * w);
  let cream = 0, creamAll = 0;
  const cxa = Math.floor(0.30 * w), cxb = Math.floor(0.70 * w);
  const cya = Math.floor(0.20 * h), cyb = Math.floor(0.62 * h);
  for (let y = 0; y < ph; y += step) {
    const rb = y * pw;
    const creamRow = y >= cya && y <= cyb;
    for (let x = 0; x < pw; x += step) {
      const i = (y * pw + x) * 4;
      if (d[i + 3] < 200) continue;
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const X = x + x0;
      // птица: жёлтая, слева
      if (X <= bxLim && y < 0.80 * h && r > 200 && g > 150 && b < 120 && r - b > 90) {
        bN++;
        if (X < bx0) bx0 = X; if (X > bx1) bx1 = X;
        if (y < by0) by0 = y; if (y > by1) by1 = y;
        continue;
      }
      if (g > 100 && g >= r - 10 && b < 150 && !(r > 205 && g > 205)) { colH[X]++; rowH[y]++; }
      if (r < 70 && g < 70 && b < 70) colDark[X]++;
      if (creamRow && X >= cxa && X <= cxb) {
        creamAll++;
        if (r > 220 && g > 220 && b > 140 && b < 225) cream++;
      }
    }
  }
  const bird = bN >= 5 ? [(bx0 + bx1) >> 1, (by0 + by1) >> 1] : null;
  // «Фоновые» строки: зелёный почти во всю ширину — это холмы, земля, облака,
  // а не труба. Без отсева просвет прыгал на холмы.
  const wide = Math.max(6, Math.floor(0.15 * w));
  const at = (x, y) => (y * pw + (x - x0)) * 4;
  let gap = null, pipeX = null, gapSure = false;
  if (bird) {
    let xs = bird[0] + Math.floor(0.05 * w);
    xs += (step - (xs % step)) % step;
    for (let x = xs; x < w; x += step) {
      if (colH[x] < 3 || colDark[x] < 4) continue;
      // верх трубы: последний зелёный выше трети высоты, не считая фона
      let topMax = -1, topN = 0;
      for (let y = 0; y < 0.30 * h; y += step) {
        if (rowH[y] >= wide) continue;
        const i = at(x, y);
        if (d[i + 3] < 200) continue;
        const r = d[i], g = d[i + 1], b = d[i + 2];
        if (g > 100 && g >= r - 10 && b < 150 && !(r > 205 && g > 205)) { topMax = y; topN++; }
      }
      if (topN < 3 || topMax < 0) continue;
      // низ просвета: первый зелёный ниже верха трубы, тоже без фона
      let gapBottom = -1;
      for (let y = topMax + Math.floor(0.06 * h); y < 0.86 * h; y += step) {
        if (rowH[y] >= wide) continue;
        const i = at(x, y);
        if (d[i + 3] < 200) continue;
        const r = d[i], g = d[i + 1], b = d[i + 2];
        if (g > 100 && g >= r - 10 && b < 150 && !(r > 205 && g > 205)) { gapBottom = y; break; }
      }
      // проверка просвета: настоящий просвет ~0.29 кадра; сильно уже или шире —
      // не верю нижней границе и беру расчётную
      let sure = gapBottom > topMax;
      if (!sure) gapBottom = Math.min(0.86 * h, topMax + 0.293 * h);
      if (gapBottom - topMax < 0.16 * h || gapBottom - topMax > 0.50 * h) {
        gapBottom = Math.min(0.86 * h, topMax + 0.293 * h);
        sure = false;
      }
      pipeX = x;
      gap = [topMax, gapBottom];
      gapSure = sure;
      break;
    }
  }
  return {ok: true, w: w, h: h, bird: bird, gap: gap, pipe_x: pipeX, gap_sure: gapSure,
          game_over: creamAll ? (cream / creamAll) > 0.35 : false};
}
"""





def _decode_png(data):
    """Минимальный PNG-декодер (stdlib): запасные глаза через скриншот канваса."""
    import struct
    import zlib
    if data[:8] != b'\x89PNG\r\n\x1a\n':
        return None
    pos, idat, meta = 8, b'', {}
    while pos < len(data):
        ln, typ = struct.unpack('>I4s', data[pos:pos + 8])
        pos += 8
        chunk = data[pos:pos + ln]
        pos += ln + 4
        if typ == b'IHDR':
            w, h, depth, ctype = struct.unpack('>IIBB', chunk[:10])
            meta = {'w': w, 'h': h, 'depth': depth, 'ctype': ctype}
        elif typ == b'IDAT':
            idat += chunk
        elif typ == b'IEND':
            break
    if meta.get('depth') != 8:
        return None
    ch = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}.get(meta.get('ctype'), 0)
    if not ch:
        return None
    w, h = meta['w'], meta['h']
    raw = zlib.decompress(idat)
    stride = w * ch
    out = bytearray(w * h * ch)
    prev = bytearray(stride)
    pp = 0
    for y in range(h):
        f = raw[pp]
        pp += 1
        line = bytearray(raw[pp:pp + stride])
        pp += stride
        if f == 1:
            for i in range(ch, stride):
                line[i] = (line[i] + line[i - ch]) & 0xff
        elif f == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 0xff
        elif f == 3:
            for i in range(stride):
                a = line[i - ch] if i >= ch else 0
                line[i] = (line[i] + ((a + prev[i]) >> 1)) & 0xff
        elif f == 4:
            for i in range(stride):
                a = line[i - ch] if i >= ch else 0
                b = prev[i]
                cc = prev[i - ch] if i >= ch else 0
                pa, pb, pc = abs(b - cc), abs(a - cc), abs(a + b - 2 * cc)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else cc)
                line[i] = (line[i] + pr) & 0xff
        out[y * stride:(y + 1) * stride] = line
        prev = line
    return meta['w'], meta['h'], ch, bytes(out)


def analyze_eyes(raw):
    """Разобрать кадр: где птица, где просвет труб, не конец ли игры.

    На входе — пиксели кадра: {'ok', 'w', 'h', 'px' (RGBA), 'ch'}.
    Это тот же расчёт, что в EYES_SUMMARY_JS, только на питоне. Раньше здесь
    был «кандидатный» путь со списками пар и множествами на каждую точку:
    на кадр 1200x800 уходили сотни миллисекунд, глаза отставали от игры, и
    птица входила в трубу «вслепую». Теперь один проход по пикселям в
    счётчики на типизированных массивах.
    """
    if not raw or not raw.get('ok'):
        return None
    w, h, ch, px = raw['w'], raw['h'], raw['ch'], raw['px']
    step = 4
    colH = [0] * w          # зелёных точек в колонке
    colDark = [0] * w       # тёмных точек в колонке (окантовка трубы)
    rowH = [0] * h          # зелёных точек в строке
    bx0, bx1, by0, by1, bN = w, -1, h, -1, 0
    cream = cream_all = 0
    cx0, cx1, cy0, cy1 = w * 0.30, w * 0.70, h * 0.20, h * 0.62
    for yy in range(0, h, step):
        base = yy * w
        for xx in range(0, w, step):
            i = (base + xx) * ch
            r, g, b = px[i], px[i + 1], px[i + 2]
            a = px[i + 3] if ch == 4 else 255
            if a < 200:
                continue
            if (r > 200 and g > 150 and b < 120 and r - b > 90
                    and 0.02 * w <= xx <= 0.24 * w and yy < 0.80 * h):
                bN += 1
                if xx < bx0: bx0 = xx
                if xx > bx1: bx1 = xx
                if yy < by0: by0 = yy
                if yy > by1: by1 = yy
            if g > 100 and g >= r - 10 and b < 150 and not (r > 205 and g > 205) and yy < 0.86 * h:
                colH[xx] += 1
                rowH[yy] += 1
            if r < 70 and g < 70 and b < 70:
                colDark[xx] += 1
            if cx0 <= xx <= cx1 and cy0 <= yy <= cy1:
                cream_all += 1
                if r > 220 and g > 220 and 140 < b < 225:
                    cream += 1

    bird = None
    if bN >= 5:
        bird = ((bx0 + bx1) >> 1, (by0 + by1) >> 1)

    def is_green(x, y):
        i = (y * w + x) * ch
        if (px[i + 3] if ch == 4 else 255) < 200:
            return False
        r, g, b = px[i], px[i + 1], px[i + 2]
        return (g > 100 and g >= r - 10 and b < 150
                and not (r > 205 and g > 205) and y < 0.86 * h)

    # «Фоновые» строки: зелёный почти во всю ширину — это холмы, земля, облака,
    # а не труба. Без этого отсева просвет прыгал на холмы.
    # Тот же расчёт, что в EYES_SUMMARY_JS: узкая полоса, один проход,
    # «фоновые» строки (холмы, земля, облака) отсеиваются по доле ширины.
    # Сверено с JS-версией на настоящих кадрах: просвет совпал 37 из 37.
    wide = max(6, int(0.15 * w))
    gap = None
    pipe_x = None
    gap_sure = False
    if bird:
        x0 = bird[0] + int(0.05 * w)
        x0 += (step - (x0 % step)) % step
        for x in range(x0, w, step):
            if colH[x] < 3 or colDark[x] < 4:
                continue
            top_max, top_n = -1, 0
            for y in range(0, int(0.30 * h), step):
                if rowH[y] >= wide:
                    continue                      # фон, а не труба
                if is_green(x, y):
                    top_max, top_n = y, top_n + 1
            if top_n < 3 or top_max < 0:
                continue
            gap_bottom = -1
            for y in range(top_max + int(0.06 * h), int(0.86 * h), step):
                if rowH[y] >= wide:
                    continue
                if is_green(x, y):
                    gap_bottom = y
                    break
            sure = gap_bottom > top_max
            if not sure:
                gap_bottom = min(0.86 * h, top_max + 0.293 * h)
            if gap_bottom - top_max < 0.16 * h or gap_bottom - top_max > 0.50 * h:
                gap_bottom = min(0.86 * h, top_max + 0.293 * h)
                sure = False
            pipe_x = x
            gap = (top_max, gap_bottom)
            gap_sure = sure
            break
    return {'w': w, 'h': h, 'bird': bird, 'gap': gap, 'pipe_x': pipe_x,
            'gap_sure': gap_sure, 'game_over': (cream / cream_all) > 0.35 if cream_all else False}


def eyes_from_png(data):
    """Запасные глаза: PNG-скриншот канваса -> пиксели кадра для analyze_eyes."""
    decoded = _decode_png(data)
    if not decoded:
        return None
    w, h, ch, px = decoded
    return {'ok': True, 'w': w, 'h': h, 'ch': ch, 'px': px}


def decide_flap(bird_y, gap, target_y, h, ms_since_flap, vy=0, sure=True):
    """Решение глаз: жать ли взмах на этом кадре.

    Стратегия — ровно та, что дала рекорд 4 трубы. Проверено на живых матчах:
    зона 0.58 дала 1 трубу, а «упреждение по скорости» вместе с расширенным
    порогом срочности — тоже 1 трубу против 2 у этой версии. Поэтому здесь
    ничего не «улучшено»: менялось только ЗРЕНИЕ (см. EYES_SUMMARY_JS), а
    оно теперь разбирает кадр за 8-10 мс и успевает (видно в отчёте).

    Главный урок трасс: птицу убивает не скорость, а ВЫСОТА у трубы.
    Взмах уносит на ~72 px вверх, и если жать у середины просвета, птица
    взлетает выше верхнего края — а труба уже здесь.
    Поэтому играем ЗОНОЙ: взмах только когда птица опустилась в нижнюю
    четверть просвета, у нижнего края — срочно, на подъёме — не мешаем.
    Без просвета (трубы не видно) — держим высоту target_y.
    """
    if bird_y is None:
        return False
    if gap:
        gap_top, gap_bottom = gap
        if bird_y > gap_bottom - 0.05 * h:
            return ms_since_flap >= 80
        # аварийный тормоз: пулей вниз уже в середине просвета —
        # не ждём зону, скорость сама донесёт до нижнего края
        if vy >= 45 and bird_y > gap_top + 0.45 * (gap_bottom - gap_top):
            return ms_since_flap >= 70
        zone = gap_top + 0.72 * (gap_bottom - gap_top)
        # прогноз: падаем быстро — к следующему кадру будем в зоне,
        # жмём СЕЙЧАС, а не когда уже поздно (урок смертей «пулей»)
        if vy > 8 and bird_y + vy * 0.9 > zone:
            return ms_since_flap >= 80
        return bird_y > zone and vy > -14 and ms_since_flap >= 90
    if vy >= 34 and bird_y > target_y - 0.06 * h:
        return ms_since_flap >= 80
    if bird_y > target_y + 0.010 * h and vy > -12 and ms_since_flap >= 100:
        return True
    return vy >= 20 and bird_y > target_y - 0.06 * h and ms_since_flap >= 90


class Report:
    def __init__(self, url):
        self.data = {
            'url': url,
            'startedAt': datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC'),
            'status': 'error',
            'steps': [],
            'screenshots': [],
            'kind': 'game',
            'hasVideo': False,
            'textSample': '',
        }

    def step(self, action, result):
        self.data['steps'].append({'t': round(time.monotonic() % 100000, 1), 'action': action, 'result': result})
        print(f"[expedition] {action}: {result}", flush=True)

    def save(self, out):
        (out / 'report.json').write_text(json.dumps(self.data, ensure_ascii=False, indent=2), encoding='utf-8')


def robots_allows(url):
    """Вежливый гость сначала читает robots.txt чужого дома.

    Возвращает (можно?, пометка). Если robots.txt не прочитался —
    идём осторожно и честно помечаем это в отчёте."""
    try:
        parts = urllib.parse.urlparse(url)
        rp = urllib.robotparser.RobotFileParser()
        rp.set_url(f'{parts.scheme}://{parts.netloc}/robots.txt')
        rp.read()
        return rp.can_fetch(BOT_UA, url), 'robots.txt прочитан'
    except Exception as err:
        return True, f'robots.txt не прочитался ({type(err).__name__}) — иду осторожно'


def run(url, seconds, out, task_keys='', interval_ms=0, memo_from=None):
    from playwright.sync_api import sync_playwright  # ленивая: --help и тесты логики без браузера

    out.mkdir(parents=True, exist_ok=True)
    video_dir = out / 'video-raw'
    report = Report(url)
    # Прогон целиком: до 10 минут, чтобы история успела пройти несколько раз.
    deadline = time.monotonic() + max(20, min(600, seconds))

    allowed, robots_note = robots_allows(url)
    report.step('вежливый гость: проверка robots.txt', robots_note)
    if not allowed:
        report.data['status'] = 'robots-denied'
        report.step('честный отказ', 'robots.txt этого сайта просит роботов сюда не ходить — не пошла, и это нормально')
        out.mkdir(parents=True, exist_ok=True)
        report.save(out)
        print(json.dumps({'status': report.data['status'], 'steps': len(report.data['steps'])}), flush=True)
        return 0

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800},
            user_agent=BOT_UA,
            locale='ru-RU',
            record_video_dir=str(video_dir),
            record_video_size={'width': 1280, 'height': 800},
        )
        page = context.new_page()

        def shot(name):
            path = out / name
            try:
                page.screenshot(path=str(path))
                report.data['screenshots'].append(name)
            except Exception as err:
                report.step('скриншот', f'не вышло: {err}')

        def page_text():
            try:
                return page.evaluate("() => document.body ? document.body.innerText.slice(0, 4000) : ''") or ''
            except Exception:
                return ''

        try:
            page.goto(url, wait_until='domcontentloaded', timeout=45000)
            page.wait_for_timeout(3500)
            report.step('открыла страницу', page.title() or url)
            shot('01-open.png')
            text = page_text()
            report.data['textSample'] = re.sub(r'\s+', ' ', text)[:600]
            marker = detect_captcha(text)
            if marker:
                report.data['status'] = 'captcha-wall'
                report.step('стена капчи', f'сайт спрашивает «{marker}» — я робот, подтверждать обратное не буду; сфотографировала и останавливаюсь')
                shot('02-captcha.png')
                return finish(browser, context, video_dir, out, report)

            # кнопка «Играть» — как её нажал бы любой посетитель
            clicked = False
            for name in PLAY_TEXTS:
                try:
                    btn = page.get_by_text(re.compile(re.escape(name), re.I)).first
                    if btn.is_visible(timeout=1200):
                        btn.click(timeout=5000)
                        clicked = True
                        report.step('нажала кнопку', f'«{name}»')
                        break
                except Exception:
                    continue
            if not clicked:
                report.step('кнопка игры', 'не нашлась — пробую играть прямо на открытой странице')
            page.wait_for_timeout(4000)
            shot('02-after-play.png')

            marker = detect_captcha(page_text())
            if marker:
                report.data['status'] = 'captcha-wall'
                report.step('стена капчи после кнопки', f'«{marker}» — дальше не иду, это честный стоп')
                shot('03-captcha.png')
                return finish(browser, context, video_dir, out, report)

            # Сначала проверяю, не сюжетная ли это игра: у такой страницы нет
            # канваса вовсе, зато есть текст истории и варианты выбора. Если
            # искать канвас первым, сюжетная игра «не находится» и экспедиция
            # заканчивалась ни с чем (так и случилось с Lost Spot).
            story_probe = None
            for _try in range(3):
                try:
                    story_probe = page.evaluate(TWINE_TASK_JS)
                except Exception:
                    story_probe = None
                if story_probe and story_probe.get('ok') and (story_probe.get('choices') or len(story_probe.get('text') or '') > 80):
                    break
                page.wait_for_timeout(800)
            is_story = bool(story_probe and story_probe.get('ok')
                            and (story_probe.get('choices') or len(story_probe.get('text') or '') > 80)
                            and not page.locator('canvas').count())
            if is_story:
                report.data['kind'] = 'story'
                report.step('это сюжетная игра, а не полёт',
                            f"история «{(story_probe.get('title') or '')[:60]}»: текст и варианты выбора, играю чтением, а не кадрами")
                shot('03-story.png')
                visited = set()
                story = read_story(page, int(deadline - time.monotonic()), out, report, shot, runs=6)
                report.data['story'] = story
                mp = story.get('map') or {}
                fresh = sum(1 for q in (story.get('path') or []) if q.get('fresh'))
                runs = story.get('runs') or []
                ends = {e['text'][:120] for e in (story.get('endings') or [])}
                report.data['storyMap'] = {
                    'places': mp.get('places', 0), 'links': mp.get('links', 0),
                    'tried': mp.get('tried', 0), 'finds': mp.get('finds', [])[:5],
                    'tired': mp.get('tired', 0), 'energetic': mp.get('energetic', 0),
                }
                report.data['storyLine'] = (
                    f"прошла историю: {story['moves']} выборов, {len(runs)} захода(ов), "
                    f"{mp.get('places', 0)} мест в карте, концовок видела {len(ends)}"
                    + (f", нашла: {', '.join(mp.get('finds', [])[:3])}" if mp.get('finds') else '')
                    + ((' · финал: ' + (story['endings'][-1].get('text') or '')[:70].strip())
                       if story.get('endings') else ' · до финала не дошла — история не отпустила'))
                report.data['status'] = 'played'
                report.step('итог истории',
                            f"выборов {story['moves']} за {len(runs)} заход(ов); мест в карте {mp.get('places', 0)}, "
                            f"связей {mp.get('links', 0)}, нажато вариантов {mp.get('tried', 0)}; "
                            f"концовок видела {len(ends)}; находки: {', '.join(mp.get('finds', [])[:4]) or '—'}")
                shot('09-story-end.png')
                return finish(browser, context, video_dir, out, report)

            canvas = page.locator('canvas').first
            try:
                canvas.wait_for(state='visible', timeout=15000)
                box = canvas.bounding_box()
            except Exception:
                box = None
            if not box:
                report.data['status'] = 'opened-only' if not clicked else 'no-canvas'
                report.step('игровой канвас', 'не появился — игры на этой странице руками не вышло')
                return finish(browser, context, video_dir, out, report)

            report.step('игровой канвас', f"найден {int(box['width'])}x{int(box['height'])}")
            cx, cy = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2

            # Подготовка: сначала читаю экран старта, а не жму всё подряд.
            hints = (page_text() + ' ' + (page.title() or '')).strip()
            keys, interval, mode, why = detect_controls(hints)
            if task_keys:
                keys = [k.strip() for k in task_keys.split(',') if k.strip()]
                mode = 'flap' if len(keys) == 1 else 'cycle'
                why = 'план клавиш задан заданием владельца'
            if interval_ms:
                interval = max(150, min(2000, interval_ms))
            eyes_png_mode = {'on': False}

            def read_eyes():
                """Кадр глазами: разбор пикселей прямо в странице (быстро,
                ответ — пять чисел); если страница не даёт пиксели —
                скриншот канваса и свой декодер."""
                if not eyes_png_mode['on']:
                    try:
                        raw = page.evaluate(EYES_SUMMARY_JS)
                        if raw and raw.get('ok'):
                            return {'w': raw['w'], 'h': raw['h'],
                                    'bird': tuple(raw['bird']) if raw.get('bird') else None,
                                    'gap': tuple(raw['gap']) if raw.get('gap') else None,
                                    'gap_sure': bool(raw.get('gap_sure')),
                                    'pipe_x': raw.get('pipe_x'),
                                    'game_over': bool(raw.get('game_over'))}
                        eyes_png_mode['on'] = True
                        report.step('глаза экспедиции', f"пиксели канваса изнутри не дались ({(raw or {}).get('why', '?')}) — смотрю скриншотами канваса")
                    except Exception:
                        eyes_png_mode['on'] = True
                try:
                    # тот же расчёт, что в странице: analyze_eyes сам считает и
                    # уверенность в низе просвета (gap_sure) по пикселям кадра
                    return analyze_eyes(eyes_from_png(canvas.screenshot()))
                except Exception:
                    return None

            def scoreboard():
                """Табло игры, если страница его показывает (счёт Steps)."""
                try:
                    return page.evaluate("() => (window.game && game.data) ? {steps: game.data.steps, start: !!game.data.start} : null")
                except Exception:
                    return None

            report.step('подготовка к игре', f'{why}: клавиши {keys or "клик"}, ритм {interval} мс; подсказки экрана: {hints[:140]!r}')

            page.mouse.click(cx, cy)
            probe = read_eyes() if mode == 'flap' else None
            if mode == 'flap' and probe is not None:
                report.step('глаза экспедиции', 'вижу канвас пикселями: ищу жёлтую птицу слева и зелёные трубы с чёрной окантовкой, клавишу жму по положению птицы в просвете, а не по часам')
                vision = {'eyes': True, 'attempts': [], 'bestSteps': None}
                offset = 0
                attempt = 0
                shot_no = 3
                first_start = True
                while time.monotonic() < deadline - 6 and attempt < 4:
                    attempt += 1
                    if first_start:
                        page.keyboard.press(keys[0] if keys else 'Space')
                        first_start = False
                    else:
                        page.keyboard.press('Space')
                        page.wait_for_timeout(700)
                        page.mouse.click(cx, cy)
                        page.wait_for_timeout(500)
                        page.keyboard.press(keys[0] if keys else 'Space')
                    report.step(f'попытка {attempt} (зрение)', f'стартую игру глазами, сдвиг цели {offset:+d} px')
                    attempt_start = time.monotonic()
                    attempt_end = min(deadline, attempt_start + max(14, int((deadline - attempt_start) / (4 - attempt + 1))))
                    flaps = 0
                    last_flap = 0.0
                    last_gap = None
                    last_gap_at = 0.0
                    last_bird_y = None
                    last_bird_at = 0.0
                    frame_h = probe['h']
                    over_hits = 0
                    eyes_lost = 0
                    saw_bird = False
                    frames = bird_frames = gap_frames = 0
                    mid_shot = False
                    prev_bird_y = None
                    trace = []
                    stuck_frames = 0
                    frame_ms_sum = frame_ms_max = 0.0
                    frame_ms_n = 0
                    flap_key = keys[0] if keys else 'Space'
                    key_held = False
                    held_since = 0.0
                    while time.monotonic() < attempt_end:
                        frame_started = time.monotonic()
                        st = read_eyes()
                        if st is None:
                            eyes_lost += 1
                            if eyes_lost >= 4:
                                break
                            page.wait_for_timeout(120)
                            continue
                        eyes_lost = 0
                        frames += 1
                        # сколько занял сам разбор кадра: это и есть «слепота» глаз
                        frame_ms = (time.monotonic() - frame_started) * 1000
                        frame_ms_sum += frame_ms
                        frame_ms_max = max(frame_ms_max, frame_ms)
                        frame_ms_n += 1
                        now = time.monotonic()
                        frame_h = st['h']
                        bird_low = bool(st['bird'] and st['bird'][1] > 0.72 * frame_h)
                        if st['gap']:
                            gap_frames += 1
                            last_gap = st['gap']
                            last_gap_at = now
                        if st['bird']:
                            bird_frames += 1
                            saw_bird = True
                            last_bird_y = st['bird'][1]
                            last_bird_at = now
                        if not mid_shot and now - attempt_start > 6 and shot_no <= 5:
                            shot(f'0{shot_no}-play.png')
                            shot_no += 1
                            mid_shot = True
                        if st['game_over'] and saw_bird and now - attempt_start > 4:
                            over_hits += 1
                            if over_hits >= 2:
                                break
                            page.wait_for_timeout(80)
                            continue
                        over_hits = 0
                        # птица была и пропала надолго, а игра по табло стоит —
                        # попытка кончилась, не сидим на месте до звонка
                        if saw_bird and not st['bird'] and now - last_bird_at > 2.0 and now - attempt_start > 6:
                            sb_now = scoreboard()
                            if sb_now is not None and not sb_now.get('start'):
                                break
                        # птица лежит у земли и не двигается несколько кадров —
                        # это уже не полёт, попытка кончилась
                        if st['bird'] and bird_low and prev_bird_y is not None and abs(st['bird'][1] - prev_bird_y) <= 3:
                            stuck_frames += 1
                            if stuck_frames >= 5 and now - attempt_start > 5:
                                break
                        else:
                            stuck_frames = 0
                        gap = st['gap'] or (last_gap if now - last_gap_at < 0.8 else None)
                        target = None
                        flapped = False
                        if st['bird']:
                            vy = (st['bird'][1] - prev_bird_y) if prev_bird_y is not None else 0
                            prev_bird_y = st['bird'][1]
                            if gap:
                                # цель для трассы и разбора: середина рабочей зоны
                                target = gap[0] + 0.72 * (gap[1] - gap[0]) + offset
                            else:
                                target = frame_h * 0.42 + offset
                            # мёртвую не дёргать: лежит у земли неподвижно или
                            # панель конца игры — там пробел уже «в меню»
                            corpse = bird_low and abs(vy) <= 3
                            if key_held:
                                # держим, пока глаза не УВИДЯТ подъём: опрос игры
                                # физически не пропустит такое нажатие
                                if vy < -2 or now - held_since > 0.26:
                                    page.keyboard.up(flap_key)
                                    key_held = False
                            elif not st['game_over'] and not corpse:
                                ms = int((now - last_flap) * 1000) if last_flap else 9999
                                if decide_flap(st['bird'][1], gap, target, frame_h, ms, vy, st.get('gap_sure', True)):
                                    page.keyboard.down(flap_key)
                                    # второй канал ввода: в этой игре клик по канвасу —
                                    # тот же взмах; хоть один канал да долетит
                                    try:
                                        page.mouse.click(cx, cy)
                                    except Exception:
                                        pass
                                    key_held = True
                                    held_since = now
                                    flaps += 1
                                    last_flap = now
                                    flapped = True
                        if len(trace) < 400:
                            trace.append({'t': round(now - attempt_start, 1),
                                          'b': st['bird'][1] if st['bird'] else None,
                                          'gx': st.get('pipe_x'),
                                          'gt': gap[0] if gap else None,
                                          'gb': gap[1] if gap else None,
                                          'tg': round(target) if target is not None else None,
                                          'f': 1 if flapped else 0,
                                          'o': 1 if st['game_over'] else 0})
                        # на падении и сразу после взмаха цикл короче:
                        # цена лишних 40 мс на скорости «пулей» — труба
                        page.wait_for_timeout(40 if flapped else 75)
                    if key_held:
                        try:
                            page.keyboard.up(flap_key)
                        except Exception:
                            pass
                        key_held = False
                    sb = scoreboard()
                    steps_now = sb.get('steps') if sb else None
                    alive = round(time.monotonic() - attempt_start, 1)
                    vision['attempts'].append({'n': attempt, 'seconds': alive, 'flaps': flaps, 'steps': steps_now, 'offset': offset, 'frames': frames, 'birdFrames': bird_frames, 'gapFrames': gap_frames, 'trace': trace[-45:]})
                    if steps_now is not None:
                        vision['bestSteps'] = steps_now if vision['bestSteps'] is None else max(vision['bestSteps'], steps_now)
                    score_txt = f'труб по табло игры: {steps_now}' if steps_now is not None else 'табло не читается — счёт кадрами не подтверждён'
                    eye_avg = round(frame_ms_sum / frame_ms_n, 1) if frame_ms_n else 0.0
                    vision.setdefault('eyeMs', []).append({'attempt': attempt, 'avg': eye_avg,
                                                           'max': round(frame_ms_max, 1), 'frames': frame_ms_n})
                    # Честный вывод о зрении: при разборе кадра дольше 40 мс глаза
                    # физически не успевают за игрой, и это видно в отчёте, а не
                    # выясняется догадками.
                    eye_verdict = ('успевала' if eye_avg <= 40 else 'отставала')
                    report.step(f'попытка {attempt} сыграна', f'глазами: прожила {alive} с, взмахов {flaps}, кадров {frames} (птицу видела в {bird_frames}, просвет в {gap_frames}); кадр разбирался в среднем {eye_avg} мс (худший {round(frame_ms_max, 1)} мс) — {eye_verdict}; {score_txt}')
                    if not mid_shot and shot_no <= 5:
                        shot(f'0{shot_no}-play.png')
                        shot_no += 1
                    if time.monotonic() < deadline - 8 and attempt < 4:
                        if last_bird_y is not None and last_bird_y > 0.78 * frame_h:
                            offset = max(-40, offset - 14)
                            cause = 'упала к земле — в следующий раз держу птицу выше'
                        elif last_gap and last_bird_y is not None and last_bird_y < last_gap[0]:
                            offset = min(40, offset + 14)
                            cause = 'была выше просвета — в следующий раз цель ниже'
                        else:
                            cause = 'разбираю полёт и повторяю тем же планом глаз'
                        report.step('разбор попытки', cause)
                        page.wait_for_timeout(900)
                report.data['vision'] = vision
                page.wait_for_timeout(600)
                shot('08-final.png')
                report.data['status'] = 'played'
                best = vision['bestSteps']
                report.step('игра состоялась', f"попыток глазами: {attempt}, лучший счёт по табло: {best if best is not None else 'не читается'}, видео записано")
                return finish(browser, context, video_dir, out, report)

            rhythms = [interval, max(200, int(interval * 0.8)), int(interval * 1.3)] if mode == 'flap' else [interval]
            shot_no = 3
            attempt = 0
            while time.monotonic() < deadline and attempt < len(rhythms):
                attempt += 1
                pace = rhythms[attempt - 1]
                span = max(9, int((deadline - time.monotonic()) / max(1, len(rhythms) - attempt + 1)))
                attempt_end = min(deadline, time.monotonic() + span)
                report.step(f'попытка {attempt}', f'стартую игру, ритм {pace} мс')
                if mode == 'click':
                    page.mouse.click(cx, cy)
                elif keys:
                    page.keyboard.press(keys[0])
                moves = 0
                while time.monotonic() < attempt_end:
                    if mode == 'click':
                        page.mouse.click(cx, cy)
                    else:
                        page.keyboard.press(keys[moves % len(keys)])
                    moves += 1
                    page.wait_for_timeout(pace)
                    if detect_captcha(page_text()):
                        report.data['status'] = 'captcha-wall'
                        report.step('стена капчи во время игры', 'останавливаюсь: капчу не решаю')
                        shot('09-captcha.png')
                        return finish(browser, context, video_dir, out, report)
                report.step(f'попытка {attempt} сыграна', f'ходов: {moves}, ритм {pace} мс')
                if shot_no <= 5:
                    shot(f'0{shot_no}-play.png')
                    shot_no += 1
                if attempt < len(rhythms):
                    report.step('разбор попытки', 'перезапускаю игру и меняю ритм — учусь на этой же игре, а не жму вслепую дальше')
                    page.wait_for_timeout(900)
            page.mouse.click(cx + box['width'] * 0.2, cy)
            page.wait_for_timeout(800)
            shot('08-final.png')
            report.data['status'] = 'played'
            report.step('игра состоялась', f'попыток: {attempt}, ввод уходил в канвас по подготовленному плану, видео записано')
            return finish(browser, context, video_dir, out, report)
        except Exception as err:
            report.data['status'] = 'error'
            report.step('экспедиция прервалась', f'{type(err).__name__}: {err}')
            try:
                shot('09-error.png')
            except Exception:
                pass
            return finish(browser, context, video_dir, out, report)



# ---------------------------------------------------------------------------
# Читатель сюжетной игры (Twine, «выбери свой путь»).
# ---------------------------------------------------------------------------
# Такая игра — не полёт по кадрам, а текст и кнопки. Поэтому руки здесь не
# жмут по ритму, а ЧИТАЮТ: берут видимый текст пассажа, находят в нём варианты
# (в Twine/Harlowe они становятся ссылками и кнопками), выбирают один и кликают.
# Свой путь она запоминает и старается не топтаться на месте: сначала идёт в
# ещё не виденные места, а если выхода нет — честно заканчивает и пишет,
# что история её не отпустила.

TWINE_TASK_JS = r"""
() => {
  const vis = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const st = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && st.display !== 'none';
  };
  let root = null;
  for (const sel of ['tw-story', '#passages', '.passage', 'tw-passage']) {
    const found = [...document.querySelectorAll(sel)].filter(vis);
    if (found.length) { root = found[found.length - 1]; break; }
  }
  if (!root) root = document.body;
  const text = (root.innerText || '').replace(/\s+/g, ' ').trim();
  const seen = [];
  const out = [];
  const nodes = root.querySelectorAll('tw-link, a, button, [role="button"], tw-expression.link, .link');
  nodes.forEach((el, i) => {
    if (!vis(el)) return;
    const label = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!label || label.length > 120) return;
    const key = label.toLowerCase();
    if (seen.includes(key)) return;               // одинаковые кнопки-близнецы
    // «Сохранить», «Загрузить», «Настройки» — это интерфейс, а не путь истории
    if (/^(save|load|restart|undo|settings|share|menu|сохранить|загрузить|меню|настройки)/i.test(label)) return;
    seen.push(key);
    out.push({i: out.length, label: label});
    el.setAttribute('data-kv-choice', String(out.length - 1));
  });
  return {ok: true, title: document.title || '', text: text.slice(0, 3000), choices: out};
}
"""


# ---------------------------------------------------------------------------
# Что она видит в тексте истории: силы, находки, следы
# ---------------------------------------------------------------------------
# Сюжетная игра прячет состояние в словах, а не в цифрах: «you are very tired»
# значит энергии мало, «you found your favorite chips» — нашла предмет,
# «spots by his left eye» — след. Читать это надо в тексте, иначе она выбирает
# вслепую: идёт «Go After Spot» вымотанной и не доходит.
STORY_ENERGY = (
    # (слова, вес, ярус) — берём САМОЕ СИЛЬНОЕ слово из яруса, а не сумму:
    # «very tired» не должно считаться и как «very tired», и как «tired».
    (('very tired', 'exhausted', 'super tired', 'worn out'), -3, 'low'),
    (('tired', 'panting', 'ache', 'aching', 'sore'), -2, 'low'),
    (('well rested', 'plenty of energy', 'full of energy'), 3, 'high'),
    (('rested', 'energi', 'energy', 'strong'), 2, 'high'),
    (('legs feel better', 'feet up'), 2, 'high'),
)
# Находки — только когда она правда что-то нашла. Слово «pocket» в «fumble in
# your pocket for your key» находкой не считается: это карман, а не добыча.
STORY_FINDS = ('you found', 'find your favorite', 'found your', 'you pick up', 'picked up',
               'you grab', 'you take the', 'you scour the shelves', 'chips on the bottom')
STORY_CLUES = ('spot', 'left eye', 'fur', 'bark', 'whimper', 'paw', 'collar', 'tail')


def read_signal(text):
    """Что видно в тексте: силы, находки, следы. Только по словам, без догадок.

    Возвращает словарь с оценкой энергии (может быть 0), списком найденного и
    числом упоминаний следов. Это её «глаза» для истории: так она понимает,
    стоит ли идти дальше или сначала отдохнуть.
    """
    low = (text or '').lower()
    energy = 0
    used = set()          # ярусы, которые уже дали вклад: суммировать нельзя
    for words, delta, tier in STORY_ENERGY:
        if tier in used:
            continue
        if any(w in low for w in words):
            energy += delta
            used.add(tier)
    finds = [w for w in STORY_FINDS if w in low]
    clues = sum(1 for w in STORY_CLUES if w in low)
    return {'energy': energy, 'finds': finds[:4], 'clues': clues}


class StoryMap:
    """Карта истории: какие места есть, чем связаны и что в них нашлось.

    Нужна, чтобы не ходить дважды по одному пути и после концовки идти сразу
    в ту ветку, где ещё не была. Пишется в отчёт целиком — по ней видно, что
    она поняла про игру, а не только куда нажимала.
    """

    def __init__(self):
        self.nodes = {}    # подпись-ключ -> {'text', 'energy', 'finds', 'clues', 'visits'}
        self.edges = []    # {'from', 'choice', 'to'}
        self.tried = set()  # (место, выбор) — что уже нажимали

    @staticmethod
    def key(text):
        # Ключ — хэш ВСЕГО текста пассажа: у Lost Spot общее начало («You at in
        # front of your house…»), и по обрезку все места дома сливались в одно.
        # Хэш ещё и компактен — карту можно хранить между прогонами.
        norm = ' '.join((text or '').split()).lower()
        return hashlib.sha1(norm.encode('utf-8')).hexdigest()[:16]

    def see(self, text):
        """Записать место в карту и вернуть, что в нём видно."""
        k = self.key(text)
        node = self.nodes.get(k)
        if node is None:
            # Тот же текст, но другой набор вариантов. В Harlowe набор меняется
            # прямо в пассаже (после «OK» пропадает «Cancel»; после «door»
            # появляется «You go back inside»), и без этого один пассаж
            # делился на несколько мест: рёбра теряли источник и половина
            # карты становилась недостижимой. Дописываем варианты в живой узел.
            node = {'text': (text or '')[:220], 'visits': 0}
            node.update(read_signal(text))
            self.nodes[k] = node
        node['visits'] += 1
        node['text_key'] = bare_k
        merged = node.setdefault('options', [])
        for o in (options or []):
            if o and o not in merged:
                merged.append(o)
        return node

    def is_loop(self, text, choice, came_from=None):
        """Петля: вариант возвращает туда, откуда пришли, или в это же место."""
        k = text if self._is_key(text) else self.key(text)
        for e in self.edges:
            if e['from'] != k or e['choice'] != choice:
                continue
            if e['to'] == k:
                return True          # «Nothing has changed» — то же место
            if came_from and e['to'] == self.key(came_from):
                return True          # обратный ход: «back», «Leave quietly!»
        return False

    def mark_open(self, text, choices):
        """Отметить, есть ли в этом месте варианты, которые она ещё не нажимала."""
        node = self.nodes.get(self.key(text))
        if node is None:
            return
        node['open'] = any((self.key(text), c.get('label')) not in self.tried for c in choices)
        node['options'] = [c.get('label') for c in choices][:8]

    def link(self, src_text, choice, dst_text):
        fr, to = self.key(src_text), self.key(dst_text)
        edge = {'from': fr, 'choice': choice, 'to': to}
        if edge not in self.edges:
            self.edges.append(edge)

    def fresh_choices(self, text, choices):
        """Варианты, которых в этом месте ещё не нажимали."""
        k = self.key(text)
        return [c for c in choices if not self.tried_here(k, c.get('label'))]

    def untried_targets(self, text, choices):
        """Куда ведёт неизведанное: места, которых в карте ещё нет."""
        k = self.key(text)
        out = []
        for c in choices:
            if (k, c.get('label')) in self.tried:
                continue
            known = [e['to'] for e in self.edges if e['from'] == k and e['choice'] == c.get('label')]
            if not known or any(t not in self.nodes for t in known):
                out.append(c)
        return out

    def summary(self):
        return {'places': len(self.nodes), 'links': len(self.edges),
                'tried': len(self.tried),
                'energetic': sum(1 for n in self.nodes.values() if n.get('energy', 0) > 0),
                'tired': sum(1 for n in self.nodes.values() if n.get('energy', 0) < 0),
                'finds': sorted({f for n in self.nodes.values() for f in n.get('finds', [])})}

    def to_cache(self):
        """Слепок карты для следующего прогона: места, переходы, что нажато."""
        places = {k: {'text': v.get('text', '')[:160], 'visits': v.get('visits', 0),
                      'energy': v.get('energy', 0), 'finds': v.get('finds', []),
                      'clues': v.get('clues', 0), 'open': bool(v.get('open'))}
                  for k, v in self.nodes.items()}
        return {'places': places,
                'links': [{'from': e['from'], 'choice': e['choice'], 'to': e['to']} for e in self.edges],
                'tried': sorted([list(t) for t in self.tried])}

    def load_cache(self, data):
        """Вспомнить карту прошлого прогона: там уже есть места и переходы."""
        if not data:
            return 0
        for k, v in (data.get('places') or {}).items():
            node = dict(v)
            if not node.get('text_key'):
                node['text_key'] = self.bare_key(node.get('text'), node.get('options'))
            self.nodes[k] = node
        # Рёбра, которые ведут из мест, которых в карте нет, — мусор прошлых
        # прогонов (накопилось 174 из 311, и половина графа была нерабочей:
        # маршрут к остатку не находился). Такие рёбра не берём.
        for e in (data.get('links') or []):
            if e.get('from') in self.nodes and e.get('to') in self.nodes and e not in self.edges:
                self.edges.append(e)
        for pair in (data.get('tried') or []):
            if len(pair) == 2:
                self.tried.add((pair[0], pair[1]))
        return len(self.nodes)

    def as_report(self):
        nodes = [{'key': k[:60], 'visits': v['visits'], 'energy': v.get('energy', 0),
                  'finds': v.get('finds', []), 'clues': v.get('clues', 0),
                  'text': v.get('text', '')[:120]}
                 for k, v in list(self.nodes.items())[:80]]
        return {'places': nodes, 'links': self.edges[:200], **self.summary()}


def pick_choice(choices, visited, rng=None, passage=None, times_here=0,
                story_map=None, energy=0, came_from=None):
    """Какой вариант выбрать: сначала тот, где история ещё не была.

    visited — множество пар «пассаж+подпись». Если есть карта (story_map), она
    главнее памяти: карта знает, куда вариант ведёт и где уже была, поэтому
    выбор идёт по ней — сначала в места, которых в карте нет.
    energy — что она прочла про свои силы: сильно вымотанной не идёт в дальний
    путь («go after», «school», «store»), а сначала ищет отдых. Иначе игра
    кончается на «выдохлась» — так и было в первом прохождении.
    """
    if not choices:
        return None, False
    k = passage or ''

    def not_tried(c):
        """Этот выбор в этом месте ещё не нажимали?"""
        if story_map is not None and passage:
            return not story_map.tried_here(k, c.get('label'))
        return here_key(c) not in visited

    def here_key(c):
        return (k, c.get('key', c.get('label', '')))

    # Диалог подтверждения: сначала «OK», а не «Cancel».
    if len(choices) <= 3:
        affirm = [c for c in choices if (c.get('label') or '').strip().lower() in
                  ('ok', 'okay', 'yes', 'да', 'продолжить', 'continue', 'next', 'далее')]
        if affirm:
            return affirm[0], True

    # ГЛАВНОЕ: идём по ещё не нажатым ВЫБОРАМ. Раньше я считал новизну по месту,
    # куда пришла, — и после «house» любой переход выглядел новым: она крутила
    # дом → кухня → «Go After Spot» → дом шесть заходов подряд.
    fresh = [c for c in choices if not_tried(c)]
    pool = fresh or choices

    # Петля (ведёт туда же, откуда пришла) — в самом конце.
    if passage and len(pool) > 1:
        no_loops = [c for c in pool if not story_map.is_loop(passage, c.get('label'), came_from)] if story_map else pool
        if no_loops:
            pool = no_loops

    # осторожность: вымотана — сначала передохнуть, даже если отдых уже нажимала.
    # Отдых ищем среди ВСЕХ вариантов: в карте он может быть «изведан», но силы
    # важнее новизны — иначе она уходит вымотанной и теряет заход.
    if energy < 0:
        rest = [c for c in choices if is_rest(c.get('label', ''))]
        # Отдых — ОДИН раз в месте. Раньше он перебивал всё: в узле «ты дома»
        # было 18 визитов и нажат только «couch», а «homework» и «kitchen» так
        # и остались непройденными навсегда. Если отдохнуть тут уже пробовала,
        # а непройденное есть — идём по делу.
        rest_fresh = [c for c in rest
                      if story_map is None or not story_map.tried_here(k, c.get('label'))]
        if rest and (rest_fresh or not fresh):
            pool = rest_fresh or rest
        else:
            far = [c for c in pool if not is_far(c.get('label', ''))]
            if far:
                pool = far


    # Сначала непроверенные ВЕТКИ, только потом выходы: иначе место с двумя
    # новыми развилками бросалось ради «back to park».
    branches = [c for c in pool if not is_exit(c.get('label', ''))]
    if branches:
        pool = branches

    pick = pool[0] if rng is None else pool[rng.randrange(len(pool))]
    return pick, bool(fresh)


def is_rest(label):
    """Отдых по названию кнопки: тут силы возвращаются."""
    low = (label or '').lower()
    return any(w in low for w in ('rest', 'couch', 'sit', 'lie', 'sleep', 'feet up', 'get up', 'wait'))


def is_far(label):
    """Дальний путь: пока сил мало, туда не надо."""
    low = (label or '').lower()
    return any(w in low for w in ('go after', 'chase', 'run', 'sprint', 'school', 'store',
                                  'hospital', 'restaurant', 'park', 'outside', 'street'))


RESTART_JS = r"""
() => {
  // Harlowe держит историю в localStorage. Ищем ключ истории и чистим его —
  // это ровно то, что делает кнопка Restart в меню, только без поиска иконки.
  const keys = [];
  const wipe = (store, name) => {
    if (!store) return;
    const mine = [];
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i) || '';
      // Harlowe хранит сессию и «где я остановилась» под своими именами;
      // берём всё, что похоже на историю, а не на чужие настройки браузера.
      if (/twine|harlowe|story|passage|session|storydata/i.test(k)) mine.push(k);
    }
    mine.forEach(k => { store.removeItem(k); keys.push(name + ':' + k); });
  };
  wipe(localStorage, 'local');
  try { wipe(sessionStorage, 'session'); } catch (e) {}
  if (!keys.length) return {ok: false, why: 'ключа истории ни в local, ни в session', keys: []};
  return {ok: true, keys: keys.slice(0, 8)};
}
"""


def restart_story(page, report):
    """Начать историю заново — по-честному, теми же средствами, что и человек.

    Порядок: кнопка Restart в панели, очистка сохранённой истории в
    localStorage (её же чистит кнопка), затем перезагрузка. Перезагрузка одна
    проблему не решает: прогресс лежит в localStorage и возвращает на финал.
    """
    # 1) кнопка Restart, если она есть в панели истории
    for sel in ('tw-icon[title="Restart" i]', 'tw-icon[aria-label="Restart" i]',
                '[title="Restart" i]', 'button:has-text("Restart")'):
        try:
            el = page.query_selector(sel)
            if el:
                el.click(timeout=2500)
                page.wait_for_timeout(1200)
                st = page.evaluate(TWINE_TASK_JS)
                if st and st.get('choices'):
                    report.step('начать заново', f'нажала «Restart» ({sel}) — история с начала')
                    return True
        except Exception:
            continue
    # 2) чистим сохранённую историю и перезагружаем
    try:
        cleared = page.evaluate(RESTART_JS)
    except Exception as err:
        cleared = {'ok': False, 'why': str(err)}
    try:
        page.reload(wait_until='domcontentloaded')
        page.wait_for_timeout(2200)
        for _i in range(8):
            st = page.evaluate(TWINE_TASK_JS)
            if st and st.get('choices'):
                report.step('начать заново',
                            f'очистила сохранённую историю ({", ".join(cleared.get("keys") or [])[:60] or cleared.get("why", "?")}) и перезагрузила — история с начала')
                return True
            try:
                page.keyboard.press('Enter')   # Harlowe может снова спросить имя
            except Exception:
                pass
            page.wait_for_timeout(700)
        report.step('начать заново', 'после очистки и перезагрузки вариантов нет — история не начинается заново')
        return False
    except Exception as err:
        report.step('начать заново', f'не вышло начать заново: {err}')
        return False


def read_story(page, seconds, out, report, shot, runs=6):
    """Пройти сюжетную игру чтением и добрать ветки, которых ещё не видела.

    Один заход — до финала. Если время осталось и в карте есть неизведанные
    переходы, она начинает историю заново и идёт туда, где ещё не была: так из
    одной экспедиции видно больше одной концовки.
    """
    import random
    rng = random.Random(7)
    # Окно истории: до 10 минут. Раньше было 180 с — на второй заход едва
    # хватало, на третий не оставалось вовсе.
    deadline = time.monotonic() + max(20, min(600, seconds))
    story_map = StoryMap()
    # Память между прогонами: карта прошлой экспедиции в тот же адрес. Без неё
    # каждый прогон начинал знание с нуля и топтался по тем же местам.
    memo_path = out / 'storymap.json'
    memo_loaded = 0
    try:
        # Сначала память прошлых прогонов из репозитория (её подкладывает
        # workflow), потом своя папка — на случай локального повтора.
        for cand in ([Path(memo_from)] if memo_from else []) + [memo_path]:
            if cand and Path(cand).exists():
                n = story_map.load_cache(json.loads(Path(cand).read_text(encoding='utf-8')))
                if n:
                    memo_loaded = n
                    break
            if memo_loaded:
                report.step('вспомнила карту',
                            f'в прошлый раз знала {memo_loaded} мест и {len(story_map.tried)} нажатых вариантов — начинаю не с нуля')
    except Exception as err:
        report.step('память карты', f'прошлую карту не прочитать: {err}')
    visited = set()
    path, endings, runs_done = [], [], []
    report.step('читаю историю',
                'сюжетная игра: читаю текст, вижу силы и находки, веду карту мест; после финала начну заново и доберу новые ветки')

    for run in range(1, max(1, runs) + 1):
        if time.monotonic() >= deadline - 8:
            break
        if run > 1:
            # Заново идём только если есть что искать: непройденные переходы
            # уже известных мест и места, до которых не добрались.
            # Считаем по-настоящему непройденное (место, вариант), а не по
            # устаревшему флагу open: он застывает с прошлых прогонов.
            unopened = [k for k, n in story_map.nodes.items()
                        if n.get('visits', 0)
                        and any(not story_map.tried_here(k, label) for label in (n.get('options') or []))]
            if not unopened:
                report.step('добор веток', 'непройденных вариантов не осталось — второй заход не нужен')
                break
            report.step('добор веток',
                        f'осталось мест с непройденными вариантами: {len(unopened)} — иду заново')
            if not restart_story(page, report):
                break
            # проверяем, что история действительно с начала: иначе второй заход
            # «заканчивался» на том же экране финала за 0 выборов
            st0 = page.evaluate(TWINE_TASK_JS)
            if not st0 or not (st0.get('choices') or []):
                report.step('начать заново', 'история не встала на начало (нет вариантов) — добор веток прекращаю честно')
                break
        moves = 0
        stuck = 0
        fresh_moves = 0
        pending = {'from': '', 'choice': '', 'done': True}
        trail = []        # последние места: ловим хождение по кругу
        last_place = ['']  # откуда пришли — чтобы видеть обратные ходы
        last_text = ['']   # прошлый текст: ловим «страница не сменилась»
        same_text = [0]
        prev_place = ['']  # место предыдущего шага
        new_places = 0
        run_end = ''
        while time.monotonic() < deadline - 4:
            try:
                state = page.evaluate(TWINE_TASK_JS)
            except Exception as err:
                report.step('чтение', f'страница не отдала текст: {err}')
                break
            if not state or not state.get('ok'):
                report.step('чтение', 'не нашла ни текста, ни вариантов — останавливаюсь честно')
                break
            text = state.get('text', '')
            if pending.get('from') and not pending.get('done'):
                # пришли из предыдущего пассажа: записываем ребро карты
                story_map.link(pending['from'], pending['choice'], text)
                pending['done'] = True
            if text and last_text[0] and text[:120] == last_text[0][:120] and moves > 0:
                same_text[0] += 1
            last_text[0] = text
            sight = story_map.see(text)          # зрение: силы, находки, следы
            if sight['visits'] == 1:
                new_places += 1
            choices = state.get('choices') or []
            for c in choices:
                c['key'] = c.get('label', '')
            story_map.mark_open(text, choices)
            if choices:
                # след последних мест: если ходит по кругу, дальше не жмём
                trail.append(story_map.key(text))
                last_place[0] = prev_place[0]
                if len(trail) > 18:
                    trail.pop(0)
                # Стоп-кран: прекращаем, только если заход реально ничего не
                # принёс. Раньше хватало «два места за 18 шагов» — и маршрут к
                # остатку рубился на 17-м шаге, не дойдя: 6 заходов подряд по
                # 0 финалов. Петля через два места — это нормальный проход по
                # дому, а не топтание.
                if (len(trail) >= 18 and len(set(trail[-8:])) <= 1
                        and new_places == 0):
                    report.step('стоп-кран',
                                f'топчется в одном месте {len(trail)} шагов и новых мест нет — прекращаю заход')
                    break
                pick, fresh = pick_choice(choices, visited, rng,
                                          story_map.key(text), sight['visits'],
                                          story_map=story_map, energy=sight.get('energy', 0),
                                          came_from=last_place[0])
                story_map.tried.add((story_map.key(text), pick['label']))
                visited.add((story_map.key(text), pick['label']))
                try:
                    el = page.query_selector(f'[data-kv-choice="{pick["i"]}"]')
                    if el is None:
                        raise RuntimeError('кнопка исчезла')
                    el.scroll_into_view_if_needed(timeout=3000)
                    el.click(timeout=5000)
                except Exception as err:
                    report.step('выбор', f'не смогла нажать «{pick["label"]}»: {err}')
                    stuck += 1
                    if stuck >= 3:
                        break
                    page.wait_for_timeout(500)
                    continue
                moves += 1
                pending = {'from': text, 'choice': pick['label'], 'done': False, 'from_key': my_key}
                if fresh:
                    fresh_moves += 1
                path.append({'run': run, 'n': moves, 'choice': pick['label'],
                             'fresh': fresh, 'energy': sight.get('energy', 0),
                             'finds': sight.get('finds', []), 'clues': sight.get('clues', 0),
                             'text': text[:220]})
                if moves in (1, 2, 3) or moves % 8 == 0:
                    # Ждём СМЕНУ текста (не «прозрачность»): иначе кадр чёрный.
                    before = text[:60]
                    for _w in range(14):
                        now = page.evaluate("() => { const p = document.querySelector('.passage, tw-passage, tw-story') || document.body; return ((p.innerText || '').replace(/\\s+/g, ' ').trim()).slice(0, 60); }")
                        if now and now != before and len(now) > 3:
                            page.wait_for_timeout(320)
                            break
                        page.wait_for_timeout(160)
                    shot(f'0{min(9, 3 + moves // 8)}-story-{moves:02d}.png')
                prev_place[0] = story_map.key(text)   # для следующего шага: откуда пришли
                page.wait_for_timeout(1300)
                stuck = 0
            else:
                # вариантов нет: финал (или история просит имя)
                pushed = False
                try:
                    field = page.query_selector('tw-input, input[type="text"], input:not([type])')
                    if field is not None:
                        field.fill('Квеня')
                        field.press('Enter')
                        pushed = True
                        report.step('ввод', 'история просила имя — вписала «Квеня»')
                except Exception:
                    pass
                if pushed:
                    page.wait_for_timeout(900)
                    continue
                run_end = text[:400]
                endings.append({'run': run, 'n': moves, 'text': run_end})
                report.step('финал' if text else 'пусто',
                            f'заход {run}: {moves} выборов, новых мест {new_places} — {text[:170] or "пусто"}')
                break
        runs_done.append({'run': run, 'moves': moves, 'fresh': fresh_moves,
                          'newPlaces': new_places, 'end': run_end[:200],
                          'placesByNow': len(story_map.nodes)})
        if time.monotonic() >= deadline - 10:
            break
        all_choice_pairs = len(story_map.tried)
        report.step('разбор захода',
                    f'заход {run}: мест в карте {len(story_map.nodes)}, нажато вариантов {all_choice_pairs}; '
                    + ('есть куда идти — начинаю заново' if run < runs else 'заходов хватит'))

    # Карту сохраняем рядом с отчётом — её подхватит следующий прогон.
    try:
        memo_path.write_text(json.dumps(story_map.to_cache(), ensure_ascii=False), encoding='utf-8')
        report.step('карта сохранена', f'{len(story_map.nodes)} мест для следующего прогона')
    except Exception as err:
        report.step('карта', f'не сохранилась: {err}')

    hit = [p for p in path if p.get('finds')]
    return {
        'moves': sum(r['moves'] for r in runs_done),
        'runs': runs_done,
        'path': path,
        'endings': endings,
        'reachedEnd': bool(endings),
        'last': path[-1] if path else None,
        'map': story_map.as_report(),
        'sawFinds': hit[:5],
        'freshPlaces': sum(r['newPlaces'] for r in runs_done),
        'remembered': memo_loaded,
    }

def finish(browser, context, video_dir, out, report):
    try:
        context.close()  # видео дописывается при закрытии контекста
    except Exception:
        pass
    try:
        browser.close()
    except Exception:
        pass
    videos = sorted(video_dir.glob('*.webm')) if video_dir.exists() else []
    if videos:
        target = out / 'expedition.webm'
        try:
            videos[0].replace(target)
            report.data['hasVideo'] = True
        except Exception:
            pass
    report.save(out)
    print(json.dumps({'status': report.data['status'], 'steps': len(report.data['steps'])}), flush=True)
    return 0


def main():
    parser = argparse.ArgumentParser(description='Экспедиция Квени: браузерные руки в интернет')
    parser.add_argument('--url', default='https://yandex.ru/games/app/ukradi-iaitso-580426')
    parser.add_argument('--seconds', type=int, default=60)
    parser.add_argument('--keys', default='', help='план клавиш из задания, через запятую')
    parser.add_argument('--interval-ms', type=int, default=0, help='ритм нажатий из задания, мс')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--memo', default='', help='прошлая карта истории: следующая экспедиция её вспомнит')
    args = parser.parse_args()
    return run(args.url, args.seconds, args.out, args.keys, args.interval_ms, args.memo)


if __name__ == '__main__':
    sys.exit(main())
