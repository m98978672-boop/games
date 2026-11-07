extends RefCounted
class_name SH2Player
## СЕКТОР «ПЕПЕЛ» — игрок: движение, стойки, стрельба, отдача, FPS-модель.
##
## Игрок не боец из SH2Agent: у него своя камера, своя модель от первого лица
## (руки + оружие по чертежам), свой запас патронов по слотам и регенерация.

var game
var x: float = 0.0
var z: float = 0.0
var y: float = 0.0
var vx: float = 0.0
var vz: float = 0.0
var yaw: float = 0.0
var pitch: float = 0.0
var roll: float = 0.0
var hp: float = 100.0
var max_hp: float = 100.0
var armor: float = 0.0
var max_armor: float = 100.0
var stamina: float = 100.0
var max_stamina: float = 100.0
var exhausted: bool = false
var crouch: bool = false
var crouch_t: float = 0.0
var sprint: bool = false
var ads: bool = false
var scoped: bool = false
var alive: bool = true
var death_anim: float = 0.0
var eye_height: float = 1.62
var radius: float = 0.46
var bob: float = 0.0
var bob_amt: float = 0.0
var cam_bob: float = 0.0
var cam_bob_side: float = 0.0
var step_accum: float = 0.0
var recoil_pitch: float = 0.0
var recoil_yaw: float = 0.0
var spread_heat: float = 0.0
var hit_direction: float = 0.0
var hit_flash: float = 0.0
var last_damage_time: float = -99.0
var health_regen_timer: float = 0.0

var slots: Array = []
var slot: int = 0
var mag_store: Dictionary = {}
var reserve_store: Dictionary = {}
var ammo_in_mag: int = 0
var reserve: int = 0
var reloading: bool = false
var reload_timer: float = 0.0
var fire_timer: float = 0.0
var grenade_count: int = 3

var kills: int = 0
var headshots: int = 0
var shots: int = 0
var hits: int = 0
var damage_dealt: float = 0.0
var damage_taken: float = 0.0
var fov: float = 78.0
var kick: float = 0.0
var semi_latch: float = 0.0
var no_shoot_timer: float = 0.0

# модель от первого лица
var vm_root: Node3D
var vm_rig: Node3D
var vm_holder: Node3D
var vm_models: Dictionary = {}
var vm_mounted: Node3D = null
var vm_arm_r: Node3D
var vm_arm_l: Node3D
var vm_current: String = ""
var vm_recoil: float = 0.0
var vm_recoil_rot: float = 0.0
var vm_sway := Vector2.ZERO
var vm_bob: float = 0.0
var vm_reload_t: float = 0.0
var vm_reload_dur: float = 0.0
var vm_ads: float = 0.0
var vm_lowered: float = 0.0
var muzzle_node: Node3D


func _init(game_ref) -> void:
	game = game_ref


func _damp(from: float, to: float, rate: float, dt: float) -> float:
	return lerpf(from, to, 1.0 - exp(-rate * dt))


func weapon() -> Dictionary:
	if slots.is_empty():
		return SH2Data.weapon_by_id("pistol")
	return SH2Data.weapon_by_id(slots[slot])


func give_weapon(id: String) -> void:
	if not slots.has(id):
		slots.append(id)


func select_slot(i: int) -> void:
	if i < 0 or i >= slots.size():
		return
	if i == slot and ammo_in_mag > 0:
		return
	slot = i
	var w := weapon()
	ammo_in_mag = int(mag_store.get(w["id"], int(w["mag"])))
	reserve = int(reserve_store.get(w["id"], int(w["reserve"])))
	reloading = false
	reload_timer = 0.0
	fire_timer = 0.25
	set_view_weapon(w["id"])
	game.audio.play("reload", -16.0)


func save_ammo() -> void:
	var w := weapon()
	mag_store[w["id"]] = ammo_in_mag
	reserve_store[w["id"]] = reserve


## --------------------------- модель от первого лица ----------------------
func build_viewmodel(camera: Camera3D) -> void:
	vm_root = Node3D.new()
	vm_root.name = "ViewModel"
	camera.add_child(vm_root)
	vm_rig = Node3D.new()
	vm_root.add_child(vm_rig)
	vm_holder = Node3D.new()
	vm_rig.add_child(vm_holder)
	vm_arms()


func vm_arms() -> void:
	var sleeve := Color(0.18, 0.23, 0.32)
	var glove := Color(0.11, 0.13, 0.15)
	vm_arm_r = _build_arm(0.055, -0.11, 0.06, 0.30, sleeve, glove, -0.25, 0.22, 0.12)
	vm_arm_l = _build_arm(-0.02, -0.10, 0.34, 0.34, sleeve, glove, -0.15, -0.35, -0.15)
	vm_holder.add_child(vm_arm_r)
	vm_holder.add_child(vm_arm_l)


func _build_arm(px: float, py: float, pz: float, length: float,
		sleeve: Color, glove: Color, rx: float, ry: float, rz: float) -> Node3D:
	var arm := Node3D.new()
	arm.position = Vector3(px, py, pz)
	arm.rotation = Vector3(rx, ry, rz)
	# предплечье — лофт по сечениям: растёт вниз по −Y (рука висит от плеча)
	var fore := SH2Outline.loft_sections([
		{"at": Vector3(0, 0.0, 0), "pts": SH2Outline.circle_section(0.048, 0.048, 10)},
		{"at": Vector3(0, -length * 0.45, 0), "pts": SH2Outline.circle_section(0.052, 0.052, 10)},
		{"at": Vector3(0, -length, 0), "pts": SH2Outline.circle_section(0.055, 0.055, 10)},
	])
	var fore_node := SH2Outline.mesh_node(fore, sleeve)
	fore_node.rotation.x = -PI / 2.2
	arm.add_child(fore_node)
	var cuff := SH2Outline.revolve([[0.0, 0.058], [0.03, 0.062], [0.075, 0.056], [0.08, 0.0]],
		{"segments": 10})
	var cuff_node := SH2Outline.mesh_node(cuff, sleeve)
	cuff_node.rotation.x = PI / 2.0
	arm.add_child(cuff_node)
	# кисть — короткий лофт, кончается там, где кончается предплечье
	var fist := SH2Outline.loft_sections([
		{"at": Vector3(0, -length - 0.005, 0), "pts": SH2Outline.circle_section(0.040, 0.038, 10)},
		{"at": Vector3(0, -length - 0.045, 0.01), "pts": SH2Outline.circle_section(0.050, 0.046, 10)},
		{"at": Vector3(0, -length - 0.095, 0.015), "pts": SH2Outline.circle_section(0.043, 0.040, 10)},
	])
	var fist_node := SH2Outline.mesh_node(fist, glove)
	arm.add_child(fist_node)
	return arm


func set_view_weapon(id: String) -> void:
	if vm_current == id:
		return
	vm_current = id
	var model: Node3D = vm_models.get(id, null)
	if model == null:
		model = SH2Guns.build(id, {"smooth": true})
		model.scale = Vector3.ONE * 1.28
		model.rotation = Vector3(0.0, PI, 0.0)
		vm_models[id] = model
	if vm_mounted != null and is_instance_valid(vm_mounted):
		vm_holder.remove_child(vm_mounted)
	vm_mounted = model
	vm_holder.add_child(model)
	muzzle_node = model.get_node_or_null("muzzle")
	if id == "pistol":
		vm_arm_r.position = Vector3(0.045, -0.115, 0.04)
		vm_arm_l.position = Vector3(-0.035, -0.12, 0.06)
	elif id == "shotgun":
		vm_arm_r.position = Vector3(0.05, -0.12, 0.02)
		vm_arm_l.position = Vector3(-0.03, -0.13, 0.50)
	elif id == "dmr":
		vm_arm_r.position = Vector3(0.05, -0.12, 0.0)
		vm_arm_l.position = Vector3(-0.03, -0.12, 0.42)
	else:
		vm_arm_r.position = Vector3(0.05, -0.12, 0.0)
		vm_arm_l.position = Vector3(-0.03, -0.13, 0.34)


func play_reload(dur: float) -> void:
	vm_reload_t = 0.0
	vm_reload_dur = dur if dur > 0.0 else 1.6


func add_recoil(amount: float) -> void:
	vm_recoil = minf(0.16, vm_recoil + amount * 0.55)
	vm_recoil_rot = minf(0.5, vm_recoil_rot + amount * 3.4)
	vm_sway.x += (randf() - 0.5) * amount * 1.6
	vm_sway.y += amount * 1.1


func muzzle_pos() -> Vector3:
	if muzzle_node != null and is_instance_valid(muzzle_node):
		return muzzle_node.global_position
	return ray_origin()


## ------------------------------- стрельба --------------------------------
func can_fire() -> bool:
	if not alive or reloading:
		return false
	if ammo_in_mag <= 0 or fire_timer > 0.0:
		return false
	return game.state == "playing"


func fire() -> void:
	var w := weapon()
	fire_timer = 60.0 / float(w["rpm"])
	ammo_in_mag -= 1
	shots += 1
	save_ammo()
	spread_heat = minf(1.6, spread_heat + (0.22 if bool(w["auto"]) else 0.4))

	var move_factor: float = minf(1.8, Vector2(vx, vz).length() / 3.4)
	var air_factor: float = 2.6 if y > 0.15 else 1.0
	var base_spread: float = float(w["ads_spread"]) if ads else float(w["spread"])
	var spread: float = base_spread * (1.0 + move_factor * 0.9 + spread_heat * 0.55) \
		* (0.72 if crouch else 1.0) * air_factor

	var origin := ray_origin()
	var dir_base := ray_direction()
	var right := Vector3(cos(yaw), 0.0, -sin(yaw))
	var pellets: int = int(w["pellets"])
	for p in pellets:
		var rx: float = (randf() - 0.5) * 2.0 * spread
		var ry: float = (randf() - 0.5) * 2.0 * spread
		var dir: Vector3 = (dir_base + right * rx + Vector3.UP * ry).normalized()
		game.player_bullet(origin, dir, w)

	var recoil_mul: float = (0.78 if crouch else 1.0) * (0.65 if ads else 1.0) \
		* (0.5 if ads and bool(w["scope"]) else 1.0)
	pitch += float(w["recoil"]) * 0.42 * recoil_mul
	yaw += (randf() - 0.5) * float(w["recoil"]) * 0.5 * recoil_mul
	recoil_pitch = minf(0.16, recoil_pitch + float(w["recoil"]) * 0.9 * recoil_mul)
	kick = 1.0
	game.kick(float(w["kick"]))
	add_recoil(float(w["kick"]) * 2.4)
	game.audio.gunshot(str(w["sound"]), x, z, 1.0)
	game.fx.muzzle_flash(muzzle_pos(), 0.7 if ads else 1.0)
	game.fx.casing(origin + right * 0.2 + Vector3(0, -0.1, 0), right)
	game.audio.casing()
	game.alert_enemies(x, z, 34.0)
	if ammo_in_mag == 0 and reserve > 0:
		start_reload()
	elif ammo_in_mag == 0:
		game.audio.dry_fire()


func start_reload() -> void:
	var w := weapon()
	if reloading or ammo_in_mag >= int(w["mag"]) or reserve <= 0:
		return
	reloading = true
	reload_timer = float(w["reload"])
	save_ammo()
	game.audio.reload_sfx(x, z)
	play_reload(float(w["reload"]))


func finish_reload() -> void:
	var w := weapon()
	var need: int = int(w["mag"]) - ammo_in_mag
	var take: int = mini(need, reserve)
	ammo_in_mag += take
	reserve -= take
	reloading = false
	save_ammo()


## ------------------------------ движение --------------------------------
func update(dt: float, inp: Dictionary, game_ref) -> void:
	game = game_ref
	if not alive:
		death_anim += dt
		return
	var w := weapon()
	var inp_forward: float = float(inp.get("forward", 0.0))
	var inp_strafe: float = float(inp.get("strafe", 0.0))
	var want_sprint: bool = bool(inp.get("sprint", false)) and inp_forward > 0.0 \
		and not ads and not crouch
	if want_sprint and stamina > 1.0 and not exhausted:
		sprint = true
		stamina -= dt * 17.0
		if stamina <= 1.0:
			exhausted = true
			sprint = false
	else:
		sprint = false
		stamina = minf(max_stamina, stamina + dt * (26.0 if crouch else 13.0))
		if stamina > 32.0:
			exhausted = false
	crouch_t = _damp(crouch_t, 1.0 if bool(inp.get("crouch", false)) else 0.0, 12.0, dt)
	crouch = crouch_t > 0.5

	var speed_walk: float = 4.3 * (0.48 if crouch else 1.0) * (0.55 if ads else 1.0)
	var speed_run: float = 7.9 * (0.4 if crouch else 1.0)
	var target_speed: float = speed_run if sprint else speed_walk
	var sn: float = sin(yaw)
	var cs: float = cos(yaw)
	var dx := 0.0
	var dz := 0.0
	if inp_forward != 0.0:
		dx += sn * inp_forward
		dz += cs * inp_forward
	if inp_strafe != 0.0:
		dx += cs * inp_strafe
		dz += -sn * inp_strafe
	var mag: float = sqrt(dx * dx + dz * dz)
	if mag > 0.0:
		dx /= mag
		dz /= mag
	var accel: float = 4.0 if y > 0.05 else 16.0
	vx = _damp(vx, dx * target_speed, accel, dt)
	vz = _damp(vz, dz * target_speed, accel, dt)
	var px: float = x
	var pz: float = z
	x += vx * dt
	z += vz * dt
	var res: Dictionary = game.world.resolve_circle(Vector2(x, z), radius)
	var pos: Vector2 = res["pos"]
	x = pos.x
	z = pos.y

	var moved: float = Vector2(x - px, z - pz).length()
	var speed: float = moved / maxf(0.0001, dt)
	bob_amt = _damp(bob_amt, minf(1.0, speed / 4.5), 8.0, dt)
	bob += dt * (speed * 2.1 + 0.6)
	step_accum += moved
	var step_len: float = 1.9 if sprint else (1.1 if crouch else 2.3)
	if step_accum > step_len:
		step_accum = 0.0
		game.audio.footstep(x, z, 0.55 if sprint else (0.22 if crouch else 0.4))
		game.alert_enemies(x, z, 16.0 if sprint else 9.0)

	var target_eye: float = 1.06 if crouch else 1.62
	eye_height = _damp(eye_height, target_eye, 14.0, dt)
	y = 0.0
	cam_bob = sin(bob) * 0.026 * bob_amt * (0.25 if ads else 1.0)
	cam_bob_side = cos(bob * 0.5) * 0.022 * bob_amt * (0.2 if ads else 1.0)
	roll = _damp(roll, -inp_strafe * 0.028 - recoil_yaw * 0.4, 8.0, dt)

	if game.time - last_damage_time > 6.0 and hp < max_hp:
		hp = minf(max_hp, hp + dt * 5.5)
	recoil_pitch = _damp(recoil_pitch, 0.0, 7.0, dt)
	recoil_yaw = _damp(recoil_yaw, 0.0, 8.0, dt)
	spread_heat = _damp(spread_heat, 0.0, 3.2, dt)
	kick = _damp(kick, 0.0, 12.0, dt)
	if fire_timer > 0.0:
		fire_timer -= dt
	if semi_latch > 0.0:
		semi_latch -= dt
	if reloading:
		reload_timer -= dt
		if reload_timer <= 0.0:
			finish_reload()
	ads = bool(inp.get("ads", false)) and not sprint and not reloading
	scoped = ads and bool(w["scope"])
	var fov_target: float = float(w["ads_fov"]) if ads else (84.0 if sprint else 78.0)
	fov = _damp(fov, fov_target, 12.0, dt)
	if hit_flash > 0.0:
		hit_flash -= dt * 2.4


func take_damage(amount: float, game_ref, from, kind: String) -> void:
	game = game_ref
	if not alive:
		return
	var dmg: float = amount
	if armor > 0.0:
		var absorbed: float = minf(armor, dmg * 0.55)
		armor -= absorbed
		dmg -= absorbed
	hp -= dmg
	damage_taken += amount
	last_damage_time = game.time
	hit_flash = 1.0
	if from != null and from != self:
		hit_direction = atan2(from.x - x, from.z - z)
	game.audio.hurt()
	game.ui_damage(from, kind, amount)
	if hp <= 0.0:
		hp = 0.0
		alive = false
		death_anim = 0.0
		game.on_player_death()


## --------------------------- позиции прицела ----------------------------
func ray_origin() -> Vector3:
	return Vector3(x, eye_height + cam_bob, z)


func ray_direction() -> Vector3:
	var p: float = clampf(pitch, -1.45, 1.45)
	var cp: float = cos(p)
	return Vector3(sin(yaw) * cp, sin(p), cos(yaw) * cp).normalized()


## --------------------------- viewmodel-кадр -----------------------------
func tick_viewmodel(dt: float, params: Dictionary) -> void:
	if vm_rig == null:
		return
	var moving: float = float(params.get("moving", 0.0))
	var ads_target: float = 1.0 if bool(params.get("ads", false)) else 0.0
	vm_ads = lerpf(vm_ads, ads_target, minf(1.0, dt * 14.0))
	var lower_target: float = 1.0 if bool(params.get("sprint", false)) and moving > 0.5 else 0.0
	vm_lowered = lerpf(vm_lowered, lower_target, minf(1.0, dt * 8.0))

	vm_recoil *= exp(-dt * 12.0)
	vm_recoil_rot *= exp(-dt * 10.0)
	vm_bob += dt * (6.0 + moving * 5.5)
	var bob_x: float = sin(vm_bob) * 0.008 * moving * (1.0 - vm_ads * 0.75)
	var bob_y: float = absf(cos(vm_bob)) * 0.010 * moving * (1.0 - vm_ads * 0.8)
	vm_sway.x = lerpf(vm_sway.x, 0.0, minf(1.0, dt * 9.0))
	vm_sway.y = lerpf(vm_sway.y, 0.0, minf(1.0, dt * 9.0))

	var hip := Vector3(0.115, -0.115, 0.02)
	var ads_p := Vector3(0.0, -0.055, 0.02)
	var base: Vector3 = hip.lerp(ads_p, vm_ads)
	var px: float = base.x + bob_x + vm_sway.x * 0.12
	var py: float = base.y + bob_y + vm_sway.y * 0.08 - 0.12 * vm_lowered
	var pz: float = base.z - vm_recoil * 0.35
	var rx: float = -vm_recoil_rot * 0.22 + 0.55 * vm_lowered - vm_sway.y * 0.5
	var ry: float = -vm_sway.x * 1.2
	var rz := 0.0

	if vm_reload_t < vm_reload_dur:
		vm_reload_t += dt
		var t: float = minf(1.0, vm_reload_t / maxf(0.05, vm_reload_dur))
		var arc: float = sin(t * PI)
		py -= arc * 0.13
		rx -= arc * 0.4
		rz += sin(t * PI * 2.0) * 0.32
		px += arc * 0.02
		if vm_arm_l != null:
			vm_arm_l.position.z = 0.34 - arc * 0.18
			vm_arm_l.position.y = -0.13 + sin(t * PI * 3.0) * 0.03
	elif vm_arm_l != null:
		if vm_current == "pistol":
			vm_arm_l.position = Vector3(-0.035, -0.12, 0.06)
		elif vm_current == "shotgun":
			vm_arm_l.position = Vector3(-0.03, -0.13, 0.50)
		elif vm_current == "dmr":
			vm_arm_l.position = Vector3(-0.03, -0.12, 0.42)
		else:
			vm_arm_l.position = Vector3(-0.03, -0.13, 0.34)

	vm_rig.position = Vector3(px, py, pz)
	vm_rig.rotation = Vector3(rx, ry, rz)
	vm_root.visible = not bool(params.get("hidden", false))
