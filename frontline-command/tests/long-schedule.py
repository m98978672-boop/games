#!/usr/bin/env python3
import importlib.util
from pathlib import Path
p=Path(__file__).resolve().parents[1]/'tools/training/long_schedule.py'
spec=importlib.util.spec_from_file_location('long_schedule',p);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
assert m.attempt_target(0,0,18000,9000)==9000
assert m.attempt_target(9100,0,18000,9000)==18000
assert m.attempt_target(17900,0,18000,9000)==18000
assert m.attempt_target(21000,18000,18000,9000)==30000
assert m.attempt_target(21000,18000,18000,0)==36000
assert m.attempt_result(9001,0,18000,9000)=='partial'
assert m.attempt_result(18000,0,18000,18000)=='complete'
assert m.attempt_result(8999,0,18000,9000)=='incomplete'
for values in [(0,0,0,0),(-1,0,1,1),(0,1,1,1),(0,0,1,float('nan'))]:
 try:m.attempt_target(*values);raise AssertionError(values)
 except ValueError:pass
print('Training schedule: partial budget, resumed phase, completion and invalid schedules verified')
