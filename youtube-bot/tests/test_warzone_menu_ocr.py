import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from warzone_menu_ocr import candidates_from_tsv

HEADER = 'level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\ttop\twidth\theight\tconf\ttext\n'

class MenuOCRTests(unittest.TestCase):
    def test_detects_bounded_real_menu_lines_and_ignores_other_text(self):
        rows = [
          '5\t1\t1\t1\t1\t1\t320\t260\t70\t30\t88\tSingle',
          '5\t1\t1\t1\t1\t2\t395\t260\t70\t30\t92\tPlayer',
          '5\t1\t1\t1\t2\t1\t350\t300\t100\t30\t90\tTutorial',
          '5\t1\t2\t1\t3\t1\t20\t20\t80\t30\t99\tDELETE',
          '5\t1\t3\t1\t4\t1\t790\t20\t60\t30\t99\tQuit',
        ]
        self.assertEqual(candidates_from_tsv(HEADER+'\n'.join(rows)),
                         [{'label':'single player','at':(392,275)}, {'label':'tutorial','at':(400,315)}])
    def test_empty_and_untrusted_are_not_actions(self):
        self.assertEqual(candidates_from_tsv(HEADER), [])
        with self.assertRaises(ValueError): candidates_from_tsv('x'*1_000_001)
