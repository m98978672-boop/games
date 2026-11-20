#!/usr/bin/env python3
# Exercise the pure selection logic without requiring PyTorch/model downloads.
import ast,json
from pathlib import Path
path=Path(__file__).resolve().parents[1]/'tools/training/train-commander-structured.py'
tree=ast.parse(path.read_text());fn=next(x for x in tree.body if isinstance(x,ast.FunctionDef) and x.name=='select_memory_pairs')
mod=ast.fix_missing_locations(ast.Module(body=[fn],type_ignores=[]));scope={'json':json};exec(compile(mod,str(path),'exec'),scope)
select=scope['select_memory_pairs'];rows=[]
for seed in [1,2,3]:
 for action in ('hold','none'):
  rows.append({'seed':seed,'swapSides':False,'input':{'squads':[{'ammo':seed}],'points':[{}],'builds':[],'memory':{'recent':[{'status':'queued'}] if action=='none' else [],'experience':[]}},'response':json.dumps({'action':action})})
result=select(rows,4);assert len(result)==4
for a,b in zip(result[::2],result[1::2]):
 assert a['seed']==b['seed'] and json.loads(a['response'])['action']=='hold' and json.loads(b['response'])['action']=='none'
 assert {k:v for k,v in a['input'].items() if k!='memory'}=={k:v for k,v in b['input'].items() if k!='memory'}
try:select(rows,3);raise AssertionError('odd count accepted')
except ValueError:pass
assert len(select(rows[:1],4))==0
print('Memory pair selection: balanced same-observation cases, distinct seeds and malformed count checked.')
