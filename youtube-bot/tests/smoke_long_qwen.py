"""Exercise the actual pinned model on synthetic facts; never render or upload."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from game_reviews import generate_long_narration

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
