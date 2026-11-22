"""Private bounded vision-agent test on a pinned foreign GitHub game.

An ephemeral video is recorded for verification; no publication, completion claim or model update. Only real
model actions are used. The game runs offline in the existing sandbox, not in
this process. Internal test acknowledgement is not a license to publish.
"""
import base64
import json
import os
import subprocess
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
        ('LEFT', 'RIGHT', 'UP', 'DOWN'), avoid_stalled_actions=True)
    outcome = 'step_limit'
    trace = []
    recording = Path(temp) / 'recording'
    recording.mkdir()
    with BrowserBridge(root, rights_acknowledged=True, record_dir=recording) as bridge:
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
            elapsed = observation.get('recording_elapsed_ms')
            if type(elapsed) is not int or elapsed < 0 or (trace and elapsed < trace[-1]['observed_ms']):
                raise RuntimeError('Invalid recording observation clock')
            trace.append({'step': step + 1, 'action': agent.decisions[-1], 'observed_ms': elapsed})
        video = bridge.finish_recording()
    info = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=codec_type', '-of', 'json', str(video)], check=True, capture_output=True, text=True, timeout=60).stdout)
    duration = float(info['format']['duration'])
    if duration <= 0 or not any(stream.get('codec_type') == 'video' for stream in info['streams']):
        raise RuntimeError('Game recording could not be verified')
    if trace and trace[-1]['observed_ms'] / 1000 > duration + 2:
        raise RuntimeError('Observation clock exceeds recording duration')
    result = {'game': '2048', 'source': 'https://github.com/gabrielecirulli/2048',
              'commit': game.COMMIT, 'model_variant': 'home-adapter' if os.environ.get('QWEN_GAME_ADAPTER_PATH') else 'base',
              'outcome': outcome, 'actions': agent.decisions, 'stall_filter_enabled': True, 'filtered_steps': agent.filtered_steps, 'action_observations': trace, 'moves_attempted': len(agent.decisions),
              'actual_game_win_verified': False, 'video_recorded': True, 'recording_seconds': round(duration, 2), 'recording_retained': False, 'published': False}
    print('QWEN_GITHUB_GAME_REPORT=' + json.dumps(result, ensure_ascii=True))
    print('::notice title=Qwen external GitHub gameplay test::' + json.dumps(result, ensure_ascii=True))
