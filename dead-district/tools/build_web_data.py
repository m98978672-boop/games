#!/usr/bin/env python3
"""Генерирует dead-district/web/data_bundle.js напрямую из JSON-файлов /data/, /data/real/ и assets/assets_manifest.json.
Единый источник истины для Godot 4 и браузерной версии Dead District.
"""

import json
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
MANIFEST_PATH = ROOT / "assets" / "assets_manifest.json"
OUT_FILE = ROOT / "web" / "data_bundle.js"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def read_generated_glb_parts(path: Path):
    """Извлекает боксы из наших GLB, не подменяя модель похожей заглушкой."""
    data = path.read_bytes()
    magic, version, total = struct.unpack_from("<III", data, 0)
    if magic != 0x46546C67 or version != 2 or total != len(data):
        raise ValueError(f"Invalid GLB: {path}")
    json_len, kind = struct.unpack_from("<II", data, 12)
    if kind != 0x4E4F534A:
        raise ValueError(f"Invalid GLB JSON chunk: {path}")
    doc = json.loads(data[20:20 + json_len])
    if doc.get("asset", {}).get("generator") != "DeadDistrictModelGen":
        return None  # Не угадываем геометрию сторонних GLB.
    bin_start = 20 + json_len + 8
    prim = doc["meshes"][0]["primitives"][0]
    def offset(attr):
        acc = doc["accessors"][prim["attributes"][attr]]
        view = doc["bufferViews"][acc["bufferView"]]
        return bin_start + view.get("byteOffset", 0) + acc.get("byteOffset", 0), acc["count"]
    p, count = offset("POSITION")
    uv, uv_count = offset("TEXCOORD_0")
    if count % 24 or uv_count != count:
        raise ValueError(f"Unexpected generated GLB layout: {path}")
    parts = []
    for start in range(0, count, 24):
        pts = [struct.unpack_from("<fff", data, p + (start + i) * 12) for i in range(24)]
        lo = [min(pt[i] for pt in pts) for i in range(3)]
        hi = [max(pt[i] for pt in pts) for i in range(3)]
        u, v = struct.unpack_from("<ff", data, uv + start * 8)
        parts.append({
            "cx": round((lo[0] + hi[0]) / 2, 5), "cy": round((lo[1] + hi[1]) / 2, 5), "cz": round((lo[2] + hi[2]) / 2, 5),
            "sx": round(hi[0] - lo[0], 5), "sy": round(hi[1] - lo[1], 5), "sz": round(hi[2] - lo[2], 5),
            "c": int(u * 8) + int(v * 4) * 8,
        })
    return parts


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
        "glbPreviewParts": {a["id"]: read_generated_glb_parts(ROOT / a["file"]) for a in manifest_assets if a["type"] == "3D_glb"},
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
