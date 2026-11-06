#!/usr/bin/env python3
"""USB Mini-PC — сторож съёмных дисков (вариант 1 из README).

Ждёт появления новой флешки, ищет на ней ``minipc/config.json`` и, если
манифест валиден, запускает указанный в нём лаунчер. Работает на Windows,
Linux и macOS, зависимостей нет — только стандартная библиотека Python 3.8+.

Запуск:
    python3 usbmini.py                 # следить за флешками
    python3 usbmini.py --once          # один проход и выход
    python3 usbmini.py --dry-run       # ничего не запускать, только логи
    python3 usbmini.py --list          # что вообще видно сейчас
    python3 usbmini.py --dir /tmp/usb  # следить за подпапками каталога (для тестов)
    python3 usbmini.py --trigger-existing   # обработать и те флешки, что уже вставлены

Ключи безопасности (почему это не «автозапуск из интернета»):
  * запускается только то, что лежит внутри корня самой флешки (никаких ..\..\);
  * если в манифесте указан sha256, хэш лаунчера сверяется — подменённый файл
    не запустится;
  * без ``"autoLaunch": true`` в манифесте агент только пишет в лог.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import platform
import subprocess
import sys
import time
from typing import Dict, List, Optional

VERSION = "1.0.0"
MANIFEST_DIR = "minipc"
MANIFEST_NAME = "config.json"
MAX_MANIFEST_BYTES = 64 * 1024
LAUNCH_ATTEMPTS = 6
LAUNCH_RETRY_DELAY = 0.4


# --------------------------------------------------------------------------- #
# логирование
# --------------------------------------------------------------------------- #
def log(message: str, level: str = "INFO") -> None:
    stamp = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"{stamp} {level:<5} {message}", flush=True)


class LaunchError(RuntimeError):
    """Манифест есть, но запускать нельзя."""


# --------------------------------------------------------------------------- #
# поиск съёмных дисков
# --------------------------------------------------------------------------- #
class Volume:
    __slots__ = ("root", "kind")

    def __init__(self, root: str, kind: str = "removable") -> None:
        self.root = root
        self.kind = kind

    @property
    def label(self) -> str:
        drive = os.path.splitdrive(self.root)[0]
        return drive or self.root

    def __eq__(self, other: object) -> bool:
        return isinstance(other, Volume) and norm(self.root) == norm(other.root)

    def __hash__(self) -> int:
        return hash(norm(self.root))

    def __repr__(self) -> str:  # pragma: no cover - отладка
        return f"Volume({self.root!r}, {self.kind!r})"


def norm(path: str) -> str:
    """Нормализуем путь для сравнения (регистр важен только на Windows)."""
    return os.path.normcase(os.path.abspath(path))


def _windows_volumes() -> List[Volume]:
    import ctypes

    kernel32 = ctypes.windll.kernel32
    buffer = ctypes.create_unicode_buffer(1024)
    length = kernel32.GetLogicalDriveStringsW(len(buffer), buffer)
    roots = [part for part in buffer[:length].split("\x00") if part.strip()]
    result = []
    for root in roots:
        # DRIVE_REMOVABLE == 2 (флешки, картридеры, внешние USB-диски в режиме съёмных)
        if kernel32.GetDriveTypeW(ctypes.c_wchar_p(root)) == 2:
            result.append(Volume(root))
    return result


def _linux_volumes() -> List[Volume]:
    prefixes = ("/media/", "/run/media/", "/mnt/", "/Volumes/")
    mounts = "/proc/mounts"
    if not os.path.exists(mounts):
        mounts = "/etc/mtab"
    result: List[Volume] = []
    seen = set()
    try:
        with open(mounts, "r", encoding="utf-8", errors="replace") as handle:
            for line in handle:
                parts = line.split()
                if len(parts) < 2:
                    continue
                mountpoint = parts[1].replace("\\040", " ").replace("\\011", "\t")
                if not mountpoint.startswith(prefixes):
                    continue
                if mountpoint.startswith("/media/"):
                    # отфильтровать служебный /media/ ровно
                    rest = mountpoint[len("/media/"):].strip("/")
                    if len(rest.split("/")) > 2:
                        continue
                if mountpoint in seen:
                    continue
                seen.add(mountpoint)
                result.append(Volume(mountpoint))
    except OSError as exc:  # pragma: no cover - экзотика
        log(f"не удалось прочитать {mounts}: {exc}", "WARN")
    return result


def _macos_volumes() -> List[Volume]:
    result = []
    if os.path.isdir("/Volumes"):
        for name in sorted(os.listdir("/Volumes")):
            path = os.path.join("/Volumes", name)
            if os.path.ismount(path):
                result.append(Volume(path))
    return result


def _dir_volumes(base: str) -> List[Volume]:
    """Тестовый/сервисный режим: каждая подпапка = «флешка»."""
    result = []
    if not os.path.isdir(base):
        log(f"каталог {base} не существует", "ERROR")
        return result
    for name in sorted(os.listdir(base)):
        path = os.path.join(base, name)
        if os.path.isdir(path):
            result.append(Volume(path, kind="dir"))
    return result


def detect_volumes(base_dir: Optional[str] = None) -> List[Volume]:
    if base_dir:
        return _dir_volumes(base_dir)
    system = platform.system()
    try:
        if system == "Windows":
            return _windows_volumes()
        if system == "Darwin":
            return _macos_volumes()
        return _linux_volumes()
    except Exception as exc:  # pragma: no cover - зависит от ОС
        log(f"ошибка определения дисков: {exc}", "ERROR")
        return []


# --------------------------------------------------------------------------- #
# манифест
# --------------------------------------------------------------------------- #
def manifest_path(root: str) -> str:
    return os.path.join(root, MANIFEST_DIR, MANIFEST_NAME)


def _as_bool(value: object, default: bool) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in ("1", "true", "yes", "on", "да")
    if isinstance(value, (int, float)):
        return bool(value)
    return default


def load_manifest(root: str) -> Optional[Dict[str, object]]:
    """Читает и валидирует minipc/config.json. None — если манифеста нет."""
    path = manifest_path(root)
    if not os.path.isfile(path):
        return None
    try:
        if os.path.getsize(path) > MAX_MANIFEST_BYTES:
            raise LaunchError("config.json подозрительно большой")
        with open(path, "r", encoding="utf-8-sig") as handle:
            raw = json.load(handle)
    except (OSError, ValueError, LaunchError) as exc:
        log(f"{root}: config.json не прочитан ({exc})", "WARN")
        return None
    if not isinstance(raw, dict):
        log(f"{root}: config.json должен быть объектом JSON", "WARN")
        return None
    launch = raw.get("launch")
    if not isinstance(launch, str) or not launch.strip():
        log(f"{root}: в config.json нет поля launch", "WARN")
        return None
    args = raw.get("args", [])
    if not isinstance(args, list) or any(not isinstance(item, str) for item in args):
        args = []
    sha = raw.get("sha256")
    if sha is not None and not isinstance(sha, str):
        sha = None
    return {
        "name": str(raw.get("name") or os.path.basename(root.rstrip("\\/")) or "USB"),
        "launch": launch.strip().replace("\\", os.sep),
        "args": args,
        "autoLaunch": _as_bool(raw.get("autoLaunch"), True),
        "sha256": (sha or "").strip().lower() or None,
        "notes": str(raw.get("notes") or ""),
    }


def resolve_payload(root: str, relative: str) -> str:
    """Путь к лаунчеру, гарантированно внутри корня флешки."""
    root_abs = os.path.realpath(os.path.abspath(root))
    target = os.path.realpath(os.path.join(root_abs, relative))
    if os.path.commonpath([norm(root_abs), norm(target)]) != norm(root_abs):
        raise LaunchError(f"путь «{relative}» выходит за пределы флешки")
    if not os.path.exists(target):
        raise LaunchError(f"лаунчер не найден: {relative}")
    return target


def sha256_file(path: str) -> str:
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 256), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build_command(payload: str, args: List[str]) -> List[str]:
    """Чем и как запускать файл с флешки."""
    lower = payload.lower()
    if lower.endswith((".cmd", ".bat")):
        return ["cmd.exe", "/c", payload, *args] if platform.system() == "Windows" \
            else ["/bin/sh", payload, *args]
    if lower.endswith(".ps1"):
        return ["powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass",
                "-File", payload, *args]
    if lower.endswith(".py"):
        return [sys.executable, payload, *args]
    if lower.endswith(".sh"):
        return ["/bin/sh", payload, *args]
    return [payload, *args]


# --------------------------------------------------------------------------- #
# запуск
# --------------------------------------------------------------------------- #
def launch_from_volume(volume: Volume, dry_run: bool = False) -> bool:
    try:
        manifest = load_manifest(volume.root)
        if manifest is None:
            log(f"{volume.label}: манифеста нет — это обычная флешка, ничего не делаю")
            return False
        if not manifest["autoLaunch"]:
            log(f"{volume.label}: «{manifest['name']}» — autoLaunch отключён, только лог")
            return False

        payload = resolve_payload(volume.root, str(manifest["launch"]))
        actual = sha256_file(payload)
        expected = manifest["sha256"]
        if expected and actual != expected:
            raise LaunchError(
                "хэш лаунчера не совпадает с манифестом "
                f"(ожидался {expected[:12]}…, получен {actual[:12]}…)"
            )
        if not expected:
            log(f"{volume.label}: sha256 в манифесте не задан, "
                f"текущий хэш лаунчера {actual}", "WARN")

        command = build_command(payload, list(manifest["args"]))
        env = os.environ.copy()
        env.update({
            "MINIPC_ROOT": os.path.abspath(volume.root),
            "MINIPC_DRIVE": os.path.splitdrive(os.path.abspath(volume.root))[0] or volume.root,
            "MINIPC_NAME": str(manifest["name"]),
            "MINIPC_LAUNCH": payload,
            "MINIPC_AGENT": f"usbmini/{VERSION}",
        })
        if dry_run:
            log(f"{volume.label}: DRY-RUN, запустил бы: {' '.join(command)}")
            return True

        kwargs: Dict[str, object] = {"cwd": os.path.dirname(payload), "env": env}
        if platform.system() == "Windows":
            kwargs["creationflags"] = getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0)
        else:
            kwargs["start_new_session"] = True
        subprocess.Popen(command, **kwargs)  # noqa: S603 - запуск выбран владельцем ПК
        log(f"{volume.label}: запущено «{manifest['name']}» → {os.path.basename(payload)}")
        return True
    except LaunchError as exc:
        log(f"{volume.label}: отказано — {exc}", "ERROR")
    except OSError as exc:
        log(f"{volume.label}: не удалось запустить ({exc})", "ERROR")
    return False


def wait_for_manifest(volume: Volume) -> Optional[Dict[str, object]]:
    """Флешка может появиться в системе раньше, чем ФС будет готова."""
    for attempt in range(LAUNCH_ATTEMPTS):
        manifest = load_manifest(volume.root)
        if manifest is not None:
            return manifest
        if os.path.isdir(volume.root):
            return None
        time.sleep(LAUNCH_RETRY_DELAY * (attempt + 1))
    return None


# --------------------------------------------------------------------------- #
# основной цикл
# --------------------------------------------------------------------------- #
def run(base_dir: Optional[str], interval: float, once: bool,
        dry_run: bool, trigger_existing: bool) -> int:
    log(f"USB Mini-PC agent {VERSION} — интервал {interval:g} c, ОС: {platform.system()}")
    if dry_run:
        log("режим DRY-RUN: лаунчеры не запускаются", "WARN")

    seen = set()
    current = detect_volumes(base_dir)
    if not trigger_existing:
        seen = {vol.root for vol in current}
        log(f"уже вставлено: {len(seen)} — жду новые")

    while True:
        current = detect_volumes(base_dir)
        roots = {vol.root for vol in current}
        for volume in current:
            if volume.root in seen:
                continue
            seen.add(volume.root)
            log(f"новый том: {volume.root}")
            if wait_for_manifest(volume) is None:
                log(f"{volume.label}: minipc/config.json не найден — пропуск")
                continue
            launch_from_volume(volume, dry_run=dry_run)
        seen &= roots
        if once:
            return 0
        try:
            time.sleep(interval)
        except KeyboardInterrupt:
            log("остановлено пользователем")
            return 0


def print_list(base_dir: Optional[str]) -> int:
    volumes = detect_volumes(base_dir)
    if not volumes:
        print("съёмных дисков не найдено")
        return 0
    for volume in volumes:
        manifest = load_manifest(volume.root)
        if manifest is None:
            print(f"{volume.root:<24} — нет minipc/config.json")
        else:
            print(f"{volume.root:<24} — «{manifest['name']}» → {manifest['launch']}"
                  f" (autoLaunch={manifest['autoLaunch']})")
    return 0


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        prog="usbmini",
        description="USB Mini-PC: запуск лаунчера с флешки при её подключении",
    )
    parser.add_argument("--interval", type=float, default=2.0,
                        help="период опроса в секундах (по умолчанию 2)")
    parser.add_argument("--once", action="store_true", help="один проход и выход")
    parser.add_argument("--dry-run", action="store_true", help="только показать, что было бы запущено")
    parser.add_argument("--list", action="store_true", help="показать съёмные диски и манифесты")
    parser.add_argument("--dir", default=None,
                        help="следить за подпапками каталога (тестовый режим)")
    parser.add_argument("--trigger-existing", action="store_true",
                        help="обработать флешки, которые уже вставлены")
    parser.add_argument("--version", action="version", version=f"usbmini {VERSION}")
    args = parser.parse_args(argv)

    if args.list:
        return print_list(args.dir)
    if args.interval <= 0:
        parser.error("--interval должен быть больше нуля")
    try:
        return run(args.dir, args.interval, args.once, args.dry_run, args.trigger_existing)
    except KeyboardInterrupt:
        log("остановлено пользователем")
        return 0


if __name__ == "__main__":
    sys.exit(main())
