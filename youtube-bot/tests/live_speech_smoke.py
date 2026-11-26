"""Produce private, fixed speech fixtures for listening and basic WAV checks."""
import array
import json
import math
import os
import sys
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
    (target / 'summary.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
    print('::notice title=Speech smoke::Generated eight non-silent Piper and eSpeak WAV files; listening review is required.')


if __name__ == '__main__':
    main()
