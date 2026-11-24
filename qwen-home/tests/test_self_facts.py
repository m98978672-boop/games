"""Проверка слоя фактов о ней самой: числа берутся из дома, а не из воздуха.

Именно здесь она уже ошибалась в реальном разговоре: на вопрос «какой у тебя
счёт в шахматах» ответила «собираю 3D-модельку». Тест держит три вещи:

* факты читаются из её файлов и совпадают с тем, что там записано;
* отсутствующий файл — отсутствующий факт, а не выдуманное число;
* проверка черновика ловит цифру, которой нет в доме.
"""
import json
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / 'tools'))

from self_facts import (SelfFacts, SelfFactsError, build_fact_block,  # noqa: E402
                        question_needs_self_facts, read_home, topics_in)

HOME = HERE.parent


class HomeReadingTests(unittest.TestCase):
    def test_it_reads_the_real_home_without_inventing_anything(self):
        facts = read_home(HOME)
        state = json.loads((HOME / 'state.json').read_text(encoding='utf-8'))
        games = json.loads((HOME / 'bridge' / 'games.json').read_text(encoding='utf-8'))
        self.assertEqual(facts.name, state['name'])
        self.assertEqual(facts.steps, state['totalSteps'])
        self.assertEqual(facts.learn_runs, state['learnRuns'])
        self.assertEqual(facts.chess['wins'], games['chess']['wins'])
        self.assertEqual(facts.chess['games'], games['chess']['games'])
        self.assertTrue(facts.want.get('title'))
        # Every fact must be traceable to a file: no field is a guess.
        data = facts.as_dict()
        self.assertIn('счёт в шахматах', data)
        self.assertIn(f"{games['chess']['wins']} из {games['chess']['games']}", data['счёт в шахматах'])

    def test_a_broken_or_missing_file_leaves_the_fact_missing(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / 'state.json').write_text('{ not json', encoding='utf-8')
            facts = read_home(root)
            self.assertIsNone(facts.steps)
            self.assertIsNone(facts.learn_runs)
            self.assertEqual(facts.facts(), [])
        with self.assertRaises(SelfFactsError):
            read_home(Path(temp) / 'nope')

    def test_absent_numbers_are_none_not_zero(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / 'state.json').write_text(json.dumps({'name': 'Квеня'}), encoding='utf-8')
            facts = read_home(root)
            self.assertIsNone(facts.steps)
            self.assertNotIn('шагов обучения', dict(facts.facts()))


class QuestionUnderstandingTests(unittest.TestCase):
    def test_it_recognises_a_question_about_herself(self):
        text = 'привет! где ты живёшь, какой у тебя сейчас счёт в шахматах и что ты умеешь искать в интернете?'
        topics = topics_in(text)
        self.assertIn('chess', topics)
        self.assertIn('home', topics)
        self.assertIn('search', topics)
        self.assertTrue(question_needs_self_facts(text))

    def test_a_question_about_the_world_is_not_about_her(self):
        self.assertFalse(question_needs_self_facts('в каком году основан Санкт-Петербург?'))

    def test_the_fact_block_contains_only_relevant_verified_pairs(self):
        facts = read_home(HOME)
        block = build_fact_block(facts, ['chess'])
        self.assertIn('счёт в шахматах', block)
        self.assertIn('не меняй', block)
        self.assertNotIn('главное желание', block)
        # A question about search has no numbers in the home; the block still
        # offers the honest facts instead of inventing a search statistic.
        search_block = build_fact_block(facts, ['search'])
        self.assertTrue(search_block)

    def test_a_home_without_facts_produces_no_block(self):
        empty = SelfFacts()
        self.assertEqual(build_fact_block(empty, ['chess']), '')


class DraftCheckTests(unittest.TestCase):
    """Та же проверка, что в talk-generate.py: цифра не из дома — плохой черновик."""

    @staticmethod
    def problem(text, facts):
        import re
        allowed = set(re.findall(r'\d+', ' '.join(v for _, v in facts.facts())))
        used = set(re.findall(r'\d+', text or ''))
        invented = {n for n in used if n not in allowed and len(n) > 1}
        return f'цифры не из дома (выдумано: {", ".join(sorted(invented))})' if invented else None

    def test_a_number_from_the_home_passes(self):
        facts = read_home(HOME)
        text = f"Я играю расчётом: счёт — {facts.chess['wins']} из {facts.chess['games']}."
        self.assertIsNone(self.problem(text, facts))

    def test_an_invented_number_is_rejected(self):
        facts = read_home(HOME)
        self.assertTrue(self.problem('У меня счёт 47 из 53 в шахматах.', facts))
        self.assertTrue(self.problem('Я прошла 5123 шага обучения.', facts))


if __name__ == '__main__':
    unittest.main()
