"""Drive the reflex agent through the real network-less Docker bridge.

Needs Docker and the bridge image (see gameplay_bridge.py); CI runs the offline
unit tests instead. This is the end-to-end proof that the fast layer speaks the
exact action vocabulary the bridge accepts:

    python youtube-bot/tests/smoke_reflex_bridge.py
"""
import base64
import io
import sys
import tempfile
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay.skill_memory import SkillMemory  # noqa: E402
from gameplay_bridge import BrowserBridge, run_agent  # noqa: E402
from reflex_agent import ReflexAgent  # noqa: E402

HTML = '''<!doctype html><html><body style="margin:0;background:rgb(30,30,30)">
<button id="a" style="position:absolute;left:40px;top:40px;width:160px;height:60px">Open</button>
<button id="b" style="position:absolute;left:560px;top:480px;width:180px;height:70px">Craft</button>
<div id="mover" style="position:absolute;left:300px;top:250px;width:80px;height:80px;background:#c04040;
border-radius:40px"></div>
<script>
let x = 300;
window.addEventListener('keydown', e => { if (e.code === 'KeyW') { x += 6;
  document.getElementById('mover').style.left = x + 'px'; } });
window.addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') e.target.style.background = '#2060a0';
});
</script></body></html>'''


def brightness(observation):
    image = Image.open(io.BytesIO(base64.b64decode(observation['screenshot_png_base64'], validate=True)))
    return image.convert('L')


def main() -> int:
    with tempfile.TemporaryDirectory(prefix='reflex-bridge-') as temp:
        game = Path(temp) / 'game'
        game.mkdir(mode=0o755)
        (game / 'index.html').write_text(HTML, encoding='utf-8')
        memory = SkillMemory(Path(temp) / 'skills.sqlite3')
        agent = ReflexAgent('keyboard', memory=memory)
        with BrowserBridge(game, rights_acknowledged=True) as bridge:
            first = bridge.receive()
            assert first['type'] == 'observation', first
            # Hard guarantees from the bridge itself, no model involved.
            assert bridge.step({'keys': ['MetaLeft']})['type'] == 'error'
            assert bridge.step({'click': [900, 10]})['type'] == 'error'
            assert bridge.step({'look': [101, 0]})['type'] == 'error'
        result = run_agent(game, agent, rights_acknowledged=True, max_steps=24)
        assert result['status'] in ('agent_stopped', 'step_limit'), result
        assert result['uploaded'] is False, result
        summary = agent.stats.summary()
        assert summary['ticks'] > 0, summary
        assert summary['perception_p95_ms'] <= 300.0, summary
        assert summary['ticks_over_perception_budget'] == 0, summary
        assert summary['worst_think_ms'] <= 2000.0, summary
        assert summary['overlapped_ticks'] > 0, summary
        print('Reflex agent drove the real bridge; perception p95 '
              f"{summary['perception_p95_ms']} ms, worst think {summary['worst_think_ms']} ms, "
              f"sources {summary['sources']}")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
