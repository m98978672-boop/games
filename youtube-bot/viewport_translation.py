"""Translate observed Viewport Voyager HUD text without hiding unverified text."""
import math
import re
import textwrap
from pathlib import Path

from game_text_translation import russian_game_text

TRANSLATIONS = {
    'Resize to 800x600 to align the hidden platform and reach the Goal!': 'Измени размер окна до 800 × 600, чтобы выровнять скрытую платформу и добраться до цели!',
    'Level 2: The Ratio Riser. Resize the window until the Aspect Ratio (W/H) is exactly 1.50!': 'Уровень 2: измени размер окна, чтобы отношение ширины к высоте было ровно 1,50!',
    '🎯 Perfect dimensions! The platform is stable.': 'Идеальные размеры! Платформа устойчива.',
    'Game Complete! You are a master Viewport Voyager!': 'Игра пройдена! Ты мастер путешествий по окнам!',
}


def translated_message(message):
    if not isinstance(message, str):
        return None
    if message in TRANSLATIONS:
        return TRANSLATIONS[message]
    achieved = re.fullmatch(r'⭐ ASPECT RATIO ACHIEVED! Ratio: ([0-9]+\.[0-9]{3})\. The path is aligned!', message)
    if achieved:
        return f'Нужное соотношение достигнуто: {achieved.group(1).replace(".", ",")}. Путь выровнен!'
    hint, sep, ratio = message.partition(' Current Ratio: ')
    if sep and hint in TRANSLATIONS and re.fullmatch(r'[0-9]+\.[0-9]{3}', ratio):
        return f'{TRANSLATIONS[hint]} Сейчас: {ratio.replace(".", ",")}.'
    return None


def prepare(trace):
    """Resolve intervals once, preserving the source if a translation fails.

    Times are approximate recording-clock estimates, not exact video PTS.
    Repeated adjacent HUD states are merged; repeated text is translated once per
    preparation, and the resulting intervals can be shared by voice and overlay.
    """
    duration = trace.get('duration_seconds')
    if (isinstance(duration, bool) or not isinstance(duration, (float, int))
            or not math.isfinite(duration) or duration <= 0):
        raise ValueError('Invalid recording duration')
    actions = trace.get('actions')
    if not isinstance(actions, list) or len(actions) > 10_000:
        raise ValueError('Invalid recorded actions')
    rows = [(0.0, trace.get('initial_hud'))]
    skipped = 0
    last_time = 0.0
    for event in actions:
        if not isinstance(event, dict):
            skipped += 1
            continue
        ms = event.get('recording_elapsed_ms')
        if (isinstance(ms, bool) or not isinstance(ms, (int, float)) or not math.isfinite(ms)
                or ms < last_time * 1000 or ms > duration * 1000):
            skipped += 1
            continue
        stamp = ms / 1000.0
        last_time = stamp
        hud = event.get('hud')
        if stamp == rows[-1][0]:
            rows[-1] = (stamp, hud)
        elif hud != rows[-1][1]:
            rows.append((stamp, hud))
    # A missing or out-of-order timestamp makes every HUD transition ambiguous.
    # Do not cover any part of the original footage in that case.
    if skipped:
        return [], {'observed_intervals': 0, 'translated_intervals': 0,
                    'untranslated_intervals': 0, 'invalid_timestamps': skipped,
                    'machine_translation_requires_review': True}
    result = []
    stats = {'observed_intervals': 0, 'translated_intervals': 0,
             'untranslated_intervals': 0, 'invalid_timestamps': skipped,
             'machine_translation_requires_review': True}
    cache = {}
    for i, (start, hud) in enumerate(rows):
        end = rows[i + 1][0] if i + 1 < len(rows) else float(duration)
        if not isinstance(hud, dict) or not start < end:
            continue
        source = hud.get('message')
        if not isinstance(source, str) or not source.strip():
            continue
        stats['observed_intervals'] += 1
        message = translated_message(source)
        if message is None and trace.get('auto_translate') is True:
            # An identical on-screen message in one recording gets one result;
            # failures are not cached globally or retried once per frame.
            if source not in cache:
                cache[source] = russian_game_text(
                    source, context=str(trace.get('translation_context') or '')[:450],
                    source_language=trace.get('source_language'))
            message = cache[source]
        if message is None:
            stats['untranslated_intervals'] += 1
            continue
        stats['translated_intervals'] += 1
        result.append((start, end, hud, message))
    return result, stats


def cues(trace):
    return prepare(trace)[0]


def _layout(hud, message):
    """Fit the complete text or decline the overlay and leave the HUD visible."""
    try:
        width, height = hud['viewport']
        rect = hud['rect']
        if (any(type(value) not in (int, float) or not math.isfinite(value) for value in (width, height, *rect))
                or width <= 0 or height <= 0 or len(rect) != 4):
            return None
        scale = min(800 / width, 600 / height, 1)
        x, y, w, h = (round(float(v) * scale) for v in rect)
    except (KeyError, TypeError, ValueError):
        return None
    if not (0 <= x < 800 and 0 <= y < 600 and 120 <= w <= 800 - x and 42 <= h <= 600 - y):
        return None
    level = hud.get('level')
    title = 'Путешественник по окнам'
    heading = f'{title} · Уровень {level}' if level in (1, 2) else title
    for font in range(min(16, max(10, round(h / 7))), 9, -1):
        column = max(1, int((w - 12) / (font * .64)))
        lines = [heading, f'Размер окна: {width} × {height}',
                 *textwrap.wrap(message, column, break_long_words=False, break_on_hyphens=False)]
        if all(len(line) <= column for line in lines) and len(lines) * (font + 3) <= h - 8:
            return x, y, w, h, font, lines
    return None


def filters(trace, folder, *, intervals=None, stats=None):
    """Create FFmpeg overlay filters using the same prepared text as narration."""
    if intervals is None:
        intervals = cues(trace)
    folder = Path(folder).resolve()
    # Filter syntax interprets punctuation as options; the build path is a
    # generated temporary directory. Refuse unusual paths rather than inject it.
    if not re.fullmatch(r'[/A-Za-z0-9_.-]+', str(folder)):
        raise ValueError('Unsupported translation overlay directory')
    commands = []
    displayed = skipped = 0
    for i, (start, end, hud, message) in enumerate(intervals):
        layout = _layout(hud, message)
        if layout is None:
            skipped += 1
            continue
        x, y, w, h, font, lines = layout
        file = folder / f'hud-ru-{i}.txt'
        file.write_text('\n'.join(lines), encoding='utf-8')
        active = f"enable='gte(t,{start:.3f})*lt(t,{end:.3f})'"
        commands += [f'drawbox=x={x}:y={y}:w={w}:h={h}:color=0x151721:t=fill:{active}',
                     f'drawtext=textfile={file}:expansion=none:x={x+5}:y={y+4}:fontsize={font}:fontcolor=white:line_spacing=3:{active}']
        displayed += 1
    if stats is not None:
        stats.update({'overlay_intervals': displayed, 'overlay_layout_skipped': skipped})
    return ','.join(commands)
