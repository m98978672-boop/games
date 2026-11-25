"""Run a stream against its plan and report how closely it was followed.

This is the part that was missing between :mod:`stream_plan` (the plan made ahead
of time) and :mod:`stream_director` (the decisions made on air): a loop that plays
the whole stream, feeds real frames to the director, answers chat, and writes down
what actually happened.

It is deliberately not a broadcast tool. It produces three reviewable artifacts:

* ``report.json``  — timings, adherence to the plan, frames measured, chat counts,
  and the honest flags (a part of the plan that ran over, silence, refusals);
* ``captions.srt`` — subtitles made from the lines actually spoken and how long each
  one was, never from text that was planned but not said;
* ``recap.md``     — the post-stream summary from :meth:`Director.recap`.

Nothing is uploaded, nothing goes on air, and no model is called: the frames come
from a callable the caller supplies (a bridge, a recording, or a fixture).

The clock is injected, so a two-hour stream is verified in milliseconds in CI
instead of being claimed to work.
"""
from __future__ import annotations

import json
import math
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Iterable, Sequence

from gameplay_captions import render_srt
from montage import events_from_run as _montage_events
from stream_director import Director, Line, Reply
from stream_plan import StreamPlan, issues


class RunError(ValueError):
    """The stream run was configured in a way that cannot be reported honestly."""


@dataclass
class Frame:
    """One measured look at the screen, plus when it happened."""

    offset_seconds: float
    perception: Any = None


@dataclass
class RunReport:
    plan_id: str
    total_seconds: int
    ended_offset_seconds: float
    lines: list[Line] = field(default_factory=list)
    replies: list[Reply] = field(default_factory=list)
    frames_seen: int = 0
    silent_frames: int = 0
    overruns: list[dict] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)
    wall_seconds: float = 0.0
    frame_offsets: list[float] = field(default_factory=list)
    # The director that made the decisions during this run; kept so statistics
    # and the recap come from the same instance, not from a fresh one.
    director: Any = None

    # -- derived -------------------------------------------------------------
    @property
    def adherence(self) -> float:
        """Share of the plan covered by the stream that actually ran."""
        if not self.total_seconds:
            return 0.0
        return round(min(1.0, max(0.0, self.ended_offset_seconds / self.total_seconds)), 3)

    def summary(self) -> dict:
        spoken = len(self.lines)
        by_source: dict[str, int] = {}
        for line in self.lines:
            by_source[line.source] = by_source.get(line.source, 0) + 1
        replies = {"answer": 0, "refuse": 0, "skip": 0}
        for reply in self.replies:
            replies[reply.action] = replies.get(reply.action, 0) + 1
        return {
            "schema": 1,
            "plan_id": self.plan_id,
            "planned_seconds": self.total_seconds,
            "ran_seconds": round(self.ended_offset_seconds, 1),
            "adherence": self.adherence,
            "lines_spoken": spoken,
            "lines_by_source": by_source,
            "spoken_without_evidence": sum(1 for line in self.lines if not line.evidence),
            "frames_seen": self.frames_seen,
            "silent_frames": self.silent_frames,
            "chat": replies,
            "overruns": list(self.overruns),
            "errors": list(self.errors),
            "run_wall_ms": round(self.wall_seconds * 1000.0, 2),
            # Measured highlight candidates, in the same words the montage uses,
            # so a saved report can be cut into a short clip without replaying.
            "events": [event.as_dict() for event in _montage_events(self)],
            "on_air": False,
            "published": False,
        }


def _check_plan(plan: StreamPlan) -> None:
    problems = issues(plan)
    if problems:
        raise RunError("the plan is not coherent: " + "; ".join(problems))


def _line_order(lines: Sequence[Line]) -> list[Line]:
    return sorted(lines, key=lambda line: line.offset_seconds)


def captions(lines: Iterable[Line], *, ended_offset_seconds: float,
             min_cue: float = 1.2) -> str:
    """SRT from the lines that were actually spoken, using their measured lengths.

    A line has a start (when it was said) and a length that fits inside its own
    text: about 14 characters per second at a normal narration pace, clamped so a
    short cue is still readable and two cues never overlap.
    """
    cues: list[tuple[float, float, str]] = []
    previous_end = 0.0
    for line in _line_order(list(lines)):
        begin = max(previous_end, float(line.offset_seconds))
        length = max(min_cue, min(8.0, len(line.text) / 14.0))
        finish = min(begin + length, max(begin + 0.5, ended_offset_seconds))
        if finish <= begin:
            continue
        cues.append((begin, finish, line.text))
        previous_end = finish
    if not cues:
        return ""
    end = max(ended_offset_seconds, cues[-1][1] + 0.5, 1.0)
    return render_srt(cues, start=0.0, end=end)


def run_stream(
    plan: StreamPlan,
    frames: Iterable[Frame],
    *,
    chat: Iterable[tuple[float, str]] = (),
    clock: Callable[[], float] | None = None,
) -> RunReport:
    """Play the plan against measured frames and chat messages.

    ``frames`` must arrive in time order; ``chat`` is ``(offset_seconds, message)``.
    Chat is answered at the next frame at or after its offset, so replies stay in
    the same timeline as the speech.
    """
    _check_plan(plan)
    now = clock or time.monotonic

    director = Director(plan)
    report = RunReport(plan_id=plan.stream_id, total_seconds=plan.total_seconds,
                       ended_offset_seconds=0.0, director=director)
    queued = sorted(chat, key=lambda item: item[0])
    cursor = 0
    last_offset = 0.0
    started = now()

    for frame in frames:
        if not isinstance(frame, Frame):
            raise RunError("frames must be Frame objects")
        if not math.isfinite(frame.offset_seconds) or frame.offset_seconds < last_offset:
            raise RunError("frames must be in time order")
        last_offset = frame.offset_seconds
        report.frames_seen += 1
        report.frame_offsets.append(float(frame.offset_seconds))

        while cursor < len(queued) and queued[cursor][0] <= frame.offset_seconds:
            offset, message = queued[cursor]
            report.replies.append(director.chat_reply(message))
            cursor += 1

        line = director.next_line(frame.offset_seconds, frame.perception)
        if line is None:
            report.silent_frames += 1
            continue
        report.lines.append(line)
        # A line that falls outside its own segment is an overrun the operator
        # should see, not something to hide in an average.
        segment = plan.segment_at(line.offset_seconds)
        if line.offset_seconds > segment.end_seconds:
            report.overruns.append({"segment": segment.kind,
                                    "line_offset": round(line.offset_seconds, 1),
                                    "segment_end": segment.end_seconds})

    report.ended_offset_seconds = float(last_offset)
    report.errors = []
    if not report.frames_seen:
        report.errors.append("no frames were measured")
    if last_offset > plan.total_seconds:
        report.overruns.append({"segment": "whole_plan", "line_offset": round(last_offset, 1),
                                "segment_end": plan.total_seconds})
    report.wall_seconds = round(max(0.0, now() - started), 4)
    return report


def write_artifacts(report: RunReport, directory: str | Path, *,
                    director: Director | None = None) -> dict:
    """Write report.json, captions.srt and recap.md; return their paths."""
    director = director or report.director
    target = Path(directory)
    target.mkdir(parents=True, exist_ok=True)
    data = report.summary()
    if director is not None:
        data["director"] = director.stats.summary()
    report_path = target / "report.json"
    report_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    caption_path = target / "captions.srt"
    caption_path.write_text(captions(report.lines, ended_offset_seconds=report.ended_offset_seconds),
                            encoding="utf-8")

    recap_path = target / "recap.md"
    recap = director.recap(ended_offset_seconds=report.ended_offset_seconds,
                           replies=report.replies) if director is not None else ""
    recap_path.write_text(recap + "\n", encoding="utf-8")
    return {"report": str(report_path), "captions": str(caption_path), "recap": str(recap_path)}


def check_against_contract(report: RunReport, *, min_seconds: float = 60.0,
                           min_adherence: float = 0.95, max_frame_gap: float = 30.0) -> list[str]:
    """Reasons a stream run should not be shown as successful; empty means fine.

    Adherence alone is not enough: ten frames spaced two minutes apart cover the
    clock but say nothing about most of the stream, so the largest measured gap
    is checked as well.
    """
    problems: list[str] = []
    if report.frames_seen < 2:
        problems.append("too few frames to claim a stream ran")
    gaps = list(getattr(report, "frame_offsets", []) or [])
    if gaps:
        worst = max([b - a for a, b in zip(gaps, gaps[1:])] or [0.0])
        if worst > max_frame_gap:
            problems.append(f"largest unmeasured gap was {worst:.0f} s, above {max_frame_gap:.0f} s")
    if report.ended_offset_seconds + max_frame_gap < report.total_seconds:
        problems.append(f"the stream stopped {report.total_seconds - report.ended_offset_seconds:.0f} s "
                        "short of the plan")
    if report.ended_offset_seconds < min_seconds:
        problems.append(f"the stream lasted {report.ended_offset_seconds:.0f} s, below the {min_seconds:.0f} s floor")
    if report.adherence < min_adherence:
        problems.append(f"only {report.adherence:.0%} of the plan was covered")
    if any(not line.evidence for line in report.lines):
        problems.append("a line was spoken without evidence")
    if report.errors:
        problems.extend(report.errors)
    return problems
