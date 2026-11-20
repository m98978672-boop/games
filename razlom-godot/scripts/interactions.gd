extends RefCounted
## Diegetic shelter interactions, inventory and dialogue. No generated canon.
var game
var panel: PanelContainer
var column: VBoxContainer

func spawn_shelter(parent: Node3D) -> void:
	var doctor := StaticBody3D.new()
	doctor.name = "Vera"
	doctor.set_meta("use", "vera")
	doctor.set_meta("title", "Вера • поговорить")
	parent.add_child(doctor)
	doctor.position = Vector3(-25.5, 0.25, 24)
	var model: PackedScene = load("res://assets/models/medic.tscn")
	doctor.add_child(model.instantiate())
	var col := CollisionShape3D.new()
	var shape := CapsuleShape3D.new()
	shape.radius = 0.35
	shape.height = 1.8
	col.shape = shape
	col.position.y = 0.9
	doctor.add_child(col)
	var label := RazlomArt.sign_text(doctor, "ВЕРА / МЕДИК", Vector3(0, 2.1, 0), 24)
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	for body in parent.get_children():
		if body is StaticBody3D:
			if body.position.distance_to(Vector3(-25, 0.5, 19)) < 0.1:
				body.set_meta("use", "bed")
				body.set_meta("title", "Постель • отдохнуть")
			if body.position.distance_to(Vector3(-20, 0.65, 19)) < 0.1:
				body.set_meta("use", "bench")
				body.set_meta("title", "Верстак • обмен деталей")

func setup_ui(root: Control) -> void:
	panel = PanelContainer.new()
	root.add_child(panel)
	panel.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	panel.position = Vector2(-320, -260)
	panel.custom_minimum_size = Vector2(640, 480)
	panel.add_theme_stylebox_override("panel", game.panel_style())
	column = VBoxContainer.new()
	column.add_theme_constant_override("separation", 16)
	panel.add_child(column)
	panel.hide()

func open(title: String, body: String, choices: Array) -> void:
	if game.ended:
		return
	for child in column.get_children():
		column.remove_child(child)
		child.queue_free()
	column.add_child(game.ui_label(title, 30))
	var text: Label = game.ui_label(body, 17)
	text.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	text.custom_minimum_size = Vector2(580, 120)
	column.add_child(text)
	for choice in choices:
		var button := Button.new()
		button.text = choice.text
		button.custom_minimum_size.y = 42
		button.pressed.connect(choice.action)
		column.add_child(button)
	game.modal.hide()
	panel.show()
	game.get_tree().paused = true
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	if column.get_child_count() > 2:
		column.get_child(2).grab_focus()

func try_interact(hit: Dictionary) -> bool:
	if hit.is_empty() or not hit.collider.has_meta("use"):
		return false
	match str(hit.collider.get_meta("use")):
		"dog":
			hit.collider.befriend()
		"vera":
			vera_dialog()
		"bed":
			bed_dialog()
		"bench":
			bench_dialog()
	return true

func vera_dialog() -> void:
	var body := "«Нужен насос со склада 03, за дорогой. Блок зелёный, с ручкой.\nВернёшь — установим здесь. Еду и воду бери со стола.\nНе лезь под огонь. В кладке сбоку есть слабые места»."
	if game.state.complete:
		body = "«Вода пошла. Теперь можно думать о следующем дне.\nПо старой накладной этот груз вообще должен был уйти из долины.\nКому они возят воду, пока мы считаем каждую бутылку?»"
	elif game.state.pump:
		body = "«Нашёл? Давай сюда. Я подключу питание.\nЕсли заработает, к утру будет запас на весь Очаг»."
	var choices: Array = []
	if game.state.pump and not game.state.complete:
		choices.append({"text": "Отдать насосный блок", "action": func():
			game.resume()
			game.complete_mission()})
	choices.append({"text": "Помоги с ранами • 2 детали", "action": func():
		if game.state.scrap >= 2 and game.state.health < 100:
			game.state.scrap -= 2
			game.state.health = 100
			game.notify("Вера обработала раны")
		else:
			game.notify("Нужны 2 детали, а лечение имеет смысл только при ранении")
		game.resume()})
	choices.append({"text": "Я вернусь", "action": game.resume})
	open("ВЕРА ЛЕСНАЯ", body, choices)

func bed_dialog() -> void:
	open("ТЁПЛЫЙ НОЧЛЕГ", "Отдохнуть четыре часа: восстановятся тепло, силы и часть здоровья.\nРасход: 10 еды и 15 воды. Нужно хотя бы 15 еды и 20 воды.\nНельзя спать во время тревоги или рядом с активным зарядом.", [
		{"text": "Отдохнуть четыре часа", "action": func():
			if game.safe_to_rest() and game.state.rest():
				game.day_minutes += 240
				game.notify("Четыре часа в тепле. Ты снова готов к дороге")
			else:
				game.notify("Сначала утоли голод/жажду и дождись безопасности")
			game.resume()},
		{"text": "Не сейчас", "action": game.resume}])

func bench_dialog() -> void:
	var choices: Array = []
	for recipe in ["medkit", "ammo", "charge"]:
		var names := {"medkit": "Медицинский набор • 2 детали", "ammo": "Коробка патронов • 2 детали", "charge": "Условный игровой заряд • 3 детали"}
		choices.append({"text": names[recipe], "action": func():
			var ok: bool = game.state.craft(recipe)
			game.resume()
			game.notify("Получено: " + names[recipe] if ok else "Недостаточно деталей")})
	choices.append({"text": "Вернуться", "action": game.resume})
	open("ВЕРСТАК / ЗАПАСЫ", "Доступно деталей: %d\nЭто обмен условных ресурсов, не реальные рецепты боеприпасов.\nДополнительные детали лежат в ржавых контейнерах у дороги." % game.state.scrap, choices)

func inventory() -> void:
	var s = game.state
	var body := "Еда: %d   Вода: %d   Аптечки: %d\nПатроны: %d + %d   Заряды: %d   Детали: %d\n\nТепло: %d / 100   Усталость: %d / 100\nНасос: %s\n\nХолод и голод продолжают действовать после закрытия панели." % [s.food, s.bottles, s.medkits, s.ammo, s.reserve, s.charges, s.scrap, s.warmth, s.fatigue, "доставлен" if s.complete else ("в рюкзаке" if s.pump else "на складе")]
	var choices: Array = []
	for kind in ["food", "water", "heal"]:
		var names := {"food": "Поесть", "water": "Выпить воды", "heal": "Использовать аптечку"}
		choices.append({"text": names[kind], "action": func():
			game.state.use_item(kind)
			game.resume()})
	choices.append({"text": "Закрыть", "action": game.resume})
	open("РЮКЗАК / СОСТОЯНИЕ", body, choices)
