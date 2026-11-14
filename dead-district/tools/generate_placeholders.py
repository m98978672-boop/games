#!/usr/bin/env python3
"""
Генератор детализированного пиксель-арта (2D PNG), многосоставных low-poly 3D моделей (GLB)
и процедурных звуков (WAV) для DEAD DISTRICT строго в 32-цветной палитре Survival Horror 32.
Использует только стандартную библиотеку Python, гарантирует 1px обводку и 0% AA.
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
    os.makedirs(os.path.dirname(path), exist_ok=True)
    raw_rows = bytearray()
    for y in range(height):
        raw_rows.append(0)
        for r, g, b, a in pixels[y]:
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


def h2(x: int, y: int, s: int) -> int:
    v = (x * 374761393 + y * 668265263 + s * 1442695041) & 0xFFFFFFFF
    v = ((v ^ (v >> 13)) * 1274126177) & 0xFFFFFFFF
    return (v ^ (v >> 16)) & 0xFFFFFFFF


def pset(grid, x: int, y: int, col):
    if 0 <= y < len(grid) and 0 <= x < len(grid[0]):
        grid[y][x] = col


def frect(grid, x0: int, y0: int, w: int, h: int, col):
    for y in range(y0, y0 + h):
        for x in range(x0, x0 + w):
            pset(grid, x, y, col)


def add_outline(grid, ox: int, oy: int, cw: int, ch: int, outline_col):
    """Обводит непрозрачные пиксели в ячейке чёткой 1px тёмной обводкой (4-связность)."""
    to_draw = []
    for dy in range(ch):
        for dx in range(cw):
            px, py = ox + dx, oy + dy
            if grid[py][px][3] != 0:
                continue
            for nx, ny in ((dx - 1, dy), (dx + 1, dy), (dx, dy - 1), (dx, dy + 1)):
                if 0 <= nx < cw and 0 <= ny < ch and grid[oy + ny][ox + nx][3] == 255:
                    to_draw.append((px, py))
                    break
    for px, py in to_draw:
        grid[py][px] = outline_col


# ---------- ДЕТАЛИЗИРОВАННЫЙ ПИКСЕЛЬ-АРТ ДЛЯ ТАЙЛОВ (32x32) ----------
def draw_tile_cell(grid, ox: int, oy: int, aid: str, idx: int, pal):
    BLK = pal[31]
    if "grass" in aid:
        frect(grid, ox, oy, 32, 32, pal[12])
        for y in range(32):
            for x in range(32):
                v = h2(x + idx * 31, y, 101) % 32
                if v < 4:
                    pset(grid, ox + x, oy + y, pal[13])
                elif v == 5 and y > 1:
                    pset(grid, ox + x, oy + y, pal[11])
                    pset(grid, ox + x, oy + y - 1, pal[10])
                elif v == 12 and x % 4 == 0:
                    pset(grid, ox + x, oy + y, pal[5])
    elif "dirt" in aid:
        frect(grid, ox, oy, 32, 32, pal[7])
        for y in range(32):
            for x in range(32):
                v = h2(x + idx * 17, y, 202) % 24
                if v < 4:
                    pset(grid, ox + x, oy + y, pal[8])
                elif v == 7:
                    pset(grid, ox + x, oy + y, pal[6])
                elif v == 15:
                    pset(grid, ox + x, oy + y, pal[9])
    elif "asphalt" in aid:
        frect(grid, ox, oy, 32, 32, pal[28])
        for y in range(32):
            for x in range(32):
                v = h2(x + idx * 13, y, 303) % 20
                if v < 3:
                    pset(grid, ox + x, oy + y, pal[29])
                elif v == 9:
                    pset(grid, ox + x, oy + y, pal[27])
        # Пунктирная разметка или трещины
        if idx % 2 == 0:
            frect(grid, ox + 14, oy + 4, 4, 10, pal[5])
            frect(grid, ox + 14, oy + 20, 4, 8, pal[5])
        else:
            for k in range(8):
                pset(grid, ox + 6 + k * 2, oy + 10 + (k % 3), pal[31])
    elif "sidewalk" in aid:
        frect(grid, ox, oy, 32, 32, pal[26])
        for x in range(32):
            pset(grid, ox + x, oy, pal[27])
            pset(grid, ox + x, oy + 31, pal[28])
            pset(grid, ox + x, oy + 16, pal[27])
        for y in range(32):
            pset(grid, ox + 16, oy + y, pal[27])
            if y % 3 == 0:
                pset(grid, ox + (h2(y, idx, 77) % 30), oy + y, pal[25])
    elif "wood_floor" in aid:
        frect(grid, ox, oy, 32, 32, pal[6])
        for py in range(0, 32, 8):
            frect(grid, ox, oy + py, 32, 1, pal[8])
            frect(grid, ox, oy + py + 1, 32, 1, pal[5])
            joint = ((py * 7 + idx * 11) % 24) + 4
            frect(grid, ox + joint, oy + py, 1, 8, pal[8])
            pset(grid, ox + ((joint + 9) % 28), oy + py + 4, pal[7])
    elif "hospital_floor" in aid:
        frect(grid, ox, oy, 32, 32, pal[25])
        for py in range(0, 32, 16):
            for px in range(0, 32, 16):
                tint = pal[30] if ((px // 16 + py // 16) % 2 == 0) else pal[25]
                frect(grid, ox + px, oy + py, 15, 15, tint)
                frect(grid, ox + px + 15, oy + py, 1, 16, pal[26])
                frect(grid, ox + px, oy + py + 15, 16, 1, pal[26])
        if idx == 1:
            frect(grid, ox + 9, oy + 11, 5, 4, pal[2])
            pset(grid, ox + 12, oy + 15, pal[1])
    elif "warehouse_floor" in aid:
        frect(grid, ox, oy, 32, 32, pal[27])
        for y in range(32):
            for x in range(32):
                if x == 0 or y == 0:
                    pset(grid, ox + x, oy + y, pal[28])
                elif h2(x, y, idx + 44) % 19 == 0:
                    pset(grid, ox + x, oy + y, pal[26])
                elif h2(x, y, idx + 88) % 23 == 0:
                    pset(grid, ox + x, oy + y, pal[29])
    elif "water" in aid:
        frect(grid, ox, oy, 32, 32, pal[13])
        for y in range(32):
            for x in range(32):
                if (x + y + idx * 3) % 9 == 0:
                    pset(grid, ox + x, oy + y, pal[14])
                elif (x * 2 + y + idx * 5) % 17 == 0:
                    pset(grid, ox + x, oy + y, pal[15])
    elif "wall_brick" in aid:
        frect(grid, ox, oy, 32, 32, pal[2])
        for row in range(4):
            ry = row * 8
            frect(grid, ox, oy + ry, 32, 1, pal[26])  # раствор
            off = 8 if row % 2 else 0
            for bx in range(off, 32, 16):
                frect(grid, ox + bx, oy + ry, 1, 8, pal[26])
                frect(grid, ox + ((bx + 1) % 32), oy + ry + 1, 6, 2, pal[1])
        frect(grid, ox, oy, 32, 1, BLK)
        frect(grid, ox, oy + 31, 32, 1, BLK)
    elif "wall_wood" in aid:
        frect(grid, ox, oy, 32, 32, pal[7])
        for py in range(0, 32, 6):
            frect(grid, ox, oy + py, 32, 1, pal[9])
            frect(grid, ox, oy + py + 1, 32, 1, pal[6])
        frect(grid, ox, oy, 32, 1, BLK)
        frect(grid, ox, oy + 31, 32, 1, BLK)
        frect(grid, ox, oy, 1, 32, BLK)
        frect(grid, ox + 31, oy, 1, 32, BLK)
    elif "wall_plaster" in aid:
        frect(grid, ox, oy, 32, 32, pal[0])
        frect(grid, ox + 2, oy + 2, 28, 26, pal[5])
        frect(grid, ox, oy + 26, 32, 5, pal[1])
        frect(grid, ox, oy, 32, 1, BLK)
        frect(grid, ox, oy + 31, 32, 1, BLK)
        for k in range(6):
            pset(grid, ox + 8 + k, oy + 6 + k * 2, pal[8])
    elif "door" in aid:
        frect(grid, ox, oy, 32, 32, pal[6])  # порог
        if idx == 0:  # закрыта
            frect(grid, ox + 2, oy + 10, 28, 12, BLK)
            frect(grid, ox + 3, oy + 11, 26, 10, pal[7])
            frect(grid, ox + 5, oy + 13, 22, 2, pal[6])
            frect(grid, ox + 24, oy + 16, 3, 2, pal[5])  # ручка
        elif idx == 1:  # открыта
            frect(grid, ox + 2, oy + 2, 8, 28, BLK)
            frect(grid, ox + 3, oy + 3, 6, 26, pal[7])
        else:  # выломана
            frect(grid, ox + 2, oy + 11, 9, 8, pal[8])
            frect(grid, ox + 20, oy + 12, 10, 7, pal[8])
    elif "window" in aid:
        frect(grid, ox, oy, 32, 32, pal[28])
        frect(grid, ox + 2, oy + 8, 28, 16, BLK)
        if idx == 0:  # целое стекло
            frect(grid, ox + 3, oy + 9, 26, 14, pal[15])
            for k in range(8):
                pset(grid, ox + 6 + k, oy + 18 - k, pal[30])
        elif idx == 1:  # разбито
            frect(grid, ox + 3, oy + 9, 26, 14, pal[14])
            frect(grid, ox + 4, oy + 10, 5, 4, pal[15])
            frect(grid, ox + 21, oy + 18, 6, 4, pal[15])
        else:  # заколочено досками
            frect(grid, ox + 3, oy + 9, 26, 14, pal[14])
            frect(grid, ox + 1, oy + 10, 30, 4, pal[7])
            frect(grid, ox + 1, oy + 17, 30, 4, pal[6])
            pset(grid, ox + 4, oy + 12, pal[25])
            pset(grid, ox + 27, oy + 19, pal[25])
    elif "farm_soil" in aid:
        base = pal[8] if idx == 0 else pal[9]
        frect(grid, ox, oy, 32, 32, pal[12])
        frect(grid, ox + 2, oy + 2, 28, 28, BLK)
        frect(grid, ox + 3, oy + 3, 26, 26, base)
        for fy in range(6, 28, 6):
            frect(grid, ox + 4, oy + fy, 24, 2, pal[7] if idx == 0 else BLK)
        if idx >= 2:
            for fx in range(7, 26, 6):
                pset(grid, ox + fx, oy + 10, pal[10] if idx >= 3 else pal[5])
                pset(grid, ox + fx, oy + 22, pal[10] if idx >= 3 else pal[5])
    elif "crops_sheet" in aid:
        frect(grid, ox, oy, 32, 32, (0, 0, 0, 0))
        crop_row = idx // 6
        stage = idx % 6
        # Настоящие органические кусты и плоды для 4+ стадий роста
        fruit_cols = [pal[1], pal[6], pal[5], pal[10], pal[2], pal[1]]  # томат/картофель/морковь/капуста/редис/клубника
        fc = fruit_cols[(idx // 4) % len(fruit_cols)]
        g_stage = idx % 4
        centers = ((10, 11), (22, 11), (10, 22), (22, 22))
        for px, py in centers:
            if g_stage == 0:
                pset(grid, ox + px, oy + py, pal[11])
                pset(grid, ox + px - 1, oy + py - 1, pal[10])
            elif g_stage == 1:
                frect(grid, ox + px - 2, oy + py - 1, 4, 3, pal[11])
                frect(grid, ox + px - 1, oy + py - 2, 2, 3, pal[10])
            else:
                frect(grid, ox + px - 3, oy + py - 2, 6, 4, pal[12])
                frect(grid, ox + px - 2, oy + py - 3, 4, 5, pal[11])
                pset(grid, ox + px - 1, oy + py - 3, pal[10])
                pset(grid, ox + px + 1, oy + py - 2, pal[10])
                if g_stage >= 3:
                    frect(grid, ox + px - 2, oy + py, 2, 2, fc)
                    frect(grid, ox + px + 1, oy + py - 1, 2, 2, fc)
        add_outline(grid, ox, oy, 32, 32, BLK)
    else:  # snow
        frect(grid, ox, oy, 32, 32, pal[25])
        frect(grid, ox + 4, oy + 4, 20, 12, pal[30])
        for k in range(12):
            pset(grid, ox + (h2(k, idx, 91) % 30), oy + (h2(idx, k, 51) % 30), pal[15])


# ---------- ДЕТАЛИЗИРОВАННЫЙ ПИКСЕЛЬ-АРТ ДЛЯ ПЕРСОНАЖЕЙ (32x32 / 40x48) ----------
def draw_character_cell(grid, ox: int, oy: int, cw: int, ch: int, aid: str, idx: int, pal, row_idx: int = 0):
    BLK = pal[31]
    cx, cy = ox + cw // 2, oy + ch // 2
    step = int(round(math.sin(idx * 1.57) * 2))
    is_crawler = "crawler" in aid
    is_brute = "brute" in aid
    is_zombie = ("zombie" in aid) or ("_z_" in aid)
    is_player = "player" in aid

    # Цвета кожи, одежды и акцентов с явным разделением выживших, 5 зомби и 6 NPC
    skin = pal[11] if is_zombie else pal[0]
    skin_hi = pal[10] if is_zombie else pal[5]
    if "infected" in aid:
        skin, skin_hi = pal[10], pal[5]
    shirt = pal[15] if is_player else pal[27]
    shirt_hi = pal[25] if is_player else pal[26]
    pants = pal[17] if is_player else pal[29]
    head_acc = pal[7]
    if "walker" in aid:
        shirt, shirt_hi, pants, head_acc = pal[8], pal[7], pal[28], pal[9]
    elif "runner" in aid:
        shirt, shirt_hi, pants, head_acc = pal[2], pal[1], pal[29], pal[3]
    elif "brute" in aid:
        shirt, shirt_hi, pants, head_acc = pal[3], pal[2], pal[29], pal[27]
    elif "infected" in aid:
        shirt, shirt_hi, pants, head_acc = pal[13], pal[12], pal[14], pal[10]
    elif "medic" in aid:
        shirt, shirt_hi, head_acc = pal[30], pal[25], pal[1]
    elif "mechanic" in aid:
        shirt, shirt_hi, head_acc = pal[16], pal[15], pal[28]
    elif "raider" in aid:
        shirt, shirt_hi, head_acc = pal[2], pal[22], pal[24]
    elif "farmer" in aid:
        shirt, shirt_hi, head_acc = pal[6], pal[5], pal[5]
    elif "cop" in aid:
        shirt, shirt_hi, head_acc = pal[18], pal[16], pal[15]

    if "cloth_" in aid or "pack_" in aid:
        col = pal[1] if "cap" in aid else (pal[16] if "helmet" in aid or "jeans" in aid else (pal[2] if "jacket" in aid else (pal[28] if "vest" in aid else pal[12])))
        if "pack" in aid:
            frect(grid, cx - 5, cy - 3, 10, 9, pal[7] if "school" in aid else col)
            frect(grid, cx - 4, cy - 1, 8, 2, pal[5])
        elif "cap" in aid or "beanie" in aid or "helmet" in aid:
            frect(grid, cx - 4, oy + 4, 8, 5, col)
            frect(grid, cx - 3, oy + 5, 6, 1, pal[25])
        elif "jeans" in aid or "boots" in aid:
            frect(grid, cx - 4, cy + 5, 3, 6, col)
            frect(grid, cx + 1, cy + 5, 3, 6, col)
        else:
            frect(grid, cx - 6, cy - 3, 12, 8, col)
        add_outline(grid, ox, oy, cw, ch, BLK)
        return

    if is_crawler:
        facing = row_idx % 4  # вниз, вверх, влево, вправо
        # Ползущий силуэт: положение головы и рук соответствует направлению.
        if facing < 2:
            head_y = cy - 6 if facing == 0 else cy + 3
            frect(grid, cx - 5, cy - 2, 10, 8, shirt)
            frect(grid, cx - 3, head_y, 7, 6, skin if facing == 0 else head_acc)
            frect(grid, cx - 7, cy + step, 3, 7, skin)
            frect(grid, cx + 4, cy - step, 3, 7, skin)
            if facing == 0:
                pset(grid, cx - 1, head_y + 3, pal[1])
                pset(grid, cx + 1, head_y + 3, pal[1])
        else:
            head_x = cx - 8 if facing == 2 else cx + 2
            frect(grid, cx - 4, cy - 4, 8, 9, shirt)
            frect(grid, head_x, cy - 5, 6, 7, skin)
            frect(grid, cx - 3 + step, cy + 4, 7, 3, skin)
            frect(grid, cx - 3 - step, cy - 6, 7, 3, skin)
            pset(grid, head_x + (1 if facing == 2 else 4), cy - 2, pal[1])
        add_outline(grid, ox, oy, cw, ch, BLK)
        return

    facing = row_idx % 4  # 0=вниз, 1=вверх, 2=влево, 3=вправо
    bw = 16 if is_brute else (8 if facing >= 2 else 10)
    # Ноги с шагом и ботинками
    frect(grid, cx - bw // 3 - 1, cy + 4 + step, 4, 7, pants)
    frect(grid, cx + bw // 3 - 2, cy + 4 - step, 4, 7, pants)
    frect(grid, cx - bw // 3 - 1, cy + 9 + step, 4, 2, pal[9])
    frect(grid, cx + bw // 3 - 2, cy + 9 - step, 4, 2, pal[9])

    # Торс, плечи, блик и ремень
    frect(grid, cx - bw // 2, cy - 4, bw, 9, shirt)
    frect(grid, cx - bw // 2 + 1, cy - 4, bw - 2, 2, shirt_hi)
    frect(grid, cx - bw // 2, cy + 3, bw, 1, pal[9])
    if "medic" in aid:
        frect(grid, cx - 1, cy - 2, 3, 5, pal[1])
        frect(grid, cx - 2, cy - 1, 5, 3, pal[1])
    elif is_zombie:
        frect(grid, cx - 2, cy - 1, 4, 3, pal[2])
        pset(grid, cx + 1, cy + 1, pal[1])
        if "infected" in aid:
            pset(grid, cx - 3, cy - 2, pal[5])
            pset(grid, cx + 2, cy, pal[5])

    # Руки в зависимости от направления/действия
    if is_zombie:
        frect(grid, cx - bw // 2 - 3, cy - 3 - step, 3, 7, skin)
        frect(grid, cx + bw // 2, cy - 3 + step, 3, 7, skin)
    elif "aim" in aid:
        frect(grid, cx + bw // 2 - 1, cy - 1, 7, 3, pal[27])
        frect(grid, cx - bw // 2 - 2, cy - 1, 3, 5, skin)
    elif "melee" in aid:
        frect(grid, cx + bw // 2, cy - 7 + step, 3, 11, pal[6])
        frect(grid, cx - bw // 2 - 2, cy - 1, 3, 5, skin)
    else:
        frect(grid, cx - bw // 2 - 3, cy - 2 + step, 3, 6, skin)
        frect(grid, cx + bw // 2, cy - 2 - step, 3, 6, skin)

    # Голова + причёска/каска + лицо/глаза по направлению
    hr = 5 if is_brute else 4
    frect(grid, cx - hr, cy - 4 - hr * 2 + 1, hr * 2, hr * 2, skin)
    frect(grid, cx - hr + 1, cy - 4 - hr * 2 + 1, hr * 2 - 2, 1, skin_hi)
    if facing == 1:  # вид со спины — шапка/волосы закрывают затылок
        frect(grid, cx - hr, cy - 4 - hr * 2 + 1, hr * 2, hr * 2 - 1, head_acc)
    else:
        frect(grid, cx - hr, cy - 4 - hr * 2 + 1, hr * 2, 3, head_acc)
        eye_col = pal[1] if is_zombie else pal[31]
        if facing == 2:
            pset(grid, cx - 2, cy - 7, eye_col)
        elif facing == 3:
            pset(grid, cx + 1, cy - 7, eye_col)
        else:
            pset(grid, cx - 2, cy - 7, eye_col)
            pset(grid, cx + 1, cy - 7, eye_col)
            if is_zombie:
                frect(grid, cx - 1, cy - 5, 2, 1, pal[2])
    if "gore" in aid:
        grid_clear = make_grid(cw, ch, (0, 0, 0, 0))
        for y in range(ch):
            for x in range(cw):
                grid[oy + y][ox + x] = grid_clear[y][x]
        frect(grid, cx - 6, cy - 4, 12, 8, pal[2])
        frect(grid, cx - 3, cy - 6, 7, 11, pal[1])
    add_outline(grid, ox, oy, cw, ch, BLK)


# ---------- ДЕТАЛИЗИРОВАННЫЕ ИКОНКИ ПРЕДМЕТОВ (16x16 / 24x24) ----------
def draw_item_icon(grid, w: int, h: int, aid: str, pal):
    BLK = pal[31]
    cx, cy = w // 2, h // 2
    if "baseball_bat" in aid:
        for k in range(-7, 8):
            thick = 2 if k > 1 else 1
            frect(grid, cx + k, cy - k, thick, thick, pal[6] if k > -3 else pal[29])
    elif "crowbar" in aid:
        for k in range(-6, 6):
            frect(grid, cx + k, cy - k, 2, 2, pal[1])
        frect(grid, cx + 4, cy - 8, 4, 3, pal[25])
    elif "fire_axe" in aid:
        for k in range(-7, 7):
            frect(grid, cx + k, cy - k, 2, 2, pal[7])
        frect(grid, cx + 2, cy - 8, 6, 6, pal[1])
        frect(grid, cx + 6, cy - 8, 2, 6, pal[25])
    elif "knife" in aid or "machete" in aid:
        for k in range(-5, 6):
            col = pal[25] if k > -1 else pal[7]
            frect(grid, cx + k, cy - k, 2, 2, col)
    elif "hammer" in aid or "wrench" in aid:
        for k in range(-6, 5):
            frect(grid, cx + k, cy - k, 2, 2, pal[26])
        frect(grid, cx + 1, cy - 7, 7, 4, pal[27])
    elif "glock" in aid or "m1911" in aid:
        frect(grid, cx - 6, cy - 4, 13, 4, pal[27] if "glock" in aid else pal[26])
        frect(grid, cx - 5, cy, 4, 6, pal[29])
    elif "mossberg" in aid or "ar15" in aid:
        frect(grid, cx - 9, cy - 2, 18, 3, pal[29])
        frect(grid, cx - 8, cy + 1, 5, 4, pal[7] if "mossberg" in aid else pal[28])
        if "ar15" in aid:
            frect(grid, cx - 1, cy + 1, 3, 6, pal[27])  # магазин
            frect(grid, cx - 3, cy - 4, 6, 2, pal[28])  # ручка
    elif "ammo" in aid:
        stripe = pal[1] if "12ga" in aid else (pal[5] if "556" in aid else pal[15])
        frect(grid, 3, 4, w - 6, h - 7, pal[27])
        frect(grid, 3, 6, w - 6, 3, stripe)
    elif "gas_can" in aid:
        frect(grid, 4, 5, w - 8, h - 8, pal[1])
        frect(grid, 6, 3, 6, 3, pal[2])
        frect(grid, 13, 3, 4, 4, pal[5])
    elif "flashlight" in aid:
        frect(grid, 3, 6, 7, 4, pal[27])
        frect(grid, 10, 5, 3, 6, pal[5])
    elif "canned" in aid or "soda" in aid:
        frect(grid, 4, 3, w - 8, h - 6, pal[25])
        frect(grid, 4, 6, w - 8, 4, pal[1] if "soup" in aid or "soda" in aid else pal[12])
    elif "water" in aid or "antiseptic" in aid or "coffee" in aid:
        col = pal[12] if "tainted" in aid else (pal[10] if "antiseptic" in aid else (pal[7] if "coffee" in aid else pal[15]))
        frect(grid, 5, 5, w - 10, h - 7, col)
        frect(grid, 6, 2, w - 12, 3, pal[30])
    elif "bandage" in aid or "antibiotics" in aid or "painkillers" in aid or "suture" in aid:
        frect(grid, 3, 4, w - 6, h - 8, pal[2] if "dirty" in aid else pal[30])
        frect(grid, cx - 1, cy - 3, 2, 6, pal[1])
        frect(grid, cx - 3, cy - 1, 6, 2, pal[1])
    elif "apple" in aid or "tomato" in aid or "radish" in aid or "strawberry" in aid:
        frect(grid, 4, 5, w - 8, h - 7, pal[1])
        frect(grid, 6, 2, 4, 3, pal[11])
    elif "carrot" in aid:
        frect(grid, 6, 5, 4, 8, pal[1])
        frect(grid, 5, 2, 6, 3, pal[10])
    elif "cabbage" in aid:
        frect(grid, 3, 4, w - 6, h - 7, pal[11])
        frect(grid, 5, 5, w - 10, h - 9, pal[10])
    elif "bread" in aid or "potato" in aid or "plank" in aid:
        frect(grid, 3, 5, w - 6, h - 9, pal[6])
        frect(grid, 4, 6, w - 8, 2, pal[5])
    elif "beef" in aid or "jerky" in aid:
        frect(grid, 3, 5, w - 6, h - 8, pal[2] if "raw" in aid else pal[7])
        frect(grid, 5, 7, 3, 3, pal[30])
    else:
        frect(grid, 4, 4, w - 8, h - 8, pal[26])
        frect(grid, 6, 6, w - 12, h - 12, pal[5])
    add_outline(grid, 0, 0, w, h, BLK)


def generate_png_asset(asset, palette):
    path = os.path.join(ROOT, asset["file"])
    w_str, h_str = asset["dimensions"].split("x")
    w, h = int(w_str), int(h_str)
    aid = asset["id"]

    if aid == "K01_palette_lut":
        write_png(path, 32, 1, [palette[:32]])
        return
    if aid == "K04_bayer_dither":
        bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
        grid = make_grid(4, 4, palette[31])
        for y in range(4):
            for x in range(4):
                v = bayer[y][x]
                grid[y][x] = palette[31] if v < 3 else (palette[29] if v < 7 else (palette[27] if v < 11 else (palette[25] if v < 14 else palette[30])))
        write_png(path, 4, 4, grid)
        return
    if aid in ("K02_atlas_vehicles", "K03_atlas_furniture"):
        grid = make_grid(w, h, palette[28])
        for idx, col in enumerate(palette):
            bx, by = (idx % 8) * 16, (idx // 8) * 32
            frect(grid, bx, by, 16, 32, col)
            for k in range(16):
                pset(grid, bx + k, by, palette[31])
                pset(grid, bx + k, by + 31, palette[31])
        write_png(path, w, h, grid)
        return

    if asset["type"] == "2D_tile":
        grid = make_grid(w, h, palette[12])
        frames = max(1, int(asset.get("frames", 1)))
        cols = max(1, w // 32)
        for idx in range(frames):
            cx, cy = (idx % cols) * 32, (idx // cols) * 32
            if cy + 32 <= h:
                draw_tile_cell(grid, cx, cy, aid, idx, palette)
        write_png(path, w, h, grid)
        return

    grid = make_grid(w, h, (0, 0, 0, 0))
    frames = max(1, int(asset.get("frames", 1)))
    if asset["type"] == "2D_spritesheet":
        cw = 40 if "brute" in aid else 32
        ch = 48 if "brute" in aid else 32
        cols = max(1, w // cw)
        for i in range(frames):
            col_i, row_i = i % cols, i // cols
            ox, oy = col_i * cw, row_i * ch
            if oy + ch <= h:
                draw_character_cell(grid, ox, oy, cw, ch, aid, i, palette, row_i)
    elif asset["type"] in ("2D_ui", "2D_vfx"):
        if aid in ("H03_ui_panel", "H04_ui_slot"):
            frect(grid, 0, 0, w, h, palette[31])
            frect(grid, 1, 1, w - 2, h - 2, palette[27])
            frect(grid, 2, 2, w - 4, h - 4, palette[29])
        else:
            cw = max(8, w // frames)
            for i in range(frames):
                frect(grid, i * cw + cw // 4, h // 4, max(3, cw // 2), max(3, h // 2), palette[1] if "blood" in aid else palette[5])
                add_outline(grid, i * cw, 0, cw, h, palette[31])
    else:
        draw_item_icon(grid, w, h, aid, palette)
    write_png(path, w, h, grid)


# ---------- МНОГОСОСТАВНЫЕ LOW-POLY 3D МОДЕЛИ (GLB) ----------
def build_multipart_glb(path: str, boxes):
    """Собирает валидный glTF 2.0 (.glb) из списка деталей: [(cx, cy, cz, sx, sy, sz, color_idx), ...]."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    pos_buf = bytearray()
    nrm_buf = bytearray()
    uv_buf = bytearray()
    idx_buf = bytearray()
    min_p = [1e9, 1e9, 1e9]
    max_p = [-1e9, -1e9, -1e9]
    v_offset = 0

    for cx, cy, cz, sx, sy, sz, color_idx in boxes:
        hx, hy, hz = sx * 0.5, sy * 0.5, sz * 0.5
        faces = [
            ((0, 0, 1), [(cx - hx, cy - hy, cz + hz), (cx + hx, cy - hy, cz + hz), (cx + hx, cy + hy, cz + hz), (cx - hx, cy + hy, cz + hz)]),
            ((0, 0, -1), [(cx + hx, cy - hy, cz - hz), (cx - hx, cy - hy, cz - hz), (cx - hx, cy + hy, cz - hz), (cx + hx, cy + hy, cz - hz)]),
            ((1, 0, 0), [(cx + hx, cy - hy, cz + hz), (cx + hx, cy - hy, cz - hz), (cx + hx, cy + hy, cz - hz), (cx + hx, cy + hy, cz + hz)]),
            ((-1, 0, 0), [(cx - hx, cy - hy, cz - hz), (cx - hx, cy - hy, cz + hz), (cx - hx, cy + hy, cz + hz), (cx - hx, cy + hy, cz - hz)]),
            ((0, 1, 0), [(cx - hx, cy + hy, cz + hz), (cx + hx, cy + hy, cz + hz), (cx + hx, cy + hy, cz - hz), (cx - hx, cy + hy, cz - hz)]),
            ((0, -1, 0), [(cx - hx, cy - hy, cz - hz), (cx + hx, cy - hy, cz - hz), (cx + hx, cy - hy, cz + hz), (cx - hx, cy - hy, cz + hz)]),
        ]
        u0 = ((color_idx % 8) + 0.25) / 8.0
        u1 = ((color_idx % 8) + 0.75) / 8.0
        v0 = ((color_idx // 8) + 0.25) / 4.0
        v1 = ((color_idx // 8) + 0.75) / 4.0
        uv_quad = [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]
        for nrm, pts in faces:
            for vi, p in enumerate(pts):
                pos_buf.extend(struct.pack("<fff", *p))
                nrm_buf.extend(struct.pack("<fff", *nrm))
                uv_buf.extend(struct.pack("<ff", *uv_quad[vi]))
                for k in range(3):
                    min_p[k] = min(min_p[k], p[k])
                    max_p[k] = max(max_p[k], p[k])
            idx_buf.extend(struct.pack("<HHHHHH", v_offset, v_offset + 1, v_offset + 2, v_offset, v_offset + 2, v_offset + 3))
            v_offset += 4

    bin_blob = bytes(pos_buf + nrm_buf + uv_buf + idx_buf)
    bin_chunk = bin_blob + (b"\x00" * ((4 - (len(bin_blob) % 4)) % 4))
    pos_len, nrm_len, uv_len, idx_len = len(pos_buf), len(nrm_buf), len(uv_buf), len(idx_buf)
    idx_count = len(boxes) * 36

    gltf = {
        "asset": {"version": "2.0", "generator": "DeadDistrictModelGen"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0, "name": os.path.splitext(os.path.basename(path))[0]}],
        "meshes": [{"primitives": [{"attributes": {"POSITION": 0, "NORMAL": 1, "TEXCOORD_0": 2}, "indices": 3}]}],
        "buffers": [{"byteLength": len(bin_blob)}],
        "bufferViews": [
            {"buffer": 0, "byteOffset": 0, "byteLength": pos_len, "target": 34962},
            {"buffer": 0, "byteOffset": pos_len, "byteLength": nrm_len, "target": 34962},
            {"buffer": 0, "byteOffset": pos_len + nrm_len, "byteLength": uv_len, "target": 34962},
            {"buffer": 0, "byteOffset": pos_len + nrm_len + uv_len, "byteLength": idx_len, "target": 34963},
        ],
        "accessors": [
            {"bufferView": 0, "componentType": 5126, "count": v_offset, "type": "VEC3", "min": min_p, "max": max_p},
            {"bufferView": 1, "componentType": 5126, "count": v_offset, "type": "VEC3"},
            {"bufferView": 2, "componentType": 5126, "count": v_offset, "type": "VEC2"},
            {"bufferView": 3, "componentType": 5123, "count": idx_count, "type": "SCALAR"},
        ],
    }
    json_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    json_chunk = json_bytes + (b" " * ((4 - (len(json_bytes) % 4)) % 4))
    total_len = 12 + 8 + len(json_chunk) + 8 + len(bin_chunk)
    with open(path, "wb") as f:
        f.write(struct.pack("<III", 0x46546C67, 2, total_len))
        f.write(struct.pack("<II", len(json_chunk), 0x4E4F534A) + json_chunk)
        f.write(struct.pack("<II", len(bin_chunk), 0x004E4942) + bin_chunk)


def model_parts_for(aid: str):
    if "veh_" in aid:
        body_col = 25 if "ambulance" in aid else (29 if "police" in aid else (1 if "pickup" in aid else 27))
        parts = [
            (0.0, 0.55, 0.0, 1.9, 0.6, 4.2, body_col),       # кузов
            (0.0, 1.05, -0.1, 1.65, 0.55, 2.0, 15),          # остекление/кабина
            (-0.9, 0.3, 1.3, 0.28, 0.6, 0.6, 29),            # колёса
            (0.9, 0.3, 1.3, 0.28, 0.6, 0.6, 29),
            (-0.9, 0.3, -1.3, 0.28, 0.6, 0.6, 29),
            (0.9, 0.3, -1.3, 0.28, 0.6, 0.6, 29),
        ]
        if "police" in aid or "ambulance" in aid:
            parts.append((0.0, 1.4, -0.1, 0.9, 0.16, 0.25, 1))  # мигалка
        if "truck" in aid or "van" in aid:
            parts.append((0.0, 1.3, -0.4, 2.0, 1.2, 2.8, 25))
        return parts
    if "tree_oak" in aid:
        return [(0, 1.0, 0, 0.45, 2.0, 0.45, 7), (0, 2.4, 0, 1.8, 1.2, 1.8, 12), (0.3, 3.1, -0.2, 1.1, 0.8, 1.1, 11)]
    if "tree_pine" in aid:
        return [(0, 0.9, 0, 0.35, 1.8, 0.35, 8), (0, 1.8, 0, 1.7, 0.7, 1.7, 13), (0, 2.5, 0, 1.2, 0.7, 1.2, 12), (0, 3.1, 0, 0.7, 0.6, 0.7, 11)]
    if "campfire" in aid:
        return [(0, 0.15, 0, 0.9, 0.2, 0.25, 7), (0, 0.15, 0, 0.25, 0.2, 0.9, 8), (0, 0.45, 0, 0.35, 0.4, 0.35, 1)]
    if "bed" in aid:
        return [(0, 0.25, 0, 1.1, 0.3, 2.0, 7), (0, 0.45, 0, 1.0, 0.18, 1.85, 25), (0, 0.58, -0.7, 0.8, 0.12, 0.4, 30)]
    if "workbench" in aid or "table" in aid:
        return [(0, 0.8, 0, 1.5, 0.12, 0.8, 6), (-0.65, 0.4, -0.3, 0.12, 0.8, 0.12, 7), (0.65, 0.4, -0.3, 0.12, 0.8, 0.12, 7), (-0.65, 0.4, 0.3, 0.12, 0.8, 0.12, 7), (0.65, 0.4, 0.3, 0.12, 0.8, 0.12, 7)]
    if "wpn_" in aid:
        return [(0, 0.1, 0, 0.12, 0.12, 0.9, 27 if "rifle" in aid or "shotgun" in aid else 6), (0, 0.15, 0.32, 0.22, 0.2, 0.22, 1 if "axe" in aid else 29)]
    return [(0, 0.45, 0, 0.9, 0.9, 0.9, 7 if "crate" in aid or "barrel" in aid else 27), (0, 0.92, 0, 0.75, 0.1, 0.75, 26)]


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
    for asset in manifest["assets"]:
        atype = asset["type"]
        full_path = os.path.join(ROOT, asset["file"])
        if atype.startswith("2D_"):
            generate_png_asset(asset, palette)
            counts["png"] += 1
        elif atype == "3D_glb":
            build_multipart_glb(full_path, model_parts_for(asset["id"]))
            counts["glb"] += 1
        elif atype.startswith("audio_"):
            generate_wav(asset)
            counts["wav"] += 1
        else:
            counts["skipped"] += 1

    print(f"[generate_placeholders] Готово: PNG={counts['png']}, GLB={counts['glb']}, WAV={counts['wav']}, внешние/текст={counts['skipped']}")


if __name__ == "__main__":
    main()
