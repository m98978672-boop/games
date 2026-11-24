"""A learned model of the game's screen graph, and a planner over it.

The reflex layer answers "what do I do *now*". This module answers "what have I
not tried yet, and what sequence of intents gets me somewhere new", which is the
difference between pacing on the spot and actually exploring a game.

How it learns (no gradients, no network, fully inspectable):

* every step records ``(screen signature, intent) -> next screen signature`` with
  a count. That is a partial transition model of the game;
* ``frontier`` is a signature never seen before; the planner runs a bounded
  breadth-first search from the current signature to any frontier node and
  returns the first intent on that path;
* when nothing is known (a brand-new game) curiosity picks the intent that has
  been tried least on this screen, breaking ties by the profile's own order;
* when everything is known, the least-visited neighbour wins, so the agent keeps
  moving instead of freezing on a familiar screen.

Everything is bounded: at most ``max_states`` signatures and ``max_edges``
transitions, and every lookahead is capped by ``max_depth`` steps.
"""
from __future__ import annotations

import json
import re
import threading
from collections import deque
from dataclasses import dataclass, field
from pathlib import Path

SIGNATURE = re.compile(r"[0-9a-f]{16}")
MAX_STATES = 4_000
MAX_EDGES = 12_000
MAX_DEPTH = 12


@dataclass
class Plan:
    intent: str
    source: str                 # "frontier" | "curiosity" | "least-visited"
    depth: int = 0
    target_state: str | None = None

    def as_dict(self) -> dict:
        return {"intent": self.intent, "source": self.source, "depth": self.depth,
                "target_state": self.target_state}


class WorldModel:
    """Transition counts between screen signatures, plus a frontier planner."""

    def __init__(self, path: Path | str | None = None, *, max_states: int = MAX_STATES,
                 max_edges: int = MAX_EDGES, max_depth: int = MAX_DEPTH):
        self.path = Path(path) if path is not None else None
        self.max_states = max_states
        self.max_edges = max_edges
        self.max_depth = max_depth
        self.edges: dict[tuple[str, str], dict[str, int]] = {}
        self.visits: dict[str, int] = {}
        self._lock = threading.Lock()
        if self.path is not None and self.path.exists():
            self._load()

    # -- persistence ------------------------------------------------------
    def _load(self) -> None:
        try:
            payload = json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return
        if not isinstance(payload, dict) or payload.get("version") != 1:
            return
        for row in payload.get("edges") or []:
            if not isinstance(row, dict):
                continue
            src, intent, dst, count = row.get("from"), row.get("intent"), row.get("to"), row.get("count")
            if (isinstance(src, str) and isinstance(dst, str) and SIGNATURE.fullmatch(src)
                    and SIGNATURE.fullmatch(dst) and isinstance(intent, str) and intent
                    and type(count) is int and count > 0):
                self.edges.setdefault((src, intent), {})[dst] = count
        for row in payload.get("visits") or []:
            if isinstance(row, dict) and isinstance(row.get("state"), str) and SIGNATURE.fullmatch(row["state"]):
                self.visits[row["state"]] = int(row.get("count") or 1)

    def save(self) -> None:
        if self.path is None:
            return
        self.path.parent.mkdir(parents=True, exist_ok=True)
        payload = {"version": 1,
                   "edges": [{"from": a, "intent": i, "to": b, "count": c}
                             for (a, i), targets in self.edges.items() for b, c in targets.items()],
                   "visits": [{"state": s, "count": c} for s, c in self.visits.items()]}
        self.path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")

    # -- learning ---------------------------------------------------------
    def record(self, before: str, intent: str, after: str) -> None:
        for value in (before, after):
            if not isinstance(value, str) or not SIGNATURE.fullmatch(value):
                raise ValueError("invalid screen signature")
        if not isinstance(intent, str) or not intent or len(intent) > 32:
            raise ValueError("invalid intent")
        with self._lock:
            if after not in self.visits and len(self.visits) >= self.max_states:
                return  # bounded: refuse new states rather than grow forever
            self.visits[after] = self.visits.get(after, 0) + 1
            self.visits.setdefault(before, 1)
            key = (before, intent)
            targets = self.edges.setdefault(key, {})
            if after not in targets and sum(len(v) for v in self.edges.values()) >= self.max_edges:
                return
            targets[after] = targets.get(after, 0) + 1

    # -- queries ----------------------------------------------------------
    def next_states(self, signature: str, intent: str) -> dict[str, int]:
        return dict(self.edges.get((signature, intent), {}))

    def known_intents(self, signature: str) -> dict[str, int]:
        """How many times each intent was tried on this screen."""
        out: dict[str, int] = {}
        for (src, intent), targets in self.edges.items():
            if src == signature:
                out[intent] = sum(targets.values())
        return out

    def frontier(self) -> set[str]:
        """Screens known only as a target: seen, but never acted from."""
        sources = {a for a, _ in self.edges}
        return {state for state in self.visits if state not in sources}

    def plan(self, signature: str, intents: tuple[str, ...], *, max_depth: int | None = None) -> Plan:
        """Decide what to try next: probe, or walk a route to an unmapped screen.

        Priority, in order:
        1. route found by BFS -> first step of that route (``frontier``);
        2. intents not tried on this screen -> the first untried one (``curiosity``);
        3. least visited known neighbour / least tried intent (``least-visited``).
        """
        if not intents:
            raise ValueError("at least one intent is required")
        depth_limit = self.max_depth if max_depth is None else min(max_depth, self.max_depth)
        tried = self.known_intents(signature)
        sources = {a for a, _ in self.edges}

        # 1) Is there a screen we can reach but never acted from?
        queue = deque([(signature, 0, None)])
        seen = {signature}
        while queue:
            state, depth, first = queue.popleft()
            if depth >= depth_limit:
                continue
            for intent in intents:
                for neighbour in self.next_states(state, intent):
                    if neighbour in seen:
                        continue
                    entry = first or intent
                    if neighbour not in sources:
                        return Plan(entry, "frontier", depth + 1, neighbour)
                    seen.add(neighbour)
                    queue.append((neighbour, depth + 1, entry))

        # 2) Untried anything on this screen? Probe it.
        untried = [i for i in intents if tried.get(i, 0) == 0]
        if untried:
            return Plan(untried[0], "curiosity", 0)

        # 3) Nothing new: keep moving along the least visited edge.
        best = None
        for intent in intents:
            for neighbour, count in self.next_states(signature, intent).items():
                score = (self.visits.get(neighbour, 0), -count)
                if best is None or score < best[0]:
                    best = (score, intent)
        if best is not None:
            return Plan(best[1], "least-visited", 1)
        return Plan(min(intents, key=lambda i: (tried.get(i, 0), intents.index(i))), "curiosity", 0)

    def stats(self) -> dict:
        return {"states": len(self.visits), "transitions": sum(len(v) for v in self.edges.values()),
                "frontier": len(self.frontier())}
