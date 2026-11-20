"""Static checks only. These do not claim that Godot ran or rendered a frame."""
from pathlib import Path
import re
import struct
import unittest
import wave
import array
from gdtoolkit.parser import parser

ROOT = Path(__file__).resolve().parents[1]


class ProjectChecks(unittest.TestCase):
    def test_all_scripts_parse(self):
        scripts = list(ROOT.rglob('*.gd'))
        self.assertGreaterEqual(len(scripts), 7)
        for path in scripts:
            with self.subTest(script=path.name):
                parser.parse(path.read_text())

    def test_resource_paths_exist(self):
        for path in [*ROOT.rglob('*.gd'), *ROOT.rglob('*.tscn'), ROOT / 'project.godot']:
            for relative in re.findall(r'res://([^"\n]+)', path.read_text()):
                if ' + ' in relative or relative.endswith('/'):
                    continue
                self.assertTrue((ROOT / relative).exists(), (path, relative))

    def test_textures_are_real_pngs(self):
        textures = list((ROOT / 'assets/textures').glob('*.png'))
        self.assertEqual(len(textures), 12)
        for path in textures:
            raw = path.read_bytes()
            self.assertEqual(raw[:8], b'\x89PNG\r\n\x1a\n')
            self.assertEqual(struct.unpack('>II', raw[16:24]), (256, 256))

    def test_reusable_model_scenes(self):
        models = list((ROOT / 'assets/models').glob('*.tscn'))
        self.assertEqual(len(models), 5)
        for path in models:
            text = path.read_text()
            internal = re.findall(r'\[sub_resource[^\n]+id="([^"]+)"', text)
            external = re.findall(r'\[ext_resource[^\n]+id="([^"]+)"', text)
            self.assertEqual(len(internal), len(set(internal)))
            self.assertEqual(len(external), len(set(external)))
            self.assertTrue(set(re.findall(r'SubResource\("([^"]+)"\)', text)) <= set(internal))
            self.assertTrue(set(re.findall(r'ExtResource\("([^"]+)"\)', text)) <= set(external))
            expected = 1 + len(internal) + len(external)
            self.assertIn(f'load_steps={expected}', text)

    def test_original_music_pcm(self):
        with wave.open(str(ROOT / 'assets/audio/rubezh.wav'), 'rb') as track:
            self.assertEqual(track.getnchannels(), 1)
            self.assertEqual(track.getsampwidth(), 2)
            self.assertEqual(track.getframerate(), 22050)
            self.assertEqual(track.getnframes(), 32 * 22050)
            samples = array.array('h', track.readframes(track.getnframes()))
        self.assertLess(max(abs(x) for x in samples), 30000, 'PCM must have mixing headroom')
        self.assertGreater(max(abs(x) for x in samples), 1000, 'Track must not be silent')
        self.assertLess(abs(samples[0] - samples[-1]), 300, 'Loop seam must not have a large step')

    def test_block_ids_unique(self):
        ids = []
        for y in range(4):
            for x in range(8, 25):
                ids.append(f'back_{x}_{y}')
                if x < 14 or x > 18:
                    ids.append(f'front_{x}_{y}')
            for z in range(-23, -8):
                ids.extend((f'left_{z}_{y}', f'right_{z}_{y}'))
        self.assertEqual(len(ids), 236)
        self.assertEqual(len(set(ids)), 236)

    def test_critical_safety_contracts_present(self):
        game = (ROOT / 'scripts/game.gd').read_text()
        self.assertIn('active_debris < 32', game)
        self.assertIn('world.free()', game)
        self.assertIn('validate_world_save(data)', game)
        self.assertIn('save_path + ".tmp"', game)
        self.assertIn('get_tree().paused', game)
        enemy = (ROOT / 'scripts/enemy.gd').read_text()
        self.assertIn('intersect_ray(q)', enemy)
        self.assertIn('game.next_waypoint', enemy)


if __name__ == '__main__':
    unittest.main(verbosity=2)
