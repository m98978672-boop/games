extends RefCounted
class_name SH2Agent
## СЕКТОР «ПЕПЕЛ» — боец: модель + скелет + аниматор + IK + физика + оружие.
##
## Один и тот же класс обслуживает игрока и боевиков: игрок получает ввод,
## боевики — мозг (SH2Brain). Смерть → регдол + отлетающее оружие.

const GRAVITY: float = 22.0

var game
var id: String = "a0"
var type_id: String = "grunt"
var is_player: bool = false
var max_hp: int = 100
var hp: int = 100
var armor: float = 0.0
var alive: bool = true
var x: float = 0.0
var z: float = 0.0
var y: float = 0.0
var vx: float = 0.0
var vz: float = 0.0
var vy: float = 0.0
var yaw: float = 0.0
var pitch: float = 0.0
var aim_pitch: float = 0.0
var crouch: bool = false
var sprint: bool = false
var radius: float = 0.34
var height: float = 1.72
var scale: float = 1.0
var eye_y: float = 1.56
var speed: float = 0.0

var weapon_id: String = "rifle"
var weapon: Dictionary
var ammo: int = 30
var mag: int = 30
var reserve: int = 120
var reloading: bool = false
var reload_t: float = 0.0
var fire_cool: float = 0.0
var grenades: int = 2
var under_fire: bool = false
var hurt_flash: float = 0.0
var melee_cool: float = 0.0
var radio_cool: float = 0.0
var last_footstep: float = 0.0
var kills: int = 0
var headshots: int = 0
var death_time: float = 0.0
var variant: int = 0

var root: Node3D
var rig: Node3D
var gun_node: Node3D
var anim: SH2Animator
var ik: SH2ArmIK
var ragdoll: SH2Ragdoll = null
var brain = null
var heard_command: Dictionary = {}

var anim_state: String = "idle"
var upper_state: String = "aim"


func _init(game_ref, type_key: String, is_player_ref: bool = false) -> void:
	game = game_ref
	type_id = type_key
	is_player = is_player_ref
	if is_player:
		max_hp = 100
		weapon_id = "rifle"
	else:
		var cfg: Dictionary = SH2Data.enemy_by_id(type_key)
		max_hp = int(cfg["hp"])
		armor = float(cfg["armor"])
		weapon_id = cfg["weapon"]
		radius = 0.34 * float(cfg["scale"])
		scale = float(cfg["scale"])
		height = 1.72 * scale
		eye_y = 1.55 * scale
		grenades = 1 if (cfg["tactics"] as Array).has("grenade") else 0
	hp = max_hp
	weapon = SH2Data.weapon_by_id(weapon_id)
	mag = int(weapon["mag"])
	ammo = mag
	reserve = int(weapon["reserve"])


## Построение модели и привязка аниматора
func spawn(parent: Node3D, pos: Vector2, yaw_value: float, seed_value: int = 1) -> void:
	x = pos.x
	z = pos.y
	y = 0.0
	yaw = yaw_value
	root = Node3D.new()
	root.name = "Agent_" + id
	parent.add_child(root)
	root.position = Vector3(x, y, z)
	root.rotation.y = yaw

	rig = SH2Soldier.build(type_id if not is_player else "grunt",
		{"player": is_player, "scale": scale})
	root.add_child(rig)

	anim = SH2Animator.new(rig)
	# вариативность: каждому бойцу свой вариант анимации
	var odds: Array = [0.42, 0.26, 0.12, 0.20]
	var r: float = randf()
	var acc := 0.0
	for i in odds.size():
		acc += float(odds[i])
		if r <= acc:
			variant = i
			break
	anim.set_variant(variant)
	anim.set_base("idle", {"instant": true})
	anim.set_upper("aim", {"weight": 0.7, "instant": true})

	# оружие строим по чертежу и сразу вешаем в слот; IK только находит точки хвата
	gun_node = SH2Guns.build(weapon_id)
	gun_node.name = "Gun"
	gun_node.scale = Vector3.ONE * 1.22
	var slot: Node3D = rig.get_node_or_null("weapon_slot")
	if slot != null:
		slot.add_child(gun_node)
	ik = SH2ArmIK.new(rig)
	ik.attach_weapon(gun_node)

	if not is_player:
		brain = SH2Brain.new(self, seed_value)


func health() -> float:
	return float(hp) / float(max_hp)


func aim_world() -> Vector3:
	return Vector3(x, eye_y, z)


func forward() -> Vector3:
	return Vector3(sin(yaw), 0.0, cos(yaw))


## ------------------------------- движение -------------------------------
func move(mx: float, mz: float, game_ref, dt: float, opts: Dictionary = {}) -> void:
	if not alive:
		return
	game = game_ref
	crouch = bool(opts.get("crouch", false))
	var speed_mul: float = 0.45 if crouch else (1.0 if bool(opts.get("sprint", false)) else 0.9)
	var accel: float = minf(1.0, 14.0 * dt)
	vx += (mx - vx) * accel
	vz += (mz - vz) * accel
	var px: float = x
	var pz: float = z
	x += vx * dt * speed_mul
	z += vz * dt * speed_mul
	var res: Dictionary = game.world.resolve_circle(Vector2(x, z), radius, y)
	var pos: Vector2 = res["pos"]
	x = pos.x
	z = pos.y
	# расталкивание живых бойцов
	for other in game.all_agents():
		if other == self or not other.alive:
			continue
		var dx: float = x - other.x
		var dz: float = z - other.z
		var d2: float = dx * dx + dz * dz
		var min_d: float = radius + other.radius
		if d2 < min_d * min_d and d2 > 1e-6:
			var d: float = sqrt(d2)
			var push: float = (min_d - d) / d * 0.5
			x += dx * push
			z += dz * push
	speed = Vector2(x - px, z - pz).length() / maxf(0.0001, dt)

	if speed > 1.2 and game.time - last_footstep > (0.30 if sprint else 0.48):
		last_footstep = game.time
		game.sfx_footstep(x, z)

	root.position = Vector3(x, y, z)
	root.rotation.y = yaw
	# позы слоёв выставляет update_visual() — один раз за кадр


## Только выбор слоёв анимации и веса (без шага аниматора).
## Шаг аниматора и IK делаются один раз за кадр в update_visual().
func _apply_pose(dt: float) -> void:
	var base := "idle"
	var upper := "aim"
	if crouch:
		base = "crouch" if speed > 0.35 else "crouch"
	elif speed > 0.3:
		var fwd_x: float = sin(yaw)
		var fwd_z: float = cos(yaw)
		var dot: float = (vx * fwd_x + vz * fwd_z) / maxf(0.001, speed)
		var right: float = (vx * fwd_z - vz * fwd_x) / maxf(0.001, speed)
		var cfg_speed: float = float(SH2Data.enemy_by_id(type_id)["speed"]) if not is_player else 6.0
		if speed > cfg_speed * 1.2:
			base = "run"
		elif dot > 0.55:
			base = "walk"
		elif dot < -0.55:
			base = "walkBack"
		else:
			base = "strafeR" if right > 0.0 else "strafeL"
	elif brain != null and brain.tactic == "melee" and brain.melee_wish > 0.0:
		anim.set_event("melee", {"fade": 26.0})
		base = "idle"

	if hurt_flash > 0.0:
		hurt_flash -= dt
		anim.set_event("hurt", {"fade": 22.0, "weight": 0.85})

	if reloading:
		upper = "reload"
	elif brain != null and brain.seen_now:
		upper = "aim"
	else:
		upper = "idle"

	if anim.current_clip != base:
		anim.set_base(base, {"fade": 10.0})
	anim.set_upper(upper, {"fade": 8.0, "weight": 0.55 if upper == "idle" else 1.0})
	anim_state = base
	upper_state = upper
	var lock_k: float = 0.0 if base == "die" else 1.0
	if ragdoll == null and lock_k > 0.0:
		SH2Animator.ground_lock_update(rig, anim, lock_k)


## Полная визуальная часть: позы слоёв, аниматор, прикладка
func update_visual(dt: float) -> void:
	if not alive:
		return
	root.position = Vector3(x, y, z)
	root.rotation.y = yaw
	_apply_pose(dt)
	anim.update(dt)
	if ik.enabled:
		var aim_up: float = 0.75 if (brain != null and brain.seen_now) else 0.30
		ik.update_pose(aim_up, -aim_pitch * 0.75)


## --------------------------------- огонь --------------------------------
func try_shoot(game_ref, spread: float, pitch_value: float = 0.0) -> bool:
	if not alive or reloading or ammo <= 0:
		return false
	game = game_ref
	ammo -= 1
	fire_cool = 60.0 / float(weapon["rpm"])
	anim.set_event("shoot", {"fade": 30.0, "weight": 0.9, "restart": true})
	var muzzle: Vector3 = aim_world()
	var muzzle_node: Node3D = gun_node.get_node_or_null("muzzle")
	if muzzle_node != null:
		muzzle = muzzle_node.global_position
	game.sfx_gunshot(weapon_id, x, z, 0.85)
	game.fx_muzzle(muzzle, 0.7)
	var dir := Vector3(sin(yaw) * cos(pitch_value), sin(pitch_value), cos(yaw) * cos(pitch_value))
	var sx: float = (randf() - 0.5) * spread * 2.0
	var sy: float = (randf() - 0.5) * spread * 2.0
	dir.x += cos(yaw) * sx + cos(yaw) * -sy * 0.2
	dir.z += -sin(yaw) * sx
	dir.y += sy
	dir = dir.normalized()
	game.fire_bullet(self, muzzle, dir, weapon)
	if ammo <= 0:
		start_reload(game)
	return true


func start_reload(game_ref) -> void:
	if reloading or not alive:
		return
	game = game_ref
	reloading = true
	reload_t = float(weapon["reload"]) * (0.9 + randf() * 0.3)
	anim.set_event("reload", {"fade": 6.0, "weight": 0.9, "restart": true})
	game.sfx_reload(x, z)


func finish_reload() -> void:
	reloading = false
	ammo = mag


func throw_grenade(game_ref, target: Vector2) -> void:
	if not alive:
		return
	game = game_ref
	anim.set_event("throw", {"fade": 8.0, "weight": 1.0, "restart": true})
	var from: Vector3 = aim_world() + forward() * 0.4
	var to := Vector3(target.x, 0.1, target.y)
	var flat := Vector2(to.x - from.x, to.z - from.z)
	var dist: float = flat.length()
	var t: float = clampf(dist / 15.0, 0.55, 1.6)
	var vel := Vector3(flat.x / t, (to.y - from.y) / t + 0.5 * 14.0 * t, flat.y / t)
	game.spawn_grenade(from, vel, 3.0, self)
	game.sfx_throw(x, z)


func melee(game_ref) -> void:
	if not alive or melee_cool > 0.0:
		return
	game = game_ref
	melee_cool = 1.1
	anim.set_event("melee", {"fade": 14.0, "weight": 1.0, "restart": true})
	var p = game.player
	if p != null and p != self and p.alive and Vector2(p.x - x, p.z - z).length() < 2.6:
		p.take_damage(game, int(14 + randf() * 8), self, "melee", aim_world())
	game.sfx_melee(x, z)


## --------------------------------- урон ---------------------------------
func take_damage(game_ref, damage: int, source, part: String = "body",
		hit_pos: Vector3 = Vector3.ZERO, dir: Vector3 = Vector3.ZERO) -> Dictionary:
	if not alive:
		return {"killed": false, "damage": 0}
	game = game_ref
	var dmg: int = damage
	if part == "head":
		dmg = int(round(float(damage) * 2.4))
		headshots += 1
	elif part == "limb":
		dmg = int(round(float(damage) * 0.7))
	var absorbed := 0.0
	if armor > 0.0:
		absorbed = minf(armor, float(dmg) * 0.45)
		armor -= absorbed
		dmg -= int(round(absorbed))
	hp -= dmg
	hurt_flash = 0.36
	under_fire = true
	if brain != null:
		brain.alert = 1.0
		brain.think_timer = minf(brain.think_timer, 0.12)
		brain.cover_point = {}
		brain.cover_timer = 0
		brain.reaction_left = minf(brain.reaction_left, float(SH2Data.enemy_by_id(type_id)["reaction"]) * 0.4)
		if not brain.seen_now and source != null:
			brain.memory = {"x": source.x, "z": source.z, "t": game.time}
	if dir != Vector3.ZERO:
		vx += dir.x * 1.2
		vz += dir.z * 1.2
	game.fx_blood(hit_pos if hit_pos != Vector3.ZERO else Vector3(x, y + 1.1, z), part)
	if hp <= 0:
		die(game, hit_pos, source, dir)
		return {"killed": true, "damage": damage}
	return {"killed": false, "damage": damage}


func die(game_ref, hit_pos: Vector3 = Vector3.ZERO, source = null,
		dir: Vector3 = Vector3.ZERO) -> void:
	if not alive:
		return
	game = game_ref
	alive = false
	hp = 0
	death_time = game.time
	anim.set_event("die", {"fade": 5.0, "weight": 1.0, "restart": true})
	if source != null and source != self:
		source.kills += 1

	ragdoll = SH2Ragdoll.new(rig)
	if not bool(game.settings.get("ragdoll", true)):
		# регдол выключен: остаётся анимация смерти
		anim.set_base("die", {"fade": 2.0})
		game.on_agent_died(self)
		return
	ragdoll.capture(Vector3(vx * 0.5, 0.0, vz * 0.5))
	# импульс в ближайшую точку к месту попадания
	var push_dir: Vector3 = dir if dir != Vector3.ZERO else Vector3(0.0, 0.2, 1.0)
	var best_name := "chest"
	var best_d := 1e9
	for pt in ragdoll.points:
		var d: float = (pt["pos"] as Vector3).distance_squared_to(hit_pos)
		if d < best_d:
			best_d = d
			best_name = pt["name"]
	ragdoll.impulse(best_name, push_dir.normalized(), 6.0)
	var body: Dictionary = ragdoll.detach_weapon()
	if not body.is_empty():
		game.add_flying_weapon(body)
	ik.enabled = false
	anim.set_upper("")
	game.on_agent_died(self)


func update_ragdoll(dt: float, colliders: Array) -> void:
	if ragdoll == null:
		return
	ragdoll.update(dt, colliders)


## -------------------------------- кадр ----------------------------------
func update(dt: float, game_ref) -> void:
	game = game_ref
	if not alive:
		if ragdoll != null:
			ragdoll.update(dt, game.world.colliders)
		return
	if hurt_flash > 0.0:
		hurt_flash -= dt
	if melee_cool > 0.0:
		melee_cool -= dt
	if radio_cool > 0.0:
		radio_cool -= dt
	if not heard_command.is_empty():
		heard_command["t"] = float(heard_command["t"]) - dt
		if float(heard_command["t"]) <= 0.0:
			heard_command = {}
	if under_fire and randf() < dt * 0.5:
		under_fire = false

	eye_y = (1.05 if crouch else 1.55) * scale
	if reloading:
		reload_t -= dt
		if reload_t <= 0.0:
			finish_reload()
	if brain != null:
		brain.update(game, dt)


func dispose() -> void:
	if ragdoll != null:
		ragdoll.dispose()
		ragdoll = null
	if root != null and is_instance_valid(root):
		root.queue_free()
	root = null
