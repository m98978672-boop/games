import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay_release_plan import make_plan


class GameplayReleasePlanTests(unittest.TestCase):
    def plan(self, seconds, **overrides):
        kwargs = {'duration_seconds': seconds, 'game': 'Chess', 'author': 'Example author',
                  'repository_url': 'https://github.com/example/chess'}
        kwargs.update(overrides)
        return make_plan(**kwargs)

    def test_boundaries_and_truthful_metadata(self):
        one = self.plan(1800)
        self.assertEqual([(p.start_seconds, p.end_seconds) for p in one], [(0, 1800)])
        parts = self.plan(3600)
        self.assertEqual([(p.start_seconds, p.end_seconds) for p in parts], [(0, 1800), (1800, 3600)])
        self.assertIn('часть 2', parts[1].title)
        self.assertIn('ссылка на игру в описании', parts[0].title)
        self.assertIn('Example author', parts[0].description)
        self.assertIn('https://github.com/example/chess', parts[0].description)
        self.assertEqual(len(self.plan(1800.001)), 2)

    def test_rejects_unbounded_invalid_and_forged_sources(self):
        for value in (0, -1, 3600.001, float('nan'), float('inf'), True):
            with self.subTest(value=value), self.assertRaises(ValueError):
                self.plan(value)
        for url in ('https://github.com.evil.test/example/chess', 'https://github.com/example/chess?x=y',
                    'https://github.com/example/chess/tree/main', 'https://example@github.com/example/chess'):
            with self.subTest(url=url), self.assertRaises(ValueError):
                self.plan(60, repository_url=url)
        for kwargs in ({'game': ''}, {'author': ''}, {'game': 'x' * 66}):
            with self.assertRaises(ValueError): self.plan(60, **kwargs)

if __name__ == '__main__': unittest.main()
