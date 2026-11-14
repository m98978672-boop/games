class_name PlayerController
extends Node
## Контроллер персонажа: ходьба/бег/стелс в сетке тайлов, ближний и огнестрельный бой, фонарик и взаимодействие.

const WALK_SPEED_TILES: float = 4.6
const SPRINT_SPEED_TILES: float = 7.4
const SNEAK_SPEED_TILES: float = 2.6

var pos: Vector2 = Vector2(16.0, 16.0)
var facing: Vector2 = Vector2.DOWN
var equipped_weapon_id: String = "baseball_bat"
var loaded_ammo: Dictionary = {"glock_17": 17, "m1911": 7, "mossberg_500": 6, "ar15": 30}
var flashlight_on: bool = false
var is_crouching: bool = false
var is_sprinting: bool = false
var attack_cooldown: float = 0.0
var in_vehicle_id: String = ""

var _step_noise_timer: float = 0.0


func move_step(input_dir: Vector2, dt: float, sprint_req: bool, sneak_req: bool, chunks: ChunkStreamer, needs: PlayerNeeds, health: PlayerHealth, inv_weight_mult: float) -> void:
	if health.dead:
		return
	if attack_cooldown > 0.0:
		attack_cooldown = maxf(0.0, attack_cooldown - dt)

	is_crouching = sneak_req
	is_sprinting = sprint_req and not is_crouching and needs.stamina > 8.0 and inv_weight_mult > 0.4
	if sprint_req and health.is_leg_broken():
		ErrorManager.info("E506", "PlayerController", "Спринт заблокирован из-за перелома ноги", {})
		is_sprinting = false

	if input_dir.length_squared() < 0.001:
		is_sprinting = false
		return

	var dir := input_dir.normalized()
	facing = dir
	var spd := WALK_SPEED_TILES
	if is_sprinting:
		spd = SPRINT_SPEED_TILES
	elif is_crouching:
		spd = SNEAK_SPEED_TILES

	spd *= health.get_speed_multiplier() * inv_weight_mult
	var delta := dir * spd * dt

	pos = chunks.move_with_collision(pos, delta, 0.2)

	_step_noise_timer += dt
	if _step_noise_timer >= (0.28 if is_sprinting else 0.45):
		_step_noise_timer = 0.0
		var step_db := 76.0 if is_sprinting else (36.0 if is_crouching else 54.0)
		EventBus.noise_emitted.emit(pos, step_db, "footstep")


func perform_attack(aim_dir: Vector2, inventory: InventorySystem) -> Dictionary:
	if attack_cooldown > 0.0:
		return {"ok": false, "reason": "cooldown"}
	var wpn := DataDB.get_item(equipped_weapon_id)
	if wpn.is_empty():
		wpn = {"cat": "melee", "damage": 12.0, "range": 1.4, "noise_db": 55.0, "fire_rate": 0.45}

	var cat := String(wpn.get("cat", "melee"))
	if aim_dir.length_squared() > 0.01:
		facing = aim_dir.normalized()

	if cat == "firearm":
		var mag := int(loaded_ammo.get(equipped_weapon_id, 0))
		if mag <= 0:
			reload_firearm(inventory)
			return {"ok": false, "reason": "empty_mag"}
		loaded_ammo[equipped_weapon_id] = mag - 1
		attack_cooldown = float(wpn.get("fire_rate", 0.3))
		var noise := float(wpn.get("noise_db", 140.0))
		EventBus.noise_emitted.emit(pos, noise, "gunshot")
		return {
			"ok": true,
			"kind": "firearm",
			"damage": float(wpn.get("damage", 34.0)),
			"range": float(wpn.get("range", 18.0)),
			"pellets": int(wpn.get("pellets", 1)),
			"spread": float(wpn.get("spread", 0.04)),
			"dir": facing
		}

	# Ближний бой
	attack_cooldown = 0.42
	EventBus.noise_emitted.emit(pos, float(wpn.get("noise_db", 70.0)), "melee")
	return {
		"ok": true,
		"kind": "melee",
		"damage": float(wpn.get("damage", 24.0)),
		"range": float(wpn.get("range", 1.8)),
		"stun": float(wpn.get("stun", 0.3)),
		"dir": facing
	}


func reload_firearm(inventory: InventorySystem) -> int:
	var wpn := DataDB.get_item(equipped_weapon_id)
	if String(wpn.get("cat", "")) != "firearm":
		return 0
	var ammo_id := String(wpn.get("ammo_type", ""))
	var cap := int(wpn.get("mag_cap", 10))
	var cur := int(loaded_ammo.get(equipped_weapon_id, 0))
	var need := cap - cur
	if need <= 0:
		return 0
	var avail := inventory.count_item(ammo_id)
	var take := mini(need, avail)
	if take > 0:
		inventory.remove_item(ammo_id, take)
		loaded_ammo[equipped_weapon_id] = cur + take
	return take


func serialize_state() -> Dictionary:
	return {
		"pos": [pos.x, pos.y],
		"equipped_weapon_id": equipped_weapon_id,
		"loaded_ammo": loaded_ammo.duplicate(),
		"flashlight_on": flashlight_on,
		"in_vehicle_id": in_vehicle_id
	}


func deserialize_state(d: Dictionary) -> void:
	var p: Array = d.get("pos", [16.0, 16.0])
	pos = Vector2(float(p[0]), float(p[1]))
	equipped_weapon_id = String(d.get("equipped_weapon_id", "baseball_bat"))
	loaded_ammo = d.get("loaded_ammo", loaded_ammo).duplicate()
	flashlight_on = bool(d.get("flashlight_on", false))
	in_vehicle_id = String(d.get("in_vehicle_id", ""))
