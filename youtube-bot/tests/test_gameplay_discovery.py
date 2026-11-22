import sys
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlsplit

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay_discovery import DiscoveryError, discover_games
from gameplay_schedule import next_gameplay_slot


class GameplayDiscoveryTests(unittest.TestCase):
    def repo(self, **overrides):
        result = {"full_name": "owner/game", "html_url": "https://github.com/owner/game", "default_branch": "main",
                  "license": {"spdx_id": "MIT"}, "private": False, "fork": False, "archived": False,
                  "description": "A game"}
        result.update(overrides)
        return result

    def test_discovery_is_read_only_pinned_and_needs_review(self):
        urls = []
        def get(url):
            urls.append(url)
            if "/search/repositories?" in url:
                return {"items": [self.repo()], "incomplete_results": False}
            return {"commit": {"sha": "a" * 40}}
        items = discover_games(limit=1, get_json=get)
        self.assertEqual(items[0]["commit"], "a" * 40)
        self.assertTrue(items[0]["rights_review_required"])
        self.assertTrue(items[0]["safety_review_required"])
        self.assertTrue(all(urlsplit(url).hostname == "api.github.com" for url in urls))

    def test_unknown_license_private_fork_or_untrusted_url_not_accepted(self):
        bad = [self.repo(license=None), self.repo(private=True), self.repo(fork=True),
               self.repo(archived=True), self.repo(html_url="https://evil.invalid/game")]
        self.assertEqual(discover_games(get_json=lambda _url: {"items": bad}), [])

    def test_incomplete_search_invalid_sha_and_limit_fail_closed(self):
        with self.assertRaises(DiscoveryError):
            discover_games(get_json=lambda _url: {"items": [], "incomplete_results": True})
        with self.assertRaises(ValueError):
            discover_games(limit=50)
        self.assertEqual(discover_games(get_json=lambda url: {"items": [self.repo()]} if "search/repositories" in url else {"commit": {"sha": "not-a-sha"}}), [])

    def test_gameplay_is_every_two_dates_at_18_moscow(self):
        t = datetime(2026, 11, 24, 14, 0, tzinfo=timezone.utc)
        self.assertEqual(next_gameplay_slot(t).isoformat(), "2026-11-24T15:00:00+00:00")
        self.assertEqual(next_gameplay_slot(t + timedelta(hours=1)).isoformat(), "2026-11-26T15:00:00+00:00")
        self.assertEqual(next_gameplay_slot(datetime(2026, 11, 25, 14, tzinfo=timezone.utc)).isoformat(), "2026-11-26T15:00:00+00:00")
        with self.assertRaises(ValueError):
            next_gameplay_slot(t.replace(tzinfo=None))


if __name__ == "__main__":
    unittest.main()
