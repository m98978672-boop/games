"""Private baseline only: compare identical browser setup with/without recording.

Measures top-level requestAnimationFrame callback intervals, not actual presented
or encoded unique frames. No model is loaded; results cannot establish inference
contention or prove improvement. Only local reviewed game fixtures are used.
"""
import argparse
import json
import statistics
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay_bridge import BrowserBridge

parser = argparse.ArgumentParser()
parser.add_argument('--voxel', type=Path)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[2]
games = [('adventure', root/'collection/adventure-game', {}),
         ('puzzle', root/'collection/16-puzzle', {'telemetry':'puzzle'})]
if args.voxel:
    games.append(('voxel', args.voxel, {'telemetry':'voxel', 'bootstrap':'voxel', 'voxel_fast':True}))
results = []
with tempfile.TemporaryDirectory(prefix='fps-comparison-') as temp:
    for name, game, options in games:
        for recorded in (False, True):
            record = None
            if recorded:
                record = Path(temp)/f'{name}-recording'; record.mkdir()
            rows = []
            with BrowserBridge(game, rights_acknowledged=True, record_dir=record, **options) as bridge:
                obs = bridge.receive(timeout=180)
                if name == 'puzzle':
                    setup = (obs.get('puzzle_telemetry') or {}).get('setup')
                    if not setup: raise RuntimeError('Puzzle setup unavailable')
                    obs = bridge.step({'click':[setup['x'],setup['y']], 'duration_ms':250})
                if name == 'voxel' and (obs.get('voxel_performance') or {}).get('quality') != 'fast':
                    raise RuntimeError('Fast preset not confirmed')
                for _ in range(12):
                    action = {'duration_ms':500}
                    if name == 'voxel': action['look'] = [10, 0]
                    obs = bridge.step(action)
                    if obs.get('type') != 'observation': raise RuntimeError('Bridge action failed')
                    perf = obs.get('browser_frame_timing')
                    if not isinstance(perf,dict): raise RuntimeError('Timing unavailable')
                    rows.append({'browser_frame_timing':perf, 'screenshot_ms':obs.get('screenshot_ms'),
                                 'voxel_performance':obs.get('voxel_performance')})
                if recorded: bridge.finish_recording()
            fps = [r['browser_frame_timing']['fps'] for r in rows if r['browser_frame_timing']['fps'] is not None]
            results.append({'game':name, 'recording':recorded, 'model_loaded':False,
                'note':'top-level animation callbacks, not game or recorded unique-frame FPS; untrusted page',
                'median_callback_fps':round(statistics.median(fps),2) if fps else None, 'samples':rows})
            print(json.dumps(results[-1],ensure_ascii=True), flush=True)
            print(f"::notice title=Browser timing::{name}, recording={recorded}, median callback FPS={results[-1]['median_callback_fps']}; no model, not measured game FPS", flush=True)
args.output.parent.mkdir(parents=True,exist_ok=True)
args.output.write_text(json.dumps(results,indent=2),encoding='utf-8')
