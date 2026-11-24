#!/usr/bin/env python3
"""Render the dialogue-only animated prologue for «Похождения Балтики 0».

Dependencies: Pillow, NumPy, imageio-ffmpeg. All art, score, and sound effects are
procedural; no stock video, real insignia, or borrowed music is used.
"""
from __future__ import annotations

import math
import os
import random
import subprocess
import wave
from pathlib import Path
from typing import Any

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent
AUDIO = ROOT / "audio"
OUT = ROOT / "baltika-0-prologue.mp4"
ASSET_DIALOGUE = AUDIO / "dialogue-track.wav"
ASSET_SCORE = AUDIO / "original-meme-score.wav"
BUILD = ROOT.parents[1] / ".cache" / "baltika-0-render"
BUILD.mkdir(parents=True, exist_ok=True)

W, H = 720, 1280
FPS = 24
SR = 48000
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
INK = (15, 19, 32, 255)
CREAM = (247, 244, 231, 255)
GOLD = (250, 193, 79, 255)
TEAL = (105, 220, 210, 255)


def font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REG, max(8, int(size)))


def clamp(x: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, x))


def smooth(a: float, b: float, x: float) -> float:
    if b <= a:
        return 1.0 if x >= b else 0.0
    u = clamp((x - a) / (b - a))
    return u * u * (3.0 - 2.0 * u)


def lerp(a: float, b: float, u: float) -> float:
    return a + (b - a) * u


def text_size(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont,
              stroke: int = 0) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=fnt, stroke_width=stroke)
    return box[2] - box[0], box[3] - box[1]


def wrap_by_width(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont,
                  max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        test = word if not current else current + " " + word
        if text_size(draw, test, fnt)[0] <= max_width or not current:
            current = test
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def centered_text(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str,
                  fnt: ImageFont.FreeTypeFont, fill: Any,
                  stroke_width: int = 0, stroke_fill: Any = None) -> None:
    x, y = xy
    tw, th = text_size(draw, text, fnt, stroke_width)
    draw.text((int(x - tw / 2), int(y - th / 2)), text, font=fnt, fill=fill,
              stroke_width=stroke_width, stroke_fill=stroke_fill)


def make_gradient(top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    rows = np.linspace(0.0, 1.0, H, dtype=np.float32)[:, None, None]
    a = np.asarray(top, dtype=np.float32)[None, None, :]
    b = np.asarray(bottom, dtype=np.float32)[None, None, :]
    arr = np.broadcast_to(a * (1.0 - rows) + b * rows, (H, W, 3)).astype(np.uint8).copy()
    return Image.fromarray(arr, "RGB").convert("RGBA")


def courtyard_background() -> Image.Image:
    im = make_gradient((23, 29, 66), (37, 27, 43))
    d = ImageDraw.Draw(im, "RGBA")
    # Moon and dusk haze.
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow, "RGBA")
    gd.ellipse((500, 75, 685, 260), fill=(118, 151, 239, 33))
    glow = glow.filter(ImageFilter.GaussianBlur(42))
    im.alpha_composite(glow)
    d = ImageDraw.Draw(im, "RGBA")
    d.ellipse((566, 112, 620, 166), fill=(236, 230, 193, 245))
    # Distant blocks.
    d.polygon([(0, 355), (0, 215), (55, 215), (55, 178), (163, 178), (163, 300),
               (225, 300), (225, 480), (0, 480)], fill=(36, 42, 73, 255), outline=(13, 20, 39, 255))
    d.polygon([(520, 470), (520, 295), (578, 295), (578, 225), (700, 225),
               (700, 178), (720, 178), (720, 515)], fill=(38, 41, 71, 255), outline=(13, 20, 39, 255))
    # Main apartment facades.
    d.polygon([(0, 480), (0, 322), (83, 322), (83, 295), (185, 295), (185, 450),
               (251, 450), (251, 740), (0, 740)], fill=(58, 51, 83, 255), outline=(13, 20, 39, 255), width=5)
    d.polygon([(493, 740), (493, 423), (555, 423), (555, 348), (634, 348),
               (634, 302), (720, 302), (720, 740)], fill=(57, 49, 77, 255), outline=(13, 20, 39, 255), width=5)
    # Windows with warm/cool variation.
    rng = random.Random(21)
    for x0, x1, y0, y1 in ((18, 226, 342, 710), (512, 704, 365, 705)):
        for yy in range(y0 + 17, y1 - 28, 67):
            for xx in range(x0 + 15, x1 - 25, 53):
                if rng.random() < 0.22:
                    continue
                col = (250, 185, 92, 202) if rng.random() < .72 else (111, 176, 226, 170)
                d.rounded_rectangle((xx, yy, xx + 28, yy + 42), radius=3,
                                    fill=col, outline=(17, 22, 42, 255), width=3)
                d.line((xx + 14, yy + 2, xx + 14, yy + 40), fill=(25, 28, 47, 190), width=2)
                d.line((xx + 2, yy + 21, xx + 26, yy + 21), fill=(25, 28, 47, 190), width=2)
    # Central alley and fence.
    d.rectangle((226, 540, 510, 755), fill=(27, 34, 59, 255))
    for x in range(246, 514, 31):
        d.line((x, 640, x, 787), fill=(25, 31, 49, 245), width=5)
    d.line((224, 685, 515, 685), fill=(39, 47, 69, 255), width=8)
    d.line((224, 733, 515, 733), fill=(39, 47, 69, 255), width=8)
    # A tiny, wordless background health hint: faded bottle + a weak heartbeat.
    # It is deliberately low-contrast and never becomes a title or spoken message.
    d.rounded_rectangle((447, 570, 495, 633), radius=5, fill=(68, 55, 76, 156), outline=(151, 99, 111, 115), width=2)
    d.rounded_rectangle((458, 588, 470, 619), radius=3, fill=(111, 67, 60, 150), outline=(170, 118, 110, 150), width=1)
    d.rectangle((461, 581, 467, 589), fill=(130, 80, 71, 150))
    d.rounded_rectangle((460, 578, 468, 582), radius=2, fill=(158, 112, 100, 150))
    d.ellipse((476, 587, 485, 596), fill=(150, 73, 88, 135))
    d.ellipse((483, 587, 492, 596), fill=(150, 73, 88, 135))
    d.polygon([(476, 593), (492, 593), (484, 606)], fill=(150, 73, 88, 135))
    d.line((453, 624, 459, 624, 463, 620, 467, 628, 471, 623, 477, 623, 481, 627, 489, 627), fill=(189, 110, 120, 145), width=2)
    # Street and sidewalk.
    d.rectangle((0, 748, W, 970), fill=(36, 42, 59, 255))
    d.rectangle((0, 970, W, H), fill=(52, 48, 54, 255))
    d.line((0, 971, W, 971), fill=(145, 124, 101, 255), width=8)
    for x in range(-20, W + 40, 126):
        d.line((x, 1000, x + 80, 1000), fill=(103, 90, 85, 120), width=3)
        d.line((x + 38, 1000, x + 5, 1095), fill=(104, 91, 85, 90), width=2)
    # Streetlight with a soft halo.
    lamp_glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    lg = ImageDraw.Draw(lamp_glow, "RGBA")
    lg.ellipse((28, 478, 154, 604), fill=(255, 201, 108, 82))
    lamp_glow = lamp_glow.filter(ImageFilter.GaussianBlur(29))
    im.alpha_composite(lamp_glow)
    d = ImageDraw.Draw(im, "RGBA")
    d.line((83, 310, 83, 720), fill=(14, 19, 35, 255), width=12)
    d.line((83, 329, 129, 329), fill=(14, 19, 35, 255), width=10)
    d.rounded_rectangle((118, 318, 150, 341), radius=8, fill=(255, 220, 149, 255), outline=(27, 29, 44, 255), width=4)
    # Bench behind the friends.
    d.rounded_rectangle((75, 858, 648, 907), radius=12, fill=(117, 71, 54, 255), outline=(25, 24, 34, 255), width=5)
    for yy in (870, 890):
        d.line((91, yy, 631, yy), fill=(171, 103, 62, 255), width=5)
    d.line((120, 905, 105, 966), fill=(26, 27, 38, 255), width=11)
    d.line((600, 905, 618, 966), fill=(26, 27, 38, 255), width=11)
    # Plants, curb, small stars.
    for bx, by in ((29, 866), (685, 849), (664, 913)):
        d.ellipse((bx - 22, by - 43, bx + 8, by + 6), fill=(45, 111, 88, 255), outline=(18, 40, 47, 255), width=3)
        d.ellipse((bx - 5, by - 57, bx + 24, by - 5), fill=(53, 131, 94, 255), outline=(18, 40, 47, 255), width=3)
    for i in range(70):
        x = rng.randrange(0, W)
        y = rng.randrange(45, 690)
        d.ellipse((x, y, x + 2, y + 2), fill=(230, 224, 197, rng.randrange(65, 150)))
    return im


def road_background(t: float) -> Image.Image:
    im = make_gradient((15, 25, 51), (13, 18, 31))
    d = ImageDraw.Draw(im, "RGBA")
    # Distant city strips and perspective road.
    d.polygon([(0, 550), (0, 390), (90, 390), (90, 320), (170, 320), (170, 580),
               (260, 580), (260, 410), (360, 410), (360, 570), (460, 570),
               (460, 340), (565, 340), (565, 545), (720, 545), (720, 740), (0, 740)],
              fill=(26, 36, 62, 255), outline=(10, 16, 31, 255), width=5)
    rng = random.Random(9)
    for i in range(23):
        x = rng.randrange(12, W - 12)
        y = rng.randrange(90, 550)
        col = (246, 189, 101, 170) if i % 3 else (104, 186, 220, 160)
        d.rectangle((x, y, x + 15, y + 25), fill=col)
    d.polygon([(0, 746), (720, 746), (720, 1280), (0, 1280)], fill=(28, 36, 54, 255))
    d.polygon([(260, 745), (455, 745), (720, 1280), (0, 1280)], fill=(40, 48, 63, 255))
    # Motion lines.
    speed = (t * 175) % 150
    for i in range(10):
        y = 780 + i * 40
        x = int((i * 97 + speed) % 850) - 80
        d.line((x, y, x + 85 + (i % 3) * 24, y), fill=(167, 198, 212, 65), width=3)
    # Dashed center line.
    for i in range(6):
        y = int(790 + ((i * 125 + t * 190) % 640))
        d.rounded_rectangle((340, y, 380, y + 20), radius=8, fill=(237, 203, 126, 155))
    return im


def fridge_background() -> Image.Image:
    im = make_gradient((10, 22, 55), (6, 13, 29))
    d = ImageDraw.Draw(im, "RGBA")
    # Sparse skyline silhouettes.
    d.polygon([(0, 570), (0, 388), (100, 388), (100, 320), (195, 320),
               (195, 584), (280, 584), (280, 414), (380, 414), (380, 645),
               (0, 645)], fill=(18, 31, 53, 255), outline=(5, 10, 24, 255), width=5)
    d.polygon([(480, 631), (480, 466), (548, 466), (548, 377), (628, 377),
               (628, 332), (720, 332), (720, 666)], fill=(18, 29, 51, 255), outline=(5, 10, 24, 255), width=5)
    d.rectangle((0, 660, W, H), fill=(12, 20, 36, 255))
    d.line((0, 949, W, 949), fill=(71, 99, 130, 170), width=4)
    rng = random.Random(31)
    for i in range(100):
        x = rng.randrange(W)
        y = rng.randrange(40, 650)
        d.ellipse((x, y, x + 2, y + 2), fill=(190, 222, 248, rng.randrange(55, 160)))
    # Blue light pool behind the refrigerator.
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow, "RGBA")
    gd.ellipse((290, 388, 700, 1015), fill=(44, 143, 255, 100))
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    im.alpha_composite(glow)
    return im


COURTYARD = courtyard_background()
FRIDGE_BG = fridge_background()


def draw_bench_group(im: Image.Image) -> None:
    d = ImageDraw.Draw(im, "RGBA")
    # Add a small paper cup and a bright soda ring on the bench for lived-in detail.
    d.rounded_rectangle((476, 832, 512, 861), radius=5, fill=(230, 216, 182, 255), outline=(28, 26, 40, 255), width=3)
    d.ellipse((483, 827, 505, 836), fill=(54, 45, 51, 255), outline=(28, 26, 40, 255), width=2)
    d.arc((541, 911, 577, 925), 0, 180, fill=(232, 194, 91, 255), width=4)


def draw_person(im: Image.Image, cx: float, floor: float, scale: float,
                kind: str, t: float, mouth: bool = False, gesture: str = "idle",
                can_label: bool = False, walking: bool = False) -> None:
    d = ImageDraw.Draw(im, "RGBA")
    bob = math.sin(t * 4.2 + cx * .02) * 2.2 * scale
    if mouth:
        bob += math.sin(t * 18) * 1.2 * scale
    x = float(cx)
    fy = float(floor + bob)
    head_cy = fy - 235 * scale
    outline = (22, 25, 40, 255)
    skin = (222, 166, 124, 255) if kind == "man" else (203, 145, 111, 255)
    shirt = (223, 142, 62, 255) if kind == "man" else ((65, 155, 142, 255) if kind == "friend" else (74, 112, 150, 255))
    pants = (41, 50, 76, 255)
    # Ground shadow.
    d.ellipse((x - 67 * scale, fy - 11 * scale, x + 69 * scale, fy + 6 * scale), fill=(4, 10, 18, 110))
    # Legs, with a walking cycle.
    stride = math.sin(t * 8.5 + (0 if kind == "man" else 1.5)) * 14 * scale if walking else 0
    hip_y = fy - 91 * scale
    for side in (-1, 1):
        lx = x + side * 19 * scale
        endx = lx + side * stride
        d.line((int(lx), int(hip_y), int(endx), int(fy - 24 * scale)), fill=outline, width=max(8, int(29 * scale)))
        d.line((int(lx), int(hip_y), int(endx), int(fy - 24 * scale)), fill=pants, width=max(5, int(20 * scale)))
        shoe_box = (endx - 25 * scale, fy - 31 * scale, endx + 15 * scale, fy - 10 * scale)
        d.rounded_rectangle(shoe_box, radius=max(4, int(8 * scale)), fill=(35, 35, 49, 255), outline=outline, width=max(2, int(3 * scale)))
        d.line((int(endx - 16 * scale), int(fy - 14 * scale), int(endx + 7 * scale), int(fy - 14 * scale)), fill=(214, 202, 171, 255), width=max(2, int(3 * scale)))
    # Torso.
    top = fy - 185 * scale
    torso_box = (x - 56 * scale, top, x + 56 * scale, fy - 72 * scale)
    d.rounded_rectangle(torso_box, radius=int(22 * scale), fill=shirt, outline=outline, width=max(3, int(5 * scale)))
    d.polygon([(x - 30 * scale, top + 8 * scale), (x + 4 * scale, top + 9 * scale),
               (x + 20 * scale, fy - 72 * scale), (x - 38 * scale, fy - 72 * scale)],
              fill=(255, 226, 155, 92))
    d.line((int(x - 1 * scale), int(top + 15 * scale), int(x + 2 * scale), int(fy - 80 * scale)),
           fill=(28, 35, 52, 130), width=max(2, int(3 * scale)))
    # Arms and gesture.
    shoulder_l = (x - 47 * scale, fy - 165 * scale)
    shoulder_r = (x + 47 * scale, fy - 165 * scale)
    if gesture == "point":
        hand_l = (x - 103 * scale, fy - 205 * scale)
        hand_r = (x + 87 * scale, fy - 119 * scale)
    elif gesture == "explain":
        hand_l = (x - 102 * scale, fy - 136 * scale)
        hand_r = (x + 104 * scale, fy - 147 * scale)
    elif gesture == "raise":
        hand_l = (x - 72 * scale, fy - 134 * scale)
        hand_r = (x + 88 * scale, fy - 226 * scale)
    else:
        hand_l = (x - 67 * scale, fy - 103 * scale)
        hand_r = (x + 64 * scale, fy - 103 * scale)
    for start, hand in ((shoulder_l, hand_l), (shoulder_r, hand_r)):
        d.line((int(start[0]), int(start[1]), int(hand[0]), int(hand[1])), fill=outline, width=max(7, int(18 * scale)))
        d.line((int(start[0]), int(start[1]), int(hand[0]), int(hand[1])), fill=shirt, width=max(4, int(11 * scale)))
        d.ellipse((hand[0] - 9 * scale, hand[1] - 9 * scale, hand[0] + 9 * scale, hand[1] + 9 * scale), fill=skin, outline=outline, width=max(2, int(3 * scale)))
    # Neck and face.
    d.rounded_rectangle((x - 20 * scale, head_cy + 35 * scale, x + 20 * scale, head_cy + 79 * scale), radius=int(8 * scale), fill=skin, outline=outline, width=max(2, int(3 * scale)))
    face_box = (x - 47 * scale, head_cy - 56 * scale, x + 47 * scale, head_cy + 60 * scale)
    d.ellipse(face_box, fill=skin, outline=outline, width=max(3, int(4 * scale)))
    # Ears, cheek, eyes, brows.
    d.ellipse((x - 55 * scale, head_cy - 5 * scale, x - 39 * scale, head_cy + 18 * scale), fill=skin, outline=outline, width=max(2, int(3 * scale)))
    d.ellipse((x + 39 * scale, head_cy - 5 * scale, x + 55 * scale, head_cy + 18 * scale), fill=skin, outline=outline, width=max(2, int(3 * scale)))
    for ex in (x - 18 * scale, x + 18 * scale):
        d.ellipse((ex - 4 * scale, head_cy - 10 * scale, ex + 4 * scale, head_cy + 1 * scale), fill=outline)
    d.line((int(x - 25 * scale), int(head_cy - 18 * scale), int(x - 9 * scale), int(head_cy - 22 * scale)), fill=outline, width=max(2, int(3 * scale)))
    d.line((int(x + 9 * scale), int(head_cy - 22 * scale), int(x + 25 * scale), int(head_cy - 18 * scale)), fill=outline, width=max(2, int(3 * scale)))
    if kind == "man":
        d.arc((x - 22 * scale, head_cy + 10 * scale, x + 25 * scale, head_cy + 48 * scale), 190, 345, fill=(69, 42, 36, 255), width=max(3, int(6 * scale)))
        d.ellipse((x - 28 * scale, head_cy + 25 * scale, x + 28 * scale, head_cy + 48 * scale), fill=(87, 51, 43, 255))
    # Mouth.
    if mouth:
        d.ellipse((x - 10 * scale, head_cy + 23 * scale, x + 10 * scale, head_cy + 41 * scale), fill=(72, 32, 38, 255))
        d.line((int(x - 7 * scale), int(head_cy + 28 * scale), int(x + 7 * scale), int(head_cy + 28 * scale)), fill=(246, 213, 186, 255), width=max(1, int(2 * scale)))
    else:
        d.arc((x - 12 * scale, head_cy + 22 * scale, x + 12 * scale, head_cy + 39 * scale), 5, 175, fill=(77, 37, 42, 255), width=max(2, int(3 * scale)))
    # Cap for the friends; large enough to read on a phone.
    if kind == "friend":
        cap_top = head_cy - 72 * scale
        d.polygon([(x - 48 * scale, cap_top + 34 * scale), (x - 35 * scale, cap_top),
                   (x + 37 * scale, cap_top), (x + 49 * scale, cap_top + 34 * scale)],
                  fill=(40, 88, 112, 255), outline=outline)
        d.ellipse((x - 62 * scale, cap_top + 25 * scale, x + 63 * scale, cap_top + 48 * scale),
                  fill=(34, 71, 93, 255), outline=outline, width=max(2, int(3 * scale)))
        badge = (x - 40 * scale, cap_top + 12 * scale, x + 40 * scale, cap_top + 32 * scale)
        d.rounded_rectangle(badge, radius=int(5 * scale), fill=(230, 223, 194, 255), outline=outline, width=max(1, int(2 * scale)))
        tag_font = font(10 * scale, True)
        centered_text(d, (int(x), int(cap_top + 21 * scale)), "#ЯКрутой", tag_font, (31, 42, 58, 255))
    # Main man's hidden/visible can. The label rotates into view after the friend points.
    if kind == "man":
        can_x = x - 68 * scale
        can_y = fy - 145 * scale
        d.line((int(x - 43 * scale), int(fy - 140 * scale), int(can_x), int(can_y + 4 * scale)), fill=outline, width=max(3, int(7 * scale)))
        d.rounded_rectangle((can_x - 17 * scale, can_y - 30 * scale, can_x + 17 * scale, can_y + 30 * scale), radius=int(5 * scale),
                            fill=(172, 42, 50, 255) if can_label else (73, 51, 56, 255), outline=outline, width=max(2, int(3 * scale)))
        d.ellipse((can_x - 16 * scale, can_y - 32 * scale, can_x + 16 * scale, can_y - 22 * scale), fill=(203, 209, 211, 255), outline=outline, width=max(1, int(2 * scale)))
        if can_label:
            centered_text(d, (int(can_x), int(can_y + 2 * scale)), "0", font(20 * scale, True), (255, 239, 221, 255))
    # Jacket cuffs and small pockets.
    d.rounded_rectangle((x - 34 * scale, fy - 127 * scale, x - 14 * scale, fy - 104 * scale), radius=4, fill=(250, 204, 112, 190))
    d.rounded_rectangle((x + 15 * scale, fy - 127 * scale, x + 35 * scale, fy - 104 * scale), radius=4, fill=(250, 204, 112, 190))


def draw_can(im: Image.Image, cx: float, floor: float, scale: float, t: float,
             speaking: bool = False, commander: bool = False) -> None:
    d = ImageDraw.Draw(im, "RGBA")
    bob = math.sin(t * 5.2 + cx * .03) * 4 * scale
    x, fy = float(cx), float(floor + bob)
    w, h = 61 * scale, 127 * scale
    top = fy - h
    outline = (20, 26, 39, 255)
    if commander:
        d.ellipse((x - 48 * scale, top - 24 * scale, x + 48 * scale, fy + 5 * scale), fill=(66, 183, 224, 35), outline=(97, 214, 229, 105), width=max(1, int(2 * scale)))
    # Tiny shadow, legs, arms.
    d.ellipse((x - 41 * scale, fy - 8 * scale, x + 42 * scale, fy + 6 * scale), fill=(3, 10, 20, 120))
    d.line((int(x - 13 * scale), int(fy - 20 * scale), int(x - 21 * scale), int(fy + 1 * scale)), fill=outline, width=max(4, int(8 * scale)))
    d.line((int(x + 13 * scale), int(fy - 20 * scale), int(x + 22 * scale), int(fy + 1 * scale)), fill=outline, width=max(4, int(8 * scale)))
    d.line((int(x - w / 2), int(top + 52 * scale), int(x - 43 * scale), int(top + 70 * scale)), fill=outline, width=max(4, int(8 * scale)))
    d.line((int(x + w / 2), int(top + 52 * scale), int(x + 43 * scale), int(top + 73 * scale)), fill=outline, width=max(4, int(8 * scale)))
    # Aluminum body, trim, label bands.
    d.rounded_rectangle((x - w / 2, top, x + w / 2, fy - 17 * scale), radius=int(13 * scale),
                        fill=(227, 229, 219, 255), outline=outline, width=max(3, int(4 * scale)))
    d.ellipse((x - w / 2 + 2 * scale, top - 4 * scale, x + w / 2 - 2 * scale, top + 10 * scale),
              fill=(176, 185, 190, 255), outline=outline, width=max(2, int(3 * scale)))
    d.rectangle((x - w / 2 + 2 * scale, top + 17 * scale, x + w / 2 - 2 * scale, top + 33 * scale), fill=(166, 26, 44, 255))
    d.rectangle((x - w / 2 + 2 * scale, fy - 39 * scale, x + w / 2 - 2 * scale, fy - 21 * scale), fill=(17, 45, 82, 255))
    d.ellipse((x - w / 2 + 3 * scale, fy - 26 * scale, x + w / 2 - 3 * scale, fy - 16 * scale), fill=(172, 180, 181, 255), outline=outline, width=max(1, int(2 * scale)))
    centered_text(d, (int(x), int(top + 47 * scale)), "БАЛТИКА", font(11 * scale, True), (87, 29, 40, 255))
    # Tiny cool-green pulse pictogram on the 0.0 can; no health claim is written.
    pulse_y = top + 103 * scale
    d.line((x - 19 * scale, pulse_y, x - 9 * scale, pulse_y, x - 5 * scale, pulse_y - 3 * scale,
            x, pulse_y + 3 * scale, x + 4 * scale, pulse_y - 2 * scale, x + 9 * scale, pulse_y,
            x + 19 * scale, pulse_y), fill=(51, 171, 157, 230), width=max(1, int(2 * scale)))
    centered_text(d, (int(x), int(top + 84 * scale)), "0", font(29 * scale, True), (178, 28, 48, 255))
    # Little expressive face.
    for ex in (x - 12 * scale, x + 12 * scale):
        d.ellipse((ex - 3 * scale, top + 57 * scale, ex + 3 * scale, top + 65 * scale), fill=outline)
    if speaking:
        d.ellipse((x - 6 * scale, top + 68 * scale, x + 6 * scale, top + 78 * scale), fill=(89, 30, 45, 255))
    else:
        d.arc((x - 7 * scale, top + 68 * scale, x + 7 * scale, top + 80 * scale), 5, 175, fill=(87, 33, 43, 255), width=max(1, int(2 * scale)))
    # Paper helmet and the protagonist's small gold stripe.
    d.polygon([(x - 30 * scale, top + 8 * scale), (x - 21 * scale, top - 11 * scale),
               (x + 8 * scale, top - 16 * scale), (x + 30 * scale, top + 4 * scale)],
              fill=(139, 158, 93, 255), outline=outline)
    d.line((int(x - 26 * scale), int(top + 5 * scale), int(x + 31 * scale), int(top + 5 * scale)), fill=(220, 206, 140, 255), width=max(2, int(3 * scale)))
    if commander:
        d.polygon([(x - 12 * scale, top + 29 * scale), (x + 12 * scale, top + 29 * scale),
                   (x + 19 * scale, top + 46 * scale), (x - 17 * scale, top + 46 * scale)], fill=(248, 192, 71, 255), outline=outline)
        centered_text(d, (int(x), int(top + 38 * scale)), "0", font(10 * scale, True), (34, 34, 40, 255))


def draw_van(im: Image.Image, x: float, y: float, scale: float = 1.0,
             door_open: bool = False, moving: bool = False, headlights: bool = False) -> None:
    d = ImageDraw.Draw(im, "RGBA")
    x, y = float(x), float(y)
    w, h = 500 * scale, 218 * scale
    outline = (17, 24, 39, 255)
    # Motion streaks and headlight glow.
    if moving:
        for i in range(5):
            yy = y + 40 * scale + i * 28 * scale
            d.line((x + 500 * scale + i * 12, yy, x + 575 * scale + i * 16, yy), fill=(184, 206, 225, 120), width=max(2, int(3 * scale)))
    if headlights:
        glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow, "RGBA")
        gd.polygon([(x + 5 * scale, y + 97 * scale), (x - 110 * scale, y + 60 * scale),
                    (x - 110 * scale, y + 151 * scale), (x + 8 * scale, y + 132 * scale)],
                   fill=(255, 228, 144, 70))
        glow = glow.filter(ImageFilter.GaussianBlur(15))
        im.alpha_composite(glow)
        d = ImageDraw.Draw(im, "RGBA")
    # Main cargo body and cab, front faces left.
    d.rounded_rectangle((x + 105 * scale, y + 23 * scale, x + 486 * scale, y + 188 * scale), radius=int(22 * scale),
                        fill=(223, 224, 212, 255), outline=outline, width=max(4, int(7 * scale)))
    d.polygon([(x + 13 * scale, y + 84 * scale), (x + 50 * scale, y + 35 * scale),
               (x + 151 * scale, y + 35 * scale), (x + 188 * scale, y + 91 * scale),
               (x + 188 * scale, y + 185 * scale), (x + 18 * scale, y + 185 * scale)],
              fill=(221, 224, 214, 255), outline=outline)
    # Windshield and window.
    d.polygon([(x + 48 * scale, y + 48 * scale), (x + 121 * scale, y + 48 * scale),
               (x + 145 * scale, y + 91 * scale), (x + 28 * scale, y + 91 * scale)],
              fill=(57, 101, 132, 255), outline=outline, width=max(2, int(4 * scale)))
    d.line((x + 87 * scale, y + 48 * scale, x + 87 * scale, y + 89 * scale), fill=(20, 35, 52, 255), width=max(2, int(3 * scale)))
    d.line((x + 24 * scale, y + 100 * scale, x + 170 * scale, y + 100 * scale), fill=(179, 186, 177, 255), width=max(3, int(5 * scale)))
    # Sliding door. The open cavity is deliberately a warm, cartoony interior.
    door = (x + 198 * scale, y + 41 * scale, x + 319 * scale, y + 169 * scale)
    if door_open:
        d.rounded_rectangle(door, radius=int(8 * scale), fill=(23, 34, 51, 255), outline=outline, width=max(3, int(5 * scale)))
        d.rectangle((x + 207 * scale, y + 50 * scale, x + 310 * scale, y + 159 * scale), fill=(95, 86, 75, 255))
        d.ellipse((x + 214 * scale, y + 65 * scale, x + 304 * scale, y + 153 * scale), fill=(255, 197, 91, 65))
        d.line((x + 325 * scale, y + 51 * scale, x + 325 * scale, y + 169 * scale), fill=(159, 171, 167, 255), width=max(3, int(6 * scale)))
        d.line((x + 193 * scale, y + 44 * scale, x + 193 * scale, y + 171 * scale), fill=(17, 24, 39, 255), width=max(2, int(4 * scale)))
    else:
        d.rounded_rectangle(door, radius=int(8 * scale), fill=(205, 210, 202, 255), outline=outline, width=max(2, int(4 * scale)))
        d.line((x + 210 * scale, y + 58 * scale, x + 310 * scale, y + 58 * scale), fill=(170, 177, 173, 255), width=max(2, int(3 * scale)))
        d.rounded_rectangle((x + 297 * scale, y + 99 * scale, x + 307 * scale, y + 120 * scale), radius=4, fill=(69, 78, 84, 255))
    # Parody sign, no real insignia.
    d.rounded_rectangle((x + 337 * scale, y + 54 * scale, x + 470 * scale, y + 150 * scale), radius=int(12 * scale),
                        fill=(23, 47, 70, 255), outline=(240, 192, 86, 255), width=max(2, int(4 * scale)))
    centered_text(d, (int(x + 403 * scale), int(y + 82 * scale)), "ТЦК", font(30 * scale, True), (255, 211, 105, 255))
    centered_text(d, (int(x + 403 * scale), int(y + 115 * scale)), "ЦЕНТР КЕГЛЕЙ", font(11 * scale, True), (243, 240, 220, 255))
    centered_text(d, (int(x + 403 * scale), int(y + 135 * scale)), "МЕМНАЯ ВЕРСИЯ", font(8 * scale, True), (130, 222, 211, 255))
    # Bumpers, lights and wheels.
    d.rounded_rectangle((x + 2 * scale, y + 151 * scale, x + 22 * scale, y + 174 * scale), radius=5, fill=(247, 220, 153, 255), outline=outline, width=2)
    d.rounded_rectangle((x + 475 * scale, y + 148 * scale, x + 495 * scale, y + 169 * scale), radius=5, fill=(214, 83, 87, 255), outline=outline, width=2)
    d.rounded_rectangle((x - 2 * scale, y + 178 * scale, x + 505 * scale, y + 199 * scale), radius=8, fill=(143, 151, 151, 255), outline=outline, width=max(2, int(4 * scale)))
    for wx in (x + 103 * scale, x + 396 * scale):
        d.ellipse((wx - 42 * scale, y + 164 * scale, wx + 42 * scale, y + 245 * scale), fill=(17, 19, 29, 255), outline=outline, width=max(3, int(5 * scale)))
        d.ellipse((wx - 22 * scale, y + 184 * scale, wx + 22 * scale, y + 227 * scale), fill=(144, 155, 158, 255), outline=(29, 34, 45, 255), width=max(3, int(4 * scale)))
        d.ellipse((wx - 8 * scale, y + 197 * scale, wx + 8 * scale, y + 213 * scale), fill=(48, 55, 62, 255))
    # Small plate.
    d.rounded_rectangle((x + 21 * scale, y + 159 * scale, x + 83 * scale, y + 177 * scale), radius=3, fill=(247, 234, 193, 255), outline=outline, width=2)
    centered_text(d, (int(x + 52 * scale), int(y + 168 * scale)), "0.0", font(10 * scale, True), (35, 43, 51, 255))


def draw_radio(im: Image.Image, t: float) -> None:
    d = ImageDraw.Draw(im, "RGBA")
    d.rounded_rectangle((40, 845, 195, 974), radius=18, fill=(31, 41, 59, 255), outline=(9, 15, 27, 255), width=6)
    d.rounded_rectangle((56, 862, 179, 926), radius=11, fill=(53, 129, 142, 255), outline=(6, 18, 30, 255), width=3)
    centered_text(d, (117, 893), "ДРУГ", font(20, True), (246, 236, 209, 255))
    d.ellipse((67, 938, 91, 962), fill=(219, 164, 69, 255), outline=(8, 16, 28, 255), width=3)
    d.ellipse((146, 938, 170, 962), fill=(219, 164, 69, 255), outline=(8, 16, 28, 255), width=3)
    d.line((155, 861, 174, 830), fill=(15, 21, 33, 255), width=5)
    d.arc((52, 852, 185, 952), int(225 + 20 * math.sin(t * 5)), int(300 + 20 * math.sin(t * 5)), fill=(156, 238, 231, 180), width=3)


def draw_fridge(im: Image.Image, t: float, open_at: float) -> None:
    d = ImageDraw.Draw(im, "RGBA")
    x, y, w, h = 426, 429, 211, 481
    progress = smooth(open_at, open_at + 1.7, t)
    # Glow behind the door grows as it opens.
    if progress > 0:
        glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow, "RGBA")
        gd.ellipse((x - 115, y - 10, x + w + 118, y + h + 100), fill=(96, 203, 255, int(38 + 110 * progress)))
        glow = glow.filter(ImageFilter.GaussianBlur(50))
        im.alpha_composite(glow)
        d = ImageDraw.Draw(im, "RGBA")
    # Body and compressor feet.
    d.rounded_rectangle((x, y, x + w, y + h), radius=24, fill=(193, 211, 220, 255), outline=(13, 25, 44, 255), width=8)
    d.rounded_rectangle((x + 20, y + 24, x + w - 20, y + 267), radius=13, fill=(150, 180, 197, 255), outline=(50, 76, 101, 255), width=4)
    d.rectangle((x + 22, y + 280, x + w - 22, y + h - 18), fill=(127, 160, 181, 255), outline=(50, 76, 101, 255), width=4)
    # Door swings in a very stylized flat animation.
    door_w = int((w - 34) * (1 - .34 * progress))
    door_x = int(x + 18 + (w - 28) * progress)
    if progress < .94:
        d.rounded_rectangle((door_x, y + 22, door_x + door_w, y + h - 18), radius=13,
                            fill=(185, 204, 217, 255), outline=(39, 69, 96, 255), width=5)
        d.line((door_x + door_w - 20, y + 68, door_x + door_w - 20, y + 160), fill=(50, 76, 99, 255), width=8)
        d.line((door_x + door_w - 20, y + 315, door_x + door_w - 20, y + 378), fill=(50, 76, 99, 255), width=8)
    # Cold light from inside.
    d.rounded_rectangle((x + 36, y + 49, x + w - 34, y + h - 35), radius=10,
                        fill=(93, 202, 255, int(18 + 115 * progress)))
    for yy in (y + 163, y + 279, y + 368):
        d.line((x + 40, yy, x + w - 40, yy), fill=(231, 247, 255, int(45 + 150 * progress)), width=5)
    d.rounded_rectangle((x + 55, y + 12, x + w - 55, y + 51), radius=10, fill=(36, 54, 78, 255), outline=(12, 23, 39, 255), width=3)
    centered_text(d, (x + w // 2, y + 31), "0.0", font(18, True), (232, 239, 224, 255))
    # Frost particles drift out.
    if progress > .2:
        for i in range(18):
            u = (t * 0.27 + i * .143) % 1
            px = x - 30 - int(u * 95) + int(8 * math.sin(t * 3 + i))
            py = y + 50 + ((i * 41 + int(t * 75)) % 360)
            r = 2 + (i % 3)
            d.ellipse((px - r, py - r, px + r, py + r), fill=(221, 246, 255, int(80 + 150 * progress)))


def draw_map(im: Image.Image, t: float) -> None:
    d = ImageDraw.Draw(im, "RGBA")
    d.rounded_rectangle((276, 319, 662, 561), radius=20, fill=(14, 27, 45, 240), outline=(210, 177, 105, 255), width=4)
    d.text((302, 337), "МАРШРУТ 0.0", font=font(20, True), fill=(251, 211, 123, 255))
    # Map grid.
    for x in range(298, 648, 42):
        d.line((x, 371, x, 533), fill=(87, 121, 147, 95), width=1)
    for y in range(380, 534, 37):
        d.line((298, y, 648, y), fill=(87, 121, 147, 95), width=1)
    route = [(318, 510), (352, 480), (402, 489), (443, 446), (482, 458), (532, 405), (605, 411)]
    d.line(route, fill=(241, 174, 69, 255), width=6, joint="curve")
    for i, (x, y) in enumerate(route[:-1]):
        d.ellipse((x - 5, y - 5, x + 5, y + 5), fill=(249, 225, 169, 255))
    pulse = 4 + int(4 * (0.5 + .5 * math.sin(t * 6)))
    d.ellipse((600 - pulse, 406 - pulse, 600 + pulse, 416 + pulse), fill=(111, 221, 242, 240))
    # Fridge icon at the destination.
    d.rounded_rectangle((612, 390, 638, 435), radius=4, fill=(184, 211, 220, 255), outline=(18, 30, 46, 255), width=2)
    d.line((631, 397, 631, 408), fill=(28, 50, 66, 255), width=2)
    d.line((631, 416, 631, 426), fill=(28, 50, 66, 255), width=2)


def draw_hologram_map(im: Image.Image, t: float) -> None:
    """A little floating fridge-route card for the exposition beat."""
    d = ImageDraw.Draw(im, "RGBA")
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow, "RGBA")
    gd.rounded_rectangle((248, 411, 471, 562), radius=20, fill=(44, 189, 221, 58))
    im.alpha_composite(glow.filter(ImageFilter.GaussianBlur(16)))
    d = ImageDraw.Draw(im, "RGBA")
    d.rounded_rectangle((250, 414, 469, 556), radius=16, fill=(10, 25, 44, 220), outline=(112, 221, 226, 235), width=3)
    d.text((268, 428), "МАРШРУТ 0.0", font=font(15, True), fill=(251, 211, 123, 255))
    d.line((276, 512, 318, 487, 352, 500, 389, 468, 430, 476), fill=(246, 180, 74, 255), width=4, joint="curve")
    for x, y in ((276, 512), (318, 487), (352, 500), (389, 468)):
        d.ellipse((x - 4, y - 4, x + 4, y + 4), fill=(255, 233, 177, 255))
    d.rounded_rectangle((420, 448, 447, 502), radius=5, fill=(188, 215, 222, 255), outline=(21, 39, 59, 255), width=3)
    d.line((440, 458, 440, 472), fill=(45, 67, 84, 255), width=3)
    d.line((440, 482, 440, 493), fill=(45, 67, 84, 255), width=3)
    pulse = int(3 + 2 * (0.5 + 0.5 * math.sin(t * 8)))
    d.ellipse((430 - pulse, 473 - pulse, 430 + pulse, 479 + pulse), fill=(101, 232, 238, 255))


def draw_top_tag(im: Image.Image, title: str = "") -> None:
    d = ImageDraw.Draw(im, "RGBA")
    d.rounded_rectangle((25, 24, 374, 65), radius=20, fill=(9, 14, 30, 202), outline=(233, 190, 92, 210), width=2)
    d.text((43, 33), "МЕМНАЯ ВЫДУМКА · НЕ РЕПОРТАЖ", font=font(13, True), fill=(249, 222, 158, 255))
    if title:
        d.rounded_rectangle((390, 24, 694, 65), radius=20, fill=(24, 38, 63, 205), outline=(107, 210, 216, 190), width=2)
        centered_text(d, (542, 44), title, font(15, True), (230, 245, 231, 255))


def draw_caption(im: Image.Image, event: dict[str, Any] | None) -> None:
    if not event:
        return
    d = ImageDraw.Draw(im, "RGBA")
    x0, y0, x1, y1 = 26, 1030, W - 26, 1211
    d.rounded_rectangle((x0, y0, x1, y1), radius=25, fill=(7, 12, 25, 224), outline=(224, 188, 105, 245), width=3)
    who = event["speaker"]
    color = {"МУЖИК": (250, 176, 98, 255), "ДРУГ": (118, 227, 216, 255), "БАЛТИКА 0": (255, 208, 92, 255)}.get(who, CREAM)
    d.text((50, 1043), who, font=font(18, True), fill=color)
    fnt = font(27, True)
    lines = wrap_by_width(d, event["text"], fnt, x1 - x0 - 50)
    if len(lines) > 2:
        fnt = font(23, True)
        lines = wrap_by_width(d, event["text"], fnt, x1 - x0 - 50)
    for i, line in enumerate(lines[:3]):
        d.text((50, 1075 + i * 39), line, font=fnt, fill=CREAM, stroke_width=1, stroke_fill=(5, 9, 18, 255))


def draw_title_card(t: float, end_start: float, duration: float) -> Image.Image:
    im = FRIDGE_BG.copy()
    d = ImageDraw.Draw(im, "RGBA")
    pulse = 0.5 + 0.5 * math.sin(t * 2.4)
    d.rounded_rectangle((38, 270, W - 38, 1000), radius=42,
                        fill=(7, 14, 29, 218), outline=(235, 195, 108, 245), width=5)
    centered_text(d, (W // 2, 355), "ПОХОЖДЕНИЯ", font(47, True), (246, 236, 210, 255), 2, (18, 27, 42, 255))
    centered_text(d, (W // 2, 432), "БАЛТИКИ 0", font(62, True), (255, 199, 72, 255), 3, (52, 29, 43, 255))
    d.rounded_rectangle((178, 477, 542, 535), radius=23, fill=(60, 111, 145, 230), outline=(158, 226, 235, 240), width=3)
    centered_text(d, (W // 2, 506), "ПРОЛОГ", font(26, True), (245, 246, 229, 255))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow, "RGBA")
    gd.ellipse((260, 540, 460, 825), fill=(75, 198, 233, 72))
    im.alpha_composite(glow.filter(ImageFilter.GaussianBlur(25)))
    draw_can(im, W // 2, 793, .84, t, speaking=False, commander=True)
    d = ImageDraw.Draw(im, "RGBA")
    centered_text(d, (W // 2, 866), "ПРОДОЛЖЕНИЕ СЛЕДУЕТ", font(24, True), (236, 242, 228, 255))
    d.ellipse((W // 2 - 5, 908 - int(8 * pulse), W // 2 + 5, 916 + int(8 * pulse)), fill=(119, 224, 244, 235))
    d.rounded_rectangle((171, 948, 549, 987), radius=17, fill=(9, 15, 30, 220), outline=(228, 191, 101, 200), width=2)
    centered_text(d, (W // 2, 967), "МЕМНАЯ ВЫДУМКА · НЕ РЕПОРТАЖ", font(13, True), (246, 223, 164, 255))
    return im


def make_clip_audio(path: Path) -> np.ndarray:
    cmd = [FFMPEG, "-v", "error", "-i", str(path), "-f", "f32le", "-acodec", "pcm_f32le", "-ar", str(SR), "-ac", "1", "pipe:1"]
    raw = subprocess.check_output(cmd)
    data = np.frombuffer(raw, dtype="<f4").copy()
    if not len(data):
        raise RuntimeError(f"Empty dialogue clip: {path}")
    peak = float(np.max(np.abs(data)))
    if peak > 1e-6:
        data *= min(1.0, 0.76 / peak)
    fade_in = min(int(.012 * SR), len(data) // 3)
    fade_out = min(int(.045 * SR), len(data) // 3)
    if fade_in:
        data[:fade_in] *= np.linspace(0, 1, fade_in, dtype=np.float32)
    if fade_out:
        data[-fade_out:] *= np.linspace(1, 0, fade_out, dtype=np.float32)
    return data


def assemble_dialogue() -> tuple[np.ndarray, list[dict[str, Any]], float]:
    sequence = [
        ("friend-question.mp3", "ДРУГ", "Чего ищешь?", .00),
        ("protagonist-question.mp3", "МУЖИК", "Народ, мою «Балтику ноль» безалкогольную никто не видел?", .14),
        ("friend-points-can.mp3", "ДРУГ", "Ты её в руке держишь.", .18),
        ("man-cold-can.mp3", "МУЖИК", "Это другая. Моя была холодная.", .20),
        ("can-commander-intro.mp3", "БАЛТИКА 0", "ТЦК — Территориальный центр кеглей. Гражданин, пройдёмте: ваша Балтика найдена.", 2.35),
        ("man-not-lost.mp3", "МУЖИК", "Я не терялся! Я вообще-то про банку.", .20),
        ("can-self-intro.mp3", "БАЛТИКА 0", "Я — Балтика ноль. Не теряюсь, только охлаждаюсь.", .17),
        ("can-fridge-missing.mp3", "БАЛТИКА 0", "А холодильник пропал. В нём исчезла целая полка «Балтики ноль».", .55),
        ("friend-where.mp3", "ДРУГ", "И вы куда?", .20),
        ("can-expedition.mp3", "БАЛТИКА 0", "За самым холодным холодильником. Вы с нами?", .18),
        ("man-agree.mp3", "МУЖИК", "Я согласен. Но можно без драматизма?", .22),
        ("can-music.mp3", "БАЛТИКА 0", "Нельзя. Музыка уже пошла.", .18),
        ("man-where-to.mp3", "МУЖИК", "Куда едем?", 5.30),
        ("can-goal.mp3", "БАЛТИКА 0", "Туда, где исчезла полка «Балтики ноль».", .22),
        ("man-where-my-can.mp3", "МУЖИК", "А моя-то где?", 4.30),
        ("friend-points-can.mp3", "ДРУГ · РАЦИЯ", "Ты её в руке держишь!", .22),
        ("can-loop.mp3", "БАЛТИКА 0", "По второму кругу?", .32),
    ]
    cursor = 1.65
    chunks: list[tuple[int, np.ndarray]] = []
    events: list[dict[str, Any]] = []
    for filename, speaker, text, gap in sequence:
        cursor += gap
        samples = make_clip_audio(AUDIO / filename)
        start = cursor
        end = start + len(samples) / SR
        chunks.append((int(round(start * SR)), samples))
        events.append({"start": start, "end": end, "speaker": speaker, "text": text, "file": filename})
        cursor = end
    tail = 7.0
    duration = cursor + tail
    voice = np.zeros(int(math.ceil(duration * SR)), dtype=np.float32)
    for start, samples in chunks:
        stop = min(len(voice), start + len(samples))
        voice[start:stop] += samples[:stop - start]
    return voice, events, duration


def add_audio(dst: np.ndarray, source: np.ndarray, start: float, gain: float = 1.0) -> None:
    i = max(0, int(start * SR))
    if i >= len(dst):
        return
    n = min(len(source), len(dst) - i)
    if n > 0:
        dst[i:i + n] += source[:n] * gain


def synth_hit(kind: str, duration: float, seed: int = 1) -> np.ndarray:
    n = max(1, int(duration * SR))
    t = np.arange(n, dtype=np.float32) / SR
    rng = np.random.default_rng(seed)
    if kind == "engine":
        freq = 54 + 12 * np.sin(2 * np.pi * .9 * t) + 10 * np.sin(2 * np.pi * .23 * t)
        phase = 2 * np.pi * np.cumsum(freq) / SR
        noise = rng.standard_normal(n).astype(np.float32)
        env = np.clip(t / .22, 0, 1) * np.clip((duration - t) / .35, 0, 1)
        x = (.31 * np.sin(phase) + .14 * np.sin(2 * phase) + .05 * noise) * env
        return x.astype(np.float32)
    if kind == "door":
        freq = np.linspace(210, 540, n, dtype=np.float32) * (1 + .05 * np.sin(2 * np.pi * 7 * t))
        phase = 2 * np.pi * np.cumsum(freq) / SR
        noise = rng.standard_normal(n).astype(np.float32)
        env = np.sin(np.clip(t / duration, 0, 1) * np.pi) ** 1.3
        return ((.19 * np.sin(phase) + .03 * noise) * env).astype(np.float32)
    if kind == "pop":
        noise = rng.standard_normal(n).astype(np.float32)
        env = np.exp(-t * 33)
        return ((.21 * noise + .35 * np.sin(2 * np.pi * (155 - 68 * t) * t)) * env).astype(np.float32)
    if kind == "reverse":
        env = np.ones(n, dtype=np.float32) * .25
        beat = max(1, int(.22 * SR))
        env[(np.arange(n) % beat) > int(.105 * SR)] = 0
        return (.20 * np.sin(2 * np.pi * 900 * t) * env).astype(np.float32)
    if kind == "ice":
        env = np.exp(-t * 4.5)
        x = (np.sin(2 * np.pi * 1046.5 * t) + .64 * np.sin(2 * np.pi * 1568 * t) + .33 * np.sin(2 * np.pi * 2093 * t))
        return (.18 * x * env).astype(np.float32)
    if kind == "thump":
        env = np.exp(-t * 10)
        f = 90 - 38 * np.clip(t / max(duration, .001), 0, 1)
        phase = 2 * np.pi * np.cumsum(f) / SR
        return (.32 * np.sin(phase) * env).astype(np.float32)
    return np.zeros(n, dtype=np.float32)


def make_original_score(duration: float) -> np.ndarray:
    n = int(math.ceil(duration * SR))
    score = np.zeros(n, dtype=np.float32)
    bpm = 100.0
    beat = 60.0 / bpm
    bar = beat * 4
    bass_roots = [55.0, 65.41, 73.42, 58.27]  # G, C, D, Bb
    chord_steps = [(1.0, 1.0), (1.0, 1.0), (1.0, 1.0), (1.0, 1.0)]
    rng = np.random.default_rng(17)

    def put_tone(start: float, freq: float, length: float, amp: float, shape: str = "pluck") -> None:
        i = int(start * SR)
        m = min(int(length * SR), n - i)
        if m <= 0:
            return
        tt = np.arange(m, dtype=np.float32) / SR
        if shape == "pad":
            env = np.minimum(1.0, tt / .25) * np.minimum(1.0, (length - tt) / .3)
            wavev = np.sin(2 * np.pi * freq * tt) + .28 * np.sin(2 * np.pi * freq * 2 * tt)
            score[i:i + m] += amp * env * wavev
        elif shape == "bass":
            env = np.exp(-tt * 2.1) * np.minimum(1.0, tt / .008)
            phase = 2 * np.pi * (freq * tt - 8 * tt * tt)
            score[i:i + m] += amp * env * (np.sin(phase) + .23 * np.sin(2 * phase))
        else:
            env = np.exp(-tt * 5.2) * np.minimum(1.0, tt / .005)
            wavev = np.sin(2 * np.pi * freq * tt) + .33 * np.sin(2 * np.pi * 2.01 * freq * tt) + .12 * np.sin(2 * np.pi * 3.97 * freq * tt)
            score[i:i + m] += amp * env * wavev

    bars = int(math.ceil(duration / bar)) + 1
    for b in range(bars):
        t0 = b * bar
        chord = b % 4
        root = bass_roots[chord]
        # Gentle original synth chord, no borrowed melody.
        for semitone in (0, 3, 7):
            freq = root * (2 ** (semitone / 12)) * 4
            put_tone(t0, freq, bar * .92, .025, "pad")
        for beat_i in range(4):
            bt = t0 + beat_i * beat
            if bt >= duration:
                break
            put_tone(bt, root * (1.0 if beat_i in (0, 2) else 1.5), .38, .105 if beat_i in (0, 2) else .045, "bass")
            # Soft clap on the backbeat.
            if beat_i in (1, 3):
                i = int(bt * SR)
                m = min(int(.12 * SR), n - i)
                if m > 0:
                    tt = np.arange(m, dtype=np.float32) / SR
                    noise = rng.standard_normal(m).astype(np.float32)
                    env = np.exp(-tt * 29)
                    score[i:i + m] += noise * env * .022
            # Closed-hat ticks on subdivisions.
            for sub in (0.0, .5):
                ht = bt + sub * beat
                i = int(ht * SR)
                m = min(int(.045 * SR), n - i)
                if m > 0:
                    tt = np.arange(m, dtype=np.float32) / SR
                    noise = rng.standard_normal(m).astype(np.float32)
                    score[i:i + m] += noise * np.exp(-tt * 95) * .014
        # Sparse, slightly goofy plucks.
        note_seq = [1.0, 1.25, 1.5, 1.25, 1.75, 1.5, 1.25, 1.0]
        for k, pos in enumerate((.5, 1.5, 2.25, 3.5)):
            nt = t0 + pos * beat
            if nt < duration:
                freq = 293.66 * note_seq[(b * 2 + k) % len(note_seq)]
                put_tone(nt, freq, .42, .036, "pluck")
    # Gentle fade and normalize to a low bed level.
    fade_n = int(.35 * SR)
    if fade_n:
        score[:fade_n] *= np.linspace(0, 1, fade_n, dtype=np.float32)
        score[-fade_n:] *= np.linspace(1, 0, fade_n, dtype=np.float32)
    peak = float(np.max(np.abs(score)))
    if peak > 1e-6:
        score *= .25 / peak
    return score


def write_wav(path: Path, data: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    clipped = np.clip(data, -1, 1)
    pcm = (clipped * 32767).astype("<i2")
    with wave.open(str(path), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes(pcm.tobytes())


def build_audio() -> tuple[list[dict[str, Any]], float, Path]:
    voice, events, duration = assemble_dialogue()
    score = make_original_score(duration)
    effects = np.zeros_like(voice)
    by_file = {e["file"]: e for e in events}
    can_intro = by_file["can-commander-intro.mp3"]
    can_music = by_file["can-music.mp3"]
    man_where = by_file["man-where-to.mp3"]
    man_arrives = by_file["man-where-my-can.mp3"]
    can_goal = by_file["can-goal.mp3"]
    can_loop = by_file["can-loop.mp3"]
    arrival_start = max(0, can_intro["start"] - 2.4)
    add_audio(effects, synth_hit("engine", 2.25, 2), arrival_start, .75)
    add_audio(effects, synth_hit("door", .82, 3), can_intro["start"] - .15, .65)
    for i, dt in enumerate((.70, 1.25, 1.80)):
        add_audio(effects, synth_hit("pop", .20, 10 + i), can_intro["start"] + dt, .52)
    leave_start = can_music["end"] + .25
    add_audio(effects, synth_hit("engine", 2.2, 22), leave_start, .72)
    destination_start = max(can_goal["end"] + .25, man_arrives["start"] - 3.9)
    add_audio(effects, synth_hit("engine", 1.8, 24), destination_start - .3, .53)
    add_audio(effects, synth_hit("reverse", 1.3, 25), destination_start + .3, .22)
    fridge_open = can_loop["start"] - .2
    add_audio(effects, synth_hit("ice", 2.6, 26), fridge_open, .55)
    add_audio(effects, synth_hit("thump", .65, 27), fridge_open + .1, .60)
    # Duck the original score beneath every line; lift it slightly in action gaps.
    gain = np.full(len(score), .67, dtype=np.float32)
    for ev in events:
        a = max(0, int((ev["start"] - .12) * SR))
        b = min(len(gain), int((ev["end"] + .12) * SR))
        if b > a:
            gain[a:b] = .26
    mixed = voice * .92 + score * gain + effects
    mixed = np.tanh(mixed * 1.08).astype(np.float32)
    peak = float(np.max(np.abs(mixed)))
    if peak > .96:
        mixed *= .96 / peak
    write_wav(ASSET_DIALOGUE, voice)
    write_wav(ASSET_SCORE, score)
    mix_path = BUILD / "mix.wav"
    write_wav(mix_path, mixed)
    return events, duration, mix_path


def draw_speech_burst(im: Image.Image, x: int, y: int, text: str, color: tuple[int, int, int, int] = GOLD) -> None:
    d = ImageDraw.Draw(im, "RGBA")
    fnt = font(20, True)
    lines = wrap_by_width(d, text, fnt, 300)
    h = 26 + len(lines) * 28
    box = (x - 157, y - h - 18, x + 157, y)
    d.rounded_rectangle(box, radius=18, fill=(8, 14, 27, 220), outline=color, width=3)
    for i, line in enumerate(lines):
        centered_text(d, (x, int(box[1] + 18 + i * 27)), line, fnt, (248, 244, 230, 255))
    d.polygon([(x - 10, y - 2), (x + 6, y - 2), (x - 3, y + 17)], fill=(8, 14, 27, 220))


def current_event(t: float, events: list[dict[str, Any]]) -> dict[str, Any] | None:
    for e in events:
        if e["start"] <= t <= e["end"]:
            return e
    return None


def render_frame(t: float, events: list[dict[str, Any]], duration: float) -> Image.Image:
    e_by = {e["file"]: e for e in events}
    can_intro = e_by["can-commander-intro.mp3"]
    can_music = e_by["can-music.mp3"]
    man_where = e_by["man-where-to.mp3"]
    can_goal = e_by["can-goal.mp3"]
    man_arrives = e_by["man-where-my-can.mp3"]
    can_loop = e_by["can-loop.mp3"]
    title_start = events[-1]["end"] + .4
    if t >= title_start:
        return draw_title_card(t, title_start, duration).convert("RGB")

    arrival_start = max(0, can_intro["start"] - 2.4)
    departure = can_music["end"] + .25
    travel_start = departure + 2.15
    travel_end = man_where["start"]
    fridge_start = max(can_goal["end"] + .2, man_arrives["start"] - 3.9)
    fridge_open = can_loop["start"] - .2
    ev = current_event(t, events)
    speaking = ev["speaker"] if ev else ""

    if t < travel_start:
        im = COURTYARD.copy()
        draw_bench_group(im)
        # Gazelle arrival, door reveal, departure.
        if arrival_start <= t <= departure + 2.15:
            arrive_u = smooth(arrival_start, can_intro["start"] + .15, t)
            if t < departure:
                van_x = lerp(835, 100, arrive_u)
                door_open = t >= can_intro["start"] - .1 and t < departure - .12
                moving = t < can_intro["start"]
            else:
                leave_u = smooth(departure, departure + 2.15, t)
                van_x = lerp(100, -600, leave_u)
                door_open = False
                moving = True
            draw_van(im, van_x, 674, .78, door_open, moving, t < can_intro["start"] or t >= departure)
        else:
            van_x = -600
        # The friends sit visually at the bench; the active one points to the can.
        friend_gesture = "point" if speaking == "ДРУГ" and ev and ev["file"] in ("friend-points-can.mp3",) else "idle"
        draw_person(im, 158, 985, .84, "friend", t, mouth=speaking == "ДРУГ", gesture=friend_gesture)
        draw_person(im, 625, 985, .82, "friend", t + 1.2, mouth=False, gesture="idle")
        main_visible = t < departure - .12
        if main_visible:
            if t < can_intro["start"]:
                main_x = lerp(30, 360, smooth(0.2, 3.0, t))
            elif t < can_music["start"]:
                main_x = 360
            else:
                # He actually boards through the open side door before the Gazelle leaves.
                main_x = lerp(360, 306, smooth(can_music["start"], departure - .12, t))
            gesture = "raise" if speaking == "МУЖИК" and ev and ev["file"] in ("man-not-lost.mp3", "man-agree.mp3") else "explain" if speaking == "МУЖИК" else "idle"
            can_label = t >= e_by["friend-points-can.mp3"]["start"]
            draw_person(im, main_x, 985, .98, "man", t, mouth=speaking == "МУЖИК", gesture=gesture, can_label=can_label, walking=(t < 3.0 or (can_music["start"] < t < departure - .12)))
        # Three personified cans leave the Gazelle in a tidy little parade.
        if can_intro["start"] - .1 <= t < departure + .25:
            u = smooth(can_intro["start"] - .1, can_intro["start"] + 2.4, t)
            base_x = lerp(500, 610, u)
            for i in range(3):
                cx = base_x - i * 65 - (u * 95)
                floor = 927 - i * 4
                draw_can(im, cx, floor, .70 if i else 1.08, t + i * .3, speaking == "БАЛТИКА 0" and i == 0, commander=(i == 0))
        exposition = e_by["can-fridge-missing.mp3"]["start"] <= t <= e_by["can-expedition.mp3"]["end"]
        if exposition:
            draw_hologram_map(im, t)
        draw_top_tag(im, "ПРОЛОГ")
        # Silent intertitle on the van's first escape.
        if departure <= t <= departure + 2.1:
            alpha = int(245 * (1 - smooth(departure + 1.7, departure + 2.1, t)))
            d = ImageDraw.Draw(im, "RGBA")
            d.rounded_rectangle((78, 191, 642, 273), radius=26, fill=(6, 12, 25, alpha), outline=(235, 188, 81, alpha), width=3)
            centered_text(d, (W // 2, 233), "НО ЭТО НЕ КОНЕЦ…", font(35, True), (255, 215, 110, alpha), 2, (20, 28, 44, alpha))
    elif t < fridge_start:
        im = road_background(t)
        # A cutaway, movie-style van cabin, with the map held up between seats.
        d = ImageDraw.Draw(im, "RGBA")
        d.rounded_rectangle((26, 110, W - 26, 990), radius=46, fill=(19, 30, 48, 210), outline=(219, 192, 129, 220), width=5)
        d.polygon([(42, 150), (678, 150), (635, 560), (86, 560)], fill=(32, 53, 76, 245), outline=(7, 15, 28, 255))
        d.line((360, 153, 360, 559), fill=(8, 17, 31, 255), width=8)
        # Moving lights through the windshield.
        for i in range(5):
            x = int((i * 173 + t * 155) % 800) - 40
            d.ellipse((x, 260 + (i % 2) * 70, x + 36, 280 + (i % 2) * 70), fill=(255, 205, 112, 150))
        # Seats and dashboard.
        d.rounded_rectangle((79, 560, 642, 802), radius=52, fill=(32, 39, 54, 255), outline=(8, 14, 26, 255), width=6)
        d.rounded_rectangle((87, 735, 638, 830), radius=35, fill=(74, 92, 102, 255), outline=(8, 14, 26, 255), width=5)
        draw_map(im, t)
        draw_person(im, 270, 967, .83, "man", t, mouth=speaking == "МУЖИК", gesture="explain" if speaking == "МУЖИК" else "idle", can_label=True)
        draw_can(im, 491, 954, 1.20, t, speaking == "БАЛТИКА 0", commander=True)
        draw_radio(im, t)
        draw_top_tag(im, "ЭКСПЕДИЦИЯ 0.0")
    else:
        im = FRIDGE_BG.copy()
        # Fridge compound is visible while the van approaches and parks at left.
        if t < fridge_start + 2.1:
            vx = lerp(-540, 23, smooth(fridge_start - .25, fridge_start + 2.4, t))
        else:
            vx = 23
        draw_van(im, vx, 703, .64, door_open=t > fridge_start + 1.9, moving=t < fridge_start + 2.4, headlights=True)
        draw_fridge(im, t, fridge_open)
        # Hero and companion approach the glowing door.
        if t >= fridge_start + .8:
            main_x = lerp(245, 278, smooth(fridge_start + .8, fridge_start + 2.1, t))
            draw_person(im, main_x, 985, .93, "man", t, mouth=speaking == "МУЖИК", gesture="raise" if speaking == "МУЖИК" else "idle", can_label=True)
            draw_can(im, 391, 951, 1.16, t, speaking == "БАЛТИКА 0", commander=True)
            draw_can(im, 550, 956, .73, t + 1, False, False)
        # The friend is now a little radio voice in the cabin.
        draw_radio(im, t)
        draw_top_tag(im, "СЕКТОР 0.0")
        if fridge_open <= t < title_start:
            d = ImageDraw.Draw(im, "RGBA")
            pulse = 0.5 + 0.5 * math.sin(t * 11)
            centered_text(d, (W // 2, 315), "НЕИЗВЕСТНЫЙ ХОЛОДИЛЬНИК", font(21, True), (183, 233, 255, int(180 + 60 * pulse)), 1, (9, 17, 32, 255))
    draw_caption(im, ev)
    return im.convert("RGB")


def render_video(events: list[dict[str, Any]], duration: float, mix_path: Path) -> None:
    nframes = int(math.ceil(duration * FPS))
    silent_path = BUILD / "silent.mp4"
    cmd = [FFMPEG, "-y", "-hide_banner", "-loglevel", "error",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "pipe:0",
           "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "21", "-pix_fmt", "yuv420p",
           "-movflags", "+faststart", str(silent_path)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    assert proc.stdin is not None
    for i in range(nframes):
        im = render_frame(i / FPS, events, duration)
        if im.size != (W, H):
            raise RuntimeError(f"Unexpected frame size at {i}: {im.size}")
        if im.mode != "RGB":
            im = im.convert("RGB")
        proc.stdin.write(np.asarray(im, dtype=np.uint8).tobytes())
        if i % (FPS * 10) == 0:
            print(f"Rendered {i}/{nframes} frames", flush=True)
    proc.stdin.close()
    code = proc.wait()
    if code:
        raise RuntimeError(f"Video encode failed with exit code {code}")
    mux_cmd = [FFMPEG, "-y", "-hide_banner", "-loglevel", "error",
               "-i", str(silent_path), "-i", str(mix_path),
               "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
               "-ac", "2", "-shortest", "-movflags", "+faststart", str(OUT)]
    subprocess.run(mux_cmd, check=True)
    print(f"Wrote {OUT} ({OUT.stat().st_size / 1024 / 1024:.1f} MiB)")


def main() -> None:
    events, duration, mix_path = build_audio()
    print(f"Dialogue segments: {len(events)}; final duration target: {duration:.2f}s")
    for e in events:
        print(f"{e['start']:6.2f}–{e['end']:6.2f}  {e['speaker']}: {e['text']}")
    render_video(events, duration, mix_path)


if __name__ == "__main__":
    main()
