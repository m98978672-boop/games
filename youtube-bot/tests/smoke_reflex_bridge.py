"""Drive the reflex agent through the real network-less Docker bridge.

Needs Docker and the bridge image (``youtube-bot/gameplay/Dockerfile``). The CI
job ``.github/workflows/reflex-live-smoke.yml`` runs exactly this file; locally
it is opt-in because it starts a container:

    python youtube-bot/tests/smoke_reflex_bridge.py [--report report.json]

Two passes are run: a step-synchronous one (``run_live``) and a real-time one
(``run_realtime``) where a deliberately slow stand-in advisor is asking for a
decision while movement keeps flowing, so the "no pause during inference" claim
is measured rather than asserted. The fixture game is deterministic: pressing W moves a red puck right, clicking
the "Craft" button turns it blue, clicking "Open" turns it green. The agent gets
no game-specific rules - only the input profile and the reflex layer. Success of
the *agent* is not asserted; what is asserted is the contract: legal actions,
perception inside 300 ms, decisions inside 2 s, and movement bursts sent while
the agent thinks.
"""
import argparse
import json
import sys
import tempfile
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay.realtime_loop import run_realtime, write_realtime_report  # noqa: E402
from gameplay.reflex_runner import run_live, write_report  # noqa: E402
from gameplay.skill_memory import SkillMemory  # noqa: E402
from gameplay_bridge import BrowserBridge  # noqa: E402
from reflex_agent import ReflexAgent  # noqa: E402

HTML = '''<!doctype html><html><body style="margin:0;background:#1c1f26">
<button data-action="open" style="position:absolute;left:40px;top:40px;width:160px;height:60px">Open</button>
<button data-action="craft" style="position:absolute;left:560px;top:470px;width:180px;height:70px">Craft</button>
<div id="puck" style="position:absolute;left:300px;top:250px;width:80px;height:80px;background:#c04040;
border-radius:40px"></div>
<script>
let x = 300, hue = '#c04040';
const puck = document.getElementById('puck');
window.addEventListener('keydown', e => {
  if (e.code === 'KeyW') { x = Math.min(720, x + 6); puck.style.left = x + 'px'; }
  if (e.code === 'KeyD') { puck.style.top = '250px'; }
});
document.querySelector('[data-action="open"]').addEventListener('click', () => {
  puck.style.background = '#2060a0';
});
document.querySelector('[data-action="craft"]').addEventListener('click', () => {
  puck.style.background = '#20a060';
});
</script></body></html>'''


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--report', type=Path, default=None)
    parser.add_argument('--steps', type=int, default=16)
    parser.add_argument('--advisor-delay', type=float, default=0.35,
                        help='seconds of deliberate thinking per tick in the real-time pass')
    args = parser.parse_args(argv)

    with tempfile.TemporaryDirectory(prefix='reflex-bridge-') as temp:
        game = Path(temp) / 'game'
        game.mkdir(mode=0o755)
        (game / 'index.html').write_text(HTML, encoding='utf-8')
        memory = SkillMemory(Path(temp) / 'skills.sqlite3')
        agent = ReflexAgent('keyboard', memory=memory)

        # Sanity: the hardened bridge itself refuses what it must refuse.
        with BrowserBridge(game, rights_acknowledged=True) as bridge:
            first = bridge.receive()
            assert first['type'] == 'observation', first
            assert bridge.step({'keys': ['MetaLeft']})['type'] == 'error'
            assert bridge.step({'click': [900, 10]})['type'] == 'error'
            assert bridge.step({'look': [101, 0]})['type'] == 'error'

        with BrowserBridge(game, rights_acknowledged=True) as bridge:
            report = run_live(bridge, agent, max_steps=args.steps)
        summary = report.summary()
        print('REFLEX_LIVE_REPORT=' + json.dumps(summary, ensure_ascii=True))
        print(f"::notice title=Reflex live bridge::{json.dumps(summary, ensure_ascii=True)}")

        assert report.steps > 0, summary
        assert not summary['errors'], summary
        assert summary['stopped_by'] == 'step_limit', summary
        assert summary['perception_max_ms'] <= 300.0, summary
        assert summary['decision_max_ms'] <= 2000.0, summary
        assert summary['bursts_sent'] > 0, summary
        # The UI may be unchanged frame to frame even though input arrived, so a
        # screen that never changes must not be counted as a learned success.
        for row in memory.dump():
            assert row['intent'] and 0 <= row['hits'] <= report.steps, row
        if args.report:
            write_report(report, args.report)
            print('report written to', args.report)

        # Second pass: real-time play with a slow advisor in a worker thread.
        class SlowAdvisorAgent(ReflexAgent):
            def __call__(self, png, step):
                time.sleep(args.advisor_delay)
                return super().__call__(png, step)

        slow = SlowAdvisorAgent('keyboard', memory=SkillMemory(Path(temp) / 'skills-live.sqlite3'))
        with BrowserBridge(game, rights_acknowledged=True) as bridge:
            live = run_realtime(bridge, slow, max_steps=args.steps, max_seconds=90)
        live_summary = live.summary()
        print('REFLEX_REALTIME_REPORT=' + json.dumps(live_summary, ensure_ascii=True))
        print(f"::notice title=Reflex real-time loop::{json.dumps(live_summary, ensure_ascii=True)}")
        assert live_summary['decisions'] > 0, live_summary
        assert not live_summary['errors'], live_summary
        assert live_summary['paused_during_inference'] is False, live_summary
        assert live_summary['actions_sent'] > live_summary['decisions'], \
            'input must continue while the decision is pending'
        assert live_summary['decision_p95_ms'] <= 2000.0, live_summary
        if args.report:
            write_realtime_report(live, Path(str(args.report).replace('.json', '-realtime.json')))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
