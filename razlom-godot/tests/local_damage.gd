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
	game.save_path = "user://razlom-local-damage-test.json"
	root.add_child(game)
	await process_frame
	game.resume()
	game.player.set_physics_process(false)
	game.dog.set_physics_process(false)
	for guard in game.enemies:
		guard.set_physics_process(false)
	var block = game.blocks.values()[0]
	var id: String = block.block_id
	var before: int = game.blocks.size()
	var entry: Vector3 = block.to_global(Vector3(0.04, 0.04, block.block_size.z * 0.5 + 0.04))
	var changed: int = block.bullet_hit(entry, Vector3.FORWARD, 0.012, 36)
	check(changed > 0 and changed < 100, "Small bullet removes a local subset, not the entire metre block")
	var damaged_visual := block.get_child(0) as MeshInstance3D
	var damaged_arrays: Array = damaged_visual.mesh.surface_get_arrays(0)
	var damaged_vertices: PackedVector3Array = damaged_arrays[Mesh.ARRAY_VERTEX]
	var damaged_normals: PackedVector3Array = damaged_arrays[Mesh.ARRAY_NORMAL]
	var faces_are_outward := damaged_vertices.size() > 0 and damaged_vertices.size() % 3 == 0
	for vertex in range(0, damaged_vertices.size(), 3):
		var face_normal := (damaged_vertices[vertex + 1] - damaged_vertices[vertex]).cross(damaged_vertices[vertex + 2] - damaged_vertices[vertex]).normalized()
		if face_normal.dot(damaged_normals[vertex]) < 0.99:
			faces_are_outward = false
	check(faces_are_outward, "Rebuilt damage mesh keeps every exposed brick face front-facing")
	check(game.blocks.size() == before and block.durability == 70, "Local hit does not trigger whole-column collapse")
	check(not block.removed.has(0), "Far corner remains solid")
	var small: int = block.removed.size()
	block.removed.clear()
	block.bullet_hit(entry, Vector3.FORWARD, 0.09, 36)
	check(block.removed.size() > small, "Larger projectile makes a wider quantized channel")
	block.removed.clear()
	block.bullet_hit(entry, Vector3(0.6, 0, -1).normalized(), 0.012, 60)
	var diagonal: Array = block.removed.keys()
	block.removed.clear()
	block.bullet_hit(entry, Vector3.FORWARD, 0.012, 60)
	check(block.removed.keys() != diagonal, "Direction changes the removed material path")
	var shape_count := 0
	for child in block.get_children():
		if child is CollisionShape3D:
			shape_count += 1
	check(shape_count > 0 and shape_count <= 80, "Collision is rebuilt from merged runs within budget")
	var count: int = block.removed.size()
	check(block.bullet_hit(entry, Vector3.ZERO) == 0 and block.removed.size() == count, "Invalid direction cannot mutate material")
	game.player.position = Vector3(-23, 0.4, 22)
	for guard in game.enemies:
		guard.alert = false
	check(game.save_game(), "Checkpoint saves local material damage")
	check(game.load_game(), "Checkpoint with local damage loads")
	check(game.blocks[id].removed.size() == count, "Removed material survives rebuilding the level")
	var saved: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(game.save_path))
	var malformed: Dictionary = saved.duplicate(true)
	malformed.local_damage[id] = [0, 0]
	check(not game.validate_world_save(malformed), "Duplicate damaged cell IDs are rejected")
	malformed = saved.duplicate(true)
	malformed.local_damage[id] = [512]
	check(not game.validate_world_save(malformed), "Out-of-range damaged cells are rejected")
	malformed = saved.duplicate(true)
	malformed.erase("local_damage")
	check(game.validate_world_save(malformed), "Legacy world saves remain valid")
	var guard = game.enemies[0]
	guard.set_physics_process(false)
	guard.hit_at(1, guard.visual.to_global(Vector3(0, 1.65, -0.3)), Vector3.FORWARD, Vector3.BACK)
	check(guard.last_hit_region == "head" and guard.impact_marks.size() == 1, "Model hit location selects head reaction and bounded mark")
	var rig := RazlomArmRig.new(game.player.camera)
	var shoulder := Vector3(-0.24, -0.26, 0.12)
	var wrist := Vector3(-0.15, -0.3, -0.7)
	rig.solve(shoulder, wrist, -1)
	check(rig.wrist.is_equal_approx(wrist), "Arm reaches its exact moving weapon grip")
	var start: Vector3 = rig.segments[0].position - rig.segments[0].basis.z.normalized() * rig.segments[0].scale.z * -0.5
	check(start.distance_to(shoulder) < 0.001, "Upper arm starts at body-fixed shoulder")
	rig.solve(shoulder, wrist + Vector3(0.1, -0.15, 0.12), -1)
	check(rig.wrist.distance_to(wrist) > 0.1, "Reload target changes elbow and forearm placement")
	for suffix in ["", ".bak", ".tmp"]:
		if FileAccess.file_exists(game.save_path + suffix):
			DirAccess.remove_absolute(game.save_path + suffix)
	game.queue_free()
	await process_frame
	print("Local damage checks: %d; failures: %d" % [checks, failures])
	quit(1 if failures > 0 else 0)
