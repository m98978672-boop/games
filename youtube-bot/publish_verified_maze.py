"""One owner-approved pilot Short, not an exception for future recordings."""
import json
import subprocess
import sys
import uuid
from pathlib import Path

from publish_adventure_short import publish_checked
from publish_to_supabase import diagnostic_category


def prepare(folder):
    trace = json.loads((folder / 'trace.json').read_text())
    pilot = json.loads((folder / 'pilot.json').read_text())
    if (trace['game'] != 'Lost in the Maze 3D' or trace['furthest'] != 4
            or [e['level'] for e in trace['events'] if e['kind'] == 'portal'] != [2, 3, 4]
            or pilot['draft'] != 'zuza-pilot.mp4' or pilot['removed_fraction'] != 0
            or pilot['video_format'] != 'short'):
        raise ValueError('Unexpected maze milestone or edit')
    video = folder / 'zuza-pilot.mp4'
    raw = folder / 'recording.webm'
    if any(p.is_symlink() or not p.is_file() for p in (video, raw)):
        raise ValueError('Missing rendered or original recording')
    info = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(video)], timeout=30))
    if not (43 <= float(info['format']['duration']) <= 45 and
            any(s.get('codec_type') == 'video' and (s.get('width'), s.get('height')) == (1080, 1920) for s in info['streams']) and
            any(s.get('codec_type') == 'audio' for s in info['streams'])):
        raise ValueError('Unexpected duration, aspect ratio or missing audio')
    url = 'https://m98978672-boop.github.io/games/collection/lost-in-the-maze-3d/'
    out = folder / 'publish-maze.result.json'
    out.write_text(json.dumps({'metadata': {
        'job_id': str(uuid.uuid5(uuid.NAMESPACE_URL, f'{url}#45884136453')),
        'game_id': 'lost-in-the-maze-3d-three-portals', 'title': 'Три портала в лабиринте | Lost in the Maze 3D',
        'description': f'{url}\n\nПервые три портала, не полное прохождение. Бот выбирает маршрут по карте игры и управляет персонажем. Запись без вырезания геймплея.',
        'tags': ['Lost in the Maze 3D', 'Shorts'], 'category_id': '20', 'video_path': str(video.resolve()),
        'video_format': 'short',
    }}, ensure_ascii=False), encoding='utf-8')
    return out


if __name__ == '__main__':
    try:
        receipt = publish_checked(prepare(Path(sys.argv[1])), maze=True)
        if not receipt.get('video_id'):
            raise ValueError('No YouTube video ID in the receipt')
        print(f"::notice title=YouTube upload confirmed::https://www.youtube.com/watch?v={receipt['video_id']} at {receipt.get('publish_at')}")
    except Exception as exc:
        category, message = diagnostic_category(exc)
        print(f'::error title=Maze publication {category}::{message}')
        raise SystemExit(str(exc)) from None
