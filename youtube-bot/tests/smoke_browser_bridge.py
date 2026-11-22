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
        assert pixel(bridge.step({'keys':['KeyW'], 'duration_ms':100})) == (0, 200, 0)
        assert pixel(bridge.step({'click':[400,300], 'duration_ms':100})) == (0, 0, 200)
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
