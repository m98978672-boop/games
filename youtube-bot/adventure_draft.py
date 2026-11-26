"""Build a private, trace-based Russian pilot; keep its raw footage unchanged."""
import json
import math
import os
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

from gameplay_voiceover import probe_capture
from gameplay_captions import render_srt
from viewport_translation import cues as translation_cues, filters as translation_filters
from adventure_personality import SHORT_SECONDS, short_comment

GAME_URL = 'https://m98978672-boop.github.io/games/collection/adventure-game/'
# Games that live in this repository: their code and art are ours, so there is
# no external licence to confirm before publishing gameplay footage of them.
OUR_GAME_MARKER = 'm98978672-boop/games'
OWN_GAMES = frozenset()
PUZZLE_URL = 'https://m98978672-boop.github.io/games/collection/16-puzzle/'
# The owner's rule is twenty minutes of real play. Duration is necessary, not
# proof of actual play, rights or release readiness - that is what the release
# gate checks. This used to be 600, which let a ten-minute episode satisfy a
# twenty-minute requirement because the workflow published on this flag alone.
MIN_EDITED_GAMEPLAY_SECONDS = 1200
MAX_CUT_FRACTION = 0.25
ORDINAL = {'CHOICEONE': 'первый', 'CHOICETWO': 'второй', 'CHOICETHREE': 'третий'}


def narrate(text, wav):
    model = os.environ.get('PIPER_MODEL_PATH')
    if model:
        if not Path(model).is_file() or not Path(model + '.json').is_file():
            raise RuntimeError('Russian neural voice is missing; refusing fallback audio')
        subprocess.run(['piper', '--model', model, '--output_file', str(wav),
                        '--length_scale', '1.10', '--sentence_silence', '0.22'],
                       input=text, text=True, check=True, timeout=60)
    else:
        subprocess.run(['espeak-ng', '-v', 'ru', '-s', '145', '-w', str(wav), text], check=True, timeout=30)


def split_parts(folder, draft, edited, gameplay, *, short, game, author, repository_url):
    """Split a long recording into the parts that will actually be published.

    A Short and anything up to thirty minutes stay a single video. Beyond that
    the release plan divides the recording, and this cuts the real files with
    FFmpeg, so each part's measured length is its own - not a claim in JSON.
    """
    from gameplay_release_plan import make_plan

    if short:
        return [(1, 0.0, edited, gameplay, draft)]
    plan = make_plan(duration_seconds=edited, game=game, author=author,
                     repository_url=repository_url)
    if len(plan) == 1:
        return [(1, 0.0, edited, gameplay, draft)]
    result = []
    play_per_second = gameplay / edited if edited else 0.0
    for part in plan:
        length = part.end_seconds - part.start_seconds
        name = f'{Path(draft).stem}-part-{part.number}.mp4'
        target = folder / name
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', f'{part.start_seconds:.3f}',
                        '-i', str(folder / draft), '-t', f'{length:.3f}', '-c', 'copy',
                        '-movflags', '+faststart', str(target)], check=True, timeout=300)
        measured = probe_capture(target)
        if abs(measured - length) > 1.5:
            raise ValueError(f'Part {part.number} does not match its planned length')
        result.append((part.number, part.start_seconds, part.end_seconds,
                       play_per_second * measured, name))
    return result


def rights_from_environment(trace):
    """Work out whether every asset came from our own repository.

    The old version asked the owner to retype a licence and an approval date into
    repository variables. That is not a check, and it is exactly the chore nobody
    should have to do for a game we wrote: "Последний сигнал" is three files in
    `collection/lighthouse-relay`, with no audio, images or third-party links.

    So the record is derived from the source the capture actually used. A game
    that belongs to this repository needs no licence at all. Anything external is
    refused unless its licence is one that allows a commercial upload, and that
    licence has to be verified against the source repository separately - this
    function only records what it can see, it never assumes.
    """
    source = str(trace.get('source') or '').strip()
    if not source:
        return {'sources': []}
    if OUR_GAME_MARKER in source or source in OWN_GAMES:
        return {'sources': [{'name': source, 'ownership': 'own'}]}
    licence = os.environ.get('GAMEPLAY_SOURCE_LICENSE', '').strip()
    verified = os.environ.get('GAMEPLAY_RIGHTS_CHECKED_ON', '').strip()
    if not (licence and verified):
        return {'sources': [{'name': source}]}
    return {'sources': [{'name': source, 'license': licence, 'license_verified': verified}]}


def verified_license(repository_url):
    """Read the licence GitHub reports for a repository.

    The gate refuses a missing or disallowed licence, so this is called by the
    workflow once per capture rather than trusted from a variable. Network
    failures bubble up as errors: an unreadable licence is not a permissive one.
    """
    import json as _json
    import urllib.request

    parts = [p for p in urllib.request.urlparse(repository_url).path.split('/') if p]
    if len(parts) < 2:
        raise ValueError('Source is not a GitHub repository URL')
    api = f'https://api.github.com/repos/{parts[0]}/{parts[1]}/license'
    headers = {'Accept': 'application/vnd.github+json', 'User-Agent': 'games-release-check'}
    # Anonymous API calls are rate limited per runner IP, and a rate-limited read
    # would look like "unlicensed". The workflow supplies a token for that reason.
    token = os.environ.get('GITHUB_TOKEN', '').strip()
    if token:
        headers['Authorization'] = f'Bearer {token}'
    request = urllib.request.Request(api, headers=headers)
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = _json.loads(response.read().decode('utf-8'))
    return str((payload.get('license') or {}).get('spdx_id') or '')


def write_release_evidence(folder, trace, *, capture_seconds, play_seconds, parts, subtitle):
    """Record what was produced, with hashes, so the gate can re-derive it.

    Counts come from the recorded action log, never from the size of the file:
    padding a recording adds minutes but no actions, and that difference is the
    whole point of the check.
    """
    import hashlib
    from gameplay_release_evidence import measure_srt

    def digest(path):
        return hashlib.sha256(Path(path).read_bytes()).hexdigest()

    srt_path = folder / subtitle
    cues, spoken = measure_srt(srt_path.read_text(encoding='utf-8'))
    actions = [row for row in trace.get('actions') or [] if isinstance(row, dict)]
    screen_changes = sum(1 for row in actions if row.get('screen_unchanged') is False)
    evidence = {
        'capture_seconds': round(float(capture_seconds), 3),
        'play_seconds': round(float(play_seconds), 3),
        'subtitle_tracks': [{'name': subtitle, 'sha256': digest(srt_path),
                             'cues': cues, 'spoken_seconds': round(spoken, 3)}],
        'evidence': [{'kind': 'actions', 'count': len(actions)},
                     {'kind': 'screen_changes', 'count': max(1, screen_changes)}],
        'parts': [{'number': number, 'start_seconds': round(start, 3), 'end_seconds': round(end, 3),
                   'play_seconds': round(play, 3), 'video': name,
                   'sha256': digest(folder / name)}
                  for number, start, end, play, name in parts],
        # Rights stay a human decision, so they are never filled in here. A
        # builder that invents an approval date would be bypassing the very gate
        # that reads it. The owner supplies them through the environment once
        # they have actually checked the source and cleared the recording.
        'rights': rights_from_environment(trace),
    }
    (folder / 'release.evidence.json').write_text(
        json.dumps(evidence, ensure_ascii=False, indent=2), encoding='utf-8')
    return evidence


def plan(trace):
    duration = float(trace['duration_seconds'])
    if trace.get('game') == 'Ретранслятор 3D':
        lines = [(0, 'Эксперимент в три дэ. Ищу два маяка по карте в углу экрана, потом попробую выйти из лабиринта.')]
        last = 2
        explained_wall = False
        for event in trace['actions']:
            if event.get('hit_wall') and not explained_wall:
                stamp = min(duration, (event.get('recording_elapsed_ms') or 0)/1000)
                lines.append((stamp, 'Вперёд не пройти. Проверю другой проход.'))
                explained_wall = True
            remaining = event['remaining_beacons']
            if remaining < last:
                stamp = min(duration, (event.get('recording_elapsed_ms') or 0)/1000)
                lines.append((stamp, 'Первый маяк найден. Ищу второй.' if remaining else 'Оба маяка собраны. Теперь к бирюзовому выходу.'))
                last = remaining
        won = trace.get('outcome') == 'game_reported_victory'
        lines.append((max(0, duration - 1), 'Вышел. Связь восстановлена.' if won else 'До выхода пока не добрался.'))
        return duration, lines, [], won
    if trace.get('game') == 'Viewport Voyager':
        lines = [(0.0, 'В этой игре окно браузера — часть головоломки.')]
        previous = 0.0
        seen = set()
        for event in trace['actions']:
            choice = event['choice']
            if choice.startswith('CHOICE'):
                w, h = event['viewport']
                note = f'Проверяю размер {w} на {h}.'
                if choice not in seen and not seen.intersection({'CHOICEONE', 'CHOICETWO', 'CHOICETHREE'}):
                    note += ' Наконец-то изменение размера окна считается игровым навыком.'
                lines.append((previous, note))
            elif choice not in seen:
                direction = {'UP':'вверх', 'DOWN':'вниз', 'LEFT':'налево', 'RIGHT':'направо'}[choice]
                lines.append((previous, f'Пробую двигаться {direction}.'))
            seen.add(choice)
            previous = min(duration, max(previous, (event.get('recording_elapsed_ms') or 0) / 1000))
        won = trace.get('game_reported_victory') is True
        lines.append((previous, 'Игра подтвердила прохождение.' if won else 'До финала в этой попытке не дошёл.'))
        spoken = set()
        for stamp, _, _, message in translation_cues(trace):
            if message not in spoken and (not won or message != 'Игра пройдена!'):
                lines.append((stamp, message))
                spoken.add(message)
        return duration, sorted(lines, key=lambda line: line[0]), [], won
    puzzle = trace.get('game') == '16 Puzzle'
    lighthouse = trace.get('game') == 'Последний сигнал'
    events = trace['model_actions'] if puzzle else trace['actions']
    lines = [(0.0, 'Собираю пятнашки по порядку.' if puzzle else 'Шторм погасил маяк. Попробую вывести паром из тумана.' if lighthouse else 'Я ищу потерянный артефакт.')]
    cuts = []
    remaining_cut = duration * MAX_CUT_FRACTION
    prior = 0.0
    previous_source = None
    current_round = 1
    for event in events:
        stamp_ms = event.get('recording_elapsed_ms')
        stamp = min(duration, max(prior, (stamp_ms or 0) / 1000))
        stalled = not event['move_verified'] if puzzle else event['screen_unchanged']
        # An unchanged action result does not prove the interval was idle.
        # Only accept explicitly verified, input-free thinking windows.
        idle = event.get('verified_thinking_only_ms')
        if (isinstance(idle, list) and len(idle) == 2
                and all(type(t) in (int, float) and math.isfinite(t) for t in idle)):
            start, end = (t / 1000 for t in idle)
            if prior <= start < end <= stamp and remaining_cut > 0:
                cut = min(end - start, remaining_cut)
                cuts.append((start, start + cut))
                remaining_cut -= cut
        if puzzle:
            source = event['action_source']
            tile = event['tile']
            if type(tile) is not int or not 1 <= tile <= 15:
                raise ValueError('Invalid puzzle tile in trace')
            note = ''
            round_number = event.get('round', 1)
            if round_number != current_round:
                lines.append((prior, 'Доска собрана. Перехожу к следующей.'))
                current_round, previous_source = round_number, None
            if source == 'planner' and previous_source != source:
                note = 'Подключаю поиск маршрута. '
            elif stalled:
                note = 'Ход не сработал. '
            lines.append((prior, f'{note}Плитка {tile}.'))
            previous_source = source
        elif lighthouse:
            label = event.get('choice_label')
            if isinstance(label, str) and label.strip():
                lines.append((prior, f'Решаю {label.strip()[:1].lower()}{label.strip()[1:]}.'))
        elif trace.get('short'):
            line, reaction = short_comment(event, ORDINAL[event['choice']])
            lines.append((prior, line))
            if reaction:
                lines.append((stamp, reaction))
        else:
            note = 'Экран не менялся. Пробую иначе.' if event.get('analyzing_stall') else ''
            lines.append((prior, f'{note} Выбираю {ORDINAL[event["choice"]]} вариант.'.strip()))
        prior = stamp
    won = trace['outcome'] == ('game_reported_win' if puzzle else 'game_reported_victory')
    ending = f'Решено досок: {trace.get("boards_won", 1)}.' if puzzle else 'Паром миновал риф.' if lighthouse else 'Артефакт найден.'
    lines.append((prior, ending if won else ('Паром потерял сигнал. Спасатели начали поиски.' if lighthouse and trace['outcome'] == 'game_reported_death' else 'Финиш не подтверждён. Это первая часть.')))
    return duration, lines, cuts, won


def build(folder):
    trace = json.loads((folder / 'trace.json').read_text(encoding='utf-8'))
    raw = folder / 'recording.webm'
    trace['duration_seconds'] = probe_capture(raw)
    duration, lines, cuts, won = plan(trace)
    short = trace.get('short') is True
    viewport = trace.get('game') == 'Viewport Voyager'
    base = 'zuza-viewport-beta' if viewport else 'zuza-adventure-short' if short else ('zuza-pilot' if won else 'zuza-part-01')
    puzzle = trace.get('game') == '16 Puzzle'
    url = PUZZLE_URL if puzzle else GAME_URL
    title = 'Пятнашки' if puzzle else 'The Lost Artifact'
    source = 'https://github.com/kunjgit/GameZone' if puzzle else 'https://github.com/ritaban06/mini-js-games-hub'
    if trace.get('game') == 'Ретранслятор 3D':
        url = GAME_URL.replace('adventure-game/', 'relay-3d/')
        title = 'Ретранслятор 3D'
        source = 'https://github.com/m98978672-boop/games/tree/arena/7d9fee46-games/collection/relay-3d'
    if trace.get('game') == 'Последний сигнал':
        url = GAME_URL.replace('adventure-game/', 'lighthouse-relay/')
        title = 'Последний сигнал'
        source = 'https://github.com/m98978672-boop/games/tree/arena/7d9fee46-games/collection/lighthouse-relay'
    if viewport:
        url = GAME_URL.replace('adventure-game/', 'adventure-game-new/')
        title = 'Viewport Voyager'
        source = 'https://github.com/m98978672-boop/games/tree/main/collection/adventure-game-new'
    (folder / 'description.txt').write_text(
        f'{url}\n\n{title} — пробная запись игры Qwen. '
        'Русский закадровый комментарий собран по журналу действий.\n'
        + ('Игра подтвердила победу.' if won else 'Победа в этой попытке не подтверждена.')
        + f'\nИсходник игры: {source}\n', encoding='utf-8')
    with tempfile.TemporaryDirectory() as temp:
        wavs = []
        cursor = 0.0
        for index, (stamp, text) in enumerate(lines):
            wav = Path(temp) / f'{index}.wav'
            narrate(text, wav)
            with wave.open(str(wav), 'rb') as reader:
                seconds = reader.getnframes() / reader.getframerate()
            stamp -= sum(max(0, min(stamp, end) - start) for start, end in cuts)
            start = max(cursor, stamp)
            wavs.append((wav, round(start * 1000), text))
            cursor = start + seconds + 0.12
        # Remove only redundant waiting on unchanged screens and keep the full raw recording.
        video_seconds = duration - sum(end - start for start, end in cuts)
        discard = '+'.join(f'between(t,{start:.3f},{end:.3f})' for start, end in cuts)
        select = f"select='not({discard})',setpts=N/(25*TB)," if cuts else ''
        # A closing hold, if needed, is for narration only; the raw footage is untouched.
        closing_hold = max(0, cursor - video_seconds)
        # All gameplay drafts use the same cutoff, irrespective of the game.
        short = max(video_seconds, cursor) <= SHORT_SECONDS
        portrait = ',scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1' if short else ''
        translated = translation_filters(trace, temp) if viewport else ''
        panel = ',' + translated if translated else ''
        filters = [f'[0:v]fps=25,{select}tpad=stop_mode=clone:stop_duration={closing_hold:.3f}{panel}{portrait}[v]']
        # The clips never overlap. Assemble one PCM track to avoid opening
        # hundreds of FFmpeg inputs for a multi-board campaign.
        narration = Path(temp) / 'narration.wav'
        spoken_cues = []
        with wave.open(str(narration), 'wb') as target:
            output_format = None
            written = 0
            for wav, offset_ms, text in wavs:
                with wave.open(str(wav), 'rb') as clip:
                    fmt = (clip.getnchannels(), clip.getsampwidth(), clip.getframerate())
                    if output_format is None:
                        output_format = fmt
                        target.setnchannels(fmt[0])
                        target.setsampwidth(fmt[1])
                        target.setframerate(fmt[2])
                    if fmt != output_format or fmt[1] != 2:
                        raise ValueError('Unexpected voice format')
                    silence = max(0, round(offset_ms * fmt[2] / 1000) - written)
                    target.writeframesraw(b'\0' * silence * fmt[0] * fmt[1])
                    start_frame = written + silence
                    frames = clip.getnframes()
                    if frames <= 0:
                        raise ValueError('Synthesized speech clip is empty')
                    pcm = clip.readframes(frames)
                    if len(pcm) != frames * fmt[0] * fmt[1]:
                        raise ValueError('Synthesized speech clip is truncated')
                    target.writeframesraw(pcm)
                    written = start_frame + frames
                    spoken_cues.append((start_frame / fmt[2], written / fmt[2], text))
        filters.append('[1:a]apad[a]')
        cmd = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', str(raw), '-i', str(narration)]
        subprocess.run(cmd + ['-filter_complex', ';'.join(filters), '-map', '[v]', '-map', '[a]',
                       '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac',
                       '-shortest', '-movflags', '+faststart', str(folder / f'{base}.mp4')], check=True, timeout=300)
    edited = probe_capture(folder / f'{base}.mp4')
    if short and edited > SHORT_SECONDS:
        raise ValueError('Encoded Short exceeds the three-minute limit')
    gameplay = min(video_seconds, max(0.0, edited - closing_hold))
    # Cue timings use the exact samples written to the mixed narration track,
    # after cuts and scheduling, then are clipped to the actual encoded video.
    captions = render_srt(spoken_cues, end=edited)
    if not captions:
        raise ValueError('No spoken captions fit the encoded video')
    captions_path = folder / f'{base}.ru.srt'
    captions_path.write_text(captions, encoding='utf-8')
    # A recording over thirty minutes cannot go out as one video, and the plan
    # module refuses anything needing a third part, so the evidence describes
    # the videos that actually exist rather than a single claimed file.
    parts = split_parts(folder, f'{base}.mp4', edited, gameplay, short=short,
                        game=title, author=str(trace.get('author') or 'unknown'),
                        repository_url=url)
    write_release_evidence(folder, trace, capture_seconds=duration, play_seconds=gameplay,
                           parts=parts, subtitle=captions_path.name)
    report = {'short': short, 'video_format': 'short' if short else 'long', 'beta_episode': trace.get('short') is True and not puzzle and not viewport, 'draft': f'{base}.mp4', 'needs_continuation': not (won or (trace.get('game') == 'Последний сигнал' and trace.get('outcome') == 'game_reported_death' and len(trace['actions']) == 12)),
        'cuts_seconds': cuts, 'raw_duration_seconds': duration,
        'removed_fraction': sum(end - start for start, end in cuts) / duration, 'edited_duration_seconds': edited, 'edited_gameplay_seconds': gameplay,
        'boards_won': trace.get('boards_won'),
        'minimum_gameplay_seconds': MIN_EDITED_GAMEPLAY_SECONDS, 'duration_eligible': gameplay >= MIN_EDITED_GAMEPLAY_SECONDS,
        'captions': captions_path.name, 'captions_scope': 'synthesized_narration_only',
        'commentary': [text for _, text in lines], 'published': False}
    (folder / 'pilot.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print('::notice title=Edited pilot::' + json.dumps({k: v for k, v in report.items() if k not in {'commentary', 'cuts_seconds'}}), flush=True)


if __name__ == '__main__':
    build(Path(sys.argv[1]))
