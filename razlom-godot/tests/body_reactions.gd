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
	check(player.left_arm.wrist.distance_to(player.camera.to_local(player.gun.get_node("LeftHand").global_position)) < 0.005, "Actual viewmodel support wrist remains attached within reach")
	check(player.left_arm.hand.has_node("Finger0") and player.left_arm.hand.has_node("Cuff") and player.right_arm.hand.has_node("Finger3"), "Detailed glove, cuff and articulated fingers are attached to both IK wrists")
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
