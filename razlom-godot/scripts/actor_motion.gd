class_name RazlomActorMotion
extends RefCounted
## Lightweight modular joint animation; no per-frame asset construction.
var model: Node3D
var clock := 0.0
var blend := 0.0
var recoil := 0.0
var joints: Dictionary = {}

func _init(root: Node3D, quadruped: bool = false) -> void:
	model = root
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

func fire() -> void:
	recoil = 1.0

func advance(delta: float, speed: float, aiming: bool = false) -> void:
	clock += delta * (7.0 + speed * 1.4)
	blend = move_toward(blend, clampf(speed / 2.5, 0, 1), delta * 6)
	recoil = move_toward(recoil, 0, delta * 7)
	for part in joints:
		var joint: Node3D = joints[part]
		var alternate: bool = part in ["LegR", "ArmL", "LegFR", "LegBL"]
		var swing := sin(clock + (PI if alternate else 0.0)) * blend * 0.5
		if part.begins_with("Arm") and aiming:
			swing = -0.65 - recoil * 0.2
		joint.rotation.x = swing
	model.position.y = absf(sin(clock)) * blend * 0.025
	var tail := model.get_node_or_null("Tail") as Node3D
	if tail != null:
		tail.rotation.y = sin(clock * 1.5) * 0.3
