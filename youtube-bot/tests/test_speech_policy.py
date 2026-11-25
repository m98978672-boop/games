import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from speech_policy import fit_speech_text, speech_excerpt


class SpeechPolicyTests(unittest.TestCase):
    def test_excerpt_prefers_complete_sentence_and_marks_partial_quote(self):
        self.assertEqual(speech_excerpt("Коротко. Это длинная подробная фраза здесь", 16), "Коротко.")
        excerpt = speech_excerpt("Слова каталога " + "интересный проект " * 20, 70)
        self.assertLessEqual(len(excerpt), 70)
        self.assertTrue(excerpt.endswith("…"))

    def test_excerpt_does_not_treat_semicolon_or_slice_edge_as_sentence_end(self):
        text = 'В игре есть режим; но только в платной версии и с дополнительными условиями.'
        self.assertTrue(speech_excerpt(text, 40).endswith('…'))
        self.assertTrue(speech_excerpt('Версия 2.4 доступна после обновления.', 9).endswith('…'))

    def test_preserve_full_keeps_disclaimer_or_fails(self):
        verdict = 'Итог: по описанию оценка идеи — 7 из 10. Я ещё не играла, поэтому оценка предварительная.'
        compact = 'Оценка идеи по описанию — 7 из 10. Я не играла.'
        fitted, _ = fit_speech_text(verdict, lambda text: len(text) / 6, max_seconds=12,
                                    preserve_full=True, fallback=compact)
        self.assertEqual(fitted, compact)
        self.assertIn('не играла', fitted)
        with self.assertRaisesRegex(ValueError, 'refusing to omit context'):
            fit_speech_text(verdict, lambda text: 20, max_seconds=12, preserve_full=True, fallback=None)

    def test_fit_remeasures_and_shortens_until_under_scene_limit(self):
        measured = []

        def duration(text):
            measured.append(text)
            return len(text) / 10

        final_text, seconds = fit_speech_text("Очень длинный текст. " * 20, duration, max_seconds=12)
        self.assertLessEqual(seconds, 12)
        self.assertLess(len(final_text), len(measured[0]))
        self.assertEqual(final_text, measured[-1])

    def test_fit_never_speaks_a_truncated_clause(self):
        def duration(text):
            return 2 if text == "Короткий разбор игрового проекта." else 30
        final_text, _ = fit_speech_text("Длинное предложение без завершения " * 12, duration)
        self.assertEqual(final_text, "Короткий разбор игрового проекта.")

    def test_fit_uses_neutral_fallback_if_truncation_cannot_fit(self):
        measured = []

        def duration(text):
            measured.append(text)
            return 4 if text == "Короткий разбор игрового проекта." else 13

        final_text, seconds = fit_speech_text("Невозможная для озвучки строка " * 8, duration)
        self.assertEqual(final_text, "Короткий разбор игрового проекта.")
        self.assertEqual(seconds, 4)


if __name__ == "__main__":
    unittest.main()
