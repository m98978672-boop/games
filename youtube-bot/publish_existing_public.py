"""Make a bot-owned scheduled review public immediately via the OIDC-locked edge function."""
from __future__ import annotations

import json
import re
import sys
import urllib.error
import urllib.request

from publish_to_supabase import PublishError, _safe_urlopen, github_oidc_token

ENDPOINT = "https://cuhfnzgytndyntpbnbda.supabase.co/functions/v1/youtube-publish-public"
VIDEO_ID_RE = re.compile(r"^[A-Za-z0-9_-]{6,80}$")


def publish_existing(video_id: str) -> dict[str, object]:
    if not VIDEO_ID_RE.fullmatch(video_id):
        raise PublishError("Video ID has an invalid format.")
    token = github_oidc_token()
    request = urllib.request.Request(
        ENDPOINT,
        data=json.dumps({"video_id": video_id}, separators=(",", ":")).encode("utf-8"),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with _safe_urlopen(request, timeout=45) as response:
            result = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        try:
            body = json.loads(exc.read(2048).decode("utf-8"))
        except Exception:
            body = {}
        detail = body.get("error", f"HTTP {exc.code}") if isinstance(body, dict) else f"HTTP {exc.code}"
        raise PublishError(f"Could not change the scheduled video to public: {str(detail)[:200]}") from exc
    except Exception as exc:
        raise PublishError("Could not reach the protected YouTube visibility endpoint.") from exc
    if not isinstance(result, dict) or result.get("status") != "public" or result.get("video_id") != video_id:
        raise PublishError("YouTube did not confirm that the existing video is public.")
    print(json.dumps(result, ensure_ascii=False))
    return result


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python publish_existing_public.py VIDEO_ID")
    try:
        publish_existing(sys.argv[1])
    except Exception as exc:
        print(f"Safe publish stop: {exc}", file=sys.stderr)
        raise SystemExit(1)
