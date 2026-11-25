"""Verify the exported MP4 (not just a successful render step)."""
import json
import math
import os
import subprocess
import sys
from fractions import Fraction
from pathlib import Path


def validate_media(info, video_format):
    expected = {'short': (1080, 1920, 15, 60), 'long': (1920, 1080, 180, 600)}
    if video_format not in expected:
        raise ValueError('Unknown review format')
    width, height, minimum, maximum = expected[video_format]
    video = next((s for s in info['streams'] if s.get('codec_type') == 'video'), {})
    audio = next((s for s in info['streams'] if s.get('codec_type') == 'audio'), {})
    if (video.get('width'), video.get('height')) != (width, height) or Fraction(video.get('avg_frame_rate', '0')) != 50:
        raise ValueError('MP4 does not match the required resolution and 50 fps')
    duration = float(info['format']['duration'])
    # Timestamp and codec padding are allowed to differ by up to half a second.
    if not math.isfinite(duration) or not minimum - .5 <= duration <= maximum + .5:
        raise ValueError('MP4 duration is out of range')
    audio_seconds = float(audio.get('duration', 'nan'))
    if not math.isfinite(audio_seconds) or audio_seconds <= 0 or abs(duration - audio_seconds) > 1:
        raise ValueError('Missing or incomplete audio in the final MP4')
    return {'duration_seconds': round(duration, 3), 'audio_seconds': round(audio_seconds, 3),
            'width': width, 'height': height, 'fps': 50}


def verify(folder: Path):
    result = json.loads((folder / 'review.result.json').read_text(encoding='utf-8'))
    if result.get('status') != 'private_preview':
        raise ValueError('Unexpected result status')
    video = folder / 'review.mp4'
    probe = subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(video)],
                           check=True, capture_output=True, text=True, timeout=60)
    report = validate_media(json.loads(probe.stdout), result['format'])
    report['size_bytes'] = video.stat().st_size
    (folder / 'review.media.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    summary = os.getenv('GITHUB_STEP_SUMMARY')
    if summary:
        with open(summary, 'a', encoding='utf-8') as stream:
            stream.write(f"### Private review verified\n\n- MP4: {report['width']}×{report['height']}, {report['fps']} fps\n"
                         f"- Video: {report['duration_seconds']} s; audio: {report['audio_seconds']} s\n"
                         '- Download the recording from **Artifacts**. No YouTube upload was requested.\n')
    return report


if __name__ == '__main__':
    print(json.dumps(verify(Path(sys.argv[1]))))
