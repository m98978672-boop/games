"""Keep the avatar moving while the reflex layer thinks.

The bridge is strictly request/response: one action, then one screenshot. A slow
advisor therefore stalls the *game input* for as long as it runs. The pacer fixes
the part that is actually under our control:

* every intent is expanded into a short burst of bridge actions whose durations
  add up to a fixed wall-clock window (``cadence_ms``), so input is continuous;
* a tick's decision may be up to ``DECISION_BUDGET_MS`` late without input
  stopping, because the remaining bursts of the current window are still being
  sent;
* if the reflex layer produces a different intent the next burst switches at
  once, so reacting to a change is not delayed by the whole window;
* if the adapter reports a missed window (``late``) or a stalled frame
  (``browser_frame_timing.stalled_ms`` above the budget) the cadence is shortened
  down to ``min_cadence_ms`` — measured, not assumed.

Everything here is local logic over the bridge vocabulary; it never invents keys.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable

from gameplay.input_profiles import InputProfile, validate_action
from gameplay.reflex_layer import Tick

CADENCE_MS = 1000
MIN_CADENCE_MS = 250
MAX_BURSTS = 4


@dataclass
class PaceStats:
    windows: int = 0
    late_windows: int = 0
    stalls: int = 0
    bursts: int = 0
    switches: int = 0
    gaps_ms: list[float] = field(default_factory=list)

    def summary(self) -> dict:
        gaps = sorted(self.gaps_ms)
        return {"windows": self.windows, "late_windows": self.late_windows,
                "stalls": self.stalls, "bursts": self.bursts,
                "intent_switches_during_window": self.switches,
                "gap_p50_ms": round(gaps[len(gaps) // 2], 2) if gaps else None,
                "gap_max_ms": round(gaps[-1], 2) if gaps else None}


class ActionPacer:
    """Expands intents into bridge actions covering a fixed cadence window."""

    def __init__(self, profile: InputProfile, *, cadence_ms: int = CADENCE_MS,
                 min_cadence_ms: int = MIN_CADENCE_MS,
                 clock: Callable[[], float] | None = None):
        import time
        if not MIN_CADENCE_MS <= min_cadence_ms <= cadence_ms <= 4000:
            raise ValueError("cadence must be between min_cadence_ms and 4000")
        self.profile = profile
        self.cadence_ms = int(cadence_ms)
        self.min_cadence_ms = int(min_cadence_ms)
        self.clock = clock or time.monotonic
        self.cadence = self.cadence_ms
        self.stats = PaceStats()
        self._window_started = 0.0

    def reset_session(self) -> None:
        self.cadence = self.cadence_ms
        self.stats = PaceStats()
        self._window_started = 0.0

    # -- planning --------------------------------------------------------
    def split(self, action: dict, *, remaining_ms: int | None = None) -> list[dict]:
        """Split one bridge action into bursts that stay legal for the bridge."""
        validate_action(action)
        budget = self.cadence if remaining_ms is None else int(remaining_ms)
        busy = action.get("hold_ms") or action.get("duration_ms") or 250
        if busy >= budget or budget <= 0:
            return [action]
        bursts = max(1, min(MAX_BURSTS, budget // busy))
        out = []
        for _ in range(bursts):
            burst = dict(action)
            burst["duration_ms"] = int(busy)
            out.append(validate_action(burst))
        return out

    def window(self, intent: str, *, target=None, started: float | None = None) -> list[dict]:
        """One cadence window of actions for ``intent``."""
        action = self.profile.action(intent, target=target)
        self._window_started = self.clock() if started is None else started
        bursts = self.split(action)
        self.stats.windows += 1
        self.stats.bursts += len(bursts)
        return bursts

    # -- feedback --------------------------------------------------------
    def observe(self, observation: dict | None, *, tick: Tick | None = None) -> dict:
        """Adapt the cadence to what the browser and the decision actually did."""
        late = False
        stalled = 0.0
        if isinstance(observation, dict):
            timing = observation.get("browser_frame_timing") or {}
            if isinstance(timing, dict) and isinstance(timing.get("stalled_ms"), (int, float)):
                stalled = float(timing["stalled_ms"])
                if stalled > self.cadence:
                    self.stats.stalls += 1
                    self.cadence = max(self.min_cadence_ms, self.cadence // 2)
        if tick is not None:
            if tick.decision_ms > self.cadence:
                late = True
                self.stats.late_windows += 1
                self.cadence = max(self.min_cadence_ms, self.cadence // 2)
            elif tick.decision_ms < self.cadence // 3:
                # There is headroom again: grow back slowly, never above nominal.
                self.cadence = min(self.cadence_ms, self.cadence + 100)
            elapsed = (self.clock() - self._window_started) * 1000.0
            if elapsed >= 0:
                self.stats.gaps_ms.append(round(elapsed, 2))
        return {"cadence_ms": self.cadence, "late": late, "stalled_ms": stalled}