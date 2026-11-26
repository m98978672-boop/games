"""Queue only the requested corrected SuperTuxKart recording after rechecking it."""
import json
import math
import subprocess
import sys
import uuid
from pathlib import Path

from publish_adventure_short import publish_checked
from publish_to_supabase import diagnostic_category
from schedule_policy import next_publish_slot
from verify_stk_race import verify

RUN_ID = '45854300179'


def prepare(folder, run_id):
    if str(run_id) != RUN_ID:
        raise ValueError('Unknown source for this authorized upload')
    verify(folder)
    draft = json.loads((folder / 'pilot.json').read_text(encoding='utf-8'))
    name = draft.get('draft')
    if name != 'zuza-pilot.mp4' or draft.get('removed_fraction') != 0 or draft.get('needs_continuation') is not False:
        raise ValueError('The corrected MP4 must contain the full finished race')
    path = folder / name
    if path.is_symlink() or not path.is_file():
        raise ValueError('Corrected race MP4 missing')
    media = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(path)], timeout=60))
    duration = float(media['format']['duration'])
    if not math.isfinite(duration) or not 0 < duration <= 370:
        raise ValueError('Invalid race video duration')
    video_format = 'short' if duration <= 180 else 'long'
    def valid_video(v):
        w, h = v.get('width', 0), v.get('height', 0)
        return v.get('codec_type') == 'video' and ((w, h) == (1080, 1920) if video_format == 'short' else w > h > 0)
    if not any(map(valid_video, media['streams'])) or not any(v['codec_type'] == 'audio' for v in media['streams']):
        raise ValueError('Unexpected race video orientation or missing narration')
    output = folder / 'publish-stk.result.json'
    output.write_text(json.dumps({'metadata': {
        'job_id': str(uuid.uuid5(uuid.NAMESPACE_URL, f'https://supertuxkart.net/#verified-race-{run_id}')),
        'game_id': 'supertuxkart-zen-garden', 'title': 'Четыре круга по Zen Garden | SuperTuxKart',
        'description': ('https://supertuxkart.net/\n\nГонка на Zen Garden от старта до подтверждённого финиша. '
                        'За рулём — встроенные пилоты SuperTuxKart. Заезд записан без вырезания геймплея.\n\n'
                        'Игра и визуальные материалы: команда SuperTuxKart и авторы ресурсов. '
                        'Сведения о лицензиях и авторах: https://packages.debian.org/supertuxkart-data'),
        'tags': ['SuperTuxKart', 'Zen Garden'], 'category_id': '20',
        'video_path': str(path.resolve()), 'video_format': video_format,
        'publish_at': next_publish_slot(video_format=video_format).isoformat().replace('+00:00', 'Z'),
    }}, ensure_ascii=False), encoding='utf-8')
    return output


if __name__ == '__main__':
    try:
        receipt = publish_checked(prepare(Path(sys.argv[1]), sys.argv[2]), stk=True)
        if receipt.get('video_id'):
            print(f"::notice title=YouTube upload confirmed::https://www.youtube.com/watch?v={receipt['video_id']} at {receipt.get('publish_at')}")
    except Exception as error:
        category, message = diagnostic_category(error)
        print(f'::error title=Race publication {category}::{message}')
        raise SystemExit(str(error)) from None
