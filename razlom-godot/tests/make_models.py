"""Bake original box-model definitions into reusable native Godot scenes."""
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'assets/models'
OUT.mkdir(parents=True, exist_ok=True)
# part name, position, size, RGB hex, optional texture, static collision
GUARD = [
 ('Coat',(0,1.12,0),(.55,.65,.3),'ffffff','cloth',False),
 ('Head',(0,1.64,0),(.34,.35,.34),'c8a783','',False),
 ('Cap',(0,1.82,.01),(.4,.13,.4),'394642','',False),
 ('LegL',(-.15,.43,0),(.21,.76,.24),'394642','',False),
 ('LegR',(.15,.43,0),(.21,.76,.24),'394642','',False),
 ('ArmL',(-.4,1.05,-.13),(.18,.55,.22),'ffffff','cloth',False),
 ('ArmR',(.4,1.05,-.13),(.18,.55,.22),'ffffff','cloth',False),
 ('Weapon',(.25,1.14,-.42),(.12,.14,.65),'263431','',False),
]
TRUCK = [
 ('Chassis',(0,.8,0),(2.2,.4,4.4),'ffffff','metal',True),
 ('Cabin',(0,1.6,-1),(2.1,1.3,1.7),'ffffff','metal',True),
 ('Glass',(0,1.85,-1.87),(1.7,.6,.04),'8ba99c','',False),
 ('Cargo',(0,1.15,1.25),(1.9,.5,1.8),'ffffff','wood',False),
]
for x in (-1.1,1.1):
 for z in (-1.25,1.3):
  TRUCK.append((f'Wheel{len(TRUCK)}',(x,.52,z),(.35,.85,.85),'202d2c','',False))
for x in (-.75,.75):
 TRUCK.append((f'Lamp{len(TRUCK)}',(x,1.05,-2.23),(.35,.2,.05),'efd493','',False))
GUN = [
 ('Receiver',(0,0,0),(.14,.18,.55),'273b39','',False),
 ('Barrel',(0,.04,-.42),(.065,.07,.4),'273b39','',False),
 ('Grip',(0,-.17,.05),(.09,.26,.13),'ffffff','wood',False),
 ('Sight',(0,.13,-.15),(.03,.05,.12),'273b39','',False),
 ('Hand',(.04,-.14,.2),(.18,.19,.32),'af9878','',False),
]
def vec(x): return 'Vector3(' + ', '.join(str(v) for v in x) + ')'
def bake(name, parts):
 textures = sorted({p[4] for p in parts if p[4]})
 count = 1 + len(textures) + len(parts)*2 + sum(p[5] for p in parts)
 lines = [f'[gd_scene load_steps={count} format=3]', '']
 for t in textures:
  lines += [f'[ext_resource type="Texture2D" path="res://assets/textures/{t}.png" id="{t}"]', '']
 for i, (_, _, size, color, texture, solid) in enumerate(parts):
  rgb = [int(color[k:k+2],16)/255 for k in (0,2,4)]
  lines += [f'[sub_resource type="StandardMaterial3D" id="mat{i}"]',f'albedo_color = Color({rgb[0]}, {rgb[1]}, {rgb[2]}, 1)', 'roughness = 0.88']
  if texture: lines += [f'albedo_texture = ExtResource("{texture}")']
  lines += ['',f'[sub_resource type="BoxMesh" id="mesh{i}"]',f'size = {vec(size)}','']
  if solid: lines += [f'[sub_resource type="BoxShape3D" id="col{i}"]',f'size = {vec(size)}','']
 lines += [f'[node name="{name}" type="Node3D"]','']
 for i, (part, position, _, _, _, solid) in enumerate(parts):
  kind = 'StaticBody3D' if solid else 'Node3D'
  lines += [f'[node name="{part}" type="{kind}" parent="."]',f'position = {vec(position)}','',f'[node name="Visual" type="MeshInstance3D" parent="{part}"]',f'mesh = SubResource("mesh{i}")',f'material_override = SubResource("mat{i}")','']
  if solid: lines += [f'[node name="Collision" type="CollisionShape3D" parent="{part}"]',f'shape = SubResource("col{i}")','']
 (OUT/f'{name}.tscn').write_text('\n'.join(lines))
MEDIC = [(n, p, z, ('7aaea3' if n in ('Coat', 'ArmL', 'ArmR') else c), ('' if t == 'cloth' else t), b) for n,p,z,c,t,b in GUARD if n not in ('Weapon', 'Cap')]
MEDIC += [('Hair',(0,1.83,.03),(.36,.12,.33),'554d3e','',False), ('Bag',(.36,.8,.12),(.28,.3,.24),'d4cdb3','',False)]
DOG = [
 ('Body',(0,.55,0),(.42,.4,.8),'8a7760','',False),
 ('Head',(0,.7,-.52),(.33,.34,.35),'9c896b','',False),
 ('Muzzle',(0,.62,-.75),(.22,.16,.24),'c0aa82','',False),
 ('Nose',(0,.65,-.88),(.13,.1,.05),'27312e','',False),
 ('EarL',(-.13,.94,-.52),(.13,.22,.15),'5d594a','',False),
 ('EarR',(.13,.94,-.52),(.13,.22,.15),'5d594a','',False),
 ('LegFL',(-.14,.23,-.26),(.14,.45,.16),'645d4d','',False),
 ('LegFR',(.14,.23,-.26),(.14,.45,.16),'645d4d','',False),
 ('LegBL',(-.14,.23,.27),(.14,.45,.16),'645d4d','',False),
 ('LegBR',(.14,.23,.27),(.14,.45,.16),'645d4d','',False),
 ('Tail',(0,.64,.55),(.13,.13,.42),'645d4d','',False),
]
for name, parts in [('guard',GUARD),('truck',TRUCK),('carbine',GUN),('medic',MEDIC),('dog',DOG)]: bake(name,parts)
print('Baked guard, truck, carbine, medic and dog scenes')
