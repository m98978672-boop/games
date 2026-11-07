extends RefCounted
class_name SH2Brain
## СЕКТОР «ПЕПЕЛ» — ИИ боевиков: «больно думать» (порт).
##
## Боец думает не каждый кадр, а тиками (think_time + штраф за столько мыслей
## подряд). Каждый тик он оценивает advance / hold / cover / flank / suppress /
## retreat / grenade / melee — счёт складывается из дистанции, здоровья,
## укрытия, линии огня, приказов командира и качества мышления.
## Чем ниже think_quality, тем больше боец ошибается и позже реагирует.

const TACTICS: Array = ["advance", "hold", "cover", "flank", "suppress", "retreat", "grenade", "melee"]

var agent
var cfg: Dictionary
var rng := RandomNumberGenerator.new()
var state := "patrol"
var tactic := "hold"
var think_timer := 0.0
var think_count := 0.0
var alert := 0.0
var memory: Dictionary = {}
var reaction_left := 0.0
var aim_time := 0.0
var burst_left := 0
var burst_cool := 0.0
var cover_point: Dictionary = {}
var cover_timer := 0
var patrol_target: Dictionary = {}
var flank_side := 1
var flank_target: Dictionary = {}
var advance_target: Dictionary = {}
var last_seen := 0.0
var thought := ""
var thought_timer := 0.0
var order = null
var stuck := 0.0
var last_pos := Vector2.ZERO
var seen_now := false
var dist_to_player := 999.0
var pain := 0.0
var scores: Dictionary = {}
var retreating := 0.0
var melee_wish := 0.0
var pending_grenade := 0.0
var suppress_target: Dictionary = {}


func _init(agent_ref, seed_value: int = 1) -> void:
	agent = agent_ref
	cfg = SH2Data.enemy_by_id(agent.type_id)
	rng.seed = SH2Data.hash(agent.id + agent.type_id + "|" + str(seed_value))
	think_timer = rng.randf() * float(cfg["think_time"])
	flank_side = 1 if rng.randf() > 0.5 else -1
	last_pos = Vector2(agent.x, agent.z)


func _wrap(a: float) -> float:
	while a > PI:
		a -= TAU
	while a < -PI:
		a += TAU
	return a


## Восприятие: угол зрения, память, задержка реакции
func perceive(game, dt: float) -> void:
	if not agent.alive:
		return
	var p = game.player
	var dx: float = p.x - agent.x
	var dz: float = p.z - agent.z
	dist_to_player = sqrt(dx * dx + dz * dz)
	var can_see: bool = dist_to_player < 90.0 and game.world.has_los(
		Vector3(agent.x, agent.eye_y, agent.z), Vector3(p.x, p.y + 1.35, p.z))
	if can_see and p.crouch and dist_to_player > 40.0:
		can_see = false
	if can_see:
		var to_player: float = atan2(dx, dz)
		var facing: float = _wrap(agent.yaw)
		var in_fov: bool = absf(_wrap(to_player - facing)) < (2.5 if alert > 0.4 else 1.15)
		if in_fov or dist_to_player < 6.0:
			seen_now = true
			last_seen = game.time
			memory = {"x": p.x, "z": p.z, "t": game.time}
			alert = minf(1.0, alert + dt * (2.2 + float(cfg["think_quality"])))
			if reaction_left <= 0.0 and state != "combat":
				reaction_left = float(cfg["reaction"])
				agent.on_notice(game)
		else:
			seen_now = false
			alert = maxf(0.0, alert - dt * 0.5)
	else:
		seen_now = false
		alert = maxf(0.0, alert - dt * 0.35)
		if not memory.is_empty() and game.time - float(memory["t"]) > 8.0:
			memory = {}
	if reaction_left > 0.0:
		reaction_left -= dt


## Мышление: оценка тактик с «усталостью от мыслей» и ошибками
func think(game) -> void:
	var p = game.player
	var dist: float = dist_to_player
	think_count += 1.0
	var fatigue: float = 1.0 + minf(1.6, think_count * 0.05)
	var think_delay: float = float(cfg["think_time"]) * fatigue \
		* (0.75 + rng.randf() * 0.5 - game.difficulty * 0.08)
	think_timer = maxf(0.18, think_delay)

	var hp_frac: float = float(agent.hp) / float(agent.max_hp)
	if pain > 0.0:
		pain = maxf(0.0, pain - 0.08)
	# направленное укрытие: важно, чтобы стена была между бойцом и игроком,
	# а не просто «рядом стена»
	var near_cover: Dictionary = game.world.cover_spot(agent.x, agent.z, Vector2(p.x, p.z), 12.0, 1.7)
	if near_cover.is_empty():
		near_cover = game.world.find_cover(agent.x, agent.z, p.x, p.z, 12.0)
	var pref: Array = cfg["prefer_range"]
	var in_pref: bool = dist > float(pref[0]) and dist < float(pref[1])
	var too_close: bool = dist < float(pref[0]) * 0.7
	var too_far: bool = dist > float(pref[1]) * 1.25
	var aggression: float = float(cfg["aggression"])

	var sc := {}
	sc["advance"] = 0.35 + aggression * 0.9 + (0.7 if too_far else 0.0) \
		+ (0.3 if agent.ammo > 0 else -0.8) - (1.2 if hp_frac < 0.4 else 0.0) \
		- (0.15 if seen_now else -0.25)
	sc["hold"] = 0.4 + (1.0 if in_pref else 0.0) + (0.5 if seen_now else 0.0) \
		+ (1.0 - aggression) * 0.6 + (0.2 if hp_frac > 0.6 else -0.1)
	sc["cover"] = (0.9 if pain > 0.3 else 0.0) + (0.9 if not near_cover.is_empty() else -0.4) \
		+ (1.0 if hp_frac < 0.55 else 0.2) + (0.15 if seen_now else 0.6) \
		+ (1.1 if agent.under_fire else 0.0)
	sc["flank"] = 0.2 + aggression * 0.5 + (0.5 if in_pref else 0.0) \
		+ (0.25 if seen_now else 0.8) - (0.9 if hp_frac < 0.35 else 0.0)
	sc["suppress"] = (0.7 if seen_now else -0.3) + (0.5 if agent.ammo > 12 else -1.4) \
		+ (0.5 if dist > 12.0 else 0.0) + aggression * 0.3
	sc["retreat"] = (1.4 if pain > 0.6 and hp_frac < 0.7 else 0.0) \
		+ (2.2 if hp_frac < 0.35 else -1.3) + (0.9 if agent.ammo == 0 else 0.0) \
		+ (-0.2 if alert > 0.7 else 0.2)
	sc["grenade"] = (0.8 if dist > 9.0 and dist < 30.0 else -1.5) \
		+ (0.8 if agent.grenades > 0 else -3.0) + (-0.2 if seen_now else 0.9) \
		+ (0.7 if (cfg["tactics"] as Array).has("grenade") else 0.0)
	sc["melee"] = (2.0 if dist < 4.0 else -2.0) + aggression * 0.5 \
		+ (1.2 if agent.ammo == 0 else 0.0)

	# приказ командира
	if order != null and game.time - float(order["t"]) < 6.0:
		var ord_tactic: String = order["tactic"]
		sc[ord_tactic] = float(sc.get(ord_tactic, 0.0)) + 1.8

	# «качество мышления»: плохой мыслитель иногда выбирает случайную тактику
	if rng.randf() > float(cfg["think_quality"]):
		var opts: Array = cfg["tactics"]
		var pick: String = opts[rng.randi() % opts.size()]
		sc[pick] = float(sc.get(pick, 0.0)) + 0.6

	var best := "hold"
	var best_score := -1e9
	for t in TACTICS:
		var s: float = float(sc.get(t, -2.0))
		s += (rng.randf() - 0.5) * (1.0 - float(cfg["think_quality"])) * 0.9
		if s > best_score:
			best_score = s
			best = t
	tactic = best
	state = "combat" if (alert > 0.25 or seen_now) else ("search" if not memory.is_empty() else "patrol")
	scores = sc

	if best == "cover" or best == "hold":
		cover_timer -= 1
		if cover_point.is_empty() or cover_timer <= 0:
			cover_point = near_cover if not near_cover.is_empty() \
				else game.world.random_open_point(agent.x, agent.z, 3.0, 9.0, rng)
			cover_timer = 2 + rng.randi() % 3
	if best == "flank":
		flank_side = 1 if rng.randf() > 0.5 else -1
		var ang: float = atan2(p.z - agent.z, p.x - agent.x) + flank_side * (1.1 + rng.randf() * 0.5)
		var r: float = clampf(dist * (0.7 + rng.randf() * 0.5), 8.0, 34.0)
		var tx: float = p.x - cos(ang) * r
		var tz: float = p.z - sin(ang) * r
		var pt: Dictionary = game.world.random_open_point(tx, tz, 1.0, 7.0, rng)
		flank_target = pt if not pt.is_empty() else {"x": tx, "z": tz}
	if best == "retreat":
		cover_point = game.world.random_open_point(agent.x - (p.x - agent.x),
			agent.z - (p.z - agent.z), 4.0, 12.0, rng)
		retreating = 1.6
	else:
		retreating = 0.0
	if best == "advance":
		advance_target = game.world.random_open_point(p.x, p.z, 6.0, 14.0, rng)
	if best == "suppress":
		suppress_target = {"x": float(memory.get("x", p.x)), "z": float(memory.get("z", p.z))}

	if rng.randf() > 0.55:
		var thoughts: Array = SH2Data.THOUGHTS
		thought = thoughts[rng.randi() % thoughts.size()]
		thought_timer = 2.6
	think_count = maxf(0.0, think_count - 0.15)


func pick_target(game) -> Dictionary:
	var p = game.player
	if state == "combat":
		if tactic == "flank" and not flank_target.is_empty():
			return flank_target
		if (tactic == "cover" or tactic == "hold" or tactic == "retreat" or tactic == "suppress") \
				and not cover_point.is_empty():
			return cover_point
		if tactic == "advance":
			if advance_target.is_empty() or Vector2(advance_target["x"], advance_target["z"]).distance_to(
					Vector2(agent.x, agent.z)) < 2.0:
				advance_target = game.world.random_open_point(p.x, p.z, 5.0, 12.0, rng)
			return advance_target
		if tactic == "hold" or tactic == "melee":
			return {}
	if state == "search" and not memory.is_empty():
		return {"x": float(memory["x"]) + sin(game.time * 0.7 + rng.randf() * 6.0) * 3.0,
			"z": float(memory["z"]) + cos(game.time * 0.6 + rng.randf() * 6.0) * 3.0}
	if patrol_target.is_empty() or Vector2(patrol_target["x"], patrol_target["z"]).distance_to(
			Vector2(agent.x, agent.z)) < 1.5:
		patrol_target = game.world.random_open_point(agent.x, agent.z, 6.0, 20.0, rng)
	return patrol_target


## Промах не случайный: дистанция, бег, движение игрока, качество мысли
func shot_spread(game) -> float:
	var w: Dictionary = SH2Data.weapon_by_id(cfg["weapon"])
	var base: float = float(w["spread"])
	var dist_factor: float = 0.55 + dist_to_player / 26.0
	var move_factor: float = 1.0 + (Vector2(agent.vx, agent.vz).length()
		/ maxf(1.0, float(cfg["speed"]))) * 1.3
	var pmove: float = 1.0 + minf(1.6, Vector2(game.player.vx, game.player.vz).length() / 5.0)
	var skill: float = 1.0 / maxf(0.25, float(cfg["accuracy"]))
	var hurt: float = (1.0 - float(agent.hp) / float(agent.max_hp)) * 0.8 + pain * 0.9
	var alertness: float = 1.0 + (1.0 - alert) * 1.4
	return base * dist_factor * move_factor * pmove * skill * (1.0 + hurt) * alertness \
		* (0.6 + game.difficulty * 0.3)


func shot_pitch(game) -> float:
	var p = game.player
	var dy: float = (p.y + (0.95 if p.crouch else 1.3)) - agent.eye_y
	return atan2(dy, maxf(1.0, dist_to_player)) + (rng.randf() - 0.5) * 0.05


## Приказ от командира
func receive_order(ord_tactic: String, x: float, z: float, time: float) -> void:
	order = {"tactic": ord_tactic, "x": x, "z": z, "t": time}
	think_timer = minf(think_timer, 0.2)


## Один кадр: восприятие, мышление, движение, огонь
func update(game, dt: float) -> void:
	if not agent.alive:
		return
	perceive(game, dt)
	if thought_timer > 0.0:
		thought_timer -= dt
	think_timer -= dt
	if think_timer <= 0.0:
		think(game)

	var p = game.player
	var move := Vector2.ZERO
	var want_crouch := false
	var want_sprint := false
	var target: Dictionary = pick_target(game)
	if not target.is_empty():
		var w: Dictionary = game.world.steer(agent.x, agent.z, float(target["x"]), float(target["z"]), 0.42)
		var spd: float = float(cfg["sprint"]) * 0.72 if (state == "combat" and tactic == "advance") \
			else (float(cfg["speed"]) * 0.55 if state == "patrol" else float(cfg["speed"]))
		move = Vector2(float(w["x"]), float(w["z"])) * spd
		if bool(w.get("reached", false)):
			cover_point = {}
	if tactic == "retreat" or retreating > 0.0:
		want_sprint = true
		if retreating > 0.0:
			retreating -= dt
	if tactic == "cover" and not cover_point.is_empty() \
			and Vector2(cover_point["x"], cover_point["z"]).distance_to(Vector2(agent.x, agent.z)) < 1.2:
		want_crouch = true
	# за низким укрытием (мешки, камень) обязательно присесть, иначе его нет
	if tactic == "cover" and not cover_point.is_empty() and bool(cover_point.get("crouch", false)):
		want_crouch = true
	if tactic == "hold" and dist_to_player < 16.0 and dist_to_player > 5.0:
		want_crouch = true

	# стрельба — решение тоже принимается «с трудом»
	var can_shoot: bool = seen_now and reaction_left <= 0.0 and agent.ammo > 0 and not agent.reloading
	if can_shoot:
		aim_time += dt
		var want_burst: bool = tactic in ["suppress", "advance", "hold", "flank"]
		if burst_left > 0:
			if burst_cool <= 0.0:
				agent.try_shoot(game, shot_spread(game), shot_pitch(game))
				burst_left -= 1
				burst_cool = 60.0 / float(SH2Data.weapon_by_id(cfg["weapon"])["rpm"])
			else:
				burst_cool -= dt
		elif aim_time > 0.25:
			burst_left = (2 + rng.randi() % 4) if want_burst else 1
			aim_time = 0.0
	elif not seen_now:
		aim_time = 0.0
		if tactic == "suppress" and not memory.is_empty() \
				and game.time - float(memory["t"]) < 5.0 and agent.ammo > 0:
			agent.try_shoot(game, 0.09, 0.02)
	if agent.ammo <= 0 and not agent.reloading:
		agent.start_reload(game)

	# поворот к цели/игроку
	var face := Vector2(p.x, p.z)
	if not seen_now and not memory.is_empty():
		face = Vector2(float(memory["x"]), float(memory["z"]))
	elif not seen_now and not target.is_empty():
		face = Vector2(float(target["x"]), float(target["z"]))
	elif state == "patrol" and not target.is_empty():
		face = Vector2(float(target["x"]), float(target["z"]))
	var want_yaw: float = atan2(face.x - agent.x, face.y - agent.z)
	var d: float = _wrap(want_yaw - agent.yaw)
	var turn_rate: float = (5.2 if state == "combat" else 2.2) * (0.5 if retreating > 0.0 else 1.0)
	agent.yaw = _wrap(agent.yaw + clampf(d, -turn_rate * dt, turn_rate * dt))

	if seen_now:
		var dyp: float = (p.y + (1.0 if p.crouch else 1.35)) - agent.eye_y
		agent.aim_pitch = atan2(dyp, maxf(1.0, dist_to_player))
	else:
		agent.aim_pitch = 0.0

	agent.move(move.x, move.y, game, dt, {"crouch": want_crouch, "sprint": want_sprint})

	# гранаты
	if tactic == "grenade" and agent.grenades > 0 and seen_now and pending_grenade <= 0.0 \
			and rng.randf() > 0.4:
		pending_grenade = 0.9
		var tgt := memory if not memory.is_empty() else {"x": p.x, "z": p.z}
		agent.throw_grenade(game, Vector2(float(tgt["x"]), float(tgt["z"])))
		agent.grenades -= 1
	if pending_grenade > 0.0:
		pending_grenade -= dt
	# ближний бой
	if tactic == "melee" and dist_to_player < 2.4:
		melee_wish = 0.7
		agent.melee(game)
	if melee_wish > 0.0:
		melee_wish -= dt

	# прилипание к стенам
	var moved: float = Vector2(agent.x, agent.z).distance_to(last_pos)
	if move.length() > 0.01 and moved < 0.008:
		stuck += dt
	else:
		stuck = maxf(0.0, stuck - dt)
	if stuck > 0.7:
		cover_point = game.world.random_open_point(agent.x, agent.z, 3.0, 10.0, rng)
		patrol_target = {}
		stuck = 0.0
	last_pos = Vector2(agent.x, agent.z)


## Командир раздаёт приказы «в толпу»
static func commander_tick(game, dt: float) -> void:
	game.commander_timer -= dt
	if game.commander_timer > 0.0:
		return
	game.commander_timer = 3.4
	var leaders: Array = []
	for e in game.enemies:
		if e.alive and (e.type_id == "officer" or e.type_id == "boss"):
			leaders.append(e)
	if leaders.is_empty():
		return
	for L in leaders:
		if L.brain == null or L.brain.state != "combat":
			continue
		var tactic: String = "suppress" if (L.type_id == "boss" and randf() > 0.5) \
			else ("flank" if randf() > 0.5 else "advance")
		for f in game.enemies:
			if f == L or f.brain == null or not f.alive or f.type_id == "officer":
				continue
			if Vector2(f.x, f.z).distance_to(Vector2(L.x, L.z)) < 26.0:
				f.brain.receive_order(tactic, L.x, L.z, game.time)
				f.heard_command = {"text": SH2Data.COMMANDS[randi() % SH2Data.COMMANDS.size()],
					"t": 2.5}
		game.push_radio(L, SH2Data.COMMANDS[randi() % SH2Data.COMMANDS.size()])
