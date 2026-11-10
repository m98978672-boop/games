class_name GameManager
extends Node2D
## Главный координатор симуляции Dead District:
## связывает мир, 3D/2D рендеринг (480x270 nearest -> 1920x1080), игрока, инвентарь, крафт,
## строительство, фермерство, транспорт, ИИ зомби/выживших, акустику, FOV и SaveManager.

const FLOW_FIELD_INTERVAL: float = 0.25
const HUD_REFRESH_INTERVAL: float = 0.12

@export var renderer_path: NodePath
@export var hud_path: NodePath
@export var sfx_player_path: NodePath

var chunks: ChunkStreamer
var time_weather: TimeWeatherSystem
var utilities: UtilitiesSystem
var needs: PlayerNeeds
var health: PlayerHealth
var player: PlayerController
var inventory: InventorySystem
var crafting: CraftingSystem
var building: BuildingSystem
var farming: FarmingSystem
var noise_sys: NoiseSystem
var vehicles: VehicleSystem

var spatial_hash := SpatialIndex.SpatialHash.new(8.0)
var world_quadtree: SpatialIndex.QuadNode
var spawn_director := SpawnDirector.new()
var flow_field: Dictionary = {}
var visible_tiles: Dictionary = {}
var explored_tiles: Dictionary = {}

var zombies: Array[Dictionary] = []
var npcs: Array[Dictionary] = []
var looted_containers: Dictionary = {}
var paused: bool = false

var _rng := RandomNumberGenerator.new()
var _flow_timer: float = 0.0
var _hud_timer: float = 0.0
var _autosave_timer: float = 0.0
var _last_noise_pos: Vector2 = Vector2.ZERO
var _last_noise_ttl: float = 0.0
var _pending_ambient_sounds: Array[Dictionary] = []


func _ready() -> void:
	_rng.seed = 20261110
	_init_subsystems()
	_connect_events()
	_start_new_run(false)


func _init_subsystems() -> void:
	chunks = ChunkStreamer.new()
	time_weather = TimeWeatherSystem.new()
	utilities = UtilitiesSystem.new()
	needs = PlayerNeeds.new()
	health = PlayerHealth.new()
	player = PlayerController.new()
	inventory = InventorySystem.new()
	crafting = CraftingSystem.new()
	building = BuildingSystem.new()
	farming = FarmingSystem.new()
	noise_sys = NoiseSystem.new()
	vehicles = VehicleSystem.new()

	for n in [chunks, time_weather, utilities, needs, health, player, inventory, crafting, building, farming, noise_sys, vehicles]:
		add_child(n)

	var rend := _get_renderer()
	if rend != null:
		rend.setup(chunks, time_weather)

	var hud := _get_hud()
	if hud != null:
		hud.action_requested.connect(_on_hud_action)


func _connect_events() -> void:
	EventBus.noise_emitted.connect(_on_noise_emitted)
	EventBus.player_damaged.connect(func(part: String, _dmg: float, wound: String):
		EventBus.ui_toast.emit("Ранение (%s): %s" % [part, wound])
		_play_sfx("res://assets/audio/sfx_zombie_bite.wav")
	)


func _start_new_run(load_saved: bool) -> void:
	paused = false
	zombies.clear()
	npcs.clear()
	vehicles.vehicles.clear()
	looted_containers.clear()
	explored_tiles.clear()
	world_quadtree = SpatialIndex.QuadNode.new(Rect2(-1024, -1024, 2048, 2048))

	if load_saved and SaveManager.has_save():
		var data := SaveManager.load_game()
		if not data.is_empty():
			_apply_save_data(data)
			EventBus.ui_toast.emit("Игра загружена из сохранения")
			return

	player.pos = Vector2(16.0, 16.0)
	health.reset_body()
	inventory.give_starting_kit()
	chunks.update_around(Vector2i(16, 16))
	_ensure_safe_spawn_tile()
	_populate_initial_world()
	_recompute_fov_and_flow()
	EventBus.ui_toast.emit("Добро пожаловать в Dead District. Выживите любой ценой.")


func _ensure_safe_spawn_tile() -> void:
	var t := Vector2i(int(round(player.pos.x)), int(round(player.pos.y)))
	if not chunks.is_walkable(t):
		for r in range(1, 12):
			for dy in range(-r, r + 1):
				for dx in range(-r, r + 1):
					var cand := t + Vector2i(dx, dy)
					if chunks.is_walkable(cand):
						player.pos = Vector2(cand)
						return


func _populate_initial_world() -> void:
	# Инициализируем машины на дорогах и выживших NPC поблизости
	for cpos in chunks.chunks.keys():
		var cdata: Dictionary = chunks.chunks[cpos]
		for vs in cdata.get("vehicle_spawns", []):
			vehicles.register_vehicle(String(vs["type"]), vs["tile"], _rng.randf_range(8.0, 42.0), _rng.randf_range(50.0, 95.0))
	spawn_director.populate_chunk_zombies(Vector2i(0, 0), zombies, chunks, _rng)
	spawn_director.populate_chunk_zombies(Vector2i(1, 0), zombies, chunks, _rng)

	var npc_archetypes := DataDB.npcs.values()
	for i in range(mini(3, npc_archetypes.size())):
		var pos := player.pos + Vector2(float(i * 7 - 5), 9.0)
		var nt := Vector2i(int(round(pos.x)), int(round(pos.y)))
		if chunks.is_walkable(nt):
			npcs.append(NpcSurvivorAI.create_npc(i + 1, npc_archetypes[i], pos))


func _process(delta: float) -> void:
	var dt := minf(delta, 0.05)
	if Input.is_action_just_pressed("pause_menu"):
		paused = not paused
		var hud := _get_hud()
		if hud != null:
			hud.toggle_pause(paused)

	if paused or health.dead:
		return

	_handle_hotkeys()
	_step_player(dt)
	_step_world_systems(dt)
	_step_ai_and_spatial(dt)
	_sync_render_and_hud(dt)


func _handle_hotkeys() -> void:
	var hud := _get_hud()
	var near_wb := building.has_heat_near(player.pos)
	var near_heat := building.has_heat_near(player.pos)

	if Input.is_action_just_pressed("toggle_inventory") and hud != null:
		hud.toggle_modal("inventory", inventory, health, near_wb, near_heat)
	elif Input.is_action_just_pressed("toggle_crafting") and hud != null:
		hud.toggle_modal("crafting", inventory, health, near_wb, near_heat)
	elif Input.is_action_just_pressed("toggle_health_ui") and hud != null:
		hud.toggle_modal("health", inventory, health, near_wb, near_heat)
	elif Input.is_action_just_pressed("toggle_flashlight"):
		player.flashlight_on = not player.flashlight_on
		_play_sfx("res://assets/audio/sfx_ui_click.wav")
	elif Input.is_action_just_pressed("reload_weapon"):
		var loaded := player.reload_firearm(inventory)
		if loaded > 0:
			_play_sfx("res://assets/audio/sfx_gun_reload.wav")
			EventBus.ui_toast.emit("Перезаряжено +%d" % loaded)
	elif Input.is_action_just_pressed("interact"):
		_handle_interact()
	elif Input.is_action_just_pressed("attack_primary") and (hud == null or hud.current_modal == ""):
		_handle_attack()
	elif Input.is_action_just_pressed("quick_save"):
		save_current_game()
	elif Input.is_action_just_pressed("quick_load"):
		_start_new_run(true)


func _step_player(dt: float) -> void:
	var dir := Input.get_vector("move_left", "move_right", "move_up", "move_down")
	if player.in_vehicle_id != "":
		var res := vehicles.drive_step(player.in_vehicle_id, -dir.y, dir.x, dt, chunks)
		if res.has("pos"):
			player.pos = res["pos"]
			# Наезд на зомби на скорости
			if absf(float(res.get("speed", 0.0))) > 4.5:
				for z in zombies:
					if int(z["state"]) != ZombieAI.State.DEAD and player.pos.distance_to(z["pos"]) < 1.3:
						ZombieAI.apply_damage(z, 95.0, 0.9, _rng)
	else:
		player.move_step(
			dir, dt,
			Input.is_action_pressed("sprint"),
			Input.is_action_pressed("crouch_sneak"),
			chunks, needs, health,
			inventory.get_weight_speed_multiplier()
		)
	chunks.update_around(Vector2i(int(round(player.pos.x)), int(round(player.pos.y))))


func _step_world_systems(dt: float) -> void:
	time_weather.tick(dt)
	var dh := dt / TimeWeatherSystem.SECONDS_PER_GAME_HOUR
	var ptile := Vector2i(int(round(player.pos.x)), int(round(player.pos.y)))
	var indoor := chunks.is_indoor(ptile)
	var near_heat := building.has_heat_near(player.pos)

	var co_dmg := utilities.tick(time_weather.day, dh, ptile)
	var near_z_count := 0
	for z in zombies:
		if int(z["state"]) != ZombieAI.State.DEAD and player.pos.distance_to(z["pos"]) <= 10.0:
			near_z_count += 1

	var need_res := needs.tick(
		dh, dt, time_weather.ambient_temp_c,
		inventory.get_total_insulation(), indoor, near_heat,
		player.is_sprinting, false, near_z_count
	)
	health.tick(dh, float(need_res["hp_loss"]) + co_dmg)
	inventory.tick_spoilage(dh, utilities.has_power_at(ptile))
	building.tick_rain_collection(dh, time_weather.rain_intensity)
	farming.tick(dh, time_weather.ambient_temp_c, time_weather.rain_intensity)

	var rend := _get_renderer()
	if rend != null:
		rend.update_vignette(health.get_blood_loss_ratio(), float(need_res["hypothermia_pct"]), float(need_res["panic_pct"]))

	_autosave_timer += dt
	if _autosave_timer >= 60.0:
		_autosave_timer = 0.0
		save_current_game()


func _step_ai_and_spatial(dt: float) -> void:
	_flow_timer += dt
	if _flow_timer >= FLOW_FIELD_INTERVAL:
		_flow_timer = 0.0
		_recompute_fov_and_flow()

	if _last_noise_ttl > 0.0:
		_last_noise_ttl = maxf(0.0, _last_noise_ttl - dt)

	# Пространственное перестроение Spatial Hash и Quadtree
	spatial_hash.clear()
	world_quadtree = SpatialIndex.QuadNode.new(Rect2(player.pos.x - 160.0, player.pos.y - 160.0, 320.0, 320.0))
	for i in range(zombies.size()):
		var z := zombies[i]
		if int(z["state"]) != ZombieAI.State.DEAD:
			spatial_hash.insert(i, z["pos"])
			world_quadtree.insert(i, z["pos"])

	# Перераспределение LOD (<=150 активных, до 1200 мировых)
	spawn_director.refresh_lods(zombies, player.pos)

	var has_noise := _last_noise_ttl > 0.0
	for z in zombies:
		if int(z["state"]) == ZombieAI.State.DEAD:
			continue
		if String(z["lod"]) == "ACTIVE":
			var zt := Vector2i(int(round(z["pos"].x)), int(round(z["pos"].y)))
			var vis := visible_tiles.has(zt)
			var act_res := ZombieAI.step_active(z, dt, player.pos, vis, flow_field, chunks, _rng)
			if bool(act_res.get("attack", false)):
				var hit_part := PlayerHealth.BODY_PARTS[_rng.randi() % PlayerHealth.BODY_PARTS.size()]
				var armor := inventory.get_armor_for_part(hit_part)
				health.apply_attack(hit_part, float(act_res["damage"]), float(act_res["bite_chance"]), float(act_res["infect_chance"]), armor)
		else:
			ZombieAI.step_dormant(z, dt, _last_noise_pos, has_noise)

	# Шаг выживших NPC
	var is_night := time_weather.darkness > 0.45
	for npc in npcs:
		var near_ids := spatial_hash.query_radius(npc["pos"], 12.0)
		var nearest_z := {}
		var best_d := 999.0
		for zid in near_ids:
			var cand := zombies[zid]
			if int(cand["state"]) == ZombieAI.State.DEAD:
				continue
			var d := Vector2(npc["pos"]).distance_to(cand["pos"])
			if d < best_d:
				best_d = d
				nearest_z = cand
		var nres := NpcSurvivorAI.step_npc(npc, dt, player.pos, nearest_z, near_ids.size(), is_night, chunks, _rng)
		if bool(nres.get("attacked_player", false)):
			health.apply_attack("TORSO", 18.0, 0.0, 0.0, inventory.get_armor_for_part("TORSO"))


func _recompute_fov_and_flow() -> void:
	var ptile := Vector2i(int(round(player.pos.x)), int(round(player.pos.y)))
	var fov_radius := 16 if (time_weather.darkness < 0.35 or player.flashlight_on) else 7
	visible_tiles = FovShadowcast.compute_visible(ptile, fov_radius, func(t: Vector2i) -> bool:
		return chunks.is_opaque(t)
	)
	for t in visible_tiles.keys():
		explored_tiles[t] = true

	flow_field = Pathfinding.compute_flow_field(ptile, 24, func(t: Vector2i) -> bool:
		return chunks.is_walkable(t) or chunks.get_tile(t) == ProcGen.TileType.DOOR
	)


func _handle_attack() -> void:
	var res := player.perform_attack(player.facing, inventory)
	if not bool(res.get("ok", false)):
		return
	var kind := String(res["kind"])
	if kind == "firearm":
		var wpn := player.equipped_weapon_id
		var gun_sfx := "res://assets/audio/sfx_gun_pistol.wav"
		if wpn == "mossberg_500":
			gun_sfx = "res://assets/audio/sfx_gun_shotgun.wav"
		elif wpn == "ar15":
			gun_sfx = "res://assets/audio/sfx_gun_rifle.wav"
		_play_sfx(gun_sfx)
		var pellets := int(res.get("pellets", 1))
		var max_r := float(res["range"])
		for _p in range(pellets):
			var spread := _rng.randf_range(-float(res["spread"]), float(res["spread"]))
			var shot_dir: Vector2 = Vector2(res["dir"]).rotated(spread)
			_raycast_bullet(player.pos, shot_dir, max_r, float(res["damage"]) / float(pellets))
	else:
		_play_sfx("res://assets/audio/sfx_melee_swing.wav")
		var near_ids := spatial_hash.query_radius(player.pos, float(res["range"]) + 0.6)
		for zid in near_ids:
			var z := zombies[zid]
			if int(z["state"]) == ZombieAI.State.DEAD:
				continue
			var to_z := Vector2(z["pos"]) - player.pos
			if to_z.length() <= float(res["range"]) and (to_z.length() < 0.8 or to_z.normalized().dot(player.facing) > 0.25):
				ZombieAI.apply_damage(z, float(res["damage"]), float(res["stun"]), _rng)
				_play_sfx("res://assets/audio/sfx_melee_hit.wav")
				break


func _raycast_bullet(origin: Vector2, dir: Vector2, max_range: float, dmg: float) -> void:
	var near_ids := spatial_hash.query_radius(origin + dir * (max_range * 0.5), max_range * 0.6)
	var best_z := -1
	var best_t := max_range
	for zid in near_ids:
		var z := zombies[zid]
		if int(z["state"]) == ZombieAI.State.DEAD:
			continue
		var rel := Vector2(z["pos"]) - origin
		var proj := rel.dot(dir)
		if proj > 0.0 and proj < best_t:
			var perp := (rel - dir * proj).length()
			if perp <= 0.65:
				best_t = proj
				best_z = zid
	if best_z >= 0:
		ZombieAI.apply_damage(zombies[best_z], dmg, 0.2, _rng)


func _handle_interact() -> void:
	# 1. Выход из машины
	if player.in_vehicle_id != "":
		player.in_vehicle_id = ""
		EventBus.ui_toast.emit("Вы вышли из автомобиля")
		return

	# 2. Ближайшая машина
	var near_v := vehicles.find_nearest(player.pos, 2.5)
	if not near_v.is_empty():
		player.in_vehicle_id = String(near_v["id"])
		EventBus.ui_toast.emit("Вы сели в %s (Топливо: %.1f л)" % [near_v["name"], float(near_v["fuel"])])
		return

	# 3. Ближайший выживший NPC
	for npc in npcs:
		if player.pos.distance_to(npc["pos"]) <= 2.6:
			var hud := _get_hud()
			if hud != null:
				hud.show_npc_dialogue(NpcSurvivorAI.interact_dialogue(npc))
			return

	# 4. Дверь или контейнер перед игроком
	var front := Vector2i(int(round(player.pos.x + player.facing.x)), int(round(player.pos.y + player.facing.y)))
	var cur := Vector2i(int(round(player.pos.x)), int(round(player.pos.y)))
	for t in [front, cur]:
		if chunks.get_tile(t) == ProcGen.TileType.DOOR:
			chunks.toggle_door(t)
			_play_sfx("res://assets/audio/sfx_door_open.wav")
			_recompute_fov_and_flow()
			return
		var cont := chunks.get_container(t)
		if not cont.is_empty() and not looted_containers.has(t):
			looted_containers[t] = true
			var items_found := LootSystem.roll_zone_loot(String(cont["zone"]), _rng, utilities.hours_since_power_outage, true)
			for lf in items_found:
				inventory.add_item(String(lf["id"]), int(lf["qty"]), float(lf["freshness"]))
			EventBus.ui_toast.emit("Найдено предметов: %d" % items_found.size())
			return
		# Урожай на грядке
		var harvested := farming.harvest_ready(t, inventory)
		if harvested > 0:
			EventBus.ui_toast.emit("Собрано урожая: %d" % harvested)
			return


func _on_noise_emitted(origin: Vector2, db: float, _tag: String) -> void:
	_last_noise_pos = origin
	_last_noise_ttl = 4.0
	var max_r := noise_sys.compute_max_radius_tiles(db, time_weather.get_ambient_noise_floor_db())
	var rend := _get_renderer()
	if rend != null:
		rend.add_noise_ring(origin, max_r)
	for zid in spatial_hash.query_radius(origin, max_r):
		var z := zombies[zid]
		var rec_db := noise_sys.compute_received_db(origin, z["pos"], db, chunks)
		ZombieAI.hear_noise(z, origin, rec_db)


func _on_hud_action(action_id: String, payload: Dictionary) -> void:
	match action_id:
		"use_item":
			_use_inventory_item(String(payload["id"]))
		"treat_part":
			_treat_body_part(String(payload["part"]))
		"craft":
			var near_wb := building.has_heat_near(player.pos)
			if crafting.craft(String(payload["id"]), inventory, near_wb, near_wb):
				EventBus.ui_toast.emit("Крафт выполнен")
		"build":
			var bt := Vector2i(int(round(player.pos.x + player.facing.x)), int(round(player.pos.y + player.facing.y)))
			if building.place(String(payload["id"]), bt, inventory, chunks):
				EventBus.ui_toast.emit("Построено")
		"trade_npc":
			var nid := String(payload["npc_id"])
			for npc in npcs:
				if String(npc["id"]) == nid:
					if NpcSurvivorAI.trade_item(npc, "canned_beans", "bandage", inventory):
						EventBus.ui_toast.emit("Обмен завершён!")
					break


func _use_inventory_item(iid: String) -> void:
	var meta := DataDB.get_item(iid)
	var cat := String(meta.get("cat", ""))
	if cat == "food" or cat == "drink":
		if inventory.remove_item(iid, 1):
			needs.apply_consumable(meta)
			EventBus.ui_toast.emit("Употреблено: %s" % String(meta.get("name", iid)))
	elif cat == "melee" or cat == "firearm":
		player.equipped_weapon_id = iid
		EventBus.ui_toast.emit("Экипировано: %s" % String(meta.get("name", iid)))
	elif cat == "clothing":
		inventory.equip_clothing(iid)
	elif cat == "seed":
		var pt := Vector2i(int(round(player.pos.x)), int(round(player.pos.y)))
		if farming.plant_crop(pt, iid, inventory, chunks):
			EventBus.ui_toast.emit("Посажена грядка")


func _treat_body_part(part: String) -> void:
	for med_id in ["sterile_bandage", "bandage", "antiseptic", "suture_needle", "splint", "antibiotics", "painkillers", "dirty_rag"]:
		if inventory.count_item(med_id) > 0:
			var meta := DataDB.get_item(med_id)
			if health.treat_part(part, meta):
				if med_id != "suture_needle":
					inventory.remove_item(med_id, 1)
				EventBus.ui_toast.emit("Применено (%s) -> %s" % [String(meta.get("name", med_id)), part])
				return


func _sync_render_and_hud(dt: float) -> void:
	var rend := _get_renderer()
	if rend != null:
		rend.visible_tiles = visible_tiles
		rend.explored_tiles = explored_tiles
		rend.active_zombies = zombies
		rend.active_npcs = npcs
		rend.farm_plots = farming.plots
		rend.vehicles_data = vehicles.vehicles
		rend.sync_3d_scene(player.pos, vehicles.vehicles, time_weather.darkness)

	_hud_timer += dt
	if _hud_timer >= HUD_REFRESH_INTERVAL:
		_hud_timer = 0.0
		var hud := _get_hud()
		if hud != null:
			hud.refresh_hud(needs, health, inventory, player, time_weather, utilities, spawn_director.active_count, zombies.size())


func save_current_game() -> bool:
	var payload := {
		"chunks": chunks.serialize_state(),
		"time_weather": time_weather.serialize_state(),
		"utilities": utilities.serialize_state(),
		"needs": needs.serialize_state(),
		"health": health.serialize_state(),
		"player": player.serialize_state(),
		"inventory": inventory.serialize_state(),
		"building": building.serialize_state(),
		"farming": farming.serialize_state(),
		"vehicles": vehicles.serialize_state()
	}
	var ok := SaveManager.save_game(payload)
	if ok:
		EventBus.ui_toast.emit("Игра сохранена (SHA-256 OK)")
	return ok


func _apply_save_data(data: Dictionary) -> void:
	if data.has("chunks"): chunks.deserialize_state(data["chunks"])
	if data.has("time_weather"): time_weather.deserialize_state(data["time_weather"])
	if data.has("utilities"): utilities.deserialize_state(data["utilities"])
	if data.has("needs"): needs.deserialize_state(data["needs"])
	if data.has("health"): health.deserialize_state(data["health"])
	if data.has("player"): player.deserialize_state(data["player"])
	if data.has("inventory"): inventory.deserialize_state(data["inventory"])
	if data.has("building"): building.deserialize_state(data["building"])
	if data.has("farming"): farming.deserialize_state(data["farming"])
	if data.has("vehicles"): vehicles.deserialize_state(data["vehicles"])
	chunks.update_around(Vector2i(int(round(player.pos.x)), int(round(player.pos.y))))
	_recompute_fov_and_flow()


func _play_sfx(path: String) -> void:
	var ap := get_node_or_null(sfx_player_path) as AudioStreamPlayer
	if ap == null or not ResourceLoader.exists(path):
		return
	var stream := load(path) as AudioStream
	if stream != null:
		ap.stream = stream
		ap.play()


func _get_renderer() -> WorldRenderer3D:
	return get_node_or_null(renderer_path) as WorldRenderer3D


func _get_hud() -> HudController:
	return get_node_or_null(hud_path) as HudController


func on_restart_pressed() -> void:
	_start_new_run(false)


func on_save_pressed() -> void:
	save_current_game()


func on_load_pressed() -> void:
	_start_new_run(true)


func on_resume_pressed() -> void:
	paused = false
	var hud := _get_hud()
	if hud != null:
		hud.toggle_pause(false)
