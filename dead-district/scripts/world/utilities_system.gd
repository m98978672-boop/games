class_name UtilitiesSystem
extends Node
## Система коммунальных коммуникаций:
## - отключение электросети и водопровода через N дней (из data/real/climate.json)
## - переносные топливные генераторы (3 kWh/L -> ~0.45 л/ч)
## - предупреждение об угарном газе CO в помещении (E706)
## - учёт часов простоя холодильников/морозильников (USDA FSIS 4ч / 48ч)

var grid_power_on: bool = true
var grid_water_on: bool = true
var power_shutoff_day: int = 14
var water_shutoff_day: int = 16
var hours_since_power_outage: float = 0.0

var generators: Array[Dictionary] = []  # {id, tile: Vector2i, fuel_l, max_fuel_l, condition, running, indoor}
var _burn_rate_l_per_hour: float = 0.45


func _ready() -> void:
	power_shutoff_day = int(DataDB.get_real_game_value("power_grid_shutoff_days", 14.0))
	water_shutoff_day = power_shutoff_day + 2
	_burn_rate_l_per_hour = DataDB.get_real_game_value("power_diesel_genset_kwh_per_l", 0.45)


func place_generator(tile: Vector2i, indoor: bool, initial_fuel: float = 12.0) -> Dictionary:
	var g := {
		"id": "gen_%d_%d" % [tile.x, tile.y],
		"tile": tile,
		"fuel_l": initial_fuel,
		"max_fuel_l": 20.0,
		"condition": 100.0,
		"running": false,
		"indoor": indoor
	}
	generators.append(g)
	return g


func toggle_generator(gen_id: String) -> bool:
	for g in generators:
		if String(g["id"]) == gen_id:
			if not bool(g["running"]) and float(g["fuel_l"]) <= 0.0:
				return false
			g["running"] = not bool(g["running"])
			if bool(g["running"]) and bool(g["indoor"]):
				ErrorManager.warn("E706", "UtilitiesSystem", "Генератор запущен внутри помещения!", {"id": gen_id})
			return true
	return false


func tick(current_day: int, dh_hours: float, player_tile: Vector2i) -> float:
	# Проверка планового/случайного отключения сети и воды
	var changed := false
	if grid_power_on and current_day >= power_shutoff_day:
		grid_power_on = false
		changed = true
		ErrorManager.info("E704", "UtilitiesSystem", "Городская электросеть отключена", {"day": current_day})
	if grid_water_on and current_day >= water_shutoff_day:
		grid_water_on = false
		changed = true
		ErrorManager.info("E705", "UtilitiesSystem", "Городской водопровод отключён", {"day": current_day})
	if changed:
		EventBus.utilities_changed.emit(grid_power_on, grid_water_on)

	if not grid_power_on:
		hours_since_power_outage += dh_hours

	var co_damage := 0.0
	for g in generators:
		if not bool(g["running"]):
			continue
		g["fuel_l"] = maxf(0.0, float(g["fuel_l"]) - _burn_rate_l_per_hour * dh_hours)
		g["condition"] = maxf(0.0, float(g["condition"]) - 0.12 * dh_hours)
		EventBus.noise_emitted.emit(Vector2(g["tile"]), 84.0, "generator")
		if float(g["fuel_l"]) <= 0.0 or float(g["condition"]) <= 0.0:
			g["running"] = false
		elif bool(g["indoor"]) and player_tile.distance_to(g["tile"]) <= 12.0:
			co_damage += 6.5 * dh_hours
	return co_damage


func has_power_at(tile: Vector2i) -> bool:
	if grid_power_on:
		return true
	for g in generators:
		if bool(g["running"]) and tile.distance_to(g["tile"]) <= 18.0:
			return true
	return false


func serialize_state() -> Dictionary:
	var gens := []
	for g in generators:
		var copy := g.duplicate()
		copy["tile"] = [g["tile"].x, g["tile"].y]
		gens.append(copy)
	return {
		"power_on": grid_power_on,
		"water_on": grid_water_on,
		"hours_outage": hours_since_power_outage,
		"generators": gens
	}


func deserialize_state(d: Dictionary) -> void:
	grid_power_on = bool(d.get("power_on", true))
	grid_water_on = bool(d.get("water_on", true))
	hours_since_power_outage = float(d.get("hours_outage", 0.0))
	generators.clear()
	for g in d.get("generators", []):
		var t: Array = g.get("tile", [0, 0])
		var item := g.duplicate()
		item["tile"] = Vector2i(int(t[0]), int(t[1]))
		generators.append(item)
