"""Check the actual Actions entrypoint, including cross-module imports."""
import os
import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'youtube-bot'))
from review_workflow_format import choose_format


class ReviewCliContractTests(unittest.TestCase):
    def test_each_workflow_event_runs_from_a_fresh_interpreter(self):
        workflow = (ROOT / '.github/workflows/youtube-shorts-autopilot.yml').read_text(encoding='utf-8')
        section = workflow.split('  schedule:', 1)[1].split('  workflow_dispatch:', 1)[0]
        crons = re.findall(r'cron:\s*["\']([^"\']+)["\']', section)
        self.assertTrue(crons)
        cases = [('schedule', cron, '') for cron in crons]
        cases += [('workflow_dispatch', '', 'short'), ('workflow_dispatch', '', 'long')]
        for event, cron, manual in cases:
            with self.subTest(event=event, cron=cron, manual=manual), tempfile.TemporaryDirectory() as tmp:
                envfile = Path(tmp) / 'github-env'
                envfile.touch()
                env = dict(os.environ, GITHUB_EVENT_NAME=event, REVIEW_SCHEDULE=cron,
                           MANUAL_VIDEO_FORMAT=manual, GITHUB_ENV=str(envfile))
                result = subprocess.run([sys.executable, str(ROOT / 'youtube-bot/review_workflow_format.py')],
                                        cwd=ROOT, env=env, capture_output=True, text=True, timeout=20)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(envfile.read_text(encoding='utf-8'),
                                 f'VIDEO_FORMAT={choose_format(event, cron, manual)}\n')


if __name__ == '__main__': unittest.main()
