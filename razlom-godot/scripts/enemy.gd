class_name RazlomEnemy
extends CharacterBody3D
var game
var health := 100.0
var armor := 0.0
var helmet := 0.0
var aim_time := 0.0
var suppression := 0.0
var leg_wound := false
var alert := false
var last_seen := Vector3.ZERO
var awareness := RazlomAIMemory.new()
var behavior := "patrol"
var visible_contact := false
var report_cooldown := 0.0
var search_step := 0
var search_time := 0.0
var search_origin := Vector3.ZERO
var cooldown := 0.0
var scan := 0.0
var home := Vector3.ZERO
var phase := 0.0
var weapon_motion: RazlomWeaponMotion
var left_arm: RazlomArmRig
var right_arm: RazlomArmRig
var carried_weapon: Node3D
var motion: RazlomActorMotion
var visual: Node3D
var think_label: Label3D
var dead := false
var last_hit_region := "torso"
var impact_marks: Array[Node3D] = []
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
	visual.get_node("Weapon").hide()
	var weapon: Node3D = load("res://assets/models/carbine.tscn").instantiate()
	visual.get_node("ArmRJoint/ArmR").add_child(weapon)
	weapon.position = Vector3(-0.15, 0.09, -0.29)
	weapon.scale = Vector3.ONE * 0.65
	carried_weapon = weapon
	weapon.get_node("LeftHand/Sleeve").hide()
	weapon.get_node("RightHand/Sleeve").hide()
	visual.get_node("ArmRJoint/ArmR/Visual").hide()
	visual.get_node("ArmLJoint/ArmL/Visual").hide()
	left_arm = RazlomArmRig.new(visual)
	right_arm = RazlomArmRig.new(visual)
	weapon_motion = RazlomWeaponMotion.new(weapon)
	home = position
	last_seen = home
	think_label = RazlomArt.sign_text(self, "", Vector3(0, 2.25, 0), 24)
	think_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED

func sees_player() -> bool:
	if not is_instance_valid(game.player):
		return false
	var eye := global_position + Vector3.UP * 1.5
	var target: Vector3 = game.player.global_position + Vector3.UP * 1.2
	if eye.distance_to(target) > 65:
		return false
	var to_player := (target - eye).normalized()
	if eye.distance_to(target) > 3 and (-visual.global_basis.z).dot(to_player) < (0.0 if alert else 0.3):
		return false
	var q := PhysicsRayQueryParameters3D.create(eye, target, 1 | 2)
	q.exclude = [get_rid()]
	var hit := get_world_3d().direct_space_state.intersect_ray(q)
	return not hit.is_empty() and hit.collider == game.player

func hear(source: Vector3, radius: float) -> void:
	if global_position.distance_to(source) <= radius:
		awareness.observe(source, "sound", 0.65)
		if not visible_contact:
			last_seen = source
		alert = true

func receive_report(point: Vector3) -> void:
	awareness.observe(point, "radio", 0.55)
	alert = true

func remember_sighting(point: Vector3) -> void:
	last_seen = point
	awareness.observe(point, "sight", 1.0)
	search_step = 0
	search_time = 0
	search_origin = point
	alert = true
	if report_cooldown <= 0:
		report_cooldown = 4.0
		game.share_contact(self, point)

func choose_target(delta: float) -> Vector3:
	var contact := awareness.focus()
	if game.state.passage:
		alert = false
		behavior = "stand_down"
		return home
	if visible_contact:
		behavior = "engage"
		alert = true
		return last_seen
	if not contact.is_empty():
		alert = true
		last_seen = contact.point
		if search_origin.distance_to(last_seen) > 2.0:
			search_origin = last_seen
			search_step = 0
			search_time = 0
			behavior = "investigate"
		if global_position.distance_to(last_seen) > 1.8 and search_step == 0 and behavior != "search":
			behavior = "investigate"
			return last_seen
		behavior = "search"
		search_time += delta
		var angle := float(search_step) * 2.4
		var target := last_seen + Vector3(cos(angle), 0, sin(angle)) * 2.8
		if global_position.distance_to(target) < 1.0 or search_time > 5.0:
			search_step += 1
			search_time = 0
		if search_step >= 3:
			contact.cleared = true
			search_step = 0
		return target
	alert = false
	search_step = 0
	search_time = 0
	behavior = "return" if global_position.distance_to(home) > 2.0 else "patrol"
	return home if behavior == "return" else home + Vector3(sin(phase * 0.25) * 3, 0, cos(phase * 0.25) * 3)

func _physics_process(delta: float) -> void:
	if dead or game.ended:
		return
	cooldown -= delta
	suppression = maxf(0, suppression - delta)
	if visible_contact and not game.state.passage:
		aim_time = minf(2.5, aim_time + delta)
	else:
		aim_time = 0.0
	report_cooldown -= delta
	awareness.tick(delta)
	scan -= delta
	if scan <= 0:
		scan = 0.22
		visible_contact = sees_player()
		if visible_contact and not game.state.passage:
			remember_sighting(game.player.global_position)
			if cooldown <= 0 and aim_time >= 0.85 and suppression <= 0:
				cooldown = 1.1 + global_position.distance_to(game.player.global_position) * 0.012
				game.enemy_fire(self)
				aim_time = 0.35
	phase += delta
	var target := choose_target(delta)
	# Wounded guards withdraw only from a currently visible opponent.
	if visible_contact and health < 35 and not game.state.passage:
		var away: Vector3 = global_position - last_seen
		away.y = 0
		if away.length() > 0.1:
			target = global_position + away.normalized() * 5.0
			behavior = "withdraw"
	path_timer -= delta
	if path_timer <= 0:
		path_timer = 0.45
		waypoint = game.next_waypoint(global_position, target)
	var direction := waypoint - global_position
	direction.y = 0
	var stop_range := 28.0 if behavior == "engage" else 0.8
	if direction.length() > 0.25 and global_position.distance_to(target) > stop_range:
		direction = direction.normalized()
		velocity.x = direction.x * (2.7 if alert else 1.1) * (0.6 if leg_wound else 1.0)
		velocity.z = direction.z * (2.7 if alert else 1.1) * (0.6 if leg_wound else 1.0)
		visual.rotation.y = atan2(-direction.x, -direction.z)
	else:
		velocity.x = 0
		velocity.z = 0
	if visible_contact:
		var aim := last_seen - global_position
		visual.rotation.y = atan2(-aim.x, -aim.z)
	elif behavior == "search":
		visual.rotation.y += delta * 0.8
	if not is_on_floor():
		velocity.y -= 18 * delta
	move_and_slide()
	motion.advance(delta, Vector2(velocity.x, velocity.z).length(), visible_contact)
	if visible_contact:
		var offset: Vector3 = game.player.camera.global_position - (global_position + Vector3.UP * 1.4)
		var pitch := atan2(offset.y, Vector2(offset.x, offset.z).length())
		motion.joints.ArmR.rotation.x -= clampf(pitch, -0.5, 0.5)
		visual.get_node("Head").rotation.x = -clampf(pitch, -0.5, 0.5)
	if leg_wound:
		visual.rotation.z += sin(phase * 7.0) * 0.045
	weapon_motion.advance(0, motion.recoil * 0.09, delta)
	left_arm.solve(Vector3(-0.3, 1.3, 0), visual.to_local(carried_weapon.get_node("LeftHand").global_position), -1.0)
	right_arm.solve(Vector3(0.3, 1.3, 0), visual.to_local(carried_weapon.get_node("RightHand").global_position), 1.0)
	if visible_contact and aim_time < 0.85:
		think_label.text = "ЦЕЛИТСЯ"
	else:
		think_label.text = "ПРОХОДИ" if game.state.passage else ("ОТХОД" if behavior == "withdraw" else ("!" if behavior == "engage" else ("?" if alert else "")))
	think_label.modulate = Color("efb26a")

func hit(amount: float, _impulse: Vector3 = Vector3.ZERO) -> void:
	if dead:
		return
	health -= amount
	if amount > 0 and game.state.passage:
		game.state.passage = false
		game.state.passage_broken = true
		game.notify("Договор нарушен: охрана снова враждебна")
	motion.hurt()
	suppression = 0.65
	aim_time = 0.0
	# A hit is evidence of danger, not a magical coordinate of an unseen shooter.
	if sees_player():
		remember_sighting(game.player.global_position)
	else:
		awareness.observe(global_position, "damage", 0.8)
		alert = true
	if health <= 0:
		dead = true
		game.state.kills += 1
		game.defeated.append(name)
		game.spawn_loot("ammo", global_position + Vector3.UP * 0.3, "Патроны • +18")
		# Collision/AI disappear immediately; detached visual finishes its fall.
		visual.reparent(game.world, true)
		visual.set_meta("defeat_visual", true)
		var fall := visual.create_tween()
		fall.tween_property(visual, "rotation:z", -1.45, 0.32).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)
		fall.tween_interval(2.0)
		fall.tween_callback(visual.queue_free)
		queue_free()

func hit_at(amount: float, point: Vector3, normal: Vector3, impulse: Vector3) -> void:
	if dead:
		return
	# Project the capsule contact onto visible mesh bounds to avoid floating marks.
	var direction := impulse.normalized()
	var nearest := INF
	var contact: Variant = null
	for part in visual.find_children("*", "MeshInstance3D", true, false):
		if not part.is_visible_in_tree() or part.get_parent().has_meta("impact_mark"):
			continue
		var from: Vector3 = part.to_local(point - direction * 0.6)
		var to: Vector3 = part.to_local(point + direction * 1.0)
		var intersection: Variant = part.get_aabb().intersects_segment(from, to)
		if intersection is Vector3:
			var candidate: Vector3 = part.to_global(intersection)
			var distance: float = candidate.distance_to(point - direction * 0.6)
			if distance < nearest:
				nearest = distance
				contact = candidate
	if contact is Vector3:
		point = contact
	var local := visual.to_local(point)
	last_hit_region = "head" if local.y > 1.45 else ("left_arm" if local.x < -0.28 else ("right_arm" if local.x > 0.28 else "torso"))
	var host: Node3D = visual.get_node("Head") if last_hit_region == "head" else visual
	var mark := RazlomArt.box(host, Vector3.ZERO, Vector3(0.035, 0.035, 0.006), RazlomArt.material(Color("423c34")))
	mark.set_meta("impact_mark", true)
	mark.visible = contact is Vector3
	mark.global_position = point + normal * 0.012
	mark.look_at(mark.global_position + normal, Vector3.RIGHT if absf(normal.y) > 0.95 else Vector3.UP)
	impact_marks.append(mark)
	if impact_marks.size() > 4:
		impact_marks.pop_front().queue_free()
	var zone := RazlomBallistics.region(to_local(point))
	var result := RazlomBallistics.resolve(zone, amount, helmet if zone == "head" else armor)
	if zone == "head":
		helmet = maxf(0, helmet - float(result.wear))
	else:
		armor = maxf(0, armor - float(result.wear))
	if zone == "legs":
		leg_wound = true
	hit(float(result.damage), impulse)
	motion.hit_region = last_hit_region
