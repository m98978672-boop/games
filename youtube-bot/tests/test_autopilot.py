import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from audience import PILOT_TOPICS, TopicMetrics, choose_topic, metrics_from_analytics_rows, topic_score
from script_contract import build_prompt, validate_script


class AudiencePlannerTests(unittest.TestCase):
    def test_empty_channel_explores_without_inventing_a_winner(self):
        chosen = choose_topic({})
        self.assertIn(chosen, PILOT_TOPICS)
        self.assertEqual(chosen[0], PILOT_TOPICS[0][0])

    def test_topic_with_good_retention_and_subscriber_gain_wins_after_data(self):
        metrics = {
            "tiny-mysteries": TopicMetrics(videos=8, views=800, watch_seconds=12000, video_seconds=16000,
                                            likes=100, comments=32, subscribers_gained=24),
            "animal-comedy": TopicMetrics(videos=2, views=90, watch_seconds=500, video_seconds=4000,
                                           likes=2, comments=1, subscribers_gained=0),
        }
        self.assertGreater(topic_score(metrics["tiny-mysteries"], 10), topic_score(metrics["animal-comedy"], 10))
        self.assertEqual(choose_topic(metrics)[0], "tiny-mysteries")

    def test_metrics_aggregate_only_tagged_topics_and_clamp_negative_values(self):
        result = metrics_from_analytics_rows([
            {"topic_id": "animal-comedy", "videos": 1, "views": 10, "likes": 2},
            {"topic_id": "animal-comedy", "videos": 1, "views": 5, "likes": -1},
            {"views": 1000, "likes": 1000},
        ])
        self.assertEqual(result["animal-comedy"].videos, 2)
        self.assertEqual(result["animal-comedy"].views, 15)
        self.assertEqual(result["animal-comedy"].likes, 2)
        self.assertNotIn("", result)


class ScriptContractTests(unittest.TestCase):
    def setUp(self):
        self.script = {
            "schema_version": 1,
            "topic_id": "animal-comedy",
            "title": "Почему кот не нажал кнопку",
            "hook": "Кнопка обещала исполнить одно желание.",
            "scenes": [
                {"speaker": "Кот", "dialogue": "Я нажму только после обеда.", "visual": "Кот смотрит на кнопку", "emotion": "curious"},
                {"speaker": "Мышь", "dialogue": "А если желание — обед?", "visual": "Мышь указывает на миску", "emotion": "happy"},
                {"speaker": "Кот", "dialogue": "Тогда кнопка подождёт.", "visual": "Кот выбирает миску", "emotion": "surprised"},
            ],
        }

    def test_valid_script_is_normalized(self):
        result = validate_script(json.dumps(self.script, ensure_ascii=False), "animal-comedy")
        self.assertEqual(result["topic_id"], "animal-comedy")
        self.assertEqual(len(result["scenes"]), 3)

    def test_rejects_topic_mismatch_links_and_oversized_lines(self):
        with self.assertRaises(ValueError):
            validate_script(self.script, "tiny-mysteries")
        bad = json.loads(json.dumps(self.script))
        bad["scenes"][0]["dialogue"] = "Подпишись на https://example.com"
        with self.assertRaises(ValueError):
            validate_script(bad)
        bad = json.loads(json.dumps(self.script))
        bad["scenes"][0]["dialogue"] = "x" * 121
        with self.assertRaises(ValueError):
            validate_script(bad)

    def test_prompt_does_not_accept_or_embed_raw_comments(self):
        messages = build_prompt("tiny-mysteries", "Короткие загадки", "людям нравятся короткие развязки", "seed")
        self.assertEqual(messages[0]["role"], "system")
        self.assertIn("данных пока нет", build_prompt("x", "y")[1]["content"])
        self.assertNotIn("password", messages[1]["content"].lower())


if __name__ == "__main__":
    unittest.main()
