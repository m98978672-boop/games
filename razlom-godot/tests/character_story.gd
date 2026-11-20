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
func press_named(game, prefix: String) -> bool:
	for child in game.interactions.column.get_children():
		if child is Button and child.text.begins_with(prefix):
			child.pressed.emit()
			return true
	return false
func run_tests() -> void:
	var game = load("res://scenes/main.tscn").instantiate()
	root.add_child(game)
	await process_frame
	var guard = game.enemies[0]
	check(guard.visual.has_node("Head/EyeL") and guard.visual.has_node("Head/EyeR"), "Guards have both modeled eyes")
	var medic = game.interactions.medic_motion.model
	check(medic.has_node("Head/EyeL"), "Vera has a modeled face")
	check(game.world.has_node("Pavel"), "Courier exists in playable world")
	var count: int = guard.visual.get_child_count()
	RazlomArt.dress_actor(guard.visual)
	check(guard.visual.get_child_count() == count, "Detailing is idempotent")
	guard.motion.blink_clock = 4.17
	guard.motion.advance(0.01, 0)
	check(guard.visual.get_node("Head/EyeL").scale.y < 0.1, "Eyes blink")
	guard.motion.advance(0.2, 0)
	check(guard.visual.get_node("Head/EyeL").scale.y == 1.0, "Eyes reopen")
	game.interactions.medic_motion.greet()
	game.interactions.medic_motion.advance(0.2, 0)
	check(game.interactions.medic_motion.joints.ArmR.rotation.x < -0.4, "Conversation gesture raises hand")
	var s = game.state
	var legacy: Dictionary = s.snapshot()
	legacy.erase("passage")
	check(s.restore(legacy) and not s.passage, "Old saves have no passage by default")
	var bad: Dictionary = s.snapshot()
	bad.passage = "yes"
	check(not s.restore(bad) and not s.passage, "Invalid passage flag rejected atomically")
	s.bottles = 1
	game.interactions.courier_dialog()
	game.interactions.column.get_child(2).pressed.emit()
	check(s.passage and s.bottles == 0, "Real courier choice costs one bottle and grants passage")
	game.interactions.courier_dialog()
	check(game.interactions.column.get_child_count() == 3, "Passage cannot be bought twice while active")
	game.resume()
	guard.visible_contact = true
	guard.last_seen = game.player.global_position
	var health: float = s.health
	game.enemy_fire(guard)
	check(s.health == health, "Passage blocks enemy fire")
	guard.choose_target(0.1)
	check(guard.behavior == "stand_down" and not guard.alert, "Guards stand down under agreement")
	var saved: Dictionary = s.snapshot()
	s.passage = false
	check(s.restore(saved) and s.passage, "Agreement survives state serialization")
	guard.hit(1)
	check(not s.passage, "Attacking a guard breaks agreement")
	game.interactions.courier_dialog()
	check(game.interactions.column.get_child_count() == 3 and s.passage_broken, "Broken agreement cannot be repurchased")
	guard.health = 30
	guard.visible_contact = true
	guard.scan = 1.0
	guard.last_seen = guard.global_position + Vector3(4, 0, 0)
	guard._physics_process(0.016)
	check(guard.behavior == "withdraw", "Wounded guard withdraws from visible contact")
	guard.visible_contact = false
	guard._physics_process(0.016)
	check(guard.behavior != "withdraw", "Withdrawal does not track an unseen player")
	for button in game.find_children("*", "Button", true, false):
		if button.text.begins_with("Обзор ·"):
			button.pressed.emit()
	check(is_equal_approx(game.look_scale, 1.4), "Sensitivity menu changes actual input multiplier")
	s.complete = true
	s.relay_log = true
	s.relay_shared = true
	game.interactions.vera_dialog()
	check(press_named(game, "Дело Веры • медицинский") and game.interactions.column.get_child(1).text.contains("Запечатанный ящик"), "Vera directly offers her medical side quest")
	check(press_named(game, "Взяться за дело") and game.quests.phase("medicine") == 1, "Medical quest can be accepted directly through Vera")
	game.interactions.vera_dialog()
	check(press_named(game, "Дело Веры • раненый электрик"), "Same character offers a separate rescue quest")
	check(press_named(game, "Взяться за дело") and game.quests.phase("engineer") == 1, "Vera's second quest can be active alongside the first")
	game.interactions.vera_dialog()
	check(press_named(game, "Дело Веры • запитать северный шлюз"), "After returning the archive, Vera offers a third technical quest")
	game.resume()
	game.interactions.vera_dialog()
	check(press_named(game, "Спросить Веру"), "Mutual romance conversation only unlocks after the main rescue")
	check(game.state.vera_bond == 0 and game.interactions.panel.visible, "Romance does not advance before the player's answer")
	check(press_named(game, "Предложить узнать"), "Vera has a clear, optional consent choice")
	check(game.state.vera_bond == 1, "Vera accepts a slow mutual courtship")
	game.refresh_world_state()
	check(game.world.has_node("ShelterImprovements/EveningTable"), "A relationship milestone changes the shelter scene")
	game.interactions.vera_dialog()
	check(press_named(game, "Обсудить, какими"), "Second relationship step requires the shared relay story")
	check(press_named(game, "Да. Давай попробуем"), "Both characters explicitly choose the relationship")
	check(game.state.vera_bond == 2, "Chosen relationship reaches the saved committed stage")
	var romance_save: Dictionary = s.snapshot()
	var restored_romance := RazlomState.new()
	check(restored_romance.restore(romance_save) and restored_romance.vera_bond == 2, "Romance choice survives save serialization")
	var older_romance: Dictionary = romance_save.duplicate(true)
	older_romance.erase("vera_bond")
	check(restored_romance.restore(older_romance) and restored_romance.vera_bond == 0, "Older saves migrate without a romance flag")
	game.interactions.journal()
	check(game.interactions.panel.visible, "Journal remains available after broken agreement")
	game.queue_free()
	await process_frame
	print("Character/story checks: %d; failures: %d" % [checks, failures])
	quit(1 if failures > 0 else 0)
