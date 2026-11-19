"""Bake fitted clothing, hair color and a compact indexed mesh from CC0 MakeHuman input.
Usage: python3 iinga/tools/fit-makehuman.py base.obj caucasian-female-young.target > iinga/assets/avatar.json
"""
import json
import sys

vertices = []
faces = []
group = ''
with open(sys.argv[1]) as source:
    for row in source:
        keys = row.split()
        if not keys:
            continue
        if keys[0] == 'v':
            vertices.append(list(map(float, keys[1:4])))
        elif keys[0] == 'g':
            group = keys[1]
        elif keys[0] == 'f' and group == 'body':
            faces.append([int(ref.split('/')[0])-1 for ref in keys[1:]])
with open(sys.argv[2]) as source:
    for row in source:
        keys = row.split()
        if len(keys) == 4 and keys[0].isdigit():
            for axis, delta in enumerate(keys[1:]):
                vertices[int(keys[0])][axis] += float(delta)

groups = {}
for face in faces:
    x,y,z = [sum(vertices[i][axis] for i in face)/len(face) for axis in range(3)]
    # The source pose is a low A-pose; retain authored fingers and face topology.
    arm = abs(x) > 1.67 and y > 1.2
    if y < -7.58:
        kind = 'shoes'
    elif y < -.9 and not arm:
        kind = 'legs'
    elif abs(x)>3.85 and y>.6:
        kind = 'skin'
    elif y > 7.57 or (y > 6.56 and z < .29):
        kind = 'hair'
    elif y > 6.12:
        kind = 'skin'
    elif y > 4.15 and z > .51 and abs(x) < max(.08,(y-4.16)*.32):
        kind = 'skin'
    else:
        kind = 'jacket'
    group = groups.setdefault(kind, ([],[],{}))
    pos, indices, lookup = group
    for i in face:
        if i in lookup:
            continue
        px,py,pz = vertices[i]
        lookup[i] = len(pos)//3
        pos.extend(round(v,5) for v in (px*.1,(py+8.32)*.1,(pz-.55)*.1))
    for a in range(1,len(face)-1):
        indices.extend(lookup[face[b]] for b in (0,a,a+1))
print(json.dumps({name:{'positions':p,'indices':i} for name,(p,i,_) in groups.items()},separators=(',',':')))
