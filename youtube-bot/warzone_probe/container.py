"""Minimal isolated desktop: no network, credentials, publication, or game AI."""
import json
import os
import signal
import subprocess
import sys
import time
from pathlib import Path
sys.path.insert(0, '/app')
from strategy_desktop import IsolatedStrategyDesktop

OUT = Path('/out')

def desktop():
    state = json.loads((OUT / 'window.json').read_text())
    return IsolatedStrategyDesktop(display=':93', window_id=state['window'], game_pid=state['pid'], isolation_acknowledged=True)

def serve():
    xvfb = subprocess.Popen(['Xvfb', ':93', '-screen', '0', '800x600x24', '-nolisten', 'tcp'])
    game = rec = None
    try:
        time.sleep(2)
        if xvfb.poll() is not None:
            raise RuntimeError('Virtual display failed to start')
        game = subprocess.Popen(['warzone2100', '--fullscreen', '--resolution=800x600', '--nosound'])
        for _ in range(90):
            if game.poll() is not None:
                raise RuntimeError(f'Game exited with status {game.returncode}')
            result = subprocess.run(['xdotool', 'search', '--onlyvisible', '--pid', str(game.pid)], capture_output=True, text=True)
            if result.returncode == 0 and result.stdout.strip():
                window = int(result.stdout.splitlines()[0]); break
            time.sleep(1)
        else:
            raise RuntimeError('Game window did not appear')
        (OUT / 'window.json').write_text(json.dumps({'window': window, 'pid': game.pid}))
        desktop()  # Verify dimensions, position and PID before any model action.
        rec = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'warning', '-f', 'x11grab', '-video_size', '800x600', '-framerate', '20', '-i', ':93.0', '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', str(OUT / 'capture.mp4')], stdin=subprocess.PIPE)
        time.sleep(3)
        if rec.poll() is not None:
            raise RuntimeError('Recording could not start')
        (OUT / 'ready').write_text('ready')
        while game.poll() is None and rec.poll() is None and not (OUT / 'stop').exists():
            time.sleep(1)
    finally:
        if rec and rec.poll() is None:
            rec.stdin.write(b'q\n'); rec.stdin.flush()
            try: rec.wait(timeout=20)
            except subprocess.TimeoutExpired: rec.terminate(); rec.wait(timeout=5)
        for process in (game, xvfb):
            if process and process.poll() is None:
                process.terminate()
                try: process.wait(timeout=10)
                except subprocess.TimeoutExpired: process.kill(); process.wait()

if __name__ == '__main__':
    if sys.argv[1:] == ['serve']:
        serve()
    elif sys.argv[1:] == ['screenshot']:
        sys.stdout.buffer.write(desktop().screenshot())
    elif len(sys.argv) == 3 and sys.argv[1] == 'action':
        desktop().act(json.loads(sys.argv[2]))
    else:
        raise SystemExit('Invalid request')
