"""Fail closed unless the gameplay release requirements can be checked.

The owner's rules for publishing a playthrough: twenty minutes of real play,
narration with timed subtitles, verified rights, and a safe same-day split for
recordings over thirty minutes.

This gate used to refuse everything, because the pipeline produced no artifact
that could establish those properties. Refusing for ever is not a policy: it
quietly turned "not yet proven" into "never published". The builder now writes
``release.evidence.json`` beside the draft, and this gate re-derives every number
from the files themselves, so the evidence file cannot simply assert success.

A missing evidence file still blocks, and that is deliberate: a recording made
before the evidence existed has not proven anything, and inventing the numbers
for it would be exactly the falsehood this gate exists to prevent.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

EVIDENCE_NAME = 'release.evidence.json'


def require_verified_gameplay_release(folder: str | Path | None = None) -> dict[str, Any]:
    """Check the release requirements and return the measured numbers.

    ``folder`` is the artifact folder that holds the draft, its subtitles, the
    published parts and the evidence file. Omitting it blocks: there is nothing
    to check, and "no evidence" must never read as "fine".
    """
    from gameplay_release_evidence import verify

    if folder is None:
        raise ValueError(
            'Gameplay publication blocked: no artifact folder was given, so the '
            'twenty-minute play, subtitles, rights and split requirements cannot '
            'be checked. Private experiments are allowed.')
    return verify(Path(folder))
