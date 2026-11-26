import json
import tempfile
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay_2048 import COMMIT
from gameplay_finalize import commentary_events, commentary_text, narration, validate_report


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

    def test_timed_commentary_validates_telemetry_and_uses_only_measured_data(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            path = root / "commentary-events.json"
            events = [{"at": 1.0, "moves": 0, "score": 0, "max_tile": 2},
                      {"at": 26.0, "moves": 15, "score": 80, "max_tile": 16}]
            path.write_text(json.dumps(events))
            self.assertEqual(commentary_events(root, self.report(), 40), events)
            self.assertIn("80", commentary_text(events[1]))
            for bad in ([{**events[0], "at": -1}], [{**events[0], "score": 10000}],
                        [events[0], {**events[1], "at": 2}], [{**events[0], "text": "injected"}]):
                path.write_text(json.dumps(bad))
                with self.assertRaises(ValueError):
                    commentary_events(root, self.report(), 40)
            path.unlink()
            self.assertEqual(commentary_events(root, self.report(), 40), [])

    def test_every_two_day_cadence_uses_moscow_dates_across_month_boundary(self):
        from datetime import datetime, timezone
        from gameplay_schedule import gameplay_is_due
        self.assertTrue(gameplay_is_due(datetime(2026, 11, 30, 12, tzinfo=timezone.utc)))
        self.assertFalse(gameplay_is_due(datetime(2026, 12, 1, 12, tzinfo=timezone.utc)))
        self.assertTrue(gameplay_is_due(datetime(2026, 12, 2, 12, tzinfo=timezone.utc)))
        self.assertTrue(gameplay_is_due(datetime(2026, 12, 1, 22, tzinfo=timezone.utc)))  # next Moscow day
        with self.assertRaises(ValueError): gameplay_is_due(datetime(2026, 12, 2))


if __name__ == "__main__": unittest.main()
