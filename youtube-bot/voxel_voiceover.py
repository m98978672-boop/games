"""Private, factual commentary for the independent voxel experiment; no upload.

The trace and timings are diagnostic reports, not proof of victory or learning.
Narration describes selected actions rather than claiming their consequences.
"""
from __future__ import annotations

import json
import math
import subprocess
import tempfile
from pathlib import Path

from gameplay_captions import render_srt
from gameplay_edit import probe
from gameplay_voiceover import probe_capture

ACTION_TEXT = {
    'FORWARD': 'двигаемся вперёд', 'BACK': 'отступаем назад',
    'STRAFELEFT': 'смещаемся влево', 'STRAFERIGHT': 'смещаемся вправо',
    'SPACE': 'пробуем прыгнуть', 'LOOKLEFT': 'смотрим влево',
    'LOOKRIGHT': 'смотрим вправо', 'LOOKUP': 'смотрим вверх',
    'LOOKDOWN': 'смотрим вниз', 'MINE': 'пробуем добывать блок',
    'WAIT': 'ждём и наблюдаем',
}


def narration_events(report: dict, duration: float) -> list[tuple[float, str]]:
    if not isinstance(report, dict) or report.get('recorded') is not True or report.get('published') is not False:
        raise ValueError('Expected an unpublished, recorded experiment')
    if not math.isfinite(duration) or not 10 <= duration <= 3600:
        raise ValueError('Invalid recording duration')
    steps = report.get('model_actions')
    if not isinstance(steps, list) or not 1 <= len(steps) <= 1000:
        raise ValueError('Missing bounded action trace')
    events = [(0.0, 'Привет! Сегодня Квеня пробует выживать в независимой игре, похожей на Майнкрафт. Мы помогаем ей с некоторыми действиями.')]
    previous = -1
    for number, step in enumerate(steps, 1):
        if not isinstance(step, dict) or step.get('step') != number or type(step.get('step')) is not int:
            raise ValueError('Invalid action step')
        ms = step.get('recording_elapsed_ms')
        action, assisted = step.get('action'), step.get('scripted_initial_approach')
        if (type(ms) is not int or ms <= previous or ms < 0 or ms / 1000 > duration + 2
                or not isinstance(action, str) or action not in ACTION_TEXT or type(assisted) is not bool):
            raise ValueError('Invalid action timing or action')
        previous = ms
        prefix = 'С внешней помощью' if assisted else 'Следующее действие'
        events.append((ms / 1000, f'{prefix}: {ACTION_TEXT[action]}.'))
    outcome = report.get('stop_reason')
    if outcome == 'game_reported_death':
        ending = 'Итог: игра сообщила о гибели персонажа. Добыча и прохождение не подтверждены.'
    elif outcome == 'game_reported_wood_obtained':
        ending = 'Итог: игра сообщила о получении дерева. Полное прохождение не подтверждено.'
    else:
        ending = 'Итог: пробная сессия завершена. Полное прохождение не подтверждено.'
    # This is positioned after synthesis using its measured duration.
    events.append((duration, ending))
    return events


def voiceover(video: Path, trace_path: Path, destination: Path) -> dict:
    video, trace_path, destination = map(Path, (video, trace_path, destination))
    if (video.is_symlink() or not video.is_file() or trace_path.is_symlink() or not trace_path.is_file()
            or trace_path.stat().st_size > 1_000_000 or destination.exists() or destination.is_symlink()
            or not destination.parent.is_dir()):
        raise ValueError('Invalid input or destination')
    from renderer import synthesize
    duration = probe_capture(video)
    events = narration_events(json.loads(trace_path.read_text(encoding='utf-8')), duration)
    with tempfile.TemporaryDirectory(prefix='.voxel-voice-', dir=destination.parent) as temp:
        tmp = Path(temp)
        clips = []
        for index, (at, text) in enumerate(events):
            wav = tmp / f'voice-{index:04}.wav'
            length = synthesize(text, wav, style='bright' if index == 0 else 'reflective' if index == len(events)-1 else 'neutral')
            if not math.isfinite(length) or not 0 < length <= 30:
                raise ValueError('Invalid speech duration')
            clips.append((at, text, wav, length))
        intro, ending = clips[0], clips[-1]
        ending_at = duration - ending[3]
        if intro[3] + 0.5 > ending_at:
            raise ValueError('Video is too short for the introduction and ending')
        selected = [(0.0, intro[3], intro[1], intro[2])]
        for at, text, wav, length in clips[1:-1]:
            if at >= selected[-1][1] + .2 and at + length + .2 <= ending_at:
                selected.append((at, at + length, text, wav))
        selected.append((ending_at, duration, ending[1], ending[2]))
        inputs = []
        filters = [f'anullsrc=r=48000:cl=stereo,atrim=duration={duration:.3f}[bed]']
        labels = ['[bed]']
        for i, (start, _, _, wav) in enumerate(selected, 1):
            inputs += ['-i', str(wav)]
            filters.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={round(start*1000)}:all=1[a{i}]')
            labels.append(f'[a{i}]')
        filters.append(''.join(labels) + f'amix=inputs={len(labels)}:duration=first:normalize=0[a]')
        out = tmp / 'voiced.mp4'
        subprocess.run(['ffmpeg','-nostdin','-v','error','-n','-i',str(video),*inputs,'-filter_complex',';'.join(filters),
                        '-map','0:v:0','-map','[a]','-c:v','libx264','-preset','veryfast','-crf','23',
                        '-c:a','aac','-movflags','+faststart',str(out)],check=True,timeout=7200)
        if abs(probe(out) - duration) > .25:
            raise ValueError('Voiced recording duration differs from capture')
        final = tmp / 'deliverable'
        final.mkdir()
        out.rename(final / 'voiced.mp4')
        cues = [(start, end, text) for start, end, text, _ in selected]
        (final / 'captions-cues.json').write_text(json.dumps(cues,ensure_ascii=False),encoding='utf-8')
        (final / 'voiced.ru.srt').write_text(render_srt(cues,end=duration),encoding='utf-8')
        max_silence = max([cues[0][0]] + [b[0]-a[1] for a,b in zip(cues,cues[1:])] + [duration-cues[-1][1]])
        result = {'duration_seconds':round(duration,2),'spoken_clips':len(cues),'max_silence_seconds':round(max_silence,2),
                  'game_audio':False,'recorded_playthrough_completed':False,'published':False}
        (final / 'voiceover-report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
        if destination.exists() or destination.is_symlink():
            raise FileExistsError('Destination appeared during render')
        final.rename(destination)
    return result


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Voice a private voxel recording; never publishes')
    parser.add_argument('video', type=Path)
    parser.add_argument('trace', type=Path)
    parser.add_argument('destination', type=Path)
    args = parser.parse_args()
    print(json.dumps(voiceover(args.video, args.trace, args.destination), ensure_ascii=False))
