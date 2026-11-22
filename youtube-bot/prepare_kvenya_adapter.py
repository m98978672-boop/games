"""Extract only the pinned home adapter weights and config, without unsafe tar paths."""
import hashlib
import io
import tarfile
from pathlib import Path
import sys

SHA256 = '58d698b482124ea9147c2a50cbe99be82612dd6b2ab263997dd7436cbcfa4916'
FILES = {'adapter/adapter_config.json', 'adapter/adapter_model.safetensors'}

def extract(archive: Path, destination: Path) -> None:
    if archive.stat().st_size > 60_000_000:
        raise ValueError("Home adapter archive exceeds size limit")
    data = archive.read_bytes()
    if hashlib.sha256(data).hexdigest() != SHA256:
        raise ValueError('Home adapter archive does not match pinned release digest')
    if destination.exists():
        raise ValueError('Adapter destination must not exist')
    found = {}
    with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as tar:
        for member in tar:
            # Refuse links/special files anywhere, including ignored entries.
            if not (member.isdir() or member.isfile()):
                raise ValueError('Unsupported archive entry')
            if member.name not in FILES:
                continue
            if not member.isfile() or member.name in found or member.size > 300_000_000:
                raise ValueError('Invalid or duplicate adapter file')
            stream = tar.extractfile(member)
            if stream is None:
                raise ValueError('Missing adapter content')
            found[member.name] = stream.read()
    if set(found) != FILES:
        raise ValueError('Required home adapter files missing')
    destination.mkdir(mode=0o700, parents=True)
    for name, content in found.items():
        (destination / Path(name).name).write_bytes(content)

if __name__ == '__main__':
    extract(Path(sys.argv[1]), Path(sys.argv[2]))
