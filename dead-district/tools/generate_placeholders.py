#!/usr/bin/env python3
"""
Генератор пиксель-арт плейсхолдеров (2D PNG, 3D GLB, WAV) в палитре Survival Horror 32.
Использует только стандартную библиотеку Python (без PIL), гарантирует 1px обводку и 0% сглаживания.
"""

import json
import math
import os
import struct
import wave
import zlib

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PALETTE_PATH = os.path.join(ROOT, "data", "palette_survival_horror_32.json")
MANIFEST_PATH = os.path.join(ROOT, "assets", "assets_manifest.json")


def hex_to_rgba(hex_str: str, alpha: int = 255):
    h = hex_str.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), alpha)


def load_palette():
    with open(PALETTE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return [hex_to_rgba(c) for c in data["colors"]]


def write_png(path: str, width: int, height: int, pixels):
    """Записывает честный 32-bit RGBA PNG (без сглаживания, без PIL)."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    raw_rows = bytearray()
    for y in range(height):
        raw_rows.append(0)  # filter type 0
        row = pixels[y]
        for r, g, b, a in row:
            raw_rows.extend((r, g, b, a))

    def chunk(tag: bytes, payload: bytes) -> bytes:
        crc = zlib.crc32(tag + payload) & 0xFFFFFFFF
        return struct.pack(">I", len(payload)) + tag + payload + struct.pack(">I", crc)

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    idat = zlib.compress(bytes(raw_rows), 9)
    png_bytes = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png_bytes)


def make_grid(w: int, h: int, fill=(0, 0, 0, 0)):
    return [[fill for _ in range(w)] for _ in range(h)]


def draw_outlined_cell(grid, ox, oy, cw, ch, fill_col, accent_col, dark_col, shape="box"):
    """Рисует пиктограмму/персонажа внутри ячейки с чёткой 1px тёмной обводкой."""
    pad = max(2, min(cw, ch) // 6)
    x0, y0 = ox + pad, oy + pad
    x1, y1 = ox + cw - pad - 1, oy + ch - pad - 1
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2

    def inside(x, y):
        if shape == "circle":
            rx = max(2, (x1 - x0) / 2.0)
            ry = max(2, (y1 - y0) / 2.0)
            return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1.0
        if shape == "diag":
            return abs((x - x0) - (y - y0)) <= max(2, min(cw, ch) // 6) and x0 <= x <= x1 and y0 <= y <= y1
        if shape == "human":
            in_head = ((x - cx) ** 2 + (y - (y0 + 3)) ** 2) <= max(4, (cw // 6) ** 2)
            in_body = abs(x - cx) <= max(2, cw // 5) and (y0 + 4) <= y <= (y1 - 2)
            return in_head or in_body
        return x0 <= x <= x1 and y0 <= y <= y1

    mask = [[False] * cw for _ in range(ch)]
    for dy in range(ch):
        for dx in range(cw):
            if inside(ox + dx, oy + dy):
                mask[dy][dx] = True

    for dy in range(ch):
        for dx in range(cw):
            px, py = ox + dx, oy + dy
            if mask[dy][dx]:
                is_accent = (dx + dy) % 5 == 0 or dy < pad + 3
                grid[py][px] = accent_col if is_accent else fill_col
            else:
                nbr = False
                for nx, ny in ((dx - 1, dy), (dx + 1, dy), (dx, dy - 1), (dx, dy + 1)):
                    if 0 <= nx < cw and 0 <= ny < ch and mask[ny][nx]:
                        nbr = True
                        break
                if nbr:
                    grid[py][px] = dark_col


def pick_colors_for_asset(asset, palette):
    aid = asset["id"]
    dark = palette[31]  # #000000
    if "zombie" in aid or "gore" in aid or "infected" in aid:
        return palette[11], palette[2], dark  # #679a73 & #71353f
    if "raider" in aid:
        return palette[2], palette[1], dark
    if "medic" in aid or "hospital" in aid or "bandage" in aid or "antibio" in aid or "suture" in aid:
        return palette[30], palette[1], dark
    if "cop" in aid or "police" in aid or "glock" in aid or "water" in aid:
        return palette[15], palette[16], dark
    if "grass" in aid or "cabbage" in aid or "crops" in aid or "farm" in aid:
        return palette[11], palette[10], dark
    if "wood" in aid or "plank" in aid or "crate" in aid or "bat" in aid or "bread" in aid:
        return palette[7], palette[6], dark
    if "gas" in aid or "apple" in aid or "tomato" in aid or "blood" in aid or "shotgun" in aid:
        return palette[1], palette[2], dark
    return palette[25], palette[26], dark


def generate_png_asset(asset, palette):
    path = os.path.join(ROOT, asset["file"])
    w_str, h_str = asset["dimensions"].split("x")
    w, h = int(w_str), int(h_str)

    aid = asset["id"]
    if aid == "K01_palette_lut":
        grid = [palette[:32]]
        write_png(path, 32, 1, grid)
        return

    if aid == "K04_bayer_dither":
        bayer = [
            [0, 8, 2, 10],
            [12, 4, 14, 6],
            [3, 11, 1, 9],
            [15, 7, 13, 5],
        ]
        grid = make_grid(4, 4, palette[31])
        for y in range(4):
            for x in range(4):
                # Маппим градации яркости в ближайший оттенок серого из палитры (#000000..#ffffff)
                v = bayer[y][x]
                if v < 3:
                    col = palette[31]
                elif v < 7:
                    col = palette[29]
                elif v < 11:
                    col = palette[27]
                elif v < 14:
                    col = palette[25]
                else:
                    col = palette[30]
                grid[y][x] = col
        write_png(path, 4, 4, grid)
        return

    if aid in ("K02_atlas_vehicles", "K03_atlas_furniture"):
        grid = make_grid(w, h, palette[28])
        # Сетка 4x8 цветных квадратов 16x16 из палитры Survival Horror 32
        for idx, col in enumerate(palette):
            bx = (idx % 8) * 16
            by = (idx // 8) * 32
            for dy in range(32):
                for dx in range(16):
                    if by + dy < h and bx + dx < w:
                        edge = dx == 0 or dy == 0 or dx == 15 or dy == 31
                        grid[by + dy][bx + dx] = palette[31] if edge else col
        write_png(path, w, h, grid)
        return

    fill_col, acc_col, dark_col = pick_colors_for_asset(asset, palette)

    if asset["type"] == "2D_tile":
        grid = make_grid(w, h, fill_col)
        frames = max(1, int(asset.get("frames", 1)))
        cols = max(1, w // 32)
        for idx in range(frames):
            cx = (idx % cols) * 32
            cy = (idx // cols) * 32
            if cy + 32 > h:
                continue
            for dy in range(32):
                for dx in range(32):
                    noise = ((dx * 7 + dy * 13 + idx * 19) % 11) == 0
                    border = ("wall" in aid or "door" in aid or "window" in aid) and (dx == 0 or dy == 0 or dx == 31 or dy == 31)
                    if border:
                        grid[cy + dy][cx + dx] = dark_col
                    elif noise:
                        grid[cy + dy][cx + dx] = acc_col
        write_png(path, w, h, grid)
        return

    grid = make_grid(w, h, (0, 0, 0, 0))
    frames = max(1, int(asset.get("frames", 1)))
    if asset["type"] == "2D_spritesheet":
        cw = 40 if "brute" in aid else 32
        ch = 48 if "brute" in aid else 32
        cols = max(1, w // cw)
        shape = "human" if ("player" in aid or "zombie" in aid or "npc" in aid or "cloth" in aid or "pack" in aid) else "circle"
        for i in range(frames):
            ox = (i % cols) * cw
            oy = (i // cols) * ch
            if oy + ch <= h:
                draw_outlined_cell(grid, ox, oy, cw, ch, fill_col, acc_col, dark_col, shape=shape)
    elif asset["type"] == "2D_ui" or asset["type"] == "2D_vfx":
        if aid in ("H03_ui_panel", "H04_ui_slot"):
            for y in range(h):
                for x in range(w):
                    if x == 0 or y == 0 or x == w - 1 or y == h - 1:
                        grid[y][x] = dark_col
                    elif x == 1 or y == 1 or x == w - 2 or y == h - 2:
                        grid[y][x] = palette[27]
                    else:
                        grid[y][x] = palette[29]
        else:
            cw = max(8, w // frames)
            ch = h
            for i in range(frames):
                ox = i * cw
                draw_outlined_cell(grid, ox, 0, cw, ch, fill_col, acc_col, dark_col, shape="circle")
    else:
        shape = "diag" if ("weapons" in asset["file"] or "tools" in asset["file"]) else "circle"
        draw_outlined_cell(grid, 0, 0, w, h, fill_col, acc_col, dark_col, shape=shape)

    write_png(path, w, h, grid)


def build_box_glb(path: str, sx: float, sy: float, sz: float, color_idx: int = 0):
    """Генерирует валидный бинарный glTF 2.0 (.glb) низкополигональный меш (24 вершины, 12 треугольников) с UV."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    hx, hy, hz = sx * 0.5, sy, sz * 0.5
    # 6 граней * 4 вершины = 24 вершины (плоские грани без сглаживания)
    faces = [
        ((0, 0, 1), [(-hx, 0, hz), (hx, 0, hz), (hx, hy, hz), (-hx, hy, hz)]),
        ((0, 0, -1), [(hx, 0, -hz), (-hx, 0, -hz), (-hx, hy, -hz), (hx, hy, -hz)]),
        ((1, 0, 0), [(hx, 0, hz), (hx, 0, -hz), (hx, hy, -hz), (hx, hy, hz)]),
        ((-1, 0, 0), [(-hx, 0, -hz), (-hx, 0, hz), (-hx, hy, hz), (-hx, hy, -hz)]),
        ((0, 1, 0), [(-hx, hy, hz), (hx, hy, hz), (hx, hy, -hz), (-hx, hy, -hz)]),
        ((0, -1, 0), [(-hx, 0, -hz), (hx, 0, -hz), (hx, 0, hz), (-hx, 0, hz)]),
    ]
    u0 = ((color_idx % 8) + 0.25) / 8.0
    u1 = ((color_idx % 8) + 0.75) / 8.0
    v0 = ((color_idx // 8) + 0.25) / 4.0
    v1 = ((color_idx // 8) + 0.75) / 4.0
    uv_quad = [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]

    pos_buf = bytearray()
    nrm_buf = bytearray()
    uv_buf = bytearray()
    idx_buf = bytearray()

    min_p = [1e9, 1e9, 1e9]
    max_p = [-1e9, -1e9, -1e9]

    for fi, (nrm, pts) in enumerate(faces):
        base = fi * 4
        for vi, p in enumerate(pts):
            pos_buf.extend(struct.pack("<fff", *p))
            nrm_buf.extend(struct.pack("<fff", *nrm))
            uv_buf.extend(struct.pack("<ff", *uv_quad[vi]))
            for k in range(3):
                min_p[k] = min(min_p[k], p[k])
                max_p[k] = max(max_p[k], p[k])
        idx_buf.extend(struct.pack("<HHHHHH", base, base + 1, base + 2, base, base + 2, base + 3))

    bin_blob = bytes(pos_buf + nrm_buf + uv_buf + idx_buf)
    pad_len = (4 - (len(bin_blob) % 4)) % 4
    bin_chunk = bin_blob + (b"\x00" * pad_len)

    pos_len = len(pos_buf)
    nrm_len = len(nrm_buf)
    uv_len = len(uv_buf)
    idx_len = len(idx_buf)

    gltf = {
        "asset": {"version": "2.0", "generator": "DeadDistrictPlaceholderGen"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0, "name": os.path.splitext(os.path.basename(path))[0]}],
        "meshes": [{
            "primitives": [{
                "attributes": {"POSITION": 0, "NORMAL": 1, "TEXCOORD_0": 2},
                "indices": 3
            }]
        }],
        "buffers": [{"byteLength": len(bin_blob)}],
        "bufferViews": [
            {"buffer": 0, "byteOffset": 0, "byteLength": pos_len, "target": 34962},
            {"buffer": 0, "byteOffset": pos_len, "byteLength": nrm_len, "target": 34962},
            {"buffer": 0, "byteOffset": pos_len + nrm_len, "byteLength": uv_len, "target": 34962},
            {"buffer": 0, "byteOffset": pos_len + nrm_len + uv_len, "byteLength": idx_len, "target": 34963},
        ],
        "accessors": [
            {"bufferView": 0, "componentType": 5126, "count": 24, "type": "VEC3", "min": min_p, "max": max_p},
            {"bufferView": 1, "componentType": 5126, "count": 24, "type": "VEC3"},
            {"bufferView": 2, "componentType": 5126, "count": 24, "type": "VEC2"},
            {"bufferView": 3, "componentType": 5123, "count": 36, "type": "SCALAR"},
        ],
    }
    json_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    json_pad = (4 - (len(json_bytes) % 4)) % 4
    json_chunk = json_bytes + (b" " * json_pad)

    total_len = 12 + 8 + len(json_chunk) + 8 + len(bin_chunk)
    header = struct.pack("<III", 0x46546C67, 2, total_len)
    c_json = struct.pack("<II", len(json_chunk), 0x4E4F534A) + json_chunk
    c_bin = struct.pack("<II", len(bin_chunk), 0x004E4942) + bin_chunk
    with open(path, "wb") as f:
        f.write(header + c_json + c_bin)


def generate_wav(asset):
    path = os.path.join(ROOT, asset["file"])
    os.makedirs(os.path.dirname(path), exist_ok=True)
    sr = 22050
    dur = 0.25 if "sfx" in asset["type"] else 0.8
    freq = 120.0 + (sum(ord(c) for c in asset["id"]) % 420)
    frames = bytearray()
    n = int(sr * dur)
    for i in range(n):
        t = i / sr
        env = max(0.0, 1.0 - (i / n)) if "sfx" in asset["type"] else 0.5
        s = math.sin(2.0 * math.pi * freq * t) * env * 0.25
        frames.extend(struct.pack("<h", int(max(-32767, min(32767, s * 32767)))))
    with wave.open(path, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(bytes(frames))


def main():
    palette = load_palette()
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    counts = {"png": 0, "glb": 0, "wav": 0, "skipped": 0}
    for idx, asset in enumerate(manifest["assets"]):
        atype = asset["type"]
        full_path = os.path.join(ROOT, asset["file"])
        if atype.startswith("2D_"):
            generate_png_asset(asset, palette)
            counts["png"] += 1
        elif atype == "3D_glb":
            if "veh_" in asset["id"]:
                dims = (2.0, 1.4, 4.4)
            elif "tree" in asset["id"]:
                dims = (1.6, 3.6, 1.6)
            elif "wpn_" in asset["id"]:
                dims = (0.3, 0.15, 0.9)
            else:
                dims = (1.1, 1.0, 1.1)
            build_box_glb(full_path, *dims, color_idx=(idx % 24))
            counts["glb"] += 1
        elif atype.startswith("audio_"):
            generate_wav(asset)
            counts["wav"] += 1
        else:
            counts["skipped"] += 1

    print(f"[generate_placeholders] Готово: PNG={counts['png']}, GLB={counts['glb']}, WAV={counts['wav']}, внешние/текст={counts['skipped']}")


if __name__ == "__main__":
    main()
