import io
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from urllib.error import HTTPError

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import publish_to_supabase as publisher


class PublisherNetworkTests(unittest.TestCase):
    def test_upload_url_allowlist_accepts_only_google_resumable_endpoint(self):
        publisher._validate_upload_url("https://www.googleapis.com/upload/youtube/v3/videos?upload_id=secret")
        for url in (
            "http://www.googleapis.com/upload/youtube/v3/videos?upload_id=x",
            "https://evil.example/upload/youtube/v3/videos?upload_id=x",
            "https://www.googleapis.com.evil.example/upload/youtube/v3/videos?upload_id=x",
            "https://user@www.googleapis.com/upload/youtube/v3/videos?upload_id=x",
            "https://www.googleapis.com/other?upload_id=x",
        ):
            with self.subTest(url=url), self.assertRaises(publisher.PublishError):
                publisher._validate_upload_url(url)

    def test_resumable_range_parser(self):
        self.assertEqual(publisher._offset_from_range("bytes=0-262143"), 262144)
        self.assertEqual(publisher._offset_from_range(None), 0)
        with self.assertRaises(publisher.PublishError):
            publisher._offset_from_range("bytes=4-10")

    def test_retry_after_is_bounded_and_fallback_is_exponential(self):
        self.assertEqual(publisher._retry_delay(0), 1)
        self.assertEqual(publisher._retry_delay(3), 8)
        self.assertEqual(publisher._retry_delay(0, "90"), 30)
        self.assertEqual(publisher._retry_delay(1, "bad"), 2)

    def test_supabase_transient_failure_retries_same_idempotent_request(self):
        class _Response:
            status = 200
            headers = {}

            def read(self):
                return b'{"status":"ready_for_upload","access_token":"masked"}'

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return None

        good = _Response()
        attempts = []

        def fake_open(request, timeout=0):
            attempts.append(request)
            if len(attempts) == 1:
                raise HTTPError(request.full_url, 503, "unavailable", {}, io.BytesIO(b""))
            return good

        with patch.object(publisher, "github_oidc_token", return_value="oidc"), \
             patch.object(publisher, "_safe_urlopen", side_effect=fake_open), \
             patch.object(publisher.time, "sleep"):
            result = publisher._supabase_post("/autopilot/prepare", {"metadata": {"job_id": "same-id"}})

        self.assertEqual(result["status"], "ready_for_upload")
        self.assertEqual(len(attempts), 2)
        self.assertEqual(attempts[0].data, attempts[1].data)

    def test_resumable_upload_continues_from_acknowledged_chunk(self):
        calls = []

        def fake_http(request, timeout=45):
            calls.append(request)
            if len(calls) == 1:
                return 308, {"Range": "bytes=0-1023"}, b""
            return 201, {}, b'{"id":"video123"}'

        with patch.object(publisher, "CHUNK_BYTES", 1024), patch.object(publisher, "_http_request", side_effect=fake_http):
            video_id = publisher._upload_resumably(
                "https://www.googleapis.com/upload/youtube/v3/videos?upload_id=secret",
                b"x" * 1500,
                "access-token",
            )

        self.assertEqual(video_id, "video123")
        self.assertEqual(len(calls), 2)
        self.assertEqual(calls[0].get_header("Content-range"), "bytes 0-1023/1500")
        self.assertEqual(calls[1].get_header("Content-range"), "bytes 1024-1499/1500")

    def test_ambiguous_503_queries_server_offset_before_resending(self):
        calls = []

        def fake_http(request, timeout=45):
            calls.append(request)
            if len(calls) == 1:  # Chunk PUT timed out after the server may have received bytes.
                return 503, {}, b""
            if len(calls) == 2:  # Status probe says only the first 512 bytes were stored.
                return 308, {"Range": "bytes=0-511"}, b""
            return 201, {}, b'{"id":"video456"}'

        with patch.object(publisher, "CHUNK_BYTES", 1024), \
             patch.object(publisher, "_http_request", side_effect=fake_http), \
             patch.object(publisher.time, "sleep"):
            video_id = publisher._upload_resumably(
                "https://www.googleapis.com/upload/youtube/v3/videos?upload_id=secret",
                b"x" * 1500,
                "access-token",
            )

        self.assertEqual(video_id, "video456")
        self.assertEqual(len(calls), 3)
        self.assertEqual(calls[1].get_header("Content-range"), "bytes */1500")
        self.assertEqual(calls[2].get_header("Content-range"), "bytes 512-1499/1500")

    def test_publish_uses_owner_choice_and_separate_prepare_upload_complete(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            video_path = root / "short.mp4"
            video_path.write_bytes(b"x" * 2048)
            result_path = root / "short.result.json"
            metadata = {
                "job_id": "b85e890f-7dd0-4d35-a7ab-8ef24ba826b3",
                "game_id": "pixel-racer", "title": "Review", "description": "Grounded review",
                "tags": ["shorts"], "category_id": "20", "publish_at": "2026-12-01T17:30:00Z",
                "video_path": str(video_path),
            }
            result_path.write_text(json.dumps({"metadata": metadata}), encoding="utf-8")
            calls = []

            def fake_post(path, payload):
                calls.append((path, payload))
                if path.endswith("prepare"):
                    return {"status": "ready_for_upload", "access_token": "short-lived-access-token"}
                return {"status": "scheduled", "video_id": "video789"}

            with patch.dict(os.environ, {"YOUTUBE_MADE_FOR_KIDS": "false", "DATA_DIR": temp}), \
                 patch.object(publisher, "_supabase_post", side_effect=fake_post), \
                 patch.object(publisher, "_start_youtube_session", return_value="https://www.googleapis.com/upload/youtube/v3/videos?upload_id=secret"), \
                 patch.object(publisher, "_upload_resumably", return_value="video789"), \
                 patch.object(publisher, "_mask"):
                response = publisher.publish(result_path)

            self.assertEqual(response["status"], "scheduled")
            self.assertEqual(calls[0][0], "/autopilot/prepare")
            self.assertFalse(calls[0][1]["metadata"]["made_for_kids"])
            self.assertEqual(calls[1], ("/autopilot/complete", {"job_id": metadata["job_id"], "video_id": "video789"}))
            self.assertEqual(json.loads((root / "recent-games.json").read_text(encoding="utf-8")), ["pixel-racer"])

    def test_publish_fails_closed_without_owner_audience_value(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            video_path = root / "short.mp4"
            video_path.write_bytes(b"x" * 2048)
            result_path = root / "short.result.json"
            result_path.write_text(json.dumps({"metadata": {"video_path": str(video_path)}}), encoding="utf-8")
            with patch.dict(os.environ, {"YOUTUBE_MADE_FOR_KIDS": ""}), self.assertRaises(publisher.PublishError):
                publisher.publish(result_path)


if __name__ == "__main__":
    unittest.main()
