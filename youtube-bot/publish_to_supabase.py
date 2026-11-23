"""Prepare a safe YouTube upload with Supabase, then upload directly from Actions.

The old design proxied the entire MP4 through a Supabase Edge Function. A long
upload could outlive the edge request and return an ambiguous 503. This version
keeps Supabase out of the data path: it reserves one publish slot and returns a
short-lived, upload-only Google token; the runner then uses YouTube's resumable
protocol directly, reconciling each uncertain chunk before retrying it.
"""
from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from datetime import datetime, timedelta, timezone
from schedule_policy import next_publish_slot
from pathlib import Path
from typing import Any

SUPABASE_BASE = "https://cuhfnzgytndyntpbnbda.supabase.co/functions/v1/youtube-bot"
SUPABASE_HOST = "cuhfnzgytndyntpbnbda.supabase.co"
YOUTUBE_INIT_URL = "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status"
YOUTUBE_UPLOAD_HOST = "www.googleapis.com"
MAX_VIDEO_BYTES = 512 * 1024 * 1024
CHUNK_BYTES = 256 * 1024  # YouTube resumable uploads require 256 KiB multiples, except the last chunk.
API_ATTEMPTS = 4
CHUNK_ATTEMPTS = 5
TRANSIENT_HTTP = {429, 500, 502, 503, 504}
OIDC_HOST_SUFFIX = ".actions.githubusercontent.com"
SUPABASE_PATHS = {"/autopilot/prepare", "/autopilot/complete", "/autopilot/fail"}


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    """Never forward an OIDC or Google bearer token to a redirect destination."""

    def redirect_request(self, request, fp, code, message, headers, new_url):
        return None


_NO_REDIRECT_OPENER = urllib.request.build_opener(_NoRedirect())


def _safe_urlopen(request: urllib.request.Request, timeout: int):
    return _NO_REDIRECT_OPENER.open(request, timeout=timeout)


class PublishError(RuntimeError):
    """A safe-to-print publishing failure; never includes credentials or upload URLs."""


class SlotOccupied(PublishError):
    """Publisher positively identified a different job holding the slot."""


def _different_job_id(value: Any, expected: Any) -> bool:
    if not isinstance(value, str) or not isinstance(expected, str):
        return False
    try:
        return uuid.UUID(value) != uuid.UUID(expected)
    except ValueError:
        return False


def _mask(secret: str) -> None:
    if secret:
        print(f"::add-mask::{secret}")


def _is_github_oidc_endpoint(parsed: urllib.parse.SplitResult) -> bool:
    """Accept HTTPS OIDC endpoints on GitHub Actions-owned subdomains only."""
    host = (parsed.hostname or "").lower().rstrip(".")
    github_actions_host = host.endswith(OIDC_HOST_SUFFIX) and bool(host.removesuffix(OIDC_HOST_SUFFIX))
    try:
        port_ok = parsed.port in (None, 443)
    except ValueError:
        return False
    return (
        parsed.scheme.lower() == "https"
        and github_actions_host
        and parsed.username is None
        and parsed.password is None
        and port_ok
    )


def github_oidc_token() -> str:
    """Request a fresh audience-scoped GitHub token for each Supabase API call."""
    request_url = os.environ.get("ACTIONS_ID_TOKEN_REQUEST_URL", "")
    request_token = os.environ.get("ACTIONS_ID_TOKEN_REQUEST_TOKEN", "")
    if not request_url or not request_token:
        raise PublishError("GitHub Actions OIDC is unavailable; refusing unauthenticated publish.")
    parsed = urllib.parse.urlsplit(request_url)
    if not _is_github_oidc_endpoint(parsed):
        # Host and URL path/query are intentionally omitted: the latter may contain sensitive data.
        host = parsed.hostname or "(missing)"
        raise PublishError(
            f"GitHub provided an unexpected OIDC endpoint (HTTPS GitHub Actions host required; got {host!r}); "
            "refusing to send its credential."
        )
    query = urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
    query = [(key, value) for key, value in query if key != "audience"]
    query.append(("audience", "youtube-bot"))
    url = urllib.parse.urlunsplit(("https", parsed.netloc, parsed.path, urllib.parse.urlencode(query), ""))
    request = urllib.request.Request(url, headers={"Authorization": f"Bearer {request_token}"})
    _mask(request_token)
    try:
        with _safe_urlopen(request, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        raise PublishError("Could not obtain a GitHub OIDC identity token.") from exc
    token = payload.get("value")
    if not isinstance(token, str) or len(token) < 100:
        raise PublishError("GitHub returned an invalid OIDC token.")
    _mask(token)
    return token


def _retry_delay(attempt: int, retry_after: str | None = None) -> float:
    """Bounded exponential backoff; honor a numeric Retry-After when supplied."""
    if retry_after:
        try:
            return min(30.0, max(1.0, float(retry_after)))
        except ValueError:
            pass
    return min(20.0, 2.0 ** attempt)


def _safe_json(data: bytes) -> dict[str, Any]:
    try:
        value = json.loads(data.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return {}
    return value if isinstance(value, dict) else {}


def _read_http_error(exc: urllib.error.HTTPError) -> tuple[int, Any, bytes]:
    try:
        body = exc.read(2048)
    except Exception:
        body = b""
    return exc.code, exc.headers or {}, body


def _supabase_post(path: str, payload: dict[str, Any]) -> dict[str, Any]:
    """Call only the fixed publisher origin; safely retry idempotent job operations."""
    url = f"{SUPABASE_BASE}{path}"
    parsed = urllib.parse.urlsplit(url)
    route = parsed.path.removeprefix("/functions/v1/youtube-bot")
    if parsed.scheme != "https" or parsed.hostname != SUPABASE_HOST or route not in SUPABASE_PATHS:
        raise PublishError("Publisher URL failed the network allowlist.")
    body = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    last_issue = "publisher did not respond"
    for attempt in range(API_ATTEMPTS):
        oidc = github_oidc_token()
        request = urllib.request.Request(
            url, data=body,
            headers={"Authorization": f"Bearer {oidc}", "Content-Type": "application/json"},
            method="POST",
        )
        try:
            with _safe_urlopen(request, timeout=45) as response:
                result = _safe_json(response.read())
                if not result:
                    raise PublishError("Publisher returned an empty or invalid JSON response.")
                return result
        except urllib.error.HTTPError as exc:
            status, headers, response_body = _read_http_error(exc)
            result = _safe_json(response_body)
            # A conflict is idempotent only when the publisher identifies the exact
            # same job. A different job sharing a publish slot must never look successful.
            expected_job_id = payload.get("job_id")
            if isinstance(payload.get("metadata"), dict):
                expected_job_id = payload["metadata"].get("job_id")
            if (status == 409 and result.get("status") in {"scheduled", "processing"}
                    and isinstance(expected_job_id, str) and bool(expected_job_id)
                    and result.get("job_id") == expected_job_id):
                return result
            if (path == "/autopilot/prepare" and status == 409 and result.get("status") == "scheduled"
                    and _different_job_id(result.get("job_id"), expected_job_id)):
                raise SlotOccupied("Publish slot belongs to a different job; no upload was started.") from exc
            if status not in TRANSIENT_HTTP:
                detail = result.get("error") or result.get("message") or f"HTTP {status}"
                raise PublishError(f"Publisher rejected the request: {str(detail)[:240]}.") from exc
            last_issue = f"HTTP {status}"
            delay = _retry_delay(attempt, headers.get("Retry-After"))
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            last_issue = type(exc).__name__
            delay = _retry_delay(attempt)
        if attempt + 1 < API_ATTEMPTS:
            print(f"Publisher temporarily unavailable ({last_issue}); safe retry {attempt + 2}/{API_ATTEMPTS} in {delay:g}s.")
            time.sleep(delay)
    raise PublishError(
        f"Publisher remained unavailable after {API_ATTEMPTS} safe attempts ({last_issue}). "
        "No blind duplicate upload was started; inspect the job status before retrying."
    )


def _validate_upload_url(url: str) -> None:
    parsed = urllib.parse.urlsplit(url)
    if (parsed.scheme != "https" or parsed.hostname != YOUTUBE_UPLOAD_HOST or
            parsed.username or parsed.password or parsed.port not in (None, 443) or
            parsed.path != "/upload/youtube/v3/videos"):
        raise PublishError("YouTube returned a resumable URL outside the upload network allowlist.")


def _http_request(request: urllib.request.Request, timeout: int = 45) -> tuple[int, Any, bytes]:
    """Return status, headers, and response body, including resumable HTTP 308."""
    try:
        with _safe_urlopen(request, timeout=timeout) as response:
            return response.status, response.headers, response.read()
    except urllib.error.HTTPError as exc:
        return _read_http_error(exc)
    except (urllib.error.URLError, TimeoutError, OSError):
        raise


def _offset_from_range(value: str | None) -> int:
    if not value:
        return 0
    prefix = "bytes=0-"
    if not value.startswith(prefix):
        raise PublishError("YouTube returned an invalid resumable-upload range.")
    try:
        return int(value[len(prefix):]) + 1
    except ValueError as exc:
        raise PublishError("YouTube returned an invalid resumable-upload range.") from exc


def _completed_video(status: int, body: bytes) -> str | None:
    if status not in (200, 201):
        return None
    video_id = _safe_json(body).get("id")
    return video_id if isinstance(video_id, str) and video_id else None


def _query_upload_offset(upload_url: str, total: int, access_token: str) -> tuple[int, str | None]:
    """Ask YouTube which bytes it already has after any ambiguous network failure."""
    request = urllib.request.Request(
        upload_url, data=b"", method="PUT",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Length": "0",
            "Content-Range": f"bytes */{total}",
        },
    )
    try:
        status, headers, body = _http_request(request)
    except (urllib.error.URLError, TimeoutError, OSError):
        return -1, None
    video_id = _completed_video(status, body)
    if video_id:
        return total, video_id
    if status == 308:
        return _offset_from_range(headers.get("Range")), None
    if status in TRANSIENT_HTTP:
        return -1, None
    if status in (404, 410):
        raise PublishError("YouTube upload session expired; the video was not restarted to avoid a duplicate.")
    raise PublishError(f"YouTube could not resume the upload (HTTP {status}).")


def _upload_resumably(upload_url: str, video: bytes, access_token: str) -> str:
    _validate_upload_url(upload_url)
    total = len(video)
    offset = 0
    for chunk_index in range((total + CHUNK_BYTES - 1) // CHUNK_BYTES + CHUNK_ATTEMPTS * 3):
        if offset >= total:
            break
        end = min(offset + CHUNK_BYTES, total)
        chunk = video[offset:end]
        request = urllib.request.Request(
            upload_url, data=chunk, method="PUT",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "video/mp4",
                "Content-Length": str(len(chunk)),
                "Content-Range": f"bytes {offset}-{end - 1}/{total}",
            },
        )
        for attempt in range(CHUNK_ATTEMPTS):
            try:
                status, headers, body = _http_request(request)
            except (urllib.error.URLError, TimeoutError, OSError):
                status, headers, body = 503, {}, b""
            video_id = _completed_video(status, body)
            if video_id:
                return video_id
            if status == 308:
                acknowledged = _offset_from_range(headers.get("Range"))
                if acknowledged <= offset:
                    raise PublishError("YouTube did not acknowledge upload progress; stopping safely.")
                if acknowledged > end:
                    raise PublishError("YouTube acknowledged unsent bytes; stopping to avoid corruption.")
                offset = acknowledged
                break
            if status in TRANSIENT_HTTP:
                # Never blindly repeat a chunk. Query session state first, then continue at its offset.
                # If the status probe is unavailable, retry the probe, not the
                # PUT: the original chunk may already have been received.
                resumed_offset, completed_id = -1, None
                for probe in range(CHUNK_ATTEMPTS):
                    time.sleep(_retry_delay(probe, headers.get("Retry-After")))
                    resumed_offset, completed_id = _query_upload_offset(upload_url, total, access_token)
                    if completed_id or resumed_offset >= 0:
                        break
                if completed_id:
                    return completed_id
                if resumed_offset >= 0:
                    if resumed_offset > end:
                        raise PublishError("YouTube acknowledged unsent bytes; stopping to avoid corruption.")
                    if resumed_offset == end:
                        offset = resumed_offset
                        break
                    if resumed_offset < offset:
                        raise PublishError("YouTube upload position moved backwards; stopping to avoid corruption.")
                    # The server has only a prefix of this chunk; resend from that exact byte.
                    offset = resumed_offset
                    end = min(offset + CHUNK_BYTES, total)
                    chunk = video[offset:end]
                    request = urllib.request.Request(
                        upload_url, data=chunk, method="PUT",
                        headers={
                            "Authorization": f"Bearer {access_token}",
                            "Content-Type": "video/mp4",
                            "Content-Length": str(len(chunk)),
                            "Content-Range": f"bytes {offset}-{end - 1}/{total}",
                        },
                    )
                    continue
                raise PublishError("YouTube upload stayed unavailable after resumable status checks; no chunk was resent without confirmation.")
            raise PublishError(f"YouTube rejected a resumable upload chunk (HTTP {status}).")
        else:
            raise PublishError("YouTube upload chunk exhausted its retry budget.")
        if chunk_index + 1 >= (total + CHUNK_BYTES - 1) // CHUNK_BYTES + CHUNK_ATTEMPTS * 3:
            raise PublishError("YouTube upload exceeded its bounded retry budget.")
    if offset >= total:
        final_offset, video_id = _query_upload_offset(upload_url, total, access_token)
        if video_id:
            return video_id
        raise PublishError(f"YouTube acknowledged {final_offset} bytes but did not return a video ID; check Studio before retrying.")
    raise PublishError("YouTube upload ended without a video ID; check Studio before retrying.")


def _start_youtube_session(metadata: dict[str, Any], video: bytes, access_token: str) -> str:
    video_status = {
        "privacyStatus": "private",
        "publishAt": metadata["publish_at"],
        "selfDeclaredMadeForKids": metadata["made_for_kids"],
    }
    youtube_metadata = {
        "snippet": {
            "title": metadata["title"],
            "description": metadata["description"],
            "tags": metadata["tags"],
            "categoryId": metadata["category_id"],
        },
        "status": video_status,
    }
    body = json.dumps(youtube_metadata, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    last_status = 0
    for attempt in range(3):
        request = urllib.request.Request(
            YOUTUBE_INIT_URL, data=body, method="POST",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json; charset=UTF-8",
                "X-Upload-Content-Length": str(len(video)),
                "X-Upload-Content-Type": "video/mp4",
            },
        )
        try:
            status, headers, response_body = _http_request(request)
        except (urllib.error.URLError, TimeoutError, OSError):
            status, headers, response_body = 503, {}, b""
        location = headers.get("Location")
        if status in (200, 201) and location:
            _validate_upload_url(location)
            return location
        last_status = status
        if status not in TRANSIENT_HTTP:
            error_value = _safe_json(response_body).get("error", {})
            detail = error_value.get("message", "") if isinstance(error_value, dict) else str(error_value)
            raise PublishError(f"YouTube could not start the upload (HTTP {status}): {str(detail)[:180]}".rstrip())
        if attempt < 2:
            time.sleep(_retry_delay(attempt, headers.get("Retry-After")))
    raise PublishError(f"YouTube could not start a resumable session after retries (HTTP {last_status}).")


def publish(result_path: Path) -> dict[str, Any]:
    result = json.loads(result_path.read_text(encoding="utf-8"))
    metadata = dict(result.get("metadata", {}))
    video_path = Path(metadata.pop("video_path", ""))
    made_for_kids = os.environ.get("YOUTUBE_MADE_FOR_KIDS", "").strip().lower()
    if made_for_kids not in {"true", "false"}:
        raise PublishError("Audience classification must be the explicit value true or false.")
    metadata["made_for_kids"] = made_for_kids == "true"
    if not video_path.is_file():
        raise PublishError("Rendered video file is missing.")
    video = video_path.read_bytes()
    if len(video) < 1024 or len(video) > MAX_VIDEO_BYTES:
        raise PublishError(f"Rendered video must be 1 KiB–512 MiB; got {len(video)} bytes.")
    for field in ("job_id", "game_id", "title", "description", "tags", "category_id", "publish_at"):
        if field not in metadata:
            raise PublishError(f"Review metadata is missing {field}.")

    # Only a positively identified different job is safe to move around. A
    # missing job ID, network failure or same-job result remains ambiguous.
    for slot_attempt in range(4):
        try:
            prepared = _supabase_post("/autopilot/prepare", {"metadata": metadata})
            if (prepared.get("status") == "scheduled" and prepared.get("video_id")
                    and _different_job_id(prepared.get("job_id"), metadata["job_id"])):
                raise SlotOccupied("Publish slot belongs to a different job; no upload was started.")
            break
        except SlotOccupied:
            # Only a positively identified, already-scheduled different job
            # reaches this branch. Never move an explicitly requested time.
            if metadata.get("requested_publish_at"):
                raise PublishError("Requested publication slot is occupied; no upload was started. Choose another time after checking Studio.")
            if slot_attempt == 3:
                raise PublishError("Four regular publication slots were occupied; no upload was started.")
            try:
                previous = datetime.fromisoformat(str(metadata["publish_at"]).replace("Z", "+00:00"))
                video_format = metadata.get("video_format")
                if previous.tzinfo is None or video_format not in {"short", "long"}:
                    raise ValueError("Timezone and format required")
                next_slot = next_publish_slot(previous.astimezone(timezone.utc) + timedelta(seconds=1),
                                              video_format=video_format, min_lead=timedelta(0))
                metadata["publish_at"] = next_slot.isoformat().replace("+00:00", "Z")
            except (TypeError, ValueError, OverflowError) as exc:
                raise PublishError("Cannot safely find the next regular slot; no upload was started.") from exc
            print(f"::warning::A different scheduled job occupies this slot; trying next regular slot {metadata['publish_at']}. No upload has started yet.")
    if prepared.get("status") == "scheduled" and prepared.get("video_id"):
        if prepared.get("job_id") != metadata["job_id"]:
            raise PublishError("Publisher did not identify the job for this slot; no second video was uploaded. Check YouTube Studio.")
        print(json.dumps({"status": "scheduled", "video_id": prepared["video_id"], "watch_url": prepared.get("watch_url"), "publish_at": metadata["publish_at"], "reused": True}, ensure_ascii=False))
        return prepared
    if prepared.get("status") != "ready_for_upload":
        status = prepared.get("status", "unknown")
        safe_error = prepared.get("error") or "No upload token was issued."
        raise PublishError(f"Upload reservation is {status}: {str(safe_error)[:220]}")
    access_token = prepared.get("access_token")
    if not isinstance(access_token, str) or len(access_token) < 20:
        raise PublishError("Publisher did not issue a valid short-lived YouTube token.")
    _mask(access_token)

    try:
        upload_url = _start_youtube_session(metadata, video, access_token)
    except Exception as exc:
        # No MP4 bytes were sent yet, so this reservation can be marked failed safely.
        try:
            _supabase_post("/autopilot/fail", {"job_id": metadata["job_id"], "error": str(exc)[:220]})
        except Exception:
            pass
        raise
    video_id = _upload_resumably(upload_url, video, access_token)
    watch_url = f"https://youtu.be/{video_id}"
    try:
        completed = _supabase_post("/autopilot/complete", {"job_id": metadata["job_id"], "video_id": video_id})
    except Exception as exc:
        # Video may already be uploaded. Never automatically start another upload.
        raise PublishError(
            f"YouTube accepted video {video_id}, but publisher confirmation failed. "
            "Check YouTube Studio before any retry."
        ) from exc
    if completed.get("status") != "scheduled" or completed.get("video_id") != video_id:
        raise PublishError(f"YouTube accepted {watch_url}, but the job was not confirmed; check Studio before retrying.")

    print(json.dumps({
        "status": "scheduled", "game_id": metadata["game_id"], "publish_at": metadata["publish_at"],
        "video_id": video_id, "watch_url": watch_url,
    }, ensure_ascii=False))
    history_path = Path(os.getenv("DATA_DIR", "data")) / "recent-games.json"
    history_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        history = json.loads(history_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        history = []
    if not isinstance(history, list):
        history = []
    game_id = metadata.get("game_id")
    if isinstance(game_id, str):
        history.append(game_id)
    history_path.write_text(json.dumps(history[-12:], ensure_ascii=False), encoding="utf-8")
    return completed


def diagnostic_category(error: Exception) -> tuple[str, str]:
    """Report fixed, non-secret diagnostics even when remote logs are unavailable.

    Never expose server text, OAuth tokens, upload URLs, or game content in a
    GitHub annotation. Classification is advisory, not proof of upload state.
    """
    text = str(error).lower()
    if "untrusted github identity claims" in text or "oidc" in text or "github identity" in text:
        return "identity", "GitHub identity or OIDC failed. Check workflow, branch, claims and publisher configuration."
    if "youtube accepted" in text or "check studio before" in text or "without a video id" in text:
        return "ambiguous-upload", "Upload result may be ambiguous. Check YouTube Studio before retrying."
    if "reservation" in text or "different job" in text or "same slot" in text:
        return "reservation", "Upload reservation or publish slot conflicted. Check publisher records and YouTube Studio."
    if "publisher" in text:
        return "publisher", "Publisher rejected or did not complete the request. Inspect the run log and publisher state."
    if "youtube" in text or "upload" in text:
        return "youtube-upload", "YouTube upload failed. Check YouTube Studio before any retry."
    return "unknown", "Upload step failed. Inspect its log and YouTube Studio before any retry."


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python publish_to_supabase.py path/to/review.result.json")
    try:
        publish(Path(sys.argv[1]))
    except Exception as exc:
        category, message = diagnostic_category(exc)
        # Only fixed text appears in annotations. stderr retains the existing
        # detailed diagnostic subject to GitHub's credential masking.
        print(f"::error title=Publish diagnostic {category}::{message}")
        print(f"Safe publish stop: {exc}", file=sys.stderr)
        raise SystemExit(1)
