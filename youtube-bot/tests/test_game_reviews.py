import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from game_reviews import build_review_messages, generate_game_review, load_game_catalog, validate_review, youtube_description
from schedule_policy import next_publish_slot


class GameCatalogTests(unittest.TestCase):
    def test_catalog_is_loaded_from_repo_and_has_public_links(self):
        games = load_game_catalog()
        self.assertGreaterEqual(len(games), 5)
        self.assertTrue(all(game["features"] for game in games))
        self.assertTrue(all(game["public_url"].startswith("https://m98978672-boop.github.io/games/") for game in games))

    def test_bad_or_empty_catalog_is_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / "catalog.json"
            path.write_text("{}", encoding="utf-8")
            with self.assertRaises(ValueError):
                load_game_catalog(path)

    def test_prompt_contains_catalog_facts_and_recent_ids_not_freeform_user_text(self):
        games = load_game_catalog()
        messages = build_review_messages(games, recent_game_ids=[games[0]["id"]], seed="weekly run")
        request = json.loads(messages[1]["content"])
        self.assertEqual(messages[0]["role"], "system")
        self.assertEqual(request["recent_game_ids"], [games[0]["id"]])
        self.assertTrue(request["catalog"][0]["features"][0]["feature_id"].endswith("-f1"))
        self.assertIn("Не выдумывай игровой процесс", messages[0]["content"])

    def test_review_is_canonicalized_from_cited_catalog_features(self):
        games = load_game_catalog()
        game = games[0]
        feature_ids = [f"{game['id']}-f1", f"{game['id']}-f2"]
        raw = {
            "schema_version": 1,
            "game_id": game["id"],
            "selected_feature_ids": feature_ids,
            "possible_minus": "Может потребовать привыкания к управлению.",
            "minus_feature_id": feature_ids[0],
            "idea_score": 8,
            "hook": "Что интересного в этом игровом проекте?",
        }
        review = validate_review(raw, games)
        self.assertEqual(review["pros"], game["features"][:2])
        self.assertEqual(review["minus_evidence"], game["features"][0])
        self.assertEqual(review["format"], "game-review")
        self.assertIn("не личное прохождение", youtube_description(review))
        self.assertEqual(len(review["scenes"]), 5)

    def test_rejects_unknown_feature_repeated_game_and_unmarked_negative_claim(self):
        games = load_game_catalog()
        game = games[0]
        good = {
            "schema_version": 1, "game_id": game["id"],
            "selected_feature_ids": [f"{game['id']}-f1", f"{game['id']}-f2"],
            "possible_minus": "Может потребовать привыкания к управлению.",
            "minus_feature_id": f"{game['id']}-f1", "idea_score": 7,
            "hook": "Короткий разбор игрового проекта Games!",
        }
        bad = dict(good, selected_feature_ids=["made-up", f"{game['id']}-f2"])
        with self.assertRaises(ValueError):
            validate_review(bad, games)
        with self.assertRaises(ValueError):
            validate_review(good, games, recent_game_ids=[game["id"]])
        bad = dict(good, possible_minus="Управление ужасное и точно сломано.")
        with self.assertRaises(ValueError):
            validate_review(bad, games)

    def test_generation_retries_with_exact_feature_ids(self):
        games = load_game_catalog()
        game = games[0]
        base = {
            "schema_version": 1,
            "game_id": game["id"],
            "selected_feature_ids": ["not-a-real-feature", "also-invalid"],
            "possible_minus": "Может потребовать привыкания к управлению.",
            "minus_feature_id": f"{game['id']}-f1",
            "idea_score": 7,
            "hook": "Короткий разбор игрового проекта Games!",
        }
        corrected = dict(
            base,
            selected_feature_ids=[f"{game['id']}-f1", f"{game['id']}-f2"],
        )
        with patch("game_reviews.generate_with_qwen", side_effect=[json.dumps(base), json.dumps(corrected)]) as generate:
            review = generate_game_review(games)
        self.assertEqual(generate.call_count, 2)
        self.assertEqual(review["pros"], game["features"][:2])

    def test_generation_uses_catalog_only_fallback_after_invalid_feature_ids(self):
        games = load_game_catalog()
        game = games[0]
        invalid = {
            "schema_version": 1,
            "game_id": game["id"],
            "selected_feature_ids": ["made-up", f"{game['id']}-f2"],
            "possible_minus": "Может потребовать привыкания к управлению.",
            "minus_feature_id": f"{game['id']}-f1",
            "idea_score": 8,
            "hook": "Короткий разбор игрового проекта Games!",
        }
        with patch("game_reviews.generate_with_qwen", side_effect=[json.dumps(invalid), json.dumps(invalid)]) as generate:
            review = generate_game_review(games)
        self.assertEqual(generate.call_count, 2)
        self.assertEqual(review["pros"], game["features"][:2])
        self.assertEqual(review["minus_evidence"], game["features"][0])


class ScheduleTests(unittest.TestCase):
    def test_cold_start_schedule_uses_amsterdam_tuesday_thursday_saturday(self):
        # Monday 2026-11-23, UTC. The next slot should be Tuesday 18:30 CET.
        now = __import__("datetime").datetime(2026, 11, 23, 12, 0, tzinfo=__import__("datetime").timezone.utc)
        result = next_publish_slot(now)
        self.assertEqual(result.isoformat(), "2026-11-24T17:30:00+00:00")

    def test_schedule_moves_forward_when_today_slot_is_too_close(self):
        from datetime import datetime, timezone
        # Tuesday 18:10 CET is too close to the 18:30 slot.
        now = datetime(2026, 11, 24, 17, 10, tzinfo=timezone.utc)
        result = next_publish_slot(now)
        self.assertEqual(result.isoformat(), "2026-11-26T17:30:00+00:00")

    def test_naive_datetime_is_rejected(self):
        from datetime import datetime
        with self.assertRaises(ValueError):
            next_publish_slot(datetime(2026, 11, 23, 12, 0))


if __name__ == "__main__":
    unittest.main()
