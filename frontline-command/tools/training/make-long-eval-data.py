#!/usr/bin/env python3
"""Build separate held-out inputs; no test samples used for training/selection."""
import argparse,hashlib,json,shutil
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--data',type=Path,required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args()
a.out.mkdir(parents=True,exist_ok=True)
wm=json.loads((a.data/'waypoint/manifest.json').read_text());raw=(a.data/'waypoint/test-all.jsonl').read_bytes()
if hashlib.sha256(raw).hexdigest()!=wm['counts']['test']['allSha256']:raise ValueError('waypoint test hash mismatch')
rows=[json.loads(x) for x in raw.splitlines()]
if len(rows)!=48:raise ValueError('expected all 48 test scenes')
(a.out/'waypoint.json').write_text(json.dumps({'system':wm['system'],'rows':[{'spec':r['spec'],'input':r['input']} for r in rows]},ensure_ascii=False,indent=2)+'\n')
source=a.data/'commander';manifest=json.loads((source/'manifest.json').read_text());test=json.loads((source/'test-manifest.json').read_text());test_raw=(source/'test.jsonl').read_bytes()
if hashlib.sha256(test_raw).hexdigest()!=test['sha256']:raise ValueError('commander test hash mismatch')
if set(test['seeds']) & (set(manifest['trainSeeds']) | set(manifest['evalSeeds'])):raise ValueError('commander test seed leakage')
train_raw=(source/'train.jsonl').read_bytes();train=[json.loads(x) for x in train_raw.splitlines()];evalrows=[json.loads(x) for x in test_raw.splitlines()]
seen={json.dumps(x['input'],sort_keys=True) for x in train}
if len(evalrows)!=test['count'] or any(json.dumps(x['input'],sort_keys=True) in seen for x in evalrows):raise ValueError('commander test leakage')
output=a.out/'commander';output.mkdir(exist_ok=True);shutil.copyfile(source/'train.jsonl',output/'train.jsonl');(output/'eval.jsonl').write_bytes(test_raw)
manifest['evalSeeds']=test['seeds'];manifest['files']['eval']={'count':test['count'],'sha256':test['sha256']}
(output/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'waypointTestScenes':len(rows),'commanderTestSnapshots':len(evalrows)}))
