"""Bounded cloud comment cycle; never prints comments, model output or tokens.

Requires the isolated comments service, OIDC and a persistent server-side ledger.
No GitHub cache or ephemeral SQLite database is used for duplicate prevention.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.request
from typing import Any, Callable

import comment_assistant as comments
from publish_to_supabase import _mask, _safe_urlopen, github_oidc_token

BASE = 'https://cuhfnzgytndyntpbnbda.supabase.co/functions/v1/youtube-comments'
ROUTES = {'token', 'reserve', 'sent'}


def service(route: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    if route not in ROUTES:
        raise ValueError('Unapproved comments service route')
    identity = github_oidc_token(audience='youtube-comments')
    request = urllib.request.Request(
        f'{BASE}/worker/{route}', data=json.dumps(payload or {}).encode('utf-8'),
        headers={'Authorization': f'Bearer {identity}', 'Content-Type': 'application/json'}, method='POST',
    )
    # No retries: reservation or delivery might have completed despite a timeout.
    try:
        with _safe_urlopen(request, timeout=45) as response:
            result = json.loads(response.read(65536))
    except Exception as exc:
        raise RuntimeError('Comment service request failed; no automatic retry.') from exc
    if not isinstance(result, dict):
        raise RuntimeError('Invalid comment service response.')
    return result


def run(youtube: Any, channel: str, *, api: Callable = service, generator: Any = None,
        dry_run: bool = True) -> dict[str, int]:
    if not isinstance(channel, str) or comments._channel_id(youtube) != channel:
        raise RuntimeError('The YouTube channel does not match the authorized channel.')
    # AI sees bounded untrusted text without author identifiers. Do not print
    # summaries: they may accidentally contain private or identifying details.
    summaries = comments.summarize_channel(youtube, generator=generator, video_limit=5)
    if dry_run:
        return {'videos_analyzed': len(summaries), 'sent': 0}
    sent = 0
    scanned_videos = scanned_comments = matched = answered = 0
    for video_id in comments.recent_public_videos(youtube, limit=200):
        try:
            recent = comments.list_comments(youtube, video_id, limit=500)
        except Exception as exc:
            if comments._comments_disabled(exc):
                continue
            raise
        scanned_videos += 1
        scanned_comments += len(recent)
        for comment in recent:
            reply = comments.automatic_reply(comment['text'])
            if not reply:
                continue
            matched += 1
            actual_channel, verified_video = comments._verified_thread(youtube, comment['id'])
            if actual_channel != channel or verified_video != video_id:
                raise RuntimeError('Comment ownership changed; stopping.')
            if comments.has_any_reply(youtube, comment['id']):
                answered += 1
                continue
            if api('reserve', {'parent_id': comment['id']}).get('reserved') is not True:
                continue
            # A timeout may mean YouTube accepted it. The server reservation is
            # permanent even when this call fails or the runner disappears.
            result = youtube.comments().insert(part='snippet', body={'snippet': {
                'parentId': comment['id'], 'textOriginal': reply,
            }}).execute(num_retries=0)
            reply_id = result.get('id')
            if not isinstance(reply_id, str) or not reply_id:
                raise RuntimeError('Reply outcome uncertain; check Studio.')
            if api('sent', {'parent_id': comment['id'], 'reply_id': reply_id}).get('recorded') is not True:
                raise RuntimeError('Reply record uncertain; check Studio.')
            sent += 1
            if sent >= 50:
                break
        if sent >= 50:
            break
    return {'videos_analyzed': len(summaries), 'sent': sent, 'videos_scanned': scanned_videos,
            'comments_scanned': scanned_comments, 'matched': matched, 'already_answered': answered}


def main() -> None:
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    info = service('token')
    token, channel = info.get('access_token'), info.get('channel_id')
    if not isinstance(token, str) or not token or not isinstance(channel, str):
        raise RuntimeError('Comments authorization is unavailable.')
    _mask(token)
    youtube = build('youtube', 'v3', credentials=Credentials(token=token), cache_discovery=False)
    setting = os.environ.get('COMMENTS_DRY_RUN', 'true')
    if setting not in {'true', 'false'}:
        raise RuntimeError('Invalid dry-run setting.')
    result = run(youtube, channel, dry_run=setting != 'false')
    # Only integer counters, never comments, authors, channel IDs or model output.
    print("::notice title=Comment cycle counts::" + json.dumps(result, ensure_ascii=True))


if __name__ == '__main__':
    try:
        main()
    except Exception:
        # API exceptions can contain untrusted comment text or token-bearing URLs.
        print('Цикл комментариев остановлен; проверьте доступ и YouTube Studio. Автоповтор отключён.', file=sys.stderr)
        raise SystemExit(1)
