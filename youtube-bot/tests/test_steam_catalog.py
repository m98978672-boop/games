import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import steam_catalog


def app_details(app_id="123"):
    return {app_id: {"success": True, "data": {
        "type": "game", "name": "Проверочная игра", "short_description": "Русское описание игры с исследованием мира и тактическими решениями.",
        "genres": [{"description": "Приключенческие игры"}],
        "platforms": {"windows": True, "mac": False, "linux": True},
        "developers": ["Студия Разработки"],
        "release_date": {"date": "12 окт. 2025"},
        "screenshots": [{"path_full": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/123/ss.jpg"}],
    }}}


class SteamCatalogTests(unittest.TestCase):
    def test_selects_games_from_steam_shelves_and_respects_recent_ids(self):
        featured = {"top_sellers": {"items": [{"id": 123, "name": "Проверочная игра"}, {"id": 456, "name": "Другая игра"}]}}
        review_summary = {"query_summary": {
            "total_reviews": 1000, "total_positive": 870, "total_negative": 130,
            "review_score_desc": "Very Positive",
        }}
        with patch.object(steam_catalog, "_safe_get_json", side_effect=[app_details("456"), review_summary]) as get:
            games = steam_catalog.load_steam_games(featured_payload=featured, recent_game_ids=("123",), limit=1)
        self.assertEqual([game["id"] for game in games], ["456"])
        self.assertEqual(get.call_count, 2)
        self.assertTrue(games[0]["public_url"].startswith("https://store.steampowered.com/app/456/"))
        self.assertTrue(any("87%" in fact and "1000" in fact for fact in games[0]["features"]))
        self.assertIn("https://store.steampowered.com/appreviews/456/", games[0]["sources"][1]["url"])
        self.assertEqual(games[0]["screenshots"][0].split("/")[2], "shared.akamai.steamstatic.com")

    def test_english_only_store_description_is_rejected_instead_of_spoken_as_english(self):
        english = {"999": {"success": True, "data": {
            "type": "game", "name": "Test Game", "short_description": "Explore ancient worlds and solve puzzles with friends.",
        }}}
        with patch.object(steam_catalog, "_safe_get_json", return_value=english):
            game = steam_catalog._game_from_app("999", {"id": 999, "name": "Test Game"})
        self.assertIsNone(game)

    def test_retries_rate_limit_before_succeeding(self):
        from urllib.error import HTTPError
        class Response:
            status = 200
            def read(self):
                return b'{"ok": true}'
            def __enter__(self):
                return self
            def __exit__(self, *_args):
                return None
        error = HTTPError("https://store.steampowered.com/api/appdetails/", 429, "rate limited", {}, None)
        with patch.object(steam_catalog.urllib.request, "urlopen", side_effect=[error, Response()]) as opened, \
             patch.object(steam_catalog.time, "sleep") as sleep:
            result = steam_catalog._safe_get_json("https://store.steampowered.com/api/appdetails/")
        self.assertEqual(result, {"ok": True})
        self.assertEqual(opened.call_count, 2)
        sleep.assert_called_once_with(2)

    def test_reports_source_failure_instead_of_claiming_no_eligible_games(self):
        featured = {"top_sellers": {"items": [{"id": 123, "name": "Test"}]}}
        with patch.object(steam_catalog, "_game_from_app", side_effect=steam_catalog.SteamSourceError("Steam returned HTTP 429 for /api/appdetails/.")):
            with self.assertRaisesRegex(steam_catalog.SteamSourceError, "HTTP 429"):
                steam_catalog.load_steam_games(featured_payload=featured)

    def test_tries_recent_games_when_fresh_games_are_unusable(self):
        featured = {"top_sellers": {"items": [{"id": 123, "name": "Recent"}, {"id": 456, "name": "Fresh"}]}}
        with patch.object(steam_catalog, "_game_from_app", side_effect=[None, {"id": "123"}]) as get:
            games = steam_catalog.load_steam_games(featured_payload=featured, recent_game_ids=("123",), limit=1)
        self.assertEqual(games, [{"id": "123"}])
        self.assertEqual(get.call_args_list[1].args[0], "123")

    def test_no_external_host_is_accepted_for_steam_api(self):
        with self.assertRaises(steam_catalog.SteamSourceError):
            steam_catalog._safe_get_json("https://evil.example/api")

    def test_only_steamstatic_images_are_downloaded(self):
        class Response:
            status = 200
            headers = {"Content-Type": "image/jpeg"}

            def read(self, _limit=-1):
                return b"jpeg-bytes"

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return None

        urls = [
            "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/123/ss.jpg",
            "https://evil.example/ss.jpg",
        ]
        with tempfile.TemporaryDirectory() as temp, patch.object(steam_catalog.urllib.request, "urlopen", return_value=Response()) as opened:
            paths = steam_catalog.download_screenshots(urls, Path(temp))
            self.assertEqual(len(paths), 1)
            self.assertEqual(Path(paths[0]).read_bytes(), b"jpeg-bytes")
            self.assertEqual(opened.call_count, 1)


if __name__ == "__main__":
    unittest.main()
