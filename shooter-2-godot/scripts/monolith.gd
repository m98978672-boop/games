extends RefCounted
class_name SH2Monolith
## СЕКТОР «ПЕПЕЛ» — монолитные модели с настоящими прорезями и выемками.
##
## Отличие от простых «коробок»: у каждой модели есть сквозные прорези
## (видно насквозь) и выемки (углубления с дном). Это не накладки поверх
## корпуса и не текстура — это вырезанные из объёма отверстия, поэтому
## геометрия строится по-честному:
##   1. лицевая грань режется на прямоугольники вычитанием прорезей
##      — декомпозиция по столбцам, без самопересечений и щелей;
##   2. по контуру прорези идёт внутренняя стенка, её видно под углом;
##   3. выемка получает дно на заданной глубине и четыре боковые стенки;
##   4. всё сводится в ОДИН меш с вершинными цветами — монолит, один материал,
##      один draw call на модель.
##
## 10 семейств × 10 архетипов × 10 вариантов × 10 отделок = 10 000 моделей.
##
##   SH2Monolith.COUNT                   # 10 000
##   SH2Monolith.describe(i)             # {id, family, title, openings, recesses, tris}
##   SH2Monolith.build(i)                # {mesh: ArrayMesh, colliders: Array, ...}
##   SH2Monolith.build_node(i, opts)     # MeshInstance3D с одним материалом

const ARCHETYPES := 10
const VARIANTS := 10
const FINISHES := 10

const FAMILIES := [
	{"key": "block", "title": "блок", "desc": "сплошной блок с окнами по фасаду"},
	{"key": "slab", "title": "плита", "desc": "стеновая плита с проёмом"},
	{"key": "pier", "title": "тумба", "desc": "массивная тумба с нишами"},
	{"key": "crate", "title": "ящик", "desc": "усиленный ящик с прорезями жёсткости"},
	{"key": "column", "title": "колонна", "desc": "гранёная колонна с выемками"},
	{"key": "parapet", "title": "парапет", "desc": "парапет с бойницами"},
	{"key": "stela", "title": "стела", "desc": "плоская стела с аркой"},
	{"key": "pedestal", "title": "постамент", "desc": "ступенчатый постамент с нишами"},
	{"key": "fence", "title": "секция", "desc": "секция ограды с окнами"},
	{"key": "cassette", "title": "кассета", "desc": "многокамерная кассета"},
]

const COLORS := {
	"block": ["#6b6a63", "#5a6a63", "#6a6055", "#59616a", "#736a58"],
	"slab": ["#707064", "#5f6a6f", "#6d655a", "#646d5c", "#6f6a60"],
	"pier": ["#5d6166", "#68645c", "#5a6259", "#6a625a", "#606468"],
	"crate": ["#7a6440", "#6b5a3c", "#82693f", "#5f5338", "#715c3a"],
	"column": ["#77746a", "#6a6d63", "#807a6e", "#5f625c", "#736d60"],
	"parapet": ["#65675f", "#5b6058", "#6d6b60", "#5f6359", "#6a685e"],
	"stela": ["#6e7168", "#5c6159", "#75736a", "#62655d", "#6a6f66"],
	"pedestal": ["#6a6459", "#5e6058", "#726b60", "#62605a", "#6d675c"],
	"fence": ["#5a5f5b", "#666a63", "#525753", "#6b6e66", "#5e625c"],
	"cassette": ["#676b63", "#5c615a", "#70736a", "#61655e", "#6a6e65"],
}

const COUNT := FAMILIES.size() * ARCHETYPES * VARIANTS * FINISHES


## Детерминированный ГПСЧ: один индекс всегда даёт одну и ту же модель.
class Rng:
	var s: int = 1

	func _init(seed_value: int) -> void:
		s = (seed_value * 2654435761) & 0x7FFFFFFF
		if s == 0:
			s = 1

	func next() -> float:
		s = (s * 1103515245 + 12345) & 0x7FFFFFFF
		return float(s) / 2147483648.0

	func range_f(a: float, b: float) -> float:
		return a + (b - a) * next()

	func range_i(a: int, b: int) -> int:
		if b <= a:
			return a
		return a + int(next() * float(b - a + 1)) % (b - a + 1)

	func pick(arr: Array):
		if arr.is_empty():
			return null
		return arr[int(next() * float(arr.size())) % arr.size()]


## ------------------------------- описание --------------------------------
static func describe(index: int) -> Dictionary:
	var i: int = clampi(index, 0, COUNT - 1)
	var f: int = i / (ARCHETYPES * VARIANTS * FINISHES)
	var rest: int = i - f * ARCHETYPES * VARIANTS * FINISHES
	var arch: int = rest / (VARIANTS * FINISHES)
	rest -= arch * VARIANTS * FINISHES
	var variant: int = rest / FINISHES
	var finish: int = rest - variant * FINISHES
	var fam: Dictionary = FAMILIES[f]
	return {
		"index": i,
		"id": "%s-%d-%d-%d" % [fam["key"], arch, variant, finish],
		"family": fam["key"],
		"family_title": fam["title"],
		"archetype": arch,
		"variant": variant,
		"finish": finish,
		"title": "%s №%d" % [fam["title"], arch * VARIANTS + variant + 1],
		"seed": i * 7919 + 13,
	}


static func family_keys() -> Array:
	var out: Array = []
	for f in FAMILIES:
		out.append(f["key"])
	return out


## --------------------------- панель с прорезями ---------------------------
## Лицевая грань панели в локальных координатах: x ∈ [0, w], y ∈ [0, h],
## z ∈ [-thick/2, +thick/2]. Прорези (holes) вырезают насквозь, выемки
## (recesses) — на глубину depth с дном.
static func _rect_from(d: Dictionary) -> Rect2:
	return Rect2(float(d["x"]), float(d["y"]), float(d["w"]), float(d["h"]))


## Декомпозиция прямоугольника на свободные участки: столбцы по всем X-краям,
## в каждом столбце вычитаем интервалы прорезей. Никакой триангуляции со
## сложными контурами — только точные прямоугольники, поэтому в грани нет
## щелей и наложений.
static func decompose(w: float, h: float, voids: Array) -> Array:
	var xs: Array = [0.0, w]
	for v in voids:
		xs.append(clampf(v.position.x, 0.0, w))
		xs.append(clampf(v.position.x + v.size.x, 0.0, w))
	xs.sort()
	var out: Array = []
	for k in xs.size() - 1:
		var x0: float = xs[k]
		var x1: float = xs[k + 1]
		if x1 - x0 < 0.0002:
			continue
		var mid: float = (x0 + x1) * 0.5
		var spans: Array = []
		for v in voids:
			if mid > v.position.x + 0.0001 and mid < v.position.x + v.size.x - 0.0001:
				spans.append(Vector2(maxf(0.0, v.position.y), minf(h, v.position.y + v.size.y)))
		spans.sort_custom(func(a, b): return a.x < b.x)
		var y: float = 0.0
		for sp in spans:
			var top: float = clampf(sp.x, 0.0, h)
			if top - y > 0.0002:
				out.append(Rect2(x0, y, x1 - x0, top - y))
			y = maxf(y, clampf(sp.y, 0.0, h))
		if h - y > 0.0002:
			out.append(Rect2(x0, y, x1 - x0, h - y))
	return out


static func _begin(color: Color) -> SurfaceTool:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	st.set_color(color)
	return st


static func _tri(st: SurfaceTool, a: Vector3, b: Vector3, c: Vector3) -> void:
	var n: Vector3 = (b - a).cross(c - a)
	if n.length_squared() < 1e-14:
		return
	st.add_vertex(a)
	st.add_vertex(b)
	st.add_vertex(c)


static func _quad(st: SurfaceTool, a: Vector3, b: Vector3, c: Vector3, d: Vector3) -> void:
	_tri(st, a, b, c)
	_tri(st, a, c, d)


## Квад с проверкой стороны: если нормаль смотрит против out_dir, порядок
## вершин разворачивается. Без этого прорези и выемки получались чёрными —
## внутренние стенки освещались с изнанки.
static func _quad_n(st: SurfaceTool, a: Vector3, b: Vector3, c: Vector3, d: Vector3,
		out_dir: Vector3) -> void:
	var n: Vector3 = (b - a).cross(c - a)
	if n.dot(out_dir) < 0.0:
		_tri(st, a, d, c)
		_tri(st, a, c, b)
		return
	_tri(st, a, b, c)
	_tri(st, a, c, d)


## Панель: face — прямоугольник, holes — насквозь, recesses — {rect, depth}.
static func panel_mesh(w: float, h: float, thick: float, holes: Array,
		recesses: Array, color: Color, xf: Transform3D = Transform3D.IDENTITY,
		inner_color: Color = Color(0, 0, 0, 0)) -> ArrayMesh:
	var st := _begin(color)
	var half: float = thick * 0.5
	var voids: Array = []
	for r in holes:
		voids.append(r)
	for rc in recesses:
		voids.append(rc["rect"])
	var free := decompose(w, h, voids)

	# лицевая и тыльная плоскости
	for r in free:
		var p0 := Vector3(r.position.x, r.position.y, half)
		var p1 := Vector3(r.position.x + r.size.x, r.position.y, half)
		var p2 := Vector3(r.position.x + r.size.x, r.position.y + r.size.y, half)
		var p3 := Vector3(r.position.x, r.position.y + r.size.y, half)
		_quad_n(st, p0, p1, p2, p3, Vector3.FORWARD * -1.0)
		var q0 := Vector3(p0.x, p0.y, -half)
		var q1 := Vector3(p1.x, p1.y, -half)
		var q2 := Vector3(p2.x, p2.y, -half)
		var q3 := Vector3(p3.x, p3.y, -half)
		_quad_n(st, q0, q1, q2, q3, Vector3.BACK * -1.0)

	# внешний торец панели
	var oc := [
		Vector2(0, 0), Vector2(w, 0), Vector2(w, h), Vector2(0, h)
	]
	var mid2 := Vector2(w * 0.5, h * 0.5)
	for i in 4:
		var a: Vector2 = oc[i]
		var b: Vector2 = oc[(i + 1) % 4]
		var a0 := Vector3(a.x, a.y, -half)
		var a1 := Vector3(a.x, a.y, half)
		var b0 := Vector3(b.x, b.y, -half)
		var b1 := Vector3(b.x, b.y, half)
		var edge_mid: Vector2 = (a + b) * 0.5
		var out2: Vector2 = (edge_mid - mid2).normalized()
		_quad_n(st, a0, b0, b1, a1, Vector3(out2.x, out2.y, 0.0))

	# стенки сквозных прорезей: нормали смотрят ВНУТРЬ прорези
	for r in holes:
		_rect_tube(st, r, -half, half)

	# выемки: стенки на глубину и дно
	for rc in recesses:
		var r: Rect2 = rc["rect"]
		var depth: float = clampf(float(rc.get("depth", 0.06)), 0.002, thick * 1.5)
		var back: float = half - depth
		_rect_tube(st, r, back, half)
		var sr := _begin(inner_color if inner_color.a > 0.0 else color.darkened(0.22))
		var b0 := Vector3(r.position.x, r.position.y, back)
		var b1 := Vector3(r.position.x + r.size.x, r.position.y, back)
		var b2 := Vector3(r.position.x + r.size.x, r.position.y + r.size.y, back)
		var b3 := Vector3(r.position.x, r.position.y + r.size.y, back)
		# дно выемки смотрит наружу панели, то есть к лицевой стороне
		_quad_n(sr, b0, b1, b2, b3, Vector3.BACK)
		var srm := sr.commit()
		st.append_from(srm, 0, Transform3D.IDENTITY)

	st.generate_normals()
	var mesh := st.commit()
	return _transformed(mesh, xf)


## Стенки вокруг прямоугольного отверстия между двумя плоскостями z.
## Нормали каждой стенки смотрят в просвет — иначе изнутри прорезь чёрная.
static func _rect_tube(st: SurfaceTool, r: Rect2, z0: float, z1: float) -> void:
	var x0 := r.position.x
	var x1 := r.position.x + r.size.x
	var y0 := r.position.y
	var y1 := r.position.y + r.size.y
	# низ — смотрит вверх, в просвет
	_quad_n(st, Vector3(x0, y0, z0), Vector3(x1, y0, z0), Vector3(x1, y0, z1),
		Vector3(x0, y0, z1), Vector3.UP)
	# верх — смотрит вниз
	_quad_n(st, Vector3(x0, y1, z1), Vector3(x1, y1, z1), Vector3(x1, y1, z0),
		Vector3(x0, y1, z0), Vector3.DOWN)
	# левая — смотрит вправо
	_quad_n(st, Vector3(x0, y0, z1), Vector3(x0, y1, z1), Vector3(x0, y1, z0),
		Vector3(x0, y0, z0), Vector3.RIGHT)
	# правая — смотрит влево
	_quad_n(st, Vector3(x1, y0, z0), Vector3(x1, y1, z0), Vector3(x1, y1, z1),
		Vector3(x1, y0, z1), Vector3.LEFT)


static func _transformed(mesh: ArrayMesh, xf: Transform3D) -> ArrayMesh:
	if xf == Transform3D.IDENTITY:
		return mesh
	var out := ArrayMesh.new()
	for s in mesh.get_surface_count():
		var arrays: Array = mesh.surface_get_arrays(s)
		var verts: PackedVector3Array = arrays[Mesh.ARRAY_VERTEX]
		var norms: PackedVector3Array = arrays[Mesh.ARRAY_NORMAL]
		var cols: PackedColorArray = arrays[Mesh.ARRAY_COLOR]
		for i in verts.size():
			verts[i] = xf * verts[i]
			if norms != null and norms.size() > i:
				norms[i] = (xf.basis * norms[i]).normalized()
		arrays[Mesh.ARRAY_VERTEX] = verts
		arrays[Mesh.ARRAY_NORMAL] = norms
		arrays[Mesh.ARRAY_COLOR] = cols
		out.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)
	return out


static func _merge(parts: Array) -> ArrayMesh:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for p in parts:
		if p == null:
			continue
		for s in p.get_surface_count():
			st.append_from(p, s, Transform3D.IDENTITY)
	st.generate_normals()
	return st.commit()


## ------------------------- сборка монолита из панелей ----------------------
## Размеры в метрах: W — по X, H — по Y, D — по Z. Модель стоит на y = 0.
static func _box_monolith(w: float, h: float, d: float, thick: float,
		faces: Dictionary, base: Color, bevel_color: Color) -> ArrayMesh:
	var parts: Array = []
	# фаска: панели чуть утоплены в габарит, рёбра и углы срезаны. Силуэт
	# перестаёт быть «коробкой», а читается как цельный тёсаный камень.
	var bev: float = clampf(thick * 0.55, 0.02, 0.09)
	var half_w: float = w * 0.5 - bev
	var half_d: float = d * 0.5 - bev
	var pw: float = w - bev * 2.0
	var ph: float = h - bev * 0.5
	var pd: float = d - bev * 2.0

	# перед (+Z) и зад (−Z)
	var front: Array = faces.get("front", [[], []])
	parts.append(panel_mesh(pw, ph, thick, _clip_holes(front[0], pw, ph, bev),
		front[1], base, Transform3D(Basis.IDENTITY, Vector3(-half_w, bev * 0.5, half_d))))
	var back: Array = faces.get("back", [[], []])
	parts.append(panel_mesh(pw, ph, thick, _clip_holes(back[0], pw, ph, bev), back[1], base,
		Transform3D(Basis(Vector3.UP, PI), Vector3(half_w, bev * 0.5, -half_d))))

	# левая (−X) и правая (+X) — панель «шириной» D
	var left: Array = faces.get("left", [[], []])
	parts.append(panel_mesh(pd, ph, thick, _clip_holes(left[0], pd, ph, bev), left[1], base,
		Transform3D(Basis(Vector3.UP, -PI * 0.5),
			Vector3(-half_w, bev * 0.5, -half_d))))
	var right: Array = faces.get("right", [[], []])
	parts.append(panel_mesh(pd, ph, thick, _clip_holes(right[0], pd, ph, bev), right[1], base,
		Transform3D(Basis(Vector3.UP, PI * 0.5), Vector3(half_w, bev * 0.5, half_d))))

	# верх и низ — горизонтальные панели размером W × D
	var top: Array = faces.get("top", [[], []])
	parts.append(panel_mesh(pw, pd, thick, _clip_holes(top[0], pw, pd, bev), top[1], base,
		Transform3D(Basis(Vector3.RIGHT, -PI * 0.5),
			Vector3(-half_w, h - bev * 0.5, half_d))))
	var bottom: Array = faces.get("bottom", [[], []])
	if bottom[0].size() > 0 or bottom[1].size() > 0:
		parts.append(panel_mesh(pw, pd, thick, _clip_holes(bottom[0], pw, pd, bev),
			bottom[1], base, Transform3D(Basis(Vector3.RIGHT, PI * 0.5),
				Vector3(-half_w, bev * 0.5, -half_d))))

	parts.append(_corners(w, h, d, bev, bevel_color))
	return _merge(parts)


## Срезанные углы: на каждом вертикальном ребре снята фаска одной
## плоскостью на всю высоту. Монолит перестаёт быть «коробкой», но остаётся
## по-настоящему единым объёмом — без накладных планок.
static func _corners(w: float, h: float, d: float, bev: float, color: Color) -> ArrayMesh:
	var st := _begin(color)
	var hw: float = w * 0.5
	var hd: float = d * 0.5
	for sx in [-1.0, 1.0]:
		for sz in [-1.0, 1.0]:
			var ax: float = sx * hw
			var az: float = sz * hd
			var p1 := Vector3(ax, 0.0, az - sz * bev * 1.8)
			var p2 := Vector3(ax - sx * bev * 1.8, 0.0, az)
			var p3 := Vector3(p2.x, h, p2.z)
			var p4 := Vector3(p1.x, h, p1.z)
			_quad_n(st, p1, p2, p3, p4, Vector3(sx, 0.0, sz))
	st.generate_normals()
	return st.commit()


## Прорези, попавшие под фаску, подрезаются: дыра не должна вылезать за грань.
static func _clip_holes(holes: Array, w: float, h: float, margin: float) -> Array:
	var out: Array = []
	for r in holes:
		var lo_x: float = margin * 0.8
		var lo_y: float = margin * 0.8
		var hi_x: float = w - margin * 0.8
		var hi_y: float = h - margin * 0.8
		var x0: float = maxf(lo_x, r.position.x)
		var y0: float = maxf(lo_y, r.position.y)
		var x1: float = minf(hi_x, r.position.x + r.size.x)
		var y1: float = minf(hi_y, r.position.y + r.size.y)
		if x1 - x0 > 0.02 and y1 - y0 > 0.02:
			out.append(Rect2(x0, y0, x1 - x0, y1 - y0))
	return out


static func _rib_column(st: SurfaceTool, at: Vector3, h: float, size: float) -> void:
	var half := size * 0.5
	var a := Vector3(at.x - half, 0, at.z - half)
	var b := Vector3(at.x + half, 0, at.z - half)
	var c := Vector3(at.x + half, 0, at.z + half)
	var d := Vector3(at.x - half, 0, at.z + half)
	var a2 := a + Vector3(0, h, 0)
	var b2 := b + Vector3(0, h, 0)
	var c2 := c + Vector3(0, h, 0)
	var d2 := d + Vector3(0, h, 0)
	_quad_n(st, a, b, b2, a2, Vector3.BACK * -1.0)
	_quad_n(st, b, c, c2, b2, Vector3.RIGHT)
	_quad_n(st, c, d, d2, c2, Vector3.BACK)
	_quad_n(st, d, a, a2, d2, Vector3.LEFT)


## Сплошная коробка (цоколь, капитель, ступень). Без прорезей, 12 треуг.
static func solid_box(w: float, h: float, d: float, color: Color,
		at: Vector3 = Vector3.ZERO) -> ArrayMesh:
	var st := _begin(color)
	var hw: float = w * 0.5
	var hd: float = d * 0.5
	var y0: float = at.y
	var y1: float = at.y + h
	var x0: float = at.x - hw
	var x1: float = at.x + hw
	var z0: float = at.z - hd
	var z1: float = at.z + hd
	_quad_n(st, Vector3(x0, y0, z1), Vector3(x1, y0, z1), Vector3(x1, y1, z1),
		Vector3(x0, y1, z1), Vector3.BACK)
	_quad_n(st, Vector3(x1, y0, z0), Vector3(x0, y0, z0), Vector3(x0, y1, z0),
		Vector3(x1, y1, z0), Vector3.FORWARD)
	_quad_n(st, Vector3(x1, y0, z1), Vector3(x1, y0, z0), Vector3(x1, y1, z0),
		Vector3(x1, y1, z1), Vector3.RIGHT)
	_quad_n(st, Vector3(x0, y0, z0), Vector3(x0, y0, z1), Vector3(x0, y1, z1),
		Vector3(x0, y1, z0), Vector3.LEFT)
	_quad_n(st, Vector3(x0, y1, z1), Vector3(x1, y1, z1), Vector3(x1, y1, z0),
		Vector3(x0, y1, z0), Vector3.UP)
	_quad_n(st, Vector3(x0, y0, z0), Vector3(x1, y0, z0), Vector3(x1, y0, z1),
		Vector3(x0, y0, z1), Vector3.DOWN)
	st.generate_normals()
	return st.commit()


## ------------------------------- семейства --------------------------------
## Каждое семейство получает (rng, arch, variant, finish) и возвращает
## {mesh, openings, recesses, w, h, d}.
static func _make(family: String, rng: Rng, arch: int, variant: int, finish: int) -> Dictionary:
	var palette: Array = COLORS[family]
	var base := Color(palette[(variant + finish) % palette.size()])
	var inner := base.darkened(0.30 + 0.02 * float(finish % 4))
	var rib := base.lightened(0.06 + 0.01 * float(finish % 5))

	var w := 1.1
	var h := 1.0
	var d := 1.1
	var thick := 0.08
	var faces := {}
	var openings := 0
	var recesses := 0

	match family:
		"block":
			w = rng.range_f(1.0, 1.9) * (1.0 + 0.03 * float(arch))
			h = rng.range_f(0.7, 1.4)
			d = rng.range_f(0.9, 1.5)
			thick = 0.10
			var cols: int = 1 + (variant + arch) % 3
			var rows: int = 1 + (variant / 3 + arch) % 2
			faces["front"] = _grid_openings(w, h, cols, rows, 0.16, 0.06, openings)
			openings += cols * rows
			if finish % 3 == 0:
				var rec: Array = _single_recess(w, h, 0.34, 0.20, 0.07 + 0.01 * float(finish % 3))
				faces["back"] = [[], rec]
				recesses += 1
			if arch >= 5:
				faces["top"] = _grid_openings(w, d, 1 + arch / 5, 1, 0.20, 0.05, openings)
				openings += 1 + arch / 5
		"slab":
			w = rng.range_f(1.6, 3.2)
			h = rng.range_f(1.4, 2.6)
			d = rng.range_f(0.26, 0.42)
			thick = maxf(0.10, d * 0.4)
			var ow := minf(w * 0.44, rng.range_f(0.6, 1.2))
			var oh := minf(h * 0.52, rng.range_f(0.8, 1.4))
			var r := Rect2((w - ow) * 0.5, h * 0.12 + (h - oh) * 0.28 * float(arch % 3) * 0.5, ow, oh)
			faces["front"] = [[r], []]
			faces["back"] = [[r], []]
			openings += 1
			if variant % 2 == 1:
				var small := Rect2(w * 0.10, h * 0.62, minf(w * 0.18, 0.4), minf(h * 0.22, 0.4))
				faces["front"] = [[r, small], []]
				openings += 1
			if finish % 4 == 1:
				faces["front"] = [faces["front"][0], _single_recess(w, h, 0.5, 0.1, 0.05)]
				recesses += 1
		"pier":
			w = rng.range_f(0.7, 1.2)
			h = rng.range_f(0.8, 1.6)
			d = rng.range_f(0.7, 1.2)
			thick = 0.09
			var niches: Array = []
			var rows2: int = 1 + variant % 3
			for i in rows2:
				var ny: float = h * (0.18 + 0.22 * float(i))
				niches.append({"rect": Rect2(w * 0.22, ny, w * 0.56, minf(h * 0.18, 0.26)),
					"depth": 0.05 + 0.02 * float((finish + i) % 3)})
			faces["front"] = [[], niches]
			recesses += rows2
			if arch % 2 == 0:
				faces["left"] = _grid_openings(d, h, 1, 1, 0.2, 0.05, openings)
				openings += 1
		"crate":
			w = rng.range_f(0.7, 1.1)
			h = rng.range_f(0.6, 0.95)
			d = rng.range_f(0.7, 1.1)
			thick = 0.06
			var slots: Array = []
			var n_slots: int = 2 + variant % 4
			for i in n_slots:
				var sx: float = w * (0.10 + 0.80 * float(i + 1) / float(n_slots + 1))
				slots.append(Rect2(sx - w * 0.035, h * 0.10, w * 0.07, h * 0.80))
			faces["front"] = [slots, []]
			faces["back"] = [slots, []]
			openings += n_slots * 2
			if finish % 3 == 0:
				faces["top"] = [[], _single_recess(w, d, 0.55, 0.1, 0.06)]
				recesses += 1
			if arch >= 6:
				faces["left"] = _grid_openings(d, h, 2, 1, 0.14, 0.04, openings)
				openings += 2
		"column":
			w = rng.range_f(0.4, 0.8)
			h = rng.range_f(1.8, 3.4)
			d = w * rng.range_f(0.9, 1.2)
			thick = 0.10
			var bands: int = 2 + variant % 4
			var band_holes: Array = []
			var band_rec: Array = []
			for i in bands:
				var y: float = h * (0.08 + 0.82 * float(i + 1) / float(bands + 1))
				if (i + arch) % 3 == 0:
					band_rec.append({"rect": Rect2(w * 0.5 - w * 0.18, y, w * 0.36, h * 0.05),
						"depth": 0.04 + 0.01 * float(finish % 4)})
				else:
					band_holes.append(Rect2(w * 0.5 - w * 0.14, y, w * 0.28, h * 0.05))
			faces["front"] = [band_holes, band_rec]
			openings += band_holes.size()
			recesses += band_rec.size()
			faces["back"] = [band_holes, []]
			openings += band_holes.size()
		"parapet":
			w = rng.range_f(2.4, 4.4)
			h = rng.range_f(0.9, 1.5)
			d = rng.range_f(0.34, 0.55)
			thick = maxf(0.10, d * 0.42)
			var embrasures: int = 3 + variant % 5
			var holes: Array = []
			for i in embrasures:
				var sx: float = w * (0.08 + 0.84 * float(i + 0.5) / float(embrasures))
				holes.append(Rect2(sx - w * 0.035, h * 0.42, w * 0.07, h * 0.34))
			faces["front"] = [holes, []]
			faces["back"] = [holes, []]
			openings += embrasures * 2
			if arch % 3 == 0:
				faces["top"] = [[], _single_recess(w, d, 0.30, 0.12, 0.05)]
				recesses += 1
		"stela":
			w = rng.range_f(1.2, 2.2)
			h = rng.range_f(1.8, 3.0)
			d = rng.range_f(0.22, 0.36)
			thick = maxf(0.09, d * 0.45)
			var arch_w: float = minf(w * 0.5, 0.9)
			var arch_h: float = minf(h * 0.55, 1.5)
			var r2 := Rect2((w - arch_w) * 0.5, h * 0.10, arch_w, arch_h)
			var stack: Array = [r2]
			if variant % 3 == 0:
				stack.append(Rect2((w - arch_w * 0.5) * 0.5, h * 0.72, arch_w * 0.5, minf(h * 0.18, 0.3)))
			faces["front"] = [stack, []]
			faces["back"] = [stack, []]
			openings += stack.size() * 2
			if finish % 5 == 2:
				faces["front"] = [stack, _single_recess(w, h, 0.62, 0.08, 0.04)]
				recesses += 1
		"pedestal":
			w = rng.range_f(1.0, 1.8)
			h = rng.range_f(1.0, 2.0)
			d = rng.range_f(1.0, 1.8)
			thick = 0.10
			var n_niches: int = 1 + variant % 3
			var niches2: Array = []
			for i in n_niches:
				var step: float = 0.68 * float(i) / float(maxi(1, n_niches - 1))
				var nx: float = w * (0.16 + step) if n_niches > 1 else w * 0.3
				niches2.append({"rect": Rect2(nx - w * 0.09, h * 0.14, w * 0.18, h * 0.30),
					"depth": 0.07 + 0.015 * float((arch + i) % 4)})
			faces["front"] = [[], niches2]
			recesses += n_niches
			faces["left"] = [[], niches2]
			recesses += n_niches
			if arch % 2 == 1:
				faces["top"] = _grid_openings(w, d, 2, 2, 0.22, 0.05, openings)
				openings += 4
		"fence":
			w = rng.range_f(2.0, 3.6)
			h = rng.range_f(1.2, 2.2)
			d = rng.range_f(0.14, 0.24)
			thick = maxf(0.07, d * 0.6)
			var win: int = 2 + variant % 4
			var wh: Array = []
			for i in win:
				var sx: float = w * (0.06 + 0.88 * float(i + 0.5) / float(win))
				wh.append(Rect2(sx - w * 0.055, h * 0.16, w * 0.11, h * 0.62))
			faces["front"] = [wh, []]
			faces["back"] = [wh, []]
			openings += win * 2
			# выемка снизу — «пролаз» под ограждением
			faces["bottom"] = [[], _single_recess(w, d, 0.5, 0.5, 0.012)]
			recesses += 1
		"cassette":
			w = rng.range_f(1.0, 2.0)
			h = rng.range_f(0.8, 1.6)
			d = rng.range_f(0.6, 1.1)
			thick = 0.07
			var cx: int = 2 + arch % 3
			var cy: int = 2 + variant % 3
			var cells: Array = []
			var cells_rec: Array = []
			for iy in cy:
				for ix in cx:
					var cw: float = w / float(cx) * 0.62
					var ch: float = h / float(cy) * 0.62
					var px: float = w * (float(ix) + 0.5) / float(cx) - cw * 0.5
					var py: float = h * (float(iy) + 0.5) / float(cy) - ch * 0.5
					if (ix + iy + finish) % 4 == 0:
						cells_rec.append({"rect": Rect2(px, py, cw, ch),
							"depth": 0.05 + 0.02 * float(finish % 3)})
					else:
						cells.append(Rect2(px, py, cw, ch))
			faces["front"] = [cells, cells_rec]
			openings += cells.size()
			recesses += cells_rec.size()
			faces["back"] = [cells, []]
			openings += cells.size()
			if arch >= 7:
				faces["right"] = _grid_openings(d, h, 1, 2, 0.18, 0.05, openings)
				openings += 2

	var body := _box_monolith(w, h, d, thick, faces, base, rib)
	var extras: Array = []
	match family:
		"pedestal":
			extras.append(solid_box(w + 0.34, 0.16, d + 0.34, rib.darkened(0.12)))
			extras.append(solid_box(w + 0.18, 0.10, d + 0.18, rib.darkened(0.06),
				Vector3(0, h - 0.10, 0)))
		"block":
			extras.append(solid_box(w + 0.16, 0.12, d + 0.16, rib.darkened(0.10),
				Vector3(0, h - 0.06, 0)))
			if arch >= 5:
				extras.append(solid_box(w + 0.24, 0.10, d + 0.24, rib.darkened(0.14),
					Vector3(0, h + 0.06, 0)))
		"column":
			extras.append(solid_box(w + 0.22, 0.14, d + 0.22, rib.darkened(0.10)))
			extras.append(solid_box(w + 0.26, 0.12, d + 0.26, rib.lightened(0.04),
				Vector3(0, h - 0.12, 0)))
		"stela":
			extras.append(solid_box(w + 0.26, 0.14, d + 0.18, rib.darkened(0.12)))
		"parapet":
			extras.append(solid_box(w + 0.06, 0.09, d + 0.10, rib.lightened(0.05),
				Vector3(0, h - 0.04, 0)))
		"pier":
			extras.append(solid_box(w + 0.20, 0.12, d + 0.20, rib.darkened(0.10)))
			extras.append(solid_box(w + 0.14, 0.08, d + 0.14, rib.darkened(0.04),
				Vector3(0, h - 0.08, 0)))
		"fence":
			for sx2 in [-1.0, 1.0]:
				extras.append(solid_box(0.12, h + 0.12, d + 0.10, rib.darkened(0.10),
					Vector3(sx2 * (w * 0.5 + 0.05), 0, 0)))
	var mesh: ArrayMesh = body
	if extras.size() > 0:
		var all: Array = [body]
		all.append_array(extras)
		mesh = _merge(all)
	return {
		"mesh": mesh,
		"w": w, "h": h, "d": d,
		"openings": openings,
		"recesses": recesses,
		"colliders": [{"x": 0.0, "z": 0.0, "hw": w * 0.5, "hd": d * 0.5, "h": h, "y": 0.0,
			"kind": "monolith"}],
	}


## Сетка сквозных прорезей по фасаду.
static func _grid_openings(w: float, h: float, cols: int, rows: int,
		pad_x: float, pad_y: float, _seed: int) -> Array:
	var holes: Array = []
	var cell_w: float = w / float(cols)
	var cell_h: float = h / float(rows)
	for iy in rows:
		for ix in cols:
			var ow: float = maxf(0.06, cell_w - pad_x * 2.0)
			var oh: float = maxf(0.06, cell_h - pad_y * 2.0)
			holes.append(Rect2(ix * cell_w + (cell_w - ow) * 0.5,
				iy * cell_h + (cell_h - oh) * 0.5, ow, oh))
	return [holes, []]


## Одна выемка по центру панели: d — доля ширины/высоты, depth — глубина.
static func _single_recess(w: float, h: float, k: float, _unused: float, depth: float) -> Array:
	var rw: float = w * k * 0.5
	var rh: float = h * k * 0.35
	return [{"rect": Rect2((w - rw) * 0.5, (h - rh) * 0.5, rw, rh), "depth": depth}]


## --------------------------------- сборка --------------------------------
static func build(index: int) -> Dictionary:
	var d := describe(index)
	var rng := Rng.new(int(d["seed"]))
	var made := _make(str(d["family"]), rng, int(d["archetype"]), int(d["variant"]), int(d["finish"]))
	made["id"] = d["id"]
	made["title"] = d["title"]
	made["family"] = d["family"]
	made["index"] = int(d["index"])
	made["tris"] = _tri_count(made["mesh"])
	return made


static func build_node(index: int, opts: Dictionary = {}) -> MeshInstance3D:
	var made := build(index)
	var mi := MeshInstance3D.new()
	mi.mesh = made["mesh"]
	var mat := StandardMaterial3D.new()
	mat.vertex_color_use_as_albedo = true
	mat.roughness = float(opts.get("roughness", 0.86))
	mat.metallic = float(opts.get("metallic", 0.08))
	mi.material_override = mat
	mi.name = "monolith_" + str(made["id"])
	mi.set_meta("openings", made["openings"])
	mi.set_meta("recesses", made["recesses"])
	mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON if bool(opts.get("shadow", true)) \
		else GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	return mi


static func _tri_count(mesh: ArrayMesh) -> int:
	var total := 0
	if mesh == null:
		return 0
	for s in mesh.get_surface_count():
		var arrays: Array = mesh.surface_get_arrays(s)
		var idx = arrays[Mesh.ARRAY_INDEX]
		if idx != null:
			total += (idx as PackedInt32Array).size() / 3
		else:
			total += (arrays[Mesh.ARRAY_VERTEX] as PackedVector3Array).size() / 3
	return total


## Статистика по набору: сколько моделей, треугольников, прорезей и выемок.
## count ограничивает перебор (по умолчанию все 10 000 — это долго, поэтому
## тесты берут выборку).
static func stats(count: int = 1000) -> Dictionary:
	var n: int = clampi(count, 1, COUNT)
	var tris := 0
	var openings := 0
	var recesses := 0
	var min_tris := 1 << 30
	var max_tris := 0
	for i in n:
		var made := build(i)
		var t: int = int(made["tris"])
		tris += t
		openings += int(made["openings"])
		recesses += int(made["recesses"])
		min_tris = mini(min_tris, t)
		max_tris = maxi(max_tris, t)
	return {
		"count": n,
		"total": COUNT,
		"tris": tris,
		"avg_tris": int(float(tris) / float(n)),
		"min_tris": min_tris,
		"max_tris": max_tris,
		"openings": openings,
		"recesses": recesses,
	}
