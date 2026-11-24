"""Wire the reflex layer into ``run_agent`` from ``gameplay_bridge``.

The vision-language model (``gameplay_qwen``) stays the slow advisor: it is
consulted only when reflex memory has never seen the screen, and only if a probe
says it can answer inside the decision budget. Otherwise the reflex decision is
used, so the avatar is never frozen waiting for a model that would overrun
``DECISION_BUDGET_MS``.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable  # noqa: F401  (kept for the public signature)

import time

from gameplay.input_profiles import InputProfile, profile_from_name
from gameplay_qwen import ACTIONS
from gameplay_qwen_advisor import SlowAdvisor
from gameplay.reflex_layer import (DECISION_BUDGET_MS, PERCEPTION_BUDGET_MS, Decision,
                                   Perception, ReflexController, Tick, step_latencies,
                                   summarise)

MAX_STEP_SECONDS = 2.0


@dataclass
class ReflexAgentStats:
    ticks: list = field(default_factory=list)
    advisor_calls: int = 0
    advisor_skipped_for_budget: int = 0

    def summary(self) -> dict:
        data = summarise(self.ticks)
        data.update(step_latencies(self.ticks))
        data["advisor_calls"] = self.advisor_calls
        data["advisor_skipped_for_budget"] = self.advisor_skipped_for_budget
        return data


class ReflexAgent:
    """``agent(png, step) -> action`` compatible with ``run_agent``.

    Because the bridge protocol is request/response, the game executes our action
    *after* we return, so we never see the next frame mid-action: ``overlap_ms``
    reports only what truly overlapped (a previous action window that was still
    open when this frame arrived), rather than pretending a pipeline the bridge
    does not offer. A step slower than ``MAX_STEP_SECONDS`` raises, so a stuck
    model cannot silently stall a recording.
    """

    def __init__(self, profile: str | InputProfile = "keyboard", *, memory=None,
                 advisor: Callable[[Perception, int], str | None] | None = None,
                 advisor_budget_ms: float = 1400.0,
                 controller: ReflexController | None = None):
        self.profile = profile_from_name(profile) if isinstance(profile, str) else profile
        self.controller = controller or ReflexController(default_intent=self._default_intent())
        self.advisor = advisor
        self.advisor_budget_ms = min(advisor_budget_ms, DECISION_BUDGET_MS)
        self.stats = ReflexAgentStats()
        self._action_window_ends = 0.0
        if memory is not None:
            self.controller.memory = memory

    def _default_intent(self) -> str:
        intents = self.profile.intents()
        for candidate in ("EXPLORE", "FORWARD", "UP"):
            if candidate in intents:
                return candidate
        return intents[0]

    def _guarded_advisor(self, perception: Perception, step: int) -> str | None:
        """Call the slow model only inside its own budget; never block the tick."""
        if self.advisor is None:
            return None
        self.stats.advisor_calls += 1
        started = time.monotonic()
        try:
            proposal = self.advisor(perception, step)
        except Exception:
            return None
        elapsed_ms = (time.monotonic() - started) * 1000.0
        if elapsed_ms > self.advisor_budget_ms or proposal not in self.profile.intents():
            self.stats.advisor_skipped_for_budget += 1
            return None
        return proposal

    def __call__(self, png: bytes, step: int) -> dict:
        tick_started = time.monotonic()
        action_window_ends = self._action_window_ends
        perception = self.controller.observe(png)
        perception_ended = time.monotonic()
        # The advisor sees the cheap perception summary; screen content stays
        # untrusted and the model's answer is filtered against the profile.
        decision: Decision = self.controller.decide(
            perception, step, advisor=self._guarded_advisor if self.advisor else None)
        action = self.profile.action(decision.intent, target=decision.target)
        busy_ms = action.get("hold_ms") or action.get("duration_ms") or 250
        self._action_window_ends = time.monotonic() + busy_ms / 1000.0
        overlap_ms = max(0.0, action_window_ends - (perception_ended - perception.elapsed_ms / 1000.0))
        self.stats.ticks.append(Tick(
            step=step, perception_ms=perception.elapsed_ms, decision_ms=decision.latency_ms,
            intent=decision.intent, action=action, source=decision.source,
            overlap_ms=round(overlap_ms * 1000.0, 2),
            perception_started_before_action_finished=overlap_ms > 0))
        elapsed = time.monotonic() - tick_started
        if elapsed > MAX_STEP_SECONDS:
            raise RuntimeError(f"step {step} took {elapsed:.2f}s, above {MAX_STEP_SECONDS}s")
        return action


def build_agent(profile: str = "keyboard", *, objective: str, game: str = "",
                allowed: tuple[str, ...] | None = None, help_desk=None,
                memory=None, generator=None, use_advisor: bool = True) -> ReflexAgent:
    """Assemble the full brain: reflex layer + optional slow Qwen advisor."""
    resolved = profile_from_name(profile) if isinstance(profile, str) else profile
    advisor_allowed = allowed or tuple(
        intent for intent in resolved.intents() if intent in ACTIONS) or ("FORWARD",)
    advisor = None
    if use_advisor:
        advisor = SlowAdvisor(objective, advisor_allowed, generator=generator,
                             help_desk=help_desk, game=game)
    return ReflexAgent(resolved, memory=memory, advisor=advisor)


def describe_budget() -> dict:
    return {"perception_budget_ms": PERCEPTION_BUDGET_MS,
            "decision_budget_ms": DECISION_BUDGET_MS,
            "max_step_seconds": MAX_STEP_SECONDS}
