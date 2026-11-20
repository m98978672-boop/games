class_name RazlomCorpse
extends Node3D
## Persistent posed body, not a physics ragdoll. Bounded per loaded world.
var visual: Node3D
var zone := "torso"
var player_body := false
var settled := false
var yaw := 0.0
func _ready() -> void:
	add_to_group("corpses")
	set_meta("defeat_visual", true)
	var bodies := get_tree().get_nodes_in_group("corpses").filter(func(n): return not n.is_queued_for_deletion())
	if bodies.size() > 8: bodies[0].queue_free()
func configure(model: Node3D, angle: float, region_name: String, instant: bool = false) -> void:
	visual = model
	yaw = angle
	zone = region_name
	rotation.y = angle
	if visual.get_parent() != self: visual.reparent(self, false)
	visual.position = Vector3.ZERO
	visual.rotation = Vector3.ZERO
	for child in visual.get_children():
		if child.has_meta("arm_rig_part"): child.hide()
	for part in ["ArmLJoint/ArmL/Visual", "ArmRJoint/ArmR/Visual"]:
		var sleeve := visual.get_node_or_null(part) as Node3D
		if sleeve != null: sleeve.show()
	for eye_name in ["EyeL", "EyeR"]:
		var eye := visual.get_node_or_null("Head/" + eye_name) as Node3D
		if eye != null: eye.scale.y = 0.1
	# Freeze modular joints in an asymmetrical resting pose; no live idle/blink.
	for part in ["ArmLJoint", "ArmRJoint", "LegLJoint", "LegRJoint"]:
		var limb := visual.get_node_or_null(part) as Node3D
		if limb != null:
			limb.rotation.x = 0.2 if part.begins_with("Leg") else -0.2
			limb.rotation.z = 0.08 if part.contains("L") else -0.12
	if instant:
		visual.rotation.z = -1.52
		settled = true
	else:
		var fall := create_tween()
		fall.tween_property(visual, "rotation:z", -1.52, 0.22 if zone == "head" else 0.4).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)
		fall.tween_callback(func(): settled = true)
func snapshot() -> Dictionary:
	return {"position": [position.x, position.y, position.z], "yaw": yaw, "zone": zone, "player": player_body}
static func valid(data: Variant) -> bool:
	if not data is Array or data.size() > 8: return false
	for body in data:
		if not body is Dictionary or not body.get("position") is Array or body.position.size() != 3: return false
		for value in body.position:
			if not (value is int or value is float) or not is_finite(float(value)) or absf(float(value)) > 128: return false
		if not (body.get("yaw") is int or body.get("yaw") is float) or not is_finite(float(body.yaw)) or absf(float(body.yaw)) > 1000: return false
		if not body.get("zone") in ["head", "torso", "vitals", "arms", "legs", "left_arm", "right_arm"] or not body.get("player") is bool: return false
	return true
