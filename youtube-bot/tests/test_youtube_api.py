import sys
import unittest
from pathlib import Path

# Every other test in this directory puts the package on the path itself; this
# one did not, so it only ran where PYTHONPATH happened to be set.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from youtube_api import _comment_requests, parse_duration_seconds


class _FakeRequest:
    def __init__(self, page):
        self.page = page

    def execute(self):
        return self.page


class _FakeComments:
    def list(self, **_kwargs):
        return _FakeRequest({
            "items": [
                {"snippet": {"topLevelComment": {"snippet": {"textDisplay": "Хочу ещё историю про животных!"}}}},
                {"snippet": {"topLevelComment": {"snippet": {"textDisplay": "Сделай загадку про море"}}}},
                {"snippet": {"topLevelComment": {"snippet": {"textDisplay": "Отличное видео, спасибо"}}}},
            ]
        })


class _FakeYoutube:
    def commentThreads(self):
        return _FakeComments()


class YoutubeApiHelpersTests(unittest.TestCase):
    def test_duration_parser(self):
        self.assertEqual(parse_duration_seconds("PT1H2M3.5S"), 3723.5)
        self.assertEqual(parse_duration_seconds("PT42S"), 42)
        self.assertEqual(parse_duration_seconds("invalid"), 0)

    def test_comment_reader_returns_only_coarse_request_count(self):
        self.assertEqual(_comment_requests(_FakeYoutube(), "video-id"), 2)


if __name__ == "__main__":
    unittest.main()
