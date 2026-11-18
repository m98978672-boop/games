#!/usr/bin/env python3
"""Opt-in local preview with a bounded, chunked model inbox; not a production service."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[2]
GAME = ROOT / 'frontline-command'
MAX_FILE = 600 * 1024 * 1024
MAX_TOTAL = 1024 * 1024 * 1024
MAX_CHUNK = 4 * 1024 * 1024
EXTENSIONS = {'.zip', '.bin', '.json', '.txt', '.model', '.wasm', '.gguf', '.safetensors'}
TOKEN = secrets.token_urlsafe(32)
LOCK = threading.RLock()
UPLOADS = {}
INBOX = GAME / 'model-inbox'


def safe_name(name):
    if not isinstance(name, str) or not name or len(name) > 180 or name.startswith('.'):
        return False
    if any(c in name for c in '/\\\x00') or any(ord(c) < 32 or ord(c) == 127 for c in name):
        return False
    return Path(name).suffix.lower() in EXTENSIONS


def cleanup_expired():
    now = time.monotonic()
    for key, entry in list(UPLOADS.items()):
        if now - entry['last'] > 3600:
            entry['path'].unlink(missing_ok=True)
            del UPLOADS[key]


class Handler(SimpleHTTPRequestHandler):
    server_version = 'ModelInboxPreview/1'
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def setup(self):
        super().setup()
        self.connection.settimeout(60)

    def reply(self, code, data):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers()
        self.wfile.write(body)

    def permitted(self):
        # Non-simple token header and strict same-origin checks prevent a
        # cross-origin browser form from writing to the preview.
        origin = self.headers.get('Origin', '')
        parsed = urlsplit(origin)
        hosts = {self.headers.get('Host', '').lower(), self.headers.get('X-Forwarded-Host', '').lower()}
        site = self.headers.get('Sec-Fetch-Site', '')
        # Browsers may omit Origin for same-origin XHR/fetch; in that case
        # require the browser-controlled Fetch Metadata header instead.
        if origin:
            if parsed.scheme not in ('http', 'https') or parsed.netloc.lower() not in hosts: return False
        elif site != 'same-origin':
            return False
        if site and site not in ('same-origin', 'none'):
            return False
        return secrets.compare_digest(self.headers.get('X-Model-Token', ''), TOKEN)

    def read_body(self, limit):
        raw = self.headers.get('Content-Length', '')
        if not raw.isdigit() or int(raw) > limit:
            raise ValueError('length')
        size = int(raw)
        data = self.rfile.read(size)
        if len(data) != size:
            raise ValueError('incomplete')
        return data

    def valid_static(self):
        path = unquote(urlsplit(self.path).path)
        parts = path.strip('/').split('/')
        if not parts or parts[0] not in ('frontline-command', 'shared'):
            return False
        if any(p in ('.', '..', 'node_modules', 'model-inbox') or p.startswith('.') for p in parts if p):
            return False
        resolved = (ROOT / path.lstrip('/')).resolve()
        return resolved.is_relative_to(ROOT / parts[0])

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == '/':
            self.send_response(302); self.send_header('Location', '/frontline-command/'); self.end_headers(); return
        if path == '/__model_inbox/status':
            with LOCK:
                cleanup_expired()
                files = [{'name': p.name, 'size': p.stat().st_size} for p in sorted(INBOX.iterdir()) if p.is_file() and not p.name.startswith('.')]
            self.reply(200, {'service': 'model-inbox-v1', 'token': TOKEN, 'maxFile': MAX_FILE, 'maxTotal': MAX_TOTAL, 'chunkSize': MAX_CHUNK, 'files': files})
            return
        if not self.valid_static():
            self.send_error(404); return
        super().do_GET()

    def do_HEAD(self):
        if urlsplit(self.path).path == '/':
            self.send_response(302); self.send_header('Location', '/frontline-command/'); self.end_headers(); return
        if not self.valid_static(): self.send_error(404); return
        super().do_HEAD()

    def do_POST(self):
        if not self.permitted():
            self.close_connection = True; self.reply(403, {'error': 'forbidden'}); return
        path = urlsplit(self.path).path
        try:
            if path == '/__model_inbox/start':
                data = json.loads(self.read_body(4096))
                if not isinstance(data, dict): raise ValueError('bad request')
                name, size = data.get('name'), data.get('size')
                if not safe_name(name) or not isinstance(size, int) or isinstance(size, bool) or size <= 0 or size > MAX_FILE:
                    raise ValueError('bad file name or size')
                with LOCK:
                    cleanup_expired()
                    if (INBOX / name).exists() or any(e['name'] == name for e in UPLOADS.values()):
                        self.reply(409, {'error': 'file exists'}); return
                    used = sum(p.stat().st_size for p in INBOX.iterdir() if p.is_file() and not p.name.startswith('.'))
                    if used + sum(e['size'] for e in UPLOADS.values()) + size > MAX_TOTAL or shutil.disk_usage(INBOX).free < size + 16*1024*1024:
                        self.reply(413, {'error': 'storage full'}); return
                    key = secrets.token_hex(24); temp = INBOX / ('.upload-' + key + '.part')
                    with open(temp, 'xb'): pass
                    UPLOADS[key] = {'name': name, 'size': size, 'offset': 0, 'path': temp, 'hash': hashlib.sha256(), 'last': time.monotonic()}
                self.reply(200, {'id': key, 'chunkSize': MAX_CHUNK}); return
            if path in ('/__model_inbox/chunk', '/__model_inbox/finish', '/__model_inbox/cancel'):
                key = self.headers.get('X-Upload-Id', '')
                with LOCK:
                    cleanup_expired(); e = UPLOADS.get(key)
                    if not e: self.close_connection = True; self.reply(404, {'error': 'upload not found'}); return
                    e['last'] = time.monotonic()
                    if path.endswith('/cancel'):
                        self.read_body(0); e['path'].unlink(missing_ok=True); del UPLOADS[key]; self.reply(200, {'ok': True}); return
                    if path.endswith('/finish'):
                        self.read_body(0)
                        if e['offset'] != e['size']:
                            self.reply(409, {'error': 'incomplete'}); return
                        try: os.link(e['path'], INBOX / e['name'])  # atomic, never overwrite
                        except FileExistsError:
                            self.reply(409, {'error': 'file exists'}); return
                        e['path'].unlink(); del UPLOADS[key]
                        self.reply(200, {'ok': True, 'name': e['name'], 'size': e['size'], 'sha256': e['hash'].hexdigest()}); return
                    offset = self.headers.get('X-Upload-Offset', '')
                    if not offset.isdigit() or int(offset) != e['offset']:
                        self.close_connection = True; self.reply(409, {'error': 'wrong offset'}); return
                    data = self.read_body(min(MAX_CHUNK, e['size'] - e['offset']))
                    if not data: raise ValueError('empty chunk')
                    with open(e['path'], 'ab') as out: out.write(data)
                    e['hash'].update(data); e['offset'] += len(data)
                    self.reply(200, {'offset': e['offset']}); return
            self.close_connection = True; self.reply(404, {'error': 'not found'})
        except (ValueError, json.JSONDecodeError, UnicodeDecodeError):
            self.close_connection = True; self.reply(400, {'error': 'invalid request'})
        except (OSError, BrokenPipeError):
            self.close_connection = True
            try: self.reply(500, {'error': 'storage error'})
            except OSError: pass


def main():
    global INBOX
    parser = argparse.ArgumentParser(); parser.add_argument('--host', default='127.0.0.1'); parser.add_argument('--port', type=int, default=8001); parser.add_argument('--inbox', type=Path, default=INBOX)
    args = parser.parse_args(); INBOX = args.inbox.resolve(); INBOX.mkdir(parents=True, exist_ok=True)
    # Only files with our own random temporary prefix are removed after restart.
    for p in INBOX.glob('.upload-*.part'):
        if re.fullmatch(r'\.upload-[0-9a-f]{48}\.part', p.name): p.unlink(missing_ok=True)
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f'Model inbox preview on {args.host}:{server.server_address[1]}; inbox {INBOX}', flush=True)
    server.serve_forever()

if __name__ == '__main__': main()
