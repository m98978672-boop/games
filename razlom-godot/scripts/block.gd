class_name RazlomBlock
extends StaticBody3D
## Lazy 8^3 material grid. Quantized gameplay destruction, not per-pixel fracture.
const GRID := 8
const CELL := 1.0 / GRID
var durability := 70.0
var block_id := ""
var falling := false
var game
var tint: Color
var removed: Dictionary = {}

func hit(amount: float, impulse: Vector3 = Vector3.ZERO) -> void:
	if falling:
		return
	durability -= amount
	if durability <= 0:
		falling = true
		game.call_deferred("break_block", self, impulse)

func cell_center(index: int) -> Vector3:
	return Vector3(index % GRID, int(index / GRID) % GRID, int(index / (GRID * GRID))) * CELL + Vector3.ONE * (CELL * 0.5 - 0.5)

func bullet_hit(point: Vector3, direction: Vector3, diameter: float = 0.012, energy: float = 36.0) -> int:
	if falling or not is_finite(diameter) or diameter <= 0 or energy <= 0 or direction.length_squared() < 0.001:
		return 0
	if removed.is_empty() and game.damaged_blocks_count() >= 32:
		return 0
	var entry := to_local(point)
	var axis := (global_basis.inverse() * direction).normalized()
	var depth := clampf(energy / 120.0, CELL, 0.65)
	var radius := clampf(diameter * 2.0, 0.005, 0.22)
	var changed := 0
	for i in range(GRID * GRID * GRID):
		if removed.has(i):
			continue
		var offset := cell_center(i) - entry
		var along := offset.dot(axis)
		if along < -CELL * 0.5 or along > depth:
			continue
		if (offset - axis * along).length() <= radius + CELL * 0.7:
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
	for i in range(GRID * GRID * GRID):
		if removed.has(i):
			continue
		var center := cell_center(i)
		for normal in normals:
			var neighbor := center + normal * CELL
			var nx := int(round((neighbor.x + 0.5) / CELL - 0.5))
			var ny := int(round((neighbor.y + 0.5) / CELL - 0.5))
			var nz := int(round((neighbor.z + 0.5) / CELL - 0.5))
			if nx >= 0 and nx < GRID and ny >= 0 and ny < GRID and nz >= 0 and nz < GRID and not removed.has(nx + ny * GRID + nz * GRID * GRID):
				continue
			var u: Vector3 = Vector3.UP if absf(normal.y) < 0.5 else Vector3.RIGHT
			var v: Vector3 = normal.cross(u)
			var face: Vector3 = center + normal * CELL * 0.5
			var corners: Array[Vector3] = [face - u * CELL * 0.5 - v * CELL * 0.5, face + u * CELL * 0.5 - v * CELL * 0.5, face + u * CELL * 0.5 + v * CELL * 0.5, face - u * CELL * 0.5 + v * CELL * 0.5]
			for vertex in [0, 2, 1, 0, 3, 2]:
				surface.set_normal(normal)
				surface.set_uv(Vector2(corners[vertex].x + corners[vertex].z, corners[vertex].y))
				surface.add_vertex(corners[vertex])
	var visual := MeshInstance3D.new()
	visual.mesh = surface.commit()
	visual.material_override = RazlomArt.material(Color.WHITE, "brick")
	add_child(visual)
	# Merge surviving cells into X-runs: at most 64 collision shapes, not 512 bodies.
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
				shape.size = Vector3((x - start) * CELL, CELL, CELL)
				collision.shape = shape
				collision.position = Vector3((start + x) * CELL * 0.5 - 0.5, (y + 0.5) * CELL - 0.5, (z + 0.5) * CELL - 0.5)
				add_child(collision)
