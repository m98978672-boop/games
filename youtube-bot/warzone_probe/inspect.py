"""Inspect a private probe without claiming a played campaign or a review."""
import json
import subprocess
import sys
from pathlib import Path

folder = Path(sys.argv[1])
trace = json.loads((folder / 'trace.json').read_text())
assert trace['private_probe'] is True and trace['review_ready'] is False
video = folder / 'capture.mp4'
info = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_entries',
    'format=duration,size:stream=width,height,avg_frame_rate,codec_type', '-of', 'json', str(video)],
    check=True, capture_output=True, text=True, timeout=30).stdout)
stream = next(s for s in info['streams'] if s['codec_type'] == 'video')
summary = {'seconds': info['format']['duration'], 'bytes': info['format']['size'],
           'width': stream['width'], 'height': stream['height'], 'fps': stream['avg_frame_rate'],
           'model_actions': [x['action'] for x in trace['actions']], 'victory_verified': False,
           'commentary_present': any(s['codec_type'] == 'audio' for s in info['streams'])}
print('::notice::Private Warzone capture: ' + json.dumps(summary, ensure_ascii=True), flush=True)
