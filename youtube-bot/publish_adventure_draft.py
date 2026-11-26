"""Prepare a verified finite-adventure artifact for the existing publisher."""
import json
import os
import sys
import uuid
from pathlib import Path

from adventure_draft import GAME_URL, PUZZLE_URL
from gameplay_voiceover import probe_capture
import math
from publish_to_supabase import publish
from gameplay_policy import video_kind_for_duration
from schedule_policy import manual_publish_time


def prepare(folder: Path, run_id: str, publish_at: str) -> Path:
    from gameplay_release_gate import require_verified_gameplay_release
    # The gate re-derives every number from the files in this folder, and it
    # checks the rights record too: our own games carry "own", an external game
    # must carry a verified open licence. Asking for a second flag on top would
    # only mean somebody has to tick a box that proves nothing new.
    require_verified_gameplay_release(folder)
    if not run_id.isascii() or not run_id.isdecimal():
        raise ValueError('Expected a numeric capture run ID.')
    trace = json.loads((folder / 'trace.json').read_text(encoding='utf-8'))
    draft = json.loads((folder / 'pilot.json').read_text(encoding='utf-8'))
    puzzle = trace.get('game') == '16 Puzzle'
    game_finished = (trace.get('outcome') == 'game_reported_win' and type(trace.get('boards_won')) is int and trace['boards_won'] >= 1) if puzzle else (trace.get('game') == 'The Lost Artifact' and trace.get('outcome') == 'game_reported_victory')
    if not game_finished or draft.get('needs_continuation') is not False or draft.get('draft') != 'zuza-pilot.mp4':
        raise ValueError('This uploader accepts only the completed pilot, not an unfinished part.')
    video = folder / 'zuza-pilot.mp4'
    if not video.is_file() or video.is_symlink():
        raise ValueError('Missing regular pilot video.')
    gameplay = draft.get('edited_gameplay_seconds')
    if type(gameplay) not in (float, int) or not math.isfinite(gameplay) or gameplay <= 0:
        raise ValueError('Upload blocked: edited gameplay length is missing or invalid.')
    measured = probe_capture(video)
    if not math.isfinite(measured) or measured <= 0:
        raise ValueError('Upload blocked: recorded video length is unreadable.')
    # The owner's rule: a cut shorter than three minutes is a Short, anything
    # longer is a full video. This replaced a hard "must exceed ten minutes",
    # which would have blocked every short playthrough from publishing at all.
    video_format = video_kind_for_duration(measured)
    scheduled = manual_publish_time(publish_at).isoformat().replace('+00:00', 'Z')
    url = PUZZLE_URL if puzzle else GAME_URL
    description = (f'{url}\n\nПятнашки: решено досок — {trace["boards_won"]}. Qwen и планировщик; комментарий по журналу ходов.\n'
                   'Исходник: https://github.com/kunjgit/GameZone' if puzzle else
                   f'{url}\n\nThe Lost Artifact: прохождение Qwen. Русский комментарий по журналу ходов.\n'
                   'Авторы игры: Ritaban Ghosh и участники mini-js-games-hub.\n'
                   'Исходник: https://github.com/ritaban06/mini-js-games-hub')
    result = folder / 'publish.result.json'
    result.write_text(json.dumps({'metadata': {
        'job_id': str(uuid.uuid5(uuid.NAMESPACE_URL, f'{url}#capture-{run_id}')),
        'game_id': '16-puzzle' if puzzle else 'the-lost-artifact',
        'title': 'Qwen решает «Пятнашки» — игровая кампания' if puzzle else 'Qwen ищет потерянный артефакт — пробное прохождение',
        'description': description, 'tags': ['games', 'Qwen', '15-puzzle' if puzzle else 'The Lost Artifact'], 'category_id': '20', 'video_format': video_format,
        'video_path': str(video.resolve()), 'publish_at': scheduled, 'requested_publish_at': scheduled,
    }}, ensure_ascii=False), encoding='utf-8')
    return result


if __name__ == '__main__':
    folder, run_id, slot = sys.argv[1:]
    publish(prepare(Path(folder), run_id, slot))
