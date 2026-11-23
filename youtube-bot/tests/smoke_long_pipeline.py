"""Exercise all ten long-form chapters with real FFmpeg, in a small test format.

Synthetic speech and 320x180 keep this test cheap. It is NOT a production
1080p render or a YouTube upload; separate tests exercise real Piper and 1080p CFR.
"""
import json
import math
import struct
import subprocess
import sys
import tempfile
import wave
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import renderer

real_run = subprocess.run

def synthetic_speech(_text, output, **_kwargs):
    rate = 8000
    samples = b''.join(struct.pack('<h', int(4000 * math.sin(2 * math.pi * 440 * n / rate))) for n in range(rate))
    with wave.open(str(output), 'wb') as stream:
        stream.setnchannels(1)
        stream.setsampwidth(2)
        stream.setframerate(rate)
        stream.writeframes(samples * 18)
    return 18.0

def low_resolution_run(command, **kwargs):
    command = list(command)
    if '-vf' in command:
        i = command.index('-vf') + 1
        command[i] = command[i].replace('s=1920x1080', 's=320x180')
    if '-preset' in command:
        command[command.index('-preset') + 1] = 'ultrafast'
    return real_run(command, **kwargs)

def test_profile(path):
    probe = real_run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,width,height,avg_frame_rate',
                      '-show_entries', 'format=duration', '-of', 'json', str(path)],
                     check=True, capture_output=True, text=True)
    info = json.loads(probe.stdout)
    video = next(s for s in info['streams'] if s['codec_type'] == 'video')
    assert (video['width'], video['height'], video['avg_frame_rate']) == (320, 180, '50/1'), video
    assert any(s['codec_type'] == 'audio' for s in info['streams'])
    assert 190 <= float(info['format']['duration']) <= 195, info
    return {'width': 320, 'height': 180, 'fps': 50.0}

script = {'game_title': 'Тестовый проект', 'idea_score': 7, 'screenshot_paths': [],
          'scenes': [{'visual': f'Тестовая глава {n+1}', 'dialogue': 'Проверка звука и изображения.'} for n in range(10)]}
with tempfile.TemporaryDirectory(prefix='long-pipeline-') as temp:
    root = Path(temp)
    with patch.object(renderer, 'ffmpeg_executable', return_value='ffmpeg'), \
         patch.object(renderer, 'synthesize', side_effect=synthetic_speech), \
         patch.object(renderer, 'verify_video_profile', side_effect=test_profile), \
         patch.object(renderer.subprocess, 'run', side_effect=low_resolution_run):
        result = renderer.render_long_review(script, root / 'out.mp4', root / 'work')
    assert result['format'] == 'long-form' and 190 <= result['duration_seconds'] <= 195
    assert (root / 'out.mp4').stat().st_size > 1000
    print('Ten-chapter long pipeline passed (synthetic speech, reduced resolution, no upload):', json.dumps(result))
