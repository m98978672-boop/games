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
from game_reviews import validate_review

game = {
    'id':'test-game', 'title':'Проверочный проект',
    'description':'В этой тестовой игре игрок решает головоломки и ищет выход из лаборатории.',
    'features':['Игрок решает головоломки и ищет выход из лаборатории.', 'В игре указан одиночный режим.'],
}
script = validate_review({
    'schema_version':1, 'game_id':'test-game',
    'selected_feature_ids':['test-game-f1','test-game-f2'],
    'possible_minus':'Возможно, любителям сетевой игры не подойдёт одиночный режим.',
    'minus_feature_id':'test-game-f2', 'idea_score':7,
    'hook':'Коротко о том, как устроена эта игра.',
}, [game])
script['screenshot_paths'] = []
assert script['scenes'][0]['dialogue'].startswith('Привет! Сегодня в обзоре')
assert 'Проверочный проект' in script['scenes'][0]['dialogue']
assert 'О чём игра?' in script['scenes'][1]['dialogue']
assert 'Итог' in script['scenes'][-1]['dialogue']

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
