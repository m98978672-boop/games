import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay_voiceover import validate_trace


class GameplayVoiceoverTests(unittest.TestCase):
    def test_accepts_observed_model_actions_without_asserting_a_win(self):
        trace = [{'step': 1, 'action': 'RIGHT', 'observed_ms': 3000},
                 {'step': 2, 'action': 'UP', 'observed_ms': 6500}]
        self.assertEqual(validate_trace(trace, 20), trace)

    def test_rejects_invalid_or_fabricated_timing(self):
        cases = [[], [{'step': 1, 'action': 'SHELL', 'observed_ms': 10}],
                 [{'step': 2, 'action': 'LEFT', 'observed_ms': 100}],
                 [{'step': 1, 'action': 'LEFT', 'observed_ms': 30000}],
                 [{'step': 1, 'action': 'LEFT', 'observed_ms': True}],
                 [{'step': 1, 'action': 'LEFT', 'observed_ms': 200}, {'step': 2, 'action': 'UP', 'observed_ms': 100}]]
        for trace in cases:
            with self.subTest(trace=trace), self.assertRaises(ValueError): validate_trace(trace, 20)
        with self.assertRaises(ValueError): validate_trace([{'step': 1, 'action': 'UP', 'observed_ms': 1}], float('nan'))

if __name__ == '__main__': unittest.main()
