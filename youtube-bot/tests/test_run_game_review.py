import json
import sys
import tempfile
import threading
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import run_game_review


class RunReviewTests(unittest.TestCase):
    def test_shared_history_is_validated_and_never_silently_ignored(self):
        from publish_to_supabase import PublishError
        with patch('publish_to_supabase._supabase_post', return_value={'version': 1, 'game_ids': ['1', '2']}):
            self.assertEqual(run_game_review.authoritative_topic_history(), ['1', '2'])
        for value in ({}, {'version': 1, 'game_ids': ['1', '1']},
                      {'version': 1, 'game_ids': [None]}, {'version': True, 'game_ids': []}):
            with self.subTest(value=value), patch('publish_to_supabase._supabase_post', return_value=value):
                with self.assertRaises(ValueError):
                    run_game_review.authoritative_topic_history()
        with tempfile.TemporaryDirectory() as temp, patch.dict('os.environ', {'REQUIRE_SHARED_TOPIC_HISTORY': 'true'}), \
             patch.object(run_game_review, 'DATA_DIR', Path(temp)), \
             patch('publish_to_supabase.read_queue', return_value=[]), \
             patch.object(run_game_review, 'authoritative_topic_history', side_effect=PublishError('offline')), \
             patch.object(run_game_review, 'load_steam_games') as load:
            with self.assertRaises(PublishError):
                run_game_review.run(Path(temp) / 'review.mp4')
            load.assert_not_called()

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
                 patch.object(run_game_review, "ensure_editorial_quality") as quality, \
                 patch.object(run_game_review, "render_long_review", return_value={"fps": 50, "resolution": "1920x1080", "duration_seconds": 210}) as render, \
                 patch("publish_to_supabase.read_queue", return_value=[]), \
                 patch.object(run_game_review, "reserve_slot_before_render", return_value=datetime(2026, 11, 24, 13, tzinfo=timezone.utc)), \
                 patch.object(run_game_review, "settle_slot_after_render",
                              side_effect=lambda slot, kind: (slot, False)):
                result = run_game_review.run(root / "long.mp4", video_format="long")
            self.assertEqual(result["format"], "long")
            self.assertEqual(result["metadata"]["video_format"], "long")
            self.assertIn("https://store.steampowered.com/app/12345/", result["metadata"]["description"])
            self.assertEqual(result["metadata"]["publish_at"], "2026-11-24T13:00:00Z")
            render.assert_called_once()
            quality.assert_called_once()
            self.assertFalse((root / "recent-games.json").exists(), "rendering alone must not be remembered as a published game")

    def test_generic_long_script_does_not_render_or_poison_history(self):
        game = {'id': '1', 'title': 'Игра', 'features': ['Первый факт', 'Второй факт']}
        review = {'game_id': '1', 'game_title': 'Игра', 'screenshots': []}
        template = [{'dialogue': 'Повторяемая фраза ' * 12, 'generation': 'source-template'} for _ in range(10)]
        with tempfile.TemporaryDirectory() as temp, \
             patch.object(run_game_review, 'DATA_DIR', Path(temp)), \
             patch('publish_to_supabase.read_queue', return_value=[]), \
             patch.object(run_game_review, 'load_steam_games', return_value=[game]), \
             patch.object(run_game_review, 'generate_game_review', return_value=review), \
             patch.object(run_game_review, 'generate_long_narration', return_value=template), \
             patch.object(run_game_review, 'render_long_review') as render, \
             patch.object(run_game_review, 'download_screenshots') as download:
            with self.assertRaisesRegex(ValueError, 'generic fallback'):
                run_game_review.run(Path(temp) / 'long.mp4', video_format='long')
            render.assert_not_called()
            download.assert_called_once()  # Artwork may start before the quality gate completes.
            self.assertFalse((Path(temp) / 'recent-games.json').exists())

    def test_long_artwork_and_narration_overlap_before_render(self):
        started = threading.Event()
        release = threading.Event()
        review = {'game_id': '1', 'game_title': 'Игра', 'title': 'Обзор', 'idea_score': 7,
                  'sources': [], 'screenshots': ['https://example.invalid/art'], 'pros': ['x'], 'possible_minus': 'x'}
        scenes = [{'dialogue': 'текст'} for _ in range(10)]
        def artwork(*args, **kwargs):
            started.set()
            if not release.wait(5):
                raise AssertionError('narration did not run concurrently')
            return ['image.jpg']
        def narration(value):
            if not started.wait(5):
                raise AssertionError('artwork was not started')
            release.set()
            return scenes
        with tempfile.TemporaryDirectory() as temp, \
             patch.object(run_game_review, 'DATA_DIR', Path(temp)), \
             patch('publish_to_supabase.read_queue', return_value=[]), \
             patch.object(run_game_review, 'load_steam_games', return_value=[]), \
             patch.object(run_game_review, 'generate_game_review', return_value=review), \
             patch.object(run_game_review, 'generate_long_narration', side_effect=narration), \
             patch.object(run_game_review, 'ensure_editorial_quality'), \
             patch.object(run_game_review, 'download_screenshots', side_effect=artwork), \
             patch.object(run_game_review, 'render_long_review', return_value={}) as render, \
             patch.object(run_game_review, 'youtube_description', return_value='описание'):
            result = run_game_review.run(Path(temp) / 'long.mp4', video_format='long')
        self.assertEqual(result['review']['scenes'], scenes)
        self.assertEqual(result['review']['screenshot_paths'], ['image.jpg'])
        render.assert_called_once()

    def test_artwork_error_stops_before_render(self):
        review = {'game_id': '1', 'game_title': 'Игра', 'screenshots': []}
        with tempfile.TemporaryDirectory() as temp, \
             patch.object(run_game_review, 'DATA_DIR', Path(temp)), \
             patch('publish_to_supabase.read_queue', return_value=[]), \
             patch.object(run_game_review, 'load_steam_games', return_value=[]), \
             patch.object(run_game_review, 'generate_game_review', return_value=review), \
             patch.object(run_game_review, 'generate_long_narration', return_value=[{'dialogue': 'текст'}]), \
             patch.object(run_game_review, 'ensure_editorial_quality'), \
             patch.object(run_game_review, 'download_screenshots', side_effect=RuntimeError('artwork error')), \
             patch.object(run_game_review, 'render_long_review') as render:
            with self.assertRaisesRegex(RuntimeError, 'artwork error'):
                run_game_review.run(Path(temp) / 'long.mp4', video_format='long')
        render.assert_not_called()

    def test_taken_manual_slot_is_refused_before_rendering(self):
        """A manual time that already has a video must fail in seconds, not minutes.

        Regression: the run rendered a full 17-minute video and only then had the
        publisher reject the slot, and the annotation wrongly said the upload had
        failed.
        """
        game = {"id": "1", "title": "Игра", "features": ["Факт один", "Факт два"]}
        review = {"game_id": "1", "game_title": "Игра", "title": "Обзор", "idea_score": 7,
                  "sources": [], "screenshots": [], "pros": game["features"], "possible_minus": "Возможно, не всем."}
        chosen = datetime(2026, 11, 26, 5, tzinfo=timezone.utc)
        taken = [{"publish_at": "2026-11-26T05:00:00Z", "status": "scheduled", "video_id": "existing"}]
        with tempfile.TemporaryDirectory() as temp, \
             patch.dict("os.environ", {"MANUAL_PUBLISH_AT": "2026-11-26 08:00"}), \
             patch.object(run_game_review, "DATA_DIR", Path(temp)), \
             patch("publish_to_supabase.read_queue", return_value=taken), \
             patch.object(run_game_review, "manual_publish_time", return_value=chosen), \
             patch.object(run_game_review, "load_steam_games") as steam, \
             patch.object(run_game_review, "generate_game_review") as generate, \
             patch.object(run_game_review, "download_screenshots") as artwork, \
             patch.object(run_game_review, "render_short") as render:
            with self.assertRaisesRegex(RuntimeError, "already has a video"):
                run_game_review.run(Path(temp) / "short.mp4")
        steam.assert_not_called()
        generate.assert_not_called()
        artwork.assert_not_called()
        render.assert_not_called()

    def test_free_manual_slot_still_renders(self):
        game = {"id": "1", "title": "Игра", "features": ["Факт один", "Факт два"]}
        review = {"game_id": "1", "game_title": "Игра", "title": "Обзор", "idea_score": 7,
                  "sources": [], "screenshots": [], "pros": game["features"], "possible_minus": "Возможно, не всем."}
        chosen = datetime(2026, 11, 26, 5, tzinfo=timezone.utc)
        elsewhere = [{"publish_at": "2026-11-25T09:00:00Z", "status": "scheduled", "video_id": "other"}]
        with tempfile.TemporaryDirectory() as temp, \
             patch.dict("os.environ", {"MANUAL_PUBLISH_AT": "2026-11-26 08:00"}), \
             patch.object(run_game_review, "DATA_DIR", Path(temp)), \
             patch("publish_to_supabase.read_queue", return_value=elsewhere), \
             patch.object(run_game_review, "manual_publish_time", return_value=chosen), \
             patch.object(run_game_review, "resolve_manual_after_render", return_value=(chosen, False)), \
             patch.object(run_game_review, "load_steam_games", return_value=[game]), \
             patch.object(run_game_review, "generate_game_review", return_value=review), \
             patch.object(run_game_review, "download_screenshots", return_value=[]), \
             patch.object(run_game_review, "render_short", return_value={}) as render, \
             patch.object(run_game_review, "youtube_description", return_value="Описание"):
            result = run_game_review.run(Path(temp) / "short.mp4")
        render.assert_called_once()
        self.assertEqual(result["metadata"]["publish_at"], "2026-11-26T05:00:00Z")

    def test_manual_choice_is_validated_twice_and_passed_to_metadata(self):
        game = {"id": "1", "title": "Игра", "features": ["Факт один", "Факт два"]}
        review = {"game_id": "1", "game_title": "Игра", "title": "Обзор", "idea_score": 7,
                  "sources": [], "screenshots": [], "pros": game["features"], "possible_minus": "Возможно, не всем подойдёт."}
        chosen = datetime(2026, 11, 25, 7, 0, tzinfo=timezone.utc)
        with tempfile.TemporaryDirectory() as temp, \
             patch.dict("os.environ", {"MANUAL_PUBLISH_AT": "2026-11-25 10:00"}), \
             patch.object(run_game_review, "DATA_DIR", Path(temp)), \
             patch("publish_to_supabase.read_queue", return_value=[]), \
             patch.object(run_game_review, "manual_publish_time", return_value=chosen) as validate, \
             patch.object(run_game_review, "resolve_manual_after_render", return_value=(chosen, False)) as resolve, \
             patch.object(run_game_review, "reserve_slot_before_render") as default_slot, \
             patch.object(run_game_review, "load_steam_games", return_value=[game]), \
             patch.object(run_game_review, "generate_game_review", return_value=review), \
             patch.object(run_game_review, "download_screenshots", return_value=[]), \
             patch.object(run_game_review, "render_short", return_value={}), \
             patch.object(run_game_review, "youtube_description", return_value="Описание"):
            result = run_game_review.run(Path(temp) / "short.mp4")
        self.assertEqual(validate.call_count, 1)
        resolve.assert_called_once_with(chosen)
        default_slot.assert_not_called()
        self.assertEqual(result["metadata"]["publish_at"], "2026-11-25T07:00:00Z")

    def test_unreadable_queue_stops_before_rendering(self):
        game = {"id": "1", "title": "Игра", "features": ["Факт один", "Факт два"]}
        review = {"game_id": "1", "game_title": "Игра", "title": "Обзор", "idea_score": 7,
                  "sources": [], "screenshots": [], "pros": game["features"], "possible_minus": "Возможно, не всем."}
        with tempfile.TemporaryDirectory() as temp, \
             patch.dict("os.environ", {"MANUAL_PUBLISH_AT": ""}), \
             patch.object(run_game_review, "DATA_DIR", Path(temp)), \
             patch("publish_to_supabase.read_queue", side_effect=RuntimeError("no OIDC")), \
             patch.object(run_game_review, "load_steam_games", return_value=[game]) as steam, \
             patch.object(run_game_review, "generate_game_review", return_value=review) as generate, \
             patch.object(run_game_review, "render_short") as render:
            with self.assertRaisesRegex(RuntimeError, "no review was rendered or uploaded"):
                run_game_review.run(Path(temp) / "short.mp4")
        steam.assert_not_called()
        generate.assert_not_called()
        render.assert_not_called()

    def test_taken_slot_is_avoided_before_rendering(self):
        game = {"id": "1", "title": "Игра", "features": ["Факт один", "Факт два"]}
        review = {"game_id": "1", "game_title": "Игра", "title": "Обзор", "idea_score": 7,
                  "sources": [], "screenshots": [], "pros": game["features"], "possible_minus": "Возможно, не всем."}
        taken = [{"publish_at": "2026-11-25T05:00:00+00:00", "status": "scheduled", "video_id": "x"}]
        with tempfile.TemporaryDirectory() as temp, \
             patch.dict("os.environ", {"MANUAL_PUBLISH_AT": ""}), \
             patch.object(run_game_review, "DATA_DIR", Path(temp)), \
             patch("publish_to_supabase.read_queue", return_value=taken), \
             patch.object(run_game_review, "reserve_slot_before_render",
                          return_value=datetime(2026, 11, 25, 9, tzinfo=timezone.utc)) as reserve, \
             patch.object(run_game_review, "settle_slot_after_render", side_effect=lambda slot, kind: (slot, False)), \
             patch.object(run_game_review, "load_steam_games", return_value=[game]), \
             patch.object(run_game_review, "generate_game_review", return_value=review), \
             patch.object(run_game_review, "download_screenshots", return_value=[]), \
             patch.object(run_game_review, "youtube_description", return_value="Описание"), \
             patch.object(run_game_review, "render_short", return_value={}):
            result = run_game_review.run(Path(temp) / "short.mp4")
        self.assertEqual(reserve.call_args.kwargs["occupied"], [datetime(2026, 11, 25, 5, tzinfo=timezone.utc)])
        self.assertEqual(result["metadata"]["publish_at"], "2026-11-25T09:00:00Z")

    def test_automatic_slot_is_reserved_before_rendering_and_reused(self):
        game = {"id": "1", "title": "Игра", "features": ["Факт один", "Факт два"]}
        review = {"game_id": "1", "game_title": "Игра", "title": "Обзор", "idea_score": 7,
                  "sources": [], "screenshots": [], "pros": game["features"], "possible_minus": "Возможно, не всем."}
        reserved = datetime(2026, 11, 25, 5, tzinfo=timezone.utc)
        order = []
        with tempfile.TemporaryDirectory() as temp, \
             patch.dict("os.environ", {"MANUAL_PUBLISH_AT": ""}), \
             patch.object(run_game_review, "DATA_DIR", Path(temp)), \
             patch("publish_to_supabase.read_queue", return_value=[]), \
             patch.object(run_game_review, "reserve_slot_before_render",
                         side_effect=lambda *a, **k: order.append("reserve") or reserved) as reserve, \
             patch.object(run_game_review, "settle_slot_after_render", side_effect=lambda slot, kind: (slot, False)), \
             patch.object(run_game_review, "load_steam_games", return_value=[game]), \
             patch.object(run_game_review, "generate_game_review", side_effect=lambda *a, **k: order.append("generate") or review), \
             patch.object(run_game_review, "download_screenshots", return_value=[]), \
             patch.object(run_game_review, "youtube_description", return_value="Описание"), \
             patch.object(run_game_review, "render_short", return_value={}):
            result = run_game_review.run(Path(temp) / "short.mp4")
        self.assertEqual(order, ["reserve", "generate"])
        reserve.assert_called_once()
        self.assertFalse(result["metadata"]["manual_time_adjusted"])
        self.assertEqual(result["metadata"]["publish_at"], "2026-11-25T05:00:00Z")

    def test_slot_that_passed_during_rendering_is_reported_once(self):
        game = {"id": "1", "title": "Игра", "features": ["Факт один", "Факт два"]}
        review = {"game_id": "1", "game_title": "Игра", "title": "Обзор", "idea_score": 7,
                  "sources": [], "screenshots": [], "pros": game["features"], "possible_minus": "Возможно, не всем."}
        delayed = datetime(2026, 11, 25, 9, tzinfo=timezone.utc)
        with tempfile.TemporaryDirectory() as temp, \
             patch.dict("os.environ", {"MANUAL_PUBLISH_AT": ""}), \
             patch.object(run_game_review, "DATA_DIR", Path(temp)), \
             patch("publish_to_supabase.read_queue", return_value=[]), \
             patch.object(run_game_review, "reserve_slot_before_render", return_value=datetime(2026, 11, 25, 5, tzinfo=timezone.utc)), \
             patch.object(run_game_review, "settle_slot_after_render", return_value=(delayed, True)), \
             patch.object(run_game_review, "load_steam_games", return_value=[game]), \
             patch.object(run_game_review, "generate_game_review", return_value=review), \
             patch.object(run_game_review, "download_screenshots", return_value=[]), \
             patch.object(run_game_review, "youtube_description", return_value="Описание"), \
             patch.object(run_game_review, "render_short", return_value={}):
            result = run_game_review.run(Path(temp) / "short.mp4")
        self.assertTrue(result["metadata"]["manual_time_adjusted"])
        self.assertEqual(result["metadata"]["publish_at"], "2026-11-25T09:00:00Z")

    def test_delayed_manual_time_after_render_is_reported(self):
        game = {"id": "1", "title": "Игра", "features": ["Факт один", "Факт два"]}
        review = {"game_id": "1", "game_title": "Игра", "title": "Обзор", "idea_score": 7,
                  "sources": [], "screenshots": [], "pros": game["features"], "possible_minus": "Возможно, не всем."}
        requested = datetime(2026, 11, 25, 7, tzinfo=timezone.utc)
        delayed = datetime(2026, 11, 25, 8, tzinfo=timezone.utc)
        with tempfile.TemporaryDirectory() as temp, \
             patch.dict("os.environ", {"MANUAL_PUBLISH_AT": "2026-11-25 10:00"}), \
             patch.object(run_game_review, "DATA_DIR", Path(temp)), \
             patch("publish_to_supabase.read_queue", return_value=[]), \
             patch.object(run_game_review, "manual_publish_time", return_value=requested), \
             patch.object(run_game_review, "resolve_manual_after_render", return_value=(delayed, True)), \
             patch.object(run_game_review, "load_steam_games", return_value=[game]), \
             patch.object(run_game_review, "generate_game_review", return_value=review), \
             patch.object(run_game_review, "download_screenshots", return_value=[]), \
             patch.object(run_game_review, "youtube_description", return_value="Описание"), \
             patch.object(run_game_review, "render_short", return_value={}):
            result = run_game_review.run(Path(temp) / "short.mp4")
        self.assertTrue(result["metadata"]["manual_time_adjusted"])
        self.assertEqual(result["metadata"]["requested_publish_at"], "2026-11-25T07:00:00Z")
        self.assertEqual(result["metadata"]["publish_at"], "2026-11-25T08:00:00Z")


if __name__ == "__main__":
    unittest.main()
