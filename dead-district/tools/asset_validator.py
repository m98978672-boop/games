#!/usr/bin/env python3
"""
AssetBot — валидатор ассетов (категории A–K) для DEAD DISTRICT.
Проверяет: существование файла, формат, размеры, альфа-канал (без полупрозрачного AA на спрайтах),
строгое соблюдение 32-цветной палитры Survival Horror 32, полигонаж и UV в .glb, naming convention и лицензии.
"""

import json
import os
import re
import struct
import sys
import zlib

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MANIFEST_PATH = os.path.join(ROOT, "assets", "assets_manifest.json")
PALETTE_PATH = os.path.join(ROOT, "data", "palette_survival_horror_32.json")
CREDITS_PATH = os.path.join(ROOT, "docs", "CREDITS.md")
REPORT_PATH = os.path.join(ROOT, "asset_report.json")

ALLOWED_LICENSES = {"custom", "CC0", "CC-BY", "CC-BY-SA", "MIT", "OFL"}
NAME_RE = re.compile(r"^[a-z0-9_./-]+$")


def load_palette_rgb():
    with open(PALETTE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    cols = set()
    for h in data["colors"]:
        s = h.lstrip("#").lower()
        cols.add((int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16)))
    return cols


def parse_png(path: str):
    """Читает IHDR и IDAT из RGBA/RGB PNG на чистом Python (без PIL)."""
    with open(path, "rb") as f:
        data = f.read()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("Неверная PNG сигнатура")
    pos = 8
    w = h = bit_depth = color_type = None
    idat = bytearray()
    while pos < len(data):
        length = struct.unpack(">I", data[pos:pos + 4])[0]
        ctype = data[pos + 4:pos + 8]
        payload = data[pos + 8:pos + 8 + length]
        pos += 12 + length
        if ctype == b"IHDR":
            w, h, bit_depth, color_type, _, _, _ = struct.unpack(">IIBBBBB", payload)
        elif ctype == b"IDAT":
            idat.extend(payload)
        elif ctype == b"IEND":
            break
    if w is None or color_type not in (2, 6) or bit_depth != 8:
        raise ValueError(f"Неподдерживаемый PNG формат (color={color_type}, depth={bit_depth})")

    bpp = 4 if color_type == 6 else 3
    raw = zlib.decompress(bytes(idat))
    stride = w * bpp
    recon = bytearray(h * stride)
    in_pos = 0
    for y in range(h):
        ftype = raw[in_pos]
        in_pos += 1
        row_out = y * stride
        for x in range(stride):
            val = raw[in_pos]
            in_pos += 1
            a = recon[row_out + x - bpp] if x >= bpp else 0
            b = recon[row_out - stride + x] if y > 0 else 0
            c = recon[row_out - stride + x - bpp] if (y > 0 and x >= bpp) else 0
            if ftype == 0:
                p = val
            elif ftype == 1:
                p = (val + a) & 0xFF
            elif ftype == 2:
                p = (val + b) & 0xFF
            elif ftype == 3:
                p = (val + ((a + b) // 2)) & 0xFF
            elif ftype == 4:
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                pr = a if pa <= pb and pa <= pc else (b if pb <= pc else c)
                p = (val + pr) & 0xFF
            else:
                raise ValueError(f"Неизвестный PNG фильтр {ftype}")
            recon[row_out + x] = p
    return w, h, color_type, recon


def validate_glb(path: str, max_tris: int = 500):
    with open(path, "rb") as f:
        data = f.read()
    if len(data) < 20:
        raise ValueError("Слишком маленький GLB файл")
    magic, version, total_len = struct.unpack("<III", data[:12])
    if magic != 0x46546C67 or version != 2:
        raise ValueError("Неверная шапка glTF 2.0 (.glb)")
    c_len, c_type = struct.unpack("<II", data[12:20])
    if c_type != 0x4E4F534A:
        raise ValueError("Отсутствует JSON chunk в GLB")
    gltf = json.loads(data[20:20 + c_len].decode("utf-8"))
    meshes = gltf.get("meshes", [])
    if not meshes:
        raise ValueError("GLB не содержит мешей")
    total_tris = 0
    has_uv = False
    for m in meshes:
        for prim in m.get("primitives", []):
            attrs = prim.get("attributes", {})
            if "POSITION" not in attrs:
                raise ValueError("В примитиве отсутствует POSITION")
            if "TEXCOORD_0" in attrs:
                has_uv = True
            idx_acc = prim.get("indices")
            if idx_acc is not None:
                cnt = gltf["accessors"][idx_acc]["count"]
                total_tris += cnt // 3
            else:
                cnt = gltf["accessors"][attrs["POSITION"]]["count"]
                total_tris += cnt // 3
    if not has_uv:
        raise ValueError("Отсутствует UV-развёртка TEXCOORD_0")
    if total_tris > max_tris:
        raise ValueError(f"Превышен лимит полигонов: {total_tris} > {max_tris}")
    return total_tris


def main():
    palette_rgb = load_palette_rgb()
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)
    with open(CREDITS_PATH, "r", encoding="utf-8") as f:
        credits_text = f.read()

    errors = []
    warnings = []
    checked = 0
    total_bytes = 0

    for asset in manifest["assets"]:
        checked += 1
        aid = asset["id"]
        rel_file = asset["file"]
        full_path = os.path.join(ROOT, rel_file)

        # Naming & license check
        if not NAME_RE.match(rel_file):
            errors.append({"code": "E108", "id": aid, "msg": f"Недопустимое имя файла: {rel_file}"})
        lic = asset.get("license", "")
        if lic not in ALLOWED_LICENSES:
            errors.append({"code": "E1001", "id": aid, "msg": f"Неразрешённая лицензия '{lic}'"})
        if lic in ("CC-BY", "CC-BY-SA", "OFL"):
            origin = asset.get("origin", "")
            slug = origin.rstrip("/").split("/")[-1] if origin else ""
            if slug and slug.lower() not in credits_text.lower() and origin not in credits_text:
                errors.append({"code": "E1002", "id": aid, "msg": f"Нет атрибуции {lic} в CREDITS.md для {origin}"})

        if not os.path.isfile(full_path):
            errors.append({"code": "E101", "id": aid, "msg": f"Файл ассета не найден: {rel_file}"})
            continue
        total_bytes += os.path.getsize(full_path)

        atype = asset["type"]
        if atype.startswith("2D_"):
            try:
                w, h, ctype, raw = parse_png(full_path)
                exp_w, exp_h = [int(x) for x in asset["dimensions"].split("x")]
                if (w, h) != (exp_w, exp_h):
                    errors.append({"code": "E102", "id": aid, "msg": f"Размер PNG {w}x{h} != ожидаемому {exp_w}x{exp_h}"})
                bpp = 4 if ctype == 6 else 3
                non_palette = set()
                semi_alpha = 0
                for i in range(0, len(raw), bpp):
                    r, g, b = raw[i], raw[i + 1], raw[i + 2]
                    a = raw[i + 3] if bpp == 4 else 255
                    if a not in (0, 255):
                        semi_alpha += 1
                    if a > 0 and (r, g, b) not in palette_rgb:
                        non_palette.add((r, g, b))
                if semi_alpha > 0:
                    errors.append({"code": "E103", "id": aid, "msg": f"Найдено {semi_alpha} полупрозрачных AA-пикселей"})
                if non_palette:
                    errors.append({"code": "E104", "id": aid, "msg": f"Найдено {len(non_palette)} цветов вне палитры Survival Horror 32"})
            except Exception as e:
                errors.append({"code": "E102", "id": aid, "msg": str(e)})
        elif atype == "3D_glb":
            try:
                validate_glb(full_path, max_tris=500)
            except Exception as e:
                errors.append({"code": "E105", "id": aid, "msg": str(e)})
        elif atype.startswith("audio_"):
            with open(full_path, "rb") as f:
                head = f.read(12)
            if head[:4] != b"RIFF" or head[8:12] != b"WAVE":
                errors.append({"code": "E106", "id": aid, "msg": "Невалидный WAV RIFF/WAVE заголовок"})
        elif atype == "font":
            with open(full_path, "rb") as f:
                head = f.read(4)
            if head not in (b"\x00\x01\x00\x00", b"OTTO"):
                errors.append({"code": "E106", "id": aid, "msg": "Невалидный TTF/OTF шрифт"})
        elif atype == "shader":
            with open(full_path, "r", encoding="utf-8") as f:
                txt = f.read()
            if "shader_type" not in txt:
                errors.append({"code": "E106", "id": aid, "msg": "Отсутствует shader_type в .gdshader"})

    report = {
        "bot": "AssetBot",
        "status": "PASS" if not errors else "FAIL",
        "checked_assets": checked,
        "disk_bytes": total_bytes,
        "errors_count": len(errors),
        "warnings_count": len(warnings),
        "errors": errors,
        "warnings": warnings,
    }
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"[AssetBot] Проверено={checked}, Ошибок={len(errors)}, Размер={total_bytes/1024:.1f} KB, Статус={report['status']}")
    for err in errors[:15]:
        print(f"  [{err['code']}] {err['id']}: {err['msg']}")
    sys.exit(0 if not errors else 1)


if __name__ == "__main__":
    main()
