class_name RazlomQuests
extends RefCounted
## Authored quest state machines; no randomly generated filler or repeated rewards.
const LIMITS := {"medicine": 3, "engineer": 3, "power": 3, "survey": 5, "gate": 4}
const TITLES := {"medicine": "Последний перевязочный", "engineer": "Чужая смена", "power": "Мёртвый ток", "survey": "Три тихие точки", "gate": "Приказ без подписи"}
var game
var scan_time := 0.0
var scan_origin := Vector3.ZERO
var scan_stage := 0
var scan_health := 0.0

static func valid(data: Variant) -> bool:
	if not data is Dictionary or data.size() > LIMITS.size():
		return false
	for id in data:
		if not LIMITS.has(id):
			return false
		var n: Variant = data[id]
		if not (n is int or n is float) or not is_finite(float(n)) or n != floor(float(n)) or n < 0 or n > LIMITS[id]:
			return false
	return true

func phase(id: String) -> int:
	return int(game.state.quests.get(id, 0))
func set_phase(id: String, value: int) -> void:
	game.state.quests[id] = value
func finish_dialog(title: String, body: String) -> void:
	game.interactions.open(title, body, [{"text": "Продолжить вылазку", "action": game.resume}])
func board() -> void:
	var choices: Array = []
	for id in LIMITS:
		var key: String = id
		choices.append({"text": str(TITLES[id]) + " • " + status(id), "action": func(): offer(key)})
	choices.append({"text": "Следить за основной историей", "action": func():
		game.state.tracked_quest = ""
		game.resume()})
	choices.append({"text": "Закрыть журнал заданий", "action": game.resume})
	game.interactions.open("ВЫЛАЗКИ / ОЧАГ", "Здесь нет бесконечных поручений. Каждое дело меняет запас Очага или открывает следующую зацепку. Выбери дело, чтобы узнать цель и награду.", choices)
func status(id: String) -> String:
	var n := phase(id)
	if n == 0:
		return "не начато"
	if (id == "medicine" or id == "power") and n == 3 or id == "engineer" and n >= 2 or id == "survey" and n == 5 or id == "gate" and n >= 3:
		return "завершено"
	return "в работе"
func offer(id: String) -> void:
	if (id == "medicine" and phase(id) == 2 or id == "survey" and phase(id) == 4 or id == "gate" and phase(id) == 2) and not game.is_sheltered(game.player.global_position):
		finish_dialog(str(TITLES[id]), "Для передачи находок и окончательного решения вернись в Очаг. Журнал в дороге только показывает поручение.")
		return
	match id:
		"medicine":
			if phase(id) == 2:
				set_phase(id, 3)
				game.state.medkits += 2
				finish_dialog(TITLES[id], "Вера проверяет пломбу: «Антибиотики целы. Теперь Рада сможет спать, а я — перестать выбирать, кому оставить бинт». +2 аптечки. Медицинский ящик передан Очагу.")
				return
			accept(id, "Вера: «Западный медпункт бросили впопыхах. Найди запечатанный ящик в белом шкафу у старой остановки и принеси сюда. Не вскрывай его в дороге».\nЦель: западный медпункт, −38 / −12. Награда: 2 аптечки.")
		"engineer":
			accept(id, "За западной остановкой остался раненый электрик Семён. Узнай, жив ли он. Вера предупреждает: на месте решать тебе — потратить свою аптечку или забрать его припасы.\nЦель: западная остановка, −42 / −5. Помощь откроет обход аварийной линии.")
		"power":
			if not game.state.relay_shared:
				finish_dialog(TITLES[id], "Сначала передай Вере запись ретранслятора. Без схемы из архива никто не знает, какую линию можно включать.")
				return
			accept(id, "На записи конвоя слышен привод северного шлюза. Его можно запитать от западной подстанции. Найди плавкую вставку в инструментальном ящике −51 / −31, затем установи её на щите −43 / −43. Семён может подсказать обход без вставки.\nНаграда: 18 патронов и доступ к архиву шлюза.")
		"survey":
			if phase(id) == 4:
				set_phase(id, 5)
				game.state.scrap += 5
				finish_dialog(TITLES[id], "Три измерения совпали: гул идёт по закопанному кабелю, не из домов. Павел отмечает безопасную тропу на своей карте. +5 деталей. Повторные измерения больше не нужны.")
				return
			accept(id, "Павел просит проверить три точки старой линии: −32 / −38, −55 / −39 и −57 / −18. У каждой встань рядом с прибором и начни трёхсекундный замер. Движение и ранение прервут работу. Вернись с результатами к доске Очага.\nНаграда: 5 деталей.")
		"gate":
			if phase("power") != 3:
				finish_dialog(TITLES[id], "Привод шлюза и архив обесточены. Сначала заверши «Мёртвый ток».")
				return
			if phase(id) == 2:
				game.interactions.open(TITLES[id], "На ленте голос диспетчера: «Илью задержать. Насос оставить как приманку для тех, кто вернётся». Список содержит имена информаторов Очага. Обнародование предупредит людей, но выдаст источники Павла. Он просит сохранить имена в тайне.\nОба решения окончательны.", [
					{"text": "Обнародовать приказ • припасы для Очага", "action": func(): resolve_gate(3)},
					{"text": "Передать ленту Павлу • скрыть имена источников", "action": func(): resolve_gate(4)},
					{"text": "Решить позже", "action": game.resume}])
				return
			accept(id, "Северный шлюз снова под напряжением. Найди регистратор в будке −12 / −60 и вернись к доске Очага. В архиве должен быть исходный приказ об Илье.\nВыбор награды и последствий — после чтения.")
func accept(id: String, body: String) -> void:
	if status(id) == "завершено":
		finish_dialog(TITLES[id], outcome(id))
		return
	var choices: Array = []
	if phase(id) == 0:
		choices.append({"text": "Взяться за дело", "action": func():
			set_phase(id, 1)
			game.state.tracked_quest = id
			game.notify("Новое дело: " + str(TITLES[id]))
			game.resume()})
	if phase(id) > 0:
		choices.append({"text": "Следить за целью • расстояние и направление", "action": func():
			game.state.tracked_quest = id
			game.resume()})
	choices.append({"text": "Вернуться к списку дел", "action": board})
	game.interactions.open(str(TITLES[id]), body + "\n\n" + objective(id), choices)
func resolve_gate(choice: int) -> void:
	if phase("gate") != 2 or choice not in [3, 4]:
		return
	set_phase("gate", choice)
	if choice == 3:
		game.state.food += 2
		game.state.bottles += 2
	else:
		game.state.reserve += 36
	finish_dialog("ПРИКАЗ БЕЗ ПОДПИСИ", outcome("gate"))
func outcome(id: String) -> String:
	if id == "gate":
		return "Приказ прозвучал по громкой связи. Жители принесли еду и воду: +2/+2. Павел больше не называет источников. Илью увезли за северную границу — путь туда пока закрыт." if phase(id) == 3 else "Павел сжигает лист с именами, сохранив голосовую дорожку. +36 патронов из его тайника. Вера знает, что Илья жив, но жители пока не слышали доказательств. Дальнейший путь за границу ещё не построен."
	if id == "engineer":
		return "Семён выжил и рассказал, как обойти аварийный предохранитель. Он помнит твою помощь." if phase(id) == 2 else "Ты забрал у раненого патроны. Семён отказался говорить. Для подстанции придётся искать вставку."
	return "Дело завершено. Награда уже выдана; повторного получения нет."
func objective(id: String) -> String:
	var n := phase(id)
	if status(id) == "завершено":
		return outcome(id)
	match id:
		"medicine": return "Принести ящик Вере / к доске Очага" if n == 2 else "Запечатанный ящик • −38 / −12"
		"engineer": return "Проверить Семёна • −42 / −5"
		"power": return "Установить вставку • −43 / −43" if n == 2 else "Найти вставку • −51 / −31; либо помочь Семёну"
		"survey": return "Вернуться к доске Очага" if n == 4 else "Точка %d из 3 • замер 3 секунды" % maxi(1, n)
		"gate": return "Решить судьбу записи у доски Очага" if n == 2 else "Прочитать регистратор шлюза • −12 / −60"
	return ""
func journal_text() -> String:
	var text := "\n\nДЕЛА РУБЕЖА"
	for id in LIMITS:
		text += "\n\n" + str(TITLES[id]) + " / " + status(id) + "\n" + objective(id)
	return text
func use_station(id: String) -> void:
	match id:
		"medicine":
			if phase(id) == 1:
				set_phase(id, 2)
				game.notify("Запечатанный ящик взят. Вернись к Вере или доске Очага")
			else: finish_dialog(TITLES[id], "Шкаф заперт. Возьми поручение Веры на доске Очага; уже забранный ящик здесь не появляется снова.")
		"engineer":
			if phase(id) != 1:
				finish_dialog("СЕМЁН", outcome(id) if phase(id) >= 2 else "Раненый просит позвать Веру. О его пропаже есть запись на доске Очага.")
				return
			game.interactions.open("СЕМЁН / ЧУЖАЯ СМЕНА", "«Мы не охрана. Нас послали чинить линию, а потом закрыли проход. Дай перевязаться — покажу, как оживить подстанцию без запасной вставки».", [
				{"text": "Потратить аптечку и помочь", "action": func():
					if phase(id) == 1 and game.state.medkits > 0:
						game.state.medkits -= 1
						set_phase(id, 2)
						game.state.food += 1
						finish_dialog("СЕМЁН", outcome(id) + " +1 консервы.")
					else: game.notify("Нужна аптечка")},
				{"text": "Забрать патроны и уйти", "action": func():
					if phase(id) == 1:
						set_phase(id, 3)
						game.state.reserve += 18
					finish_dialog("СЕМЁН", outcome(id))},
				{"text": "Уйти, не решая", "action": game.resume}])
		"fuse":
			if phase("power") == 1:
				set_phase("power", 2)
				game.notify("Вставка найдена • установи её в западной подстанции")
		"switch":
			if phase("power") == 2 or phase("power") == 1 and phase("engineer") == 2:
				set_phase("power", 3)
				game.state.reserve += 18
				game.noise(game.player.global_position, 25)
				finish_dialog("МЁРТВЫЙ ТОК", "Привод загудел. Илья оставил перемычку на резервной линии — он хотел, чтобы кто-нибудь вернулся. +18 патронов. Архив северного шлюза доступен: возьми следующее дело на доске Очага.")
			else: finish_dialog("ЩИТ ПОДСТАНЦИИ", "Нужна вставка или схема Семёна. Завершённая линия уже включена.")
		"gate":
			if phase(id) == 1 and phase("power") == 3:
				set_phase(id, 2)
				finish_dialog("РЕГИСТРАТОР ШЛЮЗА", "«Илью задержать. Насос оставить как приманку».\nВ ленте перечислены имена людей из Очага. Вернись к доске: решить, что делать с записью, нужно до выхода в общий эфир.")
			else: finish_dialog("СЕВЕРНЫЙ ШЛЮЗ", "Архив требует питания и поручения «Приказ без подписи». Сам проход за долину пока завален.")
		_:
			if id.begins_with("survey_"):
				var number := int(id.trim_prefix("survey_"))
				if phase("survey") == number and scan_time <= 0:
					scan_stage = number
					scan_origin = game.player.global_position
					scan_health = game.state.health
					scan_time = 3.0
					game.notify("Замер 3 секунды • не двигайся")
				else: game.notify("Замеры выполняются по порядку • смотри журнал")
func advance(delta: float) -> void:
	if scan_time <= 0:
		return
	if game.player.global_position.distance_to(scan_origin) > 0.7 or game.state.health < scan_health:
		scan_time = 0
		game.notify("Замер сорван движением или ранением")
		return
	scan_time = maxf(0, scan_time - delta)
	game.notify("ЗАМЕР • %.1f с" % scan_time)
	if scan_time == 0 and phase("survey") == scan_stage:
		set_phase("survey", scan_stage + 1)
		game.notify("Замер сохранён • " + objective("survey"))

func tracking() -> Dictionary:
	var id: String = game.state.tracked_quest
	if not LIMITS.has(id) or phase(id) == 0 or status(id) == "завершено":
		return {}
	var target := Vector3(-21, 0, 24)
	match id:
		"medicine":
			if phase(id) == 1: target = Vector3(-38, 0, -12)
		"engineer": target = Vector3(-42, 0, -5)
		"power":
			target = Vector3(-43, 0, -43) if phase(id) == 2 or phase("engineer") == 2 else Vector3(-51, 0, -31)
		"survey":
			if phase(id) < 4:
				target = [Vector3(-32, 0, -38), Vector3(-55, 0, -39), Vector3(-57, 0, -18)][phase(id) - 1]
		"gate":
			if phase(id) == 1: target = Vector3(-12, 0, -60)
	return {"title": TITLES[id], "target": target}
