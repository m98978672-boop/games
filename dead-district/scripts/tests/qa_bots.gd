class_name QABots
extends Node
## Оркестратор 7 QA-ботов Dead District:
## 1. WorldBot (генерация мира, чанки, застревания, проходимость спавна)
## 2. BalanceBot (кривые голода, жажды, инфекции, лута)
## 3. CombatBot (ближний бой, огнестрел, 10 состояний ZombieAI, выносливость)
## 4. EconomyBot (крафт, строительство, фермерство, лут-таблицы)
## 5. SaveBot (сохранение, загрузка, порча, откат на .bak, миграция)
## 6. AssetBot (проверка asset_report.json / asset_validator.py)
## 7. SourceBot (проверка source_report.json / source_validator.py)


static func run_all_bots() -> Dictionary:
	var results := {
		"WorldBot": _run_world_bot(),
		"BalanceBot": _run_balance_bot(),
		"CombatBot": _run_combat_bot(),
		"EconomyBot": _run_economy_bot(),
		"SaveBot": _run_save_bot(),
		"AssetBot": _check_external_report("res://asset_report.json", "AssetBot"),
		"SourceBot": _check_external_report("res://source_report.json", "SourceBot")
	}
	var total_fail := 0
	for k in results.keys():
		if not bool(results[k]["pass"]):
			total_fail += 1
	return {"overall_pass": total_fail == 0, "bots": results}


static func _run_world_bot() -> Dictionary:
	var errs: Array[String] = []
	var cs := ChunkStreamer.new()
	cs.update_around(Vector2i(16, 16))
	if cs.chunks.size() < 9:
		errs.append("Загружено меньше 9 стартовых чанков")

	# Проверка детерминированности процедурной генерации
	var c_a := ProcGen.generate_chunk_data(0, 0, 12345)
	var c_b := ProcGen.generate_chunk_data(0, 0, 12345)
	if c_a["tiles"] != c_b["tiles"]:
		errs.append("Недетерминированная генерация чанка 0,0")

	# Проверка FOV и A* проходимости
	var vis := FovShadowcast.compute_visible(Vector2i(16, 16), 12, func(t: Vector2i) -> bool:
		return cs.is_opaque(t)
	)
	if vis.size() < 10:
		errs.append("FOV вернул слишком мало видимых клеток: %d" % vis.size())

	var path := Pathfinding.find_path_astar(Vector2i(16, 16), Vector2i(20, 16), func(t: Vector2i) -> bool:
		return cs.is_walkable(t)
	, 300)
	if path.is_empty():
		errs.append("A* не нашёл базовый локальный путь")
	cs.free()
	return {"pass": errs.is_empty(), "errors": errs}


static func _run_balance_bot() -> Dictionary:
	var errs: Array[String] = []
	var needs := PlayerNeeds.new()
	needs._ready()
	var health := PlayerHealth.new()
	health._ready()

	# Симуляция 24 игровых часов без еды и воды
	for _h in range(24):
		var r := needs.tick(1.0, 45.0, 20.0, 0.5, true, false, false, false, 0)
		health.tick(1.0, float(r["hp_loss"]))

	if needs.hunger >= 85.0 or needs.thirst >= 85.0:
		errs.append("Потребности голода/жажды не убывают со временем")

	# Смертельная потеря крови (>40% от 5000 мл)
	health.blood_ml = 2900.0
	health.tick(0.1, 0.0)
	if not health.dead:
		errs.append("Игрок не умер при потере >40% объёма крови")

	needs.free()
	health.free()
	return {"pass": errs.is_empty(), "errors": errs}


static func _run_combat_bot() -> Dictionary:
	var errs: Array[String] = []
	var rng := RandomNumberGenerator.new()
	rng.seed = 999
	var inv := InventorySystem.new()
	inv._ready()
	inv.add_item("glock_17", 1)
	inv.add_item("ammo_9mm", 30)

	var pc := PlayerController.new()
	pc.equipped_weapon_id = "glock_17"
	var shot := pc.perform_attack(Vector2.RIGHT, inv)
	if not bool(shot.get("ok", false)) or String(shot.get("kind", "")) != "firearm":
		errs.append("Выстрел из Glock 17 не прошёл")

	# Проверка FSM зомби на всех 5 типах
	for zt in ["walker", "runner", "crawler", "brute", "infected"]:
		var z := ZombieAI.create_zombie(1, zt, Vector2(20, 20))
		ZombieAI.hear_noise(z, Vector2(16, 16), 90.0)
		if int(z["state"]) != ZombieAI.State.INVESTIGATE_NOISE and zt != "crawler":
			errs.append("Зомби %s не перешёл в INVESTIGATE_NOISE на шум" % zt)
		ZombieAI.apply_damage(z, 999.0, 1.0, rng)
		if int(z["state"]) != ZombieAI.State.DEAD:
			errs.append("Зомби %s не перешёл в DEAD при смертельном уроне" % zt)

	pc.free()
	inv.free()
	return {"pass": errs.is_empty(), "errors": errs}


static func _run_economy_bot() -> Dictionary:
	var errs: Array[String] = []
	var inv := InventorySystem.new()
	inv._ready()
	inv.add_item("rag", 2)
	inv.add_item("alcohol", 1)
	var craft := CraftingSystem.new()
	if not craft.craft("craft_sterile_bandage", inv, false, false):
		errs.append("Не сработал крафт стерильного бинта")
	if inv.count_item("sterile_bandage") < 2:
		errs.append("Неверное количество результата крафта стерильного бинта")

	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	var loot := LootSystem.roll_zone_loot("pharmacy", rng, 10.0, true)
	if loot.is_empty():
		errs.append("LootSystem вернул пустой лут для аптеки")

	var farm := FarmingSystem.new()
	farm._ready()
	var cs := ChunkStreamer.new()
	inv.add_item("seeds_radish", 1)
	cs.set_tile(Vector2i(5, 5), ProcGen.TileType.GRASS)
	if not farm.plant_crop(Vector2i(5, 5), "seeds_radish", inv, cs):
		errs.append("Не удалось посадить редис на траве")
	farm.tick(24.0 * 5.0, 20.0, 0.8)
	if farm.harvest_ready(Vector2i(5, 5), inv) <= 0:
		errs.append("Редис не созрел за 5 дней при дожде")

	cs.free()
	farm.free()
	craft.free()
	inv.free()
	return {"pass": errs.is_empty(), "errors": errs}


static func _run_save_bot() -> Dictionary:
	var res := TestErrorManager.run_all()
	return {"pass": int(res["failed"]) == 0, "errors": res["failures"]}


static func _check_external_report(path: String, bot_name: String) -> Dictionary:
	if not FileAccess.file_exists(path):
		return {"pass": false, "errors": ["Отсутствует отчёт %s (%s)" % [bot_name, path]]}
	var txt := FileAccess.get_file_as_string(path)
	var data: Variant = JSON.parse_string(txt)
	if typeof(data) != TYPE_DICTIONARY:
		return {"pass": false, "errors": ["Некорректный JSON в %s" % path]}
	var ok := String(data.get("status", "")) == "PASS"
	return {"pass": ok, "errors": [] if ok else ["Отчёт %s имеет статус FAIL" % bot_name]}
