"""Validate and schedule the finished, explicitly enabled adventure beta."""
import json
import math
import os
import subprocess
import sys
import uuid
from pathlib import Path
from datetime import datetime, timedelta, timezone

from adventure_draft import GAME_URL
from publish_to_supabase import publish, read_queue, diagnostic_category, PublishError
from review_slot_state import planned_slots
from schedule_policy import manual_publish_time, next_publish_slot


REVIEWED_RELAY_RUN = '45835569880'


def prepare(folder, run_id, requested_slot=None, *, lighthouse=False, revoice=False, relay=False):
    if relay and str(run_id) != REVIEWED_RELAY_RUN:
        raise ValueError('Only the explicitly requested Relay 3D experiment can use this release path')
    if not relay:
        from gameplay_release_gate import require_verified_gameplay_release
        require_verified_gameplay_release(folder)
    if revoice and not lighthouse:
        raise ValueError('Voice revision is only permitted for the reviewed Lighthouse capture')
    if not (lighthouse or relay) and os.getenv('ADVENTURE_RECORDING_RIGHTS_VERIFIED') != 'true':
        raise ValueError('Recording and asset rights are not confirmed')
    trace = json.loads((folder / 'trace.json').read_text(encoding='utf-8'))
    draft = json.loads((folder / 'pilot.json').read_text(encoding='utf-8'))
    game = 'Ретранслятор 3D' if relay else 'Последний сигнал' if lighthouse else 'The Lost Artifact'
    completed = trace.get('outcome') in ({'game_reported_victory', 'game_reported_death'} if lighthouse else {'game_reported_victory'})
    if lighthouse:
        completed = completed and isinstance(trace.get('actions'), list) and len(trace['actions']) == 12
    if (trace.get('game') != game or not completed
            or trace.get('short') is not True
            or draft.get('needs_continuation') is not False or draft.get('draft') != 'zuza-adventure-short.mp4'):
        raise ValueError('Expected a completed adventure Short')
    video = folder / 'zuza-adventure-short.mp4'
    if video.is_symlink() or not video.is_file():
        raise ValueError('Missing Short MP4')
    info = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(video)], timeout=60))
    duration = float(info['format']['duration'])
    short = draft.get('short') is True
    video_format = 'short' if short else 'long'
    dimension_ok = any(s.get('codec_type') == 'video' and
                       ((s.get('width'), s.get('height')) == (1080, 1920) if short else
                        s.get('width', 0) > s.get('height', 0) > 0) for s in info['streams'])
    if (not math.isfinite(duration) or not (0 < duration <= 180 if short else duration > 180)
            or not dimension_ok
            or not any(s.get('codec_type') == 'audio' for s in info['streams'])):
        raise ValueError('Expected vertical Short up to 180 seconds or landscape long video over 180 seconds, with audio')
    scheduled = manual_publish_time(requested_slot) if requested_slot else next_publish_slot(video_format=video_format)
    slot = scheduled.isoformat().replace('+00:00', 'Z')
    url = GAME_URL.replace('adventure-game/', 'relay-3d/' if relay else 'lighthouse-relay/') if (relay or lighthouse) else GAME_URL
    revision = '-voice-v2' if revoice else ''
    result = folder / 'publish-short.result.json'
    result.write_text(json.dumps({'metadata': {
        'job_id': str(uuid.uuid5(uuid.NAMESPACE_URL, f'{url}#beta-short-{run_id}{revision}')),
        'game_id': 'relay-3d-beta' if relay else 'last-signal-beta' if lighthouse else 'the-lost-artifact-beta',
        'title': ('Бета — Ретранслятор 3D: бот проходит лабиринт' if relay else 'Бета — Последний сигнал: новая русская озвучка' if revoice else
                  'Бета — Последний сигнал: Qwen спасает паром' if lighthouse else 'Бета — Qwen ищет потерянный артефакт'),
        'description': (f'{url}\n\nЭксперимент: бот ориентируется по видимой мини-карте, собирает два маяка и ищет выход. Исходный геймплей не вырезан.' if relay else f'{url}\n\nСюжетный летсплей Qwen: двенадцать решений у погасшего маяка.' if lighthouse else f'{url}\n\nПробный летсплей Qwen с русскими комментариями по событиям игры.\n'
                       'Авторы: Ritaban Ghosh и участники mini-js-games-hub.\n'
                       'Исходник: https://github.com/ritaban06/mini-js-games-hub'),
        'tags': ['games', 'Qwen', game, 'Shorts' if short else 'Longplay'], 'category_id': '20',
        'video_format': video_format, 'video_path': str(video.resolve()), 'publish_at': slot,
        'requested_publish_at': slot if requested_slot else None,
    }}, ensure_ascii=False), encoding='utf-8')
    return result


def publish_checked(result, *, lighthouse=False, relay=False, now=None):
    from gameplay_release_gate import require_verified_gameplay_release
    # The result file sits in the artifact folder that holds the evidence.
    if not relay:
        require_verified_gameplay_release(Path(result).parent)
    if lighthouse or relay:
        payload = json.loads(result.read_text(encoding='utf-8'))
        metadata = payload['metadata']
        try:
            jobs = read_queue()
        except ValueError as exc:
            print('::error title=Queue preflight failed::The publication queue is incomplete or malformed; no upload was attempted.')
            raise PublishError('Read-only queue preflight failed; no upload was attempted.') from exc
        existing = [job for job in jobs if job.get('id') == metadata['job_id']]
        if existing:
            if len(existing) == 1 and existing[0]['status'] == 'scheduled' and existing[0].get('video_id'):
                job = existing[0]
                video = job['video_id']
                print(f"::notice title=Lighthouse already scheduled::https://www.youtube.com/watch?v={video} at {job['publish_at']}")
                return job
            raise PublishError('Existing reservation for this artifact is unresolved; check Studio before retrying.')
        if not metadata.get('requested_publish_at'):
            reference = now or datetime.now(timezone.utc)
            occupied = planned_slots(job['publish_at'] for job in jobs)
            for _ in range(28):
                slot = next_publish_slot(reference, video_format=metadata['video_format'])
                if all(abs(slot - time) > timedelta(minutes=1) for time in occupied):
                    metadata['publish_at'] = slot.isoformat().replace('+00:00', 'Z')
                    result.write_text(json.dumps(payload, ensure_ascii=False), encoding='utf-8')
                    break
                reference = slot
            else:
                raise PublishError('No free regular slot found in the next 28 slots; no upload started.')
    print('::notice title=Queue preflight passed::Handing the verified video to the uploader.')
    return publish(result)


if __name__ == '__main__':
    relay = os.getenv('TRUSTED_RELAY_CAPTURE') == 'true'
    lighthouse = not relay and os.getenv('TRUSTED_LIGHTHOUSE_CAPTURE') == 'true'
    try:
        result = prepare(Path(sys.argv[1]), sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None,
                         lighthouse=lighthouse, revoice=os.getenv('LIGHTHOUSE_REVOICE') == 'true', relay=relay)
        status = publish_checked(result, lighthouse=lighthouse, relay=relay)
        if status.get('video_id'):
            print(f"::notice title=YouTube upload confirmed::https://www.youtube.com/watch?v={status['video_id']} at {status.get('publish_at') or 'unconfirmed time'}")
    except Exception as exc:
        category, message = diagnostic_category(exc)
        print(f'::error title=Publish diagnostic {category}::{message}')
        raise SystemExit(str(exc)) from None
