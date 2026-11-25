"""Opt-in Docker smoke: actual agent, two recordings, persistent playbook and montage.

A synthetic game is used; neither real gameplay competence nor frame-accurate
video timing is asserted. Requires the freshly built bridge image and ffmpeg.
"""
import json
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay.playbook import Goal
from gameplay_bridge import run_agent
from montage import events_from_report_file, plan_montage, probe_duration, render_montage
from reflex_agent import build_agent
from smoke_reflex_bridge import HTML


def main():
    with tempfile.TemporaryDirectory(prefix='recorded-playbook-') as temp:
        root = Path(temp)
        game = root / 'game'
        game.mkdir()
        (game / 'index.html').write_text(HTML, encoding='utf-8')
        book_path = root / 'playbook.json'
        # This predicate deliberately means only that a frame was observed.
        goal = Goal('fixture: an observed frame')
        old_tries = 0
        for index in range(2):
            recording = root / f'record-{index}'
            recording.mkdir()
            agent = build_agent(objective='fixture', use_advisor=False,
                                playbook_goal=goal, playbook_path=book_path)
            if index:
                assert sum(edge.tries for edge in agent.playbook.edges.values()) == old_tries
            result = run_agent(game, agent, rights_acknowledged=True,
                               max_steps=8, record_dir=recording)
            old_tries = sum(edge.tries for edge in agent.playbook.edges.values())
            assert old_tries > 0
            report = json.loads(Path(result['report']).read_text(encoding='utf-8'))
            assert len(report['events']) == 8 and all(e['kind'] == 'goal' for e in report['events'])
            times = [e['seconds'] for e in report['events']]
            assert times == sorted(times) and max(times) > min(times)
            duration = probe_duration(Path(result['video']))
            events = events_from_report_file(Path(result['report']))
            plan = plan_montage(duration, events, target_seconds=5)
            output = render_montage(Path(result['video']), plan, recording / 'short.mp4', preset='ultrafast')
            assert Path(output['output']).is_file()
            assert Path(output['report']).is_file()
            assert not output['published']
            print(f'RECORDED_PLAYBOOK session={index + 1} steps={result["steps"]} '
                  f'events={len(events)} video_seconds={duration:.2f} tries={old_tries}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
