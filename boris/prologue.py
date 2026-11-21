#!/usr/bin/env python3
# «Борис · Просто жизнь кота» — два видео одним скриптом:
#   16:9 полное (~76 c) и 9:16 Shorts (<=59 c). Без слова «пролог»:
# Озвучка: разговорный диктор + кот, а между репликами — процедурные звуки из
# sfx.py: мяуканье, мурчание, голуби, дождь, шаги, миска, пшик краски, подложка.
# Никаких «подпишись и поставь лайк» — просто день кота и автор, который
# наконец сжалился и покрасил Бориса (нормальные текстуры).
import os, subprocess, sys, wave, textwrap
import numpy as np
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont
import build as B
import render3d as R

FF = imageio_ffmpeg.get_ffmpeg_exe()
BASE = B.BASE
AUD = os.path.join(BASE, "audio_pro")
SFXD = os.path.join(AUD, "sfx")
FONT_B, FONT_R = B.FONT_B, B.FONT_R
SR = 44100
COL_N = (238, 240, 244)
COL_C = (255, 172, 74)

TEXTS = {
    "p_n1": "Это просто жизнь Бориса, без подвигов и драм. Он просыпается там же, где уснул… на тёплом люке. Планов на день — ноль.",
    "p_c1": "Мрр? О… голубь! Завтрак сам пришёл.",
    "p_n2": "Охота длилась три секунды: одна на подкрадывание, одна на прыжок… и одна на понимание, что голуби умеют летать.",
    "p_c2": "Они просто испугались моей харизмы. Я их понимаю.",
    "p_n3": "Потом небо протекло. Дождь Борис переждал под лавкой… с видом кота, который сам всё это спланировал.",
    "p_c3": "Я не мокрый! Это… дизайнерская влага.",
    "p_n4": "Вечером человек за окном не пожадничал и вынес миску. Оказывается, люди годятся не только на сосиски!",
    "p_c4": "Миска. Моя. Я её уже мысленно пометил.",
    "p_n5": "А потом автор посмотрел на Бориса… и сжалился. Нормальные текстуры: рыжий, белый, полосатый.",
    "p_c5": "Наконец-то! То есть… я всегда знал, что я красивый.",
}

# длительности анимации сцен (в «анимационном» времени, из render3d)
ANIM = {7: 12.2, 8: 13.0, 9: 15.6, 10: 16.0, 11: 12.2}

# sfx: (имя, время в анимации, громкость, длительность: None=сэмпл, число=сек, "loop"=фон)
DEFS = [
    dict(k=7, lines=[("n", "p_n1"), ("c", "p_c1")], ov=[("title", 0.25, 4.4, "out")],
         sfx=[("street", 0.0, .20, "loop"), ("music", 0.0, .26, "loop"), ("birds", 0.4, .30, None),
              ("meow_q", 4.5, .60, None), ("coo", 5.3, .45, None), ("birds", 6.4, .18, None),
              ("coo", 7.9, .36, None), ("purr", 8.8, .30, None), ("meow_happy", 9.2, .45, None), ("flutter", 10.7, .55, None)]),
    dict(k=8, lines=[("n", "p_n2"), ("c", "p_c2")], ov=[],
         sfx=[("street", 0.0, .18, "loop"), ("music", 0.0, .26, "loop"), ("coo", 0.5, .45, None),
              ("coo", 2.4, .38, None), ("rustle", 3.0, .22, None), ("mew", 4.4, .55, None),
              ("flutter", 4.9, .80, None), ("flutter", 5.4, .50, None), ("coo", 5.9, .30, None),
              ("sting_sad", 6.4, .28, None), ("frr", 8.6, .38, None), ("purr", 10.4, .26, None)]),
    dict(k=9, lines=[("n", "p_n3"), ("c", "p_c3")], ov=[],
         sfx=[("rain", 0.0, .55, 11.2), ("street", 0.0, .10, "loop"), ("music", 0.0, .22, "loop"),
              ("steps", 0.5, .50, None), ("mew", 3.3, .50, None), ("rustle", 4.2, .20, None),
              ("purr_soft", 5.6, .30, None), ("frr", 11.1, .50, None), ("birds", 11.5, .30, None),
              ("steps", 12.5, .45, None)]),
    dict(k=10, lines=[("n", "p_n4"), ("c", "p_c4")], ov=[],
         sfx=[("night", 0.0, .30, "loop"), ("music", 0.0, .26, "loop"), ("steps", 1.5, .45, None),
              ("clink", 4.2, .80, None), ("meow_happy", 5.0, .50, None), ("steps", 5.6, .32, None),
              ("purr_soft", 7.0, .28, None), ("steps", 7.5, .50, None),
              ("rustle", 9.9, .16, None), ("purr", 11.2, .42, None), ("meow_happy", 13.6, .55, None)]),
    dict(k=11, lines=[("n", "p_n5"), ("c", "p_c5")], ov=[("stamp", 5.0, 8.4, "anim"), ("end", -3.0, 99, "out")],
         sfx=[("street", 0.0, .05, "loop"), ("music", 0.0, .34, "loop"), ("pop", 1.7, .50, None),
              ("spray", 3.0, .85, 1.6), ("sting_up", 4.45, .75, None),
              ("meow_happy", 5.0, .60, None), ("purr", 5.8, .45, None), ("pop", 9.9, .45, None),
              ("meow_long", 10.4, .45, None)]),
]

CLIPS = ["p_n1", "p_c1", "p_n2", "p_c2", "p_n3", "p_c3", "p_n4", "p_c4", "p_n5", "p_c5"]

# настраиваемые вещи серии (эпизод 2 переопределяет их из episode2.py)
TMPNAME = "pro"
OUTNAMES = {"wide": "boris_life.mp4", "shorts": "boris_life_shorts.mp4"}
TITLE = ("БОРИС", "ПРОСТО ЖИЗНЬ КОТА")
END_T = ("БОРИС ПРОСТО ЖИВЁТ", "продолжение будет, если автор ничего не забудет")
STAMP_T = "ТЕКСТУРЫ: ГОТОВО"
SHORTS_DROP = set()
SHORTS_REPLACE = {}
RATE_SHORTS = 1.35


# ---------- звук ----------
def load_wav(p):
    with wave.open(p) as w:
        n, ch = w.getnframes(), w.getnchannels()
        x = np.frombuffer(w.readframes(n), dtype="<i2").astype(np.float32) / 32768.0
    if ch == 2:
        x = x.reshape(-1, 2).mean(axis=1)
    return x


_SC = {}
def sfx(name):
    if name not in _SC:
        _SC[name] = load_wav(os.path.join(SFXD, name + ".wav"))
    return _SC[name]


def speech(clip, rate):
    """mp3 -> wav 44100 mono; при rate != 1 дополнительно atempo-копия (тон не меняется)."""
    raw = os.path.join(AUD, clip + ".wav")
    if not os.path.exists(raw):
        subprocess.run([FF, "-y", "-i", os.path.join(AUD, clip + ".mp3"), "-ac", "1", "-ar", str(SR), raw],
                       capture_output=True, check=True)
    if abs(rate - 1.0) < 1e-3:
        if clip not in _SC:
            _SC[clip] = load_wav(raw)
        return _SC[clip]
    key = f"{clip}_r{int(round(rate*100))}"
    p = os.path.join(AUD, key + ".wav")
    if not os.path.exists(p):
        subprocess.run([FF, "-y", "-i", raw, "-filter:a", f"atempo={rate}", p], capture_output=True, check=True)
    if key not in _SC:
        _SC[key] = load_wav(p)
    return _SC[key]


def dur_wav(p):
    with wave.open(p) as w:
        return w.getnframes() / float(w.getframerate())


def write_wav(path, x):
    y = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(y.tobytes())


def add(bed, x, t0, gain, dur=None, fade=0.35):
    i = int(max(0.0, t0) * SR)
    if i >= len(bed):
        return
    if dur is None:
        seg = x.copy()
    else:
        need = int(dur * SR)
        seg = x[:need].copy() if need <= len(x) else np.tile(x, need // len(x) + 2)[:need].copy()
        f = int(min(fade, len(seg) / SR * 0.45) * SR)
        if f > 1:
            seg[-f:] *= np.linspace(1.0, 0.0, f, dtype=np.float32)
    if len(seg) > 20:
        fa = int(0.012 * SR)
        seg[:fa] *= np.linspace(0.0, 1.0, fa, dtype=np.float32)
    seg *= gain
    L = min(len(seg), len(bed) - i)
    if L > 0:
        bed[i:i + L] += seg[:L]


# ---------- титры ----------
def _font(sz, bold=True):
    return ImageFont.truetype(FONT_B if bold else FONT_R, sz)


def _center(d, txt, f, y, W, fill, dx=0, dy=0):
    tw = d.textlength(txt, font=f)
    d.text(((W - tw) / 2 + dx, y + dy), txt, font=f, fill=fill)


def sub_png(path, text, color, W, H):
    vert = H > W
    wrap, fsz = (25, 48) if vert else (46, 54)
    lh = fsz + 16
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    lines = textwrap.fill(text, wrap).split("\n")
    f = _font(fsz)
    bw = max(d.textlength(l, font=f) for l in lines) + 62
    bh = lh * len(lines) + 28
    x0 = (W - bw) / 2
    y0 = H - bh - (210 if vert else 62)
    d.rounded_rectangle([x0, y0, x0 + bw, y0 + bh], radius=20, fill=(10, 10, 12, 170))
    for i, l in enumerate(lines):
        _center(d, l, f, y0 + 14 + i * lh, W, color + (255,))
    im.save(path)


def title_png(path, W, H):
    vert = H > W
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    f1 = _font(118 if vert else 148)
    f2 = _font(40 if vert else 54, bold=False)
    t1, t2 = TITLE
    w1, w2 = d.textlength(t1, font=f1), d.textlength(t2, font=f2)
    h1 = 132 if vert else 168
    bw = max(w1, w2) + 96
    x0 = (W - bw) / 2
    y = 168 if vert else 86
    d.rounded_rectangle([x0, y - 26, x0 + bw, y + h1 + 62], radius=26, fill=(10, 10, 12, 158))
    _center(d, t1, f1, y, W, (0, 0, 0, 255), 4, 4)
    _center(d, t1, f1, y, W, COL_C + (255,))
    _center(d, t2, f2, y + h1 + 6, W, (245, 245, 245, 235))
    im.save(path)


def stamp_png(path, W, H):
    vert = H > W
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    f = _font(40 if vert else 50)
    t = STAMP_T
    tw = d.textlength(t, font=f)
    bw, bh = tw + 70, (56 if vert else 74) + 26
    x0, y0 = (W - bw) / 2, 150 if vert else 84
    d.rounded_rectangle([x0, y0, x0 + bw, y0 + bh], radius=18, fill=(18, 20, 24, 190),
                        outline=(255, 172, 74, 255), width=4)
    _center(d, t, f, y0 + (bh - (56 if vert else 70)) / 2 - 4, W, COL_C + (255,))
    im.save(path)


def end_png(path, W, H):
    vert = H > W
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    f1 = _font(74 if vert else 104)
    f2 = _font(34 if vert else 46, bold=False)
    t1 = END_T[0]
    t2 = textwrap.fill(END_T[1], 26 if vert else 48).split("\n")
    w1 = d.textlength(t1, font=f1)
    w2 = max(d.textlength(l, font=f2) for l in t2)
    h1 = 84 if vert else 118
    lh = 44 if vert else 58
    bw = max(w1, w2) + 90
    bh = h1 + 26 + lh * len(t2) + 30
    x0 = (W - bw) / 2
    y = 150 if vert else 84
    d.rounded_rectangle([x0, y, x0 + bw, y + bh], radius=26, fill=(10, 10, 12, 168))
    _center(d, t1, f1, y + 18, W, COL_C + (255,))
    for i, l in enumerate(t2):
        _center(d, l, f2, y + 18 + h1 + 12 + i * lh, W, (242, 242, 242, 235))
    im.save(path)


def plate_png(path, W, H, head, items):
    vert = H > W
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    fh = _font(40 if vert else 50)
    fi = _font(34 if vert else 42)
    lh = (46 if vert else 56)
    ws = [d.textlength(head, font=fh)] + [d.textlength(x, font=fi) for x in items]
    bw = max(ws) + 80
    bh = 66 + lh * len(items) + 34
    x0 = (W - bw) / 2
    y0 = 180 if vert else 96
    d.rounded_rectangle([x0, y0, x0 + bw, y0 + bh], radius=22, fill=(10, 10, 12, 185),
                        outline=(255, 172, 74, 255), width=3)
    _center(d, head, fh, y0 + 16, W, COL_C + (255,))
    for i, x in enumerate(items):
        _center(d, x, fi, y0 + 66 + i * lh, W, (244, 244, 244, 240))
    im.save(path)


def make_overlays(scenes, W, H, TMP):
    title_png(os.path.join(TMP, "title.png"), W, H)
    stamp_png(os.path.join(TMP, "stamp.png"), W, H)
    end_png(os.path.join(TMP, "end.png"), W, H)
    out = []
    for k, s in enumerate(scenes):
        ovl = []
        for j, (who, clip, a, b) in enumerate(s["sub"]):
            p = os.path.join(TMP, f"sub_{k}_{j}.png")
            sub_png(p, TEXTS[clip], COL_N if who == "n" else COL_C, W, H)
            ovl.append((p, a, b))
        for name, a, b, kind in s["ov"]:
            sc = 1.0 / s["tscale"] if kind == "anim" else 1.0
            a2 = (s["D"] + a) if a < 0 else a * sc
            b2 = s["D"] if b > 90 else b * sc
            ovl.append((os.path.join(TMP, name + ".png"), round(a2, 2), round(min(b2, s["D"]), 2)))
        out.append(ovl)
    return out


# ---------- сборка ----------
def plan(mode):
    rate = RATE_SHORTS if mode == "shorts" else 1.0
    lead, gap, tail = (0.14, 0.18, 0.30) if mode == "shorts" else (0.30, 0.50, 0.95)
    D = {}
    for c in CLIPS:
        wp = os.path.join(AUD, c + ".wav")
        if not os.path.exists(wp):
            speech(c, 1.0)
        D[c] = dur_wav(wp)
    if mode == "shorts":
        for c in set(SHORTS_REPLACE.values()):
            D[c] = dur_wav(os.path.join(AUD, c + ".wav"))
    scenes = []
    for d in DEFS:
        subs, t = [], lead
        for who, clip in d["lines"]:
            if mode == "shorts":
                if clip in SHORTS_DROP:
                    continue
                clip = SHORTS_REPLACE.get(clip, clip)
            dd = D[clip] / rate
            subs.append((who, clip, round(t, 2), round(t + dd, 2)))
            t += dd + gap
        pad = d.get("pad_s", 0.0) if mode == "shorts" else d.get("pad_w", 0.0)
        Dt = round(t - gap + tail + (1.0 if d["k"] == 11 else 0.0) + pad, 2)
        scenes.append(dict(k=d["k"], sub=subs, D=Dt, sfx=d["sfx"], ov=d["ov"],
                           tscale=round(ANIM[d["k"]] / Dt, 4)))
    FADE = 0.35 if mode == "shorts" else 0.5
    offs, acc = [], 0.0
    for k in range(1, len(scenes)):
        acc += scenes[k - 1]["D"]
        offs.append(round(acc - k * FADE, 2))
    TOTAL = round(sum(s["D"] for s in scenes) - FADE * (len(scenes) - 1), 2)
    return dict(rate=rate, FADE=FADE, D=D, scenes=scenes, offs=offs, TOTAL=TOTAL)


def mix_audio(mode, P, TMP):
    rate = P["rate"]; TOTAL = P["TOTAL"]
    N = int((TOTAL + 1.5) * SR)
    amb = np.zeros(N, np.float32)
    one = np.zeros(N, np.float32)
    voi = np.zeros(N, np.float32)
    SP = {clip: speech(clip, rate) for s in P["scenes"] for _, clip, _, _ in s["sub"]}
    for k, s in enumerate(P["scenes"]):
        off = 0.0 if k == 0 else P["offs"][k - 1]
        sc = 1.0 / s["tscale"]          # анимационное время -> время монтажа
        for name, at, g, dur in s["sfx"]:
            dd = (ANIM[s["k"]] * sc + 0.6) if dur == "loop" else (None if dur is None else dur * sc)
            add(amb if dur == "loop" else one, sfx(name), off + at * sc, g, dd)
        for who, clip, a, b in s["sub"]:
            add(voi, SP[clip], off + a, 1.0)
    # лёгкий дакинг фона под речь (голос остаётся главным)
    win = int(0.05 * SR)
    nw = len(voi) // win
    rms = np.sqrt(np.mean(voi[:nw * win].reshape(nw, win) ** 2, axis=1))
    env = np.clip(rms / 0.055, 0, 1).astype(np.float32)
    env = np.convolve(env, np.ones(8, np.float32) / 8.0, mode="same")
    duck = np.repeat(1.0 - 0.45 * env, win)
    amb[:len(duck)] *= duck
    write_wav(os.path.join(TMP, "voice.wav"), voi)
    write_wav(os.path.join(TMP, "sfx.wav"), amb + one)
    return os.path.join(TMP, "voice.wav"), os.path.join(TMP, "sfx.wav")


def build(mode):
    R.set_fps(50)
    R.set_mode(mode)
    W, H = (1080, 1920) if mode == "shorts" else (1920, 1080)
    TMP = os.path.join(B.TMP, TMPNAME + "_" + mode)
    os.makedirs(TMP, exist_ok=True)
    P = plan(mode)
    print(f"[{mode}] scenes:", [(s["k"], s["D"], s["tscale"]) for s in P["scenes"]])
    print(f"[{mode}] TOTAL {P['TOTAL']} c (rate {P['rate']})")
    if mode == "shorts" and P["TOTAL"] > 59.0:
        raise SystemExit("Shorts длиннее 60 c — подними rate")
    ovl = make_overlays(P["scenes"], W, H, TMP)
    segs = []
    for k, s in enumerate(P["scenes"]):
        p = os.path.join(TMP, f"seg{k}.mp4")
        R.render_scene(s["k"], ovl[k], p, D=s["D"], tscale=s["tscale"])
        segs.append(p)
    fc, cur = [], "[0:v]"
    for k in range(1, len(segs)):
        nxt = f"[x{k}]"
        fc.append(f"{cur}[{k}:v]xfade=transition=fade:duration={P['FADE']}:offset={P['offs'][k-1]}{nxt}")
        cur = nxt
    fc.append(f"{cur}format=yuv420p[v]")
    vid = os.path.join(TMP, "video_only.mp4")
    subprocess.run([FF, "-y", *sum([["-i", p] for p in segs], []), "-filter_complex", ";".join(fc),
                    "-map", "[v]", "-r", str(R.FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                    "-pix_fmt", "yuv420p", vid], capture_output=True, check=True)
    vp, sp = mix_audio(mode, P, TMP)
    I = "-14" if mode == "shorts" else "-16"
    aud = os.path.join(TMP, "mix.wav")
    subprocess.run([FF, "-y", "-i", vp, "-i", sp, "-filter_complex",
                    "[0:a]highpass=f=88,equalizer=f=175:width_type=q:w=1.2:g=-2.0,"
                    "equalizer=f=2900:width_type=q:w=1.4:g=3.0,"
                    "acompressor=threshold=-20dB:ratio=3:attack=8:release=170:makeup=2[v];"
                    "[1:a]highpass=f=42[s];"
                    f"[v][s]amix=inputs=2:normalize=0:duration=longest,afade=t=in:d=0.9,"
                    f"afade=t=out:st={P['TOTAL']-1.6}:d=1.6,loudnorm=I={I}:TP=-1.0:LRA=10[a]",
                    "-map", "[a]", "-ac", "2", "-ar", "44100", aud], capture_output=True, check=True)
    out = os.path.join(BASE, OUTNAMES[mode])
    subprocess.run([FF, "-y", "-i", vid, "-i", aud, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                    "-shortest", "-movflags", "+faststart", out], capture_output=True, check=True)
    print("DONE:", out, os.path.getsize(out) // 1024, "KB,", P["TOTAL"], "c")
    return out


PREV_T = {7: 5.4, 8: 5.1, 9: 6.2, 10: 4.6, 11: 5.6}


def preview(mode):
    R.set_fps(25)
    R.set_mode(mode)
    W, H = (1080, 1920) if mode == "shorts" else (1920, 1080)
    TMP = os.path.join(B.TMP, TMPNAME + "_" + mode)
    os.makedirs(TMP, exist_ok=True)
    P = plan(mode)
    ovl = make_overlays(P["scenes"], W, H, TMP)
    for i, s in enumerate(P["scenes"]):
        R.render_scene(s["k"], [], os.path.join(TMP, f"pv_{mode}_{i}.png"), only_t=PREV_T[s["k"]])
        R.render_scene(s["k"], ovl[i], os.path.join(TMP, f"pvo_{mode}_{i}.png"),
                       only_t=min(s["sub"][-1][2] - 0.3, s["D"] - 0.2) if s["sub"] else 3.0)
    print("previews", mode, "->", TMP)


if __name__ == "__main__":
    arg = sys.argv[1] if len(sys.argv) > 1 else "all"
    if arg == "preview":
        preview("wide"); preview("shorts")
    elif arg == "wide":
        build("wide")
    elif arg == "shorts":
        build("shorts")
    else:
        build("wide"); build("shorts")
