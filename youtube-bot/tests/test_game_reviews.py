import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from game_reviews import build_review_messages, generate_game_review, generate_long_narration, load_game_catalog, validate_review, youtube_description
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
        self.assertIn("https://m98978672-boop.github.io/games/", youtube_description(review))
        self.assertEqual(len(review["scenes"]), 5)
        self.assertEqual(review["scenes"][-1]["label"], "ИТОГ")
        self.assertIn("8 из 10", review["scenes"][-1]["dialogue"])
        self.assertIn("Без личной игры", review["scenes"][-1]["dialogue"])

    def test_long_catalog_text_is_bounded_for_narration_without_changing_evidence(self):
        game = dict(load_game_catalog()[0])
        game["features"] = ["Сильная сторона " + "подробное описание " * 18, "Вторая сторона " + "ещё деталей " * 18]
        long_title = "Очень длинное название игрового проекта " * 3
        game["title"] = long_title
        game["version"] = "1.0"
        feature_ids = [f"{game['id']}-f1", f"{game['id']}-f2"]
        review = validate_review({
            "schema_version": 1, "game_id": game["id"], "selected_feature_ids": feature_ids,
            "possible_minus": "Возможно, подробная концепция подойдёт не каждому игроку.",
            "minus_feature_id": feature_ids[0], "idea_score": 7,
            "hook": "Как устроен этот проект и чем он может заинтересовать зрителя?",
        }, [game])
        self.assertEqual(review["pros"], game["features"][:2])
        self.assertTrue(all(len(scene["dialogue"]) <= 130 for scene in review["scenes"]))
        self.assertIn(long_title, review["game_title"])

    def test_english_source_text_is_blocked_before_tts(self):
        game = dict(load_game_catalog()[0])
        game["features"] = ["Online multiplayer combat with strategic missions", "Thousands of weapons and seasonal events"]
        payload = {
            "schema_version": 1, "game_id": game["id"],
            "selected_feature_ids": [f"{game['id']}-f1", f"{game['id']}-f2"],
            "possible_minus": "Возможно, большой набор функций подойдёт не всем.",
            "minus_feature_id": f"{game['id']}-f1", "idea_score": 7,
            "hook": "Короткий обзор этой игры на русском языке.",
        }
        with self.assertRaisesRegex(ValueError, "cannot be safely narrated in Russian"):
            validate_review(payload, [game])

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

    def test_long_form_script_requires_source_ids_russian_and_minimum_length(self):
        games = load_game_catalog()
        game = games[0]
        review = validate_review({
            "schema_version": 1, "game_id": game["id"],
            "selected_feature_ids": [f"{game['id']}-f1", f"{game['id']}-f2"],
            "possible_minus": "Возможно, такой акцент подойдёт не каждому игроку.",
            "minus_feature_id": f"{game['id']}-f1", "idea_score": 7,
            "hook": "Что интересного в этом игровом проекте?",
        }, games)
        line = "По моему впечатлению от опубликованного описания, этот факт помогает понять особенности проекта и оценить, кому может быть интересен такой игровой опыт."
        line = (line * 3)[:260].rstrip()
        while len(line) < 220:
            line += " Это оценка только по источнику."
        payload = {"scenes": [
            {"fact_id": f"{game['id']}-f1", "dialogue": line[:320], "visual": "Показываем подтверждённый факт из источника"}
            for _ in range(10)
        ]}
        with patch("game_reviews.generate_with_qwen", return_value=json.dumps(payload, ensure_ascii=False)):
            scenes = generate_long_narration(review)
        self.assertEqual(len(scenes), 10)
        self.assertGreaterEqual(sum(len(scene["dialogue"]) for scene in scenes), 2400)
        self.assertTrue(all("fact_id" in scene for scene in scenes))
        self.assertIn("Итог по источникам:", scenes[-1]["dialogue"])
        self.assertIn("7 из 10", scenes[-1]["dialogue"])
        self.assertIn("Лично я не играл", scenes[-1]["dialogue"])
        self.assertEqual(scenes[-1]["visual"], "ИТОГ ПО ИСТОЧНИКАМ · 7/10")

    def test_long_review_retries_chapters_individually_after_count_error(self):
        games = load_game_catalog()
        game = games[0]
        review = validate_review({
            "schema_version": 1, "game_id": game["id"],
            "selected_feature_ids": [f"{game['id']}-f1", f"{game['id']}-f2"],
            "possible_minus": "Возможно, такой акцент подойдёт не каждому игроку.",
            "minus_feature_id": f"{game['id']}-f1", "idea_score": 7,
            "hook": "Что интересного в этом игровом проекте?",
        }, games)
        text = ("По опубликованному описанию можно составить впечатление о проекте. "
                "Эта особенность помогает оценить представленную идею, но без личного прохождения "
                "нельзя судить о качестве исполнения или делать выводы о впечатлениях других игроков. "
                "Посмотрите первоисточник и решите, подходит ли вам предложенная концепция.")
        chapter = {"fact_id": f"{game['id']}-f1", "dialogue": text, "visual": "Описание из источника"}
        with patch("game_reviews.generate_with_qwen", side_effect=[json.dumps({"scenes": []})] + [json.dumps(chapter)] * 10) as generate:
            scenes = generate_long_narration(review)
        self.assertEqual(generate.call_count, 11)
        self.assertEqual(len(scenes), 10)
        self.assertIn("Итог по источникам:", scenes[-1]["dialogue"])

    def test_long_review_rejects_invalid_individual_chapters(self):
        review = {"evidence": {"a": "Один факт", "b": "Другой факт"}, "game_title": "Test", "idea_score": 7,
                  "hook": "Что предлагает игра?", "pros": ["Один факт", "Другой факт"], "possible_minus": "Возможно, не для всех."}
        with patch("game_reviews.generate_with_qwen", return_value=json.dumps({"scenes": []})):
            with self.assertRaisesRegex(ValueError, "could not produce chapter 1"):
                generate_long_narration(review)

    def test_plan_fallback_repairs_non_russian_and_contact_fields(self):
        games = load_game_catalog()
        game = games[0]
        invalid = {"schema_version": 1, "game_id": game["id"],
                   "selected_feature_ids": [f"{game['id']}-f1", f"{game['id']}-f2"],
                   "minus_feature_id": f"{game['id']}-f1", "idea_score": 5,
                   "hook": "English-only introduction", "possible_minus": "Возможно, visit www.example.com"}
        with patch("game_reviews.generate_with_qwen", return_value=json.dumps(invalid)):
            review = generate_game_review(games)
        self.assertNotIn("www.", review["possible_minus"])
        self.assertIn("игра", review["hook"])

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
    def test_shorts_have_two_daily_moscow_slots_in_winter_and_summer(self):
        from datetime import datetime, timezone
        for month in (1, 7, 11):
            morning = next_publish_slot(datetime(2026, month, 23, 1, 0, tzinfo=timezone.utc))
            noon = next_publish_slot(datetime(2026, month, 23, 5, 0, tzinfo=timezone.utc))
            self.assertEqual(morning.isoformat(), f"2026-{month:02d}-23T05:00:00+00:00")
            self.assertEqual(noon.isoformat(), f"2026-{month:02d}-23T09:00:00+00:00")

    def test_long_video_schedule_is_daily_at_06_moscow(self):
        from datetime import datetime, timezone
        from schedule_policy import long_video_is_due
        # 22:00 UTC on the preceding day is 01:00 on the Moscow due date.
        due_day = datetime(2026, 11, 23, 22, 0, tzinfo=timezone.utc)
        off_day = datetime(2026, 11, 24, 22, 0, tzinfo=timezone.utc)
        self.assertTrue(long_video_is_due(due_day))
        self.assertTrue(long_video_is_due(off_day))
        self.assertEqual(next_publish_slot(due_day, video_format="long").isoformat(), "2026-11-24T03:00:00+00:00")
        self.assertEqual(next_publish_slot(off_day, video_format="long").isoformat(), "2026-11-25T03:00:00+00:00")

    def test_schedule_moves_forward_when_slot_is_too_close(self):
        from datetime import datetime, timezone
        now = datetime(2026, 11, 24, 4, 30, tzinfo=timezone.utc)
        self.assertEqual(next_publish_slot(now).isoformat(), "2026-11-24T09:00:00+00:00")
        now = datetime(2026, 11, 24, 9, 0, tzinfo=timezone.utc)
        self.assertEqual(next_publish_slot(now).isoformat(), "2026-11-25T05:00:00+00:00")

    def test_manual_moscow_time_is_converted_and_does_not_change_schedule(self):
        from datetime import datetime, timezone
        from schedule_policy import manual_publish_time
        now = datetime(2026, 11, 22, 12, 0, tzinfo=timezone.utc)
        self.assertEqual(manual_publish_time("2026-11-22 18:30", now=now).isoformat(), "2026-11-22T15:30:00+00:00")
        self.assertEqual(next_publish_slot(now).isoformat(), "2026-11-23T05:00:00+00:00")

    def test_manual_time_rejects_past_near_invalid_and_timezone_suffix(self):
        from datetime import datetime, timezone
        from schedule_policy import manual_publish_time
        now = datetime(2026, 11, 22, 12, 0, tzinfo=timezone.utc)
        for value in ("2026-11-22 15:44", "2026-11-21 18:00", "2026-02-30 18:00", "2026-11-22T18:00", "2026-11-22 18:00+03:00"):
            with self.subTest(value=value), self.assertRaises(ValueError):
                manual_publish_time(value, now=now)
        self.assertEqual(manual_publish_time("2026-11-22 15:45", now=now).isoformat(), "2026-11-22T12:45:00+00:00")

    def test_post_render_manual_slot_keeps_or_delays_once(self):
        from datetime import datetime, timezone
        from schedule_policy import resolve_manual_after_render
        now = datetime(2026, 11, 22, 12, 10, 10, tzinfo=timezone.utc)
        chosen = datetime(2026, 11, 22, 13, 0, tzinfo=timezone.utc)
        self.assertEqual(resolve_manual_after_render(chosen, now=now), (chosen, False))
        delayed, changed = resolve_manual_after_render(chosen, now=datetime(2026, 11, 22, 12, 30, 10, tzinfo=timezone.utc))
        self.assertTrue(changed)
        self.assertEqual(delayed.isoformat(), "2026-11-22T13:31:00+00:00")
        with self.assertRaises(ValueError):
            resolve_manual_after_render(datetime(2026, 11, 22, 13), now=now)

    def test_naive_datetime_is_rejected(self):
        from datetime import datetime
        with self.assertRaises(ValueError):
            next_publish_slot(datetime(2026, 11, 23, 12, 0))


if __name__ == "__main__":
    unittest.main()
