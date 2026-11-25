"""Deterministic speech-length guardrails for short-form narration."""
from __future__ import annotations

import re
from collections.abc import Callable


def speech_excerpt(text: str, char_budget: int) -> str:
    """Return a readable, visibly clipped excerpt that never exceeds its budget."""
    clean = re.sub(r"\s+", " ", str(text)).strip()
    if char_budget < 8:
        raise ValueError("speech excerpt budget must be at least 8 characters")
    if len(clean) <= char_budget:
        return clean

    # Prefer a complete sentence/clause when it uses most of the available budget.
    prefix = clean[:char_budget]
    sentence_ends = [match.end() for match in re.finditer(r"[.!?;](?:\s|$)", prefix)]
    if sentence_ends and sentence_ends[-1] >= int(char_budget * 0.55):
        return clean[:sentence_ends[-1]].strip()

    clipped = prefix.rsplit(" ", 1)[0].rstrip(" ,;:—–-")
    if not clipped:
        clipped = prefix.rstrip()
    return clipped[:char_budget - 1].rstrip() + "…"


def fit_speech_text(
    text: str,
    measure_seconds: Callable[[str], float],
    *,
    max_seconds: float = 12.0,
    attempts: int = 5,
    fallback: str = "Короткий разбор игрового проекта.",
) -> tuple[str, float]:
    """Measure TTS output, shorten safely until it fits, then use a neutral fallback.

    ``measure_seconds`` can synthesize to a temporary path; the returned text is
    the exact line the renderer should display and narrate.
    """
    candidate = re.sub(r"\s+", " ", str(text)).strip()
    for _ in range(max(1, attempts)):
        seconds = float(measure_seconds(candidate))
        if seconds <= max_seconds:
            return candidate, seconds
        if len(candidate) <= 24:
            break
        # Leave a margin for prosody and punctuation; do not optimize right up to the hard cap.
        ratio = min(0.78, max(0.4, (max_seconds / seconds) * 0.78))
        budget = max(24, min(len(candidate) - 1, int(len(candidate) * ratio)))
        shorter = speech_excerpt(candidate, budget)
        if shorter == candidate:
            shorter = speech_excerpt(candidate, max(8, len(candidate) - 12))
        # A clipped clause can sound unfinished or change the meaning.
        # Use the complete neutral fallback instead of speaking an ellipsis.
        if shorter.endswith("…"):
            break
        candidate = shorter

    fallback_text = re.sub(r"\s+", " ", fallback).strip()
    fallback_seconds = float(measure_seconds(fallback_text))
    if fallback_seconds <= max_seconds:
        return fallback_text, fallback_seconds
    raise ValueError("Even the neutral narration fallback exceeds the scene time budget.")
