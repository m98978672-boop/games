import hashlib
import io
import sys
import tarfile
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import prepare_voxel_recreation as prep


def archive(entries):
    data = io.BytesIO()
    with tarfile.open(fileobj=data, mode='w:gz') as tar:
        for name, content, typ in entries:
            item = tarfile.TarInfo(name)
            item.type = typ
            item.size = len(content) if typ == tarfile.REGTYPE else 0
            if typ == tarfile.SYMTYPE: item.linkname = '/etc/passwd'
            tar.addfile(item, io.BytesIO(content) if typ == tarfile.REGTYPE else None)
    return data.getvalue()

class VoxelSourceTests(unittest.TestCase):
    def test_fails_before_extract_for_wrong_hash(self):
        with tempfile.TemporaryDirectory() as temp:
            with self.assertRaisesRegex(ValueError, 'hash'): prep.extract(b'bad', Path(temp)/'out')
            self.assertFalse((Path(temp)/'out').exists())

    def test_rejects_symlink_and_path_traversal_even_with_valid_hash(self):
        for path, kind in [(prep.PREFIX+'/src/link',tarfile.SYMTYPE), (prep.PREFIX+'/../escape.js',tarfile.REGTYPE)]:
            data = archive([(path, b'abc', kind)])
            with self.subTest(path=path), tempfile.TemporaryDirectory() as temp, patch.object(prep, 'SHA256', hashlib.sha256(data).hexdigest()):
                with self.assertRaises(ValueError): prep.extract(data, Path(temp)/'out')
                self.assertFalse((Path(temp)/'escape.js').exists())

    def test_extracts_only_source_and_required_package_metadata(self):
        files=['index.html','package.json','package-lock.json','src/main.js','tests/ignored.js']
        data=archive([(prep.PREFIX+'/'+name,b'test',tarfile.REGTYPE) for name in files])
        with tempfile.TemporaryDirectory() as temp, patch.object(prep, 'SHA256', hashlib.sha256(data).hexdigest()):
            out=Path(temp)/'out'; prep.extract(data,out)
            self.assertTrue((out/'src/main.js').is_file())
            self.assertFalse((out/'tests').exists())
            with self.assertRaises(ValueError): prep.extract(data,out)

if __name__ == '__main__': unittest.main()
