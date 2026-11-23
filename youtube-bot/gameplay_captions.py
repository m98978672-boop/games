"""Generate timed SRT from actual spoken captions and clip to recorded parts.

No transcription, video generation or publishing. Inputs are the exact text and
measured duration of each synthesized speech clip, not inferred game dialogue.
"""
from __future__ import annotations

import math
import re
from typing import Iterable


def _stamp(seconds: float) -> str:
    ms = round(seconds * 1000)
    hours, ms = divmod(ms, 3_600_000)
    minutes, ms = divmod(ms, 60_000)
    seconds, ms = divmod(ms, 1000)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{ms:03d}"


def render_srt(cues: Iterable[tuple[float, float, str]], *, start: float = 0, end: float) -> str:
    if not (math.isfinite(start) and math.isfinite(end) and 0 <= start < end <= 7200):
        raise ValueError('Invalid caption interval')
    result = []
    prev_end = 0.0
    for begin, finish, text in cues:
        if (isinstance(begin, bool) or isinstance(finish, bool)
                or not isinstance(begin, (int, float)) or not isinstance(finish, (int, float))
                or not math.isfinite(begin) or not math.isfinite(finish)
                or not 0 <= begin < finish or begin < prev_end or finish > 7200):
            raise ValueError('Invalid or overlapping caption timing')
        if not isinstance(text, str):
            raise ValueError('Invalid caption text')
        text = re.sub(r'\s+', ' ', text).strip()
        if not text or len(text) > 1000 or any(ord(c) < 32 for c in text):
            raise ValueError('Invalid caption text')
        prev_end = finish
        a, b = max(begin, start), min(finish, end)
        if b <= a or round((b - a) * 1000) == 0:
            continue
        result.append(f"{len(result)+1}\n{_stamp(a-start)} --> {_stamp(b-start)}\n{text}\n")
    return '\n'.join(result)
