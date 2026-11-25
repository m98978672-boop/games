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
            number = ''.join(c for c in seen[-1] if c.isdecimal())
            return json.dumps({'ru': f'Перевод {number}.' if number else 'Перевод.'})

        result = russian_game_text(original, generate)
        self.assertEqual(' '.join(seen), ' '.join(original.split()))
        self.assertTrue(result.endswith('\n\nПеревод.'))

        def fail_last(messages, **kwargs):
            if 'last line' in messages[1]['content']:
                return 'invalid'
            return generate(messages, **kwargs)

        self.assertIsNone(russian_game_text(original, fail_last))

    def test_changed_quest_quantities_rejected(self):
        self.assertIsNone(russian_game_text('Collect 12 keys in 4 minutes.',
            lambda *a, **k: '{"ru":"Собери 2 ключа за 4 минуты."}'))
        self.assertEqual(russian_game_text('Collect 12 keys in 4 minutes.',
            lambda *a, **k: '{"ru":"Собери 12 ключей за 4 минуты."}'), 'Собери 12 ключей за 4 минуты.')

    def test_adjacent_lines_inform_translation_and_numeric_error_retries(self):
        calls = []

        def generate(messages, **kwargs):
            payload = json.loads(messages[1]['content'])
            calls.append(payload)
            if payload['source_text'] == 'The guard is injured.':
                return '{"ru":"Страж ранен."}'
            return '{"ru":"У него 3 ключа."}' if len(calls) == 2 else '{"ru":"У него 4 ключа."}'

        result = russian_game_text('The guard is injured. He has 4 keys.', generate, context='Dungeon escape')
        self.assertEqual(result, 'Страж ранен. У него 4 ключа.')
        self.assertEqual(calls[1]['scene_context'], 'Dungeon escape')
        self.assertEqual(calls[1]['previous_text'], 'The guard is injured.')
        self.assertEqual(len(calls), 3)

    def test_ui_placeholders_and_key_labels_must_survive(self):
        source = 'Press [E] to give {player} a key.'
        self.assertIsNone(russian_game_text(source,
            lambda *a, **k: '{"ru":"Нажми [F], чтобы отдать игроку ключ."}'))
        self.assertEqual(russian_game_text(source,
            lambda *a, **k: '{"ru":"Нажми [E], чтобы отдать {player} ключ."}'),
            'Нажми [E], чтобы отдать {player} ключ.')
