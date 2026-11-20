extends SceneTree
var checks := 0
var failures := 0
var game
var path := "user://razlom-memory-test.json"

func _initialize() -> void:
	call_deferred("run_tests")

func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		printerr("FAIL: " + label)

func freeze_actors() -> void:
	game.player.set_physics_process(false)
	game.dog.set_physics_process(false)
	for guard in game.enemies:
		guard.set_physics_process(false)

func run_tests() -> void:
	create_timer(45, true).timeout.connect(func(): quit(2))
	var book := RazlomAIMemory.new()
	check(book.focus().is_empty(), "Fresh AI has no invented contact")
	book.observe(Vector3(1, 0, 1), "sight", 1)
	book.observe(Vector3(1.1, 0, 1), "sight", 1)
	check(book.events.size() == 1, "Repeated visual scans coalesce into one episode")
	book.tick(2)
	book.observe(Vector3(8, 0, 2), "sound", 0.65)
	check(book.focus().source == "sight", "Recent direct evidence outranks an uncertain noise")
	book.tick(29)
	check(book.focus().is_empty(), "Old contact loses active certainty")
	check(book.events.size() == 2, "Expired pursuit still leaves episodic history")
	var saved := book.snapshot()
	var copy := RazlomAIMemory.new()
	check(copy.restore(saved), "Validated memory restores")
	check(copy.snapshot() == saved, "All evidence sources and ages round-trip")
	saved[0].position[0] = 99
	check(copy.events[0].point.x < 2, "Restored memory does not alias a save dictionary")
	var before := copy.snapshot()
	check(not copy.restore([{"source": "sight"}]), "Malformed episode is rejected")
	check(copy.snapshot() == before, "Failed restore is atomic")
	var bad := before.duplicate(true)
	bad[0].age = NAN
	check(not RazlomAIMemory.valid(bad), "Non-finite episode time rejected")
	bad = before.duplicate(true)
	bad[0].confidence = 2
	check(not RazlomAIMemory.valid(bad), "Impossible confidence rejected")
	for i in range(40):
		book.observe(Vector3(i * 3, 0, 0), "sound", 0.65)
	check(book.events.size() == 12, "History stays bounded under a noise flood")
	book.tick(181)
	check(book.events.is_empty(), "Long-term forgetting releases old events")
	game = load("res://scenes/main.tscn").instantiate()
	game.save_path = path
	root.add_child(game)
	await process_frame
	game.resume()
	freeze_actors()
	var guard = game.enemies[0]
	var ally = game.enemies[1]
	var distant = game.enemies[2]
	guard.position = Vector3(0, 0.3, 25)
	ally.position = Vector3(5, 0.3, 25)
	distant.position = Vector3(45, 0.3, 25)
	game.player.position = Vector3(-50, 0.3, -50)
	guard.remember_sighting(Vector3(0, 0.3, 20))
	check(ally.awareness.focus().source == "radio", "Nearby guard receives a lower-certainty report")
	check(distant.awareness.events.is_empty(), "Distant guards do not receive global omniscient alerts")
	check(ally.last_seen != game.player.position, "Radio does not read hidden player position")
	guard.visible_contact = false
	var target: Vector3 = guard.choose_target(0.1)
	check(target.distance_to(Vector3(0, 0.3, 20)) < 0.01 and guard.behavior == "investigate", "Lost visual contact investigates last observed location")
	game.player.position = Vector3(50, 0.3, -50)
	check(guard.choose_target(0.1) == target, "Unseen movement cannot move remembered target")
	guard.position = target
	guard.choose_target(0.1)
	check(guard.behavior == "search", "Reaching last known location starts a local search")
	for i in range(3):
		guard.choose_target(5.1)
	guard.choose_target(0.1)
	check(not guard.alert, "Unsuccessful local search ends instead of chasing forever")
	check(guard.awareness.events[0].cleared, "Searched episode remains in history marked checked")
	guard.awareness.observe(Vector3(20, 0.3, 20), "sound", 0.65)
	guard.search_step = 2
	guard.behavior = "search"
	var fresh_target: Vector3 = guard.choose_target(0.1)
	check(guard.behavior == "investigate" and guard.search_step == 0, "New evidence elsewhere resets an old search route")
	check(fresh_target == Vector3(20, 0.3, 20), "New search heads to observed evidence rather than the hidden player")
	guard.position = fresh_target
	guard.choose_target(0.1)
	guard.position += Vector3(2.0, 0, 0)
	guard.choose_target(0.1)
	check(guard.behavior == "search", "First search leg does not oscillate back to the evidence centre")
	guard.awareness.events.clear()
	guard.hit(1)
	check(guard.awareness.focus().source == "damage", "Unseen damage is recorded as danger evidence")
	check(guard.awareness.focus().point == guard.global_position, "Unseen hit cannot reveal shooter's exact coordinates")
	guard.awareness.events.clear()
	guard.awareness.observe(Vector3(10, 0.3, 10), "sight", 1)
	guard.awareness.tick(40)
	for actor in game.enemies:
		actor.alert = false
	game.player.position = Vector3(-22, 0.4, 22)
	check(game.save_game(), "Inactive remembered evidence does not prevent a safe checkpoint")
	var data: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(path))
	check(data.guards[0].memory.size() == 1, "Checkpoint includes AI episodes")
	check(game.load_game(), "Checkpoint with AI memory loads")
	freeze_actors()
	check(game.enemies[0].awareness.events.size() == 1, "Guard history survives world reconstruction")
	check(game.enemies[0].awareness.events[0].age == 40, "Load preserves evidence age, not permanent fresh alert")
	data.guards[0].memory[0].confidence = -1
	check(not game.validate_world_save(data), "Corrupt AI evidence invalidates checkpoint before rebuilding world")
	for record in data.guards:
		record.erase("memory")
	check(game.validate_world_save(data), "Older saves without memory remain compatible")
	for suffix in ["", ".bak", ".tmp"]:
		if FileAccess.file_exists(path + suffix):
			DirAccess.remove_absolute(path + suffix)
	game.queue_free()
	await process_frame
	print("AI memory checks: %d; failures: %d" % [checks, failures])
	quit(1 if failures > 0 else 0)
