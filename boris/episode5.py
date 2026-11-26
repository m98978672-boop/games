#!/usr/bin/env python3
# «Борис · Эпизод 5: Обзор ИИ-игры» — шортс в ТРИ ЧАСТИ, голос строго 1x.
# Никаких голосований: коты профессионально обозревают игру, написанную нейросетью.
# Части не повторяют темы: 1) диск и студия, 2) геймплей и баги, 3) хаос и вердикт.
# Запуск: episode5.py 1|2|3 [shorts|preview]
import os, sys
import prologue as P

P.AUD = os.path.join(P.BASE, "audio_ep5")
P.SHORTS_DROP = set()
P.SHORTS_REPLACE = {}
P.RATE_SHORTS = 1.0

P.TEXTS = {
    "p1n1": "Утром голубь принёс посылку: диск с игрой, которую сделала нейросеть. Борис принял диск как дипломат.",
    "p1c1": "Диск пахнет нейросетью и немного сосисками. Значит, игра серьезная.",
    "p1n2": "Игра запустилась сама, еще до того, как кот сел на клавиатуру. Подозрительно умно.",
    "p1c2": "Я не сел на клавиатуру. Я провел экспертизу теплом.",
    "p1n3": "Съемочная группа собрана: фон белый, свет круглый, ведущий черный. Обзор начинается.",
    "p1c3": "Свет круглый, ведущий гениальный. Хлопушка, мотор, сосиска!",
    "p2n1": "Геймплей простой: пиксельный кот ловит сосиски. Сосиски, кстати, телепортируются. Баг или фича — молчат.",
    "p2c1": "Пиксельный кот провалился сквозь пол. Знакомо. Автору игры стоило позвонить мне.",
    "p2n2": "Трейлер обещает сорок часов геймплея. Голубь сел на телевизор и смотрит ближе всех.",
    "p2c2": "Сорок часов — это восемнадцать сосисок времени. Я посчитал.",
    "p2n3": "Отзыв печатается лапами: быстро, честно, с опечатками. Стул под Борисом сдался первым.",
    "p2c3": "Синий экран — это не приговор. Это игра так аплодирует стоя.",
    "p3n1": "Дальше был спор за геймпад. Ничья длилась четыре минуты, пока геймпад не выбрал голубя.",
    "p3c1": "Геймпад у голубя. Это худший совет директоров в моей жизни.",
    "p3n2": "Ночью играли тихо: свет экрана, тени на стене, тень человека под дверью. Все замерли. Даже игра.",
    "p3c2": "Тень человека ушла. Человек думает, что мы спим. Мы профессионально притворяемся.",
    "p3n3": "Вердикт: графика четыре сосиски, физика две, звук пять. Физику просим починить к сезону два.",
    "p3c3": "Обзор окончен. Конфетти мои, сосиска моя, канал наш. Подписывайтесь, нейросеть тоже.",
}

P.CLIPS = ["p1n1", "p1c1", "p1n2", "p1c2", "p1n3", "p1c3",
           "p2n1", "p2c1", "p2n2", "p2c2", "p2n3", "p2c3",
           "p3n1", "p3c1", "p3n2", "p3c2", "p3n3", "p3c3"]

P.ANIM = {33: 16.0, 34: 14.0, 35: 14.0, 36: 16.0, 37: 15.0, 38: 13.0, 39: 14.0, 40: 16.0, 41: 17.0}

P.PREV_T = {33: 3.0, 34: 4.0, 35: 3.2, 36: 8.6, 37: 6.3, 38: 6.8, 39: 8.4, 40: 7.0, 41: 11.2}

_mo = P.make_overlays


def setup(part):
    if part == 1:
        P.TMPNAME = "ep5p1"
        P.OUTNAMES = {"wide": "boris_ep05_part1.mp4", "shorts": "boris_ep05_part1_shorts.mp4"}
        P.TITLE = ("БОРИС", "ЭПИЗОД 5 · ОБЗОР ИИ-ИГРЫ · ЧАСТЬ 1")
        P.END_T = ("ПРОДОЛЖЕНИЕ — В ЧАСТИ 2", "геймплей уже грузится")
        P.STAMP_T = "ДИСК ПОЛУЧЕН"
        P.CLIPS = ["p1n1", "p1c1", "p1n2", "p1c2", "p1n3", "p1c3"]
        P.DEFS = [
            dict(k=33, lines=[("n", "p1n1"), ("c", "p1c1")], pad_s=3.5,
                 ov=[("title", 0.25, 4.4, "out"), ("stamp", 4.8, 7.8, "anim")],
                 sfx=[("street", 0.0, .16, "loop"), ("music", 0.0, .26, "loop"), ("flutter", 0.4, .50, None),
                      ("coo", 2.4, .35, None), ("clink", 2.6, .40, None), ("purr", 4.0, .35, None),
                      ("meow_happy", 5.2, .45, None)]),
            dict(k=34, lines=[("n", "p1n2"), ("c", "p1c2")], pad_s=4.5, ov=[],
                 sfx=[("hum", 0.0, .30, "loop"), ("music", 0.0, .22, "loop"), ("pop", 1.2, .50, None),
                      ("rustle", 3.0, .25, None), ("meow_happy", 4.4, .40, None), ("clink", 6.2, .30, None),
                      ("purr", 6.6, .35, None)]),
            dict(k=35, lines=[("n", "p1n3"), ("c", "p1c3")], pad_s=4.0, ov=[("end", -3.0, 99, "out")],
                 sfx=[("music", 0.0, .24, "loop"), ("hum", 0.0, .30, "loop"), ("clink", 2.1, .50, None),
                      ("frr", 5.1, .35, None), ("purr", 7.0, .35, None), ("meow_happy", 8.4, .40, None)]),
        ]
        P.make_overlays = _mo
    elif part == 2:
        P.TMPNAME = "ep5p2"
        P.OUTNAMES = {"wide": "boris_ep05_part2.mp4", "shorts": "boris_ep05_part2_shorts.mp4"}
        P.TITLE = ("БОРИС", "ЭПИЗОД 5 · ОБЗОР ИИ-ИГРЫ · ЧАСТЬ 2")
        P.END_T = ("ПРОДОЛЖЕНИЕ — В ЧАСТИ 3", "геймпад уже дрожит")
        P.STAMP_T = "БАГОВ: 3"
        P.CLIPS = ["p2n1", "p2c1", "p2n2", "p2c2", "p2n3", "p2c3"]
        P.DEFS = [
            dict(k=36, lines=[("n", "p2n1"), ("c", "p2c1")], pad_s=3.6,
                 ov=[("title", 0.25, 4.4, "out")],
                 sfx=[("hum", 0.0, .32, "loop"), ("music", 0.0, .20, "loop"), ("pop", 2.0, .40, None),
                      ("pop", 4.0, .40, None), ("frr", 8.1, .50, None), ("pop", 8.3, .50, None),
                      ("meow_happy", 9.4, .40, None)]),
            dict(k=37, lines=[("n", "p2n2"), ("c", "p2c2")], pad_s=3.6, ov=[],
                 sfx=[("hum", 0.0, .30, "loop"), ("music", 0.0, .26, "loop"), ("coo", 6.1, .30, None),
                      ("flutter", 6.3, .40, None), ("pop", 6.35, .40, None), ("purr", 8.0, .35, None)]),
            dict(k=38, lines=[("n", "p2n3"), ("c", "p2c3")], pad_s=3.4, ov=[("end", -3.0, 99, "out")],
                 sfx=[("music", 0.0, .22, "loop"), ("hum", 0.0, .30, "loop"), ("clink", 1.0, .30, None),
                      ("clink", 1.4, .28, None), ("clink", 1.8, .30, None), ("frr", 6.2, .40, None),
                      ("pop", 9.1, .60, None), ("meow_happy", 10.0, .40, None)]),
        ]

        def mo2(scenes, W, H, TMP):
            out = _mo(scenes, W, H, TMP)
            P.plate_png(os.path.join(TMP, "bugs5.png"), W, H,
                        "БАГОВ НАЙДЕНО: 3",
                        ["СОСИСКИ ТЕЛЕПОРТИРУЮТСЯ",
                         "ПИКСЕЛЬ-КОТ ПРОВАЛИВАЕТСЯ",
                         "СИНИЙ ЭКРАН АПЛОДИРУЕТ"])
            out[0].append((os.path.join(TMP, "bugs5.png"), round(scenes[0]["D"] * 0.45, 2), scenes[0]["D"]))
            return out
        P.make_overlays = mo2
    else:
        P.TMPNAME = "ep5p3"
        P.OUTNAMES = {"wide": "boris_ep05_part3.mp4", "shorts": "boris_ep05_part3_shorts.mp4"}
        P.TITLE = ("БОРИС", "ЭПИЗОД 5 · ОБЗОР ИИ-ИГРЫ · ЧАСТЬ 3")
        P.END_T = ("КАНАЛ НАШ", "нейросеть тоже подписана")
        P.STAMP_T = "ОБЗОР ОКОНЧЕН"
        P.CLIPS = ["p3n1", "p3c1", "p3n2", "p3c2", "p3n3", "p3c3"]
        P.DEFS = [
            dict(k=39, lines=[("n", "p3n1"), ("c", "p3c1")], pad_s=3.5,
                 ov=[("title", 0.25, 4.4, "out")],
                 sfx=[("music", 0.0, .24, "loop"), ("rustle", 0.6, .30, None), ("rustle", 1.4, .30, None),
                      ("frr", 8.0, .50, None), ("flutter", 8.3, .50, None), ("coo", 8.6, .35, None),
                      ("meow_happy", 9.6, .40, None)]),
            dict(k=40, lines=[("n", "p3n2"), ("c", "p3c2")], pad_s=3.0, ov=[],
                 sfx=[("night", 0.0, .28, "loop"), ("hum", 0.0, .22, "loop"), ("purr", 1.0, .40, None),
                      ("creak", 5.6, .40, None), ("frr", 9.6, .30, None), ("coo", 11.0, .30, None)]),
            dict(k=41, lines=[("n", "p3n3"), ("c", "p3c3")], pad_s=3.5, ov=[("end", -3.0, 99, "out")],
                 sfx=[("music", 0.0, .28, "loop"), ("sting_up", 0.6, .50, None), ("pop", 10.2, .40, None),
                      ("pop", 10.5, .40, None), ("meow_happy", 12.2, .50, None), ("sting_up", 13.0, .50, None),
                      ("purr", 13.6, .40, None)]),
        ]

        def mo3(scenes, W, H, TMP):
            out = _mo(scenes, W, H, TMP)
            P.plate_png(os.path.join(TMP, "score5.png"), W, H,
                        "ОЦЕНКИ ИИ-ИГРЫ · СОСИСКИ",
                        ["ГРАФИКА — 4 из 5",
                         "ФИЗИКА — 2 из 5 (почините!)",
                         "ЗВУК — 5 из 5"])
            out[2].append((os.path.join(TMP, "score5.png"), round(scenes[2]["D"] * 0.40, 2), scenes[2]["D"]))
            return out
        P.make_overlays = mo3


if __name__ == "__main__":
    part = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    setup(part)
    arg = sys.argv[2] if len(sys.argv) > 2 else "shorts"
    if arg == "preview":
        P.preview("shorts")
    else:
        P.build(arg)
