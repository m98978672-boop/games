"""Check baseline is generated before PEFT mutates the shared base model."""
import importlib.util
import json
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest.mock import patch


class EvalOrderTest(unittest.TestCase):
    def test_all_baseline_rows_are_evaluated_before_in_place_wrap(self):
        class Model:
            adapted = False
            def eval(self):
                return self
        model = Model()
        class Peft:
            @staticmethod
            def from_pretrained(base, adapter):
                base.adapted = True
                return base
        class Loader:
            @classmethod
            def from_pretrained(cls, *args, **kwargs):
                return model
        class Tokenizer:
            @classmethod
            def from_pretrained(cls, *args, **kwargs):
                return object()
        stubs = {'torch': types.SimpleNamespace(bfloat16='bfloat16'),
                 'peft': types.SimpleNamespace(PeftModel=Peft),
                 'transformers': types.SimpleNamespace(AutoModelForImageTextToText=Loader, AutoTokenizer=Tokenizer)}
        with patch.dict(sys.modules, stubs):
            spec = importlib.util.spec_from_file_location('test_eval_script', Path(__file__).parents[1] / 'tools/eval-learn.py')
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            module.generate = lambda m, *_: 'adapter' if m.adapted else 'base'
            with tempfile.TemporaryDirectory() as temp:
                root = Path(temp)
                (root / 'manifest.json').write_text(json.dumps({'systemPrompt': 'test'}))
                (root / 'eval.jsonl').write_text('\n'.join(json.dumps({'id': str(i), 'instruction': 'q'}) for i in range(3)))
                output = root / 'results.json'
                with patch.object(sys, 'argv', ['eval-learn', '--data', str(root), '--adapter', str(root / 'adapter'), '--output', str(output)]):
                    module.main()
                rows = json.loads(output.read_text())['results']
        self.assertEqual([x['base'] for x in rows], ['base'] * 3)
        self.assertEqual([x['adapter'] for x in rows], ['adapter'] * 3)


if __name__ == '__main__': unittest.main()
