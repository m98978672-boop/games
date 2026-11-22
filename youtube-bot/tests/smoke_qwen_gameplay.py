"""Real Qwen vision + isolated browser bridge, synthetic two-stage game, no upload.

The model is not told the stage sequence. Only its own choices drive the game.
Failure to solve is reported as a model result, never replaced by scripted moves.
"""
import base64
import io
import json
import tempfile
from pathlib import Path
import sys
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay_bridge import BrowserBridge
from gameplay_qwen import QwenVisionAgent

HTML = '''<!doctype html><html><style>
body {margin:0;background:white;font-family:Arial;text-align:center}
#status {position:absolute;top:0;left:0;width:100px;height:100px;background:black}
#arrow {font:bold 230px Arial;color:black;line-height:360px}
#label {font:bold 72px Arial;color:black}
</style><body><div id="status"></div><div id="arrow">→</div><div id="label">RIGHT</div>
<script>let stage=0;
window.addEventListener('keydown', e => {
 if(stage===0 && e.code==='ArrowRight'){stage=1;document.querySelector('#arrow').textContent='←';document.querySelector('#label').textContent='LEFT';}
 else if(stage===1 && e.code==='ArrowLeft'){stage=2;document.querySelector('#status').style.background='rgb(0,200,0)';document.querySelector('#arrow').textContent='✓';document.querySelector('#label').textContent='DONE';}
});</script></body></html>'''

def success(obs):
    png = base64.b64decode(obs['screenshot_png_base64'], validate=True)
    return Image.open(io.BytesIO(png)).convert('RGB').getpixel((20, 20)) == (0, 200, 0)

with tempfile.TemporaryDirectory(prefix='qwen-game-') as temp:
    game = Path(temp) / 'game'
    game.mkdir()
    (game / 'index.html').write_text(HTML, encoding='utf-8')
    agent = QwenVisionAgent('Follow the large arrow displayed in the center of the screen.', ('LEFT', 'RIGHT'))
    outcome = 'not_completed'
    with BrowserBridge(game, rights_acknowledged=True) as bridge:
        obs = bridge.receive(timeout=60)
        for step in range(4):
            assert obs['type'] == 'observation' and obs['step'] == step, obs
            image = base64.b64decode(obs['screenshot_png_base64'], validate=True)
            try:
                action = agent(image, step)
            except ValueError:
                outcome = 'invalid_model_action'
                break
            obs = bridge.step(action)
            assert obs['type'] == 'observation', obs
            if success(obs):
                outcome = 'completed'
                break
    report = {'outcome': outcome, 'qwen_actions': agent.decisions,
              'model': 'Qwen/Qwen3.5-0.8B', 'game': 'two-stage visual arrow test',
              'model_finetuned': False, 'published': False}
    print('QWEN_GAMEPLAY_REPORT=' + json.dumps(report, ensure_ascii=True))
    print(f"::notice title=Qwen gameplay test::{json.dumps(report, ensure_ascii=True)}")

# Also try one model-selected action on the repository's driving game. A visual
# change alone is not proof that the model has learned to drive or opened it.
import shutil
from PIL import ImageChops, ImageStat
repo = Path(__file__).resolve().parents[2]
with tempfile.TemporaryDirectory(prefix='qwen-taxi-') as temp:
    root = Path(temp) / 'public'
    root.mkdir()
    shutil.copytree(repo / 'night-taxi', root / 'night-taxi', ignore=shutil.ignore_patterns('node_modules', 'tests', 'src', 'package*.json'))
    shutil.copytree(repo / 'shared', root / 'shared')
    agent = QwenVisionAgent('In Night Taxi open the driver tablet. TABLET presses the tablet key; WAIT does nothing.', ('TABLET', 'WAIT'))
    with BrowserBridge(root, rights_acknowledged=True, entry='night-taxi/index.html') as bridge:
        bridge.receive(timeout=60)
        before = bridge.step({'duration_ms': 2000})
        png = base64.b64decode(before['screenshot_png_base64'], validate=True)
        try:
            action = agent(png, 0)
        except ValueError:
            result = {'outcome': 'invalid_model_action', 'qwen_actions': [], 'published': False}
        else:
            after = bridge.step(action)
            assert after['type'] == 'observation', after
            picture1 = Image.open(io.BytesIO(png)).convert('RGB')
            picture2 = Image.open(io.BytesIO(base64.b64decode(after['screenshot_png_base64']))).convert('RGB')
            delta = sum(ImageStat.Stat(ImageChops.difference(picture1, picture2)).mean) / 3
            result = {'outcome': 'action_executed', 'qwen_actions': agent.decisions,
                      'screen_changed': delta >= 2.0, 'published': False}
    print('QWEN_NIGHT_TAXI_REPORT=' + json.dumps(result, ensure_ascii=True))
    print(f"::notice title=Qwen Night Taxi test::{json.dumps(result, ensure_ascii=True)}")
