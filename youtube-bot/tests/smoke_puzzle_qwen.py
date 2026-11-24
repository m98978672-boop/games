"""Private finite sliding-puzzle test. Never pads, claims training or uploads."""
import base64
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay_bridge import BrowserBridge
from gameplay_qwen import QwenVisionAgent, _vision_runtime, qwen_observe
from puzzle_supervisor import validate_board, legal_indices, distance, feedback, avoid_immediate_undo, avoid_recent_states, verify_transition, board_hint

root = Path(__file__).resolve().parents[2] / 'collection' / '16-puzzle'
record = Path(os.environ['PUZZLE_RECORD_DIR'])
actions = tuple('TILE'+c for c in 'ABCDEFGHIJKLMNOP')
base_goal = ('Solve the finite 15-puzzle: arrange numbers in ascending order, blank last. '
             'Positions A to P read left to right, top to bottom. Choose an allowed tile.')
agent = QwenVisionAgent(base_goal, actions, observer=qwen_observe)
_vision_runtime()  # Avoid wasting the active game session on loading weights.
trace, outcome, no_progress = [], 'time_limit', 0
with tempfile.TemporaryDirectory(prefix='finite-puzzle-') as temp:
    game = Path(temp) / 'game'; game.mkdir()
    for name in ('index.html','style.css','script.js'):
        shutil.copyfile(root / name, game / name)
    with BrowserBridge(game, rights_acknowledged=True, record_dir=record, telemetry='puzzle') as bridge:
        obs = bridge.receive(timeout=120)
        setup = (obs.get('puzzle_telemetry') or {}).get('setup')
        if (not isinstance(setup,dict) or type(setup.get('x')) is not int or type(setup.get('y')) is not int
            or not 0 <= setup['x'] < 800 or not 0 <= setup['y'] < 600):
            raise RuntimeError('Play button is not available')
        # One scripted setup click starts a random solvable game, not a model move.
        obs = bridge.step({'click':[setup['x'],setup['y']], 'duration_ms':250})
        before = validate_board(obs.get('puzzle_telemetry'))
        best = distance(before)
        start = time.monotonic()
        hint = ''
        previous = None
        history = []
        while time.monotonic() - start < int(os.getenv("FINITE_GAME_SECONDS", "1800")) and len(trace) < 600:
            diag = obs.get('puzzle_telemetry')
            if diag.get('won'):
                outcome = 'game_reported_win'; break
            legal = legal_indices(before)
            legal, blocked = avoid_immediate_undo(legal, before, previous)
            legal, recent_blocked = avoid_recent_states(legal, before, history)
            agent.allowed = tuple(actions[i] for i in legal)
            # Telemetry is validated and provided as external assistance, not learned knowledge.
            agent.objective = base_goal + ' ' + board_hint(before) + (' ' + hint if hint else '')
            png = base64.b64decode(obs['screenshot_png_base64'],validate=True)
            inference_start = time.monotonic()
            agent(png, len(trace))
            inference_seconds = time.monotonic() - inference_start
            index = actions.index(agent.decisions[-1])
            cell = diag['cells'][index]
            obs = bridge.step({'click':[cell['x'],cell['y']], 'duration_ms':250})
            if obs.get('type') != 'observation' or obs.get('step') != len(trace)+2:
                raise RuntimeError('Invalid action observation')
            after = validate_board(obs.get('puzzle_telemetry'))
            moved = verify_transition(before, after, index)
            if obs['puzzle_telemetry']['won'] and after != list(range(1, 16)) + [0]:
                raise RuntimeError('Reported win contradicts the puzzle board')
            points, hint = feedback(before, after, best=best, previous=previous, history=history)
            now = distance(after)
            if now < best:
                best, no_progress = now, 0
            else:
                no_progress += 1
            trace.append({'browser_frame_timing':obs.get('browser_frame_timing'), 'screenshot_ms':obs.get('screenshot_ms'),
                          'model_inference_seconds':round(inference_seconds, 3), 'step':len(trace)+1,'action':agent.decisions[-1], 'game_reported_distance':now,
                          'feedback_score':points, 'move_verified':moved, 'blocked_immediate_undo':blocked, 'blocked_recent_states':recent_blocked, 'recording_elapsed_ms':obs.get('recording_elapsed_ms'),
                          'game_reported_win':obs['puzzle_telemetry']['won']})
            print('PUZZLE_STEP='+json.dumps(trace[-1]),flush=True)
            history = (history + [before])[-16:]
            previous, before = before, after
            if obs['puzzle_telemetry']['won']:
                outcome='game_reported_win'; break
            if no_progress >= 40:
                outcome='no_measured_progress'; break
        video = bridge.finish_recording()
    info = json.loads(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_type',
                                     '-of','json',str(video)],check=True,capture_output=True,text=True,timeout=60).stdout)
    seconds = float(info['format']['duration'])
    if seconds <= 0 or not any(s.get('codec_type') == 'video' for s in info['streams']):
        raise RuntimeError('Invalid actual recording')
    result = {'game':'16 Puzzle', 'source':'https://github.com/kunjgit/GameZone',
              'author':'Kunj Git contributors','game_code_license':'Apache-2.0',
              'asset_and_recording_rights_verified':False, 'outcome':outcome, 'duration_seconds':round(seconds,2),
              'duration_at_least_20_minutes':seconds>=1200,'qualifies_for_release':False,
              'model_actions':trace,'scripted_setup':True,'game_telemetry_untrusted':True,
              'legal_move_filter_is_external_help':True, 'anti_undo_filter_is_external_help':True, 'recent_state_filter_is_external_help':True,
              'board_text_is_external_help':True, 'two_stage_vision_enabled':True, 'feedback_is_session_context_not_training':True,
              'trained':False,'published':False}
    (record/'trace.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print('::notice title=Private finite puzzle experiment::'+json.dumps(result,ensure_ascii=True),flush=True)
