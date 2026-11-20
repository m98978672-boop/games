class_name RazlomActorMotion
extends RefCounted
## Lightweight modular joint animation; no per-frame asset construction.
var model: Node3D
var clock := 0.0
var blend := 0.0
var recoil := 0.0
var joints: Dictionary = {}
var flinch := 0.0
var reactions: Dictionary = {}
var knees: Dictionary = {}
var hit_region := "torso"
var rest_height := 0.0
var is_quadruped := false
var blink_clock := 0.0
var gesture := 0.0
var gesture_kind := "greet"

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

func advance(delta: float, speed: float, aiming: bool = false) -> void:
	for part in reactions.keys():
		reactions[part] = maxf(0, float(reactions[part]) - delta * 2.2)
	blink_clock += delta
	gesture = maxf(0.0, gesture - delta)
	flinch = move_toward(flinch, 0.0, delta * 2.5)
	clock += delta * (speed * 3.4 + 0.4)
	blend = move_toward(blend, clampf(speed / 2.5, 0, 1), delta * 6)
	recoil = move_toward(recoil, 0, delta * 7)
	for part in joints:
		var joint: Node3D = joints[part]
		var alternate: bool = part in ["LegR", "ArmL", "LegFR", "LegBL"]
		var swing := sin(clock + (PI if alternate else 0.0)) * blend * 0.5
		if part.begins_with("Arm") and aiming:
			swing = -0.65 - recoil * 0.2
		if part.begins_with("Arm"):
			swing -= flinch * (0.95 if (part == "ArmL" and hit_region == "left_arm") or (part == "ArmR" and hit_region == "right_arm") else 0.65)
		if part == "ArmR" and gesture > 0.0:
			swing = -1.2 + sin(gesture * 9.0) * 0.18
		if part == "ArmL" and gesture > 0.0 and gesture_kind == "treat":
			swing = -0.85 + sin(gesture * 7.0) * 0.08
		swing += float(reactions.get(part, 0)) * (0.65 if part.begins_with("Leg") else -0.8)
		joint.rotation.z = float(reactions.get(part, 0)) * (0.25 if alternate else -0.25)
		if knees.has(part):
			knees[part].rotation.x = maxf(0, -sin(clock + (PI if alternate else 0.0))) * blend * 0.7 + float(reactions.get(part, 0)) * 0.6
		joint.rotation.x = lerp_angle(joint.rotation.x, swing, 1.0 - exp(-delta * 12.0))
	model.position.y = lerpf(model.position.y, rest_height + (1.0 - cos(clock * 2.0)) * blend * 0.009 + sin(clock * 2.0) * (1.0 - blend) * 0.004, 1.0 - exp(-delta * 10.0))
	model.rotation.z = lerp_angle(model.rotation.z, flinch * 0.28, 1.0 - exp(-delta * 18.0))
	var coat := model.get_node_or_null("Coat") as Node3D
	if coat != null:
		coat.rotation.x = sin(clock * 0.6) * 0.012 + float(reactions.get("Coat", 0)) * 0.3
	var head := model.get_node_or_null("Head") as Node3D
	if head != null:
		for eye_name in ["EyeL", "EyeR"]:
			var eye := head.get_node_or_null(NodePath(eye_name)) as Node3D
			if eye != null:
				eye.scale.y = 0.08 if fmod(blink_clock, 4.3) > 4.16 else 1.0
		head.rotation.z = float(reactions.get("Head", 0)) * 0.22
		var idle := (1.0 - blend) * (0.0 if aiming else 1.0)
		head.rotation.y = lerp_angle(head.rotation.y, sin(clock * 0.7) * idle * (0.32 if is_quadruped else 0.12), 1.0 - exp(-delta * 5.0))
		head.rotation.x = lerp_angle(head.rotation.x, (sin(clock * 1.1) * idle * 0.05 if is_quadruped else 0.0) - flinch * 0.3 + (sin(gesture * 6.0) * 0.07 if gesture > 0.0 else 0.0), 1.0 - exp(-delta * 10.0))
	var tail := model.get_node_or_null("Tail") as Node3D
	if tail != null:
		tail.rotation.y = sin(clock * 1.5) * 0.3
