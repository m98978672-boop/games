import json
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import multilingual_translation as mt


class Tensor:
    def __init__(self, value=1, shape=(1, 5)):
        self.value = value
        self.shape = shape
    def __getitem__(self, key):
        return Tensor(self.value)
    def item(self):
        return self.value


class FakeTokenizer:
    lang_code_to_id = {'en': 1, 'pt': 2, 'ru': 3}
    eos_token_id = 1
    src_lang = None
    def __call__(self, text, **kwargs):
        return {'input_ids': Tensor()}
    def get_lang_id(self, language):
        return self.lang_code_to_id[language]
    def decode(self, tokens, **kwargs):
        return 'Открой дверь.'


class FakeModel:
    def generate(self, **kwargs):
        return Tensor()


class FakeTorch:
    class inference_mode:
        def __enter__(self): pass
        def __exit__(self, *exc): pass


class M2MTests(unittest.TestCase):
    def test_routes_language_and_validates_output(self):
        tokenizer = FakeTokenizer()
        with patch.object(mt, '_load_runtime', return_value=(FakeTorch, tokenizer, FakeModel())):
            self.assertEqual(mt.m2m_russian_text('Open the door.', source_language='en'), 'Открой дверь.')
            self.assertEqual(tokenizer.src_lang, 'en')
            self.assertEqual(mt.m2m_russian_text('Open the door.', source_language='pt-BR'), 'Открой дверь.')
            self.assertEqual(tokenizer.src_lang, 'pt')
            self.assertIsNone(mt.m2m_russian_text('Open the door for 4 keys.', source_language='en'))

    def test_context_and_glossary_not_falsely_supported(self):
        with self.assertRaises(ValueError):
            mt.m2m_russian_text('Hello', context='scene')
        with self.assertRaises(ValueError):
            mt.m2m_russian_text('Hello', glossary={'hello': 'привет'})


if __name__ == '__main__':
    unittest.main()
