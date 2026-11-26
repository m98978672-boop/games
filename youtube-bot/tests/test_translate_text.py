import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from translate_text import translate_content, translate_file, load_glossary


def fake(text, **kwargs):
    text = text.strip()
    return {'Hello!': 'Привет!', 'Open the door.': 'Открой дверь.', 'Hello world': 'Привет мир'}[text]


class TranslateTextTests(unittest.TestCase):
    def test_srt_preserves_timestamps_identifiers_settings_and_crlf(self):
        source = '17\r\n00:00:01,250 --> 00:00:02,500 X1:10\r\nHello!\r\n\r\n19\r\n00:00:04,000 --> 00:00:05,001\r\nOpen the door.\r\n'
        expected = source.replace('Hello!', 'Привет!').replace('Open the door.', 'Открой дверь.')
        self.assertEqual(translate_content(source, '.srt', fake), expected)

    def test_json_timings_and_neighbor_context(self):
        calls = []
        def translate(text, **kwargs):
            calls.append((text, kwargs))
            return fake(text)
        source = [[0, 1.125, 'Hello!'], [2, 3.5, 'Hello!']]
        result = json.loads(translate_content(json.dumps(source), '.json', translate, source_language='en'))
        self.assertEqual(result, [[0, 1.125, 'Привет!'], [2, 3.5, 'Привет!']])
        self.assertEqual(len(calls), 2)
        self.assertEqual(calls[0][1]['source_language'], 'en')
        self.assertIn('Next: Hello!', calls[0][1]['context'])
        self.assertIn('Previous: Hello!', calls[1][1]['context'])

    def test_failure_leaves_no_output_and_no_overwrite(self):
        with tempfile.TemporaryDirectory() as directory:
            src = Path(directory) / 'in.srt'
            dst = Path(directory) / 'out.srt'
            src.write_text('1\n00:00:00,000 --> 00:00:01,000\nHello!\n\n2\n00:00:01,000 --> 00:00:02,000\nOpen the door.\n')
            def fail(text, **kwargs):
                return None if text == 'Open the door.' else fake(text)
            with self.assertRaises(ValueError):
                translate_file(src, dst, translate=fail)
            self.assertFalse(dst.exists())
            dst.write_text('keep')
            with self.assertRaises(FileExistsError):
                translate_file(src, dst, translate=fake)
            self.assertEqual(dst.read_text(), 'keep')

    def test_bad_cues_rejected_before_model(self):
        for source, kind in [('1\n00:00:60,000 --> 00:01:02,000\nHello!', '.srt'),
                             ('1\n00:00:01,000 --> 00:00:03,000\nHello!\n\n2\n00:00:02,000 --> 00:00:04,000\nHello!', '.srt'),
                             ('[[0, 4, "Hello!"], [3, 5, "Hello!"]]', '.json')]:
            with self.subTest(kind=kind), self.assertRaises(ValueError):
                translate_content(source, kind, lambda *a, **k: self.fail('Should validate first'))

    def test_glossary_is_loaded_and_passed_to_translator(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'glossary.json'
            path.write_text(json.dumps({'Mist Fort': 'Туманный форт'}, ensure_ascii=False))
            glossary = load_glossary(path)
            calls = []
            def translate(text, **options):
                calls.append(options)
                return 'Привет!'
            translate_content('Hello!', '.txt', translate, glossary=glossary)
            self.assertEqual(calls[0]['glossary'], glossary)
            path.write_text(json.dumps({'word': 123}))
            with self.assertRaises(ValueError):
                load_glossary(path)

    def test_plain_text(self):
        self.assertEqual(translate_content('Hello world\n', '.txt', fake), 'Привет мир\n')


if __name__ == '__main__':
    unittest.main()
