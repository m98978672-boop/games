"""Produce private, fixed speech fixtures for listening and basic WAV checks."""
import array
import hashlib
import json
import math
import os
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from speech_pronunciation import pronunciation_text, speech_cadence
from speech_synthesis import synthesize_narration

EXAMPLES = [
    'Открой дверь. Нажми [E] в Steam.',
    'Путь открыт?',
    'Мы почти добрались!',
    'Выставь 800x600. Оценка — 7 из 10.',
]


def check_wav(path):
    with wave.open(str(path), 'rb') as stream:
        channels, width, rate, frames = stream.getnchannels(), stream.getsampwidth(), stream.getframerate(), stream.getnframes()
        if width != 2 or channels != 1 or rate < 8000 or frames <= 0 or frames > rate * 90:
            raise ValueError('Invalid generated voice format or duration')
        samples = array.array('h', stream.readframes(frames))
    if sys.byteorder != 'little':
        samples.byteswap()
    peak = max(map(abs, samples), default=0)
    rms = math.sqrt(sum(value * value for value in samples) / len(samples)) if samples else 0
    if peak < 100 or rms < 10:
        raise ValueError('Generated speech is silent')
    return round(frames / rate, 3), peak, round(rms, 1)


def smoke_montage(target, model):
    """Synthetic fixture: real Piper, captions, FFmpeg and private output only."""
    from adventure_draft import build
    from gameplay_release_evidence import measure_srt

    os.environ['PIPER_MODEL_PATH'] = model
    with tempfile.TemporaryDirectory(prefix='speech-montage-') as temp:
        folder = Path(temp)
        raw = folder / 'recording.webm'
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-f', 'lavfi', '-i',
                        'color=c=blue:s=320x240:r=25:d=4', '-an', '-c:v', 'libvpx',
                        '-deadline', 'realtime', str(raw)], check=True, timeout=90)
        original = hashlib.sha256(raw.read_bytes()).hexdigest()
        trace = {'game': 'Последний сигнал', 'outcome': 'time_limit', 'actions': [
            {'choice_label': 'Нажми [E]?', 'screen_unchanged': False, 'recording_elapsed_ms': 1000},
        ]}
        (folder / 'trace.json').write_text(json.dumps(trace, ensure_ascii=False), encoding='utf-8')
        build(folder)
        report = json.loads((folder / 'pilot.json').read_text(encoding='utf-8'))
        captions = (folder / report['captions']).read_text(encoding='utf-8')
        cue_count, spoken_seconds = measure_srt(captions)
        if cue_count != 3 or spoken_seconds <= 0 or 'Мой выбор: Нажми [E]?' not in captions:
            raise ValueError('Synthetic montage captions do not match the original narration')
        if hashlib.sha256(raw.read_bytes()).hexdigest() != original or report['published'] is not False:
            raise ValueError('The original recording changed or the draft was marked published')
        video = folder / report['draft']
        probe = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_entries',
            'format=duration:stream=codec_type', '-of', 'json', str(video)], check=True,
            capture_output=True, text=True, timeout=30).stdout)
        if not {'video', 'audio'} <= {s['codec_type'] for s in probe['streams']}:
            raise ValueError('Synthetic montage is missing video or narration')
        extracted = folder / 'narration.wav'
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', str(video), '-vn',
                        '-ac', '1', '-ar', '24000', '-c:a', 'pcm_s16le', str(extracted)],
                       check=True, timeout=60)
        check_wav(extracted)
        (target / 'synthetic-montage.mp4').write_bytes(video.read_bytes())
        (target / 'synthetic-montage.ru.srt').write_text(captions, encoding='utf-8')
        print('::notice title=Real voice and montage::Synthetic draft contains non-silent Piper audio and sample-timed original captions; never published.')


def main():
    target = Path(sys.argv[1]); target.mkdir(parents=True, exist_ok=True)
    model = os.environ.get('PIPER_MODEL_PATH', '').strip()
    if not model:
        raise RuntimeError('PIPER_MODEL_PATH is required for this comparison')
    rows = []
    for engine in ('piper', 'espeak-ng'):
        os.environ['PIPER_MODEL_PATH'] = model if engine == 'piper' else ''
        for i, text in enumerate(EXAMPLES):
            path = target / f'{engine}-{i + 1}.wav'
            synthesize_narration(text, path)
            duration, peak, rms = check_wav(path)
            rows.append({'engine': engine, 'file': path.name, 'caption': text,
                         'spoken_input': pronunciation_text(text), 'cadence': speech_cadence(text),
                         'duration_seconds': duration, 'peak': peak, 'rms': rms})
    smoke_montage(target, model)
    (target / 'summary.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
    print('::notice title=Speech smoke::Generated eight non-silent Piper and eSpeak WAV files; listening review is required.')


if __name__ == '__main__':
    main()
