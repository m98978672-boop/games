#!/usr/bin/env python3
"""«Карман» (KARMAN): подготовка внешнего SSD — раскладка + manifest.json.

    python3 tools/prepare_ssd.py /media/user/USBSSD --name "Карман"
    python3 tools/prepare_ssd.py E:\\ --memory 6144 --cpus 6
    python3 tools/prepare_ssd.py E:\\ --rehash       # пересчитать хэш после замены образа

Что делает:
  1. копирует ssd-template/ в корень накопителя (data/ при этом не затирается);
  2. считает размер и SHA-256 образа karman/system/base.qcow2, если он уже лежит;
  3. пишет karman/manifest.json — единственный источник правды для лаунчера.

Чего не делает: не форматирует диск, не трогает ничего вне указанного каталога,
не включает шифрование (его нет по требованию) и не настраивает автозапуск.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
PRODUCT_DIR = os.path.dirname(HERE)
TEMPLATE_DIR = os.path.join(PRODUCT_DIR, "ssd-template")
DEFAULT_BASE = os.path.join("karman", "system", "base.qcow2")
DEFAULT_ROOTFS = os.path.join("karman", "system", "rootfs.tar")
LAYOUT_VERSION = 1


def sha256_file(path: str) -> str:
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def human_gb(size: int) -> str:
    return f"{size / (1024 ** 3):.1f} ГБ"


def build_manifest(name: str, base_rel: str, image_path: str | None,
                   memory_mb: int, cpus: int, share_data: str,
                   verify: str, engine: str = "auto", rootfs_rel: str = DEFAULT_ROOTFS,
                   rootfs_path: str | None = None, distro: str = "Karman") -> dict:
    system: dict = {"base": base_rel.replace(os.sep, "/")}
    if image_path and os.path.isfile(image_path):
        size = os.path.getsize(image_path)
        system["size"] = size
        system["sha256"] = sha256_file(image_path) if verify == "sha256" else ""
        system["measured_at"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    else:
        system["size"] = 0
        system["sha256"] = ""

    system["rootfs"] = rootfs_rel.replace(os.sep, "/")
    if rootfs_path and os.path.isfile(rootfs_path):
        system["rootfs_size"] = os.path.getsize(rootfs_path)
        system["rootfs_sha256"] = sha256_file(rootfs_path) if verify == "sha256" else ""
    else:
        system["rootfs_size"] = 0
        system["rootfs_sha256"] = ""

    return {
        "layout": LAYOUT_VERSION,
        "product": "KARMAN",
        "name": name,
        "created": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "verify": verify,
        "engine": {
            "preferred": engine,
            "qemu": {
                "path": "karman/engine/qemu/qemu-system-x86_64.exe",
                "qemu_img": "karman/engine/qemu/qemu-img.exe",
                "linux": "karman/engine/qemu/qemu-system-x86_64",
                "qemu_img_linux": "karman/engine/qemu/qemu-img",
            },
            "wsl": {
                "distro": distro,
                "install_dir": "karman/wsl",
                "rootfs": rootfs_rel.replace(os.sep, "/"),
                "note": ("WSL2 требует Windows 10 2004+/11, включённую виртуализацию и разовую "
                         "установку компонента с правами администратора. Каталог дистрибутива "
                         "лучше держать на NTFS: exFAT для WSL не поддерживается."),
            },
        },
        "system": system,
        "state": {
            "overlay": "karman/state/overlay.qcow2",
        },
        "checkpoints": {
            "dir": "karman/checkpoints",
            "max": 5,
            "min_free_gb": 8,
        },
        "data": {
            "dir": "data",
            "note": "Общие файлы. В контрольные точки не входят. Шифрования нет.",
        },
        "vm": {
            "memory_mb": memory_mb,
            "cpus": cpus,
            "accel": "auto",
            "share_data": share_data,
        },
        "security": {
            "encryption": "none",
            "warning": "Пароля и шифрования нет: любой, кто подключит накопитель, прочитает всё содержимое.",
            "autostart": "disabled",
            "host_disk_access": "disabled",
        },
    }


def prepare(target: str, name: str, base_rel: str, memory_mb: int, cpus: int,
            share_data: str, verify: str, force: bool, rehash: bool,
            engine: str = "auto", rootfs_rel: str = DEFAULT_ROOTFS,
            distro: str = "Karman") -> int:
    target = os.path.abspath(target)
    if not os.path.isdir(target):
        print(f"ошибка: {target} — не каталог (накопитель подключён?)", file=sys.stderr)
        return 2
    if not os.path.isdir(TEMPLATE_DIR):
        print(f"ошибка: шаблон не найден: {TEMPLATE_DIR}", file=sys.stderr)
        return 2
    if verify not in ("sha256", "size", "none"):
        print(f"ошибка: --verify {verify}: допустимо sha256, size, none", file=sys.stderr)
        return 2
    if share_data not in ("ro", "rw", "none"):
        print(f"ошибка: --share-data {share_data}: допустимо ro, rw, none", file=sys.stderr)
        return 2
    if engine not in ("auto", "qemu", "wsl"):
        print(f"ошибка: --engine {engine}: допустимо auto, qemu, wsl", file=sys.stderr)
        return 2
    if not distro.strip():
        print("ошибка: --distro не может быть пустым", file=sys.stderr)
        return 2

    karman_dir = os.path.join(target, "karman")
    manifest_path = os.path.join(karman_dir, "manifest.json")

    if os.path.exists(manifest_path) and not (force or rehash):
        print(f"ошибка: накопитель уже подготовлен ({manifest_path})\n"
              f"       --force перезапишет раскладку, --rehash пересчитает только хэш образа",
              file=sys.stderr)
        return 3

    if not rehash:
        shutil.copytree(TEMPLATE_DIR, target, dirs_exist_ok=True)
        for folder in ("data/public", "data/private"):
            os.makedirs(os.path.join(target, folder), exist_ok=True)
        print(f"раскладка скопирована: {target}")
    else:
        print(f"повторный расчёт без копирования шаблона: {target}")

    image_path = os.path.join(target, base_rel)
    rootfs_path = os.path.join(target, rootfs_rel)
    manifest = build_manifest(name=name, base_rel=base_rel, image_path=image_path,
                              memory_mb=memory_mb, cpus=cpus, share_data=share_data,
                              verify=verify, engine=engine, rootfs_rel=rootfs_rel,
                              rootfs_path=rootfs_path, distro=distro)
    os.makedirs(karman_dir, exist_ok=True)
    with open(manifest_path, "w", encoding="utf-8") as handle:
        json.dump(manifest, handle, ensure_ascii=False, indent=2)
        handle.write("\n")

    print(f"манифест: {manifest_path}")
    print(f"  имя:        {name}")
    print(f"  раскладка:  v{LAYOUT_VERSION}")
    print(f"  проверка:   {verify}")
    print(f"  движок:     {engine}")
    print(f"  память:     {memory_mb} МБ, CPU: {cpus}")
    print(f"  данные в VM: {share_data}")

    if manifest["system"]["size"]:
        print(f"  образ VM:   {base_rel} — {human_gb(manifest['system']['size'])}, "
              f"sha256 {(manifest['system']['sha256'] or '—')[:16]}…")
    else:
        print(f"  образ VM:   отсутствует — {base_rel} (нужен для QEMU-движка)")

    if manifest["system"]["rootfs_size"]:
        print(f"  rootfs WSL: {rootfs_rel} — {human_gb(manifest['system']['rootfs_size'])}, "
              f"sha256 {(manifest['system']['rootfs_sha256'] or '—')[:16]}…")
    else:
        print(f"  rootfs WSL: отсутствует — {rootfs_rel} (нужен для движка WSL2)")

    print("  для запуска нужен хотя бы один из двух: base.qcow2 или rootfs.tar")

    print()
    print("ВАЖНО: шифрования и пароля нет — любой, кто подключит накопитель,")
    print("       прочитает всё его содержимое. Не храни там секреты.")
    if engine == "wsl":
        print("WSL2: нужен Windows 10 2004+/11, виртуализация и разовая установка")
        print("      компонента WSL с правами администратора. Каталог дистрибутива — на NTFS.")
    if engine in ("auto", "qemu"):
        print("QEMU: положи портативную сборку в karman/engine/qemu/ (Windows)")
        print("      или поставь qemu-system-x86_64 (Linux). Прав администратора не нужно.")
    return 0


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        description="Разложить KARMAN на внешний SSD и записать manifest.json")
    parser.add_argument("target", help="корень накопителя, например E:\\ или /media/user/SSD")
    parser.add_argument("--name", default="Карман", help="имя накопителя")
    parser.add_argument("--base", default=DEFAULT_BASE,
                        help=f"путь к образу системы внутри накопителя (по умолчанию {DEFAULT_BASE})")
    parser.add_argument("--memory", type=int, default=4096, help="RAM для Linux, МБ (по умолчанию 4096)")
    parser.add_argument("--cpus", type=int, default=4, help="vCPU для Linux (по умолчанию 4)")
    parser.add_argument("--share-data", default="ro", choices=("ro", "rw", "none"),
                        help="как подключать data/ к Linux (по умолчанию только чтение)")
    parser.add_argument("--verify", default="sha256", choices=("sha256", "size", "none"),
                        help="способ проверки целостности образа")
    parser.add_argument("--force", action="store_true", help="перезаписать раскладку")
    parser.add_argument("--rehash", action="store_true",
                        help="не копировать шаблон, только пересчитать хэш образа")
    parser.add_argument("--engine", default="auto", choices=("auto", "qemu", "wsl"),
                        help="предпочитаемый движок: auto, qemu (портативный) или wsl (WSL2)")
    parser.add_argument("--rootfs", default=DEFAULT_ROOTFS,
                        help=f"путь к rootfs.tar внутри накопителя (по умолчанию {DEFAULT_ROOTFS})")
    parser.add_argument("--distro", default="Karman",
                        help="имя дистрибутива WSL2 (по умолчанию Karman)")
    args = parser.parse_args(argv)

    if args.memory < 1024:
        parser.error("--memory меньше 1024 МБ не имеет смысла")
    if args.cpus < 1:
        parser.error("--cpus должен быть >= 1")

    return prepare(args.target, args.name, args.base, args.memory, args.cpus,
                   args.share_data, args.verify, args.force, args.rehash,
                   engine=args.engine, rootfs_rel=args.rootfs, distro=args.distro)


if __name__ == "__main__":
    sys.exit(main())
