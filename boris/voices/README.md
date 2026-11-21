# Голосовой пакет «Борис»

- **Диктор** — `voice-00` (чёткий человеческий, ru). Образец: `narrator_sample.mp3`.
- **Кот Борис** — `voice-01` (комедийный, ru). Образец: `cat_sample.mp3`.
- Реплики «Пролога»: `prolog/p_n1..p_n5.mp3` (диктор), `prolog/p_c1..p_c5.mp3` (кот).
- Мяуканье, мурчание и уличные звуки — процедурные: генератор `boris/sfx.py`,
  сэмплы в `boris/audio_pro/sfx/` (мяу, мур, голуби, дождь, шаги, миска, пшик краски, стинги, подложка).
- Чёткость голоса даёт DSP-цепочка в `boris/prologue.py` / `boris/shorts.py`
  (highpass, срез мути, презенс +3 дБ, компрессор 3:1, loudnorm −14/−16 LUFS).
- Полный манифест: `voices.json`. Голоса не менять без явной просьбы пользователя.

## настоящие мяу
Записи мяуканья — из репозитория `bugITwhisperer/Claude-Code-cat-meow-hook-notifications`
(лицензия MIT), файлы `assets/stop/meow.mp3` и `assets/notification/angry_cat.mp3`.
Варианты (`meow_q`, `mew`, `meow_happy`) получены питч-сдвигом без смены длины.
