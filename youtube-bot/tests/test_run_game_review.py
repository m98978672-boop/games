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


if __name__ == "__main__":
    unittest.main()
