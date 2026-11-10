class_name PlayerNeeds
extends Node
## Система потребностей персонажа: голод, жажда, усталость, температура тела, стресс, скука и выносливость.
## Все физиологические константы читаются из DataDB (/data/real/medical.json и /data/real/climate.json).

var hunger: float = 85.0      # 100 = сыт, 0 = истощение
var thirst: float = 85.0      # 100 = гидратирован, 0 = обезвоживание
var fatigue: float = 10.0     # 0 = бодр, 100 = измотан
var body_temp_c: float = 37.0 # Норма ~37.0 °C
var stress: float = 5.0       # 0 = спокоен, 100 = паника
var boredom: float = 10.0     # 0 = увлечён, 100 = депрессия
var stamina: float = 100.0    # 100 = полная, 0 = запыхался

var _norm_temp_c: float = 37.0
var _hypothermia_c: float = 35.0
var _hyperthermia_c: float = 37.5
var _comfort_ambient_c: float = 21.0
var _daily_water_l: float = 3.7
var _daily_kcal_game: float = 335.0


func _ready() -> void:
	_norm_temp_c = DataDB.get_real_game_value("med_normal_body_temp_c", 37.0)
	_hypothermia_c = DataDB.get_real_game_value("med_hypothermia_threshold_c", 35.0)
	_hyperthermia_c = DataDB.get_real_game_value("med_hyperthermia_threshold_c", 37.5)
	_comfort_ambient_c = DataDB.get_real_game_value("clim_comfort_ambient_temp_c", 21.0)
	_daily_water_l = DataDB.get_real_game_value("med_daily_water_intake_l", 3.7)
	body_temp_c = _norm_temp_c


func tick(dh_hours: float, dt_sec: float, ambient_c: float, clothing_insulation: float, indoor: bool, near_heat: bool, is_sprinting: bool, is_sleeping: bool, zombies_nearby: int) -> Dictionary:
	# 1. Голод: суточная норма ~2000 kcal -> ~335 у.е./24ч (~14 у.е./ч)
	var activity_mult := 1.45 if is_sprinting else (0.55 if is_sleeping else 1.0)
	hunger = maxf(0.0, hunger - (_daily_kcal_game / 24.0) * 0.25 * activity_mult * dh_hours)

	# 2. Жажда: 3.7 л/сут (~3.0 л чистой воды в игре -> ~4.2 у.е./ч при шкале 100 = 2.4 л)
	var heat_sweat := 1.35 if body_temp_c > _hyperthermia_c else 1.0
	thirst = maxf(0.0, thirst - ((_daily_water_l * 1.15) * activity_mult * heat_sweat) * dh_hours)

	# 3. Усталость и сон
	if is_sleeping:
		fatigue = maxf(0.0, fatigue - 14.0 * dh_hours)
	else:
		fatigue = minf(100.0, fatigue + 3.6 * activity_mult * dh_hours)

	# 4. Выносливость в реальном времени
	if is_sprinting and hunger > 5.0 and fatigue < 95.0:
		stamina = maxf(0.0, stamina - 16.0 * dt_sec)
	else:
		var regen := 18.0 if (not is_sprinting and hunger > 20.0) else 8.0
		stamina = minf(100.0, stamina + regen * dt_sec)

	# 5. Терморегуляция тела (окружение + укрытие + одежда + костёр)
	var effective_ambient := ambient_c + (5.0 if indoor else 0.0) + (14.0 if near_heat else 0.0)
	var delta_c := effective_ambient - _comfort_ambient_c
	var target_core := _norm_temp_c
	if delta_c < 0.0:
		# Одежда снижает потери тепла: 1 ед. изоляции компенсирует ~7 °C холода
		var uncompensated_cold := minf(0.0, delta_c + clothing_insulation * 7.0)
		target_core = _norm_temp_c + uncompensated_cold * 0.14
	elif delta_c > 6.0:
		var overheat := (delta_c - 6.0) + clothing_insulation * 0.6
		target_core = _norm_temp_c + overheat * 0.08
	body_temp_c = lerpf(body_temp_c, clampf(target_core, 29.0, 41.0), minf(1.0, dh_hours * 1.6))

	# 6. Стресс и скука
	if zombies_nearby > 0:
		stress = minf(100.0, stress + float(zombies_nearby) * 4.5 * dh_hours)
		boredom = maxf(0.0, boredom - 10.0 * dh_hours)
	else:
		stress = maxf(0.0, stress - 3.0 * dh_hours)
		if indoor and not is_sleeping:
			boredom = minf(100.0, boredom + 4.0 * dh_hours)
		else:
			boredom = maxf(0.0, boredom - 1.5 * dh_hours)

	# Урон от крайних состояний
	var env_hp_loss := 0.0
	if hunger <= 0.0:
		env_hp_loss += 3.5 * dh_hours
	if thirst <= 0.0:
		env_hp_loss += 6.0 * dh_hours
	if body_temp_c < _hypothermia_c:
		ErrorManager.warn("E503", "PlayerNeeds", "Критическое переохлаждение персонажа", {"temp_c": body_temp_c})
		env_hp_loss += (_hypothermia_c - body_temp_c) * 2.5 * dh_hours
	elif body_temp_c > 39.0:
		ErrorManager.warn("E504", "PlayerNeeds", "Тепловой удар", {"temp_c": body_temp_c})
		env_hp_loss += (body_temp_c - 39.0) * 3.0 * dh_hours

	EventBus.need_changed.emit("hunger", hunger)
	EventBus.need_changed.emit("thirst", thirst)
	return {
		"hp_loss": env_hp_loss,
		"hypothermia_pct": clampf((_norm_temp_c - body_temp_c) / 4.0, 0.0, 1.0),
		"panic_pct": clampf(stress / 100.0, 0.0, 1.0)
	}


func apply_consumable(item: Dictionary) -> void:
	hunger = clampf(hunger + float(item.get("hunger", 0.0)), 0.0, 100.0)
	thirst = clampf(thirst + float(item.get("thirst", 0.0)), 0.0, 100.0)
	fatigue = clampf(fatigue + float(item.get("fatigue", 0.0)), 0.0, 100.0)
	stress = clampf(stress + float(item.get("stress", 0.0)), 0.0, 100.0)
	boredom = clampf(boredom + float(item.get("boredom", 0.0)), 0.0, 100.0)
	body_temp_c = clampf(body_temp_c + float(item.get("temp_bonus", 0.0)), 30.0, 41.0)


func get_moodles() -> Array[Dictionary]:
	var out: Array[Dictionary] = []
	if hunger < 40.0:
		out.append({"id": "hunger", "label": "Голод", "severity": 2 if hunger < 15.0 else 1})
	if thirst < 40.0:
		out.append({"id": "thirst", "label": "Жажда", "severity": 2 if thirst < 15.0 else 1})
	if fatigue > 65.0:
		out.append({"id": "fatigue", "label": "Усталость", "severity": 2 if fatigue > 85.0 else 1})
	if body_temp_c < _hypothermia_c:
		out.append({"id": "cold", "label": "Переохлаждение", "severity": 2})
	elif body_temp_c > _hyperthermia_c:
		out.append({"id": "heat", "label": "Перегрев", "severity": 2 if body_temp_c > 39.0 else 1})
	if stress > 55.0:
		out.append({"id": "stress", "label": "Паника", "severity": 2 if stress > 80.0 else 1})
	if boredom > 65.0:
		out.append({"id": "boredom", "label": "Скука", "severity": 1})
	return out


func serialize_state() -> Dictionary:
	return {
		"hunger": hunger, "thirst": thirst, "fatigue": fatigue,
		"body_temp_c": body_temp_c, "stress": stress, "boredom": boredom, "stamina": stamina
	}


func deserialize_state(d: Dictionary) -> void:
	hunger = float(d.get("hunger", 85.0))
	thirst = float(d.get("thirst", 85.0))
	fatigue = float(d.get("fatigue", 10.0))
	body_temp_c = float(d.get("body_temp_c", _norm_temp_c))
	stress = float(d.get("stress", 5.0))
	boredom = float(d.get("boredom", 10.0))
	stamina = float(d.get("stamina", 100.0))
