import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import gameplay_2048 as game
import playthrough_continue as flow


class ContinuationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        root = Path(self.temp.name)
        self.addCleanup(self.temp.cleanup)
        output = root / "run" / "output"
        output.mkdir(parents=True)
        (output.parent / "source.json").write_text(json.dumps({"commit": game.COMMIT, "archive_sha256": game.ARCHIVE_SHA256, "rights_confirmation": "operator-asserted"}))
        self.state = output / "gameState.json"
        self.state.write_text(json.dumps({"grid": {"size": 4, "cells": [[None] * 4 for _ in range(4)]}, "score": 0, "over": False, "won": False, "keepPlaying": False}))
        self.ledger = root / "ledger.db"

    def test_wait_never_starts_or_reserves(self):
        with patch.object(flow, "assess_video", return_value={"decision": "wait"}), patch.object(flow.subprocess, "run") as run:
            self.assertEqual(flow.maybe_continue(None, video_id="AbCdEf01234", state=self.state, ledger=self.ledger), "wait")
            self.assertFalse(self.ledger.exists())
            run.assert_not_called()

    def test_positive_feedback_runs_once_and_locks_uncertain_failure(self):
        with patch.object(flow, "assess_video", return_value={"decision": "continue"}) as assess, \
             patch.object(flow.shutil, "which", return_value="/usr/bin/docker"), \
             patch.object(flow.subprocess, "run", side_effect=TimeoutError("unknown")) as run:
            with self.assertRaises(TimeoutError): flow.maybe_continue(None, video_id="AbCdEf01234", state=self.state, ledger=self.ledger)
            self.assertEqual(flow.maybe_continue(None, video_id="AbCdEf01234", state=self.state, ledger=self.ledger), "already_attempted")
            self.assertEqual(run.call_count, 1)
            self.assertEqual(assess.call_args.kwargs["required_tag"], flow.GAME_TAG)

    def test_positive_feedback_captures_and_finalizes_once(self):
        captures = Path(self.temp.name) / "captures"
        work = captures / "run-123"
        (work / "output").mkdir(parents=True)
        def fake_run(cmd, **kwargs):
            if "--result-path" in cmd:
                result_path = Path(cmd[cmd.index("--result-path") + 1])
                result_path.write_text(json.dumps({"work_dir": str(work), "video": "some.webm"}))
        with patch.object(flow, "GAME_DATA", captures), \
             patch.object(flow, "assess_video", return_value={"decision": "continue"}), \
             patch.object(flow.shutil, "which", return_value="docker"), \
             patch.object(flow.subprocess, "run", side_effect=fake_run) as run:
            self.assertEqual(flow.maybe_continue(None, video_id="AbCdEf01234", state=self.state, ledger=self.ledger), "captured_not_uploaded")
            self.assertEqual(run.call_count, 2)
            self.assertIn("gameplay_finalize.py", str(run.call_args_list[1]))
            self.assertEqual(flow.maybe_continue(None, video_id="AbCdEf01234", state=self.state, ledger=self.ledger), "already_attempted")

    def test_invalid_manifest_and_terminal_game_rejected(self):
        manifest = self.state.parent.parent / "source.json"
        manifest.write_text('{}')
        with self.assertRaises(ValueError): flow.validated_save(self.state)
        manifest.write_text(json.dumps({"commit": game.COMMIT, "archive_sha256": game.ARCHIVE_SHA256, "rights_confirmation": "operator-asserted"}))
        data = json.loads(self.state.read_text()); data["over"] = True
        self.state.write_text(json.dumps(data))
        with self.assertRaises(ValueError): flow.validated_save(self.state)


if __name__ == "__main__": unittest.main()
