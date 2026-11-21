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
	root.add_child(game)
	await process_frame
	game.resume()
	var player = game.player
	var rifle: Node3D
	for item in get_nodes_in_group("loot"):
		if item.get_meta("id", "") == "starter_rifle":
			rifle = item
	check(is_instance_valid(rifle), "A starter rifle is placed on the shelter wall rack")
	check(not game.state.rifle_owned and not player.gun.visible and not player.can_fire(), "Player starts unarmed until taking the wall rifle")
	player.camera.look_at(rifle.global_position, Vector3.UP)
	await physics_frame
	check(game.ray(3.2).get("collider") == rifle, "Wall rifle is reachable by the interaction ray")
	game.interact()
	check(game.state.rifle_owned and player.gun.visible and player.can_fire(), "Taking the rifle equips the viewmodel and enables fire")
	check(rifle.is_queued_for_deletion(), "Picked-up rifle is removed from the shelter rack")
	player.toggle_aim()
	game._process(1.0 / 60.0)
	check(player.aiming and game.aim_reticle.visible, "One aim press toggles on a persistent centered reticle")
	player.toggle_aim()
	game._process(1.0 / 60.0)
	check(not player.aiming and not game.aim_reticle.visible, "Second aim press toggles the reticle back off")
	player.toggle_aim()
	game.state.left_arm_wound = 35
	player.toggle_aim()
	check(not player.aiming, "A damaged support arm prevents holding the sight picture")
	var restored := RazlomState.new()
	check(restored.restore(game.state.snapshot()) and restored.rifle_owned, "Rifle ownership persists in new checkpoints")
	var legacy: Dictionary = game.state.snapshot()
	legacy.erase("rifle_owned")
	check(restored.restore(legacy) and restored.rifle_owned, "Older checkpoints retain their previously equipped rifle")
	game.queue_free()
	await process_frame
	print("Weapon pickup checks: %d; failures: %d" % [checks, failures])
	quit(1 if failures else 0)
