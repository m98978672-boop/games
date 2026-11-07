extends RefCounted
class_name SH2Ragdoll
## СЕКТОР «ПЕПЕЛ» — регдолл из точек (Verlet) с оптимизацией (порт).
##
## 17 точек: голова, шея, грудь, таз, два плеча, два локтя, две кисти,
## два бедра, два колена, две стопы + оружие.
##
## Оптимизация, не ухудшающая картинку:
##   1. Адаптивный подшаг: крупный шаг в полёте, два подшага у пола.
##   2. Сон по суммарной энергии — симуляция выключается совсем.
##   3. Столкновения только с ближайшими AABB, ранний отсев по Y.
##   4. Матрицы костей обновляются только пока кукла живая.

const GRAV := -13.5
const SHOW_POINTS := false

# точки: [имя, кость, локальная позиция, масса]
const POINTS: Array = [
	["head", "head", Vector3(0, 0.12, 0), 1.0],
	["neck", "neck", Vector3(0, 0.04, 0), 0.9],
	["chest", "chest", Vector3(0, 0.10, 0), 2.6],
	["pelvis", "pelvis", Vector3(0, 0.02, 0), 2.4],
	["shL", "upperArmL", Vector3(0, -0.06, 0), 0.8],
	["elL", "lowerArmL", Vector3(0, -0.04, 0), 0.7],
	["hdL", "handL", Vector3(0, -0.06, 0), 0.5],
	["shR", "upperArmR", Vector3(0, -0.06, 0), 0.8],
	["elR", "lowerArmR", Vector3(0, -0.04, 0), 0.7],
	["hdR", "handR", Vector3(0, -0.06, 0), 0.5],
	["hipL", "upperLegL", Vector3(0, -0.04, 0), 1.2],
	["knL", "lowerLegL", Vector3(0, -0.05, 0), 0.9],
	["ftL", "footL", Vector3(0, -0.16, 0.06), 0.6],
	["hipR", "upperLegR", Vector3(0, -0.04, 0), 1.2],
	["knR", "lowerLegR", Vector3(0, -0.05, 0), 0.9],
	["ftR", "footR", Vector3(0, -0.16, 0.06), 0.6],
	["wpn", "__weapon", Vector3(0, 0, 0.10), 0.7],
]

# связи: [a, b, жёсткость, допуск]
const LINKS: Array = [
	["head", "neck", 1.0, 0.05], ["neck", "chest", 1.0, 0.05], ["chest", "pelvis", 1.0, 0.05],
	["chest", "shL", 0.95, 0.05], ["chest", "shR", 0.95, 0.05],
	["shL", "elL", 1.0, 0.02], ["elL", "hdL", 1.0, 0.02],
	["shR", "elR", 1.0, 0.02], ["elR", "hdR", 1.0, 0.02],
	["pelvis", "hipL", 1.0, 0.04], ["hipL", "knL", 1.0, 0.02], ["knL", "ftL", 1.0, 0.02],
	["pelvis", "hipR", 1.0, 0.04], ["hipR", "knR", 1.0, 0.02], ["knR", "ftR", 1.0, 0.02],
	["hdR", "wpn", 1.0, 0.05], ["hdL", "wpn", 0.6, 0.12],
	["head", "chest", 0.55, 0.3], ["pelvis", "chest", 0.45, 0.35],
	["hipL", "hipR", 0.35, 0.25], ["shL", "shR", 0.3, 0.3],
	["knL", "hipR", 0.18, 0.5], ["knR", "hipL", 0.18, 0.5],
]

var rig: Node3D
var bones: Dictionary
var points: Array = []
var links: Array = []
var by_name: Dictionary = {}
var active: bool = false
var sleeping: bool = false
var rest_frame: int = 0
var total_substeps: int = 0
var energy: float = 0.0
var dead_timer: float = 0.0
var weapon_detached: bool = false
var detached: Dictionary = {}


func _init(rig_node: Node3D) -> void:
	rig = rig_node
	bones = rig_node.get_meta("bones", {})


## Захват позы: мировые позиции точек костей
func capture(velocity: Vector3 = Vector3.ZERO) -> void:
	points.clear()
	by_name.clear()
	for def in POINTS:
		var bone: Node3D = bones.get(def[1], bones.get("chest"))
		var p: Vector3 = bone.global_position + bone.global_basis * (def[2] as Vector3)
		var pt := {
			"name": def[0],
			"bone": bone,
			"local": def[2],
			"pos": p,
			"prev": p - velocity * 0.016 + Vector3(randf_range(-0.01, 0.01),
				randf_range(-0.01, 0.01), randf_range(-0.01, 0.01)),
			"mass": def[3],
			"inv_mass": 1.0 / float(def[3]) if float(def[3]) > 0.0 else 0.0,
		}
		points.append(pt)
		by_name[def[0]] = pt
	links.clear()
	for l in LINKS:
		var a: Dictionary = by_name[l[0]]
		var b: Dictionary = by_name[l[1]]
		links.append({"a": a, "b": b, "rest": (a["pos"] as Vector3).distance_to(b["pos"]),
			"stiff": float(l[2]), "slack": float(l[3])})
	active = true
	sleeping = false
	rest_frame = 0
	dead_timer = 0.0


func impulse(point_name: String, dir: Vector3, strength: float) -> void:
	if not by_name.has(point_name):
		return
	var p: Dictionary = by_name[point_name]
	p["prev"] = (p["prev"] as Vector3) - dir * (strength * 0.016 * float(p["mass"]))
	sleeping = false
	rest_frame = 0


## Гасим остаточное дрожание — кукла гарантированно засыпает
func settle_all(factor: float) -> void:
	for p in points:
		var pos: Vector3 = p["pos"]
		var prev: Vector3 = p["prev"]
		p["prev"] = prev + (pos - prev) * factor


func update(dt: float, colliders: Array) -> void:
	if not active or sleeping:
		return
	var ground_pen := _ground_contact_guess()
	var h: float = minf(0.04, dt) / (2.0 if ground_pen else 1.0)
	var steps: int = int(ceil(minf(dt, 0.06) / h))
	for s in steps:
		_integrate(h)
	total_substeps += steps
	_solve_constraints(colliders)
	_write_back()
	var sum_energy := 0.0
	for p in points:
		var d: Vector3 = (p["pos"] as Vector3) - (p["prev"] as Vector3)
		sum_energy += d.length_squared()
	energy = sum_energy
	if energy < 0.00024:
		rest_frame += 1
		settle_all(0.15)
		if rest_frame > 22:
			sleeping = true
	else:
		rest_frame = 0


func _ground_contact_guess() -> bool:
	for p in points:
		if (p["pos"] as Vector3).y < 0.30:
			return true
	return false


func _integrate(h: float) -> void:
	for p in points:
		if float(p["inv_mass"]) == 0.0:
			continue
		var pos: Vector3 = p["pos"]
		var v: Vector3 = pos - (p["prev"] as Vector3)
		p["prev"] = pos
		var damp := 0.994
		pos = pos + v * damp + Vector3(0, GRAV * h * h, 0)
		if pos.y < 0.06:
			pos.y = 0.06
			# трение о пол
			p["prev"] = Vector3(pos.x - v.x * 0.58, p["prev"].y, pos.z - v.z * 0.58)
		p["pos"] = pos


func _solve_constraints(colliders: Array) -> void:
	for _iter in 6:
		for L in links:
			var a: Dictionary = L["a"]
			var b: Dictionary = L["b"]
			var pa: Vector3 = a["pos"]
			var pb: Vector3 = b["pos"]
			var d: Vector3 = pb - pa
			var dist: float = d.length()
			if dist < 1e-6:
				continue
			var diff: float = (dist - float(L["rest"])) / dist
			var corr: float = diff * float(L["stiff"])
			var wa: float = float(a["inv_mass"])
			var wb: float = float(b["inv_mass"])
			var wsum: float = wa + wb
			if wsum <= 0.0:
				wsum = 1.0
			var c: Vector3 = d * corr
			if wa > 0.0:
				a["pos"] = pa + c * (wa / wsum)
			if wb > 0.0:
				b["pos"] = pb - c * (wb / wsum)
		if colliders.is_empty():
			continue
		for p in points:
			var pos: Vector3 = p["pos"]
			for c2 in colliders:
				if pos.y > float(c2["h"]):
					continue
				if absf(pos.x - float(c2["x"])) > float(c2["hw"]) + 0.08:
					continue
				if absf(pos.z - float(c2["z"])) > float(c2["hd"]) + 0.08:
					continue
				var dx: float = pos.x - float(c2["x"])
				var dz: float = pos.z - float(c2["z"])
				var ox: float = (float(c2["hw"]) + 0.06) - absf(dx)
				var oz: float = (float(c2["hd"]) + 0.06) - absf(dz)
				if ox < oz:
					pos.x = float(c2["x"]) + signf(dx if dx != 0.0 else 1.0) * (float(c2["hw"]) + 0.06)
				else:
					pos.z = float(c2["z"]) + signf(dz if dz != 0.0 else 1.0) * (float(c2["hd"]) + 0.06)
			p["pos"] = pos


func _write_back() -> void:
	var up := Vector3(0, 1, 0)
	var chains: Array = [
		["head", "neck", "head"], ["neck", "chest", "neck"], ["chest", "pelvis", "chest"],
		["shoulderL", "shL", "chest"], ["upperArmL", "shL", "elL"], ["lowerArmL", "elL", "hdL"],
		["handL", "hdL", "hdL"],
		["shoulderR", "shR", "chest"], ["upperArmR", "shR", "elR"], ["lowerArmR", "elR", "hdR"],
		["handR", "hdR", "hdR"],
		["hipL", "hipL", "hipL"], ["upperLegL", "hipL", "knL"], ["lowerLegL", "knL", "ftL"],
		["footL", "ftL", "ftL"],
		["hipR", "hipR", "hipR"], ["upperLegR", "hipR", "knR"], ["lowerLegR", "knR", "ftR"],
		["footR", "ftR", "ftR"],
	]
	for chain in chains:
		var bone: Node3D = bones.get(chain[0], null)
		var A: Dictionary = by_name.get(chain[1], {})
		var B: Dictionary = by_name.get(chain[2], {})
		if bone == null or A.is_empty():
			continue
		var parent: Node3D = bone.get_parent()
		var pos: Vector3 = parent.global_basis.inverse() * ((A["pos"] as Vector3) - parent.global_position)
		bone.position = pos
		if not B.is_empty() and A != B:
			var look: Vector3 = ((B["pos"] as Vector3) - (A["pos"] as Vector3)).normalized()
			if look.length_squared() > 1e-8:
				bone.quaternion = Quaternion(up, -look)
	# оружие в руке
	var wp: Dictionary = by_name.get("wpn", {})
	var slot: Node3D = bones.get("weapon", null)
	if not wp.is_empty() and slot != null:
		var pw: Node3D = slot.get_parent()
		slot.position = pw.global_basis.inverse() * ((wp["pos"] as Vector3) - pw.global_position)
		slot.rotation = Vector3(sin(dead_timer * 0.9) * 0.6, dead_timer * 0.4, cos(dead_timer * 0.7) * 0.4)
	dead_timer += 0.016


## Оружие отлетает от куклы отдельным телом (падение, вращение, сон)
func detach_weapon() -> Dictionary:
	if weapon_detached:
		return {}
	var slot: Node3D = bones.get("weapon", null)
	if slot == null or slot.get_child_count() == 0:
		return {}
	var mesh_node: Node3D = slot.get_child(0)
	var wp: Dictionary = by_name.get("wpn", {})
	var pos: Vector3 = (wp["pos"] as Vector3) if not wp.is_empty() else slot.global_position
	pos.y = maxf(0.12, pos.y)
	var vel := Vector3(randf_range(-0.5, 0.5), 0.45, randf_range(-0.5, 0.5))
	if not wp.is_empty():
		vel = ((wp["pos"] as Vector3) - (wp["prev"] as Vector3)) * 7000.0 + Vector3(0, 0.4, 0)
	slot.remove_child(mesh_node)
	weapon_detached = true
	var world_parent: Node = rig.get_parent()
	world_parent.add_child(mesh_node)
	mesh_node.global_position = pos
	detached = {
		"node": mesh_node,
		"pos": pos,
		"vel": vel,
		"spin": Vector3(randf_range(-7.0, 7.0), randf_range(-5.0, 5.0), randf_range(-7.0, 7.0)),
		"rot": Vector3(randf() * 0.6, randf() * 6.28, randf() * 0.6),
		"rest_y": 0.055,
		"asleep": false,
	}
	return detached


## Шаг полёта оружия
static func step_weapon(body: Dictionary, dt: float) -> void:
	if body.is_empty() or bool(body["asleep"]):
		return
	var vel: Vector3 = body["vel"]
	vel.y -= 18.0 * dt
	var pos: Vector3 = body["pos"] + vel * dt
	var rot: Vector3 = body["rot"] + (body["spin"] as Vector3) * dt
	var spin: Vector3 = body["spin"]
	if pos.y <= float(body["rest_y"]):
		pos.y = float(body["rest_y"])
		vel.y = absf(vel.y) * 0.22
		vel.x *= 0.55
		vel.z *= 0.55
		spin *= 0.35
		if vel.length_squared() < 0.02 and absf(spin.x) + absf(spin.z) < 0.6:
			body["asleep"] = true
	body["vel"] = vel
	body["pos"] = pos
	body["rot"] = rot
	body["spin"] = spin
	var node: Node3D = body["node"]
	if is_instance_valid(node):
		node.global_position = pos
		node.rotation = rot


func dispose() -> void:
	active = false
	points.clear()
	links.clear()
