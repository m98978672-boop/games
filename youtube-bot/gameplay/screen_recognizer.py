"""Recognise *what kind of screen* this is, from the cheap perception data.

Knowing "this is a menu, not gameplay" changes the right move: a menu wants a
click on a button, gameplay wants movement, a death/retry screen wants the
confirm intent. This classifier uses only what perception already produces -
brightness, changed area, number/geometry of rectangles, edge density - so it
costs nothing extra per frame.

Labels are deliberately generic because the layer must never guess at a specific
game's rules; the useful distinction is structural.
"""
from __future__ import annotations

from dataclasses import dataclass

LABELS = ("menu", "gameplay", "text", "quiet")

# Thresholds are intentionally simple and documented so an operator can tune them.
MENU_MIN_TARGETS = 3          # several similar rectangles -> buttons
MENU_MAX_CHANGE = 0.25        # menus do not flicker like gameplay
TEXT_MAX_TARGETS = 2          # mostly text lines
TEXT_MIN_EDGE_RATIO = 0.02    # thin horizontal strokes
QUIET_MAX_CHANGE = 0.01


@dataclass(frozen=True)
class ScreenKind:
    label: str
    confidence: float
    reason: str

    def as_dict(self) -> dict:
        return {"label": self.label, "confidence": round(self.confidence, 2),
                "reason": self.reason}


def _edge_ratio(perception) -> float:
    """Share of the frame covered by detected rectangles (a cheap 'busyness')."""
    area = 0.0
    for target in perception.targets or ():
        area += target.w * target.h
    frame = 800.0 * 600.0
    return min(1.0, area / frame)


def classify(perception) -> ScreenKind:
    """Map one ``Perception`` to a structural screen label."""
    if perception is None:
        raise ValueError("a perception result is required")
    targets = list(perception.targets or ())
    changed = float(getattr(perception, "change_ratio", 1.0) or 0.0)
    busy = _edge_ratio(perception)

    if changed <= QUIET_MAX_CHANGE and not targets:
        return ScreenKind("quiet", 0.8, "almost nothing moves and no rectangles")

    # A small but *definite* change (a sprite moving) is gameplay, not a menu.
    moving_object = changed < MENU_MAX_CHANGE and bool(getattr(perception, "changed", False)) \
        and getattr(perception, "changed_area_ratio", 0.0) < 0.35
    if len(targets) >= MENU_MIN_TARGETS and changed <= MENU_MAX_CHANGE and not moving_object:
        widths = sorted({(t.w, t.h) for t in targets})
        similarity = 1.0 - (len(widths) - 1) / max(1, len(targets))
        return ScreenKind("menu", 0.6 + 0.3 * max(0.0, similarity),
                          f"{len(targets)} rectangles, low motion")

    if len(targets) <= TEXT_MAX_TARGETS and busy < TEXT_MIN_EDGE_RATIO:
        return ScreenKind("text", 0.6, "few rectangles, little busy area")

    if moving_object or changed > MENU_MAX_CHANGE or targets:
        return ScreenKind("gameplay", 0.7 if changed > MENU_MAX_CHANGE else 0.6,
                          f"motion {changed:.2f}, {len(targets)} rectangles")

    return ScreenKind("quiet", 0.5, "no dominant cue")


def preferred_intents(kind: ScreenKind, profile) -> tuple[str, ...]:
    """Narrow the intent set to what makes sense on this kind of screen.

    Returns the profile's own intents filtered, never invented ones, and never an
    empty tuple: a wrong guess must degrade to the full set, not freeze the agent.
    """
    intents = tuple(profile.intents())
    mapping = {
        "menu": ("INTERACT", "CONFIRM", "FORWARD", "UP", "EXPLORE", "SPACE", "WAIT"),
        "text": ("INTERACT", "CONFIRM", "SPACE", "EXPLORE", "UP", "WAIT"),
        "gameplay": ("EXPLORE", "FORWARD", "UP", "RIGHT", "MINE", "JUMP", "INTERACT"),
        "quiet": ("CONFIRM", "INTERACT", "SPACE", "EXPLORE", "WAIT"),
    }
    order = mapping.get(kind.label, ())
    preferred = tuple(i for i in order if i in intents)
    return preferred or intents
