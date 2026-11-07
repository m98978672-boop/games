extends RefCounted
class_name SH2Soldier
## СЕКТОР «ПЕПЕЛ» — тело солдата по контурам и сечениям.
##
## Никаких коробок: торс — лофт по сечениям (суперэллипсы разной ширины),
## голова — тело вращения по обведённому профилю, конечности — лофт вдоль
## кости, ботинки — выдавливание бокового силуэта, жилет и подсумки —
## отдельные контуры с фаской.
##
## Скелет строится здесь же: 22 кости, те же имена, что в JS-версии, поэтому
## анимации и IK работают без изменений.

const V := Vector2

## Опорный скелет: [имя, родитель, позиция в родителе]
const BONES: Array = [
	["pelvis", "", Vector3(0, 0.92, 0)],
	["spine", "pelvis", Vector3(0, 0.16, 0)],
	["chest", "spine", Vector3(0, 0.16, 0)],
	["neck", "chest", Vector3(0, 0.20, 0)],
	["head", "neck", Vector3(0, 0.085, 0)],
	["shoulderL", "chest", Vector3(0.195, 0.125, 0)],
	["upperArmL", "shoulderL", Vector3(0.03, -0.035, 0)],
	["lowerArmL", "upperArmL", Vector3(0, -0.30, 0)],
	["handL", "lowerArmL", Vector3(0, -0.275, 0)],
	["shoulderR", "chest", Vector3(-0.195, 0.125, 0)],
	["upperArmR", "shoulderR", Vector3(-0.03, -0.035, 0)],
	["lowerArmR", "upperArmR", Vector3(0, -0.30, 0)],
	["handR", "lowerArmR", Vector3(0, -0.275, 0)],
	["hipL", "pelvis", Vector3(0.105, -0.06, 0)],
	["upperLegL", "hipL", Vector3(0, 0, 0)],
	["lowerLegL", "upperLegL", Vector3(0, -0.44, 0)],
	["footL", "lowerLegL", Vector3(0, -0.42, 0)],
	["hipR", "pelvis", Vector3(-0.105, -0.06, 0)],
	["upperLegR", "hipR", Vector3(0, 0, 0)],
	["lowerLegR", "upperLegR", Vector3(0, -0.44, 0)],
	["footR", "lowerLegR", Vector3(0, -0.42, 0)],
]


## Скелет + пустой оружейный слот
static func build_skeleton(type_id: String, scale_mul: float = 1.0) -> Node3D:
	var root := Node3D.new()
	root.name = "soldier_" + type_id
	var bones := {}
	for def in BONES:
		var b := Node3D.new()
		b.name = def[0]
		b.position = def[2]
		b.rotation_order = EULER_ORDER_YXZ
		if def[1] == "":
			root.add_child(b)
		else:
			bones[def[1]].add_child(b)
		bones[def[0]] = b
	var weapon_slot := Node3D.new()
	weapon_slot.name = "weapon_slot"
	weapon_slot.position = Vector3(0.135, 0.01, 0.235)
	weapon_slot.rotation = Vector3(-0.05, 0.09, 0)
	bones["chest"].add_child(weapon_slot)
	bones["weapon"] = weapon_slot
	root.scale = Vector3.ONE * scale_mul
	root.set_meta("bones", bones)
	return root


## Сечение торса: сглаженный прямоугольник
static func torso_section(width: float, depth: float, power: float = 0.55, segs: int = 12) -> Array:
	var pts: Array = []
	for i in segs:
		var a := TAU * float(i) / float(segs)
		var ca := cos(a)
		var sa := sin(a)
		pts.append(Vector2(signf(ca) * pow(absf(ca), power) * width * 0.5,
			signf(sa) * pow(absf(sa), power) * depth * 0.5))
	return pts


static func circle(r: float, segs: int = 12) -> Array:
	var pts: Array = []
	for i in segs:
		var a := TAU * float(i) / float(segs)
		pts.append(Vector2(cos(a) * r, sin(a) * r))
	return pts


## Лофт вдоль вертикали по сечениям-кругам
static func limb(sections: Array) -> ArrayMesh:
	var secs: Array = []
	for s in sections:
		secs.append({"at": s[0], "pts": circle(s[1])})
	return SH2Outline.loft_sections(secs)


## Собирает тело в кости. add(bone_name, node) — устанавливает деталь.
static func build_body(root: Node3D, palette: Dictionary) -> void:
	var bones: Dictionary = root.get_meta("bones")
	var body: Color = palette.get("body", Color("#3f4a38"))
	var gear: Color = palette.get("gear", Color("#2a2f2a"))
	var skin: Color = palette.get("skin", Color("#c9a184"))
	var accent: Color = palette.get("accent", Color("#b2483a"))

	var add := func(bone_name: String, mesh: Mesh, color: Color, opts: Dictionary = {}) -> void:
		var mi := SH2Outline.mesh_node(mesh, color, opts)
		bones[bone_name].add_child(mi)

	# --- голова: череп телом вращения ---
	var skull := SH2Outline.revolve([
		[-0.070, 0.030], [-0.058, 0.062], [-0.030, 0.080], [0.006, 0.082],
		[0.044, 0.076], [0.070, 0.058], [0.082, 0.030], [0.086, 0.006],
	], {"segments": 16, "scale": Vector3(1.0, 1.0, 1.12)})
	add.call("head", skull, skin)
	# визор
	var visor := SH2Outline.outline_mesh([
		V(0.082, 0.052), V(0.100, 0.046), V(0.102, 0.030), V(0.082, 0.026), V(0.080, 0.040),
	], {"depth": 0.105, "bevel": 0.006})
	var visor_node := SH2Outline.mesh_node(visor, Color("#1b2126"), {"roughness": 0.25})
	visor_node.position = Vector3(0, 0.040, 0.006)
	bones["head"].add_child(visor_node)
	# дыхательная маска
	var breather := SH2Outline.revolve([[0, 0.030], [0.012, 0.036], [0.034, 0.032], [0.042, 0.016], [0.044, 0.0]],
		{"segments": 10})
	var br_node := SH2Outline.mesh_node(breather, Color("#22262a"))
	br_node.rotation = Vector3(PI * 0.5, 0, 0)
	br_node.position = Vector3(0, 0.054, 0.086)
	bones["head"].add_child(br_node)
	# каска
	var dome := SH2Outline.revolve([
		[0.0, 0.132], [0.016, 0.130], [0.038, 0.120], [0.058, 0.100],
		[0.072, 0.072], [0.082, 0.034], [0.088, 0.006],
	], {"segments": 18, "scale": Vector3(1.02, 1.0, 1.10)})
	var dome_node := SH2Outline.mesh_node(dome, gear, {"roughness": 0.85})
	dome_node.position = Vector3(0, 0.114, 0.010)
	bones["head"].add_child(dome_node)
	# козырёк
	var brim := SH2Outline.outline_mesh([
		V(-0.012, 0.010), V(0.060, 0.004), V(0.088, -0.010), V(0.090, -0.020), V(-0.012, -0.014),
	], {"depth": 0.150, "bevel": 0.006})
	var brim_node := SH2Outline.mesh_node(brim, gear)
	brim_node.position = Vector3(0, 0.200, 0.068)
	bones["head"].add_child(brim_node)
	# наушники
	for s in [-1.0, 1.0]:
		var ear := SH2Outline.revolve([[0, 0.020], [0.012, 0.030], [0.030, 0.028], [0.036, 0.0]], {"segments": 10})
		var ear_node := SH2Outline.mesh_node(ear, Color("#1b1f22"))
		ear_node.rotation = Vector3(0, 0, PI * 0.5)
		ear_node.position = Vector3(s * 0.088, 0.125, 0.010)
		bones["head"].add_child(ear_node)

	# --- шея ---
	var neck := SH2Outline.revolve([[0, 0.050], [0.055, 0.048], [0.10, 0.052], [0.12, 0.058]], {"segments": 12})
	add.call("neck", neck, skin)

	# --- торс: лофт по сечениям ---
	var torso := SH2Outline.loft_sections([
		{"at": Vector3(0, -0.10, 0.005), "pts": torso_section(0.27, 0.17)},
		{"at": Vector3(0, -0.04, 0.005), "pts": torso_section(0.29, 0.185)},
		{"at": Vector3(0, 0.04, 0.005), "pts": torso_section(0.315, 0.205)},
		{"at": Vector3(0, 0.10, 0.004), "pts": torso_section(0.345, 0.225)},
		{"at": Vector3(0, 0.155, 0.0), "pts": torso_section(0.375, 0.235)},
		{"at": Vector3(0, 0.195, -0.005), "pts": torso_section(0.34, 0.21)},
		{"at": Vector3(0, 0.215, -0.01), "pts": torso_section(0.24, 0.17)},
	])
	add.call("chest", torso, body, {"roughness": 0.8})

	# бронежилет
	var vest := SH2Outline.loft_sections([
		{"at": Vector3(0, -0.045, 0.01), "pts": torso_section(0.30, 0.20)},
		{"at": Vector3(0, 0.02, 0.012), "pts": torso_section(0.325, 0.225)},
		{"at": Vector3(0, 0.09, 0.012), "pts": torso_section(0.35, 0.245)},
		{"at": Vector3(0, 0.145, 0.008), "pts": torso_section(0.335, 0.235)},
	])
	add.call("chest", vest, gear, {"roughness": 0.9})
	# нагрудная планка
	var plate := SH2Outline.outline_mesh([
		V(-0.088, 0.088), V(0.088, 0.088), V(0.088, 0.048), V(-0.088, 0.048),
	], {"depth": 0.055, "bevel": 0.008})
	var plate_node := SH2Outline.mesh_node(plate, accent, {"metallic": 0.3})
	plate_node.position = Vector3(0, 0.048, 0.118)
	bones["chest"].add_child(plate_node)
	# подсумки
	for s in [-1.0, 1.0]:
		var pouch := SH2Outline.outline_mesh([
			V(-0.032, 0.038), V(0.032, 0.038), V(0.034, -0.030), V(-0.034, -0.030),
		], {"depth": 0.045, "bevel": 0.008})
		var p_node := SH2Outline.mesh_node(pouch, Color("#35393c"))
		p_node.position = Vector3(s * 0.085, -0.005, 0.125)
		bones["chest"].add_child(p_node)
	# рюкзак
	var pack := SH2Outline.outline_mesh([
		V(-0.115, 0.135), V(0.115, 0.130), V(0.125, 0.060), V(0.115, -0.090),
		V(-0.115, -0.090), V(-0.125, 0.060),
	], {"depth": 0.155, "bevel": 0.028})
	var pack_node := SH2Outline.mesh_node(pack, gear)
	pack_node.position = Vector3(0, 0.045, -0.145)
	bones["chest"].add_child(pack_node)

	# --- поясница ---
	var waist := SH2Outline.loft_sections([
		{"at": Vector3(0, -0.06, 0), "pts": torso_section(0.265, 0.18)},
		{"at": Vector3(0, 0.0, 0), "pts": torso_section(0.28, 0.19)},
		{"at": Vector3(0, 0.05, 0), "pts": torso_section(0.285, 0.195)},
	])
	add.call("spine", waist, body)

	# --- таз + ремень ---
	var pelvis := SH2Outline.loft_sections([
		{"at": Vector3(0, -0.075, 0), "pts": torso_section(0.30, 0.20)},
		{"at": Vector3(0, -0.02, 0), "pts": torso_section(0.325, 0.215)},
		{"at": Vector3(0, 0.045, 0), "pts": torso_section(0.315, 0.205)},
	])
	add.call("pelvis", pelvis, gear)
	for s in [-1.0, 1.0]:
		var hip_pouch := SH2Outline.outline_mesh([
			V(-0.042, 0.050), V(0.042, 0.050), V(0.046, -0.055), V(-0.046, -0.055),
		], {"depth": 0.070, "bevel": 0.010})
		var hp := SH2Outline.mesh_node(hip_pouch, Color("#2a2e31"))
		hp.position = Vector3(s * 0.135, -0.075, 0.045)
		bones["pelvis"].add_child(hp)

	# --- руки ---
	for side in [["L", 1.0], ["R", -1.0]]:
		var sfx: String = side[0]
		var sgn: float = side[1]
		var cap := SH2Outline.revolve([[0, 0.070], [0.020, 0.078], [0.050, 0.072], [0.070, 0.050], [0.078, 0.0]],
			{"segments": 12})
		add.call("shoulder" + sfx, cap, body)
		add.call("upperArm" + sfx, limb([
			[Vector3(0, -0.055, 0), 0.058], [Vector3(0, -0.13, 0), 0.056],
			[Vector3(0, -0.22, 0), 0.050], [Vector3(0, -0.28, 0), 0.047],
		]), body)
		add.call("upperArm" + sfx, limb([
			[Vector3(0, -0.020, 0), 0.062], [Vector3(0, -0.085, 0), 0.060], [Vector3(0, -0.090, 0), 0.055],
		]), gear)
		add.call("lowerArm" + sfx, limb([
			[Vector3(0, -0.010, 0), 0.050], [Vector3(0, -0.09, 0), 0.046],
			[Vector3(0, -0.19, 0), 0.040], [Vector3(0, -0.25, 0), 0.038],
		]), body)
		add.call("lowerArm" + sfx, limb([
			[Vector3(0, -0.075, 0.012), 0.050], [Vector3(0, -0.145, 0.012), 0.046], [Vector3(0, -0.155, 0.012), 0.040],
		]), gear)
		add.call("hand" + sfx, limb([
			[Vector3(0, -0.010, 0), 0.040], [Vector3(0, -0.045, 0.004), 0.044],
			[Vector3(0, -0.085, 0.006), 0.040], [Vector3(0, -0.100, 0.004), 0.030],
		]), Color("#1e2226"))

	# --- ноги ---
	for side in [["L", 1.0], ["R", -1.0]]:
		var sfx2: String = side[0]
		var hip_cap := SH2Outline.revolve([[0, 0.076], [0.020, 0.080], [0.050, 0.074], [0.070, 0.050]], {"segments": 12})
		add.call("hip" + sfx2, hip_cap, gear)
		add.call("upperLeg" + sfx2, limb([
			[Vector3(0, -0.02, 0), 0.088], [Vector3(0, -0.13, 0.004), 0.082],
			[Vector3(0, -0.26, 0.006), 0.072], [Vector3(0, -0.36, 0.004), 0.064],
			[Vector3(0, -0.41, 0), 0.060],
		]), body)
		add.call("lowerLeg" + sfx2, limb([
			[Vector3(0, 0.0, 0.004), 0.070], [Vector3(0, -0.10, 0.004), 0.064],
			[Vector3(0, -0.22, 0.002), 0.052], [Vector3(0, -0.33, 0), 0.046],
			[Vector3(0, -0.38, 0), 0.042],
		]), body)
		# наколенник
		var pad := SH2Outline.outline_mesh([
			V(-0.045, 0.045), V(0.045, 0.045), V(0.040, -0.040), V(-0.040, -0.040),
		], {"depth": 0.045, "bevel": 0.010})
		var pad_node := SH2Outline.mesh_node(pad, gear)
		pad_node.position = Vector3(0, -0.075, 0.062)
		bones["lowerLeg" + sfx2].add_child(pad_node)
		# ботинок: боковой силуэт, выдавленный на ширину стопы
		var boot := SH2Outline.outline_mesh([
			V(-0.075, 0.150), V(0.030, 0.158), V(0.058, 0.120), V(0.150, 0.062),
			V(0.190, 0.040), V(0.196, 0.014), V(0.150, 0.006), V(-0.072, 0.006),
		], {"depth": 0.110, "bevel": 0.012})
		var boot_node := SH2Outline.mesh_node(boot, Color("#191d20"), {"roughness": 0.95})
		boot_node.position = Vector3(0, 0.006, 0.015)
		bones["foot" + sfx2].add_child(boot_node)
		var sole := SH2Outline.outline_mesh([
			V(-0.078, 0.014), V(0.198, 0.014), V(0.200, 0.0), V(-0.080, 0.0),
		], {"depth": 0.118, "bevel": 0.004})
		var sole_node := SH2Outline.mesh_node(sole, Color("#0f1214"))
		sole_node.position = Vector3(0, 0.002, 0.015)
		bones["foot" + sfx2].add_child(sole_node)


## Полный риг: скелет + тело + оружие в слоте
static func build(type_id: String, opts: Dictionary = {}) -> Node3D:
	var cfg: Dictionary = SH2Data.enemy_by_id(type_id)
	var is_player: bool = bool(opts.get("player", false))
	var scale_mul: float = float(opts.get("scale", cfg.get("scale", 1.0)))
	var root := build_skeleton(type_id, 1.0)
	root.scale = Vector3.ONE * scale_mul
	build_body(root, {
		"skin": Color("#d8b394") if is_player else cfg["skin"],
		"body": Color("#2f3a4a") if is_player else cfg["body_color"],
		"gear": Color("#1a2230") if is_player else cfg["gear_color"],
		"accent": Color("#6fc8ff") if is_player else Color("#b2483a"),
	})
	return root


## Плоский статичный скелет для меню/лаборатории (без масштаба типа)
static func bone_map(root: Node3D) -> Dictionary:
	if root.has_meta("bones"):
		return root.get_meta("bones")
	return {}
