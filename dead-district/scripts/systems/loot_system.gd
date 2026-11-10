class_name LootSystem
extends Node
## Система лута: взвешенный случайный выбор (Weighted Random) из data/loot_tables.json,
## учёт порчи скоропортящихся продуктов после отключения света.


static func roll_zone_loot(zone_id: String, rng: RandomNumberGenerator, outage_hours: float = 0.0, is_fridge: bool = false) -> Array[Dictionary]:
	var zones: Dictionary = DataDB.loot_zones
	var zdata: Dictionary = zones.get(zone_id, zones.get("residential", {}))
	var entries: Array = zdata.get("entries", [])
	if entries.is_empty():
		ErrorManager.error("E606", "LootSystem", "Пустая таблица лута", {"zone": zone_id})
		return [{"id": "canned_beans", "qty": 1, "freshness": 1.0}]

	var total_weight := 0.0
	for e in entries:
		total_weight += float(e.get("weight", 1.0))
	if total_weight <= 0.0:
		ErrorManager.error("E606", "LootSystem", "Нулевая сумма весов лута", {"zone": zone_id})
		return [{"id": "canned_beans", "qty": 1, "freshness": 1.0}]

	var rolls_range: Array = zdata.get("rolls", [2, 4])
	var n_rolls := rng.randi_range(int(rolls_range[0]), int(rolls_range[1]))
	var out: Array[Dictionary] = []

	for _r in range(n_rolls):
		var pick := rng.randf() * total_weight
		var acc := 0.0
		for e in entries:
			acc += float(e.get("weight", 1.0))
			if pick <= acc:
				var iid := String(e["id"])
				var meta := DataDB.get_item(iid)
				var qty := 1
				if String(meta.get("cat", "")) == "ammo":
					qty = rng.randi_range(5, 16)
				var fresh := 1.0
				if bool(meta.get("perishable", false)):
					var safe_h := 4.0 if is_fridge else 2.0
					if outage_hours > safe_h:
						fresh = clampf(1.0 - (outage_hours - safe_h) / 48.0, 0.0, 1.0)
				out.append({"id": iid, "qty": qty, "freshness": fresh})
				break
	return out
