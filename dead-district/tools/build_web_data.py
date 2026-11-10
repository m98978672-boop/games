#!/usr/bin/env python3
"""Генерирует dead-district/web/data_bundle.js напрямую из JSON-файлов /data/, /data/real/ и assets/assets_manifest.json.
Единый источник истины для Godot 4 и браузерной версии Dead District.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
MANIFEST_PATH = ROOT / "assets" / "assets_manifest.json"
OUT_FILE = ROOT / "web" / "data_bundle.js"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    real_data = {}
    for jf in sorted((DATA_DIR / "real").glob("*.json")):
        real_data[jf.stem] = load_json(jf)

    raw_manifest = load_json(MANIFEST_PATH)
    manifest_assets = [
        {
            "id": a.get("id", ""),
            "type": a.get("type", ""),
            "category": a.get("category", ""),
            "file": a.get("file", ""),
            "dimensions": a.get("dimensions", ""),
            "frames": a.get("frames", 1),
            "notes": a.get("notes", ""),
        }
        for a in raw_manifest.get("assets", [])
    ]

    bundle = {
        "palette": load_json(DATA_DIR / "palette_survival_horror_32.json"),
        "real": real_data,
        "items": load_json(DATA_DIR / "items.json"),
        "recipes": load_json(DATA_DIR / "recipes.json"),
        "loot_tables": load_json(DATA_DIR / "loot_tables.json"),
        "buildings": load_json(DATA_DIR / "buildings.json"),
        "zombies": load_json(DATA_DIR / "zombies.json"),
        "npcs": load_json(DATA_DIR / "npcs.json"),
        "manifest": manifest_assets,
    }

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    header = "// Сгенерировано build_web_data.py из data/*.json, data/real/*.json и assets_manifest.json.\n"
    OUT_FILE.write_text(
        header + "window.DD_DATA = " + json.dumps(bundle, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    print(f"[build_web_data] Written {OUT_FILE} ({OUT_FILE.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
