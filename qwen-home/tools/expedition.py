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
  // Глаза на типизированных массивах. Прежняя версия строила Set на КАЖДУЮ
  // строку и вставляла в него каждый найденный пиксель, а потом сортировала
  // точки по колонкам: кадр разбирался миллисекунды, которых в игре нет.
  // Здесь всё то же самое по смыслу (та же птица, тот же поиск трубы,
  // тот же отсев «фоновых» строк), но счётчики — на типизированных массивах.
  const c = document.querySelector('canvas');
  if (!c) return {ok: false, why: 'no canvas'};
  let ctx = null;
  try { ctx = c.getContext('2d'); } catch (e) {}
  if (!ctx) return {ok: false, why: 'no 2d context'};
  let img;
  try { img = ctx.getImageData(0, 0, c.width, c.height); }
  catch (e) { return {ok: false, why: 'pixels closed'}; }
  const w = c.width, h = c.height, d = img.data, step = 4;
  const colH = new Uint16Array(w);     // зелёных точек в колонке
  const colDark = new Uint16Array(w);  // тёмных точек в колонке (окантовка трубы)
  const rowH = new Uint16Array(h);     // зелёных точек в строке
  let bx0 = w, bx1 = -1, by0 = h, by1 = -1, bN = 0;
  let cream = 0, creamAll = 0;
  const cx0 = w * 0.30, cx1 = w * 0.70, cy0 = h * 0.20, cy1 = h * 0.62;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const i = (y * w + x) * 4;
      const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
      if (a < 200) continue;
      if (r > 200 && g > 150 && b < 120 && r - b > 90 && x >= 0.02 * w && x <= 0.24 * w && y < 0.80 * h) {
        bN++;
        if (x < bx0) bx0 = x; if (x > bx1) bx1 = x;
        if (y < by0) by0 = y; if (y > by1) by1 = y;
      }
      if (g > 100 && g >= r - 10 && b < 150 && !(r > 205 && g > 205) && y < 0.86 * h) {
        colH[x]++; rowH[y]++;
      }
      if (r < 70 && g < 70 && b < 70) colDark[x]++;
      if (x >= cx0 && x <= cx1 && y >= cy0 && y <= cy1) {
        creamAll++;
        if (r > 220 && g > 220 && b > 140 && b < 225) cream++;
      }
    }
  }
  let bird = null;
  if (bN >= 5) bird = [(bx0 + bx1) >> 1, (by0 + by1) >> 1];
  // «Фоновые» строки: зелёный идёт почти во всю ширину — это холмы, земля,
  // облака. Труба широкая, но не на весь экран; старый глаз их отсеивал,
  // и без отсева просвет прыгал на холмы.
  const wide = Math.max(6, Math.floor(0.15 * w));
  let gap = null, pipeX = null, gapSure = false;
  if (bird) {
    const isGreen = (x, y) => {
      const i = (y * w + x) * 4;
      if (d[i + 3] < 200) return false;
      const r = d[i], g = d[i + 1], b = d[i + 2];
      return g > 100 && g >= r - 10 && b < 150 && !(r > 205 && g > 205) && y < 0.86 * h;
    };
    // Поиск трубы — дословно логика проверенной версии, но без Set и сортировок.
    // Шаг 1: по кандидатным колонкам (много зелёного + окантовка) собрать
    //        зелёные пиксели выше трети высоты, НЕ считая фоновых строк
    //        (холмы, земля, облака идут во всю ширину — это не труба).
    // Шаг 2: нижний край верхней трубы — самый нижний из них; низ просвета —
    //        первый зелёный ниже него (тоже без фона).
    // Начало колонок выравниваем по шагу сетки: счётчики заполнены по кратным.
    let x0 = bird[0] + Math.floor(0.05 * w);
    x0 += (step - (x0 % step)) % step;
    for (let x = x0; x < w; x += step) {
      if (colH[x] < 3 || colDark[x] < 4) continue;
      let topMax = -1, topN = 0;
      for (let y = 0; y < 0.30 * h; y += step) {
        if (rowH[y] >= wide) continue;         // фон, а не труба
        if (isGreen(x, y)) { topMax = y; topN++; }
      }
      if (topN < 3 || topMax < 0) continue;
      let gapBottom = -1;
      for (let y = topMax + Math.floor(0.06 * h); y < 0.86 * h; y += step) {
        if (rowH[y] >= wide) continue;
        if (isGreen(x, y)) { gapBottom = y; break; }
      }
      // проверка просвета: настоящий просвет у таких игр ~0.29 кадра;
      // прочиталось сильно уже или шире — не верю нижней границе
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
    # порог как в проверенной версии: доля ШИРИНЫ КАДРА (счётчики rowH считают
    # ячейки сетки, их максимум w/step, поэтому доля берётся от w, а не от w/step)
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

    Стратегия — та, что дала рекорд 4 трубы (зона 0.72). Пробовал 0.58 и
    упреждение по скорости: на живом прогоне это дало 1 трубу против 4.
    Меняем не стратегию, а ЗРЕНИЕ: кадр теперь разбирается без Set и сортировок
    (было сотни миллисекунд, стало единицы), поэтому решение приходит свежим.

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
        # Зона 0.72 — проверена живьём: рекорд 4 трубы.
        # Если низ просвета не подтверждён пикселями, он может быть выше,
        # чем кажется, — тогда зону поднимаем, чтобы взмах успел.
        share = 0.72 if sure else 0.62
        zone = gap_top + share * (gap_bottom - gap_top)
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


def run(url, seconds, out, task_keys='', interval_ms=0):
    from playwright.sync_api import sync_playwright  # ленивая: --help и тесты логики без браузера

    out.mkdir(parents=True, exist_ok=True)
    video_dir = out / 'video-raw'
    report = Report(url)
    deadline = time.monotonic() + max(20, min(180, seconds))

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
                    flap_key = keys[0] if keys else 'Space'
                    key_held = False
                    held_since = 0.0
                    while time.monotonic() < attempt_end:
                        st = read_eyes()
                        if st is None:
                            eyes_lost += 1
                            if eyes_lost >= 4:
                                break
                            page.wait_for_timeout(120)
                            continue
                        eyes_lost = 0
                        frames += 1
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
                                # цель для трассы и разбора: рабочая зона, а не край
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
                    report.step(f'попытка {attempt} сыграна', f'глазами: прожила {alive} с, взмахов {flaps}, кадров {frames} (птицу видела в {bird_frames}, просвет в {gap_frames}), {score_txt}')
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
    args = parser.parse_args()
    return run(args.url, args.seconds, args.out, args.keys, args.interval_ms)


if __name__ == '__main__':
    sys.exit(main())
