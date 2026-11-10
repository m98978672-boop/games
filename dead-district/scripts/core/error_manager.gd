extends Node
## Централизованный реестр и менеджер ошибок DEAD DISTRICT.
## Формат записи: [время][уровень][код][модуль] сообщение {контекст}

enum Level { INFO, WARN, ERROR, FATAL }

signal error_logged(entry: Dictionary)

const MAX_BUFFER_SIZE: int = 500
const LOG_PATH: String = "user://logs/dead_district.log"

## Каталог кодов ошибок (>= 65 кодов по доменам E1xx..E10xx)
const ERROR_CATALOG: Dictionary = {
	# --- E1xx: Ресурсы и ассеты ---
	"E101": {"name": "ASSET_MISSING", "level": Level.ERROR, "cause": "Файл ресурса отсутствует на диске", "fallback": "Подставить процедурную заглушку", "player_msg": "Часть графики заменена резервной текстурой."},
	"E102": {"name": "ASSET_BAD_SIZE", "level": Level.ERROR, "cause": "Разрешение PNG не совпадает с манифестом", "fallback": "Масштабировать nearest без сглаживания", "player_msg": "Обнаружено несоответствие размера спрайта."},
	"E103": {"name": "ASSET_ANTI_ALIAS_ALPHA", "level": Level.WARN, "cause": "Полупрозрачные края AA в пиксель-арте", "fallback": "Отсечь альфу по порогу 0.5", "player_msg": ""},
	"E104": {"name": "ASSET_OFF_PALETTE", "level": Level.WARN, "cause": "Цвета вне 32-цветной палитры Survival Horror 32", "fallback": "Применить шейдер квантования палитры", "player_msg": ""},
	"E105": {"name": "MESH_GLB_INVALID", "level": Level.ERROR, "cause": "Невалидный GLB или превышен лимит полигонов", "fallback": "Заменить низкополигональным кубом", "player_msg": "Модель объекта временно упрощена."},
	"E106": {"name": "AUDIO_FONT_SHADER_INVALID", "level": Level.ERROR, "cause": "Битый WAV/TTF/Shader ресурс", "fallback": "Отключить эффект и переключиться на стандарт", "player_msg": "Звук или шейдер отключён из-за ошибки."},
	"E107": {"name": "ASSET_LICENSE_REJECTED", "level": Level.FATAL, "cause": "Недопустимая или проприетарная лицензия ассета", "fallback": "Заблокировать загрузку ассета", "player_msg": "Ассет заблокирован проверкой лицензий."},
	"E108": {"name": "ASSET_BAD_NAMING", "level": Level.WARN, "cause": "Имя файла нарушает snake_case соглашение", "fallback": "Продолжить с предупреждением", "player_msg": ""},
	"E109": {"name": "VRAM_ATLAS_OVERFLOW", "level": Level.WARN, "cause": "Превышен бюджет видеопамяти чанка", "fallback": "Выгрузить дальние 3D модели", "player_msg": ""},
	"E110": {"name": "SHADER_COMPILE_FAIL", "level": Level.ERROR, "cause": "Ошибка компиляции .gdshader", "fallback": "Снять материал с ViewportContainer", "player_msg": "Постобработка отключена для совместимости."},

	# --- E2xx: Сохранения и миграции ---
	"E201": {"name": "SAVE_FILE_MISSING", "level": Level.INFO, "cause": "Слот сохранения ещё не создан", "fallback": "Создать новую игру", "player_msg": "Начинается новое выживание."},
	"E202": {"name": "SAVE_JSON_CORRUPT", "level": Level.ERROR, "cause": "Повреждённый JSON в файле сохранения", "fallback": "Загрузить резервную копию .bak", "player_msg": "Основной сейв повреждён, восстановлена копия."},
	"E203": {"name": "SAVE_VERSION_UNSUPPORTED", "level": Level.ERROR, "cause": "Неизвестная версия формата сохранения", "fallback": "Отклонить загрузку, сохранить .bak", "player_msg": "Версия сохранения не поддерживается."},
	"E204": {"name": "SAVE_MIGRATION_FAILED", "level": Level.ERROR, "cause": "Сбой пошаговой миграции v1->v2->v3", "fallback": "Заполнить отсутствующие поля значениями по умолчанию", "player_msg": "Часть устаревших параметров сброшена."},
	"E205": {"name": "SAVE_BACKUP_RESTORE_FAIL", "level": Level.FATAL, "cause": "И основной сейв, и .bak нечитаемы", "fallback": "Сбросить в безопасный старт мира", "player_msg": "Не удалось загрузить сохранение."},
	"E206": {"name": "SAVE_IO_WRITE_DENIED", "level": Level.ERROR, "cause": "Нет прав записи в user://saves", "fallback": "Хранить снимок в ОЗУ до выхода", "player_msg": "Ошибка записи файла сохранения на диск."},
	"E207": {"name": "SAVE_CHECKSUM_MISMATCH", "level": Level.WARN, "cause": "Контрольная сумма SHA-256 не совпала", "fallback": "Предупредить и проверить поля вручную", "player_msg": "Файл сохранения был изменён вне игры."},
	"E208": {"name": "CHUNK_DELTA_CORRUPT", "level": Level.WARN, "cause": "Сломана дельта изменений чанка", "fallback": "Перегенерировать чанк по world_seed", "player_msg": ""},

	# --- E3xx: Процедурный мир и чанки ---
	"E301": {"name": "CHUNK_OOB", "level": Level.WARN, "cause": "Запрос координат вне активного диапазона", "fallback": "Зажать в границах карты", "player_msg": ""},
	"E302": {"name": "CHUNK_THREAD_TIMEOUT", "level": Level.WARN, "cause": "Поток генерации чанка задержался >50мс", "fallback": "Достроить чанк в следующем кадре", "player_msg": ""},
	"E303": {"name": "BSP_SPLIT_DEGENERATE", "level": Level.INFO, "cause": "Здание слишком мало для деления BSP", "fallback": "Оставить единым помещением", "player_msg": ""},
	"E304": {"name": "VORONOI_DISTRICT_FALLBACK", "level": Level.WARN, "cause": "Пустой список центров Вороного", "fallback": "Считать район пригородом", "player_msg": ""},
	"E305": {"name": "LSYSTEM_ROAD_DISJOINT", "level": Level.WARN, "cause": "Дорожная сеть L-системы не связна", "fallback": "Проложить соединяющую грунтовку", "player_msg": ""},
	"E306": {"name": "NAVGRID_TILE_INVALID", "level": Level.WARN, "cause": "Обращение к несуществующему тайлу сетки", "fallback": "Вернуть непроходимость", "player_msg": ""},
	"E307": {"name": "PROP_SPAWN_OVERLAP", "level": Level.INFO, "cause": "Конфликт 3D мебели со стеной", "fallback": "Пропустить проблемный проп", "player_msg": ""},
	"E308": {"name": "CHUNK_UNLOAD_ACTIVE_REF", "level": Level.WARN, "cause": "Выгрузка чанка с активным игроком", "fallback": "Отменить выгрузку текущего чанка", "player_msg": ""},

	# --- E4xx: ИИ, поиск пути и Spawn Director ---
	"E401": {"name": "ASTAR_ITER_LIMIT", "level": Level.WARN, "cause": "Превышен лимит шагов A*", "fallback": "Вернуть ближайший частичный путь", "player_msg": ""},
	"E402": {"name": "FLOWFIELD_UNREACHABLE", "level": Level.INFO, "cause": "Цель полностью забаррикадирована", "fallback": "Атаковать ближайшую дверь/баррикаду", "player_msg": ""},
	"E403": {"name": "ZOMBIE_INVALID_STATE", "level": Level.ERROR, "cause": "Недопустимый переход FSM зомби", "fallback": "Сбросить состояние в IDLE", "player_msg": ""},
	"E404": {"name": "ZOMBIE_WORLD_CAP", "level": Level.WARN, "cause": "Достигнут лимит пула зомби в мире", "fallback": "Отложить спавн до выгрузки дальних", "player_msg": ""},
	"E405": {"name": "ZOMBIE_ACTIVE_LOD_CAP", "level": Level.INFO, "cause": "Превышено 150 одновременно активных зомби", "fallback": "Перевести дальних в LOD-спящий режим", "player_msg": ""},
	"E406": {"name": "NPC_UTILITY_NAN", "level": Level.ERROR, "cause": "NaN в оценке полезности Utility AI", "fallback": "Сбросить действие NPC на IDLE_PATROL", "player_msg": ""},
	"E407": {"name": "NPC_TRADE_EMPTY", "level": Level.INFO, "cause": "У торговца закончились предметы", "fallback": "Закрыть окно сделки с сообщением", "player_msg": "У выжившего нет товаров на обмен."},
	"E408": {"name": "SPAWN_DIRECTOR_STARVED", "level": Level.INFO, "cause": "Не найдена безопасная клетка спавна вне FOV", "fallback": "Повторить попытку на следующем тике", "player_msg": ""},

	# --- E5xx: Здоровье и потребности игрока ---
	"E501": {"name": "ITEM_CONSUME_UNKNOWN", "level": Level.ERROR, "cause": "Попытка применить неизвестный item_id", "fallback": "Игнорировать действие", "player_msg": "Неизвестный предмет."},
	"E502": {"name": "REALDATA_CALORIE_MISS", "level": Level.WARN, "cause": "Отсутствует запись калорий в DataDB", "fallback": "Использовать базовое значение 10 у.е.", "player_msg": ""},
	"E503": {"name": "PLAYER_HYPOTHERMIA_CRIT", "level": Level.WARN, "cause": "Температура тела упала ниже 35.0°C", "fallback": "Запустить дрожь и потерю HP", "player_msg": "Вы замерзаете! Найдите укрытие или костёр."},
	"E504": {"name": "PLAYER_HYPERTHERMIA_CRIT", "level": Level.WARN, "cause": "Перегрев тела выше 39.0°C", "fallback": "Ускорить потерю воды и усталость", "player_msg": "Тепловой удар! Срочно охладитесь и попейте."},
	"E505": {"name": "PLAYER_FATAL_BLOODLOSS", "level": Level.FATAL, "cause": "Потеряно более 40% объёма крови", "fallback": "Перейти на экран смерти персонажа", "player_msg": "Вы погибли от критической кровопотери."},
	"E506": {"name": "PLAYER_FRACTURE_SPRINT_LOCK", "level": Level.INFO, "cause": "Попытка спринта со сломанной ногой", "fallback": "Ограничить скорость до 45%", "player_msg": "С переломом ноги бег невозможен."},
	"E507": {"name": "PLAYER_ZOMBIFICATION", "level": Level.FATAL, "cause": "Неизлечимая инфекция укуса достигла 100%", "fallback": "Обратить игрока и завершить забег", "player_msg": "Инфекция взяла верх. Вы погибли."},

	# --- E6xx: Инвентарь, крафт, стройка, лут ---
	"E601": {"name": "INVENTORY_OVERWEIGHT", "level": Level.INFO, "cause": "Превышен максимальный переносимый вес", "fallback": "Замедлить передвижение, запретить подбор", "player_msg": "Слишком тяжело! Освободите рюкзак."},
	"E602": {"name": "CONTAINER_FULL", "level": Level.INFO, "cause": "Контейнер не вмещает предмет", "fallback": "Оставить предмет в источнике", "player_msg": "В контейнере нет места."},
	"E603": {"name": "RECIPE_UNKNOWN", "level": Level.ERROR, "cause": "Запрошен несуществующий рецепт крафта", "fallback": "Отменить крафт", "player_msg": "Рецепт не найден."},
	"E604": {"name": "RECIPE_MISSING_STATION", "level": Level.INFO, "cause": "Нет верстака или огня для готовки/крафта", "fallback": "Отклонить запуск крафта", "player_msg": "Нужен верстак или источник тепла."},
	"E605": {"name": "BUILD_TILE_BLOCKED", "level": Level.INFO, "cause": "Клетка постройки занята стеной/объектом", "fallback": "Подсветить красным и запретить постройку", "player_msg": "Здесь нельзя строить."},
	"E606": {"name": "LOOT_WEIGHT_ZERO", "level": Level.ERROR, "cause": "Таблица лута имеет нулевую сумму весов", "fallback": "Выдать базовую консерву", "player_msg": ""},
	"E607": {"name": "SPOILAGE_CLOCK_SKEW", "level": Level.WARN, "cause": "Отрицательный расчёт свежести продукта", "fallback": "Зажать свежесть в [0.0, 1.0]", "player_msg": ""},

	# --- E7xx: Транспорт и коммуникации ---
	"E701": {"name": "VEHICLE_NO_FUEL", "level": Level.INFO, "cause": "Топливный бак автомобиля пуст", "fallback": "Заглушить двигатель", "player_msg": "Бак пуст! Заправьте машину канистрой."},
	"E702": {"name": "VEHICLE_ENGINE_BROKEN", "level": Level.WARN, "cause": "Состояние двигателя упало до 0%", "fallback": "Остановить авто, требовать ремонт", "player_msg": "Двигатель заглох. Нужен ключ и запчасти."},
	"E703": {"name": "FLASHLIGHT_NO_BATTERY", "level": Level.INFO, "cause": "Заряд батареи фонаря исчерпан", "fallback": "Выключить свет фонаря", "player_msg": "Села батарейка в фонарике."},
	"E704": {"name": "GRID_ELECTRICITY_SHUTOFF", "level": Level.INFO, "cause": "Городская электросеть отключилась", "fallback": "Обесточить дома без генератора", "player_msg": "Электричество в районе отключено!"},
	"E705": {"name": "GRID_WATER_SHUTOFF", "level": Level.INFO, "cause": "Водопровод отключился", "fallback": "Перевести краны на остаточный резерв", "player_msg": "Водоснабжение прекращено!"},
	"E706": {"name": "GENERATOR_INDOOR_CO", "level": Level.WARN, "cause": "Генератор запущен в закрытом помещении", "fallback": "Наносить урон угарным газом", "player_msg": "ОПАСНО: угарный газ от генератора внутри дома!"},

	# --- E8xx: Рендер, SubViewport и звук ---
	"E801": {"name": "SUBVIEWPORT_RESIZE_CLAMP", "level": Level.WARN, "cause": "Нарушено кратное разрешение 480x270", "fallback": "Вернуть размер SubViewport (480, 270)", "player_msg": ""},
	"E802": {"name": "FOV_RADIUS_CLAMPED", "level": Level.WARN, "cause": "Радиус Shadowcasting <= 0", "fallback": "Установить радиус 12 тайлов", "player_msg": ""},
	"E803": {"name": "AUDIO_CHANNEL_SATURATED", "level": Level.INFO, "cause": "Заняты все аудио-каналы SFX", "fallback": "Перезаписать самый тихий звук", "player_msg": ""},
	"E804": {"name": "NOISE_INVALID_DB", "level": Level.WARN, "cause": "Отрицательный или NaN уровень дБ", "fallback": "Игнорировать звуковой импульс", "player_msg": ""},
	"E805": {"name": "SPATIAL_QUERY_EMPTY", "level": Level.INFO, "cause": "Нулевой или отрицательный радиус поиска", "fallback": "Вернуть пустой массив", "player_msg": ""},

	# --- E9xx: UI и ввод ---
	"E901": {"name": "HUD_NODE_MISSING", "level": Level.ERROR, "cause": "Не найден узел интерфейса", "fallback": "Работать через безопасную проверку null", "player_msg": ""},
	"E902": {"name": "UI_MODAL_STACK_DESYNC", "level": Level.WARN, "cause": "Открыто несколько конфликтующих окон", "fallback": "Закрыть предыдущее окно перед открытием", "player_msg": ""},
	"E903": {"name": "MAP_ZOOM_OUT_OF_RANGE", "level": Level.INFO, "cause": "Масштаб карты вне [0.25, 4.0]", "fallback": "Зажать в допустимом диапазоне", "player_msg": ""},
	"E904": {"name": "DIALOGUE_KEY_MISSING", "level": Level.WARN, "cause": "Нет реплики в npcs.json", "fallback": "Вывести нейтральную фразу", "player_msg": ""},
	"E905": {"name": "INPUT_ACTION_UNBOUND", "level": Level.WARN, "cause": "Действие не найдено в InputMap", "fallback": "Пропустить опрос действия", "player_msg": ""},

	# --- E10xx: Источники данных, лицензии и QA боты ---
	"E1001": {"name": "SOURCE_URL_INVALID", "level": Level.FATAL, "cause": "Недопустимый/вымышленный URL или отсутствует в SOURCES.md", "fallback": "Отклонить запись источника", "player_msg": "Ошибка проверки открытых источников (E1001)."},
	"E1002": {"name": "SOURCE_LICENSE_MISSING", "level": Level.FATAL, "cause": "Не указана лицензия или нет атрибуции в CREDITS.md", "fallback": "Отклонить ассет/запись", "player_msg": "Ошибка проверки лицензий (E1002)."},
	"E1003": {"name": "SOURCE_ACCESS_DATE_MISSING", "level": Level.ERROR, "cause": "В SOURCES.md отсутствует дата доступа", "fallback": "Зафиксировать сбой в отчёте SourceBot", "player_msg": ""},
	"E1004": {"name": "SOURCE_UNMARKED_ESTIMATE", "level": Level.ERROR, "cause": "Запись LOW/без данных не имеет пометки [ОЦЕНКА]", "fallback": "Добавить пометку ошибки в SourceBot", "player_msg": ""},
	"E1005": {"name": "REALDATA_REF_BROKEN", "level": Level.ERROR, "cause": "Несоответствие real_ref между items.json и data/real/", "fallback": "Использовать дефолтный вес/калорийность", "player_msg": ""},
	"E1006": {"name": "QABOT_PLAYER_FAIL", "level": Level.ERROR, "cause": "PlayerBot не прошёл сценарную проверку", "fallback": "Сохранить трассировку в qa_report.json", "player_msg": ""},
	"E1007": {"name": "QABOT_STRESS_FPS_DROP", "level": Level.WARN, "cause": "Превышен порог кадра при 150 активных / 1000 зомби", "fallback": "Снизить частоту тиков дальних ИИ", "player_msg": ""},
	"E1008": {"name": "QABOT_FUZZ_INVARIANT", "level": Level.ERROR, "cause": "FuzzBot нарушил инвариант (NaN/отрицательный вес/вылет)", "fallback": "Откатить операцию", "player_msg": ""}
}

var _logs: Array[Dictionary] = []
var _last_player_msg: String = ""
var _enable_disk_log: bool = true


func _ready() -> void:
	if _enable_disk_log:
		DirAccess.make_dir_recursive_absolute("user://logs")


func set_disk_logging(enabled: bool) -> void:
	_enable_disk_log = enabled


func get_catalog_size() -> int:
	return ERROR_CATALOG.size()


func level_to_str(lvl: int) -> String:
	match lvl:
		Level.INFO:
			return "INFO"
		Level.WARN:
			return "WARN"
		Level.ERROR:
			return "ERROR"
		Level.FATAL:
			return "FATAL"
	return "UNKNOWN"


func report(code: String, module_name: String, message: String, context: Dictionary = {}, override_level: int = -1) -> Dictionary:
	var meta: Dictionary = ERROR_CATALOG.get(code, {
		"name": "UNKNOWN_CODE",
		"level": Level.ERROR,
		"cause": "Незарегистрированный код ошибки",
		"fallback": "Безопасное продолжение",
		"player_msg": "Произошла внутренняя ошибка."
	})
	var lvl: int = override_level if override_level >= 0 else int(meta["level"])
	var lvl_str: String = level_to_str(lvl)
	var time_str: String = Time.get_datetime_string_from_system(true)
	var ctx_str: String = JSON.stringify(context)
	var formatted: String = "[%s][%s][%s][%s] %s %s" % [time_str, lvl_str, code, module_name, message, ctx_str]

	var entry: Dictionary = {
		"time": time_str,
		"level": lvl,
		"level_str": lvl_str,
		"code": code,
		"name": String(meta["name"]),
		"module": module_name,
		"message": message,
		"context": context,
		"fallback": String(meta["fallback"]),
		"player_msg": String(meta["player_msg"]),
		"formatted": formatted
	}

	_logs.append(entry)
	if _logs.size() > MAX_BUFFER_SIZE:
		_logs.pop_front()

	if String(meta["player_msg"]) != "":
		_last_player_msg = String(meta["player_msg"])

	if lvl >= Level.ERROR:
		push_error(formatted)
	elif lvl == Level.WARN:
		push_warning(formatted)

	if _enable_disk_log:
		_append_to_file(formatted)

	error_logged.emit(entry)
	return entry


func info(code: String, module_name: String, message: String, context: Dictionary = {}) -> Dictionary:
	return report(code, module_name, message, context, Level.INFO)


func warn(code: String, module_name: String, message: String, context: Dictionary = {}) -> Dictionary:
	return report(code, module_name, message, context, Level.WARN)


func error(code: String, module_name: String, message: String, context: Dictionary = {}) -> Dictionary:
	return report(code, module_name, message, context, Level.ERROR)


func fatal(code: String, module_name: String, message: String, context: Dictionary = {}) -> Dictionary:
	return report(code, module_name, message, context, Level.FATAL)


func get_logs(min_level: int = Level.INFO) -> Array[Dictionary]:
	var out: Array[Dictionary] = []
	for e in _logs:
		if int(e["level"]) >= min_level:
			out.append(e)
	return out


func get_last_player_message() -> String:
	return _last_player_msg


func clear_logs() -> void:
	_logs.clear()
	_last_player_msg = ""


func _append_to_file(line: String) -> void:
	var f: FileAccess = null
	if FileAccess.file_exists(LOG_PATH):
		f = FileAccess.open(LOG_PATH, FileAccess.READ_WRITE)
		if f != null:
			f.seek_end()
	else:
		f = FileAccess.open(LOG_PATH, FileAccess.WRITE)
	if f != null:
		f.store_line(line)
		f.close()
