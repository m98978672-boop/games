class_name RazlomTouchControls
extends Control
## Independent touch IDs for analog movement, drag-look, and held actions.
var game
var movement := Vector2.ZERO
var move_id := -1
var look_id := -1
var move_origin := Vector2.ZERO
var move_knob := Vector2.ZERO
var held: Dictionary = {}
var zones: Dictionary = {}
var was_playing := false

func _ready() -> void:
	name = "TouchControls"
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	process_mode = Node.PROCESS_MODE_ALWAYS
	resized.connect(layout)
	layout()

func layout() -> void:
	reset()
	var view := get_viewport_rect().size
	move_origin = Vector2(100, view.y - 110)
	move_knob = move_origin
	zones.clear()
	var actions := ["fire", "interact", "jump", "reload", "aim", "crouch", "heal", "flashlight"]
	var columns := 3 if view.x > 700 else 2
	for i in range(actions.size()):
		var col := i % columns
		var row := int(i / columns)
		zones[actions[i]] = Rect2(Vector2(view.x - 88 - col * 84, view.y - 110 - row * 74), Vector2(72, 60))
	zones["menu"] = Rect2(view.x - 100, 16, 84, 50)
	zones["inventory"] = Rect2(view.x - 100, 76, 84, 50)
	queue_redraw()

func reset() -> void:
	for action in held.values():
		if InputMap.has_action(action):
			Input.action_release(action)
	held.clear()
	move_id = -1
	look_id = -1
	movement = Vector2.ZERO
	move_knob = move_origin
	queue_redraw()

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_WINDOW_FOCUS_OUT:
		reset()

func _process(_delta: float) -> void:
	var playing: bool = game.started and not game.ended and not get_tree().paused
	visible = playing
	if was_playing and not playing:
		reset()
	was_playing = playing

func _input(event: InputEvent) -> void:
	if get_tree().paused or game.ended or not game.started:
		return
	if event is InputEventScreenTouch:
		if not event.pressed:
			if event.index == move_id:
				move_id = -1
				movement = Vector2.ZERO
				move_knob = move_origin
			if event.index == look_id:
				look_id = -1
			if held.has(event.index):
				Input.action_release(held[event.index])
				held.erase(event.index)
			queue_redraw()
			return
		for action in zones:
			if zones[action].has_point(event.position):
				get_viewport().set_input_as_handled()
				if action == "menu":
					reset()
					game.show_menu("ПЕРЕДЫШКА", "Укрытие, вода и кто-то, кто ждёт твоего возвращения.\nСохраняйся в убежище после затихания боя.\nЖурнал истории доступен в инвентаре.")
				elif action == "inventory":
					reset()
					game.interactions.inventory()
				else:
					held[event.index] = action
					Input.action_press(action)
				queue_redraw()
				return
		if event.position.x < get_viewport_rect().size.x * 0.42 and move_id == -1:
			move_id = event.index
			update_move(event.position)
		elif look_id == -1:
			look_id = event.index
		get_viewport().set_input_as_handled()
	elif event is InputEventScreenDrag:
		if event.index == move_id:
			update_move(event.position)
		elif event.index == look_id:
			game.player.touch_look(event.relative)
		get_viewport().set_input_as_handled()

func update_move(point: Vector2) -> void:
	movement = ((point - move_origin) / 62.0).limit_length(1)
	if movement.length() < 0.12:
		movement = Vector2.ZERO
	move_knob = move_origin + movement * 62
	queue_redraw()

func _draw() -> void:
	draw_circle(move_origin, 72, Color(0.08, 0.14, 0.12, 0.55))
	draw_arc(move_origin, 72, 0, TAU, 48, Color(0.8, 0.9, 0.73, 0.6), 2)
	draw_circle(move_knob, 28, Color(0.7, 0.8, 0.62, 0.7))
	var names := {"fire": "ОГОНЬ", "interact": "ВЗЯТЬ", "jump": "ПРЫЖОК", "reload": "МАГАЗИН", "aim": "ПРИЦЕЛ", "crouch": "ПРИСЕСТЬ", "heal": "ЛЕЧИТЬ", "flashlight": "ФОНАРЬ", "menu": "МЕНЮ", "inventory": "РЮКЗАК"}
	var font := ThemeDB.fallback_font
	for action in zones:
		var rect: Rect2 = zones[action]
		var active: bool = action in held.values()
		draw_style_box(RazlomMenuStyle.surface(Color(0.3, 0.44, 0.34, 0.9) if active else Color(0.05, 0.13, 0.1, 0.7), Color(0.6, 0.75, 0.55, 0.5), 14), rect)
		draw_string(font, rect.position + Vector2(4, 36), names[action], HORIZONTAL_ALIGNMENT_CENTER, rect.size.x - 8, 12, Color("edf2dc"))
