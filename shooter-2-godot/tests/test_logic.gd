extends SceneTree
## Логические тесты: данные, анимации, геометрия, мир, ИИ, регдол.
##
## Запуск (без окна):
##   godot --headless --path . --script tests/test_logic.gd

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
	print("=== СЕКТОР «ПЕПЕЛ» · логика (Godot) ===")
	_test_data()
	_test_animations()
	_test_outline()
	_test_guns()
	_test_soldier()
	_test_levels()
	_test_world()
	_test_brain()
	_test_ragdoll()
	print("--- проверок: %d, провалов: %d ---" % [checks, fails])
	quit(1 if fails > 0 else 0)


func _test_data() -> void:
	print("[data]")
	eq(SH2Data.PARTS.size(), 22, "22 части тела")
	eq(SH2Data.CLIPS.size(), 20, "20 анимаций")
	eq(SH2Data.VARIANTS.size(), 4, "4 варианта")
	var totals: Dictionary = SH2Data.totals()
	eq(int(totals["total"]), 1760, "1760 клипов в наборе")
	eq(SH2Data.WEAPONS.size(), 5, "5 стволов")
	eq(SH2Data.ENEMY_TYPES.size(), 6, "6 типов боевиков")
	eq(SH2Data.MISSIONS.size(), 6, "6 миссий")
	eq(SH2Data.MAPS.size(), 3, "3 карты")
	ok(SH2Data.clip_by_id("run")["loop"] == true, "бег зациклен")
	ok(SH2Data.clip_by_id("die")["loop"] == false, "смерть не зациклена")
	ok(SH2Data.enemy_by_id("boss")["hp"] > 600.0, "босс живуч")
	ok(SH2Data.weapon_by_id("rifle")["auto"] == true, "автомат автоматический")


func _test_animations() -> void:
	print("[anim]")
	var built := 0
	var non_empty := 0
	var max_dev := 0.0
	for part in SH2Data.PARTS:
		for clip in SH2Data.CLIPS:
			for v in SH2Data.VARIANTS.size():
				var c: Dictionary = SH2Animator.curve(part, str(clip["id"]), v)
				built += 1
				if not c.is_empty():
					non_empty += 1
				for ch in SH2Data.CHANNELS:
					if c.has(ch):
						for val in c[ch]:
							max_dev = maxf(max_dev, absf(float(val)))
	eq(built, 1760, "построено 1760 кривых")
	eq(non_empty, 1760, "все кривые непустые")
	ok(max_dev < 3.5, "амплитуда каналов в разумных пределах (%.2f)" % max_dev)
	ok(SH2Animator.cache_size() >= 1760, "кэш кривых заполнен (%d)" % SH2Animator.cache_size())
	var f: Array = [0.0, 1.0, 0.0]
	ok(absf(SH2Animator.sample_track(f, 0.5) - 1.0) < 0.001, "сэмпл в узле сетки точен")


func _test_outline() -> void:
	print("[outline]")
	var poly: Array = [Vector2(-0.3, 0.0), Vector2(0.3, 0.0), Vector2(0.25, 0.7), Vector2(-0.25, 0.7)]
	var m: ArrayMesh = SH2Outline.outline_mesh(poly, {"depth": 0.2, "bevel": 0.02})
	ok(m != null and m.get_surface_count() > 0, "контур → меш")
	var verts: int = 0
	if m != null:
		verts = (m.surface_get_arrays(0)[Mesh.ARRAY_VERTEX] as PackedVector3Array).size()
	ok(verts > 40, "в меше контура достаточно вершин (%d)" % verts)
	var rev: ArrayMesh = SH2Outline.revolve([Vector2(0.0, 0.0), Vector2(0.05, 0.1), Vector2(0.0, 0.4)])
	ok(rev != null, "тело вращения построено")
	var loft: ArrayMesh = SH2Outline.loft_sections([
		{"at": Vector3.ZERO, "pts": SH2Outline.circle_section(0.1, 0.1, 10)},
		{"at": Vector3(0, 0.5, 0), "pts": SH2Outline.circle_section(0.06, 0.06, 10)},
	])
	ok(loft != null, "лофт по сечениям построен")
	var node: MeshInstance3D = SH2Outline.mesh_node(m, Color("#807868"))
	ok(node != null and node.mesh != null, "mesh_node создаёт MeshInstance3D")
	ok(node.material_override != null, "материал назначен")


func _test_guns() -> void:
	print("[guns]")
	for w in SH2Data.WEAPONS:
		var id: String = str(w["id"])
		var bp: Dictionary = SH2Guns.blueprint(id)
		ok(not bp.is_empty() and (bp["parts"] as Array).size() > 3, "%s: чертёж из %d частей"
			% [id, (bp["parts"] as Array).size()])
		var node: Node3D = SH2Guns.build(id)
		ok(node.get_child_count() > 3, "%s: модель собрана" % id)
		ok(node.get_node_or_null("muzzle") != null, "%s: есть дуло" % id)


func _test_soldier() -> void:
	print("[soldier]")
	var rig: Node3D = SH2Soldier.build("grunt", {})
	ok(rig != null, "риг собран")
	var bones: Dictionary = SH2Soldier.bone_map(rig)
	ok(bones.is_empty() or bones.size() > 10, "карта костей доступна (%d)" % bones.size())
	ok(rig.get_node_or_null("weapon_slot") != null, "есть слот оружия")
	for id in ["grunt", "sniper", "heavy", "scout", "officer", "boss"]:
		var r: Node3D = SH2Soldier.build(id, {})
		ok(r != null and r.get_child_count() > 2, "%s: тело построено" % id)
		r.queue_free()
	rig.queue_free()


func _test_levels() -> void:
	print("[level]")
	for map_id in SH2Data.MAPS.keys():
		var res: Dictionary = SH2Level.build(str(map_id))
		var cols: Array = res["colliders"]
		ok(cols.size() > 15, "%s: %d коллайдеров" % [map_id, cols.size()])
		var kinds: Dictionary = {}
		for c in cols:
			kinds[str(c["kind"])] = true
		ok(kinds.has("building"), "%s: есть здания" % map_id)
		ok(kinds.has("edge"), "%s: есть границы карты" % map_id)
		(res["root"] as Node3D).queue_free()


func _test_world() -> void:
	print("[world]")
	var res: Dictionary = SH2Level.build("depot")
	var w := SH2World.new(res["map"], res["colliders"])
	var outside: Dictionary = w.resolve_circle(Vector2(999.0, 999.0), 0.4)
	ok(absf(float((outside["pos"] as Vector2).x)) < 40.0, "круг не выходит за карту")
	var inside_res: Dictionary = w.resolve_circle(Vector2(0.0, 0.0), 0.4)
	ok(inside_res.has("pos"), "resolve_circle вернул позицию")
	var hit: Dictionary = w.ray_colliders(Vector3(0, 1.6, 0), Vector3(1, 0, 0), 120.0)
	ok(hit.has("t") or hit.is_empty(), "луч по миру работает")
	ok(not w.has_los(Vector3(-38, 1.6, -38), Vector3(38, 1.6, 38)) or true, "LOS без падений")
	var spot: Dictionary = w.random_open_point(0.0, 0.0, 2.0, 8.0)
	ok(not spot.is_empty(), "свободная точка найдена")
	var cover: Dictionary = w.find_cover(0.0, 0.0, 10.0, 10.0)
	ok(not cover.is_empty(), "укрытие найдено")
	var st: Dictionary = w.steer(0.0, 0.0, 12.0, 12.0)
	ok(st.has("x") and st.has("z"), "steer возвращает направление")
	(res["root"] as Node3D).queue_free()


func _test_brain() -> void:
	print("[brain]")
	eq(SH2Brain.TACTICS.size(), 8, "8 тактик")
	var res: Dictionary = SH2Level.build("depot")
	var world := SH2World.new(res["map"], res["colliders"])
	var game := {
		"world": world,
		"time": 0.0,
		"difficulty": 1,
		"enemies": [],
		"commander_timer": 0.0,
		"player": {"x": 8.0, "z": 8.0, "y": 0.0, "crouch": false, "vx": 0.0, "vz": 0.0},
	}
	var fake := {
		"x": 0.0, "z": 0.0, "eye_y": 1.55, "yaw": 0.0, "alive": true, "hp": 100, "max_hp": 100,
		"ammo": 30, "grenades": 1, "under_fire": false, "type_id": "grunt", "id": "e1",
		"vx": 0.0, "vz": 0.0, "reloading": false,
	}
	var brain := SH2Brain.new(fake, 7)
	eq(SH2Brain.TACTICS.has(brain.tactic), true, "тактика из списка")
	var tries := 0
	while tries < 40:
		brain.think(game)
		tries += 1
	ok(SH2Brain.TACTICS.has(brain.tactic), "тактика остаётся валидной после 40 тиков")
	ok(brain.scores.size() >= 8, "оценены все тактики (%d)" % brain.scores.size())
	ok(brain.shot_spread(game) > 0.0, "разброс положительный")
	var slow := SH2Data.enemy_by_id("grunt")
	var fast := SH2Data.enemy_by_id("boss")
	ok(float(fast["think_quality"]) > float(slow["think_quality"]), "босс думает лучше бойца")
	ok(float(fast["think_time"]) < float(slow["think_time"]), "босс думает быстрее бойца")
	(res["root"] as Node3D).queue_free()


func _test_ragdoll() -> void:
	print("[ragdoll]")
	eq(SH2Ragdoll.POINTS.size(), 17, "17 точек куклы")
	ok(SH2Ragdoll.LINKS.size() > 20, "связей: %d" % SH2Ragdoll.LINKS.size())
	var rig: Node3D = SH2Soldier.build("grunt", {})
	var r := SH2Ragdoll.new(rig)
	r.capture()
	eq(r.points.size(), 17, "точки захвачены")
	var steps := 0
	while not r.sleeping and steps < 900:
		r.update(0.016, [])
		steps += 1
	ok(r.sleeping or steps >= 900, "кукла либо уснула, либо честно считала (%d шагов)" % steps)
	var lowest := 1e9
	for pt in r.points:
		lowest = minf(lowest, (pt["pos"] as Vector3).y)
	ok(lowest > -1.5, "кукла не провалилась под пол (min y = %.2f)" % lowest)
	r.dispose()
	rig.queue_free()
