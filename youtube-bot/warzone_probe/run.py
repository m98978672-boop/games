"""Private Warzone recording probe; failures are not victories or publishable reviews."""
import json
import os
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from strategy_qwen import StrategyQwen

CONTAINER = 'kvenya-warzone-private'

def call(*args, timeout=30, capture=False):
    return subprocess.run(['docker', *args], check=True, timeout=timeout, capture_output=capture)

def run(out):
    out.mkdir(parents=True, exist_ok=True)
    trace = []
    start = time.monotonic()
    call('run', '-d', '--name', CONTAINER, '--network', 'none', '--cap-drop', 'ALL',
         '--security-opt', 'no-new-privileges', '--pids-limit', '256', '--memory', '3g',
         '--cpus', '2', 'kvenya-warzone-private:1', capture=True)
    try:
        for _ in range(120):
            if subprocess.run(['docker', 'exec', CONTAINER, 'test', '-f', '/out/ready'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0: break
            if subprocess.run(['docker', 'inspect', '-f', '{{.State.Running}}', CONTAINER], capture_output=True, text=True).stdout.strip() != 'true':
                raise RuntimeError('Warzone container stopped before the desktop was ready')
            time.sleep(1)
        else: raise RuntimeError('Warzone desktop did not become ready')
        agent = StrategyQwen()
        for index in range(12):
            shot = call('exec', CONTAINER, 'python3', '/app/container.py', 'screenshot', capture=True).stdout
            action, command = agent.choose(shot)
            at = round(time.monotonic()-start, 2)
            call('exec', CONTAINER, 'python3', '/app/container.py', 'action', json.dumps(command), capture=True)
            trace.append({'step': index+1, 'elapsed_seconds': at, 'action': action, 'command': command})
            print(f'Action {index+1}: {action} at {at}s', flush=True)
            time.sleep(2)
    finally:
        (out / 'trace.json').write_text(json.dumps({'private_probe': True, 'victory_verified': False, 'review_ready': False, 'actions': trace}, ensure_ascii=False, indent=2))
        subprocess.run(['docker', 'exec', CONTAINER, 'touch', '/out/stop'], timeout=10, capture_output=True)
        try: subprocess.run(['docker', 'wait', CONTAINER], timeout=35, capture_output=True)
        except subprocess.TimeoutExpired: subprocess.run(['docker', 'stop', '-t', '5', CONTAINER], timeout=15, capture_output=True)
        with (out / 'container.log').open('wb') as log:
            subprocess.run(['docker', 'logs', CONTAINER], stdout=log, stderr=subprocess.STDOUT, timeout=15)
        # Container has no credentials or network; surface only a bounded log tail.
        tail = (out / 'container.log').read_text(errors='replace')[-3500:]
        print('Container log tail:', tail, flush=True)
        if not trace:
            print('::error::Warzone startup log: ' + tail.replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A'), flush=True)
        subprocess.run(['docker', 'cp', CONTAINER+':/out/capture.mp4', str(out/'capture.mp4')], timeout=60, capture_output=True)
        subprocess.run(['docker', 'rm', '-f', CONTAINER], timeout=15, capture_output=True)

if __name__ == '__main__':
    try:
        run(Path(sys.argv[1]))
    except Exception:
        import traceback
        error = traceback.format_exc()[-3500:]
        print('::error::Private probe failed: ' + error.replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A'), flush=True)
        raise

