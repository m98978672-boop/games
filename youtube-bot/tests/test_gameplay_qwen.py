import io
import sys
import unittest
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay_qwen import QwenVisionAgent, parse_action

def frame(color):
    out = io.BytesIO()
    Image.new('RGB', (800, 600), color).save(out, format='PNG')
    return out.getvalue()

class QwenPolicyTests(unittest.TestCase):
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

    def test_fail_closed(self):
        with self.assertRaises(ValueError): QwenVisionAgent('go', ('SHELL',))
        agent = QwenVisionAgent('go', ('LEFT',), generator=lambda *_: 'RIGHT')
        with self.assertRaises(ValueError): agent(frame('white'), 0)
        with self.assertRaises(Exception): agent(b'not png', 0)

if __name__ == '__main__': unittest.main()
