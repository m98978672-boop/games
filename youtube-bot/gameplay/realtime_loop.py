"""Real-time play loop: the model thinks in a worker thread, input never stops.

Until now the voxel experiment paused the game while Qwen inferred
(``voxel_timing.decide_with_game_paused``), which is honest but is not play. This
loop is the alternative that the reflex layer was built for:

* the bridge keeps receiving movement bursts (``ActionPacer``) every tick, so the
  avatar walks while the model is still thinking;
* the model runs in a single background worker on the latest frame; when its
  answer arrives within ``deadline_ms`` the intent switches, otherwise the
  previous intent keeps being played and the miss is counted, not hidden;
* only one inference is ever in flight, so a slow model cannot pile up work or
  starve the bridge;
* every action still passes ``validate_action`` and the bridge's own step
  counter; an out-of-order or rejected frame stops the loop with an error
  instead of silently continuing.

No game-specific knowledge and no state mutation: this module only decides *when*
to ask, never what the game means.
"""
from __future__ import annotations

import json
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from typing import Callable

from gameplay.input_profiles import validate_action
from gameplay.reflex_layer import DECISION_BUDGET_MS
from gameplay.reflex_runner import png_of


@dataclass
class RealtimeReport:
    rows: list[dict] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)
    stopped_by: str = "step_limit"
    wall_seconds: float = 0.0
    actions_sent: int = 0

    def summary(self) -> dict:
        latencies = sorted(r["decision_ms"] for r in self.rows if r["decision_ms"] is not None)
        p95 = latencies[max(0, min(len(latencies) - 1, int(len(latencies) * 0.95) - 1))] if latencies else None
        stalls = [r["gap_max_ms"] for r in self.rows if r["gap_max_ms"] is not None]
        return {
            "decisions": len(self.rows),
            "actions_sent": self.actions_sent,
            "wall_seconds": round(self.wall_seconds, 2),
            "input_rate_per_s": round(self.actions_sent / self.wall_seconds, 2) if self.wall_seconds else None,
            "decision_p95_ms": round(p95, 2) if p95 is not None else None,
            "decision_max_ms": round(latencies[-1], 2) if latencies else None,
            "deadline_misses": sum(1 for r in self.rows if r["missed_deadline"]),
            "intents": {name: sum(1 for r in self.rows if r["intent"] == name)
                        for name in sorted({r["intent"] for r in self.rows})},
            "worst_input_gap_ms": round(max(stalls), 2) if stalls else None,
            "stopped_by": self.stopped_by,
            "errors": self.errors,
            "paused_during_inference": False,
            "published": False,
        }


def run_realtime(bridge, agent, *, max_steps: int = 120, max_seconds: float = 60.0,
                 deadline_ms: float = DECISION_BUDGET_MS,
                 stop: Callable[[dict, object], bool] | None = None,
                 executor=None, clock: Callable[[], float] = time.monotonic) -> RealtimeReport:
    """Play continuously: bursts keep flowing while ``agent`` computes.

    ``agent`` must expose ``pacer``, ``profile`` and ``stats.ticks`` - that is
    ``reflex_agent.ReflexAgent``; tests pass a stub with the same surface.
    """
    report = RealtimeReport()
    started = clock()
    own_pool = executor is None
    pool = executor or ThreadPoolExecutor(max_workers=1)
    observation = bridge.receive()
    expected = observation.get("step")
    if not isinstance(expected, int):
        report.stopped_by = "invalid_frame"
        report.errors.append("bridge did not report a step number")
        if own_pool:
            pool.shutdown(wait=False)
        return report

    def send(action: dict) -> dict:
        nonlocal expected
        validate_action(action)
        result = bridge.step(action)
        expected += 1
        report.actions_sent += 1
        if result.get("type") != "observation" or result.get("step") != expected:
            raise RuntimeError(f"bridge error or out-of-order frame: {str(result.get('error'))[:80]}")
        return result

    intent = getattr(agent, "_intent", None) or agent.controller.default_intent
    bursts: list[dict] = []
    inflight = None
    submitted_at = 0.0
    tick_index = 0
    gap_started = clock()

    try:
        while len(report.rows) < max_steps and clock() - started < max_seconds:
            if not bursts:
                bursts = agent.pacer.window(intent)
            burst = bursts.pop(0)
            try:
                observation = send(burst)
            except RuntimeError as error:
                report.stopped_by = "bridge_error"
                report.errors.append(str(error)[:120])
                break
            gap = (clock() - gap_started) * 1000.0
            gap_started = clock()

            # Ask the model once, on the freshest frame, only if nothing else runs.
            if inflight is None:
                try:
                    inflight = pool.submit(agent, png_of(observation), tick_index)
                    submitted_at = clock()
                except RuntimeError as error:
                    report.stopped_by = "frame_error"
                    report.errors.append(str(error)[:120])
                    break

            decision_ms = None
            missed = False
            if inflight is not None and inflight.done():
                try:
                    inflight.result()
                except Exception as error:  # the agent guarantees validity; this is a bug path
                    report.stopped_by = "agent_error"
                    report.errors.append(str(error)[:120])
                    inflight = None
                    break
                decision_ms = (clock() - submitted_at) * 1000.0
                missed = decision_ms > deadline_ms
                last = agent.stats.ticks[-1]
                intent = last.intent
                bursts = []  # a fresh window for the new intent, aimed at the new target
                report.rows.append({
                    "tick": tick_index,
                    "intent": last.intent,
                    "source": last.source,
                    "decision_ms": round(decision_ms, 2),
                    "missed_deadline": missed,
                    "perception_ms": round(last.perception_ms, 2),
                    "actions_sent_so_far": report.actions_sent,
                    "gap_max_ms": round(gap, 2),
                    "bridge_step": observation.get("step"),
                })
                agent.observe_frame_timing(observation, tick=last)
                inflight = None
                tick_index += 1
                if stop is not None and stop(observation, agent):
                    report.stopped_by = "stop_condition"
                    break
            elif inflight is not None and (clock() - submitted_at) * 1000.0 > deadline_ms * 4:
                # The model is far beyond any usable deadline: keep playing, but
                # do not let it block new decisions forever.
                report.rows.append({
                    "tick": tick_index, "intent": intent, "source": "fallback",
                    "decision_ms": None, "missed_deadline": True, "perception_ms": None,
                    "actions_sent_so_far": report.actions_sent, "gap_max_ms": round(gap, 2),
                    "bridge_step": observation.get("step"),
                })
                inflight.cancel()
                inflight = None
                tick_index += 1
        # Keep an explicit reason (stop condition, bridge error); only the
        # implicit "ran out" case is labelled here.
        if report.stopped_by == "step_limit" and clock() - started >= max_seconds:
            report.stopped_by = "wall_clock"
    finally:
        report.wall_seconds = clock() - started
        if own_pool:
            pool.shutdown(wait=False, cancel_futures=True)
    return report


def write_realtime_report(report: RealtimeReport, destination) -> Path:
    destination = Path(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps({"summary": report.summary(), "rows": report.rows},
                                      ensure_ascii=False, indent=1), encoding="utf-8")
    return destination
