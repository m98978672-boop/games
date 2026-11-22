import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay_2048 import COMMIT
from gameplay_finalize import narration, validate_report


class GameplayFinalizeTests(unittest.TestCase):
    def report(self):
        return {"game": "2048", "commit": COMMIT, "outcome": "time_limit", "moves": 20,
                "score": 96, "max_tile": 16, "elapsed_seconds": 20,
                "video": "a" * 32 + ".webm", "audio": False, "uploaded": False}

    def test_summary_is_honest_about_unfinished_game_and_silent_audio(self):
        report = validate_report(self.report())
        text = narration(report)
        self.assertIn("партия не завершена", text)
        self.assertIn("96", text)
        self.assertIn("Звук игры не записывался", text)

    def test_rejects_bad_source_paths_missing_moves_and_claimed_upload(self):
        for change in ({"video": "../../evil.webm"}, {"outcome": "unknown"}, {"moves": 0},
                       {"score": True}, {"uploaded": True}, {"commit": "different"}, {"elapsed_seconds": 9}):
            with self.subTest(change=change):
                with self.assertRaises(ValueError): validate_report({**self.report(), **change})

    def test_every_two_day_cadence_uses_moscow_dates_across_month_boundary(self):
        from datetime import datetime, timezone
        from gameplay_schedule import gameplay_is_due
        self.assertTrue(gameplay_is_due(datetime(2026, 11, 30, 12, tzinfo=timezone.utc)))
        self.assertFalse(gameplay_is_due(datetime(2026, 12, 1, 12, tzinfo=timezone.utc)))
        self.assertTrue(gameplay_is_due(datetime(2026, 12, 2, 12, tzinfo=timezone.utc)))
        self.assertTrue(gameplay_is_due(datetime(2026, 12, 1, 22, tzinfo=timezone.utc)))  # next Moscow day
        with self.assertRaises(ValueError): gameplay_is_due(datetime(2026, 12, 2))


if __name__ == "__main__": unittest.main()
