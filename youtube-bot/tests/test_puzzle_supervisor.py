import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from puzzle_supervisor import validate_board, legal_indices, distance, feedback, avoid_immediate_undo

class PuzzleTests(unittest.TestCase):
    def test_legal_neighbours_and_feedback(self):
        solved=list(range(1,16))+[0]
        away=solved[:]; away[14],away[15]=away[15],away[14]
        self.assertEqual(legal_indices(solved),[11,14])
        self.assertEqual(distance(solved),0)
        self.assertEqual(feedback(away,solved)[0],1)
        self.assertEqual(feedback(solved,away)[0],-1)
        self.assertEqual(feedback(solved,solved)[0],0)
    def test_undo_gets_penalty_and_cannot_farm_a_bonus(self):
        solved=list(range(1,16))+[0]
        away=solved[:]; away[14],away[15]=away[15],away[14]
        self.assertEqual(feedback(solved,away,best=0)[0],-1)
        self.assertEqual(feedback(away,solved,best=0,previous=solved)[0],-2)
        self.assertEqual(feedback(away,solved,best=0)[0],0)
        legal=legal_indices(away)
        remaining,blocked=avoid_immediate_undo(legal,away,solved)
        self.assertEqual(blocked,15)
        self.assertNotIn(15,remaining)
        self.assertEqual(avoid_immediate_undo([15],away,solved),([15],None))

    def test_untrusted_data_requires_permutation_and_bounded_coords(self):
        cells=[{'index':i,'value':(i+1)%16,'x':i*10,'y':20} for i in range(16)]
        self.assertEqual(len(validate_board({'cells':cells,'won':False})),16)
        cells[0]['value']=True
        with self.assertRaises(ValueError): validate_board({'cells':cells,'won':False})
        with self.assertRaises(ValueError): legal_indices([0]*16)

if __name__ == '__main__': unittest.main()
