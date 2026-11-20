#!/usr/bin/env python3
# Сборка ролика «Борис · Эпизод 1: Улица» (16:9, 1080p, 25fps)
import os, subprocess, wave, textwrap
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

FF = imageio_ffmpeg.get_ffmpeg_exe()
BASE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(BASE, "img")
AUD = os.path.join(BASE, "audio")
TMP = os.path.join(BASE, "build")
os.makedirs(TMP, exist_ok=True)

FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
W, H, FPS = 1920, 1080, 25
FADE = 0.5

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stdout[-3000:], r.stderr[-3000:])
        raise SystemExit(f"ffmpeg failed: {cmd[:3]}...")
    return r

def dur_wav(p):
    with wave.open(p) as w:
        return w.getnframes() / float(w.getframerate())

# 1) mp3 -> wav + длительности
clips = ["n1","c1","n2","c2","n3","c3","n4","c4","n5","c5"]
D = {}
for c in clips:
    wp = os.path.join(AUD, c + ".wav")
    if not os.path.exists(wp):
        run([FF, "-y", "-i", os.path.join(AUD, c + ".mp3"), "-ac", "2", "-ar", "44100", wp])
    D[c] = dur_wav(wp)
print("durations:", {k: round(v, 2) for k, v in D.items()})

# 2) титры / плашки через PIL
COL_N = (240, 240, 240)
COL_C = (255, 168, 66)

TEXTS = {
    ("n", "n1"): "Эпизод первый. Знакомьтесь: Борис. Кот. Пока состоит из трёхсот полигонов, но характер уже полноценный.",
    ("c", "c1"): "Триста двадцати. Я считал. И да, меня забыли покрасить. Это авторская задумка.",
    ("n", "n2"): "Борис начинает жизнь на улице. У него нет дома, нет миски и, судя по анимации, нет планов на вечер.",
    ("c", "c2"): "План простой: найти еду и не найти неприятности. Обычно получается наоборот.",
    ("n", "n3"): "Первая находка дня — коробка. Для кота с улицы это практически недвижимость.",
    ("c", "c3"): "Так. Тесновато. Текстуры мыльные. Но жить можно. Четыре лапы из пяти.",
    ("n", "n4"): "К вечеру Борис замечает тёплое окно. За окном — человек. У человека, вероятно, есть сосиска.",
    ("c", "c4"): "Человек. Сосиска. Тёплый подоконник. Я не наглый, я просто знаю, чего хочу.",
    ("n", "n5"): "Что получит Борис в следующем эпизоде — решаете вы. Пишите в комментариях номер: один — миска с едой, два — тёплый дом, три — друг, такой же уличный кот.",
    ("c", "c5"): "Подписывайся. Серьёзно — от этого зависит, дорисуют мне хвост или нет.",
}

def font(sz, bold=True):
    return ImageFont.truetype(FONT_B if bold else FONT_R, sz)

def sub_png(path, text, color):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    lines = textwrap.fill(text, 46).split("\n")
    f = font(54)
    lh = 68
    bw = max(d.textlength(l, font=f) for l in lines) + 70
    bh = lh * len(lines) + 34
    x0, y0 = (W - bw) / 2, H - bh - 60
    d.rounded_rectangle([x0, y0, x0 + bw, y0 + bh], radius=22, fill=(10, 10, 12, 165))
    for i, l in enumerate(lines):
        tw = d.textlength(l, font=f)
        d.text(((W - tw) / 2, y0 + 17 + i * lh), l, font=f, fill=color + (255,))
    im.save(path)

def title_png(path):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    f1, f2 = font(170), font(62)
    t1, t2 = "БОРИС", "ЭПИЗОД 1 · УЛИЦА"
    w1 = d.textlength(t1, font=f1); w2 = d.textlength(t2, font=f2)
    y = 120
    d.rounded_rectangle([(W - w1) / 2 - 60, y - 30, (W + w1) / 2 + 60, y + 210], radius=30, fill=(10, 10, 12, 150))
    d.text(((W - w1) / 2 + 5, y + 5), t1, font=f1, fill=(0, 0, 0, 255))
    d.text(((W - w1) / 2, y), t1, font=f1, fill=COL_C + (255,))
    d.text(((W - w2) / 2 + 3, y + 233), t2, font=f2, fill=(0, 0, 0, 255))
    d.text(((W - w2) / 2, y + 230), t2, font=f2, fill=(245, 245, 245, 255))
    im.save(path)

def choice_png(path):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    fh, fi, fs = font(58), font(56), font(40, bold=False)
    head = "ЧТО ПОЛУЧИТ БОРИС?"
    items = [("1", "МИСКА С ЕДОЙ"), ("2", "ТЁПЛЫЙ ДОМ"), ("3", "ДРУГ-КОТ")]
    foot = "голосуй цифрой в комментариях"
    pw, ph = 900, 560
    x0, y0 = 80, (H - ph) / 2
    d.rounded_rectangle([x0, y0, x0 + pw, y0 + ph], radius=28, fill=(10, 10, 12, 185))
    d.text((x0 + 45, y0 + 40), head, font=fh, fill=COL_C + (255,))
    d.line([x0 + 45, y0 + 125, x0 + pw - 45, y0 + 125], fill=(255, 255, 255, 120), width=3)
    for i, (num, txt) in enumerate(items):
        y = y0 + 165 + i * 105
        d.rounded_rectangle([x0 + 45, y, x0 + 115, y + 70], radius=16, fill=COL_C + (235,))
        nw = d.textlength(num, font=fi)
        d.text((x0 + 80 - nw / 2, y + 6), num, font=fi, fill=(15, 15, 15, 255))
        d.text((x0 + 145, y + 8), txt, font=fi, fill=(245, 245, 245, 255))
    d.text((x0 + 45, y0 + ph - 78), foot, font=fs, fill=(200, 200, 200, 255))
    im.save(path)

def end_png(path):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    f1, f2 = font(140), font(60)
    t1, t2 = "ПОДПИШИСЬ", "эпизод 2 — скоро"
    w1 = d.textlength(t1, font=f1); w2 = d.textlength(t2, font=f2)
    y = 110
    d.rounded_rectangle([(W - w1) / 2 - 55, y - 25, (W + w1) / 2 + 55, y + 175], radius=28, fill=(10, 10, 12, 160))
    d.text(((W - w1) / 2, y), t1, font=f1, fill=COL_C + (255,))
    d.text(((W - w2) / 2, y + 200), t2, font=f2, fill=(245, 245, 245, 255))
    im.save(path)

# 3) сцена: картинка + Ken Burns + оверлеи
scenes = [
    dict(img="01_hero.png",   lines=[("n", "n1")], kb="zoomin",  ov=[("title", 0.2, 4.2)]),
    dict(img="02_face.png",   lines=[("c", "c1")], kb="zoomout", ov=[]),
    dict(img="03_bins.png",   lines=[("n", "n2"), ("c", "c2")], kb="panright", ov=[]),
    dict(img="04_box.png",    lines=[("n", "n3"), ("c", "c3")], kb="zoomout", ov=[]),
    dict(img="05_window.png", lines=[("n", "n4"), ("c", "c4")], kb="panleft", ov=[]),
    dict(img="06_choice.png", lines=[("n", "n5")], kb="zoomin",  ov=[("choice", 0.6, 99)], nosub=True),
    dict(img="07_tpose.png",  lines=[("c", "c5")], kb="zoomout", ov=[("end", 0.5, 99)]),
]

# локальные тайминги реплик и длительности сцен
for s in scenes:
    t = 0.25
    s["sub"] = []
    for who, clip in s["lines"]:
        s["sub"].append((who, clip, t, t + D[clip]))
        t += D[clip] + 0.35
    s["D"] = round(t + 0.55, 2)

for name in ["title", "choice", "end"]:
    globals()[name + "_png"](os.path.join(TMP, name + ".png"))

KB = {
    "zoomin":  ("min(1.0+0.14*on/{N},1.14)", "iw/2-(iw/zoom/2)", "ih/2-(ih/zoom/2)"),
    "zoomout": ("max(1.14-0.14*on/{N},1.0)", "iw/2-(iw/zoom/2)", "ih/2-(ih/zoom/2)"),
    "panright":("1.12", "(iw-iw/zoom)*on/{N}", "ih/2-(ih/zoom/2)"),
    "panleft": ("1.12", "(iw-iw/zoom)*(1-on/{N})", "ih/2-(ih/zoom/2)"),
}

seg_paths = []
for k, s in enumerate(scenes):
    Di, N = s["D"], int(round(s["D"] * FPS))
    ovl = []
    if not s.get("nosub"):
        for j, (who, clip, a, b) in enumerate(s["sub"]):
            p = os.path.join(TMP, f"sub_{k}_{j}.png")
            sub_png(p, TEXTS[(who, clip)], COL_N if who == "n" else COL_C)
            ovl.append((p, a, b))
    for name, a, b in s["ov"]:
        ovl.append((os.path.join(TMP, name + ".png"), a, b))
    inputs = ["-loop", "1", "-t", str(Di), "-i", os.path.join(IMG, s["img"])]
    for p, _, _ in ovl:
        inputs += ["-i", p]
    z, x, y = KB[s["kb"]]
    fc = ["[0:v]scale=3840:2160:force_original_aspect_ratio=increase,crop=3840:2160,"
          f"zoompan=z='{z.format(N=N)}':x='{x.format(N=N)}':y='{y.format(N=N)}':d=1:s={W}x{H}:fps={FPS}[z]"]
    cur = "[z]"
    for m, (p, a, b) in enumerate(ovl):
        bb = Di if b > 90 else b
        nxt = f"[o{m}]"
        fc.append(f"{cur}[{m+1}:v]overlay=0:0:enable='between(t,{a:.2f},{bb:.2f})'{nxt}")
        cur = nxt
    fc.append(f"{cur}format=yuv420p[v]")
    out = os.path.join(TMP, f"seg{k}.mp4")
    if not os.path.exists(out):
        run([FF, "-y", *inputs, "-filter_complex", ";".join(fc), "-map", "[v]",
             "-frames:v", str(N), "-r", str(FPS), "-c:v", "libx264", "-preset", "medium",
             "-crf", "20", "-pix_fmt", "yuv420p", out])
    else:
        print("reuse", out)
    seg_paths.append(out)
    print("scene", k, "D=", Di)

# 4) xfade-склейка
offs, acc = [], 0.0
for k in range(1, len(scenes)):
    acc += scenes[k - 1]["D"]
    offs.append(round(acc - k * FADE, 2))
fc, cur = [], "[0:v]"
for k in range(1, len(scenes)):
    nxt = f"[x{k}]"
    fc.append(f"{cur}[{k}:v]xfade=transition=fade:duration={FADE}:offset={offs[k-1]}{nxt}")
    cur = nxt
fc.append(f"{cur}format=yuv420p[v]")
vid = os.path.join(TMP, "video_only.mp4")
run([FF, "-y", *sum([["-i", p] for p in seg_paths], []), "-filter_complex", ";".join(fc),
     "-map", "[v]", "-r", str(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "20",
     "-pix_fmt", "yuv420p", vid])
TOTAL = round(sum(s["D"] for s in scenes) - FADE * (len(scenes) - 1), 2)
print("total video:", TOTAL)

# 5) звук: реплики по таймлайну + уличный шум
starts = []
for k, s in enumerate(scenes):
    off = 0.0 if k == 0 else offs[k - 1]
    for who, clip, a, b in s["sub"]:
        starts.append((clip, round(off + a, 2)))
fc, mixes = [], []
for i, (clip, st) in enumerate(starts):
    fc.append(f"[{i+1}:a]adelay={int(st*1000)}|{int(st*1000)}[d{i}]")
    mixes.append(f"[d{i}]")
fc.append("".join(mixes) + f"amix=inputs={len(starts)}:normalize=0:duration=longest[voice]")
fc.append("[0:a]volume=0.35,lowpass=f=1100,highpass=f=150[amb]")
fc.append(f"[voice][amb]amix=inputs=2:normalize=0:duration=longest,afade=t=in:d=1,afade=t=out:st={TOTAL-2}:d=2,loudnorm=I=-16:TP=-1.5:LRA=11[a]")
aud = os.path.join(TMP, "mix.wav")
run([FF, "-y", "-f", "lavfi", "-i", f"anoisesrc=color=pink:duration={TOTAL}:sample_rate=44100:amplitude=0.5",
     *sum([["-i", os.path.join(AUD, c + ".wav")] for c, _ in starts], []),
     "-filter_complex", ";".join(fc), "-map", "[a]", "-ac", "2", "-ar", "44100", aud])

# 6) финальный mux
out = os.path.join(BASE, "boris_ep01_ulitsa.mp4")
run([FF, "-y", "-i", vid, "-i", aud, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
     "-shortest", "-movflags", "+faststart", out])
print("DONE:", out, os.path.getsize(out) // 1024, "KB")
