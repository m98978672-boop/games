class_name InventorySystem
extends Node
## Система инвентаря: вес, вместимость с учётом рюкзака, 6 слотов одежды (броня + термоизоляция) и порча еды.

const BASE_MAX_WEIGHT_KG: float = 14.0
const HARD_OVERWEIGHT_KG: float = 34.0

var items: Array[Dictionary] = []  # {id, qty, freshness: 0..1, durability: 0..1}
var equipment: Dictionary = {
	"head": "",
	"torso": "tshirt",
	"legs": "jeans",
	"feet": "sneakers",
	"hands": "",
	"back": ""
}

var _fridge_safe_h: float = 4.0


func _ready() -> void:
	_fridge_safe_h = DataDB.get_real_game_value("food_spoil_fridge_outage_hours", 4.0)


func give_starting_kit() -> void:
	items.clear()
	add_item("baseball_bat", 1)
	add_item("canned_beans", 2)
	add_item("bottled_water", 2)
	add_item("bandage", 3)
	add_item("antiseptic", 1)
	add_item("can_opener", 1)
	add_item("flashlight", 1)
	add_item("lighter", 1)
	add_item("wood_plank", 2)
	add_item("nails", 2)
	add_item("seeds_radish", 2)


func add_item(item_id: String, qty: int = 1, freshness: float = 1.0) -> bool:
	if qty <= 0:
		return false
	var meta := DataDB.get_item(item_id)
	if meta.is_empty():
		ErrorManager.error("E501", "InventorySystem", "Неизвестный предмет при добавлении", {"id": item_id})
		return false

	var item_w := float(meta.get("weight", 0.1))
	if get_total_weight() + item_w * float(qty) > HARD_OVERWEIGHT_KG:
		ErrorManager.info("E601", "InventorySystem", "Абсолютный перегруз, подбор отклонён", {"id": item_id})
		return false

	var max_stack := int(meta.get("stack", 1))
	if max_stack > 1:
		for slot in items:
			if String(slot["id"]) == item_id and int(slot["qty"]) < max_stack:
				var add_now := mini(qty, max_stack - int(slot["qty"]))
				slot["qty"] = int(slot["qty"]) + add_now
				qty -= add_now
				if qty <= 0:
					EventBus.inventory_changed.emit()
					return true

	while qty > 0:
		var chunk := mini(qty, max_stack)
		items.append({
			"id": item_id,
			"qty": chunk,
			"freshness": clampf(freshness, 0.0, 1.0),
			"durability": 1.0
		})
		qty -= chunk

	EventBus.inventory_changed.emit()
	return true


func remove_item(item_id: String, qty: int = 1) -> bool:
	if qty <= 0 or count_item(item_id) < qty:
		return false
	var rem := qty
	for i in range(items.size() - 1, -1, -1):
		if String(items[i]["id"]) == item_id:
			var take := mini(rem, int(items[i]["qty"]))
			items[i]["qty"] = int(items[i]["qty"]) - take
			rem -= take
			if int(items[i]["qty"]) <= 0:
				items.remove_at(i)
			if rem <= 0:
				break
	EventBus.inventory_changed.emit()
	return true


func count_item(item_id: String) -> int:
	var total := 0
	for s in items:
		if String(s["id"]) == item_id:
			total += int(s["qty"])
	return total


func get_max_weight() -> float:
	var cap := BASE_MAX_WEIGHT_KG
	var back_id := String(equipment.get("back", ""))
	if back_id != "":
		var bmeta := DataDB.get_item(back_id)
		cap += float(bmeta.get("cap_bonus", 0.0))
	return cap


func get_total_weight() -> float:
	var w := 0.0
	var back_red := 0.0
	var back_id := String(equipment.get("back", ""))
	if back_id != "":
		back_red = float(DataDB.get_item(back_id).get("weight_reduction", 0.0))
	for s in items:
		var meta := DataDB.get_item(String(s["id"]))
		w += float(meta.get("weight", 0.1)) * float(s["qty"])
	if back_red > 0.0:
		w *= (1.0 - minf(0.5, back_red * 0.5))
	return w


func get_weight_speed_multiplier() -> float:
	var ratio := get_total_weight() / maxf(1.0, get_max_weight())
	if ratio <= 1.0:
		return 1.0
	if ratio <= 1.35:
		return 0.78
	return 0.48


func equip_clothing(item_id: String) -> bool:
	var meta := DataDB.get_item(item_id)
	if meta.is_empty() or not meta.has("slot"):
		return false
	var slot_name := String(meta["slot"])
	if not equipment.has(slot_name):
		return false
	if count_item(item_id) <= 0:
		return false
	var prev := String(equipment[slot_name])
	remove_item(item_id, 1)
	if prev != "":
		add_item(prev, 1)
	equipment[slot_name] = item_id
	EventBus.inventory_changed.emit()
	return true


func get_total_insulation() -> float:
	var ins := 0.0
	for k in equipment.keys():
		var eid := String(equipment[k])
		if eid != "":
			ins += float(DataDB.get_item(eid).get("insulation", 0.0))
	return ins


func get_armor_for_part(part: String) -> Dictionary:
	var slot_key := "torso"
	match part:
		"HEAD":
			slot_key = "head"
		"ARM_L", "ARM_R":
			slot_key = "torso"
		"LEG_L", "LEG_R":
			slot_key = "legs"
	var eid := String(equipment.get(slot_key, ""))
	if eid == "":
		return {"bite_def": 0.0, "scratch_def": 0.0}
	var meta := DataDB.get_item(eid)
	return {
		"bite_def": float(meta.get("bite_def", 0.0)),
		"scratch_def": float(meta.get("scratch_def", 0.0))
	}


func tick_spoilage(dh_hours: float, has_fridge_power: bool) -> void:
	var rate_mult := 0.25 if has_fridge_power else (1.0 if dh_hours > 0.0 else 0.0)
	for s in items:
		var meta := DataDB.get_item(String(s["id"]))
		if not bool(meta.get("perishable", false)):
			continue
		var spoil_days := maxf(0.25, float(meta.get("spoil_days", 4.0)))
		var decay := (dh_hours / (spoil_days * 24.0)) * rate_mult
		var nf := float(s["freshness"]) - decay
		if nf < 0.0 or nf > 1.0:
			ErrorManager.warn("E607", "InventorySystem", "Выход свежести за [0,1]", {"id": s["id"], "val": nf})
		s["freshness"] = clampf(nf, 0.0, 1.0)


func serialize_state() -> Dictionary:
	return {"items": items.duplicate(true), "equipment": equipment.duplicate()}


func deserialize_state(d: Dictionary) -> void:
	items.clear()
	for s in d.get("items", []):
		items.append(s.duplicate())
	var eq: Dictionary = d.get("equipment", {})
	for k in equipment.keys():
		equipment[k] = String(eq.get(k, equipment[k]))
