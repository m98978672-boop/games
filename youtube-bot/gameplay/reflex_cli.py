"""Operator-facing entry point for the reflex layer.

    python -m gameplay.reflex_cli bench            # speed of perception on this host
    python -m gameplay.reflex_cli live             # real bridge: step-sync + real-time pass
    python -m gameplay.reflex_cli skills           # what the agent has learned
    python -m gameplay.reflex_cli forget --all     # wipe the skill table
    python -m gameplay.reflex_cli import FILE      # merge a snapshot from a run
    python -m gameplay.reflex_cli profiles         # declared control schemes
    python -m gameplay.reflex_cli budget           # the timing contract
    python -m gameplay.reflex_cli model            # the learned screen graph
    python -m gameplay.reflex_cli plan --game ... --author ... --minutes 90
                                                   # plan a stream ahead of time
    python -m gameplay.reflex_cli stream --game ... --author ... --minutes 30 --out DIR
                                                   # run the plan, write report + SRT

Everything writes plain JSON to stdout and never touches the network. The
commands are read-only except ``forget`` and ``import``, which only modify the
local skill database given by ``--db`` (default ``data/reflex-skills.sqlite3``).
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from gameplay.input_profiles import PROFILES, profile_from_name  # noqa: E402
from gameplay.reflex_layer import DECISION_BUDGET_MS, PERCEPTION_BUDGET_MS  # noqa: E402
from gameplay.skill_memory import SkillMemory  # noqa: E402

DEFAULT_DB = Path(__file__).resolve().parent.parent / "data" / "reflex-skills.sqlite3"


def _emit(payload: dict) -> None:
    print(json.dumps(payload, ensure_ascii=False, indent=1))


def cmd_bench(args) -> int:
    from gameplay.benchmark_reflex import measure
    result = measure(args.frames)
    result['ok'] = result['perceive']['p95_ms'] <= result['budget_ms']
    _emit(result)
    return 0 if result['ok'] else 1


def cmd_skills(args) -> int:
    memory = SkillMemory(args.db)
    rows = memory.dump()
    _emit({"database": str(args.db), "rows": len(rows),
           "top": rows[:args.limit]})
    return 0


def cmd_forget(args) -> int:
    if not args.all and not args.signature:
        _emit({"error": "use --all or --signature <hex>"})
        return 2
    memory = SkillMemory(args.db)
    try:
        deleted = memory.forget(None if args.all else args.signature)
    except ValueError as error:
        _emit({"error": str(error)})
        return 2
    _emit({"deleted_rows": deleted, "scope": "all" if args.all else args.signature})
    return 0


def cmd_import(args) -> int:
    memory = SkillMemory(args.db)
    merged = memory.load_json(args.file)
    _emit({"merged_rows": merged, "database": str(args.db)})
    return 0 if merged else 1


def cmd_profiles(_args) -> int:
    _emit({name: sorted(factory().intents()) for name, factory in PROFILES.items()})
    return 0


def cmd_live(args) -> int:
    """Play the synthetic fixture through the real Docker bridge (needs Docker)."""
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tests"))
    from smoke_reflex_bridge import main as live_main
    argv = ['--steps', str(args.steps)]
    if args.report:
        argv += ['--report', str(args.report)]
    argv += ['--advisor-delay', str(args.advisor_delay)]
    try:
        return live_main(argv)
    except RuntimeError as error:
        # Docker missing or the bridge refusing to start: report, never fake a run.
        _emit({"error": str(error)[:200], "docker_required": True, "published": False})
        return 1


def cmd_model(args) -> int:
    """Show what the agent has learned about the game's screen graph."""
    from gameplay.world_model import WorldModel
    path = args.db.with_suffix('.world.json')
    model = WorldModel(path)
    _emit({"model": str(path), **model.stats()})
    return 0


def datetime_iso(value: str):
    """Parse an ISO-8601 timestamp; a missing timezone is a mistake, not a guess."""
    from datetime import datetime

    text = value.strip().replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError as error:
        from argparse import ArgumentTypeError
        raise ArgumentTypeError(f"invalid ISO-8601 time: {value}") from error
    if parsed.tzinfo is None:
        from argparse import ArgumentTypeError
        raise ArgumentTypeError("start time needs a timezone, e.g. 2026-11-24T18:00Z")
    return parsed


def cmd_plan(args) -> int:
    """Plan a stream ahead of time: run of show, chapters, checks, talk track."""
    from datetime import datetime, timezone

    from stream_plan import PlanError, build_plan, issues, render_markdown

    start = args.start or datetime.now(timezone.utc).replace(second=0, microsecond=0)
    try:
        plan = build_plan(game=args.game, author=args.author, start=start,
                          minutes=args.minutes, sources=tuple(args.source or ()),
                          on_air_title=args.title)
    except PlanError as error:
        _emit({"error": str(error)})
        return 2
    problems = issues(plan)
    if args.out:
        plan.save(args.out)
    if args.markdown:
        _emit({"markdown": render_markdown(plan), "problems": problems,
               "saved": str(args.out) if args.out else None})
        return 0 if not problems else 1
    _emit({**plan.as_dict(), "problems": problems})
    return 0 if not problems else 1


def cmd_stream(args) -> int:
    """Run a planned stream against measured frames and write reviewable artifacts.

    No broadcast: frames come from a synthetic fixture or a saved recording, and the
    output is report.json + captions.srt + recap.md in ``--out``.
    """
    from datetime import datetime, timezone

    from stream_plan import PlanError, build_plan, issues
    from stream_run import Frame, check_against_contract, run_stream, write_artifacts

    start = args.start or datetime.now(timezone.utc).replace(second=0, microsecond=0)
    try:
        plan = build_plan(game=args.game, author=args.author, start=start,
                          minutes=args.minutes, kinds=tuple(args.kind or ()) or None)
    except PlanError as error:
        _emit({"error": str(error)})
        return 2
    problems = issues(plan)
    if problems:
        _emit({"error": "plan is not coherent", "problems": problems})
        return 2

    frames = synthetic_frames(minutes=args.minutes, every=args.every)
    chat = [(float(item[0]), item[1]) for item in (args.chat or [])]
    report = run_stream(plan, frames, chat=chat)
    paths = write_artifacts(report, args.out) if args.out else {}
    run_problems = check_against_contract(report, min_seconds=args.min_seconds)
    _emit({"summary": report.summary(), "director": report.director.stats.summary(),
           "artifacts": paths, "problems": run_problems})
    return 0 if not run_problems else 1


def synthetic_frames(*, minutes: float, every: float = 10.0):
    """Deterministic stand-in frames, so the loop is testable without a game."""
    from stream_run import Frame

    class FakePerception:
        def __init__(self, targets: int, changed: bool):
            self.targets = [object() for _ in range(targets)]
            self.changed = changed
            self.change_ratio = 0.2 if changed else 0.0

    total = int(minutes * 60)
    step = max(0.5, float(every))
    count = int(total / step)
    frames = []
    for index in range(count):
        offset = index * step
        targets = 1 + (index % 3)
        frames.append(Frame(offset, FakePerception(targets, index % 2 == 0)))
    return frames


def cmd_budget(_args) -> int:
    _emit({"perception_budget_ms": PERCEPTION_BUDGET_MS,
           "decision_budget_ms": DECISION_BUDGET_MS,
           "notes": ["perception degrades (skips target search) before it overruns",
                     "a slow advisor is dropped, never waited on",
                     "actions are sent before the next frame is analysed"]})
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="gameplay.reflex_cli", description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--db', type=Path, default=DEFAULT_DB)
    sub = parser.add_subparsers(dest='command', required=True)
    bench = sub.add_parser('bench', help='time perception on this machine')
    bench.add_argument('frames', nargs='?', type=int, default=60)
    bench.set_defaults(func=cmd_bench)
    skills = sub.add_parser('skills', help='show learned screen -> intent rows')
    skills.add_argument('--limit', type=int, default=20)
    skills.set_defaults(func=cmd_skills)
    forget = sub.add_parser('forget', help='delete learned rows')
    forget.add_argument('--all', action='store_true')
    forget.add_argument('--signature', default=None)
    forget.set_defaults(func=cmd_forget)
    imp = sub.add_parser('import', help='merge an exported JSON snapshot')
    imp.add_argument('file', type=Path)
    imp.set_defaults(func=cmd_import)
    sub.add_parser('profiles', help='list control schemes').set_defaults(func=cmd_profiles)
    sub.add_parser('model', help='what the world model has learned').set_defaults(func=cmd_model)
    sub.add_parser('budget', help='show the timing contract').set_defaults(func=cmd_budget)
    plan = sub.add_parser('plan', help='plan a stream ahead: run of show and talk track')
    plan.add_argument('--game', required=True)
    plan.add_argument('--author', required=True, help='owner/source of the game, as verified')
    plan.add_argument('--minutes', type=float, default=60.0)
    plan.add_argument('--start', type=datetime_iso, default=None,
                      help='start time with a timezone, e.g. 2026-11-24T18:00Z')
    plan.add_argument('--source', action='append', default=[],
                      help='exact https source link on an allowlisted host')
    plan.add_argument('--title', default=None, help='on-air title')
    plan.add_argument('--out', type=Path, default=None, help='save the plan as JSON')
    plan.add_argument('--markdown', action='store_true', help='print a readable run of show')
    plan.set_defaults(func=cmd_plan)
    stream = sub.add_parser('stream', help='run a planned stream and write report + captions')
    stream.add_argument('--game', required=True)
    stream.add_argument('--author', required=True)
    stream.add_argument('--minutes', type=float, default=30.0)
    stream.add_argument('--start', type=datetime_iso, default=None)
    stream.add_argument('--kind', action='append', default=[],
                        help='segment kind, repeatable (intro, gameplay, probe, review, chat, wrap)')
    stream.add_argument('--every', type=float, default=10.0, help='seconds between measured frames')
    stream.add_argument('--chat', action='append', nargs=2, metavar=('OFFSET', 'MESSAGE'),
                        default=[], help='chat message and the second it arrives')
    stream.add_argument('--min-seconds', type=float, default=60.0,
                        help='shortest honest stream length to report success')
    stream.add_argument('--out', type=Path, default=None,
                        help='write report.json, captions.srt and recap.md here')
    stream.set_defaults(func=cmd_stream)
    live = sub.add_parser('live', help='play a synthetic game through the Docker bridge '
                                       '(step-sync + real-time pass)')
    live.add_argument('--steps', type=int, default=16)
    live.add_argument('--report', type=Path, default=None)
    live.add_argument('--advisor-delay', type=float, default=0.35,
                      help='seconds of simulated thinking per tick in the real-time pass')
    live.set_defaults(func=cmd_live)
    args = parser.parse_args(argv)
    if args.command == 'bench' and not 1 <= args.frames <= 2000:
        parser.error('frames must be 1..2000')
    if args.command == 'live' and not 1 <= args.steps <= 200:
        parser.error('steps must be 1..200')
    if args.command == 'live' and not 0 <= args.advisor_delay <= 5:
        parser.error('advisor delay must be 0..5 seconds')
    if args.command == 'plan' and not 5 <= args.minutes <= 480:
        parser.error('minutes must be 5..480')
    if args.command == 'stream':
        if not 5 <= args.minutes <= 480:
            parser.error('minutes must be 5..480')
        if not 0.5 <= args.every <= 120:
            parser.error('every must be 0.5..120 seconds')
        if len(args.chat) > 200:
            parser.error('at most 200 chat messages')
    return args.func(args)


if __name__ == '__main__':
    raise SystemExit(main())
