class_name PlayerHealth
extends Node
## Многослойная система повреждений частей тела:
## Броня одежды -> Царапина / Глубокая рана / Укус / Перелом -> Кровопотеря (5000 мл, пороги 20%/40% шока) ->
## Бинтование (чистый/грязный/стерильный) -> Наложение швов -> Антисептик -> Шина (7 дней с шиной / 18 без).

const BODY_PARTS: Array[String] = ["HEAD", "TORSO", "ARM_L", "ARM_R", "LEG_L", "LEG_R"]

var max_blood_ml: float = 5000.0
var blood_ml: float = 5000.0
var lethal_loss_pct: float = 40.0
var base_infection_risk: float = 0.30
var fracture_heal_days_splinted: float = 7.0

var global_hp: float = 100.0
var pain: float = 0.0
var painkiller_timer_h: float = 0.0
var zombification_pct: float = 0.0
var dead: bool = false

var parts: Dictionary = {}
var _rng := RandomNumberGenerator.new()


func _ready() -> void:
	max_blood_ml = DataDB.get_real_game_value("med_blood_volume_ml", 5000.0)
	blood_ml = max_blood_ml
	lethal_loss_pct = DataDB.get_real_game_value("med_blood_loss_shock_pct", 40.0)
	base_infection_risk = DataDB.get_real_game_value("med_open_fracture_infection_pct", 30.0) / 100.0
	fracture_heal_days_splinted = DataDB.get_real_game_value("med_fracture_healing_days", 7.0)
	_rng.seed = 2026
	reset_body()


func reset_body() -> void:
	blood_ml = max_blood_ml
	global_hp = 100.0
	pain = 0.0
	zombification_pct = 0.0
	dead = false
	parts.clear()
	for p in BODY_PARTS:
		parts[p] = {
			"hp": 100.0,
			"scratches": 0,
			"lacerations": 0,
			"bites": 0,
			"bleed_rate_ml_h": 0.0,
			"bandaged": false,
			"bandage_clean": true,
			"sutured": false,
			"disinfected": false,
			"bacterial_infection": 0.0,
			"fracture_days_left": 0.0,
			"splinted": false
		}


## Многослойная обработка атаки зомби/падения/пули с учётом брони по зонам.
func apply_attack(part: String, raw_damage: float, bite_chance: float, z_infect_chance: float, armor: Dictionary) -> Dictionary:
	if dead:
		return {"blocked": true}
	var target_part := part if parts.has(part) else BODY_PARTS[_rng.randi() % BODY_PARTS.size()]
	var rec: Dictionary = parts[target_part]

	var bite_def := float(armor.get("bite_def", 0.0))
	var scratch_def := float(armor.get("scratch_def", 0.0))
	var absorbed := raw_damage * minf(0.75, scratch_def)
	var hp_dmg := maxf(2.0, raw_damage - absorbed)

	rec["hp"] = maxf(0.0, float(rec["hp"]) - hp_dmg)
	global_hp = maxf(0.0, global_hp - hp_dmg * 0.45)

	var wound := "scratch"
	var r := _rng.randf()
	if r < bite_chance * (1.0 - bite_def):
		wound = "bite"
		rec["bites"] = int(rec["bites"]) + 1
		rec["bleed_rate_ml_h"] += 420.0
		rec["bandaged"] = false
		pain = minf(100.0, pain + 45.0)
		if _rng.randf() < z_infect_chance:
			zombification_pct = maxf(zombification_pct, 5.0)
	elif r < 0.45 * (1.0 - scratch_def):
		wound = "laceration"
		rec["lacerations"] = int(rec["lacerations"]) + 1
		rec["bleed_rate_ml_h"] += 320.0
		rec["bandaged"] = false
		pain = minf(100.0, pain + 30.0)
	else:
		rec["scratches"] = int(rec["scratches"]) + 1
		rec["bleed_rate_ml_h"] += 110.0
		rec["bandaged"] = false
		pain = minf(100.0, pain + 15.0)

	if target_part == "HEAD" and float(rec["hp"]) <= 0.0:
		_trigger_death("Смертельная черепно-мозговая травма")

	EventBus.player_damaged.emit(target_part, hp_dmg, wound)
	return {"part": target_part, "wound": wound, "hp_dmg": hp_dmg}


func apply_fracture(part: String) -> void:
	if not parts.has(part):
		return
	var rec: Dictionary = parts[part]
	rec["fracture_days_left"] = fracture_heal_days_splinted * 2.5
	rec["splinted"] = false
	pain = minf(100.0, pain + 55.0)


func treat_part(part: String, med_item: Dictionary) -> bool:
	if not parts.has(part):
		return false
	var rec: Dictionary = parts[part]
	if bool(med_item.get("disinfect", false)):
		rec["disinfected"] = true
		return true
	if bool(med_item.get("sutures", false)) and int(rec["lacerations"]) > 0:
		rec["sutured"] = true
		rec["bleed_rate_ml_h"] *= 0.25
		return true
	if bool(med_item.get("splints", false)) and float(rec["fracture_days_left"]) > 0.0:
		rec["splinted"] = true
		rec["fracture_days_left"] = minf(float(rec["fracture_days_left"]), fracture_heal_days_splinted)
		return true
	if float(med_item.get("stop_bleed", 0.0)) > 0.0:
		rec["bandaged"] = true
		rec["bandage_clean"] = float(med_item.get("cleanliness", 1.0)) >= 0.9
		if float(med_item.get("infection_reduce", 0.0)) > 0.0:
			rec["disinfected"] = true
		return true
	if float(med_item.get("cure_bacterial", 0.0)) > 0.0:
		rec["bacterial_infection"] = maxf(0.0, float(rec["bacterial_infection"]) - 50.0)
		return true
	if float(med_item.get("pain_reduce", 0.0)) > 0.0:
		pain = maxf(0.0, pain - float(med_item["pain_reduce"]))
		painkiller_timer_h = 4.0
		return true
	return false


func tick(dh_hours: float, env_hp_loss: float) -> void:
	if dead:
		return
	global_hp = maxf(0.0, global_hp - env_hp_loss)
	if painkiller_timer_h > 0.0:
		painkiller_timer_h = maxf(0.0, painkiller_timer_h - dh_hours)

	var total_bleed_ml_h := 0.0
	for p in BODY_PARTS:
		var rec: Dictionary = parts[p]
		var bleed := float(rec["bleed_rate_ml_h"])
		if bool(rec["bandaged"]):
			bleed *= 0.05
			if not bool(rec["bandage_clean"]) and not bool(rec["disinfected"]):
				rec["bacterial_infection"] = minf(100.0, float(rec["bacterial_infection"]) + base_infection_risk * 12.0 * dh_hours)
		elif bleed > 0.0 and not bool(rec["disinfected"]):
			rec["bacterial_infection"] = minf(100.0, float(rec["bacterial_infection"]) + base_infection_risk * 8.0 * dh_hours)

		total_bleed_ml_h += bleed

		# Заживление при перевязке и отсутствии тяжёлой инфекции
		if bool(rec["bandaged"]) and float(rec["bacterial_infection"]) < 30.0:
			rec["hp"] = minf(100.0, float(rec["hp"]) + 2.5 * dh_hours)
			rec["bleed_rate_ml_h"] = maxf(0.0, float(rec["bleed_rate_ml_h"]) - 25.0 * dh_hours)
			if float(rec["bleed_rate_ml_h"]) <= 0.0:
				rec["scratches"] = 0
				rec["lacerations"] = 0

		if float(rec["bacterial_infection"]) > 40.0:
			global_hp = maxf(0.0, global_hp - 1.8 * dh_hours)

		if float(rec["fracture_days_left"]) > 0.0:
			var speed := 1.0 if bool(rec["splinted"]) else 0.4
			rec["fracture_days_left"] = maxf(0.0, float(rec["fracture_days_left"]) - (dh_hours / 24.0) * speed)

	blood_ml = clampf(blood_ml - total_bleed_ml_h * dh_hours + (120.0 * dh_hours if total_bleed_ml_h < 20.0 else 0.0), 0.0, max_blood_ml)
	var loss_pct := (1.0 - blood_ml / max_blood_ml) * 100.0
	if loss_pct >= lethal_loss_pct:
		ErrorManager.fatal("E505", "PlayerHealth", "Смерть от гиповолемического шока", {"blood_loss_pct": loss_pct})
		_trigger_death("Критическая кровопотеря (>40% объёма крови)")
		return

	if zombification_pct > 0.0:
		zombification_pct = minf(100.0, zombification_pct + 2.2 * dh_hours)
		if zombification_pct >= 100.0:
			ErrorManager.fatal("E507", "PlayerHealth", "Необратимая зомбификация", {})
			_trigger_death("Вы обратились из-за инфекции укуса")
			return

	if global_hp <= 0.0:
		_trigger_death("Истощение и множественные травмы")

	pain = maxf(0.0, pain - 2.0 * dh_hours)


func _trigger_death(cause: String) -> void:
	if dead:
		return
	dead = true
	EventBus.player_died.emit(cause)


func get_speed_multiplier() -> float:
	var mult := 1.0
	if float(parts["LEG_L"]["fracture_days_left"]) > 0.0 or float(parts["LEG_R"]["fracture_days_left"]) > 0.0:
		mult *= 0.45
	var loss_pct := (1.0 - blood_ml / max_blood_ml) * 100.0
	if loss_pct >= 20.0:
		mult *= 0.75
	return mult


func is_leg_broken() -> bool:
	return float(parts["LEG_L"]["fracture_days_left"]) > 0.0 or float(parts["LEG_R"]["fracture_days_left"]) > 0.0


func get_blood_loss_ratio() -> float:
	return clampf(1.0 - blood_ml / max_blood_ml, 0.0, 1.0)


func serialize_state() -> Dictionary:
	return {
		"blood_ml": blood_ml,
		"global_hp": global_hp,
		"pain": pain,
		"zombification_pct": zombification_pct,
		"dead": dead,
		"parts": parts.duplicate(true)
	}


func deserialize_state(d: Dictionary) -> void:
	blood_ml = float(d.get("blood_ml", max_blood_ml))
	global_hp = float(d.get("global_hp", 100.0))
	pain = float(d.get("pain", 0.0))
	zombification_pct = float(d.get("zombification_pct", 0.0))
	dead = bool(d.get("dead", false))
	var saved_parts: Dictionary = d.get("parts", {})
	if not saved_parts.is_empty():
		parts = saved_parts.duplicate(true)
