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
from gameplay.skill_memory import SkillMemory
from collections import deque
from puzzle_planner import recovery_route, solve
from puzzle_learning import learn_win, recall_move
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
memory = SkillMemory(os.environ.get('PUZZLE_SKILL_DB') or record / 'skills.sqlite3')
route = []
with tempfile.TemporaryDirectory(prefix='finite-puzzle-') as temp:
    game = Path(temp) / 'game'; game.mkdir()
    for name in ('index.html','style.css','script.js'):
        shutil.copyfile(root / name, game / name)
    with BrowserBridge(game, rights_acknowledged=True, record_dir=record, telemetry='puzzle') as bridge:
        obs = bridge.receive(timeout=120)
        def new_board(observation):
            setup = (observation.get('puzzle_telemetry') or {}).get('setup')
            if (not isinstance(setup, dict) or type(setup.get('x')) is not int or type(setup.get('y')) is not int
                    or not 0 <= setup['x'] < 800 or not 0 <= setup['y'] < 600):
                raise RuntimeError('Play button is not available')
            return bridge.step({'click': [setup['x'], setup['y']], 'duration_ms': 250})

        obs = new_board(obs)
        expected_step = 1
        wins, learned = 0, 0
        rounds = int(os.getenv('PUZZLE_CAMPAIGN_ROUNDS', '1'))
        if not 1 <= rounds <= 4:
            raise ValueError('Puzzle campaign must contain 1–4 boards')
        removed_seconds = 0.0
        last_stamp = 0.0
        before = validate_board(obs.get('puzzle_telemetry'))
        initial_solution = solve(before, max_nodes=8_000_000)
        best = distance(before)
        start = time.monotonic()
        hint = ''
        previous = None
        history = []
        planned = deque()
        planner_attempts = 0
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
            available = legal_indices(before)
            remaining = int(os.getenv('FINITE_GAME_SECONDS', '1800')) - (time.monotonic() - start)
            if not planned and (no_progress >= 6 or remaining < 120) and planner_attempts < 12:
                planner_attempts += 1
                direct = solve(before)
                fallback = recovery_route(route, initial_solution) if direct is None else None
                candidate = direct if direct is not None else fallback
                if candidate is not None and len(candidate) <= 600 - len(trace):
                    planned.extend(candidate)
                    if fallback:
                        print(f'PUZZLE_RECOVERY: undo verified moves, then follow the saved solution ({len(fallback)} clicks)', flush=True)
            index = planned.popleft() if planned else None
            source = 'planner' if index is not None else 'verified_memory'
            if index is None:
                index = recall_move(memory, before, legal)
            inference_seconds = 0.0
            if index is None:
                source = 'model'
                png = base64.b64decode(obs['screenshot_png_base64'],validate=True)
                inference_start = time.monotonic()
                agent(png, len(trace))
                inference_seconds = time.monotonic() - inference_start
                index = actions.index(agent.decisions[-1])
            if index not in available:
                raise RuntimeError('Selected puzzle move is not legal')
            tile_value = before[index]
            cell = diag['cells'][index]
            obs = bridge.step({'click':[cell['x'],cell['y']], 'duration_ms':250})
            expected_step += 1
            if obs.get('type') != 'observation' or obs.get('step') != expected_step:
                raise RuntimeError('Invalid action observation')
            after = validate_board(obs.get('puzzle_telemetry'))
            moved = verify_transition(before, after, index)
            if obs['puzzle_telemetry']['won'] and after != list(range(1, 16)) + [0]:
                raise RuntimeError('Reported win contradicts the puzzle board')
            if moved:
                route.append((before, index, after))
            else:
                planned.clear()
            points, hint = feedback(before, after, best=best, previous=previous, history=history)
            now = distance(after)
            if now < best:
                best, no_progress = now, 0
            else:
                no_progress += 1
            trace.append({'browser_frame_timing':obs.get('browser_frame_timing'), 'screenshot_ms':obs.get('screenshot_ms'),
                          'model_inference_seconds':round(inference_seconds, 3), 'step':len(trace)+1,'action':actions[index], 'action_source':source, 'round':wins + 1, 'tile':tile_value, 'game_reported_distance':now,
                          'feedback_score':points, 'move_verified':moved, 'blocked_immediate_undo':blocked, 'blocked_recent_states':recent_blocked, 'recording_elapsed_ms':obs.get('recording_elapsed_ms'),
                          'game_reported_win':obs['puzzle_telemetry']['won']})
            print('PUZZLE_STEP='+json.dumps(trace[-1]),flush=True)
            history = (history + [before])[-16:]
            previous, before = before, after
            stamp = max(last_stamp, (obs.get('recording_elapsed_ms') or 0) / 1000)
            if not moved and stamp - last_stamp > 6:
                removed_seconds += stamp - last_stamp - 4
            last_stamp = stamp
            if obs['puzzle_telemetry']['won']:
                wins += 1
                learned += learn_win(memory, route, reported_win=True)
                if wins >= rounds or (wins >= 2 and stamp - removed_seconds > 615):
                    outcome = 'game_reported_win'
                    break
                if remaining < 120 or len(trace) >= 599:
                    outcome = 'game_reported_win'
                    break
                obs = new_board(obs)
                expected_step += 1
                before = validate_board(obs.get('puzzle_telemetry'))
                route, history, previous = [], [], None
                planned.clear()
                initial_solution = solve(before, max_nodes=8_000_000)
                best, no_progress, planner_attempts, hint = distance(before), 0, 0, ''
                continue
            if no_progress >= 40 and not planned:
                outcome='no_measured_progress'; break
        video = bridge.finish_recording()
    info = json.loads(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_type',
                                     '-of','json',str(video)],check=True,capture_output=True,text=True,timeout=60).stdout)
    seconds = float(info['format']['duration'])
    if seconds <= 0 or not any(s.get('codec_type') == 'video' for s in info['streams']):
        raise RuntimeError('Invalid actual recording')
    memory.export(record / 'skills.json')
    memory.close()
    result = {'boards_won':wins, 'learned_positions':learned, 'memory_actions':sum(row['action_source'] == 'verified_memory' for row in trace), 'game':'16 Puzzle', 'source':'https://github.com/kunjgit/GameZone',
              'author':'Kunj Git contributors','game_code_license':'Apache-2.0',
              'asset_and_recording_rights_verified':False, 'outcome':outcome, 'duration_seconds':round(seconds,2),
              'duration_at_least_20_minutes':seconds>=1200,'qualifies_for_release':False,
              'model_actions':trace,'scripted_setup':True,'game_telemetry_untrusted':True,
              'legal_move_filter_is_external_help':True, 'anti_undo_filter_is_external_help':True, 'recent_state_filter_is_external_help':True,
              'board_text_is_external_help':True, 'two_stage_vision_enabled':True, 'feedback_is_session_context_not_training':True,
              'trained':False,'published':False}
    (record/'trace.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print('::notice title=Private finite puzzle experiment::'+json.dumps({k:v for k,v in result.items() if k != 'model_actions'} | {'action_count':len(trace), 'planner_actions':sum(row['action_source'] == 'planner' for row in trace)},ensure_ascii=True),flush=True)
