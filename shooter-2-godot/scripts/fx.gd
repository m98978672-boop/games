extends Node3D
class_name SH2Fx
## СЕКТОР «ПЕПЕЛ» — эффекты: пулы частиц, трассеры, вспышки, декали, взрывы.
##
## Всё на пулах: один MultiMesh на тип эффекта (240 частиц = 1 draw call),
## трассеры живут 60 мс, декали переиспользуются по кольцу.

const MAX_TRACERS: int = 30
const MAX_FLASHES: int = 6
const MAX_DECALS: int = 34

var sparks: ParticlePool
var blood: ParticlePool
var dust: ParticlePool
var casings: ParticlePool
var smoke: ParticlePool

var tracer_mesh: MultiMesh
var tracer_items: Array = []
var tracer_cursor: int = 0

var flash_meshes: Array = []
var flash_lights: Array = []
var flash_life: PackedFloat32Array
var flash_cursor: int = 0

var decals: Array = []
var decal_cursor: int = 0
var rings: Array = []

var _tracer_tint: Color = Color(1.0, 0.82, 0.48)
var counts: Dictionary = {"particles": 0, "tracers": 0}


## ------------------------------- пул частиц -------------------------------
class ParticlePool:
	var mm: MultiMesh
	var parts: Array = []
	var free_idx: Array = []
	var count: int = 0
	var active_count: int = 0
	var color: Color = Color.WHITE
	var gravity: float = 9.8
	var base_size: float = 1.0

	func _init(parent: Node3D, n: int, size: float, tint: Color, glow: bool = false) -> void:
		count = n
		color = tint
		base_size = size
		var cube := BoxMesh.new()
		cube.size = Vector3.ONE
		var mat := StandardMaterial3D.new()
		mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED if glow \
			else BaseMaterial3D.SHADING_MODE_PER_PIXEL
		mat.albedo_color = tint
		if glow:
			mat.emission_enabled = true
			mat.emission = tint
			mat.emission_energy_multiplier = 2.4
		mat.vertex_color_use_as_albedo = not glow
		cube.material = mat
		mm = MultiMesh.new()
		mm.transform_format = MultiMesh.TRANSFORM_3D
		mm.use_colors = true
		mm.mesh = cube
		mm.instance_count = n
		var node := MultiMeshInstance3D.new()
		node.multimesh = mm
		node.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		parent.add_child(node)
		for i in n:
			parts.append({"alive": false, "x": 0.0, "y": -999.0, "z": 0.0,
				"vx": 0.0, "vy": 0.0, "vz": 0.0, "life": 0.0, "max": 1.0,
				"size": 1.0, "grav": 1.0, "drag": 0.985, "rot": 0.0})
			free_idx.append(i)
			var t := Transform3D(Basis().scaled(Vector3.ONE * 0.0001), Vector3(0, -999, 0))
			mm.set_instance_transform(i, t)
			mm.set_instance_color(i, tint)
		active_count = 0

	func spawn(px: float, py: float, pz: float, vx: float, vy: float, vz: float,
			life: float, tint: Color, size: float, grav: float = 1.0,
			drag: float = 0.985) -> void:
		var idx: int = -1
		if not free_idx.is_empty():
			idx = free_idx.pop_back()
		else:
			# переиспользуем самую «старую» по остатку жизни
			var best := 1e9
			for i in count:
				var p: Dictionary = parts[i]
				if float(p["life"]) < best:
					best = float(p["life"])
					idx = i
			if idx < 0:
				idx = 0
		var p: Dictionary = parts[idx]
		p["alive"] = true
		p["x"] = px
		p["y"] = py
		p["z"] = pz
		p["vx"] = vx
		p["vy"] = vy
		p["vz"] = vz
		p["life"] = life
		p["max"] = life
		p["size"] = size * base_size
		p["grav"] = grav
		p["drag"] = drag
		p["rot"] = randf() * TAU
		mm.set_instance_color(idx, tint)

	func update(dt: float) -> void:
		var live := 0
		for i in count:
			var p: Dictionary = parts[i]
			if not bool(p["alive"]):
				continue
			p["life"] = float(p["life"]) - dt
			if float(p["life"]) <= 0.0:
				p["alive"] = false
				var dead := Transform3D(Basis().scaled(Vector3.ONE * 0.0001), Vector3(0, -999, 0))
				mm.set_instance_transform(i, dead)
				free_idx.append(i)
				continue
			live += 1
			p["vy"] = float(p["vy"]) - gravity * float(p["grav"]) * dt
			p["vx"] = float(p["vx"]) * float(p["drag"])
			p["vz"] = float(p["vz"]) * float(p["drag"])
			p["x"] = float(p["x"]) + float(p["vx"]) * dt
			p["y"] = float(p["y"]) + float(p["vy"]) * dt
			p["z"] = float(p["z"]) + float(p["vz"]) * dt
			if float(p["y"]) < 0.02:
				p["y"] = 0.02
				p["vy"] = float(p["vy"]) * -0.32
				p["vx"] = float(p["vx"]) * 0.62
				p["vz"] = float(p["vz"]) * 0.62
			var k: float = float(p["life"]) / maxf(0.0001, float(p["max"]))
			var s: float = float(p["size"]) * (0.35 + k * 0.9)
			var basis := Basis.from_euler(Vector3(float(p["rot"]) * 3.0,
				float(p["rot"]) * 2.0, float(p["rot"]))).scaled(Vector3.ONE * maxf(0.0001, s))
			mm.set_instance_transform(i, Transform3D(basis,
				Vector3(float(p["x"]), float(p["y"]), float(p["z"]))))
		active_count = live


## --------------------------------- сборка --------------------------------
func _ready() -> void:
	sparks = ParticlePool.new(self, 220, 0.045, Color(1.0, 0.72, 0.3), true)
	blood = ParticlePool.new(self, 150, 0.075, Color(0.56, 0.11, 0.11))
	dust = ParticlePool.new(self, 160, 0.09, Color(0.54, 0.5, 0.43))
	casings = ParticlePool.new(self, 90, 0.035, Color(0.85, 0.7, 0.36))
	smoke = ParticlePool.new(self, 90, 0.28, Color(0.35, 0.35, 0.36))

	# трассеры — вытянутые кубы в одном MultiMesh
	var tracer_box := BoxMesh.new()
	tracer_box.size = Vector3(0.02, 0.02, 1.0)
	var tmat := StandardMaterial3D.new()
	tmat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	tmat.albedo_color = Color(1.0, 0.82, 0.48)
	tmat.emission_enabled = true
	tmat.emission = Color(1.0, 0.75, 0.4)
	tmat.emission_energy_multiplier = 2.0
	tracer_box.material = tmat
	tracer_mesh = MultiMesh.new()
	tracer_mesh.transform_format = MultiMesh.TRANSFORM_3D
	tracer_mesh.mesh = tracer_box
	tracer_mesh.instance_count = MAX_TRACERS
	var tnode := MultiMeshInstance3D.new()
	tnode.multimesh = tracer_mesh
	tnode.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(tnode)
	for i in MAX_TRACERS:
		tracer_items.append({"live": 0.0, "a": Vector3.ZERO, "b": Vector3.ZERO})
		tracer_mesh.set_instance_transform(i,
			Transform3D(Basis().scaled(Vector3.ONE * 0.0001), Vector3(0, -999, 0)))

	# вспышки: квад + свет
	for i in MAX_FLASHES:
		var quad := QuadMesh.new()
		quad.size = Vector2(0.42, 0.42)
		var fmat := StandardMaterial3D.new()
		fmat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		fmat.albedo_color = Color(1.0, 0.85, 0.5)
		fmat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		fmat.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
		quad.material = fmat
		var q := MeshInstance3D.new()
		q.mesh = quad
		q.visible = false
		q.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		add_child(q)
		flash_meshes.append(q)
		var light := OmniLight3D.new()
		light.light_color = Color(1.0, 0.8, 0.5)
		light.omni_range = 7.0
		light.visible = false
		add_child(light)
		flash_lights.append(light)
	flash_life = PackedFloat32Array()
	flash_life.resize(MAX_FLASHES)
	flash_life.fill(0.0)

	# декали от пуль
	for i in MAX_DECALS:
		var disc := CylinderMesh.new()
		disc.top_radius = 0.075
		disc.bottom_radius = 0.075
		disc.height = 0.004
		disc.radial_segments = 6
		var dmat := StandardMaterial3D.new()
		dmat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		dmat.albedo_color = Color(0.07, 0.07, 0.07, 0.75)
		dmat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		disc.material = dmat
		var d := MeshInstance3D.new()
		d.mesh = disc
		d.visible = false
		d.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		add_child(d)
		decals.append({"node": d, "life": 0.0})


## ------------------------------- эффекты ---------------------------------
func muzzle_flash(pos: Vector3, scale: float = 1.0) -> void:
	var i: int = flash_cursor % MAX_FLASHES
	flash_cursor += 1
	var q: MeshInstance3D = flash_meshes[i]
	q.global_position = pos
	q.scale = Vector3.ONE * (scale * (0.55 + randf() * 0.35))
	q.rotation.z = randf() * TAU
	q.visible = true
	flash_life[i] = 0.045
	var light: OmniLight3D = flash_lights[i]
	light.global_position = pos
	light.light_energy = 3.2 * scale
	light.visible = true
	for k in 3:
		sparks.spawn(pos.x, pos.y, pos.z,
			(randf() - 0.5) * 3.0, (randf() - 0.2) * 3.0, (randf() - 0.5) * 3.0,
			0.18 + randf() * 0.12, Color(1.0, 0.8, 0.4), 0.7, 0.4, 0.9)


func tracer(a: Vector3, b: Vector3, tint: Color = Color(1.0, 0.82, 0.48)) -> void:
	_tracer_tint = tint
	var i: int = tracer_cursor % MAX_TRACERS
	tracer_cursor += 1
	var item: Dictionary = tracer_items[i]
	item["live"] = 0.06
	item["a"] = a
	item["b"] = b


func impact(pos: Vector3, normal: Vector3, on_blood: bool = false) -> void:
	if on_blood:
		for i in 9:
			blood.spawn(pos.x, pos.y, pos.z,
				(randf() - 0.5) * 3.2, randf() * 2.6, (randf() - 0.5) * 3.2,
				0.4 + randf() * 0.5, Color(0.56, 0.11, 0.11), 0.9 + randf(), 1.0, 0.9)
		return
	for i in 7:
		dust.spawn(pos.x, pos.y, pos.z,
			(randf() - 0.5) * 2.4 + normal.x * 1.4,
			randf() * 2.0 + normal.y * 1.4,
			(randf() - 0.5) * 2.4 + normal.z * 1.4,
			0.3 + randf() * 0.4, Color(0.54, 0.5, 0.43), 0.85, 0.7, 0.9)
	for i in 3:
		sparks.spawn(pos.x, pos.y, pos.z,
			(randf() - 0.5) * 3.0, randf() * 3.0, (randf() - 0.5) * 3.0,
			0.14 + randf() * 0.1, Color(1.0, 0.73, 0.33), 0.6, 0.8, 0.92)
	var d: Dictionary = decals[decal_cursor % MAX_DECALS]
	decal_cursor += 1
	var node: MeshInstance3D = d["node"]
	node.global_position = Vector3(pos.x + (randf() - 0.5) * 0.05, 0.012,
		pos.z + (randf() - 0.5) * 0.05)
	node.visible = true
	d["life"] = 12.0


func casing(pos: Vector3, right: Vector3) -> void:
	casings.spawn(pos.x, pos.y, pos.z,
		right.x * (1.2 + randf()) + (randf() - 0.5) * 0.6,
		1.6 + randf() * 1.2,
		right.z * (1.2 + randf()) + (randf() - 0.5) * 0.6,
		1.6, Color(0.85, 0.7, 0.36), 1.0, 1.0, 0.995)


func explosion(pos: Vector3, radius: float) -> void:
	for i in 46:
		var a: float = randf() * TAU
		var e: float = randf() * 1.2
		var sp: float = 4.0 + randf() * 12.0
		sparks.spawn(pos.x, pos.y + 0.3, pos.z,
			cos(a) * cos(e) * sp, sin(e) * sp, sin(a) * cos(e) * sp,
			0.3 + randf() * 0.7, Color(1.0, 0.62 + randf() * 0.3, 0.2), 1.0 + randf(), 0.6, 0.96)
	for i in 22:
		smoke.spawn(pos.x, pos.y + 0.4, pos.z,
			(randf() - 0.5) * 3.0, 1.0 + randf() * 2.0, (randf() - 0.5) * 3.0,
			1.2 + randf() * 0.9, Color(0.3, 0.3, 0.31), 1.4, 0.15, 0.94)
	# кольцо ударной волны
	var ring := CylinderMesh.new()
	ring.top_radius = 0.5
	ring.bottom_radius = 0.5
	ring.height = 0.02
	ring.radial_segments = 24
	var rmat := StandardMaterial3D.new()
	rmat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	rmat.albedo_color = Color(1.0, 0.75, 0.35, 0.8)
	rmat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	ring.material = rmat
	var r := MeshInstance3D.new()
	r.mesh = ring
	r.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(r)
	r.global_position = Vector3(pos.x, 0.1, pos.z)
	r.scale = Vector3.ONE * 0.4
	rings.append({"node": r, "life": 0.45, "max": 0.45, "radius": radius})


func blood_at(pos: Vector3, part: String) -> void:
	var n: int = 12 if part == "head" else 8
	for i in n:
		blood.spawn(pos.x, pos.y, pos.z,
			(randf() - 0.5) * 3.4, randf() * 2.4, (randf() - 0.5) * 3.4,
			0.4 + randf() * 0.55, Color(0.56, 0.11, 0.11), 1.0 + randf() * 0.6, 1.0, 0.9)


func flash_smoke(pos: Vector3) -> void:
	smoke.spawn(pos.x, pos.y, pos.z, 0.0, 0.4, 0.0, 0.9, Color(0.62, 0.6, 0.55), 1.0, 0.1, 0.9)


## --------------------------------- кадр ----------------------------------
func tick(dt: float) -> void:
	sparks.update(dt)
	blood.update(dt)
	dust.update(dt)
	casings.update(dt)
	smoke.update(dt)

	var live_tracers := 0
	for i in MAX_TRACERS:
		var item: Dictionary = tracer_items[i]
		if float(item["live"]) <= 0.0:
			continue
		item["live"] = float(item["live"]) - dt
		var a: Vector3 = item["a"]
		var b: Vector3 = item["b"]
		if float(item["live"]) <= 0.0:
			tracer_mesh.set_instance_transform(i,
				Transform3D(Basis().scaled(Vector3.ONE * 0.0001), Vector3(0, -999, 0)))
			continue
		live_tracers += 1
		var d: Vector3 = b - a
		var length: float = d.length()
		if length < 0.01:
			continue
		var mid: Vector3 = a + d * 0.5
		var y_axis: Vector3 = d / length
		var up: Vector3 = Vector3.UP if absf(y_axis.y) < 0.98 else Vector3.RIGHT
		var x_axis: Vector3 = up.cross(y_axis).normalized()
		var z_axis: Vector3 = x_axis.cross(y_axis).normalized()
		var basis := Basis(x_axis, y_axis, z_axis).scaled(Vector3(1.0, 1.0, length))
		tracer_mesh.set_instance_transform(i, Transform3D(basis, mid))
	counts["tracers"] = live_tracers

	for i in MAX_FLASHES:
		if flash_life[i] > 0.0:
			flash_life[i] -= dt
			if flash_life[i] <= 0.0:
				(flash_meshes[i] as MeshInstance3D).visible = false
				(flash_lights[i] as OmniLight3D).visible = false

	for d in decals:
		if float(d["life"]) > 0.0:
			d["life"] = float(d["life"]) - dt
			if float(d["life"]) <= 0.0:
				(d["node"] as MeshInstance3D).visible = false

	for i in range(rings.size() - 1, -1, -1):
		var r: Dictionary = rings[i]
		r["life"] = float(r["life"]) - dt
		var k: float = 1.0 - float(r["life"]) / float(r["max"])
		var node: MeshInstance3D = r["node"]
		node.scale = Vector3.ONE * (0.4 + k * float(r["radius"]) * 1.6)
		var mat: StandardMaterial3D = (node.mesh as CylinderMesh).material as StandardMaterial3D
		mat.albedo_color = Color(1.0, 0.75, 0.35, 0.8 * (1.0 - k))
		if float(r["life"]) <= 0.0:
			node.queue_free()
			rings.remove_at(i)

	counts["particles"] = sparks.active_count + blood.active_count + dust.active_count \
		+ casings.active_count + smoke.active_count


func clear_all() -> void:
	for pool in [sparks, blood, dust, casings, smoke]:
		if pool == null:
			continue
		for i in pool.count:
			var p: Dictionary = pool.parts[i]
			if bool(p["alive"]):
				p["alive"] = false
				p["life"] = 0.0
				pool.mm.set_instance_transform(i,
					Transform3D(Basis().scaled(Vector3.ONE * 0.0001), Vector3(0, -999, 0)))
		pool.free_idx.clear()
		for i in pool.count:
			pool.free_idx.append(i)
		pool.active_count = 0
	for d in decals:
		(d["node"] as MeshInstance3D).visible = false
		d["life"] = 0.0
	for r in rings:
		(r["node"] as MeshInstance3D).queue_free()
	rings.clear()
	for i in MAX_FLASHES:
		(flash_meshes[i] as MeshInstance3D).visible = false
		(flash_lights[i] as OmniLight3D).visible = false
		flash_life[i] = 0.0
	counts["particles"] = 0
	counts["tracers"] = 0
