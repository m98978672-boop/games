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
func click_first(game) -> void:
	game.interactions.column.get_child(2).pressed.emit()
func run_tests() -> void:
	var game = load("res://scenes/main.tscn").instantiate()
	game.save_path = "user://razlom-quests-test.json"
	root.add_child(game)
	await process_frame
	game.resume()
	game.set_process(false)
	game.player.set_physics_process(false)
	game.dog.set_physics_process(false)
	for guard in game.enemies:
		guard.set_physics_process(false)
	var q = game.quests
	check(RazlomQuests.valid({}) and not RazlomQuests.valid({"unknown": 1}), "Unknown quest IDs rejected")
	check(not RazlomQuests.valid({"survey": 1.5}) and not RazlomQuests.valid({"power": 9}), "Fractional and impossible quest phases rejected")
	q.offer("power")
	check(q.phase("power") == 0, "Power quest gated behind relay story")
	q.use_station("medicine")
	check(q.phase("medicine") == 0, "Unaccepted objective cannot be collected")
	q.offer("medicine")
	click_first(game)
	check(q.phase("medicine") == 1, "Accepting medicine quest starts state machine")
	var station = game.world.get_node("Quest_medicine")
	check(game.interactions.try_interact({"collider": station}) and q.phase("medicine") == 2, "Actual interaction dispatcher collects quest case")
	game.resume()
	game.player.position = Vector3(0, 0.3, 30)
	var kits: int = game.state.medkits
	q.offer("medicine")
	check(q.phase("medicine") == 2 and game.state.medkits == kits, "Journal cannot remotely deliver physical supplies")
	game.player.position = Vector3(-23, 0.3, 22)
	q.offer("medicine")
	check(q.phase("medicine") == 3 and game.state.medkits == kits + 2, "Returning case pays the promised reward")
	q.offer("medicine")
	check(game.state.medkits == kits + 2, "Medicine reward is not farmable")
	q.offer("engineer")
	click_first(game)
	q.use_station("engineer")
	click_first(game)
	check(q.phase("engineer") == 2, "Spending medkit saves engineer")
	kits = game.state.medkits
	q.use_station("engineer")
	check(game.state.medkits == kits, "Resolved engineer choice cannot charge twice")
	game.state.complete = true
	game.state.relay_log = true
	game.state.relay_shared = true
	q.offer("power")
	click_first(game)
	q.use_station("switch")
	check(q.phase("power") == 3, "Engineer knowledge opens alternate repair path")
	var ammo: int = game.state.reserve
	q.use_station("switch")
	check(game.state.reserve == ammo, "Repair reward cannot repeat")
	q.offer("gate")
	click_first(game)
	q.use_station("gate")
	check(q.phase("gate") == 2, "Powered gate archive advances main story")
	q.offer("gate")
	click_first(game)
	check(q.phase("gate") == 3, "Broadcast branch becomes permanent")
	ammo = game.state.reserve
	q.resolve_gate(4)
	check(q.phase("gate") == 3 and game.state.reserve == ammo, "Cannot claim both mutually exclusive endings")
	q.offer("survey")
	click_first(game)
	q.use_station("survey_2")
	check(q.scan_time == 0, "Survey rejects out-of-order measurement")
	game.resume()
	q.use_station("survey_1")
	game.player.position.x += 2
	q.advance(1)
	check(q.scan_time == 0 and q.phase("survey") == 1, "Movement cancels scan without granting progress")
	q.use_station("survey_1")
	game.state.health -= 1
	q.advance(1)
	check(q.scan_time == 0, "Damage cancels scan")
	for i in range(1, 4):
		q.use_station("survey_%d" % i)
		q.advance(3.1)
	check(q.phase("survey") == 4, "All three timed measurements required")
	game.player.position = Vector3(-23, 0.3, 22)
	var scrap: int = game.state.scrap
	q.offer("survey")
	check(q.phase("survey") == 5 and game.state.scrap == scrap + 5, "Survey turn-in grants exact reward")
	game.resume()
	for guard in game.enemies:
		guard.alert = false
	check(game.save_game() and game.load_game(), "Extended quest world saves and loads")
	check(q.phase("gate") == 3 and q.phase("survey") == 5, "Quest outcomes survive actual world reload")
	var restored := RazlomState.new()
	var snapshot: Dictionary = game.state.snapshot()
	var malformed: Dictionary = snapshot.duplicate(true)
	malformed.quests.gate = 8
	check(not restored.restore(malformed), "State restore validates quest data")
	snapshot.erase("quests")
	check(restored.restore(snapshot) and restored.quests.is_empty(), "Old save without quests migrates")
	var rng := RandomNumberGenerator.new()
	rng.seed = 415
	var player = game.player
	player.aiming = false
	player.velocity = Vector3.ZERO
	var hip: float = player.spread_angle()
	player.aiming = true
	check(player.spread_angle() < hip, "Aiming tightens player spread")
	player.crouched = true
	var crouched: float = player.spread_angle()
	player.crouched = false
	check(crouched < player.spread_angle(), "Crouching improves stability")
	player.velocity.x = 6
	check(player.spread_angle() > hip, "Movement expands dispersion")
	player.velocity = Vector3.ZERO
	player.on_shot()
	check(player.shot_bloom > 0, "Repeated fire adds recoverable bloom")
	var max_angle := player.spread_angle()
	var center: Vector3 = -player.camera.global_basis.z
	var first: Vector3 = player.sample_shot_direction(rng)
	check(first != player.sample_shot_direction(rng), "Shots do not share an identical direction")
	var bounded := true
	for i in range(100):
		if player.sample_shot_direction(rng).angle_to(center) > max_angle + 0.0001:
			bounded = false
	check(bounded, "Sampled projectiles stay inside specified cone")
	game.explode(Vector3(60, 0.1, 60))
	check(get_nodes_in_group("blast_fx").size() == 1, "Blast creates timed fire-smoke-shockwave effect")
	var fx = get_nodes_in_group("blast_fx")[0]
	fx._process(0.3)
	check(not fx.fire.visible and fx.smoke.size() == 6, "Fire ends while smoke lingers")
	fx._process(3)
	await process_frame
	check(get_nodes_in_group("blast_fx").is_empty(), "Transient blast cleans up")
	for suffix in ["", ".bak", ".tmp"]:
		if FileAccess.file_exists(game.save_path + suffix): DirAccess.remove_absolute(game.save_path + suffix)
	game.queue_free()
	await process_frame
	print("Quest/effects checks: %d; failures: %d" % [checks, failures])
	quit(1 if failures else 0)
