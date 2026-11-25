"""Read the private publication queue and report which planned slots are still missing.

The publisher keeps one row per reserved publish time. A scheduled autopilot
run is only useful when the slot it serves has no confirmed video yet;
otherwise it would render the same slot again and the publisher would reject
the duplicate after an hour of work.

This module is read-only. It never reserves, uploads or changes a row. The
queue table is private (row level security, no public policy), so it is read
through the existing service-role edge function and an OIDC-verified request.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Iterable


def queue_rows(result: Any) -> list[dict[str, Any]]:
    """Extract the safe job list from the publisher's response.

    The response carries the owner's API JSON only; an unexpected shape is a
    hard error, because "no jobs" and "could not read jobs" must never be
    confused: the second one would cause a duplicate render.
    """
    if not isinstance(result, dict) or result.get("status") != "ok":
        raise ValueError("Publisher did not return the review queue.")
    jobs = result.get("jobs")
    if not isinstance(jobs, list):
        raise ValueError("Publisher returned no usable job list.")
    return [job for job in jobs if isinstance(job, dict)]


def planned_slots(slots: Iterable[Any]) -> list[datetime]:
    """Normalise planned slot times (UTC or aware datetimes) to aware UTC."""
    planned: list[datetime] = []
    for value in slots:
        if isinstance(value, datetime):
            moment = value
        else:
            text = str(value).strip()
            if not text:
                continue
            moment = datetime.fromisoformat(text.replace("Z", "+00:00"))
        if moment.tzinfo is None:
            raise ValueError("A planned slot has no timezone.")
        planned.append(moment.astimezone(timezone.utc))
    return planned


def _confirmed(job: dict[str, Any]) -> datetime | None:
    """The publish time of a job that truly has a video, else None."""
    if not job.get("video_id"):
        return None
    if job.get("status") not in {"scheduled", "processing"}:
        return None
    raw = job.get("publish_at")
    if not isinstance(raw, str) or not raw:
        return None
    try:
        moment = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except ValueError:
        return None
    return moment.astimezone(timezone.utc) if moment.tzinfo else None


def assess(slots: Iterable[Any], jobs: Iterable[dict[str, Any]], *,
           tolerance_minutes: int = 1) -> tuple[list[datetime], list[datetime]]:
    """Split the planned slots into (missing, already_booked).

    A slot counts as booked when a real video already sits within the tolerance
    of it. Anything else - a missing row, a failed row, a cancelled upload - is
    still missing and must be published.
    """
    if tolerance_minutes < 0:
        raise ValueError("tolerance_minutes must not be negative")
    tolerance = tolerance_minutes * 60
    booked = [moment for moment in (_confirmed(job) for job in jobs) if moment is not None]
    missing: list[datetime] = []
    already: list[datetime] = []
    for slot in planned_slots(slots):
        if any(abs((slot - moment).total_seconds()) <= tolerance for moment in booked):
            already.append(slot)
        else:
            missing.append(slot)
    return missing, already
