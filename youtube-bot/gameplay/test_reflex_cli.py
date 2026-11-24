"""CLI contract for the reflex layer (run by CI: python -m unittest .../test_reflex_cli.py)."""
import contextlib
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))

from gameplay import reflex_cli  # noqa: E402


def run(argv):
    buffer = io.StringIO()
    with contextlib.redirect_stdout(buffer):
        code = reflex_cli.main(argv)
    return code, buffer.getvalue()


class CliTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.db = Path(self.tmp.name) / 'skills.sqlite3'

    def tearDown(self):
        self.tmp.cleanup()

    def test_budget_and_profiles_are_json(self):
        code, out = run(['budget'])
        self.assertEqual(code, 0)
        self.assertEqual(json.loads(out)['perception_budget_ms'], 300.0)
        code, out = run(['profiles'])
        self.assertEqual(code, 0)
        self.assertIn('joystick', json.loads(out))

    def test_bench_returns_zero_when_budget_is_met(self):
        code, out = run(['bench', '5'])
        payload = json.loads(out)
        self.assertEqual(code, 0 if payload['ok'] else 1)
        self.assertLessEqual(payload['perceive']['p95_ms'], 300.0)

    def test_learn_export_import_and_forget(self):
        from gameplay.skill_memory import SkillMemory
        memory = SkillMemory(self.db)
        memory.record('f' * 16, 'FORWARD', True)
        memory.record('f' * 16, 'FORWARD', True)
        code, out = run(['--db', str(self.db), 'skills'])
        self.assertEqual(code, 0)
        self.assertEqual(json.loads(out)['rows'], 1)

        snapshot = memory.export(Path(self.tmp.name) / 'snapshot.json')
        fresh = Path(self.tmp.name) / 'other.sqlite3'
        code, out = run(['--db', str(fresh), 'import', str(snapshot)])
        self.assertEqual(code, 0)
        self.assertEqual(json.loads(out)['merged_rows'], 1)
        self.assertEqual(SkillMemory(fresh).recall('f' * 16), 'FORWARD')

        code, out = run(['--db', str(self.db), 'forget', '--all'])
        self.assertEqual(code, 0)
        self.assertEqual(json.loads(out)['deleted_rows'], 1)
        self.assertEqual(SkillMemory(self.db).dump(), [])

    def test_forget_requires_an_explicit_target(self):
        code, out = run(['--db', str(self.db), 'forget'])
        self.assertEqual(code, 2)
        self.assertIn('error', json.loads(out))

    def test_forget_one_signature_keeps_the_rest(self):
        from gameplay.skill_memory import SkillMemory
        memory = SkillMemory(self.db)
        for signature in ('a' * 16, 'b' * 16):
            memory.record(signature, 'FORWARD', True)
            memory.record(signature, 'FORWARD', True)
        code, out = run(['--db', str(self.db), 'forget', '--signature', 'a' * 16])
        self.assertEqual(code, 0)
        self.assertEqual(json.loads(out)['deleted_rows'], 1)
        remaining = SkillMemory(self.db)
        self.assertIsNone(remaining.recall('a' * 16))
        self.assertEqual(remaining.recall('b' * 16), 'FORWARD')

    def test_forget_rejects_malformed_signature(self):
        code, out = run(['--db', str(self.db), 'forget', '--signature', 'ZZZ'])
        self.assertEqual(code, 2)
        self.assertIn('error', json.loads(out))

    def test_import_rejects_garbage(self):
        bad = Path(self.tmp.name) / 'bad.json'
        bad.write_text('{"version": 2, "skills": []}', encoding='utf-8')
        code, _ = run(['--db', str(self.db), 'import', str(bad)])
        self.assertEqual(code, 1)

    def test_live_without_docker_fails_loudly(self):
        # CI runners do have Docker, so availability is pinned rather than
        # assumed: without it the command must report and exit 1, never hang or
        # pretend the game was played.
        import gameplay_bridge
        from unittest import mock
        with mock.patch.object(gameplay_bridge.shutil, 'which', return_value=None):
            code, out = run(['live', '--steps', '2'])
        self.assertEqual(code, 1)
        self.assertIn('Docker', out)
        self.assertFalse(json.loads(out)['published'])

    def test_live_rejects_absurd_step_counts(self):
        with contextlib.redirect_stderr(io.StringIO()):
            with self.assertRaises(SystemExit):
                run(['live', '--steps', '9999'])

    def test_bench_rejects_absurd_frame_counts(self):
        with contextlib.redirect_stderr(io.StringIO()):
            with self.assertRaises(SystemExit):
                run(['bench', '999999'])


if __name__ == '__main__':
    unittest.main()
