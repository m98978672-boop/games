"""Write the licence facts a capture needs, for the workflow to read.

Two cases, and they are genuinely different:

  * the game lives in this repository, so its code and art are ours and there is
    no external licence to confirm;
  * the game is external, so its licence is read from GitHub and dated. The gate
    then compares a fact about the source repository instead of a value somebody
    typed into a variable.

Anything unreadable is reported as unlicensed, never as permitted. The gate
refuses that, which is the correct outcome for a source nobody has checked.
"""
from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path

from adventure_draft import rights_from_environment, verified_license


def facts(trace: dict, today: str | None = None) -> dict[str, str]:
    """Return ``checked`` and ``license`` for a capture's trace."""
    record = rights_from_environment(trace)
    sources = record.get('sources') or []
    if not sources:
        return {'checked': '', 'license': ''}
    if sources[0].get('ownership') == 'own':
        # Nothing external, so nothing to license.
        return {'checked': '', 'license': ''}
    source = str(trace.get('source') or '')
    try:
        licence = verified_license(source)
    except Exception:
        # An unreadable licence is not a permissive one.
        licence = ''
    return {'checked': (today or date.today().isoformat()), 'license': licence}


def main(argv: list[str] | None = None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    if len(argv) != 2:
        print('usage: read_game_license.py <trace.json> <out.txt>', file=sys.stderr)
        return 2
    trace_path, out_path = Path(argv[0]), Path(argv[1])
    trace = json.loads(trace_path.read_text(encoding='utf-8'))
    lines = [f'{key}={value}' for key, value in facts(trace).items()]
    out_path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print('\n'.join(lines))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
