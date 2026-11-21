class_name RazlomActorMotion
extends RefCounted
## Lightweight modular joint animation; no per-frame asset construction.
var model: Node3D
var clock := 0.0
var blend := 0.0
var recoil := 0.0
var joints: Dictionary = {}
var elbows: Dictionary = {}
var flinch := 0.0
var reactions: Dictionary = {}
var knees: Dictionary = {}
var hit_region := "torso"
var rest_height := 0.0
var is_quadruped := false
var blink_clock := 0.0
var gesture := 0.0
var gesture_kind := "greet"
var idle_fidget := 0.0
var idle_fidget_wait := 4.5
var idle_fidget_arm := "ArmL"
## Duck/crouch reaction (0..1): set to 1 on a hit or a near miss, decays in advance().
var duck := 0.0

func _init(root: Node3D, quadruped: bool = false) -> void:
	model = root
	rest_height = model.position.y
	is_quadruped = quadruped
	var parts := ["LegFL", "LegFR", "LegBL", "LegBR"] if quadruped else ["LegL", "LegR", "ArmL", "ArmR"]
	for part in parts:
		var limb := model.get_node_or_null(NodePath(part)) as Node3D
		if limb == null:
			continue
		var pivot := Node3D.new()
		pivot.name = part + "Joint"
		model.add_child(pivot)
		# Rotate from hip/shoulder rather than the centre of the box.
		pivot.position = limb.position + Vector3.UP * (0.19 if quadruped else (0.35 if part.begins_with("Leg") else 0.23))
		limb.reparent(pivot, true)
		joints[part] = pivot
		if not quadruped and part.begins_with("Arm"):
			var elbow := limb.get_node_or_null("Elbow") as Node3D
			if elbow != null:
				elbows[part] = elbow
		if not quadruped and part.begins_with("Leg"):
			limb.get_node("Visual").hide()
			var cloth := RazlomArt.material(Color("45554e"), "cloth")
			RazlomArt.box(limb, Vector3(0, 0.14, 0), Vector3(0.18, 0.36, 0.21), cloth)
			var knee := Node3D.new()
			limb.add_child(knee)
			knee.position.y = -0.04
			RazlomArt.box(knee, Vector3(0, -0.15, 0), Vector3(0.16, 0.3, 0.19), cloth)
			RazlomArt.box(knee, Vector3(0, -0.32, -0.045), Vector3(0.2, 0.11, 0.3), RazlomArt.material(Color("353d36")))
			knees[part] = knee

func greet(kind: String = "greet") -> void:
	gesture_kind = kind
	gesture = 1.6

func hurt() -> void:
	flinch = 1.0

func react(zone: String, local_point: Vector3, strength: float = 1.0) -> void:
	var part := "Coat"
	if zone == "head": part = "Head"
	elif zone == "arms": part = "ArmL" if local_point.x < 0 else "ArmR"
	elif zone == "legs": part = "LegL" if local_point.x < 0 else "LegR"
	reactions[part] = clampf(strength, 0.2, 1.0)
	hit_region = "left_arm" if part == "ArmL" else ("right_arm" if part == "ArmR" else zone)
	hurt()

func fire() -> void:
	recoil = 1.0

func advance(delta: float, speed: float, aiming: Variant = false) -> void:
	var aim_amount := float(aiming) if typeof(aiming) == TYPE_BOOL else clampf(float(aiming), 0.0, 1.0)
	for part in reactions.keys():
		reactions[part] = maxf(0, float(reactions[part]) - delta * 2.2)
	blink_clock += delta
	gesture = maxf(0.0, gesture - delta)
	flinch = move_toward(flinch, 0.0, delta * 2.5)
	duck = move_toward(duck, 0.0, delta * 1.7)
	clock += delta * (speed * 3.4 + 0.4)
	blend = move_toward(blend, clampf(speed / 2.5, 0, 1), delta * 6)
	recoil = move_toward(recoil, 0, delta * 7)
	if not is_quadruped and blend < 0.05 and aim_amount < 0.05 and gesture <= 0.0:
		idle_fidget_wait -= delta
		if idle_fidget_wait <= 0.0:
			idle_fidget = 1.25
			idle_fidget_arm = "ArmR" if idle_fidget_arm == "ArmL" else "ArmL"
			idle_fidget_wait = 8.0 + fposmod(clock * 1.71, 3.0)
	else:
		idle_fidget = 0.0
	idle_fidget = maxf(0.0, idle_fidget - delta)
	var fidget_blend := sin((1.0 - idle_fidget / 1.25) * PI) if idle_fidget > 0.0 else 0.0
	for part in joints:
		var joint: Node3D = joints[part]
		var alternate: bool = part in ["LegR", "ArmL", "LegFR", "LegBL"]
		var swing := sin(clock + (PI if alternate else 0.0)) * blend * 0.5
		if part.begins_with("Arm"):
			swing = lerpf(swing, -0.65 - recoil * 0.2, aim_amount)
		if part.begins_with("Arm"):
			swing -= flinch * (0.95 if (part == "ArmL" and hit_region == "left_arm") or (part == "ArmR" and hit_region == "right_arm") else 0.65)
		var social_blend := sin((1.0 - gesture / 1.6) * PI) if gesture > 0.0 else 0.0
		if part == "ArmR" and gesture > 0.0 and gesture_kind == "greet":
			swing = -1.2 + sin(gesture * 9.0) * 0.18
		elif part.begins_with("Arm") and gesture_kind == "warm":
			swing = lerpf(swing, -0.22 if part == "ArmR" else -0.15, social_blend)
		elif part.begins_with("Arm") and gesture_kind == "listen":
			swing = lerpf(swing, -0.32, social_blend)
		elif part == "ArmL" and gesture > 0.0 and gesture_kind == "treat":
			swing = 0.82 + sin(gesture * 7.0) * 0.05
		swing += float(reactions.get(part, 0)) * (0.65 if part.begins_with("Leg") else -0.8)
		# Keep every humanoid shoulder inside a usable range; combined flinch,
		# gait and gesture offsets must never fold a sleeve through the torso.
		if part.begins_with("Arm"):
			swing = clampf(swing, -1.38, 0.5)
		var gesture_roll := 0.0
		if part.begins_with("Arm") and gesture <= 0.0 and aim_amount < 0.05:
			var idle_phase := 0.0 if part == "ArmL" else 1.7
			swing += sin(clock * 0.8 + idle_phase) * 0.045 * (1.0 - blend)
			gesture_roll += sin(clock * 0.55 + idle_phase) * 0.025 * (1.0 - blend)
			if part == idle_fidget_arm:
				swing = lerpf(swing, -0.48, fidget_blend)
				gesture_roll += (-0.12 if part == "ArmL" else 0.12) * fidget_blend
		if part == "ArmL" and gesture_kind in ["warm", "listen"]:
			gesture_roll = -0.22 * social_blend
		elif part == "ArmR" and gesture_kind in ["warm", "listen"]:
			gesture_roll = 0.22 * social_blend
		elif part == "ArmR" and gesture > 0.0 and gesture_kind == "greet":
			# Raise the greeting hand clear of the coat so the wave reads head-on.
			gesture_roll = 1.05 * social_blend
		elif part == "ArmL" and gesture > 0.0 and gesture_kind == "treat":
			# Turn the offered hand outward while the forearm reaches forward.
			gesture_roll = -0.5 * social_blend
		var roll := float(reactions.get(part, 0)) * (0.25 if alternate else -0.25) + gesture_roll
		var roll_limit := 0.35
		if part.begins_with("Arm"):
			# Mild inward rest cant keeps sleeves joined to the chest and hands
			# close to the hips instead of hanging out from the shoulders.
			roll += 0.14 if part == "ArmL" else -0.14
			if part == "ArmR" and gesture > 0.0 and gesture_kind == "greet":
				roll_limit = 1.15
			elif part == "ArmL" and gesture > 0.0 and gesture_kind == "treat":
				roll_limit = 0.7
			joint.rotation.z = clampf(roll, -roll_limit, roll_limit)
		else:
			joint.rotation.z = roll
		if knees.has(part):
			knees[part].rotation.x = maxf(0, -sin(clock + (PI if alternate else 0.0))) * blend * 0.7 + float(reactions.get(part, 0)) * 0.6 + duck * 0.55
		joint.rotation.x = lerp_angle(joint.rotation.x, swing, 1.0 - exp(-delta * 12.0))
		if elbows.has(part):
			var bend := 0.06 + absf(swing) * 0.12 + flinch * 0.12
			if part == "ArmR" and gesture > 0.0 and gesture_kind == "greet":
				bend = lerpf(bend, 0.42, social_blend)
			elif part == "ArmL" and gesture > 0.0 and gesture_kind == "treat":
				bend = lerpf(bend, 0.5, social_blend)
			elif part.begins_with("Arm") and gesture_kind in ["warm", "listen"]:
				bend = lerpf(bend, 0.28, social_blend)
			var elbow: Node3D = elbows[part]
			elbow.rotation.x = lerp_angle(elbow.rotation.x, clampf(bend, 0.0, 0.78), 1.0 - exp(-delta * 10.0))
	var breathing := sin(clock * 1.25) * (1.0 - blend) * 0.012
	var step_bob := (1.0 - cos(clock * 2.0)) * blend * 0.012
	model.position.y = lerpf(model.position.y, rest_height + step_bob + breathing - duck * 0.20, 1.0 - exp(-delta * 10.0))
	var idle_lean := sin(clock * 0.7) * (1.0 - blend) * 0.025
	model.rotation.z = lerp_angle(model.rotation.z, idle_lean + flinch * 0.28, 1.0 - exp(-delta * 12.0))
	model.rotation.x = lerp_angle(model.rotation.x, duck * 0.18, 1.0 - exp(-delta * 10.0))
	var coat := model.get_node_or_null("Coat") as Node3D
	if coat != null:
		coat.rotation.x = sin(clock * 0.6) * 0.012 + float(reactions.get("Coat", 0)) * 0.3 + duck * 0.22
	var head := model.get_node_or_null("Head") as Node3D
	if head != null:
		for eye_name in ["EyeL", "EyeR"]:
			var eye := head.get_node_or_null(NodePath(eye_name)) as Node3D
			if eye != null:
				eye.scale.y = 0.08 if fmod(blink_clock, 4.3) > 4.16 else 1.0
		head.rotation.z = float(reactions.get("Head", 0)) * 0.22
		var idle := (1.0 - blend) * (1.0 - aim_amount)
		head.rotation.y = lerp_angle(head.rotation.y, sin(clock * 0.7) * idle * (0.32 if is_quadruped else 0.2), 1.0 - exp(-delta * 5.0))
		head.rotation.x = lerp_angle(head.rotation.x, (sin(clock * 1.1) * idle * 0.05 if is_quadruped else 0.0) - flinch * 0.3 - duck * 0.18 + (sin(gesture * 6.0) * 0.07 if gesture > 0.0 else 0.0), 1.0 - exp(-delta * 10.0))
	var tail := model.get_node_or_null("Tail") as Node3D
	if tail != null:
		tail.rotation.y = sin(clock * 1.5) * 0.3
