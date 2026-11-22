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
            report.step('подготовка к игре', f'{why}: клавиши {keys or "клик"}, ритм {interval} мс; подсказки экрана: {hints[:140]!r}')

            page.mouse.click(cx, cy)
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
