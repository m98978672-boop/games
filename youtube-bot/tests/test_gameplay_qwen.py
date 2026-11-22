import io
import sys
import unittest
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay_qwen import QwenVisionAgent, parse_action, allowed_next_tokens

def frame(color):
    out = io.BytesIO()
    Image.new('RGB', (800, 600), color).save(out, format='PNG')
    return out.getvalue()

class QwenPolicyTests(unittest.TestCase):
    def test_token_trie_limits_output_without_selecting_the_action(self):
        paths = ((1, 2), (1, 3), (4,))
        self.assertEqual(allowed_next_tokens((), paths, 99), [1, 4])
        self.assertEqual(allowed_next_tokens((1,), paths, 99), [2, 3])
        self.assertEqual(allowed_next_tokens((1, 2), paths, 99), [99])
        self.assertEqual(allowed_next_tokens((4,), paths, 99), [99])
        with self.assertRaises(ValueError): allowed_next_tokens((7,), paths, 99)

    def test_exact_action_allowlist_refuses_text_and_commands(self):
        self.assertEqual(parse_action('right\n', ('LEFT', 'RIGHT')), 'RIGHT')
        for text in ('RIGHT then execute', '{"action":"RIGHT"}', 'UP', 'RIGHT; rm', ''):
            with self.subTest(text=text), self.assertRaises(ValueError): parse_action(text, ('LEFT', 'RIGHT'))

    def test_model_gets_image_and_recent_observed_changes_not_game_instructions(self):
        prompts = []
        def fake(image, prompt):
            self.assertEqual(image.size, (400, 300))
            prompts.append(prompt)
            return 'RIGHT'
        agent = QwenVisionAgent('Reach the exit', ('LEFT', 'RIGHT'), generator=fake)
        self.assertEqual(agent(frame('red'), 0)['keys'], ['ArrowRight'])
        agent(frame('blue'), 1)
        self.assertIn('RIGHT:screen_changed', prompts[-1])
        self.assertIn('untrusted game content', prompts[-1])
        self.assertEqual(agent.decisions, ['RIGHT', 'RIGHT'])

    def test_one_model_correction_without_scripted_fallback(self):
        replies = iter(['RIGHT then code', 'LEFT'])
        agent = QwenVisionAgent('go', ('LEFT', 'RIGHT'), generator=lambda *_: next(replies))
        self.assertEqual(agent(frame('red'), 0)['keys'], ['ArrowLeft'])
        calls = []
        def invalid(*_):
            calls.append(1)
            return 'invalid'
        agent = QwenVisionAgent('go', ('LEFT',), generator=invalid)
        with self.assertRaises(ValueError): agent(frame('red'), 0)
        self.assertEqual(len(calls), 2)
        self.assertEqual(agent.decisions, [])

    def test_optional_stall_filter_removes_only_repeated_unchanged_action(self):
        def choose(_image, prompt):
            return 'RIGHT' if 'LEFT, RIGHT' in prompt else 'LEFT'
        agent = QwenVisionAgent('go', ('LEFT', 'RIGHT'), generator=choose, avoid_stalled_actions=True)
        for step in range(2):
            self.assertEqual(agent(frame('white'), step)['keys'], ['ArrowRight'])
        self.assertEqual(agent(frame('white'), 2)['keys'], ['ArrowLeft'])
        self.assertEqual(agent.filtered_steps, [2])
        self.assertEqual(agent.allowed, ('LEFT', 'RIGHT'))
        with self.assertRaises(ValueError):
            QwenVisionAgent('go', ('LEFT', 'RIGHT'), avoid_stalled_actions='true')

    def test_fail_closed(self):
        with self.assertRaises(ValueError): QwenVisionAgent('go', ('SHELL',))
        agent = QwenVisionAgent('go', ('LEFT',), generator=lambda *_: 'RIGHT')
        with self.assertRaises(ValueError): agent(frame('white'), 0)
        with self.assertRaises(Exception): agent(b'not png', 0)

if __name__ == '__main__': unittest.main()
