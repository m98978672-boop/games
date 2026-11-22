"""Exercise the actual pinned model on synthetic facts; never render or upload."""
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from game_reviews import generate_long_narration
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
assert all(scene["fact_id"] in review["evidence"] for scene in scenes)
assert "Итог по источникам:" in scenes[-1]["dialogue"]
print("Long-script smoke passed:", len(scenes), "chapters;", sum(len(s["dialogue"]) for s in scenes), "characters")

with tempfile.TemporaryDirectory() as temp:
    total = 0.0
    for index, scene in enumerate(scenes):
        wav = Path(temp) / f"{index}.wav"
        final_text, seconds = fit_speech_text(scene["dialogue"], lambda text: synthesize(text, wav), max_seconds=40.0, attempts=6)
        total += max(8.0, seconds + 1.2)
        if index == 9:
            assert "Итог по источникам:" in final_text and "Лично я не играл" in final_text, final_text
    assert 180 <= total <= 600, f"Actual Piper duration outside long-form bounds: {total}"
    print("Measured Piper narration duration including normal chapter pauses:", round(total, 2))
