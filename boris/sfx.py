#!/usr/bin/env python3
# Процедурная библиотека звуков «Бориса»: мяуканье, мурчание, голуби, дождь,
# улица, ночь, шаги, миска, картон, пшик краски, стинги и музыкальная подложка.
# Всё синтезируется numpy'ем (без внешних сэмплов) -> boris/audio_pro/sfx/*.wav
import os, wave
import numpy as np

SR = 44100
BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(BASE, "audio_pro", "sfx")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


# ---------- базовые кирпичики ----------
def T(d):
    return np.arange(int(d * SR)) / SR


def adsr(t, a, dur, r):
    e = np.ones_like(t)
    e = np.where(t < a, t / max(a, 1e-6), e)
    e = np.where(t > dur - r, np.clip((dur - t) / max(r, 1e-6), 0, 1), e)
    return e


def _mag(fr, f, bw=None, kind="bp", n=2):
    if kind == "bp":
        return np.exp(-((fr - f) / max(bw, 1.0)) ** 2)
    if kind == "lp":
        return 1.0 / np.sqrt(1.0 + (fr / max(f, 1.0)) ** (2 * n))
    return 1.0 - 1.0 / np.sqrt(1.0 + (fr / max(f, 1.0)) ** (2 * n))


def filt(x, f, bw=None, kind="bp", n=2):
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(len(x), 1.0 / SR)
    return np.fft.irfft(X * _mag(fr, f, bw, kind, n), len(x))


def lp(x, f, n=2):
    return filt(x, f, None, "lp", n)


def hp(x, f, n=2):
    return filt(x, f, None, "hp", n)


def bp(x, f, bw):
    return filt(x, f, bw, "bp")


def place(dst, seg, t0, gain=1.0):
    i = int(max(0.0, t0) * SR)
    if i >= len(dst):
        return
    L = min(len(seg), len(dst) - i)
    dst[i:i + L] += seg[:L] * gain


def save(name, x, peak=0.92):
    m = np.max(np.abs(x)) if len(x) else 0.0
    if m > 0:
        x = x / m * peak
    y = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(y.tobytes())
    print("sfx %-14s %5.2f s" % (name, len(x) / SR))


# ---------- КОТ ----------
def meow(dur=0.85, f0=620., f1=420., f2=520., nasal=0.55, vib=6.2, vibd=0.035,
         breath=0.16, form=(740., 300., 1280., 430., 2450., 760.), peak=0.92):
    """Мяу: «ми» (подъём) -> «ау» (спад) -> лёгкий подъём хвоста, форманты + носовое «м»."""
    t = T(dur); u = t / dur
    f = np.interp(u, [0., .10, .42, .76, 1.], [f0 * .80, f0, f1, f1 * .90, f2])
    f = f * (1. + vibd * np.sin(2 * np.pi * vib * t + .7))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.zeros_like(t)
    for k in range(1, 9):
        a = 1.0 / k ** 1.22
        g = (np.exp(-((k * f - form[0]) / form[1]) ** 2) +
             .75 * np.exp(-((k * f - form[2]) / form[3]) ** 2) +
             .45 * np.exp(-((k * f - form[4]) / form[5]) ** 2))
        x += a * g * np.sin(k * ph + .35 * k)
    nz = rng.standard_normal(len(t))
    x += bp(nz, 620., 320.) * adsr(t, .012, dur * .30, dur * .18) * nasal   # носовое «м»
    x += hp(nz, 2600.) * adsr(t, .05, dur, dur * .55) * breath               # дыхание
    x *= adsr(t, .055, dur, dur * .40)
    x = np.tanh(1.25 * x) * .85
    return x * peak


def purr(dur=3.0, f=26.5, depth=0.92, peak=0.85):
    """Мурчание: 26 Гц с гармониками, пульс на вдох/выдох + низкий шум."""
    t = T(dur)
    pulse = (0.5 + 0.5 * np.sin(2 * np.pi * f * t - np.pi / 2)) ** 1.7
    x = np.zeros_like(t)
    for k, a in ((1, 1.), (2, .58), (3, .38), (4, .24), (5, .16), (7, .09)):
        x += a * np.sin(2 * np.pi * f * k * t + rng.random() * 6.)
    x *= (1. - depth) + depth * pulse
    x = x * .55 + lp(rng.standard_normal(len(t)), 430., 2) * .55 * pulse
    x *= adsr(t, .22, dur, .34)
    return x * peak


def hiss_play(dur=1.0, peak=0.5):
    """Довольное «фрр» — короткое выдувное."""
    t = T(dur)
    x = bp(rng.standard_normal(len(t)), 1500., 800.)
    x += 0.4 * np.sin(2 * np.pi * np.interp(t / dur, [0, 1], [240, 150]) * t)
    return x * adsr(t, .06, dur, dur * .6) * peak


# ---------- ПТИЦЫ ----------
def coo(dur=1.8, n=3, peak=0.7):
    t = T(dur); x = np.zeros_like(t)
    for i in range(n):
        L = int(0.36 * SR); t0 = .08 + i * (dur - .3) / max(n, 1)
        tt = np.arange(L) / SR
        f = 318. + 16. * np.sin(2 * np.pi * 7.5 * tt)
        ph = 2 * np.pi * np.cumsum(f) / SR
        place(x, (np.sin(ph) + .45 * np.sin(2 * ph) + .18 * np.sin(3 * ph)) *
              adsr(tt, .05, .36, .17) * np.exp(-tt * 1.1), t0, 1.)
    return lp(x, 1900.) * peak


def flutter(dur=1.3, rate=13., peak=0.8):
    t = T(dur)
    n = bp(rng.standard_normal(len(t)), 1450., 950.)
    am = np.clip(np.sin(2 * np.pi * rate * t), 0, 1) ** 1.6
    return n * am * adsr(t, .025, dur, dur * .5) * peak


def chirp(dur=2.4, n=5, peak=0.5):
    """Утренние птицы: короткие свисты со свайпом вверх."""
    t = T(dur); x = np.zeros_like(t)
    for i in range(n):
        L = int(rng.uniform(.10, .22) * SR)
        tt = np.arange(L) / SR
        f0 = rng.uniform(1800, 3200)
        f = np.interp(tt / (L / SR), [0, .5, 1], [f0, f0 * 1.45, f0 * 1.1])
        ph = 2 * np.pi * np.cumsum(f) / SR
        place(x, np.sin(ph) * adsr(tt, .012, L / SR, .05), rng.uniform(.1, dur - .4), .9)
    return lp(x, 6500.) * peak


# ---------- ПОГОДА / УЛИЦА ----------
def rain(dur=18., drips=7, peak=0.9):
    t = T(dur)
    n = rng.standard_normal(len(t))
    x = lp(n, 3900., 2) * .50 + bp(n, 2600., 1600.) * .22 + lp(n, 240., 1) * .30
    x *= 1. + .10 * np.sin(2 * np.pi * .07 * t) + .05 * np.sin(2 * np.pi * .23 * t + 1.)
    for _ in range(drips):
        L = int(.10 * SR); tt = np.arange(L) / SR
        f = rng.uniform(880, 1650)
        place(x, np.sin(2 * np.pi * f * tt) * np.exp(-tt * 42.), rng.uniform(.6, dur - .7), .55)
    return x * adsr(t, .7, dur, .9) * peak


def street(dur=30., cars=3, peak=0.8):
    t = T(dur)
    n = rng.standard_normal(len(t))
    x = lp(n, 210., 2) * .55 + lp(n, 850., 1) * .10
    for _ in range(cars):
        L = int(2.8 * SR); tt = np.arange(L) / SR
        cf = np.interp(tt, [0, 1.2, 2.8], [950., 520., 240.])
        ph = 2 * np.pi * np.cumsum(cf) / SR
        seg = bp(np.sin(ph) * .7 + rng.standard_normal(L) * .5, 560., 430.)
        place(x, seg * adsr(tt, .8, 2.8, 1.3), rng.uniform(1., dur - 4.), .5)
    return x * adsr(t, 1., dur, 1.2) * peak


def night(dur=22., peak=0.75):
    """Ночь: низкий гул города + сверчки."""
    t = T(dur)
    x = lp(rng.standard_normal(len(t)), 170., 2) * .45
    for i in range(int(dur * 2.2)):
        L = int(.16 * SR); tt = np.arange(L) / SR
        f = 4600. if i % 2 else 4300.
        seg = np.sin(2 * np.pi * f * tt) * (np.sin(2 * np.pi * 62 * tt) > -.2)
        place(x, seg * adsr(tt, .01, .16, .05), i * .45 + rng.uniform(0, .12), .16)
    return lp(x, 7000.) * adsr(t, 1., dur, 1.2) * peak


def steps(dur=2.6, n=6, peak=0.75):
    t = T(dur); x = np.zeros_like(t)
    for i in range(n):
        L = int(.13 * SR); tt = np.arange(L) / SR
        seg = (bp(rng.standard_normal(L), 165., 110.) * 1.4 +
             bp(rng.standard_normal(L), 1500., 900.) * .5) * np.exp(-tt * 34.)
        place(x, seg, .12 + i * (dur - .4) / max(n - 1, 1), 1. - .06 * (i % 2))
    return x * peak


def clink(dur=0.9, peak=0.8):
    """Миска о асфальт."""
    t = T(dur); x = np.zeros_like(t)
    for f, a in ((1180., 1.), (1765., .72), (2390., .55), (3140., .4), (4280., .26)):
        x += a * np.sin(2 * np.pi * f * t + rng.random() * 6.) * np.exp(-t * (7. + f / 950.))
    x += bp(rng.standard_normal(len(t)), 3200., 1600.) * np.exp(-t * 55.) * .55
    x += lp(rng.standard_normal(len(t)), 300., 2) * np.exp(-t * 26.) * .8
    return x * peak


def rustle(dur=1.4, peak=0.6):
    """Картон/шуршание."""
    t = T(dur)
    n = rng.standard_normal(len(t))
    x = bp(n, 2300., 1300.) + .5 * bp(n, 900., 500.)
    am = np.clip(np.sin(2 * np.pi * 9. * t + np.sin(t * 5.)), 0, 1) ** .8
    return x * am * adsr(t, .05, dur, dur * .45) * peak


def spray(dur=1.7, peak=0.85):
    """Пшик из баллончика."""
    t = T(dur)
    n = rng.standard_normal(len(t))
    x = hp(n, 2700.) * .85 + bp(n, 1350., 750.) * .40 + lp(n, 300.) * .12
    x *= .82 + .18 * np.sin(2 * np.pi * 37. * t)
    return x * adsr(t, .085, dur, dur * .42) * peak


def pop(dur=0.35, peak=0.7):
    t = T(dur)
    f = np.interp(t / dur, [0, 1], [420., 120.])
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 22.)
    return (x + bp(rng.standard_normal(len(t)), 1800., 1200.) * np.exp(-t * 60.) * .5) * peak


# ---------- МУЗЫКА ----------
def pluck(f, dur, bright=1.0):
    t = T(dur); x = np.zeros_like(t)
    for k in range(1, 10):
        x += (bright / k ** 1.35) * np.sin(2 * np.pi * f * k * t + rng.random() * .5) * \
             np.exp(-t * (2.0 + .85 * k))
    x += bp(rng.standard_normal(len(t)), min(f * 4, 6000.), 1800.) * np.exp(-t * 90.) * .25
    return x * adsr(t, .004, dur, dur * .55)


def shaker(dur=0.09):
    t = T(dur)
    return bp(rng.standard_normal(len(t)), 6200., 2600.) * adsr(t, .006, dur, dur * .7)


def sting_up(dur=1.6, peak=0.8):
    """Та-да! — восходящее арпеджио C-E-G-C."""
    t = T(dur); x = np.zeros_like(t)
    for i, f in enumerate((523.25, 659.25, 783.99, 1046.5)):
        place(x, pluck(f, .95), i * .115, .95)
    place(x, pluck(1046.5, 1.15), .47, .8)
    place(x, pluck(523.25, 1.15), .47, .5)
    return x * peak


def sting_sad(dur=2.1, peak=0.65):
    """Комичное «вау-вау» вниз."""
    t = T(dur); x = np.zeros_like(t)
    for i, (t0, f0, f1, dl) in enumerate(((0., 392., 370., .48), (.52, 370., 349., .48),
                                          (1.04, 349., 311., .52), (1.58, 311., 233., .95))):
        L = int(dl * 1.5 * SR); tt = np.arange(L) / SR
        f = np.interp(tt, [0, dl], [f0, f1]) * (1 + .012 * np.sin(2 * np.pi * 5.5 * tt))
        ph = 2 * np.pi * np.cumsum(f) / SR
        saw = sum((2. / (k * np.pi)) * np.sin(k * ph) for k in range(1, 7))
        seg = saw * adsr(tt, .04, dl, dl * .5)
        place(x, lp(seg, 1100. - i * 140., 2), t0, 1.)
    return x * peak


FQ = {"C": 261.63, "D": 293.66, "E": 329.63, "F": 349.23, "G": 392.0, "A": 440.0, "B": 493.88}


def music(dur=80., bpm=86, peak=0.55):
    """Лёгкая пиццикато-подложка: C - Am - F - G, без пафоса."""
    t = T(dur); x = np.zeros_like(t)
    beat = 60. / bpm; bar = beat * 4
    prog = [(("C", "E", "G"), "C"), (("A", "C", "E"), "A"), (("F", "A", "C"), "F"), (("G", "B", "D"), "G")]
    i = 0
    while i * bar < dur:
        ch, root = prog[i % 4]
        place(x, pluck(FQ[root] / 2, 1.3, .8), i * bar, .50)
        place(x, pluck(FQ[root] / 2, 1.3, .8), i * bar + 2 * beat, .40)
        for j in range(8):
            f = FQ[ch[(j * 2 + i) % 3]] * (2 if j % 2 else 1)
            place(x, pluck(f, .55, 1.0), i * bar + j * beat / 2, .26 if j % 2 == 0 else .18)
        for j in range(4):
            place(x, shaker(), i * bar + j * beat + beat * .5, .085)
        i += 1
    return x * adsr(t, 1.2, dur, 2.5) * peak



def wind(dur=16., peak=0.7):
    """Зимний ветер: гул с порывами."""
    t = T(dur)
    n = rng.standard_normal(len(t))
    x = lp(n, 320., 1) * .8 + bp(n, 700., 420.) * .35
    g = .6 + .4*np.sin(2*np.pi*.11*t) * np.sin(2*np.pi*.043*t + 1.2)
    return x * np.clip(g, .25, 1.) * adsr(t, 1.2, dur, 1.4) * peak


def hum(dur=14., peak=0.5):
    """Тёплый радиатор: мягкий низкий гул."""
    t = T(dur)
    x = np.zeros_like(t)
    for f, a in ((98., 1.), (196., .5), (294., .28), (49., .6)):
        x += a * np.sin(2*np.pi*f*t + rng.random()*6.) * (1 + .12*np.sin(2*np.pi*.7*t))
    x = lp(x, 600., 1) * .5 + lp(rng.standard_normal(len(t)), 240., 2) * .3
    return x * adsr(t, 1.0, dur, 1.2) * peak


def knock(dur=1.2, peak=0.8):
    """Тук-тук: картон/домик поставили на землю."""
    t = T(dur); x = np.zeros_like(t)
    for i, t0 in enumerate((0.0, 0.34, 0.62)):
        L = int(.22*SR); tt = np.arange(L)/SR
        seg = (lp(rng.standard_normal(L), 260., 2)*1.5 + np.sin(2*np.pi*110.*tt)*.8) * np.exp(-tt*26.)
        place(x, seg, t0, 1. - .18*i)
    return x * peak


def honk(dur=0.45, peak=0.8):
    """Клаксон: два гудка-тона."""
    t = T(dur)
    f = 392.0
    x = sum(np.sin(2*np.pi*f*k*t)/k for k in (1, 2, 3, 4))
    x += 0.6*sum(np.sin(2*np.pi*(f*0.76)*k*t)/k for k in (1, 2, 3))
    return bp(x, 900., 700.) * adsr(t, .02, dur, .12) * peak


def creak(dur=1.4, peak=0.5):
    """Скрип двери/старого дерева."""
    t = T(dur)
    f = np.interp(t/dur, [0, .3, .6, 1], [180., 240., 205., 260.]) * (1 + .05*np.sin(2*np.pi*9.*t))
    ph = 2*np.pi*np.cumsum(f)/SR
    x = sum(np.sin(k*ph)/k for k in (1, 2, 3, 5))
    x = bp(x, 420., 260.) * adsr(t, .25, dur, .5) * (.6 + .4*np.sin(2*np.pi*3.1*t))
    return x * peak


if __name__ == "__main__":
    lib = {
        "meow_q":     lambda: meow(.62, f0=560., f1=470., f2=700., nasal=.5, vib=7.5, vibd=.05),
        "meow":       lambda: meow(.88),
        "meow_long":  lambda: meow(1.45, f0=640., f1=360., f2=470., nasal=.7, vib=5.4, vibd=.05, breath=.24),
        "mew":        lambda: meow(.34, f0=880., f1=700., f2=980., nasal=.3, vib=9., vibd=.06, breath=.1),
        "meow_happy": lambda: meow(1.0, f0=520., f1=470., f2=760., nasal=.45, vib=6.8, vibd=.055),
        "purr":       lambda: purr(4.0),
        "purr_soft":  lambda: purr(3.2, f=24., depth=.85, peak=.6),
        "frr":        lambda: hiss_play(.9),
        "coo":        lambda: coo(2.0, 3),
        "flutter":    lambda: flutter(1.4),
        "birds":      lambda: chirp(3.0, 6),
        "rain":       lambda: rain(22., 8),
        "street":     lambda: street(34., 4),
        "night":      lambda: night(24.),
        "steps":      lambda: steps(2.8, 7),
        "clink":      lambda: clink(.95),
        "rustle":     lambda: rustle(1.5),
        "spray":      lambda: spray(1.8),
        "pop":        lambda: pop(.4),
        "sting_up":   lambda: sting_up(1.7),
        "sting_sad":  lambda: sting_sad(2.2),
        "music":      lambda: music(84.),
        "wind":       lambda: wind(18.),
        "hum":        lambda: hum(15.),
        "knock":      lambda: knock(1.2),
        "creak":      lambda: creak(1.4),
        "honk":       lambda: honk(0.45),
    }
    for k, fn in lib.items():
        save(k, fn())
    print("SFX OK ->", OUT)
