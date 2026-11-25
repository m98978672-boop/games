"""Render an original Russian editorial as title cards, without gameplay."""
import subprocess
import sys
from pathlib import Path


def run(*args):
    subprocess.run(args, check=True)


def render(folder):
    folder = folder.resolve()
    folder.mkdir(parents=True, exist_ok=True)
    source = Path(__file__).with_name('gta-vi.txt').read_text(encoding='utf-8')
    clips = []
    for index, chapter in enumerate(source.removeprefix('# ').strip().split('\n\n# ')):
        title, body = chapter.split('\n', 1)
        label = folder / f'{index}.title'
        text = folder / f'{index}.txt'
        voice = folder / f'{index}.wav'
        clip = folder / f'{index}.mp4'
        label.write_text(title, encoding='utf-8')
        text.write_text(body.replace('GTA VI', 'джи ти эй шесть').replace('GTA', 'джи ти эй'), encoding='utf-8')
        run('espeak-ng', '-v', 'ru', '-s', '153', '-f', str(text), '-w', str(voice))
        draw = ("drawbox=x=96:y=190:w=10:h=330:color=0xff9472:t=fill,"
                "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:"
                f"textfile={label}:expansion=none:x=136:y=292:fontsize=46:fontcolor=white,"
                f"drawtext=text='GTA VI   /   {index+1:02}':x=136:y=228:fontsize=30:fontcolor=0xff9472")
        run('ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=0x192032:s=1280x720:r=25',
            '-i', str(voice), '-vf', draw, '-shortest', '-c:v', 'libx264', '-threads', '2', '-crf', '20',
            '-c:a', 'aac', '-b:a', '128k', str(clip))
        clips.append(clip)
    playlist = folder / 'playlist.txt'
    playlist.write_text(''.join(f"file '{clip.name}'\n" for clip in clips), encoding='utf-8')
    output = folder / 'gta-vi-editorial.mp4'
    run('ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '1', '-i', str(playlist), '-c', 'copy', '-movflags', '+faststart', str(output))
    run('ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=codec_type', '-of', 'json', str(output))


if __name__ == '__main__':
    render(Path(sys.argv[1]))
