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
import math

from gameplay.action_pacer import ActionPacer
from gameplay.input_profiles import InputProfile, profile_from_name
from gameplay.playbook import Playbook
from gameplay.screen_recognizer import classify, preferred_intents
from gameplay.tracker import Tracker, describe as describe_tracks
from gameplay.world_model import WorldModel
from stream_director import Director
from gameplay_qwen import ACTIONS
from gameplay_qwen_advisor import SlowAdvisor
from gameplay.reflex_layer import (DECISION_BUDGET_MS, PERCEPTION_BUDGET_MS, Decision,
                                   Perception, ReflexController, Tick, step_latencies,
                                   summarise)

MAX_STEP_SECONDS = 2.0
MAX_PACED_BURSTS = 4


@dataclass
class ReflexAgentStats:
    ticks: list = field(default_factory=list)
    # Measured highlights, in the words the montage understands. Only events the
    # agent actually observed are added: a reached goal, a frame that changed.
    events: list = field(default_factory=list)
    advisor_calls: int = 0
    advisor_skipped_for_budget: int = 0
    screen: str | None = None
    tracks: list = field(default_factory=list)
    line: str | None = None
    said: int = 0

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
                 controller: ReflexController | None = None,
                 pacer: "ActionPacer | None" = None,
                 world_model: WorldModel | None = None,
                 tracker: Tracker | None = None,
                 director: "Director | None" = None,
                 playbook: Playbook | None = None,
                 cadence_seconds: float = 1.0):
        self.profile = profile_from_name(profile) if isinstance(profile, str) else profile
        self.controller = controller or ReflexController(
            default_intent=self._default_intent(),
            interactive=bool(getattr(self.profile, "screen_intents", frozenset())))
        self.advisor = advisor
        self.advisor_budget_ms = min(advisor_budget_ms, DECISION_BUDGET_MS)
        self.stats = ReflexAgentStats()
        self._action_window_ends = 0.0
        self.pacer = pacer if pacer is not None else ActionPacer(self.profile)
        # Planning and perception extensions. Both are optional and local: with
        # them the agent explores and aims, without them it still walks.
        self.world_model = world_model
        self.tracker = tracker if tracker is not None else Tracker()
        # With a stream plan the agent also decides what to say; without one it
        # only plays, so nothing changes for the existing autopilot.
        self.director = director
        # Scoring what actually paid off on each screen: this is what makes the
        # bot play *better*, not just faster. Optional, so old callers are intact.
        self.playbook = playbook
        # How many seconds one step of this agent stands for. Frames are the only
        # clock a recording offers, so offsets come from the step number and this.
        self.cadence_seconds = float(cadence_seconds)
        if not math.isfinite(self.cadence_seconds) or self.cadence_seconds <= 0:
            raise ValueError("cadence_seconds must be finite and positive")
        self._recording_offset = None
        self.tracks: list = []
        self.screen = None
        self.pending_bursts: list[dict] = []
        self._intent: str | None = None
        self._last_perception: Perception | None = None
        self._last_decision: Decision | None = None
        self.windows = 0
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

    def _next_window(self, decision) -> list[dict]:
        """Plan the next cadence window; click intents are aimed at the target.

        A click profile (virtual joystick) must re-aim every burst at the button
        the perception layer just found, because a stale window would keep
        clicking a control that has moved. Key and look intents are steady, so
        their window is reused until it runs out.
        """
        target = decision.target
        if getattr(self.profile, "screen_intents", frozenset()) and target is not None:
            bursts = self.pacer.split(self.profile.action(decision.intent, target=target))
            self.pacer.stats.windows += 1
            self.pacer.stats.bursts += len(bursts)
            self.windows += 1
            return bursts
        self.windows += 1
        return self.pacer.window(decision.intent, target=target)

    def take_bursts(self, limit: int = MAX_PACED_BURSTS) -> list[dict]:
        """Hand back the remaining actions of the current cadence window.

        The adapter pushes them to the bridge before it spends time on the next
        perception/decision, which is what keeps the avatar moving.
        """
        taken = self.pending_bursts[:max(0, limit)]
        self.pending_bursts = self.pending_bursts[len(taken):]
        return taken

    def __call__(self, png: bytes, step: int) -> dict:
        tick_started = time.monotonic()
        action_window_ends = self._action_window_ends
        perception = self.controller.observe(png)
        perception_ended = time.monotonic()
        # Close the loop on the *previous* decision: this frame is what the game
        # looked like after that action ran, so ``changed`` is its outcome.
        if self._last_perception is not None and self._last_decision is not None:
            self.controller.note_outcome(self._last_perception, self._last_decision, perception.changed)
            self.learn_transition(self._last_perception.signature, self._last_decision.intent,
                                  perception.signature)
            self._learn_payoff(perception)
        # The advisor sees the cheap perception summary; screen content stays
        # untrusted and the model's answer is filtered against the profile.
        decision: Decision = self.controller.decide(
            perception, step, advisor=self._guarded_advisor if self.advisor else None)
        decision = self._plan(perception, decision, step)
        if decision.intent != self._intent:
            if self._intent is not None:
                self.pacer.stats.switches += 1
            self._intent = decision.intent
            self.pending_bursts = []
        if not self.pending_bursts:
            self.pending_bursts = self._next_window(decision)
        action = self.pending_bursts.pop(0)
        busy_ms = action.get("hold_ms") or action.get("duration_ms") or 250
        self._action_window_ends = time.monotonic() + busy_ms / 1000.0
        overlap_ms = max(0.0, action_window_ends - (perception_ended - perception.elapsed_ms / 1000.0))
        self.stats.ticks.append(Tick(
            step=step, perception_ms=perception.elapsed_ms, decision_ms=decision.latency_ms,
            intent=decision.intent, action=action, source=decision.source,
            overlap_ms=round(overlap_ms * 1000.0, 2),
            perception_started_before_action_finished=overlap_ms > 0))
        self._record_event(step, perception)
        self._last_perception, self._last_decision = perception, decision
        stats = self.pacer.stats
        # Recomputed per tick on purpose: the summary is small and derived, and
        # caching it would hide cadence changes from the report.
        self.stats.screen = self.screen.label if self.screen else None
        if self.director is not None:
            line = self.director.next_line(self._stream_offset(step), perception)
            if line is not None:
                self.stats.line = line.text
                self.stats.said = self.director.stats.lines_spoken
        self.stats.tracks = [t.as_dict() for t in self.tracks[:4]]
        self.stats.pacer = {"windows": stats.windows, "late_windows": stats.late_windows,
                            "stalls": stats.stalls, "bursts": stats.bursts,
                            "intent_switches_during_window": stats.switches}
        elapsed = time.monotonic() - tick_started
        if elapsed > MAX_STEP_SECONDS:
            raise RuntimeError(f"step {step} took {elapsed:.2f}s, above {MAX_STEP_SECONDS}s")
        return action

    def _plan(self, perception, decision, step: int = 0) -> Decision:
        """Prefer a planned intent when the decision came from reflex/fallback.

        Memory and advisor answers are kept as they are: they are evidence, while
        planning is only a way to choose among *unknown* situations.
        """
        self.screen = classify(perception)
        self.tracks = self.tracker.update(perception.targets)
        if decision.source not in ("reflex", "fallback"):
            return decision
        allowed = preferred_intents(self.screen, self.profile)
        if self.playbook is not None and allowed:
            self.playbook.note_screen(perception.signature)
            # The tick is the real frame number, so exploration is deterministic
            # and a decision can be replayed; it is *not* the latency.
            choice = self.playbook.choose(perception.signature, tuple(allowed),
                                          tick=int(step), facts=self._facts(perception))
            if choice.intent != decision.intent:
                return Decision(choice.intent, f"play:{choice.reason}", decision.latency_ms,
                                decision.target)
            return decision
        if self.world_model is not None:
            try:
                plan = self.world_model.plan(perception.signature, allowed)
            except ValueError:
                return decision
            if plan.intent != decision.intent:
                return Decision(plan.intent, f"plan:{plan.source}", decision.latency_ms,
                                decision.target)
            return decision
        # No learned model yet: let the screen kind narrow the choice, and rotate
        # through the preferred intents so the agent does not freeze on one key.
        if allowed and decision.intent not in allowed:
            return Decision(allowed[0], "screen", decision.latency_ms, decision.target)
        return decision

    def set_recording_offset(self, seconds: float) -> None:
        """Set the approximate recording-relative timestamp for the next frame."""
        if isinstance(seconds, bool) or not isinstance(seconds, (int, float)) or not math.isfinite(seconds) or seconds < 0:
            raise ValueError("recording offset must be finite and non-negative")
        self._recording_offset = float(seconds)

    def _record_event(self, step: int, perception) -> None:
        """Keep a measured highlight with its supplied or estimated offset.

        A **goal** is a claim and needs a goal to be reached against; without one
        the agent has no right to say anything was achieved. A **change** is only
        an observation: the frame was different, which is a fact on its own. The
        montage keeps goals as its spine and lets changes only extend a clip.
        """
        facts = self._facts(perception)
        if self.playbook is not None and self.playbook.goal.reached(facts):
            kind = "goal"
            detail = f"targets={facts['targets']} kind={facts['kind']}"
        elif facts.get("changed"):
            kind = "change"
            detail = f"kind={facts['kind']} changed"
        else:
            self._recording_offset = None
            return
        offset = self._recording_offset
        self._recording_offset = None
        self.stats.events.append({"seconds": round(offset if offset is not None else step * self.cadence_seconds, 3),
                                  "kind": kind, "reason": detail})

    def _facts(self, perception) -> dict:
        """Measured facts about a frame: the only input the playbook trusts."""
        tracks = self.tracks or []
        return {
            "targets": len(getattr(perception, "targets", ()) or ()),
            "kind": self.screen.label if self.screen else "unknown",
            "changed": getattr(perception, "changed", None),
            "moving": sum(1 for track in tracks
                          if abs(getattr(track, "vx", 0)) + abs(getattr(track, "vy", 0)) > 1),
        }

    def _learn_payoff(self, perception) -> None:
        """Tell the playbook how the previous intent actually turned out."""
        if self.playbook is None or self._last_perception is None:
            return
        try:
            self.playbook.observe(self._last_perception.signature, self._last_decision.intent,
                                  self._facts(perception), after_signature=perception.signature)
        except ValueError:
            return

    def _stream_offset(self, step: int) -> float:
        """Seconds since the stream started, from the step number and cadence."""
        cadence = getattr(self.pacer, "cadence_ms", 1000) or 1000
        return max(0.0, float(step) * float(cadence) / 1000.0)

    def learn_transition(self, before_signature: str, intent: str, after_signature: str) -> None:
        """Record one observed screen -> intent -> screen transition."""
        if self.world_model is None:
            return
        try:
            self.world_model.record(before_signature, intent, after_signature)
        except ValueError:
            return

    def observe_frame_timing(self, observation: dict, *, tick: Tick | None = None) -> dict:
        """Feed bridge frame telemetry and the last tick back into the pacer."""
        last = tick or (self.stats.ticks[-1] if self.stats.ticks else None)
        return self.pacer.observe(observation, tick=last)


def build_agent(profile: str = "keyboard", *, objective: str, game: str = "",
                allowed: tuple[str, ...] | None = None, help_desk=None,
                memory=None, generator=None, use_advisor: bool = True,
                playbook_goal=None, playbook_path=None) -> ReflexAgent:
    """Assemble the full brain: reflex layer + optional slow Qwen advisor."""
    resolved = profile_from_name(profile) if isinstance(profile, str) else profile
    advisor_allowed = allowed or tuple(
        intent for intent in resolved.intents() if intent in ACTIONS) or ("FORWARD",)
    advisor = None
    if use_advisor:
        advisor = SlowAdvisor(objective, advisor_allowed, generator=generator,
                             help_desk=help_desk, game=game)
    if playbook_path is not None and playbook_goal is None:
        raise ValueError("a playbook path requires an explicit goal")
    playbook = Playbook(playbook_goal, path=playbook_path) if playbook_goal is not None else None
    return ReflexAgent(resolved, memory=memory, advisor=advisor, playbook=playbook)


def describe_budget() -> dict:
    return {"perception_budget_ms": PERCEPTION_BUDGET_MS,
            "decision_budget_ms": DECISION_BUDGET_MS,
            "max_step_seconds": MAX_STEP_SECONDS}
