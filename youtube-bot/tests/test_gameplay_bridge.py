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
            self.assertEqual(command.count('--env'), 1)
            self.assertIn('BRIDGE_ENTRY=index.html', command)
            with self.assertRaises(ValueError):
                docker_command(game, 'games-bridge-' + 'a' * 32, '../index.html')
            (game / 'escape').symlink_to('/etc')
            with self.assertRaisesRegex(ValueError, 'symlinks'):
                docker_command(game, 'games-bridge-' + 'a' * 32)
    def test_recording_mount_is_optional_separate_and_empty(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp); game = root / 'game'; game.mkdir(); (game / 'index.html').write_text('test')
            recording = root / 'record'; recording.mkdir()
            command = docker_command(game, 'games-bridge-' + 'a' * 32, record_dir=recording)
            self.assertEqual(command.count('--mount'), 2)
            self.assertIn('BRIDGE_RECORD=1', command)
            self.assertIn('--read-only', command)
            self.assertEqual(command[command.index('--network') + 1], 'none')
            (recording / 'preexisting').write_text('do not overwrite')
            with self.assertRaises(ValueError): docker_command(game, 'games-bridge-' + 'a' * 32, record_dir=recording)
            child = game / 'child'; child.mkdir()
            with self.assertRaises(ValueError): docker_command(game, 'games-bridge-' + 'a' * 32, record_dir=child)
            link = root / 'link'; link.symlink_to(child)
            with self.assertRaises(ValueError): docker_command(game, 'games-bridge-' + 'a' * 32, record_dir=link)

    def test_2048_telemetry_is_opt_in_and_cannot_enable_other_modes(self):
        with tempfile.TemporaryDirectory() as temp:
            game = Path(temp) / 'game'; game.mkdir(); (game / 'index.html').write_text('test')
            name = 'games-bridge-' + 'a' * 32
            self.assertNotIn('BRIDGE_TELEMETRY=2048', docker_command(game, name))
            command = docker_command(game, name, telemetry='2048')
            self.assertIn('BRIDGE_TELEMETRY=2048', command)
            self.assertEqual(command[command.index('--network') + 1], 'none')
            with self.assertRaises(ValueError): docker_command(game, name, telemetry='shell')

    def test_voxel_setup_is_opt_in_and_offline(self):
        with tempfile.TemporaryDirectory() as temp:
            game = Path(temp) / 'game'; game.mkdir(); (game / 'index.html').write_text('test')
            name = 'games-bridge-' + 'a' * 32
            plain = docker_command(game, name)
            self.assertNotIn('BRIDGE_BOOTSTRAP=voxel', plain)
            command = docker_command(game, name, telemetry='voxel', bootstrap='voxel')
            self.assertIn('BRIDGE_BOOTSTRAP=voxel', command)
            self.assertIn('BRIDGE_TELEMETRY=voxel', command)
            self.assertEqual(command[command.index('--network') + 1], 'none')
            with self.assertRaises(ValueError): docker_command(game, name, bootstrap='other')

    def test_adventure_telemetry_is_explicit_and_isolated(self):
        with tempfile.TemporaryDirectory() as temp:
            game = Path(temp) / 'game'; game.mkdir(); (game / 'index.html').write_text('test')
            name = 'games-bridge-' + 'a' * 32
            command = docker_command(game, name, telemetry='adventure')
            self.assertIn('BRIDGE_TELEMETRY=adventure', command)
            self.assertEqual(command[command.index('--network') + 1], 'none')

    def test_rights_are_explicit_and_steps_bounded(self):
        with self.assertRaisesRegex(ValueError, 'rights'):
            BrowserBridge(Path('.'))
        with self.assertRaises(ValueError):
            run_agent(Path('.'), lambda *_: None, max_steps=0)
        with self.assertRaises(ValueError):
            run_agent(Path('.'), lambda *_: None, max_steps=True)

if __name__ == '__main__':
    unittest.main()
