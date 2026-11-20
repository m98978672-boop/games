"""Original deterministic relay district materials; no external assets. Pillow required."""
from pathlib import Path
from PIL import Image
import math, random
out = Path(__file__).resolve().parents[1] / 'assets/textures'
for i, (name, color) in enumerate({'tile': (115,135,128), 'plaster': (176,164,134), 'gravel': (94,92,80), 'sandbag': (131,122,87)}.items()):
    rng = random.Random(908+i)
    heights=[]; pixels=[]
    for y in range(256):
        for x in range(256):
            n=rng.uniform(-5,5)
            if name=='tile': n-=24 if x%64<3 or y%64<3 else 0
            if name=='plaster': n+=4*math.sin(x*math.tau/64)*math.sin(y*math.tau/128)
            if name=='gravel': n+=rng.choice([-16,-8,0,8,14])
            if name=='sandbag': n+=3*((x%3)+(y%3)-2); n-=16 if y%64<3 else 0
            heights.append(max(0,min(255,int(128+n))))
            pixels.append(tuple(max(0,min(255,int(c+n))) for c in color))
    image=Image.new('RGB',(256,256));image.putdata(pixels);image.save(out/f'{name}.png')
    normal=Image.new('RGB',(256,256)); normal.putdata([(int(128+(heights[y*256+(x-1)%256]-heights[y*256+(x+1)%256])*0.9),int(128+(heights[((y-1)%256)*256+x]-heights[((y+1)%256)*256+x])*0.9),250) for y in range(256) for x in range(256)]);normal.save(out/'surface'/f'{name}_normal.png')
    Image.new('L',(256,256),220).save(out/'surface'/f'{name}_roughness.png')
