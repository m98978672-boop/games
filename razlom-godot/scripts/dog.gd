extends CharacterBody3D
## First animal prototype: trust, following, waiting and fleeing. Rule-based.
var game
var trust := 0
var following := false
var waiting := false
var health := 60.0
var frightened := 0.0
var danger := Vector3.ZERO
var phase := 0.0
var timer := 0.0
var waypoint := Vector3.ZERO
var home := Vector3(-19, 0.3, 25)
var motion: RazlomActorMotion
var visual: Node3D

func _ready() -> void:
	collision_layer = 16
	collision_mask = 1 | 2 | 4
	var model: PackedScene = load("res://assets/models/dog.tscn")
	visual = model.instantiate()
	add_child(visual)
	motion = RazlomActorMotion.new(visual, true)
	var col := CollisionShape3D.new()
	var shape := CapsuleShape3D.new()
	shape.radius = 0.25
	shape.height = 0.85
	col.shape = shape
	col.position.y = 0.45
	add_child(col)
	set_meta("use", "dog")
	set_meta("title", "Собака • предложить еду")

func befriend() -> bool:
	if trust >= 2:
		waiting = not waiting
		set_meta("title", "Собака • следовать" if waiting else "Собака • ждать")
		game.notify("Собака ждёт здесь" if waiting else "Собака идёт за тобой")
		return true
	if game.state.food <= 0:
		game.notify("Чтобы завоевать доверие, нужна еда")
		return false
	game.state.food -= 1
	trust += 1
	following = trust >= 2
	if following:
		set_meta("title", "Собака • ждать")
	game.notify("Теперь она идёт за тобой" if following else "Собака перестала пятиться. Ещё один мирный контакт")
	return true

func hear(source: Vector3, radius: float) -> void:
	if trust < 2 and global_position.distance_to(source) < radius:
		danger = source
		frightened = 6

func _physics_process(delta: float) -> void:
	if game.ended:
		return
	phase += delta
	frightened = maxf(0, frightened - delta)
	var target := home + Vector3(sin(phase * 0.2) * 2, 0, cos(phase * 0.2) * 2)
	if following:
		target = global_position if waiting else game.player.global_position + Vector3(1.5, 0, 1.5)
	if frightened > 0:
		target = global_position + (global_position - danger).normalized() * 5
	timer -= delta
	if timer <= 0:
		timer = 0.65
		waypoint = game.next_waypoint(global_position, target)
	var direction := waypoint - global_position
	direction.y = 0
	var speed := 4.8 if frightened > 0 else 2.6
	if target.distance_to(global_position) > 1 and direction.length() > 0.2:
		direction = direction.normalized()
		velocity.x = direction.x * speed
		velocity.z = direction.z * speed
		visual.rotation.y = atan2(-direction.x, -direction.z)

	else:
		velocity.x = 0
		velocity.z = 0
	velocity.y = 0 if is_on_floor() else velocity.y - delta * 18
	move_and_slide()
	motion.advance(delta, Vector2(velocity.x, velocity.z).length())

func hit(amount: float, _impulse: Vector3 = Vector3.ZERO) -> void:
	health = maxf(0, health - amount)
	danger = game.player.global_position
	frightened = 12
	following = false
	trust = 0
	if health <= 0:
		queue_free()

func snapshot() -> Dictionary:
	return {"present": true, "health": health, "trust": trust, "following": following, "waiting": waiting,
		"position": [position.x, position.y, position.z]}

func restore(data: Dictionary) -> void:
	health = float(data.health)
	trust = int(data.trust)
	following = data.following
	waiting = data.waiting
	position = Vector3(data.position[0], data.position[1], data.position[2])
	if trust >= 2:
		set_meta("title", "Собака • следовать" if waiting else "Собака • ждать")
