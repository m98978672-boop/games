#!/usr/bin/env python3
"""Статический сервер сайта Games с поддержкой HTTP Range (перемотка видео)."""
import os, re, sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(ROOT) if os.path.basename(ROOT) == "boris" else ROOT


class Limited:
    def __init__(self, f, n):
        self.f, self.left = f, n

    def read(self, n=-1):
        if self.left <= 0:
            return b""
        data = self.f.read(min(n if n > 0 else self.left, self.left))
        self.left -= len(data)
        return data

    def close(self):
        self.f.close()


class Handler(SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        rng = self.headers.get("Range")
        if os.path.isfile(path) and rng:
            m = re.match(r"bytes=(\d*)-(\d*)", rng)
            if m:
                size = os.path.getsize(path)
                start = int(m.group(1)) if m.group(1) else 0
                end = int(m.group(2)) if m.group(2) else size - 1
                end = min(end, size - 1)
                if start <= end:
                    f = open(path, "rb")
                    f.seek(start)
                    length = end - start + 1
                    self.send_response(206)
                    self.send_header("Content-Type", self.guess_type(path))
                    self.send_header("Accept-Ranges", "bytes")
                    self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
                    self.send_header("Content-Length", str(length))
                    self.end_headers()
                    return Limited(f, length)
        return super().send_head()

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    os.chdir(ROOT)
    srv = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"serving {ROOT} on 0.0.0.0:{port}", flush=True)
    srv.serve_forever()
