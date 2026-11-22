import hashlib
import io
import os
import sys
import tarfile
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import gameplay_2048 as game


def archive_with(*, symlink=False, traversal=False):
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        for name, content in [(f"{game.PREFIX}/index.html", b"<html></html>"),
                              (f"{game.PREFIX}/js/game_manager.js", b"// game")]:
            member = tarfile.TarInfo(name)
            member.size = len(content)
            tar.addfile(member, io.BytesIO(content))
        if symlink:
            member = tarfile.TarInfo(f"{game.PREFIX}/js/escape.js")
            member.type = tarfile.SYMTYPE
            member.linkname = "/etc/passwd"
            tar.addfile(member)
        if traversal:
            member = tarfile.TarInfo(f"{game.PREFIX}/../escape.html")
            member.size = 1
            tar.addfile(member, io.BytesIO(b"x"))
    return buf.getvalue()


class Gameplay2048Tests(unittest.TestCase):
    def extract(self, data, target):
        with patch.object(game, "ARCHIVE_SHA256", hashlib.sha256(data).hexdigest()):
            return game.unpack_archive(data, target)

    def test_only_pinned_archive_is_unpacked(self):
        with tempfile.TemporaryDirectory() as temp:
            target = Path(temp) / "game"
            data = archive_with()
            self.assertEqual(self.extract(data, target), 2)
            self.assertEqual((target / "index.html").read_text(), "<html></html>")
            with self.assertRaisesRegex(ValueError, "SHA-256"):
                game.unpack_archive(b"untrusted", Path(temp) / "other")

    def test_symlinks_and_path_traversal_fail_closed(self):
        for kwargs in ({"symlink": True}, {"traversal": True}):
            with self.subTest(kwargs=kwargs), tempfile.TemporaryDirectory() as temp:
                with self.assertRaises(ValueError):
                    self.extract(archive_with(**kwargs), Path(temp) / "game")
                self.assertFalse((Path(temp) / "escape.html").exists())

    def test_container_command_has_no_network_secrets_or_workspace_mount(self):
        with tempfile.TemporaryDirectory() as temp:
            game_dir, out = Path(temp) / "game", Path(temp) / "out"
            game_dir.mkdir(); out.mkdir()
            cmd = game.docker_command(game_dir, out, 60, container_name="games-playthrough-" + "a" * 32)
            self.assertIn("--network", cmd)
            self.assertEqual(cmd[cmd.index("--network") + 1], "none")
            self.assertIn("--read-only", cmd)
            self.assertIn("no-new-privileges", cmd)
            self.assertEqual(sum(x.startswith("type=bind") for x in cmd), 2)
            self.assertNotIn("HOME", " ".join(cmd))
            with self.assertRaises(ValueError):
                game.docker_command(game_dir, out, 3601, container_name="games-playthrough-" + "a" * 32)
            with self.assertRaises(ValueError):
                game.docker_command(game_dir, game_dir, 60, container_name="games-playthrough-" + "a" * 32)


if __name__ == "__main__":
    unittest.main()
