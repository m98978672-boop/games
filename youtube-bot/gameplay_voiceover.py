"""Produce an honest, private voiced draft from a model-controlled 2048 capture.

Narration is deterministic, not a personal game review. It describes only the
validated action trace; it cannot establish whether a move changed the board or
the session was won. No YouTube credentials, publication or rights approval.
"""
from __future__ import annotations

import argparse
import json
import math
import os
import subprocess
import tempfile
import wave
from pathlib import Path
from typing import Any

from gameplay_captions import render_srt
from gameplay_edit import probe as probe_voiced
from speech_synthesis import synthesize_narration

DIRECTIONS = {'LEFT': 'влево', 'RIGHT': 'вправо', 'UP': 'вверх', 'DOWN': 'вниз'}


def validate_trace(trace: Any, duration: float) -> list[dict]:
    if not math.isfinite(duration) or not 10 <= duration <= 3600:
        raise ValueError('Capture must be 10–3600 seconds')
    if not isinstance(trace, list) or not 1 <= len(trace) <= 1000:
        raise ValueError('A non-empty bounded action trace is required')
    last = -1
    for number, item in enumerate(trace, 1):
        if (not isinstance(item, dict) or set(item) != {'step', 'action', 'observed_ms'}
                or type(item['step']) is not int or item['step'] != number
                or item['action'] not in DIRECTIONS or type(item['observed_ms']) is not int
                or item['observed_ms'] <= last or item['observed_ms'] < 0
                or item['observed_ms'] / 1000 > duration + 2):
            raise ValueError('Invalid model action trace')
        last = item['observed_ms']
    return trace


def probe_capture(video: Path) -> float:
    info = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_entries',
        'format=duration:stream=codec_type', '-of', 'json', str(video)],
        check=True, capture_output=True, text=True, timeout=60).stdout)
    if not any(s.get('codec_type') == 'video' for s in info.get('streams', [])):
        raise ValueError('Capture has no video')
    duration = float(info['format']['duration'])
    if not math.isfinite(duration):
        raise ValueError('Invalid capture duration')
    return duration


def voiceover(video: Path, trace_file: Path, output: Path) -> dict:
    video, trace_file, output = Path(video), Path(trace_file), Path(output)
    if video.is_symlink() or not video.is_file() or trace_file.is_symlink() or not trace_file.is_file():
        raise ValueError('Inputs must be regular files, not symlinks')
    if trace_file.stat().st_size > 200_000 or output.exists() or output.is_symlink() or not output.parent.is_dir():
        raise ValueError('Invalid input or output already exists')
    duration = probe_capture(video)
    trace = validate_trace(json.loads(trace_file.read_text(encoding='utf-8')), duration)
    with tempfile.TemporaryDirectory(prefix='.voiceover-', dir=output.parent) as temp:
        tmp = Path(temp)
        intro = 'Это запись игровой сессии Квени в две тысячи сорок восемь. Модель выбирает действия сама.'
        outro = f'Сделано попыток хода: {len(trace)}. Победа не подтверждена. Это пробная сессия, не полное прохождение.'
        speech = []
        def synth(text: str) -> tuple[Path, float]:
            wav = tmp / f'speech-{len(list(tmp.glob("speech-*.wav"))):04d}.wav'
            synthesize_narration(text, wav, espeak_rate=145)
            with wave.open(str(wav), 'rb') as stream:
                length = stream.getnframes() / stream.getframerate()
            if not 0 < length <= 30:
                raise ValueError('Invalid synthesized speech length')
            return wav, length
        intro_wav, intro_duration = synth(intro)
        outro_wav, outro_duration = synth(outro)
        if intro_duration + outro_duration + 0.5 > duration:
            raise ValueError('Capture is too short for an honest introduction and recap')
        speech.append((0.0, intro_duration, intro, intro_wav))
        recap_start = duration - outro_duration
        for event in trace:
            at = event['observed_ms'] / 1000
            if at <= speech[-1][1] + 0.2 or at >= recap_start:
                continue
            text = f"Действие {event['step']}: {DIRECTIONS[event['action']]}."
            wav, length = synth(text)
            if at + length + 0.2 <= recap_start:
                speech.append((at, at + length, text, wav))
        speech.append((recap_start, duration, outro, outro_wav))
        audio_inputs = []
        filters = [f'anullsrc=r=48000:cl=stereo,atrim=duration={duration:.3f}[bed]']
        labels = ['[bed]']
        for index, (start, _end, _text, wav) in enumerate(speech, 1):
            audio_inputs.extend(['-i', str(wav)])
            filters.append(f'[{index}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={round(start * 1000)}:all=1[a{index}]')
            labels.append(f'[a{index}]')
        filters.append(''.join(labels) + f'amix=inputs={len(labels)}:duration=first:normalize=0[a]')
        result = tmp / 'result.mp4'
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-n', '-i', str(video), *audio_inputs,
                        '-filter_complex', ';'.join(filters), '-map', '0:v:0', '-map', '[a]',
                        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-c:a', 'aac',
                        '-movflags', '+faststart', str(result)], check=True, timeout=7200)
        if abs(probe_voiced(result) - duration) > 0.25:
            raise ValueError('Voiced output duration differs from original capture')
        deliverable = tmp / 'deliverable'
        deliverable.mkdir()
        result.rename(deliverable / 'voiced.mp4')
        cues = [[start, end, text] for start, end, text, _ in speech]
        (deliverable / 'captions-cues.json').write_text(json.dumps(cues, ensure_ascii=False), encoding='utf-8')
        (deliverable / 'voiced.ru.srt').write_text(render_srt(cues, end=duration), encoding='utf-8')
        report = {'game': '2048', 'model_actions': len(trace), 'commentary_clips': len(speech),
                  'duration_seconds': round(duration, 2),
                  'voice': ('Piper' if os.environ.get('PIPER_MODEL_PATH', '').strip() else 'espeak-ng') + ' deterministic action recap',
                  'game_audio': False, 'gameplay_completed': False, 'uploaded': False}
        (deliverable / 'voiceover-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
        if output.exists() or output.is_symlink():
            raise FileExistsError('Output directory appeared while rendering')
        deliverable.rename(output)
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description='Voice an existing private model gameplay capture; no upload')
    parser.add_argument('video', type=Path)
    parser.add_argument('trace', type=Path)
    parser.add_argument('output_dir', type=Path)
    args = parser.parse_args()
    print(json.dumps(voiceover(args.video, args.trace, args.output_dir), ensure_ascii=False))

if __name__ == '__main__':
    main()
