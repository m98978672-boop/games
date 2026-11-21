extends SceneTree
var game
var checks := 0
var failures := 0
var test_save := "user://razlom-destruction-only.json"

func _initialize() -> void:
	call_deferred("run_tests")

func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		printerr("FAIL: " + label)

func freeze_actors() -> void:
	game.player.set_physics_process(false)
	if is_instance_valid(game.dog):
		game.dog.set_physics_process(false)
	for guard in game.enemies:
		if is_instance_valid(guard):
			guard.set_physics_process(false)
			guard.alert = false

func run_tests() -> void:
	create_timer(40, true).timeout.connect(func(): quit(2))
	game = load("res://scenes/main.tscn").instantiate()
	game.save_path = test_save
	root.add_child(game)
	await process_frame
	game.resume()
	freeze_actors()
	game.player.position = Vector3(-40, 0.3, 30)
	await physics_frame
	var brick_finishes: Dictionary = {}
	var brick_shapes: Dictionary = {}
	for block in game.blocks.values():
		var mesh_instance: MeshInstance3D = block.get_child(0)
		var material := mesh_instance.material_override as StandardMaterial3D
		brick_finishes[str(material.albedo_color)] = true
		if mesh_instance.mesh is BoxMesh:
			brick_shapes[str((mesh_instance.mesh as BoxMesh).size)] = true
		else:
			brick_shapes[str(block.shape_kind)] = true
	check(brick_finishes.size() >= 4 and brick_shapes.size() >= 4, "Warehouse infill has many stable tint and shape variants")
	game.explode(Vector3(16, 0.8, -26))
	await process_frame
	await process_frame
	check(game.blocks.size() < 250, "Real blast breaks exposed infill")
	for y in range(4):
		check(game.destroyed.has("back_16_%d" % y), "Unsupported section collapses from the base")
	check(game.active_debris > 0 and game.active_debris <= 32, "Rigid debris created under active-body budget")
	check(game.state.health > 99, "Distant player unaffected")
	# Let actual PhysicsServer3D integrate and then freeze the fragments.
	await create_timer(12.2, false).timeout
	check(game.active_debris == 0, "All fragments eventually settle")
	var pieces := get_nodes_in_group("rubble")
	check(not pieces.is_empty(), "Settled rubble is not silently deleted")
	for piece in pieces:
		check(piece.freeze and piece.collision_layer == 1, "Settled rubble keeps a physical collision")
	freeze_actors()
	game.player.position = Vector3(-22, 0.4, 22)
	check(game.save_game(), "Settled ruins are saveable")
	var count := pieces.size()
	var destroyed_count: int = game.destroyed.size()
	check(game.load_game(), "Ruins checkpoint loads")
	freeze_actors()
	await physics_frame
	await process_frame
	check(get_nodes_in_group("rubble").size() == count, "Ruins restore with exact object count")
	check(game.destroyed.size() == destroyed_count, "Destruction IDs persist")
	var old_charges: int = game.state.charges
	game.throw_charge()
	check(game.active_charges == 1, "Delayed charge is tracked")
	check(not game.save_game(), "Cannot save an unresolved charge")
	check(game.load_game(), "Can return to a safe older snapshot")
	freeze_actors()
	await create_timer(2.0, false).timeout
	check(game.active_charges == 0, "Old-world timer cannot alter new-world counters")
	check(game.destroyed.size() == destroyed_count, "Old-world timer cannot explode after load")
	check(game.state.charges == old_charges, "Reload restores charge inventory")
	for suffix in ["", ".bak", ".tmp"]:
		if FileAccess.file_exists(test_save + suffix):
			DirAccess.remove_absolute(test_save + suffix)
	print("Destruction checks: %d; failures: %d" % [checks, failures])
	game.queue_free()
	await process_frame
	quit(1 if failures > 0 else 0)
