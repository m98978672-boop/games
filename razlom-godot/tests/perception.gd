extends SceneTree
var game
var failures := 0
var checks := 0

func _initialize() -> void:
	call_deferred("run_tests")

func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		printerr("FAIL: " + label)

func settle() -> void:
	await physics_frame
	await physics_frame

func run_tests() -> void:
	create_timer(30, true).timeout.connect(func(): quit(2))
	game = load("res://scenes/main.tscn").instantiate()
	root.add_child(game)
	await process_frame
	game.resume()
	game.player.set_physics_process(false)
	for enemy in game.enemies:
		enemy.set_physics_process(false)
	var guard = game.enemies[0]
	guard.position = Vector3(0, 0.2, 25)
	guard.visual.rotation = Vector3.ZERO
	guard.alert = false
	game.player.position = Vector3(0, 0.2, 30)
	await settle()
	check(not guard.sees_player(), "Unalerted guard cannot see through the back of its head")
	game.player.position = Vector3(0, 0.2, 20)
	await settle()
	check(guard.sees_player(), "Visible target in front is detected")
	var wall := RazlomArt.box(game.world, Vector3(0, 1.5, 22.5), Vector3(4, 3, 0.6), RazlomArt.material(Color.WHITE, "concrete"), true)
	await settle()
	check(not guard.sees_player(), "Opaque geometry blocks sight")
	var health: float = game.state.health
	for i in range(20):
		game.enemy_fire(guard)
	check(game.state.health == health, "Enemy shots cannot damage through opaque wall")
	game.noise(game.player.position, 7)
	check(not guard.alert, "Wall attenuates a short-range sound")
	check(game.blast_exposure(Vector3(0, 1, 20), Vector3(0, 1, 25)) == 0.15, "Wall attenuates blast exposure")
	game.refresh_navigation()
	var path: Array[Vector2i] = game.navigation.get_id_path(Vector2i(0, 25), Vector2i(0, 20))
	check(path.size() > 6, "Pathfinder detours around the wall")
	for cell in path:
		check(not game.navigation.is_point_solid(cell), "Path avoids solid cells")
	wall.queue_free()
	await settle()
	game.refresh_navigation()
	check(game.navigation.get_id_path(Vector2i(0,25), Vector2i(0,20)).size() == 6, "Destroyed obstacle reopens shortest route")
	game.noise(game.player.position, 7)
	check(guard.alert, "Same sound is heard when unobstructed")
	game.player.camera.look_at(guard.global_position + Vector3.UP, Vector3.UP)
	await settle()
	var before: float = guard.health
	game.fire()
	check(guard.health < before, "Player fire uses a real ray against enemy collision")
	for i in range(20):
		game.enemy_fire(guard)
	check(game.state.health < health, "Visible enemy can damage player")
	print("Perception checks: %d; failures: %d" % [checks, failures])
	game.queue_free()
	await process_frame
	quit(1 if failures > 0 else 0)
