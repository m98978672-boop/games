import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from adventure_personality import short_comment
from adventure_draft import plan


class AdventurePersonalityTests(unittest.TestCase):
    def test_joke_depends_on_game_dialog_not_a_choice_prediction(self):
        event = {'choice_label': 'Check your pockets.', 'choice': 'CHOICETHREE',
                 'recording_elapsed_ms': 5000, 'screen_unchanged': False}
        self.assertEqual(short_comment(event, 'третий')[1], '')
        event['game_dialog'] = 'You find nothing but lint and despair.'
        trace = {'short': True, 'duration_seconds': 8, 'actions': [event], 'outcome': 'time_limit'}
        _, lines, _, won = plan(trace)
        self.assertIn((5, 'Карманный инвентарь: ворс. Как щедро.'), lines)
        self.assertFalse(won)

    def test_unknown_text_does_not_become_narration(self):
        self.assertEqual(short_comment({'choice_label': 'unknown', 'game_dialog': 'unknown'}, 'первый'),
                         ('Выбираю первый вариант.', ''))
