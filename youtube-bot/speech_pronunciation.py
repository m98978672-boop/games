"""Conservative, speech-only Russian text preparation for local TTS.

Never alter source text, captions, evidence or translate unknown words. Explicit
user dictionaries are pronunciation hints, not a grammar or stress checker.
"""
from __future__ import annotations

import json
import os
import re
from pathlib import Path

SPOKEN_ALIASES = {
    'Steam Deck': 'Стим Дек', 'Steam': 'Стим', 'Early Access': 'ранний доступ',
    'Xbox': 'Иксбокс', 'PlayStation': 'Плейстейшен', 'Windows': 'Виндоус',
    'Linux': 'Линукс', 'Unreal Engine': 'Анрил Энджин', 'Unity': 'Юнити',
    'DLC': 'ди эл си', 'RPG': 'эр пэ гэ', 'MMORPG': 'эм эм оу эр пи джи',
    'PvP': 'пэ вэ пэ', 'PvE': 'пэ вэ е', 'FPS': 'эф пэ эс', 'ИИ': 'и и',
}
# Known keyboard labels only. Do not guess the meaning of [other tags].
KEYS = {'E': 'и', 'W': 'дабл ю', 'A': 'эй', 'S': 'эс', 'D': 'ди',
        'ESC': 'эскейп', 'SPACE': 'пробел', 'ENTER': 'энтер'}
_PROTECTED = re.compile(r'https?://[^\s]+|www\.[^\s]+|`[^`\r\n]+`|<[^<>\r\n]+>|\{\{[^{}]+\}\}|\{[^{}]+\}|%\d+\$[sdif]|%[sdif]', re.IGNORECASE)
_NUMBER_WORDS = ('', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять', 'десять')
_SCORE = re.compile(r'(?<!\w)(?<!\d[.,])(10|[1-9])\s+из\s+10(?!\w|[.,]\d)')
_DIMENSIONS = re.compile(r'(?<!\w)(?<!\d[.,])(\d{2,4})\s*[xх×]\s*(\d{2,4})(?!\w|[.,]\d)', re.IGNORECASE)
_KEY = re.compile(r'(?<!\w)(нажми|нажмите|удерживай|удерживайте|отпусти|отпустите)\s+\[(E|W|A|S|D|ESC|SPACE|ENTER)\]', re.IGNORECASE)


def load_pronunciations(path: str | Path) -> dict[str, str]:
    """Read explicit literal speech replacements; refuse malformed dictionaries."""
    path = Path(path)
    if path.is_symlink() or not path.is_file() or path.stat().st_size > 32_000:
        raise ValueError('Speech pronunciation dictionary must be a regular JSON file at most 32 KB')
    data = json.loads(path.read_text(encoding='utf-8-sig'))
    if (not isinstance(data, dict) or len(data) > 128 or
            any(not isinstance(k, str) or not isinstance(v, str) or
                not k.strip() or not v.strip() or len(k) > 100 or len(v) > 200 or
                any(ord(c) < 32 for c in k + v) for k, v in data.items())):
        raise ValueError('Invalid speech pronunciation dictionary')
    keys = [key.casefold() for key in data]
    if len(keys) != len(set(keys)):
        raise ValueError('Duplicate case-insensitive pronunciation keys')
    return data


def pronunciation_text(text: str, *, aliases: dict[str, str] | None = None) -> str:
    """Prepare words for TTS while preserving semantic content and protected spans."""
    if not isinstance(text, str):
        raise TypeError('Speech text must be a string')
    if aliases is None:
        path = os.environ.get('SPEECH_PRONUNCIATION_PATH', '').strip()
        aliases = load_pronunciations(path) if path else {}
    if not isinstance(aliases, dict):
        raise ValueError('Pronunciation aliases must be a dictionary')
    lookup = {key.casefold(): value for key, value in SPOKEN_ALIASES.items()}
    lookup.update({key.casefold(): value for key, value in aliases.items()})
    alias_pattern = re.compile(r'(?<!\w)(?:' + '|'.join(re.escape(k) for k in sorted(lookup, key=len, reverse=True)) + r')(?!\w)', re.IGNORECASE)

    def transform(part: str) -> str:
        part = alias_pattern.sub(lambda m: lookup[m.group().casefold()], part)
        part = _KEY.sub(lambda m: m.group(1) + ' клавишу ' + KEYS[m.group(2).upper()], part)
        part = _DIMENSIONS.sub(lambda m: m.group(1) + ' на ' + m.group(2), part)
        part = _SCORE.sub(lambda m: _NUMBER_WORDS[int(m.group(1))] + ' из десяти', part)
        part = re.sub(r'\s+([,.!?;:])', r'\1', part)
        part = re.sub(r'([!?,;:])\1+', r'\1', part)
        part = re.sub(r'(?<!\.)\.\.(?!\.)', '.', part)
        part = re.sub(r'([.!?])(?=[А-Яа-яЁё])', r'\1 ', part)
        return re.sub(r'\s+', ' ', part)

    # Never rewrite URLs, markup or placeholders, including via user aliases.
    pieces = _PROTECTED.split(text)
    protected = _PROTECTED.findall(text)
    result = ''.join(transform(piece) + (protected[i] if i < len(protected) else '')
                     for i, piece in enumerate(pieces))
    return result.strip()


def speech_cadence(text: str) -> tuple[str, str, float]:
    """Mild Piper length/sentence-silence and inter-clip pause by punctuation.

    The model still determines pitch and emotion; this is not emotion detection.
    """
    ending = text.rstrip().rstrip('"\'»”)]}')
    if ending.endswith(('?', '?!', '!?')):
        return '1.08', '0.24', 0.22
    if ending.endswith(('...', '…')):
        return '1.09', '0.24', 0.24
    if ending.endswith('!'):
        return '1.04', '0.20', 0.18
    return '1.07', '0.21', 0.16
