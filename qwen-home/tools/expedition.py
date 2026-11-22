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
from datetime import datetime, timezone
from pathlib import Path

CAPTCHA_MARKERS = ('не робот', 'not a robot', 'smartcaptcha', 'подтвердите, что вы человек',
                   'i am not a robot', 'покажите, что вы не робот', 'введите символы')
PLAY_TEXTS = ('играть', 'play', 'играть сейчас', 'начать игру', 'start game')
KEY_PLAN = ('ArrowRight', 'ArrowRight', 'Space', 'ArrowLeft', 'KeyW', 'ArrowUp',
            'KeyA', 'Space', 'KeyD', 'ArrowDown', 'Space', 'ArrowRight')


def detect_captcha(text):
    low = (text or '').lower()
    return next((m for m in CAPTCHA_MARKERS if m in low), '')


def plan_keys(seconds):
    """План честного ввода: чем дольше экспедиция, тем больше ходов."""
    rounds = max(1, min(6, int(seconds // 12) + 1))
    return list(KEY_PLAN) * rounds


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


def run(url, seconds, out):
    from playwright.sync_api import sync_playwright  # ленивая: --help и тесты логики без браузера

    out.mkdir(parents=True, exist_ok=True)
    video_dir = out / 'video-raw'
    report = Report(url)
    deadline = time.monotonic() + max(20, min(180, seconds))

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800},
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

            report.step('игровой канвас', f"найден {int(box['width'])}x{int(box['height'])} — играю клавишами и кликами")
            cx, cy = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2
            page.mouse.click(cx, cy)
            shots = 3
            for key in plan_keys(int(deadline - time.monotonic())):
                if time.monotonic() > deadline:
                    break
                page.keyboard.press(key)
                report.step('ход', key)
                page.wait_for_timeout(650)
                if detect_captcha(page_text()):
                    report.data['status'] = 'captcha-wall'
                    report.step('стена капчи во время игры', 'останавливаюсь: капчу не решаю')
                    shot('09-captcha.png')
                    return finish(browser, context, video_dir, out, report)
                if shots <= 5 and int(time.monotonic()) % 9 < 1:
                    shot(f'0{shots}-play.png')
                    shots += 1
            page.mouse.click(cx + box['width'] * 0.2, cy)
            page.wait_for_timeout(800)
            shot('08-final.png')
            report.data['status'] = 'played'
            report.step('игра состоялась', 'ввод уходил в канвас, видео экспедиции записано')
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
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    return run(args.url, args.seconds, args.out)


if __name__ == '__main__':
    sys.exit(main())
