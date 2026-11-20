class_name RazlomState
extends RefCounted
const SAVE_VERSION := 2
const NUMERIC_KEYS := ["health", "hunger", "water", "stamina", "warmth", "fatigue", "ammo", "reserve", "medkits", "food", "bottles", "charges", "scrap", "kills", "armor", "helmet", "pain", "leg_wound", "left_arm_wound", "right_arm_wound"]
const METER_KEYS := ["health", "hunger", "water", "stamina", "warmth", "fatigue", "armor", "helmet", "pain", "leg_wound", "left_arm_wound", "right_arm_wound"]
var armor := 0.0
var helmet := 0.0
var pain := 0.0
var leg_wound := 0.0
var left_arm_wound := 0.0
var right_arm_wound := 0.0
var health := 100.0
var hunger := 82.0
var water := 76.0
var stamina := 100.0
var warmth := 78.0
var fatigue := 12.0
var ammo := 18
var reserve := 54
var medkits := 2
var food := 1
var bottles := 1
var charges := 2
var scrap := 0
var pump := false
var complete := false
var manifest := false
var truth_shared := false
var passage := false
var passage_broken := false
var relay_log := false
var relay_shared := false
## 0 = not asked, 1 = mutual interest, 2 = relationship, 3 = chose friendship.
var vera_bond := 0
var quests: Dictionary = {}
var tracked_quest := ""
var kills := 0

func tick(delta: float, sprinting: bool, indoors: bool = false) -> void:
	if not is_finite(delta) or delta < 0:
		return
	pain = maxf(0, pain - delta * 4.0)
	hunger = maxf(0, hunger - delta * 0.055)
	water = maxf(0, water - delta * 0.085)
	stamina = clampf(stamina + delta * (-18.0 if sprinting else 12.0), 0, 100)
	warmth = clampf(warmth + delta * (0.3 if indoors else -0.045), 0, 100)
	fatigue = minf(100, fatigue + delta * (0.03 if sprinting else 0.018))
	if hunger <= 0 or water <= 0:
		health = maxf(0, health - delta * 1.5)
	if warmth <= 0:
		health = maxf(0, health - delta * 0.6)

func rest() -> bool:
	if hunger < 15 or water < 20:
		return false
	hunger -= 10
	water -= 15
	fatigue = 0
	warmth = 100
	stamina = 100
	health = minf(100, health + 25)
	return true

func craft(recipe: String) -> bool:
	var prices := {"medkit": 2, "charge": 3, "ammo": 2}
	if not prices.has(recipe) or scrap < int(prices[recipe]):
		return false
	scrap -= int(prices[recipe])
	match recipe:
		"medkit":
			medkits += 1
		"charge":
			charges += 1
		"ammo":
			reserve += 18
	return true

func use_item(kind: String) -> bool:
	match kind:
		"heal":
			if medkits <= 0 or (health >= 100 and leg_wound <= 0 and pain <= 0 and left_arm_wound <= 0 and right_arm_wound <= 0):
				return false
			medkits -= 1
			health = minf(100, health + 45)
			leg_wound = 0
			left_arm_wound = 0
			right_arm_wound = 0
			pain *= 0.3
		"food":
			if food <= 0 or hunger >= 100:
				return false
			food -= 1
			hunger = minf(100, hunger + 45)
		"water":
			if bottles <= 0 or water >= 100:
				return false
			bottles -= 1
			water = minf(100, water + 50)
		_:
			return false
	return true

func reload_gun() -> int:
	var amount := mini(18 - ammo, reserve)
	ammo += amount
	reserve -= amount
	return amount

func snapshot() -> Dictionary:
	var result := {"version": SAVE_VERSION, "pump": pump, "complete": complete, "manifest": manifest, "truth_shared": truth_shared, "passage": passage, "passage_broken": passage_broken, "relay_log": relay_log, "relay_shared": relay_shared, "vera_bond": vera_bond}
	result["tracked_quest"] = tracked_quest
	result["quests"] = quests.duplicate(true)
	for key in NUMERIC_KEYS:
		result[key] = get(key)
	return result

func restore(source: Dictionary) -> bool:
	var data := source.duplicate(true)
	if data.get("version", 0) == 1:
		data["version"] = SAVE_VERSION
		data["warmth"] = 78.0
		data["fatigue"] = 12.0
	if data.get("version", 0) != SAVE_VERSION:
		return false
	if not data.has("vera_bond"):
		data["vera_bond"] = 0
	var bond_value: Variant = data.get("vera_bond", 0)
	if not (bond_value is int or bond_value is float) or not is_finite(float(bond_value)):
		return false
	if float(bond_value) != floor(float(bond_value)) or bond_value < 0 or bond_value > 3:
		return false
	for key in ["armor", "helmet", "pain", "leg_wound", "left_arm_wound", "right_arm_wound"]:
		if not data.has(key):
			data[key] = 0.0
	for key in NUMERIC_KEYS:
		if not (data.get(key) is float or data.get(key) is int):
			return false
		var value := float(data[key])
		if not is_finite(value) or value < 0 or value > 10000:
			return false
		if not METER_KEYS.has(key) and value != floor(value):
			return false
	for key in ["manifest", "truth_shared", "passage", "passage_broken", "relay_log", "relay_shared"]:
		if not data.get(key, false) is bool:
			return false
		data[key] = data.get(key, false)
	if data.relay_shared and not data.relay_log:
		return false
	if data.passage and data.passage_broken:
		return false
	if data.truth_shared and not data.manifest:
		return false
	for key in ["pump", "complete"]:
		if not data.get(key) is bool:
			return false
	for key in METER_KEYS:
		if float(data[key]) > 100:
			return false
	if data["ammo"] > 18:
		return false
	if not data.get("tracked_quest", "") is String or (data.get("tracked_quest", "") != "" and not RazlomQuests.LIMITS.has(data.tracked_quest)):
		return false
	if not RazlomQuests.valid(data.get("quests", {})):
		return false
	var quest_data: Dictionary = data.get("quests", {})
	if quest_data.get("gate", 0) > 0 and quest_data.get("power", 0) != 3:
		return false
	if quest_data.get("power", 0) > 0 and not data.relay_shared:
		return false
	# Commit only after all checks: failed restore must not mutate live state.
	for key in NUMERIC_KEYS + ["pump", "complete", "manifest", "truth_shared", "passage", "passage_broken", "relay_log", "relay_shared"]:
		set(key, data[key])
	vera_bond = int(bond_value)
	quests = quest_data.duplicate(true)
	tracked_quest = data.get("tracked_quest", "")
	return true
