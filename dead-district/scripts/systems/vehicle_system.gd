class_name VehicleSystem
extends Node
## Система низкополигонального 3D транспорта: топливо, расход на дистанцию, поломки, шум и багажник.
## Характеристики машин берутся из /data/real/vehicles.json.

var vehicles: Array[Dictionary] = []
var _type_specs: Dictionary = {}


func _ready() -> void:
	_type_specs = {
		"veh_sedan": {
			"name": "Седан", "mass": DataDB.get_real_game_value("veh_sedan_mass_kg", 1450.0),
			"tank_l": 60.0, "l_per_10km": DataDB.get_real_game_value("veh_sedan_fuel_consumption", 0.8),
			"max_speed": 15.0, "trunk_kg": 45.0, "noise_db": 98.0
		},
		"veh_police": {
			"name": "Полицейский крузер", "mass": DataDB.get_real_game_value("veh_police_mass_kg", 1840.0),
			"tank_l": 70.0, "l_per_10km": 1.1, "max_speed": 17.5, "trunk_kg": 55.0, "noise_db": 102.0
		},
		"veh_pickup": {
			"name": "Пикап 4x4", "mass": DataDB.get_real_game_value("veh_pickup_mass_kg", 1950.0),
			"tank_l": DataDB.get_real_game_value("veh_pickup_fuel_tank_l", 90.0),
			"l_per_10km": 1.3, "max_speed": 14.0, "trunk_kg": 95.0, "noise_db": 104.0
		},
		"veh_van": {
			"name": "Минивэн", "mass": DataDB.get_real_game_value("veh_van_mass_kg", 1800.0),
			"tank_l": DataDB.get_real_game_value("veh_van_fuel_tank_l", 75.0),
			"l_per_10km": 1.15, "max_speed": 13.0, "trunk_kg": 85.0, "noise_db": 100.0
		},
		"veh_truck": {
			"name": "Грузовой фургон", "mass": 4200.0,
			"tank_l": DataDB.get_real_game_value("veh_truck_fuel_tank_l", 160.0),
			"l_per_10km": DataDB.get_real_game_value("veh_truck_fuel_consumption", 2.4),
			"max_speed": 11.0, "trunk_kg": 180.0, "noise_db": 112.0
		},
		"veh_ambulance": {
			"name": "Скорая помощь", "mass": 3400.0,
			"tank_l": 95.0, "l_per_10km": DataDB.get_real_game_value("veh_ambulance_fuel_consumption", 1.9),
			"max_speed": 13.5, "trunk_kg": 100.0, "noise_db": 106.0
		}
	}


func register_vehicle(vtype: String, tile: Vector2i, fuel: float, condition: float) -> Dictionary:
	var spec: Dictionary = _type_specs.get(vtype, _type_specs["veh_sedan"])
	var vid := "veh_%d_%d" % [tile.x, tile.y]
	for v in vehicles:
		if String(v["id"]) == vid:
			return v
	var rec := {
		"id": vid,
		"type": vtype,
		"name": spec["name"],
		"pos": Vector2(tile),
		"angle": 0.0,
		"speed": 0.0,
		"fuel": clampf(fuel, 0.0, float(spec["tank_l"])),
		"tank_l": float(spec["tank_l"]),
		"condition": clampf(condition, 0.0, 100.0),
		"l_per_10km": float(spec["l_per_10km"]),
		"max_speed": float(spec["max_speed"]),
		"noise_db": float(spec["noise_db"]),
		"trunk": []
	}
	vehicles.append(rec)
	return rec


func find_nearest(pos: Vector2, max_dist: float = 2.6) -> Dictionary:
	var best: Dictionary = {}
	var bd := max_dist * max_dist
	for v in vehicles:
		var d2 := pos.distance_squared_to(v["pos"])
		if d2 <= bd:
			bd = d2
			best = v
	return best


func refuel_from_inventory(veh_id: String, inv: InventorySystem) -> bool:
	for v in vehicles:
		if String(v["id"]) == veh_id:
			if inv.remove_item("gas_can", 1):
				v["fuel"] = minf(float(v["tank_l"]), float(v["fuel"]) + 10.0)
				return true
	return false


func drive_step(veh_id: String, throttle: float, steer: float, dt: float, chunks: ChunkStreamer) -> Dictionary:
	var veh: Dictionary = {}
	for v in vehicles:
		if String(v["id"]) == veh_id:
			veh = v
			break
	if veh.is_empty():
		return {"ok": false}

	if float(veh["fuel"]) <= 0.0:
		if absf(throttle) > 0.1:
			ErrorManager.info("E701", "VehicleSystem", "Бак автомобиля пуст", {"id": veh_id})
		veh["speed"] = move_toward(float(veh["speed"]), 0.0, 10.0 * dt)
		return {"ok": false, "pos": veh["pos"], "speed": veh["speed"]}

	if float(veh["condition"]) <= 5.0:
		ErrorManager.warn("E702", "VehicleSystem", "Двигатель заглох (износ)", {"id": veh_id})
		veh["speed"] = move_toward(float(veh["speed"]), 0.0, 10.0 * dt)
		return {"ok": false, "pos": veh["pos"], "speed": veh["speed"]}

	var target_spd := throttle * float(veh["max_speed"])
	veh["speed"] = move_toward(float(veh["speed"]), target_spd, 14.0 * dt)
	if absf(float(veh["speed"])) > 0.4:
		veh["angle"] = float(veh["angle"]) + steer * 2.4 * signf(float(veh["speed"])) * dt

	var vel := Vector2(cos(float(veh["angle"])), sin(float(veh["angle"]))) * float(veh["speed"])
	var next_pos: Vector2 = veh["pos"] + vel * dt
	if chunks.is_walkable(Vector2i(int(round(next_pos.x)), int(round(next_pos.y)))):
		var dist_moved := vel.length() * dt
		veh["pos"] = next_pos
		# Масштаб: 100 тайлов ~ 1 игровой км -> расход по l_per_10km
		veh["fuel"] = maxf(0.0, float(veh["fuel"]) - (dist_moved / 1000.0) * float(veh["l_per_10km"]))
		if absf(float(veh["speed"])) > 1.0:
			EventBus.noise_emitted.emit(next_pos, float(veh["noise_db"]), "vehicle")
	else:
		# Столкновение со стеной снижает состояние двигателя
		veh["condition"] = maxf(0.0, float(veh["condition"]) - absf(float(veh["speed"])) * 1.4)
		veh["speed"] = 0.0
		EventBus.noise_emitted.emit(veh["pos"], 110.0, "vehicle_crash")

	return {"ok": true, "pos": veh["pos"], "speed": float(veh["speed"])}


func serialize_state() -> Dictionary:
	var arr := []
	for v in vehicles:
		var c := v.duplicate(true)
		c["pos"] = [v["pos"].x, v["pos"].y]
		arr.append(c)
	return {"vehicles": arr}


func deserialize_state(d: Dictionary) -> void:
	vehicles.clear()
	for v in d.get("vehicles", []):
		var p: Array = v.get("pos", [0, 0])
		var c := v.duplicate(true)
		c["pos"] = Vector2(float(p[0]), float(p[1]))
		vehicles.append(c)
