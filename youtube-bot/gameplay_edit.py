"""Local FFmpeg split of an existing real gameplay recording; never publishes.

Input must be an already finalized recording and timed captions for its spoken
commentary. The caller is responsible for proving game identity and rights.
"""
from __future__ import annotations

import argparse
import json
import math
import os
from pathlib import Path
import subprocess
import tempfile

from gameplay_captions import render_srt
from gameplay_release_plan import make_plan


def probe(path: Path) -> float:
    result = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=codec_type',
                             '-of', 'json', str(path)], check=True, capture_output=True, text=True, timeout=60)
    info = json.loads(result.stdout)
    streams = {s.get('codec_type') for s in info.get('streams', []) if isinstance(s, dict)}
    try:
        duration = float(info['format']['duration'])
    except (ValueError, TypeError, KeyError) as exc:
        raise ValueError('Could not verify recording duration') from exc
    if not math.isfinite(duration) or duration <= 0 or not {'audio', 'video'} <= streams:
        raise ValueError('Recording must have finite duration and audio/video streams')
    return duration


def edit(video: Path, cues_file: Path, destination: Path, *, game: str, author: str, repository_url: str) -> list[dict]:
    video, cues_file, destination = Path(video), Path(cues_file), Path(destination)
    if video.is_symlink() or cues_file.is_symlink() or not video.is_file() or not cues_file.is_file():
        raise ValueError('Video and captions must be existing regular files, not symlinks')
    if cues_file.stat().st_size > 1_000_000 or destination.exists() or destination.is_symlink():
        raise ValueError('Invalid captions or output directory already exists')
    if not destination.parent.is_dir():
        raise ValueError('Output parent directory must exist')
    duration = probe(video)
    plan = make_plan(duration_seconds=duration, game=game, author=author, repository_url=repository_url)
    raw = json.loads(cues_file.read_text(encoding='utf-8'))
    if not isinstance(raw, list) or not raw or len(raw) > 1000:
        raise ValueError('Captions must include the actual spoken cues')
    cues = []
    for cue in raw:
        if not isinstance(cue, list) or len(cue) != 3:
            raise ValueError('Invalid caption cue')
        cues.append(tuple(cue))
    # Validate all cues before doing any editing, including those outside a part.
    render_srt(cues, end=duration)
    if any(cue[1] > duration + 0.05 for cue in cues):
        raise ValueError('Caption extends beyond the recording')
    with tempfile.TemporaryDirectory(prefix='.gameplay-edit-', dir=destination.parent) as temp:
        tmp = Path(temp)
        metadata = []
        for part in plan:
            path = tmp / f'part-{part.number}.mp4'
            part_duration = part.end_seconds - part.start_seconds
            subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-n', '-ss', f'{part.start_seconds:.3f}',
                            '-i', str(video), '-t', f'{part_duration:.3f}', '-map', '0:v:0', '-map', '0:a:0',
                            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-c:a', 'aac',
                            '-movflags', '+faststart', str(path)], check=True, timeout=7200)
            actual = probe(path)
            if abs(actual - part_duration) > 0.25:
                raise ValueError('Edited part duration does not match the plan')
            subtitle = f'part-{part.number}.ru.srt'
            (tmp / subtitle).write_text(render_srt(cues, start=part.start_seconds, end=part.end_seconds), encoding='utf-8')
            metadata.append({'video': path.name, 'captions': subtitle, 'title': part.title,
                             'description': part.description, 'start_seconds': part.start_seconds,
                             'end_seconds': part.end_seconds, 'uploaded': False})
        (tmp / 'release-plan.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding='utf-8')
        # Caller gets the full set or no output directory. Never overwrite existing output.
        if destination.exists() or destination.is_symlink():
            raise FileExistsError('Output directory appeared while editing')
        os.rename(tmp, destination)
    return metadata


def main() -> None:
    parser = argparse.ArgumentParser(description='Split an existing voiced gameplay recording; no upload')
    parser.add_argument('video', type=Path)
    parser.add_argument('cues', type=Path)
    parser.add_argument('destination', type=Path)
    parser.add_argument('--game', required=True)
    parser.add_argument('--author', required=True)
    parser.add_argument('--repository-url', required=True)
    args = parser.parse_args()
    print(json.dumps(edit(args.video, args.cues, args.destination, game=args.game, author=args.author,
                          repository_url=args.repository_url), ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
