"""Original deterministic ambient composition, no samples or external libraries.
32-second seamless mono PCM loop; deliberately quiet headroom for game effects.
"""
from pathlib import Path
import math
import random
import struct
import wave

RATE = 22050
SECONDS = 32
OUT = Path(__file__).resolve().parents[1] / 'assets/audio/rubezh.wav'

def render():
    rng = random.Random(8201)
    # Whole-period oscillators avoid a discontinuity at the looping boundary.
    frequencies = [round(hz * SECONDS) / SECONDS for hz in (55, 82.4069, 110, 130.8128, 164.8138)]
    phases = [rng.random() * math.tau for _ in frequencies]
    pcm = bytearray()
    for i in range(RATE * SECONDS):
        t = i / RATE
        slow = 0.7 + 0.3 * math.cos(math.tau * t / SECONDS)
        pad = sum(math.sin(math.tau * f * t + p) / (j + 2)
                  for j, (f, p) in enumerate(zip(frequencies, phases))) * 0.12 * slow
        # Soft recurring bell, periodic distance preserves exact loop phase.
        bell = 0.0
        for start, f in [(0, 330), (8, 293.65625), (16, 261.625), (24, 220)]:
            age = (t - start) % SECONDS
            envelope = (1 - math.exp(-age * 12)) * math.exp(-age * 0.9)
            bell += math.sin(math.tau * f * age) * envelope * 0.045
        pcm += struct.pack('<h', round(max(-1, min(1, pad + bell)) * 32767))
    return pcm

if __name__ == '__main__':
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUT), 'wb') as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(RATE)
        audio.writeframes(render())
    print(OUT)
