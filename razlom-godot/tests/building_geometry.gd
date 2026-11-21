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
	var brick: RazlomBlock = game.blocks["back_8_0"]
	var brick_visual := brick.get_child(0) as MeshInstance3D
	var brick_collision := brick.get_child(1) as CollisionShape3D
	check(brick.block_size.is_equal_approx(Vector3(1, 1, 0.36)), "Warehouse bricks use realistic thin masonry depth")
	check(brick_visual.mesh is BoxMesh and (brick_visual.mesh as BoxMesh).size.x > 0.99, "Brick faces leave only a hairline mortar joint")
	check(brick_collision.shape is BoxShape3D and (brick_collision.shape as BoxShape3D).size.is_equal_approx(brick.block_size), "Collision fills every masonry joint without gaps")
	var neighbor: RazlomBlock = game.blocks["back_9_0"]
	check(is_equal_approx(brick.position.x + brick.block_size.x, neighbor.position.x), "Adjacent brick courses meet edge-to-edge")
	var first_stagger: RazlomBlock = game.blocks["back_stagger_8_1"]
	var left_half: RazlomBlock = game.blocks["back_left_half_1"]
	var last_stagger: RazlomBlock = game.blocks["back_stagger_23_1"]
	var right_half: RazlomBlock = game.blocks["back_right_half_1"]
	check(is_equal_approx(left_half.position.x + left_half.block_size.x * 0.5, first_stagger.position.x - first_stagger.block_size.x * 0.5), "Half brick bonds into the staggered course")
	check(is_equal_approx(last_stagger.position.x + last_stagger.block_size.x * 0.5, right_half.position.x - right_half.block_size.x * 0.5), "Opposite half brick closes the staggered course")
	check(brick.get_meta("course") != first_stagger.get_meta("course") and brick.tint != first_stagger.tint, "Foundation and upper masonry courses have distinct layers")
	var wedge: RazlomBlock = game.blocks["gable_wedge_8_-24"]
	var wedge_visual := wedge.get_child(0) as MeshInstance3D
	var wedge_collision := wedge.get_child(1) as CollisionShape3D
	check(wedge.shape_kind == "right_triangle" and wedge_visual.mesh is ArrayMesh, "Building contains true right-triangle prism blocks")
	check(wedge_collision.shape is ConvexPolygonShape3D and (wedge_collision.shape as ConvexPolygonShape3D).points.size() == 6, "Triangular blocks have matching six-vertex solid collision")
	var mirrored: RazlomBlock = game.blocks["gable_wedge_24_-24"]
	check(mirrored.shape_kind == "right_triangle_mirrored", "Opposite gable uses the mirrored triangle orientation")
	game.queue_free()
	await process_frame
	print("Building geometry checks: %d; failures: %d" % [checks, failures])
	quit(1 if failures > 0 else 0)
