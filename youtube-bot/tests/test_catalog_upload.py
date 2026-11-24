import json
import sys
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from catalog_upload import build_metadata, parse_tags, slugify_game_id, write_result


class CatalogUploadTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.video = self.root / "episode.mp4"
        self.video.write_bytes(b"x" * 2048)
        self.now = datetime(2026, 11, 24, 12, 0, tzinfo=timezone.utc)

    def tearDown(self):
        self.temp.cleanup()

    def test_build_metadata_uses_moscow_wall_time_and_utc_publish(self):
        metadata = build_metadata(
            video=str(self.video), title="Борис · Эпизод 1 — Улица",
            description="Описание", tags="борис, кот, мультфильм, кот",
            category_id="24", publish_at="2026-11-25 20:30",
            game_id="Boris EP 01", video_format="long", root=self.root, now=self.now,
        )
        self.assertEqual(metadata["publish_at"], "2026-11-25T17:30:00Z")
        self.assertEqual(metadata["requested_publish_at"], metadata["publish_at"])
        self.assertEqual(metadata["game_id"], "boris-ep-01")
        self.assertEqual(metadata["tags"], ["борис", "кот", "мультфильм"])
        self.assertEqual(metadata["video_format"], "long")
        self.assertIsNone(metadata["made_for_kids"])
        self.assertEqual(metadata["video_path"], str(self.video))
        self.assertRegex(metadata["job_id"], r"^[0-9a-f-]{36}$")

    def test_short_format_and_default_game_id(self):
        metadata = build_metadata(
            video=str(self.video), title="Short", tags="shorts",
            category_id="24", publish_at="2026-11-25 20:30",
            game_id="", video_format="short", root=self.root, now=self.now,
        )
        self.assertEqual(metadata["game_id"], "catalog-video")
        self.assertEqual(metadata["video_format"], "short")

    def test_rejects_bad_inputs(self):
        common = dict(
            video=str(self.video), title="Title", tags="tag", category_id="24",
            publish_at="2026-11-25 20:30", game_id="x", video_format="long",
            root=self.root, now=self.now,
        )
        with self.assertRaises(ValueError):
            build_metadata(**{**common, "video_format": "wide"})
        with self.assertRaises(ValueError):
            build_metadata(**{**common, "title": ""})
        with self.assertRaises(ValueError):
            build_metadata(**{**common, "category_id": "films"})
        with self.assertRaises(ValueError):
            build_metadata(**{**common, "publish_at": "2026-11-24 12:10"})
        with self.assertRaises(ValueError):
            build_metadata(**{**common, "video": "missing.mp4"})
        with self.assertRaises(ValueError):
            build_metadata(**{**common, "tags": ",".join(f"t{i}" for i in range(31))})

    def test_tags_are_deduplicated_and_bounded(self):
        self.assertEqual(parse_tags("a, b, a, c"), ["a", "b", "c"])
        with self.assertRaises(ValueError):
            parse_tags(["x" * 101])

    def test_slugify_game_id(self):
        self.assertEqual(slugify_game_id("Boris · Ep 04!"), "boris-ep-04")
        self.assertEqual(slugify_game_id("---"), "catalog-video")
        self.assertLessEqual(len(slugify_game_id("x" * 100)), 60)

    def test_write_result_contains_metadata_and_safe_status(self):
        metadata = build_metadata(
            video=str(self.video), title="Title", tags="tag", category_id="24",
            publish_at="2026-11-25 20:30", game_id="demo", video_format="long",
            root=self.root, now=self.now,
        )
        output = self.root / "out" / "catalog.result.json"
        result = write_result(metadata, output)
        loaded = json.loads(output.read_text(encoding="utf-8"))
        self.assertEqual(loaded["metadata"]["video_path"], str(self.video))
        self.assertEqual(result["status"], "catalog_ready_for_upload")
        self.assertNotIn("access_token", json.dumps(loaded))


if __name__ == "__main__":
    unittest.main()
