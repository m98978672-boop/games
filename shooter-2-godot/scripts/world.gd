extends RefCounted
class_name SH2World
## СЕКТОР «ПЕПЕЛ» — мир: коллизии, лучи, видимость, укрытия (порт).
##
## Всё в 2.5D: AABB по X/Z + высота. Дёшево и достаточно точно.
##   solid: круг против AABB с разрешением по минимальной оси
##   ray_hit: луч против AABB (пули) + попадание в цилиндр бойца
##   has_los: луч от глаз до цели
##   сетка занятости для укрытий и обхода

var map: Dictionary
var colliders: Array
var half: float
var grid: PackedByteArray
var grid_n: int = 0
var cell: float = 4.0


func _init(map_data: Dictionary, collider_list: Array) -> void:
	map = map_data
	colliders = collider_list
	half = float(map.get("size", 80.0)) * 0.5 - 1.2
	_build_grid()


func _build_grid() -> void:
	grid_n = int(ceil((half * 2.0) / cell))
	grid = PackedByteArray()
	grid.resize(grid_n * grid_n)
	grid.fill(0)
	for c in colliders:
		var x0: int = maxi(0, int(floor((float(c["x"]) - float(c["hw"]) + half) / cell)))
		var x1: int = mini(grid_n - 1, int(floor((float(c["x"]) + float(c["hw"]) + half) / cell)))
		var z0: int = maxi(0, int(floor((float(c["z"]) - float(c["hd"]) + half) / cell)))
		var z1: int = mini(grid_n - 1, int(floor((float(c["z"]) + float(c["hd"]) + half) / cell)))
		for z in range(z0, z1 + 1):
			for x in range(x0, x1 + 1):
				grid[z * grid_n + x] = 1


func is_blocked_cell(x: float, z: float) -> bool:
	if grid.is_empty():
		return false
	var gx: int = int(floor((x + half) / cell))
	var gz: int = int(floor((z + half) / cell))
	if gx < 0 or gz < 0 or gx >= grid_n or gz >= grid_n:
		return true
	return grid[gz * grid_n + gx] == 1


## Разрешение столкновений круга с миром.
## Vector2 в GDScript — значимый тип, поэтому результат возвращаем словарём.
func resolve_circle(pos: Vector2, radius: float) -> Dictionary:
	var out := pos
	var lim: float = half - radius
	out.x = clampf(out.x, -lim, lim)
	out.y = clampf(out.y, -lim, lim)
	var hit := false
	for c in colliders:
		var cx: float = clampf(out.x, float(c["x"]) - float(c["hw"]), float(c["x"]) + float(c["hw"]))
		var cz: float = clampf(out.y, float(c["z"]) - float(c["hd"]), float(c["z"]) + float(c["hd"]))
		var dx: float = out.x - cx
		var dz: float = out.y - cz
		var d2: float = dx * dx + dz * dz
		if d2 > radius * radius:
			continue
		hit = true
		if d2 < 1e-8:
			var ox: float = (float(c["hw"]) + radius) - absf(out.x - float(c["x"]))
			var oz: float = (float(c["hd"]) + radius) - absf(out.y - float(c["z"]))
			if ox < oz:
				out.x = float(c["x"]) + signf(out.x - float(c["x"]) if out.x != float(c["x"]) else 1.0) \
					* (float(c["hw"]) + radius)
			else:
				out.y = float(c["z"]) + signf(out.y - float(c["z"]) if out.y != float(c["z"]) else 1.0) \
					* (float(c["hd"]) + radius)
		else:
			var d: float = sqrt(d2)
			var push: float = (radius - d) / d
			out.x += dx * push
			out.y += dz * push
	out.x = clampf(out.x, -lim, lim)
	out.y = clampf(out.y, -lim, lim)
	return {"pos": out, "hit": hit}


## Луч против AABB (слэб-метод). Возвращает t или -1
static func ray_box(ox: float, oy: float, oz: float, dx: float, dy: float, dz: float,
		cx: float, cy: float, cz: float, hw: float, h: float, hd: float, max_t: float) -> float:
	var tmin := 0.0
	var tmax := max_t
	var min_x := cx - hw
	var max_x := cx + hw
	var min_y := cy
	var max_y := cy + h
	var min_z := cz - hd
	var max_z := cz + hd
	for axis in 3:
		var o: float = [ox, oy, oz][axis]
		var d: float = [dx, dy, dz][axis]
		var mn: float = [min_x, min_y, min_z][axis]
		var mx: float = [max_x, max_y, max_z][axis]
		if absf(d) < 1e-9:
			if o < mn or o > mx:
				return -1.0
		else:
			var t1: float = (mn - o) / d
			var t2: float = (mx - o) / d
			if t1 > t2:
				var tmp := t1
				t1 = t2
				t2 = tmp
			tmin = maxf(tmin, t1)
			tmax = minf(tmax, t2)
			if tmin > tmax:
				return -1.0
	return tmin


## Ближайшее пересечение луча с миром. Возвращает {t, collider} или {}
func ray_colliders(origin: Vector3, dir: Vector3, max_t: float) -> Dictionary:
	var best_t := max_t
	var best = null
	for c in colliders:
		var px: float = float(c["x"]) - origin.x
		var pz: float = float(c["z"]) - origin.z
		var far: float = sqrt(float(c["hw"]) * float(c["hw"]) + float(c["hd"]) * float(c["hd"])) + max_t
		if px * px + pz * pz > far * far:
			continue
		var t: float = ray_box(origin.x, origin.y, origin.z, dir.x, dir.y, dir.z,
			float(c["x"]), 0.0, float(c["z"]), float(c["hw"]), float(c["h"]), float(c["hd"]), best_t)
		if t >= 0.0 and t < best_t:
			best_t = t
			best = c
	if best == null:
		return {}
	return {"t": best_t, "collider": best}


func has_los(a: Vector3, b: Vector3) -> bool:
	var d: Vector3 = b - a
	var length: float = d.length()
	if length < 1e-4:
		return true
	return ray_colliders(a, d / length, length - 0.05).is_empty()


## Пересечение луча с вертикальным цилиндром (боец)
static func ray_cylinder(origin: Vector3, dir: Vector3, cx: float, cz: float, radius: float,
		y0: float, y1: float, max_t: float) -> float:
	var ox: float = origin.x - cx
	var oz: float = origin.z - cz
	var a: float = dir.x * dir.x + dir.z * dir.z
	var b: float = 2.0 * (ox * dir.x + oz * dir.z)
	var c: float = ox * ox + oz * oz - radius * radius
	var t := -1.0
	if a < 1e-9:
		if c > 0.0:
			return -1.0
		t = 0.0
	else:
		var disc: float = b * b - 4.0 * a * c
		if disc < 0.0:
			return -1.0
		var sq: float = sqrt(disc)
		var t1: float = (-b - sq) / (2.0 * a)
		var t2: float = (-b + sq) / (2.0 * a)
		t = t1 if t1 > 0.0 else t2
		if t < 0.0:
			return -1.0
	if t > max_t:
		return -1.0
	var y: float = origin.y + dir.y * t
	if y < y0 or y > y1:
		# может, попадание сверху/снизу — грубая проверка по второй точке
		var t3: float = (y1 - origin.y) / dir.y if absf(dir.y) > 1e-6 else -1.0
		if t3 >= 0.0 and t3 <= max_t:
			var hit := Vector2(origin.x + dir.x * t3 - cx, origin.z + dir.z * t3 - cz)
			if hit.length() <= radius:
				return t3
		return -1.0
	return t


## Открытая точка рядом
func random_open_point(x: float, z: float, min_r: float, max_r: float, rng: RandomNumberGenerator = null) -> Dictionary:
	var r: RandomNumberGenerator = rng if rng != null else RandomNumberGenerator.new()
	for _attempt in 22:
		var ang: float = r.randf() * TAU
		var dist: float = min_r + r.randf() * maxf(0.01, max_r - min_r)
		var px: float = x + cos(ang) * dist
		var pz: float = z + sin(ang) * dist
		if absf(px) > half or absf(pz) > half:
			continue
		if is_blocked_cell(px, pz):
			continue
		return {"x": px, "z": pz}
	return {}


## Точка укрытия за препятствием от угрозы
func find_cover(from_x: float, from_z: float, threat_x: float, threat_z: float, radius: float = 14.0) -> Dictionary:
	var best: Dictionary = {}
	var best_score := -1e9
	for a in 12:
		var dist := 3.0
		while dist < radius:
			var ang: float = TAU * float(a) / 12.0
			var x: float = from_x + cos(ang) * dist
			var z: float = from_z + sin(ang) * dist
			dist += 2.2
			if is_blocked_cell(x, z):
				continue
			var inside := false
			for c in colliders:
				if absf(x - float(c["x"])) < float(c["hw"]) + 0.5 \
						and absf(z - float(c["z"])) < float(c["hd"]) + 0.5:
					inside = true
					break
			if inside:
				continue
			var to_threat: float = atan2(threat_z - z, threat_x - x)
			var cx: float = x + cos(to_threat) * 2.2
			var cz: float = z + sin(to_threat) * 2.2
			var covered := false
			for c2 in colliders:
				if absf(cx - float(c2["x"])) < float(c2["hw"]) \
						and absf(cz - float(c2["z"])) < float(c2["hd"]):
					covered = true
					break
			var score: float = (3.0 if covered else 0.0) - dist * 0.12 \
				+ (2.0 if not has_los(Vector3(x, 1.6, z), Vector3(threat_x, 1.6, threat_z)) else 0.0)
			if score > best_score:
				best_score = score
				best = {"x": x, "z": z}
	if best.is_empty():
		return random_open_point(from_x, from_z, 3.0, 8.0)
	return best


## Направление обхода (простое расталкивание от препятствий)
func steer(x: float, z: float, tx: float, tz: float, radius: float = 0.4) -> Dictionary:
	var dir := Vector2(tx - x, tz - z)
	if dir.length_squared() < 1e-6:
		return {"x": 0.0, "z": 0.0, "reached": true}
	dir = dir.normalized()
	var avoid := Vector2.ZERO
	for c in colliders:
		var cx: float = clampf(x + dir.x * radius * 2.0, float(c["x"]) - float(c["hw"]),
			float(c["x"]) + float(c["hw"]))
		var cz: float = clampf(z + dir.y * radius * 2.0, float(c["z"]) - float(c["hd"]),
			float(c["z"]) + float(c["hd"]))
		var d := Vector2(x + dir.x * radius * 2.0 - cx, z + dir.y * radius * 2.0 - cz)
		if d.length() < radius * 2.0 and d.length() > 1e-6:
			avoid += d.normalized() * (1.0 - d.length() / (radius * 2.0))
	var out: Vector2 = (dir + avoid * 1.4).normalized()
	return {"x": out.x, "z": out.y, "reached": dir.length() < 0.1}
