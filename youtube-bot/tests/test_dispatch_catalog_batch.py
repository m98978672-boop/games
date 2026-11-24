import json
import sys
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from dispatch_catalog_batch import build_command, load_manifest, validate_manifest


def sample_video(index: int, publish_at: str) -> dict:
    return {
        "video": f"boris/episode-{index}.mp4",
        "title": f"Episode {index}",
        "description": "Description",
        "tags": "борис, кот",
        "format": "short" if index % 2 else "long",
        "game_id": f"episode-{index}",
        "publish_at": publish_at,
    }


class DispatchCatalogBatchTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.now = datetime(2026, 11, 24, 12, 0, tzinfo=timezone.utc)

    def tearDown(self):
        self.temp.cleanup()

    def test_validate_manifest_accepts_unique_entries_and_limit(self):
        data = {
            "workflow": "youtube-shorts-autopilot.yml",
            "branch": "main",
            "made_for_kids": False,
            "category_id": "24",
            "videos": [sample_video(1, "2026-11-25 20:30"), sample_video(2, "2026-11-25 22:00")],
        }
        path = self.root / "manifest.json"
        path.write_text(json.dumps(data), encoding="utf-8")
        loaded = load_manifest(path)
        self.assertEqual(len(validate_manifest(loaded, limit=10, now=self.now)), 2)
        self.assertEqual(len(validate_manifest(loaded, limit=1, now=self.now)), 1)

    def test_validate_manifest_rejects_duplicates_and_past_times(self):
        data = {
            "made_for_kids": False,
            "videos": [
                sample_video(1, "2026-11-25 20:30"),
                sample_video(2, "2026-11-25 20:30"),
            ]
        }
        with self.assertRaises(ValueError):
            validate_manifest(data, limit=10, now=self.now)
        data = {"made_for_kids": False, "videos": [sample_video(1, "2026-11-24 12:10")]}
        with self.assertRaises(ValueError):
            validate_manifest(data, limit=10, now=self.now)

    def test_requires_explicit_audience_classification(self):
        for value in (None, "false", 0):
            with self.assertRaises(ValueError):
                validate_manifest({"made_for_kids": value, "videos": [sample_video(1, "2026-11-25 20:30")]}, limit=10, now=self.now)

    def test_build_command_contains_every_publisher_input(self):
        item = sample_video(1, "2026-11-25 20:30")
        command = build_command({"made_for_kids": False, "category_id": "24"}, item, "wf.yml", "main")
        text = " ".join(command)
        self.assertIn("gh workflow run wf.yml --ref main", text)
        self.assertIn("made_for_kids=false", text)
        self.assertIn("video_format=short", text)
        self.assertIn("catalog_video=boris/episode-1.mp4", text)
        self.assertIn("catalog_publish_at=2026-11-25 20:30", text)
        self.assertIn("catalog_game_id=episode-1", text)
        self.assertIn("catalog_category_id=24", text)


if __name__ == "__main__":
    unittest.main()
