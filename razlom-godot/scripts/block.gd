class_name RazlomBlock
extends StaticBody3D
## Layered masonry unit with voxel damage for bricks and true prism geometry for wedges.
const GRID := 8
const CELL := 1.0 / GRID
var durability := 70.0
var block_id := ""
var falling := false
var game
var tint := Color.WHITE
var removed: Dictionary = {}
var block_size := Vector3.ONE
var shape_kind := "box"

func configure_geometry(size: Vector3, kind: String, surface_material: Material) -> void:
	block_size = size
	shape_kind = kind
	var visual := MeshInstance3D.new()
	var render_size := size * 0.994
	if kind.begins_with("right_triangle"):
		visual.mesh = triangle_mesh(render_size, kind.ends_with("mirrored"))
	else:
		var mesh := BoxMesh.new()
		mesh.size = render_size
		visual.mesh = mesh
	visual.material_override = surface_material
	add_child(visual)
	var collision := CollisionShape3D.new()
	if kind.begins_with("right_triangle"):
		var polygon := ConvexPolygonShape3D.new()
		polygon.points = triangle_points(size, kind.ends_with("mirrored"))
		collision.shape = polygon
	else:
		var box := BoxShape3D.new()
		box.size = size
		collision.shape = box
	add_child(collision)

func triangle_points(size: Vector3, mirrored: bool) -> PackedVector3Array:
	var half := size * 0.5
	var sign_x := -1.0 if mirrored else 1.0
	return PackedVector3Array([
		Vector3(-half.x * sign_x, -half.y, -half.z),
		Vector3(half.x * sign_x, -half.y, -half.z),
		Vector3(-half.x * sign_x, half.y, -half.z),
		Vector3(-half.x * sign_x, -half.y, half.z),
		Vector3(half.x * sign_x, -half.y, half.z),
		Vector3(-half.x * sign_x, half.y, half.z),
	])

func triangle_mesh(size: Vector3, mirrored: bool) -> ArrayMesh:
	var points := triangle_points(size, mirrored)
	var a := points[0]
	var b := points[1]
	var c := points[2]
	var a_back := points[3]
	var b_back := points[4]
	var c_back := points[5]
	var surface := SurfaceTool.new()
	surface.begin(Mesh.PRIMITIVE_TRIANGLES)
	var bottom_normal := Vector3.DOWN
	var side_normal := Vector3.LEFT if not mirrored else Vector3.RIGHT
	var slope_normal := Vector3(1 if not mirrored else -1, 1, 0).normalized()
	add_triangle(surface, a, c, b, Vector3.FORWARD)
	add_triangle(surface, a_back, b_back, c_back, Vector3.BACK)
	add_quad(surface, a, b, b_back, a_back, bottom_normal)
	if not mirrored:
		add_quad(surface, a, c, c_back, a_back, side_normal)
		add_quad(surface, b, c, c_back, b_back, slope_normal)
	else:
		add_quad(surface, b, a, a_back, b_back, side_normal)
		add_quad(surface, a, c, c_back, a_back, slope_normal)
	return surface.commit()

func add_quad(surface: SurfaceTool, a: Vector3, b: Vector3, c: Vector3, d: Vector3, normal: Vector3) -> void:
	add_triangle(surface, a, b, c, normal)
	add_triangle(surface, a, c, d, normal)

func add_triangle(surface: SurfaceTool, a: Vector3, b: Vector3, c: Vector3, normal: Vector3) -> void:
	if (b - a).cross(c - a).dot(normal) < 0:
		var swap := b
		b = c
		c = swap
	for point in [a, b, c]:
		surface.set_normal(normal)
		surface.set_uv(Vector2(point.x, point.y))
		surface.add_vertex(point)

func hit(amount: float, impulse: Vector3 = Vector3.ZERO) -> void:
	if falling:
		return
	durability -= amount
	if durability <= 0:
		falling = true
		game.call_deferred("break_block", self, impulse)

func cell_center(index: int) -> Vector3:
	var cell_size := block_size / GRID
	return Vector3(
		(float(index % GRID) + 0.5) * cell_size.x - block_size.x * 0.5,
		(float(int(index / GRID) % GRID) + 0.5) * cell_size.y - block_size.y * 0.5,
		(float(int(index / (GRID * GRID))) + 0.5) * cell_size.z - block_size.z * 0.5
	)

func bullet_hit(point: Vector3, direction: Vector3, diameter: float = 0.012, energy: float = 36.0) -> int:
	if falling or not is_finite(diameter) or diameter <= 0 or energy <= 0 or direction.length_squared() < 0.001:
		return 0
	if shape_kind.begins_with("right_triangle"):
		# A wedge is a single shaped masonry piece, so it breaks as one object.
		hit(999, direction.normalized() * 3.0)
		return 1
	if removed.is_empty() and game.damaged_blocks_count() >= 32:
		return 0
	var entry := to_local(point)
	var axis := (global_basis.inverse() * direction).normalized()
	var depth := clampf(energy / 120.0, CELL, maxf(block_size.x, maxf(block_size.y, block_size.z)))
	var radius := clampf(diameter * 2.0, 0.005, 0.22)
	var cell_size := block_size / GRID
	var changed := 0
	for i in range(GRID * GRID * GRID):
		if removed.has(i):
			continue
		var offset := cell_center(i) - entry
		var along := offset.dot(axis)
		if along < -minf(cell_size.x, minf(cell_size.y, cell_size.z)) * 0.5 or along > depth:
			continue
		if (offset - axis * along).length() <= radius + maxf(cell_size.x, maxf(cell_size.y, cell_size.z)) * 0.7:
			removed[i] = true
			changed += 1
	if changed > 0:
		rebuild_damage()
		game.nav_dirty = true
		if removed.size() >= GRID * GRID * GRID * 0.7:
			hit(999, direction * 3)
	return changed

func rebuild_damage() -> void:
	for child in get_children():
		remove_child(child)
		child.queue_free()
	var surface := SurfaceTool.new()
	surface.begin(Mesh.PRIMITIVE_TRIANGLES)
	var normals: Array[Vector3] = [Vector3.RIGHT, Vector3.LEFT, Vector3.UP, Vector3.DOWN, Vector3.BACK, Vector3.FORWARD]
	var cell_size := block_size / GRID
	for i in range(GRID * GRID * GRID):
		if removed.has(i):
			continue
		var ix := i % GRID
		var iy := int(i / GRID) % GRID
		var iz := int(i / (GRID * GRID))
		var center := cell_center(i)
		for normal in normals:
			var nx := ix + int(normal.x)
			var ny := iy + int(normal.y)
			var nz := iz + int(normal.z)
			if nx >= 0 and nx < GRID and ny >= 0 and ny < GRID and nz >= 0 and nz < GRID and not removed.has(nx + ny * GRID + nz * GRID * GRID):
				continue
			var u: Vector3
			var v: Vector3
			if absf(normal.x) > 0.5:
				u = Vector3(0, cell_size.y, 0)
				v = Vector3(0, 0, cell_size.z)
			elif absf(normal.y) > 0.5:
				u = Vector3(cell_size.x, 0, 0)
				v = Vector3(0, 0, cell_size.z)
			else:
				u = Vector3(cell_size.x, 0, 0)
				v = Vector3(0, cell_size.y, 0)
			var face := center + normal * cell_size.dot(normal.abs()) * 0.5
			var corners: Array[Vector3] = [face - u * 0.5 - v * 0.5, face + u * 0.5 - v * 0.5, face + u * 0.5 + v * 0.5, face - u * 0.5 + v * 0.5]
			# Keep each exposed face front-facing. A fixed quad order silently
			# reversed half the normals, so Godot back-face culling made damaged
			# bricks look transparent after their first hit.
			if (corners[2] - corners[0]).cross(corners[1] - corners[0]).dot(normal) < 0.0:
				var swap := corners[1]
				corners[1] = corners[3]
				corners[3] = swap
			for vertex in [0, 2, 1, 0, 3, 2]:
				surface.set_normal(normal)
				surface.set_uv(Vector2(corners[vertex].x + corners[vertex].z, corners[vertex].y))
				surface.add_vertex(corners[vertex])
	var visual := MeshInstance3D.new()
	visual.mesh = surface.commit()
	visual.material_override = RazlomArt.material(tint, "brick")
	add_child(visual)
	# Merge surviving cells into X-runs: one collision shape per row, not per cell.
	for z in range(GRID):
		for y in range(GRID):
			var x := 0
			while x < GRID:
				if removed.has(x + y * GRID + z * GRID * GRID):
					x += 1
					continue
				var start := x
				while x < GRID and not removed.has(x + y * GRID + z * GRID * GRID):
					x += 1
				var collision := CollisionShape3D.new()
				var shape := BoxShape3D.new()
				shape.size = Vector3((x - start) * cell_size.x, cell_size.y, cell_size.z)
				collision.shape = shape
				collision.position = Vector3((start + x) * cell_size.x * 0.5 - block_size.x * 0.5, (y + 0.5) * cell_size.y - block_size.y * 0.5, (z + 0.5) * cell_size.z - block_size.z * 0.5)
				add_child(collision)
