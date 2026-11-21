#!/usr/bin/env python3
# Нарезка реплик по паузам: короткие дубли для Shorts (e_s*) и починка e_c2
# (вырезан错-read оборот «без маникеров» -> склейка по тишине).
import os, re, subprocess, wave
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
AUD = os.path.join(os.path.dirname(os.path.abspath(__file__)), "audio_ep2")

def silences(p, noise="-35dB", d=0.16):
    r = subprocess.run([FF, "-i", p, "-af", f"silencedetect=noise={noise}:d={d}", "-f", "null", "-"],
                       capture_output=True, text=True)
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    return list(zip(st, en))

def dur(p):
    with wave.open(p) as w:
        return w.getnframes() / float(w.getframerate())

def cut(src, dst, a, b):
    subprocess.run([FF, "-y", "-i", src, "-ss", f"{a:.3f}", "-to", f"{b:.3f}",
                    "-ac", "1", "-ar", "44100", dst], capture_output=True, check=True)

def concat_gap(parts, dst, gap=0.14):
    args = []
    tmp = []
    for i, (src, a, b) in enumerate(parts):
        t = dst + f".part{i}.wav"
        cut(src, t, a, b)
        tmp.append(t)
        args += ["-i", t]
    fc = "".join(f"[{i}:a]adelay=0|0[a{i}];" for i in range(len(tmp)))
    # склейка с маленькой паузой через concat не даст паузу; используем apad+atrim? проще: concat demux с тишиной
    sil = dst + ".sil.wav"
    subprocess.run([FF, "-y", "-f", "lavfi", "-i", f"anullsrc=r=44100:cl=mono", "-t", f"{gap}", sil],
                   capture_output=True, check=True)
    args2, fc2 = [], []
    for i, t in enumerate(tmp):
        args2 += ["-i", t, "-i", sil]
        fc2.append(f"[{2*i}:a][{2*i+1}:a]")
    fc = "".join(fc2) + f"concat=n={len(tmp)*2}:v=0:a=1[out]"
    subprocess.run([FF, "-y", *args2, "-filter_complex", fc, "-map", "[out]",
                    "-ac", "1", "-ar", "44100", dst], capture_output=True, check=True)
    for t in tmp + [sil]:
        os.remove(t)

W = lambda c: os.path.join(AUD, c + ".wav")
for c in ["e_n1", "e_n2", "e_n3", "e_n4", "e_n5", "e_c2", "e_c3", "e_c5"]:
    if not os.path.exists(W(c)):
        subprocess.run([FF, "-y", "-i", os.path.join(AUD, c + ".mp3"), "-ac", "1", "-ar", "44100", W(c)],
                       capture_output=True, check=True)

# e_s1: «Итак… проголосовали: два — тёплый дом.» (обрезаем хвост)
s = silences(W("e_n1")); d = dur(W("e_n1"))
cut(W("e_n1"), W("e_s1"), 0.0, max(4.0, s[1][0]) if len(s) > 1 else d*0.55)
# e_s2: «Смотр жилья… коробка. Уже проходили.»
s = silences(W("e_n2")); d = dur(W("e_n2"))
ends = [e for st, e in s]
cut(W("e_n2"), W("e_s2"), 0.0, ends[2] if len(ends) > 2 else d*0.6)
# e_s3: без последнего предложения про человека
s = silences(W("e_n3")); d = dur(W("e_n3"))
cut(W("e_n3"), W("e_s3"), 0.0, s[-2][0] if len(s) > 2 else d*0.7)
# e_s4: «Внутри тепло… плед и батарея.»
s = silences(W("e_n4")); d = dur(W("e_n4"))
ends = [e for st, e in s]
cut(W("e_n4"), W("e_s4"), 0.0, ends[1] if len(ends) > 1 else d*0.6)
# e_s5: без первого и последнего предложения (середина = варианты голосования)
s = silences(W("e_n5")); d = dur(W("e_n5"))
cut(W("e_n5"), W("e_s5"), s[0][1] if s else 0.0, s[-1][0] if s else d)
# e_c2: вырезаем середину «Без маникеров.»
s = silences(W("e_c2")); d = dur(W("e_c2"))
if len(s) >= 2:
    concat_gap([(W("e_c2"), 0.0, s[0][0] + 0.05), (W("e_c2"), s[1][1] - 0.05, d)], W("e_c2f"))
    os.replace(W("e_c2f"), W("e_c2"))
for c in ["e_s1", "e_s2", "e_s3", "e_s4", "e_s5", "e_c2", "e_c3", "e_c5"]:
    print(c, round(dur(W(c)), 2))
