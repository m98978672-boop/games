"""Fail closed until the gameplay publisher can prove the owner's release rules.

Private recordings and experiments remain available. The current adventure
pipeline has no verified timed subtitles, no proof that 20 minutes are genuine
play, and no two-part same-day release path for recordings over 30 minutes.
A duration counter or a rights flag alone cannot establish those properties.
"""


def require_verified_gameplay_release() -> None:
    raise ValueError(
        'Gameplay publication blocked: a verified 20-minute real playthrough '
        'with narration and subtitles, rights checks and safe same-day splitting '
        'over 30 minutes is not yet supported. Private experiments are allowed.'
    )
