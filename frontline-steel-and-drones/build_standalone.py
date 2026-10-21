#!/usr/bin/env python3
"""Build play.html — a single-file build of the game (index.html + style.css + game.js inlined).

Useful when the game is opened from a file viewer / downloaded as one file,
where relative style.css / game.js links might not resolve.
Run:  python3 build_standalone.py
"""
from pathlib import Path

here = Path(__file__).parent
html = (here / "index.html").read_text(encoding="utf-8")
css = (here / "style.css").read_text(encoding="utf-8")
js = (here / "game.js").read_text(encoding="utf-8")

assert "</style>" not in css, "CSS contains </style>"
assert "</script>" not in js, "JS contains </script>"

html = html.replace('<link rel="stylesheet" href="style.css">', f"<style>\n{css}\n</style>")
html = html.replace('<script src="game.js"></script>', f"<script>\n{js}\n</script>")

out = here / "play.html"
out.write_text(html, encoding="utf-8")
print(f"OK -> {out} ({out.stat().st_size // 1024} KB, single file)")
