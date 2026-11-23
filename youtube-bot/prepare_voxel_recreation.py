"""Download pinned source for a private offline voxel-game experiment.

Only prepares the Docker build context; never executes downloaded code on host.
The MIT code license is not a clearance to publish game footage or assets.
"""
import hashlib
import io
import shutil
import sys
import tarfile
import urllib.request
from pathlib import Path, PurePosixPath

COMMIT = '85f63c01a5b67120badc57e70115a7644c361679'
SHA256 = '6452d8aa2f942a6624d279b77a1fcb5363eb6fbd9bfe0a4b694c20f850a2d895'
URL = f'https://codeload.github.com/nightdong/minecraft-web-recreation/tar.gz/{COMMIT}'
PREFIX = f'minecraft-web-recreation-{COMMIT}'


def extract(data: bytes, output: Path):
    if len(data) > 4_000_000 or hashlib.sha256(data).hexdigest() != SHA256:
        raise ValueError('Source archive failed size/hash verification')
    if output.exists() and any(output.iterdir()):
        raise ValueError('Build directory must be empty')
    output.mkdir(parents=True, exist_ok=True)
    total = 0
    with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as archive:
        members = archive.getmembers()
        if len(members) > 500: raise ValueError('Too many files')
        for m in members:
            parts = PurePosixPath(m.name).parts
            if not parts or parts[0] != PREFIX or any(p in ('.', '..') for p in parts): raise ValueError('Invalid path')
            if m.isdir(): continue
            if not m.isfile(): raise ValueError('Links and special files are prohibited')
            rel = PurePosixPath(*parts[1:])
            # Only source and package metadata, no repository tests or executables.
            if not (rel.parts[0] == 'src' or str(rel) in ('index.html','package.json','package-lock.json')): continue
            if rel.suffix.lower() not in ('.js','.css','.json','.html'): continue
            total += m.size
            if m.size > 3_000_000 or total > 10_000_000: raise ValueError('Source too large')
            target = output.joinpath(*rel.parts)
            target.parent.mkdir(parents=True, exist_ok=True)
            with target.open('xb') as out: shutil.copyfileobj(archive.extractfile(m), out)
    if not all((output / name).is_file() for name in ('index.html','package.json','package-lock.json','src/main.js')):
        raise ValueError('Missing source files')

if __name__ == '__main__':
    if len(sys.argv) != 2: raise SystemExit('usage: prepare_voxel_recreation.py EMPTY_BUILD_DIR')
    req = urllib.request.Request(URL, headers={'User-Agent':'KvenyaVoxelResearch/1.0'})
    with urllib.request.urlopen(req, timeout=60) as response:
        if response.geturl() != URL: raise ValueError('Unexpected redirect')
        data = response.read(4_000_001)
    extract(data, Path(sys.argv[1]))
