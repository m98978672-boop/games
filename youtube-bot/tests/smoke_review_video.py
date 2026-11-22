"""Render a private synthetic Short end to end with the real local voice.

Uses no Steam data, credentials, uploads or YouTube API calls.
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from renderer import render_short

script = {
    "format": "game-review", "game_title": "Проверочный проект", "idea_score": 7,
    "screenshot_paths": [],
    "scenes": [
        {"label": "ПЕРВЫЙ ВЗГЛЯД", "visual": "Проверка оформления", "dialogue": "Что интересного в этой игре?"},
        {"label": "ФАКТ ИЗ STEAM", "visual": "Тестовая карточка источника", "dialogue": "Стим описывает особенности проекта."},
        {"label": "ИТОГ", "visual": "Оценка идеи по источникам", "dialogue": "Итог: оценка идеи семь из десяти."},
    ],
}
with tempfile.TemporaryDirectory(prefix="review-smoke-") as temp:
    root = Path(temp)
    output = root / "review.mp4"
    video = render_short(script, output, root / "work")
    assert output.is_file() and output.stat().st_size > 1000
    assert video["width"] == 1080 and video["height"] == 1920 and video["fps"] >= 50
    audio = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries",
                            "stream=codec_type", "-of", "json", str(output)], check=True, capture_output=True, text=True)
    assert json.loads(audio.stdout)["streams"], "rendered Short has no audio stream"
    print("Synthetic Short rendered successfully:", json.dumps(video, ensure_ascii=False))
