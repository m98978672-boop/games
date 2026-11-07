extends CanvasLayer
class_name SH2UI
## СЕКТОР «ПЕПЕЛ» — интерфейс: меню, брифинг, HUD, пауза, смерть, победа.
##
## Всё строится кодом из Control-узлов, без .tscn-разметки и внешних шрифтов.
## HUD рисуется в отдельном CanvasLayer поверх 3D; прицел — собственный _draw.

const COL_BG := Color(0.055, 0.05, 0.045, 0.94)
const COL_PANEL := Color(0.09, 0.085, 0.075, 0.96)
const COL_ACCENT := Color(0.92, 0.66, 0.24)
const COL_TEXT := Color(0.88, 0.86, 0.8)
const COL_DIM := Color(0.55, 0.53, 0.49)
const COL_BAD := Color(0.85, 0.32, 0.24)
const COL_GOOD := Color(0.5, 0.85, 0.55)

var game
var screens: Dictionary = {}
var current_screen: String = ""

var hud_root: Control
var crosshair: Control
var hp_bar: ProgressBar
var hp_label: Label
var armor_bar: ProgressBar
var stamina_bar: ProgressBar
var ammo_label: Label
var weapon_label: Label
var grenade_label: Label
var objective_box: VBoxContainer
var radio_box: VBoxContainer
var toast_box: VBoxContainer
var thought_label: Label
var hint_label: Label
var danger_vignette: ColorRect
var hitmarker: Label
var hitmarker_t: float = 0.0
var damage_numbers: Array = []
var kill_rows: VBoxContainer
var kill_rows_items: Array = []

var menu_root: Control
var mission_list: VBoxContainer
var briefing_root: Control
var brief_labels: Dictionary = {}
var pause_root: Control
var death_root: Control
var win_root: Control
var win_labels: Dictionary = {}
var death_stats: Label
var settings_root: Control
var progress: Dictionary = {"unlocked": 0, "best": {}}
var toast_queue: Array = []
var radio_rows: Array = []


func _ready() -> void:
	layer = 10
	_build_hud()
	_build_menu()
	_build_briefing()
	_build_pause()
	_build_death()
	_build_win()
	_build_settings()
	show_screen("menu")
	set_process(true)


func bind_game(game_ref) -> void:
	game = game_ref
	refresh_menu()


## ------------------------------- helpers ---------------------------------
func _label(text: String, size: int = 18, color: Color = COL_TEXT) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", color)
	return l


func _button(text: String, cb: Callable, size: int = 20) -> Button:
	var b := Button.new()
	b.text = text
	b.add_theme_font_size_override("font_size", size)
	b.custom_minimum_size = Vector2(0, 42)
	b.pressed.connect(cb)
	return b


func _panel(color: Color = COL_PANEL) -> PanelContainer:
	var p := PanelContainer.new()
	var sb := StyleBoxFlat.new()
	sb.bg_color = color
	sb.border_color = Color(0.28, 0.25, 0.2, 0.85)
	sb.set_border_width_all(1)
	sb.set_content_margin_all(18)
	sb.corner_radius_top_left = 4
	sb.corner_radius_top_right = 4
	sb.corner_radius_bottom_left = 4
	sb.corner_radius_bottom_right = 4
	p.add_theme_stylebox_override("panel", sb)
	return p


## Якорь + отступы: ax/ay — точка привязки (0..1), l/t/r/b — отступы от неё
func _anchor_box(c: Control, ax: float, ay: float, l: float, t: float,
		r: float, b: float) -> void:
	c.anchor_left = ax
	c.anchor_right = ax
	c.anchor_top = ay
	c.anchor_bottom = ay
	c.offset_left = l
	c.offset_top = t
	c.offset_right = r
	c.offset_bottom = b


func _full_rect(c: Control) -> Control:
	c.set_anchors_preset(Control.PRESET_FULL_RECT)
	c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return c


## -------------------------------- HUD ------------------------------------
func _build_hud() -> void:
	hud_root = _full_rect(Control.new())
	add_child(hud_root)

	danger_vignette = ColorRect.new()
	danger_vignette.color = Color(0.5, 0.05, 0.02, 0.0)
	danger_vignette.set_anchors_preset(Control.PRESET_FULL_RECT)
	danger_vignette.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hud_root.add_child(danger_vignette)

	crosshair = Control.new()
	crosshair.set_anchors_preset(Control.PRESET_FULL_RECT)
	crosshair.mouse_filter = Control.MOUSE_FILTER_IGNORE
	crosshair.draw.connect(_draw_crosshair)
	hud_root.add_child(crosshair)

	hitmarker = _label("✕", 26, COL_ACCENT)
	_anchor_box(hitmarker, 0.5, 0.5, -10.0, -20.0, 10.0, 10.0)
	hitmarker.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hitmarker.modulate.a = 0.0
	hud_root.add_child(hitmarker)

	# левый нижний блок: здоровье и выносливость
	var left := _panel()
	_anchor_box(left, 0.0, 1.0, 24.0, -154.0, 304.0, -24.0)
	left.custom_minimum_size = Vector2(280, 130)
	left.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hud_root.add_child(left)
	var left_box := VBoxContainer.new()
	left_box.add_theme_constant_override("separation", 4)
	left.add_child(left_box)
	hp_label = _label("СЕКТОР · 100", 15, COL_DIM)
	left_box.add_child(hp_label)
	hp_bar = ProgressBar.new()
	hp_bar.max_value = 100.0
	hp_bar.value = 100.0
	hp_bar.show_percentage = false
	hp_bar.custom_minimum_size = Vector2(240, 14)
	left_box.add_child(hp_bar)
	armor_bar = ProgressBar.new()
	armor_bar.max_value = 100.0
	armor_bar.show_percentage = false
	armor_bar.custom_minimum_size = Vector2(240, 8)
	left_box.add_child(armor_bar)
	stamina_bar = ProgressBar.new()
	stamina_bar.max_value = 100.0
	stamina_bar.show_percentage = false
	stamina_bar.custom_minimum_size = Vector2(240, 6)
	left_box.add_child(stamina_bar)

	# правый нижний блок: оружие и патроны
	var right := _panel()
	_anchor_box(right, 1.0, 1.0, -300.0, -144.0, -24.0, -24.0)
	right.custom_minimum_size = Vector2(270, 120)
	right.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hud_root.add_child(right)
	var right_box := VBoxContainer.new()
	right_box.alignment = BoxContainer.ALIGNMENT_END
	right.add_child(right_box)
	weapon_label = _label("ГРОЗА", 16, COL_DIM)
	weapon_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	right_box.add_child(weapon_label)
	ammo_label = _label("30 / 210", 34, COL_TEXT)
	ammo_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	right_box.add_child(ammo_label)
	grenade_label = _label("ГРАНАТЫ · 3", 14, COL_DIM)
	grenade_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	right_box.add_child(grenade_label)

	# цели — слева сверху
	var obj_panel := _panel(Color(0.07, 0.065, 0.06, 0.78))
	_anchor_box(obj_panel, 0.0, 0.0, 24.0, 24.0, 364.0, 24.0)
	obj_panel.custom_minimum_size = Vector2(340, 0)
	obj_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hud_root.add_child(obj_panel)
	objective_box = VBoxContainer.new()
	objective_box.add_theme_constant_override("separation", 3)
	obj_panel.add_child(objective_box)

	# радио — над здоровьем
	radio_box = VBoxContainer.new()
	_anchor_box(radio_box, 0.0, 1.0, 24.0, -300.0, 454.0, -164.0)
	radio_box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hud_root.add_child(radio_box)

	# мысли боевиков
	thought_label = _label("", 13, Color(0.75, 0.72, 0.62))
	_anchor_box(thought_label, 0.5, 0.0, -280.0, 26.0, 280.0, 50.0)
	thought_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hud_root.add_child(thought_label)

	# тосты — сверху по центру
	toast_box = VBoxContainer.new()
	_anchor_box(toast_box, 0.5, 0.0, -220.0, 62.0, 220.0, 62.0)
	toast_box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hud_root.add_child(toast_box)

	# фид убийств — справа сверху
	kill_rows = VBoxContainer.new()
	_anchor_box(kill_rows, 1.0, 0.0, -330.0, 24.0, -24.0, 24.0)
	kill_rows.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hud_root.add_child(kill_rows)

	hint_label = _label("", 15, COL_DIM)
	_anchor_box(hint_label, 0.5, 1.0, -280.0, -58.0, 280.0, -30.0)
	hint_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hud_root.add_child(hint_label)


func _draw_crosshair() -> void:
	if game == null or not game.is_playing():
		return
	var c: Vector2 = crosshair.size * 0.5
	if c.x < 1.0:
		return
	var spread: float = 7.0
	if game.player != null:
		var w: Dictionary = game.player.weapon()
		spread = 6.0 + game.player.spread_heat * 9.0 + Vector2(game.player.vx, game.player.vz).length() * 0.7
		if bool(w["scope"]) and game.player.scoped:
			# оптика: тонкий крест без боковых штрихов
			crosshair.draw_line(c + Vector2(-18, 0), c + Vector2(-4, 0), Color(0.9, 0.9, 0.85, 0.85), 1.0)
			crosshair.draw_line(c + Vector2(4, 0), c + Vector2(18, 0), Color(0.9, 0.9, 0.85, 0.85), 1.0)
			crosshair.draw_line(c + Vector2(0, -18), c + Vector2(0, -4), Color(0.9, 0.9, 0.85, 0.85), 1.0)
			crosshair.draw_line(c + Vector2(0, 4), c + Vector2(0, 18), Color(0.9, 0.9, 0.85, 0.85), 1.0)
			crosshair.draw_arc(c, 34.0, 0.0, TAU, 40, Color(0.85, 0.85, 0.8, 0.35), 1.0)
			return
	var col := Color(0.93, 0.9, 0.82, 0.8)
	for dir in [Vector2(1, 0), Vector2(-1, 0), Vector2(0, 1), Vector2(0, -1)]:
		crosshair.draw_line(c + dir * spread, c + dir * (spread + 8.0), col, 2.0)
	crosshair.draw_rect(Rect2(c - Vector2(1, 1), Vector2(2, 2)), Color(1, 1, 1, 0.65))
	# точка прицеливания
	if game.aim_info().get("enemy", null) != null:
		crosshair.draw_arc(c, spread + 12.0, 0.0, TAU, 24, Color(1.0, 0.45, 0.32, 0.7), 2.0)


## ------------------------------- меню ------------------------------------
func _build_menu() -> void:
	menu_root = _full_rect(Control.new())
	menu_root.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(menu_root)
	var bg := ColorRect.new()
	bg.color = COL_BG
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	menu_root.add_child(bg)

	var margin := MarginContainer.new()
	margin.set_anchors_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 64)
	margin.add_theme_constant_override("margin_top", 48)
	margin.add_theme_constant_override("margin_right", 64)
	margin.add_theme_constant_override("margin_bottom", 40)
	menu_root.add_child(margin)
	var cols := HBoxContainer.new()
	cols.add_theme_constant_override("separation", 32)
	margin.add_child(cols)

	var left := VBoxContainer.new()
	left.add_theme_constant_override("separation", 10)
	left.custom_minimum_size = Vector2(430, 0)
	cols.add_child(left)
	left.add_child(_label("СЕКТОР «ПЕПЕЛ»", 40, COL_ACCENT))
	left.add_child(_label("тактический шутер · Godot 4", 15, COL_DIM))
	var pad := Control.new()
	pad.custom_minimum_size = Vector2(0, 10)
	left.add_child(pad)
	left.add_child(_button("НАЧАТЬ ОПЕРАЦИЮ", func(): open_briefing(0)))
	left.add_child(_button("ПРОДОЛЖИТЬ", func(): open_briefing(mini(int(progress["unlocked"]), SH2Data.MISSIONS.size() - 1))))
	left.add_child(_button("ЛАБОРАТОРИЯ АНИМАЦИЙ", func(): open_lab()))
	left.add_child(_button("НАСТРОЙКИ", func(): show_screen("settings")))
	left.add_child(_button("ВЫХОД", func(): get_tree().quit()))
	var stats_panel := _panel()
	stats_panel.custom_minimum_size = Vector2(430, 0)
	left.add_child(stats_panel)
	var stats := VBoxContainer.new()
	stats.add_theme_constant_override("separation", 3)
	stats_panel.add_child(stats)
	var totals: Dictionary = SH2Data.totals()
	stats.add_child(_label("БИБЛИОТЕКА", 14, COL_ACCENT))
	stats.add_child(_label("Части: %d · Анимации: %d · Варианты: %d"
		% [int(totals["parts"]), int(totals["clips"]), int(totals["variants"])], 14, COL_TEXT))
	stats.add_child(_label("Клипов в наборе: %d" % int(totals["total"]), 14, COL_TEXT))
	stats.add_child(_label("Стволов: %d · Боевиков: %d · Карт: %d"
		% [SH2Data.WEAPONS.size(), SH2Data.ENEMY_TYPES.size(), SH2Data.MAPS.size()], 14, COL_TEXT))

	var right := VBoxContainer.new()
	right.add_theme_constant_override("separation", 10)
	right.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	cols.add_child(right)
	right.add_child(_label("МИССИИ", 18, COL_ACCENT))
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	right.add_child(scroll)
	mission_list = VBoxContainer.new()
	mission_list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	mission_list.add_theme_constant_override("separation", 8)
	scroll.add_child(mission_list)


func refresh_menu() -> void:
	if mission_list == null:
		return
	for c in mission_list.get_children():
		c.queue_free()
	for i in SH2Data.MISSIONS.size():
		var m: Dictionary = SH2Data.MISSIONS[i]
		var locked: bool = i > int(progress["unlocked"])
		var card := _panel(Color(0.09, 0.085, 0.075, 0.96) if not locked else Color(0.07, 0.068, 0.064, 0.8))
		card.mouse_filter = Control.MOUSE_FILTER_STOP
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 14)
		card.add_child(row)
		row.add_child(_label("%02d" % int(m["index"]), 26, COL_ACCENT if not locked else COL_DIM))
		var body := VBoxContainer.new()
		body.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(body)
		body.add_child(_label(str(m["name"]), 18, COL_TEXT if not locked else COL_DIM))
		var best: float = float(progress["best"].get(m["id"], 0.0))
		var tags: String = "%s · %s · врагов: %d" % [_type_label(str(m["type"])), str(SH2Data.MAPS[str(m["map"])]["name"] if SH2Data.MAPS.has(str(m["map"])) else m["map"]), (m["enemies"] as Array).size()]
		if best > 0.0:
			tags += " · рекорд %d" % int(best)
		body.add_child(_label(tags, 13, COL_DIM))
		var btn := _button("ЗАКРЫТО" if locked else "К БРИФИНГУ",
			func(): open_briefing(i), 15)
		btn.custom_minimum_size = Vector2(150, 38)
		btn.disabled = locked
		row.add_child(btn)
		mission_list.add_child(card)


func _type_label(t: String) -> String:
	match t:
		"eliminate":
			return "Зачистка"
		"destroy":
			return "Диверсия"
		"survive":
			return "Оборона"
		"extract":
			return "Эвакуация"
		"boss":
			return "Устранение"
	return t


## ------------------------------ брифинг ----------------------------------
func _build_briefing() -> void:
	briefing_root = _full_rect(Control.new())
	briefing_root.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(briefing_root)
	var bg := ColorRect.new()
	bg.color = COL_BG
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	briefing_root.add_child(bg)
	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	briefing_root.add_child(center)
	var panel := _panel()
	panel.custom_minimum_size = Vector2(720, 0)
	center.add_child(panel)
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 8)
	panel.add_child(box)
	brief_labels["num"] = _label("МИССИЯ 1 / 6", 14, COL_ACCENT)
	box.add_child(brief_labels["num"])
	brief_labels["name"] = _label("", 34, COL_TEXT)
	box.add_child(brief_labels["name"])
	brief_labels["text"] = _label("", 16, COL_TEXT)
	brief_labels["text"].autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	brief_labels["text"].custom_minimum_size = Vector2(660, 0)
	box.add_child(brief_labels["text"])
	var spacer := Control.new()
	spacer.custom_minimum_size = Vector2(0, 8)
	box.add_child(spacer)
	for key in [["type", "ТИП"], ["enemies", "ПРОТИВНИК"], ["loadout", "СНАРЯЖЕНИЕ"], ["tip", "СОВЕТ"]]:
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 12)
		var k := _label(str(key[1]), 13, COL_DIM)
		k.custom_minimum_size = Vector2(130, 0)
		row.add_child(k)
		var v := _label("", 14, COL_TEXT)
		v.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		v.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(v)
		brief_labels[str(key[0])] = v
		box.add_child(row)
	var gap := Control.new()
	gap.custom_minimum_size = Vector2(0, 12)
	box.add_child(gap)
	var buttons := HBoxContainer.new()
	buttons.add_theme_constant_override("separation", 10)
	box.add_child(buttons)
	var go := _button("В БОЙ", func(): start_from_brief())
	go.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	buttons.add_child(go)
	buttons.add_child(_button("НАЗАД", func(): show_screen("menu")))


func open_briefing(index: int) -> void:
	if game == null:
		return
	game.mission_index = clampi(index, 0, SH2Data.MISSIONS.size() - 1)
	var m: Dictionary = SH2Data.MISSIONS[game.mission_index]
	brief_labels["num"].text = "МИССИЯ %d / %d" % [int(m["index"]), SH2Data.MISSIONS.size()]
	brief_labels["name"].text = str(m["name"])
	brief_labels["text"].text = str(m["briefing"])
	brief_labels["type"].text = _type_label(str(m["type"]))
	var names: Array = []
	for t in m["enemies"]:
		var e: Dictionary = SH2Data.enemy_by_id(str(t))
		if not names.has(str(e["name"])):
			names.append(str(e["name"]))
	brief_labels["enemies"].text = " · ".join(names)
	var loadout: Array = []
	for wid in m["loadout"]:
		loadout.append(str(SH2Data.weapon_by_id(str(wid))["name"]))
	brief_labels["loadout"].text = " · ".join(loadout)
	brief_labels["tip"].text = str(m["tip"])
	show_screen("briefing")


func start_from_brief() -> void:
	hide_screen()
	game.start_mission(game.mission_index)


## ------------------------------- пауза -----------------------------------
func _build_pause() -> void:
	pause_root = _full_rect(Control.new())
	pause_root.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(pause_root)
	var bg := ColorRect.new()
	bg.color = Color(0.03, 0.03, 0.03, 0.78)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	pause_root.add_child(bg)
	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	pause_root.add_child(center)
	var panel := _panel()
	panel.custom_minimum_size = Vector2(420, 0)
	center.add_child(panel)
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 10)
	panel.add_child(box)
	box.add_child(_label("ПАУЗА", 30, COL_ACCENT))
	box.add_child(_button("ПРОДОЛЖИТЬ", func(): game.resume()))
	box.add_child(_button("НАСТРОЙКИ", func(): show_screen("settings")))
	box.add_child(_button("ЗАНОВО", func(): game.retry()))
	box.add_child(_button("В МЕНЮ", func(): _to_menu()))


## ------------------------------- смерть ----------------------------------
func _build_death() -> void:
	death_root = _full_rect(Control.new())
	death_root.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(death_root)
	var bg := ColorRect.new()
	bg.color = Color(0.16, 0.03, 0.02, 0.72)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	death_root.add_child(bg)
	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	death_root.add_child(center)
	var panel := _panel()
	panel.custom_minimum_size = Vector2(460, 0)
	center.add_child(panel)
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 10)
	panel.add_child(box)
	box.add_child(_label("ОПЕРАЦИЯ ПРОВАЛЕНА", 28, COL_BAD))
	death_stats = _label("", 15, COL_TEXT)
	death_stats.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	death_stats.custom_minimum_size = Vector2(400, 0)
	box.add_child(death_stats)
	box.add_child(_button("ПОВТОРИТЬ", func(): game.retry()))
	box.add_child(_button("В МЕНЮ", func(): _to_menu()))


func show_death() -> void:
	if game == null:
		return
	var p = game.player
	death_stats.text = "Боевиков уничтожено: %d · Выстрелов: %d · Попаданий: %d · Урон получен: %d" \
		% [game.kills, p.shots, p.hits, int(p.damage_taken)]
	show_screen("death")


## ------------------------------- победа ----------------------------------
func _build_win() -> void:
	win_root = _full_rect(Control.new())
	win_root.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(win_root)
	var bg := ColorRect.new()
	bg.color = Color(0.03, 0.1, 0.05, 0.7)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	win_root.add_child(bg)
	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	win_root.add_child(center)
	var panel := _panel()
	panel.custom_minimum_size = Vector2(500, 0)
	center.add_child(panel)
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 10)
	panel.add_child(box)
	win_labels["title"] = _label("ОПЕРАЦИЯ ЗАВЕРШЕНА", 26, COL_GOOD)
	box.add_child(win_labels["title"])
	win_labels["stats"] = _label("", 15, COL_TEXT)
	win_labels["stats"].autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	win_labels["stats"].custom_minimum_size = Vector2(440, 0)
	box.add_child(win_labels["stats"])
	win_labels["next"] = _button("СЛЕДУЮЩАЯ МИССИЯ", func(): game.next_mission())
	box.add_child(win_labels["next"])
	box.add_child(_button("ПЕРЕИГРАТЬ", func(): game.retry()))
	box.add_child(_button("В МЕНЮ", func(): _to_menu()))


func show_win(stats: Dictionary) -> void:
	win_labels["stats"].text = "Время: %s · Точность: %d%% · Убийств: %d · Урон получен: %d · Бонус за время: %d · Очки: %d" \
		% [_fmt_time(float(stats["time"])), int(stats["accuracy"]), int(stats["kills"]),
		int(stats["damage_taken"]), int(stats["time_bonus"]), int(stats["score"])]
	win_labels["next"].visible = not bool(stats["last"])
	show_screen("win")


## ------------------------------ настройки ---------------------------------
func _build_settings() -> void:
	settings_root = _full_rect(Control.new())
	settings_root.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(settings_root)
	var bg := ColorRect.new()
	bg.color = COL_BG
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	settings_root.add_child(bg)
	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	settings_root.add_child(center)
	var panel := _panel()
	panel.custom_minimum_size = Vector2(540, 0)
	center.add_child(panel)
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 8)
	panel.add_child(box)
	box.add_child(_label("НАСТРОЙКИ", 26, COL_ACCENT))

	var ragdoll_cb := CheckButton.new()
	ragdoll_cb.text = "Регдол при смерти"
	ragdoll_cb.button_pressed = true
	ragdoll_cb.toggled.connect(func(v: bool):
		if game != null:
			game.settings["ragdoll"] = v)
	box.add_child(ragdoll_cb)

	var thoughts_cb := CheckButton.new()
	thoughts_cb.text = "Показывать мысли боевиков"
	thoughts_cb.button_pressed = true
	thoughts_cb.toggled.connect(func(v: bool):
		if game != null:
			game.settings["show_thoughts"] = v)
	box.add_child(thoughts_cb)

	var inv_cb := CheckButton.new()
	inv_cb.text = "Инвертировать ось Y"
	inv_cb.toggled.connect(func(v: bool):
		if game != null:
			game.settings["invert_y"] = v)
	box.add_child(inv_cb)

	box.add_child(_label("Сложность", 15, COL_DIM))
	var diff := OptionButton.new()
	diff.add_item("Рядовой", 0)
	diff.add_item("Ветеран", 1)
	diff.add_item("Шторм", 2)
	diff.selected = 1
	diff.item_selected.connect(func(i: int):
		if game != null:
			game.set_difficulty(i))
	box.add_child(diff)

	box.add_child(_label("Чувствительность мыши", 15, COL_DIM))
	var sens := HSlider.new()
	sens.min_value = 0.2
	sens.max_value = 3.0
	sens.step = 0.05
	sens.value = 1.0
	sens.custom_minimum_size = Vector2(360, 24)
	sens.value_changed.connect(func(v: float):
		if game != null:
			game.settings["mouse_sens"] = v)
	box.add_child(sens)

	box.add_child(_button("НАЗАД", func(): show_screen("menu" if game == null or not game.in_mission() else "pause")))


## ------------------------------ лаборатория -------------------------------
var lab_root: Control
var lab_index: int = 0
var lab_clip_index: int = 0
var lab_variant: int = 0
var lab_label: Label


func _build_lab() -> void:
	lab_root = _full_rect(Control.new())
	lab_root.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(lab_root)
	var bg := ColorRect.new()
	bg.color = Color(0.04, 0.04, 0.045, 0.86)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	lab_root.add_child(bg)
	var box := VBoxContainer.new()
	box.position = Vector2(32, 32)
	box.add_theme_constant_override("separation", 6)
	lab_root.add_child(box)
	box.add_child(_label("ЛАБОРАТОРИЯ · 22 части × 20 анимаций × 4 варианта", 22, COL_ACCENT))
	lab_label = _label("", 16, COL_TEXT)
	box.add_child(lab_label)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	box.add_child(row)
	row.add_child(_button("ЧАСТЬ −", func(): lab_cycle("part", -1), 15))
	row.add_child(_button("ЧАСТЬ +", func(): lab_cycle("part", 1), 15))
	row.add_child(_button("КЛИП −", func(): lab_cycle("clip", -1), 15))
	row.add_child(_button("КЛИП +", func(): lab_cycle("clip", 1), 15))
	row.add_child(_button("ВАРИАНТ", func(): lab_cycle("variant", 1), 15))
	row.add_child(_button("ГРАФИК", func(): lab_toggle_graph(), 15))
	row.add_child(_button("НАЗАД", func(): lab_back(), 15))
	box.add_child(_label("Кривая: 5 каналов (rx, ry, rz, ty, tz) по 12 кадрам; сэмпл — smoothstep", 13, COL_DIM))


var lab_graph: bool = false


func open_lab() -> void:
	if game == null:
		return
	_build_lab_if_needed()
	game.open_lab()
	show_screen("lab")
	lab_sync()


func _build_lab_if_needed() -> void:
	if lab_root == null:
		_build_lab()


func lab_cycle(kind: String, dir: int) -> void:
	if game == null:
		return
	match kind:
		"part":
			lab_index = posmod(lab_index + dir, SH2Data.PARTS.size())
		"clip":
			lab_clip_index = posmod(lab_clip_index + dir, SH2Data.CLIPS.size())
		"variant":
			lab_variant = posmod(lab_variant + dir, SH2Data.VARIANTS.size())
			game.lab_set_variant(lab_variant)
	game.lab_select(lab_index, lab_clip_index, lab_variant)
	lab_sync()


func lab_sync() -> void:
	if lab_label == null:
		return
	var part: Dictionary = SH2Data.PARTS[lab_index]
	var clip: Dictionary = SH2Data.CLIPS[lab_clip_index]
	var variant: Dictionary = SH2Data.VARIANTS[lab_variant]
	lab_label.text = "Часть %d/%d: %s (%s)\nАнимация %d/%d: %s — %.2f с\nВариант %d/%d: %s" % [
		lab_index + 1, SH2Data.PARTS.size(), str(part["label"]), str(part["bone"]),
		lab_clip_index + 1, SH2Data.CLIPS.size(), str(clip["label"]), float(clip["dur"]),
		lab_variant + 1, SH2Data.VARIANTS.size(), str(variant["label"])]


func lab_draw_graph() -> void:
	if lab_root == null or not lab_graph:
		return
	pass


## ------------------------------- экраны ----------------------------------
func show_screen(name: String) -> void:
	current_screen = name
	for key in screens.keys():
		(screens[key] as Control).visible = (key == name)
	for c in [menu_root, briefing_root, pause_root, death_root, win_root, settings_root]:
		if c != null:
			c.visible = false
	var target: Control = null
	match name:
		"menu":
			target = menu_root
			refresh_menu()
		"briefing":
			target = briefing_root
		"pause":
			target = pause_root
		"death":
			target = death_root
		"win":
			target = win_root
		"settings":
			target = settings_root
		"lab":
			target = lab_root
	if target != null:
		target.visible = true
	hud_root.visible = name == "none" or name == ""
	Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE if target != null else Input.MOUSE_MODE_CAPTURED)
	if game != null:
		game.ui_screen_changed(name)


func hide_screen() -> void:
	show_screen("none")


func is_hud_visible() -> bool:
	return hud_root != null and hud_root.visible


## ------------------------------- HUD API ---------------------------------
func _fmt_time(t: float) -> String:
	return "%d:%02d" % [int(t) / 60, int(t) % 60]


func frame(game_ref, dt: float) -> void:
	game = game_ref
	if hitmarker_t > 0.0:
		hitmarker_t -= dt
		hitmarker.modulate.a = maxf(0.0, hitmarker_t / 0.25)
	if not hud_root.visible:
		crosshair.queue_redraw()
		return
	var p = game.player
	hp_bar.value = p.hp
	armor_bar.value = p.armor
	stamina_bar.value = p.stamina
	hp_label.text = "СЕКТОР · %d" % int(ceil(p.hp))
	var w: Dictionary = p.weapon()
	weapon_label.text = str(w["short"])
	ammo_label.text = "%d / %d" % [p.ammo_in_mag, p.reserve]
	ammo_label.add_theme_color_override("font_color", COL_BAD if p.ammo_in_mag == 0 else COL_TEXT)
	grenade_label.text = "ГРАНАТЫ · %d" % p.grenade_count
	danger_vignette.color.a = lerpf(danger_vignette.color.a, game.danger * 0.20, minf(1.0, dt * 3.0))
	# мысли ближайшего боевика
	if bool(game.settings.get("show_thoughts", true)):
		var near = game.nearest_alive_enemy()
		if near != null and near.brain != null and near.brain.thought_timer > 0.0:
			thought_label.text = "%s: «%s»" % [str(SH2Data.enemy_by_id(near.type_id)["short"]), near.brain.thought]
		else:
			thought_label.text = ""
	else:
		thought_label.text = ""
	for i in range(damage_numbers.size() - 1, -1, -1):
		var item: Dictionary = damage_numbers[i]
		item["life"] = float(item["life"]) - dt
		var lbl: Label = item["label"]
		lbl.position.y -= dt * 34.0
		lbl.modulate.a = clampf(float(item["life"]) / 0.7, 0.0, 1.0)
		if float(item["life"]) <= 0.0:
			lbl.queue_free()
			damage_numbers.remove_at(i)
	for i in range(radio_rows.size() - 1, -1, -1):
		var row: Dictionary = radio_rows[i]
		row["t"] = float(row["t"]) - dt
		if float(row["t"]) <= 0.0:
			(row["node"] as Control).queue_free()
			radio_rows.remove_at(i)
	for i in range(toast_queue.size() - 1, -1, -1):
		var t: Dictionary = toast_queue[i]
		t["t"] = float(t["t"]) - dt
		if float(t["t"]) <= 0.0:
			(t["node"] as Control).queue_free()
			toast_queue.remove_at(i)
	crosshair.queue_redraw()


func hitmarker_fx(kind: String, killed: bool) -> void:
	hitmarker.text = "✕"
	hitmarker.add_theme_color_override("font_color", COL_BAD if kind == "head" or killed else COL_ACCENT)
	hitmarker_t = 0.25
	hitmarker.modulate.a = 1.0


func damage_number(world_pos: Vector3, amount: int, is_head: bool) -> void:
	if game == null or game.camera == null:
		return
	if game.camera.is_position_behind(world_pos):
		return
	var screen: Vector2 = game.camera.unproject_position(world_pos)
	var l := _label(str(amount) if not is_head else str(amount) + "!", 20,
		COL_BAD if is_head else COL_TEXT)
	l.position = screen + Vector2(randf_range(-14.0, 14.0), -10.0)
	hud_root.add_child(l)
	damage_numbers.append({"label": l, "life": 0.7})


func toast(text: String, dur: float = 2.6) -> void:
	var panel := _panel(Color(0.09, 0.085, 0.075, 0.92))
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var l := _label(text, 15, COL_TEXT)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	panel.add_child(l)
	toast_box.add_child(panel)
	toast_queue.append({"node": panel, "t": dur})
	if toast_queue.size() > 4:
		var old: Dictionary = toast_queue.pop_front()
		(old["node"] as Control).queue_free()


func radio(text: String, name: String, game_time: float) -> void:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	row.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var who := _label("[%s]" % name, 13, COL_ACCENT)
	row.add_child(who)
	var msg := _label(text, 13, COL_TEXT)
	msg.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	msg.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(msg)
	radio_box.add_child(row)
	radio_rows.append({"node": row, "t": 5.0, "t0": game_time})
	if radio_rows.size() > 4:
		var old: Dictionary = radio_rows.pop_front()
		(old["node"] as Control).queue_free()


func kill_feed(text: String, head: bool) -> void:
	var l := _label(text, 14, COL_BAD if head else COL_TEXT)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	kill_rows.add_child(l)
	kill_rows_items.append(l)
	if kill_rows_items.size() > 5:
		var old: Label = kill_rows_items.pop_front()
		if is_instance_valid(old):
			old.queue_free()


func set_objectives(list: Array) -> void:
	for c in objective_box.get_children():
		c.queue_free()
	if list.is_empty():
		return
	objective_box.add_child(_label("ЗАДАЧИ", 13, COL_ACCENT))
	for o in list:
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 8)
		var mark := "✓" if bool(o["done"]) else "•"
		row.add_child(_label(mark, 15, COL_GOOD if bool(o["done"]) else COL_TEXT))
		var text: String = str(o["text"])
		if int(o["max"]) > 1:
			text += "  (%d/%d)" % [int(o["current"]), int(o["max"])]
		var l := _label(text, 14, COL_DIM if bool(o["done"]) else COL_TEXT)
		l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(l)
		objective_box.add_child(row)


func objective_done(o: Dictionary) -> void:
	toast("Задача выполнена: " + str(o["text"]), 2.2)


## Очистка HUD между миссиями: чтобы не копились тосты, радио и фид убийств
func reset_hud() -> void:
	for i in range(radio_rows.size() - 1, -1, -1):
		var row: Dictionary = radio_rows[i]
		if is_instance_valid(row["node"]):
			(row["node"] as Control).queue_free()
	radio_rows.clear()
	for i in range(toast_queue.size() - 1, -1, -1):
		var t: Dictionary = toast_queue[i]
		if is_instance_valid(t["node"]):
			(t["node"] as Control).queue_free()
	toast_queue.clear()
	for row in kill_rows_items:
		if is_instance_valid(row):
			row.queue_free()
	kill_rows_items.clear()
	for i in range(damage_numbers.size() - 1, -1, -1):
		var item: Dictionary = damage_numbers[i]
		if is_instance_valid(item["label"]):
			(item["label"] as Control).queue_free()
	damage_numbers.clear()
	set_objectives([])
	hitmarker_t = 0.0
	hitmarker.modulate.a = 0.0
	danger_vignette.color.a = 0.0
	thought_label.text = ""
	hint_label.text = ""


func mission_start(m: Dictionary) -> void:
	toast("МИССИЯ %d · %s" % [int(m["index"]), str(m["name"])], 3.0)
	hint_label.text = "WASD — движение · Shift — бег · Ctrl — присед · ПКМ — прицел · G — граната · R — перезарядка · Esc — пауза"


func mission_complete(stats: Dictionary) -> void:
	show_win(stats)


func wave_started(index: int, total: int) -> void:
	toast("Волна %d из %d" % [index, total], 2.0)


func lab_toggle_graph() -> void:
	lab_graph = not lab_graph


func lab_back() -> void:
	if game != null:
		game.close_lab()
	show_screen("menu")


func _to_menu() -> void:
	if game != null:
		game.go_menu()
	show_screen("menu")
