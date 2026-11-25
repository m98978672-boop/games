"""Reviewed Russian translations for the known Viewport Voyager HUD."""
import re
import textwrap
from pathlib import Path

from game_text_translation import russian_game_text

TRANSLATIONS = {
    'Resize to 800x600 to align the hidden platform and reach the Goal!': 'Выставь 800 × 600, чтобы открыть скрытую платформу и добраться до цели.',
    'Level 2: The Ratio Riser. Resize the window until the Aspect Ratio (W/H) is exactly 1.50!': 'Измени размер окна: отношение ширины к высоте должно быть ровно 1,50.',
    '🎯 Perfect dimensions! The platform is stable.': 'Размер подобран. Платформа больше не смещается.',
    'Game Complete! You are a master Viewport Voyager!': 'Игра пройдена!',
}


def translated_message(message):
    if not isinstance(message, str):
        return None
    if message in TRANSLATIONS:
        return TRANSLATIONS[message]
    if re.fullmatch(r'⭐ ASPECT RATIO ACHIEVED! Ratio: [0-9]+\.[0-9]{3}\. The path is aligned!', message):
        return 'Нужные пропорции достигнуты. Путь открыт.'
    hint, sep, ratio = message.partition(' Current Ratio: ')
    if sep and hint in TRANSLATIONS and re.fullmatch(r'[0-9]+\.[0-9]{3}', ratio):
        return f'{TRANSLATIONS[hint]} Сейчас: {ratio.replace(".", ",")}.'
    return None


def cues(trace):
    duration = trace['duration_seconds']
    rows = [(0, trace.get('initial_hud'))]
    rows.extend(((event.get('recording_elapsed_ms') or 0) / 1000, event.get('hud')) for event in trace['actions'])
    result = []
    for i, (start, hud) in enumerate(rows):
        end = rows[i+1][0] if i+1 < len(rows) else None
        if not hud or not 0 <= start <= duration or end is not None and end <= start:
            continue
        source = hud.get('message')
        message = translated_message(source)
        if message is None and trace.get('auto_translate') and isinstance(source, str):
            message = russian_game_text(source)
        if message is not None:
            result.append((start, end, hud, message))
    return result


def filters(trace, folder):
    commands = []
    for i, (start, end, hud, message) in enumerate(cues(trace)):
        width, height = hud['viewport']
        scale = min(800 / width, 600 / height, 1)
        x, y, w, h = (round(float(v) * scale) for v in hud['rect'])
        if not (0 <= x < 800 and 0 <= y < 600 and 120 <= w <= 800 - x and 42 <= h <= 600 - y):
            continue
        font = max(10, min(16, round(h / 7)))
        level = hud['level']
        title = 'Путешественник по окнам'
        heading = f'{title} · Уровень {level}' if level in (1, 2) else title
        lines = [heading, f'Размер окна: {width} × {height}', *textwrap.wrap(message, max(12, int((w-12)/(font*.64))))]
        if len(lines) * (font+3) > h - 8:
            continue
        file = Path(folder) / f'hud-ru-{i}.txt'
        file.write_text('\n'.join(lines), encoding='utf-8')
        active = f"enable='gte(t,{start:.3f})" + (f'*lt(t,{end:.3f})' if end is not None else '') + "'"
        commands += [f'drawbox=x={x}:y={y}:w={w}:h={h}:color=0x151721:t=fill:{active}',
                     f'drawtext=textfile={file}:expansion=none:x={x+5}:y={y+4}:fontsize={font}:fontcolor=white:line_spacing=3:{active}']
    return ','.join(commands)
