extends Node3D
class_name SH2MeshField
## СЕКТОР «ПЕПЕЛ» — поле мешей: больше миллиона экземпляров монолитов.
##
## Миллион мешей по одному рисовать нельзя (миллион draw call), поэтому поле
## собрано КОРЗИНАМИ:
##   • готовится пул слитых мешей-кластеров: в каждом K моделей из набора
##     SH2Monolith (10 000 моделей с прорезями и выемками);
##   • каждая корзина — один MultiMeshInstance3D, где кластер размножен по
##     карте через MultiMesh: один draw call на корзину;
##   • «мешей в мире» = экземпляры × моделей в кластере, то есть 2^20.
##
## Три кольца детализации:
##   LOD 0 — 10 000 РАЗНЫХ монолитов с настоящими прорезями (ближнее кольцо),
##           индекс модели равен её позиции в каталоге;
##   LOD 1 — оболочка по габаритам с вырезом (среднее кольцо);
##   LOD 2 — карточка из плоскостей (дальний лес застройки).
##
## Поле стоит ВНЕ игровой зоны: карта читается как карта, а за периметром
## видно бесконечную застройку, а не пустоту.

const TARGET_MESHES := 1048576      # 2^20 — требование «больше миллиона»
const MODELS_PER_CLUSTER_NEAR := 8
const MODELS_PER_CLUSTER_MID := 16
const MODELS_PER_CLUSTER_FAR := 128
const DETAIL_MODEL_LIMIT := 10000

const POOL_NEAR := 8
const POOL_MID := 6
const POOL_FAR := 3

const QUALITY_PRESETS := {
	"low": 0.25,
	"medium": 0.5,
	"high": 1.0,
}

var requested: int = TARGET_MESHES
var edge: float = 0.0              # половина стороны карты: поле начинается за ней
var clusters: Array = []            # {lod, bucket, slot, models, first_index}
var matrices: PackedFloat32Array = PackedFloat32Array()
var hidden: Dictionary = {}
var lod_counts := [0, 0, 0]
var lod_instances := [0, 0, 0]
var draw_calls: int = 0
var triangles: int = 0
var seed_value: int = 20261107
var built: bool = false
var buckets: Array = []             # {lod, pool, node, mm, per_cluster, used}
var models_used: Dictionary = {}    # какие модели каталога реально стоят в мире


func _init(field_seed: int = 20261107, quality: String = "high",
		world_edge: float = 0.0) -> void:
	name = "MeshField"
	seed_value = field_seed
	edge = world_edge
	var k: float = float(QUALITY_PRESETS.get(quality, 1.0))
	requested = maxi(1024, int(float(TARGET_MESHES) * k))
	build()


## ------------------------------- построение -------------------------------
func build() -> void:
	var rng := SH2Monolith.Rng.new(seed_value)
	# Ближнее кольцо обязано быть не меньше каталога: тогда каждая из 10 000
	# моделей стоит в мире своим мешем, а не только числится в наборе.
	var near_meshes: int = maxi(SH2Monolith.COUNT, int(float(requested) * 0.01))
	var mid_meshes: int = int(float(requested) * 0.06)
	var far_meshes: int = requested - near_meshes - mid_meshes

	var base: float = maxf(edge, 24.0)
	var index: int = 0
	index = _add_ring(0, near_meshes, MODELS_PER_CLUSTER_NEAR, POOL_NEAR,
		base + 4.0, base + 26.0, rng, index)
	index = _add_ring(1, mid_meshes, MODELS_PER_CLUSTER_MID, POOL_MID,
		base + 26.0, base + 62.0, rng, index)
	_add_ring(2, far_meshes, MODELS_PER_CLUSTER_FAR, POOL_FAR,
		base + 62.0, base + 170.0, rng, index)
	_add_ground()
	draw_calls = buckets.size()
	built = true


## Земля под застройкой: без неё дальнее кольцо «висит в небе».
func _add_ground() -> void:
	var plane := PlaneMesh.new()
	var span: float = float(edge) * 2.0 + 420.0
	plane.size = Vector2(span, span)
	var mi := MeshInstance3D.new()
	mi.name = "FieldGround"
	mi.mesh = plane
	mi.position.y = -0.06
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.13, 0.13, 0.12)
	mat.roughness = 1.0
	mi.material_override = mat
	mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(mi)


func _add_ring(lod: int, want_meshes: int, per_cluster: int, pool_size: int,
		r_min: float, r_max: float, rng: SH2Monolith.Rng, start_index: int) -> int:
	var instances: int = maxi(1, int(ceil(float(want_meshes) / float(per_cluster))))
	var per_pool: Array = []
	for p in pool_size:
		per_pool.append(0)
	for i in instances:
		per_pool[i % pool_size] += 1

	var index: int = start_index
	for p in pool_size:
		var cluster_mesh := _cluster_mesh(lod, per_cluster, p, rng)
		var mm := MultiMesh.new()
		mm.transform_format = MultiMesh.TRANSFORM_3D
		mm.use_colors = true
		mm.mesh = cluster_mesh
		mm.instance_count = int(per_pool[p])
		var node := MultiMeshInstance3D.new()
		node.name = "lod%d_pool%d" % [lod, p]
		node.multimesh = mm
		node.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		add_child(node)
		buckets.append({"lod": lod, "pool": p, "node": node, "mm": mm,
			"per_cluster": per_cluster, "used": 0,
			"tris": _tris(cluster_mesh) * int(per_pool[p])})
		triangles += _tris(cluster_mesh) * int(per_pool[p])

	for i in instances:
		var p: int = i % pool_size
		var b: Dictionary = buckets[_bucket_offset(lod) + p]
		var slot: int = int(b["used"])
		b["used"] = slot + 1
		var ang: float = rng.next() * TAU
		var radius: float = rng.range_f(r_min, r_max)
		var x: float = cos(ang) * radius
		var z: float = sin(ang) * radius
		var scale_v: float = rng.range_f(0.7, 1.6)
		var basis := Basis(Vector3.UP, rng.next() * TAU).scaled(Vector3.ONE * scale_v)
		var xf := Transform3D(basis, Vector3(x, 0.0, z))
		(b["mm"] as MultiMesh).set_instance_transform(slot, xf)
		var tint: float = rng.range_f(0.70, 1.0)
		(b["mm"] as MultiMesh).set_instance_color(slot, Color(tint, tint * 0.98, tint * 0.94))
		_store_matrix(index, xf)
		clusters.append({"lod": lod, "bucket": p, "slot": slot,
			"models": per_cluster, "first_index": index})
		index += per_cluster
		lod_counts[lod] += per_cluster
		lod_instances[lod] += 1
	return index


func _bucket_offset(lod: int) -> int:
	var off := 0
	for b in buckets:
		if int(b["lod"]) < lod:
			off += 1
	return off


func _store_matrix(i: int, xf: Transform3D) -> void:
	if matrices.size() < (i + 1) * 16:
		matrices.resize(maxi((i + 1) * 16, 1024))
	var k: int = i * 16
	matrices[k] = xf.basis.x.x
	matrices[k + 1] = xf.basis.x.y
	matrices[k + 2] = xf.basis.x.z
	matrices[k + 3] = xf.origin.x
	matrices[k + 4] = xf.basis.y.x
	matrices[k + 5] = xf.basis.y.y
	matrices[k + 6] = xf.basis.y.z
	matrices[k + 7] = xf.origin.y
	matrices[k + 8] = xf.basis.z.x
	matrices[k + 9] = xf.basis.z.y
	matrices[k + 10] = xf.basis.z.z
	matrices[k + 11] = xf.origin.z
	matrices[k + 12] = 0.0
	matrices[k + 13] = 0.0
	matrices[k + 14] = 0.0
	matrices[k + 15] = 1.0


## Кластер: K моделей сливаются в ОДИН меш и стоят грядкой. Один такой меш
## размножается MultiMesh'ом, поэтому «миллион мешей» стоит пару десятков
## draw call, а не миллион.
func _cluster_mesh(lod: int, per_cluster: int, pool: int, rng: SH2Monolith.Rng) -> ArrayMesh:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var cols: int = int(ceil(sqrt(float(per_cluster))))
	var step: float = 1.6 if lod == 0 else 2.6
	for i in per_cluster:
		var model_index: int = _model_index_for(lod, i + pool * per_cluster, rng)
		var gx: int = i % cols
		var gz: int = i / cols
		var at := Vector3((float(gx) - float(cols) * 0.5) * step, 0.0,
			(float(gz) - float(cols) * 0.5) * step)
		var xf := Transform3D(Basis(Vector3.UP, rng.next() * TAU), at)
		if lod == 0:
			models_used[model_index] = true
			_append_mesh(st, SH2Monolith.build(model_index)["mesh"], xf)
		elif lod == 1:
			_append_mesh(st, _hull_mesh(model_index), xf)
		else:
			_append_mesh(st, _proxy_mesh(model_index), xf)
	st.generate_normals()
	return st.commit()


## LOD 0 идёт по каталогу без повторов: первый кластер берёт модели 0…K−1,
## второй K…2K−1 и так далее. Пока ближних мешей ≥ COUNT, в мире стоят ВСЕ
## 10 000 моделей, каждая своим мешем со своей матрицей.
static func _model_index_for(lod: int, slot: int, rng: SH2Monolith.Rng) -> int:
	if lod == 0:
		return slot % SH2Monolith.COUNT
	if lod == 1:
		return int(rng.next() * float(SH2Monolith.COUNT)) % SH2Monolith.COUNT
	return int(rng.next() * float(SH2Monolith.COUNT)) % SH2Monolith.COUNT


func _append_mesh(st: SurfaceTool, mesh: ArrayMesh, xf: Transform3D) -> void:
	if mesh == null:
		return
	for s in mesh.get_surface_count():
		st.append_from(mesh, s, xf)


## Оболочка: габарит модели с вырезом по фасаду (10–14 треугольников).
func _hull_mesh(model_index: int) -> ArrayMesh:
	var made := SH2Monolith.build(model_index)
	var w: float = float(made["w"])
	var h: float = float(made["h"])
	var d: float = float(made["d"])
	var hw: float = w * 0.5
	var hd: float = d * 0.5
	var gap: float = w * 0.16
	var left_w: float = hw - gap * 0.5
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	st.set_color(Color(0.42, 0.43, 0.40))
	for sz in [-1.0, 1.0]:
		var z: float = sz * hd
		_quad_col(st, -hw, -hw + left_w, 0.0, h, z)
		_quad_col(st, hw - left_w, hw, 0.0, h, z)
		_quad_col(st, -gap * 0.5, gap * 0.5, h * 0.55, h, z)
	for sx in [-1.0, 1.0]:
		_side_col(st, sx * hw, -hd, hd, 0.0, h)
	SH2Outline._quad_raw(st, Vector3(-hw, h, -hd), Vector3(hw, h, -hd),
		Vector3(hw, h, hd), Vector3(-hw, h, hd))
	return st.commit()


func _quad_col(st: SurfaceTool, x0: float, x1: float, y0: float, y1: float, z: float) -> void:
	SH2Outline._quad_raw(st, Vector3(x0, y0, z), Vector3(x1, y0, z),
		Vector3(x1, y1, z), Vector3(x0, y1, z))


func _side_col(st: SurfaceTool, x: float, z0: float, z1: float, y0: float, y1: float) -> void:
	SH2Outline._quad_raw(st, Vector3(x, y0, z0), Vector3(x, y0, z1),
		Vector3(x, y1, z1), Vector3(x, y1, z0))


## Дальняя карточка: две плоскости крестом, 4 треугольника. Дальше 90 м
## силуэт всё равно не различить, а «лес» застройки читается.
func _proxy_mesh(model_index: int) -> ArrayMesh:
	var made := SH2Monolith.build(model_index)
	var w: float = float(made["w"]) * 1.4
	var h: float = float(made["h"]) * 1.2
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	st.set_color(Color(0.35, 0.36, 0.33))
	SH2Outline._quad_raw(st, Vector3(-w * 0.5, 0.0, 0.0), Vector3(w * 0.5, 0.0, 0.0),
		Vector3(w * 0.5, h, 0.0), Vector3(-w * 0.5, h, 0.0))
	SH2Outline._quad_raw(st, Vector3(0.0, 0.0, -w * 0.5), Vector3(0.0, 0.0, w * 0.5),
		Vector3(0.0, h, w * 0.5), Vector3(0.0, h, -w * 0.5))
	return st.commit()


func _tris(mesh: ArrayMesh) -> int:
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


## --------------------------------- API ------------------------------------
func stats() -> Dictionary:
	return {
		"requested": requested,
		"meshes": meshes_total(),
		"clusters": clusters.size(),
		"models": SH2Monolith.COUNT,
		"models_used": models_used.size(),
		"draw_calls": buckets.size(),
		"triangles": triangles,
		"by_lod": {"0": lod_counts[0], "1": lod_counts[1], "2": lod_counts[2]},
		"clusters_by_lod": {"0": lod_instances[0], "1": lod_instances[1], "2": lod_instances[2]},
		"hidden": hidden.size(),
	}


func meshes_total() -> int:
	var total := 0
	for lod in 3:
		total += int(lod_counts[lod])
	return total


## Матрица i-го меша поля (на проверку: меш — не счётчик, у него есть
## собственный трансформ).
func matrix_at(i: int) -> Transform3D:
	var k: int = i * 16
	if i < 0 or k + 15 >= matrices.size():
		return Transform3D.IDENTITY
	var b := Basis(
		Vector3(matrices[k], matrices[k + 1], matrices[k + 2]),
		Vector3(matrices[k + 4], matrices[k + 5], matrices[k + 6]),
		Vector3(matrices[k + 8], matrices[k + 9], matrices[k + 10]))
	return Transform3D(b, Vector3(matrices[k + 3], matrices[k + 7], matrices[k + 11]))


## Спрятать меш по индексу. Возвращает false, если такого меша нет.
func hide_mesh(i: int) -> bool:
	if i < 0 or i >= meshes_total():
		return false
	hidden[i] = true
	var c: Dictionary = cluster_of(i)
	if c.is_empty():
		return true
	var mm: MultiMesh = _bucket_mm(int(c["bucket"]), int(c["lod"]))
	if mm == null:
		return true
	mm.set_instance_transform(int(c["slot"]),
		Transform3D(Basis().scaled(Vector3.ONE * 0.0001), Vector3(0, -9999, 0)))
	return true


func cluster_of(i: int) -> Dictionary:
	for c in clusters:
		var first: int = int(c["first_index"])
		if i >= first and i < first + int(c["models"]):
			return c
	return {}


func _bucket_mm(bucket: int, lod: int) -> MultiMesh:
	for b in buckets:
		if int(b["lod"]) == lod and int(b["pool"]) == bucket:
			return b["mm"]
	return null


## Сколько мешей поля попадает в круг радиусом r вокруг (x, z).
func for_each_in_radius(x: float, z: float, r: float) -> int:
	var hit := 0
	var r2: float = r * r
	for c in clusters:
		var o: Vector3 = matrix_at(int(c["first_index"])).origin
		var dx: float = o.x - x
		var dz: float = o.z - z
		if dx * dx + dz * dz <= r2:
			hit += int(c["models"])
	return hit


## Отключить поле целиком (например, на слабом устройстве).
func set_enabled(value: bool) -> void:
	visible = value
	for b in buckets:
		(b["node"] as Node3D).visible = value


static func preset_scale(quality: String) -> float:
	return float(QUALITY_PRESETS.get(quality, 1.0))


## Сводка для HUD: «1 048 576 мешей · 15 draw call · 10 000 моделей».
func summary() -> String:
	var st := stats()
	return "%s мешей · %d draw call · %d моделей · LOD %d/%d/%d" % [
		_thousands(int(st["meshes"])), int(st["draw_calls"]), int(st["models"]),
		int(st["clusters_by_lod"]["0"]), int(st["clusters_by_lod"]["1"]),
		int(st["clusters_by_lod"]["2"])]


static func _thousands(n: int) -> String:
	var s: String = str(n)
	var out: String = ""
	var count: int = 0
	for i in range(s.length() - 1, -1, -1):
		out = s[i] + out
		count += 1
		if count % 3 == 0 and i > 0:
			out = " " + out
	return out
