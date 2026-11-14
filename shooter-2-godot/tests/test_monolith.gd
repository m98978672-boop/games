extends SceneTree
## Проверка 10 000 монолитов и поля из миллиона мешей.
##
## Запуск (нужен Godot 4):
##   godot --headless --path shooter-2-godot --script tests/test_monolith.gd
##
## Без Godot этот же контракт проверяет node shooter-2-godot/tests/port.mjs.

var fails: int = 0
var checks: int = 0


func ok(cond: bool, label: String) -> void:
	checks += 1
	if cond:
		print("  ok   ", label)
	else:
		fails += 1
		print("  FAIL ", label)


func eq(a, b, label: String) -> void:
	ok(a == b, "%s (%s == %s)" % [label, str(a), str(b)])


func _initialize() -> void:
	print("=== СЕКТОР «ПЕПЕЛ» · монолиты и поле мешей ===")
	_test_catalog()
	_test_geometry()
	_test_field()
	print("--- проверок: %d, провалов: %d ---" % [checks, fails])
	quit(1 if fails > 0 else 0)


## 10 семейств × 10 архетипов × 10 вариантов × 10 отделок = 10 000 моделей
func _test_catalog() -> void:
	print("[каталог]")
	eq(SH2Monolith.COUNT, 10000, "10 000 моделей")
	eq(SH2Monolith.FAMILIES.size(), 10, "10 семейств")
	var ids := {}
	var empty := 0
	for i in 200:
		var d := SH2Monolith.describe(i * 47)
		ids[d["id"]] = true
		if str(d["title"]).is_empty():
			empty += 1
	eq(empty, 0, "у каждой модели есть название")
	eq(ids.size(), 200, "id не повторяются")
	var first := SH2Monolith.describe(0)
	var last := SH2Monolith.describe(SH2Monolith.COUNT - 1)
	ok(first["family"] == "block", "первая модель — блок")
	ok(last["family"] == "cassette", "последняя — кассета")
	ok(SH2Monolith.describe(15000)["index"] == SH2Monolith.COUNT - 1, "индекс зажимается")


## Ни одной «коробки»: у каждой модели есть либо прорези, либо выемки
func _test_geometry() -> void:
	print("[геометрия]")
	var with_openings := 0
	var with_recesses := 0
	var nanos := 0
	var min_tris := 1 << 30
	var max_tris := 0
	var sample := 240
	for i in sample:
		var made := SH2Monolith.build(i * 37)
		var t: int = int(made["tris"])
		min_tris = mini(min_tris, t)
		max_tris = maxi(max_tris, t)
		if int(made["openings"]) > 0:
			with_openings += 1
		if int(made["recesses"]) > 0:
			with_recesses += 1
		var arrays: Array = made["mesh"].surface_get_arrays(0)
		for v in (arrays[Mesh.ARRAY_VERTEX] as PackedVector3Array):
			if not is_finite(v.x) or not is_finite(v.y) or not is_finite(v.z):
				nanos += 1
				break
	eq(nanos, 0, "нет NaN в вершинах")
	ok(min_tris >= 24, "минимальная модель не «кубик» (%d треуг.)" % min_tris)
	ok(max_tris <= 20000, "максимальная модель укладывается в бюджет (%d треуг.)" % max_tris)
	ok(with_openings >= sample / 2, "у большинства моделей есть сквозные прорези")
	ok(with_recesses >= sample / 5, "у части моделей есть выемки с дном")

	# декомпозиция грани: площадь свободных участков строго меньше площади панели
	var holes: Array = [Rect2(0.2, 0.2, 0.2, 0.6), Rect2(0.6, 0.4, 0.2, 0.2)]
	var free: Array = SH2Monolith.decompose(1.0, 1.0, holes)
	var area := 0.0
	for r in free:
		area += r.size.x * r.size.y
	ok(absf(area - (1.0 - 0.2 * 0.6 - 0.2 * 0.2)) < 0.0001,
		"вычитание прорезей сохраняет площадь (%.4f)" % area)
	var overlap := false
	for a in free.size():
		for b in free.size():
			if a < b and (free[a] as Rect2).intersects(free[b] as Rect2):
				overlap = true
	ok(not overlap, "свободные участки не пересекаются")


## Поле мешей: больше миллиона экземпляров, немного draw call
func _test_field() -> void:
	print("[поле мешей]")
	var field := SH2MeshField.new(20261107, "high")
	var st: Dictionary = field.stats()
	ok(int(st["requested"]) >= 1000000, "запрошено больше миллиона мешей")
	ok(int(st["meshes"]) >= 1000000, "в поле не меньше миллиона мешей (%d)" % int(st["meshes"]))
	ok(int(st["draw_calls"]) <= 64, "draw call поля: %d" % int(st["draw_calls"]))
	ok(int(st["models"]) == 10000, "поле собрано из 10 000 моделей")
	eq(int(st["models_used"]), 10000, "каждая из 10 000 моделей стоит в мире")
	# меш — не счётчик: у него есть трансформация и его можно спрятать
	var m: Transform3D = field.matrix_at(int(st["meshes"]) - 1)
	ok(is_finite(m.origin.x) and is_finite(m.origin.z), "матрица миллионного меша")
	ok(Vector2(m.origin.x, m.origin.z).length() > 16.0, "поле стоит вне игровой зоны")
	eq(field.hide_mesh(int(st["meshes"]) - 1), true, "меш найден и спрятан")
	eq(field.hide_mesh(int(st["meshes"]) + 10), false, "несуществующий меш не прячется")
	ok(field.for_each_in_radius(0.0, 0.0, 210.0) > 1000, "в радиусе 210 м тысячи мешей")
	field.queue_free()
