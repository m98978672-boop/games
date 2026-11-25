"""Turn a long, boring gameplay recording into a short one — honestly.

The bot plays for minutes; a Shorts viewer gives it seconds. This module decides
**what to keep**, then cuts it with FFmpeg:

* **Highlights come from measured events**, not from taste: a frame where the bot
  reached its goal, where the screen changed, where a target was tracked, or where
  the director actually said something. Each event carries the fact it came from.
* **Candidate windows come from events**, not audio silence detection. Parts of
  the recording outside the selected windows are removed to meet a length budget.
* **Nothing is faked**: no sped-up footage passed off as real time, no reordering
  that invents a sequence that never happened (clips keep their original order),
  and the report states exactly which seconds were removed.

Two entry points split the work so the decision can be tested without FFmpeg:

* :func:`plan_montage` — pure decision, returns keeps and cuts with reasons;
* :func:`render_montage` — runs ``ffmpeg`` per keep and concatenates, then checks
  the result's duration and refuses to hand back a broken file.
"""
from __future__ import annotations

import argparse
import json
import math
import re
import subprocess
import tempfile
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable, Sequence

MIN_CLIP = 1.0            # anything shorter is a flash, not a clip
MAX_KEEP_SECONDS = 59.0   # a Short is under a minute
PRE_ROLL = 1.2            # lead-in so a reaction is visible, not just the frame
POST_ROLL = 0.8           # hold after the event so the viewer sees the result

# Heuristic editorial priorities, not measured quality or viewer preference.
# Clips are ranked by the sum of the weights of the events they contain.
KIND_WEIGHT = {"goal": 4.0, "speech": 2.0, "chapter": 2.0, "change": 0.5, "track": 0.1}


def event_weight(kind: str) -> float:
    """How strong a piece of evidence is; unknown kinds are worth nothing."""
    return KIND_WEIGHT.get(kind, 0.0)


def keep_strength(keep: "Keep") -> float:
    """Sum of the measured evidence inside a clip, so clips can be ranked."""
    return round(sum(event_weight(event.kind) for event in keep.events), 3)


class MontageError(ValueError):
    """The montage cannot be built honestly from what was measured."""


@dataclass(frozen=True)
class Event:
    """Something worth keeping, with the measurement that justifies it."""

    seconds: float
    kind: str           # goal | change | speech | track | chapter
    detail: str = ""

    def __post_init__(self):
        if not math.isfinite(self.seconds) or self.seconds < 0:
            raise MontageError("event time must be a finite non-negative number")
        if self.kind not in ("goal", "change", "speech", "track", "chapter"):
            raise MontageError("unknown event kind")
        if len(self.detail) > 200:
            raise MontageError("event detail is too long")

    def as_dict(self) -> dict:
        return {"seconds": round(self.seconds, 2), "kind": self.kind, "detail": self.detail}


@dataclass(frozen=True)
class Keep:
    start: float
    end: float
    reason: str
    events: tuple[Event, ...] = ()

    @property
    def seconds(self) -> float:
        return self.end - self.start

    def as_dict(self) -> dict:
        return {"start": round(self.start, 2), "end": round(self.end, 2),
                "seconds": round(self.seconds, 2), "reason": self.reason,
                "strength": keep_strength(self),
                "events": [event.as_dict() for event in self.events]}


@dataclass
class MontagePlan:
    duration: float
    target_seconds: float
    keeps: list[Keep] = field(default_factory=list)
    cuts: list[dict] = field(default_factory=list)

    @property
    def kept_seconds(self) -> float:
        return sum(keep.seconds for keep in self.keeps)

    @property
    def speed_up(self) -> float:
        return round(self.duration / self.kept_seconds, 2) if self.kept_seconds else 0.0

    def summary(self) -> dict:
        return {
            "schema": 1,
            # Total measured evidence kept, so two cuts can be compared honestly.
            "strength": round(sum(keep_strength(keep) for keep in self.keeps), 3),
            "source_seconds": round(self.duration, 2),
            "target_seconds": round(self.target_seconds, 2),
            "kept_seconds": round(self.kept_seconds, 2),
            "compression": self.speed_up,
            "clips": len(self.keeps),
            "keeps": [keep.as_dict() for keep in self.keeps],
            "cuts": list(self.cuts),
            "real_time": True,        # nothing is sped up or slowed down
            "reordered": False,       # clips keep the original order
            "published": False,
        }


def _field(item, name: str, default=None):
    """Read a field from an object *or* from its saved ``.summary()`` dictionary.

    ``stream_run.write_artifacts`` saves the summary, not the report object, so the
    montage has to be able to read what is actually on disk as well as the object.
    """
    if isinstance(item, dict):
        return item.get(name, default)
    return getattr(item, name, default)


def events_from_run(report, *, director=None) -> list[Event]:
    """Collect highlight candidates from a stream run / agent log.

    ``report`` is a :class:`stream_run.RunReport`, its saved ``report.json``
    dictionary, or anything with ``lines``, ``frame_offsets`` and ``director``.
    Only measured facts become events.
    """
    events: list[Event] = []
    for line in _field(report, "lines") or []:
        offset = _field(line, "offset_seconds", _field(line, "offset"))
        text = str(_field(line, "text", "") or "")
        if offset is None:
            continue
        events.append(Event(float(offset), "speech", text[:120]))
    director = director or _field(report, "director")
    if director is not None:
        for line in _field(director, "history") or []:
            if _field(line, "basis") == "observed":
                evidence = _field(line, "evidence") or ()
                offset = _field(line, "offset_seconds", _field(line, "offset"))
                if offset is None:
                    continue
                events.append(Event(float(offset), "change",
                                    "измерено: " + ", ".join(str(item) for item in evidence)))
        stats = _field(director, "stats")
        if stats is not None and (_field(stats, "lines_spoken", 0) or 0):
            events.append(Event(0.0, "chapter", "начало эфира"))
    for offset in _field(report, "frame_offsets") or []:
        if isinstance(offset, (int, float)) and offset >= 0:
            events.append(Event(float(offset), "track", "кадр измерен"))
    return _dedupe(events)


def events_from_frames(frames: Iterable, *, goal_reached=None) -> list[Event]:
    """Same idea for a plain frame feed: ``(offset, facts, hit)`` triples."""
    events: list[Event] = []
    for item in frames:
        offset, facts, hit = item
        if hit:
            events.append(Event(float(offset), "goal",
                                f"targets={facts.get('targets')} kind={facts.get('kind')}"))
        elif facts.get("changed"):
            events.append(Event(float(offset), "change", f"kind={facts.get('kind')}"))
    return _dedupe(events)


def _dedupe(events: Sequence[Event]) -> list[Event]:
    seen = set()
    out = []
    for event in sorted(events, key=lambda e: e.seconds):
        key = (round(event.seconds, 1), event.kind)
        if key in seen:
            continue
        seen.add(key)
        out.append(event)
    return out


def plan_montage(duration: float, events: Sequence[Event], *,
                 target_seconds: float = MAX_KEEP_SECONDS,
                 min_gap: float = 0.6) -> MontagePlan:
    """Choose the clips to keep. Pure function: no files, no FFmpeg.

    Rules, in order:
    1. goal, speech and chapter events form candidate clips;
    2. change/track events only extend a clip, they never create one alone;
    3. clips merge when they overlap or are closer than ``min_gap``;
    4. if the clips exceed the budget, drop the lowest-weight clips first;
       if one long clip remains, select a window maximizing retained weight.
       Dropped events are not claimed as retained in the report.
    """
    if not math.isfinite(duration) or duration <= 0:
        raise MontageError("source duration must be finite and positive")
    if not 1.0 <= target_seconds <= MAX_KEEP_SECONDS:
        raise MontageError(f"target length must be 1–{MAX_KEEP_SECONDS:.0f} seconds")
    if not math.isfinite(min_gap) or min_gap < 0:
        raise MontageError("min_gap must be finite and non-negative")

    # A timestamp at the exclusive end of the recording cannot be shown.
    relevant = [event for event in events if 0 <= event.seconds < duration]
    spine = [event for event in relevant if event.kind in ("goal", "speech", "chapter")]
    if not spine:
        raise MontageError("nothing measured to keep: the recording has no goals or speech")

    spans: list[tuple[float, float, list[Event]]] = []
    for event in spine:
        start = max(0.0, event.seconds - PRE_ROLL)
        end = min(duration, event.seconds + POST_ROLL)
        spans.append((start, end, [event]))
    # Nearby changes extend the clip they belong to, instead of adding one.
    for event in relevant:
        if event.kind in ("goal", "speech", "chapter"):
            continue
        for index, (start, end, members) in enumerate(spans):
            if start - min_gap <= event.seconds <= end + min_gap:
                spans[index] = (min(start, max(0.0, event.seconds - PRE_ROLL)),
                                max(end, min(duration, event.seconds + POST_ROLL)),
                                members + [event])
                break

    spans.sort(key=lambda item: item[0])
    merged: list[tuple[float, float, list[Event]]] = []
    for start, end, members in spans:
        if merged and start <= merged[-1][1] + min_gap:
            prev_start, prev_end, prev_members = merged[-1]
            merged[-1] = (prev_start, max(prev_end, end), prev_members + members)
        else:
            merged.append((start, end, members))

    keeps = [Keep(start, end, _reason(members), tuple(sorted(members, key=lambda e: e.seconds)))
             for start, end, members in merged if end - start >= MIN_CLIP]
    if not keeps:
        raise MontageError("every measured moment was shorter than one second")

    cuts: list[dict] = []
    # Which clips survive is decided by the evidence they carry, not by where they
    # happen to sit in the recording: trimming from the top would throw away the
    # best moment of a long run simply for being late.
    while sum(keep.seconds for keep in keeps) > target_seconds and len(keeps) > 1:
        weakest = min(range(len(keeps)),
                      key=lambda i: (keep_strength(keeps[i]), -keeps[i].start, keeps[i].seconds))
        removed = keeps.pop(weakest)
        cuts.append({"start": round(removed.start, 2), "end": round(removed.end, 2),
                     "reason": "не помещается в целевую длину",
                     "weight": keep_strength(removed), "events": len(removed.events)})

    if sum(keep.seconds for keep in keeps) > target_seconds:
        # The loop above leaves one oversized clip. Choose the contiguous window
        # with the highest retained score instead of blindly cutting its tail.
        keep = keeps[0]
        length = target_seconds
        latest_start = keep.end - length
        candidates = {keep.start, latest_start}
        for event in keep.events:
            # Half-open intervals: an event exactly at the end is not shown.
            for point in (event.seconds, event.seconds - length + 0.01):
                candidates.add(min(latest_start, max(keep.start, point)))

        def window(start: float) -> tuple[Event, ...]:
            return tuple(e for e in keep.events if start <= e.seconds < start + length)

        def score(start: float) -> tuple[float, int, float]:
            members = window(start)
            return (sum(event_weight(e.kind) for e in members),
                    sum(e.kind == "goal" for e in members), -start)

        new_start = max(candidates, key=score)
        new_end = new_start + length
        members = window(new_start)
        if not any(e.kind in ("goal", "speech", "chapter") for e in members):
            raise MontageError("no measured moment fits the target length")
        for start, end in ((keep.start, new_start), (new_end, keep.end)):
            if end > start:
                omitted = tuple(e for e in keep.events if start <= e.seconds < end)
                cuts.append({"start": round(start, 2), "end": round(end, 2),
                             "reason": "подрезан клип, чтобы уложиться в длину",
                             "weight": round(sum(event_weight(e.kind) for e in omitted), 3),
                             "events": len(omitted)})
        keeps[0] = Keep(new_start, new_end, _reason(members), members)

    keeps.sort(key=lambda keep: keep.start)
    plan = MontagePlan(duration=float(duration), target_seconds=float(target_seconds),
                       keeps=keeps, cuts=sorted(cuts, key=lambda cut: cut["start"]))
    if plan.kept_seconds <= 0:
        raise MontageError("the plan keeps nothing")
    return plan


def _reason(events: Sequence[Event]) -> str:
    kinds = {event.kind for event in events}
    if "goal" in kinds:
        return "цель достигнута"
    if "speech" in kinds:
        return "есть реплика в эфире"
    if "chapter" in kinds:
        return "начало эпизода"
    return "измеренное изменение"


def ffmpeg_binary() -> str | None:
    """Path to ffmpeg: system install, or the copy bundled with imageio-ffmpeg.

    CI runners install ffmpeg with apt; a sandbox may have neither, so the wheel
    fallback keeps the real encoder reachable instead of silently skipping the test.
    """
    import shutil
    found = shutil.which("ffmpeg")
    if found:
        return found
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:  # noqa: BLE001 - optional dependency
        return None


def ffmpeg_available() -> bool:
    return ffmpeg_binary() is not None


def probe_duration(path: Path) -> float:
    """Read duration without ffprobe: ``ffmpeg -i`` prints it on stderr.

    One binary instead of two, which is one fewer thing to be missing on a runner.
    """
    binary = ffmpeg_binary()
    if binary is None:
        raise MontageError("ffmpeg is not installed")
    try:
        result = subprocess.run([binary, "-hide_banner", "-i", str(path)],
                                capture_output=True, text=True, timeout=120)
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise MontageError(f"ffmpeg could not inspect the recording: {exc}") from exc
    text = result.stderr or ""
    match = re.search(r"Duration:\s*(\d+):(\d{2}):(\d{2}\.\d+)", text)
    if not match:
        raise MontageError("cannot read the clip duration")
    hours, minutes, seconds = int(match.group(1)), int(match.group(2)), float(match.group(3))
    value = hours * 3600 + minutes * 60 + seconds
    if not math.isfinite(value) or value <= 0:
        raise MontageError("clip duration is not usable")
    return value


def render_montage(source: Path, plan: MontagePlan, destination: Path, *,
                   crf: int = 20, preset: str = "veryfast") -> dict:
    """Cut the keeps and concatenate them. Refuses to return a broken file.

    The output is written to a temporary directory first and moved into place, so
    an interrupted run never leaves a half-montage that looks finished.
    """
    source, destination = Path(source), Path(destination)
    if source.is_symlink() or not source.is_file():
        raise MontageError("source must be an existing regular file")
    report_path = destination.with_suffix(".montage.json")
    if report_path == destination:
        raise MontageError("destination must differ from its report")
    if destination.exists() or destination.is_symlink():
        raise MontageError("destination already exists")
    if report_path.exists() or report_path.is_symlink():
        raise MontageError("montage report already exists")
    if not destination.parent.is_dir():
        raise MontageError("destination directory must exist")
    binary = ffmpeg_binary()
    if binary is None:
        raise MontageError("ffmpeg is not installed")
    if not 0 <= crf <= 40:
        raise MontageError("crf must be 0–40")
    if not plan.keeps:
        raise MontageError("the plan has no clips")
    for index, keep in enumerate(plan.keeps):
        if (not math.isfinite(keep.start) or not math.isfinite(keep.end)
                or keep.start < 0 or keep.end > plan.duration or keep.end <= keep.start
                or (index and keep.start < plan.keeps[index - 1].end)
                or any(not keep.start <= event.seconds < keep.end for event in keep.events)):
            raise MontageError("invalid clip bounds, order or events")

    def encode(command):
        try:
            subprocess.run(command, check=True, timeout=3600, capture_output=True, text=True)
        except subprocess.CalledProcessError as exc:
            raise MontageError(f"ffmpeg failed: {(exc.stderr or str(exc))[-500:]}") from exc
        except (OSError, subprocess.TimeoutExpired) as exc:
            raise MontageError(f"ffmpeg could not render: {exc}") from exc

    with tempfile.TemporaryDirectory(prefix=".montage-", dir=destination.parent) as temp:
        tmp = Path(temp)
        pieces = []
        for index, keep in enumerate(plan.keeps, 1):
            piece = tmp / f"clip-{index:02d}.mp4"
            encode([
                binary, "-nostdin", "-v", "error", "-n",
                "-ss", f"{keep.start:.3f}", "-i", str(source), "-t", f"{keep.seconds:.3f}",
                "-map", "0:v:0", "-map", "0:a?",
                "-c:v", "libx264", "-preset", preset, "-crf", str(crf), "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "128k", "-ar", "48000",
                str(piece)])
            actual = probe_duration(piece)
            if abs(actual - keep.seconds) > 0.5:
                raise MontageError(f"clip {index} came out {actual:.2f}s instead of {keep.seconds:.2f}s")
            pieces.append(piece)
        listing = tmp / "clips.txt"
        listing.write_text("".join(f"file '{piece.name}'\n" for piece in pieces), encoding="utf-8")
        joined = tmp / "montage.mp4"
        # Re-encode on join: stream copying different cuts of the same source can
        # drift, and a drifting montage is a lie about timing.
        encode([binary, "-nostdin", "-v", "error", "-n", "-f", "concat", "-safe", "0",
                        "-i", str(listing), "-c:v", "libx264", "-preset", preset,
                        "-crf", str(crf), "-pix_fmt", "yuv420p", "-c:a", "aac",
                        "-b:a", "128k", "-movflags", "+faststart", str(joined)])
        actual = probe_duration(joined)
        expected = plan.kept_seconds
        if abs(actual - expected) > max(1.0, expected * 0.02):
            raise MontageError(f"montage is {actual:.2f}s but the plan promised {expected:.2f}s")
        report = plan.summary()
        report.update({"output": str(destination), "output_seconds": round(actual, 2),
                       "crf": crf, "preset": preset, "report": str(report_path),
                       "problems": check_montage(plan)})
        staged_report = tmp / "report.json"
        staged_report.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        # Linking within the same filesystem creates each final path only if it
        # does not already exist; neither an old video nor an old report is replaced.
        import os
        try:
            os.link(staged_report, report_path)
            try:
                os.link(joined, destination)
            except OSError:
                # Roll back only the report we just created, if still unchanged.
                if report_path.exists() and os.path.samestat(os.stat(staged_report), os.stat(report_path)):
                    report_path.unlink()
                raise
        except OSError as exc:
            raise MontageError(f"cannot create output and report: {exc}") from exc
    return report


def check_montage(plan: MontagePlan, *, max_seconds: float = MAX_KEEP_SECONDS) -> list[str]:
    """Reasons a montage should not be published; an empty list means it is fine."""
    problems: list[str] = []
    if plan.kept_seconds > max_seconds + 0.01:
        problems.append(f"montage is {plan.kept_seconds:.1f}s, above the {max_seconds:.0f}s limit")
    if not plan.keeps:
        problems.append("nothing kept")
    for previous, current in zip(plan.keeps, plan.keeps[1:]):
        if current.start < previous.start:
            problems.append("clips are out of order, which would invent a sequence")
    for keep in plan.keeps:
        if keep.seconds < MIN_CLIP - 1e-9:
            problems.append(f"clip at {keep.start:.1f}s is shorter than a flash")
        if any(not keep.start <= event.seconds < keep.end for event in keep.events):
            problems.append(f"clip at {keep.start:.1f}s lists an event outside its bounds")
    has_goal = any(event.kind == "goal" and keep.start <= event.seconds < keep.end
                   for keep in plan.keeps for event in keep.events)
    if not has_goal:
        problems.append("no clip shows a reached goal: this is not a highlight")
    return problems


def _events_from_rows(rows: Sequence) -> list[Event]:
    """``[{"seconds": …, "kind": …, "reason": …}]`` -> events, or a clear error."""
    events: list[Event] = []
    for row in rows:
        if not isinstance(row, dict):
            raise MontageError("every event row must be an object")
        # Give the operator a useful error listing the supported kinds.
        kind = str(row.get("kind", "change"))
        if kind not in KIND_WEIGHT:
            raise MontageError(
                f"unknown event kind {kind!r}; expected one of {sorted(KIND_WEIGHT)}")
        reason = row.get("reason", row.get("detail", ""))
        try:
            events.append(Event(float(row["seconds"]), kind, str(reason)[:120]))
        except (KeyError, TypeError, ValueError) as exc:
            raise MontageError("every event row needs numeric seconds") from exc
    return events


def events_from_report_file(path: Path) -> list[Event]:
    """Read a saved stream/agent report (``--report`` JSON) into events.

    Accepts either the object written by :class:`stream_run.RunReport` or a plain
    list of ``{"seconds": …, "kind": …, "reason": …}`` rows, so a run can be
    re-edited later without replaying the game.
    """
    path = Path(path)
    if not path.is_file():
        raise MontageError("report must be an existing file")
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        raise MontageError("report is not readable JSON") from exc
    if isinstance(data, dict):
        events = events_from_run(data)
        # A report may also carry explicit measured events; they are additive.
        rows = data.get("events")
        if isinstance(rows, list):
            events = _dedupe(events + _events_from_rows(rows))
    elif isinstance(data, list):
        events = _events_from_rows(data)
    else:
        raise MontageError("report must be an object or a list of events")
    return _dedupe(events)


def main(argv: Sequence[str] | None = None) -> None:
    """Cut a short montage out of an existing recording. Uploads nothing."""
    parser = argparse.ArgumentParser(description="Cut a short montage from a recorded gameplay run; no upload")
    parser.add_argument("video", type=Path, help="recorded gameplay file")
    parser.add_argument("destination", type=Path, help="where the short .mp4 goes")
    parser.add_argument("--report", type=Path, required=True,
                        help="stream/agent report whose events decide the cuts")
    parser.add_argument("--target-seconds", type=float, default=45.0)
    parser.add_argument("--preset", default="veryfast")
    parser.add_argument("--crf", type=int, default=20)
    parser.add_argument("--dry-run", action="store_true", help="plan and report, cut nothing")
    args = parser.parse_args(argv)
    duration = probe_duration(args.video)
    events = events_from_report_file(args.report)
    plan = plan_montage(duration, events, target_seconds=args.target_seconds)
    if args.dry_run:
        report = plan.summary()
        report.update({"events_considered": len(events), "source_seconds": round(duration, 2),
                       "problems": check_montage(plan), "rendered": False})
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return
    rendered = render_montage(args.video, plan, args.destination,
                              crf=args.crf, preset=args.preset)
    rendered["events_considered"] = len(events)
    rendered["problems"] = check_montage(plan)
    print(json.dumps(rendered, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
