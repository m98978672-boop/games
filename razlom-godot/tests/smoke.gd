extends SceneTree
## Run after Godot imports the project. Does not write player saves.
func _initialize() -> void:
	call_deferred("run_tests")

func run_tests() -> void:
	var state_script = load("res://scripts/state.gd")
	var state = state_script.new()
	assert(state.ammo == 18)
	state.ammo = 2
	assert(state.reload_gun() == 16)
	assert(state.ammo == 18 and state.reserve == 38)
	state.health = 50
	assert(state.use_item("heal"))
	assert(state.health == 95 and state.medkits == 1)
	var snapshot: Dictionary = state.snapshot()
	var copy = state_script.new()
	assert(copy.restore(snapshot))
	assert(copy.snapshot() == snapshot)
	snapshot["health"] = -1
	assert(not copy.restore(snapshot))
	var before: float = copy.water
	copy.tick(10, false)
	assert(copy.water < before)
	var scene = load("res://scenes/main.tscn").instantiate()
	root.add_child(scene)
	await process_frame
	assert(scene.blocks.size() == 250)
	assert(scene.enemies.size() == 3)
	assert(scene.player.camera != null)
	assert(scene.state.pump == false)
	scene.resume()
	await physics_frame
	assert(scene.player.global_position.y > -1)
	var count: int = scene.blocks.size()
	scene.blocks["back_8_0"].hit(999)
	await process_frame
	await process_frame
	assert(scene.blocks.size() < count)
	assert(scene.destroyed.has("back_8_0"))
	assert(scene.active_debris <= 32)
	assert(scene.validate_world_save({}) == false)
	print("PASS: Godot state, scene, level, destruction, debris budget, validation")
	quit(0)
