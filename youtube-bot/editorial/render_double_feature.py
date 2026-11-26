"""Render the two approved Russian editorials, with one card per chapter."""
import re
import subprocess
import sys
import wave
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from adventure_draft import narrate


def render(source, output):
    output.mkdir(parents=True, exist_ok=True)
    episodes = re.split(r'^## ', source.read_text(encoding='utf-8'), flags=re.M)[1:]
    if len(episodes) != 2:
        raise ValueError('Expected exactly two editorial episodes')
    for slug, episode in zip(('portal-2', 'cities-skylines'), episodes):
        directory = output / slug
        directory.mkdir(exist_ok=True)
        title = episode.splitlines()[0].split(': ', 1)[0]
        chapters = re.split(r'^\*\*(?:Титр|Карточка): «(.+?)»\.\*\*\s*$', episode, flags=re.M)
        if len(chapters) < 13:
            raise ValueError('Incomplete editorial chapters')
        parts = []
        seconds = 0
        for index, (heading, text) in enumerate(zip(chapters[1::2], chapters[2::2])):
            text = text.replace('**', '').removesuffix('---\n\n').strip()
            text = re.sub(r'\s*---\s*\Z', '', text)
            wav = directory / f'{index}.wav'
            narrate(text, wav)
            with wave.open(str(wav)) as sound:
                length = sound.getnframes() / sound.getframerate()
            if length < 2:
                raise ValueError('Empty narration chapter')
            seconds += length
            (directory / 'heading.txt').write_text(heading, encoding='utf-8')
            (directory / 'title.txt').write_text(f'ЗУЗА  /  {title}  /  {index+1:02d}', encoding='utf-8')
            part = f'chapter-{index:02d}.mp4'
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=0x171f30:s=1280x720:r=25',
                            '-i', wav.name, '-vf', 'drawbox=x=64:y=200:w=1100:h=5:c=0x68e1bb:t=fill,'
                            'drawtext=font=DejaVu Sans:textfile=title.txt:fontsize=29:fontcolor=0x68e1bb:x=64:y=115,'
                            'drawtext=font=DejaVu Sans:textfile=heading.txt:fontsize=35:fontcolor=white:x=64:y=300',
                            '-shortest', '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-c:a', 'aac',
                            '-b:a', '160k', part], cwd=directory, check=True)
            parts.append(part)
        if seconds <= 180:
            raise ValueError(f'{slug}: expected a long review, got {seconds:.1f}s')
        listing = directory / 'concat.txt'
        listing.write_text(''.join(f"file '{part}'\n" for part in parts), encoding='ascii')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '1', '-i', str(listing),
                        '-c', 'copy', '-movflags', '+faststart', str(output / f'{slug}.mp4')], check=True)
        print(f'::notice title=Editorial verified::{slug}: {seconds:.1f}s, {len(parts)} voiced chapters')


if __name__ == '__main__':
    render(Path(__file__).with_name('talk-only-double-feature.ru.md'), Path(sys.argv[1]))
