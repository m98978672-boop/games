"""Exercise actual FFmpeg split and timed sidecars with synthetic media; no upload."""
import json
import subprocess
import sys
import tempfile
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import gameplay_edit
import gameplay_release_plan

with tempfile.TemporaryDirectory(prefix='gameplay-edit-smoke-') as temp:
    root = Path(temp)
    original = root / 'synthetic.mp4'
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-f', 'lavfi', '-i', 'testsrc=size=160x90:rate=25',
                    '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=48000', '-t', '4',
                    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', str(original)], check=True, timeout=60)
    cues = root / 'cues.json'
    cues.write_text(json.dumps([[0.5, 1.2, 'Первая фраза'], [1.8, 2.2, 'На границе'], [2.5, 3.0, 'Вторая часть']], ensure_ascii=False))
    # Production cutoff is 1800 seconds; shorten only in this synthetic test.
    with patch.object(gameplay_release_plan, 'MAX_PART_SECONDS', 2):
        parts = gameplay_edit.edit(original, cues, root / 'result', game='Тест', author='Автор', repository_url='https://github.com/example/test')
    assert len(parts) == 2 and all(p['uploaded'] is False for p in parts), parts
    assert '00:00:00,000 --> 00:00:00,200' in (root / 'result/part-2.ru.srt').read_text(encoding='utf-8')
    assert all((root / 'result' / part['video']).stat().st_size > 1000 for part in parts)
    print('Synthetic video split and caption boundaries validated; no publication.')
