import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from publish_adventure_short import prepare


class LighthousePublishTests(unittest.TestCase):
    def test_only_terminal_twelve_action_episode_can_enter_queue(self):
        with tempfile.TemporaryDirectory() as root, patch('publish_adventure_short.subprocess.check_output') as probe:
            folder = Path(root)
            trace = dict(game='Последний сигнал', short=True, outcome='time_limit', actions=[{}] * 12)
            (folder / 'pilot.json').write_text(json.dumps(dict(short=True, needs_continuation=False, draft='zuza-adventure-short.mp4')))
            (folder / 'zuza-adventure-short.mp4').touch()
            probe.return_value = json.dumps(dict(format={'duration': '125'}, streams=[
                dict(codec_type='video', width=1080, height=1920), dict(codec_type='audio')]))
            (folder / 'trace.json').write_text(json.dumps(trace))
            with self.assertRaises(ValueError):
                prepare(folder, '123', lighthouse=True)
            trace['outcome'] = 'game_reported_victory'
            (folder / 'trace.json').write_text(json.dumps(trace))
            result = json.loads(prepare(folder, '123', lighthouse=True).read_text())['metadata']
            self.assertTrue(result['title'].startswith('Бета'))
            self.assertIsNotNone(result['publish_at'])
            self.assertIsNone(result['requested_publish_at'])
