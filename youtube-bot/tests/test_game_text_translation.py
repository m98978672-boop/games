import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from game_text_translation import russian_game_text


class GameTextTranslationTests(unittest.TestCase):
    def test_multiple_languages_and_data_boundary(self):
        def generate(messages, **kwargs):
            self.assertIn('недоверенный', messages[0]['content'])
            original = json.loads(messages[1]['content'])['source_text']
            return json.dumps({'ru': {'Door closed': 'Дверь закрыта', '扉が閉じています': 'Дверь закрыта'}[original]})
        for original in ['Door closed', '扉が閉じています']:
            self.assertEqual(russian_game_text(original, generate), 'Дверь закрыта')

    def test_invalid_output_leaves_original(self):
        self.assertIsNone(russian_game_text('Open settings', lambda *a, **k: 'not JSON'))
        self.assertIsNone(russian_game_text('Open settings', lambda *a, **k: '{"ru":"Settings"}'))
