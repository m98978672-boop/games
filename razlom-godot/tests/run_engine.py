"""Real Godot import/integration runner. A zero process code alone is NOT enough.
Usage: python razlom-godot/tests/run_engine.py --engine /path/to/godot
"""
import argparse
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--engine', required=True)
parser.add_argument('--minimal-build', action='store_true', help='Record and allow only exact no-renderer/fontconfig messages from the local headless-only build')
parser.add_argument('--report', default=str(ROOT / 'tests/engine-results.json'))
args = parser.parse_args()
engine = str(Path(args.engine).resolve())
checks = []
started = time.monotonic()
with tempfile.TemporaryDirectory(prefix='razlom-runtime-') as runtime:
    os.chmod(runtime, 0o700)
    env = {**os.environ, 'XDG_RUNTIME_DIR': runtime, 'GODOT_SILENCE_ROOT_WARNING': '1'}
    jobs = [
        ('import', ['--editor', '--quit'], None, 180),
        ('smoke', ['--script', 'res://tests/smoke.gd'], 'PASS: Godot state', 60),
        ('mission', ['--script', 'res://tests/mission.gd'], 'failures: 0', 90),
        ('perception', ['--script', 'res://tests/perception.gd'], 'failures: 0', 60),
        ('destruction', ['--script', 'res://tests/destruction.gd'], 'failures: 0', 60),
        ('presentation', ['--script', 'res://tests/presentation.gd'], 'failures: 0', 60),
        ('ai-memory', ['--script', 'res://tests/ai_memory.gd'], 'failures: 0', 60),
        ('mobile-story', ['--script', 'res://tests/mobile_story.gd'], 'failures: 0', 60),
        ('character-story', ['--script', 'res://tests/character_story.gd'], 'failures: 0', 60),
        ('touch-camera', ['--script', 'res://tests/touch_camera.gd'], 'failures: 0', 60),
        ('weapon-viewmodel', ['--script', 'res://tests/weapon_viewmodel.gd'], 'failures: 0', 60),
        ('weapon-pickup', ['--script', 'res://tests/weapon_pickup.gd'], 'failures: 0', 60),
        ('combat-animation', ['--script', 'res://tests/combat_animation.gd'], 'failures: 0', 60),
        ('body-reactions', ['--script', 'res://tests/body_reactions.gd'], 'failures: 0', 90),
        ('quests', ['--script', 'res://tests/quests.gd'], 'failures: 0', 90),
        ('ballistics', ['--script', 'res://tests/ballistics.gd'], 'failures: 0', 90),
        ('local-damage', ['--script', 'res://tests/local_damage.gd'], 'failures: 0', 60),
    ]
    for name, flags, marker, timeout in jobs:
        command = [engine, '--headless', '--path', str(ROOT), *flags]
        try:
            run = subprocess.run(command, env=env, capture_output=True, text=True, timeout=timeout)
            output = run.stdout + run.stderr
            diagnostics = [line.strip() for line in output.splitlines()
                           if any(s in line for s in ('SCRIPT ERROR:', 'ERROR:', 'FAIL:'))]
            allowed = {'ERROR: No renderers available.',
                       'ERROR: Godot was compiled without fontconfig, system font support is disabled.'} if args.minimal_build else set()
            accepted = [line for line in diagnostics if line in allowed]
            unexpected = [line for line in diagnostics if line not in allowed]
            errors = bool(unexpected)
            ok = run.returncode == 0 and not errors and (marker is None or marker in output)
            record = {'name': name, 'exitCode': run.returncode, 'passed': ok,
                      'command': command, 'output': output, 'acceptedBuildLimitations': accepted,
                      'unexpectedDiagnostics': unexpected}
        except subprocess.TimeoutExpired as error:
            record = {'name': name, 'passed': False, 'timeoutSeconds': timeout,
                      'output': str(error)}
        checks.append(record)
        print(f"{'PASS' if record['passed'] else 'FAIL'}: {name}", flush=True)
        print(record['output'], flush=True)
        # Import errors make later results meaningless. Save diagnostics immediately.
        if name == 'import' and not record['passed']:
            break
report = {'kind': 'actual-godot-headless-integration', 'engine': engine,
          'elapsedSeconds': round(time.monotonic() - started, 3), 'checks': checks,
          'passed': len(checks) == len(jobs) and all(c['passed'] for c in checks),
          'limitations': ['Headless dummy renderer; no image/audio validation',
                          'Automated mission uses teleportation and frozen enemy ticks for isolation',
                          'Separate perception test exercises actual physics rays and navigation',
                          'Not a complete campaign or a human playthrough']}
Path(args.report).write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
raise SystemExit(0 if report['passed'] else 1)
