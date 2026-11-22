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

    def test_fit_remeasures_and_shortens_until_under_scene_limit(self):
        measured = []

        def duration(text):
            measured.append(text)
            return len(text) / 10

        final_text, seconds = fit_speech_text("Очень длинный текст. " * 20, duration, max_seconds=12)
        self.assertLessEqual(seconds, 12)
        self.assertLess(len(final_text), len(measured[0]))
        self.assertEqual(final_text, measured[-1])

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
