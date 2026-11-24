"""Run the reflex agent against the real browser bridge and record honest timings.

The bridge protocol is one action per screenshot, so *movement while thinking*
has to be scheduled rather than pipelined: after each decision the agent hands
back the rest of its current cadence window (``ReflexAgent.take_bursts``), and
those bursts are pushed to the bridge before the next frame is analysed. This
adapter does exactly that and records, per tick:

* ``perception_ms`` / ``decision_ms`` from the agent (budgets 300 / 2000 ms);
* ``bridge_screenshot_ms`` and ``browser_frame_timing`` (the game's own frame
  health - not something this layer can improve);
* ``sent_bursts`` - how many actions kept the avatar moving during the think.

No model is required: pass an ``advisor`` to add the slow Qwen layer, otherwise
memory + reflex drive the game. Nothing is uploaded or trained.
"""
from __future__ import annotations

import base64
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable

from gameplay.input_profiles import validate_action
from gameplay.reflex_layer import DECISION_BUDGET_MS, PERCEPTION_BUDGET_MS
from reflex_agent import ReflexAgent


@dataclass
class LiveReport:
    steps: int = 0
    rows: list[dict] = field(default_factory=list)
    stopped_by: str = "step_limit"
    errors: list[str] = field(default_factory=list)

    def summary(self) -> dict:
        perceptions = [r["perception_ms"] for r in self.rows]
        decisions = [r["decision_ms"] for r in self.rows]
        screenshots = [r["bridge_screenshot_ms"] for r in self.rows if r["bridge_screenshot_ms"] is not None]
        p95 = lambda xs: sorted(xs)[max(0, min(len(xs) - 1, int(len(xs) * 0.95) - 1))] if xs else None
        return {
            "steps": self.steps,
            "stopped_by": self.stopped_by,
            "perception_p95_ms": round(p95(perceptions), 2) if perceptions else None,
            "perception_max_ms": round(max(perceptions), 2) if perceptions else None,
            "decision_p95_ms": round(p95(decisions), 2) if decisions else None,
            "decision_max_ms": round(max(decisions), 2) if decisions else None,
            "bridge_screenshot_p95_ms": round(p95(screenshots), 2) if screenshots else None,
            "bursts_sent": sum(r["sent_bursts"] for r in self.rows),
            "ticks_with_bursts": sum(1 for r in self.rows if r["sent_bursts"]),
            "budgets": {"perception_ms": PERCEPTION_BUDGET_MS,
                        "decision_ms": DECISION_BUDGET_MS},
            "errors": self.errors,
            "published": False,
        }


def png_of(observation: dict) -> bytes:
    if not isinstance(observation, dict) or observation.get("type") != "observation":
        raise RuntimeError("bridge did not return an observation")
    return base64.b64decode(observation["screenshot_png_base64"], validate=True)


def run_live(bridge, agent: ReflexAgent, *, max_steps: int = 24,
             stop: Callable[[dict, object], bool] | None = None) -> LiveReport:
    """Drive ``bridge`` with ``agent`` until the step limit or ``stop`` fires.

    The bridge numbers *every* request (bursts included), so ordering is checked
    against its own counter, not against the agent's tick index: a skipped or
    replayed frame is an error, an extra burst is not.
    """
    report = LiveReport()
    observation = bridge.receive()
    expected = observation.get("step")
    if not isinstance(expected, int):
        report.stopped_by = "invalid_frame"
        report.errors.append("bridge did not report a step number")
        return report

    def send(action: dict) -> dict:
        nonlocal expected
        validate_action(action)
        result = bridge.step(action)
        expected += 1
        if result.get("type") != "observation" or result.get("step") != expected:
            raise RuntimeError(f"bridge returned an error or out-of-order frame: "
                               f"{str(result.get('error'))[:80]}")
        return result

    for step in range(max_steps):
        try:
            tick = agent(png_of(observation), step)
            sent = 0
            # 1) the movement of this window goes out first ...
            for burst in agent.take_bursts():
                observation = send(burst)
                sent += 1
            # 2) ... then the action this tick decided, and the next frame arrives.
            observation = send(tick)
            sent += 1
        except RuntimeError as error:
            report.stopped_by = "bridge_error"
            report.errors.append(str(error)[:120])
            break
        timing = agent.observe_frame_timing(observation)
        last = agent.stats.ticks[-1]
        report.rows.append({
            "step": step,
            "bridge_step": observation.get("step"),
            "intent": last.intent,
            "source": last.source,
            "action": tick,
            "sent_bursts": sent,
            "perception_ms": round(last.perception_ms, 2),
            "decision_ms": round(last.decision_ms, 2),
            "bridge_screenshot_ms": observation.get("screenshot_ms"),
            "browser_frame_timing": observation.get("browser_frame_timing"),
            "cadence_ms": timing["cadence_ms"],
        })
        report.steps = step + 1
        if stop is not None and stop(observation, agent):
            report.stopped_by = "stop_condition"
            break
    return report


def write_report(report: LiveReport, destination: Path) -> Path:
    destination = Path(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps({"summary": report.summary(), "rows": report.rows},
                                      ensure_ascii=False, indent=1), encoding="utf-8")
    return destination
