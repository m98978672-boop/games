"""Keep gameplay publication stopped until all release requirements are met.

Artifacts may be checked for internal consistency, but current uploaders do not
send subtitles or schedule both parts and evidence alone cannot prove real play.
Private capture and editing remain available.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

EVIDENCE_NAME = 'release.evidence.json'


def require_verified_gameplay_release(folder: str | Path | None = None) -> dict[str, Any]:
    """Check diagnostics, then stop until the missing delivery path exists.

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
    verify(Path(folder))
    # Current publishers upload only one original file, do not transfer SRTs,
    # and cannot schedule both parts on the same day. Artifact claims alone
    # also cannot prove genuine gameplay or training. Never start an upload
    # until those delivery and verification gaps are actually implemented.
    raise ValueError('Gameplay publication blocked: verified subtitle delivery, '
                     'genuine play and same-day multipart publication are not implemented.')
