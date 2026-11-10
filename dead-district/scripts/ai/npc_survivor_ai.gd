class_name NpcSurvivorAI
extends RefCounted
## Utility AI для NPC-выживших (6 архетипов из data/npcs.json).
## Обоснование Utility AI vs GOAP: выживший непрерывно взвешивает конкурирующие потребности
## (безопасность, еда/вода, укрытие, бой, лут, торговля) через кривые полезности [0..1] без жёсткого планирования.

const ACTIONS: Array[String] = [
	"FLEE_DANGER",
	"SEEK_FOOD_WATER",
	"COMBAT_THREAT",
	"TRADE_WITH_PLAYER",
	"SEEK_SHELTER",
	"LOOT_BUILDING",
	"IDLE_PATROL"
]


static func create_npc(id_num: int, archetype: Dictionary, pos: Vector2) -> Dictionary:
	return {
		"id": "npc_%d_%s" % [id_num, String(archetype.get("id", "scavenger"))],
		"archetype": String(archetype.get("id", "scavenger")),
		"name": String(archetype.get("name", "Выживший")),
		"pos": pos,
		"hp": 100.0,
		"hunger": 72.0,
		"thirst": 70.0,
		"hostility": float(archetype.get("hostility", 0.15)),
		"bravery": float(archetype.get("bravery", 0.55)),
		"action": "IDLE_PATROL",
		"trade_pool": archetype.get("trade_pool", ["canned_beans", "bandage"]).duplicate(),
		"dialogues": archetype.get("dialogues", {}),
		"target_pos": pos,
		"cooldown": 0.0
	}


static func evaluate_utilities(npc: Dictionary, nearby_zombies: int, nearest_zombie_dist: float, player_dist: float, is_night: bool) -> String:
	var hp := float(npc["hp"])
	var bravery := float(npc["bravery"])
	var hostility := float(npc["hostility"])
	var hunger := float(npc["hunger"])
	var thirst := float(npc["thirst"])

	var threat_factor := clampf(float(nearby_zombies) * 0.25 + (1.0 - clampf(nearest_zombie_dist / 14.0, 0.0, 1.0)) * 0.6, 0.0, 1.0)

	var scores := {
		"FLEE_DANGER": clampf(threat_factor * (1.15 - bravery) + ((100.0 - hp) / 100.0) * 0.65, 0.0, 1.0),
		"COMBAT_THREAT": clampf(threat_factor * bravery * (hp / 100.0) + (hostility * 0.6 if player_dist < 10.0 else 0.0), 0.0, 1.0),
		"SEEK_FOOD_WATER": clampf(maxf((60.0 - hunger) / 60.0, (60.0 - thirst) / 60.0), 0.0, 1.0),
		"TRADE_WITH_PLAYER": (0.72 if (hostility < 0.45 and player_dist <= 4.5 and nearby_zombies == 0) else 0.0),
		"SEEK_SHELTER": (0.58 if (is_night and nearby_zombies == 0) else 0.15),
		"LOOT_BUILDING": (0.42 if nearby_zombies == 0 else 0.05),
		"IDLE_PATROL": 0.2
	}

	var best_action := "IDLE_PATROL"
	var best_score := -1.0
	for act in ACTIONS:
		var s := float(scores.get(act, 0.0))
		if is_nan(s):
			ErrorManager.error("E406", "NpcSurvivorAI", "NaN в Utility AI", {"npc": npc["id"], "act": act})
			return "IDLE_PATROL"
		if s > best_score:
			best_score = s
			best_action = act
	npc["action"] = best_action
	return best_action


static func step_npc(
	npc: Dictionary,
	dt: float,
	player_pos: Vector2,
	nearest_zombie: Dictionary,
	nearby_zombies: int,
	is_night: bool,
	chunks: ChunkStreamer,
	rng: RandomNumberGenerator
) -> Dictionary:
	if float(npc["hp"]) <= 0.0:
		return {"alive": false}

	npc["hunger"] = maxf(0.0, float(npc["hunger"]) - 0.08 * dt)
	npc["thirst"] = maxf(0.0, float(npc["thirst"]) - 0.10 * dt)
	if float(npc["cooldown"]) > 0.0:
		npc["cooldown"] = maxf(0.0, float(npc["cooldown"]) - dt)

	var npos: Vector2 = npc["pos"]
	var zdist := 999.0 if nearest_zombie.is_empty() else npos.distance_to(nearest_zombie["pos"])
	var pdist := npos.distance_to(player_pos)
	var act := evaluate_utilities(npc, nearby_zombies, zdist, pdist, is_night)

	var move_dir := Vector2.ZERO
	var spd := 3.6
	var attacked_player := false

	match act:
		"FLEE_DANGER":
			var away_from: Vector2 = nearest_zombie["pos"] if not nearest_zombie.is_empty() else player_pos
			move_dir = (npos - away_from).normalized()
			spd = 5.2
		"COMBAT_THREAT":
			if float(npc["hostility"]) >= 0.7 and pdist < 10.0:
				move_dir = (player_pos - npos).normalized()
				if pdist <= 8.0 and float(npc["cooldown"]) <= 0.0:
					npc["cooldown"] = 1.4
					attacked_player = true
			elif not nearest_zombie.is_empty():
				if zdist > 2.0:
					move_dir = (Vector2(nearest_zombie["pos"]) - npos).normalized()
				elif float(npc["cooldown"]) <= 0.0:
					npc["cooldown"] = 0.85
					ZombieAI.apply_damage(nearest_zombie, 28.0, 0.35, rng)
		"SEEK_FOOD_WATER":
			npc["hunger"] = minf(100.0, float(npc["hunger"]) + 20.0)
			npc["thirst"] = minf(100.0, float(npc["thirst"]) + 20.0)
		"TRADE_WITH_PLAYER":
			move_dir = Vector2.ZERO
		"LOOT_BUILDING", "SEEK_SHELTER", "IDLE_PATROL":
			if npos.distance_to(npc["target_pos"]) < 1.0 or rng.randf() < 0.02:
				npc["target_pos"] = npos + Vector2(rng.randf_range(-10.0, 10.0), rng.randf_range(-10.0, 10.0))
			move_dir = (Vector2(npc["target_pos"]) - npos).normalized()
			spd = 2.6

	if move_dir.length_squared() > 0.01:
		var cand := npos + move_dir * spd * dt
		if chunks.is_walkable(Vector2i(int(round(cand.x)), int(round(cand.y)))):
			npc["pos"] = cand

	return {"alive": true, "attacked_player": attacked_player, "action": act}


static func interact_dialogue(npc: Dictionary) -> Dictionary:
	var host := float(npc.get("hostility", 0.0))
	var dmap: Dictionary = npc.get("dialogues", {})
	var line := String(dmap.get("greet", "Держись подальше от заражённых."))
	if String(npc.get("action", "")) == "FLEE_DANGER":
		line = String(dmap.get("flee", "Отступаем!"))
	elif host < 0.45 and dmap.has("trade"):
		line = "%s\n%s" % [line, String(dmap["trade"])]
	return {
		"npc_id": npc["id"],
		"name": npc["name"],
		"text": line,
		"can_trade": host < 0.45
	}


static func trade_item(npc: Dictionary, give_item_id: String, want_item_id: String, inv: InventorySystem) -> bool:
	var pool: Array = npc.get("trade_pool", [])
	if pool.is_empty():
		ErrorManager.info("E407", "NpcSurvivorAI", "У NPC закончился товар", {"npc": npc["id"]})
		return false
	if not pool.has(want_item_id):
		return false
	if inv.count_item(give_item_id) <= 0:
		return false
	if inv.remove_item(give_item_id, 1):
		return inv.add_item(want_item_id, 1)
	return false
