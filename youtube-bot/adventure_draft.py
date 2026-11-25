"""Build a private, trace-based Russian pilot; keep its raw footage unchanged."""
import json
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

GAME_URL = 'https://m98978672-boop.github.io/games/collection/adventure-game/'
ORDINAL = {'CHOICEONE': 'первый', 'CHOICETWO': 'второй', 'CHOICETHREE': 'третий'}


def plan(trace):
    duration = float(trace['duration_seconds'])
    lines = [(0.0, 'Я ищу потерянный артефакт.')]
    cuts = []
    prior = 0.0
    for event in trace['actions']:
        stamp_ms = event.get('recording_elapsed_ms')
        stamp = min(duration, max(prior, (stamp_ms or 0) / 1000))
        if event['screen_unchanged']:
            if stamp - prior > 6:
                cuts.append((prior + 3, stamp - 1))
        note = 'Экран не менялся. Пробую иначе.' if event.get('analyzing_stall') else ''
        action = ORDINAL[event['choice']]
        lines.append((prior, f'{note} Выбираю {action} вариант.'.strip()))
        prior = stamp
    won = trace['outcome'] == 'game_reported_victory'
    lines.append((prior, 'Артефакт найден.' if won else 'Финиш не подтверждён. Это первая часть.'))
    return duration, lines, cuts, won


def build(folder):
    trace = json.loads((folder / 'trace.json').read_text(encoding='utf-8'))
    duration, lines, cuts, won = plan(trace)
    base = 'zuza-pilot' if won else 'zuza-part-01'
    (folder / 'description.txt').write_text(
        f'{GAME_URL}\n\nThe Lost Artifact — пробная запись игры Qwen. '
        'Русский закадровый комментарий собран по журналу действий, а не выдаётся за мысли или чувства модели.\n'
        + ('Игра подтвердила победу.' if won else 'Часть 1: победа не подтверждена; продолжение пока не записано.')
        + '\nИсходник игры: https://github.com/ritaban06/mini-js-games-hub\n', encoding='utf-8')
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
        filters = [f'[0:v]fps=25,{select}tpad=stop_mode=clone:stop_duration={max(0, cursor-video_seconds):.3f}[v]']
        filters += [f'[{i+1}:a]adelay={ms}:all=1[a{i}]' for i, (_, ms) in enumerate(wavs)]
        filters += [''.join(f'[a{i}]' for i in range(len(wavs))) + f'amix=inputs={len(wavs)}:normalize=0,apad[a]']
        cmd = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', str(folder / 'recording.webm')]
        for wav, _ in wavs:
            cmd += ['-i', str(wav)]
        subprocess.run(cmd + ['-filter_complex', ';'.join(filters), '-map', '[v]', '-map', '[a]',
                       '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac',
                       '-shortest', '-movflags', '+faststart', str(folder / f'{base}.mp4')], check=True, timeout=300)
    (folder / 'pilot.json').write_text(json.dumps({'draft': f'{base}.mp4', 'needs_continuation': not won,
        'cuts_seconds': cuts, 'commentary': [text for _, text in lines], 'published': False}, ensure_ascii=False, indent=2), encoding='utf-8')


if __name__ == '__main__':
    build(Path(sys.argv[1]))
