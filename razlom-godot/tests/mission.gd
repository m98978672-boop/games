extends SceneTree
## Automated integration, not a human playthrough. Uses real scene/physics rays;
## teleports only to isolate transactions. Disables enemy ticks for repeatability.
var game
var checks := 0
var failures: Array[String] = []
var test_save := "user://razlom-integration-only.json"

func _initialize() -> void:
	call_deferred("run_tests")

func check(ok: bool, message: String) -> void:
	checks += 1
	if not ok:
		failures.append(message)
		printerr("FAIL: " + message)

func freeze_guards() -> void:
	for guard in game.enemies:
		if is_instance_valid(guard):
			guard.set_physics_process(false)
			guard.alert = false

func run_tests() -> void:
	create_timer(45, true).timeout.connect(func():
		printerr("FAIL: integration watchdog")
		quit(2))
	game = load("res://scenes/main.tscn").instantiate()
	game.save_path = test_save
	root.add_child(game)
	await process_frame
	check(paused, "Start menu pauses simulation")
	check(game.blocks.size() == 250, "Warehouse has 250 identified masonry units")
	check(game.world.get_node_or_null("Vera") != null, "Vera has a physical scene")
	game.resume()
	freeze_guards()
	await physics_frame
	await physics_frame
	check(game.save_game(), "Initial safe checkpoint writes successfully")
	check(FileAccess.file_exists(test_save), "Checkpoint file exists")
	var initial: String = FileAccess.get_file_as_string(test_save)
	var old_position: Vector3 = game.player.position
	Input.action_press("forward")
	for i in range(20):
		await physics_frame
	Input.action_release("forward")
	check(game.player.position.distance_to(old_position) > 0.3, "Character moves under physics/input")
	game.player.position = Vector3(-22, 0.3, 22)
	game.player.set_crouched(true)
	await physics_frame
	check(game.player.capsule.height < 1.2, "Crouch changes actual collision height")
	var low_ceiling := RazlomArt.box(game.world, Vector3(-22, 1.65, 22), Vector3(2, 0.2, 2), RazlomArt.material(Color.WHITE), true)
	await physics_frame
	await physics_frame
	check(not game.player.can_stand(), "Cannot stand through a low ceiling")
	low_ceiling.queue_free()
	await physics_frame
	await physics_frame
	check(game.player.can_stand(), "Can stand again after ceiling removal")
	game.player.set_crouched(false)
	Input.action_press("flashlight")
	await physics_frame
	await physics_frame
	Input.action_release("flashlight")
	check(game.player.light.visible, "Flashlight action toggles the actual light node")
	game.toggle_quality()
	check(game.player.camera.far == 90, "Low graphics preset changes draw distance")
	game.toggle_quality()
	check(game.player.camera.far == 180, "Graphics preset can be restored")
	# State invariants and migration, without touching the live resource instance.
	var state_script = load("res://scripts/state.gd")
	var state = state_script.new()
	state.health = 50
	state.scrap = 4
	check(state.craft("medkit") and state.scrap == 2, "Recipe deducts exact cost")
	var count: int = state.charges
	check(not state.craft("charge") and state.charges == count, "Insufficient resources do not create items")
	check(state.rest() and state.fatigue == 0 and state.warmth == 100, "Sleep updates needs atomically")
	var valid: Dictionary = state.snapshot()
	var bad: Dictionary = valid.duplicate(true)
	bad["ammo"] = 4.5
	check(not state.restore(bad) and state.snapshot() == valid, "Fractional ammo rejected without mutation")
	bad = valid.duplicate(true)
	bad["health"] = NAN
	check(not state.restore(bad), "NaN rejected")
	var legacy := valid.duplicate(true)
	legacy["version"] = 1
	legacy.erase("warmth")
	legacy.erase("fatigue")
	check(state.restore(legacy), "Version 1 state migrates")
	# Actual physics ray picks up the pump, not a direct grant of quest state.
	var pump: Node3D = null
	for item in get_nodes_in_group("loot"):
		if item.get_meta("id") == "mission_pump":
			pump = item
	check(pump != null, "Pump exists")
	game.player.position = pump.position + Vector3(0, 0.3, 2)
	game.player.velocity = Vector3.ZERO
	game.player.camera.look_at(pump.global_position, Vector3.UP)
	await physics_frame
	await physics_frame
	game.interact()
	await process_frame
	check(game.state.pump, "Physics-ray interaction takes pump")
	game.player.position = Vector3(-22, 0.4, 22)
	game.player.velocity = Vector3.ZERO
	game.complete_mission()
	check(game.state.complete, "Delivery completes the first mission")
	check(paused and game.modal_title.text == "ВОДА ВЕРНУЛАСЬ", "Mission ends with a real paused epilogue")
	var reward_food: int = game.state.food
	game.complete_mission()
	check(game.state.food == reward_food, "Delivery reward cannot repeat")
	game.resume()
	check(not paused and game.state.complete, "Epilogue can resume exploration without resetting progress")
	# Return to an older checkpoint must RESTORE already-collected objects.
	var file := FileAccess.open(test_save, FileAccess.WRITE)
	file.store_string(initial)
	file.close()
	game.state.health = 10
	game.blocks["back_8_0"].hit(999)
	await process_frame
	await process_frame
	check(game.blocks.size() < 250, "Structural failure removes supported column")
	check(game.active_debris <= 32, "Active rigid-body budget holds")
	check(game.load_game(), "Older checkpoint loads")
	freeze_guards()
	await process_frame
	check(game.blocks.size() == 250, "Older checkpoint restores destroyed blocks")
	check(not game.state.pump and not game.state.complete, "Older checkpoint restores quest flags")
	var pump_count := 0
	for item in get_nodes_in_group("loot"):
		if item.get_meta("id") == "mission_pump":
			pump_count += 1
	check(pump_count == 1, "Older checkpoint restores exactly one pump")
	check(game.state.health > 95, "Older checkpoint restores player health")
	# Animal trust is a finite resource transaction and has persistent commands.
	game.dog.set_physics_process(false)
	game.state.food = 3
	check(game.dog.befriend() and game.dog.befriend(), "Two feeding interactions establish trust")
	check(game.state.food == 1 and game.dog.following, "Feeding deducts real inventory")
	game.dog.befriend()
	check(game.dog.waiting and game.state.food == 1, "Wait command does not consume extra food")
	# Malformed save must not delete the world first.
	file = FileAccess.open(test_save, FileAccess.WRITE)
	file.store_string('{"version":2,"health":-10}')
	file.close()
	var world_id: int = game.world.get_instance_id()
	check(not game.load_game(), "Malformed save rejected")
	check(game.world.get_instance_id() == world_id, "Rejected load leaves current world intact")
	# Restored rubble is physical and survives snapshot round-trip.
	game.spawn_settled_rubble(Vector3(-15, 0.4, 20), Vector3(0, 0.5, 0))
	game.player.position = Vector3(-22, 0.4, 22)
	check(game.save_game(), "Save accepts settled physical rubble")
	check(game.load_game(), "Rubble checkpoint loads")
	freeze_guards()
	await process_frame
	check(get_nodes_in_group("rubble").size() == 1, "Exactly one settled rubble object survives reload")
	check(game.dog.trust == 2 and game.dog.waiting, "Animal trust and wait state survive reload")
	# Dialogue opening is paused and can be closed without swallowing gameplay.
	game.interactions.inventory()
	check(paused and game.interactions.panel.visible, "Inventory pauses and displays")
	game.resume()
	check(not paused and not game.interactions.panel.visible, "Closing inventory resumes world")
	game.state.health = 50
	game.state.scrap = 2
	game.interactions.vera_dialog()
	check(paused and game.interactions.column.get_child_count() >= 4, "Vera dialogue creates real choices")
	game.interactions.column.get_child(2).emit_signal("pressed")
	check(game.state.health == 100 and game.state.scrap == 0 and not paused, "Vera treatment button applies its own transaction")
	game.state.scrap = 3
	var charges_before: int = game.state.charges
	game.interactions.bench_dialog()
	game.interactions.column.get_child(4).emit_signal("pressed")
	check(game.state.charges == charges_before + 1 and game.state.scrap == 0, "Recipe button captures its correct recipe")
	for suffix in ["", ".bak", ".tmp"]:
		if FileAccess.file_exists(test_save + suffix):
			DirAccess.remove_absolute(test_save + suffix)
	print("Integration checks: %d; failures: %d" % [checks, failures.size()])
	game.queue_free()
	await process_frame
	quit(0 if failures.is_empty() else 1)
