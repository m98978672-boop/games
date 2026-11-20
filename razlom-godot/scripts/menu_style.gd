class_name RazlomMenuStyle
extends RefCounted
## Quiet right-hand drawer. All tweens continue while the world is paused.
var panel: PanelContainer
var shade: ColorRect
var tween: Tween
var hover_tweens: Dictionary = {}
var host: Control
var closing := false

func setup(root: Control, drawer: PanelContainer) -> VBoxContainer:
	host = root
	panel = drawer
	shade = ColorRect.new()
	shade.name = "MenuShade"
	shade.color = Color(0.025, 0.055, 0.05, 0.48)
	shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	shade.mouse_filter = Control.MOUSE_FILTER_STOP
	root.add_child(shade)
	root.add_child(panel)
	panel.name = "RightMenu"
	panel.add_theme_stylebox_override("panel", surface(Color("e9eee3"), Color("c8d7c5"), 26))
	panel.clip_contents = true
	panel.visibility_changed.connect(func(): shade.visible = panel.visible)
	root.resized.connect(layout)
	layout()
	var scroll := ScrollContainer.new()
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	panel.add_child(scroll)
	var column := VBoxContainer.new()
	column.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	column.add_theme_constant_override("separation", 13)
	scroll.add_child(column)
	return column

func layout() -> void:
	panel.set_anchors_and_offsets_preset(Control.PRESET_RIGHT_WIDE)
	var width := minf(490, maxf(260, host.size.x - 32))
	panel.offset_left = -width - 24
	panel.offset_right = -24
	panel.offset_top = 24
	panel.offset_bottom = -24

static func surface(fill: Color, border: Color, radius: int = 14) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = fill
	style.border_color = border
	style.set_border_width_all(1)
	style.set_corner_radius_all(radius)
	style.content_margin_left = 24
	style.content_margin_right = 24
	style.content_margin_top = 19
	style.content_margin_bottom = 19
	return style

func label(node: Label, size: int, color: Color = Color("354b43")) -> void:
	node.add_theme_font_size_override("font_size", size)
	node.add_theme_color_override("font_color", color)
	node.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	node.custom_minimum_size.x = 0

func button(node: Button, primary: bool = false) -> void:
	node.alignment = HORIZONTAL_ALIGNMENT_LEFT
	node.custom_minimum_size.y = 52
	node.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	node.add_theme_font_size_override("font_size", 16)
	node.add_theme_color_override("font_color", Color("f2f5e9") if primary else Color("354b43"))
	node.add_theme_color_override("font_hover_color", Color("f2f5e9") if primary else Color("253e33"))
	node.add_theme_color_override("font_focus_color", Color("f2f5e9") if primary else Color("253e33"))
	node.add_theme_color_override("font_pressed_color", Color("f2f5e9") if primary else Color("253e33"))
	node.add_theme_color_override("font_disabled_color", Color("8b988d"))
	node.add_theme_stylebox_override("normal", surface(Color("526e5d") if primary else Color("e0e8da"), Color("c8d7c5")))
	node.add_theme_stylebox_override("hover", surface(Color("617e68") if primary else Color("d3e1cd"), Color("a4b99e")))
	node.add_theme_stylebox_override("pressed", surface(Color("405d4c") if primary else Color("c8d8c2"), Color("93ad8e")))
	node.add_theme_stylebox_override("disabled", surface(Color("e3e8df"), Color("d6ded2")))
	var focus := surface(Color(0, 0, 0, 0), Color("91aa7c"))
	focus.set_border_width_all(2)
	node.add_theme_stylebox_override("focus", focus)
	node.mouse_entered.connect(func(): hover(node, true))
	node.mouse_exited.connect(func(): hover(node, false))

func hover(node: Button, active: bool) -> void:
	if hover_tweens.has(node) and hover_tweens[node].is_valid():
		hover_tweens[node].kill()
	var animation := node.create_tween().set_pause_mode(Tween.TWEEN_PAUSE_PROCESS)
	animation.tween_property(node, "modulate", Color(1.04, 1.04, 1.02) if active and not node.disabled else Color.WHITE, 0.18)
	hover_tweens[node] = animation

func open() -> void:
	if tween != null and tween.is_valid():
		tween.kill()
	closing = false
	shade.mouse_filter = Control.MOUSE_FILTER_STOP
	panel.show()
	panel.mouse_filter = Control.MOUSE_FILTER_STOP
	layout()
	panel.get_tree().process_frame.connect(settle_layout, CONNECT_ONE_SHOT)
	panel.position.x += 42
	panel.modulate.a = 0
	shade.modulate.a = 0
	tween = panel.create_tween().set_pause_mode(Tween.TWEEN_PAUSE_PROCESS).set_parallel(true)
	tween.set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	tween.tween_property(panel, "position:x", panel.position.x - 42, 0.38)
	tween.tween_property(panel, "modulate:a", 1.0, 0.3)
	tween.tween_property(shade, "modulate:a", 1.0, 0.38)

func close() -> void:
	if tween != null and tween.is_valid():
		tween.kill()
	closing = true
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	tween = panel.create_tween().set_pause_mode(Tween.TWEEN_PAUSE_PROCESS).set_parallel(true)
	tween.set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_IN)
	tween.tween_property(panel, "position:x", panel.position.x + 28, 0.2)
	tween.tween_property(panel, "modulate:a", 0.0, 0.2)
	tween.tween_property(shade, "modulate:a", 0.0, 0.2)
	tween.chain().tween_callback(func():
		panel.hide()
		closing = false)

func settle_layout() -> void:
	# Text shaping can update Control minimum sizes one frame after a menu changes.
	if is_instance_valid(panel) and is_instance_valid(host):
		layout()
