"""Exploration/exploitation planner for a brand-new Shorts channel.

The planner consumes aggregated per-topic YouTube Analytics metrics and safe,
pre-classified audience requests. It never treats raw comments as instructions.
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Iterable, Mapping


PILOT_TOPICS = (
    ("tiny-mysteries", "Короткие загадки и неожиданные объяснения"),
    ("animal-comedy", "Добрые смешные истории с животными"),
    ("everyday-comedy", "Узнаваемые комические ситуации из жизни"),
    ("micro-fantasy", "Короткие оригинальные сказочные истории"),
    ("game-worlds", "Истории и идеи из мира игр и разработки"),
)


@dataclass(frozen=True)
class TopicMetrics:
    videos: int = 0
    views: int = 0
    watch_seconds: float = 0.0
    video_seconds: float = 0.0
    likes: int = 0
    comments: int = 0
    subscribers_gained: int = 0
    audience_requests: int = 0


def _unit(value: float) -> float:
    return max(0.0, min(1.0, value))


def topic_score(metrics: TopicMetrics, total_videos: int) -> float:
    """Score normalized viewer response with an exploration bonus.

    For a new channel the exploration term dominates, so every pilot topic gets
    a fair first test. As data accumulates, retention and engagement matter
    more. Counts are aggregated by topic; raw comments are not accepted here.
    """
    n = max(0, metrics.videos)
    views = max(0, metrics.views)
    if n == 0 or views == 0:
        performance = 0.0
    else:
        retention = _unit(metrics.watch_seconds / max(metrics.video_seconds, 1.0))
        engagement = _unit((metrics.likes + metrics.comments) / views * 12.0)
        conversion = _unit(metrics.subscribers_gained / views * 80.0)
        requests = _unit(metrics.audience_requests / max(metrics.comments, 1))
        performance = 0.52 * retention + 0.25 * engagement + 0.15 * conversion + 0.08 * requests
    total = max(1, total_videos)
    explore = 0.24 * math.sqrt(math.log(total + 2) / (n + 1))
    confidence = n / (n + 2)
    return confidence * performance + explore


def choose_topic(
    metrics_by_topic: Mapping[str, TopicMetrics] | None = None,
    *,
    pilot_topics: Iterable[tuple[str, str]] = PILOT_TOPICS,
) -> tuple[str, str]:
    """Return the next topic id/name, exploring first and adapting to evidence."""
    topics = tuple(pilot_topics)
    if not topics:
        raise ValueError("pilot topic list cannot be empty")
    data = metrics_by_topic or {}
    total = sum(max(0, item.videos) for item in data.values())
    ranked = sorted(
        topics,
        key=lambda topic: (
            topic_score(data.get(topic[0], TopicMetrics()), total),
            -next((i for i, candidate in enumerate(topics) if candidate[0] == topic[0]), 0),
        ),
        reverse=True,
    )
    return ranked[0]


def metrics_from_analytics_rows(rows: Iterable[Mapping[str, object]]) -> dict[str, TopicMetrics]:
    """Aggregate API rows carrying a trusted bot topic tag and video metrics."""
    accum: dict[str, dict[str, float]] = {}
    for row in rows:
        topic = str(row.get("topic_id", ""))
        if not topic:
            continue
        values = accum.setdefault(topic, {key: 0.0 for key in (
            "videos", "views", "watch_seconds", "video_seconds", "likes", "comments", "subscribers_gained", "audience_requests"
        )})
        for key in values:
            try:
                values[key] += max(0.0, float(row.get(key, 0) or 0))
            except (TypeError, ValueError):
                continue
    return {
        topic: TopicMetrics(
            videos=int(data["videos"]), views=int(data["views"]),
            watch_seconds=data["watch_seconds"], video_seconds=data["video_seconds"],
            likes=int(data["likes"]), comments=int(data["comments"]),
            subscribers_gained=int(data["subscribers_gained"]),
            audience_requests=int(data["audience_requests"]),
        )
        for topic, data in accum.items()
    }
