extends SceneTree
var checks := 0
var failures := 0
func _initialize() -> void:
	call_deferred("run_tests")
func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		printerr("FAIL: " + label)
func run_tests() -> void:
	var game = load("res://scenes/main.tscn").instantiate()
	game.save_path = "user://razlom-body-test.json"
	root.add_child(game)
	await process_frame
	game.resume()
	game.state.rifle_owned = true
	game.player.sync_weapon_state()
	game.set_process(false)
	game.player.set_physics_process(false)
	game.dog.set_physics_process(false)
	for actor in game.enemies: actor.set_physics_process(false)
	var host := Node3D.new()
	game.world.add_child(host)
	host.rotation = Vector3(0.4, 1.2, 0.2)
	host.scale = Vector3.ONE * 0.65
	var rig := RazlomArmRig.new(host)
	var shoulder := Vector3(-0.24, -0.26, 0.12)
	var target := Vector3(-0.15, -0.3, -0.7)
	rig.solve(shoulder, target, -1)
	check(rig.wrist.is_equal_approx(target), "Scaled rotated parent preserves local wrist target")
	var limb_mesh := rig.segments[0].get_child(0) as MeshInstance3D
	var upper_arm_direction := (rig.elbow - shoulder).normalized()
	check(absf(limb_mesh.global_transform.basis.z.normalized().dot(upper_arm_direction)) > 0.999, "Sleeve mesh length axis follows the solved upper arm")
	var before := rig.elbow
	host.rotate_y(2.0)
	rig.solve(shoulder, target, -1)
	check(rig.elbow.is_equal_approx(before), "Rotating actor cannot flip local elbow")
	for point in [shoulder, shoulder + Vector3.UP * 0.9, shoulder + Vector3.FORWARD * 10]:
		rig.solve(shoulder, point, -1)
		check(rig.elbow.is_finite() and rig.segments[0].basis.is_finite(), "Degenerate and vertical targets remain finite")
	check(rig.wrist.distance_to(shoulder) <= 1.011, "Unreachable targets cannot infinitely stretch sleeve")
	var player = game.player
	player._process(0)
	check(player.gun.get_node("LeftHand").get_parent() == player.gun and player.gun.get_node("RightHand").get_parent() == player.gun, "Authored first-person hands stay attached to the lowered weapon viewmodel")
	check(player.gun.get_node("LeftHand/Palm/Visual").visible and player.gun.get_node("RightHand/Finger3/Visual").visible and player.left_arm.hand.has_node("Finger0") and player.right_arm.hand.has_node("Cuff"), "Weapon retains detailed hands while world-character IK rigs remain available")
	player.rotation = Vector3.ZERO
	player.receive_bullet(player.to_global(Vector3(0.29, 1.0, 0)), Vector3.ZERO)
	check(game.state.right_arm_wound == 40 and not player.can_fire(), "Right arm hit triggers protective reflex and shot lock")
	player.reflex_time = 0
	check(player.can_fire(), "Single arm wound permits fire after reflex")
	player.receive_bullet(player.to_global(Vector3(0.29, 1.0, 0)), Vector3.ZERO)
	player.reflex_time = 0
	check(not player.can_fire(), "Severely wounded firing arm remains disabled")
	check(player.begin_heal() and game.state.right_arm_wound == 0, "First aid restores wounded arm function")
	var guard = game.enemies[0]
	var support_hand: Node3D = guard.carried_weapon.get_node("LeftHand") as Node3D
	var support_hand_local := support_hand.transform
	check(guard.carried_weapon.get_parent() == guard.visual, "Guard rifle is parented to the stable body root, not a swinging sleeve")
	for blend in [0.0, 0.25, 0.5, 0.75, 1.0]:
		guard.arm_wounds = Vector2.ZERO
		guard.update_arm_pose(1.0 / 60.0, blend, 0.0)
		var left_grip: Vector3 = guard.visual.to_local(support_hand.global_position)
		var right_grip: Vector3 = guard.visual.to_local(guard.carried_weapon.get_node("RightHand").global_position)
		check(guard.left_arm.wrist.distance_to(left_grip) < 0.002 and guard.right_arm.wrist.distance_to(right_grip) < 0.002, "Both guard wrists track the same-frame rifle grips throughout its raise arc")
		var left_forearm_axis: Vector3 = (guard.left_arm.wrist - guard.left_arm.elbow).normalized()
		var right_forearm_axis: Vector3 = (guard.right_arm.wrist - guard.right_arm.elbow).normalized()
		check(guard.left_arm.hand.basis.y.normalized().dot(left_forearm_axis) < -0.98 and guard.right_arm.hand.basis.y.normalized().dot(right_forearm_axis) < -0.98, "Guard fingers point forward from each wrist along the forearm instead of flopping sideways")
		check(absf(guard.left_arm.elbow.distance_to(Vector3(-0.3, 1.3, 0)) - guard.left_arm.bone_length) < 0.002 and absf(guard.left_arm.elbow.distance_to(guard.left_arm.wrist) - guard.left_arm.bone_length) < 0.002 and absf(guard.right_arm.elbow.distance_to(Vector3(0.3, 1.3, 0)) - guard.right_arm.bone_length) < 0.002 and absf(guard.right_arm.elbow.distance_to(guard.right_arm.wrist) - guard.right_arm.bone_length) < 0.002, "Guard upper arms and forearms keep character-scaled lengths instead of stretching")
		if is_equal_approx(blend, 1.0):
			check(guard.left_arm.elbow.y < 1.15 and guard.right_arm.elbow.y < 1.15 and absf(guard.left_arm.elbow.x + 0.3) < 0.3 and absf(guard.right_arm.elbow.x - 0.3) < 0.3, "Rifle-ready elbows stay tucked below the shoulders instead of flaring into a wide V")
	guard.arm_wounds = Vector2(100, 100)
	guard.update_arm_pose(1.0 / 60.0, 0.4, 0.0)
	var stable_wounded_pose: Transform3D = guard.carried_weapon.transform
	for i in range(30):
		guard.update_arm_pose(1.0 / 60.0, 0.4, 0.0)
	check(support_hand.transform.is_equal_approx(support_hand_local), "Support-hand damage does not drift the grip away from the gun")
	check(guard.carried_weapon.transform.is_equal_approx(stable_wounded_pose), "Repeated wounded-arm poses are absolute, not cumulative")
	var final_left_grip: Vector3 = guard.visual.to_local(support_hand.global_position)
	check(guard.left_arm.wrist.distance_to(final_left_grip) < 0.002, "Wounded support arm remains connected to its stable grip")
	guard.arm_wounds = Vector2.ZERO
	guard.motion.react("legs", Vector3(-0.2, 0.4, 0))
	guard.motion.advance(0.1, 2)
	check(guard.motion.reactions.has("LegL") and guard.motion.knees.LegL.rotation.x > 0, "Leg impact independently bends correct knee")
	guard.motion.react("head", Vector3(0, 1.6, 0))
	guard.motion.advance(0.1, 0)
	check(absf(guard.visual.get_node("Head").rotation.z) > 0.1, "Head has separate impact reaction")
	guard.aim_time = 2.0
	guard.suppress(0.45)
	check(guard.motion.duck == 1.0 and guard.aim_time == 0.5, "Suppression makes guard duck and lose the sight picture")
	guard.hit_at(36, guard.to_global(Vector3(0, 1.65, -0.2)), Vector3.FORWARD, Vector3.BACK)
	check(guard.dead, "Unprotected lethal head hit stops actor")
	await process_frame
	check(get_nodes_in_group("corpses").size() == 1, "Defeated actor leaves persistent body")
	check(get_nodes_in_group("blood_stain").size() > 0, "Body impacts leave blood traces")
	await create_timer(0.7).timeout
	check(get_nodes_in_group("blood_fx").is_empty(), "Transient blood droplets clean up")
	for actor in game.enemies:
		if is_instance_valid(actor): actor.alert = false
	player.position = Vector3(-23, 0.3, 22)
	check(game.save_game() and game.load_game(), "Checkpoint preserves persistent body")
	game.player.set_physics_process(false)
	for actor in game.enemies: actor.set_physics_process(false)
	check(get_nodes_in_group("corpses").size() == 1 and get_nodes_in_group("corpses")[0].settled, "Loaded corpse is settled, not a resurrected actor")
	var corpse = get_nodes_in_group("corpses")[0]
	check(corpse.collision_layer == 8, "Settled body receives ballistic collision without blocking walking")
	corpse.hit_at(36, corpse.to_global(Vector3(0.8, 0.1, 0)), Vector3.UP, Vector3.DOWN)
	check(corpse.settled and get_nodes_in_group("blood_fx").size() > 0, "Corpse impacts react and bleed without reviving AI")
	check(not RazlomCorpse.valid([{"position": [0, 0, 0], "yaw": INF, "zone": "head", "player": false}]), "Nonfinite corpse data rejected")
	player = game.player
	game.state.helmet = 0
	game.state.health = 100
	player.receive_bullet(player.to_global(Vector3(0, 1.65, 0)), Vector3.ZERO)
	check(not player.can_fire(), "Lethal hit disables trigger even before death menu frame")
	game._process(0.016)
	check(game.ended and not paused and get_nodes_in_group("corpses").size() == 2, "Player head death creates body before death menu pauses world")
	await create_timer(0.5).timeout
	check(player.camera.position.y < 0.4 and not player.gun.visible, "Death lowers viewpoint and removes floating viewmodel")
	game._process(1.1)
	check(paused, "Death menu appears after fall, not instead of it")
	check(game.load_game() and player.gun.visible and player.camera.position.y > 1.5, "Loading checkpoint resets death camera and hands")
	for suffix in ["", ".bak", ".tmp"]:
		if FileAccess.file_exists(game.save_path + suffix): DirAccess.remove_absolute(game.save_path + suffix)
	game.queue_free()
	await process_frame
	print("Body reaction checks: %d; failures: %d" % [checks, failures])
	quit(1 if failures else 0)
