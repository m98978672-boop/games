import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import run_game_review


class ReviewPreviewTests(unittest.TestCase):
    def test_no_slot_reads_and_spoken_aliases_are_reported_separately(self):
        review = {"game_id": "12345", "game_title": "Пример", "idea_score": 8,
                  "screenshots": [], "scenes": [{"dialogue": "Это RPG в Steam."}]}
        with tempfile.TemporaryDirectory() as temp, \
             patch.dict('os.environ', {'MANUAL_PUBLISH_AT': 'irrelevant', 'REQUIRE_SHARED_TOPIC_HISTORY': 'true'}), \
             patch('publish_to_supabase.read_queue') as queue, \
             patch.object(run_game_review, 'authoritative_topic_history') as history, \
             patch.object(run_game_review, 'load_steam_games', return_value=[]), \
             patch.object(run_game_review, 'generate_game_review', return_value=review), \
             patch.object(run_game_review, 'download_screenshots', return_value=[]), \
             patch.object(run_game_review, 'render_short', return_value={}), \
             patch.object(run_game_review, 'youtube_description', return_value='Источники'):
            result = run_game_review.run(Path(temp) / 'preview.mp4', preview=True)
        queue.assert_not_called()
        history.assert_not_called()
        self.assertEqual(result['status'], 'private_preview')
        self.assertIsNone(result['metadata']['publish_at'])
        self.assertEqual(result['review']['scenes'][0]['dialogue'], 'Это RPG в Steam.')
        self.assertEqual(result['speech_aliases_applied'][0]['spoken'], 'Это эр пэ гэ в Стим.')
