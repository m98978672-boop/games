#!/usr/bin/env python3
"""Download a pinned public WebLLM model and verify upstream hashes before zipping.

Model weights are generated artifacts: never add them to the repository.
"""
import hashlib
import json
import sys
import tempfile
import urllib.parse
import urllib.request
import zipfile
from pathlib import Path

REPO = 'mlc-ai/Qwen3.5-0.8B-q4f16_1-MLC'
REVISION = '0ec138972555613c1d7812a821778ad0398c8790'
BASE = 'https://huggingface.co/'
FILES = [*(f'params_shard_{i}.bin' for i in range(11)), 'merges.txt',
         'mlc-chat-config.json', 'tensor-cache.json', 'tensor-cache-b16.json',
         'tokenizer.json', 'tokenizer_config.json', 'vocab.json']


def request(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Frontline-Command-model-packager/1.0'}), timeout=120)


def verify_file(path, entry):
    size = entry['size']
    if path.stat().st_size != size:
        raise ValueError(f'incorrect size: {path.name}')
    # The Hub's non-LFS blobId is Git's SHA-1 (including the blob header);
    # LFS files use SHA-256. Validate every file before publishing anything.
    is_lfs = 'lfs' in entry
    digest = hashlib.sha256() if is_lfs else hashlib.sha1()
    if not is_lfs:
        digest.update(f'blob {size}\0'.encode())
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    expected = entry['lfs']['sha256'] if is_lfs else entry['blobId']
    if digest.hexdigest() != expected:
        raise ValueError(f'checksum mismatch: {path.name}')


def package(output):
    api = BASE + 'api/models/' + REPO + '/revision/' + REVISION + '?blobs=true'
    with request(api) as response:
        metadata = json.load(response)
    if metadata.get('sha') != REVISION:
        raise ValueError('unexpected model revision')
    entries = {item['rfilename']: item for item in metadata['siblings']}
    if any(name not in entries for name in FILES):
        raise ValueError('model manifest is incomplete')
    with tempfile.TemporaryDirectory(prefix='frontline-qwen-') as temporary:
        folder = Path(temporary)
        for name in FILES:
            entry = entries[name]
            if not isinstance(entry.get('size'), int) or not 0 < entry['size'] <= 200_000_000:
                raise ValueError(f'invalid file size: {name}')
            url = BASE + REPO + '/resolve/' + REVISION + '/' + urllib.parse.quote(name, safe='') + '?download=true'
            path = folder / name
            print('Downloading', name, flush=True)
            with request(url) as response, path.open('wb') as dest:
                total = 0
                while True:
                    chunk = response.read(1024 * 1024)
                    if not chunk:
                        break
                    total += len(chunk)
                    if total > entry['size']:
                        raise ValueError(f'excess data: {name}')
                    dest.write(chunk)
            verify_file(path, entry)
        with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_STORED, allowZip64=True) as archive:
            for name in FILES:
                archive.write(folder / name, name)
            archive.writestr('SOURCE.txt', f'Qwen3.5-0.8B-q4f16_1-MLC\nSource: {BASE}{REPO}/tree/{REVISION}\nModel license: Apache-2.0, https://huggingface.co/Qwen/Qwen3.5-0.8B\nFiles checked against the upstream pinned revision. The model is not automatically installed in Frontline Command.\n')
            archive.write(Path(__file__).resolve().parents[1] / 'src/ai/licenses/WEB-LLM-APACHE-2.0.txt', 'LICENSE-APACHE-2.0.txt')
        with zipfile.ZipFile(output) as archive:
            bad = archive.testzip()
            if bad:
                raise ValueError(f'corrupt ZIP member: {bad}')
    print('Verified archive:', output, flush=True)


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit('usage: package-qwen-model.py OUTPUT.zip')
    package(Path(sys.argv[1]))
