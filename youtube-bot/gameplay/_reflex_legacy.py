"""FROZEN REFERENCE COPY of the first reflex layer - benchmark baseline only.

Kept so ``gameplay/benchmark_reflex.py --compare`` can prove the speed-up on the
same machine and the same frames. Do not fix or extend this file: the live code
is ``gameplay/reflex_layer.py``.

Fast perception and deadline-bounded decisions for the gameplay bridge.

This module is the *reflex* layer of the autopilot. It is classical computer
vision, not a language model: it answers "where did the screen change, where are
the button-like rectangles, is this frame familiar" inside a hard time budget,
so that a slow vision-language model (Qwen) can stay the arbiter at a much lower
cadence.

Contract enforced here and checked in ``tests/test_gameplay_reflex.py``:

* perception of one 800x600 frame: ``PERCEPTION_BUDGET_MS`` (300 ms) or less;
* a full decide step (perception + decision + optional slow advisor): no later
  than ``DECISION_BUDGET_MS`` (2000 ms) after the frame arrived; when the budget
  would be exceeded the controller returns its last proven action instead of
  waiting;
* the abstract intents produced here are translated by ``input_profiles`` only
  into actions the browser bridge accepts, and are issued *before* the next
  frame is analysed, so the avatar keeps moving while perception runs.

Nothing in this module trains a model, opens a socket, or trusts pixels: screen
content is untrusted game data and never becomes an instruction.
"""
from __future__ import annotations

import hashlib
import io
import time
from concurrent.futures import ThreadPoolExecutor
from concurrent.futures import TimeoutError as FutureTimeout
from dataclasses import dataclass, field
from typing import Callable, Iterable, Sequence

PERCEPTION_BUDGET_MS = 300.0
DECISION_BUDGET_MS = 2000.0
FRAME = (800, 600)
SMALL = (200, 150)  # quarter scale, 4x factor back to the frame
_SMALL_SCALE = FRAME[0] // SMALL[0]

# Below this mean absolute difference (0..255) two frames count as unchanged.
CHANGE_THRESHOLD = 2.0


@dataclass(frozen=True)
class Target:
    """A button-like rectangle in full-frame coordinates."""

    x: int
    y: int
    w: int
    h: int
    score: float

    @property
    def center(self) -> tuple[int, int]:
        return self.x + self.w // 2, self.y + self.h // 2

    def as_dict(self) -> dict:
        cx, cy = self.center
        return {"x": self.x, "y": self.y, "w": self.w, "h": self.h,
                "cx": cx, "cy": cy, "score": round(self.score, 3)}


@dataclass
class Perception:
    """Result of looking at one frame, already inside the perception budget."""

    signature: str
    changed: bool
    change_ratio: float
    roi: tuple[int, int, int, int] | None
    targets: list[Target] = field(default_factory=list)
    elapsed_ms: float = 0.0
    degraded: bool = False  # target search was skipped to stay in budget
    unfamiliar: bool = False  # no skill memory has ever seen this screen
    size: tuple[int, int] = FRAME

    def as_dict(self) -> dict:
        """JSON-safe summary for the autopilot log (no pixels)."""
        return {"signature": self.signature, "changed": self.changed,
                "change_ratio": round(self.change_ratio, 4), "roi": self.roi,
                "targets": [t.as_dict() for t in self.targets],
                "perception_ms": round(self.elapsed_ms, 2),
                "degraded": self.degraded, "unfamiliar": self.unfamiliar}


def _open_small(png: bytes):
    """Decode a bridge screenshot and shrink it; raises ValueError if invalid."""
    from PIL import Image  # local import keeps module import cheap

    if not isinstance(png, (bytes, bytearray)) or not png.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError("screenshot must be PNG bytes")
    if len(png) > 2_000_000:
        raise ValueError("screenshot exceeds bridge limit")
    try:
        image = Image.open(io.BytesIO(bytes(png)))
    except Exception:  # pillow raises several unrelated exception types
        raise ValueError("screenshot is not a decodable image") from None
    with image as source:
        if source.format != "PNG" or source.size != FRAME:
            raise ValueError("unexpected screenshot format or dimensions")
        try:
            return source.convert("L").resize(SMALL)
        except Exception:
            raise ValueError("screenshot could not be decoded") from None


def signature(small) -> str:
    """Stable coarse fingerprint of a downscaled frame (no per-pixel compare)."""
    return hashlib.blake2b(small.tobytes(), digest_size=8).hexdigest()


def _roi(previous, current) -> tuple[float, tuple[int, int, int, int] | None]:
    """Mean absolute difference and the changed bounding box, in frame pixels.

    Two cues are combined because either one alone is easy to fool: a small but
    sharply different sprite (an enemy entering the screen) barely moves the mean,
    while a slow full-screen fade moves the mean without any localised change.
    """
    from PIL import ImageChops, ImageStat

    diff = ImageChops.difference(previous, current)
    mean = ImageStat.Stat(diff).mean[0]
    mask = diff.point(lambda v: 255 if v >= 16 else 0)
    bbox = mask.getbbox()
    if bbox is None:
        return mean, None
    changed_fraction = ImageStat.Stat(mask).sum[0] / 255.0 / (current.size[0] * current.size[1])
    if mean < CHANGE_THRESHOLD and changed_fraction < 0.0015:
        return mean, None
    return mean, (bbox[0] * _SMALL_SCALE, bbox[1] * _SMALL_SCALE,
                  bbox[2] * _SMALL_SCALE, bbox[3] * _SMALL_SCALE)


def detect_targets(small, *, max_targets: int = 12) -> list[Target]:
    """Find button-like rectangles: dense horizontal and vertical edge runs.

    Cheap on purpose: one pass over 200x150 luminance values, no scipy, no
    per-pixel labelling of the full frame. Coordinates are scaled back to the
    800x600 frame so the bridge can click them directly.
    """
    w, h = small.size
    px = small.tobytes()
    if len(px) != w * h:
        raise ValueError("unexpected luminance buffer")

    # Vertical/horizontal gradient energy per cell.
    energy = [0] * (w * h)
    for y in range(1, h - 1):
        row = y * w
        up, down = row - w, row + w
        for x in range(1, w - 1):
            i = row + x
            gx = px[i + 1] - px[i - 1]
            gy = px[down + x] - px[up + x]
            energy[i] = abs(gx) + abs(gy)
    threshold = 40
    mask = bytearray(1 if e >= threshold else 0 for e in energy)

    # Dilate horizontally/vertically by 1 so edges of a box join into a blob.
    grown = bytearray(mask)
    for y in range(h):
        row = y * w
        for x in range(1, w - 1):
            if mask[row + x]:
                grown[row + x - 1] = 1
                grown[row + x + 1] = 1
    for y in range(1, h - 1):
        row = y * w
        for x in range(w):
            if mask[row + x]:
                grown[row + x - w] = 1
                grown[row + x + w] = 1

    # Iterative flood fill (explicit stack, bounded by frame size).
    seen = bytearray(w * h)
    boxes: list[Target] = []
    for start in range(w * h):
        if not grown[start] or seen[start]:
            continue
        stack = [start]
        seen[start] = 1
        minx = maxx = start % w
        miny = maxy = start // w
        area = 0
        while stack:
            i = stack.pop()
            area += 1
            y, x = divmod(i, w)
            if x < minx:
                minx = x
            if x > maxx:
                maxx = x
            if y < miny:
                miny = y
            if y > maxy:
                maxy = y
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < w and 0 <= ny < h:
                    j = ny * w + nx
                    if grown[j] and not seen[j]:
                        seen[j] = 1
                        stack.append(j)
        bw, bh = maxx - minx + 1, maxy - miny + 1
        # Button-like: not a hairline, not the whole screen, decent fill.
        if area < 24 or bw < 5 or bh < 4 or bw > w * 0.75 or bh > h * 0.75:
            continue
        fill = area / float(bw * bh)
        if fill < 0.25:
            continue
        boxes.append(Target(minx * _SMALL_SCALE, miny * _SMALL_SCALE,
                            bw * _SMALL_SCALE, bh * _SMALL_SCALE,
                            score=fill * min(1.0, area / 120.0)))
    boxes.sort(key=lambda t: t.score, reverse=True)
    return boxes[:max_targets]


def perceive(png: bytes, previous: Perception | None = None, *,
             find_targets: bool = True,
             budget_ms: float = PERCEPTION_BUDGET_MS) -> Perception:
    """Analyse one frame, degrading instead of overrunning the budget."""
    started = time.perf_counter()
    small = _open_small(png)
    sig = signature(small)
    changed, ratio, roi = True, 1.0, (0, 0, FRAME[0], FRAME[1])
    if previous is not None:
        before = getattr(previous, "_small", None)
        if before is not None and before.size == small.size:
            mean, box = _roi(before, small)
            changed = box is not None
            ratio = min(1.0, mean / 255.0)
            roi = box
    targets: list[Target] = []
    degraded = False
    elapsed_ms = (time.perf_counter() - started) * 1000.0
    if find_targets and changed and elapsed_ms < budget_ms * 0.5:
        targets = detect_targets(small)
        degraded = False
    elif find_targets:
        degraded = True
    elapsed_ms = (time.perf_counter() - started) * 1000.0
    if elapsed_ms > budget_ms:
        degraded = True
    result = Perception(signature=sig, changed=changed, change_ratio=ratio,
                        roi=roi, targets=targets, elapsed_ms=elapsed_ms,
                        degraded=degraded)
    result._small = small  # retained for the next frame compare only
    return result


def changed_regions_text(perception: Perception) -> str:
    """One short line for a slow advisor; bounded, never raw pixels."""
    where = "none" if perception.roi is None else "x{}-{} y{}-{}".format(*perception.roi)
    return (f"changed={perception.changed} ({perception.change_ratio:.3f}) "
            f"roi={where} targets={len(perception.targets)}")


@dataclass
class Decision:
    intent: str
    source: str            # "memory" | "reflex" | "advisor" | "fallback"
    latency_ms: float
    target: Target | None = None
    deadline_met: bool = True


class ReflexController:
    """Turns frames into intents without ever blowing the decision deadline."""

    def __init__(self, default_intent: str = "EXPLORE", *, budget_ms: float = DECISION_BUDGET_MS,
                 perception_budget_ms: float = PERCEPTION_BUDGET_MS,
                 memory=None, clock: Callable[[], float] = time.monotonic):
        self.default_intent = default_intent
        self.budget_ms = budget_ms
        self.perception_budget_ms = perception_budget_ms
        self.memory = memory
        self.clock = clock
        self.last_perception: Perception | None = None
        self.last_decision: Decision | None = None
        self.decisions: list[Decision] = []
        self.advisor_timeouts = 0

    def observe(self, png: bytes, *, find_targets: bool = True) -> Perception:
        perception = perceive(png, self.last_perception, find_targets=find_targets,
                              budget_ms=self.perception_budget_ms)
        if self.memory is not None:
            perception.unfamiliar = self.memory.best(perception.signature) is None
        self.last_perception = perception
        return perception

    def decide(self, perception: Perception, step: int, *,
               advisor: Callable[[Perception, int], str | None] | None = None,
               remaining_ms: float | None = None) -> Decision:
        """Pick an intent; a slow advisor may not push us past the deadline."""
        started = self.clock()
        budget = self.budget_ms if remaining_ms is None else max(0.0, remaining_ms)

        if self.memory is not None:
            known = self.memory.recall(perception.signature)
            if known is not None:
                return self._remember(Decision(known, "memory", (self.clock() - started) * 1000.0,
                                               self._best_target(perception)))

        if advisor is not None:
            spent = (self.clock() - started) * 1000.0
            if spent < budget * 0.9:
                proposal = self._ask(advisor, perception, step, budget - spent)
                spent = (self.clock() - started) * 1000.0
                if proposal and spent < budget:
                    return self._remember(Decision(proposal, "advisor", spent,
                                                   self._best_target(perception)))
            # The advisor ran too long or returned nothing usable: say so, so a
            # caller can log why the reflex layer took over.
            self.advisor_timeouts += 1

        if perception.changed or self.last_decision is None:
            target = self._best_target(perception)
            intent = "INTERACT" if (target is not None and target.score > 0.9) else self.default_intent
            return self._remember(Decision(intent, "reflex", (self.clock() - started) * 1000.0, target))

        # Nothing moved: repeat the last decision, flagged as fallback, at once.
        last = self.last_decision
        return self._remember(Decision(last.intent, "fallback",
                                       (self.clock() - started) * 1000.0, last.target))

    def _ask(self, advisor, perception, step, remaining_ms: float):
        """Run the advisor under a watchdog in a worker thread.

        A model call cannot be interrupted from Python, so its result is simply
        dropped once the deadline has passed; the reflex decision then wins and
        the tick is never blocked beyond the budget.
        """
        
        # Reserve a slice of the remaining budget for thread start-up, the
        # reflex fallback itself and dataclass bookkeeping, so the *measured*
        # latency (not just the watchdog) stays inside the deadline.
        reserve = max(10.0, remaining_ms * 0.08)
        wait_ms = max(0.0, remaining_ms - reserve)
        pool = ThreadPoolExecutor(max_workers=1)
        future = pool.submit(advisor, perception, step)
        try:
            return future.result(timeout=wait_ms / 1000.0)
        except FutureTimeout:
            future.cancel()
            return None
        except Exception:
            return None
        finally:
            pool.shutdown(wait=False, cancel_futures=True)

    @staticmethod
    def _best_target(perception: Perception) -> Target | None:
        return perception.targets[0] if perception.targets else None

    def _remember(self, decision: Decision) -> Decision:
        decision.deadline_met = decision.latency_ms <= self.budget_ms
        self.last_decision = decision
        self.decisions.append(decision)
        return decision

    def note_outcome(self, perception: Perception, decision: Decision, changed: bool) -> None:
        """Feed 'this intent worked on this screen' back into skill memory."""
        if self.memory is None or decision.source == "fallback":
            return
        self.memory.record(perception.signature, decision.intent, changed)


@dataclass
class Tick:
    step: int
    perception_ms: float
    decision_ms: float
    intent: str
    action: dict
    source: str
    overlap_ms: float  # time the previous action was executing while perceiving
    perception_started_before_action_finished: bool


class ReflexRunner:
    """Pipeline: send the action first, then look at the next frame.

    Perception of frame *n+1* runs in a worker thread while the action for frame
    *n* is still being executed by the bridge, so the character keeps moving
    during analysis instead of freezing for the length of a model call.
    """

    def __init__(self, controller: ReflexController, profile, *,
                 advisor: Callable[[Perception, int], str | None] | None = None,
                 max_ticks: int = 500, executor=None):
        self.controller = controller
        self.profile = profile
        self.advisor = advisor
        self.max_ticks = max_ticks
        # One worker, reused across ticks: starting a thread per frame would eat
        # a measurable slice of the 300 ms perception budget.
        
        self._own_executor = executor is None
        self.executor = executor or ThreadPoolExecutor(max_workers=1)

    def run(self, frames: Iterable[bytes], act: Callable[[dict], object]) -> list[Tick]:
        ticks: list[Tick] = []
        frames = list(frames)
        if not frames:
            return ticks
        pool = self.executor
        try:
            perception = self.controller.observe(frames[0])
            pending = None
            for step, png in enumerate(frames[: self.max_ticks]):
                decision = self.controller.decide(perception, step, advisor=self.advisor)
                action = self.profile.action(decision.intent, target=decision.target)
                started = time.perf_counter()
                act(action)
                acted_ms = (time.perf_counter() - started) * 1000.0

                next_png = frames[step + 1] if step + 1 < len(frames) else None
                if next_png is None:
                    ticks.append(Tick(step, perception.elapsed_ms, decision.latency_ms,
                                      decision.intent, action, decision.source, 0.0, False))
                    break
                # Start looking at the next frame immediately after the action
                # was issued; ``act`` above is the movement itself.
                pending = pool.submit(self.controller.observe, next_png)
                perception = pending.result()
                overlap = max(0.0, acted_ms - perception.elapsed_ms)
                ticks.append(Tick(step, perception.elapsed_ms, decision.latency_ms,
                                  decision.intent, action, decision.source, overlap,
                                  acted_ms > perception.elapsed_ms))
                self.controller.note_outcome(perception, decision, perception.changed)
        finally:
            if self._own_executor:
                pool.shutdown(wait=False)
        return ticks


def summarise(ticks: Sequence[Tick]) -> dict:
    """Aggregate latencies the way the dashboard and tests read them."""
    if not ticks:
        return {"ticks": 0}
    perception = sorted(t.perception_ms for t in ticks)
    decisions = sorted(t.decision_ms for t in ticks)
    p95 = lambda xs: xs[max(0, min(len(xs) - 1, int(round(len(xs) * 0.95)) - 1))]
    return {
        "ticks": len(ticks),
        "perception_p95_ms": round(p95(perception), 2),
        "perception_max_ms": round(perception[-1], 2),
        "decision_p95_ms": round(p95(decisions), 2),
        "decision_max_ms": round(decisions[-1], 2),
        "overlapped_ticks": sum(1 for t in ticks if t.perception_started_before_action_finished),
        "sources": {s: sum(1 for t in ticks if t.source == s)
                    for s in ("memory", "reflex", "advisor", "fallback")},
    }


def step_latencies(ticks: Sequence[Tick]) -> dict:
    """Wall-clock story of a run: is the avatar moving while we think?

    The bridge is step-driven, so a long model call shows up here as a long
    ``think_ms`` on the tick that used the advisor, while ``perception_ms``
    keeps its own budget. Both numbers are reported, never merged, so the
    dashboard cannot claim 300 ms perception and hide a 2 s decision.
    """
    if not ticks:
        return {"ticks": 0}
    think = [t.decision_ms for t in ticks]
    perceive = [t.perception_ms for t in ticks]
    return {"ticks": len(ticks),
            "think_total_ms": round(sum(think), 2),
            "perceive_total_ms": round(sum(perceive), 2),
            "worst_think_ms": round(max(think), 2),
            "ticks_over_decision_budget": sum(1 for ms in think if ms > DECISION_BUDGET_MS),
            "ticks_over_perception_budget": sum(1 for ms in perceive if ms > PERCEPTION_BUDGET_MS)}
