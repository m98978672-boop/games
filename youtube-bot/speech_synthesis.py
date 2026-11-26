"""Shared local Russian narration for private gameplay edits; no publishing."""
import os
import subprocess
from pathlib import Path

from speech_pronunciation import pronunciation_text, speech_cadence


def validate_spoken_text(spoken: str) -> str:
    if not spoken or any(ord(ch) < 32 and ch != '\t' for ch in spoken):
        raise ValueError('Narration must be nonempty and contain no control characters or embedded newlines')
    return spoken


def synthesize_narration(text: str, wav: Path, *, espeak_rate: int = 145) -> None:
    """Synthesize one clip, using Piper when configured, otherwise eSpeak-NG.

    Source text stays untouched for captions. Cadence varies only by punctuation;
    the voice model controls pitch and natural prosody.
    """
    spoken = validate_spoken_text(pronunciation_text(text))
    length, sentence_silence, _ = speech_cadence(text)
    model = os.environ.get('PIPER_MODEL_PATH', '').strip()
    if model:
        if not Path(model).is_file() or not Path(model + '.json').is_file():
            raise RuntimeError('Russian neural voice is missing; refusing fallback audio')
        subprocess.run(['piper', '--model', model, '--output_file', str(wav),
                        '--length_scale', length, '--sentence_silence', sentence_silence],
                       input=spoken, text=True, check=True, timeout=60)
    else:
        subprocess.run(['espeak-ng', '-v', 'ru', '-s', str(espeak_rate), '-w', str(wav), '--stdin'],
                       input=spoken, text=True, check=True, timeout=60)
