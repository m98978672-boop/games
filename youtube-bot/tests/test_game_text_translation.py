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

    def test_long_text_is_not_truncated_or_partially_published(self):
        sentence = ' '.join(f'Ancient inscription {i}.' for i in range(50))
        original = sentence + '\n\n' + 'The last line matters.'
        seen = []

        def generate(messages, **kwargs):
            seen.append(json.loads(messages[1]['content'])['source_text'])
            return json.dumps({'ru': 'Перевод.'})

        result = russian_game_text(original, generate)
        self.assertEqual(' '.join(seen), ' '.join(original.split()))
        self.assertTrue(result.endswith('\n\nПеревод.'))

        def fail_last(messages, **kwargs):
            if 'last line' in messages[1]['content']:
                return 'invalid'
            return generate(messages, **kwargs)

        self.assertIsNone(russian_game_text(original, fail_last))
