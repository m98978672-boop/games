"""Exercise the actual pinned model on synthetic facts; never render or upload."""
import sys
import wave
from array import array
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from game_reviews import generate_long_narration, ensure_editorial_quality
from renderer import synthesize
from speech_policy import fit_speech_text

review = {
    "game_title": "Проверочный проект",
    "idea_score": 7,
    "hook": "Что предлагает этот игровой проект?",
    "pros": ["В описании упоминаются логические задачи", "В карточке указан одиночный режим"],
    "possible_minus": "Возможно, любителям динамичных игр эта идея подойдёт не всем.",
    "evidence": {
        "test-f1": "В описании проекта упоминаются логические задачи.",
        "test-f2": "В карточке проекта указан одиночный режим.",
    },
}
scenes = generate_long_narration(review)
assert len(scenes) == 10
try:
    ensure_editorial_quality(scenes)
except ValueError as exc:
    print(f'::warning title=Editorial quality gate::Production would reject this private sample: {exc}')
else:
    print('::notice title=Editorial quality gate::Private sample passed basic repetition/fallback checks; facts and voice still require review.')
assert all(scene["fact_id"] in review["evidence"] for scene in scenes)
assert "Итог по источникам:" in scenes[-1]["dialogue"]
print("Long-script smoke passed:", len(scenes), "chapters;", sum(len(s["dialogue"]) for s in scenes), "characters")

with tempfile.TemporaryDirectory() as temp:
    total = 0.0
    for index, scene in enumerate(scenes):
        wav = Path(temp) / f"{index}.wav"
        final_text, seconds = fit_speech_text(scene["dialogue"], lambda text: synthesize(text, wav), max_seconds=40.0, attempts=6)
        total += max(8.0, seconds + 1.2)
        with wave.open(str(wav), "rb") as clip:
            assert clip.getnchannels() == 1 and clip.getframerate() == 24000 and clip.getsampwidth() == 2
            samples = array("h", clip.readframes(clip.getnframes()))
            peak = max(abs(sample) for sample in samples)
            assert 100 < peak < 32767, f"silent or clipped voice: peak={peak}"
        if index == 9:
            assert "Итог по источникам:" in final_text and "Лично я не играл" in final_text, final_text
    assert 180 <= total <= 600, f"Actual Piper duration outside long-form bounds: {total}"
    print("Measured Piper narration duration including normal chapter pauses:", round(total, 2))
