"""Validate and schedule the finished, explicitly enabled adventure beta."""
import json
import math
import os
import subprocess
import sys
import uuid
from pathlib import Path

from adventure_draft import GAME_URL
from publish_to_supabase import publish
from schedule_policy import manual_publish_time, next_publish_slot


def prepare(folder, run_id, requested_slot=None):
    if os.getenv('ADVENTURE_RECORDING_RIGHTS_VERIFIED') != 'true':
        raise ValueError('Recording and asset rights are not confirmed')
    trace = json.loads((folder / 'trace.json').read_text(encoding='utf-8'))
    draft = json.loads((folder / 'pilot.json').read_text(encoding='utf-8'))
    if (trace.get('game') != 'The Lost Artifact' or trace.get('outcome') != 'game_reported_victory'
            or trace.get('short') is not True or draft.get('short') is not True
            or draft.get('needs_continuation') is not False or draft.get('draft') != 'zuza-adventure-short.mp4'):
        raise ValueError('Expected a completed adventure Short')
    video = folder / 'zuza-adventure-short.mp4'
    if video.is_symlink() or not video.is_file():
        raise ValueError('Missing Short MP4')
    info = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(video)], timeout=60))
    duration = float(info['format']['duration'])
    if (not math.isfinite(duration) or not 0 < duration <= 180
            or not any(s.get('codec_type') == 'video' and (s.get('width'), s.get('height')) == (1080, 1920) for s in info['streams'])
            or not any(s.get('codec_type') == 'audio' for s in info['streams'])):
        raise ValueError('Short must have vertical 1080×1920 video and audio and be at most 180 seconds')
    scheduled = manual_publish_time(requested_slot) if requested_slot else next_publish_slot(video_format='short')
    slot = scheduled.isoformat().replace('+00:00', 'Z')
    result = folder / 'publish-short.result.json'
    result.write_text(json.dumps({'metadata': {
        'job_id': str(uuid.uuid5(uuid.NAMESPACE_URL, f'{GAME_URL}#beta-short-{run_id}')),
        'game_id': 'the-lost-artifact-beta', 'title': 'Бета — Qwen ищет потерянный артефакт',
        'description': f'{GAME_URL}\n\nПробный летсплей Qwen с русскими комментариями по событиям игры.\n'
                       'Авторы: Ritaban Ghosh и участники mini-js-games-hub.\n'
                       'Исходник: https://github.com/ritaban06/mini-js-games-hub',
        'tags': ['games', 'Qwen', 'The Lost Artifact', 'Shorts'], 'category_id': '20',
        'video_format': 'short', 'video_path': str(video.resolve()), 'publish_at': slot,
        'requested_publish_at': slot if requested_slot else None,
    }}, ensure_ascii=False), encoding='utf-8')
    return result


if __name__ == '__main__':
    publish(prepare(Path(sys.argv[1]), sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None))
