import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import adventure_draft
from speech_pronunciation import load_pronunciations, pronunciation_text, speech_cadence


class PronunciationTests(unittest.TestCase):
    def test_game_words_numbers_and_keys(self):
        source = 'Steam Deck: нажми [E] и выбери 800x600. Итог 7 из 10!'
        self.assertEqual(pronunciation_text(source),
                         'Стим Дек: нажми клавишу и и выбери 800 на 600. Итог семь из десяти!')
        self.assertEqual(source, 'Steam Deck: нажми [E] и выбери 800x600. Итог 7 из 10!')

    def test_do_not_guess_decimal_scores_keys_or_unknown_names(self):
        original = 'Цена 1.7 из 10, версия 1.2, [E] означает действие; Secret Game.'
        self.assertEqual(pronunciation_text(original), original)
        self.assertEqual(pronunciation_text('Это 7 из 10.5, а не 7 из 10.'), 'Это 7 из 10.5, а не семь из десяти.')

    def test_preserves_placeholders_urls_and_code_even_with_custom_dictionary(self):
        text = 'Steam и https://example.org/Steam?q=7 из 10; `Steam   [E]`; {Steam}; <Steam>.'
        result = pronunciation_text(text, aliases={'Steam': 'стимм'})
        self.assertEqual(result, 'стимм и https://example.org/Steam?q=7 из 10; `Steam   [E]`; {Steam}; <Steam>.')
        self.assertEqual(pronunciation_text('https://example.org/7x10 и {player}'), 'https://example.org/7x10 и {player}')

    def test_dictionary_is_explicit_bounded_and_rejects_ambiguous_keys(self):
        with tempfile.TemporaryDirectory() as temp:
            file = Path(temp) / 'pronunciations.json'
            file.write_text(json.dumps({'Viewport Voyager': 'Вьюпорт Вояджер'}, ensure_ascii=False))
            self.assertEqual(load_pronunciations(file)['Viewport Voyager'], 'Вьюпорт Вояджер')
            with patch.dict(os.environ, {'SPEECH_PRONUNCIATION_PATH': str(file)}):
                self.assertEqual(pronunciation_text('Игра Viewport Voyager.'), 'Игра Вьюпорт Вояджер.')
            file.write_text('{"Steam": "Стим", "steam": "Стеам"}')
            with self.assertRaises(ValueError): load_pronunciations(file)
            file.write_text('{"x": ""}')
            with self.assertRaises(ValueError): load_pronunciations(file)

    def test_cadence_uses_punctuation_not_guessed_emotion(self):
        self.assertGreater(speech_cadence('Правда?')[2], speech_cadence('Факт.')[2])
        self.assertEqual(speech_cadence('Правда?!'), speech_cadence('Правда?'))
        self.assertGreater(speech_cadence('Пауза...')[2], speech_cadence('Факт.')[2])

    def test_piper_and_espeak_get_spoken_text_not_caption_rewrite(self):
        text = 'Нажми [E] в Steam, размер 800×600?'
        with tempfile.TemporaryDirectory() as temp:
            model = Path(temp) / 'model.onnx'; model.touch()
            Path(str(model) + '.json').touch()
            with patch.dict(os.environ, {'PIPER_MODEL_PATH': str(model)}, clear=False), \
                 patch.object(adventure_draft.subprocess, 'run') as run:
                adventure_draft.narrate(text, Path(temp) / 'out.wav')
            command = run.call_args.args[0]
            self.assertEqual(run.call_args.kwargs['input'], 'Нажми клавишу и в Стим, размер 800 на 600?')
            self.assertEqual(command[command.index('--length_scale') + 1], '1.08')
            with patch.dict(os.environ, {'PIPER_MODEL_PATH': ''}, clear=False), \
                 patch.object(adventure_draft.subprocess, 'run') as run:
                adventure_draft.narrate(text, Path(temp) / 'out.wav')
            self.assertEqual(run.call_args.args[0][-1], 'Нажми клавишу и в Стим, размер 800 на 600?')
            self.assertEqual(text, 'Нажми [E] в Steam, размер 800×600?')


if __name__ == '__main__': unittest.main()
