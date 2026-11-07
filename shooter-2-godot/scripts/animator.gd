extends RefCounted
class_name SH2Animator
## СЕКТОР «ПЕПЕЛ» — рантайм анимаций (порт).
##
## Слои: база (всё тело) + верх (руки/оружие) + событие (выстрел, ранение).
## Каждый слой выбирает клип и вариант; веса смешиваются, позы сглаживаются,
## поэтому переходы не «щёлкают». Кривые пары (часть, клип, вариант)
## строятся один раз и кэшируются — 1760 клипов не считаются в каждом кадре.

static var _curve_cache := {}
static var _curve_builds := 0

var rig: Node3D
var bones: Dictionary
var base_positions: Dictionary = {}
var layers: Array = [null, null, null]
var parts: Array = SH2Data.PARTS
var current: Dictionary = {}
var variant: int = 0
var smooth_rate: float = 15.0
var update_every: int = 1
var frame: int = 0
var current_clip: String = ""
var current_variant: int = 0
var ground_offset: float = 0.0
var ground_lock: float = 1.0

static var UPPER_IDS: Array = []
static var LOWER_IDS: Array = []
static var FULL_IDS: Array = []


static func _build_layer_lists() -> void:
	if not UPPER_IDS.is_empty():
		return
	for p in SH2Data.PARTS:
		FULL_IDS.append(p["id"])
		if p["group"] == "arms" or p["group"] == "weapon" or p["id"] == "chest" \
				or p["id"] == "neck" or p["id"] == "head":
			UPPER_IDS.append(p["id"])
		if p["group"] == "core" or p["group"] == "legs":
			LOWER_IDS.append(p["id"])


## Кривая (часть, клип, вариант) с кэшем
static func curve(part: Dictionary, clip_id: String, variant_index: int) -> Dictionary:
	var key := "%s|%s|%d" % [part["id"], clip_id, variant_index]
	if _curve_cache.has(key):
		return _curve_cache[key]
	var clip := SH2Data.clip_by_id(clip_id)
	if clip.is_empty():
		return {}
	var c := SH2Data.clip_curve(part, clip, variant_index)
	_curve_cache[key] = c
	_curve_builds += 1
	return c


static func cache_size() -> int:
	return _curve_cache.size()


static func curve_builds() -> int:
	return _curve_builds


static func reset_caches() -> void:
	_curve_cache.clear()
	_curve_builds = 0


## Выборка канала по фазе (smoothstep между ключами)
static func sample_track(frames: Array, t: float) -> float:
	var n: int = frames.size()
	if n == 0:
		return 0.0
	if t <= float(frames[0][0]):
		return float(frames[0][1])
	if t >= float(frames[n - 1][0]):
		return float(frames[n - 1][1])
	for i in range(1, n):
		if t <= float(frames[i][0]):
			var a: Array = frames[i - 1]
			var b: Array = frames[i]
			var span: float = float(b[0]) - float(a[0])
			if span <= 0.0:
				span = 1.0
			var u: float = (t - float(a[0])) / span
			u = u * u * (3.0 - 2.0 * u)
			return float(a[1]) + (float(b[1]) - float(a[1])) * u
	return float(frames[n - 1][1])


func _init(rig_node: Node3D, opts: Dictionary = {}) -> void:
	_build_layer_lists()
	rig = rig_node
	bones = rig_node.get_meta("bones", {})
	for bone_name in bones:
		var b: Node3D = bones[bone_name]
		base_positions[bone_name] = b.position
	for p in parts:
		current[p["id"]] = {"rx": 0.0, "ry": 0.0, "rz": 0.0, "ty": 0.0, "tz": 0.0}
	variant = int(opts.get("variant", 0))
	update_every = int(opts.get("update_every", 1))
	smooth_rate = float(opts.get("smooth", 15.0))
	ground_lock = float(opts.get("ground_lock", 1.0))


func set_base(clip_id: String, opts: Dictionary = {}) -> Dictionary:
	var v: int = int(opts.get("variant", variant))
	return _set_layer(0, clip_id, v, FULL_IDS, opts)


func set_upper(clip_id: String, opts: Dictionary = {}) -> Dictionary:
	if clip_id == "":
		_clear_layer(1)
		return {}
	var v: int = int(opts.get("variant", variant))
	return _set_layer(1, clip_id, v, opts.get("parts", UPPER_IDS), opts)


func set_event(clip_id: String, opts: Dictionary = {}) -> Dictionary:
	if clip_id == "":
		_clear_layer(2)
		return {}
	var v: int = int(opts.get("variant", variant))
	return _set_layer(2, clip_id, v, opts.get("parts", FULL_IDS), opts)


func set_variant(v: int) -> void:
	variant = v


func _set_layer(index: int, clip_id: String, layer_variant: int, parts_list: Array, o: Dictionary) -> Dictionary:
	var clip := SH2Data.clip_by_id(clip_id)
	if clip.is_empty():
		return {}
	var target_w: float = float(o.get("weight", 1.0))
	var existing = layers[index]
	if existing != null and existing["clip"] == clip_id and existing["variant"] == layer_variant:
		existing["target_weight"] = target_w
		if bool(o.get("restart", false)):
			existing["time"] = 0.0
		return existing
	var variant_speed: float = float(SH2Data.VARIANTS[layer_variant]["speed"])
	var fade: float = float(o.get("fade", 9.0))
	var layer := {
		"clip": clip_id,
		"variant": layer_variant,
		"parts": parts_list,
		"weight": target_w if bool(o.get("instant", false)) else 0.0,
		"target_weight": target_w,
		"time": 0.0,
		"speed": float(o.get("speed", 1.0)),
		"loop": bool(clip["loop"]),
		"dur": maxf(0.05, float(clip["dur"]) / variant_speed),
		"fade": (1.0 / fade if fade > 0.0 else 999.0),
		"start_delay": float(o.get("delay", 0.0)),
	}
	layers[index] = layer
	if index == 0:
		current_clip = clip_id
		current_variant = layer_variant
	return layer


func _clear_layer(index: int) -> void:
	if layers[index] != null:
		layers[index]["target_weight"] = 0.0


func update(dt: float) -> void:
	if dt <= 0.0:
		return
	dt = minf(dt, 0.12)
	frame += 1
	if update_every > 1 and frame % update_every != 0:
		return

	for i in layers.size():
		var L = layers[i]
		if L == null:
			continue
		if float(L["start_delay"]) > 0.0:
			L["start_delay"] = float(L["start_delay"]) - dt
			continue
		var rate: float = minf(1.0, float(L["fade"]) * dt)
		L["weight"] = float(L["weight"]) + (float(L["target_weight"]) - float(L["weight"])) * rate
		if bool(L["loop"]):
			L["time"] = fmod(float(L["time"]) + dt * float(L["speed"]), float(L["dur"]))
		else:
			L["time"] = minf(float(L["dur"]), float(L["time"]) + dt * float(L["speed"]))
			if float(L["time"]) >= float(L["dur"]) and i > 0:
				L["target_weight"] = 0.0
		if float(L["weight"]) < 0.004 and float(L["target_weight"]) < 0.01 and i > 0:
			layers[i] = null

	var k: float = 1.0 - exp(-smooth_rate * dt)
	for part in parts:
		var rx := 0.0
		var ry := 0.0
		var rz := 0.0
		var ty := 0.0
		var tz := 0.0
		var wsum := 0.0
		for li in 3:
			var L = layers[li]
			if L == null or float(L["weight"]) <= 0.002 or float(L["start_delay"]) > 0.0:
				continue
			var lp: Array = L["parts"]
			if lp != FULL_IDS and not lp.has(part["id"]):
				continue
			var c := curve(part, String(L["clip"]), int(L["variant"]))
			if c.is_empty():
				continue
			var dur: float = float(L["dur"])
			var phase: float = float(L["time"]) / dur if dur > 0.001 else 0.0
			var w: float = float(L["weight"])
			if c.has("rx"):
				rx += sample_track(c["rx"], phase) * w
			if c.has("ry"):
				ry += sample_track(c["ry"], phase) * w
			if c.has("rz"):
				rz += sample_track(c["rz"], phase) * w
			if c.has("ty"):
				ty += sample_track(c["ty"], phase) * w
			if c.has("tz"):
				tz += sample_track(c["tz"], phase) * w
			wsum += w
		var cur: Dictionary = current[part["id"]]
		var inv: float = 1.0 / wsum if wsum > 1.0001 else 1.0
		cur["rx"] = lerpf(float(cur["rx"]), rx * inv, k)
		cur["ry"] = lerpf(float(cur["ry"]), ry * inv, k)
		cur["rz"] = lerpf(float(cur["rz"]), rz * inv, k)
		cur["ty"] = lerpf(float(cur["ty"]), ty * inv, k)
		cur["tz"] = lerpf(float(cur["tz"]), tz * inv, k)
		var bone: Node3D = bones.get(part["bone"], null)
		if bone == null:
			continue
		bone.rotation = Vector3(float(cur["rx"]), float(cur["ry"]), float(cur["rz"]))
		var base = base_positions.get(part["bone"], null)
		if base != null:
			var off: float = ground_offset if part["id"] == "pelvis" else 0.0
			bone.position = Vector3(base.x, base.y + float(cur["ty"]) + off,
				base.z + float(cur["tz"]))


func reset() -> void:
	layers = [null, null, null]
	for p in parts:
		current[p["id"]] = {"rx": 0.0, "ry": 0.0, "rz": 0.0, "ty": 0.0, "tz": 0.0}
		var b: Node3D = bones.get(p["bone"], null)
		if b != null:
			b.rotation = Vector3.ZERO
	for bone_name in base_positions:
		var b2: Node3D = bones.get(bone_name, null)
		if b2 != null:
			b2.position = base_positions[bone_name]


## Принудительно выставить позу клипа (лаборатория, превью меню)
func pose_at(clip_id: String, variant_index: int, phase: float) -> void:
	reset()
	for p in parts:
		var c := curve(p, clip_id, variant_index)
		if c.is_empty():
			continue
		var b: Node3D = bones.get(p["bone"], null)
		if b == null:
			continue
		b.rotation = Vector3(
			sample_track(c["rx"], phase) if c.has("rx") else 0.0,
			sample_track(c["ry"], phase) if c.has("ry") else 0.0,
			sample_track(c["rz"], phase) if c.has("rz") else 0.0)
		var base = base_positions.get(p["bone"], null)
		if base != null:
			var off: float = ground_offset if p["id"] == "pelvis" else 0.0
			b.position = Vector3(base.x, base.y + (sample_track(c["ty"], phase) if c.has("ty") else 0.0) + off,
				base.z + (sample_track(c["tz"], phase) if c.has("tz") else 0.0))


## Автоподстройка по земле: стопы ставятся на пол, таз мягко подтягивается.
## Так ни одна из 1760 поз не проваливается.
static func ground_lock_update(rig_node: Node3D, animator: SH2Animator, strength: float = 1.0) -> void:
	var bones_map: Dictionary = rig_node.get_meta("bones", {})
	if not bones_map.has("footL") or not bones_map.has("footR"):
		return
	var low := 1e9
	for key in ["footL", "footR"]:
		var b: Node3D = bones_map[key]
		var y: float = b.global_position.y
		low = minf(low, y)
	if not is_finite(low):
		return
	var target := 0.015
	var delta: float = (target - low) * strength
	var max_step := 0.11
	var step: float = clampf(delta, -max_step, max_step)
	animator.ground_offset = clampf(animator.ground_offset + step * 0.55, -0.55, 0.30)
