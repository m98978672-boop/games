"""Read-only YouTube Analytics ingestion with comments reduced to counts in memory."""
from __future__ import annotations

import re
from datetime import date, timedelta
from typing import Any, Mapping

from audience import TopicMetrics, metrics_from_analytics_rows

TOPIC_TAG_PREFIX = "bot-topic:"

# Conservative Russian/English signals; only aggregate counts leave this module.
REQUEST_TERMS = ("хочу", "сделай", "расскажи", "ещё", "еще", "следующ", "про", "more", "please", "about")
TOPIC_TERMS = ("загад", "живот", "animal", "комед", "сказ", "фантаз", "игр", "код", "программ")


def parse_duration_seconds(value: str) -> float:
    """Parse the YouTube API's ISO 8601 duration without another dependency."""
    match = re.fullmatch(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?", value or "")
    if not match:
        return 0.0
    hours, minutes, seconds = match.groups()
    return int(hours or 0) * 3600 + int(minutes or 0) * 60 + float(seconds or 0)


def _comment_requests(youtube: Any, video_id: str) -> int:
    """Classify comments in memory; never return/store raw text or author identity."""
    requests = 0
    token = None
    for _ in range(3):  # At most 300 recent top-level comments per video; bound API quota.
        page = youtube.commentThreads().list(
            part="snippet", videoId=video_id, maxResults=100, pageToken=token,
            textFormat="plainText", order="time",
        ).execute()
        for item in page.get("items", []):
            text = item.get("snippet", {}).get("topLevelComment", {}).get("snippet", {}).get("textDisplay", "")
            lowered = str(text).lower()
            if any(term in lowered for term in REQUEST_TERMS) and any(term in lowered for term in TOPIC_TERMS):
                requests += 1
        token = page.get("nextPageToken")
        if not token:
            break
    return requests


def fetch_topic_metrics(credentials: Any, *, days: int = 28, include_comments: bool = True) -> dict[str, TopicMetrics]:
    """Fetch recent owned-channel metrics and aggregate only bot-tagged videos.

    Videos not carrying a known ``bot-topic:...`` tag are excluded so the pilot
    optimizer does not make claims about unrelated channel content. Raw comments
    are inspected only transiently for a coarse request count and are never saved.
    """
    if not 1 <= days <= 365:
        raise ValueError("days must be from 1 to 365")
    from googleapiclient.discovery import build

    analytics = build("youtubeAnalytics", "v2", credentials=credentials, cache_discovery=False)
    youtube = build("youtube", "v3", credentials=credentials, cache_discovery=False)
    end = date.today() - timedelta(days=2)  # Analytics data is not necessarily same-day complete.
    start = end - timedelta(days=days - 1)
    report = analytics.reports().query(
        ids="channel==MINE", startDate=start.isoformat(), endDate=end.isoformat(),
        metrics="views,estimatedMinutesWatched,likes,comments,subscribersGained",
        dimensions="video", maxResults=200,
    ).execute()
    headers = [entry["name"] for entry in report.get("columnHeaders", [])]
    rows: list[dict[str, Any]] = []
    for values in report.get("rows", []):
        rows.append(dict(zip(headers, values)))
    videos: dict[str, dict[str, Any]] = {}
    for offset in range(0, len(rows), 50):
        ids = [str(row.get("video")) for row in rows[offset:offset + 50] if row.get("video")]
        if not ids:
            continue
        response = youtube.videos().list(part="snippet,contentDetails", id=",".join(ids), maxResults=50).execute()
        videos.update({item["id"]: item for item in response.get("items", [])})
    topic_names = dict(PILOT_TOPICS)
    aggregate_rows: list[dict[str, Any]] = []
    for row in rows:
        video_id = str(row.get("video", ""))
        video = videos.get(video_id)
        if not video:
            continue
        tags = video.get("snippet", {}).get("tags", [])
        topic = next((tag[len(TOPIC_TAG_PREFIX):] for tag in tags if tag.startswith(TOPIC_TAG_PREFIX)), "")
        if topic not in topic_names:
            continue
        duration = parse_duration_seconds(video.get("contentDetails", {}).get("duration", ""))
        views = max(0, int(row.get("views", 0) or 0))
        watch_seconds = max(0.0, float(row.get("estimatedMinutesWatched", 0) or 0) * 60)
        comments = max(0, int(row.get("comments", 0) or 0))
        request_count = _comment_requests(youtube, video_id) if include_comments and comments else 0
        aggregate_rows.append({
            "topic_id": topic, "videos": 1, "views": views,
            "watch_seconds": watch_seconds, "video_seconds": duration * views,
            "likes": max(0, int(row.get("likes", 0) or 0)), "comments": comments,
            "subscribers_gained": max(0, int(row.get("subscribersGained", 0) or 0)),
            "audience_requests": request_count,
        })
    return metrics_from_analytics_rows(aggregate_rows)
