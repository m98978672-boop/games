"""Publish the exact verified preview selected by an authorized operator."""
import json
import sys
import uuid
from pathlib import Path

from publish_to_supabase import publish
from schedule_policy import manual_publish_time
from verify_review_artifact import verify


def prepare(folder: Path, capture_id: str, slot: str) -> Path:
    if not capture_id.isascii() or not capture_id.isdecimal():
        raise ValueError('Invalid capture run ID')
    if any((folder / name).is_symlink() for name in ('review.result.json', 'review.mp4')):
        raise ValueError('Expected regular preview files')
    scheduled = manual_publish_time(slot).isoformat().replace('+00:00', 'Z')
    verify(folder)
    result = json.loads((folder / 'review.result.json').read_text(encoding='utf-8'))
    metadata = result['metadata']
    if result.get('status') != 'private_preview' or metadata.get('publish_at') is not None:
        raise ValueError('Expected a preview that was never scheduled')
    metadata.update(job_id=str(uuid.uuid5(uuid.NAMESPACE_URL, f'https://github.com/m98978672-boop/games/actions/runs/{capture_id}#review')),
                    video_path=str((folder / 'review.mp4').resolve()), publish_at=scheduled, requested_publish_at=scheduled)
    output = folder / 'publish.result.json'
    with output.open('x', encoding='utf-8') as stream:
        json.dump({'metadata': metadata}, stream, ensure_ascii=False)
    return output


if __name__ == '__main__':
    directory, run_id, publish_at = sys.argv[1:]
    publish(prepare(Path(directory), run_id, publish_at))
