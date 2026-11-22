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


EYES_JS = r"""
() => {
  const c = document.querySelector('canvas');
  if (!c) return {ok: false, why: 'no canvas'};
  let ctx = null;
  try { ctx = c.getContext('2d'); } catch (e) {}
  if (!ctx) return {ok: false, why: 'no 2d context'};
  let img;
  try { img = ctx.getImageData(0, 0, c.width, c.height); }
  catch (e) { return {ok: false, why: 'pixels closed'}; }
  const w = c.width, h = c.height, d = img.data, step = 3;
  const bird = [], pipe = [], dark = [];
  let cream = 0, creamAll = 0;
  const cx0 = w * 0.30, cx1 = w * 0.70, cy0 = h * 0.20, cy1 = h * 0.62;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const i = (y * w + x) * 4;
      const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
      if (a < 200) continue;
      // птица: жёлтое тело и оранжевый клюв спрайта clumsy
      if (r > 200 && g > 150 && b < 120 && r - b > 90) bird.push(x, y);
      // трубы: зелень спрайта pipe (кусты фона отсечёт разбор по строкам)
      if (g > 100 && g >= r - 10 && b < 150 && !(r > 205 && g > 205)) pipe.push(x, y);
      // чёрная окантовка труб и текста
      if (r < 70 && g < 70 && b < 70) dark.push(x, y);
      // кремовая панель game over по центру кадра
      if (x >= cx0 && x <= cx1 && y >= cy0 && y <= cy1) {
        creamAll++;
        if (r > 220 && g > 220 && b > 140 && b < 225) cream++;
      }
    }
  }
  return {ok: true, w: w, h: h, bird: bird, pipe: pipe, dark: dark,
          cream: creamAll ? cream / creamAll : 0};
}
"""


EYES_SUMMARY_JS = r"""
() => {
  const c = document.querySelector('canvas');
  if (!c) return {ok: false, why: 'no canvas'};
  let ctx = null;
  try { ctx = c.getContext('2d'); } catch (e) {}
  if (!ctx) return {ok: false, why: 'no 2d context'};
  let img;
  try { img = ctx.getImageData(0, 0, c.width, c.height); }
  catch (e) { return {ok: false, why: 'pixels closed'}; }
  const w = c.width, h = c.height, d = img.data, step = 3;
  const birdPts = [], cols = {}, darkCols = {}, rowCols = {};
  let cream = 0, creamAll = 0;
  const cx0 = w * 0.30, cx1 = w * 0.70, cy0 = h * 0.20, cy1 = h * 0.62;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const i = (y * w + x) * 4;
      const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
      if (a < 200) continue;
      if (r > 200 && g > 150 && b < 120 && r - b > 90 && x >= 0.02 * w && x <= 0.24 * w && y < 0.80 * h) birdPts.push([x, y]);
      if (g > 100 && g >= r - 10 && b < 150 && !(r > 205 && g > 205) && y < 0.86 * h) {
        (cols[x] = cols[x] || []).push(y);
        (rowCols[y] = rowCols[y] || new Set()).add(x);
      }
      if (r < 70 && g < 70 && b < 70) darkCols[x] = (darkCols[x] || 0) + 1;
      if (x >= cx0 && x <= cx1 && y >= cy0 && y <= cy1) {
        creamAll++;
        if (r > 220 && g > 220 && b > 140 && b < 225) cream++;
      }
    }
  }
  let bird = null;
  if (birdPts.length >= 5) {
    const xs = birdPts.map(p => p[0]).sort((a, b) => a - b);
    const ys = birdPts.map(p => p[1]).sort((a, b) => a - b);
    bird = [xs[xs.length >> 1], ys[ys.length >> 1]];
  }
  const wide = Math.max(6, Math.floor(0.15 * w));
  const bgRows = new Set(Object.keys(rowCols).filter(y => rowCols[y].size >= wide).map(Number));
  let gap = null, pipeX = null;
  if (bird) {
    const ahead = Object.keys(cols).map(Number).filter(x => x > bird[0] + 0.05 * w).sort((a, b) => a - b);
    for (const x of ahead) {
      const ys = cols[x].filter(y => !bgRows.has(y)).sort((a, b) => a - b);
      const top = ys.filter(y => y < 0.30 * h);
      if (top.length >= 3 && (darkCols[x] || 0) >= 4) {
        pipeX = x;
        const gapTop = top[top.length - 1];
        const below = ys.filter(y => y > gapTop + 0.06 * h);
        const gapBottom = below.length ? below[0] : Math.min(0.86 * h, gapTop + 0.293 * h);
        gap = [gapTop, gapBottom];
        break;
      }
    }
  }
  return {ok: true, w: w, h: h, bird: bird, gap: gap, pipe_x: pipeX,
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

    На входе — кандидаты пикселей из EYES_JS (или из PNG-скриншота).
    Птица живёт слева (в Clumsy Bird x=60 из 900), поэтому жёлтое
    ищем только в левой четверти кадра: по центру тот же жёлтый —
    надписи «get ready» и «game over», это не птица."""
    if not raw or not raw.get('ok'):
        return None
    from collections import defaultdict
    w, h = raw['w'], raw['h']

    def pairs(flat):
        return list(zip(flat[0::2], flat[1::2]))

    bird_pts = [(x, y) for x, y in pairs(raw.get('bird', []))
                if 0.02 * w <= x <= 0.24 * w and y < 0.80 * h]
    bird = None
    if len(bird_pts) >= 5:
        xs = sorted(q[0] for q in bird_pts)
        ys = sorted(q[1] for q in bird_pts)
        bird = (xs[len(xs) // 2], ys[len(ys) // 2])

    cols = defaultdict(list)
    for x, y in pairs(raw.get('pipe', [])):
        if y < 0.86 * h:
            cols[x].append(y)
    dark_cols = defaultdict(int)
    for x, y in pairs(raw.get('dark', [])):
        dark_cols[x] += 1
    # строки, зелёные почти по всей ширине, — это фон (кусты), а не труба
    row_cols = defaultdict(set)
    for x, ys in cols.items():
        for y in ys:
            row_cols[y].add(x)
    wide = max(6, int(0.15 * w))
    bg_rows = {y for y, ss in row_cols.items() if len(ss) >= wide}

    gap = None
    pipe_x = None
    if bird:
        for x in sorted(xx for xx in cols if xx > bird[0] + 0.05 * w):
            ys = sorted(y for y in cols[x] if y not in bg_rows)
            top = [y for y in ys if y < 0.30 * h]
            if len(top) >= 3 and dark_cols.get(x, 0) >= 4:
                pipe_x = x
                gap_top = top[-1]
                below = [y for y in ys if y > gap_top + 0.06 * h]
                gap_bottom = below[0] if below else min(0.86 * h, gap_top + 0.293 * h)
                gap = (gap_top, gap_bottom)
                break
    return {'w': w, 'h': h, 'bird': bird, 'gap': gap, 'pipe_x': pipe_x,
            'game_over': raw.get('cream', 0) > 0.35}


def eyes_from_png(data):
    """Запасные глаза: PNG-скриншот канваса -> те же кандидаты пикселей."""
    decoded = _decode_png(data)
    if not decoded:
        return None
    w, h, ch, px = decoded
    bird, pipe, dark = [], [], []
    cream = cream_all = 0
    step = 4
    for yy in range(0, h, step):
        for xx in range(0, w, step):
            i = (yy * w + xx) * ch
            r, g, b = px[i], px[i + 1], px[i + 2]
            a = px[i + 3] if ch == 4 else 255
            if a < 200:
                continue
            if r > 200 and g > 150 and b < 120 and r - b > 90:
                bird += [xx, yy]
            if g > 100 and g >= r - 10 and b < 150 and not (r > 205 and g > 205):
                pipe += [xx, yy]
            if r < 70 and g < 70 and b < 70:
                dark += [xx, yy]
            if w * 0.30 <= xx <= w * 0.70 and h * 0.20 <= yy <= h * 0.62:
                cream_all += 1
                if r > 220 and g > 220 and 140 < b < 225:
                    cream += 1
    return {'ok': True, 'w': w, 'h': h, 'bird': bird, 'pipe': pipe,
            'dark': dark, 'cream': (cream / cream_all) if cream_all else 0}


def decide_flap(bird_y, target_y, gap_bottom, h, ms_since_flap, vy=0):
    """Решение глаз: жать ли клавишу взмаха на этом кадре.

    Птица ниже цели и не летит вверх пулей — взмах; птица у нижнего
    края просвета — взмах срочно; только что взмахнули — не спамим,
    физике нужно время. vy — скорость по кадрам: на подъёме после
    взмаха не жмём ещё, иначе птица улетает в верхнюю трубу."""
    if bird_y is None:
        return False
    if gap_bottom is not None and bird_y > gap_bottom - 0.05 * h:
        return ms_since_flap >= 90
    if bird_y > target_y + 0.010 * h and vy > -12 and ms_since_flap >= 100:
        return True
    # упреждение: падаем пулей и уже близко к цели — взмах до того,
    # как инерция унесёт птицу под просвет
    return vy >= 24 and bird_y > target_y - 0.025 * h and ms_since_flap >= 100


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
                                    'pipe_x': raw.get('pipe_x'),
                                    'game_over': bool(raw.get('game_over'))}
                        eyes_png_mode['on'] = True
                        report.step('глаза экспедиции', f"пиксели канваса изнутри не дались ({(raw or {}).get('why', '?')}) — смотрю скриншотами канваса")
                    except Exception:
                        eyes_png_mode['on'] = True
                try:
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
                while time.monotonic() < deadline - 6 and attempt < 3:
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
                    attempt_end = min(deadline, attempt_start + max(14, int((deadline - attempt_start) / (3 - attempt + 1))))
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
                        gap = st['gap'] or (last_gap if now - last_gap_at < 1.2 else None)
                        # мёртвую не дёргать: птица у самой земли или конец игры —
                        # пробел там уже не взмах, а кнопка «в меню»
                        target = None
                        flapped = False
                        if st['bird']:
                            vy = (st['bird'][1] - prev_bird_y) if prev_bird_y is not None else 0
                            prev_bird_y = st['bird'][1]
                            target = ((gap[0] + gap[1]) / 2 if gap else frame_h * 0.42) + offset
                            if not st['game_over'] and not bird_low:
                                ms = int((now - last_flap) * 1000) if last_flap else 9999
                                if decide_flap(st['bird'][1], target, gap[1] if gap else None, frame_h, ms, vy):
                                    flap_key = keys[0] if keys else 'Space'
                                    page.keyboard.down(flap_key)
                                    page.wait_for_timeout(70)
                                    page.keyboard.up(flap_key)
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
                        page.wait_for_timeout(80)
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
                    if time.monotonic() < deadline - 8 and attempt < 3:
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
