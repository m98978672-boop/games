#!/usr/bin/env python3
# «Борис · Эпизод 4: Голосование» — шортс в ДВЕ ЧАСТИ, голос строго в 1x.
# В прошлой части зрители голосовали цифрой в комментариях… комментариев не
# было. Ноль. Дальше решает кот (и голубь). Без «подпишись/лайк», финал смешной.
# Запуск: episode4.py 1 | episode4.py 2  (shorts, 9:16, 50 fps, <=59 c, rate 1.0)
import os, sys
import prologue as P

P.AUD = os.path.join(P.BASE, "audio_ep4")
P.SHORTS_DROP = set()
P.SHORTS_REPLACE = {}
P.RATE_SHORTS = 1.0  # голос в родном темпе, без ускорения

P.TEXTS = {
    "e4_n1": "Просили голосовать цифрой в комментариях. Результаты: комментариев — ноль. Борис перепроверил три раза.",
    "e4_c1": "Ноль?! Я весь день сидел у телефона. Телефон — это окно.",
    "e4_n2": "Борис подсчитал голоса сам. Пункт «друг навсегда» озвучил друг. Спиной.",
    "e4_c2": "Это не подкуп. Это выборы с удобной посадкой.",
    "e4_n3": "Единственный голос прилетел голубем: след на объявлении. Пункт второй — охота вместе.",
    "e4_c3": "Голос голубя — тоже голос. А голубь теперь предвыборный штаб.",
    "e4_n4": "К вечеру сбылось всё: друг остался, охота состоялась, вторая миска появилась.",
    "e4_c4": "Людьми можно пользоваться. Особенно когда мисок две.",
    "e4_n5": "Демократия по-кошачьи: никто не голосует, а всё по-кошачьи. Голосование признано состоявшимся!",
    "e4_c5": "В следующий раз голосуйте сосисками. Сосисочные комментарии я читаю сразу.",
    "e4_c4b": "И человек ещё удивляется, почему мы сидим у двери. Дверь — это сервис.",
    "e4_n5b": "Победа оформлена задним числом, спиной и следом. Как все настоящие победы.",
}

P.CLIPS = ["e4_n1", "e4_c1", "e4_n2", "e4_c2", "e4_n3", "e4_c3", "e4_n4", "e4_c4", "e4_n5", "e4_c5",
           "e4_c4b", "e4_n5b"]
P.ANIM = {22: 12.5, 23: 14.0, 24: 14.5, 25: 15.0, 26: 12.0}

SC0 = dict(k=22, lines=[("n", "e4_n1"), ("c", "e4_c1")],
           sfx=[("street", 0.0, .16, "loop"), ("music", 0.0, .26, "loop"), ("purr", 0.8, .40, None),
                ("meow_happy", 3.4, .50, None), ("rustle", 5.2, .22, None), ("frr", 8.0, .30, None),
                ("purr_soft", 9.6, .35, None)])
SC1 = dict(k=23, lines=[("n", "e4_n2"), ("c", "e4_c2")],
           sfx=[("street", 0.0, .14, "loop"), ("music", 0.0, .24, "loop"), ("steps", 0.6, .40, None),
                ("clink", 1.6, .55, None), ("rustle", 2.6, .30, None), ("rustle", 3.4, .28, None),
                ("frr", 6.2, .35, None), ("purr", 7.6, .30, None), ("creak", 9.4, .30, None)])
SC2 = dict(k=24, lines=[("n", "e4_n3"), ("c", "e4_c3")],
           sfx=[("street", 0.0, .12, "loop"), ("music", 0.0, .26, "loop"), ("coo", 0.6, .35, None),
                ("flutter", 1.6, .40, None), ("coo", 2.6, .30, None), ("steps", 3.4, .30, None),
                ("frr", 5.8, .80, None), ("pop", 5.9, .60, None), ("flutter", 6.4, .70, None),
                ("flutter", 7.0, .55, None), ("coo", 8.2, .30, None), ("meow_happy", 9.6, .45, None)])
SC3 = dict(k=25, lines=[("n", "e4_n4"), ("c", "e4_c4b"), ("c", "e4_c4")],
           sfx=[("wind", 0.0, .28, 15.0), ("hum", 0.0, .36, "loop"), ("music", 0.0, .22, "loop"),
                ("purr", 0.6, .45, None), ("purr", 1.4, .42, None), ("meow_happy", 4.8, .45, None),
                ("rustle", 6.8, .20, None), ("clink", 7.6, .50, None), ("frr", 9.2, .30, None),
                ("purr_soft", 10.6, .40, None)])
SC4 = dict(k=26, lines=[("n", "e4_n5"), ("n", "e4_n5b"), ("c", "e4_c5")],
           sfx=[("wind", 0.0, .36, 12.0), ("night", 0.0, .24, "loop"), ("music", 0.0, .28, "loop"),
                ("purr", 0.6, .45, None), ("meow_happy", 3.0, .45, None), ("coo", 4.8, .25, None),
                ("purr", 6.0, .40, None), ("sting_up", 8.4, .45, None)])

P.PREV_T = {22: 5.0, 23: 6.0, 24: 6.3, 25: 6.0, 26: 5.0}

_mo = P.make_overlays


def setup(part):
    if part == 1:
        P.TMPNAME = "ep4p1"
        P.OUTNAMES = {"wide": "boris_ep04_part1.mp4", "shorts": "boris_ep04_part1_shorts.mp4"}
        P.TITLE = ("БОРИС", "ЭПИЗОД 4 · ГОЛОСОВАНИЕ · ЧАСТЬ 1")
        P.END_T = ("ПРОДОЛЖЕНИЕ — В ЧАСТИ 2", "голубь уже готовится")
        P.STAMP_T = "КОММЕНТАРИЕВ: 0"
        P.DEFS = [
            dict(SC0, ov=[("title", 0.25, 4.4, "out"), ("stamp", 5.0, 8.2, "anim")]),
            dict(SC1, ov=[]),
            dict(SC2, ov=[("end", -3.0, 99, "out")]),
        ]

        def mo(scenes, W, H, TMP):
            out = _mo(scenes, W, H, TMP)
            P.plate_png(os.path.join(TMP, "vote4.png"), W, H,
                        "ИТОГИ ГОЛОСОВАНИЯ · комментариев: 0",
                        ["1 ДРУГ НАВСЕГДА — друг, спиной",
                         "2 ОХОТА ВМЕСТЕ — голубь, следом",
                         "3 ВТОРАЯ МИСКА — человек, просто так"])
            out[1].append((os.path.join(TMP, "vote4.png"), round(scenes[1]["D"] * 0.42, 2), scenes[1]["D"]))
            return out

        P.make_overlays = mo
    else:
        P.TMPNAME = "ep4p2"
        P.OUTNAMES = {"wide": "boris_ep04_part2.mp4", "shorts": "boris_ep04_part2_shorts.mp4"}
        P.TITLE = ("БОРИС", "ЭПИЗОД 4 · ГОЛОСОВАНИЕ · ЧАСТЬ 2")
        P.END_T = ("ВСЕ ТРИ ПУНКТА!", "голубь проголосовал за всех")
        P.STAMP_T = "ГОЛОСОВАНИЕ СОСТОЯЛОСЬ"
        P.DEFS = [
            dict(SC3, ov=[("title", 0.25, 4.4, "out")]),
            dict(SC4, ov=[("end", -3.0, 99, "out")]),
        ]
        P.make_overlays = _mo


if __name__ == "__main__":
    part = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    setup(part)
    arg = sys.argv[2] if len(sys.argv) > 2 else "shorts"
    if arg == "preview":
        P.preview("shorts")
    else:
        P.build(arg)
