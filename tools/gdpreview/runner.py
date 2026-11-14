import re
import sys


def conv(src):
    out = []
    for ln in src.split('\n'):
        ln = re.sub(r'(?<![\w.])signf\(', 'copysign(', ln)
        ln = re.sub(r'(?<![\w.])sign\(', 'copysign(', ln)
        ln = re.sub(r'(?<![\w.])ceil\(', 'math.ceil(', ln)
        ln = re.sub(r'(?<![\w.])sqrt\(', 'math.sqrt(', ln)
        ln = re.sub(r'(?<![\w.])maxf\(', 'max(', ln)
        ln = re.sub(r'(?<![\w.])minf\(', 'min(', ln)
        ln = re.sub(r'(?<![\w.])clampf\(', 'clamp(', ln)
        ln = re.sub(r'(?<![\w.])absf\(', 'abs(', ln)
        out.append(ln)
    return '\n'.join(out)


for path in sys.argv[1:]:
    src = open(path, encoding='utf-8').read()
    lines = [l for l in conv(src).split('\n') if not l.startswith('extends ')]
    print('\n'.join(lines))
