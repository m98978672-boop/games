"""Prepare a verified finite-adventure artifact for the existing publisher."""
import json
import os
import sys
import uuid
from pathlib import Path

from adventure_draft import GAME_URL, MIN_EDITED_GAMEPLAY_SECONDS
from gameplay_voiceover import probe_capture
import math
from publish_to_supabase import publish
from schedule_policy import manual_publish_time


def prepare(folder: Path, run_id: str, publish_at: str, *, rights_verified: bool) -> Path:
    if not rights_verified:
        raise ValueError('Public recording/asset rights must be explicitly verified first.')
    if not run_id.isascii() or not run_id.isdecimal():
        raise ValueError('Expected a numeric capture run ID.')
    trace = json.loads((folder / 'trace.json').read_text(encoding='utf-8'))
    draft = json.loads((folder / 'pilot.json').read_text(encoding='utf-8'))
    if trace.get('game') != 'The Lost Artifact' or trace.get('outcome') != 'game_reported_victory' or draft.get('needs_continuation') is not False or draft.get('draft') != 'zuza-pilot.mp4':
        raise ValueError('This uploader accepts only the completed pilot, not an unfinished part.')
    video = folder / 'zuza-pilot.mp4'
    if not video.is_file() or video.is_symlink():
        raise ValueError('Missing regular pilot video.')
    gameplay = draft.get('edited_gameplay_seconds')
    if (type(gameplay) not in (float, int) or not math.isfinite(gameplay)
            or gameplay < MIN_EDITED_GAMEPLAY_SECONDS
            or probe_capture(video) < MIN_EDITED_GAMEPLAY_SECONDS):
        raise ValueError('Upload blocked: at least 10 minutes of edited gameplay are required; closing holds do not count.')
    scheduled = manual_publish_time(publish_at).isoformat().replace('+00:00', 'Z')
    result = folder / 'publish.result.json'
    result.write_text(json.dumps({'metadata': {
        'job_id': str(uuid.uuid5(uuid.NAMESPACE_URL, f'{GAME_URL}#capture-{run_id}')),
        'game_id': 'the-lost-artifact', 'title': 'Qwen ищет потерянный артефакт — пробное прохождение',
        'description': f'{GAME_URL}\n\nThe Lost Artifact: прохождение Qwen. Русский комментарий по журналу ходов.\n'
                       'Авторы игры: Ritaban Ghosh и участники mini-js-games-hub.\n'
                       'Исходник: https://github.com/ritaban06/mini-js-games-hub',
        'tags': ['games', 'Qwen', 'The Lost Artifact'], 'category_id': '20', 'video_format': 'long',
        'video_path': str(video.resolve()), 'publish_at': scheduled, 'requested_publish_at': scheduled,
    }}, ensure_ascii=False), encoding='utf-8')
    return result


if __name__ == '__main__':
    folder, run_id, slot = sys.argv[1:]
    publish(prepare(Path(folder), run_id, slot, rights_verified=os.environ.get('ADVENTURE_RECORDING_RIGHTS_VERIFIED') == 'true'))
