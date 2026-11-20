class_name RazlomPlayer
extends CharacterBody3D
var game
var camera: Camera3D
var gun: Node3D
var cooldown := 0.0
var reload_time := 0.0
var recoil := 0.0
var bob := 0.0
var aiming := false
var light: SpotLight3D
var footstep := 0.0
var crouched := false
var capsule: CapsuleShape3D
var collider: CollisionShape3D

func _ready() -> void:
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
	gun.position = Vector3(0.27, -0.29, -0.48)
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
	if event is InputEventMouseMotion and not game.mobile_mode and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		rotate_y(-event.relative.x * game.sensitivity)
		camera.rotation.x = clampf(camera.rotation.x - event.relative.y * game.sensitivity, -1.45, 1.45)

func _physics_process(delta: float) -> void:
	if game.ended:
		return
	if Input.is_action_just_pressed("crouch"):
		if not crouched:
			set_crouched(true)
		elif can_stand():
			set_crouched(false)
		else:
			game.notify("Недостаточно места, чтобы встать")
	camera.position.y = move_toward(camera.position.y, 1.03 if crouched else 1.6, delta * 4)
	if Input.is_action_just_pressed("reload") and reload_time <= 0 and game.state.ammo < 18 and game.state.reserve > 0:
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
	aiming = Input.is_action_pressed("aim")
	var running: bool = (Input.is_action_pressed("sprint") or (game.mobile_mode and input.length() > 0.95)) and input.length() > 0.1 and game.state.stamina > 5 and not aiming and not crouched
	var speed := 6.6 if running else 3.8
	if aiming:
		speed = 2.1
	if crouched:
		speed = 1.9
	if game.state.fatigue > 85 or game.state.warmth < 10:
		speed *= 0.72
	var direction := transform.basis * Vector3(input.x, 0, input.y)
	velocity.x = move_toward(velocity.x, direction.x * speed, delta * 24)
	velocity.z = move_toward(velocity.z, direction.z * speed, delta * 24)
	if not is_on_floor():
		velocity.y -= delta * 18
	elif Input.is_action_just_pressed("jump"):
		velocity.y = 5.5
	move_and_slide()
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
	bob += delta * speed * input.length()
	var reload_blend := sin(clampf(reload_time / 1.4, 0.0, 1.0) * PI)
	var anchor := Vector3(0.12, -0.22, -0.42) if aiming else Vector3(0.27, -0.29, -0.48)
	gun.position = gun.position.lerp(anchor + Vector3(0, sin(bob * 2) * 0.009 * input.length(), recoil), 1.0 - exp(-delta * 14.0))
	gun.rotation.x = lerp_angle(gun.rotation.x, -0.6 * reload_blend + recoil * 2, 1.0 - exp(-delta * 18.0))
	gun.rotation.z = lerp_angle(gun.rotation.z, -0.18 * reload_blend, 1.0 - exp(-delta * 12.0))
	camera.fov = lerpf(camera.fov, 60.0 if aiming else 78.0, delta * 10)
	if Input.is_action_pressed("fire") and cooldown <= 0 and reload_time <= 0 and (game.mobile_mode or Input.mouse_mode == Input.MOUSE_MODE_CAPTURED):
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
		game.state.use_item("heal")
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
		rotate_y(-relative.x * 0.004)
		camera.rotation.x = clampf(camera.rotation.x - relative.y * 0.004, -1.45, 1.45)
