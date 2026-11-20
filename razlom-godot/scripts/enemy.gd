class_name RazlomEnemy
extends CharacterBody3D
var game
var health := 100.0
var alert := false
var last_seen := Vector3.ZERO
var memory := 0.0
var cooldown := 0.0
var scan := 0.0
var home := Vector3.ZERO
var phase := 0.0
var motion: RazlomActorMotion
var visual: Node3D
var think_label: Label3D
var dead := false
var path_timer := 0.0
var waypoint := Vector3.ZERO

func _ready() -> void:
	collision_layer = 4
	collision_mask = 1 | 2 | 4
	var col := CollisionShape3D.new()
	var shape := CapsuleShape3D.new()
	shape.radius = 0.33
	shape.height = 1.8
	col.shape = shape
	col.position.y = 0.9
	add_child(col)
	visual = RazlomArt.humanoid(self)
	motion = RazlomActorMotion.new(visual)
	home = position
	last_seen = home
	think_label = RazlomArt.sign_text(self, "", Vector3(0, 2.25, 0), 24)
	think_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED

func sees_player() -> bool:
	if not is_instance_valid(game.player):
		return false
	var eye := global_position + Vector3.UP * 1.5
	var target: Vector3 = game.player.global_position + Vector3.UP * 1.2
	if eye.distance_to(target) > 24:
		return false
	var to_player := (target - eye).normalized()
	if not alert and eye.distance_to(target) > 3 and (-visual.global_basis.z).dot(to_player) < 0.3:
		return false
	var q := PhysicsRayQueryParameters3D.create(eye, target, 1 | 2)
	q.exclude = [get_rid()]
	var hit := get_world_3d().direct_space_state.intersect_ray(q)
	return not hit.is_empty() and hit.collider == game.player

func hear(source: Vector3, radius: float) -> void:
	if global_position.distance_to(source) <= radius:
		last_seen = source
		memory = 7
		alert = true

func _physics_process(delta: float) -> void:
	if dead or game.ended:
		return
	cooldown -= delta
	memory = maxf(0, memory - delta)
	scan -= delta
	if scan <= 0:
		scan = 0.22
		if sees_player():
			last_seen = game.player.global_position
			memory = 5
			alert = true
			if cooldown <= 0:
				cooldown = 1.3
				game.enemy_fire(self)
	if memory <= 0:
		alert = false
	phase += delta
	var target := last_seen if alert else home + Vector3(sin(phase * 0.25) * 3, 0, cos(phase * 0.25) * 3)
	path_timer -= delta
	if path_timer <= 0:
		path_timer = 0.45
		waypoint = game.next_waypoint(global_position, target)
	var direction := waypoint - global_position
	direction.y = 0
	if direction.length() > 0.25 and (not alert or global_position.distance_to(target) > 4.0):
		direction = direction.normalized()
		velocity.x = direction.x * (2.7 if alert else 1.1)
		velocity.z = direction.z * (2.7 if alert else 1.1)
		visual.rotation.y = atan2(-direction.x, -direction.z)
	else:
		velocity.x = 0
		velocity.z = 0
	if not is_on_floor():
		velocity.y -= 18 * delta
	move_and_slide()
	motion.advance(delta, Vector2(velocity.x, velocity.z).length(), alert)
	think_label.text = "!" if alert else ""
	think_label.modulate = Color("efb26a")

func hit(amount: float, _impulse: Vector3 = Vector3.ZERO) -> void:
	if dead:
		return
	health -= amount
	hear(game.player.global_position, 100)
	if health <= 0:
		dead = true
		game.state.kills += 1
		game.defeated.append(name)
		game.spawn_loot("ammo", global_position + Vector3.UP * 0.3, "Патроны • +18")
		queue_free()
