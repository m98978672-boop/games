"""Track a moving object between frames and predict where to aim.

The edge detector finds *shapes*; a moving sprite is a shape that persists. This
tracker keeps the blobs it saw, matches them frame to frame by predicted position
(so a sprite overtaking another is not swapped), and reports velocity, direction
and a lead time for aiming.

Everything is integer arithmetic over the target list - no model, no pixels. It
is the piece that turns "there is a rectangle at (400, 300)" into "it is moving
left at 60 px/s, click 120 px to the left if you want to hit it".
"""
from __future__ import annotations

import time
from dataclasses import dataclass, field

DIRECTIONS = ("up", "down", "left", "right", "stationary")


@dataclass
class Track:
    """One object followed across frames."""

    id: int
    x: float
    y: float
    w: int
    h: int
    vx: float = 0.0
    vy: float = 0.0
    seen: int = 1
    missed: int = 0
    first_seen: float = field(default_factory=time.monotonic)
    last_seen: float = field(default_factory=time.monotonic)

    @property
    def center(self) -> tuple[float, float]:
        return self.x + self.w / 2.0, self.y + self.h / 2.0

    @property
    def direction(self) -> str:
        if abs(self.vx) < 8 and abs(self.vy) < 8:
            return "stationary"
        if abs(self.vx) >= abs(self.vy):
            return "right" if self.vx > 0 else "left"
        return "down" if self.vy > 0 else "up"

    def lead(self, seconds: float) -> tuple[int, int]:
        """Where to click to intercept an object moving at its current velocity."""
        cx, cy = self.center
        return int(round(cx + self.vx * seconds)), int(round(cy + self.vy * seconds))

    def as_dict(self) -> dict:
        return {"id": self.id, "x": round(self.x, 1), "y": round(self.y, 1),
                "w": self.w, "h": self.h, "vx": round(self.vx, 1), "vy": round(self.vy, 1),
                "direction": self.direction, "seen": self.seen, "missed": self.missed}

    def prompt_line(self) -> str:
        cx, cy = self.center
        return (f"track#{self.id} at ({int(cx)},{int(cy)}) moving {self.direction} "
                f"({self.vx:+.0f},{self.vy:+.0f}) px/s")


class Tracker:
    """Predicted-position matching; bounded tracks, no external dependencies."""

    def __init__(self, *, max_distance: float = 90.0, max_missed: int = 3,
                 max_tracks: int = 16, min_seen: int = 2):
        self.max_distance = max_distance
        self.max_missed = max_missed
        self.max_tracks = max_tracks
        self.min_seen = min_seen
        self.tracks: list[Track] = []
        self._next_id = 1
        self.matches = 0
        self.misses = 0

    def reset_session(self) -> None:
        self.tracks.clear()
        self._next_id = 1
        self.matches = 0
        self.misses = 0

    # -- update -----------------------------------------------------------
    def update(self, targets, *, now: float | None = None) -> list[Track]:
        """Feed one frame's targets; returns tracks with enough history."""
        now = time.monotonic() if now is None else now
        candidates = []
        for target in targets or ():
            try:
                candidates.append((float(target.x), float(target.y), int(target.w), int(target.h)))
            except AttributeError:
                raise ValueError("targets must expose x, y, w, h") from None
        unmatched_tracks = list(self.tracks)
        unmatched_targets = list(candidates)

        # Greedy matching by distance to the *predicted* centre, closest first.
        pairs = []
        for track in unmatched_tracks:
            px, py = track.center[0] + track.vx * (now - track.last_seen), \
                track.center[1] + track.vy * (now - track.last_seen)
            for index, (x, y, w, h) in enumerate(unmatched_targets):
                cx, cy = x + w / 2.0, y + h / 2.0
                distance = ((cx - px) ** 2 + (cy - py) ** 2) ** 0.5
                if distance <= self.max_distance:
                    pairs.append((distance, track.id, index))
        pairs.sort()
        used_tracks, used_targets = set(), set()
        for _distance, track_id, index in pairs:
            if track_id in used_tracks or index in used_targets:
                continue
            used_tracks.add(track_id)
            used_targets.add(index)
            track = next(t for t in self.tracks if t.id == track_id)
            x, y, w, h = unmatched_targets[index]
            cx, cy = x + w / 2.0, y + h / 2.0
            elapsed = max(1e-3, now - track.last_seen)
            old_center = track.center
            # Exponential smoothing keeps one noisy frame from reversing direction.
            track.vx = 0.6 * track.vx + 0.4 * ((cx - old_center[0]) / elapsed)
            track.vy = 0.6 * track.vy + 0.4 * ((cy - old_center[1]) / elapsed)
            track.x, track.y, track.w, track.h = x, y, w, h
            track.seen += 1
            track.missed = 0
            track.last_seen = now
            self.matches += 1

        for track in self.tracks:
            if track.id not in used_tracks:
                track.missed += 1
                self.misses += 1
        self.tracks = [t for t in self.tracks if t.missed <= self.max_missed]

        for index, (x, y, w, h) in enumerate(unmatched_targets):
            if index in used_targets:
                continue
            if len(self.tracks) >= self.max_tracks:
                break
            self.tracks.append(Track(self._next_id, x, y, w, h, last_seen=now, first_seen=now))
            self._next_id += 1
        return self.confirmed()

    def confirmed(self) -> list[Track]:
        """Tracks seen at least ``min_seen`` times - a flicker is not an object."""
        return [t for t in self.tracks if t.seen >= self.min_seen and t.missed == 0]

    def best_target(self):
        """Largest confirmed track, which is usually the thing to interact with."""
        confirmed = self.confirmed()
        if not confirmed:
            return None
        return max(confirmed, key=lambda t: (t.w * t.h, t.seen))

    def summary(self) -> dict:
        return {"tracks": len(self.tracks), "confirmed": len(self.confirmed()),
                "matches": self.matches, "misses": self.misses}


def describe(tracks) -> str:
    """One bounded line for a slow advisor's prompt."""
    lines = [t.prompt_line() for t in (tracks or [])[:3]]
    return '; '.join(lines) if lines else 'no persistent objects'
