class_name CraftingSystem
extends Node
## Система крафта, готовки пищи, кипячения воды и ремонта из data/recipes.json.


func can_craft(recipe_id: String, inv: InventorySystem, near_workbench: bool, near_heat: bool) -> Dictionary:
	if not DataDB.recipes.has(recipe_id):
		ErrorManager.error("E603", "CraftingSystem", "Неизвестный рецепт крафта", {"id": recipe_id})
		return {"ok": false, "reason": "unknown_recipe"}

	var rec: Dictionary = DataDB.recipes[recipe_id]
	if bool(rec.get("requires_workbench", false)) and not near_workbench:
		ErrorManager.info("E604", "CraftingSystem", "Требуется верстак", {"id": recipe_id})
		return {"ok": false, "reason": "need_workbench"}
	if bool(rec.get("requires_heat", false)) and not near_heat:
		ErrorManager.info("E604", "CraftingSystem", "Требуется костёр или включённая плита", {"id": recipe_id})
		return {"ok": false, "reason": "need_heat"}

	for t in rec.get("tools", []):
		if inv.count_item(String(t)) <= 0:
			return {"ok": false, "reason": "missing_tool_" + String(t)}
	for ing in rec.get("ingredients", []):
		if inv.count_item(String(ing["id"])) < int(ing["qty"]):
			return {"ok": false, "reason": "missing_" + String(ing["id"])}
	return {"ok": true}


func craft(recipe_id: String, inv: InventorySystem, near_workbench: bool, near_heat: bool) -> bool:
	var chk := can_craft(recipe_id, inv, near_workbench, near_heat)
	if not bool(chk["ok"]):
		return false

	var rec: Dictionary = DataDB.recipes[recipe_id]
	for ing in rec.get("ingredients", []):
		inv.remove_item(String(ing["id"]), int(ing["qty"]))

	var res: Dictionary = rec.get("result", {})
	var res_id := String(res.get("id", ""))
	var res_qty := int(res.get("qty", 1))
	if res_id == "repair_equipped_melee":
		for s in inv.items:
			var meta := DataDB.get_item(String(s["id"]))
			if String(meta.get("cat", "")) == "melee":
				s["durability"] = 1.0
				break
	elif res_id != "":
		inv.add_item(res_id, res_qty, 1.0)

	EventBus.craft_completed.emit(recipe_id)
	return true
