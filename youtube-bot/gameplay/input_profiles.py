"""Input profiles: abstract intents -> the actions the browser bridge accepts.

The bridge (``gameplay/browser_bridge.cjs``) understands only ``keys``, ``click``,
``button``, ``hold_ms``, ``look`` and ``duration_ms``, with at most four keys at
once and coordinates inside 800x600. A profile maps one game's *controls* to that
vocabulary, so the same brain can drive a keyboard game, a mouse game, or a game
whose on-screen controls are a virtual joystick / d-pad.

Profiles are declarative data, never code from a model, and every produced action
is validated by ``validate_action`` before it reaches the bridge.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

KEY_PATTERN = re.compile(r"^(Arrow(Up|Down|Left|Right)|Space|Enter|Escape|ShiftLeft|Key[A-Z]|Digit[0-9])$")
MAX_KEYS = 4
FRAME_W, FRAME_H = 800, 600


class InputProfileError(ValueError):
    """Raised when a profile or a produced action would be rejected by the bridge."""


def validate_action(action) -> dict:
    """Mirror of the bridge's ``checkAction`` contract, before a round trip."""
    if not isinstance(action, dict):
        raise InputProfileError("action must be an object")
    allowed = {"keys", "click", "button", "hold_ms", "look", "duration_ms"}
    if set(action) - allowed:
        raise InputProfileError(f"unknown action field(s): {sorted(set(action) - allowed)}")
    keys = action.get("keys", [])
    if not isinstance(keys, (list, tuple)) or len(keys) > MAX_KEYS or len(set(keys)) != len(keys):
        raise InputProfileError("invalid keys")
    if any(not isinstance(k, str) or not KEY_PATTERN.match(k) for k in keys):
        raise InputProfileError("invalid key name")
    click = action.get("click")
    if click is not None:
        if (not isinstance(click, (list, tuple)) or len(click) != 2
                or any(not isinstance(v, int) or isinstance(v, bool) for v in click)
                or not (0 <= click[0] < FRAME_W and 0 <= click[1] < FRAME_H)):
            raise InputProfileError("invalid click coordinates")
    if action.get("button", "left") not in ("left", "right"):
        raise InputProfileError("invalid mouse button")
    look = action.get("look")
    if look is not None:
        if (not isinstance(look, (list, tuple)) or len(look) != 2
                or any(not isinstance(v, int) or not -100 <= v <= 100 for v in look)):
            raise InputProfileError("invalid look vector")
    duration = action.get("duration_ms", 250)
    if not isinstance(duration, int) or not 50 <= duration <= 2000:
        raise InputProfileError("invalid duration")
    hold = action.get("hold_ms", 0)
    if not isinstance(hold, int) or not 0 <= hold <= 4500:
        raise InputProfileError("invalid hold")
    # Emit only the fields that were actually requested. The bridge rejects
    # ``button``/``hold_ms`` when no click accompanies them ("invalid button"),
    # so a normalised action must not carry empty placeholders.
    clean: dict = {}
    if keys:
        clean["keys"] = list(keys)
    if click:
        clean["click"] = list(click)
        clean["button"] = action.get("button", "left")
        if hold:
            clean["hold_ms"] = hold
    if look:
        clean["look"] = list(look)
    clean["duration_ms"] = duration
    return clean


@dataclass(frozen=True)
class KeyBinding:
    """Keyboard intent with an optional camera nudge and repeat hold."""

    keys: tuple[str, ...] = ()
    look: tuple[int, int] | None = None
    duration_ms: int = 250
    hold_ms: int = 0


@dataclass(frozen=True)
class ScreenBinding:
    """On-screen control (virtual joystick, d-pad, HUD button) as a point."""

    x: int
    y: int
    duration_ms: int = 250
    hold_ms: int = 0
    button: str = "left"


@dataclass
class InputProfile:
    """A named control scheme; ``kinds`` says which binding type each intent uses."""

    name: str
    bindings: dict[str, KeyBinding | ScreenBinding] = field(default_factory=dict)
    # Intents whose binding is on an on-screen control, resolved at run time.
    screen_intents: frozenset[str] = frozenset()

    def intents(self) -> tuple[str, ...]:
        return tuple(self.bindings)

    def action(self, intent: str, *, target=None) -> dict:
        """Produce a bridge action for ``intent``.

        ``target`` (a detected button) overrides a screen binding only when the
        profile marked that intent as screen-driven and the point is in frame.
        """
        if not isinstance(intent, str) or intent not in self.bindings:
            raise InputProfileError(f"intent {intent!r} is not in profile {self.name!r}")
        binding = self.bindings[intent]
        if isinstance(binding, ScreenBinding):
            x, y = binding.x, binding.y
            if intent in self.screen_intents and target is not None:
                x, y = target.center
            return validate_action({"click": [int(x), int(y)], "button": binding.button,
                                    "hold_ms": binding.hold_ms,
                                    "duration_ms": binding.duration_ms})
        action: dict = {"duration_ms": binding.duration_ms}
        if binding.keys:
            action["keys"] = list(binding.keys)
        if binding.look is not None:
            action["look"] = [int(binding.look[0]), int(binding.look[1])]
        if binding.hold_ms:
            action["hold_ms"] = binding.hold_ms
        return validate_action(action)


def _from_actions(intent: str, actions: dict) -> KeyBinding | None:
    """Reuse the Qwen action vocabulary so both brains press the same keys.

    ``gameplay_qwen.ACTIONS`` is the single source of truth for what an intent
    means to this project; the profile only adds what Qwen has no word for.
    """
    spec = actions.get(intent)
    if spec is None or "click" in spec:
        return None
    return KeyBinding(tuple(spec.get("keys", ())),
                      tuple(spec["look"]) if "look" in spec else None,
                      duration_ms=int(spec.get("duration_ms", 250)),
                      hold_ms=int(spec.get("hold_ms", 0)))


def keyboard_profile(name: str = "wasd-fps") -> InputProfile:
    """Desktop keyboard + mouse-look scheme used by the voxel and shooter games."""
    from gameplay_qwen import ACTIONS

    bindings: dict[str, KeyBinding] = {}
    for intent in ("FORWARD", "BACK", "STRAFELEFT", "STRAFERIGHT", "LOOKLEFT", "LOOKRIGHT",
                   "LOOKUP", "LOOKDOWN", "INVENTORY", "TABLET", "WAIT"):
        binding = _from_actions(intent, ACTIONS)
        if binding is not None:
            bindings[intent] = binding
    bindings.update({
        "SPRINT": KeyBinding(("ShiftLeft", "KeyW"), duration_ms=600),
        "JUMP": KeyBinding(("Space",)),
        "INTERACT": KeyBinding(("KeyE",), duration_ms=250),
        # Mining is a held click at the crosshair: the bridge rejects hold_ms
        # without a click, so this must stay a screen binding.
        "MINE": ScreenBinding(400, 300, duration_ms=200, hold_ms=1500),
        "EXPLORE": KeyBinding(("KeyW",), look=(30, 0), duration_ms=400),
    })
    return InputProfile(name=name, bindings=bindings)


def arrows_profile(name: str = "arrows-puzzle") -> InputProfile:
    """Arrow-key scheme for the 15-puzzle and 2048 style games."""
    from gameplay_qwen import ACTIONS

    bindings = {intent: binding for intent in ("UP", "DOWN", "LEFT", "RIGHT", "WAIT")
                if (binding := _from_actions(intent, ACTIONS)) is not None}
    bindings["SPACE"] = KeyBinding(("Space",), duration_ms=250)
    bindings["EXPLORE"] = bindings["UP"]
    return InputProfile(name=name, bindings=bindings)


def virtual_joystick_profile(name: str = "touch-dpad",
                             *, up: tuple[int, int] = (400, 470),
                             down: tuple[int, int] = (400, 550),
                             left: tuple[int, int] = (340, 510),
                             right: tuple[int, int] = (460, 510),
                             action_button: tuple[int, int] = (700, 520)) -> InputProfile:
    """Mobile-style on-screen d-pad: intents are clicks on the d-pad zones.

    Coordinates are the centres of the on-screen buttons; a profile like this is
    how the brain drives games that expose a virtual joystick instead of keys.
    """
    return InputProfile(
        name=name,
        bindings={
            "FORWARD": ScreenBinding(*up, hold_ms=0, duration_ms=350),
            "BACK": ScreenBinding(*down, duration_ms=300),
            "STRAFELEFT": ScreenBinding(*left, duration_ms=300),
            "STRAFERIGHT": ScreenBinding(*right, duration_ms=300),
            "INTERACT": ScreenBinding(*action_button, duration_ms=200),
            "EXPLORE": ScreenBinding(*up, duration_ms=350),
            "WAIT": ScreenBinding(*action_button, duration_ms=100),
        },
        # INTERACT is re-aimed at the button the perception layer actually found.
        screen_intents=frozenset({"INTERACT"}),
    )


PROFILES = {
    "keyboard": keyboard_profile,
    "arrows": arrows_profile,
    "joystick": virtual_joystick_profile,
}


def profile_from_name(name: str) -> InputProfile:
    try:
        return PROFILES[name]()
    except KeyError:
        raise InputProfileError(f"unknown profile {name!r}; choose from {sorted(PROFILES)}") from None
