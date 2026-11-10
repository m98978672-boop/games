class_name HudController
extends Control
## Контроллер пиксельного интерфейса игрока (HUD, инвентарь, здоровье частей тела, крафт, диалоги, смерть, пауза).
## Полностью поддерживает кириллицу через шрифт PixelifySans-Regular.ttf.

signal action_requested(action_id: String, payload: Dictionary)

@export var status_label_path: NodePath
@export var time_label_path: NodePath
@export var moodles_label_path: NodePath
@export var weapon_label_path: NodePath
@export var log_label_path: NodePath
@export var modal_panel_path: NodePath
@export var modal_title_path: NodePath
@export var modal_body_path: NodePath
@export var modal_buttons_box_path: NodePath
@export var death_panel_path: NodePath
@export var death_reason_path: NodePath
@export var pause_panel_path: NodePath

var current_modal: String = ""
var _log_lines: Array[String] = []


func _ready() -> void:
	EventBus.ui_toast.connect(push_log)
	EventBus.player_died.connect(show_death_screen)
	_close_modals()


func push_log(msg: String) -> void:
	_log_lines.append(msg)
	if _log_lines.size() > 6:
		_log_lines.pop_front()
	var lbl := get_node_or_null(log_label_path) as Label
	if lbl != null:
		lbl.text = "\n".join(_log_lines)


func refresh_hud(
	needs: PlayerNeeds,
	health: PlayerHealth,
	inv: InventorySystem,
	ctrl: PlayerController,
	tw: TimeWeatherSystem,
	util: UtilitiesSystem,
	active_z: int,
	world_z: int
) -> void:
	var slbl := get_node_or_null(status_label_path) as Label
	if slbl != null:
		slbl.text = "HP %.0f | Кровь %.0f мл | Голод %.0f | Жажда %.0f | Темп %.1f°C | Вес %.1f/%.1f кг" % [
			health.global_hp, health.blood_ml, needs.hunger, needs.thirst,
			needs.body_temp_c, inv.get_total_weight(), inv.get_max_weight()
		]

	var tlbl := get_node_or_null(time_label_path) as Label
	if tlbl != null:
		var hh := int(tw.hour)
		var mm := int((tw.hour - float(hh)) * 60.0)
		var pwr := "Свет:ВКЛ" if util.grid_power_on else "Свет:ВЫКЛ"
		tlbl.text = "День %d %02d:%02d | %s | %.1f°C | %s | Зомби %d/%d" % [
			tw.day, hh, mm, tw.weather_id.to_upper(), tw.ambient_temp_c, pwr, active_z, world_z
		]

	var mlbl := get_node_or_null(moodles_label_path) as Label
	if mlbl != null:
		var mlist := needs.get_moodles()
		var names: Array[String] = []
		for m in mlist:
			names.append(String(m["label"]))
		mlbl.text = "Состояние: " + (", ".join(names) if not names.is_empty() else "Норма")

	var wlbl := get_node_or_null(weapon_label_path) as Label
	if wlbl != null:
		var wmeta := DataDB.get_item(ctrl.equipped_weapon_id)
		var wname := String(wmeta.get("name", ctrl.equipped_weapon_id))
		if String(wmeta.get("cat", "")) == "firearm":
			var mag := int(ctrl.loaded_ammo.get(ctrl.equipped_weapon_id, 0))
			var reserve := inv.count_item(String(wmeta.get("ammo_type", "")))
			wlbl.text = "[ЛКМ] %s (%d/%d) | [E] Взаимодействие | [F] Фонарик | [I] Инв | [C] Крафт | [H] Тело" % [wname, mag, reserve]
		else:
			wlbl.text = "[ЛКМ] %s | [E] Дверь/Лут/Машина | [F] Фонарик | [I] Инв | [C] Крафт | [H] Тело" % wname


func toggle_modal(kind: String, inv: InventorySystem, health: PlayerHealth, near_wb: bool, near_heat: bool) -> void:
	if current_modal == kind:
		_close_modals()
		return
	current_modal = kind
	var panel := get_node_or_null(modal_panel_path) as PanelContainer
	if panel != null:
		panel.visible = true

	var title := get_node_or_null(modal_title_path) as Label
	var body := get_node_or_null(modal_body_path) as Label
	var box := get_node_or_null(modal_buttons_box_path) as VBoxContainer
	if box != null:
		for ch in box.get_children():
			ch.queue_free()

	match kind:
		"inventory":
			if title != null: title.text = "ИНВЕНТАРЬ И ЭКИПИРОВКА"
			if body != null:
				body.text = "Надето: Голова=%s | Торс=%s | Ноги=%s | Рюкзак=%s" % [
					inv.equipment["head"], inv.equipment["torso"], inv.equipment["legs"], inv.equipment["back"]
				]
			for s in inv.items:
				var iid := String(s["id"])
				var meta := DataDB.get_item(iid)
				var btn := Button.new()
				btn.text = "%s x%d (%.1f кг)" % [String(meta.get("name", iid)), int(s["qty"]), float(meta.get("weight", 0.1))]
				btn.pressed.connect(func(): action_requested.emit("use_item", {"id": iid}))
				if box != null: box.add_child(btn)
		"health":
			if title != null: title.text = "СОСТОЯНИЕ ТЕЛА И ЛЕЧЕНИЕ"
			var lines: Array[String] = ["Кровь: %.0f / %.0f мл | Боль: %.0f | Вирус: %.0f%%" % [health.blood_ml, health.max_blood_ml, health.pain, health.zombification_pct]]
			for p in PlayerHealth.BODY_PARTS:
				var rec: Dictionary = health.parts[p]
				lines.append("%s: %.0f%% | Царап:%d Ран:%d Укус:%d | Бинт:%s | Перелом:%.1fд" % [
					p, float(rec["hp"]), int(rec["scratches"]), int(rec["lacerations"]), int(rec["bites"]),
					"ДА" if bool(rec["bandaged"]) else "НЕТ", float(rec["fracture_days_left"])
				])
				var btn := Button.new()
				btn.text = "Перевязать / Обработать %s" % p
				btn.pressed.connect(func(): action_requested.emit("treat_part", {"part": p}))
				if box != null: box.add_child(btn)
			if body != null: body.text = "\n".join(lines)
		"crafting":
			if title != null: title.text = "КРАФТ И СТРОИТЕЛЬСТВО"
			if body != null: body.text = "Верстак: %s | Огонь: %s" % ["рядом" if near_wb else "нет", "рядом" if near_heat else "нет"]
			for rid in DataDB.recipes.keys():
				var r: Dictionary = DataDB.recipes[rid]
				var btn := Button.new()
				btn.text = "Крафт: %s" % String(r.get("name", rid))
				btn.pressed.connect(func(): action_requested.emit("craft", {"id": rid}))
				if box != null: box.add_child(btn)
			for bid in DataDB.buildables.keys():
				var b: Dictionary = DataDB.buildables[bid]
				var btn := Button.new()
				btn.text = "Построить: %s" % String(b.get("name", bid))
				btn.pressed.connect(func(): action_requested.emit("build", {"id": bid}))
				if box != null: box.add_child(btn)
		"catalog":
			if title != null: title.text = "КАТАЛОГ 10 000 ТЕКСТУР, МОДЕЛЕК И 3D МЕШЕЙ (F3)"
			if body != null: body.text = "Всего в библиотеке: %d (4000 текстур · 3000 моделек · 3000 3D мешей)." % AssetPack10K.TOTAL_COUNT
			for item in AssetPack10K.get_page(0, 12, "all"):
				var btn := Button.new()
				btn.text = "[%s] %s (%s · %s)" % [String(item["code"]), String(item["name"]), String(item["family"]), String(item["specs"])]
				btn.icon = AssetPack10K.build_texture(int(item["index"]))
				if box != null: box.add_child(btn)


func show_npc_dialogue(info: Dictionary) -> void:
	current_modal = "dialogue"
	var panel := get_node_or_null(modal_panel_path) as PanelContainer
	if panel != null: panel.visible = true
	var title := get_node_or_null(modal_title_path) as Label
	if title != null: title.text = String(info.get("name", "Выживший"))
	var body := get_node_or_null(modal_body_path) as Label
	if body != null: body.text = String(info.get("text", ""))
	var box := get_node_or_null(modal_buttons_box_path) as VBoxContainer
	if box != null:
		for ch in box.get_children():
			ch.queue_free()
		if bool(info.get("can_trade", false)):
			var btn := Button.new()
			btn.text = "Обменять консервы на бинт"
			btn.pressed.connect(func(): action_requested.emit("trade_npc", {"npc_id": info["npc_id"]}))
			box.add_child(btn)
		var close_btn := Button.new()
		close_btn.text = "Закрыть"
		close_btn.pressed.connect(_close_modals)
		box.add_child(close_btn)


func toggle_pause(paused: bool) -> void:
	var pp := get_node_or_null(pause_panel_path) as PanelContainer
	if pp != null:
		pp.visible = paused


func show_death_screen(cause: String) -> void:
	_close_modals()
	var dp := get_node_or_null(death_panel_path) as PanelContainer
	if dp != null: dp.visible = true
	var dr := get_node_or_null(death_reason_path) as Label
	if dr != null: dr.text = "Вы погибли: %s" % cause


func _close_modals() -> void:
	current_modal = ""
	var panel := get_node_or_null(modal_panel_path) as PanelContainer
	if panel != null: panel.visible = false
	var dp := get_node_or_null(death_panel_path) as PanelContainer
	if dp != null: dp.visible = false
	var pp := get_node_or_null(pause_panel_path) as PanelContainer
	if pp != null: pp.visible = false
