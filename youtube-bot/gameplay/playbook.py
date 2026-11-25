"""Play for the objective, not just for novelty: score the routes before walking them.

The reflex layer already decides *fast*; the world model knows which screens exist.
Neither answers the question the owner actually asks: "did the bot play well?"
This module adds that missing judgement:

* a **goal** is a checkable predicate over measured screen facts (``targets >= 3``,
  ``kind == "menu"``, ``signature known``), never a guess about the game's meaning;
* every learned transition gets a **value**: how often the screen after it matched
  the goal, how often it looped back to a screen we had already seen, and how
  rarely it had been tried. That value ranks *intents on the current screen*;
* exploration is not forbidden — it is budgeted. ``explore_ratio`` decides how much
  of the time we accept an unproven intent to keep learning, and ``stuck_after``
  decides how long a loop may repeat before we stop being polite about it.

The output of :meth:`Playbook.choose` is one intent plus the reason it was chosen,
so a bad run can be explained after the fact instead of averaged away.
"""
from __future__ import annotations

import math
import threading
from dataclasses import dataclass, field

# Weight of an intent that has never been tried on this screen: it must be tried
# at least once, but not forever.
NOVELTY_BONUS = 1.0
# Weight of a transition that led to the goal, relative to a plain move.
GOAL_WEIGHT = 4.0
# Weight deducted when a transition goes back to a screen we already stood on.
LOOP_PENALTY = 1.5
# A goal probability below this is "not making progress" and triggers the escape.
PROGRESS_EPSILON = 0.05


class PlaybookError(ValueError):
    """The playbook was configured in a way that cannot play honestly."""


@dataclass(frozen=True)
class Goal:
    """A checkable condition over measured screen facts.

    ``kind`` is one of the recogniser's labels; ``min_targets`` and ``max_targets``
    bound the number of rectangles; ``needs_change`` requires the frame to move.
    """

    name: str
    kind: str | None = None
    min_targets: int = 0
    max_targets: int = 10_000
    needs_change: bool | None = None

    def __post_init__(self):
        if not self.name or len(self.name) > 60:
            raise PlaybookError("a goal needs a short name")
        if self.kind is not None and self.kind not in ("menu", "gameplay", "text", "quiet", "unknown"):
            raise PlaybookError("unknown screen kind in the goal")
        if self.min_targets < 0 or self.max_targets < self.min_targets:
            raise PlaybookError("target bounds are inverted")

    def reached(self, facts: dict) -> bool:
        """True only from measured facts; a missing fact never counts as success."""
        counts = facts.get("targets")
        if counts is None or not self.min_targets <= counts <= self.max_targets:
            return False
        if self.kind is not None and facts.get("kind") != self.kind:
            return False
        if self.needs_change is not None and facts.get("changed") is not self.needs_change:
            return False
        return True

    def as_dict(self) -> dict:
        return {"name": self.name, "kind": self.kind, "min_targets": self.min_targets,
                "max_targets": self.max_targets, "needs_change": self.needs_change}


# Goals an operator can pick from without inventing game semantics.
GOAL_PRESETS = {
    "progress": Goal("прогресс: экран меняется и на нём есть цели", min_targets=1, needs_change=True),
    "explore": Goal("исследование: дойти до экрана с меню", kind="menu"),
    "engage": Goal("игра: экран меняется", needs_change=True),
    "any-action": Goal("любое действие: что-то в кадре есть", min_targets=1),
}


@dataclass
class EdgeStats:
    tries: int = 0
    goal_hits: int = 0
    loops: int = 0

    @property
    def goal_rate(self) -> float:
        return self.goal_hits / self.tries if self.tries else 0.0

    def value(self) -> float:
        """Higher is better: progress minus looping, with a floor for untried moves."""
        if not self.tries:
            return NOVELTY_BONUS
        return GOAL_WEIGHT * self.goal_rate - LOOP_PENALTY * (self.loops / self.tries)

    def as_dict(self) -> dict:
        return {"tries": self.tries, "goal_hits": self.goal_hits, "loops": self.loops,
                "goal_rate": round(self.goal_rate, 3), "value": round(self.value(), 3)}


@dataclass
class Choice:
    intent: str
    reason: str          # goal | known | explore | escape
    value: float
    goal_rate: float
    stalled: bool        # the playbook believes the bot is not making progress

    def as_dict(self) -> dict:
        return {"intent": self.intent, "reason": self.reason, "value": round(self.value, 3),
                "goal_rate": round(self.goal_rate, 3), "stalled": self.stalled}


@dataclass
class PlaybookStats:
    choices: int = 0
    goal_choices: int = 0
    explore_choices: int = 0
    escape_choices: int = 0
    loops_seen: int = 0
    stalled_ticks: int = 0

    def summary(self) -> dict:
        return {
            "choices": self.choices,
            "goal_choices": self.goal_choices,
            "explore_choices": self.explore_choices,
            "escape_choices": self.escape_choices,
            "loops_seen": self.loops_seen,
            "stalled_ticks": self.stalled_ticks,
            "share_towards_goal": round(self.goal_choices / self.choices, 3) if self.choices else 0.0,
        }


class Playbook:
    """Ranks intents by measured payoff and keeps exploiting what works.

    It is independent of the world model: any object exposing ``next_states``,
    ``known_intents`` and ``plan`` can be plugged in, which keeps the learning
    source and the scoring source separate.
    """

    def __init__(self, goal: Goal | None = None, *, explore_ratio: float = 0.15,
                 stuck_after: int = 3, world_model=None):
        goal = goal or GOAL_PRESETS["progress"]
        if not isinstance(goal, Goal):
            raise PlaybookError("goal must be a Goal")
        if not 0.0 <= explore_ratio <= 1.0:
            raise PlaybookError("explore_ratio must be between 0 and 1")
        if not 1 <= stuck_after <= 20:
            raise PlaybookError("stuck_after must be between 1 and 20")
        self.goal = goal
        self.explore_ratio = explore_ratio
        self.stuck_after = stuck_after
        self.world_model = world_model
        self.edges: dict[tuple[str, str], EdgeStats] = {}
        self.stats = PlaybookStats()
        self._lock = threading.Lock()
        self._streak: int = 0               # consecutive ticks without a goal hit
        self._last_screen: str | None = None
        self._recent_screens: list[str] = []
        self._last_choice: Choice | None = None

    # -- learning ------------------------------------------------------------
    def _edge(self, screen: str, intent: str) -> EdgeStats:
        return self.edges.setdefault((screen, intent), EdgeStats())

    def observe(self, before_signature: str, intent: str, facts: dict, *,
                after_signature: str | None = None) -> bool:
        """Record one real outcome. Returns True if the goal was reached.

        ``facts`` must come from a measurement (the recogniser and the tracker);
        nothing here infers what happened from the intent alone.
        """
        if not isinstance(facts, dict):
            raise PlaybookError("facts must be a measured dictionary")
        hit = self.goal.reached(facts)
        looped = after_signature is not None and after_signature in self._recent_screens[:-1]
        with self._lock:
            edge = self._edge(before_signature, intent)
            edge.tries += 1
            if hit:
                edge.goal_hits += 1
                self._streak = 0
                self.stats.goal_choices += 0  # counted when chosen, not when observed
            else:
                self._streak += 1
                self.stats.stalled_ticks += 1 if self._streak == self.stuck_after else 0
            if looped:
                edge.loops += 1
                self.stats.loops_seen += 1
        self._remember(after_signature)
        return hit

    def _remember(self, signature: str | None) -> None:
        if not signature:
            return
        self._recent_screens = (self._recent_screens + [signature])[-6:]

    # -- deciding ------------------------------------------------------------
    def note_screen(self, signature: str) -> None:
        """Register the screen the bot is standing on (called once per frame)."""
        if signature and (not self._recent_screens or self._recent_screens[-1] != signature):
            self._remember(signature)

    @property
    def stalled(self) -> bool:
        return self._streak >= self.stuck_after

    def values(self, signature: str, intents: tuple[str, ...]) -> dict[str, float]:
        with self._lock:
            return {intent: self._edge(signature, intent).value() for intent in intents}

    def choose(self, signature: str, intents: tuple[str, ...], *,
               tick: int = 0, facts: dict | None = None) -> Choice:
        """Pick the best-measured intent, with a budgeted amount of exploring.

        ``tick`` makes exploration deterministic instead of random, so a run can be
        replayed and the same decision explained the same way.
        """
        if not intents:
            raise PlaybookError("at least one intent is required")
        facts = facts or {}
        with self._lock:
            values = {intent: self._edge(signature, intent) for intent in intents}
            self.stats.choices += 1
            self._last_screen = signature

            order = list(intents)
            untried = [intent for intent in order if not values[intent].tries]
            if self._streak >= self.stuck_after:
                # Nothing has worked for a while: leave the screen by the least
                # tried route instead of repeating the same failing input.
                pick = min(order, key=lambda i: (values[i].tries, -values[i].value(), order.index(i)))
                self.stats.escape_choices += 1
                return self._record(Choice(pick, "escape", values[pick].value(),
                                           values[pick].goal_rate, True))

            best = max(order, key=lambda i: (values[i].value(), -order.index(i)))
            # Exploration is a budget, not a habit. Two honest ways to spend it:
            # the best-ranked route was never tried on this screen, or the tick
            # falls into the rotation slot. Both are counted, neither is hidden.
            explore_slot = (self.explore_ratio > 0
                            and tick > 0
                            and tick % max(1, int(round(1 / self.explore_ratio))) == 0)
            if not values[best].tries:
                pick = best
            elif explore_slot and untried:
                pick = untried[(tick // max(1, int(round(1 / self.explore_ratio)))) % len(untried)]
            elif values[best].value() <= 0 and untried:
                # Everything proven is worthless here: a fresh route is cheaper
                # than repeating one that already paid nothing.
                pick = untried[0]
            else:
                pick = None
            if pick is not None:
                self.stats.explore_choices += 1
                return self._record(Choice(pick, "explore", values[pick].value(),
                                           values[pick].goal_rate, False))
            reason = "goal" if values[best].goal_rate > PROGRESS_EPSILON else "known"
            if reason == "goal":
                self.stats.goal_choices += 1
            return self._record(Choice(best, reason, values[best].value(),
                                       values[best].goal_rate, False))

    def _record(self, choice: Choice) -> Choice:
        self._last_choice = choice
        return choice

    # -- reporting -----------------------------------------------------------
    def ranking(self, signature: str, intents: tuple[str, ...] | None = None) -> list[dict]:
        """Everything known about this screen, best first — for an operator to read."""
        with self._lock:
            names = tuple(intents or sorted({i for (s, i) in self.edges if s == signature}))
            rows = []
            for intent in names:
                edge = self.edges.get((signature, intent), EdgeStats())
                rows.append({"intent": intent, **edge.as_dict()})
            return sorted(rows, key=lambda row: -row["value"])

    def summary(self) -> dict:
        data = self.stats.summary()
        with self._lock:
            ranked = sorted(self.edges.items(), key=lambda kv: -kv[1].value())
            data.update({
                "goal": self.goal.as_dict(),
                "screens_learned": len({screen for screen, _ in self.edges}),
                "edges_learned": len(self.edges),
                "stalled": self.stalled,
                "best_routes": [{"screen": screen, "intent": intent, **edge.as_dict()}
                                for (screen, intent), edge in ranked[:5]],
            })
        return data


def _goal_facts(index: int) -> dict:
    """Pretend game: 1 screen in 6 is a "goal" screen (menu with buttons, moving)."""
    return {"targets": 3 if index % 6 == 0 else 1,
            "kind": "menu" if index % 6 == 0 else "gameplay",
            "changed": True}


def _world(screens: int, seed: int):
    """A pretend game where blind cycling provably fails to reach the goal.

    Structure, not luck: screen ``i`` stands for *ordinary* play and its only
    forward route is index ``i + 1``; the last screen of each block of five is a
    **goal** screen whose next route drops back to ordinary play. A bot that
    repeats ``FORWARD, JUMP, INTERACT, BACK`` in order never learns that only one
    input moves forward, so it drifts between ordinary screens and goal screens
    with nothing to remember; a bot that keeps values per (screen, intent) finds
    the productive input and stays on it.
    """
    intents = ("FORWARD", "JUMP", "INTERACT", "BACK")
    kinds = ("ordinary", "goal")
    goal_every = 5
    names = []
    kind = []
    for block in range(screens // goal_every):
        for offset in range(goal_every):
            index = block * goal_every + offset
            names.append("%016x" % (index + 1))
            kind.append("goal" if offset == goal_every - 1 else "ordinary")
    world: dict[str, dict[str, tuple[str, str]]] = {}
    for index, name in enumerate(names):
        position = index % goal_every
        table = {}
        for slot, intent in enumerate(intents):
            if slot == 0 and position < goal_every - 1:
                target = index + 1                      # forward progress
            elif slot == 0:
                target = (index + 1) % len(names)       # goal screen loops back
            else:
                target = (index * 3 + slot * 7 + 5) % len(names)
            table[intent] = (names[target], kind[target])
        world[name] = table
    return names, intents, world, dict(zip(names, kind))


def _goal_facts(is_goal: bool, moving: bool = True) -> dict:
    """Measured facts for a pretend frame: a goal screen looks like a menu.

    Ordinary screens carry **no** rectangles on purpose. With a rectangle on every
    screen, a "there is something on screen" goal would be met 200/200 by both bots
    and the benchmark would compare nothing.
    """
    return {"targets": 3 if is_goal else 0,
            "kind": "menu" if is_goal else "gameplay",
            "changed": moving}


def naive_baseline(goal: Goal, screens: int = 40, steps: int = 200, seed: int = 7) -> dict:
    """How a bot would do with *no* learning: fixed-order intents.

    Used in the benchmark so "optimised" is a measured comparison against
    something dumb but honest, not a claim.
    """
    names, intents, world, kinds = _world(screens, seed)
    state = names[0]
    hits = 0
    for step in range(steps):
        intent = intents[step % len(intents)]
        state, state_kind = world[state][intent]
        hits += goal.reached(_goal_facts(state_kind == "goal"))
    return {"steps": steps, "goal_hits": hits, "goal_rate": round(hits / steps, 3)}


def learned_baseline(goal: Goal, screens: int = 40, steps: int = 200, seed: int = 7) -> dict:
    """The same pretend game, played by :class:`Playbook` — the measured improvement."""
    names, intents, world, kinds = _world(screens, seed)
    book = Playbook(goal, explore_ratio=0.2, stuck_after=3)
    state = names[0]
    hits = 0
    for tick in range(steps):
        book.note_screen(state)
        facts = _goal_facts(kinds[state] == "goal")
        if goal.reached(facts):
            hits += 1
        # The bot only knows what it has measured; the pretend game answers after
        # the intent is sent, exactly like the bridge does.
        choice = book.choose(state, intents, tick=tick, facts=facts)
        nxt, nxt_kind = world[state][choice.intent]
        book.observe(state, choice.intent, _goal_facts(nxt_kind == "goal"), after_signature=nxt)
        state = nxt
    return {"steps": steps, "goal_hits": hits, "goal_rate": round(hits / steps, 3),
            "playbook": book.summary()}
