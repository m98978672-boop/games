"""Translate existing text, SRT, or [start, end, text] JSON captions to Russian.

No transcription or OCR. Never overwrite input/output or emit partial results.
"""
import argparse
import json
import math
import os
from pathlib import Path
import re

from game_text_translation import russian_game_text

MAX_BYTES = 1_000_000
MAX_CUES = 1000
TIMING = re.compile(r'^(\d{2,}:\d{2}:\d{2}[,.]\d{3})\s+-->\s+(\d{2,}:\d{2}:\d{2}[,.]\d{3})(?:\s+[^\r\n]*)?$')


def _seconds(stamp):
    h, m, rest = stamp.replace(',', '.').split(':')
    seconds = float(rest)
    if int(m) >= 60 or seconds >= 60:
        raise ValueError('Invalid SRT timestamp')
    return int(h) * 3600 + int(m) * 60 + seconds


def translate_content(content, kind, translate, *, source_language=None, context='', glossary=None):
    """Return complete translated content or raise without returning partial data."""
    cache = {}

    def convert(text, previous='', following=''):
        if not isinstance(text, str) or not text.strip():
            raise ValueError('Empty or invalid text')
        # Adjacent captions are context only, not part of the text to translate.
        scene = str(context or '')[:150]
        if previous or following:
            scene += f'\nPrevious: {previous[-120:]}\nNext: {following[:120]}'
        key = (text, scene)
        if key not in cache:
            options = {'source_language': source_language, 'context': scene}
            if glossary is not None:
                options['glossary'] = glossary
            result = translate(text, **options)
            if not isinstance(result, str) or not result.strip():
                raise ValueError('Translation failed or the model is unavailable; no output was written')
            cache[key] = result
        return cache[key]

    if kind == '.txt':
        return convert(content) + ('\n' if content.endswith('\n') else '')
    if kind == '.json':
        data = json.loads(content)
        if not isinstance(data, list) or not data or len(data) > MAX_CUES:
            raise ValueError('JSON must be a nonempty list of at most 1000 captions')
        last = 0.0
        for cue in data:
            if (not isinstance(cue, list) or len(cue) != 3 or
                any(isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v) for v in cue[:2]) or
                not 0 <= cue[0] < cue[1] <= 7200 or cue[0] < last):
                raise ValueError('Invalid or overlapping JSON caption timings')
            if not isinstance(cue[2], str) or not cue[2].strip():
                raise ValueError('Empty or invalid text')
            last = cue[1]
        source_texts = [cue[2] for cue in data]
        for i, cue in enumerate(data):
            translated = convert(cue[2], source_texts[i-1] if i else '',
                                 source_texts[i+1] if i+1 < len(data) else '')
            if len(' '.join(translated.split())) > 1000:
                raise ValueError('Translated JSON caption exceeds the montage limit')
            cue[2] = translated
        return json.dumps(data, ensure_ascii=False, indent=2) + '\n'
    if kind != '.srt':
        raise ValueError('Supported formats: .txt, .srt, .json')
    # Preserve cue identifiers, timestamps, settings and separator line endings.
    # Multiline subtitle text may be reflowed by the translator.
    if not content.strip():
        raise ValueError('Empty SRT')
    parts = re.split(r'(\r?\n[ \t]*\r?\n+)', content)
    blocks = []
    previous = 0.0
    for i in range(0, len(parts), 2):
        block = parts[i]
        if not block.strip() and i == len(parts)-1:
            continue
        match = re.fullmatch(r'(\d+\r?\n)([^\r\n]+)(\r?\n)([\s\S]*?)(\r?\n)?', block)
        if not match:
            raise ValueError('Invalid SRT cue')
        timing = TIMING.fullmatch(match.group(2))
        if not timing:
            raise ValueError('Invalid SRT timing')
        start, end = map(_seconds, timing.groups())
        if not 0 <= start < end or start < previous:
            raise ValueError('Invalid or overlapping SRT timings')
        previous = end
        blocks.append((i, match))
    if not blocks or len(blocks) > MAX_CUES:
        raise ValueError('Invalid number of SRT cues')
    source_texts = [match.group(4) for _, match in blocks]
    for index, (i, match) in enumerate(blocks):
        translated = convert(match.group(4), source_texts[index-1] if index else '',
                             source_texts[index+1] if index+1 < len(blocks) else '')
        # Blank lines would create a new malformed subtitle block.
        if re.search(r'\r?\n[ \t]*\r?\n', translated):
            raise ValueError('Translation contains an SRT block separator')
        parts[i] = ''.join((match.group(1), match.group(2), match.group(3), translated, match.group(5) or ''))
    return ''.join(parts)


def translate_file(source, destination, *, source_language='en', context='', glossary=None, translate=russian_game_text):
    source, destination = Path(source), Path(destination)
    if source.is_symlink() or not source.is_file() or source.stat().st_size > MAX_BYTES:
        raise ValueError('Input must be a regular file at most 1 MB')
    if source.suffix.lower() != destination.suffix.lower():
        raise ValueError('Input and output must have the same extension')
    if destination.exists() or destination.is_symlink():
        raise FileExistsError('Output already exists')
    with source.open('r', encoding='utf-8-sig', newline='') as stream:
        content = stream.read()
    result = translate_content(content, source.suffix.lower(), translate, source_language=source_language, context=context, glossary=glossary)
    # Exclusive creation prevents overwriting a file created during translation.
    created = False
    try:
        with destination.open('x', encoding='utf-8', newline='') as output:
            created = True
            output.write(result)
    except BaseException:
        # Also remove the result if flushing/closing the stream fails.
        if created:
            os.unlink(destination)
        raise


def translation_engine(name):
    if name == 'qwen':
        return russian_game_text
    if name == 'm2m':
        from multilingual_translation import m2m_russian_text
        def translate(text, *, source_language, context='', **kwargs):
            # Adjacent cues are supplied as context by translate_content, but
            # this MT model only translates the current cue in isolation.
            return m2m_russian_text(text, source_language=source_language)
        return translate
    raise ValueError('Unknown translation engine')


def load_glossary(path):
    """Load a small source-to-Russian terminology map before model inference."""
    path = Path(path)
    if path.is_symlink() or not path.is_file() or path.stat().st_size > 20_000:
        raise ValueError('Glossary must be a regular JSON file at most 20 KB')
    glossary = json.loads(path.read_text(encoding='utf-8-sig'))
    if (not isinstance(glossary, dict) or len(glossary) > 24 or
            any(not isinstance(k, str) or not isinstance(v, str) or
                not k.strip() or not v.strip() or len(k) > 80 or len(v) > 80
                for k, v in glossary.items())):
        raise ValueError('Glossary must contain at most 24 nonempty text pairs of up to 80 characters')
    return glossary


def main():
    parser = argparse.ArgumentParser(description='Translate existing .txt, .srt or timed JSON to Russian; no OCR/ASR')
    parser.add_argument('source', type=Path)
    parser.add_argument('destination', type=Path)
    parser.add_argument('--source-language', default='en', help='source language tag, e.g. en, ja, pt-BR')
    parser.add_argument('--target-language', default='ru', choices=['ru'])
    parser.add_argument('--context', default='', help='brief scene context (local model input)')
    parser.add_argument('--glossary', type=Path, help='JSON map of source terms to Russian terms')
    parser.add_argument('--engine', choices=['qwen', 'm2m'], default='qwen')
    args = parser.parse_args()
    if args.engine == 'm2m' and (args.glossary or args.context):
        parser.error('M2M translates each cue in isolation; --glossary and --context require Qwen')
    glossary = load_glossary(args.glossary) if args.glossary else None
    translate_file(args.source, args.destination, source_language=args.source_language, context=args.context,
                   glossary=glossary, translate=translation_engine(args.engine))
    print(f'Created {args.destination}; review the translation before use.')


if __name__ == '__main__':
    main()
