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
    def test_diagnostic_annotation_does_not_echo_untrusted_secrets(self):
        for message, category in (("Untrusted GitHub identity claims: workflow_ref secret123", "identity"),
                                  ("YouTube accepted video secret123, but confirmation failed", "ambiguous-upload"),
                                  ("Upload reservation processing secret123", "reservation"),
                                  ("Publisher HTTP 503 secret123", "publisher"),
                                  ("random secret123", "unknown")):
            with self.subTest(message=message):
                actual, safe = publisher.diagnostic_category(publisher.PublishError(message))
                self.assertEqual(actual, category)
                self.assertNotIn("secret123", safe)

    def test_github_oidc_endpoint_allows_github_actions_subdomains_only(self):
        allowed = (
            "https://pipelines.actions.githubusercontent.com/runner/token?api-version=2.0",
            "https://token.actions.githubusercontent.com/runner/token",
            "https://future.nested.actions.githubusercontent.com/runner/token",
        )
        denied = (
            "http://pipelines.actions.githubusercontent.com/runner/token",
            "https://pipelines.actions.githubusercontent.com.evil.example/runner/token",
            "https://evil.example/pipelines.actions.githubusercontent.com",
            "https://user@pipelines.actions.githubusercontent.com/runner/token",
            "https://pipelines.actions.githubusercontent.com:8443/runner/token",
        )
        for url in allowed:
            with self.subTest(url=url):
                self.assertTrue(publisher._is_github_oidc_endpoint(publisher.urllib.parse.urlsplit(url)))
        for url in denied:
            with self.subTest(url=url):
                self.assertFalse(publisher._is_github_oidc_endpoint(publisher.urllib.parse.urlsplit(url)))

    def test_unexpected_oidc_host_never_receives_runner_credential(self):
        with patch.dict(os.environ, {
            "ACTIONS_ID_TOKEN_REQUEST_URL": "https://github.example/oidc?secret=query",
            "ACTIONS_ID_TOKEN_REQUEST_TOKEN": "runner-secret",
        }), patch.object(publisher, "_safe_urlopen") as open_url, patch.object(publisher, "_mask"):
            with self.assertRaisesRegex(publisher.PublishError, "unexpected OIDC endpoint") as raised:
                publisher.github_oidc_token()
        open_url.assert_not_called()
        self.assertNotIn("runner-secret", str(raised.exception))
        self.assertNotIn("secret=query", str(raised.exception))

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

    def test_unavailable_probes_never_resend_an_unconfirmed_chunk(self):
        calls = []
        def fake_http(request, timeout=45):
            calls.append(request)
            return 503, {}, b""
        with patch.object(publisher, "_http_request", side_effect=fake_http), \
             patch.object(publisher.time, "sleep"):
            with self.assertRaisesRegex(publisher.PublishError, "no chunk was resent"):
                publisher._upload_resumably(
                    "https://www.googleapis.com/upload/youtube/v3/videos?upload_id=secret",
                    b"x" * 1500, "access-token")
        self.assertEqual(len(calls), 1 + publisher.CHUNK_ATTEMPTS)
        self.assertTrue(all(r.get_header("Content-range") == "bytes */1500" for r in calls[1:]))

    def test_server_cannot_acknowledge_unsent_bytes(self):
        for first_response in (308, 503):
            with self.subTest(status=first_response):
                responses = [(first_response, {"Range": "bytes=0-1499"}, b"")]
                if first_response == 503:
                    responses.append((308, {"Range": "bytes=0-1499"}, b""))
                with patch.object(publisher, "CHUNK_BYTES", 1024), \
                     patch.object(publisher, "_http_request", side_effect=responses), \
                     patch.object(publisher.time, "sleep"):
                    with self.assertRaisesRegex(publisher.PublishError, "unsent bytes"):
                        publisher._upload_resumably(
                            "https://www.googleapis.com/upload/youtube/v3/videos?upload_id=secret",
                            b"x" * 1500, "access-token")

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

    def test_publish_refuses_a_different_video_reused_for_the_same_slot(self):
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
            with patch.dict(os.environ, {"YOUTUBE_MADE_FOR_KIDS": "false"}), \
                 patch.object(publisher, "_supabase_post", return_value={"status": "scheduled", "video_id": "other-video"}), \
                 patch.object(publisher, "_mask"), self.assertRaisesRegex(publisher.PublishError, "did not identify the job"):
                publisher.publish(result_path)

    def test_conflicting_confirmed_job_moves_once_before_upload(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp); video = root / "clip.mp4"; video.write_bytes(b"x" * 2048)
            result = root / "result.json"
            metadata = {"job_id": "b85e890f-7dd0-4d35-a7ab-8ef24ba826b3", "game_id": "game", "title": "Review",
                        "description": "Facts", "tags": [], "category_id": "20", "publish_at": "2026-12-01T07:00:00Z", "video_format":"short", "video_path": str(video)}
            result.write_text(json.dumps({"metadata": metadata}))
            requests = []
            def post(path, payload):
                if path.endswith('prepare'):
                    requests.append(dict(payload['metadata']))
                    if len(requests) == 1: raise publisher.SlotOccupied('different confirmed job')
                    return {'status': 'ready_for_upload', 'access_token': 'short-lived-access-token'}
                return {'status': 'scheduled', 'video_id': 'newvideo'}
            with patch.dict(os.environ, {'YOUTUBE_MADE_FOR_KIDS': 'false', 'DATA_DIR': temp}), \
                 patch.object(publisher, '_supabase_post', side_effect=post), \
                 patch.object(publisher, '_start_youtube_session', return_value='https://www.googleapis.com/upload/youtube/v3/videos?upload_id=secret') as start, \
                 patch.object(publisher, '_upload_resumably', return_value='newvideo'), patch.object(publisher, '_mask'):
                publisher.publish(result)
            self.assertEqual([r['publish_at'] for r in requests], ['2026-12-01T07:00:00Z', '2026-12-01T09:00:00Z'])
            self.assertEqual(requests[0]['job_id'], requests[1]['job_id'])
            self.assertEqual(start.call_count, 1)

    def test_scheduled_long_conflict_uses_next_day_six_moscow(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp); video=root/'clip.mp4'; video.write_bytes(b'x'*2048); result=root/'result.json'
            result.write_text(json.dumps({'metadata':{'job_id':'b85e890f-7dd0-4d35-a7ab-8ef24ba826b3',
                'game_id':'game','title':'Review','description':'Facts','tags':[], 'category_id':'20',
                'publish_at':'2026-11-24T03:00:00Z','video_format':'long','video_path':str(video)}}))
            requested=[]
            def post(path, payload):
                if path.endswith('prepare'):
                    requested.append(payload['metadata']['publish_at'])
                    if len(requested)==1:
                        return {'status':'scheduled','video_id':'existing123','job_id':'55794d64-393c-407c-84da-9210794c5f5d'}
                    return {'status':'ready_for_upload','access_token':'short-lived-access-token'}
                return {'status':'scheduled','video_id':'newvideo'}
            with patch.dict(os.environ, {'YOUTUBE_MADE_FOR_KIDS':'false','DATA_DIR':temp}), \
                 patch.object(publisher, '_supabase_post', side_effect=post), \
                 patch.object(publisher, '_start_youtube_session', return_value='https://www.googleapis.com/upload/youtube/v3/videos?upload_id=secret') as start, \
                 patch.object(publisher, '_upload_resumably', return_value='newvideo'), patch.object(publisher, '_mask'):
                publisher.publish(result)
            self.assertEqual(requested, ['2026-11-24T03:00:00Z','2026-11-25T03:00:00Z'])
            start.assert_called_once()

    def test_four_occupied_slots_fail_without_starting_upload(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp); video = root / 'video.mp4'; video.write_bytes(b'x' * 2048)
            result = root / 'result.json'
            result.write_text(json.dumps({'metadata': {'job_id': 'b85e890f-7dd0-4d35-a7ab-8ef24ba826b3',
                'game_id': 'game', 'title': 'Review', 'description': 'Facts', 'tags': [], 'category_id': '20',
                'publish_at': '2026-12-01T07:00:00Z', 'video_format':'short', 'video_path': str(video)}}))
            with patch.dict(os.environ, {'YOUTUBE_MADE_FOR_KIDS': 'false'}), \
                 patch.object(publisher, '_supabase_post', side_effect=publisher.SlotOccupied('busy')) as post, \
                 patch.object(publisher, '_start_youtube_session') as start:
                with self.assertRaisesRegex(publisher.PublishError, 'Four regular'):
                    publisher.publish(result)
                self.assertEqual(post.call_count, 4)
                start.assert_not_called()

    def test_http_409_requires_a_distinct_valid_job_id(self):
        expected = 'b85e890f-7dd0-4d35-a7ab-8ef24ba826b3'
        other = '22222222-2222-4222-8222-222222222222'
        for supplied, category in ((other, publisher.SlotOccupied), (None, publisher.PublishError)):
            response = json.dumps({'status': 'scheduled', 'job_id': supplied, 'error': 'slot unavailable'}).encode()
            error = HTTPError('https://example.test', 409, 'Conflict', {}, io.BytesIO(response))
            with self.subTest(job_id=supplied), patch.object(publisher, 'github_oidc_token', return_value='oidc'), \
                 patch.object(publisher, '_safe_urlopen', side_effect=error), self.assertRaises(category) as raised:
                publisher._supabase_post('/autopilot/prepare', {'metadata': {'job_id': expected}})
            if category is publisher.PublishError:
                self.assertNotIsInstance(raised.exception, publisher.SlotOccupied)

    def test_same_scheduled_job_is_idempotent(self):
        expected = 'b85e890f-7dd0-4d35-a7ab-8ef24ba826b3'
        response = json.dumps({'status':'scheduled','job_id':expected, 'video_id':'video123'}).encode()
        error = HTTPError('https://example.test',409,'Conflict',{},io.BytesIO(response))
        with patch.object(publisher,'github_oidc_token',return_value='oidc'), \
             patch.object(publisher,'_safe_urlopen',side_effect=error):
            self.assertEqual(publisher._supabase_post('/autopilot/prepare', {'metadata':{'job_id':expected}})['video_id'], 'video123')

    def test_conflict_without_job_identity_is_not_idempotent(self):
        response=json.dumps({'status':'scheduled','video_id':'existing'}).encode()
        error=HTTPError('https://example.test',409,'Conflict',{},io.BytesIO(response))
        with patch.object(publisher,'github_oidc_token',return_value='oidc'), \
             patch.object(publisher,'_safe_urlopen',side_effect=error):
            with self.assertRaises(publisher.PublishError):
                publisher._supabase_post('/autopilot/prepare', {'metadata':{}})

    def test_unfinished_other_job_does_not_automatically_move_to_new_slot(self):
        expected = 'b85e890f-7dd0-4d35-a7ab-8ef24ba826b3'
        other = '22222222-2222-4222-8222-222222222222'
        for state in ('processing', 'failed'):
            response = json.dumps({'status': state, 'job_id': other}).encode()
            error = HTTPError('https://example.test', 409, 'Conflict', {}, io.BytesIO(response))
            with self.subTest(state=state), patch.object(publisher, 'github_oidc_token', return_value='oidc'), \
                 patch.object(publisher, '_safe_urlopen', side_effect=error), self.assertRaises(publisher.PublishError) as caught:
                publisher._supabase_post('/autopilot/prepare', {'metadata': {'job_id': expected}})
            self.assertNotIsInstance(caught.exception, publisher.SlotOccupied)

    def test_explicit_manual_time_is_never_shifted(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp); video=root/'clip.mp4'; video.write_bytes(b'x'*2048)
            result=root/'result.json'
            result.write_text(json.dumps({'metadata': {'job_id':'b85e890f-7dd0-4d35-a7ab-8ef24ba826b3',
                'game_id':'game', 'title':'Review', 'description':'Facts', 'tags':[], 'category_id':'20',
                'publish_at':'2026-12-01T03:00:00Z', 'requested_publish_at':'2026-12-01T03:00:00Z',
                'video_format':'long', 'video_path':str(video)}}))
            with patch.dict(os.environ, {'YOUTUBE_MADE_FOR_KIDS':'false'}), \
                 patch.object(publisher, '_supabase_post', side_effect=publisher.SlotOccupied('busy')) as post, \
                 patch.object(publisher, '_start_youtube_session') as start:
                with self.assertRaisesRegex(publisher.PublishError, 'Requested publication slot is occupied'):
                    publisher.publish(result)
                self.assertEqual(post.call_count,1); start.assert_not_called()

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
