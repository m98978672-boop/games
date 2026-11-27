#!/usr/bin/env python3
# «Борис · Эпизод 7: Первый снег» — ОДНА часть, голос строго 1x.
# Зимний день: утро (скрип, чих, сугроб-трон), день (снеговик с сосиской), вечер (тёплое окно).
# Только жизнь кота — без обзоров и голосований. Запуск: episode7.py [shorts|preview]
import os, sys
import prologue as P

P.AUD = os.path.join(P.BASE, "audio_ep7")
P.SHORTS_DROP = set()
P.SHORTS_REPLACE = {}
P.RATE_SHORTS = 1.0
P.TMPNAME = "ep7p1"
P.OUTNAMES = {"wide": "boris_ep07.mp4", "shorts": "boris_ep07_shorts.mp4"}
P.TITLE = ("БОРИС", "ЭПИЗОД 7 · ПЕРВЫЙ СНЕГ")
P.STAMP_T = "ЗИМА ПРИНЯТА"
P.END_T = ("КАНАЛ НАШ", "и сугроб тоже наш")

P.TEXTS = {
    "p7n1": "Утром двор стал белым. Борис вышел проверять: снег скрипел громче, чем он.",
    "p7c1": "Скрип-скрип. Это не снег. Это я скриплю от величия.",
    "p7n2": "Днём слепили снеговика. Нос — сосиска. Барсик присягнул, что не прикасался.",
    "p7c2": "Сосиска у снеговика сама укорачивается. Я просто рядом стоял. Три раза.",
    "p7n3": "Вечером грелись у окна человека. На стекле Борис выдохнул рыбу.",
    "p7c3": "Зима принята. Подождите, я ещё на сугробе не повалялся.",
}

P.CLIPS = ["p7n1", "p7c1", "p7n2", "p7c2", "p7n3", "p7c3"]

P.ANIM = {45: 16.0, 46: 17.0, 47: 16.0}

P.PREV_T = {45: 6.3, 46: 9.0, 47: 7.0}

P.DEFS = [
    dict(k=45, lines=[("n", "p7n1"), ("c", "p7c1")], pad_s=4.0,
         ov=[("title", 0.25, 4.4, "out")],
         sfx=[("wind", 0.0, .30, "loop"), ("music", 0.0, .22, "loop"), ("steps", 1.2, .40, None),
              ("steps", 2.6, .40, None), ("steps", 4.0, .40, None), ("meow", 6.1, .45, None),
              ("frr", 6.4, .35, None), ("rustle", 9.6, .40, None), ("meow_happy", 10.4, .40, None),
              ("purr", 12.8, .35, None)]),
    dict(k=46, lines=[("n", "p7n2"), ("c", "p7c2")], pad_s=4.0, ov=[],
         sfx=[("wind", 0.0, .26, "loop"), ("music", 0.0, .24, "loop"), ("steps", 2.2, .30, None),
              ("steps", 3.4, .30, None), ("pop", 5.4, .45, None), ("pop", 6.8, .45, None),
              ("pop", 8.2, .45, None), ("rustle", 8.6, .30, None), ("sting_up", 11.3, .50, None),
              ("coo", 12.6, .35, None), ("meow_happy", 13.6, .40, None)]),
    dict(k=47, lines=[("n", "p7n3"), ("c", "p7c3")], pad_s=4.0,
         ov=[("stamp", 4.6, 7.6, "anim"), ("end", -3.0, 99, "out")],
         sfx=[("night", 0.0, .30, "loop"), ("music", 0.0, .26, "loop"), ("wind", 0.0, .18, "loop"),
              ("purr_soft", 1.2, .35, None), ("spray", 6.2, .30, None), ("mew", 7.4, .35, None),
              ("rustle", 10.8, .35, None), ("knock", 12.4, .40, None), ("purr", 13.4, .40, None)]),
]

if __name__ == "__main__":
    arg = sys.argv[1] if len(sys.argv) > 1 else "shorts"
    if arg == "preview":
        P.preview("shorts")
    else:
        P.build(arg)
