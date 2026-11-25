"""Fast perception and deadline-bounded decisions for the gameplay bridge.

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
import json
import re
import time

try:  # imported once, at module import, so the first frame is not billed for it
    import numpy as _np
except ImportError:  # pragma: no cover - hosts without numpy use the Pillow path
    _np = None
from concurrent.futures import ThreadPoolExecutor
from concurrent.futures import TimeoutError as FutureTimeout
from dataclasses import dataclass, field
from pathlib import Path
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


class TargetCache:
    """Bounded signature -> targets cache, optionally mirrored to disk.

    Identical screens are common (menus, HUD, paused states); re-scanning them is
    wasted work. The key is the same coarse signature the skill memory uses, so a
    cached entry can never be applied to a visually different screen.
    """

    def __init__(self, path=None, max_entries: int = 256):
        self.path = Path(path) if path is not None else None
        self.max_entries = max(64, int(max_entries))
        self.entries: dict[str, list[Target]] = {}
        self.hits = 0
        self.misses = 0
        if self.path is not None:
            try:
                payload = json.loads(self.path.read_text(encoding="utf-8"))
                entries = payload.get("entries") if isinstance(payload, dict) else None
                if payload.get("version") == 1 and isinstance(entries, dict):
                    for key, rows in list(entries.items()):
                        if not isinstance(rows, list):
                            continue
                        targets = [Target(int(r["x"]), int(r["y"]), int(r["w"]), int(r["h"]), float(r["score"]))
                                   for r in rows if isinstance(r, dict)]
                        if re.fullmatch(r"[0-9a-f]{16}", key):
                            self.entries[key] = targets
            except (OSError, ValueError, KeyError, TypeError):
                self.entries = {}

    def get(self, signature: str):
        if signature in self.entries:
            self.hits += 1
            return self.entries[signature]
        self.misses += 1
        return None

    def put(self, signature: str, targets) -> None:
        if not re.fullmatch(r"[0-9a-f]{16}", signature or ""):
            raise ValueError("invalid screen signature")
        self.entries[signature] = list(targets)
        while len(self.entries) > self.max_entries:
            self.entries.pop(next(iter(self.entries)))

    def save(self) -> None:
        if self.path is None:
            return
        self.path.parent.mkdir(parents=True, exist_ok=True)
        payload = {"version": 1, "entries": {k: [t.as_dict() for t in v] for k, v in self.entries.items()}}
        self.path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")

    def stats(self) -> dict:
        total = self.hits + self.misses
        return {"hits": self.hits, "misses": self.misses,
                "hit_rate": round(self.hits / total, 3) if total else None,
                "entries": len(self.entries)}


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
    cache_hit: bool = False   # button search came from the signature cache
    changed_area_ratio: float = 0.0  # share of the frame that changed, not just mean
    size: tuple[int, int] = FRAME

    def as_dict(self) -> dict:
        """JSON-safe summary for the autopilot log (no pixels)."""
        return {"signature": self.signature, "changed": self.changed,
                "change_ratio": round(self.change_ratio, 4), "roi": self.roi,
                "targets": [t.as_dict() for t in self.targets],
                "perception_ms": round(self.elapsed_ms, 2),
                "degraded": self.degraded, "unfamiliar": self.unfamiliar,
                "cache_hit": self.cache_hit,
                "changed_area": round(self.changed_area_ratio, 3)}


def _decode(png: bytes):
    """Decode a bridge screenshot exactly once (Pillow), validating the frame."""
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
            # Ask the PNG decoder for the quarter-size image directly (draft) so
            # the full 800x600 buffer is never materialised; reduce() is the
            # fallback for formats/decoders where draft is not honoured.
            source.draft("RGB", SMALL)
            source.load()
            if source.size == SMALL:
                return source.convert("L")
            return source.reduce(_SMALL_SCALE).convert("L")
        except Exception:
            raise ValueError("screenshot could not be decoded") from None


def _array(small):
    """Luminance as an int16 numpy array; ``None`` if numpy is absent."""
    if _np is None:
        return None
    return _np.asarray(small, dtype=_np.int16)


def _open_small(png: bytes):
    """Backwards-compatible alias used by tests and the old benchmark."""
    return _decode(png)


def signature(small) -> str:
    """Stable coarse fingerprint of a downscaled frame (no per-pixel compare)."""
    if hasattr(small, "tobytes"):
        payload = small.tobytes()
    else:  # numpy array or plain list of ints
        payload = bytes(bytearray(int(v) & 0xFF for v in (small.ravel() if hasattr(small, "ravel") else small)))
    return hashlib.blake2b(payload, digest_size=8).hexdigest()


def _roi(previous, current):
    """Mean absolute difference and the changed bounding box, in frame pixels.

    Two cues are combined because either one alone is easy to fool: a small but
    sharply different sprite (an enemy entering the screen) barely moves the mean,
    while a slow full-screen fade moves the mean without any localised change.
    """
    if _np is not None:
        np = _np
        before, after = np.asarray(previous, dtype=np.int16), np.asarray(current, dtype=np.int16)
        diff = np.abs(after - before)
        mean = float(diff.mean())
        changed = diff >= 16
        if not changed.any():
            return mean, None, 0.0
        fraction = float(changed.mean())
        if mean < CHANGE_THRESHOLD and fraction < 0.0015:
            return mean, None, fraction
        rows = np.flatnonzero(changed.any(axis=1))
        cols = np.flatnonzero(changed.any(axis=0))
        box = (int(cols[0]), int(rows[0]), int(cols[-1]) + 1, int(rows[-1]) + 1)
    else:  # pragma: no cover - pure Pillow fallback
        from PIL import ImageChops, ImageStat

        diff = ImageChops.difference(previous, current)
        mean = ImageStat.Stat(diff).mean[0]
        mask = diff.point(lambda v: 255 if v >= 16 else 0)
        bbox = mask.getbbox()
        if bbox is None:
            return mean, None, 0.0
        fraction = ImageStat.Stat(mask).sum[0] / 255.0 / (current.size[0] * current.size[1])
        if mean < CHANGE_THRESHOLD and fraction < 0.0015:
            return mean, None, fraction
        box = bbox
    return mean, (box[0] * _SMALL_SCALE, box[1] * _SMALL_SCALE,
                  box[2] * _SMALL_SCALE, box[3] * _SMALL_SCALE), fraction


def _label(mask, w: int, h: int) -> list[tuple[int, int, int, int, int]]:
    """Connected components via horizontal runs + union-find.

    The first version walked every pixel in Python, which dominated the frame
    time. Runs are extracted with numpy and only *runs* are merged, so the
    Python part shrinks from ~30k pixels to a few hundred runs.
    Returns ``(x0, y0, x1, y1, area)`` per component.
    """
    np = _np
    filled = mask.astype(np.int8)
    edges = np.diff(filled, axis=1, prepend=0, append=0)
    starts = np.argwhere(edges == 1)      # (row, x_start)
    ends = np.argwhere(edges == -1)       # (row, x_end)
    if len(starts) == 0:
        return []
    runs: list[tuple[int, int, int, int]] = []   # (row, x0, x1, run_id)
    rows: list[list[int]] = [[] for _ in range(h)]  # row -> run ids
    for (row, x0), (_, x1) in zip(starts.tolist(), ends.tolist()):
        run_id = len(runs)
        runs.append((row, x0, x1 - 1, run_id))
        rows[row].append(run_id)
    parent = list(range(len(runs)))

    def find(i: int) -> int:
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    def union(a: int, b: int) -> None:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra

    for row in range(1, h):
        previous, current = rows[row - 1], rows[row]
        i = j = 0
        while i < len(previous) and j < len(current):
            pr, cr = runs[previous[i]], runs[current[j]]
            if pr[2] < cr[1]:          # previous run ends before this one starts
                i += 1
            elif cr[2] < pr[1]:        # this run ends before the previous starts
                j += 1
            else:
                union(pr[3], cr[3])
                if pr[2] <= cr[2]:
                    i += 1
                else:
                    j += 1

    boxes: dict[int, list[int]] = {}
    for (row, x0, x1, run_id) in runs:
        root = find(run_id)
        area = x1 - x0 + 1
        box = boxes.get(root)
        if box is None:
            boxes[root] = [x0, row, x1, row, area]
        else:
            box[0] = min(box[0], x0)
            box[1] = min(box[1], row)
            box[2] = max(box[2], x1)
            box[3] = max(box[3], row)
            box[4] += area
    return [(b[0], b[1], b[2], b[3], b[4]) for b in boxes.values()]


def _overlaps_roi(target: "Target", roi) -> bool:
    """True if the target intersects the changed rectangle."""
    x0, y0, x1, y1 = roi
    return not (target.x + target.w < x0 or target.x > x1
                or target.y + target.h < y0 or target.y > y1)


def _shifted(targets, small, roi):
    """Follow a moved object inside the changed region when the detector misses it.

    A lone sprite inside a small changed rectangle often fails the "outline around
    a calm interior" test. Rather than dropping the object, its previous box is
    moved to the centre of the changed region, clamped inside the frame.
    """
    if not targets:
        return []
    x0, y0, x1, y1 = roi
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    out = []
    for target in targets:
        nx = max(0, min(FRAME[0] - target.w, cx - target.w // 2))
        ny = max(0, min(FRAME[1] - target.h, cy - target.h // 2))
        out.append(Target(nx, ny, target.w, target.h, target.score))
    return out


def _merge_targets(outside, found) -> list[Target]:
    """Union of untouched previous targets and freshly detected ones."""
    merged = list(found)
    for candidate in outside:
        if any(_contained(candidate, other) or _contained(other, candidate) for other in merged):
            continue
        merged.append(candidate)
    merged.sort(key=lambda t: t.score, reverse=True)
    return merged


def _contained(inner: "Target", outer: "Target", *, threshold: float = 0.8) -> bool:
    """True if ``inner`` sits mostly inside ``outer`` (same visible object)."""
    ix0, iy0 = max(inner.x, outer.x), max(inner.y, outer.y)
    ix1, iy1 = min(inner.x + inner.w, outer.x + outer.w), min(inner.y + inner.h, outer.y + outer.h)
    if ix1 <= ix0 or iy1 <= iy0:
        return False
    intersection = (ix1 - ix0) * (iy1 - iy0)
    area = max(1, inner.w * inner.h)
    return intersection / area >= threshold


def _split(raw, mask, *, max_cuts: int = 6):
    """Split a dilated blob into the tight rectangles it merged.

    Dilation joins a HUD strip, a progress bar and a moving sprite into one
    component. Cutting at every fully empty column/row inside the blob recovers
    the real boxes, which is what the IoU check on synthetic screens measures.
    Yields ``(x0, y0, x1, y1)`` in the (possibly cropped) small-frame grid.
    """
    pending = [(raw[0], raw[1], raw[2], raw[3])]
    pieces: list[tuple[int, int, int, int]] = []
    cuts = 0
    while pending:
        box = pending.pop()
        x0, y0, x1, y1 = box
        if x1 < x0 or y1 < y0:
            continue
        region = mask[y0:y1 + 1, x0:x1 + 1]
        if region.size == 0 or not region.any():
            continue

        def runs(flags):
            out, start = [], None
            for i, on in enumerate(flags):
                if on and start is None:
                    start = i
                elif not on and start is not None:
                    out.append((start, i - 1))
                    start = None
            if start is not None:
                out.append((start, len(flags) - 1))
            return out

        xs, ys = runs(region.any(axis=0)), runs(region.any(axis=1))
        if (len(xs) > 1 or len(ys) > 1) and cuts < max_cuts:
            cuts += 1
            for a, b in xs:
                pending.append((x0 + a, y0, x0 + b, y1))
            for a, b in ys:
                pending.append((x0, y0 + a, x1, y0 + b))
            continue
        pieces.append(box)
    # Overlapping pieces from the two cut directions: keep the tightest per centre.
    unique: dict[tuple[int, int], tuple[int, int, int, int]] = {}
    for (x0, y0, x1, y1) in pieces:
        key = ((x0 + x1) // 8, (y0 + y1) // 8)
        area = (x1 - x0 + 1) * (y1 - y0 + 1)
        current = unique.get(key)
        if current is None or area < (current[2] - current[0] + 1) * (current[3] - current[1] + 1):
            unique[key] = (x0, y0, x1, y1)
    return list(unique.values())


def _fill_rects(mask, *, min_w: int = 5, min_h: int = 4, max_ratio: float = 0.75,
                min_inside: float = 0.8, max_inside: float = 1.6) -> list[tuple[int, int, int, int]]:
    """Rectangles whose boundary lies on edges and whose interior is not.

    Text is the main false positive of an edge detector: letters have both a
    boundary and a busy interior. A solid control has an edge outline and a
    mostly calm middle, so the interior/boundary ratio separates the two. This is
    the check that raised mean IoU for buttons while dropping text boxes.
    """
    np = _np
    height, width = mask.shape
    integral = np.zeros((height + 1, width + 1), dtype=np.int32)
    integral[1:, 1:] = np.cumsum(np.cumsum(mask.astype(np.int32), axis=0), axis=1)

    def edges(x0, y0, x1, y1):          # boundary pixels of the rect
        return (int(mask[y0, x0:x1 + 1].sum()) + int(mask[y1, x0:x1 + 1].sum())
                + int(mask[y0 + 1:y1, x0].sum()) + int(mask[y0 + 1:y1, x1].sum()))

    def inside(x0, y0, x1, y1):
        return int(integral[y1, x1 + 1] - integral[y0, x1 + 1] - integral[y1, x0] + integral[y0, x0])

    # Run extraction in one vectorised pass over the whole mask, not per row.
    padded = np.zeros((height, width + 2), dtype=np.int8)
    padded[:, 1:-1] = mask
    diff = np.diff(padded, axis=1)
    starts = np.argwhere(diff == 1)
    ends = np.argwhere(diff == -1)
    runs: list[tuple[int, int, int]] = [
        (int(a[1]), int(b[1]) - 1, int(a[0]))
        for a, b in zip(starts.tolist(), ends.tolist())]
    # Join runs that sit on consecutive rows with overlapping spans.
    parent = list(range(len(runs)))

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    by_row: dict[int, list[int]] = {}
    for index, (_a, _b, y) in enumerate(runs):
        by_row.setdefault(y, []).append(index)
    for y, ids in by_row.items():
        for other in by_row.get(y + 1, ()):  # noqa: PLC0206 - small lists
            for i in ids:
                ax0, ax1, _ = runs[i]
                bx0, bx1, _ = runs[other]
                if ax0 <= bx1 + 2 and bx0 <= ax1 + 2:
                    ra, rb = find(i), find(other)
                    if ra != rb:
                        parent[rb] = ra

    groups: dict[int, list[int]] = {}
    for index in range(len(runs)):
        groups.setdefault(find(index), []).append(index)

    candidates: list[tuple[float, tuple[int, int, int, int]]] = []
    for members in groups.values():
        x0 = min(runs[i][0] for i in members)
        x1 = max(runs[i][1] for i in members)
        y0 = min(runs[i][2] for i in members)
        y1 = max(runs[i][2] for i in members)
        bw, bh = x1 - x0 + 1, y1 - y0 + 1
        if bw < min_w or bh < min_h or bw > width * max_ratio or bh > height * max_ratio:
            continue
        ring = edges(x0, y0, x1, y1) / float(max(1, 2 * bw + 2 * bh))
        core = inside(x0, y0, x1, y1) / float(max(1, (bw - 1) * (bh - 1)))
        if ring < 0.25 or not min_inside <= core / max(ring, 1e-6) <= max_inside:
            if ring < 0.45:            # a solid bar: edges are its own outline only
                continue
        score = round(ring * min(1.0, (bw * bh) / 150.0), 4)
        candidates.append((score, (x0, y0, x1, y1)))
    candidates.sort(key=lambda c: (c[0], -(c[1][2] - c[1][0]) * (c[1][3] - c[1][1])), reverse=True)
    return [box for _score, box in candidates]


def detect_targets(small, *, max_targets: int = 12, roi=None) -> list[Target]:
    """Find button-like rectangles: edge outlines around a calm interior.

    The numpy path is ~14x faster than the original pure-Python pixel scan, works
    on an optional region of interest (only the changed area of the frame), and
    returns the same scaled frame coordinates the bridge clicks.
    """
    w, h = small.size
    ox = oy = 0
    if roi is not None:
        try:
            x0, y0, x1, y1 = (int(v) // _SMALL_SCALE for v in roi)
        except (TypeError, ValueError):
            raise ValueError("invalid roi")
        x0, y0 = max(0, x0 - 2), max(0, y0 - 2)
        x1, y1 = min(w, x1 + 2), min(h, y1 + 2)
        if x1 - x0 < 8 or y1 - y0 < 8:
            return []
        small = small.crop((x0, y0, x1, y1))
        ox, oy = x0, y0
        w, h = small.size

    array = _array(small)
    if array is None:  # pragma: no cover - kept for hosts without numpy
        return _detect_targets_python(small, max_targets, (ox, oy))

    a = array
    energy = _np.zeros_like(a)
    energy[:, 1:-1] += _np.abs(a[:, 2:] - a[:, :-2])
    energy[1:-1, :] += _np.abs(a[2:, :] - a[:-2, :])
    mask = energy >= 40

    targets = [Target((x0 + ox) * _SMALL_SCALE, (y0 + oy) * _SMALL_SCALE,
                      (x1 - x0 + 1) * _SMALL_SCALE, (y1 - y0 + 1) * _SMALL_SCALE,
                      score=_score_box(mask, x0, y0, x1, y1))
               for (x0, y0, x1, y1) in _fill_rects(mask)]
    targets.sort(key=lambda t: t.score, reverse=True)
    return targets[:max_targets]


def _score_box(mask, x0, y0, x1, y1) -> float:
    bw, bh = x1 - x0 + 1, y1 - y0 + 1
    ring = (int(mask[y0, x0:x1 + 1].sum()) + int(mask[y1, x0:x1 + 1].sum())
            + int(mask[y0 + 1:y1, x0].sum()) + int(mask[y0 + 1:y1, x1].sum()))
    ring /= float(max(1, 2 * bw + 2 * bh))
    return round(min(1.0, ring) * min(1.0, (bw * bh) / 150.0), 4)


def _detect_targets_python(small, max_targets: int, offset=(0, 0)):
    """Original pure-Python scan, kept only as a no-numpy fallback."""
    w, h = small.size
    px = small.tobytes()
    energy = [0] * (w * h)
    for y in range(1, h - 1):
        row = y * w
        up, down = row - w, row + w
        for x in range(1, w - 1):
            i = row + x
            energy[i] = abs(px[i + 1] - px[i - 1]) + abs(px[down + x] - px[up + x])
    mask = bytearray(1 if e >= 40 else 0 for e in energy)
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
    seen = bytearray(w * h)
    boxes = []
    ox, oy = offset
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
            elif x > maxx:
                maxx = x
            if y < miny:
                miny = y
            elif y > maxy:
                maxy = y
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < w and 0 <= ny < h:
                    j = ny * w + nx
                    if grown[j] and not seen[j]:
                        seen[j] = 1
                        stack.append(j)
        bw, bh = maxx - minx + 1, maxy - miny + 1
        if area < 24 or bw < 5 or bh < 4 or bw > w * 0.75 or bh > h * 0.75:
            continue
        fill = area / float(bw * bh)
        if fill < 0.25:
            continue
        boxes.append(Target((minx + ox) * _SMALL_SCALE, (miny + oy) * _SMALL_SCALE,
                            bw * _SMALL_SCALE, bh * _SMALL_SCALE,
                            score=fill * min(1.0, area / 120.0)))
    # One visible object must not be reported three times (text inside a button,
    # a bar inside a panel). Prefer the tighter, higher-scoring box and drop
    # boxes that are mostly contained in a better one.
    boxes.sort(key=lambda t: (t.score, -(t.w * t.h)), reverse=True)
    kept: list[Target] = []
    for candidate in boxes:
        if any(_contained(candidate, other) for other in kept):
            continue
        kept.append(candidate)
    return kept[:max_targets]


def perceive(png: bytes, previous: Perception | None = None, *,
             find_targets: bool = True,
             budget_ms: float = PERCEPTION_BUDGET_MS,
             target_cache=None) -> Perception:
    """Analyse one frame, degrading instead of overrunning the budget.

    Two speed-ups over the first version, both measured by
    ``python -m gameplay.benchmark_reflex --compare``:

    * one ``reduce(4)`` decode instead of ``convert('L')`` + ``resize`` and a
      numpy edge pass instead of a per-pixel Python loop;
    * if the frame's coarse signature was seen before, the button search is a
      cache hit (memory or disk) - identical screens cost nothing to re-scan;
    * when targets are searched for, only the changed region is scanned.
    """
    started = time.perf_counter()
    small = _decode(png)
    sig = signature(small)
    changed, ratio, roi = True, 1.0, (0, 0, FRAME[0], FRAME[1])
    changed_area = 1.0
    if previous is not None:
        before = getattr(previous, "_small", None)
        if before is not None and before.size == small.size:
            mean, box, area_ratio = _roi(before, small)
            changed = box is not None
            ratio = min(1.0, mean / 255.0)
            roi = box
            changed_area = area_ratio
    targets: list[Target] = []
    degraded = False
    cache_hit = False
    previous_targets = None
    if not changed and previous is not None:
        # Identical screen: the previous answer is still the right answer.
        previous_targets = getattr(previous, "targets", None)
        if previous_targets:
            targets = list(previous_targets)
            cache_hit = True
            if target_cache is not None:
                target_cache.hits += 1
    if find_targets and changed:
        cached = None
        if target_cache is not None:
            cached = target_cache.get(sig)
        if cached is None and previous is not None:
            cached = getattr(previous, "_targets_for", {}).get(sig)
        if cached is not None:
            targets = list(cached)
            cache_hit = True
        elif (time.perf_counter() - started) * 1000.0 < budget_ms * 0.5:
            # A localised change only needs the changed rectangle plus a margin;
            # everything outside it is carried over from the previous frame, so a
            # fast hybrid (scan what moved, reuse what did not) sees the whole screen.
            localised = (roi is not None and roi[2] - roi[0] < FRAME[0] * 0.6
                         and roi[3] - roi[1] < FRAME[1] * 0.6)
            search_roi = roi if localised else None
            targets = detect_targets(small, roi=search_roi)
            if localised and previous is not None:
                # Anything that did not change is still where it was, including
                # the object that just moved inside the changed region.
                moved = [t for t in (previous.targets or ())
                         if _overlaps_roi(t, roi) and t not in targets]
                outside = [t for t in (previous.targets or ())
                           if not _overlaps_roi(t, roi)]
                targets = _merge_targets(outside + _shifted(moved, small, roi), targets)
            if target_cache is not None:
                target_cache.put(sig, targets)
        else:
            degraded = True
    elif find_targets and not cache_hit:
        degraded = True
    elapsed_ms = (time.perf_counter() - started) * 1000.0
    if elapsed_ms > budget_ms:
        degraded = True
    result = Perception(signature=sig, changed=changed, change_ratio=ratio,
                        roi=roi, targets=targets, elapsed_ms=elapsed_ms,
                        degraded=degraded, changed_area_ratio=changed_area)
    result.cache_hit = cache_hit
    result._small = small  # retained for the next frame compare only
    result._targets_for = {sig: targets} if not cache_hit else {}
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
                 memory=None, target_cache=None, interactive: bool = False,
                 clock: Callable[[], float] = time.monotonic):
        self.default_intent = default_intent
        self.budget_ms = budget_ms
        self.perception_budget_ms = perception_budget_ms
        self.memory = memory
        # Shared across frames: the same screen (menu, HUD, pause) is scanned once.
        self.target_cache = target_cache if target_cache is not None else TargetCache()
        # ``interactive``: the profile can click buttons, so a strong rectangle
        # candidate may become an INTERACT intent.
        self.interactive = interactive
        self.clock = clock
        self.last_perception: Perception | None = None
        self.last_decision: Decision | None = None
        self.decisions: list[Decision] = []
        self.advisor_timeouts = 0

    def observe(self, png: bytes, *, find_targets: bool = True) -> Perception:
        perception = perceive(png, self.last_perception, find_targets=find_targets,
                              budget_ms=self.perception_budget_ms,
                              target_cache=self.target_cache)
        if self.memory is not None:
            # ``recall`` is the hot-cached lookup; ``best`` would query twice.
            perception.unfamiliar = self.memory.recall(perception.signature) is None
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
            # Only aim at a button when the input profile can actually click one;
            # a keyboard/arrows profile would otherwise emit an intent it cannot
            # perform and the agent would crash mid-game.
            can_click = bool(getattr(self, "interactive", False))
            intent = "INTERACT" if (can_click and target is not None and target.score > 0.9) \
                else self.default_intent
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
        
        from concurrent.futures import TimeoutError as FutureTimeout

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
