extends RefCounted
## Diegetic shelter interactions, inventory and dialogue. No generated canon.
var game
var panel: PanelContainer
var column: VBoxContainer
var scroll: ScrollContainer
var scroll_finger := -1
var medic_motion: RazlomActorMotion
var courier_motion: RazlomActorMotion
var attention_timer := 0.0
var attentive: Dictionary = {}

func spawn_shelter(parent: Node3D) -> void:
	var doctor := StaticBody3D.new()
	doctor.name = "Vera"
	doctor.set_meta("use", "vera")
	doctor.set_meta("title", "Вера • поговорить")
	parent.add_child(doctor)
	doctor.position = Vector3(-25.5, 0.25, 24)
	var model: PackedScene = load("res://assets/models/medic.tscn")
	var visual := model.instantiate() as Node3D
	doctor.add_child(visual)
	RazlomArt.dress_actor(visual, true)
	medic_motion = RazlomActorMotion.new(visual)
	var courier := StaticBody3D.new()
	courier.name = "Pavel"
	courier.set_meta("use", "courier")
	courier.set_meta("title", "Павел • поговорить о складе")
	parent.add_child(courier)
	courier.position = Vector3(-10, 0.2, 12)
	var courier_model := RazlomArt.humanoid(courier)
	courier_model.get_node("Weapon").hide()
	courier_motion = RazlomActorMotion.new(courier_model)
	courier_model.rotation.y = PI * 0.5
	var courier_col := CollisionShape3D.new()
	var courier_shape := CapsuleShape3D.new()
	courier_shape.radius = 0.35
	courier_shape.height = 1.8
	courier_col.shape = courier_shape
	courier_col.position.y = 0.9
	courier.add_child(courier_col)
	RazlomArt.sign_text(courier, "ПАВЕЛ / СВЯЗНОЙ", Vector3(0, 2.15, 0), 22)
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
	root.resized.connect(layout_dialog)
	panel.add_theme_stylebox_override("panel", game.panel_style())
	column = VBoxContainer.new()
	column.add_theme_constant_override("separation", 16)
	scroll = ScrollContainer.new()
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	panel.add_child(scroll)
	column.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(column)
	layout_dialog()
	panel.hide()

func handle_touch(event: InputEvent) -> void:
	if not panel.visible:
		return
	if event is InputEventScreenTouch:
		if event.pressed and panel.get_global_rect().has_point(event.position):
			scroll_finger = event.index
		elif not event.pressed and event.index == scroll_finger:
			scroll_finger = -1
	elif event is InputEventScreenDrag and event.index == scroll_finger:
		scroll.scroll_vertical -= int(event.relative.y)
		game.get_viewport().set_input_as_handled()

func layout_dialog() -> void:
	var view: Vector2 = game.get_viewport().get_visible_rect().size
	var width := minf(640, view.x - 24)
	var height := minf(620, view.y - 32)
	panel.offset_left = -width * 0.5
	panel.offset_right = width * 0.5
	panel.offset_top = -height * 0.5
	panel.offset_bottom = height * 0.5

func open(title: String, body: String, choices: Array) -> void:
	if game.ended:
		return
	for child in column.get_children():
		column.remove_child(child)
		child.queue_free()
	var heading: Label = game.ui_label(title, 30)
	heading.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	column.add_child(heading)
	var text: Label = game.ui_label(body, 17)
	text.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	text.custom_minimum_size = Vector2(0, 120)
	column.add_child(text)
	for choice in choices:
		var button := Button.new()
		button.text = choice.text
		button.clip_text = true
		button.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		button.custom_minimum_size.y = 42
		button.pressed.connect(choice.action)
		column.add_child(button)
	scroll.scroll_vertical = 0
	scroll_finger = -1
	game.modal.hide()
	panel.show()
	layout_dialog.call_deferred()
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
		"courier":
			courier_dialog()
		"relay":
			relay_dialog()
		"vera":
			vera_dialog()
		"bed":
			bed_dialog()
		"bench":
			bench_dialog()
	return true

func vera_dialog() -> void:
	medic_motion.greet()
	var body := "«Нужен насос со склада 03, за дорогой. Блок зелёный, с ручкой.\nРада кипятит последнюю бутылку для сына. Верни насос до ночи.\nРаньше эти люди охраняли наши конвои. Теперь не подпускают нас.\nНе лезь под огонь. У дороги сидит Павел, связной конвоя. Он может знать, как пройти без боя. В кладке сбоку есть слабые места»."
	if game.state.complete:
		body = "«Вода пошла. Теперь можно думать о следующем дне.\nПо старой накладной этот груз вообще должен был уйти из долины.\nКому они возят воду, пока мы считаем каждую бутылку?»"
	elif game.state.pump:
		body = "«Нашёл? Давай сюда. Я подключу питание.\nЕсли заработает, к утру будет запас на весь Очаг»."
	if game.state.truth_shared:
		body += "\n\n«Ты решил не прятать накладную. Я скажу людям, что подпись моего брата стоит под приказом. Но подпись ещё не доказывает, что он выбрал это сам»."
	if game.state.complete:
		body += "\n\nНа восток идёт дорога к ретранслятору 12. Там должны храниться записи конвоя. Найди, кто отдавал приказы Илье."
	if game.state.relay_shared:
		body += "\n\n«На записи Илья спорит с диспетчером. Он не бросил нас добровольно. Ищи северный шлюз — туда ушёл последний конвой»."
	var choices: Array = []
	if game.state.relay_log and not game.state.relay_shared:
		choices.append({"text": "Передать Вере запись конвоя", "action": func():
			game.state.relay_shared = true
			game.state.medkits += 1
			game.notify("Вера: «Он пытался вернуться. Северный шлюз — наша следующая зацепка». +1 аптечка")
			game.resume()})
	if game.state.pump and not game.state.complete:
		choices.append({"text": "Отдать насосный блок", "action": func():
			game.resume()
			game.complete_mission()})
	choices.append({"text": "Помоги с ранами • 2 детали", "action": func():
		if game.state.scrap >= 2 and game.state.health < 100:
			game.state.scrap -= 2
			game.state.health = 100
			game.state.pain = 0
			game.state.leg_wound = 0
			medic_motion.greet("treat")
			game.notify("Вера обработала раны")
		else:
			game.notify("Нужны 2 детали, а лечение имеет смысл только при ранении")
		game.resume()})
	choices.append({"text": "Я вернусь", "action": game.resume})
	if game.state.manifest and not game.state.truth_shared:
		choices.append({"text": "Показать накладную с подписью Ильи", "action": reveal_manifest})
	if game.state.manifest:
		choices.append({"text": "Перечитать накладную", "action": read_manifest})
	if game.state.passage:
		body += "\n\n«Павел передал, что ты отдал свою воду. Я не прошу тебя быть героем. Просто вернись живым: нам нужны люди, а не ещё одна история о погибшем»."
	elif game.state.passage_broken:
		body += "\n\n«По рации говорят о сорванном договоре. Я не знаю, что случилось у ворот. Но после нас здесь останутся люди, которым придётся жить рядом. Не забудь об этом»."
	choices.append({"text": "Вера, кем ты была до аварии?", "action": vera_past})
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
	choices.append({"text": "Бросить заряд • отойди после броска", "action": func():
		game.resume()
		game.throw_charge()})
	choices.append({"text": "Журнал / история", "action": journal})
	choices.append({"text": "Закрыть", "action": game.resume})
	open("РЮКЗАК / СОСТОЯНИЕ", body, choices)

func read_manifest() -> void:
	open("НАКЛАДНАЯ № 17", "Склад 03. Насос для Очага был принят девять дней назад.\nМаршрут изменён: Верхний посёлок, закрытая линия.\n«Сектор 07 до отдельного распоряжения не снабжать».\n\nПодпись: И. Лесной. Брат Веры, который, по её словам, погиб во время аварии. На обороте карандашом: «Не отдавайте последний исправный узел. У них тоже дети».\n\nНасос можно вернуть. С накладной придётся решить отдельно.", [
		{"text": "Запомнить и вернуться", "action": game.resume}])

func reveal_manifest() -> void:
	if not game.state.manifest:
		return
	open("ЦЕНА ПРАВДЫ", "Вера долго смотрит на подпись.\n«Илья вытаскивал людей из затопленного тоннеля. Я сама видела его жетон. Если он жив... кто тогда остался там вместо него?»\n\nОна просит дать ей ночь перед разговором с убежищем. Можно согласиться или настоять, чтобы люди узнали сейчас. Насос и награда от решения не зависят.", [
		{"text": "Люди должны знать. Обнародовать приказ", "action": func():
			game.state.truth_shared = true
			game.resume()
			game.notify("Вера согласилась рассказать убежищу. Решение записано в журнале")},
		{"text": "Дать Вере время. Пока сохранить тайну", "action": func():
			game.resume()
			game.notify("Накладная осталась у тебя. К разговору можно вернуться") }])

func journal() -> void:
	var s = game.state
	var body := "ТЁПЛАЯ СТЕНА\nРада отдаёт последнюю чистую воду сыну. Вера просит вернуть насос со склада 03. Охрана склада раньше сопровождала конвои убежища. Павел у дороги предлагает путь через переговоры; вода для него — твой собственный запас.\n\n"
	body += "Насос установлен: у Очага снова есть вода." if s.complete else ("Насос найден. Вернись к Вере." if s.pump else "Задача: найти зелёный насосный блок в дальней части склада и вернуться в убежище.")
	if s.passage_broken:
		body += "\n\nДоговор с Павлом нарушен нападением на охрану. Повторно договориться нельзя."
	if s.passage:
		body += "\n\nПавел договорился о проходе: охрана не атакует, пока ты не нарушишь договор. Его свидетельство: приказ Ильи звучал на фоне аварийной сирены."
	if s.manifest:
		body += "\n\nНАКЛАДНАЯ № 17\nНасос перенаправили намеренно. Под приказом подпись Ильи Лесного, которого Вера считала погибшим."
		body += "\nРешение: приказ обнародован; Вера ищет объяснение подписи." if s.truth_shared else "\nРешение пока открыто: показать документ Вере или сохранить его при себе."
	open("ЖУРНАЛ / ОЧАГ", body, [{"text": "Вернуться в мир", "action": game.resume}])

func diagnostics() -> Dictionary:
	var buttons: Array = []
	for child in column.get_children():
		if child is Button:
			buttons.append({"text": child.text, "rect": [child.global_position.x, child.global_position.y, child.size.x, child.size.y]})
	return {"visible": panel.visible, "rect": [panel.global_position.x, panel.global_position.y, panel.size.x, panel.size.y],
		"title": column.get_child(0).text if column.get_child_count() > 0 else "", "buttons": buttons}

func courier_dialog() -> void:
	courier_motion.greet()
	var body := """Павел прячет перебинтованную руку. На его куртке такой же знак, как у охраны склада.
«Я вёл последний конвой Очага. Приказ задержать насос пришёл с голоса Ильи. Но на фоне работала сирена — может, он говорил под принуждением.
Мои люди не знают, что насос нужен ребёнку. Дай бутылку раненому связному — передам по рации, чтобы тебя пропустили. Только не стреляй. Один удар — и договору конец»."""
	var choices: Array = []
	if not game.state.passage and not game.state.passage_broken:
		choices.append({"text": "Отдать 1 бутылку воды • договориться о проходе", "action": func():
			if game.state.bottles > 0:
				game.state.bottles -= 1
				game.state.passage = true
				game.notify("Павел передал приказ: охрана пропустит. Не нападай на неё")
			else:
				game.notify("В рюкзаке нет бутылки. Воду можно найти в убежище")
			game.resume()})
	else:
		body = "«Слово держим. Забирай насос. И найди накладную — без неё никто не поверит, что приказ был подменён. Если нападёшь на охрану, я больше не смогу тебя прикрыть»."
	if game.state.passage_broken:
		body = "Павел отворачивается: «Я поручился за тебя, а ты напал на моих людей. Второго слова по рации не будет. Насос всё ещё нужен Очагу — но теперь ищи другой путь»."
	choices.append({"text": "Я сам выберу путь", "action": game.resume})
	open("ПАВЕЛ / ПОСЛЕДНИЙ КОНВОЙ", body, choices)

func vera_past() -> void:
	medic_motion.greet()
	open("ВЕРА / ДО РАЗЛОМА", "«Электромехаником на насосной станции. Не врачом. Лечить пришлось научиться позже.\nИлья всегда говорил: сначала проверь питание, потом хорони механизм. С людьми так не получается».\n\nОна поправляет старый пропуск на кармане.\n«Из тоннеля принесли его жетон, не его тело. Я согласилась считать его погибшим, потому что иначе пришлось бы снова идти искать. Поэтому мне и страшна эта подпись».\n\n" + ("Услышав рассказ Павла, она добавляет: «Аварийная сирена работает от отдельной линии. Если он слышал её, станция ещё была под напряжением. Илья мог остаться там не по своей воле»." if game.state.passage else "«Поговори с Павлом у дороги. Он был в последнем конвое. Может, знает больше, чем написал в отчёте»."), [
		{"text": "Вернуться к разговору", "action": vera_dialog},
		{"text": "Пора идти", "action": game.resume}])

func advance_people(delta: float) -> void:
	attention_timer -= delta
	for motion in [medic_motion, courier_motion]:
		if motion == null or not is_instance_valid(motion.model):
			continue
		motion.advance(delta, 0.0)
		var actor: Node3D = motion.model.get_parent()
		if attention_timer <= 0:
			var eye := actor.global_position + Vector3.UP * 1.5
			var target: Vector3 = game.player.global_position + Vector3.UP * 1.3
			var visible := false
			if eye.distance_to(target) < 6.0:
				var query := PhysicsRayQueryParameters3D.create(eye, target, 1 | 2)
				query.exclude = [actor.get_rid()]
				var hit := actor.get_world_3d().direct_space_state.intersect_ray(query)
				visible = not hit.is_empty() and hit.collider == game.player
			attentive[actor.name] = visible
		if attentive.get(actor.name, false):
			var direction: Vector3 = game.player.global_position - actor.global_position
			motion.model.rotation.y = lerp_angle(motion.model.rotation.y, atan2(-direction.x, -direction.z), 1.0 - exp(-delta * 3.0))
	if attention_timer <= 0:
		attention_timer = 0.25

func relay_dialog() -> void:
	if not game.state.complete:
		open("РЕТРАНСЛЯТОР 12", "Резервного питания хватает только на архив. Сначала верни насос: люди ждут воду, а Вера поможет разобраться в записях.", [{"text": "Вернуться к поиску насоса", "action": game.resume}])
		return
	game.state.relay_log = true
	open("02 / ГОЛОС В ЭФИРЕ", "Запись 06:14. Диспетчер: «Конвой уходит к северному шлюзу. Груз не вскрывать».\nИлья: «В Очаге дети. Я оставляю насос, остальное везите сами».\nТреск помех. Другой голос: «Водитель не выбирает маршрут».\n\nЭто не оправдание подписи в накладной, но теперь понятно: Илья спорил с приказом. Верни запись Вере.", [{"text": "Забрать запись и вернуться к Вере", "action": game.resume}])
