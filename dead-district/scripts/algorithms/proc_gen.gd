class_name ProcGen
extends RefCounted
## Процедурная генерация мира (чанки 32x32 тайла):
## - 2D Симплекс-шум (O(1) на точку)
## - Диаграмма Вороного для районов города (O(K) на запрос)
## - L-система для дорожной сети (O(N) переписываний)
## - BSP-разбиение зданий на комнаты (O(R log R))

const CHUNK_SIZE: int = 32

enum TileType {
	GRASS = 0,
	DIRT = 1,
	ASPHALT = 2,
	SIDEWALK = 3,
	FLOOR_WOOD = 4,
	FLOOR_HOSPITAL = 5,
	FLOOR_WAREHOUSE = 6,
	WATER = 7,
	WALL_BRICK = 8,
	WALL_WOOD = 9,
	WALL_PLASTER = 10,
	DOOR = 11,
	WINDOW = 12,
	TREE_OAK = 13,
	TREE_PINE = 14
}

const F2: float = 0.3660254037844386
const G2: float = 0.21132486540518713


static func _hash2(ix: int, iy: int, world_seed: int) -> int:
	var h: int = ix * 374761393 + iy * 668265263 + world_seed * 1442695041
	h = (h ^ (h >> 13)) * 1274126177
	return h ^ (h >> 16)


static func _grad2(h: int, x: float, y: float) -> float:
	var g := h & 7
	var u := x if g < 4 else y
	var v := y if g < 4 else x
	var s1 := u if (g & 1) == 0 else -u
	var s2 := v if (g & 2) == 0 else -v
	return s1 + 0.5 * s2


## 2D Симплекс-шум в диапазоне [-1.0, 1.0], сложность O(1).
static func simplex_2d(xin: float, yin: float, world_seed: int) -> float:
	var s := (xin + yin) * F2
	var i := int(floor(xin + s))
	var j := int(floor(yin + s))
	var t := float(i + j) * G2
	var x0 := xin - (float(i) - t)
	var y0 := yin - (float(j) - t)

	var i1 := 1 if x0 > y0 else 0
	var j1 := 0 if x0 > y0 else 1

	var x1 := x0 - float(i1) + G2
	var y1 := y0 - float(j1) + G2
	var x2 := x0 - 1.0 + 2.0 * G2
	var y2 := y0 - 1.0 + 2.0 * G2

	var n0 := 0.0
	var t0 := 0.5 - x0 * x0 - y0 * y0
	if t0 > 0.0:
		t0 *= t0
		n0 = t0 * t0 * _grad2(_hash2(i, j, world_seed), x0, y0)

	var n1 := 0.0
	var t1 := 0.5 - x1 * x1 - y1 * y1
	if t1 > 0.0:
		t1 *= t1
		n1 = t1 * t1 * _grad2(_hash2(i + i1, j + j1, world_seed), x1, y1)

	var n2 := 0.0
	var t2 := 0.5 - x2 * x2 - y2 * y2
	if t2 > 0.0:
		t2 *= t2
		n2 = t2 * t2 * _grad2(_hash2(i + 1, j + 1, world_seed), x2, y2)

	return clamp(45.0 * (n0 + n1 + n2), -1.0, 1.0)


## Диаграмма Вороного: определяет тип района (пригород, центр, клиника/полиция, склад, лес).
## Сложность O(9) = O(1) за счёт поиска в сетке макро-ячеек 96x96 тайлов.
static func get_voronoi_district(wx: int, wy: int, world_seed: int) -> String:
	var cell_sz := 96
	var gx := int(floor(float(wx) / float(cell_sz)))
	var gy := int(floor(float(wy) / float(cell_sz)))
	var best_d := 1e18
	var best_hash := 0

	for oy in range(-1, 2):
		for ox in range(-1, 2):
			var nx := gx + ox
			var ny := gy + oy
			var h := _hash2(nx, ny, world_seed + 911)
			var sx := float(nx * cell_sz) + float(abs(h) % 64) + 16.0
			var sy := float(ny * cell_sz) + float(abs(h >> 8) % 64) + 16.0
			var dx := float(wx) - sx
			var dy := float(wy) - sy
			var d := dx * dx + dy * dy
			if d < best_d:
				best_d = d
				best_hash = abs(h)

	if gx == 0 and gy == 0:
		return "residential"
	var m := best_hash % 10
	if m < 4:
		return "residential"
	if m < 6:
		return "grocery"
	if m == 6:
		return "hospital"
	if m == 7:
		return "police"
	if m == 8:
		return "warehouse"
	return "forest"


## L-система для генерации ветвящихся дорог и троп: аксиома F, правило F -> F[+F]F[-F]F.
static func generate_lsystem_road_string(iterations: int) -> String:
	var s := "F+F"
	for _i in range(iterations):
		var next_s := ""
		for ch_idx in range(s.length()):
			var ch := s[ch_idx]
			if ch == "F":
				next_s += "F[+F]F[-F]"
			else:
				next_s += ch
		s = next_s
	return s


## BSP (Binary Space Partitioning): рекурсивно делит прямоугольник здания на комнаты.
## Сложность O(R log R), где R — число комнат.
static func bsp_split_building(rect: Rect2i, min_room: int, rng: RandomNumberGenerator) -> Array[Rect2i]:
	var queue: Array[Rect2i] = [rect]
	var leaves: Array[Rect2i] = []
	var safety := 0
	while not queue.is_empty() and safety < 64:
		safety += 1
		var cur: Rect2i = queue.pop_front()
		var split_h := cur.size.y > cur.size.x
		if cur.size.x > min_room * 2 and cur.size.y > min_room * 2:
			split_h = rng.randf() < 0.5

		if split_h and cur.size.y >= min_room * 2:
			var split_y := rng.randi_range(min_room, cur.size.y - min_room)
			queue.append(Rect2i(cur.position.x, cur.position.y, cur.size.x, split_y))
			queue.append(Rect2i(cur.position.x, cur.position.y + split_y, cur.size.x, cur.size.y - split_y))
		elif (not split_h) and cur.size.x >= min_room * 2:
			var split_x := rng.randi_range(min_room, cur.size.x - min_room)
			queue.append(Rect2i(cur.position.x, cur.position.y, split_x, cur.size.y))
			queue.append(Rect2i(cur.position.x + split_x, cur.position.y, cur.size.x - split_x, cur.size.y))
		else:
			leaves.append(cur)
	if leaves.is_empty():
		ErrorManager.info("E303", "ProcGen", "Здание не разбито BSP (слишком мало)", {"size": rect.size})
		leaves.append(rect)
	return leaves


## Генерирует полный чанк 32x32 с тайлами, зданиями, мебелью, машинами и точками лута.
static func generate_chunk_data(cx: int, cy: int, world_seed: int) -> Dictionary:
	var rng := RandomNumberGenerator.new()
	rng.seed = _hash2(cx, cy, world_seed)

	var tiles := PackedInt32Array()
	tiles.resize(CHUNK_SIZE * CHUNK_SIZE)

	var center_wx := cx * CHUNK_SIZE + 16
	var center_wy := cy * CHUNK_SIZE + 16
	var district := get_voronoi_district(center_wx, center_wy, world_seed)

	# 1. Ландшафт (симплекс-шум + магистральные дороги по краям чанков)
	for ly in range(CHUNK_SIZE):
		for lx in range(CHUNK_SIZE):
			var wx := cx * CHUNK_SIZE + lx
			var wy := cy * CHUNK_SIZE + ly
			var idx := ly * CHUNK_SIZE + lx
			var road_band_x := lx >= 0 and lx <= 3 and district != "forest"
			var road_band_y := ly >= 0 and ly <= 3 and district != "forest"
			if road_band_x or road_band_y:
				tiles[idx] = TileType.ASPHALT
			elif (lx == 4 or ly == 4) and district != "forest":
				tiles[idx] = TileType.SIDEWALK
			else:
				var n := simplex_2d(float(wx) * 0.05, float(wy) * 0.05, world_seed)
				if n < -0.58 and district == "forest":
					tiles[idx] = TileType.WATER
				elif n > 0.25 and district == "forest":
					tiles[idx] = TileType.TREE_PINE if (lx + ly) % 2 == 0 else TileType.TREE_OAK
				elif n > 0.42 and lx > 6 and ly > 6:
					tiles[idx] = TileType.TREE_OAK
				elif n < -0.2:
					tiles[idx] = TileType.DIRT
				else:
					tiles[idx] = TileType.GRASS

	var buildings: Array[Dictionary] = []
	var containers: Array[Dictionary] = []
	var doors: Array[Dictionary] = []
	var windows: Array[Dictionary] = []
	var vehicles: Array[Dictionary] = []

	# 2. Размещение здания через BSP (если не лес)
	if district != "forest" and rng.randf() < 0.78:
		var bw := rng.randi_range(12, 18)
		var bh := rng.randi_range(10, 16)
		var bx := 7 + rng.randi_range(0, 29 - bw)
		var by := 7 + rng.randi_range(0, 29 - bh)
		var b_rect := Rect2i(bx, by, bw, bh)

		var floor_tile := TileType.FLOOR_WOOD
		var wall_tile := TileType.WALL_WOOD
		if district == "hospital":
			floor_tile = TileType.FLOOR_HOSPITAL
			wall_tile = TileType.WALL_PLASTER
		elif district == "warehouse" or district == "police" or district == "grocery":
			floor_tile = TileType.FLOOR_WAREHOUSE
			wall_tile = TileType.WALL_BRICK

		# Пол
		for yy in range(b_rect.position.y, b_rect.end.y):
			for xx in range(b_rect.position.x, b_rect.end.x):
				tiles[yy * CHUNK_SIZE + xx] = floor_tile

		# Наружные стены
		for xx in range(b_rect.position.x, b_rect.end.x):
			tiles[b_rect.position.y * CHUNK_SIZE + xx] = wall_tile
			tiles[(b_rect.end.y - 1) * CHUNK_SIZE + xx] = wall_tile
		for yy in range(b_rect.position.y, b_rect.end.y):
			tiles[yy * CHUNK_SIZE + b_rect.position.x] = wall_tile
			tiles[yy * CHUNK_SIZE + (b_rect.end.x - 1)] = wall_tile

		# Дверь на южной или западной стене
		var dx := b_rect.position.x + b_rect.size.x / 2
		var dy := b_rect.position.y
		tiles[dy * CHUNK_SIZE + dx] = TileType.DOOR
		doors.append({"tile": Vector2i(cx * CHUNK_SIZE + dx, cy * CHUNK_SIZE + dy), "hp": 150.0, "max_hp": 150.0, "open": false, "broken": false})

		# Окна
		var win_x1 := b_rect.position.x + 2
		var win_x2 := b_rect.end.x - 3
		for wx_pos in [win_x1, win_x2]:
			tiles[(b_rect.end.y - 1) * CHUNK_SIZE + wx_pos] = TileType.WINDOW
			windows.append({"tile": Vector2i(cx * CHUNK_SIZE + wx_pos, cy * CHUNK_SIZE + b_rect.end.y - 1), "broken": false, "barricade_hp": 0.0})

		# Внутренние перегородки по BSP
		var rooms := bsp_split_building(b_rect, 5, rng)
		for r in rooms:
			if r.position.x > b_rect.position.x:
				for yy in range(r.position.y + 1, r.end.y - 1):
					tiles[yy * CHUNK_SIZE + r.position.x] = wall_tile
				var inner_door_y := r.position.y + r.size.y / 2
				tiles[inner_door_y * CHUNK_SIZE + r.position.x] = TileType.DOOR
				doors.append({"tile": Vector2i(cx * CHUNK_SIZE + r.position.x, cy * CHUNK_SIZE + inner_door_y), "hp": 120.0, "max_hp": 120.0, "open": false, "broken": false})
			# Точка контейнера в центре каждой комнаты
			var lpos := Vector2i(cx * CHUNK_SIZE + r.position.x + r.size.x / 2, cy * CHUNK_SIZE + r.position.y + r.size.y / 2)
			containers.append({
				"tile": lpos,
				"zone": district,
				"kind": "med_cabinet" if district == "hospital" else ("gun_locker" if district == "police" else ("fridge" if (containers.size() % 3 == 0) else "crate")),
				"looted": false,
				"items": []
			})

		# Проход у входной двери должен оставаться свободным после BSP.
		if tiles[(dy + 1) * CHUNK_SIZE + dx] != TileType.DOOR:
			tiles[(dy + 1) * CHUNK_SIZE + dx] = floor_tile
		var outside_type: int = tiles[(dy - 1) * CHUNK_SIZE + dx]
		if outside_type == TileType.TREE_OAK or outside_type == TileType.TREE_PINE or outside_type == TileType.WATER:
			tiles[(dy - 1) * CHUNK_SIZE + dx] = TileType.DIRT

		buildings.append({
			"rect": b_rect,
			"district": district,
			"rooms": rooms.size()
		})

	# 3. Транспорт вдоль дороги (с вероятностью 35% на чанк)
	if district != "forest" and rng.randf() < 0.35:
		var vtypes := ["veh_sedan", "veh_pickup", "veh_van", "veh_police", "veh_ambulance", "veh_truck"]
		var vtype: String = vtypes[rng.randi() % vtypes.size()]
		if district == "police":
			vtype = "veh_police"
		elif district == "hospital":
			vtype = "veh_ambulance"
		vehicles.append({
			"type": vtype,
			"tile": Vector2i(cx * CHUNK_SIZE + 2, cy * CHUNK_SIZE + rng.randi_range(8, 24)),
			"fuel": rng.randf_range(8.0, 45.0),
			"condition": rng.randf_range(40.0, 95.0)
		})

	return {
		"cx": cx,
		"cy": cy,
		"district": district,
		"tiles": tiles,
		"buildings": buildings,
		"containers": containers,
		"doors": doors,
		"windows": windows,
		"vehicles": vehicles
	}
