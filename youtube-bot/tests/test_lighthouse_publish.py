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
            (folder / 'pilot.json').write_text(json.dumps(dict(short=False, needs_continuation=False, draft='zuza-adventure-short.mp4')))
            probe.return_value = json.dumps(dict(format={'duration': '181'}, streams=[
                dict(codec_type='video', width=800, height=600), dict(codec_type='audio')]))
            self.assertEqual(json.loads(prepare(folder, '123', lighthouse=True).read_text())['metadata']['video_format'], 'long')

    def test_decimal_score_is_a_rating_not_a_count_of_tests(self):
        from game_reviews import parse_idea_score, score_label
        self.assertEqual(score_label(parse_idea_score('9,9')), '9,9')
        for invalid in (True, 9.99, 0.9, '10,1', '99/100'):
            with self.assertRaises(ValueError):
                parse_idea_score(invalid)

    def test_preflight_skips_many_busy_slots_but_never_retries_own_reservation(self):
        from datetime import datetime, timezone
        from publish_adventure_short import publish_checked, PublishError
        from schedule_policy import next_publish_slot
        now = datetime(2026, 11, 26, tzinfo=timezone.utc)
        probe = now
        busy = []
        for i in range(7):
            probe = next_publish_slot(probe, video_format='short')
            busy.append(dict(id=str(i), status='scheduled', publish_at=probe.isoformat()))
        with tempfile.TemporaryDirectory() as root:
            path = Path(root) / 'result.json'
            path.write_text(json.dumps({'metadata': {'job_id': 'ours', 'video_format': 'short'}}))
            with patch('publish_adventure_short.read_queue', return_value=busy), patch('publish_adventure_short.publish') as upload:
                publish_checked(path, lighthouse=True, now=now)
                upload.assert_called_once_with(path)
                expected = next_publish_slot(probe, video_format='short').isoformat().replace('+00:00', 'Z')
                self.assertEqual(json.loads(path.read_text())['metadata']['publish_at'], expected)
            with patch('publish_adventure_short.read_queue', return_value=[dict(id='ours', status='processing')]), patch('publish_adventure_short.publish') as upload:
                with self.assertRaises(PublishError):
                    publish_checked(path, lighthouse=True, now=now)
                upload.assert_not_called()

    def test_neural_revoice_refuses_missing_model_without_robotic_fallback(self):
        from adventure_draft import narrate
        with tempfile.TemporaryDirectory() as root:
            model = Path(root) / 'russian.onnx'
            with patch.dict('os.environ', {'PIPER_MODEL_PATH': str(model)}), patch('adventure_draft.subprocess.run') as run:
                with self.assertRaisesRegex(RuntimeError, 'refusing fallback'):
                    narrate('Проверяю питание.', Path(root) / 'line.wav')
                run.assert_not_called()
                model.touch()
                model.with_suffix('.onnx.json').touch()
                narrate('Проверяю питание.', Path(root) / 'line.wav')
                self.assertEqual(run.call_args.args[0][0], 'piper')
                self.assertEqual(run.call_args.kwargs['input'], 'Проверяю питание.')
