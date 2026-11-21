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
	game.mobile_mode = true
	var player = game.player
	player.set_process(false)
	player.set_physics_process(false)
	var reference := 390.0 / minf(root.get_visible_rect().size.x, root.get_visible_rect().size.y)
	var expected := -100.0 * 0.004 * reference
	for fps in [30, 60, 120]:
		player.rotation.y = 0
		player.reset_touch_look()
		for i in range(int(fps / 5)):
			player.touch_look(Vector2(500.0 / fps, 0))
			player.advance_touch_look(1.0 / fps)
		for i in range(fps):
			player.advance_touch_look(1.0 / fps)
		check(absf(player.rotation.y - expected) < 0.0002, "Same swipe distance preserved at %d FPS" % fps)
	player.rotation.y = 0
	player.touch_look(Vector2(100, 0))
	check(is_zero_approx(player.rotation.y), "Input packet does not snap camera immediately")
	player.advance_touch_look(1.0 / 120)
	check(absf(player.rotation.y) > 0 and absf(player.rotation.y) < absf(expected) * 0.5, "Burst is spread across render frames")
	for i in range(30):
		player.advance_touch_look(1.0 / 120)
	check(absf(player.rotation.y - expected) < 0.0002, "No long inertial tail after swipe")
	player.reset_touch_look()
	player.touch_look(Vector2(200, 0))
	var controls := RazlomTouchControls.new()
	controls.game = game
	game.hud.add_child(controls)
	controls.reset()
	check(player.pending_look == Vector2.ZERO, "Touch reset clears pending camera displacement")
	game.show_menu("ПАУЗА", "Тест")
	player.touch_look(Vector2(100, 0))
	check(player.pending_look == Vector2.ZERO, "Paused screen cannot queue a camera jump")
	var medic = game.interactions.medic_motion.model
	check(medic.has_node("Head/Braid4") and medic.has_node("CoatHem"), "Vera has unique hairstyle and coat silhouette")
	check(medic.get_node("Head/Hair").get_parent() == medic.get_node("Head"), "Hair follows animated head")
	game.interactions.vera_past()
	check(game.interactions.column.get_child(1).text.contains("Электромехаником"), "Vera has personal history beyond the pump request")
	game.interactions.medic_motion.greet("treat")
	game.interactions.medic_motion.advance(0.2, 0)
	check(game.interactions.medic_motion.joints.ArmL.rotation.x > 0.3, "Treatment reaches Vera's hand forward toward the person she is helping")
	game.player.position = Vector3(45, 0.5, 45)
	game.interactions.attention_timer = 0
	game.interactions.advance_people(0.1)
	check(not game.interactions.attentive.get("Vera", true), "Friendly NPC cannot see a distant player")
	game.queue_free()
	await process_frame
	print("Touch camera checks: %d; failures: %d" % [checks, failures])
	quit(1 if failures > 0 else 0)
