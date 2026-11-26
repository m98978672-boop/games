"""Decide today's gameplay job before spending an hour on capture.

The gameplay pipeline is expensive: it starts a browser, loads a local model and
records a real session. This entry point answers two questions cheaply first:

1. Is a playthrough still open? A finished one publishes nothing, so no capture
   is started. This is the owner's rule made checkable instead of implicit.
2. If it is open, what does today's recording publish as - a Short or a full
   video - and at which Moscow time?

Nothing here captures, renders or uploads. It prints one `key=value` line per
answer so the workflow can gate on it, and exits non-zero only when the state is
unreadable, because guessing "open" would restart a finished game.
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from gameplay_policy import (PlaythroughState, assess_outcome, next_gameplay_slot,
                             plan_gameplay_day, posted_today_from_rows, states_from_rows)
from schedule_policy import CHANNEL_TZ


def _rows() -> list[dict]:
    """Read playthrough rows from the publisher.

    Absent history means "nothing recorded yet", which is an open playthrough:
    the first game has obviously not been finished. A *failed* read is
    different and must stop the job, because treating a finished playthrough as
    open would restart a game the AI already completed.
    """
    from publish_to_supabase import read_queue
    return read_queue()


def _state_for(rows: list[dict], game_id: str) -> tuple[PlaythroughState, bool]:
    """The named playthrough's state, plus whether it already posted today."""
    states = states_from_rows(rows)
    state = states.get(game_id, PlaythroughState(game_id))
    return state, posted_today_from_rows(rows, game_id, datetime.now(timezone.utc))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Decide whether today's gameplay video should be recorded.")
    parser.add_argument("--game", default="adventure", help="Which playthrough to check.")
    parser.add_argument("--recorded-seconds", type=float, default=None,
                        help="Length of an already recorded session, if any.")
    parser.add_argument("--outcome", choices=("playing", "exhausted", "viewer_hint"),
                        default=None, help="Outcome reported by the recorder, if any.")
    args = parser.parse_args(argv)

    try:
        rows = _rows()
    except Exception as exc:  # noqa: BLE001 - an unknown state must not guess
        print(f"::error::Не удалось прочитать состояние прохождений: {type(exc).__name__}. "
              "Ничего не записано и не загружено.", flush=True)
        return 1

    state, posted = _state_for(rows, args.game)
    if args.outcome:
        state = assess_outcome(state, args.outcome)

    decision = plan_gameplay_day(state, recorded_seconds=args.recorded_seconds,
                                 already_published_today=posted)
    local = decision.publish_at.astimezone(CHANNEL_TZ) if decision.publish_at else None
    print(f"playthrough_open={'true' if state.is_open else 'false'}", flush=True)
    print(f"publish={'true' if decision.publish else 'false'}", flush=True)
    print(f"video_kind={decision.video_kind or ''}", flush=True)
    print(f"publish_at={local:%Y-%m-%d %H:%M}" if local else "publish_at=", flush=True)
    print(f"reason={decision.reason}", flush=True)
    if not decision.publish:
        print("Игровое видео сегодня не выходит: " + decision.reason + ".", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
