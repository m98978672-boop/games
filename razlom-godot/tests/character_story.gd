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
	game.interactions.journal()
	check(game.interactions.panel.visible, "Journal remains available after broken agreement")
	game.queue_free()
	await process_frame
	print("Character/story checks: %d; failures: %d" % [checks, failures])
	quit(1 if failures > 0 else 0)
