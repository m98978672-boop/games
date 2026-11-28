#!/usr/bin/env python3
# «Борис · Эпизод 8: Коробка счастья» — ТРИ ЧАСТИ, голос строго 1x.
# Комната человека и картонная коробка: приезд → спор → дом. Только жизнь кота.
# Запуск: episode8.py 1|2|3 [shorts|preview]
import os, sys
import prologue as P

P.AUD = os.path.join(P.BASE, "audio_ep8")
P.SHORTS_DROP = set()
P.SHORTS_REPLACE = {}
P.RATE_SHORTS = 1.0

P.TEXTS = {
    "p8n1": "Утром у двери стояла она. Коробка. Большая, картонная, пахнет складом, скотчем и немного праздником. Человек сказал: это просто коробка, не игрушка. Человек плохо знает котов.",
    "p8c1": "Я сел внутрь примерить. Село идеально. Значит, коробка всегда была моей, просто лежала не там.",
    "p8n2": "Вечером коробку никто не трогал: там спал хозяин дома. Мурка дежурила рядом на коврике — на случай, если место освободится во сне.",
    "p8m1": "Утром место в коробке было занято. Мурка сидела там с лицом «я тут всегда жила». Борис вежливо пошумел: сначала хвостом, потом голосом.",
    "p8m2": "Пока мы с Муркой ходили кругами и спорили, в коробку сел Барсик. Молча. Вот это профессионал.",
    "p8m3": "Коробка с Барсиком уехала кататься по полу и вернулась победителем. С этого дня проезд в коробке платный. Плата — сосиска.",
    "p8f1": "Человек взял ножницы и вырезал в коробке окно. Теперь это не коробка, а дом. Документов нет, но есть окно — значит, дом.",
    "p8f2": "Я занял крышу: с неё видно кухню и миску. Мурка заняла вход. Барсик сел в очередь: документов у него тоже нет.",
    "p8f3": "Вечером дом горел тёплым светом: внутри мурчали двое, на крыше мурчал один. Коробка оказалась самой крепкой постройкой в этом доме.",
    "p8f4": "Коробка наша. Диван тоже наш, но коробка — священна. Канал наш, зима наша, сосиска… сосиска делится.",
}

P.CLIPS = ["p8n1", "p8c1", "p8n2", "p8m1", "p8m2", "p8m3", "p8f1", "p8f2", "p8f3", "p8f4"]

P.ANIM = {48: 16.0, 49: 16.0, 50: 15.0, 51: 16.0, 52: 17.0, 53: 16.0, 54: 16.0, 55: 16.0, 56: 16.0}

P.PREV_T = {48: 6.0, 49: 5.0, 50: 5.0, 51: 6.0, 52: 8.0, 53: 5.0, 54: 5.5, 55: 6.0, 56: 6.0}


def setup(part):
    if part == 1:
        P.TMPNAME = "ep8p1"
        P.OUTNAMES = {"wide": "boris_ep08_part1.mp4", "shorts": "boris_ep08_part1_shorts.mp4"}
        P.TITLE = ("БОРИС", "ЭПИЗОД 8 · КОРОБКА СЧАСТЬЯ · ЧАСТЬ 1")
        P.STAMP_T = "КОРОБКА МОЯ"
        P.END_T = ("ПРОДОЛЖЕНИЕ — В ЧАСТИ 2", "место одно, а котов трое")
        P.CLIPS = ["p8n1", "p8c1", "p8n2"]
        P.DEFS = [
            dict(k=48, lines=[("n", "p8n1")], pad_s=4.0,
                 ov=[("title", 0.25, 4.4, "out"), ("stamp", 5.0, 8.0, "anim")],
                 sfx=[("music", 0.0, .24, "loop"), ("rustle", 0.7, .45, None), ("rustle", 1.6, .45, None),
                      ("rustle", 2.5, .45, None), ("steps", 4.4, .40, None), ("steps", 5.6, .40, None),
                      ("meow", 9.0, .45, None), ("purr_soft", 10.6, .40, None)]),
            dict(k=49, lines=[("c", "p8c1")], pad_s=4.0, ov=[],
                 sfx=[("steps", 1.2, .40, None), ("steps", 1.7, .40, None), ("pop", 2.75, .40, None),
                      ("meow_happy", 3.4, .45, None), ("purr", 5.0, .45, None), ("mew", 7.4, .40, None),
                      ("rustle", 9.0, .35, None)]),
            dict(k=50, lines=[("n", "p8n2")], pad_s=4.0,
                 ov=[("end", -3.0, 99, "out")],
                 sfx=[("music", 0.0, .20, "loop"), ("night", 0.0, .16, "loop"), ("purr", 1.2, .50, None),
                      ("purr_soft", 4.0, .45, None), ("purr", 7.5, .50, None)]),
        ]
    elif part == 2:
        P.TMPNAME = "ep8p2"
        P.OUTNAMES = {"wide": "boris_ep08_part2.mp4", "shorts": "boris_ep08_part2_shorts.mp4"}
        P.TITLE = ("БОРИС", "ЭПИЗОД 8 · КОРОБКА СЧАСТЬЯ · ЧАСТЬ 2")
        P.STAMP_T = "МЕСТО ЗАНЯТО"
        P.END_T = ("ПРОДОЛЖЕНИЕ — В ЧАСТИ 3", "человек уже ищет ножницы")
        P.CLIPS = ["p8m1", "p8m2", "p8m3"]
        P.DEFS = [
            dict(k=51, lines=[("n", "p8m1")], pad_s=5.0,
                 ov=[("title", 0.25, 4.4, "out"), ("stamp", 5.0, 8.0, "anim")],
                 sfx=[("music", 0.0, .24, "loop"), ("meow", 4.6, .45, None), ("frr", 5.3, .35, None),
                      ("meow", 6.5, .45, None), ("pop", 6.7, .35, None)]),
            dict(k=52, lines=[("c", "p8m2")], pad_s=5.0, ov=[],
                 sfx=[("steps", 0.8, .38, None), ("steps", 1.5, .38, None), ("steps", 2.2, .38, None),
                      ("steps", 2.9, .38, None), ("mew", 4.6, .38, None), ("pop", 6.85, .40, None),
                      ("sting_up", 8.4, .50, None), ("meow", 9.6, .40, None)]),
            dict(k=53, lines=[("n", "p8m3")], pad_s=5.0,
                 ov=[("end", -3.0, 99, "out")],
                 sfx=[("rustle", 1.4, .45, None), ("rustle", 2.3, .45, None), ("rustle", 3.2, .45, None),
                      ("knock", 4.15, .45, None), ("meow_happy", 5.2, .45, None), ("purr", 7.0, .45, None),
                      ("steps", 8.0, .38, None)]),
        ]
    else:
        P.TMPNAME = "ep8p3"
        P.OUTNAMES = {"wide": "boris_ep08_part3.mp4", "shorts": "boris_ep08_part3_shorts.mp4"}
        P.TITLE = ("БОРИС", "ЭПИЗОД 8 · КОРОБКА СЧАСТЬЯ · ЧАСТЬ 3")
        P.STAMP_T = "КОРОБКА НАША"
        P.END_T = ("КАНАЛ НАШ", "и коробка тоже наша")
        P.CLIPS = ["p8f1", "p8f2", "p8f3", "p8f4"]
        P.DEFS = [
            dict(k=54, lines=[("n", "p8f1")], pad_s=4.0,
                 ov=[("title", 0.25, 4.4, "out")],
                 sfx=[("music", 0.0, .24, "loop"), ("rustle", 1.2, .45, None), ("rustle", 1.9, .45, None),
                      ("pop", 3.55, .40, None), ("pop", 3.9, .35, None), ("mew", 7.6, .40, None)]),
            dict(k=55, lines=[("c", "p8f2")], pad_s=4.0,
                 ov=[("stamp", 5.0, 8.0, "anim")],
                 sfx=[("meow_happy", 1.2, .45, None), ("purr", 2.6, .45, None), ("mew", 4.4, .40, None),
                      ("sting_up", 6.0, .50, None), ("meow", 8.6, .40, None)]),
            dict(k=56, lines=[("n", "p8f3"), ("c", "p8f4")], pad_s=4.0,
                 ov=[("end", -3.0, 99, "out")],
                 sfx=[("music", 0.0, .20, "loop"), ("night", 0.0, .16, "loop"), ("purr", 1.2, .50, None),
                      ("purr_soft", 3.0, .45, None), ("sting_up", 6.5, .50, None), ("meow_happy", 8.0, .45, None)]),
        ]


if __name__ == "__main__":
    part = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    setup(part)
    arg = sys.argv[2] if len(sys.argv) > 2 else "shorts"
    if arg == "preview":
        P.preview("shorts")
    else:
        P.build(arg)
