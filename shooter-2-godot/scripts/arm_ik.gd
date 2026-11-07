extends RefCounted
class_name SH2ArmIK
## СЕКТОР «ПЕПЕЛ» — two-bone IK рук и прикладка оружия (порт).
##
## Оружие закреплено на груди, а кисти процедурно дотягиваются до рукояти и
## цевья. Поэтому ствол смотрит вперёд, даже когда бегут ноги или корпус
## наклоняется.

var rig: Node3D
var bones: Dictionary
var weapon_slot: Node3D
var enabled: bool = true
var solves: int = 0
var upper_len := 0.30
var lower_len := 0.275

var grip_r: Marker3D
var grip_l: Marker3D


func _init(rig_node: Node3D) -> void:
	rig = rig_node
	bones = rig_node.get_meta("bones", {})
	weapon_slot = bones.get("weapon", null)


## Точки хвата на оружии: рукоять (правая) и цевьё (левая)
func attach_weapon(weapon: Node3D) -> void:
	if weapon_slot == null:
		return
	# оружие не удаляем: просто перевешиваем в слот (дети слота — это и есть оружие)
	if weapon.get_parent() != null and weapon.get_parent() != weapon_slot:
		weapon.get_parent().remove_child(weapon)
	if weapon.get_parent() == null:
		weapon_slot.add_child(weapon)
	grip_r = weapon.get_node_or_null("grip")
	grip_l = weapon.get_node_or_null("foregrip")


## Поза приклада: наклон оружия и позиция относительно груди
func pose_weapon(raise: float, tilt: float, roll: float = 0.0) -> void:
	if weapon_slot == null:
		return
	weapon_slot.position = Vector3(0.16 - raise * 0.05, -0.04 + raise * 0.09, 0.26 + raise * 0.03)
	weapon_slot.rotation = Vector3(-0.05 + tilt, 0.06 - raise * 0.06, roll)


## Ориентирует кость так, чтобы её -Y смотрела из from в to
func _aim_bone(bone: Node3D, from: Vector3, to: Vector3, twist_ref: Vector3) -> void:
	var dir: Vector3 = (to - from).normalized()
	if dir.length_squared() < 1e-8:
		return
	var y_axis: Vector3 = -dir          # кость «растёт» по -Y
	var ref: Vector3 = twist_ref - y_axis * twist_ref.dot(y_axis)
	if ref.length_squared() < 1e-6:
		ref = Vector3(0, 0, 1)
	ref = ref.normalized()
	var z_axis: Vector3 = ref.cross(y_axis).normalized()
	var x_axis: Vector3 = y_axis.cross(z_axis).normalized()
	var basis := Basis(x_axis, y_axis, z_axis)
	var parent_basis := bone.get_parent().global_basis
	bone.basis = parent_basis.inverse() * basis
	bone.scale = Vector3.ONE


## Аналитический two-bone IK: плечо -> локоть -> кисть
func solve_arm(side: String, pole_dir: Vector3) -> void:
	var upper: Node3D = bones.get("upperArm" + side, null)
	var lower: Node3D = bones.get("lowerArm" + side, null)
	var hand: Node3D = bones.get("hand" + side, null)
	var target: Node3D = grip_r if side == "R" else grip_l
	if target == null or upper == null or lower == null:
		return
	var target_pos: Vector3 = target.global_position
	var shoulder: Vector3 = upper.global_position
	var d: Vector3 = target_pos - shoulder
	var dist: float = d.length()
	if dist < 1e-5:
		return
	var dir: Vector3 = d / dist
	var reach: float = minf((upper_len + lower_len) * 0.995,
		maxf(absf(upper_len - lower_len) + 0.02, dist))
	var cos_a: float = (upper_len * upper_len + reach * reach - lower_len * lower_len) \
		/ (2.0 * upper_len * reach)
	var a: float = acos(clampf(cos_a, -1.0, 1.0))
	var perp: Vector3 = pole_dir - dir * pole_dir.dot(dir)
	if perp.length_squared() < 1e-6:
		perp = Vector3(0, -1, 0)
	perp = perp.normalized()
	var elbow: Vector3 = shoulder + dir * (cos(a) * upper_len) + perp * (sin(a) * upper_len)
	var wrist: Vector3 = shoulder + dir * reach
	_aim_bone(upper, shoulder, elbow, perp)
	_aim_bone(lower, elbow, wrist, perp)
	if hand != null:
		hand.rotation = Vector3.ZERO
	solves += 1


## Полный проход: прикладка + IK обеих рук
func update_pose(raise: float, tilt: float) -> void:
	if not enabled:
		return
	pose_weapon(raise, tilt)
	solve_arm("R", Vector3(0.95, -0.65, -0.55).normalized())
	solve_arm("L", Vector3(-0.85, -0.55, -0.75).normalized())
