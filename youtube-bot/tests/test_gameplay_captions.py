import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay_captions import render_srt


class GameplayCaptionsTests(unittest.TestCase):
    def test_actual_speech_and_recaps_are_timed(self):
        text = render_srt([(1.25, 3.5, 'Первый ход.'), (11, 13, 'Итог.')], end=15)
        self.assertIn('00:00:01,250 --> 00:00:03,500\nПервый ход.', text)
        self.assertIn('00:00:11,000 --> 00:00:13,000\nИтог.', text)

    def test_speech_crossing_part_boundary_is_clipped_and_shifted(self):
        cues = [(1798, 1802, 'Переходим к следующему эпизоду.'), (1804, 1806, 'Дальше.')]
        first = render_srt(cues, end=1800)
        second = render_srt(cues, start=1800, end=1810)
        self.assertIn('00:29:58,000 --> 00:30:00,000', first)
        self.assertIn('00:00:00,000 --> 00:00:02,000', second)
        self.assertIn('00:00:04,000 --> 00:00:06,000', second)
        self.assertNotIn('Дальше.', first)

    def test_invalid_and_overlapping_cues_fail(self):
        for cues in [[(-1, 1, 'x')], [(0, 1, '')], [(0, 2, 'x'), (1, 3, 'y')],
                     [(0, float('nan'), 'x')], [(0, 1, None)]]:
            with self.subTest(cues=cues), self.assertRaises(ValueError): render_srt(cues, end=10)
        with self.assertRaises(ValueError): render_srt([], start=5, end=5)

if __name__ == '__main__': unittest.main()
