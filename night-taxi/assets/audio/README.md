# Engine recordings

These locally hosted WAV files are recordings (not synthesized tones), obtained from
[mutaaf/outatime-88](https://github.com/mutaaf/outatime-88/tree/main/src/sfx/audio).
That project documents their sources and processing in its
[audio credits](https://github.com/mutaaf/outatime-88/blob/main/docs/AUDIO_CREDITS.md).

- `engine-lo.wav`: `Car_Engine_Loop.ogg` from [Car Sound Effects Pack (Low Quality)](https://opengameart.org/content/car-sound-effects-pack-low-quality) by GGBotNet, CC0.
- `engine-hi.wav`: `loop_0.wav` from [racing car engine sound loops](https://opengameart.org/content/racing-car-engine-sound-loops) by domasx2, CC0.

The intermediate project downmixed the recordings to mono, peak-normalised them,
resampled them to 22.05 kHz PCM WAV, and crossfaded the low-rev loop. License text:
`LICENSE-CC0.txt`. Both files are bundled locally so playback does not depend on the original hosts.
