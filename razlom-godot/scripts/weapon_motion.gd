class_name RazlomWeaponMotion
extends RefCounted
## Visual-only moving parts of the fictional carbine. No gameplay/ammo side effects.
var magazine: Node3D
var support_hand: Node3D
var bolt: Node3D
var flash: Node3D
var shell: Node3D
var shot_age := 10.0
var magazine_rest: Transform3D
var hand_rest: Transform3D
var bolt_rest: Transform3D
var phase := "ready"

func _init(model: Node3D) -> void:
	magazine = model.get_node("Magazine")
	support_hand = model.get_node("LeftHand")
	bolt = model.get_node("Bolt")
	flash = model.get_node("MuzzleFlash")
	flash.hide()
	shell = model.get_node("SpentCase")
	shell.hide()
	magazine_rest = magazine.transform
	hand_rest = support_hand.transform
	bolt_rest = bolt.transform

func trigger_shot() -> void:
	shot_age = 0.0
	flash.show()
	shell.show()

func advance(reload_remaining: float, recoil: float, delta: float = 0.016667) -> void:
	shot_age += delta
	shell.visible = shot_age < 0.28
	if shell.visible:
		shell.position = Vector3(0.08 + shot_age * 0.6, 0.01 + shot_age * 0.45 - shot_age * shot_age * 3.5, -0.02 + shot_age * 0.15)
		shell.rotation = Vector3(shot_age * 12.0, shot_age * 18.0, 0)
	magazine.transform = magazine_rest
	support_hand.transform = hand_rest
	bolt.transform = bolt_rest
	phase = "ready"
	flash.visible = reload_remaining <= 0.0 and (recoil > 0.07 or shot_age < 0.055)
	if reload_remaining > 0.0:
		var t := clampf(1.0 - reload_remaining / 1.4, 0.0, 1.0)
		var reach := smoothstep(0.0, 0.16, t) * (1.0 - smoothstep(0.76, 1.0, t))
		var extraction := smoothstep(0.16, 0.38, t) * (1.0 - smoothstep(0.52, 0.74, t))
		magazine.position += Vector3(-0.035 * extraction, -0.22 * extraction, 0.035 * extraction)
		magazine.rotation.z += extraction * 0.2
		var grip_point := magazine.position + Vector3(-0.045, -0.1, 0.0)
		support_hand.position = hand_rest.origin.lerp(grip_point, reach)
		support_hand.rotation.z = -reach * 0.25
		phase = "reach" if t < 0.16 else ("remove" if t < 0.38 else ("replace" if t < 0.74 else "return"))
		var rack := smoothstep(0.78, 0.86, t) * (1.0 - smoothstep(0.88, 0.96, t))
		bolt.position.z += rack * 0.065
	else:
		bolt.position.z += clampf(recoil / 0.09, 0.0, 1.0) * 0.065
