extends RefCounted
class_name SH2Level
## СЕКТОР «ПЕПЕЛ» — карта уровня из полигонов (порт).
##
## Здания задаются многоугольником в плане, выдавливаются на высоту, крыша —
## двускатная (призма по контуру) или плоская с парапетом. Вышки — решётчатая
## опора с площадкой. Укрытия — бетонные блоки со скосом, мешки, бочки, камни,
## штабели труб. Дорога — полосы полигонов.

const V2 := Vector2


static func plan_bounds(poly: Array) -> Dictionary:
	var min_x := 1e9
	var max_x := -1e9
	var min_z := 1e9
	var max_z := -1e9
	for p in poly:
		min_x = minf(min_x, p.x)
		max_x = maxf(max_x, p.x)
		min_z = minf(min_z, p.y)
		max_z = maxf(max_z, p.y)
	return {"cx": (min_x + max_x) * 0.5, "cz": (min_z + max_z) * 0.5,
		"hw": (max_x - min_x) * 0.5, "hd": (max_z - min_z) * 0.5}


static func building(spec: Dictionary, wall_colors: Dictionary) -> Node3D:
	var poly: Array = spec["poly"]
	var h: float = float(spec["h"])
	var b := plan_bounds(poly)
	var out := Node3D.new()
	var wall_color: Color = spec.get("wall", wall_colors.get("wall", Color("#4a4238")))
	var roof_color: Color = spec.get("roof_color", wall_colors.get("roof", Color("#2f2b26")))

	# стены: полигон в плане выдавливается на высоту
	var walls := SH2Outline.mesh_node(SH2Outline.extrude_plan(poly, h), wall_color, {"roughness": 0.9})
	out.add_child(walls)

	# крыша
	var roof_kind: String = spec.get("roof", "flat")
	if roof_kind == "gable":
		var ridge_k: float = float(spec.get("ridge", 0.34))
		var rh: float = minf(b["hw"], b["hd"]) * ridge_k + 0.4
		var over := 0.34
		var lower: Array = []
		for p in poly:
			var d: Vector2 = p - Vector2(b["cx"], b["cz"])
			var l: float = maxf(0.001, d.length())
			lower.append(p + d / l * over)
		var along_x: bool = b["hw"] >= b["hd"]
		# конёк — ребро, между двумя крайними точками по длинной оси
		var left_k := 0
		var right_k := 0
		var left_v := 1e9
		var right_v := -1e9
		for i in lower.size():
			var key: float = lower[i].x if along_x else lower[i].y
			if key < left_v:
				left_v = key
				left_k = i
			if key > right_v:
				right_v = key
				right_k = i
		var apex_l := lower[left_k]
		var apex_r := lower[right_k]
		var l_center := Vector2(b["cx"], b["cz"])
		var m_left := (apex_l + l_center) * 0.5
		var m_right := (apex_r + l_center) * 0.5
		var st := SurfaceTool.new()
		st.begin(Mesh.PRIMITIVE_TRIANGLES)
		var n := lower.size()
		for i in n:
			var i2: int = (i + 1) % n
			var p0: Vector2 = lower[i]
			var p1: Vector2 = lower[i2]
			# ближе к какому коньку точка
			var t0: Vector2 = m_left if p0.distance_to(apex_l) < p0.distance_to(apex_r) else m_right
			var t1: Vector2 = m_left if p1.distance_to(apex_l) < p1.distance_to(apex_r) else m_right
			var a := Vector3(p0.x, h, p0.y)
			var bb := Vector3(p1.x, h, p1.y)
			var c := Vector3(t1.x, h + rh, t1.y)
			var d := Vector3(t0.x, h + rh, t0.y)
			st.add_vertex(a)
			st.add_vertex(bb)
			st.add_vertex(c)
			st.add_vertex(a)
			st.add_vertex(c)
			st.add_vertex(d)
		var roof := SH2Outline.mesh_node(st.commit(), roof_color,
			{"roughness": 0.95, "two_sided": true})
		out.add_child(roof)
	else:
		# плоская крыша: плита + парапет по контуру
		var cap_node := SH2Outline.mesh_node(SH2Outline.extrude_plan(poly, 0.20), roof_color)
		cap_node.position.y = h
		out.add_child(cap_node)
		var bw := 0.18
		for i in poly.size():
			var a1: Vector2 = poly[i]
			var a2: Vector2 = poly[(i + 1) % poly.size()]
			var seg: Vector2 = a2 - a1
			var length: float = seg.length()
			if length < 0.5:
				continue
			var par_poly := [V2(-length * 0.5, -bw * 0.5), V2(length * 0.5, -bw * 0.5),
				V2(length * 0.5, bw * 0.5), V2(-length * 0.5, bw * 0.5)]
			var par := SH2Outline.mesh_node(SH2Outline.extrude_plan(par_poly, 0.62), roof_color)
			par.position = Vector3((a1.x + a2.x) * 0.5, h + 0.20, (a1.y + a2.y) * 0.5)
			par.rotation.y = -atan2(seg.y, seg.x)
			out.add_child(par)
	# окна по фасадам
	out.add_child(_windows(poly, h, spec))
	return out


static func _windows(poly: Array, h: float, spec: Dictionary) -> Node3D:
	var out := Node3D.new()
	var glow := bool(spec.get("windows_glow", false))
	for i in poly.size():
		var a: Vector2 = poly[i]
		var b: Vector2 = poly[(i + 1) % poly.size()]
		var d: Vector2 = b - a
		var length: float = d.length()
		if length < 3.0:
			continue
		var u: Vector2 = d / length
		var nrm := Vector2(u.y, -u.x)
		var cols: int = int(length / 2.6)
		var rows: int = maxi(1, int((h - 1.6) / 2.6))
		for r in rows:
			for c in cols:
				var t: float = 0.9 + float(c) * 2.6 + 1.2
				if t > length - 0.9:
					break
				var pos2: Vector2 = a + u * t + nrm * 0.055
				var quad := QuadMesh.new()
				quad.size = Vector2(0.95, 1.15)
				var mi := MeshInstance3D.new()
				mi.mesh = quad
				var col := Color("#2c3f4a") if ((c + r) % 5 == 0 and glow) else Color("#11161a")
				mi.material_override = SH2Outline.material(col, {"roughness": 0.2})
				mi.position = Vector3(pos2.x, 1.9 + float(r) * 2.6, pos2.y)
				mi.rotation.y = atan2(u.x, u.y) + PI * 0.5
				out.add_child(mi)
	return out


static func tower(spec: Dictionary, color: Color) -> Node3D:
	var out := Node3D.new()
	var w: float = float(spec["w"])
	var h: float = float(spec["h"])
	var half := w * 0.5
	# ноги
	for i in 4:
		var sx: float = (1.0 if (i & 1) else -1.0) * (half - 0.35)
		var sz: float = (1.0 if (i & 2) else -1.0) * (half - 0.35)
		var leg := CylinderMesh.new()
		leg.top_radius = 0.11
		leg.bottom_radius = 0.14
		leg.height = h
		leg.radial_segments = 6
		var mi := MeshInstance3D.new()
		mi.mesh = leg
		mi.material_override = SH2Outline.material(color)
		mi.position = Vector3(sx, h * 0.5, sz)
		mi.rotation = Vector3(sz * 0.012, 0, -sx * 0.012)
		out.add_child(mi)
	# раскосы
	var levels: int = int(h / 2.4)
	for lvl in levels:
		for side in 4:
			var brace := CylinderMesh.new()
			brace.top_radius = 0.045
			brace.bottom_radius = 0.045
			brace.height = half * 1.6
			brace.radial_segments = 4
			var mi2 := MeshInstance3D.new()
			mi2.mesh = brace
			mi2.material_override = SH2Outline.material(color)
			var y: float = 1.4 + float(lvl) * 2.4
			if side < 2:
				mi2.position = Vector3(0, y, (1.0 if side else -1.0) * (half - 0.35))
				mi2.rotation = Vector3(0, (0.6 if (lvl % 2) else -0.6), PI * 0.5)
			else:
				mi2.position = Vector3((1.0 if side == 2 else -1.0) * (half - 0.35), y, 0)
				mi2.rotation = Vector3(PI * 0.5, 0, (0.6 if (lvl % 2) else -0.6))
			out.add_child(mi2)
	# площадка
	var deck_poly := [V2(-half, -half), V2(half, -half), V2(half, half), V2(-half, half)]
	var deck := SH2Outline.mesh_node(SH2Outline.extrude_plan(deck_poly, 0.22), Color("#4a473c"))
	deck.position.y = h
	out.add_child(deck)
	out.position = Vector3(spec["x"], 0, spec["z"])
	return out


## Монолит-укрытие: одна из 10 000 моделей, поставленная на карту. Прорези и
## выемки настоящие, поэтому укрытие читается и на просвет, и вблизи.
static func monolith(index: int, x: float, z: float, angle: float = 0.0,
		opts: Dictionary = {}) -> Node3D:
	var node := SH2Monolith.build_node(index, opts)
	node.position = Vector3(x, 0.0, z)
	node.rotation.y = angle
	return node


## Коллайдеры монолита с учётом поворота: круг вокруг модели плюс её габарит.
static func monolith_colliders(index: int, x: float, z: float,
		angle: float = 0.0) -> Array:
	var made := SH2Monolith.build(index)
	var w: float = float(made["w"])
	var d: float = float(made["d"])
	var h: float = float(made["h"])
	var c: float = absf(cos(angle))
	var sn: float = absf(sin(angle))
	var hw: float = (w * 0.5) * c + (d * 0.5) * sn
	var hd: float = (w * 0.5) * sn + (d * 0.5) * c
	return [{"x": x, "z": z, "hw": hw, "hd": hd, "h": h, "kind": "monolith",
		"stand_low": h < 1.0, "model": made["id"]}]


## Бетонный блок со скошенными гранями
static func barrier(spec: Dictionary, color: Color) -> Node3D:
	var length: float = float(spec["len"])
	var thick := 0.52
	var height := 1.18
	var low := [V2(-length * 0.5, -thick * 0.5), V2(length * 0.5, -thick * 0.5),
		V2(length * 0.5, thick * 0.5), V2(-length * 0.5, thick * 0.5)]
	var high := [V2(-length * 0.48, -thick * 0.30), V2(length * 0.48, -thick * 0.30),
		V2(length * 0.48, thick * 0.30), V2(-length * 0.48, thick * 0.30)]
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for i in 4:
		var i2: int = (i + 1) % 4
		var a := Vector3(low[i].x, 0, low[i].y)
		var b := Vector3(low[i2].x, 0, low[i2].y)
		var c := Vector3(high[i2].x, height, high[i2].y)
		var d := Vector3(high[i].x, height, high[i].y)
		st.add_vertex(a)
		st.add_vertex(b)
		st.add_vertex(c)
		st.add_vertex(a)
		st.add_vertex(c)
		st.add_vertex(d)
	# верх
	var up := SH2Outline.extrude_plan(high, 0.02)
	var body := SH2Outline.mesh_node(st.commit(), color, {"roughness": 0.95})
	var out := Node3D.new()
	out.add_child(body)
	var cap := SH2Outline.mesh_node(up, color)
	cap.position.y = height
	out.add_child(cap)
	# жёлтая полоса
	var stripe_poly := [V2(-length * 0.45, -thick * 0.26), V2(length * 0.45, -thick * 0.26),
		V2(length * 0.45, thick * 0.26), V2(-length * 0.45, thick * 0.26)]
	var stripe := SH2Outline.mesh_node(SH2Outline.extrude_plan(stripe_poly, 0.03), Color("#b99a4e"))
	stripe.position.y = height - 0.14
	out.add_child(stripe)
	out.position = Vector3(spec["x"], 0, spec["z"])
	out.rotation.y = float(spec["a"])
	return out


## Мешки по контуру: ряд со сдвигом
static func sandbag_row(length: float, color: Color) -> Node3D:
	var out := Node3D.new()
	var bag := SH2Outline.revolve([[0, 0.30], [0.05, 0.34], [0.16, 0.34], [0.26, 0.30],
		[0.30, 0.18], [0.305, 0.0]], {"segments": 8, "scale": Vector3(1.0, 1.0, 0.66)})
	var count: int = maxi(3, int(length / 0.52))
	for row in 3:
		var n: int = count - row
		for i in n:
			var mi := SH2Outline.mesh_node(bag, color, {"roughness": 0.98})
			mi.position = Vector3(-length * 0.5 + 0.26 + float(i) * 0.52 + float(row) * 0.13,
				0.112 + float(row) * 0.185, float(row) * 0.02)
			mi.rotation.y = (0.05 if (i % 2) else -0.04) + float(row) * 0.03
			out.add_child(mi)
	return out


static func barrel(pos: Vector2, color: Color) -> Node3D:
	var mesh := SH2Outline.revolve([[0.0, 0.40], [0.02, 0.44], [0.10, 0.46], [0.48, 0.46],
		[0.55, 0.44], [0.58, 0.39], [0.585, 0.0]], {"segments": 12})
	var mi := SH2Outline.mesh_node(mesh, color, {"roughness": 0.85})
	mi.position = Vector3(pos.x, 0, pos.y)
	return mi


static func rock(pos: Vector3, color: Color) -> Node3D:
	var pts: Array = [
		Vector2(-0.5, 0.02), Vector2(-0.34, 0.34), Vector2(-0.10, 0.60),
		Vector2(0.22, 0.52), Vector2(0.44, 0.26), Vector2(0.50, 0.02),
	]
	var smooth := SH2Outline.smooth_outline(pts, 2)
	var mesh := SH2Outline.outline_mesh(smooth, {"depth": 0.9, "bevel": 0.1})
	var mi := SH2Outline.mesh_node(mesh, color, {"roughness": 1.0})
	mi.position = Vector3(pos.x, 0, pos.y)
	mi.scale = Vector3.ONE * pos.z * 1.1
	mi.rotation.y = pos.x * 0.7
	return mi


static func stack_pipes(pos: Vector2, angle: float, color: Color) -> Node3D:
	var out := Node3D.new()
	var pipe := SH2Outline.revolve([[0, 0.34], [0.04, 0.36], [0.9, 0.36], [0.94, 0.34],
		[0.94, 0.30], [0.02, 0.30]], {"segments": 10})
	for layer in 3:
		for k in 2:
			var mi := SH2Outline.mesh_node(pipe, color, {"roughness": 0.8})
			mi.rotation.z = PI * 0.5
			mi.position = Vector3(0, 0.36 + float(layer) * 0.60, (0.34 if k else -0.34))
			out.add_child(mi)
	out.position = Vector3(pos.x, 0, pos.y)
	out.rotation.y = angle
	return out


## Сборка всего уровня. Возвращает {root, colliders, map_id}
static func build(map_id: String) -> Dictionary:
	var m: Dictionary = SH2Data.MAPS.get(map_id, SH2Data.MAPS["depot"])
	var root := Node3D.new()
	root.name = "level_" + map_id
	var wall_colors: Dictionary = m["wall_colors"]

	# земля
	var plane := PlaneMesh.new()
	plane.size = Vector2(float(m["size"]), float(m["size"]))
	var ground := MeshInstance3D.new()
	ground.mesh = plane
	ground.material_override = SH2Outline.material(m["ground"], {"roughness": 1.0})
	root.add_child(ground)

	# дорога
	for rd in m.get("road", []):
		var w: float = float(rd["w"]) * 0.5
		var l: float = float(rd["l"]) * 0.5
		var poly := [V2(-l, -w), V2(l, -w), V2(l, w), V2(-l, w)]
		var road := SH2Outline.mesh_node(SH2Outline.extrude_plan(poly, 0.06), Color("#272421"))
		road.position = Vector3(rd["x"], 0.006, rd["z"])
		road.rotation.y = float(rd["a"])
		root.add_child(road)

	for b in m["buildings"]:
		root.add_child(building(b, wall_colors))
	for t in m["towers"]:
		root.add_child(tower(t, wall_colors["trim"]))
	for br in m["barriers"]:
		root.add_child(barrier(br, Color("#565b60")))
	for sb in m["sandbags"]:
		var bag_row := sandbag_row(float(sb["len"]), Color("#6f6547"))
		bag_row.position = Vector3(sb["x"], 0, sb["z"])
		bag_row.rotation.y = float(sb["a"])
		root.add_child(bag_row)
	# монолиты-укрытия внутри карты: вблизи видны прорези и выемки
	var mono_spots: Array = m.get("monoliths", [])
	var mono_colliders: Array = []
	for i in mono_spots.size():
		var spot: Dictionary = mono_spots[i]
		var idx: int = int(spot.get("model", i * 97 + 13)) % SH2Monolith.COUNT
		root.add_child(monolith(idx, float(spot["x"]), float(spot["z"]),
			float(spot.get("a", 0.0))))
		mono_colliders.append_array(monolith_colliders(idx, float(spot["x"]),
			float(spot["z"]), float(spot.get("a", 0.0))))
	for p in m["barrels"]:
		root.add_child(barrel(p, Color("#6a4a2c")))
	for p in m["rocks"]:
		root.add_child(rock(p, m["accent"]))
	for st in m["stacks"]:
		root.add_child(stack_pipes(st, 0.0, Color("#5a5348")))

	# свет
	var sun := DirectionalLight3D.new()
	sun.light_color = m["sun"]
	sun.light_energy = 1.25
	sun.shadow_enabled = true
	sun.directional_shadow_max_distance = 120.0
	var sun_pos: Vector3 = m["sun_pos"]
	sun.position = sun_pos
	root.add_child(sun)
	sun.look_at_from_position(sun_pos, Vector3.ZERO, Vector3.UP)

	var hemi := WorldEnvironment.new()
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = m["sky"]
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = m["ambient"]
	env.ambient_light_energy = 0.75
	env.fog_enabled = true
	env.fog_light_color = m["fog"]
	env.fog_density = 0.012
	env.tonemap_mode = Environment.TONE_MAPPER_ACES
	hemi.environment = env
	root.add_child(hemi)

	var colliders: Array = SH2Data.map_colliders(map_id)
	colliders.append_array(mono_colliders)
	return {"root": root, "colliders": colliders, "map_id": map_id,
		"map": m, "monoliths": mono_spots.size()}
