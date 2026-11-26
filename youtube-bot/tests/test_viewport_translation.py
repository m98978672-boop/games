import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from adventure_draft import plan
from viewport_translation import TRANSLATIONS, cues, filters, translated_message


class ViewportTranslationTests(unittest.TestCase):
    def test_same_translation_in_overlay_and_voice_without_gameplay_cuts(self):
        original, russian = next(iter(TRANSLATIONS.items()))
        hud = dict(message=original, viewport=[800, 600], rect=[10, 10, 550, 155], level=1)
        trace = dict(game='Viewport Voyager', duration_seconds=10, initial_hud=hud, actions=[])
        self.assertIn((0, russian), plan(trace)[1])
        self.assertEqual(plan(trace)[2], [])
        with tempfile.TemporaryDirectory() as temp:
            self.assertIn('drawbox=x=10:y=10', filters(trace, temp))
            self.assertIn(russian, ' '.join((Path(temp) / 'hud-ru-0.txt').read_text().split()))

    def test_unknown_message_is_neither_hidden_nor_read(self):
        self.assertIsNone(translated_message('Unknown message'))
        self.assertEqual(cues(dict(duration_seconds=10, initial_hud={'message':'Unknown message'}, actions=[])), [])

class PreparedTranslationTests(unittest.TestCase):
    def test_one_model_result_shared_between_voice_and_overlay(self):
        from unittest.mock import patch
        from viewport_translation import prepare
        hud = dict(message='Open the door', viewport=[800, 600], rect=[10, 10, 550, 155], level=1)
        trace = dict(game='Viewport Voyager', duration_seconds=10, initial_hud=hud,
                     actions=[dict(choice='UP', recording_elapsed_ms=1000, hud=hud)], auto_translate=True)
        with patch('viewport_translation.russian_game_text', side_effect=['Открой дверь.', 'Другой перевод.']) as model:
            intervals, stats = prepare(trace)
            lines = plan(trace, translation_intervals=intervals)[1]
            with tempfile.TemporaryDirectory() as temp:
                filters(trace, temp, intervals=intervals, stats=stats)
                self.assertIn('Открой дверь.', (Path(temp) / 'hud-ru-0.txt').read_text())
            self.assertIn((0, 'Открой дверь.'), lines)
            self.assertEqual(model.call_count, 1)
            self.assertEqual(stats['overlay_intervals'], 1)

    def test_invalid_timestamps_never_cover_original(self):
        from viewport_translation import prepare
        hud = dict(message=next(iter(TRANSLATIONS)), viewport=[800, 600], rect=[10, 10, 550, 155], level=1)
        trace = dict(duration_seconds=10, initial_hud=hud, actions=[{'hud': hud}])
        intervals, stats = prepare(trace)
        self.assertEqual(intervals, [])
        self.assertEqual(stats['invalid_timestamps'], 1)

    def test_unfit_translation_does_not_cover_original(self):
        from viewport_translation import filters
        hud = dict(viewport=[800, 600], rect=[10, 10, 150, 50], level=1)
        stats = {}
        with tempfile.TemporaryDirectory() as temp:
            result = filters({}, temp, intervals=[(0, 1, hud, 'Очень длинное сообщение ' * 50)], stats=stats)
        self.assertEqual(result, '')
        self.assertEqual(stats['overlay_layout_skipped'], 1)
