import hashlib
import io
import sys
import tarfile
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import prepare_kvenya_adapter as prepare

class AdapterExtractionTests(unittest.TestCase):
    def archive(self, path, link=False):
        with tarfile.open(path, 'w:gz') as tar:
            for name, data in [('adapter/adapter_config.json', b'{}'), ('adapter/adapter_model.safetensors', b'weights')]:
                entry = tarfile.TarInfo(name); entry.size = len(data)
                tar.addfile(entry, io.BytesIO(data))
            if link:
                entry = tarfile.TarInfo('ignored-link'); entry.type = tarfile.SYMTYPE; entry.linkname = '/etc/passwd'; tar.addfile(entry)
        return hashlib.sha256(path.read_bytes()).hexdigest()

    def test_only_pinned_regular_adapter_files_are_extracted(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp); archive = root / 'adapter.tar.gz'; digest = self.archive(archive)
            with patch.object(prepare, 'SHA256', digest):
                prepare.extract(archive, root / 'output')
                self.assertEqual((root / 'output' / 'adapter_model.safetensors').read_bytes(), b'weights')
                with self.assertRaises(ValueError): prepare.extract(archive, root / 'output')
            with self.assertRaises(ValueError): prepare.extract(archive, root / 'other')

    def test_refuses_links_even_on_ignored_members(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp); archive = root / 'adapter.tar.gz'; digest = self.archive(archive, link=True)
            with patch.object(prepare, 'SHA256', digest), self.assertRaises(ValueError):
                prepare.extract(archive, root / 'output')
            self.assertFalse((root / 'output').exists())
