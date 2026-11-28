"""Untrusted OCR menu candidates for model-selected desktop input.

OCR is assistance, not a model decision or proof of gameplay. Only a small set
of known navigation labels is eligible; text never becomes code or a command.
"""
import csv
import io
import re
import subprocess
from collections import defaultdict

# Navigation options only, not game actions or an instruction script.
# User requested the story campaign, not skirmishes or tutorials.  The OCR
# candidates are assistance; the model still chooses whether and what to click.
LABELS = ('single player', 'new campaign',
          'easy', 'normal', 'hard', 'insane', 'start game', 'continue',
          'return', 'back')


def candidates_from_tsv(text):
    if not isinstance(text, str) or len(text) > 1_000_000:
        raise ValueError('Invalid OCR result')
    groups = defaultdict(list)
    for row in csv.DictReader(io.StringIO(text), delimiter='\t'):
        try:
            word = re.sub(r'[^A-Za-z]', '', row['text']).lower()
            conf = float(row['conf'])
            x,y,w,h = (int(row[k]) for k in ('left','top','width','height'))
            key = tuple(row[k] for k in ('page_num','block_num','par_num','line_num'))
        except (KeyError, TypeError, ValueError):
            continue
        if word and conf >= 25 and x >= 0 and y >= 0 and w > 0 and h > 0 and x+w <= 800 and y+h <= 600:
            groups[key].append((x,y,w,h,word))
    choices = []
    for words in groups.values():
        words.sort()
        normalized = ' '.join(v[4] for v in words)
        label = next((s for s in LABELS if normalized == s), None)
        if not label:
            continue
        x1 = min(w[0] for w in words); y1 = min(w[1] for w in words)
        x2 = max(w[0]+w[2] for w in words); y2 = max(w[1]+w[3] for w in words)
        choices.append({'label': label, 'at': ((x1+x2)//2, (y1+y2)//2)})
    return sorted(choices, key=lambda c: (c['at'][1], c['at'][0]))[:16]


def scan_menu(png):
    if not isinstance(png, bytes) or not 0 < len(png) <= 2_000_000:
        raise ValueError('Invalid screenshot')
    proc = subprocess.run(['tesseract', 'stdin', 'stdout', '--psm', '11', 'tsv'],
                          input=png, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                          timeout=20, check=True)
    return candidates_from_tsv(proc.stdout.decode('utf-8', errors='replace'))
