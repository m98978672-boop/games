#!/usr/bin/env python3
"""Тесты инструментов KARMAN: раскладка накопителя и проверка целостности.

Запуск: python3 tests/test_prepare_ssd.py
"""

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
PRODUCT = os.path.dirname(HERE)
TOOLS = os.path.join(PRODUCT, "tools")


def load_module(name: str, path: str):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


prepare_ssd = load_module("prepare_ssd", os.path.join(TOOLS, "prepare_ssd.py"))
verify_ssd = load_module("verify_ssd", os.path.join(TOOLS, "verify_ssd.py"))


def quiet_prepare(*args, **kwargs):
    with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
        return prepare_ssd.prepare(*args, **kwargs)


class PrepareTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.mkdtemp()
        self.ssd = os.path.join(self.tmp, "SSD")
        os.makedirs(self.ssd)

    def tearDown(self) -> None:
        shutil.rmtree(self.tmp, ignore_errors=True)

    def put_image(self, size: int = 4096) -> str:
        path = os.path.join(self.ssd, "karman", "system", "base.qcow2")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as handle:
            handle.write(b"QFI\xfb" + os.urandom(size))
        return path

    def manifest(self) -> dict:
        with open(os.path.join(self.ssd, "karman", "manifest.json"), encoding="utf-8") as handle:
            return json.load(handle)

    def test_layout_created(self) -> None:
        self.assertEqual(quiet_prepare(self.ssd, "Тест", "karman/system/base.qcow2",
                                       4096, 4, "ro", "sha256", False, False), 0)
        for relative in ("ЗАПУСТИТЬ-КАРМАН.cmd", "ЗАПУСТИТЬ-КАРМАН.sh",
                         "KARMAN-ЧИТАЙ-МЕНЯ.txt",
                         "karman/launcher/karman-launcher.ps1",
                         "karman/engine/README.txt",
                         "karman/system/README.txt",
                         "karman/checkpoints/README.txt",
                         "data/public", "data/private"):
            self.assertTrue(os.path.exists(os.path.join(self.ssd, relative)), relative)

    def test_manifest_contents(self) -> None:
        quiet_prepare(self.ssd, "Карман", "karman/system/base.qcow2", 6144, 6, "ro", "sha256", False, False)
        manifest = self.manifest()
        self.assertEqual(manifest["layout"], 1)
        self.assertEqual(manifest["product"], "KARMAN")
        self.assertEqual(manifest["name"], "Карман")
        self.assertEqual(manifest["vm"]["memory_mb"], 6144)
        self.assertEqual(manifest["vm"]["cpus"], 6)
        self.assertEqual(manifest["vm"]["share_data"], "ro")
        self.assertEqual(manifest["security"]["encryption"], "none")
        self.assertIn("прочитает", manifest["security"]["warning"])

    def test_image_hash_recorded(self) -> None:
        image = self.put_image()
        quiet_prepare(self.ssd, "Карман", "karman/system/base.qcow2", 4096, 4, "ro", "sha256", False, False)
        manifest = self.manifest()
        self.assertEqual(manifest["system"]["size"], os.path.getsize(image))
        self.assertEqual(manifest["system"]["sha256"], prepare_ssd.sha256_file(image))

    def test_no_image_means_empty_hash(self) -> None:
        quiet_prepare(self.ssd, "Карман", "karman/system/base.qcow2", 4096, 4, "ro", "sha256", False, False)
        self.assertEqual(self.manifest()["system"]["sha256"], "")
        self.assertEqual(self.manifest()["system"]["size"], 0)

    def test_second_run_refused_without_flags(self) -> None:
        quiet_prepare(self.ssd, "A", "karman/system/base.qcow2", 4096, 4, "ro", "sha256", False, False)
        self.assertEqual(quiet_prepare(self.ssd, "B", "karman/system/base.qcow2",
                                       4096, 4, "ro", "sha256", False, False), 3)

    def test_force_keeps_user_data(self) -> None:
        quiet_prepare(self.ssd, "A", "karman/system/base.qcow2", 4096, 4, "ro", "sha256", False, False)
        user_file = os.path.join(self.ssd, "data", "public", "отпуск.jpg")
        with open(user_file, "w", encoding="utf-8") as handle:
            handle.write("важное")
        quiet_prepare(self.ssd, "B", "karman/system/base.qcow2", 4096, 4, "ro", "sha256", True, False)
        self.assertTrue(os.path.isfile(user_file))
        self.assertEqual(self.manifest()["name"], "B")

    def test_rehash_updates_hash(self) -> None:
        quiet_prepare(self.ssd, "A", "karman/system/base.qcow2", 4096, 4, "ro", "sha256", False, False)
        image = self.put_image(8192)
        quiet_prepare(self.ssd, "A", "karman/system/base.qcow2", 4096, 4, "ro", "sha256", False, True)
        manifest = self.manifest()
        self.assertEqual(manifest["system"]["size"], os.path.getsize(image))
        self.assertEqual(manifest["system"]["sha256"], prepare_ssd.sha256_file(image))

    def test_bad_target(self) -> None:
        self.assertEqual(quiet_prepare(os.path.join(self.tmp, "нет"), "A", "karman/system/base.qcow2",
                                       4096, 4, "ro", "sha256", False, False), 2)


class VerifyTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.mkdtemp()
        self.ssd = os.path.join(self.tmp, "SSD")
        os.makedirs(self.ssd)
        self.image = os.path.join(self.ssd, "karman", "system", "base.qcow2")
        os.makedirs(os.path.dirname(self.image), exist_ok=True)
        with open(self.image, "wb") as handle:
            handle.write(b"QFI\xfb" + os.urandom(4096))

    def tearDown(self) -> None:
        shutil.rmtree(self.tmp, ignore_errors=True)

    def prepare(self, verify: str = "sha256") -> None:
        quiet_prepare(self.ssd, "Карман", "karman/system/base.qcow2", 4096, 4, "ro", verify, False, False)

    def test_ok(self) -> None:
        self.prepare()
        report = verify_ssd.check(self.ssd)
        self.assertTrue(report["ok"], report)
        self.assertTrue(any("шифрования нет" in warning for warning in report["warnings"]))

    def test_missing_manifest(self) -> None:
        report = verify_ssd.check(self.ssd)
        self.assertFalse(report["ok"])
        self.assertTrue(any("манифест" in error for error in report["errors"]))

    def test_tampered_image_detected(self) -> None:
        self.prepare()
        with open(self.image, "r+b") as handle:
            handle.seek(100)
            handle.write(b"X")
        report = verify_ssd.check(self.ssd)
        self.assertFalse(report["ok"])
        self.assertTrue(any("sha256" in error for error in report["errors"]), report["errors"])

    def test_missing_image_detected(self) -> None:
        self.prepare()
        os.remove(self.image)
        report = verify_ssd.check(self.ssd)
        self.assertFalse(report["ok"])
        self.assertTrue(any("нет образа" in error for error in report["errors"]))

    def test_size_only_mode_ignores_hash(self) -> None:
        self.prepare(verify="size")
        with open(self.image, "r+b") as handle:
            handle.seek(100)
            handle.write(b"X")
        report = verify_ssd.check(self.ssd)
        self.assertTrue(report["ok"], report["errors"])

    def test_dirty_lock_is_warning(self) -> None:
        self.prepare()
        lock = os.path.join(self.ssd, "karman", "state", "session.lock")
        os.makedirs(os.path.dirname(lock), exist_ok=True)
        with open(lock, "w", encoding="utf-8") as handle:
            handle.write("{}")
        report = verify_ssd.check(self.ssd)
        self.assertTrue(report["ok"])
        self.assertTrue(any("session.lock" in warning for warning in report["warnings"]))

    def test_missing_launcher_file_detected(self) -> None:
        self.prepare()
        os.remove(os.path.join(self.ssd, "ЗАПУСТИТЬ-КАРМАН.cmd"))
        report = verify_ssd.check(self.ssd)
        self.assertFalse(report["ok"])
        self.assertTrue(any("файла запуска" in error for error in report["errors"]))


if __name__ == "__main__":
    unittest.main(verbosity=2)
