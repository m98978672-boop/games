class_name BuildingSystem
extends Node
## Система строительства укреплений: стены, двери, баррикады окон, ловушки, костры и дождевые бочки.

var structures: Array[Dictionary] = []  # {id, tile: Vector2i, hp, max_hp, water_l}


func can_place(build_id: String, tile: Vector2i, inv: InventorySystem, chunks: ChunkStreamer) -> bool:
	if not DataDB.buildables.has(build_id):
		return false
	var spec: Dictionary = DataDB.buildables[build_id]
	for t in spec.get("tools", []):
		if inv.count_item(String(t)) <= 0:
			return false
	for c in spec.get("cost", []):
		if inv.count_item(String(c["id"])) < int(c["qty"]):
			return false

	if build_id == "build_barricade":
		return chunks.get_tile(tile) == ProcGen.TileType.WINDOW
	if not chunks.is_walkable(tile):
		ErrorManager.info("E605", "BuildingSystem", "Клетка занята для строительства", {"tile": tile})
		return false
	return true


func place(build_id: String, tile: Vector2i, inv: InventorySystem, chunks: ChunkStreamer) -> bool:
	if not can_place(build_id, tile, inv, chunks):
		return false
	var spec: Dictionary = DataDB.buildables[build_id]
	for c in spec.get("cost", []):
		inv.remove_item(String(c["id"]), int(c["qty"]))

	if build_id == "build_wood_wall":
		chunks.set_tile(tile, ProcGen.TileType.WALL_WOOD)
	elif build_id == "build_door":
		chunks.set_tile(tile, ProcGen.TileType.DOOR)
	elif build_id == "build_barricade":
		var w := chunks.get_window(tile)
		if not w.is_empty():
			w["barricade_hp"] = float(spec.get("hp", 200.0))

	structures.append({
		"id": build_id,
		"tile": tile,
		"hp": float(spec.get("hp", 150.0)),
		"max_hp": float(spec.get("hp", 150.0)),
		"water_l": 0.0
	})
	EventBus.noise_emitted.emit(Vector2(tile), 78.0, "building")
	EventBus.structure_built.emit(build_id, tile)
	return true


func has_heat_near(pos: Vector2) -> bool:
	for s in structures:
		if String(s["id"]) == "build_campfire" and pos.distance_to(Vector2(s["tile"])) <= 6.0:
			return true
	return false


func tick_rain_collection(dh_hours: float, rain_intensity: float) -> void:
	if rain_intensity <= 0.05:
		return
	for s in structures:
		if String(s["id"]) == "build_rain_barrel":
			s["water_l"] = minf(40.0, float(s["water_l"]) + 2.5 * rain_intensity * dh_hours)


func serialize_state() -> Dictionary:
	var arr := []
	for s in structures:
		var c := s.duplicate()
		c["tile"] = [s["tile"].x, s["tile"].y]
		arr.append(c)
	return {"structures": arr}


func deserialize_state(d: Dictionary) -> void:
	structures.clear()
	for s in d.get("structures", []):
		var t: Array = s.get("tile", [0, 0])
		var c := s.duplicate()
		c["tile"] = Vector2i(int(t[0]), int(t[1]))
		structures.append(c)
