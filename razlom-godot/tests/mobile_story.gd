extends SceneTree
var checks := 0
var failures := 0
var game
var save_path := "user://razlom-mobile-story-test.json"

func _initialize() -> void:
	call_deferred("run_tests")

func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		printerr("FAIL: " + label)

func touch_event(id: int, point: Vector2, pressed: bool) -> InputEventScreenTouch:
	var event := InputEventScreenTouch.new()
	event.index = id
	event.position = point
	event.pressed = pressed
	return event

func run_tests() -> void:
	create_timer(45, true).timeout.connect(func(): quit(2))
	var state := RazlomState.new()
	var legacy := state.snapshot()
	legacy.erase("manifest")
	legacy.erase("truth_shared")
	check(state.restore(legacy) and not state.manifest, "Older saves default story evidence to absent")
	var bad := state.snapshot()
	bad.truth_shared = true
	check(not state.restore(bad), "Cannot publish a document never found")
	bad = state.snapshot()
	bad.manifest = "yes"
	check(not state.restore(bad), "Story flag types are validated")
	game = load("res://scenes/main.tscn").instantiate()
	game.save_path = save_path
	root.add_child(game)
	await process_frame
	game.resume()
	game.player.set_physics_process(false)
	game.dog.set_physics_process(false)
	for guard in game.enemies:
		guard.set_physics_process(false)
	var document: Node3D
	for item in get_nodes_in_group("loot"):
		if item.get_meta("id") == "warehouse_manifest":
			document = item
	check(is_instance_valid(document), "Warehouse has a physical story document")
	game.player.position = document.position + Vector3(0, 0.3, 2)
	game.player.camera.look_at(document.global_position, Vector3.UP)
	await physics_frame
	await physics_frame
	game.interact()
	check(game.state.manifest and paused, "Real interaction ray collects and opens the document")
	check(game.interactions.column.get_child(1).text.contains("И. Лесной"), "Collected evidence contains the story reveal")
	game.resume()
	game.interactions.vera_dialog()
	game.interactions.column.get_child(4).emit_signal("pressed")
	check(game.interactions.column.get_child(0).text == "ЦЕНА ПРАВДЫ", "Evidence unlocks a new Vera conversation")
	game.interactions.column.get_child(3).emit_signal("pressed")
	check(not game.state.truth_shared and not paused, "Giving Vera time does not secretly publish evidence")
	game.interactions.vera_dialog()
	game.interactions.column.get_child(4).emit_signal("pressed")
	game.interactions.column.get_child(2).emit_signal("pressed")
	check(game.state.truth_shared, "Publishing is an explicit persistent choice")
	game.interactions.journal()
	check(game.interactions.column.get_child(1).text.contains("обнародован"), "Journal reflects the player's choice")
	game.resume()
	game.player.position = Vector3(-22, 0.4, 22)
	check(game.save_game(), "Story checkpoint writes")
	check(game.load_game(), "Story checkpoint loads")
	game.player.set_physics_process(false)
	game.dog.set_physics_process(false)
	for guard in game.enemies:
		guard.set_physics_process(false)
	check(game.state.manifest and game.state.truth_shared, "Evidence and disclosure survive reload")
	game.state.pump = true
	game.complete_mission()
	check(game.modal_body.text.contains("Накладная обнародована"), "Epilogue changes to match disclosed evidence")
	game.resume()
	game.mobile_mode = true
	var controls := RazlomTouchControls.new()
	controls.game = game
	game.hud.add_child(controls)
	game.touch_ui = controls
	controls._process(0)
	check(controls.zones.size() == 10, "Touch layout provides ten action regions")
	controls._input(touch_event(1, controls.move_origin + Vector2(0, -60), true))
	check(controls.movement.y < -0.8, "Touch stick creates analog movement")
	var look_point := Vector2(600, 400)
	controls._input(touch_event(2, look_point, true))
	var drag := InputEventScreenDrag.new()
	drag.index = 2
	drag.relative = Vector2(40, 5)
	drag.position = controls.look_position + drag.relative
	var yaw: float = game.player.rotation.y
	controls._input(drag)
	game.player.advance_touch_look(0.05)
	check(absf(game.player.rotation.y - yaw) > 0.04, "Second finger rotates view independently")
	var fire_rect: Rect2 = controls.zones.fire
	controls._input(touch_event(3, fire_rect.get_center(), true))
	check(Input.is_action_pressed("fire") and controls.movement.y < -0.8, "Third finger can fire while the stick remains held")
	controls._input(touch_event(3, fire_rect.get_center(), false))
	check(not Input.is_action_pressed("fire"), "Touch release clears held fire")
	game.show_menu("ПАУЗА", "Тест")
	controls._process(0)
	check(controls.movement == Vector2.ZERO and controls.move_id == -1, "Opening menu cancels held movement")
	check(not controls.visible, "Controls cannot cover the paused menu")
	for suffix in ["", ".bak", ".tmp"]:
		if FileAccess.file_exists(save_path + suffix):
			DirAccess.remove_absolute(save_path + suffix)
	game.queue_free()
	await process_frame
	print("Mobile/story checks: %d; failures: %d" % [checks, failures])
	quit(1 if failures > 0 else 0)
