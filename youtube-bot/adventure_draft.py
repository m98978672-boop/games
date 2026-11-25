"""Build a private, trace-based Russian pilot; keep its raw footage unchanged."""
import json
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

from gameplay_voiceover import probe_capture
from adventure_personality import SHORT_SECONDS, short_comment

GAME_URL = 'https://m98978672-boop.github.io/games/collection/adventure-game/'
PUZZLE_URL = 'https://m98978672-boop.github.io/games/collection/16-puzzle/'
MIN_EDITED_GAMEPLAY_SECONDS = 600
ORDINAL = {'CHOICEONE': 'первый', 'CHOICETWO': 'второй', 'CHOICETHREE': 'третий'}


def plan(trace):
    duration = float(trace['duration_seconds'])
    puzzle = trace.get('game') == '16 Puzzle'
    events = trace['model_actions'] if puzzle else trace['actions']
    lines = [(0.0, 'Собираю пятнашки по порядку.' if puzzle else 'Я ищу потерянный артефакт.')]
    cuts = []
    prior = 0.0
    previous_source = None
    current_round = 1
    for event in events:
        stamp_ms = event.get('recording_elapsed_ms')
        stamp = min(duration, max(prior, (stamp_ms or 0) / 1000))
        stalled = not event['move_verified'] if puzzle else event['screen_unchanged']
        if stalled:
            if stamp - prior > 6:
                cuts.append((prior + 3, stamp - 1))
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
    ending = f'Решено досок: {trace.get("boards_won", 1)}.' if puzzle else 'Артефакт найден.'
    lines.append((prior, ending if won else 'Финиш не подтверждён. Это первая часть.'))
    return duration, lines, cuts, won


def build(folder):
    trace = json.loads((folder / 'trace.json').read_text(encoding='utf-8'))
    raw = folder / 'recording.webm'
    trace['duration_seconds'] = probe_capture(raw)
    duration, lines, cuts, won = plan(trace)
    short = trace.get('short') is True
    base = 'zuza-adventure-short' if short else ('zuza-pilot' if won else 'zuza-part-01')
    puzzle = trace.get('game') == '16 Puzzle'
    url = PUZZLE_URL if puzzle else GAME_URL
    title = 'Пятнашки' if puzzle else 'The Lost Artifact'
    source = 'https://github.com/kunjgit/GameZone' if puzzle else 'https://github.com/ritaban06/mini-js-games-hub'
    (folder / 'description.txt').write_text(
        f'{url}\n\n{title} — пробная запись игры Qwen. '
        'Русский закадровый комментарий собран по журналу действий.\n'
        + ('Игра подтвердила победу.' if won else 'Часть 1: победа не подтверждена; продолжение пока не записано.')
        + f'\nИсходник игры: {source}\n', encoding='utf-8')
    with tempfile.TemporaryDirectory() as temp:
        wavs = []
        cursor = 0.0
        for index, (stamp, text) in enumerate(lines):
            wav = Path(temp) / f'{index}.wav'
            subprocess.run(['espeak-ng', '-v', 'ru', '-s', '175', '-w', str(wav), text], check=True, timeout=30)
            with wave.open(str(wav), 'rb') as reader:
                seconds = reader.getnframes() / reader.getframerate()
            stamp -= sum(max(0, min(stamp, end) - start) for start, end in cuts)
            start = max(cursor, stamp)
            wavs.append((wav, round(start * 1000)))
            cursor = start + seconds + 0.12
        # Remove only redundant waiting on unchanged screens and keep the full raw recording.
        video_seconds = duration - sum(end - start for start, end in cuts)
        discard = '+'.join(f'between(t,{start:.3f},{end:.3f})' for start, end in cuts)
        select = f"select='not({discard})',setpts=N/(25*TB)," if cuts else ''
        # A closing hold, if needed, is for narration only; the raw footage is untouched.
        closing_hold = max(0, cursor - video_seconds)
        if short and max(video_seconds, cursor) > SHORT_SECONDS:
            raise ValueError('Edited Short and narration exceed 180 seconds; no export generated')
        portrait = ',scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1' if short else ''
        filters = [f'[0:v]fps=25,{select}tpad=stop_mode=clone:stop_duration={closing_hold:.3f}{portrait}[v]']
        # The clips never overlap. Assemble one PCM track to avoid opening
        # hundreds of FFmpeg inputs for a multi-board campaign.
        narration = Path(temp) / 'narration.wav'
        with wave.open(str(narration), 'wb') as target:
            output_format = None
            written = 0
            for wav, offset_ms in wavs:
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
                    target.writeframesraw(clip.readframes(clip.getnframes()))
                    written += silence + clip.getnframes()
        filters.append('[1:a]apad[a]')
        cmd = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', str(raw), '-i', str(narration)]
        subprocess.run(cmd + ['-filter_complex', ';'.join(filters), '-map', '[v]', '-map', '[a]',
                       '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac',
                       '-shortest', '-movflags', '+faststart', str(folder / f'{base}.mp4')], check=True, timeout=300)
    edited = probe_capture(folder / f'{base}.mp4')
    if short and edited > SHORT_SECONDS:
        raise ValueError('Encoded Short exceeds the three-minute limit')
    gameplay = min(video_seconds, max(0.0, edited - closing_hold))
    report = {'short': short, 'draft': f'{base}.mp4', 'needs_continuation': not won,
        'cuts_seconds': cuts, 'edited_duration_seconds': edited, 'edited_gameplay_seconds': gameplay,
        'boards_won': trace.get('boards_won'),
        'minimum_gameplay_seconds': MIN_EDITED_GAMEPLAY_SECONDS, 'duration_eligible': gameplay > MIN_EDITED_GAMEPLAY_SECONDS, 'commentary': [text for _, text in lines], 'published': False}
    (folder / 'pilot.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print('::notice title=Edited pilot::' + json.dumps({k: v for k, v in report.items() if k not in {'commentary', 'cuts_seconds'}}), flush=True)


if __name__ == '__main__':
    build(Path(sys.argv[1]))
