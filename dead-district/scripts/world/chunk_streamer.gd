class_name ChunkStreamer
extends Node
## Многопоточная подгрузка чанков 32x32 через WorkerThreadPool + LRU кэш.
## Обеспечивает плавные 60 FPS при перемещении пешком и на транспорте.

const CHUNK_SIZE: int = ProcGen.CHUNK_SIZE
const KEEP_RADIUS_CHUNKS: int = 3
const MAX_CACHED_CHUNKS: int = 81

var world_seed: int = 20261110
var chunks: Dictionary = {}  # Vector2i -> Dictionary
var _pending_tasks: Dictionary = {}  # Vector2i -> int (WorkerThreadPool task_id)
var _tile_overrides: Dictionary = {}  # Vector2i (world tile) -> int TileType
var _doors: Dictionary = {}  # Vector2i -> Dictionary
var _windows: Dictionary = {}  # Vector2i -> Dictionary
var _containers: Dictionary = {}  # Vector2i -> Dictionary
var _mutex := Mutex.new()


func _exit_tree() -> void:
	for tid in _pending_tasks.values():
		WorkerThreadPool.wait_for_task_completion(int(tid))
	_pending_tasks.clear()


func update_around(player_tile: Vector2i) -> void:
	var pc := Vector2i(int(floor(float(player_tile.x) / CHUNK_SIZE)), int(floor(float(player_tile.y) / CHUNK_SIZE)))

	# Забираем готовые фоновые задачи
	var done_keys: Array[Vector2i] = []
	for key in _pending_tasks.keys():
		var tid: int = int(_pending_tasks[key])
		if WorkerThreadPool.is_task_completed(tid):
			WorkerThreadPool.wait_for_task_completion(tid)
			done_keys.append(key)
	for k in done_keys:
		_pending_tasks.erase(k)

	# Ставим в очередь отсутствующие чанки в активном окне
	for dy in range(-KEEP_RADIUS_CHUNKS, KEEP_RADIUS_CHUNKS + 1):
		for dx in range(-KEEP_RADIUS_CHUNKS, KEEP_RADIUS_CHUNKS + 1):
			var cpos := Vector2i(pc.x + dx, pc.y + dy)
			if chunks.has(cpos) or _pending_tasks.has(cpos):
				continue
			if abs(dx) <= 1 and abs(dy) <= 1:
				# Ближайшие 3x3 чанка строим синхронно, чтобы игрок никогда не проваливался в пустоту
				_commit_chunk(ProcGen.generate_chunk_data(cpos.x, cpos.y, world_seed))
			else:
				var tid := WorkerThreadPool.add_task(func():
					var data := ProcGen.generate_chunk_data(cpos.x, cpos.y, world_seed)
					_mutex.lock()
					_commit_chunk(data)
					_mutex.unlock()
				)
				_pending_tasks[cpos] = tid

	# Выгрузка дальних чанков при превышении бюджета
	if chunks.size() > MAX_CACHED_CHUNKS:
		var to_unload: Array[Vector2i] = []
		for cpos in chunks.keys():
			if abs(cpos.x - pc.x) > KEEP_RADIUS_CHUNKS + 1 or abs(cpos.y - pc.y) > KEEP_RADIUS_CHUNKS + 1:
				to_unload.append(cpos)
		for cpos in to_unload:
			if cpos == pc:
				ErrorManager.warn("E308", "ChunkStreamer", "Попытка выгрузить активный чанк игрока", {"chunk": cpos})
				continue
			chunks.erase(cpos)
			EventBus.chunk_unloaded.emit(cpos.x, cpos.y)


func _commit_chunk(data: Dictionary) -> void:
	var cpos := Vector2i(int(data["cx"]), int(data["cy"]))
	chunks[cpos] = data
	for d in data["doors"]:
		var t: Vector2i = d["tile"]
		if not _doors.has(t):
			_doors[t] = d
	for w in data["windows"]:
		var t: Vector2i = w["tile"]
		if not _windows.has(t):
			_windows[t] = w
	for c in data["containers"]:
		var t: Vector2i = c["tile"]
		if not _containers.has(t):
			_containers[t] = c
	EventBus.chunk_loaded.emit(cpos.x, cpos.y)


func get_tile(world_tile: Vector2i) -> int:
	if _tile_overrides.has(world_tile):
		return int(_tile_overrides[world_tile])
	var cx := int(floor(float(world_tile.x) / CHUNK_SIZE))
	var cy := int(floor(float(world_tile.y) / CHUNK_SIZE))
	var cpos := Vector2i(cx, cy)
	if not chunks.has(cpos):
		_commit_chunk(ProcGen.generate_chunk_data(cx, cy, world_seed))
	var lx := posmod(world_tile.x, CHUNK_SIZE)
	var ly := posmod(world_tile.y, CHUNK_SIZE)
	var arr: PackedInt32Array = chunks[cpos]["tiles"]
	return arr[ly * CHUNK_SIZE + lx]


func set_tile(world_tile: Vector2i, tile_type: int) -> void:
	_tile_overrides[world_tile] = tile_type


func is_walkable(world_tile: Vector2i) -> bool:
	var t := get_tile(world_tile)
	if t == ProcGen.TileType.WALL_BRICK or t == ProcGen.TileType.WALL_WOOD or t == ProcGen.TileType.WALL_PLASTER or t == ProcGen.TileType.WINDOW or t == ProcGen.TileType.WATER or t == ProcGen.TileType.TREE_OAK or t == ProcGen.TileType.TREE_PINE:
		return false
	if t == ProcGen.TileType.DOOR:
		if not _doors.has(world_tile):
			return false
		var d: Dictionary = _doors[world_tile]
		return bool(d["open"]) or bool(d["broken"])
	return true


# Совпадает с центрами тайлов в целых координатах. Тело не может
# пересекать край стены/закрытой двери даже при диагональном движении.
func can_occupy(world_pos: Vector2, radius: float = 0.2) -> bool:
	var left := floori(world_pos.x - radius + 0.5000001)
	var right := floori(world_pos.x + radius + 0.4999999)
	var top := floori(world_pos.y - radius + 0.5000001)
	var bottom := floori(world_pos.y + radius + 0.4999999)
	for y in range(top, bottom + 1):
		for x in range(left, right + 1):
			if not is_walkable(Vector2i(x, y)):
				return false
	return true


func move_with_collision(start: Vector2, delta: Vector2, radius: float = 0.2) -> Vector2:
	var result := start
	var steps := maxi(1, ceili(maxf(absf(delta.x), absf(delta.y)) / 0.15))
	var step := delta / float(steps)
	for i in range(steps):
		var next_x := result + Vector2(step.x, 0.0)
		if can_occupy(next_x, radius):
			result.x = next_x.x
		var next_y := result + Vector2(0.0, step.y)
		if can_occupy(next_y, radius):
			result.y = next_y.y
	return result


func is_opaque(world_tile: Vector2i) -> bool:
	var t := get_tile(world_tile)
	if t == ProcGen.TileType.WALL_BRICK or t == ProcGen.TileType.WALL_WOOD or t == ProcGen.TileType.WALL_PLASTER or t == ProcGen.TileType.TREE_OAK or t == ProcGen.TileType.TREE_PINE:
		return true
	if t == ProcGen.TileType.DOOR and _doors.has(world_tile):
		var d: Dictionary = _doors[world_tile]
		return not bool(d["open"]) and not bool(d["broken"])
	return false


func is_indoor(world_tile: Vector2i) -> bool:
	var t := get_tile(world_tile)
	return t == ProcGen.TileType.FLOOR_WOOD or t == ProcGen.TileType.FLOOR_HOSPITAL or t == ProcGen.TileType.FLOOR_WAREHOUSE


func get_door(world_tile: Vector2i) -> Dictionary:
	return _doors.get(world_tile, {})


func get_window(world_tile: Vector2i) -> Dictionary:
	return _windows.get(world_tile, {})


func get_container(world_tile: Vector2i) -> Dictionary:
	return _containers.get(world_tile, {})


func toggle_door(world_tile: Vector2i) -> bool:
	if not _doors.has(world_tile):
		return false
	var d: Dictionary = _doors[world_tile]
	if bool(d["broken"]):
		return false
	d["open"] = not bool(d["open"])
	EventBus.noise_emitted.emit(Vector2(world_tile), 58.0, "door_toggle")
	return true


func damage_door(world_tile: Vector2i, dmg: float) -> bool:
	if not _doors.has(world_tile):
		return false
	var d: Dictionary = _doors[world_tile]
	if bool(d["broken"]):
		return true
	d["hp"] = maxf(0.0, float(d["hp"]) - dmg)
	if float(d["hp"]) <= 0.0:
		d["broken"] = true
		d["open"] = true
		EventBus.noise_emitted.emit(Vector2(world_tile), 92.0, "door_break")
		return true
	return false


func serialize_state() -> Dictionary:
	var ov := {}
	for k in _tile_overrides.keys():
		ov["%d,%d" % [k.x, k.y]] = _tile_overrides[k]
	var drs := {}
	for k in _doors.keys():
		drs["%d,%d" % [k.x, k.y]] = _doors[k]
	return {
		"world_seed": world_seed,
		"tile_overrides": ov,
		"doors": drs
	}


func deserialize_state(d: Dictionary) -> void:
	world_seed = int(d.get("world_seed", world_seed))
	_tile_overrides.clear()
	var ov: Dictionary = d.get("tile_overrides", {})
	for ks in ov.keys():
		var parts := String(ks).split(",")
		if parts.size() == 2:
			_tile_overrides[Vector2i(int(parts[0]), int(parts[1]))] = int(ov[ks])
	var drs: Dictionary = d.get("doors", {})
	for ks in drs.keys():
		var parts := String(ks).split(",")
		if parts.size() == 2:
			var t := Vector2i(int(parts[0]), int(parts[1]))
			var rec: Dictionary = drs[ks]
			rec["tile"] = t
			_doors[t] = rec
