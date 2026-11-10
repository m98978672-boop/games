#!/usr/bin/env python3
"""Генерирует dead-district/web/data_bundle.js напрямую из JSON-файлов /data/ и /data/real/.
Единый источник истины для Godot 4 и браузерной версии Dead District.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
OUT_FILE = ROOT / "web" / "data_bundle.js"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    real_data = {}
    for jf in sorted((DATA_DIR / "real").glob("*.json")):
        real_data[jf.stem] = load_json(jf)

    bundle = {
        "palette": load_json(DATA_DIR / "palette_survival_horror_32.json"),
        "real": real_data,
        "items": load_json(DATA_DIR / "items.json"),
        "recipes": load_json(DATA_DIR / "recipes.json"),
        "loot_tables": load_json(DATA_DIR / "loot_tables.json"),
        "buildings": load_json(DATA_DIR / "buildings.json"),
        "zombies": load_json(DATA_DIR / "zombies.json"),
        "npcs": load_json(DATA_DIR / "npcs.json"),
    }

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    header = "// Сгенерировано build_web_data.py из data/*.json и data/real/*.json — не редактировать вручную.\n"
    OUT_FILE.write_text(
        header + "window.DD_DATA = " + json.dumps(bundle, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    print(f"[build_web_data] Written {OUT_FILE} ({OUT_FILE.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
