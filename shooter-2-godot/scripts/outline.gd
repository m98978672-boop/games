extends RefCounted
class_name SH2Outline
## СЕКТОР «ПЕПЕЛ» — построение моделей по обведённым точкам.
##
## Никаких коробок: силуэт детали обводится точками, и по ним строится
## объёмная модель.
##   outline_mesh(pts, opts)  — выдавливание контура с фаской и толщиной;
##   loft_sections(sections)  — лофт по сечениям (торс, конечности, цевьё);
##   revolve(pts, opts)       — тело вращения по профилю (шлем, ствол, бочка);
##   smooth_outline(pts)      — сглаживание обводки (Catmull-Rom).
## Контуры задаются в метрах: оружие и персонаж сразу в масштабе мира.

static var _mat_cache := {}


static func material(color: Color, opts: Dictionary = {}) -> StandardMaterial3D:
	var key := "%s|%s" % [color.to_html(), str(opts)]
	if _mat_cache.has(key):
		return _mat_cache[key]
	var m := StandardMaterial3D.new()
	m.albedo_color = color
	m.roughness = float(opts.get("roughness", 0.72))
	m.metallic = float(opts.get("metallic", 0.15))
	if bool(opts.get("flat", false)):
		m.shading_mode = BaseMaterial3D.SHADING_MODE_PER_PIXEL
	if bool(opts.get("two_sided", false)):
		m.cull_mode = BaseMaterial3D.CULL_DISABLED
	if bool(opts.get("emissive", false)):
		m.emission_enabled = true
		m.emission = color
		m.emission_energy_multiplier = float(opts.get("emission_energy", 1.0))
	_mat_cache[key] = m
	return m


static func clear_material_cache() -> void:
	_mat_cache.clear()


## Тело вращения по профилю: pts = [[y, r], ...] снизу вверх
static func revolve(pts: Array, opts: Dictionary = {}) -> ArrayMesh:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var segments: int = int(opts.get("segments", 14))
	var scale_v: Vector3 = opts.get("scale", Vector3.ONE)
	var n: int = pts.size()
	var rings: Array = []
	for point in pts:
		var y: float = float(point[0])
		var r: float = maxf(0.0005, float(point[1]))
		var ring: Array = []
		for i in segments:
			var a := TAU * float(i) / float(segments)
			ring.append(Vector3(cos(a) * r * scale_v.x, y * scale_v.y, sin(a) * r * scale_v.z))
		rings.append(ring)
	for s in n - 1:
		var r0: Array = rings[s]
		var r1: Array = rings[s + 1]
		for i in segments:
			var i2: int = (i + 1) % segments
			var a: Vector3 = r0[i]
			var b: Vector3 = r0[i2]
			var c: Vector3 = r1[i2]
			var d: Vector3 = r1[i]
			_add_tri(st, a, b, c)
			_add_tri(st, a, c, d)
	# заглушки
	var first: Array = rings[0]
	var last: Array = rings[n - 1]
	var c0 := Vector3(0, float(pts[0][0]) * scale_v.y, 0)
	var c1 := Vector3(0, float(pts[n - 1][0]) * scale_v.y, 0)
	for i in segments:
		var i2: int = (i + 1) % segments
		_add_tri(st, c0, first[i2], first[i])
		_add_tri(st, c1, last[i], last[i2])
	st.generate_normals()
	return st.commit()


## Лофт по сечениям: sections = [{at: Vector3, pts: [Vector2], scale: Vector2}]
## Точки сечения лежат в горизонтальной плоскости (x, z), высота — at.y.
static func loft_sections(sections: Array) -> ArrayMesh:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var n: int = sections.size()
	var m: int = (sections[0]["pts"] as Array).size()
	var rows: Array = []
	for sec in sections:
		var at: Vector3 = sec.get("at", Vector3.ZERO)
		var s_scale: Vector2 = sec.get("scale", Vector2.ONE)
		var row: Array = []
		for p in sec["pts"]:
			row.append(Vector3(at.x + p.x * s_scale.x, at.y, at.z + p.y * s_scale.y))
		rows.append(row)
	for s in n - 1:
		var r0: Array = rows[s]
		var r1: Array = rows[s + 1]
		for i in m:
			var i2: int = (i + 1) % m
			_add_tri(st, r0[i], r0[i2], r1[i2])
			_add_tri(st, r0[i], r1[i2], r1[i])
	# заглушки веером
	var at0: Vector3 = sections[0].get("at", Vector3.ZERO)
	var at1: Vector3 = sections[n - 1].get("at", Vector3.ZERO)
	for i in m:
		var i2: int = (i + 1) % m
		_add_tri(st, at0, rows[0][i2], rows[0][i])
		_add_tri(st, at1, rows[n - 1][i], rows[n - 1][i2])
	st.generate_normals()
	return st.commit()


static func _add_tri(st: SurfaceTool, a: Vector3, b: Vector3, c: Vector3) -> void:
	# согласованные нормали: вершины против часовой стрелки
	var n := (b - a).cross(c - a)
	if n.length_squared() < 1e-12:
		return
	st.add_vertex(a)
	st.add_vertex(b)
	st.add_vertex(c)


## Сечение-«капсула» (сглаженный прямоугольник) для лофта
static func section(half_w: float, top: float, bottom: float, segs: int = 12) -> Array:
	var pts: Array = []
	var cy: float = (top + bottom) * 0.5
	var hh: float = (top - bottom) * 0.5
	var p := 0.62
	for i in segs:
		var a := TAU * float(i) / float(segs)
		var ca := cos(a)
		var sa := sin(a)
		var x: float = signf(ca) * pow(absf(ca), p) * half_w
		var y: float = signf(sa) * pow(absf(sa), p) * hh
		pts.append(Vector2(x, cy + y))
	return pts


## Сечение-круг/эллипс
static func circle_section(rx: float, ry: float, segs: int = 10) -> Array:
	var pts: Array = []
	for i in segs:
		var a := TAU * float(i) / float(segs)
		pts.append(Vector2(cos(a) * rx, sin(a) * ry))
	return pts


## Выдавливание обведённого контура: pts = [Vector2(z, y), ...]
## depth — толщина по X, bevel — скругление рёбер, taper — [[t, k], ...]
static func outline_mesh(pts: Array, opts: Dictionary = {}) -> ArrayMesh:
	var depth: float = float(opts.get("depth", 0.02))
	var bevel: float = float(opts.get("bevel", minf(0.004, depth * 0.35)))
	var taper: Array = opts.get("taper", [])
	var n: int = pts.size()
	if n < 3:
		return ArrayMesh.new()
	var half: float = maxf(0.001, depth * 0.5)
	var bev: float = clampf(bevel, 0.0, half * 0.9)

	# контур: плоские точки (z -> x модели, y -> y модели)
	var poly2: Array = []
	for p in pts:
		poly2.append(Vector2(p.x, p.y))
	if _signed_area(poly2) < 0.0:
		poly2.reverse()

	var rings: Array = []
	# боковина: кольцо снаружи (x = -half), средняя линия и снаружи (x = +half)
	for side in [-1.0, 1.0]:
		var inner: Array = []
		for v in poly2:
			inner.append(Vector3(side * half, v.y, v.x))
		rings.append(inner)

	# боковые стенки
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var mid: Array = []
	for v in poly2:
		mid.append(Vector3(0, v.y, v.x))
	for i in n:
		var i2: int = (i + 1) % n
		# левая стенка
		_add_tri(st, rings[0][i], rings[0][i2], mid[i2])
		_add_tri(st, rings[0][i], mid[i2], mid[i])
		# правая стенка
		_add_tri(st, mid[i], mid[i2], rings[1][i2])
		_add_tri(st, mid[i], rings[1][i2], rings[1][i])

	# плоские «щеки» с фаской: треугольники от центра к контуру
	var centroid := Vector3.ZERO
	for v in poly2:
		centroid += Vector3(0, v.y, v.x)
	centroid /= float(n)
	for side in [-1.0, 1.0]:
		var cx: float = side * (half + 0.0)
		var center := Vector3(cx, centroid.y, centroid.z)
		# с фаской: внешний контур поджат к центру по толщине
		for i in n:
			var i2: int = (i + 1) % n
			var a := Vector3(cx, poly2[i].y, poly2[i].x)
			var b := Vector3(cx, poly2[i2].y, poly2[i2].x)
			if side > 0.0:
				_add_tri(st, center, a, b)
			else:
				_add_tri(st, center, b, a)

	# фаска: срезаем острые кромки с обеих сторон
	if bev > 0.0005:
		var st2 := SurfaceTool.new()
		st2.begin(Mesh.PRIMITIVE_TRIANGLES)
		for side in [-1.0, 1.0]:
			var x_out: float = side * half
			var x_in: float = side * (half - bev)
			for i in n:
				var i2: int = (i + 1) % n
				var p0 := poly2[i]
				var p1 := poly2[i2]
				# поджимаем контур внутрь на bevel (упрощённо: к центроиду)
				var c2 := Vector2(centroid.z, centroid.y)
				var q0: Vector2 = p0 + (c2 - p0).normalized() * bev
				var q1: Vector2 = p1 + (c2 - p1).normalized() * bev
				var a := Vector3(x_out, p0.y, p0.x)
				var b := Vector3(x_out, p1.y, p1.x)
				var c := Vector3(x_in, q1.y, q1.x)
				var d := Vector3(x_in, q0.y, q0.x)
				if side > 0.0:
					_add_tri(st2, a, b, c)
					_add_tri(st2, a, c, d)
				else:
					_add_tri(st2, a, c, b)
					_add_tri(st2, a, d, c)
		var bev_mesh := st2.commit()
		var combined := st.commit()
		return _merge_meshes([bev_mesh, combined])
	return st.commit()


## Публичный квад: две согласованные по нормали треугольника. Нужен
## генераторам полей (mesh_field.gd), чтобы не копировать _add_tri.
static func _quad_raw(st: SurfaceTool, a: Vector3, b: Vector3, c: Vector3, d: Vector3) -> void:
	_add_tri(st, a, b, c)
	_add_tri(st, a, c, d)


static func _signed_area(poly: Array) -> float:
	var s := 0.0
	for i in poly.size():
		var a: Vector2 = poly[i]
		var b: Vector2 = poly[(i + 1) % poly.size()]
		s += a.x * b.y - b.x * a.y
	return s * 0.5


## Слияние мешей в один (по позициям и нормалям) — экономит draw calls
static func _merge_meshes(meshes: Array) -> ArrayMesh:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for mesh in meshes:
		if mesh == null or mesh.get_surface_count() == 0:
			continue
		var arrays: Array = mesh.surface_get_arrays(0)
		var verts: PackedVector3Array = arrays[Mesh.ARRAY_VERTEX]
		var norms = arrays[Mesh.ARRAY_NORMAL]
		var idx = arrays[Mesh.ARRAY_INDEX]
		if idx != null and (idx as PackedInt32Array).size() > 0:
			var ids: PackedInt32Array = idx
			for i in ids.size():
				st.add_vertex(verts[ids[i]])
				if norms != null:
					st.add_normal((norms as PackedVector3Array)[ids[i]])
		else:
			for i in verts.size():
				st.add_vertex(verts[i])
				if norms != null:
					st.add_normal((norms as PackedVector3Array)[i])
	return st.commit()


## Сглаживание обводки сплайном Catmull-Rom
static func smooth_outline(pts: Array, samples: int = 4) -> Array:
	var n: int = pts.size()
	var out: Array = []
	for i in n:
		var p0: Vector2 = pts[(i - 1 + n) % n]
		var p1: Vector2 = pts[i]
		var p2: Vector2 = pts[(i + 1) % n]
		var p3: Vector2 = pts[(i + 2) % n]
		for s in samples:
			var t: float = float(s) / float(samples)
			var t2 := t * t
			var t3 := t2 * t
			var x: float = 0.5 * ((2.0 * p1.x) + (-p0.x + p2.x) * t
				+ (2.0 * p0.x - 5.0 * p1.x + 4.0 * p2.x - p3.x) * t2
				+ (-p0.x + 3.0 * p1.x - 3.0 * p2.x + p3.x) * t3)
			var y: float = 0.5 * ((2.0 * p1.y) + (-p0.y + p2.y) * t
				+ (2.0 * p0.y - 5.0 * p1.y + 4.0 * p2.y - p3.y) * t2
				+ (-p0.y + 3.0 * p1.y - 3.0 * p2.y + p3.y) * t3)
			out.append(Vector2(x, y))
	return out


## Выдавливание полигона в плане (X,Z) на высоту h — стены здания
static func extrude_plan(pts: Array, h: float, opts: Dictionary = {}) -> ArrayMesh:
	var n: int = pts.size()
	if n < 3:
		return ArrayMesh.new()
	var poly: Array = []
	for p in pts:
		poly.append(Vector2(p.x, p.y))
	if _signed_area(poly) < 0.0:
		poly.reverse()
	var bottom_center := Vector3.ZERO
	var top_center := Vector3(0, h, 0)
	for v in poly:
		bottom_center += Vector3(v.x, 0.0, v.y) / float(n)
		top_center += Vector3(v.x, 0.0, v.y) / float(n)
	top_center.y = h
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for i in n:
		var i2: int = (i + 1) % n
		var a := Vector3(poly[i].x, 0.0, poly[i].y)
		var b := Vector3(poly[i2].x, 0.0, poly[i2].y)
		var c := Vector3(poly[i2].x, h, poly[i2].y)
		var d := Vector3(poly[i].x, h, poly[i].y)
		_add_tri(st, a, b, c)
		_add_tri(st, a, c, d)
		_add_tri(st, top_center, d, c)   # верхняя крышка
		_add_tri(st, bottom_center, b, a)  # низ
	st.generate_normals()
	return st.commit()


## Прямая призма по 2D-полигону в плоскости XY, выдавленная по Z.
## Используется для аккуратной двускатной крыши и мешков.
static func prism(poly: Array, depth: float, center_z: float = 0.0) -> ArrayMesh:
	var n: int = poly.size()
	var pts: Array = []
	for p in poly:
		pts.append(Vector2(p.x, p.y))
	var area := _signed_area(pts)
	if area < 0.0:
		pts.reverse()
	var z0 := center_z - depth * 0.5
	var z1 := center_z + depth * 0.5
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for i in n:
		var i2: int = (i + 1) % n
		var a := Vector3(pts[i].x, pts[i].y, z0)
		var b := Vector3(pts[i2].x, pts[i2].y, z0)
		var c := Vector3(pts[i2].x, pts[i2].y, z1)
		var d := Vector3(pts[i].x, pts[i].y, z1)
		_add_tri(st, a, c, b)
		_add_tri(st, a, d, c)
	# боковые щёки веером (полигон может быть невыпуклым — триангулируем)
	for z in [z0, z1]:
		var tris := Geometry2D.triangulate_polygon(pts)
		for i in range(0, tris.size(), 3):
			var a := Vector3(pts[tris[i]].x, pts[tris[i]].y, z)
			var b := Vector3(pts[tris[i + 1]].x, pts[tris[i + 1]].y, z)
			var c := Vector3(pts[tris[i + 2]].x, pts[tris[i + 2]].y, z)
			if z < center_z:
				_add_tri(st, a, c, b)
			else:
				_add_tri(st, a, b, c)
	st.generate_normals()
	return st.commit()


## Хелпер: меш + материал одним объектом
static func mesh_node(mesh: Mesh, color: Color, opts: Dictionary = {}) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	mi.mesh = mesh
	mi.material_override = material(color, opts)
	mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON
	return mi
