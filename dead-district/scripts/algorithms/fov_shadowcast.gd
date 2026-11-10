class_name FovShadowcast
extends RefCounted
## Рекурсивный 8-октантный Shadowcasting FOV (алгоритм Bjorn Bergstrom / RogueBasin).
## Временная сложность: O(R^2) на кадр при обновлении обзора игрока.

const MULTIPLIERS: Array = [
	[1, 0, 0, -1, -1, 0, 0, 1],
	[0, 1, -1, 0, 0, -1, 1, 0],
	[0, 1, 1, 0, 0, -1, -1, 0],
	[1, 0, 0, 1, -1, 0, 0, -1]
]


static func compute_fov(origin: Vector2i, radius: int, is_opaque: Callable) -> Dictionary:
	var r := radius
	if r <= 0:
		ErrorManager.warn("E802", "FovShadowcast", "Радиус FOV <= 0, выставлен дефолт 12", {"radius": radius})
		r = 12

	var visible: Dictionary = {origin: true}
	for octant in range(8):
		_cast_light(origin, r, 1, 1.0, 0.0, octant, is_opaque, visible)
	return visible


static func _cast_light(
	origin: Vector2i,
	radius: int,
	row: int,
	start_slope: float,
	end_slope: float,
	octant: int,
	is_opaque: Callable,
	visible: Dictionary
) -> void:
	if start_slope < end_slope:
		return

	var next_start := start_slope
	var xx: int = MULTIPLIERS[0][octant]
	var xy: int = MULTIPLIERS[1][octant]
	var yx: int = MULTIPLIERS[2][octant]
	var yy: int = MULTIPLIERS[3][octant]
	var r2 := radius * radius

	for i in range(row, radius + 1):
		var blocked := false
		var dy := -i
		for dx in range(-i, 1):
			var l_slope := (float(dx) - 0.5) / (float(dy) + 0.5)
			var r_slope := (float(dx) + 0.5) / (float(dy) - 0.5)
			if start_slope < r_slope:
				continue
			elif end_slope > l_slope:
				break

			var sax := dx * xx + dy * xy
			var say := dx * yx + dy * yy
			var tile := Vector2i(origin.x + sax, origin.y + say)

			if dx * dx + dy * dy <= r2:
				visible[tile] = true

			var opaque := bool(is_opaque.call(tile))
			if blocked:
				if opaque:
					next_start = r_slope
					continue
				else:
					blocked = false
					start_slope = next_start
			elif opaque and i < radius:
				blocked = true
				_cast_light(origin, radius, i + 1, start_slope, l_slope, octant, is_opaque, visible)
				next_start = r_slope
		if blocked:
			break
