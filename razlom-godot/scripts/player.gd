class_name RazlomPlayer
extends CharacterBody3D
var game
var camera: Camera3D
var gun: Node3D
var weapon_motion: RazlomWeaponMotion
var left_arm: RazlomArmRig
var right_arm: RazlomArmRig
var reflex_time := 0.0
var death_tween: Tween
var shot_bloom := 0.0
var shock_blend := 0.0
var healing_time := 0.0
var bandage: Node3D
var scanner: Node3D
var cooldown := 0.0
var reload_time := 0.0
var recoil := 0.0
var bob := 0.0
var movement_blend := 0.0
var hurt_blend := 0.0
var last_health := 100.0
var draw_time := 0.35
var motion_state := "draw"
var look_sway := Vector2.ZERO
var landing := 0.0
var grounded_last := true
var pending_look := Vector2.ZERO
var aiming := false
var light: SpotLight3D
var footstep := 0.0
var crouched := false
var capsule: CapsuleShape3D
var collider: CollisionShape3D

func _ready() -> void:
	last_health = game.state.health
	collision_layer = 2
	collision_mask = 1 | 4 | 16
	collider = CollisionShape3D.new()
	capsule = CapsuleShape3D.new()
	capsule.radius = 0.32
	capsule.height = 1.75
	collider.shape = capsule
	collider.position.y = 0.9
	add_child(collider)
	camera = Camera3D.new()
	camera.position.y = 1.6
	camera.fov = 78
	camera.far = 180
	camera.current = true
	add_child(camera)
	var model: PackedScene = load("res://assets/models/carbine.tscn")
	gun = model.instantiate()
	camera.add_child(gun)
	gun.scale = Vector3.ONE * 0.85
	gun.position = Vector3(0.2, -0.21, -0.6)
	weapon_motion = RazlomWeaponMotion.new(gun)
	bandage = RazlomArt.box(gun.get_node("LeftHand"), Vector3(0, 0.035, 0), Vector3(0.055, 0.05, 0.09), RazlomArt.material(Color("dedbc4")))
	bandage.hide()
	scanner = Node3D.new()
	gun.get_node("LeftHand").add_child(scanner)
	RazlomArt.box(scanner, Vector3(0, 0.06, 0), Vector3(0.08, 0.12, 0.055), RazlomArt.material(Color("45554a"), "metal"))
	RazlomArt.box(scanner, Vector3(0, 0.07, -0.03), Vector3(0.05, 0.05, 0.01), RazlomArt.material(Color("8bbfa1"), "", 0.5))
	RazlomArt.box(scanner, Vector3(0.02, 0.15, 0), Vector3(0.008, 0.1, 0.008), RazlomArt.material(Color("555c50")))
	scanner.hide()
	gun.get_node("LeftHand/Sleeve").hide()
	gun.get_node("RightHand/Sleeve").hide()
	left_arm = RazlomArmRig.new(camera)
	right_arm = RazlomArmRig.new(camera)
	light = SpotLight3D.new()
	light.position = Vector3(0.12, -0.1, -0.15)
	light.light_color = Color("dce4ba")
	light.light_energy = 3
	light.spot_range = 24
	light.spot_angle = 28
	light.shadow_enabled = false
	light.visible = false
	camera.add_child(light)

func _unhandled_input(event: InputEvent) -> void:
	if not game.ended and event is InputEventMouseMotion and not game.mobile_mode and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		look_sway += Vector2(-event.relative.x, event.relative.y).limit_length(25.0) * 0.0002
		rotate_y(-event.relative.x * game.sensitivity * game.look_scale)
		camera.rotation.x = clampf(camera.rotation.x - event.relative.y * game.sensitivity * game.look_scale, -1.45, 1.45)

func _physics_process(delta: float) -> void:
	if game.ended:
		return
	if game.state.health < last_health - 0.1:
		on_hurt()
	last_health = game.state.health
	reflex_time = maxf(0, reflex_time - delta)
	shot_bloom = move_toward(shot_bloom, 0, delta * 0.014)
	shock_blend = move_toward(shock_blend, 0, delta * 1.4)
	healing_time = maxf(0, healing_time - delta)
	bandage.visible = healing_time > 0
	scanner.visible = game.quests.scan_time > 0
	draw_time = maxf(0.0, draw_time - delta)
	hurt_blend = move_toward(hurt_blend, 0.0, delta * 3.0)
	if Input.is_action_just_pressed("crouch"):
		if not crouched:
			set_crouched(true)
		elif can_stand():
			set_crouched(false)
		else:
			game.notify("Недостаточно места, чтобы встать")
	camera.position.y = move_toward(camera.position.y, 1.03 if crouched else 1.6, delta * 4)
	if Input.is_action_just_pressed("reload") and game.state.left_arm_wound < 30 and reflex_time <= 0 and reload_time <= 0 and game.state.ammo < 18 and game.state.reserve > 0:
		reload_time = 1.4
	cooldown = maxf(0, cooldown - delta)
	recoil = move_toward(recoil, 0, delta * 0.8)
	if reload_time > 0:
		reload_time -= delta
		if reload_time <= 0:
			game.state.reload_gun()
	var input := Input.get_vector("left", "right", "forward", "back")
	if game.mobile_mode and is_instance_valid(game.touch_ui):
		input = (input + game.touch_ui.movement).limit_length(1)
	aiming = Input.is_action_pressed("aim") and game.state.left_arm_wound < 30 and reflex_time <= 0
	var running: bool = (Input.is_action_pressed("sprint") or (game.mobile_mode and input.length() > 0.95)) and input.length() > 0.1 and game.state.stamina > 5 and not aiming and not crouched
	var speed := 6.6 if running else 3.8
	if aiming:
		speed = 2.1
	if crouched:
		speed = 1.9
	if game.state.fatigue > 85 or game.state.warmth < 10:
		speed *= 0.72
	speed *= 1.0 - game.state.leg_wound * 0.004
	var direction := transform.basis * Vector3(input.x, 0, input.y)
	velocity.x = move_toward(velocity.x, direction.x * speed, delta * 24)
	velocity.z = move_toward(velocity.z, direction.z * speed, delta * 24)
	if not is_on_floor():
		velocity.y -= delta * 18
	elif Input.is_action_just_pressed("jump"):
		velocity.y = 5.5
	var falling_speed := velocity.y
	move_and_slide()
	if is_on_floor() and not grounded_last:
		landing = clampf(-falling_speed * 0.009, 0.0, 0.08)
	grounded_last = is_on_floor()
	landing = move_toward(landing, 0.0, delta * 0.24)
	for i in range(get_slide_collision_count()):
		var collision := get_slide_collision(i)
		var object: Object = collision.get_collider()
		if object is RigidBody3D and not object.freeze:
			object.apply_central_impulse(-collision.get_normal() * speed * delta * 8)
	game.state.tick(delta, running, game.is_sheltered(global_position))
	if Input.is_action_just_pressed("flashlight"):
		light.visible = not light.visible
	footstep -= delta
	if input.length() > 0.1 and is_on_floor() and footstep <= 0:
		footstep = 0.3 if running else 0.53
		game.noise(global_position, 2 if crouched else (13 if running else 5))
		game.play_tone(85, 0.035, 0.025)
	movement_blend = lerpf(movement_blend, clampf(Vector2(velocity.x, velocity.z).length() / 3.8, 0.0, 1.6), 1.0 - exp(-delta * 12.0))
	bob += delta * (9.0 if running else 6.0) * movement_blend
	look_sway = look_sway.lerp(Vector2.ZERO, 1.0 - exp(-delta * 14.0))
	var reload_blend := sin(clampf(reload_time / 1.4, 0.0, 1.0) * PI)
	var anchor := Vector3(0, -0.09, -0.48) if aiming else Vector3(0.2, -0.21, -0.6)
	if game.quests.scan_time > 0:
		anchor.y -= 0.14
	anchor.y -= sin(clampf(healing_time / 1.2, 0, 1) * PI) * 0.16
	anchor.y += reload_blend * 0.08 - smoothstep(0.0, 0.35, draw_time) * 0.2
	var tremor: float = sin(Time.get_ticks_msec() * 0.027) * game.state.pain * 0.00008 + sin(Time.get_ticks_msec() * 0.09) * shock_blend * 0.04
	anchor.x += tremor
	var breath := sin(Time.get_ticks_msec() * 0.0018) * (0.001 if aiming else 0.003)
	gun.position = gun.position.lerp(anchor + Vector3(sin(bob) * (0.003 if aiming else 0.023) * movement_blend + look_sway.x, absf(cos(bob)) * (0.003 if aiming else 0.018) * movement_blend + breath - landing - hurt_blend * 0.035, recoil + hurt_blend * 0.035), 1.0 - exp(-delta * 14.0))
	gun.rotation.x = lerp_angle(gun.rotation.x, 0.18 * reload_blend + recoil * 2.4 - (0.3 if running else 0.0) + hurt_blend * 0.1 + look_sway.y, 1.0 - exp(-delta * 18.0))
	gun.rotation.z = lerp_angle(gun.rotation.z, -0.48 * reload_blend - input.x * (0.01 if aiming else 0.065) + sin(bob) * movement_blend * 0.02 + hurt_blend * 0.09, 1.0 - exp(-delta * 12.0))
	motion_state = "draw" if draw_time > 0 else ("hurt" if hurt_blend > 0.1 else ("reload" if reload_time > 0 else ("shoot" if recoil > 0.02 else ("run" if running else ("walk" if movement_blend > 0.1 else ("aim" if aiming else "idle"))))))
	weapon_motion.advance(reload_time, recoil, delta)
	if healing_time > 0:
		var reach := sin(clampf(healing_time / 1.2, 0, 1) * PI)
		weapon_motion.support_hand.position = weapon_motion.hand_rest.origin.lerp(Vector3(-0.15, -0.06, 0.1), reach)
		weapon_motion.support_hand.rotation.z = reach * 0.8
	if game.quests.scan_time > 0:
		weapon_motion.support_hand.position = Vector3(-0.2, 0.08, -0.15)
		weapon_motion.support_hand.rotation.x = -0.3 + sin(game.quests.scan_time * 4) * 0.025
	if game.state.left_arm_wound >= 30:
		weapon_motion.support_hand.position += Vector3(-0.12, -0.25, 0.1)
		weapon_motion.support_hand.rotation.z = -0.7 + sin(bob * 2) * 0.04
	if game.state.right_arm_wound >= 30:
		gun.rotation.z += sin(Time.get_ticks_msec() * 0.018) * 0.008
		gun.position.y -= 0.025
	camera.rotation.z = lerp_angle(camera.rotation.z, -input.x * 0.025 + hurt_blend * 0.045 + tremor, 1.0 - exp(-delta * 9.0))
	camera.fov = lerpf(camera.fov, 60.0 if aiming else 78.0, delta * 10)
	if Input.is_action_pressed("fire") and can_fire() and healing_time <= 0 and cooldown <= 0 and reload_time <= 0 and (game.mobile_mode or Input.mouse_mode == Input.MOUSE_MODE_CAPTURED):
		if game.state.ammo > 0:
			game.state.ammo -= 1
			cooldown = 0.19
			recoil = 0.09
			game.fire()
		else:
			cooldown = 0.4
			game.notify("Пусто. R — перезарядить")
	if Input.is_action_just_pressed("interact"):
		game.interact()
	if Input.is_action_just_pressed("charge"):
		game.throw_charge()
	if Input.is_action_just_pressed("heal"):
		begin_heal()
	if Input.is_action_just_pressed("eat"):
		game.state.use_item("food")
	if Input.is_action_just_pressed("drink"):
		game.state.use_item("water")

func set_crouched(value: bool) -> void:
	crouched = value
	capsule.height = 1.15 if crouched else 1.75
	collider.position.y = capsule.height * 0.5 + 0.025

func can_stand() -> bool:
	var shape := CapsuleShape3D.new()
	shape.radius = 0.32
	shape.height = 1.75
	var query := PhysicsShapeQueryParameters3D.new()
	query.shape = shape
	query.transform = Transform3D(Basis.IDENTITY, global_position + Vector3.UP * 0.9)
	query.collision_mask = collision_mask
	query.exclude = [get_rid()]
	return get_world_3d().direct_space_state.intersect_shape(query, 1).is_empty()

func touch_look(relative: Vector2) -> void:
	if game.mobile_mode and not get_tree().paused:
		# Accumulate displacement, not event-rate-dependent velocity.
		var reference := 390.0 / maxf(1.0, minf(get_viewport().get_visible_rect().size.x, get_viewport().get_visible_rect().size.y))
		look_sway += Vector2(-relative.x, relative.y).limit_length(25.0) * 0.0002
		pending_look += relative * 0.004 * game.look_scale * reference

func reset_touch_look() -> void:
	pending_look = Vector2.ZERO
	look_sway = Vector2.ZERO

func advance_touch_look(delta: float) -> void:
	# Render-time exponential smoothing; event packet size cannot change total turn.
	var step := pending_look * (1.0 - exp(-minf(delta, 0.05) / 0.025))
	pending_look -= step
	rotate_y(-step.x)
	camera.rotation.x = clampf(camera.rotation.x - step.y, -1.45, 1.45)
	if pending_look.length_squared() < 0.0000000001:
		pending_look = Vector2.ZERO

func _process(delta: float) -> void:
	if is_instance_valid(gun):
		left_arm.solve(Vector3(-0.18, -0.28, 0.02), camera.to_local(gun.get_node("LeftHand").global_position), -1.0)
		right_arm.solve(Vector3(0.22, -0.28, 0.04), camera.to_local(gun.get_node("RightHand").global_position), 1.0)
	if game.mobile_mode and not game.ended:
		advance_touch_look(delta)

func on_shot() -> void:
	if game.quests.scan_time > 0:
		game.quests.scan_time = 0
		game.notify("Замер прерван стрельбой")
	shot_bloom = minf(0.025, shot_bloom + 0.0035)
	recoil = 0.09
	# Immediate response on the actual shot, not after the next physics tick.
	gun.position.z += 0.025
	gun.rotation.x += 0.035
	weapon_motion.trigger_shot()

func on_hurt() -> void:
	hurt_blend = 1.0
	if is_instance_valid(game.combat_feedback):
		game.combat_feedback.hurt_time = 0.35

func receive_bullet(point: Vector3, source: Vector3, power: float = 36.0) -> void:
	if game.ended or game.state.health <= 0:
		return
	var zone := RazlomBallistics.region(to_local(point), crouched)
	var key := "helmet" if zone == "head" else "armor"
	var result := RazlomBallistics.resolve(zone, power, float(game.state.get(key)))
	game.state.set(key, maxf(0, float(game.state.get(key)) - float(result.wear)))
	game.state.health = maxf(0, game.state.health - float(result.damage))
	game.state.pain = minf(100, game.state.pain + float(result.damage) * 1.5)
	if zone == "arms":
		var arm_key := "left_arm_wound" if to_local(point).x < 0 else "right_arm_wound"
		game.state.set(arm_key, minf(100, float(game.state.get(arm_key)) + 40))
		reflex_time = 0.7
		reload_time = 0
	RazlomBloodFX.spawn(game, point, (source - point).normalized())
	if zone == "legs":
		game.state.leg_wound = minf(100, game.state.leg_wound + 35)
	on_hurt()
	last_health = game.state.health
	game.combat_feedback.injury(zone, to_local(source), game.state.pain, result.fatal)
	game.notify(game.combat_feedback.injury_text + ("" if result.fatal else " • H — аптечка, ищи укрытие"))

func begin_heal() -> bool:
	if healing_time > 0 or reload_time > 0 or not game.state.use_item("heal"):
		return false
	healing_time = 1.2
	return true

func spread_angle() -> float:
	var speed := Vector2(velocity.x, velocity.z).length()
	var base := 0.0015 if aiming else 0.008
	if crouched:
		base *= 0.65
	return base + (game.state.left_arm_wound + game.state.right_arm_wound) * 0.00008 + speed * (0.0015 if aiming else 0.0025) + shot_bloom + game.state.pain * 0.00006

func sample_shot_direction(rng: RandomNumberGenerator) -> Vector3:
	# Uniform disk in camera tangent plane, not square independent axis offsets.
	var radius := sqrt(rng.randf()) * tan(spread_angle())
	var angle := rng.randf() * TAU
	return (-camera.global_basis.z + camera.global_basis.x * cos(angle) * radius + camera.global_basis.y * sin(angle) * radius).normalized()

func can_fire() -> bool:
	return not game.ended and reflex_time <= 0 and game.state.right_arm_wound < 60

func begin_death() -> void:
	gun.hide()
	left_arm.set_visible(false)
	right_arm.set_visible(false)
	if death_tween != null: death_tween.kill()
	death_tween = create_tween().set_parallel(true)
	death_tween.tween_property(camera, "position", Vector3(0.18, 0.24, 0), 0.4)
	death_tween.tween_property(camera, "rotation:z", 1.3, 0.4)

func reset_death_pose() -> void:
	if death_tween != null: death_tween.kill()
	camera.position = Vector3(0, 1.6, 0)
	camera.rotation.z = 0
	gun.show()
	left_arm.set_visible(true)
	right_arm.set_visible(true)
	reflex_time = 0
