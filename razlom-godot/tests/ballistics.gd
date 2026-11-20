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
	check(RazlomBallistics.region(Vector3(0, 1.65, 0)) == "head", "Head height selects head")
	check(RazlomBallistics.region(Vector3(0, 1.2, 0)) == "vitals", "Central chest is vital")
	check(RazlomBallistics.region(Vector3(0.29, 1.2, 0)) == "arms", "Lateral hit is not a fatal chest hit")
	check(RazlomBallistics.region(Vector3(0, 0.4, 0)) == "legs", "Low shot selects legs")
	check(RazlomBallistics.region(Vector3(0, 1.2, 0), true) == "head", "Crouched zone scaling follows collider")
	check(RazlomBallistics.resolve("head", 36, 0).fatal, "Unprotected rifle head hit is lethal")
	check(RazlomBallistics.resolve("vitals", 36, 0).fatal, "Unprotected vital hit is lethal")
	check(not RazlomBallistics.resolve("torso", 36, 0).fatal, "Ordinary torso hit is not always lethal")
	check(not RazlomBallistics.resolve("head", 36, 100).fatal, "Helmet stops a hit within its capacity")
	check(RazlomBallistics.resolve("head", 36, 20).fatal, "Exhausted protection cannot grant immortality")
	var game = load("res://scenes/main.tscn").instantiate()
	root.add_child(game)
	await process_frame
	game.resume()
	game.set_process(false)
	game.player.set_physics_process(false)
	game.dog.set_physics_process(false)
	for guard in game.enemies:
		guard.set_physics_process(false)
	var player = game.player
	player.position = Vector3(45, 0.3, 40)
	player.rotation = Vector3.ZERO
	player.receive_bullet(player.to_global(Vector3(0, 0.4, 0)), Vector3(45, 1.8, 0))
	check(game.state.health > 0 and game.state.health < 100, "Leg hit wounds rather than instant death")
	check(game.state.leg_wound > 0 and game.state.pain > 0, "Leg wound and pain persist")
	check(game.combat_feedback.injury_time > 0 and game.combat_feedback.injury_text.contains("НОГА"), "Location-aware pain HUD activates")
	check(player.begin_heal() and player.healing_time > 0, "First aid starts a dedicated weapon-lowering animation")
	check(not player.begin_heal(), "First aid cannot stack while animating")
	check(game.state.leg_wound == 0, "First aid treats movement wound")
	game.state.helmet = 100
	player.receive_bullet(player.to_global(Vector3(0, 1.65, 0)), Vector3.ZERO)
	check(game.state.health > 0 and game.state.helmet == 64, "Player helmet absorbs and degrades")
	game.state.helmet = 0
	player.receive_bullet(player.to_global(Vector3(0, 1.65, 0)), Vector3.ZERO)
	check(game.state.health == 0, "Player obeys lethal unprotected head rule")
	game.state.health = 100
	game.state.armor = 100
	var guard = game.enemies[0]
	guard.position = Vector3(45, 0.3, -5)
	guard.visual.rotation.y = PI
	await physics_frame
	await physics_frame
	check(guard.sees_player(), "Guard detects an unobstructed opponent 45 metres away")
	var before: float = game.state.health
	guard.aim_time = 2.5
	game.enemy_fire(guard)
	check(game.state.health < before, "Aimed distant shot uses actual ray and damages player")
	var wall := RazlomArt.box(game.world, Vector3(45, 1.7, 30), Vector3(4, 3.5, 0.5), RazlomArt.material(Color.WHITE), true)
	await physics_frame
	await physics_frame
	before = game.state.health
	for i in range(8):
		game.enemy_fire(guard)
	check(game.state.health == before, "Distant fire cannot bypass cover")
	wall.queue_free()
	guard.hit(1)
	check(guard.suppression > 0 and guard.aim_time == 0, "Taking fire interrupts guard aim")
	check(game.world.has_node("RelayYard/RelayRadio"), "Explorable relay and interactive archive exist")
	check(game.navigation.region.has_point(Vector2i(70, 20)), "Expanded district included in navigation")
	game.state.complete = true
	game.interactions.relay_dialog()
	check(game.state.relay_log, "Radio advances post-pump story")
	game.resume()
	game.interactions.vera_dialog()
	var found := false
	for child in game.interactions.column.get_children():
		if child is Button and child.text.contains("Передать Вере"):
			child.pressed.emit()
			found = true
	check(found and game.state.relay_shared, "Returning recording resolves follow-up through Vera")
	var restored := RazlomState.new()
	check(restored.restore(game.state.snapshot()) and restored.relay_shared and restored.armor == game.state.armor, "Armor and relay progress round-trip")
	var legacy: Dictionary = game.state.snapshot()
	for key in ["armor", "helmet", "pain", "leg_wound", "relay_log", "relay_shared"]:
		legacy.erase(key)
	check(restored.restore(legacy) and restored.armor == 0, "Older saves migrate without protection")
	var enemy = game.enemies[1]
	enemy.hit_at(36, enemy.to_global(Vector3(0, 1.68, 0)), Vector3.FORWARD, Vector3.BACK)
	check(enemy.dead, "Enemy obeys same lethal head rule")
	game.queue_free()
	await process_frame
	print("Ballistics checks: %d; failures: %d" % [checks, failures])
	quit(1 if failures else 0)
