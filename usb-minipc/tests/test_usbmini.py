#!/usr/bin/env python3
"""Тесты логики агента и подготовки флешки. Запуск: python3 tests/test_usbmini.py"""

from __future__ import annotations

import importlib.util
import io
import json
import os
import shutil
import sys
import tempfile
import unittest
from contextlib import redirect_stderr, redirect_stdout

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
TOOLS = os.path.join(ROOT, "tools")


def load_module(name: str, path: str):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


usbmini = load_module("usbmini", os.path.join(TOOLS, "usbmini.py"))
prepare_stick = load_module("prepare_stick", os.path.join(TOOLS, "prepare_stick.py"))


def make_stick(root: str, manifest: dict, launch_body: str = "@echo off\n") -> str:
    os.makedirs(os.path.join(root, "minipc"), exist_ok=True)
    launch = os.path.join(root, "minipc", "launch.cmd")
    with open(launch, "w", encoding="utf-8") as handle:
        handle.write(launch_body)
    with open(os.path.join(root, "minipc", "config.json"), "w", encoding="utf-8") as handle:
        json.dump(manifest, handle, ensure_ascii=False)
    return launch


class ManifestTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.mkdtemp()
        self.stick = os.path.join(self.tmp, "STICK")
        os.makedirs(self.stick)

    def tearDown(self) -> None:
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_missing_manifest(self) -> None:
        self.assertIsNone(usbmini.load_manifest(self.stick))

    def test_valid_manifest(self) -> None:
        make_stick(self.stick, {"name": "Тест", "launch": "minipc/launch.cmd"})
        manifest = usbmini.load_manifest(self.stick)
        self.assertIsNotNone(manifest)
        self.assertEqual(manifest["name"], "Тест")
        self.assertTrue(manifest["autoLaunch"])
        self.assertEqual(manifest["args"], [])

    def test_manifest_without_launch_is_rejected(self) -> None:
        make_stick(self.stick, {"name": "Без лаунчера"})
        with redirect_stdout(io.StringIO()):
            self.assertIsNone(usbmini.load_manifest(self.stick))

    def test_broken_json_is_rejected(self) -> None:
        os.makedirs(os.path.join(self.stick, "minipc"))
        with open(os.path.join(self.stick, "minipc", "config.json"), "w", encoding="utf-8") as handle:
            handle.write("{ не json")
        with redirect_stdout(io.StringIO()):
            self.assertIsNone(usbmini.load_manifest(self.stick))

    def test_auto_launch_string_parsed(self) -> None:
        make_stick(self.stick, {"launch": "minipc/launch.cmd", "autoLaunch": "false"})
        self.assertFalse(usbmini.load_manifest(self.stick)["autoLaunch"])


class PathTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.mkdtemp()
        self.stick = os.path.join(self.tmp, "STICK")
        os.makedirs(self.stick)
        self.outside = os.path.join(self.tmp, "evil.cmd")
        with open(self.outside, "w", encoding="utf-8") as handle:
            handle.write("@echo off\n")

    def tearDown(self) -> None:
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_escape_rejected(self) -> None:
        with self.assertRaises(usbmini.LaunchError):
            usbmini.resolve_payload(self.stick, "../evil.cmd")

    def test_inside_accepted(self) -> None:
        make_stick(self.stick, {"launch": "minipc/launch.cmd"})
        resolved = usbmini.resolve_payload(self.stick, "minipc/launch.cmd")
        self.assertTrue(os.path.isfile(resolved))
        self.assertEqual(os.path.commonpath([os.path.realpath(self.stick), resolved]),
                         os.path.realpath(self.stick))

    def test_missing_payload(self) -> None:
        with self.assertRaises(usbmini.LaunchError):
            usbmini.resolve_payload(self.stick, "minipc/nope.cmd")


class LaunchTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.mkdtemp()
        self.stick = os.path.join(self.tmp, "STICK")
        os.makedirs(self.stick)
        self.volume = usbmini.Volume(self.stick, kind="dir")

    def tearDown(self) -> None:
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_sha_mismatch_refuses(self) -> None:
        make_stick(self.stick, {"name": "X", "launch": "minipc/launch.cmd", "sha256": "0" * 64})
        output = io.StringIO()
        with redirect_stdout(output):
            launched = usbmini.launch_from_volume(self.volume, dry_run=True)
        self.assertFalse(launched)
        self.assertIn("отказано", output.getvalue())

    def test_sha_match_dry_run(self) -> None:
        launch = make_stick(self.stick, {"name": "X", "launch": "minipc/launch.cmd"})
        digest = usbmini.sha256_file(launch)
        make_stick(self.stick, {"name": "X", "launch": "minipc/launch.cmd", "sha256": digest})
        output = io.StringIO()
        with redirect_stdout(output):
            self.assertTrue(usbmini.launch_from_volume(self.volume, dry_run=True))
        self.assertIn("DRY-RUN", output.getvalue())

    def test_auto_launch_disabled(self) -> None:
        make_stick(self.stick, {"launch": "minipc/launch.cmd", "autoLaunch": False})
        with redirect_stdout(io.StringIO()):
            self.assertFalse(usbmini.launch_from_volume(self.volume, dry_run=True))

    def test_plain_usb_ignored(self) -> None:
        output = io.StringIO()
        with redirect_stdout(output):
            self.assertFalse(usbmini.launch_from_volume(self.volume, dry_run=False))
        self.assertIn("обычная флешка", output.getvalue())


class WatcherLoopTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.mkdtemp()
        self.base = os.path.join(self.tmp, "media")
        self.stick = os.path.join(self.base, "USB1")
        os.makedirs(self.stick)

    def tearDown(self) -> None:
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_once_with_trigger_existing(self) -> None:
        make_stick(self.stick, {"name": "Уже вставлена", "launch": "minipc/launch.cmd"})
        output = io.StringIO()
        with redirect_stdout(output):
            code = usbmini.run(self.base, 0.1, once=True, dry_run=True, trigger_existing=True)
        self.assertEqual(code, 0)
        self.assertIn("DRY-RUN", output.getvalue())

    def test_existing_volumes_are_skipped_by_default(self) -> None:
        make_stick(self.stick, {"name": "Уже вставлена", "launch": "minipc/launch.cmd"})
        output = io.StringIO()
        with redirect_stdout(output):
            usbmini.run(self.base, 0.1, once=True, dry_run=True, trigger_existing=False)
        self.assertNotIn("запустил бы", output.getvalue())

    def test_list_output(self) -> None:
        make_stick(self.stick, {"name": "Список", "launch": "minipc/launch.cmd"})
        output = io.StringIO()
        with redirect_stdout(output):
            usbmini.print_list(self.base)
        self.assertIn("Список", output.getvalue())


class PrepareStickTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.mkdtemp()
        self.target = os.path.join(self.tmp, "drive")
        os.makedirs(self.target)

    def tearDown(self) -> None:
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_prepare_writes_manifest_and_hash(self) -> None:
        with redirect_stdout(io.StringIO()):
            code = prepare_stick.prepare(self.target, "Флешка", "minipc/launch.cmd", False)
        self.assertEqual(code, 0)
        manifest_file = os.path.join(self.target, "minipc", "config.json")
        with open(manifest_file, encoding="utf-8") as handle:
            manifest = json.load(handle)
        self.assertEqual(manifest["name"], "Флешка")
        self.assertEqual(manifest["sha256"],
                         usbmini.sha256_file(os.path.join(self.target, "minipc", "launch.cmd")))
        self.assertTrue(os.path.isfile(os.path.join(self.target, "minipc", "apps", "boot-info.ps1")))
        self.assertTrue(os.path.isfile(os.path.join(self.target, "README.txt")))

        # агент должен принять подготовленную флешку
        output = io.StringIO()
        with redirect_stdout(output):
            launched = usbmini.launch_from_volume(usbmini.Volume(self.target), dry_run=True)
        self.assertTrue(launched, output.getvalue())

    def test_prepare_refuses_overwrite(self) -> None:
        with redirect_stdout(io.StringIO()):
            prepare_stick.prepare(self.target, "A", "minipc/launch.cmd", False)
        with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
            self.assertNotEqual(prepare_stick.prepare(self.target, "B", "minipc/launch.cmd", False), 0)

    def test_prepare_refuses_missing_dir(self) -> None:
        with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
            self.assertNotEqual(prepare_stick.prepare(os.path.join(self.tmp, "nope"), "A",
                                                      "minipc/launch.cmd", False), 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
