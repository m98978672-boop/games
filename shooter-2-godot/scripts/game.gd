extends Node3D
class_name SH2Game
## СЕКТОР «ПЕПЕЛ» — главный узел: цикл, миссии, камера, ввод, бой.
##
## Собирает всё вместе: уровень → мир → игрок → боевики → бой → эффекты → UI.
## Состояния: menu | briefing | playing | paused | dead | won | complete | lab.

const SENS: float = 0.0022

var settings: Dictionary = {
	"ragdoll": true,
	"show_thoughts": true,
	"invert_y": false,
	"mouse_sens": 1.0,
	"difficulty": 1,
}
var difficulty: int = 1
var time: float = 0.0
var state: String = "menu"
var mission_index: int = 0
var mission: Dictionary = {}
var mission_timer: float = 0.0
var kills: int = 0
var score: int = 0
var commander_timer: float = 0.0
var radio_log: Array = []
var danger: float = 0.0

var enemies: Array = []
var dead_bodies: Array = []
var flying_weapons: Array = []
var objectives: Array = []
var waves: Array = []
var wave_index: int = 0
var extract: Dictionary = {}
var objective_done_count: int = 0
var reinforce_timer: float = 0.0
var last_radio: float = -9.0
var low_hp_beep: bool = false
var cleanup_timer: int = 0

var shake_amount: float = 0.0
var shake_time: float = 0.0
var recoil_kick: float = 0.0
var menu_agents: Array = []

var camera: Camera3D
var ui: SH2UI
var audio: SH2Audio
var fx: SH2Fx
var world: SH2World
var player: SH2Player
var combat: SH2Combat
var level: Dictionary = {}
var level_root: Node3D
var world_root: Node3D
var agents_root: Node3D

var keys: Dictionary = {}
var mouse_dx: float = 0.0
var mouse_dy: float = 0.0
var mouse_down: bool = false
var mouse_right: bool = false
var crouch_toggle: bool = false
var touch_ads: bool = false
var semi_latch: float = 0.0
var aim: Dictionary = {}
var frame_dt: float = 0.016
var stats: Dictionary = {"shots": 0, "hits": 0}
var lab_stage: Dictionary = {}
var paused_from: String = "playing"


func _ready() -> void:
	_setup_nodes()
	player = SH2Player.new(self)
	player.build_viewmodel(camera)
	player.give_weapon("rifle")
	player.ammo_in_mag = int(player.weapon()["mag"])
	player.reserve = int(player.weapon()["reserve"])
	player.set_view_weapon("rifle")
	combat = SH2Combat.new(self)
	ui.bind_game(self)
	build_menu_scene()
	ui.show_screen("menu")


func _setup_nodes() -> void:
	world_root = Node3D.new()
	world_root.name = "World"
	add_child(world_root)
	agents_root = Node3D.new()
	agents_root.name = "Agents"
	add_child(agents_root)
	var dead_root := Node3D.new()
	dead_root.name = "Flying"
	add_child(dead_root)
	set_meta("dead_root", dead_root)

	camera = Camera3D.new()
	camera.name = "Camera"
	camera.fov = 78.0
	camera.near = 0.05
	camera.far = 340.0
	camera.position = Vector3(0, 1.62, 0)
	add_child(camera)
	camera.current = true

	fx = SH2Fx.new()
	fx.name = "Fx"
	add_child(fx)

	audio = SH2Audio.new()
	audio.name = "Audio"
	add_child(audio)

	ui = SH2Ui.new()
	ui.name = "UI"
	add_child(ui)


## ------------------------------- уровень ---------------------------------
func build_level(map_id: String) -> void:
	if level_root != null and is_instance_valid(level_root):
		level_root.queue_free()
	level_root = Node3D.new()
	level_root.name = "Level"
	world_root.add_child(level_root)
	level = SH2Level.build(map_id)
	level_root.add_child(level["root"])
	world = SH2World.new(level["map"], level["colliders"])
	# солнце и среда уже внутри уровня; туман подкручиваем по карте
	var env_node: WorldEnvironment = null
	for c in level["root"].get_children():
		if c is WorldEnvironment:
			env_node = c
	if env_node != null and env_node.environment != null:
		env_node.environment.fog_density = 0.012


func clear_agents() -> void:
	for e in enemies:
		if is_instance_valid(e.root):
			e.dispose()
	enemies.clear()
	for b in dead_bodies:
		if is_instance_valid(b.root):
			b.dispose()
	dead_bodies.clear()


func all_agents() -> Array:
	return enemies


func build_menu_scene() -> void:
	clear_menu_scene()
	build_level(str(SH2Data.MISSIONS[0]["map"]))
	var types := ["grunt", "officer", "scout"]
	for i in types.size():
		var spot: Dictionary = world.random_open_point(0.0, 0.0, 3.0, 7.0)
		if spot.is_empty():
			spot = {"x": float(i) * 2.0 - 2.0, "z": 3.0}
		var a := SH2Agent.new(self, types[i], false)
		a.spawn(agents_root, Vector2(float(spot["x"]), float(spot["z"])), PI + float(i))
		menu_agents.append(a)


func clear_menu_scene() -> void:
	for a in menu_agents:
		if is_instance_valid(a.root):
			a.dispose()
	menu_agents.clear()


## ------------------------------- миссии ----------------------------------
func start_mission(index: int) -> void:
	mission_index = clampi(index, 0, SH2Data.MISSIONS.size() - 1)
	mission = SH2Data.MISSIONS[mission_index]
	state = "playing"
	time = 0.0
	mission_timer = 0.0
	kills = 0
	score = 0
	wave_index = 0
	objective_done_count = 0
	reinforce_timer = 0.0
	last_radio = -9.0
	commander_timer = 0.0
	radio_log.clear()
	extract = {}
	clear_menu_scene()
	clear_agents()
	combat.clear()
	fx.clear_all()
	build_level(str(mission["map"]))

	var p := player
	p.alive = true
	p.hp = p.max_hp
	p.armor = 40.0
	p.stamina = p.max_stamina
	p.slots.clear()
	p.mag_store.clear()
	p.reserve_store.clear()
	p.slot = 0
	for wid in mission["loadout"]:
		p.give_weapon(str(wid))
	p.grenade_count = 3
	var start := find_start()
	p.x = float(start["x"])
	p.z = float(start["z"])
	p.yaw = float(start["yaw"])
	p.pitch = 0.0
	p.vx = 0.0
	p.vz = 0.0
	p.crouch = false
	p.crouch_t = 0.0
	p.ammo_in_mag = int(p.weapon()["mag"])
	p.reserve = int(p.weapon()["reserve"])
	p.save_ammo()
	p.kills = 0
	p.headshots = 0
	p.shots = 0
	p.hits = 0
	p.damage_dealt = 0.0
	p.damage_taken = 0.0
	p.set_view_weapon(str(p.weapon()["id"]))
	semi_latch = 0.0

	setup_mission(mission)
	spawn_initial_enemies(mission)
	ui.hide_screen()
	ui.reset_hud()
	ui.mission_start(mission)
	ui.set_objectives(objectives)
	Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)


func find_start() -> Dictionary:
	var m: Dictionary = level["map"]
	var ex: Dictionary = {}
	var extracts: Array = m.get("extracts", [])
	if not extracts.is_empty():
		ex = extracts[0]
	var spawns: Array = m.get("spawns", [Vector2.ZERO])
	var best := {"x": 0.0, "z": 0.0}
	var best_d := -1.0
	for s in spawns:
		var pt: Dictionary = world.random_open_point(float(s.x), float(s.y), 0.0, 3.0)
		if pt.is_empty():
			pt = {"x": float(s.x), "z": float(s.y)}
		var d: float = Vector2(float(pt["x"]) - float(ex["x"]), float(pt["z"]) - float(ex["z"])).length() \
			if not ex.is_empty() else absf(float(s.x)) + absf(float(s.y))
		if d > best_d:
			best_d = d
			best = pt
	var yaw: float = atan2(-float(best["x"]), -float(best["z"]))
	return {"x": best["x"], "z": best["z"], "yaw": yaw}


func setup_mission(m: Dictionary) -> void:
	objectives = []
	var mtype: String = str(m["type"])
	if mtype == "eliminate" or mtype == "boss":
		objectives.append({"id": "kill", "text": "Уничтожить боевиков",
			"current": 0, "max": int(m["count"]), "done": false})
	elif mtype == "destroy":
		var boxes: Array = level["map"].get("boxes", [])
		for i in boxes.size():
			var b: Vector2 = boxes[i]
			var marker := _build_objective_box(1.1)
			var pos: Dictionary = world.random_open_point(b.x, b.y, 0.0, 2.5)
			if pos.is_empty():
				pos = {"x": b.x, "z": b.y}
			marker.position = Vector3(float(pos["x"]), 0.0, float(pos["z"]))
			world_root.add_child(marker)
			objectives.append({"id": "box%d" % i, "text": "Взорвать груз %d" % (i + 1),
				"current": 0, "max": 1, "done": false, "node": marker,
				"x": pos["x"], "z": pos["z"], "hp": 55.0})
		objectives.append({"id": "killall", "text": "Зачистить охрану",
			"current": 0, "max": (m["enemies"] as Array).size(), "done": false})
	elif mtype == "survive":
		objectives.append({"id": "survive", "text": "Продержаться",
			"current": 0, "max": int(m["time"]), "done": false})
	elif mtype == "extract":
		objectives.append({"id": "kill", "text": "Пробиться к эвакуации",
			"current": 0, "max": 3, "done": false, "optional": true})
		var ex: Dictionary = (level["map"]["extracts"] as Array)[0]
		var marker2 := _build_extract_marker(float(ex["r"]))
		marker2.position = Vector3(float(ex["x"]), 0.0, float(ex["z"]))
		world_root.add_child(marker2)
		extract = {"node": marker2, "x": ex["x"], "z": ex["z"], "r": ex["r"]}
		objectives.append({"id": "reach", "text": "Дойти до точки эвакуации",
			"current": 0, "max": 1, "done": false})


func _build_objective_box(size: float) -> Node3D:
	var root := Node3D.new()
	var body := SH2Outline.mesh_node(
		SH2Outline.outline_mesh([Vector2(-size, 0.0), Vector2(size, 0.0), Vector2(size, size * 1.4),
			Vector2(-size, size * 1.4)], {"depth": size * 1.6, "bevel": 0.06}),
		Color(0.42, 0.33, 0.2), {"roughness": 0.85})
	body.position = Vector3(size * 0.8, 0, 0)
	body.rotation.y = PI * 0.5
	root.add_child(body)
	var stripe := SH2Outline.mesh_node(
		SH2Outline.outline_mesh([Vector2(-size, size * 0.5), Vector2(size, size * 0.5),
			Vector2(size, size * 0.72), Vector2(-size, size * 0.72)], {"depth": size * 1.62}),
		Color(0.85, 0.62, 0.15))
	stripe.position = Vector3(size * 0.8, 0, 0)
	stripe.rotation.y = PI * 0.5
	root.add_child(stripe)
	var glow := OmniLight3D.new()
	glow.light_color = Color(1.0, 0.75, 0.35)
	glow.light_energy = 1.4
	glow.omni_range = 4.0
	glow.position = Vector3(0, size * 1.9, 0)
	root.add_child(glow)
	root.set_meta("glow", glow)
	return root


func _build_extract_marker(radius: float) -> Node3D:
	var root := Node3D.new()
	var ring := TorusMesh.new()
	ring.inner_radius = radius - 0.18
	ring.outer_radius = radius
	ring.rings = 32
	ring.ring_segments = 10
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.36, 1.0, 0.61, 0.55)
	mat.emission_enabled = true
	mat.emission = Color(0.3, 1.0, 0.55)
	mat.emission_energy_multiplier = 1.6
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	ring.material = mat
	var node := MeshInstance3D.new()
	node.mesh = ring
	node.position = Vector3(0, 0.08, 0)
	node.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	root.add_child(node)
	var light := OmniLight3D.new()
	light.light_color = Color(0.4, 1.0, 0.6)
	light.light_energy = 1.2
	light.omni_range = 7.0
	light.position = Vector3(0, 1.2, 0)
	root.add_child(light)
	root.set_meta("ring", node)
	return root


func spawn_initial_enemies(m: Dictionary) -> void:
	var types: Array = (m["enemies"] as Array).duplicate()
	var wave_count: int = int(m.get("waves", 1))
	if wave_count > 1:
		var first: int = maxi(3, int(ceil(float(types.size()) * 0.7)))
		waves = [types.slice(0, first)]
		for w in range(1, wave_count):
			waves.append(types.slice(first))
	else:
		waves = [types]
	spawn_wave(0)


func spawn_wave(i: int) -> void:
	if i < 0 or i >= waves.size():
		return
	var wave: Array = waves[i]
	var m: Dictionary = level["map"]
	var spawns: Array = m["spawns"]
	var idx := 0
	for type_key in wave:
		var spot: Dictionary = {}
		for attempt in 40:
			var s: Vector2 = spawns[(idx + attempt) % spawns.size()]
			var cand: Dictionary = world.random_open_point(s.x, s.y, 0.0, 6.0)
			if cand.is_empty():
				continue
			var d: float = Vector2(float(cand["x"]) - player.x, float(cand["z"]) - player.z).length()
			if d < 16.0 or d > 55.0:
				continue
			spot = cand
			break
		if spot.is_empty():
			var s2: Vector2 = spawns[idx % spawns.size()]
			spot = {"x": s2.x, "z": s2.y}
		if alive_count() >= 12:
			return
		var e := SH2Agent.new(self, str(type_key), false)
		e.spawn(agents_root, Vector2(float(spot["x"]), float(spot["z"])), randf() * TAU, idx + 1)
		enemies.append(e)
		idx += 1
	ui.wave_started(i + 1, waves.size())


func alive_count() -> int:
	var n := 0
	for e in enemies:
		if e.alive:
			n += 1
	return n


func nearest_alive_enemy():
	var best = null
	var bd := 1e9
	for e in enemies:
		if not e.alive:
			continue
		var d: float = Vector2(e.x - player.x, e.z - player.z).length()
		if d < bd:
			bd = d
			best = e
	return best


## ------------------------------ бой: хуки --------------------------------
func player_bullet(origin: Vector3, dir: Vector3, w: Dictionary) -> Vector3:
	return combat.player_bullet(origin, dir, w)


func fire_bullet(agent, origin: Vector3, dir: Vector3, w: Dictionary) -> void:
	combat.enemy_bullet(agent, origin, dir, w)


func spawn_grenade(origin: Vector3, vel: Vector3, fuse: float, owner) -> void:
	combat.grenades.append({"pos": origin, "vel": vel, "fuse": fuse, "owner": owner,
		"node": null, "radius": 6.2, "damage": 92.0, "from_player": owner == player})


func damage_player(amount: float, from, kind: String) -> void:
	if not player.alive or state != "playing":
		return
	var scale_table: Array = [0.62, 1.0, 1.38]
	var scale: float = float(scale_table[clampi(difficulty, 0, 2)])
	player.take_damage(amount * scale, self, from, kind)
	shake(0.22)
	if player.hp < 35.0 and player.alive and not low_hp_beep:
		low_hp_beep = true
		audio.heartbeat()
		get_tree().create_timer(2.6).timeout.connect(_reset_low_hp)


func _reset_low_hp() -> void:
	low_hp_beep = false


func alert_enemies(x: float, z: float, radius: float) -> void:
	for e in enemies:
		if not e.alive or e.brain == null:
			continue
		var d: float = Vector2(e.x - x, e.z - z).length()
		if d < radius:
			e.brain.alert = maxf(e.brain.alert, 0.55)
			if e.brain.memory.is_empty():
				e.brain.memory = {"x": x, "z": z, "t": time}


func push_radio(agent, text: String) -> void:
	var short: String = str(SH2Data.enemy_by_id(agent.type_id)["short"])
	radio_log.append({"text": text, "t": time, "name": short})
	if radio_log.size() > 4:
		radio_log.pop_front()
	ui.radio(text, short, time)
	if time - last_radio > 2.2:
		last_radio = time
		audio.radio()


## Отлетевшее оружие: физика на точках, не больше 6 стволов одновременно
func add_flying_weapon(body: Dictionary) -> void:
	if body.is_empty():
		return
	flying_weapons.append(body)
	if flying_weapons.size() > 6:
		var old: Dictionary = flying_weapons.pop_front()
		if is_instance_valid(old["node"]):
			(old["node"] as Node3D).queue_free()


func shake(amount: float) -> void:
	shake_amount = maxf(shake_amount, amount)
	shake_time = maxf(shake_time, 0.18)


func kick(amount: float) -> void:
	recoil_kick += amount


func try_shoot() -> void:
	if not player.can_fire():
		if player.ammo_in_mag <= 0 and not player.reloading and player.reserve > 0:
			player.start_reload()
		return
	if not bool(player.weapon()["auto"]) and semi_latch > 0.0:
		return
	if not bool(player.weapon()["auto"]):
		semi_latch = 60.0 / float(player.weapon()["rpm"])
	player.fire()


func on_agent_died(agent) -> void:
	kills += 1
	var cfg: Dictionary = SH2Data.enemy_by_id(agent.type_id)
	score += int(float(cfg["score"]))
	dead_bodies.append(agent)
	ui.kill_feed("УСТРАНЁН · " + str(cfg["short"]), false)
	if agent.type_id == "officer" or agent.type_id == "boss":
		ui.toast("Архитектор повержен" if agent.type_id == "boss" else "Командир уничтожен — строй распался")
		audio.objective()
		for e in enemies:
			if e.brain != null:
				e.brain.order = null
	if dead_bodies.size() > 9:
		var oldest = dead_bodies.pop_front()
		if is_instance_valid(oldest.root):
			oldest.dispose()
		enemies.erase(oldest)
	if not mission.is_empty():
		var kill_obj: Dictionary = {}
		for o in objectives:
			if o["id"] == "kill" or o["id"] == "killall":
				kill_obj = o
				break
		if not kill_obj.is_empty():
			kill_obj["current"] = int(kill_obj["current"]) + 1
		if int(mission.get("waves", 1)) > 1 and alive_count() == 0 \
				and wave_index < waves.size() - 1:
			wave_index += 1
			spawn_wave(wave_index)
			ui.toast("Волна %d из %d" % [wave_index + 1, waves.size()])
	check_objectives()


func on_player_death() -> void:
	state = "dead"
	Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
	audio.mission_fail()
	ui.show_death()


func check_objectives() -> void:
	if mission.is_empty() or state != "playing":
		return
	var all_done := true
	for o in objectives:
		if bool(o["done"]):
			continue
		if o["id"] == "survive":
			o["current"] = int(mission_timer)
		if o["id"] == "reach" and not extract.is_empty():
			if Vector2(player.x - float(extract["x"]), player.z - float(extract["z"])).length() \
					< float(extract["r"]):
				o["current"] = 1
		if int(o["current"]) >= int(o["max"]):
			o["done"] = true
			audio.objective()
			ui.objective_done(o)
			ui.set_objectives(objectives)
		else:
			all_done = false
	if all_done:
		complete_mission()


func complete_mission() -> void:
	var time_bonus: int = maxi(0, int(round(2500.0 - mission_timer * 18.0)))
	var accuracy: int = int(round(float(player.hits) / maxf(1.0, float(player.shots)) * 100.0))
	if player.shots == 0:
		accuracy = 0
	score += time_bonus + accuracy * 12 + int(player.hp * 6.0)
	state = "won"
	Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
	audio.mission_complete()
	var is_last: bool = mission_index >= SH2Data.MISSIONS.size() - 1
	ui.mission_complete({
		"time": mission_timer,
		"accuracy": accuracy,
		"kills": kills,
		"damage_taken": int(player.damage_taken),
		"time_bonus": time_bonus,
		"score": score,
		"last": is_last,
	})
	if is_last:
		state = "complete"
	ui.progress["unlocked"] = maxi(int(ui.progress["unlocked"]), mission_index + 1)
	var best: Dictionary = ui.progress["best"]
	best[str(mission["id"])] = maxf(float(best.get(str(mission["id"]), 0.0)), float(score))


func retry() -> void:
	start_mission(mission_index)


func next_mission() -> void:
	start_mission(mini(SH2Data.MISSIONS.size() - 1, mission_index + 1))


func pause() -> void:
	if state != "playing":
		return
	state = "paused"
	ui.show_screen("pause")
	Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)


func resume() -> void:
	if state != "paused":
		return
	state = "playing"
	ui.hide_screen()
	Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)


func go_menu() -> void:
	state = "menu"
	Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
	clear_agents()
	combat.clear()
	fx.clear_all()
	build_level(str(SH2Data.MISSIONS[0]["map"]))
	build_menu_scene()


func is_playing() -> bool:
	return state == "playing"


func in_mission() -> bool:
	return state == "playing" or state == "paused" or state == "dead" or state == "won"


func set_difficulty(i: int) -> void:
	difficulty = clampi(i, 0, 2)
	settings["difficulty"] = difficulty


func ui_screen_changed(name: String) -> void:
	if name != "none" and name != "lab" and state == "playing":
		paused_from = state


func aim_info() -> Dictionary:
	if not player.alive:
		return {"enemy": null}
	var o: Vector3 = player.ray_origin()
	var d: Vector3 = player.ray_direction()
	var max_t := 120.0
	var wall: Dictionary = world.ray_colliders(o, d, max_t)
	var best_t: float = float(wall["t"]) if not wall.is_empty() else max_t
	var enemy = null
	for e in enemies:
		if not e.alive:
			continue
		var t: float = SH2World.ray_cylinder(o, d, e.x, e.z, 0.42 * e.scale, 0.0,
			1.85 * e.scale, best_t)
		if t >= 0.0 and t < best_t:
			best_t = t
			enemy = e
	return {"enemy": enemy, "dist": best_t, "blocked": not wall.is_empty()}


## ----------------------------- ui-обёртки --------------------------------
func ui_damage(from, kind: String, amount: float) -> void:
	ui.hitmarker_fx("hurt", false)
	if from != null:
		ui.toast("Ранение: %s (%d)" % [kind, int(amount)], 1.4)


func ui_hitmarker(kind: String, killed: bool) -> void:
	ui.hitmarker_fx(kind, killed)


func ui_damage_number(pos: Vector3, amount: int, is_head: bool) -> void:
	ui.damage_number(pos, amount, is_head)


func ui_toast(text: String) -> void:
	ui.toast(text)


func ui_hud_grenades(n: int) -> void:
	ui.grenade_label.text = "ГРАНАТЫ · %d" % n


func fx_muzzle(pos: Vector3, scale: float) -> void:
	fx.muzzle_flash(pos, scale)


func fx_blood(pos: Vector3, part: String) -> void:
	fx.blood_at(pos, part)


func sfx_gunshot(kind: String, x: float, z: float, vol: float = 1.0) -> void:
	audio.gunshot(kind, x, z, vol)


func sfx_footstep(x: float, z: float) -> void:
	audio.footstep(x, z, 0.35)


func sfx_reload(x: float, z: float) -> void:
	audio.reload_sfx(x, z)


func sfx_throw(x: float, z: float) -> void:
	audio.throw_grenade(x, z)


func sfx_melee(x: float, z: float) -> void:
	audio.melee_sfx(x, z)


## ------------------------------ цели: урон -------------------------------
func damage_objective(x: float, z: float, damage: float) -> void:
	if mission.is_empty() or str(mission["type"]) != "destroy":
		return
	for o in objectives:
		if not o.has("node") or bool(o["done"]):
			continue
		if Vector2(float(o["x"]) - x, float(o["z"]) - z).length() < 3.2:
			o["hp"] = float(o["hp"]) - damage
			if float(o["hp"]) <= 0.0:
				o["done"] = true
				o["current"] = 1
				fx.explosion(Vector3(float(o["x"]), 0.6, float(o["z"])), 7.0)
				audio.explosion(float(o["x"]), float(o["z"]))
				var node: Node3D = o["node"]
				if is_instance_valid(node):
					node.queue_free()
				shake(0.6)
				ui.toast("Груз уничтожен")
				ui.set_objectives(objectives)
				damage_player(maxf(0.0, 40.0 - Vector2(player.x - float(o["x"]),
					player.z - float(o["z"])).length() * 4.0), null, "explosion")


## -------------------------------- ввод -----------------------------------
func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion:
		if Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED and state == "playing":
			mouse_dx += event.relative.x
			mouse_dy += event.relative.y
	elif event is InputEventMouseButton:
		var mb := event as InputEventMouseButton
		if mb.button_index == MOUSE_BUTTON_LEFT:
			mouse_down = mb.pressed
			if mb.pressed and state == "playing":
				try_shoot()
		elif mb.button_index == MOUSE_BUTTON_RIGHT:
			mouse_right = mb.pressed
	elif event is InputEventKey:
		var k := event as InputEventKey
		if k.pressed and not k.echo:
			_on_key(k)
		else:
			keys[k.physical_keycode] = k.pressed


func _on_key(k: InputEventKey) -> void:
	keys[k.physical_keycode] = true
	if k.keycode == KEY_ESCAPE:
		if state == "playing":
			pause()
		elif state == "paused":
			resume()
		return
	if state != "playing":
		return
	if k.keycode == KEY_ENTER:
		pause()


## -------------------------------- кадр -----------------------------------
func _process(delta: float) -> void:
	frame_dt = minf(0.05, maxf(0.0005, delta))
	if state == "playing":
		update_playing(frame_dt)
	elif state == "menu":
		update_menu(frame_dt)
	elif state == "paused":
		update_paused(frame_dt)
	elif state == "lab":
		_process_lab(frame_dt)
	else:
		update_overlay(frame_dt)
	if ui != null:
		ui.frame(self, frame_dt)


func update_menu(dt: float) -> void:
	time += dt
	if level_root == null:
		return
	var r := 6.5
	var a: float = time * 0.18
	camera.position = Vector3(sin(a) * r, 1.9 + sin(time * 0.5) * 0.12, cos(a) * r)
	camera.fov = 55.0
	camera.look_at(Vector3(0.0, 1.15, 0.0), Vector3.UP)
	for i in menu_agents.size():
		var agent = menu_agents[i]
		agent.yaw += dt * (-0.25 if i % 2 == 1 else 0.3)
		agent.root.rotation.y = agent.yaw
		agent.update_visual(dt)


func update_paused(dt: float) -> void:
	fx.tick(dt * 0.0)
	_place_camera(dt, true)


func update_overlay(dt: float) -> void:
	# смерть/победа: регдолы ещё живут, камера смотрит от игрока
	if not player.alive:
		player.death_anim += dt
	for e in enemies:
		e.update(dt, self)
	_place_camera(dt, false)
	fx.tick(dt)


func update_playing(dt: float) -> void:
	time += dt
	mission_timer += dt

	# --- ввод ---
	var p := player
	var sens: float = SENS * float(settings.get("mouse_sens", 1.0))
	p.yaw -= mouse_dx * sens
	var invert: float = -1.0 if bool(settings.get("invert_y", false)) else 1.0
	p.pitch = clampf(p.pitch - mouse_dy * sens * invert, -1.45, 1.45)
	p.yaw = _wrap(p.yaw)
	mouse_dx = 0.0
	mouse_dy = 0.0

	var fwd := 0.0
	var str := 0.0
	if Input.is_action_pressed("move_forward") or _key(KEY_UP):
		fwd += 1.0
	if Input.is_action_pressed("move_back") or _key(KEY_DOWN):
		fwd -= 1.0
	if Input.is_action_pressed("move_right") or _key(KEY_RIGHT):
		str += 1.0
	if Input.is_action_pressed("move_left") or _key(KEY_LEFT):
		str -= 1.0
	if Input.is_action_pressed("reload"):
		p.start_reload()
	if Input.is_action_just_pressed("grenade"):
		combat.player_grenade()
	if Input.is_action_just_pressed("crouch"):
		crouch_toggle = not crouch_toggle
	if Input.is_action_just_pressed("jump"):
		p.jump()
	if Input.is_action_just_pressed("weapon_1"):
		p.select_slot(0)
	if Input.is_action_just_pressed("weapon_2"):
		p.select_slot(1)
	if Input.is_action_just_pressed("weapon_3"):
		p.select_slot(2)
	if Input.is_action_just_pressed("weapon_next"):
		p.select_slot((p.slot + 1) % maxi(1, p.slots.size()))
	var inp := {
		"yaw": p.yaw,
		"forward": fwd,
		"strafe": str,
		"sprint": Input.is_action_pressed("sprint"),
		"crouch": crouch_toggle or Input.is_action_pressed("crouch"),
		"ads": mouse_right or touch_ads,
	}
	p.update(dt, inp, self)
	if semi_latch > 0.0:
		semi_latch -= dt
	if mouse_down and bool(p.weapon()["auto"]):
		try_shoot()

	# --- бой и эффекты ---
	combat.update(dt)
	fx.tick(dt)

	# --- боевики ---
	for e in enemies:
		e.update(dt, self)
		e.update_ragdoll(dt, world.colliders)
		e.update_visual(dt)
	SH2Brain.commander_tick(self, dt)

	# --- отлетевшее оружие ---
	for i in range(flying_weapons.size() - 1, -1, -1):
		var body: Dictionary = flying_weapons[i]
		SH2Ragdoll.step_weapon(body, dt)
		if is_instance_valid(body["node"]) and Vector2(float(body["pos"].x) - p.x,
				float(body["pos"].z) - p.z).length() > 130.0:
			(body["node"] as Node3D).queue_free()
			flying_weapons.remove_at(i)

	# --- трупы ---
	for i in range(dead_bodies.size() - 1, -1, -1):
		var b = dead_bodies[i]
		if b.ragdoll == null and time - b.death_time > 3.0:
			# без регдола тело убираем раньше: анимация смерти уже доиграла
			if is_instance_valid(b.root):
				b.dispose()
			dead_bodies.remove_at(i)
			continue
		if b.ragdoll != null and not b.ragdoll.sleeping and b.ragdoll.total_substeps > 900:
			b.ragdoll.sleeping = true
		if time - b.death_time > 26.0:
			if is_instance_valid(b.root):
				b.dispose()
			dead_bodies.remove_at(i)

	cleanup_timer += 1
	if cleanup_timer > 30:
		cleanup_timer = 0
		var keep: Array = []
		for e in enemies:
			if e.alive or dead_bodies.has(e):
				keep.append(e)
		enemies = keep

	if not mission.is_empty():
		check_mission_progress(dt)

	if p.hit_flash > 0.0:
		p.hit_flash = maxf(0.0, p.hit_flash - dt * 1.8)

	var near = nearest_alive_enemy()
	danger = clampf(1.0 - Vector2(near.x - p.x, near.z - p.z).length() / 40.0, 0.0, 1.0) \
		if near != null else 0.0
	audio.set_danger(danger)
	audio.set_listener(p.x, p.z, p.yaw)
	stats["shots"] = p.shots
	stats["hits"] = p.hits
	aim = aim_info()
	_place_camera(dt, false)


func _key(code: int) -> bool:
	return Input.is_physical_key_pressed(code)


static func _wrap(a: float) -> float:
	while a > PI:
		a -= TAU
	while a < -PI:
		a += TAU
	return a


func check_mission_progress(dt: float) -> void:
	var mtype: String = str(mission["type"])
	if mtype == "survive":
		var alive: int = alive_count()
		if alive == 0 and wave_index < waves.size() - 1 and mission_timer > 1.0:
			wave_index += 1
			spawn_wave(wave_index)
		reinforce_timer -= dt
		if alive < 2 and mission_timer < float(mission["time"]) and reinforce_timer <= 0.0:
			reinforce_timer = 6.0
			spawn_wave(wave_index)
	elif mtype == "destroy":
		for o in objectives:
			if o.has("node") and not bool(o["done"]):
				var node: Node3D = o["node"]
				if is_instance_valid(node):
					var glow: Node3D = node.get_meta("glow", null)
					if glow != null:
						glow.rotation.y += dt * 1.4
						glow.position.y = 1.85 + sin(time * 2.0) * 0.08
	elif mtype == "extract":
		for o in objectives:
			if o["id"] == "kill":
				o["current"] = mini(kills, int(o["max"]))
	elif mtype == "eliminate" or mtype == "boss":
		if alive_count() == 0:
			for o in objectives:
				if o["id"] == "kill":
					o["current"] = int(o["max"])
					o["done"] = true
	check_objectives()


func _place_camera(dt: float, frozen: bool) -> void:
	var p := player
	shake_time = maxf(0.0, shake_time - dt)
	shake_amount *= exp(-dt * 9.0)
	var sh: float = shake_amount
	var shx: float = (randf() - 0.5) * sh * 0.16
	var shy: float = (randf() - 0.5) * sh * 0.16
	camera.position = Vector3(p.x + p.cam_bob_side, p.eye_height + p.cam_bob + shy, p.z)
	var pitch: float = p.pitch + shx + p.recoil_pitch * 0.25
	var yaw_v: float = p.yaw + PI + p.recoil_yaw * 0.25
	camera.rotation = Vector3(pitch, yaw_v, p.roll + (randf() - 0.5) * sh * 0.02)
	if not p.alive:
		camera.position.y = lerpf(1.62, 0.35, minf(1.0, p.death_anim * 1.4))
		camera.rotation.z = lerpf(0.0, 1.15, minf(1.0, p.death_anim))
		p.pitch = lerpf(p.pitch, -0.55, minf(1.0, p.death_anim))
	if absf(camera.fov - p.fov) > 0.05:
		camera.fov = p.fov
	if not frozen:
		var moving: float = minf(1.0, Vector2(p.vx, p.vz).length() / 5.0)
		p.tick_viewmodel(dt, {"moving": moving, "sprint": p.sprint, "ads": p.ads,
			"hidden": not p.alive})
	# солнце следует за игроком
	for c in (level["root"] as Node3D).get_children():
		if c is DirectionalLight3D:
			var sun_pos: Vector3 = level["map"]["sun_pos"]
			(c as DirectionalLight3D).position = Vector3(p.x + sun_pos.x * 0.35, sun_pos.y,
				p.z + sun_pos.z * 0.35)
			(c as DirectionalLight3D).look_at(Vector3(p.x, 0.0, p.z), Vector3.UP)
			break


## ------------------------------ лаборатория ------------------------------
var lab_rig: Node3D
var lab_anim: SH2Animator


func open_lab() -> void:
	state = "lab"
	clear_agents()
	clear_menu_scene()
	build_level("depot")
	lab_rig = SH2Soldier.build("grunt", {"player": true})
	lab_rig.position = Vector3(0, 0, 0)
	world_root.add_child(lab_rig)
	lab_anim = SH2Animator.new(lab_rig)
	lab_stage = {"part": 0, "clip": 0, "variant": 0, "phase": 0.0}
	lab_select(0, 0, 0)
	camera.position = Vector3(0.0, 1.35, 2.6)
	camera.look_at(Vector3(0.0, 1.2, 0.0), Vector3.UP)
	camera.fov = 45.0


func close_lab() -> void:
	if lab_rig != null and is_instance_valid(lab_rig):
		lab_rig.queue_free()
	lab_rig = null
	lab_anim = null
	go_menu()


func lab_set_variant(v: int) -> void:
	lab_stage["variant"] = v
	if lab_anim != null:
		lab_anim.set_variant(v)


func lab_select(part: int, clip: int, variant: int) -> void:
	lab_stage["part"] = part
	lab_stage["clip"] = clip
	lab_stage["variant"] = variant
	if lab_anim == null:
		return
	lab_anim.set_variant(variant)
	var clip_id: String = str(SH2Data.CLIPS[clip]["id"])
	lab_anim.set_base(clip_id, {"instant": true})
	lab_anim.update(0.016)


func _process_lab(dt: float) -> void:
	if lab_anim == null:
		return
	lab_anim.update(dt)
	camera.position = Vector3(sin(time * 0.25) * 0.6, 1.35, 2.6)
	camera.look_at(Vector3(0.0, 1.15, 0.0), Vector3.UP)
