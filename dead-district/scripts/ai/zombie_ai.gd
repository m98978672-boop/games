class_name ZombieAI
extends RefCounted
## Конечный автомат (FSM) из 10 состояний для 5 типов зомби (walker, runner, crawler, brute, infected).
## Обоснование FSM vs Behavior Tree: переходы выполняются за O(1) без аллокаций дерева на кадр,
## что критично для одновременной симуляции 150 активных и >1000 фоновых (LOD) зомби на 60 FPS.

enum State {
	IDLE,
	WANDER,
	INVESTIGATE_NOISE,
	CHASE,
	ATTACK,
	CLIMB_WINDOW,
	BREAK_DOOR,
	STUNNED,
	CRAWLING,
	DEAD
}

static func state_name(s: int) -> String:
	match s:
		State.IDLE: return "IDLE"
		State.WANDER: return "WANDER"
		State.INVESTIGATE_NOISE: return "INVESTIGATE_NOISE"
		State.CHASE: return "CHASE"
		State.ATTACK: return "ATTACK"
		State.CLIMB_WINDOW: return "CLIMB_WINDOW"
		State.BREAK_DOOR: return "BREAK_DOOR"
		State.STUNNED: return "STUNNED"
		State.CRAWLING: return "CRAWLING"
		State.DEAD: return "DEAD"
	return "UNKNOWN"


static func create_zombie(id_num: int, ztype: String, pos: Vector2) -> Dictionary:
	var stats: Dictionary = DataDB.zombie_types.get(ztype, DataDB.zombie_types.get("walker", {}))
	var init_state := State.CRAWLING if ztype == "crawler" else State.IDLE
	return {
		"id": id_num,
		"type": ztype,
		"pos": pos,
		"dir": Vector2.DOWN,
		"hp": float(stats.get("hp", 100.0)),
		"max_hp": float(stats.get("hp", 100.0)),
		"speed": float(stats.get("speed", 2.35)),
		"damage": float(stats.get("damage", 16.0)),
		"vision_range": float(stats.get("vision_range", 14.0)),
		"door_damage": float(stats.get("door_damage", 14.0)),
		"infect_chance": float(stats.get("infect_chance", 0.12)),
		"bite_chance": float(stats.get("bite_chance", 0.28)),
		"state": init_state,
		"lod": "DORMANT",
		"target_pos": pos,
		"timer": 0.0,
		"attack_cd": 0.0,
		"crippled": (ztype == "crawler")
	}


static func transition(z: Dictionary, new_state: int) -> void:
	if new_state < State.IDLE or new_state > State.DEAD:
		ErrorManager.error("E403", "ZombieAI", "Некорректный переход FSM зомби", {"id": z["id"], "state": new_state})
		z["state"] = State.IDLE
		return
	z["state"] = new_state


static func apply_damage(z: Dictionary, dmg: float, stun_chance: float, rng: RandomNumberGenerator) -> bool:
	if int(z["state"]) == State.DEAD:
		return false
	z["hp"] = maxf(0.0, float(z["hp"]) - dmg)
	if float(z["hp"]) <= 0.0:
		transition(z, State.DEAD)
		EventBus.zombie_killed.emit(String(z["type"]), z["pos"])
		return true
	if not bool(z["crippled"]) and float(z["hp"]) < float(z["max_hp"]) * 0.35 and rng.randf() < 0.35:
		z["crippled"] = true
		z["speed"] = float(z["speed"]) * 0.45
		transition(z, State.CRAWLING)
	elif rng.randf() < stun_chance:
		z["timer"] = 0.65
		transition(z, State.STUNNED)
	return false


static func hear_noise(z: Dictionary, noise_pos: Vector2, received_db: float) -> void:
	var st := int(z["state"])
	if st == State.DEAD or st == State.STUNNED or st == State.ATTACK:
		return
	if received_db >= 40.0:
		z["target_pos"] = noise_pos
		if st != State.CHASE and not bool(z["crippled"]):
			transition(z, State.INVESTIGATE_NOISE)


static func step_active(
	z: Dictionary,
	dt: float,
	player_pos: Vector2,
	player_visible: bool,
	flow_field: Dictionary,
	chunks: ChunkStreamer,
	rng: RandomNumberGenerator
) -> Dictionary:
	var st := int(z["state"])
	if st == State.DEAD:
		return {"attack": false}

	if float(z["attack_cd"]) > 0.0:
		z["attack_cd"] = maxf(0.0, float(z["attack_cd"]) - dt)

	var zpos: Vector2 = z["pos"]
	var dist_to_player := zpos.distance_to(player_pos)

	# 1. Временное оглушение
	if st == State.STUNNED:
		z["timer"] = float(z["timer"]) - dt
		if float(z["timer"]) <= 0.0:
			transition(z, State.CRAWLING if bool(z["crippled"]) else State.CHASE)
		return {"attack": false}

	# 2. Обнаружение игрока зрением/обонянием
	var vision := float(z["vision_range"])
	if (player_visible and dist_to_player <= vision) or dist_to_player <= 3.5:
		z["target_pos"] = player_pos
		if not bool(z["crippled"]) and st != State.CLIMB_WINDOW and st != State.BREAK_DOOR:
			transition(z, State.CHASE)
			st = State.CHASE

	# 3. Атака при сближении
	if dist_to_player <= 1.25:
		transition(z, State.ATTACK)
		if float(z["attack_cd"]) <= 0.0:
			z["attack_cd"] = 1.15
			return {
				"attack": true,
				"damage": float(z["damage"]),
				"bite_chance": float(z["bite_chance"]),
				"infect_chance": float(z["infect_chance"])
			}
		return {"attack": false}

	# 4. Действие по состояниям
	match st:
		State.IDLE:
			z["timer"] = float(z["timer"]) - dt
			if float(z["timer"]) <= 0.0:
				z["timer"] = rng.randf_range(2.0, 5.0)
				z["target_pos"] = zpos + Vector2(rng.randf_range(-6.0, 6.0), rng.randf_range(-6.0, 6.0))
				transition(z, State.WANDER)
		State.WANDER, State.INVESTIGATE_NOISE:
			var spd := float(z["speed"]) * (0.55 if st == State.WANDER else 0.85)
			_steer_toward(z, z["target_pos"], spd, dt, chunks, false)
			if zpos.distance_to(z["target_pos"]) < 0.7:
				transition(z, State.IDLE)
				z["timer"] = rng.randf_range(1.0, 3.0)
		State.CHASE, State.CRAWLING, State.ATTACK:
			var tile := Vector2i(int(round(zpos.x)), int(round(zpos.y)))
			var flow_dir := Pathfinding.sample_flow(flow_field, tile)
			var move_target: Vector2 = zpos + flow_dir * 2.0 if flow_dir.length_squared() > 0.01 else player_pos
			var next_step := _steer_toward(z, move_target, float(z["speed"]), dt, chunks, true)
			if String(next_step) == "door":
				transition(z, State.BREAK_DOOR)
			elif String(next_step) == "window":
				transition(z, State.CLIMB_WINDOW)
				z["timer"] = 1.1
		State.BREAK_DOOR:
			var ahead := zpos + Vector2(z["dir"]).normalized() * 0.9
			var door_tile := Vector2i(int(round(ahead.x)), int(round(ahead.y)))
			if chunks.get_tile(door_tile) == ProcGen.TileType.DOOR and not bool(chunks.get_door(door_tile).get("open", false)):
				if float(z["attack_cd"]) <= 0.0:
					z["attack_cd"] = 0.9
					var broken := chunks.damage_door(door_tile, float(z["door_damage"]))
					if broken:
						transition(z, State.CHASE)
			else:
				transition(z, State.CHASE)
		State.CLIMB_WINDOW:
			z["timer"] = float(z["timer"]) - dt
			if float(z["timer"]) <= 0.0:
				z["pos"] = zpos + Vector2(z["dir"]).normalized() * 1.4
				transition(z, State.CRAWLING if bool(z["crippled"]) else State.CHASE)

	return {"attack": false}


static func step_dormant(z: Dictionary, dt: float, hot_noise_pos: Vector2, has_hot_noise: bool) -> void:
	## Сверхбыстрый LOD-тик для ~1000 фоновых зомби: простая векторная миграция к шуму.
	if int(z["state"]) == State.DEAD:
		return
	if has_hot_noise and z["pos"].distance_to(hot_noise_pos) < 85.0:
		var dir: Vector2 = (hot_noise_pos - Vector2(z["pos"])).normalized()
		z["pos"] = Vector2(z["pos"]) + dir * float(z["speed"]) * 0.4 * dt


static func _steer_toward(z: Dictionary, target: Vector2, speed: float, dt: float, chunks: ChunkStreamer, check_obstacles: bool) -> String:
	var zpos: Vector2 = z["pos"]
	var delta := target - zpos
	if delta.length_squared() < 0.001:
		return "ok"
	var dir := delta.normalized()
	z["dir"] = dir
	var next_pos := zpos + dir * speed * dt
	var nt := Vector2i(int(round(next_pos.x)), int(round(next_pos.y)))
	if chunks.is_walkable(nt):
		z["pos"] = next_pos
		return "ok"
	if check_obstacles:
		var tt := chunks.get_tile(nt)
		if tt == ProcGen.TileType.DOOR:
			return "door"
		if tt == ProcGen.TileType.WINDOW and not bool(z["crippled"]):
			return "window"
	# Скольжение вдоль стены по одной оси
	var nx := Vector2(next_pos.x, zpos.y)
	if chunks.is_walkable(Vector2i(int(round(nx.x)), int(round(nx.y)))):
		z["pos"] = nx
	else:
		var ny := Vector2(zpos.x, next_pos.y)
		if chunks.is_walkable(Vector2i(int(round(ny.x)), int(round(ny.y)))):
			z["pos"] = ny
	return "blocked"
