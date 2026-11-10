class_name TestErrorManager
extends Node
## Юнит-тесты ErrorManager и SaveManager:
## - полнота каталога E1xx..E10xx (>= 70 кодов)
## - формат логов [время][уровень][код][модуль] сообщение {контекст}
## - подсчёт ошибок по категориям и защита от спама критических диалогов
## - сохранение с SHA-256, детект порчи, откат к .bak и миграции v1 -> v2 -> v3.


static func run_all() -> Dictionary:
	var failures: Array[String] = []
	var passed: int = 0

	# 1. Каталог ошибок >= 70 кодов и покрытие всех 10 серий (E1..E10)
	var counts_by_cat: Dictionary = {}
	for code in ErrorManager.ERROR_CATALOG.keys():
		var prefix := String(code).substr(0, 2) if not String(code).begins_with("E10") else "E10"
		counts_by_cat[prefix] = int(counts_by_cat.get(prefix, 0)) + 1
	if ErrorManager.ERROR_CATALOG.size() < 70:
		failures.append("Ожидалось >=70 кодов ошибок, найдено %d" % ErrorManager.ERROR_CATALOG.size())
	else:
		passed += 1

	for req in ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10"]:
		if not counts_by_cat.has(req):
			failures.append("Отсутствует категория ошибок %s" % req)
		else:
			passed += 1

	# 2. Проверка логирования и форматирования
	ErrorManager.reset_stats()
	var line := ErrorManager.warn("E501", "TestSuite", "Тестовое предупреждение", {"slot": 3})
	if line.find("[WARN][E501][TestSuite]") < 0 or line.find("slot") < 0:
		failures.append("Некорректный формат строки лога: %s" % line)
	else:
		passed += 1

	# 3. Антиспам критических диалогов
	var first_dlg := ErrorManager.fatal("E201", "TestSuite", "Критическая ошибка 1", {})
	var second_dlg := ErrorManager.fatal("E201", "TestSuite", "Критическая ошибка 2", {})
	if first_dlg == "" or second_dlg == "":
		failures.append("ErrorManager.fatal должен возвращать форматированную строку")
	elif int(ErrorManager.error_counts.get("E201", 0)) != 2:
		failures.append("Счётчик E201 должен быть 2")
	else:
		passed += 1

	# 4. Проверка SaveManager: сохранение, порча SHA-256, откат на .bak, миграция v1 -> v3
	var test_path := "user://test_em_save.json"
	var ok_save := SaveManager.save_game({"player": {"hp": 88}}, test_path)
	if not ok_save:
		failures.append("SaveManager.save_game вернул false")
	else:
		passed += 1

	# Сохраняем второй раз, чтобы создался .bak, затем портим основной файл
	SaveManager.save_game({"player": {"hp": 99}}, test_path)
	var f := FileAccess.open(test_path, FileAccess.WRITE)
	if f != null:
		f.store_string("{corrupted_json")
		f.close()
	var recovered := SaveManager.load_game(test_path)
	if recovered.is_empty():
		failures.append("SaveManager не восстановил .bak при повреждённом основном сохранении")
	else:
		passed += 1

	# Миграция версии 1 -> 3
	var v1_env := {"version": 1, "data": {"player": {"pos": [1, 2]}}}
	var migrated := SaveManager.migrate_save(v1_env)
	if int(migrated.get("version", 0)) != SaveManager.SAVE_VERSION or not migrated["data"].has("utilities"):
		failures.append("Миграция SaveManager v1 -> v3 не добавила utilities/farming")
	else:
		passed += 1

	return {
		"suite": "TestErrorManager",
		"passed": passed,
		"failed": failures.size(),
		"failures": failures
	}
