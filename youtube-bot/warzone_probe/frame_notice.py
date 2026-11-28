"""Diagnostic thumbnail only: emit numbered chunks below GitHub's annotation limit."""
import base64
from pathlib import Path
import sys

encoded = base64.b64encode(Path(sys.argv[1]).read_bytes()).decode('ascii')
for index in range(0, len(encoded), 2000):
    print(f'::notice::WARZONEFRAME-{index // 2000:03d}:{encoded[index:index + 2000]}')
