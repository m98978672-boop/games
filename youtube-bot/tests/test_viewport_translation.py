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
            self.assertIn(russian, (Path(temp) / 'hud-ru-0.txt').read_text())

    def test_unknown_message_is_neither_hidden_nor_read(self):
        self.assertIsNone(translated_message('Unknown message'))
        self.assertEqual(cues(dict(duration_seconds=10, initial_hud={'message':'Unknown message'}, actions=[])), [])
