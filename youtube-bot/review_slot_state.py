"""Conservative, read-only classification of publisher slot reservations."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Iterable

# The current publisher endpoint requests at most 100 rows. Exactly 100 cannot
# prove the result is complete, so stop instead of guessing about omitted slots.
QUEUE_ROW_LIMIT = 100


class UncertainSlot(ValueError):
    """The slot has a reservation without a confirmed scheduled video."""


def _job_time(job: dict[str, Any]) -> datetime:
    raw = job.get('publish_at')
    if not isinstance(raw, str) or not raw:
        raise ValueError('Publisher returned a queue row without a valid publication time.')
    try:
        moment = datetime.fromisoformat(raw.replace('Z', '+00:00'))
    except ValueError as exc:
        raise ValueError('Publisher returned a queue row with an invalid publication time.') from exc
    if moment.tzinfo is None:
        raise ValueError('Publisher returned a queue row without a timezone.')
    return moment.astimezone(timezone.utc)


def _validate_job(job: Any) -> None:
    if not isinstance(job, dict):
        raise ValueError('Publisher returned a malformed queue row.')
    _job_time(job)
    if job.get('status') not in {'processing', 'scheduled', 'failed'}:
        raise ValueError('Publisher returned an unknown reservation status.')
    video = job.get('video_id')
    if video is not None and (not isinstance(video, str) or not video.strip()):
        raise ValueError('Publisher returned an invalid video identifier.')


def queue_rows(result: Any) -> list[dict[str, Any]]:
    """Reject invalid or potentially truncated responses rather than drop rows."""
    if not isinstance(result, dict) or result.get('status') != 'ok':
        raise ValueError('Publisher did not return the review queue.')
    jobs = result.get('jobs')
    if not isinstance(jobs, list):
        raise ValueError('Publisher returned no usable job list.')
    if len(jobs) >= QUEUE_ROW_LIMIT:
        raise ValueError('Publisher queue may be truncated; cannot safely plan a slot.')
    for job in jobs:
        _validate_job(job)
    return jobs


def planned_slots(slots: Iterable[Any]) -> list[datetime]:
    planned: list[datetime] = []
    for value in slots:
        if isinstance(value, datetime):
            moment = value
        else:
            text = str(value).strip()
            if not text:
                continue
            moment = datetime.fromisoformat(text.replace('Z', '+00:00'))
        if moment.tzinfo is None:
            raise ValueError('A planned slot has no timezone.')
        planned.append(moment.astimezone(timezone.utc))
    return planned


def _confirmed(job: dict[str, Any]) -> bool:
    return job['status'] == 'scheduled' and bool(job.get('video_id'))


def booked_slots(jobs: Iterable[dict[str, Any]]) -> list[datetime]:
    """Return confirmed video slots only; uncertain ones are checked separately."""
    result = []
    for job in jobs:
        _validate_job(job)
        if _confirmed(job):
            result.append(_job_time(job))
    return result


def assess(slots: Iterable[Any], jobs: Iterable[dict[str, Any]], *,
           tolerance_minutes: int = 1) -> tuple[list[datetime], list[datetime]]:
    """Classify confirmed versus absent; refuse an uncertain matching reservation."""
    if tolerance_minutes < 0:
        raise ValueError('tolerance_minutes must not be negative')
    tolerance = tolerance_minutes * 60
    rows = list(jobs)
    for job in rows:
        _validate_job(job)
    missing: list[datetime] = []
    already: list[datetime] = []
    for slot in planned_slots(slots):
        matches = [job for job in rows if abs((slot - _job_time(job)).total_seconds()) <= tolerance]
        if any(not _confirmed(job) for job in matches):
            raise UncertainSlot('Publication slot has an unresolved reservation; check YouTube Studio and the publisher before retrying.')
        if matches:
            already.append(slot)
        else:
            missing.append(slot)
    return missing, already
