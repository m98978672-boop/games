#!/usr/bin/env python3
# Shorts-версия «Борис · Эпизод 1» (9:16, 1080x1920, <=60c):
# сжатый сценарий, ровные центрированные титры, чёткий голос (DSP + loudnorm -14).
import os, subprocess, wave, textwrap
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont
import build as B
import render3d as R

FF = imageio_ffmpeg.get_ffmpeg_exe()
BASE = B.BASE
AUD = os.path.join(BASE, "audio_shorts")
TMP = os.path.join(B.TMP, "shorts")
os.makedirs(TMP, exist_ok=True)
FONT_B = B.FONT_B
W, H, FPS, FADE = 1080, 1920, 25, 0.4
RATE = 1.32  # бодрый темп Shorts (atempo без смены высоты тона)
COL_N = (240, 240, 240)
COL_C = (255, 168, 66)

TEXTS = {
    ("n", "n1"): "Знакомьтесь: Борис. Уличный кот из трёхсот двадцати полигонов. Характер уже полноценный.",
    ("c", "c1"): "Триста двадцати! Я считал. И да: меня забыли покрасить. Это авторская задумка.",
    ("n", "n2"): "Борис живёт на улице. Его план: найти еду и не найти неприятности.",
    ("c", "c2"): "Обычно получается наоборот.",
    ("n", "n3"): "Первая находка дня: коробка. Для кота с улицы это практически недвижимость.",
    ("c", "c3"): "Тесновато. Текстуры мыльные. Но жить можно!",
    ("n", "n4"): "К вечеру Борис нашёл тёплое окно. За окном человек. У человека сосиска.",
    ("c", "c4"): "Я не наглый. Я просто знаю, чего хочу.",
    ("n", "n5"): "Что Борис получит дальше, решаете вы: один — миска с едой, два — тёплый дом, три — друг-кот. Голосуйте цифрой в комментариях!",
    ("c", "c5"): "Подписывайся! От этого зависит, дорисуют мне хвост или нет.",
}

clips = ["n1","c1","n2","c2","n3","c3","n4","c4","n5","c5"]
D = {}
for c in clips:
    wp = os.path.join(AUD, c + ".wav")
    if not os.path.exists(wp):
        subprocess.run([FF, "-y", "-i", os.path.join(AUD, c + ".mp3"), "-ac", "2", "-ar", "44100", wp],
                       capture_output=True, check=True)
    with wave.open(wp) as w:
        D[c] = w.getnframes() / float(w.getframerate())

# сцены shorts -> индексы широких сцен рендера
scenes = [
    dict(wk=0, lines=[("n", "n1"), ("c", "c1")], ov=[("title", 0.2, 4.0)]),
    dict(wk=2, lines=[("n", "n2"), ("c", "c2")], ov=[]),
    dict(wk=3, lines=[("n", "n3"), ("c", "c3")], ov=[]),
    dict(wk=4, lines=[("n", "n4"), ("c", "c4")], ov=[]),
    dict(wk=5, lines=[("n", "n5")], ov=[("choice", 0.6, 99)], nosub=True),
    dict(wk=6, lines=[("c", "c5")], ov=[("end", 0.5, 99)]),
]
for s in scenes:
    t = 0.15
    s["sub"] = []
    for who, clip in s["lines"]:
        de = D[clip] / RATE
        s["sub"].append((who, clip, t, t + de))
        t += de + 0.20
    s["D"] = round(t + 0.35, 2)

def font(sz):
    return ImageFont.truetype(FONT_B, sz)

def sub_png(path, text, color):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    lines = textwrap.fill(text, 26).split("\n")
    f = font(50)
    lh = 64
    bw = max(d.textlength(l, font=f) for l in lines) + 60
    bh = lh * len(lines) + 30
    x0, y0 = (W - bw) / 2, H - bh - 90
    d.rounded_rectangle([x0, y0, x0 + bw, y0 + bh], radius=22, fill=(10, 10, 12, 170))
    for i, l in enumerate(lines):
        tw = d.textlength(l, font=f)
        d.text(((W - tw) / 2, y0 + 15 + i * lh), l, font=f, fill=color + (255,))
    im.save(path)

def title_png(path):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    f1, f2 = font(150), font(54)
    t1, t2 = "БОРИС", "ЭПИЗОД 1 · УЛИЦА"
    w1, w2 = d.textlength(t1, font=f1), d.textlength(t2, font=f2)
    y = 150
    d.rounded_rectangle([(W - w1) / 2 - 45, y - 25, (W + w1) / 2 + 45, y + 185], radius=28, fill=(10, 10, 12, 150))
    d.text(((W - w1) / 2, y), t1, font=f1, fill=COL_C + (255,))
    d.text(((W - w2) / 2, y + 205), t2, font=f2, fill=(245, 245, 245, 255))
    im.save(path)

def choice_png(path):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    fh, fi, fs = font(50), font(46), font(34)
    items = [("1", "МИСКА С ЕДОЙ"), ("2", "ТЁПЛЫЙ ДОМ"), ("3", "ДРУГ-КОТ")]
    x0, y0, pw, ph = 50, H - 620, W - 100, 540
    d.rounded_rectangle([x0, y0, x0 + pw, y0 + ph], radius=26, fill=(10, 10, 12, 190))
    d.text((x0 + 40, y0 + 30), "ЧТО ПОЛУЧИТ БОРИС?", font=fh, fill=COL_C + (255,))
    d.text((x0 + 40, y0 + 92), "голосуй цифрой в комментариях", font=fs, fill=(200, 200, 200, 255))
    for i, (num, txt) in enumerate(items):
        y = y0 + 160 + i * 118
        d.rounded_rectangle([x0 + 40, y, x0 + 106, y + 66], radius=16, fill=COL_C + (235,))
        nw = d.textlength(num, font=fi)
        d.text((x0 + 73 - nw / 2, y + 7), num, font=fi, fill=(15, 15, 15, 255))
        d.text((x0 + 130, y + 10), txt, font=fi, fill=(245, 245, 245, 255))
    im.save(path)

def end_png(path):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    f1, f2 = font(120), font(52)
    t1, t2 = "ПОДПИШИСЬ", "эпизод 2 — скоро"
    w1, w2 = d.textlength(t1, font=f1), d.textlength(t2, font=f2)
    y = 170
    d.rounded_rectangle([(W - w1) / 2 - 40, y - 22, (W + w1) / 2 + 40, y + 150], radius=26, fill=(10, 10, 12, 160))
    d.text(((W - w1) / 2, y), t1, font=f1, fill=COL_C + (255,))
    d.text(((W - w2) / 2, y + 172), t2, font=f2, fill=(245, 245, 245, 255))
    im.save(path)

def make_overlays():
    title_png(os.path.join(TMP, "title.png"))
    choice_png(os.path.join(TMP, "choice.png"))
    end_png(os.path.join(TMP, "end.png"))
    out = []
    for k, s in enumerate(scenes):
        ovl = []
        if not s.get("nosub"):
            for j, (who, clip, a, b) in enumerate(s["sub"]):
                p = os.path.join(TMP, f"sub_{k}_{j}.png")
                sub_png(p, TEXTS[(who, clip)], COL_N if who == "n" else COL_C)
                ovl.append((p, a, b))
        for name, a, b in s["ov"]:
            bb = s["D"] if b > 90 else b
            ovl.append((os.path.join(TMP, name + ".png"), a, bb))
        out.append(ovl)
    return out

def assemble(offs, TOTAL):
    seg_paths = [os.path.join(TMP, f"seg{k}.mp4") for k in range(len(scenes))]
    fc, cur = [], "[0:v]"
    for k in range(1, len(scenes)):
        nxt = f"[x{k}]"
        fc.append(f"{cur}[{k}:v]xfade=transition=fade:duration={FADE}:offset={offs[k-1]}{nxt}")
        cur = nxt
    fc.append(f"{cur}format=yuv420p[v]")
    vid = os.path.join(TMP, "video_only.mp4")
    subprocess.run([FF, "-y", *sum([["-i", p] for p in seg_paths], []), "-filter_complex", ";".join(fc),
                    "-map", "[v]", "-r", str(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                    "-pix_fmt", "yuv420p", vid], capture_output=True, check=True)
    starts = []
    for k, s in enumerate(scenes):
        off = 0.0 if k == 0 else offs[k - 1]
        for who, clip, a, b in s["sub"]:
            starts.append((clip, round(off + a, 2)))
    fc, mixes = [], []
    for i, (clip, st) in enumerate(starts):
        fc.append(f"[{i+1}:a]atempo={RATE},adelay={int(st*1000)}|{int(st*1000)}[d{i}]")
        mixes.append(f"[d{i}]")
    fc.append("".join(mixes) + f"amix=inputs={len(starts)}:normalize=0:duration=longest[v0]")
    # чёткость голоса: срезаем гул, убираем муть, поднимаем презенс, плотно жмём
    fc.append("[v0]highpass=f=95,equalizer=f=160:width_type=q:w=1.2:g=-2.5,"
              "equalizer=f=2800:width_type=q:w=1.4:g=3.5,"
              "acompressor=threshold=-20dB:ratio=3:attack=8:release=160:makeup=2[voice]")
    fc.append("[0:a]volume=0.28,lowpass=f=1000,highpass=f=160[amb]")
    fc.append(f"[voice][amb]amix=inputs=2:normalize=0:duration=longest,"
              f"afade=t=in:d=0.8,afade=t=out:st={TOTAL-1.5}:d=1.5,loudnorm=I=-14:TP=-1.0:LRA=8[a]")
    aud = os.path.join(TMP, "mix.wav")
    subprocess.run([FF, "-y", "-f", "lavfi", "-i", f"anoisesrc=color=pink:duration={TOTAL}:sample_rate=44100:amplitude=0.5",
                    *sum([["-i", os.path.join(AUD, c + ".wav")] for c, _ in starts], []),
                    "-filter_complex", ";".join(fc), "-map", "[a]", "-ac", "2", "-ar", "44100", aud],
                   capture_output=True, check=True)
    out = os.path.join(BASE, "boris_ep01_shorts.mp4")
    subprocess.run([FF, "-y", "-i", vid, "-i", aud, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                    "-shortest", "-movflags", "+faststart", out], capture_output=True, check=True)
    print("DONE:", out, os.path.getsize(out) // 1024, "KB, total", TOTAL)

if __name__ == "__main__":
    R.set_mode("shorts")
    ovl = make_overlays()
    print("durations:", {k: round(v, 2) for k, v in D.items()})
    for k, s in enumerate(scenes):
        R.render_scene(s["wk"], ovl[k], os.path.join(TMP, f"seg{k}.mp4"), D=s["D"])
        print("shorts scene", k, "D=", s["D"])
    offs, acc = [], 0.0
    for k in range(1, len(scenes)):
        acc += scenes[k - 1]["D"]
        offs.append(round(acc - k * FADE, 2))
    TOTAL = round(sum(s["D"] for s in scenes) - FADE * (len(scenes) - 1), 2)
    print("TOTAL:", TOTAL, "(лимит Shorts 60)")
    assemble(offs, TOTAL)
