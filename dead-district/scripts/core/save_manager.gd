extends Node
## JSON система сохранений с атомарной записью, SHA-256 проверкой, резервной копией и миграциями v1 -> v2 -> v3.

const SAVE_VERSION: int = 3
const SAVE_DIR: String = "user://saves"


func _ready() -> void:
	DirAccess.make_dir_recursive_absolute(SAVE_DIR)


func get_slot_path(slot_name: String) -> String:
	return "%s/%s.json" % [SAVE_DIR, slot_name]


func _compute_sha256(payload: Dictionary) -> String:
	var raw := JSON.stringify(payload)
	var ctx := HashingContext.new()
	ctx.start(HashingContext.HASH_SHA256)
	ctx.update(raw.to_utf8_buffer())
	return ctx.finish().hex_encode()


func save_game(slot_name: String, state: Dictionary) -> bool:
	DirAccess.make_dir_recursive_absolute(SAVE_DIR)
	var path := get_slot_path(slot_name)
	var bak_path := path + ".bak"
	var tmp_path := path + ".tmp"

	var payload := state.duplicate(true)
	payload["save_version"] = SAVE_VERSION
	payload["saved_at"] = Time.get_datetime_string_from_system(true)
	var checksum := _compute_sha256(payload)
	var envelope := {
		"version": SAVE_VERSION,
		"sha256": checksum,
		"payload": payload
	}

	if FileAccess.file_exists(path):
		var prev := FileAccess.get_file_as_bytes(path)
		var bf := FileAccess.open(bak_path, FileAccess.WRITE)
		if bf != null:
			bf.store_buffer(prev)
			bf.close()

	var f := FileAccess.open(tmp_path, FileAccess.WRITE)
	if f == null:
		ErrorManager.error("E206", "SaveManager", "Ошибка открытия временного файла сохранения", {"path": tmp_path})
		return false
	f.store_string(JSON.stringify(envelope, "\t"))
	f.close()

	var err := DirAccess.rename_absolute(ProjectSettings.globalize_path(tmp_path), ProjectSettings.globalize_path(path))
	if err != OK:
		# Fallback прямой записи в случае песочницы user://
		var direct := FileAccess.open(path, FileAccess.WRITE)
		if direct == null:
			ErrorManager.error("E206", "SaveManager", "Ошибка записи файла сохранения", {"path": path, "err": err})
			return false
		direct.store_string(JSON.stringify(envelope, "\t"))
		direct.close()
	return true


func load_game(slot_name: String) -> Dictionary:
	var path := get_slot_path(slot_name)
	var bak_path := path + ".bak"
	if not FileAccess.file_exists(path):
		if FileAccess.file_exists(bak_path):
			path = bak_path
		else:
			ErrorManager.info("E201", "SaveManager", "Файл сохранения не найден", {"slot": slot_name})
			return {}

	var parsed := _read_json_file(path)
	if parsed.is_empty() and path != bak_path and FileAccess.file_exists(bak_path):
		ErrorManager.error("E202", "SaveManager", "Основной сейв повреждён, откат к .bak", {"slot": slot_name})
		parsed = _read_json_file(bak_path)

	if parsed.is_empty():
		ErrorManager.fatal("E205", "SaveManager", "Невозможно прочитать ни основной сейв, ни .bak", {"slot": slot_name})
		return {}

	var ver := int(parsed.get("version", parsed.get("save_version", 1)))
	if ver > SAVE_VERSION or ver < 1:
		ErrorManager.error("E203", "SaveManager", "Неподдерживаемая версия сейва", {"version": ver})
		return {}

	var payload: Dictionary = parsed.get("payload", parsed)
	if parsed.has("sha256") and parsed.has("payload"):
		var expected := String(parsed["sha256"])
		var actual := _compute_sha256(payload)
		if expected != actual:
			ErrorManager.warn("E207", "SaveManager", "Несовпадение SHA-256 контрольной суммы сейва", {"slot": slot_name})

	if ver < SAVE_VERSION:
		payload = migrate_payload(payload, ver)

	return payload


func migrate_payload(data: Dictionary, from_version: int) -> Dictionary:
	var cur := data.duplicate(true)
	var ver := from_version
	if ver == 1:
		cur = _migrate_v1_to_v2(cur)
		ver = 2
	if ver == 2:
		cur = _migrate_v2_to_v3(cur)
		ver = 3
	if ver != SAVE_VERSION:
		ErrorManager.error("E204", "SaveManager", "Сбой миграции сохранения", {"from": from_version, "to": ver})
	cur["save_version"] = SAVE_VERSION
	return cur


func _migrate_v1_to_v2(d: Dictionary) -> Dictionary:
	# В v2 добавлена позонная медицина тела и шкала стресса/скуки
	var player: Dictionary = d.get("player", {})
	if not player.has("needs"):
		player["needs"] = {"hunger": 80.0, "thirst": 80.0, "fatigue": 10.0, "body_temp_c": 37.0, "stress": 0.0, "boredom": 0.0}
	else:
		player["needs"]["stress"] = player["needs"].get("stress", 0.0)
		player["needs"]["boredom"] = player["needs"].get("boredom", 0.0)
	if not player.has("health"):
		player["health"] = {"blood_ml": 5000.0, "parts": {}}
	d["player"] = player
	return d


func _migrate_v2_to_v3(d: Dictionary) -> Dictionary:
	# В v3 добавлены отключения воды/света, генераторы, фермерство и модификации мира
	if not d.has("utilities"):
		d["utilities"] = {"power_on": true, "water_on": true, "generators": []}
	if not d.has("farming"):
		d["farming"] = {"plots": []}
	if not d.has("world_deltas"):
		d["world_deltas"] = {"buildings": [], "looted": []}
	return d


func _read_json_file(path: String) -> Dictionary:
	var f := FileAccess.open(path, FileAccess.READ)
	if f == null:
		return {}
	var txt := f.get_as_text()
	f.close()
	var parsed: Variant = JSON.parse_string(txt)
	if parsed is Dictionary:
		return parsed
	return {}
