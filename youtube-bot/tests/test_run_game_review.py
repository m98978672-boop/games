import json
import sys
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import run_game_review


class RunReviewTests(unittest.TestCase):
    def test_long_external_review_keeps_copyable_sources_and_uses_long_renderer(self):
        game = {
            "id": "12345", "title": "Внешняя игра", "features": ["Описание Steam: Русское описание игры", "Отзывы Steam: в основном положительные"],
            "public_url": "https://store.steampowered.com/app/12345/",
        }
        review = {
            "game_id": "12345", "game_title": "Внешняя игра", "title": "ИИ-разбор: Внешняя игра",
            "idea_score": 8, "sources": [{"name": "Steam", "url": game["public_url"]}],
            "screenshots": [], "evidence": {"12345-f1": game["features"][0]},
            "hook": "Что предлагает эта игра?", "pros": game["features"],
            "possible_minus": "Возможно, такой формат подойдёт не всем.",
        }
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            with patch.object(run_game_review, "DATA_DIR", root), \
                 patch.object(run_game_review, "load_steam_games", return_value=[game]), \
                 patch.object(run_game_review, "generate_game_review", return_value=review), \
                 patch.object(run_game_review, "generate_long_narration", return_value=[{"dialogue": "текст"} for _ in range(10)]), \
                 patch.object(run_game_review, "download_screenshots", return_value=[]), \
                 patch.object(run_game_review, "render_long_review", return_value={"fps": 50, "resolution": "1920x1080", "duration_seconds": 210}) as render, \
                 patch.object(run_game_review, "next_publish_slot", return_value=datetime(2026, 11, 24, 13, tzinfo=timezone.utc)):
                result = run_game_review.run(root / "long.mp4", video_format="long")
            self.assertEqual(result["format"], "long")
            self.assertEqual(result["metadata"]["video_format"], "long")
            self.assertIn("https://store.steampowered.com/app/12345/", result["metadata"]["description"])
            self.assertEqual(result["metadata"]["publish_at"], "2026-11-24T13:00:00Z")
            render.assert_called_once()
            self.assertEqual(json.loads((root / "recent-games.json").read_text()), ["12345"])

    def test_manual_choice_is_validated_twice_and_passed_to_metadata(self):
        game = {"id": "1", "title": "Игра", "features": ["Факт один", "Факт два"]}
        review = {"game_id": "1", "game_title": "Игра", "title": "Обзор", "idea_score": 7,
                  "sources": [], "screenshots": [], "pros": game["features"], "possible_minus": "Возможно, не всем подойдёт."}
        chosen = datetime(2026, 11, 25, 7, 0, tzinfo=timezone.utc)
        with tempfile.TemporaryDirectory() as temp, \
             patch.dict("os.environ", {"MANUAL_PUBLISH_AT": "2026-11-25 10:00"}), \
             patch.object(run_game_review, "DATA_DIR", Path(temp)), \
             patch.object(run_game_review, "manual_publish_time", return_value=chosen) as validate, \
             patch.object(run_game_review, "next_publish_slot") as default_slot, \
             patch.object(run_game_review, "load_steam_games", return_value=[game]), \
             patch.object(run_game_review, "generate_game_review", return_value=review), \
             patch.object(run_game_review, "download_screenshots", return_value=[]), \
             patch.object(run_game_review, "render_short", return_value={}), \
             patch.object(run_game_review, "youtube_description", return_value="Описание"):
            result = run_game_review.run(Path(temp) / "short.mp4")
        self.assertEqual(validate.call_count, 2)
        default_slot.assert_not_called()
        self.assertEqual(result["metadata"]["publish_at"], "2026-11-25T07:00:00Z")

    def test_expired_manual_time_after_render_stops_before_result_written(self):
        game = {"id": "1", "title": "Игра", "features": ["Факт один", "Факт два"]}
        review = {"game_id": "1", "game_title": "Игра", "title": "Обзор", "idea_score": 7, "screenshots": []}
        with tempfile.TemporaryDirectory() as temp, \
             patch.dict("os.environ", {"MANUAL_PUBLISH_AT": "2026-11-25 10:00"}), \
             patch.object(run_game_review, "DATA_DIR", Path(temp)), \
             patch.object(run_game_review, "manual_publish_time", side_effect=[datetime(2026, 11, 25, 7, tzinfo=timezone.utc), ValueError("too close")]), \
             patch.object(run_game_review, "load_steam_games", return_value=[game]), \
             patch.object(run_game_review, "generate_game_review", return_value=review), \
             patch.object(run_game_review, "download_screenshots", return_value=[]), \
             patch.object(run_game_review, "render_short", return_value={}):
            with self.assertRaisesRegex(ValueError, "too close"):
                run_game_review.run(Path(temp) / "short.mp4")
            self.assertFalse((Path(temp) / "short.result.json").exists())


if __name__ == "__main__":
    unittest.main()
