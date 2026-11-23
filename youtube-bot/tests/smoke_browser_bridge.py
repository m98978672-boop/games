"""Drive a test HTML game through the actual network-less Docker bridge."""
import base64
import io
import sys
import tempfile
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay_bridge import BrowserBridge, run_agent

HTML = '''<!doctype html><html><body style="margin:0;background:rgb(200,0,0)">
<script>
window.addEventListener('keydown', e => { if(e.code === 'KeyW') document.body.style.background='rgb(0,200,0)' });
window.addEventListener('click', () => { document.body.style.background='rgb(0,0,200)' });
window.addEventListener('mousemove', e => { if(e.clientX > 420) document.body.style.background='rgb(200,200,0)' });
window.addEventListener('mousedown', () => { document.body.style.background='rgb(200,0,200)' });
window.addEventListener('contextmenu', e => { e.preventDefault(); document.body.style.background='rgb(0,200,200)' });
</script></body></html>'''
def pixel(observation):
    assert observation['type'] == 'observation', observation
    assert (observation['width'], observation['height']) == (800, 600)
    image = Image.open(io.BytesIO(base64.b64decode(observation['screenshot_png_base64'], validate=True)))
    return image.convert('RGB').getpixel((400, 300))

with tempfile.TemporaryDirectory(prefix='bridge-test-') as temp:
    game = Path(temp) / 'game'
    game.mkdir(mode=0o755)
    (game / 'index.html').write_text(HTML)
    # Docker runs as the host uid; no workspace or credentials are mounted.
    with BrowserBridge(game, rights_acknowledged=True) as bridge:
        assert pixel(bridge.receive()) == (200, 0, 0)
        assert bridge.step({'keys':['MetaLeft'], 'duration_ms':100})['type'] == 'error'
        assert bridge.step({'click':[800,0]})['type'] == 'error'
        assert bridge.step({'look':[101,0]})['type'] == 'error'
        assert bridge.step({'hold_ms':2001,'click':[400,300]})['type'] == 'error'
        assert bridge.step({'hold_ms':100})['type'] == 'error'
        assert bridge.step({'button':'right'})['type'] == 'error'
        assert bridge.step({'click':[400,300], 'button':'middle'})['type'] == 'error'
        assert pixel(bridge.step({'look':[50,0]})) == (200, 200, 0)
        assert pixel(bridge.step({'click':[400,300], 'button':'right'})) == (0, 200, 200)
        assert pixel(bridge.step({'click':[400,300], 'hold_ms':100, 'duration_ms':100})) == (0, 0, 200)
        assert pixel(bridge.step({'keys':['KeyW'], 'duration_ms':100})) == (0, 200, 0)
        assert pixel(bridge.step({'click':[400,300], 'duration_ms':100})) == (0, 0, 200)
    # Actual browser recording of the synthetic fixture, no model or upload.
    import subprocess, json
    recording = Path(temp) / 'recording'
    recording.mkdir()
    with BrowserBridge(game, rights_acknowledged=True, record_dir=recording) as bridge:
        bridge.receive()
        bridge.step({'keys':['KeyW'], 'duration_ms':500})
        bridge.step({'click':[400,300], 'duration_ms':500})
        video = bridge.finish_recording()
    info = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=codec_type', '-of', 'json', str(video)], check=True, capture_output=True, text=True).stdout)
    assert float(info['format']['duration']) > 0 and any(s.get('codec_type') == 'video' for s in info['streams']), info
    print('Actual browser bridge recording validated; synthetic fixture, no upload')
    def test_agent(png, step):
        color = Image.open(io.BytesIO(png)).convert('RGB').getpixel((400, 300))
        if step == 0:
            assert color == (200, 0, 0)
            return {'keys':['KeyW'], 'duration_ms':100}
        if step == 1:
            assert color == (0, 200, 0)
            return {'click':[400,300], 'duration_ms':100}
        assert color == (0, 0, 200)
        return None
    result = run_agent(game, test_agent, rights_acknowledged=True, max_steps=4)
    assert result == {'steps': 2, 'status': 'agent_stopped', 'uploaded': False}, result
print('Browser bridge: screenshot, keyboard, mouse and invalid actions passed in isolated container')

# A second test uses an actual, more complex repository game, not the toy fixture.
# Copy only its public assets and shared scripts: never mount the whole checkout.
import shutil
from PIL import ImageChops, ImageStat
repo = Path(__file__).resolve().parents[2]
with tempfile.TemporaryDirectory(prefix='bridge-taxi-') as temp:
    root = Path(temp) / 'public'
    root.mkdir()
    shutil.copytree(repo / 'night-taxi', root / 'night-taxi', ignore=shutil.ignore_patterns('node_modules', 'tests', 'src', 'package*.json'))
    shutil.copytree(repo / 'shared', root / 'shared')
    with BrowserBridge(root, rights_acknowledged=True, entry='night-taxi/index.html') as bridge:
        initial = bridge.receive(timeout=60)
        assert initial['type'] == 'observation', initial
        # Give scripts time to initialize; T opens the in-game tablet.
        bridge.step({'duration_ms':2000})
        before = bridge.step({'duration_ms':300})
        opened = bridge.step({'keys':['KeyT'], 'duration_ms':500})
        assert before['type'] == opened['type'] == 'observation'
        def picture(obs): return Image.open(io.BytesIO(base64.b64decode(obs['screenshot_png_base64']))).convert('RGB')
        difference = ImageStat.Stat(ImageChops.difference(picture(before), picture(opened))).mean
        assert sum(difference) > 5, f'No visible response to tablet key: {difference}'
        print('Night Taxi browser fixture responded visually to the tablet key; no recording or upload')
