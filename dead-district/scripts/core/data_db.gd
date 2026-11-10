extends Node
## Центральный загрузчик всех игровых таблиц и реальных научных датасетов (/data/real/*.json).

var items: Dictionary = {}
var recipes: Dictionary = {}
var buildables: Dictionary = {}
var loot_zones: Dictionary = {}
var zombie_types: Dictionary = {}
var npc_archetypes: Array = []
var building_types: Dictionary = {}
var palette_colors: Array[Color] = []
var real_records: Dictionary = {}
var _loaded: bool = false


func _ready() -> void:
	load_all()


func load_all() -> void:
	if _loaded:
		return
	_load_real_datasets()
	_load_palette()
	_load_items()
	_load_recipes()
	_load_loot()
	_load_zombies()
	_load_npcs()
	_load_buildings()
	_loaded = true


func _read_json(path: String) -> Variant:
	if not FileAccess.file_exists(path):
		ErrorManager.error("E101", "DataDB", "Отсутствует JSON-файл данных", {"path": path})
		return null
	var f := FileAccess.open(path, FileAccess.READ)
	if f == null:
		ErrorManager.error("E101", "DataDB", "Не удалось открыть JSON", {"path": path})
		return null
	var txt := f.get_as_text()
	f.close()
	var parsed: Variant = JSON.parse_string(txt)
	if parsed == null:
		ErrorManager.error("E202", "DataDB", "Ошибка парсинга JSON", {"path": path})
		return null
	return parsed


func _load_real_datasets() -> void:
	var files := [
		"res://data/real/foods.json",
		"res://data/real/weapons.json",
		"res://data/real/vehicles.json",
		"res://data/real/crops.json",
		"res://data/real/medical.json",
		"res://data/real/climate.json"
	]
	for path in files:
		var doc: Variant = _read_json(path)
		if doc is Dictionary and doc.has("records"):
			for rec in doc["records"]:
				var rid := String(rec.get("id", ""))
				if rid != "":
					real_records[rid] = rec


func _load_palette() -> void:
	var doc: Variant = _read_json("res://data/palette_survival_horror_32.json")
	if doc is Dictionary and doc.has("colors"):
		palette_colors.clear()
		for h in doc["colors"]:
			palette_colors.append(Color.html(String(h)))


func _load_items() -> void:
	var doc: Variant = _read_json("res://data/items.json")
	if doc is Dictionary and doc.has("items"):
		for it in doc["items"]:
			var id := String(it.get("id", ""))
			if id == "":
				continue
			var ref := String(it.get("real_ref", ""))
			if ref == "" or not real_records.has(ref):
				ErrorManager.error("E1005", "DataDB", "Сломана ссылка real_ref в items.json", {"item": id, "real_ref": ref})
			items[id] = it


func _load_recipes() -> void:
	var doc: Variant = _read_json("res://data/recipes.json")
	if doc is Dictionary:
		for r in doc.get("recipes", []):
			recipes[String(r["id"])] = r
		for b in doc.get("buildables", []):
			buildables[String(b["id"])] = b


func _load_loot() -> void:
	var doc: Variant = _read_json("res://data/loot_tables.json")
	if doc is Dictionary and doc.has("zones"):
		loot_zones = doc["zones"]


func _load_zombies() -> void:
	var doc: Variant = _read_json("res://data/zombies.json")
	if doc is Dictionary and doc.has("types"):
		zombie_types = doc["types"]


func _load_npcs() -> void:
	var doc: Variant = _read_json("res://data/npcs.json")
	if doc is Dictionary and doc.has("archetypes"):
		npc_archetypes = doc["archetypes"]


func _load_buildings() -> void:
	var doc: Variant = _read_json("res://data/buildings.json")
	if doc is Dictionary and doc.has("building_types"):
		for b in doc["building_types"]:
			building_types[String(b["id"])] = b


func get_real_game_value(real_id: String, fallback: float) -> float:
	if real_records.has(real_id):
		var v: Variant = real_records[real_id].get("game_value", fallback)
		if v is int or v is float:
			return float(v)
	ErrorManager.warn("E502", "DataDB", "Запись /data/real/ не найдена, применён fallback", {"real_id": real_id})
	return fallback


func get_item(item_id: String) -> Dictionary:
	if items.has(item_id):
		return items[item_id]
	return {}
