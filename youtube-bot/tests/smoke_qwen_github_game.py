"""Private bounded vision-agent test on a pinned foreign GitHub game.

No video, publication, gameplay completion claim or model update. Only real
model actions are used. The game runs offline in the existing sandbox, not in
this process. Internal test acknowledgement is not a license to publish.
"""
import base64
import json
import os
from pathlib import Path
import sys
import tempfile

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import gameplay_2048 as game
from gameplay_bridge import BrowserBridge
from gameplay_qwen import QwenVisionAgent

with tempfile.TemporaryDirectory(prefix='qwen-github-game-') as temp:
    root = Path(temp) / 'game'
    game.unpack_archive(game.download_archive(), root)
    agent = QwenVisionAgent(
        'Play 2048: combine equal numbered tiles using arrow keys; choose one safe arrow action.',
        ('LEFT', 'RIGHT', 'UP', 'DOWN'))
    outcome = 'step_limit'
    with BrowserBridge(root, rights_acknowledged=True) as bridge:
        observation = bridge.receive(timeout=60)
        for step in range(4):
            if observation.get('type') != 'observation' or observation.get('step') != step:
                raise RuntimeError('Invalid or out-of-order bridge observation')
            png = base64.b64decode(observation['screenshot_png_base64'], validate=True)
            try:
                action = agent(png, step)
            except ValueError:
                outcome = 'invalid_model_action'
                break
            observation = bridge.step(action)
            if observation.get('type') != 'observation' or observation.get('step') != step + 1:
                raise RuntimeError('Bridge did not execute the action')
    result = {'game': '2048', 'source': 'https://github.com/gabrielecirulli/2048',
              'commit': game.COMMIT, 'model_variant': 'home-adapter' if os.environ.get('QWEN_GAME_ADAPTER_PATH') else 'base',
              'outcome': outcome, 'actions': agent.decisions, 'moves_attempted': len(agent.decisions),
              'actual_game_win_verified': False, 'video_recorded': False, 'published': False}
    print('QWEN_GITHUB_GAME_REPORT=' + json.dumps(result, ensure_ascii=True))
    print('::notice title=Qwen external GitHub gameplay test::' + json.dumps(result, ensure_ascii=True))
