#!/usr/bin/env python3
"""«Карман» (KARMAN): проверка подготовленного накопителя без запуска Linux.

    python3 tools/verify_ssd.py /media/user/SSD
    python3 tools/verify_ssd.py E:\\ --json

Проверяет:
  * manifest.json читается и его версия поддерживается;
  * на месте ли кликабельный файл запуска и скрипты лаунчера;
  * совпадают ли размер и SHA-256 образа системы с манифестом;
  * есть ли каталог общих файлов и свободное место;
  * не остался ли session.lock от аварийной сессии.

Коды возврата: 0 — всё в порядке (возможны предупреждения), 1 — есть ошибки,
2 — накопителя или манифеста нет.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import sys

LAYOUT_VERSION = 1
REQUIRED = [
    "ЗАПУСТИТЬ-КАРМАН.cmd",
    "ЗАПУСТИТЬ-КАРМАН.sh",
    "karman/launcher/karman-launcher.ps1",
]


def sha256_file(path: str) -> str:
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def check(target: str) -> dict:
    target = os.path.abspath(target)
    errors: list[str] = []
    warnings: list[str] = []
    info: dict[str, object] = {"target": target}

    if not os.path.isdir(target):
        return {"ok": False, "errors": [f"каталог не найден: {target}"], "warnings": [], "info": info}

    manifest_path = os.path.join(target, "karman", "manifest.json")
    info["manifest"] = manifest_path
    if not os.path.isfile(manifest_path):
        return {"ok": False, "errors": [f"нет манифеста: {manifest_path} — накопитель не подготовлен"],
                "warnings": [], "info": info}

    try:
        with open(manifest_path, encoding="utf-8-sig") as handle:
            manifest = json.load(handle)
    except (OSError, ValueError) as exc:
        return {"ok": False, "errors": [f"manifest.json не читается: {exc}"], "warnings": [], "info": info}

    layout = manifest.get("layout")
    if layout != LAYOUT_VERSION:
        errors.append(f"версия раскладки {layout}, ожидается {LAYOUT_VERSION}")

    for relative in REQUIRED:
        if not os.path.isfile(os.path.join(target, relative)):
            errors.append(f"нет файла запуска: {relative}")

    system = manifest.get("system") or {}
    base_rel = system.get("base") or "karman/system/base.qcow2"
    base_path = os.path.join(target, base_rel)
    info["base"] = base_path
    verify = manifest.get("verify", "sha256")

    if not os.path.isfile(base_path):
        errors.append(f"нет образа системы: {base_rel}")
    else:
        size = os.path.getsize(base_path)
        info["base_size"] = size
        expected_size = int(system.get("size") or 0)
        expected_hash = (system.get("sha256") or "").strip().lower()

        if verify != "none" and expected_size and size != expected_size:
            errors.append(f"размер образа {size} байт не совпадает с манифестом ({expected_size})")
        if verify == "sha256" and expected_hash:
            actual = sha256_file(base_path)
            info["base_sha256"] = actual
            if actual != expected_hash:
                errors.append(f"sha256 образа не совпадает (получен {actual[:16]}…) — образ изменён")
        elif verify == "sha256" and not expected_hash:
            warnings.append("в манифесте нет sha256 образа — целостность не проверяется")

    data_rel = (manifest.get("data") or {}).get("dir", "data")
    if not os.path.isdir(os.path.join(target, data_rel)):
        warnings.append(f"нет каталога общих файлов: {data_rel}")

    min_free_gb = float((manifest.get("checkpoints") or {}).get("min_free_gb", 8))
    try:
        free_gb = shutil.disk_usage(target).free / (1024 ** 3)
        info["free_gb"] = round(free_gb, 2)
        if free_gb < min_free_gb:
            errors.append(f"свободно {free_gb:.1f} ГБ, нужно минимум {min_free_gb:g} ГБ")
    except OSError as exc:
        warnings.append(f"не удалось узнать свободное место: {exc}")

    overlay = os.path.join(target, (manifest.get("state") or {}).get("overlay", "karman/state/overlay.qcow2"))
    if not os.path.isfile(overlay):
        warnings.append("оверлея нет — будет создан при первом запуске")

    lock = os.path.join(target, "karman", "state", "session.lock")
    if os.path.isfile(lock):
        warnings.append("есть session.lock: прошлая сессия завершилась нештатно, "
                        "последние изменения могли потеряться")

    if (manifest.get("security") or {}).get("encryption", "none") == "none":
        warnings.append("шифрования нет: любой, кто подключит накопитель, прочитает его содержимое")

    return {"ok": not errors, "errors": errors, "warnings": warnings, "info": info}


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Проверить подготовленный накопитель KARMAN")
    parser.add_argument("target", help="корень накопителя")
    parser.add_argument("--json", action="store_true", help="вывести отчёт в JSON")
    args = parser.parse_args(argv)

    report = check(args.target)
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return 0 if report["ok"] else 1

    print(f"накопитель: {report['info'].get('target')}")
    for error in report["errors"]:
        print(f"  [ОШИБКА] {error}")
    for warning in report["warnings"]:
        print(f"  [ВНИМАНИЕ] {warning}")
    if report["ok"]:
        print("  [ОК] накопитель готов к запуску")
        return 0
    print("  запуск невозможен: устрани ошибки выше")
    return 1


if __name__ == "__main__":
    sys.exit(main())
