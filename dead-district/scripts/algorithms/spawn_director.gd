class_name SpawnDirector
extends RefCounted
## Spawn Director + AI LOD менеджер:
## - держит >= 1000 зомби в симуляции мира (виртуальные + активные)
## - строго ограничивает <= 150 одновременно активных физических зомби в радиусе активного окна
## - мигрирует спящие орды к горячим точкам шума

const MAX_WORLD_ZOMBIES: int = 1200
const MAX_ACTIVE_ZOMBIES: int = 150
const ACTIVE_RADIUS_TILES: float = 42.0
const SPAWN_MIN_DIST_TILES: float = 16.0


static func pick_zombie_type(district: String, day: int, rng: RandomNumberGenerator) -> String:
	var roll := rng.randf()
	var infected_bonus := minf(0.18, float(day) * 0.01)
	if district == "hospital":
		if roll < 0.35:
			return "infected"
		if roll < 0.65:
			return "walker"
		if roll < 0.85:
			return "crawler"
		return "runner"
	if district == "police" or district == "warehouse":
		if roll < 0.22:
			return "brute"
		if roll < 0.45:
			return "runner"
		return "walker"
	if roll < 0.08 + infected_bonus:
		return "infected"
	if roll < 0.22:
		return "runner"
	if roll < 0.32:
		return "crawler"
	if roll < 0.38:
		return "brute"
	return "walker"


static func assign_lod_tiers(zombies: Array[Dictionary], player_pos: Vector2) -> Dictionary:
	## Сортирует зомби по расстоянию и распределяет в ACTIVE (<= 150) и DORMANT.
	var candidates: Array = []
	for i in range(zombies.size()):
		var z: Dictionary = zombies[i]
		if String(z.get("state", "")) == "DEAD":
			z["lod"] = "DEAD"
			continue
		var d2 := player_pos.distance_squared_to(z["pos"])
		candidates.append([d2, i])

	candidates.sort_custom(func(a, b): return float(a[0]) < float(b[0]))

	var active_count := 0
	var dormant_count := 0
	var active_r2 := ACTIVE_RADIUS_TILES * ACTIVE_RADIUS_TILES
	for item in candidates:
		var idx: int = int(item[1])
		var d2: float = float(item[0])
		if active_count < MAX_ACTIVE_ZOMBIES and d2 <= active_r2:
			zombies[idx]["lod"] = "ACTIVE"
			active_count += 1
		else:
			zombies[idx]["lod"] = "DORMANT"
			dormant_count += 1

	if active_count >= MAX_ACTIVE_ZOMBIES:
		ErrorManager.info("E405", "SpawnDirector", "Достигнут лимит активных ИИ (150), остальные в LOD DORMANT", {"dormant": dormant_count})

	return {"active": active_count, "dormant": dormant_count}


static func find_safe_spawn_tile(player_pos: Vector2, district: String, is_walkable: Callable, visible_tiles: Dictionary, rng: RandomNumberGenerator) -> Vector2i:
	for _attempt in range(24):
		var angle := rng.randf_range(0.0, TAU)
		var dist := rng.randf_range(SPAWN_MIN_DIST_TILES, ACTIVE_RADIUS_TILES - 2.0)
		var tx := int(round(player_pos.x + cos(angle) * dist))
		var ty := int(round(player_pos.y + sin(angle) * dist))
		var t := Vector2i(tx, ty)
		if visible_tiles.has(t):
			continue
		if is_walkable.call(t):
			return t
	ErrorManager.info("E408", "SpawnDirector", "Не найдена точка спавна вне поля зрения", {"district": district})
	return Vector2i(-999999, -999999)
