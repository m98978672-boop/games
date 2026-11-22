import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay_bridge import BrowserBridge, docker_command, run_agent

class BridgeSafetyTests(unittest.TestCase):
    def test_container_has_no_network_or_secrets_and_only_readonly_game_mount(self):
        with tempfile.TemporaryDirectory() as temp:
            game = Path(temp) / 'game'
            game.mkdir()
            (game / 'index.html').write_text('test')
            command = docker_command(game, 'games-bridge-' + 'a' * 32)
            self.assertEqual(command[command.index('--network') + 1], 'none')
            self.assertIn('--read-only', command)
            self.assertEqual(command.count('--mount'), 1)
            self.assertTrue(command[command.index('--mount') + 1].endswith(',dst=/game,readonly'))
            self.assertNotIn('--env', command)
            (game / 'escape').symlink_to('/etc')
            with self.assertRaisesRegex(ValueError, 'symlinks'):
                docker_command(game, 'games-bridge-' + 'a' * 32)
    def test_rights_are_explicit_and_steps_bounded(self):
        with self.assertRaisesRegex(ValueError, 'rights'):
            BrowserBridge(Path('.'))
        with self.assertRaises(ValueError):
            run_agent(Path('.'), lambda *_: None, max_steps=0)
        with self.assertRaises(ValueError):
            run_agent(Path('.'), lambda *_: None, max_steps=True)

if __name__ == '__main__':
    unittest.main()
