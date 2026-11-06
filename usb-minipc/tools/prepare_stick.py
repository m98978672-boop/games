#!/usr/bin/env python3
"""Подготовка флешки: копирует шаблон, считает sha256 и пишет манифест.

    python3 tools/prepare_stick.py /media/user/USB --name "Моя флешка"
    python3 tools/prepare_stick.py E:\\ --name "Рабочая флешка" --force

Что делает:
  1. копирует содержимое ``stick-template/`` в корень указанного тома;
  2. считает SHA-256 файла-лаунчера;
  3. записывает ``minipc/config.json`` с этим хэшем (привязка к конкретному
     файлу — подменённый лаунчер агент запускать откажется).
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import sys

TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                            "stick-template")
DEFAULT_LAUNCH = os.path.join("minipc", "launch.cmd")


def sha256_file(path: str) -> str:
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 256), b""):
            digest.update(chunk)
    return digest.hexdigest()


def prepare(target: str, name: str, launch: str, force: bool) -> int:
    target = os.path.abspath(target)
    if not os.path.isdir(target):
        print(f"ошибка: {target} — не каталог (флешка не вставлена?)", file=sys.stderr)
        return 2
    if not os.path.isdir(TEMPLATE_DIR):
        print(f"ошибка: шаблон не найден: {TEMPLATE_DIR}", file=sys.stderr)
        return 2

    manifest_dir = os.path.join(target, "minipc")
    if os.path.exists(manifest_dir) and not force:
        print(f"ошибка: {manifest_dir} уже существует — это не пустая флешка\n"
              f"       повтори с --force, если нужно перезаписать", file=sys.stderr)
        return 3

    shutil.copytree(TEMPLATE_DIR, target, dirs_exist_ok=True)

    launch_path = os.path.join(target, launch)
    if not os.path.isfile(launch_path):
        print(f"ошибка: лаунчер не найден после копирования: {launch_path}", file=sys.stderr)
        return 4

    manifest = {
        "name": name,
        "launch": launch.replace(os.sep, "/"),
        "sha256": sha256_file(launch_path),
        "autoLaunch": True,
        "args": [],
        "notes": "Создано tools/prepare_stick.py. Меняешь launch.cmd — пересчитай sha256.",
    }
    manifest_path = os.path.join(manifest_dir, "config.json")
    with open(manifest_path, "w", encoding="utf-8") as handle:
        json.dump(manifest, handle, ensure_ascii=False, indent=2)
        handle.write("\n")

    print(f"готово: {target}")
    print(f"  имя:      {name}")
    print(f"  лаунчер:  {manifest['launch']}")
    print(f"  sha256:   {manifest['sha256']}")
    print(f"  манифест: {manifest_path}")
    return 0


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Положить USB Mini-PC на флешку")
    parser.add_argument("target", help="корень флешки, например E:\\ или /media/user/USB")
    parser.add_argument("--name", default="USB Mini-PC", help="имя устройства в манифесте")
    parser.add_argument("--launch", default=DEFAULT_LAUNCH,
                        help="относительный путь к лаунчеру (по умолчанию minipc/launch.cmd)")
    parser.add_argument("--force", action="store_true", help="перезаписать существующий minipc/")
    args = parser.parse_args(argv)
    return prepare(args.target, args.name, args.launch, args.force)


if __name__ == "__main__":
    sys.exit(main())
