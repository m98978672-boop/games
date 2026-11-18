#!/usr/bin/env python3
import hashlib
import importlib.util
import io
import json
import tempfile
import zipfile
from pathlib import Path
from urllib.parse import unquote, urlparse

source = Path(__file__).resolve().parents[1] / 'tools/package-qwen-model.py'
spec = importlib.util.spec_from_file_location('package_qwen_model', source)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
data = {name: ('fixture for ' + name).encode() for name in module.FILES}
entries = []
for index, (name, content) in enumerate(data.items()):
    item = {'rfilename': name, 'size': len(content)}
    if index % 2:
        item['lfs'] = {'sha256': hashlib.sha256(content).hexdigest()}
    else:
        item['blobId'] = hashlib.sha1(f'blob {len(content)}\0'.encode() + content).hexdigest()
    entries.append(item)
metadata = {'sha': module.REVISION, 'siblings': entries}

def mock(url):
    if '/api/models/' in url:
        return io.BytesIO(json.dumps(metadata).encode())
    return io.BytesIO(data[unquote(urlparse(url).path.rsplit('/', 1)[-1])])
module.request = mock
with tempfile.TemporaryDirectory() as tmp:
    output = Path(tmp) / 'model.zip'
    module.package(output)
    with zipfile.ZipFile(output) as archive:
        assert set(archive.namelist()) == set(module.FILES) | {'SOURCE.txt', 'LICENSE-APACHE-2.0.txt'}
        for name, content in data.items():
            assert archive.read(name) == content
    output.unlink()
    data[module.FILES[0]] = b'x' * len(data[module.FILES[0]])
    try:
        module.package(output)
        raise AssertionError('mismatched checksum accepted')
    except ValueError as exc:
        assert 'checksum mismatch' in str(exc)
    assert not output.exists(), 'no archive published after corrupt data'
print('archive packaging: mocked upstream LFS and Git hashes, ZIP contents, corruption rejection')
