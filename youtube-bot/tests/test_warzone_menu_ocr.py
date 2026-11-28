import sys
import io
from unittest.mock import patch
from types import SimpleNamespace
from PIL import Image
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from warzone_menu_ocr import candidates_from_tsv, scan_menu

HEADER = 'level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\ttop\twidth\theight\tconf\ttext\n'

class MenuOCRTests(unittest.TestCase):
    def test_detects_bounded_real_menu_lines_and_ignores_other_text(self):
        rows = [
          '5\t1\t1\t1\t1\t1\t320\t260\t70\t30\t88\tSingle',
          '5\t1\t1\t1\t1\t2\t395\t260\t70\t30\t92\tPlayer',
          '5\t1\t1\t1\t2\t1\t350\t300\t40\t30\t90\tNew',
          '5\t1\t1\t1\t2\t2\t395\t300\t90\t30\t90\tCampaign',
          '5\t1\t2\t1\t3\t1\t20\t20\t80\t30\t99\tDELETE',
          '5\t1\t3\t1\t4\t1\t790\t20\t60\t30\t99\tQuit',
        ]
        self.assertEqual(candidates_from_tsv(HEADER+'\n'.join(rows)),
                         [{'label':'single player','at':(392,275)}, {'label':'new campaign','at':(417,315)}])
    def test_alpha_campaign_is_a_visible_target(self):
        rows = ['5\t1\t1\t1\t1\t1\t300\t240\t70\t28\t80\tAlpha',
                '5\t1\t1\t1\t1\t2\t375\t240\t110\t28\t82\tCampaign']
        self.assertEqual(candidates_from_tsv(HEADER+'\n'.join(rows)),
                         [{'label':'alpha campaign', 'at':(392,254)}])

    def test_contrast_recovers_menu_and_deduplicates(self):
        img = io.BytesIO(); Image.new('RGB',(800,600)).save(img,'PNG')
        rows = ['5\t1\t1\t1\t1\t1\t300\t240\t70\t28\t80\tAlpha',
                '5\t1\t1\t1\t1\t2\t375\t240\t110\t28\t82\tCampaign']
        empty = SimpleNamespace(stdout=HEADER.encode())
        found = SimpleNamespace(stdout=(HEADER+'\n'.join(rows)).encode())
        with patch('warzone_menu_ocr.subprocess.run', side_effect=[empty, found, found]) as calls:
            self.assertEqual(scan_menu(img.getvalue()), [{'label':'alpha campaign','at':(392,254)}])
            self.assertEqual(calls.call_count, 3)

    def test_empty_and_untrusted_are_not_actions(self):
        self.assertEqual(candidates_from_tsv(HEADER), [])
        with self.assertRaises(ValueError): candidates_from_tsv('x'*1_000_001)
