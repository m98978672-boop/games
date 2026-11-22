"""Read audience signals for one *owned and public* first episode.

Requires the separate comment-assistant OAuth connection. This module does not
post comments, execute audience text, publish a video or resume a game. Missing
or inaccessible data returns 'wait', never approval to continue.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from typing import Any

from comment_assistant import _channel_id, _youtube
from playthrough_feedback import MAX_COMMENTS, assess_first_episode

VIDEO_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")


def assess_video(youtube: Any, video_id: str, *, now: datetime | None = None, required_tag: str | None = None) -> dict[str, Any]:
    if not VIDEO_ID.fullmatch(video_id):
        raise ValueError("Invalid YouTube video ID")
    now = now or datetime.now(timezone.utc)
    if now.tzinfo is None or now.utcoffset() is None:
        raise ValueError("now must include a timezone")
    try:
        owner = _channel_id(youtube)
        videos = youtube.videos().list(part="snippet,status,statistics", id=video_id, maxResults=1).execute().get("items", [])
        if len(videos) != 1:
            return {"decision": "wait", "reason": "video_unavailable"}
        video = videos[0]
        snippet, status, stats = video.get("snippet", {}), video.get("status", {}), video.get("statistics", {})
        if snippet.get("channelId") != owner:
            return {"decision": "wait", "reason": "video_not_owned"}
        if status.get("privacyStatus") != "public":
            return {"decision": "wait", "reason": "not_public"}
        if required_tag:
            tags = snippet.get("tags")
            if not isinstance(tags, list) or required_tag not in tags:
                return {"decision": "wait", "reason": "game_tag_missing"}
        # For public videos YouTube's snippet.publishedAt reports when they became
        # public. A missing/invalid timestamp, likes or views fails closed.
        published = datetime.fromisoformat(str(snippet["publishedAt"]).replace("Z", "+00:00"))
        if published.tzinfo is None:
            raise ValueError("publication time has no timezone")
        views, likes = int(stats["viewCount"]), int(stats["likeCount"])
        preliminary = assess_first_episode(published_at=published, now=now, views=views, likes=likes, comments=[])
        if preliminary.get("reason") == "minimum_age_not_reached":
            return preliminary
        comments: list[dict[str, str]] = []
        token = None
        seen_tokens: set[str] = set()
        while len(comments) < MAX_COMMENTS:
            page = youtube.commentThreads().list(
                part="snippet", videoId=video_id, maxResults=min(100, MAX_COMMENTS - len(comments)),
                order="time", textFormat="plainText", pageToken=token,
            ).execute()
            items = page.get("items", [])
            if not isinstance(items, list):
                raise ValueError("Invalid comments page")
            for thread in items:
                top = thread.get("snippet", {}).get("topLevelComment", {}).get("snippet", {})
                author = top.get("authorChannelId", {}).get("value")
                if isinstance(author, str) and author and author != owner:
                    comments.append({"author_id": author, "text": str(top.get("textDisplay", ""))[:2000]})
                if len(comments) >= MAX_COMMENTS:
                    break
            next_token = page.get("nextPageToken")
            if not next_token:
                break
            if not isinstance(next_token, str) or next_token in seen_tokens:
                raise ValueError("Repeated comments page token")
            seen_tokens.add(next_token)
            token = next_token
            if len(seen_tokens) >= 3:  # Bound calls even if pages contain no eligible comments.
                break
        return assess_first_episode(published_at=published, now=now, views=views, likes=likes, comments=comments)
    except Exception as exc:
        # No raw comments, tokens, or API error bodies in logs or output.
        print(f"Feedback unavailable ({type(exc).__name__}); waiting.", file=sys.stderr)
        return {"decision": "wait", "reason": "feedback_unavailable"}


def main() -> None:
    parser = argparse.ArgumentParser(description="Assess aggregate feedback for an owned public episode; does not post or publish.")
    parser.add_argument("video_id")
    args = parser.parse_args()
    print(json.dumps(assess_video(_youtube(), args.video_id), ensure_ascii=False))


if __name__ == "__main__":
    main()
