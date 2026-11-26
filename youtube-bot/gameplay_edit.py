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
from game_text_translation import russian_game_text
from translate_text import translate_content, load_glossary, translation_engine


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


def edit(video: Path, cues_file: Path, destination: Path, *, game: str, author: str, repository_url: str,
         translate_from: str | None = None, translation_context: str = "",
         translation_glossary: dict[str, str] | None = None, translation_model: str = "qwen") -> list[dict]:
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
    if translate_from is not None:
        if translation_model == 'm2m' and (translation_context or translation_glossary):
            raise ValueError('M2M cannot use translation context or glossary')
        translator = russian_game_text if translation_model == 'qwen' else translation_engine(translation_model)
        translated = translate_content(json.dumps(raw, ensure_ascii=False), '.json', translator,
                                       source_language=translate_from, context=translation_context, glossary=translation_glossary)
        cues = [tuple(cue) for cue in json.loads(translated)]
        render_srt(cues, end=duration)
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
                             'end_seconds': part.end_seconds, 'uploaded': False,
                             'captions_auto_translated': translate_from is not None,
                             'caption_source_language': translate_from,
                             'caption_translation_model': translation_model if translate_from is not None else None,
                             'translation_requires_review': translate_from is not None})
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
    parser.add_argument('--translate-from', help='translate supplied captions from this language to Russian before editing')
    parser.add_argument('--translation-context', default='', help='brief context for the local translation model')
    parser.add_argument('--translation-glossary', type=Path, help='JSON map of source terms to Russian terms')
    parser.add_argument('--translation-engine', choices=['qwen', 'm2m'], default='qwen')
    args = parser.parse_args()
    if (args.translation_glossary or args.translation_context or args.translation_engine != 'qwen') and not args.translate_from:
        parser.error('Translation settings require --translate-from')
    if args.translation_engine == 'm2m' and (args.translation_glossary or args.translation_context):
        parser.error('M2M translates each cue in isolation; context and glossary require Qwen')
    glossary = load_glossary(args.translation_glossary) if args.translation_glossary else None
    print(json.dumps(edit(args.video, args.cues, args.destination, game=args.game, author=args.author,
                          repository_url=args.repository_url, translate_from=args.translate_from,
                          translation_context=args.translation_context, translation_glossary=glossary,
                          translation_model=args.translation_engine), ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
