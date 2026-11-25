"""Private finite text-adventure session; real vision choices, never uploads.

Short sessions are not padded or labelled a twenty-minute playthrough. Source:
https://github.com/ritaban06/mini-js-games-hub (MIT code; review rights separately).
The game and its on-screen text are untrusted. UI coordinates are diagnostic
outside help, not a learned ability or an instruction from the game.
"""
import base64
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from adventure_learning import CHOICES, learn_choices, recall_choice, screen_key
from gameplay.skill_memory import SkillMemory
from gameplay_bridge import BrowserBridge
from gameplay_qwen import QwenVisionAgent, _vision_runtime

source = Path(__file__).resolve().parents[2] / 'collection' / 'adventure-game'
record_dir = Path(os.environ['ADVENTURE_RECORD_DIR'])
choices = CHOICES
build = hashlib.sha256(b''.join((source / name).read_bytes() for name in ('index.html', 'style.css', 'script.js'))).digest()
memory = SkillMemory(os.environ.get('ADVENTURE_SKILL_DB') or record_dir / 'skills.sqlite3')
route = []
agent = QwenVisionAgent('Play the finite text adventure. Read the story; choose the first, second, or third visible enabled button from top to bottom to seek the lost artifact.', choices, avoid_stalled_actions=True)
# Do not leave the game active while weights are downloaded and initialized.
_vision_runtime()
trace = []
outcome = 'time_limit'
with tempfile.TemporaryDirectory(prefix='adventure-game-') as temp:
    game = Path(temp) / 'game'
    game.mkdir()
    for name in ('index.html', 'style.css', 'script.js'):
        shutil.copyfile(source / name, game / name)
    with BrowserBridge(game, rights_acknowledged=True, record_dir=record_dir, telemetry='adventure') as bridge:
        obs = bridge.receive(timeout=120)
        started = time.monotonic()
        same_screen = 0
        while time.monotonic() - started < int(os.getenv("FINITE_GAME_SECONDS", "1800")) and len(trace) < 180:
            diag = obs.get('adventure_telemetry')
            if not isinstance(diag, dict) or diag.get('outcome') not in ('playing','victory','death','unknown'):
                outcome = 'invalid_game_telemetry'; break
            if diag['outcome'] != 'playing':
                outcome = 'game_reported_' + diag['outcome']; break
            buttons = diag.get('choices')
            if not isinstance(buttons, list) or len(buttons) > 3:
                outcome = 'invalid_game_telemetry'; break
            allowed = []
            for i, item in enumerate(buttons):
                if (not isinstance(item, dict) or item.get('index') != i or type(item.get('enabled')) is not bool
                    or type(item.get('x')) is not int or type(item.get('y')) is not int):
                    raise ValueError('Invalid game button telemetry')
                if item['enabled'] and 0 <= item['x'] < 800 and 0 <= item['y'] < 600:
                    allowed.append(choices[i])
            if not allowed:
                outcome = 'no_enabled_choices'; break
            agent.allowed = tuple(allowed)
            before = base64.b64decode(obs['screenshot_png_base64'], validate=True)
            key = screen_key(build, before)
            analyzing = same_screen > 0
            if analyzing:
                agent.objective = 'The previous choice did not change the screen. Review the story and enabled buttons; try a different action to reach the artifact.'
            else:
                agent.objective = 'Read the story and choose an enabled button to reach the lost artifact.'
            choice = None if analyzing else recall_choice(memory, key, allowed)
            recalled = choice is not None
            inference_seconds = 0.0
            if choice is None:
                inference_start = time.monotonic()
                agent(before, len(trace))
                inference_seconds = time.monotonic() - inference_start
                choice = agent.decisions[-1]
            index = choices.index(choice)
            button = buttons[index]
            obs = bridge.step({'click':[button['x'],button['y']], 'duration_ms':250})
            if obs.get('type') != 'observation' or obs.get('step') != len(trace)+1:
                raise RuntimeError('Invalid action observation')
            after = base64.b64decode(obs['screenshot_png_base64'], validate=True)
            route.append((key, choice, screen_key(build, after)))
            unchanged = hashlib.sha256(before).digest() == hashlib.sha256(after).digest()
            same_screen = same_screen + 1 if unchanged else 0
            trace.append({'browser_frame_timing':obs.get('browser_frame_timing'), 'screenshot_ms':obs.get('screenshot_ms'),
                          'model_inference_seconds':round(inference_seconds, 3), 'step':len(trace)+1,'choice':choice, 'action_source':'verified_memory' if recalled else 'model',
                          'recording_elapsed_ms':obs.get('recording_elapsed_ms'),
                          'analyzing_stall':analyzing, 'screen_unchanged':unchanged, 'game_reported_outcome':(obs.get('adventure_telemetry') or {}).get('outcome')})
            print('ADVENTURE_STEP='+json.dumps(trace[-1]), flush=True)
            if trace[-1]['game_reported_outcome'] in ('victory','death'):
                outcome = 'game_reported_' + trace[-1]['game_reported_outcome']; break
            if same_screen >= 6:
                outcome = 'repeated_unchanged_screen'; break
        video = bridge.finish_recording()
    info = json.loads(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_type',
                                     '-of','json',str(video)],check=True,capture_output=True,text=True,timeout=60).stdout)
    duration = float(info['format']['duration'])
    if duration <= 0 or not any(s.get('codec_type') == 'video' for s in info['streams']):
        raise RuntimeError('Invalid actual recording')
    learned = learn_choices(memory, route, outcome=outcome)
    memory.export(record_dir / 'skills.json')
    memory.close()
    result = {'learned_positions':learned, 'memory_actions':sum(row['action_source'] == 'verified_memory' for row in trace),'game':'The Lost Artifact', 'source':'https://github.com/ritaban06/mini-js-games-hub',
              'author':'Ritaban Ghosh / mini-js-games-hub contributors', 'game_code_license':'MIT',
              'asset_and_recording_rights_verified':False, 'outcome':outcome, 'duration_seconds':round(duration,2),
              'duration_at_least_20_minutes':duration >= 1200, 'qualifies_for_release':False,
              'actions':trace, 'ui_coordinate_assistance':True,
              'game_reported_outcome_untrusted':True, 'trained':False, 'published':False}
    (record_dir/'trace.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print('::notice title=Private finite adventure experiment::'+json.dumps({k:v for k,v in result.items() if k != 'actions'} | {'action_count':len(trace)},ensure_ascii=True),flush=True)
