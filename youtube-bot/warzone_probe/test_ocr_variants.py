"""One-shot menu OCR analysis, never chooses or performs game actions."""
import io
import json
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageOps, ImageEnhance

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from warzone_menu_ocr import candidates_from_tsv
im = Image.open(sys.argv[1]).convert('RGB')
variants = {'raw': im, 'contrast': ImageEnhance.Contrast(ImageOps.grayscale(im)).enhance(2),
            'autocontrast': ImageOps.autocontrast(ImageOps.grayscale(im)),
            'invert': ImageOps.invert(ImageOps.autocontrast(ImageOps.grayscale(im)))}
for name, image in variants.items():
    buf = io.BytesIO(); image.save(buf, format='PNG')
    proc = subprocess.run(['tesseract','stdin','stdout','--psm','11','tsv'],input=buf.getvalue(), capture_output=True,check=True,timeout=30)
    tsv=proc.stdout.decode('utf-8',errors='replace')
    parsed=candidates_from_tsv(tsv)
    rows=[line.split('\t')[-1] for line in tsv.splitlines()[1:] if len(line.split('\t'))>=12 and line.split('\t')[-1]]
    msg=json.dumps({'variant':name,'candidates':parsed,'recognized_words':rows[:80]},ensure_ascii=True)
    print('::notice::OCRDIAG '+msg)
