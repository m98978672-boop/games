class_name RazlomEnemy
extends CharacterBody3D
var game
var health := 100.0
var armor := 0.0
var helmet := 0.0
var aim_time := 0.0
var suppression := 0.0
var leg_wound := false
var arm_wounds := Vector2.ZERO
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
## Human weapon handling: 0 = carried low, 1 = shouldered and aimed.
var weapon_raise := 0.0
var startle_time := 0.0
var shots_fired := 0
var shots_hit := 0
var near_misses := 0
var weapon_raised_pos := Vector3(-0.15, 0.09, -0.29)
var weapon_raised_rot := Vector3.ZERO
var weapon_lowered_pos := Vector3(0.06, -0.30, 0.06)
var weapon_lowered_rot := Vector3(-0.35, 0.15, 0.20)
const RAISE_TIME := 0.65
const LOWER_TIME := 0.45
const AIM_REQUIRED := 0.85

func is_weapon_raised() -> bool:
	return weapon_raise >= 0.95

func suppress(amount: float) -> void:
	# A bullet cracking past or a hit makes a person duck and lose the sight picture.
	suppression = maxf(suppression, amount)
	startle_time = maxf(startle_time, 0.30)
	motion.duck = 1.0
	aim_time *= 0.25

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
	weapon.position = weapon_lowered_pos
	weapon.rotation = weapon_lowered_rot
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
	startle_time = maxf(0.0, startle_time - delta)
	var wants_weapon_up: bool = alert and not game.state.passage and suppression <= 0.0 and startle_time <= 0.0
	weapon_raise = move_toward(weapon_raise, 1.0 if wants_weapon_up else 0.0, delta / (RAISE_TIME if wants_weapon_up else LOWER_TIME))
	if visible_contact and not game.state.passage and weapon_raise >= 0.95 and suppression <= 0:
		aim_time = minf(2.5, aim_time + delta)
	else:
		aim_time = maxf(0.0, aim_time - delta * 2.0)
	report_cooldown -= delta
	awareness.tick(delta)
	scan -= delta
	if scan <= 0:
		scan = 0.22
		visible_contact = sees_player()
		if visible_contact and not game.state.passage:
			remember_sighting(game.player.global_position)
			if cooldown <= 0 and aim_time >= AIM_REQUIRED and weapon_raise >= 0.95 and suppression <= 0 and arm_wounds.y < 60:
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
	motion.advance(delta, Vector2(velocity.x, velocity.z).length(), smoothstep(0.0, 0.9, weapon_raise))
	# Deliberate low-ready -> shoulder raise -> sight picture animation. The elbows
	# follow the rifle, and the muzzle settles gradually rather than snapping on target.
	var raise_blend := smoothstep(0.0, 1.0, weapon_raise)
	var aim_blend := smoothstep(0.55, 1.0, weapon_raise) * (1.0 if visible_contact else 0.0)
	var sight_sway := sin(phase * 2.1) * 0.012 * aim_blend + sin(phase * 0.7) * 0.008 * aim_blend
	carried_weapon.position = weapon_lowered_pos.lerp(weapon_raised_pos, raise_blend)
	carried_weapon.rotation = weapon_lowered_rot.lerp(weapon_raised_rot, raise_blend)
	carried_weapon.rotation.x += sight_sway + motion.recoil * 0.025
	if visible_contact:
		var offset: Vector3 = game.player.camera.global_position - (global_position + Vector3.UP * 1.4)
		var pitch := atan2(offset.y, Vector2(offset.x, offset.z).length())
		var target_arm_pitch := lerpf(-0.12, -0.65 - clampf(pitch, -0.5, 0.5), aim_blend)
		motion.joints.ArmR.rotation.x = lerp_angle(motion.joints.ArmR.rotation.x, target_arm_pitch - motion.recoil * 0.2 - motion.flinch * 0.65, 1.0 - exp(-delta * 7.0))
		motion.joints.ArmL.rotation.x = lerp_angle(motion.joints.ArmL.rotation.x, lerpf(0.05, -0.45, aim_blend), 1.0 - exp(-delta * 6.0))
		var head: Node3D = visual.get_node("Head")
		head.rotation.x = lerp_angle(head.rotation.x, -clampf(pitch, -0.5, 0.5) * aim_blend, 1.0 - exp(-delta * 5.0))
	if leg_wound:
		visual.rotation.z = motion.flinch * 0.28 + sin(phase * 7.0) * 0.045
	if arm_wounds.y >= 30:
		motion.joints.ArmR.rotation.x = 0.35 + sin(phase * 14) * 0.045
	weapon_motion.advance(0, motion.recoil * 0.09, delta)
	if arm_wounds.x >= 30:
		carried_weapon.get_node("LeftHand").position += Vector3(-0.12, -0.3, 0.1)
	left_arm.solve(Vector3(-0.3, 1.3, 0), visual.to_local(carried_weapon.get_node("LeftHand").global_position), -1.0)
	right_arm.solve(Vector3(0.3, 1.3, 0), visual.to_local(carried_weapon.get_node("RightHand").global_position), 1.0)
	if game.state.passage:
		think_label.text = "ПРОХОДИ"
	elif visible_contact and weapon_raise < 0.55:
		think_label.text = "ПОДНИМАЕТ"
	elif visible_contact and aim_time < AIM_REQUIRED:
		think_label.text = "ЦЕЛИТСЯ"
	else:
		think_label.text = "ОТХОД" if behavior == "withdraw" else ("!" if behavior == "engage" else ("?" if alert else ""))
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
	suppress(0.65)
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
		game.spawn_corpse(global_position, visual.global_rotation.y, last_hit_region, false, visual)
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
	var local := to_local(point)
	var zone := RazlomBallistics.region(local)
	last_hit_region = ("left_arm" if local.x < 0 else "right_arm") if zone == "arms" else zone
	var host: Node3D = visual.get_node("Head") if last_hit_region == "head" else visual.get_node("Coat")
	if last_hit_region == "left_arm": host = visual.get_node("ArmLJoint/ArmL")
	elif last_hit_region == "right_arm": host = visual.get_node("ArmRJoint/ArmR")
	elif zone == "legs": host = visual.get_node("LegLJoint/LegL" if local.x < 0 else "LegRJoint/LegR")
	var mark := RazlomArt.box(host, Vector3.ZERO, Vector3(0.065, 0.055, 0.007), RazlomArt.material(Color("84251e")))
	mark.set_meta("impact_mark", true)
	mark.visible = contact is Vector3
	mark.global_position = point + normal * 0.012
	mark.look_at(mark.global_position + normal, Vector3.RIGHT if absf(normal.y) > 0.95 else Vector3.UP)
	impact_marks.append(mark)
	if impact_marks.size() > 4:
		impact_marks.pop_front().queue_free()

	var result := RazlomBallistics.resolve(zone, amount, helmet if zone == "head" else armor)
	if zone == "head":
		helmet = maxf(0, helmet - float(result.wear))
	else:
		armor = maxf(0, armor - float(result.wear))
	if zone == "legs":
		leg_wound = true
	if zone == "arms":
		if to_local(point).x < 0: arm_wounds.x = minf(100, arm_wounds.x + 40)
		else: arm_wounds.y = minf(100, arm_wounds.y + 40)
	motion.react(zone, to_local(point))
	if float(result.wear) < amount:
		RazlomBloodFX.spawn(game, point, normal)
	hit(float(result.damage), impulse)
	motion.hit_region = last_hit_region
