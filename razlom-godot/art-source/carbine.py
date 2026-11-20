"""Original fictional viewmodel, deterministic mesh/scene source. No external assets."""
from pathlib import Path
import math
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/models'
PARTS = OUT / 'parts'
PARTS.mkdir(exist_ok=True)

def bevel(name, rings):
    vertices = []
    for z, width, height, cy in rings:
        c = min(width, height) * .22
        for x, y in [(-width+c,-height),(width-c,-height),(width,-height+c),(width,height-c),(width-c,height),(-width+c,height),(-width,height-c),(-width,-height+c)]:
            vertices.append((x,y+cy,z))
    faces = []
    for i in range(len(rings)-1):
        for j in range(8):
            a=i*8+j; b=i*8+(j+1)%8; c=b+8; d=a+8
            faces.extend([(a,b,c),(a,c,d)])
    for j in range(1,7):
        faces.extend([(0,j+1,j),((len(rings)-1)*8,(len(rings)-1)*8+j,(len(rings)-1)*8+j+1)])
    # Flat normals per triangle preserve deliberate bevels. UVs are planar, not random.
    lines=['# Original fictional Razlom carbine part']
    for f in faces:
        a,b,c=[vertices[i] for i in f]
        u=[b[i]-a[i] for i in range(3)];v=[c[i]-a[i] for i in range(3)]
        n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
        length=math.sqrt(sum(t*t for t in n)); n=[t/length for t in n]
        first=sum(1 for line in lines if line.startswith('v '))+1
        for vertex in [a,b,c]:
            lines.append('v '+' '.join(map(str,vertex)))
            lines.append(f'vt {vertex[0]*3+0.5} {vertex[2]*3+0.5}')
            lines.append('vn '+' '.join(map(str,n)))
        lines.append('f '+' '.join(f'{i}/{i}/{i}' for i in range(first,first+3)))
    (PARTS / (name+'.obj')).write_text('\n'.join(lines)+'\n')

bevel('receiver',[(-.25,.045,.04,0),(-.2,.063,.063,0),(.14,.063,.063,0),(.18,.045,.045,0)])
bevel('stock',[(.12,.025,.025,-.015),(.25,.045,.042,-.04),(.43,.047,.08,-.055)])
bevel('handguard',[(-.46,.035,.04,0),(-.42,.048,.047,0),(-.22,.048,.047,0)])
bevel('magazine',[(0,.03,.06,0),(.1,.031,.055,-.012),(.22,.026,.047,-.045)])
resources=[]; nodes=['[node name="carbine" type="Node3D"]']
def resource(kind, text):
    rid='r'+str(len(resources));resources.append(f'[sub_resource type="{kind}" id="{rid}"]\n{text}');return rid
def mat(color,metal=0,rough=.65):
    return resource('StandardMaterial3D',f'albedo_color = Color({color}, 1)\nmetallic = {metal}\nroughness = {rough}')
steel=mat('0.16, 0.19, 0.2',.75,.38)
edge=mat('0.36, 0.39, 0.4',.8,.3)
black=mat('0.025, 0.035, 0.038',.2,.7)
wood=mat('0.24, 0.14, 0.08',0,.8)
cloth=mat('0.25, 0.32, 0.29',0,.94)
leather=mat('0.15, 0.12, 0.09',0,.86)
skin=mat('0.58, 0.43, 0.3',0,.88)
def node(name,pos=(0,0,0),parent='.',rotation=None):
    nodes.append(f'[node name="{name}" type="Node3D" parent="{parent}"]\nposition = Vector3{tuple(pos)}'+(f'\nrotation = Vector3{tuple(rotation)}' if rotation else ''))
    return name if parent=='.' else parent+'/'+name
def mesh(name,rid,material,pos=(0,0,0),parent='.',rotation=None,external=False):
    p=node(name,pos,parent,rotation)
    nodes.append(f'[node name="Visual" type="MeshInstance3D" parent="{p}"]\nmesh = '+('ExtResource' if external else 'SubResource')+f'("{rid}")\nmaterial_override = SubResource("{material}")\ncast_shadow = 0')
    return p
def box(name,size,material,pos=(0,0,0),parent='.',rotation=None):
    return mesh(name,resource('BoxMesh',f'size = Vector3{tuple(size)}'),material,pos,parent,rotation)
def cylinder(name,r,h,material,pos,parent='.',rotation=None):
    return mesh(name,resource('CylinderMesh',f'top_radius = {r}\nbottom_radius = {r}\nheight = {h}\nradial_segments = 12'),material,pos,parent,rotation)
for name,material in [('receiver',steel),('stock',wood),('handguard',wood)]:
    mesh(name.title(),name,material,external=True)
mesh('Magazine','magazine',steel,(0,-.045,-.05),rotation=(math.pi/2,0,0),external=True)
cylinder('Barrel',.015,.28,steel,(0,.015,-.57),rotation=(math.pi/2,0,0))
cylinder('Muzzle',.023,.035,edge,(0,.015,-.715),rotation=(math.pi/2,0,0))
cylinder('Bore',.012,.001,black,(0,.015,-.733),rotation=(math.pi/2,0,0))
box('ButtPad',(.1,.17,.022),black,(0,-.055,.44))
box('Grip',(.065,.16,.075),wood,(0,-.12,.11),rotation=(-.2,0,0))
box('TriggerLower',(.028,.012,.1),steel,(0,-.116,.025))
box('TriggerFront',(.028,.075,.012),steel,(0,-.08,-.02))
box('Trigger',(.012,.045,.012),black,(0,-.08,.035),rotation=(-.3,0,0))
box('RearSightBase',(.07,.018,.04),steel,(0,.073,.09))
for side in [-1,1]:
    box('RearSight'+str(side),(.012,.027,.013),edge,(side*.024,.09,.09))
box('FrontSightBase',(.05,.015,.045),steel,(0,.067,-.4))
box('FrontSightPost',(.009,.035,.009),edge,(0,.09,-.4))
box('EjectionPort',(.004,.035,.11),black,(.064,.008,-.02))
bolt=box('Bolt',(.012,.022,.075),edge,(.065,.008,-.02))
box('BoltHandle',(.045,.012,.015),steel,(.023,0,.02),parent=bolt)
for i in range(5):
    box('CoolingSlot%d'%i,(.004,.018,.018),black,(.049,.009,-.25-i*.032))
    box('GripRib%d'%i,(.069,.008,.081),leather,(0,-.072-i*.025,.11))
for i in range(3):
    box('MagazineRib%d'%i,(.063,.003,.15),edge,(0,.002+i*.025,.13),parent='Magazine')
for z in [-.16,.105]:
    cylinder('Pin'+str(z),.009,.131,edge,(0,-.015,z),rotation=(0,0,math.pi/2))
for side in ['Right','Left']:
    right=side=='Right'
    hand=node(side+'Hand',(.055,-.105,.115) if right else (-.005,-.075,-.33))
    box('Sleeve',(.085,.085,.24),cloth,(.035,-.055,.16) if right else (-.035,-.035,.17),parent=hand,rotation=(-.15,0,-.18 if right else .2))
    box('Cuff',(.085,.065,.045),leather,(0,-.01,.06),parent=hand)
    box('Palm',(.055,.09,.085) if right else (.085,.045,.12),leather,parent=hand)
    for i in range(4):
        if right:
            box('Finger%d'%i,(.065,.019,.025),leather,(-.025,.045-i*.026,-.047),parent=hand)
            box('FingerTip%d'%i,(.021,.019,.045),leather,(-.062,.045-i*.026,-.025),parent=hand)
            box('Knuckle%d'%i,(.014,.012,.017),skin,(-.007,.047-i*.026,-.063),parent=hand)
        else:
            box('Finger%d'%i,(.022,.055,.021),leather,(-.045,.026,-.045+i*.029),parent=hand)
            box('FingerTip%d'%i,(.034,.018,.021),leather,(-.035,.059,-.045+i*.029),parent=hand)
            box('Knuckle%d'%i,(.012,.014,.017),skin,(-.06,.026,-.045+i*.029),parent=hand)
    box('Thumb',(.028,.065,.03) if right else (.025,.065,.04),leather,(.003,.036,.04) if right else (.048,.026,.025),parent=hand,rotation=(0,0,-.4 if right else .3))
cylinder('SpentCase',.006,.027,mat('0.65, 0.45, 0.16',.7,.4),(.08,.01,-.02),rotation=(math.pi/2,0,0))
node('MuzzlePoint',(0,.015,-.75))
flash_mat=resource('StandardMaterial3D','shading_mode = 0\nalbedo_color = Color(1, 0.7, 0.2, 1)\nemission_enabled = true\nemission = Color(1, 0.45, 0.08, 1)\nemission_energy_multiplier = 2.0')
mesh('MuzzleFlash',resource('CylinderMesh','top_radius = 0.0\nbottom_radius = 0.028\nheight = 0.09\nradial_segments = 6'),flash_mat,(0,.015,-.785),rotation=(-math.pi/2,0,0))
ext='\n'.join(f'[ext_resource type="ArrayMesh" path="res://assets/models/parts/{name}.obj" id="{name}"]' for name in ['receiver','stock','handguard','magazine'])
(OUT/'carbine.tscn').write_text(f'[gd_scene load_steps={len(resources)+5} format=3]\n\n'+ext+'\n\n'+'\n\n'.join(resources)+'\n\n'+'\n\n'.join(nodes)+'\n')
