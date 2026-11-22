"""Emit a bounded GitHub annotation for synthetic, credential-free smoke tests only."""
import sys
from pathlib import Path

text = Path(sys.argv[1]).read_text(encoding="utf-8", errors="replace")[-6000:]
# GitHub workflow command escaping; no credentials are present in these tests.
text = text.replace("%", "%25").replace("\r", "%0D").replace("\n", "%0A")
print(f"::error title=Smoke test failure::{text}")
