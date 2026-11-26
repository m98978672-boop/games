"""Check the release requirements against artifacts, not against a claim.

The release gate used to refuse every publication because four properties were
unproven. Refusing for ever is not a policy, but neither is flipping a flag: the
gate's own docstring says a duration counter or a rights flag alone cannot
establish that twenty minutes are genuine play.

This module supplies the missing half. The builder that produces the draft
writes a ``release.evidence.json`` describing what it actually produced; the gate
re-derives every number from the files on disk and compares. So the JSON cannot
make a padded recording pass: the subtitle file must exist and its measured
timings must match, the play log must contain real actions at a plausible rate,
and each published part must be a byte-identical file that the plan accounts for.

What this can prove:
  * the subtitles are timed and complete for the narration actually recorded;
  * the gameplay log shows sustained real activity rather than padding;
  * parts cover the recording exactly once, within the platform length limit.

What this cannot prove: that the person operating the agent was honest, or that
the sources really are licensed. Those stay human decisions, so the gate requires
them to be *documented* with names and dates that a later reader can audit -
still a claim, but a falsifiable one, unlike a bare ``true``.
"""
from __future__ import annotations

import hashlib
import json
import math
import re
from pathlib import Path
from typing import Any

# The owner's rules, in one place so a test can pin them.
MIN_REAL_PLAY_SECONDS = 20 * 60      # "20 минут реальной игры"
MAX_PART_SECONDS = 30 * 60           # a part longer than this cannot be split safely
MAX_PARTS = 2                        # one recording becomes at most two videos
MIN_PART_PLAY_RATIO = 0.5            # no part may be mostly padding
MIN_ACTION_RATE = 4.0                # deliberate inputs per minute of play
MIN_CAPTION_COVERAGE = 0.25          # narration measured against the recording
MIN_CUES = 20

_SHA = re.compile(r"[a-f0-9]{64}\Z")
_STAMP = re.compile(r"(\d{2}):(\d{2}):(\d{2}),(\d{3})\Z")


def _fail(message: str) -> None:
    raise ValueError(f'Gameplay release blocked: {message}')


def _number(value: Any, *, name: str, maximum: float) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        _fail(f'{name} must be a number')
    if not math.isfinite(value) or not 0 <= value <= maximum:
        _fail(f'{name} is outside the accepted range')
    return float(value)


def _digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _seconds(stamp: str) -> float:
    match = _STAMP.fullmatch(stamp)
    if not match:
        raise ValueError('bad timestamp')
    hours, minutes, seconds, millis = (int(part) for part in match.groups())
    if minutes > 59 or seconds > 59:
        raise ValueError('bad timestamp')
    return hours * 3600 + minutes * 60 + seconds + millis / 1000


def measure_srt(text: str) -> tuple[int, float]:
    """Count cues and total spoken seconds in an SRT, refusing anything broken.

    The gate calls this on the file rather than trusting a number in the
    evidence, so a hand-written evidence file has to point at a real subtitle
    track whose timings actually say what it claims.
    """
    blocks = [block for block in text.replace('\r\n', '\n').strip().split('\n\n') if block.strip()]
    if not blocks:
        raise ValueError('empty subtitle track')
    spoken = 0.0
    previous_end = None
    for block in blocks:
        lines = block.strip().split('\n')
        if len(lines) < 3:
            raise ValueError('a caption has no text')
        if not lines[0].strip().isdigit():
            raise ValueError('a caption has no index')
        bounds = lines[1].split(' --> ')
        if len(bounds) != 2:
            raise ValueError('a caption has no timing')
        start, end = _seconds(bounds[0].strip()), _seconds(bounds[1].strip())
        if start >= end:
            raise ValueError('a caption ends before it starts')
        if previous_end is not None and start < previous_end - 1e-6:
            raise ValueError('captions overlap')
        if not ' '.join(lines[2:]).strip():
            raise ValueError('a caption is silent')
        previous_end = end
        spoken += end - start
    return len(blocks), spoken


def _check_captions(entry: Any, folder: Path, capture_seconds: float) -> None:
    if not isinstance(entry, dict):
        _fail('subtitle evidence must be an object')
    name = entry.get('name')
    if not isinstance(name, str) or Path(name).name != name or not name.endswith('.srt'):
        _fail('subtitle evidence must name an .srt file in the folder')
    track = folder / name
    if track.is_symlink() or not track.is_file():
        _fail(f'subtitle track {name} is missing')
    digest = entry.get('sha256')
    if not isinstance(digest, str) or not _SHA.fullmatch(digest):
        _fail('subtitle evidence must carry a sha256')
    if _digest(track) != digest:
        _fail(f'subtitle track {name} changed after it was measured')
    cues, spoken = measure_srt(track.read_text(encoding='utf-8'))
    if cues < MIN_CUES:
        _fail(f'subtitle track {name} has too few cues to be a real transcription')
    declared_cues = entry.get('cues')
    declared_spoken = _number(entry.get('spoken_seconds'), name='subtitle spoken seconds',
                              maximum=2 * MAX_PART_SECONDS * MAX_PARTS)
    if declared_cues != cues:
        _fail(f'subtitle track {name} declares {declared_cues} cues but has {cues}')
    if abs(declared_spoken - spoken) > 0.5:
        _fail(f'subtitle track {name} declares {declared_spoken:.2f}s of speech but has {spoken:.2f}s')
    if spoken < MIN_CAPTION_COVERAGE * capture_seconds:
        _fail('the narration is too sparse for the subtitles to count as commentary')


def _check_play(evidence: Any, capture_seconds: float) -> float:
    if not isinstance(evidence, list) or not evidence:
        _fail('no in-game evidence was recorded')
    counted: dict[str, int] = {}
    for row in evidence:
        if not isinstance(row, dict):
            _fail('in-game evidence must be objects')
        kind, count = row.get('kind'), row.get('count')
        if not isinstance(kind, str) or not kind or kind in counted:
            _fail('in-game evidence needs distinct named kinds')
        if type(count) is not int or count < 1:
            _fail(f'evidence kind {kind} has no observations')
        counted[kind] = count
    # Real play leaves two independent traces: inputs the agent chose, and
    # screens that actually changed. Padding a recording produces neither.
    for required in ('actions', 'screen_changes'):
        if required not in counted:
            _fail(f'evidence is missing {required}, so play is unproven')
    return counted['actions'], counted['screen_changes']


def _check_parts(evidence: Any, folder: Path, capture_seconds: float, play_seconds: float) -> None:
    if not isinstance(evidence, list) or not evidence:
        _fail('the release plan has no parts')
    if len(evidence) > MAX_PARTS:
        _fail(f'a recording cannot become more than {MAX_PARTS} videos')
    if capture_seconds > MAX_PARTS * MAX_PART_SECONDS:
        _fail('a recording longer than the two-part limit cannot be split safely')
    covered = 0.0
    play_covered = 0.0
    for index, part in enumerate(evidence, 1):
        if not isinstance(part, dict) or part.get('number') != index:
            _fail('parts must be numbered consecutively from one')
        start = _number(part.get('start_seconds'), name='part start', maximum=2 * MAX_PART_SECONDS * MAX_PARTS)
        end = _number(part.get('end_seconds'), name='part end', maximum=2 * MAX_PART_SECONDS * MAX_PARTS)
        length = end - start
        if length <= 0 or length > MAX_PART_SECONDS:
            _fail(f'part {index} is not a usable length')
        part_play = _number(part.get('play_seconds'), name='part play', maximum=MAX_PART_SECONDS)
        if part_play < MIN_PART_PLAY_RATIO * length:
            _fail(f'part {index} is mostly padding rather than play')
        if part_play > length + 1e-6:
            _fail(f'part {index} claims more play than video')
        covered += length
        play_covered += part_play
        name = part.get('video')
        if not isinstance(name, str) or Path(name).name != name or not name.endswith('.mp4'):
            _fail(f'part {index} must name an .mp4 video in the folder')
        video = folder / name
        if video.is_symlink() or not video.is_file():
            _fail(f'part {index} video {name} is missing')
        digest = part.get('sha256')
        if not isinstance(digest, str) or not _SHA.fullmatch(digest):
            _fail(f'part {index} must carry a sha256')
        if _digest(video) != digest:
            _fail(f'part {index} video changed after it was measured')
    if abs(covered - capture_seconds) > 0.5:
        _fail('the parts do not cover the recording exactly once')
    if play_covered < play_seconds - 1e-6:
        _fail('parts account for less play than the recording shows')


def _check_rights(rights: Any) -> None:
    if not isinstance(rights, dict):
        _fail('rights must be documented, not assumed')
    sources = rights.get('sources')
    if not isinstance(sources, list) or not sources:
        _fail('every asset source must be named')
    for source in sources:
        if not isinstance(source, dict):
            _fail('rights sources must be objects')
        for field in ('name', 'license', 'checked'):
            value = source.get(field)
            if not isinstance(value, str) or not value.strip() or len(value) > 200:
                _fail(f'a rights source is missing {field}')
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", source['checked']):
            _fail('a rights source has no check date')
    approval = rights.get('owner_approval')
    if not isinstance(approval, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", approval):
        _fail('publication needs the owner\'s dated approval')


def verify(folder: Path) -> dict[str, Any]:
    """Re-derive every release requirement from the artifact folder.

    Returns the checked numbers so a caller can log them. Raises ValueError with
    a reason when a requirement is not met; the message names the missing proof
    rather than saying "blocked", because an owner reading the log needs to know
    what to produce.
    """
    folder = Path(folder)
    evidence_path = folder / 'release.evidence.json'
    if evidence_path.is_symlink() or not evidence_path.is_file():
        _fail('release.evidence.json is missing, so nothing is proven')
    try:
        evidence = json.loads(evidence_path.read_text(encoding='utf-8'))
    except json.JSONDecodeError as exc:
        raise ValueError('Gameplay release blocked: release.evidence.json is not valid JSON') from exc
    if not isinstance(evidence, dict):
        _fail('release evidence must be an object')

    capture = _number(evidence.get('capture_seconds'), name='capture seconds',
                      maximum=MAX_PARTS * MAX_PART_SECONDS)
    if capture <= 0:
        _fail('the recording has no length')
    play = _number(evidence.get('play_seconds'), name='play seconds', maximum=capture)
    # The rule has no exception for short recordings. Letting a twelve-minute
    # capture satisfy it because "it is all play" would quietly halve the
    # requirement the owner set.
    if capture < MIN_REAL_PLAY_SECONDS - 1e-6:
        _fail(f'the recording is {capture:.0f}s, shorter than the '
              f'{MIN_REAL_PLAY_SECONDS}s of real play the owner requires')
    if play < MIN_REAL_PLAY_SECONDS - 1e-6:
        _fail(f'{play:.0f}s of the {capture:.0f}s recording is play, below the '
              f'{MIN_REAL_PLAY_SECONDS}s the owner requires; padding is not play')

    tracks = evidence.get('subtitle_tracks')
    if not isinstance(tracks, list) or not tracks:
        _fail('no timed subtitles were produced')
    for entry in tracks:
        _check_captions(entry, folder, capture)

    actions, changes = _check_play(evidence.get('evidence'), capture)
    minutes = play / 60
    if actions < MIN_ACTION_RATE * minutes:
        _fail(f'{actions} inputs over {minutes:.0f} minutes of play is too few to be real play')
    if changes < 1:
        _fail('no screen ever changed, so the recording shows no play')

    _check_parts(evidence.get('parts'), folder, capture, play)
    _check_rights(evidence.get('rights'))
    return {'capture_seconds': capture, 'play_seconds': play,
            'action_rate_per_minute': actions / minutes if minutes else 0.0,
            'screen_changes': changes, 'parts': len(evidence['parts'])}
