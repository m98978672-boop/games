import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay_minecraft_bridge import minecraft_command

class MinecraftEnvironmentTests(unittest.TestCase):
    def test_ephemeral_container_has_no_mounts_or_passed_environment(self):
        command = minecraft_command('games-bridge-' + 'a' * 32)
        self.assertEqual(command[command.index('--network') + 1], 'bridge')
        for flag in ('--read-only', '--cap-drop', '--security-opt', '--user', '--pids-limit', '--memory'):
            self.assertIn(flag, command)
        self.assertNotIn('--mount', command)
        self.assertNotIn('-v', command)
        self.assertNotIn('--env', command)
        self.assertTrue(command[-1].endswith('/minecraft_bridge.cjs'))
    def test_container_name_is_not_arbitrary(self):
        with self.assertRaises(ValueError): minecraft_command('anything')

if __name__ == '__main__': unittest.main()
