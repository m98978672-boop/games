class_name FarmingSystem
extends Node
## Система фермерства: грядки, 4 стадии роста, полив (дождь/ручной), заморозки и сбор урожая.
## Сроки созревания и нормы воды загружаются из /data/real/crops.json.

var plots: Array[Dictionary] = []  # {tile, crop_id, growth_days, target_days, stage: 0..3, water: 0..100, dead}

var _crop_days: Dictionary = {}
const FROST_SENSITIVE := {"tomato": true, "potato": true, "strawberry": true}


func _ready() -> void:
	_crop_days["radish"] = DataDB.get_real_game_value("crop_radish_maturity_days", 4.0)
	_crop_days["carrot"] = DataDB.get_real_game_value("crop_carrot_maturity_days", 9.0)
	_crop_days["potato"] = DataDB.get_real_game_value("crop_potato_maturity_days", 11.0)
	_crop_days["tomato"] = DataDB.get_real_game_value("crop_tomato_maturity_days", 10.0)
	_crop_days["cabbage"] = DataDB.get_real_game_value("crop_cabbage_maturity_days", 11.0)
	_crop_days["strawberry"] = DataDB.get_real_game_value("crop_strawberry_maturity_days", 9.0)


func plant_crop(tile: Vector2i, seed_item_id: String, inv: InventorySystem, chunks: ChunkStreamer) -> bool:
	var meta := DataDB.get_item(seed_item_id)
	var crop_id := String(meta.get("crop", ""))
	if crop_id == "" or inv.count_item(seed_item_id) <= 0:
		return false
	var t := chunks.get_tile(tile)
	if t != ProcGen.TileType.GRASS and t != ProcGen.TileType.DIRT:
		return false
	for p in plots:
		if p["tile"] == tile:
			return false

	inv.remove_item(seed_item_id, 1)
	plots.append({
		"tile": tile,
		"crop_id": crop_id,
		"growth_days": 0.0,
		"target_days": float(_crop_days.get(crop_id, 8.0)),
		"stage": 0,
		"water": 70.0,
		"dead": false
	})
	return true


func water_plot(tile: Vector2i, inv: InventorySystem) -> bool:
	for p in plots:
		if p["tile"] == tile and not bool(p["dead"]):
			if inv.remove_item("bottled_water", 1) or inv.remove_item("tainted_water", 1):
				p["water"] = minf(100.0, float(p["water"]) + 65.0)
				return true
	return false


func tick(dh_hours: float, ambient_c: float, rain_intensity: float) -> void:
	var d_days := dh_hours / 24.0
	for p in plots:
		if bool(p["dead"]):
			continue
		if rain_intensity > 0.1:
			p["water"] = minf(100.0, float(p["water"]) + 35.0 * rain_intensity * dh_hours)
		else:
			p["water"] = maxf(0.0, float(p["water"]) - 1.8 * dh_hours)

		# Морозостойкость (капуста и морковь выдерживают лёгкие заморозки, томат/картофель гибнут ниже 0°C)
		var cid := String(p["crop_id"])
		if FROST_SENSITIVE.has(cid) and ambient_c < -1.0:
			p["dead"] = true
			continue

		if float(p["water"]) > 15.0:
			p["growth_days"] = minf(float(p["target_days"]), float(p["growth_days"]) + d_days)
			var ratio := float(p["growth_days"]) / maxf(1.0, float(p["target_days"]))
			if ratio >= 1.0:
				p["stage"] = 3
			elif ratio >= 0.65:
				p["stage"] = 2
			elif ratio >= 0.25:
				p["stage"] = 1


func harvest_ready(tile: Vector2i, inv: InventorySystem) -> int:
	for i in range(plots.size()):
		var p: Dictionary = plots[i]
		if p["tile"] == tile and int(p["stage"]) >= 3 and not bool(p["dead"]):
			var cid := String(p["crop_id"])
			var yield_qty := 4 if (cid == "potato" or cid == "radish") else 2
			inv.add_item(cid, yield_qty, 1.0)
			plots.remove_at(i)
			EventBus.crop_harvested.emit(cid, yield_qty)
			return yield_qty
	return 0


func serialize_state() -> Dictionary:
	var arr := []
	for p in plots:
		var c := p.duplicate()
		c["tile"] = [p["tile"].x, p["tile"].y]
		arr.append(c)
	return {"plots": arr}


func deserialize_state(d: Dictionary) -> void:
	plots.clear()
	for p in d.get("plots", []):
		var t: Array = p.get("tile", [0, 0])
		var c := p.duplicate()
		c["tile"] = Vector2i(int(t[0]), int(t[1]))
		plots.append(c)
