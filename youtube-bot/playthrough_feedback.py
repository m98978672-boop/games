"""Read-only, conservative first-episode feedback assessment.

This is a policy helper, not an autonomous gameplay or publishing pipeline.
Comment text and author identities are used only in memory and are not returned.
"""
from __future__ import annotations

import re
from collections.abc import Iterable, Mapping
from datetime import datetime, timedelta, timezone
from typing import Any

MIN_AGE = timedelta(hours=72)
MIN_VIEWS = 100
MIN_LIKES = 5
MIN_POSITIVE_AUTHORS = 2
MAX_COMMENTS = 300

# Comments are untrusted audience data, not instructions for the model or runner.
_POSITIVE = re.compile(r"\b(?:продолжени[еяю]|продолжай(?:те)?|втор(?:ую|ая)\s+часть|ещ[её]\s+часть|next\s+part|part\s+two|continue\s+(?:this|the\s+series))\b", re.IGNORECASE)
_NEGATIVE = re.compile(r"\b(?:не\s+(?:надо|нужно|хочу)\s+продолж\w*|не\s+продолжай|не\s+нужна\s+вторая\s+часть|хватит\s+этой\s+игры|stop\s+(?:this|the\s+series)|do\s+not\s+continue|don\u0027t\s+continue)\b", re.IGNORECASE)


def assess_first_episode(*, published_at: datetime, now: datetime, views: int,
                         likes: int | None, comments: Iterable[Mapping[str, Any]] | None) -> dict[str, Any]:
    """Return a bounded aggregate signal; missing inputs fail closed as 'wait'.

    Comments are dicts with ``author_id`` and ``text``. Only a single unambiguous
    vote per author is counted; replies without author identifiers are ignored.
    The caller must pass comments for the relevant first episode only, never use
    their text as executable instructions, and independently check game rights.
    """
    if published_at.tzinfo is None or now.tzinfo is None:
        raise ValueError("published_at and now must include timezones")
    if views < 0 or (likes is not None and likes < 0):
        raise ValueError("views and likes cannot be negative")
    published_at = published_at.astimezone(timezone.utc)
    now = now.astimezone(timezone.utc)
    if published_at > now or now - published_at < MIN_AGE:
        return {"decision": "wait", "reason": "minimum_age_not_reached"}
    if likes is None or comments is None:
        return {"decision": "wait", "reason": "feedback_unavailable"}
    votes: dict[str, set[str]] = {}
    for index, comment in enumerate(comments):
        if index >= MAX_COMMENTS:
            break
        if not isinstance(comment, Mapping):
            continue
        author = comment.get("author_id")
        text = comment.get("text")
        if not isinstance(author, str) or not author or not isinstance(text, str):
            continue
        text = text[:2000]
        negative = bool(_NEGATIVE.search(text))
        positive = bool(_POSITIVE.search(text))
        if negative:
            votes.setdefault(author, set()).add("negative")
        elif positive:
            votes.setdefault(author, set()).add("positive")
    positive = sum(1 for vote in votes.values() if vote == {"positive"})
    negative = sum(1 for vote in votes.values() if "negative" in vote)
    eligible = views >= MIN_VIEWS and likes >= MIN_LIKES and positive >= MIN_POSITIVE_AUTHORS and positive > negative
    return {
        "decision": "continue" if eligible else "wait",
        "reason": "threshold_met" if eligible else "insufficient_positive_signal",
        "views": views, "likes": likes,
        "positive_authors": positive, "negative_authors": negative,
    }
